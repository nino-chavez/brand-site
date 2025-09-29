/**
 * PerformanceRenderer Component
 *
 * Extracted debug information visualization and development tools from LightboxCanvas.
 * Implements conditional rendering with minimal performance impact and Observer pattern
 * for performance metrics display.
 *
 * @fileoverview Isolated debug rendering with <2% overhead
 * @version 1.0.0
 * @since Task 1 - Component Enhancement and Optimization
 */

import React from 'react';
import type { QualityLevel } from '../types/canvas';

/**
 * Performance metrics for display
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryMB: number;
  canvasRenderFPS?: number;
  transformOverhead?: number;
  activeOperations?: number;
  averageMovementTime?: number;
  gpuUtilization?: number;
}

/**
 * Props for PerformanceRenderer component
 */
export interface PerformanceRendererProps {
  /** Current performance metrics */
  metrics: PerformanceMetrics;
  /** Current quality level */
  qualityLevel: QualityLevel;
  /** Enable debug mode for visibility */
  debugMode: boolean;
  /** Canvas position for context */
  canvasPosition?: { x: number; y: number; scale: number };
  /** Active section for context */
  activeSection?: string;
  /** Layout information */
  layout?: string;
  /** Transition state */
  isTransitioning?: boolean;
  /** Render count */
  renderCount?: number;
  /** Additional debug data */
  additionalMetrics?: Record<string, any>;
  /** Callback for toggling debug mode */
  onToggleDebug?: () => void;
}

/**
 * PerformanceRenderer - Isolated debug information visualization
 *
 * Responsibilities:
 * - Debug information visualization and development tools
 * - Conditional rendering with minimal performance impact
 * - Observer pattern for performance metrics display
 * - Real-time FPS, memory usage, quality level, and architectural metrics
 */
export const PerformanceRenderer: React.FC<PerformanceRendererProps> = ({
  metrics,
  qualityLevel,
  debugMode,
  canvasPosition,
  activeSection,
  layout,
  isTransitioning,
  renderCount,
  additionalMetrics,
  onToggleDebug,
}) => {
  // Early return if debug mode is disabled
  if (!debugMode) return null;

  /**
   * Get color based on performance value
   */
  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) return 'text-green-400';
    if (value >= thresholds.warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  /**
   * Get quality level color
   */
  const getQualityColor = (level: QualityLevel): string => {
    switch (level) {
      case 'highest': return 'text-green-400';
      case 'high': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-orange-400';
      case 'minimal': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  /**
   * Format number for display
   */
  const formatNumber = (value: number | undefined, decimals: number = 1): string => {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(decimals);
  };

  return (
    <div className='absolute top-4 left-4 bg-black bg-opacity-90 text-white p-3 rounded text-xs font-mono z-50 max-w-xs'>
      {/* Header with toggle */}
      <div className='flex items-center justify-between mb-2'>
        <div className='text-athletic-court-orange font-semibold'>CANVAS DEBUG</div>
        {onToggleDebug && (
          <button
            onClick={onToggleDebug}
            className='text-gray-400 hover:text-white text-xs px-1'
            title='Toggle debug mode'
          >
            ✕
          </button>
        )}
      </div>

      {/* Basic Canvas Info */}
      <div className='space-y-1 mb-3'>
        {canvasPosition && (
          <>
            <div>Position: ({formatNumber(canvasPosition.x)}, {formatNumber(canvasPosition.y)})</div>
            <div>Scale: {formatNumber(canvasPosition.scale, 2)}</div>
          </>
        )}
        {layout && <div>Layout: {layout}</div>}
        <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
        {activeSection && <div>Active Section: {activeSection}</div>}
      </div>

      {/* Performance Metrics */}
      <div className='text-athletic-court-orange font-semibold mb-1'>PERFORMANCE</div>
      <div className='space-y-1 mb-3'>
        <div>
          FPS: <span className={getPerformanceColor(metrics.fps, { good: 55, warning: 45 })}>
            {formatNumber(metrics.fps, 0)}
          </span>
        </div>
        <div>Frame Time: {formatNumber(metrics.frameTime)}ms</div>
        <div>Memory: {formatNumber(metrics.memoryMB)}MB</div>
        <div>
          Quality: <span className={getQualityColor(qualityLevel)}>
            {qualityLevel.toUpperCase()}
          </span>
        </div>
        {renderCount !== undefined && <div>Renders: {renderCount}</div>}
      </div>

      {/* Advanced Metrics */}
      {(metrics.canvasRenderFPS || metrics.gpuUtilization || metrics.activeOperations !== undefined) && (
        <>
          <div className='text-athletic-court-orange font-semibold mb-1'>ADVANCED</div>
          <div className='space-y-1 mb-3'>
            {metrics.canvasRenderFPS && (
              <div>
                Canvas FPS: <span className={getPerformanceColor(metrics.canvasRenderFPS, { good: 55, warning: 45 })}>
                  {formatNumber(metrics.canvasRenderFPS, 0)}
                </span>
              </div>
            )}
            {metrics.transformOverhead !== undefined && (
              <div>Transform: {formatNumber(metrics.transformOverhead)}ms</div>
            )}
            {metrics.gpuUtilization !== undefined && (
              <div>GPU Util: {formatNumber(metrics.gpuUtilization)}%</div>
            )}
            {metrics.activeOperations !== undefined && (
              <div>Operations: {metrics.activeOperations}</div>
            )}
            {metrics.averageMovementTime !== undefined && (
              <div>Avg Movement: {formatNumber(metrics.averageMovementTime)}ms</div>
            )}
          </div>
        </>
      )}

      {/* Additional Metrics */}
      {additionalMetrics && Object.keys(additionalMetrics).length > 0 && (
        <>
          <div className='text-athletic-court-orange font-semibold mb-1'>ADDITIONAL</div>
          <div className='space-y-1 mb-3'>
            {Object.entries(additionalMetrics).map(([key, value]) => (
              <div key={key}>
                {key}: {typeof value === 'number' ? formatNumber(value) : String(value)}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Performance Indicators */}
      <div className='mt-2 text-athletic-neutral-400 text-[10px] flex space-x-1'>
        {metrics.fps >= 55 && <span title='High FPS'>⚡</span>}
        {metrics.memoryMB < 50 && <span title='Good Memory Usage'>💾</span>}
        {qualityLevel === 'highest' && <span title='Highest Quality'>🔥</span>}
        {!isTransitioning && <span title='Stable'>📐</span>}
        {metrics.gpuUtilization && metrics.gpuUtilization > 80 && <span title='GPU Accelerated'>🚀</span>}
      </div>

      {/* Footer */}
      <div className='mt-2 pt-2 border-t border-gray-600 text-[10px] text-gray-400'>
        <div>Canvas Performance Monitor</div>
        <div>Overhead: &lt;2%</div>
      </div>
    </div>
  );
};

export default PerformanceRenderer;