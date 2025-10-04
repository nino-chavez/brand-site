import React from 'react';

/**
 * Basic site navigation and content types
 * Extracted from monolithic types.ts for better organization
 *
 * SectionId uses photography metaphor for artistic consistency:
 * - hero: Portfolio entry point
 * - capture: Introduction/readiness (alternate hero view)
 * - focus: About section (attention to detail)
 * - frame: Work section (composition & planning)
 * - exposure: Insights section (technical execution)
 * - develop: Gallery section (process & refinement)
 * - portfolio: Contact section (results showcase)
 * - volleyball-demo: Special interactive feature
 * - reel: Video showcase
 */

export type SectionId =
    | 'hero'           // Home/Landing
    | 'capture'        // Introduction & readiness
    | 'focus'          // About (attention to detail)
    | 'frame'          // Work (composition & planning)
    | 'exposure'       // Insights (technical execution)
    | 'develop'        // Gallery (process & refinement)
    | 'portfolio'      // Contact (results & showcase)
    | 'volleyball-demo' // Special feature
    | 'reel';          // Video showcase

export interface Section {
    id: SectionId;
    title: string;
}

export interface WorkProject {
    // Core fields
    title: string;
    description: string;
    tags: string[];
    imageUrl: string;
    link: string;
    outcome?: string; // Optional measurable outcomes summary

    // Extended fields for FrameSection compatibility
    id?: string;
    subtitle?: string;
    technologies?: string[];
    architecture?: string[];
    challenges?: string[];
    outcomes?: string[];
    metrics?: {
        performance: string;
        scale: string;
        timeline: string;
    };
    repository?: string;
    demo?: string;
    image?: string; // Alias for imageUrl
}

export interface InsightArticle {
    // Core fields
    title: string;
    platform: 'Blog' | 'LinkedIn';
    excerpt: string;
    imageUrl: string;
    link: string;

    // Extended fields for ExposureSection compatibility
    id?: string;
    subtitle?: string;
    readTime?: string;
    date?: string;
    category?: string;
    tags?: string[];
    insights?: string[];
}

export interface SocialLink {
    name: string;
    url: string;
    icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
}