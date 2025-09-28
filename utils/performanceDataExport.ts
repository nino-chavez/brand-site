/**
 * Performance Data Export and Analysis Utilities
 *
 * Provides comprehensive data export, analysis, and visualization tools for
 * performance monitoring data. Supports multiple export formats and advanced
 * analysis capabilities for production monitoring and debugging.
 *
 * @fileoverview Task 6.3: Data export and analysis tools
 * @version 1.0.0
 * @since Task 6.3 - Data Collection Separation
 */

import type {
  RawPerformanceDataPoint,
  AggregatedPerformanceData,
  DataExportOptions
} from '../services/PerformanceDataCollectionService';

// ===== EXPORT TYPES =====

/**
 * Export result with metadata
 */
export interface ExportResult {
  success: boolean;
  format: string;
  fileName: string;
  size: number;
  dataPoints: number;
  exportTime: number;
  downloadUrl?: string;
  error?: string;
}

/**
 * Analysis report for performance data
 */
export interface PerformanceAnalysisReport {
  summary: {
    totalSamples: number;
    timeRange: { start: number; end: number; duration: number };
    averagePerformance: { fps: number; memory: number; operations: number };
    performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    healthScore: number; // 0-100
  };
  trends: {
    fpsDecline: { detected: boolean; severity: 'low' | 'medium' | 'high'; rate: number };
    memoryGrowth: { detected: boolean; severity: 'low' | 'medium' | 'high'; rate: number };
    performanceDegradation: { events: number; severity: 'low' | 'medium' | 'high' };
  };
  bottlenecks: {
    slowestOperations: Array<{ name: string; avgDuration: number; frequency: number }>;
    memoryLeaks: Array<{ timeRange: string; growthRate: number; severity: string }>;
    fpsDrops: Array<{ timestamp: number; minFps: number; duration: number }>;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: 'performance' | 'memory' | 'optimization';
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  deviceMetrics: {
    capabilities: Record<string, any>;
    limitations: string[];
    optimalSettings: Record<string, any>;
  };
}

/**
 * Visualization data for charts and graphs
 */
export interface PerformanceVisualizationData {
  timeline: {
    timestamps: number[];
    fps: number[];
    memory: number[];
    operations: number[];
  };
  distributions: {
    fpsHistogram: Array<{ range: string; count: number }>;
    memoryHistogram: Array<{ range: string; count: number }>;
    operationDurationHistogram: Array<{ range: string; count: number }>;
  };
  correlations: {
    fpsMemoryCorrelation: number;
    operationPerformanceCorrelation: number;
    qualityPerformanceCorrelation: number;
  };
  heatmaps: {
    hourlyPerformance: Array<{ hour: number; performance: number }>;
    operationFrequency: Array<{ operation: string; frequency: number; avgDuration: number }>;
  };
}

// ===== DATA EXPORT MANAGER =====

/**
 * Manages data export and analysis operations
 */
export class PerformanceDataExportManager {
  private compressionSupported: boolean;

  constructor() {
    this.compressionSupported = this.checkCompressionSupport();
  }

  // ===== EXPORT METHODS =====

