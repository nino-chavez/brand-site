# Spatial Navigation Analytics Setup Guide

## Overview

This guide provides comprehensive setup instructions for the LightboxCanvas spatial navigation analytics system. The system tracks user interactions with photography metaphor navigation features, providing insights into user engagement, learning patterns, accessibility usage, and performance metrics.

## Architecture Components

### Core Components

1. **SpatialNavigationAnalytics.ts** - Main analytics engine and event tracking
2. **AnalyticsDashboard.tsx** - Real-time visualization dashboard
3. **spatial-navigation-analytics.config.json** - Configuration management
4. **Analytics integration endpoints** - External service connectivity
5. **Privacy compliance system** - GDPR/CCPA compliant data handling

### Analytics Capabilities

- **Photography metaphor interaction tracking** - Camera movement pattern analysis
- **Spatial navigation behavior analysis** - User movement preferences and efficiency
- **Accessibility feature usage monitoring** - Screen reader and keyboard navigation patterns
- **Performance impact analysis** - 60fps compliance during analytics collection
- **User journey mapping** - Photography portfolio engagement flow
- **Learning pattern analysis** - Metaphor comprehension and adoption rates

## Installation and Setup

### 1. Dependencies Installation

```bash
# Install analytics dependencies
npm install --save chart.js react-chartjs-2
npm install --save d3 @types/d3
npm install --save-dev @testing-library/react

# Install privacy compliance utilities
npm install --save cookie-consent-js
npm install --save gdpr-cookie-consent

# Install data visualization libraries
npm install --save recharts
npm install --save react-heatmap-grid
```

### 2. Environment Configuration

```bash
# Analytics endpoints
export ANALYTICS_EVENTS_ENDPOINT="https://analytics.yourcompany.com/api/v1/events"
export ANALYTICS_PERFORMANCE_ENDPOINT="https://analytics.yourcompany.com/api/v1/performance"
export ANALYTICS_ACCESSIBILITY_ENDPOINT="https://analytics.yourcompany.com/api/v1/accessibility"
export ANALYTICS_JOURNEY_ENDPOINT="https://analytics.yourcompany.com/api/v1/user-journey"

# Alert endpoints
export ANALYTICS_WEBHOOK_URL="https://alerts.yourcompany.com/webhooks/analytics"
export ANALYTICS_ALERT_EMAIL="analytics-team@yourcompany.com"

# Privacy and compliance
export ANALYTICS_PRIVACY_MODE="balanced"
export ANALYTICS_RESPECT_DNT=true
export ANALYTICS_ANONYMIZE_DATA=true

# Development settings
export ANALYTICS_DEBUG_MODE=false
export ANALYTICS_MOCK_ENDPOINTS=false
```

### 3. Integration Setup

