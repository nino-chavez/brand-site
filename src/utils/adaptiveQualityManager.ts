/**
 * Adaptive Quality Management System
 *
 * Intelligent quality management that adapts to device capabilities, performance
 * conditions, and user context. Implements smooth transitions, predictive optimization,
 * and device-specific quality strategies for optimal user experience.
 *
 * @fileoverview Task 6.5: Implement adaptive quality management strategies
 * @version 1.0.0
 * @since Task 6.5 - Adaptive Quality Management
 */

import type { QualityLevel } from './canvasPerformanceMonitor';

// ===== ADAPTIVE QUALITY TYPES =====

/**
 * Device capability profile for quality decisions
 */
export interface DeviceCapabilityProfile {
  // Hardware capabilities
  memoryGB: number;
  cpuCores: number;
  deviceClass: 'low-end' | 'mid-range' | 'high-end' | 'premium';
  gpuCapability: 'none' | 'basic' | 'advanced' | 'high-performance';

  // Display characteristics
  screenResolution: { width: number; height: number };
  pixelDensity: number;
  refreshRate: number;
  supportsVRR: boolean; // Variable Refresh Rate

  // Network and power
  connectionType: 'slow' | 'fast' | 'wifi' | 'cellular' | 'unknown';
  batteryLevel?: number;
  isLowPowerMode: boolean;
  thermalState: 'normal' | 'fair' | 'serious' | 'critical';

  // Software capabilities
  browserEngine: 'webkit' | 'blink' | 'gecko' | 'other';
  supportsWebGL2: boolean;
  supportsOffscreenCanvas: boolean;
  supportsIntersectionObserver: boolean;
}

/**
 * Quality management strategy
 */
export interface QualityStrategy {
  name: string;
  description: string;
  targetDeviceClass: string[];
  conditions: QualityCondition[];
  optimizations: QualityOptimization[];
  fallbackStrategy?: string;
}

/**
 * Quality condition for strategy activation
 */
interface QualityCondition {
  metric: 'fps' | 'memory' | 'battery' | 'thermal' | 'network';
  operator: '<' | '>' | '<=' | '>=' | '==' | '!=';
  value: number;
  duration?: number; // ms - condition must persist for this duration
}

/**
 * Quality optimization action
 */
interface QualityOptimization {
  type: 'reduce-quality' | 'disable-feature' | 'adjust-frequency' | 'batch-operations' | 'preload-content';
  target: string;
  parameters: Record<string, any>;
  reversible: boolean;
  priority: number; // 1-10, higher = more important
}

/**
 * Quality transition configuration
 */
interface QualityTransitionConfig {
  duration: number; // ms
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'smooth';
  steps: number; // Number of intermediate steps
  smoothing: boolean; // Apply additional smoothing
}

/**
 * Quality management state
 */
interface QualityManagementState {
  currentLevel: QualityLevel;
  targetLevel: QualityLevel;
  isTransitioning: boolean;
  activeStrategy: string;
  appliedOptimizations: string[];
  transitionStartTime: number;
  transitionConfig: QualityTransitionConfig;
  stabilityPeriod: number; // ms to wait before allowing another change
}

// ===== ADAPTIVE QUALITY MANAGER =====

/**
 * Manages adaptive quality based on device capabilities and performance
 */
export class AdaptiveQualityManager {
  private deviceProfile: DeviceCapabilityProfile | null = null;
  private qualityStrategies: Map<string, QualityStrategy> = new Map();
  private state: QualityManagementState;
  private performanceHistory: { timestamp: number; fps: number; memory: number }[] = [];

  // Quality transition management
  private transitionTimer: number | null = null;
  private stabilityTimer: number | null = null;

  // Event callbacks
  private onQualityChange?: (oldLevel: QualityLevel, newLevel: QualityLevel, reason: string) => void;
  private onOptimizationApplied?: (optimization: QualityOptimization) => void;

