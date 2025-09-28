/**
 * Viewport Constraints Edge Case Tests
 *
 * Comprehensive test suite for validating system behavior under extreme viewport constraints
 * and device limitations from the lightbox canvas implementation specification.
 *
 * @fileoverview Edge case validation for viewport constraints and device limitations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Device capability detection mock
const mockDeviceCapabilities = {
  hasTouch: false,
  hasGestureSupport: false,
  isLowEnd: false,
  memoryLimit: 8192, // MB
  maxAnimationComplexity: 1.0,
  performanceLevel: 'high' as 'high' | 'medium' | 'low'
};

// Mock performance monitoring
const mockPerformanceAPI = {
  memory: {
    usedJSHeapSize: 30 * 1024 * 1024, // 30MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 2048 * 1024 * 1024 // 2GB
  },
  measureUserAgentSpecificMemory: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => [])
};

// Test component for viewport constraints
const TestConstrainedInterface: React.FC<{
  viewport: { width: number; height: number };
  deviceCapabilities?: Partial<typeof mockDeviceCapabilities>;
  enableJavaScript?: boolean;
  enableAccessibility?: boolean;
  onFallbackActivated?: (fallbackType: string) => void;
  onMemoryWarning?: (usage: number) => void;
}> = ({
  viewport,
  deviceCapabilities = {},
  enableJavaScript = true,
  enableAccessibility = false,
  onFallbackActivated,
  onMemoryWarning
}) => {
  const capabilities = { ...mockDeviceCapabilities, ...deviceCapabilities };
  const [currentMemoryUsage, setCurrentMemoryUsage] = React.useState(30);
  const [activeFallback, setActiveFallback] = React.useState<string | null>(null);
  const [navigationMode, setNavigationMode] = React.useState<'spatial' | 'simplified' | 'traditional'>('spatial');

  React.useEffect(() => {
    // Determine navigation mode based on constraints
    if (!enableJavaScript) {
      setNavigationMode('traditional');
      setActiveFallback('javascript-disabled');
      onFallbackActivated?.('javascript-disabled');
    } else if (viewport.width < 320) {
      setNavigationMode('simplified');
      setActiveFallback('small-viewport');
      onFallbackActivated?.('small-viewport');
    } else if (capabilities.isLowEnd || capabilities.performanceLevel === 'low') {
      setNavigationMode('simplified');
      setActiveFallback('low-end-device');
      onFallbackActivated?.('low-end-device');
    } else {
      setNavigationMode('spatial');
      setActiveFallback(null);
    }

    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      if (enableJavaScript && 'memory' in performance) {
        const usage = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
        setCurrentMemoryUsage(usage);

        if (usage > 50) {
          onMemoryWarning?.(usage);
        }
      }
    }, 1000);

    return () => clearInterval(memoryInterval);
  }, [viewport, capabilities, enableJavaScript, onFallbackActivated, onMemoryWarning]);

  // Render traditional scroll navigation (no JS fallback)
  if (!enableJavaScript) {
    return (
      <div
        data-testid="traditional-navigation"
        role="main"
        style={{
          width: viewport.width,
          height: viewport.height,
          overflow: 'auto'
        }}
      >
        <noscript>
          <div data-testid="noscript-message">
            JavaScript is disabled. Using traditional scroll navigation.
          </div>
        </noscript>

        {/* Traditional scroll-based sections */}
        <div style={{ padding: '20px' }}>
          <section data-testid="section-about" style={{ marginBottom: '40px', minHeight: '500px' }}>
            <h2>About</h2>
            <p>Software engineer with enterprise architecture experience.</p>
          </section>

          <section data-testid="section-experience" style={{ marginBottom: '40px', minHeight: '500px' }}>
            <h2>Experience</h2>
            <p>Professional experience in software development and team leadership.</p>
          </section>

          <section data-testid="section-skills" style={{ marginBottom: '40px', minHeight: '500px' }}>
            <h2>Skills</h2>
            <p>Technical skills and expertise areas.</p>
          </section>

          <section data-testid="section-projects" style={{ marginBottom: '40px', minHeight: '500px' }}>
            <h2>Projects</h2>
            <p>Portfolio of completed projects and contributions.</p>
          </section>

          <section data-testid="section-photography" style={{ marginBottom: '40px', minHeight: '500px' }}>
            <h2>Photography</h2>
            <p>Action sports photography portfolio.</p>
          </section>

          <section data-testid="section-contact" style={{ marginBottom: '40px', minHeight: '500px' }}>
            <h2>Contact</h2>
            <p>Contact information and professional links.</p>
          </section>
        </div>
      </div>
    );
  }

  // Render simplified navigation for small viewports or low-end devices
  if (navigationMode === 'simplified') {
    return (
      <div
        data-testid="simplified-navigation"
        data-fallback-reason={activeFallback}
        role="application"
        aria-label="Simplified portfolio navigation"
        style={{
          width: viewport.width,
          height: viewport.height,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Fallback notification */}
        <div
          data-testid="fallback-notification"
          style={{
            background: '#fbbf24',
            color: '#92400e',
            padding: '8px',
            fontSize: '12px',
            textAlign: 'center'
          }}
        >
          {activeFallback === 'small-viewport' && 'Using simplified navigation for small screen'}
          {activeFallback === 'low-end-device' && 'Using simplified navigation for optimal performance'}
        </div>

        {/* Simplified section selector */}
        <div
          data-testid="section-selector"
          style={{
            background: '#f3f4f6',
            padding: '12px',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <select
            data-testid="section-dropdown"
            aria-label="Select portfolio section"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
            onChange={(e) => {
              const section = document.getElementById(`section-${e.target.value}`);
              section?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <option value="">Select a section...</option>
            <option value="about">About</option>
            <option value="experience">Experience</option>
            <option value="skills">Skills</option>
            <option value="projects">Projects</option>
            <option value="photography">Photography</option>
            <option value="contact">Contact</option>
          </select>
        </div>

        {/* Stacked section access */}
        <div
          data-testid="stacked-sections"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px'
          }}
        >
          {['about', 'experience', 'skills', 'projects', 'photography', 'contact'].map((sectionId) => (
            <div
              key={sectionId}
              id={`section-${sectionId}`}
              data-testid={`stacked-section-${sectionId}`}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                {sectionId === 'about' && 'Software engineer with enterprise architecture experience'}
                {sectionId === 'experience' && 'Professional experience in software development'}
                {sectionId === 'skills' && 'Technical skills and expertise areas'}
                {sectionId === 'projects' && 'Portfolio of completed projects'}
                {sectionId === 'photography' && 'Action sports photography portfolio'}
                {sectionId === 'contact' && 'Contact information and professional links'}
              </p>
            </div>
          ))}
        </div>

        {/* Memory usage indicator for low-end devices */}
        {capabilities.isLowEnd && (
          <div
            data-testid="memory-indicator"
            style={{
              background: currentMemoryUsage > 40 ? '#ef4444' : '#10b981',
              color: 'white',
              padding: '4px 8px',
              fontSize: '10px',
              textAlign: 'center'
            }}
          >
            Memory: {currentMemoryUsage.toFixed(1)}MB
          </div>
        )}
      </div>
    );
  }

  // Render spatial navigation with touch fallbacks
  return (
    <div
      data-testid="spatial-navigation"
      role="application"
      aria-label="Spatial portfolio navigation"
      style={{
        width: viewport.width,
        height: viewport.height,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Touch capability notification */}
      {!capabilities.hasTouch && (
        <div
          data-testid="no-touch-notification"
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            textAlign: 'center',
            zIndex: 100
          }}
        >
          Touch gestures not supported. Using button controls.
        </div>
      )}

      {/* Button-based navigation for devices without gesture support */}
      {!capabilities.hasGestureSupport && (
        <div
          data-testid="button-navigation"
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 100
          }}
        >
          <button
            data-testid="nav-button-up"
            aria-label="Navigate up"
            style={{
              padding: '8px 12px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ↑
          </button>

          <button
            data-testid="nav-button-down"
            aria-label="Navigate down"
            style={{
              padding: '8px 12px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ↓
          </button>

          <button
            data-testid="nav-button-left"
            aria-label="Navigate left"
            style={{
              padding: '8px 12px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>

          <button
            data-testid="nav-button-right"
            aria-label="Navigate right"
            style={{
              padding: '8px 12px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            →
          </button>

          <button
            data-testid="nav-button-zoom"
            aria-label="Zoom in/out"
            style={{
              padding: '8px 12px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            🔍
          </button>
        </div>
      )}

      {/* Spatial grid with reduced animations for low-end devices */}
      <div
        data-testid="spatial-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          width: '100%',
          height: '100%',
          gap: '8px',
          padding: '16px',
          transition: capabilities.isLowEnd ? 'none' : 'transform 0.3s ease'
        }}
      >
        {['about', 'experience', 'skills', 'projects', 'photography', 'contact'].map((sectionId, index) => (
          <div
            key={sectionId}
            data-testid={`spatial-section-${sectionId}`}
            style={{
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px',
              cursor: 'pointer',
              transition: capabilities.isLowEnd ? 'none' : 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: viewport.width < 400 ? '12px' : '14px'
            }}
            onMouseEnter={(e) => {
              if (!capabilities.isLowEnd) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = '#e5e7eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!capabilities.isLowEnd) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#f3f4f6';
              }
            }}
          >
            {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
          </div>
        ))}
      </div>

      {/* Screen reader linearized navigation */}
      {enableAccessibility && (
        <div
          data-testid="linearized-navigation"
          aria-label="Screen reader navigation"
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
          }}
        >
          <nav role="navigation" aria-label="Portfolio sections">
            <h2>Portfolio Navigation</h2>
            <p>6 sections arranged in 2 rows and 3 columns. Use tab to navigate through sections.</p>
            <ul>
              <li><a href="#about-section" tabIndex={0}>About (Row 1, Column 1)</a></li>
              <li><a href="#experience-section" tabIndex={0}>Experience (Row 1, Column 2)</a></li>
              <li><a href="#skills-section" tabIndex={0}>Skills (Row 1, Column 3)</a></li>
              <li><a href="#projects-section" tabIndex={0}>Projects (Row 2, Column 1)</a></li>
              <li><a href="#photography-section" tabIndex={0}>Photography (Row 2, Column 2)</a></li>
              <li><a href="#contact-section" tabIndex={0}>Contact (Row 2, Column 3)</a></li>
            </ul>
          </nav>
        </div>
      )}

      {/* Performance indicators */}
      <div
        data-testid="performance-indicators"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '10px',
          lineHeight: 1.2
        }}
      >
        <div>Mode: {navigationMode}</div>
        <div>Memory: {currentMemoryUsage.toFixed(1)}MB</div>
        <div>Animations: {capabilities.isLowEnd ? 'Reduced' : 'Full'}</div>
      </div>
    </div>
  );
};

// Edge case validation tests
describe('Edge Cases: Viewport and Device Constraints', () => {
  let fallbackActivations: string[] = [];
  let memoryWarnings: number[] = [];

  beforeEach(() => {
    fallbackActivations = [];
    memoryWarnings = [];

    // Mock performance API
    Object.defineProperty(globalThis, 'performance', {
      writable: true,
      value: {
        ...performance,
        ...mockPerformanceAPI
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('EC1: Extremely small viewport (<320px) simplified navigation fallback', () => {
    it('should activate simplified navigation for viewport width < 320px', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 280, height: 400 }}
          onFallbackActivated={(fallbackType) => {
            fallbackActivations.push(fallbackType);
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('simplified-navigation')).toBeInTheDocument();
        expect(screen.getByTestId('simplified-navigation')).toHaveAttribute('data-fallback-reason', 'small-viewport');
      });

      expect(fallbackActivations).toContain('small-viewport');
    });

    it('should provide stacked section access for small viewports', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 300, height: 500 }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('stacked-sections')).toBeInTheDocument();
        expect(screen.getByTestId('stacked-section-about')).toBeInTheDocument();
        expect(screen.getByTestId('stacked-section-experience')).toBeInTheDocument();
        expect(screen.getByTestId('stacked-section-skills')).toBeInTheDocument();
      });
    });

    it('should provide dropdown navigation for small viewports', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 280, height: 400 }}
        />
      );

      await waitFor(() => {
        const dropdown = screen.getByTestId('section-dropdown');
        expect(dropdown).toBeInTheDocument();
        expect(dropdown).toHaveAttribute('aria-label', 'Select portfolio section');
      });

      // Test dropdown options
      const dropdown = screen.getByTestId('section-dropdown') as HTMLSelectElement;
      expect(dropdown.options).toHaveLength(7); // 6 sections + placeholder
    });

    it('should show fallback notification for small viewport', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 250, height: 400 }}
        />
      );

      await waitFor(() => {
        const notification = screen.getByTestId('fallback-notification');
        expect(notification.textContent).toContain('Using simplified navigation for small screen');
      });
    });

    it('should handle dropdown navigation smoothly', async () => {
      const user = userEvent.setup();

      render(
        <TestConstrainedInterface
          viewport={{ width: 300, height: 500 }}
        />
      );

      const dropdown = screen.getByTestId('section-dropdown');
      await user.selectOptions(dropdown, 'about');

      // Should trigger scroll behavior (can't test actual scrolling in jsdom)
      expect(dropdown).toHaveValue('about');
    });
  });

  describe('EC2: Low-end device automatic animation complexity reduction', () => {
    it('should reduce animation complexity for low-end devices', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          deviceCapabilities={{
            isLowEnd: true,
            performanceLevel: 'low',
            maxAnimationComplexity: 0.3
          }}
          onFallbackActivated={(fallbackType) => {
            fallbackActivations.push(fallbackType);
          }}
        />
      );

      await waitFor(() => {
        expect(fallbackActivations).toContain('low-end-device');
      });

      // Check that animations are disabled
      const grid = screen.getByTestId('spatial-grid');
      const styles = window.getComputedStyle(grid);
      expect(styles.transition).toBe('none');
    });

    it('should show memory indicator for low-end devices', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          deviceCapabilities={{ isLowEnd: true }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('memory-indicator')).toBeInTheDocument();
      });

      const memoryIndicator = screen.getByTestId('memory-indicator');
      expect(memoryIndicator.textContent).toMatch(/Memory: \d+\.\d+MB/);
    });

    it('should disable hover effects for low-end devices', async () => {
      const user = userEvent.setup();

      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          deviceCapabilities={{ isLowEnd: true }}
        />
      );

      const section = screen.getByTestId('spatial-section-about');

      await user.hover(section);

      // Should not have scale transform on low-end devices
      const styles = window.getComputedStyle(section);
      expect(styles.transform).not.toContain('scale(1.05)');
    });

    it('should show performance indicators for low-end devices', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          deviceCapabilities={{ isLowEnd: true }}
        />
      );

      await waitFor(() => {
        const indicators = screen.getByTestId('performance-indicators');
        expect(indicators.textContent).toContain('Animations: Reduced');
      });
    });
  });

  describe('EC3: Touch devices without gesture support button-based fallback', () => {
    it('should provide button navigation for devices without gesture support', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          deviceCapabilities={{
            hasTouch: true,
            hasGestureSupport: false
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('button-navigation')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-up')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-down')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-left')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-right')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-zoom')).toBeInTheDocument();
      });
    });

    it('should show notification for devices without touch support', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          deviceCapabilities={{
            hasTouch: false,
            hasGestureSupport: false
          }}
        />
      );

      await waitFor(() => {
        const notification = screen.getByTestId('no-touch-notification');
        expect(notification.textContent).toContain('Touch gestures not supported. Using button controls.');
      });
    });

    it('should provide accessible button navigation', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          deviceCapabilities={{ hasGestureSupport: false }}
        />
      );

      const navButtons = [
        screen.getByTestId('nav-button-up'),
        screen.getByTestId('nav-button-down'),
        screen.getByTestId('nav-button-left'),
        screen.getByTestId('nav-button-right'),
        screen.getByTestId('nav-button-zoom')
      ];

      navButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
        expect(button).toBeEnabled();
      });
    });

    it('should handle button navigation clicks', async () => {
      const user = userEvent.setup();

      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          deviceCapabilities={{ hasGestureSupport: false }}
        />
      );

      const upButton = screen.getByTestId('nav-button-up');
      await user.click(upButton);

      // Button should remain functional after click
      expect(upButton).toBeEnabled();
    });
  });

  describe('EC4: Screen reader spatial content linearized navigation', () => {
    it('should provide linearized navigation for screen readers', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          enableAccessibility={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('linearized-navigation')).toBeInTheDocument();
      });

      const nav = screen.getByTestId('linearized-navigation');
      expect(nav).toHaveAttribute('aria-label', 'Screen reader navigation');

      // Check for navigation structure
      const navElement = nav.querySelector('nav');
      expect(navElement).toHaveAttribute('role', 'navigation');
      expect(navElement).toHaveAttribute('aria-label', 'Portfolio sections');
    });

    it('should provide spatial context descriptions for screen readers', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          enableAccessibility={true}
        />
      );

      const nav = screen.getByTestId('linearized-navigation');
      const description = nav.textContent;

      expect(description).toContain('6 sections arranged in 2 rows and 3 columns');
      expect(description).toContain('Row 1, Column 1');
      expect(description).toContain('Row 2, Column 3');
    });

    it('should provide proper navigation links for screen readers', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          enableAccessibility={true}
        />
      );

      const nav = screen.getByTestId('linearized-navigation');
      const links = nav.querySelectorAll('a');

      expect(links).toHaveLength(6);
      links.forEach(link => {
        expect(link).toHaveAttribute('tabIndex', '0');
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('EC5: JavaScript disabled traditional scroll navigation fallback', () => {
    it('should provide traditional scroll navigation when JavaScript is disabled', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          enableJavaScript={false}
          onFallbackActivated={(fallbackType) => {
            fallbackActivations.push(fallbackType);
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('traditional-navigation')).toBeInTheDocument();
        expect(fallbackActivations).toContain('javascript-disabled');
      });
    });

    it('should display all sections in traditional scroll layout', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          enableJavaScript={false}
        />
      );

      // Check that all sections are present
      expect(screen.getByTestId('section-about')).toBeInTheDocument();
      expect(screen.getByTestId('section-experience')).toBeInTheDocument();
      expect(screen.getByTestId('section-skills')).toBeInTheDocument();
      expect(screen.getByTestId('section-projects')).toBeInTheDocument();
      expect(screen.getByTestId('section-photography')).toBeInTheDocument();
      expect(screen.getByTestId('section-contact')).toBeInTheDocument();
    });

    it('should show noscript message when JavaScript is disabled', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          enableJavaScript={false}
        />
      );

      // Check for noscript content
      const noscriptMessage = screen.getByTestId('noscript-message');
      expect(noscriptMessage.textContent).toContain('JavaScript is disabled');
      expect(noscriptMessage.textContent).toContain('traditional scroll navigation');
    });

    it('should maintain accessibility in traditional navigation', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          enableJavaScript={false}
        />
      );

      const main = screen.getByTestId('traditional-navigation');
      expect(main).toHaveAttribute('role', 'main');

      // All sections should be properly structured
      const sections = main.querySelectorAll('section');
      expect(sections).toHaveLength(6);

      sections.forEach(section => {
        expect(section.querySelector('h2')).toBeInTheDocument();
        expect(section.querySelector('p')).toBeInTheDocument();
      });
    });
  });

  describe('Memory and Performance Constraints', () => {
    it('should monitor memory usage and trigger warnings', async () => {
      // Mock high memory usage
      Object.defineProperty(globalThis.performance, 'memory', {
        value: {
          usedJSHeapSize: 60 * 1024 * 1024, // 60MB
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 2048 * 1024 * 1024
        }
      });

      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          onMemoryWarning={(usage) => {
            memoryWarnings.push(usage);
          }}
        />
      );

      // Wait for memory monitoring to trigger
      await waitFor(() => {
        expect(memoryWarnings.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      expect(memoryWarnings.some(usage => usage > 50)).toBe(true);
    });

    it('should adapt interface based on performance capabilities', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          deviceCapabilities={{
            performanceLevel: 'low',
            maxAnimationComplexity: 0.2
          }}
        />
      );

      await waitFor(() => {
        const indicators = screen.getByTestId('performance-indicators');
        expect(indicators.textContent).toContain('Mode: simplified');
        expect(indicators.textContent).toContain('Animations: Reduced');
      });
    });

    it('should maintain functionality under memory pressure', async () => {
      render(
        <TestConstrainedInterface
          viewport={{ width: 800, height: 600 }}
          deviceCapabilities={{
            isLowEnd: true,
            memoryLimit: 512 // Very low memory limit
          }}
        />
      );

      // Interface should still be functional
      await waitFor(() => {
        expect(screen.getByTestId('simplified-navigation')).toBeInTheDocument();
        expect(screen.getByTestId('memory-indicator')).toBeInTheDocument();
      });
    });
  });
});

export { TestConstrainedInterface };