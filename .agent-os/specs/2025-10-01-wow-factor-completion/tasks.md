# WOW Factor Completion - Task Breakdown

> **Specification:** `2025-10-01-wow-factor-completion`
> **Total Tasks:** 16
> **Estimated Effort:** 1.5 weeks (36 hours)
> **Priority:** P1 - High (Production Polish)
> **Status:** 🟡 IN PROGRESS - 0/16 Tasks Complete

## Task Summary

| Phase | Tasks | Hours | Status |
|-------|-------|-------|--------|
| Phase 0: Gallery Implementation | 3 | 8h | ⏸️ Not Started |
| Phase 1: Photography Metaphor | 3 | 8h | ⏸️ Not Started |
| Phase 2: Polish & Delight | 3 | 6h | ⏸️ Not Started |
| Phase 3: Accessibility | 3 | 6h | ⏸️ Not Started |
| Phase 4: Performance & Testing | 4 | 8h | ⏸️ Not Started |
| **TOTAL** | **16** | **36h** | **0% Complete** |

---

## Phase 0: Gallery Section Implementation (Day 0-1, 8 hours)

### Task 0.1: Prepare Portfolio Images with EXIF Data
**Priority:** P1
**Effort:** 3 hours
**Dependencies:** None
**Files:** `/public/images/gallery/*`, `src/constants.ts`

**Subtasks:**
- [ ] Select 8-12 best portfolio photographs
  - Action sports (volleyball, surfing, skateboarding)
  - 2-3 images minimum per category
  - High resolution originals (min 2000px width)
- [ ] Extract EXIF data from each image
  ```bash
  # Use exiftool to extract metadata
  exiftool -j image.jpg > metadata.json
  ```
- [ ] Generate responsive image sizes
  ```bash
  # Install sharp globally
  npm install -g sharp-cli

  # Generate thumbnail (300x200)
  sharp -i image.jpg -o image-thumb.webp resize 300 200

  # Generate preview (800x600)
  sharp -i image.jpg -o image-preview.webp resize 800 600

  # Generate full (1920x1280)
  sharp -i image.jpg -o image-full.webp resize 1920 1280

  # Generate JPEG fallback
  sharp -i image.jpg -o image-full.jpg resize 1920 1280 --quality 90
  ```
- [ ] Write meaningful project context for each image
  - Technical challenge
  - Creative decision
  - Story behind the shot
- [ ] Organize images into `/public/images/gallery/` structure

**Acceptance Criteria:**
- [ ] 8-12 production-quality images selected
- [ ] All images have EXIF data extracted
- [ ] 4 sizes generated per image (thumb, preview, full, fallback)
- [ ] Project context written for each
- [ ] Images organized in public directory

---

### Task 0.2: Update Gallery Data Structure
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** Task 0.1
**Files:** `src/constants.ts`

**Subtasks:**
- [ ] Import `GalleryImage` type
  ```typescript
  import type { GalleryImage } from './types/gallery';
  ```
- [ ] Replace GALLERY_IMAGES with full data structure
  ```typescript
  export const GALLERY_IMAGES: GalleryImage[] = [
    {
      id: 'portfolio-001',
      filename: 'volleyball-spike.jpg',
      alt: 'Championship volleyball spike mid-action',
      categories: ['action-sports', 'volleyball'],
      urls: {
        thumbnail: '/images/gallery/volleyball-spike-thumb.webp',
        preview: '/images/gallery/volleyball-spike-preview.webp',
        full: '/images/gallery/volleyball-spike-full.webp',
        fallback: '/images/gallery/volleyball-spike-full.jpg',
      },
      metadata: {
        camera: 'Canon EOS R5',
        lens: 'RF 70-200mm f/2.8 L IS USM',
        iso: 1600,
        aperture: 'f/2.8',
        shutterSpeed: '1/2000',
        focalLength: '135mm',
        dateTaken: '2024-08-15T14:30:00Z',
        location: 'Olympic Training Center, Colorado',
        projectContext: 'Championship moment captured...',
        tags: ['volleyball', 'action', 'sports'],
      },
      isFeatured: true,
      displayOrder: 0,
    },
    // ... repeat for all images
  ];
  ```
