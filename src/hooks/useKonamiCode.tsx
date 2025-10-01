/**
 * useKonamiCode - Konami Code Easter Egg Hook
 *
 * Detects the famous Konami code sequence:
 * ↑ ↑ ↓ ↓ ← → ← → B A
 *
 * When triggered, activates "film mode" with black & white
 * filter and vintage film grain effect.
 *
 * @version 1.0.0
 * @since WOW Factor Phase 4
 */

import { useEffect, useState } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

export const useKonamiCode = (callback: () => void) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const expectedKey = KONAMI_CODE[currentIndex].toLowerCase();

      if (key === expectedKey) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);

        if (nextIndex === KONAMI_CODE.length) {
          // Complete sequence - trigger callback
          callback();
          setCurrentIndex(0);
        }
      } else {
        // Wrong key - reset sequence
        setCurrentIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, callback]);
};

export default useKonamiCode;
