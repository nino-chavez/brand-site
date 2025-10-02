import React, { forwardRef, useEffect, useCallback, useState, useRef } from 'react';
import { useUnifiedGameFlow } from '../../src/contexts/UnifiedGameFlowContext';
import { useGameFlowDebugger } from '../../src/hooks/useGameFlowDebugger';
import ViewfinderOverlay from '../../src/components/layout/ViewfinderOverlay';
import { useScrollAnimation, useAnimationWithEffects } from '../../src/hooks/useScrollAnimation';

interface ExposureSettings {
  aperture: number;
  shutterSpeed: number;
  iso: number;
  exposureCompensation: number;
}

interface ExposureSectionProps {
  active: boolean;
  progress: number;
  exposureSettings: ExposureSettings;
  onExposureAdjust: (settings: Partial<ExposureSettings>) => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface Article {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  readTime: string;
  date: string;
  category: string;
  tags: string[];
  content?: string;
  insights: string[];
}

const ExposureSection = forwardRef<HTMLElement, ExposureSectionProps>(({
  active,
  progress,
  exposureSettings,
  onExposureAdjust,
  onError,
  className = ''
}, ref) => {
  // Game Flow section hook
  const { state, actions } = useUnifiedGameFlow();
  const isActive = state.currentSection === 'exposure';

  // Debug logging
  const gameFlowDebugger = useGameFlowDebugger();

  // Component state
  const [exposureCalculated, setExposureCalculated] = useState(false);
  const [articlesLoaded, setArticlesLoaded] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [shutterTransitionActive, setShutterTransitionActive] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);

  // Effects context for user-controlled animations
  const { getClasses } = useAnimationWithEffects();

  // Section-level animation (whole section entrance)
  const { elementRef: sectionAnimRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.15,
    triggerOnce: true
  });

