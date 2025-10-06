/**
 * Generate Skill Embeddings (Build-time)
 *
 * Creates embeddings for all of Nino's skills, projects, and experience.
 * Enables semantic search: "event-driven microservices" → finds relevant projects
 *
 * Output: src/data/skillEmbeddings.json (~200KB)
 * Runtime cost: $0.0001 per search (embedding query only)
 *
 * @fileoverview Build-time embedding generator for skill matching
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';

interface SkillEmbedding {
  id: string;
  text: string;
  embedding: number[];
  category: 'project' | 'skill' | 'experience' | 'achievement';
  section: string;
  tags: string[];
}

/**
 * Mock embedding generation (for development without API key)
 * In production, replace with actual Gemini embeddings-001 API calls
 */
function generateMockEmbedding(text: string): number[] {
  // Simple deterministic hash-based embedding for development
  // This creates a 768-dimensional vector (matching Gemini embedding size)
  const embedding: number[] = [];
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate pseudo-random but deterministic embedding
  const seed = Math.abs(hash);
  let currentSeed = seed;

  for (let i = 0; i < 768; i++) {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    embedding.push((currentSeed / 0x7fffffff) * 2 - 1); // Normalize to [-1, 1]
  }

  return embedding;
}

/**
 * All content to embed (comprehensive coverage of Nino's experience)
 */
