/**
 * PerformanceRenderer Component Tests
 *
 * Comprehensive test suite for performance visualization functionality including:
 * - Debug information visualization and development tools
 * - Conditional rendering with minimal performance impact (<2% overhead)
 * - Observer pattern for performance metrics display
 * - Real-time FPS, memory usage, and architectural metrics
 * - Performance color coding and visual indicators
 *
 * @fileoverview Performance testing for extracted component
 * @version 1.0.0
 * @since Task 7.1 - Component Testing Strategy
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTestUtils, measureRenderPerformance } from './utils';
import React from 'react';
import { PerformanceRenderer, type PerformanceMetrics } from '../components/PerformanceRenderer';
import type { QualityLevel } from '../types/canvas';
import { screen } from '@testing-library/react';

describe('PerformanceRenderer', () => {
  let mockMetrics: PerformanceMetrics;
  let mockQualityLevel: QualityLevel;
  let mockOnToggleDebug: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockMetrics = {
      fps: 60,
      frameTime: 16.67,
      memoryMB: 35,
      canvasRenderFPS: 58,
      transformOverhead: 2.5,
      activeOperations: 3,
      averageMovementTime: 12,
      gpuUtilization: 45,
    };

    mockQualityLevel = 'high';
    mockOnToggleDebug = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Conditional Rendering', () => {
    it('should not render when debug mode is disabled', () => {
      const { container } = renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: false,
        })
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when debug mode is enabled', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      expect(screen.getByText('CANVAS DEBUG')).toBeInTheDocument();
    });

    it('should render with correct positioning and styling', () => {
      const { container } = renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      const debugPanel = container.querySelector('.absolute.top-4.left-4');
      expect(debugPanel).toBeTruthy();
      expect(debugPanel).toHaveClass('bg-black', 'bg-opacity-90', 'text-white', 'z-50');
    });
  });

  describe('Performance Metrics Display', () => {
    beforeEach(() => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );
    });

    it('should display basic performance metrics', () => {
      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
      expect(screen.getByText(/Frame Time: 16.7ms/)).toBeInTheDocument();
      expect(screen.getByText(/Memory: 35.0MB/)).toBeInTheDocument();
    });

    it('should display quality level', () => {
      expect(screen.getByText(/Quality:/)).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    it('should display advanced metrics when available', () => {
      expect(screen.getByText(/Canvas FPS:/)).toBeInTheDocument();
      expect(screen.getByText('58')).toBeInTheDocument();
      expect(screen.getByText(/Transform: 2.5ms/)).toBeInTheDocument();
      expect(screen.getByText(/GPU Util: 45.0%/)).toBeInTheDocument();
      expect(screen.getByText(/Operations: 3/)).toBeInTheDocument();
      expect(screen.getByText(/Avg Movement: 12.0ms/)).toBeInTheDocument();
    });

    it('should handle missing advanced metrics gracefully', () => {
      const basicMetrics: PerformanceMetrics = {
        fps: 45,
        frameTime: 22.2,
        memoryMB: 60,
      };

      const { rerender } = renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: basicMetrics,
          qualityLevel: 'medium',
          debugMode: true,
        })
      );

      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText(/Frame Time: 22.2ms/)).toBeInTheDocument();
      expect(screen.getByText(/Memory: 60.0MB/)).toBeInTheDocument();
      expect(screen.queryByText(/Canvas FPS:/)).not.toBeInTheDocument();
    });
  });

  describe('Performance Color Coding', () => {
    it('should use green color for good FPS performance', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: { ...mockMetrics, fps: 60 },
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      const fpsElement = screen.getByText('60');
      expect(fpsElement).toHaveClass('text-green-400');
    });

    it('should use yellow color for warning FPS performance', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: { ...mockMetrics, fps: 50 },
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      const fpsElement = screen.getByText('50');
      expect(fpsElement).toHaveClass('text-yellow-400');
    });

    it('should use red color for poor FPS performance', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: { ...mockMetrics, fps: 30 },
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      const fpsElement = screen.getByText('30');
      expect(fpsElement).toHaveClass('text-red-400');
    });

    it('should use appropriate colors for Canvas FPS', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: { ...mockMetrics, canvasRenderFPS: 58 },
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      const canvasFpsElement = screen.getByText('58');
      expect(canvasFpsElement).toHaveClass('text-green-400');
    });
  });

  describe('Quality Level Color Coding', () => {
    const qualityTests: Array<[QualityLevel, string]> = [
      ['highest', 'text-green-400'],
      ['high', 'text-blue-400'],
      ['medium', 'text-yellow-400'],
      ['low', 'text-orange-400'],
      ['minimal', 'text-red-400'],
    ];

    qualityTests.forEach(([quality, expectedClass]) => {
      it(`should use ${expectedClass} for ${quality} quality level`, () => {
        renderWithTestUtils(
          React.createElement(PerformanceRenderer, {
            metrics: mockMetrics,
            qualityLevel: quality,
            debugMode: true,
          })
        );

        const qualityElement = screen.getByText(quality.toUpperCase());
        expect(qualityElement).toHaveClass(expectedClass);
      });
    });
  });

  describe('Canvas Position Display', () => {
    it('should display canvas position when provided', () => {
      const canvasPosition = { x: 100.5, y: -50.25, scale: 1.25 };

      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
          canvasPosition,
        })
      );

      expect(screen.getByText(/Position: \(100.5, -50.3\)/)).toBeInTheDocument();
      expect(screen.getByText(/Scale: 1.25/)).toBeInTheDocument();
    });

    it('should display layout and transition state', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
          layout: '2d-canvas',
          isTransitioning: true,
          activeSection: 'capture',
        })
      );

      expect(screen.getByText(/Layout: 2d-canvas/)).toBeInTheDocument();
      expect(screen.getByText(/Transitioning: Yes/)).toBeInTheDocument();
      expect(screen.getByText(/Active Section: capture/)).toBeInTheDocument();
    });

    it('should display render count when provided', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
          renderCount: 1247,
        })
      );

      expect(screen.getByText(/Renders: 1247/)).toBeInTheDocument();
    });
  });

  describe('Additional Metrics Display', () => {
    it('should display additional metrics when provided', () => {
      const additionalMetrics = {
        cpuUsage: 25.5,
        networkLatency: 120,
        cacheHitRate: 0.85,
        activeConnections: 3,
      };

      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
          additionalMetrics,
        })
      );

      expect(screen.getByText('ADDITIONAL')).toBeInTheDocument();
      expect(screen.getByText(/cpuUsage: 25.5/)).toBeInTheDocument();
      expect(screen.getByText(/networkLatency: 120/)).toBeInTheDocument();
      expect(screen.getByText(/cacheHitRate: 0.9/)).toBeInTheDocument();
      expect(screen.getByText(/activeConnections: 3/)).toBeInTheDocument();
    });

    it('should handle string values in additional metrics', () => {
      const additionalMetrics = {
        status: 'connected',
        mode: 'production',
      };

      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
          additionalMetrics,
        })
      );

      expect(screen.getByText(/status: connected/)).toBeInTheDocument();
      expect(screen.getByText(/mode: production/)).toBeInTheDocument();
    });

    it('should not display additional metrics section when empty', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
          additionalMetrics: {},
        })
      );

      expect(screen.queryByText('ADDITIONAL')).not.toBeInTheDocument();
    });
  });

  describe('Performance Indicators', () => {
    it('should display performance indicator icons based on metrics', () => {
      const highPerformanceMetrics: PerformanceMetrics = {
        fps: 60,
        frameTime: 16.67,
        memoryMB: 30,
        gpuUtilization: 85,
      };

      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: highPerformanceMetrics,
          qualityLevel: 'highest',
          debugMode: true,
          isTransitioning: false,
        })
      );

      // High FPS indicator
      const indicators = document.querySelector('.text-athletic-neutral-400');
      expect(indicators?.textContent).toContain('⚡'); // High FPS
      expect(indicators?.textContent).toContain('💾'); // Good memory
      expect(indicators?.textContent).toContain('🔥'); // Highest quality
      expect(indicators?.textContent).toContain('📐'); // Stable (not transitioning)
      expect(indicators?.textContent).toContain('🚀'); // GPU accelerated
    });

    it('should hide indicators when performance conditions are not met', () => {
      const lowPerformanceMetrics: PerformanceMetrics = {
        fps: 30,
        frameTime: 33.33,
        memoryMB: 80,
        gpuUtilization: 20,
      };

      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: lowPerformanceMetrics,
          qualityLevel: 'low',
          debugMode: true,
          isTransitioning: true,
        })
      );

      const indicators = document.querySelector('.text-athletic-neutral-400');
      expect(indicators?.textContent).not.toContain('⚡'); // Low FPS
      expect(indicators?.textContent).not.toContain('💾'); // High memory
      expect(indicators?.textContent).not.toContain('🔥'); // Low quality
      expect(indicators?.textContent).not.toContain('📐'); // Transitioning
      expect(indicators?.textContent).not.toContain('🚀'); // Low GPU
    });
  });

  describe('Toggle Debug Functionality', () => {
    it('should render toggle button when callback is provided', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
          onToggleDebug: mockOnToggleDebug,
        })
      );

      const toggleButton = screen.getByRole('button', { name: /toggle debug mode/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('✕');
    });

    it('should call toggle callback when button is clicked', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
          onToggleDebug: mockOnToggleDebug,
        })
      );

      const toggleButton = screen.getByRole('button', { name: /toggle debug mode/i });
      toggleButton.click();

      expect(mockOnToggleDebug).toHaveBeenCalledTimes(1);
    });

    it('should not render toggle button when callback is not provided', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      expect(screen.queryByRole('button', { name: /toggle debug mode/i })).not.toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format numbers with appropriate decimal places', () => {
      const preciseMetrics: PerformanceMetrics = {
        fps: 59.876543,
        frameTime: 16.66666,
        memoryMB: 35.123456,
        transformOverhead: 2.555555,
      };

      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: preciseMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      expect(screen.getByText('60')).toBeInTheDocument(); // FPS rounded to 0 decimals
      expect(screen.getByText(/Frame Time: 16.7ms/)).toBeInTheDocument(); // 1 decimal
      expect(screen.getByText(/Memory: 35.1MB/)).toBeInTheDocument(); // 1 decimal
      expect(screen.getByText(/Transform: 2.6ms/)).toBeInTheDocument(); // 1 decimal
    });

    it('should handle undefined and null values gracefully', () => {
      const incompleteMetrics: PerformanceMetrics = {
        fps: 45,
        frameTime: 22.2,
        memoryMB: 50,
        canvasRenderFPS: undefined,
        transformOverhead: undefined,
      };

      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: incompleteMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText(/Frame Time: 22.2ms/)).toBeInTheDocument();
      expect(screen.getByText(/Memory: 50.0MB/)).toBeInTheDocument();
    });
  });

  describe('Performance Impact Testing', () => {
    it('should have minimal rendering overhead when debug mode is disabled', async () => {
      const renderTime = await measureRenderPerformance(() => {
        renderWithTestUtils(
          React.createElement(PerformanceRenderer, {
            metrics: mockMetrics,
            qualityLevel: mockQualityLevel,
            debugMode: false,
          })
        );
      });

      // Should be nearly instantaneous for null return
      expect(renderTime).toBeLessThan(1);
    });

    it('should maintain low overhead when debug mode is enabled', async () => {
      const renderTime = await measureRenderPerformance(() => {
        renderWithTestUtils(
          React.createElement(PerformanceRenderer, {
            metrics: mockMetrics,
            qualityLevel: mockQualityLevel,
            debugMode: true,
            canvasPosition: { x: 100, y: 200, scale: 1.5 },
            layout: '2d-canvas',
            isTransitioning: false,
            renderCount: 1000,
            additionalMetrics: {
              cpu: 25,
              network: 120,
              cache: 0.85,
            },
          })
        );
      });

      // Should render quickly even with all metrics
      expect(renderTime).toBeLessThan(10);
    });

    it('should handle frequent re-renders efficiently', async () => {
      const { rerender } = renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      const startTime = performance.now();

      // Simulate frequent metric updates
      for (let i = 0; i < 100; i++) {
        const updatedMetrics = {
          ...mockMetrics,
          fps: 60 - i * 0.1,
          frameTime: 16.67 + i * 0.01,
          memoryMB: 35 + i * 0.1,
        };

        rerender(
          React.createElement(PerformanceRenderer, {
            metrics: updatedMetrics,
            qualityLevel: mockQualityLevel,
            debugMode: true,
          })
        );
      }

      const totalTime = performance.now() - startTime;

      // 100 re-renders should complete quickly
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('Footer Information', () => {
    it('should display footer with performance monitor info', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      expect(screen.getByText('Canvas Performance Monitor')).toBeInTheDocument();
      expect(screen.getByText('Overhead: <2%')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Screen Reader Support', () => {
    it('should have proper structure for screen readers', () => {
      const { container } = renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
        })
      );

      const debugPanel = container.querySelector('[class*="absolute"]');
      expect(debugPanel).toBeTruthy();

      // Should have logical heading structure
      expect(screen.getByText('CANVAS DEBUG')).toBeInTheDocument();
      expect(screen.getByText('PERFORMANCE')).toBeInTheDocument();
      expect(screen.getByText('ADVANCED')).toBeInTheDocument();
    });

    it('should use semantic HTML structure', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
          onToggleDebug: mockOnToggleDebug,
        })
      );

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('title', 'Toggle debug mode');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle extreme metric values gracefully', () => {
      const extremeMetrics: PerformanceMetrics = {
        fps: 0,
        frameTime: 1000,
        memoryMB: 9999,
        canvasRenderFPS: 200,
        gpuUtilization: 100,
      };

      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: extremeMetrics,
          qualityLevel: 'minimal',
          debugMode: true,
        })
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText(/Frame Time: 1000.0ms/)).toBeInTheDocument();
      expect(screen.getByText(/Memory: 9999.0MB/)).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText(/GPU Util: 100.0%/)).toBeInTheDocument();
    });

    it('should handle missing canvas position gracefully', () => {
      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: mockMetrics,
          qualityLevel: mockQualityLevel,
          debugMode: true,
          canvasPosition: undefined,
        })
      );

      expect(screen.queryByText(/Position:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Scale:/)).not.toBeInTheDocument();
    });

    it('should render with minimal required props', () => {
      const minimalMetrics: PerformanceMetrics = {
        fps: 30,
        frameTime: 33.33,
        memoryMB: 50,
      };

      renderWithTestUtils(
        React.createElement(PerformanceRenderer, {
          metrics: minimalMetrics,
          qualityLevel: 'medium',
          debugMode: true,
        })
      );

      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText(/Frame Time: 33.3ms/)).toBeInTheDocument();
      expect(screen.getByText(/Memory: 50.0MB/)).toBeInTheDocument();
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });
  });
});