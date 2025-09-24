import { describe, it, expect, vi } from 'vitest';
import { renderWithTestUtils } from './utils';
import React from 'react';

describe('Testing Infrastructure Setup', () => {
  it('should have proper test environment setup', () => {
    expect(global.requestAnimationFrame).toBeDefined();
    expect(global.cancelAnimationFrame).toBeDefined();
    expect(global.ResizeObserver).toBeDefined();
    expect(global.IntersectionObserver).toBeDefined();
  });

  it('should mock performance.now correctly', () => {
    const time1 = performance.now();
    const time2 = performance.now();
    expect(typeof time1).toBe('number');
    expect(typeof time2).toBe('number');
  });

  it('should render simple component', () => {
    const TestComponent = () => React.createElement('div', { 'data-testid': 'test' }, 'Hello Test');
    const { getByTestId } = renderWithTestUtils(React.createElement(TestComponent));
    expect(getByTestId('test')).toHaveTextContent('Hello Test');
  });

  it('should handle mouse events', () => {
    const mockHandler = vi.fn();
    document.addEventListener('mousemove', mockHandler);

    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 200 });
    document.dispatchEvent(event);

    expect(mockHandler).toHaveBeenCalledWith(event);

    document.removeEventListener('mousemove', mockHandler);
  });
});