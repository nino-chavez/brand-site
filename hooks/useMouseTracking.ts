import { useState, useCallback, useRef, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackingState {
  mousePosition: MousePosition;
  isHovered: boolean;
  currentPosition: MousePosition;
  targetPosition: MousePosition;
  isTracking: boolean;
}

interface MouseTrackingHandlers {
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

interface UseMouseTrackingProps {
  initialPosition?: MousePosition;
  trackPosition?: boolean;
  trackHover?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
  onPositionChange?: (position: MousePosition) => void;
  delay?: number;
  throttleMs?: number;
  enableEasing?: boolean;
  easingCurve?: string;
  boundaryElement?: HTMLElement | null;
}

/**
 * Custom hook for managing mouse tracking and hover states with advanced features
 */
export const useMouseTracking = ({
  initialPosition = { x: 0, y: 0 },
  trackPosition = true,
  trackHover = true,
  onHoverChange,
  onPositionChange,
  delay = 0,
  throttleMs = 16,
  enableEasing = false,
  easingCurve = 'ease-out',
  boundaryElement
}: UseMouseTrackingProps = {}): MouseTrackingState & MouseTrackingHandlers => {
  const [mousePosition, setMousePosition] = useState<MousePosition>(initialPosition);
  const [isHovered, setIsHovered] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<MousePosition>(initialPosition);
  const [targetPosition, setTargetPosition] = useState<MousePosition>(initialPosition);
  const [isTracking, setIsTracking] = useState(false);

  const throttleRef = useRef<number>();
  const delayRef = useRef<number>();
  const animationRef = useRef<number>();

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!trackPosition) return;

    const rect = boundaryElement?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPosition = { x, y };

    // Clear previous throttle
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }

    // Apply throttling
    const updatePosition = () => {
      setMousePosition(newPosition);
      setTargetPosition(newPosition);
      setIsTracking(true);

      if (enableEasing) {
        // Simple easing animation
        const animate = () => {
          setCurrentPosition(prev => ({
            x: prev.x + (newPosition.x - prev.x) * 0.1,
            y: prev.y + (newPosition.y - prev.y) * 0.1
          }));
        };
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentPosition(newPosition);
      }

      if (onPositionChange) {
        onPositionChange(newPosition);
      }
    };

    if (delay > 0) {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
      }
      delayRef.current = setTimeout(updatePosition, delay);
    } else if (throttleMs > 0) {
      throttleRef.current = setTimeout(updatePosition, throttleMs);
    } else {
      updatePosition();
    }
  }, [trackPosition, onPositionChange, boundaryElement, delay, throttleMs, enableEasing]);

  const handleMouseEnter = useCallback(() => {
    if (!trackHover) return;
    setIsHovered(true);
    setIsTracking(true);
    if (onHoverChange) {
      onHoverChange(true);
    }
  }, [trackHover, onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    if (!trackHover) return;
    setIsHovered(false);
    setIsTracking(false);
    if (onHoverChange) {
      onHoverChange(false);
    }
  }, [trackHover, onHoverChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (throttleRef.current) clearTimeout(throttleRef.current);
      if (delayRef.current) clearTimeout(delayRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return {
    mousePosition,
    isHovered,
    currentPosition,
    targetPosition,
    isTracking,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  };
};