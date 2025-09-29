/**
 * AthleticTokenOptimizer Service
 *
 * Extracted athletic design token optimization logic from SpatialSection.
 * Implements standardized design token usage patterns, theme consistency validation,
 * and optimized class name generation for athletic design system.
 *
 * @fileoverview Optimized athletic design token usage with consistency validation
 * @version 1.0.0
 * @since Task 2 - SpatialSection Component Refinement
 */

import type { ContentLevel } from '../types/canvas';

/**
 * Athletic token configuration for sections
 */
interface AthleticTokenConfig {
  baseClasses: string[];
  priorityClasses: Record<number, string>;
  activeClasses: string[];
  inactiveClasses: string[];
  contentLevelClasses: Record<ContentLevel, string[]>;
  stateClasses: {
    focused: string[];
    transitioning: string[];
    loading: string[];
    error: string[];
  };
}

/**
 * Class name cache entry
 */
interface ClassCacheEntry {
  classNames: string;
  timestamp: number;
  config: {
    priority: number;
    isActive: boolean;
    contentLevel: ContentLevel;
    state: string;
    custom: string;
  };
}

/**
 * Token validation result
 */
interface TokenValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Athletic design tokens optimized for performance
 */
const ATHLETIC_TOKENS: AthleticTokenConfig = {
  baseClasses: [
    'spatial-section',
    'absolute',
    'athletic-animate-transition',
    'rounded-lg',
    'overflow-hidden',
    'backdrop-blur-sm',
    'border',
    'border-athletic-neutral-700/20'
  ],

  priorityClasses: {
    1: 'bg-athletic-neutral-900/98 ring-2 ring-athletic-court-orange/60',
    2: 'bg-athletic-neutral-900/95 ring-1 ring-athletic-court-orange/40',
    3: 'bg-athletic-neutral-800/92 ring-1 ring-athletic-neutral-700/40',
    4: 'bg-athletic-neutral-800/90 ring-1 ring-athletic-neutral-700/30',
    5: 'bg-athletic-neutral-800/88 ring-1 ring-athletic-neutral-700/20',
    6: 'bg-athletic-neutral-700/85 ring-1 ring-athletic-neutral-600/20'
  },

  activeClasses: [
    'ring-2',
    'ring-athletic-court-orange/50',
    'bg-athletic-neutral-900/98',
    'shadow-2xl',
    'shadow-athletic-court-orange/10',
    'z-20'
  ],

  inactiveClasses: [
    'ring-1',
    'ring-athletic-neutral-700/30',
    'shadow-lg',
    'shadow-black/20'
  ],

  contentLevelClasses: {
    minimal: [
      'content-level-minimal',
      'pointer-events-none',
      'opacity-60'
    ],
    compact: [
      'content-level-compact',
      'pointer-events-auto',
      'opacity-80'
    ],
    normal: [
      'content-level-normal',
      'pointer-events-auto',
      'opacity-100'
    ],
    detailed: [
      'content-level-detailed',
      'pointer-events-auto',
      'opacity-100',
      'enhanced-visibility'
    ],
    expanded: [
      'content-level-expanded',
      'pointer-events-auto',
      'opacity-100',
      'enhanced-visibility',
      'detailed-mode'
    ]
  },

  stateClasses: {
    focused: [
      'ring-athletic-court-orange',
      'ring-offset-2',
      'ring-offset-athletic-neutral-900'
    ],
    transitioning: [
      'transition-all',
      'duration-160',
      'ease-out'
    ],
    loading: [
      'animate-pulse',
      'bg-athletic-neutral-800/60'
    ],
    error: [
      'ring-red-500/50',
      'bg-red-900/20'
    ]
  }
};

/**
 * Class name patterns for validation
 */
const TOKEN_PATTERNS = {
  athletic: /^athletic-/,
  color: /^(bg|text|border|ring)-athletic-/,
  state: /^(hover|focus|active|disabled):/,
  responsive: /^(sm|md|lg|xl|2xl):/,
  animation: /^(animate|transition)/
};

