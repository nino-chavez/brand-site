# Canvas Mode Remediation - Task Breakdown

> **Specification:** `2025-09-30-canvas-mode-remediation`
> **Total Tasks:** 12
> **Estimated Effort:** 2 weeks (80 hours)
> **Priority:** P0 - Critical
> **Status:** 🔴 NOT STARTED

## Task Summary

| Phase | Tasks | Hours | Status |
|-------|-------|-------|--------|
| Phase 1: Foundation Fixes | 4 | 22h | ⏸️ Not Started |
| Phase 2: Hook Memoization | 4 | 8h | ⏸️ Not Started |
| Phase 3: Testing & Validation | 4 | 12h | ⏸️ Not Started |
| **TOTAL** | **12** | **42h** | **0% Complete** |

---

## Phase 1: Foundation Fixes (Week 1, Days 1-3)

### Task 1: Fix useCursorTracking Hook
**Priority:** P0
**Effort:** 4 hours
**Dependencies:** None
**Files:** `src/hooks/useCursorTracking.tsx`

**Subtasks:**
- [ ] Add `useMemo` import to hook
- [ ] Memoize `performance` object calculation
  ```typescript
  const performance = useMemo(() => ({
    frameRate: Math.round(/* calculation */),
    averageLatency: Math.round(/* calculation */)
  }), [performanceMetricsRef.current.frameCount]); // Appropriate deps
  ```
- [ ] Memoize entire return object WITHOUT `isTracking` in deps
  ```typescript
  return useMemo(() => ({
    position,
    isTracking,
    startTracking,
    stopTracking,
    performance
  }), [position, startTracking, stopTracking, performance]);
  // CRITICAL: Do NOT add isTracking here!
  ```
- [ ] Add initial cursor position capture in `handleMouseMove`
  ```typescript
  const handleMouseMove = useCallback((event: MouseEvent) => {
    currentMousePositionRef.current = {
      x: event.clientX,
      y: event.clientY
    };

    // Initialize position if tracking started but no position yet
    if (isTracking && !position) {
      setPosition({
        x: event.clientX,
        y: event.clientY,
        timestamp: getHighResTimestamp()
      });
    }
  }, [isTracking, position]);
  ```
- [ ] Update `startTracking` to keep ref in sync
  ```typescript
  const isTrackingRef = useRef<boolean>(false);

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  const startTracking = useCallback(() => {
    if (isTrackingRef.current) return; // Use ref instead of state
    // ... rest of implementation
  }, [/* stable deps */]);
  ```

**Acceptance Criteria:**
- [ ] Hook returns stable memoized object
- [ ] Position available immediately when tracking starts
- [ ] No infinite loops when integrated with CursorLens
- [ ] All callbacks wrapped in useCallback

**Testing:**
```bash
# Run unit tests
npm test -- useCursorTracking

# Run in browser
# 1. Enable cursor tracking
# 2. Move mouse
# 3. Verify position updates without errors
```

---

### Task 2: Fix UnifiedGameFlowContext
**Priority:** P0
**Effort:** 6 hours
**Dependencies:** None
**Files:** `src/contexts/UnifiedGameFlowContext.tsx`

**Subtasks:**
- [ ] Audit all action groups for inline object literals
- [ ] Memoize `performanceActions` separately
  ```typescript
  const performanceActions = useMemo(() => ({
    startTracking: () => { /* impl */ },
    stopTracking: () => { /* impl */ },
    updateMetrics: (metrics) => { /* impl */ },
    reportFrameDrop: (count) => { /* impl */ },
    detectDegradation: () => { /* impl */ },
    applyOptimization: (level) => { /* impl */ },
    getOptimizedUpdateInterval: () => { /* impl */ }
  }), []); // Add appropriate deps if needed
  ```
- [ ] Memoize other action groups (camera, canvas, viewfinder)
- [ ] Update main context return to use memoized actions
  ```typescript
  const actions = useMemo(() => ({
    // ... other actions
    performance: performanceActions  // Use stable reference
  }), [performanceActions, /* other stable action groups */]);

  return useMemo(() => ({
    state,
    actions
  }), [state, actions]);
  ```
