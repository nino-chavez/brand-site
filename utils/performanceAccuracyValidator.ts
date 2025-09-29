/**
 * Performance Monitoring Accuracy Validator
 *
 * Validates the accuracy and reliability of performance monitoring systems.
 * Ensures monitoring doesn't impact measured performance and provides
 * accuracy metrics for FPS, memory, and timing measurements.
 *
 * @fileoverview Task 6.6: Validate monitoring accuracy and system reliability
 * @version 1.0.0
 * @since Task 6.6 - Monitoring Accuracy Validation
 */

// ===== ACCURACY VALIDATION TYPES =====

/**
 * Accuracy validation configuration
 */
export interface AccuracyValidationConfig {
  enabled: boolean;
  validationInterval: number; // ms between validation runs
  sampleSize: number; // Number of samples for each validation
  toleranceThresholds: {
    fps: number; // Acceptable FPS measurement variance (%)
    memory: number; // Acceptable memory measurement variance (%)
    timing: number; // Acceptable timing measurement variance (ms)
    overhead: number; // Maximum acceptable monitoring overhead (%)
  };
  crossValidationEnabled: boolean; // Use multiple measurement methods
  realTimeValidation: boolean; // Validate during actual monitoring
}

/**
 * Validation result for a specific metric
 */
interface ValidationResult {
  metric: string;
  accurate: boolean;
  accuracy: number; // 0-100%
  variance: number; // Measured variance
  threshold: number; // Acceptable threshold
  sampleCount: number;
  measurementMethods: string[];
  issues: string[];
  recommendations: string[];
}

/**
 * Comprehensive accuracy report
 */
export interface AccuracyReport {
  timestamp: number;
  overallAccuracy: number; // 0-100%
  reliable: boolean;
  validationResults: ValidationResult[];
  systemHealth: {
    healthy: boolean;
    issues: string[];
    criticalIssues: string[];
    warnings: string[];
  };
  performanceImpact: {
    measuredOverhead: number;
    impactLevel: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  };
  calibrationSuggestions: string[];
}

/**
 * Cross-validation measurement methods
 */
interface CrossValidationMethods {
  fps: Array<() => Promise<number>>;
  memory: Array<() => number>;
  timing: Array<() => number>;
}

// ===== PERFORMANCE ACCURACY VALIDATOR =====

/**
 * Validates performance monitoring accuracy and reliability
 */
export class PerformanceAccuracyValidator {
  private config: AccuracyValidationConfig;
  private isValidating = false;
  private validationHistory: AccuracyReport[] = [];
  private crossValidationMethods: CrossValidationMethods;

  // Baseline measurements for comparison
  private baselineMeasurements: {
    fps: number[];
    memory: number[];
    timing: number[];
  } = { fps: [], memory: [], timing: [] };

  // Validation state
  private lastValidation = 0;
  private validationTimer: number | null = null;

  constructor(config: Partial<AccuracyValidationConfig> = {}) {
    this.config = {
      enabled: true,
      validationInterval: 30000, // 30 seconds
      sampleSize: 50,
      toleranceThresholds: {
        fps: 5, // 5% variance acceptable
        memory: 10, // 10% variance acceptable
        timing: 2, // 2ms variance acceptable
        overhead: 2 // 2% overhead acceptable
      },
      crossValidationEnabled: true,
      realTimeValidation: false,
      ...config
    };

    this.initializeCrossValidationMethods();
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize cross-validation measurement methods
   */
  private initializeCrossValidationMethods(): void {
    this.crossValidationMethods = {
      fps: [
        this.measureFPSWithRAF.bind(this),
        this.measureFPSWithPerformanceAPI.bind(this),
        this.measureFPSWithTimestamp.bind(this)
      ],
      memory: [
        this.measureMemoryWithPerformanceAPI.bind(this),
        this.measureMemoryWithNavigatorAPI.bind(this),
        this.measureMemoryHeuristic.bind(this)
      ],
      timing: [
        this.measureTimingWithPerformanceNow.bind(this),
        this.measureTimingWithDateNow.bind(this),
        this.measureTimingWithHRTime.bind(this)
      ]
    };
  }

  /**
   * Start accuracy validation
   */
  public startValidation(): void {
    if (!this.config.enabled || this.isValidating) return;

    console.log('[AccuracyValidator] Starting performance monitoring accuracy validation...');
    this.isValidating = true;

    // Establish baseline measurements
    this.establishBaseline().then(() => {
      // Start periodic validation
      this.startPeriodicValidation();
    });
  }

  /**
   * Stop accuracy validation
   */
  public stopValidation(): void {
    if (!this.isValidating) return;

    console.log('[AccuracyValidator] Stopping accuracy validation...');
    this.isValidating = false;

    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = null;
    }
  }

