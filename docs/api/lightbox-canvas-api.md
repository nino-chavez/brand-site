# LightboxCanvas API Documentation

## Overview

The LightboxCanvas system provides a photography-inspired spatial navigation interface for portfolio content. The system consists of extracted, focused components that work together to create a seamless 2D spatial navigation experience.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     LightboxCanvas                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Component Architecture                   │ │
│  │                                                         │ │
│  │  TouchGestureHandler → AnimationController              │ │
│  │         ↓                     ↓                         │ │
│  │  AccessibilityController ← PerformanceRenderer          │ │
│  │         ↓                     ↓                         │ │
│  │  ProgressiveContentRenderer ← CanvasStateProvider       │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### LightboxCanvas

The main container component that orchestrates the spatial navigation experience.

#### Props Interface

```typescript
interface LightboxCanvasProps {
  /** Portfolio sections to display in the 2x3 grid */
  sections: SpatialSection[];

  /** Initial camera position and zoom level */
  initialPosition?: {
    x: number;
    y: number;
    zoom: number;
  };

  /** Canvas dimensions (defaults to viewport size) */
  dimensions?: {
    width: number;
    height: number;
  };

  /** Performance monitoring configuration */
  performanceConfig?: {
    targetFPS: number;
    memoryLimit: number;
    enableMonitoring: boolean;
  };

  /** Accessibility configuration */
  accessibilityConfig?: {
    enableKeyboardNavigation: boolean;
    enableScreenReaderSupport: boolean;
    announceTransitions: boolean;
  };

  /** Photography metaphor settings */
  photographyConfig?: {
    enableEffects: boolean;
    cinematicTransitions: boolean;
    cameraMovementPresets: CameraMovementPreset[];
  };

  /** Callbacks for interaction events */
  onSectionFocus?: (sectionId: string) => void;
  onTransitionStart?: (from: string, to: string) => void;
  onTransitionComplete?: (sectionId: string) => void;
  onPerformanceWarning?: (metrics: PerformanceMetrics) => void;
}
```

#### Basic Usage

```tsx
import { LightboxCanvas } from './components/LightboxCanvas';

function Portfolio() {
  const sections = [
    { id: 'about', title: 'About', row: 0, col: 0 },
    { id: 'experience', title: 'Experience', row: 0, col: 1 },
    { id: 'skills', title: 'Skills', row: 0, col: 2 },
    { id: 'projects', title: 'Projects', row: 1, col: 0 },
    { id: 'photography', title: 'Photography', row: 1, col: 1 },
    { id: 'contact', title: 'Contact', row: 1, col: 2 }
  ];

  return (
    <LightboxCanvas
      sections={sections}
      initialPosition={{ x: 0, y: 0, zoom: 1 }}
      performanceConfig={{
        targetFPS: 60,
        memoryLimit: 50,
        enableMonitoring: true
      }}
      accessibilityConfig={{
        enableKeyboardNavigation: true,
        enableScreenReaderSupport: true,
        announceTransitions: true
      }}
      onSectionFocus={(sectionId) => {
        console.log(`Focused on section: ${sectionId}`);
      }}
    />
  );
}
```

#### Advanced Usage with Photography Metaphor

```tsx
import { LightboxCanvas, CameraMovementPreset } from './components/LightboxCanvas';

function PhotographyPortfolio() {
  const cameraPresets: CameraMovementPreset[] = [
    {
      name: 'portraitLens',
      focalLength: 85,
      aperture: 1.8,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      duration: 800
    },
    {
      name: 'landscapeLens',
      focalLength: 24,
      aperture: 8,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      duration: 1200
    }
  ];

  return (
    <LightboxCanvas
      sections={sections}
      photographyConfig={{
        enableEffects: true,
        cinematicTransitions: true,
        cameraMovementPresets: cameraPresets
      }}
      onTransitionStart={(from, to) => {
        console.log(`Camera transitioning from ${from} to ${to}`);
      }}
      onPerformanceWarning={(metrics) => {
        if (metrics.fps < 45) {
          // Gracefully degrade effects
          console.warn('Performance degraded, reducing effects');
        }
      }}
    />
  );
}
```

### TouchGestureHandler

Handles all touch and gesture interactions with photography-inspired feedback.

#### Props Interface

