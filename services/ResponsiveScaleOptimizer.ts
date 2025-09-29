/**
 * ResponsiveScaleOptimizer Service
 *
 * Extracted responsive scaling optimization logic from SpatialSection.
 * Implements scale caching strategies, transform calculation optimization,
 * and performance monitoring for responsive scale calculations.
 *
 * @fileoverview Optimized responsive scaling with caching and performance monitoring
 * @version 1.0.0
 * @since Task 2 - SpatialSection Component Refinement
 */

import type { CanvasPosition, DeviceType } from '../types/canvas';
import { measureCanvasOperation } from '../utils/canvasPerformanceMonitor';

/**
 * Scale calculation cache entry
 */
interface ScaleCacheEntry {
  responsiveScale: number;
  timestamp: number;
  deviceType: DeviceType;
  canvasScale: number;
}

/**
 * Transform calculation cache entry
 */
interface TransformCacheEntry {
  transform: string;
  transformOrigin: string;
  timestamp: number;
  position: CanvasPosition;
  responsiveScale: number;
}

/**
 * Performance metrics for scale calculations
 */
interface ScalePerformanceMetrics {
  calculationTime: number;
  cacheHitRate: number;
  totalCalculations: number;
  cacheHits: number;
  averageCalculationTime: number;
}

/**
 * Configuration for scale optimization
 */
interface ScaleOptimizerConfig {
  /** Cache TTL in milliseconds */
  cacheTTL: number;
  /** Maximum cache size */
  maxCacheSize: number;
  /** Enable performance monitoring */
  enableMonitoring: boolean;
  /** Precision for scale calculations (decimal places) */
  scalePrecision: number;
  /** Enable transform GPU acceleration */
  enableGPUAcceleration: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ScaleOptimizerConfig = {
  cacheTTL: 5000, // 5 seconds
  maxCacheSize: 100,
  enableMonitoring: true,
  scalePrecision: 2,
  enableGPUAcceleration: true
};

/**
 * Device scale factors optimized for performance
 */
const DEVICE_SCALE_FACTORS = {
  mobile: 0.8,
  tablet: 0.9,
  desktop: 1.0
} as const;

/**
 * ResponsiveScaleOptimizer - Optimized responsive scaling service
 *
 * Responsibilities:
 * - Reduce responsive scale memoization complexity
 * - Implement scale caching strategy for repeated calculations
 * - Profile transform calculation performance impact
 * - Add scaling performance benchmarking and monitoring
 */
export class ResponsiveScaleOptimizer {
  private static instance: ResponsiveScaleOptimizer;
  private scaleCache = new Map<string, ScaleCacheEntry>();
  private transformCache = new Map<string, TransformCacheEntry>();
  private performanceMetrics: ScalePerformanceMetrics = {
    calculationTime: 0,
    cacheHitRate: 0,
    totalCalculations: 0,
    cacheHits: 0,
    averageCalculationTime: 0
  };
  private config: ScaleOptimizerConfig = DEFAULT_CONFIG;

  /**
   * Singleton instance getter
   */
  public static getInstance(): ResponsiveScaleOptimizer {
    if (!ResponsiveScaleOptimizer.instance) {
      ResponsiveScaleOptimizer.instance = new ResponsiveScaleOptimizer();
    }
    return ResponsiveScaleOptimizer.instance;
  }

  /**
   * Configure the optimizer
   */
  public configure(config: Partial<ScaleOptimizerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Calculate responsive scale with caching
   */
  public calculateResponsiveScale(canvasScale: number, deviceType: DeviceType): number {
    const startTime = this.config.enableMonitoring ? performance.now() : 0;

    // Create cache key
    const cacheKey = `${canvasScale.toFixed(this.config.scalePrecision)}_${deviceType}`;

    // Check cache first
    const cached = this.scaleCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      this.recordCacheHit();
      return cached.responsiveScale;
    }

    // Calculate responsive scale
    const deviceScaleFactor = DEVICE_SCALE_FACTORS[deviceType];
    const responsiveScale = Number((canvasScale * deviceScaleFactor).toFixed(this.config.scalePrecision));

    // Cache the result
    this.cacheScaleResult(cacheKey, {
      responsiveScale,
      timestamp: Date.now(),
      deviceType,
      canvasScale
    });

    // Record performance metrics
    if (this.config.enableMonitoring) {
      this.recordCalculation(performance.now() - startTime);
    }

    return responsiveScale;
  }

