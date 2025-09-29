/**
 * Performance Regression Testing Utilities
 *
 * Comprehensive utilities for performance monitoring, regression detection, and alerting including:
 * - Automated performance benchmark collection and storage
 * - Statistical analysis and trend detection for performance metrics
 * - Memory leak detection and monitoring utilities
 * - Frame rate measurement and analysis tools
 * - Performance regression alerting and notification system
 *
 * @fileoverview Performance regression testing utility framework
 * @version 1.0.0
 * @since Task 7.3 - Performance Regression Testing Suite
 */

import { vi } from 'vitest';

/**
 * Performance metrics interface for standardized measurement
 */
export interface PerformanceMetrics {
  duration: number;
  memoryUsage: number;
  memoryDelta: number;
  frameRate: number;
  renderCount: number;
  interactionCount: number;
  gcPressure: number;
  cpuUsage: number;
}

/**
 * Performance benchmark with metadata
 */
export interface PerformanceBenchmarkEntry {
  id: string;
  timestamp: number;
  testName: string;
  component: string;
  operation: string;
  version: string;
  environment: string;
  metrics: PerformanceMetrics;
  metadata: Record<string, any>;
}

/**
 * Performance regression analysis result
 */
export interface RegressionAnalysis {
  hasRegression: boolean;
  severity: 'none' | 'warning' | 'critical';
  regressionPercentage: number;
  affectedMetrics: string[];
  recommendations: string[];
  comparison: {
    baseline: PerformanceMetrics;
    current: PerformanceMetrics;
    delta: Partial<PerformanceMetrics>;
  };
}

/**
 * Performance alert configuration
 */
export interface PerformanceAlertConfig {
  // Thresholds for different metrics
  durationThreshold: number; // milliseconds
  memoryThreshold: number; // MB
  frameRateThreshold: number; // fps
  regressionThreshold: number; // percentage

  // Alert settings
  enableAlerts: boolean;
  alertChannels: Array<'console' | 'file' | 'webhook'>;
  webhookUrl?: string;
  logFilePath?: string;

  // Filtering
  ignoredComponents: string[];
  ignoredOperations: string[];
  minimumSampleSize: number;
}

/**
 * Statistical analysis utilities for performance data
 */
export class PerformanceStatistics {
  public static calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  public static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  }

  public static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = this.calculateMean(values);
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const variance = this.calculateMean(squaredDifferences);
    return Math.sqrt(variance);
  }

  public static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sorted[lower];
    }

    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  public static detectOutliers(values: number[]): { outliers: number[]; cleanData: number[] } {
    if (values.length < 4) return { outliers: [], cleanData: values };

    const q1 = this.calculatePercentile(values, 25);
    const q3 = this.calculatePercentile(values, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers = values.filter(value => value < lowerBound || value > upperBound);
    const cleanData = values.filter(value => value >= lowerBound && value <= upperBound);

    return { outliers, cleanData };
  }

  public static calculateTrend(values: number[]): {
    direction: 'improving' | 'degrading' | 'stable';
    slope: number;
    confidence: number;
  } {
    if (values.length < 3) {
      return { direction: 'stable', slope: 0, confidence: 0 };
    }

    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate correlation coefficient for confidence
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = x.reduce((sum, val, i) => sum + (val - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, val) => sum + Math.pow(val - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0));
    const correlation = numerator / (denomX * denomY);
    const confidence = Math.abs(correlation);

    let direction: 'improving' | 'degrading' | 'stable';
    if (Math.abs(slope) < 0.001) {
      direction = 'stable';
    } else if (slope < 0) {
      direction = 'improving'; // Negative slope means decreasing duration (better performance)
    } else {
      direction = 'degrading'; // Positive slope means increasing duration (worse performance)
    }

    return { direction, slope, confidence };
  }
}

/**
 * Memory monitoring utilities
 */
export class MemoryMonitor {
  private baseline: number = 0;
  private samples: Array<{ timestamp: number; usage: number }> = [];

  public setBaseline(): void {
    this.baseline = this.getCurrentMemoryUsage();
    this.samples = [{ timestamp: performance.now(), usage: this.baseline }];
  }

  public recordSample(): void {
    this.samples.push({
      timestamp: performance.now(),
      usage: this.getCurrentMemoryUsage(),
    });
  }

