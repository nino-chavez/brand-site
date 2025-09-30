# Integration Patterns Documentation

## Overview

This document describes integration patterns for the LightboxCanvas system with the existing portfolio architecture, particularly the UnifiedGameFlowContext state management system and other portfolio components.

## State Management Integration

### UnifiedGameFlowContext Integration

The LightboxCanvas system integrates with the existing UnifiedGameFlowContext while maintaining state isolation and preventing unnecessary re-renders.

#### State Composition Pattern

```typescript
// Enhanced UnifiedGameFlowContext with Canvas integration
interface EnhancedGameFlowState extends GameFlowState {
  canvas: {
    // Canvas-specific state isolated from global state
    currentSection: string | null;
    cameraPosition: CameraState;
    interactionMode: 'spatial' | 'simplified' | 'traditional';
    performanceMode: 'high' | 'medium' | 'low';
    accessibilityEnabled: boolean;
  };
}

// State composition with isolation boundaries
const CanvasStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: globalState, updateState: updateGlobalState } = useUnifiedGameFlow();
  const [canvasState, setCanvasState] = useState<CanvasState>(initialCanvasState);

  // State synchronization with conflict resolution
  const syncStates = useCallback((canvasUpdates: Partial<CanvasState>) => {
    // Update canvas state
    setCanvasState(prev => ({ ...prev, ...canvasUpdates }));

    // Selectively sync with global state
    const globalUpdates: Partial<EnhancedGameFlowState> = {
      canvas: {
        currentSection: canvasUpdates.sections?.focused || globalState.canvas.currentSection,
        cameraPosition: canvasUpdates.camera || globalState.canvas.cameraPosition,
        interactionMode: canvasUpdates.interaction?.mode || globalState.canvas.interactionMode,
        performanceMode: canvasUpdates.performance?.qualityLevel || globalState.canvas.performanceMode,
        accessibilityEnabled: canvasUpdates.accessibility?.enabled ?? globalState.canvas.accessibilityEnabled
      }
    };

    updateGlobalState(globalUpdates);
  }, [globalState, updateGlobalState]);

  const contextValue = useMemo(() => ({
    canvasState,
    globalState,
    syncStates,
    // Conflict resolution for concurrent updates
    resolveStateConflicts: (canvasUpdate: Partial<CanvasState>, globalUpdate: Partial<EnhancedGameFlowState>) => {
      // Canvas state takes precedence for spatial navigation
      return {
        ...globalUpdate,
        canvas: {
          ...globalUpdate.canvas,
          ...canvasUpdate
        }
      };
    }
  }), [canvasState, globalState, syncStates]);

  return (
    <CanvasStateContext.Provider value={contextValue}>
      {children}
    </CanvasStateContext.Provider>
  );
};
```

#### Usage Pattern

```tsx
// Integration in the main portfolio component
function Portfolio() {
  return (
    <UnifiedGameFlowProvider>
      <CanvasStateProvider>
        <PortfolioLayout>
          <LightboxCanvas
            // Canvas receives isolated state
            onStateChange={(canvasUpdates) => {
              // Sync only relevant changes to global state
              syncStates(canvasUpdates);
            }}
            onSectionFocus={(sectionId) => {
              // Update both canvas and global navigation state
              syncStates({ sections: { focused: sectionId } });
              updateGlobalNavigation(sectionId);
            }}
          />
          <NavigationIndicator />
          <PerformanceOverlay />
        </PortfolioLayout>
      </CanvasStateProvider>
    </UnifiedGameFlowProvider>
  );
}
```

### State Synchronization Patterns

#### Bidirectional Sync with Debouncing

