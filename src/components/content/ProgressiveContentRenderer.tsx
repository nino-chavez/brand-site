/**
 * ProgressiveContentRenderer Component
 *
 * Extracted progressive content disclosure logic from SpatialSection.
 * Implements content strategy pattern for different scale thresholds with
 * content preloading, caching strategies, and transition animations.
 *
 * @fileoverview Progressive content disclosure with strategy pattern
 * @version 1.0.0
 * @since Task 2 - SpatialSection Component Refinement
 */

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import type { ContentLevel } from '../../types/canvas';
import { useContentLevelManager } from '../../services/ContentLevelManager';

/**
 * Content strategy interface for different disclosure levels
 */
interface ContentStrategy {
  level: ContentLevel;
  shouldRender: (feature: string) => boolean;
  getStyles: () => React.CSSProperties;
  getClasses: () => string[];
  getLoadingPriority: () => 'high' | 'medium' | 'low';
}

/**
 * Props for ProgressiveContentRenderer component
 */
export interface ProgressiveContentRendererProps {
  /** Current content level based on scale */
  contentLevel: ContentLevel;
  /** Whether section is active/focused */
  isActive: boolean;
  /** Whether content has been loaded */
  hasLoadedContent: boolean;
  /** Child content to render progressively */
  children: React.ReactNode;
  /** Optional metadata to display at enhanced levels */
  metadata?: {
    title?: string;
    description?: string;
    priority?: number;
    responsiveScale?: number;
  };
  /** Content loading callback */
  onContentLoad?: () => void;
  /** Debug mode for development */
  debugMode?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Content feature flags based on level
 */
const CONTENT_FEATURES: Record<ContentLevel, string[]> = {
  minimal: ['loading'],
  compact: ['loading', 'title'],
  normal: ['loading', 'title', 'content'],
  detailed: ['loading', 'title', 'content', 'metadata'],
  expanded: ['loading', 'title', 'content', 'metadata', 'enhanced', 'debug']
};

/**
 * Loading priorities for different content levels
 */
const LOADING_PRIORITIES: Record<ContentLevel, 'high' | 'medium' | 'low'> = {
  minimal: 'low',
  compact: 'medium',
  normal: 'high',
  detailed: 'high',
  expanded: 'high'
};

/**
 * Create content strategy for a given level
 */
const createContentStrategy = (
  level: ContentLevel,
  isActive: boolean,
  contentManager: ReturnType<typeof useContentLevelManager>
): ContentStrategy => {
  return {
    level,
    shouldRender: (feature: string) => CONTENT_FEATURES[level].includes(feature),
    getStyles: () => contentManager.getProgressiveStyles(level, isActive),
    getClasses: () => [
      `content-level-${level}`,
      'transition-all',
      'duration-160',
      'ease-out',
      ...(isActive ? ['active-section'] : [])
    ],
    getLoadingPriority: () => LOADING_PRIORITIES[level]
  };
};

/**
 * ProgressiveContentRenderer - Handles content disclosure based on scale
 *
 * Responsibilities:
 * - Content level determination and progressive disclosure
 * - Content strategy pattern for different scale thresholds
 * - Content preloading and caching with loading states
 * - Content transition animations and loading optimization
 */
export const ProgressiveContentRenderer: React.FC<ProgressiveContentRendererProps> = ({
  contentLevel,
  isActive,
  hasLoadedContent,
  children,
  metadata,
  onContentLoad,
  debugMode = false,
  className = ''
}) => {
  const contentManager = useContentLevelManager();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  // Create content strategy for current level
  const strategy = useMemo(() =>
    createContentStrategy(contentLevel, isActive, contentManager),
    [contentLevel, isActive, contentManager]
  );

  // Handle content level transitions
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 160); // Match transition duration
    return () => clearTimeout(timer);
  }, [contentLevel]);

  // Handle content loading
  useEffect(() => {
    if (strategy.shouldRender('content') && !hasLoadedContent && loadingState === 'idle') {
      setLoadingState('loading');

      // Simulate content loading based on priority
      const loadTime = strategy.getLoadingPriority() === 'high' ? 100 : 300;

      const timer = setTimeout(() => {
        setLoadingState('loaded');
        onContentLoad?.();
      }, loadTime);

      return () => clearTimeout(timer);
    }
  }, [strategy, hasLoadedContent, loadingState, onContentLoad]);

  // Loading component
  const LoadingComponent = useMemo(() => (
    <div
      className="flex items-center justify-center h-32 animate-pulse"
      role="status"
      aria-label="Loading section content"
    >
      <div className="w-8 h-8 border-2 border-athletic-court-orange border-t-transparent rounded-full animate-spin" />
    </div>
  ), []);

  // Title component
  const TitleComponent = useMemo(() => {
    if (!strategy.shouldRender('title') || !metadata?.title) return null;

    return (
      <div className={`section-title transition-opacity duration-160 ${
        contentLevel === 'minimal' ? 'text-sm' : 'text-base'
      }`}>
        {metadata.title}
      </div>
    );
  }, [strategy, metadata?.title, contentLevel]);

  // Metadata component
  const MetadataComponent = useMemo(() => {
    if (!strategy.shouldRender('metadata') || !metadata) return null;

    return (
      <div className="section-metadata text-xs text-athletic-neutral-500 space-y-1">
        {metadata.description && (
          <div className="description opacity-80">{metadata.description}</div>
        )}
        {metadata.priority && (
          <div className="priority">Priority: {metadata.priority}</div>
        )}
        {metadata.responsiveScale && (
          <div className="scale">Scale: {metadata.responsiveScale.toFixed(2)}</div>
        )}
      </div>
    );
  }, [strategy, metadata]);

  // Enhanced content for expanded view
  const EnhancedComponent = useMemo(() => {
    if (!strategy.shouldRender('enhanced')) return null;

    return (
      <div className="section-enhanced mt-2 p-2 bg-athletic-neutral-800/30 rounded text-xs">
        <div className="enhanced-details space-y-1">
          <div>Content Level: {contentLevel}</div>
          <div>Loading Priority: {strategy.getLoadingPriority()}</div>
          <div>Interactive: {contentManager.isInteractivityEnabled(contentLevel) ? 'Yes' : 'No'}</div>
          <div>Features: {CONTENT_FEATURES[contentLevel].join(', ')}</div>
        </div>
      </div>
    );
  }, [strategy, contentLevel, contentManager]);

  // Debug component
  const DebugComponent = useMemo(() => {
    if (!debugMode || !strategy.shouldRender('debug')) return null;

    return (
      <div className="section-debug absolute bottom-1 left-1 right-1 text-xs font-mono text-athletic-neutral-600 bg-black/50 p-1 rounded">
        <div>Level: {contentLevel}</div>
        <div>Loading: {loadingState}</div>
        <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
        <div>Features: {CONTENT_FEATURES[contentLevel].length}</div>
      </div>
    );
  }, [debugMode, strategy, contentLevel, loadingState, isTransitioning]);

  // Main content wrapper
  const ContentWrapper = useMemo(() => {
    if (!strategy.shouldRender('content')) {
      return <div className="content-placeholder h-16 bg-athletic-neutral-800/20 rounded animate-pulse" />;
    }

    if (!hasLoadedContent || loadingState === 'loading') {
      return LoadingComponent;
    }

    return (
      <div className="section-content-wrapper">
        {children}
      </div>
    );
  }, [strategy, hasLoadedContent, loadingState, children, LoadingComponent]);

  // Error boundary for content loading
  const handleError = useCallback(() => {
    setLoadingState('error');
  }, []);

  // Combine all classes
  const combinedClasses = useMemo(() => {
    const baseClasses = [
      'progressive-content-renderer',
      'relative',
      ...strategy.getClasses()
    ];

    if (className) {
      baseClasses.push(...className.split(' '));
    }

    if (isTransitioning) {
      baseClasses.push('transitioning');
    }

    return baseClasses.join(' ');
  }, [strategy, className, isTransitioning]);

  // Progressive styles from strategy
  const progressiveStyles = useMemo(() => ({
    ...strategy.getStyles(),
    opacity: isTransitioning ? 0.8 : 1.0
  }), [strategy, isTransitioning]);

  return (
    <div
      className={combinedClasses}
      style={progressiveStyles}
      data-content-level={contentLevel}
      data-loading-state={loadingState}
      data-interactive={contentManager.isInteractivityEnabled(contentLevel)}
      aria-busy={loadingState === 'loading'}
      onError={handleError}
    >
      {/* Always render title first if available */}
      {TitleComponent}

      {/* Main content area */}
      <div className="progressive-content-area relative">
        {ContentWrapper}

        {/* Metadata overlay for detailed+ levels */}
        {MetadataComponent}

        {/* Enhanced content for expanded level */}
        {EnhancedComponent}
      </div>

      {/* Debug overlay */}
      {DebugComponent}

      {/* Loading indicator overlay */}
      {loadingState === 'loading' && strategy.shouldRender('content') && (
        <div className="absolute inset-0 bg-athletic-neutral-900/50 flex items-center justify-center z-10">
          <div className="loading-indicator">
            <div className="w-6 h-6 border-2 border-athletic-court-orange border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Error state */}
      {loadingState === 'error' && (
        <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center z-10">
          <div className="error-message text-red-400 text-sm">
            Failed to load content
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Hook for managing progressive content state
 */
export const useProgressiveContent = (
  scale: number,
  deviceType?: 'mobile' | 'tablet' | 'desktop'
) => {
  const contentManager = useContentLevelManager();
  const [hasLoadedContent, setHasLoadedContent] = useState(false);

  const responsiveScale = useMemo(() =>
    contentManager.calculateResponsiveScale(scale, deviceType),
    [contentManager, scale, deviceType]
  );

  const contentLevel = useMemo(() =>
    contentManager.determineContentLevel(responsiveScale),
    [contentManager, responsiveScale]
  );

  const progressiveStyles = useCallback((isActive: boolean) =>
    contentManager.getProgressiveStyles(contentLevel, isActive),
    [contentManager, contentLevel]
  );

  const contentFeatures = useMemo(() =>
    contentManager.getContentFeatures(contentLevel),
    [contentManager, contentLevel]
  );

  const isInteractive = useMemo(() =>
    contentManager.isInteractivityEnabled(contentLevel),
    [contentManager, contentLevel]
  );

  return {
    contentLevel,
    responsiveScale,
    hasLoadedContent,
    setHasLoadedContent,
    progressiveStyles,
    contentFeatures,
    isInteractive
  };
};

export default ProgressiveContentRenderer;