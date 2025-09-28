/**
 * Test Metrics Collector
 *
 * Real-time test metrics collection system for comprehensive testing effectiveness validation.
 * Integrates with Vitest, provides CI/CD metrics, and supports quality gates validation.
 *
 * @fileoverview Test metrics collection with real-time monitoring and quality gates integration
 */

import type { TestSuiteMetrics } from './testing-effectiveness-validator.test';
import type { QualityGatesConfig, ValidationRule } from './quality-gates-config';
import { getQualityGatesConfig, VALIDATION_RULES, CRITICAL_COMPONENTS } from './quality-gates-config';

// Test execution metrics
export interface TestExecutionMetrics {
  testId: string;
  testName: string;
  suiteName: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  memoryUsage: {
    start: number;
    end: number;
    peak: number;
  };
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  performance?: {
    renderTime: number;
    interactionTime: number;
    layoutShift: number;
  };
}

// Real-time metrics aggregation
export interface RealTimeMetrics {
  currentSuite: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  executionTime: number;
  memoryUsage: number;
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  qualityGateStatus: {
    passed: boolean;
    violations: string[];
    warnings: string[];
  };
}

// Test metrics collector class
export class TestMetricsCollector {
  private metrics: TestExecutionMetrics[] = [];
  private suiteStartTime: number = 0;
  private config: QualityGatesConfig;
  private realTimeMetrics: RealTimeMetrics;
  private observers: Array<(metrics: RealTimeMetrics) => void> = [];

  constructor(environment?: string) {
    this.config = getQualityGatesConfig(environment);
    this.realTimeMetrics = this.initializeRealTimeMetrics();
  }

  // Initialize real-time metrics
  private initializeRealTimeMetrics(): RealTimeMetrics {
    return {
      currentSuite: '',
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      executionTime: 0,
      memoryUsage: 0,
      coverage: { statements: 0, branches: 0, functions: 0, lines: 0 },
      qualityGateStatus: { passed: true, violations: [], warnings: [] }
    };
  }

  // Start test suite execution
  startSuite(suiteName: string): void {
    this.realTimeMetrics.currentSuite = suiteName;
    this.suiteStartTime = performance.now();
    this.notifyObservers();
  }

  // Start individual test execution
  startTest(testName: string, suiteName: string): string {
    const testId = `${suiteName}-${testName}-${Date.now()}`;
    const memoryInfo = this.getMemoryInfo();

    const testMetric: TestExecutionMetrics = {
      testId,
      testName,
      suiteName,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      status: 'pending',
      memoryUsage: {
        start: memoryInfo.usedJSHeapSize,
        end: 0,
        peak: memoryInfo.usedJSHeapSize
      }
    };

    this.metrics.push(testMetric);
    return testId;
  }

  // End test execution with results
  endTest(testId: string, status: 'passed' | 'failed' | 'skipped', coverage?: any, performance?: any): void {
    const testMetric = this.metrics.find(m => m.testId === testId);
    if (!testMetric) return;

    const endTime = performance.now();
    const memoryInfo = this.getMemoryInfo();

    testMetric.endTime = endTime;
    testMetric.duration = endTime - testMetric.startTime;
    testMetric.status = status;
    testMetric.memoryUsage.end = memoryInfo.usedJSHeapSize;
    testMetric.memoryUsage.peak = Math.max(testMetric.memoryUsage.peak, memoryInfo.usedJSHeapSize);

    if (coverage) {
      testMetric.coverage = coverage;
    }

    if (performance) {
      testMetric.performance = performance;
    }

    // Update real-time metrics
    this.updateRealTimeMetrics();
    this.validateQualityGates();
    this.notifyObservers();
  }

  // Get memory information
  private getMemoryInfo(): MemoryInfo {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory;
    }

