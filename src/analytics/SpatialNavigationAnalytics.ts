/**
 * Spatial Navigation Analytics System
 *
 * Tracks user interactions with the LightboxCanvas spatial navigation system,
 * providing insights into photography metaphor usage patterns and user engagement
 * with the camera-based navigation interface.
 */

interface NavigationEvent {
  type: 'pan' | 'tilt' | 'zoom' | 'focus' | 'aperture' | 'composition_change';
  direction?: 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
  magnitude?: number;
  duration?: number;
  inputMethod: 'keyboard' | 'mouse' | 'touch' | 'accessibility';
  photographyMetaphor: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface PerformanceEvent {
  frameRate: number;
  renderTime: number;
  memoryUsage: number;
  inputLatency: number;
  navigationSmoothness: number;
  timestamp: number;
  sessionId: string;
}

interface AccessibilityEvent {
  type: 'screen_reader_navigation' | 'keyboard_navigation' | 'focus_change' | 'metaphor_explanation_accessed';
  element?: string;
  metaphorExplanation?: string;
  navigationPath?: string[];
  assistiveTechnology?: string;
  timestamp: number;
  sessionId: string;
}

interface UserJourneyEvent {
  stage: 'entry' | 'navigation_start' | 'portfolio_engagement' | 'metaphor_learning' | 'goal_completion' | 'exit';
  photographySection?: string;
  timeSpent?: number;
  interactionCount?: number;
  navigationEfficiency?: number;
  timestamp: number;
  sessionId: string;
}

interface AnalyticsConfiguration {
  enabled: boolean;
  privacyMode: 'strict' | 'balanced' | 'detailed';
  batchSize: number;
  flushInterval: number;
  endpoints: {
    events: string;
    performance: string;
    accessibility: string;
    userJourney: string;
  };
  photography: {
    trackMetaphorLearning: boolean;
    trackTerminologyUsage: boolean;
    trackNavigationPatterns: boolean;
    trackAccessibilityUsage: boolean;
  };
  privacy: {
    anonymizeData: boolean;
    respectDoNotTrack: boolean;
    sessionTimeout: number;
    dataRetention: number;
  };
}

class SpatialNavigationAnalytics {
  private config: AnalyticsConfiguration;
  private sessionId: string;
  private userId: string | null = null;
  private isEnabled: boolean = false;
  private eventQueue: Array<NavigationEvent | PerformanceEvent | AccessibilityEvent | UserJourneyEvent> = [];
  private flushTimer: number | null = null;
  private sessionStartTime: number;
  private navigationStartTime: number | null = null;
  private currentSection: string | null = null;
  private metaphorLearningEvents: Map<string, number> = new Map();
  private navigationEfficiency: Map<string, number[]> = new Map();

