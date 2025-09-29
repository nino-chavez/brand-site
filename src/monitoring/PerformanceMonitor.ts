/**
 * Performance Monitoring and Alerting System for LightboxCanvas
 *
 * This system monitors 60fps compliance, canvas performance, and spatial
 * navigation responsiveness with real-time alerting capabilities.
 */

interface PerformanceMetrics {
  frameRate: number;
  frameTimes: number[];
  memoryUsage: number;
  canvasRenderTime: number;
  inputLatency: number;
  animationSmoothness: number;
  cpuUsage: number;
  timestamp: number;
}

interface PerformanceThresholds {
  criticalFPS: number;
  warningFPS: number;
  maxMemoryMB: number;
  maxRenderTimeMS: number;
  maxInputLatencyMS: number;
  minSmoothness: number;
}

interface AlertConfig {
  enabled: boolean;
  webhookUrl?: string;
  emailEndpoint?: string;
  slackChannel?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private currentMetrics: Partial<PerformanceMetrics> = {};
  private isMonitoring: boolean = false;
  private monitoringInterval: number | null = null;
  private frameTimeBuffer: number[] = [];
  private lastFrameTime: number = 0;
  private animationFrameId: number | null = null;

  // Performance thresholds
  private thresholds: PerformanceThresholds = {
    criticalFPS: 45,      // Below this triggers critical alerts
    warningFPS: 55,       // Below this triggers warning alerts
    maxMemoryMB: 100,     // Memory usage threshold
    maxRenderTimeMS: 16.67, // Single frame render time (60fps)
    maxInputLatencyMS: 100, // Maximum acceptable input delay
    minSmoothness: 0.85   // Minimum animation smoothness score
  };

  // Alert configuration
  private alertConfig: Record<string, AlertConfig> = {
    fps_critical: {
      enabled: true,
      severity: 'critical',
      webhookUrl: process.env.PERFORMANCE_WEBHOOK_URL
    },
    fps_warning: {
      enabled: true,
      severity: 'medium',
      webhookUrl: process.env.PERFORMANCE_WEBHOOK_URL
    },
    memory_high: {
      enabled: true,
      severity: 'high',
      webhookUrl: process.env.PERFORMANCE_WEBHOOK_URL
    },
    render_slow: {
      enabled: true,
      severity: 'medium',
      webhookUrl: process.env.PERFORMANCE_WEBHOOK_URL
    },
    input_lag: {
      enabled: true,
      severity: 'high',
      webhookUrl: process.env.PERFORMANCE_WEBHOOK_URL
    }
  };

  private observers: Map<string, PerformanceObserver> = new Map();
  private alertHistory: Map<string, number> = new Map();
  private readonly ALERT_COOLDOWN = 300000; // 5 minutes

  constructor() {
    this.setupPerformanceObservers();
    this.bindToCanvasEvents();
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastFrameTime = performance.now();

    // Start frame rate monitoring
    this.startFrameRateMonitoring();

    // Start periodic metrics collection
    this.monitoringInterval = window.setInterval(() => {
      this.collectMetrics();
      this.evaluatePerformance();
    }, 1000); // Collect metrics every second

    console.log('🔍 Performance monitoring started');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());

