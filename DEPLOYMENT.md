# Deployment Guide - Sudoku Master Edition

## Overview
This project uses separate configurations for development and production:
- **Development**: Client-side rendering (no SSR) for faster development experience
- **Production**: Server-side rendering (SSR) with Express.js for better performance and SEO

## Development Setup

### Running Development Server
```bash
npm run dev
```

This starts the Angular dev server on `http://localhost:3000` with:
- No SSR (faster builds and reload)
- Live reload enabled
- Source maps for debugging
- Allowed hosts: localhost, 127.0.0.1, 192.168.0.4

## Production Setup

### Building for Production
```bash
npm run build
```

This creates an optimized production build with:
- SSR enabled
- Output hashing for cache busting
- Minified and optimized files
- Located in `dist/app/` directory

### Running Production Server
After building, start the SSR server:
```bash
npm run serve:ssr
```

The server listens on port 4000 by default. You can override it:
```bash
PORT=8080 npm run serve:ssr
```

## Configuration for Different Environments

### 1. Update Production Domain

Edit `src/server.ts` and update the `allowedHosts` for production:

```typescript
const allowedHosts = isProduction 
  ? ['yourdomain.com', 'www.yourdomain.com'] // Your actual domain
  : ['localhost', '127.0.0.1', '192.168.0.4'];
```

### 2. Environment Variables

Create a `.env.production` file in the project root:

```env
NODE_ENV=production
PORT=4000
GEMINI_API_KEY=your_actual_api_key_here
```

To use environment variables in your build, update `src/server.ts`:

```typescript
const port = process.env['PORT'] || 4000;
const geminiKey = process.env['GEMINI_API_KEY'];
```

### 3. Using Environment Files in Angular

Create environment files:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

Example `environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://yourdomain.com',
  geminiKey: '' // Will be injected at runtime
};
```

## Deployment Options

### Option 1: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "run", "serve:ssr"]
```

Build and run:
```bash
docker build -t sudoku-master .
docker run -p 4000:4000 -e PORT=4000 sudoku-master
```

### Option 2: Traditional Server Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Copy files to your server (dist/ and package.json)

3. Install production dependencies on server:
   ```bash
   npm install --production
   ```

4. Start the server:
   ```bash
   NODE_ENV=production npm run serve:ssr
   ```

### Option 3: Vercel/Netlify Deployment

These platforms support Angular SSR. Configure with:
- Build command: `npm run build`
- Output directory: `dist/app/browser`
- Environment variables: Set `NODE_ENV`, `GEMINI_API_KEY`, etc.

## Build Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (no SSR) |
| `npm run build` | Build for production (with SSR) |
| `npm run build:dev` | Build without SSR for testing |
| `npm run serve:ssr` | Run production SSR server |
| `npm run watch` | Watch mode for development builds |
| `npm run test` | Run unit tests |
| `npm run lint` | Run ESLint |

## Troubleshooting

### "localhost is not allowed" Error in Production
This occurs when the Host header doesn't match allowed hosts. Ensure:
1. Your domain is added to `allowedHosts` in `src/server.ts`
2. You're using the correct domain in requests
3. Reverse proxy (if used) is configured correctly

### Port Already in Use
If port 3000 (dev) or 4000 (prod) is in use:
```bash
# Development
npm run dev -- --port 3001

# Production
PORT=8080 npm run serve:ssr
```

### SSR Build Issues
To debug, use:
```bash
npm run build -- --verbose
```

## Security Recommendations

1. **Update AllowedHosts**: Always specify your actual domain in production
2. **API Keys**: Never commit `.env` files with real keys
3. **Dependencies**: Run `npm audit` regularly
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure proper CORS policies in Express middleware if needed

## Quick Start Production Checklist

- [ ] Update domain in `src/server.ts`
- [ ] Create `.env.production` with real credentials
- [ ] Run `npm run build`
- [ ] Test locally: `npm run serve:ssr`
- [ ] Deploy to your hosting platform
- [ ] Test with your domain
- [ ] Monitor logs for errors
