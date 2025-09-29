
import React, { useState, useEffect, useCallback } from 'react';
import type { SectionId } from '../types';
import { SECTIONS } from '../src/constants';
import { useAthleticTokens } from '../tokens/simple-provider';
import { TechnicalHUD } from './TechnicalHUD';

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
                athletic-animate-transition
                pointer-events-none
                ${isScrolled
                    ? 'bg-brand-dark/90 backdrop-blur-md shadow-2xl'
                    : 'bg-black/20 backdrop-blur-sm'
                }
            `}
            style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}
        >
            <div className="container mx-auto px-6 py-4 pointer-events-auto">
                {/* Header content with logo and volleyball navigation */}
                <div className="flex justify-between items-center">
                    {/* Logo - preserved from original */}
                    <button
                        onClick={() => onNavigate('hero')}
                        className="
                            text-2xl font-bold tracking-wider text-white
                            athletic-animate-transition
                            hover:text-athletic-brand-violet hover:scale-105
                        "
                        style={{
                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.8)'
                        }}
                    >
                        NINO CHAVEZ
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
                            text-white/60 hover:text-white/90
                            transition-all duration-200
                            text-xs font-mono tracking-wider
                            px-4 py-2 rounded
                            bg-white/5 hover:bg-white/10
                            border border-white/10 hover:border-white/20
                        "
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
