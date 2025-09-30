import React from 'react';

/**
 * Basic site navigation and content types
 * Extracted from monolithic types.ts for better organization
 */

export type SectionId = 'hero' | 'about' | 'work' | 'insights' | 'gallery' | 'reel' | 'volleyball-demo' | 'contact';

export interface Section {
    id: SectionId;
    title: string;
}

export interface WorkProject {
    title: string;
    description: string;
    tags: string[];
    imageUrl: string;
    link: string;
}

export interface InsightArticle {
    title: string;
    platform: 'Blog' | 'LinkedIn';
    excerpt: string;
    imageUrl: string;
    link: string;
}

export interface SocialLink {
    name: string;
    url: string;
    icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
}