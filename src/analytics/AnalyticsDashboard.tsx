/**
 * Analytics Dashboard for Spatial Navigation
 *
 * Real-time visualization of user interactions with the LightboxCanvas spatial
 * navigation system, providing insights into photography metaphor usage patterns,
 * accessibility feature adoption, and overall user engagement.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SpatialNavigationAnalytics, type AnalyticsConfiguration } from './SpatialNavigationAnalytics';

interface DashboardProps {
  analytics: SpatialNavigationAnalytics;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

interface MetricCard {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  photographyContext?: string;
}

interface NavigationHeatmapData {
  x: number;
  y: number;
  intensity: number;
  metaphor: string;
  inputMethod: string;
}

interface MetaphorLearningData {
  metaphor: string;
  usageCount: number;
  learningRate: number;
  comprehensionScore: number;
}

const AnalyticsDashboard: React.FC<DashboardProps> = ({
  analytics,
  isVisible,
  onToggleVisibility
}) => {
  const [realTimeMetrics, setRealTimeMetrics] = useState<Record<string, any>>({});
  const [navigationHeatmap, setNavigationHeatmap] = useState<NavigationHeatmapData[]>([]);
  const [metaphorLearning, setMetaphorLearning] = useState<MetaphorLearningData[]>([]);
  const [accessibilityUsage, setAccessibilityUsage] = useState<Record<string, number>>({});
  const [updateInterval, setUpdateInterval] = useState<number | null>(null);

  // Update dashboard data every 5 seconds
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        updateDashboardData();
      }, 5000);
      setUpdateInterval(interval);

      // Initial data load
      updateDashboardData();

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (updateInterval) {
        clearInterval(updateInterval);
        setUpdateInterval(null);
      }
    }
  }, [isVisible]);

  const updateDashboardData = useCallback(() => {
    const sessionSummary = analytics.getSessionSummary();
    setRealTimeMetrics(sessionSummary);

    // Simulate heatmap data (in real implementation, this would come from analytics)
    setNavigationHeatmap(generateMockHeatmapData());
    setMetaphorLearning(generateMockMetaphorData());
    setAccessibilityUsage(generateMockAccessibilityData());
  }, [analytics]);

  const generateMockHeatmapData = (): NavigationHeatmapData[] => {
    // In real implementation, this would process actual navigation events
    return [
      { x: 20, y: 30, intensity: 0.8, metaphor: 'pan-left', inputMethod: 'keyboard' },
      { x: 80, y: 30, intensity: 0.6, metaphor: 'pan-right', inputMethod: 'mouse' },
      { x: 50, y: 60, intensity: 0.9, metaphor: 'zoom-in', inputMethod: 'touch' },
      { x: 50, y: 20, intensity: 0.4, metaphor: 'tilt-up', inputMethod: 'keyboard' },
    ];
  };

  const generateMockMetaphorData = (): MetaphorLearningData[] => {
    return [
      { metaphor: 'Camera Panning', usageCount: 45, learningRate: 0.85, comprehensionScore: 92 },
      { metaphor: 'Lens Zoom', usageCount: 32, learningRate: 0.78, comprehensionScore: 88 },
      { metaphor: 'Focus Pull', usageCount: 28, learningRate: 0.65, comprehensionScore: 75 },
      { metaphor: 'Aperture Control', usageCount: 15, learningRate: 0.45, comprehensionScore: 68 },
    ];
  };

  const generateMockAccessibilityData = (): Record<string, number> => {
    return {
      screenReaderUsage: 25,
      keyboardNavigation: 78,
      metaphorExplanations: 42,
      accessibilityShortcuts: 15,
    };
  };

  const metricCards: MetricCard[] = useMemo(() => [
    {
      title: 'Frame Rate',
      value: realTimeMetrics.averageFrameRate || 0,
      unit: 'fps',
      trend: realTimeMetrics.averageFrameRate >= 58 ? 'stable' : 'down',
      status: realTimeMetrics.averageFrameRate >= 58 ? 'excellent' : realTimeMetrics.averageFrameRate >= 45 ? 'good' : 'critical',
      photographyContext: 'Smooth camera movements'
    },
    {
      title: 'Input Latency',
      value: realTimeMetrics.averageInputLatency || 0,
      unit: 'ms',
      trend: realTimeMetrics.averageInputLatency <= 100 ? 'stable' : 'up',
      status: realTimeMetrics.averageInputLatency <= 50 ? 'excellent' : realTimeMetrics.averageInputLatency <= 100 ? 'good' : 'warning',
      photographyContext: 'Responsive camera controls'
    },
    {
      title: 'Navigation Events',
      value: realTimeMetrics.navigationEvents || 0,
      unit: 'events',
      trend: 'stable',
      status: 'good',
      photographyContext: 'Camera movement interactions'
    },
    {
      title: 'Accessibility Usage',
      value: realTimeMetrics.accessibilityInteractions || 0,
      unit: 'interactions',
      trend: 'stable',
      status: 'good',
      photographyContext: 'Inclusive camera controls'
    },
    {
      title: 'Photography Metaphors',
      value: realTimeMetrics.photographyMetaphorsLearned || 0,
      unit: 'learned',
      trend: 'up',
      status: 'excellent',
      photographyContext: 'Camera technique understanding'
    },
    {
      title: 'Navigation Efficiency',
      value: Math.round(realTimeMetrics.navigationEfficiency || 0),
      unit: '%',
      trend: realTimeMetrics.navigationEfficiency >= 80 ? 'up' : 'stable',
      status: realTimeMetrics.navigationEfficiency >= 80 ? 'excellent' : 'good',
      photographyContext: 'Camera operation proficiency'
    }
  ], [realTimeMetrics]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Spatial Navigation Analytics
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time insights into photography metaphor navigation patterns
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Session: {realTimeMetrics.sessionId?.substring(0, 8)}...
            </div>
            <button
              onClick={onToggleVisibility}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
              aria-label="Close analytics dashboard"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {metricCards.map((metric, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(metric.status || 'good')}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    {metric.title}
                  </h3>
                  <span className="text-lg" aria-label={`Trend: ${metric.trend}`}>
                    {getTrendIcon(metric.trend || 'stable')}
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">
                    {metric.value}
                  </span>
                  {metric.unit && (
                    <span className="text-sm text-gray-500 ml-1">
                      {metric.unit}
                    </span>
                  )}
                </div>
                {metric.photographyContext && (
                  <p className="text-xs text-gray-600 mt-1">
                    {metric.photographyContext}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Heatmap */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Navigation Heatmap
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 relative">
              <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded border">
                {navigationHeatmap.map((point, index) => (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      opacity: point.intensity
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold"
                      title={`${point.metaphor} (${point.inputMethod})`}
                    >
                      {Math.round(point.intensity * 100)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <span className="inline-flex items-center">
                  Photography metaphor usage intensity across the interface
                </span>
              </div>
            </div>
          </div>

          {/* Photography Metaphor Learning */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Photography Metaphor Learning
            </h3>
            <div className="space-y-3">
              {metaphorLearning.map((metaphor, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {metaphor.metaphor}
                    </h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>Used: {metaphor.usageCount} times</span>
                      <span>Learning: {Math.round(metaphor.learningRate * 100)}%</span>
                      <span>Comprehension: {metaphor.comprehensionScore}%</span>
                    </div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metaphor.comprehensionScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility Usage */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Accessibility Feature Usage
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(accessibilityUsage).map(([feature, usage]) => (
                <div
                  key={feature}
                  className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 text-center"
                >
                  <div className="text-2xl font-bold text-gray-900">
                    {usage}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Session Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Session Duration:</span>
                <div className="font-medium">
                  {Math.round((realTimeMetrics.sessionDuration || 0) / 1000 / 60)} min
                </div>
              </div>
              <div>
                <span className="text-gray-600">Current Section:</span>
                <div className="font-medium">
                  {realTimeMetrics.currentSection || 'Main Navigation'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Privacy Mode:</span>
                <div className="font-medium capitalize">
                  {realTimeMetrics.privacyMode || 'Balanced'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Analytics Status:</span>
                <div className="font-medium text-green-600">
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Photography metaphor analytics</span>
              <span>Accessibility-focused tracking</span>
              <span>Privacy-compliant collection</span>
            </div>
            <div>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Analytics Dashboard Manager
 * Handles dashboard lifecycle and keyboard shortcuts
 */
export class AnalyticsDashboardManager {
  private analytics: SpatialNavigationAnalytics;
  private isVisible: boolean = false;
  private dashboardElement: HTMLElement | null = null;

  constructor(analytics: SpatialNavigationAnalytics) {
    this.analytics = analytics;
    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+A - Toggle analytics dashboard
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        this.toggle();
      }

      // Ctrl+Shift+E - Export analytics data
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        this.exportData();
      }

      // Escape - Close dashboard
      if (event.key === 'Escape' && this.isVisible) {
        event.preventDefault();
        this.hide();
      }
    });
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show(): void {
    this.isVisible = true;
    this.renderDashboard();
  }

  hide(): void {
    this.isVisible = false;
    if (this.dashboardElement) {
      this.dashboardElement.remove();
      this.dashboardElement = null;
    }
  }

  private renderDashboard(): void {
    // In a real React application, this would use React rendering
    // For now, we'll create a simple HTML representation
    this.dashboardElement = document.createElement('div');
    this.dashboardElement.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 20px; max-width: 1200px; width: 100%; max-height: 90vh; overflow: auto;">
          <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #1a1a1a;">Spatial Navigation Analytics</h2>
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="background: #f0f0f0; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 18px;">&times;</button>
          </div>
          <div style="color: #666; margin-bottom: 20px;">
            Real-time insights into photography metaphor navigation patterns
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <p>Analytics Dashboard is active</p>
            <p style="font-size: 14px; color: #666;">Session ID: ${this.analytics.getSessionSummary().sessionId}</p>
            <button onclick="window.analyticsManager.exportData()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
              Export Data
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.dashboardElement);

    // Make export function available globally for the button
    (window as any).analyticsManager = this;
  }

  exportData(): void {
    const data = this.analytics.exportData('json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `spatial-navigation-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  getCurrentMetrics(): Record<string, any> {
    return this.analytics.getSessionSummary();
  }
}

export default AnalyticsDashboard;