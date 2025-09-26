import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
}

export class ViewfinderErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ViewfinderErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      eventId: `viewfinder-error-${Date.now()}`,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-reset after 5 seconds to allow recovery
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 5000);
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset if hasError and resetKeys changed
    if (hasError && resetKeys !== prevProps.resetKeys) {
      if (resetKeys) {
        const prevResetKeys = prevProps.resetKeys || [];
        if (resetKeys.length !== prevResetKeys.length ||
            resetKeys.some((key, i) => key !== prevResetKeys[i])) {
          this.resetErrorBoundary();
        }
      }
    }

    // Reset if hasError and resetOnPropsChange is true
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  public componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      eventId: undefined,
    });
  };

  public render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <ViewfinderErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

// Default error fallback component
interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  onRetry: () => void;
}

const ViewfinderErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white/10 border border-white/20 rounded-lg p-6 max-w-md mx-4 text-white">
        <div className="flex items-center mb-4">
          <svg
            className="w-6 h-6 text-red-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold">Viewfinder Unavailable</h3>
        </div>

        <p className="text-white/80 mb-4">
          The camera viewfinder encountered an issue and couldn't load properly.
          This might be due to browser compatibility or a temporary glitch.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white font-medium transition-colors"
          >
            Reload Page
          </button>
        </div>

        {isDevelopment && error && (
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer text-orange-400 hover:text-orange-300">
              Technical Details
            </summary>
            <div className="mt-2 p-2 bg-black/20 rounded font-mono text-red-300">
              <div className="font-semibold">Error: {error.name}</div>
              <div className="mt-1">{error.message}</div>
              {error.stack && (
                <div className="mt-2 text-xs opacity-80">
                  <div className="font-semibold">Stack Trace:</div>
                  <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

// Helper hook for using error boundary
export const useViewfinderErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError, error };
};

// Higher-order component for wrapping components with error boundary
export const withViewfinderErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ViewfinderErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ViewfinderErrorBoundary>
  );

  WrappedComponent.displayName = `withViewfinderErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Graceful degradation component
export const ViewfinderGracefulDegradation: React.FC<{
  children: ReactNode;
  fallbackMessage?: string;
  showFallback?: boolean;
}> = ({
  children,
  fallbackMessage = "Camera viewfinder is temporarily unavailable.",
  showFallback = false
}) => {
  if (showFallback) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-sm">{fallbackMessage}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ViewfinderErrorBoundary;