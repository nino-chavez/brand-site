# Experimental Layout: Design Trend Showcase

## Overview

The Experimental Layout is a fourth layout mode (`?layout=experimental`) that demonstrates mastery of contemporary web design trends through a theme-switchable interface. Each theme represents a complete, pure application of a specific design trend, allowing users to experience different aesthetic approaches to the same portfolio content.

## Architecture

### URL Access
- **URL Parameter**: `?layout=experimental`
- **Default Theme**: Glassmorphism
- **Mobile**: Responsive adaptations for all themes

### Component Structure
```
src/
├── components/
│   ├── experimental/
│   │   ├── ExperimentalLayout.tsx          # Main container
│   │   ├── ThemeSelector.tsx               # Camera-inspired theme switcher
│   │   ├── ExperimentalContent.tsx         # Theme-aware content wrapper
│   │   └── themes/
│   │       ├── GlassmorphismTheme.tsx
│   │       ├── BentoGridTheme.tsx
│   │       ├── NeumorphismTheme.tsx
│   │       ├── NeobrutalistTheme.tsx
│   │       ├── RetrofuturismTheme.tsx
│   │       └── BoldMinimalismTheme.tsx
├── contexts/
│   └── ExperimentalLayoutContext.tsx       # Theme state management
└── hooks/
    └── useThemeSwitcher.ts                 # Theme switching logic
```

---

## Design Specifications

### 1. Glassmorphism Theme

**Visual Identity**: Frosted glass surfaces with depth and translucency

#### Core Properties
```css
/* Glass Card */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(12px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.18);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

/* Vibrant Background Required */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

#### Layout Approach
- **Sections**: Floating glass panels over dynamic gradient backgrounds
- **Navigation**: Glass morphic header with blur
- **Cards**: Layered glass cards with subtle depth
- **Typography**: Clean sans-serif with high contrast for readability

#### Color Palette
- **Primary**: Vibrant gradients (purple-blue, cyan-pink)
- **Glass**: rgba(255, 255, 255, 0.1-0.3)
- **Text**: High contrast (#000 or #FFF)
- **Borders**: rgba(255, 255, 255, 0.18)

#### Accessibility Considerations
- Ensure text contrast ratio ≥ 4.5:1
- Provide high-contrast mode alternative
- Test blur effects on low-end devices
- Fallback: semi-transparent without blur

---

### 2. Bento Grid Theme

**Visual Identity**: Modular compartmentalized layout inspired by Japanese bento boxes

#### Core Properties
```css
/* Grid Container */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
grid-auto-rows: 200px;
gap: 1.5rem;
padding: 2rem;

/* Grid Items with Span Variations */
.grid-item-large { grid-column: span 2; grid-row: span 2; }
.grid-item-wide { grid-column: span 2; }
.grid-item-tall { grid-row: span 2; }
```

#### Layout Approach
- **Hero Section**: 2×2 large center module
- **About/Projects**: Mix of 2×1, 1×2, and 1×1 modules
- **Cards**: Contained within grid cells with consistent padding
- **Responsive**: Auto-fit columns collapse on mobile

#### Grid Patterns
```
Desktop (4 columns):
[HERO HERO  | PROJ | PROJ]
[HERO HERO  | PROJ | PROJ]
[ABOUT|ABOUT| CONT | CONT]

Tablet (2 columns):
[HERO | HERO]
[HERO | HERO]
[PROJ | PROJ]

Mobile (1 column):
[HERO]
[PROJ]
[PROJ]
```

#### Color Palette
- **Background**: Light gray (#F5F5F7) or dark (#121212)
- **Cards**: White/Dark gray with subtle shadows
- **Accent**: Single brand color (Athletic Blue)
- **Borders**: 1px solid with 12px border-radius

#### Typography
- **Headings**: Bold, medium size (not oversized)
- **Body**: Clean, readable sans-serif
- **Hierarchy**: Clear through size and weight

---

### 3. Neumorphism Theme

**Visual Identity**: Soft, tactile, extruded/pressed UI elements

#### Core Properties
```css
/* Light Mode Neumorphic Element */
background: #e0e5ec;
border-radius: 20px;
box-shadow:
  12px 12px 24px rgba(163, 177, 198, 0.6),
  -12px -12px 24px rgba(255, 255, 255, 0.5);

/* Pressed/Inset State */
box-shadow:
  inset 8px 8px 16px rgba(163, 177, 198, 0.6),
  inset -8px -8px 16px rgba(255, 255, 255, 0.5);

/* Dark Mode */
background: #2d3436;
box-shadow:
  12px 12px 24px rgba(0, 0, 0, 0.5),
  -12px -12px 24px rgba(55, 59, 68, 0.5);
