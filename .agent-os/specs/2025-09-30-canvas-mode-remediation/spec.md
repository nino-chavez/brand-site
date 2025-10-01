# Canvas Mode Remediation & Completion Specification

> **Created:** 2025-09-30
> **Status:** 🔴 CRITICAL - Non-Functional Feature Blocking UX
> **Priority:** P0 (Highest)
> **Effort:** L (2 weeks)
> **Risk:** High - Impacts core product experience

## Executive Summary

Canvas mode is currently **non-functional** due to systemic React hooks architecture issues discovered during debugging. This specification documents the root causes, provides a comprehensive remediation plan, and establishes industry-standard patterns for completion.

### Current State Analysis

**Problem:** Canvas mode renders blank screen with activation errors
**Root Cause:** Multiple interconnected React anti-patterns causing infinite render loops
**Impact:** Major product feature completely broken, undermining photographer metaphor
**Technical Debt:** Estimated 800+ lines of problematic code across 6 files

### Discovery Context

Issues were discovered 2025-09-30 during user testing when:
1. User clicked "Canvas" mode toggle
2. Screen showed instructions but no interactive content
3. Click-and-hold activation triggered infinite loops
4. Console showed "Maximum update depth exceeded" errors
5. Traditional mode also broken after attempted fixes

## Problem Analysis

### Systemic Issues Identified

#### 1. **Circular Hook Dependencies** (CRITICAL)
```typescript
// PROBLEM: useCursorTracking and useUnifiedPerformance create circular dependency
export const useCursorTracking = (): CursorTrackingHook => {
  const { actions: performanceActions } = useUnifiedPerformance(); // Gets new object every render

  // This causes infinite loop:
  // 1. useCursorTracking updates ->
  // 2. useUnifiedPerformance creates new actions object ->
  // 3. useCursorTracking sees new dependency -> repeat
};
```

**Files Affected:**
- `src/hooks/useCursorTracking.tsx` (310 lines)
- `src/contexts/UnifiedGameFlowContext.tsx` (1000+ lines)
- `src/hooks/useUnifiedPerformance.tsx` (if exists)

**Root Cause:** Inline object literal in context return creating new reference on every render

#### 2. **Unmemoized Hook Returns** (HIGH)
```typescript
// PROBLEM: Returns new object every render
export const useAccessibility = () => {
  return {
    ...accessibilityState,  // New object reference every time
    announce,
    focusManagement: {     // New nested object every time
      trapFocus,
      moveFocus
    }
  };
};
```

**Files Affected:**
- `src/hooks/useAccessibility.tsx`
- `src/hooks/useErrorHandling.tsx`
- `src/hooks/useSpatialAccessibility.tsx`
- `src/hooks/useGameFlowDebugger.tsx`
- `src/hooks/useRadialMenu.tsx`
- `src/hooks/useLensActivation.tsx`

#### 3. **Over-Coupled useEffect Dependencies** (HIGH)
```typescript
// PROBLEM: Depends on entire object instead of specific properties
useEffect(() => {
  if (lensActivation.isActive && !cursorTracking.isTracking) {
    cursorTracking.startTracking();
  }
}, [cursorTracking]); // Re-runs on ANY property change, not just isTracking
```

**Files Affected:**
- `src/components/canvas/CursorLens.tsx` (958 lines)
- `src/components/canvas/LightboxCanvas.tsx` (800+ lines)

#### 4. **Pointer Events Catch-22** (CRITICAL)
```typescript
// PROBLEM: Can't receive clicks when inactive, can't activate without clicks
<div
  {...lensActivation.gestureEvents}
  style={{
    pointerEvents: lensActivation.isActive ? 'auto' : 'none'  // Blocks activation!
  }}
>
```

**Impact:** Prevents user from activating the lens, breaking entire UX flow

#### 5. **Missing Cursor Position on Activation** (HIGH)
```typescript
// PROBLEM: Lens activates before cursor position captured
⚠️ CursorLens: Active but no cursor position! {isTracking: false}
✨ CursorLens: Lens activated {hasPosition: false}
```

**Root Cause:** Cursor tracking requires mouse movement before capturing position, but activation happens on static click

### Files Requiring Remediation

