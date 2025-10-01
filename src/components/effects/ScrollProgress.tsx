/**
 * ScrollProgress - Visual Scroll Indicator
 *
 * Gradient progress bar showing scroll position through the page.
 * Provides subtle visual feedback for navigation context.
 *
 * @version 1.0.0
 * @since WOW Factor Implementation
 */

import React, { useEffect, useState } from 'react';

export const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const calculateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / documentHeight, 1);
      setScrollProgress(progress);
    };

    // Throttle scroll events
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial calculation
    calculateScrollProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateScrollProgress);
    };
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ transform: `scaleX(${scrollProgress})` }}
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    />
  );
};

export default ScrollProgress;
