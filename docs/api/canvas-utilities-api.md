# Canvas Utilities API Documentation

## Overview

The Canvas Utilities provide mathematical functions, coordinate transformations, and helper utilities for the LightboxCanvas system. These utilities handle spatial calculations, performance monitoring, and state management operations.

## CanvasCoordinateTransforms

### Core Transformation Functions

#### `screenToCanvasCoordinates`

Converts screen coordinates to canvas coordinate system.

```typescript
function screenToCanvasCoordinates(
  screenPoint: { x: number; y: number },
  cameraState: CameraState,
  canvasDimensions: { width: number; height: number }
): { x: number; y: number }
```

**Parameters:**
- `screenPoint`: Screen coordinates (relative to viewport)
- `cameraState`: Current camera position and zoom level
- `canvasDimensions`: Canvas container dimensions

**Returns:** Canvas coordinates in the spatial grid system

**Example:**
```typescript
import { screenToCanvasCoordinates } from './utils/CanvasCoordinateTransforms';

// Convert mouse click to canvas position
const handleClick = (event: MouseEvent) => {
  const screenPoint = { x: event.clientX, y: event.clientY };
  const canvasPoint = screenToCanvasCoordinates(
    screenPoint,
    currentCameraState,
    { width: 1024, height: 768 }
  );

  console.log(`Canvas position: ${canvasPoint.x}, ${canvasPoint.y}`);
};
```

#### `canvasToScreenCoordinates`

Converts canvas coordinates to screen coordinate system.

```typescript
function canvasToScreenCoordinates(
  canvasPoint: { x: number; y: number },
  cameraState: CameraState,
  canvasDimensions: { width: number; height: number }
): { x: number; y: number }
```

**Example:**
```typescript
// Position UI element at canvas coordinate
const positionTooltip = (canvasPosition: { x: number; y: number }) => {
  const screenPosition = canvasToScreenCoordinates(
    canvasPosition,
    currentCameraState,
    canvasDimensions
  );

  tooltip.style.left = `${screenPosition.x}px`;
  tooltip.style.top = `${screenPosition.y}px`;
};
```

#### `getSectionBounds`

Calculates the spatial bounds of a section in canvas coordinates.

```typescript
function getSectionBounds(
  section: SpatialSection,
  gridConfig: GridConfiguration
): {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}
```

**Parameters:**
- `section`: Section with row/column position
- `gridConfig`: Grid layout configuration

**Example:**
```typescript
const gridConfig = {
  rows: 2,
  columns: 3,
  sectionWidth: 400,
  sectionHeight: 300,
  gap: 16
};

const bounds = getSectionBounds(
  { id: 'about', row: 0, col: 0 },
  gridConfig
);

console.log(`Section bounds: ${bounds.left}, ${bounds.top}, ${bounds.width}x${bounds.height}`);
```

#### `calculateOptimalCameraPosition`

Determines the best camera position to view a specific section or area.

```typescript
function calculateOptimalCameraPosition(
  targetBounds: BoundingBox,
  viewportDimensions: { width: number; height: number },
  options?: {
    padding?: number;
    minZoom?: number;
    maxZoom?: number;
    preserveAspectRatio?: boolean;
  }
): CameraState
```

**Example:**
```typescript
// Focus on a specific section with optimal framing
const focusOnSection = (sectionId: string) => {
  const section = findSectionById(sectionId);
  const bounds = getSectionBounds(section, gridConfig);

  const optimalCamera = calculateOptimalCameraPosition(
    bounds,
    { width: window.innerWidth, height: window.innerHeight },
    { padding: 50, minZoom: 0.5, maxZoom: 2.0 }
  );

  animateToCamera(optimalCamera);
};
```

### Grid Layout Utilities

#### `GridLayoutCalculator`

Utility class for grid layout calculations and responsive behavior.

```typescript
class GridLayoutCalculator {
  constructor(config: GridConfiguration);

  // Calculate section position in grid
  getSectionPosition(row: number, col: number): { x: number; y: number };

  // Get section at specific coordinate
  getSectionAtPosition(x: number, y: number): { row: number; col: number } | null;

  // Calculate total grid dimensions
  getTotalDimensions(): { width: number; height: number };

  // Responsive grid scaling
  calculateResponsiveScale(viewport: ViewportDimensions): number;

  // Section visibility testing
  isSectionVisible(section: SpatialSection, camera: CameraState, viewport: ViewportDimensions): boolean;
}
```

