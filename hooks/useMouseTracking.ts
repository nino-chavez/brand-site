import { useState, useEffect, useCallback, useRef } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

export interface MouseTrackingConfig {
  delay?: number;
  throttleMs?: number;
  enableEasing?: boolean;
  easingCurve?: string;
  boundaryElement?: HTMLElement | null;
}

export interface MouseTrackingState {
  currentPosition: MousePosition;
  targetPosition: MousePosition;
  isTracking: boolean;
}

const DEFAULT_CONFIG: Required<Omit<MouseTrackingConfig, 'boundaryElement'>> = {
  delay: 0,
  throttleMs: 8, // 120fps default for hero viewfinder mode
  enableEasing: false,
  easingCurve: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
};

export const useMouseTracking = (config: MouseTrackingConfig = {}): MouseTrackingState => {
  const {
    delay = DEFAULT_CONFIG.delay,
    throttleMs = DEFAULT_CONFIG.throttleMs,
    enableEasing = DEFAULT_CONFIG.enableEasing,
    easingCurve = DEFAULT_CONFIG.easingCurve,
    boundaryElement,
  } = config;

  const [currentPosition, setCurrentPosition] = useState<MousePosition>({ x: -100, y: -100 });
  const [targetPosition, setTargetPosition] = useState<MousePosition>({ x: -100, y: -100 });
  const [isTracking, setIsTracking] = useState<boolean>(false);

  const rafRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const delayTimeoutRef = useRef<NodeJS.Timeout>();

  const updatePosition = useCallback((newPosition: MousePosition) => {
    if (enableEasing && delay > 0) {
      // For eased movement with delay, update target position immediately
      setTargetPosition(newPosition);

      // Clear existing delay timeout
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }

      // Set delay timeout for eased position update
      delayTimeoutRef.current = setTimeout(() => {
        setCurrentPosition(newPosition);
      }, delay);
    } else if (delay > 0) {
      // For non-eased movement with delay
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }

      setTargetPosition(newPosition);
      delayTimeoutRef.current = setTimeout(() => {
        setCurrentPosition(newPosition);
      }, delay);
    } else {
      // Immediate update
      setCurrentPosition(newPosition);
      setTargetPosition(newPosition);
    }
  }, [enableEasing, delay]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();

    // Throttle updates based on throttleMs
    if (now - lastUpdateRef.current < throttleMs) {
      return;
    }

    lastUpdateRef.current = now;

    let newPosition: MousePosition = { x: e.clientX, y: e.clientY };

    // Apply boundary constraints if specified
    if (boundaryElement) {
      const rect = boundaryElement.getBoundingClientRect();
      newPosition = {
        x: Math.max(rect.left, Math.min(rect.right, e.clientX)),
        y: Math.max(rect.top, Math.min(rect.bottom, e.clientY)),
      };
    }

    updatePosition(newPosition);
  }, [throttleMs, boundaryElement, updatePosition]);

  const handleMouseEnter = useCallback(() => {
    setIsTracking(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsTracking(false);
  }, []);

  useEffect(() => {
    const targetElement = boundaryElement || window;

    if (targetElement === window) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseenter', handleMouseEnter);
      document.addEventListener('mouseleave', handleMouseLeave);
    } else {
      targetElement.addEventListener('mousemove', handleMouseMove as EventListener);
      targetElement.addEventListener('mouseenter', handleMouseEnter);
      targetElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (targetElement === window) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseenter', handleMouseEnter);
        document.removeEventListener('mouseleave', handleMouseLeave);
      } else {
        targetElement.removeEventListener('mousemove', handleMouseMove as EventListener);
        targetElement.removeEventListener('mouseenter', handleMouseEnter);
        targetElement.removeEventListener('mouseleave', handleMouseLeave);
      }

      // Cleanup timeouts and animation frames
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, boundaryElement]);

  return {
    currentPosition,
    targetPosition,
    isTracking,
  };
};