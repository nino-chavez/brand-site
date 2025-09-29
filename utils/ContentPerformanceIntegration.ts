/**
 * Content Performance Integration Utility
 *
 * Integrates content performance monitoring with the existing canvas state
 * system and provides utilities for performance budgeting, regression
 * detection, and automated optimization.
 *
 * Task 8: Performance Integration and Monitoring
 */

import { ContentLevel } from '../types/section-content';
import type { SpatialPhotoWorkflowSection } from '../types/canvas';
import { CONTENT_PERFORMANCE_BUDGETS } from '../components/ContentPerformanceMonitor';
import type {
  ContentPerformanceMetrics,
  BudgetViolation,
  PerformanceGrade,
  ContentTransitionMetrics
} from '../components/ContentPerformanceMonitor';

// ============================================================================
// PERFORMANCE BASELINE TRACKING
// ============================================================================

/**
 * Performance baseline for regression detection
 */
export interface PerformanceBaseline {
  timestamp: number;
  version: string;
  metrics: {
    averageTransitionTime: Record<ContentLevel, number>;
    memoryUsage: Record<ContentLevel, number>;
    sectionPerformance: Record<SpatialPhotoWorkflowSection, {
      averageTransitionTime: number;
      memoryEfficiency: number;
      budgetCompliance: number;
    }>;
  };
  environment: {
    userAgent: string;
    deviceMemory?: number;
    hardwareConcurrency: number;
    connection?: string;
  };
}

/**
 * Performance regression detection result
 */
export interface RegressionDetectionResult {
  hasRegression: boolean;
  regressions: Array<{
    metric: string;
    section?: SpatialPhotoWorkflowSection;
    level?: ContentLevel;
    baseline: number;
    current: number;
    degradation: number; // Percentage
    severity: 'minor' | 'moderate' | 'severe';
  }>;
  recommendations: string[];
}

// ============================================================================
// PERFORMANCE BUDGET MANAGER
// ============================================================================

export class PerformanceBudgetManager {
  private budgets: typeof CONTENT_PERFORMANCE_BUDGETS;
  private customBudgets: Map<string, number> = new Map();
  private violations: BudgetViolation[] = [];
  private baselineData: PerformanceBaseline | null = null;

  constructor(customBudgets?: Partial<typeof CONTENT_PERFORMANCE_BUDGETS>) {
    this.budgets = { ...CONTENT_PERFORMANCE_BUDGETS, ...customBudgets };
  }

  /**
   * Check if a transition meets the performance budget
   */
  checkTransitionBudget(
    section: SpatialPhotoWorkflowSection,
    level: ContentLevel,
    actualTime: number
  ): BudgetViolation | null {
    const baseBudget = this.budgets.transitionTime[level];
    const sectionConfig = this.budgets.sections[section];
    const budget = baseBudget * sectionConfig.transitionMultiplier;

    if (actualTime <= budget) return null;

    const violation: BudgetViolation = {
      type: 'transition',
      section,
      level,
      actual: actualTime,
      budget,
      severity: actualTime > budget * 2 ? 'critical' :
               actualTime > budget * 1.5 ? 'high' : 'medium',
      timestamp: performance.now()
    };

    this.violations.push(violation);
    return violation;
  }

  /**
   * Check if memory usage meets the budget
   */
  checkMemoryBudget(
    section: SpatialPhotoWorkflowSection,
    level: ContentLevel,
    memoryUsage: number
  ): BudgetViolation | null {
    const baseBudget = this.budgets.memory[level];
    const sectionConfig = this.budgets.sections[section];
    const budget = baseBudget * sectionConfig.memoryMultiplier;

    if (memoryUsage <= budget) return null;

    const violation: BudgetViolation = {
      type: 'memory',
      section,
      level,
      actual: memoryUsage,
      budget,
      severity: memoryUsage > budget * 2 ? 'critical' :
               memoryUsage > budget * 1.5 ? 'high' : 'medium',
      timestamp: performance.now()
    };

    this.violations.push(violation);
    return violation;
  }