| File | Lines | Issues | Priority |
|------|-------|--------|----------|
| `src/hooks/useCursorTracking.tsx` | 310 | Circular deps, unmemoized return | P0 |
| `src/contexts/UnifiedGameFlowContext.tsx` | 1000+ | Inline object literals in returns | P0 |
| `src/components/canvas/CursorLens.tsx` | 958 | Over-coupled effects, pointer events | P0 |
| `src/hooks/useAccessibility.tsx` | 550+ | Unmemoized return | P1 |
| `src/hooks/useErrorHandling.tsx` | 600+ | `.bind()` anti-pattern | P1 |
| `src/hooks/useSpatialAccessibility.tsx` | 700+ | Unmemoized spread | P1 |

## Technical Specification

### Architecture Principles

1. **Stable References**: All hook returns must be memoized with `useMemo`
2. **Minimal Dependencies**: useEffect depends only on primitive values or stable references
3. **Ref-Based State Tracking**: Use refs for values that shouldn't trigger re-renders
4. **Event Handlers Over Effects**: Prefer event handlers to effects for user interactions
5. **Explicit Initialization**: Use `useRef` initialization patterns to trigger effects on mount

### Solution Design

#### Solution 1: Fix Cursor Tracking Initialization

**Current (Broken):**
```typescript
const prevIsEnabledRef = useRef(isEnabled); // Same as current value

useEffect(() => {
  if (isEnabled !== prevIsEnabledRef.current) {  // Never true on mount!
    cursorTracking.startTracking();
  }
}, [isEnabled]);
```

**Correct Pattern:**
```typescript
const prevIsEnabledRef = useRef(!isEnabled); // Opposite of current value

useEffect(() => {
  if (isEnabled !== prevIsEnabledRef.current) {  // True on mount when enabled=true
    cursorTracking.startTracking();
    prevIsEnabledRef.current = isEnabled;
  }
}, [isEnabled, cursorTracking.startTracking]);
```

**Impact:** Ensures cursor tracking starts immediately when component mounts

#### Solution 2: Capture Initial Cursor Position

**Problem:** Cursor tracking requires mouse movement before position is set

**Solution:** Capture cursor position synchronously on mousedown event

```typescript
const handleMouseDown = useCallback((event: MouseEvent) => {
  // Capture position immediately on interaction
  currentMousePositionRef.current = {
    x: event.clientX,
    y: event.clientY
  };

  // Initialize position state if tracking
  if (isTracking && !position) {
    setPosition({
      x: event.clientX,
      y: event.clientY,
      timestamp: getHighResTimestamp()
    });
  }

  // Existing activation logic...
}, [isTracking, position]);
```

**Impact:** Position available immediately when lens activates

#### Solution 3: Fix Pointer Events

**Current (Broken):**
```typescript
pointerEvents: lensActivation.isActive ? 'auto' : 'none'
```

**Correct Pattern:**
```typescript
pointerEvents: 'auto'  // Always enable to receive activation gestures
```

**Impact:** Allows click-and-hold gestures to be detected when inactive

#### Solution 4: Memoize All Hook Returns

**Template Pattern:**
```typescript
export const useExampleHook = () => {
  // All callbacks with useCallback
  const action1 = useCallback(() => { /*...*/ }, [deps]);
  const action2 = useCallback(() => { /*...*/ }, [deps]);

  // Memoize nested objects
  const nestedObject = useMemo(() => ({
    prop1: action1,
    prop2: action2
  }), [action1, action2]);

  // Memoize entire return
  return useMemo(() => ({
    state: someState,
    actions: nestedObject
  }), [someState, nestedObject]);
};
```

**Files to Apply:**
- `useAccessibility.tsx`
- `useErrorHandling.tsx`
- `useSpatialAccessibility.tsx`
- `useGameFlowDebugger.tsx`
- `useRadialMenu.tsx`
- `useLensActivation.tsx`

#### Solution 5: Fix Context Performance Actions

**Current (Broken):**
```typescript
export const useUnifiedPerformance = () => {
  const { state, actions } = useUnifiedGameFlow();
  return useMemo(() => ({
    state: state.performance.cursor,
    actions: actions.performance  // New object every time!
  }), [state.performance.cursor, actions.performance]);
};
```

