/**
 * Performance Monitoring Service
 *
 * Unified performance monitoring service that consolidates all monitoring capabilities
 * from scattered systems. Implements singleton pattern with observer notifications,
 * decoupled data collection, and adaptive device optimization strategies.
 *
 * @fileoverview Task 6: Performance Monitoring and Optimization Enhancement
 * @version 1.0.0
 * @since Task 6 - Decoupling and Architecture Improvement
 */

import type { QualityLevel } from '../utils/canvasPerformanceMonitor';
import type { CanvasPosition, CameraMovement } from '../types/canvas';
import { getDataCollectionManager, type PerformanceDataCollectionManager } from './PerformanceDataCollectionService';
import { getPerformanceDataCache, type PerformanceDataCache } from '../utils/performanceDataCache';
import { getDataExportManager, type PerformanceDataExportManager } from '../utils/performanceDataExport';
import { getOverheadProfiler, type PerformanceOverheadProfiler } from '../utils/performanceOverheadProfiler';
import { getAdaptiveQualityManager, type AdaptiveQualityManager } from '../utils/adaptiveQualityManager';
import { getAccuracyValidator, type PerformanceAccuracyValidator } from '../utils/performanceAccuracyValidator';

// ===== UNIFIED PERFORMANCE TYPES =====

/**
 * Comprehensive performance metrics combining all monitoring systems
 */
export interface UnifiedPerformanceMetrics {
  // Frame performance
  currentFPS: number;
  averageFPS: number;
  frameTime: number;
  droppedFrames: number;
  totalFrames: number;

  // Memory metrics
  memoryUsageMB: number;
  memoryPercentage: number;
  heapSizeMB: number;
  garbageCollections: number;

  // Canvas-specific metrics
  canvasRenderFPS: number;
  averageMovementTime: number;
  transformOverhead: number;
  canvasMemoryMB: number;
  gpuUtilization: number;
  activeOperations: number;

  // System metrics
  networkLatency: number;
  batteryLevel?: number;
  isLowPowerMode: boolean;
  compositeLayerCount: number;

  // Quality management
  qualityLevel: QualityLevel;
  isOptimized: boolean;
  optimizationReason?: string;

  // Timestamps
  timestamp: number;
  sessionDuration: number;
}

/**
 * Performance degradation alert
 */
export interface PerformanceDegradationAlert {
  type: 'fps-drop' | 'memory-leak' | 'battery-low' | 'thermal-throttle' | 'network-slow' | 'gpu-overload';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metrics: Partial<UnifiedPerformanceMetrics>;
  recommendations: string[];
  autoActions: PerformanceAutoAction[];
}

/**
 * Automatic performance optimization action
 */
export interface PerformanceAutoAction {
  action: 'reduce-quality' | 'pause-animations' | 'limit-fps' | 'garbage-collect' | 'battery-save' | 'cull-offscreen';
  applied: boolean;
  impact: string;
  timestamp: number;
}

/**
 * Device capability detection results
 */
export interface DeviceCapabilities {
  // Hardware capabilities
  deviceMemoryGB?: number;
  hardwareConcurrency: number;
  devicePixelRatio: number;
  maxTouchPoints: number;

  // API support
  supportsPerformanceAPI: boolean;
  supportsMemoryAPI: boolean;
  supportsBatteryAPI: boolean;
  supportsIntersectionObserver: boolean;
  supportsRAF: boolean;
  supportsGPUTiming: boolean;

  // Network capabilities
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };

  // Performance characteristics
  estimatedPerformanceTier: 'low' | 'medium' | 'high' | 'premium';
  recommendedQualityLevel: QualityLevel;
}

/**
 * Performance observer interface for loose coupling
 */
export interface PerformanceObserver {
  id: string;
  onMetricsUpdate?: (metrics: UnifiedPerformanceMetrics) => void;
  onDegradationAlert?: (alert: PerformanceDegradationAlert) => void;
  onQualityChange?: (oldLevel: QualityLevel, newLevel: QualityLevel, reason: string) => void;
  onOptimizationApplied?: (action: PerformanceAutoAction) => void;
}

/**
 * Configuration for performance monitoring service
 */
export interface PerformanceMonitoringConfig {
  // Sampling configuration
  metricsUpdateInterval: number; // ms
  frameSampleSize: number;
  memorySampleSize: number;

  // Monitoring overhead control
  enableHighFrequencyMonitoring: boolean;
  maxMonitoringOverhead: number; // percentage
  adaptiveSampling: boolean;

  // Automatic optimization
  enableAutoOptimization: boolean;
  enableQualityDegradation: boolean;
  enableBatteryOptimization: boolean;
  enableMemoryManagement: boolean;

  // Alert thresholds
  fpsWarningThreshold: number;
  fpsCriticalThreshold: number;
  memoryWarningThreshold: number;
  memoryCriticalThreshold: number;

  // Debug and validation
  enableDebugMode: boolean;
  enableAccuracyValidation: boolean;
  logPerformanceWarnings: boolean;
}

// ===== PERFORMANCE MONITORING SERVICE =====

/**
 * Unified Performance Monitoring Service (Singleton)
 *
 * Consolidates all performance monitoring capabilities into a single service
 * with observer pattern for loose coupling and device-adaptive optimization.
 *
 * Features:
 * - Unified metrics from all monitoring systems
 * - Observer pattern for decoupled notifications
 * - Low-overhead monitoring with adaptive sampling
 * - Device capability detection and optimization
 * - Automatic quality degradation and restoration
 * - Comprehensive performance validation
 */