```typescript
// Initialize analytics in your main application
import { SpatialNavigationAnalytics } from './src/analytics/SpatialNavigationAnalytics';
import { AnalyticsDashboardManager } from './src/analytics/AnalyticsDashboard';
import analyticsConfig from './config/spatial-navigation-analytics.config.json';

class LightboxCanvasApp {
  private spatialAnalytics: SpatialNavigationAnalytics;
  private analyticsDashboard: AnalyticsDashboardManager;

  constructor() {
    // Initialize analytics with configuration
    this.spatialAnalytics = new SpatialNavigationAnalytics(analyticsConfig.analytics);

    // Set up analytics dashboard (accessible via Ctrl+Shift+A)
    this.analyticsDashboard = new AnalyticsDashboardManager(this.spatialAnalytics);

    // Make analytics globally accessible for debugging
    window.spatialAnalytics = this.spatialAnalytics;

    // Start analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.spatialAnalytics.trackUserJourney('entry');
    }

    // Setup event listeners for spatial navigation
    this.setupSpatialNavigationTracking();
    this.setupPhotographyMetaphorTracking();
    this.setupAccessibilityTracking();
  }

  private setupSpatialNavigationTracking(): void {
    // Track pan movements
    document.addEventListener('pan-start', (event: any) => {
      this.spatialAnalytics.trackNavigation({
        type: 'pan',
        direction: event.detail.direction,
        inputMethod: event.detail.inputMethod,
        photographyMetaphor: 'Camera panning to reveal composition'
      });
    });

    // Track zoom interactions
    document.addEventListener('zoom-change', (event: any) => {
      this.spatialAnalytics.trackNavigation({
        type: 'zoom',
        magnitude: event.detail.level,
        duration: event.detail.duration,
        inputMethod: event.detail.inputMethod,
        photographyMetaphor: 'Lens zoom for subject framing'
      });
    });

    // Track focus changes
    document.addEventListener('focus-change', (event: any) => {
      this.spatialAnalytics.trackNavigation({
        type: 'focus',
        duration: event.detail.duration,
        inputMethod: event.detail.inputMethod,
        photographyMetaphor: 'Lens focus for subject emphasis'
      });
    });
  }

  private setupPhotographyMetaphorTracking(): void {
    // Track metaphor explanation access
    document.addEventListener('metaphor-explanation-accessed', (event: any) => {
      this.spatialAnalytics.trackPhotographyMetaphor('metaphor_explanation_accessed', {
        metaphor: event.detail.metaphor,
        explanation: event.detail.explanation,
        inputMethod: event.detail.inputMethod
      });
    });

    // Track terminology usage
    document.addEventListener('photography-term-used', (event: any) => {
      this.spatialAnalytics.trackPhotographyMetaphor('photography_term_used', {
        term: event.detail.term,
        context: event.detail.context,
        userInitiated: event.detail.userInitiated
      });
    });
  }

  private setupAccessibilityTracking(): void {
    // Track screen reader interactions
    document.addEventListener('screen-reader-navigation', (event: any) => {
      this.spatialAnalytics.trackAccessibility({
        type: 'screen_reader_navigation',
        element: event.detail.element,
        metaphorExplanation: event.detail.explanation,
        assistiveTechnology: event.detail.technology
      });
    });

    // Track keyboard navigation patterns
    document.addEventListener('keydown', (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        this.spatialAnalytics.trackAccessibility({
          type: 'keyboard_navigation',
          element: (event.target as Element)?.tagName,
          navigationPath: [event.key]
        });
      }
    });
  }

  // Public methods for programmatic tracking
  trackSpatialMovement(type: string, context: Record<string, any>): void {
    this.spatialAnalytics.trackNavigation({
      type: type as any,
      direction: context.direction,
      magnitude: context.magnitude,
      duration: context.duration,
      inputMethod: context.inputMethod,
      photographyMetaphor: context.metaphor
    });
  }

  trackUserJourneyStage(stage: string, context?: Record<string, any>): void {
    this.spatialAnalytics.trackUserJourney(stage as any, context);
  }

  getAnalyticsSummary(): Record<string, any> {
    return this.spatialAnalytics.getSessionSummary();
  }
}

// Initialize the application
const app = new LightboxCanvasApp();
```

## Configuration Management

### Analytics Tracking Configuration

Configure what data to collect in `spatial-navigation-analytics.config.json`:

```json
{
  "analytics": {
    "photography": {
      "trackMetaphorLearning": true,
      "trackTerminologyUsage": true,
      "trackNavigationPatterns": true,
      "trackAccessibilityUsage": true
    },
    "privacy": {
      "anonymizeData": true,
      "respectDoNotTrack": true,
      "sessionTimeout": 1800000,
      "dataRetention": 2592000000
    }
  }
}
```

### Photography Metaphor Tracking

Enable specific photography metaphor analytics:

```json
{
  "tracking": {
    "spatialMovements": {
      "panEvents": {
        "enabled": true,
        "trackPhotographyMetaphor": "Camera panning to reveal composition"
      },
      "zoomEvents": {
        "enabled": true,
        "trackPhotographyMetaphor": "Lens zoom for subject framing"
      },
      "focusEvents": {
        "enabled": true,
        "trackPhotographyMetaphor": "Lens focus for subject emphasis"
      }
    }
  }
}
```

### Privacy Compliance Configuration

Set up GDPR/CCPA compliant data collection:

```json
{
  "compliance": {
    "gdpr": {
      "enabled": true,
      "requireConsent": true,
      "allowDataDeletion": true,
      "allowDataExport": true
    },
    "ccpa": {
      "enabled": true,
      "allowOptOut": true,
      "transparentDataUsage": true
    }
  }
}
```

## Event Tracking Implementation

### Spatial Navigation Events

```typescript
// Track pan movements with photography context
const trackPanMovement = (direction: string, magnitude: number, inputMethod: string) => {
  spatialAnalytics.trackNavigation({
    type: 'pan',
    direction: direction,
    magnitude: magnitude,
    inputMethod: inputMethod,
    photographyMetaphor: `Camera panning ${direction} to reveal different areas of the composition`
  });
};

// Track zoom interactions with lens metaphor
const trackZoomInteraction = (level: number, duration: number) => {
  spatialAnalytics.trackNavigation({
    type: 'zoom',
    magnitude: level,
    duration: duration,
    photographyMetaphor: 'Adjusting lens focal length to change subject framing'
  });
};

// Track focus changes with depth of field context
const trackFocusChange = (focusTarget: string, duration: number) => {
  spatialAnalytics.trackNavigation({
    type: 'focus',
    duration: duration,
    photographyMetaphor: `Pulling focus to ${focusTarget}, creating depth of field effect`
  });
};
```

