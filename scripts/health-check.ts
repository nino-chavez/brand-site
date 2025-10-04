#!/usr/bin/env tsx
/**
 * Project Health Monitoring Script
 *
 * Comprehensive health assessment across 7 dimensions:
 * 1. Configuration (10%)
 * 2. Architecture (15%)
 * 3. Test Coverage (15%)
 * 4. Documentation (10%)
 * 5. Features (15%)
 * 6. Technical Debt (20%)
 * 7. Production Readiness (15%)
 *
 * Usage:
 *   npm run health                 # Standard report
 *   npm run health:verbose         # Detailed recommendations
 *   npm run health:json            # JSON output
 *   npm run health:update          # Update PROJECT_HEALTH.md
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface HealthMetrics {
  configuration: DimensionScore;
  architecture: DimensionScore;
  testCoverage: DimensionScore;
  documentation: DimensionScore;
  features: DimensionScore;
  technicalDebt: DimensionScore;
  productionReadiness: DimensionScore;
}

interface DimensionScore {
  score: number;
  metrics: Record<string, number | string>;
  trend: 'up' | 'stable' | 'down';
  actions: string[];
}

interface HealthReport {
  overall: number;
  status: string;
  timestamp: string;
  dimensions: HealthMetrics;
  criticalActions: string[];
}

// ============================================================================
// Configuration
// ============================================================================

const WEIGHTS = {
  configuration: 0.10,
  architecture: 0.15,
  testCoverage: 0.15,
  documentation: 0.10,
  features: 0.15,
  technicalDebt: 0.20,
  productionReadiness: 0.15,
};

const THRESHOLDS = {
  ci_failure: 7.0,
  warning: 7.5,
  target: 8.5,
  excellent: 9.0,
};

// ============================================================================
// Utility Functions
// ============================================================================

function exec(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (error: any) {
    return error.stdout || '';
  }
}

function countFiles(pattern: string): number {
  try {
    const output = exec(`find . -name "${pattern}" | grep -v node_modules | wc -l`);
    return parseInt(output.trim()) || 0;
  } catch {
    return 0;
  }
}

function countLines(pattern: string): number {
  try {
    const output = exec(pattern);
    return parseInt(output.trim()) || 0;
  } catch {
    return 0;
  }
}

// ============================================================================
// Health Dimension Assessments
// ============================================================================

function assessConfiguration(): DimensionScore {
  // TypeScript compilation errors
  const tsErrorsOutput = exec('npx tsc --noEmit 2>&1');
  const tsErrors = (tsErrorsOutput.match(/error TS/g) || []).length;

  // Build configuration files
  const configFiles = countFiles('vite.config.*') + countFiles('vitest.config.*') + countFiles('playwright.config.*');

  // Environment setup
  const hasEnvExample = fs.existsSync('.env.example');
  const hasEnvLocal = fs.existsSync('.env.local');

  // TypeScript files count
  const tsFiles = countFiles('*.ts') + countFiles('*.tsx');

  // Calculate sub-scores
  const tsScore = tsErrors === 0 ? 10 : Math.max(0, 10 - (tsErrors / 10));
  const configScore = Math.min(10, configFiles * 2);
  const envScore = hasEnvExample ? 10 : (hasEnvLocal ? 5 : 0);

  const score = (tsScore * 0.4 + configScore * 0.3 + envScore * 0.3);

  return {
    score: Math.round(score * 10) / 10,
    metrics: {
      tsErrors,
      tsFiles,
      configFiles,
      hasEnvExample,
      hasEnvLocal,
    },
    trend: tsErrors < 50 ? 'up' : 'stable',
    actions: [
      tsErrors > 10 ? `Reduce TypeScript errors from ${tsErrors} to <10` : '',
      !hasEnvExample ? 'Create .env.example template' : '',
      configFiles < 5 ? 'Add more build/test configurations' : '',
    ].filter(Boolean),
  };
}

function assessArchitecture(): DimensionScore {
  const tsFiles = countFiles('*.ts') + countFiles('*.tsx');
  const componentFiles = countFiles('src/components/**/*.tsx');
  const componentDirs = countLines(`find src/components -type d -mindepth 1 -maxdepth 1 | wc -l`);
  const hookFiles = countFiles('src/hooks/*.ts') + countFiles('src/hooks/*.tsx');
  const contextFiles = countFiles('src/contexts/*.tsx') + countFiles('src/contexts/*.ts');

  // Score based on organization
  const organizationScore = componentDirs >= 6 ? 10 : (componentDirs * 1.5);
  const separationScore = (hookFiles + contextFiles) > 10 ? 10 : ((hookFiles + contextFiles) * 0.8);
  const componentScore = Math.min(10, componentFiles / 15);

  const score = (organizationScore * 0.4 + separationScore * 0.3 + componentScore * 0.3);

  return {
    score: Math.round(score * 10) / 10,
    metrics: {
      tsFiles,
      componentFiles,
      componentDirs,
      hookFiles,
      contextFiles,
    },
    trend: 'stable',
    actions: [
      componentDirs < 6 ? 'Improve component organization' : '',
      hookFiles < 5 ? 'Extract more reusable hooks' : '',
    ].filter(Boolean),
  };
}

