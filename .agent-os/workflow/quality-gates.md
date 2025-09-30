# Quality Gates Reference

**Purpose:** Complete reference for all quality gates and validation criteria
**Last Updated:** 2025-09-30
**Status:** Active - Strictly Enforced

---

## Quality Gate Overview

Quality gates are **automated, blocking validations** that enforce architectural invariants. Features cannot be completed or deployed if any gate fails.

### Gate Types

**Blocking Gates (Must Pass):**
1. TypeScript Compilation
2. Test Coverage (>90%)
3. Accessibility (WCAG AAA)
4. Performance (60fps, bundle size)
5. Architecture Consistency

**Warning Gates (Should Pass):**
1. Code Complexity
2. Bundle Size Per Component
3. Documentation Completeness

---

## Gate 1: TypeScript Compilation

**Enforces:** Type safety, no `any` types
**Agent:** Built-in TypeScript compiler
**Blocking:** Yes

### Validation Criteria

```bash
# Command
npx tsc --noEmit

# Success criteria
Exit code: 0
Errors: 0
Warnings: 0 (strict mode)

# Failure criteria
Any TypeScript errors
Use of `any` types without justification
Missing type definitions
```

### Common Violations

```typescript
// ❌ VIOLATION: Using 'any'
const handleClick = (event: any) => { ... };

// ✅ CORRECT: Proper typing
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => { ... };

// ❌ VIOLATION: Implicit any
const getData = (id) => { ... };

// ✅ CORRECT: Explicit types
const getData = (id: string): Promise<Data> => { ... };
```

### Exit Criteria

- ✅ Zero TypeScript errors
- ✅ No `any` types (or justified exceptions)
- ✅ All imports resolved
- ✅ Strict mode enabled

---

## Gate 2: Test Coverage

**Enforces:** >90% coverage with meaningful tests
**Agent:** test-coverage-guardian
**Blocking:** Yes

### Validation Criteria

```bash
# Command
npm run test:coverage

# Success criteria
Overall coverage: >90%
Canvas components: >95%
CursorLens: >90%
Hooks: >90%
Utils: >95%

Test categories present:
- Unit tests: >50
- Integration tests: >10
- E2E tests: >5
- Accessibility tests: >20
- Performance tests: >15
```

### Coverage Thresholds

```javascript
// vitest.config.ts
coverage: {
  thresholds: {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90,
    'components/canvas/**': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95
    }
  }
}
```

### Test Quality Requirements

**✅ REQUIRED: Tests User Behavior**
```typescript
it('navigates to section when clicked', async () => {
  render(<CursorLens />);
  await userEvent.click(screen.getByRole('button', { name: /focus/i }));
  expect(screen.getByTestId('canvas-position')).toHaveTextContent(/x: 600/);
});
```

**❌ FORBIDDEN: Tests Implementation**
```typescript
it('updates state', () => {
  const [val, setVal] = useState(false);
  setVal(true);
  expect(val).toBe(true); // Tests React, not our code
});
```

### Exit Criteria

- ✅ Coverage thresholds met
- ✅ All test categories present
- ✅ Tests validate user behavior
- ✅ No smoke tests or shallow coverage

---

## Gate 3: Accessibility (WCAG AAA)

**Enforces:** WCAG AAA compliance
**Agent:** accessibility-validator
**Blocking:** Yes

### Validation Criteria

```bash
# Commands
npm run test:a11y
npm run test:axe

# Success criteria
WCAG AAA violations: 0
Keyboard navigation: 100%
Screen reader support: 100%
Color contrast: 7:1 minimum
Focus indicators: Visible
```

### Accessibility Checklist

**Keyboard Navigation:**
- [ ] All interactive elements keyboard accessible
- [ ] Logical tab order
- [ ] Enter/Space activation
- [ ] Escape key support (modals)
- [ ] No keyboard traps

**Screen Reader:**
- [ ] Descriptive ARIA labels
- [ ] Live region announcements
- [ ] Semantic HTML elements
- [ ] Alternative text for images

**Visual:**
- [ ] Color contrast 7:1 (normal text)
- [ ] Color contrast 4.5:1 (large text)
- [ ] Visible focus indicators (3px minimum)
- [ ] No invisible outlines

**Motion:**
- [ ] Prefers-reduced-motion respected
- [ ] Animations stoppable
- [ ] No flashing content

### Common Violations

```typescript
// ❌ VIOLATION: No keyboard support
<div onClick={handleClick}>Click me</div>

// ✅ CORRECT: Full keyboard support
<button
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  aria-label="Navigate to Focus section"
>
  Focus
</button>

// ❌ VIOLATION: Missing ARIA label
<button><svg /></button>

// ✅ CORRECT: Descriptive label
<button aria-label="Close modal"><svg /></button>

// ❌ VIOLATION: No focus indicator
button:focus { outline: none; }

// ✅ CORRECT: Visible focus
button:focus-visible {
  outline: 3px solid var(--focus-color);
  outline-offset: 2px;
}
```

