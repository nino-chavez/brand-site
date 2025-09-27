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

    // Hardware-accelerated CSS transform
    const transformValue = `translate3d(${-finalPosition.x}px, ${-finalPosition.y}px, 0) scale(${finalPosition.scale})`;

    return {
      transform: transformValue,
      transformOrigin: 'center center',
      willChange: isTransitioning ? 'transform' : 'auto',
      backfaceVisibility: 'hidden' as const,
      perspective: '1000px'
    };
  }, [state.currentPosition, isTransitioning]);

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

  // Performance monitoring
  const trackCanvasPerformance = useCallback(() => {
    if (!canvasRef.current) return;

    const startTime = performance.now();

    // Measure render performance
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      const fps = 1000 / renderTime;

      // Update performance metrics
      actions.canvas.updateCanvasMetrics?.({
        canvasRenderFPS: Math.round(fps),
        transformOverhead: renderTime,
        activeOperations: isTransitioning ? 1 : 0
      });

      setRenderCount(prev => prev + 1);
    });
  }, [actions.canvas, isTransitioning]);

  // Camera movement handler
  const executeCanvasMovement = useCallback(async (
    targetPosition: CanvasPosition,
    movement: 'pan-tilt' | 'zoom-in' | 'zoom-out' | 'dolly-zoom' | 'rack-focus' | 'match-cut' = 'pan-tilt'
  ) => {
    if (isTransitioning) return;

    const startTime = performance.now();
    const fromPosition = state.currentPosition;

    setIsTransitioning(true);
    actions.canvas.setTargetPosition(targetPosition);

    // Calculate movement duration based on distance
    const duration = calculateMovementDuration(fromPosition, targetPosition);

    // Execute camera movement with RAF-based animation
    const animateMovement = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

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
        animationRef.current = requestAnimationFrame(animateMovement);
      } else {
        // Movement complete
        setIsTransitioning(false);
        actions.canvas.setTargetPosition(null);

        // Track performance
        const completionTime = performance.now() - startTime;
        actions.performance?.trackCanvasTransition?.(
          fromPosition,
          targetPosition,
          movement,
          completionTime,
          true
        );
      }
    };

    animationRef.current = requestAnimationFrame(animateMovement);
  }, [state.currentPosition, isTransitioning, actions]);

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

  // Touch/gesture handlers for mobile support
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      // Pinch-to-zoom gesture
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const initialDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      actions.canvas.updateTouchState({
        initialDistance,
        initialPosition: state.currentPosition
      });
      actions.canvas.setZoomingState(true);
    } else if (event.touches.length === 1) {
      // Pan gesture
      actions.canvas.setPanningState(true);
    }
  }, [state.currentPosition, actions.canvas]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault(); // Prevent default scroll behavior

    if (event.touches.length === 2 && state.interaction.touchState.initialDistance) {
      // Handle pinch-to-zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const scaleMultiplier = currentDistance / state.interaction.touchState.initialDistance;
      const initialPosition = state.interaction.touchState.initialPosition;

      if (initialPosition) {
        const newScale = Math.max(0.5, Math.min(3.0, initialPosition.scale * scaleMultiplier));
        actions.canvas.updateCanvasPosition({
          ...state.currentPosition,
          scale: newScale
        });
      }
    }
  }, [state.interaction.touchState, state.currentPosition, actions.canvas]);

  const handleTouchEnd = useCallback(() => {
    actions.canvas.setPanningState(false);
    actions.canvas.setZoomingState(false);
    actions.canvas.updateTouchState({
      initialDistance: null,
      initialPosition: null
    });
  }, [actions.canvas]);

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

  // Performance monitoring effect
  useEffect(() => {
    trackCanvasPerformance();
  }, [trackCanvasPerformance, state.currentPosition]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Debug information
  const debugInfo = debugMode ? (
    <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50">
      <div>Position: ({state.currentPosition.x.toFixed(1)}, {state.currentPosition.y.toFixed(1)})</div>
      <div>Scale: {state.currentPosition.scale.toFixed(2)}</div>
      <div>Layout: {state.layout}</div>
      <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
      <div>Renders: {renderCount}</div>
      <div>FPS: {performance?.canvasRenderFPS || 'N/A'}</div>
      <div>Active Section: {state.activeSection}</div>
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

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .lightbox-canvas {
      -webkit-overflow-scrolling: touch;
    }
  }
`;

export default LightboxCanvas;