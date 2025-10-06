# Layout & Alignment UX Heuristics

**Date Created**: 2025-10-05
**Purpose**: Enhanced UX audit criteria for detecting layout and alignment issues
**Context**: Identified gap where visual hierarchy misalignment wasn't caught by standard UX audit

---

## Core Principles

### 1. Visual Hierarchy & Breathing Room

**Principle**: Section headings require dedicated horizontal space to establish dominance in visual hierarchy.

**Heuristics**:
- [ ] Primary headings have clear vertical space before columnar content begins
- [ ] No high-attention elements compete adjacently with section headers
- [ ] Headings span full available width when introducing multi-column content
- [ ] Minimum breathing room: 2-3x the heading's line height before next content block

**Measurable Rule**:
```
If (section has large heading) AND (section has multi-column layout)
Then: Heading should be full-width, columns start below
```

**Example Violation**:
```jsx
// BAD: Timeline box starts at section top, competing with heading
<section>
  <div className="grid grid-cols-2">
    <div>
      <h2>Big Heading</h2>
      <p>Content...</p>
    </div>
    <div>
      <TimelineBox /> <!-- Starts at top, competes with heading -->
    </div>
  </div>
</section>

// GOOD: Heading gets dedicated space, columns align at content baseline
<section>
  <h2>Big Heading</h2> <!-- Full width -->
  <div className="grid grid-cols-2">
    <div>
      <p>Content...</p>
    </div>
    <div>
      <TimelineBox /> <!-- Aligns with prose content -->
    </div>
  </div>
</section>
```

---

### 2. Grid Baseline Alignment

**Principle**: In multi-column layouts, content blocks should align to shared baselines, not section boundaries.

**Heuristics**:
- [ ] Secondary content (sidebars, timelines, metadata) aligns to primary content baseline
- [ ] Column tops align unless there's intentional visual offset
- [ ] Related content blocks share alignment points
- [ ] Grid system uses consistent baseline increments

**Measurable Rule**:
```
If (layout has multiple columns) AND (columns contain related content)
Then: Column content should start at same vertical position
```

**Exceptions**:
- Intentional visual offset for emphasis (document with design rationale)
- Sticky headers or pinned elements
- Decorative elements that shouldn't align with content

---

### 3. Gestalt Principle of Proximity

**Principle**: Elements that relate to each other should be grouped together, including alignment.

**Heuristics**:
- [ ] Timeline boxes align with the content they describe, not section headers
- [ ] Metadata panels align with their related content blocks
- [ ] Navigation elements separate from content with clear spacing
- [ ] Related groups use consistent internal spacing (closer than unrelated groups)

**Measurable Rule**:
```
If (element A describes element B)
Then: A should align to B's baseline, not container top
```

---

### 4. F-Pattern Reading Flow

**Principle**: Users scan left-to-right, top-to-bottom. Layout should support natural reading flow.

**Heuristics**:
- [ ] Primary content path follows natural reading order
- [ ] No high-attention elements interrupt the natural scan line
- [ ] Visual weight decreases as user scans down the page
- [ ] Secondary content positioned to support, not interrupt, primary flow

**Measurable Rule**:
```
If (element has high visual weight) AND (element is adjacent to primary heading)
Then: Reposition to avoid competing for attention
```

---

## Detection Checklist for Audits

### Layout Structure Analysis

```markdown
- [ ] Section headings have dedicated horizontal space
- [ ] Multi-column content aligns to shared baseline
- [ ] Secondary content doesn't compete with primary headers
- [ ] Grid system follows consistent alignment rules
- [ ] Visual weight distribution supports hierarchy
- [ ] No orphaned elements floating between grid cells
- [ ] Consistent spacing between sections (use spacing scale)
- [ ] Related content grouped with tighter spacing than unrelated
```

### Visual Hierarchy Analysis