- [ ] Add category definitions
  ```typescript
  export const GALLERY_CATEGORIES = [
    { id: 'action-sports', label: 'Action Sports', icon: '🏐' },
    { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
    { id: 'surfing', label: 'Surfing', icon: '🏄' },
    { id: 'skateboarding', label: 'Skateboarding', icon: '🛹' },
  ];
  ```
- [ ] Verify TypeScript types match

**Acceptance Criteria:**
- [ ] GALLERY_IMAGES uses GalleryImage type
- [ ] All fields populated with real data
- [ ] Categories defined
- [ ] No TypeScript errors

---

### Task 0.3: Integrate Gallery Components
**Priority:** P1
**Effort:** 3 hours
**Dependencies:** Task 0.2
**Files:** `src/components/layout/GallerySection.tsx`, App navigation

**Subtasks:**
- [ ] Update GallerySection to use existing gallery components
  ```typescript
  import { useState } from 'react';
  import { ContactSheetGrid } from '../gallery/ContactSheetGrid';
  import { GalleryModal } from '../gallery/GalleryModal';
  import type { GalleryImage } from '../../types/gallery';

  const GallerySection: React.FC<GallerySectionProps> = ({ setRef }) => {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
      <Section id="gallery" setRef={setRef}>
        <SectionTitle>Photography Portfolio</SectionTitle>

        <ContactSheetGrid
          images={GALLERY_IMAGES}
          columns={3}
          onImageSelect={(image, index) => {
            setSelectedImage(image);
            setCurrentIndex(index);
          }}
          activeCategory={null}
          layout="uniform"
          performanceMode="balanced"
        />

        {selectedImage && (
          <GalleryModal
            isOpen={!!selectedImage}
            currentImage={selectedImage}
            images={GALLERY_IMAGES}
            currentIndex={currentIndex}
            onClose={() => setSelectedImage(null)}
            onNavigate={(dir) => {
              const newIndex = dir === 'next'
                ? (currentIndex + 1) % GALLERY_IMAGES.length
                : (currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
              setCurrentIndex(newIndex);
              setSelectedImage(GALLERY_IMAGES[newIndex]);
            }}
            showMetadata={true}
            onToggleMetadata={() => {}}
          />
        )}
      </Section>
    );
  };
  ```
- [ ] Ensure GallerySection is added to App navigation
- [ ] Test modal open/close
- [ ] Test image navigation (prev/next)
- [ ] Test EXIF metadata display

**Acceptance Criteria:**
- [ ] Contact sheet displays all images
- [ ] Click opens modal with full image
- [ ] Navigation works (keyboard + click)
- [ ] EXIF metadata displays correctly
- [ ] Modal closes properly

---

## Phase 1: Photography Metaphor Completion (Day 1-2, 8 hours)

### Task 1: Fix useViewfinderVisibility for All Sections
**Priority:** P0
**Effort:** 3 hours
**Dependencies:** None
**Files:** `src/hooks/useViewfinderVisibility.tsx`

**Current State:**
```typescript
// PROBLEM: Only shows in hero on hover
if (isHovered && scrollPercent < 0.3) {
  showMetadata = true;
}
```

**Subtasks:**
- [ ] Read current `useViewfinderVisibility.tsx` implementation
- [ ] Add `EffectsContext` integration for `enableViewfinder` setting
  ```typescript
  import { useEffects } from '../contexts/EffectsContext';

  export const useViewfinderVisibility = () => {
    const { settings } = useEffects();
    const viewfinderEnabled = settings.enableViewfinder;
  ```
- [ ] Update visibility logic for all sections
  ```typescript
  // NEW LOGIC:
  // 1. Hero: Show on hover (discovery)
  // 2. Other sections: Show if viewfinderEnabled is true

  if (currentSection === 'hero') {
    // Hero behavior: hover-based
    if (isHovered && scrollPercent < 0.3) {
      showMetadata = true;
      opacity = 1;
    } else if (isHovered && scrollPercent < 0.5) {
      showMetadata = true;
      opacity = 1 - ((scrollPercent - 0.3) / 0.2);
    }
  } else {
    // Other sections: controlled by user preference
    if (viewfinderEnabled) {
      showMetadata = true;
      opacity = 1;
    }
  }
  ```