```typescript
// Optimized state synchronization with debouncing
const useStateSynchronization = () => {
  const { canvasState, globalState, syncStates } = useCanvasIntegration();
  const [pendingUpdates, setPendingUpdates] = useState<StateUpdate[]>([]);

  // Debounced sync to prevent excessive updates
  const debouncedSync = useMemo(
    () => debounce((updates: StateUpdate[]) => {
      const mergedUpdates = mergeStateUpdates(updates);
      syncStates(mergedUpdates);
      setPendingUpdates([]);
    }, 100),
    [syncStates]
  );

  const queueStateUpdate = useCallback((update: StateUpdate) => {
    setPendingUpdates(prev => [...prev, update]);
    debouncedSync([...pendingUpdates, update]);
  }, [pendingUpdates, debouncedSync]);

  return { queueStateUpdate, pendingUpdates };
};

// State update batching for performance
const useBatchedStateUpdates = () => {
  const { syncStates } = useCanvasIntegration();
  const [updateQueue, setUpdateQueue] = useState<StateUpdate[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processQueue = useCallback(async () => {
    if (updateQueue.length === 0 || isProcessing) return;

    setIsProcessing(true);

    // Batch updates using React's automatic batching
    unstable_batchedUpdates(() => {
      const batchedUpdate = updateQueue.reduce(mergeStateUpdates, {});
      syncStates(batchedUpdate);
      setUpdateQueue([]);
    });

    setIsProcessing(false);
  }, [updateQueue, isProcessing, syncStates]);

  // Process queue on next frame
  useEffect(() => {
    if (updateQueue.length > 0) {
      requestAnimationFrame(processQueue);
    }
  }, [updateQueue, processQueue]);

  const addToQueue = useCallback((update: StateUpdate) => {
    setUpdateQueue(prev => [...prev, update]);
  }, []);

  return { addToQueue, queueSize: updateQueue.length };
};
```

## Component Integration Patterns

### Navigation System Integration

#### Unified Navigation Controller

```typescript
// Navigation controller that bridges canvas and traditional navigation
class UnifiedNavigationController {
  private canvasNavigation: CanvasNavigationController;
  private traditionalNavigation: TraditionalNavigationController;
  private currentMode: 'canvas' | 'traditional';

  constructor(
    canvasController: CanvasNavigationController,
    traditionalController: TraditionalNavigationController
  ) {
    this.canvasNavigation = canvasController;
    this.traditionalNavigation = traditionalController;
    this.currentMode = this.detectNavigationMode();
  }

  // Unified navigation interface
  navigateToSection(sectionId: string, options?: NavigationOptions): Promise<void> {
    switch (this.currentMode) {
      case 'canvas':
        return this.canvasNavigation.navigateToSection(sectionId, {
          ...options,
          animate: true,
          updateCamera: true
        });

      case 'traditional':
        return this.traditionalNavigation.navigateToSection(sectionId, {
          ...options,
          smooth: true,
          updateHash: true
        });
    }
  }

  // Mode switching with state preservation
  switchNavigationMode(mode: 'canvas' | 'traditional'): void {
    const currentSection = this.getCurrentSection();
    const previousMode = this.currentMode;

    this.currentMode = mode;

    // Preserve navigation state across mode switches
    if (currentSection) {
      this.navigateToSection(currentSection, {
        immediate: true,
        preserveState: true
      });
    }

    // Emit mode change event
    this.emitModeChange(previousMode, mode);
  }

  // Auto-detect optimal navigation mode
  private detectNavigationMode(): 'canvas' | 'traditional' {
    const browserSupport = BrowserCapabilityDetector.getBrowserInfo();
    const devicePerformance = BrowserCapabilityDetector.estimateDevicePerformance();

    // Use traditional mode for low-performance devices or unsupported browsers
    if (devicePerformance === 'low' || !browserSupport.capabilities.webgl) {
      return 'traditional';
    }

    // Use canvas mode for modern browsers with good performance
    return 'canvas';
  }

  private getCurrentSection(): string | null {
    return this.currentMode === 'canvas'
      ? this.canvasNavigation.getCurrentSection()
      : this.traditionalNavigation.getCurrentSection();
  }

  private emitModeChange(from: string, to: string): void {
    window.dispatchEvent(new CustomEvent('navigationModeChange', {
      detail: { from, to, timestamp: Date.now() }
    }));
  }
}
```

