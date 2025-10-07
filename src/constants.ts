
import type { Section, SectionId, WorkProject, InsightArticle, SocialLink, TechnicalSkill } from './types';
import { GithubIcon, LinkedinIcon, InstagramIcon, MailIcon, CameraIcon, BlogIcon } from './components/ui/Icons';

export const SECTIONS: Section[] = [
    { id: 'hero', title: 'Home' },
    { id: 'about', title: 'About' },
    { id: 'work', title: 'Projects' },
    { id: 'insights', title: 'Essays' },
    { id: 'gallery', title: 'Photography' },
    { id: 'reel', title: 'Reel' },
    { id: 'volleyball-demo', title: 'Tech Stack' },
    { id: 'contact', title: 'Connect' },
];

export const WORK_PROJECTS: WorkProject[] = [
    {
        id: 'multi-agent-platform',
        title: 'Multi-Agent Development Platform',
        subtitle: 'This Portfolio Site',
        description: 'Orchestrated 5 specialized AI agents (Claude, Gemini, Amazon Kiro, Copilot, Cursor) through enhanced Agent-OS framework with automated quality gates. Achieved 97/100 Lighthouse performance while maintaining enterprise standards through 30-minute commit cadence and continuous validation.',
        tags: ['Agent-OS', 'Multi-Agent Orchestra', 'React 19', 'TypeScript', 'Quality Gates'],
        technologies: ['Agent-OS', 'React 19', 'TypeScript', 'Vite', 'Vitest', 'Quality Gates'],
        architecture: ['Multi-Agent Orchestration', 'Automated Quality Gates', 'Performance Budgets', 'Continuous Validation', 'Work Loss Prevention'],
        challenges: ['Agent coordination across 5 platforms', 'Maintaining quality consistency', 'Meeting 97/100 Lighthouse target', 'Preventing work loss'],
        outcomes: ['97/100 Lighthouse score achieved', '95% work loss reduction', '5 automated quality gates passing', 'Enterprise-grade portfolio site'],
        imageUrl: 'https://picsum.photos/seed/portfolio/600/400',
        link: 'https://github.com/nino-chavez/brand-site',
        repository: 'https://github.com/nino-chavez/brand-site',
        outcome: '97/100 Lighthouse • 95% work loss reduction • 5 automated quality gates passed',
        metrics: {
            performance: '97/100 Lighthouse',
            scale: '5 AI agents orchestrated',
            timeline: 'Q4 2024 → Production'
        }
    },
    {
        id: 'match-flow',
        title: 'MatchFlow',
        subtitle: 'Production-Ready Tournament Platform',
        description: 'Built a comprehensive volleyball tournament management platform with real-time scoring, automated scheduling, and 137 specialized services. Achieved 88/100 production readiness score with enterprise infrastructure including capability-based permissions, WebSocket real-time updates, and comprehensive monitoring. Demonstrates 10x development efficiency through strategic AI-assisted workflows.',
        tags: ['Next.js 15', 'React 19', 'Supabase', 'Real-Time', 'Production-Ready'],
        technologies: ['Next.js 15', 'React 19', 'TypeScript 5', 'Supabase', 'PostgreSQL', 'Vercel'],
        architecture: ['Service-Oriented (137 services)', 'Real-Time WebSocket', 'Capability-Based Permissions', 'Row-Level Security', 'Event-Driven'],
        challenges: ['Real-time match state sync', 'Complex scheduling logic', 'Fine-grained permissions', 'Production monitoring'],
        outcomes: ['88/100 production readiness', '91 Lighthouse performance', '100% documentation health', '10x dev efficiency demonstrated'],
        imageUrl: 'https://picsum.photos/seed/matchflow/600/400',
        link: 'https://github.com/signal-x-studio/match-flow',
        repository: 'https://github.com/signal-x-studio/match-flow',
        outcome: '88/100 production ready • 137 services • Real-time WebSocket • 10x efficiency',
        metrics: {
            performance: '91 Lighthouse score',
            scale: '137 specialized services',
            timeline: '6-month development'
        }
    },
    {
        id: 'aegis-framework',
        title: 'Aegis Framework',
        subtitle: 'AI Agent Governance Framework',
        description: 'First-in-industry governance framework for consistent, compliant AI agent code generation. Provides constitutional governance for multi-agent coordination, real-time quality enforcement, and drift prevention. Solves the critical problem every AI-assisted developer faces: inconsistent code generation across tools. Built for individual developers, teams, and enterprise organizations needing production-grade AI governance.',
        tags: ['AI Governance', 'Multi-Agent', 'Constitutional Framework', 'TypeScript', 'DevOps'],
        technologies: ['TypeScript', 'Node.js', 'OpenTelemetry', 'Zod', 'Vitest', 'Playwright'],
        architecture: ['Constitutional Governance', 'Pattern Recognition', 'Self-Healing Systems', 'Multi-Agent Coordination', 'Observability'],
        challenges: ['Enforcing standards across AI tools', 'Preventing quality drift', 'Multi-agent orchestration', 'Production governance'],
        outcomes: ['Industry-first governance spec', 'Constitutional framework v2.5', 'Multi-tool coordination', 'Open-source community adoption'],
        imageUrl: 'https://picsum.photos/seed/aegis/600/400',
        link: 'https://github.com/signal-x-studio/aegis-framework',
        repository: 'https://github.com/signal-x-studio/aegis-framework',
        outcome: 'Industry-first AI governance • Constitutional framework • Multi-agent coordination',
        metrics: {
            performance: 'Real-time enforcement',
            scale: 'Multi-agent orchestration',
            timeline: '2.5.0 framework release'
        }
    },
    {
        id: 'smugmug-reference',
        title: 'SmugMug API Reference App',
        subtitle: 'Built in 72 Hours with AI Agents',
        description: 'Enterprise-grade application built in one weekend by orchestrating 5 specialized AI agents as a virtual development team. Demonstrates three pillars: building WITH AI (multi-agent workflow), building AI INTO features (semantic photo search), and building FOR AI (agent-native architecture). Achieved 20x velocity multiplier with 98.8% cost reduction versus traditional development.',
        tags: ['Multi-Agent Development', 'React 19', 'AI-Powered Search', 'OAuth 1.0a', 'Gemini'],
        technologies: ['React 19', 'TypeScript 5.8', 'Vite', 'Google Gemini', 'Playwright', 'Vitest'],
        architecture: ['Agent-Native Design', 'Dual Interface (UI/Programmatic)', 'OAuth 1.0a', 'Semantic Search', 'AI-Enforced Standards'],
        challenges: ['72-hour timeline', 'Solo developer constraints', 'OAuth complexity', 'AI agent coordination'],
        outcomes: ['20,000+ lines in 72 hours', '20x velocity multiplier', '98.8% cost reduction', 'Full test coverage'],
        imageUrl: 'https://picsum.photos/seed/smugmug/600/400',
        link: 'https://github.com/signal-x-studio/smugmug-api-reference-app',
        repository: 'https://github.com/signal-x-studio/smugmug-api-reference-app',
        demo: 'https://signal-x-studio.github.io/smugmug-api-reference-app/',
        outcome: '72-hour build • 20x velocity • AI-powered search • 98.8% cost reduction',
        metrics: {
            performance: '20x velocity multiplier',
            scale: '20,000+ lines of code',
            timeline: '72 hours (1 weekend)'
        }
    },
    {
        id: 'commerce-prompt-analyzer',
        title: 'Commerce Prompt Analyzer',
        subtitle: 'Answer Engine Optimization Tool',
        description: 'AI-powered tool that analyzes e-commerce category structures and generates customer search prompts for answer engines like Gemini. Tests prompt answerability across multiple AI engines to identify gaps in product catalog coverage. Built for commerce strategists and SEO professionals adapting to the shift from search-first to answer-first discovery. Directly supports enterprise consulting work in AI-native commerce transformation.',
        tags: ['AI-Native Commerce', 'Gemini', 'Answer Engines', 'React 19', 'SEO'],
        technologies: ['React 19', 'TypeScript 5.8', 'Google Gemini', 'Vite', 'AI Studio'],
        architecture: ['Multi-Engine Testing', 'Catalog Analysis', 'Prompt Generation', 'Answerability Validation', 'Real-Time Feedback'],
        challenges: ['Answer engine variability', 'Catalog structure inference', 'Prompt quality assessment', 'Multi-engine coordination'],
        outcomes: ['Multi-engine prompt testing', 'Catalog gap identification', 'Answer-first readiness assessment', 'Enterprise consulting tool'],
        imageUrl: 'https://picsum.photos/seed/commerce-analyzer/600/400',
        link: 'https://github.com/signal-x-studio/commerce-prompt-analyzer',
        repository: 'https://github.com/signal-x-studio/commerce-prompt-analyzer',
        outcome: 'Answer engine optimization • Multi-engine testing • Commerce consulting tool',
        metrics: {
            performance: 'Multi-engine analysis',
            scale: 'Category-level insights',
            timeline: 'Active development'
        }
    },
];

