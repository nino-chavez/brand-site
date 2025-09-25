import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';

export interface VisualContinuitySystemProps {
  currentPhase: VolleyballPhase;
  previousPhase?: VolleyballPhase;
  transitionProgress: number; // 0-1
  isTransitioning: boolean;
  visualIntensity: number;
  onTransitionComplete?: (phase: VolleyballPhase) => void;
  onContinuityMetrics?: (metrics: ContinuityMetrics) => void;
  children?: React.ReactNode;
  className?: string;
}

export interface ContinuityMetrics {
  transitionSmoothness: number; // 0-1
  visualCoherence: number; // 0-1
  emotionalFlow: number; // 0-1
  brandConsistency: number; // 0-1
  overallScore: number; // 0-1
  performanceImpact: number; // 0-1 (lower is better)
}

export interface TransitionConfiguration {
  from: VolleyballPhase;
  to: VolleyballPhase;
  duration: number; // milliseconds
  easing: EasingFunction;
  visualBridge: VisualBridgeConfig;
  colorTransition: ColorTransitionConfig;
  scaleTransition: ScaleTransitionConfig;
  lightingTransition: LightingTransitionConfig;
}

export interface VisualBridgeConfig {
  type: 'fade' | 'morph' | 'slide' | 'cut' | 'dissolve';
  connectingElements: ConnectingElement[];
  motionContinuity: boolean;
  preserveAspectRatio: boolean;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'soft-light';
}

export interface ConnectingElement {
  id: string;
  element: 'player' | 'ball' | 'net' | 'court' | 'lighting' | 'background';
  position: { x: number; y: number };
  scale: number;
  opacity: number;
  priority: number; // 0-1, higher priority elements bridge more prominently
}

export interface ColorTransitionConfig {
  strategy: 'smooth' | 'complementary' | 'contrast' | 'maintain';
  primaryColorShift: ColorShift;
  saturationCurve: number[]; // Array of saturation values over transition
  temperatureCurve: number[]; // Array of color temperature values
  preserveBrandColors: boolean;
}

export interface ColorShift {
  hueShift: number; // degrees
  saturationMultiplier: number;
  lightnessShift: number;
  preserveHighlights: boolean;
}

export interface ScaleTransitionConfig {
  strategy: 'smooth' | 'jump' | 'zoom' | 'dramatic' | 'subtle';
  startScale: number;
  endScale: number;
  focusPointShift: { x: number; y: number };
  maintainAspectRatio: boolean;
  easeInOut: boolean;
}

export interface LightingTransitionConfig {
  strategy: 'maintain' | 'enhance' | 'dramatic' | 'crystallize';
  shadowDepthCurve: number[];
  highlightIntensityCurve: number[];
  contrastProgression: number[];
  moodPreservation: number; // 0-1
}

export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'cubic' | 'athletic';

