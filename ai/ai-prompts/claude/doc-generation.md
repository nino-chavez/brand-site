# Claude Code Prompts for Systems & Architecture Documentation

> **Use these prompts with Claude Code in your VSCode terminal to generate comprehensive technical documentation with proper file structure and context awareness.**

## 🎯 Core Strategy: AI-Assisted Technical Documentation

These prompts leverage Claude Code's ability to:
- Analyze your entire codebase for accurate technical details
- Generate documentation files directly in your project structure
- Maintain consistency across multiple documentation files
- Reference actual code patterns and metrics from your implementation

## 🚀 Getting Started with Claude Code

Before using these prompts, ensure:
1. You're in your project's root directory in the terminal
2. Claude Code has access to relevant files (use `@filename` or `@folder` for specific context)
3. You've defined any custom documentation standards in a `docs/TEMPLATE.md` file

## 📈 Prompt Templates for Claude Code

### 1. Technical Architecture Documentation

```bash
Create a comprehensive TECHNICAL-ARCHITECTURE.md file in ./docs/ for this project.

ANALYZE THE CODEBASE:
- Scan the project structure to identify the tech stack and frameworks
- Review the main application files to understand the architecture pattern
- Examine configuration files for deployment and environment setup
- Identify any multi-agent or AI integration patterns in the code

PROJECT CONTEXT TO EXTRACT:
- Primary programming languages and frameworks used
- Core design principles evident in the code structure
- Key architectural patterns (e.g., microservices, event-driven, layered)
- State management approach and data flow patterns

DOCUMENT STRUCTURE:

## System Architecture Overview
[Generate based on actual project structure - include component diagram if possible]

## Core Design Principles
[Extract from code patterns, naming conventions, and architectural decisions]
- Design pattern: [identified from codebase]
- Rationale: [infer from implementation choices]

## Technical Implementation

### Component Architecture
[List actual components/modules with their responsibilities]

### Multi-Agent Coordination (if applicable)
[Document any AI agent patterns, orchestration, or coordination logic found]

### State Management
[Describe the actual state management implementation - Redux, Context API, Vuex, etc.]
- Strategy: [what's actually used]
- Rationale: [why this approach based on code patterns]

### Error Handling & Resilience
[Extract error handling patterns from try-catch blocks, error boundaries, retry logic]

## Data Architecture

### Schema & Validation
[Reference actual schema files - Zod, JSON Schema, TypeScript interfaces, etc.]

### Performance Optimizations
[Identify caching, lazy loading, batch processing from the code]
- Batch processing: [if present, describe implementation]
- Caching strategies: [document actual cache implementations]

## Security Architecture

### Environment Management
[Reference .env files, config management, secrets handling]

### Authentication & Authorization
[Document actual auth implementation - JWT, OAuth, session-based, etc.]

### Audit & Compliance
[Identify logging, audit trails, compliance-related code]

## Performance Metrics

### Benchmarks
[If test files or performance metrics exist, reference them]
- Load times: [extract from tests or profiling data]
- API response times: [from integration tests or monitoring code]
- Resource utilization: [from monitoring or profiling]

### Development Velocity Metrics
[Calculate based on git history and LOC if requested]
- Total lines of code: [actual count]
- AI-assisted code percentage: [estimate if tracking exists]
- Development timeframe: [from git log]

## Deployment & Operations

### Infrastructure
[Extract from Docker files, CI/CD configs, cloud provider configs]

### Scalability Considerations
[Document load balancing, auto-scaling, database replication if present]

## Code Examples

[Include 3-5 snippets of actual code that demonstrate key architectural patterns]

FORMATTING:
- Use proper markdown headers (##, ###)
- Include mermaid diagrams for architecture visualization where helpful
- Add code blocks with proper language syntax highlighting
- Bold key metrics and technical terms
- Keep each section focused and scannable

TARGET: 400-600 lines with technical depth suitable for senior engineers and architects

After generating, ask if I'd like you to:
1. Add more specific code examples
2. Generate accompanying architecture diagrams
3. Create a companion README update
```

### 2. Business Impact Analysis

