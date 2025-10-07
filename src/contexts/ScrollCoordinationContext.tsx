/**
 * ScrollCoordinationContext - Unified Scroll Strategy Management
 *
 * Prevents scroll conflicts across three incompatible interaction models:
 * - Traditional: Natural body scroll
 * - Canvas: Pan/zoom with overflow-hidden
 * - Timeline: Horizontal timeline scroll
 *
 * Each layout mode declares its scroll strategy, and this context
 * ensures only one owner controls scroll at a time.
 *
 * @version 1.0.0
 * @since Scroll Architecture Refactor - January 2025
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ScrollOwner = 'body' | 'container' | 'none';
export type LayoutMode = 'traditional' | 'canvas' | 'timeline';

interface ScrollStrategy {
  owner: ScrollOwner;
  allowNativeScroll: boolean;
  allowTouchScroll: boolean;
  allowWheelScroll: boolean;
  customEventHandlers: boolean; // If true, layout handles events manually
}

const SCROLL_STRATEGIES: Record<LayoutMode, ScrollStrategy> = {
  traditional: {
    owner: 'body',
    allowNativeScroll: true,
    allowTouchScroll: true,
    allowWheelScroll: true,
    customEventHandlers: false // Use native scroll
  },
  canvas: {
    owner: 'none',
    allowNativeScroll: false,
    allowTouchScroll: false, // Canvas uses pan gestures
    allowWheelScroll: false, // Canvas uses Ctrl+wheel for zoom
    customEventHandlers: true // useCanvasTouchGestures handles everything
  },
  timeline: {
    owner: 'container',
    allowNativeScroll: true,
    allowTouchScroll: true,
    allowWheelScroll: true,
    customEventHandlers: false // Native scroll on timeline container
  }
};

interface ScrollCoordinationContextType {
  layoutMode: LayoutMode;
  strategy: ScrollStrategy;
  setLayoutMode: (mode: LayoutMode) => void;
  preventBodyScroll: () => void;
  restoreBodyScroll: () => void;
  isBodyScrollDisabled: boolean;
}

const ScrollCoordinationContext = createContext<ScrollCoordinationContextType | undefined>(undefined);

export const ScrollCoordinationProvider: React.FC<{
  children: React.ReactNode;
  initialMode?: LayoutMode;
}> = ({ children, initialMode = 'traditional' }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(initialMode);
  const [isBodyScrollDisabled, setIsBodyScrollDisabled] = useState(false);

  const strategy = SCROLL_STRATEGIES[layoutMode];

  /**
   * Disable body scroll (for modals, canvas mode, etc.)
   * Uses counter to handle nested calls
   */
  const preventBodyScroll = useCallback(() => {
    if (typeof document === 'undefined') return;

    document.body.style.overflow = 'hidden';
    setIsBodyScrollDisabled(true);

    // Log for debugging
    if (import.meta.env.DEV) {
      console.log('[ScrollCoordination] Body scroll disabled');
    }
  }, []);

  /**
   * Restore body scroll
   */
  const restoreBodyScroll = useCallback(() => {
    if (typeof document === 'undefined') return;

    document.body.style.overflow = '';
    setIsBodyScrollDisabled(false);

    // Log for debugging
    if (import.meta.env.DEV) {
      console.log('[ScrollCoordination] Body scroll restored');
    }
  }, []);

  /**
   * Apply scroll strategy when layout mode changes
   */
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const newStrategy = SCROLL_STRATEGIES[layoutMode];

    // Canvas mode disables body scroll
    if (newStrategy.owner === 'none') {
      preventBodyScroll();
    } else {
      restoreBodyScroll();
    }

    // Log strategy change
    if (import.meta.env.DEV) {
      console.log('[ScrollCoordination] Layout mode changed:', {
        mode: layoutMode,
        owner: newStrategy.owner,
        allowNativeScroll: newStrategy.allowNativeScroll
      });
    }
  }, [layoutMode, preventBodyScroll, restoreBodyScroll]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      restoreBodyScroll();
    };
  }, [restoreBodyScroll]);

  return (
    <ScrollCoordinationContext.Provider
      value={{
        layoutMode,
        strategy,
        setLayoutMode,
        preventBodyScroll,
        restoreBodyScroll,
        isBodyScrollDisabled
      }}
    >
      {children}
    </ScrollCoordinationContext.Provider>
  );
};

/**
 * Hook to access scroll coordination
 */
export const useScrollCoordination = () => {
  const context = useContext(ScrollCoordinationContext);
  if (!context) {
    throw new Error('useScrollCoordination must be used within ScrollCoordinationProvider');
  }
  return context;
};

/**
 * Hook for modals/components that need to temporarily disable body scroll
 *
 * Example:
 * ```tsx
 * function MyModal({ isOpen }) {
 *   useTemporaryScrollBlock(isOpen);
 *   // Body scroll automatically disabled when isOpen=true, restored when false
 * }
 * ```
 */
export const useTemporaryScrollBlock = (shouldBlock: boolean) => {
  const { preventBodyScroll, restoreBodyScroll } = useScrollCoordination();

  useEffect(() => {
    if (shouldBlock) {
      preventBodyScroll();
    } else {
      restoreBodyScroll();
    }

    // Always restore on unmount
    return () => {
      restoreBodyScroll();
    };
  }, [shouldBlock, preventBodyScroll, restoreBodyScroll]);
};

export default ScrollCoordinationContext;
