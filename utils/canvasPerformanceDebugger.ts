/**
 * Canvas Performance Debugger
 *
 * Advanced debugging tools for canvas performance analysis.
 * Provides detailed performance profiling, bottleneck detection,
 * performance recommendations, and real-time monitoring dashboard.
 *
 * @fileoverview Task 8: Performance Optimization - Debugging Tools
 * @version 1.0.0
 * @since 2025-09-27
 */

import type { CanvasPosition, CanvasPerformanceMetrics } from '../types/canvas';
import type { QualityLevel } from './canvasQualityManager';

// Performance event types
type PerformanceEventType =
  | 'animation-start'
  | 'animation-end'
  | 'quality-change'
  | 'frame-drop'
  | 'memory-warning'
  | 'optimization-applied'
  | 'user-interaction';

// Performance event interface
interface PerformanceEvent {
  type: PerformanceEventType;
  timestamp: number;
  data: any;
  duration?: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

// Performance bottleneck analysis
interface PerformanceBottleneck {
  category: 'animation' | 'memory' | 'rendering' | 'computation';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  recommendation: string;
  frequency: number;
  averageImpact: number;
}

// Performance profile interface
interface PerformanceProfile {
  sessionId: string;
  startTime: number;
  endTime?: number;
  deviceInfo: {
    userAgent: string;
    screen: { width: number; height: number };
    memory?: number;
    cores?: number;
  };
  qualityChanges: Array<{
    timestamp: number;
    from: QualityLevel;
    to: QualityLevel;
    reason: string;
  }>;
  frameDrops: number;
  averageFPS: number;
  memoryPeak: number;
  bottlenecks: PerformanceBottleneck[];
  events: PerformanceEvent[];
}

/**
 * Canvas Performance Debugger
 *
 * Comprehensive performance analysis and debugging toolkit for canvas operations.
 * Provides real-time monitoring, bottleneck detection, and optimization recommendations.
 */
export class CanvasPerformanceDebugger {
  private profile: PerformanceProfile;
  private events: PerformanceEvent[] = [];
  private isRecording = false;
  private startTime = 0;
  private frameHistory: number[] = [];
  private memoryHistory: number[] = [];
  private lastFrameTime = 0;
  private debugOverlay: HTMLElement | null = null;
  private updateInterval: number | null = null;

  constructor() {
    this.profile = this.createNewProfile();
    this.initializeDeviceInfo();
  }

  /**
   * Start performance profiling
   */
  startProfiling(): void {
    if (this.isRecording) return;

    this.isRecording = true;
    this.startTime = performance.now();
    this.profile.startTime = this.startTime;
    this.events = [];
    this.frameHistory = [];
    this.memoryHistory = [];

    this.logEvent('animation-start', { message: 'Performance profiling started' }, 'low');

    // Start continuous monitoring
    this.startContinuousMonitoring();

    console.log('[CanvasPerformanceDebugger] Profiling started');
  }

  /**
   * Stop performance profiling
   */
  stopProfiling(): PerformanceProfile {
    if (!this.isRecording) return this.profile;

    this.isRecording = false;
    this.profile.endTime = performance.now();
    this.profile.events = [...this.events];

    // Analyze bottlenecks
    this.profile.bottlenecks = this.analyzeBottlenecks();

    // Calculate summary metrics
    this.calculateSummaryMetrics();

    // Stop continuous monitoring
    this.stopContinuousMonitoring();

    this.logEvent('animation-end', { message: 'Performance profiling stopped' }, 'low');

    console.log('[CanvasPerformanceDebugger] Profiling stopped', this.profile);
    return this.profile;
  }

  /**
   * Log performance event
   */
  logEvent(
    type: PerformanceEventType,
    data: any,
    impact: PerformanceEvent['impact'] = 'low',
    duration?: number
  ): void {
    const event: PerformanceEvent = {
      type,
      timestamp: performance.now() - this.startTime,
      data,
      impact,
      duration
    };

    this.events.push(event);

    // Log critical events immediately
    if (impact === 'critical') {
      console.warn('[CanvasPerformanceDebugger] Critical event:', event);
    }
  }

