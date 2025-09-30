/**
 * useCanvasPerformance Hook
 *
 * Extracted performance monitoring and quality management logic from LightboxCanvas.
 * Consolidates performance monitoring initialization, quality management, and
 * metrics tracking into a single reusable hook.
 *
 * @fileoverview Performance monitoring custom hook
 * @version 1.0.0
 * @since Task 1 - useEffect Optimization
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { CanvasPerformanceMonitor, measureCanvasOperation, optimizedRAF } from '../utils/canvasPerformanceMonitor';
import { CanvasQualityManager, getQualityManager, type QualityLevel } from '../utils/canvasQualityManager';
import type { CanvasPosition } from '../types/canvas';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryMB: number;
}

export interface UseCanvasPerformanceOptions {
  debugMode?: boolean;
  onMetricsUpdate?: (metrics: any) => void;
  onQualityChange?: (quality: QualityLevel) => void;
}

export interface UseCanvasPerformanceReturn {
  performanceMonitor: React.MutableRefObject<CanvasPerformanceMonitor | null>;
  qualityManager: React.MutableRefObject<CanvasQualityManager | null>;
  currentQuality: QualityLevel;
  performanceMetrics: PerformanceMetrics;
  trackPerformance: () => void;
  optimizeCanvasBounds: (position: CanvasPosition, viewport: any, sections: any[]) => void;
}

/**
 * Custom hook for canvas performance monitoring and quality management
 */
export const useCanvasPerformance = (
  options: UseCanvasPerformanceOptions
): UseCanvasPerformanceReturn => {
  const { debugMode = false, onMetricsUpdate, onQualityChange } = options;

  // Refs
  const performanceMonitorRef = useRef<CanvasPerformanceMonitor | null>(null);
  const qualityManagerRef = useRef<CanvasQualityManager | null>(null);

  // State
  const [currentQuality, setCurrentQuality] = useState<QualityLevel>('highest');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryMB: 0
  });

  // Initialize performance monitoring
  useEffect(() => {
    // Initialize performance monitor
    performanceMonitorRef.current = new CanvasPerformanceMonitor(
      (metrics) => {
        // Update performance metrics
        setPerformanceMetrics({
          fps: metrics.canvasRenderFPS,
          frameTime: 1000 / metrics.canvasRenderFPS,
          memoryMB: metrics.canvasMemoryMB
        });

        // Callback for external metrics update
        onMetricsUpdate?.(metrics);
      },
      (qualityLevel) => {
        setCurrentQuality(qualityLevel);
        onQualityChange?.(qualityLevel);
      }
    );

    // Initialize quality manager
    qualityManagerRef.current = getQualityManager();
    qualityManagerRef.current.addListener((event) => {
      setCurrentQuality(event.newLevel);
      onQualityChange?.(event.newLevel);
    });

    // Start monitoring
    performanceMonitorRef.current.start();
    performanceMonitorRef.current.setDebugMode(debugMode);

    return () => {
      performanceMonitorRef.current?.stop();
    };
  }, [debugMode, onMetricsUpdate, onQualityChange]);

  // Quality-based performance adjustment
  useEffect(() => {
    const qualityManager = qualityManagerRef.current;
    if (qualityManager) {
      qualityManager.handlePerformanceChange(
        performanceMetrics.fps,
        performanceMetrics.frameTime,
        performanceMetrics.memoryMB
      );
    }
  }, [performanceMetrics]);

  // Track performance callback
  const trackPerformance = useCallback(() => {
    if (!performanceMonitorRef.current) return;

    return measureCanvasOperation('canvas-render', () => {
      const safeNow = () => {
        try {
          return performance?.now?.() ?? Date.now();
        } catch {
          return Date.now();
        }
      };

      const startTime = safeNow();

      // Measure render performance
      requestAnimationFrame(() => {
        const renderTime = safeNow() - startTime;
        const fps = 1000 / renderTime;

        // Update performance metrics
        setPerformanceMetrics({
          fps: Math.round(fps),
          frameTime: renderTime,
          memoryMB: performanceMetrics.memoryMB
        });
      });
    }, performanceMonitorRef.current);
  }, [performanceMetrics.memoryMB]);

  // Optimize canvas bounds
  const optimizeCanvasBounds = useCallback((
    position: CanvasPosition,
    viewport: any,
    sections: any[]
  ) => {
    if (!performanceMonitorRef.current) return;

    performanceMonitorRef.current.optimizeCanvasBounds(
      position,
      viewport,
      sections
    );
  }, []);

  return {
    performanceMonitor: performanceMonitorRef,
    qualityManager: qualityManagerRef,
    currentQuality,
    performanceMetrics,
    trackPerformance,
    optimizeCanvasBounds
  };
};