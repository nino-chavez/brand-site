/**
 * Vite SSR Server Entry Point
 *
 * Renders React app to HTML string on the server for:
 * - SEO crawlability
 * - Social media preview cards (Open Graph, Twitter)
 * - Faster initial page load
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SimpleRouter from './SimpleRouter';

export interface RenderResult {
  html: string;
}

/**
 * Server-side render function called by Express middleware
 * @param url - Request URL for routing
 * @returns Object containing rendered HTML string
 */
export function render(url: string): RenderResult {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <SimpleRouter />
    </React.StrictMode>
  );

  return { html };
}
