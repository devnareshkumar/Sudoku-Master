# Netlify Deployment Guide

## ⚠️ CRITICAL: Disable Angular Runtime Plugin

The build is failing because Netlify's `@netlify/angular-runtime` plugin is automatically trying to create SSR edge functions, but we're deploying as a static SPA.

### Fix: Disable the Plugin in Netlify Dashboard

1. **Go to your Netlify project dashboard**
2. **Navigate to Site Settings** → **Build & Deploy** → **Plugins**
3. **Find and REMOVE/DISABLE** the plugin named: `@netlify/angular-runtime`
4. **Save changes**
5. **Trigger a new deploy** (push to GitHub or click "Deploy site")

That's it! The build will now succeed.

## Why This Happens

- Netlify auto-detects Angular projects and tries to set up SSR
- We're deploying as a static SPA (client-side routing only)
- The plugin tries to create edge functions that reference server files that don't exist in the static build
- Removing the plugin tells Netlify to just serve the static files as-is

## What You Get After Disabling

✅ Fast static hosting
✅ Client-side routing works perfectly
✅ All pages served from single HTML entry point
✅ Full Angular functionality in the browser

## Configuration

The `netlify.toml` file now includes:
- Build command: `npm run build`
- Publish directory: `dist/app/browser` (client-side assets only)
- SPA redirect: All routes redirect to `index.html` for client-side routing
- Security headers: XSS protection, frame options, etc.
- Cache control: Long-term caching for JS/CSS assets

## If You Want Full SSR

If you need server-side rendering on Netlify, deploy to:
- **Vercel** (best Angular SSR support)
- **Traditional server** with `npm run serve:ssr`
- **Docker** on any cloud provider

## Troubleshooting

### Still seeing "Build failed"?
1. Make sure you **disabled** the Angular runtime plugin (not just removed it from config)
2. Check the Netlify dashboard Site Settings → Plugins to confirm it's gone
3. Trigger a fresh deploy from the Netlify dashboard

### Routes not working?
- The `netlify.toml` SPA redirect should handle this
- If not, clear your browser cache and try again

### Slow builds?
- The build takes ~13-15 seconds locally
- Netlify might take longer depending on available resources
- This is normal

## Deployment Checklist

- [ ] Remove/Disable `@netlify/angular-runtime` plugin from Netlify dashboard
- [ ] Push `netlify.toml` to GitHub
- [ ] Netlify auto-deploys (check your connected repo)
- [ ] Build should complete successfully
- [ ] Test at yourdomain.netlify.app
- [ ] Verify routing works by navigating to different routes

## Need Full Node.js SSR?

Your app includes Express.js SSR support in the build, but Netlify's static hosting doesn't support it. Instead, deploy to:

**Vercel** (recommended for Angular SSR):
```bash
npm install -g vercel
vercel
```

**Traditional Server**:
```bash
npm run build
npm run serve:ssr
```

**Docker**:
```bash
docker build -t sudoku-master .
docker run -p 4000:4000 sudoku-master
```

See `DEPLOYMENT.md` and `MULTI_ENV_SETUP.md` for details.

## Support

For more help:
- [Netlify Build Status](https://app.netlify.com) - Check your deployments
- [Netlify Angular Docs](https://docs.netlify.com/frameworks/angular/)
- [Build Configuration](https://docs.netlify.com/configure-builds/get-started/)
