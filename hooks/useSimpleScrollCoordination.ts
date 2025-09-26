import { useEffect, useRef, useCallback, useState } from 'react';
import type { GameFlowSection } from '../types';

interface SimpleScrollCoordinationHook {
  currentSection: GameFlowSection;
  scrollProgress: number;
  navigateToSection: (section: GameFlowSection) => void;
  isTransitioning: boolean;
}

interface ScrollCallbacks {
  onSectionEnter: (section: GameFlowSection) => void;
  onSectionExit: (section: GameFlowSection) => void;
}

/**
 * Simplified scroll coordination using native browser APIs
 * Replaces the 492-line over-engineered useScrollCoordination
 */
export function useSimpleScrollCoordination(
  callbacks: ScrollCallbacks
): SimpleScrollCoordinationHook {
  const [currentSection, setCurrentSection] = useState<GameFlowSection>('capture');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sectionsRef = useRef<HTMLElement[]>([]);

  // Initialize sections on mount
  useEffect(() => {
    const sections = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio']
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    sectionsRef.current = sections;
  }, []);

  // Simple scroll tracking with native APIs
  useEffect(() => {
    const updateScrollState = () => {
      // Calculate scroll progress
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      setScrollProgress(progress);

      // Find current section using simple viewport center calculation
      const viewportCenter = window.scrollY + window.innerHeight * 0.5;
      let closestSection: GameFlowSection = 'capture';
      let minDistance = Infinity;

      sectionsRef.current.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + window.scrollY + rect.height / 2;
        const distance = Math.abs(viewportCenter - sectionCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestSection = section.id as GameFlowSection;
        }
      });

      if (closestSection !== currentSection) {
        callbacks.onSectionExit(currentSection);
        callbacks.onSectionEnter(closestSection);
        setCurrentSection(closestSection);
      }
    };

    // Use passive listener for performance
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });

    // Initial calculation
    updateScrollState();

    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [currentSection, callbacks]);

  // Simple navigation using native smooth scrolling
  const navigateToSection = useCallback((section: GameFlowSection) => {
    const targetElement = document.getElementById(section);
    if (!targetElement) return;

    setIsTransitioning(true);

    // Use native smooth scrolling - much simpler and more performant
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Reset transition state after typical scroll duration
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  }, []);

  return {
    currentSection,
    scrollProgress,
    navigateToSection,
    isTransitioning
  };
}