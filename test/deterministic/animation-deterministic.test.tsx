/**
 * Deterministic Animation Testing Framework
 *
 * Comprehensive deterministic testing for animation sequences including:
 * - Time-independent animation testing with controlled timing
 * - Deterministic frame progression and state validation
 * - Animation sequence verification without flaky timing dependencies
 * - Predictable animation behavior testing across environments
 * - Animation state machine validation with deterministic transitions
 *
 * @fileoverview Deterministic animation testing framework
 * @version 1.0.0
 * @since Task 7.4 - Deterministic Testing for Animation Sequences
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTestUtils } from '../utils';
import { act, waitFor } from '@testing-library/react';
import React, { useState, useCallback, useRef } from 'react';

// Import animation components
import { AnimationController } from '../../components/AnimationController';
import type { CanvasPosition } from '../../types/canvas';
import type { AnimationConfig, MovementType } from '../../components/AnimationController';

/**
 * Deterministic time control for animation testing
 */
class DeterministicTimeController {
  private currentTime: number = 0;
  private timeStep: number = 16.67; // Default to 60fps (16.67ms per frame)
  private animationFrameCallbacks: Array<{ id: number; callback: FrameRequestCallback }> = [];
  private nextAnimationFrameId: number = 1;
  private timeoutCallbacks: Array<{ id: number; callback: Function; executeAt: number }> = [];
  private nextTimeoutId: number = 1;

  public setFrameRate(fps: number): void {
    this.timeStep = 1000 / fps;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public advanceTime(milliseconds: number): void {
    this.currentTime += milliseconds;
    this.processTimeoutCallbacks();
  }

  public advanceFrame(): void {
    this.advanceTime(this.timeStep);
    this.processAnimationFrameCallbacks();
  }

  public advanceFrames(frameCount: number): void {
    for (let i = 0; i < frameCount; i++) {
      this.advanceFrame();
    }
  }

  public mockPerformanceNow(): void {
    vi.spyOn(performance, 'now').mockImplementation(() => this.currentTime);
  }

  public mockRequestAnimationFrame(): void {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      const id = this.nextAnimationFrameId++;
      this.animationFrameCallbacks.push({ id, callback });
      return id;
    });

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id: number) => {
      const index = this.animationFrameCallbacks.findIndex(cb => cb.id === id);
      if (index !== -1) {
        this.animationFrameCallbacks.splice(index, 1);
      }
    });
  }

  public mockSetTimeout(): void {
    vi.spyOn(global, 'setTimeout').mockImplementation((callback: Function, delay: number = 0) => {
      const id = this.nextTimeoutId++;
      this.timeoutCallbacks.push({
        id,
        callback,
        executeAt: this.currentTime + delay,
      });
      return id as any;
    });

    vi.spyOn(global, 'clearTimeout').mockImplementation((id: number) => {
      const index = this.timeoutCallbacks.findIndex(cb => cb.id === id);
      if (index !== -1) {
        this.timeoutCallbacks.splice(index, 1);
      }
    });
  }

  public reset(): void {
    this.currentTime = 0;
    this.animationFrameCallbacks = [];
    this.timeoutCallbacks = [];
    this.nextAnimationFrameId = 1;
    this.nextTimeoutId = 1;
  }

  private processAnimationFrameCallbacks(): void {
    const callbacks = [...this.animationFrameCallbacks];
    this.animationFrameCallbacks = [];

    callbacks.forEach(({ callback }) => {
      callback(this.currentTime);
    });
  }

  private processTimeoutCallbacks(): void {
    const readyCallbacks = this.timeoutCallbacks.filter(cb => cb.executeAt <= this.currentTime);
    this.timeoutCallbacks = this.timeoutCallbacks.filter(cb => cb.executeAt > this.currentTime);

    readyCallbacks.forEach(({ callback }) => {
      callback();
    });
  }
}

/**
 * Animation state tracker for deterministic validation
 */
class AnimationStateTracker {
  private stateHistory: Array<{
    timestamp: number;
    position: CanvasPosition;
    isAnimating: boolean;
    velocity?: { x: number; y: number; scale: number };
    metadata?: any;
  }> = [];

  public recordState(
    timestamp: number,
    position: CanvasPosition,
    isAnimating: boolean,
    metadata?: any
  ): void {
    this.stateHistory.push({
      timestamp,
      position: { ...position },
      isAnimating,
      metadata,
    });
  }

