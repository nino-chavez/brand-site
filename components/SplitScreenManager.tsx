import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';
import MockVisuals from './MockVisuals';

export interface SplitScreenManagerProps {
  currentPhase: VolleyballPhase;
  phaseProgress: number;
  isPlaying: boolean;
  onMorphingStart?: (fromPhase: VolleyballPhase, toPhase: VolleyballPhase) => void;
  onMorphingComplete?: (phase: VolleyballPhase) => void;
  className?: string;
}

export interface ViewportState {
  transform: string;
  clipPath: string;
  opacity: number;
  zIndex: number;
  filter: string;
}

export interface MorphingConfig {
  duration: number;
  easing: string;
  shapes: Record<VolleyballPhase, MorphingShape>;
}

export interface MorphingShape {
  clipPath: string;
  transform: string;
  scale: number;
  intensity: number; // Visual intensity level 0-1
}

export interface SharedStateManager {
  currentPhase: VolleyballPhase;
  morphingProgress: number;
  leftViewportState: ViewportState;
  rightViewportState: ViewportState;
  subscribers: Array<(state: SharedStateManager) => void>;
  referencePoints: ReferencePoint[];
}

export interface ReferencePoint {
  id: string;
  x: number; // percentage
  y: number; // percentage
  phase: VolleyballPhase;
}

const MORPHING_SHAPES: Record<VolleyballPhase, MorphingShape> = {
  setup: {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    transform: 'translateX(0) scale(1)',
    scale: 1,
    intensity: 0.2
  },
  anticipation: {
    clipPath: 'polygon(5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 5%)',
    transform: 'translateX(0) scale(1.02)',
    scale: 1.02,
    intensity: 0.4
  },
  approach: {
    clipPath: 'polygon(10% 5%, 90% 0, 95% 10%, 100% 90%, 90% 95%, 10% 100%, 5% 90%, 0 10%)',
    transform: 'translateX(0) scale(1.05)',
    scale: 1.05,
    intensity: 0.6
  },
  spike: {
    clipPath: 'polygon(15% 10%, 85% 5%, 90% 15%, 95% 85%, 85% 90%, 15% 95%, 10% 85%, 5% 15%)',
    transform: 'translateX(0) scale(1.08)',
    scale: 1.08,
    intensity: 0.8
  },
  impact: {
    clipPath: 'polygon(20% 15%, 80% 10%, 85% 20%, 90% 80%, 80% 85%, 20% 90%, 15% 80%, 10% 20%)',
    transform: 'translateX(0) scale(1.1)',
    scale: 1.1,
    intensity: 1.0
  },
  'follow-through': {
    clipPath: 'polygon(25% 0, 75% 0, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0 75%, 0 25%)',
    transform: 'translateX(0) scale(1.03)',
    scale: 1.03,
    intensity: 0.3
  }
};

const REFERENCE_POINTS: ReferencePoint[] = [
  { id: 'center', x: 50, y: 50, phase: 'setup' },
  { id: 'tension-point', x: 60, y: 40, phase: 'anticipation' },
  { id: 'momentum-point', x: 70, y: 30, phase: 'approach' },
  { id: 'action-point', x: 80, y: 20, phase: 'spike' },
  { id: 'impact-point', x: 85, y: 15, phase: 'impact' },
  { id: 'resolution-point', x: 40, y: 60, phase: 'follow-through' }
];