### Photography Metaphor Learning Events

```typescript
// Track when users access metaphor explanations
const trackMetaphorExplanationAccess = (metaphor: string, explanation: string) => {
  spatialAnalytics.trackPhotographyMetaphor('metaphor_explanation_accessed', {
    metaphor: metaphor,
    explanation: explanation,
    timestamp: Date.now(),
    userInitiated: true
  });
};

// Track terminology usage patterns
const trackPhotographyTermUsage = (term: string, context: string, frequency: number) => {
  spatialAnalytics.trackPhotographyMetaphor('terminology_usage', {
    term: term,
    context: context,
    frequency: frequency,
    comprehensionLevel: calculateComprehensionLevel(term, frequency)
  });
};

// Track navigation pattern efficiency
const trackNavigationEfficiency = (pattern: string, duration: number, success: boolean) => {
  const efficiency = calculateEfficiencyScore(duration, success);
  spatialAnalytics.trackNavigationPattern(pattern, efficiency, {
    duration: duration,
    success: success,
    photographyContext: getPhotographyContext(pattern)
  });
};
```

### Accessibility Tracking Events

```typescript
// Track screen reader interactions with photography metaphors
const trackScreenReaderNavigation = (element: string, explanation: string, technology: string) => {
  spatialAnalytics.trackAccessibility({
    type: 'screen_reader_navigation',
    element: element,
    metaphorExplanation: explanation,
    assistiveTechnology: technology
  });
};

// Track keyboard navigation efficiency
const trackKeyboardNavigation = (path: string[], duration: number, success: boolean) => {
  spatialAnalytics.trackAccessibility({
    type: 'keyboard_navigation',
    navigationPath: path,
    element: document.activeElement?.tagName || 'unknown'
  });

  // Also track as navigation pattern
  spatialAnalytics.trackNavigationPattern('keyboard_spatial_navigation',
    calculateKeyboardEfficiency(duration, success), {
    duration: duration,
    inputMethod: 'keyboard',
    success: success
  });
};
```

## Dashboard Usage

### Accessing the Analytics Dashboard

- **Ctrl+Shift+A** - Toggle analytics dashboard
- **Ctrl+Shift+E** - Export analytics data
- **Escape** - Close dashboard

### Dashboard Widgets

1. **Real-time Performance Metrics**
   - Frame rate during navigation
   - Input latency measurements
   - Memory usage tracking
   - Navigation smoothness analysis

2. **Navigation Heatmap**
   - Spatial interaction intensity
   - Photography metaphor usage patterns
   - Input method distribution
   - Accessibility pathway visualization

3. **Photography Metaphor Learning**
   - Metaphor comprehension scores
   - Learning curve analysis
   - Terminology usage frequency
   - Explanation access patterns

4. **Accessibility Usage Analysis**
   - Screen reader interaction patterns
   - Keyboard navigation efficiency
   - Assistive technology compatibility
   - Photography metaphor accessibility

5. **User Journey Flow**
   - Portfolio navigation paths
   - Engagement duration analysis
   - Conversion funnel tracking
   - Drop-off point identification

### Dashboard API Usage

```typescript
// Programmatic dashboard control
const dashboard = new AnalyticsDashboardManager(spatialAnalytics);

// Show/hide dashboard
dashboard.show();
dashboard.hide();
dashboard.toggle();

// Get current metrics
const metrics = dashboard.getCurrentMetrics();

// Export data programmatically
dashboard.exportData();

// Get session summary
const summary = spatialAnalytics.getSessionSummary();
console.log('Session analytics:', summary);
```

## Data Analysis and Insights

### Photography Metaphor Effectiveness Analysis

