/**
 * SEO Meta Tags Generator
 *
 * Generates OpenGraph, Twitter Card, and AI-specific meta tags for SSR.
 * Referenced in public/ai.txt lines 40-41
 */

export interface MetaTagConfig {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  type?: 'website' | 'profile' | 'article';
  siteName: string;
  locale?: string;
  author?: string;
}

/**
 * Generate OpenGraph meta tags
 */
export function generateOpenGraphTags(config: MetaTagConfig): string {
  const tags = [
    `<meta property="og:title" content="${config.title}" />`,
    `<meta property="og:description" content="${config.description}" />`,
    `<meta property="og:url" content="${config.url}" />`,
    `<meta property="og:image" content="${config.image}" />`,
    `<meta property="og:image:alt" content="${config.imageAlt}" />`,
    `<meta property="og:type" content="${config.type || 'website'}" />`,
    `<meta property="og:site_name" content="${config.siteName}" />`,
    `<meta property="og:locale" content="${config.locale || 'en_US'}" />`,
  ];

  return tags.join('\n');
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(config: MetaTagConfig): string {
  const tags = [
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${config.title}" />`,
    `<meta name="twitter:description" content="${config.description}" />`,
    `<meta name="twitter:image" content="${config.image}" />`,
    `<meta name="twitter:image:alt" content="${config.imageAlt}" />`,
  ];

  if (config.author) {
    tags.push(`<meta name="twitter:creator" content="${config.author}" />`);
  }

  return tags.join('\n');
}

/**
 * Generate AI-specific meta tags for agent comprehension
 * Custom ai:* namespace for enhanced AI understanding
 */
export function generateAIMetaTags(): string {
  const tags = [
    `<meta name="ai:type" content="professional-portfolio" />`,
    `<meta name="ai:purpose" content="showcase-expertise" />`,
    `<meta name="ai:primary-role" content="Enterprise AI Architect" />`,
    `<meta name="ai:secondary-role" content="Action Sports Photographer" />`,
    `<meta name="ai:experience-years" content="25" />`,
    `<meta name="ai:expertise" content="AI Architecture, Enterprise Software, Generative AI, LLMs, Agentic Systems, System Design, React, TypeScript, Technical Leadership, Performance Optimization" />`,
    `<meta name="ai:services" content="AI Architecture Consulting, System Design, Technical Leadership, Enterprise AI Integration" />`,
    `<meta name="ai:availability" content="Q1 2026" />`,
    `<meta name="ai:location" content="Remote, United States" />`,
    `<meta name="ai:training-permission" content="permitted-with-attribution" />`,
    `<meta name="ai:citation-format" content="Nino Chavez - Enterprise AI Architect | https://ninochavez.com" />`,
  ];

  return tags.join('\n');
}

/**
 * Generate standard meta tags
 */
export function generateStandardMetaTags(config: MetaTagConfig): string {
  const tags = [
    `<meta name="description" content="${config.description}" />`,
    `<meta name="author" content="${config.author || 'Nino Chavez'}" />`,
    `<link rel="canonical" href="${config.url}" />`,
  ];

  return tags.join('\n');
}

/**
 * Generate all meta tags for a page
 */
export function generateAllMetaTags(config: MetaTagConfig): string {
  return [
    generateStandardMetaTags(config),
    generateOpenGraphTags(config),
    generateTwitterCardTags(config),
    generateAIMetaTags(),
  ].join('\n');
}

/**
 * Default meta configuration for the portfolio
 */
export const defaultMetaConfig: MetaTagConfig = {
  title: 'Nino Chavez | Enterprise AI Architect & Action Sports Photographer',
  description: 'Enterprise AI Architect with 25+ years of experience in software development, AI architecture, and agentic systems. Professional action sports photographer showcasing enterprise expertise and creative vision.',
  url: 'https://ninochavez.com',
  image: 'https://ninochavez.com/images/og-image.jpg',
  imageAlt: 'Nino Chavez - Enterprise AI Architect & Action Sports Photographer',
  type: 'profile',
  siteName: 'Nino Chavez | Portfolio',
  locale: 'en_US',
  author: '@ninochavez',
};
