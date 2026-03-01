# Netlify Deployment Guide

## Configuration Fixed! ✅

A `netlify.toml` file has been created with the correct configuration for your Angular SSR application.

## Netlify Settings

### Option 1: Automatic (Recommended)
The `netlify.toml` file will automatically configure everything. Just push the code and Netlify will use it.

### Option 2: Manual UI Configuration
If you still see errors, configure these settings in your Netlify project dashboard:

1. **Go to Site Settings** → **Build & Deploy** → **Build Settings**

2. **Set these values:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/app/browser` (not just `dist`)
   - **Functions directory:** `src/functions` (optional, only if you use Netlify Functions)

3. **Environment Variables** (if needed):
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: Your actual API key

## How It Works

- **Build Step**: `npm run build` creates the production bundle with SSR
- **Publish Directory**: Netlify deploys the client-side assets from `dist/app/browser`
- **Routing**: The `_redirects` rule in `netlify.toml` enables client-side routing

## Important Notes

### SSR Limitation
Netlify's standard hosting does not support Node.js SSR servers. Your application will be deployed as a **static site** with client-side routing.

If you need full SSR on Netlify, you would need to:
1. Use Netlify Edge Functions (more complex setup)
2. Deploy to a different platform (Vercel, Heroku, traditional server)

### What You Get
- ✅ Full Angular application running in the browser
- ✅ Client-side routing working
- ✅ All pages served from the same HTML entry point
- ✅ No server-side rendering (but still very fast)

### To Enable Full SSR
Deploy to one of these platforms instead:
- **Vercel**: Best for Edge Runtime SSR
- **Traditional Server**: Using `npm run serve:ssr`
- **Docker**: Using the Dockerfile we created

## Troubleshooting

### Error: "Publish directory is configured incorrectly"
- Make sure you use `dist/app/browser` (not `dist`)
- The `netlify.toml` file handles this automatically

### Build Still Fails
1. Check that all dependencies are installed: `npm install`
2. Verify build works locally: `npm run build`
3. Check the build logs in Netlify dashboard for specific errors

### Routes Not Working
- The SPA redirect in `netlify.toml` should handle this
- All routes will serve the `index.html` and Angular Router will handle them

## Next Steps

1. ✅ `netlify.toml` is in place
2. Push your code to GitHub
3. Connect your repo to Netlify
4. Build will automatically use the `netlify.toml` configuration
5. Your site will be live!

## Deployment Checklist

- [ ] Push code to GitHub
- [ ] Connect repo to Netlify
- [ ] Verify build command is `npm run build`
- [ ] Verify publish directory is `dist/app/browser`
- [ ] Set any required environment variables
- [ ] Trigger a new deployment
- [ ] Test your site at yourdomain.netlify.app

## Support

For more Netlify Angular help:
- [Netlify Angular Docs](https://docs.netlify.com/frameworks/angular/)
- [Build Configuration](https://docs.netlify.com/configure-builds/get-started/)
