# Production Deployment - Quick Setup

## Two-Environment Architecture

### Development Environment
```bash
npm run dev
```
- **Server Type**: Dev Server (No SSR)
- **Port**: 3000
- **Host Validation**: Allows localhost, 127.0.0.1, 192.168.0.4
- **Use Case**: Fast development with hot reload

### Production Environment
```bash
npm run build
npm run serve:ssr
```
- **Server Type**: Express.js with SSR
- **Port**: 4000 (configurable)
- **Host Validation**: Requires production domain
- **Use Case**: Production deployment with server-side rendering

## Step-by-Step Deployment

### 1. Prepare Your Production Environment

Update `src/server.ts` with your actual domain:
```typescript
const allowedHosts = isProduction 
  ? ['yourdomain.com', 'www.yourdomain.com']  // ← Update this
  : ['localhost', '127.0.0.1', '192.168.0.4'];
```

### 2. Build for Production

```bash
npm run build
```

Output will be in `dist/app/` with:
- `browser/` - Client-side assets
- `server/` - Server bundle (server.mjs)

### 3. Deploy to Your Server

#### Option A: Manual Server Deployment
```bash
# Copy dist/ and package.json to your server
# Then on server:

npm install --production
NODE_ENV=production PORT=4000 npm run serve:ssr
```

#### Option B: Docker (Recommended)
```bash
# Build Docker image
docker build -t sudoku-master .

# Run container
docker run -p 4000:4000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY=your_key \
  sudoku-master
```

#### Option C: Vercel/Netlify
- Push to git
- Connect repo
- Set environment variables
- Netlify/Vercel auto-deploys

## Key Configuration Files

| File | Purpose |
|------|---------|
| `angular.json` | Build configurations (dev & prod) |
| `src/server.ts` | SSR server with host validation |
| `src/main.server.ts` | Server bootstrap |
| `package.json` | Build & run scripts |

## Testing Your Setup

### Local Production Test
```bash
npm run build
NODE_ENV=production npm run serve:ssr
# Visit http://localhost:4000
```

### Check Built Output
```bash
ls -la dist/app/
# Should see: browser/, server/, package.json
```

## Environment-Specific Behavior

### Development Mode
```
NODE_ENV != 'production'
├─ No SSR (faster builds)
├─ Source maps enabled
├─ Hot reload active
└─ Allows: localhost, 127.0.0.1, 192.168.0.4
```

### Production Mode
```
NODE_ENV = 'production'
├─ SSR enabled
├─ Minified output
├─ Cache busting
├─ Requires: your domain
└─ Better SEO & performance
```

## Common Issues & Solutions

**Issue**: "localhost is not allowed" in production
- **Fix**: Update `allowedHosts` in `src/server.ts` with your domain

**Issue**: Build fails with SSR errors
- **Fix**: Run `npm run build:dev` to skip SSR for testing

**Issue**: Port 4000 already in use
- **Fix**: `PORT=8080 npm run serve:ssr`

**Issue**: Missing environment variables
- **Fix**: Create `.env.production` with required vars

## Next Steps

1. ✅ Update your domain in `src/server.ts`
2. ✅ Run `npm run build` 
3. ✅ Test locally with `npm run serve:ssr`
4. ✅ Deploy to your hosting platform
5. ✅ Monitor application logs

See `DEPLOYMENT.md` for detailed documentation.