  constructor() {
    this.state = {
      currentLevel: 'highest',
      targetLevel: 'highest',
      isTransitioning: false,
      activeStrategy: 'default',
      appliedOptimizations: [],
      transitionStartTime: 0,
      transitionConfig: {
        duration: 1000,
        easing: 'ease-out',
        steps: 10,
        smoothing: true
      },
      stabilityPeriod: 5000 // 5 seconds
    };

    this.initializeQualityStrategies();
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize with device capabilities detection
   */
  public async initialize(): Promise<void> {
    console.log('[AdaptiveQualityManager] Initializing adaptive quality management...');

    // Detect device capabilities
    this.deviceProfile = await this.detectDeviceCapabilities();

    // Select optimal strategy for device
    this.selectOptimalStrategy();

    // Set initial quality level
    this.setInitialQualityLevel();

    console.log('[AdaptiveQualityManager] Initialized with device profile:', this.deviceProfile);
  }

  /**
   * Detect comprehensive device capabilities
   */
  private async detectDeviceCapabilities(): Promise<DeviceCapabilityProfile> {
    const profile: DeviceCapabilityProfile = {
      // Hardware detection
      memoryGB: this.detectMemoryCapacity(),
      cpuCores: navigator.hardwareConcurrency || 4,
      deviceClass: 'mid-range', // Will be determined from other metrics
      gpuCapability: this.detectGPUCapability(),

      // Display characteristics
      screenResolution: {
        width: screen.width,
        height: screen.height
      },
      pixelDensity: window.devicePixelRatio || 1,
      refreshRate: this.detectRefreshRate(),
      supportsVRR: this.detectVRRSupport(),

      // Network and power
      connectionType: this.detectConnectionType(),
      batteryLevel: await this.detectBatteryLevel(),
      isLowPowerMode: await this.detectLowPowerMode(),
      thermalState: 'normal', // Would need specialized API

      // Software capabilities
      browserEngine: this.detectBrowserEngine(),
      supportsWebGL2: this.detectWebGL2Support(),
      supportsOffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
      supportsIntersectionObserver: typeof IntersectionObserver !== 'undefined'
    };

    // Determine device class from combined metrics
    profile.deviceClass = this.classifyDevice(profile);

    return profile;
  }

  /**
   * Detect memory capacity
   */
  private detectMemoryCapacity(): number {
    // Try to get device memory if available
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory;
    }

    // Fallback estimation based on other characteristics
    const memoryInfo = (performance as any).memory;
    if (memoryInfo && memoryInfo.jsHeapSizeLimit) {
      // Rough estimation: heap limit is typically 1/4 to 1/8 of device memory
      return Math.round((memoryInfo.jsHeapSizeLimit / 1024 / 1024 / 1024) * 4);
    }

    // Conservative fallback
    return 4; // 4GB default
  }

  /**
   * Detect GPU capability
   */
  private detectGPUCapability(): 'none' | 'basic' | 'advanced' | 'high-performance' {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) return 'none';

    // Get renderer info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

    // Check for high-performance indicators
    if (renderer.includes('RTX') || renderer.includes('GTX') || renderer.includes('Radeon RX')) {
      return 'high-performance';
    }

    // Check for advanced GPU features
    const extensions = gl.getSupportedExtensions() || [];
    const advancedFeatures = ['EXT_color_buffer_float', 'OES_texture_float_linear', 'WEBGL_draw_buffers'];
    const hasAdvancedFeatures = advancedFeatures.some(ext => extensions.includes(ext));

    if (hasAdvancedFeatures && gl instanceof WebGL2RenderingContext) {
      return 'advanced';
    }

