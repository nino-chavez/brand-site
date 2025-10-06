/**
 * Vercel Serverless Function for Vite SSR
 *
 * This wraps the Express SSR server for Vercel's serverless platform.
 * Vercel will call this function for each request, enabling SSR without
 * maintaining a long-running Node server.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cache the HTML template and SSR manifest
let template;
let render;
let manifest;

async function initializeSSR() {
  if (!template) {
    // Read the built HTML template
    template = fs.readFileSync(
      path.resolve(__dirname, '../dist/client/index.html'),
      'utf-8'
    );
  }

  if (!manifest) {
    // Read the SSR manifest
    manifest = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, '../dist/client/.vite/ssr-manifest.json'),
        'utf-8'
      )
    );
  }

  if (!render) {
    // Import the server-side render function
    const entry = await import('../dist/server/entry-server.js');
    render = entry.render;
  }

  return { template, render, manifest };
}

export default async function handler(req, res) {
  try {
    const url = req.url;

    // Initialize SSR components
    const { template, render, manifest } = await initializeSSR();

    // Render the app HTML
    const { html: appHtml, head } = await render(url, manifest);

    // Replace placeholders in template
    let html = template
      .replace('<!--app-head-->', head || '')
      .replace('<!--app-html-->', appHtml);

    // Set proper headers
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    res.status(200).send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
