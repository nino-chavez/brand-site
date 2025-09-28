/**
 * Performance Overhead Profiler
 *
 * Measures and optimizes the performance impact of monitoring systems themselves.
 * Implements adaptive sampling, overhead tracking, and intelligent optimization
 * strategies to ensure monitoring doesn't degrade measured performance.
 *
 * @fileoverview Task 6.4: Profile and optimize monitoring overhead
 * @version 1.0.0
 * @since Task 6.4 - Monitoring Overhead Optimization
 */

// ===== OVERHEAD PROFILING TYPES =====

/**
 * Overhead measurement result
 */
export interface OverheadMeasurement {
  timestamp: number;
  operation: string;
  executionTime: number;
  cpuTime: number;
  memoryDelta: number;
  frameDrops: number;
  impactLevel: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Overhead profiling configuration
 */
export interface OverheadProfilerConfig {
  enabled: boolean;
  maxAcceptableOverhead: number; // Percentage (e.g., 2.0 for 2%)
  samplingStrategy: 'fixed' | 'adaptive' | 'intelligent';
  baselineSamples: number;
  profilingInterval: number; // ms
  adaptiveThresholds: {
    fps: number;
    memory: number;
    cpu: number;
  };
  optimizationStrategies: ('reduce-frequency' | 'batch-operations' | 'defer-processing' | 'disable-features')[];
}

/**
 * Adaptive sampling configuration
 */
interface AdaptiveSamplingConfig {
  baseSamplingRate: number; // Hz
  minSamplingRate: number; // Hz
  maxSamplingRate: number; // Hz
  adjustmentFactor: number; // Multiplier for rate changes
  performanceTarget: number; // Target FPS
}

/**
 * Optimization recommendation
 */
interface OptimizationRecommendation {
  strategy: string;
  description: string;
  estimatedImpact: number; // Percentage improvement
  implementationComplexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// ===== PERFORMANCE OVERHEAD PROFILER =====

/**
 * Profiles and optimizes performance monitoring overhead
 */
export class PerformanceOverheadProfiler {
  private config: OverheadProfilerConfig;
  private isProfileling = false;
  private baselineMetrics: { fps: number; memory: number; cpu: number } | null = null;
  private overheadMeasurements: OverheadMeasurement[] = [];
  private adaptiveSampling: AdaptiveSamplingConfig;

  // Profiling state
  private currentSamplingRate = 60; // Hz
  private lastOptimization = 0;
  private optimizationHistory: string[] = [];

  // Performance tracking
  private frameTimings: number[] = [];
  private memoryUsageHistory: number[] = [];
  private cpuUsageHistory: number[] = [];

  // Optimization flags
  private isOptimizing = false;
  private optimizationApplied = new Set<string>();

  constructor(config: Partial<OverheadProfilerConfig> = {}) {
    this.config = {
      enabled: true,
      maxAcceptableOverhead: 2.0, // 2%
      samplingStrategy: 'adaptive',
      baselineSamples: 30,
      profilingInterval: 1000, // 1 second
      adaptiveThresholds: {
        fps: 55, // Reduce sampling if FPS drops below this
        memory: 150, // MB
        cpu: 80 // Percentage
      },
      optimizationStrategies: ['reduce-frequency', 'batch-operations', 'defer-processing'],
      ...config
    };

    this.adaptiveSampling = {
      baseSamplingRate: 60,
      minSamplingRate: 10,
      maxSamplingRate: 120,
      adjustmentFactor: 0.8,
      performanceTarget: 60
    };
  }

  // ===== PROFILING LIFECYCLE =====

  /**
   * Start overhead profiling
   */
  public async startProfiling(): Promise<void> {
    if (!this.config.enabled || this.isProfileling) return;

    this.isProfileling = true;
    console.log('[OverheadProfiler] Starting overhead profiling...');

    // Establish baseline performance
    await this.establishBaseline();

    // Start continuous profiling
    this.startContinuousProfiling();
  }

  /**
   * Stop overhead profiling
   */
  public stopProfiling(): void {
    if (!this.isProfileling) return;

    this.isProfileling = false;
    console.log('[OverheadProfiler] Stopping overhead profiling...');
  }

  /**
   * Establish baseline performance metrics
   */
  private async establishBaseline(): Promise<void> {
    console.log('[OverheadProfiler] Establishing baseline performance...');

    const baselineFPS: number[] = [];
    const baselineMemory: number[] = [];
    const baselineCPU: number[] = [];

    // Collect baseline samples
    for (let i = 0; i < this.config.baselineSamples; i++) {
      await this.delay(100); // Wait between samples

      // Measure FPS (estimate from frame timing)
      const frameStart = performance.now();
      await new Promise(resolve => requestAnimationFrame(resolve));
      const frameEnd = performance.now();
      const frameFPS = 1000 / (frameEnd - frameStart);
      baselineFPS.push(frameFPS);

      // Measure memory (if available)
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        baselineMemory.push(memoryInfo.usedJSHeapSize / 1024 / 1024);
      }

      // Estimate CPU usage (basic heuristic)
      const cpuStart = performance.now();
      this.dummyCPUWork(); // Small CPU-intensive task
      const cpuEnd = performance.now();
      const cpuEstimate = Math.min(100, (cpuEnd - cpuStart) * 10); // Rough estimate
      baselineCPU.push(cpuEstimate);
    }

    this.baselineMetrics = {
      fps: this.calculateAverage(baselineFPS),
      memory: this.calculateAverage(baselineMemory),
      cpu: this.calculateAverage(baselineCPU)
    };

    console.log('[OverheadProfiler] Baseline established:', this.baselineMetrics);
  }

  /**
   * Start continuous profiling loop
   */
  private startContinuousProfiling(): void {
    const profilingLoop = () => {
      if (!this.isProfileling) return;

      this.measureCurrentOverhead();
      this.evaluateOptimizationNeeds();

      setTimeout(profilingLoop, this.config.profilingInterval);
    };

    profilingLoop();
  }

  // ===== OVERHEAD MEASUREMENT =====

  /**
   * Measure a specific operation's overhead
   */
  public measureOperation<T>(operationName: string, operation: () => T): T {
    if (!this.config.enabled) return operation();

    const measurementStart = performance.now();
    const memoryBefore = this.getCurrentMemoryUsage();

    // Execute operation
    const result = operation();

    const measurementEnd = performance.now();
    const memoryAfter = this.getCurrentMemoryUsage();

    // Record overhead measurement
    const measurement: OverheadMeasurement = {
      timestamp: Date.now(),
      operation: operationName,
      executionTime: measurementEnd - measurementStart,
      cpuTime: measurementEnd - measurementStart, // Approximation
      memoryDelta: memoryAfter - memoryBefore,
      frameDrops: this.estimateFrameDrops(measurementEnd - measurementStart),
      impactLevel: this.calculateImpactLevel(measurementEnd - measurementStart)
    };

    this.overheadMeasurements.push(measurement);

    // Keep measurement history manageable
    if (this.overheadMeasurements.length > 1000) {
      this.overheadMeasurements = this.overheadMeasurements.slice(-500);
    }

    return result;
  }

  /**
   * Measure current system overhead
   */
  private measureCurrentOverhead(): void {
    if (!this.baselineMetrics) return;

    const currentFPS = this.getCurrentFPS();
    const currentMemory = this.getCurrentMemoryUsage();
    const currentCPU = this.getCurrentCPUUsage();

    // Calculate overhead percentages
    const fpsOverhead = ((this.baselineMetrics.fps - currentFPS) / this.baselineMetrics.fps) * 100;
    const memoryOverhead = ((currentMemory - this.baselineMetrics.memory) / this.baselineMetrics.memory) * 100;
    const cpuOverhead = ((currentCPU - this.baselineMetrics.cpu) / this.baselineMetrics.cpu) * 100;

    const totalOverhead = Math.max(fpsOverhead, memoryOverhead, cpuOverhead);

    // Store for analysis
    this.frameTimings.push(currentFPS);
    this.memoryUsageHistory.push(currentMemory);
    this.cpuUsageHistory.push(currentCPU);

    // Limit history size
    const maxHistory = 100;
    this.frameTimings = this.frameTimings.slice(-maxHistory);
    this.memoryUsageHistory = this.memoryUsageHistory.slice(-maxHistory);
    this.cpuUsageHistory = this.cpuUsageHistory.slice(-maxHistory);

    // Check if optimization is needed
    if (totalOverhead > this.config.maxAcceptableOverhead) {
      this.triggerOptimization(totalOverhead);
    }
  }

  /**
   * Get current FPS estimate
   */
  private getCurrentFPS(): number {
    let frameCount = 0;
    const startTime = performance.now();

    return new Promise<number>((resolve) => {
      const measureFrames = () => {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - startTime >= 1000) {
          resolve(frameCount);
        } else {
          requestAnimationFrame(measureFrames);
        }
      };

      requestAnimationFrame(measureFrames);
    }).then(fps => fps).catch(() => 60); // Fallback to 60 FPS estimate
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    const memoryInfo = (performance as any).memory;
    return memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;
  }