```bash
Create a BUSINESS-IMPACT-ANALYSIS.md file in ./docs/ that connects technical implementation to measurable business value.

CODEBASE ANALYSIS TASKS:
1. Count total lines of code by language
2. Analyze git history for development timeline and velocity
3. Identify optimization patterns (caching, batching, lazy loading)
4. Review test coverage metrics if available
5. Examine error handling and validation patterns
6. Check for monitoring and observability implementations

EXTRACT AND CALCULATE:

## Executive Summary
[2-3 paragraph overview of technical ROI]

## Development Efficiency Gains

### Time-to-Market
- Total development time: [from git log - first to latest commit]
- Equivalent effort estimate: [calculate based on LOC and complexity]
- Time savings: [comparison to traditional development]

### Code Quality Metrics
- Test coverage: [from coverage reports if available]
- Type safety implementation: [TypeScript usage percentage]
- Error handling coverage: [percentage of functions with error handling]
- Code consistency score: [based on linting rules and patterns]

### Resource Efficiency
- Development team size: [infer from git contributors]
- Lines of code per developer: [calculate from git blame]
- AI-assisted development percentage: [if trackable through comments or commits]

## Technical Quality Impact

### Error Rate Reduction
[Analyze error handling patterns and validation]
- Schema validation coverage: [percentage of data operations with validation]
- Type safety adoption: [strict TypeScript usage]
- Error boundary implementation: [presence of error handling patterns]

### Code Maintainability
- Average function complexity: [calculate cyclomatic complexity if possible]
- Documentation coverage: [percentage of functions with JSDoc/comments]
- Code duplication: [identify repeated patterns]

### System Reliability
[Extract from monitoring code, health checks, retry logic]
- Retry mechanisms: [document implementations]
- Circuit breakers: [if present]
- Fallback strategies: [error recovery patterns]

## Performance Optimizations

### Measured Improvements
[Reference performance test results, profiling data, or benchmarks]
- API call reduction: [if batching/caching implemented]
- Load time improvements: [from performance tests]
- Database query optimization: [N+1 query elimination, indexing]

### Cost Efficiency
[Calculate based on infrastructure code and resource usage]
- Infrastructure costs: [from cloud provider configs]
- Serverless/container optimization: [cost-saving patterns]
- CDN and caching ROI: [bandwidth reduction]

## Strategic Business Value

### Scalability Foundation
[Document architectural decisions that enable scaling]
- Horizontal scaling capabilities: [load balancing, stateless design]
- Database scaling strategy: [sharding, replication, read replicas]
- Microservices readiness: [service boundaries, API design]

### Competitive Advantages
[Identify unique technical capabilities]
- Technical differentiation: [advanced features, AI integration]
- Speed of iteration: [CI/CD pipeline efficiency]
- Innovation capacity: [architectural flexibility]

### Risk Mitigation
[Document reliability and resilience patterns]
- Disaster recovery: [backup strategies, failover]
- Data integrity: [validation, transactions, consistency]
- Security posture: [authentication, authorization, encryption]

## Team & Organizational Impact

### Developer Experience
- Onboarding efficiency: [documentation quality, code clarity]
- Development environment setup: [automation, Docker, scripts]
- Debugging capabilities: [logging, error tracking, observability]

### Knowledge Transfer
- Code self-documentation: [type hints, JSDoc, README files]
- Architectural decision records: [if present]
- Test coverage as documentation: [test quality and clarity]

## ROI Calculation

### Investment
- Development cost: [hours × rate, or team cost × timeline]
- Infrastructure setup: [initial cloud/service costs]
- Tooling and services: [API costs, SaaS subscriptions]

### Returns
- Development efficiency gains: [time saved × developer rate]
- Reduced maintenance burden: [fewer bugs × fix time × rate]
- Performance cost savings: [infrastructure optimization savings]
- Time-to-market value: [revenue impact of faster delivery]

### Net ROI
[Calculate total return vs. investment with timeframe]

FORMATTING:
- Lead with metrics and numbers
- Use tables for comparative data
- Bold all quantified results
- Include percentage improvements prominently
- Add charts/graphs using mermaid if helpful

TARGET: Senior leadership, product owners, and strategic decision-makers
LENGTH: 300-400 lines focused on measurable outcomes

After completion, offer to:
1. Generate comparison charts
2. Create an executive summary slide deck outline
3. Add more detailed cost breakdowns
```