    // Fallback for Node.js environment
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();
      return {
        usedJSHeapSize: memory.heapUsed,
        totalJSHeapSize: memory.heapTotal,
        jsHeapSizeLimit: memory.heapTotal * 2
      } as MemoryInfo;
    }

    // Default fallback
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    } as MemoryInfo;
  }

  // Update real-time metrics aggregation
  private updateRealTimeMetrics(): void {
    const totalTests = this.metrics.length;
    const passedTests = this.metrics.filter(m => m.status === 'passed').length;
    const failedTests = this.metrics.filter(m => m.status === 'failed').length;
    const skippedTests = this.metrics.filter(m => m.status === 'skipped').length;

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageMemory = this.metrics.reduce((sum, m) => sum + m.memoryUsage.peak, 0) / totalTests || 0;

    // Calculate aggregated coverage
    const coverageMetrics = this.metrics.filter(m => m.coverage);
    const aggregatedCoverage = {
      statements: coverageMetrics.reduce((sum, m) => sum + (m.coverage?.statements || 0), 0) / coverageMetrics.length || 0,
      branches: coverageMetrics.reduce((sum, m) => sum + (m.coverage?.branches || 0), 0) / coverageMetrics.length || 0,
      functions: coverageMetrics.reduce((sum, m) => sum + (m.coverage?.functions || 0), 0) / coverageMetrics.length || 0,
      lines: coverageMetrics.reduce((sum, m) => sum + (m.coverage?.lines || 0), 0) / coverageMetrics.length || 0
    };

    this.realTimeMetrics = {
      ...this.realTimeMetrics,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      executionTime: totalDuration,
      memoryUsage: averageMemory / (1024 * 1024), // Convert to MB
      coverage: aggregatedCoverage
    };
  }

  // Validate quality gates in real-time
  private validateQualityGates(): void {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Convert to TestSuiteMetrics format for validation
    const testSuiteMetrics = this.convertToTestSuiteMetrics();

    // Run validation rules
    for (const rule of VALIDATION_RULES) {
      const result = rule.validate(testSuiteMetrics, this.config);

      if (!result.passed) {
        if (result.severity === 'error') {
          violations.push(`${rule.name}: ${result.message}`);
        } else if (result.severity === 'warning') {
          warnings.push(`${rule.name}: ${result.message}`);
        }
      }
    }

    this.realTimeMetrics.qualityGateStatus = {
      passed: violations.length === 0,
      violations,
      warnings
    };
  }

  // Convert internal metrics to TestSuiteMetrics format
  private convertToTestSuiteMetrics(): TestSuiteMetrics {
    return {
      totalTests: this.realTimeMetrics.totalTests,
      passingTests: this.realTimeMetrics.passedTests,
      failingTests: this.realTimeMetrics.failedTests,
      coverage: this.realTimeMetrics.coverage,
      performance: {
        averageExecutionTime: this.realTimeMetrics.executionTime / this.realTimeMetrics.totalTests || 0,
        slowestTests: this.getSlowentTests(),
        totalExecutionTime: this.realTimeMetrics.executionTime
      },
      architecturalValidation: {
        componentComplexity: new Map(CRITICAL_COMPONENTS.map(c => [c, 5])), // Simulated complexity
        dependencyViolations: this.realTimeMetrics.qualityGateStatus.violations,
        couplingMetrics: new Map(CRITICAL_COMPONENTS.map(c => [c, 3])), // Simulated coupling
        cohesionScores: new Map(CRITICAL_COMPONENTS.map(c => [c, 0.9])) // Simulated cohesion
      }
    };
  }

  // Get slowest tests
  private getSlowentTests(): Array<{ name: string; duration: number }> {
    return this.metrics
      .filter(m => m.duration > this.config.performance.maxTestDuration / 2)
      .map(m => ({ name: `${m.suiteName} - ${m.testName}`, duration: m.duration }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  }

  // Subscribe to real-time metrics updates
  subscribe(observer: (metrics: RealTimeMetrics) => void): () => void {
    this.observers.push(observer);

    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  // Notify observers of metrics updates
  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.realTimeMetrics));
  }

  // Get current real-time metrics
  getRealTimeMetrics(): RealTimeMetrics {
    return { ...this.realTimeMetrics };
  }

  // Get detailed test metrics
  getDetailedMetrics(): TestExecutionMetrics[] {
    return [...this.metrics];
  }

  // Generate comprehensive report
  generateReport(): {
    summary: RealTimeMetrics;
    qualityGates: {
      passed: boolean;
      violations: string[];
      warnings: string[];
      recommendations: string[];
    };
    details: {
      slowestTests: Array<{ name: string; duration: number }>;
      memoryHotspots: Array<{ name: string; memoryUsage: number }>;
      coverageGaps: string[];
    };
  } {
    const slowestTests = this.getSlowentTests();
    const memoryHotspots = this.metrics
      .map(m => ({ name: `${m.suiteName} - ${m.testName}`, memoryUsage: m.memoryUsage.peak / (1024 * 1024) }))
      .sort((a, b) => b.memoryUsage - a.memoryUsage)
      .slice(0, 5);

    const coverageGaps = this.identifyCoverageGaps();
    const recommendations = this.generateRecommendations();

    return {
      summary: this.realTimeMetrics,
      qualityGates: {
        ...this.realTimeMetrics.qualityGateStatus,
        recommendations
      },
      details: {
        slowestTests,
        memoryHotspots,
        coverageGaps
      }
    };
  }

  // Identify coverage gaps
  private identifyCoverageGaps(): string[] {
    const gaps: string[] = [];

    if (this.realTimeMetrics.coverage.statements < this.config.coverage.statements.minimum) {
      gaps.push(`Statement coverage gap: ${(this.config.coverage.statements.minimum - this.realTimeMetrics.coverage.statements).toFixed(1)}%`);
    }

    if (this.realTimeMetrics.coverage.branches < this.config.coverage.branches.minimum) {
      gaps.push(`Branch coverage gap: ${(this.config.coverage.branches.minimum - this.realTimeMetrics.coverage.branches).toFixed(1)}%`);
    }

    return gaps;
  }

  // Generate actionable recommendations
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    const slowTests = this.metrics.filter(m => m.duration > this.config.performance.maxTestDuration);
    if (slowTests.length > 0) {
      recommendations.push(`Optimize ${slowTests.length} slow tests exceeding ${this.config.performance.maxTestDuration}ms threshold`);
    }

    // Memory recommendations
    const highMemoryTests = this.metrics.filter(m => m.memoryUsage.peak > 50 * 1024 * 1024); // 50MB
    if (highMemoryTests.length > 0) {
      recommendations.push(`Review ${highMemoryTests.length} tests with high memory usage (>50MB)`);
    }

    // Coverage recommendations
    if (this.realTimeMetrics.coverage.statements < this.config.coverage.statements.target) {
      recommendations.push('Add more unit tests to improve statement coverage');
    }

    if (this.realTimeMetrics.coverage.branches < this.config.coverage.branches.target) {
      recommendations.push('Add tests for conditional branches to improve branch coverage');
    }

    // Quality gates recommendations
    if (this.realTimeMetrics.qualityGateStatus.violations.length > 0) {
      recommendations.push('Address quality gate violations before deployment');
    }

    return recommendations;
  }

  // Reset metrics for new test run
  reset(): void {
    this.metrics = [];
    this.realTimeMetrics = this.initializeRealTimeMetrics();
    this.suiteStartTime = 0;
  }

  // Export metrics for CI/CD integration
  exportForCI(): {
    passed: boolean;
    summary: string;
    metrics: any;
    recommendations: string[];
  } {
    const report = this.generateReport();

    return {
      passed: report.qualityGates.passed,
      summary: `Tests: ${this.realTimeMetrics.passedTests}/${this.realTimeMetrics.totalTests} passed, Coverage: ${this.realTimeMetrics.coverage.statements.toFixed(1)}%`,
      metrics: {
        tests: {
          total: this.realTimeMetrics.totalTests,
          passed: this.realTimeMetrics.passedTests,
          failed: this.realTimeMetrics.failedTests,
          skipped: this.realTimeMetrics.skippedTests
        },
        coverage: this.realTimeMetrics.coverage,
        performance: {
          executionTime: this.realTimeMetrics.executionTime,
          memoryUsage: this.realTimeMetrics.memoryUsage
        },
        qualityGates: this.realTimeMetrics.qualityGateStatus
      },
      recommendations: report.qualityGates.recommendations
    };
  }
}

