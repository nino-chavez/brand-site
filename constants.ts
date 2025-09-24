
import type { Section, SectionId, WorkProject, InsightArticle, SocialLink } from './types';
import { GithubIcon, LinkedinIcon, InstagramIcon, MailIcon, CameraIcon, BlogIcon } from './components/Icons';

export const SECTIONS: Section[] = [
    { id: 'hero', title: 'Home' },
    { id: 'about', title: 'About' },
    { id: 'work', title: 'Work' },
    { id: 'insights', title: 'Insights' },
    { id: 'gallery', title: 'Gallery' },
    { id: 'reel', title: 'Reel' },
    { id: 'contact', title: 'Contact' },
];

export const WORK_PROJECTS: WorkProject[] = [
    {
        title: 'Agentic Software Development',
        description: 'Pioneering generative AI workflows for autonomous application development, enhancing productivity and innovation in enterprise environments.',
        tags: ['GenAI', 'Architecture', 'TypeScript', 'Agents'],
        imageUrl: 'https://picsum.photos/seed/ai/600/400',
        link: '#',
    },
    {
        title: 'Enterprise Cloud Migration',
        description: 'Led the architectural design and strategic planning for migrating legacy systems to a scalable, multi-cloud infrastructure for a Fortune 500 client.',
        tags: ['Cloud', 'Strategy', 'Architecture', 'Consulting'],
        imageUrl: 'https://picsum.photos/seed/cloud/600/400',
        link: '#',
    },
    {
        title: 'Volleyball Tournament Platform',
        description: 'A comprehensive management system for volleyball tournaments, featuring scheduling, live scoring, and athlete profiles. Built with a modern tech stack.',
        tags: ['React', 'Node.js', 'PostgreSQL', 'Full-Stack'],
        imageUrl: 'https://picsum.photos/seed/volleyball/600/400',
        link: '#',
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
    { name: 'GitHub', url: '#', icon: GithubIcon },
    { name: 'Photography', url: 'https://gallery.nino.photos', icon: CameraIcon },
    { name: 'Blog', url: 'https://blog.nino.photos', icon: BlogIcon },
    { name: 'Instagram', url: '#', icon: InstagramIcon },
    { name: 'Email', url: 'mailto:email@example.com', icon: MailIcon },
];

export const GALLERY_IMAGES: { src: string; alt: string }[] = [
    { src: 'https://picsum.photos/seed/gallery1/800/600', alt: 'Volleyball player spiking a ball' },
    { src: 'https://picsum.photos/seed/gallery2/600/800', alt: 'Athlete celebrating a point' },
    { src: 'https://picsum.photos/seed/gallery3/800/600', alt: 'A dramatic dive for the ball' },
    { src: 'https://picsum.photos/seed/gallery4/800/600', alt: 'Team huddle during a timeout' },
    { src: 'https://picsum.photos/seed/gallery5/600/800', alt: 'Close-up of a volleyball serve' },
    { src: 'https://picsum.photos/seed/gallery6/800/600', alt: 'Wide shot of a volleyball court in action' },
];
