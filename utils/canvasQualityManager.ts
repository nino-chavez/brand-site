/**
 * Canvas Quality Manager
 *
 * Automatic quality degradation and optimization system for canvas performance.
 * Monitors frame rates and automatically adjusts rendering quality, animation
 * complexity, and effects to maintain smooth 60fps performance.
 *
 * @fileoverview Task 8: Performance Optimization - Automatic Quality Degradation
 * @version 1.0.0
 * @since 2025-09-27
 */

import type { QualityLevel } from './canvasPerformanceMonitor';
import type { CameraMovement } from '../types/canvas';

// Quality configuration for different performance levels
interface QualityConfig {
  // Animation settings
  animationDuration: number;
  easingFunction: string;
  frameSkipping: boolean;

  // Visual effects
  enableBlur: boolean;
  enableOpacity: boolean;
  enableScale: boolean;
  enableShadows: boolean;

  // Rendering optimizations
  useGPUAcceleration: boolean;
  enableSubpixelRendering: boolean;
  transformOptimization: 'none' | 'basic' | 'aggressive';

  // Canvas operations
  maxConcurrentAnimations: number;
  enableBoundsOptimization: boolean;
  cullOffScreenElements: boolean;

  // Performance thresholds
  targetFPS: number;
  maxFrameTime: number;
}

// Quality level configurations
const QUALITY_CONFIGS: Record<QualityLevel, QualityConfig> = {
  highest: {
    animationDuration: 800,
    easingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    frameSkipping: false,
    enableBlur: true,
    enableOpacity: true,
    enableScale: true,
    enableShadows: true,
    useGPUAcceleration: true,
    enableSubpixelRendering: true,
    transformOptimization: 'none',
    maxConcurrentAnimations: 5,
    enableBoundsOptimization: false,
    cullOffScreenElements: false,
    targetFPS: 60,
    maxFrameTime: 16.67
  },
  high: {
    animationDuration: 700,
    easingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    frameSkipping: false,
    enableBlur: true,
    enableOpacity: true,
    enableScale: true,
    enableShadows: true,
    useGPUAcceleration: true,
    enableSubpixelRendering: true,
    transformOptimization: 'basic',
    maxConcurrentAnimations: 4,
    enableBoundsOptimization: true,
    cullOffScreenElements: false,
    targetFPS: 60,
    maxFrameTime: 16.67
  },
  medium: {
    animationDuration: 600,
    easingFunction: 'cubic-bezier(0.2, 0.0, 0.2, 1)',
    frameSkipping: false,
    enableBlur: true,
    enableOpacity: true,
    enableScale: true,
    enableShadows: false,
    useGPUAcceleration: true,
    enableSubpixelRendering: false,
    transformOptimization: 'basic',
    maxConcurrentAnimations: 3,
    enableBoundsOptimization: true,
    cullOffScreenElements: true,
    targetFPS: 45,
    maxFrameTime: 22.22
  },
  low: {
    animationDuration: 400,
    easingFunction: 'ease-out',
    frameSkipping: true,
    enableBlur: false,
    enableOpacity: true,
    enableScale: true,
    enableShadows: false,
    useGPUAcceleration: true,
    enableSubpixelRendering: false,
    transformOptimization: 'aggressive',
    maxConcurrentAnimations: 2,
    enableBoundsOptimization: true,
    cullOffScreenElements: true,
    targetFPS: 30,
    maxFrameTime: 33.33
  },
  minimal: {
    animationDuration: 200,
    easingFunction: 'linear',
    frameSkipping: true,
    enableBlur: false,
    enableOpacity: false,
    enableScale: false,
    enableShadows: false,
    useGPUAcceleration: false,
    enableSubpixelRendering: false,
    transformOptimization: 'aggressive',
    maxConcurrentAnimations: 1,
    enableBoundsOptimization: true,
    cullOffScreenElements: true,
    targetFPS: 20,
    maxFrameTime: 50
  }
};

// Quality change event interface
interface QualityChangeEvent {
  previousLevel: QualityLevel;
  newLevel: QualityLevel;
  reason: 'performance' | 'manual' | 'device' | 'battery';
  timestamp: number;
  config: QualityConfig;
}

