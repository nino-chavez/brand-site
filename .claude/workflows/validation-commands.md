# Validation Command Patterns

## Overview

While Claude Code doesn't support custom slash commands, you can request manual agent validation using natural language patterns. Claude (the AI assistant) recognizes these patterns and invokes the appropriate agents.

## Command Patterns

### Individual Agent Validation

#### Architecture Validation
**Patterns:**
- "validate architecture"
- "check architecture"
- "run architecture guardian"
- "validate canvas patterns"

**Triggers:** canvas-architecture-guardian agent

**Example:**
```
User: "validate architecture for the lightbox component"
Claude: *Invokes canvas-architecture-guardian agent*
```

---

#### Accessibility Validation
**Patterns:**
- "validate accessibility"
- "check accessibility"
- "check a11y"
- "validate WCAG compliance"
- "check keyboard navigation"

**Triggers:** accessibility-validator agent

**Example:**
```
User: "check accessibility on the gallery modal"
Claude: *Invokes accessibility-validator agent*
```

---

#### Performance Validation
**Patterns:**
- "validate performance"
- "check performance"
- "check bundle size"
- "validate fps"
- "check optimization"

**Triggers:** performance-budget-enforcer agent

**Example:**
```
User: "validate performance of the new feature"
Claude: *Invokes performance-budget-enforcer agent*
```

---

#### Photography Metaphor Validation
**Patterns:**
- "validate metaphor"
- "check photography metaphor"
- "validate camera terminology"
- "check lens naming"

**Triggers:** photography-metaphor-validator agent

**Example:**
```
User: "check metaphor in the thumbnail component"
Claude: *Invokes photography-metaphor-validator agent*
```

---

#### Test Coverage Validation
**Patterns:**
- "validate coverage"
- "check test coverage"
- "validate tests"
- "check testing"

**Triggers:** test-coverage-guardian agent

**Example:**
```
User: "validate coverage for CategoryFilterBar"
Claude: *Invokes test-coverage-guardian agent*
```

---

#### Voice & Tone Validation
**Patterns:**
- "validate voice"
- "check architect's protocol"
- "validate copy"
- "check voice compliance"
- "audit content voice"
- "validate tone"

**Triggers:** architects-voice-auditor agent

**Example:**
```
User: "validate voice in the About section"
Claude: *Invokes architects-voice-auditor agent*
```

---

### Combined Validation

#### All Quality Gates
**Patterns:**
- "run all quality gates"
- "validate everything"
- "run all gates"
- "full validation"
- "complete validation suite"

**Triggers:** All 6 specialized agents in sequence

**Example:**
```
User: "run all quality gates on the gallery changes"
Claude: *Invokes all agents: architecture, accessibility, performance, metaphor, coverage, voice*
```

---

#### Multiple Specific Gates
**Patterns:**
- "validate accessibility and performance"
- "check metaphor and architecture"
- "run accessibility, performance, and coverage gates"

**Triggers:** Specified subset of agents

**Example:**
```
User: "validate accessibility and metaphor for the new modal"
Claude: *Invokes accessibility-validator and photography-metaphor-validator*
```

---

## Usage Notes

### When to Use Manual Validation

1. **Before Committing** - Run relevant gates on staged changes
2. **During Development** - Validate specific aspects as you work
3. **After Major Changes** - Run full suite for comprehensive check
4. **Debugging** - Validate specific concern (e.g., accessibility issue)

### Automatic vs Manual Validation

**Automatic (via npm run validate):**
- Happens before commit
- Analyzes staged files
- Triggers based on paths + keywords
- No user input needed

**Manual (via command patterns):**
- On-demand validation
- Can target specific files/components
- Useful during development
- User-initiated

### Pattern Recognition

Claude recognizes validation requests through:

1. **Command verbs:** validate, check, run, test
2. **Agent names:** architecture, accessibility, performance, metaphor, coverage
3. **Domain terms:** WCAG, a11y, fps, bundle, keyboard, photography
4. **Scope indicators:** "for X", "on Y", "in Z"

### Response Format

When you request validation, Claude will:

1. Acknowledge the request
2. Invoke the appropriate agent(s)
3. Report results (PASS/FAIL)
4. Provide specific issues if validation fails
5. Suggest fixes for failures

---

## Quick Reference

| Want to validate... | Say this... |
|-------------------|-------------|
| Canvas architecture | "validate architecture" |
| Accessibility | "check a11y" or "validate accessibility" |
| Performance | "check performance" |
| Photography metaphor | "validate metaphor" |
| Test coverage | "check coverage" |
| Voice & tone compliance | "validate voice" or "check architect's protocol" |
| Everything | "run all quality gates" |

---

## Integration with Git Workflow

These command patterns work alongside the automated validation:

```
# Typical workflow:

1. Develop feature
2. (Optional) "validate architecture" during development
3. Stage changes: git add .
4. Run automated validation: npm run validate
5. See which agents are required
6. Claude invokes agents automatically before commit
7. Commit after all gates pass
```

The manual command patterns give you **on-demand validation** while the automated system ensures **nothing slips through at commit time**.

---

## Examples in Practice

### Example 1: Focused Validation
```
User: I just added keyboard shortcuts to the gallery. Check accessibility.

Claude: I'll validate accessibility for the keyboard shortcuts.
*Invokes accessibility-validator*
Result: PASS - Keyboard navigation follows WCAG 2.2 AA standards...
```

### Example 2: Multiple Gates
```
User: Validate accessibility and performance for the modal component.

Claude: Running accessibility-validator and performance-budget-enforcer.
*Invokes both agents*
Results:
- accessibility-validator: PASS ✅
- performance-budget-enforcer: FAIL ❌ (bundle size exceeds budget)
```

### Example 3: Full Suite
```
User: Run all quality gates on the gallery refactor.

Claude: Running complete validation suite (5 agents).
*Invokes all agents sequentially*
Results: 4/5 PASS, photography-metaphor-validator found 2 issues...
```

---

## Tips for Effective Validation

1. **Be specific** - Mention the file/component you want validated
2. **Request early** - Validate during development, not just before commit
3. **Request often** - Better to validate incrementally than all at once
4. **Act on feedback** - Fix issues immediately while context is fresh
5. **Use combined requests** - "check accessibility and metaphor" saves time

---

## Relationship to Documented Slash Commands

The `.agent-os/` documentation references slash commands like:
- `/validate-architecture`
- `/validate-accessibility`
- etc.

These are **conceptual commands** from the ideal workflow design. The command patterns in this document provide the **practical equivalent** that works within Claude Code's capabilities.

**Think of command patterns as natural language slash commands.**