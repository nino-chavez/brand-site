/**
 * Section Transition Utilities
 *
 * Edge-only transitions that fade sections when leaving viewport,
 * maintaining full opacity during reading (middle 80% of viewport)
 */

import { useEffect, useState, RefObject } from 'react';

/**
 * Hook to animate section opacity ONLY at viewport edges
 * Keeps content at full opacity in reading zone (middle 80% of viewport)
 * Only fades when section is entering/exiting viewport completely
 */
export function useSectionEdgeFade(sectionRef: RefObject<HTMLElement>) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Very tight fade zone - only at extreme edges (5% of viewport)
      const edgeFadeZone = viewportHeight * 0.05;

      let newOpacity = 1;

      // Only fade when section is leaving viewport at the TOP
      // (section scrolling up and almost completely out of view)
      if (rect.bottom > 0 && rect.bottom < edgeFadeZone) {
        newOpacity = rect.bottom / edgeFadeZone;
      }

      // Only fade when section is entering viewport from BOTTOM
      // (section scrolling into view from below)
      else if (rect.top < viewportHeight && rect.top > viewportHeight - edgeFadeZone) {
        newOpacity = (viewportHeight - rect.top) / edgeFadeZone;
      }

      // Minimum opacity of 0.3 to maintain some visibility
      setOpacity(Math.max(0.3, Math.min(1, newOpacity)));
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionRef]);

  return opacity;
}
