/**
 * CameraController Component
 *
 * Cinematic movement orchestration system for photographer's lightbox navigation.
 * Implements all 5 camera metaphors (pan/tilt, zoom, dolly zoom, rack focus, match cut)
 * with RAF-based animations optimized for 60fps performance.
 *
 * @fileoverview Camera movement orchestration with performance monitoring
 * @version 1.0.0
 * @since Task 5 - CameraController Implementation
 */

import React, { useRef, useCallback, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import type {
  CameraControllerProps,
  CameraMovement,
  CameraMovementConfig,
  CanvasPosition,
  CanvasPerformanceMetrics
} from '../types/canvas';
import { DEFAULT_CAMERA_MOVEMENTS } from '../types/canvas';
import { useUnifiedCanvas } from '../contexts/UnifiedGameFlowContext';

// Performance monitoring constants
const TARGET_FPS = 60;
const MIN_FPS_THRESHOLD = 45;
const FRAME_BUDGET_MS = 16.67; // 60fps frame budget
const MAX_CONCURRENT_ANIMATIONS = 3;
const PERFORMANCE_SAMPLE_SIZE = 60; // 1 second at 60fps

// Easing functions for camera movements
const EASING_FUNCTIONS = {
  'cubic-bezier(0.4, 0.0, 0.2, 1)': (t: number) => t * t * (3 - 2 * t), // ease-out
  'cubic-bezier(0.2, 0.0, 0.2, 1)': (t: number) => 1 - Math.pow(1 - t, 3), // ease-out-cubic
  'cubic-bezier(0.4, 0.0, 0.6, 1)': (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, // ease-in-out
  'cubic-bezier(0.25, 0.46, 0.45, 0.94)': (t: number) => 1 - Math.pow(1 - t, 4), // dolly-zoom easing
  'cubic-bezier(0.0, 0.0, 0.2, 1)': (t: number) => t * t * t // ease-in-cubic
} as const;

// Animation state management
interface AnimationState {
  isActive: boolean;
  movement: CameraMovement | null;
  startTime: number;
  duration: number;
  startPosition: CanvasPosition;
  targetPosition: CanvasPosition;
  config: CameraMovementConfig;
  rafId: number | null;
  progress: number;
}

// Performance tracking state
interface PerformanceState {
  frameRate: number;
  frameTimings: number[];
  lastFrameTime: number;
  droppedFrames: number;
  isOptimized: boolean;
  activeAnimations: number;
}

/**
 * CameraController - Orchestrates all camera movements with performance monitoring
 *
 * This component manages cinematic camera movements using RAF-based animations,
 * ensuring 60fps performance through automatic optimization and quality degradation.
 */
export const CameraController = forwardRef<any, CameraControllerProps>(({
  canvasState,
  onMovementExecute,
  onMovementComplete,
  onPerformanceUpdate
}, ref) => {
  // Hooks and context
  const { actions } = useUnifiedCanvas();

  // Animation state
  const [animationState, setAnimationState] = useState<AnimationState>({
    isActive: false,
    movement: null,
    startTime: 0,
    duration: 0,
    startPosition: { x: 0, y: 0, scale: 1.0 },
    targetPosition: { x: 0, y: 0, scale: 1.0 },
    config: DEFAULT_CAMERA_MOVEMENTS['pan-tilt'],
    rafId: null,
    progress: 0
  });

  // Performance monitoring state
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    frameRate: TARGET_FPS,
    frameTimings: [],
    lastFrameTime: 0,
    droppedFrames: 0,
    isOptimized: false,
    activeAnimations: 0
  });

  // Refs for RAF and performance tracking
  const rafIdRef = useRef<number | null>(null);
  const performanceTimerRef = useRef<number | null>(null);
  const dollyZoomUsedRef = useRef<boolean>(false);
  const rackFocusElementsRef = useRef<Set<HTMLElement>>(new Set());

  // Get easing function from config
  const getEasingFunction = useCallback((easing: string): (t: number) => number => {
    return EASING_FUNCTIONS[easing as keyof typeof EASING_FUNCTIONS] || EASING_FUNCTIONS['cubic-bezier(0.4, 0.0, 0.2, 1)'];
  }, []);

  // Calculate intermediate position with easing
  const calculateIntermediatePosition = useCallback((
    start: CanvasPosition,
    target: CanvasPosition,
    progress: number,
    easing: string,
    movement: CameraMovement
  ): CanvasPosition => {
    const easingFn = getEasingFunction(easing);
    const easedProgress = easingFn(progress);

    // Special handling for different movement types
    switch (movement) {
      case 'dolly-zoom':
        // Dolly zoom combines scale and translate for cinematic effect
        const dollyScale = start.scale + (target.scale - start.scale) * easedProgress;
        const compensateTranslate = (1 / dollyScale - 1) * 50; // Parallax compensation
        return {
          x: start.x + (target.x - start.x) * easedProgress + compensateTranslate,
          y: start.y + (target.y - start.y) * easedProgress + compensateTranslate,
          scale: dollyScale
        };

      case 'zoom-in':
      case 'zoom-out':
        // Smooth scale transitions with position adjustment to maintain center
        const zoomScale = start.scale + (target.scale - start.scale) * easedProgress;
        return {
          x: start.x + (target.x - start.x) * easedProgress,
          y: start.y + (target.y - start.y) * easedProgress,
          scale: zoomScale
        };

      default:
        // Standard pan/tilt and match-cut movements
        return {
          x: start.x + (target.x - start.x) * easedProgress,
          y: start.y + (target.y - start.y) * easedProgress,
          scale: start.scale + (target.scale - start.scale) * easedProgress
        };
    }
  }, [getEasingFunction]);

  // Performance monitoring and optimization
  const updatePerformanceMetrics = useCallback((timestamp: number) => {
    setPerformanceState(prev => {
      const frameTime = timestamp - prev.lastFrameTime;
      const newFrameTimings = [...prev.frameTimings, frameTime].slice(-PERFORMANCE_SAMPLE_SIZE);

      // Calculate current frame rate
      const averageFrameTime = newFrameTimings.reduce((a, b) => a + b, 0) / newFrameTimings.length;
      const currentFPS = 1000 / averageFrameTime;

      // Count dropped frames (> 20ms frame time indicates dropped frame)
      const droppedFrames = frameTime > 20 ? prev.droppedFrames + 1 : prev.droppedFrames;

      // Determine if optimization is needed
      const needsOptimization = currentFPS < MIN_FPS_THRESHOLD || frameTime > FRAME_BUDGET_MS * 1.5;

      const newState = {
        frameRate: currentFPS,
        frameTimings: newFrameTimings,
        lastFrameTime: timestamp,
        droppedFrames,
        isOptimized: needsOptimization || prev.activeAnimations > MAX_CONCURRENT_ANIMATIONS,
        activeAnimations: prev.activeAnimations
      };

      // Report metrics to parent
      const metrics: CanvasPerformanceMetrics = {
        canvasRenderFPS: currentFPS,
        averageMovementTime: averageFrameTime,
        transformOverhead: frameTime,
        canvasMemoryMB: (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 0,
        gpuUtilization: currentFPS > 55 ? 85 : 60, // Estimate based on performance
        activeOperations: prev.activeAnimations
      };

      onPerformanceUpdate(metrics);

      return newState;
    });
  }, [onPerformanceUpdate]);

  // Main animation loop with RAF
  const animationLoop = useCallback((timestamp: number) => {
    updatePerformanceMetrics(timestamp);

    setAnimationState(prev => {
      if (!prev.isActive || !prev.movement) return prev;

      const elapsed = timestamp - prev.startTime;
      const progress = Math.min(elapsed / prev.duration, 1);

      // Calculate current position
      const currentPosition = calculateIntermediatePosition(
        prev.startPosition,
        prev.targetPosition,
        progress,
        prev.config.easing,
        prev.movement
      );

      // Update canvas position
      actions.canvas.updateCanvasPosition(currentPosition);

      // Continue animation or complete
      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animationLoop);
        return { ...prev, progress };
      } else {
        // Animation complete
        onMovementComplete(prev.movement);
        setPerformanceState(perf => ({ ...perf, activeAnimations: perf.activeAnimations - 1 }));

        return {
          ...prev,
          isActive: false,
          movement: null,
          rafId: null,
          progress: 1
        };
      }
    });
  }, [updatePerformanceMetrics, calculateIntermediatePosition, actions.canvas, onMovementComplete]);

  // Execute camera movement
  const executeMovement = useCallback(async (
    movement: CameraMovement,
    targetPosition: CanvasPosition,
    customConfig?: Partial<CameraMovementConfig>
  ) => {
    // Prevent dolly zoom from being used more than once
    if (movement === 'dolly-zoom' && dollyZoomUsedRef.current) {
      console.warn('Dolly zoom effect can only be used once per session');
      return Promise.resolve();
    }

    // Check concurrent animation limit
    if (performanceState.activeAnimations >= MAX_CONCURRENT_ANIMATIONS) {
      console.warn('Maximum concurrent animations reached, skipping movement');
      return Promise.resolve();
    }

    const config = { ...DEFAULT_CAMERA_MOVEMENTS[movement], ...customConfig };
    const startTime = performance.now();

    // Apply performance optimizations if needed
    if (performanceState.isOptimized) {
      config.duration = Math.min(config.duration, 600); // Reduce duration
      config.useGPU = true; // Force GPU acceleration
    }

    // Mark dolly zoom as used
    if (movement === 'dolly-zoom') {
      dollyZoomUsedRef.current = true;
    }

    // Cancel any existing animation
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Update performance tracking
    setPerformanceState(prev => ({ ...prev, activeAnimations: prev.activeAnimations + 1 }));

    // Start new animation
    setAnimationState({
      isActive: true,
      movement,
      startTime,
      duration: config.duration,
      startPosition: canvasState.currentPosition,
      targetPosition,
      config,
      rafId: null,
      progress: 0
    });

    // Execute callback
    await onMovementExecute(movement, config);

    // Start animation loop
    rafIdRef.current = requestAnimationFrame(animationLoop);
  }, [
    performanceState.activeAnimations,
    performanceState.isOptimized,
    canvasState.currentPosition,
    onMovementExecute,
    animationLoop
  ]);

  // Rack focus implementation for hover effects
  const applyRackFocus = useCallback((targetElement: HTMLElement, isFocused: boolean) => {
    const elements = document.querySelectorAll('[data-spatial-section]');

    elements.forEach(element => {
      const htmlElement = element as HTMLElement;

      if (htmlElement === targetElement) {
        // Focus the target element
        if (isFocused) {
          htmlElement.style.filter = 'blur(0px)';
          htmlElement.style.opacity = '1';
          htmlElement.style.transform = `${htmlElement.style.transform} scale(1.02)`;
          rackFocusElementsRef.current.add(htmlElement);
        }
      } else {
        // Blur other elements
        if (isFocused) {
          htmlElement.style.filter = 'blur(2px)';
          htmlElement.style.opacity = '0.7';
          htmlElement.style.transition = 'filter 0.3s ease, opacity 0.3s ease';
        } else {
          // Remove rack focus effects
          htmlElement.style.filter = '';
          htmlElement.style.opacity = '';
          htmlElement.style.transition = '';
          rackFocusElementsRef.current.delete(htmlElement);
        }
      }
    });
  }, []);

  // Match cut implementation - track shared elements between sections
  const executeMatchCut = useCallback(async (
    fromSection: string,
    toSection: string,
    sharedElementSelector: string = '.shared-element'
  ) => {
    const fromElement = document.querySelector(`[data-section="${fromSection}"] ${sharedElementSelector}`);
    const toElement = document.querySelector(`[data-section="${toSection}"] ${sharedElementSelector}`);

    if (!fromElement || !toElement) {
      console.warn('Match cut elements not found, falling back to pan-tilt');
      // Fallback to regular pan-tilt movement
      const fallbackPosition: CanvasPosition = {
        x: canvasState.currentPosition.x + 50,
        y: canvasState.currentPosition.y + 50,
        scale: canvasState.currentPosition.scale
      };
      return await executeMovement('pan-tilt', fallbackPosition);
    }

    // Calculate element positions for smooth transition
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();

    // Create intermediate position based on element positions
    const intermediatePosition: CanvasPosition = {
      x: canvasState.currentPosition.x + (toRect.left - fromRect.left),
      y: canvasState.currentPosition.y + (toRect.top - fromRect.top),
      scale: canvasState.currentPosition.scale
    };

    return await executeMovement('match-cut', intermediatePosition);
  }, [canvasState.currentPosition, executeMovement]);

  // Public API for camera movements
  const cameraAPI = useMemo(() => ({
    // Pan/tilt movement for section navigation
    panTilt: (targetPosition: CanvasPosition) =>
      executeMovement('pan-tilt', targetPosition),

    // Zoom movements for detail changes
    zoomIn: (targetPosition: CanvasPosition, scaleFactor: number = 1.5) =>
      executeMovement('zoom-in', { ...targetPosition, scale: scaleFactor }),

    zoomOut: (targetPosition: CanvasPosition, scaleFactor: number = 1.0) =>
      executeMovement('zoom-out', { ...targetPosition, scale: scaleFactor }),

    // Dolly zoom for cinematic impact (single use)
    dollyZoom: (targetPosition: CanvasPosition) =>
      executeMovement('dolly-zoom', targetPosition),

    // Rack focus for hover effects
    rackFocus: applyRackFocus,

    // Match cut for element tracking
    matchCut: executeMatchCut,

    // General movement execution
    execute: executeMovement,

    // Test helper methods
    startTestMovement: (movement: CameraMovement = 'pan-tilt') => {
      const targetPosition: CanvasPosition = {
        x: 100,
        y: 100,
        scale: movement === 'zoom-in' ? 1.5 : movement === 'zoom-out' ? 0.8 : 1.0
      };
      return executeMovement(movement, targetPosition);
    },

    // Test dolly zoom specifically
    testDollyZoom: () => {
      const targetPosition: CanvasPosition = { x: 150, y: 150, scale: 1.8 };
      return executeMovement('dolly-zoom', targetPosition);
    },

    // Test match cut with fallback
    testMatchCut: (removeElements: boolean = false) => {
      if (removeElements) {
        // Remove elements to test fallback
        document.querySelectorAll('.shared-element').forEach(el => el.remove());
      }
      return executeMatchCut('capture', 'focus');
    },

    // Performance optimization control
    optimize: () => setPerformanceState(prev => ({ ...prev, isOptimized: true })),
    unoptimize: () => setPerformanceState(prev => ({ ...prev, isOptimized: false })),

    // Animation state queries
    isAnimating: animationState.isActive,
    currentMovement: animationState.movement,
    progress: animationState.progress
  }), [executeMovement, applyRackFocus, executeMatchCut, animationState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (performanceTimerRef.current) {
        clearInterval(performanceTimerRef.current);
      }

      // Clear any rack focus effects
      rackFocusElementsRef.current.forEach(element => {
        element.style.filter = '';
        element.style.opacity = '';
        element.style.transition = '';
      });
    };
  }, []);

  // Start performance monitoring immediately and continuously
  useEffect(() => {
    const startTime = performance.now();

    // Initial performance measurement
    updatePerformanceMetrics(startTime);

    // Set up continuous monitoring
    performanceTimerRef.current = window.setInterval(() => {
      updatePerformanceMetrics(performance.now());
    }, 100); // Update every 100ms for more responsive monitoring

    // Also trigger RAF for performance tracking
    const performanceRAF = () => {
      updatePerformanceMetrics(performance.now());
      if (!animationState.isActive) {
        rafIdRef.current = requestAnimationFrame(performanceRAF);
      }
    };

    rafIdRef.current = requestAnimationFrame(performanceRAF);

    return () => {
      if (performanceTimerRef.current) {
        clearInterval(performanceTimerRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [updatePerformanceMetrics]);

  // Expose camera API via ref (for external access)
  useImperativeHandle(ref, () => cameraAPI, [cameraAPI]);

  // Debug information (development only)
  const debugInfo = process.env.NODE_ENV === 'development' ? (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs font-mono z-50">
      <div className="text-athletic-court-orange font-semibold mb-2">CAMERA CONTROLLER</div>
      <div>Status: {animationState.isActive ? 'ACTIVE' : 'IDLE'}</div>
      <div>Movement: {animationState.movement || 'None'}</div>
      <div>Progress: {(animationState.progress * 100).toFixed(1)}%</div>
      <div>FPS: {performanceState.frameRate.toFixed(1)}</div>
      <div>Active Animations: {performanceState.activeAnimations}</div>
      <div>Optimized: {performanceState.isOptimized ? 'Yes' : 'No'}</div>
      <div>Dolly Used: {dollyZoomUsedRef.current ? 'Yes' : 'No'}</div>
      <div className="text-athletic-neutral-400 mt-1">
        Dropped Frames: {performanceState.droppedFrames}
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Camera controller is primarily a logic component */}
      {debugInfo}
    </>
  );
});

// Set display name for debugging
CameraController.displayName = 'CameraController';

// Default export
export default CameraController;

// CSS styles for camera effects (to be added to global CSS)
export const CameraControllerStyles = `
  /* Hardware acceleration for camera movements */
  [data-spatial-section] {
    transform-style: preserve-3d;
    backface-visibility: hidden;
    perspective: 1000px;
  }

  /* Rack focus transitions */
  [data-spatial-section].rack-focus-transition {
    transition: filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  }

  /* Dolly zoom effect */
  .dolly-zoom-container {
    transform-origin: center center;
    will-change: transform;
  }

  /* Match cut shared elements */
  .match-cut-element {
    transform-origin: center center;
    will-change: transform;
    position: relative;
    z-index: 100;
  }

  /* Performance optimization classes */
  .gpu-optimized {
    transform: translateZ(0);
    will-change: transform;
  }

  .reduced-motion [data-spatial-section] {
    transition: none !important;
    animation: none !important;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    [data-spatial-section] {
      will-change: auto;
    }

    .gpu-optimized {
      transform: none;
    }
  }
`;