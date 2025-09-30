// Hero Section Constants - Extracted from component for better maintainability
// This separates the large data objects from the UI logic

// Volleyball timing phases (8-second cycle) - using athletic tokens
export const VOLLEYBALL_PHASES = [
  { id: 'setup', name: 'Setup', duration: 1500, color: 'var(--athletic-color-neutral-600)' },
  { id: 'anticipation', name: 'Anticipation', duration: 1200, color: 'var(--athletic-color-court-orange)' },
  { id: 'approach', name: 'Approach', duration: 1000, color: 'var(--athletic-color-court-navy)' },
  { id: 'spike', name: 'Spike', duration: 800, color: 'var(--athletic-color-warning)' },
  { id: 'impact', name: 'Impact', duration: 600, color: 'var(--athletic-color-warning)' },
  { id: 'followthrough', name: 'Follow-Through', duration: 900, color: 'var(--athletic-color-success)' }
] as const;

export type VolleyballPhase = typeof VOLLEYBALL_PHASES[number]['id'];

// Architecture diagram states for each phase
export const ARCHITECTURE_STATES = {
  setup: {
    title: 'Planning Phase',
    description: 'Foundational architecture design',
    nodes: [
      { id: 'planning', x: 50, y: 30, type: 'planning', label: 'Requirements' },
      { id: 'design', x: 50, y: 70, type: 'planning', label: 'Design' }
    ],
    connections: []
  },
  anticipation: {
    title: 'Development Prep',
    description: 'System architecture emerges',
    nodes: [
      { id: 'frontend', x: 20, y: 20, type: 'service', label: 'Frontend' },
      { id: 'api', x: 50, y: 50, type: 'gateway', label: 'API Gateway' },
      { id: 'backend', x: 80, y: 20, type: 'service', label: 'Backend' }
    ],
    connections: [{ from: 'frontend', to: 'api' }, { from: 'api', to: 'backend' }]
  },
  approach: {
    title: 'Scaling Architecture',
    description: 'Performance considerations',
    nodes: [
      { id: 'frontend', x: 15, y: 15, type: 'service', label: 'Frontend' },
      { id: 'cdn', x: 15, y: 35, type: 'service', label: 'CDN' },
      { id: 'loadbalancer', x: 50, y: 25, type: 'gateway', label: 'Load Balancer' },
      { id: 'backend1', x: 75, y: 15, type: 'service', label: 'Backend 1' },
      { id: 'backend2', x: 75, y: 35, type: 'service', label: 'Backend 2' },
      { id: 'database', x: 85, y: 60, type: 'database', label: 'Database' }
    ],
    connections: [
      { from: 'frontend', to: 'cdn' },
      { from: 'frontend', to: 'loadbalancer' },
      { from: 'loadbalancer', to: 'backend1' },
      { from: 'loadbalancer', to: 'backend2' },
      { from: 'backend1', to: 'database' },
      { from: 'backend2', to: 'database' }
    ]
  },
  spike: {
    title: 'Real-time Optimization',
    description: 'Maximum performance',
    nodes: [
      { id: 'frontend', x: 10, y: 10, type: 'service', label: 'Frontend' },
      { id: 'cdn', x: 10, y: 30, type: 'service', label: 'CDN' },
      { id: 'cache', x: 30, y: 20, type: 'service', label: 'Redis Cache' },
      { id: 'loadbalancer', x: 50, y: 25, type: 'gateway', label: 'Load Balancer' },
      { id: 'backend1', x: 70, y: 10, type: 'service', label: 'Backend 1' },
      { id: 'backend2', x: 70, y: 25, type: 'service', label: 'Backend 2' },
      { id: 'backend3', x: 70, y: 40, type: 'service', label: 'Backend 3' },
      { id: 'database', x: 85, y: 60, type: 'database', label: 'Database' },
      { id: 'analytics', x: 85, y: 80, type: 'service', label: 'Analytics' }
    ],
    connections: [
      { from: 'frontend', to: 'cdn' },
      { from: 'frontend', to: 'cache' },
      { from: 'cache', to: 'loadbalancer' },
      { from: 'loadbalancer', to: 'backend1' },
      { from: 'loadbalancer', to: 'backend2' },
      { from: 'loadbalancer', to: 'backend3' },
      { from: 'backend1', to: 'database' },
      { from: 'backend2', to: 'database' },
      { from: 'backend3', to: 'database' },
      { from: 'database', to: 'analytics' }
    ]
  },
  impact: {
    title: 'Production Architecture',
    description: 'Maximum clarity and performance',
    nodes: [
      { id: 'frontend', x: 10, y: 10, type: 'service', label: 'Frontend' },
      { id: 'cdn', x: 10, y: 30, type: 'service', label: 'Global CDN' },
      { id: 'cache', x: 30, y: 20, type: 'service', label: 'Redis Cluster' },
      { id: 'loadbalancer', x: 50, y: 25, type: 'gateway', label: 'Load Balancer' },
      { id: 'backend1', x: 70, y: 10, type: 'service', label: 'API Server 1' },
      { id: 'backend2', x: 70, y: 25, type: 'service', label: 'API Server 2' },
      { id: 'backend3', x: 70, y: 40, type: 'service', label: 'API Server 3' },
      { id: 'database', x: 85, y: 55, type: 'database', label: 'PostgreSQL' },
      { id: 'replica', x: 85, y: 70, type: 'database', label: 'Read Replica' },
      { id: 'monitoring', x: 20, y: 80, type: 'service', label: 'Monitoring' },
      { id: 'logging', x: 50, y: 80, type: 'service', label: 'Logging' }
    ],
    connections: [
      { from: 'frontend', to: 'cdn' },
      { from: 'frontend', to: 'cache' },
      { from: 'cache', to: 'loadbalancer' },
      { from: 'loadbalancer', to: 'backend1' },
      { from: 'loadbalancer', to: 'backend2' },
      { from: 'loadbalancer', to: 'backend3' },
      { from: 'backend1', to: 'database' },
      { from: 'backend2', to: 'database' },
      { from: 'backend3', to: 'database' },
      { from: 'database', to: 'replica' },
      { from: 'backend1', to: 'monitoring' },
      { from: 'backend2', to: 'logging' }
    ]
  },
  followthrough: {
    title: 'Continuous Improvement',
    description: 'Monitoring and optimization',
    nodes: [
      { id: 'frontend', x: 10, y: 10, type: 'service', label: 'Frontend' },
      { id: 'cdn', x: 10, y: 30, type: 'service', label: 'Global CDN' },
      { id: 'cache', x: 30, y: 20, type: 'service', label: 'Redis Cluster' },
      { id: 'loadbalancer', x: 50, y: 25, type: 'gateway', label: 'Load Balancer' },
      { id: 'backend1', x: 70, y: 10, type: 'service', label: 'API Server 1' },
      { id: 'backend2', x: 70, y: 25, type: 'service', label: 'API Server 2' },
      { id: 'backend3', x: 70, y: 40, type: 'service', label: 'API Server 3' },
      { id: 'database', x: 85, y: 55, type: 'database', label: 'PostgreSQL' },
      { id: 'replica', x: 85, y: 70, type: 'database', label: 'Read Replica' },
      { id: 'monitoring', x: 15, y: 70, type: 'service', label: 'Grafana' },
      { id: 'logging', x: 35, y: 70, type: 'service', label: 'ELK Stack' },
      { id: 'alerts', x: 55, y: 70, type: 'service', label: 'AlertManager' },
      { id: 'cicd', x: 25, y: 90, type: 'service', label: 'CI/CD Pipeline' }
    ],
    connections: [
      { from: 'frontend', to: 'cdn' },
      { from: 'frontend', to: 'cache' },
      { from: 'cache', to: 'loadbalancer' },
      { from: 'loadbalancer', to: 'backend1' },
      { from: 'loadbalancer', to: 'backend2' },
      { from: 'loadbalancer', to: 'backend3' },
      { from: 'backend1', to: 'database' },
      { from: 'backend2', to: 'database' },
      { from: 'backend3', to: 'database' },
      { from: 'database', to: 'replica' },
      { from: 'backend1', to: 'monitoring' },
      { from: 'backend2', to: 'logging' },
      { from: 'backend3', to: 'alerts' },
      { from: 'monitoring', to: 'cicd' },
      { from: 'logging', to: 'cicd' },
      { from: 'alerts', to: 'cicd' }
    ]
  }
};

