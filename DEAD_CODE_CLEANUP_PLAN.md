# Dead Code Cleanup Plan

**Date**: 2025-10-10
**Related**: ARCHITECTURE_AUDIT.md, DEAD_CODE_FOUND.md

---

## Verified Dead Code in `/src/components/layout/`

All files below were checked via:
```bash
grep -r "import.*{FileName}" src/ components/ --include="*.ts" --include="*.tsx"
```

### 1. ❌ GallerySection.tsx
- **Import Count**: 0 (only self-references and stories)
- **Reason**: Replaced by `DevelopSection.tsx` in `/components/sections/`
- **Size**: Unknown
- **Action**: Delete

### 2. ❌ InsightsSection.tsx
- **Import Count**: 0
- **Reason**: Legacy section, no longer part of 6-section architecture
- **Size**: Unknown
- **Action**: Delete

### 3. ❌ ReelSection.tsx
- **Import Count**: 0
- **Reason**: Legacy section, no longer part of 6-section architecture
- **Size**: Unknown
- **Action**: Delete

### 4. ❌ SpatialSection.tsx
- **Import Count**: 0
- **Reason**: Legacy experimental section
- **Size**: Unknown
- **Action**: Delete

### 5. ❌ SectionOrchestrator.tsx
- **Import Count**: 0
- **Reason**: Replaced by layout-specific containers (SimplifiedGameFlowContainer, CanvasPortfolioLayout, FramerTimelineLayout)
- **Size**: Unknown
- **Action**: Delete

### 6. ❌ ViewfinderErrorBoundary.tsx
- **Import Count**: 0
- **Reason**: Replaced by error handling in UnifiedGameFlowContext
- **Size**: Unknown
- **Action**: Delete

---

## Files to KEEP in `/src/components/layout/`

### ✅ Header.tsx
- **Used by**: All 3 layouts (App.tsx lines 316, 468)
- **Purpose**: Global navigation header
- **Action**: KEEP

### ✅ MobileBottomNav.tsx
- **Used by**: Traditional layout (App.tsx line 479)
- **Purpose**: Mobile thumb-zone navigation
- **Action**: KEEP

### ✅ Section.tsx
- **Used by**: Section components as wrapper
- **Purpose**: Reusable section wrapper with consistent styling
- **Action**: KEEP

### ✅ ViewfinderOverlay.tsx
- **Used by**: Section components (e.g., PortfolioSection.tsx line 461)
- **Purpose**: Camera viewfinder effect overlay
- **Action**: KEEP

---

## Deletion Commands

```bash
# Navigate to project root
cd /Users/nino/Workspace/02-local-dev/sites/nino-chavez-site

# Delete dead code files
git rm src/components/layout/GallerySection.tsx
git rm src/components/layout/GallerySection.stories.tsx
git rm src/components/layout/InsightsSection.tsx
git rm src/components/layout/InsightsSection.stories.tsx
git rm src/components/layout/ReelSection.tsx
git rm src/components/layout/ReelSection.stories.tsx
git rm src/components/layout/SpatialSection.tsx
git rm src/components/layout/SectionOrchestrator.tsx
git rm src/components/layout/SectionOrchestrator.stories.tsx
git rm src/components/layout/ViewfinderErrorBoundary.tsx
git rm src/components/layout/ViewfinderErrorBoundary.stories.tsx

# Commit
git commit -m "chore: remove legacy dead code from src/components/layout

Removed 6 legacy section components never imported by any layout:
- GallerySection.tsx (replaced by DevelopSection)
- InsightsSection.tsx (not in 6-section architecture)
- ReelSection.tsx (not in 6-section architecture)
- SpatialSection.tsx (experimental, unused)
- SectionOrchestrator.tsx (replaced by layout containers)
- ViewfinderErrorBoundary.tsx (replaced by UnifiedGameFlowContext)

Verified via import analysis - zero references found.

Related: DEAD_CODE_FOUND.md, ARCHITECTURE_AUDIT.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
git push
```

---

## Expected Results

