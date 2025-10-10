# Section Naming Analysis & Standardization Proposal

**Date**: 2025-10-10
**Purpose**: Make section names self-documenting for developers/agents unfamiliar with photography metaphor

---

## Current Naming (Photography Metaphor)

| Current Name | Actual Content | Confusion Risk | Standard Alternative |
|--------------|----------------|----------------|---------------------|
| `CaptureSection` | Hero / Introduction | **HIGH** - "Capture" is vague | `HeroSection` or `IntroSection` |
| `FocusSection` | About / Biography | **HIGH** - "Focus" unclear | `AboutSection` or `BioSection` |
| `FrameSection` | Projects / Case Studies | **MEDIUM** - "Frame" ambiguous | `ProjectsSection` or `WorkSection` |
| `ExposureSection` | Skills / Tech Stack | **HIGH** - "Exposure" unclear | `SkillsSection` or `TechStackSection` |
| `DevelopSection` | Gallery / Photography | **MEDIUM** - "Develop" vague | `GallerySection` or `PhotographySection` |
| `PortfolioSection` | Contact / Get in Touch | **MEDIUM** - Expected showcase | `ContactSection` or `ConnectSection` |

---

## Problem Statement

### Current Issues
1. **Photography Metaphor Not Self-Documenting**
   - Requires knowledge of photography workflow: Capture → Focus → Frame → Exposure → Develop → Portfolio
   - New developers/agents cannot infer content from component name
   - Example: "Why is AboutSection called FocusSection?"

2. **Inconsistency with Industry Standards**
   - Most portfolios use: Hero, About, Projects, Skills, Gallery, Contact
   - Our naming creates unnecessary cognitive load

3. **Real-World Incident**
   - ContactSection.tsx existed in `/src/components/layout/` (dead code)
   - PortfolioSection.tsx in `/components/sections/` was the actual contact section
   - Naming mismatch led to editing wrong file → 30 min wasted

### Why the Metaphor Exists
Looking at the code structure and game flow design, the photography metaphor is intentional and clever:
- **Thematic Cohesion**: Portfolio combines enterprise architecture + action sports photography
- **Narrative Flow**: Guides user through photographer's process as storytelling device
- **Brand Differentiation**: Unique compared to generic "Hero, About, Projects" structure

**BUT**: The metaphor is user-facing, not developer-facing.

---

## Solution: Dual Naming Strategy

### Option A: Rename Files (Breaking Change)
**Pros**: Crystal clear, industry standard, self-documenting
**Cons**: Breaks existing imports, requires refactor across 3 layouts

### Option B: Add Type Aliases (Non-Breaking)
**Pros**: No breaking changes, gradual migration, backward compatible
**Cons**: Maintains dual naming system, doesn't solve root issue

### Option C: Rename + Migration Script (RECOMMENDED)
**Pros**: Clean result, automated migration, one-time disruption
**Cons**: Requires thorough testing of all 3 layouts

---

## RECOMMENDED: Option C - Rename with Migration

### Step 1: Create Mapping

```typescript
// BEFORE (photography metaphor)
CaptureSection.tsx  → Hero / Introduction
FocusSection.tsx    → About / Biography
FrameSection.tsx    → Projects / Case Studies
ExposureSection.tsx → Skills / Tech Stack
DevelopSection.tsx  → Gallery / Photography
PortfolioSection.tsx → Contact / Get in Touch

// AFTER (self-documenting)
HeroSection.tsx     → Hero / Introduction
AboutSection.tsx    → About / Biography
ProjectsSection.tsx → Projects / Case Studies
SkillsSection.tsx   → Skills / Tech Stack
GallerySection.tsx  → Gallery / Photography
ContactSection.tsx  → Contact / Get in Touch
```

### Step 2: Update TypeScript Types

```typescript
// src/types/index.ts - BEFORE
export type SectionId = 'capture' | 'focus' | 'frame' | 'exposure' | 'develop' | 'portfolio';

// src/types/index.ts - AFTER
export type SectionId = 'hero' | 'about' | 'projects' | 'skills' | 'gallery' | 'contact';

// Alternative: Maintain both with deprecation
export type LegacySectionId = 'capture' | 'focus' | 'frame' | 'exposure' | 'develop' | 'portfolio';
export type SectionId = 'hero' | 'about' | 'projects' | 'skills' | 'gallery' | 'contact';
```

