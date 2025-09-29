/**
 * Deterministic Testing Utilities
 *
 * Comprehensive utilities for creating deterministic, timing-independent tests including:
 * - Controlled time progression and frame simulation
 * - Event sequence validation and timing verification
 * - State machine testing with predictable transitions
 * - Asynchronous operation coordination without race conditions
 * - Test environment isolation and cleanup management
 *
 * @fileoverview Deterministic testing utility framework
 * @version 1.0.0
 * @since Task 7.4 - Deterministic Testing for Animation Sequences
 */

import { vi } from 'vitest';

/**
 * Deterministic event scheduler for coordinated test execution
 */
export class DeterministicEventScheduler {
  private currentTime: number = 0;
  private events: Array<{
    id: string;
    executeAt: number;
    callback: () => void | Promise<void>;
    recurring?: number;
    executed?: boolean;
  }> = [];
  private nextEventId: number = 1;

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public scheduleEvent(
    delay: number,
    callback: () => void | Promise<void>,
    options?: { recurring?: number; id?: string }
  ): string {
    const id = options?.id || `event_${this.nextEventId++}`;

    this.events.push({
      id,
      executeAt: this.currentTime + delay,
      callback,
      recurring: options?.recurring,
      executed: false,
    });

    return id;
  }

  public cancelEvent(id: string): boolean {
    const index = this.events.findIndex(event => event.id === id);
    if (index !== -1) {
      this.events.splice(index, 1);
      return true;
    }
    return false;
  }

  public async advanceTime(milliseconds: number): Promise<void> {
    const targetTime = this.currentTime + milliseconds;

    while (this.currentTime < targetTime) {
      // Find next event to execute
      const readyEvents = this.events
        .filter(event => !event.executed && event.executeAt <= targetTime)
        .sort((a, b) => a.executeAt - b.executeAt);

      if (readyEvents.length === 0) {
        // No events to execute, jump to target time
        this.currentTime = targetTime;
        break;
      }

      const nextEvent = readyEvents[0];
      this.currentTime = nextEvent.executeAt;

      // Execute event
      await nextEvent.callback();
      nextEvent.executed = true;

      // Handle recurring events
      if (nextEvent.recurring && nextEvent.recurring > 0) {
        this.events.push({
          ...nextEvent,
          id: `${nextEvent.id}_${Date.now()}`,
          executeAt: this.currentTime + nextEvent.recurring,
          executed: false,
        });
      }
    }

    // Clean up executed non-recurring events
    this.events = this.events.filter(event => !event.executed || event.recurring);
  }

  public getPendingEvents(): Array<{ id: string; executeAt: number; timeRemaining: number }> {
    return this.events
      .filter(event => !event.executed)
      .map(event => ({
        id: event.id,
        executeAt: event.executeAt,
        timeRemaining: event.executeAt - this.currentTime,
      }));
  }

  public clear(): void {
    this.events = [];
    this.currentTime = 0;
    this.nextEventId = 1;
  }
}

/**
 * State machine validator for deterministic state transition testing
 */
export class DeterministicStateMachine<TState, TEvent> {
  private currentState: TState;
  private stateHistory: Array<{
    timestamp: number;
    state: TState;
    event?: TEvent;
    metadata?: any;
  }> = [];
  private transitions: Map<string, (state: TState, event: TEvent) => TState> = new Map();
  private validators: Map<string, (state: TState) => boolean> = new Map();

  constructor(initialState: TState) {
    this.currentState = initialState;
    this.recordState(0, initialState);
  }

  public defineTransition(
    fromState: TState,
    event: TEvent,
    toState: TState | ((currentState: TState, event: TEvent) => TState)
  ): void {
    const key = `${String(fromState)}:${String(event)}`;

    if (typeof toState === 'function') {
      this.transitions.set(key, toState as (state: TState, event: TEvent) => TState);
    } else {
      this.transitions.set(key, () => toState);
    }
  }

  public defineStateValidator(state: TState, validator: (state: TState) => boolean): void {
    this.validators.set(String(state), validator);
  }

