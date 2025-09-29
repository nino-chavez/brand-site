# Deployment Guide - Portable Subagent Framework

Instructions for deploying and distributing the Portable Subagent Framework across different environments and use cases.

## Deployment Patterns

### 1. Project Integration (Copy to Project)
**Best for**: Individual projects, custom configurations, tight integration

```bash
# Copy framework to your project
cp -r portable-subagent-framework ./subagent-framework

# Generate project-specific subagent
cd subagent-framework
node generators/create-subagent.js --interactive

# The generated subagent becomes part of your project
cd ..
git add .
git commit -m "Add project-specific subagent for architecture compliance"
```

**Pros**:
- Full control and customization
- No external dependencies
- Version controlled with project
- Can be customized per project

**Cons**:
- Framework updates require manual copying
- Larger repository size
- Potential for configuration drift

### 2. Standalone Repository
**Best for**: Organization-wide standards, reusable configurations, centralized management

```bash
# Create dedicated subagent repository
git clone portable-subagent-framework acme-corp-subagent
cd acme-corp-subagent

# Customize for organization
node generators/create-subagent.js \
  --organization="ACME Corp" \
  --tech-stack=react-typescript \
  --standards="enterprise,security,accessibility"

# Teams reference this repository
git remote add origin https://github.com/acme-corp/acme-corp-subagent.git
git push -u origin main
```

**Pros**:
- Centralized standards management
- Easy to update and distribute
- Consistent across teams
- Can be versioned and released

**Cons**:
- Requires additional repository
- Teams need to keep subagent updated
- Less project-specific flexibility

### 3. NPM Package Distribution
**Best for**: Organizations with many projects, automated distribution, version management

```bash
# Package the framework
cd portable-subagent-framework
npm version 1.0.0
npm publish @acme-corp/subagent-framework

# Teams install via npm
npm install -D @acme-corp/subagent-framework

# Generate project subagent
npx create-subagent --tech-stack=react-typescript --project-name="MyProject"
```

**Pros**:
- Easy installation and updates
- Version management via npm
- Can include dependencies
- Professional distribution

**Cons**:
- Requires npm registry access
- More complex setup
- Package management overhead

### 4. Docker Image
**Best for**: CI/CD environments, containerized workflows, consistent environments

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY portable-subagent-framework/ ./
RUN npm install
ENTRYPOINT ["node", "generators/create-subagent.js"]
CMD ["--help"]
```

```bash
# Build and distribute
docker build -t acme-corp/subagent-framework:1.0.0 .
docker push acme-corp/subagent-framework:1.0.0

# Teams use in CI/CD
docker run --rm -v $(pwd):/workspace \
  acme-corp/subagent-framework:1.0.0 \
  --tech-stack=python-fastapi --output-dir=/workspace
```

## Organization-Wide Deployment

### 1. Create Organization Template

```bash
# Start with the base framework
cp -r portable-subagent-framework acme-corp-standards

# Customize for organization
cd acme-corp-standards
cat > organization-config.json << EOF
{
  "organization": {
    "name": "ACME Corp",
    "coding_standards": "enterprise",
    "security_level": "high",
    "compliance_requirements": ["SOX", "GDPR", "HIPAA"]
  },
  "mandatory_rules": {
    "security": {
      "no_hardcoded_secrets": true,
      "input_sanitization": true,
      "secure_headers": true
    },
    "performance": {
      "bundle_size_limit_mb": 2,
      "lighthouse_score_min": 90
    },
    "accessibility": {
      "wcag_level": "AA",
      "color_contrast_ratio": 4.5
    }
  },
  "supported_tech_stacks": [
    "react-typescript",
    "python-fastapi", 
    "nodejs-express",
    "java-spring"
  ]
}
EOF
```

### 2. Customize Templates for Organization

```bash
# Add organization branding to templates
node scripts/add-organization-branding.js \
  --name="ACME Corp" \
  --logo="assets/acme-logo.png" \
  --colors="blue,white"

# Add custom rules for compliance
node scripts/add-compliance-rules.js \
  --standards="SOX,GDPR,HIPAA" \
  --security-level="high"
```

### 3. Create Team-Specific Configurations

```bash
# Frontend team configuration
cat > teams/frontend-team.json << EOF
{
  "extends": "../organization-config.json",
  "team": "Frontend Development",
  "tech_stacks": ["react-typescript", "vue-typescript"],
  "additional_rules": {
    "accessibility": {
      "require_alt_text": true,
      "keyboard_navigation": true
    },
    "performance": {
      "bundle_analysis": true,
      "core_web_vitals": true
    }
  }
}
EOF

# Backend team configuration  
cat > teams/backend-team.json << EOF
{
  "extends": "../organization-config.json",
  "team": "Backend Development", 
  "tech_stacks": ["python-fastapi", "nodejs-express"],
  "additional_rules": {
    "security": {
      "sql_injection_prevention": true,
      "rate_limiting": true
    },
    "performance": {
      "database_query_optimization": true,
      "caching_strategies": true
    }
  }
}
EOF
```

### 4. Distribution Methods

#### A. Git Submodule
```bash
# In each project repository
git submodule add https://github.com/acme-corp/acme-corp-standards.git standards
git submodule update --init