  /**
   * Get current budget compliance score
   */
  getBudgetCompliance(): { overall: number; bySection: Map<SpatialPhotoWorkflowSection, number> } {
    const recentViolations = this.violations.filter(
      v => performance.now() - v.timestamp < 60000 // Last minute
    );

    if (recentViolations.length === 0) {
      return {
        overall: 1.0,
        bySection: new Map()
      };
    }

    // Calculate compliance score
    const totalViolations = recentViolations.length;
    const criticalViolations = recentViolations.filter(v => v.severity === 'critical').length;
    const highViolations = recentViolations.filter(v => v.severity === 'high').length;

    const overallScore = Math.max(0, 1.0 - (
      (criticalViolations * 0.3) +
      (highViolations * 0.2) +
      ((totalViolations - criticalViolations - highViolations) * 0.1)
    ));

    // Calculate by-section compliance
    const bySection = new Map<SpatialPhotoWorkflowSection, number>();
    const sections: SpatialPhotoWorkflowSection[] = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

    sections.forEach(section => {
      const sectionViolations = recentViolations.filter(v => v.section === section);
      if (sectionViolations.length === 0) {
        bySection.set(section, 1.0);
      } else {
        const score = Math.max(0, 1.0 - (sectionViolations.length * 0.1));
        bySection.set(section, score);
      }
    });

    return { overall: overallScore, bySection };
  }

  /**
   * Set performance baseline for regression detection
   */
  setBaseline(metrics: ContentPerformanceMetrics): void {
    this.baselineData = {
      timestamp: Date.now(),
      version: '1.0.0', // Could be from package.json
      metrics: {
        averageTransitionTime: {
          [ContentLevel.PREVIEW]: this.getAverageTransitionTime(metrics, ContentLevel.PREVIEW),
          [ContentLevel.SUMMARY]: this.getAverageTransitionTime(metrics, ContentLevel.SUMMARY),
          [ContentLevel.DETAILED]: this.getAverageTransitionTime(metrics, ContentLevel.DETAILED),
          [ContentLevel.TECHNICAL]: this.getAverageTransitionTime(metrics, ContentLevel.TECHNICAL)
        },
        memoryUsage: {
          [ContentLevel.PREVIEW]: this.getMemoryUsage(metrics, ContentLevel.PREVIEW),
          [ContentLevel.SUMMARY]: this.getMemoryUsage(metrics, ContentLevel.SUMMARY),
          [ContentLevel.DETAILED]: this.getMemoryUsage(metrics, ContentLevel.DETAILED),
          [ContentLevel.TECHNICAL]: this.getMemoryUsage(metrics, ContentLevel.TECHNICAL)
        },
        sectionPerformance: this.getSectionPerformanceSnapshot(metrics)
      },
      environment: {
        userAgent: navigator.userAgent,
        deviceMemory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        connection: (navigator as any).connection?.effectiveType
      }
    };
  }

  /**
   * Detect performance regressions
   */
  detectRegressions(currentMetrics: ContentPerformanceMetrics): RegressionDetectionResult {
    if (!this.baselineData) {
      return {
        hasRegression: false,
        regressions: [],
        recommendations: ['Set performance baseline for regression detection']
      };
    }

    const regressions: RegressionDetectionResult['regressions'] = [];
    const regressionThreshold = 0.15; // 15% degradation threshold

    // Check transition time regressions
    Object.values(ContentLevel).forEach(level => {
      const baseline = this.baselineData!.metrics.averageTransitionTime[level];
      const current = this.getAverageTransitionTime(currentMetrics, level);

      if (current > baseline * (1 + regressionThreshold)) {
        const degradation = ((current - baseline) / baseline) * 100;
        regressions.push({
          metric: 'transition_time',
          level,
          baseline,
          current,
          degradation,
          severity: degradation > 50 ? 'severe' : degradation > 25 ? 'moderate' : 'minor'
        });
      }
    });

    // Check memory usage regressions
    Object.values(ContentLevel).forEach(level => {
      const baseline = this.baselineData!.metrics.memoryUsage[level];
      const current = this.getMemoryUsage(currentMetrics, level);

      if (current > baseline * (1 + regressionThreshold)) {
        const degradation = ((current - baseline) / baseline) * 100;
        regressions.push({
          metric: 'memory_usage',
          level,
          baseline,
          current,
          degradation,
          severity: degradation > 50 ? 'severe' : degradation > 25 ? 'moderate' : 'minor'
        });
      }
    });

    // Generate recommendations
    const recommendations: string[] = [];
    const severeRegressions = regressions.filter(r => r.severity === 'severe');
    const moderateRegressions = regressions.filter(r => r.severity === 'moderate');

    if (severeRegressions.length > 0) {
      recommendations.push('Immediate attention required: Severe performance regression detected');
      recommendations.push('Consider rolling back recent changes');
    }

    if (moderateRegressions.length > 0) {
      recommendations.push('Optimize content loading and transitions');
      recommendations.push('Review memory management in content adapters');
    }

    if (regressions.some(r => r.metric === 'transition_time')) {
      recommendations.push('Optimize content level transition animations');
    }

    if (regressions.some(r => r.metric === 'memory_usage')) {
      recommendations.push('Implement content caching and cleanup strategies');
    }

    return {
      hasRegression: regressions.length > 0,
      regressions,
      recommendations
    };
  }