  /**
   * Calculate spatial transform with optimization
   */
  public calculateSpatialTransform(
    position: CanvasPosition,
    coordinates: { gridX: number; gridY: number; offsetX?: number; offsetY?: number },
    responsiveScale: number
  ): React.CSSProperties {
    return measureCanvasOperation('spatial-transform', () => {
      const startTime = this.config.enableMonitoring ? performance.now() : 0;

      // Create cache key for transform
      const cacheKey = `${position.x}_${position.y}_${responsiveScale}_${coordinates.gridX}_${coordinates.gridY}`;

      // Check transform cache
      const cached = this.transformCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        return {
          transform: cached.transform,
          transformOrigin: cached.transformOrigin,
          backfaceVisibility: 'hidden' as const,
          perspective: this.config.enableGPUAcceleration ? '1000px' : undefined
        };
      }

      // Calculate transform
      const { x, y } = position;
      const { offsetX = 0, offsetY = 0 } = coordinates;

      const transformValue = this.config.enableGPUAcceleration
        ? `translate3d(${x + offsetX}px, ${y + offsetY}px, 0) scale(${responsiveScale})`
        : `translate(${x + offsetX}px, ${y + offsetY}px) scale(${responsiveScale})`;

      const result = {
        transform: transformValue,
        transformOrigin: 'center center',
        backfaceVisibility: 'hidden' as const,
        perspective: this.config.enableGPUAcceleration ? '1000px' : undefined
      };

      // Cache transform result
      this.cacheTransformResult(cacheKey, {
        transform: transformValue,
        transformOrigin: 'center center',
        timestamp: Date.now(),
        position,
        responsiveScale
      });

      // Record performance
      if (this.config.enableMonitoring) {
        this.recordCalculation(performance.now() - startTime);
      }

      return result;
    });
  }