  /**
   * Track frame performance
   */
  trackFrame(frameTime: number): void {
    if (!this.isRecording) return;

    this.frameHistory.push(frameTime);
    this.lastFrameTime = frameTime;

    // Keep only recent frames (last 5 seconds at 60fps)
    if (this.frameHistory.length > 300) {
      this.frameHistory.shift();
    }

    // Detect frame drops
    if (frameTime > 33.33) { // Below 30fps
      this.logEvent('frame-drop', {
        frameTime,
        expectedTime: 16.67,
        dropSeverity: frameTime > 50 ? 'severe' : 'moderate'
      }, frameTime > 50 ? 'high' : 'medium');
    }
  }

  /**
   * Track memory usage
   */
  trackMemory(memoryMB: number): void {
    if (!this.isRecording) return;

    this.memoryHistory.push(memoryMB);

    // Keep only recent readings
    if (this.memoryHistory.length > 300) {
      this.memoryHistory.shift();
    }

    // Detect memory warnings
    if (memoryMB > 100) {
      this.logEvent('memory-warning', {
        currentMemory: memoryMB,
        threshold: 100,
        trend: this.getMemoryTrend()
      }, memoryMB > 150 ? 'high' : 'medium');
    }
  }

  /**
   * Track quality changes
   */
  trackQualityChange(from: QualityLevel, to: QualityLevel, reason: string): void {
    this.profile.qualityChanges.push({
      timestamp: performance.now() - this.startTime,
      from,
      to,
      reason
    });

    this.logEvent('quality-change', { from, to, reason }, 'medium');
  }

  /**
   * Track canvas operations
   */
  trackOperation(operation: string, duration: number, data?: any): void {
    const impact = duration > 16.67 ? 'high' : duration > 10 ? 'medium' : 'low';

    this.logEvent('user-interaction', {
      operation,
      duration,
      data,
      efficiency: 16.67 / duration
    }, impact, duration);
  }

  /**
   * Show debug overlay
   */
  showDebugOverlay(): void {
    if (this.debugOverlay) return;

    this.debugOverlay = document.createElement('div');
    this.debugOverlay.id = 'canvas-performance-debug';
    this.debugOverlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      font-family: monospace;
      font-size: 11px;
      border-radius: 5px;
      z-index: 10000;
      max-height: 80vh;
      overflow-y: auto;
    `;

    document.body.appendChild(this.debugOverlay);

    // Start real-time updates
    this.updateInterval = window.setInterval(() => {
      this.updateDebugOverlay();
    }, 100);
  }

  /**
   * Hide debug overlay
   */
  hideDebugOverlay(): void {
    if (this.debugOverlay) {
      document.body.removeChild(this.debugOverlay);
      this.debugOverlay = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const bottlenecks = this.analyzeBottlenecks();

    bottlenecks.forEach(bottleneck => {
      if (bottleneck.severity === 'major' || bottleneck.severity === 'critical') {
        recommendations.push(bottleneck.recommendation);
      }
    });

    // General recommendations
    const avgFrameTime = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
    if (avgFrameTime > 20) {
      recommendations.push('Consider reducing animation complexity or duration');
    }

    const memoryTrend = this.getMemoryTrend();
    if (memoryTrend === 'increasing') {
      recommendations.push('Monitor for memory leaks in animation cleanup');
    }

    const frameDropRate = this.events.filter(e => e.type === 'frame-drop').length / this.frameHistory.length;
    if (frameDropRate > 0.05) {
      recommendations.push('High frame drop rate detected - optimize render operations');
    }

    return recommendations;
  }

  /**
   * Export performance data
   */
  exportData(): string {
    const exportData = {
      profile: this.profile,
      frameHistory: this.frameHistory,
      memoryHistory: this.memoryHistory,
      recommendations: this.getRecommendations(),
      summary: this.generateSummary()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const summary = this.generateSummary();
    const recommendations = this.getRecommendations();
    const bottlenecks = this.analyzeBottlenecks();

    let report = `# Canvas Performance Report\n\n`;
    report += `## Summary\n`;
    report += `- Session Duration: ${summary.sessionDuration.toFixed(2)}s\n`;
    report += `- Average FPS: ${summary.averageFPS.toFixed(1)}\n`;
    report += `- Frame Drops: ${summary.frameDrops}\n`;
    report += `- Memory Peak: ${summary.memoryPeak.toFixed(1)}MB\n`;
    report += `- Quality Changes: ${summary.qualityChanges}\n\n`;

    if (bottlenecks.length > 0) {
      report += `## Bottlenecks\n`;
      bottlenecks.forEach(bottleneck => {
        report += `- **${bottleneck.category}** (${bottleneck.severity}): ${bottleneck.description}\n`;
      });
      report += `\n`;
    }

    if (recommendations.length > 0) {
      report += `## Recommendations\n`;
      recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
      report += `\n`;
    }

    report += `## Timeline\n`;
    this.events.slice(-10).forEach(event => {
      report += `- ${event.timestamp.toFixed(0)}ms: ${event.type} (${event.impact})\n`;
    });

    return report;
  }

