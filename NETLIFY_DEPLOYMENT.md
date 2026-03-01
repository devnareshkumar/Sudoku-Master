# Netlify Deployment Guide

## ⚠️ Fix for Angular Runtime Plugin Error

Netlify automatically installs the `@netlify/angular-runtime` plugin which tries to create SSR edge functions. We've implemented a fix for this.

### Automatic Fix (Now Included)

A post-build script (`scripts/fix-netlify-build.js`) is now included that:
- ✅ Generates missing Angular SSR files that Netlify expects
- ✅ Prevents the "render-utils.server.mjs not found" error
- ✅ Allows static SPA deployment without SSR
- ✅ Runs automatically with `npm run build`

**The fix is already in place!** Just push your code and redeploy.

### Manual Fix (Optional but Recommended)

For a cleaner solution, disable the plugin in Netlify Dashboard:

1. **Go to your Netlify project dashboard**
2. **Navigate to Site Settings** → **Build & Deploy** → **Plugins**
3. **Find and REMOVE/DISABLE**: `@netlify/angular-runtime`
4. **Save changes**
5. **Trigger a new deploy** (push to GitHub or click "Trigger deploy")

## Why This Happens

- Netlify auto-detects Angular projects and tries to set up SSR
- We're deploying as a static SPA (client-side routing only)
- The plugin tries to create edge functions that reference server files that don't exist in the static build
- The automatic fix creates the missing files so the build succeeds anyway

## What the Automatic Fix Does

The `scripts/fix-netlify-build.js` script runs after every build and:
1. Checks if SSR files exist
2. Creates placeholder files for missing Angular rendering utilities
3. Allows the edge function bundler to succeed
4. Your app still deploys as a fast static SPA

**This is completely transparent** - you don't need to do anything extra!

## If Build Still Fails

If you still see the "Could not find file" error:

1. **Option 1** (Recommended): Disable the plugin in Netlify UI
   - Settings → Build & Deploy → Plugins → Remove `@netlify/angular-runtime`
   
2. **Option 2**: The automatic fix should have resolved it - try:
   - Hard refresh the build (Settings → Build & Deploy → Trigger deploy)
   - Wait 30 seconds for cache to clear
   - Trigger another deploy

3. **Option 3**: Clear Netlify cache
   - Settings → Build & deploy → Deployments
   - Click the ... menu → Clear build cache
   - Trigger a new deploy

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

- [ ] Commit and push `netlify.toml`, `netlify.yaml`, and `scripts/fix-netlify-build.js`
- [ ] Connect repo to Netlify
- [ ] (Optional) Disable `@netlify/angular-runtime` plugin in Netlify UI
- [ ] Trigger a new deploy
- [ ] Build should complete successfully ✅
- [ ] Test at yourdomain.netlify.app
- [ ] Verify routing works by navigating to different routes

## Files Included in This Setup

- `netlify.toml` - Main build configuration
- `netlify.yaml` - Additional Netlify settings
- `scripts/fix-netlify-build.js` - Post-build script that fixes Netlify Angular plugin issues
- `package.json` - Updated with post-build hook

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
