# Split-Screen Component Integration Documentation

**Version:** 1.0.0
**Phase:** 5 - Validated Split-Screen & Depth-of-Field Storytelling
**Created:** 2025-09-26

## Overview

This document outlines the integration points and patterns for the Phase 5 split-screen storytelling components. The architecture follows established patterns from existing components while introducing new capabilities for technical + athletic content pairing.

## Component Architecture

### Core Components

```
components/split-screen/
├── SplitScreenLayout.tsx      # Main layout component with CSS Grid
├── DepthOfFieldEffect.tsx     # Visual depth effects component
├── index.ts                   # Centralized exports
└── INTEGRATION.md             # This documentation

hooks/
└── useSynchronizedAnimation.tsx # RAF-based animation coordination
```

### Component Hierarchy

```
SplitScreenLayout
├── Panel (Left) - Technical Content
├── Panel (Right) - Athletic Content
├── DepthOfFieldEffect (Optional)
└── SynchronizedAnimation (via hook)
```

## Integration Points

### 1. PhotoSequenceDisplay Integration

**Location:** `components/PhotoSequenceDisplay.tsx`

**Integration Pattern:**
```typescript
import { SplitScreenLayout, useSynchronizedAnimation } from '../split-screen';

// Add split-screen mode to existing camera modes
type CameraMode = 'burst' | 'focus' | 'manual' | 'auto' | 'split';

// Extend PhotoSequenceState interface
interface PhotoSequenceState {
  // ... existing properties
  splitScreenConfig?: SplitScreenLayoutConfig;
  splitScreenActive: boolean;
}
```

**Implementation Notes:**
- Add split-screen mode to camera mode switching
- Maintain existing burst-mode layout compatibility
- Preserve performance optimization patterns
- Use existing athletic design tokens

### 2. ViewfinderInterface Integration

**Location:** `components/ViewfinderInterface.tsx`

**Integration Pattern:**
```typescript
// Add split-screen section to camera workflow
const cameraWorkflow = [
  // ... existing sections
  {
    id: 'split-screen' as GameFlowSection,
    label: 'Split View',
    description: 'Technical + Athletic Storytelling',
    cameraMetaphor: 'Split Focus Mode',
    icon: '⚏', // Split screen icon
  }
];
```

**Implementation Notes:**
- Integrate with existing 600x400px viewfinder frame
- Add split-screen controls to camera HUD
- Maintain authentic camera interface aesthetic
- Preserve keyboard navigation patterns

### 3. UnifiedGameFlowContext Integration

**Location:** `contexts/UnifiedGameFlowContext.tsx`

**Integration Pattern:**
```typescript
// Extend UnifiedGameFlowState interface
interface UnifiedGameFlowState {
  // ... existing properties
  splitScreen: {
    isActive: boolean;
    config: SplitScreenLayoutConfig;
    animationState: SynchronizedAnimationState;
  };
}

// Add split-screen actions
interface UnifiedGameFlowActions {
  // ... existing actions
  activateSplitScreen: (config: SplitScreenLayoutConfig) => void;
  deactivateSplitScreen: () => void;
  updateSplitScreenConfig: (config: Partial<SplitScreenLayoutConfig>) => void;
}
```

**Implementation Notes:**
- Follow existing state management patterns
- Integrate with performance monitoring system
- Maintain state persistence across navigation
- Use existing error handling framework

### 4. Athletic Design Token Integration

**Usage Pattern:**
```typescript
import {
  splitScreenTiming,
  splitScreenSpacing,
  getTimingMs,
  calculateStaggerDelay
} from '../../tokens/split-screen';

// Component styling with tokens
const styles = {
  transition: `all ${getTimingMs('split-activate')} ${splitScreenEasing['split-reveal']}`,
  gap: splitScreenSpacing['grid-gap'],
  padding: splitScreenSpacing['panel-padding'],
};

// Animation timing with stagger
const staggerDelay = calculateStaggerDelay(index, splitScreenTiming['stagger-base']);
```

## State Management Patterns

### 1. Component State Pattern

Following existing PhotoSequenceDisplay patterns:

```typescript
interface SplitScreenComponentState {
  // UI state
  isActive: boolean;
  focusedPanel: 'left' | 'right' | null;

  // Animation state
  animationProgress: number;
  currentStep: number;

  // Performance state
  frameRate: number;
  memoryUsage: number;

  // Error state
  error: SplitScreenError | null;
}
```

### 2. Hook State Pattern

Following existing performance hooks:

```typescript
// Similar to usePerformanceOptimizer pattern
const splitScreenState = useSynchronizedAnimation({
  duration: splitScreenTiming['panel-transition'],
  staggerDelay: splitScreenTiming['sync-delay'],
  // ... configuration
});
```

## Performance Integration

### 1. Existing Performance Monitoring

**Integration with:**
- `usePerformanceOptimizer` hook
- `useMemoryOptimizer` hook
- Core Web Vitals tracking
- Real-time frame rate monitoring

