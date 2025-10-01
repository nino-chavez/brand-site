
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
    const athleticTokens = useAthleticTokens();

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
                        onClick={() => onNavigate?.('hero')}
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

                    {/* Technical HUD Navigation */}
                    <div className="flex items-center">
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
