import { useState, useEffect, useCallback } from 'react';

interface SimplePerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  frameRate: number;
  loadTime: number;
}

interface SimplePerformanceHook {
  metrics: SimplePerformanceMetrics;
  isOptimal: boolean;
  trackCustomEvent: (name: string, duration: number) => void;
}

const PERFORMANCE_THRESHOLDS = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  frameRate: 55 // Allow some tolerance
};

/**
 * Simplified performance monitoring using native browser APIs
 * Replaces the 489-line over-engineered usePerformanceMonitoring
 */
export function useSimplePerformance(): SimplePerformanceHook {
  const [metrics, setMetrics] = useState<SimplePerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    frameRate: 60,
    loadTime: 0
  });

  // Track Core Web Vitals using native PerformanceObserver
  useEffect(() => {
    const observers: PerformanceObserver[] = [];

    // Large Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        observers.push(lcpObserver);
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime;
            setMetrics(prev => ({ ...prev, fid }));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        observers.push(fidObserver);
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              setMetrics(prev => ({ ...prev, cls: clsValue }));
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        observers.push(clsObserver);
      } catch (e) {
        // CLS not supported
      }
    }

    // Simple frame rate tracking - safe performance API access
    let frameCount = 0;
    let lastTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    const trackFrame = (timestamp: number) => {
      frameCount++;

      if (timestamp - lastTime >= 1000) { // Every second
        const fps = Math.round((frameCount * 1000) / (timestamp - lastTime));
        setMetrics(prev => ({ ...prev, frameRate: fps }));
        frameCount = 0;
        lastTime = timestamp;
      }

      requestAnimationFrame(trackFrame);
    };

    requestAnimationFrame(trackFrame);

    // Load time from Navigation Timing API - safe access
    const updateLoadTime = () => {
      if (typeof performance === 'undefined' || !performance.getEntriesByType) return;
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        const loadTime = navTiming.loadEventEnd - navTiming.loadEventStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }
    };

    if (document.readyState === 'complete') {
      updateLoadTime();
    } else {
      window.addEventListener('load', updateLoadTime, { once: true });
    }

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  const isOptimal =
    metrics.lcp <= PERFORMANCE_THRESHOLDS.lcp &&
    metrics.fid <= PERFORMANCE_THRESHOLDS.fid &&
    metrics.cls <= PERFORMANCE_THRESHOLDS.cls &&
    metrics.frameRate >= PERFORMANCE_THRESHOLDS.frameRate;

  const trackCustomEvent = useCallback((name: string, duration: number) => {
    // Simple custom timing - could integrate with analytics
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-${duration}ms`);
    }
  }, []);

  return {
    metrics,
    isOptimal,
    trackCustomEvent
  };
}