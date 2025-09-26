import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderWithTestUtils } from './utils';
import React from 'react';

// Import all components for integration testing
import SpotlightCursor from '../components/SpotlightCursor';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import BlurContainer from '../components/BlurContainer';
import BackdropBlurOverlay from '../components/BackdropBlurOverlay';
import CrosshairSystem from '../components/CrosshairSystem';
import ExifMetadata from '../components/ExifMetadata';
import KeyboardControls from '../components/KeyboardControls';
import ShutterEffect from '../components/ShutterEffect';

describe('Component Integration Testing', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Mock audio for shutter effects
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      remove: vi.fn(),
      volume: 0.5,
      currentTime: 0,
    }));

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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ViewfinderOverlay + SpotlightCursor Integration', () => {
    it('should work alongside SpotlightCursor without conflicts', () => {
      const IntegratedComponent = () => {
        const [viewfinderActive, setViewfinderActive] = React.useState(false);

        return (
          <div>
            {React.createElement(SpotlightCursor)}
            {React.createElement(ViewfinderOverlay, {
              isActive: viewfinderActive,
              onCapture: () => console.log('captured'),
            })}
            <button
              onClick={() => setViewfinderActive(!viewfinderActive)}
              data-testid="toggle-viewfinder"
            >
              Toggle Viewfinder
            </button>
          </div>
        );
      };

      const { container } = renderWithTestUtils(
        React.createElement(IntegratedComponent)
      );

      // Both SpotlightCursor and ViewfinderOverlay should coexist
      const spotlightCursor = container.querySelector('[style*="radial-gradient"]');
      expect(spotlightCursor).toBeTruthy();

      // Activate viewfinder
      const toggleButton = screen.getByTestId('toggle-viewfinder');
      fireEvent.click(toggleButton);

      // Should not interfere with each other's mouse tracking
      fireEvent.mouseMove(document, { clientX: 100, clientY: 200 });

      expect(container.querySelector('svg')).toBeTruthy(); // Viewfinder crosshair
    });

    it('should handle mouse events properly when both components are active', () => {
      const mouseEvents: Array<{ x: number; y: number; source: string }> = [];

      const IntegratedComponent = () => {
        React.useEffect(() => {
          const handleMouseMove = (e: MouseEvent) => {
            mouseEvents.push({ x: e.clientX, y: e.clientY, source: 'document' });
          };

          document.addEventListener('mousemove', handleMouseMove);
          return () => document.removeEventListener('mousemove', handleMouseMove);
        }, []);

        return (
          <div>
            {React.createElement(SpotlightCursor)}
            {React.createElement(ViewfinderOverlay, { isActive: true })}
          </div>
        );
      };

      renderWithTestUtils(React.createElement(IntegratedComponent));

      // Generate mouse movements
      fireEvent.mouseMove(document, { clientX: 150, clientY: 250 });
      fireEvent.mouseMove(document, { clientX: 300, clientY: 400 });

      expect(mouseEvents.length).toBeGreaterThan(0);
      expect(mouseEvents[0]).toEqual({ x: 150, y: 250, source: 'document' });
    });
  });

  describe('Focus System + Page Content Integration', () => {
    it('should apply blur effects to page content correctly', () => {
      const PageWithBlur = () => {
        const [focusPosition, setFocusPosition] = React.useState({ x: 500, y: 400 });

        return (
          <div>
            {React.createElement(BlurContainer, {
              isActive: true,
              focusCenter: focusPosition,
              focusRadius: 100,
            }, [
              React.createElement('h1', {
                key: 'title',
                'data-blurable': 'true',
                'data-testid': 'page-title'
              }, 'Page Title'),
              React.createElement('p', {
                key: 'content',
                'data-blurable': 'true',
                'data-testid': 'page-content'
              }, 'Page content that should be blurred'),
            ])}

            <button
              onClick={() => setFocusPosition({ x: 200, y: 200 })}
              data-testid="change-focus"
            >
              Change Focus
            </button>
          </div>
        );
      };

      const { container } = renderWithTestUtils(React.createElement(PageWithBlur));

      const blurableTitle = screen.getByTestId('page-title');
      const blurableContent = screen.getByTestId('page-content');

      expect(blurableTitle).toBeTruthy();
      expect(blurableContent).toBeTruthy();

      // Change focus position
      const changeButton = screen.getByTestId('change-focus');
      fireEvent.click(changeButton);

      // Should update blur effects
      expect(container.querySelector('[data-blurable="true"]')).toBeTruthy();
    });

    it('should handle focus area calculation with real content', () => {
      const ContentWithFocus = () => {
        const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

        return (
          <div
            onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
            data-testid="content-area"
            style={{ width: '100%', height: '100vh', position: 'relative' }}
          >
            <div style={{ position: 'absolute', top: 100, left: 100 }} data-testid="element-1">
              Element 1
            </div>
            <div style={{ position: 'absolute', top: 300, left: 300 }} data-testid="element-2">
              Element 2
            </div>

            {React.createElement(CrosshairSystem, {
              position: mousePos,
              isActive: true,
              focusRadius: 150,
            })}
          </div>
        );
      };

      renderWithTestUtils(React.createElement(ContentWithFocus));

      const contentArea = screen.getByTestId('content-area');

      // Move mouse over different elements
      fireEvent.mouseMove(contentArea, { clientX: 100, clientY: 100 });

      expect(screen.getByTestId('element-1')).toBeTruthy();
      expect(screen.getByTestId('element-2')).toBeTruthy();
    });
  });

  describe('Keyboard Controls + Full System Integration', () => {
    it('should control entire viewfinder system via keyboard', async () => {
      const FullViewfinderSystem = () => {
        const [isActive, setIsActive] = React.useState(false);
        const [captureCount, setCaptureCount] = React.useState(0);

        return React.createElement(KeyboardControls, {
          isActive: isActive,
          onToggleViewfinder: () => setIsActive(!isActive),
          onCapture: () => setCaptureCount(prev => prev + 1),
        }, [
          React.createElement('div', { key: 'status', 'data-testid': 'viewfinder-status' },
            isActive ? 'Active' : 'Inactive'
          ),
          React.createElement('div', { key: 'captures', 'data-testid': 'capture-count' },
            `Captures: ${captureCount}`
          ),
          React.createElement(ViewfinderOverlay, {
            key: 'overlay',
            isActive: isActive,
            onCapture: () => setCaptureCount(prev => prev + 1),
          }),
          React.createElement(CrosshairSystem, {
            key: 'crosshair',
            position: { x: 500, y: 400 },
            isActive: isActive,
          }),
        ]);
      };

      renderWithTestUtils(React.createElement(FullViewfinderSystem));

      // Initial state should be inactive
      expect(screen.getByTestId('viewfinder-status')).toHaveTextContent('Inactive');
      expect(screen.getByTestId('capture-count')).toHaveTextContent('Captures: 0');

      // Activate with V key
      fireEvent.keyDown(document, { key: 'v' });
      expect(screen.getByTestId('viewfinder-status')).toHaveTextContent('Active');

      // Capture with Enter key
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(screen.getByTestId('capture-count')).toHaveTextContent('Captures: 1');

      // Capture with Space key
      fireEvent.keyDown(document, { key: ' ' });
      expect(screen.getByTestId('capture-count')).toHaveTextContent('Captures: 2');

      // Deactivate with V key
      fireEvent.keyDown(document, { key: 'v' });
      expect(screen.getByTestId('viewfinder-status')).toHaveTextContent('Inactive');
    });

    it('should show keyboard help and navigate properly', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, {
          isActive: true,
        })
      );

      // Show help with ? key
      fireEvent.keyDown(document, { key: '?' });
      expect(screen.getByText('Keyboard Shortcuts')).toBeTruthy();

      // Hide help with Escape key
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('Keyboard Shortcuts')).toBeFalsy();
    });
  });

  describe('Complete Workflow Integration', () => {
    it('should handle complete capture workflow', async () => {
      const CompleteWorkflow = () => {
        const [state, setState] = React.useState({
          viewfinderActive: false,
          mousePosition: { x: 500, y: 400 },
          isCapturing: false,
          captureComplete: false,
        });

        const handleCapture = async () => {
          setState(prev => ({ ...prev, isCapturing: true }));

          await act(async () => {
            vi.advanceTimersByTime(500); // Shutter animation time
          });

          setState(prev => ({
            ...prev,
            isCapturing: false,
            captureComplete: true
          }));
        };

        return (
          <div>
            {React.createElement(ViewfinderOverlay, {
              isActive: state.viewfinderActive,
              onCapture: handleCapture,
            })}

            {React.createElement(CrosshairSystem, {
              position: state.mousePosition,
              isActive: state.viewfinderActive,
            })}

            {React.createElement(ExifMetadata, {
              position: state.mousePosition,
              isVisible: state.viewfinderActive,
            })}

            {React.createElement(ShutterEffect, {
              isTriggered: state.isCapturing,
              onComplete: () => setState(prev => ({ ...prev, isCapturing: false })),
            })}

            <div data-testid="workflow-state">
              {state.viewfinderActive ? 'Viewfinder Active' : 'Viewfinder Inactive'}
              {state.isCapturing ? ' - Capturing' : ''}
              {state.captureComplete ? ' - Capture Complete' : ''}
            </div>

            <button
              onClick={() => setState(prev => ({
                ...prev,
                viewfinderActive: !prev.viewfinderActive
              }))}
              data-testid="toggle-system"
            >
              Toggle System
            </button>
          </div>
        );
      };

      renderWithTestUtils(React.createElement(CompleteWorkflow));

      const stateDisplay = screen.getByTestId('workflow-state');
      const toggleButton = screen.getByTestId('toggle-system');

      // Initial state
      expect(stateDisplay).toHaveTextContent('Viewfinder Inactive');

      // Activate system
      fireEvent.click(toggleButton);
      expect(stateDisplay).toHaveTextContent('Viewfinder Active');

      // Should show EXIF metadata
      expect(screen.getByText('CAMERA')).toBeTruthy();
    });

    it('should handle accessibility features across all components', () => {
      const AccessibilityTest = () => (
        <div>
          {React.createElement(KeyboardControls, {
            isActive: true,
          })}
          {React.createElement(ViewfinderOverlay, {
            isActive: true,
          })}
        </div>
      );

      const { container } = renderWithTestUtils(React.createElement(AccessibilityTest));

      // Should have ARIA labels
      const applicationElement = container.querySelector('[role="application"]');
      expect(applicationElement).toBeTruthy();
      expect(applicationElement?.getAttribute('aria-label')).toContain('keyboard controls');

      // Should have live regions for announcements
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();

      // Should support keyboard navigation
      fireEvent.keyDown(document, { key: 'Tab' });
      // Tab navigation should work without errors
    });

    it('should handle performance under load with all components active', async () => {
      let renderCount = 0;

      const PerformanceTest = () => {
        const [position, setPosition] = React.useState({ x: 500, y: 400 });

        React.useEffect(() => {
          renderCount++;
        });

        React.useEffect(() => {
          const interval = setInterval(() => {
            setPosition(prev => ({
              x: prev.x + Math.sin(Date.now() * 0.001) * 2,
              y: prev.y + Math.cos(Date.now() * 0.001) * 2,
            }));
          }, 16);

          return () => clearInterval(interval);
        }, []);

        return (
          <div>
            {React.createElement(SpotlightCursor)}
            {React.createElement(ViewfinderOverlay, { isActive: true })}
            {React.createElement(CrosshairSystem, { position, isActive: true })}
            {React.createElement(ExifMetadata, { position, isVisible: true })}
          </div>
        );
      };

      renderWithTestUtils(React.createElement(PerformanceTest));

      // Run for several frames
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          vi.advanceTimersByTime(16);
        }
      });

      // Should handle multiple active components without excessive re-renders
      expect(renderCount).toBeLessThan(15); // Allow some re-renders but not excessive
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle component cleanup gracefully', () => {
      const TestComponent = () => {
        const [showComponents, setShowComponents] = React.useState(true);

        return (
          <div>
            {showComponents && React.createElement(ViewfinderOverlay, { isActive: true })}
            {showComponents && React.createElement(CrosshairSystem, {
              position: { x: 100, y: 100 },
              isActive: true
            })}
            <button
              onClick={() => setShowComponents(false)}
              data-testid="cleanup-components"
            >
              Cleanup
            </button>
          </div>
        );
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // Components should be active
      expect(container.querySelector('svg')).toBeTruthy();

      // Cleanup components
      const cleanupButton = screen.getByTestId('cleanup-components');
      fireEvent.click(cleanupButton);

      // Should cleanup without errors
      expect(container.querySelector('svg')).toBeFalsy();
    });

    it('should handle rapid state changes without errors', async () => {
      const RapidChangeTest = () => {
        const [active, setActive] = React.useState(false);

        React.useEffect(() => {
          const interval = setInterval(() => {
            setActive(prev => !prev);
          }, 50);

          return () => clearInterval(interval);
        }, []);

        return React.createElement(ViewfinderOverlay, { isActive: active });
      };

      const { container } = renderWithTestUtils(React.createElement(RapidChangeTest));

      // Let it toggle rapidly for a bit
      await act(async () => {
        vi.advanceTimersByTime(500); // 10 toggles
      });

      // Should handle rapid changes without crashing
      expect(container).toBeTruthy();
    });
  });
});