const contentItems: Omit<SkillEmbedding, 'embedding'>[] = [
  // === PROJECTS ===
  {
    id: 'pmt-platform',
    text: 'Enterprise payer management platform with event-driven architecture, microservices, and real-time processing. Built with TypeScript, NestJS, PostgreSQL, Redis, RabbitMQ on Kubernetes. Handles 1M+ transactions per day with 99.9% uptime.',
    category: 'project',
    section: 'develop',
    tags: ['enterprise', 'event-driven', 'microservices', 'typescript', 'nestjs', 'kubernetes']
  },
  {
    id: 'portfolio-canvas',
    text: '2D spatial canvas with GPU-accelerated pan and zoom, similar to Figma and Miro. Built with React 19, TypeScript, and custom RAF scheduler for 60fps performance. Features momentum scrolling, minimap navigation, and progressive loading.',
    category: 'project',
    section: 'portfolio',
    tags: ['react', 'typescript', 'performance', 'canvas', 'gpu-acceleration', 'ux']
  },
  {
    id: 'healthcare-integration',
    text: 'HIPAA-compliant healthcare data integration system processing 500K records per hour. Implements HL7 and FHIR standards for 20+ healthcare providers. Real-time data pipeline with Apache Kafka, Node.js, PostgreSQL, AWS Lambda.',
    category: 'project',
    section: 'develop',
    tags: ['healthcare', 'hipaa', 'hl7', 'fhir', 'kafka', 'aws', 'real-time']
  },
  {
    id: 'financial-dashboard',
    text: 'Real-time financial analytics dashboard for $2B+ assets under management. React TypeScript application with D3.js visualizations, WebSocket connections, Redis caching. Optimized from 8s load time to 1.2s. WCAG 2.1 AA accessible.',
    category: 'project',
    section: 'develop',
    tags: ['react', 'typescript', 'd3', 'websocket', 'performance', 'accessibility']
  },

  // === TECHNICAL SKILLS ===
  {
    id: 'skill-react',
    text: 'Expert in React and React 19, including hooks, context, suspense, concurrent rendering, and server components. Deep understanding of performance optimization, code splitting, and modern React patterns.',
    category: 'skill',
    section: 'exposure',
    tags: ['react', 'javascript', 'frontend', 'ui']
  },
  {
    id: 'skill-typescript',
    text: 'Advanced TypeScript development with strong typing, generics, utility types, and type-safe patterns. Experience with large TypeScript codebases, strict mode, and compiler optimization.',
    category: 'skill',
    section: 'exposure',
    tags: ['typescript', 'javascript', 'type-safety']
  },
  {
    id: 'skill-architecture',
    text: 'Enterprise architecture expertise including domain-driven design, event-driven architecture, CQRS, hexagonal architecture, and microservices patterns. Led architectural decision records and technical design reviews.',
    category: 'skill',
    section: 'frame',
    tags: ['architecture', 'ddd', 'event-driven', 'microservices', 'enterprise']
  },
  {
    id: 'skill-nodejs',
    text: 'Full-stack Node.js development with Express, NestJS, and modern async patterns. Experience with event loops, streams, clustering, and production-grade Node.js applications.',
    category: 'skill',
    section: 'exposure',
    tags: ['nodejs', 'backend', 'javascript', 'api']
  },
  {
    id: 'skill-databases',
    text: 'Database design and optimization for PostgreSQL, MongoDB, and Redis. Experience with query optimization, indexing strategies, connection pooling, and database migrations.',
    category: 'skill',
    section: 'exposure',
    tags: ['postgresql', 'mongodb', 'redis', 'databases', 'sql']
  },
  {
    id: 'skill-cloud',
    text: 'Cloud infrastructure on AWS and Azure including Lambda, ECS, S3, CloudFront, RDS, and serverless architectures. Experience with infrastructure as code, CI/CD pipelines, and cloud cost optimization.',
    category: 'skill',
    section: 'exposure',
    tags: ['aws', 'azure', 'cloud', 'devops', 'serverless']
  },
  {
    id: 'skill-docker-k8s',
    text: 'Container orchestration with Docker and Kubernetes. Experience with Helm charts, deployment strategies, service meshes, and production Kubernetes clusters.',
    category: 'skill',
    section: 'exposure',
    tags: ['docker', 'kubernetes', 'containers', 'devops']
  },
  {
    id: 'skill-testing',
    text: 'Comprehensive testing strategies with Vitest, Jest, Playwright, and Storybook. Expertise in unit testing, integration testing, E2E testing, visual regression, and TDD/BDD practices.',
    category: 'skill',
    section: 'exposure',
    tags: ['testing', 'vitest', 'playwright', 'jest', 'tdd']
  },

  // === ACHIEVEMENTS ===
  {
    id: 'achievement-performance',
    text: 'Optimized React application performance from 8 second load time to 1.2 seconds through code splitting, lazy loading, memoization, and bundle optimization.',
    category: 'achievement',
    section: 'develop',
    tags: ['performance', 'optimization', 'react']
  },
  {
    id: 'achievement-scale',
    text: 'Architected system handling 1 million+ transactions per day with 99.9% uptime. Implemented horizontal scaling, caching strategies, and async processing patterns.',
    category: 'achievement',
    section: 'develop',
    tags: ['scale', 'architecture', 'reliability']
  },
  {
    id: 'achievement-leadership',
    text: 'Led team of 8 engineers, mentored 15+ junior developers, and established coding standards that increased test coverage from 40% to 95%.',
    category: 'achievement',
    section: 'focus',
    tags: ['leadership', 'mentoring', 'team']
  },
  {
    id: 'achievement-security',
    text: 'Implemented HIPAA-compliant architecture with audit logging, encryption at rest and in transit, role-based access control, and security scanning in CI/CD pipeline.',
    category: 'achievement',
    section: 'develop',
    tags: ['security', 'hipaa', 'compliance']
  },

  // === SPECIFIC EXPERIENCE ===
  {
    id: 'exp-event-driven',
    text: 'Event-driven microservices architecture using RabbitMQ, Apache Kafka, and event sourcing patterns. Implemented CQRS with separate read and write models.',
    category: 'experience',
    section: 'develop',
    tags: ['event-driven', 'kafka', 'rabbitmq', 'cqrs', 'microservices']
  },
  {
    id: 'exp-real-time',
    text: 'Real-time data pipelines and WebSocket implementations for live dashboards. Experience with server-sent events, long polling, and pub/sub patterns.',
    category: 'experience',
    section: 'develop',
    tags: ['real-time', 'websocket', 'streaming']
  },
  {
    id: 'exp-accessibility',
    text: 'WCAG 2.1 AA accessibility implementation including keyboard navigation, screen reader support, ARIA labels, and automated accessibility testing with axe-core.',
    category: 'experience',
    section: 'develop',
    tags: ['accessibility', 'wcag', 'a11y', 'inclusive-design']
  },
  {
    id: 'exp-ci-cd',
    text: 'CI/CD pipeline design with GitHub Actions, automated testing, code coverage reporting, security scanning, and blue-green deployments.',
    category: 'experience',
    section: 'develop',
    tags: ['ci-cd', 'devops', 'automation', 'github-actions']
  },
  {
    id: 'exp-photography',
    text: 'Professional action sports photography including skydiving, mountain biking, and extreme sports. Expert in composition, lighting, timing, and post-processing.',
    category: 'experience',
    section: 'capture',
    tags: ['photography', 'action-sports', 'visual', 'creative']
  },

  // === ARCHITECTURE PATTERNS ===
  {
    id: 'pattern-ddd',
    text: 'Domain-driven design with bounded contexts, aggregates, entities, value objects, and domain events. Strategic and tactical DDD patterns in production systems.',
    category: 'experience',
    section: 'frame',
    tags: ['ddd', 'architecture', 'design-patterns']
  },
  {
    id: 'pattern-hexagonal',
    text: 'Hexagonal architecture (ports and adapters) with clean separation of business logic from infrastructure concerns. Dependency inversion and interface-based design.',
    category: 'experience',
    section: 'frame',
    tags: ['hexagonal', 'architecture', 'clean-architecture']
  },
  {
    id: 'pattern-cqrs',
    text: 'Command Query Responsibility Segregation with separate read and write models. Event sourcing and eventual consistency patterns.',
    category: 'experience',
    section: 'frame',
    tags: ['cqrs', 'event-sourcing', 'architecture']
  },
];

