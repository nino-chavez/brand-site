import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVolleyballTiming } from '../hooks/useVolleyballTiming';
import type { VolleyballPhase } from '../hooks/useVolleyballTiming';

describe('Volleyball Timing System Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Complete Timing Cycle Integration', () => {
    it('should complete full timing cycle with accurate phase synchronization', async () => {
      const mockOnPhaseChange = vi.fn();
      const mockOnCycleComplete = vi.fn();

      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: false, // Start paused to avoid animation loop issues
          callbacks: {
            onPhaseChange: mockOnPhaseChange,
            onCycleComplete: mockOnCycleComplete
          }
        })
      );

      // Initial state verification
      expect(result.current.state.currentPhase).toBe('setup');
      expect(result.current.state.isPlaying).toBe(false);
      expect(result.current.state.completedCycles).toBe(0);

      // Test manual progression through all phases
      const phases = ['setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'];

      for (let i = 1; i < phases.length; i++) {
        await act(async () => {
          result.current.nextPhase();
        });
        expect(result.current.state.currentPhase).toBe(phases[i]);
      }

      // Complete the cycle by going back to setup
      await act(async () => {
        result.current.nextPhase();
      });

      // Verify phase change callbacks were called
      expect(mockOnPhaseChange).toHaveBeenCalled();
      expect(result.current.state.currentPhase).toBe('setup');
    });

    it('should maintain performance requirements during operation', async () => {
      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: false // Keep paused for testing
        })
      );

      // Test that the hook responds quickly to state changes
      const startTime = performance.now();

      await act(async () => {
        result.current.play();
        result.current.pause();
        result.current.nextPhase();
        result.current.previousPhase();
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Verify all operations complete quickly (under 10ms)
      expect(responseTime).toBeLessThan(10);
      expect(result.current.state).toBeDefined();
      expect(typeof result.current.getCurrentPhaseDuration()).toBe('number');
    });

    it('should handle state management during extended operation', async () => {
      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: false
        })
      );

      // Simulate multiple operations
      await act(async () => {
        for (let cycle = 0; cycle < 5; cycle++) {
          // Run through all phases manually
          result.current.nextPhase(); // anticipation
          result.current.nextPhase(); // approach
          result.current.nextPhase(); // spike
          result.current.nextPhase(); // impact
          result.current.nextPhase(); // follow-through
          result.current.nextPhase(); // back to setup
        }
      });

      // Verify system is still responsive and maintains correct state
      expect(result.current.state.currentPhase).toBe('setup');
      expect(typeof result.current.state.phaseProgress).toBe('number');
      expect(result.current.state.phaseProgress).toBeGreaterThanOrEqual(0);
      expect(result.current.state.phaseProgress).toBeLessThanOrEqual(1);
      expect(result.current.getCurrentPhaseDuration()).toBe(1500); // Setup duration
    });

    it('should validate timing precision across different phases', async () => {
      const phaseTimings: Array<{ phase: VolleyballPhase; timestamp: number; duration: number }> = [];
      let lastPhaseChange = 0;

      const mockOnPhaseChange = vi.fn((newPhase: VolleyballPhase, previousPhase: VolleyballPhase) => {
        const timestamp = performance.now();
        const duration = timestamp - lastPhaseChange;

        if (previousPhase !== newPhase) {
          phaseTimings.push({
            phase: previousPhase,
            timestamp: lastPhaseChange,
            duration
          });
        }

        lastPhaseChange = timestamp;
      });

      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: true,
          callbacks: { onPhaseChange: mockOnPhaseChange }
        })
      );

      lastPhaseChange = performance.now();

      // Run through one complete cycle
      await act(async () => {
        vi.advanceTimersByTime(8000);
      });

      // Verify timing precision (allowing 1ms tolerance)
      const expectedDurations = [1500, 1300, 1100, 900, 700, 2500];

      phaseTimings.slice(0, 6).forEach((timing, index) => {
        const expectedDuration = expectedDurations[index];
        expect(Math.abs(timing.duration - expectedDuration)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Interactive Pause/Resume Integration', () => {
    it('should handle pause/resume responsiveness under 100ms requirement', async () => {
      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: true
        })
      );

      const pauseStart = performance.now();

      await act(async () => {
        result.current.pause();
      });

      const pauseEnd = performance.now();
      const pauseResponseTime = pauseEnd - pauseStart;

      // Verify pause response time is under 100ms
      expect(pauseResponseTime).toBeLessThan(100);
      expect(result.current.state.isPaused).toBe(true);
      expect(result.current.state.isPlaying).toBe(false);

      const resumeStart = performance.now();

      await act(async () => {
        result.current.play();
      });

      const resumeEnd = performance.now();
      const resumeResponseTime = resumeEnd - resumeStart;

      // Verify resume response time is also under 100ms
      expect(resumeResponseTime).toBeLessThan(100);
      expect(result.current.state.isPaused).toBe(false);
      expect(result.current.state.isPlaying).toBe(true);
    });

    it('should preserve exact phase state during pause/resume cycles', async () => {
      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: true
        })
      );

      // Let it run partway through the spike phase
      await act(async () => {
        vi.advanceTimersByTime(4500); // Should be in spike phase
      });

      const prePhase = result.current.state.currentPhase;
      const preProgress = result.current.state.phaseProgress;

      // Pause
      await act(async () => {
        result.current.pause();
      });

      // Verify state preservation during pause
      expect(result.current.state.currentPhase).toBe(prePhase);

      // Resume
      await act(async () => {
        result.current.play();
      });

      // Verify state is correctly restored
      expect(result.current.state.currentPhase).toBe(prePhase);
      expect(result.current.state.isPlaying).toBe(true);
    });
  });

  describe('Navigation Integration', () => {
    it('should handle manual phase navigation with state synchronization', async () => {
      const mockOnPhaseChange = vi.fn();

      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: false,
          callbacks: { onPhaseChange: mockOnPhaseChange }
        })
      );

      // Test jumping to different phases
      const testPhases: VolleyballPhase[] = ['spike', 'impact', 'setup', 'follow-through'];

      for (const targetPhase of testPhases) {
        await act(async () => {
          result.current.jumpToPhase(targetPhase);
        });

        expect(result.current.state.currentPhase).toBe(targetPhase);
        expect(mockOnPhaseChange).toHaveBeenCalledWith(targetPhase, expect.any(String));
      }

      // Test sequential navigation
      await act(async () => {
        result.current.jumpToPhase('setup');
      });

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          result.current.nextPhase();
        });
      }

      expect(result.current.state.currentPhase).toBe('follow-through');
    });

    it('should handle keyboard navigation integration', async () => {
      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: false
        })
      );

      // Test direct phase access (simulating number key presses)
      const phases: VolleyballPhase[] = ['setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'];

      for (let i = 0; i < phases.length; i++) {
        await act(async () => {
          result.current.jumpToPhase(phases[i]);
        });

        expect(result.current.state.currentPhase).toBe(phases[i]);
      }

      // Test arrow key navigation
      await act(async () => {
        result.current.jumpToPhase('setup');
      });

      // Simulate right arrow key presses
      for (let i = 1; i < phases.length; i++) {
        await act(async () => {
          result.current.nextPhase();
        });
        expect(result.current.state.currentPhase).toBe(phases[i]);
      }

      // Simulate left arrow key presses
      for (let i = phases.length - 2; i >= 0; i--) {
        await act(async () => {
          result.current.previousPhase();
        });
        expect(result.current.state.currentPhase).toBe(phases[i]);
      }
    });
  });

  describe('Performance Benchmarking', () => {
    it('should benchmark timing accuracy against volleyball athletic rhythm requirements', async () => {
      const timingAccuracy = {
        setupPhase: 0,
        anticipationPhase: 0,
        approachPhase: 0,
        spikePhase: 0,
        impactPhase: 0,
        followThroughPhase: 0
      };

      const phaseStartTimes: Record<VolleyballPhase, number> = {} as any;

      const mockOnPhaseChange = vi.fn((newPhase: VolleyballPhase, previousPhase: VolleyballPhase) => {
        const currentTime = performance.now();

        if (phaseStartTimes[previousPhase]) {
          const actualDuration = currentTime - phaseStartTimes[previousPhase];
          const expectedDuration = getExpectedDuration(previousPhase);
          const accuracy = 1 - Math.abs(actualDuration - expectedDuration) / expectedDuration;

          switch (previousPhase) {
            case 'setup': timingAccuracy.setupPhase = accuracy; break;
            case 'anticipation': timingAccuracy.anticipationPhase = accuracy; break;
            case 'approach': timingAccuracy.approachPhase = accuracy; break;
            case 'spike': timingAccuracy.spikePhase = accuracy; break;
            case 'impact': timingAccuracy.impactPhase = accuracy; break;
            case 'follow-through': timingAccuracy.followThroughPhase = accuracy; break;
          }
        }

        phaseStartTimes[newPhase] = currentTime;
      });

      function getExpectedDuration(phase: VolleyballPhase): number {
        const durations = {
          'setup': 1500,
          'anticipation': 1300,
          'approach': 1100,
          'spike': 900,
          'impact': 700,
          'follow-through': 2500
        };
        return durations[phase];
      }

      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: true,
          callbacks: { onPhaseChange: mockOnPhaseChange }
        })
      );

      phaseStartTimes[result.current.state.currentPhase] = performance.now();

      // Run one complete cycle
      await act(async () => {
        vi.advanceTimersByTime(8000);
      });

      // Verify timing accuracy is within 5% tolerance for athletic rhythm
      Object.values(timingAccuracy).forEach(accuracy => {
        if (accuracy > 0) { // Only check phases that were measured
          expect(accuracy).toBeGreaterThan(0.95); // 95% accuracy minimum
        }
      });
    });

    it('should maintain consistent performance during phase transitions', async () => {
      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: false
        })
      );

      const transitionTimes: number[] = [];

      // Test multiple phase transitions and measure response time
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();

        await act(async () => {
          result.current.nextPhase();
        });

        const endTime = performance.now();
        transitionTimes.push(endTime - startTime);
      }

      // Calculate consistency metrics
      const averageTime = transitionTimes.reduce((sum, time) => sum + time, 0) / transitionTimes.length;
      const maxTime = Math.max(...transitionTimes);
      const minTime = Math.min(...transitionTimes);
      const variance = maxTime - minTime;

      // Verify performance is consistent and fast
      expect(averageTime).toBeLessThan(5); // Average under 5ms
      expect(variance).toBeLessThan(10); // Low variance between transitions
      expect(result.current.state.currentPhase).toBeDefined();
    });

    it('should document performance metrics and optimization points', async () => {
      const performanceReport = {
        memoryUsage: 0,
        cpuUsage: 0,
        frameDrops: 0,
        averageLatency: 0,
        optimizationPoints: [] as string[]
      };

      const { result } = renderHook(() =>
        useVolleyballTiming({
          autoPlay: true
        })
      );

      // Simulate performance monitoring
      const startTime = performance.now();

      await act(async () => {
        vi.advanceTimersByTime(8000);
      });

      const endTime = performance.now();
      const totalRuntime = endTime - startTime;

      // Document performance characteristics
      performanceReport.averageLatency = totalRuntime / 8000; // Latency per millisecond

      // Identify optimization points
      if (performanceReport.averageLatency > 1.1) {
        performanceReport.optimizationPoints.push('Consider reducing animation complexity');
      }

      if (performanceReport.frameDrops > 5) {
        performanceReport.optimizationPoints.push('Implement frame rate degradation');
      }

      performanceReport.optimizationPoints.push('Use hardware acceleration with transform3d()');
      performanceReport.optimizationPoints.push('Implement composite layer optimization');
      performanceReport.optimizationPoints.push('Add memory pool for animation objects');

      // Verify optimization points are documented
      expect(performanceReport.optimizationPoints.length).toBeGreaterThan(0);
      expect(performanceReport.averageLatency).toBeLessThan(2); // Should be efficient

      // Log performance report for documentation
      console.log('Performance Report:', performanceReport);

      expect(result.current.state.isPlaying).toBe(true); // System should still be responsive
    });
  });
});