# Specification Creation Guide (Autonomy-Optimized Workflow)

**Version:** 1.0.0
**Date:** 2025-09-30
**For:** Claude Sonnet 4.5 Autonomous Development

---

## Philosophy: Intent-Driven Development

The default workflow is **spec-free, intent-driven development**:

```
User: "Add category filtering to the gallery"
Agent: [analyzes → plans → implements → validates → commits → reports]
Agent: "Gallery filtering complete. 73 tests passing. WCAG AAA compliant."
```

**No formal spec needed** for most features. The agent autonomously:
- Understands requirements from user intent
- Loads strategic context (patterns, invariants, architecture)
- Plans implementation internally
- Executes with continuous quality validation
- Documents decisions in commit messages and decision logs

---

## When to Create Formal Specifications

### Decision Matrix

| Feature Type | Complexity | Stakeholders | Risk | Spec? |
|--------------|------------|--------------|------|-------|
| Bug fix | Low | 1 | Low | ❌ No |
| Minor enhancement | Low | 1 | Low | ❌ No |
| Single component | Medium | 1-2 | Medium | 🟡 Maybe |
| Multi-component feature | High | 2+ | Medium | ✅ Yes |
| Architectural change | High | 2+ | High | ✅ Yes |
| Breaking change | Any | Any | High | ✅ Yes |

### Always Create Specs For:

1. **Complex Features** - Estimated effort >1 week
2. **High-Risk Changes** - Architectural modifications, breaking changes, security-critical
3. **Multiple Stakeholders** - When coordination with other developers or teams needed
4. **User Explicitly Requests** - "Create a spec for X" or "I need a specification for Y"
5. **Regulatory Compliance** - Features requiring audit trails or formal documentation
6. **API Contracts** - Public APIs, third-party integrations, external dependencies

### Skip Formal Specs For:

1. **Simple Bug Fixes** - Obvious fixes, well-understood issues
2. **Single-Component Additions** - New button, new section, isolated feature
3. **Minor Enhancements** - Small improvements, style tweaks, copy changes
4. **Refactoring** - Unless architectural (component reorganization is usually safe)
5. **Documentation Updates** - Doc improvements, README changes
6. **Test Additions** - Adding tests for existing features

---

## Lightweight Spec Format (When Needed)

When you DO need a spec, use this simplified format:

### Minimal Spec Structure

```markdown
# Feature Name

**Created:** YYYY-MM-DD
**Effort:** [XS/S/M/L/XL]
**Risk:** [Low/Medium/High]

## Overview

[1-2 sentence description of what this feature does and why it's needed]

## User Stories & Acceptance Criteria

### User Story 1: [Role] wants [capability] to [benefit]

**Acceptance Criteria (EARS format):**

1. **WHEN** [trigger condition]
   **THEN** [system response]
   **SHALL** [specific behavior]

2. **WHEN** [another condition]
   **THEN** [expected result]
   **SHALL** [requirement]

[Repeat for each user story]

## Edge Cases & Constraints

- Edge case 1: [description and handling]
- Edge case 2: [description and handling]
- Constraint 1: [limitation and rationale]

## Expected Deliverables

- [ ] Component/module implementation
- [ ] Unit tests (target: >90% coverage)
- [ ] Integration tests (if applicable)
- [ ] E2E tests (if user-facing)
- [ ] Documentation updates
- [ ] Decision log (if architectural)

## Out of Scope

- [What this feature explicitly doesn't include]
```

### What to Skip (Unless Specifically Needed)

- ❌ `spec-lite.md` - Just use the overview section above
- ❌ `technical-spec.md` - Only create if deep technical complexity
- ❌ `database-schema.md` - Only if schema changes needed
- ❌ `api-spec.md` - Only if API changes needed
- ❌ `design.md` - Only if complex UI/UX needs detailed design
- ❌ `tasks.md` - Agent breaks down work internally, no formal task list needed

**Principle:** Only create what adds value. Skip ceremony.

---

