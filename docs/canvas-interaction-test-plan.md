# Canvas Interaction Testing Plan - Phase 1 Verification

**Testing Date**: 2025-10-02
**Feature**: Drag threshold + selective text selection
**Status**: Awaiting verification after text selection fix

## Test Environment

- **URL**: http://localhost:5173/?layout=canvas
- **Browser**: Chrome/Safari/Firefox (test all)
- **Device**: Desktop (mouse interactions)

## Critical Test Cases

### Test 1: Text Selection Without Navigation ✓ CRITICAL
**Steps**:
1. Navigate to canvas view (`?layout=canvas`)
2. Locate hero section text (first visible content)
3. Click and drag across text to select multiple words
4. Release mouse button

**Expected Behavior**:
- Text should be selected (highlighted)
- Canvas position should NOT change
- Console should log: "🎯 Text selection detected - pan mode blocked"
- No navigation to blank sections

**Previous Bug**: Canvas would navigate to blank area on mouseup
**Fix Applied**: Added `window.getSelection()` check in handleMouseMove:153-170

---

### Test 2: Canvas Pan on Empty Areas ✓ CRITICAL
**Steps**:
1. Position mouse over empty black area (no text/buttons)
2. Click and drag > 5 pixels in any direction
3. Release mouse

**Expected Behavior**:
- Canvas should pan smoothly
- Cursor changes to `grabbing` during drag
- Console should log: "🎯 Drag threshold exceeded - pan mode activated"
- Console should log: "🎯 Pan mode deactivated - text selection restored" on release

---

### Test 3: Small Movements Don't Trigger Pan ✓ CRITICAL
**Steps**:
1. Click anywhere on canvas
2. Move mouse < 5 pixels (tiny wiggle)
3. Release mouse

**Expected Behavior**:
- Canvas position should NOT change
- No pan mode activation
- No console logs (threshold not exceeded)
- Allows for imperfect clicks

---

### Test 4: Interactive Elements Work Correctly ✓ CRITICAL
**Steps**:
1. Locate "Schedule Review" button (PersistentCTABar)
2. Click the button
3. Try clicking other buttons/links on canvas

**Expected Behavior**:
- Buttons should click normally
- No pan mode activation when clicking buttons
- Interactive element detection working: `closest('button, a, input, textarea, select, [role="button"]')`

---

### Test 5: Drag Threshold Precision
**Steps**:
1. Click on canvas
2. Move mouse exactly 4 pixels (below threshold)
3. Release
4. Click again
5. Move mouse exactly 6 pixels (above threshold)
6. Release

**Expected Behavior**:
- 4px movement: No pan, no console logs
- 6px movement: Pan activates, console logs appear

**Measurement**: Use browser dev tools to track mouse position

---

### Test 6: Text Selection Across Multiple Elements
**Steps**:
1. Start selection in hero heading
2. Drag down across paragraph text
3. Release after selecting multiple lines

**Expected Behavior**:
- All text selected across multiple elements
- No canvas pan activation
- Console: "🎯 Text selection detected - pan mode blocked"

---

### Test 7: Triple-Click Text Selection
**Steps**:
1. Triple-click on a paragraph to select entire paragraph
2. Release mouse

**Expected Behavior**:
- Entire paragraph selected
- No canvas navigation
- Text remains selectable

---

### Test 8: Dynamic user-select Restoration
**Steps**:
1. Verify text is selectable initially (check computed styles)
2. Start a pan drag (move > 5px on empty area)
3. During drag: Check `document.body.style.userSelect` === 'none'
4. Release mouse
5. Check `document.body.style.userSelect` === '' (empty/restored)

**Expected Behavior**:
- Initial: `user-select` is auto (default)
- During drag: `user-select` is 'none'
- After release: `user-select` restored to '' (default)

---

### Test 9: Cursor State Changes
**Steps**:
1. Hover over canvas - cursor should be `grab`
2. Click and drag > 5px - cursor should change to `grabbing`
3. Release mouse - cursor should return to `grab`

**Expected Behavior**:
- Cursor states match user action
- Visual feedback for drag mode

---

### Test 10: Console Logging Accuracy
**Steps**:
1. Open browser console
2. Perform various actions:
   - Text selection (should log "blocked")
   - Pan drag (should log "activated" then "deactivated")
   - Small movements (no logs)

**Expected Behavior**:
- Logs only appear when state changes
- Clean, informative messages
- No duplicate/spam logs

---

## Browser Compatibility Testing

### Chrome
- [ ] Test 1-10 passing
- [ ] Text selection smooth
- [ ] Pan feels responsive

### Safari
- [ ] Test 1-10 passing
- [ ] Webkit-specific user-select working
- [ ] Touch-action: none not interfering

### Firefox
- [ ] Test 1-10 passing
- [ ] Text selection working
- [ ] Pan performance acceptable

---

## Performance Testing

### Frame Rate During Pan
**Steps**:
1. Open Chrome DevTools Performance panel
2. Start recording
3. Perform fast pan drag
4. Stop recording
5. Analyze frame rate

**Expected**: Maintain 60fps during pan (16.67ms per frame max)

---

## Edge Cases

### Edge Case 1: Select Text, Then Immediately Pan
**Steps**:
1. Select some text
2. Immediately (within 100ms) click empty area and start pan

**Expected**:
- Text selection should deselect
- Pan should work normally

### Edge Case 2: Pan, Then Immediately Select Text
**Steps**:
1. Pan canvas to new position
2. Immediately try to select text

**Expected**:
- Text selection should work
- No residual pan mode interference

### Edge Case 3: Multi-Touch (if available)
**Steps**:
1. Use trackpad with two-finger gesture
2. Try pinch-to-zoom

**Expected**:
- Touch gestures still work
- No conflict with mouse drag

---

## Success Criteria

All 10 critical tests must pass in all 3 browsers before marking Phase 1 complete.

**Known Issues to Watch For**:
- Text selection triggering navigation (SHOULD BE FIXED)
- Accidental panning on small movements (SHOULD BE FIXED)
- Interactive elements not clickable (SHOULD BE FIXED)

**If Any Test Fails**:
1. Document exact failure scenario
2. Note console logs/errors
3. Check browser console for specific error messages
4. Report back for further debugging

---

## Next Steps After Verification

Once all tests pass:
- [ ] Mark "Test all interaction patterns after fix" as completed
- [ ] Update todo list
- [ ] Proceed with Phase 2: Momentum/Inertia implementation
