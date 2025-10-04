/**
 * Performance Budget Enforcement Script
 *
 * Validates performance metrics against defined budgets
 * Integrates with CI/CD pipeline for automated enforcement
 *
 * Usage:
 *   npm run perf:check
 *   npm run perf:check -- --strict (CI mode - fails on violations)
 */

import fs from 'fs';
import path from 'path';

interface Budget {
  metric: string;
  budget: number;
  unit?: string;
  blocking: boolean;
  files?: string[];
}

interface PerformanceBudget {
  budgets: Budget[];
  thresholds: {
    mobile: Record<string, number>;
    desktop: Record<string, number>;
  };
  monitoring: {
    enabled: boolean;
    frequency: string;
    alerting: {
      console: boolean;
      'ci-failure': boolean;
    };
  };
}

interface BudgetViolation {
  metric: string;
  actual: number;
  budget: number;
  unit: string;
  severity: 'blocking' | 'warning';
}

class PerformanceBudgetEnforcer {
  private budgetConfig: PerformanceBudget;
  private violations: BudgetViolation[] = [];

  constructor(configPath: string) {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    this.budgetConfig = JSON.parse(configFile);
  }

  /**
   * Check bundle size budget
   */
  async checkBundleSize(): Promise<void> {
    const bundleBudget = this.budgetConfig.budgets.find(b => b.metric === 'bundle-size');
    if (!bundleBudget) return;

    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      console.warn('⚠️  Dist folder not found - run build first');
      return;
    }

    const jsFiles = this.getFilesRecursive(distPath, '.js');
    const totalSize = jsFiles.reduce((sum, file) => {
      const stats = fs.statSync(file);
      return sum + stats.size;
    }, 0);

    const totalKB = Math.round(totalSize / 1024);
    const budgetKB = bundleBudget.budget;

    if (totalKB > budgetKB) {
      this.violations.push({
        metric: 'bundle-size',
        actual: totalKB,
        budget: budgetKB,
        unit: 'KB',
        severity: bundleBudget.blocking ? 'blocking' : 'warning'
      });
    }

    console.log(`📦 Bundle Size: ${totalKB}KB / ${budgetKB}KB ${totalKB > budgetKB ? '❌' : '✅'}`);
  }

  /**
   * Check image size budget
   */
  async checkImageSize(): Promise<void> {
    const imageBudget = this.budgetConfig.budgets.find(b => b.metric === 'image-size');
    if (!imageBudget) return;

    const imagesPath = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(imagesPath)) {
      console.warn('⚠️  Images folder not found');
      return;
    }

    const imageFiles = this.getFilesRecursive(imagesPath, '.jpg', '.jpeg', '.png', '.webp', '.svg');
    const violations = imageFiles.filter(file => {
      const stats = fs.statSync(file);
      const sizeKB = stats.size / 1024;
      return sizeKB > imageBudget.budget;
    });

    if (violations.length > 0) {
      violations.forEach(file => {
        const stats = fs.statSync(file);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`  ❌ ${path.basename(file)}: ${sizeKB}KB > ${imageBudget.budget}KB`);
      });

      this.violations.push({
        metric: 'image-size',
        actual: violations.length,
        budget: 0,
        unit: 'files',
        severity: imageBudget.blocking ? 'blocking' : 'warning'
      });
    } else {
      console.log(`🖼️  Image Sizes: All within budget ✅`);
    }
  }

  /**
   * Report violations
   */
  report(strictMode: boolean = false): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE BUDGET REPORT');
    console.log('='.repeat(60) + '\n');

    if (this.violations.length === 0) {
      console.log('✅ All performance budgets within limits!\n');
      return;
    }

    const blocking = this.violations.filter(v => v.severity === 'blocking');
    const warnings = this.violations.filter(v => v.severity === 'warning');

    if (blocking.length > 0) {
      console.log('🚨 BLOCKING VIOLATIONS:\n');
      blocking.forEach(v => {
        console.log(`  ❌ ${v.metric}: ${v.actual}${v.unit} (budget: ${v.budget}${v.unit})`);
      });
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      warnings.forEach(v => {
        console.log(`  ⚠️  ${v.metric}: ${v.actual}${v.unit} (budget: ${v.budget}${v.unit})`);
      });
      console.log('');
    }

    console.log('='.repeat(60) + '\n');

    if (strictMode && blocking.length > 0) {
      console.error('❌ Performance budget check failed - blocking violations found');
      process.exit(1);
    }
  }

  /**
   * Get files recursively
   */
  private getFilesRecursive(dir: string, ...extensions: string[]): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursive(fullPath, ...extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

// CLI execution
async function main() {
  const strictMode = process.argv.includes('--strict');
  const configPath = path.join(process.cwd(), '.performance-budget.json');

  if (!fs.existsSync(configPath)) {
    console.error('❌ Performance budget config not found at:', configPath);
    process.exit(1);
  }

  console.log('🔍 Checking performance budgets...\n');

  const enforcer = new PerformanceBudgetEnforcer(configPath);

  await enforcer.checkBundleSize();
  await enforcer.checkImageSize();

  enforcer.report(strictMode);
}

main().catch(error => {
  console.error('❌ Performance budget check failed:', error);
  process.exit(1);
});