#### Navigation Integration Hook

```tsx
// React hook for unified navigation
const useUnifiedNavigation = () => {
  const [navigationMode, setNavigationMode] = useState<'canvas' | 'traditional'>('canvas');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  const navigationController = useMemo(
    () => new UnifiedNavigationController(canvasController, traditionalController),
    []
  );

  const navigateToSection = useCallback(async (sectionId: string) => {
    setIsTransitioning(true);

    try {
      await navigationController.navigateToSection(sectionId);
      setCurrentSection(sectionId);
    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback to traditional navigation
      if (navigationMode === 'canvas') {
        navigationController.switchNavigationMode('traditional');
        setNavigationMode('traditional');
        await navigationController.navigateToSection(sectionId);
      }
    } finally {
      setIsTransitioning(false);
    }
  }, [navigationController, navigationMode]);

  const switchMode = useCallback((mode: 'canvas' | 'traditional') => {
    navigationController.switchNavigationMode(mode);
    setNavigationMode(mode);
  }, [navigationController]);

  return {
    navigationMode,
    currentSection,
    isTransitioning,
    navigateToSection,
    switchMode,
    canSwitchMode: navigationController.canSwitchMode()
  };
};

// Usage in components
function NavigationComponent() {
  const { navigationMode, navigateToSection, switchMode } = useUnifiedNavigation();

  return (
    <nav>
      <div className="mode-switcher">
        <button
          onClick={() => switchMode('canvas')}
          className={navigationMode === 'canvas' ? 'active' : ''}
        >
          Spatial Navigation
        </button>
        <button
          onClick={() => switchMode('traditional')}
          className={navigationMode === 'traditional' ? 'active' : ''}
        >
          Traditional Navigation
        </button>
      </div>

      <ul className="section-list">
        {sections.map(section => (
          <li key={section.id}>
            <button onClick={() => navigateToSection(section.id)}>
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

### Performance Monitoring Integration

#### Global Performance Manager

```typescript
// Global performance manager that coordinates between systems
class GlobalPerformanceManager {
  private canvasMonitor: CanvasPerformanceMonitor;
  private globalMonitor: GlobalPerformanceMonitor;
  private adaptiveManager: AdaptiveQualityManager;

  constructor() {
    this.canvasMonitor = new CanvasPerformanceMonitor();
    this.globalMonitor = new GlobalPerformanceMonitor();
    this.adaptiveManager = new AdaptiveQualityManager();

    this.setupIntegration();
  }

  private setupIntegration(): void {
    // Cross-system performance coordination
    this.canvasMonitor.onPerformanceChange((canvasMetrics) => {
      const globalMetrics = this.globalMonitor.getCurrentMetrics();
      const combinedMetrics = this.combineMetrics(canvasMetrics, globalMetrics);

      // Make global quality decisions
      this.adaptiveManager.updateQuality(combinedMetrics);

      // Notify other systems of performance changes
      this.notifyPerformanceChange(combinedMetrics);
    });

    // Global performance alerts
    this.globalMonitor.onCriticalPerformance((metrics) => {
      // Emergency performance mode affects all systems
      this.enableEmergencyMode(metrics);
    });
  }

  private combineMetrics(
    canvasMetrics: CanvasPerformanceMetrics,
    globalMetrics: GlobalPerformanceMetrics
  ): CombinedPerformanceMetrics {
    return {
      fps: Math.min(canvasMetrics.fps, globalMetrics.fps),
      memory: {
        canvas: canvasMetrics.memory,
        global: globalMetrics.memory,
        total: canvasMetrics.memory + globalMetrics.memory
      },
      cpu: {
        canvas: canvasMetrics.cpu,
        global: globalMetrics.cpu,
        combined: canvasMetrics.cpu + globalMetrics.cpu
      },
      renderTime: canvasMetrics.renderTime + globalMetrics.renderTime,
      interactions: {
        canvas: canvasMetrics.interactions,
        global: globalMetrics.interactions
      }
    };
  }

