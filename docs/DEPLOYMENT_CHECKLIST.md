# Portfolio Deployment Checklist

## Pre-Deployment Smoke Test (90 seconds)

Before deploying any updates to the portfolio, manually verify these 4 critical interactions:

### 1. Canvas Layout Navigation
```
URL: http://localhost:3000/?layout=canvas

Test: Click "About" section button
✓ Expected: About section content appears (NOT blank canvas)
✗ Fail: Black screen or content off-screen
```

### 2. Canvas Panning
```
Test: Click and drag anywhere on canvas
✓ Expected: Canvas pans smoothly at 60fps (no jitter or stutter)
✗ Fail: Movement feels choppy, content jumps, or position freezes
```

### 3. Text Selection
```
Test: Triple-click any paragraph to select text
✓ Expected: Text highlights and can be copied (no pan triggered)
✗ Fail: Canvas moves instead of selecting text, or both happen
```

### 4. All Sections Render
```
Test: Use arrow keys or minimap to visit each section
✓ Expected: All 6 sections show content (Capture, Focus, Frame, Exposure, Develop, Portfolio)
✗ Fail: Any section shows blank/missing content
```

---

## If Any Test Fails

1. **DO NOT DEPLOY** - Fix the issue first
2. Check console for errors: Open DevTools → Console tab
3. Review recent changes: `git diff HEAD~1`
4. Reference bug fixes: See `docs/archive/CANVAS_QUALITY_FRAMEWORK.md` for common issues

---

## Traditional Layout Smoke Test (30 seconds)

```
URL: http://localhost:3000/

Test: Scroll through all sections
✓ Expected: All sections visible and transitions smooth
✓ Expected: Navigation buttons work
✓ Expected: CTA buttons clickable
```

---

## Deployment Commands

After passing checklist:

```bash
# Build production bundle
npm run build

# Preview production build locally (optional)
npm run preview

# Deploy to production
[your deployment command here]
```

---

## Historical Context

This checklist exists because we previously shipped 4 critical canvas bugs despite having 20+ unit tests:
- Blank canvas on section navigation (position calculation bug)
- Jittery panning (momentum direction bug)
- Content jitter during drag (CSS transition conflict)
- Position jumping on outside clicks (event handler scope bug)

**Lesson**: For a static portfolio, manual smoke testing catches visual/interaction bugs faster and more reliably than automated test suites.

Full bug analysis: `docs/archive/CANVAS_QUALITY_FRAMEWORK.md`