  // Content-level animations (staggered after section)
  const { elementRef: headingRef, isVisible: headingVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const { elementRef: subtitleRef, isVisible: subtitleVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const { elementRef: articleRef, isVisible: articleVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  // Articles/insights data - styled as athletic training log
  const articles: Article[] = [
    {
      id: 'microservices-at-scale',
      title: 'Microservices at Scale',
      subtitle: 'Lessons from managing 100+ services',
      excerpt: 'After architecting systems serving millions of users, here are the patterns that actually work when scaling microservices beyond the textbook examples.',
      readTime: '8 min read',
      date: '2024-09-15',
      category: 'Architecture',
      tags: ['Microservices', 'Scale', 'DevOps', 'Performance'],
      insights: [
        'Service mesh complexity grows exponentially after 50 services',
        'Database per service is ideal; shared databases kill scalability',
        'Circuit breakers prevent cascading failures but need fine-tuning',
        'Observability costs can exceed infrastructure costs'
      ]
    },
    {
      id: 'performance-optimization',
      title: 'The Performance Mindset',
      subtitle: 'Why 200ms matters more than perfect code',
      excerpt: 'Performance isn\'t just about optimization—it\'s about user psychology, business metrics, and technical sustainability. Here\'s how to think like a performance engineer.',
      readTime: '6 min read',
      date: '2024-08-22',
      category: 'Performance',
      tags: ['Optimization', 'UX', 'Metrics', 'Psychology'],
      insights: [
        '100ms delay = 1% conversion loss in e-commerce',
        'Perceived performance matters more than actual performance',
        'Critical rendering path optimization has highest ROI',
        'Performance budgets prevent regression better than monitoring'
      ]
    },
    {
      id: 'team-scaling',
      title: 'Scaling Engineering Teams',
      subtitle: 'From 5 to 100 without losing velocity',
      excerpt: 'Growing engineering teams is like scaling systems—you need the right architecture, clear interfaces, and robust processes. Here\'s what actually works.',
      readTime: '12 min read',
      date: '2024-07-18',
      category: 'Leadership',
      tags: ['Management', 'Process', 'Culture', 'Growth'],
      insights: [
        'Conway\'s Law: Team structure defines system architecture',
        'Async communication scales; meetings don\'t',
        'Documentation quality correlates with team velocity',
        'Technical debt compounds faster in larger teams'
      ]
    },
    {
      id: 'action-sports-tech',
      title: 'Technology Meets Action Sports',
      subtitle: 'Precision timing in extreme conditions',
      excerpt: 'What photographing professional athletes taught me about system reliability, real-time processing, and handling failure under pressure.',
      readTime: '10 min read',
      date: '2024-06-25',
      category: 'Insights',
      tags: ['Sports', 'Real-time', 'Reliability', 'Pressure'],
      insights: [
        'Sub-20ms response times required for action capture',
        'Hardware failure rates increase 3x in extreme conditions',
        'Predictive systems outperform reactive systems',
        'Redundancy planning must account for simultaneous failures'
      ]
    }
  ];

  // Exposure calculation sequence
  useEffect(() => {
    if (active || isActive) {
      gameFlowDebugger.startBenchmark('exposure-section-ready');

      const exposureSequence = async () => {
        try {
          // Exposure calculation sequence
          await new Promise(resolve => setTimeout(resolve, 300));
          setExposureCalculated(true);

          await new Promise(resolve => setTimeout(resolve, 400));
          setArticlesLoaded(true);

          gameFlowDebugger.endBenchmark('exposure-section-ready');

        } catch (error) {
          gameFlowDebugger.log('error', 'section', 'Exposure section readiness failed', error);
          onError?.(error instanceof Error ? error : new Error('Exposure section failed'));
        }
      };

      exposureSequence();
    }
  }, [active, isActive, onError, gameFlowDebugger]);

  // Camera shutter transition between articles
  const handleNextArticle = useCallback(() => {
    setShutterTransitionActive(true);

    // Trigger shutter effect
    setTimeout(() => {
      const nextIndex = (currentArticleIndex + 1) % articles.length;
      setCurrentArticleIndex(nextIndex);

      // Adjust exposure settings based on article type
      const newSettings = {
        shutterSpeed: 125 + nextIndex * 50, // Vary shutter speed
        iso: 400 + nextIndex * 100 // Vary ISO
      };
      if (onExposureAdjust && typeof onExposureAdjust === 'function') {
        onExposureAdjust(newSettings);
      }

      gameFlowDebugger.log('info', 'navigation', 'Article transition with shutter effect', { nextIndex });
    }, 100);

    // End shutter effect
    setTimeout(() => {
      setShutterTransitionActive(false);
    }, 600);
  }, [currentArticleIndex, articles.length, onExposureAdjust, gameFlowDebugger]);

  const handlePreviousArticle = useCallback(() => {
    setShutterTransitionActive(true);

    setTimeout(() => {
      const prevIndex = currentArticleIndex === 0 ? articles.length - 1 : currentArticleIndex - 1;
      setCurrentArticleIndex(prevIndex);

      const newSettings = {
        shutterSpeed: 125 + prevIndex * 50,
        iso: 400 + prevIndex * 100
      };
      if (onExposureAdjust && typeof onExposureAdjust === 'function') {
        onExposureAdjust(newSettings);
      }
    }, 100);

    setTimeout(() => {
      setShutterTransitionActive(false);
    }, 600);
  }, [currentArticleIndex, articles.length, onExposureAdjust]);

  const currentArticle = articles[currentArticleIndex];

  return (
    <section
      ref={(el) => {
        sectionRef.current = el;
        sectionAnimRef.current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      id="exposure"
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-neutral-800 to-slate-900 ${getClasses(sectionVisible)} ${className}`}
      data-testid="exposure-section"
      data-active={active || isActive}
      data-progress={progress}
      data-exposure-calculated={exposureCalculated}
      data-section="exposure"
      data-camera-metaphor="true"
      aria-label="Exposure section - Technical insights and articles"
    >
      {/* Shutter transition overlay */}
      <div
        className={`absolute inset-0 z-40 pointer-events-none transition-all duration-300 ${
          shutterTransitionActive ? 'opacity-100' : 'opacity-0'
        }`}
        data-testid="shutter-transition"
        data-active={shutterTransitionActive}
      >
        {/* Horizontal shutter blades */}
        <div
          className={`absolute top-0 left-0 w-full h-1/2 bg-black transform transition-transform duration-300 ${
            shutterTransitionActive ? 'translate-y-0' : '-translate-y-full'
          }`}
        />
        <div
          className={`absolute bottom-0 left-0 w-full h-1/2 bg-black transform transition-transform duration-300 ${
            shutterTransitionActive ? 'translate-y-0' : 'translate-y-full'
          }`}
        />
      </div>

      {/* Main insights container - athletic training log aesthetic */}
      <div
        className="relative z-20 min-h-screen flex flex-col training-log-aesthetic"
        data-testid="insights-container"
      >
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="max-w-6xl mx-auto px-4">

            {/* Section header */}
            <div className="text-center mb-16">
              <h2
                ref={headingRef}
                className={`text-4xl md:text-6xl font-black text-white mb-6 leading-tight ${getClasses(headingVisible)}`}
              >
                Perfect
                <span className="block text-athletic-brand-violet">Exposure</span>
              </h2>
              <p
                ref={subtitleRef}
                className={`text-xl text-white/80 max-w-3xl mx-auto leading-relaxed ${getClasses(subtitleVisible)}`}
              >
                Technical insights captured through years of building systems under pressure.
                Each article represents lessons learned in the field.
              </p>
            </div>

            {/* Article navigation controls */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              <button
                onClick={handlePreviousArticle}
                className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
                title="Previous insight"
              >
                ←
              </button>

              <div className="flex space-x-2">
                {articles.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentArticleIndex ? 'bg-athletic-brand-violet' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextArticle}
                className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
                title="Next insight"
                data-testid="next-article"
              >
                →
              </button>
            </div>

            {/* Current article display */}
            <div
              ref={articleRef}
              className={getClasses(articleVisible)}
            >
              <div
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 scannable-typography high-readability"
                data-testid="current-article"
                data-article-index={currentArticleIndex}
              >
                {/* Article header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="px-3 py-1 bg-athletic-brand-violet/20 text-athletic-brand-violet rounded-full text-sm font-medium">
                      {currentArticle.category}
                    </span>
                    <span className="text-white/50 text-sm">{currentArticle.date}</span>
                    <span className="text-white/50 text-sm">{currentArticle.readTime}</span>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                    {currentArticle.title}
                  </h3>
                  <p className="text-xl text-athletic-brand-violet/80 mb-4">
                    {currentArticle.subtitle}
                  </p>
                  <p className="text-lg text-white/80 leading-relaxed">
                    {currentArticle.excerpt}
                  </p>
                </div>

                {/* Key insights */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Key Insights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentArticle.insights.map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="w-2 h-2 bg-athletic-brand-violet rounded-full mt-2 flex-shrink-0" />
                        <p className="text-white/90 leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Article tags */}
                <div className="flex flex-wrap gap-2">
                  {currentArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-white/10 text-white/70 rounded-md hover:bg-white/20 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Article previews */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((article, index) => {
                if (index === currentArticleIndex) return null;

                return (
                  <div
                    key={article.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer scannable-typography high-readability"
                    onClick={() => setCurrentArticleIndex(index)}
                    data-testid="article-preview"
                  >
                    <div className="mb-3">
                      <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                        {article.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2 leading-tight">
                      {article.title}
                    </h4>
                    <p className="text-white/60 text-sm mb-3 leading-relaxed">
                      {article.excerpt.slice(0, 120)}...
                    </p>
                    <div className="text-xs text-white/40">
                      {article.readTime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ViewfinderOverlay in exposure mode */}
      <ViewfinderOverlay
        isActive={active || isActive}
        mode="exposure"
        showMetadataHUD={exposureCalculated}
        className="z-30"
        data-testid="viewfinder-overlay"
        data-mode="exposure"
        data-exposure-calculated={exposureCalculated}
      />

      {/* Exposure status indicators */}
      <div className="absolute top-4 left-4 z-40 space-y-2">
        <div
          className={`flex items-center space-x-2 text-sm font-mono ${
            exposureCalculated ? 'text-green-400' : 'text-yellow-400'
          } transition-colors duration-300`}
        >
          <div className={`w-2 h-2 rounded-full ${exposureCalculated ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
          <span>EXPOSURE {exposureCalculated ? 'SET' : 'CALC'}</span>
        </div>

        {exposureCalculated && (
          <div className={`flex items-center space-x-2 text-sm font-mono ${articlesLoaded ? 'text-green-400' : 'text-yellow-400'} transition-colors duration-300`}>
            <div className={`w-2 h-2 rounded-full ${articlesLoaded ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            <span>ARTICLES {articlesLoaded ? 'READY' : 'LOAD'}</span>
          </div>
        )}
      </div>

      {/* Exposure settings display */}
      <div className="absolute top-4 right-4 z-40 text-sm font-mono text-white/60 space-y-1">
        <div>f/{exposureSettings?.aperture ?? '4'}</div>
        <div>1/{exposureSettings?.shutterSpeed ?? '125'}s</div>
        <div>ISO {exposureSettings?.iso ?? '400'}</div>
        <div>{(exposureSettings?.exposureCompensation ?? 0) > 0 ? '+' : ''}{exposureSettings?.exposureCompensation ?? '0'}EV</div>
      </div>

      {/* Smooth transition fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-900 to-transparent z-30 pointer-events-none" />

      <style>{`
        .training-log-aesthetic {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.9));
        }

        .scannable-typography {
          font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
          line-height: 1.6;
        }

        .high-readability {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .scannable-typography h3,
        .scannable-typography h4 {
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .scannable-typography p {
          max-width: 65ch;
        }

        /* Article preview hover effects */
        [data-testid="article-preview"]:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
        }
      `}</style>
    </section>
  );
});

ExposureSection.displayName = 'ExposureSection';

export default ExposureSection;