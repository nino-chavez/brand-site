# Agent Orchestration Guide

**Purpose:** How specialized agents work together in the autonomy-optimized workflow
**Last Updated:** 2025-09-30
**Status:** Active

---

## Overview

The autonomy-optimized workflow uses **specialized agents** that activate automatically based on context and enforce **architectural invariants** as blocking quality gates.

### Key Principles

1. **Proactive Activation** - Agents activate automatically based on keywords and context
2. **Blocking Gates** - Violations prevent feature completion (not warnings)
3. **Parallel Execution** - Independent validations run concurrently
4. **Clear Reporting** - Pass/fail status with actionable fix guidance

---

## Agent Activation Rules

### Automatic Activation

Agents activate automatically when context matches their domain:

**canvas-architecture-guardian** activates when:
- Creating/modifying canvas components
- Working with state management
- Implementing animations or transitions
- Keywords: "canvas", "lightbox", "camera", "lens", "navigation", "state"

**accessibility-validator** activates when:
- Creating interactive components
- Modifying navigation or controls
- Implementing modals/dialogs
- Keywords: "accessibility", "a11y", "keyboard", "screen reader", "WCAG", "interactive"

**performance-budget-enforcer** activates when:
- Creating canvas components
- Adding animations
- Implementing new features
- Keywords: "performance", "fps", "bundle size", "optimization", "memory"

**photography-metaphor-validator** activates when:
- Creating new components
- Naming files/functions/interfaces
- Implementing interactions
- Keywords: "camera", "lens", "photography", "metaphor", "naming", "terminology"

**test-coverage-guardian** activates when:
- Creating new components/features
- Before marking feature complete
- Modifying existing functionality
- Keywords: "tests", "coverage", "testing", "quality", "complete"

### Manual Activation

Agents can be invoked explicitly:

```bash
# Validate specific aspect
/validate-architecture components/NewComponent.tsx
/validate-accessibility components/NewComponent.tsx
/validate-performance components/NewComponent.tsx
/validate-metaphor components/NewComponent.tsx
/validate-coverage components/NewComponent.tsx

# Run all quality gates
/quality-gates components/NewComponent.tsx
```

---

## Workflow Execution Order

### Standard Feature Implementation

```
1. INTENT PHASE
   Human: "Add category filtering to gallery with mobile touch support"
   Agent: Analyzes requirements, loads strategic context

2. PLANNING PHASE (Optional for low-risk)
   Agent: Drafts high-level approach
   Human: Reviews plan (or skips if low-risk)

3. IMPLEMENTATION PHASE
   Agent: Implements feature with continuous validation

   Parallel Validations (as code is written):
   ├─ photography-metaphor-validator (naming, terminology)
   ├─ canvas-architecture-guardian (patterns, state management)
   └─ TypeScript compilation (type safety)

4. QUALITY GATE PHASE
   Sequential Validations (blocking):

   ├─ TypeScript Compilation ← Must pass
   │  └─ Strict mode, no `any` types
   │
   ├─ test-coverage-guardian ← Must pass
   │  └─ >90% coverage with meaningful tests
   │
   ├─ accessibility-validator ← Must pass
   │  └─ WCAG AAA compliance, keyboard + screen reader
   │
   └─ performance-budget-enforcer ← Must pass
      └─ 60fps, bundle size, memory limits

5. COMPLETION PHASE
   Agent: Creates checkpoint commit with detailed message
   Human: Final validation (outcome-based review)

6. INTEGRATION PHASE
   Agent: Creates PR with comprehensive description
   Human: Merge approval
```

### Quality Gate Failure Handling

**If any gate fails:**

```
Quality Gate: accessibility-validator
Status: FAILED

Violations:
1. Keyboard Navigation (BLOCKING)
   - Location: components/FilterBar.tsx:45
   - Issue: Interactive div without keyboard handler
   - Fix: Add onKeyDown handler for Enter/Space

Action: BLOCKING FEATURE COMPLETION

Agent Response:
1. Applies suggested fix
2. Re-runs validation
3. Continues when passed
```

**Automatic retry logic:**
- Agent fixes violation
- Re-runs failed gate
- Proceeds if passes
- Escalates to human if 3 fixes fail

---

## Agent Coordination

### Parallel Execution

Independent validations run concurrently for speed:

```typescript
// Example: Parallel validation during implementation
await Promise.all([
  validatePhotographyMetaphor(component),
  validateArchitecture(component),
  validateTypeScript(component)
]);

// Then sequential blocking gates
await validateTestCoverage(component);      // Must pass
await validateAccessibility(component);     // Must pass
await validatePerformance(component);       // Must pass
```

### Sequential Execution

Quality gates run sequentially to avoid wasted work:

```
TypeScript Compilation
  ↓ (pass)
Test Coverage Guardian
  ↓ (pass)
Accessibility Validator
  ↓ (pass)
Performance Budget Enforcer
  ↓ (pass)
Feature Complete ✅
```

**Why sequential?**
- No point testing if code doesn't compile
- No point checking performance if tests fail
- Fails fast at first blocking issue

---