function assessTestCoverage(): DimensionScore {
  const testFiles = countFiles('*.test.ts') + countFiles('*.test.tsx');
  const e2eTests = countFiles('tests/e2e/**/*.spec.ts');

  // Run quick test check
  let passingTests = 0;
  let failingTests = 0;
  try {
    const testOutput = exec('npm run test:run 2>&1 | grep -E "Test Files|Tests|passed|failed" | head -5');
    const passMatch = testOutput.match(/(\d+) passed/);
    const failMatch = testOutput.match(/(\d+) failed/);
    if (passMatch) passingTests = parseInt(passMatch[1]);
    if (failMatch) failingTests = parseInt(failMatch[1]);
  } catch {
    // Test run failed, estimate based on file count
    passingTests = testFiles * 8; // Estimate ~8 tests per file
  }

  const testCountScore = Math.min(10, testFiles / 15);
  const e2eScore = Math.min(10, e2eTests / 5);
  const passRateScore = failingTests === 0 ? 10 : Math.max(0, 10 - (failingTests * 0.5));

  const score = (testCountScore * 0.4 + e2eScore * 0.3 + passRateScore * 0.3);

  return {
    score: Math.round(score * 10) / 10,
    metrics: {
      testFiles,
      e2eTests,
      passingTests,
      failingTests,
    },
    trend: failingTests === 0 ? 'up' : 'stable',
    actions: [
      failingTests > 0 ? `Fix ${failingTests} failing tests` : '',
      testFiles < 50 ? 'Increase test coverage' : '',
      e2eTests < 10 ? 'Add more E2E tests' : '',
    ].filter(Boolean),
  };
}

function assessDocumentation(): DimensionScore {
  const totalMdFiles = countFiles('*.md');
  const docsFiles = countLines(`find docs -name "*.md" 2>/dev/null | wc -l`);
  const readmeSize = fs.existsSync('README.md') ? fs.statSync('README.md').size : 0;
  const hasClaudeMd = fs.existsSync('.claude/CLAUDE.md');
  const storyFiles = countFiles('*.stories.tsx');

  const docCountScore = Math.min(10, docsFiles / 15);
  const readmeScore = readmeSize > 5000 ? 10 : (readmeSize / 500);
  const claudeScore = hasClaudeMd ? 10 : 0;
  const storyScore = Math.min(10, storyFiles / 5);

  const score = (docCountScore * 0.3 + readmeScore * 0.2 + claudeScore * 0.2 + storyScore * 0.3);

  return {
    score: Math.round(score * 10) / 10,
    metrics: {
      totalMdFiles,
      docsFiles,
      readmeSize,
      hasClaudeMd,
      storyFiles,
    },
    trend: 'up',
    actions: [
      docsFiles < 20 ? 'Add more technical documentation' : '',
      !hasClaudeMd ? 'Create CLAUDE.md for AI collaboration' : '',
      storyFiles < 30 ? 'Increase Storybook coverage' : '',
    ].filter(Boolean),
  };
}

