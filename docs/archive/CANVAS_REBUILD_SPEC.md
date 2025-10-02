# Canvas System Rebuild Specification

## Executive Summary

This specification defines a clean, maintainable rebuild of the canvas "Lightbox" system, reducing complexity from 1,543 LOC to ~500 LOC while preserving core functionality and aligning with product vision.

**Goal**: Rebuild canvas with sound architecture, not patches on broken system.

---

## Current State Analysis

### LightboxCanvas.tsx (907 LOC)
**Problems Identified**:
1. ❌ Over-engineered performance monitoring (lines 68-76, 181-222, 537-595)
2. ❌ Redundant quality management (lines 71, 233-244, 558-569, 586-595)
3. ❌ Circular dependency risks with useUnifiedCanvas (line 58)
4. ❌ Duplicate RAF loops (lines 250-304, not using central scheduler)
5. ❌ Over-complex touch handling (lines 328-494, ~165 LOC)
6. ❌ Spatial accessibility over-coupling (lines 79-90, 624-674)
7. ❌ Performance monitor ref creating dependency cycles (lines 69-70)

**What's Essential** (~300 LOC target):
- ✅ Canvas transform with pan/zoom (lines 98-146)
- ✅ Touch gestures: single finger pan, two finger zoom (simplified)
- ✅ Keyboard navigation (lines 497-535)
- ✅ Camera movement animation (simplified using RAF scheduler)
- ✅ Debug overlay (lines 686-729)

### CanvasStateProvider.tsx (636 LOC)
**Problems Identified**:
1. ❌ Over-engineered queue system (lines 277-325, unused)
2. ❌ Monitor implementation with history/snapshots (lines 327-393, excessive)
3. ❌ Integration helpers creating circular refs (lines 596-636)
4. ❌ Unmemoized config merge (lines 406-412, recalculates on every render)
5. ❌ Performance interval polling (lines 424-436, use RAF scheduler instead)
6. ❌ Complex state structure (23 fields, many unused)

**What's Essential** (~200 LOC target):
- ✅ Core state: position, scale, section (lines 91-123)
- ✅ Simple reducer for state updates (lines 147-275)
- ✅ Memoized actions (lines 446-555)
- ✅ Context provider (lines 401-575)

---

## Rebuild Architecture

### Phase 1: Clean LightboxCanvas (~300 LOC)

```typescript
/**
 * LightboxCanvas - Minimal 2D Spatial Container
 *
 * Clean implementation focused on core functionality:
 * - Pan/zoom transforms
 * - Touch & keyboard input
 * - RAF scheduler integration
 * - Simple debug overlay
 */

interface LightboxCanvasProps {
  performanceMode?: 'high' | 'balanced' | 'low';
  debugMode?: boolean;
  children?: React.ReactNode;
}

export const LightboxCanvas: React.FC<LightboxCanvasProps> = ({
  performanceMode = 'balanced',
  debugMode = false,
  children
}) => {
  // Use simple canvas state (not over-coupled UnifiedContext)
  const { state, actions } = useCanvasState();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 1. MEMOIZED TRANSFORM (clean, no over-engineering)
  const canvasTransform = useMemo(() => {
    const { x, y, scale } = state.position;
    return {
      transform: `translate(${-x}px, ${-y}px) scale(${scale})`,
      transformOrigin: 'center center',
      willChange: isTransitioning ? 'transform' : 'auto',
      transition: isTransitioning ? 'transform 300ms ease-out' : 'none'
    };
  }, [state.position.x, state.position.y, state.position.scale, isTransitioning]);

  // 2. CAMERA MOVEMENT (use RAF scheduler)
  const executeMovement = useCallback((targetPosition: CanvasPosition) => {
    setIsTransitioning(true);
    const startPos = state.position;
    const startTime = performance.now();
    const duration = 800;

    const unsubscribe = rafScheduler.subscribe(
      'canvas-movement',
      (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 2); // ease-out

        const current = {
          x: startPos.x + (targetPosition.x - startPos.x) * eased,
          y: startPos.y + (targetPosition.y - startPos.y) * eased,
          scale: startPos.scale + (targetPosition.scale - startPos.scale) * eased
        };

        actions.updatePosition(current);

        if (progress >= 1) {
          setIsTransitioning(false);
          unsubscribe();
        }
      },
      RAFPriority.HIGH
    );
  }, [state.position, actions]);

  // 3. TOUCH GESTURES (simplified, essential only)
  const handleTouchGestures = useTouchGestures({
    onPan: (delta) => {
      const sensitivity = 1.0 / state.position.scale;
      actions.updatePosition({
        ...state.position,
        x: state.position.x - delta.x * sensitivity,
        y: state.position.y - delta.y * sensitivity
      });
    },
    onZoom: (scale) => {
      actions.updatePosition({
        ...state.position,
        scale: Math.max(0.5, Math.min(3.0, scale))
      });
    }
  });

  // 4. KEYBOARD NAV (clean, no over-coupling)
  useKeyboardNav({
    onMove: (direction) => {
      const moveDistance = 50;
      const newPos = { ...state.position };

      if (direction === 'left') newPos.x -= moveDistance;
      if (direction === 'right') newPos.x += moveDistance;
      if (direction === 'up') newPos.y -= moveDistance;
      if (direction === 'down') newPos.y += moveDistance;

      executeMovement(newPos);
    },
    onZoom: (delta) => {
      executeMovement({
        ...state.position,
        scale: Math.max(0.5, Math.min(3.0, state.position.scale + delta))
      });
    }
  });

  return (
    <div
      ref={canvasRef}
      className="lightbox-canvas w-full h-screen overflow-hidden bg-black"
      {...handleTouchGestures}
      role="application"
      aria-label="Spatial navigation canvas"
    >
      <div className="canvas-content" style={canvasTransform}>
        {children}
      </div>

      {debugMode && (
        <div className="absolute top-4 left-4 bg-black/90 text-white p-3 rounded text-xs font-mono">
          <div className="text-orange-400 font-semibold mb-2">CANVAS DEBUG</div>
          <div>Position: ({state.position.x.toFixed(1)}, {state.position.y.toFixed(1)})</div>
          <div>Scale: {state.position.scale.toFixed(2)}</div>
          <div>Section: {state.activeSection}</div>
        </div>
      )}
    </div>
  );
};
```

