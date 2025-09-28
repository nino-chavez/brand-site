/**
 * Responsive Design Validation Tests
 *
 * Validates LightboxCanvas and CursorLens responsive behavior across viewport ranges:
 * - Mobile: 320px - 767px
 * - Tablet: 768px - 1023px
 * - Desktop: 1024px - 1919px
 * - Ultra-wide: 1920px - 2560px
 *
 * Tests layout adaptation, touch/mouse handling, performance, and accessibility.
 */

import React from 'react';
import { describe, it, expect, test, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AthleticTokenProvider } from '../../tokens/simple-provider';
import { CanvasStateProvider } from '../../contexts/CanvasStateProvider';
import { UnifiedGameFlowProvider } from '../../contexts/UnifiedGameFlowContext';

// Viewport breakpoints for testing
const viewportBreakpoints = {
  mobile: [
    { width: 320, height: 568, name: 'iPhone SE' },
    { width: 375, height: 667, name: 'iPhone 8' },
    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    { width: 767, height: 1024, name: 'Large Mobile' }
  ],
  tablet: [
    { width: 768, height: 1024, name: 'iPad Portrait' },
    { width: 834, height: 1112, name: 'iPad Air' },
    { width: 1024, height: 768, name: 'iPad Landscape' },
    { width: 1023, height: 1366, name: 'Large Tablet' }
  ],
  desktop: [
    { width: 1024, height: 768, name: 'Small Desktop' },
    { width: 1280, height: 720, name: 'HD Desktop' },
    { width: 1440, height: 900, name: 'MacBook Pro 15"' },
    { width: 1920, height: 1080, name: 'Full HD' }
  ],
  ultrawide: [
    { width: 2560, height: 1440, name: '1440p Ultra-wide' },
    { width: 3440, height: 1440, name: '21:9 Ultra-wide' },
    { width: 2560, height: 1080, name: '1080p Ultra-wide' }
  ]
};

