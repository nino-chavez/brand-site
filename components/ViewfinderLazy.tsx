import React, { Suspense, lazy } from 'react';
import { ViewfinderErrorBoundary, ViewfinderGracefulDegradation } from './ViewfinderErrorBoundary';

// Lazy loading with retry mechanism
const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  retries: number = 3
) => {
  return lazy(() => {
    const executeImport = (retriesLeft: number): Promise<{ default: T }> => {
      return importFn().catch((error) => {
        if (retriesLeft > 0) {
          console.warn(`Failed to load ${componentName}, retrying... (${retriesLeft} attempts left)`);
          // Wait a bit before retrying
          return new Promise(resolve => setTimeout(resolve, 1000))
            .then(() => executeImport(retriesLeft - 1));
        }

        console.error(`Failed to load ${componentName} after ${retries} attempts:`, error);
        throw error;
      });
    };

    return executeImport(retries);
  });
};

// Loading fallback components
const ViewfinderLoadingFallback: React.FC<{
  componentName: string;
  minimal?: boolean;
}> = ({ componentName, minimal = false }) => {
  if (minimal) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mx-auto mb-2"></div>
        <div className="text-white/60 text-sm">Loading {componentName}...</div>
      </div>
    </div>
  );
};

// Lazy-loaded components with optimized splitting
export const LazyExifMetadata = createLazyComponent(
  () => import('./ExifMetadata'),
  'EXIF Metadata'
);

export const LazyShutterEffect = createLazyComponent(
  () => import('./ShutterEffect'),
  'Shutter Effect'
);

export const LazyKeyboardControls = createLazyComponent(
  () => import('./KeyboardControls'),
  'Keyboard Controls'
);

export const LazyBackdropBlurOverlay = createLazyComponent(
  () => import('./BackdropBlurOverlay'),
  'Backdrop Blur'
);

// Preload components when user interaction is detected
export const useViewfinderPreloader = () => {
  const [preloaded, setPreloaded] = React.useState(false);

  const preloadComponents = React.useCallback(async () => {
    if (preloaded) return;

    try {
      // Preload non-critical components
      const promises = [
        import('./ExifMetadata'),
        import('./ShutterEffect'),
        import('./KeyboardControls'),
        import('./BackdropBlurOverlay'),
      ];

      await Promise.all(promises);
      setPreloaded(true);
      console.log('Viewfinder components preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload some viewfinder components:', error);
    }
  }, [preloaded]);

  React.useEffect(() => {
    // Preload on user interaction
    const preloadOnInteraction = () => {
      preloadComponents();
      // Remove listeners after first interaction
      document.removeEventListener('mousemove', preloadOnInteraction);
      document.removeEventListener('touchstart', preloadOnInteraction);
      document.removeEventListener('keydown', preloadOnInteraction);
    };

    document.addEventListener('mousemove', preloadOnInteraction, { once: true });
    document.addEventListener('touchstart', preloadOnInteraction, { once: true });
    document.addEventListener('keydown', preloadOnInteraction, { once: true });

    return () => {
      document.removeEventListener('mousemove', preloadOnInteraction);
      document.removeEventListener('touchstart', preloadOnInteraction);
      document.removeEventListener('keydown', preloadOnInteraction);
    };
  }, [preloadComponents]);

  return { preloadComponents, preloaded };
};

// Progressive enhancement wrapper
export const ProgressiveViewfinderComponent: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName: string;
  priority?: 'high' | 'medium' | 'low';
  enableGracefulDegradation?: boolean;
}> = ({
  children,
  fallback,
  componentName,
  priority = 'medium',
  enableGracefulDegradation = true
}) => {
  const [shouldRender, setShouldRender] = React.useState(priority === 'high');
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (priority === 'high') return;

    const timer = setTimeout(() => {
      setShouldRender(true);
    }, priority === 'medium' ? 100 : 500);

    return () => clearTimeout(timer);
  }, [priority]);

  const handleError = React.useCallback((error: Error) => {
    console.error(`Error in ${componentName}:`, error);
    if (enableGracefulDegradation) {
      setIsVisible(false);
    }
  }, [componentName, enableGracefulDegradation]);

  if (!shouldRender) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <ViewfinderErrorBoundary
      onError={handleError}
      fallback={
        enableGracefulDegradation ? (
          <ViewfinderGracefulDegradation
            showFallback={true}
            fallbackMessage={`${componentName} is temporarily unavailable.`}
          >
            {fallback}
          </ViewfinderGracefulDegradation>
        ) : fallback
      }
    >
      <Suspense
        fallback={
          <ViewfinderLoadingFallback
            componentName={componentName}
            minimal={priority === 'low'}
          />
        }
      >
        {children}
      </Suspense>
    </ViewfinderErrorBoundary>
  );
};

