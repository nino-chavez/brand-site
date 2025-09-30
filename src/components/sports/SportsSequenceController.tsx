import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { VolleyballPhase } from '../../hooks/useVolleyballTiming';

export interface SportsSequenceControllerProps {
  currentPhase: VolleyballPhase;
  phaseProgress: number;
  isPlaying: boolean;
  leftViewportFrame: number;
  rightViewportFrame: number;
  onSyncUpdate?: (syncData: SyncData) => void;
  onIntensityChange?: (intensity: number) => void;
  children?: React.ReactNode;
  className?: string;
}

export interface SyncData {
  timestamp: number;
  leftFrame: number;
  rightFrame: number;
  drift: number;
  correctionApplied: boolean;
  sharedTimeline: SharedTimeline;
}

export interface SharedTimeline {
  masterClock: number;
  currentTime: number;
  frameRate: number;
  lastSyncTimestamp: number;
  driftCorrection: number;
  totalFrames: number;
}

export interface PhaseAlignment {
  phase: VolleyballPhase;
  technicalMarkers: TechnicalMarker[];
  sportsMarkers: SportsMarker[];
  sharedMarkers: SharedMarker[];
  intensityProfile: IntensityProfile;
}

export interface TechnicalMarker {
  id: string;
  timestamp: number;
  type: 'architecture-change' | 'performance-spike' | 'scaling-event' | 'optimization' | 'production-ready';
  intensity: number;
  emphasis: TechnicalEmphasis;
}

export interface SportsMarker {
  id: string;
  timestamp: number;
  type: 'preparation' | 'tension-build' | 'explosive-movement' | 'peak-action' | 'contact-moment' | 'completion';
  intensity: number;
  emphasis: SportsEmphasis;
}

export interface SharedMarker {
  id: string;
  timestamp: number;
  leftPosition: { x: number; y: number };
  rightPosition: { x: number; y: number };
  connectionStrength: number;
  visualWeight: number;
}

export interface TechnicalEmphasis {
  complexity: number;
  performance: number;
  scalability: number;
  reliability: number;
}

export interface SportsEmphasis {
  athleticism: number;
  precision: number;
  power: number;
  coordination: number;
}

export interface IntensityProfile {
  current: number;
  target: number;
  buildRate: number;
  peakDuration: number;
  releaseRate: number;
  peakTimestamp?: number;
}

export interface VisualIntensityBuilder {
  phase: VolleyballPhase;
  startIntensity: number;
  peakIntensity: number;
  endIntensity: number;
  buildCurve: 'linear' | 'exponential' | 'cubic' | 'athletic';
  peakOffset: number; // Percentage through phase where peak occurs
}

