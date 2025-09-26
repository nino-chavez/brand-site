/**
 * Browser Compatibility Utilities for Viewfinder Hero Interface
 * Handles feature detection, fallbacks, and progressive enhancement
 */

export interface BrowserFeatures {
  backdropFilter: boolean;
  transform3d: boolean;
  requestAnimationFrame: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  cssFilters: boolean;
  webAudio: boolean;
  reducedMotion: boolean;
  touchSupport: boolean;
  pointerEvents: boolean;
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  pixelRatio: number;
  screenSize: {
    width: number;
    height: number;
  };
  maxTextureSize: number;
  hardwareAcceleration: boolean;
  memoryLimit: 'low' | 'medium' | 'high';
}

/**
 * Detect browser features and capabilities
 */
export const detectBrowserFeatures = (): BrowserFeatures => {
  const features: BrowserFeatures = {
    backdropFilter: false,
    transform3d: false,
    requestAnimationFrame: false,
    intersectionObserver: false,
    resizeObserver: false,
    cssFilters: false,
    webAudio: false,
    reducedMotion: false,
    touchSupport: false,
    pointerEvents: false,
  };

  // Safe feature detection with try-catch
  try {
    // Test backdrop-filter support
    const testElement = document.createElement('div');
    testElement.style.backdropFilter = 'blur(10px)';
    features.backdropFilter = testElement.style.backdropFilter === 'blur(10px)' ||
      testElement.style.webkitBackdropFilter === 'blur(10px)';

    // Test transform3d support
    const transform3dTest = document.createElement('div');
    transform3dTest.style.transform = 'translate3d(0,0,0)';
    features.transform3d = transform3dTest.style.transform !== '';

    // Test CSS filters
    const filterTest = document.createElement('div');
    filterTest.style.filter = 'blur(2px)';
    features.cssFilters = filterTest.style.filter === 'blur(2px)';

    // Test API availability
    features.requestAnimationFrame = 'requestAnimationFrame' in window;
    features.intersectionObserver = 'IntersectionObserver' in window;
    features.resizeObserver = 'ResizeObserver' in window;
    features.webAudio = 'AudioContext' in window || 'webkitAudioContext' in window;

    // Test pointer events
    features.pointerEvents = 'onpointerdown' in window || 'onmspointerdown' in window;

    // Test touch support
    features.touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Test reduced motion preference
    if (window.matchMedia) {
      features.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  } catch (error) {
    console.warn('Error detecting browser features:', error);
  }

  return features;
};

/**
 * Detect device capabilities
 */
export const detectDeviceCapabilities = (): DeviceCapabilities => {
  const capabilities: DeviceCapabilities = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    pixelRatio: 1,
    screenSize: { width: 1024, height: 768 },
    maxTextureSize: 2048,
    hardwareAcceleration: false,
    memoryLimit: 'medium',
  };

  try {
    // Screen size and device type
    capabilities.screenSize = {
      width: window.innerWidth || screen.width,
      height: window.innerHeight || screen.height,
    };

    capabilities.pixelRatio = window.devicePixelRatio || 1;

    // Device type detection
    if (capabilities.screenSize.width <= 768) {
      capabilities.isMobile = true;
      capabilities.isDesktop = false;
    } else if (capabilities.screenSize.width <= 1024) {
      capabilities.isTablet = true;
      capabilities.isDesktop = false;
    }

    // Memory estimation based on device type and screen size
    const totalPixels = capabilities.screenSize.width * capabilities.screenSize.height;
    if (totalPixels < 500000 || capabilities.isMobile) {
      capabilities.memoryLimit = 'low';
    } else if (totalPixels > 2000000) {
      capabilities.memoryLimit = 'high';
    }

    // Hardware acceleration detection
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    capabilities.hardwareAcceleration = !!gl;

    if (gl) {
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      capabilities.maxTextureSize = maxTextureSize || 2048;
    }
  } catch (error) {
    console.warn('Error detecting device capabilities:', error);
  }

  return capabilities;
};

/**
 * Fallback implementations for unsupported features
 */
export class CompatibilityFallbacks {
  private static instance: CompatibilityFallbacks;
  private features: BrowserFeatures;
  private capabilities: DeviceCapabilities;

  constructor() {
    this.features = detectBrowserFeatures();
    this.capabilities = detectDeviceCapabilities();
  }

