import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VolleyballPhase } from '../../hooks/useVolleyballTiming';
import MorphingTransition from '../effects/MorphingTransition';

export interface LeftViewportProps {
  currentPhase: VolleyballPhase;
  phaseProgress: number;
  isPlaying: boolean;
  morphingProgress?: number;
  onReferencePointHover?: (pointId: string) => void;
  className?: string;
}

export interface ArchitectureDiagram {
  phase: VolleyballPhase;
  title: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'production';
  components: ArchitectureComponent[];
  connections: Connection[];
  visualStyle: VisualStyle;
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  type: 'service' | 'database' | 'cache' | 'queue' | 'api' | 'frontend' | 'monitoring';
  position: { x: number; y: number };
  size: { width: number; height: number };
  status: 'planning' | 'building' | 'optimizing' | 'production' | 'monitoring';
  importance: number; // 0-1, affects visual prominence
  technicalDetails?: string[];
}

export interface Connection {
  from: string;
  to: string;
  type: 'data-flow' | 'api-call' | 'event' | 'monitoring';
  strength: number; // 0-1, affects line thickness
  latency?: number; // milliseconds
  throughput?: string; // e.g., "1000 req/s"
}

export interface VisualStyle {
  primaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  nodeOpacity: number;
  connectionOpacity: number;
  scale: number;
  intensity: number; // 0-1, overall visual intensity
}