### 3. Production Readiness Review

```bash
Create a PRODUCTION-READINESS-REVIEW.md file in ./docs/ that comprehensively audits operational maturity.

CODEBASE AUDIT CHECKLIST:
Scan the project for and document:

✓ Security patterns (auth, encryption, input validation)
✓ Environment configuration (.env, config files, secrets management)
✓ Deployment configuration (Docker, K8s, CI/CD)
✓ Monitoring and logging (APM, log aggregation, alerting)
✓ Testing infrastructure (unit, integration, e2e, load tests)
✓ Database configuration (migrations, backups, replication)
✓ API documentation (OpenAPI/Swagger, GraphQL schemas)
✓ Error handling and resilience (retries, circuit breakers, fallbacks)
✓ Performance optimization (caching, CDN, lazy loading)
✓ Compliance requirements (GDPR, SOC2, HIPAA if applicable)

DOCUMENT STRUCTURE:

## Production Readiness Score
[Generate a maturity score based on checklist - e.g., "Level 4/5 - Production Ready with Minor Gaps"]

## Security Architecture

### Authentication & Authorization
[Document actual implementation]
- Auth strategy: [JWT, OAuth2, session-based, API keys]
- Authorization model: [RBAC, ABAC, ACL]
- Implementation files: [reference actual auth code locations]

### Data Protection
[Review encryption, sanitization, validation]
- Encryption at rest: [database encryption, file storage]
- Encryption in transit: [HTTPS, TLS configuration]
- Input validation: [Zod, Joi, class-validator usage]
- SQL injection protection: [parameterized queries, ORM usage]
- XSS prevention: [sanitization, CSP headers]

### Environment Security
[Audit environment variable handling]
- Secrets management: [.env files, vaults, cloud secrets]
- API key security: [how keys are stored and rotated]
- Environment separation: [dev/staging/prod boundaries]

### Security Headers & CORS
[Extract from server configuration]
```[language]
[Include actual security header configuration from code]
```

## Deployment Infrastructure

### Current Architecture
[Document from Docker, K8s, cloud provider configs]
- Platform: [AWS, GCP, Azure, Vercel, Railway, etc.]
- Container orchestration: [Docker Compose, Kubernetes, ECS]
- Service architecture: [monolith, microservices, serverless]

### CI/CD Pipeline
[Extract from .github/workflows, .gitlab-ci.yml, etc.]
```yaml
[Include actual CI/CD configuration]
```

- Automated testing stages: [unit, integration, e2e]
- Deployment strategy: [blue-green, canary, rolling]
- Rollback capabilities: [documented process]

### Infrastructure as Code
[Reference Terraform, CloudFormation, Pulumi files]
- IaC tool: [what's actually used]
- Resource definitions: [compute, networking, storage]
- State management: [remote state, locking]

## Monitoring & Observability

### Application Performance Monitoring
[Identify monitoring implementations]
- APM tool: [DataDog, New Relic, Application Insights, custom]
- Metrics collected: [response times, error rates, throughput]
- Dashboards: [reference dashboard configs if present]

### Logging Strategy
[Review logging implementations]
```[language]
[Show actual logging code example]
```
- Log aggregation: [ELK, CloudWatch, Splunk, Loki]
- Log levels: [how they're used - DEBUG, INFO, WARN, ERROR]
- Structured logging: [JSON format, correlation IDs]

### Error Tracking
[Document error monitoring]
- Error tracking service: [Sentry, Rollbar, Bugsnag, custom]
- Error categorization: [how errors are grouped and prioritized]
- Alert configuration: [when and how teams are notified]

### Alerting & On-Call
[Review alerting setup]
- Alert channels: [PagerDuty, Slack, email, SMS]
- Alert thresholds: [document specific triggers]
- Escalation procedures: [if documented]

## Database & Data Management

### Database Configuration
[Extract from database connection and ORM config]
- Database type: [PostgreSQL, MySQL, MongoDB, etc.]
- ORM/Query builder: [Prisma, TypeORM, Sequelize, etc.]
- Connection pooling: [configuration and limits]

### Data Persistence Strategy
```[language]
[Show schema definition or migration example]
```

### Backup & Recovery
[Document backup implementations]
- Backup frequency: [from cron jobs, automated backups]
- Backup retention: [policy if documented]
- Recovery testing: [evidence of tested recovery procedures]
- Point-in-time recovery: [capability and retention]

### Scaling Strategy
[Identify scaling patterns]
- Read replicas: [if configured]
- Sharding strategy: [if applicable]
- Caching layers: [Redis, Memcached usage]

## Performance & Scalability

### Load Testing Results
[Reference load test code and results if available]
- Concurrent users tested: [from load test config]
- Response time percentiles: [p50, p95, p99]
- Breaking points identified: [max throughput, bottlenecks]

### Auto-Scaling Configuration
[Extract from infrastructure code]
- Scaling triggers: [CPU, memory, request rate thresholds]
- Min/max instances: [configured limits]
- Scale-up/down cooldown: [timing configuration]

### Performance Optimizations
[Document implemented optimizations]
- Caching strategy: [Redis, CDN, browser caching]
- Database query optimization: [indexes, query analysis]
- Asset optimization: [compression, minification, lazy loading]
- API optimization: [batching, pagination, GraphQL if used]

## Compliance & Governance

### Audit Trail Implementation
[Review audit logging]
```[language]
[Show audit logging example from code]
```

### Data Privacy Compliance
[Document privacy controls]
- GDPR compliance measures: [data export, deletion, consent]
- Data retention policies: [automated cleanup if implemented]
- Privacy by design: [data minimization, pseudonymization]

### Security Compliance
[Assess compliance readiness]
- SOC 2 readiness: [security controls inventory]
- HIPAA considerations: [if handling health data]
- PCI DSS: [if handling payment data]

## Disaster Recovery

### Business Continuity Plan
[Document recovery procedures]
- RTO (Recovery Time Objective): [target from documentation]
- RPO (Recovery Point Objective): [acceptable data loss window]
- Failover procedures: [documented steps]

### Incident Response
[Review incident management readiness]
- Runbooks: [reference any runbook files]
- Post-mortem process: [if documented]
- Communication protocols: [stakeholder notification]

## Cost Optimization

### Resource Utilization
[Analyze infrastructure efficiency]
- Compute utilization: [from monitoring or auto-scaling configs]
- Storage optimization: [data lifecycle policies, archiving]
- Network costs: [CDN usage, data transfer optimization]

### Cost Monitoring
[Document cost management]
- Budget alerts: [configured thresholds]
- Cost allocation tags: [resource tagging strategy]
- Reserved instances: [if using cloud provider discounts]

## Gaps & Recommendations

### Critical Gaps
[Identify missing production-critical elements]
1. [Gap]: [Impact] - [Recommended action]
2. [Gap]: [Impact] - [Recommended action]

### Nice-to-Have Improvements
[Suggest enhancements]
1. [Improvement]: [Benefit] - [Priority: High/Medium/Low]
2. [Improvement]: [Benefit] - [Priority: High/Medium/Low]

### Roadmap to Production
[If not production-ready, provide sequential steps]
- Phase 1 (Critical): [Immediate requirements]
- Phase 2 (Important): [Near-term improvements]
- Phase 3 (Optimization): [Future enhancements]

## Production Readiness Checklist

- [ ] Security audit complete
- [ ] Load testing validated
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery tested
- [ ] Incident response procedures documented
- [ ] Compliance requirements met
- [ ] Performance benchmarks achieved
- [ ] Documentation complete
- [ ] Team trained on operations
- [ ] Stakeholder sign-off obtained

FORMATTING:
- Use checkboxes for readiness items
- Include actual code examples (5-7 snippets)
- Add mermaid diagrams for architecture flows
- Use tables for comparison data
- Color-code gaps (🔴 critical, 🟡 important, 🟢 optional)

TARGET: DevOps teams, SREs, security teams, and technical leadership
LENGTH: 500-700 lines with comprehensive operational detail

After generation, offer to:
1. Create specific runbook templates
2. Generate monitoring dashboard configs
3. Build deployment checklist
4. Draft incident response procedures
```

