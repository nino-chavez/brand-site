# Canvas Minimap & Zoom Interaction - Motion Capture Test Plan

## Purpose
Validate that the canvas experience feels smooth and responsive like Miro/Lucidchart across varying usage patterns.

## Test Scenarios

### Scenario 1: Slow, Deliberate Minimap Navigation (100% zoom)
**Interaction Speed:** Slow (2s between clicks)
**Focus:** Minimap click accuracy and transition smoothness
**User Story:** User carefully exploring different sections one at a time

**Actions:**
1. Click Capture (center) → wait 2s
2. Click Focus (left) → wait 2s
3. Click Frame (right) → wait 2s
4. Click Exposure (top) → wait 2s
5. Click Develop (bottom) → wait 2s
6. Return to center → wait 1s

**Expected:** Smooth camera movements, sections clearly visible, no jank

---

### Scenario 2: Fast Minimap Clicking (100% zoom)
**Interaction Speed:** Fast (300-500ms between clicks)
**Focus:** System responsiveness under rapid input
**User Story:** User quickly scanning through sections

**Actions:**
- Rapid clicking through all sections (500ms intervals)
- Back-and-forth rapid switching (300ms intervals)

**Expected:** No lag, smooth transitions even when rapid, animations don't queue up

---

### Scenario 3: Zoom In + Minimap Navigation
**Interaction Speed:** Medium (1.5s between actions)
**Focus:** Minimap navigation accuracy at 144% zoom (1.2²)
**User Story:** User zoomed in to see details, using minimap to jump between sections

**Actions:**
1. Zoom in 2x (144% total)
2. Navigate to Focus → wait 1.5s
3. Navigate to Frame → wait 1.5s
4. Navigate to Exposure → wait 1.5s
5. Return to center → wait 1s

**Expected:** Minimap remains functional at zoom, camera pans to correct positions

---

### Scenario 4: Zoom Out + Minimap Navigation
**Interaction Speed:** Medium (1.5s between actions)
**Focus:** Minimap navigation at 69% zoom (~0.83²)
**User Story:** User getting overview perspective, using minimap for coarse navigation

**Actions:**
1. Zoom out 2x (~69% total)
2. Navigate through sections via minimap
3. Observe overview clarity

**Expected:** Sections still navigable, zoom out shows more context

---

### Scenario 5: Slow Canvas Drag Panning
**Interaction Speed:** Slow (20 steps per drag)
**Focus:** Drag smoothness and momentum feel
**User Story:** User deliberately exploring canvas space

**Actions:**
- Slow drag right (+200px, 20 steps)
- Slow drag left (-200px, 20 steps)
- Slow drag down (+150px, 20 steps)
- Slow drag up (-150px, 20 steps)

**Expected:** Buttery smooth 60fps, momentum feels natural, no stuttering

---

### Scenario 6: Fast Canvas Drag Panning
**Interaction Speed:** Fast (3 steps per drag)
**Focus:** Momentum and inertia physics
**User Story:** User quickly panning to find something

**Actions:**
- Fast drag right (+300px, 3 steps)
- Fast drag left (-300px, 3 steps)
- Fast diagonal drag
- Fast drag back

**Expected:** Momentum carries forward smoothly, no jank on fast movements

---

### Scenario 7: Mixed Interaction (Realistic Usage)
**Interaction Speed:** Varied
**Focus:** Real-world usage pattern
**User Story:** User exploring portfolio naturally

**Actions:**
1. Minimap click to Focus → zoom in → drag around
2. Minimap click to Frame
3. Zoom out 2x → drag to explore
4. Reset zoom
5. Return to center via minimap

**Expected:** All interactions feel cohesive, no mode switching delays

---

### Scenario 8: Extreme Zoom In + Drag
**Interaction Speed:** Medium
**Focus:** Performance at max zoom (3.0x limit)
**User Story:** User examining details closely

**Actions:**
1. Zoom to max (click zoom in 8x)
2. Drag at max zoom
3. Navigate via minimap at max zoom

**Expected:** No performance degradation, renders stay smooth

---

### Scenario 9: Rapid Zoom In/Out Cycling
**Interaction Speed:** Very fast (150-200ms)
**Focus:** Zoom control debouncing and responsiveness
**User Story:** User rapidly adjusting zoom to find right level

**Actions:**
- Rapid zoom in (3 clicks, 200ms apart)
- Rapid zoom out (3 clicks, 200ms apart)
- Rapid cycling (in-out-in-out-in, 150ms apart)

**Expected:** Zoom responds immediately, no lag or queue buildup

---

### Scenario 10: Complete Workflow (Full User Session)
**Interaction Speed:** Natural/varied
**Focus:** End-to-end experience quality
**User Story:** First-time visitor exploring entire portfolio

**Actions:**
1. Land on canvas → explore with minimap
2. Navigate to Focus → zoom in → read content → drag to see more
3. Jump to Frame (projects) → drag around projects
4. Navigate to Develop (gallery)
5. Zoom out to see full view
6. Return to center → reset zoom

**Expected:** Feels like professional tool (Miro/Lucidchart quality), intuitive, responsive

---

## Success Criteria

### Motion Quality
- [ ] All animations render at 60fps (no dropped frames)
- [ ] Drag momentum feels natural (not too fast, not too slow)
- [ ] Zoom transitions are smooth (no sudden jumps)
- [ ] Camera pans are fluid (easing curves feel good)

### Responsiveness
- [ ] Clicks respond within 16ms (1 frame)
- [ ] Drag starts immediately on mousedown
- [ ] Zoom controls update within 100ms
- [ ] Minimap navigation completes within 800ms

### Stability
- [ ] No visual jank or stuttering
- [ ] No layout shifts during interactions
- [ ] No console errors during test runs
- [ ] Memory usage stays stable (no leaks)

### UX Feel
- [ ] Interactions feel predictable
- [ ] Canvas feels "solid" (not floaty)
- [ ] Zoom in/out preserves context
- [ ] Minimap always shows accurate state

## How to Validate

1. **Watch Videos:** Review all 10 scenario videos for visual smoothness
2. **Check Frame Rates:** Look for dropped frames or stuttering
3. **Test Yourself:** Try the interactions manually - do they feel good?
4. **Compare to Miro:** Does it match the quality of professional canvas tools?

## Output Location
All motion captures saved to: `test-results/canvas-motion-captures/`
