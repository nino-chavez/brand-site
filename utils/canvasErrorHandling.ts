/**
 * Canvas Error Handling and Monitoring System
 * Task 15 - Production Readiness and Documentation
 */

export interface CanvasError {
  code: string;
  message: string;
  context: string;
  timestamp: number;
  userAgent: string;
  canvasState?: any;
  stackTrace?: string;
}

export interface CanvasErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  lastError?: CanvasError;
  recoveryAttempts: number;
  fallbackActivated: boolean;
}

class CanvasErrorHandler {
  private errors: CanvasError[] = [];
  private metrics: CanvasErrorMetrics = {
    totalErrors: 0,
    errorsByType: {},
    recoveryAttempts: 0,
    fallbackActivated: false
  };
  private fallbackCallbacks: Array<() => void> = [];
  private maxErrors = 10; // Maximum errors before fallback
  private reportingEndpoint?: string;

  constructor(reportingEndpoint?: string) {
    this.reportingEndpoint = reportingEndpoint;
    this.setupGlobalErrorHandler();
  }

  /**
   * Set up global error handling for canvas operations
   */
  private setupGlobalErrorHandler(): void {
    // Catch unhandled promise rejections in canvas operations
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isCanvasRelated(event.reason)) {
        this.handleError(
          'UNHANDLED_PROMISE_REJECTION',
          `Unhandled promise rejection: ${event.reason}`,
          'global_handler'
        );
      }
    });

    // Catch general errors that might affect canvas
    window.addEventListener('error', (event) => {
      if (this.isCanvasRelated(event.error)) {
        this.handleError(
          'GLOBAL_ERROR',
          event.error?.message || 'Unknown error',
          'global_handler',
          event.error?.stack
        );
      }
    });
  }

  /**
   * Check if error is related to canvas operations
   */
  private isCanvasRelated(error: any): boolean {
    if (!error) return false;

    const errorString = error.toString?.() || error.message || '';
    const canvasKeywords = [
      'canvas', 'spatial', 'camera', 'transform', 'coordinate',
      'LightboxCanvas', 'CameraController', 'SpatialSection'
    ];

    return canvasKeywords.some(keyword =>
      errorString.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Handle canvas-specific errors with context and recovery
   */
  handleError(
    code: string,
    message: string,
    context: string,
    stackTrace?: string,
    canvasState?: any
  ): void {
    const error: CanvasError = {
      code,
      message,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      canvasState,
      stackTrace
    };

    this.errors.push(error);
    this.updateMetrics(error);

    // Log error for development
    console.error(`[Canvas Error] ${code} in ${context}:`, message, error);

    // Attempt recovery based on error type
    this.attemptRecovery(code, context);

    // Report to monitoring service if configured
    this.reportError(error);

    // Activate fallback if too many errors
    if (this.metrics.totalErrors >= this.maxErrors && !this.metrics.fallbackActivated) {
      this.activateFallback();
    }
  }

  /**
   * Update error metrics
   */
  private updateMetrics(error: CanvasError): void {
    this.metrics.totalErrors++;
    this.metrics.errorsByType[error.code] = (this.metrics.errorsByType[error.code] || 0) + 1;
    this.metrics.lastError = error;
  }

  /**
   * Attempt automatic recovery based on error type
   */
  private attemptRecovery(code: string, context: string): void {
    this.metrics.recoveryAttempts++;

    switch (code) {
      case 'COORDINATE_TRANSFORM_ERROR':
        this.recoverCoordinateTransform();
        break;

      case 'CAMERA_MOVEMENT_ERROR':
        this.recoverCameraMovement();
        break;

      case 'CANVAS_RENDER_ERROR':
        this.recoverCanvasRender();
        break;

      case 'PERFORMANCE_DEGRADATION':
        this.recoverPerformance();
        break;

      case 'TOUCH_GESTURE_ERROR':
        this.recoverTouchGestures();
        break;

      case 'ACCESSIBILITY_ERROR':
        this.recoverAccessibility();
        break;

      default:
        console.warn(`[Canvas Recovery] No recovery strategy for error code: ${code}`);
    }
  }

  /**
   * Recovery strategies for specific error types
   */
  private recoverCoordinateTransform(): void {
    console.log('[Canvas Recovery] Resetting coordinate transformations');
    // Reset to safe coordinate state
    try {
      const event = new CustomEvent('canvas:resetCoordinates', {
        detail: { x: 0, y: 0, scale: 1 }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('[Canvas Recovery] Failed to reset coordinates:', error);
    }
  }

  private recoverCameraMovement(): void {
    console.log('[Canvas Recovery] Stopping camera animations');
    try {
      const event = new CustomEvent('canvas:stopAnimations');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('[Canvas Recovery] Failed to stop animations:', error);
    }
  }

  private recoverCanvasRender(): void {
    console.log('[Canvas Recovery] Forcing canvas re-render');
    try {
      const event = new CustomEvent('canvas:forceRerender');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('[Canvas Recovery] Failed to force re-render:', error);
    }
  }

  private recoverPerformance(): void {
    console.log('[Canvas Recovery] Activating performance mode');
    try {
      const event = new CustomEvent('canvas:performanceMode', {
        detail: { enabled: true }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('[Canvas Recovery] Failed to activate performance mode:', error);
    }
  }

  private recoverTouchGestures(): void {
    console.log('[Canvas Recovery] Resetting touch gesture handlers');
    try {
      const event = new CustomEvent('canvas:resetTouchHandlers');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('[Canvas Recovery] Failed to reset touch handlers:', error);
    }
  }

  private recoverAccessibility(): void {
    console.log('[Canvas Recovery] Re-initializing accessibility features');
    try {
      const event = new CustomEvent('canvas:reinitAccessibility');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('[Canvas Recovery] Failed to reinitialize accessibility:', error);
    }
  }

  /**
   * Activate fallback to scroll navigation
   */
  private activateFallback(): void {
    console.warn('[Canvas Fallback] Activating scroll navigation fallback');
    this.metrics.fallbackActivated = true;

    try {
      // Dispatch fallback event
      const event = new CustomEvent('canvas:activateFallback', {
        detail: { reason: 'too_many_errors', errorCount: this.metrics.totalErrors }
      });
      window.dispatchEvent(event);

      // Execute registered fallback callbacks
      this.fallbackCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('[Canvas Fallback] Callback failed:', error);
        }
      });
    } catch (error) {
      console.error('[Canvas Fallback] Failed to activate fallback:', error);
    }
  }

  /**
   * Register a callback for fallback activation
   */
  onFallback(callback: () => void): void {
    this.fallbackCallbacks.push(callback);
  }

  /**
   * Report error to external monitoring service
   */
  private async reportError(error: CanvasError): Promise<void> {
    if (!this.reportingEndpoint) return;

    try {
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'canvas_error',
          error,
          metrics: this.metrics,
          url: window.location.href,
          timestamp: Date.now()
        })
      });
    } catch (reportingError) {
      console.error('[Canvas Error Reporting] Failed to report error:', reportingError);
    }
  }

  /**
   * Get current error metrics
   */
  getMetrics(): CanvasErrorMetrics {
    return { ...this.metrics };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 5): CanvasError[] {
    return this.errors.slice(-limit);
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      recoveryAttempts: 0,
      fallbackActivated: false
    };
  }

  /**
   * Check if system is in fallback mode
   */
  isFallbackActive(): boolean {
    return this.metrics.fallbackActivated;
  }

  /**
   * Manually trigger fallback (for testing)
   */
  triggerFallback(): void {
    this.activateFallback();
  }
}