  static getInstance(): CompatibilityFallbacks {
    if (!CompatibilityFallbacks.instance) {
      CompatibilityFallbacks.instance = new CompatibilityFallbacks();
    }
    return CompatibilityFallbacks.instance;
  }

  /**
   * Get backdrop filter implementation with fallbacks
   */
  getBackdropFilterStyle(blur: number): React.CSSProperties {
    if (this.features.backdropFilter) {
      return {
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      };
    }

    // Fallback for browsers without backdrop-filter
    return {
      background: `rgba(255, 255, 255, ${Math.min(blur / 20, 0.8)})`,
      border: '1px solid rgba(255, 255, 255, 0.2)',
    };
  }

  /**
   * Get CSS filter implementation with fallbacks
   */
  getCSSFilterStyle(blur: number): React.CSSProperties {
    if (this.features.cssFilters) {
      return {
        filter: `blur(${blur}px)`,
        WebkitFilter: `blur(${blur}px)`,
      };
    }

    // Fallback for browsers without CSS filters
    return {
      opacity: Math.max(1 - (blur / 20), 0.2),
      transition: 'opacity 200ms ease-out',
    };
  }

  /**
   * Get transform implementation with hardware acceleration
   */
  getTransformStyle(x: number, y: number): React.CSSProperties {
    if (this.features.transform3d && this.capabilities.hardwareAcceleration) {
      return {
        transform: `translate3d(${x}px, ${y}px, 0)`,
        willChange: 'transform',
      };
    }

    // Fallback to 2D transforms
    return {
      transform: `translate(${x}px, ${y}px)`,
      position: 'relative' as const,
      left: x,
      top: y,
    };
  }

  /**
   * Get animation styles with reduced motion support
   */
  getAnimationStyle(duration: number, easing: string = 'ease-out'): React.CSSProperties {
    if (this.features.reducedMotion) {
      return {
        transition: 'none',
        animation: 'none',
      };
    }

    return {
      transition: `all ${duration}ms ${easing}`,
    };
  }

  /**
   * RequestAnimationFrame with fallbacks
   */
  requestAnimationFrame(callback: FrameRequestCallback): number {
    if (this.features.requestAnimationFrame) {
      return window.requestAnimationFrame(callback);
    }

    // Fallback using setTimeout
    return window.setTimeout(() => callback(Date.now()), 16) as unknown as number;
  }

  /**
   * CancelAnimationFrame with fallbacks
   */
  cancelAnimationFrame(id: number): void {
    if (this.features.requestAnimationFrame) {
      window.cancelAnimationFrame(id);
    } else {
      window.clearTimeout(id);
    }
  }

  /**
   * Get optimized performance settings based on device capabilities
   */
  getPerformanceSettings() {
    const settings = {
      maxBlurIntensity: 8,
      animationDuration: 200,
      throttleMs: 16,
      enableHardwareAcceleration: true,
      enableComplexAnimations: true,
      maxFocusRadius: 300,
    };

    // Adjust settings based on device capabilities
    if (this.capabilities.memoryLimit === 'low' || this.capabilities.isMobile) {
      settings.maxBlurIntensity = 4;
      settings.animationDuration = 100;
      settings.throttleMs = 33; // 30fps
      settings.enableComplexAnimations = false;
      settings.maxFocusRadius = 150;
    }

    if (!this.capabilities.hardwareAcceleration) {
      settings.enableHardwareAcceleration = false;
      settings.enableComplexAnimations = false;
    }

    return settings;
  }

  /**
   * Get touch-optimized settings for mobile devices
   */
  getTouchSettings() {
    return {
      useTouchEvents: this.features.touchSupport,
      crosshairSize: this.capabilities.isMobile ? 60 : 40,
      focusRingSize: this.capabilities.isMobile ? 80 : 50,
      tapToMoveEnabled: this.capabilities.isMobile,
      gestureSupport: this.features.touchSupport && this.features.pointerEvents,
    };
  }

  /**
   * Check if a feature is supported
   */
  isSupported(feature: keyof BrowserFeatures): boolean {
    return this.features[feature];
  }

  /**
   * Get device capability
   */
  getCapability<K extends keyof DeviceCapabilities>(capability: K): DeviceCapabilities[K] {
    return this.capabilities[capability];
  }
}

/**
 * Progressive enhancement utilities
 */
