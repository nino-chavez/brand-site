/**
 * Error Capture Engine
 *
 * Singleton that intercepts all runtime errors and provides structured error objects
 */

export interface CapturedError {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  type: ErrorType;
  severity: ErrorSeverity;
  context: ErrorContext;
  componentStack?: string;
  url: string;
  userAgent: string;
}

export type ErrorType =
  | 'CONTEXT_MISSING'
  | 'NULL_ACCESS'
  | 'TYPE_ERROR'
  | 'INTEGRATION_ERROR'
  | 'STATE_ERROR'
  | 'INFINITE_LOOP'
  | 'PERFORMANCE_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export type ErrorSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ErrorContext {
  component?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
  location?: string;
  userAction?: string;
  previousErrors?: string[];
}

export interface ErrorCaptureConfig {
  captureConsoleErrors: boolean;
  captureNetworkErrors: boolean;
  captureUnhandledRejections: boolean;
  captureReactErrors: boolean;
  maxErrorHistory: number;
  onErrorCaptured?: (error: CapturedError) => void;
}

class ErrorCaptureEngine {
  private static instance: ErrorCaptureEngine;
  private errors: CapturedError[] = [];
  private config: ErrorCaptureConfig;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private listeners: Set<(error: CapturedError) => void> = new Set();

  private constructor(config: Partial<ErrorCaptureConfig> = {}) {
    this.config = {
      captureConsoleErrors: true,
      captureNetworkErrors: true,
      captureUnhandledRejections: true,
      captureReactErrors: true,
      maxErrorHistory: 100,
      ...config
    };

    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;

    this.initialize();
  }

  public static getInstance(config?: Partial<ErrorCaptureConfig>): ErrorCaptureEngine {
    if (!ErrorCaptureEngine.instance) {
      ErrorCaptureEngine.instance = new ErrorCaptureEngine(config);
    }
    return ErrorCaptureEngine.instance;
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // Capture console errors
    if (this.config.captureConsoleErrors) {
      this.interceptConsoleError();
    }

    // Capture unhandled promise rejections
    if (this.config.captureUnhandledRejections) {
      this.captureUnhandledRejections();
    }

    // Capture network errors
    if (this.config.captureNetworkErrors) {
      this.captureNetworkErrors();
    }

    // Capture global errors
    this.captureGlobalErrors();
  }

