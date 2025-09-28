/**
 * Error Monitoring and Recovery System for LightboxCanvas
 *
 * This system provides comprehensive error monitoring, automatic recovery,
 * and user-friendly error handling with photography metaphor integration.
 */

interface ErrorContext {
  component: string;
  action: string;
  userAgent: string;
  url: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  canvasState?: any;
  photographyContext?: any;
}

interface ErrorMetrics {
  errorCount: number;
  errorRate: number;
  meanTimeToRecovery: number;
  successfulRecoveries: number;
  userImpact: 'low' | 'medium' | 'high' | 'critical';
  errorCategories: Record<string, number>;
}

interface RecoveryStrategy {
  name: string;
  description: string;
  steps: (() => Promise<boolean>)[];
  fallbackMessage: string;
  photographyMetaphor: string;
  userFriendlyExplanation: string;
}

interface ErrorAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context: ErrorContext;
  recoveryAttempted: boolean;
  recoverySuccessful?: boolean;
  userNotified: boolean;
}

class ErrorMonitor {
  private errors: Error[] = [];
  private errorMetrics: ErrorMetrics = {
    errorCount: 0,
    errorRate: 0,
    meanTimeToRecovery: 0,
    successfulRecoveries: 0,
    userImpact: 'low',
    errorCategories: {}
  };

  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private isMonitoring: boolean = false;
  private errorHandlers: Map<string, (error: Error, context: ErrorContext) => Promise<boolean>> = new Map();
  private userNotificationQueue: ErrorAlert[] = [];

  // External service integrations
  private sentryDsn?: string;
  private bugsnagApiKey?: string;
  private customWebhookUrl?: string;

  constructor() {
    this.setupGlobalErrorHandlers();
    this.setupRecoveryStrategies();
    this.setupServiceIntegrations();
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.bindErrorHandlers();

    console.log('🔍 Error monitoring started');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.unbindErrorHandlers();

    console.log('⏹️ Error monitoring stopped');
  }