  public getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 0;
    }
    // Fallback estimation
    return 0;
  }

  public getMemoryDelta(): number {
    if (this.samples.length === 0) return 0;
    const current = this.getCurrentMemoryUsage();
    return current - this.baseline;
  }

  public detectMemoryLeak(): {
    hasLeak: boolean;
    severity: 'none' | 'warning' | 'critical';
    growthRate: number; // MB per second
    recommendations: string[];
  } {
    if (this.samples.length < 10) {
      return { hasLeak: false, severity: 'none', growthRate: 0, recommendations: [] };
    }

    // Calculate memory growth rate
    const timeSpan = (this.samples[this.samples.length - 1].timestamp - this.samples[0].timestamp) / 1000; // seconds
    const memoryGrowth = this.samples[this.samples.length - 1].usage - this.samples[0].usage;
    const growthRate = memoryGrowth / timeSpan;

    const recommendations: string[] = [];
    let hasLeak = false;
    let severity: 'none' | 'warning' | 'critical' = 'none';

    if (growthRate > 1.0) { // Growing by more than 1MB per second
      hasLeak = true;
      severity = 'critical';
      recommendations.push('Investigate for memory leaks in event listeners');
      recommendations.push('Check for circular references in component state');
      recommendations.push('Verify proper cleanup in useEffect hooks');
    } else if (growthRate > 0.1) { // Growing by more than 100KB per second
      hasLeak = true;
      severity = 'warning';
      recommendations.push('Monitor memory usage over longer periods');
      recommendations.push('Consider implementing component memoization');
    }

    return { hasLeak, severity, growthRate, recommendations };
  }

  public getMemoryStats(): {
    baseline: number;
    current: number;
    peak: number;
    average: number;
    samples: number;
  } {
    if (this.samples.length === 0) {
      return { baseline: 0, current: 0, peak: 0, average: 0, samples: 0 };
    }

    const usages = this.samples.map(sample => sample.usage);
    const current = this.getCurrentMemoryUsage();
    const peak = Math.max(...usages);
    const average = PerformanceStatistics.calculateMean(usages);

    return {
      baseline: this.baseline,
      current,
      peak,
      average,
      samples: this.samples.length,
    };
  }

  public clear(): void {
    this.baseline = 0;
    this.samples = [];
  }
}

/**
 * Frame rate monitoring utilities
 */
export class FrameRateMonitor {
  private frameRates: number[] = [];
  private isMonitoring: boolean = false;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;

  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameRates = [];
    this.lastFrameTime = performance.now();
    this.measureFrame();
  }

  public stopMonitoring(): {
    averageFrameRate: number;
    minFrameRate: number;
    maxFrameRate: number;
    frameDrops: number;
    totalFrames: number;
    duration: number;
  } {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.frameRates.length === 0) {
      return { averageFrameRate: 0, minFrameRate: 0, maxFrameRate: 0, frameDrops: 0, totalFrames: 0, duration: 0 };
    }

    const averageFrameRate = PerformanceStatistics.calculateMean(this.frameRates);
    const minFrameRate = Math.min(...this.frameRates);
    const maxFrameRate = Math.max(...this.frameRates);
    const frameDrops = this.frameRates.filter(fps => fps < 55).length; // Frames below 55fps
    const duration = this.frameRates.length * (1000 / 60); // Approximate duration

    return {
      averageFrameRate,
      minFrameRate,
      maxFrameRate,
      frameDrops,
      totalFrames: this.frameRates.length,
      duration,
    };
  }

  private measureFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    const fps = 1000 / deltaTime;

    this.frameRates.push(fps);
    this.lastFrameTime = currentTime;

    this.animationFrameId = requestAnimationFrame(this.measureFrame);
  };

  public getInstantaneousFrameRate(): number {
    if (this.frameRates.length === 0) return 0;
    return this.frameRates[this.frameRates.length - 1];
  }

  public getFrameRateStats(): {
    mean: number;
    median: number;
    standardDeviation: number;
    p95: number;
    p99: number;
  } {
    if (this.frameRates.length === 0) {
      return { mean: 0, median: 0, standardDeviation: 0, p95: 0, p99: 0 };
    }

    return {
      mean: PerformanceStatistics.calculateMean(this.frameRates),
      median: PerformanceStatistics.calculateMedian(this.frameRates),
      standardDeviation: PerformanceStatistics.calculateStandardDeviation(this.frameRates),
      p95: PerformanceStatistics.calculatePercentile(this.frameRates, 95),
      p99: PerformanceStatistics.calculatePercentile(this.frameRates, 99),
    };
  }
}

