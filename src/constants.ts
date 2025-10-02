
import type { Section, SectionId, WorkProject, InsightArticle, SocialLink, TechnicalSkill } from './types';
import { GithubIcon, LinkedinIcon, InstagramIcon, MailIcon, CameraIcon, BlogIcon } from './components/ui/Icons';

export const SECTIONS: Section[] = [
    { id: 'hero', title: 'Home' },
    { id: 'about', title: 'About' },
    { id: 'work', title: 'Work' },
    { id: 'insights', title: 'Insights' },
    { id: 'gallery', title: 'Gallery' },
    { id: 'reel', title: 'Reel' },
    { id: 'volleyball-demo', title: 'Tech Demo' },
    { id: 'contact', title: 'Contact' },
];

export const WORK_PROJECTS: WorkProject[] = [
    {
        title: 'AI-Driven Development Platform',
        description: 'Architected autonomous coding system using Claude/GPT-4 for a Fortune 500 tech company. Reduced development cycle time 60% while maintaining 99.9% test coverage. Scaled from proof-of-concept to production serving 500+ engineers.',
        tags: ['GenAI', 'Architecture', 'TypeScript', 'Scale'],
        imageUrl: 'https://picsum.photos/seed/ai/600/400',
        link: '#',
        outcome: '60% faster development • 500+ engineers • 99.9% uptime'
    },
    {
        title: 'Multi-Cloud Infrastructure Migration',
        description: 'Led Fortune 500 retailer migration from legacy datacenter to AWS/Azure hybrid cloud. Reduced infrastructure costs 40% ($8M annually) while improving performance 3x. Zero downtime across 200+ microservices serving 10M daily users.',
        tags: ['AWS', 'Azure', 'Architecture', 'Cost Optimization'],
        imageUrl: 'https://picsum.photos/seed/cloud/600/400',
        link: '#',
        outcome: '$8M saved annually • 3x performance • Zero downtime'
    },
    {
        title: 'Real-Time Analytics Platform',
        description: 'Built event-driven analytics system for major sports organization. Reduced query times from 30s to 200ms while scaling from 5K to 50K concurrent users. Processing 100M events daily with sub-second latency using Kafka + ClickHouse.',
        tags: ['React', 'Kafka', 'ClickHouse', 'Real-Time'],
        imageUrl: 'https://picsum.photos/seed/volleyball/600/400',
        link: '#',
        outcome: '150x faster queries • 10x user scale • 100M events/day'
    },
];

export const INSIGHTS_ARTICLES: InsightArticle[] = [
    {
        title: 'The Future is Agentic: AI-Driven Software Engineering',
        platform: 'Blog',
        excerpt: 'Exploring the paradigm shift in software development where AI agents take the lead in coding, testing, and deployment.',
        imageUrl: 'https://picsum.photos/seed/agentic/600/400',
        link: 'https://blog.nino.photos',
    },
    {
        title: 'Bridging the Gap: Architecting for Business and Technology',
        platform: 'LinkedIn',
        excerpt: 'A deep dive into the role of an Enterprise Architect as a translator between executive vision and technical implementation.',
        imageUrl: 'https://picsum.photos/seed/bridge/600/400',
        link: 'https://www.linkedin.com/in/nino-chavez/',
    },
    {
        title: 'Capturing the Moment: A Guide to Action Sports Photography',
        platform: 'Blog',
        excerpt: 'Tips and techniques for freezing peak action, from gear selection to composition, tailored for sports like volleyball.',
        imageUrl: 'https://picsum.photos/seed/actionsports/600/400',
        link: 'https://blog.nino.photos',
    },
];

export const SOCIAL_LINKS: SocialLink[] = [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/nino-chavez/', icon: LinkedinIcon },
    { name: 'GitHub', url: 'https://github.com/chavezabelino', icon: GithubIcon },
    { name: 'Photography', url: 'https://gallery.nino.photos', icon: CameraIcon },
    { name: 'Blog', url: 'https://blog.nino.photos', icon: BlogIcon },
    { name: 'Instagram', url: 'https://www.instagram.com/ninochavezphoto/', icon: InstagramIcon },
    { name: 'Email', url: 'mailto:hello@nino.photos', icon: MailIcon },
];