### Exit Criteria

- ✅ 0 WCAG AAA violations
- ✅ Keyboard navigation 100% functional
- ✅ Screen reader support complete
- ✅ Color contrast 7:1 minimum
- ✅ Focus indicators visible
- ✅ Reduced motion supported

---

## Gate 4: Performance

**Enforces:** 60fps, bundle size budgets
**Agent:** performance-budget-enforcer
**Blocking:** Yes

### Validation Criteria

```bash
# Commands
npm run test:performance
npm run build:analyze

# Success criteria
Frame rate: 60fps (min 58fps)
Frame time: <16.67ms
Bundle size: <500KB total
Component size: <15KB per component
Memory growth: <50MB per session
Leaks: 0
```

### Performance Budgets

**Frame Rate:**
- Target: 60fps
- Minimum: 58fps (allows 2fps variance)
- Maximum frame time: 16.67ms

**Bundle Size:**
- Total: <500KB gzipped
- Per canvas component: <15KB gzipped
- Per utility: <5KB gzipped
- Per hook: <3KB gzipped

**Memory:**
- Maximum growth per session: 50MB
- Maximum total: 150MB
- Leak detection: 0 leaks

**Network:**
- Initial load: <2s on 3G
- Time to interactive: <3s
- First contentful paint: <1s

### Performance Requirements

**✅ REQUIRED: GPU Acceleration**
```typescript
const style = {
  transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
  willChange: isAnimating ? 'transform' : 'auto'
};
```

**❌ FORBIDDEN: CPU-bound**
```typescript
const style = {
  transform: `translateX(${x}px) translateY(${y}px)`,
  position: 'absolute',
  top: y,
  left: x  // Causes layout thrashing
};
```

**✅ REQUIRED: RequestAnimationFrame**
```typescript
const animate = useCallback(() => {
  updatePosition();
  if (isAnimating) {
    rafIdRef.current = requestAnimationFrame(animate);
  }
}, [isAnimating]);

useEffect(() => {
  if (isAnimating) {
    rafIdRef.current = requestAnimationFrame(animate);
  }
  return () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
  };
}, [isAnimating, animate]);
```

**❌ FORBIDDEN: setInterval/setTimeout**
```typescript
setInterval(() => animate(), 16); // NO!
```

### Common Violations

```typescript
// ❌ VIOLATION: Importing entire library
import * as _ from 'lodash'; // +72KB

// ✅ CORRECT: Tree-shakeable import
import { debounce } from 'lodash-es'; // +2KB

// ❌ VIOLATION: Missing cleanup
useEffect(() => {
  const rafId = requestAnimationFrame(animate);
  window.addEventListener('resize', handleResize);
  // Missing cleanup!
}, []);

// ✅ CORRECT: Proper cleanup
useEffect(() => {
  const rafId = requestAnimationFrame(animate);
  window.addEventListener('resize', handleResize);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', handleResize);
  };
}, [animate]);
```

### Exit Criteria

- ✅ Frame rate: 60fps maintained
- ✅ Bundle size: Within budgets
- ✅ Memory: No leaks, <50MB growth
- ✅ GPU acceleration: translate3d used
- ✅ Animations: RequestAnimationFrame used
- ✅ Cleanup: All effects include cleanup

---

## Gate 5: Architecture Consistency

**Enforces:** Architectural invariants
**Agents:** canvas-architecture-guardian, photography-metaphor-validator
**Blocking:** Yes

### Validation Criteria

**State Management:**
```bash
# Check for violations
grep -r "useState.*canvas\|position\|scale" components/
# Expected: 0 matches (all state in UnifiedGameFlowContext)
```

**Photography Metaphor:**
```bash
# Check component naming
find components/ -type f -name "*.tsx" | \
  grep -E "canvas|lightbox" | \
  grep -v -E "Camera|Lens|Shutter|Focus|Aperture"
# Expected: 0 matches (all use photography terms)
```

**GPU Acceleration:**
```bash
# Check for non-accelerated transforms
grep -r "translateX\|translateY" components/ | grep -v "translate3d"
# Expected: 0 matches (all use translate3d)
```

### Architecture Checklist

**State Management:**
- [ ] UnifiedGameFlowContext used for all canvas state
- [ ] No separate useState/useReducer for canvas state
- [ ] No local refs for position/scale

**Photography Metaphor:**
- [ ] Component names use camera terminology
- [ ] Function names use photography verbs
- [ ] Type definitions align with photography concepts
- [ ] User-facing text uses photography language

