# Gallery Canvas Integration Specification

> **Created:** 2025-09-29
> **Status:** Ready for Implementation
> **Phase:** Phase 3 - Content Integration & Polish
> **Effort:** Medium (1 week)
> **Priority:** High - Final Phase 3 deliverable

## Executive Summary

Integrate 27 portfolio images into the existing 'portfolio' section of the 2D canvas lightbox system, embodying the photographer's contact sheet metaphor while maintaining 60fps performance and WCAG AAA accessibility compliance.

**Core Principle:** This is a systems integration problem—adapting the existing ContentAdapter progressive disclosure architecture to image-heavy content without compromising the portfolio's core navigation principles.

---

## Problem Statement

### Current State
- ✅ 2D Canvas Layout System complete (Phase 2) with 6 sections on 3x2 grid
- ✅ 'portfolio' section exists at 10 o'clock position ("Results & showcase")
- ✅ ContentAdapter system supports progressive disclosure (PREVIEW → SUMMARY → DETAILED → TECHNICAL)
- ✅ 27 portfolio images exist at `/public/images/gallery/portfolio-00.jpg` through `portfolio-26.jpg`
- ❌ Images not integrated into canvas navigation system
- ❌ No structured gallery viewing experience
- ❌ Photography portfolio lacks actual photography showcase

### Desired State
- ✅ Gallery embedded within 'portfolio' section maintaining 3x2 grid
- ✅ Contact sheet grid appears when zoomed into portfolio section
- ✅ Individual images viewable in modal overlay with navigation
- ✅ Full metadata display (EXIF, categories, project context)
- ✅ 60fps performance maintained with lazy loading strategy
- ✅ Mobile-optimized touch navigation
- ✅ Full keyboard/screen reader accessibility

---

## User Stories

### Story 1: Gallery Discovery via Canvas Navigation
**As a** portfolio visitor exploring the lightbox canvas
**I want to** discover the photography gallery through the natural canvas zoom interaction
**So that** I can view portfolio images without disrupting the spatial navigation experience

