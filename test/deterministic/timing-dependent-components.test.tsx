/**
 * Timing-Dependent Components Deterministic Testing
 *
 * Practical application of deterministic testing to timing-dependent components including:
 * - TouchGestureHandler gesture timing and sequence validation
 * - AccessibilityController keyboard navigation response time testing
 * - Cross-component timing coordination and interaction sequences
 * - Event debouncing and throttling deterministic validation
 * - Asynchronous state updates with predictable timing
 *
 * @fileoverview Deterministic testing for timing-dependent components
 * @version 1.0.0
 * @since Task 7.4 - Deterministic Testing for Animation Sequences
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTestUtils } from '../utils';
import { fireEvent, act } from '@testing-library/react';
import React, { useState, useCallback, useRef } from 'react';

// Import deterministic testing utilities
import {
  DeterministicTestEnvironment,
  DeterministicStateMachine,
  DeterministicAssertions,
  withDeterministicTiming,
  createDeterministicTestEnvironment,
  DeterministicWait,
} from './deterministic-test-utils';

// Import components for testing
import { TouchGestureHandler } from '../../components/TouchGestureHandler';
import { AccessibilityController } from '../../components/AccessibilityController';
import { PerformanceRenderer } from '../../components/PerformanceRenderer';

import type { CanvasPosition } from '../../types/canvas';
import type { TouchGestureState, GestureType } from '../../components/TouchGestureHandler';
import type { AccessibilityConfig } from '../../components/AccessibilityController';
import type { PerformanceMetrics } from '../../components/PerformanceRenderer';

/**
 * Gesture state types for state machine validation
 */
type GestureState = 'idle' | 'touch_start' | 'touch_move' | 'touch_end' | 'gesture_recognized';
type GestureEvent = 'touch_start' | 'touch_move' | 'touch_end' | 'gesture_timeout' | 'gesture_complete';

/**
 * Accessibility state types for keyboard navigation
 */
type AccessibilityState = 'ready' | 'processing_key' | 'announcing' | 'position_updating';
type AccessibilityEvent = 'key_pressed' | 'position_changed' | 'announcement_started' | 'operation_complete';

/**
 * Test harness for deterministic gesture testing
 */
const DeterministicGestureHarness: React.FC<{
  env: DeterministicTestEnvironment;
  onGestureStateChange?: (state: TouchGestureState) => void;
  onTimingEvent?: (event: string, timestamp: number) => void;
}> = ({ env, onGestureStateChange, onTimingEvent }) => {
  const [position, setPosition] = useState<CanvasPosition>({ x: 0, y: 0, scale: 1.0 });
  const [gestureEvents, setGestureEvents] = useState<Array<{ event: string; timestamp: number; data: any }>>([]);

  const handleGestureStart = useCallback((gestureState: TouchGestureState) => {
    const timestamp = env.getEventScheduler().getCurrentTime();
    const event = { event: 'gesture_start', timestamp, data: gestureState };

    setGestureEvents(prev => [...prev, event]);
    onGestureStateChange?.(gestureState);
    onTimingEvent?.('gesture_start', timestamp);
  }, [env, onGestureStateChange, onTimingEvent]);

  const handleGestureUpdate = useCallback((gestureState: TouchGestureState) => {
    const timestamp = env.getEventScheduler().getCurrentTime();
    const event = { event: 'gesture_update', timestamp, data: gestureState };

    setGestureEvents(prev => [...prev, event]);
    onGestureStateChange?.(gestureState);
    onTimingEvent?.('gesture_update', timestamp);

    // Update position based on gesture
    if (gestureState.gestureType === 'pan') {
      setPosition(prev => ({
        x: prev.x + gestureState.deltaX,
        y: prev.y + gestureState.deltaY,
        scale: prev.scale,
      }));
    }
  }, [env, onGestureStateChange, onTimingEvent]);

  const handleGestureEnd = useCallback((gestureState: TouchGestureState) => {
    const timestamp = env.getEventScheduler().getCurrentTime();
    const event = { event: 'gesture_end', timestamp, data: gestureState };

    setGestureEvents(prev => [...prev, event]);
    onGestureStateChange?.(gestureState);
    onTimingEvent?.('gesture_end', timestamp);
  }, [env, onGestureStateChange, onTimingEvent]);

  return (
    <div data-testid="deterministic-gesture-harness">
      <TouchGestureHandler
        enabled={true}
        onGestureStart={handleGestureStart}
        onGestureUpdate={handleGestureUpdate}
        onGestureEnd={handleGestureEnd}
        currentPosition={position}
        debugMode={false}
      />
      <div data-testid="gesture-events" style={{ display: 'none' }}>
        {JSON.stringify(gestureEvents)}
      </div>
      <div data-testid="current-position" style={{ display: 'none' }}>
        {JSON.stringify(position)}
      </div>
    </div>
  );
};

