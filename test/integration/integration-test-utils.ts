/**
 * Integration Testing Utilities
 *
 * Comprehensive utilities for testing complex component interactions including:
 * - Cross-component state validation and synchronization
 * - Performance monitoring during integration tests
 * - Mock factories for component dependencies
 * - Test scenario builders and validation frameworks
 * - Interaction logging and analysis tools
 *
 * @fileoverview Integration testing utility framework
 * @version 1.0.0
 * @since Task 7.2 - Integration Testing Framework
 */

import { vi } from 'vitest';
import type { CanvasPosition } from '../../types/canvas';
import type { TouchGestureState } from '../../components/TouchGestureHandler';
import type { PerformanceMetrics } from '../../components/PerformanceRenderer';

/**
 * Integration test interaction log entry
 */
export interface InteractionLogEntry {
  timestamp: number;
  type: string;
  component: string;
  data: any;
  performanceData?: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

/**
 * Test scenario definition for component interactions
 */
export interface TestScenario {
  name: string;
  description: string;
  setup?: () => void | Promise<void>;
  actions: Array<{
    name: string;
    execute: () => void | Promise<void>;
    expectedResults?: Array<{
      type: string;
      validator: (log: InteractionLogEntry[]) => boolean;
      timeout?: number;
    }>;
  }>;
  cleanup?: () => void | Promise<void>;
}

/**
 * Component state validation interface
 */
export interface ComponentStateValidator {
  canvasPosition?: {
    x?: number;
    y?: number;
    scale?: number;
    tolerance?: number;
  };
  performanceMetrics?: {
    minFps?: number;
    maxMemoryMB?: number;
    maxOperations?: number;
  };
  accessibilityState?: {
    announcementsEnabled?: boolean;
    keyboardNavEnabled?: boolean;
    expectedAnnouncements?: string[];
  };
  animationState?: {
    isAnimating?: boolean;
    animationType?: string;
  };
}

/**
 * Enhanced interaction logger with performance monitoring
 */
export class IntegrationTestLogger {
  private logs: InteractionLogEntry[] = [];
  private performanceMarkers: Map<string, number> = new Map();

  public startPerformanceMarker(id: string): void {
    this.performanceMarkers.set(id, performance.now());
  }

  public endPerformanceMarker(id: string): number | undefined {
    const startTime = this.performanceMarkers.get(id);
    if (startTime !== undefined) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.performanceMarkers.delete(id);
      return duration;
    }
    return undefined;
  }

  public log(entry: Omit<InteractionLogEntry, 'timestamp'>): void {
    this.logs.push({
      ...entry,
      timestamp: performance.now(),
    });
  }

  public getLogs(): InteractionLogEntry[] {
    return [...this.logs];
  }

  public getLogsByType(type: string): InteractionLogEntry[] {
    return this.logs.filter(log => log.type === type);
  }

  public getLogsByComponent(component: string): InteractionLogEntry[] {
    return this.logs.filter(log => log.component === component);
  }

  public clear(): void {
    this.logs = [];
    this.performanceMarkers.clear();
  }

  public getPerformanceStats(): {
    totalInteractions: number;
    averageResponseTime: number;
    slowestInteraction: InteractionLogEntry | null;
    fastestInteraction: InteractionLogEntry | null;
  } {
    const logsWithPerformance = this.logs.filter(log => log.performanceData);

    if (logsWithPerformance.length === 0) {
      return {
        totalInteractions: 0,
        averageResponseTime: 0,
        slowestInteraction: null,
        fastestInteraction: null,
      };
    }

    const durations = logsWithPerformance.map(log => log.performanceData!.duration);
    const averageResponseTime = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;

    const slowestInteraction = logsWithPerformance.reduce((slowest, current) =>
      (current.performanceData!.duration > (slowest.performanceData?.duration || 0)) ? current : slowest
    );

    const fastestInteraction = logsWithPerformance.reduce((fastest, current) =>
      (current.performanceData!.duration < (fastest.performanceData?.duration || Infinity)) ? current : fastest
    );

    return {
      totalInteractions: logsWithPerformance.length,
      averageResponseTime,
      slowestInteraction,
      fastestInteraction,
    };
  }
}

