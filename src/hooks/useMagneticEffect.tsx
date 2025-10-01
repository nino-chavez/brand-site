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
    if (!element) {
      console.warn('[MagneticEffect] Element ref not attached');
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.info('[MagneticEffect] Disabled due to reduced motion preference');
      return;
    }

    // Don't apply on touch devices
    if ('ontouchstart' in window) {
      console.info('[MagneticEffect] Disabled on touch device');
      return;
    }

    // Add data attribute for testing
    element.setAttribute('data-magnetic', 'true');
    element.setAttribute('data-magnetic-radius', radius.toString());
    element.setAttribute('data-magnetic-strength', strength.toString());

    // Store original transition and ensure transform isn't transitioned
    const originalTransition = element.style.transition;

    // Log for debugging
    console.info('[MagneticEffect] Initialized on element', {
      element: element.tagName,
      testId: element.getAttribute('data-testid'),
      strength,
      radius
    });

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
        const scale = 1 + (1 - distance / radius) * 0.05; // Dynamic scale based on proximity

        element.style.transform = `translate(${pullX}px, ${pullY}px) scale(${scale})`;
        element.setAttribute('data-magnetic-active', 'true');

        // Add progressive glow effect when in magnetic zone
        const glowIntensity = 0.4 * (1 - distance / radius);
        element.style.boxShadow = `0 8px 32px rgba(139, 92, 246, ${glowIntensity})`;
      } else {
        element.style.transform = '';
        element.style.boxShadow = '';
        element.setAttribute('data-magnetic-active', 'false');
      }
    };

    const handleMouseLeave = () => {
      element.style.transform = '';
      element.style.boxShadow = '';
      element.setAttribute('data-magnetic-active', 'false');
    };

    window.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.style.transition = originalTransition; // Restore original transition
      element.removeAttribute('data-magnetic');
      element.removeAttribute('data-magnetic-active');
      element.removeAttribute('data-magnetic-radius');
      element.removeAttribute('data-magnetic-strength');
    };
  }, [strength, radius]);

  return elementRef;
};

export default useMagneticEffect;
