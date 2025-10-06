import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { VolleyballPhase } from '../../hooks/useVolleyballTiming';

export interface PerformanceMonitorProps {
  isActive: boolean;
  currentPhase: VolleyballPhase;
  frameRate?: number;
  onPerformanceDegradation?: (metrics: PerformanceAlert) => void;
  onBatteryOptimization?: (shouldOptimize: boolean) => void;
  className?: string;
}

export interface PerformanceMetrics {
  currentFPS: number;
  averageFPS: number;
  frameDrops: number;
  memoryUsage: MemoryMetrics;
  networkLatency: number;
  renderTime: number;
  batteryLevel?: number;
  isLowPowerMode?: boolean;
  gpuUtilization: number;
  compositeLayerCount: number;
}

export interface MemoryMetrics {
  used: number; // MB
  total: number; // MB
  percentage: number;
  garbageCollections: number;
  heapSize: number;
}

export interface PerformanceAlert {
  type: 'fps-drop' | 'memory-leak' | 'battery-low' | 'thermal-throttle' | 'network-slow';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metrics: Partial<PerformanceMetrics>;
  recommendations: string[];
  autoActions: AutoAction[];
}

export interface AutoAction {
  action: 'reduce-quality' | 'pause-animations' | 'limit-fps' | 'garbage-collect' | 'battery-save';
  applied: boolean;
  impact: string;
}

export interface SystemCapabilities {
  supportsPerformanceAPI: boolean;
  supportsMemoryAPI: boolean;
  supportsBatteryAPI: boolean;
  supportsIntersectionObserver: boolean;
  supportsRAF: boolean;
  devicePixelRatio: number;
  hardwareConcurrency: number;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  TARGET_FPS: 60,
  WARNING_FPS: 45,
  CRITICAL_FPS: 30,
  MAX_MEMORY_MB: 100,
  WARNING_MEMORY_PERCENT: 80,
  CRITICAL_MEMORY_PERCENT: 90,
  FRAME_DROP_THRESHOLD: 5,
  LOW_BATTERY_THRESHOLD: 20,
  HIGH_NETWORK_LATENCY: 200,
  RENDER_TIME_WARNING: 16.67, // 60fps frame budget
  COMPOSITE_LAYER_WARNING: 10
};

