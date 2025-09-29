/**
 * Feature Flag System for Content Optimization
 *
 * Enables gradual rollout and A/B testing of section content optimization features
 * with real-time configuration updates and safe fallback mechanisms.
 *
 * Task 12: Production Readiness and Documentation - Feature Flags
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ============================================================================
// FEATURE FLAG INTERFACES
// ============================================================================

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  dependencies?: string[];
  environment?: 'development' | 'staging' | 'production' | 'all';
  userSegments?: string[];
  startDate?: Date;
  endDate?: Date;
  metadata?: Record<string, any>;
}

export interface FeatureFlagConfig {
  // Core content optimization
  'content-optimization-enabled': FeatureFlag;
  'progressive-disclosure': FeatureFlag;

  // Content adapters
  'about-content-adapter': FeatureFlag;
  'skills-content-adapter': FeatureFlag;
  'experience-content-adapter': FeatureFlag;
  'projects-content-adapter': FeatureFlag;

  // Design system integration
  'athletic-tokens-integration': FeatureFlag;
  'responsive-content-density': FeatureFlag;

  // Analytics and validation
  'user-journey-analytics': FeatureFlag;
  'accessibility-validator': FeatureFlag;
  'feedback-collection': FeatureFlag;
  'performance-monitoring': FeatureFlag;

  // A/B testing
  'ab-test-progressive-disclosure': FeatureFlag;
  'ab-test-content-strategies': FeatureFlag;
  'ab-test-navigation-patterns': FeatureFlag;

  // Advanced features
  'content-level-transitions': FeatureFlag;
  'canvas-state-sync': FeatureFlag;
  'section-orchestration': FeatureFlag;
}

export type FeatureFlagKey = keyof FeatureFlagConfig;

// ============================================================================
// DEFAULT FEATURE FLAG CONFIGURATION
// ============================================================================

export const DEFAULT_FEATURE_FLAGS: FeatureFlagConfig = {
  'content-optimization-enabled': {
    id: 'content-optimization-enabled',
    name: 'Content Optimization System',
    description: 'Master switch for all content optimization features',
    enabled: false,
    rolloutPercentage: 0,
    environment: 'all',
    metadata: { priority: 'critical', category: 'core' }
  },
  'progressive-disclosure': {
    id: 'progressive-disclosure',
    name: 'Progressive Content Disclosure',
    description: 'Enable zoom-based progressive content disclosure',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['content-optimization-enabled'],
    metadata: { priority: 'high', category: 'core' }
  },
  'about-content-adapter': {
    id: 'about-content-adapter',
    name: 'About Section Content Adapter',
    description: 'Progressive disclosure for About section',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['progressive-disclosure'],
    metadata: { section: 'about', priority: 'medium' }
  },
  'skills-content-adapter': {
    id: 'skills-content-adapter',
    name: 'Skills Section Content Adapter',
    description: 'Progressive disclosure for Skills section',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['progressive-disclosure'],
    metadata: { section: 'skills', priority: 'medium' }
  },
  'experience-content-adapter': {
    id: 'experience-content-adapter',
    name: 'Experience Section Content Adapter',
    description: 'Progressive disclosure for Experience section',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['progressive-disclosure'],
    metadata: { section: 'experience', priority: 'medium' }
  },
  'projects-content-adapter': {
    id: 'projects-content-adapter',
    name: 'Projects Section Content Adapter',
    description: 'Progressive disclosure for Projects section',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['progressive-disclosure'],
    metadata: { section: 'projects', priority: 'medium' }
  },
  'athletic-tokens-integration': {
    id: 'athletic-tokens-integration',
    name: 'Athletic Design Token Integration',
    description: 'Consistent visual language using Athletic Design Tokens',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['content-optimization-enabled'],
    metadata: { priority: 'medium', category: 'design' }
  },
  'responsive-content-density': {
    id: 'responsive-content-density',
    name: 'Responsive Content Density',
    description: 'Adaptive content density based on viewport and device',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['athletic-tokens-integration'],
    metadata: { priority: 'low', category: 'design' }
  },
  'user-journey-analytics': {
    id: 'user-journey-analytics',
    name: 'User Journey Analytics',
    description: 'Comprehensive user behavior and engagement tracking',
    enabled: false,
    rolloutPercentage: 0,
    metadata: { priority: 'medium', category: 'analytics' }
  },
  'accessibility-validator': {
    id: 'accessibility-validator',
    name: 'Real-time Accessibility Validation',
    description: 'WCAG 2.1 compliance validation and reporting',
    enabled: false,
    rolloutPercentage: 0,
    metadata: { priority: 'high', category: 'accessibility' }
  },
  'feedback-collection': {
    id: 'feedback-collection',
    name: 'User Feedback Collection',
    description: 'In-app feedback collection for UX optimization',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['user-journey-analytics'],
    metadata: { priority: 'low', category: 'feedback' }
  },
  'performance-monitoring': {
    id: 'performance-monitoring',
    name: 'Advanced Performance Monitoring',
    description: 'Detailed performance metrics and budgets',
    enabled: true, // Always enabled for monitoring
    rolloutPercentage: 100,
    metadata: { priority: 'critical', category: 'monitoring' }
  },
  'ab-test-progressive-disclosure': {
    id: 'ab-test-progressive-disclosure',
    name: 'A/B Test: Progressive Disclosure Strategies',
    description: 'Test different progressive disclosure approaches',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['progressive-disclosure', 'user-journey-analytics'],
    metadata: { priority: 'low', category: 'testing' }
  },
  'ab-test-content-strategies': {
    id: 'ab-test-content-strategies',
    name: 'A/B Test: Content Presentation Strategies',
    description: 'Test different content organization strategies',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['experience-content-adapter', 'projects-content-adapter'],
    metadata: { priority: 'low', category: 'testing' }
  },
  'ab-test-navigation-patterns': {
    id: 'ab-test-navigation-patterns',
    name: 'A/B Test: Navigation Patterns',
    description: 'Test different navigation and interaction patterns',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['content-optimization-enabled'],
    metadata: { priority: 'low', category: 'testing' }
  },
  'content-level-transitions': {
    id: 'content-level-transitions',
    name: 'Smooth Content Level Transitions',
    description: 'Enhanced animations for content level changes',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['progressive-disclosure', 'athletic-tokens-integration'],
    metadata: { priority: 'low', category: 'enhancement' }
  },
  'canvas-state-sync': {
    id: 'canvas-state-sync',
    name: 'Canvas State Synchronization',
    description: 'Advanced canvas and content state coordination',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['progressive-disclosure'],
    metadata: { priority: 'medium', category: 'integration' }
  },
  'section-orchestration': {
    id: 'section-orchestration',
    name: 'Section Content Orchestration',
    description: 'Coordinated content management across sections',
    enabled: false,
    rolloutPercentage: 0,
    dependencies: ['canvas-state-sync'],
    metadata: { priority: 'medium', category: 'integration' }
  }
};

// ============================================================================
// FEATURE FLAG CONTEXT
// ============================================================================

interface FeatureFlagContextValue {
  flags: FeatureFlagConfig;
  isEnabled: (flagKey: FeatureFlagKey, userId?: string) => boolean;
  getFlag: (flagKey: FeatureFlagKey) => FeatureFlag | null;
  updateFlag: (flagKey: FeatureFlagKey, updates: Partial<FeatureFlag>) => void;
  getAllFlags: () => FeatureFlagConfig;
  refreshFlags: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

// ============================================================================
// FEATURE FLAG PROVIDER
// ============================================================================

interface FeatureFlagProviderProps {
  children: React.ReactNode;
  environment?: 'development' | 'staging' | 'production';
  userId?: string;
  refreshInterval?: number;
  onFlagChange?: (flagKey: FeatureFlagKey, enabled: boolean) => void;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
  children,
  environment = process.env.NODE_ENV as any || 'development',
  userId,
  refreshInterval = 60000, // 1 minute
  onFlagChange
}) => {
  const [flags, setFlags] = useState<FeatureFlagConfig>(DEFAULT_FEATURE_FLAGS);

  // ============================================================================
  // USER BUCKETING FOR ROLLOUT PERCENTAGE
  // ============================================================================

  const getUserBucket = useCallback((userId: string, flagId: string): number => {
    // Create deterministic hash from userId and flagId
    const input = `${userId}-${flagId}`;
    let hash = 0;

    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to percentage (0-100)
    return Math.abs(hash) % 100;
  }, []);

  // ============================================================================
  // DEPENDENCY CHECKING
  // ============================================================================

  const checkDependencies = useCallback((flag: FeatureFlag): boolean => {
    if (!flag.dependencies) return true;

    return flag.dependencies.every(depId => {
      const dependency = flags[depId as FeatureFlagKey];
      return dependency && dependency.enabled;
    });
  }, [flags]);

  // ============================================================================
  // FEATURE FLAG EVALUATION
  // ============================================================================

  const isEnabled = useCallback((flagKey: FeatureFlagKey, userIdOverride?: string): boolean => {
    const flag = flags[flagKey];
    if (!flag) return false;

    // Environment check
    if (flag.environment && flag.environment !== 'all' && flag.environment !== environment) {
      return false;
    }

    // Date range check
    const now = new Date();
    if (flag.startDate && now < flag.startDate) return false;
    if (flag.endDate && now > flag.endDate) return false;

    // Dependency check
    if (!checkDependencies(flag)) return false;

    // Base enabled check
    if (!flag.enabled) return false;

    // Rollout percentage check
    if (flag.rolloutPercentage >= 100) return true;
    if (flag.rolloutPercentage <= 0) return false;

    // User bucketing for gradual rollout
    const effectiveUserId = userIdOverride || userId || 'anonymous';
    const userBucket = getUserBucket(effectiveUserId, flag.id);

    return userBucket < flag.rolloutPercentage;
  }, [flags, environment, userId, getUserBucket, checkDependencies]);

  const getFlag = useCallback((flagKey: FeatureFlagKey): FeatureFlag | null => {
    return flags[flagKey] || null;
  }, [flags]);

  // ============================================================================
  // FLAG MANAGEMENT
  // ============================================================================

  const updateFlag = useCallback((flagKey: FeatureFlagKey, updates: Partial<FeatureFlag>) => {
    setFlags(prev => ({
      ...prev,
      [flagKey]: {
        ...prev[flagKey],
        ...updates
      }
    }));

    // Notify listeners of flag changes
    const updatedFlag = { ...flags[flagKey], ...updates };
    onFlagChange?.(flagKey, updatedFlag.enabled);
  }, [flags, onFlagChange]);

  const getAllFlags = useCallback(() => flags, [flags]);

  // ============================================================================
  // REMOTE FLAG FETCHING
  // ============================================================================

  const refreshFlags = useCallback(async () => {
    try {
      // In production, this would fetch from a feature flag service
      // For now, we'll simulate with localStorage or environment variables

      if (typeof window !== 'undefined') {
        const storedFlags = localStorage.getItem('feature-flags');
        if (storedFlags) {
          const parsedFlags = JSON.parse(storedFlags);
          setFlags(prev => ({ ...prev, ...parsedFlags }));
        }
      }

      // Check environment variables for flag overrides
      Object.keys(DEFAULT_FEATURE_FLAGS).forEach(flagKey => {
        const envVar = `REACT_APP_FEATURE_${flagKey.toUpperCase().replace(/-/g, '_')}`;
        const envValue = process.env[envVar];

        if (envValue === 'true' || envValue === 'false') {
          updateFlag(flagKey as FeatureFlagKey, {
            enabled: envValue === 'true',
            rolloutPercentage: envValue === 'true' ? 100 : 0
          });
        }
      });

    } catch (error) {
      console.warn('Failed to refresh feature flags:', error);
    }
  }, [updateFlag]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial flag refresh
  useEffect(() => {
    refreshFlags();
  }, [refreshFlags]);

  // Periodic flag refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(refreshFlags, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshFlags, refreshInterval]);

  // Development mode helpers
  useEffect(() => {
    if (environment === 'development') {
      // Expose feature flags to window for debugging
      (window as any).__featureFlags = {
        flags,
        isEnabled,
        updateFlag,
        refreshFlags
      };

      console.log('[Feature Flags] Initialized with flags:', flags);
    }
  }, [flags, isEnabled, updateFlag, refreshFlags, environment]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: FeatureFlagContextValue = {
    flags,
    isEnabled,
    getFlag,
    updateFlag,
    getAllFlags,
    refreshFlags
  };

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

export const useFeatureFlags = (): FeatureFlagContextValue => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};

export const useFeatureFlag = (flagKey: FeatureFlagKey): boolean => {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagKey);
};

export const useFeatureFlagWithMetadata = (flagKey: FeatureFlagKey) => {
  const { isEnabled, getFlag } = useFeatureFlags();
  const flag = getFlag(flagKey);

  return {
    enabled: isEnabled(flagKey),
    flag,
    metadata: flag?.metadata || {}
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Higher-order component for feature flag gating
 */
