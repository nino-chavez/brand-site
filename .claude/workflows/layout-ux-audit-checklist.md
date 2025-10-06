# Layout & UX Audit Checklist

## Purpose
Prevent layout failures by systematically checking space utilization, readability, and responsive behavior.

## Why This Exists
**Failure Case**: About section had `max-w-[65ch]` causing aggressive text wrapping with 40%+ unused whitespace. Multiple audits missed this because they focused on superficial issues (emojis) instead of fundamental UX.

## Critical Layout Checks

### 1. Space Utilization Analysis

**What to Check:**
```bash
# Find all max-width constraints
grep -r "max-w-\[.*ch\]|max-w-prose|max-w-2xl|max-w-3xl" \
  --include="*.tsx" \
  --include="*.ts" \
  src/ components/
```

**Red Flags:**
- Content constrained to <70ch on wide viewports (>1200px)
- Excessive whitespace (>30%) next to text content
- Fixed max-width in responsive grid columns
- Content not utilizing available grid space

**Questions to Ask:**
1. Is this constraint intentional for readability?
2. Does it cause wrapping on normal desktop screens?
3. Is there excessive unused whitespace?
4. Does content scale properly at different viewports?

### 2. Text Readability Metrics

**Optimal Line Length:**
- **Body text**: 50-75 characters (not enforced below 1200px width)
- **Headings**: Can be wider, should break naturally
- **Lists**: Should use available space, not wrap aggressively

**Anti-Patterns:**
- `max-w-[65ch]` on content that has available width
- Prose constraints in grid layouts
- Fixed character limits in responsive designs

### 3. Viewport-Specific Validation

**Desktop (1920x1080):**
- Content should use 60-70% of viewport width
- Whitespace should be intentional, not accidental
- Text should wrap at natural breakpoints

**Tablet (768-1024px):**
- Content should expand to use available width
- No artificial constraints causing early wrapping

**Mobile (<768px):**
- Full-width content is acceptable
- Padding/margins for breathing room

### 4. Grid Layout Checks

```bash
# Find grid layouts
grep -r "grid-cols-" --include="*.tsx" src/ components/
```

**Validate:**
- Grid columns utilize assigned space (e.g., `col-span-3` shouldn't have `max-w-2xl`)
- Content fills grid cell, doesn't artificially constrain
- Responsive breakpoints make sense

## Automated Checks

### Whitespace Ratio Analysis
```typescript
// Pseudo-code for automated check
function analyzeWhitespaceRatio(component: string) {
  const viewportWidth = 1920;
  const contentWidth = measureRenderedWidth(component);
  const whitespaceRatio = (viewportWidth - contentWidth) / viewportWidth;

  if (whitespaceRatio > 0.4) {
    throw new Error(`Excessive whitespace: ${whitespaceRatio * 100}%`);
  }
}
```

### Screenshot Comparison
- Capture at 1920x1080, 1440x900, 1024x768
- Measure content-to-viewport ratio
- Flag if text wraps with >30% whitespace remaining

## Manual Review Checklist

For each major content section:

- [ ] **Space Utilization**: Content uses available width effectively
- [ ] **Readability**: Line length appropriate for viewport size
- [ ] **Responsive**: Constraints adjust or remove at smaller screens
- [ ] **Grid Alignment**: Content fills assigned grid columns
- [ ] **Whitespace**: Intentional, not excessive/accidental
- [ ] **Typography**: Headings/body scale properly
- [ ] **Visual Balance**: Content doesn't look "cramped" or "lost"

## Common Issues & Fixes

### Issue: Text wrapping with excessive whitespace
```tsx
// ❌ BAD
<div className="lg:col-span-3 max-w-[65ch]">
  <p>Long paragraph text...</p>
</div>

// ✅ GOOD - Remove constraint, let grid handle width
<div className="lg:col-span-3">
  <p>Long paragraph text...</p>
</div>
```

### Issue: Prose constraints in layouts
```tsx
// ❌ BAD - Prose constraint in grid
<div className="grid lg:grid-cols-2">
  <div className="max-w-prose">Content</div>
</div>

// ✅ GOOD - Let grid control width
<div className="grid lg:grid-cols-2">
  <div>Content</div>
</div>
```

### Issue: Fixed widths on responsive content
```tsx
// ❌ BAD
<div className="w-[600px]">Content</div>

// ✅ GOOD - Responsive width
<div className="w-full max-w-3xl">Content</div>
```

## Integration with Audit Agents

### UX-UI-Auditor Agent Prompt Addition
```
5. LAYOUT ANALYSIS:
   - Measure content-to-viewport ratio at 1920x1080
   - Flag sections with >35% whitespace next to text
   - Check for max-width constraints in grid layouts
   - Verify responsive behavior at 1440px, 1024px, 768px
   - Report line length vs available width
```

### Screenshot Test Enhancement
```typescript
// Add to visual regression tests
test('content utilizes available space', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const contentWidth = await page.locator('.about-content').boundingBox();
  const viewportWidth = 1920;
  const utilizationRatio = contentWidth.width / viewportWidth;

  expect(utilizationRatio).toBeGreaterThan(0.55); // At least 55% usage
});
```

## Prevention

### ESLint Rule (Future)
```javascript
// Warn about prose constraints in grid layouts
{
  "no-prose-in-grid": "warn",
  "max-width-validation": {
    "allowedContexts": ["standalone", "centered"],
    "forbiddenContexts": ["grid-column", "flex-item"]
  }
}
```

### Pre-commit Hook
```bash
# Check for suspicious width constraints
if git diff --cached | grep -E "max-w-\[(4|5|6)[0-9]ch\]"; then
  echo "⚠️  Warning: Detected potentially restrictive max-width constraint"
  echo "   Review if this causes aggressive wrapping"
fi
```

## Success Criteria

A layout passes audit when:
1. ✅ Content uses 55-70% of viewport width at 1920px
2. ✅ No artificial wrapping with >30% whitespace
3. ✅ Max-width constraints are intentional and documented
4. ✅ Responsive behavior tested at 3+ breakpoints
5. ✅ Grid layouts fill assigned column space

---

**Created**: 2025-10-05
**Triggered By**: About section `max-w-[65ch]` causing aggressive wrapping
**Status**: Active - integrate into all UX audits
