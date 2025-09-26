import React, { useState, useCallback } from 'react';
import { SectionId } from '../types';
import { SECTIONS } from '../constants';

interface AthleticScoreboardProps {
    activeSection: SectionId;
    onNavigate: (sectionId: SectionId) => void;
    className?: string;
    showIcons?: boolean;
    variant?: 'header' | 'floating' | 'mobile';
}

/**
 * Athletic Scoreboard Navigation
 *
 * Sports scoreboard-inspired navigation that's immediately intuitive.
 * Clear section names with athletic styling - no decoding required.
 *
 * Features:
 * - Scoreboard aesthetic with athletic design tokens
 * - Clear, direct section labels
 * - Hover animations like live sports stats
 * - Mobile responsive with vertical stacking
 * - Athletic icons for visual context
 */
export function AthleticScoreboard({
    activeSection,
    onNavigate,
    className = '',
    showIcons = true,
    variant = 'header'
}: AthleticScoreboardProps) {
    const [hoveredSection, setHoveredSection] = useState<SectionId | null>(null);

    // Athletic section mapping with clear icons and consistent descriptions
    const athleticSections = [
        {
            id: 'hero' as SectionId,
            label: 'HOME',
            icon: '🎯',
            description: 'Portfolio home'
        },
        {
            id: 'about' as SectionId,
            label: 'ABOUT',
            icon: '👨‍💻',
            description: 'About Nino'
        },
        {
            id: 'work' as SectionId,
            label: 'WORK',
            icon: '🚀',
            description: 'Projects & experience'
        },
        {
            id: 'insights' as SectionId,
            label: 'INSIGHTS',
            icon: '💡',
            description: 'Technical articles'
        },
        {
            id: 'gallery' as SectionId,
            label: 'GALLERY',
            icon: '📷',
            description: 'Photography portfolio'
        },
        {
            id: 'reel' as SectionId,
            label: 'REEL',
            icon: '🎥',
            description: 'Video content'
        }
    ];

    const handleSectionClick = useCallback((sectionId: SectionId) => {
        onNavigate(sectionId);
    }, [onNavigate]);

    const handleSectionHover = useCallback((sectionId: SectionId | null) => {
        setHoveredSection(sectionId);
    }, []);

    // Variant-specific styling
    const variantClasses = {
        header: 'px-6 py-3 rounded-lg shadow-lg',
        floating: 'px-4 py-2 rounded-full shadow-xl',
        mobile: 'px-4 py-2 rounded-md'
    };

    const itemClasses = {
        header: 'px-4 py-2 text-sm font-bold',
        floating: 'px-3 py-1 text-xs font-semibold',
        mobile: 'px-3 py-2 text-sm font-bold'
    };

    return (
        <nav
            className={`
                athletic-scoreboard
                ${variantClasses[variant]}
                bg-athletic-court-navy/90
                backdrop-blur-md
                border border-athletic-court-navy/20
                athletic-animate-transition
                ${className}
            `}
            role="navigation"
            aria-label="Athletic scoreboard navigation"
        >
            {/* Scoreboard header */}
            <div className="flex items-center justify-center mb-2">
                <div className="text-xs font-mono text-athletic-court-orange/80 tracking-wider">
                    PORTFOLIO SCOREBOARD
                </div>
            </div>

            {/* Navigation items */}
            <div
                className={`
                    flex items-center justify-center gap-1
                    ${variant === 'mobile' ? 'flex-col' : 'flex-row'}
                `}
            >
                {athleticSections.map((section) => {
                    const isActive = section.id === activeSection;
                    const isHovered = section.id === hoveredSection;

                    return (
                        <button
                            key={section.id}
                            onClick={() => handleSectionClick(section.id)}
                            onMouseEnter={() => handleSectionHover(section.id)}
                            onMouseLeave={() => handleSectionHover(null)}
                            className={`
                                ${itemClasses[variant]}
                                relative
                                rounded
                                athletic-animate-transition
                                transform transition-all duration-200
                                flex items-center gap-2
                                min-w-0 text-center

                                ${isActive
                                    ? `
                                        bg-athletic-court-orange text-white
                                        scale-105 shadow-lg
                                        ring-2 ring-athletic-court-orange/30
                                    `
                                    : isHovered
                                    ? `
                                        bg-athletic-brand-violet text-white
                                        scale-102 shadow-md
                                        ring-1 ring-athletic-brand-violet/40
                                    `
                                    : `
                                        text-white/90 hover:text-white
                                        hover:bg-athletic-court-navy/40
                                        hover:scale-102
                                    `
                                }

                                focus:outline-none
                                focus:ring-2 focus:ring-athletic-court-orange/50
                                focus:ring-offset-2 focus:ring-offset-transparent
                            `}
                            aria-label={`Navigate to ${section.description}`}
                            title={section.description}
                        >
                            {/* Icon */}
                            {showIcons && (
                                <span
                                    className={`
                                        text-base leading-none
                                        ${variant === 'floating' ? 'text-sm' : 'text-base'}
                                        ${variant === 'mobile' ? 'text-lg' : ''}
                                    `}
                                    aria-hidden="true"
                                >
                                    {section.icon}
                                </span>
                            )}

                            {/* Label */}
                            <span className="font-mono tracking-wide">
                                {section.label}
                            </span>

                            {/* Active indicator (like live score highlight) */}
                            {isActive && (
                                <>
                                    <div
                                        className="
                                            absolute inset-0
                                            bg-athletic-court-orange/20
                                            rounded animate-pulse
                                            -z-10
                                        "
                                        aria-hidden="true"
                                    />
                                    <div
                                        className="
                                            absolute -top-1 -right-1
                                            w-2 h-2 rounded-full
                                            bg-athletic-court-orange
                                            animate-pulse
                                        "
                                        aria-hidden="true"
                                    />
                                </>
                            )}

                            {/* Hover stats tooltip */}
                            {isHovered && variant !== 'mobile' && (
                                <div
                                    className="
                                        absolute -top-8 left-1/2 transform -translate-x-1/2
                                        bg-athletic-court-navy/95 text-white
                                        text-xs px-2 py-1 rounded
                                        whitespace-nowrap pointer-events-none
                                        shadow-lg backdrop-blur-sm
                                        z-50
                                    "
                                    role="tooltip"
                                >
                                    {section.description}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Scoreboard footer - game status */}
            <div className="flex items-center justify-center mt-2">
                <div className="flex items-center gap-2 text-xs text-athletic-brand-violet/60">
                    <div className="w-1 h-1 rounded-full bg-athletic-court-orange animate-pulse" />
                    <span className="font-mono">LIVE PORTFOLIO</span>
                </div>
            </div>
        </nav>
    );
}

export default AthleticScoreboard;