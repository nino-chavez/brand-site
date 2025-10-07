/**
 * Vercel Serverless Function for Vite SSR
 *
 * This wraps the Express SSR server for Vercel's serverless platform.
 * Vercel will call this function for each request, enabling SSR without
 * maintaining a long-running Node server.
 */

import fs from 'node:fs';
import path from 'node:path';

// Cache the HTML template and SSR manifest
let template;
let render;
let manifest;

async function initializeSSR() {
  if (!template) {
    // Read the built HTML template
    // In Vercel, files are in /var/task/ root
    template = fs.readFileSync(
      path.join(process.cwd(), 'dist/client/index.html'),
      'utf-8'
    );
  }

  if (!manifest) {
    // Read the SSR manifest
    manifest = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'dist/client/.vite/ssr-manifest.json'),
        'utf-8'
      )
    );
  }

  if (!render) {
    // Import the server-side render function
    // Use absolute path from project root
    const entryPath = path.join(process.cwd(), 'dist/server/entry-server.js');
    const entry = await import(entryPath);
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
    console.error('Error stack:', error.stack);
    console.error('Working directory:', process.cwd());
    console.error('Files in cwd:', fs.readdirSync(process.cwd()));

    // Send detailed error in development
    const errorHtml = `
      <!DOCTYPE html>
      <html><body>
        <h1>SSR Error</h1>
        <pre>${error.message}</pre>
        <pre>${error.stack}</pre>
        <h2>Debug Info:</h2>
        <p>CWD: ${process.cwd()}</p>
        <p>Files: ${fs.readdirSync(process.cwd()).join(', ')}</p>
      </body></html>
    `;
    res.status(500).send(errorHtml);
  }
}
