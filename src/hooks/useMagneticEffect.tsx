/**
 * useMagneticEffect - Magnetic Button Hover Effect Hook
 *
 * Creates a subtle magnetic pull effect where buttons slightly
 * move toward the cursor when nearby, creating a sophisticated
 * interactive experience.
 *
 * @version 1.0.0
 * @since WOW Factor Phase 3
 */

import { useRef, useEffect } from 'react';

interface MagneticOptions {
  strength?: number; // 0-1, how strong the pull
  radius?: number;   // Distance in pixels
}

export const useMagneticEffect = <T extends HTMLElement>(
  options: MagneticOptions = {}
) => {
  const { strength = 0.3, radius = 80 } = options;
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Don't apply on touch devices
    if ('ontouchstart' in window) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      if (distance < radius) {
        const pullX = (distanceX / radius) * strength * 40;
        const pullY = (distanceY / radius) * strength * 40;
        element.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.05)`;
      } else {
        element.style.transform = 'translate(0, 0) scale(1)';
      }
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0, 0) scale(1)';
    };

    window.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, radius]);

  return elementRef;
};

export default useMagneticEffect;