/**
 * Performance benchmark storage and comparison utilities
 */
export class PerformanceBenchmarkStore {
  private benchmarks: Map<string, PerformanceBenchmarkEntry[]> = new Map();

  public addBenchmark(benchmark: PerformanceBenchmarkEntry): void {
    const key = this.getBenchmarkKey(benchmark);

    if (!this.benchmarks.has(key)) {
      this.benchmarks.set(key, []);
    }

    this.benchmarks.get(key)!.push(benchmark);

    // Keep only last 100 benchmarks per test to prevent memory growth
    const benchmarks = this.benchmarks.get(key)!;
    if (benchmarks.length > 100) {
      benchmarks.splice(0, benchmarks.length - 100);
    }
  }

  public getBenchmarks(testName: string, component: string, operation: string): PerformanceBenchmarkEntry[] {
    const key = `${testName}:${component}:${operation}`;
    return this.benchmarks.get(key) || [];
  }

  public getLatestBenchmark(testName: string, component: string, operation: string): PerformanceBenchmarkEntry | null {
    const benchmarks = this.getBenchmarks(testName, component, operation);
    return benchmarks.length > 0 ? benchmarks[benchmarks.length - 1] : null;
  }

  public compareBenchmarks(
    baseline: PerformanceBenchmarkEntry[],
    current: PerformanceBenchmarkEntry[]
  ): RegressionAnalysis {
    if (baseline.length === 0 || current.length === 0) {
      return {
        hasRegression: false,
        severity: 'none',
        regressionPercentage: 0,
        affectedMetrics: [],
        recommendations: [],
        comparison: {
          baseline: {} as PerformanceMetrics,
          current: {} as PerformanceMetrics,
          delta: {},
        },
      };
    }

    // Calculate average metrics for baseline and current
    const baselineMetrics = this.calculateAverageMetrics(baseline);
    const currentMetrics = this.calculateAverageMetrics(current);

    // Calculate regression percentage (focusing on duration as primary metric)
    const regressionPercentage = ((currentMetrics.duration - baselineMetrics.duration) / baselineMetrics.duration) * 100;

    // Analyze each metric for regressions
    const affectedMetrics: string[] = [];
    const recommendations: string[] = [];

    if (currentMetrics.duration > baselineMetrics.duration * 1.2) {
      affectedMetrics.push('duration');
      recommendations.push('Investigate performance bottlenecks in critical paths');
    }

    if (currentMetrics.memoryUsage > baselineMetrics.memoryUsage * 1.3) {
      affectedMetrics.push('memoryUsage');
      recommendations.push('Check for memory leaks and unnecessary object allocations');
    }

    if (currentMetrics.frameRate < baselineMetrics.frameRate * 0.9) {
      affectedMetrics.push('frameRate');
      recommendations.push('Optimize rendering and animation performance');
    }

    // Determine severity
    let severity: 'none' | 'warning' | 'critical' = 'none';
    if (regressionPercentage > 50) {
      severity = 'critical';
    } else if (regressionPercentage > 20) {
      severity = 'warning';
    }

    return {
      hasRegression: affectedMetrics.length > 0,
      severity,
      regressionPercentage,
      affectedMetrics,
      recommendations,
      comparison: {
        baseline: baselineMetrics,
        current: currentMetrics,
        delta: {
          duration: currentMetrics.duration - baselineMetrics.duration,
          memoryUsage: currentMetrics.memoryUsage - baselineMetrics.memoryUsage,
          frameRate: currentMetrics.frameRate - baselineMetrics.frameRate,
        },
      },
    };
  }

  public exportBenchmarks(): Record<string, PerformanceBenchmarkEntry[]> {
    const exported: Record<string, PerformanceBenchmarkEntry[]> = {};
    for (const [key, benchmarks] of this.benchmarks.entries()) {
      exported[key] = [...benchmarks];
    }
    return exported;
  }

  public importBenchmarks(data: Record<string, PerformanceBenchmarkEntry[]>): void {
    for (const [key, benchmarks] of Object.entries(data)) {
      this.benchmarks.set(key, [...benchmarks]);
    }
  }

  public clear(): void {
    this.benchmarks.clear();
  }

  private getBenchmarkKey(benchmark: PerformanceBenchmarkEntry): string {
    return `${benchmark.testName}:${benchmark.component}:${benchmark.operation}`;
  }

