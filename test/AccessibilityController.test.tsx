/**
 * AccessibilityController Component Tests
 *
 * Comprehensive test suite for accessibility functionality including:
 * - Keyboard navigation and spatial awareness
 * - Screen reader integration and ARIA compliance
 * - WCAG 2.1 AA compliance validation
 * - Response time requirements (<100ms)
 * - Command pattern for navigation actions
 *
 * @fileoverview Accessibility testing for extracted component
 * @version 1.0.0
 * @since Task 7.1 - Component Testing Strategy
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTestUtils } from './utils';
import React from 'react';
import { AccessibilityController, type AccessibilityConfig, type NavigationCommand } from '../components/AccessibilityController';
import type { CanvasPosition } from '../types/canvas';

describe('AccessibilityController', () => {
  let mockConfig: AccessibilityConfig;
  let mockPosition: CanvasPosition;
  let mockOnPositionChange: ReturnType<typeof vi.fn>;
  let mockOnAnnouncement: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset DOM state
    document.body.innerHTML = '';

    // Setup mock configuration
    mockConfig = {
      keyboardSpatialNav: true,
      moveDistance: 50,
      zoomFactor: 1.2,
      enableAnnouncements: true,
      enableSpatialContext: true,
      maxResponseTime: 100,
    };

    mockPosition = {
      x: 0,
      y: 0,
      scale: 1.0,
    };

    mockOnPositionChange = vi.fn();
    mockOnAnnouncement = vi.fn();

    // Mock performance.now for timing tests
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up event listeners
    const liveRegion = document.getElementById('canvas-live-region');
    if (liveRegion) {
      liveRegion.remove();
    }
  });

  describe('Component Initialization', () => {
    it('should render without visual output', () => {
      const { container } = renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      expect(container.firstChild).toBeNull();
    });

    it('should create ARIA live region when announcements are enabled', () => {
      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      const liveRegion = document.getElementById('canvas-live-region');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should not create ARIA live region when announcements are disabled', () => {
      const disabledConfig = { ...mockConfig, enableAnnouncements: false };

      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: disabledConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      const liveRegion = document.getElementById('canvas-live-region');
      expect(liveRegion).toBeFalsy();
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );
    });

    describe('Arrow Key Navigation', () => {
      it('should handle ArrowLeft key navigation', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: -50,
          y: 0,
          scale: 1.0,
        });
      });

      it('should handle ArrowRight key navigation', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 50,
          y: 0,
          scale: 1.0,
        });
      });

      it('should handle ArrowUp key navigation', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 0,
          y: -50,
          scale: 1.0,
        });
      });

      it('should handle ArrowDown key navigation', () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 0,
          y: 50,
          scale: 1.0,
        });
      });
    });

    describe('WASD Key Navigation', () => {
      it('should handle A key for left movement', () => {
        const event = new KeyboardEvent('keydown', { key: 'a' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: -50,
          y: 0,
          scale: 1.0,
        });
      });

      it('should handle D key for right movement', () => {
        const event = new KeyboardEvent('keydown', { key: 'd' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 50,
          y: 0,
          scale: 1.0,
        });
      });

      it('should handle W key for up movement', () => {
        const event = new KeyboardEvent('keydown', { key: 'w' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 0,
          y: -50,
          scale: 1.0,
        });
      });

      it('should handle S key for down movement', () => {
        const event = new KeyboardEvent('keydown', { key: 's' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 0,
          y: 50,
          scale: 1.0,
        });
      });
    });

    describe('Zoom Controls', () => {
      it('should handle + key for zoom in', () => {
        const event = new KeyboardEvent('keydown', { key: '+' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 0,
          y: 0,
          scale: 1.2,
        });
      });

      it('should handle - key for zoom out', () => {
        const event = new KeyboardEvent('keydown', { key: '-' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 0,
          y: 0,
          scale: 1.0 / 1.2,
        });
      });

      it('should handle Z key for zoom in', () => {
        const event = new KeyboardEvent('keydown', { key: 'z' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 0,
          y: 0,
          scale: 1.2,
        });
      });

      it('should handle Shift+Z for zoom out', () => {
        const event = new KeyboardEvent('keydown', { key: 'Z', shiftKey: true });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 0,
          y: 0,
          scale: 1.0 / 1.2,
        });
      });

      it('should handle 0 key for reset view', () => {
        const event = new KeyboardEvent('keydown', { key: '0' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 0,
          y: 0,
          scale: 1.0,
        });
      });

      it('should handle Home key for reset view', () => {
        const event = new KeyboardEvent('keydown', { key: 'Home' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).toHaveBeenCalledWith({
          x: 0,
          y: 0,
          scale: 1.0,
        });
      });
    });

    describe('Keyboard Navigation Disabled', () => {
      it('should not respond to keys when navigation is disabled', () => {
        const disabledConfig = { ...mockConfig, keyboardSpatialNav: false };

        const { rerender } = renderWithTestUtils(
          React.createElement(AccessibilityController, {
            currentPosition: mockPosition,
            config: disabledConfig,
            onPositionChange: mockOnPositionChange,
            onAnnouncement: mockOnAnnouncement,
          })
        );

        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        window.dispatchEvent(event);

        expect(mockOnPositionChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('Boundary Validation', () => {
    beforeEach(() => {
      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );
    });

    it('should constrain X position within bounds', () => {
      const extremePosition = { x: 700, y: 0, scale: 1.0 };

      const { rerender } = renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: extremePosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);

      expect(mockOnPositionChange).toHaveBeenCalledWith({
        x: 600, // Max bound
        y: 0,
        scale: 1.0,
      });
    });

    it('should constrain Y position within bounds', () => {
      const extremePosition = { x: 0, y: 450, scale: 1.0 };

      const { rerender } = renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: extremePosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);

      expect(mockOnPositionChange).toHaveBeenCalledWith({
        x: 0,
        y: 400, // Max bound
        scale: 1.0,
      });
    });

    it('should constrain scale within bounds', () => {
      const extremePosition = { x: 0, y: 0, scale: 2.8 };

      const { rerender } = renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: extremePosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      const event = new KeyboardEvent('keydown', { key: '+' });
      window.dispatchEvent(event);

      expect(mockOnPositionChange).toHaveBeenCalledWith({
        x: 0,
        y: 0,
        scale: 3.0, // Max bound
      });
    });
  });

  describe('Screen Reader Integration', () => {
    beforeEach(() => {
      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
          activeSection: 'capture',
        })
      );
    });

    it('should announce movement commands', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(mockOnAnnouncement).toHaveBeenCalledWith(
        expect.stringContaining('Moved left')
      );
    });

    it('should include spatial context in announcements', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(mockOnAnnouncement).toHaveBeenCalledWith(
        expect.stringContaining('Currently viewing Hero section - Camera capture area, top center of lightbox')
      );
    });

    it('should announce zoom operations with percentage', () => {
      const event = new KeyboardEvent('keydown', { key: '+' });
      window.dispatchEvent(event);

      expect(mockOnAnnouncement).toHaveBeenCalledWith(
        expect.stringContaining('Zoomed in to 120%')
      );
    });

    it('should not announce when announcements are disabled', () => {
      const disabledConfig = { ...mockConfig, enableAnnouncements: false };

      const { rerender } = renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: disabledConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(mockOnAnnouncement).not.toHaveBeenCalled();
    });
  });

  describe('Section Navigation', () => {
    const mockSections = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

    beforeEach(() => {
      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
          sections: mockSections,
        })
      );
    });

    it('should handle section navigation shortcuts', () => {
      const event = new KeyboardEvent('keydown', { key: '1' });
      window.dispatchEvent(event);

      expect(mockOnAnnouncement).toHaveBeenCalledWith(
        'Navigated to Hero section - Camera capture area, top center of lightbox'
      );
    });

    it('should handle numeric section navigation within bounds', () => {
      const event = new KeyboardEvent('keydown', { key: '6' });
      window.dispatchEvent(event);

      expect(mockOnAnnouncement).toHaveBeenCalledWith(
        'Navigated to Contact section - Portfolio area, bottom right of lightbox'
      );
    });

    it('should ignore numeric keys beyond section count', () => {
      const event = new KeyboardEvent('keydown', { key: '9' });
      window.dispatchEvent(event);

      expect(mockOnAnnouncement).not.toHaveBeenCalled();
    });
  });

  describe('Performance Requirements', () => {
    let performanceStartSpy: ReturnType<typeof vi.fn>;
    let responseTime = 0;

    beforeEach(() => {
      performanceStartSpy = vi.fn();
      vi.spyOn(performance, 'now')
        .mockImplementationOnce(() => 0) // Start time
        .mockImplementationOnce(() => responseTime); // End time
    });

    it('should meet response time requirement (<100ms)', () => {
      responseTime = 50; // Under limit

      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
          debugMode: true,
        })
      );

      const consoleSpy = vi.spyOn(console, 'warn');

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should warn when response time exceeds limit in debug mode', () => {
      responseTime = 150; // Over limit

      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
          debugMode: true,
        })
      );

      const consoleSpy = vi.spyOn(console, 'warn');

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Accessibility response time exceeded: 150.0ms > 100ms')
      );
    });
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should create properly structured ARIA live region', () => {
      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      const liveRegion = document.getElementById('canvas-live-region');

      // WCAG 2.1 AA requirements for live regions
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');

      // Screen reader accessibility
      expect(liveRegion?.style.position).toBe('absolute');
      expect(liveRegion?.style.left).toBe('-10000px');
      expect(liveRegion?.style.overflow).toBe('hidden');
    });

    it('should prevent default keyboard events to avoid conflicts', () => {
      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      const preventDefaultSpy = vi.fn();
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      event.preventDefault = preventDefaultSpy;

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should provide meaningful announcements for all interactions', () => {
      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
          activeSection: 'focus',
        })
      );

      const commands: NavigationCommand[] = ['move-left', 'move-right', 'move-up', 'move-down', 'zoom-in', 'zoom-out', 'reset-view'];
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-', '0'];

      keys.forEach((key, index) => {
        mockOnAnnouncement.mockClear();
        const event = new KeyboardEvent('keydown', { key });
        window.dispatchEvent(event);

        expect(mockOnAnnouncement).toHaveBeenCalledWith(
          expect.stringMatching(/^(Moved|Zoomed|Reset)/)
        );
      });
    });
  });

  describe('Event Cleanup', () => {
    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should clean up ARIA live region on unmount', () => {
      const { unmount } = renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      const liveRegion = document.getElementById('canvas-live-region');
      expect(liveRegion).toBeTruthy();

      unmount();

      const liveRegionAfterUnmount = document.getElementById('canvas-live-region');
      expect(liveRegionAfterUnmount).toBeFalsy();
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle missing onAnnouncement callback gracefully', () => {
      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: mockConfig,
          onPositionChange: mockOnPositionChange,
        })
      );

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

      expect(() => {
        window.dispatchEvent(event);
      }).not.toThrow();
    });

    it('should handle custom move distance and zoom factor', () => {
      const customConfig = {
        ...mockConfig,
        moveDistance: 25,
        zoomFactor: 1.5,
      };

      renderWithTestUtils(
        React.createElement(AccessibilityController, {
          currentPosition: mockPosition,
          config: customConfig,
          onPositionChange: mockOnPositionChange,
          onAnnouncement: mockOnAnnouncement,
        })
      );

      const moveEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(moveEvent);

      expect(mockOnPositionChange).toHaveBeenCalledWith({
        x: -25, // Custom move distance
        y: 0,
        scale: 1.0,
      });

      mockOnPositionChange.mockClear();

      const zoomEvent = new KeyboardEvent('keydown', { key: '+' });
      window.dispatchEvent(zoomEvent);

      expect(mockOnPositionChange).toHaveBeenCalledWith({
        x: 0,
        y: 0,
        scale: 1.5, // Custom zoom factor
      });
    });
  });
});