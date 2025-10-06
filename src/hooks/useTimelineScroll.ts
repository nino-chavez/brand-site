/**
 * useTimelineScroll - Vertical-then-Horizontal Scroll Pattern
 *
 * Implements intuitive scroll behavior for timeline layout:
 * 1. Scroll down within section (vertical)
 * 2. At section bottom → transition to next section (horizontal)
 * 3. New section starts at top → repeat
 *
 * @fileoverview Section-aware scroll controller with smooth transitions
 * @version 1.0.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface TimelineScrollState {
  currentSectionIndex: number;
  isAtSectionBottom: boolean;
  isAtSectionTop: boolean;
  scrollProgress: number; // 0-1 within current section
  isTransitioning: boolean;
}

export interface UseTimelineScrollOptions {
  totalSections: number;
  onSectionChange?: (newIndex: number, direction: 'forward' | 'backward') => void;
  transitionDuration?: number; // ms
  scrollThreshold?: number; // px from bottom to trigger transition
}

export const useTimelineScroll = ({
  totalSections,
  onSectionChange,
  transitionDuration = 800,
  scrollThreshold = 50
}: UseTimelineScrollOptions) => {
  const [state, setState] = useState<TimelineScrollState>({
    currentSectionIndex: 0,
    isAtSectionBottom: false,
    isAtSectionTop: true,
    scrollProgress: 0,
    isTransitioning: false
  });

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollAccumulator = useRef(0);
  const lastScrollY = useRef(0);
  const transitionTimeout = useRef<number>();

  /**
   * Register a section element for scroll tracking
   */
  const registerSection = useCallback((index: number, element: HTMLElement | null) => {
    sectionRefs.current[index] = element;
  }, []);

  /**
   * Calculate scroll metrics for current section
   * Uses document coordinates (not viewport-relative)
   */
  const calculateScrollMetrics = useCallback((sectionIndex: number): Partial<TimelineScrollState> => {
    const section = sectionRefs.current[sectionIndex];
    if (!section) return {};

    // Use document coordinates, not viewport coordinates
    const windowScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const sectionTop = section.offsetTop; // Distance from document top
    const sectionHeight = section.scrollHeight; // Total content height
    const viewportHeight = window.innerHeight;

    // How far we've scrolled within this section (can be negative if section not yet in view)
    const scrollWithinSection = windowScrollTop - sectionTop;

    // The section becomes "scrollable" once its top reaches the viewport top
    // Maximum scroll = section height - viewport height (the "scrollable area")
    const maxScrollableDistance = Math.max(0, sectionHeight - viewportHeight);

    // Clamp scroll position to valid range [0, maxScrollableDistance]
    const clampedScroll = Math.max(0, Math.min(scrollWithinSection, maxScrollableDistance));

    // Calculate progress (0-1)
    // If section is shorter than viewport, progress goes 0→1 instantly
    const scrollProgress = maxScrollableDistance > 0
      ? clampedScroll / maxScrollableDistance
      : 1; // Section fits in viewport = always "complete"

    // Check boundaries
    // At top: scroll position is at or before section start
    const isAtSectionTop = scrollWithinSection <= 0;

    // At bottom: we've scrolled through all scrollable content
    // Use threshold to trigger transition slightly before absolute bottom
    const isAtSectionBottom = scrollWithinSection >= maxScrollableDistance - scrollThreshold;

    return {
      scrollProgress,
      isAtSectionTop,
      isAtSectionBottom
    };
  }, [scrollThreshold]);

  /**
   * Transition to next/previous section
   */
  const transitionToSection = useCallback((newIndex: number, direction: 'forward' | 'backward') => {
    if (newIndex < 0 || newIndex >= totalSections) return;
    if (state.isTransitioning) return;

    // Start transition
    setState(prev => ({ ...prev, isTransitioning: true }));
    scrollAccumulator.current = 0;

    // Immediately scroll window to top for new section
    // This ensures the next section starts at its top, not relative to previous scroll position
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Call section change callback
    onSectionChange?.(newIndex, direction);

    // Wait for transition to complete
    if (transitionTimeout.current) {
      window.clearTimeout(transitionTimeout.current);
    }

    transitionTimeout.current = window.setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentSectionIndex: newIndex,
        isTransitioning: false,
        scrollProgress: 0, // Always start at top
        isAtSectionTop: true, // Always start at top
        isAtSectionBottom: false
      }));

      // Ensure window is at top after transition completes
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, transitionDuration);
  }, [state.isTransitioning, totalSections, transitionDuration, onSectionChange]);

  /**
   * Handle scroll events with section awareness
   */
  const handleScroll = useCallback((event: WheelEvent) => {
    const { currentSectionIndex, isTransitioning, isAtSectionBottom, isAtSectionTop } = state;

    // Prevent scroll during transitions
    if (isTransitioning) {
      event.preventDefault();
      return;
    }

    const deltaY = event.deltaY;
    const scrollingDown = deltaY > 0;
    const scrollingUp = deltaY < 0;

    // Update scroll metrics for current section
    const metrics = calculateScrollMetrics(currentSectionIndex);
    setState(prev => ({ ...prev, ...metrics }));

    // Check if we should transition to next/previous section
    if (scrollingDown && isAtSectionBottom && currentSectionIndex < totalSections - 1) {
      // Accumulate scroll momentum to trigger transition
      scrollAccumulator.current += Math.abs(deltaY);

      if (scrollAccumulator.current > 100) {
        event.preventDefault();
        transitionToSection(currentSectionIndex + 1, 'forward');
      }
    } else if (scrollingUp && isAtSectionTop && currentSectionIndex > 0) {
      // Accumulate scroll momentum to trigger transition
      scrollAccumulator.current += Math.abs(deltaY);

      if (scrollAccumulator.current > 100) {
        event.preventDefault();
        transitionToSection(currentSectionIndex - 1, 'backward');
      }
    } else {
      // Normal scroll within section - reset accumulator
      scrollAccumulator.current = 0;
    }

    lastScrollY.current = window.scrollY;
  }, [state, calculateScrollMetrics, totalSections, transitionToSection]);

  /**
   * Setup scroll listener
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => handleScroll(e);

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleScroll]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (transitionTimeout.current) {
        window.clearTimeout(transitionTimeout.current);
      }
    };
  }, []);

  /**
   * Update scroll metrics on scroll
   */
  useEffect(() => {
    const updateMetrics = () => {
      if (!state.isTransitioning) {
        const metrics = calculateScrollMetrics(state.currentSectionIndex);
        setState(prev => ({ ...prev, ...metrics }));
      }
    };

    window.addEventListener('scroll', updateMetrics, { passive: true });
    return () => window.removeEventListener('scroll', updateMetrics);
  }, [state.currentSectionIndex, state.isTransitioning, calculateScrollMetrics]);

  return {
    state,
    registerSection,
    transitionToSection
  };
};