  public getStateHistory(): typeof this.stateHistory {
    return [...this.stateHistory];
  }

  public getStateAt(timestamp: number): typeof this.stateHistory[0] | null {
    return this.stateHistory.find(state => state.timestamp === timestamp) || null;
  }

  public getStatesBetween(startTime: number, endTime: number): typeof this.stateHistory {
    return this.stateHistory.filter(
      state => state.timestamp >= startTime && state.timestamp <= endTime
    );
  }

  public validateSmoothing(): {
    isSmooth: boolean;
    discontinuities: Array<{ timestamp: number; jump: number }>;
    averageVelocity: number;
  } {
    const discontinuities: Array<{ timestamp: number; jump: number }> = [];
    let totalVelocity = 0;
    let velocityCount = 0;

    for (let i = 1; i < this.stateHistory.length; i++) {
      const prev = this.stateHistory[i - 1];
      const current = this.stateHistory[i];

      const deltaTime = current.timestamp - prev.timestamp;
      if (deltaTime === 0) continue;

      // Calculate distance moved
      const deltaX = current.position.x - prev.position.x;
      const deltaY = current.position.y - prev.position.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Calculate velocity
      const velocity = distance / deltaTime;
      totalVelocity += velocity;
      velocityCount++;

      // Check for discontinuities (sudden large movements)
      if (velocity > 10) { // Threshold for sudden movement
        discontinuities.push({
          timestamp: current.timestamp,
          jump: velocity,
        });
      }
    }

    return {
      isSmooth: discontinuities.length === 0,
      discontinuities,
      averageVelocity: velocityCount > 0 ? totalVelocity / velocityCount : 0,
    };
  }

  public validateAnimationCompletion(
    startPosition: CanvasPosition,
    targetPosition: CanvasPosition,
    tolerance: number = 1
  ): {
    completed: boolean;
    finalPosition: CanvasPosition;
    accuracy: number;
  } {
    if (this.stateHistory.length === 0) {
      return {
        completed: false,
        finalPosition: startPosition,
        accuracy: 0,
      };
    }

    const finalState = this.stateHistory[this.stateHistory.length - 1];
    const finalPosition = finalState.position;

    const deltaX = Math.abs(finalPosition.x - targetPosition.x);
    const deltaY = Math.abs(finalPosition.y - targetPosition.y);
    const deltaScale = Math.abs(finalPosition.scale - targetPosition.scale);

    const maxDelta = Math.max(deltaX, deltaY, deltaScale * 100); // Scale deltas by 100 for comparison
    const completed = maxDelta <= tolerance;

    // Calculate accuracy as percentage
    const totalTargetDistance = Math.sqrt(
      Math.pow(targetPosition.x - startPosition.x, 2) +
      Math.pow(targetPosition.y - startPosition.y, 2) +
      Math.pow((targetPosition.scale - startPosition.scale) * 100, 2)
    );

    const accuracy = totalTargetDistance > 0 ? Math.max(0, 100 - (maxDelta / totalTargetDistance) * 100) : 100;

    return {
      completed,
      finalPosition,
      accuracy,
    };
  }

  public clear(): void {
    this.stateHistory = [];
  }
}

/**
 * Deterministic animation test harness
 */