- [ ] Add section change detection
  ```typescript
  const [previousSection, setPreviousSection] = useState('hero');

  useEffect(() => {
    if (currentSection !== previousSection) {
      setPreviousSection(currentSection);
      // Trigger transition animation
    }
  }, [currentSection]);
  ```
- [ ] Test with EffectsPanel toggle
  - Enable "Viewfinder Mode"
  - Scroll through sections
  - Verify metadata appears in each section

**Acceptance Criteria:**
- [ ] Metadata shows on hero hover (first discovery)
- [ ] Metadata shows in all sections when `enableViewfinder` is true
- [ ] Metadata hides in all sections when `enableViewfinder` is false
- [ ] Section detection working correctly
- [ ] No console errors during section transitions

**Validation:**
```bash
# Manual testing steps:
1. Load localhost:3000
2. Hover over hero → See camera metadata
3. Open EffectsPanel → Enable "Viewfinder Mode"
4. Scroll to About → See "f/8 - Technical Excellence"
5. Scroll to Work → See "f/2.8 - Results Driven"
6. Scroll to Contact → See "f/4 - Collaboration"
7. Disable "Viewfinder Mode" → Metadata disappears
```

---

### Task 2: Add Section Transition Animations
**Priority:** P1
**Effort:** 3 hours
**Dependencies:** Task 1
**Files:** `src/components/effects/ViewfinderMetadata.tsx`

**Subtasks:**
- [ ] Read current `ViewfinderMetadata.tsx` implementation
- [ ] Add transition state management
  ```typescript
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const newSettings = SECTION_SETTINGS[currentSection] || SECTION_SETTINGS.hero;

    if (newSettings !== settings) {
      // Start transition
      setIsTransitioning(true);

      // Fade out (200ms)
      setTimeout(() => {
        setSettings(newSettings);
        // Fade in (200ms)
        setTimeout(() => setIsTransitioning(false), 200);
      }, 200);
    }
  }, [currentSection, settings]);
  ```
