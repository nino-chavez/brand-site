# Architectural Invariants

**Purpose:** Non-negotiable architectural rules that MUST NEVER be violated
**Last Updated:** 2025-09-30
**Enforcement:** Automated quality gates block violations
**Status:** Active - Strictly Enforced

---

## CRITICAL: These Rules Are Inviolable

Violations of these invariants will **automatically block** feature completion. No exceptions.

---

## 1. State Management Invariant

### Rule: UnifiedGameFlowContext is the Single Source of Truth

```typescript
// ✅ REQUIRED: All canvas state through context
import { useUnifiedCanvas } from '@/contexts/UnifiedGameFlowContext';

const Component = () => {
  const { state, actions } = useUnifiedCanvas();
  // Use state.canvas.* and actions.canvas.*
};
```

```typescript
// ❌ FORBIDDEN: Separate state systems
const [canvasState, setCanvasState] = useState({ ... });
const canvasRef = useRef({ position: { x: 0, y: 0 } });
```

**Why:**
- Prevents state drift between components
- Ensures consistent state across system
- Enables proper state persistence
- Required for debugging and time-travel

**Validation:**
```bash
# Quality gate checks for useState/useReducer outside context
grep -r "useState.*canvas\|position\|scale" components/
# Must return 0 matches (all state in context)
```

**Automatic Block:** Feature cannot be marked complete if separate state detected

---

## 2. Performance Invariant

### Rule: 60fps MUST Be Maintained

```typescript
// ✅ REQUIRED: GPU-accelerated transforms
const style = {
  transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
  willChange: isAnimating ? 'transform' : 'auto'
};
```

```typescript
// ❌ FORBIDDEN: CPU-bound positioning
const style = {
  transform: `translateX(${x}px) translateY(${y}px)`, // No GPU
  position: 'absolute',
  top: y,
  left: x  // Causes layout thrashing
};
```

**Why:**
- Core user experience requirement
- Portfolio demonstrates technical excellence
- Performance IS the feature

**Validation:**
```typescript
// Automated performance test
it('maintains 60fps during transitions', async () => {
  const metrics = await measureCanvasPerformance();
  expect(metrics.fps).toBeGreaterThanOrEqual(60);
  expect(metrics.frameTime).toBeLessThan(16.67);
});
```

**Automatic Block:** Feature cannot deploy if FPS < 60 detected

---

## 3. Accessibility Invariant

### Rule: WCAG AAA Compliance MUST Be Achieved

```typescript
// ✅ REQUIRED: Full keyboard support
<button
  onClick={handleClick}
  onKeyDown={handleKeyDown}  // Enter and Space
  role="button"
  aria-label="Navigate to focus section"
  tabIndex={0}
>
```

```typescript
// ❌ FORBIDDEN: Mouse-only interactions
<div onClick={handleClick}>  // No keyboard support
  <div />
</div>
```

**Why:**
- Ethical responsibility
- Legal requirement
- Portfolio credibility
- User respect

**Validation:**
```bash
# Automated axe-core audit
npm run test:a11y
# Must return 0 WCAG AAA violations
```

**Automatic Block:** Feature cannot deploy with accessibility violations

---

## 4. Photography Metaphor Invariant

### Rule: All Components MUST Align with Camera Workflow

```typescript
// ✅ REQUIRED: Photography terminology
CameraController.tsx
LensActivation.tsx
ShutterTransition.tsx
FocusManager.tsx

interface CameraMovementProps {
  movement: 'pan-tilt' | 'zoom-in' | 'rack-focus';
  aperture: number;
  focusPoint: CanvasPosition;
}
```

```typescript
// ❌ FORBIDDEN: Generic terminology
Navigator.tsx
Scroller.tsx
ViewManager.tsx

interface NavigatorProps {
  direction: 'up' | 'down';
  speed: number;
}
```

**Why:**
- Core differentiator of portfolio
- Consistent user mental model
- Professional branding
- Memorable experience

**Validation:**
```bash
# Check component naming
find components/ -type f -name "*.tsx" | \
  grep -v -E "Camera|Lens|Shutter|Focus|Aperture|Exposure"
# Must return 0 matches in canvas-related files
```

**Automatic Block:** Components with non-photography names rejected

---

## 5. Type Safety Invariant

### Rule: TypeScript Strict Mode, No `any` Types

```typescript
// ✅ REQUIRED: Proper typing
interface CanvasPosition {
  x: number;
  y: number;
  scale: number;
}

const moveToPosition = (target: CanvasPosition): void => {
  actions.canvas.updateCanvasPosition(target);
};
```

```typescript
// ❌ FORBIDDEN: Escape hatches
const moveToPosition = (target: any): any => {  // NO
  actions.canvas.updateCanvasPosition(target as any);  // NO
};
```

