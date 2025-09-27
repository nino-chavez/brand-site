# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-25-volleyball-rotation-nav/spec.md

> Created: 2025-09-25
> Version: 1.0.0

## Technical Requirements

### Component Specifications

#### VolleyballRotationNav Component
- **File:** `components/VolleyballRotationNav.tsx`
- **Purpose:** Main navigation component replacing traditional horizontal nav
- **Props Interface:**
  ```typescript
  interface VolleyballRotationNavProps {
    currentSection: string;
    onSectionChange: (sectionId: string) => void;
    isScrolling: boolean;
  }
  ```
- **Dimensions:** 280px × 280px circular court representation
- **Performance:** Must maintain 60fps during rotation animations
- **Accessibility:** Full ARIA navigation support, keyboard controls

#### CourtPositionIndicator Component
- **File:** `components/CourtPositionIndicator.tsx`
- **Purpose:** Individual position markers on the court
- **Props Interface:**
  ```typescript
  interface CourtPositionIndicatorProps {
    position: VolleyballPosition;
    isActive: boolean;
    sectionId: string;
    onClick: (sectionId: string) => void;
    animationDelay: number;
  }
  ```
- **States:** Active, inactive, hover, focus
- **Animation:** 0.3s ease-in-out transitions

#### RotationControls Component
- **File:** `components/RotationControls.tsx`
- **Purpose:** Clockwise/counterclockwise rotation controls
- **Props Interface:**
  ```typescript
  interface RotationControlsProps {
    onRotateClockwise: () => void;
    onRotateCounterclockwise: () => void;
    canRotateClockwise: boolean;
    canRotateCounterclockwise: boolean;
  }
  ```

### Integration Requirements

#### useScrollSpy Hook Integration
- Extend existing hook to support rotation position mapping
- Add rotation state management:
  ```typescript
  interface UseScrollSpyReturn {
    currentSection: string;
    currentRotationPosition: number;
    rotateToSection: (sectionId: string) => void;
    rotateClockwise: () => void;
    rotateCounterclockwise: () => void;
  }
  ```

#### State Management
- **Rotation Position State:** Track current rotation (0-5)
- **Section Mapping State:** Map rotation positions to sections
- **Animation State:** Track ongoing rotations to prevent conflicts
- **Scroll Sync State:** Coordinate with scroll-based navigation

### Performance Requirements

#### Animation Performance
- **Target:** Consistent 60fps rotation animations
- **Implementation:** CSS transforms with `transform3d()` for hardware acceleration
- **Optimization:** Use `will-change` property during animations
- **Throttling:** Debounce scroll events to prevent excessive re-renders

#### Responsive Design
- **Desktop:** Full 280px court with detailed position labels
- **Tablet:** 240px court with abbreviated labels
- **Mobile:** 200px court with icon-only positions
- **Breakpoints:** Use existing Tailwind breakpoint system

### Athletic Design Token Integration

