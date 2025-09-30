# Gallery Canvas Integration - Architecture & Design

> **Created:** 2025-09-29
> **Status:** Ready for Implementation
> **Architecture Pattern:** Content Adapter Extension with Modal Overlay System

---

## Architecture Overview

The Gallery Canvas Integration extends the existing ContentAdapter progressive disclosure pattern to support image-heavy content within the 'portfolio' section of the 2D canvas system. This is a **systems integration problem**, not a greenfield feature—the gallery must fit seamlessly into the established canvas navigation architecture.

### Core Architectural Principles

1. **Preserve the Grid:** Maintain the existing 3x2 canvas layout by embedding gallery within the 'portfolio' section
2. **Progressive Disclosure:** Use zoom levels to reveal gallery content (overview → contact sheet → detailed image)
3. **Performance First:** Aggressive lazy loading and virtual scrolling to maintain 60fps
4. **Zero Disruption:** Gallery interactions must not interfere with canvas pan/zoom or CursorLens navigation
5. **Accessibility Continuous:** Full keyboard/screen reader support throughout

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        LightboxCanvas                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    3x2 Canvas Grid                        │  │
│  │  ┌─────┐  ┌─────┐  ┌─────┐                              │  │
│  │  │Hero │  │About│  │Skills│                             │  │
│  │  └─────┘  └─────┘  └─────┘                              │  │
│  │  ┌─────┐  ┌─────┐  ┌─────┐                              │  │
│  │  │Exp  │  │TL   │  │ Portfolio/Gallery ◄──── ZOOM IN   │  │
│  │  └─────┘  └─────┘  └───────────────────┘                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                         ZOOM TRIGGER
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ContactSheetGrid Component                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Filter: [All] [Action Sports] [Technical]             │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                   │   │
│  │  │img1│ │img2│ │img3│ │img4│ │img5│                   │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘                   │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                   │   │
│  │  │img6│ │img7│ │img8│ │img9│ │...│                    │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘                   │   │
│  │         (27 images total, lazy loaded)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                         CLICK THUMBNAIL
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GalleryModal Component                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [◄ Prev]          Image 5 of 27           [Next ►]  [✕] │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                                                  │    │   │
│  │  │           Full Resolution Image                 │    │   │
│  │  │                                                  │    │   │
│  │  │                                                  │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ 📷 Canon EOS R5 | RF 24-70mm | f/4.0 | 1/1000 │    │   │
│  │  │ ISO 400 | 50mm | Venice Beach Skatepark       │    │   │
│  │  │ [Show Technical Details ▼]                     │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│         (Semi-transparent backdrop, canvas visible behind)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. GalleryContentAdapter

**Purpose:** Extend ContentAdapter pattern to support gallery-specific progressive disclosure

**Integration Point:** `components/content-adapters/GalleryContentAdapter.tsx`

```typescript
// Architecture: Implements BaseContentAdapter interface
// Data Source: /public/data/gallery-metadata.json
// Content Levels:
//   PREVIEW:   Single gallery thumbnail (overview zoom)
//   SUMMARY:   Contact sheet grid (zoomed into section)
//   DETAILED:  Full image in modal with basic metadata
//   TECHNICAL: Full EXIF data, processing notes, equipment

interface GalleryContentAdapter extends BaseContentAdapter {
  type: 'gallery';

  // Gallery-specific state
  state: {
    currentImage: GalleryImage | null;
    filteredImages: GalleryImage[];
    activeCategory: string | null;
    isModalOpen: boolean;
  };

  // Gallery-specific actions
  actions: {
    openImage: (imageId: string) => void;
    closeModal: () => void;
    navigateImage: (direction: 'prev' | 'next') => void;
    filterByCategory: (category: string | null) => void;
  };

  // Performance configuration
  config: {
    lazyLoadThreshold: number;    // Intersection Observer threshold
    preloadAdjacent: boolean;     // Preload images at ±1 index
    qualityTier: QualityLevel;    // Adjust based on performance mode
  };
}
```

