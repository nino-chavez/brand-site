import React, { useEffect, useState, useRef } from 'react';
import { useMouseTracking } from '../hooks/useMouseTracking';

interface BlurContainerProps {
  children: React.ReactNode;
  focusCenter?: { x: number; y: number };
  focusRadius?: number;
  maxBlurIntensity?: number;
  isActive?: boolean;
  className?: string;
}

interface BlurZone {
  id: string;
  element: HTMLElement;
  rect: DOMRect;
  blurIntensity: number;
}

const BlurContainer: React.FC<BlurContainerProps> = ({
  children,
  focusCenter,
  focusRadius = 200,
  maxBlurIntensity = 8,
  isActive = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blurZones, setBlurZones] = useState<BlurZone[]>([]);
  const [currentBlur, setCurrentBlur] = useState(0);

  // Use mouse tracking if no external focus center provided
  const { currentPosition } = useMouseTracking({
    delay: 100,
    throttleMs: 16,
  });

  const activeFocusCenter = focusCenter || currentPosition;

  // Calculate blur intensity based on distance from focus center
  const calculateBlurIntensity = (elementRect: DOMRect, focusPoint: { x: number; y: number }) => {
    // Get element center point
    const elementCenter = {
      x: elementRect.left + elementRect.width / 2,
      y: elementRect.top + elementRect.height / 2,
    };

    // Calculate distance from focus point to element center
    const distance = Math.sqrt(
      Math.pow(elementCenter.x - focusPoint.x, 2) +
      Math.pow(elementCenter.y - focusPoint.y, 2)
    );

    // If within focus radius, no blur
    if (distance <= focusRadius) {
      return 0;
    }

    // Calculate blur intensity based on distance beyond focus radius
    const blurIntensity = Math.min(
      ((distance - focusRadius) / focusRadius) * maxBlurIntensity,
      maxBlurIntensity
    );

    return Math.round(blurIntensity * 10) / 10; // Round to 1 decimal
  };

  // Update blur zones when focus center changes
  useEffect(() => {
    if (!isActive || !containerRef.current) {
      setCurrentBlur(0);
      return;
    }

    const updateBlur = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      // Calculate overall container blur based on focus center
      const blurIntensity = calculateBlurIntensity(containerRect, activeFocusCenter);
      setCurrentBlur(blurIntensity);

      // Find all blurable child elements
      const blurableElements = container.querySelectorAll('[data-blurable]');
      const newBlurZones: BlurZone[] = [];

      blurableElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        const rect = htmlElement.getBoundingClientRect();
        const elementBlur = calculateBlurIntensity(rect, activeFocusCenter);

        newBlurZones.push({
          id: `zone-${index}`,
          element: htmlElement,
          rect,
          blurIntensity: elementBlur,
        });

        // Apply blur directly to element
        htmlElement.style.filter = `blur(${elementBlur}px)`;
        htmlElement.style.transition = 'filter 200ms ease-out';
        htmlElement.style.willChange = 'filter';
      });

      setBlurZones(newBlurZones);
    };

    // Use RAF for smooth updates
    const rafId = requestAnimationFrame(updateBlur);

    // Also update on resize
    const handleResize = () => requestAnimationFrame(updateBlur);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeFocusCenter, focusRadius, maxBlurIntensity, isActive]);

  // Clean up blur effects when component unmounts or becomes inactive
  useEffect(() => {
    if (!isActive && containerRef.current) {
      const blurableElements = containerRef.current.querySelectorAll('[data-blurable]');
      blurableElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.filter = 'none';
        htmlElement.style.transition = 'filter 300ms ease-out';
      });
    }
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        filter: isActive ? `blur(${currentBlur}px)` : 'none',
        transition: 'filter 200ms ease-out',
        willChange: isActive ? 'filter' : 'auto',
      }}
    >
      {children}

      {/* Focus Ring Visualization (optional debug) */}
      {isActive && process.env.NODE_ENV === 'development' && (
        <div
          className="fixed pointer-events-none border-2 border-dashed border-yellow-400 rounded-full"
          style={{
            left: activeFocusCenter.x - focusRadius,
            top: activeFocusCenter.y - focusRadius,
            width: focusRadius * 2,
            height: focusRadius * 2,
            opacity: 0.3,
            transition: 'all 200ms ease-out',
            zIndex: 9999,
          }}
        />
      )}
    </div>
  );
};

// Helper component for easily making elements blurable
export const BlurableSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  priority?: number; // Higher priority = less blur
}> = ({ children, className = '', priority = 0 }) => (
  <div
    data-blurable="true"
    data-blur-priority={priority}
    className={className}
    style={{
      backfaceVisibility: 'hidden', // Improve performance
      transform: 'translateZ(0)', // Force GPU acceleration
    }}
  >
    {children}
  </div>
);

// Advanced blur container with multiple focus areas
export const MultiBlurContainer: React.FC<{
  children: React.ReactNode;
  focusAreas?: Array<{ x: number; y: number; radius: number; intensity: number }>;
  isActive?: boolean;
  className?: string;
}> = ({ children, focusAreas = [], isActive = false, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overallBlur, setOverallBlur] = useState(0);

  useEffect(() => {
    if (!isActive || !containerRef.current || focusAreas.length === 0) {
      setOverallBlur(0);
      return;
    }

    const updateBlur = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = {
        x: containerRect.left + containerRect.width / 2,
        y: containerRect.top + containerRect.height / 2,
      };

      // Calculate minimum blur from all focus areas
      let minBlur = Infinity;

      focusAreas.forEach((area) => {
        const distance = Math.sqrt(
          Math.pow(containerCenter.x - area.x, 2) +
          Math.pow(containerCenter.y - area.y, 2)
        );

        if (distance <= area.radius) {
          minBlur = 0;
        } else {
          const blur = Math.min(
            ((distance - area.radius) / area.radius) * area.intensity,
            area.intensity
          );
          minBlur = Math.min(minBlur, blur);
        }
      });

      setOverallBlur(minBlur === Infinity ? 8 : minBlur);
    };

    const rafId = requestAnimationFrame(updateBlur);
    return () => cancelAnimationFrame(rafId);
  }, [focusAreas, isActive]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        filter: isActive ? `blur(${overallBlur}px)` : 'none',
        transition: 'filter 200ms ease-out',
        willChange: isActive ? 'filter' : 'auto',
      }}
    >
      {children}
    </div>
  );
};

export default BlurContainer;