```typescript
interface TouchGestureHandlerProps {
  /** Element to attach gesture listeners to */
  targetElement: HTMLElement;

  /** Gesture configuration */
  gestureConfig?: {
    enablePan: boolean;
    enablePinchZoom: boolean;
    enableTap: boolean;
    sensitivity: number;
  };

  /** Callbacks for gesture events */
  onPanStart?: (event: PanEvent) => void;
  onPanMove?: (event: PanEvent) => void;
  onPanEnd?: (event: PanEvent) => void;
  onPinchStart?: (event: PinchEvent) => void;
  onPinchMove?: (event: PinchEvent) => void;
  onPinchEnd?: (event: PinchEvent) => void;
  onTap?: (event: TapEvent) => void;

  /** Performance optimization */
  performanceMode?: 'high' | 'medium' | 'low';
}
```

#### Usage Example

```tsx
import { TouchGestureHandler } from './components/TouchGestureHandler';

function GestureExample() {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div ref={canvasRef} className="canvas-container">
        {/* Canvas content */}
      </div>

      <TouchGestureHandler
        targetElement={canvasRef.current}
        gestureConfig={{
          enablePan: true,
          enablePinchZoom: true,
          enableTap: true,
          sensitivity: 1.0
        }}
        onPanMove={(event) => {
          // Handle camera panning
          updateCameraPosition(event.deltaX, event.deltaY);
        }}
        onPinchMove={(event) => {
          // Handle zoom
          updateCameraZoom(event.scale);
        }}
        performanceMode="high"
      />
    </div>
  );
}
```

### AnimationController

Manages all camera movement animations with photography-inspired easing curves.

#### Props Interface

```typescript
interface AnimationControllerProps {
  /** Current camera state */
  cameraState: CameraState;

  /** Animation configuration */
  animationConfig?: {
    enableAnimations: boolean;
    defaultDuration: number;
    easingPresets: EasingPresetMap;
  };

  /** Callbacks for animation lifecycle */
  onAnimationStart?: (animation: AnimationDescriptor) => void;
  onAnimationUpdate?: (progress: number, state: CameraState) => void;
  onAnimationComplete?: (finalState: CameraState) => void;

  /** Performance constraints */
  performanceConstraints?: {
    maxConcurrentAnimations: number;
    frameRateTarget: number;
    degradeOnLowPerformance: boolean;
  };
}
```

#### Animation Types

```typescript
type CameraMovement =
  | 'pan'     // Horizontal/vertical camera movement
  | 'tilt'    // Vertical camera angle adjustment
  | 'zoom'    // Lens zoom in/out
  | 'dolly'   // Camera position movement
  | 'rackFocus'; // Focus transition between elements

interface AnimationDescriptor {
  type: CameraMovement;
  from: CameraState;
  to: CameraState;
  duration: number;
  easing: EasingFunction;
  photographyMetadata?: {
    lensType: 'portrait' | 'landscape' | 'macro' | 'telephoto';
    focalLength: number;
    aperture: number;
  };
}
```

#### Usage Example

```tsx
import { AnimationController, CameraMovement } from './components/AnimationController';

function AnimationExample() {
  const [cameraState, setCameraState] = useState({
    position: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0
  });

  const animateToSection = (sectionId: string) => {
    const targetPosition = getSectionPosition(sectionId);

    animationController.animate({
      type: 'dolly',
      from: cameraState,
      to: {
        position: targetPosition,
        zoom: 1.2,
        rotation: 0
      },
      duration: 800,
      easing: 'cinematicDolly',
      photographyMetadata: {
        lensType: 'portrait',
        focalLength: 85,
        aperture: 2.8
      }
    });
  };

  return (
    <AnimationController
      cameraState={cameraState}
      animationConfig={{
        enableAnimations: true,
        defaultDuration: 600,
        easingPresets: {
          cinematicPan: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          cinematicZoom: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          cinematicDolly: 'cubic-bezier(0.23, 1, 0.32, 1)'
        }
      }}
      onAnimationUpdate={(progress, state) => {
        setCameraState(state);
      }}
      performanceConstraints={{
        maxConcurrentAnimations: 3,
        frameRateTarget: 60,
        degradeOnLowPerformance: true
      }}
    />
  );
}
```

### AccessibilityController

Provides comprehensive accessibility support for spatial navigation.

#### Props Interface

```typescript
interface AccessibilityControllerProps {
  /** Current focused section */
  focusedSection: string | null;

  /** Available sections for navigation */
  sections: SpatialSection[];

  /** Accessibility configuration */
  accessibilityConfig: {
    enableKeyboardNavigation: boolean;
    enableScreenReaderSupport: boolean;
    enableSpatialAnnouncements: boolean;
    keyboardShortcuts: KeyboardShortcutMap;
  };

  /** Callbacks for accessibility events */
  onKeyboardNavigation?: (direction: NavigationDirection) => void;
  onSectionAnnouncement?: (sectionId: string, context: string) => void;
  onAccessibilityModeChange?: (mode: AccessibilityMode) => void;
}
```

#### Navigation Directions

```typescript
type NavigationDirection =
  | 'up' | 'down' | 'left' | 'right'
  | 'first' | 'last'
  | 'previous' | 'next';

interface KeyboardShortcutMap {
  navigate: {
    up: string[];
    down: string[];
    left: string[];
    right: string[];
  };
  actions: {
    activate: string[];
    escape: string[];
    home: string[];
  };
  photography: {
    focus: string[];
    zoom: string[];
    pan: string[];
  };
}
```

#### Usage Example

```tsx
import { AccessibilityController } from './components/AccessibilityController';

function AccessibilityExample() {
  const keyboardShortcuts = {
    navigate: {
      up: ['ArrowUp', 'w'],
      down: ['ArrowDown', 's'],
      left: ['ArrowLeft', 'a'],
      right: ['ArrowRight', 'd']
    },
    actions: {
      activate: ['Enter', 'Space'],
      escape: ['Escape'],
      home: ['Home']
    },
    photography: {
      focus: ['f'],
      zoom: ['z'],
      pan: ['p']
    }
  };

  return (
    <AccessibilityController
      focusedSection={currentSection}
      sections={allSections}
      accessibilityConfig={{
        enableKeyboardNavigation: true,
        enableScreenReaderSupport: true,
        enableSpatialAnnouncements: true,
        keyboardShortcuts
      }}
      onKeyboardNavigation={(direction) => {
        const newSection = calculateNextSection(currentSection, direction);
        navigateToSection(newSection);
      }}
      onSectionAnnouncement={(sectionId, context) => {
        announceToScreenReader(
          `Focused on ${sectionId} section. ${context}. Position ${getSectionPosition(sectionId)}.`
        );
      }}
    />
  );
}
```

### PerformanceRenderer

Handles performance monitoring and adaptive rendering with debug capabilities.

#### Props Interface

```typescript
interface PerformanceRendererProps {
  /** Performance monitoring configuration */
  monitoringConfig: {
    targetFPS: number;
    memoryLimit: number;
    enableContinuousMonitoring: boolean;
    sampleInterval: number;
  };

  /** Debug visualization settings */
  debugConfig?: {
    showFPSCounter: boolean;
    showMemoryUsage: boolean;
    showPerformanceGraph: boolean;
    showRenderMetrics: boolean;
  };

  /** Performance callbacks */
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  onPerformanceDegradation?: (level: PerformanceDegradationLevel) => void;

  /** Adaptive rendering controls */
  adaptiveConfig?: {
    enableAdaptiveQuality: boolean;
    qualityLevels: QualityLevel[];
    degradationThresholds: PerformanceThresholds;
  };
}
```

#### Performance Metrics

```typescript
interface PerformanceMetrics {
  fps: {
    current: number;
    average: number;
    min: number;
    max: number;
  };
  memory: {
    used: number;
    total: number;
    peak: number;
  };
  rendering: {
    frameTime: number;
    drawCalls: number;
    triangles: number;
  };
  timing: {
    scriptTime: number;
    renderTime: number;
    idleTime: number;
  };
}

type PerformanceDegradationLevel = 'none' | 'minor' | 'moderate' | 'severe' | 'critical';

interface QualityLevel {
  name: string;
  animationComplexity: number;
  effectsEnabled: boolean;
  renderScale: number;
  updateFrequency: number;
}
```

#### Usage Example