    return 'basic';
  }

  /**
   * Detect refresh rate
   */
  private detectRefreshRate(): number {
    // Try to detect refresh rate using requestAnimationFrame timing
    let frameCount = 0;
    const startTime = performance.now();

    return new Promise<number>((resolve) => {
      const measureRefreshRate = () => {
        frameCount++;
        const elapsed = performance.now() - startTime;

        if (elapsed >= 1000) {
          resolve(Math.round(frameCount * (1000 / elapsed)));
        } else {
          requestAnimationFrame(measureRefreshRate);
        }
      };

      requestAnimationFrame(measureRefreshRate);
    }).then(rate => rate).catch(() => 60); // Default to 60Hz
  }

  /**
   * Detect Variable Refresh Rate support
   */
  private detectVRRSupport(): boolean {
    // Check for adaptive sync or VRR indicators
    return 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
  }

  /**
   * Detect connection type
   */
  private detectConnectionType(): 'slow' | 'fast' | 'wifi' | 'cellular' | 'unknown' {
    const connection = (navigator as any).connection;
    if (!connection) return 'unknown';

    const effectiveType = connection.effectiveType;

    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'cellular';
    if (effectiveType === '4g') return 'fast';

    return connection.type === 'wifi' ? 'wifi' : 'unknown';
  }

  /**
   * Detect battery level
   */
  private async detectBatteryLevel(): Promise<number | undefined> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return battery.level * 100;
      } catch (error) {
        console.warn('[AdaptiveQualityManager] Battery API unavailable:', error);
      }
    }
    return undefined;
  }

  /**
   * Detect low power mode
   */
  private async detectLowPowerMode(): Promise<boolean> {
    // Check for battery API power save mode
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return battery.level < 0.2; // Consider low battery as power save mode
      } catch (error) {
        console.warn('[AdaptiveQualityManager] Battery API unavailable:', error);
      }
    }

    // Check for reduced motion preference as indicator
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Detect browser engine
   */
  private detectBrowserEngine(): 'webkit' | 'blink' | 'gecko' | 'other' {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome') || userAgent.includes('edge')) return 'blink';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'webkit';
    if (userAgent.includes('firefox')) return 'gecko';

    return 'other';
  }

  /**
   * Detect WebGL2 support
   */
  private detectWebGL2Support(): boolean {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  }

  /**
   * Classify device based on combined metrics
   */
  private classifyDevice(profile: DeviceCapabilityProfile): 'low-end' | 'mid-range' | 'high-end' | 'premium' {
    let score = 0;

    // Memory scoring
    if (profile.memoryGB >= 8) score += 3;
    else if (profile.memoryGB >= 4) score += 2;
    else if (profile.memoryGB >= 2) score += 1;

    // CPU scoring
    if (profile.cpuCores >= 8) score += 3;
    else if (profile.cpuCores >= 4) score += 2;
    else if (profile.cpuCores >= 2) score += 1;

    // GPU scoring
    switch (profile.gpuCapability) {
      case 'high-performance': score += 4; break;
      case 'advanced': score += 3; break;
      case 'basic': score += 2; break;
      default: score += 0;
    }

    // Display scoring
    const totalPixels = profile.screenResolution.width * profile.screenResolution.height;
    if (totalPixels >= 2073600) score += 2; // 1920x1080 or higher
    else if (totalPixels >= 921600) score += 1; // 1280x720 or higher

    if (profile.pixelDensity >= 2) score += 1;

    // Classify based on total score
    if (score >= 11) return 'premium';
    if (score >= 8) return 'high-end';
    if (score >= 5) return 'mid-range';
    return 'low-end';
  }

  // ===== QUALITY STRATEGIES =====

  /**
   * Initialize quality management strategies
   */
  private initializeQualityStrategies(): void {
    // Low-end device strategy
    this.qualityStrategies.set('low-end-conservative', {
      name: 'Low-End Conservative',
      description: 'Conservative quality settings for low-end devices',
      targetDeviceClass: ['low-end'],
      conditions: [
        { metric: 'fps', operator: '<', value: 30, duration: 1000 },
        { metric: 'memory', operator: '>', value: 150 }
      ],
      optimizations: [
        {
          type: 'reduce-quality',
          target: 'canvas-rendering',
          parameters: { maxQuality: 'low', reducedEffects: true },
          reversible: true,
          priority: 8
        },
        {
          type: 'disable-feature',
          target: 'gpu-acceleration',
          parameters: { fallbackToSoftware: true },
          reversible: true,
          priority: 7
        },
        {
          type: 'adjust-frequency',
          target: 'animation-updates',
          parameters: { maxFPS: 30 },
          reversible: true,
          priority: 6
        }
      ]
    });

    // Mid-range device strategy
    this.qualityStrategies.set('mid-range-balanced', {
      name: 'Mid-Range Balanced',
      description: 'Balanced quality settings for mid-range devices',
      targetDeviceClass: ['mid-range'],
      conditions: [
        { metric: 'fps', operator: '<', value: 45, duration: 2000 },
        { metric: 'memory', operator: '>', value: 200 }
      ],
      optimizations: [
        {
          type: 'reduce-quality',
          target: 'visual-effects',
          parameters: { reducedComplexity: true },
          reversible: true,
          priority: 6
        },
        {
          type: 'batch-operations',
          target: 'rendering-operations',
          parameters: { batchSize: 5 },
          reversible: true,
          priority: 5
        }
      ]
    });

    // High-end device strategy
    this.qualityStrategies.set('high-end-performance', {
      name: 'High-End Performance',
      description: 'Performance-focused settings for high-end devices',
      targetDeviceClass: ['high-end', 'premium'],
      conditions: [
        { metric: 'fps', operator: '<', value: 55, duration: 3000 }
      ],
      optimizations: [
        {
          type: 'adjust-frequency',
          target: 'monitoring-frequency',
          parameters: { reducedSampling: true },
          reversible: true,
          priority: 4
        },
        {
          type: 'preload-content',
          target: 'next-sections',
          parameters: { aggressivePreload: true },
          reversible: false,
          priority: 3
        }
      ]
    });

    // Battery-conscious strategy
    this.qualityStrategies.set('battery-saver', {
      name: 'Battery Saver',
      description: 'Power-efficient settings for low battery situations',
      targetDeviceClass: ['low-end', 'mid-range', 'high-end', 'premium'],
      conditions: [
        { metric: 'battery', operator: '<', value: 20 }
      ],
      optimizations: [
        {
          type: 'reduce-quality',
          target: 'all-animations',
          parameters: { reducedMotion: true },
          reversible: true,
          priority: 9
        },
        {
          type: 'adjust-frequency',
          target: 'update-frequency',
          parameters: { powerSaveMode: true, maxFPS: 24 },
          reversible: true,
          priority: 8
        },
        {
          type: 'disable-feature',
          target: 'background-processing',
          parameters: { suspendNonEssential: true },
          reversible: true,
          priority: 7
        }
      ]
    });
  }

  /**
   * Select optimal strategy for current device
   */
  private selectOptimalStrategy(): void {
    if (!this.deviceProfile) return;

    // Check for special conditions first
    if (this.deviceProfile.batteryLevel !== undefined && this.deviceProfile.batteryLevel < 20) {
      this.state.activeStrategy = 'battery-saver';
      return;
    }

    if (this.deviceProfile.isLowPowerMode) {
      this.state.activeStrategy = 'battery-saver';
      return;
    }

    // Select based on device class
    switch (this.deviceProfile.deviceClass) {
      case 'low-end':
        this.state.activeStrategy = 'low-end-conservative';
        break;
      case 'mid-range':
        this.state.activeStrategy = 'mid-range-balanced';
        break;
      case 'high-end':
      case 'premium':
        this.state.activeStrategy = 'high-end-performance';
        break;
    }

    console.log(`[AdaptiveQualityManager] Selected strategy: ${this.state.activeStrategy}`);
  }

  /**
   * Set initial quality level based on device capabilities
   */
  private setInitialQualityLevel(): void {
    if (!this.deviceProfile) return;

    let initialLevel: QualityLevel;

    switch (this.deviceProfile.deviceClass) {
      case 'low-end':
        initialLevel = 'low';
        break;
      case 'mid-range':
        initialLevel = 'medium';
        break;
      case 'high-end':
        initialLevel = 'high';
        break;
      case 'premium':
        initialLevel = 'highest';
        break;
    }

    this.state.currentLevel = initialLevel;
    this.state.targetLevel = initialLevel;

    console.log(`[AdaptiveQualityManager] Initial quality level: ${initialLevel}`);
  }

  // ===== QUALITY MANAGEMENT =====

  /**
   * Update performance metrics and evaluate quality changes
   */
  public updatePerformanceMetrics(fps: number, memoryMB: number, batteryLevel?: number): void {
    // Store performance history
    this.performanceHistory.push({
      timestamp: Date.now(),
      fps,
      memory: memoryMB
    });

    // Keep history manageable
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-50);
    }

    // Update device profile with current battery level
    if (this.deviceProfile && batteryLevel !== undefined) {
      this.deviceProfile.batteryLevel = batteryLevel;
    }

    // Evaluate if quality adjustment is needed
    this.evaluateQualityAdjustment(fps, memoryMB, batteryLevel);
  }

  /**
   * Evaluate if quality adjustment is needed
   */
  private evaluateQualityAdjustment(fps: number, memoryMB: number, batteryLevel?: number): void {
    if (this.state.isTransitioning) return; // Don't adjust during transitions

    // Check stability period
    if (Date.now() - this.state.transitionStartTime < this.state.stabilityPeriod) {
      return;
    }

    const strategy = this.qualityStrategies.get(this.state.activeStrategy);
    if (!strategy) return;

    // Check if conditions for optimization are met
    const shouldOptimize = this.checkOptimizationConditions(strategy, fps, memoryMB, batteryLevel);

    if (shouldOptimize) {
      this.triggerQualityOptimization(strategy, fps, memoryMB);
    } else {
      // Check if we can improve quality
      this.evaluateQualityImprovement(fps, memoryMB);
    }
  }

  /**
   * Check if optimization conditions are met
   */
  private checkOptimizationConditions(
    strategy: QualityStrategy,
    fps: number,
    memoryMB: number,
    batteryLevel?: number
  ): boolean {
    return strategy.conditions.some(condition => {
      let value: number;

      switch (condition.metric) {
        case 'fps':
          value = fps;
          break;
        case 'memory':
          value = memoryMB;
          break;
        case 'battery':
          value = batteryLevel || 100;
          break;
        default:
          return false;
      }

      // Check condition
      switch (condition.operator) {
        case '<': return value < condition.value;
        case '>': return value > condition.value;
        case '<=': return value <= condition.value;
        case '>=': return value >= condition.value;
        case '==': return value === condition.value;
        case '!=': return value !== condition.value;
        default: return false;
      }
    });
  }

  /**
   * Trigger quality optimization
   */
  private triggerQualityOptimization(strategy: QualityStrategy, fps: number, memoryMB: number): void {
    console.log(`[AdaptiveQualityManager] Triggering optimization for ${strategy.name} (FPS: ${fps}, Memory: ${memoryMB}MB)`);

    // Apply optimizations in priority order
    const sortedOptimizations = strategy.optimizations.sort((a, b) => b.priority - a.priority);

    for (const optimization of sortedOptimizations) {
      this.applyOptimization(optimization);
    }

    // Determine new quality level based on optimizations
    const newQualityLevel = this.calculateOptimizedQualityLevel();

    if (newQualityLevel !== this.state.currentLevel) {
      this.initiateQualityTransition(newQualityLevel, `optimization:${strategy.name}`);
    }
  }

  /**
   * Apply specific optimization
   */
  private applyOptimization(optimization: QualityOptimization): void {
    const optimizationId = `${optimization.type}:${optimization.target}`;

    if (this.state.appliedOptimizations.includes(optimizationId)) {
      return; // Already applied
    }

    console.log(`[AdaptiveQualityManager] Applying optimization: ${optimization.type} to ${optimization.target}`);

    // Add to applied optimizations
    this.state.appliedOptimizations.push(optimizationId);

    // Notify about optimization
    if (this.onOptimizationApplied) {
      this.onOptimizationApplied(optimization);
    }

    // Emit optimization event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('qualityOptimization', {
        detail: { optimization, timestamp: Date.now() }
      }));
    }
  }

  /**
   * Calculate optimized quality level based on applied optimizations
   */
  private calculateOptimizedQualityLevel(): QualityLevel {
    const optimizationCount = this.state.appliedOptimizations.length;
    const currentLevel = this.state.currentLevel;

    if (optimizationCount === 0) return currentLevel;

    // More optimizations = lower quality
    const qualityLevels: QualityLevel[] = ['highest', 'high', 'medium', 'low'];
    const currentIndex = qualityLevels.indexOf(currentLevel);
    const newIndex = Math.min(qualityLevels.length - 1, currentIndex + Math.floor(optimizationCount / 2));

    return qualityLevels[newIndex];
  }

  /**
   * Evaluate if quality can be improved
   */
  private evaluateQualityImprovement(fps: number, memoryMB: number): void {
    // Only improve if performance is consistently good
    const recentHistory = this.performanceHistory.slice(-10);
    if (recentHistory.length < 5) return;

    const avgFPS = recentHistory.reduce((sum, h) => sum + h.fps, 0) / recentHistory.length;
    const avgMemory = recentHistory.reduce((sum, h) => sum + h.memory, 0) / recentHistory.length;

    // Good performance thresholds
    const goodFPS = 55;
    const goodMemory = 100; // MB

    if (avgFPS > goodFPS && avgMemory < goodMemory && this.state.appliedOptimizations.length > 0) {
      // Remove some optimizations
      this.removeOptimizations(1);

      // Consider improving quality level
      const qualityLevels: QualityLevel[] = ['low', 'medium', 'high', 'highest'];
      const currentIndex = qualityLevels.indexOf(this.state.currentLevel);

      if (currentIndex < qualityLevels.length - 1) {
        const newLevel = qualityLevels[currentIndex + 1];
        this.initiateQualityTransition(newLevel, 'performance-improvement');
      }
    }
  }

  /**
   * Remove applied optimizations
   */
  private removeOptimizations(count: number): void {
    const removed = this.state.appliedOptimizations.splice(0, count);
    console.log(`[AdaptiveQualityManager] Removed optimizations:`, removed);

    // Emit removal events
    if (typeof window !== 'undefined') {
      for (const optimization of removed) {
        window.dispatchEvent(new CustomEvent('qualityOptimizationRemoved', {
          detail: { optimization, timestamp: Date.now() }
        }));
      }
    }
  }

  // ===== QUALITY TRANSITIONS =====

  /**
   * Initiate smooth quality transition
   */
  private initiateQualityTransition(newLevel: QualityLevel, reason: string): void {
    if (this.state.isTransitioning || newLevel === this.state.currentLevel) return;

    console.log(`[AdaptiveQualityManager] Initiating quality transition: ${this.state.currentLevel} → ${newLevel} (${reason})`);

    const oldLevel = this.state.currentLevel;
    this.state.targetLevel = newLevel;
    this.state.isTransitioning = true;
    this.state.transitionStartTime = Date.now();

    // Configure transition based on quality change severity
    this.configureTransition(oldLevel, newLevel);

    // Start transition
    this.executeQualityTransition(oldLevel, newLevel, reason);
  }

  /**
   * Configure transition parameters based on quality change
   */
  private configureTransition(oldLevel: QualityLevel, newLevel: QualityLevel): void {
    const qualityLevels: QualityLevel[] = ['low', 'medium', 'high', 'highest'];
    const oldIndex = qualityLevels.indexOf(oldLevel);
    const newIndex = qualityLevels.indexOf(newLevel);
    const distance = Math.abs(newIndex - oldIndex);

    // Adjust transition duration based on distance
    this.state.transitionConfig.duration = Math.min(2000, 500 + distance * 300);
    this.state.transitionConfig.steps = Math.max(5, distance * 3);

    // Smoother transitions for larger changes
    this.state.transitionConfig.smoothing = distance > 1;
    this.state.transitionConfig.easing = distance > 1 ? 'ease-in-out' : 'ease-out';
  }

  /**
   * Execute quality transition with smooth steps
   */
  private executeQualityTransition(oldLevel: QualityLevel, newLevel: QualityLevel, reason: string): void {
    const config = this.state.transitionConfig;
    const stepDuration = config.duration / config.steps;
    let currentStep = 0;

    const transitionStep = () => {
      if (!this.state.isTransitioning) return;

      currentStep++;
      const progress = currentStep / config.steps;

      // Apply easing
      const easedProgress = this.applyEasing(progress, config.easing);

      // Intermediate quality level (if needed)
      if (config.smoothing && currentStep < config.steps) {
        this.applyIntermediateQuality(oldLevel, newLevel, easedProgress);
      }

      if (currentStep >= config.steps) {
        // Transition complete
        this.completeQualityTransition(newLevel, reason);
      } else {
        // Schedule next step
        this.transitionTimer = window.setTimeout(transitionStep, stepDuration);
      }
    };

    // Start transition
    transitionStep();
  }

  /**
   * Apply easing function to transition progress
   */
  private applyEasing(progress: number, easing: string): number {
    switch (easing) {
      case 'linear':
        return progress;
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return 1 - (1 - progress) * (1 - progress);
      case 'ease-in-out':
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - 2 * (1 - progress) * (1 - progress);
      case 'smooth':
        return progress * progress * (3 - 2 * progress);
      default:
        return progress;
    }
  }

  /**
   * Apply intermediate quality settings during transition
   */
  private applyIntermediateQuality(oldLevel: QualityLevel, newLevel: QualityLevel, progress: number): void {
    // Emit intermediate quality event for smooth visual transitions
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('qualityTransitionStep', {
        detail: { oldLevel, newLevel, progress, timestamp: Date.now() }
      }));
    }
  }

  /**
   * Complete quality transition
   */
  private completeQualityTransition(newLevel: QualityLevel, reason: string): void {
    const oldLevel = this.state.currentLevel;

    this.state.currentLevel = newLevel;
    this.state.isTransitioning = false;
    this.state.transitionStartTime = Date.now();

    // Clear transition timer
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }

    // Notify about quality change
    if (this.onQualityChange) {
      this.onQualityChange(oldLevel, newLevel, reason);
    }

    // Emit quality change event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('qualityChanged', {
        detail: { oldLevel, newLevel, reason, timestamp: Date.now() }
      }));
    }

    console.log(`[AdaptiveQualityManager] Quality transition completed: ${oldLevel} → ${newLevel} (${reason})`);

    // Start stability period
    this.startStabilityPeriod();
  }

  /**
   * Start stability period to prevent rapid quality changes
   */
  private startStabilityPeriod(): void {
    if (this.stabilityTimer) {
      clearTimeout(this.stabilityTimer);
    }

    this.stabilityTimer = window.setTimeout(() => {
      console.log('[AdaptiveQualityManager] Stability period ended, quality changes allowed');
    }, this.state.stabilityPeriod);
  }

  // ===== PUBLIC API =====

  /**
   * Get current quality level
   */
  public getCurrentQualityLevel(): QualityLevel {
    return this.state.currentLevel;
  }

  /**
   * Get device capability profile
   */
  public getDeviceProfile(): DeviceCapabilityProfile | null {
    return this.deviceProfile;
  }

  /**
   * Get quality management state
   */
  public getQualityState(): Readonly<QualityManagementState> {
    return { ...this.state };
  }

  /**
   * Force quality level (overrides adaptive management temporarily)
   */
  public forceQualityLevel(level: QualityLevel, reason: string = 'manual-override'): void {
    if (level === this.state.currentLevel) return;

    console.log(`[AdaptiveQualityManager] Forcing quality level: ${level} (${reason})`);
    this.initiateQualityTransition(level, reason);
  }

  /**
   * Set event callbacks
   */
  public setCallbacks(callbacks: {
    onQualityChange?: (oldLevel: QualityLevel, newLevel: QualityLevel, reason: string) => void;
    onOptimizationApplied?: (optimization: QualityOptimization) => void;
  }): void {
    this.onQualityChange = callbacks.onQualityChange;
    this.onOptimizationApplied = callbacks.onOptimizationApplied;
  }

  /**
   * Reset quality management to initial state
   */
  public reset(): void {
    // Clear timers
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
    if (this.stabilityTimer) {
      clearTimeout(this.stabilityTimer);
      this.stabilityTimer = null;
    }

    // Reset state
    this.state = {
      currentLevel: 'highest',
      targetLevel: 'highest',
      isTransitioning: false,
      activeStrategy: 'default',
      appliedOptimizations: [],
      transitionStartTime: 0,
      transitionConfig: {
        duration: 1000,
        easing: 'ease-out',
        steps: 10,
        smoothing: true
      },
      stabilityPeriod: 5000
    };

    // Clear history
    this.performanceHistory = [];

    console.log('[AdaptiveQualityManager] Reset to initial state');
  }

  /**
   * Cleanup and shutdown
   */
  public destroy(): void {
    this.reset();
    this.deviceProfile = null;
    this.qualityStrategies.clear();
  }
}

// ===== SINGLETON INSTANCE =====

let qualityManagerInstance: AdaptiveQualityManager | null = null;

/**
 * Get singleton adaptive quality manager instance
 */
export function getAdaptiveQualityManager(): AdaptiveQualityManager {
  if (!qualityManagerInstance) {
    qualityManagerInstance = new AdaptiveQualityManager();
  }
  return qualityManagerInstance;
}

/**
 * Reset quality manager instance (for testing)
 */
export function resetAdaptiveQualityManager(): void {
  if (qualityManagerInstance) {
    qualityManagerInstance.destroy();
  }
  qualityManagerInstance = null;
}

export default {
  AdaptiveQualityManager,
  getAdaptiveQualityManager,
  resetAdaptiveQualityManager
};