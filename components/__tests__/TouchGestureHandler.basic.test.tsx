/**
 * Basic TouchGestureHandler Component Tests
 * Simplified tests to validate core functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TouchGestureHandler } from '../TouchGestureHandler';
import type { TouchGestureHandlerProps } from '../../types/canvas';

// Mock performance monitoring
vi.mock('../../utils/canvasPerformanceMonitor', () => ({
  measureCanvasOperation: vi.fn((name, fn) => fn()),
}));

describe('TouchGestureHandler Basic Functionality', () => {
  const mockOnGestureStart = vi.fn();
  const mockOnGestureMove = vi.fn();
  const mockOnGestureEnd = vi.fn();

  const defaultProps: TouchGestureHandlerProps = {
    onGestureStart: mockOnGestureStart,
    onGestureMove: mockOnGestureMove,
    onGestureEnd: mockOnGestureEnd,
    sensitivity: {
      pan: 1.0,
      zoom: 1.0,
      tap: 44,
    },
    debugMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    expect(() => {
      render(<TouchGestureHandler {...defaultProps} />);
    }).not.toThrow();
  });

  it('should render touch area with proper accessibility attributes', () => {
    render(<TouchGestureHandler {...defaultProps} />);

    const touchArea = screen.getByRole('application');
    expect(touchArea).toBeInTheDocument();
    expect(touchArea).toHaveAttribute('aria-label', 'Touch gesture area');
  });

  it('should apply debug styles when debugMode is enabled', () => {
    render(<TouchGestureHandler {...defaultProps} debugMode={true} />);

    const touchArea = screen.getByRole('application');
    expect(touchArea).toHaveClass('touch-debug');
  });

  it('should have correct CSS classes applied', () => {
    render(<TouchGestureHandler {...defaultProps} className="custom-class" />);

    const touchArea = screen.getByRole('application');
    expect(touchArea).toHaveClass('touch-gesture-handler');
    expect(touchArea).toHaveClass('absolute');
    expect(touchArea).toHaveClass('inset-0');
    expect(touchArea).toHaveClass('w-full');
    expect(touchArea).toHaveClass('h-full');
    expect(touchArea).toHaveClass('custom-class');
  });

  it('should have proper touch event attributes', () => {
    render(<TouchGestureHandler {...defaultProps} />);

    const touchArea = screen.getByRole('application');
    expect(touchArea.style.touchAction).toBe('none');
    expect(touchArea.style.userSelect).toBe('none');
  });

  it('should display debug information when debugMode is true', () => {
    render(<TouchGestureHandler {...defaultProps} debugMode={true} />);

    // Should show debug overlay
    expect(screen.getByText('Gesture: none')).toBeInTheDocument();
    expect(screen.getByText('Active: false')).toBeInTheDocument();
  });

  it('should pass sensitivity props correctly', () => {
    const customSensitivity = {
      pan: 2.0,
      zoom: 1.5,
      tap: 60,
    };

    const { rerender } = render(
      <TouchGestureHandler {...defaultProps} sensitivity={customSensitivity} />
    );

    // Component should render without issues with custom sensitivity
    expect(screen.getByRole('application')).toBeInTheDocument();

    // Rerender with different sensitivity
    rerender(
      <TouchGestureHandler {...defaultProps} sensitivity={{ pan: 0.5, zoom: 0.5, tap: 30 }} />
    );

    expect(screen.getByRole('application')).toBeInTheDocument();
  });

  it('should be reusable with different prop configurations', () => {
    const config1 = { ...defaultProps, debugMode: true };
    const config2 = { ...defaultProps, debugMode: false, className: 'test-class' };

    const { rerender } = render(<TouchGestureHandler {...config1} />);
    expect(screen.getByRole('application')).toHaveClass('touch-debug');

    rerender(<TouchGestureHandler {...config2} />);
    expect(screen.getByRole('application')).not.toHaveClass('touch-debug');
    expect(screen.getByRole('application')).toHaveClass('test-class');
  });
});