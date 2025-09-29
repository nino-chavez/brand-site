/**
 * Canvas Coordinate Transforms Test Suite
 *
 * Comprehensive unit tests for spatial coordinate transformation utilities.
 * Tests the bidirectional conversion between scroll-based and canvas-based coordinate systems.
 *
 * @fileoverview Task 9 Sub-task 1 - Coordinate transformation testing
 * @version 1.0.0
 * @since Task 9 - Unit Testing for Canvas System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  scrollToCanvas,
  canvasToScroll,
  validateCanvasPosition,
  calculateMovementDuration,
  getSectionCanvasPosition,
  applyViewportConstraints
} from '../utils/canvasCoordinateTransforms';
import type { CanvasPosition, ViewportConstraints, SpatialCoordinates } from '../types/canvas';
import type { PhotoWorkflowSection } from '../types/unified-gameflow';

// Test fixtures for coordinate transformations
const mockViewportConstraints: ViewportConstraints = {
  minPosition: { x: -600, y: -400, scale: 0.5 },
  maxPosition: { x: 600, y: 400, scale: 3.0 },
  minScale: 0.5,
  maxScale: 3.0,
  padding: 50
};

const mockSpatialGrid = {
  width: 400,
  height: 300,
  rows: 3,
  cols: 2
};

describe('Canvas Coordinate Transforms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Coordinate Transformations', () => {
    it('should convert scroll position to canvas coordinates', () => {
      const scrollPosition = { x: 100, y: 200 };
      const scale = 1.0;

      const canvasPosition = scrollToCanvas(scrollPosition, scale);

      expect(canvasPosition).toEqual({
        x: expect.any(Number),
        y: expect.any(Number),
        scale: expect.any(Number)
      });

      expect(canvasPosition.scale).toBeCloseTo(scale, 2);
    });

    it('should convert canvas position to scroll coordinates', () => {
      const canvasPosition: CanvasPosition = { x: 150, y: 250, scale: 1.5 };

      const scrollPosition = canvasToScroll(canvasPosition);

      expect(scrollPosition).toEqual({
        x: expect.any(Number),
        y: expect.any(Number)
      });

      // Verify coordinate precision
      expect(scrollPosition.x).toBeCloseTo(150 / 1.5, 2);
      expect(scrollPosition.y).toBeCloseTo(250 / 1.5, 2);
    });

    it('should maintain coordinate precision in bidirectional conversion', () => {
      const originalScroll = { x: 300, y: 400 };
      const scale = 2.0;

      // Convert scroll -> canvas -> scroll
      const canvasPosition = scrollToCanvas(originalScroll, scale);
      const convertedBackScroll = canvasToScroll(canvasPosition);

      expect(convertedBackScroll.x).toBeCloseTo(originalScroll.x, 1);
      expect(convertedBackScroll.y).toBeCloseTo(originalScroll.y, 1);
    });
  });

  describe('Scale-based Transformations', () => {
    it('should handle different scale factors correctly', () => {
      const basePosition = { x: 200, y: 300 };
      const testScales = [0.5, 1.0, 1.5, 2.0, 2.5];

      testScales.forEach(scale => {
        const canvasPosition = scrollToCanvas(basePosition, scale);

        expect(canvasPosition.scale).toBeCloseTo(scale, 2);
        expect(canvasPosition.x).toBeCloseTo(basePosition.x * scale, 2);
        expect(canvasPosition.y).toBeCloseTo(basePosition.y * scale, 2);
      });
    });

    it('should handle edge scale values', () => {
      const position = { x: 100, y: 100 };

      // Test minimum scale
      const minScaleResult = scrollToCanvas(position, mockViewportConstraints.minScale);
      expect(minScaleResult.scale).toBeGreaterThanOrEqual(mockViewportConstraints.minScale);

      // Test maximum scale
      const maxScaleResult = scrollToCanvas(position, mockViewportConstraints.maxScale);
      expect(maxScaleResult.scale).toBeLessThanOrEqual(mockViewportConstraints.maxScale);
    });

    it('should clamp invalid scale values', () => {
      const position = { x: 100, y: 100 };

      // Test below minimum
      const belowMinResult = scrollToCanvas(position, 0.1);
      expect(belowMinResult.scale).toBeGreaterThanOrEqual(mockViewportConstraints.minScale);

      // Test above maximum
      const aboveMaxResult = scrollToCanvas(position, 5.0);
      expect(aboveMaxResult.scale).toBeLessThanOrEqual(mockViewportConstraints.maxScale);
    });
  });

  describe('Viewport Constraint Validation', () => {
    it('should validate canvas position within constraints', () => {
      const validPosition: CanvasPosition = { x: 100, y: 150, scale: 1.5 };

      const validation = validateCanvasPosition(validPosition, mockViewportConstraints);

      expect(validation.success).toBe(true);
      expect(validation.position).toEqual(validPosition);
      expect(validation.error).toBeUndefined();
    });

    it('should detect out-of-bounds positions', () => {
      const outOfBoundsPosition: CanvasPosition = { x: 1000, y: 800, scale: 1.0 };

      const validation = validateCanvasPosition(outOfBoundsPosition, mockViewportConstraints);

      expect(validation.success).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error).toContain('out of bounds');
    });

    it('should apply viewport constraints correctly', () => {
      const unconstrained: CanvasPosition = { x: 1000, y: -800, scale: 0.1 };

      const constrained = applyViewportConstraints(unconstrained, mockViewportConstraints);

      expect(constrained.x).toBeLessThanOrEqual(mockViewportConstraints.maxPosition.x);
      expect(constrained.x).toBeGreaterThanOrEqual(mockViewportConstraints.minPosition.x);
      expect(constrained.y).toBeLessThanOrEqual(mockViewportConstraints.maxPosition.y);
      expect(constrained.y).toBeGreaterThanOrEqual(mockViewportConstraints.minPosition.y);
      expect(constrained.scale).toBeLessThanOrEqual(mockViewportConstraints.maxScale);
      expect(constrained.scale).toBeGreaterThanOrEqual(mockViewportConstraints.minScale);
    });
  });

  describe('Spatial Section Mapping', () => {
    it('should calculate section canvas positions correctly', () => {
      const sections: PhotoWorkflowSection[] = ['capture', 'creative', 'professional'];

      sections.forEach((section, index) => {
        const position = getSectionCanvasPosition(section, mockSpatialGrid);

        expect(position).toEqual({
          x: expect.any(Number),
          y: expect.any(Number),
          scale: expect.any(Number)
        });

        // Verify position is within grid bounds
        expect(position.x).toBeGreaterThanOrEqual(0);
        expect(position.x).toBeLessThanOrEqual(mockSpatialGrid.width * mockSpatialGrid.cols);
        expect(position.y).toBeGreaterThanOrEqual(0);
        expect(position.y).toBeLessThanOrEqual(mockSpatialGrid.height * mockSpatialGrid.rows);
      });
    });

    it('should handle hero section as central anchor', () => {
      const heroPosition = getSectionCanvasPosition('capture', mockSpatialGrid);

      // Hero should be centered in the grid
      const expectedCenterX = (mockSpatialGrid.width * mockSpatialGrid.cols) / 2;
      const expectedCenterY = (mockSpatialGrid.height * mockSpatialGrid.rows) / 2;

      expect(heroPosition.x).toBeCloseTo(expectedCenterX, 10);
      expect(heroPosition.y).toBeCloseTo(expectedCenterY, 10);
    });

    it('should calculate consistent spatial relationships', () => {
      const creativePos = getSectionCanvasPosition('creative', mockSpatialGrid);
      const professionalPos = getSectionCanvasPosition('professional', mockSpatialGrid);

      // Positions should be different but consistent
      expect(creativePos.x).not.toEqual(professionalPos.x);
      expect(creativePos.y).not.toEqual(professionalPos.y);

      // Distance between sections should be reasonable
      const distance = Math.sqrt(
        Math.pow(creativePos.x - professionalPos.x, 2) +
        Math.pow(creativePos.y - professionalPos.y, 2)
      );
      expect(distance).toBeGreaterThan(50); // Minimum separation
      expect(distance).toBeLessThan(1000); // Maximum reasonable distance
    });
  });

  describe('Movement Duration Calculation', () => {
    it('should calculate movement duration based on distance', () => {
      const startPos: CanvasPosition = { x: 0, y: 0, scale: 1.0 };
      const endPos: CanvasPosition = { x: 400, y: 300, scale: 1.5 };

      const duration = calculateMovementDuration(startPos, endPos);

      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThanOrEqual(2000); // Maximum reasonable duration
      expect(typeof duration).toBe('number');
    });

    it('should handle same position (zero movement)', () => {
      const position: CanvasPosition = { x: 100, y: 200, scale: 1.0 };

      const duration = calculateMovementDuration(position, position);

      expect(duration).toBe(0);
    });

    it('should scale duration with movement distance', () => {
      const start: CanvasPosition = { x: 0, y: 0, scale: 1.0 };
      const shortMove: CanvasPosition = { x: 100, y: 100, scale: 1.0 };
      const longMove: CanvasPosition = { x: 500, y: 500, scale: 1.0 };

      const shortDuration = calculateMovementDuration(start, shortMove);
      const longDuration = calculateMovementDuration(start, longMove);

      expect(longDuration).toBeGreaterThan(shortDuration);
    });

    it('should factor in scale changes', () => {
      const start: CanvasPosition = { x: 100, y: 100, scale: 1.0 };
      const positionOnly: CanvasPosition = { x: 200, y: 200, scale: 1.0 };
      const positionAndScale: CanvasPosition = { x: 200, y: 200, scale: 2.0 };

      const positionDuration = calculateMovementDuration(start, positionOnly);
      const combinedDuration = calculateMovementDuration(start, positionAndScale);

      expect(combinedDuration).toBeGreaterThanOrEqual(positionDuration);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle negative coordinates', () => {
      const negativePosition = { x: -200, y: -300 };
      const result = scrollToCanvas(negativePosition, 1.0);

      expect(result.x).toBeDefined();
      expect(result.y).toBeDefined();
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
    });

    it('should handle zero coordinates', () => {
      const zeroPosition = { x: 0, y: 0 };
      const result = scrollToCanvas(zeroPosition, 1.0);

      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeCloseTo(0, 2);
      expect(result.scale).toBeCloseTo(1.0, 2);
    });

    it('should handle extremely large coordinates', () => {
      const largePosition = { x: 999999, y: 999999 };
      const result = scrollToCanvas(largePosition, 1.0);

      expect(result.x).toBeDefined();
      expect(result.y).toBeDefined();
      expect(isNaN(result.x)).toBe(false);
      expect(isNaN(result.y)).toBe(false);
    });

    it('should validate invalid section names gracefully', () => {
      const invalidSection = 'invalid-section' as PhotoWorkflowSection;

      expect(() => {
        getSectionCanvasPosition(invalidSection, mockSpatialGrid);
      }).not.toThrow();
    });
  });

  describe('Performance and Precision', () => {
    it('should execute coordinate transformations efficiently', () => {
      const start = performance.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const scroll = { x: Math.random() * 1000, y: Math.random() * 1000 };
        const canvas = scrollToCanvas(scroll, 1.0 + Math.random());
        canvasToScroll(canvas);
      }

      const duration = performance.now() - start;
      const avgTime = duration / iterations;

      expect(avgTime).toBeLessThan(1); // Should be fast (< 1ms per transform)
      console.log(`✅ Coordinate transformation performance: ${avgTime.toFixed(3)}ms average`);
    });

    it('should maintain precision with repeated transformations', () => {
      let position = { x: 123.456, y: 789.012 };
      const scale = 1.5;

      // Apply transformations multiple times
      for (let i = 0; i < 10; i++) {
        const canvas = scrollToCanvas(position, scale);
        position = canvasToScroll(canvas);
      }

      // Should maintain reasonable precision
      expect(position.x).toBeCloseTo(123.456, 0); // Within 1 pixel
      expect(position.y).toBeCloseTo(789.012, 0);
    });
  });
});