  // Private methods

  private createNewProfile(): PerformanceProfile {
    return {
      sessionId: this.generateSessionId(),
      startTime: 0,
      deviceInfo: {
        userAgent: navigator.userAgent,
        screen: { width: screen.width, height: screen.height }
      },
      qualityChanges: [],
      frameDrops: 0,
      averageFPS: 0,
      memoryPeak: 0,
      bottlenecks: [],
      events: []
    };
  }

  private initializeDeviceInfo(): void {
    // Add device memory if available
    if ('deviceMemory' in navigator) {
      this.profile.deviceInfo.memory = (navigator as any).deviceMemory;
    }

    // Add CPU cores
    if ('hardwareConcurrency' in navigator) {
      this.profile.deviceInfo.cores = navigator.hardwareConcurrency;
    }
  }

  private startContinuousMonitoring(): void {
    // Monitor frame performance
    const monitorFrame = () => {
      if (!this.isRecording) return;

      const now = performance.now();
      const frameTime = now - this.lastFrameTime || 16.67;
      this.trackFrame(frameTime);

      // Monitor memory if available
      if ('memory' in performance) {
        const memoryMB = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
        this.trackMemory(memoryMB);
      }

      requestAnimationFrame(monitorFrame);
    };

    requestAnimationFrame(monitorFrame);
  }

  private stopContinuousMonitoring(): void {
    // Monitoring is stopped by the isRecording flag
  }

  private analyzeBottlenecks(): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];

    // Analyze frame drops
    const frameDropEvents = this.events.filter(e => e.type === 'frame-drop');
    if (frameDropEvents.length > 5) {
      bottlenecks.push({
        category: 'rendering',
        severity: frameDropEvents.length > 20 ? 'critical' : 'major',
        description: `High frame drop frequency (${frameDropEvents.length} drops)`,
        recommendation: 'Optimize animation complexity or reduce concurrent operations',
        frequency: frameDropEvents.length,
        averageImpact: frameDropEvents.reduce((sum, e) => sum + e.data.frameTime, 0) / frameDropEvents.length
      });
    }

    // Analyze memory usage
    const memoryWarnings = this.events.filter(e => e.type === 'memory-warning');
    if (memoryWarnings.length > 0) {
      bottlenecks.push({
        category: 'memory',
        severity: memoryWarnings.some(e => e.data.currentMemory > 150) ? 'major' : 'moderate',
        description: 'High memory usage detected',
        recommendation: 'Implement proper cleanup and memory optimization',
        frequency: memoryWarnings.length,
        averageImpact: memoryWarnings.reduce((sum, e) => sum + e.data.currentMemory, 0) / memoryWarnings.length
      });
    }

    // Analyze frequent quality changes
    if (this.profile.qualityChanges.length > 10) {
      bottlenecks.push({
        category: 'rendering',
        severity: 'moderate',
        description: 'Frequent quality degradation',
        recommendation: 'Investigate performance bottlenecks causing quality instability',
        frequency: this.profile.qualityChanges.length,
        averageImpact: 0
      });
    }