## Autonomous Task Breakdown

### How It Works (No Formal tasks.md)

Instead of creating a separate `tasks.md` file, the agent:

1. **Internal Planning** - Breaks down work in memory, not in a file
2. **Continuous Commits** - Each commit represents a logical task completion
3. **Decision Logs** - Captures architectural choices when they happen
4. **Quality Gates** - Automated validation enforces progress
5. **Commit Messages** - Detailed messages document what was done and why

### Commit Message Format (Replaces Task Tracking)

```
type(scope): brief description

Detailed explanation of:
- What was implemented
- Why this approach was chosen
- What was considered and rejected
- Any edge cases handled

Related to: [user request or spec file if exists]
Quality gates: [tests passed, coverage %, accessibility verified]
```

### Example Workflow (No Spec, No Tasks)

```
User: "Add keyboard shortcuts to the gallery navigation"

Agent Internal Process:
1. Analyze requirement (keyboard shortcuts: arrow keys, escape, enter)
2. Review existing code (GalleryModal component, keyboard handling patterns)
3. Plan implementation (useKeyboardShortcuts hook, event listeners, a11y)
4. Implement incrementally:

   Commit 1: "feat(gallery): add useKeyboardShortcuts hook

   - Created reusable keyboard shortcut hook
   - Supports arrow navigation, escape, enter
   - Includes accessibility attributes (aria-keyshortcuts)
   - 12 unit tests covering all key combinations

   Quality gates: ✅ Tests passing, ✅ TypeScript types correct"

   Commit 2: "feat(gallery): integrate keyboard shortcuts in GalleryModal

   - Connected useKeyboardShortcuts to navigation logic
   - Added visual indicators for keyboard users (focus rings)
   - Updated ARIA labels to announce shortcuts
   - E2E tests for keyboard-only navigation

   Quality gates: ✅ 66 E2E tests passing, ✅ Axe accessibility audit passed"

   Commit 3: "docs(gallery): document keyboard shortcuts in user guide

   - Added keyboard shortcuts section to gallery docs
   - Created keyboard shortcut reference card
   - Updated README with accessibility improvements

   Quality gates: ✅ Link validation passed, ✅ Structure validated"

Agent: "Keyboard shortcuts complete. Arrow navigation, escape, enter.
        Full keyboard navigation tested. WCAG AAA compliant. Ready?"
```

**No spec file created. No tasks.md created. Work tracked through commits.**

---

## When to Create Sub-Specifications

### Technical Specification (technical-spec.md)

**Create when:**
- Implementing complex algorithms
- Performance-critical code requiring optimization
- Multiple architectural approaches need comparison
- Deep technical complexity needs documentation

**Skip when:**
- Implementation is straightforward
- Existing patterns apply
- Agent can handle complexity autonomously

### Database Schema (database-schema.md)

**Create when:**
- New tables/collections needed
- Schema migrations required
- Data model is complex
- Need to review relationships before implementation

**Skip when:**
- No database changes
- Simple column additions
- Using existing schema

### API Specification (api-spec.md)

**Create when:**
- Public-facing API
- Third-party integration
- Breaking API changes
- Contract needs review before implementation

**Skip when:**
- Internal APIs only
- Using existing API patterns
- No external consumers

### Design Specification (design.md)

**Create when:**
- Complex UI/UX flows
- Multiple design alternatives to compare
- Accessibility requirements are non-obvious
- Visual design needs detailed specification

**Skip when:**
- Following established design system
- Simple component additions
- UI is straightforward

**Principle:** Create sub-specs only when they add clarity or enable better decisions.

---

## Specification Storage

### Active Specs (Work In Progress)

**Location:** `.agent-os/specs/[feature-name]/`

**Structure:**
```
.agent-os/specs/advanced-canvas-effects/
├── spec.md                    (always)
├── technical-spec.md          (if needed)
├── database-schema.md         (if needed)
├── api-spec.md                (if needed)
├── design.md                  (if needed)
└── decision-log.md            (created during implementation)
```

