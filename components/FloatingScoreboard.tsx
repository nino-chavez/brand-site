import React from 'react';
import { SectionId } from '../types';
import { AthleticScoreboard } from './AthleticScoreboard';

interface FloatingScoreboardProps {
    activeSection: SectionId;
    onNavigate: (sectionId: SectionId) => void;
    className?: string;
}

/**
 * FloatingScoreboard Component
 *
 * Right-side floating scoreboard navigation - a modern replacement for FloatingNav
 * Uses the Athletic Scoreboard but optimized for floating position.
 *
 * Features:
 * - Fixed position on right side of screen
 * - Compact floating design
 * - Same intuitive athletic scoreboard aesthetic
 * - Responsive visibility controls
 */
export function FloatingScoreboard({
    activeSection,
    onNavigate,
    className = ''
}: FloatingScoreboardProps) {
    return (
        <div
            className={`
                fixed right-6 top-1/2 transform -translate-y-1/2
                z-30
                hidden lg:block
                ${className}
            `}
        >
            <div className="transform rotate-0">
                <AthleticScoreboard
                    activeSection={activeSection}
                    onNavigate={onNavigate}
                    variant="floating"
                    showIcons={false} // Cleaner for floating
                />
            </div>

            {/* Optional: Add a subtle shadow/glow effect */}
            <div
                className="
                    absolute inset-0 -z-10
                    bg-athletic-court-navy/5
                    rounded-lg blur-xl
                    scale-110
                "
                aria-hidden="true"
            />
        </div>
    );
}

export default FloatingScoreboard;