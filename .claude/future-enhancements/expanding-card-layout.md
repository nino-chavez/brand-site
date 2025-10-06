# Expanding Card Layout Pattern

**Status**: Future Enhancement
**Priority**: Low
**Target Layout**: Experimental Layouts (Canvas/Timeline)
**Estimated Effort**: Medium (2-3 hours)

## Overview

An alternative interaction pattern for project detail panels where content expands in-place within the grid layout, rather than using overlays or popovers.

## Design Pattern

### How It Works
1. User clicks a project card
2. The clicked card animates its height to expand
3. Detailed project information reveals within the expanded card
4. All other cards shift down smoothly to make space
5. Only one card can be expanded at a time

### Visual Behavior
```
Before Click:           After Click:
┌─────┐ ┌─────┐ ┌─────┐   ┌─────┐ ┌─────┐ ┌─────┐
│  A  │ │  B  │ │  C  │   │  A  │ │  B  │ │  C  │
└─────┘ └─────┘ └─────┘   └─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐ ┌─────┐   ┌─────────────────────┐
│  D  │ │  E  │ │  F  │   │         E           │
└─────┘ └─────┘ └─────┘   │  (expanded details) │
                          └─────────────────────┘
                          ┌─────┐ ┌─────┐ ┌─────┐
                          │  D  │ │  F  │ │     │
                          └─────┘ └─────┘ └─────┘
```

## Implementation Recommendations

### Technology Stack
- **Framer Motion**: Use `layout` prop for smooth repositioning
- **CSS Grid**: Use `grid-template-rows: auto` with transitions
- **React Hooks**: `useState` for expanded card tracking

### Code Example
```tsx
import { motion, AnimatePresence } from 'framer-motion';

const ProjectCard = ({ project, isExpanded, onToggle }) => {
  return (
    <motion.div
      layout
      onClick={onToggle}
      animate={{
        height: isExpanded ? 'auto' : '400px'
      }}
      transition={{
        layout: { duration: 0.4, ease: 'easeInOut' }
      }}
    >
      <CardThumbnail {...project} />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ProjectDetails {...project} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

## Pros & Cons

### Advantages ✅
- **Zero Context Loss**: User never loses their place in the grid
- **Smooth Animation**: Creates a polished, magazine-like browsing experience
- **Mobile-Friendly**: No modals or complex overlays to manage
- **Comparison-Friendly**: All projects remain visible while one is expanded

### Disadvantages ❌
- **Layout Reflow**: Can cause significant page shift if expanded content is tall
- **Single Selection**: Can only view one project's details at a time
- **Performance**: May struggle with very large grids (50+ items)
- **Accessibility**: Requires careful focus management for keyboard navigation

## Use Cases

### Best For
- Portfolios with uniform project complexity (similar detail lengths)
- Photography/design showcases where visual flow matters
- Marketing/landing pages with 6-12 featured projects
- Canvas/Timeline experimental layouts

### Not Recommended For
- Large portfolios (20+ projects) where scrolling becomes unwieldy
- Projects with highly variable detail lengths
- Comparison-heavy scenarios (evaluating multiple projects side-by-side)
- Traditional scrolling layout (current implementation is better)

## Integration Plan

### Phase 1: Prototype (1-2 hours)
1. Create new component `ExpandingProjectCard.tsx`
2. Add Framer Motion dependency
3. Build basic expand/collapse behavior
4. Test with 6 sample projects

### Phase 2: Polish (1 hour)
5. Add smooth layout animations
6. Implement keyboard navigation (Enter to expand, Esc to collapse)
7. Add ARIA attributes for screen readers
8. Test mobile responsiveness

### Phase 3: Integration (30 min)
9. Add toggle in Canvas/Timeline layout settings
10. Update documentation
11. Add to experimental features list

## Design Considerations

### Animation Timing
- Expansion: 400ms ease-in-out
- Collapse: 300ms ease-in
- Sibling card repositioning: Framer Motion `layout` auto-animation

### Accessibility
```tsx
<motion.div
  role="button"
  tabIndex={0}
  aria-expanded={isExpanded}
  aria-label={`${project.title} - ${isExpanded ? 'Collapse' : 'Expand'} details`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }}
>
```

### Mobile Behavior
- On mobile (<768px): Auto-expand to full width
- On tablet (768px-1024px): Expand within grid, 2-column layout
- On desktop (>1024px): Expand within grid, 3-column layout

## Performance Optimization

### Lazy Rendering
Only render expanded content when card is open:
```tsx
{isExpanded && <ProjectDetails {...project} />}
```

### Virtual Scrolling
For large grids (30+ projects), consider react-window:
```tsx
import { VariableSizeList } from 'react-window';
```

### Image Optimization
Defer loading detail images until expansion:
```tsx
<img
  src={isExpanded ? detailImage : thumbnailImage}
  loading="lazy"
/>
```

## Testing Strategy

### Unit Tests
- Expand/collapse state management
- Keyboard navigation (Enter, Space, Escape)
- ARIA attribute updates

### Integration Tests
- Multiple card interaction (closing one opens another)
- Scroll position preservation
- Layout reflow performance

### Visual Regression Tests
- Animation smoothness (Playwright)
- Mobile responsive behavior
- Focus state visibility

## Related Patterns

### Current Implementation
- **Intelligent Popover** (desktop): Viewport-aware positioning with Floating UI
- **Full-Screen Modal** (mobile): Standard modal overlay

### Alternative Patterns
- **Accordion**: Similar expand/collapse, but typically vertical-only
- **Masonry Grid**: Pinterest-style layout with variable heights
- **Slide-Out Panel**: Fixed side panel (current implementation fallback)

## Decision Log

**Why Not Implement Now?**
1. Current popover solution solves the viewport problem elegantly
2. Expanding cards require Framer Motion dependency (28kb gzipped)
3. Traditional layout works well for primary use case
4. Better suited for experimental layouts where we can be playful

**When to Revisit?**
- User feedback indicates interest in comparison-heavy browsing
- Canvas/Timeline layouts are promoted to stable
- Portfolio grows to 20+ projects and navigation becomes cumbersome
- Photography showcase section needs magazine-style browsing

## References

- [Framer Motion Layout Animations](https://www.framer.com/motion/layout-animations/)
- [CSS Tricks: Expandable Card Pattern](https://css-tricks.com/expanding-cards/)
- [Material Design: Expanding Elements](https://material.io/archive/guidelines/patterns/expanding-elements.html)

---

**Last Updated**: 2025-10-04
**Author**: Claude (Sonnet 4.5) + Nino Chavez
**Review Status**: Draft - Ready for Future Consideration
