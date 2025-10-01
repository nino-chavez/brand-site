/**
 * useActiveSection - Active Section Detection Hook
 *
 * Detects which section is currently in the viewport and returns
 * its ID for ambient lighting and other section-specific effects.
 *
 * @version 1.0.0
 * @since WOW Factor Phase 3
 */

import { useEffect, useState } from 'react';

export const useActiveSection = () => {
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const sections = document.querySelectorAll('section[data-section]');
    if (sections.length === 0) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observerOptions = {
      threshold: prefersReducedMotion ? 0.1 : 0.3,
      rootMargin: '-20% 0px -20% 0px' // Trigger when section is centered
    };

    const observer = new IntersectionObserver((entries) => {
      // Find the section with highest intersection ratio
      let maxRatio = 0;
      let activeSectionId = activeSection;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          activeSectionId = entry.target.getAttribute('data-section') || 'hero';
        }
      });

      if (maxRatio > 0) {
        setActiveSection(activeSectionId);
      }
    }, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, [activeSection]);

  return activeSection;
};

export default useActiveSection;
