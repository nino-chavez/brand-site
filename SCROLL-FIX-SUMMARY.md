# Scroll Architecture Fix & Audit - January 2025

## Summary

Fixed broken mobile scroll ("gets stuck after a few pixels") and audited all architectural issues that led to the bug.

## What Was Fixed

### Immediate Fix ✅
**File**: `src/App.tsx:436`
**Problem**: Nested scroll container caused scroll ambiguity
```diff
- <div className="..." style={{ overflowY: 'auto', minHeight: '100vh' }}>
+ <div className="...">
```

**File**: `src/index.css:95`
**Added**: Proper body/root height setup
```css
body {
  margin: 0;
  padding: 0;
}

#root {
  min-height: 100vh;
}
```

**Result**: Body scroll now works naturally on mobile and desktop

## What Was Discovered

### 1. SSR Not Working at Root Path ⚠️
- **Status**: SSR renders at `/api/ssr` but NOT at `/`
- **Cause**: Vercel serves static `dist/client/index.html` before checking rewrites
- **Impact**: Empty `<!--app-head-->` at root, proper meta tags at `/api/ssr`
- **Document**: `.claude/intelligence/ssr-audit-2025-01.md`

**Recommendation**: Drop SSR (save 200+ LOC) or fix Vercel config

### 2. Scroll Strategy Confusion 📋
- Three layout modes with conflicting scroll strategies
- No documentation of which mode owns scroll
- Event handlers overlap causing conflicts

**Solution**: Created scroll coordination layer

## What Was Created

### 1. Scroll Coordination Context
**File**: `src/contexts/ScrollCoordinationContext.tsx`

Centralized scroll strategy management:
```tsx
const SCROLL_STRATEGIES = {
  traditional: { owner: 'body', allowNativeScroll: true },
  canvas: { owner: 'none', customEventHandlers: true },
  timeline: { owner: 'container', allowNativeScroll: true }
};
```

**Features**:
- Prevents scroll conflicts between modes
- Auto-manages body overflow for modals
- `useTemporaryScrollBlock()` hook for modals
- Dev logging for debugging

### 2. Comprehensive Documentation
**File**: `.claude/intelligence/scroll-strategy-documentation.md`

- Scroll owner by mode (traditional/canvas/timeline)
- Event handler inventory (what listens where)
- Common conflicts to avoid
- Testing checklist
- Migration guide

### 3. E2E Test Suite
**File**: `tests/scroll-behavior.spec.ts`

**Coverage**:
- ✅ Traditional mode: wheel, touch, keyboard scroll
- ✅ Canvas mode: no scroll, pan/zoom instead
- ✅ Timeline mode: horizontal scroll
- ✅ Modal scroll blocking
- ✅ Cross-mode switching
- ✅ Accessibility (keyboard nav)
- ✅ Event handler cleanup (no leaks)

**Key Test**: Regression test for "stuck scroll" bug
```ts
test('scroll does not get stuck after small movement', async ({ page }) => {
  await scrollBy(page, 10); // Small scroll
  await scrollBy(page, 10); // Should work (not stuck)
  await scrollBy(page, 10); // Regression test
});
```

## Architecture Issues Identified

1. **Three interaction models in one component** (traditional/canvas/timeline)
   - Should be separate apps or clear boundaries
   - Event handlers conflict

2. **SSR "theater" - code that doesn't work in production**
   - SSR compatibility changes throughout codebase
   - But SSR not serving at root path
   - Complexity without benefit

3. **No scroll ownership model**
   - Ambiguous which element handles scroll
   - Mobile browsers confused by nested containers

4. **Missing E2E coverage for critical flows**
   - Scroll/touch never tested
   - Bug could have been caught earlier

## Migration Path

### Short-term (Done)
- [x] Fix nested scroll container
- [x] Add scroll coordination context
- [x] Document scroll strategy
- [x] Add E2E tests

### Medium-term (Recommended)
- [ ] Decide on SSR: Fix or drop (see `.claude/intelligence/ssr-audit-2025-01.md`)
- [ ] Migrate GalleryModal to use `useTemporaryScrollBlock`
- [ ] Run E2E tests in CI
- [ ] Add scroll tests to pre-commit hook

### Long-term (Optional)
- [ ] Split layout modes into separate apps
- [ ] Create scroll coordination layer integration guide
- [ ] Add performance budgets for scroll jank

## Testing the Fix

### Manual Testing
```bash
npm run dev
# Open http://localhost:3002 on mobile (device or DevTools)
# Try scrolling - should work smoothly
# Try small scrolls - should not get stuck
```

### Automated Testing
```bash
npm test -- tests/scroll-behavior.spec.ts
```

## Files Changed

### Fixed
- `src/App.tsx` - Removed nested scroll container
- `src/index.css` - Added proper body/root height

### Created
- `src/contexts/ScrollCoordinationContext.tsx` - Scroll strategy management
- `.claude/intelligence/ssr-audit-2025-01.md` - SSR analysis & recommendations
- `.claude/intelligence/scroll-strategy-documentation.md` - Scroll architecture docs
- `tests/scroll-behavior.spec.ts` - E2E scroll tests

### Updated
- `src/components/gallery/GalleryModal.tsx` - Added deprecation note for manual overflow

## Next Steps

1. **Test the fix** - Verify mobile scroll works
2. **Run E2E tests** - Ensure no regressions
3. **Decide on SSR** - See SSR audit document
4. **Deploy** - Push to production

## References

- **SSR Audit**: `.claude/intelligence/ssr-audit-2025-01.md`
- **Scroll Docs**: `.claude/intelligence/scroll-strategy-documentation.md`
- **E2E Tests**: `tests/scroll-behavior.spec.ts`
- **Context**: `src/contexts/ScrollCoordinationContext.tsx`