## Context Management

### Tiered Loading Strategy

**Tier 1: Strategic Context (Always Loaded)**
```
.claude/CLAUDE.md
.agent-os/product/mission-lite.md
.agent-os/standards/architectural-drift-prevention.md
.agent-os/intelligence/architectural-invariants.md
.agent-os/config.yml
```
**Size:** ~20K tokens
**When:** Session start, every 30 min

**Tier 2: Feature Context (Loaded Per Feature)**
```
.agent-os/intelligence/canvas-patterns.md
.agent-os/intelligence/test-patterns.md
.agent-os/decisions/[relevant].md
```
**Size:** ~50K tokens
**When:** Feature start

**Tier 3: Active Files (Dynamic)**
```
components/[working-files].tsx
hooks/[working-files].ts
test/[test-files].test.tsx
```
**Size:** ~100K tokens
**When:** As needed during implementation

**Tier 4: Response Buffer**
```
Reserved for agent responses and tool outputs
```
**Size:** ~30K tokens

**Total Context Window:** 200K tokens

### Context Refresh Strategy

**Proactive refresh:**
- Every 30 minutes (staleness detection)
- Before major decisions
- After quality gate failures
- On explicit user request

**Reactive refresh:**
- If context validation fails
- If architectural drift detected
- If pattern mismatch found

---

## Decision Logging

### When to Create Decision Logs

**Required for:**
- New architectural patterns
- Deviation from established patterns
- Technology choices
- Major refactoring decisions
- Breaking changes
- Performance trade-offs

**Not required for:**
- Routine implementation following patterns
- Bug fixes (unless architectural)
- Minor refactoring
- Style changes
- Documentation updates

### Decision Log Creation

**Automatic creation when:**
```
Agent detects:
1. New pattern being introduced
2. Deviation from intelligence patterns
3. Alternative approaches considered
4. Trade-off decisions made

Agent creates:
.agent-os/decisions/YYYY-MM-DD-[decision-name].md

Using template:
.agent-os/decisions/TEMPLATE.md
```

**Manual creation:**
```bash
# Agent prompts human when uncertain
Agent: "This implementation deviates from established patterns.
        Should I create a decision log?"
Human: "Yes, document the rationale"
Agent: Creates decision log with alternatives considered
```

---

## Work Preservation System

### Continuous Commits

**Auto-commit triggers:**
- Every 30 minutes of active work
- After each quality gate passes
- Before any branch switch
- On explicit checkpoint request

**Commit message format:**
```
feat: [component] - [what was implemented]

Implementation:
- [What was built]
- [How it integrates]
- [Key decisions made]

Decision:
- [Why this approach]
- [Alternatives considered]

Quality:
- Tests passing: [count]
- Coverage: [percentage]
- Performance: [fps/bundle size]
- Accessibility: [WCAG status]

Context:
- [What this enables]
- [Next steps]
- [Dependencies]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Branch Protection

**Before any git checkout:**

1. Detect uncommitted work
2. Prompt user with options:
   - Commit now (recommended)
   - Create checkpoint branch
   - Stash with recovery tag
   - Abort checkout

**Example:**
```
⚠️ Uncommitted work detected:

Modified files:
- components/FilterBar.tsx (new)
- hooks/useFiltering.ts (modified)
- tests/filter.test.tsx (new)

Options:
1. Commit now (recommended)
2. Create checkpoint branch: checkpoint/gallery-filter-2025-09-30
3. Stash: "WIP: gallery-filter - FilterBar - 2025-09-30-14:30"
4. Abort checkout

Your choice?
```

### Checkpoint Branches

**Created for:**
- Long-running features (>2 hours)
- Quality gate failures requiring investigation
- Experimental approaches
- Before major refactoring

**Naming convention:**
```
checkpoint/[feature]-[phase]-[timestamp]

Examples:
checkpoint/gallery-filter-component-2025-09-30
checkpoint/gallery-filter-tests-2025-09-30
checkpoint/gallery-filter-integration-2025-09-30
```

**Recovery:**
```bash
# List checkpoints
git branch -a | grep checkpoint

# Restore from checkpoint
git checkout checkpoint/[feature]-[phase]

# Or cherry-pick commits
git cherry-pick checkpoint/[feature]-[phase]
```

---

## Communication Patterns

### Autonomous Mode (Default)

**Minimal interaction, maximum velocity:**

```
Human: "Add category filtering to gallery with mobile touch support"

Agent: [Analyzes context silently]
       [Implements feature with continuous validation]
       [Runs all quality gates]
       [Creates commit with detailed message]

       ✅ Feature complete: Gallery category filtering

       Implementation:
       - FilterBar component (photography metaphor compliant)
       - useFiltering hook (state management via context)
       - Touch gesture support (60fps maintained)
       - Tests: 12 new tests, 94% coverage

       Quality Gates:
       - Architecture: ✅ Passed
       - Accessibility: ✅ Passed (WCAG AAA)
       - Performance: ✅ Passed (60fps, +2.3KB bundle)
       - Tests: ✅ Passed (94% coverage)

       Ready for review.