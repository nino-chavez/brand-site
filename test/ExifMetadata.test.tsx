import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExifMetadata, { AnimatedExifMetadata, ContextualExifMetadata } from '../components/ExifMetadata';
import { renderWithTestUtils } from './utils';
import React from 'react';

describe('ExifMetadata Components', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Mock window dimensions
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ExifMetadata', () => {
    const defaultProps = {
      position: { x: 100, y: 100 },
      isVisible: true,
    };

    it('should render camera metadata by default', () => {
      renderWithTestUtils(
        React.createElement(ExifMetadata, defaultProps)
      );

      expect(screen.getByText('CAMERA')).toBeTruthy();
      expect(screen.getByText('Canon EOS R5')).toBeTruthy();
      expect(screen.getByText('SETTINGS')).toBeTruthy();
    });

    it('should render technical metadata when displayMode is technical', () => {
      renderWithTestUtils(
        React.createElement(ExifMetadata, {
          ...defaultProps,
          displayMode: 'technical',
        })
      );

      expect(screen.getByText('TECHNICAL')).toBeTruthy();
      expect(screen.getByText('React 19.1.1')).toBeTruthy();
    });

    it('should render capture metadata when displayMode is capture', () => {
      renderWithTestUtils(
        React.createElement(ExifMetadata, {
          ...defaultProps,
          displayMode: 'capture',
        })
      );

      expect(screen.getByText('CAPTURE')).toBeTruthy();
      expect(screen.getByText(/Position: 100, 100/)).toBeTruthy();
    });

    it('should render all metadata when displayMode is all', () => {
      renderWithTestUtils(
        React.createElement(ExifMetadata, {
          ...defaultProps,
          displayMode: 'all',
        })
      );

      expect(screen.getByText('CAMERA')).toBeTruthy();
      expect(screen.getByText('TECHNICAL')).toBeTruthy();
      expect(screen.getByText('CAPTURE')).toBeTruthy();
    });

    it('should not render when isVisible is false', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ExifMetadata, {
          ...defaultProps,
          isVisible: false,
        })
      );

      expect(container.firstChild).toBeFalsy();
    });

    it('should apply different themes correctly', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ExifMetadata, {
          ...defaultProps,
          theme: 'camera',
        })
      );

      const metadataElement = container.querySelector('[class*="bg-black/95"]');
      expect(metadataElement).toBeTruthy();
    });

    it('should handle custom data override', () => {
      const customData = {
        camera: {
          make: 'Nikon',
          model: 'D850',
          lens: '85mm f/1.4G',
          focalLength: '85mm',
          aperture: 'f/1.4',
          shutterSpeed: '1/500',
          iso: 'ISO 64',
        },
      };

      renderWithTestUtils(
        React.createElement(ExifMetadata, {
          ...defaultProps,
          data: customData,
        })
      );

      expect(screen.getByText('Nikon D850')).toBeTruthy();
      expect(screen.getByText('85mm f/1.4G')).toBeTruthy();
    });

    it('should position itself with smart positioning', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ExifMetadata, {
          ...defaultProps,
          positioning: 'smart',
        })
      );

      const metadataElement = container.querySelector('[style*="position: fixed"]');
      expect(metadataElement).toBeTruthy();
    });

    it('should handle fade in delay', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ExifMetadata, {
          ...defaultProps,
          fadeInDelay: 500,
        })
      );

      const metadataElement = container.querySelector('[style*="opacity: 0"]');
      expect(metadataElement).toBeTruthy();

      // Fast forward through fade delay
      vi.advanceTimersByTime(500);

      // The component should now be visible
      const visibleElement = container.querySelector('[style*="opacity: 1"]');
      expect(visibleElement).toBeTruthy();
    });
  });

  describe('AnimatedExifMetadata', () => {
    it('should render with typewriter effect', () => {
      const { container } = renderWithTestUtils(
        React.createElement(AnimatedExifMetadata, {
          position: { x: 100, y: 100 },
          isVisible: true,
          typewriterSpeed: 10,
        })
      );

      expect(container.querySelector('pre')).toBeTruthy();
    });

    it('should not render when invisible', () => {
      const { container } = renderWithTestUtils(
        React.createElement(AnimatedExifMetadata, {
          position: { x: 100, y: 100 },
          isVisible: false,
        })
      );

      expect(container.firstChild).toBeFalsy();
    });

    it('should show cursor during typing animation', () => {
      const { container } = renderWithTestUtils(
        React.createElement(AnimatedExifMetadata, {
          position: { x: 100, y: 100 },
          isVisible: true,
          typewriterSpeed: 100,
        })
      );

      // Should have animated cursor
      const cursor = container.querySelector('.animate-pulse');
      expect(cursor).toBeTruthy();
    });
  });

  describe('ContextualExifMetadata', () => {
    it('should render with default context', () => {
      renderWithTestUtils(
        React.createElement(ContextualExifMetadata, {
          position: { x: 100, y: 100 },
          isVisible: true,
        })
      );

      expect(screen.getByText('CAMERA')).toBeTruthy();
      expect(screen.getByText('CAPTURE')).toBeTruthy();
    });

    it('should change data based on content zone', () => {
      renderWithTestUtils(
        React.createElement(ContextualExifMetadata, {
          position: { x: 100, y: 100 },
          isVisible: true,
          contentZone: 'hero-title',
        })
      );

      // Should show context-specific camera settings
      expect(screen.getByText(/85mm/)).toBeTruthy();
      expect(screen.getByText(/f\/1\.4/)).toBeTruthy();
    });

    it('should update data when content zone changes', () => {
      const { rerender } = renderWithTestUtils(
        React.createElement(ContextualExifMetadata, {
          position: { x: 100, y: 100 },
          isVisible: true,
          contentZone: 'navigation',
        })
      );

      expect(screen.getByText(/35mm/)).toBeTruthy();

      // Change content zone
      rerender(
        React.createElement(ContextualExifMetadata, {
          position: { x: 100, y: 100 },
          isVisible: true,
          contentZone: 'about-content',
        })
      );

      expect(screen.getByText(/50mm/)).toBeTruthy();
    });

    it('should not render when invisible', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ContextualExifMetadata, {
          position: { x: 100, y: 100 },
          isVisible: false,
        })
      );

      expect(container.firstChild).toBeFalsy();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle extreme positions gracefully', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ExifMetadata, {
          position: { x: -100, y: -100 },
          isVisible: true,
          positioning: 'smart',
        })
      );

      // Should still render despite negative positions
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle very large positions', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ExifMetadata, {
          position: { x: 9999, y: 9999 },
          isVisible: true,
          positioning: 'smart',
        })
      );

      // Should still render and handle positioning
      expect(container.firstChild).toBeTruthy();
    });

    it('should work with minimal data', () => {
      renderWithTestUtils(
        React.createElement(ExifMetadata, {
          position: { x: 100, y: 100 },
          isVisible: true,
          data: {},
        })
      );

      // Should render with default data
      expect(screen.getByText('CAMERA')).toBeTruthy();
    });
  });
});