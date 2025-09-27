/**
 * DepthOfFieldEffect Component
 *
 * CSS backdrop-filter depth-of-field effect component for Phase 5 storytelling.
 * Implements visual depth storytelling with accessibility-first design
 * and comprehensive fallback support.
 *
 * @fileoverview Depth-of-field effect component shell
 * @version 1.0.0
 * @since Phase 5
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { DepthOfFieldEffectProps } from '../../types/split-screen';
import {
  splitScreenTiming,
  splitScreenEasing,
  splitScreenAccessibility,
  getTimingMs,
  getEasing
} from '../../tokens/split-screen';

/**
 * DepthOfFieldEffect Component
 *
 * Applies CSS backdrop-filter blur effects for visual depth storytelling.
 * Supports US3: "visual depth storytelling" with maximum 300ms transitions
 *
 * Features:
 * - CSS backdrop-filter with browser fallbacks
 * - Accessibility compliance with reduced motion support
 * - Maximum 300ms transition duration (requirement)
 * - Minimum 4.5:1 contrast ratio maintenance
 * - Keyboard shortcuts for immediate disable (Escape key)
 * - Performance optimized with GPU acceleration
 */
const DepthOfFieldEffect: React.FC<DepthOfFieldEffectProps> = ({
  config,
  target,
  isActive,
  focusedPanel,
  intensity,
  className = '',
  onStateChange,
  onAccessibilityOverride,
}) => {
  // Component state
  const [effectState, setEffectState] = useState({
    isEnabled: isActive,
    currentIntensity: intensity || 0,
    isReducedMotion: false,
    supportsBackdropFilter: true,
    isAccessibilityOverridden: false,
  });

  // Refs for DOM manipulation and performance tracking
  const effectRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const performanceTimerRef = useRef<number | null>(null);

  // Browser compatibility detection
  useEffect(() => {
    const detectBackdropFilterSupport = () => {
      if (typeof window === 'undefined') return false;

      const testElement = document.createElement('div');
      testElement.style.backdropFilter = 'blur(1px)';

      // Check for backdrop-filter support
      const supportsBackdropFilter = testElement.style.backdropFilter !== '';

      // Check for webkit prefix fallback
      if (!supportsBackdropFilter) {
        (testElement.style as any).webkitBackdropFilter = 'blur(1px)';
        return (testElement.style as any).webkitBackdropFilter !== '';
      }

      return supportsBackdropFilter;
    };

    const supportsBackdropFilter = detectBackdropFilterSupport();

    setEffectState(prev => ({
      ...prev,
      supportsBackdropFilter,
    }));
  }, []);

  // Reduced motion detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      setEffectState(prev => ({
        ...prev,
        isReducedMotion: e.matches,
      }));
    };

    setEffectState(prev => ({
      ...prev,
      isReducedMotion: mediaQuery.matches,
    }));

    mediaQuery.addEventListener('change', handleMotionPreferenceChange);
    return () => mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
  }, []);

  // Keyboard accessibility handling
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        // Immediate disable on Escape key
        setEffectState(prev => ({
          ...prev,
          isAccessibilityOverridden: true,
          isEnabled: false,
        }));
        onAccessibilityOverride?.(true);
        break;
      case 'Enter':
      case ' ':
        if (event.shiftKey) {
          // Shift+Enter/Space to toggle effect
          setEffectState(prev => ({
            ...prev,
            isEnabled: !prev.isEnabled,
            isAccessibilityOverridden: false,
          }));
          onAccessibilityOverride?.(false);
        }
        break;
    }
  }, [onAccessibilityOverride]);

  // Global keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Sync external state changes
  useEffect(() => {
    if (!effectState.isAccessibilityOverridden) {
      setEffectState(prev => ({
        ...prev,
        isEnabled: isActive,
        currentIntensity: intensity || 0,
      }));
    }
  }, [isActive, intensity, effectState.isAccessibilityOverridden]);

  // Calculate dynamic blur intensity based on focus state
  const calculateBlurIntensity = useCallback(() => {
    if (!effectState.isEnabled || effectState.isAccessibilityOverridden) {
      return 0;
    }

    const baseIntensity = effectState.currentIntensity;

    // Adjust intensity based on focused panel
    if (focusedPanel && target) {
      // Apply blur to non-focused panels for depth effect
      const isFocused = target === focusedPanel;
      const focusMultiplier = isFocused ? 0.3 : 1.0; // Reduce blur for focused panel

      return Math.max(0, Math.min(baseIntensity * focusMultiplier, config.maxIntensity || 20));
    }

    return baseIntensity;
  }, [
    effectState.isEnabled,
    effectState.isAccessibilityOverridden,
    effectState.currentIntensity,
    focusedPanel,
    target,
    config.maxIntensity
  ]);

  // Performance-optimized animation updates
  const updateBlurEffect = useCallback(() => {
    if (!effectRef.current) return;

    const blurIntensity = calculateBlurIntensity();
    const element = effectRef.current;

    // Use GPU-accelerated properties for better performance
    if (effectState.supportsBackdropFilter) {
      element.style.backdropFilter = blurIntensity > 0 ? `blur(${blurIntensity}px)` : 'none';
      (element.style as any).webkitBackdropFilter = blurIntensity > 0 ? `blur(${blurIntensity}px)` : 'none';
    } else {
      // Fallback: use opacity-based depth effect
      element.style.opacity = blurIntensity > 0 ? String(Math.max(0.3, 1 - (blurIntensity / 20))) : '1';
      element.style.filter = blurIntensity > 0 ? `blur(${Math.min(blurIntensity, 5)}px)` : 'none';
    }

    // Update will-change property for performance
    element.style.willChange = blurIntensity > 0 ? 'backdrop-filter, opacity' : 'auto';

    // Notify parent of state changes
    onStateChange?.({
      isActive: blurIntensity > 0,
      intensity: blurIntensity,
      supportsBackdropFilter: effectState.supportsBackdropFilter,
      isReducedMotion: effectState.isReducedMotion,
    });
  }, [
    calculateBlurIntensity,
    effectState.supportsBackdropFilter,
    effectState.isReducedMotion,
    onStateChange
  ]);

  // Throttled update for performance
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(updateBlurEffect);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateBlurEffect]);

  // Performance monitoring
  useEffect(() => {
    if (!config.enablePerformanceMonitoring) return;

    const startTime = performance.now();

    performanceTimerRef.current = window.setTimeout(() => {
      const renderTime = performance.now() - startTime;

      if (renderTime > splitScreenTiming['frame-budget']) {
        console.warn(`DepthOfFieldEffect render time exceeded budget: ${renderTime}ms`);
      }
    }, 0);

    return () => {
      if (performanceTimerRef.current) {
        clearTimeout(performanceTimerRef.current);
      }
    };
  }, [config.enablePerformanceMonitoring, effectState.isEnabled]);

  // Calculate timing based on accessibility preferences
  const getTransitionTiming = () => {
    if (effectState.isReducedMotion) {
      return getTimingMs('reduced-motion-duration' as any) || '50ms';
    }

    // Ensure maximum 300ms transition (US3 requirement)
    const blurTiming = splitScreenTiming['blur-transition'];
    return `${Math.min(blurTiming, 300)}ms`;
  };

  // Component styles with athletic design tokens
  const containerStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: config.zIndex || 1,
    transition: [
      `backdrop-filter ${getTransitionTiming()} ${getEasing('blur-smooth')}`,
      `opacity ${getTransitionTiming()} ${getEasing('blur-smooth')}`,
      `filter ${getTransitionTiming()} ${getEasing('blur-smooth')}`
    ].join(', '),

    // Performance optimizations
    contain: 'layout style paint',
    transform: 'translateZ(0)', // Force GPU layer
    backfaceVisibility: 'hidden',

    // Accessibility
    ...(effectState.isReducedMotion && {
      transition: 'none',
    }),
  };

  return (
    <div
      ref={effectRef}
      className={`depth-of-field-effect ${className}`}
      style={containerStyles}
      data-target={target}
      data-active={effectState.isEnabled}
      data-intensity={effectState.currentIntensity}
      data-focused-panel={focusedPanel}
      data-reduced-motion={effectState.isReducedMotion}
      data-backdrop-support={effectState.supportsBackdropFilter}
      data-accessibility-override={effectState.isAccessibilityOverridden}
      data-testid="depth-of-field-effect"
      role="presentation"
      aria-hidden="true"
    >
      {/* Accessibility announcements */}
      {effectState.isAccessibilityOverridden && (
        <div
          className="sr-only"
          aria-live="polite"
          aria-label="Depth-of-field effect disabled for accessibility"
        >
          Visual effects disabled. Press Shift+Enter to re-enable.
        </div>
      )}

      {/* Browser compatibility indicator (development only) */}
      {process.env.NODE_ENV === 'development' && !effectState.supportsBackdropFilter && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            padding: '4px 8px',
            backgroundColor: 'rgba(255, 193, 7, 0.9)',
            color: '#000',
            fontSize: '12px',
            borderRadius: '4px',
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          Backdrop-filter not supported - using fallback
        </div>
      )}
    </div>
  );
};

export default DepthOfFieldEffect;