/**
 * Performance monitoring for token operations
 */
interface TokenPerformanceMetrics {
  classGenerationTime: number;
  cacheHitRate: number;
  totalGenerations: number;
  cacheHits: number;
  validationTime: number;
}

/**
 * AthleticTokenOptimizer - Optimized design token management
 *
 * Responsibilities:
 * - Audit athletic classes memoization for performance impact
 * - Standardize design token usage patterns across components
 * - Implement theme consistency validation and testing
 * - Create design token debugging and validation tools
 */
export class AthleticTokenOptimizer {
  private static instance: AthleticTokenOptimizer;
  private classCache = new Map<string, ClassCacheEntry>();
  private performanceMetrics: TokenPerformanceMetrics = {
    classGenerationTime: 0,
    cacheHitRate: 0,
    totalGenerations: 0,
    cacheHits: 0,
    validationTime: 0
  };
  private debugMode: boolean = false;
  private cacheTTL: number = 10000; // 10 seconds
  private maxCacheSize: number = 200;

  /**
   * Singleton instance getter
   */
  public static getInstance(): AthleticTokenOptimizer {
    if (!AthleticTokenOptimizer.instance) {
      AthleticTokenOptimizer.instance = new AthleticTokenOptimizer();
    }
    return AthleticTokenOptimizer.instance;
  }

  /**
   * Configure the optimizer
   */
  public configure(options: { debugMode?: boolean; cacheTTL?: number; maxCacheSize?: number }): void {
    this.debugMode = options.debugMode ?? this.debugMode;
    this.cacheTTL = options.cacheTTL ?? this.cacheTTL;
    this.maxCacheSize = options.maxCacheSize ?? this.maxCacheSize;
  }

  /**
   * Generate optimized athletic classes with caching
   */
  public generateAthleticClasses(
    priority: number,
    isActive: boolean,
    contentLevel: ContentLevel,
    customClasses: string = '',
    state: 'normal' | 'focused' | 'transitioning' | 'loading' | 'error' = 'normal'
  ): string {
    const startTime = performance.now();

    // Create cache key
    const cacheKey = `${priority}_${isActive}_${contentLevel}_${state}_${customClasses}`;

    // Check cache
    const cached = this.classCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      this.recordCacheHit();
      return cached.classNames;
    }

    // Generate classes
    const classNames = this.buildClassNames(priority, isActive, contentLevel, customClasses, state);

    // Cache result
    this.cacheClassNames(cacheKey, {
      classNames,
      timestamp: Date.now(),
      config: { priority, isActive, contentLevel, state, custom: customClasses }
    });

    // Record performance
    this.recordGeneration(performance.now() - startTime);