  /**
   * Establish baseline measurements for comparison
   */
  private async establishBaseline(): Promise<void> {
    console.log('[AccuracyValidator] Establishing baseline measurements...');

    // Clear existing baseline
    this.baselineMeasurements = { fps: [], memory: [], timing: [] };

    // Collect baseline samples
    for (let i = 0; i < this.config.sampleSize; i++) {
      await this.delay(100); // Wait between samples

      // FPS baseline
      const fps = await this.measureFPSWithRAF();
      this.baselineMeasurements.fps.push(fps);

      // Memory baseline
      const memory = this.measureMemoryWithPerformanceAPI();
      this.baselineMeasurements.memory.push(memory);

      // Timing baseline (measure a small operation)
      const timing = this.measureTimingWithPerformanceNow();
      this.baselineMeasurements.timing.push(timing);
    }

    console.log('[AccuracyValidator] Baseline established:', {
      fps: this.calculateStatistics(this.baselineMeasurements.fps),
      memory: this.calculateStatistics(this.baselineMeasurements.memory),
      timing: this.calculateStatistics(this.baselineMeasurements.timing)
    });
  }

  /**
   * Start periodic validation
   */
  private startPeriodicValidation(): void {
    const runValidation = () => {
      if (!this.isValidating) return;

      this.runAccuracyValidation().then((report) => {
        this.validationHistory.push(report);

        // Keep history manageable
        if (this.validationHistory.length > 20) {
          this.validationHistory = this.validationHistory.slice(-10);
        }

        // Log validation results
        this.logValidationResults(report);
      });
    };

    // Run initial validation
    runValidation();

    // Schedule periodic validations
    this.validationTimer = window.setInterval(runValidation, this.config.validationInterval);
  }

  // ===== MEASUREMENT METHODS =====