/**
 * Mock factory for creating test dependencies
 */
export class IntegrationMockFactory {
  public static createMockCanvasPosition(overrides?: Partial<CanvasPosition>): CanvasPosition {
    return {
      x: 0,
      y: 0,
      scale: 1.0,
      ...overrides,
    };
  }

  public static createMockPerformanceMetrics(overrides?: Partial<PerformanceMetrics>): PerformanceMetrics {
    return {
      fps: 60,
      frameTime: 16.67,
      memoryMB: 35,
      canvasRenderFPS: 58,
      transformOverhead: 2.5,
      activeOperations: 0,
      averageMovementTime: 12,
      gpuUtilization: 45,
      ...overrides,
    };
  }

  public static createMockTouchGestureState(overrides?: Partial<TouchGestureState>): TouchGestureState {
    return {
      isActive: false,
      gestureType: 'none',
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
      scale: 1.0,
      rotation: 0,
      velocity: 0,
      timestamp: Date.now(),
      touchCount: 0,
      ...overrides,
    };
  }

  public static createMockEventListeners() {
    const listeners = new Map<string, Function[]>();

    const addEventListener = vi.fn((event: string, handler: Function) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(handler);
    });

    const removeEventListener = vi.fn((event: string, handler: Function) => {
      if (listeners.has(event)) {
        const eventHandlers = listeners.get(event)!;
        const index = eventHandlers.indexOf(handler);
        if (index > -1) {
          eventHandlers.splice(index, 1);
        }
      }
    });

    const dispatchEvent = vi.fn((event: Event) => {
      const eventType = event.type;
      if (listeners.has(eventType)) {
        listeners.get(eventType)!.forEach(handler => handler(event));
      }
    });

    return {
      addEventListener,
      removeEventListener,
      dispatchEvent,
      getListeners: () => listeners,
    };
  }
}

/**
 * Component state validator utility
 */
export class ComponentStateValidator {
  public static validateCanvasPosition(
    actual: CanvasPosition,
    expected: ComponentStateValidator['canvasPosition'],
    tolerance: number = 0.1
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!expected) {
      return { isValid: true, errors: [] };
    }

    const usedTolerance = expected.tolerance ?? tolerance;

    if (expected.x !== undefined && Math.abs(actual.x - expected.x) > usedTolerance) {
      errors.push(`Expected x: ${expected.x}, actual: ${actual.x} (tolerance: ${usedTolerance})`);
    }

    if (expected.y !== undefined && Math.abs(actual.y - expected.y) > usedTolerance) {
      errors.push(`Expected y: ${expected.y}, actual: ${actual.y} (tolerance: ${usedTolerance})`);
    }