**Example:**
```typescript
const gridCalculator = new GridLayoutCalculator({
  rows: 2,
  columns: 3,
  sectionWidth: 400,
  sectionHeight: 300,
  gap: 20
});

// Get position of section in row 1, column 2
const position = gridCalculator.getSectionPosition(1, 2);

// Check which section is at coordinate (500, 350)
const sectionCoord = gridCalculator.getSectionAtPosition(500, 350);

// Calculate responsive scaling for mobile
const mobileScale = gridCalculator.calculateResponsiveScale({
  width: 375,
  height: 667
});
```

### Spatial Mathematics

#### `SpatialMath`

Mathematical utilities for spatial calculations.

```typescript
namespace SpatialMath {
  // Distance calculations
  export function distance(p1: Point, p2: Point): number;
  export function manhattanDistance(p1: Point, p2: Point): number;

  // Interpolation functions
  export function lerp(start: number, end: number, t: number): number;
  export function lerpPoint(start: Point, end: Point, t: number): Point;
  export function smoothstep(edge0: number, edge1: number, x: number): number;

  // Geometric operations
  export function rotatePoint(point: Point, angle: number, origin?: Point): Point;
  export function scalePoint(point: Point, scale: number, origin?: Point): Point;
  export function translatePoint(point: Point, offset: Point): Point;

  // Bounding box operations
  export function boundingBoxContains(box: BoundingBox, point: Point): boolean;
  export function boundingBoxIntersects(box1: BoundingBox, box2: BoundingBox): boolean;
  export function expandBoundingBox(box: BoundingBox, padding: number): BoundingBox;

  // Viewport utilities
  export function pointInViewport(point: Point, viewport: ViewportDimensions): boolean;
  export function clampToViewport(point: Point, viewport: ViewportDimensions): Point;
}
```

**Example:**
```typescript
import { SpatialMath } from './utils/SpatialMath';

// Animate between two points
const animateCamera = (from: Point, to: Point, duration: number) => {
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth interpolation
    const smoothProgress = SpatialMath.smoothstep(0, 1, progress);
    const currentPosition = SpatialMath.lerpPoint(from, to, smoothProgress);

    updateCameraPosition(currentPosition);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// Check if section is visible
const isVisible = (section: SpatialSection, camera: CameraState) => {
  const sectionBounds = getSectionBounds(section, gridConfig);
  const viewportBounds = calculateViewportBounds(camera, canvasDimensions);

  return SpatialMath.boundingBoxIntersects(sectionBounds, viewportBounds);
};
```

## CanvasPerformanceMonitor

### Performance Monitoring System

#### `PerformanceMonitor`

Main performance monitoring class with comprehensive metrics collection.

```typescript
class PerformanceMonitor {
  constructor(config: PerformanceMonitorConfig);

  // Lifecycle management
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;

  // Metrics collection
  getCurrentMetrics(): PerformanceMetrics;
  getHistoricalMetrics(timeRange?: number): PerformanceMetrics[];

  // Frame rate monitoring
  startFrameRateMonitoring(): void;
  getAverageFrameRate(sampleSize?: number): number;

  // Memory monitoring
  startMemoryMonitoring(): void;
  getCurrentMemoryUsage(): MemoryMetrics;
  detectMemoryLeaks(): MemoryLeakDetection;

  // Performance thresholds
  setThresholds(thresholds: PerformanceThresholds): void;
  checkThresholds(): ThresholdViolation[];

  // Event handling
  onPerformanceChange(callback: PerformanceChangeCallback): void;
  onThresholdViolation(callback: ThresholdViolationCallback): void;
}
```

