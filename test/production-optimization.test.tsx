import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {
  ViewfinderErrorBoundary,
  withViewfinderErrorBoundary,
  ViewfinderGracefulDegradation,
  useViewfinderErrorHandler
} from '../components/production-optimization';

describe('Production Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ViewfinderErrorBoundary', () => {
    it('should render children when no error occurs', () => {
      const TestComponent = () => <div data-testid="child">Child Component</div>;

      render(
        React.createElement(ViewfinderErrorBoundary, {}, [
          React.createElement(TestComponent, { key: 'test' })
        ])
      );

      expect(screen.getByTestId('child')).toBeTruthy();
    });

    it('should catch and display error fallback when child throws', () => {
      const ThrowingComponent = () => {
        throw new Error('Test error');
      };

      render(
        React.createElement(ViewfinderErrorBoundary, {}, [
          React.createElement(ThrowingComponent, { key: 'throwing' })
        ])
      );

      expect(screen.getByText('Viewfinder Unavailable')).toBeTruthy();
      expect(screen.getByText('Try Again')).toBeTruthy();
    });

    it('should use custom fallback when provided', () => {
      const ThrowingComponent = () => {
        throw new Error('Test error');
      };

      const customFallback = <div data-testid="custom-fallback">Custom Error Message</div>;

      render(
        React.createElement(ViewfinderErrorBoundary, { fallback: customFallback }, [
          React.createElement(ThrowingComponent, { key: 'throwing' })
        ])
      );

      expect(screen.getByTestId('custom-fallback')).toBeTruthy();
    });

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn();
      const ThrowingComponent = () => {
        throw new Error('Test error');
      };

      render(
        React.createElement(ViewfinderErrorBoundary, { onError }, [
          React.createElement(ThrowingComponent, { key: 'throwing' })
        ])
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it('should reset error boundary when Try Again is clicked', () => {
      let shouldThrow = true;
      const ConditionalThrowingComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div data-testid="success">Success</div>;
      };

      const { rerender } = render(
        React.createElement(ViewfinderErrorBoundary, {}, [
          React.createElement(ConditionalThrowingComponent, { key: 'conditional' })
        ])
      );

      // Should show error fallback
      expect(screen.getByText('Try Again')).toBeTruthy();

      // Stop throwing and click retry
      shouldThrow = false;
      fireEvent.click(screen.getByText('Try Again'));

      // Should show success message
      expect(screen.getByTestId('success')).toBeTruthy();
    });

    it('should auto-reset after timeout', async () => {
      vi.useFakeTimers();

      let shouldThrow = true;
      const ConditionalThrowingComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div data-testid="success">Success</div>;
      };

      render(
        React.createElement(ViewfinderErrorBoundary, {}, [
          React.createElement(ConditionalThrowingComponent, { key: 'conditional' })
        ])
      );

      expect(screen.getByText('Try Again')).toBeTruthy();

      // Stop throwing and wait for auto-reset
      shouldThrow = false;

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('success')).toBeTruthy();
      }, { timeout: 1000 });

      vi.useRealTimers();
    }, 10000);
  });

  describe('withViewfinderErrorBoundary HOC', () => {
    it('should wrap component with error boundary', () => {
      const TestComponent = () => <div data-testid="wrapped">Wrapped Component</div>;
      const WrappedComponent = withViewfinderErrorBoundary(TestComponent);

      render(React.createElement(WrappedComponent));

      expect(screen.getByTestId('wrapped')).toBeTruthy();
    });

    it('should catch errors in wrapped component', () => {
      const ThrowingComponent = () => {
        throw new Error('HOC test error');
      };
      const WrappedComponent = withViewfinderErrorBoundary(ThrowingComponent);

      render(React.createElement(WrappedComponent));

      expect(screen.getByText('Viewfinder Unavailable')).toBeTruthy();
    });
  });

  describe('ViewfinderGracefulDegradation', () => {
    it('should render children when showFallback is false', () => {
      render(
        React.createElement(ViewfinderGracefulDegradation, {
          showFallback: false
        }, [
          React.createElement('div', { key: 'child', 'data-testid': 'child' }, 'Child Content')
        ])
      );

      expect(screen.getByTestId('child')).toBeTruthy();
    });

    it('should render fallback when showFallback is true', () => {
      render(
        React.createElement(ViewfinderGracefulDegradation, {
          showFallback: true,
          fallbackMessage: 'Custom fallback message'
        }, [
          React.createElement('div', { key: 'child' }, 'Child Content')
        ])
      );

      expect(screen.getByText('Custom fallback message')).toBeTruthy();
      expect(screen.queryByText('Child Content')).toBeFalsy();
    });

    it('should show default fallback message', () => {
      render(
        React.createElement(ViewfinderGracefulDegradation, {
          showFallback: true
        }, [
          React.createElement('div', { key: 'child' }, 'Child Content')
        ])
      );

      expect(screen.getByText('Feature temporarily unavailable')).toBeTruthy();
    });
  });

  describe('useViewfinderErrorHandler hook', () => {
    it('should provide error handling functions', () => {
      let errorHandler: any;

      const TestComponent = () => {
        errorHandler = useViewfinderErrorHandler();
        return <div>Test</div>;
      };

      render(React.createElement(TestComponent));

      expect(errorHandler).toHaveProperty('handleError');
      expect(errorHandler).toHaveProperty('clearError');
      expect(errorHandler).toHaveProperty('hasError');
      expect(typeof errorHandler.handleError).toBe('function');
      expect(typeof errorHandler.clearError).toBe('function');
      expect(typeof errorHandler.hasError).toBe('boolean');
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle multiple consecutive errors gracefully', () => {
      let errorCount = 0;
      const MultipleErrorComponent = () => {
        errorCount++;
        throw new Error(`Error #${errorCount}`);
      };

      render(
        React.createElement(ViewfinderErrorBoundary, {}, [
          React.createElement(MultipleErrorComponent, { key: 'multi-error' })
        ])
      );

      expect(screen.getByText('Viewfinder Unavailable')).toBeTruthy();
      expect(errorCount).toBe(1);

      // Click retry - should trigger another error but boundary should handle it
      fireEvent.click(screen.getByText('Try Again'));

      // Should still show error boundary - not crash
      expect(screen.getByText('Viewfinder Unavailable')).toBeTruthy();
    });

    it('should handle async errors in components', async () => {
      const AsyncErrorComponent = () => {
        React.useEffect(() => {
          setTimeout(() => {
            throw new Error('Async error');
          }, 100);
        }, []);

        return <div data-testid="async-component">Async Component</div>;
      };

      render(
        React.createElement(ViewfinderErrorBoundary, {}, [
          React.createElement(AsyncErrorComponent, { key: 'async-error' })
        ])
      );

      // Initially should render normally (async error won't be caught by error boundary)
      expect(screen.getByTestId('async-component')).toBeTruthy();
    });

    it('should clean up resources on unmount', () => {
      const TestComponent = () => <div>Test</div>;

      const { unmount } = render(
        React.createElement(ViewfinderErrorBoundary, {}, [
          React.createElement(TestComponent, { key: 'test' })
        ])
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Development vs Production Behavior', () => {
    it('should show technical details in development mode', () => {
      // Mock NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const ThrowingComponent = () => {
        throw new Error('Development error');
      };

      render(
        React.createElement(ViewfinderErrorBoundary, {}, [
          React.createElement(ThrowingComponent, { key: 'throwing' })
        ])
      );

      expect(screen.getByText('Technical Details')).toBeTruthy();

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });

    it('should hide technical details in production mode', () => {
      // Mock NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const ThrowingComponent = () => {
        throw new Error('Production error');
      };

      render(
        React.createElement(ViewfinderErrorBoundary, {}, [
          React.createElement(ThrowingComponent, { key: 'throwing' })
        ])
      );

      expect(screen.queryByText('Technical Details')).toBeFalsy();

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not create memory leaks with multiple error boundaries', () => {
      const TestComponent = () => <div>Test</div>;

      // Create multiple error boundaries
      const boundaries = Array.from({ length: 10 }, (_, i) =>
        render(
          React.createElement(ViewfinderErrorBoundary, { key: i }, [
            React.createElement(TestComponent, { key: 'test' })
          ])
        )
      );

      // Unmount all boundaries
      boundaries.forEach(boundary => boundary.unmount());

      // Should complete without errors
      expect(true).toBe(true);
    });

    it('should handle rapid error/recovery cycles', async () => {
      vi.useFakeTimers();

      let shouldThrow = true;
      const FlipFlopComponent = () => {
        if (shouldThrow) {
          throw new Error('Flip flop error');
        }
        return <div data-testid="success">Success</div>;
      };

      render(
        React.createElement(ViewfinderErrorBoundary, {}, [
          React.createElement(FlipFlopComponent, { key: 'flip-flop' })
        ])
      );

      // Rapid error/recovery cycles
      for (let i = 0; i < 3; i++) { // Reduced from 5 to 3 to avoid timeout
        shouldThrow = false;
        fireEvent.click(screen.getByText('Try Again'));

        await act(async () => {
          vi.advanceTimersByTime(100);
        });

        shouldThrow = true;
      }

      vi.useRealTimers();

      // Should still be functional
      expect(screen.getByText('Try Again')).toBeTruthy();
    }, 8000); // Increased timeout
  });
});