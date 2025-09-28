/**
 * Enhanced Rack Focus System
 *
 * Professional depth of field simulation for cinematic hover interactions.
 * Implements realistic bokeh effects, depth layers, and focus breathing
 * based on professional cinematography techniques.
 *
 * @fileoverview Enhanced rack focus system with professional depth of field
 * @version 1.0.0
 * @since Task 3 - Photography Metaphor Integration Enhancement
 */

import { photographyPresets, getCinematicEasing } from '../utils/photographyEasingCurves';

/**
 * Depth of field parameters for realistic focus simulation
 */
interface DepthOfFieldParams {
  /** F-stop value (lower = shallower depth of field) */
  fStop: number;
  /** Focal length in mm (longer = shallower DOF) */
  focalLength: number;
  /** Focus distance (subject distance) */
  focusDistance: number;
  /** Sensor size factor (full frame = 1.0) */
  sensorSize: number;
  /** Bokeh quality (0-1, higher = smoother) */
  bokehQuality: number;
}

/**
 * Focus target with depth information
 */
interface FocusTarget {
  element: HTMLElement;
  depth: number;
  priority: number;
  metadata?: {
    title?: string;
    description?: string;
    focusHint?: string;
  };
}

/**
 * Rack focus transition configuration
 */
interface RackFocusConfig {
  /** Transition duration in milliseconds */
  duration: number;
  /** DOF parameters for the focus effect */
  depthOfField: DepthOfFieldParams;
  /** Focus breathing intensity (0-1) */
  focusBreathing: number;
  /** Bokeh shape ('circular' | 'hexagonal' | 'vintage') */
  bokehShape: 'circular' | 'hexagonal' | 'vintage';
  /** Performance optimization level */
  performance: 'high' | 'medium' | 'low';
  /** Enable chromatic aberration simulation */
  chromaticAberration: boolean;
  /** Enable vignetting effect */
  vignetting: boolean;
}

/**
 * Focus state for individual elements
 */
interface ElementFocusState {
  element: HTMLElement;
  originalState: {
    filter: string;
    transform: string;
    opacity: string;
    zIndex: string;
    transition: string;
  };
  currentDepth: number;
  isFocused: boolean;
  transitionProgress: number;
}

/**
 * Default professional rack focus configuration
 */
const DEFAULT_RACK_FOCUS_CONFIG: RackFocusConfig = {
  duration: 400,
  depthOfField: {
    fStop: 2.8,
    focalLength: 85,
    focusDistance: 2.0,
    sensorSize: 1.0,
    bokehQuality: 0.8
  },
  focusBreathing: 0.02,
  bokehShape: 'circular',
  performance: 'high',
  chromaticAberration: true,
  vignetting: false
};

/**
 * Professional lens presets for different cinematographic looks
 */
export const LENS_PRESETS = {
  portrait85mm: {
    fStop: 1.4,
    focalLength: 85,
    focusDistance: 1.5,
    sensorSize: 1.0,
    bokehQuality: 0.95
  },
  cinematic50mm: {
    fStop: 2.8,
    focalLength: 50,
    focusDistance: 2.0,
    sensorSize: 1.0,
    bokehQuality: 0.85
  },
  documentary24mm: {
    fStop: 4.0,
    focalLength: 24,
    focusDistance: 3.0,
    sensorSize: 1.0,
    bokehQuality: 0.7
  },
  macro100mm: {
    fStop: 1.2,
    focalLength: 100,
    focusDistance: 0.5,
    sensorSize: 1.0,
    bokehQuality: 0.98
  },
  vintage50mm: {
    fStop: 2.0,
    focalLength: 50,
    focusDistance: 2.0,
    sensorSize: 1.0,
    bokehQuality: 0.6
  }
};

/**
 * Enhanced Rack Focus System - Professional depth of field simulation
 *
 * Responsibilities:
 * - Realistic depth of field calculation based on photography principles
 * - Professional bokeh and focus breathing effects
 * - Performance-optimized rack focus transitions
 * - Multi-layer depth management with automatic depth detection
 * - Cinematic focus breathing and lens characteristics
 */