### Completed Specs (Work Done)

**Location:** `.agent-os/archive/completed-specs/[date-feature-name]/`

**Move when:** Feature is complete and deployed

**Add completion summary:**
```
.agent-os/archive/completed-specs/2025-09-27-lightbox-canvas-implementation/
├── spec.md
├── technical-spec.md
├── tasks.md                   (if created)
├── IMPLEMENTATION-COMPLETE.md (completion summary)
└── decision-log.md
```

---

## Quality Gates Replace Checkpoints

### Old Workflow (Checkpoint-Heavy)

```
1. Create spec → User approval
2. Create design → User approval
3. Create tasks → User approval
4. Implement task 1 → User review
5. Implement task 2 → User review
...
10. Final validation → User approval
```

**Result:** Slow, coordination overhead, interruptions

---

### New Workflow (Quality Gates)

```
1. Agent implements feature continuously
   ↓
2. Automated quality gates run in parallel:
   ✓ Canvas metaphor validation (non-blocking)
   ✓ Architecture validation (non-blocking)
   ✓ TypeScript compilation (non-blocking)
   ↓
3. Sequential quality gates run at milestones:
   ✓ Test suite (blocking)
   ✓ Accessibility validation (blocking)
   ✓ Performance validation (blocking)
   ↓
4. Continuous commits preserve work (every 30 min)
   ↓
5. Agent reports completion with evidence
```

**Result:** Fast, autonomous, quality enforced automatically

---

## Examples of Autonomous Development

### Example 1: Simple Feature (No Spec)

```
User: "Add a loading spinner to the gallery"

Agent Process:
- Analyzes: Gallery needs loading state indicator
- Loads context: Athletic Design Token system, existing spinner patterns
- Plans: Create LoadingSpinner component, integrate in GalleryModal
- Implements:
  • Creates component with athletic tokens
  • Adds loading state to modal
  • Includes ARIA live region for screen readers
  • Writes 8 unit tests
- Validates:
  • Tests passing ✅
  • Accessibility verified ✅
  • Visual consistency with design system ✅
- Commits: "feat(gallery): add loading spinner with accessibility support"
- Reports: "Loading spinner added. 8 tests passing. ARIA-compliant."

Duration: Single conversation
Spec created: None
Tasks documented: Via commit message
```

### Example 2: Medium Feature (Lightweight Spec)

```
User: "Add image comparison slider to gallery - users should be able to
       compare before/after for edited photos"

Agent Process:
- Recognizes: Medium complexity, UI interaction, accessibility concerns
- Creates lightweight spec:
  • Overview: Before/after comparison slider
  • User stories with acceptance criteria
  • Edge cases: mobile touch, keyboard support
  • Deliverables: component, tests, docs
- Implements autonomously:
  • ImageComparisonSlider component
  • Touch gesture support
  • Keyboard control (arrow keys)
  • Responsive design
  • 24 tests (unit + E2E)
- Commits continuously with detailed messages
- Reports: "Image comparison slider complete. 24 tests passing.
           Full keyboard + touch support. WCAG AAA."

Duration: 1-2 conversations
Spec created: Yes (lightweight)
Sub-specs created: None (not needed)
Tasks file: No (tracked via commits)
```

### Example 3: Complex Feature (Full Spec)

```
User: "Implement real-time collaborative editing for the gallery -
       multiple users should be able to curate photos together"

Agent Process:
- Recognizes: High complexity, architectural, multiple concerns
- Creates comprehensive spec:
  • Full spec.md with detailed user stories
  • technical-spec.md (WebSocket architecture, conflict resolution)
  • api-spec.md (real-time sync API)
  • design.md (multi-user UI, presence indicators)
- Discusses approach with user
- Implements with continuous validation:
  • WebSocket server integration
  • Conflict resolution algorithm
  • Presence indicators UI
  • Real-time synchronization
  • 89 tests (unit, integration, E2E)
  • Decision log for architectural choices
- Commits continuously with milestone markers
- Creates IMPLEMENTATION-COMPLETE.md when done
- Reports: "Collaborative editing complete. 89 tests passing.
           Handles network failures. Supports 10+ concurrent users."

Duration: Multiple conversations over days
Spec created: Yes (comprehensive with sub-specs)
Tasks file: Optional (complexity warrants it)
Decision log: Yes (architectural choices)
```