**Key Changes**:
- ❌ Remove: Performance monitor refs (circular dependency risk)
- ❌ Remove: Quality manager complexity
- ❌ Remove: Over-complex touch state tracking
- ❌ Remove: Spatial accessibility over-coupling
- ✅ Add: RAF scheduler integration
- ✅ Add: Simple touch/keyboard hooks
- ✅ Add: Clean memoized transforms

**LOC**: 907 → ~300 (67% reduction)

---

### Phase 2: Clean CanvasStateProvider (~200 LOC)

```typescript
/**
 * CanvasStateProvider - Minimal State Management
 *
 * Simple state for canvas pan/zoom/scale with no over-engineering
 */

interface CanvasState {
  position: { x: number; y: number; scale: number };
  activeSection: GameFlowSection;
  isTransitioning: boolean;
}

type CanvasAction =
  | { type: 'UPDATE_POSITION'; payload: { x: number; y: number; scale: number } }
  | { type: 'SET_ACTIVE_SECTION'; payload: GameFlowSection }
  | { type: 'SET_TRANSITIONING'; payload: boolean };

const canvasReducer = (state: CanvasState, action: CanvasAction): CanvasState => {
  switch (action.type) {
    case 'UPDATE_POSITION':
      return { ...state, position: action.payload };
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    case 'SET_TRANSITIONING':
      return { ...state, isTransitioning: action.payload };
    default:
      return state;
  }
};

export const CanvasStateProvider: React.FC<{
  children: React.ReactNode;
  initialPosition?: { x: number; y: number; scale: number };
  performanceMode?: 'high' | 'balanced' | 'low';
  enableAnalytics?: boolean;
}> = ({ children, initialPosition = { x: 0, y: 0, scale: 1.0 } }) => {

  const [state, dispatch] = useReducer(canvasReducer, {
    position: initialPosition,
    activeSection: 'capture',
    isTransitioning: false
  });

  // MEMOIZED from the start (no circular dependencies)
  const actions = useMemo(() => ({
    updatePosition: (position: { x: number; y: number; scale: number }) =>
      dispatch({ type: 'UPDATE_POSITION', payload: position }),
    setActiveSection: (section: GameFlowSection) =>
      dispatch({ type: 'SET_ACTIVE_SECTION', payload: section }),
    setTransitioning: (transitioning: boolean) =>
      dispatch({ type: 'SET_TRANSITIONING', payload: transitioning })
  }), []);

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
};
```

**Key Changes**:
- ❌ Remove: Queue system (unused)
- ❌ Remove: Monitor with history/snapshots (excessive)
- ❌ Remove: Integration helpers (circular deps)
- ❌ Remove: Performance polling interval
- ❌ Remove: 20+ unused state fields
- ✅ Keep: Core position/section state
- ✅ Keep: Simple reducer
- ✅ Keep: Memoized actions (stable from start)

**LOC**: 636 → ~200 (69% reduction)

---

### Phase 3: Custom Hooks (Extract Reusable Logic)