### Step 3: Update Section IDs in HTML

```typescript
// BEFORE
<section id="capture" data-section="capture">
<section id="focus" data-section="focus">
<section id="frame" data-section="frame">
<section id="exposure" data-section="exposure">
<section id="develop" data-section="develop">
<section id="portfolio" data-section="portfolio">

// AFTER
<section id="hero" data-section="hero">
<section id="about" data-section="about">
<section id="projects" data-section="projects">
<section id="skills" data-section="skills">
<section id="gallery" data-section="gallery">
<section id="contact" data-section="contact">
```

### Step 4: Update Navigation

```typescript
// src/constants.ts - BEFORE
export const SECTIONS = [
    { id: 'capture', title: 'Capture' },
    { id: 'focus', title: 'Focus' },
    { id: 'frame', title: 'Frame' },
    { id: 'exposure', title: 'Exposure' },
    { id: 'develop', title: 'Develop' },
    { id: 'portfolio', title: 'Portfolio' },
];

// src/constants.ts - AFTER (IDs change, titles optional)
export const SECTIONS = [
    { id: 'hero', title: 'Capture' },        // Keep photography metaphor in UI
    { id: 'about', title: 'Focus' },
    { id: 'projects', title: 'Frame' },
    { id: 'skills', title: 'Exposure' },
    { id: 'gallery', title: 'Develop' },
    { id: 'contact', title: 'Portfolio' },
];
```

---

## Alternative: Keep Metaphor, Add Comments

If renaming is too disruptive, document extensively:

```typescript
/**
 * CaptureSection - Hero / Introduction
 *
 * Photography metaphor: "Capture" the visitor's attention with introduction
 * Actual content: Hero section with tagline, CTA, value proposition
 *
 * Used by:
 * - Traditional layout (SimplifiedGameFlowContainer)
 * - Canvas layout (CanvasPortfolioLayout)
 * - Timeline layout (FramerTimelineLayout)
 */
export const CaptureSection = () => { ... }
```

And create mapping file:

```typescript
// src/types/section-mapping.ts
/**
 * Section Name Mapping - Photography Metaphor to Standard Terms
 *
 * Our sections use photography workflow metaphors. For clarity:
 */
export const SECTION_MAPPING = {
  capture: {
    fileName: 'CaptureSection.tsx',
    standardName: 'Hero Section',
    content: 'Introduction, tagline, primary CTA',
    metaphor: 'Capture the moment (capture attention)'
  },
  focus: {
    fileName: 'FocusSection.tsx',
    standardName: 'About Section',
    content: 'Biography, professional background, expertise',
    metaphor: 'Focus on the story (focus on the person)'
  },
  frame: {
    fileName: 'FrameSection.tsx',
    standardName: 'Projects Section',
    content: 'Case studies, technical work, achievements',
    metaphor: 'Frame the shot (frame the work)'
  },
  exposure: {
    fileName: 'ExposureSection.tsx',
    standardName: 'Skills Section',
    content: 'Technical stack, tools, expertise areas',
    metaphor: 'Exposure settings (expose capabilities)'
  },
  develop: {
    fileName: 'DevelopSection.tsx',
    standardName: 'Gallery Section',
    content: 'Photography portfolio, visual work',
    metaphor: 'Develop the image (develop the portfolio)'
  },
  portfolio: {
    fileName: 'PortfolioSection.tsx',
    standardName: 'Contact Section',
    content: 'Contact form, social links, CTA',
    metaphor: 'Portfolio delivery (deliver the connection)'
  }
} as const;
```

---

## Migration Script (if renaming)