export const INSIGHTS_ARTICLES: InsightArticle[] = [
    {
        id: 'commerce-integration-reality',
        title: 'When "Simple Integration" Isn\'t',
        subtitle: 'Commerce platform field notes',
        platform: 'Blog',
        excerpt: 'Connecting SAP Commerce to warehouse systems sounds straightforward in the architecture deck. Then you meet the legacy ERP that thinks it\'s 1997, inventory data that updates "eventually," and business rules that exist only in someone\'s head.',
        imageUrl: 'https://picsum.photos/seed/integration-reality/600/400',
        link: 'https://blog.nino.photos',
        readTime: '7 min read',
        date: '2024-09-15',
        category: 'Field Notes',
        tags: ['Commerce', 'Integration', 'Reality Check', 'Legacy Systems'],
        insights: [
            'Documentation describes the system they wish they had, not the one that exists',
            'Every integration has an "undocumented behavior" that breaks everything',
            'The phrase "it should be straightforward" is a warning sign',
            'Success is measured in fires that don\'t start, not features shipped'
        ]
    },
    {
        id: 'reading-the-road',
        title: 'Reading the Road',
        subtitle: 'Pattern recognition in systems and surfing',
        platform: 'Blog',
        excerpt: 'Surfers read conditions, not predictions. Position, timing, response. Enterprise architecture operates the same way: constraint analysis over roadmap promises, deployment windows over sprint velocity.',
        imageUrl: 'https://picsum.photos/seed/pattern-recognition/600/400',
        link: 'https://blog.nino.photos',
        readTime: '6 min read',
        date: '2024-08-22',
        category: 'Systems Thinking',
        tags: ['Strategy', 'Pattern Recognition', 'Surfing', 'Architecture'],
        insights: [
            'The best architectures respond to reality, not PowerPoint projections',
            'Positioning matters more than prediction',
            'Small signals reveal big problems before they cascade',
            'Sometimes the right move is to paddle around the wave'
        ]
    },
    {
        id: 'quiet-leadership',
        title: 'Holding Up the Mirror',
        subtitle: 'Quiet leadership in loud organizations',
        platform: 'LinkedIn',
        excerpt: 'Fortune 500 companies don\'t need another voice in the room. They need someone to reflect what\'s actually happening—the gaps between strategy and execution, the technical debt nobody wants to talk about, the assumptions that stopped being true three years ago.',
        imageUrl: 'https://picsum.photos/seed/leadership/600/400',
        link: 'https://www.linkedin.com/in/nino-chavez/',
        readTime: '8 min read',
        date: '2024-07-18',
        category: 'Leadership',
        tags: ['Enterprise', 'Strategy', 'Consulting', 'Signal'],
        insights: [
            'Most organizations know their problems—they need permission to act',
            'Listening reveals more than talking ever will',
            'The questions you ask define the answers you get',
            'Technical leadership is about clarity, not authority'
        ]
    },
    {
        id: 'ai-native-shift',
        title: 'Answer-First Commerce',
        subtitle: 'Rethinking assumptions in an AI-native world',
        platform: 'Blog',
        excerpt: 'Current work at Accenture Song: AI commerce transformation frameworks for Fortune 500 retailers. When customers expect answers instead of search results, your entire commerce platform needs rethinking—not retrofitting.',
        imageUrl: 'https://picsum.photos/seed/ai-commerce/600/400',
        link: 'https://blog.nino.photos',
        readTime: '10 min read',
        date: '2024-06-25',
        category: 'AI Strategy',
        tags: ['AI', 'Commerce', 'Transformation', 'Strategy'],
        insights: [
            'Search-first architecture doesn\'t map to answer-first experiences',
            'AI isn\'t a feature layer—it changes core assumptions',
            'The hardest part isn\'t the technology, it\'s organizational readiness',
            'Best approach: progressive enhancement, not big-bang replacement'
        ]
    }
];

export const SOCIAL_LINKS: SocialLink[] = [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/nino-chavez/', icon: LinkedinIcon },
    { name: 'GitHub', url: 'https://github.com/nino-chavez', icon: GithubIcon },
    { name: 'Signal X Studio', url: 'https://github.com/signal-x-studio', icon: GithubIcon },
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
    { id: 'all', label: 'All', icon: '●' },
    { id: 'action-sports', label: 'Action Sports', icon: '◆' },
    { id: 'volleyball', label: 'Volleyball', icon: '○' },
    { id: 'surfing', label: 'Surfing', icon: '◈' },
    { id: 'skateboarding', label: 'Skateboarding', icon: '◉' },
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
        hoverInfo: 'Connecting systems that were never meant to work together'
    },
    {
        id: 'principle',
        category: 'architecture',
        label: 'Principle',
        value: 'AI-Native',
        animationDelay: 900,
        hoverInfo: 'Building with AI as core infrastructure, not an add-on'
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
        hoverInfo: 'Enterprise commerce transformations worth $10M+'
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
