/**
 * Performance Analysis Utilities
 *
 * Provides comprehensive performance metrics collection, FPS tracking,
 * memory monitoring, and automatic quality degradation for 2D canvas navigation.
 * Includes cross-device performance testing and real-time optimization.
 *
 * @fileoverview Performance analysis and monitoring utilities
 * @version 1.0.0
 * @since Task 9 - Unit Testing for Canvas System
 */

// ===== PERFORMANCE TYPES =====

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  gpuMemoryUsage?: number;
  renderTime: number;
  updateTime: number;
  timestamp: number;
}

export interface FrameTimingData {
  frameId: number;
  startTime: number;
  endTime: number;
  duration: number;
  skipped: boolean;
}

export interface MemoryAnalysis {
  heapUsed: number;
  heapTotal: number;
  heapLimit: number;
  external: number;
  rss: number;
  timestamp: number;
}

export interface QualitySettings {
  renderScale: number;
  enableAntialiasing: boolean;
  enableShadows: boolean;
  maxParticles: number;
  lodLevel: number;
}

export interface DeviceCapabilities {
  cpu: {
    cores: number;
    speed: 'low' | 'medium' | 'high';
    architecture: string;
  };
  memory: {
    total: number;
    available: number;
    pressure: 'low' | 'medium' | 'high';
  };
  gpu: {
    available: boolean;
    vendor: string;
    memory?: number;
  };
  display: {
    width: number;
    height: number;
    pixelRatio: number;
    refreshRate: number;
  };
}

export interface PerformanceThresholds {
  targetFps: number;
  minFps: number;
  maxFrameTime: number;
  memoryWarningThreshold: number;
  memoryErrorThreshold: number;
}

// ===== PERFORMANCE MONITORING =====

let performanceData: PerformanceMetrics[] = [];
let frameTimings: FrameTimingData[] = [];
let currentFrameId = 0;
let isMonitoring = false;
let monitoringInterval: number | null = null;

/**
 * Start performance monitoring
 * Begins collecting real-time performance metrics
 */
export function startPerformanceMonitoring(
  options: {
    sampleInterval?: number;
    maxSamples?: number;
    trackMemory?: boolean;
    trackGPU?: boolean;
  } = {}
): void {
  const {
    sampleInterval = 100,
    maxSamples = 600, // 60 seconds at 100ms interval
    trackMemory = true,
    trackGPU = false
  } = options;

  if (isMonitoring) {
    console.warn('Performance monitoring already active');
    return;
  }

  isMonitoring = true;
  performanceData = [];
  frameTimings = [];

  const collectMetrics = () => {
    const metrics = collectCurrentMetrics({ trackMemory, trackGPU });
    performanceData.push(metrics);

    // Limit data size
    if (performanceData.length > maxSamples) {
      performanceData.shift();
    }
  };

  monitoringInterval = window.setInterval(collectMetrics, sampleInterval);
  collectMetrics(); // Initial sample
}

/**
 * Stop performance monitoring
 * Ends metric collection and returns final analysis
 */
export function stopPerformanceMonitoring(): PerformanceMetrics[] {
  if (!isMonitoring) {
    console.warn('Performance monitoring not active');
    return [];
  }

  isMonitoring = false;

  if (monitoringInterval !== null) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  return [...performanceData];
}

/**
 * Collect current performance metrics
 * Gathers instantaneous performance data
 */
export function collectCurrentMetrics(
  options: { trackMemory?: boolean; trackGPU?: boolean } = {}
): PerformanceMetrics {
  const now = performance.now();

  // Calculate FPS from recent frame timings
  const recentFrames = frameTimings.slice(-60); // Last 60 frames
  const fps = recentFrames.length > 1
    ? 1000 / (recentFrames[recentFrames.length - 1].endTime - recentFrames[0].startTime) * recentFrames.length
    : 60;

  // Calculate average frame time
  const frameTime = recentFrames.length > 0
    ? recentFrames.reduce((sum, frame) => sum + frame.duration, 0) / recentFrames.length
    : 16.67;

  // Memory usage (approximate for browser environment)
  let memoryUsage = 0;
  let gpuMemoryUsage: number | undefined;

  if (options.trackMemory && 'memory' in performance) {
    const memory = (performance as any).memory;
    memoryUsage = memory.usedJSHeapSize || 0;
  }

  if (options.trackGPU && 'GPU' in window) {
    // GPU memory would be tracked here if available
    gpuMemoryUsage = undefined;
  }

  return {
    fps: Math.round(fps * 100) / 100,
    frameTime: Math.round(frameTime * 100) / 100,
    memoryUsage,
    gpuMemoryUsage,
    renderTime: 0, // Would be measured during actual rendering
    updateTime: 0, // Would be measured during update cycles
    timestamp: now
  };
}