// Architecture diagrams for each phase
const ARCHITECTURE_DIAGRAMS: Record<VolleyballPhase, ArchitectureDiagram> = {
  setup: {
    phase: 'setup',
    title: 'Foundation Architecture',
    complexity: 'basic',
    components: [
      {
        id: 'frontend',
        name: 'React Frontend',
        type: 'frontend',
        position: { x: 20, y: 30 },
        size: { width: 25, height: 15 },
        status: 'planning',
        importance: 0.8,
        technicalDetails: ['Next.js 14', 'TypeScript', 'Tailwind CSS']
      },
      {
        id: 'api',
        name: 'REST API',
        type: 'api',
        position: { x: 55, y: 30 },
        size: { width: 25, height: 15 },
        status: 'planning',
        importance: 0.9,
        technicalDetails: ['Node.js', 'Express', 'OpenAPI']
      },
      {
        id: 'database',
        name: 'PostgreSQL',
        type: 'database',
        position: { x: 55, y: 60 },
        size: { width: 25, height: 15 },
        status: 'planning',
        importance: 0.7,
        technicalDetails: ['Relational DB', 'ACID compliant']
      }
    ],
    connections: [
      { from: 'frontend', to: 'api', type: 'api-call', strength: 0.6 },
      { from: 'api', to: 'database', type: 'data-flow', strength: 0.7 }
    ],
    visualStyle: {
      primaryColor: '#3b82f6',
      accentColor: '#8b5cf6',
      backgroundGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      nodeOpacity: 0.8,
      connectionOpacity: 0.6,
      scale: 1.0,
      intensity: 0.2
    }
  },
  anticipation: {
    phase: 'anticipation',
    title: 'Scaling Considerations',
    complexity: 'intermediate',
    components: [
      {
        id: 'frontend',
        name: 'React Frontend',
        type: 'frontend',
        position: { x: 15, y: 25 },
        size: { width: 25, height: 15 },
        status: 'building',
        importance: 0.8,
        technicalDetails: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'State Management']
      },
      {
        id: 'api-gateway',
        name: 'API Gateway',
        type: 'api',
        position: { x: 50, y: 20 },
        size: { width: 25, height: 12 },
        status: 'building',
        importance: 0.9,
        technicalDetails: ['Rate Limiting', 'Authentication', 'Load Balancing']
      },
      {
        id: 'service-1',
        name: 'User Service',
        type: 'service',
        position: { x: 30, y: 45 },
        size: { width: 20, height: 12 },
        status: 'building',
        importance: 0.7,
        technicalDetails: ['Microservice', 'REST API']
      },
      {
        id: 'service-2',
        name: 'Content Service',
        type: 'service',
        position: { x: 60, y: 45 },
        size: { width: 20, height: 12 },
        status: 'building',
        importance: 0.7,
        technicalDetails: ['Microservice', 'GraphQL']
      },
      {
        id: 'cache',
        name: 'Redis Cache',
        type: 'cache',
        position: { x: 75, y: 25 },
        size: { width: 20, height: 12 },
        status: 'planning',
        importance: 0.6,
        technicalDetails: ['In-memory', 'Session store']
      },
      {
        id: 'database',
        name: 'PostgreSQL',
        type: 'database',
        position: { x: 45, y: 70 },
        size: { width: 25, height: 15 },
        status: 'building',
        importance: 0.8,
        technicalDetails: ['Relational DB', 'ACID compliant', 'Connection pooling']
      }
    ],
    connections: [
      { from: 'frontend', to: 'api-gateway', type: 'api-call', strength: 0.8 },
      { from: 'api-gateway', to: 'service-1', type: 'api-call', strength: 0.7 },
      { from: 'api-gateway', to: 'service-2', type: 'api-call', strength: 0.7 },
      { from: 'api-gateway', to: 'cache', type: 'data-flow', strength: 0.5 },
      { from: 'service-1', to: 'database', type: 'data-flow', strength: 0.8 },
      { from: 'service-2', to: 'database', type: 'data-flow', strength: 0.8 }
    ],
    visualStyle: {
      primaryColor: '#3b82f6',
      accentColor: '#ec4899',
      backgroundGradient: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%)',
      nodeOpacity: 0.85,
      connectionOpacity: 0.7,
      scale: 1.02,
      intensity: 0.4
    }
  },
  approach: {
    phase: 'approach',
    title: 'Performance Architecture',
    complexity: 'advanced',
    components: [
      {
        id: 'cdn',
        name: 'CDN',
        type: 'frontend',
        position: { x: 10, y: 15 },
        size: { width: 15, height: 10 },
        status: 'optimizing',
        importance: 0.7,
        technicalDetails: ['Global distribution', 'Edge caching']
      },
      {
        id: 'frontend',
        name: 'React Frontend',
        type: 'frontend',
        position: { x: 15, y: 30 },
        size: { width: 25, height: 15 },
        status: 'optimizing',
        importance: 0.9,
        technicalDetails: ['Next.js 14', 'SSR/SSG', 'Code splitting', 'Performance optimized']
      },
      {
        id: 'load-balancer',
        name: 'Load Balancer',
        type: 'api',
        position: { x: 50, y: 15 },
        size: { width: 20, height: 10 },
        status: 'optimizing',
        importance: 0.8,
        technicalDetails: ['Auto-scaling', 'Health checks']
      },
      {
        id: 'api-cluster',
        name: 'API Cluster',
        type: 'api',
        position: { x: 45, y: 30 },
        size: { width: 30, height: 15 },
        status: 'optimizing',
        importance: 1.0,
        technicalDetails: ['Horizontal scaling', 'Container orchestration']
      },
      {
        id: 'service-mesh',
        name: 'Service Mesh',
        type: 'service',
        position: { x: 35, y: 50 },
        size: { width: 35, height: 20 },
        status: 'optimizing',
        importance: 0.8,
        technicalDetails: ['Istio', 'Service discovery', 'Circuit breakers']
      },
      {
        id: 'cache-cluster',
        name: 'Redis Cluster',
        type: 'cache',
        position: { x: 75, y: 35 },
        size: { width: 20, height: 15 },
        status: 'optimizing',
        importance: 0.7,
        technicalDetails: ['Distributed cache', 'High availability']
      },
      {
        id: 'message-queue',
        name: 'Message Queue',
        type: 'queue',
        position: { x: 75, y: 55 },
        size: { width: 20, height: 12 },
        status: 'optimizing',
        importance: 0.6,
        technicalDetails: ['Apache Kafka', 'Event streaming']
      },
      {
        id: 'database-cluster',
        name: 'DB Cluster',
        type: 'database',
        position: { x: 40, y: 75 },
        size: { width: 30, height: 15 },
        status: 'optimizing',
        importance: 0.9,
        technicalDetails: ['Read replicas', 'Sharding', 'Backup strategy']
      }
    ],
    connections: [
      { from: 'frontend', to: 'cdn', type: 'data-flow', strength: 0.6 },
      { from: 'frontend', to: 'load-balancer', type: 'api-call', strength: 0.9 },
      { from: 'load-balancer', to: 'api-cluster', type: 'data-flow', strength: 0.9 },
      { from: 'api-cluster', to: 'service-mesh', type: 'api-call', strength: 1.0 },
      { from: 'api-cluster', to: 'cache-cluster', type: 'data-flow', strength: 0.8 },
      { from: 'service-mesh', to: 'message-queue', type: 'event', strength: 0.6 },
      { from: 'service-mesh', to: 'database-cluster', type: 'data-flow', strength: 0.9 }
    ],
    visualStyle: {
      primaryColor: '#059669',
      accentColor: '#dc2626',
      backgroundGradient: 'linear-gradient(135deg, #ecfdf5 0%, #fef2f2 100%)',
      nodeOpacity: 0.9,
      connectionOpacity: 0.8,
      scale: 1.05,
      intensity: 0.6
    }
  },
  spike: {
    phase: 'spike',
    title: 'Real-time Optimization',
    complexity: 'production',
    components: [
      {
        id: 'edge-computing',
        name: 'Edge Computing',
        type: 'frontend',
        position: { x: 5, y: 10 },
        size: { width: 18, height: 12 },
        status: 'production',
        importance: 0.8,
        technicalDetails: ['Edge functions', 'Real-time processing']
      },
      {
        id: 'frontend-optimized',
        name: 'Optimized Frontend',
        type: 'frontend',
        position: { x: 15, y: 25 },
        size: { width: 25, height: 15 },
        status: 'production',
        importance: 1.0,
        technicalDetails: ['Sub-second loading', 'Prefetching', 'Service workers']
      },
      {
        id: 'intelligent-routing',
        name: 'Intelligent Router',
        type: 'api',
        position: { x: 45, y: 20 },
        size: { width: 22, height: 12 },
        status: 'production',
        importance: 0.9,
        technicalDetails: ['ML-based routing', 'Predictive scaling']
      },
      {
        id: 'high-performance-api',
        name: 'High-Perf API',
        type: 'api',
        position: { x: 40, y: 35 },
        size: { width: 30, height: 18 },
        status: 'production',
        importance: 1.0,
        technicalDetails: ['Sub-10ms response', 'Auto-scaling', 'Hot paths optimized']
      },
      {
        id: 'real-time-processing',
        name: 'Stream Processing',
        type: 'service',
        position: { x: 30, y: 58 },
        size: { width: 35, height: 20 },
        status: 'production',
        importance: 0.9,
        technicalDetails: ['Apache Kafka', 'Real-time analytics', 'Event sourcing']
      },
      {
        id: 'performance-cache',
        name: 'Perf Cache',
        type: 'cache',
        position: { x: 72, y: 30 },
        size: { width: 20, height: 15 },
        status: 'production',
        importance: 0.8,
        technicalDetails: ['Multi-layer caching', 'Predictive prefetch']
      },
      {
        id: 'optimized-storage',
        name: 'Optimized Storage',
        type: 'database',
        position: { x: 35, y: 82 },
        size: { width: 30, height: 15 },
        status: 'production',
        importance: 0.9,
        technicalDetails: ['Columnar storage', 'In-memory indexes', 'Query optimization']
      }
    ],
    connections: [
      { from: 'frontend-optimized', to: 'edge-computing', type: 'data-flow', strength: 0.8 },
      { from: 'frontend-optimized', to: 'intelligent-routing', type: 'api-call', strength: 1.0 },
      { from: 'intelligent-routing', to: 'high-performance-api', type: 'data-flow', strength: 1.0 },
      { from: 'high-performance-api', to: 'performance-cache', type: 'data-flow', strength: 0.9 },
      { from: 'high-performance-api', to: 'real-time-processing', type: 'event', strength: 0.8 },
      { from: 'real-time-processing', to: 'optimized-storage', type: 'data-flow', strength: 1.0 }
    ],
    visualStyle: {
      primaryColor: '#dc2626',
      accentColor: '#f59e0b',
      backgroundGradient: 'linear-gradient(135deg, #fef2f2 0%, #fffbeb 100%)',
      nodeOpacity: 0.95,
      connectionOpacity: 0.9,
      scale: 1.08,
      intensity: 0.8
    }
  },
  impact: {
    phase: 'impact',
    title: 'Production Excellence',
    complexity: 'production',
    components: [
      {
        id: 'global-cdn',
        name: 'Global CDN',
        type: 'frontend',
        position: { x: 5, y: 8 },
        size: { width: 20, height: 12 },
        status: 'production',
        importance: 1.0,
        technicalDetails: ['99.9% uptime', 'Global edge presence', 'Smart caching']
      },
      {
        id: 'production-frontend',
        name: 'Production Frontend',
        type: 'frontend',
        position: { x: 12, y: 22 },
        size: { width: 28, height: 18 },
        status: 'production',
        importance: 1.0,
        technicalDetails: ['Core Web Vitals optimized', 'Accessibility AAA', 'SEO optimized']
      },
      {
        id: 'enterprise-gateway',
        name: 'Enterprise Gateway',
        type: 'api',
        position: { x: 42, y: 18 },
        size: { width: 25, height: 15 },
        status: 'production',
        importance: 1.0,
        technicalDetails: ['Enterprise security', 'API versioning', 'Rate limiting']
      },
      {
        id: 'production-api',
        name: 'Production API',
        type: 'api',
        position: { x: 35, y: 38 },
        size: { width: 35, height: 22 },
        status: 'production',
        importance: 1.0,
        technicalDetails: ['5-9s availability', 'Auto-healing', 'Zero-downtime deploys']
      },
      {
        id: 'enterprise-services',
        name: 'Enterprise Services',
        type: 'service',
        position: { x: 25, y: 65 },
        size: { width: 40, height: 25 },
        status: 'production',
        importance: 1.0,
        technicalDetails: ['Fault tolerance', 'Circuit breakers', 'Distributed tracing']
      },
      {
        id: 'production-cache',
        name: 'Production Cache',
        type: 'cache',
        position: { x: 70, y: 35 },
        size: { width: 22, height: 18 },
        status: 'production',
        importance: 0.9,
        technicalDetails: ['Multi-region replication', 'Intelligent prefetching']
      },
      {
        id: 'production-storage',
        name: 'Production Storage',
        type: 'database',
        position: { x: 30, y: 92 },
        size: { width: 35, height: 18 },
        status: 'production',
        importance: 1.0,
        technicalDetails: ['ACID guarantees', 'Point-in-time recovery', 'Automated backups']
      },
      {
        id: 'monitoring-suite',
        name: 'Monitoring Suite',
        type: 'monitoring',
        position: { x: 75, y: 65 },
        size: { width: 20, height: 25 },
        status: 'production',
        importance: 0.8,
        technicalDetails: ['Real-time dashboards', 'Predictive alerts', 'Performance insights']
      }
    ],
    connections: [
      { from: 'production-frontend', to: 'global-cdn', type: 'data-flow', strength: 1.0 },
      { from: 'production-frontend', to: 'enterprise-gateway', type: 'api-call', strength: 1.0 },
      { from: 'enterprise-gateway', to: 'production-api', type: 'data-flow', strength: 1.0 },
      { from: 'production-api', to: 'production-cache', type: 'data-flow', strength: 0.9 },
      { from: 'production-api', to: 'enterprise-services', type: 'api-call', strength: 1.0 },
      { from: 'enterprise-services', to: 'production-storage', type: 'data-flow', strength: 1.0 },
      { from: 'production-api', to: 'monitoring-suite', type: 'monitoring', strength: 0.8 },
      { from: 'enterprise-services', to: 'monitoring-suite', type: 'monitoring', strength: 0.8 },
      { from: 'production-storage', to: 'monitoring-suite', type: 'monitoring', strength: 0.7 }
    ],
    visualStyle: {
      primaryColor: '#7c3aed',
      accentColor: '#06b6d4',
      backgroundGradient: 'linear-gradient(135deg, #f3e8ff 0%, #cffafe 100%)',
      nodeOpacity: 1.0,
      connectionOpacity: 1.0,
      scale: 1.1,
      intensity: 1.0
    }
  },
  'follow-through': {
    phase: 'follow-through',
    title: 'Continuous Excellence',
    complexity: 'production',
    components: [
      {
        id: 'intelligent-monitoring',
        name: 'Intelligent Monitoring',
        type: 'monitoring',
        position: { x: 10, y: 15 },
        size: { width: 30, height: 20 },
        status: 'monitoring',
        importance: 0.9,
        technicalDetails: ['AI-powered alerts', 'Anomaly detection', 'Predictive maintenance']
      },
      {
        id: 'adaptive-frontend',
        name: 'Adaptive Frontend',
        type: 'frontend',
        position: { x: 15, y: 40 },
        size: { width: 25, height: 18 },
        status: 'monitoring',
        importance: 0.8,
        technicalDetails: ['A/B testing', 'Feature flags', 'Performance tracking']
      },
      {
        id: 'self-healing-api',
        name: 'Self-Healing API',
        type: 'api',
        position: { x: 45, y: 35 },
        size: { width: 30, height: 20 },
        status: 'monitoring',
        importance: 0.9,
        technicalDetails: ['Auto-recovery', 'Capacity planning', 'Performance tuning']
      },
      {
        id: 'analytics-engine',
        name: 'Analytics Engine',
        type: 'service',
        position: { x: 25, y: 65 },
        size: { width: 35, height: 20 },
        status: 'monitoring',
        importance: 0.7,
        technicalDetails: ['Real-time insights', 'Business intelligence', 'ML recommendations']
      },
      {
        id: 'optimization-cache',
        name: 'Smart Cache',
        type: 'cache',
        position: { x: 70, y: 50 },
        size: { width: 22, height: 15 },
        status: 'monitoring',
        importance: 0.6,
        technicalDetails: ['Learning algorithms', 'Predictive caching']
      },
      {
        id: 'continuous-storage',
        name: 'Evolving Storage',
        type: 'database',
        position: { x: 30, y: 88 },
        size: { width: 35, height: 15 },
        status: 'monitoring',
        importance: 0.8,
        technicalDetails: ['Schema evolution', 'Performance optimization', 'Cost optimization']
      }
    ],
    connections: [
      { from: 'adaptive-frontend', to: 'intelligent-monitoring', type: 'monitoring', strength: 0.8 },
      { from: 'adaptive-frontend', to: 'self-healing-api', type: 'api-call', strength: 0.8 },
      { from: 'self-healing-api', to: 'intelligent-monitoring', type: 'monitoring', strength: 0.9 },
      { from: 'self-healing-api', to: 'optimization-cache', type: 'data-flow', strength: 0.7 },
      { from: 'self-healing-api', to: 'analytics-engine', type: 'event', strength: 0.6 },
      { from: 'analytics-engine', to: 'continuous-storage', type: 'data-flow', strength: 0.8 },
      { from: 'analytics-engine', to: 'intelligent-monitoring', type: 'monitoring', strength: 0.7 }
    ],
    visualStyle: {
      primaryColor: '#059669',
      accentColor: '#8b5cf6',
      backgroundGradient: 'linear-gradient(135deg, #ecfdf5 0%, #f3f4f6 100%)',
      nodeOpacity: 0.9,
      connectionOpacity: 0.7,
      scale: 1.03,
      intensity: 0.35
    }
  }
};