- [ ] Fix `useUnifiedPerformance` helper hook
  ```typescript
  export const useUnifiedPerformance = () => {
    const { state, actions } = useUnifiedGameFlow();
    return useMemo(() => ({
      state: state.performance.cursor,
      actions: actions.performance  // Now stable!
    }), [state.performance.cursor, actions.performance]);
  };
  ```
- [ ] Add exhaustive deps to all other helper hooks

**Acceptance Criteria:**
- [ ] No inline object literals in context return
- [ ] All action groups properly memoized
- [ ] All helper hooks have exhaustive deps
- [ ] No "changing on every render" warnings

**Testing:**
```bash
# Run context tests
npm test -- UnifiedGameFlowContext

# Check for console warnings
# Should see ZERO dependency warnings
```

---

### Task 3: Fix CursorLens Component
**Priority:** P0
**Effort:** 8 hours
**Dependencies:** Task 1, Task 2
**Files:** `src/components/canvas/CursorLens.tsx`

**Subtasks:**
- [ ] Change pointer events to always enabled
  ```typescript
  <div
    ref={containerRef}
    className={`fixed inset-0 z-[9990] ${className}`}
    {...lensActivation.gestureEvents}
    style={{
      pointerEvents: 'auto', // Always enable for activation gestures
      touchAction: 'none',
      // ... other styles
    }}
  >
  ```
- [ ] Fix `prevIsEnabledRef` initialization
  ```typescript
  const prevIsEnabledRef = useRef(!isEnabled); // Opposite of current
  ```
- [ ] Fix `prevIsActiveRef` initialization
  ```typescript
  const prevIsActiveRef = useRef(!lensActivation.isActive);
  ```
- [ ] Add comprehensive debug logging
  ```typescript
  useEffect(() => {
    if (isEnabled !== prevIsEnabledRef.current) {
      console.log('🎬 CursorLens: isEnabled changed', { isEnabled });
      // ... implementation
    }
  }, [isEnabled, cursorTracking.startTracking, cursorTracking.stopTracking]);
  ```
- [ ] Simplify effect dependencies to primitives only
  ```typescript
  // BEFORE (over-coupled):
  }, [cursorTracking, radialMenu, ...]);

  // AFTER (specific):
  }, [
    cursorTracking.startTracking,
    cursorTracking.stopTracking,
    radialMenu.resetMenu,
    radialMenu.repositionMenu
  ]);
  ```
- [ ] Add warning when position missing
  ```typescript
  useEffect(() => {
    if (lensActivation.isActive && cursorTracking.position) {
      radialMenu.repositionMenu(cursorTracking.position, viewportDimensions);
    } else if (lensActivation.isActive && !cursorTracking.position) {
      console.warn('⚠️ Lens active but no cursor position', {
        isTracking: cursorTracking.isTracking
      });
    }
  }, [/* appropriate deps */]);
  ```

**Acceptance Criteria:**
- [ ] Click-and-hold activates lens without errors
- [ ] Menu appears at cursor position
- [ ] No infinite render loops
- [ ] Traditional mode still works
- [ ] Debug logs show correct activation flow

**Testing:**
```bash
# Manual testing protocol
# 1. Navigate to http://localhost:3001/?layout=canvas
# 2. See instruction overlay
# 3. Click and hold for 300ms anywhere on screen
# 4. Verify radial menu appears centered at cursor
# 5. Verify all 6 section buttons visible
# 6. Click a section, verify navigation
# 7. Check console - should be zero errors
```

---

### Task 4: Fix Context Helper Hooks
**Priority:** P0
**Effort:** 4 hours
**Dependencies:** Task 2
**Files:** `src/contexts/UnifiedGameFlowContext.tsx`