export const SplitScreenManager: React.FC<SplitScreenManagerProps> = ({
  currentPhase,
  phaseProgress,
  isPlaying,
  onMorphingStart,
  onMorphingComplete,
  className = ''
}) => {
  const [sharedState, setSharedState] = useState<SharedStateManager>({
    currentPhase,
    morphingProgress: 0,
    leftViewportState: {
      transform: 'translateX(0) scale(1)',
      clipPath: MORPHING_SHAPES.setup.clipPath,
      opacity: 1,
      zIndex: 1,
      filter: 'none'
    },
    rightViewportState: {
      transform: 'translateX(0) scale(1)',
      clipPath: MORPHING_SHAPES.setup.clipPath,
      opacity: 1,
      zIndex: 1,
      filter: 'none'
    },
    subscribers: [],
    referencePoints: REFERENCE_POINTS
  });

  const [isMorphing, setIsMorphing] = useState(false);
  const previousPhaseRef = useRef<VolleyballPhase>(currentPhase);
  const morphingTimeoutRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Cubic-bezier easing function
  const cubicBezierEasing = useCallback((progress: number): number => {
    // Using cubic-bezier(0.4, 0, 0.2, 1) - Material Design standard
    const x1 = 0.4, y1 = 0, x2 = 0.2, y2 = 1;

    // Simplified cubic bezier calculation for single dimension
    const t = progress;
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return 3 * uu * t * y1 + 3 * u * tt * y2 + ttt;
  }, []);

  // Interpolate between two clip-path values
  const interpolateClipPath = useCallback((fromShape: MorphingShape, toShape: MorphingShape, progress: number): string => {
    const easedProgress = cubicBezierEasing(progress);

    // For simplicity in this implementation, we'll use discrete transitions at progress thresholds
    // In a full implementation, you would parse polygon points and interpolate coordinates
    if (easedProgress < 0.2) return fromShape.clipPath;
    if (easedProgress < 0.4) return fromShape.clipPath;
    if (easedProgress < 0.6) return `polygon(${getIntermediateClipPath(fromShape.clipPath, toShape.clipPath, 0.5)})`;
    if (easedProgress < 0.8) return toShape.clipPath;
    return toShape.clipPath;
  }, [cubicBezierEasing]);

  // Helper function for intermediate clip-path (simplified)
  const getIntermediateClipPath = useCallback((from: string, to: string, progress: number): string => {
    // This is a simplified interpolation - real implementation would parse and interpolate polygon points
    return '12.5% 5%, 87.5% 2.5%, 92.5% 12.5%, 97.5% 87.5%, 87.5% 92.5%, 12.5% 97.5%, 7.5% 87.5%, 2.5% 12.5%';
  }, []);

  // Interpolate transforms
  const interpolateTransform = useCallback((fromShape: MorphingShape, toShape: MorphingShape, progress: number): string => {
    const easedProgress = cubicBezierEasing(progress);
    const fromScale = fromShape.scale;
    const toScale = toShape.scale;
    const interpolatedScale = fromScale + (toScale - fromScale) * easedProgress;

    return `translateX(0) scale(${interpolatedScale})`;
  }, [cubicBezierEasing]);

  // Update morphing animation
  const updateMorphingAnimation = useCallback((progress: number) => {
    const currentShape = MORPHING_SHAPES[previousPhaseRef.current] || MORPHING_SHAPES.setup;
    const targetShape = MORPHING_SHAPES[currentPhase] || MORPHING_SHAPES.setup;

    const newLeftState: ViewportState = {
      transform: interpolateTransform(currentShape, targetShape, progress),
      clipPath: interpolateClipPath(currentShape, targetShape, progress),
      opacity: 1,
      zIndex: 1,
      filter: progress > 0.5 ? `brightness(${1 + targetShape.intensity * 0.1})` : 'none'
    };

    const newRightState: ViewportState = {
      ...newLeftState,
      filter: progress > 0.5 ? `contrast(${1 + targetShape.intensity * 0.15})` : 'none'
    };

    setSharedState(prevState => ({
      ...prevState,
      morphingProgress: progress,
      leftViewportState: newLeftState,
      rightViewportState: newRightState
    }));
  }, [currentPhase, interpolateTransform, interpolateClipPath]);

  // Start morphing transition
  const startMorphingTransition = useCallback(() => {
    if (isMorphing || previousPhaseRef.current === currentPhase) return;

    setIsMorphing(true);
    onMorphingStart?.(previousPhaseRef.current, currentPhase);

    const duration = 800; // 800ms morphing duration
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      updateMorphingAnimation(progress);

      if (progress < 1) {
        morphingTimeoutRef.current = requestAnimationFrame(animate);
      } else {
        setIsMorphing(false);
        previousPhaseRef.current = currentPhase;
        onMorphingComplete?.(currentPhase);
      }
    };

    morphingTimeoutRef.current = requestAnimationFrame(animate);
  }, [isMorphing, currentPhase, updateMorphingAnimation, onMorphingStart, onMorphingComplete]);

  // Handle phase changes
  useEffect(() => {
    if (previousPhaseRef.current !== currentPhase) {
      startMorphingTransition();
    }
  }, [currentPhase, startMorphingTransition]);

  // Update shared state when phase progress changes
  useEffect(() => {
    setSharedState(prevState => ({
      ...prevState,
      currentPhase,
      morphingProgress: isMorphing ? prevState.morphingProgress : phaseProgress
    }));
  }, [currentPhase, phaseProgress, isMorphing]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (morphingTimeoutRef.current) {
        cancelAnimationFrame(morphingTimeoutRef.current);
      }
    };
  }, []);

  // Get current reference point for phase
  const getCurrentReferencePoint = useCallback((): ReferencePoint => {
    return REFERENCE_POINTS.find(point => point.phase === currentPhase) ||
           REFERENCE_POINTS[0]; // fallback to center
  }, [currentPhase]);

  return (
    <div
      ref={containerRef}
      className={`split-screen-manager ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr',
        width: '100vw',
        height: '100vh',
        gap: 0,
        overflow: 'hidden',
        position: 'relative',
        // Hardware acceleration
        transform: 'translateZ(0)',
        willChange: isMorphing ? 'transform, clip-path' : 'auto'
      }}
    >
      {/* Left Viewport */}
      <div
        className="left-viewport"
        style={{
          gridColumn: '1 / 2',
          gridRow: '1 / 2',
          position: 'relative',
          overflow: 'hidden',
          transform: sharedState.leftViewportState.transform,
          clipPath: sharedState.leftViewportState.clipPath,
          opacity: sharedState.leftViewportState.opacity,
          zIndex: sharedState.leftViewportState.zIndex,
          filter: sharedState.leftViewportState.filter,
          transition: isMorphing ? 'none' : 'transform 0.3s ease-out, filter 0.3s ease-out',
          // Hardware acceleration
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        <div className="viewport-content" style={{ width: '100%', height: '100%' }}>
          <MockVisuals
            type="volleyball"
            phase={currentPhase}
            progress={phaseProgress}
            className="h-full"
          />
        </div>
      </div>

      {/* Right Viewport */}
      <div
        className="right-viewport"
        style={{
          gridColumn: '2 / 3',
          gridRow: '1 / 2',
          position: 'relative',
          overflow: 'hidden',
          transform: sharedState.rightViewportState.transform,
          clipPath: sharedState.rightViewportState.clipPath,
          opacity: sharedState.rightViewportState.opacity,
          zIndex: sharedState.rightViewportState.zIndex,
          filter: sharedState.rightViewportState.filter,
          transition: isMorphing ? 'none' : 'transform 0.3s ease-out, filter 0.3s ease-out',
          // Hardware acceleration
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        <div className="viewport-content" style={{ width: '100%', height: '100%' }}>
          <MockVisuals
            type="technical"
            phase={currentPhase}
            progress={phaseProgress}
            className="h-full"
          />
        </div>
      </div>

      {/* Reference Point Indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="reference-point"
          style={{
            position: 'absolute',
            left: `${getCurrentReferencePoint().x}%`,
            top: `${getCurrentReferencePoint().y}%`,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'red',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            pointerEvents: 'none',
            opacity: 0.7
          }}
          title={`Reference Point: ${getCurrentReferencePoint().id}`}
        />
      )}

      {/* Morphing Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="morphing-debug"
          style={{
            position: 'absolute',
            top: '60px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <div>Phase: {currentPhase}</div>
          <div>Progress: {Math.round(phaseProgress * 100)}%</div>
          <div>Morphing: {isMorphing ? 'Yes' : 'No'}</div>
          <div>Morph Progress: {Math.round(sharedState.morphingProgress * 100)}%</div>
          <div>Intensity: {MORPHING_SHAPES[currentPhase]?.intensity ?? 0}</div>
        </div>
      )}
    </div>
  );
};

export default SplitScreenManager;