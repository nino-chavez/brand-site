/**
 * useLensActivation Hook
 *
 * Multi-method gesture detection for CursorLens activation with debouncing and accessibility support.
 * Supports click-and-hold, hover, keyboard, and touch long-press activation methods.
 *
 * @fileoverview Phase 1: Setup and Foundation - Task 5: Create useLensActivation hook for gesture detection
 * @version 1.0.0
 * @since 2025-09-26
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useUnifiedPerformance } from '../contexts/UnifiedGameFlowContext';
import type { LensActivationHook, ActivationMethod, GestureEventHandlers } from '../types/cursor-lens';

// Activation timing constants (matching acceptance criteria)
const CLICK_HOLD_DELAY = 100; // 100ms activation latency target
const HOVER_DELAY = 800; // 800ms hover delay
const TOUCH_LONG_PRESS_DELAY = 750; // 750ms touch press for mobile
const DEBOUNCE_DELAY = 50; // 50ms debouncing to prevent conflicts

// Keyboard activation keys
const ACTIVATION_KEYS = ['Enter', ' ', 'Space', 'Escape'];

// Safe performance timing utility
function getHighResTimestamp(): number {
  // In test environment with fake timers, Date.now() is controlled by vitest
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/**
 * Multi-method lens activation hook with gesture detection
 *
 * Features:
 * - Click-and-hold detection with 100ms response target
 * - Hover activation with 800ms configurable delay
 * - Keyboard activation for accessibility
 * - Touch long-press support for mobile devices
 * - Activation debouncing to prevent conflicts
 * - Performance tracking integration
 *
 * @returns LensActivationHook interface with activation state and controls
 */
