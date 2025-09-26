import { useEffect } from 'react';

interface UseParallaxEffectProps {
  /** Target element ID for the parallax effect */
  targetElementId?: string;
  /** Parallax speed multiplier (0-1, where 0.5 is half scroll speed) */
  speed?: number;
  /** Whether the parallax effect is enabled */
  enabled?: boolean;
  /** Use passive scroll listener for better performance */
  passive?: boolean;
}

/**
 * Custom hook for managing parallax scroll effects
 * Extracted from HeroSection component for reusability and performance
 */
export const useParallaxEffect = ({
  targetElementId = 'hero-background',
  speed = 0.5,
  enabled = true,
  passive = true
}: UseParallaxEffectProps = {}) => {
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const backgroundElement = document.getElementById(targetElementId);
      if (!backgroundElement) return;

      const scrollY = window.scrollY;
      const parallaxOffset = scrollY * speed;

      // Use transform3d for hardware acceleration
      backgroundElement.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
    };

    // Initial call to set position
    handleScroll();

    // Add scroll listener with performance optimization
    window.addEventListener('scroll', handleScroll, { passive });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [targetElementId, speed, enabled, passive]);

  // Return cleanup function for manual control
  return {
    cleanup: () => {
      const backgroundElement = document.getElementById(targetElementId);
      if (backgroundElement) {
        backgroundElement.style.transform = '';
      }
    }
  };
};