**Key Design Decisions:**
- Gallery state managed within ContentAdapter (no separate global state)
- Actions follow existing ContentAdapter patterns
- Performance configuration ties into existing QualityManager
- Filter state persists across modal open/close

---

### 2. ContactSheetGrid Component

**Purpose:** Display 27 images in responsive grid with lazy loading and filtering

**Integration Point:** `components/ContactSheetGrid.tsx`

```typescript
// Architecture: Presentational component with controlled state
// Parent: GalleryContentAdapter (via portfolio section)
// Children: ContactSheetThumbnail (27 instances, lazy loaded)

interface ContactSheetGridProps {
  images: GalleryImage[];
  columns: number;              // Responsive: 2 (mobile), 3 (tablet), 4-5 (desktop)
  onImageSelect: (image: GalleryImage, index: number) => void;
  activeCategory: string | null;
  layout: 'masonry' | 'uniform';
  performanceMode: QualityLevel;
}

// Key Features:
// - Intersection Observer for lazy loading thumbnails
// - CSS Grid for responsive layout (no JavaScript layout calculations)
// - Hardware-accelerated transforms for hover effects
// - Virtual scrolling if grid performance degrades (>27 images)
// - Smooth category filter transitions (CSS transitions)
```

**Performance Strategy:**
- **Initial Load:** Load only thumbnails in viewport (Intersection Observer)
- **Scroll:** Load thumbnails 200px before entering viewport (rootMargin)
- **Hover:** Preload preview-size image on hover (prepare for modal)
- **Memory:** Unload thumbnails that scroll out of view (keep max 15 in memory)

**Accessibility Strategy:**
- **Keyboard:** Arrow keys navigate grid (2D navigation with wrap-around)
- **Focus:** Visible focus indicator (2px blue outline, scale 1.05)
- **ARIA:** Grid role with aria-rowcount, aria-colcount
- **Screen Reader:** Announce "Image N of 27: [alt text], category [category]"

---

### 3. GalleryModal Component

**Purpose:** Full-screen image viewer with navigation and metadata

**Integration Point:** `components/GalleryModal.tsx`

```typescript
// Architecture: Modal overlay with backdrop (React Portal)
// Parent: GalleryContentAdapter
// Children: ImageViewer, NavigationControls, MetadataPanel

interface GalleryModalProps {
  isOpen: boolean;
  currentImage: GalleryImage;
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  showMetadata: boolean;
  onToggleMetadata: () => void;
}

// Key Features:
// - React Portal for z-index isolation (no canvas interference)
// - Backdrop blur effect (canvas visible behind at 0.6 opacity)
// - Progressive image loading (blur-up placeholder → full resolution)
// - Hardware-accelerated slide transitions between images
// - Touch gesture support (swipe, pinch-zoom, double-tap)
// - Keyboard shortcuts (←→, Esc, M)
```

**Z-Index Layering:**
```
Canvas (z-index: 1)
  └─ CursorLens (z-index: 30)
       └─ GalleryModal (z-index: 50)
            └─ ModalBackdrop (z-index: 49, blur + opacity)
            └─ ImageViewer (z-index: 51)
            └─ NavigationControls (z-index: 52)
            └─ MetadataPanel (z-index: 52)
```

**Performance Optimization:**
- **Image Loading:** Progressive JPEG/WebP with blur-up placeholder
- **Navigation:** Preload images at currentIndex ±1 (max 3 full images in memory)
- **Transitions:** Use CSS transforms (translateX) with GPU acceleration
- **Memory:** Unload images beyond ±2 from current index