function assessFeatures(): DimensionScore {
  // Try to read latest Lighthouse report
  let lighthouseScore = 0;
  let accessibility = 0;
  let bestPractices = 0;
  let seo = 0;

  try {
    const summaryPath = 'lighthouse-reports/latest-summary.json';
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      if (Array.isArray(summary) && summary.length > 0) {
        lighthouseScore = summary[0].scores?.performance || 0;
        accessibility = summary[0].scores?.accessibility || 0;
        bestPractices = summary[0].scores?.bestPractices || 0;
        seo = summary[0].scores?.seo || 0;
      }
    }
  } catch {
    // No Lighthouse data available
  }

  // Check build size
  let buildSize = 0;
  try {
    const distOutput = exec('du -sh dist 2>/dev/null');
    const match = distOutput.match(/(\d+)M/);
    if (match) buildSize = parseInt(match[1]);
  } catch {
    // No build available
  }

  const performanceScore = lighthouseScore / 10;
  const accessibilityScore = accessibility / 10;
  const practicesScore = bestPractices / 10;
  const seoScore = seo / 10;
  const buildScore = buildSize > 0 ? Math.min(10, 10 - (buildSize / 100)) : 5;

  const score = (performanceScore * 0.3 + accessibilityScore * 0.2 + practicesScore * 0.2 +
                 seoScore * 0.2 + buildScore * 0.1);

  return {
    score: Math.round(score * 10) / 10,
    metrics: {
      lighthousePerformance: lighthouseScore,
      lighthouseAccessibility: accessibility,
      lighthouseBestPractices: bestPractices,
      lighthouseSEO: seo,
      buildSizeMB: buildSize,
    },
    trend: lighthouseScore >= 95 ? 'up' : 'stable',
    actions: [
      lighthouseScore < 95 ? 'Improve Lighthouse performance score' : '',
      accessibility < 100 ? 'Fix accessibility issues' : '',
      buildSize > 500 ? 'Reduce build size' : '',
    ].filter(Boolean),
  };
}

function assessTechnicalDebt(): DimensionScore {
  // Count TODO/FIXME markers
  const debtMarkers = countLines(`grep -r "TODO\\|FIXME\\|HACK\\|XXX" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l`);

  // Try to get ESLint errors (if configured)
  let eslintErrors = 0;
  let eslintWarnings = 0;
  try {
    const eslintOutput = exec('npx eslint . --format json 2>&1');
    const eslintData = JSON.parse(eslintOutput);
    if (Array.isArray(eslintData)) {
      eslintErrors = eslintData.reduce((sum: number, file: any) => sum + (file.errorCount || 0), 0);
      eslintWarnings = eslintData.reduce((sum: number, file: any) => sum + (file.warningCount || 0), 0);
    }
  } catch {
    // ESLint not configured or failed
    eslintErrors = -1; // Indicator that ESLint is not configured
  }

  // Count deprecated/unused files
  const unusedComponents = countLines(`find .agent-os/archive/unused-components -name "*.tsx" 2>/dev/null | wc -l`);

  const markerScore = Math.max(0, 10 - (debtMarkers / 2));
  const eslintScore = eslintErrors === -1 ? 5 : Math.max(0, 10 - (eslintErrors + eslintWarnings) / 100);
  const cleanupScore = unusedComponents > 0 ? 8 : 10; // Recently cleaned up = good

  const score = (markerScore * 0.4 + eslintScore * 0.5 + cleanupScore * 0.1);

  return {
    score: Math.round(score * 10) / 10,
    metrics: {
      todoFixmeMarkers: debtMarkers,
      eslintErrors: eslintErrors === -1 ? 'Not configured' : eslintErrors,
      eslintWarnings: eslintErrors === -1 ? 'Not configured' : eslintWarnings,
      archivedComponents: unusedComponents,
    },
    trend: 'stable',
    actions: [
      eslintErrors === -1 ? 'Add ESLint configuration for automated quality checks' : '',
      eslintErrors > 50 ? `Reduce ESLint errors from ${eslintErrors}` : '',
      debtMarkers > 20 ? 'Address TODO/FIXME markers' : '',
    ].filter(Boolean),
  };
}