  private calculateAverageMetrics(benchmarks: PerformanceBenchmarkEntry[]): PerformanceMetrics {
    if (benchmarks.length === 0) {
      return {
        duration: 0,
        memoryUsage: 0,
        memoryDelta: 0,
        frameRate: 0,
        renderCount: 0,
        interactionCount: 0,
        gcPressure: 0,
        cpuUsage: 0,
      };
    }

    const metrics = benchmarks.map(b => b.metrics);

    return {
      duration: PerformanceStatistics.calculateMean(metrics.map(m => m.duration)),
      memoryUsage: PerformanceStatistics.calculateMean(metrics.map(m => m.memoryUsage)),
      memoryDelta: PerformanceStatistics.calculateMean(metrics.map(m => m.memoryDelta)),
      frameRate: PerformanceStatistics.calculateMean(metrics.map(m => m.frameRate)),
      renderCount: PerformanceStatistics.calculateMean(metrics.map(m => m.renderCount)),
      interactionCount: PerformanceStatistics.calculateMean(metrics.map(m => m.interactionCount)),
      gcPressure: PerformanceStatistics.calculateMean(metrics.map(m => m.gcPressure)),
      cpuUsage: PerformanceStatistics.calculateMean(metrics.map(m => m.cpuUsage)),
    };
  }
}

/**
 * Performance alert system
 */
export class PerformanceAlertSystem {
  private config: PerformanceAlertConfig;
  private alertHistory: Array<{
    timestamp: number;
    severity: 'warning' | 'critical';
    message: string;
    testName: string;
    component: string;
  }> = [];

  constructor(config: PerformanceAlertConfig) {
    this.config = config;
  }

  public async sendAlert(
    severity: 'warning' | 'critical',
    message: string,
    testName: string,
    component: string,
    analysis?: RegressionAnalysis
  ): Promise<void> {
    if (!this.config.enableAlerts) return;

    // Check if component/operation should be ignored
    if (this.config.ignoredComponents.includes(component)) return;

    const alert = {
      timestamp: Date.now(),
      severity,
      message,
      testName,
      component,
    };

    this.alertHistory.push(alert);

    // Send to configured channels
    for (const channel of this.config.alertChannels) {
      switch (channel) {
        case 'console':
          await this.sendConsoleAlert(alert, analysis);
          break;
        case 'file':
          await this.sendFileAlert(alert, analysis);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert, analysis);
          break;
      }
    }
  }

  public getAlertHistory(): typeof this.alertHistory {
    return [...this.alertHistory];
  }

  public clearHistory(): void {
    this.alertHistory = [];
  }

  private async sendConsoleAlert(
    alert: typeof this.alertHistory[0],
    analysis?: RegressionAnalysis
  ): Promise<void> {
    const timestamp = new Date(alert.timestamp).toISOString();
    const prefix = alert.severity === 'critical' ? '🚨' : '⚠️';

    console.warn(`${prefix} [${alert.severity.toUpperCase()}] Performance Alert - ${timestamp}`);
    console.warn(`Component: ${alert.component}`);
    console.warn(`Test: ${alert.testName}`);
    console.warn(`Message: ${alert.message}`);

    if (analysis) {
      console.warn(`Regression: ${analysis.regressionPercentage.toFixed(1)}%`);
      console.warn(`Affected Metrics: ${analysis.affectedMetrics.join(', ')}`);
      if (analysis.recommendations.length > 0) {
        console.warn('Recommendations:');
        analysis.recommendations.forEach(rec => console.warn(`  - ${rec}`));
      }
    }
    console.warn('---');
  }

  private async sendFileAlert(
    alert: typeof this.alertHistory[0],
    analysis?: RegressionAnalysis
  ): Promise<void> {
    if (!this.config.logFilePath) return;

    const timestamp = new Date(alert.timestamp).toISOString();
    const logEntry = {
      timestamp,
      severity: alert.severity,
      component: alert.component,
      testName: alert.testName,
      message: alert.message,
      analysis: analysis ? {
        regressionPercentage: analysis.regressionPercentage,
        affectedMetrics: analysis.affectedMetrics,
        recommendations: analysis.recommendations,
      } : undefined,
    };

    // In a real implementation, this would write to a file
    console.log(`[FILE LOG] ${JSON.stringify(logEntry, null, 2)}`);
  }

  private async sendWebhookAlert(
    alert: typeof this.alertHistory[0],
    analysis?: RegressionAnalysis
  ): Promise<void> {
    if (!this.config.webhookUrl) return;

    const payload = {
      timestamp: new Date(alert.timestamp).toISOString(),
      severity: alert.severity,
      component: alert.component,
      testName: alert.testName,
      message: alert.message,
      analysis: analysis ? {
        regressionPercentage: analysis.regressionPercentage,
        affectedMetrics: analysis.affectedMetrics,
        recommendations: analysis.recommendations,
      } : undefined,
    };

    // In a real implementation, this would make an HTTP request
    console.log(`[WEBHOOK] ${this.config.webhookUrl} - ${JSON.stringify(payload, null, 2)}`);
  }
}