  private enableEmergencyMode(metrics: CombinedPerformanceMetrics): void {
    // Canvas emergency optimizations
    this.canvasMonitor.enableEmergencyMode({
      disableEffects: true,
      reduceAnimations: true,
      lowerRenderScale: true
    });

    // Global emergency optimizations
    this.globalMonitor.enableEmergencyMode({
      suspendNonCriticalComponents: true,
      reducePrecision: true,
      disableBackgroundTasks: true
    });

    // User notification
    this.notifyUser('performance-emergency', {
      message: 'Performance optimization mode activated',
      duration: 3000
    });
  }
}
```

#### Performance Integration Hook

```tsx
const usePerformanceIntegration = () => {
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    mode: 'normal',
    metrics: null,
    alerts: []
  });

  const performanceManager = useMemo(() => new GlobalPerformanceManager(), []);

  useEffect(() => {
    const unsubscribe = performanceManager.subscribe((state) => {
      setPerformanceState(state);
    });

    performanceManager.start();

    return () => {
      performanceManager.stop();
      unsubscribe();
    };
  }, [performanceManager]);

  const requestPerformanceMode = useCallback((mode: PerformanceMode) => {
    performanceManager.setMode(mode);
  }, [performanceManager]);

  return {
    performanceState,
    requestPerformanceMode,
    emergencyMode: performanceState.mode === 'emergency'
  };
};
```

### Accessibility Integration

#### Unified Accessibility Manager

```typescript
// Accessibility manager that coordinates across components
class UnifiedAccessibilityManager {
  private canvasA11y: CanvasAccessibilityController;
  private globalA11y: GlobalAccessibilityController;
  private announcer: ScreenReaderAnnouncer;

  constructor() {
    this.canvasA11y = new CanvasAccessibilityController();
    this.globalA11y = new GlobalAccessibilityController();
    this.announcer = new ScreenReaderAnnouncer();

    this.setupAccessibilityIntegration();
  }

  private setupAccessibilityIntegration(): void {
    // Coordinate focus management between systems
    this.canvasA11y.onFocusChange((canvasFocus) => {
      // Update global focus state
      this.globalA11y.updateFocusContext(canvasFocus);

      // Announce spatial context to screen readers
      this.announcer.announceSpatialNavigation(canvasFocus);
    });

    // Global keyboard navigation coordination
    this.globalA11y.onKeyboardNavigation((navigation) => {
      if (navigation.target === 'canvas') {
        this.canvasA11y.handleKeyboardNavigation(navigation);
      }
    });

    // Accessibility mode synchronization
    this.globalA11y.onModeChange((mode) => {
      this.canvasA11y.setAccessibilityMode(mode);
      this.updateCanvasForAccessibility(mode);
    });
  }

  private updateCanvasForAccessibility(mode: AccessibilityMode): void {
    if (mode.screenReader) {
      // Enable linearized navigation
      this.canvasA11y.enableLinearizedNavigation();

      // Enhance spatial announcements
      this.announcer.enableDetailedSpatialAnnouncements();
    }

    if (mode.keyboardOnly) {
      // Ensure all interactions are keyboard accessible
      this.canvasA11y.enforceKeyboardAccessibility();

      // Show focus indicators
      this.canvasA11y.enableVisualFocusIndicators();
    }

    if (mode.reducedMotion) {
      // Disable animations and transitions
      this.canvasA11y.disableAnimations();

      // Use instant transitions
      this.canvasA11y.enableInstantTransitions();
    }
  }

