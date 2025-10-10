# Portfolio Sections - Photography Metaphor Guide

**Location**: `/components/sections/`
**Used by**: All 3 layout modes (Traditional, Canvas, Timeline)

---

## Quick Reference

| File Name | Standard Term | Actual Content | Section ID |
|-----------|---------------|----------------|------------|
| `CaptureSection.tsx` | **Hero Section** | Introduction, tagline, primary CTA | `capture` |
| `FocusSection.tsx` | **About Section** | Biography, professional background | `focus` |
| `FrameSection.tsx` | **Projects Section** | Case studies, technical work | `frame` |
| `ExposureSection.tsx` | **Skills Section** | Technical stack, expertise | `exposure` |
| `DevelopSection.tsx` | **Gallery Section** | Photography portfolio | `develop` |
| `PortfolioSection.tsx` | **Contact Section** | Contact form, social links | `portfolio` |

---

## Photography Metaphor Explained

These sections follow a photographer's workflow as a narrative device:

```
┌─────────────────────────────────────────────────────────────────┐
│  CAPTURE → FOCUS → FRAME → EXPOSURE → DEVELOP → PORTFOLIO       │
│                                                                   │
│  The complete photography process from initial shot to delivery  │
└─────────────────────────────────────────────────────────────────┘
```

### 1. **Capture** (Hero/Introduction)
- **Metaphor**: Capture the decisive moment
- **Content**: First impression, value proposition, primary CTA
- **User Goal**: Understand who this person is and why they matter
- **Example**: "Enterprise Architect. Action Sports Photographer."

### 2. **Focus** (About/Biography)
- **Metaphor**: Focus on the subject's story
- **Content**: Professional background, expertise areas, personal narrative
- **User Goal**: Learn about experience and credibility
- **Example**: Biography, career highlights, qualifications

### 3. **Frame** (Projects/Work)
- **Metaphor**: Frame the composition, showcase the work
- **Content**: Case studies, technical projects, achievements
- **User Goal**: See evidence of capabilities
- **Example**: E-commerce platform architecture, system integrations

### 4. **Exposure** (Skills/Tech Stack)
- **Metaphor**: Adjust exposure settings (aperture, ISO, shutter)
- **Content**: Technical skills, tools, technologies, methodologies
- **User Goal**: Understand technical depth and breadth
- **Example**: React, TypeScript, AWS, SAP Commerce, Agile

### 5. **Develop** (Gallery/Photography)
- **Metaphor**: Develop the film, reveal the image
- **Content**: Action sports photography portfolio, visual work
- **User Goal**: See creative capabilities and passion projects
- **Example**: Volleyball, basketball, surfing photography

### 6. **Portfolio** (Contact/Connect)
- **Metaphor**: Deliver the portfolio, complete the engagement
- **Content**: Contact methods, scheduling, social links, final CTA
- **User Goal**: Take action, start conversation
- **Example**: Email, LinkedIn, Cal.com scheduling link

---

## Why This Naming?

### Brand Cohesion
This portfolio uniquely combines:
- **Enterprise Architecture** (professional work)
- **Action Sports Photography** (creative passion)

The photography metaphor creates thematic consistency and differentiation from generic "Hero > About > Projects > Contact" portfolios.

### Narrative Flow
Guides users through a story:
1. **Capture** attention
2. **Focus** on the person
3. **Frame** the achievements
4. **Expose** the capabilities
5. **Develop** the complete picture
6. **Deliver** the connection

---

## Usage in Layouts

All three layouts import from `/components/sections/`:

### Traditional Layout
```typescript
// src/components/sports/SimplifiedGameFlowContainer.tsx
import CaptureSection from '../../../components/sections/CaptureSection';
import FocusSection from '../../../components/sections/FocusSection';
// ... etc
```

### Canvas Layout
```typescript
// src/components/canvas/CanvasPortfolioLayout.tsx
const CaptureSection = lazy(() => import('../../../components/sections/CaptureSection'));
const FocusSection = lazy(() => import('../../../components/sections/FocusSection'));
// ... etc
```

### Timeline Layout
```typescript
// src/components/timeline/FramerTimelineLayout.tsx
import CaptureSection from '../../../components/sections/CaptureSection';
import FocusSection from '../../../components/sections/FocusSection';
// ... etc
```

