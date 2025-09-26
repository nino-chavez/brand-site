import React, { useState, useRef, useCallback, useEffect } from 'react';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';

export interface MorphingTransitionProps {
  fromPhase: VolleyballPhase;
  toPhase: VolleyballPhase;
  progress: number; // 0-1
  duration?: number; // milliseconds
  easing?: CubicBezierConfig;
  onComplete?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface CubicBezierConfig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface OrganicShape {
  name: string;
  clipPath: string;
  transform: string;
  scale: number;
  intensity: number;
  visualWeight: number;
}

// Predefined organic shapes for morphing
const ORGANIC_SHAPES: Record<VolleyballPhase, OrganicShape> = {
  setup: {
    name: 'calm-rectangle',
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    transform: 'translateX(0) scale(1) rotate(0deg)',
    scale: 1.0,
    intensity: 0.2,
    visualWeight: 1
  },
  anticipation: {
    name: 'building-tension',
    clipPath: 'polygon(2% 0, 98% 0, 100% 2%, 100% 98%, 98% 100%, 2% 100%, 0 98%, 0 2%)',
    transform: 'translateX(0) scale(1.02) rotate(0.5deg)',
    scale: 1.02,
    intensity: 0.4,
    visualWeight: 1.2
  },
  approach: {
    name: 'dynamic-movement',
    clipPath: 'polygon(5% 2%, 95% 0, 98% 5%, 100% 95%, 95% 98%, 5% 100%, 2% 95%, 0 5%)',
    transform: 'translateX(0) scale(1.05) rotate(1deg)',
    scale: 1.05,
    intensity: 0.6,
    visualWeight: 1.5
  },
  spike: {
    name: 'explosive-action',
    clipPath: 'polygon(10% 5%, 90% 2%, 95% 10%, 98% 90%, 90% 95%, 10% 98%, 5% 90%, 2% 10%)',
    transform: 'translateX(0) scale(1.08) rotate(1.5deg)',
    scale: 1.08,
    intensity: 0.8,
    visualWeight: 1.8
  },
  impact: {
    name: 'moment-of-truth',
    clipPath: 'polygon(15% 8%, 85% 5%, 92% 15%, 95% 85%, 85% 92%, 15% 95%, 8% 85%, 5% 15%)',
    transform: 'translateX(0) scale(1.1) rotate(2deg)',
    scale: 1.1,
    intensity: 1.0,
    visualWeight: 2.0
  },
  'follow-through': {
    name: 'flowing-resolution',
    clipPath: 'polygon(20% 10%, 80% 8%, 88% 20%, 90% 80%, 80% 88%, 20% 90%, 12% 80%, 10% 20%)',
    transform: 'translateX(0) scale(1.03) rotate(0.8deg)',
    scale: 1.03,
    intensity: 0.35,
    visualWeight: 1.3
  }
};

// Predefined cubic-bezier easing curves
const EASING_CURVES = {
  material: { x1: 0.4, y1: 0, x2: 0.2, y2: 1 },
  organic: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  athletic: { x1: 0.68, y1: -0.55, x2: 0.265, y2: 1.55 },
  smooth: { x1: 0.25, y1: 0.46, x2: 0.45, y2: 0.94 }
};

export const MorphingTransition: React.FC<MorphingTransitionProps> = ({
  fromPhase,
  toPhase,
  progress,
  duration = 800,
  easing = EASING_CURVES.organic,
  onComplete,
  children,
  className = ''
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Cubic-bezier easing implementation
  const cubicBezier = useCallback((t: number, x1: number, y1: number, x2: number, y2: number): number => {
    // Simplified cubic bezier for demonstration
    // Real implementation would use proper bezier curve calculation
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return 3 * uu * t * y1 + 3 * u * tt * y2 + ttt;
  }, []);

  // Apply easing curve to progress
  const getEasedProgress = useCallback((rawProgress: number): number => {
    return cubicBezier(rawProgress, easing.x1, easing.y1, easing.x2, easing.y2);
  }, [cubicBezier, easing]);

  // Parse clip-path polygon points
  const parseClipPath = useCallback((clipPath: string): number[][] => {
    const match = clipPath.match(/polygon\((.*?)\)/);
    if (!match) return [];

    return match[1].split(',').map(point => {
      const coords = point.trim().split(' ');
      return [
        parseFloat(coords[0].replace('%', '')),
        parseFloat(coords[1].replace('%', ''))
      ];
    });
  }, []);

  // Interpolate between two sets of polygon points
  const interpolatePolygonPoints = useCallback((fromPoints: number[][], toPoints: number[][], progress: number): string => {
    if (fromPoints.length !== toPoints.length) {
      // Fallback to discrete transition if point counts don't match
      return progress < 0.5 ? ORGANIC_SHAPES[fromPhase].clipPath : ORGANIC_SHAPES[toPhase].clipPath;
    }

    const interpolatedPoints = fromPoints.map((fromPoint, index) => {
      const toPoint = toPoints[index];
      const x = fromPoint[0] + (toPoint[0] - fromPoint[0]) * progress;
      const y = fromPoint[1] + (toPoint[1] - fromPoint[1]) * progress;
      return `${(x || 0).toFixed(2)}% ${(y || 0).toFixed(2)}%`;
    });

    return `polygon(${interpolatedPoints.join(', ')})`;
  }, [fromPhase, toPhase]);

  // Interpolate transform values
  const interpolateTransform = useCallback((fromShape: OrganicShape, toShape: OrganicShape, progress: number): string => {
    const fromScale = fromShape.scale;
    const toScale = toShape.scale;
    const scale = fromScale + (toScale - fromScale) * progress;

    // Extract rotation from transform strings (simplified)
    const fromRotation = parseFloat(fromShape.transform.match(/rotate\(([-\d.]+)deg\)/)?.[1] || '0');
    const toRotation = parseFloat(toShape.transform.match(/rotate\(([-\d.]+)deg\)/)?.[1] || '0');
    const rotation = fromRotation + (toRotation - fromRotation) * progress;

    return `translateX(0) scale(${(scale || 1).toFixed(4)}) rotate(${(rotation || 0).toFixed(2)}deg)`;
  }, []);

  // Interpolate visual effects
  const interpolateVisualEffects = useCallback((fromShape: OrganicShape, toShape: OrganicShape, progress: number) => {
    const fromIntensity = fromShape.intensity;
    const toIntensity = toShape.intensity;
    const intensity = fromIntensity + (toIntensity - fromIntensity) * progress;

    const fromWeight = fromShape.visualWeight;
    const toWeight = toShape.visualWeight;
    const weight = fromWeight + (toWeight - fromWeight) * progress;

    return {
      filter: `brightness(${1 + intensity * 0.08}) contrast(${1 + weight * 0.05})`,
      boxShadow: `0 ${weight * 2}px ${weight * 8}px rgba(0, 0, 0, ${0.1 + intensity * 0.05})`,
      transform: interpolateTransform(fromShape, toShape, progress)
    };
  }, [interpolateTransform]);

  // Get current morphing styles
  const getCurrentMorphingStyles = useCallback(() => {
    const easedProgress = getEasedProgress(currentProgress);
    const fromShape = ORGANIC_SHAPES[fromPhase];
    const toShape = ORGANIC_SHAPES[toPhase];

    // Parse clip-path points for interpolation
    const fromPoints = parseClipPath(fromShape.clipPath);
    const toPoints = parseClipPath(toShape.clipPath);

    // Interpolate clip-path
    const clipPath = interpolatePolygonPoints(fromPoints, toPoints, easedProgress);

    // Interpolate visual effects
    const visualEffects = interpolateVisualEffects(fromShape, toShape, easedProgress);

    return {
      clipPath,
      ...visualEffects,
      transition: 'none', // Disable CSS transitions during morphing
      // Hardware acceleration optimization
      backfaceVisibility: 'hidden' as const,
      WebkitBackfaceVisibility: 'hidden' as const,
      willChange: 'transform, clip-path, filter'
    };
  }, [
    currentProgress,
    fromPhase,
    toPhase,
    getEasedProgress,
    parseClipPath,
    interpolatePolygonPoints,
    interpolateVisualEffects
  ]);

  // Start morphing animation
  const startMorphing = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);

      setCurrentProgress(rawProgress);

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [duration, onComplete]);

