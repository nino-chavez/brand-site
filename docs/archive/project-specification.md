# Nino Chavez Portfolio: "The Moment of Impact"

## Project Overview
A bold, modern, and memorable single-page personal brand website that is aggressively non-template. Every interaction, animation, and layout choice must feel bespoke, intentional, and reflective of a personal brand that sits at the intersection of technology and athletics.

## Core Creative Metaphors
The entire design is driven by a central theme: **"The Moment of Impact."** This concept blends two domains:

### Athletics (Volleyball)
The precision, timing, and power of a perfect volleyball spike. The UI should feel fast, precise, and impactful.

### Technology (Photography & Engineering)
The focus and clarity of capturing a perfect photograph or the moment an architectural decision solidifies. The interface should reveal underlying data and technical details.

## Information Architecture ("Game Flow")
The site structure follows the six rotations of a volleyball game:

1. **Equipment Check** (Hero — viewfinder)
2. **Warm-Up** (About)
3. **Game Time** (Projects — burst sequence)
4. **Training** (Insights / Blog)
5. **Action Shots** (Photography Gallery) — Display the full set of ~26 images from `public/images/gallery`
6. **Post-Game** (Contact)

## Key Component Designs

### Hero Section → "Frame Capture"
**Concept**: Abolish the standard hero banner. Create an interactive, full-screen camera viewfinder.

**Visuals**: Features a single, high-impact background photograph from `public/images/gallery`. The image loads blurred and animates into sharp focus on page load. Layered on top, the viewport is framed by viewfinder lines with corner elements displaying technical skills as camera metadata (e.g., ISO: React/Next.js). Uses monospace font for this data.

**Interaction**: The main CTA reads "Capture the Moment." On click, it triggers a camera shutter animation, transitioning sharply to the next section.

### Navigation → "Game Flow"
**Concept**: Eliminate the standard navigation bar. Use an abstract representation of the six volleyball rotation positions to navigate between sections.

**Specification**: The six section anchors should be in a circular or 3×2 layout. The active position must be clearly highlighted. The entire navigation component must be keyboard navigable. Scrolling should use snap-scroll to each section, with scroll-padding-top to account for any sticky header elements.

### Project Display → "Photo Sequence"
**Concept**: Display projects as a "burst mode" sequence of shots, not a simple grid.

**Overlay Labels**: On hover, an overlay appears showing technical details styled as EXIF data. Labels: PROJECT, STACK, ROLE, DATE, SPEED (performance note), FOCUS (core technical decision).

**Interaction**: Clicking a card expands to a "behind the shot" panel, revealing the architectural rationale.

### Storytelling → "Split-Screen & Depth-of-Field"
**Concept**: For specific case studies, use a split-screen layout where the left side shows technical architecture diagrams and the right side shows action sports sequences.

**Interaction**: The entrance of elements on both sides should be synchronized using the timing-based motion durations specified below (setup→approach→contact→follow-through).

**Effects**: Use CSS `filter: blur()` to create depth-of-field effects, gated by the `prefers-reduced-motion` media query.

## Technical & Visual Specifications

### Non-Template Guardrails
- Do not use boilerplate hero/nav components, prebuilt theme kits, or generic templates
- No stock "card grid" or "three equal columns" layouts
- All animations must be authored directly in Framer Motion or CSS

### Design Tokens
**Colors**:
- `--court-navy: #0B2239` (primary)
- `--court-orange: #F26B1D` (impact)
- `--brand-violet: #7C3AED` (accent)
- `--bg-dark: #0F172A`
- `--bg-light: #F8FAFC`

**Motion**:
- `--ease-athletic: cubic-bezier(0.2, 0.6, 0.2, 1)`
- **Durations**: 120ms (setup), 220ms (approach), 90ms (impact), 160ms (follow-through)

### Performance Targets
- **Largest Contentful Paint (LCP)** ≤ 2.5s on a mobile connection
- **Cumulative Layout Shift (CLS)** < 0.1
- Animate only `transform` and `opacity` properties
- Use modern image formats (AVIF/WebP) with fallbacks
- Use `loading="lazy"` and `decoding="async"` where appropriate

### Accessibility & Motion
- Honor `prefers-reduced-motion`: disable the camera flash and large transform/blur animations; show a static, focused image instead
- Provide clear focus states for all interactive elements
- Maintain a minimum 4.5:1 color contrast ratio for text
- If adding sound, it must be off by default, user-togglable, and never auto-play

## First Implementation: "Frame Capture" Hero

### Component Requirements
- Accept a `src` prop for a background image (e.g., from `public/images/gallery/portfolio-01.jpg`)
- The image should fill the container
- Initial `filter: blur()` applied, animate from blurred to sharp using Framer Motion on component mount
- Ensure the initial background image is optimized and prioritized (priority prop) to meet the LCP target
- Other gallery images should not be preloaded
- The shutter button must be accessible, labeled "Capture the Moment"
- On click, trigger a white overlay flash (animate opacity 0→1→0 in ≤120ms), then smooth scroll to the `#work` section
- For `prefers-reduced-motion`, skip the flash and blur animations; perform an instant scroll

### Manual Test Checklist
- [ ] Keyboard focus works correctly
- [ ] Reduced motion behavior functions properly
- [ ] Mobile viewport correctness (100dvh)
- [ ] LCP budget is met
- [ ] Viewfinder frame and metadata HUD are clearly rendered
- [ ] Entrance and button-click animations perform as specified
- [ ] Component meets all accessibility and performance targets

### Acceptance Criteria
- **Visuals**: The hero background image loads blurred and animates to focus. The viewfinder frame and metadata HUD are clearly rendered on top.
- **Motion**: The entrance and button-click animations perform as specified.
- **A11y/Perf**: The component meets all targets defined in the specifications.