**Subtasks:**
- [ ] Fix `useUnifiedViewfinder` (line ~1003)
  ```typescript
  export const useUnifiedViewfinder = () => {
    const { state, actions } = useUnifiedGameFlow();
    return useMemo(() => ({
      state: state.viewfinder,
      actions: actions.viewfinder
    }), [state.viewfinder, actions.viewfinder]); // Add missing deps
  };
  ```
- [ ] Fix `useUnifiedCamera` (line ~1021)
  ```typescript
  export const useUnifiedCamera = () => {
    const { state, actions } = useUnifiedGameFlow();
    return useMemo(() => ({
      state: state.camera,
      actions: actions.camera
    }), [state.camera, actions.camera]); // Add missing deps
  };
  ```
- [ ] Fix `useUnifiedCanvas` (line ~1029)
  ```typescript
  export const useUnifiedCanvas = () => {
    const { state, actions } = useUnifiedGameFlow();
    return useMemo(() => ({
      state: state.canvas,
      actions: actions.canvas,
      performance: state.performance.canvas
    }), [
      state.canvas,
      state.performance.canvas,
      actions.canvas
    ]); // Add missing deps
  };
  ```
- [ ] Verify `useUnifiedPerformance` fixed in Task 2
- [ ] Add unit tests for all helper hooks

**Acceptance Criteria:**
- [ ] All helper hooks have exhaustive dependencies
- [ ] No console warnings about missing deps
- [ ] All hooks return stable memoized objects
- [ ] Unit tests pass

**Testing:**
```bash
npm test -- UnifiedGameFlowContext
# Should see zero dependency warnings
```

---

## Phase 2: Hook Memoization (Week 1, Days 4-5)

### Task 5: Fix useAccessibility
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** None
**Files:** `src/hooks/useAccessibility.tsx`

**Subtasks:**
- [ ] Add `useMemo` import
- [ ] Memoize `focusManagement` object (line ~532)
  ```typescript
  const focusManagement: FocusManagement = useMemo(() => ({
    trapFocus: (element: HTMLElement) => manager.trapFocus(element),
    moveFocusToSection: (section: GameFlowSection) => manager.moveFocusToSection(section),
    restoreFocus: () => manager.restoreFocus(),
    getCurrentFocusable: () => manager['lastFocusedElement'] || null
  }), [manager]);
  ```
- [ ] Memoize entire return object (line ~539)
  ```typescript
  return useMemo(() => ({
    ...accessibilityState,
    announce,
    announceSectionChange,
    setNavigationCallback,
    focusManagement,
    keyboardShortcuts: KEYBOARD_SHORTCUTS,
    sectionDescriptions: SECTION_DESCRIPTIONS
  }), [
    accessibilityState,
    announce,
    announceSectionChange,
    setNavigationCallback,
    focusManagement
  ]);
  ```

**Acceptance Criteria:**
- [ ] Hook returns stable memoized object
- [ ] Section components don't re-render infinitely
- [ ] Accessibility features still work correctly

**Testing:**
```bash
npm test -- useAccessibility
# Manually test focus management and announcements
```

---

### Task 6: Fix useErrorHandling
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** None
**Files:** `src/hooks/useErrorHandling.tsx`

**Subtasks:**
- [ ] Add `useMemo` import
- [ ] Replace `.bind()` anti-pattern with `useCallback` (line ~566)
  ```typescript
  // BEFORE:
  createError: handler.createGameFlowError.bind(handler),

  // AFTER:
  const createError = useCallback((type, message, section, recoverable) =>
    handler.createGameFlowError(type, message, section, recoverable),
  [handler]);
  ```
- [ ] Wrap all bound methods in useCallback
- [ ] Memoize entire return object (line ~575)
  ```typescript
  return useMemo(() => ({
    ...errorState,
    handleError,
    recoverFromError,
    clearErrors,
    createError,
    getErrorHistory,
    getRecommendations,
    isInFallbackMode
  }), [
    errorState,
    handleError,
    recoverFromError,
    clearErrors,
    createError,
    getErrorHistory,
    getRecommendations,
    isInFallbackMode
  ]);
  ```

