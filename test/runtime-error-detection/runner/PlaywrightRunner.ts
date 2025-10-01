/**
 * Playwright-based Autonomous Test Runner
 *
 * Executes automated browser tests to detect runtime errors
 */

import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import type { CapturedError, ErrorType, ErrorSeverity } from '../core/ErrorCapture';

export interface TestScenario {
  name: string;
  description: string;
  category: 'context' | 'null-safety' | 'layout' | 'hooks' | 'integration';
  execute: (page: Page) => Promise<void>;
  expectedErrors?: ErrorType[];
  maxDuration?: number;
}

export interface TestResult {
  scenario: string;
  passed: boolean;
  duration: number;
  errors: CapturedError[];
  screenshots?: string[];
  video?: string;
  logs: string[];
}

export interface RuntimeTestConfig {
  baseUrl: string;
  headless: boolean;
  timeout: number;
  retryAttempts: number;
  screenshotOnError: boolean;
  videoOnError: boolean;
  parallelism: number;
}

export class PlaywrightTestRunner {
  private config: RuntimeTestConfig;
  private browser?: Browser;
  private scenarios: TestScenario[] = [];

  constructor(config: Partial<RuntimeTestConfig> = {}) {
    this.config = {
      baseUrl: 'http://localhost:3000',
      headless: true,
      timeout: 30000,
      retryAttempts: 2,
      screenshotOnError: true,
      videoOnError: false,
      parallelism: 3,
      ...config
    };
  }

  /**
   * Register a test scenario
   */
  public registerScenario(scenario: TestScenario): void {
    this.scenarios.push(scenario);
  }

  /**
   * Register multiple scenarios
   */
  public registerScenarios(scenarios: TestScenario[]): void {
    this.scenarios.push(...scenarios);
  }

  /**
   * Run all registered scenarios
   */
  public async run(): Promise<TestResult[]> {
    console.log(`🚀 Starting runtime error detection with ${this.scenarios.length} scenarios`);

    this.browser = await chromium.launch({
      headless: this.config.headless
    });

    const results: TestResult[] = [];

    // Run scenarios in parallel batches
    for (let i = 0; i < this.scenarios.length; i += this.config.parallelism) {
      const batch = this.scenarios.slice(i, i + this.config.parallelism);
      const batchResults = await Promise.all(
        batch.map(scenario => this.runScenario(scenario))
      );
      results.push(...batchResults);
    }

    await this.browser.close();

    this.printSummary(results);

    return results;
  }

  /**
   * Run a single scenario with retry logic
   */
  private async runScenario(scenario: TestScenario): Promise<TestResult> {
    let lastResult: TestResult | null = null;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      if (attempt > 0) {
        console.log(`  ↻ Retrying ${scenario.name} (attempt ${attempt + 1}/${this.config.retryAttempts + 1})`);
      }

      lastResult = await this.executeScenario(scenario);

      if (lastResult.passed) {
        return lastResult;
      }
    }

