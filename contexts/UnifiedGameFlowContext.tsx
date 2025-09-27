/**
 * UnifiedGameFlowContext
 *
 * Minimal context for CursorLens component integration
 * Provides navigation actions for section management and performance monitoring
 */

import React, { createContext, useContext, ReactNode, useState } from 'react';
import type { ActivationMethod, CursorPerformanceMetrics } from '../types/cursor-lens';

// Types for the context
interface GameFlowActions {
  setSection: (section: string) => void;
}

interface UnifiedGameFlowContextType {
  actions: GameFlowActions;
  state: {
    performance: {
      cursor: CursorPerformanceState;
    };
  };
}

// Performance monitoring types
interface PerformanceMetrics {
  cursorTrackingFPS?: number;
  averageResponseTime?: number;
}

interface CursorPerformanceState {
  isTracking: boolean;
  metrics: CursorPerformanceMetrics;
  degradationLevel: 'none' | 'low' | 'moderate' | 'high';
  optimizationApplied: boolean;
  activationHistory: Array<{
    method: ActivationMethod;
    latency: number;
    success: boolean;
    timestamp: number;
  }>;
  sessionStats: {
    totalActivations: number;
    averageLatency: number;
    frameDropEvents: number;
    memoryLeakDetected: boolean;
    sessionStartTime: number;
  };
}

interface CursorPerformanceActions {
  startTracking: () => void;
  stopTracking: () => void;
  updateMetrics: (metrics: Partial<CursorPerformanceMetrics>) => void;
  trackActivation: (method: ActivationMethod, latency: number, success: boolean) => void;
  reportFrameDrop: (count: number) => void;
  checkMemoryLeak: () => boolean;
  detectDegradation: () => 'none' | 'low' | 'moderate' | 'high';
  applyOptimization: (level: 'none' | 'low' | 'moderate' | 'high') => void;
  getOptimizedUpdateInterval: () => number;
  shouldDegradeQuality: () => boolean;
  resetSessionStats: () => void;
}

interface UnifiedCursorPerformanceContextType {
  state: CursorPerformanceState;
  actions: CursorPerformanceActions;
}

// Create the contexts
const UnifiedGameFlowContext = createContext<UnifiedGameFlowContextType | null>(null);
const UnifiedCursorPerformanceContext = createContext<UnifiedCursorPerformanceContextType | null>(null);

// Provider component
interface UnifiedGameFlowProviderProps {
  children: ReactNode;
  initialSection?: string;
  performanceMode?: string;
  debugMode?: boolean;
}

