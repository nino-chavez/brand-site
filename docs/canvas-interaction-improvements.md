# Canvas Interaction Improvements Specification

## Problem Statement

Canvas layout has fundamental UX conflicts preventing delightful interaction:

1. **Text Selection Conflict**: Global `user-select: none` prevents selecting text (93 interactive elements affected)
2. **Accidental Panning**: Any mouse movement triggers pan, competing with clicks/text selection
3. **No Momentum**: Panning feels "dead" compared to Figma/Miro (no inertia/momentum)
4. **Sticky Interactions**: Button clicks sometimes trigger unwanted panning
5. **Performance**: RAF scheduler not optimized for consistent 60fps

## Industry Best Practices (Figma/Miro/Lucidchart)

### 1. Drag Threshold
- **Standard**: 5-10 pixels before activating pan mode
- **Purpose**: Distinguish clicks from drags, allow text selection
- **Implementation**: Track accumulated distance from mousedown

### 2. Selective Text Selection
- **Default**: `user-select: auto` (text selectable)
- **During Drag**: `user-select: none` (after exceeding threshold)
- **After Release**: Restore `user-select: auto`

### 3. Momentum/Inertia
- **Velocity Tracking**: Calculate from last few mouse movements
- **Decay**: Exponential (0.92-0.95 coefficient typical)
- **RAF Animation**: Continue panning after mouseup with decaying velocity
- **Min Threshold**: Stop when velocity < 0.5 pixels/frame

### 4. Interactive Element Detection
- Already implemented via `closest('button, a, input, textarea, select, [role="button"]')`
- Prevents pan start on interactive elements

### 5. Performance Optimization
- Throttle pan updates to requestAnimationFrame
- Use CSS transforms (translate3d for GPU acceleration)
- Minimize re-renders during drag

## Proposed Implementation

### Phase 1: Drag Threshold + Text Selection (Priority: Critical)

```typescript
// Constants
const DRAG_THRESHOLD = 5; // pixels - industry standard

// State additions
const mouseInitialStart = useRef<{ x: number; y: number } | null>(null);
const accumulatedDistance = useRef<number>(0);
const hasExceededThreshold = useRef<boolean>(false);

// Modified handleMouseMove
const handleMouseMove = useCallback((e: MouseEvent) => {
  if (!mouseInitialStart.current) return;

  const currentX = e.clientX;
  const currentY = e.clientY;

  // Calculate distance from initial mousedown
  const dx = currentX - mouseInitialStart.current.x;
  const dy = currentY - mouseInitialStart.current.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Only start dragging after threshold
  if (!hasExceededThreshold.current) {
    if (distance >= DRAG_THRESHOLD) {
      hasExceededThreshold.current = true;
      isDragging.current = true;

      // NOW disable text selection
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    } else {
      // Still below threshold - don't pan yet
      return;
    }
  }

  // Normal panning logic continues...
}, [onPan]);

// Modified handleMouseUp
const handleMouseUp = useCallback(() => {
  isDragging.current = false;
  hasExceededThreshold.current = false;
  mouseStart.current = null;
  mouseInitialStart.current = null;

  // RESTORE text selection
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
}, []);
```

### Phase 2: Momentum/Inertia (Priority: High)

```typescript
// Velocity tracking
const lastMousePosition = useRef<{ x: number; y: number; timestamp: number } | null>(null);
const velocity = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

// In handleMouseMove - track velocity
if (isDragging.current) {
  const now = performance.now();
  if (lastMousePosition.current) {
    const dt = now - lastMousePosition.current.timestamp;
    if (dt > 0) {
      velocity.current = {
        x: (e.clientX - lastMousePosition.current.x) / dt * 16, // normalize to 60fps
        y: (e.clientY - lastMousePosition.current.y) / dt * 16
      };
    }
  }
  lastMousePosition.current = { x: e.clientX, y: e.clientY, timestamp: now };
}

// In handleMouseUp - start momentum animation
if (Math.abs(velocity.current.x) > 0.5 || Math.abs(velocity.current.y) > 0.5) {
  startMomentumAnimation();
}

// Momentum animation
const startMomentumAnimation = () => {
  const animate = () => {
    const vx = velocity.current.x;
    const vy = velocity.current.y;

    if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) {
      // Stop animation
      return;
    }

    // Apply momentum pan
    onPan({ x: -vx, y: -vy });

    // Decay velocity
    velocity.current.x *= 0.95;
    velocity.current.y *= 0.95;

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};
```

### Phase 3: Performance Optimization (Priority: Medium)

1. **RAF Batching**: Ensure all visual updates happen in single RAF callback
2. **GPU Acceleration**: Use `translate3d()` instead of `translateX/Y`
3. **Will-Change Hints**: Add `will-change: transform` during active drag only
4. **Passive Event Listeners**: Use for scroll/touch events

## Testing Requirements

