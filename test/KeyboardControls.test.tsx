import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import KeyboardControls, { useKeyboardControls } from '../components/KeyboardControls';
import { renderWithTestUtils } from './utils';
import React from 'react';

describe('KeyboardControls Components', () => {
  const mockCallbacks = {
    onToggleViewfinder: vi.fn(),
    onCapture: vi.fn(),
    onFocusAreaChange: vi.fn(),
    onBlurAdjust: vi.fn(),
    onModeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('KeyboardControls', () => {
    it('should render children when provided', () => {
      renderWithTestUtils(
        React.createElement(
          KeyboardControls,
          { isActive: true },
          React.createElement('div', { 'data-testid': 'test-child' }, 'Test Content')
        )
      );

      expect(screen.getByTestId('test-child')).toHaveTextContent('Test Content');
    });

    it('should handle V key to toggle viewfinder', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, {
          isActive: false,
          onToggleViewfinder: mockCallbacks.onToggleViewfinder,
        })
      );

      fireEvent.keyDown(document, { key: 'v' });

      expect(mockCallbacks.onToggleViewfinder).toHaveBeenCalledTimes(1);
    });

    it('should handle Enter key for capture when active', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, {
          isActive: true,
          onCapture: mockCallbacks.onCapture,
        })
      );

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(mockCallbacks.onCapture).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key for capture when active', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, {
          isActive: true,
          onCapture: mockCallbacks.onCapture,
        })
      );

      fireEvent.keyDown(document, { key: ' ' });

      expect(mockCallbacks.onCapture).toHaveBeenCalledTimes(1);
    });

    it('should not handle capture keys when inactive', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, {
          isActive: false,
          onCapture: mockCallbacks.onCapture,
        })
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: ' ' });

      expect(mockCallbacks.onCapture).not.toHaveBeenCalled();
    });

    it('should handle arrow keys for focus area movement when active', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, {
          isActive: true,
          onFocusAreaChange: mockCallbacks.onFocusAreaChange,
        })
      );

      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(mockCallbacks.onFocusAreaChange).toHaveBeenCalledWith({ x: 0, y: -10 });

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      expect(mockCallbacks.onFocusAreaChange).toHaveBeenCalledWith({ x: 0, y: 10 });

      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(mockCallbacks.onFocusAreaChange).toHaveBeenCalledWith({ x: -10, y: 0 });

      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(mockCallbacks.onFocusAreaChange).toHaveBeenCalledWith({ x: 10, y: 0 });
    });

    it('should handle blur adjustment keys when active', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, {
          isActive: true,
          onBlurAdjust: mockCallbacks.onBlurAdjust,
        })
      );

      fireEvent.keyDown(document, { key: '+' });
      expect(mockCallbacks.onBlurAdjust).toHaveBeenCalledWith(1);

      fireEvent.keyDown(document, { key: '=' });
      expect(mockCallbacks.onBlurAdjust).toHaveBeenCalledWith(1);

      fireEvent.keyDown(document, { key: '-' });
      expect(mockCallbacks.onBlurAdjust).toHaveBeenCalledWith(-1);
    });

    it('should handle mode change keys', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, {
          isActive: true,
          onModeChange: mockCallbacks.onModeChange,
        })
      );

      fireEvent.keyDown(document, { key: '1' });
      expect(mockCallbacks.onModeChange).toHaveBeenCalledWith('camera');

      fireEvent.keyDown(document, { key: '2' });
      expect(mockCallbacks.onModeChange).toHaveBeenCalledWith('technical');

      fireEvent.keyDown(document, { key: '3' });
      expect(mockCallbacks.onModeChange).toHaveBeenCalledWith('capture');
    });

    it('should show help overlay when ? key is pressed', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, { isActive: true })
      );

      fireEvent.keyDown(document, { key: '?' });

      expect(screen.getByText('Keyboard Shortcuts')).toBeTruthy();
      expect(screen.getByText('Toggle viewfinder on/off')).toBeTruthy();
    });

    it('should hide help overlay when Escape is pressed', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, { isActive: true })
      );

      // Show help first
      fireEvent.keyDown(document, { key: '?' });
      expect(screen.getByText('Keyboard Shortcuts')).toBeTruthy();

      // Hide help with Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('Keyboard Shortcuts')).toBeFalsy();
    });

    it('should show keyboard status indicator when active', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, { isActive: true })
      );

      expect(screen.getByText('Keyboard controls active')).toBeTruthy();
    });

    it('should not show keyboard status indicator when inactive', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, { isActive: false })
      );

      expect(screen.queryByText('Keyboard controls active')).toBeFalsy();
    });

    it('should have proper accessibility attributes', () => {
      const { container } = renderWithTestUtils(
        React.createElement(KeyboardControls, { isActive: true })
      );

      const controlsElement = container.querySelector('[role="application"]');
      expect(controlsElement).toBeTruthy();
      expect(controlsElement?.getAttribute('aria-label')).toBe('Viewfinder keyboard controls');

      const liveRegion = container.querySelector('[role="status"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
    });

    it('should announce actions for screen readers', () => {
      renderWithTestUtils(
        React.createElement(KeyboardControls, {
          isActive: true,
          onCapture: mockCallbacks.onCapture,
        })
      );

      fireEvent.keyDown(document, { key: 'Enter' });

      // Should announce the action
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.textContent).toContain('Photo captured');
    });
  });

  describe('useKeyboardControls Hook', () => {
    const TestComponent = ({ isActive }: { isActive: boolean }) => {
      const { handleKeyPress, isHelpVisible, lastAction } = useKeyboardControls(mockCallbacks);

      React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          handleKeyPress(e.key, isActive);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, [handleKeyPress, isActive]);

      return (
        <div>
          <div data-testid="help-visible">{isHelpVisible.toString()}</div>
          <div data-testid="last-action">{lastAction}</div>
        </div>
      );
    };

    it('should handle key presses correctly', () => {
      renderWithTestUtils(
        React.createElement(TestComponent, { isActive: true })
      );

      fireEvent.keyDown(document, { key: 'v' });

      expect(mockCallbacks.onToggleViewfinder).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('last-action')).toHaveTextContent('toggle');
    });

    it('should handle capture key when active', () => {
      renderWithTestUtils(
        React.createElement(TestComponent, { isActive: true })
      );

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(mockCallbacks.onCapture).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('last-action')).toHaveTextContent('capture');
    });

    it('should handle help toggle', () => {
      renderWithTestUtils(
        React.createElement(TestComponent, { isActive: true })
      );

      expect(screen.getByTestId('help-visible')).toHaveTextContent('false');

      fireEvent.keyDown(document, { key: '?' });

      expect(screen.getByTestId('help-visible')).toHaveTextContent('true');
      expect(screen.getByTestId('last-action')).toHaveTextContent('help');
    });

    it('should handle focus movement keys', () => {
      renderWithTestUtils(
        React.createElement(TestComponent, { isActive: true })
      );

      fireEvent.keyDown(document, { key: 'ArrowUp' });
      expect(mockCallbacks.onFocusMove).toHaveBeenCalledWith({ x: 0, y: -10 });
      expect(screen.getByTestId('last-action')).toHaveTextContent('focus-up');

      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(mockCallbacks.onFocusMove).toHaveBeenCalledWith({ x: -10, y: 0 });
      expect(screen.getByTestId('last-action')).toHaveTextContent('focus-left');
    });

    it('should handle blur adjustment keys', () => {
      renderWithTestUtils(
        React.createElement(TestComponent, { isActive: true })
      );

      fireEvent.keyDown(document, { key: '+' });
      expect(mockCallbacks.onBlurAdjust).toHaveBeenCalledWith(1);
      expect(screen.getByTestId('last-action')).toHaveTextContent('blur-increase');

      fireEvent.keyDown(document, { key: '-' });
      expect(mockCallbacks.onBlurAdjust).toHaveBeenCalledWith(-1);
      expect(screen.getByTestId('last-action')).toHaveTextContent('blur-decrease');
    });

    it('should ignore non-toggle keys when inactive', () => {
      renderWithTestUtils(
        React.createElement(TestComponent, { isActive: false })
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'ArrowUp' });

      expect(mockCallbacks.onCapture).not.toHaveBeenCalled();
      expect(mockCallbacks.onFocusMove).not.toHaveBeenCalled();
      expect(screen.getByTestId('last-action')).toHaveTextContent('');
    });

    it('should still handle toggle key when inactive', () => {
      renderWithTestUtils(
        React.createElement(TestComponent, { isActive: false })
      );

      fireEvent.keyDown(document, { key: 'v' });

      expect(mockCallbacks.onToggleViewfinder).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('last-action')).toHaveTextContent('toggle');
    });
  });
});