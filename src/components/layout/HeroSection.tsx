import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { SectionId } from '../types';
import BlurContainer from './BlurContainer';
import { useAthleticTokens } from '@tokens/providers/AthleticTokenProvider';
import { useMagneticEffect } from '../../hooks/useMagneticEffect';

interface HeroSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
    onNavigate: (id: SectionId) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ setRef, onNavigate }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    // Profile toggle functionality
    const handleProfileToggle = useCallback(() => {
        setProfileMinimized(prev => !prev);
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
                {/* Optimized hero background - Gradient + SVG Pattern (Option A) */}
                <div id="hero-background" className="absolute inset-0">
                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

                    {/* Animated accent gradient */}
                    <div
                        className="absolute inset-0 opacity-50"
                        style={{
                            background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3), transparent 50%)',
                            animation: 'gradientShift 10s ease-in-out infinite'
                        }}
                    />

                    {/* SVG grain texture overlay */}
                    <svg className="absolute inset-0 w-full h-full opacity-20">
                        <filter id="noise">
                            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
                            <feColorMatrix type="saturate" values="0" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#noise)" />
                    </svg>
                </div>

            {/* Enhanced dark overlay with animated gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
            <div className="absolute inset-0 bg-black/20"></div>


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
                            Enterprise Architect & Technical Leader
                        </p>
                        <div className="flex items-center justify-center space-x-3 text-lg md:text-xl text-white/90 font-medium" style={{
                            textShadow: '0 2px 6px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.7)'
                        }}>
                            <span>Software Engineering</span>
                            <div className="w-1 h-1 rounded-full bg-white/60"></div>
                            <span>Visual Storytelling</span>
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl text-white/85 mb-4 font-normal max-w-3xl mx-auto leading-relaxed tracking-wide" style={{
                        textShadow: '0 2px 6px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.7)',
                        animation: 'fadeInUp 1s ease-out 0.6s both'
                    }}>
                        Building resilient systems that scale from thousands to millions of users
                    </p>

                    {/* Trust signals */}
                    <p className="text-sm md:text-base text-white/70 mb-6 max-w-2xl mx-auto" style={{
                        textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
                        animation: 'fadeInUp 1s ease-out 0.65s both'
                    }}>
                        Trusted by Fortune 500 companies • 20+ years enterprise experience
                    </p>

                    <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto" style={{
                        textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
                        animation: 'fadeInUp 1s ease-out 0.7s both'
                    }}>
                        React 19 • TypeScript • AWS/Azure • Microservices • Leading 50+ Engineers
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6" style={{
                        animation: 'fadeInUp 1s ease-out 0.8s both'
                    }}>
                        <button
                            ref={viewWorkBtnRef}
                            onClick={() => onNavigate('work')}
                            className="btn-primary group btn-magnetic text-xl px-10 py-5"
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <span className="tracking-wide">View Case Studies</span>
                                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