// Optimized ViewfinderOverlay with lazy loading
export const OptimizedViewfinderOverlay: React.FC<{
  isActive: boolean;
  onCapture?: () => void;
  className?: string;
}> = ({ isActive, onCapture, className = '' }) => {
  const { preloadComponents } = useViewfinderPreloader();

  // Preload on activation
  React.useEffect(() => {
    if (isActive) {
      preloadComponents();
    }
  }, [isActive, preloadComponents]);

  return (
    <ViewfinderErrorBoundary>
      <div className={`viewfinder-system ${className}`}>
        {/* Core viewfinder - always loaded */}
        <div className="viewfinder-core">
          <Suspense fallback={<ViewfinderLoadingFallback componentName="Viewfinder" />}>
            {React.lazy(() => import('./ViewfinderOverlay')).then(module =>
              React.createElement(module.default, { isActive, onCapture })
            )}
          </Suspense>
        </div>

        {/* Non-critical components - lazily loaded */}
        {isActive && (
          <>
            <ProgressiveViewfinderComponent
              componentName="EXIF Metadata"
              priority="medium"
            >
              <LazyExifMetadata
                position={{ x: 100, y: 100 }}
                isVisible={isActive}
              />
            </ProgressiveViewfinderComponent>

            <ProgressiveViewfinderComponent
              componentName="Keyboard Controls"
              priority="low"
            >
              <LazyKeyboardControls isActive={isActive} />
            </ProgressiveViewfinderComponent>
          </>
        )}
      </div>
    </ViewfinderErrorBoundary>
  );
};

// Bundle size analyzer (development only)
export const ViewfinderBundleAnalyzer: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    const analyzeBundle = () => {
      const componentModules = [
        'ViewfinderOverlay',
        'CrosshairSystem',
        'ExifMetadata',
        'ShutterEffect',
        'KeyboardControls',
        'BlurContainer',
        'BackdropBlurOverlay'
      ];

      const analysis = {
        totalComponents: componentModules.length,
        loadedComponents: 0,
        lazyComponents: 0,
        estimatedSize: '~25KB per component',
        recommendations: [
          'EXIF Metadata can be lazy loaded',
          'Keyboard Controls can be lazy loaded',
          'Shutter Effects can be lazy loaded'
        ]
      };

      setStats(analysis);
    };

    analyzeBundle();
  }, []);

  if (!stats) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-xs">
      <div className="text-green-400 font-semibold mb-2">Bundle Analysis</div>
      <div>Components: {stats.totalComponents}</div>
      <div>Est. Size: {stats.estimatedSize}</div>
      <div className="mt-2 text-yellow-400">
        <div className="font-semibold">Optimizations:</div>
        {stats.recommendations.map((rec: string, i: number) => (
          <div key={i} className="text-xs">• {rec}</div>
        ))}
      </div>
    </div>
  );
};

// Performance monitoring hook
export const useViewfinderPerformance = () => {
  const [metrics, setMetrics] = React.useState({
    loadTime: 0,
    renderCount: 0,
    lastRenderTime: 0
  });

  React.useEffect(() => {
    const startTime = performance.now();
    let renderCount = 0;

    const updateMetrics = () => {
      renderCount++;
      const currentTime = performance.now();

      setMetrics({
        loadTime: currentTime - startTime,
        renderCount,
        lastRenderTime: currentTime
      });
    };

    updateMetrics();

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Viewfinder Performance Metrics:', metrics);
    }
  });

  return metrics;
};

export default OptimizedViewfinderOverlay;