export const withFeatureFlag = <P extends object>(
  flagKey: FeatureFlagKey,
  FallbackComponent?: React.ComponentType<P>
) => {
  return (WrappedComponent: React.ComponentType<P>) => {
    const WithFeatureFlagComponent: React.FC<P> = (props) => {
      const enabled = useFeatureFlag(flagKey);

      if (!enabled) {
        return FallbackComponent ? <FallbackComponent {...props} /> : null;
      }

      return <WrappedComponent {...props} />;
    };

    WithFeatureFlagComponent.displayName = `withFeatureFlag(${flagKey})(${WrappedComponent.displayName || WrappedComponent.name})`;

    return WithFeatureFlagComponent;
  };
};

/**
 * Component for conditional rendering based on feature flags
 */
interface FeatureGateProps {
  flag: FeatureFlagKey;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  flag,
  fallback = null,
  children
}) => {
  const enabled = useFeatureFlag(flag);
  return enabled ? <>{children}</> : <>{fallback}</>;
};

/**
 * Development tool for feature flag management
 */
export const FeatureFlagDebugPanel: React.FC = () => {
  const { flags, updateFlag } = useFeatureFlags();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxHeight: '80vh',
        overflowY: 'auto',
        minWidth: '300px'
      }}
    >
      <h3>Feature Flags Debug Panel</h3>
      {Object.entries(flags).map(([key, flag]) => (
        <div key={key} style={{ marginBottom: '8px', padding: '4px', border: '1px solid #333' }}>
          <div style={{ fontWeight: 'bold' }}>{flag.name}</div>
          <div style={{ fontSize: '10px', color: '#ccc' }}>{flag.description}</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
            <input
              type="checkbox"
              checked={flag.enabled}
              onChange={(e) => updateFlag(key as FeatureFlagKey, { enabled: e.target.checked })}
            />
            Enabled
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            Rollout:
            <input
              type="range"
              min="0"
              max="100"
              value={flag.rolloutPercentage}
              onChange={(e) => updateFlag(key as FeatureFlagKey, { rolloutPercentage: parseInt(e.target.value) })}
              style={{ width: '100px' }}
            />
            {flag.rolloutPercentage}%
          </label>
        </div>
      ))}
    </div>
  );
};

export default FeatureFlagProvider;