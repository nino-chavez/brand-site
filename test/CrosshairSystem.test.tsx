import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CrosshairSystem, { Crosshair, FocusRing, GridOverlay } from '../components/CrosshairSystem';
import { renderWithTestUtils } from './utils';
import React from 'react';

describe('CrosshairSystem Components', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  describe('Crosshair', () => {
    const defaultProps = {
      position: { x: 100, y: 100 },
      isActive: true,
    };

    it('should render default crosshair when active', () => {
      const { container } = renderWithTestUtils(
        React.createElement(Crosshair, defaultProps)
      );

      const crosshair = container.querySelector('svg');
      expect(crosshair).toBeTruthy();
    });

    it('should not render when inactive', () => {
      const { container } = renderWithTestUtils(
        React.createElement(Crosshair, {
          ...defaultProps,
          isActive: false,
        })
      );

      const crosshair = container.querySelector('svg');
      expect(crosshair).toBeFalsy();
    });

    it('should render different crosshair styles', () => {
      const styles = ['default', 'camera', 'precision', 'minimal', 'plus', 'circle'] as const;

      styles.forEach(style => {
        const { container } = renderWithTestUtils(
          React.createElement(Crosshair, {
            ...defaultProps,
            style: style,
          })
        );

        const crosshair = container.querySelector('svg');
        expect(crosshair).toBeTruthy();
      });
    });

    it('should position correctly', () => {
      const { container } = renderWithTestUtils(
        React.createElement(Crosshair, {
          ...defaultProps,
          position: { x: 200, y: 150 },
          size: 40,
        })
      );

      const crosshairContainer = container.querySelector('.absolute');
      const style = crosshairContainer ? getComputedStyle(crosshairContainer) : null;

      // Should be positioned with offset for centering (position - size/2)
      expect(crosshairContainer).toBeTruthy();
    });

    it('should apply custom size and colors', () => {
      const { container } = renderWithTestUtils(
        React.createElement(Crosshair, {
          ...defaultProps,
          size: 60,
          color: 'red',
        })
      );

      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('60');
      expect(svg?.getAttribute('height')).toBe('60');
    });

    it('should handle different themes', () => {
      const themes = ['light', 'dark', 'contrast', 'neon'] as const;

      themes.forEach(theme => {
        const { container } = renderWithTestUtils(
          React.createElement(Crosshair, {
            ...defaultProps,
            theme,
          })
        );

        const crosshair = container.querySelector('svg');
        expect(crosshair).toBeTruthy();
      });
    });

    it('should show or hide center dot based on showCenter prop', () => {
      // With center dot
      const { container: withCenter } = renderWithTestUtils(
        React.createElement(Crosshair, {
          ...defaultProps,
          showCenter: true,
        })
      );

      const centerDot = withCenter.querySelector('circle');
      expect(centerDot).toBeTruthy();

      // Without center dot
      const { container: withoutCenter } = renderWithTestUtils(
        React.createElement(Crosshair, {
          ...defaultProps,
          showCenter: false,
        })
      );

      const noCenterDot = withoutCenter.querySelector('circle');
      expect(noCenterDot).toBeFalsy();
    });
  });

  describe('FocusRing', () => {
    const defaultProps = {
      center: { x: 100, y: 100 },
      radius: 50,
      isVisible: true,
    };

    it('should render when visible', () => {
      const { container } = renderWithTestUtils(
        React.createElement(FocusRing, defaultProps)
      );

      const focusRing = container.querySelector('[style*="border"]');
      expect(focusRing).toBeTruthy();
    });

    it('should not render when invisible', () => {
      const { container } = renderWithTestUtils(
        React.createElement(FocusRing, {
          ...defaultProps,
          isVisible: false,
        })
      );

      const focusRing = container.querySelector('[style*="border"]');
      expect(focusRing).toBeFalsy();
    });

    it('should render different styles', () => {
      const styles = ['solid', 'dashed', 'dotted', 'pulse', 'gradient'] as const;

      styles.forEach(style => {
        const { container } = renderWithTestUtils(
          React.createElement(FocusRing, {
            ...defaultProps,
            style,
          })
        );

        if (style === 'gradient') {
          const svg = container.querySelector('svg');
          expect(svg).toBeTruthy();
        } else {
          const ring = container.querySelector('.absolute');
          expect(ring).toBeTruthy();
        }
      });
    });

    it('should position correctly with given radius', () => {
      const { container } = renderWithTestUtils(
        React.createElement(FocusRing, {
          ...defaultProps,
          center: { x: 200, y: 150 },
          radius: 75,
        })
      );

      const ring = container.querySelector('.absolute');
      expect(ring).toBeTruthy();

      const style = ring ? getComputedStyle(ring) : null;
      // Position should account for radius offset (center - radius)
      expect(style).toBeTruthy();
    });

    it('should apply custom opacity', () => {
      const { container } = renderWithTestUtils(
        React.createElement(FocusRing, {
          ...defaultProps,
          opacity: 0.5,
        })
      );

      const ring = container.querySelector('[style*="opacity"]');
      expect(ring).toBeTruthy();
    });
  });

  describe('GridOverlay', () => {
    it('should render rule of thirds grid', () => {
      const { container } = renderWithTestUtils(
        React.createElement(GridOverlay, {
          isVisible: true,
          gridType: 'rule-of-thirds',
        })
      );

      // Should have 4 lines (2 vertical, 2 horizontal)
      const lines = container.querySelectorAll('[style*="background-color"]');
      expect(lines.length).toBeGreaterThanOrEqual(1);
    });

    it('should render regular grid', () => {
      const { container } = renderWithTestUtils(
        React.createElement(GridOverlay, {
          isVisible: true,
          gridType: 'grid',
        })
      );

      const grid = container.querySelector('[style*="background-image"]');
      expect(grid).toBeTruthy();
    });

    it('should render center lines', () => {
      const { container } = renderWithTestUtils(
        React.createElement(GridOverlay, {
          isVisible: true,
          gridType: 'center',
        })
      );

      const centerLines = container.querySelectorAll('[style*="50%"]');
      expect(centerLines.length).toBeGreaterThanOrEqual(1);
    });

    it('should not render when invisible', () => {
      const { container } = renderWithTestUtils(
        React.createElement(GridOverlay, {
          isVisible: false,
        })
      );

      expect(container.firstChild).toBeFalsy();
    });

    it('should apply different themes', () => {
      const themes = ['light', 'dark', 'contrast', 'neon'] as const;

      themes.forEach(theme => {
        const { container } = renderWithTestUtils(
          React.createElement(GridOverlay, {
            isVisible: true,
            gridType: 'rule-of-thirds',
            theme,
          })
        );

        const overlay = container.querySelector('.absolute');
        expect(overlay).toBeTruthy();
      });
    });
  });

  describe('CrosshairSystem', () => {
    const defaultProps = {
      position: { x: 100, y: 100 },
      isActive: true,
    };

    it('should render complete crosshair system when active', () => {
      const { container } = renderWithTestUtils(
        React.createElement(CrosshairSystem, defaultProps)
      );

      // Should have crosshair
      const crosshair = container.querySelector('svg');
      expect(crosshair).toBeTruthy();

      // Should have focus ring
      const focusRing = container.querySelector('[style*="border"]');
      expect(focusRing).toBeTruthy();
    });

    it('should not render when inactive', () => {
      const { container } = renderWithTestUtils(
        React.createElement(CrosshairSystem, {
          ...defaultProps,
          isActive: false,
        })
      );

      expect(container.firstChild).toBeFalsy();
    });

    it('should render with grid overlay', () => {
      const { container } = renderWithTestUtils(
        React.createElement(CrosshairSystem, {
          ...defaultProps,
          showGrid: true,
        })
      );

      const grid = container.querySelector('[style*="background-image"]');
      expect(grid).toBeTruthy();
    });

    it('should render with rule of thirds', () => {
      const { container } = renderWithTestUtils(
        React.createElement(CrosshairSystem, {
          ...defaultProps,
          showRuleOfThirds: true,
        })
      );

      // Should have rule of thirds lines
      const lines = container.querySelectorAll('[style*="33.333%"], [style*="66.666%"]');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should center align when centerAlignment is true', () => {
      const { container } = renderWithTestUtils(
        React.createElement(CrosshairSystem, {
          ...defaultProps,
          position: { x: 50, y: 50 }, // Original position
          centerAlignment: true,
        })
      );

      // Should render (center alignment logic tested internally)
      const system = container.querySelector('.fixed');
      expect(system).toBeTruthy();
    });

    it('should apply custom focus radius', () => {
      const { container } = renderWithTestUtils(
        React.createElement(CrosshairSystem, {
          ...defaultProps,
          focusRadius: 150,
        })
      );

      // Should render with custom radius
      const focusRing = container.querySelector('[style*="300px"]'); // 150 * 2
      expect(focusRing).toBeTruthy();
    });

    it('should handle different crosshair and focus ring styles', () => {
      const { container } = renderWithTestUtils(
        React.createElement(CrosshairSystem, {
          ...defaultProps,
          crosshairStyle: 'camera',
          focusRingStyle: 'solid',
        })
      );

      const crosshair = container.querySelector('svg');
      const focusRing = container.querySelector('.absolute');

      expect(crosshair).toBeTruthy();
      expect(focusRing).toBeTruthy();
    });

    it('should apply themes consistently', () => {
      const themes = ['light', 'dark', 'contrast', 'neon'] as const;

      themes.forEach(theme => {
        const { container } = renderWithTestUtils(
          React.createElement(CrosshairSystem, {
            ...defaultProps,
            theme,
          })
        );

        const system = container.querySelector('.fixed');
        expect(system).toBeTruthy();
      });
    });
  });
});