  // Public API for accessibility control
  enableAccessibilityMode(mode: AccessibilityMode): void {
    this.globalA11y.setMode(mode);
  }

  announceCanvasNavigation(from: string, to: string, context: string): void {
    const announcement = this.buildSpatialAnnouncement(from, to, context);
    this.announcer.announce(announcement, 'assertive');
  }

  private buildSpatialAnnouncement(from: string, to: string, context: string): string {
    const position = this.canvasA11y.getSectionPosition(to);
    const totalSections = this.canvasA11y.getTotalSections();

    return `Navigated to ${to} section. ${context}. Position ${position.row + 1}, ${position.col + 1} in ${totalSections} section grid.`;
  }
}
```

## URL and Routing Integration

### Deep Linking Support

```typescript
// URL state synchronization for canvas navigation
class CanvasURLIntegration {
  private canvasController: LightboxCanvasController;
  private urlParams: URLSearchParams;

  constructor(canvasController: LightboxCanvasController) {
    this.canvasController = canvasController;
    this.urlParams = new URLSearchParams(window.location.search);

    this.setupURLSync();
    this.restoreFromURL();
  }

  private setupURLSync(): void {
    // Listen for canvas navigation changes
    this.canvasController.onNavigationChange((navigation) => {
      this.updateURL(navigation);
    });

    // Listen for browser navigation (back/forward)
    window.addEventListener('popstate', () => {
      this.restoreFromURL();
    });

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const sectionId = window.location.hash.slice(1);
      if (sectionId) {
        this.canvasController.navigateToSection(sectionId);
      }
    });
  }

  private updateURL(navigation: CanvasNavigation): void {
    const url = new URL(window.location.href);

    // Update hash for current section
    if (navigation.currentSection) {
      url.hash = navigation.currentSection;
    }

    // Update search params for canvas state
    url.searchParams.set('camera', this.serializeCameraState(navigation.camera));
    url.searchParams.set('mode', navigation.mode);

    // Update URL without page reload
    window.history.replaceState(
      { canvasNavigation: navigation },
      '',
      url.toString()
    );
  }

  private restoreFromURL(): void {
    const url = new URL(window.location.href);
    const sectionId = url.hash.slice(1);
    const cameraState = url.searchParams.get('camera');
    const mode = url.searchParams.get('mode');

    // Restore canvas state from URL
    if (sectionId) {
      this.canvasController.navigateToSection(sectionId, { immediate: true });
    }

    if (cameraState) {
      const camera = this.deserializeCameraState(cameraState);
      this.canvasController.setCameraState(camera);
    }

    if (mode) {
      this.canvasController.setNavigationMode(mode as NavigationMode);
    }
  }

  private serializeCameraState(camera: CameraState): string {
    return btoa(JSON.stringify({
      position: camera.position,
      zoom: camera.zoom,
      rotation: camera.rotation
    }));
  }

  private deserializeCameraState(serialized: string): CameraState {
    try {
      return JSON.parse(atob(serialized));
    } catch {
      return { position: { x: 0, y: 0 }, zoom: 1, rotation: 0 };
    }
  }
}

// React hook for URL integration
const useCanvasURLIntegration = (canvasController: LightboxCanvasController) => {
  const [urlIntegration] = useState(() => new CanvasURLIntegration(canvasController));

  useEffect(() => {
    return () => {
      // Cleanup URL listeners
      urlIntegration.cleanup();
    };
  }, [urlIntegration]);

  const navigateWithURL = useCallback((sectionId: string) => {
    // Navigate and update URL
    canvasController.navigateToSection(sectionId);
  }, [canvasController]);

  return { navigateWithURL };
};
```

## Analytics Integration

### Canvas Analytics Tracking

```typescript
// Analytics integration for canvas interactions
class CanvasAnalytics {
  private analyticsProvider: AnalyticsProvider;
  private sessionId: string;
  private interactionLog: CanvasInteraction[];