  /**
   * Get current CPU usage estimate
   */
  private getCurrentCPUUsage(): number {
    const start = performance.now();
    this.dummyCPUWork();
    const end = performance.now();
    return Math.min(100, (end - start) * 10); // Rough estimate
  }

  /**
   * Dummy CPU work for baseline measurement
   */
  private dummyCPUWork(): void {
    let sum = 0;
    for (let i = 0; i < 10000; i++) {
      sum += Math.random();
    }
  }

  // ===== ADAPTIVE OPTIMIZATION =====

  /**
   * Evaluate if optimization is needed
   */
  private evaluateOptimizationNeeds(): void {
    if (this.isOptimizing || Date.now() - this.lastOptimization < 5000) return;

    const recentMeasurements = this.overheadMeasurements.slice(-10);
    if (recentMeasurements.length === 0) return;

    const averageOverhead = this.calculateAverage(
      recentMeasurements.map(m => m.executionTime)
    );

    const currentFPS = this.frameTimings.slice(-5).reduce((a, b) => a + b, 0) / 5 || 60;
    const currentMemory = this.memoryUsageHistory.slice(-5).reduce((a, b) => a + b, 0) / 5 || 0;

    // Check thresholds
    const needsOptimization =
      currentFPS < this.config.adaptiveThresholds.fps ||
      currentMemory > this.config.adaptiveThresholds.memory ||
      averageOverhead > 16.67; // More than one frame time

    if (needsOptimization) {
      this.triggerOptimization(averageOverhead);
    }
  }

  /**
   * Trigger optimization based on overhead level
   */
  private triggerOptimization(overhead: number): void {
    if (this.isOptimizing) return;

    this.isOptimizing = true;
    this.lastOptimization = Date.now();

    console.log(`[OverheadProfiler] Triggering optimization for ${overhead.toFixed(2)}% overhead`);

    // Apply optimization strategies based on severity
    const strategies = this.selectOptimizationStrategies(overhead);

    for (const strategy of strategies) {
      this.applyOptimizationStrategy(strategy);
    }

    this.isOptimizing = false;
  }

  /**
   * Select appropriate optimization strategies
   */
  private selectOptimizationStrategies(overhead: number): string[] {
    const strategies: string[] = [];

    if (overhead > 10) {
      strategies.push('disable-features');
    }
    if (overhead > 5) {
      strategies.push('reduce-frequency');
      strategies.push('defer-processing');
    }
    if (overhead > 2) {
      strategies.push('batch-operations');
    }

    return strategies.filter(s =>
      this.config.optimizationStrategies.includes(s as any) &&
      !this.optimizationApplied.has(s)
    );
  }

  /**
   * Apply specific optimization strategy
   */
  private applyOptimizationStrategy(strategy: string): void {
    switch (strategy) {
      case 'reduce-frequency':
        this.currentSamplingRate = Math.max(
          this.adaptiveSampling.minSamplingRate,
          this.currentSamplingRate * this.adaptiveSampling.adjustmentFactor
        );
        console.log(`[OverheadProfiler] Reduced sampling rate to ${this.currentSamplingRate}Hz`);
        break;

      case 'batch-operations':
        // Signal to batch monitoring operations
        this.emitOptimizationSignal('batch-operations', { batchSize: 5, interval: 100 });
        break;

      case 'defer-processing':
        // Signal to defer heavy processing
        this.emitOptimizationSignal('defer-processing', { useIdleCallback: true });
        break;

      case 'disable-features':
        // Signal to disable non-essential monitoring features
        this.emitOptimizationSignal('disable-features', { features: ['gpu-monitoring', 'detailed-timing'] });
        break;
    }

    this.optimizationApplied.add(strategy);
    this.optimizationHistory.push(`${strategy}:${Date.now()}`);
  }