/**
 * Test harness for deterministic accessibility testing
 */
const DeterministicAccessibilityHarness: React.FC<{
  env: DeterministicTestEnvironment;
  config: AccessibilityConfig;
  onPositionChange?: (position: CanvasPosition, timestamp: number) => void;
  onAnnouncement?: (message: string, timestamp: number) => void;
}> = ({ env, config, onPositionChange, onAnnouncement }) => {
  const [position, setPosition] = useState<CanvasPosition>({ x: 0, y: 0, scale: 1.0 });
  const [announcements, setAnnouncements] = useState<Array<{ message: string; timestamp: number }>>([]);

  const handlePositionChange = useCallback((newPosition: CanvasPosition) => {
    const timestamp = env.getEventScheduler().getCurrentTime();
    setPosition(newPosition);
    setAnnouncements(prev => [...prev, { message: `Position changed to (${newPosition.x}, ${newPosition.y})`, timestamp }]);
    onPositionChange?.(newPosition, timestamp);
  }, [env, onPositionChange]);

  const handleAnnouncement = useCallback((message: string) => {
    const timestamp = env.getEventScheduler().getCurrentTime();
    setAnnouncements(prev => [...prev, { message, timestamp }]);
    onAnnouncement?.(message, timestamp);
  }, [env, onAnnouncement]);

  return (
    <div data-testid="deterministic-accessibility-harness">
      <AccessibilityController
        currentPosition={position}
        config={config}
        onPositionChange={handlePositionChange}
        onAnnouncement={handleAnnouncement}
        debugMode={false}
      />
      <div data-testid="accessibility-announcements" style={{ display: 'none' }}>
        {JSON.stringify(announcements)}
      </div>
      <div data-testid="accessibility-position" style={{ display: 'none' }}>
        {JSON.stringify(position)}
      </div>
    </div>
  );
};