**Acceptance Criteria:**
- WHEN user navigates to 'portfolio' section on canvas overview, THEN system SHALL display single representative thumbnail with "Gallery" indicator
- WHEN user zooms into 'portfolio' section, THEN system SHALL reveal contact sheet grid of all 27 images within 800ms
- WHEN contact sheet grid loads, THEN system SHALL maintain 60fps canvas performance
- WHEN user hovers over thumbnail in contact sheet, THEN system SHALL display subtle backlit glow effect (photographer's lightbox metaphor)

**Definition of Done:**
- [ ] Portfolio section displays gallery thumbnail at overview zoom level
- [ ] Contact sheet grid loads progressively when section is zoomed
- [ ] Performance metrics confirm 60fps maintained during grid reveal
- [ ] Hover effects implemented with hardware acceleration
- [ ] Zero layout shift during grid loading

---

### Story 2: Image Viewing with Modal Overlay
**As a** portfolio visitor viewing the contact sheet
**I want to** click/tap an image to view it in full screen with context
**So that** I can appreciate the photography without losing my place in the portfolio

**Acceptance Criteria:**
- WHEN user clicks/taps thumbnail in contact sheet, THEN system SHALL open modal overlay with full image within 300ms
- WHEN modal opens, THEN system SHALL maintain canvas context behind semi-transparent backdrop
- WHEN image loads in modal, THEN system SHALL display next/previous navigation controls
- WHEN user presses Escape or clicks backdrop, THEN system SHALL close modal and return to contact sheet
- WHEN modal is open, THEN system SHALL prevent canvas scrolling/navigation

**Definition of Done:**
- [ ] Modal overlay component created with backdrop blur
- [ ] Image loading with progressive enhancement (blur-up placeholder)
- [ ] Navigation controls (prev/next arrows, close button)
- [ ] Keyboard shortcuts (←→ for nav, Esc to close)
- [ ] Touch gestures (swipe for nav, tap backdrop to close)
- [ ] ARIA labels for all interactive elements

---

### Story 3: Image Metadata and Technical Context
**As a** technical recruiter or photography client
**I want to** view camera settings, categories, and project context for each image
**So that** I can understand the technical skill and range of work

**Acceptance Criteria:**
- WHEN user views image in modal, THEN system SHALL display metadata panel (EXIF, camera settings, project context)
- WHEN metadata panel is visible, THEN system SHALL show camera body, lens, ISO, aperture, shutter speed
- WHEN user toggles "Technical Details", THEN system SHALL reveal full EXIF data and post-processing notes
- WHEN user filters by category, THEN system SHALL update contact sheet to show only matching images

**Definition of Done:**
- [ ] Metadata JSON structure created for all 27 images
- [ ] Metadata panel component with progressive disclosure
- [ ] Category filtering system in contact sheet view
- [ ] EXIF parsing and display formatting
- [ ] Screen reader announces metadata when expanded

---

### Story 4: Mobile Gallery Experience
**As a** mobile visitor viewing the portfolio
**I want to** navigate the gallery using touch gestures
**So that** I can explore photography naturally on my device

**Acceptance Criteria:**
- WHEN user views contact sheet on mobile, THEN system SHALL display responsive grid (2 columns on phone, 3 on tablet)
- WHEN user swipes left/right in modal, THEN system SHALL navigate to prev/next image with smooth transition
- WHEN user pinches image in modal, THEN system SHALL zoom into image preserving aspect ratio
- WHEN user double-taps image, THEN system SHALL toggle between fit-to-screen and 1:1 pixel view

**Definition of Done:**
- [ ] Responsive grid layout for contact sheet (mobile/tablet/desktop)
- [ ] Touch gesture handlers (swipe, pinch, double-tap)
- [ ] Smooth transitions between images (<300ms)
- [ ] Zoom state management with bounds constraints
- [ ] Performance testing on iOS Safari and Android Chrome

---

### Story 5: Accessibility and Keyboard Navigation
**As a** screen reader user or keyboard-only navigator
**I want to** access the gallery without a mouse
**So that** I can explore the portfolio independently

**Acceptance Criteria:**
- WHEN user tabs into portfolio section, THEN system SHALL announce "Gallery with 27 images, press Enter to view"
- WHEN user presses Enter on gallery thumbnail, THEN system SHALL open contact sheet with focus on first image
- WHEN user arrows through contact sheet, THEN system SHALL move focus between thumbnails with visual indicator
- WHEN user presses Enter on thumbnail, THEN system SHALL open modal with full image and announce image alt text
- WHEN screen reader reads metadata, THEN system SHALL announce categories, settings, and context in logical order

**Definition of Done:**
- [ ] Full keyboard navigation implemented (Tab, Enter, Arrow keys, Escape)
- [ ] ARIA labels for all gallery components (grid, thumbnails, modal, controls)
- [ ] Focus management maintains logical tab order
- [ ] Screen reader testing with VoiceOver and NVDA
- [ ] High contrast mode support for thumbnail borders

---

## Technical Specifications

### Architecture Integration

#### ContentAdapter Extension for Gallery
```typescript
// types/content-adapters.ts extension
export interface GalleryContentAdapter extends BaseContentAdapter {
  type: 'gallery';

  // Gallery-specific content levels
  content: {
    PREVIEW: {
      thumbnailUrl: string;
      imageCount: number;
      featuredImages: string[]; // 3-6 representative images
    };
    SUMMARY: {
      contactSheetGrid: GalleryImage[];
      categories: string[];
      gridLayout: 'masonry' | 'uniform';
    };
    DETAILED: {
      fullResImages: GalleryImage[];
      metadata: ImageMetadata[];
      filtering: CategoryFilter[];
    };
    TECHNICAL: {
      exifData: ExifData[];
      processingNotes: string[];
      equipmentList: CameraEquipment[];
    };
  };

  // Performance configuration
  loadingStrategy: 'lazy' | 'progressive' | 'eager';
  qualityTiers: {
    thumbnail: ImageQuality;
    preview: ImageQuality;
    full: ImageQuality;
  };
}

export interface GalleryImage {
  id: string;
  filename: string;
  alt: string;
  category: string[];
  thumbnail: string;
  preview: string;
  full: string;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  camera: string;
  lens: string;
  iso: number;
  aperture: string;
  shutterSpeed: string;
  focalLength: string;
  dateTaken: string;
  location?: string;
  projectContext?: string;
  tags: string[];
}
```

#### Modal Overlay Component
```typescript
// components/GalleryModal.tsx
export interface GalleryModalProps {
  isOpen: boolean;
  currentImage: GalleryImage;
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  showMetadata: boolean;
  onToggleMetadata: () => void;
}

// Features:
// - Semi-transparent backdrop with canvas visible behind
// - Hardware-accelerated image transitions
// - Lazy loading of adjacent images (preload n±1)
// - Keyboard shortcuts (←→, Esc, M for metadata)
// - Touch gestures (swipe, pinch-zoom)
// - ARIA live region for image changes
```

#### Contact Sheet Component
```typescript
// components/ContactSheetGrid.tsx
export interface ContactSheetGridProps {
  images: GalleryImage[];
  columns: number; // responsive: 2 (mobile), 3 (tablet), 4-5 (desktop)
  onImageSelect: (image: GalleryImage, index: number) => void;
  activeCategory?: string;
  layout: 'masonry' | 'uniform';
  performanceMode: QualityLevel;
}

// Features:
// - Intersection Observer for lazy loading
// - Virtual scrolling for 27+ images
// - Category filtering with smooth transitions
// - Hover effects (backlit glow, scale transform)
// - Keyboard navigation (arrow keys, Enter)
```

### Performance Strategy

#### Image Optimization Pipeline
1. **Source images** at `/public/images/gallery/portfolio-NN.jpg`
2. **Generate responsive sizes:**
   - Thumbnail: 300x200 WebP (~30KB)
   - Preview: 800x600 WebP (~100KB)
   - Full: 1920x1280 WebP (~300KB)
   - Fallback: JPEG versions for Safari <14
3. **Lazy loading thresholds:**
   - Contact sheet: Load thumbnails when section zoomed (Intersection Observer)
   - Modal: Preload current + adjacent images (±1)
   - Full resolution: Load on demand when zoomed in modal

#### Performance Budget
- **Contact sheet initial load:** <500ms for 27 thumbnails
- **Modal open:** <300ms to display full image
- **Image navigation:** <200ms transition between images
- **Canvas performance:** Maintain 60fps during gallery interactions
- **Memory target:** <50MB additional heap for all gallery assets

### Data Structure

#### gallery-metadata.json
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-09-29",
  "images": [
    {
      "id": "portfolio-00",
      "filename": "portfolio-00.jpg",
      "alt": "Action sports photography - skateboarder mid-air trick",
      "categories": ["action-sports", "skateboarding"],
      "metadata": {
        "camera": "Canon EOS R5",
        "lens": "RF 24-70mm f/2.8",
        "iso": 400,
        "aperture": "f/4.0",
        "shutterSpeed": "1/1000",
        "focalLength": "50mm",
        "dateTaken": "2024-08-15",
        "location": "Venice Beach Skatepark",
        "projectContext": "Action sports portfolio - capturing dynamic movement",
        "tags": ["skateboarding", "action", "outdoor", "sports"]
      }
    }
    // ... 26 more images
  ],
  "categories": [
    { "id": "action-sports", "label": "Action Sports", "count": 18 },
    { "id": "technical", "label": "Technical Work", "count": 9 }
  ]
}
```

---

## Implementation Approach

### Phase 1: Foundation (Days 1-2)
1. Create `GalleryContentAdapter` extending ContentAdapter system
2. Generate `gallery-metadata.json` with all 27 images
3. Implement image optimization pipeline (WebP generation)
4. Create base `ContactSheetGrid` component with lazy loading

### Phase 2: Core Gallery Experience (Days 3-4)
5. Build `GalleryModal` component with navigation
6. Integrate with 'portfolio' section zoom trigger
7. Implement keyboard shortcuts and touch gestures
8. Add metadata panel with progressive disclosure

### Phase 3: Polish & Optimization (Days 5-6)
9. Performance testing and optimization (60fps validation)
10. Accessibility testing (keyboard, screen reader)
11. Mobile responsive layout refinement
12. Cross-browser testing (Safari, Chrome, Firefox)

### Phase 4: Testing & Documentation (Day 7)
13. E2E testing with Playwright
14. Performance budget validation
15. Accessibility audit (WCAG AAA)
16. Documentation and handoff

---

## Success Metrics

### Performance Targets
- ✅ Contact sheet loads in <500ms
- ✅ Modal opens in <300ms
- ✅ 60fps maintained during all interactions
- ✅ Memory usage <50MB additional heap
- ✅ Lighthouse Performance score >90

### Accessibility Compliance
- ✅ WCAG AAA compliance maintained
- ✅ Full keyboard navigation support
- ✅ Screen reader tested with VoiceOver and NVDA
- ✅ High contrast mode support
- ✅ Focus indicators on all interactive elements

### User Experience Validation
- ✅ Gallery discoverable through natural canvas navigation
- ✅ Images viewable on all device sizes
- ✅ Metadata accessible and informative
- ✅ No disruption to existing canvas navigation
- ✅ Photography metaphor reinforced (contact sheet aesthetic)

---

## Constraints & Considerations

### Technical Constraints
- Must maintain existing 3x2 canvas grid (no new sections)
- Must preserve 60fps performance with 27 additional images
- Must support browsers with WebP (fallback to JPEG)
- Must work with existing touch gesture system
- Must integrate with ContentAdapter progressive disclosure

### Design Constraints
- Must embody "photographer's lightbox" metaphor
- Must not occlude other canvas content
- Must maintain athletic design token consistency
- Must preserve zero-occlusion CursorLens navigation
- Must support both light and dark mode

### Accessibility Constraints
- Must maintain WCAG AAA compliance
- Must support keyboard-only navigation
- Must provide descriptive alt text for all images
- Must announce state changes to screen readers
- Must support high contrast mode

---

## Dependencies

### System Dependencies
- ✅ Completed Phase 2: 2D Canvas Layout System
- ✅ ContentAdapter progressive disclosure system
- ✅ 'portfolio' section exists on canvas
- ✅ CursorLens navigation system
- ✅ Mobile touch gesture handlers
- ✅ Performance monitoring infrastructure

### Asset Dependencies
- ✅ 27 portfolio images at `/public/images/gallery/`
- ❌ Image metadata (EXIF, categories, context) - **TO BE CREATED**
- ❌ Optimized WebP versions - **TO BE GENERATED**
- ❌ Thumbnail and preview sizes - **TO BE GENERATED**

### Development Dependencies
- React 19.1.1 with TypeScript
- Vite build system
- Existing canvas utilities and hooks
- Testing infrastructure (Vitest, Playwright)

---

## Risk Assessment

### High Risk
- **Performance degradation with 27 images:** Mitigate with aggressive lazy loading and virtual scrolling
- **Mobile memory constraints:** Limit concurrent image loading, use lower quality on mobile

### Medium Risk
- **EXIF parsing complexity:** Use existing libraries (exif-js, piexifjs), validate output
- **Cross-browser WebP support:** Provide JPEG fallbacks for Safari <14
- **Touch gesture conflicts:** Careful event handling to prevent canvas pan/zoom conflicts

### Low Risk
- **Modal z-index conflicts:** Canvas modal system already established
- **Keyboard focus management:** Follow existing CursorLens patterns
- **Category filtering complexity:** Simple array filtering with memoization

---

## Open Questions

1. **Image categories:** Are all 27 images action sports, or is there a mix? (Assumption: Mixed, categorize during metadata creation)
2. **EXIF availability:** Do source images contain EXIF data, or needs manual entry? (Assumption: Manual entry acceptable)
3. **Future scalability:** Plan for >27 images? (Assumption: JSON structure supports unlimited scaling)

---

## Appendix

### Related Documentation
- Phase 2 Spec: `.agent-os/specs/2025-09-27-2d-canvas-layout-system/spec.md`
- ContentAdapter Spec: `.agent-os/specs/2025-09-28-section-content-optimization/spec.md`
- Roadmap: `.agent-os/product/roadmap.md` (Phase 3, line 100-101)

### Reference Implementations
- Existing ContentAdapter: `components/content-adapters/AboutContentAdapter.tsx`
- Canvas zoom trigger: `components/LightboxCanvas.tsx`
- Modal patterns: `components/SimplifiedGameFlowContainer.tsx`

---

**Spec Version:** 1.0.0
**Last Updated:** 2025-09-29
**Next Review:** After Phase 1 implementation (Day 2)