export class EnhancedRackFocusSystem {
  private focusTargets = new Map<HTMLElement, FocusTarget>();
  private elementStates = new Map<HTMLElement, ElementFocusState>();
  private currentFocusTarget: HTMLElement | null = null;
  private config: RackFocusConfig = DEFAULT_RACK_FOCUS_CONFIG;
  private animationFrame: number | null = null;
  private isTransitioning: boolean = false;

  /**
   * Initialize the rack focus system
   */
  public initialize(config?: Partial<RackFocusConfig>): void {
    this.config = { ...DEFAULT_RACK_FOCUS_CONFIG, ...config };
    this.setupDepthDetection();
    this.createFocusOverlay();
  }

  /**
   * Register a focus target with depth information
   */
  public registerFocusTarget(
    element: HTMLElement,
    depth: number,
    priority: number = 1,
    metadata?: FocusTarget['metadata']
  ): void {
    const target: FocusTarget = {
      element,
      depth,
      priority,
      metadata
    };

    this.focusTargets.set(element, target);

    // Store original element state
    this.elementStates.set(element, {
      element,
      originalState: {
        filter: element.style.filter || '',
        transform: element.style.transform || '',
        opacity: element.style.opacity || '',
        zIndex: element.style.zIndex || '',
        transition: element.style.transition || ''
      },
      currentDepth: depth,
      isFocused: false,
      transitionProgress: 0
    });

    // Set up hover events
    this.setupElementEvents(element);
  }

  /**
   * Calculate realistic depth of field blur
   */
  private calculateDepthOfFieldBlur(
    elementDepth: number,
    focusDepth: number,
    dofParams: DepthOfFieldParams
  ): number {
    // Circle of confusion calculation based on photography principles
    const hyperfocalDistance = (dofParams.focalLength * dofParams.focalLength) /
                              (dofParams.fStop * 0.03 * dofParams.sensorSize);

    const nearFocus = (hyperfocalDistance * focusDepth) /
                     (hyperfocalDistance + (focusDepth - dofParams.focalLength));

    const farFocus = (hyperfocalDistance * focusDepth) /
                    (hyperfocalDistance - (focusDepth - dofParams.focalLength));

    // Calculate blur based on distance from focus plane
    let blur = 0;

    if (elementDepth < nearFocus || elementDepth > farFocus) {
      const distance = Math.min(
        Math.abs(elementDepth - nearFocus),
        Math.abs(elementDepth - farFocus)
      );

      // Blur increases with distance from focus plane
      blur = (distance / focusDepth) *
             (dofParams.focalLength / dofParams.fStop) *
             (1 / dofParams.bokehQuality);
    }

    return Math.min(blur, 10); // Cap maximum blur
  }