```

#### Layout Approach
- **Sections**: Soft, extruded rectangular containers
- **Cards**: Raised or pressed neumorphic surfaces
- **Buttons**: Tactile with hover press effect
- **Inputs**: Inset neumorphic fields

#### Color Palette
- **Background**: Light (#e0e5ec) or Dark (#2d3436)
- **Elements**: Same as background (monochrome)
- **Text**: Medium contrast (#555 on light, #ddd on dark)
- **Accents**: Subtle brand color tints

#### Critical Constraints
- **Contrast**: WCAG AA minimum required
- **Use Sparingly**: Not for text-heavy sections
- **Light Source**: Consistent top-left direction
- **Performance**: Limit number of neumorphic elements

---

### 4. Neobrutalism Theme

**Visual Identity**: Raw, bold, function-first with aggressive aesthetics

#### Core Properties
```css
/* Brutalist Card */
background: #FFD700; /* Desaturated vibrant */
border: 4px solid #000;
box-shadow: 8px 8px 0 #000; /* Sharp, no blur */
border-radius: 0; /* Optional: small radius for web */

/* Button States */
transform: translate(-4px, -4px);
box-shadow: 12px 12px 0 #000;
```

#### Layout Approach
- **Sections**: Asymmetric, overlapping boxes
- **Cards**: Thick borders, sharp shadows, bold positioning
- **Typography**: Oversized headlines (48-96px), black/white contrast
- **Navigation**: Chunky, geometric buttons

#### Color Palette
- **Primary**: Desaturated vibrant yellow (#FFD700), cyan (#00BFFF)
- **Secondary**: Hot pink (#FF69B4), lime (#32CD32)
- **Text**: Pure black (#000) or white (#FFF)
- **Borders/Shadows**: Always black
- **Saturation**: Never exceed 80%

#### Typography
```css
h1 {
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 900;
  line-height: 0.9;
  text-transform: uppercase;
}
```

#### Philosophy
- Embrace "ugly" aesthetics
- Prioritize function over comfort
- Challenge traditional layouts
- Raw HTML semantics visible

---

### 5. Retrofuturism Theme

**Visual Identity**: 80s/90s sci-fi nostalgia meets modern technology

#### Core Properties
```css
/* Neon Glow Effect */
color: #0ff;
text-shadow:
  0 0 10px #0ff,
  0 0 20px #0ff,
  0 0 30px #0ff;

/* Grid Background */
background: #000;
background-image:
  linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
background-size: 50px 50px;

/* Metallic Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
```

#### Layout Approach
- **Background**: Dark with wireframe grids or starfield
- **Elements**: Neon-bordered panels with glow effects
- **Typography**: Pixelated or sharp geometric fonts
- **Animations**: Glitch effects, scanlines, CRT flicker

#### Color Palette
- **Background**: Black (#000) or deep purple (#1a0033)
- **Neon Primaries**: Electric blue (#0ff), hot pink (#f0f), lime (#0f0)
- **Neon Secondaries**: Neon orange (#ff6600), yellow (#ff0)
- **Metals**: Chrome gradients, holographic effects
- **Text**: Bright neon on dark backgrounds

#### Visual Effects
```css
/* Glitch Animation */
@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}

/* Scanlines */
&::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    transparent 50%,
    rgba(0, 255, 255, 0.1) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
}
```

#### Typography
- **Headers**: Orbitron, Audiowide, or custom pixelated fonts
- **Body**: Monospace or geometric sans-serif
- **Effects**: Glow, chromatic aberration, holographic

---

### 6. Bold Minimalism Theme

**Visual Identity**: "Less is impactful" - strategic boldness in minimal space

#### Core Properties
```css
/* Container */
max-width: 1200px;
margin: 0 auto;
padding: 4rem 2rem;