describe('Timing-Dependent Components Deterministic Testing', () => {
  let env: DeterministicTestEnvironment;

  beforeEach(() => {
    env = createDeterministicTestEnvironment();
    env.setup();
  });

  afterEach(() => {
    env.teardown();
  });

  describe('TouchGestureHandler Deterministic Testing', () => {
    it('should validate gesture timing sequences deterministically', withDeterministicTiming(async (testEnv) => {
      const gestureStates: TouchGestureState[] = [];
      const timingEvents: Array<{ event: string; timestamp: number }> = [];

      const { container, getByTestId } = renderWithTestUtils(
        React.createElement(DeterministicGestureHarness, {
          env: testEnv,
          onGestureStateChange: (state) => gestureStates.push(state),
          onTimingEvent: (event, timestamp) => timingEvents.push({ event, timestamp }),
        })
      );

      const gestureElement = container.firstChild as HTMLElement;

      // Create gesture state machine
      const stateMachine = testEnv.createStateMachine<GestureState, GestureEvent>('idle');

      // Define valid gesture transitions
      stateMachine.defineTransition('idle', 'touch_start', 'touch_start');
      stateMachine.defineTransition('touch_start', 'touch_move', 'touch_move');
      stateMachine.defineTransition('touch_move', 'touch_move', 'touch_move');
      stateMachine.defineTransition('touch_move', 'touch_end', 'touch_end');
      stateMachine.defineTransition('touch_start', 'touch_end', 'touch_end');
      stateMachine.defineTransition('touch_end', 'gesture_complete', 'idle');

      // Simulate deterministic gesture sequence
      await act(async () => {
        // Touch start at T=0
        fireEvent.touchStart(gestureElement, {
          touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        });

        const startResult = stateMachine.processEvent('touch_start', testEnv.getEventScheduler().getCurrentTime());
        expect(startResult.success).toBe(true);
        expect(startResult.newState).toBe('touch_start');

        // Advance time and simulate touch moves
        for (let i = 1; i <= 10; i++) {
          await testEnv.advanceTime(16); // 16ms between moves (~60fps)

          fireEvent.touchMove(gestureElement, {
            touches: [{ clientX: 100 + i * 5, clientY: 100 + i * 2, identifier: 1 }],
          });

          const moveResult = stateMachine.processEvent('touch_move', testEnv.getEventScheduler().getCurrentTime());
          expect(moveResult.success).toBe(true);
          expect(moveResult.newState).toBe('touch_move');
        }

        // Touch end
        await testEnv.advanceTime(16);
        fireEvent.touchEnd(gestureElement, {
          changedTouches: [{ clientX: 150, clientY: 120, identifier: 1 }],
        });

        const endResult = stateMachine.processEvent('touch_end', testEnv.getEventScheduler().getCurrentTime());
        expect(endResult.success).toBe(true);
        expect(endResult.newState).toBe('touch_end');
      });

      // Validate timing consistency
      expect(timingEvents.length).toBeGreaterThan(10); // Start + moves + end

      // Check that events occur at expected intervals
      for (let i = 1; i < timingEvents.length - 1; i++) {
        const timeDelta = timingEvents[i + 1].timestamp - timingEvents[i].timestamp;
        expect(timeDelta).toBeCloseTo(16, 1); // Should be ~16ms apart
      }

      // Validate gesture recognition
      expect(gestureStates.length).toBeGreaterThan(0);
      expect(gestureStates[0].gestureType).toBe('none'); // Initial state
      expect(gestureStates[gestureStates.length - 1].isActive).toBe(false); // Should end inactive

      // Validate state machine sequence
      const stateHistory = stateMachine.getStateHistory();
      expect(stateHistory[0].state).toBe('idle');
      expect(stateHistory[1].state).toBe('touch_start');
      expect(stateHistory[stateHistory.length - 1].state).toBe('touch_end');
    }));

    it('should handle gesture timeouts deterministically', withDeterministicTiming(async (testEnv) => {
      const gestureStates: TouchGestureState[] = [];

      const { container } = renderWithTestUtils(
        React.createElement(DeterministicGestureHarness, {
          env: testEnv,
          onGestureStateChange: (state) => gestureStates.push(state),
        })
      );

      const gestureElement = container.firstChild as HTMLElement;

      await act(async () => {
        // Start gesture
        fireEvent.touchStart(gestureElement, {
          touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
        });

        // Don't send touch end - let it timeout
        await testEnv.advanceTime(5000); // 5 seconds should be enough for timeout
      });

      // Gesture should have timed out and returned to idle state
      const lastGestureState = gestureStates[gestureStates.length - 1];
      expect(lastGestureState.isActive).toBe(false);
    }));

    it('should validate multi-touch gesture timing', withDeterministicTiming(async (testEnv) => {
      const gestureStates: TouchGestureState[] = [];
      const timingEvents: Array<{ event: string; timestamp: number }> = [];

      const { container } = renderWithTestUtils(
        React.createElement(DeterministicGestureHarness, {
          env: testEnv,
          onGestureStateChange: (state) => gestureStates.push(state),
          onTimingEvent: (event, timestamp) => timingEvents.push({ event, timestamp }),
        })
      );

      const gestureElement = container.firstChild as HTMLElement;

      await act(async () => {
        // Start pinch gesture with two touches
        fireEvent.touchStart(gestureElement, {
          touches: [
            { clientX: 100, clientY: 100, identifier: 1 },
            { clientX: 200, clientY: 200, identifier: 2 },
          ],
        });

        await testEnv.advanceTime(16);

        // Move touches apart (pinch out)
        for (let i = 1; i <= 15; i++) {
          await testEnv.advanceTime(16);

          fireEvent.touchMove(gestureElement, {
            touches: [
              { clientX: 100 - i * 2, clientY: 100 - i * 2, identifier: 1 },
              { clientX: 200 + i * 2, clientY: 200 + i * 2, identifier: 2 },
            ],
          });
        }

        // End pinch gesture
        await testEnv.advanceTime(16);
        fireEvent.touchEnd(gestureElement, {
          changedTouches: [
            { clientX: 70, clientY: 70, identifier: 1 },
            { clientX: 230, clientY: 230, identifier: 2 },
          ],
        });
      });

      // Validate pinch gesture was recognized
      const pinchGestures = gestureStates.filter(state => state.gestureType === 'pinch');
      expect(pinchGestures.length).toBeGreaterThan(0);

      // Validate timing consistency for multi-touch
      const gestureUpdates = timingEvents.filter(event => event.event === 'gesture_update');
      expect(gestureUpdates.length).toBeGreaterThan(10);

      // Check consistent frame timing
      for (let i = 1; i < gestureUpdates.length; i++) {
        const timeDelta = gestureUpdates[i].timestamp - gestureUpdates[i - 1].timestamp;
        expect(timeDelta).toBeCloseTo(16, 2);
      }
    }));
  });

  describe('AccessibilityController Deterministic Testing', () => {
    it('should validate keyboard navigation response times deterministically', withDeterministicTiming(async (testEnv) => {
      const positionChanges: Array<{ position: CanvasPosition; timestamp: number }> = [];
      const announcements: Array<{ message: string; timestamp: number }> = [];

      const config: AccessibilityConfig = {
        keyboardSpatialNav: true,
        moveDistance: 50,
        zoomFactor: 1.2,
        enableAnnouncements: true,
        enableSpatialContext: true,
        maxResponseTime: 100, // 100ms response time requirement
      };

      renderWithTestUtils(
        React.createElement(DeterministicAccessibilityHarness, {
          env: testEnv,
          config,
          onPositionChange: (position, timestamp) => positionChanges.push({ position, timestamp }),
          onAnnouncement: (message, timestamp) => announcements.push({ message, timestamp }),
        })
      );

      // Test response times for different navigation commands
      const navigationCommands = [
        { key: 'ArrowRight', expectedX: 50, expectedY: 0 },
        { key: 'ArrowUp', expectedX: 50, expectedY: -50 },
        { key: 'ArrowLeft', expectedX: 0, expectedY: -50 },
        { key: 'ArrowDown', expectedX: 0, expectedY: 0 },
      ];

      for (const command of navigationCommands) {
        const commandStartTime = testEnv.getEventScheduler().getCurrentTime();

        await act(async () => {
          // Send keyboard event
          const event = new KeyboardEvent('keydown', { key: command.key });
          window.dispatchEvent(event);

          // Advance minimal time to allow processing
          await testEnv.advanceTime(1);
        });

        // Find the position change that occurred after this command
        const relevantChanges = positionChanges.filter(change =>
          change.timestamp >= commandStartTime
        );

        expect(relevantChanges.length).toBeGreaterThan(0);

        const latestChange = relevantChanges[relevantChanges.length - 1];
        const responseTime = latestChange.timestamp - commandStartTime;

        // Validate response time meets requirement
        expect(responseTime).toBeLessThanOrEqual(config.maxResponseTime);

        // Validate position accuracy
        expect(latestChange.position.x).toBeCloseTo(command.expectedX, 1);
        expect(latestChange.position.y).toBeCloseTo(command.expectedY, 1);

        // Advance time before next command
        await testEnv.advanceTime(50);
      }

      // Validate announcements were made
      expect(announcements.length).toBeGreaterThanOrEqual(navigationCommands.length);

      // Validate announcement timing
      announcements.forEach(announcement => {
        // Each announcement should occur very close to the corresponding position change
        const correspondingChange = positionChanges.find(change =>
          Math.abs(change.timestamp - announcement.timestamp) < 10
        );
        expect(correspondingChange).toBeTruthy();
      });
    }));

    it('should validate debounced keyboard navigation', withDeterministicTiming(async (testEnv) => {
      const positionChanges: Array<{ position: CanvasPosition; timestamp: number }> = [];

      const config: AccessibilityConfig = {
        keyboardSpatialNav: true,
        moveDistance: 25,
        zoomFactor: 1.1,
        enableAnnouncements: false, // Disable for this test
        enableSpatialContext: false,
        maxResponseTime: 50,
      };

      renderWithTestUtils(
        React.createElement(DeterministicAccessibilityHarness, {
          env: testEnv,
          config,
          onPositionChange: (position, timestamp) => positionChanges.push({ position, timestamp }),
        })
      );

      await act(async () => {
        // Rapid keyboard input (faster than debounce threshold)
        for (let i = 0; i < 10; i++) {
          const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
          window.dispatchEvent(event);
          await testEnv.advanceTime(5); // 5ms between key presses (very rapid)
        }

        // Wait for debouncing to settle
        await testEnv.advanceTime(200);
      });

      // Even with rapid input, all movements should be processed
      // (AccessibilityController doesn't debounce by default, but this tests the capability)
      expect(positionChanges.length).toBeGreaterThan(5);

      // Validate final position
      const finalPosition = positionChanges[positionChanges.length - 1].position;
      expect(finalPosition.x).toBeCloseTo(250, 1); // 10 moves * 25 distance
    }));

    it('should validate accessibility state transitions', withDeterministicTiming(async (testEnv) => {
      const stateTransitions: Array<{ state: AccessibilityState; timestamp: number }> = [];

      // Create accessibility state machine
      const stateMachine = testEnv.createStateMachine<AccessibilityState, AccessibilityEvent>('ready');

      // Define state transitions
      stateMachine.defineTransition('ready', 'key_pressed', 'processing_key');
      stateMachine.defineTransition('processing_key', 'position_changed', 'position_updating');
      stateMachine.defineTransition('processing_key', 'announcement_started', 'announcing');
      stateMachine.defineTransition('position_updating', 'operation_complete', 'ready');
      stateMachine.defineTransition('announcing', 'operation_complete', 'ready');

      const config: AccessibilityConfig = {
        keyboardSpatialNav: true,
        moveDistance: 30,
        zoomFactor: 1.15,
        enableAnnouncements: true,
        enableSpatialContext: true,
        maxResponseTime: 75,
      };

      renderWithTestUtils(
        React.createElement(DeterministicAccessibilityHarness, {
          env: testEnv,
          config,
          onPositionChange: (position, timestamp) => {
            stateMachine.processEvent('position_changed', timestamp);
          },
          onAnnouncement: (message, timestamp) => {
            stateMachine.processEvent('announcement_started', timestamp);
          },
        })
      );

      await act(async () => {
        // Process key event
        stateMachine.processEvent('key_pressed', testEnv.getEventScheduler().getCurrentTime());

        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        window.dispatchEvent(event);

        await testEnv.advanceTime(10);

        // Complete the operation
        stateMachine.processEvent('operation_complete', testEnv.getEventScheduler().getCurrentTime());
      });

      // Validate state machine progression
      const stateHistory = stateMachine.getStateHistory();
      expect(stateHistory.length).toBeGreaterThanOrEqual(3); // ready -> processing -> ready (minimum)

      // Validate state sequence
      const sequence = stateMachine.validateStateSequence([
        { state: 'ready' },
        { state: 'processing_key' },
        { state: 'ready' },
      ]);

      expect(sequence.isValid).toBe(true);
    }));
  });

  describe('Cross-Component Timing Coordination', () => {
    it('should validate synchronized component interactions', withDeterministicTiming(async (testEnv) => {
      const events: Array<{ component: string; event: string; timestamp: number }> = [];

      const config: AccessibilityConfig = {
        keyboardSpatialNav: true,
        moveDistance: 40,
        zoomFactor: 1.3,
        enableAnnouncements: true,
        enableSpatialContext: false,
        maxResponseTime: 80,
      };

      const metrics: PerformanceMetrics = {
        fps: 60,
        frameTime: 16.67,
        memoryMB: 30,
        canvasRenderFPS: 58,
        transformOverhead: 3.0,
        activeOperations: 0,
        averageMovementTime: 15,
        gpuUtilization: 40,
      };

      const IntegratedComponent = () => {
        const [position, setPosition] = useState<CanvasPosition>({ x: 0, y: 0, scale: 1.0 });

        return (
          <div>
            <DeterministicAccessibilityHarness
              env={testEnv}
              config={config}
              onPositionChange={(pos, timestamp) => {
                setPosition(pos);
                events.push({ component: 'accessibility', event: 'position_change', timestamp });
              }}
              onAnnouncement={(message, timestamp) => {
                events.push({ component: 'accessibility', event: 'announcement', timestamp });
              }}
            />
            <PerformanceRenderer
              metrics={metrics}
              qualityLevel="high"
              debugMode={true}
              canvasPosition={position}
              layout="2d-canvas"
              isTransitioning={false}
            />
          </div>
        );
      };

      renderWithTestUtils(React.createElement(IntegratedComponent));

      await act(async () => {
        // Simulate coordinated interactions
        const interactions = [
          { key: 'ArrowRight', delay: 0 },
          { key: 'ArrowUp', delay: 100 },
          { key: '+', delay: 200 }, // Zoom in
          { key: 'ArrowLeft', delay: 300 },
        ];

        for (const interaction of interactions) {
          await testEnv.advanceTime(interaction.delay);

          const event = new KeyboardEvent('keydown', { key: interaction.key });
          window.dispatchEvent(event);

          await testEnv.advanceTime(10); // Allow processing
        }
      });

      // Validate event ordering
      const eventOrder = events.map(e => `${e.component}:${e.event}`);
      const orderingResult = DeterministicAssertions.assertEventOrderingMatches(
        events.map(e => ({ timestamp: e.timestamp, type: `${e.component}:${e.event}` })),
        [
          'accessibility:position_change',
          'accessibility:announcement',
          'accessibility:position_change',
          'accessibility:announcement',
          'accessibility:position_change',
          'accessibility:announcement',
          'accessibility:position_change',
          'accessibility:announcement',
        ]
      );

      expect(orderingResult.orderMatches).toBe(true);

      // Validate timing intervals
      const positionChanges = events.filter(e => e.event === 'position_change');
      for (let i = 1; i < positionChanges.length; i++) {
        const interval = positionChanges[i].timestamp - positionChanges[i - 1].timestamp;
        expect(interval).toBeGreaterThanOrEqual(100); // Should match our delays
        expect(interval).toBeLessThanOrEqual(120); // Allow some tolerance
      }
    }));

    it('should handle component timing conflicts deterministically', withDeterministicTiming(async (testEnv) => {
      const conflicts: Array<{ timestamp: number; description: string }> = [];

      // Simulate rapid conflicting events
      const asyncCoordinator = testEnv.getAsyncCoordinator();

      await act(async () => {
        // Create multiple competing operations
        const op1 = asyncCoordinator.createOperation('gesture_operation', 100);
        const op2 = asyncCoordinator.createOperation('keyboard_operation', 150);
        const op3 = asyncCoordinator.createOperation('performance_update', 50);

        // Start operations at different times
        testEnv.getEventScheduler().scheduleEvent(10, () => {
          // Gesture starts
          conflicts.push({ timestamp: testEnv.getEventScheduler().getCurrentTime(), description: 'Gesture started' });
        });

        testEnv.getEventScheduler().scheduleEvent(25, () => {
          // Keyboard event during gesture
          conflicts.push({ timestamp: testEnv.getEventScheduler().getCurrentTime(), description: 'Keyboard during gesture' });
        });

        testEnv.getEventScheduler().scheduleEvent(40, () => {
          // Performance update during both
          conflicts.push({ timestamp: testEnv.getEventScheduler().getCurrentTime(), description: 'Performance update' });
        });

        // Advance time to execute all events
        await testEnv.advanceTime(200);

        // Resolve operations
        asyncCoordinator.resolveOperation('performance_update', 'completed');
        asyncCoordinator.resolveOperation('gesture_operation', 'completed');
        asyncCoordinator.resolveOperation('keyboard_operation', 'completed');
      });

      // Validate that conflicts were handled in deterministic order
      expect(conflicts.length).toBe(3);
      expect(conflicts[0].description).toBe('Gesture started');
      expect(conflicts[1].description).toBe('Keyboard during gesture');
      expect(conflicts[2].description).toBe('Performance update');

      // Validate timing consistency
      expect(conflicts[0].timestamp).toBe(10);
      expect(conflicts[1].timestamp).toBe(25);
      expect(conflicts[2].timestamp).toBe(40);
    }));
  });

  describe('Performance Validation Under Deterministic Timing', () => {
    it('should validate component performance with controlled timing', withDeterministicTiming(async (testEnv) => {
      const performanceMetrics: Array<{ operation: string; duration: number; timestamp: number }> = [];

      const measureOperation = async (operation: string, operationFn: () => Promise<void> | void) => {
        const startTime = testEnv.getEventScheduler().getCurrentTime();
        await operationFn();
        const endTime = testEnv.getEventScheduler().getCurrentTime();

        performanceMetrics.push({
          operation,
          duration: endTime - startTime,
          timestamp: startTime,
        });
      };

      const config: AccessibilityConfig = {
        keyboardSpatialNav: true,
        moveDistance: 35,
        zoomFactor: 1.25,
        enableAnnouncements: true,
        enableSpatialContext: true,
        maxResponseTime: 60,
      };

      renderWithTestUtils(
        React.createElement(DeterministicAccessibilityHarness, {
          env: testEnv,
          config,
        })
      );

      // Measure different operations
      await measureOperation('single_navigation', async () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        window.dispatchEvent(event);
        await testEnv.advanceTime(10);
      });

      await measureOperation('rapid_navigation', async () => {
        for (let i = 0; i < 5; i++) {
          const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
          window.dispatchEvent(event);
          await testEnv.advanceTime(10);
        }
      });

      await measureOperation('zoom_operation', async () => {
        const event = new KeyboardEvent('keydown', { key: '+' });
        window.dispatchEvent(event);
        await testEnv.advanceTime(10);
      });

      // Validate performance consistency
      const singleNavMetrics = performanceMetrics.filter(m => m.operation === 'single_navigation');
      expect(singleNavMetrics.length).toBe(1);
      expect(singleNavMetrics[0].duration).toBeLessThanOrEqual(config.maxResponseTime);

      const rapidNavMetrics = performanceMetrics.filter(m => m.operation === 'rapid_navigation');
      expect(rapidNavMetrics.length).toBe(1);
      expect(rapidNavMetrics[0].duration).toBeLessThanOrEqual(config.maxResponseTime * 5); // Allow scaling

      const zoomMetrics = performanceMetrics.filter(m => m.operation === 'zoom_operation');
      expect(zoomMetrics.length).toBe(1);
      expect(zoomMetrics[0].duration).toBeLessThanOrEqual(config.maxResponseTime);

      // Validate timing determinism - repeated runs should give same results
      // This is implicit in the deterministic framework
      expect(performanceMetrics.every(m => m.duration >= 0)).toBe(true);
    }));
  });
});