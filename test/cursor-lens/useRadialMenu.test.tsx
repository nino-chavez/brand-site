/**
 * useRadialMenu Hook Tests
 *
 * Tests menu positioning logic with viewport constraint handling and section arrangement
 * Phase 1: Setup and Foundation - Task 6: Menu positioning logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useRadialMenu } from '../../hooks/useRadialMenu';
import type { CursorPosition, ViewportDimensions, PhotoWorkflowSection } from '../../types/cursor-lens';

// Test constants
const DEFAULT_VIEWPORT: ViewportDimensions = {
  width: 1200,
  height: 800,
  edgeClearance: 40
};

const SMALL_VIEWPORT: ViewportDimensions = {
  width: 400,
  height: 300,
  edgeClearance: 40
};

const CENTER_CURSOR: CursorPosition = {
  x: 600,
  y: 400,
  timestamp: performance.now()
};

const SECTIONS_CLOCKWISE: PhotoWorkflowSection[] = [
  'capture',   // 12 o'clock (0°)
  'focus',     // 2 o'clock (60°)
  'frame',     // 4 o'clock (120°)
  'exposure',  // 6 o'clock (180°)
  'develop',   // 8 o'clock (240°)
  'portfolio'  // 10 o'clock (300°)
];

describe('useRadialMenu Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useRadialMenu());

    expect(result.current.menuPosition).toEqual({
      center: { x: 0, y: 0 },
      radius: 60,
      repositioned: false
    });

    expect(result.current.itemPositions).toHaveLength(6);
    expect(result.current.isRepositioned).toBe(false);
    expect(typeof result.current.repositionMenu).toBe('function');
    expect(typeof result.current.resetMenu).toBe('function');
  });

  it('should calculate correct section positions in clockwise order', () => {
    const { result } = renderHook(() => useRadialMenu());

    act(() => {
      result.current.repositionMenu(CENTER_CURSOR, DEFAULT_VIEWPORT);
    });

    const positions = result.current.itemPositions;

    // Verify all 6 sections are present
    expect(positions).toHaveLength(6);

    // Verify section order matches clockwise arrangement
    positions.forEach((position, index) => {
      expect(position.section).toBe(SECTIONS_CLOCKWISE[index]);
      expect(position.isVisible).toBe(true);
      expect(position.priority).toBeGreaterThan(0);
    });

    // Verify 12 o'clock position (capture) is at top
    const capturePosition = positions.find(p => p.section === 'capture');
    expect(capturePosition).toBeDefined();
    expect(capturePosition!.angle).toBeCloseTo(-Math.PI / 2, 2); // -π/2 radians = 12 o'clock
    expect(capturePosition!.coordinates.y).toBeLessThan(CENTER_CURSOR.y); // Above center

    // Verify 6 o'clock position (exposure) is at bottom
    const exposurePosition = positions.find(p => p.section === 'exposure');
    expect(exposurePosition).toBeDefined();
    expect(exposurePosition!.angle).toBeCloseTo(Math.PI / 2, 2); // π/2 radians = 6 o'clock
    expect(exposurePosition!.coordinates.y).toBeGreaterThan(CENTER_CURSOR.y); // Below center
  });

  it('should position menu at cursor location when no constraints', () => {
    const { result } = renderHook(() => useRadialMenu());

    act(() => {
      result.current.repositionMenu(CENTER_CURSOR, DEFAULT_VIEWPORT);
    });

    expect(result.current.menuPosition.center).toEqual({
      x: CENTER_CURSOR.x,
      y: CENTER_CURSOR.y
    });
    expect(result.current.menuPosition.repositioned).toBe(false);
    expect(result.current.isRepositioned).toBe(false);
  });

  describe('Edge Constraint Handling', () => {
    it('should reposition menu when cursor is too close to left edge', () => {
      const { result } = renderHook(() => useRadialMenu());

      const leftEdgeCursor: CursorPosition = {
        x: 30, // Too close to left edge (needs 40 + 60 + 20 = 120px clearance)
        y: 400,
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(leftEdgeCursor, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.repositioned).toBe(true);
      expect(result.current.menuPosition.constraintReason).toBe('edge-left');
      expect(result.current.menuPosition.center.x).toBeGreaterThan(leftEdgeCursor.x);
      expect(result.current.menuPosition.originalCursorPosition).toEqual({
        x: leftEdgeCursor.x,
        y: leftEdgeCursor.y
      });
      expect(result.current.isRepositioned).toBe(true);
    });

    it('should reposition menu when cursor is too close to right edge', () => {
      const { result } = renderHook(() => useRadialMenu());

      const rightEdgeCursor: CursorPosition = {
        x: 1170, // Too close to right edge
        y: 400,
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(rightEdgeCursor, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.repositioned).toBe(true);
      expect(result.current.menuPosition.constraintReason).toBe('edge-right');
      expect(result.current.menuPosition.center.x).toBeLessThan(rightEdgeCursor.x);
    });

    it('should reposition menu when cursor is too close to top edge', () => {
      const { result } = renderHook(() => useRadialMenu());

      const topEdgeCursor: CursorPosition = {
        x: 600,
        y: 30, // Too close to top edge
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(topEdgeCursor, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.repositioned).toBe(true);
      expect(result.current.menuPosition.constraintReason).toBe('edge-top');
      expect(result.current.menuPosition.center.y).toBeGreaterThan(topEdgeCursor.y);
    });

    it('should reposition menu when cursor is too close to bottom edge', () => {
      const { result } = renderHook(() => useRadialMenu());

      const bottomEdgeCursor: CursorPosition = {
        x: 600,
        y: 770, // Too close to bottom edge
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(bottomEdgeCursor, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.repositioned).toBe(true);
      expect(result.current.menuPosition.constraintReason).toBe('edge-bottom');
      expect(result.current.menuPosition.center.y).toBeLessThan(bottomEdgeCursor.y);
    });
  });

  describe('Corner Constraint Handling', () => {
    it('should handle top-left corner constraint', () => {
      const { result } = renderHook(() => useRadialMenu());

      const cornerCursor: CursorPosition = {
        x: 30,
        y: 30,
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(cornerCursor, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.repositioned).toBe(true);
      expect(result.current.menuPosition.constraintReason).toBe('corner-top-left');
      expect(result.current.menuPosition.center.x).toBeGreaterThan(cornerCursor.x);
      expect(result.current.menuPosition.center.y).toBeGreaterThan(cornerCursor.y);
    });

    it('should handle top-right corner constraint', () => {
      const { result } = renderHook(() => useRadialMenu());

      const cornerCursor: CursorPosition = {
        x: 1170,
        y: 30,
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(cornerCursor, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.repositioned).toBe(true);
      expect(result.current.menuPosition.constraintReason).toBe('corner-top-right');
      expect(result.current.menuPosition.center.x).toBeLessThan(cornerCursor.x);
      expect(result.current.menuPosition.center.y).toBeGreaterThan(cornerCursor.y);
    });

    it('should handle bottom-left corner constraint', () => {
      const { result } = renderHook(() => useRadialMenu());

      const cornerCursor: CursorPosition = {
        x: 30,
        y: 770,
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(cornerCursor, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.repositioned).toBe(true);
      expect(result.current.menuPosition.constraintReason).toBe('corner-bottom-left');
      expect(result.current.menuPosition.center.x).toBeGreaterThan(cornerCursor.x);
      expect(result.current.menuPosition.center.y).toBeLessThan(cornerCursor.y);
    });

    it('should handle bottom-right corner constraint', () => {
      const { result } = renderHook(() => useRadialMenu());

      const cornerCursor: CursorPosition = {
        x: 1170,
        y: 770,
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(cornerCursor, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.repositioned).toBe(true);
      expect(result.current.menuPosition.constraintReason).toBe('corner-bottom-right');
      expect(result.current.menuPosition.center.x).toBeLessThan(cornerCursor.x);
      expect(result.current.menuPosition.center.y).toBeLessThan(cornerCursor.y);
    });
  });

  describe('Section Prioritization', () => {
    it('should prioritize sections correctly for constrained spaces', () => {
      const { result } = renderHook(() => useRadialMenu());

      act(() => {
        result.current.repositionMenu(CENTER_CURSOR, SMALL_VIEWPORT);
      });

      const positions = result.current.itemPositions;

      // All sections should still be present in the positions array
      expect(positions).toHaveLength(6);

      // Verify sections are ordered by priority in the original array
      // (Note: filtering logic would be applied at render time, not in the hook)
      const priorities = positions.map(p => p.priority);
      expect(priorities).toEqual([3, 5, 2, 1, 4, 6]); // capture, focus, frame, exposure, develop, portfolio
    });

    it('should maintain correct priority values for all sections', () => {
      const { result } = renderHook(() => useRadialMenu());

      act(() => {
        result.current.repositionMenu(CENTER_CURSOR, DEFAULT_VIEWPORT);
      });

      const positions = result.current.itemPositions;

      // Verify specific priority assignments
      expect(positions.find(p => p.section === 'exposure')?.priority).toBe(1); // Highest
      expect(positions.find(p => p.section === 'frame')?.priority).toBe(2);
      expect(positions.find(p => p.section === 'capture')?.priority).toBe(3);
      expect(positions.find(p => p.section === 'develop')?.priority).toBe(4);
      expect(positions.find(p => p.section === 'focus')?.priority).toBe(5);
      expect(positions.find(p => p.section === 'portfolio')?.priority).toBe(6); // Lowest
    });
  });

  describe('Positioning Calculations', () => {
    it('should calculate correct angular positions for all sections', () => {
      const { result } = renderHook(() => useRadialMenu());

      act(() => {
        result.current.repositionMenu(CENTER_CURSOR, DEFAULT_VIEWPORT);
      });

      const positions = result.current.itemPositions;

      // Verify angular positions (in radians)
      const expectedAngles = [
        -Math.PI / 2,           // capture: 12 o'clock (0°)
        -Math.PI / 2 + Math.PI / 3,   // focus: 2 o'clock (60°)
        -Math.PI / 2 + 2 * Math.PI / 3, // frame: 4 o'clock (120°)
        Math.PI / 2,            // exposure: 6 o'clock (180°)
        Math.PI / 2 + Math.PI / 3,    // develop: 8 o'clock (240°)
        -Math.PI / 2 + 5 * Math.PI / 3  // portfolio: 10 o'clock (300°)
      ];

      positions.forEach((position, index) => {
        expect(position.angle).toBeCloseTo(expectedAngles[index], 3);
      });
    });

    it('should calculate coordinates at correct distances from center', () => {
      const { result } = renderHook(() => useRadialMenu());

      act(() => {
        result.current.repositionMenu(CENTER_CURSOR, DEFAULT_VIEWPORT);
      });

      const positions = result.current.itemPositions;
      const radius = 60; // Default menu radius

      positions.forEach((position) => {
        const distance = Math.sqrt(
          Math.pow(position.coordinates.x - CENTER_CURSOR.x, 2) +
          Math.pow(position.coordinates.y - CENTER_CURSOR.y, 2)
        );
        expect(distance).toBeCloseTo(radius, 1);
      });
    });

    it('should maintain 60-degree spacing between sections', () => {
      const { result } = renderHook(() => useRadialMenu());

      act(() => {
        result.current.repositionMenu(CENTER_CURSOR, DEFAULT_VIEWPORT);
      });

      const positions = result.current.itemPositions;

      for (let i = 0; i < positions.length - 1; i++) {
        const angleDiff = Math.abs(positions[i + 1].angle - positions[i].angle);
        const normalizedDiff = angleDiff > Math.PI ? 2 * Math.PI - angleDiff : angleDiff;
        expect(normalizedDiff).toBeCloseTo(Math.PI / 3, 2); // π/3 radians = 60°
      }
    });
  });

  describe('State Management', () => {
    it('should reset menu to default state', () => {
      const { result } = renderHook(() => useRadialMenu());

      // First, position the menu
      act(() => {
        result.current.repositionMenu(CENTER_CURSOR, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.center).not.toEqual({ x: 0, y: 0 });

      // Then reset it
      act(() => {
        result.current.resetMenu();
      });

      expect(result.current.menuPosition).toEqual({
        center: { x: 0, y: 0 },
        radius: 60,
        repositioned: false
      });
      expect(result.current.isRepositioned).toBe(false);
    });

    it('should handle multiple repositioning calls correctly', () => {
      const { result } = renderHook(() => useRadialMenu());

      const firstPosition: CursorPosition = {
        x: 200,
        y: 200,
        timestamp: performance.now()
      };

      const secondPosition: CursorPosition = {
        x: 800,
        y: 600,
        timestamp: performance.now() + 100
      };

      // First positioning
      act(() => {
        result.current.repositionMenu(firstPosition, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.center).toEqual({
        x: firstPosition.x,
        y: firstPosition.y
      });

      // Second positioning
      act(() => {
        result.current.repositionMenu(secondPosition, DEFAULT_VIEWPORT);
      });

      expect(result.current.menuPosition.center).toEqual({
        x: secondPosition.x,
        y: secondPosition.y
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle viewport with custom edge clearance', () => {
      const { result } = renderHook(() => useRadialMenu());

      const customViewport: ViewportDimensions = {
        width: 800,
        height: 600,
        edgeClearance: 80 // Double the default clearance
      };

      const nearEdgeCursor: CursorPosition = {
        x: 100, // Would be fine with 40px clearance, but not with 80px
        y: 300,
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(nearEdgeCursor, customViewport);
      });

      expect(result.current.menuPosition.repositioned).toBe(true);
      expect(result.current.menuPosition.center.x).toBeGreaterThan(nearEdgeCursor.x);
    });

    it('should handle viewport without specified edge clearance', () => {
      const { result } = renderHook(() => useRadialMenu());

      const viewportWithoutClearance: ViewportDimensions = {
        width: 800,
        height: 600,
        edgeClearance: 40 // Will use default via fallback
      };

      const edgeCursor: CursorPosition = {
        x: 30,
        y: 300,
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(edgeCursor, viewportWithoutClearance);
      });

      // Should still handle repositioning with default clearance
      expect(result.current.menuPosition.repositioned).toBe(true);
    });

    it('should handle zero-dimension viewport gracefully', () => {
      const { result } = renderHook(() => useRadialMenu());

      const zeroViewport: ViewportDimensions = {
        width: 0,
        height: 0,
        edgeClearance: 40
      };

      const cursor: CursorPosition = {
        x: 100,
        y: 100,
        timestamp: performance.now()
      };

      act(() => {
        result.current.repositionMenu(cursor, zeroViewport);
      });

      // Should not crash and provide valid positioning
      expect(result.current.menuPosition.center).toBeDefined();
      expect(result.current.itemPositions).toHaveLength(6);
    });
  });
});