  constructor(analyticsProvider: AnalyticsProvider) {
    this.analyticsProvider = analyticsProvider;
    this.sessionId = generateSessionId();
    this.interactionLog = [];

    this.setupTracking();
  }

  private setupTracking(): void {
    // Track canvas initialization
    this.track('canvas_initialized', {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      browserInfo: BrowserCapabilityDetector.getBrowserInfo(),
      initialMode: 'canvas'
    });

    // Track section navigation
    document.addEventListener('section:focus', (event: CustomEvent) => {
      this.trackSectionNavigation(event.detail);
    });

    // Track performance metrics
    document.addEventListener('performance:change', (event: CustomEvent) => {
      this.trackPerformanceMetrics(event.detail);
    });

    // Track accessibility usage
    document.addEventListener('accessibility:enabled', (event: CustomEvent) => {
      this.trackAccessibilityUsage(event.detail);
    });
  }

  private trackSectionNavigation(navigation: SectionNavigation): void {
    const interaction: CanvasInteraction = {
      type: 'section_navigation',
      sectionId: navigation.sectionId,
      previousSection: navigation.previousSection,
      trigger: navigation.trigger,
      duration: navigation.duration,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.interactionLog.push(interaction);

    this.track('section_navigated', {
      ...interaction,
      totalInteractions: this.interactionLog.length,
      sessionDuration: Date.now() - this.getSessionStartTime()
    });
  }

  private trackPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.track('performance_metrics', {
      sessionId: this.sessionId,
      fps: metrics.fps,
      memory: metrics.memory,
      qualityLevel: metrics.qualityLevel,
      adaptationsApplied: metrics.adaptations,
      timestamp: Date.now()
    });
  }

  private trackAccessibilityUsage(accessibilityData: AccessibilityUsage): void {
    this.track('accessibility_usage', {
      sessionId: this.sessionId,
      features: accessibilityData.enabledFeatures,
      keyboardNavigation: accessibilityData.keyboardNavigation,
      screenReaderSupport: accessibilityData.screenReaderSupport,
      timestamp: Date.now()
    });
  }

  // Generate session summary for analytics
  generateSessionSummary(): CanvasSessionSummary {
    const endTime = Date.now();
    const startTime = this.getSessionStartTime();
    const duration = endTime - startTime;

    return {
      sessionId: this.sessionId,
      duration,
      totalInteractions: this.interactionLog.length,
      sectionsVisited: this.getUniqueSectionsVisited(),
      navigationPatterns: this.analyzeNavigationPatterns(),
      performanceSummary: this.getPerformanceSummary(),
      accessibilityUsage: this.getAccessibilityUsage(),
      userAgent: navigator.userAgent,
      viewportDimensions: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  private track(eventName: string, data: any): void {
    this.analyticsProvider.track(eventName, {
      ...data,
      component: 'lightbox_canvas',
      version: process.env.REACT_APP_VERSION
    });
  }
}

// React hook for analytics integration
const useCanvasAnalytics = () => {
  const [analytics] = useState(() => new CanvasAnalytics(globalAnalytics));

  useEffect(() => {
    // Track component mount
    analytics.track('canvas_component_mounted', {
      timestamp: Date.now()
    });

    return () => {
      // Track component unmount and send session summary
      const sessionSummary = analytics.generateSessionSummary();
      analytics.track('canvas_session_ended', sessionSummary);
    };
  }, [analytics]);

  const trackCustomEvent = useCallback((eventName: string, data: any) => {
    analytics.track(eventName, data);
  }, [analytics]);

  return { trackCustomEvent };
};
```

## Error Handling Integration

### Unified Error Boundary System

```tsx
// Error boundary that handles both canvas and global errors
class UnifiedErrorBoundary extends React.Component<
  UnifiedErrorBoundaryProps,
  UnifiedErrorBoundaryState
> {
  private canvasErrorHandler: CanvasErrorHandler;
  private globalErrorHandler: GlobalErrorHandler;

  constructor(props: UnifiedErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      fallbackMode: 'none'
    };

    this.canvasErrorHandler = new CanvasErrorHandler();
    this.globalErrorHandler = new GlobalErrorHandler();

    this.setupErrorHandling();
  }

  static getDerivedStateFromError(error: Error): Partial<UnifiedErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Determine error source and appropriate fallback
    const errorSource = this.determineErrorSource(error);
    const fallbackMode = this.determineFallbackMode(error, errorSource);

    this.setState({ fallbackMode });

    // Report error with context
    this.reportError(error, errorInfo, errorSource);

    // Attempt recovery
    this.attemptRecovery(error, errorSource);
  }