// ===== FRAME TIMING =====

/**
 * Start frame timing measurement
 * Begins timing for a single frame
 */
export function startFrameTiming(): number {
  const frameId = currentFrameId++;
  const startTime = performance.now();

  frameTimings.push({
    frameId,
    startTime,
    endTime: 0,
    duration: 0,
    skipped: false
  });

  return frameId;
}

/**
 * End frame timing measurement
 * Completes timing for a frame and calculates duration
 */
export function endFrameTiming(frameId: number): FrameTimingData | null {
  const frameIndex = frameTimings.findIndex(f => f.frameId === frameId);
  if (frameIndex === -1) {
    console.warn(`Frame ${frameId} not found in timing data`);
    return null;
  }

  const frame = frameTimings[frameIndex];
  frame.endTime = performance.now();
  frame.duration = frame.endTime - frame.startTime;

  // Limit frame timing data
  if (frameTimings.length > 120) { // Keep last 2 seconds at 60fps
    frameTimings.shift();
  }

  return frame;
}

/**
 * Mark frame as skipped
 * Records dropped frames for performance analysis
 */
export function markFrameSkipped(frameId: number): void {
  const frame = frameTimings.find(f => f.frameId === frameId);
  if (frame) {
    frame.skipped = true;
  }
}

/**
 * Calculate frame rate from timing data
 * Analyzes recent frame timings to determine actual FPS
 */
export function calculateFrameRate(
  timingData: FrameTimingData[] = frameTimings,
  windowSize: number = 60
): number {
  const recentFrames = timingData.slice(-windowSize);

  if (recentFrames.length < 2) {
    return 0;
  }

  const totalTime = recentFrames[recentFrames.length - 1].endTime - recentFrames[0].startTime;
  const validFrames = recentFrames.filter(f => !f.skipped);

  return validFrames.length > 1 ? (validFrames.length / totalTime) * 1000 : 0;
}

// ===== MEMORY ANALYSIS =====

/**
 * Analyze memory usage patterns
 * Detects memory leaks and usage trends
 */
export function analyzeMemoryUsage(
  metrics: PerformanceMetrics[] = performanceData
): MemoryAnalysis {
  if (metrics.length === 0) {
    return {
      heapUsed: 0,
      heapTotal: 0,
      heapLimit: 0,
      external: 0,
      rss: 0,
      timestamp: performance.now()
    };
  }

  const latestMetrics = metrics[metrics.length - 1];
  const memoryValues = metrics.map(m => m.memoryUsage);

  // Calculate memory statistics
  const current = latestMetrics.memoryUsage;
  const max = Math.max(...memoryValues);
  const min = Math.min(...memoryValues);
  const average = memoryValues.reduce((sum, val) => sum + val, 0) / memoryValues.length;

  return {
    heapUsed: current,
    heapTotal: max,
    heapLimit: navigator.deviceMemory ? navigator.deviceMemory * 1024 * 1024 * 1024 : 0,
    external: max - min, // Approximation
    rss: average,
    timestamp: latestMetrics.timestamp
  };
}

/**
 * Detect memory leaks
 * Identifies continuously increasing memory usage
 */
