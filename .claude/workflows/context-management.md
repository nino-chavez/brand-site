# Context Management Strategy

## Overview

Claude Code manages context automatically, but this strategy provides guidance for efficient context loading based on the tiered approach documented in `.agent-os/config.yml`.

## Tiered Context Loading

### Tier 1: Strategic Context (Always Load First)
**Budget:** ~20K tokens
**When:** Start of session, after long breaks

**Files:**
- `.claude/CLAUDE.md` - Project context & collaboration guide
- `.agent-os/config.yml` - Workflow configuration
- `.agent-os/product/mission-lite.md` - Project mission (if exists)

**Purpose:** High-level understanding of project goals, constraints, and workflow

**Load Pattern:**
```markdown
Please read:
- .claude/CLAUDE.md
- .agent-os/config.yml
```

---

### Tier 2: Domain Context (Load Per Feature Area)
**Budget:** ~50K tokens
**When:** Working on specific domain/feature

**Intelligence Patterns:**
```
Canvas/3D Work:
- .agent-os/intelligence/canvas-evolution-strategy.md
- .agent-os/intelligence/state-management-decision-tree.md

Gallery/Photography:
- .agent-os/intelligence/photography-component-patterns.md
- .agent-os/intelligence/gallery-architecture-principles.md

Performance:
- .agent-os/intelligence/performance-monitoring-strategy.md
```

**Load Pattern:**
```markdown
I'm working on canvas lightbox navigation.
Please load relevant intelligence patterns.
```

---

### Tier 3: Implementation Context (Load As Needed)
**Budget:** ~100K tokens
**When:** During active implementation

**Files:**
- Component being modified
- Related components (imports/exports)
- Type definitions
- Existing tests

**Load Pattern:**
```markdown
Show me:
- src/components/canvas/Lightbox.tsx
- src/components/canvas/Navigation.tsx
- src/types/canvas.ts
```

---

### Tier 4: Reference Context (Load On Demand)
**Budget:** ~30K tokens (buffer)
**When:** Debugging, analyzing, reviewing decisions

**Files:**
- Historical decision logs (`.agent-os/decisions/`)
- Audit logs (`.agent-os/audit/`)
- Performance metrics
- Test results

**Load Pattern:**
```markdown
Show me the decision log for canvas state management
```

---

## Context Loading Triggers

### Automatic (Claude Code)
Claude Code automatically loads:
- Files mentioned in conversation
- Recently modified files
- Files referenced in errors
- Related files (imports)

### Manual Request Patterns

**Start of Session:**
```
Load strategic context for this project
```
→ Claude reads Tier 1 files

**Starting New Feature:**
```
I'm adding mobile touch gestures to the gallery.
Load relevant context.
```
→ Claude loads Tier 1 + Tier 2 (gallery intelligence)

**Implementation:**
```
Show me CategoryFilterBar and related components
```
→ Claude loads Tier 3 (implementation files)

**Debugging:**
```
Why did we choose this state management pattern?
Show me the decision log.
```
→ Claude loads Tier 4 (decisions/audit)

---

## Context Refresh Strategy

### When to Refresh

1. **After 30 minutes idle** - Strategic context may be stale
2. **After branch switch** - Context changes with branch
3. **After major refactor** - Implementation context outdated
4. **Before quality gates** - Ensure latest agent specs loaded

### How to Refresh

**Full Refresh:**
```
Refresh all context - reload CLAUDE.md and intelligence patterns
```

**Partial Refresh:**
```
Reload canvas intelligence patterns
```

**Targeted Refresh:**
```
Re-read the updated CategoryFilterBar component
```

---

## Context Budget Management

### Token Budget Allocation

| Tier | Budget | Usage Pattern |
|------|--------|---------------|
| Tier 1 | 20K | Persistent (always loaded) |
| Tier 2 | 50K | Domain-specific (loaded per area) |
| Tier 3 | 100K | Active implementation (current work) |
| Tier 4 | 30K | On-demand reference (as needed) |
| **Total** | **200K** | Maximum context window |

### Staying Within Budget

**If context full:**
1. Drop Tier 4 (reference) first
2. Narrow Tier 3 (fewer implementation files)
3. Keep Tier 1 + Tier 2 (strategic + domain)

**Optimization:**
- Load intelligence patterns summarized (not full text)
- Load only modified functions (not entire files)
- Reference file paths instead of full content when possible