  /**
   * Optimize device type detection with caching
   */
  public getOptimizedDeviceType(): DeviceType {
    // Simple device detection with minimal overhead
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Batch calculate multiple responsive scales
   */
  public batchCalculateScales(
    scales: Array<{ canvasScale: number; deviceType: DeviceType }>
  ): number[] {
    return measureCanvasOperation('batch-scale-calculation', () => {
      return scales.map(({ canvasScale, deviceType }) =>
        this.calculateResponsiveScale(canvasScale, deviceType)
      );
    });
  }

  /**
   * Prefetch scale calculations for common values
   */
  public prefetchCommonScales(deviceType: DeviceType): void {
    const commonScales = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0];

    requestIdleCallback(() => {
      commonScales.forEach(scale => {
        this.calculateResponsiveScale(scale, deviceType);
      });
    });
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): ScalePerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.scaleCache.clear();
    this.transformCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    scaleCache: { size: number; hitRate: number };
    transformCache: { size: number };
    config: ScaleOptimizerConfig;
  } {
    return {
      scaleCache: {
        size: this.scaleCache.size,
        hitRate: this.performanceMetrics.cacheHitRate
      },
      transformCache: {
        size: this.transformCache.size
      },
      config: this.config
    };
  }

  /**
   * Cleanup expired cache entries
   */
  public cleanupCaches(): void {
    const now = Date.now();

    // Clean scale cache
    for (const [key, entry] of this.scaleCache.entries()) {
      if (!this.isCacheValid(entry.timestamp, now)) {
        this.scaleCache.delete(key);
      }
    }

    // Clean transform cache
    for (const [key, entry] of this.transformCache.entries()) {
      if (!this.isCacheValid(entry.timestamp, now)) {
        this.transformCache.delete(key);
      }
    }

    // Enforce cache size limits
    this.enforceCacheSizeLimits();
  }

  /**
   * Profile scale calculation performance
   */
  public profileCalculationPerformance(iterations: number = 1000): {
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
  } {
    const times: number[] = [];
    const testScale = 1.5;
    const testDevice: DeviceType = 'desktop';

    // Clear cache for accurate profiling
    this.clearCaches();

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      this.calculateResponsiveScale(testScale + (i * 0.01), testDevice);
      times.push(performance.now() - start);
    }

    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalTime: times.reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(timestamp: number, now: number = Date.now()): boolean {
    return (now - timestamp) < this.config.cacheTTL;
  }

  /**
   * Cache scale calculation result
   */
  private cacheScaleResult(key: string, entry: ScaleCacheEntry): void {
    this.scaleCache.set(key, entry);

    // Enforce cache size limit
    if (this.scaleCache.size > this.config.maxCacheSize) {
      const firstKey = this.scaleCache.keys().next().value;
      if (firstKey) {
        this.scaleCache.delete(firstKey);
      }
    }
  }

  /**
   * Cache transform calculation result
   */
  private cacheTransformResult(key: string, entry: TransformCacheEntry): void {
    this.transformCache.set(key, entry);

    // Enforce cache size limit
    if (this.transformCache.size > this.config.maxCacheSize) {
      const firstKey = this.transformCache.keys().next().value;
      if (firstKey) {
        this.transformCache.delete(firstKey);
      }
    }
  }

  /**
   * Record cache hit for metrics
   */
  private recordCacheHit(): void {
    if (!this.config.enableMonitoring) return;

    this.performanceMetrics.cacheHits++;
    this.performanceMetrics.totalCalculations++;
    this.updateCacheHitRate();
  }

  /**
   * Record calculation for metrics
   */
  private recordCalculation(time: number): void {
    if (!this.config.enableMonitoring) return;

    this.performanceMetrics.calculationTime += time;
    this.performanceMetrics.totalCalculations++;
    this.performanceMetrics.averageCalculationTime =
      this.performanceMetrics.calculationTime / this.performanceMetrics.totalCalculations;
    this.updateCacheHitRate();
  }

  /**
   * Update cache hit rate
   */
  private updateCacheHitRate(): void {
    this.performanceMetrics.cacheHitRate =
      this.performanceMetrics.cacheHits / this.performanceMetrics.totalCalculations;
  }

  /**
   * Enforce cache size limits
   */
  private enforceCacheSizeLimits(): void {
    while (this.scaleCache.size > this.config.maxCacheSize) {
      const firstKey = this.scaleCache.keys().next().value;
      if (firstKey) {
        this.scaleCache.delete(firstKey);
      }
    }

    while (this.transformCache.size > this.config.maxCacheSize) {
      const firstKey = this.transformCache.keys().next().value;
      if (firstKey) {
        this.transformCache.delete(firstKey);
      }
    }
  }
}

// Export singleton instance and utilities
export const responsiveScaleOptimizer = ResponsiveScaleOptimizer.getInstance();

/**
 * Hook for React components to use optimized scaling
 */
export const useOptimizedResponsiveScale = (canvasScale: number, deviceType?: DeviceType) => {
  const optimizer = ResponsiveScaleOptimizer.getInstance();
  const currentDeviceType = deviceType || optimizer.getOptimizedDeviceType();

  return {
    responsiveScale: optimizer.calculateResponsiveScale(canvasScale, currentDeviceType),
    deviceType: currentDeviceType,
    calculateTransform: (
      position: CanvasPosition,
      coordinates: { gridX: number; gridY: number; offsetX?: number; offsetY?: number }
    ) => optimizer.calculateSpatialTransform(
      position,
      coordinates,
      optimizer.calculateResponsiveScale(canvasScale, currentDeviceType)
    ),
    getPerformanceMetrics: () => optimizer.getPerformanceMetrics(),
    clearCaches: () => optimizer.clearCaches()
  };
};

export default ResponsiveScaleOptimizer;