**Acceptance Criteria:**
- [ ] No `.bind()` usage in return object
- [ ] All methods wrapped in useCallback
- [ ] Hook returns stable memoized object
- [ ] Error boundaries don't trigger loops

**Testing:**
```bash
npm test -- useErrorHandling
# Manually test error recovery flow
```

---

### Task 7: Fix useSpatialAccessibility
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** Task 5
**Files:** `src/hooks/useSpatialAccessibility.tsx`

**Subtasks:**
- [ ] Add `useMemo` import
- [ ] Memoize `spatialRelationships` (line ~669)
  ```typescript
  const spatialRelationships = useMemo(() => ({
    adjacent: getAdjacentSections(currentSection),
    diagonal: getDiagonalSections(currentSection),
    // ... other relationships
  }), [currentSection, getAdjacentSections, getDiagonalSections]);
  ```
- [ ] Memoize entire return object (line ~672)
  ```typescript
  return useMemo(() => ({
    ...baseAccessibility,
    spatialRelationships,
    navigateToAdjacentSection,
    announceCanvasPosition,
    // ... other exports
  }), [
    baseAccessibility,
    spatialRelationships,
    navigateToAdjacentSection,
    announceCanvasPosition
  ]);
  ```

**Acceptance Criteria:**
- [ ] Hook returns stable memoized object
- [ ] Spatial navigation doesn't cause re-renders
- [ ] Base accessibility features preserved

**Testing:**
```bash
npm test -- useSpatialAccessibility
# Test spatial navigation in canvas mode
```

---

### Task 8: Fix useGameFlowDebugger
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** None
**Files:** `src/hooks/useGameFlowDebugger.tsx`

**Subtasks:**
- [ ] Verify `useMemo` import exists
- [ ] Memoize entire return object (line ~570)
  ```typescript
  return useMemo(() => ({
    isActive,
    log,
    trackState: trackGameFlowState,
    trackEvent,
    startBenchmark,
    endBenchmark,
    measureFunction,
    trackPerformanceMetrics,
    generateReport,
    exportLogs,
    clearLogs
  }), [
    isActive,
    log,
    trackGameFlowState,
    trackEvent,
    startBenchmark,
    endBenchmark,
    measureFunction,
    trackPerformanceMetrics,
    generateReport,
    exportLogs,
    clearLogs
  ]);
  ```

**Acceptance Criteria:**
- [ ] Hook returns stable memoized object
- [ ] CaptureSection doesn't loop
- [ ] Debug features still work

**Testing:**
```bash
npm test -- useGameFlowDebugger
# Enable debug mode and verify no loops
```

---

## Phase 3: Testing & Validation (Week 2)

### Task 9: Update Runtime Error Detection
**Priority:** P0
**Effort:** 3 hours
**Dependencies:** All previous tasks
**Files:** `test/runtime-error-detection/`

**Subtasks:**
- [ ] Verify `INFINITE_LOOP` error type added (already done)
- [ ] Add canvas activation test scenario
  ```typescript
  {
    name: 'Canvas Mode Activation - No Infinite Loops',
    description: 'Verify canvas mode activates without maximum update depth errors',
    category: 'canvas',
    async execute(page) {
      await page.goto('http://localhost:3000?layout=canvas');
      await page.waitForLoadState('networkidle');

      // Activate lens
      await page.mouse.click(600, 400, { delay: 350 });
      await page.waitForTimeout(1000);

      // Check for errors
      const errors = await page.evaluate(() =>
        (window as any).__RUNTIME_ERRORS__ || []
      );

      const infiniteLoops = errors.filter(e =>
        e.type === 'INFINITE_LOOP'
      );

      if (infiniteLoops.length > 0) {
        throw new Error(`Detected ${infiniteLoops.length} infinite loop errors`);
      }
    },
    expectedErrors: [],
    maxDuration: 5000
  }
  ```
- [ ] Add cursor tracking initialization test
- [ ] Run full test suite, verify 0 critical errors

**Acceptance Criteria:**
- [ ] Canvas activation test passes
- [ ] Zero INFINITE_LOOP errors detected
- [ ] All existing tests still pass
- [ ] Test coverage maintained