- [ ] Add transition CSS classes
  ```typescript
  className={`... ${isTransitioning ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'}`}
  ```
- [ ] Test smooth transitions between sections
  - Verify 400ms total transition time
  - Check for visual smoothness
  - Ensure no flash of incorrect content

**Acceptance Criteria:**
- [ ] Settings fade out before changing (200ms)
- [ ] Settings fade in after changing (200ms)
- [ ] No visual glitches during transition
- [ ] Blur effect applied during transition
- [ ] Total transition feels smooth and intentional

---

### Task 3: Mobile Positioning Optimization
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** Task 1, Task 2
**Files:** `src/components/effects/ViewfinderMetadata.tsx`

**Subtasks:**
- [ ] Add responsive positioning logic
  ```typescript
  const getResponsivePosition = () => {
    if (typeof window === 'undefined') return 'top-left';

    const isMobile = window.innerWidth < 768;
    return isMobile ? 'bottom-center' : 'top-left';
  };

  const [position, setPosition] = useState(getResponsivePosition());

  useEffect(() => {
    const handleResize = () => setPosition(getResponsivePosition());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  ```
- [ ] Update position classes for mobile
  ```typescript
  const positionClasses = {
    'top-left': 'top-24 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2', // Mobile
    'floating': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };
  ```
- [ ] Add mobile-specific styling
  ```typescript
  // Smaller text on mobile
  <div className={`
    bg-black/80 backdrop-blur-md border border-white/20 rounded-lg
    p-3 space-y-1 font-mono
    text-xs md:text-sm  // Responsive text size
  `}>
  ```
- [ ] Test on multiple viewport sizes
  - 320px (iPhone SE)
  - 375px (iPhone standard)
  - 768px (iPad)
  - 1024px (Desktop)

**Acceptance Criteria:**
- [ ] Desktop: top-24 left-4 (below header)
- [ ] Mobile: bottom-4 center (doesn't block content)
- [ ] Text readable on smallest screens
- [ ] Doesn't overflow viewport
- [ ] Touch-friendly spacing on mobile

---

## Phase 2: Polish & Delight Moments (Day 3, 6 hours)

### Task 4: Staggered Card Animations
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** None
**Files:** `src/components/layout/WorkSection.tsx`, portfolio card components

**Subtasks:**
- [ ] Find portfolio card rendering location
  ```bash
  grep -r "portfolioItems.map" src/
  ```
- [ ] Add stagger delay calculation
  ```typescript
  {portfolioItems.map((item, index) => (
    <Card
      key={item.id}
      style={{
        transitionDelay: `${index * 100}ms`,
        animationDelay: `${index * 100}ms`
      }}
      className={getAnimationClasses(isVisible, animationStyle, speed)}
    />
  ))}
  ```
- [ ] Test with different animation styles
  - Fade-up with stagger
  - Slide with stagger
  - Scale with stagger
- [ ] Verify performance (no layout thrashing)

**Acceptance Criteria:**
- [ ] Cards animate sequentially (100ms stagger)
- [ ] Works with all 5 animation styles
- [ ] No performance degradation with 6+ cards
- [ ] Feels intentional, not accidental

---

### Task 5: Photography-Themed Loading Messages
**Priority:** P2
**Effort:** 2 hours
**Dependencies:** None
**Files:** New file `src/components/effects/LoadingMessages.tsx`

**Subtasks:**
- [ ] Create LoadingMessages component
  ```typescript
  const photographyMessages = [
    "Adjusting aperture...",
    "Focusing lens...",
    "Metering exposure...",
    "Developing negatives...",
    "Printing contact sheet...",
    "Calibrating color balance...",
  ];

  export const LoadingMessages: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % photographyMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="text-brand-cyan font-mono text-sm animate-pulse">
        {photographyMessages[messageIndex]}
      </div>
    );
  };
  ```
- [ ] Integrate with loading states (image galleries, section content)
- [ ] Add fade transitions between messages
- [ ] Test message rotation timing

**Acceptance Criteria:**
- [ ] Messages rotate every 2 seconds
- [ ] Smooth fade between messages
- [ ] Appears during actual loading states
- [ ] Photography-themed language maintains brand

---

### Task 6: Smart Image Blur-Up Loading
**Priority:** P2
**Effort:** 2 hours
**Dependencies:** None
**Files:** Hero background, portfolio images

**Subtasks:**
- [ ] Create low-quality placeholders
  ```bash
  # Generate 20px width placeholder for hero.jpg
  npx sharp -i public/images/hero.jpg -o public/images/hero-placeholder.jpg resize 20
  ```
- [ ] Implement blur-up component
  ```typescript
  export const BlurUpImage: React.FC<{
    placeholder: string;
    src: string;
    alt: string;
  }> = ({ placeholder, src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
      <div className="relative overflow-hidden">
        {/* Placeholder */}
        <img
          src={placeholder}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover blur-md transition-opacity duration-700 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* High quality */}
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    );
  };
  ```
- [ ] Apply to hero background
- [ ] Apply to portfolio images
- [ ] Test loading experience on slow 3G

**Acceptance Criteria:**
- [ ] Placeholder shows immediately
- [ ] Blur-up transition smooth (700ms)
- [ ] No layout shift during load
- [ ] Works on all image sizes

---

## Phase 3: Accessibility Audit (Day 4, 6 hours)

### Task 7: EffectsPanel Keyboard Navigation
**Priority:** P0 (Accessibility)
**Effort:** 2 hours
**Dependencies:** None
**Files:** `src/components/effects/EffectsPanel.tsx`

**Subtasks:**
- [ ] Add keyboard event handlers
  ```typescript
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch(e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        // Natural tab order (browser handles)
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        // Navigate tabs
        e.preventDefault();
        setActiveTab(/* next/prev */);
        break;
    }
  };
  ```
- [ ] Add focus management
  ```typescript
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element
      const firstFocusable = panelRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (firstFocusable as HTMLElement)?.focus();
    }
  }, [isOpen]);
  ```
- [ ] Add ARIA attributes
  ```typescript
  <div
    role="dialog"
    aria-label="Effects Control Panel"
    aria-modal="true"
    onKeyDown={handleKeyDown}
  >
  ```
- [ ] Test keyboard navigation
  - Tab through all controls
  - Escape closes panel
  - Arrow keys navigate tabs
  - Enter/Space activate toggles

**Acceptance Criteria:**
- [ ] All controls reachable via keyboard
- [ ] Escape key closes panel
- [ ] Arrow keys navigate tabs
- [ ] Focus visible on all elements
- [ ] No keyboard traps

---

### Task 8: ARIA Announcements & Screen Reader Support
**Priority:** P0 (Accessibility)
**Effort:** 2 hours
**Dependencies:** None
**Files:** `src/components/effects/CustomCursor.tsx`, `src/components/effects/ViewfinderMetadata.tsx`

**Subtasks:**
- [ ] Add live region for cursor state
  ```typescript
  // CustomCursor.tsx
  <div role="status" aria-live="polite" className="sr-only">
    {isHovering && "Interactive element"}
  </div>
  ```
- [ ] Add live region for viewfinder updates
  ```typescript
  // ViewfinderMetadata.tsx
  <div role="status" aria-live="polite" className="sr-only">
    {visible && `Camera settings: ${settings.focus}`}
  </div>
  ```
- [ ] Add ARIA labels to all interactive elements
  ```typescript
  <button
    aria-label={`${setting.label}: ${enabled ? 'enabled' : 'disabled'}`}
    aria-pressed={enabled}
  >
  ```
- [ ] Test with screen readers
  - VoiceOver (macOS): Cmd+F5
  - NVDA (Windows): Download and install
  - Verify all announcements clear

**Acceptance Criteria:**
- [ ] Screen reader announces state changes
- [ ] All buttons have descriptive labels
- [ ] Live regions don't over-announce
- [ ] Navigation logical with screen reader

---

### Task 9: Reduced Motion & Accessibility Verification
**Priority:** P0 (Accessibility)
**Effort:** 2 hours
**Dependencies:** None
**Files:** `src/styles/wow-effects.css`, verify all components

**Subtasks:**
- [ ] Verify reduced motion CSS working
  ```css
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- [ ] Test with OS setting
  - macOS: System Preferences → Accessibility → Display → Reduce Motion
  - Windows: Settings → Ease of Access → Display → Show animations
