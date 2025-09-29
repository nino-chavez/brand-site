# 2D Canvas Layout System - Usage Guide

## Overview

The 2D Canvas Layout System provides spatial navigation for photographer portfolios with cinematic camera movements and full accessibility support.

## Core Components

### LightboxCanvas (`components/LightboxCanvas.tsx`)

Primary spatial container with hardware-accelerated CSS transforms.

```tsx
import { LightboxCanvas } from '@/components/LightboxCanvas';

<LightboxCanvas
  sections={workflowSections}
  initialPosition={{ x: 0, y: 0, scale: 1 }}
  onPositionChange={(position) => console.log(position)}
/>
```

**Key Features:**
- 2x3 spatial grid layout (6 sections)
- Hardware-accelerated CSS transforms
- Viewport boundary constraints
- Browser compatibility with graceful degradation

### CameraController (`components/CameraController.tsx`)

Orchestrates cinematic movement with 5 camera metaphors.

```tsx
import { CameraController } from '@/components/CameraController';

<CameraController
  targetPosition={{ x: 100, y: 200, scale: 1.2 }}
  movement="pan-tilt"
  duration={800}
  onComplete={() => console.log('Movement complete')}
/>
```

**Camera Metaphors:**
- `pan-tilt`: Primary section navigation
- `zoom-in` / `zoom-out`: Detail level changes
- `dolly-zoom`: Initial engagement effect (single use)
- `rack-focus`: Hover effects with blur/opacity
- `match-cut`: Visual element anchoring

### SpatialSection (`components/SpatialSection.tsx`)

Wraps content for spatial positioning with accessibility support.

```tsx
import { SpatialSection } from '@/components/SpatialSection';

<SpatialSection
  id="hero"
  gridX={1}
  gridY={1}
  scale={1.0}
  isActive={true}
  content={<HeroContent />}
  aria-description="Central hero section with portfolio introduction"
/>
```

## Coordinate System

### Types (`types/canvas.ts`)

```tsx
interface CanvasPosition {
  x: number;        // Horizontal position
  y: number;        // Vertical position
  scale: number;    // Zoom level (0.1 - 3.0)
}

interface SpatialCoordinates {
  gridX: number;    // Grid position X (0-2)
  gridY: number;    // Grid position Y (0-1)
  offsetX?: number; // Fine positioning
  offsetY?: number; // Fine positioning
}
```

### Section Layout

```
Grid Layout (2x3):
[0,0] Hero     [1,0] About      [2,0] Creative
[0,1] Professional [1,1] Thought  [2,1] Contact
```

## Utility Functions

### Coordinate Transforms (`utils/canvasCoordinateTransforms.ts`)

```tsx
import { scrollToCanvas, canvasToScroll } from '@/utils/canvasCoordinateTransforms';

// Convert scroll position to canvas coordinates
const canvasPos = scrollToCanvas({ x: 100, y: 200, scale: 1 });

// Convert canvas position to scroll coordinates
const scrollPos = canvasToScroll({ x: 50, y: 100, scale: 1.5 });
```

### Camera Calculations (`utils/cameraMovementCalculations.ts`)

```tsx
import { calculatePanTiltMovement } from '@/utils/cameraMovementCalculations';

const movement = calculatePanTiltMovement(
  { x: 0, y: 0, scale: 1 },    // from
  { x: 100, y: 200, scale: 1 }, // to
  800                           // duration ms
);
```

## State Management

### UnifiedGameFlowContext Integration

```tsx
import { useUnifiedGameFlow } from '@/contexts/UnifiedGameFlowContext';

const { canvasState, updateCanvasPosition } = useUnifiedGameFlow();

// Update canvas position
updateCanvasPosition({ x: 100, y: 200, scale: 1.2 });

// Track canvas transition
trackCanvasTransition({
  from: { x: 0, y: 0, scale: 1 },
  to: { x: 100, y: 200, scale: 1.2 },
  movement: 'pan-tilt',
  duration: 800
});
```

## Accessibility Integration

