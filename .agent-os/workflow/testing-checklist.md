# Autonomy-Optimized Workflow Testing Checklist

**Purpose:** Validation checklist for testing the new workflow with low-risk features
**Last Updated:** 2025-09-30
**Status:** Ready for Testing

---

## Testing Strategy

Test the autonomy-optimized workflow with **progressively complex features** to validate effectiveness and identify refinements needed.

### Test Features (Ordered by Risk)

1. **Very Low Risk** - Documentation update or style tweak
2. **Low Risk** - Add new photography terminology to existing component
3. **Medium Risk** - Create new utility function with tests
4. **Higher Risk** - Add new canvas interaction feature

---

## Pre-Test Setup

### ✅ Verify Foundation Complete

**Phase 1: Intelligence & Configuration**
- [ ] `.agent-os/intelligence/canvas-patterns.md` exists
- [ ] `.agent-os/intelligence/test-patterns.md` exists
- [ ] `.agent-os/intelligence/architectural-invariants.md` exists
- [ ] `.agent-os/config.yml` configured with autonomous mode
- [ ] `.agent-os/decisions/TEMPLATE.md` exists
- [ ] `.claude/agents/git-workflow.md` enhanced with work preservation

**Phase 2: Specialized Agents**
- [ ] `.claude/agents/canvas-architecture-guardian.md` exists
- [ ] `.claude/agents/accessibility-validator.md` exists
- [ ] `.claude/agents/performance-budget-enforcer.md` exists
- [ ] `.claude/agents/photography-metaphor-validator.md` exists
- [ ] `.claude/agents/test-coverage-guardian.md` exists

**Phase 3: Workflow Integration**
- [ ] `.agent-os/workflow/agent-orchestration.md` exists
- [ ] `.agent-os/workflow/quality-gates.md` exists
- [ ] `.agent-os/config.yml` includes agent activation rules

---

## Test 1: Documentation Update (Very Low Risk)

**Goal:** Validate basic workflow without quality gates

**Task:** Add photography terminology glossary to README

**Expected Workflow:**
1. Human: "Add a photography terminology section to the README"
2. Agent: Loads strategic context (Tier 1)
3. Agent: Implements change
4. Agent: Creates commit with detailed message
5. Human: Reviews outcome

**Success Criteria:**
- [ ] Agent loaded strategic context automatically
- [ ] Change implemented correctly
- [ ] Commit message detailed and informative
- [ ] No quality gates triggered (documentation only)
- [ ] Work completed in single session

**Measurements:**
- Time to complete: ___ minutes
- Human touchpoints: ___ (target: 2 - request + review)
- Context loads: ___ (target: 1)

---

## Test 2: Add Photography Term (Low Risk)

**Goal:** Validate photography-metaphor-validator activation

**Task:** Add new camera movement type to existing types

**Expected Workflow:**
1. Human: "Add 'handheld' camera movement type to CameraMovement"
2. Agent: Loads Tier 1 + Tier 2 context
3. Agent: photography-metaphor-validator activates (keyword: "camera")
4. Agent: Implements change with photography context
5. Agent: Validates terminology consistency
6. Agent: Creates commit
7. Human: Reviews outcome

**Success Criteria:**
- [ ] photography-metaphor-validator activated automatically
- [ ] Agent provided photography context in implementation
- [ ] Terminology consistent with existing patterns
- [ ] TypeScript compilation passed
- [ ] Tests updated (if applicable)
- [ ] Commit message includes decision context

**Measurements:**
- Time to complete: ___ minutes
- Human touchpoints: ___ (target: 2)
- Agents activated: ___ (expected: 1-2)
- Quality gates passed: ___ (expected: TypeScript only)

**Observations:**
- Did agent recognize photography context? ___
- Did agent validate terminology? ___
- Was commit message detailed enough? ___

---

## Test 3: Create Utility Function (Medium Risk)

**Goal:** Validate test-coverage-guardian and full quality gates

**Task:** Create utility function for calculating photography easing curves

**Expected Workflow:**
1. Human: "Create utility to generate photography-inspired easing curves"
2. Agent: Loads Tier 1 + Tier 2 context
3. Agent: photography-metaphor-validator activates
4. Agent: Implements utility with tests
5. Agent: test-coverage-guardian validates coverage
6. Agent: All quality gates run
7. Agent: Creates commit
8. Human: Reviews outcome

**Success Criteria:**
- [ ] Utility implemented with photography context
- [ ] Tests created automatically (>90% coverage)
- [ ] TypeScript compilation passed
- [ ] Test quality validated (not smoke tests)
- [ ] JSDoc documentation includes photography references
- [ ] Commit message includes implementation + quality results

**Quality Gates Expected:**
- [ ] TypeScript Compilation: PASS
- [ ] Test Coverage: PASS (>90%)
- [ ] Architecture: PASS (pattern consistency)

