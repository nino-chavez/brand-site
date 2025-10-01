import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { SectionId } from '../types';
import BlurContainer from './BlurContainer';
import { useAthleticTokens } from '@tokens/providers/AthleticTokenProvider';
import { useMagneticEffect } from '../../hooks/useMagneticEffect';

interface HeroSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
    onNavigate: (id: SectionId) => void;
}

// Volleyball timing phases (8-second cycle) - using athletic tokens
const VOLLEYBALL_PHASES = [
    { id: 'setup', name: 'Setup', duration: 1500, color: 'var(--athletic-color-neutral-600)' },
    { id: 'anticipation', name: 'Anticipation', duration: 1200, color: 'var(--athletic-color-court-orange)' },
    { id: 'approach', name: 'Approach', duration: 1000, color: 'var(--athletic-color-court-navy)' },
    { id: 'spike', name: 'Spike', duration: 800, color: 'var(--athletic-color-warning)' },
    { id: 'impact', name: 'Impact', duration: 600, color: 'var(--athletic-color-warning)' },
    { id: 'followthrough', name: 'Follow-Through', duration: 900, color: 'var(--athletic-color-success)' }
] as const;

type VolleyballPhase = typeof VOLLEYBALL_PHASES[number]['id'];

// Architecture diagram states for each phase
const ARCHITECTURE_STATES = {
    setup: {
        title: 'Planning Phase',
        description: 'Foundational architecture design',
        nodes: [
            { id: 'planning', x: 50, y: 30, type: 'planning', label: 'Requirements' },
            { id: 'design', x: 50, y: 70, type: 'planning', label: 'Design' }
        ],
        connections: []
    },
    anticipation: {
        title: 'Development Prep',
        description: 'System architecture emerges',
        nodes: [
            { id: 'frontend', x: 20, y: 20, type: 'service', label: 'Frontend' },
            { id: 'api', x: 50, y: 50, type: 'gateway', label: 'API Gateway' },
            { id: 'backend', x: 80, y: 20, type: 'service', label: 'Backend' }
        ],
        connections: [{ from: 'frontend', to: 'api' }, { from: 'api', to: 'backend' }]
    },
    approach: {
        title: 'Scaling Architecture',
        description: 'Performance considerations',
        nodes: [
            { id: 'frontend', x: 15, y: 15, type: 'service', label: 'Frontend' },
            { id: 'cdn', x: 15, y: 35, type: 'service', label: 'CDN' },
            { id: 'loadbalancer', x: 50, y: 25, type: 'gateway', label: 'Load Balancer' },
            { id: 'backend1', x: 75, y: 15, type: 'service', label: 'Backend 1' },
            { id: 'backend2', x: 75, y: 35, type: 'service', label: 'Backend 2' },
            { id: 'database', x: 85, y: 60, type: 'database', label: 'Database' }
        ],
        connections: [
            { from: 'frontend', to: 'cdn' },
            { from: 'frontend', to: 'loadbalancer' },
            { from: 'loadbalancer', to: 'backend1' },
            { from: 'loadbalancer', to: 'backend2' },
            { from: 'backend1', to: 'database' },
            { from: 'backend2', to: 'database' }
        ]
    },
    spike: {
        title: 'Real-time Optimization',
        description: 'Maximum performance',
        nodes: [
            { id: 'frontend', x: 10, y: 10, type: 'service', label: 'Frontend' },
            { id: 'cdn', x: 10, y: 30, type: 'service', label: 'CDN' },
            { id: 'cache', x: 30, y: 20, type: 'service', label: 'Redis Cache' },
            { id: 'loadbalancer', x: 50, y: 25, type: 'gateway', label: 'Load Balancer' },
            { id: 'backend1', x: 70, y: 10, type: 'service', label: 'Backend 1' },
            { id: 'backend2', x: 70, y: 25, type: 'service', label: 'Backend 2' },
            { id: 'backend3', x: 70, y: 40, type: 'service', label: 'Backend 3' },
            { id: 'database', x: 85, y: 60, type: 'database', label: 'Database' },
            { id: 'analytics', x: 85, y: 80, type: 'service', label: 'Analytics' }
        ],
        connections: [
            { from: 'frontend', to: 'cdn' },
            { from: 'frontend', to: 'cache' },
            { from: 'cache', to: 'loadbalancer' },
            { from: 'loadbalancer', to: 'backend1' },
            { from: 'loadbalancer', to: 'backend2' },
            { from: 'loadbalancer', to: 'backend3' },
            { from: 'backend1', to: 'database' },
            { from: 'backend2', to: 'database' },
            { from: 'backend3', to: 'database' },
            { from: 'database', to: 'analytics' }
        ]
    },
    impact: {
        title: 'Production Architecture',
        description: 'Maximum clarity and performance',
        nodes: [
            { id: 'frontend', x: 10, y: 10, type: 'service', label: 'Frontend' },
            { id: 'cdn', x: 10, y: 30, type: 'service', label: 'Global CDN' },
            { id: 'cache', x: 30, y: 20, type: 'service', label: 'Redis Cluster' },
            { id: 'loadbalancer', x: 50, y: 25, type: 'gateway', label: 'Load Balancer' },
            { id: 'backend1', x: 70, y: 10, type: 'service', label: 'API Server 1' },
            { id: 'backend2', x: 70, y: 25, type: 'service', label: 'API Server 2' },
            { id: 'backend3', x: 70, y: 40, type: 'service', label: 'API Server 3' },
            { id: 'database', x: 85, y: 55, type: 'database', label: 'PostgreSQL' },
            { id: 'replica', x: 85, y: 70, type: 'database', label: 'Read Replica' },
            { id: 'monitoring', x: 20, y: 80, type: 'service', label: 'Monitoring' },
            { id: 'logging', x: 50, y: 80, type: 'service', label: 'Logging' }
        ],
        connections: [
            { from: 'frontend', to: 'cdn' },
            { from: 'frontend', to: 'cache' },
            { from: 'cache', to: 'loadbalancer' },
            { from: 'loadbalancer', to: 'backend1' },
            { from: 'loadbalancer', to: 'backend2' },
            { from: 'loadbalancer', to: 'backend3' },
            { from: 'backend1', to: 'database' },
            { from: 'backend2', to: 'database' },
            { from: 'backend3', to: 'database' },
            { from: 'database', to: 'replica' },
            { from: 'backend1', to: 'monitoring' },
            { from: 'backend2', to: 'logging' }
        ]
    },
    followthrough: {
        title: 'Continuous Improvement',
        description: 'Monitoring and optimization',
        nodes: [
            { id: 'frontend', x: 10, y: 10, type: 'service', label: 'Frontend' },
            { id: 'cdn', x: 10, y: 30, type: 'service', label: 'Global CDN' },
            { id: 'cache', x: 30, y: 20, type: 'service', label: 'Redis Cluster' },
            { id: 'loadbalancer', x: 50, y: 25, type: 'gateway', label: 'Load Balancer' },
            { id: 'backend1', x: 70, y: 10, type: 'service', label: 'API Server 1' },
            { id: 'backend2', x: 70, y: 25, type: 'service', label: 'API Server 2' },
            { id: 'backend3', x: 70, y: 40, type: 'service', label: 'API Server 3' },
            { id: 'database', x: 85, y: 55, type: 'database', label: 'PostgreSQL' },
            { id: 'replica', x: 85, y: 70, type: 'database', label: 'Read Replica' },
            { id: 'monitoring', x: 15, y: 70, type: 'service', label: 'Grafana' },
            { id: 'logging', x: 35, y: 70, type: 'service', label: 'ELK Stack' },
            { id: 'alerts', x: 55, y: 70, type: 'service', label: 'AlertManager' },
            { id: 'cicd', x: 25, y: 90, type: 'service', label: 'CI/CD Pipeline' }
        ],
        connections: [
            { from: 'frontend', to: 'cdn' },
            { from: 'frontend', to: 'cache' },
            { from: 'cache', to: 'loadbalancer' },
            { from: 'loadbalancer', to: 'backend1' },
            { from: 'loadbalancer', to: 'backend2' },
            { from: 'loadbalancer', to: 'backend3' },
            { from: 'backend1', to: 'database' },
            { from: 'backend2', to: 'database' },
            { from: 'backend3', to: 'database' },
            { from: 'database', to: 'replica' },
            { from: 'backend1', to: 'monitoring' },
            { from: 'backend2', to: 'logging' },
            { from: 'backend3', to: 'alerts' },
            { from: 'monitoring', to: 'cicd' },
            { from: 'logging', to: 'cicd' },
            { from: 'alerts', to: 'cicd' }
        ]
    }
};