**Accessibility Strategy:**
- **Focus Trap:** Tab loops within modal (can't tab to canvas behind)
- **Keyboard:** ←→ for navigation, Esc to close, M to toggle metadata
- **ARIA:** role="dialog", aria-modal="true", aria-labelledby
- **Screen Reader:** Announce image changes via ARIA live region

---

### 4. MetadataPanel Component

**Purpose:** Display camera settings, EXIF, and project context

**Integration Point:** `components/MetadataPanel.tsx` (child of GalleryModal)

```typescript
// Architecture: Collapsible panel with progressive disclosure
// Data Source: gallery-metadata.json (ImageMetadata)
// Disclosure Levels: SUMMARY → DETAILED → TECHNICAL

interface MetadataPanelProps {
  metadata: ImageMetadata;
  contentLevel: ContentLevel;  // SUMMARY, DETAILED, TECHNICAL
  isExpanded: boolean;
  onToggle: () => void;
}

// Content Levels:
// SUMMARY (default):
//   - Camera body and lens
//   - ISO, aperture, shutter speed
//   - Focal length
//
// DETAILED (expanded):
//   + Date taken
//   + Location
//   + Project context
//   + Tags/categories
//
// TECHNICAL (fully expanded):
//   + Full EXIF data
//   + Post-processing notes
//   + Equipment list
//   + Technical insights

// Layout Options:
// - Desktop: Sidebar panel (300px wide, right side of modal)
// - Mobile: Bottom sheet (overlay, swipe up to expand)
// - Tablet: Adaptive (sidebar on landscape, bottom sheet on portrait)
```

**Design Considerations:**
- Use athletic design tokens for visual consistency
- Subtle animations for expand/collapse (200ms ease-in-out)
- Icons for camera settings (📷 camera, 🔍 lens, ⚡ ISO, etc.)
- Copyable text for technical details (click to copy EXIF)
- High contrast mode support (ensure text/background contrast ratio >7:1)

---

## Data Architecture

### Gallery Metadata Structure

**File:** `/public/data/gallery-metadata.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-09-29",
  "images": [
    {
      "id": "portfolio-00",
      "filename": "portfolio-00.jpg",
      "alt": "Skateboarder mid-air during kickflip at Venice Beach Skatepark",
      "categories": ["action-sports", "skateboarding"],
      "urls": {
        "thumbnail": "/images/gallery/thumbs/portfolio-00.webp",
        "preview": "/images/gallery/preview/portfolio-00.webp",
        "full": "/images/gallery/full/portfolio-00.webp",
        "fallback": "/images/gallery/portfolio-00.jpg"
      },
      "metadata": {
        "camera": "Canon EOS R5",
        "lens": "RF 24-70mm f/2.8",
        "iso": 400,
        "aperture": "f/4.0",
        "shutterSpeed": "1/1000",
        "focalLength": "50mm",
        "dateTaken": "2024-08-15T14:30:00Z",
        "location": "Venice Beach Skatepark, Los Angeles, CA",
        "projectContext": "Action sports portfolio - capturing dynamic movement and athletic skill in urban environments",
        "tags": ["skateboarding", "action", "outdoor", "sports", "urban"],
        "processingNotes": "Slight contrast boost, vibrance adjustment, minor crop for composition"
      }
    }
    // ... 26 more images
  ],
  "categories": [
    { "id": "action-sports", "label": "Action Sports", "count": 18 },
    { "id": "skateboarding", "label": "Skateboarding", "count": 12 },
    { "id": "technical", "label": "Technical Work", "count": 9 }
  ]
}
```

**Data Flow:**
1. Gallery metadata loaded on portfolio section zoom (lazy load JSON)
2. Parsed into GalleryImage[] array in GalleryContentAdapter
3. Filtered by active category (if any)
4. Passed to ContactSheetGrid as props
5. Individual image metadata passed to MetadataPanel when modal opens

**Validation Strategy:**
- TypeScript interfaces validate structure at build time
- Runtime validation with Zod schema (optional, for production safety)
- JSON schema validation during metadata creation (tasks.md Task 2)

---

## Performance Architecture

### Image Loading Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Lazy Loading Pipeline                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Portfolio Section Zoom (PREVIEW → SUMMARY)                │
│         │                                                    │
│         ▼                                                    │
│  Load gallery-metadata.json (~50KB)                         │
│         │                                                    │
│         ▼                                                    │
│  Render ContactSheetGrid (thumbnails in viewport only)      │
│         │                                                    │
│         ▼                                                    │
│  Intersection Observer triggers thumbnail loads             │
│  - rootMargin: '200px' (load before entering viewport)      │
│  - threshold: 0.1 (trigger at 10% visibility)               │
│         │                                                    │
│         ▼                                                    │
│  Thumbnail Loaded (WebP, 300x200, ~30KB each)               │
│  - Blur-up placeholder (20x13, inline base64)               │
│  - Progressive JPEG for fallback                            │
│         │                                                    │
│    [User Clicks Thumbnail]                                  │
│         │                                                    │
│         ▼                                                    │
│  Modal Opens (300ms animation)                              │
│         │                                                    │
│         ▼                                                    │
│  Load Full Image (WebP, 1920x1280, ~300KB)                  │
│  - Display preview-size first (800x600, ~100KB)             │
│  - Blur-up to full resolution                               │
│         │                                                    │
│         ▼                                                    │
│  Preload Adjacent Images (currentIndex ±1)                  │
│  - Preview size only (prepare for quick navigation)         │
│  - Full size loaded on demand when navigated to             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Memory Management:**
- **Max thumbnails in memory:** 27 (all thumbnails stay loaded)
- **Max preview images:** 5 (current + ±2)
- **Max full images:** 3 (current + ±1)
- **Total memory budget:** <50MB (validated in tasks.md Task 11)

**Quality Tiers (based on CanvasQualityManager):**
- **High:** WebP full resolution (1920x1280)
- **Medium:** WebP preview (800x600)
- **Low:** JPEG thumbnail (300x200)
- **Fallback:** JPEG for browsers without WebP support

---

### Performance Monitoring Integration

```typescript
// Extend existing CanvasPerformanceMonitor for gallery metrics

interface GalleryPerformanceMetrics {
  // Contact Sheet Performance
  contactSheetRenderTime: number;      // Target: <500ms
  thumbnailLoadTime: number[];         // Per-image load times
  gridScrollFPS: number;               // Target: 60fps

  // Modal Performance
  modalOpenTime: number;               // Target: <300ms
  imageLoadTime: number;               // Target: <1000ms for full res
  navigationTime: number;              // Target: <200ms between images
  modalScrollFPS: number;              // Target: 60fps (pinch-zoom)

  // Memory Metrics
  heapSizeUsed: number;                // Target: <50MB additional
  imagesCached: number;                // Current images in memory
  thumbnailsCached: number;            // Thumbnails loaded

  // User Interaction Metrics
  imagesViewed: number;                // Images opened in modal
  navigationMethod: string[];          // ['keyboard', 'touch', 'click']
  categoryFiltersUsed: string[];       // Active filters
}
```

**Integration Points:**
- Gallery metrics reported to existing `usePerformanceMonitoring` hook
- Automatic quality degradation if FPS drops below 45 (same as canvas)
- Performance warnings in dev mode if budgets exceeded
- Analytics tracking for popular images and navigation patterns

---

## Accessibility Architecture

### Keyboard Navigation Map

```
Contact Sheet Grid (SUMMARY level):
┌─────────────────────────────────────────────────────────────┐
│  [Filter Chips]  Tab → next filter, Enter to select         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │
│  │ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │  ← → ↑ ↓ : Navigate   │
│  └────┘ └────┘ └────┘ └────┘ └────┘     Enter: Open Modal  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     Tab: Next thumbnail│
│  │ 6  │ │ 7  │ │ 8  │ │ 9  │ │10  │     Esc: Exit to canvas│
│  └────┘ └────┘ └────┘ └────┘ └────┘                        │
└─────────────────────────────────────────────────────────────┘

Gallery Modal (DETAILED level):
┌─────────────────────────────────────────────────────────────┐
│  [◄ Prev]      Image 5 of 27      [Next ►]        [✕]      │
│     ←                →                Esc           ↑       │
│  ┌─────────────────────────────────────────────────┐        │
│  │         Full Resolution Image                   │        │
│  │         (Focus trapped in modal)                │        │
│  └─────────────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────────────┐        │
│  │ 📷 Metadata Panel                         [M]   │        │
│  │ Tab through metadata fields                     │        │
│  └─────────────────────────────────────────────────┘        │
│  Keyboard Shortcuts:                                        │
│  ← →  : Navigate images                                     │
│  Esc  : Close modal (return focus to thumbnail)             │
│  M    : Toggle metadata panel                               │
│  Tab  : Cycle through controls (Prev, Next, Close, Metadata)│
└─────────────────────────────────────────────────────────────┘
```

**Focus Management Rules:**
1. **On Modal Open:** Focus moves to close button (top-right)
2. **Tab Order:** Close → Prev → Next → Metadata Toggle → (loop)
3. **On Modal Close:** Focus returns to thumbnail that opened modal
4. **Arrow Keys:** Navigate images (don't move focus to buttons)
5. **Escape:** Close modal and return focus

### ARIA Structure

```html
<!-- Contact Sheet Grid -->
<div
  role="grid"
  aria-label="Gallery with 27 images"
  aria-rowcount="7"
  aria-colcount="4"
>
  <div role="row" aria-rowindex="1">
    <div
      role="gridcell"
      aria-colindex="1"
      tabindex="0"
      aria-label="Image 1 of 27: Skateboarder mid-air, category: Action Sports"
    >
      <img src="..." alt="Skateboarder mid-air during kickflip" />
    </div>
    <!-- More cells... -->
  </div>
</div>

<!-- Gallery Modal -->
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title" class="sr-only">Image 5 of 27</h2>
  <p id="modal-description" class="sr-only">
    Skateboarder mid-air during kickflip at Venice Beach Skatepark.
    Use arrow keys to navigate, Escape to close, M to toggle metadata.
  </p>

  <!-- Image -->
  <img
    src="..."
    alt="Skateboarder mid-air during kickflip"
    aria-describedby="image-metadata"
  />

  <!-- Navigation -->
  <button aria-label="Previous image (Left arrow)">◄ Prev</button>
  <button aria-label="Next image (Right arrow)">Next ►</button>
  <button aria-label="Close gallery (Escape)">✕</button>

  <!-- Metadata Panel -->
  <div
    id="image-metadata"
    role="region"
    aria-label="Image metadata and camera settings"
  >
    <!-- Metadata content... -->
  </div>

  <!-- ARIA Live Region for navigation announcements -->
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  >
    <!-- "Now viewing image 6 of 27" -->
  </div>
</div>
```

---

## Mobile Architecture

### Touch Gesture Handling

```typescript
// Mobile gesture priority hierarchy (prevent conflicts)

interface GalleryTouchGestures {
  // Contact Sheet (ContactSheetGrid.tsx)
  contactSheet: {
    tap: 'Open image in modal',
    longPress: 'Show image preview (optional)',
    scroll: 'Scroll through grid (native)',
    pinch: 'Reserved for canvas zoom (don't interfere)'
  };

  // Gallery Modal (GalleryModal.tsx)
  modal: {
    tap: 'Toggle UI controls (show/hide nav buttons)',
    swipe: {
      horizontal: 'Navigate prev/next image',
      vertical: 'No action (prevent accidental close)',
      threshold: 50  // px, prevent accidental swipes
    },
    pinch: 'Zoom into image (1x to 3x scale)',
    doubleTap: 'Toggle fit-to-screen / 1:1 pixel view',
    longPress: 'Show image actions menu (optional)'
  };

  // Backdrop (dismiss modal)
  backdrop: {
    tap: 'Close modal (return to contact sheet)',
    swipe: 'No action (only tap to close)'
  };
}

// Event Handling Strategy:
// 1. Stop propagation from modal to canvas (z-index + event.stopPropagation())
// 2. Use passive: false for touch events requiring preventDefault
// 3. Debounce swipe gestures (prevent rapid-fire navigation)
// 4. Visual feedback for all gestures (subtle animations, haptic feedback)
```

### Responsive Layout Breakpoints

```scss
// Align with existing athletic design token breakpoints

// Mobile (portrait): 2-column grid
@media (max-width: 640px) {
  .contact-sheet-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .gallery-modal {
    .metadata-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      transform: translateY(100%);  // Bottom sheet, swipe up to reveal
    }
  }
}

// Tablet (portrait): 3-column grid
@media (min-width: 641px) and (max-width: 1024px) {
  .contact-sheet-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .gallery-modal {
    .metadata-panel {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 300px;  // Sidebar on tablet
    }
  }
}

// Desktop: 4-5 column grid
@media (min-width: 1025px) {
  .contact-sheet-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .gallery-modal {
    .metadata-panel {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 350px;  // Wider sidebar on desktop
    }
  }
}
```

---

## Integration Patterns

### Integration with LightboxCanvas

```typescript
// components/LightboxCanvas.tsx extension

// Add gallery support to portfolio section
const portfolioSection = sections.find(s => s.section === 'portfolio');

if (portfolioSection && canvasState.zoomLevel > ZOOM_THRESHOLD_SUMMARY) {
  // Render GalleryContentAdapter when portfolio section is zoomed
  return (
    <GalleryContentAdapter
      contentLevel={getContentLevel(canvasState.zoomLevel)}
      onImageSelect={handleImageSelect}
      performanceMode={canvasState.qualityLevel}
    />
  );
} else {
  // Show single gallery thumbnail at overview level
  return (
    <div className="gallery-thumbnail-preview">
      <img src="/images/gallery/thumbs/portfolio-00.webp" alt="Gallery preview" />
      <span className="gallery-count">27 images</span>
    </div>
  );
}
```

### Integration with CursorLens

```typescript
// hooks/useRadialMenu.tsx extension

// Add gallery-specific navigation to CursorLens radial menu
const radialMenuItems = [
  // ... existing items (capture, focus, frame, exposure, develop)
  {
    section: 'portfolio',
    label: 'Gallery',
    icon: '📷',
    ariaLabel: 'Navigate to portfolio gallery with 27 images',
    action: () => {
      // Navigate to portfolio section and zoom to SUMMARY level
      navigateToSection('portfolio');
      setTimeout(() => {
        setZoomLevel(ZOOM_THRESHOLD_SUMMARY);
      }, 800); // After pan-tilt transition completes
    }
  }
];
```

### Integration with ContentAdapter System

```typescript
// Registry pattern for content adapters

// contexts/ContentAdapterRegistry.tsx
const contentAdapterRegistry = {
  about: AboutContentAdapter,
  skills: SkillsContentAdapter,
  experience: ExperienceContentAdapter,
  projects: ProjectsContentAdapter,
  portfolio: GalleryContentAdapter,  // ← New adapter
};

// Dynamic adapter selection based on section
export const useContentAdapter = (section: PhotoWorkflowSection) => {
  const AdapterComponent = contentAdapterRegistry[section];

  if (!AdapterComponent) {
    console.warn(`No content adapter found for section: ${section}`);
    return null;
  }

  return <AdapterComponent />;
};
```

---

## Testing Architecture

### Unit Testing Strategy

```typescript
// Test files structure
test/gallery/
  ├── GalleryContentAdapter.test.tsx      // State management, filtering
  ├── ContactSheetGrid.test.tsx           // Grid layout, lazy loading
  ├── GalleryModal.test.tsx               // Modal open/close, navigation
  ├── MetadataPanel.test.tsx              // Metadata display, disclosure
  ├── useGalleryNavigation.test.tsx       // Navigation hook logic
  └── gallery-metadata.test.ts            // JSON validation

// Key test scenarios:
describe('GalleryContentAdapter', () => {
  it('should load gallery metadata on mount', async () => {
    // Mock fetch for gallery-metadata.json
    // Assert 27 images loaded
  });

  it('should filter images by category', () => {
    // Filter to "action-sports"
    // Assert only matching images shown
  });

  it('should open modal with correct image', () => {
    // Click thumbnail at index 5
    // Assert modal opens with portfolio-05
  });
});

describe('ContactSheetGrid', () => {
  it('should lazy load thumbnails with Intersection Observer', async () => {
    // Render grid with 27 images
    // Assert only images in viewport loaded
    // Scroll down
    // Assert more images loaded
  });

  it('should handle keyboard navigation (arrow keys)', () => {
    // Focus on thumbnail 5
    // Press → key
    // Assert focus moved to thumbnail 6
  });
});

describe('GalleryModal', () => {
  it('should navigate between images with arrow keys', () => {
    // Open modal at image 5
    // Press → key
    // Assert image 6 displayed
    // Assert ARIA live region updated
  });

  it('should preload adjacent images', async () => {
    // Open modal at image 10
    // Assert images 9 and 11 are preloading
  });
});
```

### E2E Testing Strategy (Playwright)

```typescript
// tests/e2e/gallery-canvas-integration.spec.ts

test('Gallery discovery and image viewing flow', async ({ page }) => {
  // Navigate to portfolio
  await page.goto('/');

  // Activate CursorLens and navigate to portfolio
  await page.keyboard.press('Space');
  await page.click('[data-section="portfolio"]');

  // Wait for canvas pan-tilt transition
  await page.waitForTimeout(800);

  // Verify contact sheet is visible
  const contactSheet = await page.locator('[data-testid="contact-sheet-grid"]');
  await expect(contactSheet).toBeVisible();

  // Click first thumbnail
  await page.click('[data-image-id="portfolio-00"]');

  // Verify modal opens
  const modal = await page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  // Navigate to next image
  await page.keyboard.press('ArrowRight');

  // Verify image changed
  const currentImage = await page.locator('[data-current-image]');
  await expect(currentImage).toHaveAttribute('data-image-id', 'portfolio-01');

  // Close modal
  await page.keyboard.press('Escape');

  // Verify returned to contact sheet
  await expect(contactSheet).toBeVisible();
  await expect(modal).not.toBeVisible();
});

test('Mobile touch gestures', async ({ page, context }) => {
  // Simulate mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  // Navigate to gallery and open image
  // ... setup code ...

  // Swipe right (previous image)
  await page.touchscreen.swipe(
    { x: 300, y: 300 },
    { x: 50, y: 300 },
    { steps: 10 }
  );

  // Verify image changed
  await expect(currentImage).toHaveAttribute('data-image-id', 'portfolio-09');

  // Pinch to zoom
  await page.touchscreen.pinch(
    { x: 187, y: 333 },
    1.0,
    2.0,
    { steps: 20 }
  );

  // Verify image zoomed
  const imageScale = await page.locator('img').evaluate(el => {
    return window.getComputedStyle(el).transform;
  });
  expect(imageScale).toContain('scale(2');
});
```

---

## Security Considerations

### Image Asset Security
- All images served from `/public/images/gallery/` (static assets)
- No user-uploaded content in Phase 3 (future consideration)
- Metadata JSON validated against TypeScript schema
- No executable code in metadata (sanitize any user-provided content)

### Performance Security
- Limit concurrent image loads (prevent memory exhaustion)
- Rate limit metadata JSON fetches (prevent abuse)
- Validate image dimensions (prevent decompression bombs)
- Set max image file sizes (300KB limit for full resolution)

---

## Future Extensibility

### Phase 4+ Considerations

**Headless CMS Integration:**
- Replace `gallery-metadata.json` with API calls
- Keep TypeScript interfaces unchanged (data contract)
- Add caching layer for metadata (localStorage/IndexedDB)

**User-Generated Content:**
- Add image upload system
- Implement image moderation/approval workflow
- Generate responsive sizes server-side
- Store metadata in database (not JSON)

**Advanced Gallery Features:**
- Slideshow mode (auto-advance with timer)
- Shareable image links (deep linking to specific images)
- Image comparison mode (side-by-side A/B)
- Favorites/collections (user-curated galleries)

**Analytics & Insights:**
- Track most-viewed images
- Measure time spent per image
- Analyze navigation patterns (which images lead to next)
- A/B test gallery layouts (masonry vs uniform grid)

---

**Design Document Version:** 1.0.0
**Last Updated:** 2025-09-29
**Architecture Review:** Ready for implementation