### 4. Executive Briefing

```bash
Create an EXECUTIVE-BRIEFING.md file in ./docs/ that presents a comprehensive business case for non-technical stakeholders.

ANALYSIS REQUIREMENTS:
1. Synthesize data from technical architecture, performance metrics, and business impact
2. Calculate ROI based on development cost vs. value delivered
3. Extract strategic insights about the technology approach
4. Identify competitive advantages and market position impact
5. Project future value and scaling potential

DOCUMENT STRUCTURE:

## Executive Summary
[3-4 paragraph overview - problem, solution, results, recommendation]

**Key Results at a Glance:**
- Development Time: [X weeks] (vs. [Y weeks] traditional estimate)
- Cost Efficiency: [X%] reduction in development costs
- Performance: [Key metric improvement]
- ROI: [X]x return on investment over [timeframe]

## Business Problem & Solution

### Challenge
[Describe the business problem addressed]
- Market need: [what customer/business problem exists]
- Technical obstacles: [barriers to traditional solutions]
- Competitive pressure: [market dynamics]

### Solution Approach
[High-level technical strategy in business terms]
- Core innovation: [what makes this approach unique]
- Technology leverage: [AI, cloud, modern frameworks - explained simply]
- Risk mitigation: [how technical choices reduce business risk]

## Technical Highlights (Non-Technical Explanation)

### AI Integration Pattern
[Explain AI usage without jargon]
"The system uses AI to [concrete business outcome], which means [business benefit]."

### Architecture Advantages
[Translate technical benefits]
- Scalability: "Built to handle [X]x growth without major rework"
- Reliability: "[X]% uptime with automatic recovery from failures"
- Security: "Enterprise-grade protection with [key security feature]"

### Innovation Showcase
[Highlight unique technical achievements]
- [Feature]: enables [business capability] that competitors lack
- [Pattern]: reduces [business cost] by [percentage]

## Quantified Business Impact

### Development Velocity
| Metric | This Project | Traditional Approach | Improvement |
|--------|--------------|---------------------|-------------|
| Time to Market | [X weeks] | [Y weeks] | [Z%] faster |
| Development Cost | $[X] | $[Y] | $[Z] saved |
| Team Size | [X] people | [Y] people | [Z%] more efficient |

### Quality & Reliability
- Defect Rate: [X%] (industry average: [Y%])
- Test Coverage: [X%] (target: [Y%])
- System Uptime: [X%] (SLA: [Y%])
- Customer-Impacting Incidents: [X] (down from baseline of [Y])

### Operational Efficiency
- Support Tickets: [X%] reduction
- Deployment Frequency: [X] per [timeframe]
- Mean Time to Recovery: [X] minutes
- Infrastructure Costs: $[X]/month (vs. projected $[Y]/month)

### Customer Impact
[If applicable, include user-facing metrics]
- Page Load Time: [X]s (industry average: [Y]s)
- Conversion Rate: [X%] (up from [Y%])
- User Satisfaction: [X]/10 or [Y]% positive
- Feature Adoption: [X%] of users engaging with [key feature]

## Financial Analysis

### Investment Breakdown
**Development Phase:**
- Engineering: [X] developer-weeks @ $[rate] = $[total]
- AI Tools & Services: $[X] (Claude API, hosting, etc.)
- Infrastructure: $[X] (development environments)
- **Total Investment:** $[X]

**Ongoing Costs:**
- Infrastructure: $[X]/month
- Maintenance: [Y] hours/month @ $[rate] = $[Z]/month
- AI API usage: $[X]/month (based on [Y] requests)
- **Total Monthly:** $[X]

### Value Delivered
**Immediate Value:**
- Time Savings: [X] person-weeks saved = $[Y]
- Market Entry: [X] months earlier = $[Y] revenue opportunity
- Risk Avoided: [X%] reduction in [specific risk] = $[Y] value

**Ongoing Value:**
- Operational Efficiency: $[X]/month saved
- Faster Iterations: [X] additional features/year = $[Y] value
- Reduced Maintenance: $[X]/month saved vs. traditional system

### ROI Calculation
**Year 1:**
- Total Investment: $[X]
- Total Value: $[Y]
- Net ROI: [Z]x or [W%]
- Payback Period: [X] months

**3-Year Projection:**
- Cumulative Investment: $[X]
- Cumulative Value: $[Y]
- Net ROI: [Z]x or [W%]

## Strategic Insights

### Proven Patterns for AI-Assisted Development
[Extract learnings from the development process]
1. **[Pattern Name]**: [What worked] → [Business benefit]
2. **[Pattern Name]**: [What worked] → [Business benefit]
3. **[Pattern Name]**: [What worked] → [Business benefit]

### Risk Mitigation Achieved
[Document how technical approach reduced business risk]
- **Technical Risk**: [How AI/architecture reduced risk of failure]
- **Schedule Risk**: [How approach ensured on-time delivery]
- **Cost Risk**: [How approach prevented budget overruns]
- **Quality Risk**: [How built-in testing/validation ensured quality]

### Competitive Positioning
[Explain market advantage gained]
- **Speed**: [How fast delivery creates advantage]
- **Features**: [Unique capabilities competitors lack]
- **Cost Structure**: [How efficiency enables better pricing/margins]
- **Innovation Capacity**: [How architecture enables faster iteration]

## Scaling Strategy

### Team Structure for Operations
**Current State:**
- [X] developers maintaining the system
- [Y] hours/week maintenance requirement
- [Z] capacity for new features

**Scaling Plan:**
To handle [X]x growth or add [Y] major features:
- Team size: [X] → [Y] people
- Skills required: [specific technical skills needed]
- Timeline: [X] months to scale

### Technology Evolution Path
**Phase 1 (Current)**: [Current capabilities]
**Phase 2 ([Timeframe])**: [Next enhancements]
- Investment: $[X]
- Value: [Business capability unlocked]

**Phase 3 ([Timeframe])**: [Future vision]
- Investment: $[X]
- Value: [Strategic business advantage]

### Market Expansion Opportunities
[How technical foundation enables business growth]
- **New Markets**: [Geography/segments now accessible]
- **New Products**: [What the platform enables building]
- **Partnerships**: [Integration capabilities for ecosystem]

## Recommendations

### Investment Priorities
1. **[Priority]** - $[X] investment for [Y] return
   - Business case: [Why this matters]
   - Timeline: [When to invest]
   - Dependencies: [What's needed first]

2. **[Priority]** - $[X] investment for [Y] return
   - Business case: [Why this matters]
   - Timeline: [When to invest]
   - Dependencies: [What's needed first]

### Governance Framework
[Recommended oversight structure]
- **Technical Oversight**: [Who reviews technical decisions]
- **Quality Gates**: [Key checkpoints for major changes]
- **Budget Authority**: [Spending thresholds and approvals]
- **Risk Management**: [How to monitor and mitigate risks]

### Success Metrics
[KPIs to track ongoing success]
**Technical Health:**
- System uptime > [X]%
- API response time < [X]ms
- Error rate < [X]%

**Business Outcomes:**
- Development velocity: [X] story points/sprint
- Feature delivery: [X] major features/quarter
- Cost efficiency: < $[X]/month operational costs

**Strategic Goals:**
- Market position: [specific goal]
- Customer satisfaction: > [X]%
- Revenue impact: $[X] attributed to platform

## Future Roadmap

### 6-Month Horizon
**Goals**: [Specific objectives]
**Initiatives**:
1. [Initiative] - $[Cost] - [Expected value]
2. [Initiative] - $[Cost] - [Expected value]

### 12-Month Vision
**Goals**: [Strategic objectives]
**Major Projects**:
1. [Project] - $[Cost] - [Expected value]
2. [Project] - $[Cost] - [Expected value]

### Long-Term Strategy (2-3 Years)
**Vision**: [Where this technology takes the business]
**Transformation**: [How it changes competitive position]
**Investment**: $[Total] for [Strategic outcome]

## Appendices

### Technical Glossary
[Define key terms for non-technical audience]
- **[Term]**: [Simple explanation with business context]
- **[Term]**: [Simple explanation with business context]

### Detailed Metrics
[Reference technical documentation for deeper dives]
- Full technical architecture: `./TECHNICAL-ARCHITECTURE.md`
- Detailed impact analysis: `./BUSINESS-IMPACT-ANALYSIS.md`
- Production readiness: `./PRODUCTION-READINESS-REVIEW.md`

FORMATTING:
- Use executive-friendly language (avoid jargon)
- Lead with business outcomes, not technical details
- Use tables and visual data presentation
- Bold all financial figures and key metrics
- Include risk/benefit summaries in callout boxes
- Add mermaid charts for financial projections and timelines

TARGET: C-suite, board members, investors, and strategic decision-makers
LENGTH: 400-600 lines balancing depth with readability

After generation, offer to:
1. Create a PowerPoint outline from this content
2. Generate a 2-page executive summary
3. Build a financial model spreadsheet outline
4. Draft investor pitch deck talking points
```