export const UnifiedGameFlowProvider: React.FC<UnifiedGameFlowProviderProps> = ({
  children,
  initialSection,
  performanceMode,
  debugMode
}) => {
  // Initialize cursor performance state
  const [cursorPerformanceState, setCursorPerformanceState] = useState<CursorPerformanceState>({
    isTracking: false,
    metrics: {
      cursorTrackingFPS: 60,
      averageResponseTime: 8,
      memoryUsage: 0,
      activationLatency: 50,
      menuRenderTime: 8,
      sessionDuration: 0
    },
    degradationLevel: 'none',
    optimizationApplied: false,
    activationHistory: [],
    sessionStats: {
      totalActivations: 0,
      averageLatency: 0,
      frameDropEvents: 0,
      memoryLeakDetected: false,
      sessionStartTime: Date.now()
    }
  });

  // Simple navigation handler that scrolls to sections
  const setSection = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Cursor performance actions
  const cursorPerformanceActions: CursorPerformanceActions = {
    startTracking: () => {
      setCursorPerformanceState(prev => ({
        ...prev,
        isTracking: true,
        sessionStats: {
          ...prev.sessionStats,
          sessionStartTime: Date.now()
        }
      }));
    },

    stopTracking: () => {
      setCursorPerformanceState(prev => ({
        ...prev,
        isTracking: false
      }));
    },

    updateMetrics: (metrics: Partial<CursorPerformanceMetrics>) => {
      setCursorPerformanceState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          ...metrics
        }
      }));

      if (debugMode) {
        console.log('Performance metrics:', metrics);
      }
    },

    trackActivation: (method: ActivationMethod, latency: number, success: boolean) => {
      setCursorPerformanceState(prev => {
        const newActivation = {
          method,
          latency,
          success,
          timestamp: Date.now()
        };

        const newHistory = [...prev.activationHistory, newActivation];
        const totalActivations = prev.sessionStats.totalActivations + 1;
        const totalLatency = prev.sessionStats.averageLatency * prev.sessionStats.totalActivations + latency;
        const averageLatency = totalLatency / totalActivations;

        return {
          ...prev,
          activationHistory: newHistory,
          sessionStats: {
            ...prev.sessionStats,
            totalActivations,
            averageLatency
          }
        };
      });

      if (debugMode) {
        console.log(`Activation: ${method}, latency: ${latency}ms, success: ${success}`);
      }
    },

    reportFrameDrop: (count: number) => {
      setCursorPerformanceState(prev => ({
        ...prev,
        sessionStats: {
          ...prev.sessionStats,
          frameDropEvents: prev.sessionStats.frameDropEvents + count
        }
      }));
    },

    checkMemoryLeak: () => {
      const memoryUsage = cursorPerformanceState.metrics.memoryUsage || 0;
      const hasLeak = memoryUsage > 50; // Threshold of 50MB

      setCursorPerformanceState(prev => ({
        ...prev,
        sessionStats: {
          ...prev.sessionStats,
          memoryLeakDetected: hasLeak
        }
      }));

      return hasLeak;
    },

    detectDegradation: () => {
      const { cursorTrackingFPS = 60, averageResponseTime = 8 } = cursorPerformanceState.metrics;

      if (cursorTrackingFPS < 30 || averageResponseTime > 32) {
        return 'high';
      } else if (cursorTrackingFPS < 45 || averageResponseTime > 24) {
        return 'moderate';
      } else if (cursorTrackingFPS < 55 || averageResponseTime > 16) {
        return 'low';
      }

      return 'none';
    },

    applyOptimization: (level: 'none' | 'low' | 'moderate' | 'high') => {
      setCursorPerformanceState(prev => ({
        ...prev,
        degradationLevel: level,
        optimizationApplied: level !== 'none'
      }));
    },

    getOptimizedUpdateInterval: () => {
      const { degradationLevel } = cursorPerformanceState;

      switch (degradationLevel) {
        case 'high': return 33; // 30fps
        case 'moderate': return 22; // ~45fps
        case 'low': return 20; // 50fps
        default: return 16; // 60fps
      }
    },

    shouldDegradeQuality: () => {
      const { degradationLevel, metrics } = cursorPerformanceState;
      return degradationLevel !== 'none' || (metrics.cursorTrackingFPS || 60) < 50;
    },

    resetSessionStats: () => {
      setCursorPerformanceState(prev => ({
        ...prev,
        activationHistory: [],
        sessionStats: {
          totalActivations: 0,
          averageLatency: 0,
          frameDropEvents: 0,
          memoryLeakDetected: false,
          sessionStartTime: Date.now()
        }
      }));
    }
  };

  const actions: GameFlowActions = {
    setSection,
  };

  const gameFlowValue: UnifiedGameFlowContextType = {
    actions,
    state: {
      performance: {
        cursor: cursorPerformanceState
      }
    }
  };

  const cursorPerformanceValue: UnifiedCursorPerformanceContextType = {
    state: cursorPerformanceState,
    actions: cursorPerformanceActions,
  };

  // Update game flow actions to include cursor performance
  const enhancedGameFlowValue: UnifiedGameFlowContextType = {
    ...gameFlowValue,
    actions: {
      ...gameFlowValue.actions,
      performance: {
        cursor: cursorPerformanceActions
      }
    } as any
  };

  return (
    <UnifiedGameFlowContext.Provider value={enhancedGameFlowValue}>
      <UnifiedCursorPerformanceContext.Provider value={cursorPerformanceValue}>
        {children}
      </UnifiedCursorPerformanceContext.Provider>
    </UnifiedGameFlowContext.Provider>
  );
};

// Hooks to use the contexts
export const useUnifiedGameFlow = (): UnifiedGameFlowContextType => {
  const context = useContext(UnifiedGameFlowContext);
  if (!context) {
    throw new Error('useUnifiedGameFlow must be used within a UnifiedGameFlowProvider');
  }
  return context;
};

export const useUnifiedCursorPerformance = (): UnifiedCursorPerformanceContextType => {
  const context = useContext(UnifiedCursorPerformanceContext);
  if (!context) {
    throw new Error('useUnifiedCursorPerformance must be used within a UnifiedGameFlowProvider');
  }
  return context;
};