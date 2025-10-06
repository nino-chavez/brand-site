/**
 * JSON-LD Schema.org Structured Data
 *
 * Generates schema markup for SEO and AI agent comprehension.
 * Referenced in public/ai.txt line 39
 */

interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  image: string;
  sameAs: string[];
  knowsAbout: string[];
  alumniOf?: {
    '@type': 'Organization';
    name: string;
  };
  address?: {
    '@type': 'PostalAddress';
    addressCountry: string;
  };
}

interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  founder: {
    '@type': 'Person';
    name: string;
  };
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    url: string;
  };
}

interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  inLanguage: string;
  copyrightYear: number;
  copyrightHolder: {
    '@type': 'Person';
    name: string;
  };
}

/**
 * Generate Person schema for Nino Chavez
 */
export function generatePersonSchema(): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nino Chavez',
    jobTitle: 'Enterprise AI Architect & Action Sports Photographer',
    description: 'Enterprise AI Architect with 25+ years of experience in software development, AI architecture, and agentic systems. Professional action sports photographer.',
    url: 'https://ninochavez.com',
    image: 'https://ninochavez.com/images/nino-chavez-profile.jpg',
    sameAs: [
      'https://github.com/ninochavez',
      'https://linkedin.com/in/ninochavez',
    ],
    knowsAbout: [
      'AI Architecture',
      'Enterprise Software Development',
      'Generative AI',
      'Large Language Models',
      'Agentic Systems',
      'System Design',
      'React',
      'TypeScript',
      'Technical Leadership',
      'Performance Optimization',
      'Action Sports Photography',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nino Chavez - Enterprise AI Architecture',
    url: 'https://ninochavez.com',
    logo: 'https://ninochavez.com/images/logo.png',
    description: 'Professional AI architecture consulting and enterprise software development services',
    founder: {
      '@type': 'Person',
      name: 'Nino Chavez',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Professional Inquiries',
      url: 'https://ninochavez.com/#contact',
    },
  };
}

/**
 * Generate WebSite schema
 */
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nino Chavez | Portfolio',
    url: 'https://ninochavez.com',
    description: 'Enterprise AI Architect & Action Sports Photographer. Explore software engineering expertise, enterprise architecture solutions, and professional action sports photography.',
    author: {
      '@type': 'Person',
      name: 'Nino Chavez',
    },
    inLanguage: 'en-US',
    copyrightYear: 2025,
    copyrightHolder: {
      '@type': 'Person',
      name: 'Nino Chavez',
    },
  };
}

/**
 * Generate all schema markup as JSON-LD script tags
 */
export function generateSchemaMarkup(): string {
  const schemas = [
    generatePersonSchema(),
    generateOrganizationSchema(),
    generateWebSiteSchema(),
  ];

  return schemas
    .map((schema) =>
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    )
    .join('\n');
}