export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService | null = null;
  private isInitialized = false;
  private isMonitoring = false;

  // Configuration and capabilities
  private config: PerformanceMonitoringConfig;
  private deviceCapabilities: DeviceCapabilities | null = null;

  // Observer management
  private observers = new Map<string, PerformanceObserver>();
  private observerCallbacks = new Map<string, Set<string>>(); // observer -> callback types

  // Performance tracking state
  private metrics: UnifiedPerformanceMetrics;
  private metricsHistory: UnifiedPerformanceMetrics[] = [];
  private alerts: PerformanceDegradationAlert[] = [];
  private appliedOptimizations: PerformanceAutoAction[] = [];

  // Monitoring control
  private rafId: number | null = null;
  private metricsIntervalId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private sessionStartTime = 0;

  // Overhead tracking
  private monitoringStartTime = 0;
  private totalMonitoringTime = 0;
  private lastOverheadCheck = 0;

  // Data collection system (Task 6.3: Separated data collection from UI updates)
  private dataCollectionManager: PerformanceDataCollectionManager;
  private dataCache: PerformanceDataCache;
  private dataExportManager: PerformanceDataExportManager;

  // Overhead profiling system (Task 6.4: Profile and optimize monitoring overhead)
  private overheadProfiler: PerformanceOverheadProfiler;

  // Adaptive quality management system (Task 6.5: Adaptive quality management strategies)
  private adaptiveQualityManager: AdaptiveQualityManager;

  // Accuracy validation system (Task 6.6: Validate monitoring accuracy and system reliability)
  private accuracyValidator: PerformanceAccuracyValidator;

  private constructor(config?: Partial<PerformanceMonitoringConfig>) {
    this.config = {
      metricsUpdateInterval: 1000,
      frameSampleSize: 60,
      memorySampleSize: 30,
      enableHighFrequencyMonitoring: true,
      maxMonitoringOverhead: 2.0,
      adaptiveSampling: true,
      enableAutoOptimization: true,
      enableQualityDegradation: true,
      enableBatteryOptimization: true,
      enableMemoryManagement: true,
      fpsWarningThreshold: 45,
      fpsCriticalThreshold: 30,
      memoryWarningThreshold: 100,
      memoryCriticalThreshold: 200,
      enableDebugMode: false,
      enableAccuracyValidation: true,
      logPerformanceWarnings: true,
      ...config
    };

    this.metrics = this.createDefaultMetrics();
    this.sessionStartTime = this.safePerformanceNow();

    // Initialize data collection system (Task 6.3: Separated data collection)
    this.dataCollectionManager = getDataCollectionManager({
      enabled: true,
      samplingInterval: this.config.enableHighFrequencyMonitoring ? 16.67 : 100, // 60fps or 10hz
      batchSize: 20,
      aggregationWindow: 5000, // 5 seconds
      maxCacheSize: 500,
      persistenceEnabled: false, // Memory-only by default
      realtimeProcessing: this.config.enableHighFrequencyMonitoring
    });

    this.dataCache = getPerformanceDataCache({
      enabled: true,
      maxSize: 200,
      maxAge: 300000, // 5 minutes
      persistenceEnabled: false,
      storageBackend: 'memory',
      autoCleanupInterval: 60000 // 1 minute
    });

    this.dataExportManager = getDataExportManager();

    // Initialize overhead profiling system (Task 6.4: Monitoring overhead optimization)
    this.overheadProfiler = getOverheadProfiler({
      enabled: this.config.enableDebugMode || this.config.enableAccuracyValidation,
      maxAcceptableOverhead: this.config.maxMonitoringOverhead,
      samplingStrategy: 'adaptive',
      baselineSamples: 20,
      profilingInterval: 2000, // 2 seconds
      adaptiveThresholds: {
        fps: this.config.fpsWarningThreshold,
        memory: this.config.memoryWarningThreshold,
        cpu: 75
      },
      optimizationStrategies: ['reduce-frequency', 'batch-operations', 'defer-processing']
    });

    // Initialize adaptive quality management (Task 6.5: Device-aware quality strategies)
    this.adaptiveQualityManager = getAdaptiveQualityManager();

    // Initialize accuracy validation system (Task 6.6: Monitoring accuracy validation)
    this.accuracyValidator = getAccuracyValidator({
      enabled: this.config.enableAccuracyValidation,
      validationInterval: 60000, // 1 minute
      sampleSize: 30,
      toleranceThresholds: {
        fps: 5, // 5% variance acceptable
        memory: 10, // 10% variance acceptable
        timing: 2, // 2ms variance acceptable
        overhead: this.config.maxMonitoringOverhead
      },
      crossValidationEnabled: true,
      realTimeValidation: this.config.enableDebugMode
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<PerformanceMonitoringConfig>): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService(config);
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Initialize the monitoring service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.debugLog('Initializing PerformanceMonitoringService...');

    // Detect device capabilities
    this.deviceCapabilities = await this.detectDeviceCapabilities();

    // Adjust configuration based on device capabilities
    this.adaptConfigurationToDevice();

    // Setup performance observers
    this.setupPerformanceObservers();

    // Initialize quality management
    this.initializeQualityManagement();

    // Initialize adaptive quality management (Task 6.5: Adaptive quality strategies)
    await this.adaptiveQualityManager.initialize();

    // Set up quality management callbacks
    this.adaptiveQualityManager.setCallbacks({
      onQualityChange: (oldLevel, newLevel, reason) => {
        this.handleAdaptiveQualityChange(oldLevel, newLevel, reason);
      },
      onOptimizationApplied: (optimization) => {
        this.debugLog('Adaptive optimization applied:', optimization);
      }
    });

    this.isInitialized = true;
    this.debugLog('PerformanceMonitoringService initialized', this.deviceCapabilities);
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    if (!this.isInitialized) {
      throw new Error('PerformanceMonitoringService must be initialized before starting monitoring');
    }

    if (this.isMonitoring) return;

    this.debugLog('Starting performance monitoring...');
    this.isMonitoring = true;
    this.sessionStartTime = this.safePerformanceNow();
    this.frameCount = 0;

    // Start separated data collection (Task 6.3: Decoupled from UI updates)
    this.dataCollectionManager.startCollection();

    // Start overhead profiling (Task 6.4: Monitor monitoring overhead)
    this.overheadProfiler.startProfiling();

    // Start accuracy validation (Task 6.6: Validate monitoring accuracy)
    if (this.config.enableAccuracyValidation) {
      this.accuracyValidator.startValidation();
    }

    // Start frame-based monitoring
    if (this.config.enableHighFrequencyMonitoring) {
      this.startFrameMonitoring();
    }

    // Start interval-based metrics collection
    this.startMetricsCollection();
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.debugLog('Stopping performance monitoring...');
    this.isMonitoring = false;

    // Stop separated data collection (Task 6.3: Clean shutdown)
    this.dataCollectionManager.stopCollection();

    // Stop overhead profiling (Task 6.4: Clean profiler shutdown)
    this.overheadProfiler.stopProfiling();

    // Stop accuracy validation (Task 6.6: Clean validator shutdown)
    this.accuracyValidator.stopValidation();

    // Stop frame monitoring
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Stop metrics collection
    if (this.metricsIntervalId) {
      clearInterval(this.metricsIntervalId);
      this.metricsIntervalId = null;
    }

    this.debugLog(`Session ended. Total monitoring overhead: ${this.getMonitoringOverhead().toFixed(2)}%`);
  }

  /**
   * Subscribe to performance updates with observer pattern
   */
  public subscribe(observer: PerformanceObserver): void {
    this.observers.set(observer.id, observer);

    // Track which callbacks this observer provides
    const callbacks = new Set<string>();
    if (observer.onMetricsUpdate) callbacks.add('metrics');
    if (observer.onDegradationAlert) callbacks.add('alerts');
    if (observer.onQualityChange) callbacks.add('quality');
    if (observer.onOptimizationApplied) callbacks.add('optimization');

    this.observerCallbacks.set(observer.id, callbacks);
    this.debugLog(`Observer ${observer.id} subscribed with callbacks: ${Array.from(callbacks).join(', ')}`);
  }

  /**
   * Unsubscribe from performance updates
   */
  public unsubscribe(observerId: string): void {
    this.observers.delete(observerId);
    this.observerCallbacks.delete(observerId);
    this.debugLog(`Observer ${observerId} unsubscribed`);
  }

  /**
   * Get current performance metrics
   */
  public getCurrentMetrics(): UnifiedPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get device capabilities
   */
  public getDeviceCapabilities(): DeviceCapabilities | null {
    return this.deviceCapabilities ? { ...this.deviceCapabilities } : null;
  }

  /**
   * Get performance history
   */
  public getMetricsHistory(maxEntries?: number): UnifiedPerformanceMetrics[] {
    const history = [...this.metricsHistory];
    return maxEntries ? history.slice(-maxEntries) : history;
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): PerformanceDegradationAlert[] {
    const cutoffTime = this.safePerformanceNow() - 30000; // Last 30 seconds
    return this.alerts.filter(alert => alert.timestamp > cutoffTime);
  }

  /**
   * Get applied optimizations
   */
  public getAppliedOptimizations(): PerformanceAutoAction[] {
    return [...this.appliedOptimizations];
  }

  /**
   * Manually set quality level (also updates adaptive quality manager)
   */
  public setQualityLevel(level: QualityLevel, reason: string = 'manual'): void {
    const oldLevel = this.metrics.qualityLevel;
    if (oldLevel !== level) {
      this.metrics.qualityLevel = level;

      // Update adaptive quality manager if this is a manual override
      if (reason === 'manual' || reason.startsWith('manual-')) {
        this.adaptiveQualityManager.forceQualityLevel(level, reason);
      }

      this.notifyQualityChange(oldLevel, level, reason);
      this.debugLog(`Quality changed: ${oldLevel} → ${level} (${reason})`);
    }
  }

  /**
   * Handle adaptive quality changes (Task 6.5: Adaptive quality integration)
   */
  private handleAdaptiveQualityChange(oldLevel: QualityLevel, newLevel: QualityLevel, reason: string): void {
    // Update internal metrics
    this.metrics.qualityLevel = newLevel;
    this.metrics.isOptimized = reason.includes('optimization') || reason.includes('battery');

    if (reason.includes('optimization')) {
      this.metrics.optimizationReason = reason;
    }

    // Notify observers about quality change
    this.notifyQualityChange(oldLevel, newLevel, reason);

    if (this.config.enableDebugMode) {
      this.debugLog(`Adaptive quality change: ${oldLevel} → ${newLevel} (${reason})`);
    }
  }

  /**
   * Track custom performance operation
   */
  public trackOperation(name: string, duration: number, metadata?: any): void {
    // Use overhead profiler to measure this monitoring operation (Task 6.4)
    this.overheadProfiler.measureOperation(`trackOperation:${name}`, () => {
      this.monitoringStartTime = this.safePerformanceNow();

      // Send to separated data collection system (Task 6.3: Decoupled data collection)
      this.dataCollectionManager.collectOperationData(name, duration, metadata);

      // Update transform overhead if it's a transform operation
      if (name.includes('transform') || name.includes('canvas')) {
        this.metrics.transformOverhead = Math.max(this.metrics.transformOverhead, duration);
      }

      // Update active operations count
      this.metrics.activeOperations = Math.max(0, this.metrics.activeOperations);

      this.totalMonitoringTime += this.safePerformanceNow() - this.monitoringStartTime;
    });
  }

  /**
   * Get monitoring overhead percentage
   */
  public getMonitoringOverhead(): number {
    const sessionDuration = this.safePerformanceNow() - this.sessionStartTime;
    return sessionDuration > 0 ? (this.totalMonitoringTime / sessionDuration) * 100 : 0;
  }

  /**
   * Validate monitoring accuracy (enhanced with comprehensive validation - Task 6.6)
   */
  public validateAccuracy(): { accurate: boolean; issues: string[]; accuracy: number } {
    const latestReport = this.accuracyValidator.getLatestReport();

    if (!latestReport) {
      // Fallback to basic validation if no report available
      const issues: string[] = [];
      let accuracyScore = 100;

      // Check FPS measurement accuracy
      if (this.metrics.currentFPS > 65) {
        issues.push('FPS measurement appears inflated');
        accuracyScore -= 10;
      }

      // Check memory consistency
      if (this.metrics.memoryUsageMB !== this.metrics.canvasMemoryMB) {
        const difference = Math.abs(this.metrics.memoryUsageMB - this.metrics.canvasMemoryMB);
        if (difference > 10) {
          issues.push('Memory measurements are inconsistent');
          accuracyScore -= 15;
        }
      }

      // Check monitoring overhead
      const overhead = this.getMonitoringOverhead();
      if (overhead > this.config.maxMonitoringOverhead) {
        issues.push(`Monitoring overhead too high: ${overhead.toFixed(2)}%`);
        accuracyScore -= 20;
      }

      return {
        accurate: issues.length === 0,
        issues,
        accuracy: Math.max(0, accuracyScore)
      };
    }

    // Use comprehensive accuracy validation results
    return {
      accurate: latestReport.reliable,
      issues: latestReport.systemHealth.issues,
      accuracy: latestReport.overallAccuracy
    };
  }

  /**
   * Reset service to initial state (for testing)
   */
  public reset(): void {
    this.stopMonitoring();
    this.metrics = this.createDefaultMetrics();
    this.metricsHistory = [];
    this.alerts = [];
    this.appliedOptimizations = [];
    this.frameCount = 0;
    this.totalMonitoringTime = 0;
    this.sessionStartTime = this.safePerformanceNow();
    this.debugLog('PerformanceMonitoringService reset');
  }

  // ===== PRIVATE METHODS =====

  private createDefaultMetrics(): UnifiedPerformanceMetrics {
    return {
      currentFPS: 60,
      averageFPS: 60,
      frameTime: 16.67,
      droppedFrames: 0,
      totalFrames: 0,
      memoryUsageMB: 0,
      memoryPercentage: 0,
      heapSizeMB: 0,
      garbageCollections: 0,
      canvasRenderFPS: 60,
      averageMovementTime: 16.67,
      transformOverhead: 0,
      canvasMemoryMB: 0,
      gpuUtilization: 0,
      activeOperations: 0,
      networkLatency: 0,
      isLowPowerMode: false,
      compositeLayerCount: 0,
      qualityLevel: 'highest',
      isOptimized: false,
      timestamp: this.safePerformanceNow(),
      sessionDuration: 0
    };
  }

  private async detectDeviceCapabilities(): Promise<DeviceCapabilities> {
    const capabilities: DeviceCapabilities = {
      hardwareConcurrency: navigator.hardwareConcurrency || 2,
      devicePixelRatio: window.devicePixelRatio || 1,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      supportsPerformanceAPI: 'performance' in window && 'now' in performance,
      supportsMemoryAPI: 'memory' in (performance as any),
      supportsBatteryAPI: 'getBattery' in navigator,
      supportsIntersectionObserver: 'IntersectionObserver' in window,
      supportsRAF: 'requestAnimationFrame' in window,
      supportsGPUTiming: 'PerformanceObserver' in window,
      estimatedPerformanceTier: 'medium',
      recommendedQualityLevel: 'high'
    };

    // Device memory API
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory) {
      capabilities.deviceMemoryGB = deviceMemory;
    }

    // Network Information API
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      capabilities.connection = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };
    }

    // Estimate performance tier
    capabilities.estimatedPerformanceTier = this.estimatePerformanceTier(capabilities);
    capabilities.recommendedQualityLevel = this.getRecommendedQualityLevel(capabilities);

    return capabilities;
  }

  private estimatePerformanceTier(capabilities: DeviceCapabilities): 'low' | 'medium' | 'high' | 'premium' {
    let score = 0;

    // Memory scoring
    if (capabilities.deviceMemoryGB) {
      if (capabilities.deviceMemoryGB >= 8) score += 30;
      else if (capabilities.deviceMemoryGB >= 4) score += 20;
      else if (capabilities.deviceMemoryGB >= 2) score += 10;
    } else {
      score += 15; // Unknown, assume medium
    }

    // CPU scoring
    if (capabilities.hardwareConcurrency >= 8) score += 25;
    else if (capabilities.hardwareConcurrency >= 4) score += 15;
    else if (capabilities.hardwareConcurrency >= 2) score += 5;

    // Network scoring
    if (capabilities.connection) {
      if (capabilities.connection.effectiveType === '4g') score += 15;
      else if (capabilities.connection.effectiveType === '3g') score += 10;
      else if (capabilities.connection.effectiveType === '2g') score += 5;
    }

    // Device pixel ratio scoring
    if (capabilities.devicePixelRatio >= 3) score += 10;
    else if (capabilities.devicePixelRatio >= 2) score += 5;

    // API support scoring
    if (capabilities.supportsPerformanceAPI) score += 5;
    if (capabilities.supportsMemoryAPI) score += 5;
    if (capabilities.supportsIntersectionObserver) score += 5;

    // Determine tier
    if (score >= 80) return 'premium';
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    return 'low';
  }

  private getRecommendedQualityLevel(capabilities: DeviceCapabilities): QualityLevel {
    switch (capabilities.estimatedPerformanceTier) {
      case 'premium': return 'highest';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  private adaptConfigurationToDevice(): void {
    if (!this.deviceCapabilities) return;

    // Adjust sampling based on device performance
    switch (this.deviceCapabilities.estimatedPerformanceTier) {
      case 'low':
        this.config.metricsUpdateInterval = 2000;
        this.config.frameSampleSize = 30;
        this.config.enableHighFrequencyMonitoring = false;
        break;
      case 'medium':
        this.config.metricsUpdateInterval = 1500;
        this.config.frameSampleSize = 45;
        break;
      case 'high':
      case 'premium':
        this.config.metricsUpdateInterval = 500;
        this.config.frameSampleSize = 120;
        break;
    }

    // Adjust thresholds based on device capabilities
    if (this.deviceCapabilities.deviceMemoryGB && this.deviceCapabilities.deviceMemoryGB < 2) {
      this.config.memoryWarningThreshold = 50;
      this.config.memoryCriticalThreshold = 100;
    }

    this.debugLog('Configuration adapted to device', this.config);
  }

  private setupPerformanceObservers(): void {
    // Setup native PerformanceObserver if available
    if ('PerformanceObserver' in window) {
      try {
        const observer = new (window as any).PerformanceObserver((list: any) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.trackOperation(entry.name, entry.duration, entry);
            }
          }
        });
        observer.observe({ entryTypes: ['measure'] });
      } catch (error) {
        this.debugLog('Failed to setup PerformanceObserver:', error);
      }
    }
  }

  private initializeQualityManagement(): void {
    if (!this.deviceCapabilities) return;

    // Set initial quality based on device capabilities
    this.metrics.qualityLevel = this.deviceCapabilities.recommendedQualityLevel;
    this.debugLog(`Initial quality level: ${this.metrics.qualityLevel}`);
  }

  private startFrameMonitoring(): void {
    this.lastFrameTime = this.safePerformanceNow();

    const measureFrame = (currentTime: number) => {
      if (!this.isMonitoring) return;

      this.monitoringStartTime = this.safePerformanceNow();

      const frameTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      this.frameCount++;

      // Update frame metrics
      this.metrics.currentFPS = frameTime > 0 ? Math.min(60, 1000 / frameTime) : 60;
      this.metrics.frameTime = frameTime;
      this.metrics.totalFrames = this.frameCount;

      // Update dropped frames
      if (frameTime > 25) { // Dropped below 40fps
        this.metrics.droppedFrames++;
      }

      this.totalMonitoringTime += this.safePerformanceNow() - this.monitoringStartTime;

      this.rafId = requestAnimationFrame(measureFrame);
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  private startMetricsCollection(): void {
    this.metricsIntervalId = window.setInterval(() => {
      this.collectComprehensiveMetrics();
    }, this.config.metricsUpdateInterval);
  }

  private collectComprehensiveMetrics(): void {
    this.monitoringStartTime = this.safePerformanceNow();

    // Calculate session duration
    this.metrics.sessionDuration = this.safePerformanceNow() - this.sessionStartTime;

    // Update memory metrics
    this.updateMemoryMetrics();

    // Update GPU utilization estimate
    this.updateGPUMetrics();

    // Update composite layer count
    this.updateCompositeLayerCount();

    // Calculate average FPS
    this.updateAverageFPS();

    // Check for performance issues
    this.checkPerformanceIssues();

    // Update timestamp
    this.metrics.timestamp = this.safePerformanceNow();

    // Add to history
    this.metricsHistory.push({ ...this.metrics });
    if (this.metricsHistory.length > 300) { // Keep 5 minutes at 1-second intervals
      this.metricsHistory.shift();
    }

    // Notify observers
    this.notifyMetricsUpdate();

    this.totalMonitoringTime += this.safePerformanceNow() - this.monitoringStartTime;

    // Check monitoring overhead
    this.checkMonitoringOverhead();
  }

  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      try {
        const memory = (performance as any).memory;
        this.metrics.memoryUsageMB = memory.usedJSHeapSize / (1024 * 1024);
        this.metrics.canvasMemoryMB = this.metrics.memoryUsageMB; // Unified for consistency
        this.metrics.heapSizeMB = memory.totalJSHeapSize / (1024 * 1024);

        // Calculate percentage
        if (this.metrics.heapSizeMB > 0) {
          this.metrics.memoryPercentage = (this.metrics.memoryUsageMB / this.metrics.heapSizeMB) * 100;
        }
      } catch (error) {
        this.debugLog('Failed to get memory metrics:', error);
      }
    }
  }

  private updateGPUMetrics(): void {
    // Estimate GPU utilization based on frame performance and composite layers
    const frameEfficiency = this.metrics.currentFPS / 60;
    const layerComplexity = Math.min(this.metrics.compositeLayerCount / 10, 1);

    this.metrics.gpuUtilization = Math.min(100,
      ((1 - frameEfficiency) * 50) + (layerComplexity * 30) + (this.metrics.activeOperations * 5)
    );
  }

  private updateCompositeLayerCount(): void {
    // Count elements that create composite layers
    const compositeSelectors = [
      '[style*="transform"]',
      '[style*="opacity"]',
      'video',
      'canvas',
      '[style*="filter"]',
      '[style*="will-change"]'
    ];

    let count = 0;
    compositeSelectors.forEach(selector => {
      count += document.querySelectorAll(selector).length;
    });

    this.metrics.compositeLayerCount = count;
  }

  private updateAverageFPS(): void {
    if (this.metricsHistory.length > 0) {
      const recentHistory = this.metricsHistory.slice(-this.config.frameSampleSize);
      const total = recentHistory.reduce((sum, m) => sum + m.currentFPS, 0);
      this.metrics.averageFPS = Math.round(total / recentHistory.length);
    } else {
      this.metrics.averageFPS = this.metrics.currentFPS;
    }
  }

  private checkPerformanceIssues(): void {
    const alerts: PerformanceDegradationAlert[] = [];

    // FPS degradation check
    if (this.metrics.averageFPS < this.config.fpsCriticalThreshold) {
      alerts.push(this.createAlert('fps-drop', 'critical',
        `Critical FPS drop: ${this.metrics.averageFPS}fps`, {
          currentFPS: this.metrics.currentFPS,
          averageFPS: this.metrics.averageFPS
        }));
    } else if (this.metrics.averageFPS < this.config.fpsWarningThreshold) {
      alerts.push(this.createAlert('fps-drop', 'medium',
        `FPS below target: ${this.metrics.averageFPS}fps`, {
          averageFPS: this.metrics.averageFPS
        }));
    }

    // Memory issue check
    if (this.metrics.memoryUsageMB > this.config.memoryCriticalThreshold) {
      alerts.push(this.createAlert('memory-leak', 'critical',
        `Critical memory usage: ${this.metrics.memoryUsageMB}MB`, {
          memoryUsageMB: this.metrics.memoryUsageMB
        }));
    } else if (this.metrics.memoryUsageMB > this.config.memoryWarningThreshold) {
      alerts.push(this.createAlert('memory-leak', 'medium',
        `High memory usage: ${this.metrics.memoryUsageMB}MB`, {
          memoryUsageMB: this.metrics.memoryUsageMB
        }));
    }

    // GPU overload check
    if (this.metrics.gpuUtilization > 90) {
      alerts.push(this.createAlert('gpu-overload', 'high',
        `High GPU utilization: ${Math.round(this.metrics.gpuUtilization)}%`, {
          gpuUtilization: this.metrics.gpuUtilization
        }));
    }

    // Process alerts
    alerts.forEach(alert => {
      this.alerts.push(alert);
      this.notifyDegradationAlert(alert);

      // Apply auto-optimizations if enabled
      if (this.config.enableAutoOptimization) {
        this.applyAutoOptimizations(alert);
      }
    });

    // Clean old alerts
    this.alerts = this.alerts.filter(alert =>
      this.safePerformanceNow() - alert.timestamp < 30000
    );
  }

  private createAlert(
    type: PerformanceDegradationAlert['type'],
    severity: PerformanceDegradationAlert['severity'],
    message: string,
    metrics: Partial<UnifiedPerformanceMetrics>
  ): PerformanceDegradationAlert {
    return {
      type,
      severity,
      message,
      timestamp: this.safePerformanceNow(),
      metrics,
      recommendations: this.getRecommendations(type, severity),
      autoActions: this.getAutoActions(type, severity)
    };
  }

  private getRecommendations(type: string, severity: string): string[] {
    const recommendations: Record<string, string[]> = {
      'fps-drop': [
        'Reduce animation complexity',
        'Enable quality degradation',
        'Limit concurrent operations',
        'Check for performance bottlenecks'
      ],
      'memory-leak': [
        'Force garbage collection',
        'Clear animation caches',
        'Reduce image quality',
        'Monitor memory growth'
      ],
      'gpu-overload': [
        'Reduce visual effects',
        'Simplify animations',
        'Lower composite layer count',
        'Use CSS optimizations'
      ]
    };

    return recommendations[type] || ['Monitor system performance'];
  }

  private getAutoActions(type: string, severity: string): PerformanceAutoAction[] {
    const actions: PerformanceAutoAction[] = [];

    if (severity === 'critical') {
      actions.push({
        action: 'reduce-quality',
        applied: false,
        impact: 'Reduce visual quality to improve performance',
        timestamp: this.safePerformanceNow()
      });

      if (type === 'memory-leak') {
        actions.push({
          action: 'garbage-collect',
          applied: false,
          impact: 'Force memory cleanup',
          timestamp: this.safePerformanceNow()
        });
      }

      if (type === 'fps-drop') {
        actions.push({
          action: 'limit-fps',
          applied: false,
          impact: 'Reduce target framerate to 30fps',
          timestamp: this.safePerformanceNow()
        });
      }
    }

    return actions;
  }

  private applyAutoOptimizations(alert: PerformanceDegradationAlert): void {
    alert.autoActions.forEach(action => {
      if (!action.applied) {
        this.applyOptimization(action);
        action.applied = true;
        this.appliedOptimizations.push(action);
        this.notifyOptimizationApplied(action);
      }
    });
  }

  private applyOptimization(action: PerformanceAutoAction): void {
    switch (action.action) {
      case 'reduce-quality':
        this.degradeQuality();
        break;
      case 'limit-fps':
        this.limitFrameRate();
        break;
      case 'garbage-collect':
        this.forceGarbageCollection();
        break;
      case 'cull-offscreen':
        this.cullOffscreenElements();
        break;
      case 'battery-save':
        this.enableBatterySave();
        break;
    }

    this.metrics.isOptimized = true;
    this.metrics.optimizationReason = action.action;
  }

  private degradeQuality(): void {
    const qualityLevels: QualityLevel[] = ['highest', 'high', 'medium', 'low', 'minimal'];
    const currentIndex = qualityLevels.indexOf(this.metrics.qualityLevel);

    if (currentIndex < qualityLevels.length - 1) {
      const newLevel = qualityLevels[currentIndex + 1];
      this.setQualityLevel(newLevel, 'auto-optimization');
    }
  }

  private limitFrameRate(): void {
    // Signal frame rate limit through CSS custom property
    document.documentElement.style.setProperty('--perf-target-fps', '30');
  }

  private forceGarbageCollection(): void {
    // Attempt manual garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
      } catch (error) {
        this.debugLog('Manual garbage collection failed:', error);
      }
    }
  }

  private cullOffscreenElements(): void {
    // Signal offscreen culling through CSS custom property
    document.documentElement.style.setProperty('--perf-cull-offscreen', '1');
  }

  private enableBatterySave(): void {
    // Signal battery save mode through CSS custom property
    document.documentElement.style.setProperty('--perf-battery-save', '1');
    this.metrics.isLowPowerMode = true;
  }

  private checkMonitoringOverhead(): void {
    const now = this.safePerformanceNow();

    // Check overhead every 10 seconds
    if (now - this.lastOverheadCheck > 10000) {
      const overhead = this.getMonitoringOverhead();

      if (overhead > this.config.maxMonitoringOverhead) {
        this.debugLog(`High monitoring overhead detected: ${overhead.toFixed(2)}%`);

        // Reduce monitoring frequency
        if (this.config.adaptiveSampling) {
          this.config.metricsUpdateInterval = Math.min(this.config.metricsUpdateInterval * 1.5, 5000);
          this.debugLog(`Increased monitoring interval to ${this.config.metricsUpdateInterval}ms`);
        }
      }

      this.lastOverheadCheck = now;
    }
  }

  // Observer notification methods
  private notifyMetricsUpdate(): void {
    // Update adaptive quality manager with current performance (Task 6.5)
    this.adaptiveQualityManager.updatePerformanceMetrics(
      this.metrics.currentFPS,
      this.metrics.memoryUsageMB,
      this.deviceCapabilities?.batteryLevel
    );

    this.observers.forEach((observer, id) => {
      if (observer.onMetricsUpdate && this.observerCallbacks.get(id)?.has('metrics')) {
        try {
          observer.onMetricsUpdate(this.metrics);
        } catch (error) {
          this.debugLog(`Error notifying observer ${id}:`, error);
        }
      }
    });
  }

  private notifyDegradationAlert(alert: PerformanceDegradationAlert): void {
    this.observers.forEach((observer, id) => {
      if (observer.onDegradationAlert && this.observerCallbacks.get(id)?.has('alerts')) {
        try {
          observer.onDegradationAlert(alert);
        } catch (error) {
          this.debugLog(`Error notifying observer ${id}:`, error);
        }
      }
    });
  }

  private notifyQualityChange(oldLevel: QualityLevel, newLevel: QualityLevel, reason: string): void {
    this.observers.forEach((observer, id) => {
      if (observer.onQualityChange && this.observerCallbacks.get(id)?.has('quality')) {
        try {
          observer.onQualityChange(oldLevel, newLevel, reason);
        } catch (error) {
          this.debugLog(`Error notifying observer ${id}:`, error);
        }
      }
    });
  }

  private notifyOptimizationApplied(action: PerformanceAutoAction): void {
    this.observers.forEach((observer, id) => {
      if (observer.onOptimizationApplied && this.observerCallbacks.get(id)?.has('optimization')) {
        try {
          observer.onOptimizationApplied(action);
        } catch (error) {
          this.debugLog(`Error notifying observer ${id}:`, error);
        }
      }
    });
  }

  private safePerformanceNow(): number {
    try {
      return performance?.now?.() ?? Date.now();
    } catch {
      return Date.now();
    }
  }

  private debugLog(message: string, ...args: any[]): void {
    if (this.config.enableDebugMode) {
      console.log(`[PerformanceMonitoringService] ${message}`, ...args);
    }
  }

  // ===== DATA COLLECTION ACCESS METHODS (Task 6.3: Separated data collection) =====

  /**
   * Get data collection statistics
   */
  public getDataCollectionStats(): any {
    return this.dataCollectionManager.getCollectionStats();
  }

  /**
   * Get cached performance data for time range
   */
  public getCachedData(startTime?: number, endTime?: number): any[] {
    return this.dataCollectionManager.getAggregatedData(startTime, endTime);
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): any {
    return this.dataCache.getStats();
  }

  /**
   * Export performance data
   */
  public async exportPerformanceData(options: any): Promise<any> {
    const rawData = this.dataCollectionManager.getRawDataSample(1000);
    const aggregatedData = this.dataCollectionManager.getAggregatedData();
    return await this.dataExportManager.exportData(rawData, aggregatedData, options);
  }

  /**
   * Generate performance analysis report
   */
  public generateAnalysisReport(): any {
    const rawData = this.dataCollectionManager.getRawDataSample(1000);
    const aggregatedData = this.dataCollectionManager.getAggregatedData();
    return this.dataExportManager.generateDetailedAnalysis(rawData, aggregatedData);
  }

  /**
   * Clear all collected data
   */
  public clearCollectedData(): void {
    this.dataCollectionManager.clearData();
    this.dataCache.clear();
  }

  /**
   * Reset data collection system
   */
  public resetDataCollection(): void {
    this.dataCollectionManager.stopCollection();
    this.dataCollectionManager.clearData();
    if (this.isMonitoring) {
      this.dataCollectionManager.startCollection();
    }
  }

  // ===== OVERHEAD PROFILING ACCESS METHODS (Task 6.4: Monitoring overhead optimization) =====

  /**
   * Get current overhead statistics
   */
  public getOverheadStats(): any {
    return this.overheadProfiler.getCurrentOverheadStats();
  }

  /**
   * Generate comprehensive overhead report
   */
  public generateOverheadReport(): any {
    return this.overheadProfiler.generateOverheadReport();
  }

  /**
   * Get enhanced monitoring overhead percentage (includes profiled overhead)
   */
  public getEnhancedMonitoringOverhead(): number {
    const baseOverhead = this.getMonitoringOverhead();
    const overheadStats = this.overheadProfiler.getCurrentOverheadStats();

    // Combine traditional overhead calculation with profiled overhead
    const profilingOverhead = overheadStats.currentOverhead || 0;
    const totalOverhead = Math.max(baseOverhead, profilingOverhead);

    return Math.min(100, totalOverhead); // Cap at 100%
  }

  /**
   * Reset overhead profiling
   */
  public resetOverheadProfiling(): void {
    this.overheadProfiler.reset();
    if (this.isMonitoring) {
      this.overheadProfiler.startProfiling();
    }
  }

  // ===== ADAPTIVE QUALITY MANAGEMENT ACCESS METHODS (Task 6.5: Adaptive quality strategies) =====

  /**
   * Get current adaptive quality level
   */
  public getAdaptiveQualityLevel(): QualityLevel {
    return this.adaptiveQualityManager.getCurrentQualityLevel();
  }

  /**
   * Get device capability profile
   */
  public getDeviceCapabilityProfile(): any {
    return this.adaptiveQualityManager.getDeviceProfile();
  }

  /**
   * Get quality management state
   */
  public getQualityManagementState(): any {
    return this.adaptiveQualityManager.getQualityState();
  }

  /**
   * Force quality level (bypasses adaptive management temporarily)
   */
  public forceAdaptiveQualityLevel(level: QualityLevel, reason: string = 'manual-override'): void {
    this.adaptiveQualityManager.forceQualityLevel(level, reason);
  }

  /**
   * Reset adaptive quality management
   */
  public resetAdaptiveQualityManagement(): void {
    this.adaptiveQualityManager.reset();
  }

  /**
   * Get comprehensive quality report
   */
  public getQualityManagementReport(): {
    deviceProfile: any;
    currentState: any;
    performanceHistory: any;
    appliedOptimizations: string[];
  } {
    const deviceProfile = this.adaptiveQualityManager.getDeviceProfile();
    const currentState = this.adaptiveQualityManager.getQualityState();

    return {
      deviceProfile,
      currentState,
      performanceHistory: [], // Would need to expose from adaptive manager
      appliedOptimizations: currentState.appliedOptimizations || []
    };
  }

  // ===== ACCURACY VALIDATION ACCESS METHODS (Task 6.6: Monitoring accuracy validation) =====

  /**
   * Get latest accuracy validation report
   */
  public getAccuracyValidationReport(): any {
    return this.accuracyValidator.getLatestReport();
  }

  /**
   * Get accuracy validation history
   */
  public getAccuracyValidationHistory(): any[] {
    return this.accuracyValidator.getValidationHistory();
  }

  /**
   * Run immediate accuracy validation
   */
  public async runAccuracyValidation(): Promise<any> {
    return this.accuracyValidator.validateNow();
  }

  /**
   * Get validation status
   */
  public getValidationStatus(): any {
    return this.accuracyValidator.getValidationStatus();
  }

  /**
   * Reset accuracy validation
   */
  public resetAccuracyValidation(): void {
    this.accuracyValidator.reset();
  }

  /**
   * Get comprehensive system reliability report
   */
  public getSystemReliabilityReport(): {
    accuracyReport: any;
    overheadReport: any;
    qualityReport: any;
    dataCollectionStats: any;
    overallHealth: {
      score: number;
      status: 'excellent' | 'good' | 'fair' | 'poor';
      issues: string[];
      recommendations: string[];
    };
  } {
    const accuracyReport = this.accuracyValidator.getLatestReport();
    const overheadReport = this.overheadProfiler.generateOverheadReport();
    const qualityReport = this.getQualityManagementReport();
    const dataCollectionStats = this.getDataCollectionStats();

    // Calculate overall health score
    const accuracyScore = accuracyReport?.overallAccuracy || 50;
    const overheadScore = Math.max(0, 100 - (overheadReport.summary.averageOverheadMs || 5));
    const qualityScore = qualityReport.currentState.appliedOptimizations?.length > 0 ? 75 : 90;

    const overallScore = (accuracyScore + overheadScore + qualityScore) / 3;

    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (overallScore >= 90) status = 'excellent';
    else if (overallScore >= 75) status = 'good';
    else if (overallScore >= 60) status = 'fair';
    else status = 'poor';

    // Collect all issues and recommendations
    const allIssues = [
      ...(accuracyReport?.systemHealth.issues || []),
      ...(overheadReport.summary.optimizationsApplied.length > 0 ? ['Performance optimizations applied'] : [])
    ];

    const allRecommendations = [
      ...(accuracyReport?.calibrationSuggestions || []),
      ...(overheadReport.recommendations || [])
    ];

    return {
      accuracyReport,
      overheadReport,
      qualityReport,
      dataCollectionStats,
      overallHealth: {
        score: Math.round(overallScore),
        status,
        issues: allIssues,
        recommendations: allRecommendations
      }
    };
  }
}

// ===== EXPORT SINGLETON INSTANCE =====

let globalServiceInstance: PerformanceMonitoringService | null = null;

/**
 * Get the global PerformanceMonitoringService instance
 */
export function getPerformanceMonitoringService(config?: Partial<PerformanceMonitoringConfig>): PerformanceMonitoringService {
  if (!globalServiceInstance) {
    globalServiceInstance = PerformanceMonitoringService.getInstance(config);
  }
  return globalServiceInstance;
}

/**
 * Initialize and start the global performance monitoring service
 */
export async function initializePerformanceMonitoring(config?: Partial<PerformanceMonitoringConfig>): Promise<PerformanceMonitoringService> {
  const service = getPerformanceMonitoringService(config);
  await service.initialize();
  return service;
}

export default PerformanceMonitoringService;