---

## Intelligent Context Loading

### Based on Task Type

**Architecture Changes:**
```
Tier 1: ✓ CLAUDE.md, config.yml
Tier 2: ✓ Canvas intelligence patterns
Tier 3: ✓ Components being modified
Tier 4: ✓ Previous architecture decisions
```

**Bug Fix:**
```
Tier 1: ✓ CLAUDE.md (for standards)
Tier 2: ✗ Skip (not needed for fix)
Tier 3: ✓ Component with bug + tests
Tier 4: ✓ Related decisions (if architectural bug)
```

**New Feature:**
```
Tier 1: ✓ Full strategic context
Tier 2: ✓ Domain intelligence
Tier 3: ✓ Related existing components
Tier 4: ✗ Skip (no history yet)
```

**Refactoring:**
```
Tier 1: ✓ Standards and patterns
Tier 2: ✓ Domain patterns
Tier 3: ✓ All affected components
Tier 4: ✓ Original implementation decisions
```

---

## Context Validation

### Before Major Decisions

Ensure loaded context includes:
- [ ] Project standards (CLAUDE.md)
- [ ] Relevant intelligence patterns
- [ ] Current implementation state
- [ ] Related architectural decisions

### Validation Commands

**Check what's loaded:**
```
What context do you currently have about the canvas architecture?
```

**Verify strategic understanding:**
```
What are the key principles for this project?
```

**Confirm domain knowledge:**
```
Summarize the canvas state management strategy
```

---

## Context Loading Examples

### Example 1: Starting Canvas Feature
```
User: I need to add keyboard navigation to the lightbox

Claude: Let me load the necessary context:
- Reading CLAUDE.md for project standards
- Loading canvas-evolution-strategy.md
- Loading state-management-decision-tree.md
- Reading current Lightbox.tsx implementation

Context loaded. I can see the lightbox uses [describe architecture].
For keyboard navigation, I recommend...
```

### Example 2: Debugging Performance
```
User: The gallery is slow when filtering

Claude: Let me load performance context:
- Reading performance-monitoring-strategy.md
- Checking CategoryFilterBar implementation
- Loading performance budget settings from config.yml

I see the issue: [analyze with full context]
```

### Example 3: Reviewing Architecture
```
User: Why do we separate lightbox and navigation?

Claude: Loading architectural context:
- Reading canvas-architecture-principles.md
- Checking decision log for canvas separation
- Reviewing current implementation

This separation was decided because [explain with context]
```

---

## Integration with Workflow

### During Implementation

1. **Start**: Load Tier 1 (strategic)
2. **Plan**: Load Tier 2 (domain intelligence)
3. **Implement**: Load Tier 3 (components)
4. **Review**: Keep Tier 3, validate against Tier 1

### During Quality Gates

**Before running agents:**
- Ensure agent specifications are loaded (Tier 2)
- Have implementation context available (Tier 3)
- Ready to reference standards (Tier 1)

**During validation:**
- Keep relevant context loaded
- Agent needs to see same context Claude has
- May need to reload specific files for fresh analysis

---

## Best Practices

### DO:
✅ Load strategic context at session start
✅ Request domain patterns when starting feature
✅ Keep implementation files loaded during work
✅ Refresh context after long breaks
✅ Validate context before major decisions

### DON'T:
❌ Load all intelligence patterns at once (too much)
❌ Keep stale context after branch switch
❌ Request full file content when summary suffices
❌ Load reference material until needed
❌ Forget to refresh after significant changes

---

## Relationship to Documentation

The `.agent-os/config.yml` documents the ideal context tier strategy:

```yaml
context_management:
  use_tiered_loading: true
  tier1_files:
    - .claude/CLAUDE.md
    - .agent-os/product/mission-lite.md
    - .agent-os/standards/**
    - .agent-os/intelligence/**
```

This document provides the **practical implementation** of that strategy within Claude Code's capabilities.

---

## Quick Reference

| Scenario | Load | Command Pattern |
|----------|------|-----------------|
| Session start | Tier 1 | "Load strategic context" |
| New feature | Tier 1+2 | "Load context for [domain]" |
| Implementation | Tier 3 | "Show me [component]" |
| Debugging | Tier 4 | "Show decision log for [topic]" |
| Context refresh | Any | "Refresh [context type]" |

**Remember:** Context loading is a conversation with Claude. Be explicit about what you need loaded.