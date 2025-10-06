# SSR Preservation Intelligence

## Critical Rule: NEVER Remove SSR Configuration

**Status:** MANDATORY - Violating this breaks production SEO

---

## Background

This portfolio has **Server-Side Rendering (SSR) capabilities** via Express (server.js) for SEO optimization, social media previews, and AI agent comprehension.

**Date Added:** October 2025 (checkpoint commit 86f6f9be)
**Purpose:** Generate SEO meta tags, Open Graph cards, JSON-LD schema
**Files Involved:**
- `server.js` - Express SSR server
- `src/entry-server.tsx` - SSR entry point
- `src/utils/seo.ts` - SEO utilities
- `vite.config.ts` - SSR manifest generation

---

## The Rule

### ❌ NEVER DO THIS:

```typescript
// vite.config.ts
build: {
  ssrManifest: true, // ← NEVER remove this line
}
```

**Removing `ssrManifest: true` breaks:**
- SSR server functionality
- SEO meta tag injection
- Social media preview cards
- JSON-LD structured data

---

## Deployment Architecture

### Two Deployment Modes:

1. **Static (Netlify/Vercel/Cloudflare Pages)**
   - Uses `npm run build:client`
   - Outputs to `dist/client`
   - No SSR runtime, but manifest is still generated for future use
   - SEO handled client-side via meta tags

2. **SSR (Render/Railway/Fly.io)**
   - Uses `npm run build:ssr` (client + server)
   - Runs `node server.js` in production
   - Full SSR with dynamic SEO injection
   - Requires Node.js runtime environment

---

## Common Mistake: MIME Type Errors

### Symptom:
```
Failed to load module script: Expected JavaScript but got application/octet-stream
```

### ❌ WRONG Solution (What I Did):
"Remove `ssrManifest: true` because it's causing MIME type issues on Netlify"

### ✅ CORRECT Solution:
1. Keep `ssrManifest: true` - it's not the problem
2. Fix Netlify build command: `npm run build:client` instead of `npm run build`
3. Update `publish` directory: `dist/client` instead of `dist`

**Root Cause:** Netlify doesn't run server.js, so it was trying to serve SSR manifest files as static assets

---

## Decision Pattern

When encountering deployment/build errors:

```
IF error involves "SSR" or "manifest" or "MIME type":
  1. CHECK netlify.toml/vercel.json build command
  2. CHECK if platform supports SSR (most don't)
  3. FIX by using correct build command
  4. NEVER remove ssrManifest from vite.config.ts
```

---

## Agent Guardrails

Before modifying `vite.config.ts`, agents MUST:

1. **Read this file** to understand SSR architecture
2. **Check git history** for SSR-related commits
3. **Search for "ssrManifest"** to understand usage
4. **Ask user** before removing any build configuration

### Verification Checklist:
- [ ] Have I read `.claude/agents/intelligence/ssr-preservation.md`?
- [ ] Have I checked git history for SSR additions?
- [ ] Have I identified the ACTUAL root cause (not just the symptom)?
- [ ] Am I fixing the deployment config instead of removing features?

---

## Historical Context

**October 2025:** SSR added for SEO optimization
- Added server.js Express server
- Added src/entry-server.tsx render function
- Added SEO utilities (seo.ts, seo-meta.ts, seo-schema.ts)
- Enabled `ssrManifest: true` in vite.config.ts

**October 2025:** Incorrect fix attempted
- Removed `ssrManifest: true` due to Netlify MIME type error
- User correctly identified this as breaking SSR
- Restored `ssrManifest: true` and fixed Netlify config instead

---

## Testing SSR Locally

```bash
# Build SSR bundle
npm run build:ssr

# Run SSR server
node server.js

# Test at http://localhost:3002
# View page source - should see rendered HTML, not just <div id="root"></div>
```

---

## Related Files

- `.claude/agents/intelligence/ssr-preservation.md` - This file
- `server.js` - SSR Express server
- `src/entry-server.tsx` - SSR render function
- `vite.config.ts` - Build configuration
- `netlify.toml` - Static deployment config

---

**Last Updated:** 2025-10-06
**Author:** Claude (after breaking SSR and getting corrected)
**Severity:** CRITICAL - Production SEO depends on this
