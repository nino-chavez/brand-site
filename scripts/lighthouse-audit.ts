/**
 * Lighthouse Performance Audit Script
 *
 * Runs Lighthouse audits on all layout modes:
 * - Traditional (scrolling layout)
 * - Canvas (2D spatial layout)
 * - Timeline (timeline journey view)
 *
 * Generates performance reports and validates against budgets
 *
 * Usage:
 *   npm run lighthouse:audit
 *   npm run lighthouse:audit -- --mode=traditional
 *   npm run lighthouse:audit -- --ci (strict mode for CI/CD)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface LighthouseResult {
  mode: string;
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    'first-contentful-paint': number;
    'largest-contentful-paint': number;
    'total-blocking-time': number;
    'cumulative-layout-shift': number;
    'speed-index': number;
  };
  timestamp: string;
}

class LighthouseAuditor {
  private resultsDir = path.join(process.cwd(), 'lighthouse-reports');
  private results: LighthouseResult[] = [];

  constructor() {
    // Ensure results directory exists
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  /**
   * Run Lighthouse audit for a specific mode
   */
  async runAudit(mode: 'traditional' | 'canvas' | 'timeline', port: number = 4173): Promise<LighthouseResult> {
    const url = mode === 'traditional'
      ? `http://localhost:${port}/`
      : `http://localhost:${port}/?layout=${mode}`;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Running Lighthouse audit: ${mode.toUpperCase()} mode`);
    console.log(`📍 URL: ${url}`);
    console.log('='.repeat(60));

    const outputPath = path.join(this.resultsDir, `${mode}-${Date.now()}.json`);

    try {
      // Run Lighthouse CLI
      const command = `npx lighthouse ${url} \
        --output=json \
        --output-path="${outputPath}" \
        --only-categories=performance,accessibility,best-practices,seo \
        --chrome-flags="--headless" \
        --quiet`;

      execSync(command, { stdio: 'inherit' });

      // Parse results
      const reportData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      const result: LighthouseResult = {
        mode,
        url,
        scores: {
          performance: Math.round(reportData.categories.performance.score * 100),
          accessibility: Math.round(reportData.categories.accessibility.score * 100),
          bestPractices: Math.round(reportData.categories['best-practices'].score * 100),
          seo: Math.round(reportData.categories.seo.score * 100),
        },
        metrics: {
          'first-contentful-paint': reportData.audits['first-contentful-paint'].numericValue,
          'largest-contentful-paint': reportData.audits['largest-contentful-paint'].numericValue,
          'total-blocking-time': reportData.audits['total-blocking-time'].numericValue,
          'cumulative-layout-shift': reportData.audits['cumulative-layout-shift'].numericValue,
          'speed-index': reportData.audits['speed-index'].numericValue,
        },
        timestamp: new Date().toISOString()
      };

      this.results.push(result);
      this.printResult(result);

      return result;
    } catch (error) {
      console.error(`❌ Lighthouse audit failed for ${mode} mode:`, error);
      throw error;
    }
  }

  /**
   * Print individual result
   */
  private printResult(result: LighthouseResult): void {
    console.log(`\n📊 ${result.mode.toUpperCase()} MODE RESULTS:`);
    console.log('─'.repeat(60));

    // Scores
    console.log('\n🎯 Lighthouse Scores:');
    console.log(`  Performance:      ${this.colorScore(result.scores.performance)}%`);
    console.log(`  Accessibility:    ${this.colorScore(result.scores.accessibility)}%`);
    console.log(`  Best Practices:   ${this.colorScore(result.scores.bestPractices)}%`);
    console.log(`  SEO:              ${this.colorScore(result.scores.seo)}%`);

    // Core Web Vitals
    console.log('\n⚡ Core Web Vitals:');
    console.log(`  FCP:  ${(result.metrics['first-contentful-paint'] / 1000).toFixed(2)}s ${this.getMetricStatus(result.metrics['first-contentful-paint'], 1800)}`);
    console.log(`  LCP:  ${(result.metrics['largest-contentful-paint'] / 1000).toFixed(2)}s ${this.getMetricStatus(result.metrics['largest-contentful-paint'], 2500)}`);
    console.log(`  TBT:  ${result.metrics['total-blocking-time'].toFixed(0)}ms ${this.getMetricStatus(result.metrics['total-blocking-time'], 300)}`);
    console.log(`  CLS:  ${result.metrics['cumulative-layout-shift'].toFixed(3)} ${this.getMetricStatus(result.metrics['cumulative-layout-shift'], 0.1)}`);
    console.log(`  SI:   ${(result.metrics['speed-index'] / 1000).toFixed(2)}s`);
  }

  /**
   * Color code score
   */
  private colorScore(score: number): string {
    if (score >= 90) return `\x1b[32m${score}\x1b[0m`; // Green
    if (score >= 50) return `\x1b[33m${score}\x1b[0m`; // Yellow
    return `\x1b[31m${score}\x1b[0m`; // Red
  }

  /**
   * Get metric status
   */
  private getMetricStatus(value: number, budget: number): string {
    return value <= budget ? '✅' : '❌';
  }

  /**
   * Generate comparison report
   */
  generateReport(): void {
    if (this.results.length === 0) {
      console.log('\n⚠️  No results to report');
      return;
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 LIGHTHOUSE AUDIT SUMMARY');
    console.log('='.repeat(60));

    // Comparison table
    console.log('\n🎯 Performance Scores Comparison:\n');
    console.log('Mode         | Perf | A11y | Best | SEO  | FCP   | LCP   | CLS   ');
    console.log('─'.repeat(70));

    this.results.forEach(result => {
      const fcp = (result.metrics['first-contentful-paint'] / 1000).toFixed(1);
      const lcp = (result.metrics['largest-contentful-paint'] / 1000).toFixed(1);
      const cls = result.metrics['cumulative-layout-shift'].toFixed(3);

      console.log(
        `${result.mode.padEnd(12)} | ${String(result.scores.performance).padStart(4)} | ` +
        `${String(result.scores.accessibility).padStart(4)} | ${String(result.scores.bestPractices).padStart(4)} | ` +
        `${String(result.scores.seo).padStart(4)} | ${fcp}s | ${lcp}s | ${cls}`
      );
    });

    // Budget validation
    console.log('\n⚡ Performance Budget Validation:\n');

    const budgets = {
      performance: 90,
      fcp: 1800,
      lcp: 2500,
      cls: 0.1
    };

    let violations = 0;

    this.results.forEach(result => {
      const issues: string[] = [];

      if (result.scores.performance < budgets.performance) {
        issues.push(`Performance: ${result.scores.performance} < ${budgets.performance}`);
      }
      if (result.metrics['first-contentful-paint'] > budgets.fcp) {
        issues.push(`FCP: ${(result.metrics['first-contentful-paint'] / 1000).toFixed(2)}s > ${budgets.fcp / 1000}s`);
      }
      if (result.metrics['largest-contentful-paint'] > budgets.lcp) {
        issues.push(`LCP: ${(result.metrics['largest-contentful-paint'] / 1000).toFixed(2)}s > ${budgets.lcp / 1000}s`);
      }
      if (result.metrics['cumulative-layout-shift'] > budgets.cls) {
        issues.push(`CLS: ${result.metrics['cumulative-layout-shift'].toFixed(3)} > ${budgets.cls}`);
      }

      if (issues.length > 0) {
        console.log(`❌ ${result.mode.toUpperCase()}:`);
        issues.forEach(issue => console.log(`   - ${issue}`));
        violations += issues.length;
      } else {
        console.log(`✅ ${result.mode.toUpperCase()}: All budgets met`);
      }
    });

    console.log('\n' + '='.repeat(60));

    if (violations > 0) {
      console.log(`\n⚠️  ${violations} budget violation(s) found`);
    } else {
      console.log('\n✅ All performance budgets met across all modes!');
    }

    console.log('='.repeat(60) + '\n');

    // Save summary
    const summaryPath = path.join(this.resultsDir, 'latest-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Full results saved to: ${summaryPath}\n`);
  }

  /**
   * Check if dev server is running
   */
  private async checkServer(port: number = 4173): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${port}/`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const modeArg = args.find(arg => arg.startsWith('--mode='));
  const specificMode = modeArg?.split('=')[1] as 'traditional' | 'canvas' | 'timeline' | undefined;
  const ciMode = args.includes('--ci');
  const port = 4173; // Vite preview port

  console.log('🚀 Lighthouse Performance Audit\n');

  // Check if dev server is running
  const auditor = new LighthouseAuditor();
  const serverRunning = await auditor['checkServer'](port);

  if (!serverRunning) {
    console.error(`❌ Dev server not running on port ${port}`);
    console.log('   Run "npm run dev" in another terminal first\n');
    process.exit(1);
  }

  console.log(`✅ Dev server detected on port ${port}\n`);

  try {
    if (specificMode) {
      // Run single mode
      await auditor.runAudit(specificMode, port);
    } else {
      // Run all modes
      await auditor.runAudit('traditional', port);
      await auditor.runAudit('canvas', port);
      await auditor.runAudit('timeline', port);
    }

    auditor.generateReport();

    if (ciMode) {
      // In CI mode, fail if any budget violations
      const hasViolations = auditor['results'].some(r =>
        r.scores.performance < 90 ||
        r.metrics['first-contentful-paint'] > 1800 ||
        r.metrics['largest-contentful-paint'] > 2500 ||
        r.metrics['cumulative-layout-shift'] > 0.1
      );

      if (hasViolations) {
        console.error('❌ Performance budget violations detected in CI mode');
        process.exit(1);
      }
    }

  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error);
    process.exit(1);
  }
}

main();
