import React, { useEffect, useRef, useCallback, useState } from 'react';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';

export interface TimingControllerProps {
  isActive: boolean;
  currentPhase: VolleyballPhase;
  phaseProgress: number;
  onFrameUpdate?: (frameData: FrameUpdateData) => void;
  onPerformanceDegradation?: (metrics: PerformanceMetrics) => void;
  children?: React.ReactNode;
}

export interface FrameUpdateData {
  timestamp: number;
  deltaTime: number;
  currentFPS: number;
  frameCount: number;
  phase: VolleyballPhase;
  progress: number;
}

export interface PerformanceMetrics {
  currentFPS: number;
  averageFPS: number;
  frameDropCount: number;
  shouldDegrade: boolean;
  targetFPS: number;
}

export interface TimingState {
  isRunning: boolean;
  isPaused: boolean;
  frameCount: number;
  averageFrameRate: number;
  lastFrameTime: number;
  performanceMetrics: PerformanceMetrics;
}

const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS; // 16.67ms
const DEGRADATION_FPS = 30;
const FRAME_DROP_THRESHOLD = 5;
const FPS_HISTORY_SIZE = 60;

export const TimingController: React.FC<TimingControllerProps> = ({
  isActive,
  currentPhase,
  phaseProgress,
  onFrameUpdate,
  onPerformanceDegradation,
  children
}) => {
  const primaryRAFRef = useRef<number>();
  const secondaryRAFRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsHistoryRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(performance.now());

  const [timingState, setTimingState] = useState<TimingState>({
    isRunning: false,
    isPaused: false,
    frameCount: 0,
    averageFrameRate: 0,
    lastFrameTime: performance.now(),
    performanceMetrics: {
      currentFPS: TARGET_FPS,
      averageFPS: TARGET_FPS,
      frameDropCount: 0,
      shouldDegrade: false,
      targetFPS: TARGET_FPS
    }
  });

  // Calculate current FPS and performance metrics
  const calculateFPS = useCallback((timestamp: number): PerformanceMetrics => {
    const deltaTime = timestamp - lastFrameTimeRef.current;
    const currentFPS = deltaTime > 0 ? 1000 / deltaTime : 0;

    // Update FPS history
    fpsHistoryRef.current.push(currentFPS);
    if (fpsHistoryRef.current.length > FPS_HISTORY_SIZE) {
      fpsHistoryRef.current.shift();
    }

    // Calculate average FPS
    const averageFPS = fpsHistoryRef.current.length > 0
      ? fpsHistoryRef.current.reduce((sum, fps) => sum + fps, 0) / fpsHistoryRef.current.length
      : currentFPS;

    // Count frame drops (frames significantly below target)
    const isFrameDrop = currentFPS < TARGET_FPS - 5;
    const frameDropCount = timingState.performanceMetrics.frameDropCount + (isFrameDrop ? 1 : 0);

    // Determine if performance degradation is needed
    const shouldDegrade = frameDropCount > FRAME_DROP_THRESHOLD && averageFPS < 50;
    const targetFPS = shouldDegrade ? DEGRADATION_FPS : TARGET_FPS;

    return {
      currentFPS,
      averageFPS,
      frameDropCount,
      shouldDegrade,
      targetFPS
    };
  }, [timingState.performanceMetrics.frameDropCount]);

  // Primary animation loop - handles main timing and updates
  const primaryAnimationLoop = useCallback((timestamp: number) => {
    if (!isActive) return;

    frameCountRef.current++;
    const deltaTime = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;

    // Calculate performance metrics
    const performanceMetrics = calculateFPS(timestamp);

    // Update timing state
    setTimingState(prevState => ({
      ...prevState,
      isRunning: true,
      frameCount: frameCountRef.current,
      lastFrameTime: timestamp,
      averageFrameRate: performanceMetrics.averageFPS,
      performanceMetrics
    }));

    // Provide frame update data to parent
    const frameData: FrameUpdateData = {
      timestamp,
      deltaTime,
      currentFPS: performanceMetrics.currentFPS,
      frameCount: frameCountRef.current,
      phase: currentPhase,
      progress: phaseProgress
    };

    onFrameUpdate?.(frameData);

    // Check for performance degradation
    if (performanceMetrics.shouldDegrade) {
      onPerformanceDegradation?.(performanceMetrics);
    }

    // Continue primary loop
    primaryRAFRef.current = requestAnimationFrame(primaryAnimationLoop);
  }, [isActive, currentPhase, phaseProgress, onFrameUpdate, onPerformanceDegradation, calculateFPS]);

  // Secondary animation loop - handles secondary operations and monitoring
  const secondaryAnimationLoop = useCallback((timestamp: number) => {
    if (!isActive) return;

    // Secondary loop can handle less critical operations
    // such as performance monitoring, garbage collection checks, etc.

    // Monitor frame rate consistency
    const elapsed = timestamp - startTimeRef.current;
    if (elapsed > 1000) { // Every second
      const expectedFrames = Math.floor(elapsed / FRAME_INTERVAL);
      const actualFrames = frameCountRef.current;
      const frameAccuracy = actualFrames / expectedFrames;

      // Log performance warnings if needed
      if (frameAccuracy < 0.95) {
        console.warn(`Frame accuracy below 95%: ${Math.round(frameAccuracy * 100)}%`);
      }

      // Reset counters for next measurement
      startTimeRef.current = timestamp;
      frameCountRef.current = 0;
    }

    // Continue secondary loop
    secondaryRAFRef.current = requestAnimationFrame(secondaryAnimationLoop);
  }, [isActive]);

  // Pause functionality with exact frame position preservation
  const pauseWithFramePreservation = useCallback(() => {
    if (primaryRAFRef.current) {
      cancelAnimationFrame(primaryRAFRef.current);
      primaryRAFRef.current = undefined;
    }

    if (secondaryRAFRef.current) {
      cancelAnimationFrame(secondaryRAFRef.current);
      secondaryRAFRef.current = undefined;
    }

    setTimingState(prevState => ({
      ...prevState,
      isRunning: false,
      isPaused: true
    }));
  }, []);

  // Resume from exact pause point
  const resumeFromPausePoint = useCallback(() => {
    // Reset timing references to current moment
    lastFrameTimeRef.current = performance.now();
    startTimeRef.current = performance.now();

    // Clear any stale RAF IDs
    if (primaryRAFRef.current) {
      cancelAnimationFrame(primaryRAFRef.current);
    }
    if (secondaryRAFRef.current) {
      cancelAnimationFrame(secondaryRAFRef.current);
    }

    setTimingState(prevState => ({
      ...prevState,
      isRunning: true,
      isPaused: false
    }));

    // Start both animation loops
    primaryRAFRef.current = requestAnimationFrame(primaryAnimationLoop);
    secondaryRAFRef.current = requestAnimationFrame(secondaryAnimationLoop);
  }, [primaryAnimationLoop, secondaryAnimationLoop]);

  // Handle activation/deactivation
  useEffect(() => {
    if (isActive && !timingState.isRunning && !timingState.isPaused) {
      resumeFromPausePoint();
    } else if (!isActive && timingState.isRunning) {
      pauseWithFramePreservation();
    }
  }, [isActive, timingState.isRunning, timingState.isPaused, resumeFromPausePoint, pauseWithFramePreservation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (primaryRAFRef.current) {
        cancelAnimationFrame(primaryRAFRef.current);
      }
      if (secondaryRAFRef.current) {
        cancelAnimationFrame(secondaryRAFRef.current);
      }
    };
  }, []);

  // Auto-restart loops if they stop unexpectedly (recovery mechanism)
  useEffect(() => {
    if (isActive && timingState.isRunning && !primaryRAFRef.current) {
      console.warn('Primary animation loop stopped unexpectedly, restarting...');
      primaryRAFRef.current = requestAnimationFrame(primaryAnimationLoop);
    }

    if (isActive && timingState.isRunning && !secondaryRAFRef.current) {
      console.warn('Secondary animation loop stopped unexpectedly, restarting...');
      secondaryRAFRef.current = requestAnimationFrame(secondaryAnimationLoop);
    }
  }, [isActive, timingState.isRunning, primaryAnimationLoop, secondaryAnimationLoop]);

  return (
    <div
      className="timing-controller"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        // Use hardware acceleration for smooth performance
        transform: 'translateZ(0)',
        willChange: isActive ? 'transform' : 'auto'
      }}
    >
      {children}

      {/* Performance monitoring overlay (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="performance-monitor"
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <div>FPS: {Math.round(timingState.performanceMetrics.currentFPS)}</div>
          <div>Avg: {Math.round(timingState.performanceMetrics.averageFPS)}</div>
          <div>Frames: {timingState.frameCount}</div>
          <div>Phase: {currentPhase}</div>
          <div>Progress: {Math.round(phaseProgress * 100)}%</div>
          {timingState.performanceMetrics.shouldDegrade && (
            <div style={{ color: 'red' }}>DEGRADED</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimingController;