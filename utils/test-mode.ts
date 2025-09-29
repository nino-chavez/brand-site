/**
 * Test Mode Configuration
 *
 * Provides utilities to detect and configure test execution mode
 * to disable problematic components and enable stable test baselines.
 */

/**
 * Detect if we're running in test mode
 * Checks multiple sources: environment variable, user agent, URL parameter
 */
export function isTestMode(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check environment variable
    return process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'test';
  }

  // Client-side checks
  const testMode = (
    // Environment variable (set by Playwright or test runner)
    (window as any).__TEST_MODE__ === true ||
    // URL parameter for manual testing
    new URLSearchParams(window.location.search).get('test') === 'true' ||
    // User agent detection (Playwright sets specific user agents)
    /playwright|headless/i.test(navigator.userAgent) ||
    // Check for test globals that might be set by test runners
    typeof (window as any).__PLAYWRIGHT__ !== 'undefined'
  );

  // Debug logging (remove in production)
  if (testMode && !window.__TEST_MODE_LOGGED__) {
    console.log('🧪 TEST_MODE detected:', {
      __TEST_MODE__: (window as any).__TEST_MODE__,
      userAgent: navigator.userAgent.includes('playwright') || navigator.userAgent.includes('headless'),
      urlParam: new URLSearchParams(window.location.search).get('test'),
      __PLAYWRIGHT__: typeof (window as any).__PLAYWRIGHT__ !== 'undefined'
    });
    (window as any).__TEST_MODE_LOGGED__ = true;
  }

  return testMode;
}

/**
 * Test configuration options
 */
export interface TestConfig {
  // Disable components that cause infinite re-renders
  disablePerformanceMonitoring: boolean;
  disableSectionOrchestration: boolean;
  disableAnalytics: boolean;
  // Simplify complex interactions
  simplifyTransitions: boolean;
  disableDebugInfo: boolean;
  // Reduce timeouts and delays for faster tests
  fasterAnimations: boolean;
}

/**
 * Get test configuration based on current mode
 */
export function getTestConfig(): TestConfig {
  const testMode = isTestMode();

  return {
    disablePerformanceMonitoring: testMode,
    disableSectionOrchestration: testMode,
    disableAnalytics: testMode,
    simplifyTransitions: testMode,
    disableDebugInfo: testMode,
    fasterAnimations: testMode
  };
}

/**
 * Hook to use test configuration in components
 */
export function useTestConfig(): TestConfig {
  return getTestConfig();
}

/**
 * Simple check for components to disable themselves in test mode
 */
export function shouldDisableInTestMode(componentName?: string): boolean {
  const config = getTestConfig();

  switch (componentName) {
    case 'ContentPerformanceMonitor':
      return config.disablePerformanceMonitoring;
    case 'SectionOrchestrator':
      return config.disableSectionOrchestration;
    default:
      return isTestMode();
  }
}