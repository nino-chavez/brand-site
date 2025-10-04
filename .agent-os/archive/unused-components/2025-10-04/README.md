# Archived Unused Components - October 4, 2025

## Reason for Archival

These Hero section components were **not rendered in any active layout mode** and were causing maintenance confusion.

## Components Archived

1. **HeroSection.tsx** - Legacy hero component
2. **HeroSection.stories.tsx** - Storybook story
3. **CleanHeroSection.tsx** - Alternative hero component
4. **CleanHeroSection.stories.tsx** - Storybook story

## Layout Component Mapping (Current)

### Traditional Layout (Default)
- Hero → `components/sections/CaptureSection.tsx` ✓

### Canvas Layout
- Hero → `components/canvas/CanvasPortfolioLayout.tsx` ✓

### Timeline Layout
- Hero → `components/timeline/CanvasTimelineLayout.tsx` ✓

## What Happened

During content updates on October 4, 2025, we updated **HeroSection.tsx** with new "What I Build When Nobody's Watching" positioning, but users reported not seeing the changes.

**Root Cause**: We updated the wrong component. Traditional layout (the default) renders **CaptureSection.tsx**, not HeroSection.tsx.

These components were:
- Only imported by Storybook stories
- Never rendered in production
- Creating maintenance confusion
- ~1000 lines of unused code

## Restoration Instructions

If needed, restore these components with:

```bash
git mv .agent-os/archive/unused-components/2025-10-04/HeroSection.tsx src/components/layout/
git mv .agent-os/archive/unused-components/2025-10-04/HeroSection.stories.tsx src/components/layout/
git mv .agent-os/archive/unused-components/2025-10-04/CleanHeroSection.tsx src/components/layout/
git mv .agent-os/archive/unused-components/2025-10-04/CleanHeroSection.stories.tsx src/components/layout/
```

## Related Documentation

- See `PROJECT_CLEANUP_AUDIT.md` for full audit report
- See `CONTENT_ARCHITECTURE_ANALYSIS.md` for content update investigation