    return classNames;
  }

  /**
   * Validate athletic token usage
   */
  public validateTokenUsage(classNames: string): TokenValidationResult {
    const startTime = performance.now();
    const classes = classNames.split(' ').filter(Boolean);

    const result: TokenValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check for deprecated tokens
    const deprecatedTokens = classes.filter(cls =>
      cls.includes('bg-gray') || cls.includes('text-gray') || cls.includes('border-gray')
    );
    if (deprecatedTokens.length > 0) {
      result.warnings.push(`Deprecated tokens found: ${deprecatedTokens.join(', ')}`);
      result.suggestions.push('Use athletic-neutral-* tokens instead of gray-* tokens');
    }

    // Check for inconsistent athletic token usage
    const athleticTokens = classes.filter(cls => TOKEN_PATTERNS.athletic.test(cls));
    const nonAthleticColors = classes.filter(cls =>
      TOKEN_PATTERNS.color.test(cls) && !TOKEN_PATTERNS.athletic.test(cls)
    );

    if (athleticTokens.length > 0 && nonAthleticColors.length > 0) {
      result.warnings.push('Mixed athletic and non-athletic color tokens');
      result.suggestions.push('Use consistent athletic design tokens');
    }

    // Check for performance-impacting classes
    const performanceImpactClasses = classes.filter(cls =>
      cls.includes('backdrop-blur') || cls.includes('shadow-2xl') || cls.includes('animate-')
    );
    if (performanceImpactClasses.length > 3) {
      result.warnings.push('High number of performance-impacting classes');
      result.suggestions.push('Consider reducing visual effects for better performance');
    }

    // Check for redundant classes
    const uniqueClasses = new Set(classes);
    if (uniqueClasses.size !== classes.length) {
      result.errors.push('Duplicate classes found');
      result.valid = false;
    }

    // Record validation time
    this.performanceMetrics.validationTime += performance.now() - startTime;

    return result;
  }

  /**
   * Get standardized token patterns
   */
  public getStandardTokenPatterns(): {
    backgrounds: string[];
    borders: string[];
    text: string[];
    states: string[];
    animations: string[];
  } {
    return {
      backgrounds: [
        'bg-athletic-neutral-900/98',
        'bg-athletic-neutral-900/95',
        'bg-athletic-neutral-800/90',
        'bg-athletic-neutral-700/85'
      ],
      borders: [
        'border-athletic-neutral-700/20',
        'border-athletic-neutral-600/30',
        'ring-athletic-court-orange/50'
      ],
      text: [
        'text-athletic-neutral-100',
        'text-athletic-neutral-400',
        'text-athletic-court-orange'
      ],
      states: [
        'hover:bg-athletic-neutral-800/95',
        'focus:ring-athletic-court-orange',
        'active:bg-athletic-neutral-900'
      ],
      animations: [
        'athletic-animate-transition',
        'transition-all',
        'duration-160',
        'ease-out'
      ]
    };
  }

  /**
   * Optimize existing class strings
   */
  public optimizeClassString(classNames: string): string {
    const classes = classNames.split(' ').filter(Boolean);
    const optimized: string[] = [];
    const seen = new Set<string>();

    // Remove duplicates and optimize order
    const orderedClasses = [
      ...ATHLETIC_TOKENS.baseClasses,
      ...classes.filter(cls => !ATHLETIC_TOKENS.baseClasses.includes(cls))
    ];

    for (const cls of orderedClasses) {
      if (!seen.has(cls)) {
        seen.add(cls);
        optimized.push(cls);
      }
    }

    return optimized.join(' ');
  }

  /**
   * Get theme consistency report
   */
  public getThemeConsistencyReport(classStrings: string[]): {
    athleticTokenUsage: number;
    consistencyScore: number;
    recommendations: string[];
  } {
    const allClasses = classStrings.flatMap(str => str.split(' '));
    const athleticTokenCount = allClasses.filter(cls => TOKEN_PATTERNS.athletic.test(cls)).length;
    const totalColorTokens = allClasses.filter(cls => TOKEN_PATTERNS.color.test(cls)).length;

    const consistencyScore = totalColorTokens > 0 ? athleticTokenCount / totalColorTokens : 1;

    const recommendations: string[] = [];
    if (consistencyScore < 0.8) {
      recommendations.push('Increase usage of athletic design tokens');
    }
    if (consistencyScore < 0.6) {
      recommendations.push('Consider refactoring to use consistent token patterns');
    }

    return {
      athleticTokenUsage: athleticTokenCount,
      consistencyScore,
      recommendations
    };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): TokenPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear caches
   */
  public clearCache(): void {
    this.classCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; hitRate: number; metrics: TokenPerformanceMetrics } {
    return {
      size: this.classCache.size,
      hitRate: this.performanceMetrics.cacheHitRate,
      metrics: this.getPerformanceMetrics()
    };
  }

  /**
   * Build class names from configuration
   */
  private buildClassNames(
    priority: number,
    isActive: boolean,
    contentLevel: ContentLevel,
    customClasses: string,
    state: 'normal' | 'focused' | 'transitioning' | 'loading' | 'error'
  ): string {
    const classes: string[] = [];

    // Base classes
    classes.push(...ATHLETIC_TOKENS.baseClasses);

    // Priority-based styling
    const priorityClass = ATHLETIC_TOKENS.priorityClasses[priority] ||
      ATHLETIC_TOKENS.priorityClasses[6]; // Fallback to lowest priority
    classes.push(priorityClass);

    // Active/inactive state
    if (isActive) {
      classes.push(...ATHLETIC_TOKENS.activeClasses);
    } else {
      classes.push(...ATHLETIC_TOKENS.inactiveClasses);
    }

    // Content level classes
    classes.push(...ATHLETIC_TOKENS.contentLevelClasses[contentLevel]);

    // State classes
    if (state !== 'normal' && ATHLETIC_TOKENS.stateClasses[state]) {
      classes.push(...ATHLETIC_TOKENS.stateClasses[state]);
    }

    // Custom classes
    if (customClasses) {
      classes.push(...customClasses.split(' ').filter(Boolean));
    }

    // Remove duplicates and join
    const uniqueClasses = Array.from(new Set(classes));
    return uniqueClasses.join(' ');
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return (Date.now() - timestamp) < this.cacheTTL;
  }

  /**
   * Cache class names
   */
  private cacheClassNames(key: string, entry: ClassCacheEntry): void {
    // Enforce cache size limit
    if (this.classCache.size >= this.maxCacheSize) {
      const firstKey = this.classCache.keys().next().value;
      if (firstKey) {
        this.classCache.delete(firstKey);
      }
    }

    this.classCache.set(key, entry);
  }

  /**
   * Record cache hit for metrics
   */
  private recordCacheHit(): void {
    this.performanceMetrics.cacheHits++;
    this.performanceMetrics.totalGenerations++;
    this.updateCacheHitRate();
  }

  /**
   * Record generation for metrics
   */
  private recordGeneration(time: number): void {
    this.performanceMetrics.classGenerationTime += time;
    this.performanceMetrics.totalGenerations++;
    this.updateCacheHitRate();
  }

  /**
   * Update cache hit rate
   */
  private updateCacheHitRate(): void {
    this.performanceMetrics.cacheHitRate =
      this.performanceMetrics.cacheHits / this.performanceMetrics.totalGenerations;
  }
}

