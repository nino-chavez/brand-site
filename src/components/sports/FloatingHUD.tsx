import React from 'react';
import { SectionId } from '../types';
import { TechnicalHUD } from './TechnicalHUD';

interface FloatingHUDProps {
    activeSection: SectionId;
    onNavigate: (sectionId: SectionId) => void;
    className?: string;
}

/**
 * FloatingHUD Component
 *
 * Right-side floating HUD navigation - clean replacement for FloatingScoreboard.
 * Uses the Technical HUD but optimized for floating position with professional styling.
 *
 * Features:
 * - Fixed position on right side of screen
 * - Minimal, professional design
 * - Technical HUD aesthetic with subtle backdrop
 * - Responsive visibility controls
 */
export function FloatingHUD({
    activeSection,
    onNavigate,
    className = ''
}: FloatingHUDProps) {
    return (
        <div
            className={`
                fixed right-6 top-1/2 transform -translate-y-1/2
                z-30
                hidden lg:block
                ${className}
            `}
        >
            <TechnicalHUD
                activeSection={activeSection}
                onNavigate={onNavigate}
                variant="floating"
            />

            {/* Subtle glow effect for floating version */}
            <div
                className="
                    absolute inset-0 -z-10
                    bg-brand-violet/5
                    rounded-lg blur-xl
                    scale-110
                "
                aria-hidden="true"
            />
        </div>
    );
}

export default FloatingHUD;