**Pattern:**
```typescript
const {
  monitorPerformance,
  optimizeForDevice
} = usePerformanceOptimizer();

// Monitor split-screen performance impact
useEffect(() => {
  monitorPerformance('split-screen-activation', () => {
    // Split-screen activation logic
  });
}, [monitorPerformance]);
```

### 2. Performance Budget Integration

Following existing 60fps and <75KB bundle targets:

- **Animation Budget:** Maximum 16ms frame budget
- **Memory Budget:** Monitor heap usage during transitions
- **Bundle Budget:** Lazy load split-screen components if needed
- **CPU Budget:** Use RAF throttling for complex animations

## Accessibility Integration

### 1. Existing Accessibility Patterns

Following established WCAG AAA compliance:

```typescript
// ARIA integration pattern
<div
  role="region"
  aria-label="Split-screen storytelling interface"
  aria-describedby="split-screen-description"
  aria-live="polite"
>
  <div aria-label={config.panels.left.ariaLabel}>
    {leftContent}
  </div>
  <div aria-label={config.panels.right.ariaLabel}>
    {rightContent}
  </div>
</div>
```

### 2. Keyboard Navigation Integration

Following existing ViewfinderInterface patterns:

- **Arrow Keys:** Navigate between panels
- **Enter/Space:** Activate focused panel
- **Escape:** Disable animations immediately
- **Tab:** Standard focus management

### 3. Reduced Motion Integration

Following existing `prefers-reduced-motion` patterns:

```typescript
// Detect and respect motion preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationConfig = {
  duration: prefersReducedMotion
    ? splitScreenAccessibility['reduced-motion-duration']
    : splitScreenTiming['panel-transition'],
  // ... other config
};
```

## Testing Integration

### 1. Existing Test Patterns

Following established test structure (50+ test files):

```typescript
// Unit tests - similar to burst-mode-layout.test.tsx
describe('SplitScreenLayout', () => {
  it('renders 50/50 grid layout correctly', () => {});
  it('handles responsive breakpoints', () => {});
  it('maintains accessibility compliance', () => {});
});

// Integration tests - similar to photo-sequence-integration.test.tsx
describe('SplitScreenIntegration', () => {
  it('integrates with PhotoSequenceDisplay', () => {});
  it('coordinates with ViewfinderInterface', () => {});
  it('maintains performance targets', () => {});
});
```

### 2. Performance Test Integration

Following existing performance test patterns:

```typescript
// Performance monitoring during tests
expect(frameRate).toBeGreaterThanOrEqual(45); // Degradation threshold
expect(animationDuration).toBeLessThanOrEqual(300); // US3 requirement
expect(bundleSize).toBeLessThan(75 * 1024); // Bundle size target
```

## Error Handling Integration

### 1. Existing Error Patterns

Following UnifiedGameFlowContext error handling:

```typescript
interface SplitScreenError {
  code: 'ANIMATION_FAILED' | 'LAYOUT_ERROR' | 'ACCESSIBILITY_VIOLATION' | 'PERFORMANCE_DEGRADED';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recovery: {
    canRetry: boolean;
    fallbackAvailable: boolean;
    userActionRequired: boolean;
  };
}
```

### 2. Graceful Degradation

Following existing performance degradation patterns:

- **Animation Failure:** Fall back to static layout
- **Performance Issues:** Reduce animation complexity
- **Browser Incompatibility:** Use opacity-based fallbacks
- **Accessibility Issues:** Provide alternative navigation

## Migration Strategy

### Phase 1: Foundation (Current)
- ✅ Component shells created
- ✅ Integration points identified
- ✅ State management patterns established

### Phase 2: Core Implementation
- Implement SplitScreenLayout CSS Grid system
- Implement useSynchronizedAnimation RAF coordination
- Implement DepthOfFieldEffect blur system
- Add PhotoSequenceDisplay integration

### Phase 3: Integration & Testing
- ViewfinderInterface integration
- UnifiedGameFlowContext updates
- Comprehensive testing suite
- Performance optimization

### Phase 4: Production Readiness
- Cross-browser compatibility
- Accessibility audit compliance
- Performance profiling
- Documentation completion

## Usage Examples

### Basic Split-Screen Layout

```typescript
import { SplitScreenLayout } from '../split-screen';

<SplitScreenLayout
  config={{
    orientation: 'horizontal',
    ratio: 0.5,
    gap: splitScreenSpacing['grid-gap'],
    responsive: {
      mobile: 'stack',
      tablet: 'maintain',
      desktop: 'maintain',
    },
    panels: {
      left: { contentType: 'technical', ariaLabel: 'Technical diagram' },
      right: { contentType: 'athletic', ariaLabel: 'Action sports photo' },
    },
  }}
  animationConfig={animationConfig}
  leftContent={<TechnicalDiagram />}
  rightContent={<AthleticPhoto />}
/>
```

### Integration with PhotoSequenceDisplay

```typescript
// In PhotoSequenceDisplay component
const [cameraMode, setCameraMode] = useState<CameraMode>('burst');

const handleSplitScreenActivation = () => {
  setCameraMode('split');
  // Trigger split-screen layout
};
```

This integration documentation provides the foundation for implementing the split-screen storytelling system while maintaining consistency with existing architectural patterns and performance requirements.