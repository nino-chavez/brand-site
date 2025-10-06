# Vercel Deployment Guide - SSR Enabled

## Overview

This portfolio now supports **Server-Side Rendering (SSR)** on Vercel, which eliminates the React hydration delay and improves Lighthouse performance scores.

## Why Vercel?

**Previous setup (Netlify):**
- Static SPA deployment
- Empty HTML shell → JS downloads → React hydrates → Content appears
- **1.5s render delay** on mobile
- Lighthouse mobile: **79/100**

**New setup (Vercel with SSR):**
- HTML pre-rendered on server
- Content visible immediately
- React hydrates in background
- **Expected Lighthouse mobile: 90-95/100**

## Architecture

```
Request Flow:
1. User requests page
2. Vercel serverless function (/api/ssr.js) runs
3. React renders to HTML on server
4. Pre-rendered HTML sent to browser (with content!)
5. Browser displays content immediately (no hydration delay)
6. React hydrates in background for interactivity
```

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import Git repository
3. Vercel auto-detects `vercel.json` configuration

### 2. Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
GEMINI_API_KEY=your_api_key_here
NODE_ENV=production
```

### 3. Deploy

Vercel automatically:
- Runs `npm run build:ssr` (builds client + server bundles)
- Deploys static assets to CDN
- Deploys serverless function for SSR

### 4. Verify SSR is Working

Check the HTML source of deployed site:
```bash
curl https://your-vercel-domain.vercel.app/ | grep "Nino Chavez"
```

**SSR working:** You should see actual content in HTML
**SSR not working:** You'll see empty `<div id="root"></div>`

## Build Configuration

### vercel.json
```json
{
  "buildCommand": "npm run build:ssr",
  "outputDirectory": "dist/client",
  "routes": [
    { "src": "/assets/(.*)", "dest": "/assets/$1" },
    { "src": "/images/(.*)", "dest": "/images/$1" },
    { "src": "/(.*)", "dest": "/api/ssr" }
  ]
}
```

- **buildCommand**: Builds both client and server bundles
- **outputDirectory**: Static assets served from `dist/client`
- **routes**: Static files served directly, HTML requests go to SSR function

### Serverless Function

`/api/ssr.js` handles SSR:
1. Loads pre-built server bundle
2. Renders React app to HTML
3. Injects HTML into template
4. Returns complete HTML to browser

## Performance Expectations

### Mobile (Lighthouse)
- **Performance:** 90-95/100 (up from 79)
- **LCP:** ~2.0s (down from 4.2s)
- **FCP:** ~1.5s (down from 3.4s)

### Desktop (Lighthouse)
- **Performance:** 97-99/100
- **LCP:** ~1.0s
- **FCP:** ~0.8s

## Monitoring

After deployment, verify performance:

```bash
# Run Lighthouse on Vercel URL
npx lighthouse https://your-vercel-domain.vercel.app/ --view
```

## Local SSR Testing

Test SSR locally before deploying:

```bash
# Build SSR bundles
npm run build:ssr

# Run production SSR server
npm run preview:ssr

# Open http://localhost:3002
# View source - should see pre-rendered HTML
```

## Rollback Plan

If SSR causes issues, revert to static deployment:

1. Update `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build:client",
     "outputDirectory": "dist/client"
   }
   ```

2. Redeploy (Vercel serves static SPA)

## Differences from Netlify

| Feature | Netlify (Static) | Vercel (SSR) |
|---------|-----------------|--------------|
| HTML | Empty shell | Pre-rendered content |
| Initial Render | 1.5s delay | Immediate |
| SEO | Client-side only | Server-rendered |
| Social Cards | Limited | Full OG tags |
| Performance | 79/100 mobile | 90-95/100 mobile |
| Hosting Cost | Free tier | Free tier |

## Troubleshooting

### "Internal Server Error" on Deploy

Check Vercel function logs:
- Dashboard → Deployments → [Latest] → Functions → Logs
- Look for errors in `/api/ssr.js`

### SSR Not Working (Empty HTML)

1. Verify build succeeded: `dist/server/entry-server.js` exists
2. Check function is deployed: Vercel → Functions → `/api/ssr`
3. Test locally with `npm run preview:ssr`

### Performance Not Improved

1. Verify SSR is active (check HTML source has content)
2. Check Core Web Vitals in Vercel Analytics
3. Run Lighthouse multiple times (scores vary)

## Next Steps

After successful Vercel deployment:

1. Update DNS to point to Vercel (if using custom domain)
2. Run Lighthouse tests to verify 90+ performance
3. Monitor Core Web Vitals in Vercel Analytics
4. Consider adding ISR (Incremental Static Regeneration) for further optimization

## Support

- Vercel Docs: https://vercel.com/docs
- Vite SSR Guide: https://vitejs.dev/guide/ssr.html
