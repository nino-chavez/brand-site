# Performance Monitoring and Alerting Setup Guide

## Overview

This guide provides comprehensive setup instructions for the LightboxCanvas performance monitoring and alerting system. The system ensures 60fps compliance, tracks canvas performance metrics, and provides real-time alerting for performance degradation.

## Architecture Components

### Core Components

1. **PerformanceMonitor.ts** - Core monitoring engine
2. **PerformanceDashboard.tsx** - Real-time visualization dashboard
3. **performance-monitoring.config.json** - Configuration management
4. **Alert management system** - Multi-channel alerting
5. **Analytics integration** - Performance data collection

### Monitoring Capabilities

- **Real-time FPS tracking** - Continuous frame rate monitoring
- **Memory usage monitoring** - JavaScript heap and canvas memory
- **Input latency measurement** - User interaction responsiveness
- **Canvas render time tracking** - Per-frame rendering performance
- **Animation smoothness analysis** - Frame consistency evaluation
- **Long task detection** - Blocking operation identification
- **Layout shift monitoring** - Visual stability tracking

## Installation and Setup

### 1. Environment Configuration

```bash
# Environment variables for production
export PERFORMANCE_WEBHOOK_URL="https://your-monitoring-service.com/webhook"
export EMAIL_ALERT_ENDPOINT="https://your-email-service.com/alerts"
export ALERT_EMAIL_RECIPIENTS="team@yourcompany.com"
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
export ANALYTICS_METRICS_ENDPOINT="https://your-analytics.com/metrics"
export ANALYTICS_EVENTS_ENDPOINT="https://your-analytics.com/events"

# Development mode settings
export PERFORMANCE_DEBUG=true
export PERFORMANCE_VERBOSE_LOGGING=false
export PERFORMANCE_MOCK_ALERTS=false
```

### 2. Integration Setup

```typescript
// Initialize performance monitoring in your main application
import PerformanceMonitor from './src/monitoring/PerformanceMonitor';
import { PerformanceDashboardManager } from './src/monitoring/PerformanceDashboard';

class LightboxCanvasApp {
  private performanceMonitor: PerformanceMonitor;
  private dashboardManager: PerformanceDashboardManager;

  constructor() {
    // Initialize performance monitoring
    this.performanceMonitor = new PerformanceMonitor();

    // Set up dashboard (accessible via Ctrl+Shift+P)
    this.dashboardManager = new PerformanceDashboardManager(this.performanceMonitor);

    // Make monitor globally accessible for debugging
    window.performanceMonitor = this.performanceMonitor;

    // Start monitoring in production
    if (process.env.NODE_ENV === 'production') {
      this.performanceMonitor.startMonitoring();
    }
  }

  // Method to programmatically start monitoring
  enablePerformanceMonitoring() {
    this.performanceMonitor.startMonitoring();
  }

  // Method to get current performance metrics
  getPerformanceStatus() {
    return this.performanceMonitor.getPerformanceReport();
  }
}

// Initialize the application
const app = new LightboxCanvasApp();
```

### 3. Webpack Integration

Add performance monitoring to your webpack configuration:

```javascript
// webpack.config.js
const performanceConfig = require('./config/performance-monitoring.config.json');

module.exports = {
  // ... existing config

  plugins: [
    new webpack.DefinePlugin({
      'process.env.PERFORMANCE_CONFIG': JSON.stringify(performanceConfig),
      'process.env.PERFORMANCE_ENABLED': JSON.stringify(true)
    })
  ]
};
```

## Configuration Management

### Performance Thresholds

Configure performance thresholds in `performance-monitoring.config.json`:

```json
{
  "thresholds": {
    "performance": {
      "criticalFPS": 45,     // Triggers critical alerts
      "warningFPS": 55,      // Triggers warning alerts
      "targetFPS": 60,       // Optimal target
      "maxMemoryMB": 100,    // Memory limit
      "maxRenderTimeMS": 16.67, // 60fps frame time
      "maxInputLatencyMS": 100  // Input responsiveness
    }
  }
}
```

### Alert Configuration

Set up multi-channel alerting:

```json
{
  "alerting": {
    "endpoints": {
      "webhook": {
        "enabled": true,
        "url": "${PERFORMANCE_WEBHOOK_URL}",
        "timeout": 5000
      },
      "slack": {
        "enabled": true,
        "webhookUrl": "${SLACK_WEBHOOK_URL}",
        "channel": "#performance-alerts"
      },
      "email": {
        "enabled": true,
        "endpoint": "${EMAIL_ALERT_ENDPOINT}",
        "recipients": "${ALERT_EMAIL_RECIPIENTS}"
      }
    }
  }
}
```

## Alert Rules and Triggers

### FPS Monitoring

```javascript
// Critical FPS drop
{
  "name": "fps_critical",
  "condition": "frameRate < 45",
  "severity": "critical",
  "cooldown": 60000,
  "message": "Critical FPS drop: {{frameRate}}fps (target: 60fps)"
}

// Warning level FPS
{
  "name": "fps_warning",
  "condition": "frameRate < 55 && frameRate >= 45",
  "severity": "medium",
  "cooldown": 120000,
  "message": "FPS below target: {{frameRate}}fps"
}
```

### Memory Monitoring

```javascript
// High memory usage
{
  "name": "memory_high",
  "condition": "memoryUsage > 100",
  "severity": "high",
  "cooldown": 180000,
  "message": "High memory usage: {{memoryUsage}}MB (limit: 100MB)"
}
```

### Canvas Performance

```javascript
// Slow rendering
{
  "name": "render_slow",
  "condition": "canvasRenderTime > 16.67",
  "severity": "medium",
  "cooldown": 120000,
  "message": "Slow canvas render: {{canvasRenderTime}}ms"
}
```