**Testing:**
```bash
npm run test:runtime-errors
# Should pass with 0 critical errors
```

---

### Task 10: Manual Testing Protocol
**Priority:** P0
**Effort:** 4 hours
**Dependencies:** Tasks 1-9
**Files:** Manual testing checklist

**Test Cases:**

**TC1: Traditional Mode (Baseline)**
- [ ] Navigate to `http://localhost:3001/`
- [ ] Verify page loads without errors
- [ ] Verify navigation works (scroll, section links)
- [ ] Check console - should be zero errors
- [ ] Verify no infinite render warnings

**TC2: Canvas Mode Activation**
- [ ] Navigate to `http://localhost:3001/?layout=canvas`
- [ ] Verify instruction overlay visible
- [ ] Verify "Canvas Mode" heading present
- [ ] Verify "Click and hold" instructions visible
- [ ] Check console - should be zero errors

**TC3: Lens Activation**
- [ ] In canvas mode, move cursor to center of screen
- [ ] Click and hold for 300ms
- [ ] Verify activation indicator appears
- [ ] Verify radial menu appears centered at cursor
- [ ] Verify all 6 section buttons visible
  - [ ] Capture (Introduction)
  - [ ] Focus (Attention)
  - [ ] Frame (Context)
  - [ ] Expose (Skills)
  - [ ] Develop (Experience)
  - [ ] Portfolio (Gallery)

**TC4: Menu Interaction**
- [ ] With menu active, hover over "Focus" button
- [ ] Verify button highlights
- [ ] Click "Focus" button
- [ ] Verify navigation to Focus section
- [ ] Verify menu deactivates after click
- [ ] Check console - should be zero errors

**TC5: Deactivation**
- [ ] Activate lens again
- [ ] Release mouse without clicking button
- [ ] Verify menu disappears
- [ ] Verify tracking stops
- [ ] Check console - should be zero errors

**TC6: Multiple Activations**
- [ ] Activate lens 5 times in different screen positions
- [ ] Verify menu appears correctly each time
- [ ] Verify no errors accumulate
- [ ] Check console - should be zero errors
- [ ] Verify no memory leaks (use browser dev tools)

**Acceptance Criteria:**
- [ ] All 6 test cases pass
- [ ] Zero console errors across all tests
- [ ] No "Maximum update depth exceeded" warnings
- [ ] Navigation works in both modes
- [ ] Performance feels smooth (<100ms activation)

**Testing:**
Manual execution of all test cases with documentation of results

---

### Task 11: Performance Validation
**Priority:** P0
**Effort:** 2 hours
**Dependencies:** Task 10
**Files:** Performance testing scripts

**Metrics to Validate:**

**Cursor Tracking Performance:**
- [ ] Measure FPS during cursor movement
  - Target: 60fps
  - Acceptable: >55fps
  - Method: Browser Performance tab, 10-second recording
- [ ] Measure activation latency
  - Target: <100ms
  - Method: Time from mousedown to menu visible
  - Record: Average of 10 activations

**Memory Usage:**
- [ ] Baseline memory (canvas mode loaded)
- [ ] Memory after 10 activations
- [ ] Memory after 10 deactivations
- [ ] Check for memory leaks (memory should return to baseline)
  - Method: Chrome DevTools Memory Profiler
  - Take 3 heap snapshots: before, during, after

**Bundle Size:**
- [ ] Build production bundle
  ```bash
  npm run build
  ```
- [ ] Check gzipped size
  - Target: <85KB (current is 80.11KB)
  - Acceptable increase: <5KB
- [ ] Verify no unexpected dependencies added

**Acceptance Criteria:**
- [ ] 60fps maintained during cursor tracking
- [ ] <100ms activation latency
- [ ] No memory leaks detected
- [ ] Bundle size increase <5KB
- [ ] All performance metrics documented

**Testing:**
```bash
# Build and analyze bundle
npm run build
npm run analyze # If available

# Manual performance testing in Chrome DevTools
# Record performance, check FPS, measure latency
```

