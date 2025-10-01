/**
 * Central RequestAnimationFrame Scheduler
 *
 * Coordinates all RAF loops in the application to prevent performance issues
 * from 34+ concurrent requestAnimationFrame callbacks.
 *
 * Features:
 * - Single coordinated RAF loop
 * - Priority-based callback execution
 * - Automatic cleanup
 * - Performance monitoring
 * - Frame budgeting (16ms target)
 *
 * @fileoverview Week 1, Day 3 - RAF Loop Consolidation
 * @version 1.0.0
 * @since 2025-10-01
 */

// Callback types
export type RAFCallback = (timestamp: number, deltaTime: number) => void;
export type RAFUnsubscribe = () => void;

export enum RAFPriority {
  HIGH = 0,    // Critical animations (camera, transitions)
  MEDIUM = 1,  // UI animations (cursor, effects)
  LOW = 2      // Background tasks (performance monitoring)
}

interface ScheduledCallback {
  id: string;
  callback: RAFCallback;
  priority: RAFPriority;
  enabled: boolean;
}

/**
 * Singleton RAF Scheduler
 * Manages a single requestAnimationFrame loop with prioritized callbacks
 */
class RAFScheduler {
  private callbacks: Map<string, ScheduledCallback> = new Map();
  private rafId: number | null = null;
  private lastTimestamp: number = 0;
  private isRunning: boolean = false;
  private frameCount: number = 0;
  private droppedFrames: number = 0;
  private readonly TARGET_FRAME_TIME = 16; // 60fps

  /**
   * Subscribe a callback to the RAF loop
   */
  subscribe(
    id: string,
    callback: RAFCallback,
    priority: RAFPriority = RAFPriority.MEDIUM
  ): RAFUnsubscribe {
    // Prevent duplicate IDs
    if (this.callbacks.has(id)) {
      console.warn(`[RAFScheduler] Duplicate ID "${id}" - previous callback will be replaced`);
    }

    this.callbacks.set(id, {
      id,
      callback,
      priority,
      enabled: true
    });

    // Start loop if not already running
    if (!this.isRunning) {
      this.start();
    }

    // Return unsubscribe function
    return () => this.unsubscribe(id);
  }

  /**
   * Unsubscribe a callback from the RAF loop
   */
  unsubscribe(id: string): void {
    this.callbacks.delete(id);

    // Stop loop if no more callbacks
    if (this.callbacks.size === 0 && this.isRunning) {
      this.stop();
    }
  }

  /**
   * Enable/disable a specific callback without removing it
   */
  setEnabled(id: string, enabled: boolean): void {
    const callback = this.callbacks.get(id);
    if (callback) {
      callback.enabled = enabled;
    }
  }

  /**
   * Start the RAF loop
   */
  private start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  /**
   * Stop the RAF loop
   */
  private stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Main RAF tick function
   */
  private tick = (timestamp: number): void => {
    if (!this.isRunning) return;

    // Calculate delta time
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.frameCount++;

    // Track dropped frames
    if (deltaTime > this.TARGET_FRAME_TIME * 1.5) {
      this.droppedFrames++;
    }

    // Execute callbacks in priority order
    const sortedCallbacks = Array.from(this.callbacks.values())
      .filter(cb => cb.enabled)
      .sort((a, b) => a.priority - b.priority);

    const startTime = performance.now();

    for (const { callback, id } of sortedCallbacks) {
      try {
        callback(timestamp, deltaTime);
      } catch (error) {
        console.error(`[RAFScheduler] Error in callback "${id}":`, error);
        // Continue executing other callbacks
      }

      // Check frame budget
      const elapsed = performance.now() - startTime;
      if (elapsed > this.TARGET_FRAME_TIME) {
        console.warn(`[RAFScheduler] Frame budget exceeded: ${elapsed.toFixed(2)}ms`);
        break; // Skip remaining callbacks to maintain 60fps
      }
    }

    // Schedule next frame
    this.rafId = requestAnimationFrame(this.tick);
  };

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      frameCount: this.frameCount,
      droppedFrames: this.droppedFrames,
      activeCallbacks: Array.from(this.callbacks.values()).filter(cb => cb.enabled).length,
      totalCallbacks: this.callbacks.size,
      isRunning: this.isRunning,
      averageFPS: this.frameCount > 0
        ? Math.round(1000 / (performance.now() - this.lastTimestamp))
        : 0
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.frameCount = 0;
    this.droppedFrames = 0;
  }

  /**
   * Get list of all registered callbacks (for debugging)
   */
  getCallbacks(): Array<{ id: string; priority: RAFPriority; enabled: boolean }> {
    return Array.from(this.callbacks.values()).map(({ id, priority, enabled }) => ({
      id,
      priority,
      enabled
    }));
  }

  /**
   * Force stop all callbacks and reset scheduler
   */
  reset(): void {
    this.stop();
    this.callbacks.clear();
    this.resetMetrics();
  }
}

// Singleton instance
export const rafScheduler = new RAFScheduler();

// Export singleton
export default rafScheduler;
