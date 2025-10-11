
import React, { useState, useEffect, useCallback } from 'react';
import type { SectionId } from '../../types';
import { SECTIONS } from '../../constants';
import { useAthleticTokens } from '../../../tokens/simple-provider';
import { TechnicalHUD } from '../sports/TechnicalHUD';

interface HeaderProps {
    onNavigate?: (id: SectionId) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    // Start with nav collapsed on mobile, expanded on desktop
    const [showScoreboardNav, setShowScoreboardNav] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768; // Collapsed on mobile (<768px), expanded on desktop
        }
        return false; // Default to collapsed for SSR
    });
    const [currentLayout, setCurrentLayout] = useState<'traditional' | 'canvas' | 'timeline' | 'experimental'>('traditional');
    const [announcement, setAnnouncement] = useState('');
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const menuToggleRef = React.useRef<HTMLButtonElement>(null);
    const mobileMenuRef = React.useRef<HTMLElement>(null);
    const athleticTokens = useAthleticTokens();

    // Detect current layout from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const layoutParam = urlParams.get('layout');
        if (layoutParam === 'canvas') {
            setCurrentLayout('canvas');
        } else if (layoutParam === 'timeline') {
            setCurrentLayout('timeline');
        } else if (layoutParam === 'experimental') {
            setCurrentLayout('experimental');
        } else {
            setCurrentLayout('traditional');
        }
    }, []);

    // Handle layout change
    const handleLayoutChange = useCallback((newLayout: 'traditional' | 'canvas' | 'timeline' | 'experimental') => {
        if (newLayout === currentLayout) return;

        // Progressive Enhancement: Block canvas/timeline on mobile viewports (experimental is responsive)
        const isMobileViewport = window.innerWidth < 768;
        if (isMobileViewport && (newLayout === 'canvas' || newLayout === 'timeline')) {
            console.log('📱 Canvas/Timeline modes unavailable on mobile - use desktop for full experience');
            return;
        }

        // Brief fade transition
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 200ms ease-out';

        setTimeout(() => {
            const url = newLayout === 'traditional'
                ? '/'
                : `/?layout=${newLayout}`;
            window.location.href = url;
        }, 200);
    }, [currentLayout]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle responsive nav state on window resize
    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            // Auto-collapse nav when resizing to mobile, auto-expand when resizing to desktop
            if (isMobile && showScoreboardNav) {
                setShowScoreboardNav(false);
            } else if (!isMobile && !showScoreboardNav) {
                setShowScoreboardNav(true);
            }
        };
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, [showScoreboardNav]);

    // Detect prefers-reduced-motion
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mq.matches);
        const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mq.addEventListener('change', handleChange);
        return () => mq.removeEventListener('change', handleChange);
    }, []);

    // Screen reader announcements for menu state
    useEffect(() => {
        if (showScoreboardNav) {
            setAnnouncement('Navigation menu expanded. 6 navigation items available.');
        } else {
            setAnnouncement('Navigation menu collapsed.');
        }
    }, [showScoreboardNav]);

    // Escape key handler to close mobile menu
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showScoreboardNav) {
                e.preventDefault();
                setShowScoreboardNav(false);
                // Restore focus to toggle button
                menuToggleRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showScoreboardNav]);

    // Focus trap for mobile menu
    useEffect(() => {
        if (!showScoreboardNav || !mobileMenuRef.current) return;

        const menu = mobileMenuRef.current;
        const focusableElements = menu.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift+Tab: if on first element, wrap to last
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable?.focus();
                }
            } else {
                // Tab: if on last element, wrap to first
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
    }, [showScoreboardNav]);

    // Handle HUD navigation
    const handleHUDNavigate = useCallback((sectionId: SectionId) => {
        onNavigate?.(sectionId);
        // Close mobile menu after navigation
        setShowScoreboardNav(false);
        // Restore focus to toggle button
        setTimeout(() => menuToggleRef.current?.focus(), 100);
    }, [onNavigate]);

    // Handle mobile menu toggle with keyboard support
    const handleMenuToggle = useCallback(() => {
        setShowScoreboardNav(!showScoreboardNav);
    }, [showScoreboardNav]);

    const handleMenuToggleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMenuToggle();
        }
        if (e.key === 'Escape' && showScoreboardNav) {
            e.preventDefault();
            setShowScoreboardNav(false);
        }
    }, [handleMenuToggle, showScoreboardNav]);

    // Handle special sections (volleyball-demo, contact)
    const handleSpecialSectionAccess = useCallback((sectionId: SectionId) => {
        onNavigate?.(sectionId);
    }, [onNavigate]);

    return (
        <header
            className={`
                fixed top-0 left-0 right-0 z-30
                transition-all duration-300 ease-out
                pointer-events-none
            `}
            style={{
                background: isScrolled
                    ? 'rgba(15, 23, 42, 0.95)'
                    : 'rgba(0, 0, 0, 0.2)',
                backdropFilter: isScrolled ? 'blur(12px)' : 'blur(4px)',
                borderBottom: isScrolled
                    ? '1px solid rgba(139, 92, 246, 0.2)'
                    : '1px solid transparent',
                boxShadow: isScrolled
                    ? '0 4px 16px rgba(139, 92, 246, 0.2)'
                    : 'none',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            }}
        >
            <div className="container mx-auto px-6 py-4 pointer-events-auto">
                {/* Header content with logo and volleyball navigation */}
                <div className="flex justify-between items-center">
                    {/* Logo - Enhanced with gradient on hover */}
                    <button
                        onClick={() => onNavigate?.('capture')}
                        className="
                            text-2xl font-bold tracking-wider
                            transition-all duration-200 ease-out
                            group relative
                        "
                        style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        <span className="group-hover:scale-105 inline-block transition-transform duration-200">
                            NINO CHAVEZ
                        </span>
                        <div
                            className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                            style={{
                                background: 'linear-gradient(90deg, #f97316 0%, #8b5cf6 100%)'
                            }}
                        />
                    </button>

                    {/* Layout Switcher & Technical HUD Navigation */}
                    <div className="flex items-center gap-6">
                        {/* Layout Switcher - Professional Design */}
                        <div className="hidden lg:flex items-center gap-2">
                            <span className="text-xs text-white/60">View:</span>
                            <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
                                <button
                                    onClick={() => handleLayoutChange('traditional')}
                                    className={`px-4 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                                        currentLayout === 'traditional'
                                            ? 'bg-athletic-brand-violet/30 text-white border border-athletic-brand-violet/50'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                                    aria-label="Traditional layout"
                                    title="Traditional scrolling layout"
                                >
                                    Standard
                                </button>
                                <button
                                    onClick={() => handleLayoutChange('canvas')}
                                    className={`px-4 py-1.5 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1.5 group/canvas ${
                                        currentLayout === 'canvas'
                                            ? 'bg-athletic-brand-violet/30 text-white border border-athletic-brand-violet/50'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                                    aria-label="Canvas layout (experimental)"
                                    title="3D canvas experience - Experimental feature"
                                >
                                    Canvas
                                    <svg
                                        className="w-3 h-3 opacity-60 group-hover/canvas:opacity-100 transition-opacity"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        aria-hidden="true"
                                    >
                                        <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleLayoutChange('timeline')}
                                    className={`px-4 py-1.5 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1.5 group/timeline ${
                                        currentLayout === 'timeline'
                                            ? 'bg-athletic-brand-violet/30 text-white border border-athletic-brand-violet/50'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                                    aria-label="Timeline layout (experimental)"
                                    title="Timeline journey view - Experimental feature"
                                >
                                    Timeline
                                    <svg
                                        className="w-3 h-3 opacity-60 group-hover/timeline:opacity-100 transition-opacity"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        aria-hidden="true"
                                    >
                                        <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleLayoutChange('experimental')}
                                    className={`px-4 py-1.5 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1.5 group/experimental ${
                                        currentLayout === 'experimental'
                                            ? 'bg-athletic-brand-violet/30 text-white border border-athletic-brand-violet/50'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                                    aria-label="Experimental layout - Design themes"
                                    title="6 design themes - Glassmorphism, Neobrutalism, Retrofuturism & more"
                                >
                                    Themes
                                    <svg
                                        className="w-3 h-3 opacity-60 group-hover/experimental:opacity-100 transition-opacity"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        aria-hidden="true"
                                    >
                                        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Desktop HUD */}
                        <div className="hidden md:block">
                            <TechnicalHUD
                                onNavigate={handleHUDNavigate}
                                variant="header"
                            />
                        </div>
                    </div>
                </div>

                {/* Screen reader live region for menu state announcements */}
                <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                    {announcement}
                </div>

                {/* Mobile navigation toggle */}
                <div className="md:hidden mt-2 flex justify-center">
                    <button
                        ref={menuToggleRef}
                        onClick={handleMenuToggle}
                        onKeyDown={handleMenuToggleKeyDown}
                        aria-label={showScoreboardNav ? "Hide navigation menu" : "Show navigation menu"}
                        aria-expanded={showScoreboardNav}
                        aria-controls="mobile-navigation-menu"
                        className="
                            text-white hover:text-white
                            transition-all duration-200 ease-out
                            text-xs font-mono tracking-wider
                            px-4 py-4 rounded-lg
                            border-2
                            focus:outline-none focus:ring-3 focus:ring-brand-violet
                        "
                        style={{
                            background: showScoreboardNav
                                ? 'rgba(139, 92, 246, 0.15)'
                                : 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(8px)',
                            borderColor: showScoreboardNav
                                ? 'rgba(139, 92, 246, 0.4)'
                                : 'rgba(255, 255, 255, 0.2)',
                            boxShadow: showScoreboardNav
                                ? '0 0 0 2px rgba(139, 92, 246, 0.3)'
                                : 'none',
                            minWidth: '44px',
                            minHeight: '44px'
                        }}
                    >
                        {showScoreboardNav ? 'HIDE NAV' : 'SHOW NAV'}
                    </button>
                </div>

                {/* Mobile technical HUD - with slide-in animation */}
                {showScoreboardNav && (
                    <nav
                        ref={mobileMenuRef}
                        id="mobile-navigation-menu"
                        className="md:hidden mt-4 flex justify-center animate-in slide-in-from-top-2 duration-300"
                        style={{
                            animation: prefersReducedMotion ? 'none' : 'slideDown 300ms ease-out'
                        }}
                        aria-label="Mobile navigation menu"
                    >
                        <TechnicalHUD
                            onNavigate={handleHUDNavigate}
                            variant="mobile"
                        />
                    </nav>
                )}

                {/* Animation keyframes */}
                <style>{`
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        </header>
    );
};

export default Header;