  private setupErrorHandling(): void {
    // Canvas-specific error handling
    this.canvasErrorHandler.onError((canvasError) => {
      if (canvasError.severity === 'critical') {
        this.setState({
          hasError: true,
          error: canvasError,
          fallbackMode: 'traditional'
        });
      } else {
        // Non-critical errors can be handled gracefully
        this.handleNonCriticalError(canvasError);
      }
    });

    // Global error handling
    window.addEventListener('unhandledrejection', (event) => {
      this.handlePromiseRejection(event);
    });
  }

  private determineErrorSource(error: Error): ErrorSource {
    if (error.stack?.includes('LightboxCanvas') || error.stack?.includes('Canvas')) {
      return 'canvas';
    }

    if (error.stack?.includes('UnifiedGameFlow')) {
      return 'state-management';
    }

    return 'unknown';
  }

  private determineFallbackMode(error: Error, source: ErrorSource): FallbackMode {
    switch (source) {
      case 'canvas':
        // Canvas errors fall back to traditional navigation
        return 'traditional';

      case 'state-management':
        // State errors fall back to local state
        return 'local-state';

      default:
        return 'minimal';
    }
  }

  private attemptRecovery(error: Error, source: ErrorSource): void {
    switch (source) {
      case 'canvas':
        // Try to recover canvas functionality
        this.canvasErrorHandler.attemptRecovery(error);
        break;

      case 'state-management':
        // Reset state to known good state
        this.globalErrorHandler.resetToSafeState();
        break;
    }
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }

  private renderFallback(): React.ReactNode {
    switch (this.state.fallbackMode) {
      case 'traditional':
        return (
          <TraditionalNavigationFallback
            error={this.state.error}
            onRetry={() => this.retry()}
          />
        );

      case 'local-state':
        return (
          <LocalStateFallback
            error={this.state.error}
            onRetry={() => this.retry()}
          />
        );

      case 'minimal':
        return (
          <MinimalFallback
            error={this.state.error}
            onRetry={() => this.retry()}
          />
        );

      default:
        return (
          <div>
            <h2>Something went wrong</h2>
            <p>Please refresh the page to continue.</p>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        );
    }
  }

  private retry(): void {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      fallbackMode: 'none'
    });
  }
}

// Usage in app
function App() {
  return (
    <UnifiedErrorBoundary
      fallbackComponent={CustomErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application error:', error);
        reportToErrorService(error, errorInfo);
      }}
    >
      <UnifiedGameFlowProvider>
        <CanvasStateProvider>
          <Portfolio />
        </CanvasStateProvider>
      </UnifiedGameFlowProvider>
    </UnifiedErrorBoundary>
  );
}
```

## Testing Integration Patterns

### Integration Test Utilities

```typescript
// Testing utilities for integration scenarios
class CanvasIntegrationTestUtils {
  // Test state synchronization between systems
  static async testStateSynchronization(
    canvasController: LightboxCanvasController,
    globalState: UnifiedGameFlowState
  ): Promise<TestResult> {
    const initialGlobalState = { ...globalState };
    const initialCanvasState = canvasController.getState();

    // Trigger canvas navigation
    await canvasController.navigateToSection('about');

    // Check if global state was updated
    const updatedGlobalState = globalState;
    const updatedCanvasState = canvasController.getState();

    return {
      passed:
        updatedGlobalState.canvas.currentSection === 'about' &&
        updatedCanvasState.sections.focused === 'about',
      details: {
        globalStateChanged: updatedGlobalState !== initialGlobalState,
        canvasStateChanged: updatedCanvasState !== initialCanvasState,
        synchronizationWorking: updatedGlobalState.canvas.currentSection === updatedCanvasState.sections.focused
      }
    };
  }

