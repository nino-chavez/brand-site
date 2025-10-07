# SSR Architecture Audit - January 2025

## Executive Summary

**Status**: SSR is partially working but not serving at root path
**Impact**: SEO meta tags render at `/api/ssr` but not at `/`
**Root Cause**: Vercel serves static files before checking rewrite rules

## Current State

### What Works ✅
- SSR function renders correctly: `/api/ssr` shows server-rendered meta tags
- Meta tag generation working (OG tags, JSON-LD, canonical URLs)
- Build pipeline executes: `build:ssr` creates both client & server bundles
- Entry-server.js renders React components server-side

### What's Broken ❌
- Root path `/` serves static `dist/client/index.html` (CSR)
- Rewrite rules in `vercel.json` not applying to root
- Static placeholder `<!--app-head-->` not being replaced at `/`

## Technical Analysis

### Deployment Flow

```
User Request: https://nino-chavez.vercel.app/
    ↓
Vercel Edge: Check static files first
    ↓
Found: dist/client/index.html (from build output)
    ↓
Serve: Static HTML with <!--app-head--> placeholder (empty)
    ❌ Never reaches /api/ssr rewrite rule
```

### Why Rewrite Fails

**vercel.json Line 12-16:**
```json
{
  "source": "/",
  "destination": "/api/ssr"
}
```

**Vercel Priority Order:**
1. Static files in `outputDirectory` (default: `.next`, for us: `dist/client`)
2. Rewrites
3. Functions

**Solution**: Remove static index.html from build output OR use `outputDirectory: false`

### Evidence

```bash
# Root path (broken - CSR)
curl https://nino-chavez.vercel.app/ | grep "app-head"
# Result: <!--app-head--> (empty placeholder)

# API endpoint (working - SSR)
curl https://nino-chavez.vercel.app/api/ssr | grep "og:title"
# Result: <meta property="og:title" content="Nino Chavez | Enterprise AI Architect..." />
```

## Architectural Issues

### 1. Dual Build Strategy Confusion

**Current**: Building both static SPA AND SSR server
```json
"build:ssr": "BUILD_SSR=true npm run build:client && npm run build:server"
```

**Result**:
- `dist/client/` contains static HTML (CSR)
- `dist/server/` contains SSR render function
- Vercel deploys `dist/client/` as static files
- Static files win over rewrites

**Decision Needed**:
- **Option A**: Full SSR - Remove static index.html, force all requests through `/api/ssr`
- **Option B**: Hybrid - Static for speed, SSR for bots/SEO (requires bot detection)
- **Option C**: Drop SSR - Simpler, use static meta tags + JSON-LD

### 2. Conflicting Deployment Models

**SSR Requires**:
- All routes go through serverless function
- No static HTML at root
- Dynamic meta tag injection

**Current Deployment**:
- Static assets in `dist/client/`
- Serverless function in `api/ssr.js`
- Vercel serves static first (breaks SSR)

### 3. Performance vs. SEO Tradeoff

| Approach | First Load | SEO | Complexity |
|----------|-----------|-----|------------|
| Current (Broken) | Fast (static) | ❌ Empty meta tags | High |
| Full SSR | Slower (serverless) | ✅ Rich meta tags | High |
| Static + JSON-LD | Fast (static) | ✅ Structured data | Low |
| Hybrid (Bot Detection) | Smart (fast for users, SSR for bots) | ✅ Best of both | Very High |

## Recommended Fixes

### Fix 1: Disable Static Output (Simplest - Full SSR)

**vercel.json:**
```json
{
  "buildCommand": "npm run build:ssr",
  "outputDirectory": null,  // 👈 Disable static file serving
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/ssr" }
  ]
}
```

**Pros**: Forces all requests through SSR
**Cons**: Slower TTFB (~200-400ms for serverless cold start)

### Fix 2: Remove index.html from Build

**vite.config.ts:**
```ts
build: {
  rollupOptions: {
    input: {
      // Don't generate index.html for client build
      main: './src/index.tsx'
    }
  }
}
```

**Pros**: Cleaner, no conflicting static file
**Cons**: Requires careful build configuration

### Fix 3: Hybrid - Bot Detection (Most Complex)

**api/ssr.js:**
```js
export default async function handler(req, res) {
  const isBot = /googlebot|bingbot|slurp|duckduckbot/i.test(req.headers['user-agent']);

  if (isBot) {
    // SSR for bots
    const { html, head } = await render(req.url);
    return res.send(template.replace('<!--app-head-->', head));
  } else {
    // Static for users (fast)
    return res.redirect('/index.html');
  }
}
```

**Pros**: Best performance + SEO
**Cons**: Complex, requires maintenance

### Fix 4: Drop SSR - Static + JSON-LD (Recommended)

**Rationale**:
- Site is a portfolio, not content-heavy blog
- Social previews use static meta tags (can hardcode)
- JSON-LD for structured data works without SSR
- Removes 200+ LOC of SSR complexity

**index.html:**
```html
<head>
  <!-- Static meta tags work for social previews -->
  <meta property="og:title" content="Nino Chavez | AI Architect" />
  <meta property="og:image" content="/images/og-image.jpg" />

  <!-- JSON-LD for Google -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Nino Chavez",
    "jobTitle": "Enterprise AI Architect"
  }
  </script>
</head>
```

**Remove**:
- `api/ssr.js`
- `server.js`
- `entry-server.tsx`
- SSR build scripts
- SSR-safe hooks (useErrorHandling, SimpleRouter)

**Gain**:
- ~200 LOC removed
- Faster deploys
- Simpler architecture
- Same SEO outcome

## Decision Matrix

| Criterion | Fix 1 (Full SSR) | Fix 2 (No index) | Fix 3 (Hybrid) | Fix 4 (Drop SSR) |
|-----------|------------------|------------------|----------------|------------------|
| Effort | Low | Medium | High | Low |
| Performance | Medium | Medium | High | High |
| SEO | High | High | High | High |
| Complexity | High | High | Very High | Low |
| Maintenance | High | High | Very High | Low |
| **Recommended** | ❌ | ❌ | ⚠️ (if needed) | ✅ **Best** |

## Recommendation

**Drop SSR (Fix 4)** unless you have a specific need for:
- Dynamic content per URL (not applicable for portfolio)
- Rapid meta tag changes without redeployment
- Blog/CMS with thousands of pages

**Portfolio sites work perfectly with**:
- Static meta tags in index.html
- JSON-LD for structured data
- Pre-rendered OG images

## Implementation Plan

If choosing Fix 4 (Drop SSR):

1. **Create static meta tags** in `index.html`
2. **Add JSON-LD schema** for Person + PortfolioProject
3. **Remove SSR code**:
   ```bash
   rm api/ssr.js server.js entry-server.tsx
   git rm -r dist/server
   ```
4. **Update vercel.json**:
   ```json
   {
     "buildCommand": "npm run build",  // Not build:ssr
     "framework": null
   }
   ```
5. **Simplify hooks** - Remove SSR checks from useErrorHandling, SimpleRouter
6. **Update package.json** - Remove `build:ssr`, `build:server`, `preview:ssr`

## Next Steps

Choose a fix and I'll implement it. My recommendation: **Fix 4 (Drop SSR)** for simplicity and performance.
