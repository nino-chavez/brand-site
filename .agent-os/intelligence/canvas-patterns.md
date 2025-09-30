# Canvas Component Patterns

**Purpose:** Encode established canvas patterns for autonomous agent recognition
**Last Updated:** 2025-09-30
**Status:** Active

---

## State Management Patterns

### ✅ CORRECT: UnifiedGameFlowContext Integration

```typescript
// ALWAYS use UnifiedGameFlowContext for canvas state
import { useUnifiedCanvas } from '@/contexts/UnifiedGameFlowContext';

const MyCanvasComponent = () => {
  const { state, actions } = useUnifiedCanvas();

  const handleMovement = useCallback((target: CanvasPosition) => {
    actions.canvas.updateCanvasPosition(target);
  }, [actions]);

  return <div>Canvas content at {state.canvas.position.x}</div>;
};
```

### ❌ INCORRECT: Separate State Systems

```typescript
// NEVER create separate canvas state
const [canvasState, setCanvasState] = useState({
  position: { x: 0, y: 0 },
  scale: 1
});

// This creates state drift and breaks integration
```

**Rule:** ALL canvas state MUST flow through UnifiedGameFlowContext

---

## Performance Optimization Patterns

### ✅ CORRECT: Hardware-Accelerated Transforms

```typescript
// Use translate3d for GPU acceleration
const canvasTransform = useMemo(() => ({
  transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
  willChange: isAnimating ? 'transform' : 'auto'
}), [x, y, scale, isAnimating]);

// Apply to element
<div style={canvasTransform}>Canvas content</div>
```

### ❌ INCORRECT: Non-Accelerated Transforms

```typescript
// NEVER use 2D transforms (no GPU acceleration)
const transform = `translateX(${x}px) translateY(${y}px) scale(${scale})`;

// NEVER use top/left positioning (causes layout thrashing)
const style = { position: 'absolute', top: y, left: x };
```

**Rule:** ALL canvas transforms MUST use translate3d for GPU acceleration

### ✅ CORRECT: RequestAnimationFrame Usage

```typescript
// Use RAF for smooth animations
const animateToPosition = useCallback((target: CanvasPosition) => {
  const startTime = performance.now();
  const startPos = currentPosition;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const eased = easingFunction(progress);
    const newPosition = {
      x: startPos.x + (target.x - startPos.x) * eased,
      y: startPos.y + (target.y - startPos.y) * eased,
      scale: startPos.scale + (target.scale - startPos.scale) * eased
    };

    actions.canvas.updateCanvasPosition(newPosition);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}, [currentPosition, duration, actions]);
```

### ❌ INCORRECT: SetInterval/SetTimeout for Animation

```typescript
// NEVER use setInterval for animations
setInterval(() => {
  currentPosition.x += deltaX;
  updateCanvas(currentPosition);
}, 16); // Doesn't sync with display refresh, causes jank
```

**Rule:** ALL animations MUST use requestAnimationFrame

### ✅ CORRECT: Memoization for Expensive Calculations

```typescript
// Memoize transform calculations
const canvasTransform = useMemo(() => {
  const { x, y, scale } = state.canvas.position;

  return {
    transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
    willChange: state.canvas.isAnimating ? 'transform' : 'auto'
  };
}, [
  state.canvas.position.x,
  state.canvas.position.y,
  state.canvas.position.scale,
  state.canvas.isAnimating
]);
```

**Rule:** Expensive calculations MUST be memoized with proper dependencies

---

## Photography Metaphor Integration

### ✅ CORRECT: Camera Terminology in Naming

```typescript
// Component names use camera terminology
CameraController.tsx
LensActivation.tsx
ShutterTransition.tsx
ExposureSettings.tsx
FocusManager.tsx
ApertureControls.tsx

// Props use photography concepts
interface CameraMovementProps {
  movement: CameraMovement;
  aperture: number;
  shutterSpeed: number;
  iso: number;
  focusPoint: CanvasPosition;
}
```

### ❌ INCORRECT: Generic Naming

```typescript
// AVOID generic names that break metaphor
Navigator.tsx
Scroller.tsx
Zoomer.tsx
Panner.tsx
ViewManager.tsx
```

**Rule:** Component names MUST use photography/camera terminology

### ✅ CORRECT: Photography Easing Curves

```typescript
// Use photography-inspired easing curves
import { photographyEasingCurves } from '@/utils/photographyEasingCurves';

const movement: CameraMovement = {
  type: 'pan-tilt',
  duration: 800,
  easing: photographyEasingCurves.smoothPan, // or .rackFocus, .snapFocus, etc.
  target: newPosition
};
```

### ❌ INCORRECT: Generic Easing

```typescript
// AVOID generic easing (breaks photography metaphor)
const movement = {
  easing: 'ease-in-out' // Too generic
};
```

**Rule:** Animations MUST use photography easing curves from photographyEasingCurves.ts

---

## Canvas Movement Patterns

### ✅ CORRECT: Typed Camera Movements

