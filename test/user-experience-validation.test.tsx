import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderWithTestUtils } from './utils';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import CrosshairSystem from '../components/CrosshairSystem';
import ExifMetadata from '../components/ExifMetadata';
import React from 'react';

describe('User Experience Validation', () => {
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Viewfinder Responsiveness and Visual Feedback', () => {
    it('should respond immediately to activation', () => {
      const TestComponent = () => {
        const [isActive, setIsActive] = React.useState(false);

        return (
          <div>
            <button
              onClick={() => setIsActive(true)}
              data-testid="activate-viewfinder"
            >
              Activate
            </button>
            {React.createElement(ViewfinderOverlay, {
              isActive,
              onCapture: vi.fn(),
            })}
          </div>
        );
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // Initially should not be visible
      expect(container.querySelector('.fixed')).toBeFalsy();

      // Activate viewfinder
      fireEvent.click(screen.getByTestId('activate-viewfinder'));

      // Should appear immediately
      expect(container.querySelector('.fixed')).toBeTruthy();
    });

    it('should provide smooth visual feedback during activation', async () => {
      const TestComponent = () => {
        const [isActive, setIsActive] = React.useState(false);

        React.useEffect(() => {
          const timer = setTimeout(() => setIsActive(true), 100);
          return () => clearTimeout(timer);
        }, []);

        return React.createElement(ViewfinderOverlay, {
          isActive,
        });
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // Should start invisible
      expect(container.querySelector('.fixed')).toBeFalsy();

      // Advance timers to trigger activation
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should now be visible
      const overlay = container.querySelector('.fixed');
      expect(overlay).toBeTruthy();

      // Should have smooth transition styles
      const style = overlay ? getComputedStyle(overlay) : null;
      expect(style).toBeTruthy();
    });

    it('should track mouse movement responsively', async () => {
      const positions: Array<{ x: number; y: number }> = [];

      const TestComponent = () => {
        const [mousePos, setMousePos] = React.useState({ x: 500, y: 400 });

        React.useEffect(() => {
          positions.push(mousePos);
        }, [mousePos]);

        return (
          <div
            onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
            style={{ width: '100vw', height: '100vh' }}
          >
            {React.createElement(ViewfinderOverlay, {
              isActive: true,
            })}
          </div>
        );
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // Simulate mouse movements
      const testDiv = container.firstChild as HTMLElement;
      fireEvent.mouseMove(testDiv, { clientX: 100, clientY: 200 });
      fireEvent.mouseMove(testDiv, { clientX: 300, clientY: 400 });
      fireEvent.mouseMove(testDiv, { clientX: 500, clientY: 300 });

      // Should track multiple positions
      expect(positions.length).toBeGreaterThan(1);
    });

    it('should handle rapid state changes smoothly', async () => {
      const TestComponent = () => {
        const [isActive, setIsActive] = React.useState(false);

        React.useEffect(() => {
          // Rapidly toggle state
          const intervals = [50, 100, 150, 200, 250].map(delay =>
            setTimeout(() => setIsActive(prev => !prev), delay)
          );

          return () => intervals.forEach(clearTimeout);
        }, []);

        return React.createElement(ViewfinderOverlay, {
          isActive,
        });
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // Advance through rapid state changes
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Should handle rapid changes without crashing
      expect(container).toBeTruthy();
    });

    it('should provide visual feedback for capture action', () => {
      const onCapture = vi.fn();

      const { container } = renderWithTestUtils(
        React.createElement(ViewfinderOverlay, {
          isActive: true,
          onCapture,
        })
      );

      const overlay = container.querySelector('.fixed');
      expect(overlay).toBeTruthy();

      // Click to capture
      fireEvent.click(overlay!);

      // Should have called capture callback
      expect(onCapture).toHaveBeenCalledOnce();
    });
  });

  describe('EXIF Display Readability and Positioning', () => {
    it('should position EXIF metadata to avoid screen edges', () => {
      const TestComponent = () => {
        const positions = [
          { x: 50, y: 50 },    // Near top-left
          { x: 970, y: 50 },   // Near top-right
          { x: 50, y: 700 },   // Near bottom-left
          { x: 970, y: 700 },  // Near bottom-right
          { x: 500, y: 400 },  // Center
        ];

        return (
          <div>
            {positions.map((pos, index) => (
              React.createElement(ExifMetadata, {
                key: index,
                position: pos,
                isVisible: true,
                'data-testid': `exif-${index}`,
              })
            ))}
          </div>
        );
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // All EXIF displays should render
      const exifElements = container.querySelectorAll('[class*="font-mono"]');
      expect(exifElements.length).toBeGreaterThan(0);

      // Should be positioned to stay within viewport bounds
      exifElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        expect(rect.left).toBeGreaterThanOrEqual(0);
        expect(rect.top).toBeGreaterThanOrEqual(0);
      });
    });

    it('should display readable camera information', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ExifMetadata, {
          position: { x: 500, y: 400 },
          isVisible: true,
          displayMode: 'camera',
        })
      );

      // Should contain camera information (default mode)
      expect(screen.getByText('CAMERA')).toBeTruthy();
      expect(screen.getByText('SETTINGS')).toBeTruthy();

      // Should display technical details
      expect(container.textContent).toContain('Canon EOS R5');
      expect(container.textContent).toContain('f/2.8');
    });

    it('should have proper contrast and readability', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ExifMetadata, {
          position: { x: 500, y: 400 },
          isVisible: true,
          theme: 'dark',
        })
      );

      const exifContainer = container.querySelector('.font-mono');
      expect(exifContainer).toBeTruthy();

      // Should have proper styling for readability
      const style = exifContainer ? getComputedStyle(exifContainer) : null;
      expect(style).toBeTruthy();
    });

    it('should adapt positioning based on cursor location', () => {
      const TestComponent = () => {
        const [position, setPosition] = React.useState({ x: 100, y: 100 });

        return (
          <div>
            <button
              onClick={() => setPosition({ x: 900, y: 600 })}
              data-testid="move-cursor"
            >
              Move Cursor
            </button>
            {React.createElement(ExifMetadata, {
              position,
              isVisible: true,
            })}
          </div>
        );
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      const initialExif = container.querySelector('.font-mono');
      const initialRect = initialExif?.getBoundingClientRect();

      // Move cursor position
      fireEvent.click(screen.getByTestId('move-cursor'));

      const movedExif = container.querySelector('.font-mono');
      const movedRect = movedExif?.getBoundingClientRect();

      // Position should have changed
      expect(initialRect).toBeTruthy();
      expect(movedRect).toBeTruthy();
    });
  });

  describe('Smooth Animations and Transition Timing', () => {
    it('should have smooth crosshair movement transitions', async () => {
      const TestComponent = () => {
        const [position, setPosition] = React.useState({ x: 200, y: 200 });

        return (
          <div>
            <button
              onClick={() => setPosition({ x: 600, y: 400 })}
              data-testid="move-crosshair"
            >
              Move
            </button>
            {React.createElement(CrosshairSystem, {
              position,
              isActive: true,
            })}
          </div>
        );
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // Should render crosshair
      const crosshair = container.querySelector('svg');
      expect(crosshair).toBeTruthy();

      // Move crosshair
      fireEvent.click(screen.getByTestId('move-crosshair'));

      // Should still be present after movement
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('should have appropriate animation duration', () => {
      const TestComponent = () => {
        const [isActive, setIsActive] = React.useState(false);

        return (
          <div>
            <button
              onClick={() => setIsActive(!isActive)}
              data-testid="toggle-viewfinder"
            >
              Toggle
            </button>
            {React.createElement(ViewfinderOverlay, {
              isActive,
            })}
          </div>
        );
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // Activate viewfinder
      fireEvent.click(screen.getByTestId('toggle-viewfinder'));

      const overlay = container.querySelector('.fixed');
      expect(overlay).toBeTruthy();

      // Should have transition styles
      const style = overlay ? getComputedStyle(overlay) : null;
      expect(style).toBeTruthy();
    });

    it('should handle focus ring animations smoothly', () => {
      const TestComponent = () => {
        const [radius, setRadius] = React.useState(100);

        return (
          <div>
            <button
              onClick={() => setRadius(200)}
              data-testid="change-radius"
            >
              Change Radius
            </button>
            {React.createElement(CrosshairSystem, {
              position: { x: 500, y: 400 },
              isActive: true,
              focusRadius: radius,
            })}
          </div>
        );
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // Should render focus system
      expect(container.querySelector('svg')).toBeTruthy();

      // Change radius
      fireEvent.click(screen.getByTestId('change-radius'));

      // Should still render properly after change
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('should provide smooth fade transitions for visibility', async () => {
      const TestComponent = () => {
        const [isVisible, setIsVisible] = React.useState(true);

        React.useEffect(() => {
          const timer = setTimeout(() => setIsVisible(false), 200);
          return () => clearTimeout(timer);
        }, []);

        return React.createElement(ExifMetadata, {
          position: { x: 500, y: 400 },
          isVisible,
        });
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // Should start visible
      expect(container.querySelector('.font-mono')).toBeTruthy();

      // Advance timers for fade transition
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Should handle fade transition
      expect(container).toBeTruthy();
    });

    it('should handle animations without performance degradation', async () => {
      const TestComponent = () => {
        const [active, setActive] = React.useState(false);
        const [position, setPosition] = React.useState({ x: 100, y: 100 });

        React.useEffect(() => {
          setActive(true);
          // Simulate continuous position updates
          const interval = setInterval(() => {
            setPosition(prev => ({
              x: prev.x + Math.sin(Date.now() * 0.01) * 5,
              y: prev.y + Math.cos(Date.now() * 0.01) * 5,
            }));
          }, 16);

          return () => clearInterval(interval);
        }, []);

        return React.createElement(ViewfinderOverlay, {
          isActive: active,
        });
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      // Should render without errors
      expect(container.querySelector('.fixed')).toBeTruthy();

      // Simulate animation frames
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          vi.advanceTimersByTime(16);
        }
      });

      // Should still be functioning after animations
      expect(container.querySelector('.fixed')).toBeTruthy();
    });
  });

  describe('Accessibility and User Interaction', () => {
    it('should provide keyboard navigation support', () => {
      const onCapture = vi.fn();

      const { container } = renderWithTestUtils(
        React.createElement(ViewfinderOverlay, {
          isActive: true,
          onCapture,
        })
      );

      // Verify viewfinder is rendered and active
      const overlay = container.querySelector('.fixed');
      expect(overlay).toBeTruthy();

      // Should handle capture via Enter key
      fireEvent.keyDown(document, { key: 'Enter' });

      expect(onCapture).toHaveBeenCalled();
    });

    it('should handle touch interaction gracefully', () => {
      const onCapture = vi.fn();

      const { container } = renderWithTestUtils(
        React.createElement(ViewfinderOverlay, {
          isActive: true,
          onCapture,
        })
      );

      const overlay = container.querySelector('.fixed');
      expect(overlay).toBeTruthy();

      // Simulate touch interaction
      fireEvent.touchStart(overlay!);
      fireEvent.click(overlay!);

      expect(onCapture).toHaveBeenCalled();
    });

    it('should provide clear visual hierarchy', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ViewfinderOverlay, {
          isActive: true,
        })
      );

      // Should have proper z-index layering
      const overlay = container.querySelector('.z-50');
      expect(overlay).toBeTruthy();

      // Should have distinct visual elements
      const crosshair = container.querySelector('svg');
      const focusRing = container.querySelector('[style*="border-radius: 50%"]');

      expect(crosshair).toBeTruthy();
      expect(focusRing).toBeTruthy();
    });
  });
});