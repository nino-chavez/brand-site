/**
 * Quality Gates Configuration
 *
 * Central configuration for testing quality gates, architecture validation thresholds,
 * and CI/CD integration requirements for the comprehensive testing suite.
 *
 * @fileoverview Quality gates configuration with customizable thresholds and validation rules
 */

// Quality gates configuration interface
export interface QualityGatesConfig {
  coverage: {
    statements: { minimum: number; target: number };
    branches: { minimum: number; target: number };
    functions: { minimum: number; target: number };
    lines: { minimum: number; target: number };
  };
  performance: {
    maxTestDuration: number; // milliseconds
    maxSuiteDuration: number; // milliseconds
    maxTotalDuration: number; // milliseconds
    memoryLeakThreshold: number; // MB
  };
  architecture: {
    maxComplexity: number; // Cyclomatic complexity
    maxCoupling: number; // Component coupling score
    minCohesion: number; // Component cohesion score (0-1)
    maxComponentSize: number; // Lines of code
    maxEffectDependencies: number; // useEffect dependencies
    maxMemoizationDependencies: number; // useMemo/useCallback dependencies
  };
  testing: {
    minTestsPerComponent: number;
    maxFlakinessTolerance: number; // Percentage
    requiredTestTypes: string[];
    criticallComponentCoverage: number; // Minimum coverage for critical components
  };
  security: {
    maxBundleSize: number; // KB (gzipped)
    maxMemoryUsage: number; // MB
    requiredAccessibilityScore: number; // WCAG compliance score
  };
}

// Default quality gates configuration
export const DEFAULT_QUALITY_GATES: QualityGatesConfig = {
  coverage: {
    statements: { minimum: 85, target: 95 },
    branches: { minimum: 80, target: 90 },
    functions: { minimum: 85, target: 95 },
    lines: { minimum: 85, target: 95 }
  },
  performance: {
    maxTestDuration: 5000, // 5 seconds per test
    maxSuiteDuration: 30000, // 30 seconds per suite
    maxTotalDuration: 300000, // 5 minutes total
    memoryLeakThreshold: 10 // 10MB memory leak threshold
  },
  architecture: {
    maxComplexity: 10, // Cyclomatic complexity limit
    maxCoupling: 5, // Maximum component coupling
    minCohesion: 0.8, // Minimum component cohesion
    maxComponentSize: 200, // Maximum lines per component
    maxEffectDependencies: 3, // Maximum useEffect dependencies
    maxMemoizationDependencies: 5 // Maximum memo dependencies
  },
  testing: {
    minTestsPerComponent: 8, // Minimum tests per extracted component
    maxFlakinessTolerance: 2, // 2% flakiness tolerance
    requiredTestTypes: [
      'unit',
      'integration',
      'performance',
      'accessibility',
      'architectural'
    ],
    criticallComponentCoverage: 95 // 95% for critical components
  },
  security: {
    maxBundleSize: 15, // 15KB gzipped per component
    maxMemoryUsage: 50, // 50MB maximum memory usage
    requiredAccessibilityScore: 95 // 95% WCAG compliance
  }
};

// Environment-specific configurations
export const QUALITY_GATES_CONFIGS = {
  development: {
    ...DEFAULT_QUALITY_GATES,
    coverage: {
      statements: { minimum: 75, target: 85 },
      branches: { minimum: 70, target: 80 },
      functions: { minimum: 75, target: 85 },
      lines: { minimum: 75, target: 85 }
    },
    performance: {
      ...DEFAULT_QUALITY_GATES.performance,
      maxTestDuration: 10000 // More lenient in development
    }
  },

  staging: {
    ...DEFAULT_QUALITY_GATES,
    coverage: {
      statements: { minimum: 80, target: 90 },
      branches: { minimum: 75, target: 85 },
      functions: { minimum: 80, target: 90 },
      lines: { minimum: 80, target: 90 }
    }
  },

  production: {
    ...DEFAULT_QUALITY_GATES,
    // Production uses the strictest requirements
    coverage: {
      statements: { minimum: 90, target: 98 },
      branches: { minimum: 85, target: 95 },
      functions: { minimum: 90, target: 98 },
      lines: { minimum: 90, target: 98 }
    },
    testing: {
      ...DEFAULT_QUALITY_GATES.testing,
      minTestsPerComponent: 12, // More tests required for production
      maxFlakinessTolerance: 1 // Stricter flakiness tolerance
    }
  }
};

// Critical component classification
export const CRITICAL_COMPONENTS = [
  'TouchGestureHandler',
  'AnimationController',
  'AccessibilityController',
  'PerformanceRenderer',
  'CanvasStateProvider',
  'ProgressiveContentRenderer',
  'CameraController',
  'LightboxCanvas'
] as const;

export type CriticalComponent = typeof CRITICAL_COMPONENTS[number];

// Quality gates validation rules
export interface ValidationRule {
  name: string;
  category: keyof QualityGatesConfig;
  description: string;
  validate: (metrics: any, config: QualityGatesConfig) => {
    passed: boolean;
    message: string;
    severity: 'error' | 'warning' | 'info';
  };
}