    if (expected.scale !== undefined && Math.abs(actual.scale - expected.scale) > usedTolerance) {
      errors.push(`Expected scale: ${expected.scale}, actual: ${actual.scale} (tolerance: ${usedTolerance})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validatePerformanceMetrics(
    actual: PerformanceMetrics,
    expected: ComponentStateValidator['performanceMetrics']
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!expected) {
      return { isValid: true, errors: [] };
    }

    if (expected.minFps !== undefined && actual.fps < expected.minFps) {
      errors.push(`FPS below minimum: expected >= ${expected.minFps}, actual: ${actual.fps}`);
    }

    if (expected.maxMemoryMB !== undefined && actual.memoryMB > expected.maxMemoryMB) {
      errors.push(`Memory above maximum: expected <= ${expected.maxMemoryMB}MB, actual: ${actual.memoryMB}MB`);
    }

    if (expected.maxOperations !== undefined && (actual.activeOperations || 0) > expected.maxOperations) {
      errors.push(`Operations above maximum: expected <= ${expected.maxOperations}, actual: ${actual.activeOperations}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateInteractionSequence(
    logs: InteractionLogEntry[],
    expectedSequence: Array<{ type: string; component?: string; data?: any }>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (logs.length < expectedSequence.length) {
      errors.push(`Expected ${expectedSequence.length} interactions, but only ${logs.length} were logged`);
      return { isValid: false, errors };
    }

    for (let i = 0; i < expectedSequence.length; i++) {
      const expected = expectedSequence[i];
      const actual = logs[i];

      if (actual.type !== expected.type) {
        errors.push(`Interaction ${i}: expected type '${expected.type}', actual: '${actual.type}'`);
      }

      if (expected.component && actual.component !== expected.component) {
        errors.push(`Interaction ${i}: expected component '${expected.component}', actual: '${actual.component}'`);
      }

      if (expected.data) {
        // Deep validation of data can be added here based on specific requirements
        if (JSON.stringify(actual.data) !== JSON.stringify(expected.data)) {
          errors.push(`Interaction ${i}: data mismatch`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Test scenario runner utility
 */
export class TestScenarioRunner {
  private logger: IntegrationTestLogger;

  constructor(logger: IntegrationTestLogger) {
    this.logger = logger;
  }

  public async runScenario(scenario: TestScenario): Promise<{
    success: boolean;
    results: Array<{
      actionName: string;
      success: boolean;
      errors: string[];
      performanceData?: any;
    }>;
    logs: InteractionLogEntry[];
  }> {
    this.logger.clear();

    try {
      // Setup
      if (scenario.setup) {
        await scenario.setup();
      }

      const results = [];

      // Execute actions
      for (const action of scenario.actions) {
        const actionStartTime = performance.now();
        this.logger.startPerformanceMarker(action.name);

        try {
          await action.execute();

          const actionDuration = this.logger.endPerformanceMarker(action.name);
          const actionEndTime = performance.now();

          // Validate expected results if provided
          const actionErrors: string[] = [];
          if (action.expectedResults) {
            for (const expectedResult of action.expectedResults) {
              const timeout = expectedResult.timeout || 1000;
              const startValidation = performance.now();

              // Wait for expected result with timeout
              let validationPassed = false;
              while (performance.now() - startValidation < timeout && !validationPassed) {
                const currentLogs = this.logger.getLogs();
                if (expectedResult.validator(currentLogs)) {
                  validationPassed = true;
                  break;
                }
                await new Promise(resolve => setTimeout(resolve, 10));
              }

              if (!validationPassed) {
                actionErrors.push(`Expected result '${expectedResult.type}' not found within ${timeout}ms`);
              }
            }
          }

          results.push({
            actionName: action.name,
            success: actionErrors.length === 0,
            errors: actionErrors,
            performanceData: {
              duration: actionDuration,
              startTime: actionStartTime,
              endTime: actionEndTime,
            },
          });

        } catch (error) {
          results.push({
            actionName: action.name,
            success: false,
            errors: [error instanceof Error ? error.message : String(error)],
          });
        }
      }

      // Cleanup
      if (scenario.cleanup) {
        await scenario.cleanup();
      }

      return {
        success: results.every(result => result.success),
        results,
        logs: this.logger.getLogs(),
      };

    } catch (setupError) {
      return {
        success: false,
        results: [{
          actionName: 'setup',
          success: false,
          errors: [setupError instanceof Error ? setupError.message : String(setupError)],
        }],
        logs: this.logger.getLogs(),
      };
    }
  }
}

/**
 * Performance benchmarking utilities for integration tests
 */
export class IntegrationPerformanceBenchmark {
  private benchmarks: Map<string, number[]> = new Map();

  public startBenchmark(name: string): () => number {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      if (!this.benchmarks.has(name)) {
        this.benchmarks.set(name, []);
      }
      this.benchmarks.get(name)!.push(duration);

      return duration;
    };
  }

  public getBenchmarkStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    median: number;
    standardDeviation: number;
  } | null {
    const values = this.benchmarks.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const median = count % 2 === 0
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];

    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);

    return {
      count,
      average,
      min,
      max,
      median,
      standardDeviation,
    };
  }

  public getAllBenchmarks(): Map<string, number[]> {
    return new Map(this.benchmarks);
  }

  public clear(): void {
    this.benchmarks.clear();
  }

  public compareBenchmarks(baseline: string, comparison: string): {
    averageImprovement: number;
    significantChange: boolean;
    recommendation: string;
  } | null {
    const baselineStats = this.getBenchmarkStats(baseline);
    const comparisonStats = this.getBenchmarkStats(comparison);

    if (!baselineStats || !comparisonStats) {
      return null;
    }

    const averageImprovement = ((baselineStats.average - comparisonStats.average) / baselineStats.average) * 100;
    const significantChange = Math.abs(averageImprovement) > 5; // 5% threshold

    let recommendation = '';
    if (averageImprovement > 5) {
      recommendation = 'Performance improved significantly';
    } else if (averageImprovement < -5) {
      recommendation = 'Performance degraded significantly - investigate';
    } else {
      recommendation = 'Performance change within acceptable range';
    }

    return {
      averageImprovement,
      significantChange,
      recommendation,
    };
  }
}

/**
 * Utility for creating common test scenarios
 */
export const createCommonTestScenarios = (logger: IntegrationTestLogger) => ({
  basicNavigation: (): TestScenario => ({
    name: 'basic_navigation',
    description: 'Test basic keyboard navigation functionality',
    actions: [
      {
        name: 'move_right',
        execute: () => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        },
        expectedResults: [
          {
            type: 'position_change',
            validator: (logs) => logs.some(log =>
              log.type === 'position_change' &&
              log.data.position?.x === 50
            ),
          },
        ],
      },
      {
        name: 'move_up',
        execute: () => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        },
        expectedResults: [
          {
            type: 'position_change',
            validator: (logs) => logs.some(log =>
              log.type === 'position_change' &&
              log.data.position?.y === -50
            ),
          },
        ],
      },
    ],
  }),

  touchGestureWorkflow: (): TestScenario => ({
    name: 'touch_gesture_workflow',
    description: 'Test complete touch gesture interaction workflow',
    actions: [
      {
        name: 'touch_start',
        execute: () => {
          const element = document.querySelector('[data-testid="canvas-area"]');
          if (element) {
            element.dispatchEvent(new TouchEvent('touchstart', {
              touches: [{ clientX: 100, clientY: 100, identifier: 1 } as any],
            }));
          }
        },
        expectedResults: [
          {
            type: 'gesture_start',
            validator: (logs) => logs.some(log => log.type === 'gesture_start'),
          },
        ],
      },
      {
        name: 'touch_move',
        execute: () => {
          const element = document.querySelector('[data-testid="canvas-area"]');
          if (element) {
            element.dispatchEvent(new TouchEvent('touchmove', {
              touches: [{ clientX: 150, clientY: 120, identifier: 1 } as any],
            }));
          }
        },
        expectedResults: [
          {
            type: 'gesture_update',
            validator: (logs) => logs.some(log => log.type === 'gesture_update'),
          },
        ],
      },
      {
        name: 'touch_end',
        execute: () => {
          const element = document.querySelector('[data-testid="canvas-area"]');
          if (element) {
            element.dispatchEvent(new TouchEvent('touchend', {
              changedTouches: [{ clientX: 150, clientY: 120, identifier: 1 } as any],
            }));
          }
        },
        expectedResults: [
          {
            type: 'gesture_end',
            validator: (logs) => logs.some(log => log.type === 'gesture_end'),
          },
        ],
      },
    ],
  }),

  performanceStressTest: (): TestScenario => ({
    name: 'performance_stress_test',
    description: 'Test system performance under rapid interactions',
    actions: [
      {
        name: 'rapid_navigation',
        execute: async () => {
          for (let i = 0; i < 20; i++) {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        },
        expectedResults: [
          {
            type: 'position_change',
            validator: (logs) => logs.filter(log => log.type === 'position_change').length >= 20,
            timeout: 2000,
          },
        ],
      },
    ],
  }),
});