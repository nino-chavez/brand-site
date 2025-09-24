// FIX: Added import for React to resolve React and JSX namespace errors.
import React from 'react';

export type SectionId = 'hero' | 'about' | 'work' | 'insights' | 'gallery' | 'reel' | 'contact';

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