// Transition configurations for each phase pair
const TRANSITION_CONFIGS: Record<string, TransitionConfiguration> = {
  'setup-to-anticipation': {
    from: 'setup',
    to: 'anticipation',
    duration: 300,
    easing: 'easeInOut',
    visualBridge: {
      type: 'fade',
      connectingElements: [
        { id: 'player-position', element: 'player', position: { x: 50, y: 50 }, scale: 1.0, opacity: 1.0, priority: 0.9 },
        { id: 'court-markings', element: 'court', position: { x: 0, y: 70 }, scale: 1.0, opacity: 0.8, priority: 0.6 },
        { id: 'ambient-light', element: 'lighting', position: { x: 50, y: 30 }, scale: 1.1, opacity: 0.7, priority: 0.5 }
      ],
      motionContinuity: true,
      preserveAspectRatio: true,
      blendMode: 'soft-light'
    },
    colorTransition: {
      strategy: 'smooth',
      primaryColorShift: { hueShift: 5, saturationMultiplier: 1.1, lightnessShift: -0.05, preserveHighlights: true },
      saturationCurve: [0.9, 0.95, 1.0, 1.05],
      temperatureCurve: [5500, 5400, 5300, 5200],
      preserveBrandColors: true
    },
    scaleTransition: {
      strategy: 'smooth',
      startScale: 1.0,
      endScale: 1.05,
      focusPointShift: { x: 5, y: -5 },
      maintainAspectRatio: true,
      easeInOut: true
    },
    lightingTransition: {
      strategy: 'enhance',
      shadowDepthCurve: [0.4, 0.45, 0.5],
      highlightIntensityCurve: [0.5, 0.55, 0.6],
      contrastProgression: [1.0, 1.05, 1.1],
      moodPreservation: 0.8
    }
  },
  'anticipation-to-approach': {
    from: 'anticipation',
    to: 'approach',
    duration: 200,
    easing: 'athletic',
    visualBridge: {
      type: 'morph',
      connectingElements: [
        { id: 'muscle-tension', element: 'player', position: { x: 55, y: 45 }, scale: 1.1, opacity: 1.0, priority: 1.0 },
        { id: 'focus-direction', element: 'player', position: { x: 65, y: 40 }, scale: 1.0, opacity: 0.9, priority: 0.8 },
        { id: 'net-proximity', element: 'net', position: { x: 80, y: 50 }, scale: 1.0, opacity: 0.7, priority: 0.6 }
      ],
      motionContinuity: true,
      preserveAspectRatio: true,
      blendMode: 'overlay'
    },
    colorTransition: {
      strategy: 'complementary',
      primaryColorShift: { hueShift: 10, saturationMultiplier: 1.2, lightnessShift: -0.1, preserveHighlights: true },
      saturationCurve: [1.0, 1.1, 1.2],
      temperatureCurve: [5200, 5100, 5000],
      preserveBrandColors: true
    },
    scaleTransition: {
      strategy: 'dramatic',
      startScale: 1.05,
      endScale: 1.15,
      focusPointShift: { x: 10, y: -10 },
      maintainAspectRatio: true,
      easeInOut: false
    },
    lightingTransition: {
      strategy: 'enhance',
      shadowDepthCurve: [0.5, 0.55, 0.6],
      highlightIntensityCurve: [0.6, 0.65, 0.7],
      contrastProgression: [1.1, 1.15, 1.2],
      moodPreservation: 0.7
    }
  },
  'approach-to-spike': {
    from: 'approach',
    to: 'spike',
    duration: 150,
    easing: 'cubic',
    visualBridge: {
      type: 'morph',
      connectingElements: [
        { id: 'momentum-vector', element: 'player', position: { x: 70, y: 35 }, scale: 1.2, opacity: 1.0, priority: 1.0 },
        { id: 'body-trajectory', element: 'player', position: { x: 75, y: 30 }, scale: 1.1, opacity: 0.95, priority: 0.9 },
        { id: 'net-target', element: 'net', position: { x: 85, y: 45 }, scale: 1.0, opacity: 0.8, priority: 0.7 }
      ],
      motionContinuity: true,
      preserveAspectRatio: false, // Allow dramatic scaling
      blendMode: 'overlay'
    },
    colorTransition: {
      strategy: 'complementary',
      primaryColorShift: { hueShift: 15, saturationMultiplier: 1.3, lightnessShift: -0.15, preserveHighlights: true },
      saturationCurve: [1.2, 1.25, 1.3],
      temperatureCurve: [5000, 4900, 4800],
      preserveBrandColors: true
    },
    scaleTransition: {
      strategy: 'zoom',
      startScale: 1.15,
      endScale: 1.3,
      focusPointShift: { x: 15, y: -15 },
      maintainAspectRatio: false,
      easeInOut: false
    },
    lightingTransition: {
      strategy: 'dramatic',
      shadowDepthCurve: [0.6, 0.7, 0.8],
      highlightIntensityCurve: [0.7, 0.8, 0.9],
      contrastProgression: [1.2, 1.3, 1.4],
      moodPreservation: 0.6
    }
  },
  'spike-to-impact': {
    from: 'spike',
    to: 'impact',
    duration: 100,
    easing: 'easeIn',
    visualBridge: {
      type: 'cut',
      connectingElements: [
        { id: 'contact-point', element: 'ball', position: { x: 85, y: 25 }, scale: 1.5, opacity: 1.0, priority: 1.0 },
        { id: 'arm-position', element: 'player', position: { x: 80, y: 30 }, scale: 1.3, opacity: 1.0, priority: 0.95 }
      ],
      motionContinuity: false, // Dramatic cut for impact
      preserveAspectRatio: false,
      blendMode: 'normal'
    },
    colorTransition: {
      strategy: 'contrast',
      primaryColorShift: { hueShift: 0, saturationMultiplier: 1.5, lightnessShift: 0.1, preserveHighlights: true },
      saturationCurve: [1.3, 1.5],
      temperatureCurve: [4800, 4500],
      preserveBrandColors: false // Allow dramatic shift for impact
    },
    scaleTransition: {
      strategy: 'jump',
      startScale: 1.3,
      endScale: 1.6,
      focusPointShift: { x: 5, y: -10 },
      maintainAspectRatio: false,
      easeInOut: false
    },
    lightingTransition: {
      strategy: 'crystallize',
      shadowDepthCurve: [0.8, 0.9],
      highlightIntensityCurve: [0.9, 1.0],
      contrastProgression: [1.4, 1.6],
      moodPreservation: 0.3
    }
  },
  'impact-to-follow-through': {
    from: 'impact',
    to: 'follow-through',
    duration: 400,
    easing: 'easeOut',
    visualBridge: {
      type: 'dissolve',
      connectingElements: [
        { id: 'motion-completion', element: 'player', position: { x: 60, y: 50 }, scale: 1.0, opacity: 0.9, priority: 0.8 },
        { id: 'force-dissipation', element: 'ball', position: { x: 90, y: 30 }, scale: 0.8, opacity: 0.7, priority: 0.6 },
        { id: 'team-context', element: 'background', position: { x: 30, y: 60 }, scale: 1.2, opacity: 0.8, priority: 0.7 }
      ],
      motionContinuity: true,
      preserveAspectRatio: true,
      blendMode: 'soft-light'
    },
    colorTransition: {
      strategy: 'smooth',
      primaryColorShift: { hueShift: -10, saturationMultiplier: 0.8, lightnessShift: 0.1, preserveHighlights: false },
      saturationCurve: [1.5, 1.2, 1.0, 0.9],
      temperatureCurve: [4500, 5000, 5500, 5800],
      preserveBrandColors: true
    },
    scaleTransition: {
      strategy: 'smooth',
      startScale: 1.6,
      endScale: 1.0,
      focusPointShift: { x: -25, y: 15 },
      maintainAspectRatio: true,
      easeInOut: true
    },
    lightingTransition: {
      strategy: 'maintain',
      shadowDepthCurve: [0.9, 0.6, 0.4, 0.3],
      highlightIntensityCurve: [1.0, 0.7, 0.5, 0.4],
      contrastProgression: [1.6, 1.3, 1.1, 1.0],
      moodPreservation: 0.9
    }
  }
};

