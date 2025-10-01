/**
 * useCursorTracking Hook
 *
 * High-frequency cursor position monitoring with RAF optimization for CursorLens component.
 * Provides 60fps cursor tracking (16ms response time) with performance monitoring and automatic cleanup.
 *
 * @fileoverview Phase 1: Setup and Foundation - Task 4: Custom Hook Implementation
 * @version 1.0.0
 * @since 2025-09-26
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Stats from 'stats.js';
import { useUnifiedPerformance } from '../contexts/UnifiedGameFlowContext';
import type { CursorTrackingHook, CursorPosition } from '../types/cursor-lens';

// Performance thresholds for 60fps targeting
const TARGET_FRAME_TIME = 16; // 16ms for 60fps
const DEGRADED_FRAME_TIME = 33; // 33ms for 30fps
const VELOCITY_SAMPLE_SIZE = 3; // Number of positions to average for velocity

// Safe performance timing utility
function getHighResTimestamp(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/**
 * High-frequency cursor tracking hook with RAF optimization
 *
 * Features:
 * - 60fps cursor position updates (16ms intervals)
 * - Velocity calculation for predictive positioning
 * - Performance monitoring with stats.js integration
 * - Automatic degradation detection and optimization
 * - Memory leak prevention with proper cleanup
 *
 * @returns CursorTrackingHook interface with position data and controls
 */