/**
 * Canvas Quality Manager
 *
 * Automatically adjusts canvas rendering quality based on performance metrics.
 * Provides smooth degradation and restoration of visual effects to maintain
 * optimal user experience across different devices and performance conditions.
 */
export class CanvasQualityManager {
  private currentQuality: QualityLevel = 'highest';
  private config: QualityConfig = QUALITY_CONFIGS.highest;
  private listeners: Array<(event: QualityChangeEvent) => void> = [];
  private degradationHistory: QualityChangeEvent[] = [];
  private autoAdjustEnabled = true;
  private manualOverride = false;

  constructor(initialQuality: QualityLevel = 'highest') {
    this.setQuality(initialQuality, 'manual');
    this.initializeEventListeners();
    this.detectDeviceCapabilities();
  }

  /**
   * Get current quality level
   */
  getCurrentQuality(): QualityLevel {
    return this.currentQuality;
  }

  /**
   * Get current quality configuration
   */
  getCurrentConfig(): QualityConfig {
    return { ...this.config };
  }

  /**
   * Set quality level manually
   */
  setQuality(level: QualityLevel, reason: QualityChangeEvent['reason'] = 'manual'): void {
    const previousLevel = this.currentQuality;

    if (previousLevel === level) return;

    this.currentQuality = level;
    this.config = { ...QUALITY_CONFIGS[level] };
    this.manualOverride = reason === 'manual';

    const event: QualityChangeEvent = {
      previousLevel,
      newLevel: level,
      reason,
      timestamp: performance.now(),
      config: this.config
    };

    this.degradationHistory.push(event);
    this.notifyListeners(event);
    this.applyQualityChanges(event);
  }

  /**
   * Enable/disable automatic quality adjustment
   */
  setAutoAdjust(enabled: boolean): void {
    this.autoAdjustEnabled = enabled;
    if (!enabled) {
      this.manualOverride = true;
    }
  }

  /**
   * Handle performance-based quality adjustment
   */
  handlePerformanceChange(fps: number, frameTime: number, memoryMB: number): void {
    if (!this.autoAdjustEnabled || this.manualOverride) return;

    const newQuality = this.calculateOptimalQuality(fps, frameTime, memoryMB);

    if (newQuality !== this.currentQuality) {
      this.setQuality(newQuality, 'performance');
    }
  }

  /**
   * Get optimized animation configuration for camera movements
   */
  getAnimationConfig(movement: CameraMovement): {
    duration: number;
    easing: string;
    useGPU: boolean;
    skipFrames: boolean;
  } {
    const baseConfig = this.config;

    // Adjust duration based on movement type
    const movementMultipliers = {
      'pan-tilt': 1.0,
      'zoom-in': 0.8,
      'zoom-out': 0.8,
      'dolly-zoom': 1.2,
      'rack-focus': 0.6,
      'match-cut': 0.4
    };

    const duration = baseConfig.animationDuration * (movementMultipliers[movement] || 1.0);

    return {
      duration,
      easing: baseConfig.easingFunction,
      useGPU: baseConfig.useGPUAcceleration,
      skipFrames: baseConfig.frameSkipping
    };
  }

  /**
   * Get CSS optimizations for current quality level
   */
  getCSSOptimizations(): Record<string, string> {
    const optimizations: Record<string, string> = {};

    // Base optimizations
    if (this.config.useGPUAcceleration) {
      optimizations.transform = 'translateZ(0)';
      optimizations.backfaceVisibility = 'hidden';
      optimizations.perspective = '1000px';
    }

    // Subpixel rendering
    if (!this.config.enableSubpixelRendering) {
      optimizations.WebkitFontSmoothing = 'none';
      optimizations.textRendering = 'optimizeSpeed';
    }

    // Transform optimizations
    switch (this.config.transformOptimization) {
      case 'basic':
        optimizations.willChange = 'transform';
        break;
      case 'aggressive':
        optimizations.willChange = 'auto';
        optimizations.transformStyle = 'flat';
        break;
    }

    // Effects management
    if (!this.config.enableShadows) {
      optimizations.boxShadow = 'none';
      optimizations.filter = 'none';
    }

    return optimizations;
  }

