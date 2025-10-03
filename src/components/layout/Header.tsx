
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
    const [currentLayout, setCurrentLayout] = useState<'traditional' | 'canvas' | 'timeline'>('traditional');
    const athleticTokens = useAthleticTokens();

    // Detect current layout from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const layoutParam = urlParams.get('layout');
        if (layoutParam === 'canvas') {
            setCurrentLayout('canvas');
        } else if (layoutParam === 'timeline') {
            setCurrentLayout('timeline');
        } else {
            setCurrentLayout('traditional');
        }
    }, []);

    // Handle layout change
    const handleLayoutChange = useCallback((newLayout: 'traditional' | 'canvas' | 'timeline') => {
        if (newLayout === currentLayout) return;

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

                    {/* Layout Switcher & Technical HUD Navigation */}
                    <div className="flex items-center gap-6">
                        {/* Layout Switcher Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-white/60 hidden sm:inline">Layout:</span>
                            <select
                                value={currentLayout}
                                onChange={(e) => handleLayoutChange(e.target.value as 'traditional' | 'canvas' | 'timeline')}
                                className="
                                    px-3 py-1.5 rounded text-sm font-medium
                                    transition-all duration-200
                                    cursor-pointer
                                "
                                style={{
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: '1px solid rgba(139, 92, 246, 0.5)',
                                    color: 'white',
                                    fontWeight: '500'
                                }}
                                aria-label="Switch layout view"
                            >
                                <option value="traditional">📄 Traditional</option>
                                <option value="canvas">🗺️ Canvas</option>
                                <option value="timeline">🎞️ Timeline</option>
                            </select>
                        </div>

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

                {/* Mobile technical HUD - with slide-in animation */}
                {showScoreboardNav && (
                    <div
                        className="md:hidden mt-4 flex justify-center animate-in slide-in-from-top-2 duration-300"
                        style={{
                            animation: 'slideDown 300ms ease-out'
                        }}
                    >
                        <TechnicalHUD
                            activeSection={activeSection as SectionId}
                            onNavigate={handleHUDNavigate}
                            variant="mobile"
                        />
                    </div>
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
