
import React, { useState, useEffect, useCallback } from 'react';
import type { SectionId } from '../../types';
import { SECTIONS } from '../../constants';
import { useAthleticTokens } from '../../../tokens/simple-provider';
import { TechnicalHUD } from '../sports/TechnicalHUD';

interface HeaderProps {
    onNavigate?: (id: SectionId) => void;
    activeSection?: string | null;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, activeSection }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showScoreboardNav, setShowScoreboardNav] = useState(true);
    const [currentLayout, setCurrentLayout] = useState<'traditional' | 'canvas'>('traditional');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const athleticTokens = useAthleticTokens();

    // Detect current layout from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const layoutParam = urlParams.get('layout');
        setCurrentLayout(layoutParam === 'canvas' ? 'canvas' : 'traditional');
    }, []);

    // Handle layout toggle
    const handleLayoutToggle = useCallback(() => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        const newLayout = currentLayout === 'traditional' ? 'canvas' : 'traditional';

        // Smooth transition
        const urlParams = new URLSearchParams(window.location.search);
        if (newLayout === 'canvas') {
            urlParams.set('layout', 'canvas');
        } else {
            urlParams.delete('layout');
        }

        // Update URL and reload with transition
        const newUrl = urlParams.toString()
            ? `${window.location.pathname}?${urlParams.toString()}`
            : window.location.pathname;

        // Brief fade transition
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 200ms ease-out';

        setTimeout(() => {
            window.location.href = newUrl;
        }, 200);
    }, [currentLayout, isTransitioning]);

    // Keyboard shortcut (L key)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'l' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                // Only trigger if not in input/textarea
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    handleLayoutToggle();
                }
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [handleLayoutToggle]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle HUD navigation
    const handleHUDNavigate = useCallback((sectionId: SectionId) => {
        onNavigate?.(sectionId);
    }, [onNavigate]);

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

                    {/* Layout Toggle & Technical HUD Navigation */}
                    <div className="flex items-center gap-6">
                        {/* Layout Toggle */}
                        <button
                            onClick={handleLayoutToggle}
                            disabled={isTransitioning}
                            className="
                                group relative flex items-center gap-2
                                px-4 py-2 rounded-lg
                                transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                            style={{
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                backdropFilter: 'blur(8px)'
                            }}
                            aria-label={`Switch to ${currentLayout === 'traditional' ? 'canvas' : 'traditional'} layout`}
                            title={`Switch to ${currentLayout === 'traditional' ? 'Canvas' : 'Traditional'} view (press L)`}
                        >
                            {/* Traditional Icon (Grid) */}
                            <svg
                                className={`w-5 h-5 transition-all duration-200 ${
                                    currentLayout === 'traditional'
                                        ? 'text-athletic-brand-violet scale-110'
                                        : 'text-white/40 scale-90'
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>

                            {/* Separator */}
                            <div
                                className="h-6 w-px"
                                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                            />

                            {/* Canvas Icon (3D Cube) */}
                            <svg
                                className={`w-5 h-5 transition-all duration-200 ${
                                    currentLayout === 'canvas'
                                        ? 'text-athletic-brand-violet scale-110'
                                        : 'text-white/40 scale-90'
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>

                            {/* Tooltip hint on hover */}
                            <span
                                className="
                                    absolute -bottom-8 left-1/2 -translate-x-1/2
                                    px-2 py-1 rounded text-xs whitespace-nowrap
                                    opacity-0 group-hover:opacity-100
                                    pointer-events-none
                                    transition-opacity duration-200
                                "
                                style={{
                                    background: 'rgba(0, 0, 0, 0.9)',
                                    color: 'white'
                                }}
                            >
                                {currentLayout === 'traditional' ? 'Canvas View' : 'Traditional View'}
                            </span>
                        </button>

                        {/* Desktop HUD */}
                        <div className="hidden md:block">
                            <TechnicalHUD
                                activeSection={activeSection as SectionId}
                                onNavigate={handleHUDNavigate}
                                variant="header"
                            />
                        </div>

                    </div>
                </div>

                {/* Mobile navigation toggle */}
                <div className="md:hidden mt-2 flex justify-center">
                    <button
                        onClick={() => setShowScoreboardNav(!showScoreboardNav)}
                        className="
                            text-white/80 hover:text-white
                            transition-all duration-200 ease-out
                            text-xs font-mono tracking-wider
                            px-4 py-2 rounded-lg
                            border-2
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
                                : 'none'
                        }}
                    >
                        {showScoreboardNav ? '▲ HIDE NAV' : '▼ SHOW NAV'}
                    </button>
                </div>

                {/* Mobile technical HUD */}
                {showScoreboardNav && (
                    <div className="md:hidden mt-4 flex justify-center">
                        <TechnicalHUD
                            activeSection={activeSection as SectionId}
                            onNavigate={handleHUDNavigate}
                            variant="mobile"
                        />
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