export class ProgressiveEnhancement {
  private compat: CompatibilityFallbacks;

  constructor() {
    this.compat = CompatibilityFallbacks.getInstance();
  }

  /**
   * Get viewfinder configuration optimized for current browser/device
   */
  getOptimizedViewfinderConfig() {
    const performanceSettings = this.compat.getPerformanceSettings();
    const touchSettings = this.compat.getTouchSettings();

    return {
      // Mouse tracking settings
      mouseTracking: {
        delay: touchSettings.useTouchEvents ? 50 : 100,
        throttleMs: performanceSettings.throttleMs,
        enableEasing: performanceSettings.enableComplexAnimations,
      },

      // Visual settings
      visual: {
        maxBlurIntensity: performanceSettings.maxBlurIntensity,
        crosshairSize: touchSettings.crosshairSize,
        focusRingSize: touchSettings.focusRingSize,
        enableHardwareAcceleration: performanceSettings.enableHardwareAcceleration,
      },

      // Animation settings
      animations: {
        duration: performanceSettings.animationDuration,
        enableComplexAnimations: performanceSettings.enableComplexAnimations,
        respectReducedMotion: true,
      },

      // Interaction settings
      interaction: {
        touchSupport: touchSettings.useTouchEvents,
        tapToMove: touchSettings.tapToMoveEnabled,
        gestureSupport: touchSettings.gestureSupport,
      },

      // Fallback settings
      fallbacks: {
        useBackdropFilter: this.compat.isSupported('backdropFilter'),
        useCSSFilters: this.compat.isSupported('cssFilters'),
        useTransform3d: this.compat.isSupported('transform3d'),
      },
    };
  }

  /**
   * Apply progressive enhancement to a component's styles
   */
  enhanceStyles(baseStyles: React.CSSProperties, enhancement?: {
    blur?: number;
    transform?: { x: number; y: number };
    animation?: { duration: number; easing?: string };
  }): React.CSSProperties {
    let enhancedStyles = { ...baseStyles };

    if (enhancement?.blur) {
      const blurStyle = this.compat.getCSSFilterStyle(enhancement.blur);
      enhancedStyles = { ...enhancedStyles, ...blurStyle };
    }

    if (enhancement?.transform) {
      const transformStyle = this.compat.getTransformStyle(
        enhancement.transform.x,
        enhancement.transform.y
      );
      enhancedStyles = { ...enhancedStyles, ...transformStyle };
    }

    if (enhancement?.animation) {
      const animationStyle = this.compat.getAnimationStyle(
        enhancement.animation.duration,
        enhancement.animation.easing
      );
      enhancedStyles = { ...enhancedStyles, ...animationStyle };
    }

    return enhancedStyles;
  }
}

/**
 * Browser-specific CSS utilities
 */
export const generateCompatCSS = (): string => {
  const compat = CompatibilityFallbacks.getInstance();

  return `
    /* Progressive enhancement for viewfinder */
    .viewfinder-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 40;
    }

    /* Hardware acceleration when supported */
    .viewfinder-element {
      ${compat.isSupported('transform3d') ? `
        transform: translate3d(0, 0, 0);
        will-change: transform;
      ` : `
        position: relative;
      `}
    }

    /* Backdrop filter with fallbacks */
    .blur-overlay {
      ${compat.isSupported('backdropFilter') ? `
        backdrop-filter: blur(var(--blur-amount, 8px));
        -webkit-backdrop-filter: blur(var(--blur-amount, 8px));
      ` : `
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      `}
    }

    /* CSS filters with fallbacks */
    .filter-blur {
      ${compat.isSupported('cssFilters') ? `
        filter: blur(var(--blur-amount, 4px));
        -webkit-filter: blur(var(--blur-amount, 4px));
      ` : `
        opacity: 0.6;
        transition: opacity 200ms ease-out;
      `}
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .viewfinder-element,
      .blur-overlay,
      .filter-blur {
        animation: none !important;
        transition: none !important;
      }
    }

    /* Touch device optimizations */
    @media (pointer: coarse) {
      .viewfinder-crosshair {
        width: 60px;
        height: 60px;
      }

      .viewfinder-focus-ring {
        width: 80px;
        height: 80px;
      }
    }

    /* High DPI display optimizations */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .viewfinder-crosshair svg {
        shape-rendering: crispEdges;
      }
    }
  `;
};

export default CompatibilityFallbacks;