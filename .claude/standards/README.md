# Claude Standards Documentation

**Purpose**: Reusable patterns, standards, and diagnostic prompts for AI-assisted development

This directory contains battle-tested standards and prompts extracted from real-world development on the Nino Chavez Portfolio project. These learnings can be applied to other projects for faster problem resolution and higher-quality AI collaboration.

---

## Directory Structure

```
.claude/standards/
├── README.md                          # This file
└── testing/
    ├── test-configuration-optimization.md    # Standard for fixing test memory issues
    └── claude-diagnostic-prompts.md          # Reusable prompts for test diagnostics
```

---

## Available Standards

### Testing

#### [Test Configuration Optimization](testing/test-configuration-optimization.md)

**Problem Solved**: System freezing during test execution due to memory exhaustion

**Key Learnings**:
- Replace unbounded parallelism with controlled worker pools
- Remove excessive `NODE_OPTIONS` heap allocation
- Enable process isolation to prevent memory leaks
- Separate E2E and unit tests into different runners

**Real-World Metrics** (from this project):
- Before: System freeze, tests never complete
- After: 23.39s execution, 530 tests, no freezes ✅

**When to Use**:
- Large test suites (100+ files)
- Memory-intensive environments (jsdom, React Testing Library)
- CI/CD pipelines timing out
- Local development experiencing slowdowns

---

#### [Claude Diagnostic Prompts](testing/claude-diagnostic-prompts.md)

**Problem Solved**: Getting Claude to diagnose and fix test configuration issues across different projects

**Available Prompts**:
1. **Comprehensive Diagnostic** - Full analysis with step-by-step guidance (10-15 min)
2. **Compact Diagnostic** - Quick triage and fix (3-5 min)

**When to Use**:
- New project setup requiring test configuration
- Inherited codebase with unfamiliar test setup
- Emergency production issue resolution
- Teaching team members about test optimization

---

## How to Use These Standards

### In New Projects

1. **Copy prompt templates** from `claude-diagnostic-prompts.md`
2. **Paste into Claude** in the new project
3. **Let Claude analyze** and apply fixes
4. **Validate results** against metrics in `test-configuration-optimization.md`

### In Documentation

Reference these standards in project README or contributing guides:

```markdown
## Test Configuration

This project follows test configuration standards from:
https://github.com/nino-chavez/portfolio/.claude/standards/testing/

Key principles:
- Worker pool limits (maxForks: 4)
- Process isolation enabled
- No excessive NODE_OPTIONS heap allocation
```

### In Code Review

Use standards as review criteria:

```markdown
## PR Review Checklist

- [ ] Test configuration matches `.claude/standards/testing/test-configuration-optimization.md`
- [ ] No `NODE_OPTIONS` heap size in standard test scripts
- [ ] Worker limits configured appropriately
- [ ] E2E tests separated from unit tests
```

---

## Contributing New Standards

When discovering new patterns worth documenting:

### 1. Validate the Pattern

- Applied successfully in ≥2 different contexts
- Measurable improvement metrics available
- Reproducible by team members or AI

### 2. Create Standard Document

```markdown
# [Standard Name]

**Version:** 1.0.0
**Last Updated:** [Date]
**Applies To:** [Technologies/scenarios]
**Purpose:** [Problem solved]

## Problem Statement
[What issue does this address?]

## Solution Architecture
[Core approach and principles]

## Implementation Guide
[Step-by-step instructions]

## Real-World Case Study
[Metrics from this project]

## Validation Checklist
[How to verify success]

## References
[Links to docs, related standards]
```

### 3. Add Claude Prompts

If applicable, create companion diagnostic prompts:

```markdown
# Claude [Diagnostic/Generation] Prompts for [Domain]

## Overview
[What these prompts accomplish]

## Prompt Templates
[Reusable prompt text]

## Expected Output
[What Claude should produce]

## Integration
[How to use in workflows]
```

### 4. Update This README

Add entry to "Available Standards" section with:
- Problem solved
- Key learnings (3-5 bullet points)
- Real-world metrics
- When to use

### 5. Version and Commit

```bash
git add .claude/standards/
git commit -m "docs(standards): add [standard-name]

- Problem: [brief description]
- Solution: [brief description]
- Metrics: [key improvement]
- Applies to: [technologies]"
```

---

## Standard Categories (Future)

As more standards are documented, organize into categories:

```
.claude/standards/
├── testing/           # Test configuration, coverage, performance
├── architecture/      # Design patterns, separation of concerns
├── performance/       # Bundle size, runtime optimization
├── accessibility/     # WCAG compliance, keyboard navigation
├── documentation/     # Technical writing, API docs
└── ai-collaboration/  # Prompt engineering, agent workflows
```

---

## Standard Template

When creating new standards, use this template:

```markdown
# [Standard Name]

**Version:** 1.0.0
**Last Updated:** YYYY-MM-DD
**Applies To:** [Technologies, frameworks, scenarios]
**Purpose:** [One-sentence problem statement]

---

## Problem Statement
[2-3 paragraphs describing the problem]

### Symptoms
- [Observable issue 1]
- [Observable issue 2]

---

## Solution Architecture

### Core Principle
[One-sentence guiding principle]

### Configuration Pattern
[Code example of solution]

---

## Implementation Guide

### Step 1: [Action]
[Instructions with code examples]

### Step 2: [Action]
[Instructions with code examples]

---

## Real-World Case Study

### Project: [Name]

**Before:**
- [Metric 1]: [Value]
- [Problem description]

**After:**
- [Metric 1]: [Value] ([% change])
- [Result description]

---

## Decision Matrix
[When to apply this standard]

---

## Common Pitfalls
[What NOT to do]

---

## Validation Checklist
- [ ] [Verification step 1]
- [ ] [Verification step 2]

---

## References
- [External docs]
- [Related standards]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | YYYY-MM-DD | Initial standard |
```

---

## Philosophy

These standards embody the following principles:

1. **Experience-Driven**: Derived from real problems encountered in production
2. **Metrics-Backed**: Include before/after measurements demonstrating value
3. **AI-Optimized**: Designed for Claude to understand and apply consistently
4. **Project-Agnostic**: Reusable across different codebases and technologies
5. **Living Documents**: Versioned and updated as patterns evolve

---

## Showcase Value

As part of Nino's personal brand:

### For Employers/Collaborators

Demonstrates:
- Systematic problem-solving approach
- Documentation discipline
- Knowledge sharing mindset
- AI-assisted development expertise
- Long-term maintainability focus

### For Open Source

Standards can be:
- Referenced in blog posts about AI-assisted development
- Shared with developer community
- Used in talks/presentations about Claude Code
- Contributed back to Claude Code documentation

### For Future Projects

Provides:
- Faster project bootstrapping
- Consistent quality standards
- Reusable diagnostic workflows
- Proven optimization patterns

---

**Standard Owner**: Nino Chavez
**Contact**: [Portfolio website: nino-chavez.com]
**License**: MIT (freely reusable with attribution)
**Contributions**: Welcome via pull requests or issues

---

*Last Updated: 2025-10-04*
