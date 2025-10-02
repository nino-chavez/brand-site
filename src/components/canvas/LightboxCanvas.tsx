/**
 * LightboxCanvas - Clean 2D Spatial Container
 *
 * Simplified implementation: 907 → ~300 LOC (67% reduction)
 * Eliminates circular dependencies, performance monitor refs, and over-engineering.
 *
 * @fileoverview Minimal canvas with pan/zoom/keyboard/touch
 * @version 2.0.0
 * @since Phase 4 - Canvas Rebuild
 */

import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useCanvasState } from '../../contexts/CanvasStateProvider';
import { useCanvasTouchGestures } from '../../hooks/useCanvasTouchGestures';
import { useKeyboardNav } from '../../hooks/useKeyboardNav';
import { rafScheduler, RAFPriority } from '../../utils/rafScheduler';
import type { CanvasPosition } from '../../contexts/CanvasStateProvider';

// ===== TYPES =====

export interface LightboxCanvasProps {
  performanceMode?: 'high' | 'balanced' | 'low';
  debugMode?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// ===== CONSTANTS =====

const SCALE_LIMITS = { min: 0.5, max: 3.0 };
const KEYBOARD_MOVE_DISTANCE = 50;
const ANIMATION_DURATION = 800; // ms

// ===== COMPONENT =====

export const LightboxCanvas: React.FC<LightboxCanvasProps> = ({
  performanceMode = 'balanced',
  debugMode = false,
  children,
  className = ''
}) => {
  // Canvas state
  const { state, actions } = useCanvasState();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Local transitioning state
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ===== MEMOIZED TRANSFORM =====

  const canvasTransform = useMemo(() => {
    const { x, y, scale } = state.position;

    return {
      transform: `translate(${-x}px, ${-y}px) scale(${scale})`,
      transformOrigin: 'center center',
      willChange: isTransitioning ? 'transform' : 'auto',
      transition: isTransitioning ? 'transform 300ms ease-out' : 'none',
      backfaceVisibility: 'hidden' as const,
      perspective: '1000px'
    };
  }, [state.position.x, state.position.y, state.position.scale, isTransitioning]);

  // ===== CAMERA MOVEMENT (RAF SCHEDULER) =====

  const executeMovement = useCallback((targetPosition: CanvasPosition) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    actions.setTransitioning(true);

    const startPos = state.position;
    const startTime = performance.now();

    const unsubscribe = rafScheduler.subscribe(
      'canvas-movement',
      (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        // Interpolate position
        const current: CanvasPosition = {
          x: startPos.x + (targetPosition.x - startPos.x) * eased,
          y: startPos.y + (targetPosition.y - startPos.y) * eased,
          scale: startPos.scale + (targetPosition.scale - startPos.scale) * eased
        };

        actions.updatePosition(current);

        if (progress >= 1) {
          setIsTransitioning(false);
          actions.setTransitioning(false);
          unsubscribe();
        }
      },
      RAFPriority.HIGH
    );
  }, [state.position, isTransitioning, actions]);

  // ===== TOUCH GESTURES =====

  const touchHandlers = useCanvasTouchGestures({
    onPan: (delta) => {
      // Pan sensitivity based on current scale
      const sensitivity = 1.0 / state.position.scale;

      actions.updatePosition({
        ...state.position,
        x: state.position.x - delta.x * sensitivity,
        y: state.position.y - delta.y * sensitivity
      });
    },
    onZoom: (scaleFactor, center) => {
      const newScale = Math.max(
        SCALE_LIMITS.min,
        Math.min(SCALE_LIMITS.max, state.position.scale * scaleFactor)
      );

      actions.updatePosition({
        ...state.position,
        scale: newScale
      });
    }
  });

  // ===== KEYBOARD NAVIGATION =====

