/**
 * Canvas Performance Test Suite
 *
 * Comprehensive performance testing for canvas operations across different
 * devices, browsers, and performance conditions. Tests frame rates, memory usage,
 * animation smoothness, and automatic quality degradation.
 *
 * @fileoverview Task 8: Performance Optimization - Cross-Device Testing
 * @version 1.0.0
 * @since 2025-09-27
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';

import { LightboxCanvas } from '../components/LightboxCanvas';
import { CameraController } from '../components/CameraController';
import { CanvasPerformanceMonitor, PERFORMANCE_THRESHOLDS } from '../utils/canvasPerformanceMonitor';
import { CanvasQualityManager, getQualityManager } from '../utils/canvasQualityManager';
import { CanvasPerformanceDebugger, getPerformanceDebugger } from '../utils/canvasPerformanceDebugger';
import type { CanvasState, CanvasActions, CanvasPerformanceMetrics } from '../types/canvas';

// Mock different device capabilities
interface DeviceProfile {
  name: string;
  memory: number;
  cores: number;
  userAgent: string;
  expectedPerformance: 'high' | 'medium' | 'low';
  targetFPS: number;
}

const DEVICE_PROFILES: DeviceProfile[] = [
  {
    name: 'High-End Desktop',
    memory: 8,
    cores: 8,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124',
    expectedPerformance: 'high',
    targetFPS: 60
  },
  {
    name: 'Mid-Range Laptop',
    memory: 4,
    cores: 4,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/91.0.4472.124',
    expectedPerformance: 'medium',
    targetFPS: 45
  },
  {
    name: 'Low-End Mobile',
    memory: 2,
    cores: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    expectedPerformance: 'low',
    targetFPS: 30
  },
  {
    name: 'Budget Android',
    memory: 1,
    cores: 2,
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-A105F) AppleWebKit/537.36 Chrome/91.0.4472.124',
    expectedPerformance: 'low',
    targetFPS: 24
  }
];

// Performance test scenarios
interface PerformanceScenario {
  name: string;
  operations: Array<{
    type: 'pan' | 'zoom' | 'transition' | 'multiple';
    count: number;
    complexity: 'simple' | 'moderate' | 'complex';
  }>;
  expectedDegradation: boolean;
  maxFrameTime: number;
}

const PERFORMANCE_SCENARIOS: PerformanceScenario[] = [
  {
    name: 'Light Usage',
    operations: [
      { type: 'pan', count: 5, complexity: 'simple' },
      { type: 'zoom', count: 3, complexity: 'simple' }
    ],
    expectedDegradation: false,
    maxFrameTime: 20
  },
  {
    name: 'Normal Usage',
    operations: [
      { type: 'transition', count: 10, complexity: 'moderate' },
      { type: 'pan', count: 15, complexity: 'moderate' },
      { type: 'zoom', count: 8, complexity: 'moderate' }
    ],
    expectedDegradation: false,
    maxFrameTime: 25
  },
  {
    name: 'Heavy Usage',
    operations: [
      { type: 'multiple', count: 5, complexity: 'complex' },
      { type: 'transition', count: 20, complexity: 'complex' },
      { type: 'pan', count: 30, complexity: 'complex' }
    ],
    expectedDegradation: true,
    maxFrameTime: 40
  },
  {
    name: 'Stress Test',
    operations: [
      { type: 'multiple', count: 10, complexity: 'complex' },
      { type: 'transition', count: 50, complexity: 'complex' }
    ],
    expectedDegradation: true,
    maxFrameTime: 60
  }
];

// Mock canvas state and actions
const createMockCanvasState = (): CanvasState => ({
  currentPosition: { x: 0, y: 0, scale: 1.0 },
  targetPosition: null,
  activeSection: 'capture',
  previousSection: null,
  layout: '3x2',
  sectionMap: new Map(),
  camera: {
    activeMovement: null,
    movementStartTime: null,
    movementConfig: null,
    progress: 0
  },
  interaction: {
    isPanning: false,
    isZooming: false,
    touchState: {
      initialDistance: null,
      initialPosition: null,
      centerPoint: null,
      touch1Initial: null,
      touch2Initial: null
    }
  },
  performance: {
    canvasFPS: 60,
    transformLatency: 16,
    canvasMemoryUsage: 50,
    isOptimized: false
  },
  accessibility: {
    keyboardSpatialNav: true,
    spatialFocus: null,
    reducedMotion: false
  }
});

const createMockCanvasActions = (): CanvasActions => ({
  updateCanvasPosition: vi.fn(),
  setActiveSection: vi.fn(),
  setTargetPosition: vi.fn(),
  executeCameraMovement: vi.fn(),
  setPanningState: vi.fn(),
  setZoomingState: vi.fn(),
  updateTouchState: vi.fn(),
  updateCanvasMetrics: vi.fn()
} as any);

// Mock performance APIs
const mockPerformanceNow = vi.fn();
const mockRequestAnimationFrame = vi.fn();

// Test utilities
function simulateDeviceProfile(profile: DeviceProfile) {
  Object.defineProperty(navigator, 'deviceMemory', {
    value: profile.memory,
    configurable: true
  });

  Object.defineProperty(navigator, 'hardwareConcurrency', {
    value: profile.cores,
    configurable: true
  });

  Object.defineProperty(navigator, 'userAgent', {
    value: profile.userAgent,
    configurable: true
  });
}

function simulatePerformanceCondition(fps: number, memoryMB: number) {
  const frameTime = 1000 / fps;
  mockPerformanceNow.mockReturnValue(performance.now());

  // Mock memory if available
  if ('memory' in performance) {
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: memoryMB * 1024 * 1024,
        totalJSHeapSize: memoryMB * 1.5 * 1024 * 1024,
        jsHeapSizeLimit: memoryMB * 2 * 1024 * 1024
      },
      configurable: true
    });
  }

  return frameTime;
}

describe('Canvas Performance Tests', () => {
  let mockCanvasState: CanvasState;
  let mockCanvasActions: CanvasActions;
  let performanceMonitor: CanvasPerformanceMonitor;
  let qualityManager: CanvasQualityManager;
  let performanceDebugger: CanvasPerformanceDebugger;

  beforeEach(() => {
    vi.useFakeTimers();
    mockCanvasState = createMockCanvasState();
    mockCanvasActions = createMockCanvasActions();

    // Initialize performance tools
    performanceMonitor = new CanvasPerformanceMonitor();
    qualityManager = getQualityManager();
    performanceDebugger = getPerformanceDebugger();

    // Mock performance APIs
    Object.defineProperty(global, 'performance', {
      value: { now: mockPerformanceNow },
      writable: true
    });

    Object.defineProperty(global, 'requestAnimationFrame', {
      value: mockRequestAnimationFrame,
      writable: true
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    performanceMonitor.stop();
    performanceDebugger.hideDebugOverlay();
    qualityManager.reset();
  });

  describe('Device-Specific Performance', () => {
    DEVICE_PROFILES.forEach(profile => {
      it(`should perform adequately on ${profile.name}`, async () => {
        // Simulate device capabilities
        simulateDeviceProfile(profile);

        // Start performance monitoring
        performanceMonitor.start();
        performanceDebugger.startProfiling();

        // Simulate device-appropriate performance
        const frameTime = simulatePerformanceCondition(profile.targetFPS, profile.memory * 10);

        // Run a series of operations
        for (let i = 0; i < 10; i++) {
          performanceMonitor.trackOperation('test-operation', frameTime);
          mockPerformanceNow.mockReturnValue(mockPerformanceNow() + frameTime);
          vi.advanceTimersByTime(frameTime);
        }

        // Get metrics
        const metrics = performanceMonitor.getMetrics();

        // Verify performance meets device expectations
        if (profile.expectedPerformance === 'high') {
          expect(metrics.canvasRenderFPS).toBeGreaterThanOrEqual(55);
        } else if (profile.expectedPerformance === 'medium') {
          expect(metrics.canvasRenderFPS).toBeGreaterThanOrEqual(40);
        } else {
          expect(metrics.canvasRenderFPS).toBeGreaterThanOrEqual(24);
        }

        // Stop profiling
        const performanceProfile = performanceDebugger.stopProfiling();
        performanceMonitor.stop();

        // Verify session completed successfully
        expect(performanceProfile.endTime).toBeDefined();
        expect(performanceProfile.averageFPS).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance Scenarios', () => {
    PERFORMANCE_SCENARIOS.forEach(scenario => {
      it(`should handle ${scenario.name} efficiently`, async () => {
        // Start monitoring
        performanceMonitor.start();
        performanceDebugger.startProfiling();

        let totalOperations = 0;
        let maxFrameTime = 0;

        // Execute scenario operations
        for (const operation of scenario.operations) {
          for (let i = 0; i < operation.count; i++) {
            const baseFrameTime = operation.complexity === 'simple' ? 12 :
                                 operation.complexity === 'moderate' ? 18 : 25;

            const frameTime = baseFrameTime + (Math.random() * 10);
            maxFrameTime = Math.max(maxFrameTime, frameTime);

            performanceMonitor.trackOperation(`${operation.type}-${operation.complexity}`, frameTime);
            totalOperations++;

            mockPerformanceNow.mockReturnValue(mockPerformanceNow() + frameTime);
            vi.advanceTimersByTime(frameTime);
          }
        }

        // Verify performance thresholds
        const metrics = performanceMonitor.getMetrics();

        if (scenario.expectedDegradation) {
          // Should trigger quality degradation
          expect(qualityManager.getCurrentQuality()).not.toBe('highest');
        }

        // Verify maximum frame time doesn't exceed scenario limits
        expect(maxFrameTime).toBeLessThanOrEqual(scenario.maxFrameTime);

        // Get performance profile
        const profile = performanceDebugger.stopProfiling();

        // Verify operations were tracked
        expect(profile.events.length).toBeGreaterThan(0);
        expect(totalOperations).toBeGreaterThan(0);
      });
    });
  });

  describe('Quality Degradation', () => {
    it('should automatically degrade quality when FPS drops below threshold', async () => {
      // Start with highest quality
      qualityManager.setQuality('highest', 'manual');
      expect(qualityManager.getCurrentQuality()).toBe('highest');

      // Simulate poor performance
      const poorFPS = 25;
      const frameTime = 1000 / poorFPS;

      // Trigger quality manager
      qualityManager.handlePerformanceChange(poorFPS, frameTime, 50);

      // Should degrade quality
      expect(qualityManager.getCurrentQuality()).not.toBe('highest');
      expect(['low', 'minimal'].includes(qualityManager.getCurrentQuality())).toBe(true);
    });

    it('should restore quality when performance improves', async () => {
      // Start with degraded quality
      qualityManager.setQuality('low', 'performance');
      expect(qualityManager.getCurrentQuality()).toBe('low');

      // Simulate good performance
      const goodFPS = 58;
      const frameTime = 1000 / goodFPS;

      // Trigger quality manager multiple times to ensure stability
      for (let i = 0; i < 5; i++) {
        qualityManager.handlePerformanceChange(goodFPS, frameTime, 30);
        vi.advanceTimersByTime(100);
      }

      // Should restore quality
      expect(['high', 'highest'].includes(qualityManager.getCurrentQuality())).toBe(true);
    });

    it('should provide appropriate animation configs for different quality levels', () => {
      const qualities = ['highest', 'high', 'medium', 'low', 'minimal'] as const;

      qualities.forEach(quality => {
        qualityManager.setQuality(quality, 'manual');
        const config = qualityManager.getAnimationConfig('pan-tilt');

        // Higher quality should have longer durations and more features
        if (quality === 'highest' || quality === 'high') {
          expect(config.duration).toBeGreaterThanOrEqual(600);
          expect(config.useGPU).toBe(true);
        } else if (quality === 'minimal') {
          expect(config.duration).toBeLessThanOrEqual(300);
          expect(config.skipFrames).toBe(true);
        }
      });
    });
  });

  describe('Memory Management', () => {
    it('should track memory usage during operations', async () => {
      performanceMonitor.start();

      // Simulate memory usage pattern
      const memoryPattern = [50, 75, 100, 125, 150, 120, 100, 80];

      for (const memoryMB of memoryPattern) {
        simulatePerformanceCondition(60, memoryMB);
        performanceMonitor.trackOperation('memory-test', 16);
        vi.advanceTimersByTime(100);
      }

      const metrics = performanceMonitor.getMetrics();

      // Should track peak memory usage
      expect(metrics.canvasMemoryMB).toBeGreaterThan(0);

      performanceMonitor.stop();
    });

    it('should detect memory leaks', async () => {
      performanceDebugger.startProfiling();

      // Simulate increasing memory usage (potential leak)
      for (let i = 0; i < 20; i++) {
        const memoryMB = 50 + (i * 5); // Steadily increasing memory
        simulatePerformanceCondition(60, memoryMB);
        performanceDebugger.trackMemory(memoryMB);
        vi.advanceTimersByTime(100);
      }

      const recommendations = performanceDebugger.getRecommendations();

      // Should recommend memory optimization
      expect(recommendations.some(rec =>
        rec.toLowerCase().includes('memory')
      )).toBe(true);

      performanceDebugger.stopProfiling();
    });
  });

  describe('Canvas Operations Performance', () => {
    it('should track individual operation performance', async () => {
      performanceMonitor.start();

      const operations = [
        { name: 'pan-tilt', duration: 15 },
        { name: 'zoom-in', duration: 18 },
        { name: 'zoom-out', duration: 16 },
        { name: 'dolly-zoom', duration: 22 },
        { name: 'rack-focus', duration: 12 },
        { name: 'match-cut', duration: 8 }
      ];

      // Track each operation
      operations.forEach(op => {
        performanceMonitor.trackOperation(op.name, op.duration);
      });

      // Verify operations were tracked
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.activeOperations).toBeGreaterThan(0);

      performanceMonitor.stop();
    });

    it('should optimize canvas bounds for off-screen elements', async () => {
      const { container } = render(
        <LightboxCanvas
          canvasState={mockCanvasState}
          canvasActions={mockCanvasActions}
          debugMode={true}
        >
          <div data-spatial-section="section1">Section 1</div>
          <div data-spatial-section="section2">Section 2</div>
          <div data-spatial-section="section3">Section 3</div>
        </LightboxCanvas>
      );

      // Mock viewport
      const viewport = { x: 0, y: 0, width: 1024, height: 768 };

      // Mock sections with positions
      const sections = [
        { id: 'section1', element: container.querySelector('[data-spatial-section="section1"]') as HTMLElement, position: { x: 0, y: 0, scale: 1.0 } },
        { id: 'section2', element: container.querySelector('[data-spatial-section="section2"]') as HTMLElement, position: { x: 2000, y: 0, scale: 1.0 } }, // Off-screen
        { id: 'section3', element: container.querySelector('[data-spatial-section="section3"]') as HTMLElement, position: { x: 100, y: 100, scale: 1.0 } }
      ];

      // Start monitoring
      performanceMonitor.start();

      // Optimize bounds
      performanceMonitor.optimizeCanvasBounds(
        { x: 0, y: 0, scale: 1.0 },
        viewport,
        sections
      );

      // Verify optimization was applied
      // Off-screen element should be hidden
      expect(sections[1].element.style.visibility).toBe('hidden');

      // On-screen elements should be visible
      expect(sections[0].element.style.visibility).toBe('visible');
      expect(sections[2].element.style.visibility).toBe('visible');

      performanceMonitor.stop();
    });
  });

  describe('Debug Tools', () => {
    it('should provide comprehensive performance debugging', async () => {
      performanceDebugger.startProfiling();

      // Simulate various performance events
      performanceDebugger.logEvent('animation-start', { test: true }, 'low');
      performanceDebugger.logEvent('frame-drop', { frameTime: 35 }, 'high');
      performanceDebugger.logEvent('quality-change', { from: 'high', to: 'medium' }, 'medium');

      vi.advanceTimersByTime(1000);

      const profile = performanceDebugger.stopProfiling();

      // Verify profiling captured events
      expect(profile.events.length).toBeGreaterThan(0);
      expect(profile.endTime).toBeDefined();

      // Verify report generation
      const report = performanceDebugger.generateReport();
      expect(report).toContain('Canvas Performance Report');
      expect(report).toContain('Summary');

      // Verify data export
      const exportData = performanceDebugger.exportData();
      expect(() => JSON.parse(exportData)).not.toThrow();
    });

    it('should show debug overlay in development', async () => {
      performanceDebugger.showDebugOverlay();

      // Verify overlay is created
      const overlay = document.getElementById('canvas-performance-debug');
      expect(overlay).toBeTruthy();
      expect(overlay?.textContent).toContain('PERFORMANCE DEBUGGER');

      performanceDebugger.hideDebugOverlay();

      // Verify overlay is removed
      const hiddenOverlay = document.getElementById('canvas-performance-debug');
      expect(hiddenOverlay).toBeFalsy();
    });
  });

  describe('Browser Compatibility', () => {
    const browsers = [
      { name: 'Chrome', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      { name: 'Firefox', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0' },
      { name: 'Safari', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15' },
      { name: 'Edge', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59' }
    ];

    browsers.forEach(browser => {
      it(`should work correctly in ${browser.name}`, async () => {
        // Mock browser user agent
        Object.defineProperty(navigator, 'userAgent', {
          value: browser.userAgent,
          configurable: true
        });

        // Initialize performance monitoring
        performanceMonitor.start();
        qualityManager.reset();

        // Run basic performance test
        for (let i = 0; i < 10; i++) {
          performanceMonitor.trackOperation(`${browser.name}-test`, 16);
          vi.advanceTimersByTime(16);
        }

        const metrics = performanceMonitor.getMetrics();

        // Verify basic functionality works
        expect(metrics.canvasRenderFPS).toBeGreaterThan(0);
        expect(qualityManager.getCurrentQuality()).toBeDefined();

        performanceMonitor.stop();
      });
    });
  });

  describe('Real-World Performance Simulation', () => {
    it('should handle realistic user interaction patterns', async () => {
      const { container } = render(
        <LightboxCanvas
          canvasState={mockCanvasState}
          canvasActions={mockCanvasActions}
          performanceMode="balanced"
        >
          <div data-testid="canvas-content">Test Content</div>
        </LightboxCanvas>
      );

      performanceDebugger.startProfiling();
      performanceMonitor.start();

      // Simulate realistic user interactions
      const interactions = [
        'hover-section', 'pan-left', 'zoom-in', 'pan-right',
        'zoom-out', 'switch-section', 'rapid-navigation'
      ];

      for (const interaction of interactions) {
        const duration = 12 + Math.random() * 20; // 12-32ms
        performanceDebugger.trackOperation(interaction, duration);
        performanceMonitor.trackOperation(interaction, duration);

        // Simulate some variance in performance
        if (Math.random() > 0.8) {
          // Occasional frame drop
          performanceDebugger.trackFrame(40);
        } else {
          performanceDebugger.trackFrame(16);
        }

        vi.advanceTimersByTime(100);
      }

      const profile = performanceDebugger.stopProfiling();
      const metrics = performanceMonitor.getMetrics();

      // Verify realistic performance
      expect(profile.events.length).toBeGreaterThan(0);
      expect(metrics.canvasRenderFPS).toBeGreaterThan(24); // Minimum acceptable FPS

      performanceMonitor.stop();
    });
  });
});

// Export test utilities for other test files
export {
  simulateDeviceProfile,
  simulatePerformanceCondition,
  DEVICE_PROFILES,
  PERFORMANCE_SCENARIOS
};