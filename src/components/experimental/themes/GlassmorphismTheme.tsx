import React, { useState } from 'react';

interface GlassmorphismThemeProps {
  performanceMode?: 'high' | 'balanced' | 'low';
  debugMode?: boolean;
  isActive?: boolean;
}

// Reusable Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', intensity = 'medium' }) => {
  const intensityStyles = {
    light: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
    },
    heavy: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(16px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
    },
  };

  return (
    <div
      className={`glass-card rounded-2xl ${className}`}
      style={{
        ...intensityStyles[intensity],
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      {children}
    </div>
  );
};

export default function GlassmorphismTheme({
  performanceMode = 'high',
  debugMode = false,
  isActive = true,
}: GlassmorphismThemeProps) {
  const [activeProject, setActiveProject] = useState<number | null>(null);

  // Project data
  const projects = [
    {
      title: 'MatchFlow',
      subtitle: 'Real-Time Volleyball Platform',
      description: '137 services, 88/100 production readiness, 72-hour build cycle',
      tech: ['TypeScript', 'Next.js', 'Supabase', 'Edge Functions'],
      metrics: '5 production tournaments managed',
    },
    {
      title: 'Aegis Framework',
      subtitle: 'AI Agent Governance',
      description: 'First-in-industry constitutional enforcement for AI agents',
      tech: ['Claude API', 'TypeScript', 'React'],
      metrics: 'Zero hallucinations in production',
    },
    {
      title: 'SmugMug Reference App',
      subtitle: 'AI-Powered Semantic Search',
      description: 'Built in 72 hours, 20x velocity multiplier',
      tech: ['React', 'AI/ML', 'API Integration'],
      metrics: '1000+ developers served',
    },
  ];

  // Skills data
  const skills = [
    { category: 'Architecture', items: ['Distributed Systems', 'Microservices', 'Event-Driven'] },
    { category: 'AI/ML', items: ['Multi-Agent Systems', 'Prompt Engineering', 'RAG'] },
    { category: 'Frontend', items: ['React 19', 'TypeScript', 'Tailwind CSS'] },
    { category: 'Backend', items: ['Node.js', 'Supabase', 'Edge Functions'] },
  ];

  return (
    <div className="glassmorphism-theme min-h-screen relative overflow-x-hidden">
      {/* Dynamic Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientFlow 15s ease infinite',
          }}
        />
        {/* Overlay texture for depth */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Hero Section - Glass Morphic */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto w-full">
          <GlassCard intensity="heavy" className="p-8 md:p-12 text-center">
            {/* Availability Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-green-400/20 border border-green-300/40 backdrop-blur-sm rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="text-sm font-medium text-white">
                Taking New Engagements • Q1 2026
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
              Nino Chavez
            </h1>

            <p className="text-2xl md:text-3xl font-bold text-white/90 mb-6">
              Production Systems as Proof
            </p>

            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Two decades architecting systems that don't break.
              Fortune 500 scale. Startup speed.
            </p>

            {/* Key Artifacts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
              <GlassCard intensity="light" className="p-4">
                <div className="text-violet-200 text-sm font-semibold mb-1">AI-Orchestrated</div>
                <div className="text-white/90">5 agents, 97/100 Lighthouse</div>
              </GlassCard>
              <GlassCard intensity="light" className="p-4">
                <div className="text-violet-200 text-sm font-semibold mb-1">Real-Time</div>
                <div className="text-white/90">137 services, 72-hour build</div>
              </GlassCard>
              <GlassCard intensity="light" className="p-4">
                <div className="text-violet-200 text-sm font-semibold mb-1">Photography</div>
                <div className="text-white/90">Published worldwide</div>
              </GlassCard>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-bold hover:bg-white/30 transition-all duration-300 hover:scale-105"
                onClick={() => {
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Production Systems ↓
              </button>
              <button
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Read Technical Essays
              </button>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* About / Skills Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto w-full">
          <GlassCard intensity="medium" className="p-8 md:p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
              Technical Expertise
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto text-center">
              Systems architect specializing in distributed platforms, AI orchestration, and
              production-grade applications that scale from startup to enterprise.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <GlassCard key={index} intensity="light" className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">{skill.category}</h3>
                  <ul className="space-y-2">
                    {skill.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-white/90">
                        <span className="text-violet-300 mr-3">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <GlassCard intensity="medium" className="inline-block px-8 py-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Production Systems
              </h2>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <GlassCard
                key={index}
                intensity={activeProject === index ? 'heavy' : 'medium'}
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  activeProject === index ? 'scale-105' : 'hover:scale-102'
                }`}
                onMouseEnter={() => setActiveProject(index)}
                onMouseLeave={() => setActiveProject(null)}
              >
                <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-violet-200 font-semibold mb-4">{project.subtitle}</p>
                <p className="text-white/80 mb-4">{project.description}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 border border-white/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Metrics */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm text-violet-200 font-semibold">{project.metrics}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto w-full">
          <GlassCard intensity="heavy" className="p-8 md:p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Let's Build Something
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Available for enterprise consulting, technical leadership, and
              production-grade system architecture.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="mailto:hello@nino.photos"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-bold hover:bg-white/30 transition-all duration-300 hover:scale-105"
              >
                hello@nino.photos
              </a>
              <a
                href="https://linkedin.com/in/nino-chavez"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </a>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-6 text-sm text-white/70">
              <a
                href="https://github.com/nino-chavez"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://github.com/signal-x-studio"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Signal X
              </a>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Styles */}
      <style jsx>{`
        @keyframes gradientFlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Glass card hover effects */
        .glass-card {
          transition: all 0.3s ease;
        }

        /* Accessibility: Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </div>
  );
}
