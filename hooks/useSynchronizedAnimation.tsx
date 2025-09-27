/**
 * useSynchronizedAnimation Hook
 *
 * RAF-based animation coordination system for Phase 5 split-screen storytelling.
 * Implements synchronized animation choreography with performance monitoring
 * and accessibility compliance.
 *
 * @fileoverview Synchronized animation hook shell
 * @version 1.0.0
 * @since Phase 5
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  SynchronizedAnimationConfig,
  SynchronizedAnimationState,
  UseSynchronizedAnimationReturn,
} from '../types/split-screen';
import {
  splitScreenTiming,
  splitScreenPerformance,
  splitScreenAccessibility
} from '../tokens/split-screen';

/**
 * useSynchronizedAnimation Hook
 *
 * Provides RAF-based animation coordination for split-screen components.
 * Supports US2: "coordinated transitions" with maximum 200ms stagger delay
 *
 * Features:
 * - RAF-based timing for 60fps performance
 * - Maximum 200ms stagger delay (requirement)
 * - Maximum 3 concurrent animations (performance limit)
 * - Accessibility compliance with reduced motion support
 * - Performance monitoring with frame rate tracking
 * - GPU acceleration optimization
 * - Animation sequence management
 */
export function useSynchronizedAnimation(
  config: SynchronizedAnimationConfig
): UseSynchronizedAnimationReturn {

  // Animation state management
  const [state, setState] = useState<SynchronizedAnimationState>({
    status: 'idle',
    progress: 0,
    currentStep: 0,
    rafId: null,
    metrics: {
      frameRate: 60,
      droppedFrames: 0,
      actualDuration: 0,
    },
  });

  // RAF and performance tracking refs
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);

  // Performance monitoring refs
  const frameTimesRef = useRef<number[]>([]);
  const performanceTimerRef = useRef<number | null>(null);

  // Reduced motion detection
  const prefersReducedMotion = useRef<boolean>(false);

  // Initialize reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion.current = mediaQuery.matches;

      const handleChange = (e: MediaQueryListEvent) => {
        prefersReducedMotion.current = e.matches;
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Calculate adjusted timing for accessibility
  const getAdjustedTiming = useCallback((baseDuration: number) => {
    if (prefersReducedMotion.current) {
      return Math.min(baseDuration, splitScreenAccessibility['reduced-motion-duration']);
    }
    return baseDuration;
  }, [splitScreenAccessibility]);

  // Performance monitoring function
  const updatePerformanceMetrics = useCallback((timestamp: number) => {
    if (lastFrameTimeRef.current > 0) {
      const frameDelta = timestamp - lastFrameTimeRef.current;
      frameTimesRef.current.push(frameDelta);

      // Keep only last 60 frame times for rolling average
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Calculate average frame rate
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const currentFps = Math.round(1000 / avgFrameTime);

      // Count dropped frames (frames taking longer than frame budget)
      const droppedFrames = frameTimesRef.current.filter(
        time => time > splitScreenPerformance['frame-budget-ms']
      ).length;

      setState(prev => ({
        ...prev,
        metrics: {
          frameRate: currentFps,
          droppedFrames,
          actualDuration: timestamp - startTimeRef.current - totalPausedTimeRef.current,
        },
      }));
    }
    lastFrameTimeRef.current = timestamp;
  }, [splitScreenPerformance]);

  // Main animation loop
  const animationLoop = useCallback((timestamp: number) => {
    updatePerformanceMetrics(timestamp);

    const adjustedDuration = getAdjustedTiming(config.duration);
    const elapsed = timestamp - startTimeRef.current - totalPausedTimeRef.current;
    const progress = Math.min(elapsed / adjustedDuration, 1);

    // Calculate current step based on progress and stagger
    let currentStep = 0;
    if (config.steps && config.steps.length > 0) {
      const staggerDelay = Math.min(config.staggerDelay || 0, splitScreenTiming['sync-delay']);
      const stepDuration = adjustedDuration / config.steps.length;

      for (let i = 0; i < config.steps.length; i++) {
        const stepStart = (i * stepDuration) + (i * staggerDelay);
        if (elapsed >= stepStart) {
          currentStep = i;
        }
      }
    }

    setState(prev => ({
      ...prev,
      progress,
      currentStep,
    }));

    // Execute step callback if provided
    if (config.steps && config.steps[currentStep] && config.onStepChange) {
      config.onStepChange(currentStep, config.steps[currentStep]);
    }

    // Execute progress callback if provided
    if (config.onProgress) {
      config.onProgress(progress);
    }

    // Continue animation if not complete
    if (progress < 1) {
      rafIdRef.current = requestAnimationFrame(animationLoop);
    } else {
      // Animation complete
      setState(prev => ({
        ...prev,
        status: 'idle',
        progress: 1,
        rafId: null,
      }));

      if (config.onComplete) {
        config.onComplete();
      }

      rafIdRef.current = null;
    }
  }, [config, getAdjustedTiming, updatePerformanceMetrics, splitScreenTiming]);

  // Animation control methods
  const start = useCallback(() => {
    // Prevent starting if already running
    if (state.status === 'running') {
      return;
    }

    // Validate animation count
    const animationCount = config.steps ? config.steps.length : 1;
    if (animationCount > splitScreenPerformance['max-concurrent-animations']) {
      console.warn(`Animation count (${animationCount}) exceeds maximum allowed (${splitScreenPerformance['max-concurrent-animations']})`);
      return;
    }

    // Reset timing references
    startTimeRef.current = performance.now();
    totalPausedTimeRef.current = 0;
    frameCountRef.current = 0;
    frameTimesRef.current = [];

    setState(prev => ({
      ...prev,
      status: 'running',
      progress: 0,
      currentStep: 0,
    }));

    // Start animation loop
    rafIdRef.current = requestAnimationFrame(animationLoop);

    // Set up performance monitoring
    if (performanceTimerRef.current) {
      clearInterval(performanceTimerRef.current);
    }

    performanceTimerRef.current = window.setInterval(() => {
      // Log performance metrics periodically
      if (state.metrics.frameRate < splitScreenPerformance['min-fps']) {
        console.warn(`Low frame rate detected: ${state.metrics.frameRate}fps`);
      }
    }, splitScreenPerformance['fps-sample-interval']);

  }, [state.status, config, animationLoop, splitScreenPerformance]);

  const pause = useCallback(() => {
    if (state.status !== 'running') {
      return;
    }

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    pausedTimeRef.current = performance.now();
    setState(prev => ({ ...prev, status: 'paused' }));
  }, [state.status]);

  const resume = useCallback(() => {
    if (state.status !== 'paused') {
      return;
    }

    // Calculate paused duration and add to total
    const pausedDuration = performance.now() - pausedTimeRef.current;
    totalPausedTimeRef.current += pausedDuration;

    setState(prev => ({ ...prev, status: 'running' }));
    rafIdRef.current = requestAnimationFrame(animationLoop);
  }, [state.status, animationLoop]);

  const stop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (performanceTimerRef.current) {
      clearInterval(performanceTimerRef.current);
      performanceTimerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
      currentStep: 0,
      rafId: null,
    }));

    // Execute stop callback if provided
    if (config.onStop) {
      config.onStop();
    }
  }, [config]);

  const reset = useCallback(() => {
    stop();

    // Reset all timing references
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    totalPausedTimeRef.current = 0;
    frameCountRef.current = 0;
    frameTimesRef.current = [];
    lastFrameTimeRef.current = 0;

    setState(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
      currentStep: 0,
      metrics: {
        frameRate: 60,
        droppedFrames: 0,
        actualDuration: 0,
      },
    }));
  }, [stop]);

  // Performance monitoring methods
  const getFrameRate = useCallback(() => {
    return state.metrics.frameRate;
  }, [state.metrics.frameRate]);

  const getDroppedFrames = useCallback(() => {
    return state.metrics.droppedFrames;
  }, [state.metrics.droppedFrames]);

  const resetMetrics = useCallback(() => {
    frameTimesRef.current = [];
    setState(prev => ({
      ...prev,
      metrics: {
        frameRate: 60,
        droppedFrames: 0,
        actualDuration: 0,
      },
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (performanceTimerRef.current) {
        clearInterval(performanceTimerRef.current);
      }
    };
  }, []);

  return {
    state,
    controls: {
      start,
      pause,
      resume,
      stop,
      reset,
    },
    metrics: {
      getFrameRate,
      getDroppedFrames,
      resetMetrics,
    },
  };
}