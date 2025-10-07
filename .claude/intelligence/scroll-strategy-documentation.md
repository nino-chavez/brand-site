# Scroll Strategy Documentation

## Overview

The portfolio has three fundamentally different interaction models that require different scroll strategies. This document defines the scroll owner and behavior for each mode.

## Scroll Ownership by Layout Mode

### Traditional Mode (Default)
**Owner**: `body` (native browser scroll)

**Strategy**:
- ✅ Native body scroll enabled
- ✅ Touch scroll works naturally
- ✅ Mouse wheel scroll works naturally
- ✅ Keyboard scroll (spacebar, arrows) works
- ❌ No custom event handlers (rely on browser)

**Implementation**:
```tsx
// App.tsx:436
<div className="bg-brand-dark text-brand-light font-sans antialiased">
  {/* No overflow styles - let body handle scroll */}
  <SimplifiedGameFlowContainer />
</div>
```

**CSS**:
```css
/* index.css */
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  /* No overflow restriction - natural scroll */
}
```

### Canvas Mode
**Owner**: `none` (custom pan/zoom handling)

**Strategy**:
- ❌ Native scroll disabled
- ❌ Touch scroll converted to pan gestures
- ❌ Wheel scroll requires Ctrl/Cmd modifier for zoom
- ✅ Custom event handlers (useCanvasTouchGestures)

**Implementation**:
```tsx
// App.tsx:290
<div className="overflow-hidden h-screen">
  {/* Prevent all scroll, handle via pan */}
  <LightboxCanvas>
    {/* useCanvasTouchGestures manages all interaction */}
  </LightboxCanvas>
</div>
```

**Event Handlers**:
- `useCanvasTouchGestures` (src/hooks/useCanvasTouchGestures.tsx)
  - Mouse drag → pan
  - Touch drag → pan
  - Two-finger pinch → zoom
  - Ctrl+wheel → zoom

### Timeline Mode
**Owner**: `container` (timeline container scroll)

**Strategy**:
- ✅ Native scroll on timeline container
- ✅ Touch scroll works
- ✅ Mouse wheel scroll works
- ❌ No body scroll (overflow-hidden on body)

**Implementation**:
```tsx
// components/timeline/FramerTimelineLayout.tsx
<div className="overflow-x-auto overflow-y-hidden">
  {/* Horizontal scroll container */}
</div>
```

## Scroll Event Handlers Inventory

### Global Listeners (Always Active)
- ❌ **NONE** - No global scroll listeners should be active

### Mode-Specific Listeners

#### Traditional Mode
File | Handler | Purpose | Passive
-----|---------|---------|--------
`SimplifiedGameFlowContainer.tsx:79` | `window.scroll` | Section detection | Yes
`useScrollSpy.ts:149` | `window.scroll` | Navigation highlight | Yes
`ScrollProgress.tsx:40` | `window.scroll` | Progress indicator | Yes

#### Canvas Mode
File | Handler | Purpose | Passive
-----|---------|---------|--------
`useCanvasTouchGestures.tsx:360` | `window.wheel` | Zoom (Ctrl+wheel only) | **No** (needs preventDefault)
`useCanvasTouchGestures.tsx:358` | `window.mousemove` | Pan drag tracking | Yes
`useCanvasTouchGestures.tsx:359` | `window.mouseup` | End pan | Yes

#### Timeline Mode
File | Handler | Purpose | Passive
-----|---------|---------|--------
`useTimelineScroll.ts:217` | `window.wheel` | Horizontal scroll | **No** (converts vertical → horizontal)
`useFramerAnimation.ts:328` | `container.wheel` | Timeline navigation | **No**

## Common Scroll Conflicts (BUGS TO AVOID)

### ❌ Conflict 1: Nested Scroll Containers
**Problem**: `<div style={{ overflowY: 'auto' }}>` inside body creates ambiguity
```tsx
// BAD - Don't do this
<body>
  <div style={{ overflowY: 'auto', minHeight: '100vh' }}>
    {/* Which scrolls? body or div? */}
  </div>
</body>
```

**Solution**: Only use body scroll in Traditional mode
```tsx
// GOOD
<body>
  <div className="bg-brand-dark">
    {/* No overflow - body scrolls naturally */}
  </div>
</body>
```