const DeterministicAnimationHarness: React.FC<{
  timeController: DeterministicTimeController;
  stateTracker: AnimationStateTracker;
  config: AnimationConfig;
  startPosition: CanvasPosition;
  targetPosition: CanvasPosition;
  onAnimationStateChange?: (isAnimating: boolean) => void;
}> = ({
  timeController,
  stateTracker,
  config,
  startPosition,
  targetPosition,
  onAnimationStateChange,
}) => {
  const [currentPosition, setCurrentPosition] = useState<CanvasPosition>(startPosition);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationStarted = useRef(false);

  const handlePositionUpdate = useCallback((position: CanvasPosition) => {
    setCurrentPosition(position);
    stateTracker.recordState(timeController.getCurrentTime(), position, isAnimating);
  }, [timeController, stateTracker, isAnimating]);

  const handleAnimationComplete = useCallback((finalPosition: CanvasPosition) => {
    setIsAnimating(false);
    setCurrentPosition(finalPosition);
    stateTracker.recordState(timeController.getCurrentTime(), finalPosition, false, { completed: true });
    onAnimationStateChange?.(false);
  }, [timeController, stateTracker, onAnimationStateChange]);

  const handleAnimationStateChange = useCallback((animating: boolean) => {
    setIsAnimating(animating);
    onAnimationStateChange?.(animating);
  }, [onAnimationStateChange]);

  // Start animation automatically
  React.useEffect(() => {
    if (!animationStarted.current) {
      animationStarted.current = true;
      setIsAnimating(true);
      stateTracker.recordState(timeController.getCurrentTime(), startPosition, true, { started: true });
    }
  }, []);

  return (
    <div data-testid="deterministic-animation-harness">
      <AnimationController
        isActive={isAnimating}
        config={config}
        currentPosition={currentPosition}
        targetPosition={targetPosition}
        onPositionUpdate={handlePositionUpdate}
        onAnimationComplete={handleAnimationComplete}
        debugMode={false}
      />
      <div data-testid="animation-state" style={{ display: 'none' }}>
        {JSON.stringify({
          currentPosition,
          isAnimating,
          timestamp: timeController.getCurrentTime(),
        })}
      </div>
    </div>
  );
};