  // Test error boundary integration
  static async testErrorRecovery(
    errorBoundary: UnifiedErrorBoundary,
    triggerError: () => void
  ): Promise<TestResult> {
    const initialState = errorBoundary.state;

    // Trigger error
    triggerError();

    // Wait for error boundary to process
    await new Promise(resolve => setTimeout(resolve, 100));

    const errorState = errorBoundary.state;

    // Attempt recovery
    errorBoundary.retry();

    // Wait for recovery
    await new Promise(resolve => setTimeout(resolve, 100));

    const recoveryState = errorBoundary.state;

    return {
      passed:
        errorState.hasError === true &&
        recoveryState.hasError === false,
      details: {
        errorDetected: errorState.hasError,
        recoverySuccessful: !recoveryState.hasError,
        fallbackActivated: errorState.fallbackMode !== 'none'
      }
    };
  }

  // Test performance coordination
  static async testPerformanceCoordination(
    canvasMonitor: CanvasPerformanceMonitor,
    globalMonitor: GlobalPerformanceMonitor
  ): Promise<TestResult> {
    // Simulate high load
    const highLoadSimulation = () => {
      for (let i = 0; i < 1000000; i++) {
        // CPU intensive operation
        Math.random() * Math.random();
      }
    };

    const initialCanvasMetrics = canvasMonitor.getCurrentMetrics();
    const initialGlobalMetrics = globalMonitor.getCurrentMetrics();

    // Trigger high load
    highLoadSimulation();

    // Wait for metrics to update
    await new Promise(resolve => setTimeout(resolve, 200));

    const loadedCanvasMetrics = canvasMonitor.getCurrentMetrics();
    const loadedGlobalMetrics = globalMonitor.getCurrentMetrics();

    return {
      passed:
        loadedCanvasMetrics.fps < initialCanvasMetrics.fps &&
        loadedGlobalMetrics.fps < initialGlobalMetrics.fps,
      details: {
        canvasPerformanceDetected: loadedCanvasMetrics.fps < initialCanvasMetrics.fps,
        globalPerformanceDetected: loadedGlobalMetrics.fps < initialGlobalMetrics.fps,
        coordinationWorking: Math.abs(loadedCanvasMetrics.fps - loadedGlobalMetrics.fps) < 10
      }
    };
  }
}

// Integration test setup
export const setupIntegrationTests = () => {
  return {
    CanvasIntegrationTestUtils,
    mockUnifiedGameFlowContext: () => ({
      state: createMockGameFlowState(),
      updateState: vi.fn(),
      resetState: vi.fn()
    }),
    mockCanvasController: () => ({
      navigateToSection: vi.fn(),
      getState: vi.fn(() => createMockCanvasState()),
      setState: vi.fn()
    }),
    createTestEnvironment: () => ({
      renderWithProviders: (component: React.ReactElement) => {
        return render(
          <UnifiedGameFlowProvider>
            <CanvasStateProvider>
              {component}
            </CanvasStateProvider>
          </UnifiedGameFlowProvider>
        );
      }
    })
  };
};
```

This integration patterns documentation provides comprehensive guidance for integrating the LightboxCanvas system with the existing portfolio architecture, ensuring seamless coordination between all components while maintaining performance, accessibility, and error handling standards.