**Before**:
```
/src/components/layout/
├── ContactSection.tsx               ❌ DELETED (c7c83c1)
├── ContactSection.stories.tsx       ❌ DELETED (c7c83c1)
├── GallerySection.tsx               ❌ TO DELETE
├── GallerySection.stories.tsx       ❌ TO DELETE
├── Header.tsx                       ✅ KEEP
├── InsightsSection.tsx              ❌ TO DELETE
├── InsightsSection.stories.tsx      ❌ TO DELETE
├── MobileBottomNav.tsx              ✅ KEEP
├── ReelSection.tsx                  ❌ TO DELETE
├── ReelSection.stories.tsx          ❌ TO DELETE
├── Section.tsx                      ✅ KEEP
├── Section.stories.tsx              ✅ KEEP
├── SectionOrchestrator.tsx          ❌ TO DELETE
├── SectionOrchestrator.stories.tsx  ❌ TO DELETE
├── SpatialSection.tsx               ❌ TO DELETE
├── ViewfinderErrorBoundary.tsx      ❌ TO DELETE
├── ViewfinderErrorBoundary.stories.tsx ❌ TO DELETE
├── ViewfinderOverlay.tsx            ✅ KEEP
├── ViewfinderOverlay.stories.tsx    ✅ KEEP
└── WorkSection.stories.tsx          ⚠️  TO VERIFY
```

**After**:
```
/src/components/layout/
├── Header.tsx                       ✅ Global navigation
├── MobileBottomNav.tsx              ✅ Mobile nav
├── Section.tsx                      ✅ Section wrapper
├── Section.stories.tsx              ✅ Storybook
├── ViewfinderOverlay.tsx            ✅ Camera overlay
├── ViewfinderOverlay.stories.tsx    ✅ Storybook
└── WorkSection.stories.tsx          ⚠️  TO VERIFY
```

**Files Deleted**: 11 (ContactSection + 10 legacy files)
**Space Saved**: TBD (estimate: 5,000+ lines)

---

## Risk Assessment

### Low Risk ✅
All files verified with zero imports outside of:
- Self-references
- Storybook stories (also being deleted)
- Git history
- Documentation

### Verification Steps
Before deletion, double-check:
```bash
# For each file, verify zero imports
./scripts/find-dead-code.sh

# Manual verification
grep -r "import.*GallerySection" src/ components/ --include="*.tsx"
grep -r "import.*InsightsSection" src/ components/ --include="*.tsx"
grep -r "import.*ReelSection" src/ components/ --include="*.tsx"
grep -r "import.*SpatialSection" src/ components/ --include="*.tsx"
grep -r "import.*SectionOrchestrator" src/ components/ --include="*.tsx"
grep -r "import.*ViewfinderErrorBoundary" src/ components/ --include="*.tsx"
```

All commands should return empty (zero results).

---

## Rollback Plan

If deletion causes issues:

```bash
# Restore single file
git checkout HEAD~1 -- src/components/layout/FileName.tsx

# Restore entire commit
git revert HEAD

# Force rollback (if already pushed)
git revert HEAD
git push
```

---

## Next Steps After Cleanup

1. **Run Build**: `npm run build` to verify no broken imports
2. **Run Tests**: `npm test` to verify no test failures
3. **Manual Test**: Test all 3 layouts (traditional, canvas, timeline)
4. **Update Docs**: Update ARCHITECTURE_AUDIT.md with final structure
5. **Close Issue**: Mark dead code cleanup task as complete

---

## Long-Term Improvements

After this cleanup:

1. **TypeScript Path Aliases**: Simplify imports with `@/` prefixes
2. **Pre-commit Hook**: Prevent future dead code with automated checks
3. **Directory README**: Add `/components/sections/README.md` explaining structure
4. **ADR**: Create Architecture Decision Record for multi-layout design
5. **Storybook Audit**: Review remaining `.stories.tsx` files for relevance

---

**Status**: Ready for execution
**Approval Required**: No (verified zero usage)
**Estimated Time**: 5 minutes
