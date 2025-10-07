import { useEffect, useRef, useState, useCallback } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  enabled?: boolean;
}

/**
 * Pull-to-Refresh Hook
 * Implements native-like pull-to-refresh pattern for mobile
 *
 * @param options Configuration options
 * @returns State and handlers for PTR UI
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true
}: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(0);
  const scrollableElement = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing) return;

    // Only activate if at top of page
    const atTop = window.scrollY === 0;
    if (!atTop) return;

    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [enabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || !enabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    // Only pull down (positive distance)
    if (distance > 0) {
      // Apply resistance (diminishing returns)
      const resistance = 0.4;
      const adjustedDistance = distance * resistance;
      setPullDistance(Math.min(adjustedDistance, threshold * 1.5));

      // Prevent default scroll if pulling
      if (adjustedDistance > 10) {
        e.preventDefault();
      }

      // Haptic feedback when threshold reached
      if (adjustedDistance >= threshold && pullDistance < threshold) {
        triggerHaptic('medium');
      }
    }
  }, [isPulling, enabled, isRefreshing, threshold, pullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || !enabled) return;

    setIsPulling(false);

    // Trigger refresh if threshold met
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('success');

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
        triggerHaptic('error');
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Animate back to 0
      setPullDistance(0);
    }
  }, [isPulling, enabled, pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    // Add listeners to document for global PTR
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    isTriggered: pullDistance >= threshold
  };
}