**Single Source of Truth**: Editing any section file updates all 3 layouts simultaneously.

---

## Common Pitfalls

### ❌ DON'T: Assume file name = content
```typescript
// Wrong assumption
"PortfolioSection must contain my work showcase"
// Actual content: Contact form
```

### ✅ DO: Check this README or file JSDoc
```typescript
/**
 * PortfolioSection - Contact/Connect
 *
 * Photography metaphor: Deliver the portfolio to the client
 * Actual content: Contact form, social links, scheduling
 */
```

### ❌ DON'T: Look for ContactSection.tsx
```typescript
// This file was dead code, now deleted
src/components/layout/ContactSection.tsx  // ❌ Deleted
```

### ✅ DO: Use PortfolioSection.tsx
```typescript
// The actual contact section
components/sections/PortfolioSection.tsx  // ✅ Contact form here
```

---

## For New Developers/Agents

If you're unfamiliar with this codebase:

1. **Read this file first** - Don't guess content from file names
2. **Check ARCHITECTURE_AUDIT.md** - Understand multi-layout system
3. **Use search** - `grep -r "contact.*email" components/sections/` finds PortfolioSection
4. **Ask questions** - Confusion is expected, metaphor is intentional

---

## Section Component API

All sections follow this interface:

```typescript
interface SectionProps {
  active: boolean;           // Is this section currently in viewport?
  progress: number;          // Scroll progress through section (0-1)
  onSectionReady: () => void;  // Callback when section loaded
  onError?: (error: Error) => void;  // Error handler
  className?: string;        // Additional CSS classes
}
```

Usage:
```typescript
<CaptureSection
  active={currentSection === 'capture'}
  progress={scrollProgress}
  onSectionReady={handleReady}
  onError={handleError}
/>
```

---

## Section IDs

HTML IDs and TypeScript types use lowercase photography terms:

```typescript
// src/types/index.ts
export type SectionId =
  | 'capture'   // Hero
  | 'focus'     // About
  | 'frame'     // Projects
  | 'exposure'  // Skills
  | 'develop'   // Gallery
  | 'portfolio' // Contact

// Navigation
const sections = [
  { id: 'capture', title: 'Capture' },
  { id: 'focus', title: 'Focus' },
  { id: 'frame', title: 'Frame' },
  { id: 'exposure', title: 'Exposure' },
  { id: 'develop', title: 'Develop' },
  { id: 'portfolio', title: 'Portfolio' }
];
```

---

## Content Ownership

| Section | Primary Content | Secondary Content |
|---------|-----------------|-------------------|
| Capture | Tagline, role title | Background image, CTA |
| Focus | Biography, expertise | Professional photo |
| Frame | Project cards | Tech tags, links |
| Exposure | Skill categories | Proficiency levels |
| Develop | Photo gallery | EXIF metadata |
| Portfolio | Contact form | Social links, trust signals |

---

## Testing

To test a specific section:

```bash
# Traditional layout
http://localhost:5173/#capture
http://localhost:5173/#focus
http://localhost:5173/#portfolio  # Contact section

# Canvas layout
http://localhost:5173/?layout=canvas  # Pan to sections

# Timeline layout
http://localhost:5173/?layout=timeline  # Scroll horizontally
```

---

## Future Considerations

See `SECTION_NAMING_ANALYSIS.md` for discussion on:
- Renaming to standard terms (HeroSection, AboutSection, etc.)
- Maintaining photography metaphor in UI while standardizing code
- Migration strategies if renaming is chosen

**Current Decision**: Keep photography names, document extensively (this file)

---

## Related Documentation

- **ARCHITECTURE_AUDIT.md** - Multi-layout system analysis
- **SECTION_NAMING_ANALYSIS.md** - Naming standardization proposal
- **DEAD_CODE_FOUND.md** - ContactSection incident report

---

## Quick Lookup

**Looking for...**
- Hero/Introduction → `CaptureSection.tsx`
- About/Bio → `FocusSection.tsx`
- Projects/Work → `FrameSection.tsx`
- Skills/Tech → `ExposureSection.tsx`
- Gallery/Photos → `DevelopSection.tsx`
- Contact/Form → `PortfolioSection.tsx`

**Last Updated**: 2025-10-10