  public processEvent(event: TEvent, timestamp: number, metadata?: any): {
    success: boolean;
    previousState: TState;
    newState: TState;
    error?: string;
  } {
    const key = `${String(this.currentState)}:${String(event)}`;
    const transition = this.transitions.get(key);

    if (!transition) {
      return {
        success: false,
        previousState: this.currentState,
        newState: this.currentState,
        error: `No transition defined for ${String(this.currentState)} -> ${String(event)}`,
      };
    }

    const previousState = this.currentState;
    const newState = transition(this.currentState, event);

    // Validate new state
    const validator = this.validators.get(String(newState));
    if (validator && !validator(newState)) {
      return {
        success: false,
        previousState,
        newState: this.currentState,
        error: `State validation failed for ${String(newState)}`,
      };
    }

    this.currentState = newState;
    this.recordState(timestamp, newState, event, metadata);

    return {
      success: true,
      previousState,
      newState,
    };
  }

  public getCurrentState(): TState {
    return this.currentState;
  }

  public getStateHistory(): typeof this.stateHistory {
    return [...this.stateHistory];
  }

  public validateStateSequence(expectedSequence: Array<{ state: TState; maxTimestamp?: number }>): {
    isValid: boolean;
    errors: string[];
    actualSequence: Array<{ state: TState; timestamp: number }>;
  } {
    const errors: string[] = [];
    const actualSequence = this.stateHistory.map(entry => ({
      state: entry.state,
      timestamp: entry.timestamp,
    }));

    if (actualSequence.length < expectedSequence.length) {
      errors.push(`Expected ${expectedSequence.length} states, but only ${actualSequence.length} were recorded`);
    }

    for (let i = 0; i < Math.min(expectedSequence.length, actualSequence.length); i++) {
      const expected = expectedSequence[i];
      const actual = actualSequence[i];

      if (actual.state !== expected.state) {
        errors.push(`State ${i}: expected ${String(expected.state)}, got ${String(actual.state)}`);
      }

      if (expected.maxTimestamp !== undefined && actual.timestamp > expected.maxTimestamp) {
        errors.push(`State ${i}: timestamp ${actual.timestamp} exceeds maximum ${expected.maxTimestamp}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      actualSequence,
    };
  }

  public reset(initialState: TState): void {
    this.currentState = initialState;
    this.stateHistory = [];
    this.recordState(0, initialState);
  }

  private recordState(timestamp: number, state: TState, event?: TEvent, metadata?: any): void {
    this.stateHistory.push({
      timestamp,
      state,
      event,
      metadata,
    });
  }
}

/**
 * Deterministic async operation coordinator
 */
export class DeterministicAsyncCoordinator {
  private pendingOperations: Map<string, {
    promise: Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timeout?: number;
  }> = new Map();
  private completedOperations: Map<string, { result: any; error?: any; completedAt: number }> = new Map();
  private currentTime: number = 0;

  public createOperation<T>(id: string, timeout?: number): {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;
  } {
    let resolve: (value: T) => void;
    let reject: (error: any) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.pendingOperations.set(id, {
      promise,
      resolve: resolve!,
      reject: reject!,
      timeout,
    });

    return { promise, resolve: resolve!, reject: reject! };
  }

  public resolveOperation<T>(id: string, result: T): boolean {
    const operation = this.pendingOperations.get(id);
    if (!operation) return false;

    operation.resolve(result);
    this.pendingOperations.delete(id);
    this.completedOperations.set(id, { result, completedAt: this.currentTime });
    return true;
  }

  public rejectOperation(id: string, error: any): boolean {
    const operation = this.pendingOperations.get(id);
    if (!operation) return false;

    operation.reject(error);
    this.pendingOperations.delete(id);
    this.completedOperations.set(id, { result: null, error, completedAt: this.currentTime });
    return true;
  }

  public async waitForOperations(operationIds: string[], timeout: number = 5000): Promise<{
    completed: string[];
    pending: string[];
    timedOut: boolean;
  }> {
    const startTime = this.currentTime;
    const completed: string[] = [];
    const pending: string[] = [];

    for (const id of operationIds) {
      if (this.completedOperations.has(id)) {
        completed.push(id);
      } else if (this.pendingOperations.has(id)) {
        pending.push(id);
      }
    }

    // In deterministic testing, we control time progression
    // This is a synchronous check since time advancement is manual
    const timedOut = (this.currentTime - startTime) >= timeout;

    return { completed, pending, timedOut };
  }

  public advanceTime(milliseconds: number): void {
    this.currentTime += milliseconds;

    // Check for timed out operations
    for (const [id, operation] of this.pendingOperations.entries()) {
      if (operation.timeout && this.currentTime >= operation.timeout) {
        this.rejectOperation(id, new Error(`Operation ${id} timed out`));
      }
    }
  }

  public getPendingOperations(): string[] {
    return Array.from(this.pendingOperations.keys());
  }

  public getCompletedOperations(): Map<string, { result: any; error?: any; completedAt: number }> {
    return new Map(this.completedOperations);
  }

  public clear(): void {
    // Reject all pending operations
    for (const [id] of this.pendingOperations.entries()) {
      this.rejectOperation(id, new Error('Test cleanup'));
    }
    this.completedOperations.clear();
    this.currentTime = 0;
  }
}

/**
 * Deterministic test environment manager
 */
export class DeterministicTestEnvironment {
  private eventScheduler: DeterministicEventScheduler;
  private asyncCoordinator: DeterministicAsyncCoordinator;
  private mockHandles: Array<() => void> = [];
  private isSetup: boolean = false;

  constructor() {
    this.eventScheduler = new DeterministicEventScheduler();
    this.asyncCoordinator = new DeterministicAsyncCoordinator();
  }

  public setup(): void {
    if (this.isSetup) return;

    // Mock timing functions for deterministic control
    this.mockHandles.push(this.mockPerformanceNow());
    this.mockHandles.push(this.mockRequestAnimationFrame());
    this.mockHandles.push(this.mockSetTimeout());
    this.mockHandles.push(this.mockSetInterval());
    this.mockHandles.push(this.mockDate());

    this.isSetup = true;
  }

  public teardown(): void {
    if (!this.isSetup) return;

    // Restore all mocks
    this.mockHandles.forEach(restore => restore());
    this.mockHandles = [];

    // Clear schedulers
    this.eventScheduler.clear();
    this.asyncCoordinator.clear();

    this.isSetup = false;
  }

  public getEventScheduler(): DeterministicEventScheduler {
    return this.eventScheduler;
  }

  public getAsyncCoordinator(): DeterministicAsyncCoordinator {
    return this.asyncCoordinator;
  }

  public async advanceTime(milliseconds: number): Promise<void> {
    await this.eventScheduler.advanceTime(milliseconds);
    this.asyncCoordinator.advanceTime(milliseconds);
  }

  public createStateMachine<TState, TEvent>(initialState: TState): DeterministicStateMachine<TState, TEvent> {
    return new DeterministicStateMachine<TState, TEvent>(initialState);
  }

  private mockPerformanceNow(): () => void {
    const spy = vi.spyOn(performance, 'now').mockImplementation(() => {
      return this.eventScheduler.getCurrentTime();
    });
    return () => spy.mockRestore();
  }

  private mockRequestAnimationFrame(): () => void {
    const callbacks: Array<{ id: number; callback: FrameRequestCallback }> = [];
    let nextId = 1;

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      const id = nextId++;

      // Schedule callback for next frame (16.67ms at 60fps)
      this.eventScheduler.scheduleEvent(16.67, () => {
        callback(this.eventScheduler.getCurrentTime());
      }, { id: `raf_${id}` });

      return id;
    });

    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id: number) => {
      this.eventScheduler.cancelEvent(`raf_${id}`);
    });

    return () => {
      rafSpy.mockRestore();
      cancelSpy.mockRestore();
    };
  }

  private mockSetTimeout(): () => void {
    const timeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation((callback: Function, delay: number = 0) => {
      const id = `timeout_${Date.now()}_${Math.random()}`;

      this.eventScheduler.scheduleEvent(delay, () => {
        callback();
      }, { id });

      return id as any;
    });

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout').mockImplementation((id: any) => {
      this.eventScheduler.cancelEvent(String(id));
    });

    return () => {
      timeoutSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
    };
  }

  private mockSetInterval(): () => void {
    const intervalSpy = vi.spyOn(global, 'setInterval').mockImplementation((callback: Function, delay: number) => {
      const id = `interval_${Date.now()}_${Math.random()}`;

      this.eventScheduler.scheduleEvent(delay, () => {
        callback();
      }, { id, recurring: delay });

      return id as any;
    });

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval').mockImplementation((id: any) => {
      this.eventScheduler.cancelEvent(String(id));
    });

    return () => {
      intervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    };
  }

  private mockDate(): () => void {
    const originalDate = Date;
    const mockDate = class extends Date {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(this.getCurrentTime());
        } else {
          super(...args);
        }
      }

      static now(): number {
        return this.getCurrentTime();
      }

      private getCurrentTime(): number {
        return this.eventScheduler.getCurrentTime();
      }
    } as any;

    // Copy static methods
    Object.setPrototypeOf(mockDate, originalDate);
    Object.defineProperty(mockDate, 'getCurrentTime', {
      value: () => this.eventScheduler.getCurrentTime(),
    });

    global.Date = mockDate;

    return () => {
      global.Date = originalDate;
    };
  }
}

/**
 * Deterministic test assertion helpers
 */
export class DeterministicAssertions {
  public static assertTimingWindow<T>(
    operation: () => T | Promise<T>,
    expectedMinTime: number,
    expectedMaxTime: number,
    timeProvider: () => number = () => performance.now()
  ): { result: T; actualTime: number; withinWindow: boolean } {
    const startTime = timeProvider();
    const result = operation();
    const endTime = timeProvider();
    const actualTime = endTime - startTime;

    const withinWindow = actualTime >= expectedMinTime && actualTime <= expectedMaxTime;

    return { result, actualTime, withinWindow };
  }

  public static assertSequentialExecution<T>(
    operations: Array<() => T | Promise<T>>,
    timeProvider: () => number = () => performance.now()
  ): {
    results: T[];
    timings: number[];
    wasSequential: boolean;
  } {
    const results: T[] = [];
    const timings: number[] = [];
    let lastEndTime = timeProvider();

    for (const operation of operations) {
      const startTime = timeProvider();
      const result = operation();
      const endTime = timeProvider();

      results.push(result);
      timings.push(endTime - startTime);

      // Check if this operation started after the previous one ended
      if (startTime < lastEndTime) {
        return {
          results,
          timings,
          wasSequential: false,
        };
      }

      lastEndTime = endTime;
    }

    return {
      results,
      timings,
      wasSequential: true,
    };
  }

  public static assertEventOrderingMatches(
    actualEvents: Array<{ timestamp: number; type: string; data?: any }>,
    expectedOrder: string[]
  ): {
    orderMatches: boolean;
    actualOrder: string[];
    mismatches: Array<{ expected: string; actual: string; index: number }>;
  } {
    const actualOrder = actualEvents
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(event => event.type);

    const mismatches: Array<{ expected: string; actual: string; index: number }> = [];

    for (let i = 0; i < Math.max(expectedOrder.length, actualOrder.length); i++) {
      const expected = expectedOrder[i];
      const actual = actualOrder[i];

      if (expected !== actual) {
        mismatches.push({
          expected: expected || '<none>',
          actual: actual || '<none>',
          index: i,
        });
      }
    }

    return {
      orderMatches: mismatches.length === 0,
      actualOrder,
      mismatches,
    };
  }
}

/**
 * Factory function for creating deterministic test environment
 */
export function createDeterministicTestEnvironment(): DeterministicTestEnvironment {
  return new DeterministicTestEnvironment();
}

/**
 * Utility function for creating deterministic test wrapper
 */
export function withDeterministicTiming<T>(
  testFn: (env: DeterministicTestEnvironment) => T | Promise<T>
): () => Promise<T> {
  return async () => {
    const env = createDeterministicTestEnvironment();

    try {
      env.setup();
      const result = await testFn(env);
      return result;
    } finally {
      env.teardown();
    }
  };
}

/**
 * Deterministic wait utilities
 */
export class DeterministicWait {
  public static async forCondition(
    condition: () => boolean,
    timeout: number,
    env: DeterministicTestEnvironment,
    checkInterval: number = 16
  ): Promise<{ success: boolean; timeElapsed: number }> {
    const startTime = env.getEventScheduler().getCurrentTime();
    let timeElapsed = 0;

    while (timeElapsed < timeout) {
      if (condition()) {
        return { success: true, timeElapsed };
      }

      await env.advanceTime(checkInterval);
      timeElapsed = env.getEventScheduler().getCurrentTime() - startTime;
    }

    return { success: false, timeElapsed };
  }

  public static async forEvents(
    eventIds: string[],
    timeout: number,
    env: DeterministicTestEnvironment
  ): Promise<{ completed: string[]; pending: string[]; timedOut: boolean }> {
    return env.getAsyncCoordinator().waitForOperations(eventIds, timeout);
  }

  public static async forFrames(
    frameCount: number,
    env: DeterministicTestEnvironment
  ): Promise<void> {
    const frameTime = 16.67; // 60 FPS
    await env.advanceTime(frameCount * frameTime);
  }
}