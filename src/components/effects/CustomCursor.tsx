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

const TRAIL_COUNT = 5;

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const positionRef = useRef<CursorPosition>({ x: 0, y: 0 });
  const trailPositions = useRef<CursorPosition[]>(
    Array(TRAIL_COUNT).fill({ x: 0, y: 0 })
  );
  const rafIdRef = useRef<number>();

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Check if touch device
    if ('ontouchstart' in window) return;

    // Enable custom cursor mode
    document.body.classList.add('custom-cursor-active');

    const updateTrailPositions = () => {
      // Update trail positions with smooth following
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const trail = trailRefs.current[i];
        if (trail) {
          // Each trail follows the previous one with delay
          const target = i === 0 ? positionRef.current : trailPositions.current[i - 1];
          const current = trailPositions.current[i];

          // Smooth interpolation (ease factor increases with trail index)
          const easeFactor = 0.15 + (i * 0.05);
          trailPositions.current[i] = {
            x: current.x + (target.x - current.x) * easeFactor,
            y: current.y + (target.y - current.y) * easeFactor
          };

          trail.style.transform = `translate(${trailPositions.current[i].x - 4}px, ${trailPositions.current[i].y - 4}px)`;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };

      // Update main cursor instantly for zero latency
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
      }
    };

    // Continuous animation loop for smooth trails only
    const animateTrails = () => {
      updateTrailPositions();
      rafIdRef.current = requestAnimationFrame(animateTrails);
    };

    // Start animation loop
    rafIdRef.current = requestAnimationFrame(animateTrails);

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
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={`custom-cursor ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`}
        aria-hidden="true"
      />
      {/* Trailing dots */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) trailRefs.current[i] = el;
          }}
          className="custom-cursor-trail"
          style={{
            opacity: 1 - (i * 0.15)
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

export default CustomCursor;