## 💡 Advanced Claude Code Techniques

### Context-Aware Documentation

```bash
# Reference specific code files for accuracy
Review @src/main.ts @src/api/routes.ts and @config/ folder, then generate TECHNICAL-ARCHITECTURE.md focusing on the API design and configuration management patterns.

# Cross-reference multiple files
Compare @package.json dependencies with actual imports in @src/ to document the tech stack accurately in TECHNICAL-ARCHITECTURE.md.

# Update existing documentation
Read @docs/README.md and @docs/TECHNICAL-ARCHITECTURE.md, then update both files to reflect the new authentication system implemented in @src/auth/.
```

### Iterative Documentation Refinement

```bash
# Step 1: Generate skeleton
Create a skeleton structure for BUSINESS-IMPACT-ANALYSIS.md with section headers and placeholders for metrics I'll provide.

# Step 2: Fill in with analysis
Now analyze @src/ @tests/ and git log to calculate actual metrics for the placeholders in BUSINESS-IMPACT-ANALYSIS.md.

# Step 3: Add depth
Expand the "Development Velocity Gains" section with specific examples from @src/components/ showing productivity improvements.
```

### Multi-File Documentation Workflows

```bash
# Generate full documentation suite
Create a complete documentation set:
1. TECHNICAL-ARCHITECTURE.md from codebase analysis
2. BUSINESS-IMPACT-ANALYSIS.md referencing metrics from #1
3. PRODUCTION-READINESS-REVIEW.md auditing operational maturity
4. EXECUTIVE-BRIEFING.md synthesizing #1-3 for business stakeholders

Create these in sequence, referencing prior documents for consistency.

# Update all documentation after changes
I've just added a new caching layer in @src/cache/. Update TECHNICAL-ARCHITECTURE.md, BUSINESS-IMPACT-ANALYSIS.md (performance section), and PRODUCTION-READINESS-REVIEW.md (performance optimization section) to reflect this addition.
```