export const useLensActivation = (): LensActivationHook => {
  // State management
  const [isActive, setIsActive] = useState(false);
  const [activationMethod, setActivationMethod] = useState<ActivationMethod | null>(null);
  const [activationProgress, setActivationProgress] = useState(0);

  // Performance monitoring integration
  const { actions: performanceActions } = useUnifiedPerformance();

  // Refs for timing and gesture tracking
  const clickStartTimeRef = useRef<number>(0);
  const hoverStartTimeRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivationTimeRef = useRef<number>(0);
  const isMouseDownRef = useRef(false);
  const isTouchActiveRef = useRef(false);

  // Clear all active timers
  const clearAllTimers = useCallback(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    if (hoverProgressIntervalRef.current) {
      clearInterval(hoverProgressIntervalRef.current);
      hoverProgressIntervalRef.current = null;
    }
  }, []);

  // Debouncing check to prevent rapid activations
  const isDebounced = useCallback((): boolean => {
    if (lastActivationTimeRef.current === 0) return false; // No previous activation
    const now = getHighResTimestamp();
    return now - lastActivationTimeRef.current < DEBOUNCE_DELAY;
  }, []);

  // Manual activation trigger
  const activate = useCallback((method: ActivationMethod) => {
    if (isActive || isDebounced()) return;

    const startTime = getHighResTimestamp();
    const latency = method === 'click-hold' && clickStartTimeRef.current > 0
      ? startTime - clickStartTimeRef.current
      : method === 'hover' && hoverStartTimeRef.current > 0
      ? startTime - hoverStartTimeRef.current
      : method === 'touch-long-press' && touchStartTimeRef.current > 0
      ? startTime - touchStartTimeRef.current
      : 0;

    setIsActive(true);
    setActivationMethod(method);
    setActivationProgress(1);
    lastActivationTimeRef.current = startTime;
    clearAllTimers();

    // Track activation performance
    performanceActions.trackActivation(method, latency, true);
  }, [isActive, isDebounced, performanceActions]);

  // Manual deactivation trigger
  const deactivate = useCallback(() => {
    if (!isActive) return;

    setIsActive(false);
    setActivationMethod(null);
    setActivationProgress(0);
    clearAllTimers();

    // Reset tracking refs
    isMouseDownRef.current = false;
    isTouchActiveRef.current = false;
    clickStartTimeRef.current = 0;
    hoverStartTimeRef.current = 0;
    touchStartTimeRef.current = 0;
  }, [isActive, clearAllTimers]);

  // Store activate function in ref to avoid circular dependencies
  const activateRef = useRef(activate);
  activateRef.current = activate;

  // Track last progress to avoid excessive re-renders
  const lastProgressRef = useRef<number>(0);

  // Update hover progress
  const updateHoverProgress = useCallback(() => {
    if (hoverStartTimeRef.current === 0) return;

    const elapsed = getHighResTimestamp() - hoverStartTimeRef.current;
    const progress = Math.min(elapsed / HOVER_DELAY, 1);

    // Only update if progress changed significantly (> 5%) to reduce re-renders
    if (Math.abs(progress - lastProgressRef.current) > 0.05 || progress >= 1) {
      lastProgressRef.current = progress;
      setActivationProgress(progress);
    }

    if (progress >= 1) {
      activateRef.current('hover');
    }
  }, []); // Empty deps - uses ref for activate

  // Mouse down handler (start of click-and-hold)
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (isActive || isDebounced() || event.button !== 0) return; // Only left click

    event.preventDefault();
    isMouseDownRef.current = true;
    clickStartTimeRef.current = getHighResTimestamp();
    setActivationProgress(0);

    // Clear any existing hover activation
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
      hoverStartTimeRef.current = 0;
    }

    // Set click-and-hold timeout
    clickTimeoutRef.current = setTimeout(() => {
      if (isMouseDownRef.current) {
        activateRef.current('click-hold');
      }
    }, CLICK_HOLD_DELAY);
  }, [isActive, isDebounced]); // activate now via ref

  // Mouse up handler (end of click-and-hold or cancel)
  const handleMouseUp = useCallback((event: MouseEvent) => {
    isMouseDownRef.current = false;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // If activated via click-hold, keep active; otherwise reset
    if (!isActive) {
      clickStartTimeRef.current = 0;
      setActivationProgress(0);
    }
  }, [isActive]);

  // Mouse move handler (hover detection)
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isActive || isMouseDownRef.current || isDebounced()) return;

    // Start hover activation if not already started
    if (hoverStartTimeRef.current === 0) {
      hoverStartTimeRef.current = getHighResTimestamp();
      setActivationProgress(0);

      // Start progress tracking interval
      hoverProgressIntervalRef.current = setInterval(updateHoverProgress, 16);

      // Set hover timeout
      hoverTimeoutRef.current = setTimeout(() => {
        activateRef.current('hover');
      }, HOVER_DELAY);
    }
  }, [isActive, isDebounced, updateHoverProgress]); // activate now via ref

  // Mouse leave handler (cancel hover)
  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (hoverProgressIntervalRef.current) {
      clearInterval(hoverProgressIntervalRef.current);
      hoverProgressIntervalRef.current = null;
    }

    hoverStartTimeRef.current = 0;
    if (!isActive) {
      setActivationProgress(0);
    }
  }, [isActive]);

  // Touch start handler (start of long-press)
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (isActive || isDebounced()) return;

    // Prevent mouse events on touch devices
    event.preventDefault();
    isTouchActiveRef.current = true;
    touchStartTimeRef.current = getHighResTimestamp();
    setActivationProgress(0);

    // Set touch long-press timeout
    touchTimeoutRef.current = setTimeout(() => {
      if (isTouchActiveRef.current) {
        activateRef.current('touch-long-press');
      }
    }, TOUCH_LONG_PRESS_DELAY);
  }, [isActive, isDebounced]); // activate now via ref

  // Touch end handler (end of long-press or cancel)
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    isTouchActiveRef.current = false;

    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    // If activated via touch long-press, keep active; otherwise reset
    if (!isActive) {
      touchStartTimeRef.current = 0;
      setActivationProgress(0);
    }
  }, [isActive]);

  // Keyboard handler (accessibility activation)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Handle escape key separately (always allow deactivation)
    if (event.key === 'Escape') {
      event.preventDefault();
      if (isActive) {
        deactivate();
      }
      return;
    }

    // For other keys, check conditions
    if (isActive || isDebounced()) return;

    // Check for activation keys
    if (ACTIVATION_KEYS.includes(event.key)) {
      event.preventDefault();
      activate('keyboard');
    }
  }, [isActive, isDebounced, activate, deactivate]);

  // Gesture event handlers object
  const gestureEvents: GestureEventHandlers = {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onKeyDown: handleKeyDown
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Auto-deactivate on escape key or click outside
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isActive) {
        deactivate();
      }
    };

    const handleGlobalClick = (event: MouseEvent) => {
      // Deactivate if clicking outside and not currently activating
      if (isActive && !isMouseDownRef.current) {
        deactivate();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleGlobalKeyDown);
      window.addEventListener('click', handleGlobalClick, { capture: true });

      return () => {
        window.removeEventListener('keydown', handleGlobalKeyDown);
        window.removeEventListener('click', handleGlobalClick, { capture: true });
      };
    }
  }, [isActive, deactivate]);

  // Mouse leave detection for hover cancellation
  useEffect(() => {
    const handleGlobalMouseLeave = () => {
      if (!isActive && hoverStartTimeRef.current > 0) {
        handleMouseLeave();
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('mouseleave', handleGlobalMouseLeave);

      return () => {
        document.removeEventListener('mouseleave', handleGlobalMouseLeave);
      };
    }
  }, [isActive, handleMouseLeave]);

  return {
    isActive,
    activationMethod,
    activationProgress,
    activate,
    deactivate,
    gestureEvents
  };
};

export default useLensActivation;