**Why:**
- Prevents runtime errors
- Enables refactoring confidence
- Self-documenting code
- Catches bugs at compile time

**Validation:**
```bash
# TypeScript compilation must succeed
npx tsc --noEmit
# Exit code must be 0

# Check for 'any' types
grep -r ": any\|as any" components/ hooks/ contexts/
# Must return 0 matches
```

**Automatic Block:** TypeScript errors prevent deployment

---

## 6. Test Coverage Invariant

### Rule: >90% Coverage with Meaningful Tests

```typescript
// ✅ REQUIRED: Test user-facing behavior
it('navigates to section when clicked', async () => {
  render(<CursorLens />);

  await userEvent.click(screen.getByRole('button', { name: /focus/i }));

  expect(screen.getByTestId('canvas-position')).toHaveTextContent(/x: 600/);
});
```

```typescript
// ❌ FORBIDDEN: Useless coverage tests
it('renders', () => {
  render(<Component />);  // No assertions
});

it('updates state', () => {
  const [val, setVal] = useState(false);
  setVal(true);
  expect(val).toBe(true);  // Tests React, not our code
});
```

**Why:**
- Confidence in refactoring
- Regression prevention
- Documentation of behavior
- Quality assurance

**Validation:**
```bash
# Coverage must meet thresholds
npm run test:coverage
# Overall: >90%
# Canvas components: >95%
# CursorLens: >90%
```

**Automatic Block:** Insufficient coverage prevents completion

---

## 7. Bundle Size Invariant

### Rule: Bundle Must Stay Under Budget

**Budgets:**
- Total bundle: <500KB gzipped
- Per canvas component: <15KB gzipped
- Per utility: <5KB gzipped

```typescript
// ✅ REQUIRED: Tree-shakeable imports
import { specificFunction } from 'library';
```

```typescript
// ❌ FORBIDDEN: Importing entire libraries
import * as _ from 'lodash';  // Imports all of lodash
```

**Why:**
- Performance on slow connections
- Mobile user experience
- Portfolio demonstrates optimization
- Cost of JavaScript

**Validation:**
```bash
# Build and analyze bundle
npm run build:analyze
# Check bundle sizes against budgets
```

**Automatic Block:** Bundle over budget prevents deployment

---

## 8. Documentation Invariant

### Rule: Public APIs MUST Be Documented

```typescript
// ✅ REQUIRED: JSDoc for public interfaces
/**
 * Moves canvas to specified position with camera movement
 *
 * @param target - Target canvas position
 * @param options - Movement options
 * @param options.movement - Type of camera movement ('pan-tilt' | 'zoom-in' | 'rack-focus')
 * @param options.duration - Animation duration in milliseconds
 * @returns Promise that resolves when movement complete
 *
 * @example
 * await moveToPosition({ x: 600, y: 400, scale: 1 }, {
 *   movement: 'rack-focus',
 *   duration: 800
 * });
 */
export const moveToPosition = (
  target: CanvasPosition,
  options: MovementOptions
): Promise<void> => {
  // Implementation
};
```

```typescript
// ❌ FORBIDDEN: Undocumented public APIs
export const moveToPosition = (target, options) => {
  // No docs
};
```

**Why:**
- Future developer understanding
- API contract clarity
- Usage examples
- Maintenance efficiency

**Validation:**
```bash
# Check for JSDoc on exported functions
eslint --rule 'require-jsdoc: error' components/
```

**Automatic Block:** Undocumented APIs prevent merge

---

## 9. Cleanup Invariant

### Rule: All Effects MUST Include Cleanup

```typescript
// ✅ REQUIRED: Proper cleanup
useEffect(() => {
  const rafId = requestAnimationFrame(animate);
  const listener = () => handleResize();

  window.addEventListener('resize', listener);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', listener);
  };
}, [animate]);
```

```typescript
// ❌ FORBIDDEN: Missing cleanup
useEffect(() => {
  const rafId = requestAnimationFrame(animate);
  window.addEventListener('resize', handleResize);
  // Missing cleanup!
}, []);
```

**Why:**
- Prevents memory leaks
- Avoids zombie listeners
- Ensures proper unmounting
- System stability

**Validation:**
```typescript
// Automated memory leak test
it('cleans up on unmount', () => {
  const { unmount } = render(<Component />);

  const initialListeners = getEventListenerCount();
  unmount();
  const finalListeners = getEventListenerCount();

  expect(finalListeners).toBeLessThanOrEqual(initialListeners);
});
```

**Automatic Block:** Memory leaks prevent deployment

---

## 10. Architecture Consistency Invariant

### Rule: Follow Established Patterns