### Metric Calculation Requests

```bash
# Automated metric extraction
Calculate and document in BUSINESS-IMPACT-ANALYSIS.md:
1. Total LOC per language (scan @src/)
2. Test coverage percentage (from @tests/ vs @src/)
3. Development timeline (from git log first commit to latest)
4. Number of contributors (from git log)
5. Average commit frequency
6. TypeScript adoption percentage

# Performance analysis
Review @src/ for performance optimizations (caching, memoization, lazy loading, batching) and document quantified improvements in BUSINESS-IMPACT-ANALYSIS.md.
```

### Documentation Validation

```bash
# Verify documentation accuracy
Review TECHNICAL-ARCHITECTURE.md and verify every technical claim against actual code in @src/. Flag any inaccuracies or outdated information.

# Consistency check
Compare TECHNICAL-ARCHITECTURE.md with EXECUTIVE-BRIEFING.md and ensure all technical descriptions have corresponding business-friendly explanations. Flag any inconsistencies.

# Completeness audit
Check if PRODUCTION-READINESS-REVIEW.md covers all critical production concerns by scanning @src/ @tests/ @config/ and deployment files. List any missing sections.
```

## 🎨 Output Format Customization

### Diagram Generation

```bash
# In any documentation prompt, add:
Include mermaid diagrams for:
- System architecture (component diagram)
- Data flow (sequence diagram)
- Deployment pipeline (flowchart)
- Database schema (ER diagram)
```

