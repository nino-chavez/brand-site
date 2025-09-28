/**
 * LightboxCanvas Component
 *
 * Primary 2D spatial container for photographer's lightbox navigation system.
 * Implements hardware-accelerated CSS transforms for smooth cinematic camera movements
 * across a spatial grid of 6 photography workflow sections.
 *
 * @fileoverview Main canvas container with spatial coordinate system
 * @version 1.0.0
 * @since Task 3 - LightboxCanvas Component Foundation
 */

import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import type { LightboxCanvasProps } from '../types/canvas';
import { useUnifiedCanvas } from '../contexts/UnifiedGameFlowContext';
import { validateCanvasPosition, calculateMovementDuration } from '../utils/canvasCoordinateTransforms';
import type { CanvasPosition, SpatialLayout } from '../types/canvas';
import { CanvasPerformanceMonitor, measureCanvasOperation, optimizedRAF } from '../utils/canvasPerformanceMonitor';
import { CanvasQualityManager, getQualityManager, type QualityLevel } from '../utils/canvasQualityManager';
import { CompatibilityFallbacks, ProgressiveEnhancement } from '../utils/browserCompat';
import { useSpatialAccessibility } from '../hooks/useSpatialAccessibility';
import type { PhotoWorkflowSection } from '../types/cursor-lens';

// Constants for spatial grid system
const GRID_LAYOUTS = {
  '2x3': { rows: 2, cols: 3, width: 400, height: 300 },
  '3x2': { rows: 3, cols: 2, width: 300, height: 400 },
  '1x6': { rows: 1, cols: 6, width: 1200, height: 200 },
  'circular': { rows: 2, cols: 3, width: 400, height: 300 } // Same as 2x3 but with circular positioning
} as const;

// Viewport constraints for boundary management
const DEFAULT_VIEWPORT_CONSTRAINTS = {
  minPosition: { x: -600, y: -400, scale: 0.5 },
  maxPosition: { x: 600, y: 400, scale: 3.0 },
  minScale: 0.5,
  maxScale: 3.0,
  padding: 50
};

/**
 * LightboxCanvas - Main spatial navigation container
 *
 * This component serves as the primary viewport for 2D canvas navigation,
 * managing spatial positioning, camera movements, and performance optimization.
 */
