# Decision Logging Workflow

## Overview

This workflow enables automated logging of architectural decisions in standardized format, creating a permanent record of technical choices made during development.

## When to Log Decisions

### Always Log
- Architecture changes (state management, component structure)
- Technology choices (libraries, frameworks, tools)
- Performance optimizations (trade-offs made)
- Accessibility patterns (why chosen over alternatives)
- Breaking changes (rationale for breaking compatibility)

### Consider Logging
- Non-obvious implementations (why this approach)
- Deviations from standards (justified exceptions)
- Complex algorithms (why this solution)
- Photography metaphor extensions (terminology choices)

### Skip Logging
- Routine bug fixes
- Trivial changes
- Standard implementations
- Documentation updates

---

## Decision Logging Process

### Step 1: Get Template

```bash
npm run decision:template
```

**Output:**
```json
{
  "title": "",
  "context": "",
  "problem": "",
  "alternatives": [
    {
      "name": "",
      "description": "",
      "pros": [],
      "cons": [],
      "trade_offs": ""
    }
  ],
  "chosen_solution": "",
  "rationale": "",
  "consequences": {
    "positive": [],
    "negative": [],
    "risks": []
  },
  "related_files": [],
  "tags": [],
  "status": "Accepted"
}
```

### Step 2: Fill Template

Create a JSON file or prepare inline JSON with decision details.

**Example: `canvas-state-decision.json`**
```json
{
  "title": "Centralized Canvas State Management",
  "context": "The lightbox and navigation components need to share state for camera position, zoom level, and navigation state. Previously, state was duplicated across components leading to sync issues.",
  "problem": "How do we manage shared state between lightbox and navigation without prop drilling or state duplication?",
  "alternatives": [
    {
      "name": "Prop Drilling",
      "description": "Pass state and setters through component hierarchy",
      "pros": ["Simple", "No dependencies", "Easy to trace"],
      "cons": ["Deeply nested props", "Hard to maintain", "Component coupling"],
      "trade_offs": "Simplicity vs maintainability"
    },
    {
      "name": "Context API",
      "description": "Use React Context for shared state",
      "pros": ["No prop drilling", "React built-in", "Well understood"],
      "cons": ["Can cause unnecessary rerenders", "Requires provider wrapper"],
      "trade_offs": "Convenience vs performance"
    },
    {
      "name": "Zustand Store",
      "description": "External state library with fine-grained subscriptions",
      "pros": ["No rerenders", "Simple API", "TypeScript support"],
      "cons": ["External dependency", "Learning curve"],
      "trade_offs": "Performance vs complexity"
    }
  ],
  "chosen_solution": "Context API with useMemo optimization",
  "rationale": "Context API provides the right balance for this use case. The state changes are infrequent (user interactions), so rerender performance is not critical. Using useMemo on context value prevents unnecessary rerenders. Keeps bundle size small without external dependencies.",
  "consequences": {
    "positive": [
      "Clean component interfaces without prop drilling",
      "State changes propagate automatically",
      "Easy to add new state consumers",
      "Well-documented React pattern"
    ],
    "negative": [
      "Requires provider wrapper in component tree",
      "All context consumers rerender on any state change",
      "Slightly more complex than props"
    ],
    "risks": [
      "Performance issues if state changes frequently",
      "Context can grow complex if too much state added"
    ]
  },
  "related_files": [
    "src/contexts/CanvasContext.tsx",
    "src/components/canvas/Lightbox.tsx",
    "src/components/canvas/Navigation.tsx"
  ],
  "tags": ["architecture", "state-management", "canvas", "performance"],
  "status": "Accepted"
}
```

### Step 3: Log Decision

**From file:**
```bash
npm run decision:log -- "$(cat canvas-state-decision.json)"
```

**From stdin:**
```bash
cat canvas-state-decision.json | npm run decision:log -- -
```

**Inline (short decisions):**
```bash
npm run decision:log -- '{"title":"Use CSS-in-JS","context":"...","problem":"...","chosen_solution":"...","rationale":"..."}'
```

### Step 4: Reference in Commit

Include decision ID in commit message:

```bash
git commit -m "refactor: centralize canvas state management

Implement shared state using Context API with useMemo optimization.

Decision: 2025-09-30-a3f2
Architecture: State management, canvas components
Impact: Eliminates prop drilling, improves maintainability

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Claude Integration

### During Implementation

When Claude makes a significant architectural decision:

1. **Claude documents decision inline** during implementation
2. **Before committing**, Claude logs the decision:
   ```
   I'm logging this architectural decision...
   *Creates decision JSON*
   *Runs npm run decision:log*
   ```
3. **Claude references decision ID** in commit message

### User-Initiated Logging

User can request decision logging:

```
User: "Log the decision to use Context API for canvas state"