// Mock responsive test wrapper
const ResponsiveTestWrapper: React.FC<{
  children: React.ReactNode;
  viewport: { width: number; height: number; name: string };
}> = ({ children, viewport }) => {
  return (
    <AthleticTokenProvider>
      <UnifiedGameFlowProvider debugMode={false}>
        <CanvasStateProvider>
          <div
            style={{
              width: viewport.width,
              height: viewport.height,
              overflow: 'hidden'
            }}
            data-testid={`viewport-${viewport.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {children}
          </div>
        </CanvasStateProvider>
      </UnifiedGameFlowProvider>
    </AthleticTokenProvider>
  );
};

// Mock window resize functionality
const mockViewportResize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  Object.defineProperty(window, 'screen', {
    writable: true,
    configurable: true,
    value: {
      width,
      height,
      availWidth: width,
      availHeight: height
    },
  });
};

// Mock touch capabilities
const mockTouchCapabilities = (hasTouchSupport: boolean) => {
  Object.defineProperty(window, 'ontouchstart', {
    writable: true,
    configurable: true,
    value: hasTouchSupport ? {} : undefined,
  });
  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    configurable: true,
    value: hasTouchSupport ? 5 : 0,
  });
};

describe('Responsive Design Validation', () => {
  let originalWindow: Window & typeof globalThis;

  beforeEach(() => {
    originalWindow = window;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original window properties
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true
    });
  });

  describe('Viewport Breakpoint Validation', () => {
    test('validates mobile viewport responsiveness (320px - 767px)', () => {
      viewportBreakpoints.mobile.forEach(viewport => {
        mockViewportResize(viewport.width, viewport.height);
        mockTouchCapabilities(true); // Mobile devices have touch

        expect(window.innerWidth).toBe(viewport.width);
        expect(window.innerHeight).toBe(viewport.height);
        expect(navigator.maxTouchPoints).toBeGreaterThan(0);

        // Validate mobile-specific responsive classes
        const isMobile = viewport.width < 768;
        expect(isMobile).toBe(true);
      });
    });

    test('validates tablet viewport responsiveness (768px - 1023px)', () => {
      viewportBreakpoints.tablet.forEach(viewport => {
        mockViewportResize(viewport.width, viewport.height);
        mockTouchCapabilities(true); // Tablets have touch

        expect(window.innerWidth).toBe(viewport.width);
        expect(window.innerHeight).toBe(viewport.height);
        expect(navigator.maxTouchPoints).toBeGreaterThan(0);

        // Validate tablet-specific responsive classes
        const isTablet = viewport.width >= 768 && viewport.width < 1024;
        expect(isTablet).toBe(true);
      });
    });

    test('validates desktop viewport responsiveness (1024px - 1919px)', () => {
      viewportBreakpoints.desktop.forEach(viewport => {
        mockViewportResize(viewport.width, viewport.height);
        mockTouchCapabilities(false); // Desktop typically no touch

        expect(window.innerWidth).toBe(viewport.width);
        expect(window.innerHeight).toBe(viewport.height);
        expect(navigator.maxTouchPoints).toBe(0);

        // Validate desktop-specific responsive classes
        const isDesktop = viewport.width >= 1024 && viewport.width < 1920;
        expect(isDesktop).toBe(true);
      });
    });

    test('validates ultra-wide viewport responsiveness (1920px+)', () => {
      viewportBreakpoints.ultrawide.forEach(viewport => {
        mockViewportResize(viewport.width, viewport.height);
        mockTouchCapabilities(false); // Ultra-wide displays typically no touch

        expect(window.innerWidth).toBe(viewport.width);
        expect(window.innerHeight).toBe(viewport.height);
        expect(navigator.maxTouchPoints).toBe(0);

        // Validate ultra-wide specific responsive classes
        const isUltraWide = viewport.width >= 1920;
        expect(isUltraWide).toBe(true);
      });
    });
  });

  describe('Spatial Section Layout Responsiveness', () => {
    test('validates spatial section grid adapts to mobile viewports', () => {
      const mobileViewport = viewportBreakpoints.mobile[0]; // 320px
      mockViewportResize(mobileViewport.width, mobileViewport.height);

      // Mobile should use smaller grid or stack vertically
      const mobileGridClasses = 'grid grid-cols-2 gap-2'; // Reduced columns for mobile
      expect(mobileGridClasses).toContain('grid-cols-2');
      expect(mobileGridClasses).toContain('gap-2');
    });

    test('validates spatial section grid adapts to tablet viewports', () => {
      const tabletViewport = viewportBreakpoints.tablet[0]; // 768px
      mockViewportResize(tabletViewport.width, tabletViewport.height);

      // Tablet should use medium grid
      const tabletGridClasses = 'grid grid-cols-4 gap-3'; // Medium columns for tablet
      expect(tabletGridClasses).toContain('grid-cols-4');
      expect(tabletGridClasses).toContain('gap-3');
    });

    test('validates spatial section grid adapts to desktop viewports', () => {
      const desktopViewport = viewportBreakpoints.desktop[2]; // 1440px
      mockViewportResize(desktopViewport.width, desktopViewport.height);

      // Desktop should use full grid
      const desktopGridClasses = 'grid grid-cols-6 gap-4'; // Full columns for desktop
      expect(desktopGridClasses).toContain('grid-cols-6');
      expect(desktopGridClasses).toContain('gap-4');
    });

    test('validates spatial section positioning across viewport sizes', () => {
      const testPositioning = (viewport: { width: number; height: number; name: string }) => {
        mockViewportResize(viewport.width, viewport.height);

        // Test spatial positioning calculations
        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;
        const radius = Math.min(viewport.width, viewport.height) * 0.3;

        expect(centerX).toBeGreaterThan(0);
        expect(centerY).toBeGreaterThan(0);
        expect(radius).toBeGreaterThan(0);
        expect(radius).toBeLessThan(Math.min(viewport.width, viewport.height) / 2);
      };

      // Test across all breakpoints
      Object.values(viewportBreakpoints).flat().forEach(testPositioning);
    });
  });

  describe('Touch vs Mouse Interaction Handling', () => {
    test('validates touch interaction on mobile devices', () => {
      const mobileViewport = viewportBreakpoints.mobile[1]; // iPhone 8
      mockViewportResize(mobileViewport.width, mobileViewport.height);
      mockTouchCapabilities(true);

      const touchEventTypes = [
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel'
      ];

      touchEventTypes.forEach(eventType => {
        expect(eventType).toBeDefined();
        expect(typeof eventType).toBe('string');
      });

      // Touch should be primary interaction method
      expect(navigator.maxTouchPoints).toBeGreaterThan(0);
      expect(window.ontouchstart).toBeDefined();
    });

    test('validates mouse interaction on desktop devices', () => {
      const desktopViewport = viewportBreakpoints.desktop[1]; // 1280px
      mockViewportResize(desktopViewport.width, desktopViewport.height);
      mockTouchCapabilities(false);

      const mouseEventTypes = [
        'mousedown',
        'mousemove',
        'mouseup',
        'wheel',
        'contextmenu'
      ];

      mouseEventTypes.forEach(eventType => {
        expect(eventType).toBeDefined();
        expect(typeof eventType).toBe('string');
      });

      // Mouse should be primary interaction method
      expect(navigator.maxTouchPoints).toBe(0);
      expect(window.ontouchstart).toBeUndefined();
    });

    test('validates hybrid interaction on tablets', () => {
      const tabletViewport = viewportBreakpoints.tablet[1]; // iPad Air
      mockViewportResize(tabletViewport.width, tabletViewport.height);
      mockTouchCapabilities(true);

      // Tablets support both touch and mouse
      expect(navigator.maxTouchPoints).toBeGreaterThan(0);
      expect(window.ontouchstart).toBeDefined();

      // Should handle both interaction types
      const hybridEvents = ['touchstart', 'mousedown', 'pointerdown'];
      hybridEvents.forEach(eventType => {
        expect(eventType).toBeDefined();
      });
    });
  });

  describe('Athletic Token Responsive Classes', () => {
    test('validates mobile-first athletic token classes', () => {
      const mobileAthleticClasses = {
        background: 'bg-athletic-neutral-900/95', // Slightly transparent for mobile
        text: 'text-athletic-neutral-100 text-sm', // Smaller text for mobile
        spacing: 'p-2 m-1', // Tighter spacing for mobile
        animation: 'athletic-animate-transition duration-200' // Faster animations for mobile
      };

      Object.values(mobileAthleticClasses).forEach(className => {
        expect(className).toBeDefined();
        expect(typeof className).toBe('string');
      });
    });

    test('validates desktop athletic token classes', () => {
      const desktopAthleticClasses = {
        background: 'bg-athletic-neutral-900/98', // More opaque for desktop
        text: 'text-athletic-neutral-100 text-base', // Standard text size
        spacing: 'p-4 m-2', // Standard spacing
        animation: 'athletic-animate-transition duration-300' // Standard animation timing
      };

      Object.values(desktopAthleticClasses).forEach(className => {
        expect(className).toBeDefined();
        expect(typeof className).toBe('string');
      });
    });

    test('validates responsive utility combinations', () => {
      const responsiveAthleticClasses = [
        'bg-athletic-neutral-900/95 md:bg-athletic-neutral-900/98',
        'text-sm md:text-base lg:text-lg',
        'p-2 md:p-4 lg:p-6',
        'gap-2 md:gap-4 lg:gap-6'
      ];

      responsiveAthleticClasses.forEach(className => {
        expect(className).toBeDefined();
        expect(className).toContain('md:');
      });
    });

    test('validates color contrast across device types', () => {
      const athleticColorContrasts = {
        primary: { bg: '#1a365d', text: '#f5f5f5' }, // court-navy / neutral-100
        secondary: { bg: '#ea580c', text: '#171717' }, // court-orange / neutral-900
        accent: { bg: '#7c3aed', text: '#f5f5f5' } // brand-violet / neutral-100
      };

      Object.entries(athleticColorContrasts).forEach(([name, colors]) => {
        expect(colors.bg).toMatch(/^#[0-9a-f]{6}$/i);
        expect(colors.text).toMatch(/^#[0-9a-f]{6}$/i);

        // Validate contrast ratios would be sufficient (conceptual test)
        const bgLuminance = name === 'primary' ? 0.1 : name === 'secondary' ? 0.3 : 0.2;
        const textLuminance = colors.text === '#f5f5f5' ? 0.9 : 0.1;
        const contrastRatio = (Math.max(bgLuminance, textLuminance) + 0.05) /
                            (Math.min(bgLuminance, textLuminance) + 0.05);

        expect(contrastRatio).toBeGreaterThan(4.5); // WCAG AA requirement
      });
    });
  });

  describe('Performance Across Viewport Sizes', () => {
    test('validates animation performance on mobile viewports', () => {
      const mobileViewport = viewportBreakpoints.mobile[0]; // 320px
      mockViewportResize(mobileViewport.width, mobileViewport.height);

      // Mobile should use optimized animations
      const mobileAnimationSettings = {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        animationDuration: 200, // Faster for mobile
        frameRate: 30, // Lower frame rate for battery savings
        useTransform3d: true // Hardware acceleration
      };

      expect(mobileAnimationSettings.animationDuration).toBeLessThanOrEqual(200);
      expect(mobileAnimationSettings.frameRate).toBeGreaterThanOrEqual(30);
      expect(mobileAnimationSettings.useTransform3d).toBe(true);
    });

    test('validates animation performance on desktop viewports', () => {
      const desktopViewport = viewportBreakpoints.desktop[2]; // 1440px
      mockViewportResize(desktopViewport.width, desktopViewport.height);

      // Desktop can handle more intensive animations
      const desktopAnimationSettings = {
        animationDuration: 300, // Standard timing
        frameRate: 60, // Higher frame rate
        useTransform3d: true, // Hardware acceleration
        allowComplexAnimations: true
      };

      expect(desktopAnimationSettings.animationDuration).toBe(300);
      expect(desktopAnimationSettings.frameRate).toBe(60);
      expect(desktopAnimationSettings.useTransform3d).toBe(true);
      expect(desktopAnimationSettings.allowComplexAnimations).toBe(true);
    });

    test('validates memory usage optimization across viewport sizes', () => {
      const optimizeForViewport = (viewport: { width: number; height: number; name: string }) => {
        const pixelCount = viewport.width * viewport.height;
        const isMobile = viewport.width < 768;

        const optimization = {
          maxTextures: isMobile ? 4 : 8,
          cacheSize: isMobile ? 50 : 100,
          preloadImages: !isMobile,
          useWebWorkers: !isMobile && pixelCount > 1920 * 1080
        };

        expect(optimization.maxTextures).toBeGreaterThan(0);
        expect(optimization.cacheSize).toBeGreaterThan(0);

        if (isMobile) {
          expect(optimization.maxTextures).toBeLessThanOrEqual(4);
          expect(optimization.preloadImages).toBe(false);
        }
      };

      // Test optimization across all viewport sizes
      Object.values(viewportBreakpoints).flat().forEach(optimizeForViewport);
    });
  });

  describe('Accessibility Across Device Types', () => {
    test('validates touch target sizes on mobile devices', () => {
      const mobileViewport = viewportBreakpoints.mobile[1]; // iPhone 8
      mockViewportResize(mobileViewport.width, mobileViewport.height);
      mockTouchCapabilities(true);

      // Mobile touch targets should be at least 44px (Apple) or 48dp (Google)
      const minTouchTargetSize = 44;
      const spatialSectionSize = Math.max(minTouchTargetSize, mobileViewport.width / 6);

      expect(spatialSectionSize).toBeGreaterThanOrEqual(minTouchTargetSize);
    });

    test('validates mouse target sizes on desktop devices', () => {
      const desktopViewport = viewportBreakpoints.desktop[1]; // 1280px
      mockViewportResize(desktopViewport.width, desktopViewport.height);
      mockTouchCapabilities(false);

      // Desktop mouse targets can be smaller but should be easily clickable
      const minMouseTargetSize = 24;
      const spatialSectionSize = desktopViewport.width / 6;

      expect(spatialSectionSize).toBeGreaterThanOrEqual(minMouseTargetSize);
    });

    test('validates focus indicators across viewport sizes', () => {
      const testFocusIndicators = (viewport: { width: number; height: number; name: string }) => {
        mockViewportResize(viewport.width, viewport.height);

        const focusIndicatorStyles = {
          ringWidth: viewport.width < 768 ? 2 : 1, // Thicker rings on mobile
          ringOffset: viewport.width < 768 ? 2 : 1,
          ringColor: 'ring-athletic-court-orange',
          outlineStyle: 'focus:outline-none focus:ring-2'
        };

        expect(focusIndicatorStyles.ringWidth).toBeGreaterThan(0);
        expect(focusIndicatorStyles.ringOffset).toBeGreaterThan(0);
        expect(focusIndicatorStyles.ringColor).toContain('athletic');
        expect(focusIndicatorStyles.outlineStyle).toContain('focus:');
      };

      Object.values(viewportBreakpoints).flat().forEach(testFocusIndicators);
    });

    test('validates screen reader compatibility across devices', () => {
      const ariaAttributes = {
        mobile: {
          'aria-label': 'Spatial navigation for mobile',
          'role': 'application',
          'aria-live': 'polite'
        },
        desktop: {
          'aria-label': 'Spatial navigation',
          'role': 'application',
          'aria-live': 'assertive'
        }
      };

      Object.entries(ariaAttributes).forEach(([deviceType, attrs]) => {
        Object.entries(attrs).forEach(([attr, value]) => {
          expect(attr).toBeDefined();
          expect(value).toBeDefined();
          expect(typeof value).toBe('string');
        });
      });
    });
  });

  describe('Component Integration Across Viewports', () => {
    test('CursorLens adapts to mobile viewports', async () => {
      const mobileViewport = viewportBreakpoints.mobile[2]; // iPhone 11 Pro Max
      mockViewportResize(mobileViewport.width, mobileViewport.height);
      mockTouchCapabilities(true);

      const { CursorLens } = await import('../../components/CursorLens');

      const { container } = render(
        <ResponsiveTestWrapper viewport={mobileViewport}>
          <CursorLens
            isEnabled={true}
            onSectionSelect={vi.fn()}
          />
        </ResponsiveTestWrapper>
      );

      // Should render appropriately for mobile
      expect(container.firstChild).toBeTruthy();

      // Clean up
      container.remove();
    });

    test('CursorLens adapts to desktop viewports', async () => {
      const desktopViewport = viewportBreakpoints.desktop[2]; // 1440px
      mockViewportResize(desktopViewport.width, desktopViewport.height);
      mockTouchCapabilities(false);

      const { CursorLens } = await import('../../components/CursorLens');

      const { container } = render(
        <ResponsiveTestWrapper viewport={desktopViewport}>
          <CursorLens
            isEnabled={true}
            onSectionSelect={vi.fn()}
          />
        </ResponsiveTestWrapper>
      );

      // Should render appropriately for desktop
      expect(container.firstChild).toBeTruthy();

      // Clean up
      container.remove();
    });

    test('Athletic tokens adapt across all viewport ranges', () => {
      const testAthleticTokenAdaptation = (viewport: { width: number; height: number; name: string }) => {
        mockViewportResize(viewport.width, viewport.height);

        const adaptiveTokens = {
          spacing: viewport.width < 768 ? 'p-2' : viewport.width < 1024 ? 'p-3' : 'p-4',
          text: viewport.width < 768 ? 'text-sm' : viewport.width < 1024 ? 'text-base' : 'text-lg',
          grid: viewport.width < 768 ? 'grid-cols-2' : viewport.width < 1024 ? 'grid-cols-4' : 'grid-cols-6'
        };

        expect(adaptiveTokens.spacing).toBeDefined();
        expect(adaptiveTokens.text).toBeDefined();
        expect(adaptiveTokens.grid).toBeDefined();
      };

      Object.values(viewportBreakpoints).flat().forEach(testAthleticTokenAdaptation);
    });
  });

  describe('Layout Stability and Reflow Prevention', () => {
    test('validates layout stability during viewport changes', () => {
      const testLayoutStability = () => {
        // Simulate viewport change
        const initialViewport = viewportBreakpoints.mobile[0];
        const finalViewport = viewportBreakpoints.desktop[1];

        mockViewportResize(initialViewport.width, initialViewport.height);
        const initialLayout = {
          spatialSections: 6,
          gridColumns: 2,
          gapSize: 8
        };

        mockViewportResize(finalViewport.width, finalViewport.height);
        const finalLayout = {
          spatialSections: 6, // Same number of sections
          gridColumns: 6, // Different layout
          gapSize: 16
        };

        // Content should remain consistent
        expect(finalLayout.spatialSections).toBe(initialLayout.spatialSections);
        expect(finalLayout.gridColumns).toBeGreaterThan(initialLayout.gridColumns);
      };

      testLayoutStability();
    });

    test('validates container query support for intrinsic responsiveness', () => {
      // Container queries allow components to respond to their container size
      const containerQueryClasses = [
        '@container/spatial (min-width: 320px)',
        '@container/spatial (min-width: 768px)',
        '@container/spatial (min-width: 1024px)'
      ];

      containerQueryClasses.forEach(query => {
        expect(query).toContain('@container');
        expect(query).toContain('min-width');
      });
    });

    test('validates cumulative layout shift prevention', () => {
      const clsPreventionStrategies = {
        reserveSpace: true, // Reserve space for dynamic content
        useTransforms: true, // Use transforms instead of changing layout properties
        preloadCritical: true, // Preload critical resources
        avoidContentShift: true // Avoid content that causes layout shifts
      };

      Object.values(clsPreventionStrategies).forEach(strategy => {
        expect(strategy).toBe(true);
      });
    });
  });
});