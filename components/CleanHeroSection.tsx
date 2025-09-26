import React, { useCallback } from 'react';
import type { SectionId } from '../types';
import ViewfinderOverlay from './ViewfinderOverlay';
import { useAthleticTokens } from '../tokens/simple-provider';

// Custom hooks - business logic extracted!
import { useHeroPhaseCycle } from '../hooks/useHeroPhaseCycle';
import { useResponsiveVisibility } from '../hooks/useResponsiveVisibility';
import { useMouseTracking } from '../hooks/useMouseTracking';
import { useParallaxEffect } from '../hooks/useParallaxEffect';
import { useKeyboardControls } from '../hooks/useKeyboardControls';

// Constants - data extracted!
import { HERO_ANIMATIONS } from '../constants/heroData';

interface CleanHeroSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
    onNavigate: (id: SectionId) => void;
}

/**
 * Refactored HeroSection component focused purely on rendering
 * Business logic extracted into focused custom hooks for better maintainability
 */
const CleanHeroSection: React.FC<CleanHeroSectionProps> = ({ setRef, onNavigate }) => {
    // Access athletic design tokens
    const athleticTokens = useAthleticTokens();

    // Phase cycle logic (was 56 lines of complex state management)
    const phaseCycle = useHeroPhaseCycle({
        initiallyPaused: false,
        pauseOnHover: true
    });

    // Responsive visibility logic (was 29 lines of viewport logic)
    const visibility = useResponsiveVisibility({
        initialVisible: true,
        autoShowDelay: 1000
    });

    // Mouse tracking logic (was 14 lines of position calculation)
    const mouseTracking = useMouseTracking({
        trackPosition: true,
        trackHover: true,
        onHoverChange: phaseCycle.setIsHovered // Connect hover to phase pause
    });

    // Parallax effect logic (was 14 lines of scroll handling)
    useParallaxEffect({
        targetElementId: 'hero-background',
        speed: 0.5,
        enabled: true
    });

    // Keyboard controls logic (was 12 lines of event handling)
    useKeyboardControls({
        actions: [
            {
                key: 'p',
                handler: visibility.toggleMinimized,
                preventDefault: true
            },
            {
                key: 'P',
                handler: visibility.toggleMinimized,
                preventDefault: true
            }
        ],
        enabled: true
    });

    // Simple event handlers - no complex logic
    const handleViewfinderToggle = useCallback(() => {
        visibility.setProfileVisible(prev => !prev);
    }, [visibility]);

    const handleCapture = useCallback(() => {
        console.log('Hero moment captured!');
        const nextSection = document.querySelector('#work');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    return (
        <>
            {/* Inject CSS animations - extracted to constants */}
            <style>{HERO_ANIMATIONS}</style>

            <section
                id="hero"
                ref={setRef}
                className="min-h-screen relative overflow-hidden group"
                onMouseMove={mouseTracking.handleMouseMove}
                onMouseEnter={mouseTracking.handleMouseEnter}
                onMouseLeave={mouseTracking.handleMouseLeave}
                style={{
                    zIndex: 10,
                }}
            >
                {/* Parallax background element */}
                <div
                    id="hero-background"
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backgroundImage: 'url(/images/hero.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        willChange: 'transform, opacity',
                        height: '120%',
                        top: '-10%',
                    }}
                />

                {/* Interactive spotlight effect */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none z-10"
                    style={{
                        background: `radial-gradient(600px circle at ${mouseTracking.mousePosition.x}% ${mouseTracking.mousePosition.y}%, rgba(139, 92, 246, 0.15), transparent 60%)`,
                    }}
                />

                {/* Enhanced dark overlay with animated gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
                <div className="absolute inset-0 bg-black/20" />

                {/* Animated gradient overlay */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: 'linear-gradient(-45deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1), rgba(245, 158, 11, 0.1))',
                        backgroundSize: '400% 400%',
                        animation: 'gradientShift 15s ease infinite'
                    }}
                />

                {/* Animated particles */}
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

                {/* Smooth transition fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-brand-dark to-transparent z-30 pointer-events-none" />

                {/* Main content container - pure rendering */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white z-20" style={{
                        animation: 'fadeInUp 1.2s ease-out forwards',
                    }}>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-none text-white relative" style={{
                            textShadow: '0 4px 12px rgba(0, 0, 0, 0.9), 0 2px 6px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.5)',
                            animation: 'fadeInUp 1s ease-out 0.2s both'
                        }}>
                            <span className="relative inline-block group">
                                <span className="relative z-10">Nino Chavez</span>
                                <span
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 2s ease-in-out infinite',
                                        transform: 'skewX(-20deg)',
                                    }}
                                />
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
                                <div className="w-1 h-1 rounded-full bg-white/60" />
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
                                onClick={() => onNavigate('work')}
                                className="group bg-athletic-brand-violet hover:bg-athletic-brand-violet/90 text-white font-bold px-10 py-4 rounded-xl athletic-animate-transition hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 border border-white/20 backdrop-blur-sm hover:backdrop-blur-md active:scale-95"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0px)';
                                }}
                            >
                                <span className="flex items-center justify-center space-x-2">
                                    <span className="text-lg tracking-wide">View Work</span>
                                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>

                            <button
                                onClick={() => onNavigate('contact')}
                                className="group bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white font-bold px-10 py-4 rounded-xl athletic-animate-transition hover:scale-105 hover:bg-white/20 hover:border-white/60 hover:shadow-xl hover:shadow-white/10 active:scale-95"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(255, 255, 255, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0px)';
                                    e.currentTarget.style.boxShadow = '';
                                }}
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

                {/* Technical Profile Sidebar - controlled by extracted hooks */}
                {visibility.profileVisible && (
                    <ViewfinderOverlay
                        isActive={true}
                        mode="hero"
                        showMetadataHUD={true}
                        className="z-30"
                        isMinimized={visibility.profileMinimized}
                        onToggleMinimized={visibility.toggleMinimized}
                        profileVisible={visibility.profileVisible}
                        onHideProfile={() => visibility.setProfileVisible(false)}
                    />
                )}

                {!visibility.profileVisible && (
                    <button
                        onClick={() => visibility.setProfileVisible(true)}
                        className="fixed top-36 left-8 z-30 group bg-athletic-brand-violet/20 hover:bg-athletic-brand-violet/40 backdrop-blur-md border border-athletic-brand-violet/40 text-white rounded-full p-4 athletic-animate-sequence hover:scale-125 hover:shadow-xl hover:shadow-purple-500/30 hover:border-athletic-brand-violet/60"
                        style={{
                            animation: 'fadeInUp 1.2s ease-out 1.5s both, gentleFloat 4s ease-in-out infinite 2s, breathe 3s ease-in-out infinite 3s',
                            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                            display: window.scrollY < window.innerHeight * 0.8 ? 'block' : 'none'
                        }}
                        title="Show Technical Profile"
                        aria-label="Show Technical Profile"
                    >
                        <div className="relative">
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute inset-0 bg-brand-violet/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </button>
                )}
            </section>
        </>
    );
};

export default CleanHeroSection;