```markdown
- [ ] Clear dominance hierarchy (H1 > H2 > body text)
- [ ] Heading breathing room proportional to importance
- [ ] No competing elements at same visual weight level
- [ ] Color/contrast reinforces hierarchy
- [ ] Whitespace used intentionally to create grouping
```

### Grid System Analysis

```markdown
- [ ] Baseline grid evident across sections
- [ ] Column alignment consistent
- [ ] Gutters (spacing between columns) appropriate for content density
- [ ] Grid adapts appropriately for mobile/tablet/desktop
- [ ] Content respects grid but doesn't feel constrained
```

---

## Application to Professional Portfolios

### Specific Considerations for Enterprise/B2B Contexts

**Executive Scanning Patterns**:
- Executives scan for credibility signals first
- Timeline/credentials need clear visual separation from narrative
- But still need to align to support parallel processing
- Breathing room communicates confidence and professionalism

**Multi-Audience Optimization**:
- Different audiences consume same content differently
- Layout should support both "scan for credentials" and "read for philosophy"
- Alignment helps guide attention without forcing linear consumption

**Credibility Through Composition**:
- Professional layouts signal attention to detail
- Misalignment creates subconscious doubt
- Enterprise decision-makers notice compositional sloppiness

---

## Audit Application Process

### 1. Visual Inspection Phase

1. Screenshot each section
2. Draw alignment guides (vertical and horizontal)
3. Identify primary/secondary content blocks
4. Check for baseline alignment across columns

### 2. Code Structure Analysis

1. Review grid/flexbox implementations
2. Check for consistent spacing variables
3. Verify semantic HTML structure supports visual hierarchy
4. Identify hardcoded spacing (technical debt indicator)

### 3. Hierarchy Mapping

1. List all heading levels and their importance
2. Map visual weight (size, color, position, whitespace)
3. Identify conflicts or competitions
4. Verify hierarchy matches content importance

### 4. User Flow Analysis

1. Trace natural eye movement path
2. Identify interruptions or distractions
3. Check if layout supports intended user journey
4. Verify secondary content supports, not competes

---

## Common Violations & Fixes

### Violation 1: Timeline Box Competing with Section Header

**Issue**: Timeline/sidebar positioned at section top, competing with heading for attention

**Fix**: Move heading outside grid, let columns align at content baseline

**Code Pattern**:
```jsx
// Before (violation)
<section>
  <div className="grid grid-cols-2">
    <div><h2>Heading</h2><Content /></div>
    <div><Timeline /></div>
  </div>
</section>

// After (corrected)
<section>
  <h2>Heading</h2>
  <div className="grid grid-cols-2">
    <div><Content /></div>
    <div><Timeline /></div>
  </div>
</section>
```

### Violation 2: Inconsistent Baseline Alignment

**Issue**: Columns start at different vertical positions without design rationale

**Fix**: Add consistent padding or use flexbox align-items

### Violation 3: Visual Weight Imbalance

**Issue**: Too many high-weight elements competing for attention

**Fix**: Reduce visual weight of secondary elements (smaller, lighter, less contrast)

---

## Integration with Existing Audits

This checklist complements:
- **Accessibility audits**: Semantic structure supports both visual and screen reader hierarchy
- **Performance audits**: Proper layout reduces reflow/repaint issues
- **Content audits**: Visual hierarchy supports content priority
- **Brand audits**: Consistent composition reflects professionalism

---

## Success Metrics

**How to Measure Effectiveness**:
- Reduced "is this aligned?" questions during reviews
- Faster comprehension of content hierarchy (measured through user testing)
- Increased time-on-page for target sections
- Improved conversion rates for CTAs positioned with proper hierarchy

---

## Continuous Improvement

**When to Update This Document**:
- New violation patterns identified
- User feedback indicates hierarchy confusion
- A/B testing reveals better alignment approaches
- Industry best practices evolve

**Feedback Loop**:
- Document violations caught by humans but missed by agents
- Update heuristics to catch future instances
- Add to agent prompt templates
- Validate with design system consistency checks
