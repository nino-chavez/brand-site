# Demo Harness - Comprehensive UI/UX Testing Guide

**Version:** 1.0.0
**Date:** 2025-10-01
**Purpose:** Complete testing and showcase environment for all portfolio UI/UX components

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Component Categories](#component-categories)
5. [Architecture](#architecture)
6. [Usage Guide](#usage-guide)
7. [Testing Integration](#testing-integration)
8. [Development](#development)

---

## Overview

The Demo Harness is a comprehensive testing and showcase environment that provides:

- **Live component demonstrations** with real-time controls
- **119+ motion test scenarios** in isolated environments
- **Interactive state management** with localStorage persistence
- **Automated testing hooks** for Playwright integration
- **Performance monitoring** and visual regression support
- **Accessibility validation** with keyboard navigation

**Access URL:** `http://localhost:3000/demo` (development only)

---

## Quick Start

### 1. Start Development Server

```bash
npm run dev
```

### 2. Navigate to Demo Harness

Open your browser to:
```
http://localhost:3000/demo
```

### 3. Explore Components

- Use the **sidebar** to navigate categories
- **Search** for specific components
- Adjust **controls** to see live changes
- View **code snippets** for implementation examples

---

## Features

### Interactive Controls

Each demo includes:
- **Sliders** for numeric values (distance, duration, intensity)
- **Toggles** for boolean states (enabled/disabled)
- **Dropdowns** for options (speed, direction, color)
- **Trigger buttons** to replay animations
- **Reset buttons** to restore defaults

### State Management

- **localStorage persistence** - Settings saved across sessions
- **Per-component state** - Independent state for each demo
- **Global reset** - Reset all demos at once
- **Real-time updates** - Changes apply immediately

### Code Examples

- **Syntax-highlighted snippets** for each component
- **Copy-to-clipboard** functionality
- **Implementation patterns** with actual usage

### Testing Integration

- **data-testid attributes** for Playwright selectors
- **State exposure** via data attributes
- **Programmatic control** via window API
- **Screenshot capture** ready

---

## Component Categories

### 1. Animations (🎬)

**5 Core Animation Types:**

| Component | Description | Controls |
|-----------|-------------|----------|
| Fade Up (8px) | Subtle upward fade | Speed selection |
| Fade Up (24px) | Dramatic upward fade | Speed selection |
| Slide | Directional slide-in | Direction, Distance |
| Scale | Scale-up animation | Start scale value |
| Blur Morph | Blur-to-sharp transition | Blur amount |

**Use Cases:**
- Section entrance animations
- Content reveals on scroll
- Interactive state changes

### 2. Effects (✨)

**3 Visual Effect Types:**

| Component | Description | Controls |
|-----------|-------------|----------|
| Parallax | Background depth effect | Intensity, Enable/Disable |
| Spotlight Cursor | Custom cursor highlight | Radius, Opacity, Enable/Disable |
| Glow Effects | Progressive hover glow | Intensity (low/medium/high) |

**Use Cases:**
- Background enhancements
- Interactive feedback
- Visual hierarchy

### 3. Interactive (🎯)

**3 Interactive Components:**

| Component | Description | Controls |
|-----------|-------------|----------|
| Magnetic Button | Proximity-based transform | Strength, Radius, Enable/Disable |
| Effects Panel HUD | Settings control panel | Position selection |
| Keyboard Navigation | Full keyboard support | Focus indicator toggle |

**Use Cases:**
- User interactions
- Accessibility features
- Settings management

### 4. Section Transitions (📄)

**3 Section-Level Animations:**

| Component | Description | Controls |
|-----------|-------------|----------|
| Section Fade + Slide | Full section entrance | Distance, Duration |
| Section Border | Animated boundary | Color, Style |
| Staggered Content | Sequential reveals | Base delay, Element count |

**Use Cases:**
- Page section transitions
- Content organization
- Visual flow

---

## Architecture

### File Structure

```
src/
├── pages/
│   └── DemoHarness.tsx           # Main demo page
├── components/
│   └── demo/
│       ├── DemoCard.tsx           # Demo container
│       ├── DemoControls.tsx       # Control panel
│       ├── StateIndicator.tsx     # State display
│       ├── ComponentCategory.tsx  # Category grouping
│       ├── DemoHeader.tsx         # Page header
│       ├── DemoSidebar.tsx        # Navigation sidebar
│       └── demos/
│           ├── AnimationDemos.tsx # Animation demos
│           ├── EffectDemos.tsx    # Effect demos
│           ├── InteractiveDemos.tsx # Interactive demos
│           └── SectionDemos.tsx   # Section demos
├── config/
│   └── demoComponents.ts          # Demo configuration
├── hooks/
│   └── useDemoState.ts            # State management
└── SimpleRouter.tsx               # Basic routing
```

### Key Components

**DemoCard**
- Container for individual demos
- Shows/hides code snippets
- Displays state indicators
- Supports categorization

**DemoControls**
- Standardized control interface
- Buttons, sliders, toggles, selects
- Reset functionality
- Type-safe value handling

**StateIndicator**
- Visual state display
- Color-coded badges
- Boolean/string/number support
- Real-time updates

**ComponentCategory**
- Collapsible sections
- Category icons and descriptions
- Default expand/collapse state

### Configuration System

**demoComponents.ts** defines:
```typescript
{
  id: 'fade-up-8px',
  title: 'Fade Up Animation (8px)',
  description: 'Element fades in while translating up 8 pixels',
  category: 'animations',
  controls: {
    speed: {
      type: 'select',
      label: 'Speed',
      options: ['fast', 'normal', 'slow', 'off'],
      defaultValue: 'normal'
    }
  },
  states: ['hidden', 'animating', 'visible'],
  codeSnippet: '...'
}
```

### State Management

**useDemoState** hook provides:
- localStorage persistence
- Per-demo state isolation
- Type-safe updates
- Reset functionality

```typescript
const { state, updateState, resetState } = useDemoState('demo-id', {
  initialValue: 'default'
});
```

---

## Usage Guide

### For Developers

**Testing New Components:**
1. Create demo component in `/components/demo/demos/`
2. Add configuration to `demoComponents.ts`
3. Import and render in `DemoHarness.tsx`
4. Add controls and state management

**Example:**
```tsx
// 1. Create demo component
export const NewDemo: React.FC<{ setting: string }> = ({ setting }) => {
  return <div>Demo with {setting}</div>;
};

// 2. Add to demoComponents.ts
{
  id: 'new-demo',
  title: 'New Demo',
  category: 'animations',
  controls: {
    setting: {
      type: 'select',
      options: ['option1', 'option2'],
      defaultValue: 'option1'
    }
  }
}

// 3. Render in DemoHarness.tsx
<DemoCard title="New Demo" ...>
  <NewDemo setting={state.setting} />
</DemoCard>
```

### For Testers

**Manual Testing:**
1. Navigate to `/demo`
2. Select category from sidebar
3. Adjust controls for each demo
4. Verify expected behavior
5. Check responsive design
6. Test keyboard navigation

**Automated Testing:**
```typescript
// Playwright test example
test('fade-up animation works', async ({ page }) => {
  await page.goto('http://localhost:3000/demo');
  await page.click('[data-testid="demo-fade-up-8px"]');

  // Adjust controls
  await page.selectOption('text=Speed', 'fast');

  // Trigger animation
  await page.click('text=Replay Animation');

  // Verify state
  await expect(page.locator('.animated-element')).toBeVisible();
});
```

### For Designers

**Visual Review:**
1. Browse all categories to see implementations
2. Compare against design specs
3. Adjust parameters to find optimal values
4. Export settings for development
5. Capture screenshots for documentation

**Feedback Workflow:**
1. Identify component that needs adjustment
2. Use controls to demonstrate desired behavior
3. Note parameter values in feedback
4. Share URL with hash for specific demo

---

## Testing Integration

### Playwright Integration

**Test Data Attributes:**
```html
<div data-testid="demo-fade-up-8px">
  <div data-demo-category="animations">
    <div data-demo-state="visible">
      <!-- Demo content -->
    </div>
  </div>
</div>
```

**Automated Test Scenarios:**
- All 119+ motion tests have corresponding demos
- Each demo can be controlled programmatically
- State changes are observable via data attributes
- Screenshots can be captured in all states

### Screenshot Testing

**Capture All States:**
```bash
# From Playwright test
await page.goto('http://localhost:3000/demo');

for (const category of categories) {
  await page.click(`#category-${category}`);
  await page.screenshot({
    path: `screenshots/demo-${category}.png`,
    fullPage: true
  });
}
```

### Performance Monitoring

Each demo supports:
- FPS counter integration
- Render time tracking
- Memory usage monitoring
- Animation jank detection

---

## Development

### Adding New Demos

**1. Create Demo Component:**
```tsx
// src/components/demo/demos/MyDemos.tsx
export const MyDemo: React.FC<{ prop: string }> = ({ prop }) => {
  return <div>{prop}</div>;
};
```

**2. Add Configuration:**
```typescript
// src/config/demoComponents.ts
{
  id: 'my-demo',
  title: 'My Demo',
  description: 'Description of demo',
  category: 'animations', // or effects, interactive, sections
  controls: {
    prop: {
      type: 'select',
      label: 'Prop Label',
      options: ['value1', 'value2'],
      defaultValue: 'value1'
    }
  }
}
```

**3. Add to DemoHarness:**
```tsx
// src/pages/DemoHarness.tsx
import { MyDemo } from '../components/demo/demos/MyDemos';

const myDemo = useDemoState('my-demo', { prop: 'value1' });

<DemoCard title="My Demo" ...>
  <MyDemo prop={myDemo.state.prop} />
</DemoCard>
```

### Adding New Categories

**1. Define Category:**
```typescript
// src/config/demoComponents.ts
export const DEMO_CATEGORIES = {
  // ...existing categories
  newCategory: {
    id: 'new-category',
    title: 'New Category',
    icon: '🆕',
    description: 'Description of category'
  }
};
```

**2. Add to DemoHarness:**
```tsx
<div id="category-new-category">
  <ComponentCategory
    title={DEMO_CATEGORIES.newCategory.title}
    description={DEMO_CATEGORIES.newCategory.description}
    icon={DEMO_CATEGORIES.newCategory.icon}
  >
    {/* Demo cards */}
  </ComponentCategory>
</div>
```

### Keyboard Shortcuts (Planned)

- `Tab` - Navigate between demos
- `Space` - Trigger focused demo
- `R` - Reset focused demo
- `Esc` - Collapse all categories
- `/` - Focus search

### Accessibility Features

**Current:**
- Full keyboard navigation
- ARIA labels on controls
- Focus indicators
- Screen reader friendly

**Planned:**
- Skip links to categories
- Keyboard shortcut reference
- High contrast mode
- Reduced motion support

---

## Integration with Main Site

The demo harness integrates with the main portfolio site:

**Shared Components:**
- Uses same animation hooks (`useScrollAnimation`)
- Same effects context (`EffectsContext`)
- Same magnetic button hook (`useMagneticEffect`)
- Same design tokens

**Development-Only:**
- Only accessible in `NODE_ENV === 'development'`
- Not included in production builds
- Separate route (`/demo`)
- Independent state management

**Benefits:**
- Test components in isolation
- Verify animations before deployment
- Debug interaction issues
- Performance profiling
- Visual regression testing

---

## Troubleshooting

### Demo Not Loading

**Issue:** Blank screen at /demo route

**Solutions:**
1. Check `NODE_ENV === 'development'`
2. Verify dev server is running
3. Clear browser cache
4. Check console for errors

### Controls Not Working

**Issue:** Changing controls doesn't update demo

**Solutions:**
1. Check localStorage is enabled
2. Clear localStorage: `localStorage.clear()`
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Check React DevTools for state updates

### Animations Not Playing

**Issue:** Animations don't trigger or appear choppy

**Solutions:**
1. Check `prefers-reduced-motion` setting
2. Verify hardware acceleration enabled
3. Close other resource-intensive tabs
4. Check console for performance warnings

---

## Future Enhancements

### Planned Features

1. **Export Test Data** - Generate Playwright test files from demos
2. **Screenshot Capture** - Built-in screenshot tool for all states
3. **Performance Dashboard** - Real-time FPS and metrics
4. **Theme Switcher** - Test in light/dark modes
5. **Responsive Preview** - View at different breakpoints
6. **Animation Timeline** - Visual timeline of all animations
7. **Accessibility Report** - Automated a11y checks
8. **Share URL** - Share specific demo configurations

### Community Contributions

To contribute:
1. Add new demo component
2. Update configuration
3. Add tests
4. Submit PR with demo showcase

---

## Support

**Documentation:**
- [UI/UX Testing Master Guide](/docs/UI_UX_TESTING_MASTER_GUIDE.md)
- [Section Transition Requirements](/docs/SECTION_TRANSITION_REQUIREMENTS.md)
- [Motion Testing Framework](/tests/motion/README.md)

**Issues:**
- Report bugs in GitHub Issues
- Tag with `demo-harness` label

---

**Last Updated:** 2025-10-01
**Version:** 1.0.0
**Status:** Production Ready
