import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    VolleyballNavigationHookProps,
    VolleyballNavigationHookReturn,
    CourtPosition,
    VolleyballPosition,
    SectionId
} from '../types';
import {
    VOLLEYBALL_POSITION_MAPPING,
    getPositionBySection,
    getSectionByPosition,
    getNextPosition,
    getPreviousPosition,
    getResponsiveCoordinates
} from '../config/volleyball-positions';

/**
 * useVolleyballNavigation Hook
 *
 * Centralized state management for volleyball court navigation.
 * Handles position tracking, rotation logic, and keyboard navigation.
 *
 * Features:
 * - Position state management with active tracking
 * - Clockwise/counterclockwise rotation logic
 * - Keyboard navigation support
 * - Section-to-position synchronization
 * - Performance optimized with memoization
 */
export function useVolleyballNavigation({
    initialSection = 'hero',
    onSectionChange,
    enableKeyboardNavigation = true
}: VolleyballNavigationHookProps = {}): VolleyballNavigationHookReturn {
    // State management
    const [activeSection, setActiveSection] = useState<SectionId>(initialSection);
    const [currentRotation, setCurrentRotation] = useState<number>(0);
    const [isRotating, setIsRotating] = useState(false);
    const [hoveredPosition, setHoveredPosition] = useState<VolleyballPosition | null>(null);

    // Memoized court positions with current state
    const positions = useMemo((): CourtPosition[] => {
        return Object.entries(VOLLEYBALL_POSITION_MAPPING).map(([posStr, config]) => {
            const position = parseInt(posStr) as VolleyballPosition;
            return {
                position,
                sectionId: config.sectionId,
                coordinates: config.coordinates,
                label: config.label,
                description: config.description,
                isActive: config.sectionId === activeSection
            };
        });
    }, [activeSection]);

    // Current active position derived from active section
    const activePosition = useMemo((): VolleyballPosition => {
        return getPositionBySection(activeSection) || 1;
    }, [activeSection]);

    // Navigate to specific section
    const navigateToSection = useCallback((sectionId: SectionId) => {
        if (isRotating) return;

        setActiveSection(sectionId);

        // Calculate rotation needed for smooth transition
        const targetPosition = getPositionBySection(sectionId);
        if (targetPosition) {
            const rotationAngle = (targetPosition - 1) * 60; // 60 degrees per position
            setCurrentRotation(rotationAngle);
        }

        // Call external section change handler
        if (onSectionChange) {
            onSectionChange(sectionId);
        }
    }, [isRotating, onSectionChange]);

    // Rotate positions (clockwise/counterclockwise)
    const rotatePositions = useCallback((direction: 'clockwise' | 'counterclockwise') => {
        if (isRotating) return;

        setIsRotating(true);

        const currentPosition = activePosition;
        const nextPosition = direction === 'clockwise'
            ? getNextPosition(currentPosition)
            : getPreviousPosition(currentPosition);

        const nextSection = getSectionByPosition(nextPosition);
        if (nextSection) {
            // Update rotation angle for smooth animation
            const rotationIncrement = direction === 'clockwise' ? 60 : -60;
            setCurrentRotation(prev => prev + rotationIncrement);

            // Update active section
            setActiveSection(nextSection);

            // Call external section change handler
            if (onSectionChange) {
                onSectionChange(nextSection);
            }
        }

        // Reset rotation state after animation completes
        setTimeout(() => {
            setIsRotating(false);
            setHoveredPosition(null);
        }, 300); // Match CSS animation duration
    }, [activePosition, isRotating, onSectionChange]);

    // Update active section from external sources (e.g., scroll spy)
    const updateActiveSection = useCallback((sectionId: SectionId) => {
        if (isRotating) return;

        setActiveSection(sectionId);

        // Update rotation to match new section without animation
        const position = getPositionBySection(sectionId);
        if (position) {
            const rotationAngle = (position - 1) * 60;
            setCurrentRotation(rotationAngle);
        }
    }, [isRotating]);

    // Set hovered position
    const setHoveredPositionHandler = useCallback((position: VolleyballPosition | null) => {
        if (!isRotating) {
            setHoveredPosition(position);
        }
    }, [isRotating]);

    // Keyboard navigation
    useEffect(() => {
        if (!enableKeyboardNavigation) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (isRotating) return;

            // Handle volleyball-specific navigation
            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    event.preventDefault();
                    rotatePositions('clockwise');
                    break;

                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    rotatePositions('counterclockwise');
                    break;

                // Direct position navigation (1-6 keys)
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    if (event.ctrlKey || event.metaKey) { // Only with modifier keys
                        event.preventDefault();
                        const position = parseInt(event.key) as VolleyballPosition;
                        const section = getSectionByPosition(position);
                        if (section) {
                            navigateToSection(section);
                        }
                    }
                    break;

                // Home position (go to position 1)
                case 'Home':
                    event.preventDefault();
                    navigateToSection('hero');
                    break;

                // End position (go to position 6)
                case 'End':
                    event.preventDefault();
                    navigateToSection('reel');
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [enableKeyboardNavigation, isRotating, rotatePositions, navigateToSection]);

    // Performance optimization: throttle rotation updates
    useEffect(() => {
        if (isRotating) {
            // Ensure rotation state doesn't get stuck
            const timeout = setTimeout(() => {
                setIsRotating(false);
            }, 1000); // Failsafe timeout

            return () => clearTimeout(timeout);
        }
    }, [isRotating]);

    return {
        positions,
        activePosition,
        currentRotation,
        isRotating,
        hoveredPosition,
        navigateToSection,
        rotatePositions,
        setHoveredPosition: setHoveredPositionHandler,
        updateActiveSection
    };
}

export default useVolleyballNavigation;