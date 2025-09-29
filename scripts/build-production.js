#!/usr/bin/env node

/**
 * Production Build Script for LightboxCanvas System
 *
 * This script orchestrates the complete production build process with
 * optimization, validation, and performance monitoring.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');
const webpack = require('webpack');
const webpackConfig = require('../config/production-build-optimization.config.js');

class ProductionBuildManager {
  constructor() {
    this.buildStartTime = Date.now();
    this.buildMetrics = {
      stages: {},
      assets: {},
      performance: {},
      errors: [],
      warnings: []
    };

    this.setupBuildEnvironment();
  }

  async executeBuild() {
    try {
      console.log(chalk.blue('🚀 Starting LightboxCanvas Production Build\n'));

      // Pre-build validation
      await this.runPreBuildValidation();

      // Clean previous builds
      await this.cleanBuildDirectory();

      // Run TypeScript compilation check
      await this.validateTypeScript();

      // Run webpack build
      await this.runWebpackBuild();

      // Post-build optimization
      await this.runPostBuildOptimization();

      // Generate build report
      await this.generateBuildReport();

      // Validate performance budgets
      await this.validatePerformanceBudgets();

      console.log(chalk.green('✅ Production build completed successfully!'));
      this.printBuildSummary();

    } catch (error) {
      console.error(chalk.red('❌ Build failed:'), error.message);
      process.exit(1);
    }
  }

  setupBuildEnvironment() {
    // Set production environment variables
    process.env.NODE_ENV = 'production';
    process.env.CANVAS_PERFORMANCE_MODE = 'optimized';
    process.env.BUILD_TIMESTAMP = new Date().toISOString();

    // Ensure build directory exists
    const buildDir = path.resolve(__dirname, '../dist');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
  }

  async runPreBuildValidation() {
    const startTime = Date.now();
    console.log(chalk.yellow('🔍 Running pre-build validation...'));

    try {
      // Validate photography metaphor consistency
      await this.validatePhotographyMetaphors();

      // Validate accessibility compliance
      await this.validateAccessibilityCompliance();

      // Check dependencies
      await this.validateDependencies();

      this.buildMetrics.stages.preBuildValidation = Date.now() - startTime;
      console.log(chalk.green('✅ Pre-build validation passed\n'));

    } catch (error) {
      throw new Error(`Pre-build validation failed: ${error.message}`);
    }
  }

  async validatePhotographyMetaphors() {
    console.log('  📸 Validating photography metaphor consistency...');

    try {
      // Run photography terminology validator
      const result = execSync(
        'node scripts/validate-photography-metaphors.js',
        { encoding: 'utf8', stdio: 'pipe' }
      );

      const violations = JSON.parse(result);
      if (violations.critical.length > 0) {
        throw new Error(`Critical photography metaphor violations: ${violations.critical.length}`);
      }

      if (violations.warnings.length > 0) {
        console.log(chalk.yellow(`    ⚠️  ${violations.warnings.length} photography metaphor warnings`));
        this.buildMetrics.warnings.push(...violations.warnings);
      }

    } catch (error) {
      if (error.status !== 0) {
        throw new Error('Photography metaphor validation failed');
      }
    }
  }

  async validateAccessibilityCompliance() {
    console.log('  ♿ Validating accessibility compliance...');

    try {
      const result = execSync(
        'node scripts/validate-accessibility.js',
        { encoding: 'utf8', stdio: 'pipe' }
      );

      const report = JSON.parse(result);
      if (report.violations.length > 0) {
        console.log(chalk.yellow(`    ⚠️  ${report.violations.length} accessibility violations`));
        this.buildMetrics.warnings.push(...report.violations);
      }

    } catch (error) {
      throw new Error('Accessibility validation failed');
    }
  }

  async validateDependencies() {
    console.log('  📦 Checking dependencies...');

    try {
      execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('    ⚠️  Security vulnerabilities detected in dependencies'));
    }

    // Check for outdated critical dependencies
    try {
      const outdated = execSync('npm outdated --json', { encoding: 'utf8', stdio: 'pipe' });
      const outdatedPackages = JSON.parse(outdated || '{}');

      const criticalPackages = ['react', 'typescript', 'webpack'];
      const outdatedCritical = Object.keys(outdatedPackages)
        .filter(pkg => criticalPackages.includes(pkg));

      if (outdatedCritical.length > 0) {
        console.log(chalk.yellow(`    ⚠️  Outdated critical packages: ${outdatedCritical.join(', ')}`));
      }
    } catch (error) {
      // npm outdated exits with code 1 when packages are outdated
    }
  }

  async cleanBuildDirectory() {
    const startTime = Date.now();
    console.log(chalk.yellow('🧹 Cleaning build directory...'));

    const buildDir = path.resolve(__dirname, '../dist');

    try {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
      fs.mkdirSync(buildDir, { recursive: true });

      this.buildMetrics.stages.clean = Date.now() - startTime;
      console.log(chalk.green('✅ Build directory cleaned\n'));

    } catch (error) {
      throw new Error(`Failed to clean build directory: ${error.message}`);
    }
  }

  async validateTypeScript() {
    const startTime = Date.now();
    console.log(chalk.yellow('🔧 Validating TypeScript compilation...'));

    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });

      this.buildMetrics.stages.typeScriptValidation = Date.now() - startTime;
      console.log(chalk.green('✅ TypeScript validation passed\n'));

    } catch (error) {
      throw new Error('TypeScript compilation errors detected');
    }
  }

  async runWebpackBuild() {
    const startTime = Date.now();
    console.log(chalk.yellow('📦 Running webpack build...'));

    return new Promise((resolve, reject) => {
      webpack(webpackConfig, (err, stats) => {
        if (err) {
          reject(new Error(`Webpack build failed: ${err.message}`));
          return;
        }

        if (stats.hasErrors()) {
          const errors = stats.toJson().errors;
          reject(new Error(`Webpack build errors: ${errors.map(e => e.message).join(', ')}`));
          return;
        }

        if (stats.hasWarnings()) {
          const warnings = stats.toJson().warnings;
          console.log(chalk.yellow(`    ⚠️  ${warnings.length} webpack warnings`));
          this.buildMetrics.warnings.push(...warnings.map(w => w.message));
        }

        // Collect build metrics
        const statsJson = stats.toJson();
        this.buildMetrics.assets = this.collectAssetMetrics(statsJson);
        this.buildMetrics.stages.webpackBuild = Date.now() - startTime;

        console.log(chalk.green('✅ Webpack build completed\n'));
        resolve();
      });
    });
  }

  collectAssetMetrics(statsJson) {
    const assets = {};

    statsJson.assets.forEach(asset => {
      assets[asset.name] = {
        size: asset.size,
        emitted: asset.emitted,
        cached: asset.cached
      };
    });

    return assets;
  }

  async runPostBuildOptimization() {
    const startTime = Date.now();
    console.log(chalk.yellow('⚡ Running post-build optimizations...'));

    try {
      // Generate service worker for caching
      await this.generateServiceWorker();

      // Create resource hints
      await this.generateResourceHints();

      // Optimize images
      await this.optimizeImages();

      // Generate integrity hashes
      await this.generateIntegrityHashes();

      this.buildMetrics.stages.postBuildOptimization = Date.now() - startTime;
      console.log(chalk.green('✅ Post-build optimizations completed\n'));

    } catch (error) {
      console.log(chalk.yellow(`⚠️  Post-build optimization warning: ${error.message}`));
    }
  }

  async generateServiceWorker() {
    console.log('  🔧 Generating service worker...');

    const swContent = `
// LightboxCanvas Service Worker - Generated at ${new Date().toISOString()}
const CACHE_NAME = 'lightbox-canvas-v${process.env.BUILD_TIMESTAMP}';
const ASSETS_TO_CACHE = [
  ${Object.keys(this.buildMetrics.assets)
    .filter(asset => asset.endsWith('.js') || asset.endsWith('.css'))
    .map(asset => `  '/${asset}'`)
    .join(',\n')}
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
`;

    fs.writeFileSync(
      path.resolve(__dirname, '../dist/sw.js'),
      swContent
    );
  }

  async generateResourceHints() {
    console.log('  🔗 Generating resource hints...');

    const criticalAssets = Object.keys(this.buildMetrics.assets)
      .filter(asset =>
        asset.includes('lightbox-canvas') ||
        asset.includes('spatial-navigation') ||
        asset.includes('runtime')
      );

    const resourceHints = {
      preload: criticalAssets.map(asset => ({
        href: `/assets/${asset}`,
        as: asset.endsWith('.js') ? 'script' : 'style'
      })),
      prefetch: Object.keys(this.buildMetrics.assets)
        .filter(asset => asset.includes('effects') || asset.includes('accessibility'))
        .map(asset => ({
          href: `/assets/${asset}`,
          as: asset.endsWith('.js') ? 'script' : 'style'
        }))
    };

    fs.writeFileSync(
      path.resolve(__dirname, '../dist/resource-hints.json'),
      JSON.stringify(resourceHints, null, 2)
    );
  }

  async optimizeImages() {
    console.log('  🖼️  Optimizing images...');

    const imageDir = path.resolve(__dirname, '../dist/images');
    if (fs.existsSync(imageDir)) {
      // Additional image optimization could be added here
      // For now, webpack handles image optimization during build
    }
  }

  async generateIntegrityHashes() {
    console.log('  🔐 Generating integrity hashes...');

    const crypto = require('crypto');
    const integrityMap = {};

    Object.keys(this.buildMetrics.assets).forEach(assetName => {
      if (assetName.endsWith('.js') || assetName.endsWith('.css')) {
        const assetPath = path.resolve(__dirname, '../dist', assetName);
        if (fs.existsSync(assetPath)) {
          const content = fs.readFileSync(assetPath);
          const hash = crypto.createHash('sha384').update(content).digest('base64');
          integrityMap[assetName] = `sha384-${hash}`;
        }
      }
    });

    fs.writeFileSync(
      path.resolve(__dirname, '../dist/integrity.json'),
      JSON.stringify(integrityMap, null, 2)
    );
  }

  async validatePerformanceBudgets() {
    console.log(chalk.yellow('📊 Validating performance budgets...'));

    const budgets = webpackConfig.performanceBudget;
    const violations = [];

    // Check individual asset budgets
    Object.entries(budgets.assets).forEach(([assetName, budget]) => {
      const matchingAssets = Object.keys(this.buildMetrics.assets)
        .filter(name => name.includes(assetName));

      matchingAssets.forEach(assetName => {
        const assetSize = this.buildMetrics.assets[assetName].size / 1024; // Convert to KB

        if (assetSize > budget) {
          violations.push({
            type: 'asset-budget',
            asset: assetName,
            size: assetSize,
            budget: budget,
            overage: assetSize - budget
          });
        }
      });
    });

    // Check total JavaScript budget
    const totalJsSize = Object.entries(this.buildMetrics.assets)
      .filter(([name]) => name.endsWith('.js'))
      .reduce((total, [, asset]) => total + asset.size, 0) / 1024;

    if (totalJsSize > budgets.javascript) {
      violations.push({
        type: 'total-js-budget',
        size: totalJsSize,
        budget: budgets.javascript,
        overage: totalJsSize - budgets.javascript
      });
    }

    // Report violations
    if (violations.length > 0) {
      console.log(chalk.red('❌ Performance budget violations:'));
      violations.forEach(violation => {
        console.log(chalk.red(`  ${violation.type}: ${violation.size.toFixed(1)}KB (budget: ${violation.budget}KB, over by: ${violation.overage.toFixed(1)}KB)`));
      });

      if (process.env.STRICT_BUDGETS === 'true') {
        throw new Error('Performance budget violations in strict mode');
      }
    } else {
      console.log(chalk.green('✅ All performance budgets met\n'));
    }

    this.buildMetrics.performance.budgetViolations = violations;
  }

  async generateBuildReport() {
    console.log(chalk.yellow('📋 Generating build report...'));

    const report = {
      timestamp: new Date().toISOString(),
      buildTime: Date.now() - this.buildStartTime,
      stages: this.buildMetrics.stages,
      assets: this.buildMetrics.assets,
      performance: this.buildMetrics.performance,
      warnings: this.buildMetrics.warnings,
      errors: this.buildMetrics.errors,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    fs.writeFileSync(
      path.resolve(__dirname, '../dist/build-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log(chalk.green('✅ Build report generated\n'));
  }

  printBuildSummary() {
    const totalTime = Date.now() - this.buildStartTime;
    const assetCount = Object.keys(this.buildMetrics.assets).length;
    const totalSize = Object.values(this.buildMetrics.assets)
      .reduce((total, asset) => total + asset.size, 0) / 1024; // KB

    console.log(chalk.blue('\n📊 Build Summary:'));
    console.log(`  ⏱️  Total build time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`  📦 Assets generated: ${assetCount}`);
    console.log(`  📏 Total bundle size: ${totalSize.toFixed(1)}KB`);
    console.log(`  ⚠️  Warnings: ${this.buildMetrics.warnings.length}`);
    console.log(`  ❌ Errors: ${this.buildMetrics.errors.length}`);

    if (this.buildMetrics.performance.budgetViolations?.length > 0) {
      console.log(chalk.yellow(`  💰 Budget violations: ${this.buildMetrics.performance.budgetViolations.length}`));
    }

    console.log(chalk.blue('\n🚀 Build artifacts available in ./dist/'));
  }
}

// Execute build if called directly
if (require.main === module) {
  const buildManager = new ProductionBuildManager();
  buildManager.executeBuild().catch(error => {
    console.error(chalk.red('Build failed:'), error);
    process.exit(1);
  });
}

module.exports = ProductionBuildManager;