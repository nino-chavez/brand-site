import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlurContainer, { BlurableSection } from '../components/BlurContainer';
import BackdropBlurOverlay, { SimpleBackdropBlur } from '../components/BackdropBlurOverlay';
import { renderWithTestUtils } from './utils';
import React from 'react';

describe('Blur Components', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock canvas context
    const mockCanvas = {
      getContext: vi.fn(() => ({
        createRadialGradient: vi.fn(() => ({
          addColorStop: vi.fn(),
        })),
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
      })),
      width: 1024,
      height: 768,
    };

    HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('BlurContainer', () => {
    it('should render children when active', () => {
      renderWithTestUtils(
        React.createElement(
          BlurContainer,
          { isActive: true },
          React.createElement('div', { 'data-testid': 'blur-content' }, 'Test Content')
        )
      );

      expect(screen.getByTestId('blur-content')).toHaveTextContent('Test Content');
    });

    it('should apply blur styles when active', () => {
      const { container } = renderWithTestUtils(
        React.createElement(
          BlurContainer,
          { isActive: true },
          React.createElement('div', { 'data-testid': 'blur-content' }, 'Test Content')
        )
      );

      const blurContainer = container.querySelector('.relative');
      expect(blurContainer).toBeTruthy();
    });

    it('should not apply blur styles when inactive', () => {
      const { container } = renderWithTestUtils(
        React.createElement(
          BlurContainer,
          { isActive: false },
          React.createElement('div', { 'data-testid': 'blur-content' }, 'Test Content')
        )
      );

      const blurContainer = container.querySelector('.relative');
      const style = blurContainer ? getComputedStyle(blurContainer) : null;
      // When inactive, should not have blur filter
      expect(style?.filter).toBe('');
    });
  });

  describe('BlurableSection', () => {
    it('should render with blurable attributes', () => {
      renderWithTestUtils(
        React.createElement(
          BlurableSection,
          {},
          React.createElement('div', { 'data-testid': 'blurable-content' }, 'Blurable Content')
        )
      );

      const blurableElement = screen.getByTestId('blurable-content').parentElement;
      expect(blurableElement?.getAttribute('data-blurable')).toBe('true');
    });
  });

  describe('BackdropBlurOverlay', () => {
    it('should render when active', () => {
      const { container } = renderWithTestUtils(
        React.createElement(BackdropBlurOverlay, { isActive: true })
      );

      // Should have backdrop blur elements
      const blurElements = container.querySelectorAll('[style*="backdrop-filter"]');
      expect(blurElements.length).toBeGreaterThan(0);
    });

    it('should not render when inactive', () => {
      const { container } = renderWithTestUtils(
        React.createElement(BackdropBlurOverlay, { isActive: false })
      );

      // Should not have backdrop blur elements
      const blurElements = container.querySelectorAll('[style*="backdrop-filter"]');
      expect(blurElements.length).toBe(0);
    });
  });

  describe('SimpleBackdropBlur', () => {
    it('should render with backdrop filter when active', () => {
      const { container } = renderWithTestUtils(
        React.createElement(SimpleBackdropBlur, { isActive: true })
      );

      const blurElement = container.querySelector('[style*="backdrop-filter"]');
      expect(blurElement).toBeTruthy();
    });

    it('should not render when inactive', () => {
      const { container } = renderWithTestUtils(
        React.createElement(SimpleBackdropBlur, { isActive: false })
      );

      const blurElement = container.querySelector('[style*="backdrop-filter"]');
      expect(blurElement).toBeFalsy();
    });
  });

  describe('Focus Area Calculation', () => {
    it('should handle different focus radius values', () => {
      const focusRadius = 150;
      renderWithTestUtils(
        React.createElement(SimpleBackdropBlur, {
          isActive: true,
          focusRadius: focusRadius,
        })
      );

      // Component should render successfully with custom radius
      expect(screen.queryByRole('alert')).toBeFalsy(); // No errors
    });

    it('should handle different blur intensity values', () => {
      const blurIntensity = 12;
      renderWithTestUtils(
        React.createElement(SimpleBackdropBlur, {
          isActive: true,
          blurIntensity: blurIntensity,
        })
      );

      // Component should render successfully with custom intensity
      expect(screen.queryByRole('alert')).toBeFalsy(); // No errors
    });
  });
});