**Measurements:**
- Time to complete: ___ minutes
- Human touchpoints: ___ (target: 2)
- Agents activated: ___ (expected: 2-3)
- Quality gates passed: ___ (expected: 3)
- Tests created: ___ (expected: 5-10)
- Coverage achieved: ___% (target: >90%)

**Observations:**
- Were tests meaningful (not smoke tests)? ___
- Did tests validate behavior vs implementation? ___
- Was quality gate feedback clear? ___
- Did agent fix violations automatically? ___

---

## Test 4: Canvas Interaction Feature (Higher Risk)

**Goal:** Validate full workflow with all agents and quality gates

**Task:** Add "pinch to zoom" gesture support to lightbox canvas

**Expected Workflow:**
1. Human: "Add pinch-to-zoom gesture support for mobile lightbox"
2. Agent: Analyzes requirements
3. Agent: Drafts strategic plan (low-risk project → may skip)
4. Human: Approves plan (or agent proceeds autonomously)
5. Agent: Loads all relevant context (Tier 1-3)
6. Agent: Implements feature with continuous validation
7. Agents activate: canvas-architecture, accessibility, performance, photography-metaphor, test-coverage
8. Agent: Runs all quality gates
9. Agent: Creates checkpoint commit
10. Human: Final validation

**Success Criteria:**
- [ ] All agents activated appropriately
- [ ] Feature implemented with proper patterns
- [ ] GPU-accelerated transforms used
- [ ] Touch gesture handling implemented
- [ ] Accessibility maintained (keyboard not broken)
- [ ] 60fps performance maintained
- [ ] Tests created for all behaviors
- [ ] Photography terminology used in implementation
- [ ] Commit message comprehensive