## Dashboard Usage

### Keyboard Shortcuts

- **Ctrl+Shift+P** - Toggle performance dashboard
- **Ctrl+Shift+M** - Start/stop monitoring
- **Ctrl+Shift+R** - Generate performance report

### Dashboard Features

1. **Real-time Metrics Display**
   - Frame rate (FPS)
   - Memory usage (MB)
   - Input latency (ms)
   - Render time (ms)
   - Animation smoothness (%)
   - CPU usage estimate (%)

2. **Status Indicators**
   - **Excellent** - All metrics optimal
   - **Good** - Performance within acceptable range
   - **Warning** - Some metrics approaching thresholds
   - **Critical** - Performance issues detected

3. **Alert History**
   - Recent alerts with timestamps
   - Severity indicators
   - Alert details and metrics

### Performance Dashboard API

```typescript
// Programmatic dashboard control
const dashboard = new PerformanceDashboardManager(performanceMonitor);

// Show dashboard
dashboard.toggle();

// Get current metrics
const metrics = performanceMonitor.getCurrentMetrics();

// Get performance report
const report = performanceMonitor.getPerformanceReport();

// Update thresholds
performanceMonitor.updateThresholds({
  criticalFPS: 40,
  warningFPS: 50
});
```

## Production Deployment

### 1. Environment Setup

```bash
# Production environment variables
PERFORMANCE_ENABLED=true
PERFORMANCE_WEBHOOK_URL=https://monitoring.yourcompany.com/webhooks/performance
EMAIL_ALERT_ENDPOINT=https://alerts.yourcompany.com/email
ALERT_EMAIL_RECIPIENTS=devops@yourcompany.com,frontend@yourcompany.com
ANALYTICS_METRICS_ENDPOINT=https://analytics.yourcompany.com/metrics
```

### 2. CI/CD Integration

```yaml
# .github/workflows/deploy.yml
- name: Deploy with Performance Monitoring
  run: |
    # Build with performance monitoring enabled
    PERFORMANCE_ENABLED=true npm run build

    # Deploy to production
    npm run deploy

    # Verify monitoring setup
    npm run test:performance-monitoring
```

### 3. Health Check Integration

```javascript
// Add to your health check endpoint
app.get('/health', (req, res) => {
  const performanceStatus = performanceMonitor.getCurrentMetrics();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    performance: {
      monitoring: performanceStatus ? 'active' : 'inactive',
      fps: performanceStatus?.frameRate || 0,
      memory: performanceStatus?.memoryUsage || 0
    }
  });
});
```

## Analytics Integration

### Custom Metrics Collection

```typescript
// Track custom performance events
performanceMonitor.trackCustomEvent('spatial_navigation_start', {
  direction: 'pan_right',
  timestamp: Date.now()
});

performanceMonitor.trackCustomEvent('camera_movement_complete', {
  type: 'dolly_zoom',
  duration: 500,
  smoothness: 0.95
});
```

### Performance Data Export

```typescript
// Export performance data for analysis
const performanceData = {
  metrics: performanceMonitor.getAverageMetrics(3600000), // Last hour
  alerts: performanceMonitor.getRecentAlerts(),
  environment: {
    userAgent: navigator.userAgent,
    screen: {
      width: screen.width,
      height: screen.height,
      pixelRatio: window.devicePixelRatio
    }
  }
};

// Send to analytics service
fetch('/api/analytics/performance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(performanceData)
});
```

## Monitoring Best Practices

### 1. Threshold Configuration

- **Critical thresholds** - Immediate action required
- **Warning thresholds** - Performance degradation observed
- **Target thresholds** - Optimal performance goals

### 2. Alert Management

- **Cooldown periods** - Prevent alert spam
- **Severity levels** - Appropriate response urgency
- **Context data** - Include relevant metrics in alerts

### 3. Performance Optimization

- **Adaptive quality** - Reduce quality when performance drops
- **Automatic fallbacks** - Switch to simpler rendering modes
- **Resource monitoring** - Track memory and CPU usage

### 4. Debugging Workflow

```typescript
// Debug performance issues
if (process.env.NODE_ENV === 'development') {
  // Enable verbose logging
  performanceMonitor.enableDebugMode();

  // Add custom breakpoints
  performanceMonitor.onAlert('fps_critical', (alert) => {
    debugger; // Breakpoint for critical FPS issues
  });

  // Generate detailed reports
  setInterval(() => {
    console.log('Performance Report:', performanceMonitor.getPerformanceReport());
  }, 10000);
}
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check for memory leaks in canvas operations
   - Verify proper cleanup of event listeners
   - Monitor texture and buffer usage

2. **Low Frame Rate**
   - Profile canvas rendering operations
   - Check for blocking JavaScript operations
   - Verify hardware acceleration is enabled

3. **High Input Latency**
   - Review event handler performance
   - Check for excessive DOM manipulations
   - Verify passive event listeners are used

### Performance Recovery

```typescript
// Automatic performance recovery
performanceMonitor.onAlert('fps_critical', async (alert) => {
  console.warn('Critical FPS detected, enabling performance recovery');

  // Reduce visual quality
  canvasRenderer.setQuality('low');

  // Disable non-essential effects
  effectsManager.disableAll();

  // Clear caches
  textureCache.clear();

  // Wait for recovery
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Check if performance improved
  const newMetrics = performanceMonitor.getCurrentMetrics();
  if (newMetrics && newMetrics.frameRate > 50) {
    console.log('Performance recovered');
    canvasRenderer.setQuality('medium');
  }
});
```

This performance monitoring system ensures optimal 60fps performance for the LightboxCanvas spatial navigation system while providing comprehensive alerting and debugging capabilities.