### Code Example Requirements

```bash
# Add to any prompt:
For each architectural pattern discussed, include:
1. Actual code snippet from the project
2. File path reference
3. Brief explanation of why this pattern was chosen
4. Performance impact (if measurable)
```

### Custom Sections

```bash
# Extend any template with:
Add a "Migration Guide" section to TECHNICAL-ARCHITECTURE.md that explains:
- How to migrate from the old architecture (if applicable)
- Breaking changes introduced
- Step-by-step migration process
- Rollback procedures
```

## 🔍 Troubleshooting Documentation Generation

### Common Issues

**Issue**: Generic descriptions instead of specific code details
```bash
# Solution: Provide explicit file context
Regenerate TECHNICAL-ARCHITECTURE.md but this time scan @src/services/ @src/models/ @src/controllers/ and include specific class names, function names, and design patterns actually used.
```

**Issue**: Missing metrics or placeholder data
```bash
# Solution: Request explicit calculation
Calculate missing metrics for BUSINESS-IMPACT-ANALYSIS.md:
- Run: git log --pretty=format:"%h|%an|%ad|%s" --date=short > git-history.txt
- Analyze commits for development timeline
- Count LOC using: find @src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l
```

**Issue**: Documentation doesn't match current code
```bash
# Solution: Force full rescan
Delete TECHNICAL-ARCHITECTURE.md and regenerate from scratch by scanning entire @src/ directory. Ignore previous versions of this document.
```