  /**
   * Apply professional focus effects to an element
   */
  private applyFocusEffects(
    element: HTMLElement,
    isInFocus: boolean,
    transitionProgress: number,
    focusDepth: number
  ): void {
    const state = this.elementStates.get(element);
    if (!state) return;

    const target = this.focusTargets.get(element);
    if (!target) return;

    // Calculate depth of field blur
    const blurAmount = isInFocus ? 0 :
      this.calculateDepthOfFieldBlur(target.depth, focusDepth, this.config.depthOfField);

    // Focus breathing effect (realistic lens characteristic)
    const breathingScale = isInFocus ?
      1 + (this.config.focusBreathing * Math.sin(transitionProgress * Math.PI)) : 1;

    // Opacity changes for depth perception
    const opacity = isInFocus ? 1 : Math.max(0.3, 1 - (blurAmount * 0.1));

    // Chromatic aberration for out-of-focus elements
    let chromaticOffset = '';
    if (!isInFocus && this.config.chromaticAberration && blurAmount > 2) {
      const offset = Math.min(blurAmount * 0.2, 2);
      chromaticOffset = `drop-shadow(${offset}px 0 rgba(255,0,0,0.3)) ` +
                       `drop-shadow(-${offset}px 0 rgba(0,255,255,0.3))`;
    }

    // Build filter string
    const filters = [
      `blur(${blurAmount}px)`,
      chromaticOffset,
      isInFocus ? 'brightness(1.05) contrast(1.02)' : 'brightness(0.95) contrast(0.98)'
    ].filter(Boolean).join(' ');

    // Apply effects with smooth transitions
    const easingFn = photographyPresets.focusBreathing;
    const easedProgress = easingFn(transitionProgress);

    element.style.filter = filters;
    element.style.transform = `${state.originalState.transform} scale(${breathingScale})`;
    element.style.opacity = opacity.toString();
    element.style.zIndex = isInFocus ? '100' : (50 - Math.floor(blurAmount)).toString();
    element.style.transition = `all ${this.config.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

    // Add focus indicator for accessibility
    if (isInFocus) {
      element.setAttribute('aria-label', `Focused: ${target.metadata?.title || 'Content'}`);
      element.style.boxShadow = '0 0 0 2px rgba(255, 165, 0, 0.5)';
    } else {
      element.removeAttribute('aria-label');
      element.style.boxShadow = '';
    }

    // Update state
    state.isFocused = isInFocus;
    state.transitionProgress = transitionProgress;
    state.currentDepth = focusDepth;
  }

  /**
   * Execute rack focus transition to target element
   */
  public async executeRackFocus(
    targetElement: HTMLElement,
    duration?: number
  ): Promise<void> {
    if (this.isTransitioning) return;

    const target = this.focusTargets.get(targetElement);
    if (!target) {
      console.warn('Target element not registered for rack focus');
      return;
    }

    this.isTransitioning = true;
    const effectiveDuration = duration || this.config.duration;
    const startTime = performance.now();
    const previousFocus = this.currentFocusTarget;

    // Update current focus target
    this.currentFocusTarget = targetElement;

    return new Promise((resolve) => {
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / effectiveDuration, 1);

        // Apply effects to all registered elements
        this.focusTargets.forEach((focusTarget, element) => {
          const isInFocus = element === targetElement;
          this.applyFocusEffects(element, isInFocus, progress, target.depth);
        });

        // Continue animation or complete
        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate);
        } else {
          this.isTransitioning = false;
          this.animationFrame = null;

          // Announce focus change for accessibility
          this.announceFocusChange(targetElement, previousFocus);

          resolve();
        }
      };

      this.animationFrame = requestAnimationFrame(animate);
    });
  }

  /**
   * Clear rack focus effects (return to neutral state)
   */
  public async clearRackFocus(): Promise<void> {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Reset all elements to original state
    this.elementStates.forEach((state, element) => {
      element.style.filter = state.originalState.filter;
      element.style.transform = state.originalState.transform;
      element.style.opacity = state.originalState.opacity;
      element.style.zIndex = state.originalState.zIndex;
      element.style.transition = state.originalState.transition;
      element.style.boxShadow = '';
      element.removeAttribute('aria-label');

      state.isFocused = false;
      state.transitionProgress = 0;
    });

    this.currentFocusTarget = null;
    this.isTransitioning = false;
  }

  /**
   * Set up automatic depth detection based on element position
   */
  private setupDepthDetection(): void {
    // Scan for spatial sections and assign depths based on z-index and position
    const spatialSections = document.querySelectorAll('[data-spatial-section]');

    spatialSections.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const computedStyle = getComputedStyle(htmlElement);
      const zIndex = parseInt(computedStyle.zIndex) || 0;

      // Calculate depth based on z-index and position
      const depth = Math.max(1, 10 - zIndex + index * 0.5);
      const priority = 10 - index;

      // Extract metadata from element attributes
      const metadata = {
        title: htmlElement.getAttribute('data-section-title') ||
               htmlElement.querySelector('h1, h2, h3')?.textContent ||
               `Section ${index + 1}`,
        description: htmlElement.getAttribute('data-section-description') ||
                    htmlElement.querySelector('p')?.textContent?.slice(0, 100) ||
                    'Interactive section',
        focusHint: `Focus on ${htmlElement.getAttribute('data-section') || 'content'}`
      };

      this.registerFocusTarget(htmlElement, depth, priority, metadata);
    });
  }

  /**
   * Create invisible overlay for focus visualization (development mode)
   */
  private createFocusOverlay(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const overlay = document.createElement('div');
    overlay.id = 'rack-focus-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
    `;

    document.body.appendChild(overlay);
    this.updateDebugOverlay();
  }