const HeroSection: React.FC<HeroSectionProps> = ({ setRef, onNavigate }) => {
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [parallaxOffset, setParallaxOffset] = useState(0);

    // Access athletic design tokens
    const athleticTokens = useAthleticTokens();

    // Magnetic button effects
    const viewWorkBtnRef = useMagneticEffect<HTMLButtonElement>({ strength: 0.4, radius: 100 });
    const contactBtnRef = useMagneticEffect<HTMLButtonElement>({ strength: 0.4, radius: 100 });

    // Technical profile state
    const [profileVisible, setProfileVisible] = useState(false);
    const [profileMinimized, setProfileMinimized] = useState(false);

    // Smart responsive behavior for profile visibility
    useEffect(() => {
        const checkViewportSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const isMobile = width < 768;
            const isSmallDesktop = width >= 768 && width < 1200;
            const hasLimitedHeight = height < 700;

            // Hide on small desktop viewports where it would overlap with text
            if (isSmallDesktop && (width < 1000 || hasLimitedHeight)) {
                setProfileVisible(false);
                setProfileMinimized(false); // Reset minimized state
            }
            // Show and minimize on mobile (user wants it available on mobile)
            else if (isMobile) {
                setProfileVisible(true);
                setProfileMinimized(true); // Auto-minimize on mobile
            }
            // Show and allow full size on larger desktops
            else {
                setProfileVisible(true);
                setProfileMinimized(false);
            }
        };

        checkViewportSize();
        window.addEventListener('resize', checkViewportSize);
        return () => window.removeEventListener('resize', checkViewportSize);
    }, []);

    const currentPhase = VOLLEYBALL_PHASES[currentPhaseIndex];
    const currentArchitecture = ARCHITECTURE_STATES[currentPhase.id];

    // Auto-progress through phases
    useEffect(() => {
        if (isPaused || isHovered) return;

        const timer = setTimeout(() => {
            setCurrentPhaseIndex((prev) => (prev + 1) % VOLLEYBALL_PHASES.length);
        }, currentPhase.duration);

        return () => clearTimeout(timer);
    }, [currentPhaseIndex, currentPhase.duration, isPaused, isHovered]);

    // Pause/resume functionality
    const handlePauseToggle = useCallback(() => {
        setIsPaused(!isPaused);
    }, [isPaused]);

    // Profile toggle functionality
    const handleProfileToggle = useCallback(() => {
        setProfileMinimized(prev => !prev);
    }, []);

    // Parallax scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            // Move background slower than scroll (0.5 = half speed)
            setParallaxOffset(scrolled * 0.5);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mouse hover and position handlers
    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
    }, []);

    // Simple, smooth parallax effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const backgroundElement = document.getElementById('hero-background');
            if (backgroundElement) {
                // Simple parallax - background moves slower than scroll
                const parallaxOffset = scrollY * 0.5;
                backgroundElement.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Legacy viewfinder handlers (simplified)
    const handleViewfinderToggle = useCallback(() => {
        // This functionality has been simplified - just toggle profile visibility
        setProfileVisible(prev => !prev);
    }, []);

    const handleCapture = useCallback(() => {
        console.log('Hero moment captured!');
        // Scroll to next section
        const nextSection = document.querySelector('#work');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    // Auto-show profile after a brief delay on first load
    useEffect(() => {
        const timer = setTimeout(() => {
            setProfileVisible(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Keyboard controls (simplified)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                handleProfileToggle();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleProfileToggle]);

    return (
        <>
            {/* Inject CSS animations */}
            <style>{`
                @keyframes fadeInUp {
                    0% {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes gentleFloat {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                    }
                    25% {
                        transform: translateY(-3px) translateX(1px);
                    }
                    50% {
                        transform: translateY(-2px) translateX(-1px);
                    }
                    75% {
                        transform: translateY(-4px) translateX(0.5px);
                    }
                }

                @keyframes subtlePulse {
                    0%, 100% {
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px var(--athletic-color-brand-violet) / 0.1;
                    }
                    50% {
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px var(--athletic-color-brand-violet) / 0.2, 0 0 20px var(--athletic-color-brand-violet) / 0.1;
                    }
                }

                @keyframes gradientShift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: -100% 0;
                    }
                    100% {
                        background-position: 100% 0;
                    }
                }

                @keyframes breathe {
                    0%, 100% {
                        opacity: 0.4;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(1.05);
                    }
                }

                /* Athletic timing integration */
                .hero-fade-in {
                    animation: fadeInUp var(--athletic-timing-sequence) var(--athletic-easing-precision) forwards;
                }

                .hero-gentle-float {
                    animation: gentleFloat var(--athletic-timing-flow) var(--athletic-easing-glide) infinite;
                }

                .hero-breathe {
                    animation: breathe var(--athletic-timing-power) var(--athletic-easing-flow) infinite;
                }
            `}</style>

            <section
                id="hero"
                ref={setRef}
                className="min-h-screen relative overflow-hidden group"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    zIndex: 10,
                }}
            >
                {/* Separate parallax background element */}
                <div
                    id="hero-background"
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backgroundImage: 'url(/images/hero.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        transform: `translateY(${parallaxOffset}px)`, // Parallax effect
                        willChange: 'transform',
                        willChange: 'transform, opacity',
                        // Extend the background slightly to prevent gaps during parallax
                        height: '120%',
                        top: '-10%',
                    }}
                ></div>

                {/* Interactive spotlight effect */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none z-10"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.15), transparent 60%)`,
                    }}
                ></div>
            {/* Enhanced dark overlay with animated gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Animated gradient overlay for modern feel */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'linear-gradient(-45deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1), rgba(245, 158, 11, 0.1))',
                    backgroundSize: '400% 400%',
                    animation: 'gradientShift 15s ease infinite'
                }}
            ></div>

            {/* Subtle animated particles using CSS */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white/5"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 4 + 2}px`,
                            height: `${Math.random() * 4 + 2}px`,
                            animation: `breathe ${Math.random() * 4 + 3}s ease-in-out infinite ${Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Smooth transition fade at bottom of hero for seamless section flow */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-brand-dark to-transparent z-30 pointer-events-none"></div>

            {/* Main content container */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Central hero content with entrance animations */}
                <div className="text-center text-white z-20 animate-fade-in-up" style={{
                    animation: 'fadeInUp 1.2s ease-out forwards',
                }}>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-none text-white relative" style={{
                        textShadow: '0 4px 12px rgba(0, 0, 0, 0.9), 0 2px 6px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.5)',
                        animation: 'fadeInUp 1s ease-out 0.2s both'
                    }}>
                        {/* Subtle shimmer effect on hover */}
                        <span className="relative inline-block group">
                            <span className="relative z-10">Nino Chavez</span>
                            <span
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 2s ease-in-out infinite',
                                    transform: 'skewX(-20deg)',
                                }}
                            ></span>
                        </span>
                    </h1>
                    <div className="space-y-2 mb-8" style={{
                        animation: 'fadeInUp 1s ease-out 0.4s both'
                    }}>
                        <p className="text-xl md:text-3xl lg:text-4xl text-white font-semibold tracking-wide" style={{
                            textShadow: '0 3px 8px rgba(0, 0, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.7)'
                        }}>
                            Enterprise Architect
                        </p>
                        <div className="flex items-center justify-center space-x-3 text-lg md:text-xl text-white/90 font-medium" style={{
                            textShadow: '0 2px 6px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.7)'
                        }}>
                            <span>Software Engineer</span>
                            <div className="w-1 h-1 rounded-full bg-white/60"></div>
                            <span>Action Photographer</span>
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl text-white/85 mb-10 font-normal max-w-3xl mx-auto leading-relaxed tracking-wide" style={{
                        textShadow: '0 2px 6px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.7)',
                        animation: 'fadeInUp 1s ease-out 0.6s both'
                    }}>
                        Experience the intersection of technical excellence and athletic precision
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6" style={{
                        animation: 'fadeInUp 1s ease-out 0.8s both'
                    }}>
                        <button
                            ref={viewWorkBtnRef}
                            onClick={() => onNavigate('work')}
                            className="btn-primary group btn-magnetic"
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <span className="text-lg tracking-wide">View Work</span>
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>
                        <button
                            ref={contactBtnRef}
                            onClick={() => onNavigate('contact')}
                            className="btn-secondary group btn-magnetic"
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-lg tracking-wide">Contact</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Legacy ViewfinderOverlay removed - replaced by ViewfinderController + ViewfinderMetadata system */}
            </section>
        </>
    );
};

export default HeroSection;