```bash
#!/bin/bash
# scripts/rename-sections.sh

echo "🔄 Renaming section files..."

# Create backup branch
git checkout -b refactor/standardize-section-names

# Rename files (git mv preserves history)
git mv components/sections/CaptureSection.tsx components/sections/HeroSection.tsx
git mv components/sections/FocusSection.tsx components/sections/AboutSection.tsx
git mv components/sections/FrameSection.tsx components/sections/ProjectsSection.tsx
git mv components/sections/ExposureSection.tsx components/sections/SkillsSection.tsx
git mv components/sections/DevelopSection.tsx components/sections/GallerySection.tsx
git mv components/sections/PortfolioSection.tsx components/sections/ContactSection.tsx

# Update imports in all files
find src components -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/CaptureSection/HeroSection/g' \
  -e 's/FocusSection/AboutSection/g' \
  -e 's/FrameSection/ProjectsSection/g' \
  -e 's/ExposureSection/SkillsSection/g' \
  -e 's/DevelopSection/GallerySection/g' \
  -e 's/PortfolioSection/ContactSection/g' \
  {} +

# Update section IDs
find src components -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/'capture'/'hero'/g" \
  -e "s/'focus'/'about'/g" \
  -e "s/'frame'/'projects'/g" \
  -e "s/'exposure'/'skills'/g" \
  -e "s/'develop'/'gallery'/g" \
  -e "s/'portfolio'/'contact'/g" \
  {} +

echo "✅ Files renamed and imports updated"
echo "⚠️  Manual review required for:"
echo "  - src/types/index.ts (SectionId type)"
echo "  - src/constants.ts (SECTIONS array)"
echo "  - Navigation titles (preserve photography metaphor in UI)"
```

---

## Impact Analysis

### Files Affected (renaming approach)

1. **Section Components** (6 files):
   - `/components/sections/*.tsx` - rename all 6 files

2. **Layout Containers** (3 files):
   - `src/components/sports/SimplifiedGameFlowContainer.tsx` - update imports
   - `src/components/canvas/CanvasPortfolioLayout.tsx` - update imports
   - `src/components/timeline/FramerTimelineLayout.tsx` - update imports

3. **Type Definitions** (2 files):
   - `src/types/index.ts` - update `SectionId` type
   - `src/types/unified-gameflow.ts` - update section references

4. **Constants** (1 file):
   - `src/constants.ts` - update section IDs (can keep titles for UI)

5. **Contexts** (1 file):
   - `src/contexts/UnifiedGameFlowContext.tsx` - update section logic

6. **Tests** (unknown count):
   - All test files referencing sections

**Estimated Files**: 20-30 files
**Estimated Time**: 2-3 hours (with testing)

---

## RECOMMENDATION

### Short Term (This Session)
**Add Documentation** - Keep current names, add comprehensive comments

```typescript
// components/sections/README.md
```

Create a README explaining:
1. Photography metaphor rationale
2. Mapping to standard terms
3. Which file contains what content

### Medium Term (Next Sprint)
**Evaluate Rename** - Discuss with team whether:
1. Photography metaphor is worth maintaining for developers
2. User-facing titles can stay the same while code changes
3. Migration effort is justified by clarity gains

### Long Term (Future)
**Consider Hybrid** - Standard file names + photography UI labels:
- Files: `HeroSection.tsx`, `AboutSection.tsx`, etc.
- Navigation: "Capture", "Focus", "Frame", etc. (user-facing)
- Best of both worlds: clear code, creative UX

---

## Rollback Plan (if renaming)

```bash
# If migration fails
git checkout main
git branch -D refactor/standardize-section-names

# If merged but causes issues
git revert <commit-sha>
```

---

## Questions for Decision

1. **Is the photography metaphor essential to the brand?**
   - If YES: Keep names, add docs
   - If NO: Rename for clarity

2. **How often do new developers/agents work on this codebase?**
   - Frequently: Prioritize clarity (rename)
   - Rarely: Current naming acceptable

3. **Is user-facing navigation tied to file names?**
   - YES: Hybrid approach (standard files, creative labels)
   - NO: Full rename is safe

---

**Status**: Analysis complete, awaiting decision
**Next Step**: Choose approach (Document vs Rename vs Hybrid)
**Recommendation**: Add comprehensive docs NOW, consider rename in next refactor cycle