  /**
   * Update debug overlay with current focus information
   */
  private updateDebugOverlay(): void {
    const overlay = document.getElementById('rack-focus-debug-overlay');
    if (!overlay) return;

    const focusedElement = this.currentFocusTarget;
    const focusedTarget = focusedElement ? this.focusTargets.get(focusedElement) : null;

    overlay.innerHTML = `
      <div><strong>Rack Focus System</strong></div>
      <div>F-Stop: f/${this.config.depthOfField.fStop}</div>
      <div>Focal Length: ${this.config.depthOfField.focalLength}mm</div>
      <div>Focus Distance: ${this.config.depthOfField.focusDistance}m</div>
      <div>Active Targets: ${this.focusTargets.size}</div>
      <div>Currently Focused: ${focusedTarget?.metadata?.title || 'None'}</div>
      <div>Focus Depth: ${focusedTarget?.depth.toFixed(1) || 'N/A'}</div>
      <div>Transitioning: ${this.isTransitioning ? 'Yes' : 'No'}</div>
    `;
  }

  /**
   * Set up hover and focus events for elements
   */
  private setupElementEvents(element: HTMLElement): void {
    element.addEventListener('mouseenter', () => {
      if (!this.isTransitioning) {
        this.executeRackFocus(element);
      }
    });

    element.addEventListener('focus', () => {
      this.executeRackFocus(element);
    });

    // Clear focus when mouse leaves the container area
    document.addEventListener('mouseleave', () => {
      if (!this.isTransitioning) {
        setTimeout(() => this.clearRackFocus(), 100);
      }
    });
  }

  /**
   * Announce focus changes for screen readers
   */
  private announceFocusChange(
    newTarget: HTMLElement,
    previousTarget: HTMLElement | null
  ): void {
    const target = this.focusTargets.get(newTarget);
    if (!target?.metadata) return;

    // Create or update live region for announcements
    let liveRegion = document.getElementById('rack-focus-announcements');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'rack-focus-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegion);
    }

    // Announce the focus change
    const message = `Focused on ${target.metadata.title}. ${target.metadata.focusHint || ''}`;
    liveRegion.textContent = message;

    // Update debug overlay
    this.updateDebugOverlay();
  }

  /**
   * Configure lens preset for different cinematographic looks
   */
  public setLensPreset(presetName: keyof typeof LENS_PRESETS): void {
    const preset = LENS_PRESETS[presetName];
    if (preset) {
      this.config.depthOfField = { ...this.config.depthOfField, ...preset };
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): RackFocusConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<RackFocusConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clean up the rack focus system
   */
  public destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.clearRackFocus();
    this.focusTargets.clear();
    this.elementStates.clear();

    // Remove debug overlay
    const overlay = document.getElementById('rack-focus-debug-overlay');
    if (overlay) {
      overlay.remove();
    }

    // Remove live region
    const liveRegion = document.getElementById('rack-focus-announcements');
    if (liveRegion) {
      liveRegion.remove();
    }
  }
}

// Export singleton instance
export const enhancedRackFocus = new EnhancedRackFocusSystem();

export default EnhancedRackFocusSystem;