// Type exports for components
export interface ArchitectureNode {
  id: string;
  x: number;
  y: number;
  type: 'service' | 'gateway' | 'database' | 'planning';
  label: string;
}

export interface ArchitectureConnection {
  from: string;
  to: string;
}

export interface ArchitectureState {
  title: string;
  description: string;
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
}

// CSS Animation Keyframes - extracted from component
export const HERO_ANIMATIONS = `
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes gentleFloat {
    0%, 100% {
      transform: translateY(0px) translateX(0px);
    }
    25% {
      transform: translateY(-3px) translateX(1px);
    }
    50% {
      transform: translateY(-2px) translateX(-1px);
    }
    75% {
      transform: translateY(-4px) translateX(0.5px);
    }
  }

  @keyframes subtlePulse {
    0%, 100% {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px var(--athletic-color-brand-violet) / 0.1;
    }
    50% {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px var(--athletic-color-brand-violet) / 0.2, 0 0 20px var(--athletic-color-brand-violet) / 0.1;
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 100% 0;
    }
  }

  @keyframes breathe {
    0%, 100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.05);
    }
  }

  /* Athletic timing integration */
  .hero-fade-in {
    animation: fadeInUp var(--athletic-timing-sequence) var(--athletic-easing-precision) forwards;
  }

  .hero-gentle-float {
    animation: gentleFloat var(--athletic-timing-flow) var(--athletic-easing-glide) infinite;
  }

  .hero-breathe {
    animation: breathe var(--athletic-timing-power) var(--athletic-easing-flow) infinite;
  }
`;