# Mouse Scroll Wheel Investigation
**Date**: 2025-10-04
**Issue**: Scroll wheel "finnicky" - doesn't always respond
**Status**: Investigation Plan

---

## Problem Statement

User reports: "The mouse scroll wheel is still finnicky and doesn't always respond."

**Symptoms**:
- Scroll wheel input occasionally ignored
- Inconsistent scroll behavior
- May require multiple scroll attempts

---

## Hypothesis Analysis

### Hypothesis 1: Event Listener Conflicts 🔴 HIGH PROBABILITY
**Theory**: Multiple scroll handlers competing or blocking each other

**Evidence**:
```typescript
// MotionBlurEffect.ts:93
canvas.addEventListener('wheel', this.handleWheel, { passive: true });
```

**Potential Issues**:
- Multiple components listening to same wheel events
- Event propagation not properly managed
- `passive: true` prevents `preventDefault()`, but other handlers may conflict

**Testing Strategy**:
```bash
# Search for all wheel event listeners
grep -r "addEventListener.*wheel\|onWheel" src/ --include="*.ts" --include="*.tsx"
```

---

### Hypothesis 2: Scroll Throttling/Debouncing 🟡 MEDIUM PROBABILITY
**Theory**: Aggressive performance optimization causing input lag

**Potential Culprits**:
- Scroll event throttling too aggressive
- RAF (requestAnimationFrame) delays
- State update batching causing missed inputs

**Investigation**:
- Check for `throttle()` or `debounce()` on scroll handlers
- Review RAF usage in scroll-dependent animations
- Verify React state update frequency

---

### Hypothesis 3: Browser Default Behavior Interference 🟡 MEDIUM PROBABILITY
**Theory**: Browser trying to apply smooth scrolling conflicting with custom handlers

**Evidence**:
```typescript
// App.tsx:166
element.scrollIntoView({ behavior: 'smooth', block: 'start' });
```

**Potential Issues**:
- Native smooth scroll competing with custom scroll logic
- CSS `scroll-behavior: smooth` interfering
- Momentum scrolling on trackpads vs wheel

---

### Hypothesis 4: Z-Index/Pointer Events Blocking 🟢 LOW PROBABILITY
**Theory**: Overlay elements capturing wheel events

**Check**:
- Fixed position overlays (header, technical profile panel)
- `pointer-events` CSS on overlays
- Z-index stacking contexts

---

## Diagnostic Plan

### Phase 1: Event Listener Audit (30 minutes)

**Step 1**: Map all wheel event listeners
```bash
# Find all wheel/scroll event attachments
grep -rn "addEventListener.*wheel\|addEventListener.*scroll" src/ --include="*.ts" --include="*.tsx" > wheel-listeners.txt

# Find passive vs non-passive
grep -rn "passive.*true\|passive.*false" src/ --include="*.ts" --include="*.tsx" >> wheel-listeners.txt
```

**Step 2**: Identify conflicts
- Multiple listeners on same element?
- Event propagation properly managed?
- Any `stopPropagation()` calls blocking legitimate handlers?

---

### Phase 2: Scroll Performance Analysis (20 minutes)

**Step 1**: Check throttling/debouncing
```bash
grep -rn "throttle\|debounce" src/ --include="*.ts" --include="*.tsx"
```

**Step 2**: Review RAF usage
```bash
grep -rn "requestAnimationFrame\|RAF" src/ --include="*.ts" --include="*.tsx"
```

**Step 3**: Measure scroll event frequency
- Add console.log to wheel handlers
- Test: Does every physical wheel turn log an event?
- Test: What's the delay between input and handler execution?

---

### Phase 3: Browser Behavior Testing (15 minutes)

**Test Matrix**:
| Browser | Scroll Method | Result |
|---------|---------------|--------|
| Chrome | Mouse wheel | ? |
| Chrome | Trackpad | ? |
| Firefox | Mouse wheel | ? |
| Firefox | Trackpad | ? |
| Safari | Mouse wheel | ? |
| Safari | Trackpad | ? |

**Specific Tests**:
1. Does `behavior: 'smooth'` conflict with wheel input?
2. Is CSS `scroll-behavior: smooth` applied?
3. Trackpad momentum scroll vs discrete wheel clicks

---

### Phase 4: Overlay Interference Check (10 minutes)

**Check Elements**:
1. Header (fixed position)
2. HeroTechnicalProfile (fixed at top-left)
3. ViewfinderController
4. Any modal/overlay components

**Test**:
```javascript
// Temporarily disable all fixed overlays
document.querySelectorAll('[style*="position: fixed"]').forEach(el => {
  el.style.pointerEvents = 'none';
});
// Test if wheel works now
```

---

## Known Scroll Architecture

### Current Implementation

**Traditional Layout** (`App.tsx`):
```typescript
// Smooth scroll navigation
const handleNavigate = useCallback((sectionId: SectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, []);
```

**Motion Blur Effect** (`MotionBlurEffect.ts:93`):
```typescript
canvas.addEventListener('wheel', this.handleWheel, { passive: true });
```

**Touch Gestures** (`useTouchGestures.ts`):
```typescript
// Prevents default on horizontal swipes only
if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
  e.preventDefault();
}
```

---

## Likely Root Causes (Prioritized)

### 1. Event Listener Conflict 🔴 80% PROBABILITY
**Issue**: Multiple wheel listeners not coordinating

**Fix Strategy**:
- Audit all wheel listeners
- Implement single centralized wheel handler
- Use event delegation pattern
- Ensure proper `passive` flag usage