Claude: I'll log this architectural decision.
*Gathers context from conversation*
*Creates structured decision JSON*
*Logs via npm script*
Decision logged: .agent-os/decisions/2025-09-30-a3f2-context-api-canvas.md
```

---

## Decision Templates by Type

### Architecture Decision
```json
{
  "title": "[Component/System] [Action]",
  "context": "Current architecture and constraints",
  "problem": "What needs to be solved",
  "alternatives": [/* 2-4 options considered */],
  "chosen_solution": "Selected approach",
  "rationale": "Why this choice",
  "consequences": {/* trade-offs */},
  "tags": ["architecture", "domain"]
}
```

### Technology Choice
```json
{
  "title": "Adopt [Technology] for [Use Case]",
  "context": "Why we need this technology",
  "problem": "What problem it solves",
  "alternatives": [/* competing technologies */],
  "chosen_solution": "Selected technology",
  "rationale": "Why this over alternatives",
  "consequences": {
    "positive": ["Benefits"],
    "negative": ["Trade-offs"],
    "risks": ["Potential issues"]
  },
  "tags": ["technology", "dependency"]
}
```

### Performance Optimization
```json
{
  "title": "Optimize [Component] [Metric]",
  "context": "Performance problem observed",
  "problem": "Specific performance issue",
  "alternatives": [/* optimization approaches */],
  "chosen_solution": "Optimization implemented",
  "rationale": "Why this optimization",
  "consequences": {
    "positive": ["Performance gains"],
    "negative": ["Code complexity"],
    "risks": ["Maintainability concerns"]
  },
  "tags": ["performance", "optimization"]
}
```

---

## Decision Review

### List All Decisions
```bash
npm run decision:list
```

### View Decision
```bash
cat .agent-os/decisions/2025-09-30-a3f2-canvas-state.md
```

### Search Decisions
```bash
grep -r "state management" .agent-os/decisions/
```

### Decision by Tag
```bash
grep -l "#performance" .agent-os/decisions/*.md
```

---

## Decision Lifecycle

### Status Values

- **Proposed** - Decision under consideration
- **Accepted** - Decision implemented and active
- **Deprecated** - Decision superseded by newer approach
- **Rejected** - Decision considered but not chosen

### Updating Decisions

If a decision changes:

1. Create **new decision** documenting the change
2. Reference **previous decision** in context
3. Update **old decision status** to "Deprecated"
4. Link decisions together

**Example:**
```json
{
  "title": "Migrate from Context API to Zustand",
  "context": "Previous decision (2025-09-30-a3f2) used Context API. Performance profiling revealed rerender issues affecting FPS.",
  "supersedes": "2025-09-30-a3f2",
  ...
}
```

---

## Integration with Quality Gates

### Before Committing

If architectural change:
1. Implement feature
2. **Log decision** (if architectural)
3. Run validation: `npm run validate`
4. Commit with decision reference

### During Code Review

Reviewer checks:
- [ ] Significant decisions logged
- [ ] Decision rationale clear
- [ ] Alternatives considered
- [ ] Consequences documented
- [ ] Related files listed

---

## Examples

### Example 1: Quick Decision Log
```bash
# Get template
npm run decision:template > my-decision.json

# Edit in editor
# ... fill in details ...

# Log it
npm run decision:log -- "$(cat my-decision.json)"

# Commit with reference
git commit -m "feat: add feature

Decision: 2025-09-30-xxxx"
```

### Example 2: Claude Logs Decision
```
User: Why did you choose this approach?

Claude: This is an architectural decision worth logging.
Let me document it:

*Claude creates decision JSON with:*
- Context from conversation
- Problem statement
- Alternatives discussed
- Chosen solution with rationale
- Consequences identified

*Runs: npm run decision:log*

Decision logged: .agent-os/decisions/2025-09-30-f8d3-canvas-optimization.md

I'll reference this in the commit message.
```

### Example 3: Review Decisions
```bash
# List all decisions
npm run decision:list

# Find canvas-related decisions
grep -l "#canvas" .agent-os/decisions/*.md

# View specific decision
cat .agent-os/decisions/2025-09-30-a3f2-canvas-state.md
```

---

## Benefits

1. **Permanent Record** - Architectural decisions preserved forever
2. **Context for Future** - Why decisions were made, not just what
3. **Onboarding** - New developers understand historical choices
4. **Review** - Easy to audit decision quality over time
5. **Learning** - Track what works and what doesn't

---

## Best Practices

### DO:
✅ Log decisions at the time they're made (context is fresh)
✅ Document alternatives considered (shows thoroughness)
✅ List consequences honestly (including negatives)
✅ Reference decisions in commits
✅ Update decision status when superseded

### DON'T:
❌ Log every minor implementation choice
❌ Skip alternatives section (shows lack of consideration)
❌ Forget to list related files
❌ Leave decisions untagged
❌ Let decisions become stale without updates

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run decision:template` | Get decision JSON template |
| `npm run decision:log -- '<json>'` | Log a decision |
| `npm run decision:log -- -` | Log from stdin |
| `npm run decision:list` | List all logged decisions |

**Decisions are stored in:** `.agent-os/decisions/`
**Decision format:** `YYYY-MM-DD-ID-title-slug.md`