```typescript
// ✅ REQUIRED: Match existing patterns
// If useCanvasAnimation exists, use it
const { animateToPosition } = useCanvasAnimation();

// If CameraController pattern exists, follow it
<CameraController
  movement="rack-focus"
  target={targetPosition}
/>
```

```typescript
// ❌ FORBIDDEN: Inventing new patterns
// Don't create new animation system
const [isAnimating, setIsAnimating] = useState(false);
// When useCanvasAnimation already exists

// Don't create new controller pattern
<NewNavigator direction="left" />
// When CameraController pattern established
```

**Why:**
- Code consistency
- Reduced cognitive load
- Easier maintenance
- Pattern recognition

**Validation:**
```
Automated pattern checker:
- Scans for duplicate functionality
- Flags new patterns that duplicate existing
- Requires justification for pattern deviation
```

**Automatic Block:** Architectural drift flagged for review

---

## Quality Gate Enforcement

### Blocking Gates (Must Pass)

1. **TypeScript Compilation**
   ```bash
   npx tsc --noEmit
   # Exit code 0 required
   ```

2. **Test Suite**
   ```bash
   npm run test:run
   # All tests must pass
   # Coverage >90%
   ```

3. **Performance Validation**
   ```bash
   npm run test:performance
   # 60fps maintained
   # Frame time <16.67ms
   ```

4. **Accessibility Audit**
   ```bash
   npm run test:a11y
   # 0 WCAG AAA violations
   ```

5. **Bundle Size Check**
   ```bash
   npm run build:analyze
   # Within budget limits
   ```

6. **Linting**
   ```bash
   npm run lint
   # 0 errors
   ```

### Warning Gates (Should Pass)

1. **Code Complexity**
   - Cyclomatic complexity <10 per function
   - File length <500 lines

2. **Documentation**
   - JSDoc on public APIs
   - README updates for new features

3. **Architectural Drift**
   - Pattern consistency check
   - No duplicate functionality

---

## Violation Response

### Automatic Actions

**If Invariant Violated:**
1. Quality gate **blocks** progress
2. Agent **must fix** before continuing
3. Detailed error message provided
4. Suggested fixes offered

**Example:**
```
❌ Performance Invariant Violated

Issue: Canvas frame time exceeds 16.67ms (measured: 24.3ms)
Location: components/LightboxCanvas.tsx:145

Required: 60fps (16.67ms per frame)
Measured: 41fps (24.3ms per frame)

Suggested Fixes:
1. Use translate3d for GPU acceleration (currently using translateX/Y)
2. Move expensive calculations outside render loop
3. Use useMemo for transform calculations

Blocking: Cannot mark feature complete until fixed
```

---

## Override Process (Rare Exceptions)

**If invariant must be violated** (extremely rare):

1. **Document Exception:**
   ```markdown
   ## Architectural Exception: [DATE]

   **Invariant Violated:** [Which invariant]
   **Reason:** [Why violation necessary]
   **Alternatives Considered:** [What else was tried]
   **Mitigation:** [How risk is reduced]
   **Approval:** [Human approval required]
   **Temporary:** [Timeline for resolution]
   ```

2. **Add Technical Debt Ticket:**
   ```markdown
   # Technical Debt: Resolve [Invariant] Violation

   **Created:** [DATE]
   **Priority:** HIGH
   **Resolution Timeline:** [Specific date]
   ```

3. **Require Human Approval:**
   - Agent cannot override automatically
   - Human must explicitly approve exception
   - Exception logged for audit

---

## Invariant Evolution

### When to Update Invariants

Invariants can only be updated when:
1. Business requirements change fundamentally
2. Better patterns discovered with evidence
3. Technology constraints shift
4. All existing code would violate new invariant

### Update Process

1. Propose change with rationale
2. Assess impact on existing code
3. Create migration plan
4. Update all documentation
5. Communicate to team
6. Implement with deprecation period

---

## Summary: The Non-Negotiables

1. **State Management** - UnifiedGameFlowContext only
2. **Performance** - 60fps maintained always
3. **Accessibility** - WCAG AAA compliance required
4. **Photography Metaphor** - Camera terminology mandatory
5. **Type Safety** - No `any` types allowed
6. **Test Coverage** - >90% with meaningful tests
7. **Bundle Size** - Stay within budgets
8. **Documentation** - Public APIs documented
9. **Cleanup** - All effects include cleanup
10. **Pattern Consistency** - Follow established patterns

**These invariants define the architectural foundation. They are not suggestions—they are requirements.**

**Violations block deployment. No exceptions without explicit human approval.**

---

**This document encodes the architectural boundaries within which agents operate autonomously. Stay within these boundaries, and speed is maximized. Violate them, and progress blocks immediately.**