export function detectMemoryLeaks(
  metrics: PerformanceMetrics[] = performanceData,
  threshold: number = 0.1 // 10% increase over window
): { hasLeak: boolean; trend: number; confidence: number } {
  if (metrics.length < 10) {
    return { hasLeak: false, trend: 0, confidence: 0 };
  }

  const memoryValues = metrics.slice(-20).map(m => m.memoryUsage); // Last 20 samples
  const firstHalf = memoryValues.slice(0, 10);
  const secondHalf = memoryValues.slice(10);

  const avgFirst = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const trend = (avgSecond - avgFirst) / avgFirst;
  const hasLeak = trend > threshold;

  // Calculate confidence based on consistency of increase
  const increases = memoryValues.slice(1).filter((val, i) => val > memoryValues[i]).length;
  const confidence = increases / (memoryValues.length - 1);

  return { hasLeak, trend, confidence };
}

// ===== QUALITY MANAGEMENT =====

/**
 * Get current quality settings
 * Returns active quality configuration
 */
export function getCurrentQualitySettings(): QualitySettings {
  return {
    renderScale: 1.0,
    enableAntialiasing: true,
    enableShadows: true,
    maxParticles: 1000,
    lodLevel: 0
  };
}

/**
 * Apply quality degradation
 * Reduces quality settings to improve performance
 */
export function applyQualityDegradation(
  currentSettings: QualitySettings,
  severity: 'mild' | 'moderate' | 'aggressive'
): QualitySettings {
  const degraded = { ...currentSettings };

  switch (severity) {
    case 'mild':
      degraded.renderScale = Math.max(0.8, degraded.renderScale * 0.9);
      degraded.maxParticles = Math.floor(degraded.maxParticles * 0.8);
      break;

    case 'moderate':
      degraded.renderScale = Math.max(0.6, degraded.renderScale * 0.7);
      degraded.enableAntialiasing = false;
      degraded.maxParticles = Math.floor(degraded.maxParticles * 0.5);
      degraded.lodLevel = Math.min(2, degraded.lodLevel + 1);
      break;

    case 'aggressive':
      degraded.renderScale = 0.5;
      degraded.enableAntialiasing = false;
      degraded.enableShadows = false;
      degraded.maxParticles = Math.floor(degraded.maxParticles * 0.2);
      degraded.lodLevel = 3;
      break;
  }

  return degraded;
}

/**
 * Determine quality adjustment needed
 * Analyzes performance to recommend quality changes
 */
export function determineQualityAdjustment(
  metrics: PerformanceMetrics[],
  thresholds: PerformanceThresholds
): { adjustment: 'improve' | 'maintain' | 'degrade'; severity?: 'mild' | 'moderate' | 'aggressive' } {
  if (metrics.length === 0) {
    return { adjustment: 'maintain' };
  }

  const recentMetrics = metrics.slice(-10); // Last 10 samples
  const avgFps = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;
  const avgFrameTime = recentMetrics.reduce((sum, m) => sum + m.frameTime, 0) / recentMetrics.length;

  // Determine if degradation is needed
  if (avgFps < thresholds.minFps || avgFrameTime > thresholds.maxFrameTime) {
    if (avgFps < thresholds.minFps * 0.6) {
      return { adjustment: 'degrade', severity: 'aggressive' };
    } else if (avgFps < thresholds.minFps * 0.8) {
      return { adjustment: 'degrade', severity: 'moderate' };
    } else {
      return { adjustment: 'degrade', severity: 'mild' };
    }
  }

  // Determine if improvement is possible
  if (avgFps > thresholds.targetFps * 1.2 && avgFrameTime < thresholds.maxFrameTime * 0.5) {
    return { adjustment: 'improve' };
  }

  return { adjustment: 'maintain' };
}

// ===== DEVICE CAPABILITIES =====