// Export singleton instance and utilities
export const athleticTokenOptimizer = AthleticTokenOptimizer.getInstance();

/**
 * Hook for React components to use optimized athletic tokens
 */
export const useOptimizedAthleticTokens = (
  priority: number,
  isActive: boolean,
  contentLevel: ContentLevel,
  customClasses: string = ''
) => {
  const optimizer = AthleticTokenOptimizer.getInstance();

  return {
    athleticClasses: optimizer.generateAthleticClasses(priority, isActive, contentLevel, customClasses),
    validateTokens: (classes: string) => optimizer.validateTokenUsage(classes),
    optimizeClasses: (classes: string) => optimizer.optimizeClassString(classes),
    getStandardPatterns: () => optimizer.getStandardTokenPatterns(),
    getPerformanceMetrics: () => optimizer.getPerformanceMetrics()
  };
};

/**
 * Utility function to validate token consistency across components
 */
export const validateTokenConsistency = (componentClassStrings: string[]): TokenValidationResult => {
  const optimizer = AthleticTokenOptimizer.getInstance();
  const aggregatedResult: TokenValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  componentClassStrings.forEach((classString, index) => {
    const result = optimizer.validateTokenUsage(classString);
    if (!result.valid) {
      aggregatedResult.valid = false;
      aggregatedResult.errors.push(`Component ${index}: ${result.errors.join(', ')}`);
    }
    aggregatedResult.warnings.push(...result.warnings.map(w => `Component ${index}: ${w}`));
    aggregatedResult.suggestions.push(...result.suggestions.map(s => `Component ${index}: ${s}`));
  });

  return aggregatedResult;
};

export default AthleticTokenOptimizer;