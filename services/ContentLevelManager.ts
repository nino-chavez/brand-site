/**
 * ContentLevelManager Service
 *
 * Extracted scale threshold logic and content level determination from SpatialSection.
 * Implements dynamic threshold adjustment based on device capabilities and provides
 * centralized content level management for progressive disclosure.
 *
 * @fileoverview Centralized content level management with dynamic thresholds
 * @version 1.0.0
 * @since Task 2 - SpatialSection Component Refinement
 */

import type { ContentLevel, DeviceType } from '../types/canvas';

/**
 * Scale thresholds for progressive disclosure
 */
export const SCALE_THRESHOLDS = {
  MINIMAL: 0.6,     // Show only essential content
  COMPACT: 0.8,     // Show reduced content
  NORMAL: 1.0,      // Show full content
  DETAILED: 1.5,    // Show enhanced content
  EXPANDED: 2.0     // Show maximum detail
} as const;

/**
 * Responsive breakpoints for canvas-aware sizing
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: { maxWidth: 768, scaleFactor: 0.8 },
  tablet: { maxWidth: 1024, scaleFactor: 0.9 },
  desktop: { maxWidth: Infinity, scaleFactor: 1.0 }
} as const;

/**
 * Content level configuration with performance characteristics
 */
export const CONTENT_LEVEL_CONFIG = {
  minimal: {
    performance: 'highest',
    features: ['title'],
    padding: '0.5rem',
    interactivity: false
  },
  compact: {
    performance: 'high',
    features: ['title', 'subtitle'],
    padding: '0.75rem',
    interactivity: true
  },
  normal: {
    performance: 'medium',
    features: ['title', 'subtitle', 'content'],
    padding: '1rem',
    interactivity: true
  },
  detailed: {
    performance: 'low',
    features: ['title', 'subtitle', 'content', 'metadata'],
    padding: '1.5rem',
    interactivity: true
  },
  expanded: {
    performance: 'lowest',
    features: ['title', 'subtitle', 'content', 'metadata', 'enhanced'],
    padding: '2rem',
    interactivity: true
  }
} as const;

/**
 * Device capability detection for dynamic threshold adjustment
 */
interface DeviceCapabilities {
  maxMemoryMB: number;
  gpuAcceleration: boolean;
  touchCapable: boolean;
  highDPI: boolean;
}

/**
 * Cache for threshold calculations to improve performance
 */
const thresholdCache = new Map<string, ContentLevel>();

/**
 * ContentLevelManager - Centralized content level and threshold management
 *
 * Responsibilities:
 * - Scale threshold calculations and content level determination
 * - Dynamic threshold adjustment based on device capabilities
 * - Content level caching and performance optimization
 * - Threshold debugging and validation tools
 */
export class ContentLevelManager {
  private static instance: ContentLevelManager;
  private deviceCapabilities: DeviceCapabilities | null = null;
  private customThresholds: Partial<typeof SCALE_THRESHOLDS> = {};
  private debugMode: boolean = false;

  /**
   * Singleton instance getter
   */
  public static getInstance(): ContentLevelManager {
    if (!ContentLevelManager.instance) {
      ContentLevelManager.instance = new ContentLevelManager();
    }
    return ContentLevelManager.instance;
  }

  /**
   * Initialize the content level manager with device detection
   */
  public initialize(debugMode: boolean = false): void {
    this.debugMode = debugMode;
    this.detectDeviceCapabilities();
    this.adjustThresholdsForDevice();
  }