/**
 * Main performance regression detector
 */
export class PerformanceRegressionDetector {
  private store: PerformanceBenchmarkStore;
  private alertSystem: PerformanceAlertSystem;
  private memoryMonitor: MemoryMonitor;
  private frameRateMonitor: FrameRateMonitor;

  constructor(alertConfig: PerformanceAlertConfig) {
    this.store = new PerformanceBenchmarkStore();
    this.alertSystem = new PerformanceAlertSystem(alertConfig);
    this.memoryMonitor = new MemoryMonitor();
    this.frameRateMonitor = new FrameRateMonitor();
  }

  public async measureAndAnalyze<T>(
    testName: string,
    component: string,
    operation: string,
    operationFn: () => T | Promise<T>,
    metadata: Record<string, any> = {}
  ): Promise<{
    result: T;
    benchmark: PerformanceBenchmarkEntry;
    analysis: RegressionAnalysis | null;
  }> {
    // Start monitoring
    this.memoryMonitor.setBaseline();
    this.frameRateMonitor.startMonitoring();

    const startTime = performance.now();
    const memoryBefore = this.memoryMonitor.getCurrentMemoryUsage();

    // Execute operation
    const result = await operationFn();

    // Stop monitoring
    const endTime = performance.now();
    const memoryAfter = this.memoryMonitor.getCurrentMemoryUsage();
    const frameRateStats = this.frameRateMonitor.stopMonitoring();

    // Create benchmark entry
    const benchmark: PerformanceBenchmarkEntry = {
      id: `${testName}-${component}-${operation}-${Date.now()}`,
      timestamp: Date.now(),
      testName,
      component,
      operation,
      version: metadata.version || '1.0.0',
      environment: metadata.environment || 'test',
      metrics: {
        duration: endTime - startTime,
        memoryUsage: memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
        frameRate: frameRateStats.averageFrameRate,
        renderCount: metadata.renderCount || 0,
        interactionCount: metadata.interactionCount || 0,
        gcPressure: this.memoryMonitor.getMemoryDelta(),
        cpuUsage: metadata.cpuUsage || 0,
      },
      metadata,
    };

    // Store benchmark
    this.store.addBenchmark(benchmark);

    // Analyze for regressions
    const historicalBenchmarks = this.store.getBenchmarks(testName, component, operation);
    let analysis: RegressionAnalysis | null = null;

    if (historicalBenchmarks.length > 1) {
      const baseline = historicalBenchmarks.slice(-10, -1); // Use last 9 as baseline
      const current = [benchmark];

      analysis = this.store.compareBenchmarks(baseline, current);

      // Send alerts if needed
      if (analysis.hasRegression) {
        await this.alertSystem.sendAlert(
          analysis.severity,
          `Performance regression detected: ${analysis.regressionPercentage.toFixed(1)}% slower`,
          testName,
          component,
          analysis
        );
      }
    }

    return { result, benchmark, analysis };
  }

  public getBenchmarkStore(): PerformanceBenchmarkStore {
    return this.store;
  }

  public getAlertSystem(): PerformanceAlertSystem {
    return this.alertSystem;
  }

  public getMemoryMonitor(): MemoryMonitor {
    return this.memoryMonitor;
  }

  public getFrameRateMonitor(): FrameRateMonitor {
    return this.frameRateMonitor;
  }
}

/**
 * Factory function for creating performance regression detector with default config
 */
export function createPerformanceRegressionDetector(
  overrides?: Partial<PerformanceAlertConfig>
): PerformanceRegressionDetector {
  const defaultConfig: PerformanceAlertConfig = {
    durationThreshold: 100,
    memoryThreshold: 50,
    frameRateThreshold: 55,
    regressionThreshold: 20,
    enableAlerts: true,
    alertChannels: ['console'],
    ignoredComponents: [],
    ignoredOperations: [],
    minimumSampleSize: 3,
    ...overrides,
  };

  return new PerformanceRegressionDetector(defaultConfig);
}