## 📚 Best Practices for Claude Code Documentation

### 1. **Start with Code Analysis First**
```bash
# Before generating any documentation:
First, analyze the project structure and identify:
1. All major frameworks and libraries used
2. Architectural patterns present
3. Key technical decisions evident in the code
4. Performance optimizations implemented

Then await my confirmation before generating documentation.
```

### 2. **Maintain Documentation-Code Linkage**
```bash
# Add file references:
In TECHNICAL-ARCHITECTURE.md, for every architectural decision documented, include a "See: @path/to/file.ts" reference so readers can verify the implementation.
```

### 3. **Version-Specific Documentation**
```bash
# Include version context:
Add a "Documentation Version" section noting:
- Git commit hash: [current HEAD]
- Generation date: [timestamp]
- Key dependencies versions: [from package.json]
```

### 4. **Incremental Updates**
```bash
# Instead of full regeneration:
I've updated @src/api/auth.ts to use OAuth2 instead of JWT. Update only the "Authentication" section in TECHNICAL-ARCHITECTURE.md and "Security Architecture" in PRODUCTION-READINESS-REVIEW.md.
```

### 5. **Cross-Reference Network**
```bash
# Build documentation graph:
Ensure all documentation files cross-reference each other:
- TECHNICAL-ARCHITECTURE.md → references PRODUCTION-READINESS-REVIEW.md for ops details
- BUSINESS-IMPACT-ANALYSIS.md → references TECHNICAL-ARCHITECTURE.md for technical context
- EXECUTIVE-BRIEFING.md → synthesizes all three above

Add "Related Documentation" sections to each file.
```

## 🚀 Quick Start Commands

### Complete Documentation Generation
```bash
# Single command for full documentation suite:
claude-code "Analyze this entire project and generate a complete documentation set in ./docs/: TECHNICAL-ARCHITECTURE.md, BUSINESS-IMPACT-ANALYSIS.md, PRODUCTION-READINESS-REVIEW.md, and EXECUTIVE-BRIEFING.md. Use the prompt templates from @docs/CLAUDE-PROMPTS.md and scan all code in @src/, @tests/, and @config/."
```

### Update After Major Changes
```bash
claude-code "I've refactored the database layer in @src/db/. Update all documentation files in @docs/ that reference database architecture, performance, or data management."
```

### Pre-Release Documentation Audit
```bash
claude-code "We're preparing for release. Audit all documentation in @docs/ against current code in @src/ and flag any outdated information, missing sections, or inconsistencies. Then update all flagged issues."
```

---

## 📝 Notes on Using These Prompts

1. **Be Specific**: The more context you give Claude Code, the more accurate your documentation will be
2. **Iterate**: Start with a base document, then refine with follow-up prompts
3. **Verify**: Always review generated metrics and technical claims against actual code
4. **Update Regularly**: Schedule documentation updates with each major release or architectural change
5. **Maintain Templates**: Keep these prompt templates updated as your documentation standards evolve

**Pro Tip**: Save your most-used prompts as shell aliases or VSCode snippets for faster access!