#### Color System
- **Court Background:** Athletic green (#2B5F3A)
- **Court Lines:** Athletic white (#FFFFFF)
- **Position Markers:** Athletic gold (#FFD700) for active, gray (#6B7280) for inactive
- **Hover States:** Athletic gold with 80% opacity
- **Focus States:** High contrast outline for accessibility

#### Typography
- **Position Labels:** Athletic mono font family
- **Size Scale:** Responsive based on court size
- **Weight:** Medium (500) for inactive, bold (700) for active

#### Spacing System
- **Position Spacing:** Mathematical distribution around 280px diameter
- **Control Spacing:** 16px gap between rotation controls
- **Court Margin:** 32px from header edges on desktop

## Component Architecture

### Component Hierarchy
```
Header.tsx
├── Logo (existing)
└── VolleyballRotationNav
    ├── CourtPositionIndicator (×6)
    └── RotationControls
        ├── ClockwiseButton
        └── CounterclockwiseButton
```

### State Flow

#### Position Tracking → Scroll Synchronization
1. User clicks position or uses rotation controls
2. VolleyballRotationNav updates internal rotation state
3. Component calls `onSectionChange(sectionId)`
4. Parent updates scroll position via existing scroll logic
5. useScrollSpy detects new section and confirms state

#### Scroll → Position Updates
1. User scrolls manually or via other navigation
2. useScrollSpy detects section change
3. Parent passes new `currentSection` to VolleyballRotationNav
4. Component calculates corresponding rotation position
5. Animates to new position with staggered indicator updates

### Event Handling

#### Direct Position Clicks
- **Handler:** `handlePositionClick(sectionId: string)`
- **Animation:** Smooth rotation to target position
- **Feedback:** Immediate visual state change, audio feedback optional

#### Rotation Controls
- **Clockwise:** `handleClockwiseRotation()`
- **Counterclockwise:** `handleCounterclockwiseRotation()`
- **Validation:** Check bounds before executing rotation
- **Animation:** Sequential position highlighting during rotation

## Modification Requirements

### Header.tsx Changes
```typescript
// PRESERVE: Existing logo and positioning
// REPLACE: Traditional navigation with VolleyballRotationNav

interface HeaderProps {
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
}

// Remove: Traditional nav items mapping
// Add: VolleyballRotationNav integration
// Maintain: Existing blur container and backdrop effects
```

### constants.ts Updates
```typescript
// Add volleyball position mapping
export const VOLLEYBALL_POSITIONS: Record<number, {
  sectionId: string;
  label: string;
  coordinates: { x: number; y: number };
  rotation: number;
}> = {
  0: { sectionId: 'hero', label: 'S1', coordinates: { x: 140, y: 60 }, rotation: 0 },
  1: { sectionId: 'about', label: 'OH1', coordinates: { x: 200, y: 100 }, rotation: 60 },
  2: { sectionId: 'experience', label: 'MB1', coordinates: { x: 200, y: 180 }, rotation: 120 },
  3: { sectionId: 'projects', label: 'OPP', coordinates: { x: 140, y: 220 }, rotation: 180 },
  4: { sectionId: 'photography', label: 'MB2', coordinates: { x: 80, y: 180 }, rotation: 240 },
  5: { sectionId: 'contact', label: 'OH2', coordinates: { x: 80, y: 100 }, rotation: 300 }
};

// Add animation constants
export const ROTATION_ANIMATION_DURATION = 300; // ms
export const POSITION_STAGGER_DELAY = 50; // ms
```

### App.tsx Integration Points
```typescript
// MAINTAIN: Existing scroll management logic
// ENHANCE: Add support for rotation-triggered navigation
// PRESERVE: Current section detection and state management

// Add rotation state management
const [rotationPosition, setRotationPosition] = useState(0);
const [isRotating, setIsRotating] = useState(false);

// Enhance section change handler
const handleSectionChange = (sectionId: string) => {
  // Existing scroll logic
  scrollToSection(sectionId);

  // New rotation sync logic
  const position = getPositionFromSection(sectionId);
  setRotationPosition(position);
};
```

## Implementation Notes

### Browser Compatibility
- **Target:** Modern browsers supporting CSS Grid and Flexbox
- **Fallback:** Progressive enhancement approach
- **Testing:** Chrome, Firefox, Safari, Edge latest versions

### Accessibility Compliance
- **Screen Readers:** Descriptive ARIA labels for all interactive elements
- **Keyboard Navigation:** Tab order follows rotation positions clockwise
- **Focus Management:** Clear focus indicators with high contrast
- **Motion Preferences:** Respect `prefers-reduced-motion` settings

### Testing Strategy
- **Unit Tests:** Component rendering and state management
- **Integration Tests:** Scroll synchronization and rotation accuracy
- **Performance Tests:** Animation frame rate monitoring
- **Accessibility Tests:** Screen reader and keyboard navigation

### Development Phases
1. **Phase 1:** Core VolleyballRotationNav component structure
2. **Phase 2:** Position mapping and basic rotation logic
3. **Phase 3:** Animation system and performance optimization
4. **Phase 4:** Accessibility features and responsive design
5. **Phase 5:** Integration with existing navigation system

No external dependencies required - implementation uses existing React/TypeScript/Tailwind stack with current project patterns and conventions.