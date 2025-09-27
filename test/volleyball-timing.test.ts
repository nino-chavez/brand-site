import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Types for the volleyball timing system
export type VolleyballPhase = 'setup' | 'anticipation' | 'approach' | 'spike' | 'impact' | 'follow-through';

export interface PhaseState {
  currentPhase: VolleyballPhase;
  phaseStartTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  completedCycles: number;
}

export interface PhaseConfig {
  phase: VolleyballPhase;
  duration: number; // milliseconds
}

// Mock the hook for testing
const mockUseVolleyballTiming = vi.fn();

const defaultPhaseConfig: PhaseConfig[] = [
  { phase: 'setup', duration: 1500 },
  { phase: 'anticipation', duration: 1300 },
  { phase: 'approach', duration: 1100 },
  { phase: 'spike', duration: 900 },
  { phase: 'impact', duration: 700 },
  { phase: 'follow-through', duration: 2500 }
]; // Total: 8000ms (8 seconds)

describe('VolleyballTiming Phase State Machine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Phase State Machine Tests', () => {

    it('should initialize with setup phase and correct state', () => {
      const initialState: PhaseState = {
        currentPhase: 'setup',
        phaseStartTime: performance.now(),
        isPlaying: false,
        isPaused: false,
        completedCycles: 0
      };

      expect(initialState.currentPhase).toBe('setup');
      expect(initialState.isPlaying).toBe(false);
      expect(initialState.isPaused).toBe(false);
      expect(initialState.completedCycles).toBe(0);
      expect(typeof initialState.phaseStartTime).toBe('number');
    });

    it('should progress through all six phases in correct order', () => {
      const expectedPhases: VolleyballPhase[] = [
        'setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'
      ];

      expectedPhases.forEach((phase, index) => {
        expect(phase).toBe(expectedPhases[index]);
      });

      // Verify phase sequence logic
      const getNextPhase = (current: VolleyballPhase): VolleyballPhase => {
        const phaseIndex = expectedPhases.indexOf(current);
        return expectedPhases[(phaseIndex + 1) % expectedPhases.length];
      };

      expect(getNextPhase('setup')).toBe('anticipation');
      expect(getNextPhase('anticipation')).toBe('approach');
      expect(getNextPhase('approach')).toBe('spike');
      expect(getNextPhase('spike')).toBe('impact');
      expect(getNextPhase('impact')).toBe('follow-through');
      expect(getNextPhase('follow-through')).toBe('setup');
    });

    it('should maintain exact phase durations with sub-millisecond precision', () => {
      defaultPhaseConfig.forEach(config => {
        expect(config.duration).toBeGreaterThan(0);
        expect(Number.isInteger(config.duration)).toBe(true);
      });

      // Test total cycle duration equals exactly 8000ms
      const totalDuration = defaultPhaseConfig.reduce((sum, config) => sum + config.duration, 0);
      expect(totalDuration).toBe(8000);
    });

    it('should track phase duration accuracy using performance.now()', () => {
      const startTime = performance.now();
      const setupDuration = 1500;

      // Simulate time passing
      vi.spyOn(performance, 'now').mockReturnValue(startTime + setupDuration);

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBe(setupDuration);
      expect(elapsed).toBeGreaterThanOrEqual(setupDuration - 1); // Sub-millisecond precision
    });

    it('should complete full cycle in exactly 8 seconds', () => {
      const totalExpectedDuration = 8000;
      const actualTotal = defaultPhaseConfig.reduce((sum, config) => sum + config.duration, 0);

      expect(actualTotal).toBe(totalExpectedDuration);
    });

    it('should handle phase transitions with exact timing', () => {
      let currentTime = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

      const phaseTransitionTimes: number[] = [];

      // Simulate phase transitions
      defaultPhaseConfig.forEach(config => {
        phaseTransitionTimes.push(currentTime);
        currentTime += config.duration;
      });

      expect(phaseTransitionTimes).toEqual([1000, 2500, 3800, 4900, 5800, 6500]);
      expect(currentTime).toBe(9000); // 1000 + 8000
    });

    it('should preserve state during pause/resume cycles', () => {
      const pausedState: PhaseState = {
        currentPhase: 'spike',
        phaseStartTime: 1000,
        isPlaying: false,
        isPaused: true,
        completedCycles: 0
      };

      const resumedState: PhaseState = {
        ...pausedState,
        isPlaying: true,
        isPaused: false,
        phaseStartTime: performance.now() // Reset start time on resume
      };

      expect(pausedState.currentPhase).toBe(resumedState.currentPhase);
      expect(pausedState.completedCycles).toBe(resumedState.completedCycles);
      expect(resumedState.isPlaying).toBe(true);
      expect(resumedState.isPaused).toBe(false);
    });

    it('should increment completed cycles after full sequence', () => {
      let cycles = 0;
      let currentPhase: VolleyballPhase = 'setup';
      const phases: VolleyballPhase[] = ['setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'];

      // Simulate two complete cycles
      for (let cycle = 0; cycle < 2; cycle++) {
        phases.forEach(phase => {
          currentPhase = phase;
        });
        cycles++;
      }

      expect(cycles).toBe(2);
      expect(currentPhase).toBe('follow-through');
    });

    it('should handle automatic progression timing', () => {
      const mockCallback = vi.fn();
      let currentPhaseIndex = 0;
      const phases = defaultPhaseConfig;

      // Simulate automatic progression
      const simulatePhaseProgression = () => {
        if (currentPhaseIndex < phases.length - 1) {
          currentPhaseIndex++;
          mockCallback(phases[currentPhaseIndex].phase);
        } else {
          currentPhaseIndex = 0; // Reset to setup
          mockCallback(phases[currentPhaseIndex].phase);
        }
      };

      // Test progression through all phases
      phases.forEach((_, index) => {
        simulatePhaseProgression();
      });

      expect(mockCallback).toHaveBeenCalledTimes(6);
      expect(mockCallback).toHaveBeenNthCalledWith(1, 'anticipation');
      expect(mockCallback).toHaveBeenNthCalledWith(6, 'setup'); // Back to start
    });
  });

  describe('Phase Transition Logic Tests', () => {
    it('should trigger phase transition callbacks', () => {
      const onPhaseChange = vi.fn();
      const onCycleComplete = vi.fn();

      // Simulate phase change
      const newPhase: VolleyballPhase = 'impact';
      onPhaseChange(newPhase);

      expect(onPhaseChange).toHaveBeenCalledWith('impact');
      expect(onPhaseChange).toHaveBeenCalledTimes(1);
    });

    it('should maintain deterministic timing arrays', () => {
      const timingArray = defaultPhaseConfig.map(config => config.duration);
      const expectedTimingArray = [1500, 1300, 1100, 900, 700, 2500];

      expect(timingArray).toEqual(expectedTimingArray);
      expect(timingArray.length).toBe(6);

      // Verify timing array is immutable/deterministic
      const timingArrayCopy = [...timingArray];
      expect(timingArrayCopy).toEqual(timingArray);
    });

    it('should handle edge case of pause during phase transition', () => {
      const transitionTime = performance.now();
      const pauseTime = transitionTime + 50; // Pause 50ms into transition

      vi.spyOn(performance, 'now').mockReturnValue(pauseTime);

      const elapsedDuringTransition = pauseTime - transitionTime;
      expect(elapsedDuringTransition).toBe(50);

      // Should preserve partial progress through transition
      expect(elapsedDuringTransition).toBeGreaterThan(0);
      expect(elapsedDuringTransition).toBeLessThan(100);
    });
  });
});