---

### Task 12: Documentation
**Priority:** P1
**Effort:** 3 hours
**Dependencies:** All previous tasks
**Files:** Multiple documentation files

**Documents to Create/Update:**

**1. Technical Debt Register Update**
- [ ] Mark TD-001 through TD-005 as RESOLVED
- [ ] Document resolution approach
- [ ] Record lessons learned
- [ ] File: `.agent-os/standards/tech-debt-prevention.md`

**2. Hook Memoization Patterns Guide**
- [ ] Document standard pattern for custom hooks
- [ ] Provide before/after examples
- [ ] Include common pitfalls
- [ ] Add to code style standards
- [ ] File: `.agent-os/standards/react-hooks-patterns.md` (new)

**3. Troubleshooting Guide**
- [ ] Document "Maximum update depth exceeded" debugging
- [ ] Explain circular dependency detection
- [ ] Provide fix patterns
- [ ] Include prevention measures
- [ ] File: `.agent-os/docs/troubleshooting-infinite-loops.md` (new)

**4. Architecture Diagrams**
- [ ] Update hook dependency diagram
- [ ] Show before/after architecture
- [ ] Document memoization strategy
- [ ] File: `.agent-os/intelligence/canvas-patterns.md` (update)

**5. Roadmap Update**
- [ ] Update Phase 2 status to 100% complete
- [ ] Add remediation work to changelog
- [ ] Update completion metrics
- [ ] File: `.agent-os/product/roadmap.md`

**Acceptance Criteria:**
- [ ] All 5 documentation files created/updated
- [ ] Patterns clearly documented with examples
- [ ] Future developers can avoid same mistakes
- [ ] Roadmap reflects accurate completion status

**Deliverables:**
- Updated technical debt register
- New React hooks patterns guide
- New troubleshooting guide
- Updated architecture diagrams
- Updated roadmap

---

## Task Dependencies Graph

```
Phase 1: Foundation (Parallel execution possible)
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Task 1  │────▶│ Task 3  │     │ Task 2  │────▶│ Task 4  │
│ useCur  │     │ CursorL │     │ Context │     │ Helpers │
└─────────┘     └─────────┘     └─────────┘     └─────────┘

Phase 2: Hooks (Parallel execution)
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Task 5  │  │ Task 6  │  │ Task 7  │  │ Task 8  │
│ useAcc  │  │ useErr  │  │ useSpa  │  │ useDeb  │
└─────────┘  └─────────┘  └─────────┘  └─────────┘

Phase 3: Validation (Sequential execution)
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Task 9  │────▶│ Task 10 │────▶│ Task 11 │────▶│ Task 12 │
│ Runtime │     │ Manual  │     │ Perf    │     │ Docs    │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
```

## Estimated Timeline

**Week 1:**
- Day 1-2: Tasks 1, 2 (Foundation - useCursorTracking, Context)
- Day 3: Tasks 3, 4 (Foundation - CursorLens, Helpers)
- Day 4-5: Tasks 5-8 (Hook memoization)

**Week 2:**
- Day 1: Task 9 (Runtime error detection)
- Day 2-3: Task 10 (Manual testing protocol)
- Day 4: Task 11 (Performance validation)
- Day 5: Task 12 (Documentation)

## Success Criteria

**All tasks complete when:**
- [ ] Canvas mode activates without errors
- [ ] Radial menu appears at correct position
- [ ] All 6 sections navigable
- [ ] Traditional mode still works
- [ ] Zero infinite loop errors
- [ ] All hooks properly memoized
- [ ] Performance targets met
- [ ] Documentation complete

**Deliverables:**
- 6 fixed hook files
- 2 fixed component files
- 1 fixed context file
- 1 new test scenario
- 3 new documentation files
- 2 updated documentation files
- Complete manual testing results
- Performance benchmark results

---

**Status:** Ready for implementation
**Next Step:** Begin Task 1 - Fix useCursorTracking Hook
