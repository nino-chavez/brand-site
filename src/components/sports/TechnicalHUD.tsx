import React, { useState, useCallback } from 'react';
import { SectionId } from '../../types';

interface TechnicalHUDProps {
    onNavigate: (sectionId: SectionId) => void;
    className?: string;
    variant?: 'header' | 'floating' | 'mobile';
}

/**
 * Technical HUD Navigation
 *
 * Professional navigation inspired by camera HUD interfaces and technical dashboards.
 * Clean, direct labels with subtle technical details that enhance the professional aesthetic.
 *
 * Features:
 * - Direct, clear section names without metaphors
 * - Technical hover states with relevant metrics
 * - Progressive disclosure - minimal by default, detailed on hover
 * - Monospace accents matching the site's technical theme
 * - Subtle animations that feel premium, not gimmicky
 */
export function TechnicalHUD({
    onNavigate,
    className = '',
    variant = 'header'
}: TechnicalHUDProps) {
    const [hoveredSection, setHoveredSection] = useState<SectionId | null>(null);

    // Navigation sections with technical metadata
    // Uses unified photography metaphor IDs (SectionId)
    // Display labels provide user-friendly navigation names
    const hudSections = [
        {
            id: 'capture' as SectionId,
            label: 'HOME',
            metric: 'Load Time: 0.8s',
            description: 'Portfolio entry point'
        },
        {
            id: 'focus' as SectionId,
            label: 'ABOUT',
            metric: 'Experience: 20+ Years',
            description: 'Professional background'
        },
        {
            id: 'frame' as SectionId,
            label: 'WORK',
            metric: 'Scale: Enterprise',
            description: 'Project portfolio'
        },
        {
            id: 'exposure' as SectionId,
            label: 'ESSAYS',
            metric: 'Focus: Technical',
            description: 'Articles & thoughts'
        },
        {
            id: 'develop' as SectionId,
            label: 'GALLERY',
            metric: 'Format: Professional',
            description: 'Photography portfolio'
        },
        {
            id: 'volleyball-demo' as SectionId,
            label: 'TECH STACK',
            metric: 'Type: Interactive',
            description: 'Architecture demo'
        },
        {
            id: 'portfolio' as SectionId,
            label: 'CONTACT',
            metric: 'Status: Available',
            description: 'Get in touch'
        }
    ];

    const handleSectionClick = useCallback((sectionId: SectionId) => {
        onNavigate(sectionId);
    }, [onNavigate]);

    const handleSectionHover = useCallback((sectionId: SectionId | null) => {
        setHoveredSection(sectionId);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent, sectionId: SectionId) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSectionClick(sectionId);
        }
    }, [handleSectionClick]);

    // Variant-specific styling
    const variantClasses = {
        header: 'px-0 py-0',
        floating: 'px-4 py-3 rounded-lg bg-brand-dark/95 backdrop-blur-md border border-white/10',
        mobile: 'px-4 py-3 rounded-md bg-brand-dark/90'
    };

    const itemClasses = {
        header: 'px-4 py-2 text-sm font-medium',
        floating: 'px-3 py-2 text-sm font-medium',
        mobile: 'px-4 py-3 text-base font-medium'
    };

    return (
        <nav
            className={`
                technical-hud
                ${variantClasses[variant]}
                ${className}
            `}
            role="navigation"
            aria-label="Technical HUD navigation"
        >
            <div
                className={`
                    flex items-center gap-1
                    ${variant === 'mobile' ? 'flex-col gap-2' : 'flex-row'}
                `}
            >
                {hudSections.map((section) => {
                    const isHovered = section.id === hoveredSection;
                    const isExternalLink = section.id === 'volleyball-demo';

                    // Use <a> tag for external link, <button> for section navigation
                    const Element = isExternalLink ? 'a' : 'button';
                    const elementProps = isExternalLink
                        ? { href: '/demo' }
                        : {
                            onClick: () => handleSectionClick(section.id),
                            onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, section.id)
                          };

                    return (
                        <div key={section.id} className="relative">
                            <Element
                                {...elementProps}
                                onMouseEnter={() => handleSectionHover(section.id)}
                                onMouseLeave={() => handleSectionHover(null)}
                                onFocus={() => handleSectionHover(section.id)}
                                onBlur={() => handleSectionHover(null)}
                                className={`
                                    ${itemClasses[variant]}
                                    relative
                                    font-mono text-xs tracking-wider
                                    transition-all duration-200 ease-out
                                    border rounded

                                    ${isHovered ? (
                                        // Hovered/focused state with cyan preview + subtle forward motion
                                        `text-white bg-cyan-500/10 border-cyan-400/40
                                         shadow-[0_0_16px_rgba(6,182,212,0.3),0_0_0_1px_rgba(6,182,212,0.2)]
                                         translate-x-0.5`
                                    ) : (
                                        // Default state with hover effects
                                        `text-white bg-transparent border-transparent
                                         hover:text-white hover:bg-white/5 hover:border-white/20 hover:translate-x-0.5`
                                    )}

                                    active:scale-95 active:bg-white/10
                                    focus:outline-none focus:ring-3 focus:ring-brand-violet
                                `}
                                style={{
                                    minWidth: variant === 'mobile' ? '44px' : 'auto',
                                    minHeight: variant === 'mobile' ? '44px' : 'auto'
                                }}
                                aria-label={`Navigate to ${section.description}`}
                            >
                                {section.label}
                            </Element>

                            {/* Technical hover overlay - positioned below with enhanced styling */}
                            {isHovered && variant !== 'mobile' && (
                                <div
                                    className="
                                        absolute top-full mt-2 left-1/2 transform -translate-x-1/2
                                        glass-dark
                                        border border-cyan-400/30
                                        rounded-lg px-3 py-2
                                        pointer-events-none
                                        z-[60]
                                        min-w-max
                                        whitespace-nowrap
                                        animate-fade-in-up
                                    "
                                    role="tooltip"
                                    style={{
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3), 0 0 0 1px rgba(6, 182, 212, 0.2)'
                                    }}
                                >
                                    {/* Tooltip arrow pointing up */}
                                    <div
                                        className="
                                            absolute -top-1 left-1/2 transform -translate-x-1/2
                                            w-2 h-2 bg-brand-dark/95 border-l border-t border-cyan-400/30
                                            rotate-45
                                        "
                                        aria-hidden="true"
                                    />

                                    <div className="text-xs font-mono text-gradient-orange font-medium">
                                        {section.metric}
                                    </div>
                                    <div className="text-xs text-white/70 mt-1">
                                        {section.description}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

        </nav>
    );
}

export default TechnicalHUD;