# Generate project subagent
cd standards
node generators/create-subagent.js --config=../teams/frontend-team.json
```

#### B. Package Manager
```json
{
  "name": "@acme-corp/coding-standards",
  "version": "1.0.0",
  "description": "ACME Corp coding standards and subagent framework",
  "main": "index.js",
  "bin": {
    "acme-subagent": "./bin/create-subagent.js",
    "acme-validate": "./bin/validate.js"
  },
  "scripts": {
    "postinstall": "node scripts/setup-project.js"
  }
}
```

#### C. Internal Registry
```bash
# Publish to internal npm registry
npm config set registry https://npm.acme-corp.com
npm publish @acme-corp/coding-standards

# Teams install
npm install -D @acme-corp/coding-standards
npx acme-subagent init --team=frontend
```

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/code-standards.yml
name: Code Standards Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Subagent
        uses: acme-corp/setup-subagent-action@v1
        with:
          team-config: 'frontend-team'
          
      - name: Validate Code
        run: |
          acme-subagent validate --path="src/" --format="github-actions"
          
      - name: Generate Report
        if: always()
        run: |
          acme-subagent report --format="html" --output="compliance-report.html"
          
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: compliance-report
          path: compliance-report.html
```

### Jenkins Pipeline
```groovy
pipeline {
  agent any
  
  stages {
    stage('Code Validation') {
      steps {
        script {
          // Install subagent
          sh 'npm install -g @acme-corp/coding-standards'
          
          // Generate project subagent
          sh 'acme-subagent init --team=backend-team --output=.'
          
          // Validate code
          def result = sh(
            script: 'node subagent.cjs validate --path=src/',
            returnStatus: true
          )
          
          if (result != 0) {
            error("Code validation failed")
          }
        }
      }
    }
    
    stage('Compliance Report') {
      steps {
        sh 'node subagent.cjs report --format=junit --output=compliance.xml'
        publishTestResults testResultsPattern: 'compliance.xml'
      }
    }
  }
}
```

### GitLab CI
```yaml
# .gitlab-ci.yml
stages:
  - validate
  - report

code-validation:
  stage: validate
  image: node:18
  before_script:
    - npm install -g @acme-corp/coding-standards
    - acme-subagent init --team=${CI_PROJECT_PATH#*/}
  script:
    - node subagent.cjs validate --path=src/
  artifacts:
    when: always
    reports:
      junit: compliance.xml
    paths:
      - compliance-report.html
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"
```

## Monitoring and Metrics

### Compliance Dashboard
```javascript
// dashboard/compliance-metrics.js
class ComplianceDashboard {
  constructor() {
    this.metrics = new Map();
  }
  
  async collectMetrics() {
    const projects = await this.getProjects();
    
    for (const project of projects) {
      const report = await this.getProjectCompliance(project);
      this.metrics.set(project.name, {
        compliance_score: report.score,
        violations: report.violations,
        last_updated: report.timestamp,
        team: project.team
      });
    }
  }
  
  generateReport() {
    return {
      overall_compliance: this.calculateOverallCompliance(),
      team_breakdown: this.getTeamBreakdown(),
      trending: this.getTrendingMetrics(),
      top_violations: this.getTopViolations()
    };
  }
}
```

### Alerting and Notifications
```javascript
// monitoring/alerts.js
class ComplianceAlerting {
  async checkCompliance() {
    const projects = await this.getMonitoredProjects();
    
    for (const project of projects) {
      const compliance = await this.getComplianceScore(project);
      
      if (compliance.score < project.threshold) {
        await this.sendAlert({
          project: project.name,
          score: compliance.score,
          threshold: project.threshold,
          violations: compliance.top_violations,
          team: project.team
        });
      }
    }
  }
  
  async sendAlert(alert) {
    // Send to Slack, email, or other notification system
    await this.notificationService.send({
      channel: alert.team.slack_channel,
      message: `⚠️ Code compliance below threshold for ${alert.project}`,
      details: alert
    });
  }
}
```

## Maintenance and Updates

### Framework Updates
```bash
# Update organization framework
cd acme-corp-standards
git pull origin main

# Test updates
npm run test

# Update version
npm version patch

# Distribute updates
git tag v1.0.1
git push origin v1.0.1
npm publish
```

### Project Updates
```bash
# Update subagent in project
npm update @acme-corp/coding-standards

# Regenerate project subagent with updates
npx acme-subagent update --preserve-config

# Test with new rules
node subagent.cjs test --verbose
```

### Rollback Strategy
```bash
# Rollback to previous version
npm install @acme-corp/coding-standards@1.0.0

# Regenerate with stable version
npx acme-subagent init --version=1.0.0
```

## Security Considerations

### Secrets Management
```javascript
// Never include secrets in subagent configs
const sanitizedConfig = {
  ...config,
  // Remove sensitive data before distribution
  api_keys: undefined,
  tokens: undefined,
  passwords: undefined
};
```

### Access Control
```bash
# Restrict access to organization templates
git config --global credential.helper store
git config --global user.name "Automated Subagent Updater"

# Use deploy keys for CI/CD access
ssh-keygen -t rsa -b 4096 -C "subagent-ci@acme-corp.com"
```

### Audit Trail
```javascript
// Log subagent usage and violations
const auditLog = {
  timestamp: new Date().toISOString(),
  project: config.project.name,
  team: config.team,
  violations: results.violations,
  user: process.env.USER,
  commit: process.env.CI_COMMIT_SHA
};

await this.logService.record(auditLog);
```

---

**Choose the deployment pattern that best fits your organization's needs and scale. The framework is designed to be flexible and adapt to different organizational structures and requirements.**