**Correct Pattern:**
```typescript
export const useUnifiedPerformance = () => {
  const { state, actions } = useUnifiedGameFlow();

  // Memoize the specific actions we need
  const performanceActions = useMemo(() => ({
    startTracking: actions.performance.startTracking,
    stopTracking: actions.performance.stopTracking,
    updateMetrics: actions.performance.updateMetrics,
    // ... other actions
  }), [
    actions.performance.startTracking,
    actions.performance.stopTracking,
    actions.performance.updateMetrics
  ]);

  return useMemo(() => ({
    state: state.performance.cursor,
    actions: performanceActions
  }), [state.performance.cursor, performanceActions]);
};
```

**Alternative:** If `actions.performance` is inline object literal in `UnifiedGameFlowContext`, fix it there:

```typescript
// In UnifiedGameFlowContext
const performanceActions = useMemo(() => ({
  startTracking: () => { /*...*/ },
  stopTracking: () => { /*...*/ },
  // ...
}), []); // Or appropriate deps

return useMemo(() => ({
  state,
  actions: {
    // ...other actions
    performance: performanceActions  // Stable reference
  }
}), [state, performanceActions]);
```

### Implementation Tasks

#### Phase 1: Foundation Fixes (P0 - Week 1)

**Task 1: Fix useCursorTracking Hook** (4 hours)
- [ ] Add `useMemo` import
- [ ] Memoize `performance` object with proper deps
- [ ] Memoize entire return object (critical: WITHOUT `isTracking` in deps)
- [ ] Add initial cursor position capture on mousedown
- [ ] Test: Verify position available immediately on activation

**Task 2: Fix UnifiedGameFlowContext** (6 hours)
- [ ] Audit all inline object literals in return
- [ ] Memoize `performanceActions` with `useMemo`
- [ ] Memoize all action groups separately
- [ ] Fix `useUnifiedPerformance` helper hook
- [ ] Test: Verify no infinite loops in cursor tracking

**Task 3: Fix CursorLens Component** (8 hours)
- [ ] Change `pointerEvents` to always `'auto'`
- [ ] Fix ref initialization patterns (use opposite initial value)
- [ ] Add debug logging for activation flow
- [ ] Simplify effect dependencies (use primitive values)
- [ ] Test: Click-and-hold activates menu without errors

**Task 4: Fix Context Helper Hooks** (4 hours)
- [ ] `useUnifiedViewfinder`: Add missing deps
- [ ] `useUnifiedCamera`: Add missing deps
- [ ] `useUnifiedCanvas`: Add missing deps
- [ ] `useUnifiedPerformance`: Fix as per Solution 5
- [ ] Test: No console warnings about dependencies

#### Phase 2: Hook Memoization (P1 - Week 1)

**Task 5: Fix useAccessibility** (2 hours)
- [ ] Memoize `focusManagement` object
- [ ] Memoize entire return object
- [ ] Test: Section components don't re-render infinitely

**Task 6: Fix useErrorHandling** (2 hours)
- [ ] Replace `.bind()` with `useCallback`
- [ ] Memoize all bound methods
- [ ] Memoize entire return object
- [ ] Test: Error boundaries don't trigger loops

**Task 7: Fix useSpatialAccessibility** (2 hours)
- [ ] Memoize `spatialRelationships`
- [ ] Memoize entire return object
- [ ] Test: Spatial nav doesn't cause re-renders

**Task 8: Fix useGameFlowDebugger** (2 hours)
- [ ] Memoize entire return object
- [ ] Test: CaptureSection doesn't loop

#### Phase 3: Testing & Validation (P0 - Week 2)

**Task 9: Update Runtime Error Detection** (3 hours)
- [ ] Add `INFINITE_LOOP` error type (already done)
- [ ] Add specific test for canvas mode activation
- [ ] Add test for cursor tracking initialization
- [ ] Run full test suite, verify 0 critical errors

**Task 10: Manual Testing Protocol** (4 hours)
- [ ] Test traditional mode: no errors, navigation works
- [ ] Test canvas mode: instructions visible, activation works
- [ ] Test click-and-hold: menu appears at cursor position
- [ ] Test menu interaction: sections navigate correctly
- [ ] Test deactivation: menu disappears, tracking stops

**Task 11: Performance Validation** (2 hours)
- [ ] Verify 60fps cursor tracking
- [ ] Verify <100ms activation latency
- [ ] Check for memory leaks (tracking cleanup)
- [ ] Validate bundle size unchanged

**Task 12: Documentation** (3 hours)
- [ ] Update technical debt register
- [ ] Document hook memoization patterns
- [ ] Create troubleshooting guide
- [ ] Update architecture diagrams

