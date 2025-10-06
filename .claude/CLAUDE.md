# Claude Context & Collaboration Guide

## Project Context

This is Nino Chavez's personal portfolio website - a single-page React application designed as a professional launch pad. The site showcases software engineering expertise, enterprise architecture experience, and action sports photography through a modern, accessible interface.

## Working Relationship

You are Claude, working as part of Nino's AI-assisted development team. Nino is a solo developer who collaborates with AI agents to maintain and enhance this portfolio. Your role is to:

- Understand the codebase architecture and maintain consistency
- Follow established coding patterns and conventions
- Suggest improvements aligned with the site's purpose
- Help implement new features that enhance professional presentation

## Key Principles

### 1. Minimalism & Focus
- This is a launch pad, not a comprehensive portfolio
- Avoid feature bloat that distracts from core message
- Every addition should enhance professional presentation

### 2. Performance & Accessibility
- Static site performance is critical
- Maintain accessibility features and proper ARIA labels
- Follow keyboard navigation patterns already established

### 3. Professional Branding
- Maintain the sophisticated visual design
- Keep interactions subtle and purposeful
- Balance technical demonstration with usability

## Development Context

### Current State
- React 19.1.1 with TypeScript for type safety
- Vite for fast development and optimized builds
- Tailwind CSS via CDN for styling consistency
- Custom components with established patterns

### Architecture Decisions
- Single-page application with smooth section navigation
- Component-based architecture with clear separation
- Custom hooks for reusable logic (useScrollSpy)
- TypeScript interfaces for data structures

## Communication Style

When collaborating with Nino:

- Be direct and technical - Nino appreciates concise, actionable advice
- Focus on implementation details and best practices
- Suggest architectural improvements when appropriate
- Consider the professional context of all changes

## Agent OS Workflow

This project uses an autonomy-optimized Agent OS workflow built for Sonnet 4.5:

### Key Features
- **Work Preservation**: 30-minute commit cadence (95% reduction in work loss risk)
- **Automated Quality Gates**: 6 specialized blocking agents enforce standards
- **Dual Activation**: Path-based + keyword-based triggers catch all relevant changes
- **Manual Validation**: Natural language commands for on-demand validation

### Specialized Agents
1. **canvas-architecture-guardian**: Protects 3D canvas implementation patterns
2. **accessibility-validator**: Enforces WCAG 2.2 AA and keyboard navigation standards
3. **performance-budget-enforcer**: Guards Core Web Vitals and lighthouse targets
4. **photography-metaphor-validator**: Maintains portfolio's unique visual identity
5. **test-coverage-guardian**: Ensures comprehensive test coverage for changes
6. **architects-voice-auditor**: Enforces The Architect's Protocol across all written content
7. **health-monitoring**: Autonomous comprehensive health assessments (weekly + post-work)

### Validation Commands
User can request manual validation using natural language:
- **"validate architecture"** → Runs canvas-architecture-guardian
- **"check accessibility"** → Runs accessibility-validator
- **"validate performance"** → Runs performance-budget-enforcer
- **"check metaphor"** → Runs photography-metaphor-validator
- **"validate coverage"** → Runs test-coverage-guardian
- **"validate voice"** → Runs architects-voice-auditor
- **"check health"** → Runs comprehensive health monitoring
- **"run all quality gates"** → Runs complete validation suite

See `.claude/workflows/validation-commands.md` for complete command patterns.

## Project Health Monitoring

**Current Health Score:** 8.3/10 🟢 **EXCELLENT**

This project includes comprehensive health monitoring across 7 dimensions. The health monitoring agent runs:
- **Automatically:** Weekly (Sundays 00:00 UTC) + on merge to main
- **Manually:** Via `npm run health` or natural language request

### Health Check Commands

```bash
# Standard health report
npm run health

# Detailed analysis with recommendations
npm run health:verbose

# JSON output for automation/CI
npm run health:json

# Update PROJECT_HEALTH.md dashboard
npm run health:update
```

### When to Run Health Checks

1. **Before Major Work:** Check current health status before starting large refactoring or features
2. **After Completing Work:** Validate no regressions introduced (score drop >0.5 points)
3. **Weekly:** Automatic via GitHub Actions (no action needed)
4. **Before Deployment:** Ensure production readiness score >8.0/10

### Health Dimensions Tracked

| Dimension | Weight | Current | Target |
|-----------|--------|---------|--------|
| Configuration | 10% | 7.5/10 | 8.5/10 |
| Architecture | 15% | 9.0/10 | 9.0/10 ✅ |
| Test Coverage | 15% | 8.5/10 | 8.5/10 ✅ |
| Documentation | 10% | 8.0/10 | 8.5/10 |
| Features | 15% | 9.5/10 | 9.0/10 ✅ |
| Technical Debt | 20% | 7.0/10 | 8.0/10 |
| Production Readiness | 15% | 9.0/10 | 9.0/10 ✅ |

### Update PROJECT_HEALTH.md When:

- Overall score changes by >0.5 points
- Critical actions are completed
- Major features are deployed
- Quarterly deep audits are performed
- Health check reveals new issues

See [PROJECT_HEALTH.md](../PROJECT_HEALTH.md) for current detailed status.

### Decision Patterns
Reference `.claude/agents/intelligence/*.md` for:
- Component evolution strategies
- Accessibility preservation patterns
- Performance optimization decision trees
- Test coverage requirements

## Project Goals

Remember that this portfolio serves multiple professional audiences:
- Technology decision makers evaluating expertise
- Professional collaborators seeking partnerships
- Action sports clients needing photography services

Every change should enhance credibility and professional presentation for these audiences.