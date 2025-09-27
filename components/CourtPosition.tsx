import React, { useCallback, useState } from 'react';
import { CourtPositionProps } from '../types';

/**
 * CourtPosition Component
 *
 * Individual volleyball court position indicator that represents a portfolio section.
 * Positioned absolutely within the volleyball court layout.
 *
 * Features:
 * - Athletic design token styling
 * - Interactive hover states with smooth transitions
 * - Accessibility support with ARIA labels
 * - Responsive sizing
 * - Position-specific visual feedback
 */
export function CourtPosition({
    position,
    sectionId,
    coordinates,
    label,
    description,
    isActive,
    isHovered,
    onClick,
    onHover,
    size = 'medium',
    showTooltip = true
}: CourtPositionProps) {
    const [isPressed, setIsPressed] = useState(false);

    // Size-based styling
    const sizeStyles = {
        small: {
            indicator: 'w-8 h-8 text-xs',
            tooltip: 'text-xs px-2 py-1',
            number: 'text-sm'
        },
        medium: {
            indicator: 'w-10 h-10 text-sm',
            tooltip: 'text-sm px-3 py-2',
            number: 'text-base'
        },
        large: {
            indicator: 'w-12 h-12 text-base',
            tooltip: 'text-base px-4 py-2',
            number: 'text-lg'
        }
    };

    const styles = sizeStyles[size];

    const handleClick = useCallback(() => {
        onClick(sectionId);
    }, [onClick, sectionId]);

    const handleMouseEnter = useCallback(() => {
        onHover(position);
    }, [onHover, position]);

    const handleMouseLeave = useCallback(() => {
        onHover(null);
    }, [onHover]);

    const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsPressed(true);
            onClick(sectionId);
        }
    }, [onClick, sectionId]);

    const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            setIsPressed(false);
        }
    }, []);

    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
                left: `${coordinates.x}%`,
                top: `${coordinates.y}%`
            }}
        >
            {/* Position indicator */}
            <button
                className={`
                    ${styles.indicator}
                    relative
                    rounded-full
                    border-2
                    athletic-animate-transition
                    cursor-pointer
                    flex items-center justify-center
                    font-bold
                    shadow-lg
                    backdrop-blur-sm
                    transform
                    transition-all duration-200 ease-athletic-snap

                    ${isActive
                        ? `
                            bg-athletic-court-orange text-white
                            border-athletic-court-orange
                            scale-110 shadow-xl
                            ring-2 ring-athletic-court-orange/30
                        `
                        : isHovered
                        ? `
                            bg-athletic-brand-violet text-white
                            border-athletic-brand-violet
                            scale-105 shadow-xl
                            ring-2 ring-athletic-brand-violet/30
                        `
                        : `
                            bg-athletic-court-navy/80 text-white
                            border-athletic-court-navy
                            hover:scale-105 hover:shadow-xl
                            hover:bg-athletic-brand-violet
                            hover:border-athletic-brand-violet
                            hover:ring-2 hover:ring-athletic-brand-violet/30
                        `
                    }

                    ${isPressed ? 'scale-95' : ''}

                    focus:outline-none
                    focus:ring-2 focus:ring-athletic-court-orange/50
                    focus:ring-offset-2 focus:ring-offset-transparent
                `}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onKeyDown={handleKeyPress}
                onKeyUp={handleKeyUp}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                aria-label={`Navigate to ${label}: ${description}`}
                aria-pressed={isActive}
                role="button"
                tabIndex={0}
            >
                <span className={`${styles.number} font-bold leading-none`}>
                    {position}
                </span>

                {/* Active indicator pulse */}
                {isActive && (
                    <div
                        className="
                            absolute inset-0
                            rounded-full
                            bg-athletic-court-orange/20
                            animate-pulse
                            -z-10
                        "
                        aria-hidden="true"
                    />
                )}
            </button>

            {/* Tooltip */}
            {showTooltip && (isHovered || isActive) && (
                <div
                    className={`
                        absolute
                        ${styles.tooltip}
                        bg-athletic-court-navy/95
                        text-white
                        rounded-lg
                        shadow-xl
                        backdrop-blur-md
                        border border-athletic-court-navy/20
                        whitespace-nowrap
                        pointer-events-none
                        z-50
                        athletic-animate-quick-snap
                        transform transition-all duration-150
                        -translate-x-1/2
                        ${coordinates.y > 50 ? 'bottom-14' : 'top-14'}
                    `}
                    style={{
                        left: '50%',
                    }}
                    role="tooltip"
                    aria-live="polite"
                >
                    <div className="font-semibold text-athletic-court-orange">
                        {label}
                    </div>
                    <div className="text-xs opacity-90 mt-1">
                        Position {position} • {description}
                    </div>

                    {/* Tooltip arrow */}
                    <div
                        className={`
                            absolute left-1/2 transform -translate-x-1/2
                            w-2 h-2 bg-athletic-court-navy/95
                            rotate-45
                            ${coordinates.y > 50 ? '-bottom-1' : '-top-1'}
                        `}
                        aria-hidden="true"
                    />
                </div>
            )}
        </div>
    );
}

export default CourtPosition;