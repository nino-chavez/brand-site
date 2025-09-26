import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';

// Touch device detection utility
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export interface InteractivePauseSystemProps {
  isActive: boolean;
  currentPhase: VolleyballPhase;
  onPauseToggle: (paused: boolean) => void;
  onGlobalPause: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface PauseOverlayProps {
  phase: VolleyballPhase;
  isVisible: boolean;
  onClose: () => void;
  onNavigatePhase?: (phase: VolleyballPhase) => void;
}

export interface PauseState {
  isPaused: boolean;
  pauseTrigger: 'hover' | 'click' | 'touch' | 'manual' | 'none';
  pauseTimestamp: number;
  overlayVisible: boolean;
  resumeDelay: number; // milliseconds
  touchMode: boolean; // Whether device supports touch
}

export interface DetailedOverlay {
  phase: VolleyballPhase;
  technicalInsights: TechnicalInsight[];
  interactiveElements: InteractiveElement[];
  phaseMetrics: PhaseMetrics;
}

export interface TechnicalInsight {
  id: string;
  title: string;
  description: string;
  category: 'architecture' | 'performance' | 'scalability' | 'reliability';
  importance: number; // 0-1
  visualAnchor?: { x: number; y: number }; // Percentage positions
}

export interface InteractiveElement {
  id: string;
  type: 'component' | 'connection' | 'metric' | 'diagram';
  position: { x: number; y: number };
  size: { width: number; height: number };
  tooltip: string;
  specifications?: string[];
  onClick?: () => void;
}

export interface PhaseMetrics {
  phase: VolleyballPhase;
  technicalComplexity: number;
  performanceImpact: number;
  scalabilityFactor: number;
  reliabilityScore: number;
  implementationTime: string;
  keyDecisions: string[];
}

// Phase-specific technical insights
const PHASE_INSIGHTS: Record<VolleyballPhase, DetailedOverlay> = {
  setup: {
    phase: 'setup',
    technicalInsights: [
      {
        id: 'foundation-planning',
        title: 'System Architecture Foundation',
        description: 'Like a volleyball player positioning before serve, solid system architecture requires careful initial planning and strategic component placement.',
        category: 'architecture',
        importance: 0.9,
        visualAnchor: { x: 50, y: 40 }
      },
      {
        id: 'scalability-preparation',
        title: 'Scalability Considerations',
        description: 'Early architectural decisions determine future scalability potential, just as proper stance enables powerful serves.',
        category: 'scalability',
        importance: 0.8,
        visualAnchor: { x: 30, y: 60 }
      },
      {
        id: 'reliability-foundation',
        title: 'Reliability & Monitoring Setup',
        description: 'Establishing monitoring and error handling from the start creates resilient systems.',
        category: 'reliability',
        importance: 0.7,
        visualAnchor: { x: 70, y: 50 }
      }
    ],
    interactiveElements: [
      {
        id: 'api-gateway',
        type: 'component',
        position: { x: 25, y: 30 },
        size: { width: 120, height: 60 },
        tooltip: 'API Gateway: Entry point for all client requests',
        specifications: ['Rate limiting: 1000 req/s', 'Authentication: JWT', 'Response caching: 60s']
      },
      {
        id: 'load-balancer',
        type: 'component',
        position: { x: 45, y: 30 },
        size: { width: 100, height: 60 },
        tooltip: 'Load Balancer: Distributes traffic across services',
        specifications: ['Algorithm: Round Robin', 'Health checks: 30s', 'Auto-scaling: CPU > 70%']
      },
      {
        id: 'database',
        type: 'component',
        position: { x: 65, y: 70 },
        size: { width: 140, height: 80 },
        tooltip: 'Primary Database: PostgreSQL with read replicas',
        specifications: ['Connection pooling: 20 max', 'Backup: Daily snapshots', 'Replication: 2 read replicas']
      }
    ],
    phaseMetrics: {
      phase: 'setup',
      technicalComplexity: 0.3,
      performanceImpact: 0.2,
      scalabilityFactor: 0.9,
      reliabilityScore: 0.8,
      implementationTime: '2-3 weeks',
      keyDecisions: ['Database choice', 'Authentication strategy', 'API design patterns', 'Monitoring stack']
    }
  },
  anticipation: {
    phase: 'anticipation',
    technicalInsights: [
      {
        id: 'complexity-emergence',
        title: 'System Complexity Emergence',
        description: 'As requirements grow, architectural complexity builds like tension before a spike - requiring careful management.',
        category: 'architecture',
        importance: 0.9,
        visualAnchor: { x: 60, y: 35 }
      },
      {
        id: 'performance-planning',
        title: 'Performance Bottleneck Identification',
        description: 'Anticipating performance challenges allows proactive optimization, like reading the opponent\'s strategy.',
        category: 'performance',
        importance: 0.8,
        visualAnchor: { x: 40, y: 55 }
      }
    ],
    interactiveElements: [
      {
        id: 'cache-layer',
        type: 'component',
        position: { x: 35, y: 40 },
        size: { width: 110, height: 70 },
        tooltip: 'Redis Cache: High-performance data caching',
        specifications: ['Memory: 16GB', 'Eviction: LRU', 'Persistence: AOF', 'Clustering: 3 nodes']
      },
      {
        id: 'message-queue',
        type: 'component',
        position: { x: 55, y: 25 },
        size: { width: 130, height: 65 },
        tooltip: 'Message Queue: Async processing with RabbitMQ',
        specifications: ['Max queue size: 10k', 'Dead letter: enabled', 'Durability: persistent', 'Routing: topic-based']
      }
    ],
    phaseMetrics: {
      phase: 'anticipation',
      technicalComplexity: 0.6,
      performanceImpact: 0.4,
      scalabilityFactor: 0.7,
      reliabilityScore: 0.7,
      implementationTime: '3-4 weeks',
      keyDecisions: ['Caching strategy', 'Queue architecture', 'Service boundaries', 'Data consistency model']
    }
  },
  approach: {
    phase: 'approach',
    technicalInsights: [
      {
        id: 'optimization-momentum',
        title: 'Performance Optimization Momentum',
        description: 'Building optimization layers creates momentum toward peak performance, like an athletic approach run.',
        category: 'performance',
        importance: 1.0,
        visualAnchor: { x: 70, y: 30 }
      },
      {
        id: 'scaling-implementation',
        title: 'Horizontal Scaling Implementation',
        description: 'Implementing auto-scaling and load distribution prepares systems for peak traffic.',
        category: 'scalability',
        importance: 0.9,
        visualAnchor: { x: 50, y: 45 }
      }
    ],
    interactiveElements: [
      {
        id: 'auto-scaler',
        type: 'component',
        position: { x: 45, y: 20 },
        size: { width: 140, height: 75 },
        tooltip: 'Auto Scaler: Dynamic instance management',
        specifications: ['Min instances: 2', 'Max instances: 20', 'Scale trigger: CPU 70%', 'Cool-down: 300s']
      },
      {
        id: 'cdn',
        type: 'component',
        position: { x: 25, y: 60 },
        size: { width: 120, height: 70 },
        tooltip: 'CDN: Global content delivery network',
        specifications: ['Edge locations: 150+', 'Cache TTL: 24h', 'Compression: Brotli', 'SSL: TLS 1.3']
      }
    ],
    phaseMetrics: {
      phase: 'approach',
      technicalComplexity: 0.8,
      performanceImpact: 0.9,
      scalabilityFactor: 0.9,
      reliabilityScore: 0.8,
      implementationTime: '4-5 weeks',
      keyDecisions: ['Auto-scaling policies', 'CDN configuration', 'Database sharding', 'Circuit breakers']
    }
  },
  spike: {
    phase: 'spike',
    technicalInsights: [
      {
        id: 'critical-optimization',
        title: 'Critical Path Optimization',
        description: 'Fine-tuning critical system paths for peak performance, like perfecting spike timing.',
        category: 'performance',
        importance: 1.0,
        visualAnchor: { x: 80, y: 25 }
      },
      {
        id: 'execution-precision',
        title: 'Execution Precision',
        description: 'Every millisecond matters in peak performance scenarios - optimization becomes surgical.',
        category: 'performance',
        importance: 1.0,
        visualAnchor: { x: 60, y: 40 }
      }
    ],
    interactiveElements: [
      {
        id: 'performance-monitor',
        type: 'metric',
        position: { x: 70, y: 15 },
        size: { width: 150, height: 80 },
        tooltip: 'Real-time Performance Monitoring',
        specifications: ['Response time: <100ms', 'Throughput: 10k RPS', 'Error rate: <0.01%', 'Availability: 99.99%']
      }
    ],
    phaseMetrics: {
      phase: 'spike',
      technicalComplexity: 0.95,
      performanceImpact: 1.0,
      scalabilityFactor: 0.8,
      reliabilityScore: 0.9,
      implementationTime: '2-3 weeks intensive optimization',
      keyDecisions: ['Query optimization', 'Connection pooling', 'Memory management', 'CPU profiling']
    }
  },
  impact: {
    phase: 'impact',
    technicalInsights: [
      {
        id: 'production-excellence',
        title: 'Production System Excellence',
        description: 'The crystallized moment of perfect system execution - all components working in harmony.',
        category: 'architecture',
        importance: 1.0,
        visualAnchor: { x: 85, y: 20 }
      },
      {
        id: 'peak-performance',
        title: 'Peak Performance Achieved',
        description: 'System operating at designed capacity with optimal efficiency and reliability.',
        category: 'performance',
        importance: 1.0,
        visualAnchor: { x: 50, y: 30 }
      }
    ],
    interactiveElements: [
      {
        id: 'success-metrics',
        type: 'metric',
        position: { x: 40, y: 20 },
        size: { width: 180, height: 100 },
        tooltip: 'Production Success Metrics',
        specifications: ['Uptime: 99.99%', 'Response time: 45ms avg', 'Throughput: 15k RPS', 'Zero critical errors']
      }
    ],
    phaseMetrics: {
      phase: 'impact',
      technicalComplexity: 1.0,
      performanceImpact: 1.0,
      scalabilityFactor: 1.0,
      reliabilityScore: 1.0,
      implementationTime: 'Ongoing optimization',
      keyDecisions: ['Performance SLAs', 'Monitoring thresholds', 'Incident response', 'Capacity planning']
    }
  },
  'follow-through': {
    phase: 'follow-through',
    technicalInsights: [
      {
        id: 'continuous-monitoring',
        title: 'Continuous Monitoring & Improvement',
        description: 'Like follow-through in sports, continuous monitoring ensures sustained excellence.',
        category: 'reliability',
        importance: 0.8,
        visualAnchor: { x: 40, y: 60 }
      },
      {
        id: 'team-coordination',
        title: 'Team & System Coordination',
        description: 'Coordinated operations and team practices maintain system health and enable evolution.',
        category: 'architecture',
        importance: 0.7,
        visualAnchor: { x: 60, y: 50 }
      }
    ],
    interactiveElements: [
      {
        id: 'monitoring-dashboard',
        type: 'component',
        position: { x: 30, y: 50 },
        size: { width: 160, height: 90 },
        tooltip: 'Monitoring Dashboard: System health overview',
        specifications: ['Real-time metrics', 'Alert thresholds', 'Historical trends', 'Automated reports']
      }
    ],
    phaseMetrics: {
      phase: 'follow-through',
      technicalComplexity: 0.5,
      performanceImpact: 0.4,
      scalabilityFactor: 0.6,
      reliabilityScore: 0.9,
      implementationTime: 'Ongoing maintenance',
      keyDecisions: ['Monitoring strategy', 'Alerting policies', 'Maintenance windows', 'Evolution roadmap']
    }
  }
};

const PauseOverlay: React.FC<PauseOverlayProps> = ({
  phase,
  isVisible,
  onClose,
  onNavigatePhase
}) => {
  const overlayData = phase ? PHASE_INSIGHTS[phase] : null;

  if (!isVisible || !overlayData) return null;

  return (
    <div
      className="pause-overlay fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center"
      style={{
        animation: 'fadeIn 300ms ease-out'
      }}
    >
      <div className="overlay-content bg-gray-900 rounded-lg max-w-4xl max-h-[90vh] overflow-auto m-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors z-10"
          aria-label="Close overlay"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-2 capitalize">
            {phase?.replace('-', ' ') || 'Unknown'} Phase Deep Dive
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <span>Complexity: {Math.round(overlayData.phaseMetrics.technicalComplexity * 100)}%</span>
            <span>Performance Impact: {Math.round(overlayData.phaseMetrics.performanceImpact * 100)}%</span>
            <span>Implementation: {overlayData.phaseMetrics.implementationTime}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Technical Insights */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Technical Insights</h3>
            <div className="space-y-4">
              {overlayData.technicalInsights.map(insight => (
                <div key={insight.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{insight.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      insight.category === 'architecture' ? 'bg-blue-600 text-blue-100' :
                      insight.category === 'performance' ? 'bg-green-600 text-green-100' :
                      insight.category === 'scalability' ? 'bg-yellow-600 text-yellow-100' :
                      'bg-purple-600 text-purple-100'
                    }`}>
                      {insight.category}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{insight.description}</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-brand-violet h-1 rounded-full"
                        style={{ width: `${insight.importance * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">Importance: {Math.round(insight.importance * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Elements */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">System Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overlayData.interactiveElements.map(element => (
                <div key={element.id} className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">{element.tooltip.split(':')[0]}</h4>
                  <p className="text-sm text-gray-300 mb-3">{element.tooltip.split(':')[1]}</p>
                  {element.specifications && (
                    <ul className="text-xs text-gray-400 space-y-1">
                      {element.specifications.map((spec, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-brand-violet rounded-full mr-2" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Key Decisions */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Key Architectural Decisions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {overlayData.phaseMetrics.keyDecisions.map((decision, index) => (
                <div key={index} className="bg-gray-800 rounded p-3 text-center">
                  <span className="text-sm text-gray-300">{decision}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export const InteractivePauseSystem: React.FC<InteractivePauseSystemProps> = ({
  isActive,
  currentPhase,
  onPauseToggle,
  onGlobalPause,
  children,
  className = ''
}) => {
  const [pauseState, setPauseState] = useState<PauseState>({
    isPaused: false,
    pauseTrigger: 'none',
    pauseTimestamp: 0,
    overlayVisible: false,
    resumeDelay: 2000,
    touchMode: isTouchDevice()
  });

  const [isHovering, setIsHovering] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(false);
  const resumeTimeoutRef = useRef<number>();
  const touchControlTimeoutRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<number>(0);

  // Handle touch start events for touch devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isActive || !pauseState.touchMode) return;

    lastTouchRef.current = performance.now();

    // Show touch controls on first touch
    if (!showTouchControls) {
      setShowTouchControls(true);

      // Hide controls after 3 seconds of inactivity
      if (touchControlTimeoutRef.current) {
        clearTimeout(touchControlTimeoutRef.current);
      }

      touchControlTimeoutRef.current = window.setTimeout(() => {
        setShowTouchControls(false);
      }, 3000);
    }

    // Prevent default to avoid hover emulation
    e.preventDefault();
  }, [isActive, pauseState.touchMode, showTouchControls]);

  // Handle touch tap for pause/resume
  const handleTouchTap = useCallback((e: React.TouchEvent) => {
    if (!isActive || !pauseState.touchMode) return;

    const touchTime = performance.now();
    const timeSinceLastTouch = touchTime - lastTouchRef.current;

    // Ignore rapid successive touches (< 200ms)
    if (timeSinceLastTouch < 200) return;

    e.preventDefault();
    e.stopPropagation();

    const wasPaused = pauseState.isPaused;

    if (wasPaused) {
      // Resume if already paused
      setPauseState(prev => ({
        ...prev,
        isPaused: false,
        pauseTrigger: 'none',
        overlayVisible: false
      }));
      onPauseToggle(false);
    } else {
      // Pause with detailed overlay
      setPauseState(prev => ({
        ...prev,
        isPaused: true,
        pauseTrigger: 'touch',
        pauseTimestamp: touchTime,
        overlayVisible: true
      }));
      onPauseToggle(true);
      onGlobalPause();
    }

    // Clear any resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    // Show touch controls after interaction
    setShowTouchControls(true);
    if (touchControlTimeoutRef.current) {
      clearTimeout(touchControlTimeoutRef.current);
    }
    touchControlTimeoutRef.current = window.setTimeout(() => {
      setShowTouchControls(false);
    }, 3000);
  }, [isActive, pauseState.touchMode, pauseState.isPaused, onPauseToggle, onGlobalPause]);

  // Handle hover triggers for automatic pause (mouse devices only)
  const handleMouseEnter = useCallback(() => {
    if (!isActive || pauseState.touchMode) return;

    setIsHovering(true);

    // Trigger immediate pause within 100ms requirement
    if (!pauseState.isPaused) {
      setPauseState(prev => ({
        ...prev,
        isPaused: true,
        pauseTrigger: 'hover',
        pauseTimestamp: performance.now()
      }));

      onPauseToggle(true);

      // Clear any existing resume timeout
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    }
  }, [isActive, pauseState.touchMode, pauseState.isPaused, onPauseToggle]);

  const handleMouseLeave = useCallback(() => {
    if (!isActive || pauseState.touchMode) return;

    setIsHovering(false);

    // Start resume countdown if paused by hover
    if (pauseState.isPaused && pauseState.pauseTrigger === 'hover') {
      // Resume after 2-second delay when cursor moves away
      resumeTimeoutRef.current = window.setTimeout(() => {
        setPauseState(prev => ({
          ...prev,
          isPaused: false,
          pauseTrigger: 'none',
          overlayVisible: false
        }));

        onPauseToggle(false);
      }, pauseState.resumeDelay);
    }
  }, [isActive, pauseState.touchMode, pauseState.isPaused, pauseState.pauseTrigger, pauseState.resumeDelay, onPauseToggle]);

  // Handle click triggers for manual pause (mouse devices only)
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isActive || pauseState.touchMode) return;

    // Global pause state - click anywhere triggers immediate animation suspension
    e.stopPropagation();

    const wasPaused = pauseState.isPaused;

    if (wasPaused) {
      // Resume if already paused
      setPauseState(prev => ({
        ...prev,
        isPaused: false,
        pauseTrigger: 'none',
        overlayVisible: false
      }));
      onPauseToggle(false);
    } else {
      // Pause with detailed overlay
      setPauseState(prev => ({
        ...prev,
        isPaused: true,
        pauseTrigger: 'click',
        pauseTimestamp: performance.now(),
        overlayVisible: true
      }));
      onPauseToggle(true);
      onGlobalPause();
    }

    // Clear any resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  }, [isActive, pauseState.touchMode, pauseState.isPaused, onPauseToggle, onGlobalPause]);

  // Handle detailed overlay appearance with 300ms fade-in
  useEffect(() => {
    if (pauseState.isPaused && pauseState.pauseTrigger === 'hover') {
      const overlayTimeout = setTimeout(() => {
        setPauseState(prev => ({
          ...prev,
          overlayVisible: true
        }));
      }, 300);

      return () => clearTimeout(overlayTimeout);
    }
  }, [pauseState.isPaused, pauseState.pauseTrigger]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
      if (touchControlTimeoutRef.current) {
        clearTimeout(touchControlTimeoutRef.current);
      }
    };
  }, []);

  // Handle escape key for closing overlay
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pauseState.overlayVisible) {
        setPauseState(prev => ({
          ...prev,
          overlayVisible: false,
          isPaused: false,
          pauseTrigger: 'none'
        }));
        onPauseToggle(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [pauseState.overlayVisible, onPauseToggle]);

  return (
    <>
      <div
        ref={containerRef}
        className={`interactive-pause-system ${className} ${pauseState.isPaused ? 'paused' : ''} ${pauseState.touchMode ? 'touch-device' : 'mouse-device'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchTap}
        style={{
          position: 'relative',
          cursor: isActive && !pauseState.touchMode ? 'pointer' : 'default',
          transition: 'all 0.3s ease-out',
          touchAction: 'manipulation' // Prevents zoom on double tap
        }}
      >
        {children}

        {/* Pause indicator overlay */}
        {pauseState.isPaused && (
          <div
            className="pause-indicator absolute top-4 left-4 bg-black bg-opacity-70 rounded-lg px-3 py-2 flex items-center space-x-2 z-40"
            style={{
              animation: 'slideIn 200ms ease-out'
            }}
          >
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">
              Paused - {
                pauseState.pauseTrigger === 'hover' ? 'Hover to explore' :
                pauseState.pauseTrigger === 'touch' ? 'Tap to resume' :
                pauseState.touchMode ? 'Tap to resume' : 'Click to resume'
              }
            </span>
          </div>
        )}

        {/* Touch-friendly controls for touch devices */}
        {pauseState.touchMode && isActive && (showTouchControls || pauseState.isPaused) && (
          <div
            className="touch-controls absolute top-4 right-4 flex space-x-2 z-40"
            style={{
              animation: showTouchControls ? 'slideIn 200ms ease-out' : 'slideOut 200ms ease-out'
            }}
          >
            <button
              className="w-12 h-12 bg-black bg-opacity-70 rounded-full flex items-center justify-center text-white touch-manipulation transition-colors"
              style={{
                minWidth: '44px',
                minHeight: '44px',
                touchAction: 'manipulation'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (pauseState.isPaused) {
                  setPauseState(prev => ({
                    ...prev,
                    isPaused: false,
                    pauseTrigger: 'none',
                    overlayVisible: false
                  }));
                  onPauseToggle(false);
                } else {
                  setPauseState(prev => ({
                    ...prev,
                    isPaused: true,
                    pauseTrigger: 'touch',
                    pauseTimestamp: performance.now(),
                    overlayVisible: true
                  }));
                  onPauseToggle(true);
                  onGlobalPause();
                }
              }}
              aria-label={pauseState.isPaused ? 'Resume animation' : 'Pause animation'}
            >
              {pauseState.isPaused ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {pauseState.isPaused && (
              <button
                className="w-12 h-12 bg-black bg-opacity-70 rounded-full flex items-center justify-center text-white touch-manipulation transition-colors"
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  touchAction: 'manipulation'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPauseState(prev => ({
                    ...prev,
                    overlayVisible: !prev.overlayVisible
                  }));
                }}
                aria-label="Toggle detailed overlay"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Background state indication */}
        {pauseState.isPaused && (
          <div
            className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none z-30"
            style={{
              backdropFilter: 'blur(0.5px)',
              transition: 'all 0.3s ease-out'
            }}
          />
        )}
      </div>

      {/* Detailed overlay */}
      <PauseOverlay
        phase={currentPhase}
        isVisible={pauseState.overlayVisible}
        onClose={() => {
          setPauseState(prev => ({
            ...prev,
            overlayVisible: false,
            isPaused: false,
            pauseTrigger: 'none'
          }));
          onPauseToggle(false);
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        .touch-device .interactive-pause-system {
          /* Ensure touch targets are properly sized */
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }

        .touch-manipulation {
          touch-action: manipulation;
        }
      `}} />
    </>
  );
};

export default InteractivePauseSystem;