/* Typography */
h1 {
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* White Space */
section { padding: 8rem 0; }
.content { margin-bottom: 4rem; }
```

#### Layout Approach
- **Sections**: Maximum vertical spacing (6-8rem)
- **Content**: Centered, narrow content columns
- **Typography**: Oversized headlines with breathing room
- **Images**: Large, high-quality, purposeful placement

#### Color Palette
- **Background**: Pure white (#FFF) or off-white (#FAFAFA)
- **Text**: Near-black (#1a1a1a)
- **Accent**: Single vibrant color (Athletic Violet or Blue)
- **Limited Palette**: 2-3 colors maximum

#### Typography
- **Headings**: Inter Variable (700-900 weight), huge scale
- **Body**: Inter Variable (400), 18-20px, 1.7 line-height
- **Hierarchy**: Extreme size contrast (7rem → 1.125rem)

#### White Space Strategy
- **Between Sections**: 6-8rem vertical
- **Around Headlines**: 3rem top, 2rem bottom
- **Content Width**: 700px max for readability
- **Grid Gaps**: 3-4rem for grid layouts

---

## Theme Selector Component

### Camera-Inspired UI

```tsx
interface ThemeSelectorProps {
  currentTheme: DesignTheme;
  onThemeChange: (theme: DesignTheme) => void;
}

// Visual Design: Camera mode dial
// Position: Fixed top-right (desktop) or bottom sheet (mobile)
// Appearance: Circular dial with theme icons
```

### Theme Icons
- **Glassmorphism**: Frosted glass pane icon
- **Bento Grid**: 3×3 grid icon
- **Neumorphism**: Embossed circle icon
- **Neobrutalism**: Bold square with thick border
- **Retrofuturism**: Neon wireframe cube
- **Bold Minimalism**: Single bold dot

### Interaction
- Click to expand full selector
- Smooth theme transition (300ms fade)
- Persist selection in localStorage
- Keyboard accessible (arrow keys)

---

## Technical Implementation

### Context API
```tsx
interface ExperimentalLayoutState {
  currentTheme: DesignTheme;
  isTransitioning: boolean;
  themes: ThemeConfig[];
}

type DesignTheme =
  | 'glassmorphism'
  | 'bento-grid'
  | 'neumorphism'
  | 'neobrutalism'
  | 'retrofuturism'
  | 'bold-minimalism';
```

### Theme Switching Strategy
1. **CSS Variables**: Dynamic theme properties
2. **Component Variants**: Theme-specific component implementations
3. **Lazy Loading**: Load theme components on-demand
4. **Smooth Transitions**: Crossfade between themes (300ms)

### Performance Considerations
- Lazy load theme CSS
- Preload next theme on hover
- Use CSS containment for theme isolation
- Limit backdrop-filter usage (glassmorphism)
- Optimize shadow rendering (neumorphism)

---

## Accessibility Requirements

### WCAG Compliance
- ✅ Color contrast ≥ 4.5:1 (text)
- ✅ Color contrast ≥ 3:1 (UI components)
- ✅ Keyboard navigation for theme selector
- ✅ Screen reader announcements for theme changes
- ✅ Reduced motion alternatives for animations
- ✅ Focus indicators on all interactive elements

### Theme-Specific Considerations
- **Glassmorphism**: High-contrast mode fallback
- **Neumorphism**: Enhanced contrast for low vision
- **Neobrutalism**: Already high contrast
- **Retrofuturism**: Dark mode accessibility
- **All Themes**: Skip to content link

---

## Content Adaptation

### Sections to Implement
1. **Hero/Capture**: Theme-appropriate hero treatment
2. **About/Focus**: Biography with theme styling
3. **Projects/Frame**: Project showcase in theme layout
4. **Contact/Portfolio**: Contact form with theme UI

### Photography Content
- Maintain photography metaphor across themes
- Adapt camera terminology to theme aesthetic
- Preserve accessibility of photo galleries

---

## Testing Strategy

### Visual Regression
- Screenshot tests for each theme
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Responsive breakpoints (mobile, tablet, desktop)

### Accessibility Testing
- axe-core automated testing
- Manual keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver)

### Performance Testing
- Lighthouse scores per theme
- Theme switching performance
- Bundle size analysis

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create ExperimentalLayoutContext
- [ ] Create ExperimentalLayout container
- [ ] Add URL parameter detection in App.tsx
- [ ] Create ThemeSelector component

### Phase 2: Theme Implementation (Weeks 2-4)
- [ ] Glassmorphism theme (Week 2)
- [ ] Bento Grid theme (Week 2)
- [ ] Neobrutalism theme (Week 3)
- [ ] Bold Minimalism theme (Week 3)
- [ ] Retrofuturism theme (Week 4)
- [ ] Neumorphism theme (Week 4)

### Phase 3: Polish & Testing (Week 5)
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Visual regression testing
- [ ] Documentation completion

---

## Success Metrics

### User Engagement
- Time spent in experimental layout
- Theme switches per session
- Bounce rate comparison

### Technical Performance
- Lighthouse score ≥ 90 per theme
- Theme switch time < 500ms
- Bundle size increase < 100KB

### Portfolio Impact
- Demonstrates design versatility
- Shows technical depth
- Provides unique differentiator

---

## References

- **Glassmorphism**: https://clay.global/blog/glassmorphism-ui
- **Bento Grids**: https://bentogrids.com/
- **Neumorphism**: https://neumorphism.io/
- **Neobrutalism**: https://www.svgator.com/blog/what-is-neubrutalism/
- **Retrofuturism**: https://blog.logrocket.com/ux-design/retro-futuristic-ux-designs-bringing-back-the-future/
- **Bold Minimalism**: https://www.mockplus.com/blog/post/bold-minimalism-guide

---

**Document Version**: 1.0
**Last Updated**: 2025-10-11
**Author**: AI Architecture Team
**Status**: Specification Complete - Ready for Implementation
