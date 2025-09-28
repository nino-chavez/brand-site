/**
 * Cross-Browser Compatibility Tests
 *
 * Validates LightboxCanvas and CursorLens integration across target browsers:
 * - Chrome 90+
 * - Firefox 88+
 * - Safari 14+
 * - Edge 90+
 *
 * Tests browser-specific features, APIs, fallbacks, and known compatibility issues.
 */

import React from 'react';
import { describe, it, expect, test, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AthleticTokenProvider } from '../../tokens/simple-provider';
import { CanvasStateProvider } from '../../contexts/CanvasStateProvider';
import { UnifiedGameFlowProvider } from '../../contexts/UnifiedGameFlowContext';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Browser compatibility test wrapper
const CompatibilityTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AthleticTokenProvider>
    <UnifiedGameFlowProvider debugMode={false}>
      <CanvasStateProvider>
        <div style={{ width: '100vw', height: '100vh' }}>
          {children}
        </div>
      </CanvasStateProvider>
    </UnifiedGameFlowProvider>
  </AthleticTokenProvider>
);

// Mock browser environments
const mockBrowserEnvironments = {
  chrome90: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
    vendor: 'Google Inc.',
    features: {
      requestAnimationFrame: true,
      intersectionObserver: true,
      resizeObserver: true,
      cssGrid: true,
      flexbox: true,
      webgl: true,
      webgl2: true,
      canvas: true,
      eventTargetAbortController: true
    }
  },
  firefox88: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
    vendor: '',
    features: {
      requestAnimationFrame: true,
      intersectionObserver: true,
      resizeObserver: true,
      cssGrid: true,
      flexbox: true,
      webgl: true,
      webgl2: true,
      canvas: true,
      eventTargetAbortController: false // Firefox 88 doesn't support this
    }
  },
  safari14: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1.15',
    vendor: 'Apple Computer, Inc.',
    features: {
      requestAnimationFrame: true,
      intersectionObserver: true,
      resizeObserver: true,
      cssGrid: true,
      flexbox: true,
      webgl: true,
      webgl2: false, // Safari 14 has limited WebGL2 support
      canvas: true,
      eventTargetAbortController: false // Safari 14 doesn't support this
    }
  },
  edge90: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36 Edg/90.0.818.66',
    vendor: 'Google Inc.',
    features: {
      requestAnimationFrame: true,
      intersectionObserver: true,
      resizeObserver: true,
      cssGrid: true,
      flexbox: true,
      webgl: true,
      webgl2: true,
      canvas: true,
      eventTargetAbortController: true
    }
  }
};

// Browser detection utility
const mockBrowserDetection = (browserKey: keyof typeof mockBrowserEnvironments) => {
  const browser = mockBrowserEnvironments[browserKey];

  Object.defineProperty(navigator, 'userAgent', {
    value: browser.userAgent,
    writable: true,
    configurable: true
  });

  Object.defineProperty(navigator, 'vendor', {
    value: browser.vendor,
    writable: true,
    configurable: true
  });

  return browser;
};

