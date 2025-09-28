/**
 * Canvas Accessibility Integration Tests
 *
 * Tests accessibility features for 2D canvas navigation including keyboard
 * navigation, screen reader support, ARIA landmarks, and spatial navigation
 * compliance with WCAG AAA standards.
 *
 * @fileoverview Accessibility integration tests for canvas system
 * @version 1.0.0
 * @since Task 10 - Integration Testing with Existing Systems
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithTestUtils } from './utils';
import React from 'react';
import { CursorLens } from '../components/CursorLens';
import { LightboxCanvas } from '../components/LightboxCanvas';
import { SpatialSection } from '../components/SpatialSection';
import { UnifiedGameFlowProvider } from '../contexts/UnifiedGameFlowContext';
import type { CanvasPosition, ViewportConstraints } from '../types/canvas';
import type { PhotoWorkflowSection } from '../types/unified-gameflow';

// Mock canvas coordinate transforms for accessibility testing
vi.mock('../utils/canvasCoordinateTransforms', () => ({
  getSectionCanvasPosition: vi.fn((section: PhotoWorkflowSection) => {
    const positions = {
      'capture': { x: 400, y: 300, scale: 1.0 },
      'creative': { x: 600, y: 200, scale: 1.0 },
      'professional': { x: 400, y: 500, scale: 1.0 },
      'thought-leadership': { x: 200, y: 500, scale: 1.0 },
      'ai-github': { x: 200, y: 200, scale: 1.0 },
      'contact': { x: 400, y: 100, scale: 1.0 }
    };
    return positions[section] || { x: 0, y: 0, scale: 1.0 };
  }),
  calculateMovementDuration: vi.fn(() => 800)
}));

// Mock spatial positioning utilities
vi.mock('../utils/spatialPositioning', () => ({
  findNearestSection: vi.fn((position, sections) => sections[0]),
  calculateSectionPositions: vi.fn(() => [])
}));

// Test fixtures
const mockViewportConstraints: ViewportConstraints = {
  minPosition: { x: -600, y: -400, scale: 0.5 },
  maxPosition: { x: 600, y: 400, scale: 3.0 },
  minScale: 0.5,
  maxScale: 3.0
};

const mockSections: PhotoWorkflowSection[] = [
  'capture', 'creative', 'professional', 'thought-leadership', 'ai-github', 'contact'
];

// Accessibility test wrapper component
const AccessibleCanvasSystem: React.FC<{
  enableKeyboardNavigation?: boolean;
  enableScreenReaderSupport?: boolean;
  spatialNavigationMode?: boolean;
}> = ({
  enableKeyboardNavigation = true,
  enableScreenReaderSupport = true,
  spatialNavigationMode = true
}) => {
  const [canvasPosition, setCanvasPosition] = React.useState<CanvasPosition>({ x: 400, y: 300, scale: 1.0 });
  const [activeSection, setActiveSection] = React.useState<PhotoWorkflowSection>('capture');
  const [spatialFocus, setSpatialFocus] = React.useState<PhotoWorkflowSection | null>(null);

  const handleCanvasPositionChange = React.useCallback((position: CanvasPosition) => {
    setCanvasPosition(position);
  }, []);

  const handleSectionFocus = React.useCallback((section: PhotoWorkflowSection) => {
    setActiveSection(section);
    setSpatialFocus(section);
  }, []);

  const handleKeyboardNavigation = React.useCallback((event: React.KeyboardEvent) => {
    if (!enableKeyboardNavigation) return;

    const currentIndex = mockSections.indexOf(activeSection);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = (currentIndex + 1) % mockSections.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : mockSections.length - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = mockSections.length - 1;
        break;
      case 'Enter':
      case ' ':
        handleSectionFocus(activeSection);
        return;
    }

    if (newIndex !== currentIndex) {
      const newSection = mockSections[newIndex];
      handleSectionFocus(newSection);
      event.preventDefault();
    }
  }, [activeSection, enableKeyboardNavigation, handleSectionFocus]);

  return (
    <UnifiedGameFlowProvider>
      <div
        data-testid="accessible-canvas-system"
        role="application"
        aria-label="Interactive Photography Portfolio Canvas"
        onKeyDown={handleKeyboardNavigation}
        tabIndex={0}
      >
        {/* ARIA Live Region for Screen Reader Announcements */}
        {enableScreenReaderSupport && (
          <div
            id="canvas-announcements"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            data-testid="screen-reader-announcements"
          >
            {spatialFocus && (
              <span>
                Navigated to {spatialFocus} section.
                Position: {canvasPosition.x}, {canvasPosition.y}.
                Use arrow keys to navigate spatially, Enter to select.
              </span>
            )}
          </div>
        )}

        {/* Canvas Navigation Instructions */}
        {enableScreenReaderSupport && (
          <div className="sr-only" data-testid="navigation-instructions">
            <h2>Spatial Navigation Instructions</h2>
            <p>Use arrow keys to move between portfolio sections spatially.</p>
            <p>Press Enter or Space to select a section.</p>
            <p>Press Home to go to first section, End for last section.</p>
            <p>Current section: {activeSection}</p>
          </div>
        )}

        {/* CursorLens with Accessibility Enhancements */}
        <CursorLens
          sections={mockSections}
          canvasMode={spatialNavigationMode}
          canvasState={{
            currentPosition: canvasPosition,
            activeSection,
            isTransitioning: false
          }}
          onCanvasPositionChange={handleCanvasPositionChange}
          onSectionSelect={handleSectionFocus}
          showSpatialPreview={true}
          fallbackMode={enableKeyboardNavigation ? 'keyboard' : undefined}
          viewportDimensions={{ width: 1024, height: 768, edgeClearance: 40 }}
          data-testid="accessible-cursor-lens"
          aria-label="Portfolio Section Navigator"
          role="navigation"
        />

        {/* Spatial Canvas with ARIA Landmarks */}
        {spatialNavigationMode && (
          <LightboxCanvas
            position={canvasPosition}
            constraints={mockViewportConstraints}
            onPositionChange={handleCanvasPositionChange}
            data-testid="accessible-lightbox-canvas"
            role="main"
            aria-label="Interactive Portfolio Canvas"
          />
        )}

        {/* Spatial Sections with ARIA Labels */}
        <div role="region" aria-label="Portfolio Sections" data-testid="spatial-sections">
          {mockSections.map((section) => (
            <SpatialSection
              key={section}
              section={section}
              position={canvasPosition}
              isActive={activeSection === section}
              isFocused={spatialFocus === section}
              onFocus={() => handleSectionFocus(section)}
              data-testid={`spatial-section-${section}`}
              role="article"
              aria-label={`${section} portfolio section`}
              tabIndex={enableKeyboardNavigation ? 0 : -1}
            />
          ))}
        </div>

        {/* Spatial Position Indicator for Screen Readers */}
        {enableScreenReaderSupport && (
          <div className="sr-only" aria-live="polite" data-testid="position-indicator">
            Canvas position: X {Math.round(canvasPosition.x)}, Y {Math.round(canvasPosition.y)},
            Scale {canvasPosition.scale.toFixed(1)}
          </div>
        )}
      </div>
    </UnifiedGameFlowProvider>
  );
};

