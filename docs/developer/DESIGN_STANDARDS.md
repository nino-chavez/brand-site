# Design Standards Guide

**Last Updated:** 2025-10-02
**Purpose:** Comprehensive design system standards based on demo harness UX/UI audit findings and production implementation patterns.

---

## Table of Contents

1. [Typography Scale Standards](#typography-scale-standards)
2. [Color System Guidelines](#color-system-guidelines)
3. [Spacing System](#spacing-system)
4. [Border Radius Standards](#border-radius-standards)
5. [Visual Hierarchy Principles](#visual-hierarchy-principles)
6. [Animation Standards](#animation-standards)
7. [Accessibility Requirements](#accessibility-requirements)

---

## Typography Scale Standards

### Heading Scale

Based on demo harness audit findings, the following scale provides optimal hierarchy and scannability:

```tsx
// Typography Scale (Tailwind classes)
h1: text-4xl (36px) md:text-5xl (48px) lg:text-6xl (60px) font-extrabold
h2: text-3xl (30px) md:text-4xl (36px) font-bold          // Increased from 24px
h3: text-2xl (24px) md:text-3xl (30px) font-bold          // Increased from 18px
h4: text-xl (20px) md:text-2xl (24px) font-semibold
h5: text-lg (18px) font-semibold
h6: text-base (16px) font-semibold
```

### Body Text Scale

```tsx
// Body text sizes
body-large:  text-lg (18px)    // Lead paragraphs
body:        text-base (16px)  // Default body text
body-small:  text-sm (14px)    // Supporting text
caption:     text-xs (12px)    // Captions, labels
```

### Font Weights

```tsx
// Font weight standards
font-extrabold: 800  // Primary headings (h1)
font-bold: 700       // Secondary headings (h2, h3)
font-semibold: 600   // Tertiary headings (h4, h5, h6)
font-medium: 500     // Emphasized body text
font-normal: 400     // Default body text
```

### Line Heights

```tsx
// Line height standards
Headings:    leading-tight (1.25)    // Better visual compactness
Body:        leading-relaxed (1.625) // Enhanced readability
Captions:    leading-normal (1.5)    // Compact labels
```

### Text Opacity Standards

**Updated based on audit findings:**

```tsx
// Primary text
text-white          // Headings: 100% opacity
text-white/90       // Body text: 90% opacity (was 60%, improved readability)
text-white/80       // Supporting text: 80% opacity (was 60%)
text-white/60       // Subtle text: 60% opacity
text-white/40       // Disabled/placeholder: 40% opacity
```

**Rationale:** 60% opacity for body text created muddy, hard-to-read content. 80-90% provides better contrast while maintaining sophistication.

---

## Color System Guidelines

### Semantic Color Palette

```tsx
// State colors with semantic meaning
Current/Active:   Violet (#8b5cf6)  // Active states, primary brand
Preview/Hover:    Cyan (#06b6d4)    // Hover states, secondary interactions
Interaction/CTA:  Orange (#f97316)  // Call-to-action, highlights
Success:          Green (#10b981)   // Success confirmations
Warning:          Amber (#f59e0b)   // Warnings, attention needed
Error:            Red (#ef4444)     // Errors, destructive actions
```

### Background Transparency Standards

**Updated based on audit findings:**

```tsx
// Background opacity tokens (REDUCED from original)
bg-white/10         // Cards, panels (was bg-white/5, too transparent)
bg-white/8          // Subtle surfaces (was bg-white/3)
bg-white/5          // Very subtle overlays

// Overlay transparency
bg-neutral-900/90   // Modal backdrops (was bg-neutral-900/80)
bg-black/80         // Dark overlays (was bg-black/70)
bg-black/60         // Subtle overlays (was bg-black/50)
```

**Rationale:** Excessive transparency (50%) created flat, muddy layers. 10% provides better visual separation.

### Accent Color Usage

**Category-specific accent colors** (recommended addition):

```tsx
// Subtle variations for visual differentiation
Category 1 (Animations):   violet-500 (#8b5cf6)
Category 2 (Interactive):  blue-500 (#3b82f6)
Category 3 (States):       cyan-500 (#06b6d4)
Category 4 (Data):         purple-500 (#a855f7)
Category 5 (Layout):       indigo-500 (#6366f1)
```

### Border Colors

```tsx
// Border opacity standards
border-white/20     // Default borders
border-white/30     // Hover borders
border-white/40     // Active/selected borders
border-white/10     // Subtle dividers
```

### Gradient System

```tsx
// Primary gradients
Violet gradient:  from-violet-500/20 to-purple-500/20
Blue gradient:    from-blue-500/20 to-cyan-500/20
Orange gradient:  from-orange-500/20 to-red-500/20
```

---

## Spacing System

### Internal Component Spacing (Padding)

```tsx
// Padding scale (Tailwind)
p-2:  8px   // Tight padding (small buttons, badges)
p-3:  12px  // Compact padding (controls)
p-4:  16px  // Standard padding (cards, buttons)
p-6:  24px  // Comfortable padding (panels)
p-8:  32px  // Generous padding (sections)
p-12: 48px  // Large padding (hero sections)
```

### Component Spacing (Margins & Gaps)

```tsx
// Gap/Margin scale
gap-1 / mb-1:   4px   // Minimal spacing
gap-2 / mb-2:   8px   // Tight spacing (related elements)
gap-3 / mb-3:   12px  // Close spacing
gap-4 / mb-4:   16px  // Standard spacing (default)
gap-6 / mb-6:   24px  // Comfortable spacing
gap-8 / mb-8:   32px  // Generous spacing (section elements)
gap-12 / mb-12: 48px  // Large spacing (major sections)
```

### Section Spacing

```tsx
// Vertical section spacing
Section padding top/bottom:     py-16 (64px) md:py-24 (96px)
Section header margin bottom:   mb-12 (48px)
Section content gap:            gap-8 (32px)
```

### Grid Spacing

```tsx
// Grid gap standards
Dense grid:       gap-2 (8px)   // Compact layouts
Default grid:     gap-4 (16px)  // Standard spacing
Comfortable grid: gap-6 (24px)  // Generous spacing
```

---

## Border Radius Standards

**Updated based on demo harness audit:**

```tsx
// Border radius scale (standardized across components)
Cards:           rounded-xl (12px)    // Standardized from mixed values
Controls:        rounded-lg (8px)     // Standardized for all controls
Buttons:         rounded-md (6px)     // Consistent button treatment
Badges/Pills:    rounded-full         // Fully rounded small elements
Input fields:    rounded-lg (8px)     // Match controls
Modals:          rounded-2xl (16px)   // Large containers
```

**Rationale:** Inconsistent border radius created visual discord. Standardized values create cohesive design language.

---

## Visual Hierarchy Principles

### Content Density Guidelines

**Based on demo harness content audit:**

1. **Hero/Introduction Sections**
   - Maximum 3-4 short paragraphs before visual break
   - Use scannable bullet points with icons for lists
   - Progressive disclosure for technical details (collapsible sections)
   - Visual hierarchy: Size → Color → Weight

2. **Category/Section Titles**
   - Always include descriptive subtitle (problem/solution focus)
   - Use accent colors sparingly for differentiation
   - Maintain consistent title + subtitle pattern

3. **Technical Badges**
   - Limit to 3-5 primary badges visible
   - Use collapsible "Technical Details" for extensive metadata
   - Group related badges together

### Z-Index Scale

```tsx
// Z-index layering system
base-content:     z-0 (1)       // Default page content
elevated-cards:   z-10 (10)     // Cards, dropdowns
sticky-elements:  z-30 (30)     // Sticky headers
overlays:         z-40 (40)     // Lightbox overlays
modals:           z-50 (50)     // Modal dialogs
tooltips:         z-60 (60)     // Tooltips, popovers
debug-hud:        z-[9999]      // Development tools
```

### Visual Weight Distribution

```tsx
// Element prominence (visual weight)
Primary CTA:      Bold gradient + large shadow + prominent positioning
Secondary action: Solid color + medium shadow + standard positioning
Tertiary action:  Subtle background + minimal shadow + compact size
```

---

## Animation Standards

### Duration Standards

**Updated based on demo harness audit findings:**

```tsx
// Animation durations
Instant:      duration-100 (100ms)   // Micro-interactions
Fast:         duration-300 (300ms)   // UI feedback
Normal:       duration-500 (500ms)   // Standard transitions
Comfortable:  duration-700 (700ms)   // Section animations (INCREASED from 500ms)
Slow:         duration-1000 (1000ms) // Dramatic entrances
```

**Rationale:** 500ms section animations were too fast and barely noticeable. 700ms provides better user perception.

### Transform Distance Standards

**Updated based on demo harness audit:**

```tsx
// Translation distances for animations
Subtle:    translate-y-2 (8px)    // Micro-movements
Standard:  translate-y-6 (24px)   // Default animations (INCREASED from 8px)
Dramatic:  translate-y-12 (48px)  // Prominent entrances
```

**Rationale:** 8px translation was too subtle on modern high-resolution displays. 24px provides noticeable movement.

### Easing Functions

```tsx
// Standard easing curves
Smooth:    ease-out        // Default for most animations
Bounce:    ease-in-out     // Playful interactions
Entrance:  ease-out        // Elements appearing
Exit:      ease-in         // Elements disappearing
```

### Animation Classes Pattern

```tsx
// Standard animation class structure
const getAnimationClasses = (isVisible: boolean, style: AnimationStyle) => {
  const baseClasses = 'transition-all';
  const durationClasses = {
    fast: 'duration-300',
    normal: 'duration-700',  // Updated from 500ms
    slow: 'duration-1000',
    off: 'duration-0'
  };

  const transformClasses = isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-6';  // Updated from translate-y-2

  return `${baseClasses} ${durationClasses[style]} ease-out ${transformClasses}`;
};
```

### Performance Targets

```tsx
// Animation performance requirements
Frame rate:           45-60 fps minimum
GPU acceleration:     Always use translate3d, scale, opacity
will-change:          Apply for animated properties
Reduced motion:       Respect prefers-reduced-motion media query
```

### Hover State Animations

```tsx
// Standard hover animation
.hover-lift {
  transition: all 200ms ease-out;
}

.hover-lift:hover {
  transform: translateY(-4px) scale(1.02);
}

// Button hover (faster)
.button-hover {
  transition: all 150ms ease-out;
}

.button-hover:hover {
  transform: translateY(-2px);
}
```

---

## Accessibility Requirements

### Color Contrast Standards

```tsx
// WCAG 2.2 AA compliance
Body text (16px):        4.5:1 minimum contrast ratio
Large text (18px+):      3:1 minimum contrast ratio
UI components:           3:1 minimum contrast ratio
Disabled elements:       No minimum (but should be perceivable)
```

### Focus Indicators

```tsx
// Keyboard focus standards (ALWAYS visible)
focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900
// OR
focus:outline-2 focus:outline-orange-500 focus:outline-offset-2
```

**Requirements:**
- Focus indicators MUST be visible on all interactive elements
- Focus indicators MUST have 3:1 contrast ratio
- Focus order MUST follow visual/logical order

### Touch Targets

```tsx
// Minimum touch target sizes (WCAG 2.1)
Mobile buttons:       min-w-[44px] min-h-[44px]
Desktop buttons:      min-w-[36px] min-h-[36px]
Touch spacing:        gap-2 (8px minimum between targets)
```

### Motion Preferences

```tsx
// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Semantic HTML

```tsx
// Use proper semantic elements
Headings:      <h1> to <h6> (hierarchical order)
Navigation:    <nav> with <ul>/<li>
Sections:      <section> with <h2>
Articles:      <article> for standalone content
Buttons:       <button> for actions, <a> for navigation
```

### ARIA Labels

```tsx
// ARIA label requirements
Interactive elements without text: aria-label required
Icon-only buttons: aria-label required
State changes: aria-live="polite" or aria-live="assertive"
Expandable sections: aria-expanded attribute
```

---

## Implementation Examples

### Demo Card Component

```tsx
// Demonstrates: typography, spacing, border radius, colors, animation
<div className="
  p-6 rounded-xl
  bg-white/10 border-2 border-white/20
  hover:bg-white/15 hover:border-cyan-500/40
  transition-all duration-200 ease-out
  hover:translate-y-[-4px] hover:scale-[1.02]
">
  <h3 className="text-2xl font-bold text-white mb-3">
    Card Title
  </h3>
  <p className="text-base text-white/80 leading-relaxed mb-4">
    Description text with proper opacity for readability.
  </p>
  <button className="
    px-4 py-2 rounded-md
    bg-orange-500 hover:bg-orange-600
    text-white font-medium
    transition-colors duration-150
    focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2
  ">
    Call to Action
  </button>
</div>
```

### Section Header with Animation

```tsx
// Demonstrates: typography scale, spacing, animation standards
<section className="py-16 md:py-24">
  <div className={`
    transition-all duration-700 ease-out
    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
  `}>
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
      Section Title
    </h2>
    <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
      Section description with optimal line height and text opacity.
    </p>
  </div>
</section>
```

---

## Design System Checklist

When implementing new components, verify:

- [ ] Typography scale follows h1-h6 standards
- [ ] Text opacity uses 90% for body, 80% for supporting text
- [ ] Background transparency uses 10% for cards (not 5%)
- [ ] Border radius follows card (12px), control (8px), button (6px) pattern
- [ ] Animations use 700ms duration and 24px translate for sections
- [ ] Colors use semantic palette (violet=active, cyan=hover, orange=CTA)
- [ ] Spacing uses 4px base unit (gap-2, gap-4, gap-6, etc.)
- [ ] Focus indicators are visible on all interactive elements
- [ ] Touch targets meet 44x44px minimum on mobile
- [ ] Reduced motion is respected via media query
- [ ] Z-index follows established scale
- [ ] Color contrast meets WCAG 2.2 AA standards

---

**Document Status:** Complete
**Source:** Demo harness UX/UI audit findings (2025-10-02)
**Related Docs:**
- `/docs/DESIGN_SYSTEM.md` - Original design tokens
- `/docs/DEMO_HARNESS_FIX_SUMMARY.md` - Audit findings
- `/docs/UI_UX_TESTING_MASTER_GUIDE.md` - Testing standards