- [ ] Run Chrome DevTools Accessibility audit
  - Open DevTools → Lighthouse → Accessibility
  - Fix all errors and warnings
- [ ] Verify color contrast ratios
  - Text: 4.5:1 minimum
  - Large text: 3:1 minimum
  - UI components: 3:1 minimum

**Acceptance Criteria:**
- [ ] Reduced motion preference respected
- [ ] Chrome Accessibility audit: 100 score
- [ ] All color contrasts pass WCAG AA
- [ ] No accessibility errors in DevTools

---

## Phase 4: Performance & Testing (Day 5, 8 hours)

### Task 10: Lighthouse Performance Audit
**Priority:** P1
**Effort:** 3 hours
**Dependencies:** All features complete
**Files:** N/A (diagnostic)

**Subtasks:**
- [ ] Build production bundle
  ```bash
  npm run build
  npx serve -s dist -p 3001
  ```
- [ ] Run Lighthouse audit
  ```bash
  npx lighthouse http://localhost:3001 --view
  ```
- [ ] Analyze results
  - Performance: Target 95+
  - Accessibility: Target 100
  - Best Practices: Target 95+
  - SEO: Target 100
- [ ] Fix identified issues
  - Compress images
  - Lazy load below-fold content
  - Optimize bundle size
  - Preload critical fonts
- [ ] Re-run audit to verify improvements

**Acceptance Criteria:**
- [ ] Lighthouse Performance: 95+
- [ ] Lighthouse Accessibility: 100
- [ ] Lighthouse Best Practices: 95+
- [ ] Lighthouse SEO: 100
- [ ] First Contentful Paint: < 1.8s
- [ ] Largest Contentful Paint: < 2.5s
- [ ] Cumulative Layout Shift: < 0.1

---

### Task 11: Bundle Size Analysis & Optimization
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** None
**Files:** Multiple (optimization targets)

**Subtasks:**
- [ ] Analyze bundle size
  ```bash
  npm run build
  npx vite-bundle-visualizer
  ```
