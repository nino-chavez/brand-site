
import { useState, useEffect, useCallback } from 'react';
import { SectionId, VolleyballPosition } from '../types';
import { getPositionBySection, VOLLEYBALL_POSITION_MAPPING } from '../config/volleyball-positions';

/**
 * Enhanced useScrollSpy hook with volleyball navigation support
 *
 * Features:
 * - Original intersection observer functionality
 * - Volleyball position tracking
 * - Section change callbacks
 * - Multiple active section handling
 * - Performance optimized with threshold detection
 */

interface UseScrollSpyOptions extends IntersectionObserverInit {
    onSectionChange?: (sectionId: SectionId, position: VolleyballPosition | null) => void;
    enableVolleyballTracking?: boolean;
}

interface UseScrollSpyReturn {
    activeSection: string | null;
    currentVolleyballPosition: VolleyballPosition | null;
    isValidVolleyballSection: boolean;
    updateActiveSection: (sectionId: SectionId) => void;
}

const useScrollSpy = (
    elements: HTMLElement[],
    options: UseScrollSpyOptions = {}
): UseScrollSpyReturn => {
    const {
        onSectionChange,
        enableVolleyballTracking = true,
        ...intersectionOptions
    } = options;

    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [currentVolleyballPosition, setCurrentVolleyballPosition] = useState<VolleyballPosition | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Update active section programmatically (for navigation clicks)
    const updateActiveSection = useCallback((sectionId: SectionId) => {
        setActiveSection(sectionId);
        setIsNavigating(true);

        // Use shorter, more precise timing for navigation state
        setTimeout(() => {
            setIsNavigating(false);
        }, 600); // Shorter delay, matching typical smooth scroll duration

        if (enableVolleyballTracking) {
            const position = getPositionBySection(sectionId);
            setCurrentVolleyballPosition(position);

            if (onSectionChange && position) {
                onSectionChange(sectionId, position);
            }
        }
    }, [enableVolleyballTracking, onSectionChange]);

    // Check if current section maps to volleyball position
    const isValidVolleyballSection = Boolean(
        activeSection &&
        enableVolleyballTracking &&
        getPositionBySection(activeSection as SectionId)
    );

    // Improved section detection based on scroll position
    const getCurrentSection = useCallback(() => {
        if (elements.length === 0) return null;

        const scrollPosition = window.scrollY + window.innerHeight * 0.3; // 30% from top of viewport

        let currentSection = null;
        let minDistance = Infinity;

        elements.forEach(element => {
            if (element) {
                const rect = element.getBoundingClientRect();
                const elementTop = rect.top + window.scrollY;
                const distance = Math.abs(scrollPosition - elementTop);

                if (distance < minDistance) {
                    minDistance = distance;
                    currentSection = element.id as SectionId;
                }
            }
        });

        return currentSection;
    }, [elements]);

    // Initialize active section on mount and handle scroll updates
    useEffect(() => {
        if (elements.length === 0) return;

        // Set initial active section on page load
        if (!hasInitialized) {
            const initialSection = getCurrentSection() || 'hero';
            setActiveSection(initialSection);
            setHasInitialized(true);

            if (enableVolleyballTracking) {
                const position = getPositionBySection(initialSection);
                setCurrentVolleyballPosition(position);
            }
        }

        // Enhanced scroll handler that's more responsive
        const handleScroll = () => {
            // Skip updates during navigation to prevent conflicts
            if (isNavigating) return;

            const currentSection = getCurrentSection();
            if (currentSection && currentSection !== activeSection) {
                setActiveSection(currentSection);

                if (enableVolleyballTracking) {
                    const position = getPositionBySection(currentSection);
                    setCurrentVolleyballPosition(position);

                    if (onSectionChange) {
                        onSectionChange(currentSection, position);
                    }
                }
            }
        };

        // Use throttled scroll handler for better performance
        let scrollTimer: NodeJS.Timeout | null = null;
        const throttledScrollHandler = () => {
            if (scrollTimer) return;

            scrollTimer = setTimeout(() => {
                handleScroll();
                scrollTimer = null;
            }, 50); // 20fps, responsive but not excessive
        };

        window.addEventListener('scroll', throttledScrollHandler, { passive: true });

        return () => {
            window.removeEventListener('scroll', throttledScrollHandler);
            if (scrollTimer) clearTimeout(scrollTimer);
        };
    }, [elements, enableVolleyballTracking, onSectionChange, isNavigating, hasInitialized, activeSection, getCurrentSection]);

    return {
        activeSection,
        currentVolleyballPosition,
        isValidVolleyballSection,
        updateActiveSection
    };
};

// Legacy default export for backwards compatibility
export default useScrollSpy;

// Enhanced export with volleyball navigation capabilities
export { useScrollSpy };