export const LightboxCanvas: React.FC<LightboxCanvasProps> = ({
  canvasState,
  canvasActions,
  children,
  className = '',
  performanceMode = 'balanced',
  debugMode = false
}) => {
  // Hooks and state
  const { state, actions, performance } = useUnifiedCanvas();
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  // Browser compatibility
  const compat = useMemo(() => CompatibilityFallbacks.getInstance(), []);
  const enhancement = useMemo(() => new ProgressiveEnhancement(), []);

  // Performance monitoring
  const performanceMonitorRef = useRef<CanvasPerformanceMonitor | null>(null);
  const qualityManagerRef = useRef<CanvasQualityManager | null>(null);
  const [currentQuality, setCurrentQuality] = useState<QualityLevel>('highest');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    frameTime: 16.67,
    memoryMB: 0
  });

  // Spatial accessibility
  const spatialAccessibility = useSpatialAccessibility({
    enableSpatialNavigation: true,
    enableCameraControls: true,
    enableSpatialAnnouncements: true,
    enableDirectionalHints: true,
    debugMode: debugMode,
    keyboardShortcuts: {
      panSpeed: 100,
      zoomSpeed: 0.1,
      enableCustomShortcuts: true
    }
  });

  // Memoized layout configuration
  const layoutConfig = useMemo(() => {
    return GRID_LAYOUTS[state.layout] || GRID_LAYOUTS['3x2'];
  }, [state.layout]);

  // Memoized transform style for hardware acceleration
  const canvasTransform = useMemo(() => {
    const { x, y, scale } = state.currentPosition;

    // Validate position within constraints
    const validatedPosition = validateCanvasPosition(
      { x, y, scale },
      DEFAULT_VIEWPORT_CONSTRAINTS
    );

    if (!validatedPosition.success) {
      console.warn('Canvas position validation failed:', validatedPosition.error);
    }

    const finalPosition = validatedPosition.success ? validatedPosition.position : { x, y, scale };

    // Cross-browser compatible transform with fallbacks
    const baseTransformStyle = compat.getTransformStyle(-finalPosition.x, -finalPosition.y);

    // Enhanced styles with scale and progressive enhancement
    const enhancedStyle = enhancement.enhanceStyles(baseTransformStyle, {
      animation: {
        duration: isTransitioning ? 300 : 0,
        easing: 'ease-out'
      }
    });

    // Scale transform (applied separately due to compatibility system limitations)
    const scaleTransform = finalPosition.scale !== 1 ? ` scale(${finalPosition.scale})` : '';
    const finalTransform = enhancedStyle.transform + scaleTransform;

    return {
      ...enhancedStyle,
      transform: finalTransform,
      transformOrigin: 'center center',
      willChange: isTransitioning ? 'transform' : 'auto',
      backfaceVisibility: compat.isSupported('transform3d') ? 'hidden' as const : undefined,
      perspective: compat.isSupported('transform3d') ? '1000px' : undefined
    };
  }, [state.currentPosition, isTransitioning, compat, enhancement]);

  // CSS classes based on performance mode
  const canvasClasses = useMemo(() => {
    const baseClasses = [
      'lightbox-canvas',
      'relative',
      'w-full',
      'h-full',
      'overflow-hidden'
    ];

    // Add performance-specific classes
    switch (performanceMode) {
      case 'high':
        baseClasses.push('gpu-accelerated', 'optimized-rendering');
        break;
      case 'low':
        baseClasses.push('cpu-fallback', 'reduced-effects');
        break;
      default: // balanced
        baseClasses.push('balanced-performance');
    }

    if (isTransitioning) {
      baseClasses.push('canvas-transitioning');
    }

    if (debugMode) {
      baseClasses.push('canvas-debug');
    }

    return baseClasses.concat(className.split(' ')).join(' ');
  }, [performanceMode, isTransitioning, debugMode, className]);

  // Enhanced performance monitoring
  const trackCanvasPerformance = useCallback(() => {
    if (!canvasRef.current || !performanceMonitorRef.current) return;

    return measureCanvasOperation('canvas-render', () => {
      const safeNow = () => {
        try {
          return performance?.now?.() ?? Date.now();
        } catch {
          return Date.now();
        }
      };

      const startTime = safeNow();

      // Measure render performance
      requestAnimationFrame(() => {
        const renderTime = safeNow() - startTime;
        const fps = 1000 / renderTime;

        // Update performance metrics
        const metrics = {
          canvasRenderFPS: Math.round(fps),
          transformOverhead: renderTime,
          activeOperations: isTransitioning ? 1 : 0,
          canvasMemoryMB: performanceMetrics.memoryMB,
          averageMovementTime: renderTime,
          gpuUtilization: fps > 55 ? 85 : 60
        };

        actions.canvas.updateCanvasMetrics?.(metrics);
        setRenderCount(prev => prev + 1);

        // Update local performance state
        setPerformanceMetrics({
          fps: Math.round(fps),
          frameTime: renderTime,
          memoryMB: performanceMetrics.memoryMB
        });
      });
    }, performanceMonitorRef.current);
  }, [actions.canvas, isTransitioning, performanceMetrics.memoryMB]);

  // Enhanced camera movement handler with performance optimization
  const executeCanvasMovement = useCallback(async (
    targetPosition: CanvasPosition,
    movement: 'pan-tilt' | 'zoom-in' | 'zoom-out' | 'dolly-zoom' | 'rack-focus' | 'match-cut' = 'pan-tilt'
  ) => {
    if (isTransitioning) return;

    const startTime = performance.now();
    const fromPosition = state.currentPosition;
    const qualityManager = qualityManagerRef.current;

    setIsTransitioning(true);
    actions.canvas.setTargetPosition(targetPosition);

    // Get optimized animation config based on current quality
    const animConfig = qualityManager?.getAnimationConfig(movement) || {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      useGPU: true,
      skipFrames: false
    };

    // Calculate movement duration
    const duration = animConfig.duration;

    // Execute camera movement with performance-optimized RAF
    const animateMovement = (currentTime: number) => {
      return measureCanvasOperation(`movement-${movement}`, () => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Apply quality-based frame skipping
        if (animConfig.skipFrames && progress < 1 && Math.random() > 0.8) {
          animationRef.current = optimizedRAF(animateMovement, currentQuality);
          return;
        }

        // Easing function (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 2);

        // Interpolate position
        const currentPosition: CanvasPosition = {
          x: fromPosition.x + (targetPosition.x - fromPosition.x) * easedProgress,
          y: fromPosition.y + (targetPosition.y - fromPosition.y) * easedProgress,
          scale: fromPosition.scale + (targetPosition.scale - fromPosition.scale) * easedProgress
        };

        // Update canvas position
        actions.canvas.updateCanvasPosition(currentPosition);

        if (progress < 1) {
          animationRef.current = optimizedRAF(animateMovement, currentQuality);
        } else {
          // Movement complete
          setIsTransitioning(false);
          actions.canvas.setTargetPosition(null);

          // Track performance
          const completionTime = performance.now() - startTime;

          // Track with performance monitor
          performanceMonitorRef.current?.trackTransition(
            fromPosition,
            targetPosition,
            movement,
            completionTime
          );

          // Track with existing system
          actions.performance?.trackCanvasTransition?.(
            fromPosition,
            targetPosition,
            movement,
            completionTime,
            true
          );
        }
      }, performanceMonitorRef.current!);
    };

    animationRef.current = optimizedRAF(animateMovement, currentQuality);
  }, [state.currentPosition, isTransitioning, actions, currentQuality]);

  // Spatial grid positioning calculator
  const calculateSectionPosition = useCallback((
    gridX: number,
    gridY: number,
    layout: SpatialLayout = state.layout
  ): CanvasPosition => {
    const config = GRID_LAYOUTS[layout];
    const cellWidth = config.width / config.cols;
    const cellHeight = config.height / config.rows;

    // Calculate position relative to grid center
    const centerX = (config.cols - 1) * cellWidth / 2;
    const centerY = (config.rows - 1) * cellHeight / 2;

    const x = (gridX * cellWidth) - centerX;
    const y = (gridY * cellHeight) - centerY;

    return { x, y, scale: 1.0 };
  }, [state.layout]);

  // Enhanced touch gesture handlers for mobile support
  const [touchStartPosition, setTouchStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [isActiveTouch, setIsActiveTouch] = useState(false);
  const [touchFeedback, setTouchFeedback] = useState<{ x: number; y: number; type: 'pan' | 'zoom' } | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    setTouchStartTime(Date.now());
    setIsActiveTouch(true);

    if (event.touches.length === 2) {
      // Enhanced pinch-to-zoom gesture with center point tracking
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];

      const initialDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // Calculate center point between touches
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      actions.canvas.updateTouchState({
        initialDistance,
        initialPosition: state.currentPosition,
        // Enhanced touch state for better tracking
        centerPoint: { x: centerX, y: centerY },
        touch1Initial: { x: touch1.clientX, y: touch1.clientY },
        touch2Initial: { x: touch2.clientX, y: touch2.clientY }
      });
      actions.canvas.setZoomingState(true);

      // Show zoom feedback
      setTouchFeedback({ x: centerX, y: centerY, type: 'zoom' });
    } else if (event.touches.length === 1) {
      // Single finger pan gesture
      const touch = event.touches[0];
      setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
      actions.canvas.setPanningState(true);

      // Show pan feedback
      setTouchFeedback({ x: touch.clientX, y: touch.clientY, type: 'pan' });
    }
  }, [state.currentPosition, actions.canvas]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault(); // Prevent default scroll behavior

    if (event.touches.length === 2 && state.interaction.touchState.initialDistance) {
      // Enhanced pinch-to-zoom with two-finger pan support
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];

      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // Calculate current center point
      const currentCenterX = (touch1.clientX + touch2.clientX) / 2;
      const currentCenterY = (touch1.clientY + touch2.clientY) / 2;

      const scaleMultiplier = currentDistance / state.interaction.touchState.initialDistance;
      const initialPosition = state.interaction.touchState.initialPosition;
      const initialCenter = state.interaction.touchState.centerPoint;

      if (initialPosition && initialCenter) {
        // Enhanced scale limits with smooth scaling
        const targetScale = initialPosition.scale * scaleMultiplier;
        const newScale = Math.max(
          DEFAULT_VIEWPORT_CONSTRAINTS.minScale,
          Math.min(DEFAULT_VIEWPORT_CONSTRAINTS.maxScale, targetScale)
        );

        // Two-finger pan calculation - track center point movement
        const centerDeltaX = currentCenterX - initialCenter.x;
        const centerDeltaY = currentCenterY - initialCenter.y;

        // Apply pan movement scaled by current zoom level
        const panSensitivity = 1.0 / state.currentPosition.scale;
        const newX = initialPosition.x - (centerDeltaX * panSensitivity);
        const newY = initialPosition.y - (centerDeltaY * panSensitivity);

        actions.canvas.updateCanvasPosition({
          x: newX,
          y: newY,
          scale: newScale
        });

        // Update feedback position
        setTouchFeedback({ x: currentCenterX, y: currentCenterY, type: 'zoom' });
      }
    } else if (event.touches.length === 1 && touchStartPosition && state.interaction.isPanning) {
      // Single finger pan gesture
      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStartPosition.x;
      const deltaY = touch.clientY - touchStartPosition.y;

      // Apply pan movement with sensitivity based on scale
      const panSensitivity = 1.0 / state.currentPosition.scale;
      const newX = state.currentPosition.x - (deltaX * panSensitivity);
      const newY = state.currentPosition.y - (deltaY * panSensitivity);

      actions.canvas.updateCanvasPosition({
        ...state.currentPosition,
        x: newX,
        y: newY
      });

      // Update feedback position
      setTouchFeedback({ x: touch.clientX, y: touch.clientY, type: 'pan' });

      // Update start position for next move
      setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
    }
  }, [state.interaction.touchState, state.currentPosition, actions.canvas, touchStartPosition]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    event.preventDefault();

    // Clear touch state
    actions.canvas.setPanningState(false);
    actions.canvas.setZoomingState(false);
    actions.canvas.updateTouchState({
      initialDistance: null,
      initialPosition: null,
      centerPoint: null,
      touch1Initial: null,
      touch2Initial: null
    });

    // Clear local touch tracking
    setTouchStartPosition(null);
    setIsActiveTouch(false);

    // Fade out touch feedback
    if (touchFeedback) {
      setTimeout(() => setTouchFeedback(null), 200);
    }

    // Validate final position within constraints
    const validatedPosition = validateCanvasPosition(
      state.currentPosition,
      DEFAULT_VIEWPORT_CONSTRAINTS
    );

    if (validatedPosition.success && validatedPosition.position) {
      actions.canvas.updateCanvasPosition(validatedPosition.position);
    }
  }, [actions.canvas, touchFeedback, state.currentPosition]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    if (!state.accessibility.keyboardSpatialNav) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { currentPosition } = state;
      const moveDistance = 50;
      let newPosition: CanvasPosition | null = null;

      switch (event.key) {
        case 'ArrowLeft':
          newPosition = { ...currentPosition, x: currentPosition.x - moveDistance };
          break;
        case 'ArrowRight':
          newPosition = { ...currentPosition, x: currentPosition.x + moveDistance };
          break;
        case 'ArrowUp':
          newPosition = { ...currentPosition, y: currentPosition.y - moveDistance };
          break;
        case 'ArrowDown':
          newPosition = { ...currentPosition, y: currentPosition.y + moveDistance };
          break;
        case '+':
        case '=':
          newPosition = { ...currentPosition, scale: Math.min(3.0, currentPosition.scale * 1.1) };
          break;
        case '-':
          newPosition = { ...currentPosition, scale: Math.max(0.5, currentPosition.scale * 0.9) };
          break;
      }

      if (newPosition) {
        event.preventDefault();
        executeCanvasMovement(newPosition, 'pan-tilt');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.accessibility.keyboardSpatialNav, state.currentPosition, executeCanvasMovement]);

  // Initialize performance monitoring
  useEffect(() => {
    // Initialize performance monitor
    performanceMonitorRef.current = new CanvasPerformanceMonitor(
      (metrics) => {
        // Update performance metrics
        setPerformanceMetrics({
          fps: metrics.canvasRenderFPS,
          frameTime: 1000 / metrics.canvasRenderFPS,
          memoryMB: metrics.canvasMemoryMB
        });

        // Update unified context
        actions.canvas.updateCanvasMetrics?.(metrics);
      },
      (qualityLevel) => {
        setCurrentQuality(qualityLevel);
      }
    );

    // Initialize quality manager
    qualityManagerRef.current = getQualityManager();
    qualityManagerRef.current.addListener((event) => {
      setCurrentQuality(event.newLevel);

      // Apply quality-specific optimizations
      if (canvasRef.current) {
        const optimizations = qualityManagerRef.current!.getCSSOptimizations();
        Object.entries(optimizations).forEach(([property, value]) => {
          canvasRef.current!.style.setProperty(property, value);
        });
      }
    });

    // Start monitoring
    performanceMonitorRef.current.start();
    performanceMonitorRef.current.setDebugMode(debugMode);

    return () => {
      performanceMonitorRef.current?.stop();
    };
  }, [actions.canvas, debugMode]);

  // Performance monitoring effect
  useEffect(() => {
    trackCanvasPerformance();
  }, [trackCanvasPerformance, state.currentPosition]);

  // Quality-based performance adjustment
  useEffect(() => {
    const qualityManager = qualityManagerRef.current;
    if (qualityManager) {
      qualityManager.handlePerformanceChange(
        performanceMetrics.fps,
        performanceMetrics.frameTime,
        performanceMetrics.memoryMB
      );
    }
  }, [performanceMetrics]);

  // Canvas bounds optimization
  useEffect(() => {
    if (!performanceMonitorRef.current || !canvasRef.current) return;

    const canvasElement = canvasRef.current;
    const viewport = {
      x: 0,
      y: 0,
      width: canvasElement.clientWidth,
      height: canvasElement.clientHeight
    };

    // Find all spatial sections
    const sections = Array.from(canvasElement.querySelectorAll('[data-spatial-section]')).map(element => ({
      id: element.getAttribute('data-spatial-section') || '',
      element: element as HTMLElement,
      position: { x: 0, y: 0, scale: 1.0 } // Would be calculated based on section mapping
    }));

    // Optimize canvas bounds
    performanceMonitorRef.current.optimizeCanvasBounds(
      state.currentPosition,
      viewport,
      sections
    );
  }, [state.currentPosition]);

  // Spatial accessibility integration
  useEffect(() => {
    spatialAccessibility.setNavigationCallbacks({
      onSectionChange: (section: PhotoWorkflowSection) => {
        // Map photo workflow sections to canvas actions
        const sectionMapping: Record<PhotoWorkflowSection, string> = {
          'hero': 'capture',
          'about': 'focus',
          'creative': 'frame',
          'professional': 'exposure',
          'thought-leadership': 'develop',
          'ai-github': 'frame', // Map to frame as closest match
          'contact': 'portfolio'
        };

        const canvasSection = sectionMapping[section];
        if (canvasSection && actions.canvas.setActiveSection) {
          actions.canvas.setActiveSection(canvasSection);
        }

        // Announce section change
        spatialAccessibility.announce(`Navigated to ${section} section`);
      },

      onCanvasMove: (position: CanvasPosition) => {
        executeCanvasMovement(position, 'pan-tilt');
      },

      onZoom: (scale: number) => {
        const newPosition = { ...state.currentPosition, scale };
        executeCanvasMovement(newPosition, 'zoom-in');
      }
    });

    // Update spatial accessibility with current state
    spatialAccessibility.updateCanvasPosition(state.currentPosition);

    // Map current canvas section to photo workflow section
    const reverseSectionMapping: Record<string, PhotoWorkflowSection> = {
      'capture': 'hero',
      'focus': 'about',
      'frame': 'creative',
      'exposure': 'professional',
      'develop': 'thought-leadership',
      'portfolio': 'contact'
    };

    const photoSection = reverseSectionMapping[state.activeSection] || 'hero';
    spatialAccessibility.updateCurrentSection(photoSection);

  }, [spatialAccessibility, state.currentPosition, state.activeSection, actions.canvas, executeCanvasMovement]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Enhanced debug information
  const debugInfo = debugMode ? (
    <div className="absolute top-4 left-4 bg-black bg-opacity-90 text-white p-3 rounded text-xs font-mono z-50 max-w-xs">
      {/* Basic Canvas Info */}
      <div className="text-athletic-court-orange font-semibold mb-2">CANVAS DEBUG</div>
      <div>Position: ({state.currentPosition.x.toFixed(1)}, {state.currentPosition.y.toFixed(1)})</div>
      <div>Scale: {state.currentPosition.scale.toFixed(2)}</div>
      <div>Layout: {state.layout}</div>
      <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
      <div>Active Section: {state.activeSection}</div>

      {/* Performance Metrics */}
      <div className="text-athletic-court-orange font-semibold mt-3 mb-1">PERFORMANCE</div>
      <div>FPS: <span className={performanceMetrics.fps < 45 ? 'text-red-400' : performanceMetrics.fps < 55 ? 'text-yellow-400' : 'text-green-400'}>{performanceMetrics.fps}</span></div>
      <div>Frame Time: {performanceMetrics.frameTime.toFixed(1)}ms</div>
      <div>Memory: {performanceMetrics.memoryMB.toFixed(1)}MB</div>
      <div>Quality: <span className={
        currentQuality === 'highest' ? 'text-green-400' :
        currentQuality === 'high' ? 'text-blue-400' :
        currentQuality === 'medium' ? 'text-yellow-400' :
        currentQuality === 'low' ? 'text-orange-400' : 'text-red-400'
      }>{currentQuality.toUpperCase()}</span></div>
      <div>Renders: {renderCount}</div>

      {/* Advanced Debug Info */}
      {performanceMonitorRef.current && (
        <>
          <div className="text-athletic-court-orange font-semibold mt-3 mb-1">ADVANCED</div>
          <div>Optimized: {performanceMonitorRef.current.getMetrics().activeOperations > 0 ? 'Yes' : 'No'}</div>
          <div>GPU Util: {performanceMonitorRef.current.getMetrics().gpuUtilization.toFixed(1)}%</div>
          <div>Operations: {performanceMonitorRef.current.getMetrics().activeOperations}</div>
        </>
      )}

      {/* Quality Manager Info */}
      {qualityManagerRef.current && (
        <div className="mt-2 text-athletic-neutral-400 text-[10px]">
          {qualityManagerRef.current.getCurrentConfig().enableBlur ? '🔀' : ''}
          {qualityManagerRef.current.getCurrentConfig().useGPUAcceleration ? '⚡' : ''}
          {qualityManagerRef.current.getCurrentConfig().enableBoundsOptimization ? '📐' : ''}
          {qualityManagerRef.current.getCurrentConfig().cullOffScreenElements ? '👁️' : ''}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div
      ref={canvasRef}
      className={canvasClasses}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000000'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Spatial navigation canvas"
      role="application"
    >
      {/* Canvas content container with transforms */}
      <div
        className="canvas-content absolute inset-0"
        style={{
          ...canvasTransform,
          width: `${layoutConfig.width}px`,
          height: `${layoutConfig.height}px`,
          left: '50%',
          top: '50%',
          marginLeft: `-${layoutConfig.width / 2}px`,
          marginTop: `-${layoutConfig.height / 2}px`
        }}
      >
        {children}
      </div>

      {/* Debug overlay */}
      {debugInfo}

      {/* Touch feedback indicator */}
      {touchFeedback && (
        <div
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 transition-opacity duration-200 ${
            isActiveTouch ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            left: `${touchFeedback.x}px`,
            top: `${touchFeedback.y}px`
          }}
        >
          {touchFeedback.type === 'zoom' ? (
            <div className="w-16 h-16 rounded-full border-2 border-blue-400/60 bg-blue-400/10 backdrop-blur-sm flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 8v6m3-3H7"/>
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full border-2 border-green-400/60 bg-green-400/10 backdrop-blur-sm flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-400">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Performance indicator */}
      {performanceMode === 'high' && (
        <div className="absolute bottom-4 right-4 text-white text-xs opacity-50">
          GPU Accelerated
        </div>
      )}
    </div>
  );
};

// Export utilities for external use
export {
  DEFAULT_VIEWPORT_CONSTRAINTS,
  GRID_LAYOUTS
};

// CSS classes for styling (to be added to global CSS or component styles)
export const LightboxCanvasStyles = `
  .lightbox-canvas {
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
  }

  .gpu-accelerated {
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
  }

  .canvas-transitioning {
    pointer-events: none;
  }

  .canvas-debug {
    border: 2px dashed rgba(255, 255, 255, 0.3);
  }

  .canvas-content {
    transition: transform 0.1ms linear;
  }

  /* Hardware acceleration optimization */
  .lightbox-canvas * {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-perspective: 1000px;
    perspective: 1000px;
  }

  /* Touch gesture optimizations */
  .lightbox-canvas {
    /* Prevent default touch behaviors */
    -webkit-touch-callout: none;
    -webkit-user-drag: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Touch feedback animations */
  .touch-feedback {
    animation: touchPulse 0.3s ease-out;
  }

  @keyframes touchPulse {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1.0); opacity: 0.8; }
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .lightbox-canvas {
      -webkit-overflow-scrolling: touch;
    }

    /* Ensure minimum touch targets */
    .lightbox-canvas [role="button"],
    .lightbox-canvas button {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;

export default LightboxCanvas;