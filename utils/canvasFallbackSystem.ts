/**
 * Canvas System Fallback Plan
 * Task 15 - Production Readiness and Documentation
 *
 * Provides comprehensive fallback strategies for canvas system failures,
 * ensuring graceful degradation to scroll-based navigation.
 */

import { getCanvasErrorHandler } from './canvasErrorHandling';

export interface FallbackState {
  isActive: boolean;
  reason: string;
  timestamp: number;
  originalCanvasState?: any;
  scrollPosition: number;
}

export interface FallbackStrategy {
  name: string;
  condition: () => boolean;
  activate: () => void;
  deactivate?: () => void;
  priority: number;
}

class CanvasFallbackSystem {
  private fallbackState: FallbackState | null = null;
  private strategies: FallbackStrategy[] = [];
  private originalBodyClass = '';
  private scrollRestorePosition = 0;
  private observers: Array<(state: FallbackState | null) => void> = [];

  constructor() {
    this.initializeFallbackStrategies();
    this.setupEventListeners();
  }

  /**
   * Initialize all fallback strategies in priority order
   */
  private initializeFallbackStrategies(): void {
    this.strategies = [
      {
        name: 'error_threshold_fallback',
        condition: () => this.hasExceededErrorThreshold(),
        activate: () => this.activateErrorThresholdFallback(),
        priority: 1
      },
      {
        name: 'performance_degradation_fallback',
        condition: () => this.hasPerformanceDegradation(),
        activate: () => this.activatePerformanceFallback(),
        priority: 2
      },
      {
        name: 'browser_compatibility_fallback',
        condition: () => !this.isBrowserCompatible(),
        activate: () => this.activateBrowserCompatibilityFallback(),
        priority: 3
      },
      {
        name: 'memory_constraint_fallback',
        condition: () => this.hasMemoryConstraints(),
        activate: () => this.activateMemoryConstraintFallback(),
        priority: 4
      },
      {
        name: 'touch_device_fallback',
        condition: () => this.requiresTouchOptimization(),
        activate: () => this.activateTouchDeviceFallback(),
        priority: 5
      },
      {
        name: 'accessibility_fallback',
        condition: () => this.requiresAccessibilityFallback(),
        activate: () => this.activateAccessibilityFallback(),
        priority: 6
      },
      {
        name: 'manual_override_fallback',
        condition: () => this.hasManualOverride(),
        activate: () => this.activateManualOverrideFallback(),
        priority: 7
      }
    ];

    // Sort by priority (lower number = higher priority)
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Setup event listeners for fallback triggers
   */
  private setupEventListeners(): void {
    // Listen for canvas error events
    window.addEventListener('canvas:activateFallback', (event: any) => {
      this.activateFallback(event.detail?.reason || 'unknown_error');
    });

    // Listen for performance monitoring events
    window.addEventListener('canvas:performanceDegradation', () => {
      this.checkAndActivateFallback();
    });

    // Listen for browser compatibility issues
    window.addEventListener('canvas:compatibilityIssue', () => {
      this.checkAndActivateFallback();
    });

    // Listen for memory warnings
    window.addEventListener('canvas:memoryWarning', () => {
      this.checkAndActivateFallback();
    });

    // Page visibility change - pause canvas operations when hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !this.fallbackState) {
        this.pauseCanvasOperations();
      } else if (!document.hidden && this.fallbackState?.reason === 'page_hidden') {
        this.deactivateFallback();
      }
    });
  }

  /**
   * Check all strategies and activate fallback if needed
   */
  checkAndActivateFallback(): boolean {
    if (this.fallbackState) return true; // Already in fallback

    for (const strategy of this.strategies) {
      if (strategy.condition()) {
        strategy.activate();
        return true;
      }
    }

    return false;
  }

  /**
   * Manually activate fallback with specific reason
   */
  activateFallback(reason: string, canvasState?: any): void {
    if (this.fallbackState) return; // Already active

    console.warn(`[Canvas Fallback] Activating fallback: ${reason}`);

    // Save current state
    this.scrollRestorePosition = window.scrollY;
    this.originalBodyClass = document.body.className;

    // Create fallback state
    this.fallbackState = {
      isActive: true,
      reason,
      timestamp: Date.now(),
      originalCanvasState: canvasState,
      scrollPosition: this.scrollRestorePosition
    };

    // Apply fallback changes
    this.applyFallbackChanges();

    // Notify observers
    this.notifyObservers(this.fallbackState);

    // Log fallback activation
    const errorHandler = getCanvasErrorHandler();
    errorHandler?.handleError(
      'FALLBACK_ACTIVATED',
      `Fallback activated: ${reason}`,
      'fallback_system',
      undefined,
      canvasState
    );
  }

  /**
   * Apply DOM and style changes for fallback mode
   */
  private applyFallbackChanges(): void {
    // Add fallback CSS class to body
    document.body.classList.add('canvas-fallback-active');

    // Hide canvas overlay elements
    this.hideCanvasElements();

    // Restore scroll-based navigation
    this.restoreScrollNavigation();

    // Update navigation state
    this.updateNavigationState();

    // Show fallback notification
    this.showFallbackNotification();
  }

  /**
   * Hide canvas-specific elements
   */
  private hideCanvasElements(): void {
    const canvasElements = document.querySelectorAll('[data-canvas-element]');
    canvasElements.forEach(element => {
      (element as HTMLElement).style.display = 'none';
    });

    // Hide debug overlays
    const debugElements = document.querySelectorAll('.canvas-debug-overlay');
    debugElements.forEach(element => {
      (element as HTMLElement).style.display = 'none';
    });
  }

  /**
   * Restore traditional scroll-based navigation
   */
  private restoreScrollNavigation(): void {
    // Re-enable scroll behavior
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    // Restore scroll position or scroll to appropriate section
    this.scrollToNearestSection();

    // Re-enable traditional section navigation
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => {
      (section as HTMLElement).style.position = 'static';
      (section as HTMLElement).style.transform = 'none';
    });
  }

  /**
   * Scroll to the nearest logical section based on canvas state
   */
  private scrollToNearestSection(): void {
    if (!this.fallbackState?.originalCanvasState) {
      window.scrollTo({ top: this.scrollRestorePosition, behavior: 'smooth' });
      return;
    }

    const { activeSection } = this.fallbackState.originalCanvasState;
    const targetElement = document.querySelector(`[data-section="${activeSection}"]`);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: this.scrollRestorePosition, behavior: 'smooth' });
    }
  }

  /**
   * Update navigation components for fallback mode
   */
  private updateNavigationState(): void {
    // Disable CursorLens canvas mode
    const event = new CustomEvent('cursorLens:disableCanvasMode');
    window.dispatchEvent(event);

    // Update navigation menu to scroll mode
    const navEvent = new CustomEvent('navigation:scrollMode', {
      detail: { fallbackActive: true }
    });
    window.dispatchEvent(navEvent);
  }

  /**
   * Show user-friendly fallback notification
   */
  private showFallbackNotification(): void {
    const notification = document.createElement('div');
    notification.className = 'canvas-fallback-notification';
    notification.innerHTML = `
      <div class="fixed top-4 right-4 bg-athletic-neutral-900 border border-athletic-court-orange/30
                  rounded-lg p-4 shadow-lg z-50 max-w-sm">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-athletic-court-orange rounded-full animate-pulse"></div>
          <span class="text-athletic-neutral-100 text-sm font-medium">
            Canvas Navigation Unavailable
          </span>
        </div>
        <p class="text-athletic-neutral-400 text-xs mt-1">
          Using traditional scroll navigation for optimal experience.
        </p>
        <button
          onclick="this.parentElement.parentElement.remove()"
          class="absolute top-1 right-2 text-athletic-neutral-500 hover:text-athletic-neutral-300 text-xs"
        >
          ×
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Deactivate fallback and restore canvas navigation
   */
  deactivateFallback(): void {
    if (!this.fallbackState) return;

    console.log('[Canvas Fallback] Deactivating fallback mode');

    // Remove fallback CSS class
    document.body.classList.remove('canvas-fallback-active');

    // Restore original body class
    document.body.className = this.originalBodyClass;

    // Show canvas elements
    this.showCanvasElements();

    // Re-enable canvas navigation
    this.restoreCanvasNavigation();

    // Clear fallback state
    const previousState = this.fallbackState;
    this.fallbackState = null;

    // Notify observers
    this.notifyObservers(null);

    // Remove fallback notifications
    const notifications = document.querySelectorAll('.canvas-fallback-notification');
    notifications.forEach(notification => notification.remove());

    console.log('[Canvas Fallback] Canvas navigation restored');
  }

  /**
   * Restore canvas elements and navigation
   */
  private showCanvasElements(): void {
    const canvasElements = document.querySelectorAll('[data-canvas-element]');
    canvasElements.forEach(element => {
      (element as HTMLElement).style.display = '';
    });
  }

  /**
   * Restore canvas navigation functionality
   */
  private restoreCanvasNavigation(): void {
    // Re-enable CursorLens canvas mode
    const event = new CustomEvent('cursorLens:enableCanvasMode');
    window.dispatchEvent(event);

    // Update navigation to canvas mode
    const navEvent = new CustomEvent('navigation:canvasMode', {
      detail: { fallbackDeactivated: true }
    });
    window.dispatchEvent(navEvent);

    // Restore canvas positioning
    const restoreEvent = new CustomEvent('canvas:restoreFromFallback');
    window.dispatchEvent(restoreEvent);
  }

  /**
   * Pause canvas operations without full fallback
   */
  private pauseCanvasOperations(): void {
    const pauseEvent = new CustomEvent('canvas:pauseOperations');
    window.dispatchEvent(pauseEvent);
  }

  /**
   * Fallback condition checkers
   */
  private hasExceededErrorThreshold(): boolean {
    const errorHandler = getCanvasErrorHandler();
    return errorHandler ? errorHandler.getMetrics().totalErrors >= 5 : false;
  }

  private hasPerformanceDegradation(): boolean {
    // Check if FPS is consistently below threshold
    return false; // Implement based on performance monitoring
  }

  private isBrowserCompatible(): boolean {
    // Check for required features
    return !!(
      window.CSS &&
      window.CSS.supports &&
      window.CSS.supports('transform', 'translateZ(0)') &&
      window.requestAnimationFrame
    );
  }

  private hasMemoryConstraints(): boolean {
    // Check memory usage if available
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return memInfo.usedJSHeapSize > memInfo.totalJSHeapSize * 0.9;
    }
    return false;
  }

  private requiresTouchOptimization(): boolean {
    // Check if touch device needs different navigation
    return 'ontouchstart' in window && window.innerWidth < 768;
  }

  private requiresAccessibilityFallback(): boolean {
    // Check for reduced motion preference
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private hasManualOverride(): boolean {
    // Check for manual fallback preference
    return localStorage.getItem('canvas-fallback-override') === 'true';
  }

  /**
   * Strategy activation methods
   */
  private activateErrorThresholdFallback(): void {
    this.activateFallback('error_threshold_exceeded');
  }

  private activatePerformanceFallback(): void {
    this.activateFallback('performance_degradation');
  }

  private activateBrowserCompatibilityFallback(): void {
    this.activateFallback('browser_incompatible');
  }

  private activateMemoryConstraintFallback(): void {
    this.activateFallback('memory_constraints');
  }

  private activateTouchDeviceFallback(): void {
    this.activateFallback('touch_optimization_required');
  }

  private activateAccessibilityFallback(): void {
    this.activateFallback('accessibility_requirements');
  }

  private activateManualOverrideFallback(): void {
    this.activateFallback('manual_override');
  }

  /**
   * Observer pattern for fallback state changes
   */
  onFallbackStateChange(callback: (state: FallbackState | null) => void): void {
    this.observers.push(callback);
  }

  private notifyObservers(state: FallbackState | null): void {
    this.observers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('[Canvas Fallback] Observer callback failed:', error);
      }
    });
  }

  /**
   * Public API
   */
  getFallbackState(): FallbackState | null {
    return this.fallbackState;
  }

  isFallbackActive(): boolean {
    return this.fallbackState !== null;
  }

  forceActivateFallback(reason: string): void {
    this.activateFallback(reason);
  }

  forceDeactivateFallback(): void {
    this.deactivateFallback();
  }

  getAvailableStrategies(): string[] {
    return this.strategies.map(s => s.name);
  }
}

// Global fallback system instance
let globalFallbackSystem: CanvasFallbackSystem | null = null;

/**
 * Initialize canvas fallback system
 */
export function initializeCanvasFallbackSystem(): CanvasFallbackSystem {
  if (!globalFallbackSystem) {
    globalFallbackSystem = new CanvasFallbackSystem();
  }
  return globalFallbackSystem;
}

/**
 * Get global fallback system instance
 */
export function getCanvasFallbackSystem(): CanvasFallbackSystem | null {
  return globalFallbackSystem;
}

/**
 * Manually trigger fallback activation
 */
export function activateCanvasFallback(reason: string): void {
  const fallbackSystem = getCanvasFallbackSystem();
  fallbackSystem?.forceActivateFallback(reason);
}

/**
 * Check if canvas fallback is currently active
 */
export function isCanvasFallbackActive(): boolean {
  const fallbackSystem = getCanvasFallbackSystem();
  return fallbackSystem ? fallbackSystem.isFallbackActive() : false;
}

/**
 * React hook for fallback state
 */
export function useCanvasFallback() {
  const [fallbackState, setFallbackState] = React.useState<FallbackState | null>(null);

  React.useEffect(() => {
    const fallbackSystem = getCanvasFallbackSystem();
    if (!fallbackSystem) return;

    // Get initial state
    setFallbackState(fallbackSystem.getFallbackState());

    // Subscribe to changes
    fallbackSystem.onFallbackStateChange(setFallbackState);

    return () => {
      // Cleanup would go here if we had unsubscribe functionality
    };
  }, []);

  return {
    fallbackState,
    isActive: fallbackState !== null,
    activateFallback: (reason: string) => activateCanvasFallback(reason),
    deactivateFallback: () => getCanvasFallbackSystem()?.forceDeactivateFallback()
  };
}