  private getAverageTransitionTime(metrics: ContentPerformanceMetrics, level: ContentLevel): number {
    const levelMetrics = metrics.transitionMetrics.transitionsByLevel.get(level);
    return levelMetrics?.averageTime || 0;
  }

  private getMemoryUsage(metrics: ContentPerformanceMetrics, level: ContentLevel): number {
    const memoryMetrics = metrics.memoryByLevel.get(level);
    return memoryMetrics?.heapUsed || 0;
  }

  private getSectionPerformanceSnapshot(metrics: ContentPerformanceMetrics): Record<SpatialPhotoWorkflowSection, any> {
    const snapshot: any = {};
    const sections: SpatialPhotoWorkflowSection[] = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

    sections.forEach(section => {
      const sectionMetrics = metrics.sectionMetrics.get(section);
      if (sectionMetrics) {
        snapshot[section] = {
          averageTransitionTime: sectionMetrics.averageTransitionTime,
          memoryEfficiency: 1.0 - (sectionMetrics.memoryUsage / 100), // Inverse of memory usage
          budgetCompliance: 1.0 - sectionMetrics.budgetUtilization
        };
      }
    });

    return snapshot;
  }
}

// ============================================================================
// PERFORMANCE OPTIMIZATION ENGINE
// ============================================================================

export class PerformanceOptimizationEngine {
  private budgetManager: PerformanceBudgetManager;
  private optimizationHistory: Array<{
    timestamp: number;
    optimization: string;
    impact: string;
    metrics: ContentPerformanceMetrics;
  }> = [];

  constructor(budgetManager: PerformanceBudgetManager) {
    this.budgetManager = budgetManager;
  }

  /**
   * Analyze performance and suggest optimizations
   */
  analyzeAndOptimize(metrics: ContentPerformanceMetrics): {
    suggestions: Array<{
      priority: 'high' | 'medium' | 'low';
      category: 'memory' | 'transitions' | 'loading' | 'budgets';
      action: string;
      expectedImpact: string;
      implementation: string;
    }>;
    automaticOptimizations: string[];
  } {
    const suggestions: any[] = [];
    const automaticOptimizations: string[] = [];

    // Analyze transition performance
    if (metrics.transitionMetrics.averageTransitionTime > 150) {
      suggestions.push({
        priority: 'high',
        category: 'transitions',
        action: 'Optimize content level transitions',
        expectedImpact: 'Reduce average transition time by 30-50%',
        implementation: 'Use React.memo() for content adapters, optimize state updates'
      });

      // Automatic optimization: Enable transition throttling
      automaticOptimizations.push('transition-throttling');
    }

    // Analyze memory usage
    const totalMemory = Array.from(metrics.memoryByLevel.values())
      .reduce((sum, mem) => sum + mem.heapUsed, 0);

    if (totalMemory > 100) { // 100MB threshold
      suggestions.push({
        priority: 'high',
        category: 'memory',
        action: 'Implement memory cleanup strategies',
        expectedImpact: 'Reduce memory usage by 20-40%',
        implementation: 'Add content caching with LRU eviction, lazy load heavy assets'
      });

      // Automatic optimization: Enable memory cleanup
      automaticOptimizations.push('memory-cleanup');
    }

    // Analyze budget compliance
    const compliance = this.budgetManager.getBudgetCompliance();
    if (compliance.overall < 0.8) {
      suggestions.push({
        priority: 'medium',
        category: 'budgets',
        action: 'Address budget violations',
        expectedImpact: 'Improve budget compliance to >90%',
        implementation: 'Review and adjust performance budgets, optimize critical sections'
      });
    }

    // Analyze loading performance
    if (metrics.loadingMetrics.previewLoadTime > 200) {
      suggestions.push({
        priority: 'medium',
        category: 'loading',
        action: 'Optimize progressive loading',
        expectedImpact: 'Reduce initial load time by 30%',
        implementation: 'Implement skeleton screens, optimize image loading strategy'
      });

      // Automatic optimization: Enable progressive loading
      automaticOptimizations.push('progressive-loading');
    }

    // Apply automatic optimizations
    this.applyAutomaticOptimizations(automaticOptimizations, metrics);

    return { suggestions, automaticOptimizations };
  }