- [ ] Identify large dependencies
  - Check if tree-shaking working
  - Look for duplicate dependencies
  - Find opportunities for code splitting
- [ ] Optimize identified issues
  - Dynamic imports for large features
  - Remove unused dependencies
  - Compress images further
- [ ] Set bundle size budget
  ```json
  // vite.config.ts
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          effects: ['src/components/effects']
        }
      }
    },
    chunkSizeWarningLimit: 300 // KB
  }
  ```

**Acceptance Criteria:**
- [ ] Total bundle size < 300KB gzipped
- [ ] Main chunk < 150KB
- [ ] No duplicate dependencies
- [ ] Code splitting for effects panel

---

### Task 12: Animation Performance Testing
**Priority:** P1
**Effort:** 1 hour
**Dependencies:** None
**Files:** All animated components

**Subtasks:**
- [ ] Record performance profile in Chrome DevTools
  - Open DevTools → Performance tab
  - Start recording
  - Scroll through all sections
  - Trigger all animations
  - Stop recording
- [ ] Analyze results
  - Check for 60fps (16.7ms per frame)
  - Look for layout thrashing
  - Identify dropped frames
  - Verify GPU acceleration
- [ ] Fix performance issues
  - Use `will-change` sparingly
  - Prefer `transform` over `left/top`
  - Batch DOM reads/writes
- [ ] Verify improvements
  - Re-record performance
  - Confirm 60fps maintained

**Acceptance Criteria:**
- [ ] 60fps maintained during scroll
- [ ] No layout thrashing detected
- [ ] GPU acceleration working
- [ ] No memory leaks in long sessions

---

### Task 13: Cross-Browser & Mobile Testing
**Priority:** P1
**Effort:** 2 hours
**Dependencies:** All tasks complete
**Files:** N/A (testing)

**Subtasks:**
- [ ] Test in Chrome (latest)
  - Desktop: Windows, macOS
  - Mobile: Android, iOS
- [ ] Test in Firefox (latest)
  - Desktop: Windows, macOS
  - Mobile: Android
- [ ] Test in Safari (latest)
  - Desktop: macOS
  - Mobile: iOS
- [ ] Test in Edge (latest)
  - Desktop: Windows
- [ ] Test responsive breakpoints
  - 320px (iPhone SE)
  - 375px (iPhone 12/13)
  - 390px (iPhone 14 Pro)
  - 768px (iPad)
  - 1024px (iPad Pro)
  - 1440px (Desktop)
  - 1920px (Large desktop)
- [ ] Document browser-specific issues
- [ ] Fix critical issues
- [ ] Add browser-specific CSS if needed

**Acceptance Criteria:**
- [ ] Works in Chrome, Firefox, Safari, Edge (latest)
- [ ] No broken layouts at any breakpoint
- [ ] Touch interactions work on iOS/Android
- [ ] Parallax smooth on Safari (notorious for issues)
- [ ] Custom cursor hidden on touch devices

---

## Validation Checklist

### Before Marking Complete
- [ ] All 13 tasks completed
- [ ] No console errors in production build
- [ ] Lighthouse scores meet targets
- [ ] Accessibility audit passes
- [ ] Cross-browser testing complete
- [ ] Mobile testing on real devices
- [ ] Photography metaphor works in all sections
- [ ] User feedback positive

### Production Deployment Checklist
- [ ] Create production build: `npm run build`
- [ ] Test production build locally: `npx serve -s dist`
- [ ] Run final Lighthouse audit
- [ ] Verify analytics tracking (if applicable)
- [ ] Test contact form (if applicable)
- [ ] Verify all links working
- [ ] Check SEO meta tags
- [ ] Deploy to hosting

---

## Notes

**Commit Cadence:** Every 30 minutes or after each subtask completion
**Testing Strategy:** Manual + automated (Lighthouse)
**Rollback Plan:** Git history allows easy reversion of any task
**Communication:** Update status doc after each phase completion

---

## References

- **Spec:** `.agent-os/specs/2025-10-01-wow-factor-completion/spec.md`
- **Status:** `docs/WOW_FACTOR_STATUS.md`
- **Original Plan:** `docs/WOW_FACTOR_IMPLEMENTATION.md`
