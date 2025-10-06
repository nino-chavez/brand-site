/**
 * Vite SSR Server Entry Point
 *
 * Renders React app to HTML string on the server for:
 * - SEO crawlability
 * - Social media preview cards (Open Graph, Twitter)
 * - AI agent comprehension (JSON-LD, ai:* meta tags)
 * - Faster initial page load
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SimpleRouter from './SimpleRouter';
import { generateSEOHead, generateSectionSEO } from './utils/seo';

export interface RenderResult {
  html: string;
  head: string;
}

/**
 * Server-side render function called by Express middleware
 * @param url - Request URL for routing
 * @returns Object containing rendered HTML string and head tags
 */
export function render(url: string): RenderResult {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <SimpleRouter />
    </React.StrictMode>
  );

  // Extract section from URL hash (e.g., /#about -> about)
  const sectionMatch = url.match(/#(\w+)/);
  const sectionId = sectionMatch ? sectionMatch[1] : null;

  // Generate appropriate SEO head content
  const head = sectionId ? generateSectionSEO(sectionId) : generateSEOHead();

  return { html, head };
}