    console.log('⏹️ Performance monitoring stopped');
  }

  private startFrameRateMonitoring(): void {
    const measureFrame = (currentTime: number) => {
      if (this.lastFrameTime > 0) {
        const frameTime = currentTime - this.lastFrameTime;
        this.frameTimeBuffer.push(frameTime);

        // Keep only recent frames (last 60 frames for 1-second window at 60fps)
        if (this.frameTimeBuffer.length > 60) {
          this.frameTimeBuffer.shift();
        }
      }

      this.lastFrameTime = currentTime;

      if (this.isMonitoring) {
        this.animationFrameId = requestAnimationFrame(measureFrame);
      }
    };

    this.animationFrameId = requestAnimationFrame(measureFrame);
  }

  private setupPerformanceObservers(): void {
    // Long Task Observer (for detecting frame drops)
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.handleLongTask(entry);
            }
          });
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Layout Shift Observer
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.handleLayoutShift(entry as any);
          });
        });

        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('layout-shift', layoutShiftObserver);
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }

      // First Input Delay Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.handleFirstInputDelay(entry as any);
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('first-input', fidObserver);
      } catch (e) {
        console.warn('First input delay observer not supported');
      }
    }
  }

  private bindToCanvasEvents(): void {
    // Monitor canvas rendering performance
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    let renderStartTime: number;

    window.requestAnimationFrame = function(callback: FrameRequestCallback): number {
      return originalRequestAnimationFrame.call(this, function(time: number) {
        renderStartTime = performance.now();
        const result = callback(time);
        const renderTime = performance.now() - renderStartTime;

        // Update render time metrics
        if (window.performanceMonitor) {
          window.performanceMonitor.updateRenderTime(renderTime);
        }

        return result;
      });
    };

    // Monitor input events for latency measurement
    ['mousedown', 'touchstart', 'keydown'].forEach(eventType => {
      document.addEventListener(eventType, this.measureInputLatency.bind(this), {
        passive: true,
        capture: true
      });
    });
  }

  private measureInputLatency(event: Event): void {
    const inputTime = performance.now();

    // Schedule measurement after next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const responseTime = performance.now() - inputTime;
        this.currentMetrics.inputLatency = responseTime;

        if (responseTime > this.thresholds.maxInputLatencyMS) {
          this.triggerAlert('input_lag', {
            latency: responseTime,
            threshold: this.thresholds.maxInputLatencyMS,
            eventType: event.type
          });
        }
      });
    });
  }

  updateRenderTime(renderTime: number): void {
    this.currentMetrics.canvasRenderTime = renderTime;

    if (renderTime > this.thresholds.maxRenderTimeMS) {
      this.triggerAlert('render_slow', {
        renderTime,
        threshold: this.thresholds.maxRenderTimeMS,
        targetFPS: 60
      });
    }
  }

  private collectMetrics(): void {
    const currentTime = performance.now();

    // Calculate frame rate
    const frameRate = this.calculateFrameRate();

    // Get memory usage
    const memoryUsage = this.getMemoryUsage();

    // Calculate animation smoothness
    const animationSmoothness = this.calculateAnimationSmoothness();

    // Get CPU usage estimate
    const cpuUsage = this.estimateCPUUsage();

    const metrics: PerformanceMetrics = {
      frameRate,
      frameTimes: [...this.frameTimeBuffer],
      memoryUsage,
      canvasRenderTime: this.currentMetrics.canvasRenderTime || 0,
      inputLatency: this.currentMetrics.inputLatency || 0,
      animationSmoothness,
      cpuUsage,
      timestamp: currentTime
    };

    this.metrics.push(metrics);

    // Keep only recent metrics (last 5 minutes)
    const fiveMinutesAgo = currentTime - 300000;
    this.metrics = this.metrics.filter(m => m.timestamp > fiveMinutesAgo);

    // Reset current metrics
    this.currentMetrics = {};
  }

  private calculateFrameRate(): number {
    if (this.frameTimeBuffer.length < 10) return 0;

    const averageFrameTime = this.frameTimeBuffer
      .slice(-30) // Use last 30 frames
      .reduce((sum, time) => sum + time, 0) / Math.min(30, this.frameTimeBuffer.length);

    return 1000 / averageFrameTime;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  private calculateAnimationSmoothness(): number {
    if (this.frameTimeBuffer.length < 10) return 1;

    const recentFrames = this.frameTimeBuffer.slice(-30);
    const targetFrameTime = 16.67; // 60fps
    const tolerance = 2; // 2ms tolerance

    const smoothFrames = recentFrames.filter(frameTime =>
      Math.abs(frameTime - targetFrameTime) <= tolerance
    );

    return smoothFrames.length / recentFrames.length;
  }

  private estimateCPUUsage(): number {
    // Simplified CPU usage estimation based on frame consistency
    if (this.frameTimeBuffer.length < 10) return 0;

    const recentFrames = this.frameTimeBuffer.slice(-30);
    const averageFrameTime = recentFrames.reduce((sum, time) => sum + time, 0) / recentFrames.length;
    const variance = recentFrames.reduce((sum, time) =>
      sum + Math.pow(time - averageFrameTime, 2), 0) / recentFrames.length;

    // Higher variance indicates more CPU stress
    return Math.min(variance / 100, 1);
  }

  private evaluatePerformance(): void {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) return;

    // Check FPS thresholds
    if (latestMetrics.frameRate < this.thresholds.criticalFPS) {
      this.triggerAlert('fps_critical', {
        currentFPS: latestMetrics.frameRate,
        threshold: this.thresholds.criticalFPS,
        severity: 'critical'
      });
    } else if (latestMetrics.frameRate < this.thresholds.warningFPS) {
      this.triggerAlert('fps_warning', {
        currentFPS: latestMetrics.frameRate,
        threshold: this.thresholds.warningFPS,
        severity: 'warning'
      });
    }

    // Check memory usage
    if (latestMetrics.memoryUsage > this.thresholds.maxMemoryMB) {
      this.triggerAlert('memory_high', {
        currentMemory: latestMetrics.memoryUsage,
        threshold: this.thresholds.maxMemoryMB,
        severity: 'high'
      });
    }

    // Check animation smoothness
    if (latestMetrics.animationSmoothness < this.thresholds.minSmoothness) {
      this.triggerAlert('animation_choppy', {
        smoothness: latestMetrics.animationSmoothness,
        threshold: this.thresholds.minSmoothness,
        severity: 'medium'
      });
    }
  }

  private handleLongTask(entry: PerformanceEntry): void {
    console.warn(`🐌 Long task detected: ${entry.duration.toFixed(2)}ms`, entry);

    this.triggerAlert('long_task', {
      duration: entry.duration,
      startTime: entry.startTime,
      severity: 'medium'
    });
  }

  private handleLayoutShift(entry: any): void {
    if (entry.value > 0.1) { // Significant layout shift
      console.warn(`📏 Layout shift detected: ${entry.value.toFixed(3)}`, entry);

      this.triggerAlert('layout_shift', {
        value: entry.value,
        threshold: 0.1,
        severity: 'low'
      });
    }
  }

  private handleFirstInputDelay(entry: any): void {
    if (entry.processingStart - entry.startTime > 100) {
      console.warn(`⌨️ High first input delay: ${(entry.processingStart - entry.startTime).toFixed(2)}ms`);

      this.triggerAlert('first_input_delay', {
        delay: entry.processingStart - entry.startTime,
        threshold: 100,
        severity: 'medium'
      });
    }
  }

  private async triggerAlert(alertType: string, data: any): Promise<void> {
    const config = this.alertConfig[alertType];
    if (!config || !config.enabled) return;

    // Check cooldown period
    const lastAlert = this.alertHistory.get(alertType);
    const now = Date.now();

    if (lastAlert && (now - lastAlert) < this.ALERT_COOLDOWN) {
      return; // Still in cooldown period
    }

    this.alertHistory.set(alertType, now);

    const alert = {
      type: alertType,
      severity: config.severity,
      timestamp: new Date().toISOString(),
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    console.warn(`🚨 Performance alert triggered:`, alert);

    // Send to configured endpoints
    if (config.webhookUrl) {
      this.sendWebhookAlert(config.webhookUrl, alert);
    }

    if (config.emailEndpoint) {
      this.sendEmailAlert(config.emailEndpoint, alert);
    }

    if (config.slackChannel) {
      this.sendSlackAlert(config.slackChannel, alert);
    }

    // Store alert locally for dashboard
    this.storeAlertLocally(alert);
  }

  private async sendWebhookAlert(webhookUrl: string, alert: any): Promise<void> {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...alert,
          service: 'lightbox-canvas',
          environment: process.env.NODE_ENV || 'development'
        })
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  private async sendEmailAlert(emailEndpoint: string, alert: any): Promise<void> {
    try {
      await fetch(emailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: process.env.ALERT_EMAIL_RECIPIENTS,
          subject: `LightboxCanvas Performance Alert: ${alert.type}`,
          body: this.formatAlertEmail(alert)
        })
      });
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  private formatAlertEmail(alert: any): string {
    return `
Performance Alert Triggered

Alert Type: ${alert.type}
Severity: ${alert.severity}
Timestamp: ${alert.timestamp}

Details:
${JSON.stringify(alert.data, null, 2)}

Environment Information:
- URL: ${alert.url}
- User Agent: ${alert.userAgent}
- Session ID: ${alert.sessionId}

This alert was generated by the LightboxCanvas performance monitoring system.
    `.trim();
  }

  private storeAlertLocally(alert: any): void {
    try {
      const alerts = JSON.parse(localStorage.getItem('performance_alerts') || '[]');
      alerts.push(alert);

      // Keep only last 100 alerts
      if (alerts.length > 100) {
        alerts.splice(0, alerts.length - 100);
      }

      localStorage.setItem('performance_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to store alert locally:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('performance_session_id', sessionId);
    }
    return sessionId;
  }

  // Public API for getting metrics
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getAverageMetrics(timeWindowMs: number = 60000): Partial<PerformanceMetrics> {
    const now = performance.now();
    const relevantMetrics = this.metrics.filter(m =>
      now - m.timestamp <= timeWindowMs
    );

    if (relevantMetrics.length === 0) return {};

    const sum = relevantMetrics.reduce((acc, metrics) => ({
      frameRate: acc.frameRate + metrics.frameRate,
      memoryUsage: acc.memoryUsage + metrics.memoryUsage,
      canvasRenderTime: acc.canvasRenderTime + metrics.canvasRenderTime,
      inputLatency: acc.inputLatency + metrics.inputLatency,
      animationSmoothness: acc.animationSmoothness + metrics.animationSmoothness,
      cpuUsage: acc.cpuUsage + metrics.cpuUsage
    }), {
      frameRate: 0,
      memoryUsage: 0,
      canvasRenderTime: 0,
      inputLatency: 0,
      animationSmoothness: 0,
      cpuUsage: 0
    });

    const count = relevantMetrics.length;
    return {
      frameRate: sum.frameRate / count,
      memoryUsage: sum.memoryUsage / count,
      canvasRenderTime: sum.canvasRenderTime / count,
      inputLatency: sum.inputLatency / count,
      animationSmoothness: sum.animationSmoothness / count,
      cpuUsage: sum.cpuUsage / count
    };
  }

  getPerformanceReport(): object {
    const currentMetrics = this.getCurrentMetrics();
    const averageMetrics = this.getAverageMetrics();
    const alerts = JSON.parse(localStorage.getItem('performance_alerts') || '[]');

    return {
      current: currentMetrics,
      average: averageMetrics,
      thresholds: this.thresholds,
      recentAlerts: alerts.slice(-10),
      monitoringStatus: {
        isActive: this.isMonitoring,
        startTime: this.lastFrameTime,
        metricsCollected: this.metrics.length
      }
    };
  }

  // Configuration methods
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  updateAlertConfig(alertType: string, config: Partial<AlertConfig>): void {
    if (this.alertConfig[alertType]) {
      this.alertConfig[alertType] = { ...this.alertConfig[alertType], ...config };
    }
  }
}

// Export for global access
declare global {
  interface Window {
    performanceMonitor: PerformanceMonitor;
  }
}

export default PerformanceMonitor;