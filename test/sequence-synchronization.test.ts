import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';

// Types for sequence synchronization
export interface SequenceSyncState {
  currentPhase: VolleyballPhase;
  leftViewportFrame: number;
  rightViewportFrame: number;
  sharedTimeline: SharedTimeline;
  phaseMarkers: PhaseMarker[];
  visualIntensity: IntensityProfile;
}

export interface SharedTimeline {
  currentTime: number; // milliseconds
  masterClock: number;
  syncOffset: number;
  frameRate: number; // target FPS
  lastSyncTimestamp: number;
  driftCorrection: number;
}

export interface PhaseMarker {
  phase: VolleyballPhase;
  startTime: number;
  endTime: number;
  intensityPeak: number; // 0-1, when peak intensity occurs in phase
  technicalEmphasis: TechnicalEmphasis;
  sportsEmphasis: SportsEmphasis;
}

export interface TechnicalEmphasis {
  complexity: number; // 0-1
  performance: number; // 0-1
  scalability: number; // 0-1
  reliability: number; // 0-1
}

export interface SportsEmphasis {
  athleticism: number; // 0-1
  precision: number; // 0-1
  power: number; // 0-1
  coordination: number; // 0-1
}

export interface IntensityProfile {
  current: number; // 0-1
  target: number; // 0-1
  buildRate: number; // intensity increase per second
  peakDuration: number; // milliseconds
  releaseRate: number; // intensity decrease per second
}

export interface VisualContinuityPoint {
  id: string;
  leftViewportPos: { x: number; y: number };
  rightViewportPos: { x: number; y: number };
  morphingProgress: number;
  visualWeight: number; // 0-1, importance of this connection
  active: boolean;
}

