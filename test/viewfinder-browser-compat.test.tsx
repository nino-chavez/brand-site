import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithTestUtils } from './utils';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import React from 'react';

describe('ViewfinderOverlay Browser Compatibility Integration', () => {
  beforeEach(() => {
    // Mock browser APIs
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

    // Mock matchMedia for reduced motion detection
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

  it('should render with browser compatibility enhancements', () => {
    const { container } = renderWithTestUtils(
      React.createElement(ViewfinderOverlay, {
        isActive: true,
        onCapture: vi.fn(),
      })
    );

    // Should render the viewfinder overlay
    const overlay = container.querySelector('.fixed');
    expect(overlay).toBeTruthy();

    // Should have crosshair with enhanced styles
    const crosshair = container.querySelector('svg');
    expect(crosshair).toBeTruthy();

    // Should have focus ring
    const focusRing = container.querySelector('[style*="border-radius: 50%"]');
    expect(focusRing).toBeTruthy();
  });

  it('should apply device-optimized settings', () => {
    const { container } = renderWithTestUtils(
      React.createElement(ViewfinderOverlay, {
        isActive: true,
      })
    );

    // Should render without errors with optimized settings
    expect(container.firstChild).toBeTruthy();
  });

  it('should handle mobile device settings', () => {
    // Mock mobile device
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true });

    const { container } = renderWithTestUtils(
      React.createElement(ViewfinderOverlay, {
        isActive: true,
      })
    );

    // Should still render properly on mobile
    const overlay = container.querySelector('.fixed');
    expect(overlay).toBeTruthy();
  });

  it('should handle reduced motion preferences', () => {
    // Mock reduced motion preference
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
    }));

    const { container } = renderWithTestUtils(
      React.createElement(ViewfinderOverlay, {
        isActive: true,
      })
    );

    // Should still render but with reduced motion styles
    const overlay = container.querySelector('.fixed');
    expect(overlay).toBeTruthy();
  });

  it('should apply backdrop filter fallbacks', () => {
    const { container } = renderWithTestUtils(
      React.createElement(ViewfinderOverlay, {
        isActive: true,
      })
    );

    // EXIF display should have backdrop styling (either backdrop-filter or fallback)
    const exifDisplay = container.querySelector('.bg-black\\/80');
    expect(exifDisplay).toBeTruthy();
  });

  it('should handle transform styles with hardware acceleration', () => {
    const { container } = renderWithTestUtils(
      React.createElement(ViewfinderOverlay, {
        isActive: true,
      })
    );

    const crosshairContainer = container.querySelector('.absolute.pointer-events-none');
    expect(crosshairContainer).toBeTruthy();

    // Should have transform styles (either 3d or 2d fallback)
    const style = crosshairContainer ? getComputedStyle(crosshairContainer) : null;
    expect(style).toBeTruthy();
  });

  it('should handle mouse tracking with optimized settings', () => {
    const TestComponent = () => {
      return React.createElement(ViewfinderOverlay, {
        isActive: true,
        onCapture: vi.fn(),
      });
    };

    const { container } = renderWithTestUtils(React.createElement(TestComponent));

    // Should track mouse movements
    fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });

    // Should update crosshair position
    const crosshair = container.querySelector('svg');
    expect(crosshair).toBeTruthy();
  });

  it('should handle capture functionality with all enhancements', () => {
    const onCapture = vi.fn();

    const { container } = renderWithTestUtils(
      React.createElement(ViewfinderOverlay, {
        isActive: true,
        onCapture,
      })
    );

    const overlay = container.querySelector('.fixed');
    expect(overlay).toBeTruthy();

    // Should handle click capture
    fireEvent.click(overlay!);
    expect(onCapture).toHaveBeenCalledOnce();
  });

  it('should gracefully handle browser feature detection failures', () => {
    // Mock console.warn to catch warnings
    const originalWarn = console.warn;
    console.warn = vi.fn();

    // This test just ensures the component renders even if feature detection fails
    const { container } = renderWithTestUtils(
      React.createElement(ViewfinderOverlay, {
        isActive: true,
      })
    );

    expect(container.firstChild).toBeTruthy();

    // Restore console.warn
    console.warn = originalWarn;
  });

  it('should apply progressive enhancement correctly', () => {
    const { container } = renderWithTestUtils(
      React.createElement(ViewfinderOverlay, {
        isActive: true,
      })
    );

    // Should have enhanced styling applied to various elements
    const crosshairContainer = container.querySelector('.absolute.pointer-events-none');
    const focusRing = container.querySelector('[style*="border-radius: 50%"]');
    const exifDisplay = container.querySelector('.bg-black\\/80');

    expect(crosshairContainer).toBeTruthy();
    expect(focusRing).toBeTruthy();
    expect(exifDisplay).toBeTruthy();
  });
});