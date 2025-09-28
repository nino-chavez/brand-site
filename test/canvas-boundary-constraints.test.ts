/**
 * Canvas Boundary Constraints Test Suite
 *
 * Comprehensive unit tests for boundary validation and constraint enforcement.
 * Tests viewport bounds checking, position clamping, and edge case handling.
 *
 * @fileoverview Task 9 Sub-task 4 - Boundary constraint validation testing
 * @version 1.0.0
 * @since Task 9 - Unit Testing for Canvas System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateBoundaryConstraints,
  applyBoundaryClipping,
  calculateViewportBounds,
  isPositionWithinBounds,
  clampToViewport,
  handleBoundaryCollision,
  calculateBounceEffect,
  getConstraintViolations
} from '../utils/boundaryConstraints';
import type {
  CanvasPosition,
  ViewportConstraints,
  BoundaryViolation,
  CollisionResponse
} from '../types/canvas';

// Test fixtures for boundary constraints
const mockViewportConstraints: ViewportConstraints = {
  minPosition: { x: -600, y: -400, scale: 0.5 },
  maxPosition: { x: 600, y: 400, scale: 3.0 },
  minScale: 0.5,
  maxScale: 3.0,
  padding: 50
};

const mockViewportBounds = {
  left: -600,
  right: 600,
  top: -400,
  bottom: 400,
  width: 1200,
  height: 800
};

const mockCanvasElements = [
  { id: 'section1', bounds: { x: 100, y: 150, width: 200, height: 100 } },
  { id: 'section2', bounds: { x: 350, y: 250, width: 180, height: 120 } },
  { id: 'section3', bounds: { x: -100, y: -50, width: 150, height: 80 } }
];

describe('Canvas Boundary Constraints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Viewport Bounds Calculation', () => {
    it('should calculate viewport bounds correctly', () => {
      const viewport = { width: 1024, height: 768 };
      const scale = 1.5;

      const bounds = calculateViewportBounds(viewport, scale, mockViewportConstraints);

      expect(bounds).toEqual({
        left: expect.any(Number),
        right: expect.any(Number),
        top: expect.any(Number),
        bottom: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number)
      });

      expect(bounds.width).toBe(bounds.right - bounds.left);
      expect(bounds.height).toBe(bounds.bottom - bounds.top);
      expect(bounds.left).toBeLessThan(bounds.right);
      expect(bounds.top).toBeLessThan(bounds.bottom);
    });

    it('should adjust bounds based on scale factor', () => {
      const viewport = { width: 800, height: 600 };
      const smallScale = 0.8;
      const largeScale = 2.0;

      const smallBounds = calculateViewportBounds(viewport, smallScale, mockViewportConstraints);
      const largeBounds = calculateViewportBounds(viewport, largeScale, mockViewportConstraints);

      // Larger scale should result in tighter effective bounds
      expect(largeBounds.width).toBeLessThan(smallBounds.width);
      expect(largeBounds.height).toBeLessThan(smallBounds.height);
    });

    it('should include padding in bounds calculations', () => {
      const viewport = { width: 400, height: 300 };
      const noPaddingConstraints = { ...mockViewportConstraints, padding: 0 };
      const withPaddingConstraints = { ...mockViewportConstraints, padding: 25 };

      const noPaddingBounds = calculateViewportBounds(viewport, 1.0, noPaddingConstraints);
      const withPaddingBounds = calculateViewportBounds(viewport, 1.0, withPaddingConstraints);

      expect(withPaddingBounds.left).toBeGreaterThan(noPaddingBounds.left);
      expect(withPaddingBounds.right).toBeLessThan(noPaddingBounds.right);
      expect(withPaddingBounds.top).toBeGreaterThan(noPaddingBounds.top);
      expect(withPaddingBounds.bottom).toBeLessThan(noPaddingBounds.bottom);
    });
  });

  describe('Position Validation', () => {
    it('should validate positions within bounds correctly', () => {
      const validPositions: CanvasPosition[] = [
        { x: 0, y: 0, scale: 1.0 },
        { x: 300, y: 200, scale: 1.5 },
        { x: -300, y: -200, scale: 0.8 },
        { x: 500, y: 350, scale: 2.0 }
      ];

      validPositions.forEach(position => {
        const isValid = isPositionWithinBounds(position, mockViewportConstraints);
        expect(isValid).toBe(true);
      });
    });

    it('should detect out-of-bounds positions', () => {
      const invalidPositions: CanvasPosition[] = [
        { x: 1000, y: 0, scale: 1.0 }, // X too large
        { x: 0, y: 800, scale: 1.0 },  // Y too large
        { x: -1000, y: 0, scale: 1.0 }, // X too small
        { x: 0, y: -800, scale: 1.0 },  // Y too small
        { x: 0, y: 0, scale: 5.0 },     // Scale too large
        { x: 0, y: 0, scale: 0.1 }      // Scale too small
      ];

      invalidPositions.forEach(position => {
        const isValid = isPositionWithinBounds(position, mockViewportConstraints);
        expect(isValid).toBe(false);
      });
    });

    it('should handle edge case positions', () => {
      const edgeCases: CanvasPosition[] = [
        { x: mockViewportConstraints.maxPosition.x, y: 0, scale: 1.0 }, // Exactly at max X
        { x: mockViewportConstraints.minPosition.x, y: 0, scale: 1.0 }, // Exactly at min X
        { x: 0, y: mockViewportConstraints.maxPosition.y, scale: 1.0 }, // Exactly at max Y
        { x: 0, y: mockViewportConstraints.minPosition.y, scale: 1.0 }, // Exactly at min Y
        { x: 0, y: 0, scale: mockViewportConstraints.maxScale },        // Exactly at max scale
        { x: 0, y: 0, scale: mockViewportConstraints.minScale }         // Exactly at min scale
      ];

      edgeCases.forEach(position => {
        const isValid = isPositionWithinBounds(position, mockViewportConstraints);
        expect(isValid).toBe(true); // Edge positions should be valid
      });
    });
  });

  describe('Position Clamping', () => {
    it('should clamp out-of-bounds positions correctly', () => {
      const outOfBoundsPositions = [
        { input: { x: 1000, y: 0, scale: 1.0 }, expectedX: mockViewportConstraints.maxPosition.x },
        { input: { x: -1000, y: 0, scale: 1.0 }, expectedX: mockViewportConstraints.minPosition.x },
        { input: { x: 0, y: 800, scale: 1.0 }, expectedY: mockViewportConstraints.maxPosition.y },
        { input: { x: 0, y: -800, scale: 1.0 }, expectedY: mockViewportConstraints.minPosition.y },
        { input: { x: 0, y: 0, scale: 5.0 }, expectedScale: mockViewportConstraints.maxScale },
        { input: { x: 0, y: 0, scale: 0.1 }, expectedScale: mockViewportConstraints.minScale }
      ];

      outOfBoundsPositions.forEach(({ input, expectedX, expectedY, expectedScale }) => {
        const clamped = clampToViewport(input, mockViewportConstraints);

        if (expectedX !== undefined) {
          expect(clamped.x).toBe(expectedX);
        }
        if (expectedY !== undefined) {
          expect(clamped.y).toBe(expectedY);
        }
        if (expectedScale !== undefined) {
          expect(clamped.scale).toBe(expectedScale);
        }

        // Verify clamped position is now valid
        expect(isPositionWithinBounds(clamped, mockViewportConstraints)).toBe(true);
      });
    });

    it('should preserve valid positions during clamping', () => {
      const validPosition: CanvasPosition = { x: 100, y: 150, scale: 1.2 };
      const clamped = clampToViewport(validPosition, mockViewportConstraints);

      expect(clamped).toEqual(validPosition);
    });

    it('should handle multiple constraint violations simultaneously', () => {
      const multiViolation: CanvasPosition = { x: 2000, y: -1000, scale: 10.0 };
      const clamped = clampToViewport(multiViolation, mockViewportConstraints);

      expect(clamped.x).toBe(mockViewportConstraints.maxPosition.x);
      expect(clamped.y).toBe(mockViewportConstraints.minPosition.y);
      expect(clamped.scale).toBe(mockViewportConstraints.maxScale);
      expect(isPositionWithinBounds(clamped, mockViewportConstraints)).toBe(true);
    });
  });

  describe('Boundary Violation Detection', () => {
    it('should identify specific constraint violations', () => {
      const testCases = [
        {
          position: { x: 1000, y: 0, scale: 1.0 },
          expectedViolations: ['x-max']
        },
        {
          position: { x: -1000, y: 0, scale: 1.0 },
          expectedViolations: ['x-min']
        },
        {
          position: { x: 0, y: 800, scale: 1.0 },
          expectedViolations: ['y-max']
        },
        {
          position: { x: 0, y: -800, scale: 1.0 },
          expectedViolations: ['y-min']
        },
        {
          position: { x: 0, y: 0, scale: 5.0 },
          expectedViolations: ['scale-max']
        },
        {
          position: { x: 0, y: 0, scale: 0.1 },
          expectedViolations: ['scale-min']
        },
        {
          position: { x: 1000, y: 800, scale: 5.0 },
          expectedViolations: ['x-max', 'y-max', 'scale-max']
        }
      ];

      testCases.forEach(({ position, expectedViolations }) => {
        const violations = getConstraintViolations(position, mockViewportConstraints);

        expect(violations).toHaveLength(expectedViolations.length);
        expectedViolations.forEach(violation => {
          expect(violations.some(v => v.type === violation)).toBe(true);
        });
      });
    });

    it('should calculate violation severity', () => {
      const minorViolation: CanvasPosition = { x: 610, y: 0, scale: 1.0 }; // 10 units over
      const majorViolation: CanvasPosition = { x: 1200, y: 0, scale: 1.0 }; // 600 units over

      const minorViolations = getConstraintViolations(minorViolation, mockViewportConstraints);
      const majorViolations = getConstraintViolations(majorViolation, mockViewportConstraints);

      expect(minorViolations[0].severity).toBeLessThan(majorViolations[0].severity);
      expect(minorViolations[0].severity).toBeGreaterThan(0);
      expect(majorViolations[0].severity).toBeGreaterThan(minorViolations[0].severity);
    });

    it('should provide corrective suggestions', () => {
      const outOfBounds: CanvasPosition = { x: 1000, y: -800, scale: 5.0 };
      const violations = getConstraintViolations(outOfBounds, mockViewportConstraints);

      violations.forEach(violation => {
        expect(violation).toHaveProperty('suggestion');
        expect(violation.suggestion).toBeTruthy();
        expect(typeof violation.suggestion).toBe('string');
      });
    });
  });

  describe('Collision Handling', () => {
    it('should detect and handle boundary collisions', () => {
      const currentPosition: CanvasPosition = { x: 580, y: 380, scale: 1.0 };
      const targetPosition: CanvasPosition = { x: 700, y: 500, scale: 1.0 }; // Would go out of bounds

      const collision = handleBoundaryCollision(
        currentPosition,
        targetPosition,
        mockViewportConstraints
      );

      expect(collision).toEqual({
        hasCollision: expect.any(Boolean),
        collisionPoint: expect.any(Object),
        adjustedTarget: expect.any(Object),
        collisionType: expect.any(String)
      });

      if (collision.hasCollision) {
        expect(isPositionWithinBounds(collision.adjustedTarget, mockViewportConstraints)).toBe(true);
      }
    });

    it('should calculate appropriate bounce effects', () => {
      const velocity = { x: 50, y: 30 };
      const collisionNormal = { x: -1, y: 0 }; // Hit right wall
      const bounciness = 0.6;

      const bounceEffect = calculateBounceEffect(velocity, collisionNormal, bounciness);

      expect(bounceEffect).toEqual({
        newVelocity: expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number)
        }),
        dampening: expect.any(Number)
      });

      // Velocity should reverse in collision direction
      expect(bounceEffect.newVelocity.x).toBeLessThan(0);
      expect(Math.abs(bounceEffect.newVelocity.x)).toBeLessThan(Math.abs(velocity.x));
    });

    it('should handle soft boundary enforcement', () => {
      const nearBoundary: CanvasPosition = { x: 550, y: 350, scale: 1.0 };
      const softConstraints = { ...mockViewportConstraints, enforcementType: 'soft' as const };

      const validation = validateBoundaryConstraints(nearBoundary, softConstraints);

      expect(validation).toEqual({
        isValid: expect.any(Boolean),
        adjustedPosition: expect.any(Object),
        warnings: expect.any(Array),
        enforcementType: 'soft'
      });

      // Soft enforcement should allow some overshoot with warnings
      if (!validation.isValid) {
        expect(validation.warnings.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Boundary Clipping', () => {
    it('should clip canvas elements to viewport bounds', () => {
      const clippedElements = applyBoundaryClipping(mockCanvasElements, mockViewportBounds);

      expect(clippedElements).toHaveLength(mockCanvasElements.length);

      clippedElements.forEach((element, index) => {
        const original = mockCanvasElements[index];

        expect(element.id).toBe(original.id);
        expect(element.clippedBounds).toBeDefined();

        // Clipped bounds should be within viewport
        expect(element.clippedBounds.x).toBeGreaterThanOrEqual(mockViewportBounds.left);
        expect(element.clippedBounds.y).toBeGreaterThanOrEqual(mockViewportBounds.top);
        expect(element.clippedBounds.x + element.clippedBounds.width).toBeLessThanOrEqual(mockViewportBounds.right);
        expect(element.clippedBounds.y + element.clippedBounds.height).toBeLessThanOrEqual(mockViewportBounds.bottom);
      });
    });

    it('should handle partially visible elements', () => {
      const partiallyVisible = [
        { id: 'partial1', bounds: { x: 550, y: 350, width: 200, height: 150 } }, // Extends beyond right/bottom
        { id: 'partial2', bounds: { x: -100, y: -80, width: 150, height: 100 } }  // Extends beyond left/top
      ];

      const clipped = applyBoundaryClipping(partiallyVisible, mockViewportBounds);

      clipped.forEach(element => {
        expect(element.isPartiallyVisible).toBe(true);
        expect(element.clippedBounds.width).toBeGreaterThan(0);
        expect(element.clippedBounds.height).toBeGreaterThan(0);
        expect(element.clippedBounds.width).toBeLessThanOrEqual(element.originalBounds.width);
        expect(element.clippedBounds.height).toBeLessThanOrEqual(element.originalBounds.height);
      });
    });

    it('should identify completely off-screen elements', () => {
      const offScreenElements = [
        { id: 'offscreen1', bounds: { x: 1000, y: 500, width: 100, height: 100 } },
        { id: 'offscreen2', bounds: { x: -800, y: -600, width: 100, height: 100 } }
      ];

      const clipped = applyBoundaryClipping(offScreenElements, mockViewportBounds);

      clipped.forEach(element => {
        expect(element.isVisible).toBe(false);
        expect(element.clippedBounds.width).toBe(0);
        expect(element.clippedBounds.height).toBe(0);
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid boundary checks efficiently', () => {
      const start = performance.now();
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const randomPosition: CanvasPosition = {
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 1500,
          scale: 0.3 + Math.random() * 3.0
        };

        isPositionWithinBounds(randomPosition, mockViewportConstraints);
        if (!isPositionWithinBounds(randomPosition, mockViewportConstraints)) {
          clampToViewport(randomPosition, mockViewportConstraints);
        }
      }

      const duration = performance.now() - start;
      const avgTime = duration / iterations;

      expect(avgTime).toBeLessThan(0.1); // Should be very fast
      console.log(`✅ Boundary constraint performance: ${avgTime.toFixed(4)}ms average`);
    });

    it('should handle extreme position values', () => {
      const extremePositions: CanvasPosition[] = [
        { x: Number.MAX_SAFE_INTEGER, y: 0, scale: 1.0 },
        { x: Number.MIN_SAFE_INTEGER, y: 0, scale: 1.0 },
        { x: 0, y: Number.MAX_SAFE_INTEGER, scale: 1.0 },
        { x: 0, y: Number.MIN_SAFE_INTEGER, scale: 1.0 },
        { x: 0, y: 0, scale: Number.MAX_SAFE_INTEGER },
        { x: 0, y: 0, scale: Number.MIN_VALUE }
      ];

      extremePositions.forEach(position => {
        expect(() => {
          isPositionWithinBounds(position, mockViewportConstraints);
          clampToViewport(position, mockViewportConstraints);
        }).not.toThrow();
      });
    });

    it('should handle NaN and undefined values gracefully', () => {
      const invalidPositions = [
        { x: NaN, y: 0, scale: 1.0 },
        { x: 0, y: NaN, scale: 1.0 },
        { x: 0, y: 0, scale: NaN },
        { x: undefined as any, y: 0, scale: 1.0 },
        { x: 0, y: undefined as any, scale: 1.0 },
        { x: 0, y: 0, scale: undefined as any }
      ];

      invalidPositions.forEach(position => {
        expect(() => {
          isPositionWithinBounds(position, mockViewportConstraints);
        }).not.toThrow();

        const clamped = clampToViewport(position, mockViewportConstraints);
        expect(isNaN(clamped.x)).toBe(false);
        expect(isNaN(clamped.y)).toBe(false);
        expect(isNaN(clamped.scale)).toBe(false);
      });
    });

    it('should validate constraint consistency', () => {
      const inconsistentConstraints: ViewportConstraints = {
        minPosition: { x: 100, y: 100, scale: 2.0 },
        maxPosition: { x: 50, y: 50, scale: 1.0 }, // Max < Min
        minScale: 2.0,
        maxScale: 1.0, // Max < Min
        padding: 200
      };

      expect(() => {
        validateBoundaryConstraints({ x: 75, y: 75, scale: 1.5 }, inconsistentConstraints);
      }).not.toThrow();

      // Should handle inconsistent constraints gracefully
      const result = validateBoundaryConstraints({ x: 75, y: 75, scale: 1.5 }, inconsistentConstraints);
      expect(result.warnings).toBeDefined();
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});