**Configuration:**
```typescript
interface PerformanceMonitorConfig {
  // Monitoring intervals
  sampleInterval: number; // ms
  metricsRetentionTime: number; // ms

  // What to monitor
  enableFrameRateMonitoring: boolean;
  enableMemoryMonitoring: boolean;
  enableRenderTimeMonitoring: boolean;
  enableInteractionLatencyMonitoring: boolean;

  // Performance thresholds
  thresholds: {
    frameRate: { warning: number; critical: number };
    memory: { warning: number; critical: number };
    renderTime: { warning: number; critical: number };
  };

  // Reporting
  enableConsoleLogging: boolean;
  enablePerformanceAPI: boolean;
  reportingInterval: number;
}
```

**Usage Example:**
```typescript
import { PerformanceMonitor } from './utils/CanvasPerformanceMonitor';

const performanceMonitor = new PerformanceMonitor({
  sampleInterval: 100,
  metricsRetentionTime: 60000, // 1 minute
  enableFrameRateMonitoring: true,
  enableMemoryMonitoring: true,
  enableRenderTimeMonitoring: true,
  thresholds: {
    frameRate: { warning: 45, critical: 30 },
    memory: { warning: 40, critical: 50 },
    renderTime: { warning: 20, critical: 33 }
  },
  enableConsoleLogging: process.env.NODE_ENV === 'development'
});

// Start monitoring
performanceMonitor.start();

// Handle performance changes
performanceMonitor.onPerformanceChange((metrics) => {
  if (metrics.frameRate < 45) {
    // Reduce animation complexity
    setAnimationQuality('low');
  }

  if (metrics.memory > 40) {
    // Trigger garbage collection or cleanup
    triggerCleanup();
  }
});

// Handle threshold violations
performanceMonitor.onThresholdViolation((violations) => {
  violations.forEach(violation => {
    console.warn(`Performance threshold violated: ${violation.metric} = ${violation.value}`);

    switch (violation.metric) {
      case 'frameRate':
        if (violation.level === 'critical') {
          enableEmergencyMode();
        }
        break;
      case 'memory':
        if (violation.level === 'warning') {
          scheduleGarbageCollection();
        }
        break;
    }
  });
});
```

#### `AdaptiveQualityManager`

Manages automatic quality adjustments based on performance metrics.

```typescript
class AdaptiveQualityManager {
  constructor(
    performanceMonitor: PerformanceMonitor,
    qualityLevels: QualityLevel[]
  );

  // Quality management
  getCurrentQualityLevel(): QualityLevel;
  setQualityLevel(level: QualityLevel): void;
  autoAdjustQuality(metrics: PerformanceMetrics): QualityLevel;

  // Configuration
  setAdaptationRules(rules: AdaptationRule[]): void;
  setQualityTransitionSpeed(speed: number): void;

  // Callbacks
  onQualityChange(callback: QualityChangeCallback): void;
}
```

**Quality Levels:**
```typescript
interface QualityLevel {
  name: string;
  level: number; // 0-1 scale
  settings: {
    animationComplexity: number;
    effectsEnabled: boolean;
    renderScale: number;
    updateFrequency: number;
    particleCount: number;
    shadowQuality: 'none' | 'low' | 'medium' | 'high';
  };
}

const qualityLevels: QualityLevel[] = [
  {
    name: 'ultra',
    level: 1.0,
    settings: {
      animationComplexity: 1.0,
      effectsEnabled: true,
      renderScale: 1.0,
      updateFrequency: 60,
      particleCount: 100,
      shadowQuality: 'high'
    }
  },
  {
    name: 'high',
    level: 0.8,
    settings: {
      animationComplexity: 0.8,
      effectsEnabled: true,
      renderScale: 1.0,
      updateFrequency: 60,
      particleCount: 50,
      shadowQuality: 'medium'
    }
  },
  {
    name: 'medium',
    level: 0.6,
    settings: {
      animationComplexity: 0.6,
      effectsEnabled: true,
      renderScale: 0.8,
      updateFrequency: 45,
      particleCount: 25,
      shadowQuality: 'low'
    }
  },
  {
    name: 'low',
    level: 0.3,
    settings: {
      animationComplexity: 0.3,
      effectsEnabled: false,
      renderScale: 0.6,
      updateFrequency: 30,
      particleCount: 0,
      shadowQuality: 'none'
    }
  }
];
```