### ❌ Conflict 2: Multiple preventDefault Handlers
**Problem**: Both canvas and timeline mode use `preventDefault` on wheel
```tsx
// Canvas mode
window.addEventListener('wheel', handleWheel, { passive: false }); // preventDefault for zoom

// Timeline mode (same page if mode switches)
window.addEventListener('wheel', handleWheel, { passive: false }); // preventDefault for scroll
```

**Solution**: Ensure handlers cleanup on mode switch
```tsx
useEffect(() => {
  if (layoutMode === 'canvas') {
    window.addEventListener('wheel', canvasWheelHandler, { passive: false });
    return () => window.removeEventListener('wheel', canvasWheelHandler);
  }
}, [layoutMode]);
```

### ❌ Conflict 3: Body Overflow Leaks
**Problem**: Modal sets `body { overflow: hidden }` but doesn't restore
```tsx
// BAD
function Modal() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // ❌ Forgot to restore!
  }, []);
}
```

**Solution**: Always restore in cleanup
```tsx
// GOOD
function Modal({ isOpen }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = ''; // Always restore
    };
  }, [isOpen]);
}
```

## Scroll Coordination Context

**New**: `ScrollCoordinationContext` (src/contexts/ScrollCoordinationContext.tsx)

Centralized scroll strategy management to prevent conflicts.

### Usage

```tsx
// App.tsx - Wrap entire app
<ScrollCoordinationProvider initialMode="traditional">
  <App />
</ScrollCoordinationProvider>

// Any component needing scroll info
import { useScrollCoordination } from '@/contexts/ScrollCoordinationContext';

function MyComponent() {
  const { strategy, preventBodyScroll, restoreBodyScroll } = useScrollCoordination();

  // Check if native scroll allowed
  if (strategy.allowNativeScroll) {
    // Use browser scroll
  }

  // Modals can temporarily disable scroll
  const handleOpenModal = () => {
    preventBodyScroll();
  };
}

// Simpler: Auto-managed scroll block
import { useTemporaryScrollBlock } from '@/contexts/ScrollCoordinationContext';

function MyModal({ isOpen }) {
  useTemporaryScrollBlock(isOpen); // Auto handles enable/disable
  return <div>Modal content</div>;
}
```

## Testing Scroll Behavior

### Manual Testing Checklist

#### Traditional Mode
- [ ] Mouse wheel scroll works
- [ ] Touch drag scroll works (mobile/trackpad)
- [ ] Spacebar scrolls down
- [ ] Arrow keys scroll
- [ ] Page scrolls smoothly (scroll-behavior: smooth)

#### Canvas Mode
- [ ] Mouse wheel WITHOUT Ctrl does nothing (no scroll)
- [ ] Mouse wheel WITH Ctrl zooms
- [ ] Mouse drag pans canvas
- [ ] Touch drag pans canvas (not scroll)
- [ ] Two-finger pinch zooms

#### Timeline Mode
- [ ] Mouse wheel scrolls timeline horizontally
- [ ] Touch drag scrolls timeline
- [ ] Body doesn't scroll vertically

### E2E Tests (Playwright)

See `tests/scroll-behavior.spec.ts` for automated tests covering:
- Scroll on each mode
- Event handler cleanup
- Mode switching doesn't break scroll
- Mobile touch scroll
- Keyboard navigation

## Migration Checklist

If adding new scroll-related features:

1. [ ] Determine layout mode (traditional/canvas/timeline)
2. [ ] Check scroll strategy for that mode
3. [ ] If adding event listeners, ensure cleanup on mode switch
4. [ ] If using `preventDefault`, document why
5. [ ] Test on mobile (touch) and desktop (mouse/wheel)
6. [ ] Add E2E test if critical user flow
7. [ ] Update this document with new handlers

## FAQs

**Q: Why does scroll feel "stuck" on mobile?**
A: Likely a `preventDefault` handler is blocking touch events. Check `useCanvasTouchGestures` isn't active in Traditional mode.

**Q: Why does wheel scroll do nothing?**
A: Canvas mode requires Ctrl+wheel for zoom. Traditional mode should allow natural wheel scroll.

**Q: Can I add `overflow: auto` to a div?**
A: Only in Timeline mode (timeline container). In Traditional mode, let body handle scroll.

**Q: How do I disable scroll for a modal?**
A: Use `useTemporaryScrollBlock(isOpen)` from ScrollCoordinationContext.

**Q: Why do I see double scrollbars?**
A: Nested scroll containers. Remove inner `overflow: auto` and use body scroll.
