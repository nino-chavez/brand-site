import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectBrowserFeatures,
  detectDeviceCapabilities,
  CompatibilityFallbacks,
  ProgressiveEnhancement,
  generateCompatCSS,
} from '../utils/browserCompat';

describe('Browser Compatibility Utilities', () => {
  beforeEach(() => {
    // Mock browser APIs for consistent testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock navigator
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  describe('detectBrowserFeatures', () => {
    it('should detect basic browser features', () => {
      const features = detectBrowserFeatures();

      expect(features).toHaveProperty('backdropFilter');
      expect(features).toHaveProperty('transform3d');
      expect(features).toHaveProperty('requestAnimationFrame');
      expect(features).toHaveProperty('intersectionObserver');
      expect(features).toHaveProperty('cssFilters');
      expect(typeof features.backdropFilter).toBe('boolean');
      expect(typeof features.transform3d).toBe('boolean');
    });

    it('should handle feature detection errors gracefully', () => {
      // Mock document.createElement to throw error
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const features = detectBrowserFeatures();

      // Should still return valid structure with defaults
      expect(features).toHaveProperty('backdropFilter', false);
      expect(features).toHaveProperty('transform3d', false);

      // Restore original method
      document.createElement = originalCreateElement;
    });

    it('should detect touch support correctly', () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        value: () => {},
        configurable: true,
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 1,
        configurable: true,
      });

      const features = detectBrowserFeatures();
      expect(features.touchSupport).toBe(true);
    });

    it('should detect reduced motion preference', () => {
      // Mock reduced motion preference
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
      }));

      const features = detectBrowserFeatures();
      expect(features.reducedMotion).toBe(true);
    });
  });

  describe('detectDeviceCapabilities', () => {
    it('should detect desktop device correctly', () => {
      const capabilities = detectDeviceCapabilities();

      expect(capabilities.isDesktop).toBe(true);
      expect(capabilities.isMobile).toBe(false);
      expect(capabilities.isTablet).toBe(false);
      expect(capabilities.screenSize).toEqual({ width: 1024, height: 768 });
    });

    it('should detect mobile device correctly', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });

      const capabilities = detectDeviceCapabilities();

      expect(capabilities.isMobile).toBe(true);
      expect(capabilities.isDesktop).toBe(false);
      expect(capabilities.memoryLimit).toBe('low');
    });

    it('should detect tablet device correctly', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1024, configurable: true });

      const capabilities = detectDeviceCapabilities();

      expect(capabilities.isTablet).toBe(true);
      expect(capabilities.isDesktop).toBe(false);
    });

    it('should detect hardware acceleration', () => {
      // Mock WebGL context
      const mockWebGLContext = {
        getParameter: vi.fn().mockReturnValue(2048),
        MAX_TEXTURE_SIZE: 0x0D33,
      };

      HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType) => {
        if (contextType === 'webgl' || contextType === 'experimental-webgl') {
          return mockWebGLContext;
        }
        return null;
      });

      const capabilities = detectDeviceCapabilities();

      expect(capabilities.hardwareAcceleration).toBe(true);
      expect(capabilities.maxTextureSize).toBe(2048);
    });
  });

  describe('CompatibilityFallbacks', () => {
    let compat: CompatibilityFallbacks;

    beforeEach(() => {
      compat = CompatibilityFallbacks.getInstance();
    });

    it('should be a singleton', () => {
      const instance1 = CompatibilityFallbacks.getInstance();
      const instance2 = CompatibilityFallbacks.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should provide backdrop filter styles', () => {
      const style = compat.getBackdropFilterStyle(10);

      expect(style).toBeDefined();
      expect(typeof style).toBe('object');
    });

    it('should provide CSS filter styles', () => {
      const style = compat.getCSSFilterStyle(5);

      expect(style).toBeDefined();
      expect(typeof style).toBe('object');
    });

    it('should provide transform styles with hardware acceleration', () => {
      const style = compat.getTransformStyle(100, 200);

      expect(style).toBeDefined();
      expect(style).toHaveProperty('transform');
    });

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
      }));

      const freshCompat = new CompatibilityFallbacks();
      const style = freshCompat.getAnimationStyle(300);

      expect(style.transition).toBe('none');
      expect(style.animation).toBe('none');
    });

    it('should provide performance settings based on device capabilities', () => {
      const settings = compat.getPerformanceSettings();

      expect(settings).toHaveProperty('maxBlurIntensity');
      expect(settings).toHaveProperty('animationDuration');
      expect(settings).toHaveProperty('throttleMs');
      expect(settings).toHaveProperty('enableHardwareAcceleration');
      expect(typeof settings.maxBlurIntensity).toBe('number');
      expect(typeof settings.animationDuration).toBe('number');
    });

    it('should provide touch-optimized settings', () => {
      const settings = compat.getTouchSettings();

      expect(settings).toHaveProperty('useTouchEvents');
      expect(settings).toHaveProperty('crosshairSize');
      expect(settings).toHaveProperty('focusRingSize');
      expect(settings).toHaveProperty('tapToMoveEnabled');
      expect(typeof settings.crosshairSize).toBe('number');
    });

    it('should handle requestAnimationFrame with fallbacks', () => {
      const callback = vi.fn();
      const id = compat.requestAnimationFrame(callback);

      expect(typeof id).toBe('number');

      compat.cancelAnimationFrame(id);
    });
  });

  describe('ProgressiveEnhancement', () => {
    let enhancement: ProgressiveEnhancement;

    beforeEach(() => {
      enhancement = new ProgressiveEnhancement();
    });

    it('should provide optimized viewfinder configuration', () => {
      const config = enhancement.getOptimizedViewfinderConfig();

      expect(config).toHaveProperty('mouseTracking');
      expect(config).toHaveProperty('visual');
      expect(config).toHaveProperty('animations');
      expect(config).toHaveProperty('interaction');
      expect(config).toHaveProperty('fallbacks');

      expect(config.mouseTracking).toHaveProperty('delay');
      expect(config.mouseTracking).toHaveProperty('throttleMs');
      expect(config.visual).toHaveProperty('maxBlurIntensity');
      expect(config.animations).toHaveProperty('duration');
    });

    it('should enhance styles with blur effects', () => {
      const baseStyles = { color: 'white' };
      const enhancedStyles = enhancement.enhanceStyles(baseStyles, {
        blur: 5,
      });

      expect(enhancedStyles).toEqual(expect.objectContaining(baseStyles));
      expect(Object.keys(enhancedStyles).length).toBeGreaterThan(Object.keys(baseStyles).length);
    });

    it('should enhance styles with transforms', () => {
      const baseStyles = { color: 'white' };
      const enhancedStyles = enhancement.enhanceStyles(baseStyles, {
        transform: { x: 10, y: 20 },
      });

      expect(enhancedStyles).toEqual(expect.objectContaining(baseStyles));
      expect(enhancedStyles).toHaveProperty('transform');
    });

    it('should enhance styles with animations', () => {
      const baseStyles = { color: 'white' };
      const enhancedStyles = enhancement.enhanceStyles(baseStyles, {
        animation: { duration: 300, easing: 'ease-in-out' },
      });

      expect(enhancedStyles).toEqual(expect.objectContaining(baseStyles));
    });
  });

  describe('generateCompatCSS', () => {
    it('should generate valid CSS string', () => {
      const css = generateCompatCSS();

      expect(typeof css).toBe('string');
      expect(css.length).toBeGreaterThan(0);
      expect(css).toContain('.viewfinder-overlay');
      expect(css).toContain('.blur-overlay');
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    });

    it('should include progressive enhancement styles', () => {
      const css = generateCompatCSS();

      expect(css).toContain('Hardware acceleration when supported');
      expect(css).toContain('Backdrop filter with fallbacks');
      expect(css).toContain('Touch device optimizations');
      expect(css).toContain('High DPI display optimizations');
    });
  });
});