// Built-in validation rules
export const VALIDATION_RULES: ValidationRule[] = [
  {
    name: 'statement-coverage',
    category: 'coverage',
    description: 'Validates statement coverage meets minimum requirements',
    validate: (metrics, config) => {
      const actual = metrics.coverage?.statements || 0;
      const minimum = config.coverage.statements.minimum;

      return {
        passed: actual >= minimum,
        message: `Statement coverage ${actual.toFixed(1)}% ${actual >= minimum ? 'meets' : 'below'} minimum ${minimum}%`,
        severity: actual >= minimum ? 'info' : 'error'
      };
    }
  },

  {
    name: 'branch-coverage',
    category: 'coverage',
    description: 'Validates branch coverage meets minimum requirements',
    validate: (metrics, config) => {
      const actual = metrics.coverage?.branches || 0;
      const minimum = config.coverage.branches.minimum;

      return {
        passed: actual >= minimum,
        message: `Branch coverage ${actual.toFixed(1)}% ${actual >= minimum ? 'meets' : 'below'} minimum ${minimum}%`,
        severity: actual >= minimum ? 'info' : 'error'
      };
    }
  },

  {
    name: 'test-performance',
    category: 'performance',
    description: 'Validates test execution performance',
    validate: (metrics, config) => {
      const actual = metrics.performance?.averageExecutionTime || 0;
      const maximum = config.performance.maxTestDuration;

      return {
        passed: actual <= maximum,
        message: `Average test duration ${actual}ms ${actual <= maximum ? 'within' : 'exceeds'} limit ${maximum}ms`,
        severity: actual <= maximum ? 'info' : 'warning'
      };
    }
  },

  {
    name: 'component-complexity',
    category: 'architecture',
    description: 'Validates component complexity metrics',
    validate: (metrics, config) => {
      const complexityMap = metrics.architecturalValidation?.componentComplexity || new Map();
      const maximum = config.architecture.maxComplexity;

      let violations = 0;
      for (const [component, complexity] of complexityMap) {
        if (complexity > maximum) {
          violations++;
        }
      }

      return {
        passed: violations === 0,
        message: violations === 0
          ? `All components meet complexity limit ${maximum}`
          : `${violations} components exceed complexity limit ${maximum}`,
        severity: violations === 0 ? 'info' : 'error'
      };
    }
  },

  {
    name: 'coupling-metrics',
    category: 'architecture',
    description: 'Validates component coupling metrics',
    validate: (metrics, config) => {
      const couplingMap = metrics.architecturalValidation?.couplingMetrics || new Map();
      const maximum = config.architecture.maxCoupling;

      let violations = 0;
      for (const [component, coupling] of couplingMap) {
        if (coupling > maximum) {
          violations++;
        }
      }

      return {
        passed: violations === 0,
        message: violations === 0
          ? `All components meet coupling limit ${maximum}`
          : `${violations} components exceed coupling limit ${maximum}`,
        severity: violations === 0 ? 'info' : 'warning'
      };
    }
  },

  {
    name: 'cohesion-scores',
    category: 'architecture',
    description: 'Validates component cohesion scores',
    validate: (metrics, config) => {
      const cohesionMap = metrics.architecturalValidation?.cohesionScores || new Map();
      const minimum = config.architecture.minCohesion;

      let violations = 0;
      for (const [component, cohesion] of cohesionMap) {
        if (cohesion < minimum) {
          violations++;
        }
      }

      return {
        passed: violations === 0,
        message: violations === 0
          ? `All components meet cohesion minimum ${minimum}`
          : `${violations} components below cohesion minimum ${minimum}`,
        severity: violations === 0 ? 'info' : 'warning'
      };
    }
  },

  {
    name: 'test-count-per-component',
    category: 'testing',
    description: 'Validates adequate test coverage per component',
    validate: (metrics, config) => {
      const totalTests = metrics.totalTests || 0;
      const componentCount = metrics.architecturalValidation?.componentComplexity?.size || 1;
      const testsPerComponent = totalTests / componentCount;
      const minimum = config.testing.minTestsPerComponent;

      return {
        passed: testsPerComponent >= minimum,
        message: `${testsPerComponent.toFixed(1)} tests per component ${testsPerComponent >= minimum ? 'meets' : 'below'} minimum ${minimum}`,
        severity: testsPerComponent >= minimum ? 'info' : 'warning'
      };
    }
  }
];

// Quality gates environment detection
export function getQualityGatesConfig(environment?: string): QualityGatesConfig {
  const env = environment || process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return QUALITY_GATES_CONFIGS.production;
    case 'staging':
      return QUALITY_GATES_CONFIGS.staging;
    case 'development':
    default:
      return QUALITY_GATES_CONFIGS.development;
  }
}

// Custom configuration override utilities
export function createCustomConfig(
  baseConfig: QualityGatesConfig,
  overrides: Partial<QualityGatesConfig>
): QualityGatesConfig {
  return {
    coverage: { ...baseConfig.coverage, ...overrides.coverage },
    performance: { ...baseConfig.performance, ...overrides.performance },
    architecture: { ...baseConfig.architecture, ...overrides.architecture },
    testing: { ...baseConfig.testing, ...overrides.testing },
    security: { ...baseConfig.security, ...overrides.security }
  };
}

// Configuration validation
export function validateConfig(config: QualityGatesConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate coverage thresholds
  if (config.coverage.statements.minimum > config.coverage.statements.target) {
    errors.push('Statement coverage minimum cannot exceed target');
  }

  if (config.coverage.branches.minimum > config.coverage.branches.target) {
    errors.push('Branch coverage minimum cannot exceed target');
  }

  // Validate performance thresholds
  if (config.performance.maxTestDuration <= 0) {
    errors.push('Maximum test duration must be positive');
  }

  // Validate architecture thresholds
  if (config.architecture.minCohesion < 0 || config.architecture.minCohesion > 1) {
    errors.push('Minimum cohesion must be between 0 and 1');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}