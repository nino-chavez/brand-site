# Health Monitoring Agent

## Purpose

Autonomous comprehensive health assessments for the portfolio project, tracking infrastructure health (configuration, architecture, code quality) and application health (features, tests, documentation, technical debt).

## Capabilities

### Core Functions

1. **Weekly Health Reports**
   - Automated assessment across 7 dimensions
   - Trend analysis comparing to previous reports
   - Critical action identification and prioritization
   - Automated issue creation for scores <7.5/10

2. **Quarterly Deep Audits**
   - Comprehensive codebase analysis
   - Architecture pattern validation
   - Technical debt quantification
   - Refactoring opportunity identification

3. **Post-Work Assessments**
   - Health impact analysis after major changes
   - Regression detection (score drops >0.5 points)
   - Quality gate validation
   - Documentation currency check

## Invocation Patterns

### Automatic Triggers

**Weekly (Sundays 00:00 UTC)**
```yaml
# Via GitHub Actions
on:
  schedule:
    - cron: '0 0 * * 0'
```

**After Merge to Main**
```yaml
on:
  push:
    branches: [main]
```

### Manual Invocation

**Natural Language Commands:**
- "Run health check"
- "Assess project health"
- "Check codebase quality"
- "Analyze technical debt"
- "Review production readiness"

**CLI Commands:**
```bash
# Standard health check
npm run health

# Detailed analysis with recommendations
npm run health:verbose

# JSON output for automation
npm run health:json

# Update PROJECT_HEALTH.md dashboard
npm run health:update
```

## Health Dimensions (7)

### 1. Configuration (10% weight)
- TypeScript compilation errors
- Build configuration quality
- Environment setup completeness
- Dependency management

**Target Score:** 8.5/10
**Current Score:** 7.5/10

**Assessment Logic:**
```typescript
score = (
  tsErrorScore * 0.4 +      // TS errors (0 = 10, 100+ = 0)
  configFileScore * 0.3 +   // Config files present
  envSetupScore * 0.3       // .env.example exists
)
```

### 2. Architecture (15% weight)
- Code organization quality
- Component structure
- Service layer separation
- Design pattern consistency

**Target Score:** 9.0/10
**Current Score:** 9.0/10 ✅

**Assessment Logic:**
```typescript
score = (
  organizationScore * 0.4 +  // Directory structure
  separationScore * 0.3 +    // Hooks/contexts separation
  componentScore * 0.3       // Component count/quality
)
```

### 3. Test Coverage (15% weight)
- Unit test count and quality
- E2E test coverage
- Test pass rate
- Coverage percentage

**Target Score:** 8.5/10
**Current Score:** 8.5/10 ✅

**Assessment Logic:**
```typescript
score = (
  testCountScore * 0.4 +     // Number of test files
  e2eScore * 0.3 +           // E2E test count
  passRateScore * 0.3        // Passing vs failing tests
)
```

### 4. Documentation (10% weight)
- Technical documentation count
- API documentation (Storybook)
- README quality
- Onboarding docs

**Target Score:** 8.5/10
**Current Score:** 8.0/10

**Assessment Logic:**
```typescript
score = (
  docCountScore * 0.3 +      // Markdown file count
  readmeScore * 0.2 +        // README size/quality
  claudeScore * 0.2 +        // CLAUDE.md exists
  storyScore * 0.3           // Storybook coverage
)
```

### 5. Features (15% weight)
- Production quality (Lighthouse)
- Feature completeness
- Performance metrics
- Accessibility compliance

**Target Score:** 9.0/10
**Current Score:** 9.5/10 ✅

**Assessment Logic:**
```typescript
score = (
  performanceScore * 0.3 +   // Lighthouse performance
  accessibilityScore * 0.2 + // Lighthouse a11y
  practicesScore * 0.2 +     // Lighthouse best practices
  seoScore * 0.2 +           // Lighthouse SEO
  buildScore * 0.1           // Build size optimization
)
```

### 6. Technical Debt (20% weight) - **Highest Weight**
- Code quality (ESLint)
- TODO/FIXME markers
- Deprecated code
- Code complexity

**Target Score:** 8.0/10
**Current Score:** 7.0/10

**Assessment Logic:**
```typescript
score = (
  markerScore * 0.4 +        // TODO/FIXME count
  eslintScore * 0.5 +        // ESLint errors/warnings
  cleanupScore * 0.1         // Archived components
)
```

### 7. Production Readiness (15% weight)
- CI/CD configuration
- Deployment documentation
- Security measures
- Monitoring setup

**Target Score:** 9.0/10
**Current Score:** 9.0/10 ✅

**Assessment Logic:**
```typescript
score = (
  ciScore * 0.3 +            // GitHub workflows
  docsScore * 0.2 +          // Deployment docs
  securityScore * 0.2 +      // Security policies
  buildScore * 0.3           // Build success
)
```

## Integration with Autonomous Workflow

### Pre-Flight Checks (Before Large Tasks)