### Acceptance Criteria

#### Functional Requirements
- [ ] Canvas mode renders instruction overlay
- [ ] Click-and-hold (300ms) activates radial menu
- [ ] Menu appears centered at cursor position
- [ ] All 6 section buttons visible and clickable
- [ ] Clicking section navigates to that section
- [ ] Releasing click deactivates menu
- [ ] Traditional mode toggle still works

#### Technical Requirements
- [ ] Zero infinite loop errors in console
- [ ] Zero "Maximum update depth exceeded" errors
- [ ] All hooks return stable memoized objects
- [ ] No unmemoized object returns from hooks
- [ ] All useEffect dependencies properly exhaustive
- [ ] Runtime error detection catches all loop patterns

#### Performance Requirements
- [ ] 60fps cursor tracking maintained
- [ ] <100ms activation latency
- [ ] No memory leaks on mount/unmount cycles
- [ ] Bundle size increase <5KB

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking traditional mode | Medium | Critical | Incremental fixes with git checkpoints |
| New infinite loops | Medium | High | Comprehensive testing after each task |
| Performance regression | Low | Medium | Continuous FPS monitoring |
| Incomplete fix | Medium | Critical | Follow all memoization patterns systematically |

### Dependencies

**Required:**
- React 19 hooks knowledge (useMemo, useCallback, useRef patterns)
- Understanding of React re-render behavior
- Access to runtime error detection framework

**Blockers:**
- None - all code is accessible and modifiable

### Success Metrics

**Phase 1 Complete When:**
- Canvas mode activates without errors
- Menu renders at correct cursor position
- Traditional mode unaffected

**Phase 2 Complete When:**
- All hooks properly memoized
- No dependency warnings in console
- Runtime tests pass

**Phase 3 Complete When:**
- Manual testing protocol passes 100%
- Performance benchmarks met
- Documentation updated

## Technical Debt Register

### Debt Items Created

| ID | Description | Severity | Estimated Fix |
|----|-------------|----------|---------------|
| TD-001 | Circular dependency useCursorTracking <-> useUnifiedPerformance | Critical | 6h |
| TD-002 | Unmemoized hook returns (6 hooks) | High | 12h |
| TD-003 | Over-coupled useEffect dependencies | High | 8h |
| TD-004 | Pointer events preventing activation | Critical | 2h |
| TD-005 | Missing initial cursor position | High | 2h |

**Total Debt:** ~30 hours technical work
**Total Effort:** ~80 hours including testing and documentation

### Prevention Measures

**Code Review Checklist:**
- [ ] All custom hooks return memoized objects
- [ ] All callbacks wrapped in useCallback
- [ ] All computed values wrapped in useMemo
- [ ] useEffect dependencies are primitives or stable references
- [ ] No inline object literals in Context returns
- [ ] Event handlers preferred over effects for user interactions

**ESLint Rules to Enable:**
```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "error",
    "react/jsx-no-bind": "warn"
  }
}
```

## Appendix

### Related Documents
- `.agent-os/product/roadmap.md` - Phase 2 completion status
- `.agent-os/validation/phase-2-acceptance-criteria-validation.md`
- `.agent-os/intelligence/canvas-patterns.md` - Architecture patterns
- `test/runtime-error-detection/` - Error detection framework

### Conversation History
- Debug session: 2025-09-30 (8:00 PM - 10:30 PM)
- Issues discovered during user testing of canvas mode
- Multiple attempted fixes resulted in breaking traditional mode
- Root cause analysis revealed systemic hook architecture problems

### Code Archaeology

**Why This Happened:**
1. Phase 2 marked "complete" without proper validation
2. Canvas mode never manually tested end-to-end
3. No runtime error detection for infinite loops (now added)
4. Memoization patterns not enforced in code reviews
5. Tight deadlines led to shortcuts in hook architecture

**Lessons Learned:**
1. "Working in dev tools" ≠ "working in browser"
2. Manual testing required for interactive features
3. Hook architecture must be validated before marking complete
4. Runtime error detection essential for React apps
5. Canvas mode should have been P0 validation criteria

---

**Next Steps:**
1. Review and approve this specification
2. Create task tracking in project management
3. Begin Phase 1 foundation fixes
4. Incremental testing after each task
5. Full validation before marking complete