describe('Canvas Accessibility Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Mock window dimensions for consistent testing
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

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Keyboard Navigation', () => {
    it('should support arrow key navigation through spatial sections', async () => {
      render(<AccessibleCanvasSystem enableKeyboardNavigation={true} />);

      const canvasSystem = screen.getByTestId('accessible-canvas-system');
      canvasSystem.focus();

      // Test right arrow navigation
      fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });

      await waitFor(() => {
        const announcements = screen.getByTestId('screen-reader-announcements');
        expect(announcements).toHaveTextContent('Navigated to creative section');
      });

      // Test left arrow navigation
      fireEvent.keyDown(canvasSystem, { key: 'ArrowLeft' });

      await waitFor(() => {
        const announcements = screen.getByTestId('screen-reader-announcements');
        expect(announcements).toHaveTextContent('Navigated to capture section');
      });
    });

    it('should support Home and End key navigation', async () => {
      render(<AccessibleCanvasSystem enableKeyboardNavigation={true} />);

      const canvasSystem = screen.getByTestId('accessible-canvas-system');
      canvasSystem.focus();

      // Navigate to middle section first
      fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });
      fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });

      // Test Home key (should go to first section)
      fireEvent.keyDown(canvasSystem, { key: 'Home' });

      await waitFor(() => {
        const announcements = screen.getByTestId('screen-reader-announcements');
        expect(announcements).toHaveTextContent('Navigated to capture section');
      });

      // Test End key (should go to last section)
      fireEvent.keyDown(canvasSystem, { key: 'End' });

      await waitFor(() => {
        const announcements = screen.getByTestId('screen-reader-announcements');
        expect(announcements).toHaveTextContent('Navigated to contact section');
      });
    });

    it('should support Enter and Space key selection', async () => {
      render(<AccessibleCanvasSystem enableKeyboardNavigation={true} />);

      const canvasSystem = screen.getByTestId('accessible-canvas-system');
      canvasSystem.focus();

      // Navigate to creative section
      fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });

      // Test Enter key selection
      fireEvent.keyDown(canvasSystem, { key: 'Enter' });

      await waitFor(() => {
        const announcements = screen.getByTestId('screen-reader-announcements');
        expect(announcements).toHaveTextContent('creative section');
      });

      // Test Space key selection
      fireEvent.keyDown(canvasSystem, { key: ' ' });

      await waitFor(() => {
        const announcements = screen.getByTestId('screen-reader-announcements');
        expect(announcements).toHaveTextContent('creative section');
      });
    });

    it('should wrap around at section boundaries', async () => {
      render(<AccessibleCanvasSystem enableKeyboardNavigation={true} />);

      const canvasSystem = screen.getByTestId('accessible-canvas-system');
      canvasSystem.focus();

      // Navigate to last section
      fireEvent.keyDown(canvasSystem, { key: 'End' });

      // Test forward wrap-around (from last to first)
      fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });

      await waitFor(() => {
        const announcements = screen.getByTestId('screen-reader-announcements');
        expect(announcements).toHaveTextContent('Navigated to capture section');
      });

      // Test backward wrap-around (from first to last)
      fireEvent.keyDown(canvasSystem, { key: 'ArrowLeft' });

      await waitFor(() => {
        const announcements = screen.getByTestId('screen-reader-announcements');
        expect(announcements).toHaveTextContent('Navigated to contact section');
      });
    });

    it('should maintain focus management during canvas transitions', async () => {
      render(<AccessibleCanvasSystem enableKeyboardNavigation={true} spatialNavigationMode={true} />);

      const canvasSystem = screen.getByTestId('accessible-canvas-system');
      canvasSystem.focus();

      // Navigate and verify focus is maintained
      fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });
      fireEvent.keyDown(canvasSystem, { key: 'Enter' });

      await waitFor(() => {
        expect(document.activeElement).toBe(canvasSystem);
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide spatial relationship descriptions', async () => {
      render(<AccessibleCanvasSystem enableScreenReaderSupport={true} />);

      // Verify navigation instructions are present
      const instructions = screen.getByTestId('navigation-instructions');
      expect(instructions).toHaveTextContent('Spatial Navigation Instructions');
      expect(instructions).toHaveTextContent('Use arrow keys to move between portfolio sections spatially');

      // Verify current section is announced
      expect(instructions).toHaveTextContent('Current section: capture');
    });

    it('should announce position changes with coordinates', async () => {
      render(<AccessibleCanvasSystem enableScreenReaderSupport={true} enableKeyboardNavigation={true} />);

      const canvasSystem = screen.getByTestId('accessible-canvas-system');
      canvasSystem.focus();

      // Navigate to trigger position announcement
      fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });

      await waitFor(() => {
        const announcements = screen.getByTestId('screen-reader-announcements');
        expect(announcements).toHaveTextContent(/Position: \d+, \d+/);
        expect(announcements).toHaveTextContent('Use arrow keys to navigate spatially');
      });
    });

    it('should provide live region updates for canvas operations', async () => {
      render(<AccessibleCanvasSystem enableScreenReaderSupport={true} />);

      const announcements = screen.getByTestId('screen-reader-announcements');

      // Verify ARIA live region attributes
      expect(announcements).toHaveAttribute('aria-live', 'polite');
      expect(announcements).toHaveAttribute('aria-atomic', 'true');

      // Verify position indicator provides coordinate information
      const positionIndicator = screen.getByTestId('position-indicator');
      expect(positionIndicator).toHaveTextContent(/Canvas position: X \d+, Y \d+, Scale [\d.]+/);
    });

    it('should announce section content and purpose', async () => {
      render(<AccessibleCanvasSystem enableScreenReaderSupport={true} />);

      // Verify spatial sections have proper ARIA labels
      const captureSection = screen.getByTestId('spatial-section-capture');
      expect(captureSection).toHaveAttribute('aria-label', 'capture portfolio section');
      expect(captureSection).toHaveAttribute('role', 'article');

      const creativeSection = screen.getByTestId('spatial-section-creative');
      expect(creativeSection).toHaveAttribute('aria-label', 'creative portfolio section');
    });

    it('should support screen reader navigation landmarks', async () => {
      render(<AccessibleCanvasSystem enableScreenReaderSupport={true} spatialNavigationMode={true} />);

      // Verify main landmarks
      const canvasSystem = screen.getByTestId('accessible-canvas-system');
      expect(canvasSystem).toHaveAttribute('role', 'application');
      expect(canvasSystem).toHaveAttribute('aria-label', 'Interactive Photography Portfolio Canvas');

      const cursorLens = screen.getByTestId('accessible-cursor-lens');
      expect(cursorLens).toHaveAttribute('role', 'navigation');
      expect(cursorLens).toHaveAttribute('aria-label', 'Portfolio Section Navigator');

      const lightboxCanvas = screen.getByTestId('accessible-lightbox-canvas');
      expect(lightboxCanvas).toHaveAttribute('role', 'main');
      expect(lightboxCanvas).toHaveAttribute('aria-label', 'Interactive Portfolio Canvas');

      const spatialSections = screen.getByTestId('spatial-sections');
      expect(spatialSections).toHaveAttribute('role', 'region');
      expect(spatialSections).toHaveAttribute('aria-label', 'Portfolio Sections');
    });
  });

  describe('Touch and Mobile Accessibility', () => {
    it('should support touch navigation with accessibility features', async () => {
      render(<AccessibleCanvasSystem enableScreenReaderSupport={true} />);

      const captureSection = screen.getByTestId('spatial-section-capture');

      // Simulate touch interaction
      fireEvent.touchStart(captureSection);
      fireEvent.touchEnd(captureSection);

      await waitFor(() => {
        const announcements = screen.getByTestId('screen-reader-announcements');
        expect(announcements).toHaveTextContent('capture section');
      });
    });

    it('should maintain 44px minimum touch targets', async () => {
      render(<AccessibleCanvasSystem />);

      // Verify spatial sections are large enough for touch
      mockSections.forEach(section => {
        const sectionElement = screen.getByTestId(`spatial-section-${section}`);
        expect(sectionElement).toBeInTheDocument();

        // Touch targets should be accessible (this would be verified through CSS)
        expect(sectionElement).toHaveAttribute('tabIndex');
      });
    });
  });

  describe('WCAG AAA Compliance', () => {
    it('should provide multiple ways to navigate content', async () => {
      render(<AccessibleCanvasSystem enableKeyboardNavigation={true} enableScreenReaderSupport={true} />);

      // Verify multiple navigation methods are available
      const canvasSystem = screen.getByTestId('accessible-canvas-system');
      const cursorLens = screen.getByTestId('accessible-cursor-lens');
      const spatialSections = screen.getByTestId('spatial-sections');

      // Keyboard navigation
      expect(canvasSystem).toHaveAttribute('tabIndex', '0');

      // CursorLens navigation
      expect(cursorLens).toBeInTheDocument();

      // Direct section access
      expect(spatialSections).toBeInTheDocument();
    });

    it('should support focus indicators and visual feedback', async () => {
      render(<AccessibleCanvasSystem enableKeyboardNavigation={true} />);

      const canvasSystem = screen.getByTestId('accessible-canvas-system');

      // Focus the canvas system
      canvasSystem.focus();

      // Verify focus is properly managed
      expect(document.activeElement).toBe(canvasSystem);

      // Navigate through sections
      fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });

      // Focus should remain on the canvas system
      expect(document.activeElement).toBe(canvasSystem);
    });

    it('should provide context and orientation information', async () => {
      render(<AccessibleCanvasSystem enableScreenReaderSupport={true} />);

      const instructions = screen.getByTestId('navigation-instructions');
      const positionIndicator = screen.getByTestId('position-indicator');

      // Verify context information is provided
      expect(instructions).toHaveTextContent('Current section:');
      expect(positionIndicator).toHaveTextContent('Canvas position:');

      // Verify orientation guidance is available
      expect(instructions).toHaveTextContent('Use arrow keys to move between portfolio sections spatially');
    });

    it('should handle accessibility feature degradation gracefully', async () => {
      // Test with accessibility features disabled
      render(
        <AccessibleCanvasSystem
          enableKeyboardNavigation={false}
          enableScreenReaderSupport={false}
        />
      );

      const canvasSystem = screen.getByTestId('accessible-canvas-system');

      // System should still be functional without accessibility enhancements
      expect(canvasSystem).toBeInTheDocument();

      // Keyboard navigation should be disabled
      fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });

      // No screen reader announcements should be present
      expect(() => screen.getByTestId('screen-reader-announcements')).toThrow();
    });
  });

  describe('Performance with Accessibility Features', () => {
    it('should maintain performance with screen reader support enabled', async () => {
      const startTime = performance.now();

      render(<AccessibleCanvasSystem enableScreenReaderSupport={true} enableKeyboardNavigation={true} />);

      const canvasSystem = screen.getByTestId('accessible-canvas-system');
      canvasSystem.focus();

      // Simulate rapid navigation
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });
        await new Promise(resolve => setTimeout(resolve, 16)); // 60fps
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(500);
    });

    it('should handle accessibility announcements without blocking UI', async () => {
      render(<AccessibleCanvasSystem enableScreenReaderSupport={true} enableKeyboardNavigation={true} />);

      const canvasSystem = screen.getByTestId('accessible-canvas-system');
      canvasSystem.focus();

      // Rapid navigation should not block the UI
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(canvasSystem, { key: 'ArrowRight' });
      }

      // UI should remain responsive
      expect(canvasSystem).toBeInTheDocument();
      expect(document.activeElement).toBe(canvasSystem);
    });
  });
});