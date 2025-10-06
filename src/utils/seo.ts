/**
 * SEO Utilities - Master Export
 *
 * Central hub for all SEO functionality including:
 * - JSON-LD Schema.org markup
 * - OpenGraph meta tags
 * - Twitter Card meta tags
 * - AI-specific meta tags
 *
 * Fulfills promises made in public/ai.txt
 */

import { generateSchemaMarkup } from './seo-schema';
import { generateAllMetaTags, defaultMetaConfig, type MetaTagConfig } from './seo-meta';

export interface SEOConfig extends MetaTagConfig {
  includeSchema?: boolean;
}

/**
 * Generate complete SEO head content for SSR
 */
export function generateSEOHead(config?: Partial<SEOConfig>): string {
  const finalConfig = { ...defaultMetaConfig, ...config };
  const includeSchema = config?.includeSchema !== false;

  const parts: string[] = [];

  // Meta tags (OG, Twitter, AI, standard)
  parts.push(generateAllMetaTags(finalConfig));

  // JSON-LD Schema
  if (includeSchema) {
    parts.push(generateSchemaMarkup());
  }

  return parts.join('\n');
}

/**
 * Generate SEO head for specific sections
 */
export function generateSectionSEO(sectionId: string): string {
  const sectionConfigs: Record<string, Partial<SEOConfig>> = {
    about: {
      title: 'About Nino Chavez | Enterprise AI Architect',
      description: '25+ years of experience in enterprise software development, AI architecture, and agentic systems. Learn about my journey and expertise.',
      url: 'https://ninochavez.com/#about',
      includeSchema: false, // Only include schema on main page
    },
    work: {
      title: 'Portfolio & Projects | Nino Chavez',
      description: 'Explore enterprise AI architecture projects, agentic systems, and innovative software solutions.',
      url: 'https://ninochavez.com/#work',
      includeSchema: false,
    },
    insights: {
      title: 'Insights & Writing | Nino Chavez',
      description: 'Technical articles and insights on AI architecture, agentic systems, and enterprise software development.',
      url: 'https://ninochavez.com/#insights',
      includeSchema: false,
    },
    gallery: {
      title: 'Action Sports Photography | Nino Chavez',
      description: 'Professional action sports photography capturing the intensity and artistry of athletic performance.',
      url: 'https://ninochavez.com/#gallery',
      includeSchema: false,
    },
    contact: {
      title: 'Contact Nino Chavez | AI Architecture Consulting',
      description: 'Available Q1 2026 for AI architecture consulting, system design, and technical leadership engagements.',
      url: 'https://ninochavez.com/#contact',
      includeSchema: false,
    },
  };

  return generateSEOHead(sectionConfigs[sectionId] || {});
}

// Re-export utilities for convenience
export { generateSchemaMarkup } from './seo-schema';
export { generateAllMetaTags, defaultMetaConfig } from './seo-meta';
export type { MetaTagConfig } from './seo-meta';