describe('Deterministic Animation Testing', () => {
  let timeController: DeterministicTimeController;
  let stateTracker: AnimationStateTracker;

  beforeEach(() => {
    timeController = new DeterministicTimeController();
    stateTracker = new AnimationStateTracker();

    // Set up deterministic time control
    timeController.mockPerformanceNow();
    timeController.mockRequestAnimationFrame();
    timeController.mockSetTimeout();
    timeController.setFrameRate(60); // 60 FPS for consistent testing
  });

  afterEach(() => {
    vi.restoreAllMocks();
    timeController.reset();
    stateTracker.clear();
  });

  describe('Linear Animation Sequences', () => {
    it('should perform deterministic linear movement', async () => {
      const startPosition: CanvasPosition = { x: 0, y: 0, scale: 1.0 };
      const targetPosition: CanvasPosition = { x: 100, y: 50, scale: 1.0 };

      const config: AnimationConfig = {
        enableSmoothing: false, // Linear movement for predictability
        smoothingFactor: 0.5,
        maxVelocity: 1000,
        friction: 0.85,
        enableDebugging: false,
        performanceMode: 'quality',
      };

      renderWithTestUtils(
        React.createElement(DeterministicAnimationHarness, {
          timeController,
          stateTracker,
          config,
          startPosition,
          targetPosition,
        })
      );

      // Advance animation frame by frame
      const totalFrames = 60; // 1 second at 60fps
      for (let frame = 0; frame < totalFrames; frame++) {
        await act(async () => {
          timeController.advanceFrame();
        });
      }

      const stateHistory = stateTracker.getStateHistory();
      expect(stateHistory.length).toBeGreaterThan(10); // Should have recorded multiple states

      // Validate animation completion
      const completion = stateTracker.validateAnimationCompletion(startPosition, targetPosition, 5);
      expect(completion.completed).toBe(true);
      expect(completion.accuracy).toBeGreaterThan(90); // Should be very accurate

      // Validate movement is in correct direction
      const firstState = stateHistory[1]; // Skip initial state
      const lastState = stateHistory[stateHistory.length - 1];

      expect(lastState.position.x).toBeGreaterThan(firstState.position.x); // Moving right
      expect(lastState.position.y).toBeGreaterThan(firstState.position.y); // Moving down
    });

    it('should maintain consistent timing across test runs', async () => {
      const startPosition: CanvasPosition = { x: 0, y: 0, scale: 1.0 };
      const targetPosition: CanvasPosition = { x: 200, y: 100, scale: 1.5 };

      const config: AnimationConfig = {
        enableSmoothing: true,
        smoothingFactor: 0.8,
        maxVelocity: 500,
        friction: 0.9,
        enableDebugging: false,
        performanceMode: 'balanced',
      };

      // Run animation multiple times and verify consistency
      const runs: Array<typeof stateTracker.stateHistory> = [];

      for (let run = 0; run < 3; run++) {
        timeController.reset();
        stateTracker.clear();

        renderWithTestUtils(
          React.createElement(DeterministicAnimationHarness, {
            timeController,
            stateTracker,
            config,
            startPosition,
            targetPosition,
          })
        );

        // Advance same number of frames
        for (let frame = 0; frame < 90; frame++) {
          await act(async () => {
            timeController.advanceFrame();
          });
        }

        runs.push(stateTracker.getStateHistory());
      }

      // Compare runs for consistency
      expect(runs[0].length).toBeGreaterThan(0);
      expect(runs[1].length).toBe(runs[0].length); // Same number of states
      expect(runs[2].length).toBe(runs[0].length);

      // Check that final positions are identical (deterministic)
      const finalPositions = runs.map(run => run[run.length - 1].position);

      for (let i = 1; i < finalPositions.length; i++) {
        expect(finalPositions[i].x).toBeCloseTo(finalPositions[0].x, 1);
        expect(finalPositions[i].y).toBeCloseTo(finalPositions[0].y, 1);
        expect(finalPositions[i].scale).toBeCloseTo(finalPositions[0].scale, 2);
      }
    });
  });

  describe('Smooth Animation Sequences', () => {
    it('should produce smooth movement without discontinuities', async () => {
      const startPosition: CanvasPosition = { x: 50, y: 50, scale: 1.0 };
      const targetPosition: CanvasPosition = { x: 150, y: 150, scale: 2.0 };

      const config: AnimationConfig = {
        enableSmoothing: true,
        smoothingFactor: 0.9, // High smoothing
        maxVelocity: 300,
        friction: 0.95,
        enableDebugging: false,
        performanceMode: 'quality',
      };

      renderWithTestUtils(
        React.createElement(DeterministicAnimationHarness, {
          timeController,
          stateTracker,
          config,
          startPosition,
          targetPosition,
        })
      );

      // Run animation for sufficient time
      for (let frame = 0; frame < 120; frame++) { // 2 seconds
        await act(async () => {
          timeController.advanceFrame();
        });
      }

      // Validate smoothness
      const smoothnessAnalysis = stateTracker.validateSmoothing();
      expect(smoothnessAnalysis.isSmooth).toBe(true);
      expect(smoothnessAnalysis.discontinuities.length).toBe(0);
      expect(smoothnessAnalysis.averageVelocity).toBeGreaterThan(0);
      expect(smoothnessAnalysis.averageVelocity).toBeLessThan(10); // Should be reasonable
    });

    it('should respect velocity limits deterministically', async () => {
      const startPosition: CanvasPosition = { x: 0, y: 0, scale: 1.0 };
      const targetPosition: CanvasPosition = { x: 1000, y: 500, scale: 3.0 }; // Large distance

      const config: AnimationConfig = {
        enableSmoothing: true,
        smoothingFactor: 0.7,
        maxVelocity: 100, // Low velocity limit
        friction: 0.8,
        enableDebugging: false,
        performanceMode: 'quality',
      };

      renderWithTestUtils(
        React.createElement(DeterministicAnimationHarness, {
          timeController,
          stateTracker,
          config,
          startPosition,
          targetPosition,
        })
      );

      // Run animation
      for (let frame = 0; frame < 180; frame++) { // 3 seconds
        await act(async () => {
          timeController.advanceFrame();
        });
      }

      const stateHistory = stateTracker.getStateHistory();

      // Verify velocity never exceeds limit
      for (let i = 1; i < stateHistory.length; i++) {
        const prev = stateHistory[i - 1];
        const current = stateHistory[i];

        const deltaTime = current.timestamp - prev.timestamp;
        if (deltaTime === 0) continue;

        const deltaX = current.position.x - prev.position.x;
        const deltaY = current.position.y - prev.position.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / deltaTime;

        // Allow some tolerance for smoothing algorithms
        expect(velocity).toBeLessThan(config.maxVelocity * 1.2);
      }
    });
  });

  describe('Animation State Machine Validation', () => {
    it('should follow correct state transitions', async () => {
      const startPosition: CanvasPosition = { x: 0, y: 0, scale: 1.0 };
      const targetPosition: CanvasPosition = { x: 100, y: 100, scale: 1.0 };

      const config: AnimationConfig = {
        enableSmoothing: true,
        smoothingFactor: 0.8,
        maxVelocity: 500,
        friction: 0.9,
        enableDebugging: false,
        performanceMode: 'balanced',
      };

      const stateTransitions: Array<{ timestamp: number; isAnimating: boolean }> = [];

      renderWithTestUtils(
        React.createElement(DeterministicAnimationHarness, {
          timeController,
          stateTracker,
          config,
          startPosition,
          targetPosition,
          onAnimationStateChange: (isAnimating) => {
            stateTransitions.push({
              timestamp: timeController.getCurrentTime(),
              isAnimating,
            });
          },
        })
      );

      // Run animation until completion
      let completed = false;
      let maxFrames = 300; // Prevent infinite loop

      while (!completed && maxFrames > 0) {
        await act(async () => {
          timeController.advanceFrame();
        });

        const stateHistory = stateTracker.getStateHistory();
        const lastState = stateHistory[stateHistory.length - 1];

        if (lastState?.metadata?.completed) {
          completed = true;
        }

        maxFrames--;
      }

      expect(completed).toBe(true);

      // Validate state transitions
      expect(stateTransitions.length).toBeGreaterThanOrEqual(2); // Start and end
      expect(stateTransitions[0].isAnimating).toBe(true); // Should start animating
      expect(stateTransitions[stateTransitions.length - 1].isAnimating).toBe(false); // Should end not animating

      // Validate no invalid transitions (false -> false or true -> true without intermediate)
      for (let i = 1; i < stateTransitions.length; i++) {
        const prev = stateTransitions[i - 1];
        const current = stateTransitions[i];
        expect(prev.isAnimating).not.toBe(current.isAnimating); // Each transition should change state
      }
    });

    it('should handle animation interruption deterministically', async () => {
      const startPosition: CanvasPosition = { x: 0, y: 0, scale: 1.0 };
      const targetPosition: CanvasPosition = { x: 200, y: 200, scale: 2.0 };

      const config: AnimationConfig = {
        enableSmoothing: true,
        smoothingFactor: 0.8,
        maxVelocity: 300,
        friction: 0.9,
        enableDebugging: false,
        performanceMode: 'balanced',
      };

      const TestComponent = () => {
        const [target, setTarget] = useState(targetPosition);
        const [animationKey, setAnimationKey] = useState(0);

        return (
          <div>
            <DeterministicAnimationHarness
              key={animationKey}
              timeController={timeController}
              stateTracker={stateTracker}
              config={config}
              startPosition={startPosition}
              targetPosition={target}
            />
            <button
              data-testid="change-target"
              onClick={() => {
                setTarget({ x: 50, y: 50, scale: 0.5 });
                setAnimationKey(prev => prev + 1);
              }}
            >
              Change Target
            </button>
          </div>
        );
      };

      const { getByTestId } = renderWithTestUtils(React.createElement(TestComponent));

      // Let animation run for a bit
      for (let frame = 0; frame < 30; frame++) {
        await act(async () => {
          timeController.advanceFrame();
        });
      }

      const positionBeforeInterrupt = stateTracker.getStateHistory()[stateTracker.getStateHistory().length - 1].position;

      // Interrupt animation by changing target
      await act(async () => {
        getByTestId('change-target').click();
      });

      // Clear tracker to monitor new animation
      stateTracker.clear();

      // Continue animation with new target
      for (let frame = 0; frame < 60; frame++) {
        await act(async () => {
          timeController.advanceFrame();
        });
      }

      const newStateHistory = stateTracker.getStateHistory();
      expect(newStateHistory.length).toBeGreaterThan(0);

      // Animation should have started from interrupted position
      const firstNewState = newStateHistory[0];
      expect(firstNewState.position.x).toBeCloseTo(positionBeforeInterrupt.x, 1);
      expect(firstNewState.position.y).toBeCloseTo(positionBeforeInterrupt.y, 1);
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('should handle zero-distance animations gracefully', async () => {
      const position: CanvasPosition = { x: 100, y: 100, scale: 1.0 };

      const config: AnimationConfig = {
        enableSmoothing: true,
        smoothingFactor: 0.8,
        maxVelocity: 500,
        friction: 0.9,
        enableDebugging: false,
        performanceMode: 'balanced',
      };

      renderWithTestUtils(
        React.createElement(DeterministicAnimationHarness, {
          timeController,
          stateTracker,
          config,
          startPosition: position,
          targetPosition: position, // Same position
        })
      );

      // Run for several frames
      for (let frame = 0; frame < 30; frame++) {
        await act(async () => {
          timeController.advanceFrame();
        });
      }

      const stateHistory = stateTracker.getStateHistory();
      expect(stateHistory.length).toBeGreaterThan(0);

      // Position should remain stable
      const finalState = stateHistory[stateHistory.length - 1];
      expect(finalState.position.x).toBeCloseTo(position.x, 1);
      expect(finalState.position.y).toBeCloseTo(position.y, 1);
      expect(finalState.position.scale).toBeCloseTo(position.scale, 2);
    });

    it('should handle extreme animation parameters deterministically', async () => {
      const startPosition: CanvasPosition = { x: 0, y: 0, scale: 0.1 };
      const targetPosition: CanvasPosition = { x: 10000, y: 5000, scale: 10.0 };

      const config: AnimationConfig = {
        enableSmoothing: true,
        smoothingFactor: 0.99, // Extreme smoothing
        maxVelocity: 10000, // Very high velocity
        friction: 0.99, // Very low friction
        enableDebugging: false,
        performanceMode: 'performance',
      };

      renderWithTestUtils(
        React.createElement(DeterministicAnimationHarness, {
          timeController,
          stateTracker,
          config,
          startPosition,
          targetPosition,
        })
      );

      // Run animation
      for (let frame = 0; frame < 300; frame++) { // 5 seconds
        await act(async () => {
          timeController.advanceFrame();
        });
      }

      const stateHistory = stateTracker.getStateHistory();
      expect(stateHistory.length).toBeGreaterThan(10);

      // Should make progress despite extreme parameters
      const finalState = stateHistory[stateHistory.length - 1];
      expect(finalState.position.x).toBeGreaterThan(startPosition.x);
      expect(finalState.position.y).toBeGreaterThan(startPosition.y);
      expect(finalState.position.scale).toBeGreaterThan(startPosition.scale);

      // Should not produce NaN or infinite values
      expect(isFinite(finalState.position.x)).toBe(true);
      expect(isFinite(finalState.position.y)).toBe(true);
      expect(isFinite(finalState.position.scale)).toBe(true);
    });
  });

  describe('Performance Mode Validation', () => {
    it('should produce consistent results across performance modes', async () => {
      const startPosition: CanvasPosition = { x: 0, y: 0, scale: 1.0 };
      const targetPosition: CanvasPosition = { x: 100, y: 100, scale: 1.5 };

      const performanceModes: Array<'performance' | 'balanced' | 'quality'> = ['performance', 'balanced', 'quality'];
      const results: Array<{ mode: string; finalPosition: CanvasPosition; frameCount: number }> = [];

      for (const mode of performanceModes) {
        timeController.reset();
        stateTracker.clear();

        const config: AnimationConfig = {
          enableSmoothing: true,
          smoothingFactor: 0.8,
          maxVelocity: 400,
          friction: 0.9,
          enableDebugging: false,
          performanceMode: mode,
        };

        renderWithTestUtils(
          React.createElement(DeterministicAnimationHarness, {
            timeController,
            stateTracker,
            config,
            startPosition,
            targetPosition,
          })
        );

        // Run same number of frames for each mode
        for (let frame = 0; frame < 90; frame++) {
          await act(async () => {
            timeController.advanceFrame();
          });
        }

        const stateHistory = stateTracker.getStateHistory();
        const finalState = stateHistory[stateHistory.length - 1];

        results.push({
          mode,
          finalPosition: finalState.position,
          frameCount: stateHistory.length,
        });
      }

      // All modes should reach similar final positions
      const tolerance = 10; // Allow some variation between modes
      for (let i = 1; i < results.length; i++) {
        expect(Math.abs(results[i].finalPosition.x - results[0].finalPosition.x)).toBeLessThan(tolerance);
        expect(Math.abs(results[i].finalPosition.y - results[0].finalPosition.y)).toBeLessThan(tolerance);
        expect(Math.abs(results[i].finalPosition.scale - results[0].finalPosition.scale)).toBeLessThan(0.1);
      }

      // Each mode should produce consistent frame counts
      results.forEach(result => {
        expect(result.frameCount).toBeGreaterThan(10);
      });
    });
  });
});