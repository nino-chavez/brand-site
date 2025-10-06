/**
 * Vite SSR Production Server
 *
 * Express server that handles server-side rendering with Vite.
 * - Development: Uses Vite dev server with HMR
 * - Production: Serves pre-built SSR bundles
 */

import fs from 'node:fs/promises';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3002;
const base = process.env.BASE || '/';

// Create Express app
const app = express();

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : '';
const ssrManifest = isProduction
  ? await fs.readFile('./dist/client/.vite/ssr-manifest.json', 'utf-8')
  : undefined;

// Add Vite or production middleware
let vite;
if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
  // Note: Vite middleware added AFTER SSR route handler
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression());

  // Serve static assets with long cache headers for performance
  app.use(base, sirv('./dist/client', {
    extensions: [],
    maxAge: 31536000, // 1 year for immutable assets (hashed filenames)
    immutable: true,
    setHeaders: (res, pathname) => {
      // Different cache strategies based on file type
      if (pathname.includes('/assets/')) {
        // Hashed assets - cache forever
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (pathname.match(/\.(webp|jpg|jpeg|png|svg|ico)$/)) {
        // Images - 1 year cache
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      } else if (pathname.match(/\.(css|js)$/)) {
        // CSS/JS without hash - 1 week cache with revalidation
        res.setHeader('Cache-Control', 'public, max-age=604800, must-revalidate');
      } else {
        // HTML and other files - no cache
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
    }
  }));
}

// Test endpoint to verify routing
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint hit');
  res.json({ ssr: 'working', timestamp: new Date().toISOString() });
});

// Serve HTML with SSR - MUST be before Vite middleware
// Use function-based middleware instead of wildcard string (Express 5 compatibility)
app.use(async (req, res, next) => {
  // Skip non-HTML requests
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return next();
  }

  console.log('🔍 SSR handler invoked for:', req.originalUrl);
  try {
    const url = req.originalUrl.replace(base, '');

    let template;
    let render;
    if (!isProduction) {
      // Dev mode: read template from disk, load SSR module
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      // Production mode: use cached template and pre-built SSR module
      template = templateHtml;
      render = (await import('./dist/server/entry-server.js')).render;
    }

    // Render app HTML and SEO head tags
    console.log('🔄 Rendering React app for URL:', url);
    const rendered = await render(url, ssrManifest);
    console.log('✅ Render result:', {
      hasHtml: !!rendered?.html,
      htmlLength: rendered?.html?.length || 0,
      hasHead: !!rendered?.head,
      headLength: rendered?.head?.length || 0
    });

    const appHtml = rendered?.html || '';
    const appHead = rendered?.head || '';

    // Inject app HTML and SEO head tags into template
    const html = template
      .replace(`<!--app-html-->`, appHtml)
      .replace(`<!--app-head-->`, appHead);

    console.log('📦 Final HTML length:', html.length, 'SSR content:', appHtml.length > 0 ? 'YES' : 'NO', 'SEO meta:', appHead.length > 0 ? 'YES' : 'NO');
    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (e) {
    // Send error stack in dev, generic error in production
    vite?.ssrFixStacktrace(e);
    console.log('❌ SSR Error:', e.stack);
    res.status(500).end(isProduction ? 'Internal Server Error' : e.stack);
  }
});

// Add Vite middleware AFTER SSR handler (dev only)
if (vite) {
  app.use(vite.middlewares);
}

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`   Mode: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`   SSR: Enabled`);
});