  private applyAutomaticOptimizations(optimizations: string[], metrics: ContentPerformanceMetrics): void {
    optimizations.forEach(optimization => {
      switch (optimization) {
        case 'transition-throttling':
          // Set CSS custom property to throttle transitions
          document.documentElement.style.setProperty('--content-transition-duration', '200ms');
          this.recordOptimization(optimization, 'Throttled transition animations', metrics);
          break;

        case 'memory-cleanup':
          // Trigger garbage collection if available
          if ('gc' in window && typeof (window as any).gc === 'function') {
            try {
              (window as any).gc();
              this.recordOptimization(optimization, 'Forced garbage collection', metrics);
            } catch (error) {
              console.warn('Garbage collection not available');
            }
          }
          break;

        case 'progressive-loading':
          // Enable progressive enhancement mode
          document.documentElement.style.setProperty('--progressive-enhancement', '1');
          this.recordOptimization(optimization, 'Enabled progressive loading mode', metrics);
          break;
      }
    });
  }

  private recordOptimization(optimization: string, impact: string, metrics: ContentPerformanceMetrics): void {
    this.optimizationHistory.push({
      timestamp: Date.now(),
      optimization,
      impact,
      metrics: JSON.parse(JSON.stringify(metrics)) // Deep copy
    });

    // Keep only last 20 optimizations
    if (this.optimizationHistory.length > 20) {
      this.optimizationHistory = this.optimizationHistory.slice(-20);
    }
  }

  /**
   * Get optimization history for analysis
   */
  getOptimizationHistory(): typeof this.optimizationHistory {
    return [...this.optimizationHistory];
  }
}

// ============================================================================
// PERFORMANCE DASHBOARD MANAGER
// ============================================================================

export class PerformanceDashboardManager {
  private metricsHistory: ContentPerformanceMetrics[] = [];
  private alerts: BudgetViolation[] = [];
  private isRecording = false;

  /**
   * Start recording performance metrics
   */
  startRecording(): void {
    this.isRecording = true;
    this.metricsHistory = [];
    this.alerts = [];
  }

  /**
   * Stop recording performance metrics
   */
  stopRecording(): void {
    this.isRecording = false;
  }

  /**
   * Record new performance metrics
   */
  recordMetrics(metrics: ContentPerformanceMetrics): void {
    if (!this.isRecording) return;

    this.metricsHistory.push(JSON.parse(JSON.stringify(metrics)));

    // Keep only last 100 records to prevent memory bloat
    if (this.metricsHistory.length > 100) {
      this.metricsHistory = this.metricsHistory.slice(-100);
    }
  }