  /**
   * Get current device type based on window width
   */
  public getCurrentDeviceType(): DeviceType {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width <= RESPONSIVE_BREAKPOINTS.mobile.maxWidth) return 'mobile';
    if (width <= RESPONSIVE_BREAKPOINTS.tablet.maxWidth) return 'tablet';
    return 'desktop';
  }

  /**
   * Calculate responsive scale factor based on device and canvas scale
   */
  public calculateResponsiveScale(canvasScale: number, deviceType?: DeviceType): number {
    const device = deviceType || this.getCurrentDeviceType();
    const deviceScaleFactor = RESPONSIVE_BREAKPOINTS[device].scaleFactor;
    return canvasScale * deviceScaleFactor;
  }

  /**
   * Determine content level based on responsive scale with caching
   */
  public determineContentLevel(responsiveScale: number): ContentLevel {
    const cacheKey = `${responsiveScale.toFixed(2)}`;

    // Check cache first
    if (thresholdCache.has(cacheKey)) {
      return thresholdCache.get(cacheKey)!;
    }

    // Calculate content level
    let contentLevel: ContentLevel;
    const thresholds = this.getEffectiveThresholds();

    if (responsiveScale <= thresholds.MINIMAL) contentLevel = 'minimal';
    else if (responsiveScale <= thresholds.COMPACT) contentLevel = 'compact';
    else if (responsiveScale <= thresholds.NORMAL) contentLevel = 'normal';
    else if (responsiveScale <= thresholds.DETAILED) contentLevel = 'detailed';
    else contentLevel = 'expanded';

    // Cache the result
    thresholdCache.set(cacheKey, contentLevel);

    if (this.debugMode) {
      console.log(`ContentLevelManager: Scale ${responsiveScale.toFixed(2)} → ${contentLevel}`);
    }

    return contentLevel;
  }

  /**
   * Get progressive styles for a content level
   */
  public getProgressiveStyles(contentLevel: ContentLevel, isActive: boolean): React.CSSProperties {
    const config = CONTENT_LEVEL_CONFIG[contentLevel];

    return {
      transition: 'all 160ms cubic-bezier(0.4, 0, 0.6, 1)', // athletic-transition
      willChange: isActive ? 'transform, opacity' : 'auto',
      padding: config.padding,
      pointerEvents: config.interactivity ? 'auto' : 'none'
    };
  }

  /**
   * Get content features available for a content level
   */
  public getContentFeatures(contentLevel: ContentLevel): string[] {
    return CONTENT_LEVEL_CONFIG[contentLevel].features;
  }

  /**
   * Check if interactivity is enabled for a content level
   */
  public isInteractivityEnabled(contentLevel: ContentLevel): boolean {
    return CONTENT_LEVEL_CONFIG[contentLevel].interactivity;
  }

  /**
   * Set custom thresholds for specific use cases
   */
  public setCustomThresholds(thresholds: Partial<typeof SCALE_THRESHOLDS>): void {
    this.customThresholds = { ...this.customThresholds, ...thresholds };
    this.clearCache();
  }

  /**
   * Reset to default thresholds
   */
  public resetThresholds(): void {
    this.customThresholds = {};
    this.clearCache();
  }

  /**
   * Get effective thresholds (default + custom + device adjustments)
   */
  private getEffectiveThresholds(): typeof SCALE_THRESHOLDS {
    return {
      ...SCALE_THRESHOLDS,
      ...this.customThresholds
    };
  }

  /**
   * Detect device capabilities for dynamic threshold adjustment
   */
  private detectDeviceCapabilities(): void {
    if (typeof window === 'undefined') return;

    this.deviceCapabilities = {
      maxMemoryMB: this.estimateMemory(),
      gpuAcceleration: this.detectGPUAcceleration(),
      touchCapable: 'ontouchstart' in window,
      highDPI: window.devicePixelRatio > 1.5
    };
  }

  /**
   * Adjust thresholds based on device capabilities
   */
  private adjustThresholdsForDevice(): void {
    if (!this.deviceCapabilities) return;

    const adjustments: Partial<typeof SCALE_THRESHOLDS> = {};

    // Lower thresholds for low-memory devices
    if (this.deviceCapabilities.maxMemoryMB < 2048) {
      adjustments.DETAILED = SCALE_THRESHOLDS.DETAILED * 1.2;
      adjustments.EXPANDED = SCALE_THRESHOLDS.EXPANDED * 1.3;
    }

    // Adjust for touch devices
    if (this.deviceCapabilities.touchCapable) {
      adjustments.MINIMAL = SCALE_THRESHOLDS.MINIMAL * 0.9;
      adjustments.COMPACT = SCALE_THRESHOLDS.COMPACT * 0.95;
    }

    this.setCustomThresholds(adjustments);

    if (this.debugMode) {
      console.log('ContentLevelManager: Device capabilities detected', this.deviceCapabilities);
      console.log('ContentLevelManager: Threshold adjustments applied', adjustments);
    }
  }

  /**
   * Estimate available memory (rough approximation)
   */
  private estimateMemory(): number {
    // Use performance.memory if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    }

    // Fallback estimation based on device type
    const deviceType = this.getCurrentDeviceType();
    switch (deviceType) {
      case 'mobile': return 1024; // 1GB estimate
      case 'tablet': return 2048; // 2GB estimate
      case 'desktop': return 4096; // 4GB estimate
      default: return 2048;
    }
  }

  /**
   * Detect GPU acceleration capability
   */
  private detectGPUAcceleration(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }

  /**
   * Clear the threshold cache
   */
  private clearCache(): void {
    thresholdCache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: thresholdCache.size,
      keys: Array.from(thresholdCache.keys())
    };
  }

  /**
   * Validate threshold configuration
   */
  public validateThresholds(): { valid: boolean; errors: string[] } {
    const thresholds = this.getEffectiveThresholds();
    const errors: string[] = [];

    // Check threshold ordering
    if (thresholds.MINIMAL >= thresholds.COMPACT) {
      errors.push('MINIMAL threshold must be less than COMPACT');
    }
    if (thresholds.COMPACT >= thresholds.NORMAL) {
      errors.push('COMPACT threshold must be less than NORMAL');
    }
    if (thresholds.NORMAL >= thresholds.DETAILED) {
      errors.push('NORMAL threshold must be less than DETAILED');
    }
    if (thresholds.DETAILED >= thresholds.EXPANDED) {
      errors.push('DETAILED threshold must be less than EXPANDED');
    }

    // Check reasonable ranges
    if (thresholds.MINIMAL < 0.1 || thresholds.MINIMAL > 1.0) {
      errors.push('MINIMAL threshold should be between 0.1 and 1.0');
    }
    if (thresholds.EXPANDED > 5.0) {
      errors.push('EXPANDED threshold should not exceed 5.0');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export convenience functions for common operations
export const contentLevelManager = ContentLevelManager.getInstance();

/**
 * Hook-style function for React components
 */
export const useContentLevelManager = () => {
  return {
    determineContentLevel: (scale: number) => contentLevelManager.determineContentLevel(scale),
    calculateResponsiveScale: (scale: number, device?: DeviceType) =>
      contentLevelManager.calculateResponsiveScale(scale, device),
    getProgressiveStyles: (level: ContentLevel, isActive: boolean) =>
      contentLevelManager.getProgressiveStyles(level, isActive),
    getContentFeatures: (level: ContentLevel) =>
      contentLevelManager.getContentFeatures(level),
    isInteractivityEnabled: (level: ContentLevel) =>
      contentLevelManager.isInteractivityEnabled(level),
    getCurrentDeviceType: () => contentLevelManager.getCurrentDeviceType()
  };
};

export default ContentLevelManager;