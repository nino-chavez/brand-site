/**
 * Performance Dashboard Component for LightboxCanvas Monitoring
 *
 * Real-time performance visualization and alerting interface for monitoring
 * 60fps compliance and canvas system performance.
 */

import React, { useState, useEffect, useCallback } from 'react';
import PerformanceMonitor from './PerformanceMonitor';

interface DashboardProps {
  monitor: PerformanceMonitor;
  isVisible: boolean;
  onClose: () => void;
}

interface MetricsDisplayData {
  frameRate: number;
  memoryUsage: number;
  inputLatency: number;
  renderTime: number;
  smoothness: number;
  cpuUsage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const PerformanceDashboard: React.FC<DashboardProps> = ({
  monitor,
  isVisible,
  onClose
}) => {
  const [metrics, setMetrics] = useState<MetricsDisplayData | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [historicalData, setHistoricalData] = useState<number[][]>([]);

  useEffect(() => {
    if (!isVisible) return;

    const updateInterval = setInterval(() => {
      updateMetricsDisplay();
    }, 100); // Update display 10 times per second

    return () => clearInterval(updateInterval);
  }, [isVisible, monitor]);

  const updateMetricsDisplay = useCallback(() => {
    const currentMetrics = monitor.getCurrentMetrics();
    const averageMetrics = monitor.getAverageMetrics(5000); // Last 5 seconds

    if (currentMetrics || averageMetrics) {
      const displayData: MetricsDisplayData = {
        frameRate: currentMetrics?.frameRate || averageMetrics.frameRate || 0,
        memoryUsage: currentMetrics?.memoryUsage || averageMetrics.memoryUsage || 0,
        inputLatency: currentMetrics?.inputLatency || averageMetrics.inputLatency || 0,
        renderTime: currentMetrics?.canvasRenderTime || averageMetrics.canvasRenderTime || 0,
        smoothness: currentMetrics?.animationSmoothness || averageMetrics.animationSmoothness || 1,
        cpuUsage: currentMetrics?.cpuUsage || averageMetrics.cpuUsage || 0,
        status: determineStatus(currentMetrics || averageMetrics)
      };

      setMetrics(displayData);

      // Update historical data for charts
      setHistoricalData(prev => {
        const newData = [...prev, [
          Date.now(),
          displayData.frameRate,
          displayData.memoryUsage,
          displayData.inputLatency
        ]];

        // Keep only last 300 data points (30 seconds at 10Hz)
        return newData.slice(-300);
      });
    }

    // Update alerts
    const recentAlerts = JSON.parse(localStorage.getItem('performance_alerts') || '[]')
      .slice(-5)
      .reverse();
    setAlerts(recentAlerts);
  }, [monitor]);

  const determineStatus = (metrics: any): MetricsDisplayData['status'] => {
    if (!metrics) return 'critical';

    const fps = metrics.frameRate || 0;
    const memory = metrics.memoryUsage || 0;
    const latency = metrics.inputLatency || 0;

    if (fps < 45 || memory > 150 || latency > 200) return 'critical';
    if (fps < 55 || memory > 100 || latency > 100) return 'warning';
    if (fps >= 58 && memory <= 75 && latency <= 50) return 'excellent';
    return 'good';
  };

  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      monitor.stopMonitoring();
      setIsMonitoring(false);
    } else {
      monitor.startMonitoring();
      setIsMonitoring(true);
    }
  }, [monitor, isMonitoring]);

  const getStatusColor = (status: MetricsDisplayData['status']): string => {
    const colors = {
      excellent: '#10b981', // Green
      good: '#3b82f6',      // Blue
      warning: '#f59e0b',   // Yellow
      critical: '#ef4444'   // Red
    };
    return colors[status];
  };

  const formatMetricValue = (value: number, unit: string, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}${unit}`;
  };

  if (!isVisible) return null;

  return (
    <div className="performance-dashboard" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      borderRadius: '8px',
      padding: '16px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 10000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '8px'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          📊 Canvas Performance Monitor
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={toggleMonitoring}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: isMonitoring ? '#ef4444' : '#10b981',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {isMonitoring ? '⏹️ Stop' : '▶️ Start'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#6b7280',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      {metrics && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          borderLeft: `4px solid ${getStatusColor(metrics.status)}`
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(metrics.status),
            marginRight: '8px',
            animation: metrics.status === 'critical' ? 'pulse 1s infinite' : 'none'
          }} />
          <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {metrics.status} Performance
          </span>
        </div>
      )}

      {/* Real-time Metrics */}
      {metrics && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9ca3af' }}>
            Real-time Metrics
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <MetricCard
              label="Frame Rate"
              value={formatMetricValue(metrics.frameRate, 'fps')}
              target="60fps"
              status={metrics.frameRate >= 55 ? 'good' : metrics.frameRate >= 45 ? 'warning' : 'critical'}
            />
            <MetricCard
              label="Memory Usage"
              value={formatMetricValue(metrics.memoryUsage, 'MB')}
              target="<100MB"
              status={metrics.memoryUsage <= 75 ? 'good' : metrics.memoryUsage <= 100 ? 'warning' : 'critical'}
            />
            <MetricCard
              label="Input Latency"
              value={formatMetricValue(metrics.inputLatency, 'ms')}
              target="<100ms"
              status={metrics.inputLatency <= 50 ? 'good' : metrics.inputLatency <= 100 ? 'warning' : 'critical'}
            />
            <MetricCard
              label="Render Time"
              value={formatMetricValue(metrics.renderTime, 'ms')}
              target="<16.7ms"
              status={metrics.renderTime <= 16.67 ? 'good' : metrics.renderTime <= 20 ? 'warning' : 'critical'}
            />
            <MetricCard
              label="Smoothness"
              value={formatMetricValue(metrics.smoothness * 100, '%', 0)}
              target=">90%"
              status={metrics.smoothness >= 0.9 ? 'good' : metrics.smoothness >= 0.8 ? 'warning' : 'critical'}
            />
            <MetricCard
              label="CPU Usage"
              value={formatMetricValue(metrics.cpuUsage * 100, '%', 0)}
              target="<70%"
              status={metrics.cpuUsage <= 0.5 ? 'good' : metrics.cpuUsage <= 0.7 ? 'warning' : 'critical'}
            />
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9ca3af' }}>
            Recent Alerts ({alerts.length})
          </h4>
          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {alerts.map((alert, index) => (
              <AlertItem key={index} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <QuickActionButton
          onClick={() => monitor.getPerformanceReport()}
          label="📋 Generate Report"
        />
        <QuickActionButton
          onClick={() => console.log('Performance metrics:', monitor.getCurrentMetrics())}
          label="📊 Log Metrics"
        />
        <QuickActionButton
          onClick={() => localStorage.removeItem('performance_alerts')}
          label="🗑️ Clear Alerts"
        />
      </div>

      {/* Keyboard shortcut hint */}
      <div style={{
        marginTop: '12px',
        padding: '6px',
        fontSize: '10px',
        color: '#9ca3af',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        Press Ctrl+Shift+P to toggle this dashboard
      </div>
    </div>
  );
};

// Helper Components

const MetricCard: React.FC<{
  label: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'critical';
}> = ({ label, value, target, status }) => {
  const statusColors = {
    good: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444'
  };

  return (
    <div style={{
      padding: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '4px',
      border: `1px solid ${statusColors[status]}`,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: 'bold',
        color: statusColors[status],
        marginBottom: '2px'
      }}>
        {value}
      </div>
      <div style={{ fontSize: '9px', color: '#6b7280' }}>
        Target: {target}
      </div>
    </div>
  );
};

const AlertItem: React.FC<{ alert: any }> = ({ alert }) => {
  const severityColors = {
    low: '#6b7280',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };

  const timeAgo = new Date(alert.timestamp).toLocaleTimeString();

  return (
    <div style={{
      padding: '6px 8px',
      marginBottom: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '4px',
      borderLeft: `3px solid ${severityColors[alert.severity as keyof typeof severityColors]}`,
      fontSize: '10px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2px'
      }}>
        <span style={{
          color: severityColors[alert.severity as keyof typeof severityColors],
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {alert.type.replace('_', ' ')}
        </span>
        <span style={{ color: '#9ca3af' }}>
          {timeAgo}
        </span>
      </div>
      <div style={{ color: '#d1d5db' }}>
        {alert.data && typeof alert.data === 'object' ?
          Object.entries(alert.data)
            .slice(0, 2)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ') :
          String(alert.data)
        }
      </div>
    </div>
  );
};

const QuickActionButton: React.FC<{
  onClick: () => void;
  label: string;
}> = ({ onClick, label }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 10px',
      fontSize: '10px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      cursor: 'pointer',
      transition: 'background-color 150ms ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    }}
  >
    {label}
  </button>
);

// Performance Dashboard Manager
class PerformanceDashboardManager {
  private dashboard: HTMLElement | null = null;
  private monitor: PerformanceMonitor;
  private isVisible: boolean = false;

  constructor(monitor: PerformanceMonitor) {
    this.monitor = monitor;
    this.setupKeyboardShortcut();
  }

  private setupKeyboardShortcut(): void {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+P to toggle dashboard
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        this.toggle();
      }

      // Ctrl+Shift+M to start/stop monitoring
      if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        this.toggleMonitoring();
      }
    });
  }

  toggle(): void {
    this.isVisible = !this.isVisible;

    if (this.isVisible) {
      this.show();
    } else {
      this.hide();
    }
  }

  private show(): void {
    if (this.dashboard) return;

    // Create dashboard container
    this.dashboard = document.createElement('div');
    this.dashboard.id = 'performance-dashboard-container';

    // Render React component
    const React = require('react');
    const ReactDOM = require('react-dom');

    ReactDOM.render(
      React.createElement(PerformanceDashboard, {
        monitor: this.monitor,
        isVisible: true,
        onClose: () => this.hide()
      }),
      this.dashboard
    );

    document.body.appendChild(this.dashboard);
  }

  private hide(): void {
    if (this.dashboard) {
      document.body.removeChild(this.dashboard);
      this.dashboard = null;
    }
    this.isVisible = false;
  }

  private toggleMonitoring(): void {
    // This would toggle the monitoring state
    console.log('Toggle monitoring shortcut pressed');
  }
}

export default PerformanceDashboard;
export { PerformanceDashboardManager };