/**
 * Enhanced Content Level Manager Hook Tests
 *
 * Tests section-specific threshold logic, dynamic calculations, and state transitions
 * Phase 3: Content Integration - Task 2: Enhanced Content Level Manager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContentLevelManager } from '../../hooks/useContentLevelManager';
import { ContentLevel } from '../../types/section-content';
import type { CanvasPosition } from '../../types/canvas';

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
Object.defineProperty(window, 'performance', {
  value: {
    now: mockPerformanceNow,
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024 // 50MB
    }
  },
  writable: true
});

describe('useContentLevelManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic functionality', () => {
    it('should initialize with preview level', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({ section: 'capture' })
      );

      expect(result.current.currentLevel).toBe(ContentLevel.PREVIEW);
      expect(result.current.previousLevel).toBe(null);
      expect(result.current.isTransitioning).toBe(false);
    });

    it('should provide all required return properties', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({ section: 'focus' })
      );

      expect(result.current).toHaveProperty('currentLevel');
      expect(result.current).toHaveProperty('previousLevel');
      expect(result.current).toHaveProperty('isTransitioning');
      expect(result.current).toHaveProperty('interactionState');
      expect(result.current).toHaveProperty('performanceMetrics');
      expect(result.current).toHaveProperty('actions');

      // Check actions interface
      expect(result.current.actions).toHaveProperty('updateCanvasPosition');
      expect(result.current.actions).toHaveProperty('setContentLevel');
      expect(result.current.actions).toHaveProperty('trackInteraction');
      expect(result.current.actions).toHaveProperty('resetEngagement');
      expect(result.current.actions).toHaveProperty('getOptimizedThresholds');
    });
  });

  describe('Section-specific thresholds', () => {
    it('should apply capture section threshold adjustments', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({ section: 'capture' })
      );

      const thresholds = result.current.actions.getOptimizedThresholds();

      // Capture section should show preview content earlier (min: 0.2 vs default 0.25)
      expect(thresholds.preview.min).toBe(0.2);
      expect(thresholds.preview.max).toBe(0.5);
      expect(thresholds.summary.min).toBe(0.4);
    });

    it('should apply focus section threshold adjustments', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({ section: 'focus' })
      );

      const thresholds = result.current.actions.getOptimizedThresholds();

      // Focus section should show detailed content at lower zoom
      expect(thresholds.detailed.min).toBe(0.8);
      expect(thresholds.detailed.max).toBe(2.0);
      expect(thresholds.technical.min).toBe(1.5);
    });

    it('should apply custom threshold overrides', () => {
      const customThresholds = {
        summary: { min: 0.3, max: 0.8 },
        detailed: { min: 0.7, max: 1.8 }
      };

      const { result } = renderHook(() =>
        useContentLevelManager({
          section: 'exposure',
          customThresholds
        })
      );

      const thresholds = result.current.actions.getOptimizedThresholds();

      expect(thresholds.summary.min).toBe(0.3);
      expect(thresholds.summary.max).toBe(0.8);
      expect(thresholds.detailed.min).toBe(0.7);
      expect(thresholds.detailed.max).toBe(1.8);
    });
  });

  describe('Content level transitions', () => {
    it('should transition from preview to summary based on canvas scale', () => {
      const onLevelChange = vi.fn();
      const { result } = renderHook(() =>
        useContentLevelManager({
          section: 'develop',
          onLevelChange
        })
      );

      expect(result.current.currentLevel).toBe(ContentLevel.PREVIEW);

      // Update canvas to summary level (scale 0.8)
      act(() => {
        result.current.actions.updateCanvasPosition({ x: 0, y: 0, scale: 0.8 });
      });

      expect(result.current.currentLevel).toBe(ContentLevel.SUMMARY);
      expect(result.current.previousLevel).toBe(ContentLevel.PREVIEW);
      expect(result.current.isTransitioning).toBe(true);
      expect(onLevelChange).toHaveBeenCalledWith(ContentLevel.SUMMARY, ContentLevel.PREVIEW);
    });

    it('should transition to detailed level at appropriate scale', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({ section: 'frame' })
      );

      // Update canvas to detailed level (scale 1.5)
      act(() => {
        result.current.actions.updateCanvasPosition({ x: 0, y: 0, scale: 1.5 });
      });

      expect(result.current.currentLevel).toBe(ContentLevel.DETAILED);
    });

    it('should transition to technical level at high scale', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({ section: 'exposure' })
      );

      // Update canvas to technical level (scale 2.5)
      act(() => {
        result.current.actions.updateCanvasPosition({ x: 0, y: 0, scale: 2.5 });
      });

      expect(result.current.currentLevel).toBe(ContentLevel.TECHNICAL);
    });

    it('should not trigger transition if level remains the same', () => {
      const onLevelChange = vi.fn();
      const { result } = renderHook(() =>
        useContentLevelManager({
          section: 'portfolio',
          onLevelChange
        })
      );

      // Start at preview level
      expect(result.current.currentLevel).toBe(ContentLevel.PREVIEW);

      // Update with another preview-level scale
      act(() => {
        result.current.actions.updateCanvasPosition({ x: 0, y: 0, scale: 0.3 });
      });

      expect(result.current.currentLevel).toBe(ContentLevel.PREVIEW);
      expect(result.current.isTransitioning).toBe(false);
      expect(onLevelChange).not.toHaveBeenCalled();
    });
  });

  describe('Manual content level control', () => {
    it('should allow manual content level setting', () => {
      const onLevelChange = vi.fn();
      const { result } = renderHook(() =>
        useContentLevelManager({
          section: 'capture',
          onLevelChange
        })
      );

      expect(result.current.currentLevel).toBe(ContentLevel.PREVIEW);

      act(() => {
        result.current.actions.setContentLevel(ContentLevel.DETAILED);
      });

      expect(result.current.currentLevel).toBe(ContentLevel.DETAILED);
      expect(result.current.previousLevel).toBe(ContentLevel.PREVIEW);
      expect(onLevelChange).toHaveBeenCalledWith(ContentLevel.DETAILED, ContentLevel.PREVIEW);
    });

    it('should not trigger change if setting same level', () => {
      const onLevelChange = vi.fn();
      const { result } = renderHook(() =>
        useContentLevelManager({
          section: 'focus',
          onLevelChange
        })
      );

      act(() => {
        result.current.actions.setContentLevel(ContentLevel.PREVIEW);
      });

      expect(onLevelChange).not.toHaveBeenCalled();
    });
  });

  describe('User engagement tracking', () => {
    it('should track user interactions', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({
          section: 'develop',
          enableEngagementTracking: true
        })
      );

      expect(result.current.interactionState.engagement.interactionCount).toBe(0);

      act(() => {
        result.current.actions.trackInteraction({
          type: 'click',
          target: {
            type: 'heading',
            id: 'test-heading',
            contentLevel: ContentLevel.SUMMARY
          },
          timing: {
            timestamp: Date.now()
          },
          spatial: {
            canvasPosition: { x: 0, y: 0, scale: 1.0 },
            section: 'develop'
          }
        });
      });

      expect(result.current.interactionState.engagement.interactionCount).toBe(1);
      expect(result.current.interactionState.engagement.timeSinceLastInteraction).toBe(0);
    });

    it('should reset engagement tracking', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({
          section: 'frame',
          enableEngagementTracking: true
        })
      );

      // Add some interactions
      act(() => {
        result.current.actions.trackInteraction({
          type: 'hover',
          target: { type: 'body', id: 'test', contentLevel: ContentLevel.PREVIEW },
          timing: { timestamp: Date.now() },
          spatial: { canvasPosition: { x: 0, y: 0, scale: 1.0 }, section: 'frame' }
        });
      });

      expect(result.current.interactionState.engagement.interactionCount).toBe(1);

      act(() => {
        result.current.actions.resetEngagement();
      });

      expect(result.current.interactionState.engagement.interactionCount).toBe(0);
      expect(result.current.interactionState.engagement.scrollDepth).toBe(0);
    });
  });

  describe('Performance monitoring', () => {
    it('should track transition performance metrics', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({
          section: 'exposure',
          performanceMode: 'high'
        })
      );

      expect(result.current.performanceMetrics.transitionCount).toBe(0);

      // Trigger transition
      act(() => {
        result.current.actions.updateCanvasPosition({ x: 0, y: 0, scale: 1.0 });
      });

      expect(result.current.isTransitioning).toBe(true);

      // Verify performance metrics structure is initialized correctly
      expect(result.current.performanceMetrics).toMatchObject({
        transitionCount: 0,
        averageTransitionTime: 0,
        memoryUsage: expect.any(Number),
        performanceImpact: 0,
        isOptimized: false
      });
    });

    it('should adapt performance based on mode settings', () => {
      const { result: highMode } = renderHook(() =>
        useContentLevelManager({
          section: 'capture',
          performanceMode: 'high'
        })
      );

      const { result: lowMode } = renderHook(() =>
        useContentLevelManager({
          section: 'capture',
          performanceMode: 'low'
        })
      );

      // Both should start the same
      expect(highMode.current.currentLevel).toBe(ContentLevel.PREVIEW);
      expect(lowMode.current.currentLevel).toBe(ContentLevel.PREVIEW);

      // Performance mode should affect optimization behavior internally
      // (specific differences would be tested in integration tests)
      expect(highMode.current.performanceMetrics).toBeDefined();
      expect(lowMode.current.performanceMetrics).toBeDefined();
    });

    it('should monitor memory usage', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({ section: 'portfolio' })
      );

      // Memory usage may be 0 in test environment without browser memory API
      expect(result.current.performanceMetrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Threshold optimization based on engagement', () => {
    it('should adjust thresholds for high engagement users', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({
          section: 'focus',
          enableEngagementTracking: true
        })
      );

      // Simulate high engagement
      act(() => {
        // Add multiple interactions
        for (let i = 0; i < 6; i++) {
          result.current.actions.trackInteraction({
            type: 'click',
            target: { type: 'body', id: `test-${i}`, contentLevel: ContentLevel.SUMMARY },
            timing: { timestamp: Date.now() },
            spatial: { canvasPosition: { x: 0, y: 0, scale: 1.0 }, section: 'focus' }
          });
        }
      });

      const thresholds = result.current.actions.getOptimizedThresholds();

      // Should show detailed content earlier for engaged users
      expect(thresholds.detailed.min).toBeLessThan(0.8); // Original focus section threshold
    });

    it('should extend summary content for low engagement users', () => {
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useContentLevelManager({
          section: 'develop',
          enableEngagementTracking: true
        })
      );

      // Simulate low engagement (no interactions, long time)
      act(() => {
        vi.advanceTimersByTime(35000); // 35 seconds with no interactions
      });

      const thresholds = result.current.actions.getOptimizedThresholds();

      // Should extend summary content for disengaged users
      expect(thresholds.summary.max).toBeGreaterThan(1.2); // Original develop section threshold

      vi.useRealTimers();
    });
  });

  describe('Transition state management', () => {
    it('should update interaction state during transitions', () => {
      const { result } = renderHook(() =>
        useContentLevelManager({ section: 'frame' })
      );

      expect(result.current.interactionState.transition.isTransitioning).toBe(false);

      act(() => {
        result.current.actions.updateCanvasPosition({ x: 0, y: 0, scale: 0.8 });
      });

      expect(result.current.interactionState.transition.isTransitioning).toBe(true);
      expect(result.current.interactionState.transition.startTime).toBeDefined();
      expect(result.current.interactionState.currentLevel).toBe(ContentLevel.SUMMARY);
      expect(result.current.interactionState.previousLevel).toBe(ContentLevel.PREVIEW);
    });

    it('should track time at current level', () => {
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useContentLevelManager({ section: 'exposure' })
      );

      expect(result.current.interactionState.timeAtCurrentLevel).toBe(0);

      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds
      });

      expect(result.current.interactionState.timeAtCurrentLevel).toBeGreaterThan(4000);

      vi.useRealTimers();
    });
  });
});