**Estimated Effort**: 2-3 hours

---

### 2. Smooth Scroll Interference 🟡 60% PROBABILITY
**Issue**: Native smooth scroll blocking manual wheel input during animation

**Fix Strategy**:
- Replace `behavior: 'smooth'` with custom scroll animation
- Use `scrollTo()` with requestAnimationFrame
- Give wheel input higher priority than programmatic scrolling

**Estimated Effort**: 1-2 hours

---

### 3. Performance Throttling 🟡 40% PROBABILITY
**Issue**: Scroll events throttled too aggressively

**Fix Strategy**:
- Review throttle/debounce intervals
- Use RAF more intelligently (don't skip inputs)
- Separate visual updates from input handling

**Estimated Effort**: 1 hour

---

## Immediate Action Plan

### Quick Diagnostic (15 minutes)
```typescript
// Add to App.tsx or main scroll handler
useEffect(() => {
  const handleWheel = (e: WheelEvent) => {
    console.log('🖱️ Wheel event:', {
      deltaY: e.deltaY,
      target: e.target,
      timestamp: Date.now(),
      defaultPrevented: e.defaultPrevented
    });
  };

  window.addEventListener('wheel', handleWheel, { passive: true, capture: true });
  return () => window.removeEventListener('wheel', handleWheel, { capture: true });
}, []);
```

**What to Look For**:
1. Does every wheel turn log? (if no → events being swallowed)
2. Is `defaultPrevented: true`? (if yes → something blocking scroll)
3. What's the `target` element? (is it always the intended scroll container?)

---

### Targeted Fix Candidates

#### Fix A: Centralized Wheel Handler
```typescript
// Create single source of truth for wheel events
const useScrollWheel = () => {
  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Priority: User input over animations
      if (isScrollAnimating.current) {
        cancelScrollAnimation();
      }

      // Let browser handle natural scroll
      // Only intervene if custom behavior needed
    };

    container.addEventListener('wheel', handleWheel, { passive: true });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);
};
```

#### Fix B: Disable Smooth Scroll During User Input
```typescript
const handleNavigate = useCallback((sectionId: SectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    // Use instant scroll, add custom smooth animation via CSS/JS
    element.scrollIntoView({ behavior: 'auto', block: 'start' });

    // Or implement custom smooth scroll that respects wheel input:
    smoothScrollTo(element, { interruptible: true });
  }
}, []);
```

#### Fix C: Event Priority System
```typescript
class ScrollEventManager {
  private isUserScrolling = false;
  private userScrollTimeout?: number;

  handleWheel(e: WheelEvent) {
    // User input gets highest priority
    this.isUserScrolling = true;
    clearTimeout(this.userScrollTimeout);

    // Cancel any programmatic scrolling
    this.cancelProgrammaticScroll();

    // Reset after user stops scrolling
    this.userScrollTimeout = window.setTimeout(() => {
      this.isUserScrolling = false;
    }, 150);
  }

  programmaticScroll(target: HTMLElement) {
    // Only scroll if user isn't actively scrolling
    if (!this.isUserScrolling) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
```

---

## Testing Checklist

### Before Fix
- [ ] Document current wheel behavior (video recording)
- [ ] Test on multiple devices (mouse, trackpad, Magic Mouse)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Measure: How many wheel turns are ignored? (failure rate)

### After Fix
- [ ] Verify every wheel turn registers
- [ ] Test during smooth scroll animation (should interrupt)
- [ ] Test with overlays visible (should work through them)
- [ ] Performance check: No jank or lag
- [ ] Regression: Navigation buttons still work?

---

## Expected Resolution Timeline

| Phase | Duration | Priority |
|-------|----------|----------|
| Diagnostic (Quick) | 15 min | P0 |
| Event Listener Audit | 30 min | P0 |
| Implement Fix A/B/C | 1-2 hours | P0 |
| Cross-browser Testing | 30 min | P1 |
| Edge Case Testing | 30 min | P1 |
| **Total** | **3-4 hours** | - |

---

## Success Criteria

✅ **Wheel Responsiveness**: 100% of wheel inputs register immediately
✅ **No Conflicts**: Wheel works during all app states (scrolling, animating, overlays)
✅ **Cross-browser**: Consistent behavior Chrome/Firefox/Safari
✅ **Cross-device**: Mouse wheel + trackpad both responsive
✅ **No Regressions**: Smooth scroll navigation, animations still work

---

## Related Files to Investigate

**High Priority**:
- `src/App.tsx` (navigation handler)
- `src/effects/implementations/MotionBlurEffect.ts` (wheel listener)
- `src/hooks/useScrollAnimation.tsx` (scroll management)

**Medium Priority**:
- `src/hooks/useTouchGestures.ts` (touch/scroll coordination)
- `src/hooks/useSimpleScrollCoordination.ts` (section coordination)
- `src/components/layout/SpatialSection.tsx` (section scroll)

**Low Priority**:
- All components with `addEventListener('wheel')` or `addEventListener('scroll')`

---

## Notes for Implementation

1. **Preserve Performance**: Don't sacrifice animation smoothness for wheel responsiveness
2. **Respect User Preferences**: `prefers-reduced-motion` should still work
3. **Mobile First**: Ensure touch scrolling unaffected
4. **Accessibility**: Keyboard navigation (arrow keys, space, page up/down) must still work

---

**Investigation Owner**: Nino Chavez
**Next Step**: Run Quick Diagnostic (15 min)
**Update Plan**: After diagnostic results available