// Global error handler instance
let globalErrorHandler: CanvasErrorHandler | null = null;

/**
 * Initialize canvas error handling
 */
export function initializeCanvasErrorHandling(reportingEndpoint?: string): CanvasErrorHandler {
  if (!globalErrorHandler) {
    globalErrorHandler = new CanvasErrorHandler(reportingEndpoint);
  }
  return globalErrorHandler;
}

/**
 * Get global error handler instance
 */
export function getCanvasErrorHandler(): CanvasErrorHandler | null {
  return globalErrorHandler;
}

/**
 * Handle canvas error with automatic recovery
 */
export function handleCanvasError(
  error: Error | string,
  context: string,
  canvasState?: any
): void {
  const handler = getCanvasErrorHandler();
  if (!handler) {
    console.error('[Canvas Error] No error handler initialized');
    return;
  }

  if (typeof error === 'string') {
    handler.handleError('GENERIC_ERROR', error, context, undefined, canvasState);
  } else {
    handler.handleError(
      error.name || 'UNKNOWN_ERROR',
      error.message,
      context,
      error.stack,
      canvasState
    );
  }
}

/**
 * Create error boundary wrapper for canvas components
 */
export function withCanvasErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallbackComponent?: React.ComponentType<{ error: Error }>
): React.ComponentType<T> {
  return function CanvasErrorBoundary(props: T) {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      handleCanvasError(error as Error, 'component_render');

      if (fallbackComponent) {
        return React.createElement(fallbackComponent, { error: error as Error });
      }

      return React.createElement('div', {
        className: 'canvas-error-fallback',
        children: 'Canvas component failed to load. Using fallback navigation.'
      });
    }
  };
}

/**
 * Monitor canvas operation performance and handle errors
 */
export function monitorCanvasOperation<T>(
  operation: () => T,
  context: string,
  timeoutMs = 5000
): T | null {
  const handler = getCanvasErrorHandler();

  try {
    const startTime = performance.now();
    const result = operation();
    const duration = performance.now() - startTime;

    // Monitor for performance issues
    if (duration > timeoutMs) {
      handler?.handleError(
        'PERFORMANCE_TIMEOUT',
        `Operation took ${duration.toFixed(2)}ms (limit: ${timeoutMs}ms)`,
        context
      );
    }

    return result;
  } catch (error) {
    handler?.handleError(
      'OPERATION_ERROR',
      (error as Error).message,
      context,
      (error as Error).stack
    );
    return null;
  }
}