export const LeftViewport: React.FC<LeftViewportProps> = ({
  currentPhase,
  phaseProgress,
  isPlaying,
  morphingProgress = 0,
  onReferencePointHover,
  className = ''
}) => {
  const [isInteractive, setIsInteractive] = useState(false);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const currentDiagram = useMemo(() => ARCHITECTURE_DIAGRAMS[currentPhase], [currentPhase]);

  const handleComponentHover = useCallback((componentId: string | null) => {
    setHoveredComponent(componentId);
    if (componentId && onReferencePointHover) {
      onReferencePointHover(componentId);
    }
  }, [onReferencePointHover]);

  const handleComponentClick = useCallback((componentId: string) => {
    setSelectedComponent(selectedComponent === componentId ? null : componentId);
  }, [selectedComponent]);

  const renderArchitectureComponent = useCallback((component: ArchitectureComponent) => {
    const isHovered = hoveredComponent === component.id;
    const isSelected = selectedComponent === component.id;
    const intensity = currentDiagram.visualStyle.intensity;

    // Calculate dynamic styles based on phase intensity and component importance
    const opacity = currentDiagram.visualStyle.nodeOpacity * (0.7 + component.importance * 0.3);
    const scale = currentDiagram.visualStyle.scale * (0.95 + component.importance * 0.1);
    const glowIntensity = intensity * component.importance;

    const getStatusColor = (status: ArchitectureComponent['status']) => {
      switch (status) {
        case 'planning': return '#64748b';
        case 'building': return '#3b82f6';
        case 'optimizing': return '#f59e0b';
        case 'production': return '#059669';
        case 'monitoring': return '#8b5cf6';
        default: return '#64748b';
      }
    };

    const getTypeIcon = (type: ArchitectureComponent['type']) => {
      const icons = {
        service: '⚙️',
        database: '🗄️',
        cache: '⚡',
        queue: '📮',
        api: '🔗',
        frontend: '🖥️',
        monitoring: '📊'
      };
      return icons[type] || '📦';
    };

    return (
      <div
        key={component.id}
        className="architecture-component absolute cursor-pointer transition-all duration-300"
        style={{
          left: `${component.position.x}%`,
          top: `${component.position.y}%`,
          width: `${component.size.width}%`,
          height: `${component.size.height}%`,
          transform: `scale(${scale}) ${isHovered || isSelected ? 'scale(1.1)' : ''}`,
          zIndex: isHovered || isSelected ? 10 : 1
        }}
        onMouseEnter={() => handleComponentHover(component.id)}
        onMouseLeave={() => handleComponentHover(null)}
        onClick={() => handleComponentClick(component.id)}
      >
        {/* Component node */}
        <div
          className="component-node w-full h-full rounded-lg border-2 flex flex-col items-center justify-center text-center p-2 transition-all duration-300"
          style={{
            backgroundColor: `${currentDiagram.visualStyle.primaryColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
            borderColor: getStatusColor(component.status),
            boxShadow: `0 4px 12px rgba(139, 92, 246, ${glowIntensity * 0.3}),
                       0 0 ${glowIntensity * 20}px rgba(139, 92, 246, ${glowIntensity * 0.2})`,
            filter: isHovered ? `brightness(1.2) contrast(1.1)` : `brightness(1) contrast(1)`
          }}
        >
          {/* Component icon */}
          <div className="text-lg mb-1" style={{ opacity: 0.8 + component.importance * 0.2 }}>
            {getTypeIcon(component.type)}
          </div>

          {/* Component name */}
          <div
            className="text-xs font-semibold leading-tight"
            style={{
              color: '#ffffff',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}
          >
            {component.name}
          </div>

          {/* Status indicator */}
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white"
            style={{ backgroundColor: getStatusColor(component.status) }}
          />

          {/* Importance indicator */}
          <div
            className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-yellow-400"
            style={{
              opacity: component.importance,
              display: component.importance > 0.8 ? 'block' : 'none'
            }}
          />
        </div>

        {/* Technical details tooltip */}
        {(isHovered || isSelected) && component.technicalDetails && (
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black text-white text-xs p-2 rounded shadow-lg z-20 whitespace-nowrap"
            style={{ minWidth: '120px' }}
          >
            <div className="font-semibold mb-1">{component.name}</div>
            {component.technicalDetails.map((detail, index) => (
              <div key={index} className="opacity-80">• {detail}</div>
            ))}
          </div>
        )}
      </div>
    );
  }, [hoveredComponent, selectedComponent, currentDiagram, handleComponentHover, handleComponentClick]);

  const renderConnections = useCallback(() => {
    return currentDiagram.connections.map((connection, index) => {
      const fromComponent = currentDiagram.components.find(c => c.id === connection.from);
      const toComponent = currentDiagram.components.find(c => c.id === connection.to);

      if (!fromComponent || !toComponent) return null;

      const fromX = fromComponent.position.x + fromComponent.size.width / 2;
      const fromY = fromComponent.position.y + fromComponent.size.height / 2;
      const toX = toComponent.position.x + toComponent.size.width / 2;
      const toY = toComponent.position.y + toComponent.size.height / 2;

      const intensity = currentDiagram.visualStyle.intensity;
      const opacity = currentDiagram.visualStyle.connectionOpacity * connection.strength;

      const getConnectionColor = (type: Connection['type']) => {
        switch (type) {
          case 'data-flow': return currentDiagram.visualStyle.primaryColor;
          case 'api-call': return currentDiagram.visualStyle.accentColor;
          case 'event': return '#f59e0b';
          case 'monitoring': return '#8b5cf6';
          default: return currentDiagram.visualStyle.primaryColor;
        }
      };

      return (
        <svg
          key={`connection-${index}`}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <marker
              id={`arrowhead-${index}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill={getConnectionColor(connection.type)}
                opacity={opacity}
              />
            </marker>
          </defs>
          <line
            x1={`${fromX}%`}
            y1={`${fromY}%`}
            x2={`${toX}%`}
            y2={`${toY}%`}
            stroke={getConnectionColor(connection.type)}
            strokeWidth={2 + connection.strength * 2 + intensity}
            strokeOpacity={opacity}
            markerEnd={`url(#arrowhead-${index})`}
            strokeDasharray={connection.type === 'event' ? '5,5' : 'none'}
          />
        </svg>
      );
    });
  }, [currentDiagram]);

  return (
    <MorphingTransition
      fromPhase={currentPhase}
      toPhase={currentPhase}
      progress={morphingProgress}
      className={`left-viewport architecture-viewport ${className}`}
    >
      <div
        className="w-full h-full relative overflow-hidden"
        style={{
          background: currentDiagram.visualStyle.backgroundGradient,
          transition: 'background 0.6s ease-out'
        }}
        onMouseEnter={() => setIsInteractive(true)}
        onMouseLeave={() => setIsInteractive(false)}
      >
        {/* Architecture diagram title */}
        <div
          className="absolute top-4 left-4 z-10 text-2xl font-bold text-gray-800 transition-all duration-300"
          style={{
            opacity: 0.8 + currentDiagram.visualStyle.intensity * 0.2,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {currentDiagram.title}
        </div>

        {/* Complexity indicator */}
        <div
          className="absolute top-4 right-4 z-10 text-sm font-medium px-4 py-1 rounded-full bg-white bg-opacity-80"
          style={{ color: currentDiagram.visualStyle.primaryColor }}
        >
          {currentDiagram.complexity.charAt(0).toUpperCase() + currentDiagram.complexity.slice(1)}
        </div>

        {/* Connection layer */}
        <div className="absolute inset-0">
          {renderConnections()}
        </div>

        {/* Components layer */}
        <div className="absolute inset-0">
          {currentDiagram.components.map(renderArchitectureComponent)}
        </div>

        {/* Interactive overlay */}
        {isInteractive && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 70%)`,
              opacity: 0.5
            }}
          />
        )}

        {/* Development debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white bg-opacity-75 p-2 rounded">
            <div>Phase: {currentPhase}</div>
            <div>Progress: {Math.round(phaseProgress * 100)}%</div>
            <div>Components: {currentDiagram.components.length}</div>
            <div>Intensity: {currentDiagram.visualStyle.intensity}</div>
            {hoveredComponent && <div>Hovered: {hoveredComponent}</div>}
          </div>
        )}
      </div>
    </MorphingTransition>
  );
};

export default LeftViewport;