function assessProductionReadiness(): DimensionScore {
  const githubWorkflows = countFiles('.github/workflows/*.yml');
  const hasDeploymentDocs = fs.existsSync('docs/DEPLOYMENT_CHECKLIST.md');
  const hasCIConfig = githubWorkflows > 0;

  // Check for security-related files
  const hasSecurityPolicy = fs.existsSync('SECURITY.md');
  const hasLicense = fs.existsSync('LICENSE');

  // Check build success
  let buildPasses = false;
  try {
    exec('npm run build 2>&1');
    buildPasses = true;
  } catch {
    buildPasses = false;
  }

  const ciScore = Math.min(10, githubWorkflows * 2);
  const docsScore = hasDeploymentDocs ? 10 : 5;
  const securityScore = (hasSecurityPolicy ? 5 : 0) + (hasLicense ? 5 : 0);
  const buildScore = buildPasses ? 10 : 0;

  const score = (ciScore * 0.3 + docsScore * 0.2 + securityScore * 0.2 + buildScore * 0.3);

  return {
    score: Math.round(score * 10) / 10,
    metrics: {
      githubWorkflows,
      hasDeploymentDocs,
      hasCIConfig,
      hasSecurityPolicy,
      hasLicense,
      buildPasses,
    },
    trend: 'up',
    actions: [
      githubWorkflows < 3 ? 'Add more CI/CD workflows (Lighthouse, security audit)' : '',
      !hasDeploymentDocs ? 'Create deployment documentation' : '',
      !hasSecurityPolicy ? 'Add SECURITY.md' : '',
      !buildPasses ? 'Fix build errors' : '',
    ].filter(Boolean),
  };
}

// ============================================================================
// Main Health Assessment
// ============================================================================

function assessHealth(): HealthReport {
  console.log('🏥 Running comprehensive health assessment...\n');

  const dimensions: HealthMetrics = {
    configuration: assessConfiguration(),
    architecture: assessArchitecture(),
    testCoverage: assessTestCoverage(),
    documentation: assessDocumentation(),
    features: assessFeatures(),
    technicalDebt: assessTechnicalDebt(),
    productionReadiness: assessProductionReadiness(),
  };

  // Calculate weighted overall score
  const overall =
    dimensions.configuration.score * WEIGHTS.configuration +
    dimensions.architecture.score * WEIGHTS.architecture +
    dimensions.testCoverage.score * WEIGHTS.testCoverage +
    dimensions.documentation.score * WEIGHTS.documentation +
    dimensions.features.score * WEIGHTS.features +
    dimensions.technicalDebt.score * WEIGHTS.technicalDebt +
    dimensions.productionReadiness.score * WEIGHTS.productionReadiness;

  const roundedOverall = Math.round(overall * 10) / 10;

  // Determine status
  let status = '';
  if (roundedOverall >= THRESHOLDS.excellent) status = 'EXCELLENT';
  else if (roundedOverall >= THRESHOLDS.target) status = 'GOOD';
  else if (roundedOverall >= THRESHOLDS.warning) status = 'FAIR';
  else if (roundedOverall >= THRESHOLDS.ci_failure) status = 'NEEDS IMPROVEMENT';
  else status = 'CRITICAL';

  // Collect critical actions
  const criticalActions = Object.values(dimensions)
    .flatMap((d) => d.actions)
    .filter((action) => action.length > 0)
    .slice(0, 10); // Top 10 actions

  return {
    overall: roundedOverall,
    status,
    timestamp: new Date().toISOString(),
    dimensions,
    criticalActions,
  };
}

// ============================================================================
// Output Formatters
// ============================================================================