export const VisualContinuitySystem: React.FC<VisualContinuitySystemProps> = ({
  currentPhase,
  previousPhase,
  transitionProgress,
  isTransitioning,
  visualIntensity,
  onTransitionComplete,
  onContinuityMetrics,
  children,
  className = ''
}) => {
  const [transitionState, setTransitionState] = useState<'idle' | 'preparing' | 'transitioning' | 'completing'>('idle');
  const [continuityMetrics, setContinuityMetrics] = useState<ContinuityMetrics | null>(null);
  const [transitionConfig, setTransitionConfig] = useState<TransitionConfiguration | null>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const metricsIntervalRef = useRef<number>();

  // Get transition configuration for current phase pair
  const getTransitionConfig = useCallback((from?: VolleyballPhase, to?: VolleyballPhase): TransitionConfiguration | null => {
    if (!from || !to) return null;
    const key = `${from}-to-${to}`;
    return TRANSITION_CONFIGS[key] || null;
  }, []);

  // Calculate easing function value
  const calculateEasing = useCallback((progress: number, easing: EasingFunction): number => {
    switch (easing) {
      case 'linear':
        return progress;
      case 'easeIn':
        return progress * progress;
      case 'easeOut':
        return 1 - Math.pow(1 - progress, 2);
      case 'easeInOut':
        return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case 'cubic':
        return progress * progress * progress;
      case 'athletic':
        // Athletic timing curve - quick start, sustained middle, sharp finish
        if (progress < 0.2) return Math.pow(progress / 0.2, 0.5) * 0.3;
        if (progress < 0.8) return 0.3 + (progress - 0.2) / 0.6 * 0.4;
        return 0.7 + Math.pow((progress - 0.8) / 0.2, 2) * 0.3;
      default:
        return progress;
    }
  }, []);

  // Calculate interpolated values during transition
  const interpolateValue = useCallback((start: number, end: number, progress: number, easing?: EasingFunction): number => {
    const easedProgress = easing ? calculateEasing(progress, easing) : progress;
    return start + (end - start) * easedProgress;
  }, [calculateEasing]);

  // Calculate color interpolation
  const interpolateColor = useCallback((
    startTemp: number,
    endTemp: number,
    progress: number,
    config: ColorTransitionConfig
  ): { temperature: number; saturation: number; contrast: number } => {
    const curveIndex = Math.floor(progress * (config.temperatureCurve.length - 1));
    const localProgress = (progress * (config.temperatureCurve.length - 1)) - curveIndex;

    const temperature = config.temperatureCurve[curveIndex] +
      (config.temperatureCurve[Math.min(curveIndex + 1, config.temperatureCurve.length - 1)] -
       config.temperatureCurve[curveIndex]) * localProgress;

    const saturationIndex = Math.floor(progress * (config.saturationCurve.length - 1));
    const saturation = config.saturationCurve[saturationIndex] +
      (config.saturationCurve[Math.min(saturationIndex + 1, config.saturationCurve.length - 1)] -
       config.saturationCurve[saturationIndex]) * localProgress;

    return {
      temperature,
      saturation,
      contrast: 1 + visualIntensity * 0.5
    };
  }, [visualIntensity]);

  // Calculate scale transformation
  const calculateScaleTransform = useCallback((
    config: ScaleTransitionConfig,
    progress: number,
    easing: EasingFunction
  ): { scale: number; focusX: number; focusY: number } => {
    const easedProgress = config.easeInOut ? calculateEasing(progress, 'easeInOut') : calculateEasing(progress, easing);

    const scale = interpolateValue(config.startScale, config.endScale, easedProgress);
    const focusX = 50 + config.focusPointShift.x * easedProgress;
    const focusY = 50 + config.focusPointShift.y * easedProgress;

    return { scale, focusX, focusY };
  }, [interpolateValue, calculateEasing]);

  // Calculate lighting effects
  const calculateLightingEffects = useCallback((
    config: LightingTransitionConfig,
    progress: number
  ): { shadowDepth: number; highlightIntensity: number; contrast: number } => {
    const curveIndex = Math.floor(progress * (config.shadowDepthCurve.length - 1));
    const localProgress = (progress * (config.shadowDepthCurve.length - 1)) - curveIndex;

    const shadowDepth = config.shadowDepthCurve[curveIndex] +
      (config.shadowDepthCurve[Math.min(curveIndex + 1, config.shadowDepthCurve.length - 1)] -
       config.shadowDepthCurve[curveIndex]) * localProgress;

    const highlightIndex = Math.floor(progress * (config.highlightIntensityCurve.length - 1));
    const highlightIntensity = config.highlightIntensityCurve[highlightIndex] +
      (config.highlightIntensityCurve[Math.min(highlightIndex + 1, config.highlightIntensityCurve.length - 1)] -
       config.highlightIntensityCurve[highlightIndex]) * localProgress;

    const contrastIndex = Math.floor(progress * (config.contrastProgression.length - 1));
    const contrast = config.contrastProgression[contrastIndex] +
      (config.contrastProgression[Math.min(contrastIndex + 1, config.contrastProgression.length - 1)] -
       config.contrastProgression[contrastIndex]) * localProgress;

    return { shadowDepth, highlightIntensity, contrast };
  }, []);

  // Generate dynamic styles based on transition state
  const generateTransitionStyles = useCallback((): React.CSSProperties => {
    if (!transitionConfig || !isTransitioning) {
      return {
        filter: `contrast(${1 + visualIntensity * 0.5}) saturate(${0.9 + visualIntensity * 0.4})`,
        transform: `scale(${1 + visualIntensity * 0.1})`,
        transition: 'all 0.3s ease-out'
      };
    }

    const colorEffects = interpolateColor(5500, 4500, transitionProgress, transitionConfig.colorTransition);
    const scaleEffects = calculateScaleTransform(transitionConfig.scaleTransition, transitionProgress, transitionConfig.easing);
    const lightingEffects = calculateLightingEffects(transitionConfig.lightingTransition, transitionProgress);

    return {
      filter: `
        contrast(${lightingEffects.contrast})
        saturate(${colorEffects.saturation})
        brightness(${1 + visualIntensity * 0.2})
        drop-shadow(0 0 ${lightingEffects.shadowDepth * 20}px rgba(0, 0, 0, ${lightingEffects.shadowDepth}))
      `,
      transform: `
        scale(${scaleEffects.scale})
        translate(-50%, -50%)
      `,
      transformOrigin: `${scaleEffects.focusX}% ${scaleEffects.focusY}%`,
      mixBlendMode: transitionConfig.visualBridge.blendMode,
      transition: isTransitioning ? 'none' : 'all 0.3s ease-out',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: '100%'
    };
  }, [transitionConfig, isTransitioning, transitionProgress, visualIntensity, interpolateColor, calculateScaleTransform, calculateLightingEffects]);

  // Calculate continuity metrics
  const calculateContinuityMetrics = useCallback((): ContinuityMetrics => {
    if (!transitionConfig || !isTransitioning) {
      return {
        transitionSmoothness: 1.0,
        visualCoherence: 1.0,
        emotionalFlow: 1.0,
        brandConsistency: 1.0,
        overallScore: 1.0,
        performanceImpact: 0.1
      };
    }

    // Calculate transition smoothness based on easing and visual bridge quality
    const transitionSmoothness = transitionConfig.visualBridge.motionContinuity ? 0.9 : 0.7;

    // Visual coherence based on connecting elements and blend modes
    const visualCoherence = Math.min(1.0,
      (transitionConfig.visualBridge.connectingElements.length / 3) * 0.6 +
      (transitionConfig.colorTransition.preserveBrandColors ? 0.2 : 0.1) +
      (transitionConfig.visualBridge.preserveAspectRatio ? 0.2 : 0.1)
    );

    // Emotional flow based on phase progression and intensity building
    const phaseIntensities: Record<VolleyballPhase, number> = {
      'setup': 0.3,
      'anticipation': 0.6,
      'approach': 0.85,
      'spike': 0.95,
      'impact': 1.0,
      'follow-through': 0.4
    };

    const fromIntensity = phaseIntensities[transitionConfig.from];
    const toIntensity = phaseIntensities[transitionConfig.to];
    const expectedFlow = toIntensity > fromIntensity ? 0.9 : (transitionConfig.to === 'follow-through' ? 0.8 : 0.6);
    const emotionalFlow = expectedFlow;

    // Brand consistency based on professional standards preservation
    const brandConsistency = Math.min(1.0,
      (transitionConfig.colorTransition.preserveBrandColors ? 0.3 : 0.1) +
      (transitionConfig.lightingTransition.moodPreservation * 0.4) +
      0.3 // Base professional standard
    );

    // Performance impact based on complexity
    const performanceImpact = Math.max(0.1,
      (transitionConfig.duration / 1000) * 0.3 +
      (transitionConfig.visualBridge.connectingElements.length / 5) * 0.2 +
      (transitionConfig.visualBridge.type === 'morph' ? 0.3 : 0.1)
    );

    const overallScore = (transitionSmoothness + visualCoherence + emotionalFlow + brandConsistency) / 4;

    return {
      transitionSmoothness,
      visualCoherence,
      emotionalFlow,
      brandConsistency,
      overallScore,
      performanceImpact
    };
  }, [transitionConfig, isTransitioning]);

  // Update transition configuration when phases change
  useEffect(() => {
    if (previousPhase && currentPhase && previousPhase !== currentPhase) {
      const config = getTransitionConfig(previousPhase, currentPhase);
      setTransitionConfig(config);

      if (isTransitioning) {
        setTransitionState('transitioning');
      }
    }
  }, [previousPhase, currentPhase, isTransitioning, getTransitionConfig]);

  // Monitor transition progress and update metrics
  useEffect(() => {
    if (isTransitioning && transitionConfig) {
      setTransitionState('transitioning');

      // Update metrics periodically during transition
      metricsIntervalRef.current = window.setInterval(() => {
        const metrics = calculateContinuityMetrics();
        setContinuityMetrics(metrics);
        onContinuityMetrics?.(metrics);
      }, 50);

      return () => {
        if (metricsIntervalRef.current) {
          clearInterval(metricsIntervalRef.current);
        }
      };
    } else if (!isTransitioning && transitionState === 'transitioning') {
      setTransitionState('completing');

      // Calculate final metrics
      const finalMetrics = calculateContinuityMetrics();
      setContinuityMetrics(finalMetrics);
      onContinuityMetrics?.(finalMetrics);
      onTransitionComplete?.(currentPhase);

      // Reset state after brief delay
      setTimeout(() => {
        setTransitionState('idle');
        setTransitionConfig(null);
      }, 100);
    }
  }, [isTransitioning, transitionConfig, transitionState, calculateContinuityMetrics, onContinuityMetrics, onTransitionComplete, currentPhase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, []);

  // Render connecting elements overlay
  const renderConnectingElements = useCallback(() => {
    if (!transitionConfig || !isTransitioning) return null;

    return (
      <div
        className="connecting-elements-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        {transitionConfig.visualBridge.connectingElements
          .sort((a, b) => b.priority - a.priority) // Render by priority
          .map(element => (
            <div
              key={element.id}
              className={`connecting-element ${element.element}`}
              style={{
                position: 'absolute',
                left: `${element.position.x}%`,
                top: `${element.position.y}%`,
                transform: `translate(-50%, -50%) scale(${element.scale})`,
                opacity: element.opacity * transitionProgress,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(139, 92, 246, ${element.opacity}) 0%, transparent 70%)`,
                transition: 'opacity 0.1s ease-out'
              }}
            />
          ))}
      </div>
    );
  }, [transitionConfig, isTransitioning, transitionProgress]);

  return (
    <div
      ref={transitionRef}
      className={`visual-continuity-system ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Main content with transition effects */}
      <div
        className="transition-content"
        style={generateTransitionStyles()}
      >
        {children}
      </div>

      {/* Connecting elements overlay */}
      {renderConnectingElements()}

      {/* Transition progress indicator (development only) */}
      {process.env.NODE_ENV === 'development' && isTransitioning && (
        <div
          className="transition-debug"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div>Transition: {previousPhase} → {currentPhase}</div>
          <div>Progress: {Math.round(transitionProgress * 100)}%</div>
          <div>State: {transitionState}</div>
          {transitionConfig && (
            <>
              <div>Duration: {transitionConfig.duration}ms</div>
              <div>Type: {transitionConfig.visualBridge.type}</div>
            </>
          )}
          {continuityMetrics && (
            <>
              <div>Smoothness: {Math.round(continuityMetrics.transitionSmoothness * 100)}%</div>
              <div>Coherence: {Math.round(continuityMetrics.visualCoherence * 100)}%</div>
              <div>Overall: {Math.round(continuityMetrics.overallScore * 100)}%</div>
            </>
          )}
        </div>
      )}

      {/* Performance impact warning (development only) */}
      {process.env.NODE_ENV === 'development' && continuityMetrics && continuityMetrics.performanceImpact > 0.5 && (
        <div
          className="performance-warning"
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            padding: '6px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            fontFamily: 'monospace',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          ⚠️ High Performance Impact: {Math.round(continuityMetrics.performanceImpact * 100)}%
        </div>
      )}
    </div>
  );
};

export default VisualContinuitySystem;