export const useCursorTracking = (): CursorTrackingHook => {
  // State management
  const [position, setPosition] = useState<CursorPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Performance monitoring integration
  const { actions: performanceActions } = useUnifiedPerformance();

  // Store performanceActions in ref to avoid circular dependencies
  const performanceActionsRef = useRef(performanceActions);
  performanceActionsRef.current = performanceActions;

  // Refs for RAF and performance tracking
  const rafIdRef = useRef<number | null>(null);
  const statsRef = useRef<Stats | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const positionHistoryRef = useRef<CursorPosition[]>([]);
  const currentMousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const isTrackingRef = useRef<boolean>(false); // Ref to avoid circular deps in cleanup
  const performanceMetricsRef = useRef({
    frameCount: 0,
    totalFrameTime: 0,
    droppedFrames: 0,
    lastFrameTime: 0
  });

  // Initialize performance monitoring
  const initializeStats = useCallback(() => {
    if (typeof window !== 'undefined' && !statsRef.current) {
      try {
        statsRef.current = new Stats();
        if (statsRef.current && typeof statsRef.current.showPanel === 'function') {
          statsRef.current.showPanel(0); // FPS panel

          // Position stats panel (hidden by default, can be shown for debugging)
          if (process.env.NODE_ENV === 'development' && statsRef.current.dom) {
            statsRef.current.dom.style.position = 'fixed';
            statsRef.current.dom.style.top = '0px';
            statsRef.current.dom.style.right = '0px';
            statsRef.current.dom.style.left = 'auto';
            statsRef.current.dom.style.zIndex = '999999';
            statsRef.current.dom.style.display = 'none'; // Hidden by default
            document.body.appendChild(statsRef.current.dom);
          }
        }
      } catch (error) {
        // Stats.js not available in test environment - continue without it
        statsRef.current = null;
      }
    }
  }, []);

  // Calculate velocity from position history
  const calculateVelocity = useCallback((positions: CursorPosition[]): { x: number; y: number } => {
    if (positions.length < 2) {
      return { x: 0, y: 0 };
    }

    const recentPositions = positions.slice(-VELOCITY_SAMPLE_SIZE);
    let totalVelocityX = 0;
    let totalVelocityY = 0;
    let validSamples = 0;

    for (let i = 1; i < recentPositions.length; i++) {
      const current = recentPositions[i];
      const previous = recentPositions[i - 1];
      const timeDelta = current.timestamp - previous.timestamp;

      if (timeDelta > 0) {
        const velocityX = (current.x - previous.x) / timeDelta;
        const velocityY = (current.y - previous.y) / timeDelta;

        totalVelocityX += velocityX;
        totalVelocityY += velocityY;
        validSamples++;
      }
    }

    if (validSamples === 0) {
      return { x: 0, y: 0 };
    }

    return {
      x: totalVelocityX / validSamples,
      y: totalVelocityY / validSamples
    };
  }, []);

  // Update performance metrics
  const updatePerformanceMetrics = useCallback((frameTime: number) => {
    const metrics = performanceMetricsRef.current;
    metrics.frameCount++;
    metrics.totalFrameTime += frameTime;
    metrics.lastFrameTime = frameTime;

    // Detect dropped frames (frame time > 20ms indicates sub-50fps)
    if (frameTime > 20) {
      metrics.droppedFrames++;
      performanceActionsRef.current.reportFrameDrop(1);
    }

    // Update performance metrics every 60 frames (~1 second at 60fps)
    if (metrics.frameCount % 60 === 0) {
      const averageFrameTime = metrics.totalFrameTime / metrics.frameCount;
      const currentFPS = 1000 / averageFrameTime;

      performanceActionsRef.current.updateMetrics({
        cursorTrackingFPS: Math.round(currentFPS),
        averageResponseTime: Math.round(averageFrameTime)
      });

      // Check for performance degradation
      const degradationLevel = performanceActionsRef.current.detectDegradation();
      if (degradationLevel !== 'none') {
        performanceActionsRef.current.applyOptimization(degradationLevel);
      }
    }
  }, []); // Empty deps - uses ref

  // RAF-based position update loop
  const updatePosition = useCallback(() => {
    // Use ref to avoid circular dependency with isTracking state
    if (!isTrackingRef.current || !currentMousePositionRef.current) {
      return;
    }

    const startTime = getHighResTimestamp();
    const now = startTime;

    // Performance throttling based on degradation level
    const updateInterval = performanceActionsRef.current.getOptimizedUpdateInterval();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

    if (timeSinceLastUpdate < updateInterval) {
      rafIdRef.current = requestAnimationFrame(updatePosition);
      return;
    }

    // Begin performance monitoring
    if (statsRef.current && typeof statsRef.current.begin === 'function') {
      statsRef.current.begin();
    }

    // Create new position with velocity
    const currentPos = currentMousePositionRef.current;
    const newPosition: CursorPosition = {
      x: currentPos.x,
      y: currentPos.y,
      timestamp: now
    };

    // Add to position history for velocity calculation
    positionHistoryRef.current.push(newPosition);

    // Limit history size to prevent memory growth
    if (positionHistoryRef.current.length > VELOCITY_SAMPLE_SIZE * 2) {
      positionHistoryRef.current = positionHistoryRef.current.slice(-VELOCITY_SAMPLE_SIZE);
    }

    // Calculate velocity
    const velocity = calculateVelocity(positionHistoryRef.current);
    newPosition.velocity = velocity;

    // Update state
    setPosition(newPosition);
    lastUpdateTimeRef.current = now;

    // End performance monitoring
    const endTime = getHighResTimestamp();
    const frameTime = endTime - startTime;

    if (statsRef.current && typeof statsRef.current.end === 'function') {
      statsRef.current.end();
    }

    updatePerformanceMetrics(frameTime);

    // Schedule next frame
    rafIdRef.current = requestAnimationFrame(updatePosition);
  }, [calculateVelocity, updatePerformanceMetrics, performanceActions]); // isTracking removed - using ref instead

  // Mouse move event handler
  const handleMouseMove = useCallback((event: MouseEvent) => {
    currentMousePositionRef.current = {
      x: event.clientX,
      y: event.clientY
    };
  }, []);

  // Mouse down event handler - capture initial position immediately
  const handleMouseDown = useCallback((event: MouseEvent) => {
    // Capture position synchronously on interaction
    currentMousePositionRef.current = {
      x: event.clientX,
      y: event.clientY
    };

    // Initialize position state if tracking but no position set yet
    if (isTracking && !position) {
      setPosition({
        x: event.clientX,
        y: event.clientY,
        timestamp: getHighResTimestamp()
      });
    }
  }, [isTracking, position]);

  // Start tracking function
  const startTracking = useCallback(() => {
    if (isTracking) return;

    setIsTracking(true);
    isTrackingRef.current = true; // Sync ref for cleanup
    performanceActionsRef.current.startTracking();

    // Reset performance metrics
    performanceMetricsRef.current = {
      frameCount: 0,
      totalFrameTime: 0,
      droppedFrames: 0,
      lastFrameTime: 0
    };

    // Initialize stats if needed
    initializeStats();

    // Add global mouse event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mousedown', handleMouseDown, { passive: true });
    }

    // Start RAF loop
    lastUpdateTimeRef.current = getHighResTimestamp();
    rafIdRef.current = requestAnimationFrame(updatePosition);
  }, [isTracking, initializeStats, handleMouseMove, handleMouseDown, updatePosition]); // performanceActions via ref

  // Store callbacks in refs to avoid circular dependencies
  const handleMouseMoveRef = useRef(handleMouseMove);
  const handleMouseDownRef = useRef(handleMouseDown);
  handleMouseMoveRef.current = handleMouseMove;
  handleMouseDownRef.current = handleMouseDown;

  // Stop tracking function
  const stopTracking = useCallback(() => {
    if (!isTrackingRef.current) return;

    setIsTracking(false);
    isTrackingRef.current = false; // Sync ref for cleanup
    performanceActionsRef.current.stopTracking();

    // Cancel RAF loop
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Remove global event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleMouseMoveRef.current);
      window.removeEventListener('mousedown', handleMouseDownRef.current);
    }

    // Clear position data
    setPosition(null);
    currentMousePositionRef.current = null;
    positionHistoryRef.current = [];
  }, []); // performanceActions via ref

  // Cleanup on unmount - uses refs to avoid circular dependencies
  useEffect(() => {
    return () => {
      // Cancel RAF loop
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Remove global event listeners - always remove, safe even if not added
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
      }

      // Clean up stats DOM element
      if (statsRef.current && statsRef.current.dom && statsRef.current.dom.parentNode) {
        statsRef.current.dom.parentNode.removeChild(statsRef.current.dom);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - cleanup should only run on unmount, uses refs for current values

  // Performance metrics calculation - stable reference without deps on changing ref values
  // Using a stable object that gets calculated on-demand instead of reactive dependencies
  const performance = useMemo(() => ({
    get frameRate(): number {
      return Math.round(
        performanceMetricsRef.current.frameCount > 0
          ? 1000 / (performanceMetricsRef.current.totalFrameTime / performanceMetricsRef.current.frameCount)
          : 60
      );
    },
    get averageLatency(): number {
      return Math.round(
        performanceMetricsRef.current.frameCount > 0
          ? performanceMetricsRef.current.totalFrameTime / performanceMetricsRef.current.frameCount
          : 16
      );
    }
  }), []); // Empty deps - getters will access current ref values without triggering re-renders

  // Memoize entire return object to prevent infinite loops
  // CRITICAL: Do NOT include isTracking in dependencies as it would cause circular updates
  return useMemo(() => ({
    position,
    isTracking,
    startTracking,
    stopTracking,
    performance
  }), [position, isTracking, startTracking, stopTracking, performance]);
};

export default useCursorTracking;