// Singleton instance for global usage
let globalCollector: TestMetricsCollector | null = null;

// Get or create global collector instance
export function getGlobalCollector(environment?: string): TestMetricsCollector {
  if (!globalCollector) {
    globalCollector = new TestMetricsCollector(environment);
  }
  return globalCollector;
}

// Reset global collector
export function resetGlobalCollector(): void {
  globalCollector = null;
}

// Vitest integration utilities
export function createVitestReporter() {
  const collector = getGlobalCollector();

  return {
    onTestSuiteStart: (suite: any) => {
      collector.startSuite(suite.name || 'Unknown Suite');
    },

    onTestStart: (test: any) => {
      const testId = collector.startTest(test.name || 'Unknown Test', test.suite?.name || 'Unknown Suite');
      test._metricsId = testId;
    },

    onTestFinished: (test: any) => {
      if (test._metricsId) {
        const status = test.result?.state === 'pass' ? 'passed' :
                      test.result?.state === 'fail' ? 'failed' : 'skipped';
        collector.endTest(test._metricsId, status);
      }
    },

    onFinished: () => {
      const report = collector.generateReport();
      console.log('\n=== Test Metrics Report ===');
      console.log(`Tests: ${report.summary.passedTests}/${report.summary.totalTests} passed`);
      console.log(`Coverage: ${report.summary.coverage.statements.toFixed(1)}%`);
      console.log(`Quality Gates: ${report.qualityGates.passed ? 'PASSED' : 'FAILED'}`);

      if (report.qualityGates.violations.length > 0) {
        console.log('\nViolations:');
        report.qualityGates.violations.forEach(violation => console.log(`  - ${violation}`));
      }

      if (report.qualityGates.recommendations.length > 0) {
        console.log('\nRecommendations:');
        report.qualityGates.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
    }
  };
}