/**
 * Detect device capabilities
 * Analyzes system to determine performance characteristics
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const screen = window.screen;
  const navigator = window.navigator;

  // CPU detection (approximate)
  const cpuCores = navigator.hardwareConcurrency || 4;
  let cpuSpeed: 'low' | 'medium' | 'high' = 'medium';

  // Simple CPU speed test
  const startTime = performance.now();
  let iterations = 0;
  while (performance.now() - startTime < 10) {
    Math.random();
    iterations++;
  }

  if (iterations > 100000) {
    cpuSpeed = 'high';
  } else if (iterations < 50000) {
    cpuSpeed = 'low';
  }

  // Memory detection
  const totalMemory = (navigator as any).deviceMemory ? (navigator as any).deviceMemory * 1024 * 1024 * 1024 : 0;
  let memoryPressure: 'low' | 'medium' | 'high' = 'low';

  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    if (usageRatio > 0.8) {
      memoryPressure = 'high';
    } else if (usageRatio > 0.5) {
      memoryPressure = 'medium';
    }
  }

  // GPU detection
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const hasGPU = !!gl;
  const gpuVendor = hasGPU ? gl!.getParameter(gl!.VENDOR) : 'Unknown';

  return {
    cpu: {
      cores: cpuCores,
      speed: cpuSpeed,
      architecture: navigator.platform || 'Unknown'
    },
    memory: {
      total: totalMemory,
      available: totalMemory * 0.8, // Estimate
      pressure: memoryPressure
    },
    gpu: {
      available: hasGPU,
      vendor: gpuVendor,
      memory: undefined // Not easily detectable in browser
    },
    display: {
      width: screen.width,
      height: screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      refreshRate: 60 // Default assumption
    }
  };
}

/**
 * Benchmark device performance
 * Runs performance tests to measure capabilities
 */
export function benchmarkDevice(): Promise<{
  cpuScore: number;
  memoryScore: number;
  gpuScore: number;
  overallScore: number;
}> {
  return new Promise((resolve) => {
    // CPU benchmark
    const cpuStart = performance.now();
    let cpuIterations = 0;
    const cpuTest = () => {
      for (let i = 0; i < 10000; i++) {
        Math.sin(Math.random() * Math.PI);
        cpuIterations++;
      }

      if (performance.now() - cpuStart < 100) {
        requestAnimationFrame(cpuTest);
      } else {
        const cpuScore = cpuIterations / 100; // Normalize

        // Memory benchmark (simple allocation test)
        const memoryStart = performance.now();
        const arrays: number[][] = [];
        try {
          for (let i = 0; i < 100; i++) {
            arrays.push(new Array(10000).fill(Math.random()));
          }
        } catch (e) {
          // Memory allocation failed
        }
        const memoryTime = performance.now() - memoryStart;
        const memoryScore = Math.max(0, 100 - memoryTime); // Lower time = higher score

        // GPU benchmark (canvas operations)
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const gpuStart = performance.now();

        if (ctx) {
          for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `hsl(${i % 360}, 50%, 50%)`;
            ctx.fillRect(Math.random() * 256, Math.random() * 256, 10, 10);
          }
        }

        const gpuTime = performance.now() - gpuStart;
        const gpuScore = Math.max(0, 100 - gpuTime);

        const overallScore = (cpuScore + memoryScore + gpuScore) / 3;

        resolve({
          cpuScore: Math.round(cpuScore),
          memoryScore: Math.round(memoryScore),
          gpuScore: Math.round(gpuScore),
          overallScore: Math.round(overallScore)
        });
      }
    };

    requestAnimationFrame(cpuTest);
  });
}

// ===== PERFORMANCE OPTIMIZATION =====

/**
 * Optimize performance based on current metrics
 * Automatically adjusts settings for better performance
 */
export function optimizePerformance(
  metrics: PerformanceMetrics[],
  currentSettings: QualitySettings,
  thresholds: PerformanceThresholds
): QualitySettings {
  const adjustment = determineQualityAdjustment(metrics, thresholds);

  if (adjustment.adjustment === 'degrade' && adjustment.severity) {
    return applyQualityDegradation(currentSettings, adjustment.severity);
  }

  if (adjustment.adjustment === 'improve') {
    // Gradually improve quality
    return {
      ...currentSettings,
      renderScale: Math.min(1.0, currentSettings.renderScale * 1.1),
      enableAntialiasing: currentSettings.renderScale > 0.8,
      enableShadows: currentSettings.renderScale > 0.9,
      maxParticles: Math.min(1000, Math.floor(currentSettings.maxParticles * 1.2)),
      lodLevel: Math.max(0, currentSettings.lodLevel - 1)
    };
  }

  return currentSettings;
}