// Phase alignment configurations
const PHASE_ALIGNMENTS: Record<VolleyballPhase, PhaseAlignment> = {
  setup: {
    phase: 'setup',
    technicalMarkers: [
      {
        id: 'foundation-planning',
        timestamp: 300,
        type: 'architecture-change',
        intensity: 0.3,
        emphasis: { complexity: 0.3, performance: 0.2, scalability: 0.4, reliability: 0.8 }
      },
      {
        id: 'initial-structure',
        timestamp: 900,
        type: 'architecture-change',
        intensity: 0.4,
        emphasis: { complexity: 0.4, performance: 0.3, scalability: 0.5, reliability: 0.7 }
      }
    ],
    sportsMarkers: [
      {
        id: 'positioning',
        timestamp: 200,
        type: 'preparation',
        intensity: 0.2,
        emphasis: { athleticism: 0.2, precision: 0.8, power: 0.1, coordination: 0.7 }
      },
      {
        id: 'mental-focus',
        timestamp: 800,
        type: 'preparation',
        intensity: 0.3,
        emphasis: { athleticism: 0.2, precision: 0.9, power: 0.1, coordination: 0.8 }
      },
      {
        id: 'ready-stance',
        timestamp: 1200,
        type: 'preparation',
        intensity: 0.35,
        emphasis: { athleticism: 0.3, precision: 0.8, power: 0.2, coordination: 0.8 }
      }
    ],
    sharedMarkers: [
      {
        id: 'foundation-focus',
        timestamp: 500,
        leftPosition: { x: 50, y: 50 },
        rightPosition: { x: 45, y: 55 },
        connectionStrength: 0.6,
        visualWeight: 0.4
      }
    ],
    intensityProfile: {
      current: 0.2,
      target: 0.35,
      buildRate: 0.1,
      peakDuration: 400,
      releaseRate: 0.05
    }
  },
  anticipation: {
    phase: 'anticipation',
    technicalMarkers: [
      {
        id: 'complexity-emergence',
        timestamp: 200,
        type: 'architecture-change',
        intensity: 0.5,
        emphasis: { complexity: 0.6, performance: 0.4, scalability: 0.7, reliability: 0.6 }
      },
      {
        id: 'scaling-considerations',
        timestamp: 600,
        type: 'scaling-event',
        intensity: 0.6,
        emphasis: { complexity: 0.7, performance: 0.5, scalability: 0.8, reliability: 0.7 }
      },
      {
        id: 'tension-building',
        timestamp: 1000,
        type: 'performance-spike',
        intensity: 0.7,
        emphasis: { complexity: 0.8, performance: 0.6, scalability: 0.7, reliability: 0.6 }
      }
    ],
    sportsMarkers: [
      {
        id: 'muscle-tension',
        timestamp: 150,
        type: 'tension-build',
        intensity: 0.4,
        emphasis: { athleticism: 0.4, precision: 0.9, power: 0.3, coordination: 0.8 }
      },
      {
        id: 'focus-intensify',
        timestamp: 500,
        type: 'tension-build',
        intensity: 0.6,
        emphasis: { athleticism: 0.5, precision: 0.95, power: 0.4, coordination: 0.9 }
      },
      {
        id: 'pre-movement',
        timestamp: 900,
        type: 'tension-build',
        intensity: 0.75,
        emphasis: { athleticism: 0.6, precision: 0.9, power: 0.5, coordination: 0.85 }
      }
    ],
    sharedMarkers: [
      {
        id: 'tension-point',
        timestamp: 700,
        leftPosition: { x: 60, y: 40 },
        rightPosition: { x: 65, y: 45 },
        connectionStrength: 0.8,
        visualWeight: 0.6
      }
    ],
    intensityProfile: {
      current: 0.35,
      target: 0.75,
      buildRate: 0.3,
      peakDuration: 300,
      releaseRate: 0.1,
      peakTimestamp: 1000
    }
  },
  approach: {
    phase: 'approach',
    technicalMarkers: [
      {
        id: 'performance-optimization',
        timestamp: 200,
        type: 'optimization',
        intensity: 0.7,
        emphasis: { complexity: 0.8, performance: 0.8, scalability: 0.9, reliability: 0.7 }
      },
      {
        id: 'scaling-implementation',
        timestamp: 600,
        type: 'scaling-event',
        intensity: 0.85,
        emphasis: { complexity: 0.9, performance: 0.9, scalability: 1.0, reliability: 0.8 }
      },
      {
        id: 'momentum-building',
        timestamp: 900,
        type: 'performance-spike',
        intensity: 0.9,
        emphasis: { complexity: 0.85, performance: 0.95, scalability: 0.9, reliability: 0.75 }
      }
    ],
    sportsMarkers: [
      {
        id: 'explosive-start',
        timestamp: 100,
        type: 'explosive-movement',
        intensity: 0.75,
        emphasis: { athleticism: 0.8, precision: 0.7, power: 0.7, coordination: 0.9 }
      },
      {
        id: 'momentum-peak',
        timestamp: 500,
        type: 'explosive-movement',
        intensity: 0.9,
        emphasis: { athleticism: 0.9, precision: 0.8, power: 0.8, coordination: 0.85 }
      },
      {
        id: 'approach-climax',
        timestamp: 800,
        type: 'peak-action',
        intensity: 0.95,
        emphasis: { athleticism: 0.95, precision: 0.85, power: 0.85, coordination: 0.9 }
      }
    ],
    sharedMarkers: [
      {
        id: 'momentum-sync',
        timestamp: 600,
        leftPosition: { x: 70, y: 35 },
        rightPosition: { x: 75, y: 40 },
        connectionStrength: 0.9,
        visualWeight: 0.8
      }
    ],
    intensityProfile: {
      current: 0.75,
      target: 0.95,
      buildRate: 0.5,
      peakDuration: 200,
      releaseRate: 0.2,
      peakTimestamp: 800
    }
  },
  spike: {
    phase: 'spike',
    technicalMarkers: [
      {
        id: 'critical-optimization',
        timestamp: 150,
        type: 'optimization',
        intensity: 0.9,
        emphasis: { complexity: 0.95, performance: 1.0, scalability: 0.85, reliability: 0.8 }
      },
      {
        id: 'performance-peak',
        timestamp: 500,
        type: 'performance-spike',
        intensity: 0.95,
        emphasis: { complexity: 1.0, performance: 1.0, scalability: 0.9, reliability: 0.85 }
      },
      {
        id: 'execution-moment',
        timestamp: 700,
        type: 'production-ready',
        intensity: 1.0,
        emphasis: { complexity: 0.9, performance: 1.0, scalability: 0.95, reliability: 0.9 }
      }
    ],
    sportsMarkers: [
      {
        id: 'jump-initiation',
        timestamp: 100,
        type: 'peak-action',
        intensity: 0.9,
        emphasis: { athleticism: 0.95, precision: 0.9, power: 0.9, coordination: 0.8 }
      },
      {
        id: 'peak-elevation',
        timestamp: 400,
        type: 'peak-action',
        intensity: 0.98,
        emphasis: { athleticism: 1.0, precision: 0.95, power: 0.95, coordination: 0.9 }
      },
      {
        id: 'strike-preparation',
        timestamp: 650,
        type: 'peak-action',
        intensity: 1.0,
        emphasis: { athleticism: 1.0, precision: 1.0, power: 0.98, coordination: 0.95 }
      }
    ],
    sharedMarkers: [
      {
        id: 'execution-focus',
        timestamp: 500,
        leftPosition: { x: 80, y: 25 },
        rightPosition: { x: 85, y: 30 },
        connectionStrength: 1.0,
        visualWeight: 1.0
      }
    ],
    intensityProfile: {
      current: 0.95,
      target: 1.0,
      buildRate: 0.8,
      peakDuration: 150,
      releaseRate: 0.1,
      peakTimestamp: 650
    }
  },
  impact: {
    phase: 'impact',
    technicalMarkers: [
      {
        id: 'production-excellence',
        timestamp: 100,
        type: 'production-ready',
        intensity: 1.0,
        emphasis: { complexity: 1.0, performance: 1.0, scalability: 1.0, reliability: 1.0 }
      },
      {
        id: 'crystallized-architecture',
        timestamp: 300,
        type: 'architecture-change',
        intensity: 1.0,
        emphasis: { complexity: 1.0, performance: 1.0, scalability: 1.0, reliability: 1.0 }
      },
      {
        id: 'peak-performance',
        timestamp: 500,
        type: 'performance-spike',
        intensity: 1.0,
        emphasis: { complexity: 1.0, performance: 1.0, scalability: 1.0, reliability: 1.0 }
      }
    ],
    sportsMarkers: [
      {
        id: 'contact-moment',
        timestamp: 200,
        type: 'contact-moment',
        intensity: 1.0,
        emphasis: { athleticism: 1.0, precision: 1.0, power: 1.0, coordination: 1.0 }
      },
      {
        id: 'force-transfer',
        timestamp: 350,
        type: 'contact-moment',
        intensity: 1.0,
        emphasis: { athleticism: 1.0, precision: 1.0, power: 1.0, coordination: 1.0 }
      },
      {
        id: 'decisive-moment',
        timestamp: 500,
        type: 'contact-moment',
        intensity: 1.0,
        emphasis: { athleticism: 1.0, precision: 1.0, power: 1.0, coordination: 1.0 }
      }
    ],
    sharedMarkers: [
      {
        id: 'impact-crystallization',
        timestamp: 350,
        leftPosition: { x: 85, y: 20 },
        rightPosition: { x: 90, y: 25 },
        connectionStrength: 1.0,
        visualWeight: 1.0
      }
    ],
    intensityProfile: {
      current: 1.0,
      target: 1.0,
      buildRate: 0.0,
      peakDuration: 600, // Sustained peak
      releaseRate: 0.3,
      peakTimestamp: 350
    }
  },
  'follow-through': {
    phase: 'follow-through',
    technicalMarkers: [
      {
        id: 'monitoring-integration',
        timestamp: 200,
        type: 'architecture-change',
        intensity: 0.7,
        emphasis: { complexity: 0.7, performance: 0.8, scalability: 0.6, reliability: 0.9 }
      },
      {
        id: 'analytics-optimization',
        timestamp: 800,
        type: 'optimization',
        intensity: 0.6,
        emphasis: { complexity: 0.6, performance: 0.7, scalability: 0.7, reliability: 0.8 }
      },
      {
        id: 'continuous-improvement',
        timestamp: 1500,
        type: 'performance-spike',
        intensity: 0.5,
        emphasis: { complexity: 0.5, performance: 0.6, scalability: 0.6, reliability: 0.85 }
      }
    ],
    sportsMarkers: [
      {
        id: 'natural-completion',
        timestamp: 300,
        type: 'completion',
        intensity: 0.6,
        emphasis: { athleticism: 0.5, precision: 0.6, power: 0.3, coordination: 0.9 }
      },
      {
        id: 'body-coordination',
        timestamp: 900,
        type: 'completion',
        intensity: 0.4,
        emphasis: { athleticism: 0.4, precision: 0.7, power: 0.2, coordination: 0.95 }
      },
      {
        id: 'team-dynamics',
        timestamp: 1600,
        type: 'completion',
        intensity: 0.35,
        emphasis: { athleticism: 0.3, precision: 0.5, power: 0.2, coordination: 1.0 }
      }
    ],
    sharedMarkers: [
      {
        id: 'resolution-flow',
        timestamp: 1000,
        leftPosition: { x: 40, y: 60 },
        rightPosition: { x: 35, y: 65 },
        connectionStrength: 0.7,
        visualWeight: 0.5
      }
    ],
    intensityProfile: {
      current: 1.0,
      target: 0.35,
      buildRate: 0.0,
      peakDuration: 100,
      releaseRate: 0.4,
      peakTimestamp: 50
    }
  }
};