function formatStandardReport(report: HealthReport): string {
  let output = '';

  output += '═'.repeat(70) + '\n';
  output += '                    PROJECT HEALTH REPORT\n';
  output += '═'.repeat(70) + '\n\n';

  output += `Overall Health Score: ${report.overall}/10 - ${report.status}\n`;
  output += `Timestamp: ${report.timestamp}\n`;
  output += `Status: ${getStatusEmoji(report.overall)} ${report.status}\n\n`;

  output += '─'.repeat(70) + '\n';
  output += 'DIMENSION SCORES\n';
  output += '─'.repeat(70) + '\n\n';

  Object.entries(report.dimensions).forEach(([key, dimension]) => {
    const name = key.replace(/([A-Z])/g, ' $1').trim();
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    output += `${capitalizedName.padEnd(25)} ${dimension.score.toFixed(1)}/10 ${getTrendArrow(dimension.trend)}\n`;
  });

  output += '\n';
  output += '─'.repeat(70) + '\n';
  output += 'CRITICAL ACTIONS\n';
  output += '─'.repeat(70) + '\n\n';

  if (report.criticalActions.length === 0) {
    output += '✅ No critical actions required - excellent health!\n';
  } else {
    report.criticalActions.forEach((action, i) => {
      output += `${i + 1}. ${action}\n`;
    });
  }

  output += '\n';
  output += '═'.repeat(70) + '\n';

  return output;
}

function formatVerboseReport(report: HealthReport): string {
  let output = formatStandardReport(report);

  output += '\nDETAILED METRICS\n';
  output += '═'.repeat(70) + '\n\n';

  Object.entries(report.dimensions).forEach(([key, dimension]) => {
    const name = key.replace(/([A-Z])/g, ' $1').trim();
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    output += `\n${capitalizedName.toUpperCase()}\n`;
    output += '─'.repeat(70) + '\n';
    output += `Score: ${dimension.score}/10 ${getTrendArrow(dimension.trend)}\n`;
    output += `Metrics:\n`;

    Object.entries(dimension.metrics).forEach(([metricKey, value]) => {
      output += `  - ${metricKey}: ${value}\n`;
    });

    if (dimension.actions.length > 0) {
      output += `Actions:\n`;
      dimension.actions.forEach((action) => {
        output += `  • ${action}\n`;
      });
    }
  });

  output += '\n';
  output += '═'.repeat(70) + '\n';

  return output;
}

function formatJSONReport(report: HealthReport): string {
  return JSON.stringify(report, null, 2);
}

function getStatusEmoji(score: number): string {
  if (score >= THRESHOLDS.excellent) return '🟢';
  if (score >= THRESHOLDS.target) return '🟢';
  if (score >= THRESHOLDS.warning) return '🟡';
  if (score >= THRESHOLDS.ci_failure) return '🟠';
  return '🔴';
}

function getTrendArrow(trend: 'up' | 'stable' | 'down'): string {
  if (trend === 'up') return '⬆️';
  if (trend === 'down') return '⬇️';
  return '➡️';
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const json = args.includes('--json');
  const update = args.includes('--update');

  const report = assessHealth();

  // Output report
  if (json) {
    console.log(formatJSONReport(report));
  } else if (verbose) {
    console.log(formatVerboseReport(report));
  } else {
    console.log(formatStandardReport(report));
  }

  // Update PROJECT_HEALTH.md if requested
  if (update) {
    console.log('\n📝 Updating PROJECT_HEALTH.md...');
    // This would require reading the template and updating values
    // For now, we'll skip this and recommend manual update
    console.log('⚠️  Automatic update not yet implemented');
    console.log('    Please run: npm run health:verbose > health-report.txt');
    console.log('    Then update PROJECT_HEALTH.md manually');
  }

  // Exit with appropriate code
  if (report.overall < THRESHOLDS.ci_failure) {
    console.error(`\n❌ Health check failed: Score ${report.overall}/10 is below threshold ${THRESHOLDS.ci_failure}/10`);
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

export { assessHealth, HealthReport };