```tsx
import { PerformanceRenderer } from './components/PerformanceRenderer';

function PerformanceExample() {
  const [currentQuality, setCurrentQuality] = useState('high');

  const qualityLevels = [
    {
      name: 'high',
      animationComplexity: 1.0,
      effectsEnabled: true,
      renderScale: 1.0,
      updateFrequency: 60
    },
    {
      name: 'medium',
      animationComplexity: 0.7,
      effectsEnabled: true,
      renderScale: 0.8,
      updateFrequency: 45
    },
    {
      name: 'low',
      animationComplexity: 0.3,
      effectsEnabled: false,
      renderScale: 0.6,
      updateFrequency: 30
    }
  ];

  return (
    <PerformanceRenderer
      monitoringConfig={{
        targetFPS: 60,
        memoryLimit: 50,
        enableContinuousMonitoring: true,
        sampleInterval: 100
      }}
      debugConfig={{
        showFPSCounter: true,
        showMemoryUsage: true,
        showPerformanceGraph: false,
        showRenderMetrics: false
      }}
      onPerformanceUpdate={(metrics) => {
        console.log(`FPS: ${metrics.fps.current}, Memory: ${metrics.memory.used}MB`);
      }}
      onPerformanceDegradation={(level) => {
        if (level === 'moderate' && currentQuality === 'high') {
          setCurrentQuality('medium');
        } else if (level === 'severe' && currentQuality !== 'low') {
          setCurrentQuality('low');
        }
      }}
      adaptiveConfig={{
        enableAdaptiveQuality: true,
        qualityLevels,
        degradationThresholds: {
          minor: { fps: 55, memory: 40 },
          moderate: { fps: 45, memory: 50 },
          severe: { fps: 30, memory: 60 }
        }
      }}
    />
  );
}
```

## TypeScript Interfaces

### Core Types

```typescript
// Spatial positioning
interface SpatialPosition {
  x: number;
  y: number;
}

interface SpatialSection {
  id: string;
  title: string;
  row: number;
  col: number;
  content?: SectionContent;
}

interface SectionContent {
  type: 'preview' | 'summary' | 'detail' | 'full';
  data: {
    title: string;
    description?: string;
    images?: string[];
    interactive?: boolean;
  };
}

// Camera system
interface CameraState {
  position: SpatialPosition;
  zoom: number;
  rotation: number;
  focus?: string; // focused section ID
}

interface CameraMovementPreset {
  name: string;
  focalLength: number;
  aperture: number;
  easing: string;
  duration: number;
}

// Gesture events
interface PanEvent {
  type: 'pan';
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  phase: 'start' | 'move' | 'end';
}

interface PinchEvent {
  type: 'pinch';
  scale: number;
  deltaScale: number;
  center: SpatialPosition;
  phase: 'start' | 'move' | 'end';
}

interface TapEvent {
  type: 'tap';
  position: SpatialPosition;
  target: HTMLElement;
  sectionId?: string;
}

// Performance monitoring
interface PerformanceThresholds {
  minor: { fps: number; memory: number };
  moderate: { fps: number; memory: number };
  severe: { fps: number; memory: number };
}

// Photography metaphor
interface PhotoMetadata {
  lensType: 'portrait' | 'landscape' | 'macro' | 'telephoto' | 'wide';
  focalLength: number;
  aperture: number;
  shutterSpeed: number;
  iso: number;
}
```

### Event Handler Types

```typescript
// Component event handlers
type SectionFocusHandler = (sectionId: string) => void;
type TransitionHandler = (from: string, to: string) => void;
type PerformanceWarningHandler = (metrics: PerformanceMetrics) => void;
type GestureHandler = (event: GestureEvent) => void;
type NavigationHandler = (direction: NavigationDirection) => void;

// Gesture event union
type GestureEvent = PanEvent | PinchEvent | TapEvent;

// Animation completion callback
type AnimationCompleteHandler = (
  finalState: CameraState,
  animation: AnimationDescriptor
) => void;

// Accessibility announcement callback
type AnnouncementHandler = (
  message: string,
  priority: 'polite' | 'assertive'
) => void;
```

## Integration Patterns

### State Management Integration

```typescript
// Integration with UnifiedGameFlowContext
interface CanvasStateIntegration {
  // Canvas-specific state
  canvasState: {
    currentSection: string | null;
    cameraPosition: CameraState;
    performanceMode: 'high' | 'medium' | 'low';
    accessibilityMode: boolean;
  };

  // Global state synchronization
  syncWithGlobalState: (globalState: GlobalAppState) => void;
  updateGlobalFromCanvas: (canvasChanges: Partial<CanvasState>) => void;

  // State conflict resolution
  resolveStateConflicts: (
    canvasState: CanvasState,
    globalState: GlobalAppState
  ) => ResolvedState;
}
```

### Performance Integration