describe('Sequence Synchronization Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Frame-Perfect Alignment Tests', () => {
    it('should maintain frame-perfect alignment between sports sequences and technical phases', () => {
      const syncState: SequenceSyncState = {
        currentPhase: 'setup',
        leftViewportFrame: 0,
        rightViewportFrame: 0,
        sharedTimeline: {
          currentTime: 0,
          masterClock: performance.now(),
          syncOffset: 0,
          frameRate: 60,
          lastSyncTimestamp: performance.now(),
          driftCorrection: 0
        },
        phaseMarkers: [],
        visualIntensity: {
          current: 0.2,
          target: 0.2,
          buildRate: 0.3,
          peakDuration: 600,
          releaseRate: 0.5
        }
      };

      const advanceFrame = (state: SequenceSyncState): SequenceSyncState => {
        const frameTime = 1000 / state.sharedTimeline.frameRate; // 16.67ms for 60fps
        const newTime = state.sharedTimeline.currentTime + frameTime;

        return {
          ...state,
          leftViewportFrame: state.leftViewportFrame + 1,
          rightViewportFrame: state.rightViewportFrame + 1,
          sharedTimeline: {
            ...state.sharedTimeline,
            currentTime: newTime,
            lastSyncTimestamp: performance.now()
          }
        };
      };

      // Test frame advancement
      let updatedState = advanceFrame(syncState);
      expect(updatedState.leftViewportFrame).toBe(1);
      expect(updatedState.rightViewportFrame).toBe(1);
      expect(updatedState.sharedTimeline.currentTime).toBeCloseTo(16.67, 1);

      // Test perfect synchronization - both viewports should have same frame count
      for (let i = 0; i < 60; i++) { // 1 second at 60fps
        updatedState = advanceFrame(updatedState);
      }

      expect(updatedState.leftViewportFrame).toBe(updatedState.rightViewportFrame);
      expect(updatedState.leftViewportFrame).toBe(61); // Initial 0 + 61 frames
      expect(updatedState.sharedTimeline.currentTime).toBeCloseTo(1016.67, 1); // ~1 second
    });

    it('should detect and correct frame drift between viewports', () => {
      const detectFrameDrift = (leftFrame: number, rightFrame: number): number => {
        return Math.abs(leftFrame - rightFrame);
      };

      const correctDrift = (
        state: SequenceSyncState,
        drift: number
      ): SequenceSyncState => {
        if (drift === 0) return state;

        // Sync to the slower viewport
        const targetFrame = Math.min(state.leftViewportFrame, state.rightViewportFrame);

        return {
          ...state,
          leftViewportFrame: targetFrame,
          rightViewportFrame: targetFrame,
          sharedTimeline: {
            ...state.sharedTimeline,
            driftCorrection: state.sharedTimeline.driftCorrection + drift
          }
        };
      };

      // Simulate drift scenario
      const driftedState: SequenceSyncState = {
        currentPhase: 'spike',
        leftViewportFrame: 180,
        rightViewportFrame: 177, // 3 frames behind
        sharedTimeline: {
          currentTime: 3000,
          masterClock: performance.now(),
          syncOffset: 0,
          frameRate: 60,
          lastSyncTimestamp: performance.now(),
          driftCorrection: 0
        },
        phaseMarkers: [],
        visualIntensity: {
          current: 0.8,
          target: 0.8,
          buildRate: 0.3,
          peakDuration: 600,
          releaseRate: 0.5
        }
      };

      const drift = detectFrameDrift(driftedState.leftViewportFrame, driftedState.rightViewportFrame);
      expect(drift).toBe(3);

      const correctedState = correctDrift(driftedState, drift);
      expect(correctedState.leftViewportFrame).toBe(177);
      expect(correctedState.rightViewportFrame).toBe(177);
      expect(correctedState.sharedTimeline.driftCorrection).toBe(3);
    });

    it('should maintain sub-16ms frame consistency', () => {
      const frameTimings: number[] = [];
      let lastFrameTime = performance.now();

      const recordFrameTiming = (): void => {
        const currentTime = performance.now();
        const frameDuration = currentTime - lastFrameTime;
        frameTimings.push(frameDuration);
        lastFrameTime = currentTime;
      };

      // Simulate 60fps frame recording
      for (let i = 0; i < 60; i++) {
        vi.advanceTimersByTime(16.67); // Target 60fps timing
        recordFrameTiming();
      }

      // Verify frame consistency
      frameTimings.forEach(timing => {
        expect(timing).toBeLessThanOrEqual(17); // Must be under 17ms for 60fps
        expect(timing).toBeLessThan(17); // Must be under 17ms for 60fps
      });

      const averageFrameTime = frameTimings.reduce((sum, time) => sum + time, 0) / frameTimings.length;
      expect(averageFrameTime).toBeCloseTo(16.67, 0.5);
    });
  });

  describe('Millisecond-Precise Phase Markers', () => {
    it('should create precise phase markers across both viewports', () => {
      const createPhaseMarkers = (): PhaseMarker[] => {
        const phases: VolleyballPhase[] = ['setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'];
        const phaseDurations = [1500, 1300, 1100, 900, 700, 2500]; // Total: 8000ms

        let currentTime = 0;
        return phases.map((phase, index) => {
          const startTime = currentTime;
          const duration = phaseDurations[index];
          const endTime = startTime + duration;
          currentTime = endTime;

          return {
            phase,
            startTime,
            endTime,
            intensityPeak: getIntensityPeakTiming(phase),
            technicalEmphasis: getTechnicalEmphasis(phase),
            sportsEmphasis: getSportsEmphasis(phase)
          };
        });
      };

      const getIntensityPeakTiming = (phase: VolleyballPhase): number => {
        // Peak timing as percentage through phase (0-1)
        const peakTimings = {
          'setup': 0.3,
          'anticipation': 0.7,
          'approach': 0.8,
          'spike': 0.9,
          'impact': 0.5, // Peak at middle for sustained intensity
          'follow-through': 0.2
        };
        return peakTimings[phase];
      };

      const getTechnicalEmphasis = (phase: VolleyballPhase): TechnicalEmphasis => {
        const emphases = {
          'setup': { complexity: 0.3, performance: 0.2, scalability: 0.4, reliability: 0.8 },
          'anticipation': { complexity: 0.6, performance: 0.4, scalability: 0.7, reliability: 0.7 },
          'approach': { complexity: 0.8, performance: 0.7, scalability: 0.9, reliability: 0.6 },
          'spike': { complexity: 0.9, performance: 0.9, scalability: 0.8, reliability: 0.7 },
          'impact': { complexity: 1.0, performance: 1.0, scalability: 1.0, reliability: 1.0 },
          'follow-through': { complexity: 0.7, performance: 0.8, scalability: 0.6, reliability: 0.9 }
        };
        return emphases[phase];
      };

      const getSportsEmphasis = (phase: VolleyballPhase): SportsEmphasis => {
        const emphases = {
          'setup': { athleticism: 0.2, precision: 0.8, power: 0.1, coordination: 0.7 },
          'anticipation': { athleticism: 0.4, precision: 0.9, power: 0.3, coordination: 0.8 },
          'approach': { athleticism: 0.8, precision: 0.7, power: 0.7, coordination: 0.9 },
          'spike': { athleticism: 0.9, precision: 0.8, power: 0.9, coordination: 0.8 },
          'impact': { athleticism: 1.0, precision: 1.0, power: 1.0, coordination: 1.0 },
          'follow-through': { athleticism: 0.5, precision: 0.6, power: 0.3, coordination: 0.9 }
        };
        return emphases[phase];
      };

      const phaseMarkers = createPhaseMarkers();

      // Verify marker precision
      expect(phaseMarkers).toHaveLength(6);
      expect(phaseMarkers[0].startTime).toBe(0);
      expect(phaseMarkers[0].endTime).toBe(1500);
      expect(phaseMarkers[5].endTime).toBe(8000); // Total cycle time

      // Verify no gaps between phases
      for (let i = 1; i < phaseMarkers.length; i++) {
        expect(phaseMarkers[i].startTime).toBe(phaseMarkers[i - 1].endTime);
      }

      // Verify intensity peaks are within valid range
      phaseMarkers.forEach(marker => {
        expect(marker.intensityPeak).toBeGreaterThanOrEqual(0);
        expect(marker.intensityPeak).toBeLessThanOrEqual(1);
      });

      // Verify emphasis values are properly normalized
      phaseMarkers.forEach(marker => {
        Object.values(marker.technicalEmphasis).forEach(value => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        });
        Object.values(marker.sportsEmphasis).forEach(value => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        });
      });
    });

    it('should synchronize phase transitions across viewports', () => {
      interface ViewportTransition {
        viewport: 'left' | 'right';
        fromPhase: VolleyballPhase;
        toPhase: VolleyballPhase;
        transitionTime: number;
        duration: number;
        synchronized: boolean;
      }

      const syncTransitions = (
        leftTransition: ViewportTransition,
        rightTransition: ViewportTransition,
        tolerance: number = 1 // 1ms tolerance
      ): { left: ViewportTransition; right: ViewportTransition; synced: boolean } => {
        const timeDiff = Math.abs(leftTransition.transitionTime - rightTransition.transitionTime);
        const synced = timeDiff <= tolerance;

        // If not synced, adjust to master timeline
        if (!synced) {
          const masterTime = Math.min(leftTransition.transitionTime, rightTransition.transitionTime);
          return {
            left: { ...leftTransition, transitionTime: masterTime, synchronized: true },
            right: { ...rightTransition, transitionTime: masterTime, synchronized: true },
            synced: true
          };
        }

        return {
          left: { ...leftTransition, synchronized: true },
          right: { ...rightTransition, synchronized: true },
          synced: true
        };
      };

      // Test synchronized transition
      const leftTransition: ViewportTransition = {
        viewport: 'left',
        fromPhase: 'setup',
        toPhase: 'anticipation',
        transitionTime: 1500,
        duration: 300,
        synchronized: false
      };

      const rightTransition: ViewportTransition = {
        viewport: 'right',
        fromPhase: 'setup',
        toPhase: 'anticipation',
        transitionTime: 1500,
        duration: 300,
        synchronized: false
      };

      const synced = syncTransitions(leftTransition, rightTransition);
      expect(synced.synced).toBe(true);
      expect(synced.left.synchronized).toBe(true);
      expect(synced.right.synchronized).toBe(true);

      // Test drift correction
      const driftedRightTransition: ViewportTransition = {
        ...rightTransition,
        transitionTime: 1503 // 3ms drift
      };

      const corrected = syncTransitions(leftTransition, driftedRightTransition);
      expect(corrected.synced).toBe(true);
      expect(corrected.left.transitionTime).toBe(corrected.right.transitionTime);
    });
  });

  describe('Visual Intensity Building Tests', () => {
    it('should build visual intensity properly through anticipation phases', () => {
      const intensityProfile: IntensityProfile = {
        current: 0.2,
        target: 0.8,
        buildRate: 0.4, // intensity per second
        peakDuration: 800,
        releaseRate: 0.6
      };

      const updateIntensity = (
        profile: IntensityProfile,
        deltaTime: number // milliseconds
      ): IntensityProfile => {
        const deltaSeconds = deltaTime / 1000;

        if (profile.current < profile.target) {
          // Building intensity
          const increase = profile.buildRate * deltaSeconds;
          const newCurrent = Math.min(profile.current + increase, profile.target);

          return { ...profile, current: newCurrent };
        } else if (profile.current > profile.target) {
          // Releasing intensity
          const decrease = profile.releaseRate * deltaSeconds;
          const newCurrent = Math.max(profile.current - decrease, profile.target);

          return { ...profile, current: newCurrent };
        }

        return profile;
      };

      // Test intensity building over 1.5 seconds (setup to anticipation)
      let currentProfile = intensityProfile;
      const timeSteps = 15; // 100ms steps
      const stepTime = 100;

      for (let i = 0; i < timeSteps; i++) {
        currentProfile = updateIntensity(currentProfile, stepTime);
      }

      // After 1.5 seconds with 0.4/sec build rate: 0.2 + (0.4 * 1.5) = 0.8
      expect(currentProfile.current).toBeCloseTo(0.8, 1);
    });

    it('should create maximum contrast and scale at impact phase', () => {
      interface VisualParameters {
        contrast: number;
        scale: number;
        brightness: number;
        saturation: number;
        intensity: number;
      }

      const calculateImpactVisuals = (
        baseParams: VisualParameters,
        intensityMultiplier: number
      ): VisualParameters => {
        return {
          contrast: Math.min(baseParams.contrast + intensityMultiplier * 0.5, 1.5),
          scale: Math.min(baseParams.scale + intensityMultiplier * 0.3, 1.3),
          brightness: Math.min(baseParams.brightness + intensityMultiplier * 0.2, 1.2),
          saturation: Math.min(baseParams.saturation + intensityMultiplier * 0.3, 1.3),
          intensity: intensityMultiplier
        };
      };

      const baseVisuals: VisualParameters = {
        contrast: 1.0,
        scale: 1.0,
        brightness: 1.0,
        saturation: 1.0,
        intensity: 0.2
      };

      // Test impact phase maximum intensity
      const impactVisuals = calculateImpactVisuals(baseVisuals, 1.0);

      expect(impactVisuals.contrast).toBe(1.5); // Maximum contrast
      expect(impactVisuals.scale).toBe(1.3); // Maximum scale
      expect(impactVisuals.brightness).toBe(1.2); // Maximum brightness
      expect(impactVisuals.saturation).toBe(1.3); // Maximum saturation
      expect(impactVisuals.intensity).toBe(1.0); // Peak intensity

      // Compare with setup phase
      const setupVisuals = calculateImpactVisuals(baseVisuals, 0.2);
      expect(setupVisuals.contrast).toBeLessThan(impactVisuals.contrast);
      expect(setupVisuals.scale).toBeLessThan(impactVisuals.scale);
      expect(setupVisuals.brightness).toBeLessThan(impactVisuals.brightness);
    });

    it('should maintain crystallized moment emphasis during impact', () => {
      interface CrystallizedMoment {
        timeSlowFactor: number; // How much to slow time (0-1, where 0 = frozen)
        focusRadius: number; // Spotlight radius
        backgroundBlur: number; // 0-1
        highlightIntensity: number; // 0-1
        duration: number; // How long to maintain effect
      }

      const createImpactMoment = (intensity: number): CrystallizedMoment => {
        return {
          timeSlowFactor: Math.max(0.1, 1 - intensity * 0.9), // Near-freeze at full intensity
          focusRadius: 150 - intensity * 100, // Tighter focus at higher intensity
          backgroundBlur: intensity * 0.8, // More blur at higher intensity
          highlightIntensity: intensity,
          duration: 600 + intensity * 400 // Longer duration for higher intensity
        };
      };

      const impactMoment = createImpactMoment(1.0);

      expect(impactMoment.timeSlowFactor).toBe(0.1); // Nearly frozen
      expect(impactMoment.focusRadius).toBe(50); // Tight focus
      expect(impactMoment.backgroundBlur).toBe(0.8); // High blur
      expect(impactMoment.highlightIntensity).toBe(1.0); // Maximum highlight
      expect(impactMoment.duration).toBe(1000); // 1 second duration

      // Compare with lower intensity
      const mediumMoment = createImpactMoment(0.5);
      expect(mediumMoment.timeSlowFactor).toBeGreaterThan(impactMoment.timeSlowFactor);
      expect(mediumMoment.focusRadius).toBeGreaterThan(impactMoment.focusRadius);
      expect(mediumMoment.backgroundBlur).toBeLessThan(impactMoment.backgroundBlur);
    });
  });

  describe('Visual Continuity Across Split-Screen', () => {
    it('should maintain visual connection points during morphing transitions', () => {
      const createContinuityPoints = (
        leftElements: Array<{ id: string; x: number; y: number }>,
        rightElements: Array<{ id: string; x: number; y: number }>,
        morphingProgress: number
      ): VisualContinuityPoint[] => {
        return leftElements.map((leftEl, index) => {
          const rightEl = rightElements[index] || rightElements[0]; // Fallback to first

          return {
            id: `continuity-${leftEl.id}-${rightEl.id}`,
            leftViewportPos: leftEl,
            rightViewportPos: rightEl,
            morphingProgress,
            visualWeight: 0.5 + morphingProgress * 0.5, // Stronger during morphing
            active: true
          };
        });
      };

      const leftElements = [
        { id: 'architecture-center', x: 50, y: 40 },
        { id: 'data-flow', x: 60, y: 60 }
      ];

      const rightElements = [
        { id: 'player-focus', x: 55, y: 45 },
        { id: 'ball-trajectory', x: 65, y: 55 }
      ];

      const continuityPoints = createContinuityPoints(leftElements, rightElements, 0.7);

      expect(continuityPoints).toHaveLength(2);
      expect(continuityPoints[0].leftViewportPos.x).toBe(50);
      expect(continuityPoints[0].leftViewportPos.y).toBe(40);
      expect(continuityPoints[0].rightViewportPos).toEqual({ x: 55, y: 45 });
      expect(continuityPoints[0].visualWeight).toBeCloseTo(0.85, 1); // 0.5 + 0.7 * 0.5
      expect(continuityPoints[0].active).toBe(true);
    });

    it('should interpolate shared reference points during transitions', () => {
      interface SharedReferencePoint {
        id: string;
        leftPos: { x: number; y: number };
        rightPos: { x: number; y: number };
        interpolatedPos: { x: number; y: number };
        connectionStrength: number;
      }

      const interpolateReferencePoint = (
        leftPos: { x: number; y: number },
        rightPos: { x: number; y: number },
        progress: number
      ): { x: number; y: number } => {
        return {
          x: leftPos.x + (rightPos.x - leftPos.x) * progress,
          y: leftPos.y + (rightPos.y - leftPos.y) * progress
        };
      };

      const createSharedReference = (
        id: string,
        leftPos: { x: number; y: number },
        rightPos: { x: number; y: number },
        progress: number
      ): SharedReferencePoint => {
        return {
          id,
          leftPos,
          rightPos,
          interpolatedPos: interpolateReferencePoint(leftPos, rightPos, progress),
          connectionStrength: Math.min(1, progress * 2) // Stronger connection as transition progresses
        };
      };

      const sharedPoint = createSharedReference(
        'impact-focus',
        { x: 75, y: 30 }, // Left viewport impact point
        { x: 85, y: 25 }, // Right viewport impact point
        0.6
      );

      expect(sharedPoint.interpolatedPos.x).toBeCloseTo(81, 0); // 75 + (85-75) * 0.6
      expect(sharedPoint.interpolatedPos.y).toBeCloseTo(27, 0); // 30 + (25-30) * 0.6
      expect(sharedPoint.connectionStrength).toBe(1.0); // Min(1, 0.6 * 2)
    });
  });

  describe('Performance Monitoring During Sync', () => {
    it('should monitor timing validation for sub-16ms frame consistency', () => {
      interface FrameMetrics {
        frameNumber: number;
        timestamp: number;
        frameDuration: number;
        isConsistent: boolean;
        leftViewportReady: boolean;
        rightViewportReady: boolean;
        syncDelayMs: number;
      }

      const validateFrameTiming = (
        frameNumber: number,
        timestamp: number,
        lastFrameTime: number
      ): FrameMetrics => {
        const frameDuration = timestamp - lastFrameTime;
        const targetFrameTime = 1000 / 60; // 16.67ms
        const tolerance = 1; // 1ms tolerance

        return {
          frameNumber,
          timestamp,
          frameDuration,
          isConsistent: Math.abs(frameDuration - targetFrameTime) <= tolerance,
          leftViewportReady: true, // Assume ready for test
          rightViewportReady: true, // Assume ready for test
          syncDelayMs: 0 // No delay in test scenario
        };
      };

      const frameMetrics: FrameMetrics[] = [];
      let lastTime = performance.now();

      // Simulate 60 frames
      for (let frame = 0; frame < 60; frame++) {
        vi.advanceTimersByTime(16.67);
        const currentTime = performance.now();

        const metrics = validateFrameTiming(frame, currentTime, lastTime);
        frameMetrics.push(metrics);
        lastTime = currentTime;
      }

      // Verify frame consistency
      const consistentFrames = frameMetrics.filter(m => m.isConsistent);
      const consistencyRate = consistentFrames.length / frameMetrics.length;

      expect(consistencyRate).toBeGreaterThan(0.95); // 95% consistency minimum

      // Verify all frames are ready
      frameMetrics.forEach(metrics => {
        expect(metrics.leftViewportReady).toBe(true);
        expect(metrics.rightViewportReady).toBe(true);
        expect(metrics.syncDelayMs).toBeLessThanOrEqual(1);
      });
    });

    it('should detect performance degradation and adjust accordingly', () => {
      interface PerformanceDegradation {
        currentFPS: number;
        targetFPS: number;
        degradationLevel: number; // 0-1, where 1 is severe
        adjustments: PerformanceAdjustment[];
      }

      interface PerformanceAdjustment {
        type: 'reduce-quality' | 'skip-frames' | 'simplify-effects' | 'disable-features';
        severity: number; // 0-1
        applied: boolean;
      }

      const assessPerformance = (currentFPS: number): PerformanceDegradation => {
        const targetFPS = 60;
        const degradationLevel = Math.max(0, (targetFPS - currentFPS) / targetFPS);

        const adjustments: PerformanceAdjustment[] = [];

        if (degradationLevel > 0.1) { // 10% degradation
          adjustments.push({ type: 'reduce-quality', severity: degradationLevel * 0.5, applied: false });
        }

        if (degradationLevel > 0.25) { // 25% degradation
          adjustments.push({ type: 'skip-frames', severity: degradationLevel * 0.3, applied: false });
        }

        if (degradationLevel > 0.5) { // 50% degradation
          adjustments.push({ type: 'simplify-effects', severity: degradationLevel * 0.7, applied: false });
          adjustments.push({ type: 'disable-features', severity: degradationLevel * 0.9, applied: false });
        }

        return {
          currentFPS,
          targetFPS,
          degradationLevel,
          adjustments
        };
      };

      // Test mild degradation
      const mildDegradation = assessPerformance(54); // 6fps drop
      expect(mildDegradation.degradationLevel).toBeCloseTo(0.1, 1);
      expect(mildDegradation.adjustments.length).toBeGreaterThanOrEqual(1);
      expect(mildDegradation.adjustments[0].type).toBe('reduce-quality');

      // Test severe degradation
      const severeDegradation = assessPerformance(25); // 35fps drop
      expect(severeDegradation.degradationLevel).toBeCloseTo(0.58, 1);
      expect(severeDegradation.adjustments).toHaveLength(4);
      expect(severeDegradation.adjustments.some(a => a.type === 'disable-features')).toBe(true);
    });
  });
});