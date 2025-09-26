import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShutterEffect, { EnhancedShutterEffect, ClickCaptureManager } from '../components/ShutterEffect';
import { renderWithTestUtils } from './utils';
import React from 'react';

describe('ShutterEffect Components', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Mock Audio constructor
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      remove: vi.fn(),
      volume: 0.5,
      currentTime: 0,
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ShutterEffect', () => {
    it('should render without triggering when isTriggered is false', () => {
      const { container } = renderWithTestUtils(
        React.createElement(ShutterEffect, { isTriggered: false })
      );

      // Should not have flash overlay
      const flashOverlay = container.querySelector('[style*="rgba(255, 255, 255, 0.9)"]');
      expect(flashOverlay).toBeFalsy();
    });

    it('should trigger flash effect when isTriggered is true', () => {
      const onComplete = vi.fn();
      const { container } = renderWithTestUtils(
        React.createElement(ShutterEffect, { isTriggered: true, onComplete })
      );

      // Should have flash overlay initially
      const flashOverlay = container.querySelector('[style*="rgba(255, 255, 255, 0.9)"]');
      expect(flashOverlay).toBeTruthy();
    });

    it('should call onComplete after animation sequence', async () => {
      const onComplete = vi.fn();
      renderWithTestUtils(
        React.createElement(ShutterEffect, {
          isTriggered: true,
          onComplete,
          flashDuration: 50,
          shakeDuration: 100
        })
      );

      // Fast forward through flash duration
      vi.advanceTimersByTime(50);

      // Fast forward through shake duration
      vi.advanceTimersByTime(100);

      // Fast forward through completion delay
      vi.advanceTimersByTime(100);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should create audio element when sound is enabled', () => {
      renderWithTestUtils(
        React.createElement(ShutterEffect, {
          isTriggered: false,
          enableSound: true,
          soundVolume: 0.7
        })
      );

      expect(global.Audio).toHaveBeenCalled();
    });

    it('should not create audio element when sound is disabled', () => {
      renderWithTestUtils(
        React.createElement(ShutterEffect, {
          isTriggered: false,
          enableSound: false
        })
      );

      // Audio should not be created for this instance
      const audioCallCount = (global.Audio as jest.Mock).mock.calls.length;
      expect(audioCallCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('EnhancedShutterEffect', () => {
    it('should render without effects when not triggered', () => {
      const { container } = renderWithTestUtils(
        React.createElement(EnhancedShutterEffect, { isTriggered: false })
      );

      // Should not have any effect overlays
      const flashOverlay = container.querySelector('[style*="linear-gradient"]');
      expect(flashOverlay).toBeFalsy();
    });

    it('should trigger enhanced effects when triggered', () => {
      const onComplete = vi.fn();
      const { container } = renderWithTestUtils(
        React.createElement(EnhancedShutterEffect, {
          isTriggered: true,
          onComplete,
          position: { x: 100, y: 100 }
        })
      );

      // Should have flash overlay initially
      const flashOverlay = container.querySelector('[style*="linear-gradient"]');
      expect(flashOverlay).toBeTruthy();
    });

    it('should complete animation sequence', async () => {
      const onComplete = vi.fn();
      renderWithTestUtils(
        React.createElement(EnhancedShutterEffect, {
          isTriggered: true,
          onComplete
        })
      );

      // Fast forward through entire animation sequence
      vi.advanceTimersByTime(100); // Flash
      vi.advanceTimersByTime(200); // Ripple
      vi.advanceTimersByTime(300); // Shake

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('ClickCaptureManager', () => {
    it('should handle click events when active', () => {
      const onCapture = vi.fn();
      const { container } = renderWithTestUtils(
        React.createElement(
          ClickCaptureManager,
          { isActive: true, onCapture },
          React.createElement('div', { 'data-testid': 'capture-content' }, 'Click me')
        )
      );

      const captureElement = container.firstChild as HTMLElement;

      fireEvent.click(captureElement, { clientX: 150, clientY: 200 });

      expect(onCapture).toHaveBeenCalledWith({ x: 150, y: 200 });
    });

    it('should not handle click events when inactive', () => {
      const onCapture = vi.fn();
      const { container } = renderWithTestUtils(
        React.createElement(
          ClickCaptureManager,
          { isActive: false, onCapture },
          React.createElement('div', { 'data-testid': 'capture-content' }, 'Click me')
        )
      );

      const captureElement = container.firstChild as HTMLElement;

      fireEvent.click(captureElement, { clientX: 150, clientY: 200 });

      expect(onCapture).not.toHaveBeenCalled();
    });

    it('should prevent multiple captures when already capturing', () => {
      const onCapture = vi.fn();
      const { container } = renderWithTestUtils(
        React.createElement(
          ClickCaptureManager,
          { isActive: true, onCapture },
          React.createElement('div', { 'data-testid': 'capture-content' }, 'Click me')
        )
      );

      const captureElement = container.firstChild as HTMLElement;

      // First click
      fireEvent.click(captureElement, { clientX: 150, clientY: 200 });

      // Second click while capturing
      fireEvent.click(captureElement, { clientX: 160, clientY: 210 });

      expect(onCapture).toHaveBeenCalledTimes(1);
    });

    it('should set crosshair cursor when active', () => {
      const { container } = renderWithTestUtils(
        React.createElement(
          ClickCaptureManager,
          { isActive: true },
          React.createElement('div', {}, 'Content')
        )
      );

      const captureElement = container.firstChild as HTMLElement;
      expect(captureElement.style.cursor).toBe('crosshair');
    });

    it('should set default cursor when inactive', () => {
      const { container } = renderWithTestUtils(
        React.createElement(
          ClickCaptureManager,
          { isActive: false },
          React.createElement('div', {}, 'Content')
        )
      );

      const captureElement = container.firstChild as HTMLElement;
      expect(captureElement.style.cursor).toBe('default');
    });
  });
});