### Spatial Navigation Hook (`hooks/useSpatialAccessibility.tsx`)

```tsx
import { useSpatialAccessibility } from '@/hooks/useSpatialAccessibility';

const {
  currentSection,
  navigateDirection,
  zoomCamera,
  announcePosition
} = useSpatialAccessibility();

// Navigate with keyboard
navigateDirection('right'); // WASD keys
zoomCamera('in');          // +/- keys
```

### Keyboard Shortcuts

- **WASD**: Section navigation
- **Arrow Keys**: Camera movement
- **+/-**: Zoom in/out
- **0**: Reset to home
- **H**: Navigate to hero
- **Escape**: Exit canvas mode

## Performance Optimization

### Monitoring (`utils/performanceAnalysis.ts`)

```tsx
import { monitorCanvasPerformance } from '@/utils/performanceAnalysis';

const metrics = monitorCanvasPerformance(() => {
  // Canvas operation
  updateCanvasPosition(newPosition);
});

console.log(`FPS: ${metrics.fps}, Memory: ${metrics.memoryDelta}MB`);
```

### Automatic Quality Degradation

System automatically reduces quality below 45fps:
- Disables CSS filters
- Reduces animation complexity
- Optimizes transform calculations

## Mobile Touch Support

### Gesture Recognition

- **Pinch-to-zoom**: Scale limits 0.1 - 3.0
- **Two-finger pan**: Canvas movement
- **Long press**: CursorLens activation
- **44px minimum touch targets**

## Browser Compatibility

### Progressive Enhancement

```tsx
// Automatic fallbacks:
// - translate3d → translate (older browsers)
// - CSS filters → opacity (performance)
// - backdrop-filter → background (Safari)
// - WebKit prefixes for Safari
```

### Device Adaptation

```tsx
// Performance settings adapt based on:
// - WebGL availability
// - Memory limits
// - Frame rate capability
// - Touch support detection
```

## Error Handling

### Canvas System Failures

```tsx
import { handleCanvasError } from '@/utils/canvasErrorHandling';

try {
  updateCanvasPosition(position);
} catch (error) {
  handleCanvasError(error, 'position_update');
  // Automatically falls back to scroll navigation
}
```

## Testing

### Test Coverage

- Unit tests: `test/canvas-coordinate-transforms.test.ts` (22/22 passing)
- Integration: `test/canvas-system-integration.test.tsx`
- Performance: `test/canvas-performance-validation.test.tsx`
- Accessibility: `test/canvas-accessibility-enhancement.test.tsx`
- Cross-browser: `test/canvas-cross-browser-compatibility.test.tsx`

### Running Tests

```bash
# All canvas tests
npm test -- --run test/canvas*

# Specific test suites
npm test -- --run test/canvas-coordinate-transforms.test.ts
npm test -- --run test/canvas-performance-validation.test.tsx
```

## Production Deployment

### Bundle Optimization

Canvas components are automatically code-split:
- `canvas-system` chunk: Components
- `canvas-utils` chunk: Utilities

### Performance Targets

- **60fps**: Desktop navigation
- **30fps**: Mobile navigation
- **800ms**: Maximum transition time
- **<20MB**: Memory increase limit

## Troubleshooting

### Common Issues

1. **Low FPS**: Check performance monitoring, disable animations
2. **Touch not working**: Verify 44px touch targets, check pointer events
3. **Coordinate drift**: Validate transform calculations, check boundary constraints
4. **Accessibility issues**: Test keyboard navigation, verify ARIA labels

### Debug Mode

```tsx
// Enable debug logging
localStorage.setItem('CANVAS_DEBUG', 'true');

// Performance monitoring
localStorage.setItem('CANVAS_PERF_MONITOR', 'true');
```

## Future Enhancements

- **VR/AR Support**: WebXR integration
- **Multi-canvas**: Parallel section viewing
- **Advanced Effects**: Particle systems, 3D transforms
- **AI Navigation**: Smart section recommendations

---

*Generated as part of Task 15 - Production Readiness and Documentation*