  /**
   * Emit optimization signal (would integrate with monitoring service)
   */
  private emitOptimizationSignal(type: string, config: any): void {
    // This would integrate with the performance monitoring service
    // For now, just log the optimization
    console.log(`[OverheadProfiler] Optimization signal: ${type}`, config);

    // Dispatch custom event for integration
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('performanceOptimization', {
        detail: { type, config }
      }));
    }
  }

  // ===== ANALYSIS AND REPORTING =====

  /**
   * Generate overhead analysis report
   */
  public generateOverheadReport(): {
    summary: any;
    measurements: OverheadMeasurement[];
    optimizations: string[];
    recommendations: OptimizationRecommendation[];
  } {
    const recentMeasurements = this.overheadMeasurements.slice(-100);

    const averageOverhead = this.calculateAverage(
      recentMeasurements.map(m => m.executionTime)
    );

    const maxOverhead = Math.max(...recentMeasurements.map(m => m.executionTime));

    const impactDistribution = recentMeasurements.reduce((acc, m) => {
      acc[m.impactLevel] = (acc[m.impactLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: {
        averageOverheadMs: averageOverhead,
        maxOverheadMs: maxOverhead,
        currentSamplingRate: this.currentSamplingRate,
        optimizationsApplied: Array.from(this.optimizationApplied),
        impactDistribution,
        baselineMetrics: this.baselineMetrics
      },
      measurements: recentMeasurements,
      optimizations: this.optimizationHistory,
      recommendations: this.generateOptimizationRecommendations()
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    if (this.currentSamplingRate > this.adaptiveSampling.baseSamplingRate) {
      recommendations.push({
        strategy: 'increase-sampling-rate',
        description: 'Performance has improved, sampling rate can be increased',
        estimatedImpact: 10,
        implementationComplexity: 'low',
        priority: 'low'
      });
    }

    const recentOverhead = this.overheadMeasurements.slice(-10);
    const criticalImpact = recentOverhead.filter(m => m.impactLevel === 'critical').length;

    if (criticalImpact > 0) {
      recommendations.push({
        strategy: 'emergency-optimization',
        description: 'Critical performance impact detected, emergency optimization needed',
        estimatedImpact: 50,
        implementationComplexity: 'high',
        priority: 'critical'
      });
    }

    if (!this.optimizationApplied.has('batch-operations')) {
      recommendations.push({
        strategy: 'implement-batching',
        description: 'Implement operation batching to reduce overhead',
        estimatedImpact: 25,
        implementationComplexity: 'medium',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Get current overhead statistics
   */
  public getCurrentOverheadStats(): {
    currentOverhead: number;
    samplingRate: number;
    optimizationsActive: string[];
    impactLevel: string;
  } {
    const recent = this.overheadMeasurements.slice(-5);
    const avgOverhead = recent.length > 0
      ? this.calculateAverage(recent.map(m => m.executionTime))
      : 0;

    const impactLevel = recent.length > 0
      ? this.calculateImpactLevel(avgOverhead)
      : 'minimal';

    return {
      currentOverhead: avgOverhead,
      samplingRate: this.currentSamplingRate,
      optimizationsActive: Array.from(this.optimizationApplied),
      impactLevel
    };
  }

  // ===== UTILITY METHODS =====

  /**
   * Calculate average of number array
   */
  private calculateAverage(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }

  /**
   * Calculate impact level based on execution time
   */
  private calculateImpactLevel(executionTime: number): 'minimal' | 'low' | 'medium' | 'high' | 'critical' {
    if (executionTime < 1) return 'minimal';
    if (executionTime < 5) return 'low';
    if (executionTime < 16.67) return 'medium'; // One frame time
    if (executionTime < 33.33) return 'high'; // Two frame times
    return 'critical';
  }

  /**
   * Estimate frame drops from execution time
   */
  private estimateFrameDrops(executionTime: number): number {
    const frameTime = 16.67; // 60 FPS
    return Math.floor(executionTime / frameTime);
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset profiler state
   */
  public reset(): void {
    this.overheadMeasurements = [];
    this.frameTimings = [];
    this.memoryUsageHistory = [];
    this.cpuUsageHistory = [];
    this.optimizationApplied.clear();
    this.optimizationHistory = [];
    this.currentSamplingRate = this.adaptiveSampling.baseSamplingRate;
    this.baselineMetrics = null;
  }

  /**
   * Cleanup and shutdown
   */
  public destroy(): void {
    this.stopProfiling();
    this.reset();
  }
}

// ===== SINGLETON INSTANCE =====

let profilerInstance: PerformanceOverheadProfiler | null = null;

/**
 * Get singleton overhead profiler instance
 */
export function getOverheadProfiler(config?: Partial<OverheadProfilerConfig>): PerformanceOverheadProfiler {
  if (!profilerInstance) {
    profilerInstance = new PerformanceOverheadProfiler(config);
  }
  return profilerInstance;
}

/**
 * Reset profiler instance (for testing)
 */
export function resetOverheadProfiler(): void {
  if (profilerInstance) {
    profilerInstance.destroy();
  }
  profilerInstance = null;
}

export default {
  PerformanceOverheadProfiler,
  getOverheadProfiler,
  resetOverheadProfiler
};