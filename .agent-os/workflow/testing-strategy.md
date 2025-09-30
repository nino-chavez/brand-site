# Workflow Testing Strategy

**Purpose:** How to validate the autonomy-optimized workflow before full deployment
**Last Updated:** 2025-09-30
**Status:** Active

---

## Testing Approach

Test the workflow incrementally with progressively complex features to validate all components work together correctly.

---

## Phase 3: Workflow Validation (Week 3)

### Test 1: Low-Risk Component (Simple)

**Feature:** Add a simple UI component with minimal complexity
**Example:** "Add a 'scroll to top' button with photography-themed icon"

**Expected Behavior:**
- Agent creates component with photography metaphor naming
- Implements keyboard accessibility
- Creates meaningful tests (>90% coverage)
- Validates all quality gates pass
- Creates detailed commit message
- Completes in <15 minutes

**Success Criteria:**
- ✅ All quality gates pass automatically
- ✅ No human intervention needed (autonomous mode)
- ✅ Commit message includes implementation + quality details
- ✅ No architectural violations
- ✅ Photography metaphor maintained

**Validation:**
```bash
# Check commit message quality
git log -1 --pretty=format:"%B"

# Verify quality gate results in commit
grep -A 10 "Quality:" <(git log -1 --pretty=format:"%B")

# Run tests
npm run test:run

# Check coverage
npm run test:coverage
```

### Test 2: Medium-Risk Feature (Moderate Complexity)

**Feature:** Implement new interaction pattern
**Example:** "Add hover previews to contact sheet thumbnails"

**Expected Behavior:**
- Agent analyzes existing patterns
- Extends GalleryContentAdapter consistently
- Implements with GPU acceleration
- Creates integration tests
- Validates 60fps maintained
- Creates checkpoint commit after quality gates
- Completes in <45 minutes

**Success Criteria:**
- ✅ Pattern consistency maintained
- ✅ 60fps performance validated
- ✅ Integration tests cover component interaction
- ✅ Memory leaks prevented
- ✅ Accessibility preserved

**Validation:**
```bash
# Check for pattern consistency
grep -r "GalleryContentAdapter" components/

# Verify GPU acceleration
grep -r "translate3d" components/NewComponent.tsx

# Run performance tests
npm run test:performance

# Check integration tests
npm test -- integration
```

### Test 3: Complex Feature (High Complexity)

**Feature:** Multi-component feature with state management
**Example:** "Add multi-category filtering with keyboard shortcuts"

**Expected Behavior:**
- Agent creates decision log for new pattern
- Multiple components created with consistent naming
- State managed through UnifiedGameFlowContext
- Comprehensive test suite (unit + integration + E2E)
- Multiple checkpoint commits (every 30 min or quality gate)
- Completes in <2 hours

**Success Criteria:**
- ✅ Decision log created with alternatives
- ✅ Multiple checkpoint commits preserve work
- ✅ All architectural invariants maintained
- ✅ Test coverage >90% across all components
- ✅ Bundle size within budget

**Validation:**
```bash
# Check for decision log
ls -la .agent-os/decisions/

# Verify checkpoint commits
git log --oneline --since="2 hours ago"

# Check state management
grep -r "useUnifiedCanvas" components/NewComponents/

# Run full test suite
npm run test:run

# Check bundle size
npm run build:analyze
```

### Test 4: Branch Switching (Work Preservation)

**Scenario:** Agent working on feature when branch switch needed

**Test Steps:**
1. Start feature implementation (takes >30 min)
2. After 20 minutes, request branch switch
3. Verify work preservation triggers

**Expected Behavior:**
- Agent detects uncommitted work
- Prompts with 4 options:
  1. Commit now
  2. Create checkpoint branch
  3. Stash with recovery tag
  4. Abort checkout
- Waits for human choice
- Executes chosen option correctly
- No work lost

**Success Criteria:**
- ✅ Detection triggers before switch
- ✅ All 4 options work correctly
- ✅ Recovery successful (can restore work)
- ✅ No data loss

**Validation:**
```bash
# Test checkpoint branch creation
git branch -a | grep checkpoint

# Test stash creation
git stash list

# Test recovery
git stash show stash@{0}
git checkout checkpoint/[feature]
```

### Test 5: Quality Gate Failure (Auto-Fix)

**Scenario:** Intentionally introduce violation to test auto-fix

**Test Steps:**
1. Create component with known violation (e.g., missing keyboard handler)
2. Agent runs quality gates
3. Accessibility validator fails
4. Agent auto-fixes
5. Re-runs validation
6. Proceeds when passed

**Expected Behavior:**
- Quality gate detects violation
- Blocks feature completion
- Agent analyzes failure
- Applies suggested fix
- Re-runs failed gate
- Passes on retry