  /**
   * Export performance data in specified format
   */
  public async exportData(
    rawData: RawPerformanceDataPoint[],
    aggregatedData: AggregatedPerformanceData[],
    options: DataExportOptions
  ): Promise<ExportResult> {
    const exportStart = performance.now();

    try {
      let exportedData: string;
      let fileName: string;
      let mimeType: string;

      switch (options.format) {
        case 'json':
          { const result = this.exportAsJSON(rawData, aggregatedData, options);
          exportedData = result.data;
          fileName = result.fileName;
          mimeType = 'application/json'; }
          break;

        case 'csv':
          { const result = this.exportAsCSV(rawData, aggregatedData, options);
          exportedData = result.data;
          fileName = result.fileName;
          mimeType = 'text/csv'; }
          break;

        case 'metrics':
          { const result = this.exportAsMetrics(rawData, aggregatedData, options);
          exportedData = result.data;
          fileName = result.fileName;
          mimeType = 'text/plain'; }
          break;

        case 'summary':
          { const result = this.exportAsSummary(rawData, aggregatedData, options);
          exportedData = result.data;
          fileName = result.fileName;
          mimeType = 'text/markdown'; }
          break;

        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // Apply compression if requested and supported
      if (options.compressionLevel && options.compressionLevel !== 'none' && this.compressionSupported) {
        exportedData = await this.compressData(exportedData, options.compressionLevel);
        fileName += '.gz';
        mimeType = 'application/gzip';
      }

      // Create download URL
      const blob = new Blob([exportedData], { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);

      const exportEnd = performance.now();
      const exportTime = exportEnd - exportStart;

      return {
        success: true,
        format: options.format,
        fileName,
        size: blob.size,
        dataPoints: rawData.length + aggregatedData.length,
        exportTime,
        downloadUrl
      };

    } catch (error) {
      const exportEnd = performance.now();
      const exportTime = exportEnd - exportStart;

      return {
        success: false,
        format: options.format,
        fileName: '',
        size: 0,
        dataPoints: 0,
        exportTime,
        error: error instanceof Error ? error.message : 'Unknown export error'
      };
    }
  }

  /**
   * Export data as JSON
   */
  private exportAsJSON(
    rawData: RawPerformanceDataPoint[],
    aggregatedData: AggregatedPerformanceData[],
    options: DataExportOptions
  ): { data: string; fileName: string } {
    const filteredRawData = this.filterDataByTimeRange(rawData, options.timeRange);
    const filteredAggregatedData = this.filterAggregatedDataByTimeRange(aggregatedData, options.timeRange);

    const exportData: any = {
      metadata: {
        exportTime: Date.now(),
        format: 'json',
        version: '1.0.0',
        timeRange: options.timeRange || { start: 0, end: Date.now() },
        dataPoints: {
          raw: filteredRawData.length,
          aggregated: filteredAggregatedData.length
        }
      }
    };

    if (options.includeRawData !== false) {
      exportData.rawData = filteredRawData;
    }

    if (options.includeAggregated !== false) {
      exportData.aggregatedData = filteredAggregatedData;
    }

    if (options.includeMetadata !== false) {
      exportData.analysis = this.generateQuickAnalysis(filteredRawData, filteredAggregatedData);
    }

    const fileName = options.fileName || `performance-data-${new Date().toISOString().slice(0, 19)}.json`;

    return {
      data: JSON.stringify(exportData, null, 2),
      fileName
    };
  }

  /**
   * Export data as CSV
   */
  private exportAsCSV(
    rawData: RawPerformanceDataPoint[],
    aggregatedData: AggregatedPerformanceData[],
    options: DataExportOptions
  ): { data: string; fileName: string } {
    const filteredRawData = this.filterDataByTimeRange(rawData, options.timeRange);

    // CSV Headers
    const headers = [
      'timestamp',
      'type',
      'value',
      'sessionId',
      'collectionOverhead',
      'metadata'
    ];

    // CSV Rows
    const rows = filteredRawData.map(dataPoint => [
      new Date(dataPoint.timestamp).toISOString(),
      dataPoint.type,
      dataPoint.value.toString(),
      dataPoint.sessionId,
      dataPoint.collectionOverhead.toString(),
      JSON.stringify(dataPoint.metadata)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const fileName = options.fileName || `performance-data-${new Date().toISOString().slice(0, 19)}.csv`;

    return {
      data: csvContent,
      fileName
    };
  }

  /**
   * Export data as Prometheus-style metrics
   */
  private exportAsMetrics(
    rawData: RawPerformanceDataPoint[],
    aggregatedData: AggregatedPerformanceData[],
    options: DataExportOptions
  ): { data: string; fileName: string } {
    const filteredRawData = this.filterDataByTimeRange(rawData, options.timeRange);
    const filteredAggregatedData = this.filterAggregatedDataByTimeRange(aggregatedData, options.timeRange);

    const timestamp = Math.floor(Date.now() / 1000);
    let metricsContent = '';

    // Generate metrics from aggregated data
    for (const data of filteredAggregatedData) {
      const windowStart = Math.floor(data.timeWindow.start / 1000);

      metricsContent += `# Performance metrics for window ${windowStart}\n`;
      metricsContent += `performance_fps_avg{window="${windowStart}"} ${data.metrics.fps.avg} ${windowStart}\n`;
      metricsContent += `performance_fps_min{window="${windowStart}"} ${data.metrics.fps.min} ${windowStart}\n`;
      metricsContent += `performance_fps_max{window="${windowStart}"} ${data.metrics.fps.max} ${windowStart}\n`;
      metricsContent += `performance_memory_avg{window="${windowStart}"} ${data.metrics.memory.avg} ${windowStart}\n`;
      metricsContent += `performance_memory_peak{window="${windowStart}"} ${data.metrics.memory.peak} ${windowStart}\n`;
      metricsContent += `performance_operations_total{window="${windowStart}"} ${data.metrics.operations.total} ${windowStart}\n`;
      metricsContent += `performance_collection_overhead{window="${windowStart}"} ${data.overhead.collectionTime} ${windowStart}\n`;
      metricsContent += '\n';
    }

    const fileName = options.fileName || `performance-metrics-${new Date().toISOString().slice(0, 19)}.txt`;

    return {
      data: metricsContent,
      fileName
    };
  }

  /**
   * Export data as markdown summary
   */
  private exportAsSummary(
    rawData: RawPerformanceDataPoint[],
    aggregatedData: AggregatedPerformanceData[],
    options: DataExportOptions
  ): { data: string; fileName: string } {
    const filteredRawData = this.filterDataByTimeRange(rawData, options.timeRange);
    const filteredAggregatedData = this.filterAggregatedDataByTimeRange(aggregatedData, options.timeRange);
    const analysis = this.generateDetailedAnalysis(filteredRawData, filteredAggregatedData);

    const summary = `# Performance Analysis Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Samples**: ${analysis.summary.totalSamples}
- **Time Range**: ${Math.round(analysis.summary.timeRange.duration / 1000)}s
- **Average FPS**: ${analysis.summary.averagePerformance.fps.toFixed(1)}
- **Average Memory**: ${analysis.summary.averagePerformance.memory.toFixed(1)} MB
- **Performance Grade**: ${analysis.summary.performanceGrade}
- **Health Score**: ${analysis.summary.healthScore}/100

## Performance Trends

### FPS Performance
${analysis.trends.fpsDecline.detected
  ? `⚠️ FPS decline detected (${analysis.trends.fpsDecline.severity} severity, ${analysis.trends.fpsDecline.rate.toFixed(2)} fps/min decline)`
  : '✅ Stable FPS performance'}

### Memory Usage
${analysis.trends.memoryGrowth.detected
  ? `⚠️ Memory growth detected (${analysis.trends.memoryGrowth.severity} severity, ${analysis.trends.memoryGrowth.rate.toFixed(2)} MB/min growth)`
  : '✅ Stable memory usage'}

## Top Issues

### Slowest Operations
${analysis.bottlenecks.slowestOperations.map(op =>
  `- **${op.name}**: ${op.avgDuration.toFixed(2)}ms avg (${op.frequency} occurrences)`
).join('\n')}

### FPS Drops
${analysis.bottlenecks.fpsDrops.length > 0
  ? analysis.bottlenecks.fpsDrops.map(drop =>
      `- ${new Date(drop.timestamp).toISOString()}: ${drop.minFps.toFixed(1)} fps for ${drop.duration.toFixed(0)}ms`
    ).join('\n')
  : 'No significant FPS drops detected'}

## Recommendations

${analysis.recommendations.map(rec =>
  `### ${rec.priority.toUpperCase()} Priority - ${rec.category}
${rec.description}
*Impact: ${rec.impact}*`
).join('\n\n')}

## Device Information

**Detected Capabilities:**
${Object.entries(analysis.deviceMetrics.capabilities).map(([key, value]) =>
  `- ${key}: ${value}`
).join('\n')}

**Limitations:**
${analysis.deviceMetrics.limitations.map(limitation => `- ${limitation}`).join('\n')}
`;

    const fileName = options.fileName || `performance-summary-${new Date().toISOString().slice(0, 19)}.md`;

    return {
      data: summary,
      fileName
    };
  }

  // ===== ANALYSIS METHODS =====

  /**
   * Generate detailed performance analysis
   */
  public generateDetailedAnalysis(
    rawData: RawPerformanceDataPoint[],
    aggregatedData: AggregatedPerformanceData[]
  ): PerformanceAnalysisReport {
    const fpsData = rawData.filter(d => d.type === 'fps').map(d => d.value);
    const memoryData = rawData.filter(d => d.type === 'memory').map(d => d.value);
    const operationData = rawData.filter(d => d.type === 'operation');

    // Calculate basic statistics
    const avgFps = fpsData.reduce((a, b) => a + b, 0) / fpsData.length || 0;
    const avgMemory = memoryData.reduce((a, b) => a + b, 0) / memoryData.length || 0;
    const avgOperations = operationData.length;

    // Detect trends
    const fpsDecline = this.detectFPSDecline(fpsData);
    const memoryGrowth = this.detectMemoryGrowth(memoryData);

    // Find bottlenecks
    const slowestOperations = this.findSlowestOperations(operationData);
    const fpsDrops = this.findFPSDrops(rawData);

    // Generate recommendations
    const recommendations = this.generateRecommendations(avgFps, avgMemory, fpsDecline, memoryGrowth);

    return {
      summary: {
        totalSamples: rawData.length,
        timeRange: {
          start: Math.min(...rawData.map(d => d.timestamp)),
          end: Math.max(...rawData.map(d => d.timestamp)),
          duration: Math.max(...rawData.map(d => d.timestamp)) - Math.min(...rawData.map(d => d.timestamp))
        },
        averagePerformance: { fps: avgFps, memory: avgMemory, operations: avgOperations },
        performanceGrade: this.calculatePerformanceGrade(avgFps, avgMemory),
        healthScore: this.calculateHealthScore(avgFps, avgMemory, fpsDecline.detected, memoryGrowth.detected)
      },
      trends: {
        fpsDecline,
        memoryGrowth,
        performanceDegradation: { events: fpsDrops.length, severity: fpsDrops.length > 5 ? 'high' : fpsDrops.length > 2 ? 'medium' : 'low' }
      },
      bottlenecks: {
        slowestOperations,
        memoryLeaks: [], // Would need more sophisticated detection
        fpsDrops
      },
      recommendations,
      deviceMetrics: {
        capabilities: this.detectDeviceCapabilities(),
        limitations: this.detectDeviceLimitations(),
        optimalSettings: this.generateOptimalSettings(avgFps, avgMemory)
      }
    };
  }

  /**
   * Generate visualization data for charts
   */
  public generateVisualizationData(
    rawData: RawPerformanceDataPoint[],
    aggregatedData: AggregatedPerformanceData[]
  ): PerformanceVisualizationData {
    // Timeline data
    const timeline = {
      timestamps: rawData.map(d => d.timestamp),
      fps: rawData.filter(d => d.type === 'fps').map(d => d.value),
      memory: rawData.filter(d => d.type === 'memory').map(d => d.value),
      operations: rawData.filter(d => d.type === 'operation').map(d => d.value)
    };

    // Distribution histograms
    const distributions = {
      fpsHistogram: this.createHistogram(timeline.fps, [0, 30, 45, 60, 90, 120]),
      memoryHistogram: this.createHistogram(timeline.memory, [0, 50, 100, 200, 500, 1000]),
      operationDurationHistogram: this.createHistogram(timeline.operations, [0, 5, 10, 20, 50, 100])
    };

    // Correlations
    const correlations = {
      fpsMemoryCorrelation: this.calculateCorrelation(timeline.fps, timeline.memory),
      operationPerformanceCorrelation: this.calculateCorrelation(timeline.operations, timeline.fps),
      qualityPerformanceCorrelation: 0.8 // Placeholder
    };

    return {
      timeline,
      distributions,
      correlations,
      heatmaps: {
        hourlyPerformance: [], // Would need time-based grouping
        operationFrequency: [] // Would need operation grouping
      }
    };
  }

  // ===== UTILITY METHODS =====

  /**
   * Filter data by time range
   */
  private filterDataByTimeRange(
    data: RawPerformanceDataPoint[],
    timeRange?: { start: number; end: number }
  ): RawPerformanceDataPoint[] {
    if (!timeRange) return data;

    return data.filter(point =>
      point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
    );
  }

  /**
   * Filter aggregated data by time range
   */
  private filterAggregatedDataByTimeRange(
    data: AggregatedPerformanceData[],
    timeRange?: { start: number; end: number }
  ): AggregatedPerformanceData[] {
    if (!timeRange) return data;

    return data.filter(window =>
      window.timeWindow.start >= timeRange.start && window.timeWindow.end <= timeRange.end
    );
  }

  /**
   * Generate quick analysis for metadata
   */
  private generateQuickAnalysis(
    rawData: RawPerformanceDataPoint[],
    aggregatedData: AggregatedPerformanceData[]
  ): any {
    const fpsData = rawData.filter(d => d.type === 'fps').map(d => d.value);
    const memoryData = rawData.filter(d => d.type === 'memory').map(d => d.value);

    return {
      averageFPS: fpsData.reduce((a, b) => a + b, 0) / fpsData.length || 0,
      averageMemory: memoryData.reduce((a, b) => a + b, 0) / memoryData.length || 0,
      sampleCount: rawData.length,
      aggregatedWindows: aggregatedData.length
    };
  }

  /**
   * Detect FPS decline trend
   */
  private detectFPSDecline(fpsData: number[]): { detected: boolean; severity: 'low' | 'medium' | 'high'; rate: number } {
    if (fpsData.length < 10) return { detected: false, severity: 'low', rate: 0 };

    const firstHalf = fpsData.slice(0, Math.floor(fpsData.length / 2));
    const secondHalf = fpsData.slice(Math.floor(fpsData.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const decline = firstAvg - secondAvg;
    const detected = decline > 1; // More than 1 FPS decline

    return {
      detected,
      severity: decline > 10 ? 'high' : decline > 5 ? 'medium' : 'low',
      rate: decline
    };
  }

  /**
   * Detect memory growth trend
   */
  private detectMemoryGrowth(memoryData: number[]): { detected: boolean; severity: 'low' | 'medium' | 'high'; rate: number } {
    if (memoryData.length < 10) return { detected: false, severity: 'low', rate: 0 };

    const firstHalf = memoryData.slice(0, Math.floor(memoryData.length / 2));
    const secondHalf = memoryData.slice(Math.floor(memoryData.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const growth = secondAvg - firstAvg;
    const detected = growth > 5; // More than 5MB growth

    return {
      detected,
      severity: growth > 50 ? 'high' : growth > 20 ? 'medium' : 'low',
      rate: growth
    };
  }

  /**
   * Find slowest operations
   */
  private findSlowestOperations(operationData: RawPerformanceDataPoint[]): Array<{ name: string; avgDuration: number; frequency: number }> {
    const operationStats = new Map<string, { total: number; count: number }>();

    for (const op of operationData) {
      const name = op.metadata.operationName || 'unknown';
      const current = operationStats.get(name) || { total: 0, count: 0 };
      operationStats.set(name, {
        total: current.total + op.value,
        count: current.count + 1
      });
    }

    return Array.from(operationStats.entries())
      .map(([name, stats]) => ({
        name,
        avgDuration: stats.total / stats.count,
        frequency: stats.count
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);
  }

  /**
   * Find FPS drops
   */
  private findFPSDrops(rawData: RawPerformanceDataPoint[]): Array<{ timestamp: number; minFps: number; duration: number }> {
    const fpsData = rawData.filter(d => d.type === 'fps');
    const drops: Array<{ timestamp: number; minFps: number; duration: number }> = [];

    for (let i = 0; i < fpsData.length - 1; i++) {
      if (fpsData[i].value < 30) { // Consider < 30 FPS as a drop
        const startTime = fpsData[i].timestamp;
        let minFps = fpsData[i].value;
        let j = i;

        // Find the end of the drop
        while (j < fpsData.length && fpsData[j].value < 45) {
          minFps = Math.min(minFps, fpsData[j].value);
          j++;
        }

        const duration = j < fpsData.length ? fpsData[j].timestamp - startTime : 0;

        drops.push({
          timestamp: startTime,
          minFps,
          duration
        });

        i = j; // Skip to end of drop
      }
    }

    return drops;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    avgFps: number,
    avgMemory: number,
    fpsDecline: { detected: boolean; severity: string },
    memoryGrowth: { detected: boolean; severity: string }
  ): Array<{ priority: 'high' | 'medium' | 'low'; category: 'performance' | 'memory' | 'optimization'; description: string; impact: 'high' | 'medium' | 'low' }> {
    const recommendations = [];

    if (avgFps < 30) {
      recommendations.push({
        priority: 'high' as const,
        category: 'performance' as const,
        description: 'Low average FPS detected. Consider reducing animation complexity or implementing quality degradation.',
        impact: 'high' as const
      });
    }

    if (avgMemory > 100) {
      recommendations.push({
        priority: 'high' as const,
        category: 'memory' as const,
        description: 'High memory usage detected. Implement memory cleanup and object pooling.',
        impact: 'high' as const
      });
    }

    if (fpsDecline.detected) {
      recommendations.push({
        priority: fpsDecline.severity === 'high' ? 'high' as const : 'medium' as const,
        category: 'performance' as const,
        description: 'FPS decline trend detected. Monitor for performance regressions and memory leaks.',
        impact: fpsDecline.severity === 'high' ? 'high' as const : 'medium' as const
      });
    }

    if (memoryGrowth.detected) {
      recommendations.push({
        priority: memoryGrowth.severity === 'high' ? 'high' as const : 'medium' as const,
        category: 'memory' as const,
        description: 'Memory growth trend detected. Check for memory leaks and implement garbage collection optimization.',
        impact: memoryGrowth.severity === 'high' ? 'high' as const : 'medium' as const
      });
    }

    return recommendations;
  }

  /**
   * Calculate performance grade
   */
  private calculatePerformanceGrade(avgFps: number, avgMemory: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    const fpsScore = avgFps >= 55 ? 40 : avgFps >= 45 ? 30 : avgFps >= 30 ? 20 : 10;
    const memoryScore = avgMemory <= 50 ? 30 : avgMemory <= 100 ? 20 : avgMemory <= 200 ? 10 : 5;
    const totalScore = fpsScore + memoryScore;

    if (totalScore >= 65) return 'A';
    if (totalScore >= 55) return 'B';
    if (totalScore >= 45) return 'C';
    if (totalScore >= 35) return 'D';
    return 'F';
  }

  /**
   * Calculate health score
   */
  private calculateHealthScore(avgFps: number, avgMemory: number, hasFpsDecline: boolean, hasMemoryGrowth: boolean): number {
    let score = 100;

    // FPS penalty
    if (avgFps < 60) score -= (60 - avgFps) * 2;

    // Memory penalty
    if (avgMemory > 50) score -= (avgMemory - 50) * 0.5;

    // Trend penalties
    if (hasFpsDecline) score -= 20;
    if (hasMemoryGrowth) score -= 15;

    return Math.max(0, Math.round(score));
  }

  /**
   * Detect device capabilities
   */
  private detectDeviceCapabilities(): Record<string, any> {
    return {
      hardwareAcceleration: !!document.createElement('canvas').getContext('webgl'),
      memoryInfo: !!(performance as any).memory,
      touchSupport: 'ontouchstart' in window,
      devicePixelRatio: window.devicePixelRatio || 1,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  /**
   * Detect device limitations
   */
  private detectDeviceLimitations(): string[] {
    const limitations = [];

    if (!document.createElement('canvas').getContext('webgl')) {
      limitations.push('No WebGL support detected');
    }

    if (!(performance as any).memory) {
      limitations.push('Memory monitoring not available');
    }

    if (window.innerWidth < 768) {
      limitations.push('Small viewport may limit performance');
    }

    return limitations;
  }

  /**
   * Generate optimal settings
   */
  private generateOptimalSettings(avgFps: number, avgMemory: number): Record<string, any> {
    return {
      qualityLevel: avgFps > 55 ? 'high' : avgFps > 45 ? 'medium' : 'low',
      animationComplexity: avgFps > 55 ? 'full' : avgFps > 45 ? 'reduced' : 'minimal',
      memoryManagement: avgMemory > 100 ? 'aggressive' : avgMemory > 50 ? 'normal' : 'relaxed'
    };
  }

  /**
   * Create histogram from data
   */
  private createHistogram(data: number[], buckets: number[]): Array<{ range: string; count: number }> {
    const histogram = [];

    for (let i = 0; i < buckets.length - 1; i++) {
      const min = buckets[i];
      const max = buckets[i + 1];
      const count = data.filter(value => value >= min && value < max).length;

      histogram.push({
        range: `${min}-${max}`,
        count
      });
    }

    return histogram;
  }

  /**
   * Calculate correlation between two data sets
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Check compression support
   */
  private checkCompressionSupport(): boolean {
    return typeof CompressionStream !== 'undefined';
  }

  /**
   * Compress data using compression streams
   */
  private async compressData(data: string, level: 'low' | 'high'): Promise<string> {
    if (!this.compressionSupported) return data;

    try {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(new TextEncoder().encode(data));
      writer.close();

      const chunks = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }

      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }

      return new TextDecoder().decode(compressed);
    } catch (error) {
      console.warn('[DataExport] Compression failed, returning uncompressed data:', error);
      return data;
    }
  }
}

// ===== SINGLETON INSTANCE =====

let exportManagerInstance: PerformanceDataExportManager | null = null;

/**
 * Get singleton export manager instance
 */
export function getDataExportManager(): PerformanceDataExportManager {
  if (!exportManagerInstance) {
    exportManagerInstance = new PerformanceDataExportManager();
  }
  return exportManagerInstance;
}

export default {
  PerformanceDataExportManager,
  getDataExportManager
};