  /**
   * Record performance alert
   */
  recordAlert(violation: BudgetViolation): void {
    this.alerts.push(violation);

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: {
      recordingDuration: number;
      totalMetrics: number;
      totalAlerts: number;
      averageGrade: string;
    };
    trends: {
      transitionTimes: number[];
      memoryUsage: number[];
      budgetCompliance: number[];
    };
    criticalIssues: BudgetViolation[];
    recommendations: string[];
  } {
    if (this.metricsHistory.length === 0) {
      return {
        summary: {
          recordingDuration: 0,
          totalMetrics: 0,
          totalAlerts: 0,
          averageGrade: 'N/A'
        },
        trends: {
          transitionTimes: [],
          memoryUsage: [],
          budgetCompliance: []
        },
        criticalIssues: [],
        recommendations: ['Start recording metrics to generate performance report']
      };
    }

    const firstRecord = this.metricsHistory[0];
    const lastRecord = this.metricsHistory[this.metricsHistory.length - 1];
    const duration = Date.now() - (Date.now() - (this.metricsHistory.length * 2000)); // Approximate

    // Calculate trends
    const transitionTimes = this.metricsHistory.map(m => m.transitionMetrics.averageTransitionTime);
    const memoryUsage = this.metricsHistory.map(m =>
      Array.from(m.memoryByLevel.values()).reduce((sum, mem) => sum + mem.heapUsed, 0)
    );
    const budgetCompliance = this.metricsHistory.map(m => m.budgetCompliance.overallCompliance);

    // Calculate average grade
    const grades = this.metricsHistory.map(m => m.performanceGrade.overall);
    const gradeValues = { A: 5, B: 4, C: 3, D: 2, F: 1 };
    const averageGradeValue = grades.reduce((sum, grade) => sum + gradeValues[grade], 0) / grades.length;
    const averageGrade = Object.keys(gradeValues).find(grade =>
      gradeValues[grade as keyof typeof gradeValues] === Math.round(averageGradeValue)
    ) || 'C';

    // Critical issues
    const criticalIssues = this.alerts.filter(alert => alert.severity === 'critical');

    // Generate recommendations
    const recommendations: string[] = [];
    if (transitionTimes.some(time => time > 200)) {
      recommendations.push('Optimize content level transitions');
    }
    if (memoryUsage.some(usage => usage > 150)) {
      recommendations.push('Implement memory management strategies');
    }
    if (budgetCompliance.some(compliance => compliance < 0.7)) {
      recommendations.push('Review and adjust performance budgets');
    }
    if (criticalIssues.length > 0) {
      recommendations.push('Address critical performance violations immediately');
    }

    return {
      summary: {
        recordingDuration: duration,
        totalMetrics: this.metricsHistory.length,
        totalAlerts: this.alerts.length,
        averageGrade
      },
      trends: {
        transitionTimes,
        memoryUsage,
        budgetCompliance
      },
      criticalIssues,
      recommendations
    };
  }

  /**
   * Export performance data for analysis
   */
  exportData(): {
    metrics: ContentPerformanceMetrics[];
    alerts: BudgetViolation[];
    exportTimestamp: number;
  } {
    return {
      metrics: [...this.metricsHistory],
      alerts: [...this.alerts],
      exportTimestamp: Date.now()
    };
  }
}

// ============================================================================
// INTEGRATION UTILITIES
// ============================================================================

/**
 * Create integrated performance monitoring system
 */
export function createPerformanceMonitoringSystem(): {
  budgetManager: PerformanceBudgetManager;
  optimizationEngine: PerformanceOptimizationEngine;
  dashboardManager: PerformanceDashboardManager;
} {
  const budgetManager = new PerformanceBudgetManager();
  const optimizationEngine = new PerformanceOptimizationEngine(budgetManager);
  const dashboardManager = new PerformanceDashboardManager();

  return {
    budgetManager,
    optimizationEngine,
    dashboardManager
  };
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitoringConfig {
  enableAutomaticOptimization: boolean;
  enableRegressionDetection: boolean;
  budgetMultipliers: {
    sections: Partial<Record<SpatialPhotoWorkflowSection, {
      memoryMultiplier: number;
      transitionMultiplier: number;
    }>>;
  };
  alertThresholds: {
    criticalViolationCount: number;
    regressionPercentage: number;
  };
}

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceMonitoringConfig = {
  enableAutomaticOptimization: true,
  enableRegressionDetection: true,
  budgetMultipliers: {
    sections: {
      capture: { memoryMultiplier: 1.2, transitionMultiplier: 0.8 },
      portfolio: { memoryMultiplier: 1.3, transitionMultiplier: 1.1 }
    }
  },
  alertThresholds: {
    criticalViolationCount: 3,
    regressionPercentage: 15
  }
};

/**
 * Global performance monitoring instance
 */
export const globalPerformanceMonitoring = createPerformanceMonitoringSystem();