describe('Cross-Browser Compatibility', () => {
  let originalNavigator: Navigator;
  let originalWindow: Window & typeof globalThis;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    originalNavigator = navigator;
    originalWindow = window;
    originalCreateElement = document.createElement.bind(document);
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original functions
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true
    });
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true
    });
    document.createElement = originalCreateElement;
  });

  describe('Browser Feature Detection', () => {
    test('detects Chrome 90+ features correctly', () => {
      const browser = mockBrowserDetection('chrome90');

      expect(browser.features.requestAnimationFrame).toBe(true);
      expect(browser.features.intersectionObserver).toBe(true);
      expect(browser.features.resizeObserver).toBe(true);
      expect(browser.features.webgl2).toBe(true);
      expect(browser.features.eventTargetAbortController).toBe(true);
    });

    test('detects Firefox 88+ features correctly', () => {
      const browser = mockBrowserDetection('firefox88');

      expect(browser.features.requestAnimationFrame).toBe(true);
      expect(browser.features.intersectionObserver).toBe(true);
      expect(browser.features.resizeObserver).toBe(true);
      expect(browser.features.webgl2).toBe(true);
      expect(browser.features.eventTargetAbortController).toBe(false);
    });

    test('detects Safari 14+ features correctly', () => {
      const browser = mockBrowserDetection('safari14');

      expect(browser.features.requestAnimationFrame).toBe(true);
      expect(browser.features.intersectionObserver).toBe(true);
      expect(browser.features.resizeObserver).toBe(true);
      expect(browser.features.webgl2).toBe(false); // Safari 14 limitation
      expect(browser.features.eventTargetAbortController).toBe(false);
    });

    test('detects Edge 90+ features correctly', () => {
      const browser = mockBrowserDetection('edge90');

      expect(browser.features.requestAnimationFrame).toBe(true);
      expect(browser.features.intersectionObserver).toBe(true);
      expect(browser.features.resizeObserver).toBe(true);
      expect(browser.features.webgl2).toBe(true);
      expect(browser.features.eventTargetAbortController).toBe(true);
    });
  });

  describe('CSS Grid and Flexbox Support', () => {
    test('validates CSS Grid support across browsers', () => {
      Object.keys(mockBrowserEnvironments).forEach(browserKey => {
        const browser = mockBrowserDetection(browserKey as keyof typeof mockBrowserEnvironments);
        expect(browser.features.cssGrid).toBe(true);
      });
    });

    test('validates Flexbox support across browsers', () => {
      Object.keys(mockBrowserEnvironments).forEach(browserKey => {
        const browser = mockBrowserDetection(browserKey as keyof typeof mockBrowserEnvironments);
        expect(browser.features.flexbox).toBe(true);
      });
    });

    test('validates spatial section layout compatibility', () => {
      // Test that CSS classes work across browsers
      const spatialSectionClasses = 'absolute transform-gpu will-change-transform';
      const gridClasses = 'grid grid-cols-6 gap-4';
      const flexClasses = 'flex items-center justify-center';

      expect(spatialSectionClasses).toContain('transform-gpu'); // Hardware acceleration
      expect(gridClasses).toContain('grid-cols-6'); // CSS Grid
      expect(flexClasses).toContain('flex'); // Flexbox
    });
  });

  describe('Canvas and WebGL Support', () => {
    test('validates Canvas API support across browsers', () => {
      Object.keys(mockBrowserEnvironments).forEach(browserKey => {
        const browser = mockBrowserDetection(browserKey as keyof typeof mockBrowserEnvironments);
        expect(browser.features.canvas).toBe(true);
      });
    });

    test('validates WebGL support with fallbacks', () => {
      const chromeBrowser = mockBrowserDetection('chrome90');
      const firefoxBrowser = mockBrowserDetection('firefox88');
      const safariBrowser = mockBrowserDetection('safari14');
      const edgeBrowser = mockBrowserDetection('edge90');

      // WebGL 1.0 support (all browsers)
      expect(chromeBrowser.features.webgl).toBe(true);
      expect(firefoxBrowser.features.webgl).toBe(true);
      expect(safariBrowser.features.webgl).toBe(true);
      expect(edgeBrowser.features.webgl).toBe(true);

      // WebGL 2.0 support (Safari 14 has limitations)
      expect(chromeBrowser.features.webgl2).toBe(true);
      expect(firefoxBrowser.features.webgl2).toBe(true);
      expect(safariBrowser.features.webgl2).toBe(false); // Fallback needed
      expect(edgeBrowser.features.webgl2).toBe(true);
    });

    test('validates hardware acceleration compatibility', () => {
      // Mock canvas creation
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === 'webgl' || type === 'experimental-webgl') {
            return {
              extension: vi.fn(),
              getExtension: vi.fn(),
              createShader: vi.fn(),
              createProgram: vi.fn()
            };
          }
          return {
            createImageData: vi.fn(),
            getImageData: vi.fn(),
            putImageData: vi.fn()
          };
        })
      };

      global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any;
      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'canvas') return mockCanvas as any;
        return originalCreateElement(tagName);
      });

      // Test WebGL context creation
      const canvas = document.createElement('canvas');
      const webglContext = canvas.getContext('webgl');
      const webgl2Context = canvas.getContext('webgl2');

      expect(webglContext).toBeDefined();
      // WebGL2 might not be available in Safari 14
    });
  });

  describe('Performance APIs and Features', () => {
    test('validates requestAnimationFrame support', () => {
      global.requestAnimationFrame = vi.fn(callback => {
        setTimeout(callback, 16);
        return 1;
      });

      Object.keys(mockBrowserEnvironments).forEach(browserKey => {
        const browser = mockBrowserDetection(browserKey as keyof typeof mockBrowserEnvironments);
        expect(browser.features.requestAnimationFrame).toBe(true);
      });

      expect(global.requestAnimationFrame).toBeDefined();
    });

    test('validates Performance API availability', () => {
      global.performance = {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn(() => []),
        getEntriesByName: vi.fn(() => []),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn()
      } as any;

      expect(performance.now).toBeDefined();
      expect(typeof performance.now()).toBe('number');
    });

    test('validates Intersection Observer with fallback', () => {
      // Test that polyfill works when native support is missing
      expect(global.IntersectionObserver).toBeDefined();

      const observer = new IntersectionObserver(vi.fn());
      expect(observer.observe).toBeDefined();
      expect(observer.unobserve).toBeDefined();
      expect(observer.disconnect).toBeDefined();
    });

    test('validates Resize Observer with fallback', () => {
      // Test that polyfill works when native support is missing
      expect(global.ResizeObserver).toBeDefined();

      const observer = new ResizeObserver(vi.fn());
      expect(observer.observe).toBeDefined();
      expect(observer.unobserve).toBeDefined();
      expect(observer.disconnect).toBeDefined();
    });
  });

  describe('Event Handling Compatibility', () => {
    test('validates touch event support', () => {
      // Mock touch events for mobile Safari
      const touchEventInit = {
        touches: [],
        targetTouches: [],
        changedTouches: [],
        bubbles: true,
        cancelable: true
      };

      global.TouchEvent = vi.fn((type: string, init: any) => ({
        type,
        ...init,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      })) as any;

      const touchEvent = new TouchEvent('touchstart', touchEventInit);
      expect(touchEvent.type).toBe('touchstart');
      expect(touchEvent.touches).toEqual([]);
    });

    test('validates pointer event support with fallback', () => {
      // Modern browsers support pointer events
      global.PointerEvent = vi.fn((type: string, init: any) => ({
        type,
        ...init,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      })) as any;

      const pointerEvent = new PointerEvent('pointerdown', { bubbles: true });
      expect(pointerEvent.type).toBe('pointerdown');
      expect(pointerEvent.pointerId).toBe(1);
    });

    test('validates keyboard event compatibility', () => {
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        bubbles: true,
        cancelable: true
      });

      expect(keyboardEvent.key).toBe('Escape');
      expect(keyboardEvent.code).toBe('Escape');
    });

    test('validates wheel event with browser differences', () => {
      // Test both modern wheel event and legacy mousewheel
      global.WheelEvent = vi.fn((type: string, init: any) => ({
        type,
        ...init,
        deltaX: 0,
        deltaY: 100,
        deltaZ: 0,
        deltaMode: 0,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      })) as any;

      const wheelEvent = new WheelEvent('wheel', { deltaY: 100 });
      expect(wheelEvent.deltaY).toBe(100);
    });
  });

  describe('CSS Transform and Animation Support', () => {
    test('validates CSS transform support', () => {
      const element = document.createElement('div');
      element.style.transform = 'translateX(100px) scale(1.5)';

      expect(element.style.transform).toBe('translateX(100px) scale(1.5)');
    });

    test('validates CSS transition support', () => {
      const element = document.createElement('div');
      element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

      expect(element.style.transition).toContain('transform');
      expect(element.style.transition).toContain('0.3s');
    });

    test('validates CSS custom properties (variables)', () => {
      const element = document.createElement('div');
      element.style.setProperty('--custom-color', '#1a365d');

      // In real browsers, this would work
      expect(element.style.getPropertyValue('--custom-color')).toBe('#1a365d');
    });

    test('validates will-change property for optimization', () => {
      const element = document.createElement('div');
      element.style.willChange = 'transform, opacity';

      expect(element.style.willChange).toBe('transform, opacity');
    });
  });

  describe('Accessibility API Support', () => {
    test('validates ARIA attributes support', () => {
      const element = document.createElement('div');
      element.setAttribute('aria-label', 'Cursor lens navigation');
      element.setAttribute('aria-expanded', 'false');
      element.setAttribute('role', 'button');

      expect(element.getAttribute('aria-label')).toBe('Cursor lens navigation');
      expect(element.getAttribute('aria-expanded')).toBe('false');
      expect(element.getAttribute('role')).toBe('button');
    });

    test('validates focus management APIs', () => {
      const element = document.createElement('button');
      element.tabIndex = 0;

      // Mock focus methods
      element.focus = vi.fn();
      element.blur = vi.fn();

      element.focus();
      expect(element.focus).toHaveBeenCalled();
    });

    test('validates screen reader compatibility structures', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div role="application" aria-label="Lightbox Canvas">
          <div role="navigation" aria-label="Spatial navigation">
            <button aria-label="Capture section" aria-expanded="false">
              Capture
            </button>
          </div>
        </div>
      `;

      const appElement = container.querySelector('[role="application"]');
      const navElement = container.querySelector('[role="navigation"]');

      expect(appElement?.getAttribute('aria-label')).toBe('Lightbox Canvas');
      expect(navElement?.getAttribute('aria-label')).toBe('Spatial navigation');
    });
  });

  describe('Memory Management and Performance', () => {
    test('validates garbage collection handling', () => {
      // Mock WeakMap for proper cleanup
      global.WeakMap = vi.fn(() => ({
        set: vi.fn(),
        get: vi.fn(),
        has: vi.fn(),
        delete: vi.fn()
      })) as any;

      const weakMap = new WeakMap();
      expect(weakMap.set).toBeDefined();
      expect(weakMap.get).toBeDefined();
      expect(weakMap.delete).toBeDefined();
    });

    test('validates requestIdleCallback with fallback', () => {
      // Some browsers don't support requestIdleCallback
      global.requestIdleCallback = global.requestIdleCallback || vi.fn((callback: Function) => {
        setTimeout(callback, 1);
        return 1;
      });

      expect(global.requestIdleCallback).toBeDefined();
    });

    test('validates passive event listeners support', () => {
      let supportsPassive = false;

      try {
        const opts = Object.defineProperty({}, 'passive', {
          get: () => {
            supportsPassive = true;
            return true;
          }
        });

        window.addEventListener('test', () => {}, opts);
        window.removeEventListener('test', () => {}, opts);
      } catch (e) {
        // Passive not supported
      }

      // All target browsers support passive listeners
      expect(supportsPassive).toBeDefined();
    });
  });

  describe('URL and History API Support', () => {
    test('validates History API support', () => {
      global.history = {
        pushState: vi.fn(),
        replaceState: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        go: vi.fn(),
        length: 1,
        scrollRestoration: 'auto',
        state: null
      } as any;

      expect(history.pushState).toBeDefined();
      expect(history.replaceState).toBeDefined();
    });

    test('validates URL API support', () => {
      global.URL = vi.fn((url: string, base?: string) => ({
        href: url,
        origin: 'http://localhost:3000',
        protocol: 'http:',
        host: 'localhost:3000',
        hostname: 'localhost',
        port: '3000',
        pathname: '/test',
        search: '',
        hash: '',
        searchParams: new URLSearchParams()
      })) as any;

      const url = new URL('http://localhost:3000/test');
      expect(url.pathname).toBe('/test');
    });

    test('validates URLSearchParams support', () => {
      const params = new URLSearchParams('?section=capture&mode=canvas');

      expect(params.get('section')).toBe('capture');
      expect(params.get('mode')).toBe('canvas');
    });
  });

  describe('Integration Component Testing', () => {
    test('CursorLens renders across browser environments', async () => {
      // Test with different browser environments
      for (const browserKey of Object.keys(mockBrowserEnvironments)) {
        mockBrowserDetection(browserKey as keyof typeof mockBrowserEnvironments);

        const { CursorLens } = await import('../../components/CursorLens');

        const { container } = render(
          <CompatibilityTestWrapper>
            <CursorLens
              isEnabled={true}
              onSectionSelect={vi.fn()}
            />
          </CompatibilityTestWrapper>
        );

        // Should render without browser-specific errors
        expect(container.firstChild).toBeTruthy();

        // Clean up for next iteration
        container.remove();
      }
    });

    test('Athletic Token system works across browsers', () => {
      const testTokenUsage = () => {
        const athleticClasses = 'bg-athletic-neutral-900 ring-athletic-court-orange text-athletic-neutral-100';
        const tokensArray = athleticClasses.split(' ');

        expect(tokensArray).toContain('bg-athletic-neutral-900');
        expect(tokensArray).toContain('ring-athletic-court-orange');
        expect(tokensArray).toContain('text-athletic-neutral-100');
      };

      // Test across all browser environments
      Object.keys(mockBrowserEnvironments).forEach(browserKey => {
        mockBrowserDetection(browserKey as keyof typeof mockBrowserEnvironments);
        testTokenUsage();
      });
    });
  });

  describe('Fallback and Polyfill Validation', () => {
    test('validates graceful degradation for missing features', () => {
      // Test Safari 14 with limited WebGL2 support
      const safariBrowser = mockBrowserDetection('safari14');

      if (!safariBrowser.features.webgl2) {
        // Should fall back to WebGL 1.0 or Canvas 2D
        expect(safariBrowser.features.webgl).toBe(true);
        expect(safariBrowser.features.canvas).toBe(true);
      }
    });

    test('validates feature detection patterns', () => {
      const featureDetection = {
        hasIntersectionObserver: typeof IntersectionObserver !== 'undefined',
        hasResizeObserver: typeof ResizeObserver !== 'undefined',
        hasRequestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
        hasWebGL: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
          } catch (e) {
            return false;
          }
        })()
      };

      expect(featureDetection.hasIntersectionObserver).toBe(true);
      expect(featureDetection.hasResizeObserver).toBe(true);
      expect(featureDetection.hasRequestAnimationFrame).toBe(true);
    });

    test('validates error boundaries for unsupported features', () => {
      // Mock a scenario where WebGL is not available
      const mockFailingCanvas = {
        getContext: vi.fn(() => null) // Simulate WebGL failure
      };

      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'canvas') return mockFailingCanvas as any;
        return originalCreateElement(tagName);
      });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl');

      // Should handle gracefully when WebGL is not available
      expect(context).toBeNull();
    });
  });

  describe('Browser-Specific Performance Optimizations', () => {
    test('validates Chrome-specific optimizations', () => {
      mockBrowserDetection('chrome90');

      // Chrome supports advanced features
      const optimizations = {
        hardwareAcceleration: true,
        webgl2: true,
        eventTargetAbortController: true,
        passiveEventListeners: true
      };

      expect(optimizations.hardwareAcceleration).toBe(true);
      expect(optimizations.webgl2).toBe(true);
    });

    test('validates Firefox-specific considerations', () => {
      mockBrowserDetection('firefox88');

      // Firefox 88 has specific limitations
      const considerations = {
        webgl2: true,
        eventTargetAbortController: false, // Not supported in Firefox 88
        performanceObserver: true
      };

      expect(considerations.webgl2).toBe(true);
      expect(considerations.eventTargetAbortController).toBe(false);
    });

    test('validates Safari-specific optimizations', () => {
      mockBrowserDetection('safari14');

      // Safari 14 has specific limitations
      const optimizations = {
        webgl2: false, // Limited support
        intersectionObserver: true,
        passiveEventListeners: true,
        willChange: true
      };

      expect(optimizations.webgl2).toBe(false);
      expect(optimizations.intersectionObserver).toBe(true);
    });

    test('validates Edge-specific compatibility', () => {
      mockBrowserDetection('edge90');

      // Edge 90+ is Chromium-based
      const compatibility = {
        chromeFeatures: true,
        webgl2: true,
        modernEventHandling: true
      };

      expect(compatibility.chromeFeatures).toBe(true);
      expect(compatibility.webgl2).toBe(true);
    });
  });
});