  private interceptConsoleError(): void {
    console.error = (...args: any[]) => {
      // Check if this is a React error
      const message = args.join(' ');

      // Classify error type
      const type = this.classifyError(message, args);
      const severity = this.determineSeverity(type, message);

      const error: CapturedError = {
        id: this.generateErrorId(),
        timestamp: Date.now(),
        message,
        type,
        severity,
        context: this.extractContext(args),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      this.recordError(error);

      // Call original console.error
      this.originalConsoleError.apply(console, args);
    };
  }

  private captureUnhandledRejections(): void {
    window.addEventListener('unhandledrejection', (event) => {
      const error: CapturedError = {
        id: this.generateErrorId(),
        timestamp: Date.now(),
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        type: 'UNKNOWN',
        severity: 'HIGH',
        context: {
          location: window.location.pathname,
        },
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      this.recordError(error);
    });
  }

  private captureNetworkErrors(): void {
    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          const error: CapturedError = {
            id: this.generateErrorId(),
            timestamp: Date.now(),
            message: `Network Error: ${response.status} ${response.statusText}`,
            type: 'NETWORK_ERROR',
            severity: response.status >= 500 ? 'HIGH' : 'MEDIUM',
            context: {
              location: args[0]?.toString() || 'unknown',
            },
            url: window.location.href,
            userAgent: navigator.userAgent,
          };
          this.recordError(error);
        }
        return response;
      } catch (err) {
        const error: CapturedError = {
          id: this.generateErrorId(),
          timestamp: Date.now(),
          message: `Network Error: ${err}`,
          type: 'NETWORK_ERROR',
          severity: 'HIGH',
          context: {},
          url: window.location.href,
          userAgent: navigator.userAgent,
        };
        this.recordError(error);
        throw err;
      }
    };
  }

  private captureGlobalErrors(): void {
    window.addEventListener('error', (event) => {
      const error: CapturedError = {
        id: this.generateErrorId(),
        timestamp: Date.now(),
        message: event.message,
        stack: event.error?.stack,
        type: this.classifyError(event.message, [event.error]),
        severity: 'CRITICAL',
        context: {
          location: `${event.filename}:${event.lineno}:${event.colno}`,
        },
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      this.recordError(error);
    });
  }

  private classifyError(message: string, args: any[]): ErrorType {
    const lowerMessage = message.toLowerCase();

    // Infinite loop / Maximum update depth errors
    if (
      lowerMessage.includes('maximum update depth exceeded') ||
      lowerMessage.includes('too many re-renders') ||
      lowerMessage.includes('maximum call stack size exceeded')
    ) {
      return 'INFINITE_LOOP';
    }

    // Context provider errors
    if (
      lowerMessage.includes('must be used within') ||
      lowerMessage.includes('provider') ||
      lowerMessage.includes('context')
    ) {
      return 'CONTEXT_MISSING';
    }

    // Null/undefined access
    if (
      lowerMessage.includes('cannot read properties of null') ||
      lowerMessage.includes('cannot read properties of undefined') ||
      lowerMessage.includes('null is not an object') ||
      lowerMessage.includes('undefined is not an object')
    ) {
      return 'NULL_ACCESS';
    }

    // Type errors
    if (
      lowerMessage.includes('is not a function') ||
      lowerMessage.includes('is not a constructor') ||
      lowerMessage.includes('is not iterable')
    ) {
      return 'TYPE_ERROR';
    }

    // Network errors
    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('xhr')
    ) {
      return 'NETWORK_ERROR';
    }

    return 'UNKNOWN';
  }

  private determineSeverity(type: ErrorType, message: string): ErrorSeverity {
    // Critical: Application-breaking errors
    if (type === 'INFINITE_LOOP') return 'CRITICAL';
    if (type === 'CONTEXT_MISSING') return 'CRITICAL';
    if (message.includes('Uncaught')) return 'CRITICAL';

    // High: Feature-breaking errors
    if (type === 'NULL_ACCESS') return 'HIGH';
    if (type === 'TYPE_ERROR') return 'HIGH';

    // Medium: Degraded functionality
    if (type === 'NETWORK_ERROR') return 'MEDIUM';
    if (type === 'INTEGRATION_ERROR') return 'MEDIUM';

    // Low: Warnings and non-blocking issues
    return 'LOW';
  }

  private extractContext(args: any[]): ErrorContext {
    const context: ErrorContext = {};

    // Try to extract React component info
    const componentMatch = args.join(' ').match(/in (\w+) component/i);
    if (componentMatch) {
      context.component = componentMatch[1];
    }

    // Try to extract location info
    const urlMatch = args.join(' ').match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      context.location = urlMatch[0];
    }

    return context;
  }

  private recordError(error: CapturedError): void {
    // Add to error history
    this.errors.push(error);

    // Trim history if too long
    if (this.errors.length > this.config.maxErrorHistory) {
      this.errors.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(error));

    // Call config callback
    this.config.onErrorCaptured?.(error);
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API
  public subscribe(listener: (error: CapturedError) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getErrors(filter?: Partial<CapturedError>): CapturedError[] {
    if (!filter) return [...this.errors];

    return this.errors.filter(error => {
      return Object.entries(filter).every(([key, value]) => {
        return error[key as keyof CapturedError] === value;
      });
    });
  }

  public getErrorsByType(type: ErrorType): CapturedError[] {
    return this.errors.filter(error => error.type === type);
  }

  public getErrorsBySeverity(severity: ErrorSeverity): CapturedError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public getErrorCount(): number {
    return this.errors.length;
  }

  public getCriticalErrorCount(): number {
    return this.errors.filter(e => e.severity === 'CRITICAL').length;
  }

  public hasErrors(): boolean {
    return this.errors.length > 0;
  }

  public hasCriticalErrors(): boolean {
    return this.getCriticalErrorCount() > 0;
  }

  public destroy(): void {
    // Restore original console methods
    console.error = this.originalConsoleError;

    // Clear listeners
    this.listeners.clear();

    // Clear errors
    this.errors = [];
  }
}

export default ErrorCaptureEngine;