**Performance Standards:**
- [ ] GPU-accelerated transforms (translate3d)
- [ ] Hardware acceleration (willChange)
- [ ] RequestAnimationFrame for animations
- [ ] Proper cleanup in useEffect

**Pattern Consistency:**
- [ ] Follows established canvas patterns
- [ ] No duplicate functionality
- [ ] Aligns with architectural invariants

### Exit Criteria

- ✅ State management through UnifiedGameFlowContext
- ✅ Photography metaphor terminology used
- ✅ GPU-accelerated transforms
- ✅ Pattern consistency maintained
- ✅ No architectural drift detected

---

## Quality Gate Execution

### Execution Order

```
Feature Implementation Complete
  ↓
1. TypeScript Compilation ← First (fastest)
  ↓ (pass)
2. Test Coverage Guardian ← Second (validates tests exist)
  ↓ (pass)
3. Accessibility Validator ← Third (validates UX)
  ↓ (pass)
4. Performance Budget Enforcer ← Fourth (validates performance)
  ↓ (pass)
5. Architecture Consistency ← Fifth (validates patterns)
  ↓ (pass)
Feature Ready for Deployment ✅
```

### Failure Handling

**On Gate Failure:**

```
1. Agent identifies violation
2. Agent provides fix guidance
3. Agent applies fix (if straightforward)
4. Agent re-runs failed gate
5. Agent continues if passes

If 3 fix attempts fail:
  - Agent escalates to human
  - Agent provides detailed violation report
  - Agent suggests manual intervention
```

### Parallel vs Sequential

**Parallel (during implementation):**
- Photography metaphor validation
- TypeScript type checking
- Architecture pattern matching

**Sequential (quality gates):**
- TypeScript compilation
- Test coverage
- Accessibility
- Performance
- Architecture consistency

**Why different?**
- Parallel: Catch issues early during coding
- Sequential: Avoid wasted work on dependent validations

---

## Reporting Format

### Success Report

```
✅ All Quality Gates Passed

Feature: Category Filtering with Mobile Touch Support
Component: components/FilterBar.tsx

Gate Results:
1. TypeScript Compilation: ✅ PASSED (0 errors)
2. Test Coverage: ✅ PASSED (94.5% - target: 90%)
3. Accessibility: ✅ PASSED (0 WCAG AAA violations)
4. Performance: ✅ PASSED (60fps, 12.3KB bundle)
5. Architecture: ✅ PASSED (all invariants satisfied)

Metrics:
- Coverage: 94.5% (target: 90%)
- FPS: 60fps (target: 60fps)
- Bundle: 12.3KB (budget: 15KB)
- Accessibility: WCAG AAA compliant
- Memory: 0 leaks detected

Feature Ready for Integration ✅
```

### Failure Report

```
❌ Quality Gate Failures

Feature: Category Filtering
Component: components/FilterBar.tsx

Failed Gates: 2 of 5

1. Test Coverage: ❌ FAILED
   - Coverage: 82.3% (Required: 90%)
   - Missing: Error handling tests
   - Action: Add 15 tests for uncovered lines

2. Accessibility: ❌ FAILED
   - Violations: 3 WCAG AAA issues
   - Issue 1: No keyboard handler on filter button
   - Issue 2: Missing ARIA label
   - Issue 3: Low contrast ratio (5.2:1, required: 7:1)
   - Action: Fix violations before proceeding

Passed Gates: 3 of 5
3. TypeScript: ✅ PASSED
4. Performance: ✅ PASSED
5. Architecture: ✅ PASSED

Cannot proceed until all blocking gates pass.
```

---

## Gate Configuration

### Enabling/Disabling Gates

**Global configuration:** `.agent-os/config.yml`

```yaml
quality_gates:
  typescript:
    enabled: true
    blocking: true
  tests:
    enabled: true
    blocking: true
    minimum_coverage: 90
  accessibility:
    enabled: true
    blocking: true
    wcag_level: AAA
  performance:
    enabled: true
    blocking: true
    target_fps: 60
  architecture:
    enabled: true
    blocking: true
```

### Per-Feature Overrides

```bash
# Skip specific gate (not recommended)
/implement-feature --skip-gate=bundle_size

# Run in audited mode (more checkpoints)
/implement-feature --mode=audited

# Verbose output
/implement-feature --verbose
```

**Note:** Overrides are temporary and do not modify config file.

---

## Summary

**5 Blocking Quality Gates:**
1. **TypeScript** - Type safety, no `any`
2. **Test Coverage** - >90% with meaningful tests
3. **Accessibility** - WCAG AAA compliance
4. **Performance** - 60fps, bundle budgets
5. **Architecture** - Pattern consistency, invariants

**All gates must pass for feature completion.**

**Violations block deployment automatically.**

**This is how we maintain quality at speed.**