**Usage Example:**
```typescript
const qualityManager = new AdaptiveQualityManager(
  performanceMonitor,
  qualityLevels
);

// Set adaptation rules
qualityManager.setAdaptationRules([
  {
    condition: (metrics) => metrics.frameRate < 45,
    action: 'decrease',
    priority: 'high'
  },
  {
    condition: (metrics) => metrics.memory > 50,
    action: 'decrease',
    priority: 'critical'
  },
  {
    condition: (metrics) => metrics.frameRate > 55 && metrics.memory < 30,
    action: 'increase',
    priority: 'low'
  }
]);

// Handle quality changes
qualityManager.onQualityChange((newLevel, oldLevel, reason) => {
  console.log(`Quality changed from ${oldLevel.name} to ${newLevel.name}: ${reason}`);

  // Apply new settings
  applyQualitySettings(newLevel.settings);

  // Notify user if significant change
  if (Math.abs(newLevel.level - oldLevel.level) > 0.3) {
    showQualityChangeNotification(newLevel.name);
  }
});
```

## State Management Utilities

### `CanvasStateManager`

Centralized state management for canvas operations.

```typescript
class CanvasStateManager {
  constructor(initialState: CanvasState);

  // State access
  getState(): CanvasState;
  getStateSlice<K extends keyof CanvasState>(key: K): CanvasState[K];

  // State updates
  setState(updates: Partial<CanvasState>): void;
  updateStateSlice<K extends keyof CanvasState>(
    key: K,
    updates: Partial<CanvasState[K]>
  ): void;

  // Batched updates
  batchUpdate(updateFn: (state: CanvasState) => Partial<CanvasState>): void;

  // State history
  undo(): boolean;
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;

  // Subscriptions
  subscribe(callback: StateChangeCallback): () => void;
  subscribeToSlice<K extends keyof CanvasState>(
    key: K,
    callback: StateSliceChangeCallback<K>
  ): () => void;

  // Persistence
  saveState(): string;
  loadState(serializedState: string): void;

  // Validation
  validateState(state: Partial<CanvasState>): ValidationResult;
}
```

**State Interface:**
```typescript
interface CanvasState {
  // Camera state
  camera: {
    position: { x: number; y: number };
    zoom: number;
    rotation: number;
    target: string | null;
  };

  // Section management
  sections: {
    focused: string | null;
    visible: string[];
    loading: string[];
  };

  // Interaction state
  interaction: {
    mode: 'idle' | 'panning' | 'zooming' | 'transitioning';
    gesture: GestureState | null;
    keyboard: KeyboardState;
  };

  // Performance state
  performance: {
    qualityLevel: string;
    metrics: PerformanceMetrics;
    adaptiveMode: boolean;
  };

  // Accessibility state
  accessibility: {
    enabled: boolean;
    keyboardNavigation: boolean;
    screenReaderMode: boolean;
    announcements: string[];
  };

  // Configuration
  config: {
    grid: GridConfiguration;
    photography: PhotographyConfig;
    animation: AnimationConfig;
  };
}
```

**Usage Example:**
```typescript
import { CanvasStateManager } from './utils/CanvasStateManager';

const stateManager = new CanvasStateManager({
  camera: {
    position: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
    target: null
  },
  sections: {
    focused: null,
    visible: [],
    loading: []
  },
  // ... other initial state
});

// Subscribe to camera changes
const unsubscribeCamera = stateManager.subscribeToSlice('camera', (camera, previousCamera) => {
  if (camera.position !== previousCamera.position) {
    updateCameraPosition(camera.position);
  }

  if (camera.zoom !== previousCamera.zoom) {
    updateCameraZoom(camera.zoom);
  }
});

// Batch camera update
stateManager.batchUpdate(state => ({
  camera: {
    ...state.camera,
    position: { x: 100, y: 200 },
    zoom: 1.5,
    target: 'about'
  },
  sections: {
    ...state.sections,
    focused: 'about'
  }
}));

// Save/restore state
const savedState = stateManager.saveState();
localStorage.setItem('canvasState', savedState);

// Later...
const restoredState = localStorage.getItem('canvasState');
if (restoredState) {
  stateManager.loadState(restoredState);
}
```

### `StateValidator`

Validation utilities for state management.

