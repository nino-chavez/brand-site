/**
 * CustomCursor - Unforgettable Interaction Design
 *
 * Custom cursor with trailing effect that responds to hover states.
 * Adds sophistication and personality to the showcase experience.
 *
 * @version 1.0.0
 * @since WOW Factor Implementation
 */

import React, { useEffect, useRef, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const positionRef = useRef<CursorPosition>({ x: 0, y: 0 });
  const rafIdRef = useRef<number>();

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Check if touch device
    if ('ontouchstart' in window) return;

    // Enable custom cursor mode
    document.body.classList.add('custom-cursor-active');

    const updateCursorPosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${positionRef.current.x - 10}px, ${positionRef.current.y - 10}px)`;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };

      // Use RAF for smooth 60fps cursor
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(updateCursorPosition);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.matches(
        'button, a, input, textarea, select, [role="button"], .btn-primary, .btn-secondary, .card-base, .hover-lift'
      );
      setIsHovering(isInteractive);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Don't render on touch devices or if reduced motion preferred
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window;
    if (prefersReducedMotion || isTouchDevice) return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`}
      aria-hidden="true"
    />
  );
};

export default CustomCursor;
