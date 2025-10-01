/**
 * useViewfinderVisibility - Hover + Scroll-based Viewfinder Control
 *
 * Manages viewfinder metadata visibility based on hover state and scroll position.
 * Hero: Shows on hover (discovery mechanism)
 * Other sections: Shows when user enables "Viewfinder Mode" via EffectsPanel
 *
 * @version 3.0.0
 * @since WOW Factor UX Improvements - Phase 1
 */

import { useState, useEffect } from 'react';
import { useEffects } from '../contexts/EffectsContext';

interface ViewfinderVisibility {
  showMetadata: boolean;
  showBrackets: boolean;
  currentSection: string;
  opacity: number;
  isHovered: boolean;
}

export const useViewfinderVisibility = (): ViewfinderVisibility => {
  const { settings } = useEffects();
  const viewfinderEnabled = settings.enableViewfinder;

  const [visibility, setVisibility] = useState<ViewfinderVisibility>({
    showMetadata: false, // Hidden by default
    showBrackets: true,
    currentSection: 'hero',
    opacity: 0,
    isHovered: false,
  });

  useEffect(() => {
    let isHovered = false;

    const handleHover = (hovered: boolean) => {
      isHovered = hovered;
      updateVisibility();
    };

    const handleScroll = () => {
      updateVisibility();
    };

    const updateVisibility = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Detect current section using photography metaphor IDs
      const sections = ['hero', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];
      let currentSection = 'hero';

      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If section is in viewport center
          if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            currentSection = sectionId;
          }
        }
      });

      // Calculate metadata visibility
      let showMetadata = false;
      let opacity = 0;

      if (currentSection === 'hero') {
        // Hero behavior: Show on hover (discovery mechanism)
        const heroElement = document.getElementById('hero');
        if (heroElement) {
          const heroHeight = heroElement.offsetHeight;
          const heroScroll = scrollY;
          const scrollPercent = heroScroll / heroHeight;

          // Only show if hovering AND in upper 30% of hero
          if (isHovered && scrollPercent < 0.3) {
            showMetadata = true;
            opacity = 1;
          } else if (isHovered && scrollPercent < 0.5) {
            // Fade out from 30% to 50% scroll
            showMetadata = true;
            opacity = 1 - ((scrollPercent - 0.3) / 0.2);
          }
        }
      } else {
        // Other sections: Show if viewfinder is enabled by user
        if (viewfinderEnabled) {
          showMetadata = true;
          opacity = 1;
        }
      }

      // Brackets always visible
      const showBrackets = true;

      setVisibility({
        showMetadata,
        showBrackets,
        currentSection,
        opacity: Math.max(0, Math.min(1, opacity)),
        isHovered,
      });
    };

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // For accessibility, show on hover only (no auto-show)
      setVisibility({
        showMetadata: false,
        showBrackets: true,
        currentSection: 'hero',
        opacity: 0,
        isHovered: false,
      });
    }

    // Set up hover listeners on hero section
    const heroElement = document.getElementById('hero');
    if (heroElement) {
      const handleMouseEnter = () => handleHover(true);
      const handleMouseLeave = () => handleHover(false);

      heroElement.addEventListener('mouseenter', handleMouseEnter);
      heroElement.addEventListener('mouseleave', handleMouseLeave);

      // Cleanup for hover
      const cleanupHover = () => {
        heroElement.removeEventListener('mouseenter', handleMouseEnter);
        heroElement.removeEventListener('mouseleave', handleMouseLeave);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        cleanupHover();
      };
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [viewfinderEnabled]); // Re-run when viewfinder setting changes

  return visibility;
};

export default useViewfinderVisibility;