```typescript
class StateValidator {
  static validateCameraState(camera: CameraState): ValidationResult;
  static validateSectionState(sections: SectionState): ValidationResult;
  static validatePerformanceState(performance: PerformanceState): ValidationResult;
  static validateCompleteState(state: CanvasState): ValidationResult;

  // Custom validation rules
  static addValidationRule(rule: ValidationRule): void;
  static removeValidationRule(ruleName: string): void;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationRule {
  name: string;
  validate: (value: any, context: ValidationContext) => ValidationResult;
  priority: 'low' | 'medium' | 'high' | 'critical';
}
```

## Event System Utilities

### `CanvasEventBus`

Centralized event system for canvas components.

```typescript
class CanvasEventBus {
  // Event subscription
  on<T extends CanvasEvent>(
    eventType: T['type'],
    handler: EventHandler<T>
  ): () => void;

  once<T extends CanvasEvent>(
    eventType: T['type'],
    handler: EventHandler<T>
  ): () => void;

  off<T extends CanvasEvent>(
    eventType: T['type'],
    handler: EventHandler<T>
  ): void;

  // Event emission
  emit<T extends CanvasEvent>(event: T): void;

  // Event filtering and middleware
  addMiddleware(middleware: EventMiddleware): void;
  removeMiddleware(middleware: EventMiddleware): void;

  // Event history and debugging
  getEventHistory(limit?: number): CanvasEvent[];
  enableDebugging(enabled: boolean): void;
}
```

**Canvas Events:**
```typescript
// Event type definitions
type CanvasEvent =
  | SectionFocusEvent
  | CameraMovementEvent
  | GestureEvent
  | PerformanceEvent
  | AccessibilityEvent
  | StateChangeEvent;

interface SectionFocusEvent {
  type: 'section:focus';
  sectionId: string;
  previousSectionId: string | null;
  timestamp: number;
  trigger: 'click' | 'keyboard' | 'gesture' | 'programmatic';
}

interface CameraMovementEvent {
  type: 'camera:move';
  from: CameraState;
  to: CameraState;
  duration: number;
  easing: string;
  trigger: 'user' | 'animation' | 'programmatic';
}

interface PerformanceEvent {
  type: 'performance:change';
  metrics: PerformanceMetrics;
  threshold: 'normal' | 'warning' | 'critical';
  adaptations: string[];
}
```

**Usage Example:**
```typescript
import { CanvasEventBus } from './utils/CanvasEventBus';

const eventBus = new CanvasEventBus();

// Subscribe to section focus events
const unsubscribeFocus = eventBus.on('section:focus', (event) => {
  console.log(`Section ${event.sectionId} focused via ${event.trigger}`);

  // Update URL hash
  if (event.trigger === 'click' || event.trigger === 'keyboard') {
    window.location.hash = event.sectionId;
  }

  // Analytics tracking
  trackSectionView(event.sectionId);
});

// Subscribe to performance events
eventBus.on('performance:change', (event) => {
  if (event.threshold === 'critical') {
    // Emergency performance mode
    enableEmergencyMode();
  }

  // Log performance changes
  console.log('Performance changed:', event.metrics);
});

// Emit custom events
eventBus.emit({
  type: 'section:focus',
  sectionId: 'about',
  previousSectionId: null,
  timestamp: Date.now(),
  trigger: 'programmatic'
});
```

## Browser Compatibility Utilities

### `BrowserCapabilityDetector`

Detect browser capabilities and provide fallbacks.

```typescript
class BrowserCapabilityDetector {
  // Feature detection
  static hasWebGL(): boolean;
  static hasWebWorkers(): boolean;
  static hasTouchSupport(): boolean;
  static hasGestureSupport(): boolean;
  static hasPerformanceAPI(): boolean;
  static hasIntersectionObserver(): boolean;
  static hasResizeObserver(): boolean;

  // Performance capabilities
  static estimateDevicePerformance(): 'low' | 'medium' | 'high';
  static getRecommendedQualityLevel(): QualityLevel;
  static hasHardwareAcceleration(): boolean;

  // Browser identification
  static getBrowserInfo(): BrowserInfo;
  static isSupported(): boolean;
  static getUnsupportedFeatures(): string[];

  // Polyfill management
  static loadRequiredPolyfills(): Promise<void>;
  static loadOptionalPolyfills(): Promise<void>;
}

interface BrowserInfo {
  name: string;
  version: number;
  engine: string;
  platform: string;
  mobile: boolean;
  capabilities: BrowserCapabilities;
}

interface BrowserCapabilities {
  webgl: boolean;
  webworkers: boolean;
  touch: boolean;
  gestures: boolean;
  performanceAPI: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  hardwareAcceleration: boolean;
}
```