    return lastResult!;
  }

  /**
   * Execute a single scenario
   */
  private async executeScenario(scenario: TestScenario): Promise<TestResult> {
    const context = await this.browser!.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: this.config.videoOnError ? {
        dir: './test-results/videos',
        size: { width: 1280, height: 720 }
      } : undefined
    });

    const page = await context.newPage();
    const logs: string[] = [];
    const errors: CapturedError[] = [];
    const screenshots: string[] = [];

    // Inject error capture script
    await page.addInitScript(() => {
      (window as any).__RUNTIME_ERRORS__ = [];

      const originalError = console.error;
      console.error = (...args: any[]) => {
        const message = args.join(' ');
        (window as any).__RUNTIME_ERRORS__.push({
          timestamp: Date.now(),
          message,
          type: 'console.error',
          args
        });
        originalError.apply(console, args);
      };

      window.addEventListener('error', (event) => {
        (window as any).__RUNTIME_ERRORS__.push({
          timestamp: Date.now(),
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'window.error',
          stack: event.error?.stack
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        (window as any).__RUNTIME_ERRORS__.push({
          timestamp: Date.now(),
          message: `Unhandled rejection: ${event.reason}`,
          type: 'unhandledrejection'
        });
      });
    });

    // Capture console messages
    page.on('console', msg => {
      const text = msg.text();
      logs.push(`[${msg.type()}] ${text}`);
    });

    // Capture page errors
    page.on('pageerror', error => {
      logs.push(`[PAGE ERROR] ${error.message}`);
    });

    const startTime = Date.now();

    try {
      console.log(`  ▶ Running: ${scenario.name}`);

      // Navigate to base URL
      await page.goto(this.config.baseUrl, { waitUntil: 'networkidle', timeout: this.config.timeout });

      // Execute the scenario
      await Promise.race([
        scenario.execute(page),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Scenario timeout')), scenario.maxDuration || this.config.timeout)
        )
      ]);

      // Small delay to let errors propagate
      await page.waitForTimeout(1000);

      // Extract captured errors from page
      const runtimeErrors = await page.evaluate(() => {
        return (window as any).__RUNTIME_ERRORS__ || [];
      });

      // Convert to CapturedError format
      for (const err of runtimeErrors) {
        const error: CapturedError = {
          id: `${scenario.name}_${err.timestamp}`,
          timestamp: err.timestamp,
          message: err.message,
          stack: err.stack,
          type: this.classifyError(err.message),
          severity: this.determineSeverity(err.message),
          context: {
            component: this.extractComponent(err.message),
            location: err.filename || err.type
          },
          url: page.url(),
          userAgent: await page.evaluate(() => navigator.userAgent)
        };

        errors.push(error);
      }

      // Check if errors match expected patterns
      const passed = this.validateErrors(errors, scenario.expectedErrors);

      const duration = Date.now() - startTime;

      if (!passed && this.config.screenshotOnError) {
        const screenshotPath = `./test-results/screenshots/${scenario.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        screenshots.push(screenshotPath);
      }

      const result: TestResult = {
        scenario: scenario.name,
        passed,
        duration,
        errors,
        screenshots,
        logs
      };

      if (passed) {
        console.log(`  ✓ ${scenario.name} (${duration}ms)`);
      } else {
        console.log(`  ✗ ${scenario.name} (${duration}ms) - ${errors.length} errors`);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      if (this.config.screenshotOnError) {
        const screenshotPath = `./test-results/screenshots/${scenario.name.replace(/\s+/g, '-')}-error-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        screenshots.push(screenshotPath);
      }

      console.log(`  ✗ ${scenario.name} (${duration}ms) - Test execution failed: ${error}`);

      return {
        scenario: scenario.name,
        passed: false,
        duration,
        errors: [{
          id: `${scenario.name}_execution_error`,
          timestamp: Date.now(),
          message: `Test execution failed: ${error}`,
          type: 'UNKNOWN',
          severity: 'CRITICAL',
          context: {},
          url: page.url(),
          userAgent: await page.evaluate(() => navigator.userAgent).catch(() => 'unknown')
        }],
        screenshots,
        logs
      };
    } finally {
      await context.close();
    }
  }

  private classifyError(message: string): ErrorType {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('must be used within') || lowerMessage.includes('provider')) {
      return 'CONTEXT_MISSING';
    }

    if (lowerMessage.includes('cannot read properties of null') ||
        lowerMessage.includes('cannot read properties of undefined')) {
      return 'NULL_ACCESS';
    }

    if (lowerMessage.includes('is not a function') || lowerMessage.includes('is not a constructor')) {
      return 'TYPE_ERROR';
    }

    return 'UNKNOWN';
  }

  private determineSeverity(message: string): ErrorSeverity {
    if (message.includes('Uncaught') || message.includes('CRITICAL')) {
      return 'CRITICAL';
    }
    if (message.includes('Error:')) {
      return 'HIGH';
    }
    if (message.includes('Warning:')) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private extractComponent(message: string): string | undefined {
    const match = message.match(/in (\w+) component/i) ||
                  message.match(/at (\w+) \(/i) ||
                  message.match(/<(\w+)>/);
    return match?.[1];
  }

  private validateErrors(errors: CapturedError[], expectedErrors?: ErrorType[]): boolean {
    // If no expected errors specified, pass if no critical errors
    if (!expectedErrors) {
      return errors.filter(e => e.severity === 'CRITICAL').length === 0;
    }

    // Check if all expected errors are present
    const errorTypes = errors.map(e => e.type);
    return expectedErrors.every(expected => errorTypes.includes(expected));
  }

  private printSummary(results: TestResult[]): void {
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const criticalErrors = results.reduce(
      (sum, r) => sum + r.errors.filter(e => e.severity === 'CRITICAL').length,
      0
    );

    console.log('\n📊 Test Summary');
    console.log(`   Total scenarios: ${results.length}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total errors: ${totalErrors}`);
    console.log(`   Critical errors: ${criticalErrors}`);
    console.log('');

    if (failed > 0) {
      console.log('❌ Failed scenarios:');
      results.filter(r => !r.passed).forEach(r => {
        console.log(`   - ${r.scenario} (${r.errors.length} errors)`);
        r.errors.forEach(e => {
          console.log(`     • [${e.severity}] ${e.message}`);
        });
      });
    }
  }
}