```typescript
type CameraMovement =
  | 'pan-tilt'      // Horizontal/vertical camera movement
  | 'zoom-in'       // Zoom into content
  | 'zoom-out'      // Zoom out from content
  | 'dolly-zoom'    // Move camera while zooming (Hitchcock effect)
  | 'rack-focus'    // Quick focus change between sections
  | 'match-cut';    // Seamless transition between sections

const moveCamera = (target: CanvasPosition, type: CameraMovement) => {
  const movement = createCameraMovement(type, target);
  actions.canvas.executeMovement(movement);
};
```

**Rule:** Canvas movements MUST use defined CameraMovement types

---

## Integration Patterns

### ✅ CORRECT: CursorLens Integration

```typescript
// CursorLens triggers canvas movements
const handleLensSelection = useCallback((sectionId: string) => {
  const targetPosition = getSectionPosition(sectionId);

  // Trigger camera movement via context
  actions.canvas.moveToSection(sectionId, {
    movement: 'rack-focus',
    duration: 800,
    easing: photographyEasingCurves.rackFocus
  });

  // Update lens state
  actions.lens.setActiveSection(sectionId);
}, [actions]);
```

**Rule:** CursorLens and Canvas MUST coordinate through UnifiedGameFlowContext

---

## Performance Monitoring Patterns

### ✅ CORRECT: Operation Tracking

```typescript
// Track canvas operations for performance monitoring
const performOperation = useCallback(async (operationName: string) => {
  const startTime = performance.now();

  try {
    await doCanvasOperation();
  } finally {
    const duration = performance.now() - startTime;
    performanceMonitor.trackOperation(operationName, duration);

    // Warn if operation exceeds 16.67ms (60fps threshold)
    if (duration > 16.67) {
      console.warn(`Slow canvas operation: ${operationName} took ${duration.toFixed(2)}ms`);
    }
  }
}, [performanceMonitor]);
```

**Rule:** Canvas operations MUST be tracked for performance monitoring

---

## Section Mapping Pattern

### ✅ CORRECT: Section Position Mapping

```typescript
// Sections map to canvas positions with photography metaphor
const SECTION_POSITIONS: Record<string, CanvasPosition> = {
  capture: { x: 400, y: 200, scale: 1 },    // Top-center
  focus: { x: 600, y: 200, scale: 1 },      // Top-right (About)
  frame: { x: 600, y: 400, scale: 1 },      // Right (Skills)
  exposure: { x: 400, y: 400, scale: 1 },   // Center (Experience)
  develop: { x: 200, y: 400, scale: 1 },    // Left (Projects)
  portfolio: { x: 200, y: 200, scale: 1 }   // Top-left (Gallery)
};

// Section names align with photography workflow
```

**Rule:** Sections MUST use photography workflow terminology

---

## Quality Standards

### Performance Requirements

- **60fps maintained:** ALL canvas operations
- **Frame time < 16.67ms:** ALL render operations
- **GPU acceleration:** ALL transforms
- **Memory < 50MB growth:** Per navigation session
- **Bundle < 15KB gzipped:** Per canvas component

### Accessibility Requirements

- **Keyboard navigation:** Tab, Arrow keys, Enter, Escape
- **Screen reader:** Spatial position announcements
- **WCAG AAA:** Color contrast, focus indicators
- **Reduced motion:** Respect prefers-reduced-motion

### Testing Requirements

- **60fps validation:** Performance tests for all movements
- **Touch gestures:** Mobile interaction tests
- **Keyboard nav:** Full keyboard accessibility tests
- **Visual regression:** Screenshot comparison tests

---

## Anti-Patterns to Avoid

### ❌ Direct DOM Manipulation

```typescript
// NEVER manipulate DOM directly
document.getElementById('canvas').style.transform = 'translate3d(...)';
```

**Use:** React state + UnifiedGameFlowContext

### ❌ Nested State Updates

```typescript
// NEVER nest state updates
setState(prev => ({
  ...prev,
  canvas: {
    ...prev.canvas,
    position: { ...prev.canvas.position, x: newX }
  }
}));
```

**Use:** Context actions for flat updates

### ❌ Missing Cleanup

```typescript
// NEVER forget cleanup in effects
useEffect(() => {
  const rafId = requestAnimationFrame(animate);
  // MISSING: return () => cancelAnimationFrame(rafId);
}, []);
```

**Always:** Include cleanup in useEffect

---

## Pattern Recognition Checklist

When implementing canvas features, verify:

- [ ] State managed through UnifiedGameFlowContext
- [ ] Transforms use translate3d for GPU acceleration
- [ ] Animations use requestAnimationFrame (not setInterval)
- [ ] Component names use photography terminology
- [ ] Easing curves from photographyEasingCurves.ts
- [ ] Performance monitoring integrated
- [ ] 60fps maintained (< 16.67ms operations)
- [ ] Accessibility (keyboard + screen reader)
- [ ] Tests include performance validation
- [ ] Proper cleanup in useEffect hooks

---

**This document encodes established patterns for autonomous agent recognition. When implementing canvas features, match these patterns exactly.**