---

## Integration with Agent Orchestration

### Quality Enforcement Agents

The spec creation process integrates with specialized agents:

1. **Canvas Metaphor Agent** - Validates photography metaphor consistency
2. **Architecture Agent** - Validates component structure and patterns
3. **TypeScript Agent** - Validates type safety and compilation
4. **Test Coverage Agent** - Validates test completeness
5. **Accessibility Agent** - Validates WCAG compliance

**These agents replace manual checkpoints** - they run automatically during implementation.

### Documentation Maintenance Agent

The **doc-maintainer agent** automatically:
- Updates documentation when specs are completed
- Synchronizes code references with implementations
- Generates diagrams from architecture changes
- Maintains metrics and project statistics

**Specs feed into automated documentation** - no manual sync needed.

---

## Migration from Legacy Workflow

### If You Have Old Specs (Pre-Sept 30, 2025)

**Keep them** - they're valuable reference:
- Move to `.agent-os/archive/completed-specs/`
- Add IMPLEMENTATION-COMPLETE.md if not present
- Update roadmap to reflect actual completion status
- Use as templates when formal specs ARE needed

### If Starting New Work

**Default to autonomous mode:**
1. State your intent: "Add feature X"
2. Let agent assess: Agent determines if spec is needed
3. If spec needed: Agent creates lightweight spec and discusses
4. If spec not needed: Agent implements directly with continuous validation
5. Review completion: Agent reports with evidence (tests, performance, accessibility)

### If Unsure

**Ask the agent:**
```
User: "Should we create a spec for [feature]?"

Agent: [assesses complexity, risk, stakeholders]
Agent: "Yes, I recommend a lightweight spec because [reasons]"
       OR "No spec needed - I can implement this directly with continuous validation"
```

**The agent makes the call** based on complexity.

---

## Quality Standards (Unchanged)

Whether using specs or autonomous mode, quality standards remain:

✅ **Test Coverage:** >90% for core features
✅ **Accessibility:** WCAG AAA compliance
✅ **Performance:** 60fps animations, <500ms interactions
✅ **Documentation:** Updated in parallel with code
✅ **Type Safety:** Zero TypeScript errors
✅ **Code Quality:** Follows established patterns and conventions

**How enforced:**
- **Old way:** Manual checkpoints and user reviews
- **New way:** Automated quality gates (blocking)

**Result:** Same quality, faster delivery

---

## Summary

### Default Workflow (Most Features)

```
User intent → Autonomous implementation → Continuous validation → Completion report
```

**No spec needed. No tasks.md needed. Quality gates enforce standards.**

### When Specs Are Needed (Complex Features)

```
User intent → Lightweight spec → Discussion → Autonomous implementation →
Continuous validation → Decision log → Completion report
```

**Minimal spec. No tasks.md. Quality gates enforce standards.**

### When Full Specs Are Needed (High Complexity/Risk)

```
User intent → Comprehensive spec + sub-specs → Approval → Phased implementation →
Continuous validation → Decision log → Completion report
```

**Full documentation. Quality gates enforce standards. Work tracked via commits.**

---

## Next Steps

1. **Read:** `.agent-os/workflow/agent-orchestration.md` - How agents work together
2. **Try:** Start your next feature with intent-driven development
3. **Observe:** See how quality gates enforce standards automatically
4. **Adapt:** Create specs when complexity demands it, skip otherwise

**The goal:** Maximum velocity with maintained quality through automation.

---

**Version:** 1.0.0
**Last Updated:** 2025-09-30
**Maintained By:** Agent OS Workflow Team
