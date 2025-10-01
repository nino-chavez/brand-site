/**
 * useViewfinderVisibility - Scroll-based Viewfinder Control
 *
 * Manages viewfinder metadata visibility based on scroll position.
 * Shows in hero, fades out on scroll, reappears in contact.
 *
 * @version 1.0.0
 * @since Hybrid Viewfinder Approach
 */

import { useState, useEffect } from 'react';

interface ViewfinderVisibility {
  showMetadata: boolean;
  showBrackets: boolean;
  currentSection: string;
  opacity: number;
}

export const useViewfinderVisibility = (): ViewfinderVisibility => {
  const [visibility, setVisibility] = useState<ViewfinderVisibility>({
    showMetadata: true,
    showBrackets: true,
    currentSection: 'hero',
    opacity: 1,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Detect current section
      const sections = ['hero', 'about', 'work', 'contact'];
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
      // Show full in hero, fade out after 50% scroll through hero
      const heroElement = document.getElementById('hero');
      let showMetadata = false;
      let opacity = 1;

      if (heroElement) {
        const heroHeight = heroElement.offsetHeight;
        const heroScroll = scrollY;

        if (heroScroll < heroHeight * 0.5) {
          // In upper half of hero - full opacity
          showMetadata = true;
          opacity = 1;
        } else if (heroScroll < heroHeight) {
          // In lower half of hero - fade out
          showMetadata = true;
          opacity = 1 - ((heroScroll - heroHeight * 0.5) / (heroHeight * 0.5));
        } else if (currentSection === 'contact') {
          // In contact section - fade in
          showMetadata = true;
          opacity = 0.9;
        }
      }

      // Brackets always visible
      const showBrackets = true;

      setVisibility({
        showMetadata,
        showBrackets,
        currentSection,
        opacity: Math.max(0, Math.min(1, opacity)),
      });
    };

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Keep metadata visible for accessibility
      setVisibility({
        showMetadata: true,
        showBrackets: true,
        currentSection: 'hero',
        opacity: 1,
      });
      return;
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return visibility;
};

export default useViewfinderVisibility;