**Quality Gates Expected:**
- [ ] TypeScript Compilation: PASS
- [ ] Test Coverage: PASS (>95% for canvas)
- [ ] Accessibility: PASS (touch doesn't break keyboard)
- [ ] Performance: PASS (60fps, bundle size)
- [ ] Architecture: PASS (UnifiedGameFlowContext, patterns)

**Agents Expected to Activate:**
- [ ] canvas-architecture-guardian (keyword: "canvas")
- [ ] accessibility-validator (keyword: "gesture", "mobile")
- [ ] performance-budget-enforcer (keyword: "canvas", "gesture")
- [ ] photography-metaphor-validator (keyword: "lightbox", "zoom")
- [ ] test-coverage-guardian (before completion)

**Measurements:**
- Time to complete: ___ minutes (expected: 45-90 min)
- Human touchpoints: ___ (target: 2-3)
- Agents activated: ___ (expected: 5)
- Quality gates passed: ___ (expected: 5)
- Tests created: ___ (expected: 15-25)
- Coverage achieved: ___% (target: >95%)
- FPS maintained: ___ (target: 60fps)
- Bundle size impact: ___KB (target: <15KB)

**Observations:**
- Did agents activate automatically? ___
- Was agent coordination effective? ___
- Were quality gates blocking correctly? ___
- Did agent fix violations autonomously? ___
- Was commit message comprehensive? ___

---

## Work Preservation Testing

**Goal:** Validate work preservation system prevents loss

### Test: Branch Switch During Work

**Setup:**
1. Start feature implementation
2. Work for 10-15 minutes (before auto-commit)
3. Attempt to switch branches

**Expected Behavior:**
```
⚠️ Uncommitted work detected:

Modified files:
- components/NewFeature.tsx (new)
- hooks/useNewHook.ts (modified)

Options:
1. Commit now (recommended)
2. Create checkpoint branch
3. Stash with recovery tag
4. Abort checkout

Your choice?
```

**Success Criteria:**
- [ ] Agent detected uncommitted work
- [ ] Agent provided clear options
- [ ] Agent waited for user choice
- [ ] No work lost during switch

### Test: Auto-Commit After 30 Minutes

**Setup:**
1. Start feature implementation
2. Work continuously for 35 minutes
3. Do NOT manually commit

**Expected Behavior:**
- Agent creates checkpoint commit automatically at 30-minute mark
- Commit message includes progress and next steps

**Success Criteria:**
- [ ] Auto-commit triggered at 30 minutes
- [ ] Commit message detailed (not generic)
- [ ] Work preserved successfully
- [ ] Agent continued working after commit

### Test: Quality Gate Commit

**Setup:**
1. Implement feature
2. Pass quality gate

**Expected Behavior:**
- Agent creates commit after gate passage
- Commit message includes quality gate results

**Success Criteria:**
- [ ] Commit created after quality gate
- [ ] Commit message includes metrics
- [ ] Work not lost if issue after gate

---

## Context Management Testing

**Goal:** Validate tiered context loading strategy

### Test: Context Loading at Session Start

**Expected:**
- Agent loads Tier 1 (strategic context) automatically
- ~20K tokens loaded

**Validation:**
```bash
# Check agent references strategic files
grep -r "CLAUDE.md\|mission-lite.md\|architectural-invariants.md" [conversation-log]
```

**Success Criteria:**
- [ ] Tier 1 context loaded automatically
- [ ] No redundant file reads
- [ ] Agent demonstrated knowledge of standards

### Test: Feature Context Loading

**Expected:**
- Agent loads Tier 2 when implementing feature
- canvas-patterns.md, test-patterns.md loaded

**Success Criteria:**
- [ ] Tier 2 context loaded for feature
- [ ] Agent applied patterns from intelligence files
- [ ] No redundant loads (cached appropriately)

### Test: Staleness Detection

**Setup:**
1. Work for 35 minutes without refresh
2. Context becomes stale

**Expected:**
- Agent detects staleness
- Agent refreshes Tier 1 context
- Agent continues with updated context

**Success Criteria:**
- [ ] Staleness detected at 30 minutes
- [ ] Context refreshed automatically
- [ ] Work not interrupted

---

## Decision Logging Testing

**Goal:** Validate automatic decision log creation

### Test: Architectural Decision Detection

**Task:** Implement feature that deviates from patterns

**Expected:**
- Agent detects deviation
- Agent creates decision log automatically
- Decision log follows template

**Success Criteria:**
- [ ] Deviation detected
- [ ] Decision log created in `.agent-os/decisions/`
- [ ] Log includes alternatives, rationale, impact
- [ ] Log filename: `YYYY-MM-DD-decision-name.md`

### Test: Recovery Context

**Task:** Simulate work loss, attempt recovery

**Expected:**
- Decision logs provide context
- Implementation can be reconstructed from logs

**Success Criteria:**
- [ ] Decision logs readable
- [ ] Context sufficient for recovery
- [ ] Alternatives documented

---

## Performance Metrics

### Target Metrics (vs. Old Workflow)

**Speed:**
- Implementation time: 75% faster
- Human interactions: 85% fewer
- Context loading: 50-100 fewer file reads

**Quality:**
- Quality gate failures: Caught earlier
- Architectural drift: Prevented automatically
- Test coverage: Maintained at >90%

**Work Preservation:**
- Maximum work loss: 30 minutes (was: 2+ hours)
- Recovery time: 2-5 minutes (was: 30-60 minutes)

### Actual Measurements

**Test 1 (Documentation):**
- Time: ___ minutes
- Interactions: ___
- Context loads: ___

**Test 2 (Photography Term):**
- Time: ___ minutes
- Interactions: ___
- Context loads: ___
- Agents activated: ___

**Test 3 (Utility Function):**
- Time: ___ minutes
- Interactions: ___
- Quality gates: ___
- Tests created: ___
- Coverage: ___%

**Test 4 (Canvas Feature):**
- Time: ___ minutes
- Interactions: ___
- Agents activated: ___
- Quality gates: ___
- Tests created: ___
- Coverage: ___%
- FPS: ___
- Bundle size: ___KB

---

## Refinement Checklist

Based on testing results, refine:

**Agent Activation:**
- [ ] Are activation keywords accurate?
- [ ] Are agents activating at the right time?
- [ ] Are agents activating too frequently?

**Quality Gates:**
- [ ] Are thresholds appropriate?
- [ ] Is feedback clear and actionable?
- [ ] Are fix suggestions helpful?

**Work Preservation:**
- [ ] Is 30-minute interval optimal?
- [ ] Are commit messages detailed enough?
- [ ] Is branch switch protection working?

**Context Management:**
- [ ] Is Tier 1 loaded at right time?
- [ ] Is staleness detection working?
- [ ] Is context refresh smooth?

**Decision Logging:**
- [ ] Are logs created at right time?
- [ ] Is template providing value?
- [ ] Are logs useful for recovery?

---

## Success Criteria (Overall)

**Workflow is successful if:**
- ✅ Features implemented faster than old workflow
- ✅ Quality maintained or improved (>90% coverage, 60fps, WCAG AAA)
- ✅ Human interactions reduced by >80%
- ✅ Work loss reduced to <30 minutes maximum
- ✅ Agents activate appropriately
- ✅ Quality gates block violations effectively
- ✅ Context management efficient
- ✅ Decision logs provide recovery value

**Workflow needs refinement if:**
- ❌ Agents activating incorrectly or too frequently
- ❌ Quality gate feedback unclear
- ❌ Work loss still occurring
- ❌ Context loading inefficient
- ❌ Decision logs not useful

---

## Next Steps After Testing

**If successful:**
1. Document lessons learned
2. Refine based on observations
3. Create Phase 4: Production deployment guide
4. Test with medium-risk feature

**If refinement needed:**
1. Document specific issues
2. Update agent activation rules
3. Refine quality gate thresholds
4. Re-test with same feature

**Long-term:**
1. Measure over multiple features
2. Track metrics dashboard
3. Iterate on agent effectiveness
4. Scale to higher-risk projects

---

**This checklist is a living document. Update based on testing results and real-world usage.**