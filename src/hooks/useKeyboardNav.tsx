/**
 * useKeyboardNav - Clean Keyboard Navigation Hook
 *
 * Simplified keyboard navigation for canvas pan/zoom.
 * Replaces over-complex spatial accessibility coupling.
 *
 * @fileoverview Minimal keyboard navigation (arrows, +/-)
 * @version 2.0.0
 * @since Phase 4 - Canvas Rebuild
 */

import { useEffect } from 'react';

interface KeyboardNavHandlers {
  onMove: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onZoom: (delta: number) => void;
}

interface KeyboardNavOptions extends KeyboardNavHandlers {
  enabled?: boolean;
}

export const useKeyboardNav = ({
  onMove,
  onZoom,
  enabled = true
}: KeyboardNavOptions): void => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for canvas navigation keys
      const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'];
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();
      }

      // Arrow key navigation
      switch (e.key) {
        case 'ArrowLeft':
          onMove('left');
          break;
        case 'ArrowRight':
          onMove('right');
          break;
        case 'ArrowUp':
          onMove('up');
          break;
        case 'ArrowDown':
          onMove('down');
          break;
        case '+':
        case '=':
          onZoom(0.1); // Zoom in
          break;
        case '-':
          onZoom(-0.1); // Zoom out
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, onZoom, enabled]);
};

export default useKeyboardNav;