```markdown
# Agent should proactively run health check before:
- Starting major refactoring
- Implementing new features
- Significant architectural changes

Example:
User: "Refactor the canvas system to use WebGL"
Agent: "Before starting this refactoring, let me assess current project health..."
[Runs health check]
Agent: "Current health: 8.3/10. All systems green. Proceeding with refactoring..."
```

### Post-Flight Validation (After Work Complete)

```markdown
# Agent should run health check after:
- Completing multi-file changes
- Finishing feature implementation
- Major bug fixes

Example:
User: "Implemented new authentication system"
Agent: "Authentication system implemented. Running health check..."
[Runs health check]
Agent: "Health maintained at 8.3/10. No regressions detected."
```

### Regression Detection

```markdown
# Alert if score drops >0.5 points
if (newScore < previousScore - 0.5) {
  alert("⚠️ Health regression detected!");
  alert(`Score dropped from ${previousScore} to ${newScore}`);
  alert("Recommend reviewing recent changes");
}
```

## Output Examples

### Standard Report

```
══════════════════════════════════════════════════════════════════
                    PROJECT HEALTH REPORT
══════════════════════════════════════════════════════════════════

Overall Health Score: 8.3/10 - EXCELLENT
Timestamp: 2025-10-04T07:45:00.000Z
Status: 🟢 EXCELLENT

──────────────────────────────────────────────────────────────────
DIMENSION SCORES
──────────────────────────────────────────────────────────────────

Configuration             7.5/10 ⬆️
Architecture              9.0/10 ➡️
Test Coverage             8.5/10 ⬆️
Documentation             8.0/10 ⬆️
Features                  9.5/10 ⬆️
Technical Debt            7.0/10 ➡️
Production Readiness      9.0/10 ⬆️

──────────────────────────────────────────────────────────────────
CRITICAL ACTIONS
──────────────────────────────────────────────────────────────────

1. Create .env.example template
2. Fix 3 failing tests
3. Add ESLint configuration for automated quality checks

══════════════════════════════════════════════════════════════════
```

### JSON Report (for automation)

```json
{
  "overall": 8.3,
  "status": "EXCELLENT",
  "timestamp": "2025-10-04T07:45:00.000Z",
  "dimensions": {
    "configuration": {
      "score": 7.5,
      "metrics": {
        "tsErrors": 44,
        "tsFiles": 461,
        "configFiles": 5,
        "hasEnvExample": false,
        "hasEnvLocal": false
      },
      "trend": "up",
      "actions": [
        "Reduce TypeScript errors from 44 to <10",
        "Create .env.example template"
      ]
    },
    ...
  },
  "criticalActions": [
    "Create .env.example template",
    "Fix 3 failing tests",
    "Add ESLint configuration"
  ]
}
```

## Thresholds & Alerts

| Threshold | Score | Action |
|-----------|-------|--------|
| **Critical** | <7.0 | CI fails, block merges |
| **Warning** | <7.5 | Create GitHub issue, alert team |
| **Target** | 8.5 | Standard goal for production projects |
| **Excellent** | >9.0 | Celebrate, use as example |

## Maintenance Schedule

- **Daily:** Automatic health check on merge to main
- **Weekly:** Sunday 00:00 UTC automated assessment + GitHub issue if <7.5
- **Monthly:** Manual deep-dive review of trends
- **Quarterly:** Comprehensive audit with refactoring recommendations

## Related Files

- `PROJECT_HEALTH.md` - Living dashboard (updated manually or via automation)
- `scripts/health-check.ts` - Automation script
- `.github/workflows/health-monitoring.yml` - CI/CD integration
- `.health-reports/` - Historical health reports (gitignored)

## Future Enhancements

1. **Trend Visualization**
   - Generate graphs showing health over time
   - Identify patterns (health drops after large PRs, etc.)

2. **Custom Metrics**
   - Add project-specific health dimensions
   - Photography metaphor consistency checks
   - AI agent coordination quality

3. **Predictive Analysis**
   - Predict health score based on current PR
   - Suggest preventive actions before scores drop

4. **Integration Expansions**
   - Slack/Discord notifications
   - Datadog/Grafana metrics
   - Notion/Confluence dashboard updates

## Usage Guidelines

### For Developers

**Before Starting Work:**
```bash
npm run health
# Review current state before making changes
```

**After Completing Work:**
```bash
npm run health:verbose
# Ensure no regressions introduced
```

### For CI/CD

**In GitHub Actions:**
```yaml
- name: Health Check
  run: npm run health
  continue-on-error: false  # Fail workflow if health <7.0
```

### For AI Agents

**Proactive Assessment:**
```
Before major changes, run: npm run health
After changes, validate: npm run health:verbose
If score drops >0.5: Alert user and recommend review
```

## Success Criteria

✅ **Automated:** Weekly reports run without intervention
✅ **Actionable:** Each score has clear improvement actions
✅ **Integrated:** Part of developer workflow and CI/CD
✅ **Maintained:** PROJECT_HEALTH.md updates after significant work
✅ **Visible:** Health score displayed in README
✅ **Trending:** Tracks changes over time, not just snapshots

---

*This agent enforces quality and maintainability standards through autonomous monitoring and proactive health assessments.*