  useKeyboardNav({
    onMove: (direction) => {
      const newPos = { ...state.position };

      switch (direction) {
        case 'left':
          newPos.x -= KEYBOARD_MOVE_DISTANCE;
          break;
        case 'right':
          newPos.x += KEYBOARD_MOVE_DISTANCE;
          break;
        case 'up':
          newPos.y -= KEYBOARD_MOVE_DISTANCE;
          break;
        case 'down':
          newPos.y += KEYBOARD_MOVE_DISTANCE;
          break;
      }

      executeMovement(newPos);
    },
    onZoom: (delta) => {
      const newScale = Math.max(
        SCALE_LIMITS.min,
        Math.min(SCALE_LIMITS.max, state.position.scale + delta)
      );

      executeMovement({
        ...state.position,
        scale: newScale
      });
    },
    enabled: true
  });

  // ===== CSS CLASSES =====

  const canvasClasses = useMemo(() => {
    const classes = [
      'lightbox-canvas',
      'relative',
      'w-full',
      'h-screen',
      'overflow-hidden',
      'bg-black'
    ];

    if (performanceMode === 'high') {
      classes.push('gpu-accelerated');
    }

    if (isTransitioning) {
      classes.push('canvas-transitioning');
    }

    if (className) {
      classes.push(className);
    }

    return classes.join(' ');
  }, [performanceMode, isTransitioning, className]);

  // ===== DEBUG OVERLAY =====

  const debugOverlay = debugMode ? (
    <div className="absolute top-4 left-4 bg-black/90 text-white p-3 rounded text-xs font-mono z-50 max-w-xs pointer-events-none">
      <div className="text-orange-400 font-semibold mb-2">CANVAS DEBUG</div>
      <div>Position: ({state.position.x.toFixed(1)}, {state.position.y.toFixed(1)})</div>
      <div>Scale: {state.position.scale.toFixed(2)}</div>
      <div>Section: {state.activeSection}</div>
      <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
      <div className="mt-2 pt-2 border-t border-white/20 text-xs text-white/70">
        Performance Mode: {performanceMode}
      </div>
    </div>
  ) : null;

  // ===== RENDER =====

  return (
    <div
      ref={canvasRef}
      className={canvasClasses}
      {...touchHandlers}
      style={{ cursor: 'grab' }}
      role="application"
      aria-label="Spatial navigation canvas - drag to pan, scroll to zoom"
    >
      {/* Canvas content with transforms */}
      <div
        className="canvas-content absolute"
        style={{
          ...canvasTransform,
          left: '50%',
          top: '50%',
          width: '1200px',
          height: '800px',
          marginLeft: '-600px',
          marginTop: '-400px'
        }}
      >
        {children}
      </div>

      {/* Instruction overlay when no content */}
      {!children && (
        <div className="absolute inset-0 flex items-center justify-center text-white/70 pointer-events-none">
          <div className="text-center max-w-md px-4">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-2xl font-semibold mb-4 text-white">Canvas Mode</h2>
            <p className="text-lg mb-4">Click and hold anywhere to activate spatial navigation</p>
            <div className="text-sm text-white/50 space-y-1">
              <p>Desktop: Click + hold for 800ms</p>
              <p>Mobile: Long press</p>
              <p>Keyboard: Arrow keys to pan, +/- to zoom</p>
            </div>
          </div>
        </div>
      )}

      {/* Debug overlay */}
      {debugOverlay}

      {/* Performance indicator */}
      {performanceMode === 'high' && (
        <div className="absolute bottom-4 right-4 text-white text-xs opacity-50 pointer-events-none">
          GPU Accelerated
        </div>
      )}
    </div>
  );
};

// ===== STYLES =====

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

  .canvas-content {
    transition: transform 0.1ms linear;
  }

  /* Hardware acceleration */
  .lightbox-canvas * {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  /* Touch optimizations */
  .lightbox-canvas {
    -webkit-touch-callout: none;
    -webkit-user-drag: none;
    -webkit-tap-highlight-color: transparent;
  }
`;

export default LightboxCanvas;
