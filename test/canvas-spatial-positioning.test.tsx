/**
 * Canvas Spatial Positioning Test Suite
 *
 * Comprehensive unit tests for spatial section positioning algorithms and grid layout systems.
 * Tests the 2D spatial arrangement of photography workflow sections across different grid configurations.
 *
 * @fileoverview Task 9 Sub-task 3 - Spatial positioning algorithm testing
 * @version 1.0.0
 * @since Task 9 - Unit Testing for Canvas System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SpatialSection } from '../components/SpatialSection';
import {
  calculateSpatialGrid,
  getSectionGridPosition,
  calculateSectionSpacing,
  validateSpatialLayout,
  optimizeSectionPlacement,
  calculateResponsiveScaling
} from '../utils/spatialPositioning';
import type {
  SpatialLayout,
  SpatialCoordinates,
  PhotoWorkflowSection,
  GridConfiguration,
  SectionPlacement
} from '../types/canvas';

// Test fixtures for spatial positioning
const mockSections: PhotoWorkflowSection[] = [
  'capture', 'creative', 'professional', 'thought-leadership', 'ai-github', 'contact'
];

const mockGridConfigs: GridConfiguration[] = [
  { layout: '2x3', rows: 2, cols: 3, width: 400, height: 300 },
  { layout: '3x2', rows: 3, cols: 2, width: 300, height: 400 },
  { layout: '1x6', rows: 1, cols: 6, width: 1200, height: 200 },
  { layout: 'circular', rows: 2, cols: 3, width: 400, height: 300 }
];

const mockViewport = {
  width: 1024,
  height: 768,
  devicePixelRatio: 1
};

describe('Canvas Spatial Positioning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Spatial Grid Calculations', () => {
    it('should calculate grid dimensions for different layouts', () => {
      mockGridConfigs.forEach(config => {
        const grid = calculateSpatialGrid(config, mockViewport);

        expect(grid).toEqual({
          cellWidth: expect.any(Number),
          cellHeight: expect.any(Number),
          totalWidth: expect.any(Number),
          totalHeight: expect.any(Number),
          spacing: expect.any(Number),
          layout: config.layout
        });

        expect(grid.cellWidth).toBeGreaterThan(0);
        expect(grid.cellHeight).toBeGreaterThan(0);
        expect(grid.totalWidth).toBe(config.width);
        expect(grid.totalHeight).toBe(config.height);
      });
    });

    it('should maintain aspect ratios in grid calculations', () => {
      const squareConfig = { layout: '2x2' as SpatialLayout, rows: 2, cols: 2, width: 400, height: 400 };
      const wideConfig = { layout: '1x4' as SpatialLayout, rows: 1, cols: 4, width: 800, height: 200 };

      const squareGrid = calculateSpatialGrid(squareConfig, mockViewport);
      const wideGrid = calculateSpatialGrid(wideConfig, mockViewport);

      // Square grid should have equal cell dimensions
      expect(squareGrid.cellWidth).toBeCloseTo(squareGrid.cellHeight, 10);

      // Wide grid should have cells wider than tall
      expect(wideGrid.cellWidth).toBeGreaterThan(wideGrid.cellHeight);
    });

    it('should adapt to different viewport sizes', () => {
      const smallViewport = { width: 480, height: 320, devicePixelRatio: 1 };
      const largeViewport = { width: 1920, height: 1080, devicePixelRatio: 1 };

      const config = mockGridConfigs[0];
      const smallGrid = calculateSpatialGrid(config, smallViewport);
      const largeGrid = calculateSpatialGrid(config, largeViewport);

      expect(smallGrid.cellWidth).toBeLessThan(largeGrid.cellWidth);
      expect(smallGrid.cellHeight).toBeLessThan(largeGrid.cellHeight);
    });
  });

  describe('Section Grid Position Calculations', () => {
    it('should assign unique grid positions to all sections', () => {
      const config = mockGridConfigs[0]; // 2x3 grid
      const positions = new Set<string>();

      mockSections.forEach(section => {
        const position = getSectionGridPosition(section, config);

        expect(position).toEqual({
          gridX: expect.any(Number),
          gridY: expect.any(Number),
          offsetX: expect.any(Number),
          offsetY: expect.any(Number)
        });

        // Verify grid positions are within bounds
        expect(position.gridX).toBeGreaterThanOrEqual(0);
        expect(position.gridX).toBeLessThan(config.cols);
        expect(position.gridY).toBeGreaterThanOrEqual(0);
        expect(position.gridY).toBeLessThan(config.rows);

        // Track unique positions
        const posKey = `${position.gridX},${position.gridY}`;
        expect(positions.has(posKey)).toBe(false);
        positions.add(posKey);
      });

      expect(positions.size).toBe(Math.min(mockSections.length, config.rows * config.cols));
    });

    it('should place hero section (capture) at strategic position', () => {
      mockGridConfigs.forEach(config => {
        const heroPosition = getSectionGridPosition('capture', config);

        // Hero should be prominently placed (center or top-left)
        if (config.layout === '3x2') {
          // Center position in 3x2 grid
          expect(heroPosition.gridX).toBe(0);
          expect(heroPosition.gridY).toBe(1);
        } else if (config.layout === '2x3') {
          // Center-left in 2x3 grid
          expect(heroPosition.gridX).toBe(1);
          expect(heroPosition.gridY).toBe(0);
        }
      });
    });

    it('should handle circular layout positioning', () => {
      const circularConfig = mockGridConfigs.find(c => c.layout === 'circular')!;
      const positions = mockSections.map(section => getSectionGridPosition(section, circularConfig));

      // Circular layout should distribute sections around a center
      positions.forEach(position => {
        expect(position).toHaveProperty('angle');
        expect(position.angle).toBeGreaterThanOrEqual(0);
        expect(position.angle).toBeLessThan(360);
      });

      // Should have radial distribution
      const angles = positions.map(p => p.angle).filter(a => a !== undefined);
      expect(angles.length).toBeGreaterThan(0);
    });

    it('should calculate section offsets for fine positioning', () => {
      const config = mockGridConfigs[0];
      const position = getSectionGridPosition('creative', config);

      expect(position.offsetX).toBeDefined();
      expect(position.offsetY).toBeDefined();
      expect(typeof position.offsetX).toBe('number');
      expect(typeof position.offsetY).toBe('number');

      // Offsets should be reasonable (within cell bounds)
      const grid = calculateSpatialGrid(config, mockViewport);
      expect(Math.abs(position.offsetX!)).toBeLessThan(grid.cellWidth / 2);
      expect(Math.abs(position.offsetY!)).toBeLessThan(grid.cellHeight / 2);
    });
  });

  describe('Section Spacing and Layout Optimization', () => {
    it('should calculate appropriate spacing between sections', () => {
      const config = mockGridConfigs[0];
      const spacing = calculateSectionSpacing(config, mockViewport);

      expect(spacing).toEqual({
        horizontal: expect.any(Number),
        vertical: expect.any(Number),
        padding: expect.any(Number)
      });

      expect(spacing.horizontal).toBeGreaterThan(0);
      expect(spacing.vertical).toBeGreaterThan(0);
      expect(spacing.padding).toBeGreaterThan(0);

      // Spacing should be proportional to cell size
      const grid = calculateSpatialGrid(config, mockViewport);
      expect(spacing.horizontal).toBeLessThan(grid.cellWidth);
      expect(spacing.vertical).toBeLessThan(grid.cellHeight);
    });

    it('should optimize section placement for visual balance', () => {
      const config = mockGridConfigs[0];
      const placements = mockSections.map(section => ({
        section,
        position: getSectionGridPosition(section, config),
        weight: Math.random() * 100 // Mock content weight
      }));

      const optimized = optimizeSectionPlacement(placements, config);

      expect(optimized).toHaveLength(placements.length);
      optimized.forEach(placement => {
        expect(placement).toEqual({
          section: expect.any(String),
          position: expect.objectContaining({
            gridX: expect.any(Number),
            gridY: expect.any(Number)
          }),
          weight: expect.any(Number),
          priority: expect.any(Number)
        });
      });

      // High-priority sections should be well-positioned
      const highPriority = optimized.filter(p => p.priority > 0.7);
      expect(highPriority.length).toBeGreaterThan(0);
    });

    it('should validate spatial layout configuration', () => {
      const validConfig = mockGridConfigs[0];
      const invalidConfig = {
        layout: '10x10' as SpatialLayout,
        rows: 10,
        cols: 10,
        width: 100,
        height: 100
      };

      const validResult = validateSpatialLayout(validConfig, mockSections);
      const invalidResult = validateSpatialLayout(invalidConfig, mockSections);

      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
      expect(invalidResult.errors.some(error => error.includes('cell size'))).toBe(true);
    });
  });

  describe('Responsive Scaling Calculations', () => {
    it('should calculate responsive scaling factors', () => {
      const baseScale = 1.0;
      const breakpoints = [
        { width: 480, scale: 0.7 },
        { width: 768, scale: 0.85 },
        { width: 1024, scale: 1.0 },
        { width: 1440, scale: 1.2 }
      ];

      breakpoints.forEach(breakpoint => {
        const viewport = { width: breakpoint.width, height: 600, devicePixelRatio: 1 };
        const scaling = calculateResponsiveScaling(baseScale, viewport);

        expect(scaling).toEqual({
          scale: expect.any(Number),
          fontSize: expect.any(Number),
          spacing: expect.any(Number),
          minTouchTarget: expect.any(Number)
        });

        expect(scaling.scale).toBeCloseTo(breakpoint.scale, 0.1);
        expect(scaling.minTouchTarget).toBeGreaterThanOrEqual(44); // Accessibility requirement
      });
    });

    it('should handle high DPI displays', () => {
      const standardDPI = { width: 1024, height: 768, devicePixelRatio: 1 };
      const highDPI = { width: 1024, height: 768, devicePixelRatio: 2 };
      const veryHighDPI = { width: 1024, height: 768, devicePixelRatio: 3 };

      const standardScaling = calculateResponsiveScaling(1.0, standardDPI);
      const highScaling = calculateResponsiveScaling(1.0, highDPI);
      const veryHighScaling = calculateResponsiveScaling(1.0, veryHighDPI);

      // Higher DPI should generally use larger base sizes
      expect(highScaling.fontSize).toBeGreaterThanOrEqual(standardScaling.fontSize);
      expect(veryHighScaling.fontSize).toBeGreaterThanOrEqual(highScaling.fontSize);
    });

    it('should maintain readability at different scales', () => {
      const smallViewport = { width: 320, height: 568, devicePixelRatio: 2 };
      const scaling = calculateResponsiveScaling(1.0, smallViewport);

      // Font size should never be too small
      expect(scaling.fontSize).toBeGreaterThanOrEqual(14);

      // Touch targets should be accessible
      expect(scaling.minTouchTarget).toBeGreaterThanOrEqual(44);

      // Spacing should be proportional
      expect(scaling.spacing).toBeGreaterThan(4);
    });
  });

  describe('SpatialSection Component Integration', () => {
    it('should render sections with correct spatial positioning', () => {
      const mockSpatialCoords: SpatialCoordinates = {
        gridX: 1,
        gridY: 0,
        offsetX: 10,
        offsetY: 5
      };

      const { container } = render(
        <SpatialSection
          section="creative"
          spatialCoords={mockSpatialCoords}
          scale={1.0}
          isActive={false}
        >
          <div data-testid="section-content">Creative Content</div>
        </SpatialSection>
      );

      const sectionElement = container.querySelector('[data-spatial-section="creative"]');
      expect(sectionElement).toBeInTheDocument();

      // Verify positioning styles are applied
      const styles = getComputedStyle(sectionElement!);
      expect(styles.position).toBe('absolute');
      expect(styles.transform).toContain('translate');
    });

    it('should handle scale changes for progressive disclosure', () => {
      const coords: SpatialCoordinates = { gridX: 0, gridY: 0 };
      const { rerender } = render(
        <SpatialSection
          section="professional"
          spatialCoords={coords}
          scale={1.0}
          isActive={false}
        >
          <div data-testid="content">Content</div>
        </SpatialSection>
      );

      // Scale up for detail view
      rerender(
        <SpatialSection
          section="professional"
          spatialCoords={coords}
          scale={1.8}
          isActive={true}
        >
          <div data-testid="content">Content</div>
          <div data-testid="detail-content">Detailed Content</div>
        </SpatialSection>
      );

      const detailContent = screen.queryByTestId('detail-content');
      expect(detailContent).toBeInTheDocument();
    });

    it('should apply athletic design tokens for consistent styling', () => {
      const coords: SpatialCoordinates = { gridX: 2, gridY: 1 };

      const { container } = render(
        <SpatialSection
          section="ai-github"
          spatialCoords={coords}
          scale={1.0}
          isActive={true}
        >
          <div>AI Content</div>
        </SpatialSection>
      );

      const section = container.querySelector('[data-spatial-section="ai-github"]');
      const styles = getComputedStyle(section!);

      // Verify athletic token application
      expect(styles.fontFamily).toBeTruthy();
      expect(styles.color).toBeTruthy();
      expect(styles.transition).toContain('transform');
    });

    it('should handle responsive scaling at component level', () => {
      const coords: SpatialCoordinates = { gridX: 0, gridY: 1 };

      // Mock window resize
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1024 });

      const { container } = render(
        <SpatialSection
          section="contact"
          spatialCoords={coords}
          scale={1.0}
          isActive={false}
          responsive={true}
        >
          <div>Contact Content</div>
        </SpatialSection>
      );

      // Trigger resize event
      fireEvent.resize(window);

      const section = container.querySelector('[data-spatial-section="contact"]');
      expect(section).toBeInTheDocument();

      // Component should adjust to new viewport
      const styles = getComputedStyle(section!);
      expect(styles.transform).toBeTruthy();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid position changes efficiently', () => {
      const coords: SpatialCoordinates = { gridX: 0, gridY: 0 };
      const { rerender } = render(
        <SpatialSection
          section="thought-leadership"
          spatialCoords={coords}
          scale={1.0}
          isActive={false}
        >
          <div>Content</div>
        </SpatialSection>
      );

      const start = performance.now();

      // Rapidly change positions
      for (let i = 0; i < 100; i++) {
        rerender(
          <SpatialSection
            section="thought-leadership"
            spatialCoords={{ gridX: i % 3, gridY: Math.floor(i / 3) % 2 }}
            scale={1.0 + (i % 3) * 0.1}
            isActive={i % 2 === 0}
          >
            <div>Content</div>
          </SpatialSection>
        );
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should handle rapid changes quickly
    });

    it('should validate grid overflow conditions', () => {
      const config = { layout: '2x2' as SpatialLayout, rows: 2, cols: 2, width: 200, height: 200 };
      const tooManySections = [
        'capture', 'creative', 'professional', 'thought-leadership', 'ai-github', 'contact', 'extra1', 'extra2'
      ] as PhotoWorkflowSection[];

      const validation = validateSpatialLayout(config, tooManySections);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.includes('overflow'))).toBe(true);
    });

    it('should handle edge cases in spatial calculations', () => {
      // Zero-size grid
      const zeroConfig = { layout: '1x1' as SpatialLayout, rows: 1, cols: 1, width: 0, height: 0 };
      expect(() => calculateSpatialGrid(zeroConfig, mockViewport)).not.toThrow();

      // Negative offsets
      const negativeCoords: SpatialCoordinates = { gridX: 0, gridY: 0, offsetX: -50, offsetY: -30 };
      expect(() => render(
        <SpatialSection section="capture" spatialCoords={negativeCoords} scale={1.0} isActive={false}>
          <div>Content</div>
        </SpatialSection>
      )).not.toThrow();

      // Extreme scales
      const extremeScales = [0.1, 0.5, 2.0, 5.0];
      extremeScales.forEach(scale => {
        expect(() => calculateResponsiveScaling(scale, mockViewport)).not.toThrow();
      });
    });

    it('should execute spatial calculations efficiently', () => {
      const start = performance.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const randomConfig = mockGridConfigs[i % mockGridConfigs.length];
        const randomSection = mockSections[i % mockSections.length];

        calculateSpatialGrid(randomConfig, mockViewport);
        getSectionGridPosition(randomSection, randomConfig);
        calculateSectionSpacing(randomConfig, mockViewport);
      }

      const duration = performance.now() - start;
      const avgTime = duration / iterations;

      expect(avgTime).toBeLessThan(1); // Should be very fast
      console.log(`✅ Spatial positioning performance: ${avgTime.toFixed(3)}ms average`);
    });
  });
});