  /**
   * Check if specific effects should be enabled
   */
  shouldEnableEffect(effect: 'blur' | 'opacity' | 'scale' | 'shadows'): boolean {
    switch (effect) {
      case 'blur': return this.config.enableBlur;
      case 'opacity': return this.config.enableOpacity;
      case 'scale': return this.config.enableScale;
      case 'shadows': return this.config.enableShadows;
      default: return true;
    }
  }

  /**
   * Get performance thresholds for current quality
   */
  getPerformanceThresholds(): { targetFPS: number; maxFrameTime: number } {
    return {
      targetFPS: this.config.targetFPS,
      maxFrameTime: this.config.maxFrameTime
    };
  }

  /**
   * Add quality change listener
   */
  addListener(listener: (event: QualityChangeEvent) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove quality change listener
   */
  removeListener(listener: (event: QualityChangeEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Get degradation history for debugging
   */
  getDegradationHistory(): QualityChangeEvent[] {
    return [...this.degradationHistory];
  }

  /**
   * Reset to highest quality (for debugging/testing)
   */
  reset(): void {
    this.setQuality('highest', 'manual');
    this.manualOverride = false;
    this.autoAdjustEnabled = true;
    this.degradationHistory = [];
  }

  // Private methods

  private calculateOptimalQuality(fps: number, frameTime: number, memoryMB: number): QualityLevel {
    // Memory pressure check
    if (memoryMB > 150) {
      return 'low';
    }

    // FPS-based quality determination
    if (fps < 20) return 'minimal';
    if (fps < 30) return 'low';
    if (fps < 45) return 'medium';
    if (fps < 55) return 'high';
    return 'highest';
  }

  private detectDeviceCapabilities(): void {
    // Detect low-end devices and adjust initial quality
    const deviceMemory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;

    if (deviceMemory && deviceMemory < 2) {
      this.setQuality('low', 'device');
    } else if (hardwareConcurrency < 4) {
      this.setQuality('medium', 'device');
    }

    // Battery API for mobile devices
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2 && !battery.charging) {
            this.setQuality('low', 'battery');
          }
        });
      });
    }
  }

  private initializeEventListeners(): void {
    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Reduce quality when tab is not visible
        this.setQuality('minimal', 'performance');
      }
    });

    // Listen for resize events
    window.addEventListener('resize', () => {
      // Temporarily reduce quality during resize
      const currentQuality = this.currentQuality;
      this.setQuality('medium', 'performance');

      setTimeout(() => {
        this.setQuality(currentQuality, 'performance');
      }, 500);
    });
  }

  private notifyListeners(event: QualityChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Quality change listener error:', error);
      }
    });
  }

  private applyQualityChanges(event: QualityChangeEvent): void {
    // Apply CSS custom properties for quality settings
    const root = document.documentElement;

    root.style.setProperty('--canvas-animation-duration', `${this.config.animationDuration}ms`);
    root.style.setProperty('--canvas-easing-function', this.config.easingFunction);
    root.style.setProperty('--canvas-max-concurrent-animations', this.config.maxConcurrentAnimations.toString());

    // Dispatch custom event for components to react
    window.dispatchEvent(new CustomEvent('canvas-quality-change', {
      detail: event
    }));

    console.log(`Canvas quality changed: ${event.previousLevel} → ${event.newLevel} (${event.reason})`);
  }
}

// Global quality manager instance
let globalQualityManager: CanvasQualityManager | null = null;

/**
 * Get or create global quality manager instance
 */
export function getQualityManager(): CanvasQualityManager {
  if (!globalQualityManager) {
    globalQualityManager = new CanvasQualityManager();
  }
  return globalQualityManager;
}

/**
 * Initialize quality manager with performance monitor
 */
export function initializeQualityManager(
  onQualityChange?: (event: QualityChangeEvent) => void
): CanvasQualityManager {
  const manager = getQualityManager();

  if (onQualityChange) {
    manager.addListener(onQualityChange);
  }

  return manager;
}

export default CanvasQualityManager;