// Auto-optimization settings
const AUTO_OPTIMIZATIONS = {
  enableFrameRateReduction: true,
  enableQualityReduction: true,
  enableBatteryOptimization: true,
  enableMemoryCleanup: true,
  enableNetworkOptimization: true
};

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isActive,
  currentPhase,
  frameRate = 60,
  onPerformanceDegradation,
  onBatteryOptimization,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    currentFPS: 60,
    averageFPS: 60,
    frameDrops: 0,
    memoryUsage: { used: 0, total: 0, percentage: 0, garbageCollections: 0, heapSize: 0 },
    networkLatency: 0,
    renderTime: 0,
    gpuUtilization: 0,
    compositeLayerCount: 0
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [systemCapabilities, setSystemCapabilities] = useState<SystemCapabilities | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);

  const metricsHistoryRef = useRef<PerformanceMetrics[]>([]);
  const monitoringIntervalRef = useRef<number>();
  const frameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Detect system capabilities
  const detectSystemCapabilities = useCallback((): SystemCapabilities => {
    const capabilities: SystemCapabilities = {
      supportsPerformanceAPI: 'performance' in window && 'now' in performance,
      supportsMemoryAPI: 'memory' in (performance as any),
      supportsBatteryAPI: 'getBattery' in navigator,
      supportsIntersectionObserver: 'IntersectionObserver' in window,
      supportsRAF: 'requestAnimationFrame' in window,
      devicePixelRatio: window.devicePixelRatio || 1,
      hardwareConcurrency: navigator.hardwareConcurrency || 4
    };

    // Network information API
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      capabilities.connection = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      };
    }

    return capabilities;
  }, []);

  // Calculate FPS from frame timing
  const calculateFPS = useCallback((currentTime: number): number => {
    const deltaTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;

    if (deltaTime === 0) return 60;
    return Math.min(60, 1000 / deltaTime);
  }, []);

  // Get memory metrics
  const getMemoryMetrics = useCallback((): MemoryMetrics => {
    const defaultMetrics = {
      used: 0,
      total: 100,
      percentage: 0,
      garbageCollections: 0,
      heapSize: 0
    };

    if (!systemCapabilities?.supportsMemoryAPI) return defaultMetrics;

    try {
      const memory = (performance as any).memory;
      if (memory) {
        const used = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
        const total = memory.totalJSHeapSize / (1024 * 1024);

        return {
          used: Math.round(used),
          total: Math.round(total),
          percentage: Math.round((used / total) * 100),
          garbageCollections: metricsHistoryRef.current.filter(
            (m, i) => i > 0 && m.memoryUsage.used < metricsHistoryRef.current[i - 1].memoryUsage.used
          ).length,
          heapSize: memory.totalJSHeapSize
        };
      }
    } catch (error) {
      console.warn('Failed to get memory metrics:', error);
    }

    return defaultMetrics;
  }, [systemCapabilities]);

  // Estimate GPU utilization (approximation based on composite layers and animation complexity)
  const estimateGPUUtilization = useCallback((): number => {
    // Simplified estimation based on:
    // - Number of composite layers
    // - Current phase complexity
    // - Frame rate stability

    const phaseComplexity = {
      'setup': 0.2,
      'anticipation': 0.4,
      'approach': 0.7,
      'spike': 0.9,
      'impact': 1.0,
      'follow-through': 0.3
    }[currentPhase] || 0.5;

    const fpsRatio = metrics.currentFPS / PERFORMANCE_THRESHOLDS.TARGET_FPS;
    const layerPenalty = Math.min(metrics.compositeLayerCount / PERFORMANCE_THRESHOLDS.COMPOSITE_LAYER_WARNING, 1);

    return Math.min(100, (phaseComplexity * 40) + (layerPenalty * 30) + ((1 - fpsRatio) * 30));
  }, [currentPhase, metrics.currentFPS, metrics.compositeLayerCount]);

  // Collect comprehensive performance metrics
  const collectMetrics = useCallback(() => {
    const currentTime = performance.now();
    const currentFPS = calculateFPS(currentTime);
    frameCountRef.current++;

    // Calculate average FPS over last 60 frames
    const recentHistory = metricsHistoryRef.current.slice(-59);
    const averageFPS = recentHistory.length > 0
      ? (recentHistory.reduce((sum, m) => sum + m.currentFPS, 0) + currentFPS) / (recentHistory.length + 1)
      : currentFPS;

    // Count frame drops (FPS significantly below target)
    const frameDrops = recentHistory.filter(m => m.currentFPS < PERFORMANCE_THRESHOLDS.WARNING_FPS).length;

    // Calculate render time (frame budget usage)
    const renderTime = currentTime - frameTimeRef.current;
    frameTimeRef.current = currentTime;

    // Get composite layer count (approximation)
    const compositeLayerCount = document.querySelectorAll('[style*="transform"], [style*="opacity"], video, canvas').length;

    const newMetrics: PerformanceMetrics = {
      currentFPS: Math.round(currentFPS),
      averageFPS: Math.round(averageFPS),
      frameDrops,
      memoryUsage: getMemoryMetrics(),
      networkLatency: systemCapabilities?.connection?.rtt || 0,
      renderTime: Math.round(renderTime * 100) / 100,
      batteryLevel: batteryInfo?.level || undefined,
      isLowPowerMode: batteryInfo && batteryInfo.level < PERFORMANCE_THRESHOLDS.LOW_BATTERY_THRESHOLD && !batteryInfo.charging,
      gpuUtilization: estimateGPUUtilization(),
      compositeLayerCount
    };

    setMetrics(newMetrics);

    // Add to history (keep last 60 samples)
    metricsHistoryRef.current.push(newMetrics);
    if (metricsHistoryRef.current.length > 60) {
      metricsHistoryRef.current.shift();
    }

    // Check for performance issues
    checkPerformanceIssues(newMetrics);
  }, [calculateFPS, getMemoryMetrics, systemCapabilities, batteryInfo, currentPhase, estimateGPUUtilization]);

  // Check for performance issues and generate alerts
  const checkPerformanceIssues = useCallback((currentMetrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];

    // FPS degradation
    if (currentMetrics.averageFPS < PERFORMANCE_THRESHOLDS.CRITICAL_FPS) {
      newAlerts.push({
        type: 'fps-drop',
        severity: 'critical',
        message: `Critical FPS drop: ${currentMetrics.averageFPS}fps (target: ${PERFORMANCE_THRESHOLDS.TARGET_FPS}fps)`,
        timestamp: performance.now(),
        metrics: { currentFPS: currentMetrics.currentFPS, averageFPS: currentMetrics.averageFPS },
        recommendations: [
          'Reduce animation complexity',
          'Limit morphing transitions',
          'Enable battery optimization mode',
          'Reduce viewport resolution'
        ],
        autoActions: [
          { action: 'reduce-quality', applied: false, impact: 'Reduce visual fidelity by 30%' },
          { action: 'limit-fps', applied: false, impact: 'Target 30fps instead of 60fps' }
        ]
      });
    } else if (currentMetrics.averageFPS < PERFORMANCE_THRESHOLDS.WARNING_FPS) {
      newAlerts.push({
        type: 'fps-drop',
        severity: 'medium',
        message: `FPS below target: ${currentMetrics.averageFPS}fps`,
        timestamp: performance.now(),
        metrics: { averageFPS: currentMetrics.averageFPS },
        recommendations: [
          'Monitor system load',
          'Consider reducing effects complexity'
        ],
        autoActions: [
          { action: 'reduce-quality', applied: false, impact: 'Reduce morphing complexity' }
        ]
      });
    }

    // Memory issues
    if (currentMetrics.memoryUsage.percentage > PERFORMANCE_THRESHOLDS.CRITICAL_MEMORY_PERCENT) {
      newAlerts.push({
        type: 'memory-leak',
        severity: 'critical',
        message: `Critical memory usage: ${currentMetrics.memoryUsage.percentage}%`,
        timestamp: performance.now(),
        metrics: { memoryUsage: currentMetrics.memoryUsage },
        recommendations: [
          'Force garbage collection',
          'Clear animation caches',
          'Reduce image quality',
          'Limit concurrent animations'
        ],
        autoActions: [
          { action: 'garbage-collect', applied: false, impact: 'Free unused memory' },
          { action: 'reduce-quality', applied: false, impact: 'Lower image resolution' }
        ]
      });
    }

    // Battery optimization
    if (currentMetrics.isLowPowerMode) {
      newAlerts.push({
        type: 'battery-low',
        severity: 'high',
        message: `Low battery mode activated: ${currentMetrics.batteryLevel}%`,
        timestamp: performance.now(),
        metrics: { batteryLevel: currentMetrics.batteryLevel },
        recommendations: [
          'Enable battery save mode',
          'Reduce animation frequency',
          'Pause non-essential animations'
        ],
        autoActions: [
          { action: 'battery-save', applied: false, impact: 'Reduce CPU/GPU usage by 50%' }
        ]
      });
    }

    // Network performance
    if (currentMetrics.networkLatency > PERFORMANCE_THRESHOLDS.HIGH_NETWORK_LATENCY) {
      newAlerts.push({
        type: 'network-slow',
        severity: 'medium',
        message: `High network latency: ${currentMetrics.networkLatency}ms`,
        timestamp: performance.now(),
        metrics: { networkLatency: currentMetrics.networkLatency },
        recommendations: [
          'Preload critical assets',
          'Enable asset compression',
          'Use CDN for static resources'
        ],
        autoActions: []
      });
    }

    // Apply auto-optimizations if enabled
    if (AUTO_OPTIMIZATIONS.enableFrameRateReduction && !isOptimized) {
      const criticalAlert = newAlerts.find(alert => alert.severity === 'critical');
      if (criticalAlert) {
        setIsOptimized(true);
        onPerformanceDegradation?.(criticalAlert);

        // Apply auto-optimizations
        criticalAlert.autoActions.forEach(action => {
          if (!action.applied) {
            applyAutoOptimization(action);
            action.applied = true;
          }
        });
      }
    }

    // Update alerts (keep only recent ones)
    setAlerts(prev => {
      const allAlerts = [...prev, ...newAlerts];
      return allAlerts
        .filter(alert => performance.now() - alert.timestamp < 30000) // Keep for 30 seconds
        .slice(-5); // Keep only last 5 alerts
    });
  }, [isOptimized, onPerformanceDegradation]);

  // Apply automatic optimization
  const applyAutoOptimization = useCallback((action: AutoAction) => {
    switch (action.action) {
      case 'reduce-quality':
        // Signal to reduce visual quality
        document.documentElement.style.setProperty('--perf-quality-scale', '0.7');
        break;

      case 'limit-fps':
        // Signal to limit frame rate
        document.documentElement.style.setProperty('--perf-target-fps', '30');
        break;

      case 'battery-save':
        // Enable battery optimization
        onBatteryOptimization?.(true);
        break;

      case 'garbage-collect':
        // Force garbage collection if possible
        if ('gc' in window && typeof (window as any).gc === 'function') {
          try {
            (window as any).gc();
          } catch (error) {
            console.warn('Manual garbage collection not available');
          }
        }
        break;

      case 'pause-animations':
        // Pause non-critical animations
        document.documentElement.style.setProperty('--perf-animations-paused', '1');
        break;
    }
  }, [onBatteryOptimization]);

  // Initialize system capabilities and battery info
  useEffect(() => {
    const capabilities = detectSystemCapabilities();
    setSystemCapabilities(capabilities);

    // Get battery information if supported
    if (capabilities.supportsBatteryAPI) {
      (navigator as any).getBattery?.().then((battery: any) => {
        setBatteryInfo({
          level: Math.round(battery.level * 100),
          charging: battery.charging
        });

        // Listen for battery changes
        battery.addEventListener('levelchange', () => {
          setBatteryInfo({
            level: Math.round(battery.level * 100),
            charging: battery.charging
          });
        });

        battery.addEventListener('chargingchange', () => {
          setBatteryInfo(prev => ({
            level: prev?.level || 0,
            charging: battery.charging
          }));
        });
      }).catch(() => {
        // Battery API not available
      });
    }
  }, [detectSystemCapabilities]);

  // Start/stop monitoring based on active state
  useEffect(() => {
    if (!isActive) {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
      return;
    }

    // Start continuous monitoring (every second)
    monitoringIntervalRef.current = window.setInterval(() => {
      collectMetrics();
    }, 1000);

    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [isActive, collectMetrics]);

  // Performance grade calculation
  const performanceGrade = useMemo(() => {
    const fpsScore = (metrics.averageFPS / PERFORMANCE_THRESHOLDS.TARGET_FPS) * 30;
    const memoryScore = Math.max(0, 30 - metrics.memoryUsage.percentage * 0.3);
    const renderScore = Math.max(0, 20 - Math.max(0, metrics.renderTime - PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING));
    const gpuScore = Math.max(0, 20 - metrics.gpuUtilization * 0.2);

    const totalScore = fpsScore + memoryScore + renderScore + gpuScore;

    if (totalScore >= 90) return { grade: 'A', color: 'text-green-400' };
    if (totalScore >= 80) return { grade: 'B', color: 'text-yellow-400' };
    if (totalScore >= 70) return { grade: 'C', color: 'text-orange-400' };
    return { grade: 'D', color: 'text-red-400' };
  }, [metrics]);

  // Don't use early return after hooks - handle visibility through conditional rendering
  return (
    <div className={`performance-monitor ${className}`} style={{ display: isActive ? 'block' : 'none' }}>
      {isActive && (
        <>
        {/* Main performance display - hidden by default in development for clean UI */}
        {false && process.env.NODE_ENV === 'development' && (
        <div
          className="fixed top-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg font-mono text-xs z-50 min-w-[280px]"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Performance Monitor</h3>
            <div className={`font-bold text-lg ${performanceGrade.color}`}>
              {performanceGrade.grade}
            </div>
          </div>

          {/* Core metrics */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-gray-400">FPS</div>
              <div className={`font-bold ${metrics.currentFPS < PERFORMANCE_THRESHOLDS.WARNING_FPS ? 'text-red-400' : 'text-green-400'}`}>
                {metrics.currentFPS} / {PERFORMANCE_THRESHOLDS.TARGET_FPS}
              </div>
              <div className="text-gray-500 text-xs">Avg: {metrics.averageFPS}</div>
            </div>

            <div>
              <div className="text-gray-400">Memory</div>
              <div className={`font-bold ${metrics.memoryUsage.percentage > PERFORMANCE_THRESHOLDS.WARNING_MEMORY_PERCENT ? 'text-red-400' : 'text-green-400'}`}>
                {metrics.memoryUsage.used}MB
              </div>
              <div className="text-gray-500 text-xs">{metrics.memoryUsage.percentage}%</div>
            </div>

            <div>
              <div className="text-gray-400">Render</div>
              <div className={`font-bold ${metrics.renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING ? 'text-red-400' : 'text-green-400'}`}>
                {metrics.renderTime}ms
              </div>
            </div>

            <div>
              <div className="text-gray-400">GPU Est.</div>
              <div className={`font-bold ${metrics.gpuUtilization > 80 ? 'text-red-400' : 'text-green-400'}`}>
                {Math.round(metrics.gpuUtilization)}%
              </div>
            </div>
          </div>

          {/* Battery info */}
          {batteryInfo && (
            <div className="mb-3 pb-2 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Battery</span>
                <span className={`font-bold ${batteryInfo.level < PERFORMANCE_THRESHOLDS.LOW_BATTERY_THRESHOLD ? 'text-red-400' : 'text-green-400'}`}>
                  {batteryInfo.level}% {batteryInfo.charging ? '⚡' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Active alerts */}
          {alerts.length > 0 && (
            <div className="mb-2">
              <div className="text-gray-400 text-xs mb-1">Alerts:</div>
              {alerts.slice(0, 2).map((alert, index) => (
                <div key={index} className={`text-xs p-1 rounded mb-1 ${
                  alert.severity === 'critical' ? 'bg-red-900 text-red-200' :
                  alert.severity === 'high' ? 'bg-orange-900 text-orange-200' :
                  alert.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-blue-900 text-blue-200'
                }`}>
                  {alert.message}
                </div>
              ))}
            </div>
          )}

          {/* System info */}
          <div className="text-gray-500 text-xs border-t border-gray-700 pt-2">
            <div>Phase: {currentPhase}</div>
            {systemCapabilities?.connection && (
              <div>Network: {systemCapabilities.connection.effectiveType} ({systemCapabilities.connection.downlink}Mbps)</div>
            )}
            <div>Layers: {metrics.compositeLayerCount}</div>
            {isOptimized && (
              <div className="text-yellow-400 mt-1">Performance optimized</div>
            )}
          </div>
        </div>
      )}

      {/* Production performance warning */}
      {process.env.NODE_ENV === 'production' && alerts.some(alert => alert.severity === 'critical') && (
        <div className="fixed top-4 right-4 bg-red-900 bg-opacity-90 text-white p-3 rounded-lg text-sm z-50 max-w-xs">
          <div className="font-semibold mb-1">Performance Issue</div>
          <div className="text-xs text-red-200">
            System performance is degraded. Optimizations have been applied automatically.
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default PerformanceMonitor;