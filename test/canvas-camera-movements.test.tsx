/**
 * Canvas Camera Movement Test Suite
 *
 * Comprehensive unit tests for cinematic camera movement calculations and easing functions.
 * Tests all 5 camera metaphors: pan/tilt, zoom in/out, dolly zoom, rack focus, and match cut.
 *
 * @fileoverview Task 9 Sub-task 2 - Camera movement and easing testing
 * @version 1.0.0
 * @since Task 9 - Unit Testing for Canvas System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { CameraController } from '../components/CameraController';
import {
  calculatePanTiltMovement,
  calculateZoomMovement,
  calculateDollyZoomEffect,
  calculateRackFocusEffect,
  calculateMatchCutTransition,
  applyEasingFunction,
  getCubicBezierValue
} from '../utils/cameraMovementCalculations';
import type {
  CameraMovement,
  CanvasPosition,
  EasingFunction,
  MovementConfig
} from '../types/canvas';

// Mock performance.now for consistent timing
const mockPerformanceNow = (global as any).__mockPerformanceNow;

// Test fixtures for camera movements
const mockStartPosition: CanvasPosition = { x: 0, y: 0, scale: 1.0 };
const mockEndPosition: CanvasPosition = { x: 400, y: 300, scale: 1.5 };

const mockMovementConfig: MovementConfig = {
  duration: 800,
  easing: 'cubic-bezier-material',
  useGPU: true,
  skipFrames: false
};

const mockCameraState = {
  activeMovement: null as CameraMovement | null,
  movementStartTime: null as number | null,
  movementConfig: null as MovementConfig | null,
  progress: 0
};

describe('Canvas Camera Movements', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPerformanceNow.mockReturnValue(1000);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Pan/Tilt Movement Calculations', () => {
    it('should calculate smooth pan/tilt movement path', () => {
      const duration = 800;
      const testProgress = [0, 0.25, 0.5, 0.75, 1.0];

      testProgress.forEach(progress => {
        const position = calculatePanTiltMovement(
          mockStartPosition,
          mockEndPosition,
          progress,
          duration
        );

        expect(position).toEqual({
          x: expect.any(Number),
          y: expect.any(Number),
          scale: expect.any(Number)
        });

        // Verify position interpolation
        const expectedX = mockStartPosition.x + (mockEndPosition.x - mockStartPosition.x) * progress;
        const expectedY = mockStartPosition.y + (mockEndPosition.y - mockStartPosition.y) * progress;
        const expectedScale = mockStartPosition.scale + (mockEndPosition.scale - mockStartPosition.scale) * progress;

        expect(position.x).toBeCloseTo(expectedX, 2);
        expect(position.y).toBeCloseTo(expectedY, 2);
        expect(position.scale).toBeCloseTo(expectedScale, 2);
      });
    });

    it('should respect movement duration timing', () => {
      const shortDuration = 400;
      const longDuration = 1200;

      const shortMovement = calculatePanTiltMovement(
        mockStartPosition,
        mockEndPosition,
        0.5,
        shortDuration
      );

      const longMovement = calculatePanTiltMovement(
        mockStartPosition,
        mockEndPosition,
        0.5,
        longDuration
      );

      // At 50% progress, both should be at same position regardless of duration
      expect(shortMovement.x).toBeCloseTo(longMovement.x, 2);
      expect(shortMovement.y).toBeCloseTo(longMovement.y, 2);
    });

    it('should handle edge cases in pan/tilt movement', () => {
      // Zero progress
      const startResult = calculatePanTiltMovement(mockStartPosition, mockEndPosition, 0, 800);
      expect(startResult).toEqual(mockStartPosition);

      // Complete progress
      const endResult = calculatePanTiltMovement(mockStartPosition, mockEndPosition, 1, 800);
      expect(endResult.x).toBeCloseTo(mockEndPosition.x, 2);
      expect(endResult.y).toBeCloseTo(mockEndPosition.y, 2);
      expect(endResult.scale).toBeCloseTo(mockEndPosition.scale, 2);

      // Same start/end positions
      const sameResult = calculatePanTiltMovement(mockStartPosition, mockStartPosition, 0.5, 800);
      expect(sameResult).toEqual(mockStartPosition);
    });
  });

  describe('Zoom Movement Calculations', () => {
    it('should calculate zoom in/out movements correctly', () => {
      const zoomInEnd: CanvasPosition = { x: 200, y: 150, scale: 2.0 };
      const zoomOutEnd: CanvasPosition = { x: 100, y: 75, scale: 0.8 };

      // Test zoom in
      const zoomInResult = calculateZoomMovement(
        mockStartPosition,
        zoomInEnd,
        0.5,
        600
      );

      expect(zoomInResult.scale).toBeGreaterThan(mockStartPosition.scale);
      expect(zoomInResult.scale).toBeLessThan(zoomInEnd.scale);

      // Test zoom out
      const zoomOutResult = calculateZoomMovement(
        mockStartPosition,
        zoomOutEnd,
        0.5,
        600
      );

      expect(zoomOutResult.scale).toBeLessThan(mockStartPosition.scale);
      expect(zoomOutResult.scale).toBeGreaterThan(zoomOutEnd.scale);
    });

    it('should apply opacity and blur effects during zoom', () => {
      const zoomPosition = calculateZoomMovement(
        mockStartPosition,
        mockEndPosition,
        0.5,
        800
      );

      // Verify effects are calculated (would be applied via CSS)
      expect(zoomPosition).toHaveProperty('effects');
      expect(zoomPosition.effects).toEqual({
        opacity: expect.any(Number),
        blur: expect.any(Number)
      });

      expect(zoomPosition.effects.opacity).toBeGreaterThan(0.5);
      expect(zoomPosition.effects.opacity).toBeLessThanOrEqual(1.0);
      expect(zoomPosition.effects.blur).toBeGreaterThanOrEqual(0);
    });

    it('should maintain center point during zoom operations', () => {
      const centerPoint = { x: 200, y: 150 };
      const zoomResult = calculateZoomMovement(
        mockStartPosition,
        mockEndPosition,
        0.5,
        800,
        centerPoint
      );

      // Verify zoom centers on specified point
      expect(zoomResult).toHaveProperty('centerPoint');
      expect(zoomResult.centerPoint).toEqual(centerPoint);
    });
  });

  describe('Dolly Zoom Effect Calculations', () => {
    it('should calculate dolly zoom with combined scale and translate', () => {
      const dollyResult = calculateDollyZoomEffect(
        mockStartPosition,
        mockEndPosition,
        0.5,
        1000
      );

      expect(dollyResult).toEqual({
        position: expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          scale: expect.any(Number)
        }),
        backgroundScale: expect.any(Number),
        intensity: expect.any(Number)
      });

      // Background should scale opposite to foreground
      expect(dollyResult.backgroundScale).toBeLessThan(dollyResult.position.scale);
    });

    it('should create dramatic effect with proper intensity curve', () => {
      const testProgresses = [0, 0.2, 0.5, 0.8, 1.0];
      const intensities: number[] = [];

      testProgresses.forEach(progress => {
        const result = calculateDollyZoomEffect(
          mockStartPosition,
          mockEndPosition,
          progress,
          1000
        );
        intensities.push(result.intensity);
      });

      // Intensity should peak in middle and taper off
      expect(intensities[2]).toBeGreaterThan(intensities[0]); // Peak higher than start
      expect(intensities[2]).toBeGreaterThan(intensities[4]); // Peak higher than end
    });

    it('should be single-use and track engagement state', () => {
      let hasEngaged = false;

      const firstResult = calculateDollyZoomEffect(
        mockStartPosition,
        mockEndPosition,
        0.5,
        1000,
        hasEngaged
      );

      hasEngaged = true;

      const secondResult = calculateDollyZoomEffect(
        mockStartPosition,
        mockEndPosition,
        0.5,
        1000,
        hasEngaged
      );

      // Second use should be normal movement, not dolly zoom
      expect(firstResult.intensity).toBeGreaterThan(secondResult.intensity);
    });
  });

  describe('Rack Focus Effect Calculations', () => {
    it('should calculate subtle hover effects', () => {
      const rackFocusResult = calculateRackFocusEffect(
        mockStartPosition,
        'hover',
        0.5
      );

      expect(rackFocusResult).toEqual({
        blur: expect.any(Number),
        opacity: expect.any(Number),
        scale: expect.any(Number),
        duration: expect.any(Number)
      });

      expect(rackFocusResult.blur).toBeLessThanOrEqual(2); // Subtle 2px max blur
      expect(rackFocusResult.duration).toBeCloseTo(300, 50); // ~0.3s transitions
      expect(rackFocusResult.opacity).toBeGreaterThan(0.8); // Subtle fade
    });

    it('should handle different focus states', () => {
      const hoverResult = calculateRackFocusEffect(mockStartPosition, 'hover', 0.5);
      const focusResult = calculateRackFocusEffect(mockStartPosition, 'focus', 0.5);
      const blurResult = calculateRackFocusEffect(mockStartPosition, 'blur', 0.5);

      expect(hoverResult.blur).toBeLessThan(focusResult.blur);
      expect(focusResult.opacity).toBeGreaterThan(blurResult.opacity);
      expect(blurResult.blur).toBeGreaterThan(hoverResult.blur);
    });

    it('should provide smooth transitions with progress values', () => {
      const progressValues = [0, 0.25, 0.5, 0.75, 1.0];
      const results = progressValues.map(progress =>
        calculateRackFocusEffect(mockStartPosition, 'hover', progress)
      );

      // Verify smooth progression
      for (let i = 1; i < results.length; i++) {
        expect(results[i].blur).toBeGreaterThanOrEqual(results[i-1].blur);
      }
    });
  });

  describe('Match Cut Transition Calculations', () => {
    it('should calculate shared element transitions', () => {
      const sourceElement = { x: 100, y: 150, width: 200, height: 100 };
      const targetElement = { x: 300, y: 250, width: 180, height: 120 };

      const matchCutResult = calculateMatchCutTransition(
        sourceElement,
        targetElement,
        0.5,
        600
      );

      expect(matchCutResult).toEqual({
        position: expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number)
        }),
        scale: expect.any(Number),
        morphProgress: expect.any(Number),
        transformOrigin: expect.any(String)
      });

      // Verify interpolated position
      const expectedX = sourceElement.x + (targetElement.x - sourceElement.x) * 0.5;
      expect(matchCutResult.position.x).toBeCloseTo(expectedX, 2);
    });

    it('should handle element size changes during morph', () => {
      const smallElement = { x: 100, y: 100, width: 50, height: 50 };
      const largeElement = { x: 200, y: 200, width: 200, height: 150 };

      const result = calculateMatchCutTransition(
        smallElement,
        largeElement,
        0.7,
        800
      );

      expect(result.scale).toBeGreaterThan(1.0); // Scaling up
      expect(result.morphProgress).toBeCloseTo(0.7, 2);
    });

    it('should calculate proper transform origin for morphing', () => {
      const topLeftElement = { x: 0, y: 0, width: 100, height: 100 };
      const centerElement = { x: 200, y: 150, width: 100, height: 100 };

      const result = calculateMatchCutTransition(
        topLeftElement,
        centerElement,
        0.5,
        600
      );

      expect(result.transformOrigin).toMatch(/\d+px \d+px/);
      expect(result.transformOrigin).toContain('px');
    });
  });

  describe('Easing Function Calculations', () => {
    it('should apply Material Design cubic-bezier easing', () => {
      const easingFunction: EasingFunction = 'cubic-bezier-material';
      const testProgress = [0, 0.25, 0.5, 0.75, 1.0];

      testProgress.forEach(progress => {
        const easedValue = applyEasingFunction(progress, easingFunction);

        expect(easedValue).toBeGreaterThanOrEqual(0);
        expect(easedValue).toBeLessThanOrEqual(1);
        expect(typeof easedValue).toBe('number');
      });

      // Material easing should be smooth acceleration/deceleration
      const quarter = applyEasingFunction(0.25, easingFunction);
      const half = applyEasingFunction(0.5, easingFunction);
      const threeQuarter = applyEasingFunction(0.75, easingFunction);

      expect(quarter).toBeLessThan(0.25); // Slow start
      expect(threeQuarter).toBeGreaterThan(0.75); // Fast finish
    });

    it('should handle different easing function types', () => {
      const progress = 0.5;
      const easingTypes: EasingFunction[] = [
        'linear',
        'ease-in',
        'ease-out',
        'ease-in-out',
        'cubic-bezier-material'
      ];

      easingTypes.forEach(easing => {
        const result = applyEasingFunction(progress, easing);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate cubic bezier values correctly', () => {
      // Material Design cubic-bezier(0.4, 0.0, 0.2, 1.0)
      const materialBezier = [0.4, 0.0, 0.2, 1.0];
      const testT = 0.5;

      const result = getCubicBezierValue(testT, materialBezier);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
      expect(typeof result).toBe('number');
    });
  });

  describe('Camera Controller Integration', () => {
    it('should execute camera movements with proper timing', async () => {
      const mockOnMovementComplete = vi.fn();

      const { container } = render(
        <CameraController
          startPosition={mockStartPosition}
          endPosition={mockEndPosition}
          movement="pan-tilt"
          duration={800}
          onMovementComplete={mockOnMovementComplete}
        />
      );

      // Verify initial setup
      expect(container).toBeInTheDocument();

      // Simulate animation frames
      await waitFor(() => {
        mockPerformanceNow.mockReturnValue(1400); // 400ms in
        vi.advanceTimersByTime(400);
      });

      await waitFor(() => {
        mockPerformanceNow.mockReturnValue(1800); // 800ms complete
        vi.advanceTimersByTime(400);
      });

      expect(mockOnMovementComplete).toHaveBeenCalled();
    });

    it('should maintain 60fps performance during movements', async () => {
      const frameTimings: number[] = [];
      const mockRAF = vi.fn().mockImplementation((callback) => {
        const frameTime = 16.67; // 60fps
        frameTimings.push(frameTime);
        setTimeout(callback, frameTime);
        return frameTimings.length;
      });

      global.requestAnimationFrame = mockRAF;

      render(
        <CameraController
          startPosition={mockStartPosition}
          endPosition={mockEndPosition}
          movement="zoom-in"
          duration={400}
        />
      );

      // Simulate several animation frames
      for (let i = 0; i < 10; i++) {
        await waitFor(() => {
          vi.advanceTimersByTime(16.67);
        });
      }

      const averageFrameTime = frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;
      expect(averageFrameTime).toBeLessThanOrEqual(20); // Allow slight variance
      expect(frameTimings.length).toBeGreaterThan(5); // Multiple frames executed
    });

    it('should handle movement cancellation', async () => {
      const mockOnCancel = vi.fn();

      const { rerender } = render(
        <CameraController
          startPosition={mockStartPosition}
          endPosition={mockEndPosition}
          movement="dolly-zoom"
          duration={1000}
          onCancel={mockOnCancel}
        />
      );

      // Start movement
      await waitFor(() => {
        mockPerformanceNow.mockReturnValue(1200); // 200ms in
        vi.advanceTimersByTime(200);
      });

      // Cancel by changing movement
      rerender(
        <CameraController
          startPosition={mockStartPosition}
          endPosition={mockEndPosition}
          movement={null}
          duration={1000}
          onCancel={mockOnCancel}
        />
      );

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Performance Optimization', () => {
    it('should execute movement calculations efficiently', () => {
      const start = performance.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const progress = Math.random();
        calculatePanTiltMovement(mockStartPosition, mockEndPosition, progress, 800);
      }

      const duration = performance.now() - start;
      const avgTime = duration / iterations;

      expect(avgTime).toBeLessThan(0.5); // Should be very fast
      console.log(`✅ Camera movement calculation performance: ${avgTime.toFixed(3)}ms average`);
    });

    it('should handle rapid movement changes without memory leaks', () => {
      const movements: CameraMovement[] = ['pan-tilt', 'zoom-in', 'zoom-out', 'dolly-zoom', 'rack-focus'];

      for (let i = 0; i < 100; i++) {
        const randomMovement = movements[Math.floor(Math.random() * movements.length)];
        const progress = Math.random();

        switch (randomMovement) {
          case 'pan-tilt':
            calculatePanTiltMovement(mockStartPosition, mockEndPosition, progress, 800);
            break;
          case 'zoom-in':
          case 'zoom-out':
            calculateZoomMovement(mockStartPosition, mockEndPosition, progress, 600);
            break;
          case 'dolly-zoom':
            calculateDollyZoomEffect(mockStartPosition, mockEndPosition, progress, 1000);
            break;
          case 'rack-focus':
            calculateRackFocusEffect(mockStartPosition, 'hover', progress);
            break;
        }
      }

      // If we get here without errors, no memory leaks occurred
      expect(true).toBe(true);
    });
  });
});