### Unit Tests (Vitest)
```typescript
describe('useCanvasTouchGestures - Drag Threshold', () => {
  test('should not pan when mouse moves < 5px', () => {
    // mousedown at (0, 0)
    // mousemove to (3, 3) - distance = 4.24px
    // onPan should NOT be called
  });

  test('should start panning when exceeding threshold', () => {
    // mousedown at (0, 0)
    // mousemove to (4, 4) - distance = 5.66px
    // onPan SHOULD be called
  });

  test('should disable user-select only after threshold', () => {
    // Check document.body.style.userSelect = '' initially
    // After threshold: document.body.style.userSelect = 'none'
    // After mouseup: document.body.style.userSelect = ''
  });
});

describe('useCanvasTouchGestures - Momentum', () => {
  test('should calculate velocity from mouse movement', () => {
    // Fast drag (high velocity)
    // Check velocity.current values
  });

  test('should apply momentum after mouseup', () => {
    // Drag with velocity
    // Release mouse
    // onPan should continue being called with decaying values
  });

  test('should stop momentum below min threshold', () => {
    // Momentum should stop when velocity < 0.5
  });
});
```

### E2E Tests (Playwright)
```typescript
test('canvas text selection works', async ({ page }) => {
  await page.goto('/?layout=canvas');

  // Triple-click to select paragraph
  const paragraph = page.locator('p').first();
  await paragraph.click({ clickCount: 3 });

  // Verify text is selected
  const selectedText = await page.evaluate(() => window.getSelection()?.toString());
  expect(selectedText).toBeTruthy();
  expect(selectedText!.length).toBeGreaterThan(0);
});

test('canvas drag threshold prevents accidental pan', async ({ page }) => {
  await page.goto('/?layout=canvas');

  const canvas = page.locator('.lightbox-canvas');
  const box = await canvas.boundingBox();

  // Small movement (< 5px) should not pan
  await canvas.hover();
  await page.mouse.down();
  await page.mouse.move(box!.x + 3, box!.y + 3); // 3px movement
  await page.mouse.up();

  // Check canvas position hasn't changed
  const position1 = await page.evaluate(() => window.__canvasPosition);

  // Large movement (> 5px) should pan
  await page.mouse.down();
  await page.mouse.move(box!.x + 20, box!.y + 20); // 20px movement
  await page.mouse.up();

  const position2 = await page.evaluate(() => window.__canvasPosition);
  expect(position2).not.toEqual(position1);
});

test('canvas momentum panning feels smooth', async ({ page }) => {
  await page.goto('/?layout=canvas');

  // Fast drag should continue moving after release
  const canvas = page.locator('.lightbox-canvas');
  await canvas.hover();
  await page.mouse.down();

  // Fast movement
  for (let i = 0; i < 10; i++) {
    await page.mouse.move(100 + i * 10, 100 + i * 10);
    await page.waitForTimeout(16); // ~60fps
  }

  await page.mouse.up();

  // Canvas should continue moving via momentum
  await page.waitForTimeout(100);

  const positionAfterRelease = await page.evaluate(() => window.__canvasPosition);
  await page.waitForTimeout(500);
  const positionAfterMomentum = await page.evaluate(() => window.__canvasPosition);

  expect(positionAfterMomentum).not.toEqual(positionAfterRelease);
});
```

## Implementation Plan

### Commit 1: Drag Threshold + Text Selection Fix
- Add DRAG_THRESHOLD constant
- Implement threshold detection in handleMouseMove
- Conditional user-select disabling
- Basic unit tests

### Commit 2: Momentum/Inertia
- Add velocity tracking
- Implement momentum animation
- Decay coefficient tuning
- Momentum unit tests

### Commit 3: Performance Optimization
- RAF batching audit
- GPU acceleration CSS
- Performance profiling
- E2E performance tests

### Commit 4: Comprehensive E2E Tests
- Text selection test
- Drag threshold test
- Momentum test
- Interactive element conflict test

## Success Criteria

- [x] Users can select text anywhere on canvas without triggering pan (Phase 1 ✅)
- [x] Small mouse movements (< 5px) don't cause accidental panning (Phase 1 ✅)
- [x] Canvas panning feels smooth and responsive (60fps maintained) (Phase 3 ✅)
- [x] Momentum/inertia feels natural (like Figma/Miro) (Phase 2 ✅)
- [x] All 93 interactive elements work correctly (buttons, links, forms) (Phase 1 ✅)
- [ ] Tests validate all interaction patterns (Phase 4 - Pending)
- [x] No performance regression (maintain 60fps during pan) (Phase 3 ✅)

## References

- [Apple: Adding Mouse Controls to Canvas](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingMouseandTouchControlstoCanvas/AddingMouseandTouchControlstoCanvas.html)
- [Panzoom Library](https://github.com/timmywil/panzoom) - Industry standard implementation
- [Fabric.js Panning](https://stackoverflow.com/questions/34423822/how-to-implement-canvas-panning-with-fabric-js)
- Figma.com (analyze dev tools for interaction patterns)