  // Handle external progress updates
  useEffect(() => {
    if (progress >= 0 && progress <= 1) {
      setCurrentProgress(progress);
    }
  }, [progress]);

  // Start morphing when phases change
  useEffect(() => {
    if (fromPhase !== toPhase && currentProgress === 0) {
      startMorphing();
    }
  }, [fromPhase, toPhase, currentProgress, startMorphing]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const morphingStyles = getCurrentMorphingStyles();

  return (
    <div
      className={`morphing-transition ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...morphingStyles
      }}
      data-from-phase={fromPhase}
      data-to-phase={toPhase}
      data-progress={Math.round(currentProgress * 100)}
    >
      {children}

      {/* Morphing overlay effects */}
      <div
        className="morphing-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at 50% 50%, rgba(139, 92, 246, ${currentProgress * 0.03}) 0%, transparent 70%)`,
          opacity: currentProgress,
          mixBlendMode: 'overlay'
        }}
      />

      {/* Debug information (development only) */}
      {false && process.env.NODE_ENV === 'development' && (
        <div
          className="morphing-debug-overlay"
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontFamily: 'monospace',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div>Morphing: {fromPhase} → {toPhase}</div>
          <div>Progress: {Math.round(currentProgress * 100)}%</div>
          <div>Eased: {Math.round(getEasedProgress(currentProgress) * 100)}%</div>
        </div>
      )}
    </div>
  );
};

export default MorphingTransition;