```typescript
// Performance monitoring integration
interface PerformanceIntegration {
  // Monitoring lifecycle
  startMonitoring: () => MonitoringSession;
  stopMonitoring: (session: MonitoringSession) => PerformanceReport;

  // Adaptive quality management
  adaptQualityBasedOnPerformance: (metrics: PerformanceMetrics) => QualityLevel;

  // Performance event handling
  onPerformanceChange: (handler: PerformanceChangeHandler) => void;

  // Integration with global performance monitoring
  reportToGlobalMonitoring: (metrics: PerformanceMetrics) => void;
}
```

### Accessibility Integration

```typescript
// Accessibility system integration
interface AccessibilityIntegration {
  // Screen reader integration
  announceNavigation: (from: string, to: string, context: string) => void;
  announceStateChange: (change: StateChange, impact: string) => void;

  // Keyboard navigation integration
  registerGlobalKeyboardHandlers: () => void;
  unregisterGlobalKeyboardHandlers: () => void;

  // Focus management
  manageFocusTransitions: (transition: FocusTransition) => void;

  // Integration with global accessibility state
  syncAccessibilityMode: (globalA11yState: AccessibilityState) => void;
}
```

## Error Handling

### Error Types

```typescript
interface CanvasError extends Error {
  code: CanvasErrorCode;
  component: string;
  context: ErrorContext;
  recovery?: RecoveryStrategy;
}

type CanvasErrorCode =
  | 'GESTURE_HANDLER_FAILED'
  | 'ANIMATION_INTERRUPTED'
  | 'PERFORMANCE_CRITICAL'
  | 'ACCESSIBILITY_VIOLATION'
  | 'STATE_SYNC_FAILED'
  | 'COORDINATE_TRANSFORM_FAILED';

interface ErrorContext {
  userAgent: string;
  viewport: { width: number; height: number };
  performance: PerformanceMetrics;
  state: Partial<CanvasState>;
}

interface RecoveryStrategy {
  fallback: () => void;
  retry: () => Promise<void>;
  reportError: (error: CanvasError) => void;
}
```

### Error Boundary Integration

```tsx
import { CanvasErrorBoundary } from './components/CanvasErrorBoundary';

function App() {
  return (
    <CanvasErrorBoundary
      fallback={SimplifiedNavigationFallback}
      onError={(error, errorInfo) => {
        console.error('Canvas error:', error);
        reportErrorToMonitoring(error, errorInfo);
      }}
      recovery={{
        enableAutoRecovery: true,
        maxRetries: 3,
        fallbackMode: 'simplified'
      }}
    >
      <LightboxCanvas {...canvasProps} />
    </CanvasErrorBoundary>
  );
}
```

## Performance Guidelines

### Memory Management

```typescript
// Memory-efficient component usage
const optimizedCanvasProps = {
  performanceConfig: {
    targetFPS: 60,
    memoryLimit: 50, // MB
    enableMonitoring: true
  },
  // Minimize object creation in hot paths
  onSectionFocus: useCallback((sectionId: string) => {
    // Handle focus change
  }, []),
  // Use stable references for complex objects
  photographyConfig: useMemo(() => ({
    enableEffects: true,
    cameraMovementPresets: staticPresets
  }), [])
};
```

### Performance Monitoring

```typescript
// Performance monitoring best practices
const performanceSetup = {
  // Monitor key metrics
  metrics: ['fps', 'memory', 'renderTime', 'interactionLatency'],

  // Set appropriate thresholds
  thresholds: {
    fps: { warning: 45, critical: 30 },
    memory: { warning: 40, critical: 50 }, // MB
    renderTime: { warning: 20, critical: 33 } // ms
  },

  // Configure adaptive behavior
  adaptiveConfig: {
    enableDegradation: true,
    degradationSteps: ['effects', 'animations', 'interactions'],
    recoveryDelay: 5000 // ms
  }
};
```

## Browser Compatibility

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Feature Detection

```typescript
// Browser capability detection
const browserSupport = {
  webgl: !!window.WebGLRenderingContext,
  webworkers: typeof Worker !== 'undefined',
  touch: 'ontouchstart' in window,
  gestures: 'ongesturestart' in window,
  performanceAPI: 'performance' in window && 'memory' in performance
};

// Conditional feature loading
if (browserSupport.webgl) {
  enableHardwareAcceleration();
}

if (!browserSupport.touch) {
  enableButtonNavigation();
}
```

### Polyfills

```typescript
// Required polyfills for older browsers
const polyfills = [
  'core-js/stable',
  'regenerator-runtime/runtime',
  'intersection-observer',
  'resize-observer-polyfill'
];
```