#### useTouchGestures.tsx (~50 LOC)
```typescript
export const useTouchGestures = ({
  onPan,
  onZoom
}: {
  onPan: (delta: { x: number; y: number }) => void;
  onZoom: (scale: number) => void;
}) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const distance = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        pinchStart.current = { distance, scale: 1.0 };
      }
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (e.touches.length === 1 && touchStart.current) {
        const delta = {
          x: e.touches[0].clientX - touchStart.current.x,
          y: e.touches[0].clientY - touchStart.current.y
        };
        onPan(delta);
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && pinchStart.current) {
        const distance = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        const scale = distance / pinchStart.current.distance;
        onZoom(scale);
      }
    },
    onTouchEnd: () => {
      touchStart.current = null;
      pinchStart.current = null;
    }
  };
};
```

#### useKeyboardNav.tsx (~40 LOC)
```typescript
export const useKeyboardNav = ({
  onMove,
  onZoom
}: {
  onMove: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onZoom: (delta: number) => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onMove('left');
      if (e.key === 'ArrowRight') onMove('right');
      if (e.key === 'ArrowUp') onMove('up');
      if (e.key === 'ArrowDown') onMove('down');
      if (e.key === '+' || e.key === '=') onZoom(0.1);
      if (e.key === '-') onZoom(-0.1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, onZoom]);
};
```

---

## Files to Delete

After rebuild, delete these over-engineered utilities:

```bash
# Performance over-engineering (1,001 LOC)
src/utils/canvasPerformanceMonitor.ts       # 443 LOC - use RAF scheduler instead
src/utils/canvasQualityManager.ts          # 558 LOC - unnecessary complexity

# Browser compat over-engineering (200+ LOC)
src/utils/browserCompat.ts                 # Modern browsers only

# Spatial accessibility over-coupling (150+ LOC)
# Extract minimal keyboard nav to useKeyboardNav.tsx hook
```

**Total Deleted**: ~1,200 LOC

---

## Migration Strategy

### Step 1: Create New Files (No Breaking Changes)
1. `src/components/canvas/LightboxCanvasV2.tsx` (~300 LOC)
2. `src/contexts/CanvasStateProviderV2.tsx` (~200 LOC)
3. `src/hooks/useTouchGestures.tsx` (~50 LOC)
4. `src/hooks/useKeyboardNav.tsx` (~40 LOC)

### Step 2: Test New Implementation
1. Update App.tsx to use V2 components in canvas mode
2. Test all interactions: pan, zoom, keyboard, touch
3. Verify CursorLensV2 integration works
4. Validate debug mode

### Step 3: Remove Old Files
1. Delete `LightboxCanvas.tsx` (907 LOC)
2. Delete `CanvasStateProvider.tsx` (636 LOC)
3. Delete over-engineered utils (1,200 LOC)
4. Rename V2 files to remove V2 suffix

### Step 4: Update References
1. Update imports in App.tsx
2. Update type definitions
3. Clean up any orphaned dependencies

---

## Success Metrics

### Code Quality
- ✅ Canvas system: 1,543 → ~590 LOC (62% reduction)
- ✅ Zero circular dependencies
- ✅ All hooks memoized from start
- ✅ RAF scheduler integration (no duplicate loops)

### Functionality Preserved
- ✅ Pan/zoom/scale transforms
- ✅ Touch gestures (1 & 2 finger)
- ✅ Keyboard navigation
- ✅ Section navigation
- ✅ Debug overlay
- ✅ Performance modes

### Architecture Quality
- ✅ Clean separation of concerns
- ✅ Reusable custom hooks
- ✅ No over-engineering
- ✅ Aligned with product vision ("Lens & Lightbox")

---

## Implementation Timeline

**Estimated**: 3-4 hours

1. **Phase 4: Build LightboxCanvasV2** (1.5 hours)
   - Core transform logic
   - RAF scheduler integration
   - Touch & keyboard hooks

2. **Phase 5: Build CanvasStateProviderV2** (1 hour)
   - Simple state structure
   - Memoized actions
   - Context provider

3. **Phase 6: Integration** (1 hour)
   - Update App.tsx
   - CursorLensV2 integration
   - Test all interactions

4. **Phase 7: Cleanup** (0.5 hours)
   - Delete old files
   - Remove V2 suffixes
   - Final validation

---

## Risk Mitigation

1. **V2 Suffix Strategy**: Build alongside existing implementation
2. **Incremental Testing**: Test V2 before deleting old code
3. **Git Safety**: Commit each phase separately
4. **Rollback Plan**: Keep old code until V2 proven working

---

## Alignment with Product Vision

This rebuild preserves the "Lens & Lightbox" vision:

- ✅ **Lightbox**: Clean 2D canvas navigation (LightboxCanvas)
- ✅ **Lens**: Radial menu navigation (CursorLensV2, already clean)
- ✅ Dual system working together
- ✅ No over-engineering obscuring core concept
- ✅ Maintainable codebase (500 LOC vs 2,544 LOC)

**Status**: Ready to implement Phase 4
