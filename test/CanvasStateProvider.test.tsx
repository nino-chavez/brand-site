/**
 * Canvas State Provider Tests
 *
 * Comprehensive test suite for the extracted canvas state management system.
 * Validates state isolation, performance optimization, and integration patterns.
 *
 * @fileoverview Canvas state provider test suite
 * @version 1.0.0
 * @since Task 4 - State Management Integration Optimization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import React, { useEffect } from 'react';
import { CanvasStateProvider, useCanvasState, useCanvasIntegration } from '../contexts/CanvasStateProvider';
import type { CanvasProviderConfig, CanvasPosition } from '../types/canvas-state';
import type { GameFlowSection } from '../types';

// Mock performance API for testing
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    jsHeapSizeLimit: 4294967296,
    totalJSHeapSize: 2000000000,
    usedJSHeapSize: 1500000000
  }
};

vi.stubGlobal('performance', mockPerformance);

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; config?: CanvasProviderConfig }> = ({
  children,
  config
}) => (
  <CanvasStateProvider config={config}>
    {children}
  </CanvasStateProvider>
);

describe('CanvasStateProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Provider Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.state.currentPosition).toEqual({ x: 0, y: 0, scale: 1.0 });
      expect(result.current.state.activeSection).toBe('capture');
      expect(result.current.state.layout).toBe('3x2');
      expect(result.current.state.camera.activeMovement).toBeNull();
      expect(result.current.state.interaction.isPanning).toBe(false);
      expect(result.current.state.interaction.isZooming).toBe(false);
    });

    it('should initialize with custom configuration', () => {
      const customConfig: CanvasProviderConfig = {
        initialPosition: { x: 100, y: 50, scale: 1.5 },
        initialSection: 'exposure',
        initialLayout: '2x3',
        debugConfig: { enabled: true, logStateChanges: true }
      };

      const { result } = renderHook(() => useCanvasState(), {
        wrapper: ({ children }) => <TestWrapper config={customConfig}>{children}</TestWrapper>
      });

      expect(result.current.state.currentPosition).toEqual({ x: 100, y: 50, scale: 1.5 });
      expect(result.current.state.activeSection).toBe('exposure');
      expect(result.current.state.layout).toBe('2x3');
      expect(result.current.debugMode).toBe(true);
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useCanvasState());
      }).toThrow('useCanvasState must be used within a CanvasStateProvider');
    });
  });

  describe('Position Management', () => {
    it('should update canvas position', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      const newPosition: CanvasPosition = { x: 200, y: 100, scale: 1.2 };

      act(() => {
        result.current.actions.updatePosition(newPosition);
      });

      expect(result.current.state.currentPosition).toEqual(newPosition);
    });

    it('should set and clear target position', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      const targetPosition: CanvasPosition = { x: 300, y: 150, scale: 2.0 };

      act(() => {
        result.current.actions.setTargetPosition(targetPosition);
      });

      expect(result.current.state.targetPosition).toEqual(targetPosition);

      act(() => {
        result.current.actions.setTargetPosition(null);
      });

      expect(result.current.state.targetPosition).toBeNull();
    });
  });

  describe('Section Navigation', () => {
    it('should update active section with history tracking', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      expect(result.current.state.activeSection).toBe('capture');
      expect(result.current.state.previousSection).toBeNull();

      act(() => {
        result.current.actions.setActiveSection('exposure');
      });

      expect(result.current.state.activeSection).toBe('exposure');
      expect(result.current.state.previousSection).toBe('capture');

      act(() => {
        result.current.actions.setActiveSection('post-processing');
      });

      expect(result.current.state.activeSection).toBe('post-processing');
      expect(result.current.state.previousSection).toBe('exposure');
    });
  });

  describe('Camera Movement', () => {
    it('should execute camera movements', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      const startTime = 1000;
      const progress = 0.5;

      act(() => {
        result.current.actions.executeCameraMovement('pan-tilt', startTime, progress);
      });

      expect(result.current.state.camera.activeMovement).toBe('pan-tilt');
      expect(result.current.state.camera.movementStartTime).toBe(startTime);
      expect(result.current.state.camera.progress).toBe(progress);
    });

    it('should handle multiple camera movement types', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      const movements = ['zoom-in', 'dolly-zoom', 'rack-focus', 'match-cut'] as const;

      movements.forEach(movement => {
        act(() => {
          result.current.actions.executeCameraMovement(movement, 1000, 0.8);
        });

        expect(result.current.state.camera.activeMovement).toBe(movement);
      });
    });
  });

  describe('Interaction State', () => {
    it('should manage panning state', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      expect(result.current.state.interaction.isPanning).toBe(false);

      act(() => {
        result.current.actions.setPanningState(true);
      });

      expect(result.current.state.interaction.isPanning).toBe(true);

      act(() => {
        result.current.actions.setPanningState(false);
      });

      expect(result.current.state.interaction.isPanning).toBe(false);
    });

    it('should manage zooming state', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      expect(result.current.state.interaction.isZooming).toBe(false);

      act(() => {
        result.current.actions.setZoomingState(true);
      });

      expect(result.current.state.interaction.isZooming).toBe(true);
    });

    it('should update touch state', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      const touchState = {
        initialDistance: 100,
        initialPosition: { x: 50, y: 25, scale: 1.0 }
      };

      act(() => {
        result.current.actions.updateTouchState(touchState);
      });

      expect(result.current.state.interaction.touchState).toEqual(touchState);
    });
  });

  describe('Accessibility Features', () => {
    it('should manage keyboard spatial navigation', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.actions.setKeyboardSpatialNav(false);
      });

      expect(result.current.state.accessibility.keyboardSpatialNav).toBe(false);

      act(() => {
        result.current.actions.setKeyboardSpatialNav(true);
      });

      expect(result.current.state.accessibility.keyboardSpatialNav).toBe(true);
    });

    it('should manage spatial focus', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.actions.setSpatialFocus('exposure');
      });

      expect(result.current.state.accessibility.spatialFocus).toBe('exposure');

      act(() => {
        result.current.actions.setSpatialFocus(null);
      });

      expect(result.current.state.accessibility.spatialFocus).toBeNull();
    });

    it('should manage reduced motion preference', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.actions.setReducedMotion(true);
      });

      expect(result.current.state.accessibility.reducedMotion).toBe(true);
    });
  });

  describe('Layout Management', () => {
    it('should update layout configuration', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      const layouts = ['2x3', '1x6', 'circular'] as const;

      layouts.forEach(layout => {
        act(() => {
          result.current.actions.setLayout(layout);
        });

        expect(result.current.state.layout).toBe(layout);
      });
    });
  });

  describe('Performance Tracking', () => {
    it('should track transitions', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      const transition = {
        from: { x: 0, y: 0, scale: 1.0 },
        to: { x: 100, y: 50, scale: 1.5 },
        movement: 'pan-tilt' as const,
        duration: 600,
        success: true
      };

      act(() => {
        result.current.actions.trackTransition(transition);
      });

      expect(result.current.state.transitionHistory).toHaveLength(1);
      expect(result.current.state.transitionHistory[0]).toMatchObject(transition);
      expect(result.current.state.transitionHistory[0].timestamp).toBeDefined();
    });

    it('should update performance metrics', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      const metrics = {
        canvasRenderFPS: 45,
        averageMovementTime: 800,
        activeOperations: 3
      };

      act(() => {
        result.current.actions.updatePerformanceMetrics(metrics);
      });

      expect(result.current.state.performance.canvasRenderFPS).toBe(45);
      expect(result.current.state.performance.averageMovementTime).toBe(800);
      expect(result.current.state.performance.activeOperations).toBe(3);
    });

    it('should optimize performance', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      // Set some active operations first
      act(() => {
        result.current.actions.updatePerformanceMetrics({ activeOperations: 5 });
      });

      expect(result.current.state.performance.isOptimized).toBe(false);

      act(() => {
        result.current.actions.optimizePerformance();
      });

      expect(result.current.state.performance.isOptimized).toBe(true);
      expect(result.current.state.performance.activeOperations).toBe(4); // Reduced by 1
    });

    it('should limit transition history size', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      // Add more than 100 transitions
      for (let i = 0; i < 105; i++) {
        act(() => {
          result.current.actions.trackTransition({
            from: { x: i, y: i, scale: 1.0 },
            to: { x: i + 1, y: i + 1, scale: 1.0 },
            movement: 'pan-tilt',
            duration: 600,
            success: true
          });
        });
      }

      // Should keep only last 100
      expect(result.current.state.transitionHistory).toHaveLength(100);
      expect(result.current.state.transitionHistory[0].from.x).toBe(5); // First 5 should be dropped
    });
  });

  describe('State Utilities', () => {
    it('should validate state', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      const validation = result.current.actions.validateState();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should get state snapshot', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      const snapshot = result.current.actions.getStateSnapshot();

      expect(snapshot).toEqual(result.current.state);
      expect(snapshot).not.toBe(result.current.state); // Should be a copy
    });

    it('should reset to defaults', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      // Make some changes
      act(() => {
        result.current.actions.updatePosition({ x: 200, y: 100, scale: 2.0 });
        result.current.actions.setActiveSection('exposure');
        result.current.actions.setPanningState(true);
      });

      expect(result.current.state.currentPosition.x).toBe(200);
      expect(result.current.state.activeSection).toBe('exposure');
      expect(result.current.state.interaction.isPanning).toBe(true);

      // Reset to defaults
      act(() => {
        result.current.actions.resetToDefaults();
      });

      expect(result.current.state.currentPosition).toEqual({ x: 0, y: 0, scale: 1.0 });
      expect(result.current.state.activeSection).toBe('capture');
      expect(result.current.state.interaction.isPanning).toBe(false);
    });
  });

  describe('Canvas Integration', () => {
    it('should provide integration utilities', () => {
      const { result } = renderHook(() => {
        const canvasState = useCanvasState();
        const integration = useCanvasIntegration();
        return { canvasState, integration };
      }, {
        wrapper: TestWrapper
      });

      expect(result.current.integration).toBeDefined();
      expect(typeof result.current.integration.syncWithGlobalSection).toBe('function');
      expect(typeof result.current.integration.reportStateChange).toBe('function');
      expect(typeof result.current.integration.resolveStateConflict).toBe('function');
      expect(typeof result.current.integration.validateConsistency).toBe('function');
    });

    it('should sync with global section', () => {
      const { result } = renderHook(() => {
        const canvasState = useCanvasState();
        const integration = useCanvasIntegration();
        return { canvasState, integration };
      }, {
        wrapper: TestWrapper
      });

      expect(result.current.canvasState.state.activeSection).toBe('capture');

      act(() => {
        result.current.integration.syncWithGlobalSection('exposure');
      });

      expect(result.current.canvasState.state.activeSection).toBe('exposure');
    });

    it('should validate consistency', () => {
      const { result } = renderHook(() => useCanvasIntegration(), {
        wrapper: TestWrapper
      });

      const consistency = result.current.validateConsistency();

      expect(consistency.consistent).toBe(true);
      expect(consistency.conflicts).toEqual([]);
    });

    it('should resolve state conflicts', () => {
      const { result } = renderHook(() => useCanvasIntegration(), {
        wrapper: TestWrapper
      });

      // Test critical field conflict resolution (should prefer global)
      const criticalConflict = {
        local: 'capture',
        global: 'exposure',
        field: 'activeSection'
      };

      const resolved = result.current.resolveStateConflict(criticalConflict);
      expect(resolved).toBe('exposure'); // Should prefer global for critical fields

      // Test non-critical field conflict resolution (should prefer local)
      const nonCriticalConflict = {
        local: { x: 100, y: 50, scale: 1.5 },
        global: { x: 0, y: 0, scale: 1.0 },
        field: 'currentPosition'
      };

      const resolvedPosition = result.current.resolveStateConflict(nonCriticalConflict);
      expect(resolvedPosition).toEqual({ x: 100, y: 50, scale: 1.5 }); // Should prefer local
    });
  });

  describe('Performance Configuration', () => {
    it('should enable performance tracking when configured', () => {
      const config: CanvasProviderConfig = {
        performanceConfig: {
          enableTracking: true,
          sampleSize: 30,
          thresholds: { fps: 30, memory: 200, operations: 10 }
        }
      };

      const { result } = renderHook(() => useCanvasState(), {
        wrapper: ({ children }) => <TestWrapper config={config}>{children}</TestWrapper>
      });

      expect(result.current.state.performance).toBeDefined();
      expect(result.current.state.performance.canvasMemoryMB).toBeGreaterThanOrEqual(0);
    });

    it('should respect accessibility configuration', () => {
      const config: CanvasProviderConfig = {
        accessibilityConfig: {
          enableKeyboardNav: false,
          respectReducedMotion: false,
          enableScreenReader: false
        }
      };

      const { result } = renderHook(() => useCanvasState(), {
        wrapper: ({ children }) => <TestWrapper config={config}>{children}</TestWrapper>
      });

      expect(result.current.state.accessibility.keyboardSpatialNav).toBe(false);
      expect(result.current.state.accessibility.reducedMotion).toBe(false);
    });
  });

  describe('Memory Management', () => {
    it('should update memory usage from performance API', () => {
      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      // Memory should be measured and updated
      expect(result.current.state.performance.canvasMemoryMB).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing performance API gracefully', () => {
      // Mock missing performance API
      vi.stubGlobal('performance', undefined);

      const { result } = renderHook(() => useCanvasState(), {
        wrapper: TestWrapper
      });

      expect(result.current.state.performance.canvasMemoryMB).toBe(0);

      // Restore performance mock
      vi.stubGlobal('performance', mockPerformance);
    });
  });
});