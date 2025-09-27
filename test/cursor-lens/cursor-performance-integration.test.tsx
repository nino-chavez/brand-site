/**
 * Cursor Performance Integration Test
 *
 * Tests the integration of cursor performance tracking with UnifiedGameFlowContext
 * Phase 1: Setup and Foundation - Task 3: Performance Monitoring Integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import {
  UnifiedGameFlowProvider,
  useUnifiedGameFlow,
  useUnifiedCursorPerformance
} from '../../contexts/UnifiedGameFlowContext';
import type { ActivationMethod, CursorPerformanceMetrics } from '../../types/cursor-lens';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UnifiedGameFlowProvider debugMode={true}>
    {children}
  </UnifiedGameFlowProvider>
);

describe('Cursor Performance Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize cursor performance state correctly', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    expect(result.current.state).toEqual({
      isTracking: false,
      metrics: {
        cursorTrackingFPS: 60,
        averageResponseTime: 8,
        memoryUsage: 0,
        activationLatency: 50,
        menuRenderTime: 8,
        sessionDuration: 0
      },
      degradationLevel: 'none',
      optimizationApplied: false,
      activationHistory: [],
      sessionStats: {
        totalActivations: 0,
        averageLatency: 0,
        frameDropEvents: 0,
        memoryLeakDetected: false,
        sessionStartTime: expect.any(Number)
      }
    });
  });

  it('should start and stop cursor tracking', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    // Start tracking
    act(() => {
      result.current.actions.startTracking();
    });

    expect(result.current.state.isTracking).toBe(true);
    expect(result.current.state.sessionStats.sessionStartTime).toBeGreaterThan(0);

    // Stop tracking
    act(() => {
      result.current.actions.stopTracking();
    });

    expect(result.current.state.isTracking).toBe(false);
  });

  it('should update cursor performance metrics', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    const metricsUpdate: Partial<CursorPerformanceMetrics> = {
      cursorTrackingFPS: 55,
      averageResponseTime: 12,
      memoryUsage: 15
    };

    act(() => {
      result.current.actions.updateMetrics(metricsUpdate);
    });

    expect(result.current.state.metrics.cursorTrackingFPS).toBe(55);
    expect(result.current.state.metrics.averageResponseTime).toBe(12);
    expect(result.current.state.metrics.memoryUsage).toBe(15);
    expect(result.current.state.metrics.activationLatency).toBe(50); // unchanged
  });

  it('should track activation events correctly', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    const method: ActivationMethod = 'click-hold';
    const latency = 85;
    const success = true;

    act(() => {
      result.current.actions.trackActivation(method, latency, success);
    });

    expect(result.current.state.activationHistory).toHaveLength(1);
    expect(result.current.state.activationHistory[0]).toEqual({
      method,
      latency,
      success,
      timestamp: expect.any(Number)
    });

    expect(result.current.state.sessionStats.totalActivations).toBe(1);
    expect(result.current.state.sessionStats.averageLatency).toBe(85);
  });

  it('should calculate average latency correctly with multiple activations', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    // First activation
    act(() => {
      result.current.actions.trackActivation('click-hold', 100, true);
    });

    // Second activation
    act(() => {
      result.current.actions.trackActivation('hover', 60, true);
    });

    expect(result.current.state.sessionStats.totalActivations).toBe(2);
    expect(result.current.state.sessionStats.averageLatency).toBe(80); // (100 + 60) / 2
  });

  it('should detect performance degradation correctly', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    // Update metrics to trigger high degradation
    act(() => {
      result.current.actions.updateMetrics({
        cursorTrackingFPS: 25, // Below 30fps threshold
        averageResponseTime: 40 // Above 32ms threshold
      });
    });

    const degradationLevel = result.current.actions.detectDegradation();
    expect(degradationLevel).toBe('high');

    // Update metrics to trigger moderate degradation
    act(() => {
      result.current.actions.updateMetrics({
        cursorTrackingFPS: 40, // Below 45fps threshold
        averageResponseTime: 28 // Above 24ms threshold
      });
    });

    const moderateDegradation = result.current.actions.detectDegradation();
    expect(moderateDegradation).toBe('moderate');

    // Update metrics to no degradation
    act(() => {
      result.current.actions.updateMetrics({
        cursorTrackingFPS: 58,
        averageResponseTime: 12
      });
    });

    const noDegradation = result.current.actions.detectDegradation();
    expect(noDegradation).toBe('none');
  });

  it('should apply performance optimization correctly', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.actions.applyOptimization('moderate');
    });

    expect(result.current.state.degradationLevel).toBe('moderate');
    expect(result.current.state.optimizationApplied).toBe(true);

    act(() => {
      result.current.actions.applyOptimization('none');
    });

    expect(result.current.state.degradationLevel).toBe('none');
    expect(result.current.state.optimizationApplied).toBe(false);
  });

  it('should report frame drops correctly', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.actions.reportFrameDrop(5);
    });

    expect(result.current.state.sessionStats.frameDropEvents).toBe(5);

    act(() => {
      result.current.actions.reportFrameDrop(3);
    });

    expect(result.current.state.sessionStats.frameDropEvents).toBe(8);
  });

  it('should check for memory leaks correctly', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    // Update memory usage below threshold
    act(() => {
      result.current.actions.updateMetrics({ memoryUsage: 30 });
    });

    const noLeak = result.current.actions.checkMemoryLeak();
    expect(noLeak).toBe(false);
    expect(result.current.state.sessionStats.memoryLeakDetected).toBe(false);

    // Update memory usage above threshold
    act(() => {
      result.current.actions.updateMetrics({ memoryUsage: 60 });
    });

    let hasLeak: boolean;
    act(() => {
      hasLeak = result.current.actions.checkMemoryLeak();
    });

    expect(hasLeak!).toBe(true);
    expect(result.current.state.sessionStats.memoryLeakDetected).toBe(true);
  });

  it('should get optimized update intervals based on degradation level', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    // No degradation - 60fps (16ms)
    expect(result.current.actions.getOptimizedUpdateInterval()).toBe(16);

    // Low degradation - 50fps (20ms)
    act(() => {
      result.current.actions.applyOptimization('low');
    });
    expect(result.current.actions.getOptimizedUpdateInterval()).toBe(20);

    // Moderate degradation - 45fps (22ms)
    act(() => {
      result.current.actions.applyOptimization('moderate');
    });
    expect(result.current.actions.getOptimizedUpdateInterval()).toBe(22);

    // High degradation - 30fps (33ms)
    act(() => {
      result.current.actions.applyOptimization('high');
    });
    expect(result.current.actions.getOptimizedUpdateInterval()).toBe(33);
  });

  it('should determine when to degrade quality correctly', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    // No degradation and good FPS
    expect(result.current.actions.shouldDegradeQuality()).toBe(false);

    // Apply optimization
    act(() => {
      result.current.actions.applyOptimization('low');
    });
    expect(result.current.actions.shouldDegradeQuality()).toBe(true);

    // Reset optimization but low FPS
    act(() => {
      result.current.actions.applyOptimization('none');
      result.current.actions.updateMetrics({ cursorTrackingFPS: 40 });
    });
    expect(result.current.actions.shouldDegradeQuality()).toBe(true);
  });

  it('should reset session stats correctly', () => {
    const { result } = renderHook(() => useUnifiedCursorPerformance(), {
      wrapper: TestWrapper
    });

    // Add some data
    act(() => {
      result.current.actions.trackActivation('click-hold', 100, true);
      result.current.actions.reportFrameDrop(5);
      result.current.actions.updateMetrics({ memoryUsage: 60 });
    });

    act(() => {
      result.current.actions.checkMemoryLeak();
    });

    expect(result.current.state.activationHistory).toHaveLength(1);
    expect(result.current.state.sessionStats.totalActivations).toBe(1);
    expect(result.current.state.sessionStats.frameDropEvents).toBe(5);
    expect(result.current.state.sessionStats.memoryLeakDetected).toBe(true);

    // Reset session stats
    act(() => {
      result.current.actions.resetSessionStats();
    });

    expect(result.current.state.activationHistory).toHaveLength(0);
    expect(result.current.state.sessionStats).toEqual({
      totalActivations: 0,
      averageLatency: 0,
      frameDropEvents: 0,
      memoryLeakDetected: false,
      sessionStartTime: expect.any(Number)
    });
  });

  it('should integrate with main UnifiedGameFlow context', () => {
    const { result } = renderHook(() => useUnifiedGameFlow(), {
      wrapper: TestWrapper
    });

    // Verify cursor performance is part of main state
    expect(result.current.state.performance.cursor).toBeDefined();
    expect(result.current.actions.performance.cursor).toBeDefined();

    // Test that cursor actions work through main context
    act(() => {
      result.current.actions.performance.cursor.startTracking();
    });

    expect(result.current.state.performance.cursor.isTracking).toBe(true);
  });
});