```typescript
// Analyze metaphor learning patterns
const analyzeMetaphorLearning = (analyticsData: any) => {
  const metaphorData = analyticsData.events
    .filter((event: any) => event.photographyMetaphor)
    .reduce((acc: any, event: any) => {
      const metaphor = event.photographyMetaphor;
      if (!acc[metaphor]) {
        acc[metaphor] = { usageCount: 0, explanationRequests: 0, successRate: 0 };
      }
      acc[metaphor].usageCount++;
      if (event.type === 'metaphor_explanation_accessed') {
        acc[metaphor].explanationRequests++;
      }
      return acc;
    }, {});

  return metaphorData;
};

// Calculate navigation efficiency by metaphor
const calculateNavigationEfficiencyByMetaphor = (analyticsData: any) => {
  const efficiencyData = analyticsData.events
    .filter((event: any) => event.type === 'navigation' && event.efficiency)
    .reduce((acc: any, event: any) => {
      const metaphor = event.photographyMetaphor;
      if (!acc[metaphor]) {
        acc[metaphor] = { totalEfficiency: 0, count: 0 };
      }
      acc[metaphor].totalEfficiency += event.efficiency;
      acc[metaphor].count++;
      return acc;
    }, {});

  // Calculate average efficiency for each metaphor
  Object.keys(efficiencyData).forEach(metaphor => {
    const data = efficiencyData[metaphor];
    data.averageEfficiency = data.totalEfficiency / data.count;
  });

  return efficiencyData;
};
```

### Accessibility Usage Patterns

```typescript
// Analyze accessibility feature adoption
const analyzeAccessibilityUsage = (analyticsData: any) => {
  const accessibilityEvents = analyticsData.events
    .filter((event: any) => event.type?.includes('accessibility') || event.assistiveTechnology);

  const usagePatterns = {
    screenReaderUsage: accessibilityEvents.filter((e: any) => e.assistiveTechnology).length,
    keyboardNavigationUsage: accessibilityEvents.filter((e: any) => e.inputMethod === 'keyboard').length,
    metaphorExplanationAccess: accessibilityEvents.filter((e: any) => e.metaphorExplanation).length,
    accessibilityShortcuts: accessibilityEvents.filter((e: any) => e.type === 'keyboard_navigation').length
  };

  return usagePatterns;
};

// Calculate accessibility compliance metrics
const calculateAccessibilityCompliance = (analyticsData: any) => {
  const totalNavigationEvents = analyticsData.events
    .filter((event: any) => event.type === 'navigation').length;

  const accessibleNavigationEvents = analyticsData.events
    .filter((event: any) =>
      event.type === 'navigation' &&
      (event.inputMethod === 'keyboard' || event.assistiveTechnology)
    ).length;

  const accessibilityAdoptionRate = accessibleNavigationEvents / totalNavigationEvents;

  return {
    accessibilityAdoptionRate,
    totalNavigationEvents,
    accessibleNavigationEvents,
    complianceScore: accessibilityAdoptionRate * 100
  };
};
```

## Production Deployment

### CI/CD Integration

```yaml
# .github/workflows/analytics-deployment.yml
name: Analytics Deployment

on:
  push:
    branches: [main]
    paths: ['src/analytics/**', 'config/spatial-navigation-analytics.config.json']

jobs:
  deploy-analytics:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run analytics tests
        run: npm run test:analytics

      - name: Validate analytics configuration
        run: npm run validate:analytics-config

      - name: Build with analytics
        run: npm run build:production
        env:
          ANALYTICS_ENABLED: true
          ANALYTICS_PRIVACY_MODE: balanced

      - name: Deploy to production
        run: npm run deploy:production
        env:
          ANALYTICS_EVENTS_ENDPOINT: ${{ secrets.ANALYTICS_EVENTS_ENDPOINT }}
          ANALYTICS_WEBHOOK_URL: ${{ secrets.ANALYTICS_WEBHOOK_URL }}
```

### Health Check Integration

```javascript
// Add analytics status to health check endpoint
app.get('/health', (req, res) => {
  const analyticsStatus = spatialAnalytics.getSessionSummary();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    analytics: {
      enabled: analyticsStatus ? true : false,
      sessionActive: analyticsStatus?.sessionId ? true : false,
      privacyMode: analyticsStatus?.privacyMode || 'balanced',
      trackingConsent: checkTrackingConsent(req)
    }
  });
});
```

## Privacy and Compliance

### GDPR Compliance Implementation