**Usage Example:**
```typescript
import { BrowserCapabilityDetector } from './utils/BrowserCapabilityDetector';

// Initialize with capability detection
const initializeCanvas = async () => {
  const browserInfo = BrowserCapabilityDetector.getBrowserInfo();
  console.log('Browser:', browserInfo);

  if (!BrowserCapabilityDetector.isSupported()) {
    const unsupported = BrowserCapabilityDetector.getUnsupportedFeatures();
    console.warn('Unsupported features:', unsupported);

    // Load polyfills
    await BrowserCapabilityDetector.loadRequiredPolyfills();
  }

  // Configure based on capabilities
  const config = {
    enableWebGL: BrowserCapabilityDetector.hasWebGL(),
    enableWorkers: BrowserCapabilityDetector.hasWebWorkers(),
    enableTouch: BrowserCapabilityDetector.hasTouchSupport(),
    qualityLevel: BrowserCapabilityDetector.getRecommendedQualityLevel()
  };

  // Initialize canvas with appropriate configuration
  const canvas = new LightboxCanvas(config);
};
```

## Testing Utilities

### `CanvasTestUtils`

Testing utilities for canvas components and interactions.

```typescript
class CanvasTestUtils {
  // Component testing helpers
  static createMockCanvasState(overrides?: Partial<CanvasState>): CanvasState;
  static createMockPerformanceMetrics(overrides?: Partial<PerformanceMetrics>): PerformanceMetrics;
  static createMockSpatialSection(overrides?: Partial<SpatialSection>): SpatialSection;

  // Gesture simulation
  static simulatePanGesture(
    element: HTMLElement,
    from: Point,
    to: Point,
    duration?: number
  ): Promise<void>;

  static simulatePinchGesture(
    element: HTMLElement,
    center: Point,
    scale: number,
    duration?: number
  ): Promise<void>;

  static simulateTapGesture(
    element: HTMLElement,
    position: Point
  ): Promise<void>;

  // Performance testing
  static measureRenderPerformance(
    renderFn: () => void,
    iterations?: number
  ): PerformanceReport;

  static measureMemoryUsage(
    operationFn: () => void
  ): MemoryReport;

  // Accessibility testing
  static validateKeyboardNavigation(element: HTMLElement): AccessibilityReport;
  static validateScreenReaderSupport(element: HTMLElement): AccessibilityReport;
  static validateColorContrast(element: HTMLElement): AccessibilityReport;

  // State validation
  static validateStateTransitions(
    initialState: CanvasState,
    expectedState: CanvasState,
    operations: StateOperation[]
  ): ValidationReport;
}
```

**Usage in Tests:**
```typescript
import { CanvasTestUtils } from './utils/CanvasTestUtils';

describe('Canvas Component', () => {
  it('should handle pan gestures correctly', async () => {
    const canvas = render(<LightboxCanvas {...props} />);
    const canvasElement = canvas.getByTestId('canvas-container');

    // Simulate pan gesture
    await CanvasTestUtils.simulatePanGesture(
      canvasElement,
      { x: 100, y: 100 },
      { x: 200, y: 150 },
      500
    );

    // Verify camera position changed
    expect(getCameraPosition()).toEqual({ x: 100, y: 50 });
  });

  it('should maintain performance under load', () => {
    const performanceReport = CanvasTestUtils.measureRenderPerformance(
      () => {
        // Perform expensive render operation
        renderCanvasWithManyElements();
      },
      100
    );

    expect(performanceReport.averageFrameTime).toBeLessThan(16); // 60fps
    expect(performanceReport.maxFrameTime).toBeLessThan(33); // No frame drops below 30fps
  });
});
```