/**
 * Create performance report
 * Generates comprehensive performance analysis
 */
export function createPerformanceReport(
  metrics: PerformanceMetrics[] = performanceData
): {
  summary: {
    avgFps: number;
    minFps: number;
    maxFps: number;
    avgFrameTime: number;
    memoryUsage: number;
    frameDrops: number;
  };
  recommendations: string[];
  quality: QualitySettings;
} {
  if (metrics.length === 0) {
    return {
      summary: {
        avgFps: 0,
        minFps: 0,
        maxFps: 0,
        avgFrameTime: 0,
        memoryUsage: 0,
        frameDrops: 0
      },
      recommendations: ['No performance data available'],
      quality: getCurrentQualitySettings()
    };
  }

  // Calculate summary statistics
  const fpsValues = metrics.map(m => m.fps);
  const frameTimeValues = metrics.map(m => m.frameTime);
  const memoryValues = metrics.map(m => m.memoryUsage);

  const summary = {
    avgFps: fpsValues.reduce((sum, val) => sum + val, 0) / fpsValues.length,
    minFps: Math.min(...fpsValues),
    maxFps: Math.max(...fpsValues),
    avgFrameTime: frameTimeValues.reduce((sum, val) => sum + val, 0) / frameTimeValues.length,
    memoryUsage: memoryValues[memoryValues.length - 1] || 0,
    frameDrops: frameTimings.filter(f => f.skipped).length
  };

  // Generate recommendations
  const recommendations: string[] = [];

  if (summary.avgFps < 45) {
    recommendations.push('Consider reducing visual quality for better performance');
  }

  if (summary.frameDrops > metrics.length * 0.1) {
    recommendations.push('High frame drop rate detected - optimize render pipeline');
  }

  const memoryLeak = detectMemoryLeaks(metrics);
  if (memoryLeak.hasLeak) {
    recommendations.push('Potential memory leak detected - review resource management');
  }

  if (summary.avgFrameTime > 20) {
    recommendations.push('Frame time exceeds target - consider performance optimization');
  }

  return {
    summary: {
      avgFps: Math.round(summary.avgFps * 100) / 100,
      minFps: Math.round(summary.minFps * 100) / 100,
      maxFps: Math.round(summary.maxFps * 100) / 100,
      avgFrameTime: Math.round(summary.avgFrameTime * 100) / 100,
      memoryUsage: summary.memoryUsage,
      frameDrops: summary.frameDrops
    },
    recommendations,
    quality: getCurrentQualitySettings()
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Clear performance data
 * Resets all collected metrics and timing data
 */
export function clearPerformanceData(): void {
  performanceData = [];
  frameTimings = [];
  currentFrameId = 0;
}

/**
 * Get performance thresholds for device type
 * Returns appropriate thresholds based on device capabilities
 */
export function getPerformanceThresholds(capabilities: DeviceCapabilities): PerformanceThresholds {
  const baseFps = capabilities.display.refreshRate || 60;

  if (capabilities.cpu.speed === 'low' || capabilities.memory.pressure === 'high') {
    return {
      targetFps: baseFps * 0.5,
      minFps: baseFps * 0.3,
      maxFrameTime: 1000 / (baseFps * 0.3),
      memoryWarningThreshold: capabilities.memory.total * 0.7,
      memoryErrorThreshold: capabilities.memory.total * 0.9
    };
  }

  if (capabilities.cpu.speed === 'high' && capabilities.gpu.available) {
    return {
      targetFps: baseFps,
      minFps: baseFps * 0.8,
      maxFrameTime: 1000 / (baseFps * 0.8),
      memoryWarningThreshold: capabilities.memory.total * 0.8,
      memoryErrorThreshold: capabilities.memory.total * 0.95
    };
  }

  // Medium performance device
  return {
    targetFps: baseFps * 0.8,
    minFps: baseFps * 0.6,
    maxFrameTime: 1000 / (baseFps * 0.6),
    memoryWarningThreshold: capabilities.memory.total * 0.75,
    memoryErrorThreshold: capabilities.memory.total * 0.9
  };
}