export const SportsSequenceController: React.FC<SportsSequenceControllerProps> = ({
  currentPhase,
  phaseProgress,
  isPlaying,
  leftViewportFrame,
  rightViewportFrame,
  onSyncUpdate,
  onIntensityChange,
  children,
  className = ''
}) => {
  const [sharedTimeline, setSharedTimeline] = useState<SharedTimeline>({
    masterClock: performance.now(),
    currentTime: 0,
    frameRate: 60,
    lastSyncTimestamp: performance.now(),
    driftCorrection: 0,
    totalFrames: 0
  });

  const [currentIntensity, setCurrentIntensity] = useState<number>(0.2);
  const [phaseAlignment, setPhaseAlignment] = useState<PhaseAlignment>(PHASE_ALIGNMENTS[currentPhase]);
  const intensityUpdateRef = useRef<number>();
  const syncIntervalRef = useRef<number>();

  // Get current phase alignment configuration
  const currentAlignment = useMemo(() => PHASE_ALIGNMENTS[currentPhase], [currentPhase]);

  // Frame-perfect alignment system with shared timeline controller
  const updateSharedTimeline = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - sharedTimeline.lastSyncTimestamp;
    const expectedFrameTime = 1000 / sharedTimeline.frameRate;

    // Detect frame drift
    const leftRightDrift = Math.abs(leftViewportFrame - rightViewportFrame);
    const correctionApplied = leftRightDrift > 0;

    // Correct drift by syncing to slower viewport
    const syncedFrame = Math.min(leftViewportFrame, rightViewportFrame);

    const updatedTimeline: SharedTimeline = {
      masterClock: sharedTimeline.masterClock,
      currentTime: sharedTimeline.currentTime + deltaTime,
      frameRate: sharedTimeline.frameRate,
      lastSyncTimestamp: currentTime,
      driftCorrection: sharedTimeline.driftCorrection + leftRightDrift,
      totalFrames: syncedFrame
    };

    setSharedTimeline(updatedTimeline);

    // Notify parent of sync data
    if (onSyncUpdate) {
      const syncData: SyncData = {
        timestamp: currentTime,
        leftFrame: leftViewportFrame,
        rightFrame: rightViewportFrame,
        drift: leftRightDrift,
        correctionApplied,
        sharedTimeline: updatedTimeline
      };

      onSyncUpdate(syncData);
    }
  }, [leftViewportFrame, rightViewportFrame, sharedTimeline, onSyncUpdate]);

  // Visual intensity progression building toward spike/impact phases
  const updateVisualIntensity = useCallback(() => {
    const alignment = currentAlignment;
    const profile = alignment.intensityProfile;
    const currentTime = sharedTimeline.currentTime;

    // Calculate intensity based on phase progress and intensity profile
    let targetIntensity = profile.current;

    // Build intensity toward peak
    if (phaseProgress < 0.8) { // Build phase
      const buildProgress = phaseProgress / 0.8;
      targetIntensity = profile.current + (profile.target - profile.current) * buildProgress;
    } else { // Peak/sustain phase
      targetIntensity = profile.target;
    }

    // Apply athletic rhythm curve
    const athleticCurve = getAthleticIntensityCurve(currentPhase, phaseProgress);
    const finalIntensity = targetIntensity * athleticCurve;

    // Smooth intensity transitions
    const intensityDelta = finalIntensity - currentIntensity;
    const smoothingFactor = 0.1; // Adjust for smoother/snappier transitions
    const newIntensity = currentIntensity + intensityDelta * smoothingFactor;

    setCurrentIntensity(newIntensity);
    onIntensityChange?.(newIntensity);
  }, [currentPhase, phaseProgress, currentAlignment, sharedTimeline.currentTime, currentIntensity, onIntensityChange]);

  // Athletic rhythm intensity curve
  const getAthleticIntensityCurve = useCallback((phase: VolleyballPhase, progress: number): number => {
    const curves = {
      'setup': (p: number) => 0.2 + 0.15 * Math.sin(p * Math.PI), // Gentle sine wave
      'anticipation': (p: number) => 0.4 + 0.35 * (1 - Math.cos(p * Math.PI)), // Rising curve
      'approach': (p: number) => 0.6 + 0.35 * Math.pow(p, 1.5), // Exponential build
      'spike': (p: number) => 0.8 + 0.2 * Math.pow(p, 0.5), // Quick rise to peak
      'impact': (p: number) => 1.0, // Sustained maximum
      'follow-through': (p: number) => 1.0 - 0.65 * Math.pow(p, 2) // Rapid decay
    };

    return curves[phase](progress);
  }, []);

  // Phase-driven sports content injection with smooth transitions
  const getSportsContentForPhase = useCallback((phase: VolleyballPhase, progress: number) => {
    const alignment = currentAlignment;
    const currentTime = progress * getPhaseDuration(phase);

    // Find active markers for current time - guard against undefined alignment
    const activeMarkers = alignment?.sportsMarkers?.filter(marker => {
      const tolerance = 100; // 100ms tolerance
      return Math.abs(marker.timestamp - currentTime) <= tolerance;
    }) || [];

    return {
      phase,
      progress,
      activeMarkers,
      intensity: currentIntensity,
      emphasis: calculateCurrentEmphasis(activeMarkers),
      visualEffects: generateVisualEffects(phase, currentIntensity)
    };
  }, [currentAlignment, currentIntensity]);

  // Get phase duration in milliseconds
  const getPhaseDuration = useCallback((phase: VolleyballPhase): number => {
    const durations = {
      'setup': 1500,
      'anticipation': 1300,
      'approach': 1100,
      'spike': 900,
      'impact': 700,
      'follow-through': 2500
    };
    return durations[phase];
  }, []);

  // Calculate current emphasis based on active markers
  const calculateCurrentEmphasis = useCallback((activeMarkers: SportsMarker[]): SportsEmphasis => {
    if (activeMarkers.length === 0) {
      return { athleticism: 0.5, precision: 0.5, power: 0.5, coordination: 0.5 };
    }

    // Weighted average of active marker emphases
    const totalWeight = activeMarkers.reduce((sum, marker) => sum + marker.intensity, 0);

    return activeMarkers.reduce((result, marker) => {
      const weight = marker.intensity / totalWeight;
      return {
        athleticism: result.athleticism + marker.emphasis.athleticism * weight,
        precision: result.precision + marker.emphasis.precision * weight,
        power: result.power + marker.emphasis.power * weight,
        coordination: result.coordination + marker.emphasis.coordination * weight
      };
    }, { athleticism: 0, precision: 0, power: 0, coordination: 0 });
  }, []);

  // Generate visual effects based on phase and intensity
  const generateVisualEffects = useCallback((phase: VolleyballPhase, intensity: number) => {
    return {
      motionBlur: intensity * 0.4,
      contrast: 1 + intensity * 0.5,
      saturation: 0.9 + intensity * 0.4,
      brightness: 1 + intensity * 0.2,
      scale: 1 + intensity * 0.1,
      glow: intensity * 30, // Glow radius in pixels
      timeSlowFactor: phase === 'impact' ? Math.max(0.1, 1 - intensity * 0.9) : 1,
      crystallization: phase === 'impact' ? intensity : 0
    };
  }, []);

  // Dynamic content switching using React Suspense
  const renderPhaseContent = useCallback(() => {
    const sportsContent = getSportsContentForPhase(currentPhase, phaseProgress);

    return (
      <React.Suspense fallback={<div className="loading-sports-content">Loading sports sequence...</div>}>
        <div
          className="sports-sequence-content"
          style={{
            filter: `contrast(${sportsContent.visualEffects.contrast})
                     saturate(${sportsContent.visualEffects.saturation})
                     brightness(${sportsContent.visualEffects.brightness})`,
            transform: `scale(${sportsContent.visualEffects.scale})`,
            transition: 'all 0.3s ease-out'
          }}
        >
          {children}
        </div>
      </React.Suspense>
    );
  }, [currentPhase, phaseProgress, getSportsContentForPhase, children]);

  // Update phase alignment when phase changes
  useEffect(() => {
    setPhaseAlignment(currentAlignment);
  }, [currentAlignment]);

  // Start sync and intensity update loops when playing
  useEffect(() => {
    if (!isPlaying) {
      if (syncIntervalRef.current) {
        cancelAnimationFrame(syncIntervalRef.current);
      }
      if (intensityUpdateRef.current) {
        cancelAnimationFrame(intensityUpdateRef.current);
      }
      return;
    }

    const syncLoop = () => {
      updateSharedTimeline();
      syncIntervalRef.current = requestAnimationFrame(syncLoop);
    };

    const intensityLoop = () => {
      updateVisualIntensity();
      intensityUpdateRef.current = requestAnimationFrame(intensityLoop);
    };

    syncIntervalRef.current = requestAnimationFrame(syncLoop);
    intensityUpdateRef.current = requestAnimationFrame(intensityLoop);

    return () => {
      if (syncIntervalRef.current) {
        cancelAnimationFrame(syncIntervalRef.current);
      }
      if (intensityUpdateRef.current) {
        cancelAnimationFrame(intensityUpdateRef.current);
      }
    };
  }, [isPlaying, updateSharedTimeline, updateVisualIntensity]);

  // Performance monitoring with automatic degradation
  useEffect(() => {
    const monitorPerformance = () => {
      const currentFPS = sharedTimeline.frameRate;
      const targetFPS = 60;
      const performanceDegradation = (targetFPS - currentFPS) / targetFPS;

      if (performanceDegradation > 0.2) { // 20% degradation
        console.warn(`Performance degradation detected: ${Math.round(performanceDegradation * 100)}%`);

        // Reduce timeline update frequency
        setSharedTimeline(prev => ({
          ...prev,
          frameRate: Math.max(30, currentFPS * 0.8)
        }));
      }
    };

    const performanceInterval = setInterval(monitorPerformance, 1000);
    return () => clearInterval(performanceInterval);
  }, [sharedTimeline.frameRate]);

  return (
    <div
      className={`sports-sequence-controller ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Shared timeline visualization (development only) - hidden for clean UI */}
      {false && process.env.NODE_ENV === 'development' && (
        <div
          className="shared-timeline-debug"
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div>Timeline: {Math.round(sharedTimeline.currentTime)}ms</div>
          <div>Frames: L{leftViewportFrame} | R{rightViewportFrame}</div>
          <div>Drift: {Math.abs(leftViewportFrame - rightViewportFrame)}</div>
          <div>FPS: {Math.round(sharedTimeline.frameRate)}</div>
          <div>Intensity: {Math.round(currentIntensity * 100)}%</div>
          <div>Phase: {currentPhase} ({Math.round(phaseProgress * 100)}%)</div>
        </div>
      )}

      {/* Phase markers visualization (development only) - hidden for clean UI */}
      {false && process.env.NODE_ENV === 'development' && (
        <div
          className="phase-markers-debug"
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontFamily: 'monospace',
            zIndex: 1000,
            pointerEvents: 'none',
            maxWidth: '300px'
          }}
        >
          <div className="font-semibold mb-2">Active Markers:</div>
          {currentAlignment?.technicalMarkers
            ?.filter(marker => {
              const currentTime = phaseProgress * getPhaseDuration(currentPhase);
              return Math.abs(marker.timestamp - currentTime) <= 100;
            })
            ?.map(marker => (
              <div key={marker.id} className="text-blue-300">
                Tech: {marker.type} ({Math.round(marker.intensity * 100)}%)
              </div>
            ))}
          {currentAlignment?.sportsMarkers
            ?.filter(marker => {
              const currentTime = phaseProgress * getPhaseDuration(currentPhase);
              return Math.abs(marker.timestamp - currentTime) <= 100;
            })
            ?.map(marker => (
              <div key={marker.id} className="text-yellow-300">
                Sports: {marker.type} ({Math.round(marker.intensity * 100)}%)
              </div>
            ))}
        </div>
      )}

      {/* Intensity visualization overlay */}
      <div
        className="intensity-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%,
                      rgba(139, 92, 246, ${currentIntensity * 0.1}) 0%,
                      transparent 70%)`,
          pointerEvents: 'none',
          opacity: currentIntensity * 0.6,
          mixBlendMode: 'overlay',
          transition: 'opacity 0.3s ease-out'
        }}
      />

      {/* Main content with phase-specific sports sequence */}
      {renderPhaseContent()}
    </div>
  );
};

export default SportsSequenceController;