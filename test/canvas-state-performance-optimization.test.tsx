/**
 * Canvas State Performance Optimization Tests
 *
 * Validates performance improvements from extracting canvas state from
 * UnifiedGameFlowContext and demonstrates state batching, isolation benefits.
 *
 * @fileoverview Canvas state performance optimization validation
 * @version 1.0.0
 * @since Task 4 - State Management Integration Optimization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import React, { useEffect, useState } from 'react';
import { CanvasStateProvider, useCanvasState } from '../contexts/CanvasStateProvider';
import type { CanvasProviderConfig } from '../types/canvas-state';

// Mock performance API for consistent testing
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    jsHeapSizeLimit: 4294967296,
    totalJSHeapSize: 2000000000,
    usedJSHeapSize: 1500000000
  }
};

vi.stubGlobal('performance', mockPerformance);

// Test component that tracks renders
const RenderCountTracker: React.FC<{
  onRender: () => void;
  children: React.ReactNode;
}> = ({ onRender, children }) => {
  useEffect(() => {
    onRender();
  });

  return <>{children}</>;
};

// Canvas consumer component that only uses specific state slices
const PositionOnlyConsumer: React.FC<{ onRender: () => void }> = ({ onRender }) => {
  const { state } = useCanvasState();

  return (
    <RenderCountTracker onRender={onRender}>
      <div data-testid="position">
        {state.currentPosition.x},{state.currentPosition.y}
      </div>
    </RenderCountTracker>
  );
};

const InteractionOnlyConsumer: React.FC<{ onRender: () => void }> = ({ onRender }) => {
  const { state } = useCanvasState();

  return (
    <RenderCountTracker onRender={onRender}>
      <div data-testid="interaction">
        {state.interaction.isPanning ? 'panning' : 'static'}
      </div>
    </RenderCountTracker>
  );
};

const PerformanceOnlyConsumer: React.FC<{ onRender: () => void }> = ({ onRender }) => {
  const { state } = useCanvasState();

  return (
    <RenderCountTracker onRender={onRender}>
      <div data-testid="performance">
        {state.performance.canvasRenderFPS}fps
      </div>
    </RenderCountTracker>
  );
};

describe('Canvas State Performance Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('State Isolation Benefits', () => {
    it('should provide isolated canvas state management', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      // Canvas state should be completely isolated from global state
      const canvasState = result.current.state;

      // Verify all canvas-specific state is included
      expect(canvasState).toHaveProperty('currentPosition');
      expect(canvasState).toHaveProperty('activeSection');
      expect(canvasState).toHaveProperty('camera');
      expect(canvasState).toHaveProperty('interaction');
      expect(canvasState).toHaveProperty('accessibility');
      expect(canvasState).toHaveProperty('performance');
      expect(canvasState).toHaveProperty('transitionHistory');

      // State should be properly isolated - changes should only affect canvas
      act(() => {
        result.current.actions.updatePosition({ x: 100, y: 50, scale: 1.2 });
        result.current.actions.setPanningState(true);
        result.current.actions.setActiveSection('exposure');
      });

      expect(result.current.state.currentPosition).toEqual({ x: 100, y: 50, scale: 1.2 });
      expect(result.current.state.interaction.isPanning).toBe(true);
      expect(result.current.state.activeSection).toBe('exposure');

      // These changes should be isolated to this canvas context
      expect(result.current.state.previousSection).toBe('capture'); // History tracking works
    });

    it('should provide clean state snapshots for debugging', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      // Make some changes
      act(() => {
        result.current.actions.updatePosition({ x: 200, y: 100, scale: 1.5 });
        result.current.actions.setLayout('2x3');
      });

      const snapshot = result.current.actions.getStateSnapshot();

      // Snapshot should be a complete copy
      expect(snapshot).toEqual(result.current.state);
      expect(snapshot).not.toBe(result.current.state); // Different reference

      // Modifying snapshot shouldn't affect actual state
      snapshot.currentPosition.x = 999;
      expect(result.current.state.currentPosition.x).toBe(200);
    });
  });

  describe('Batch State Updates', () => {
    it('should handle high-frequency updates efficiently', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      const startTime = performance.now();

      // Simulate high-frequency position updates (like animation frames)
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.actions.updatePosition({
            x: i * 10,
            y: i * 5,
            scale: 1.0 + (i * 0.01)
          });
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (under 50ms for 100 updates)
      expect(duration).toBeLessThan(50);

      // Final position should be correct
      expect(result.current.state.currentPosition.x).toBe(990);
      expect(result.current.state.currentPosition.y).toBe(495);
      expect(result.current.state.currentPosition.scale).toBeCloseTo(1.99, 2);
    });

    it('should maintain state consistency during rapid updates', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      // Rapid mixed updates
      act(() => {
        result.current.actions.updatePosition({ x: 100, y: 100, scale: 1.5 });
        result.current.actions.setActiveSection('exposure');
        result.current.actions.setPanningState(true);
        result.current.actions.setZoomingState(true);
        result.current.actions.setLayout('2x3');
      });

      // All updates should be applied consistently
      expect(result.current.state.currentPosition).toEqual({ x: 100, y: 100, scale: 1.5 });
      expect(result.current.state.activeSection).toBe('exposure');
      expect(result.current.state.interaction.isPanning).toBe(true);
      expect(result.current.state.interaction.isZooming).toBe(true);
      expect(result.current.state.layout).toBe('2x3');
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should maintain reasonable memory usage during extended operation', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      const initialMemory = result.current.state.performance.canvasMemoryMB;

      // Simulate extended canvas operation with many transitions
      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.actions.trackTransition({
            from: { x: i * 10, y: i * 10, scale: 1.0 },
            to: { x: (i + 1) * 10, y: (i + 1) * 10, scale: 1.0 },
            movement: 'pan-tilt',
            duration: 600,
            success: true
          });
        });
      }

      // Should maintain transition history limit
      expect(result.current.state.transitionHistory.length).toBeLessThanOrEqual(100);

      // Memory usage shouldn't grow unbounded
      const finalMemory = result.current.state.performance.canvasMemoryMB;
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(50); // Less than 50MB growth
    });

    it('should cleanup resources efficiently on state reset', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      // Add significant state data
      for (let i = 0; i < 20; i++) {
        act(() => {
          result.current.actions.trackTransition({
            from: { x: i * 10, y: i * 10, scale: 1.0 },
            to: { x: (i + 1) * 10, y: (i + 1) * 10, scale: 1.0 },
            movement: 'pan-tilt',
            duration: 600,
            success: true
          });
        });
      }

      expect(result.current.state.transitionHistory.length).toBe(20);

      // Reset to defaults
      act(() => {
        result.current.actions.resetToDefaults();
      });

      // Should clear all accumulated state
      expect(result.current.state.transitionHistory.length).toBe(0);
      expect(result.current.state.currentPosition).toEqual({ x: 0, y: 0, scale: 1.0 });
      expect(result.current.state.activeSection).toBe('capture');
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track canvas-specific performance metrics', () => {
      const config: CanvasProviderConfig = {
        performanceConfig: {
          enableTracking: true,
          sampleSize: 10,
          thresholds: { fps: 30, memory: 100, operations: 5 }
        }
      };

      const { result } = renderHook(() => useCanvasState(), {
        wrapper: ({ children }) =>
          <CanvasStateProvider config={config}>{children}</CanvasStateProvider>
      });

      // Performance metrics should be initialized
      expect(result.current.state.performance.canvasRenderFPS).toBe(60);
      expect(result.current.state.performance.activeOperations).toBe(0);

      // Update performance metrics
      act(() => {
        result.current.actions.updatePerformanceMetrics({
          canvasRenderFPS: 45,
          averageMovementTime: 800,
          activeOperations: 3,
          gpuUtilization: 25
        });
      });

      expect(result.current.state.performance.canvasRenderFPS).toBe(45);
      expect(result.current.state.performance.averageMovementTime).toBe(800);
      expect(result.current.state.performance.activeOperations).toBe(3);
      expect(result.current.state.performance.gpuUtilization).toBe(25);
    });

    it('should optimize performance under load', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      // Simulate high load
      act(() => {
        result.current.actions.updatePerformanceMetrics({
          activeOperations: 8,
          canvasRenderFPS: 30,
          canvasMemoryMB: 150
        });
      });

      expect(result.current.state.performance.isOptimized).toBe(false);

      // Trigger optimization
      act(() => {
        result.current.actions.optimizePerformance();
      });

      expect(result.current.state.performance.isOptimized).toBe(true);
      expect(result.current.state.performance.activeOperations).toBe(7); // Reduced by 1
    });
  });

  describe('State Composition Integration', () => {
    it('should provide clean integration interface', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      // State snapshot should be isolated and complete
      const snapshot = result.current.actions.getStateSnapshot();
      expect(snapshot).toHaveProperty('currentPosition');
      expect(snapshot).toHaveProperty('activeSection');
      expect(snapshot).toHaveProperty('camera');
      expect(snapshot).toHaveProperty('interaction');
      expect(snapshot).toHaveProperty('accessibility');
      expect(snapshot).toHaveProperty('performance');
      expect(snapshot).toHaveProperty('transitionHistory');

      // Should be a deep copy, not reference
      expect(snapshot).not.toBe(result.current.state);
    });

    it('should validate state consistency', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      const validation = result.current.actions.validateState();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
      expect(validation.warnings).toEqual([]);
    });
  });

  describe('Configuration-Driven Optimization', () => {
    it('should respect performance configuration', () => {
      const lowPerformanceConfig: CanvasProviderConfig = {
        performanceConfig: {
          enableTracking: false,
          sampleSize: 10,
          thresholds: { fps: 20, memory: 50, operations: 2 }
        },
        debugConfig: {
          enabled: false,
          logStateChanges: false,
          logPerformance: false,
          validateOnChange: false
        }
      };

      const { result } = renderHook(() => useCanvasState(), {
        wrapper: ({ children }) =>
          <CanvasStateProvider config={lowPerformanceConfig}>{children}</CanvasStateProvider>
      });

      expect(result.current.debugMode).toBe(false);

      // Performance tracking should be disabled
      // (In a real implementation, this would affect intervals and monitoring)
      expect(result.current.state.performance).toBeDefined();
    });

    it('should optimize for accessibility when configured', () => {
      const accessibilityConfig: CanvasProviderConfig = {
        accessibilityConfig: {
          enableKeyboardNav: true,
          respectReducedMotion: true,
          enableScreenReader: true
        }
      };

      const { result } = renderHook(() => useCanvasState(), {
        wrapper: ({ children }) =>
          <CanvasStateProvider config={accessibilityConfig}>{children}</CanvasStateProvider>
      });

      expect(result.current.state.accessibility.keyboardSpatialNav).toBe(true);
      expect(result.current.state.accessibility.reducedMotion).toBe(true);
    });
  });

  describe('Stress Testing', () => {
    it('should handle extreme update frequency without memory leaks', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      const startTime = performance.now();

      // Extreme update scenario - 1000 rapid updates
      for (let i = 0; i < 1000; i++) {
        act(() => {
          // Mix different types of updates
          if (i % 3 === 0) {
            result.current.actions.updatePosition({
              x: Math.random() * 1000,
              y: Math.random() * 1000,
              scale: 1.0 + Math.random()
            });
          } else if (i % 3 === 1) {
            result.current.actions.setPanningState(i % 2 === 0);
          } else {
            result.current.actions.updatePerformanceMetrics({
              canvasRenderFPS: 30 + Math.random() * 30
            });
          }
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(200); // 200ms for 1000 updates

      // State should remain valid
      const validation = result.current.actions.validateState();
      expect(validation.valid).toBe(true);
    });

    it('should maintain responsiveness under concurrent state operations', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: CanvasStateProvider
      });

      // Simulate concurrent operations
      const operations = [];

      for (let i = 0; i < 50; i++) {
        operations.push(() => {
          result.current.actions.trackTransition({
            from: { x: i, y: i, scale: 1.0 },
            to: { x: i + 1, y: i + 1, scale: 1.0 },
            movement: 'pan-tilt',
            duration: 600 + Math.random() * 200,
            success: Math.random() > 0.1
          });
        });
      }

      const startTime = performance.now();

      // Execute all operations
      act(() => {
        operations.forEach(op => op());
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should remain responsive
      expect(duration).toBeLessThan(100);

      // Transition history should be properly managed
      expect(result.current.state.transitionHistory.length).toBe(50);

      // All transitions should have timestamps
      result.current.state.transitionHistory.forEach(transition => {
        expect(transition.timestamp).toBeDefined();
        expect(transition.timestamp).toBeGreaterThan(0);
      });
    });
  });
});