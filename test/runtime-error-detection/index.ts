#!/usr/bin/env node

/**
 * Runtime Error Detection Framework - Main Entry Point
 *
 * Usage:
 *   npm run test:runtime-errors
 *   npm run test:runtime-errors -- --scenario=contextProviders
 *   npm run test:runtime-errors -- --headless=false
 */

import { PlaywrightTestRunner } from './runner/PlaywrightRunner';
import { contextProviderScenarios } from './scenarios/ContextProviderScenarios';
import { nullSafetyScenarios } from './scenarios/NullSafetyScenarios';
import { reactLifecycleScenarios } from './scenarios/ReactLifecycleScenarios';
import { asyncErrorScenarios } from './scenarios/AsyncErrorScenarios';
import { domManipulationScenarios } from './scenarios/DOMManipulationScenarios';
import { typeCoercionScenarios } from './scenarios/TypeCoercionScenarios';
import { browserCompatibilityScenarios } from './scenarios/BrowserCompatibilityScenarios';
import * as fs from 'fs';
import * as path from 'path';

interface CLIOptions {
  scenario?: string;
  headless?: boolean;
  retries?: number;
  screenshot?: boolean;
  video?: boolean;
  ci?: boolean;
  baseUrl?: string;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (value === undefined || value === 'true') {
        (options as any)[key] = true;
      } else if (value === 'false') {
        (options as any)[key] = false;
      } else if (!isNaN(Number(value))) {
        (options as any)[key] = Number(value);
      } else {
        (options as any)[key] = value;
      }
    }
  });

  return options;
}

async function main() {
  console.log('🔍 Runtime Error Detection Framework v1.0.0\n');

  const options = parseArgs();

  // Create test results directory
  const resultsDir = './test-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  if (!fs.existsSync(`${resultsDir}/screenshots`)) {
    fs.mkdirSync(`${resultsDir}/screenshots`, { recursive: true });
  }

  if (options.video && !fs.existsSync(`${resultsDir}/videos`)) {
    fs.mkdirSync(`${resultsDir}/videos`, { recursive: true });
  }

  // Initialize test runner
  const runner = new PlaywrightTestRunner({
    baseUrl: options.baseUrl || 'http://localhost:3000',
    headless: options.ci ? true : (options.headless !== false),
    retryAttempts: options.retries || 2,
    screenshotOnError: options.screenshot !== false,
    videoOnError: options.video || false,
    parallelism: options.ci ? 5 : 3
  });

  // Register scenarios
  console.log('📝 Registering test scenarios...\n');

  const scenarioGroups = [
    { name: 'contextProviders', scenarios: contextProviderScenarios, label: 'Context Provider' },
    { name: 'nullSafety', scenarios: nullSafetyScenarios, label: 'Null Safety' },
    { name: 'reactLifecycle', scenarios: reactLifecycleScenarios, label: 'React Lifecycle' },
    { name: 'asyncErrors', scenarios: asyncErrorScenarios, label: 'Async Errors' },
    { name: 'domManipulation', scenarios: domManipulationScenarios, label: 'DOM Manipulation' },
    { name: 'typeCoercion', scenarios: typeCoercionScenarios, label: 'Type Coercion' },
    { name: 'browserCompat', scenarios: browserCompatibilityScenarios, label: 'Browser Compatibility' }
  ];

  scenarioGroups.forEach(group => {
    if (!options.scenario || options.scenario === group.name || options.scenario === 'all') {
      console.log(`   ✓ ${group.label} Scenarios (${group.scenarios.length} tests)`);
      runner.registerScenarios(group.scenarios);
    }
  });

  console.log('');

  // Run tests
  const results = await runner.run();

  // Generate report
  console.log('\n📄 Generating report...\n');

  const report = {
    timestamp: new Date().toISOString(),
    config: options,
    summary: {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      criticalErrors: results.reduce(
        (sum, r) => sum + r.errors.filter(e => e.severity === 'CRITICAL').length,
        0
      )
    },
    results
  };

  // Save JSON report
  const jsonReportPath = path.join(resultsDir, `report-${Date.now()}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  console.log(`   ✓ JSON report saved: ${jsonReportPath}`);

  // Generate Markdown report
  const mdReport = generateMarkdownReport(report);
  const mdReportPath = path.join(resultsDir, `report-${Date.now()}.md`);
  fs.writeFileSync(mdReportPath, mdReport);
  console.log(`   ✓ Markdown report saved: ${mdReportPath}`);

  // Exit with appropriate code
  const exitCode = report.summary.failed > 0 || report.summary.criticalErrors > 0 ? 1 : 0;

  if (exitCode === 0) {
    console.log('\n✅ All tests passed!\n');
  } else {
    console.log(`\n❌ ${report.summary.failed} test(s) failed with ${report.summary.criticalErrors} critical error(s)\n`);
  }

  process.exit(exitCode);
}

function generateMarkdownReport(report: any): string {
  let md = '# Runtime Error Detection Report\n\n';

  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;

  md += '## Summary\n\n';
  md += `- **Total Scenarios:** ${report.summary.total}\n`;
  md += `- **Passed:** ${report.summary.passed} ✅\n`;
  md += `- **Failed:** ${report.summary.failed} ❌\n`;
  md += `- **Total Errors:** ${report.summary.totalErrors}\n`;
  md += `- **Critical Errors:** ${report.summary.criticalErrors}\n\n`;

  if (report.summary.failed > 0) {
    md += '## Failed Tests\n\n';

    report.results.filter((r: any) => !r.passed).forEach((result: any) => {
      md += `### ❌ ${result.scenario}\n\n`;
      md += `- **Duration:** ${result.duration}ms\n`;
      md += `- **Errors:** ${result.errors.length}\n\n`;

      if (result.errors.length > 0) {
        md += '#### Errors\n\n';
        result.errors.forEach((error: any, index: number) => {
          md += `${index + 1}. **[${error.severity}]** ${error.type}\n`;
          md += `   - Message: \`${error.message}\`\n`;
          if (error.context.component) {
            md += `   - Component: ${error.context.component}\n`;
          }
          if (error.context.location) {
            md += `   - Location: ${error.context.location}\n`;
          }
          md += '\n';
        });
      }

      if (result.screenshots && result.screenshots.length > 0) {
        md += '#### Screenshots\n\n';
        result.screenshots.forEach((screenshot: string) => {
          md += `- \`${screenshot}\`\n`;
        });
        md += '\n';
      }
    });
  }

  if (report.summary.passed > 0) {
    md += '## Passed Tests\n\n';
    report.results.filter((r: any) => r.passed).forEach((result: any) => {
      md += `- ✅ ${result.scenario} (${result.duration}ms)\n`;
    });
    md += '\n';
  }

  md += '---\n\n';
  md += '*Generated by Runtime Error Detection Framework v1.0.0*\n';

  return md;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export {
  PlaywrightTestRunner,
  contextProviderScenarios,
  nullSafetyScenarios,
  reactLifecycleScenarios,
  asyncErrorScenarios,
  domManipulationScenarios,
  typeCoercionScenarios,
  browserCompatibilityScenarios
};