```typescript
// GDPR consent management
class AnalyticsConsentManager {
  private consentGiven: boolean = false;
  private consentTimestamp: number | null = null;

  checkConsent(): boolean {
    // Check for existing consent
    const consent = localStorage.getItem('analytics_consent');
    if (consent) {
      const consentData = JSON.parse(consent);
      this.consentGiven = consentData.granted;
      this.consentTimestamp = consentData.timestamp;

      // Check if consent is still valid (1 year)
      const consentAge = Date.now() - this.consentTimestamp;
      return this.consentGiven && consentAge < 31536000000; // 1 year
    }

    return false;
  }

  requestConsent(): Promise<boolean> {
    return new Promise((resolve) => {
      // Show consent dialog
      this.showConsentDialog((granted: boolean) => {
        this.consentGiven = granted;
        this.consentTimestamp = Date.now();

        localStorage.setItem('analytics_consent', JSON.stringify({
          granted: granted,
          timestamp: this.consentTimestamp,
          version: '1.0'
        }));

        resolve(granted);
      });
    });
  }

  revokeConsent(): void {
    this.consentGiven = false;
    localStorage.removeItem('analytics_consent');

    // Clear existing analytics data
    spatialAnalytics.disable();
  }

  private showConsentDialog(callback: (granted: boolean) => void): void {
    // Implementation of consent dialog UI
    // Should explain photography metaphor analytics collection
    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <div class="consent-dialog">
        <h3>Analytics Consent</h3>
        <p>We collect analytics data to improve the photography metaphor navigation experience. This includes:</p>
        <ul>
          <li>📸 Photography metaphor usage patterns</li>
          <li>♿ Accessibility feature usage</li>
          <li>⚡ Performance metrics during navigation</li>
          <li>🎯 User journey through photography portfolio</li>
        </ul>
        <p>Your data is anonymized and used solely for improving the user experience.</p>
        <button onclick="acceptConsent()">Accept</button>
        <button onclick="rejectConsent()">Reject</button>
      </div>
    `;

    (window as any).acceptConsent = () => {
      dialog.remove();
      callback(true);
    };

    (window as any).rejectConsent = () => {
      dialog.remove();
      callback(false);
    };

    document.body.appendChild(dialog);
  }
}
```

### Data Anonymization

```typescript
// Data anonymization utilities
class AnalyticsDataAnonymizer {
  static anonymizeUserData(data: any): any {
    const anonymized = { ...data };

    // Remove personally identifiable information
    delete anonymized.userId;
    delete anonymized.ipAddress;
    delete anonymized.userAgent;

    // Hash session IDs
    if (anonymized.sessionId) {
      anonymized.sessionId = this.hashString(anonymized.sessionId);
    }

    // Generalize timestamps to hour precision
    if (anonymized.timestamp) {
      const date = new Date(anonymized.timestamp);
      date.setMinutes(0, 0, 0);
      anonymized.timestamp = date.getTime();
    }

    return anonymized;
  }

  static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'anon_' + Math.abs(hash).toString(36);
  }
}
```

## Best Practices

### 1. Performance Considerations

```typescript
// Minimize analytics performance impact
const performanceOptimizedTracking = {
  // Batch events to reduce HTTP requests
  batchSize: 50,
  flushInterval: 30000,

  // Throttle high-frequency events
  throttleMouseEvents: true,
  throttleScrollEvents: true,

  // Sample non-critical events
  sampleRate: {
    mouseMovement: 0.1,
    scroll: 0.2,
    resize: 0.5,
    navigation: 1.0 // Always track navigation events
  }
};
```

### 2. Privacy-First Design

```typescript
// Privacy-first analytics configuration
const privacyFirstConfig = {
  // Respect user preferences
  respectDoNotTrack: true,
  anonymizeByDefault: true,

  // Minimal data collection
  collectOnlyEssential: true,

  // Transparent data usage
  explainDataUsage: true,
  provideOptOut: true,

  // Regular data cleanup
  autoDeleteOldData: true,
  dataRetentionPeriod: 30 * 24 * 60 * 60 * 1000 // 30 days
};
```

### 3. Photography Metaphor Context

```typescript
// Ensure analytics maintain photography metaphor consistency
const photographyContextualAnalytics = {
  // Use photography terms in analytics events
  eventNaming: {
    'pan': 'camera_pan',
    'zoom': 'lens_zoom',
    'focus': 'focus_pull',
    'navigate': 'camera_movement'
  },

  // Provide photography context in explanations
  explanationContext: {
    'pan_left': 'Camera panning left to reveal previous composition',
    'zoom_in': 'Lens zooming in to frame subject more tightly',
    'focus_change': 'Pulling focus to emphasize different elements'
  },

  // Track metaphor comprehension
  trackComprehension: true,
  adaptExplanations: true
};
```

This comprehensive analytics system provides deep insights into how users interact with the LightboxCanvas spatial navigation system while maintaining the photography metaphor throughout the data collection and analysis process.