**Success Criteria:**
- ✅ Violation detected by agent
- ✅ Clear error message with fix guidance
- ✅ Auto-fix applied correctly
- ✅ Re-validation passes
- ✅ Feature completes successfully

**Validation:**
```bash
# Check commit history shows fix
git log --oneline -3

# Verify fix applied
grep -A 5 "onKeyDown" components/FixedComponent.tsx

# Confirm tests pass
npm run test:a11y
```

---

## Metrics to Track

### Performance Metrics

**Velocity:**
- Time to complete simple feature: Target <15 min
- Time to complete moderate feature: Target <45 min
- Time to complete complex feature: Target <2 hours
- Reduction vs. old workflow: Target >75%

**Interaction Count:**
- Human touchpoints per feature (autonomous mode): Target ≤2
- Human touchpoints per feature (audited mode): Target ≤5
- Reduction vs. old workflow: Target >85%

**Quality:**
- Quality gate pass rate (first attempt): Target >90%
- Auto-fix success rate: Target >80%
- Architectural violations: Target 0
- Work loss incidents: Target 0

### Work Preservation Metrics

**Commit Frequency:**
- Average time between commits: Target ≤30 min
- Checkpoint commits created: Track count
- Maximum uncommitted work age: Target ≤30 min

**Recovery Effectiveness:**
- Work loss incidents: Target 0
- Recovery time (when needed): Target <5 min
- Branch switch safety: Target 100%

### Agent Effectiveness

**Validation Accuracy:**
- False positives (incorrect violations): Target <5%
- False negatives (missed violations): Target <2%
- Auto-fix accuracy: Target >85%

**Pattern Recognition:**
- Correct pattern identification: Target >95%
- Photography metaphor compliance: Target 100%
- Architectural consistency: Target 100%

---

## Testing Checklist

### Pre-Test Setup

```bash
# Ensure all agents available
ls -la .claude/agents/

# Verify intelligence patterns loaded
ls -la .agent-os/intelligence/

# Check config
cat .agent-os/config.yml

# Run baseline tests
npm run test:run
npm run test:coverage
```

### Test Execution

**For each test feature:**

1. **Start Test**
   ```bash
   # Record start time
   START_TIME=$(date +%s)

   # Clear todo list
   # Begin feature request
   ```

2. **Monitor Execution**
   ```
   - Track agent decisions
   - Note checkpoint commits
   - Watch quality gate results
   - Record any human interventions
   ```

3. **Measure Results**
   ```bash
   # Calculate duration
   END_TIME=$(date +%s)
   DURATION=$((END_TIME - START_TIME))

   # Check commit count
   git log --since="$START_TIME" --oneline | wc -l

   # Verify quality gates
   npm run test:run
   npm run test:coverage
   npm run test:a11y
   npm run test:performance
   ```

4. **Document Findings**
   ```markdown
   ## Test: [Feature Name]
   - Duration: [time]
   - Commits: [count]
   - Interventions: [count]
   - Quality Gates: [pass/fail]
   - Issues: [description]
   - Improvements: [suggestions]
   ```

### Post-Test Analysis

```bash
# Review all commits
git log --oneline --since="1 day ago"

# Check for decision logs
ls -la .agent-os/decisions/

# Analyze test coverage delta
npm run test:coverage

# Check bundle size impact
npm run build:analyze

# Review checkpoint branches
git branch -a | grep checkpoint
```

---

## Success Criteria Summary

**Phase 3 is successful if:**

- ✅ Simple feature: <15 min, 0 interventions, all gates pass
- ✅ Moderate feature: <45 min, ≤1 intervention, all gates pass
- ✅ Complex feature: <2 hours, ≤2 interventions, all gates pass
- ✅ Work preservation: 0 work loss, recovery <5 min
- ✅ Quality gates: >90% pass rate first attempt
- ✅ Auto-fix: >80% success rate
- ✅ Velocity: >75% faster than old workflow
- ✅ Interactions: >85% reduction vs. old workflow

**If any criterion fails:**
1. Document the failure mode
2. Identify root cause
3. Refine agent instructions or detection commands
4. Re-test with same feature type
5. Iterate until success criteria met

---

## Next Phase Preview

**Phase 4: Production Deployment (Week 4)**

Once Phase 3 testing validates the workflow:

1. Update documentation with lessons learned
2. Create user guide for workflow modes
3. Document common failure modes and fixes
4. Create troubleshooting guide
5. Deploy to production use

**Ongoing:**
- Monitor metrics continuously
- Refine agents based on real-world usage
- Update intelligence patterns as codebase evolves
- Expand agent capabilities as needed

---

**Remember:** Testing is about validation, not perfection. The goal is to confirm the workflow provides value (faster, safer, higher quality) compared to the old approach. Iterate based on real-world usage.