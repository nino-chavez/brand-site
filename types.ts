// FIX: Added import for React to resolve React and JSX namespace errors.
import React from 'react';

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

// Hero Viewfinder Types
export interface HeroViewfinderProps {
    mode?: 'standard' | 'hero';
    isActive?: boolean;
    className?: string;
    onCapture?: () => void;
    showMetadataHUD?: boolean;
    blurIntegration?: {
        enabled: boolean;
        containerRef?: React.RefObject<HTMLElement>;
    };
}

export interface ViewfinderState {
    focusProgress: number; // 0-1 blur animation tracking
    hudVisible: boolean;
    captureSequenceActive: boolean;
    skillAnimationPhase: 'idle' | 'focus' | 'displaying' | 'capturing';
}

export interface TechnicalSkill {
    id: string;
    category: 'frontend' | 'backend' | 'architecture' | 'photography' | 'performance';
    label: string;
    value: string;
    animationDelay: number;
    hoverInfo?: string;
}

export interface SkillCategory {
    label: string;
    color: string;
    description: string;
}

export interface HoverState {
    activeSkill: string | null;
    position: { x: number; y: number };
    isVisible: boolean;
}

// Frame Overlay Types
export interface FrameOverlayProps {
    isVisible: boolean;
    showGrid?: boolean;
    showFocusArea?: boolean;
    focusPosition?: { x: number; y: number };
    animationPhase?: 'idle' | 'entering' | 'active' | 'focusing' | 'captured';
    responsive?: 'mobile' | 'tablet' | 'desktop';
}

export interface ViewfinderFrameConfig {
    cornerBrackets: {
        size: number;
        strokeWidth: number;
        length: number;
        opacity: number;
        animationDuration: number;
    };
    grid: {
        enabled: boolean;
        opacity: number;
        strokeWidth: number;
        animationDelay: number;
        fadeInDuration: number;
    };
    focusArea: {
        size: number;
        strokeWidth: number;
        pulseOpacity: [number, number];
        pulseDuration: number;
    };
}