  private setupGlobalErrorHandlers(): void {
    // Global JavaScript error handler
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        component: 'global',
        action: 'javascript_error',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
        sessionId: this.getSessionId()
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        component: 'global',
        action: 'promise_rejection',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
        sessionId: this.getSessionId()
      });
    });

    // Canvas-specific error monitoring
    this.setupCanvasErrorHandling();

    // Photography metaphor error monitoring
    this.setupPhotographyErrorHandling();
  }

  private setupCanvasErrorHandling(): void {
    // Monitor Canvas context loss
    document.addEventListener('webglcontextlost', (event) => {
      this.handleCanvasError('webgl_context_lost', event);
    });

    document.addEventListener('webglcontextrestored', (event) => {
      console.log('📷 Canvas context restored - resuming rendering');
    });

    // Monitor requestAnimationFrame failures
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      try {
        return originalRAF.call(window, callback);
      } catch (error) {
        this.handleError(error as Error, {
          component: 'canvas',
          action: 'animation_frame_error',
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now(),
          sessionId: this.getSessionId()
        });
        throw error;
      }
    };
  }

  private setupPhotographyErrorHandling(): void {
    // Monitor spatial navigation errors
    this.errorHandlers.set('spatial_navigation', async (error, context) => {
      console.warn('📷 Spatial navigation error:', error.message);
      return this.recoverSpatialNavigation();
    });

    // Monitor camera movement errors
    this.errorHandlers.set('camera_movement', async (error, context) => {
      console.warn('📷 Camera movement error:', error.message);
      return this.recoverCameraMovement();
    });

    // Monitor focus system errors
    this.errorHandlers.set('focus_system', async (error, context) => {
      console.warn('📷 Focus system error:', error.message);
      return this.recoverFocusSystem();
    });

    // Monitor visual effects errors
    this.errorHandlers.set('visual_effects', async (error, context) => {
      console.warn('📷 Visual effects error:', error.message);
      return this.recoverVisualEffects();
    });
  }

  private setupRecoveryStrategies(): void {
    // Canvas recovery strategy
    this.recoveryStrategies.set('canvas_recovery', {
      name: 'Canvas Recovery',
      description: 'Restore canvas rendering capabilities',
      photographyMetaphor: 'Replacing camera sensor',
      userFriendlyExplanation: 'Restoring the camera view - this may take a moment',
      fallbackMessage: 'Camera temporarily unavailable - using standard view',
      steps: [
        () => this.reinitializeCanvas(),
        () => this.restoreCanvasState(),
        () => this.validateCanvasRendering()
      ]
    });

    // Spatial navigation recovery
    this.recoveryStrategies.set('spatial_recovery', {
      name: 'Spatial Navigation Recovery',
      description: 'Restore spatial navigation system',
      photographyMetaphor: 'Recalibrating camera movement',
      userFriendlyExplanation: 'Recalibrating camera controls - navigation will resume shortly',
      fallbackMessage: 'Using simplified navigation controls',
      steps: [
        () => this.resetSpatialNavigation(),
        () => this.recalibratePositioning(),
        () => this.validateNavigation()
      ]
    });

    // Photography metaphor recovery
    this.recoveryStrategies.set('metaphor_recovery', {
      name: 'Photography Metaphor Recovery',
      description: 'Restore photography-themed interface',
      photographyMetaphor: 'Switching to manual camera mode',
      userFriendlyExplanation: 'Switching to manual camera controls',
      fallbackMessage: 'Using standard interface controls',
      steps: [
        () => this.validatePhotographyTerminology(),
        () => this.restorePhotographyInterface(),
        () => this.verifyMetaphorConsistency()
      ]
    });

    // Performance recovery strategy
    this.recoveryStrategies.set('performance_recovery', {
      name: 'Performance Recovery',
      description: 'Optimize performance for better frame rates',
      photographyMetaphor: 'Adjusting camera settings for better performance',
      userFriendlyExplanation: 'Optimizing camera settings for smoother operation',
      fallbackMessage: 'Reduced quality mode for better performance',
      steps: [
        () => this.reduceVisualQuality(),
        () => this.optimizeRendering(),
        () => this.validatePerformance()
      ]
    });
  }

  private setupServiceIntegrations(): void {
    // Sentry integration
    this.sentryDsn = process.env.SENTRY_DSN;
    if (this.sentryDsn && typeof window.Sentry !== 'undefined') {
      window.Sentry.init({
        dsn: this.sentryDsn,
        beforeSend: (event) => this.enrichSentryEvent(event)
      });
    }

    // Bugsnag integration
    this.bugsnagApiKey = process.env.BUGSNAG_API_KEY;
    if (this.bugsnagApiKey && typeof window.Bugsnag !== 'undefined') {
      window.Bugsnag.start({
        apiKey: this.bugsnagApiKey,
        beforeSend: (event) => this.enrichBugsnagEvent(event)
      });
    }

    // Custom webhook
    this.customWebhookUrl = process.env.ERROR_WEBHOOK_URL;
  }

  async handleError(error: Error, context: ErrorContext): Promise<void> {
    // Increment error metrics
    this.errorMetrics.errorCount++;
    this.updateErrorMetrics(error, context);

    // Log error with context
    console.error('🚨 Error detected:', {
      error: error.message,
      stack: error.stack,
      context
    });

    // Store error for analysis
    this.errors.push(error);

    // Attempt recovery
    const recoveryAttempted = await this.attemptRecovery(error, context);

    // Create error alert
    const alert: ErrorAlert = {
      type: this.categorizeError(error),
      severity: this.determineSeverity(error, context),
      message: error.message,
      context,
      recoveryAttempted,
      userNotified: false
    };

    // Send to external services
    await this.reportToExternalServices(error, context, alert);

    // Notify user if necessary
    if (alert.severity === 'high' || alert.severity === 'critical') {
      await this.notifyUser(alert);
    }

    // Trigger monitoring alerts
    await this.triggerMonitoringAlert(alert);
  }

  private async attemptRecovery(error: Error, context: ErrorContext): Promise<boolean> {
    const errorType = this.categorizeError(error);
    const handler = this.errorHandlers.get(errorType);

    if (handler) {
      try {
        const recovered = await handler(error, context);
        if (recovered) {
          this.errorMetrics.successfulRecoveries++;
          console.log(`✅ Successfully recovered from ${errorType} error`);
        }
        return recovered;
      } catch (recoveryError) {
        console.error('❌ Recovery attempt failed:', recoveryError);
        return false;
      }
    }

    // Try generic recovery strategies
    return this.attemptGenericRecovery(errorType);
  }

  private async attemptGenericRecovery(errorType: string): Promise<boolean> {
    // Map error types to recovery strategies
    const strategyMap: Record<string, string> = {
      'canvas_error': 'canvas_recovery',
      'spatial_navigation': 'spatial_recovery',
      'photography_metaphor': 'metaphor_recovery',
      'performance_issue': 'performance_recovery'
    };

    const strategyName = strategyMap[errorType];
    if (!strategyName) return false;

    const strategy = this.recoveryStrategies.get(strategyName);
    if (!strategy) return false;

    console.log(`🔧 Attempting recovery: ${strategy.photographyMetaphor}`);

    // Notify user about recovery attempt
    this.showRecoveryMessage(strategy);

    try {
      // Execute recovery steps
      for (const step of strategy.steps) {
        const success = await step();
        if (!success) {
          throw new Error(`Recovery step failed: ${strategy.name}`);
        }
      }

      console.log(`✅ Recovery successful: ${strategy.name}`);
      this.hideRecoveryMessage();
      return true;

    } catch (recoveryError) {
      console.error(`❌ Recovery failed: ${strategy.name}`, recoveryError);
      this.showFallbackMessage(strategy);
      return false;
    }
  }

  // Recovery implementation methods
  private async recoverSpatialNavigation(): Promise<boolean> {
    try {
      // Reset spatial navigation state
      const spatialNavigator = (window as any).spatialNavigator;
      if (spatialNavigator) {
        spatialNavigator.reset();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async recoverCameraMovement(): Promise<boolean> {
    try {
      // Reset camera controls
      const cameraController = (window as any).cameraController;
      if (cameraController) {
        cameraController.resetToCenter();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async recoverFocusSystem(): Promise<boolean> {
    try {
      // Reset focus system
      const focusManager = (window as any).focusManager;
      if (focusManager) {
        focusManager.clearFocus();
        focusManager.resetDepthOfField();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async recoverVisualEffects(): Promise<boolean> {
    try {
      // Disable and re-enable visual effects
      const effectsManager = (window as any).effectsManager;
      if (effectsManager) {
        effectsManager.disableAll();
        await new Promise(resolve => setTimeout(resolve, 500));
        effectsManager.enableBasicEffects();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Canvas recovery methods
  private async reinitializeCanvas(): Promise<boolean> {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;

      // Attempt to recreate WebGL context
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return false;

      console.log('📷 Canvas context reinitialized');
      return true;
    } catch (error) {
      return false;
    }
  }

  private async restoreCanvasState(): Promise<boolean> {
    try {
      // Restore saved canvas state if available
      const savedState = sessionStorage.getItem('canvas_state');
      if (savedState) {
        const state = JSON.parse(savedState);
        // Apply saved state logic here
        return true;
      }
      return true; // Continue even if no saved state
    } catch (error) {
      return false;
    }
  }

  private async validateCanvasRendering(): Promise<boolean> {
    try {
      // Simple rendering test
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return false;

      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      // Test basic rendering
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 1, 1);
      const imageData = ctx.getImageData(0, 0, 1, 1);

      return imageData.data[0] === 255; // Red component should be 255
    } catch (error) {
      return false;
    }
  }

  // User notification methods
  private showRecoveryMessage(strategy: RecoveryStrategy): void {
    const message = document.createElement('div');
    message.id = 'recovery-message';
    message.className = 'recovery-notification camera-theme';
    message.innerHTML = `
      <div class="recovery-icon">📷</div>
      <div class="recovery-text">
        <h4>${strategy.photographyMetaphor}</h4>
        <p>${strategy.userFriendlyExplanation}</p>
      </div>
      <div class="recovery-spinner"></div>
    `;

    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(message);
  }

  private hideRecoveryMessage(): void {
    const message = document.getElementById('recovery-message');
    if (message) {
      message.remove();
    }
  }

  private showFallbackMessage(strategy: RecoveryStrategy): void {
    this.hideRecoveryMessage();

    const fallback = document.createElement('div');
    fallback.id = 'fallback-message';
    fallback.className = 'fallback-notification camera-theme';
    fallback.innerHTML = `
      <div class="fallback-icon">⚠️</div>
      <div class="fallback-text">
        <h4>Manual Camera Mode</h4>
        <p>${strategy.fallbackMessage}</p>
      </div>
      <button onclick="this.parentElement.remove()" class="close-btn">×</button>
    `;

    fallback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 165, 0, 0.95);
      color: black;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(fallback);

    // Auto-remove after 10 seconds
    setTimeout(() => fallback.remove(), 10000);
  }

  private async notifyUser(alert: ErrorAlert): Promise<void> {
    // Create user-friendly error message with photography metaphor
    const photographyErrorMessages = {
      'canvas_error': {
        title: 'Camera Sensor Issue',
        message: 'The camera sensor needs adjustment. Switching to backup mode.',
        icon: '📷'
      },
      'spatial_navigation': {
        title: 'Camera Movement Calibration',
        message: 'Camera controls are being recalibrated for optimal movement.',
        icon: '🎛️'
      },
      'focus_system': {
        title: 'Focus System Reset',
        message: 'The autofocus system is resetting. Manual focus temporarily available.',
        icon: '🔍'
      },
      'performance_issue': {
        title: 'Camera Performance Optimization',
        message: 'Optimizing camera settings for better performance.',
        icon: '⚡'
      }
    };

    const errorInfo = photographyErrorMessages[alert.type as keyof typeof photographyErrorMessages] || {
      title: 'Camera System Notice',
      message: 'The camera system is adjusting settings automatically.',
      icon: '📸'
    };

    this.showUserNotification(errorInfo.title, errorInfo.message, errorInfo.icon);
    alert.userNotified = true;
  }

  private showUserNotification(title: string, message: string, icon: string): void {
    const notification = document.createElement('div');
    notification.className = 'error-notification camera-theme';
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 10000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  // External service integration
  private async reportToExternalServices(error: Error, context: ErrorContext, alert: ErrorAlert): Promise<void> {
    // Sentry reporting
    if (this.sentryDsn && typeof window.Sentry !== 'undefined') {
      window.Sentry.captureException(error, {
        contexts: {
          lightbox_canvas: context,
          photography_metaphor: context.photographyContext
        },
        tags: {
          component: context.component,
          action: context.action,
          severity: alert.severity
        }
      });
    }

    // Bugsnag reporting
    if (this.bugsnagApiKey && typeof window.Bugsnag !== 'undefined') {
      window.Bugsnag.notify(error, (event) => {
        event.context = `${context.component}:${context.action}`;
        event.severity = alert.severity;
        event.addMetadata('lightbox_canvas', context);
      });
    }

    // Custom webhook
    if (this.customWebhookUrl) {
      try {
        await fetch(this.customWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: {
              message: error.message,
              stack: error.stack
            },
            context,
            alert,
            timestamp: new Date().toISOString()
          })
        });
      } catch (webhookError) {
        console.error('Failed to send error to webhook:', webhookError);
      }
    }
  }

  private enrichSentryEvent(event: any): any {
    // Add LightboxCanvas specific context
    event.contexts = event.contexts || {};
    event.contexts.lightbox_canvas = {
      canvas_state: this.getCanvasState(),
      photography_mode: this.getPhotographyMode(),
      performance_metrics: this.getPerformanceSnapshot()
    };

    return event;
  }

  private enrichBugsnagEvent(event: any): void {
    event.addMetadata('lightbox_canvas', {
      canvas_state: this.getCanvasState(),
      photography_mode: this.getPhotographyMode(),
      performance_metrics: this.getPerformanceSnapshot()
    });
  }

  // Utility methods
  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('canvas') || message.includes('webgl') || stack.includes('canvas')) {
      return 'canvas_error';
    }

    if (message.includes('navigation') || message.includes('spatial')) {
      return 'spatial_navigation';
    }

    if (message.includes('focus') || message.includes('blur')) {
      return 'focus_system';
    }

    if (message.includes('performance') || message.includes('fps')) {
      return 'performance_issue';
    }

    if (message.includes('photography') || message.includes('metaphor')) {
      return 'photography_metaphor';
    }

    return 'general_error';
  }

  private determineSeverity(error: Error, context: ErrorContext): ErrorAlert['severity'] {
    const message = error.message.toLowerCase();

    // Critical errors that break core functionality
    if (message.includes('canvas') && message.includes('context')) {
      return 'critical';
    }

    // High severity errors that significantly impact UX
    if (context.component === 'spatial_navigation' || context.component === 'camera_controls') {
      return 'high';
    }

    // Medium severity for recoverable issues
    if (message.includes('performance') || message.includes('animation')) {
      return 'medium';
    }

    return 'low';
  }

  private updateErrorMetrics(error: Error, context: ErrorContext): void {
    const category = this.categorizeError(error);
    this.errorMetrics.errorCategories[category] = (this.errorMetrics.errorCategories[category] || 0) + 1;

    // Calculate error rate (errors per minute)
    const now = Date.now();
    const recentErrors = this.errors.filter(e => now - e.timestamp < 60000);
    this.errorMetrics.errorRate = recentErrors.length;

    // Update user impact assessment
    this.updateUserImpactAssessment(error, context);
  }

  private updateUserImpactAssessment(error: Error, context: ErrorContext): void {
    const severity = this.determineSeverity(error, context);

    if (severity === 'critical') {
      this.errorMetrics.userImpact = 'critical';
    } else if (severity === 'high' && this.errorMetrics.userImpact !== 'critical') {
      this.errorMetrics.userImpact = 'high';
    } else if (severity === 'medium' && this.errorMetrics.userImpact === 'low') {
      this.errorMetrics.userImpact = 'medium';
    }
  }

  private async triggerMonitoringAlert(alert: ErrorAlert): Promise<void> {
    if (alert.severity === 'critical' || alert.severity === 'high') {
      console.warn('🚨 High severity error alert:', alert);

      // Could trigger additional monitoring systems here
      // e.g., PagerDuty, Slack notifications, etc.
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('error_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('error_session_id', sessionId);
    }
    return sessionId;
  }

  private getCanvasState(): any {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      return {
        width: canvas.width,
        height: canvas.height,
        contextType: canvas.getContext('webgl') ? 'webgl' : '2d',
        isVisible: canvas.offsetParent !== null
      };
    } catch (error) {
      return null;
    }
  }

  private getPhotographyMode(): any {
    return {
      metaphorEnabled: document.body.classList.contains('photography-mode'),
      currentCamera: document.body.getAttribute('data-camera-mode'),
      activeControls: Array.from(document.querySelectorAll('[data-camera-control]')).length
    };
  }

  private getPerformanceSnapshot(): any {
    if (window.performanceMonitor) {
      return window.performanceMonitor.getCurrentMetrics();
    }
    return null;
  }

  private bindErrorHandlers(): void {
    // Additional error monitoring can be added here
  }

  private unbindErrorHandlers(): void {
    // Cleanup error handlers
  }

  private handleCanvasError(type: string, event: Event): void {
    this.handleError(new Error(`Canvas error: ${type}`), {
      component: 'canvas',
      action: type,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      canvasState: this.getCanvasState()
    });
  }

  // Public API
  getErrorMetrics(): ErrorMetrics {
    return { ...this.errorMetrics };
  }

  getRecentErrors(): Error[] {
    const oneHourAgo = Date.now() - 3600000;
    return this.errors.filter(error => error.timestamp > oneHourAgo);
  }

  clearErrors(): void {
    this.errors = [];
    this.errorMetrics = {
      errorCount: 0,
      errorRate: 0,
      meanTimeToRecovery: 0,
      successfulRecoveries: 0,
      userImpact: 'low',
      errorCategories: {}
    };
  }

  // Manual error reporting for custom scenarios
  reportError(error: Error | string, context: Partial<ErrorContext> = {}): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const fullContext: ErrorContext = {
      component: 'manual',
      action: 'user_reported',
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      ...context
    };

    this.handleError(errorObj, fullContext);
  }
}

// Global error monitoring instance
declare global {
  interface Window {
    errorMonitor: ErrorMonitor;
    Sentry?: any;
    Bugsnag?: any;
  }
}

export default ErrorMonitor;
export type { ErrorContext, ErrorMetrics, ErrorAlert, RecoveryStrategy };