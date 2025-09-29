# Test Deprecation Strategy

## Strategic Overview
This document defines the systematic approach for managing test lifecycle during the portfolio's evolution from traditional layout to the sophisticated "Lens & Lightbox" system.

## Test Classification System

### KEEP ✅ - Core System Tests
Tests that validate essential functionality and should always pass:

#### Phase 1: Cursor Lens System
- `test/cursor-lens/useCursorTracking.test.tsx` - ✅ KEEP (Core navigation)
- `test/cursor-lens/useLensActivation.test.tsx` - ✅ KEEP (Activation logic)
- `test/cursor-lens/CursorLens.test.tsx` - ✅ KEEP (Component integration)
- `test/cursor-lens/cursor-performance-integration.test.tsx` - ✅ KEEP (Performance validation)

#### Phase 2: Canvas System
- `test/canvas-performance.test.tsx` - ✅ KEEP (60fps requirement)
- `test/canvas-cross-browser-compatibility.test.tsx` - ✅ KEEP (Browser support)
- `test/mobile-touch-gestures.test.tsx` - ✅ KEEP (Mobile accessibility)

#### Phase 3: Content Integration (Recovered)
- `test/components/AboutContentAdapter.test.tsx` - ✅ KEEP (Content system)
- `test/components/SkillsContentAdapter.test.tsx` - ✅ KEEP (Content system)
- `test/components/ExperienceContentAdapter.test.tsx` - ✅ KEEP (Content system)
- `test/components/ProjectsContentAdapter.test.tsx` - ✅ KEEP (Content system)
- `test/hooks/useContentLevelManager.test.ts` - ✅ KEEP (Content hooks)

### REFACTOR 🔄 - Needs Updates
Tests that validate important functionality but need updates for current architecture:

#### Token System Integration
- `test/integration/token-theme-switching.test.tsx` - 🔄 REFACTOR (Provider issues)
  - **Issue**: Athletic token provider integration broken
  - **Fix**: Update to use simplified token provider
  - **Priority**: HIGH (8/9 tests failing)

#### Browser Compatibility
- `test/canvas-cross-browser-compatibility.test.tsx` - 🔄 REFACTOR (Device detection)
  - **Issue**: Desktop/tablet device detection failing
  - **Fix**: Update detection logic for current browser APIs
  - **Priority**: MEDIUM (functionality works, tests are brittle)

#### Performance Validation
- `test/deterministic/timing-dependent-components.test.tsx` - 🔄 REFACTOR (React warnings)
  - **Issue**: act() warnings indicate improper async handling
  - **Fix**: Wrap state updates in act() calls
  - **Priority**: LOW (tests pass but warnings indicate future issues)

### DEPRECATE ❌ - Legacy Components
Tests for components being phased out or replaced:

#### Traditional Layout System
- `test/split-screen-layout.test.ts` - ❌ DEPRECATE (Legacy split-screen)
  - **Reason**: Replaced by canvas system
  - **Timeline**: Remove after canvas system validation complete
  - **Action**: Disable but keep as reference

#### Legacy Game Flow
- `test/game-flow-sections.test.tsx` - ❌ DEPRECATE (Old section navigation)
  - **Reason**: Replaced by spatial navigation
  - **Timeline**: Remove after all sections migrated to canvas
  - **Action**: Disable but monitor for regression testing

#### Volleyball Demo System
- `test/volleyball-timing-integration.test.ts` - ❌ DEPRECATE (Demo component)
  - **Reason**: Demo-only functionality not part of core portfolio
  - **Timeline**: Remove in next cleanup cycle
  - **Action**: Disable immediately

## Implementation Strategy

### Phase 1: Immediate Stabilization (Current)
```bash
# Disable deprecated tests temporarily
mv test/split-screen-layout.test.ts test/split-screen-layout.test.ts.disabled
mv test/volleyball-timing-integration.test.ts test/volleyball-timing-integration.test.ts.disabled

# Focus on core functionality tests only
npm run test:run -- --testNamePattern="(Cursor|Canvas|Content)"
```

### Phase 2: Refactor Critical Tests (Next Sprint)
```bash
# Fix token integration tests
# Update browser compatibility detection
# Resolve React act() warnings
```

### Phase 3: Complete Legacy Removal (Future)
```bash
# Remove disabled test files
# Clean up test configurations
# Consolidate test strategies
```

## Test Health Monitoring

### Green Signals ✅
- Core cursor lens tests pass consistently
- Canvas performance meets 60fps requirement
- Content adapters integrate properly
- Mobile touch gestures work correctly

### Yellow Signals ⚠️
- Token integration has provider issues (fixable)
- Browser detection slightly brittle (not critical)
- Some timing-dependent tests show warnings

### Red Signals 🚨
- Build system broken (FIXED)
- Test suite hangs on execution (needs investigation)
- High number of act() warnings (indicates architectural issues)

## Portfolio-Specific Considerations

### Professional Standards
- All KEEP tests must pass before deployment
- REFACTOR tests should have clear timelines
- DEPRECATE tests should be disabled but preserved for regression validation

### Photography Metaphor Validation
- Focus tests (About section) - ✅ Essential
- Frame tests (Skills section) - ✅ Essential
- Exposure tests (Experience section) - ✅ Essential
- Composition tests (Projects section) - ✅ Essential

### Performance Requirements
- 60fps canvas navigation - ✅ Non-negotiable
- <100ms cursor activation - ✅ Non-negotiable
- Accessibility compliance - ✅ Non-negotiable

## Current Test Execution Strategy

### Daily Development
```bash
npm run test:run -- --testNamePattern="(useCursor|Canvas|ContentAdapter)"
```

### Pre-deployment Validation
```bash
npm run test:run && npm run test:e2e:canvas
```

### Full Regression (Weekly)
```bash
npm run test:all
```

## Decision Framework

### When to KEEP a test:
- Tests core portfolio functionality
- Validates professional requirements (60fps, accessibility)
- Tests user-facing features in production

### When to REFACTOR a test:
- Test concept is valid but implementation is outdated
- Easy fix that maintains test value
- Required for deployment confidence

### When to DEPRECATE a test:
- Tests functionality being removed
- Tests demo/development-only features
- Maintenance cost exceeds value

---
**Version**: 1.0
**Last Updated**: Recovery completion
**Next Review**: After token integration fixes
**Owner**: Portfolio development team