  constructor(config: AnalyticsConfiguration) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    return `spatial_nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics(): void {
    // Respect user privacy preferences
    if (navigator.doNotTrack === '1' && this.config.privacy.respectDoNotTrack) {
      console.log('Analytics disabled due to Do Not Track preference');
      return;
    }

    this.isEnabled = this.config.enabled;

    if (this.isEnabled) {
      this.startFlushTimer();
      this.trackUserJourney('entry');
      this.setupNavigationListeners();
      this.setupPerformanceMonitoring();
      this.setupAccessibilityTracking();
    }
  }

  /**
   * Track spatial navigation events with photography metaphor context
   */
  trackNavigation(event: Partial<NavigationEvent>): void {
    if (!this.isEnabled) return;

    const navigationEvent: NavigationEvent = {
      type: event.type || 'pan',
      direction: event.direction,
      magnitude: event.magnitude,
      duration: event.duration,
      inputMethod: event.inputMethod || 'mouse',
      photographyMetaphor: event.photographyMetaphor || this.getContextualMetaphor(event.type),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.queueEvent(navigationEvent);
    this.updateNavigationEfficiency(event.type || 'pan', event.duration || 0);

    // Track metaphor learning patterns
    if (this.config.photography.trackMetaphorLearning) {
      this.trackMetaphorLearning(navigationEvent.photographyMetaphor);
    }
  }

  /**
   * Track performance metrics during navigation
   */
  trackPerformance(metrics: Partial<PerformanceEvent>): void {
    if (!this.isEnabled) return;

    const performanceEvent: PerformanceEvent = {
      frameRate: metrics.frameRate || 0,
      renderTime: metrics.renderTime || 0,
      memoryUsage: metrics.memoryUsage || 0,
      inputLatency: metrics.inputLatency || 0,
      navigationSmoothness: metrics.navigationSmoothness || 0,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.queueEvent(performanceEvent);
  }

  /**
   * Track accessibility interactions and metaphor explanations
   */
  trackAccessibility(event: Partial<AccessibilityEvent>): void {
    if (!this.isEnabled) return;

    const accessibilityEvent: AccessibilityEvent = {
      type: event.type || 'keyboard_navigation',
      element: event.element,
      metaphorExplanation: event.metaphorExplanation,
      navigationPath: event.navigationPath,
      assistiveTechnology: event.assistiveTechnology,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.queueEvent(accessibilityEvent);
  }

  /**
   * Track user journey through photography portfolio
   */
  trackUserJourney(stage: UserJourneyEvent['stage'], context?: Partial<UserJourneyEvent>): void {
    if (!this.isEnabled) return;

    const journeyEvent: UserJourneyEvent = {
      stage,
      photographySection: context?.photographySection || this.currentSection,
      timeSpent: context?.timeSpent || this.calculateTimeSpent(stage),
      interactionCount: context?.interactionCount,
      navigationEfficiency: context?.navigationEfficiency || this.calculateNavigationEfficiency(),
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.queueEvent(journeyEvent);

    // Update current section and timing
    if (stage === 'navigation_start') {
      this.navigationStartTime = Date.now();
    }
    if (context?.photographySection) {
      this.currentSection = context.photographySection;
    }
  }

  /**
   * Track custom photography metaphor events
   */
  trackPhotographyMetaphor(action: string, context: Record<string, any>): void {
    if (!this.isEnabled || !this.config.photography.trackTerminologyUsage) return;

    this.trackNavigation({
      type: 'composition_change' as any,
      photographyMetaphor: action,
      duration: context.duration,
      inputMethod: context.inputMethod || 'mouse'
    });
  }

  /**
   * Track spatial navigation patterns and efficiency
   */
  trackNavigationPattern(pattern: string, efficiency: number, context: Record<string, any>): void {
    if (!this.isEnabled || !this.config.photography.trackNavigationPatterns) return;

    // Store navigation pattern data
    if (!this.navigationEfficiency.has(pattern)) {
      this.navigationEfficiency.set(pattern, []);
    }
    this.navigationEfficiency.get(pattern)!.push(efficiency);

    this.trackNavigation({
      type: 'composition_change' as any,
      photographyMetaphor: `Navigation pattern: ${pattern}`,
      magnitude: efficiency,
      duration: context.duration,
      inputMethod: context.inputMethod
    });
  }

  /**
   * Get analytics summary for current session
   */
  getSessionSummary(): Record<string, any> {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const navigationEvents = this.eventQueue.filter(e => 'type' in e && e.type !== undefined) as NavigationEvent[];
    const performanceEvents = this.eventQueue.filter(e => 'frameRate' in e) as PerformanceEvent[];
    const accessibilityEvents = this.eventQueue.filter(e => 'type' in e && e.type.includes('navigation')) as AccessibilityEvent[];

    return {
      sessionId: this.sessionId,
      sessionDuration,
      navigationEvents: navigationEvents.length,
      averageFrameRate: this.calculateAverageMetric(performanceEvents, 'frameRate'),
      averageInputLatency: this.calculateAverageMetric(performanceEvents, 'inputLatency'),
      accessibilityInteractions: accessibilityEvents.length,
      photographyMetaphorsLearned: this.metaphorLearningEvents.size,
      navigationEfficiency: this.calculateOverallNavigationEfficiency(),
      privacyMode: this.config.privacyMode,
      currentSection: this.currentSection
    };
  }

  /**
   * Export analytics data for analysis
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    const summary = this.getSessionSummary();
    const events = this.eventQueue.map(event => ({
      ...event,
      sessionSummary: format === 'json' ? summary : undefined
    }));

    if (format === 'csv') {
      return this.convertToCSV(events);
    }

    return JSON.stringify({
      summary,
      events,
      exportTimestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Configure analytics settings
   */
  updateConfiguration(newConfig: Partial<AnalyticsConfiguration>): void {
    this.config = { ...this.config, ...newConfig };

    if (!this.config.enabled) {
      this.disable();
    }
  }

  /**
   * Disable analytics and clear data
   */
  disable(): void {
    this.isEnabled = false;
    this.eventQueue = [];

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Private helper methods
   */
  private setupNavigationListeners(): void {
    // Listen for spatial navigation events
    document.addEventListener('spatial-navigation', (event: any) => {
      this.trackNavigation({
        type: event.detail.type,
        direction: event.detail.direction,
        magnitude: event.detail.magnitude,
        duration: event.detail.duration,
        inputMethod: event.detail.inputMethod,
        photographyMetaphor: event.detail.metaphor
      });
    });

    // Listen for photography metaphor interactions
    document.addEventListener('photography-metaphor', (event: any) => {
      this.trackPhotographyMetaphor(event.detail.action, event.detail.context);
    });
  }

  private setupPerformanceMonitoring(): void {
    // Monitor performance metrics every second during navigation
    setInterval(() => {
      if (this.navigationStartTime && Date.now() - this.navigationStartTime < 5000) {
        // Collect performance data during active navigation
        const performanceData = this.collectPerformanceMetrics();
        this.trackPerformance(performanceData);
      }
    }, 1000);
  }

  private setupAccessibilityTracking(): void {
    if (!this.config.photography.trackAccessibilityUsage) return;

    // Track screen reader interactions
    document.addEventListener('screen-reader-announcement', (event: any) => {
      this.trackAccessibility({
        type: 'screen_reader_navigation',
        element: event.detail.element,
        metaphorExplanation: event.detail.explanation,
        assistiveTechnology: event.detail.technology
      });
    });

    // Track keyboard navigation
    document.addEventListener('keydown', (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        this.trackAccessibility({
          type: 'keyboard_navigation',
          element: (event.target as Element)?.tagName,
          navigationPath: [event.key]
        });
      }
    });
  }

  private collectPerformanceMetrics(): Partial<PerformanceEvent> {
    const performance = window.performance;
    const memory = (performance as any).memory;

    return {
      frameRate: this.estimateFrameRate(),
      renderTime: performance.now() % 16.67, // Approximate render time
      memoryUsage: memory ? memory.usedJSHeapSize / (1024 * 1024) : 0,
      inputLatency: this.estimateInputLatency(),
      navigationSmoothness: this.calculateNavigationSmoothness()
    };
  }

  private estimateFrameRate(): number {
    // Simplified frame rate estimation
    // In a real implementation, this would track actual animation frames
    return 60; // Placeholder
  }

  private estimateInputLatency(): number {
    // Simplified input latency estimation
    // In a real implementation, this would measure actual input processing time
    return Math.random() * 50; // Placeholder
  }

  private calculateNavigationSmoothness(): number {
    // Calculate smoothness based on frame consistency
    return Math.random() * 100; // Placeholder - implement actual smoothness calculation
  }

  private getContextualMetaphor(navigationType?: string): string {
    const metaphors = {
      pan: 'Moving camera horizontally to reveal different areas',
      tilt: 'Tilting camera up or down to change perspective',
      zoom: 'Adjusting lens to get closer or further from subject',
      focus: 'Adjusting lens focus to highlight specific elements',
      aperture: 'Controlling depth of field like camera aperture'
    };

    return metaphors[navigationType as keyof typeof metaphors] || 'Camera movement';
  }

  private trackMetaphorLearning(metaphor: string): void {
    const currentCount = this.metaphorLearningEvents.get(metaphor) || 0;
    this.metaphorLearningEvents.set(metaphor, currentCount + 1);
  }

  private updateNavigationEfficiency(type: string, duration: number): void {
    if (!this.navigationEfficiency.has(type)) {
      this.navigationEfficiency.set(type, []);
    }

    // Calculate efficiency based on duration (shorter is more efficient)
    const efficiency = Math.max(0, 100 - (duration / 1000) * 20);
    this.navigationEfficiency.get(type)!.push(efficiency);
  }

  private calculateTimeSpent(stage: string): number {
    if (stage === 'navigation_start' && this.navigationStartTime) {
      return Date.now() - this.navigationStartTime;
    }
    return 0;
  }

  private calculateNavigationEfficiency(): number {
    const allEfficiencies = Array.from(this.navigationEfficiency.values()).flat();
    return allEfficiencies.length > 0
      ? allEfficiencies.reduce((a, b) => a + b, 0) / allEfficiencies.length
      : 0;
  }

  private calculateOverallNavigationEfficiency(): number {
    return this.calculateNavigationEfficiency();
  }

  private calculateAverageMetric(events: PerformanceEvent[], metric: keyof PerformanceEvent): number {
    if (events.length === 0) return 0;
    const values = events.map(e => e[metric] as number).filter(v => typeof v === 'number');
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private queueEvent(event: NavigationEvent | PerformanceEvent | AccessibilityEvent | UserJourneyEvent): void {
    // Anonymize data if required
    if (this.config.privacy.anonymizeData) {
      event = this.anonymizeEvent(event);
    }

    this.eventQueue.push(event);

    // Flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushEvents();
    }
  }

  private anonymizeEvent(event: any): any {
    // Remove or hash personally identifiable information
    const anonymized = { ...event };
    delete anonymized.userId;

    // Hash session ID for privacy
    anonymized.sessionId = this.hashString(event.sessionId);

    return anonymized;
  }

  private hashString(str: string): string {
    // Simple hash function for anonymization
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return 'anon_' + Math.abs(hash).toString(36);
  }

  private startFlushTimer(): void {
    this.flushTimer = window.setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Send events to different endpoints based on type
      const groupedEvents = this.groupEventsByType(events);

      await Promise.all([
        this.sendEvents(groupedEvents.navigation, this.config.endpoints.events),
        this.sendEvents(groupedEvents.performance, this.config.endpoints.performance),
        this.sendEvents(groupedEvents.accessibility, this.config.endpoints.accessibility),
        this.sendEvents(groupedEvents.userJourney, this.config.endpoints.userJourney)
      ]);

    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  private groupEventsByType(events: any[]): Record<string, any[]> {
    return {
      navigation: events.filter(e => 'type' in e && ['pan', 'tilt', 'zoom', 'focus', 'aperture'].includes(e.type)),
      performance: events.filter(e => 'frameRate' in e),
      accessibility: events.filter(e => 'type' in e && e.type.includes('navigation')),
      userJourney: events.filter(e => 'stage' in e)
    };
  }

  private async sendEvents(events: any[], endpoint: string): Promise<void> {
    if (events.length === 0 || !endpoint) return;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events,
        timestamp: Date.now(),
        sessionSummary: this.getSessionSummary()
      })
    });

    if (!response.ok) {
      throw new Error(`Analytics endpoint error: ${response.status}`);
    }
  }

  private convertToCSV(events: any[]): string {
    if (events.length === 0) return '';

    const headers = Object.keys(events[0]);
    const csvRows = [
      headers.join(','),
      ...events.map(event =>
        headers.map(header => {
          const value = event[header];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }
}

export { SpatialNavigationAnalytics, type AnalyticsConfiguration, type NavigationEvent, type PerformanceEvent, type AccessibilityEvent, type UserJourneyEvent };