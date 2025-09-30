import React, { useEffect, useState, useRef } from 'react';
import { useMouseTracking } from '../../hooks/useMouseTracking';
import { HERO_VIEWFINDER_CONFIG } from '../../constants';

interface BlurContainerProps {
  children: React.ReactNode;
  focusCenter?: { x: number; y: number };
  focusRadius?: number;
  maxBlurIntensity?: number;
  isActive?: boolean;
  className?: string;
  // Hero viewfinder props
  heroMode?: boolean;
  heroFocusAnimation?: {
    enabled: boolean;
    progress: number; // 0-1, where 0 is fully blurred, 1 is focused
    onAnimationUpdate?: (progress: number) => void;
  };
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
  heroMode = false,
  heroFocusAnimation = { enabled: false, progress: 0 },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blurZones, setBlurZones] = useState<BlurZone[]>([]);
  const [currentBlur, setCurrentBlur] = useState(0);
  const [heroBlurAmount, setHeroBlurAmount] = useState(HERO_VIEWFINDER_CONFIG.blur.initialBlur);

  // Use real-time mouse tracking if no external focus center provided
  const { currentPosition } = useMouseTracking({
    delay: 0, // Real-time tracking
    throttleMs: 8, // 120fps for ultra-smooth tracking
    enableEasing: false,
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

  // Hero focus animation - smooth 8px → 0px blur transition
  useEffect(() => {
    if (heroMode && heroFocusAnimation.enabled && isActive) {
      const { progress } = heroFocusAnimation;

      // Calculate blur amount: 8px at progress=0, 0px at progress=1
      const targetBlur = HERO_VIEWFINDER_CONFIG.blur.initialBlur * (1 - progress);

      let animationId: number;
      const startBlur = heroBlurAmount;
      const blurDifference = targetBlur - startBlur;

      if (Math.abs(blurDifference) > 0.1) { // Only animate if significant change
        let startTime: number;

        const animateBlur = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const duration = HERO_VIEWFINDER_CONFIG.blur.updateInterval;

          if (elapsed >= duration) {
            setHeroBlurAmount(targetBlur);

            // Apply to container
            if (containerRef.current) {
              containerRef.current.style.filter = `blur(${targetBlur}px)`;

              // Apply hardware acceleration if enabled
              if (HERO_VIEWFINDER_CONFIG.blur.hardwareAcceleration) {
                containerRef.current.style.transform = 'translateZ(0)';
                containerRef.current.style.willChange = 'filter';
              }
            }

            // Notify parent of animation update
            heroFocusAnimation.onAnimationUpdate?.(progress);
          } else {
            // Smooth interpolation using cubic-bezier easing
            const easeProgress = elapsed / duration;
            const easedProgress = easeProgress < 0.5
              ? 4 * easeProgress * easeProgress * easeProgress
              : 1 - Math.pow(-2 * easeProgress + 2, 3) / 2;

            const currentBlurAmount = startBlur + (blurDifference * easedProgress);
            setHeroBlurAmount(currentBlurAmount);

            if (containerRef.current) {
              containerRef.current.style.filter = `blur(${currentBlurAmount}px)`;
            }

            animationId = requestAnimationFrame(animateBlur);
          }
        };

        animationId = requestAnimationFrame(animateBlur);
      } else {
        // Direct set if change is minimal
        setHeroBlurAmount(targetBlur);
        if (containerRef.current) {
          containerRef.current.style.filter = `blur(${targetBlur}px)`;
        }
      }

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    } else if (!isActive && heroMode) {
      // Reset to initial blur when inactive
      setHeroBlurAmount(HERO_VIEWFINDER_CONFIG.blur.initialBlur);
      if (containerRef.current) {
        containerRef.current.style.filter = `blur(${HERO_VIEWFINDER_CONFIG.blur.initialBlur}px)`;
        containerRef.current.style.transition = HERO_VIEWFINDER_CONFIG.blur.fallbackTransition;
      }
    }
  }, [heroMode, heroFocusAnimation, isActive, heroBlurAmount]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        filter: heroMode
          ? (isActive ? `blur(${heroBlurAmount}px)` : `blur(${HERO_VIEWFINDER_CONFIG.blur.initialBlur}px)`)
          : (isActive ? `blur(${currentBlur}px)` : 'none'),
        transition: heroMode ? 'none' : 'filter 200ms ease-out', // Hero mode uses RAF animation
        willChange: isActive ? 'filter, transform' : 'auto',
        transform: (heroMode && HERO_VIEWFINDER_CONFIG.blur.hardwareAcceleration)
          ? 'translateZ(0) scale3d(1, 1, 1)'
          : undefined,
        backfaceVisibility: 'hidden', // Prevents flickering
        perspective: '1000px', // Improves 3D transform performance
        transformStyle: 'preserve-3d', // Enables hardware acceleration
      }}
    >
      {children}

      {/* Focus Ring Visualization (optional debug) */}
      {false && isActive && process.env.NODE_ENV === 'development' && (
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

// Specialized Hero Blur Container with optimized focus animation
export const HeroBlurContainer: React.FC<{
  children: React.ReactNode;
  isActive?: boolean;
  focusProgress: number; // 0-1 animation progress from ViewfinderOverlay
  onAnimationUpdate?: (progress: number, blurAmount: number) => void;
  className?: string;
}> = ({ children, isActive = false, focusProgress, onAnimationUpdate, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentBlurAmount, setCurrentBlurAmount] = useState(HERO_VIEWFINDER_CONFIG.blur.initialBlur);
  const previousProgressRef = useRef(focusProgress);

  useEffect(() => {
    if (!isActive) {
      // Reset to initial blur when inactive
      const initialBlur = HERO_VIEWFINDER_CONFIG.blur.initialBlur;
      setCurrentBlurAmount(initialBlur);

      if (containerRef.current) {
        containerRef.current.style.filter = `blur(${initialBlur}px)`;
        containerRef.current.style.transition = HERO_VIEWFINDER_CONFIG.blur.fallbackTransition;
      }
      return;
    }

    // Only animate if progress has changed significantly
    if (Math.abs(focusProgress - previousProgressRef.current) < 0.01) {
      return;
    }

    previousProgressRef.current = focusProgress;

    // Calculate target blur: 8px → 0px based on progress
    const targetBlur = HERO_VIEWFINDER_CONFIG.blur.initialBlur * (1 - focusProgress);

    let animationId: number;
    const startBlur = currentBlurAmount;
    const startTime = performance.now();

    const animateToTarget = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const duration = HERO_VIEWFINDER_CONFIG.blur.updateInterval;

      if (elapsed >= duration) {
        // Animation complete
        setCurrentBlurAmount(targetBlur);

        if (containerRef.current) {
          containerRef.current.style.filter = `blur(${targetBlur}px)`;

          // Apply hardware acceleration
          if (HERO_VIEWFINDER_CONFIG.blur.hardwareAcceleration) {
            containerRef.current.style.transform = 'translateZ(0)';
            containerRef.current.style.willChange = 'filter';
          }
        }

        // Notify parent component
        onAnimationUpdate?.(focusProgress, targetBlur);
      } else {
        // Interpolate with easeOutQuint easing
        const t = Math.min(elapsed / duration, 1);
        const easedT = 1 - Math.pow(1 - t, 5);

        const interpolatedBlur = startBlur + (targetBlur - startBlur) * easedT;
        setCurrentBlurAmount(interpolatedBlur);

        if (containerRef.current) {
          containerRef.current.style.filter = `blur(${interpolatedBlur}px)`;
        }

        animationId = requestAnimationFrame(animateToTarget);
      }
    };

    animationId = requestAnimationFrame(animateToTarget);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isActive, focusProgress, currentBlurAmount, onAnimationUpdate]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      data-hero-blur-container
      style={{
        filter: `blur(${currentBlurAmount}px)`,
        transition: 'none', // All animation handled by RAF
        willChange: isActive ? 'filter' : 'auto',
        backfaceVisibility: 'hidden',
        transform: HERO_VIEWFINDER_CONFIG.blur.hardwareAcceleration ? 'translateZ(0)' : undefined,
      }}
    >
      {children}
    </div>
  );
};

export default BlurContainer;