    return bottlenecks;
  }

  private calculateSummaryMetrics(): void {
    // Calculate average FPS
    if (this.frameHistory.length > 0) {
      const avgFrameTime = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
      this.profile.averageFPS = 1000 / avgFrameTime;
    }

    // Count frame drops
    this.profile.frameDrops = this.events.filter(e => e.type === 'frame-drop').length;

    // Find memory peak
    this.profile.memoryPeak = Math.max(...this.memoryHistory, 0);
  }

  private getMemoryTrend(): 'stable' | 'increasing' | 'decreasing' {
    if (this.memoryHistory.length < 10) return 'stable';

    const recent = this.memoryHistory.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const change = last - first;

    if (Math.abs(change) < 1) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  private updateDebugOverlay(): void {
    if (!this.debugOverlay || !this.isRecording) return;

    const currentFPS = this.frameHistory.length > 0 ?
      1000 / (this.frameHistory.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, this.frameHistory.length)) : 0;

    const currentMemory = this.memoryHistory.length > 0 ?
      this.memoryHistory[this.memoryHistory.length - 1] : 0;

    const recentEvents = this.events.slice(-5);

    this.debugOverlay.innerHTML = `
      <div style="color: #ff6b35; font-weight: bold; margin-bottom: 10px;">PERFORMANCE DEBUGGER</div>

      <div style="margin-bottom: 10px;">
        <div>Current FPS: <span style="color: ${currentFPS < 45 ? '#ff4444' : currentFPS < 55 ? '#ffaa00' : '#44ff44'}">${currentFPS.toFixed(1)}</span></div>
        <div>Memory: ${currentMemory.toFixed(1)}MB</div>
        <div>Frame Drops: ${this.events.filter(e => e.type === 'frame-drop').length}</div>
        <div>Events: ${this.events.length}</div>
      </div>

      <div style="margin-bottom: 10px;">
        <div style="color: #ff6b35; font-weight: bold;">Recent Events:</div>
        ${recentEvents.map(event =>
          `<div style="font-size: 10px; color: ${
            event.impact === 'critical' ? '#ff4444' :
            event.impact === 'high' ? '#ffaa00' :
            event.impact === 'medium' ? '#88aaff' : '#aaaaaa'
          }">
            ${event.type}: ${event.data.message || JSON.stringify(event.data).substring(0, 30)}
          </div>`
        ).join('')}
      </div>

      <div style="font-size: 10px; color: #888;">
        Session: ${((performance.now() - this.startTime) / 1000).toFixed(1)}s
      </div>
    `;
  }

  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSummary() {
    return {
      sessionDuration: this.profile.endTime ? (this.profile.endTime - this.profile.startTime) / 1000 : 0,
      averageFPS: this.profile.averageFPS,
      frameDrops: this.profile.frameDrops,
      memoryPeak: this.profile.memoryPeak,
      qualityChanges: this.profile.qualityChanges.length
    };
  }
}

// Global debugger instance
let globalDebugger: CanvasPerformanceDebugger | null = null;

/**
 * Get or create global performance debugger
 */
export function getPerformanceDebugger(): CanvasPerformanceDebugger {
  if (!globalDebugger) {
    globalDebugger = new CanvasPerformanceDebugger();
  }
  return globalDebugger;
}

/**
 * Convenient performance measurement decorator
 */
export function performanceProfile<T extends (...args: any[]) => any>(target: T): T {
  return ((...args: any[]) => {
    const performanceDebugger = getPerformanceDebugger();
    const start = performance.now();

    const result = target(...args);

    const duration = performance.now() - start;
    performanceDebugger.trackOperation(target.name, duration, { args });

    return result;
  }) as T;
}

/**
 * Console commands for debugging
 */
if (typeof window !== 'undefined') {
  // Make debugging functions globally available in development
  (window as any).canvasPerformanceDebugger = {
    start: () => getPerformanceDebugger().startProfiling(),
    stop: () => getPerformanceDebugger().stopProfiling(),
    show: () => getPerformanceDebugger().showDebugOverlay(),
    hide: () => getPerformanceDebugger().hideDebugOverlay(),
    report: () => console.log(getPerformanceDebugger().generateReport()),
    export: () => console.log(getPerformanceDebugger().exportData()),
    recommendations: () => console.log(getPerformanceDebugger().getRecommendations())
  };
}

export default CanvasPerformanceDebugger;