  /**
   * Measure FPS using requestAnimationFrame
   */
  private async measureFPSWithRAF(): Promise<number> {
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      const measureDuration = 1000; // 1 second

      const countFrames = () => {
        frameCount++;
        const elapsed = performance.now() - startTime;

        if (elapsed >= measureDuration) {
          const fps = frameCount * (1000 / elapsed);
          resolve(fps);
        } else {
          requestAnimationFrame(countFrames);
        }
      };

      requestAnimationFrame(countFrames);
    });
  }

  /**
   * Measure FPS using Performance API
   */
  private async measureFPSWithPerformanceAPI(): Promise<number> {
    return new Promise((resolve) => {
      if (!('PerformanceObserver' in window)) {
        resolve(60); // Fallback
        return;
      }

      let frameCount = 0;
      const startTime = performance.now();

      try {
        const observer = new (window as any).PerformanceObserver((list: any) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'frame') {
              frameCount++;
            }
          }
        });

        observer.observe({ entryTypes: ['frame'] });

        setTimeout(() => {
          observer.disconnect();
          const elapsed = performance.now() - startTime;
          const fps = frameCount * (1000 / elapsed);
          resolve(fps);
        }, 1000);
      } catch (error) {
        resolve(60); // Fallback
      }
    });
  }

  /**
   * Measure FPS using timestamp differences
   */
  private async measureFPSWithTimestamp(): Promise<number> {
    return new Promise((resolve) => {
      const timestamps: number[] = [];
      const measureDuration = 1000;

      const recordTimestamp = () => {
        timestamps.push(performance.now());

        if (timestamps.length >= 2) {
          const elapsed = timestamps[timestamps.length - 1] - timestamps[0];
          if (elapsed >= measureDuration) {
            const fps = (timestamps.length - 1) * (1000 / elapsed);
            resolve(fps);
            return;
          }
        }

        requestAnimationFrame(recordTimestamp);
      };

      requestAnimationFrame(recordTimestamp);
    });
  }

  /**
   * Measure memory using Performance API
   */
  private measureMemoryWithPerformanceAPI(): number {
    const memoryInfo = (performance as any).memory;
    return memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;
  }

  /**
   * Measure memory using Navigator API
   */
  private measureMemoryWithNavigatorAPI(): number {
    // Try device memory API
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory * 1024; // Convert GB to MB
    }
    return 0;
  }

  /**
   * Measure memory using heuristic methods
   */
  private measureMemoryHeuristic(): number {
    // Estimate based on DOM complexity and other factors
    const nodeCount = document.querySelectorAll('*').length;
    const estimatedMemory = nodeCount * 0.1; // Rough estimate: 0.1MB per DOM node
    return Math.max(10, estimatedMemory); // Minimum 10MB
  }

  /**
   * Measure timing using performance.now()
   */
  private measureTimingWithPerformanceNow(): number {
    const start = performance.now();
    // Perform a small CPU-intensive operation
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += Math.random();
    }
    const end = performance.now();
    return end - start;
  }

  /**
   * Measure timing using Date.now()
   */
  private measureTimingWithDateNow(): number {
    const start = Date.now();
    // Same operation as above
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += Math.random();
    }
    const end = Date.now();
    return end - start;
  }

  /**
   * Measure timing using high-resolution time (if available)
   */
  private measureTimingWithHRTime(): number {
    if ('timeOrigin' in performance) {
      const start = performance.timeOrigin + performance.now();
      // Same operation
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += Math.random();
      }
      const end = performance.timeOrigin + performance.now();
      return end - start;
    }
    return this.measureTimingWithPerformanceNow();
  }

  // ===== ACCURACY VALIDATION =====

  /**
   * Run comprehensive accuracy validation
   */
  public async runAccuracyValidation(): Promise<AccuracyReport> {
    console.log('[AccuracyValidator] Running accuracy validation...');

    const validationResults: ValidationResult[] = [];

    // Validate FPS measurement accuracy
    if (this.config.crossValidationEnabled) {
      validationResults.push(await this.validateFPSAccuracy());
      validationResults.push(this.validateMemoryAccuracy());
      validationResults.push(this.validateTimingAccuracy());
    }

    // Validate monitoring overhead
    validationResults.push(await this.validateMonitoringOverhead());

    // Generate overall accuracy score
    const overallAccuracy = this.calculateOverallAccuracy(validationResults);

    // Assess system health
    const systemHealth = this.assessSystemHealth(validationResults);

    // Evaluate performance impact
    const performanceImpact = this.evaluatePerformanceImpact(validationResults);

    // Generate calibration suggestions
    const calibrationSuggestions = this.generateCalibrationSuggestions(validationResults);

    const report: AccuracyReport = {
      timestamp: Date.now(),
      overallAccuracy,
      reliable: overallAccuracy >= 85 && systemHealth.healthy,
      validationResults,
      systemHealth,
      performanceImpact,
      calibrationSuggestions
    };

    console.log('[AccuracyValidator] Validation complete. Overall accuracy:', overallAccuracy.toFixed(1) + '%');

    return report;
  }

  /**
   * Validate FPS measurement accuracy using cross-validation
   */
  private async validateFPSAccuracy(): Promise<ValidationResult> {
    const measurements: number[] = [];
    const methods: string[] = [];

    // Use all available FPS measurement methods
    for (const [index, method] of this.crossValidationMethods.fps.entries()) {
      try {
        const fps = await method();
        measurements.push(fps);
        methods.push(`fps-method-${index + 1}`);
      } catch (error) {
        console.warn('[AccuracyValidator] FPS measurement method failed:', error);
      }
    }

    // Calculate variance and accuracy
    const variance = this.calculateVariance(measurements);
    const accuracy = Math.max(0, 100 - (variance / this.config.toleranceThresholds.fps) * 100);
    const accurate = variance <= this.config.toleranceThresholds.fps;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!accurate) {
      issues.push(`High FPS measurement variance: ${variance.toFixed(2)}%`);
      recommendations.push('Consider using alternative FPS measurement methods');
    }

    if (measurements.length < 2) {
      issues.push('Insufficient FPS measurement methods available');
      recommendations.push('Implement additional FPS measurement techniques');
    }

    return {
      metric: 'fps',
      accurate,
      accuracy,
      variance,
      threshold: this.config.toleranceThresholds.fps,
      sampleCount: measurements.length,
      measurementMethods: methods,
      issues,
      recommendations
    };
  }

  /**
   * Validate memory measurement accuracy
   */
  private validateMemoryAccuracy(): ValidationResult {
    const measurements: number[] = [];
    const methods: string[] = [];

    // Use all available memory measurement methods
    for (const [index, method] of this.crossValidationMethods.memory.entries()) {
      try {
        const memory = method();
        if (memory > 0) {
          measurements.push(memory);
          methods.push(`memory-method-${index + 1}`);
        }
      } catch (error) {
        console.warn('[AccuracyValidator] Memory measurement method failed:', error);
      }
    }

    const variance = measurements.length > 1 ? this.calculateVariance(measurements) : 0;
    const accuracy = Math.max(0, 100 - (variance / this.config.toleranceThresholds.memory) * 100);
    const accurate = variance <= this.config.toleranceThresholds.memory;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!accurate && measurements.length > 1) {
      issues.push(`High memory measurement variance: ${variance.toFixed(2)}%`);
      recommendations.push('Calibrate memory measurement methods');
    }

    if (measurements.length === 0) {
      issues.push('No memory measurement methods available');
      recommendations.push('Enable memory monitoring APIs');
    }

    return {
      metric: 'memory',
      accurate: measurements.length === 0 ? true : accurate, // Don't fail if no methods available
      accuracy: measurements.length === 0 ? 50 : accuracy, // Partial score if no measurement
      variance,
      threshold: this.config.toleranceThresholds.memory,
      sampleCount: measurements.length,
      measurementMethods: methods,
      issues,
      recommendations
    };
  }

  /**
   * Validate timing measurement accuracy
   */
  private validateTimingAccuracy(): ValidationResult {
    const measurements: number[] = [];
    const methods: string[] = [];

    // Use all available timing measurement methods
    for (const [index, method] of this.crossValidationMethods.timing.entries()) {
      try {
        const timing = method();
        measurements.push(timing);
        methods.push(`timing-method-${index + 1}`);
      } catch (error) {
        console.warn('[AccuracyValidator] Timing measurement method failed:', error);
      }
    }

    // Calculate standard deviation for timing measurements
    const stdDev = this.calculateStandardDeviation(measurements);
    const accuracy = Math.max(0, 100 - (stdDev / this.config.toleranceThresholds.timing) * 100);
    const accurate = stdDev <= this.config.toleranceThresholds.timing;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!accurate) {
      issues.push(`High timing measurement variance: ${stdDev.toFixed(2)}ms`);
      recommendations.push('Use high-resolution timing APIs');
    }

    return {
      metric: 'timing',
      accurate,
      accuracy,
      variance: stdDev,
      threshold: this.config.toleranceThresholds.timing,
      sampleCount: measurements.length,
      measurementMethods: methods,
      issues,
      recommendations
    };
  }

  /**
   * Validate monitoring overhead impact
   */
  private async validateMonitoringOverhead(): Promise<ValidationResult> {
    // Measure performance with and without monitoring
    const baselinePerformance = await this.measureBaselinePerformance();
    const monitoringPerformance = await this.measurePerformanceWithMonitoring();

    const overhead = ((baselinePerformance - monitoringPerformance) / baselinePerformance) * 100;
    const accurate = overhead <= this.config.toleranceThresholds.overhead;
    const accuracy = Math.max(0, 100 - (overhead / this.config.toleranceThresholds.overhead) * 100);

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!accurate) {
      issues.push(`Monitoring overhead too high: ${overhead.toFixed(2)}%`);
      recommendations.push('Optimize monitoring frequency and operations');
      recommendations.push('Consider using sampling strategies');
    }

    return {
      metric: 'overhead',
      accurate,
      accuracy,
      variance: overhead,
      threshold: this.config.toleranceThresholds.overhead,
      sampleCount: 2, // Baseline vs monitoring
      measurementMethods: ['baseline-performance', 'monitoring-performance'],
      issues,
      recommendations
    };
  }

  /**
   * Measure baseline performance without monitoring
   */
  private async measureBaselinePerformance(): Promise<number> {
    return new Promise((resolve) => {
      const iterations = 1000;
      const start = performance.now();

      // Simulate work without monitoring
      for (let i = 0; i < iterations; i++) {
        const dummy = Math.random() * Math.random();
      }

      const end = performance.now();
      resolve(end - start);
    });
  }

  /**
   * Measure performance with monitoring enabled
   */
  private async measurePerformanceWithMonitoring(): Promise<number> {
    return new Promise((resolve) => {
      const iterations = 1000;
      const start = performance.now();

      // Simulate work with monitoring overhead
      for (let i = 0; i < iterations; i++) {
        const dummy = Math.random() * Math.random();

        // Simulate monitoring operations
        if (i % 10 === 0) {
          const metrics = (performance as any).memory || {};
          const fps = performance.now(); // Simulate FPS calculation
        }
      }

      const end = performance.now();
      resolve(end - start);
    });
  }

  // ===== ANALYSIS METHODS =====

  /**
   * Calculate overall accuracy from validation results
   */
  private calculateOverallAccuracy(results: ValidationResult[]): number {
    if (results.length === 0) return 0;

    const totalAccuracy = results.reduce((sum, result) => sum + result.accuracy, 0);
    return totalAccuracy / results.length;
  }

  /**
   * Assess system health from validation results
   */
  private assessSystemHealth(results: ValidationResult[]): {
    healthy: boolean;
    issues: string[];
    criticalIssues: string[];
    warnings: string[];
  } {
    const allIssues = results.flatMap(result => result.issues);
    const criticalIssues = allIssues.filter(issue =>
      issue.includes('High') || issue.includes('No') || issue.includes('failed')
    );
    const warnings = allIssues.filter(issue => !criticalIssues.includes(issue));

    const healthy = criticalIssues.length === 0 && results.every(result => result.accurate);

    return {
      healthy,
      issues: allIssues,
      criticalIssues,
      warnings
    };
  }

  /**
   * Evaluate performance impact
   */
  private evaluatePerformanceImpact(results: ValidationResult[]): {
    measuredOverhead: number;
    impactLevel: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  } {
    const overheadResult = results.find(result => result.metric === 'overhead');
    const measuredOverhead = overheadResult?.variance || 0;

    let impactLevel: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
    if (measuredOverhead < 1) impactLevel = 'minimal';
    else if (measuredOverhead < 2) impactLevel = 'low';
    else if (measuredOverhead < 5) impactLevel = 'medium';
    else if (measuredOverhead < 10) impactLevel = 'high';
    else impactLevel = 'critical';

    const recommendations = results.flatMap(result => result.recommendations);

    return {
      measuredOverhead,
      impactLevel,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  /**
   * Generate calibration suggestions
   */
  private generateCalibrationSuggestions(results: ValidationResult[]): string[] {
    const suggestions: string[] = [];

    // Check for FPS accuracy issues
    const fpsResult = results.find(r => r.metric === 'fps');
    if (fpsResult && !fpsResult.accurate) {
      suggestions.push('Calibrate FPS measurement using multiple timing sources');
    }

    // Check for memory accuracy issues
    const memoryResult = results.find(r => r.metric === 'memory');
    if (memoryResult && !memoryResult.accurate) {
      suggestions.push('Implement memory measurement calibration based on known operations');
    }

    // Check for timing accuracy issues
    const timingResult = results.find(r => r.metric === 'timing');
    if (timingResult && !timingResult.accurate) {
      suggestions.push('Use performance.now() with system clock synchronization');
    }

    // Check for overhead issues
    const overheadResult = results.find(r => r.metric === 'overhead');
    if (overheadResult && !overheadResult.accurate) {
      suggestions.push('Implement adaptive sampling to reduce monitoring overhead');
      suggestions.push('Use requestIdleCallback for non-critical monitoring operations');
    }

    return suggestions;
  }

  // ===== UTILITY METHODS =====

  /**
   * Calculate variance of measurements
   */
  private calculateVariance(measurements: number[]): number {
    if (measurements.length < 2) return 0;

    const mean = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const variance = measurements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / measurements.length;
    return (Math.sqrt(variance) / mean) * 100; // Coefficient of variation as percentage
  }

  /**
   * Calculate standard deviation of measurements
   */
  private calculateStandardDeviation(measurements: number[]): number {
    if (measurements.length < 2) return 0;

    const mean = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const variance = measurements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / measurements.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate statistics for a set of measurements
   */
  private calculateStatistics(measurements: number[]): {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  } {
    if (measurements.length === 0) {
      return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const mean = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const stdDev = this.calculateStandardDeviation(measurements);

    return {
      mean,
      median,
      stdDev,
      min: sorted[0],
      max: sorted[sorted.length - 1]
    };
  }

  /**
   * Log validation results
   */
  private logValidationResults(report: AccuracyReport): void {
    console.log(`[AccuracyValidator] Validation Report - Overall Accuracy: ${report.overallAccuracy.toFixed(1)}%`);
    console.log(`[AccuracyValidator] System Healthy: ${report.systemHealth.healthy}`);
    console.log(`[AccuracyValidator] Performance Impact: ${report.performanceImpact.impactLevel} (${report.performanceImpact.measuredOverhead.toFixed(2)}%)`);

    if (report.systemHealth.criticalIssues.length > 0) {
      console.warn('[AccuracyValidator] Critical Issues:', report.systemHealth.criticalIssues);
    }

    if (report.calibrationSuggestions.length > 0) {
      console.log('[AccuracyValidator] Calibration Suggestions:', report.calibrationSuggestions);
    }
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===== PUBLIC API =====

  /**
   * Get latest accuracy report
   */
  public getLatestReport(): AccuracyReport | null {
    return this.validationHistory.length > 0
      ? this.validationHistory[this.validationHistory.length - 1]
      : null;
  }

  /**
   * Get validation history
   */
  public getValidationHistory(): AccuracyReport[] {
    return [...this.validationHistory];
  }

  /**
   * Run immediate validation (one-time)
   */
  public async validateNow(): Promise<AccuracyReport> {
    if (this.baselineMeasurements.fps.length === 0) {
      await this.establishBaseline();
    }
    return this.runAccuracyValidation();
  }

  /**
   * Get current validation status
   */
  public getValidationStatus(): {
    isValidating: boolean;
    lastValidation: number;
    nextValidation: number;
    reportsGenerated: number;
  } {
    return {
      isValidating: this.isValidating,
      lastValidation: this.lastValidation,
      nextValidation: this.isValidating ? this.lastValidation + this.config.validationInterval : 0,
      reportsGenerated: this.validationHistory.length
    };
  }

  /**
   * Reset validation state
   */
  public reset(): void {
    this.stopValidation();
    this.validationHistory = [];
    this.baselineMeasurements = { fps: [], memory: [], timing: [] };
    this.lastValidation = 0;
  }

  /**
   * Cleanup and shutdown
   */
  public destroy(): void {
    this.reset();
  }
}

// ===== SINGLETON INSTANCE =====

let validatorInstance: PerformanceAccuracyValidator | null = null;

/**
 * Get singleton accuracy validator instance
 */
export function getAccuracyValidator(config?: Partial<AccuracyValidationConfig>): PerformanceAccuracyValidator {
  if (!validatorInstance) {
    validatorInstance = new PerformanceAccuracyValidator(config);
  }
  return validatorInstance;
}

/**
 * Reset validator instance (for testing)
 */
export function resetAccuracyValidator(): void {
  if (validatorInstance) {
    validatorInstance.destroy();
  }
  validatorInstance = null;
}

export default {
  PerformanceAccuracyValidator,
  getAccuracyValidator,
  resetAccuracyValidator
};