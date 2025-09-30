import React, { useState, useCallback, useEffect } from 'react';
import { VolleyballNavigationProps, VolleyballPosition, SectionId } from '../types';
import { VOLLEYBALL_POSITION_MAPPING, getResponsiveCoordinates } from '../config/volleyball-positions';
import { CourtPosition } from './CourtPosition';
import { RotationControls } from './RotationControls';

/**
 * VolleyballNavigation Component
 *
 * Main navigation component that renders a volleyball court with 6 position indicators.
 * Replaces FloatingNav with sports-inspired navigation metaphor.
 *
 * Features:
 * - 6 court positions mapped to portfolio sections
 * - Direct position click navigation
 * - Clockwise/counterclockwise rotation controls
 * - Responsive design with size variants
 * - Athletic design token integration
 * - Full accessibility support
 */
export function VolleyballNavigation({
    activeSection,
    onNavigate,
    onRotationChange,
    className = '',
    showTooltips = true,
    size = 'medium',
    isVisible = true
}: VolleyballNavigationProps) {
    const [hoveredPosition, setHoveredPosition] = useState<VolleyballPosition | null>(null);
    const [isRotating, setIsRotating] = useState(false);

    // Size-based styling
    const sizeClasses = {
        small: 'w-48 h-48',   // 200px - Mobile
        medium: 'w-60 h-60',  // 240px - Tablet
        large: 'w-70 h-70'    // 280px - Desktop
    };

    const handlePositionClick = useCallback((sectionId: SectionId) => {
        if (!isRotating) {
            onNavigate(sectionId);
        }
    }, [onNavigate, isRotating]);

    const handlePositionHover = useCallback((position: VolleyballPosition | null) => {
        if (!isRotating) {
            setHoveredPosition(position);
        }
    }, [isRotating]);

    const handleRotation = useCallback((direction: 'clockwise' | 'counterclockwise') => {
        setIsRotating(true);
        onRotationChange(direction);

        // Reset rotation state after animation
        setTimeout(() => {
            setIsRotating(false);
            setHoveredPosition(null);
        }, 300); // Match animation duration
    }, [onRotationChange]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isVisible || isRotating) return;

            // Arrow key rotation
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                handleRotation('clockwise');
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                handleRotation('counterclockwise');
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [handleRotation, isVisible, isRotating]);

    // Don't use early return after hooks - handle visibility through conditional rendering
    return (
        <div style={{ display: isVisible ? 'block' : 'none' }}>
        <nav
            className={`
                volleyball-navigation
                ${sizeClasses[size]}
                relative
                transition-all
                athletic-animate-transition
                ${isRotating ? 'opacity-80' : 'opacity-100'}
                ${className}
            `}
            role="navigation"
            aria-label="Volleyball court navigation"
            aria-describedby="volleyball-nav-description"
        >
            {/* Accessibility description */}
            <div
                id="volleyball-nav-description"
                className="sr-only"
            >
                Navigate through portfolio sections using volleyball court positions.
                Use arrow keys to rotate or click positions directly.
            </div>

            {/* Court background */}
            <div
                className="
                    absolute inset-0
                    border-2 border-athletic-court-navy/20
                    rounded-lg
                    bg-athletic-court-navy/5
                    athletic-animate-transition
                    shadow-lg
                    backdrop-blur-sm
                "
                aria-hidden="true"
            >
                {/* Court center line */}
                <div
                    className="
                        absolute
                        left-1/2 top-0 bottom-0
                        w-0.5
                        bg-athletic-court-navy/30
                        transform -translate-x-1/2
                    "
                />

                {/* Attack line indicators */}
                <div
                    className="
                        absolute
                        left-0 right-0
                        top-1/4 h-0.5
                        bg-athletic-court-navy/20
                    "
                />
                <div
                    className="
                        absolute
                        left-0 right-0
                        bottom-1/4 h-0.5
                        bg-athletic-court-navy/20
                    "
                />
            </div>

            {/* Court positions */}
            {Object.entries(VOLLEYBALL_POSITION_MAPPING).map(([positionStr, config]) => {
                const position = parseInt(positionStr) as VolleyballPosition;
                const coordinates = getResponsiveCoordinates(position, size);
                const isActive = config.sectionId === activeSection;
                const isHovered = hoveredPosition === position;

                return (
                    <CourtPosition
                        key={position}
                        position={position}
                        sectionId={config.sectionId}
                        coordinates={coordinates}
                        label={config.label}
                        description={config.description}
                        isActive={isActive}
                        isHovered={isHovered}
                        onClick={handlePositionClick}
                        onHover={handlePositionHover}
                        size={size}
                        showTooltip={showTooltips}
                    />
                );
            })}

            {/* Rotation controls */}
            <RotationControls
                onRotate={handleRotation}
                disabled={isRotating}
                size={size}
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
            />
        </nav>
        </div>
    );
}

export default VolleyballNavigation;