// Import gallery metadata from JSON file
import galleryMetadata from './data/gallery-metadata.json';

// Type for gallery image from metadata
export interface GalleryImage {
    id: string;
    filename: string;
    alt: string;
    categories: string[];
    urls: {
        thumbnail: string;
        preview: string;
        full: string;
        fallback: string;
    };
    metadata: {
        camera: string;
        lens: string;
        iso: number;
        aperture: string;
        shutterSpeed: string;
        focalLength: string;
        dateTaken: string;
        location: string;
        projectContext: string;
        tags: string[];
        processingNotes?: string;
    };
    displayOrder: number;
    isFeatured: boolean;
}

// Export gallery images from metadata
export const GALLERY_IMAGES: GalleryImage[] = galleryMetadata.images;

// Export gallery categories
export const GALLERY_CATEGORIES = [
    { id: 'all', label: 'All', icon: '📷' },
    { id: 'action-sports', label: 'Action Sports', icon: '🏐' },
    { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
    { id: 'surfing', label: 'Surfing', icon: '🏄' },
    { id: 'skateboarding', label: 'Skateboarding', icon: '🛹' },
];

// Hero Viewfinder Configuration
export const HERO_VIEWFINDER_CONFIG = {
    animation: {
        blurDuration: 1200, // 1.2s blur-to-focus animation
        hudStaggerDelay: 150, // 0.15s delay between skill items
        captureSequenceDuration: 800, // 0.8s shutter animation
        scrollTransitionDuration: 1000, // 1s scroll to next section
    },
    blur: {
        initialBlur: 8, // Starting blur amount in pixels
        focusBlur: 0, // Final focused blur amount
        animationEasing: 'cubic-bezier(0.23, 1, 0.32, 1)', // easeOutQuint for smooth focus
        updateInterval: 16, // ~60fps update interval
        hardwareAcceleration: true, // Enable GPU acceleration
        fallbackTransition: '200ms ease-out', // Fallback for browsers without RAF support
    },
    visual: {
        cornerBracketSize: 32, // Size of viewfinder corner brackets
        gridLineOpacity: 0.3, // Opacity of rule-of-thirds grid
        metadataHUDWidth: 280, // Width of technical skills HUD
        focusIndicatorSize: 60, // Size of focus confirmation indicator
    },
    frame: {
        cornerBrackets: {
            size: 48, // Enhanced corner bracket size
            strokeWidth: 2.5, // Bracket line thickness
            length: 24, // Length of each bracket arm
            opacity: 0.9, // Bracket visibility
            animationDuration: 600, // Entrance animation duration
        },
        grid: {
            enabled: true, // Show rule-of-thirds grid
            opacity: 0.25, // Grid line opacity
            strokeWidth: 1, // Grid line thickness
            animationDelay: 400, // Delay before grid appears
            fadeInDuration: 800, // Grid fade-in animation
        },
        focusArea: {
            size: 120, // Focus area indicator size
            strokeWidth: 2, // Focus ring thickness
            pulseOpacity: [0.4, 0.8], // Pulse animation opacity range
            pulseDuration: 2000, // Pulse animation cycle time
        },
        responsive: {
            mobile: { cornerBracketSize: 36, gridOpacity: 0.2 },
            tablet: { cornerBracketSize: 42, gridOpacity: 0.25 },
            desktop: { cornerBracketSize: 48, gridOpacity: 0.3 },
        },
    },
    performance: {
        maxFPS: 60, // Target frame rate for animations
        throttleMs: 8, // 120fps throttling for high-performance mouse tracking
        blurUpdateInterval: 20, // Blur animation update frequency
    },
    accessibility: {
        reducedMotionDuration: 300, // Animation duration with prefers-reduced-motion
        focusVisibleOutlineWidth: 2, // Focus indicator outline width
        colorContrastRatio: 4.5, // WCAG AA color contrast minimum
    },
};

// Technical Skills for Hero Viewfinder HUD
export const HERO_TECHNICAL_SKILLS: TechnicalSkill[] = [
    // Site Stack (This Portfolio)
    {
        id: 'react',
        category: 'site',
        label: 'React',
        value: '19.1.1',
        animationDelay: 0,
        hoverInfo: 'Modern React with Concurrent Features and Server Components'
    },
    {
        id: 'typescript',
        category: 'site',
        label: 'TypeScript',
        value: '5.8.2',
        animationDelay: 150,
        hoverInfo: 'Strict typing with advanced generics and utility types'
    },
    {
        id: 'vite',
        category: 'site',
        label: 'Vite',
        value: '6.2.0',
        animationDelay: 300,
        hoverInfo: 'Lightning-fast build tool with HMR and optimized bundling'
    },
    {
        id: 'vitest',
        category: 'site',
        label: 'Vitest',
        value: '3.2.4',
        animationDelay: 450,
        hoverInfo: 'Fast unit testing with Vue ecosystem integration'
    },

    // Architecture & Strategy
    {
        id: 'focus',
        category: 'architecture',
        label: 'Focus',
        value: 'Commerce Architecture',
        animationDelay: 600,
        hoverInfo: 'Enterprise eCommerce platforms: SAP Commerce, Salesforce, Adobe'
    },
    {
        id: 'strategy',
        category: 'architecture',
        label: 'Strategy',
        value: 'Enterprise Integration',
        animationDelay: 750,
        hoverInfo: 'Multi-platform system integration and organizational alignment'
    },
    {
        id: 'principle',
        category: 'architecture',
        label: 'Principle',
        value: 'AI-Native',
        animationDelay: 900,
        hoverInfo: 'AI-first approach to business reinvention and platform modernization'
    },
    {
        id: 'experience',
        category: 'architecture',
        label: 'Experience',
        value: '20+ Years',
        animationDelay: 1050,
        hoverInfo: 'From developer to enterprise architect across fortune 500 clients'
    },

    // Professional Scale
    {
        id: 'teams',
        category: 'leadership',
        label: 'Team Scale',
        value: '100+ Resources',
        animationDelay: 1200,
        hoverInfo: 'Global agile teams spanning architecture, development, and QA'
    },
    {
        id: 'programs',
        category: 'leadership',
        label: 'Program Value',
        value: '$10M+ Delivery',
        animationDelay: 1350,
        hoverInfo: 'Multi-million dollar enterprise commerce transformation programs'
    },

    // Photography
    {
        id: 'body',
        category: 'photography',
        label: 'Body',
        value: 'Sony α7 IV',
        animationDelay: 1500,
        hoverInfo: 'Full-frame mirrorless camera with 33MP sensor and advanced video'
    },
    {
        id: 'lens',
        category: 'photography',
        label: 'Lens',
        value: 'Sony FE 85mm f/1.4 GM',
        animationDelay: 1650,
        hoverInfo: 'Professional G Master telephoto lens with exceptional bokeh'
    },

    // Performance (Site + Enterprise)
    {
        id: 'site_performance',
        category: 'performance',
        label: 'Site Performance',
        value: 'Core Web Vitals ≥95',
        animationDelay: 1800,
        hoverInfo: 'LCP <2.5s, CLS <0.1, FID <100ms for optimal user experience'
    },
    {
        id: 'enterprise_scale',
        category: 'performance',
        label: 'Enterprise Scale',
        value: 'Global Commerce',
        animationDelay: 1950,
        hoverInfo: 'High-performance platforms serving millions of users worldwide'
    },
];

// Skill Category Configuration
export const SKILL_CATEGORIES = {
    site: {
        label: 'Portfolio Stack',
        color: 'rgb(59, 130, 246)', // blue-500
        description: 'Tech stack powering this portfolio site'
    },
    architecture: {
        label: 'Architecture',
        color: 'rgb(168, 85, 247)', // purple-500
        description: 'Enterprise commerce architecture and AI-native strategy'
    },
    leadership: {
        label: 'Leadership',
        color: 'rgb(34, 197, 94)', // green-500
        description: 'Team management and program delivery at enterprise scale'
    },
    photography: {
        label: 'Photography',
        color: 'rgb(249, 115, 22)', // orange-500
        description: 'Professional camera equipment and action sports techniques'
    },
    performance: {
        label: 'Performance',
        color: 'rgb(236, 72, 153)', // pink-500
        description: 'Site optimization and enterprise-scale platform performance'
    },
};