/**
 * Generate embeddings for all content
 */
async function generateSkillEmbeddings() {
  console.log('🧠 Generating skill embeddings...');
  console.log(`📝 Processing ${contentItems.length} content items`);

  const embeddings: SkillEmbedding[] = contentItems.map((item, index) => {
    const embedding = generateMockEmbedding(item.text);

    if (index % 5 === 0) {
      console.log(`   Progress: ${index + 1}/${contentItems.length}`);
    }

    return {
      ...item,
      embedding
    };
  });

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write to file
  const outputPath = path.join(dataDir, 'skillEmbeddings.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(embeddings, null, 2)
  );

  console.log(`✅ Generated ${embeddings.length} skill embeddings`);
  console.log(`📄 Saved to: ${outputPath}`);
  console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

  // Statistics
  const categoryCount = embeddings.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Embeddings by category:');
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`   ${category}: ${count}`);
  });

  console.log('\n💡 Note: Using mock embeddings for development');
  console.log('   To use real Gemini embeddings:');
  console.log('   1. Set GEMINI_API_KEY environment variable');
  console.log('   2. Uncomment Gemini API integration in this script');
  console.log('   3. Run: GEMINI_API_KEY=your_key npm run build:embeddings');
}

// Run generator
generateSkillEmbeddings();

/*
 * PRODUCTION IMPLEMENTATION (uncomment when API key is available):
 *
 * import { GoogleGenerativeAI } from '@google/generative-ai';
 *
 * const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
 *
 * async function generateRealEmbedding(text: string): Promise<number[]> {
 *   const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
 *   const result = await model.embedContent(text);
 *   return result.embedding.values;
 * }
 *
 * Replace generateMockEmbedding() calls with:
 *   const embedding = await generateRealEmbedding(item.text);
 */
