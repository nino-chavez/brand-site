import React, { useState } from 'react';

interface NeumorphismThemeProps {
  performanceMode?: 'high' | 'balanced' | 'low';
  debugMode?: boolean;
  isActive?: boolean;
}

// Neumorphic Card Component with soft shadows
interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'raised' | 'pressed' | 'flat';
  interactive?: boolean;
}

const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  className = '',
  variant = 'raised',
  interactive = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const shadowStyles = {
    raised: {
      boxShadow: '12px 12px 24px rgba(174, 174, 192, 0.4), -12px -12px 24px rgba(255, 255, 255, 0.9)',
    },
    pressed: {
      boxShadow: 'inset 8px 8px 16px rgba(174, 174, 192, 0.4), inset -8px -8px 16px rgba(255, 255, 255, 0.9)',
    },
    flat: {
      boxShadow: '6px 6px 12px rgba(174, 174, 192, 0.3), -6px -6px 12px rgba(255, 255, 255, 0.8)',
    },
  };

  const currentVariant = interactive && isPressed ? 'pressed' : variant;

  return (
    <div
      className={`neumorphic-card rounded-3xl bg-[#e0e5ec] transition-all duration-200 ${className}`}
      style={shadowStyles[currentVariant]}
      onMouseDown={() => interactive && setIsPressed(true)}
      onMouseUp={() => interactive && setIsPressed(false)}
      onMouseLeave={() => interactive && setIsPressed(false)}
    >
      {children}
    </div>
  );
};

export default function NeumorphismTheme({
  performanceMode = 'high',
  debugMode = false,
  isActive = true,
}: NeumorphismThemeProps) {
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [pressedStat, setPressedStat] = useState<number | null>(null);

  const projects = [
    {
      title: 'MatchFlow',
      category: 'Real-Time Platform',
      description: '137 microservices orchestrating live volleyball tournaments with 88/100 production readiness score.',
      metrics: ['137 Services', '88/100 Ready', '72h Build'],
      icon: '⚡',
    },
    {
      title: 'Aegis',
      category: 'AI Governance',
      description: 'Constitutional enforcement framework for AI agents achieving zero hallucinations in production.',
      metrics: ['Zero Errors', 'First-in-Industry', 'Production'],
      icon: '🛡️',
    },
    {
      title: 'SmugMug',
      category: 'Developer Tools',
      description: 'AI-powered semantic search delivering 20x velocity multiplier for 1000+ developers.',
      metrics: ['72h Build', '20x Velocity', '1000+ Users'],
      icon: '🔍',
    },
  ];

  const skills = [
    { title: 'Architecture', focus: 'Distributed Systems', icon: '🏗️' },
    { title: 'AI/ML', focus: 'Multi-Agent Orchestration', icon: '🤖' },
    { title: 'Frontend', focus: 'React 19 & TypeScript', icon: '⚛️' },
    { title: 'Backend', focus: 'Node.js & Supabase', icon: '⚙️' },
  ];

  const stats = [
    { value: '5', label: 'AI Agents' },
    { value: '97', label: 'Lighthouse' },
    { value: '137', label: 'Services' },
  ];

  return (
    <div className="neumorphism-theme min-h-screen bg-[#e0e5ec] text-gray-700">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto w-full">
          <NeumorphicCard variant="raised" className="p-8 md:p-12">
            {/* Availability Badge */}
            <div className="inline-flex items-center gap-3 mb-8">
              <div
                className="w-3 h-3 bg-[#e0e5ec] rounded-full"
                style={{
                  boxShadow:
                    'inset 2px 2px 4px rgba(174, 174, 192, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full m-0.5 animate-pulse" />
              </div>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Available Q1 2026
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-700 mb-6 leading-tight">
              Nino Chavez
            </h1>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl font-semibold text-gray-600 mb-8">
              Production Systems as Proof
            </p>

            <p className="text-lg text-gray-500 mb-12 max-w-2xl">
              Two decades architecting systems that don't break.
              Fortune 500 scale. Startup speed.
            </p>

            {/* Stats - Interactive */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              {stats.map((stat, index) => (
                <NeumorphicCard
                  key={index}
                  variant={pressedStat === index ? 'pressed' : 'flat'}
                  interactive
                  className="p-6 text-center cursor-pointer"
                  onMouseDown={() => setPressedStat(index)}
                  onMouseUp={() => setPressedStat(null)}
                  onMouseLeave={() => setPressedStat(null)}
                >
                  <div className="text-4xl font-bold text-gray-700 mb-2">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    {stat.label}
                  </div>
                </NeumorphicCard>
              ))}
            </div>

            {/* CTA */}
            <NeumorphicCard variant="flat" interactive className="inline-block">
              <button
                onClick={() => {
                  document.getElementById('work-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 text-lg font-semibold text-gray-700"
              >
                View Production Systems →
              </button>
            </NeumorphicCard>
          </NeumorphicCard>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <NeumorphicCard variant="raised" className="p-8 md:p-12 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
              Technical Expertise
            </h2>
            <p className="text-lg text-gray-600">
              Systems architect specializing in distributed platforms and AI orchestration
            </p>
          </NeumorphicCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill, index) => (
              <NeumorphicCard key={index} variant="flat" className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 bg-[#e0e5ec] rounded-2xl flex items-center justify-center text-3xl"
                    style={{
                      boxShadow:
                        'inset 4px 4px 8px rgba(174, 174, 192, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {skill.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-700">{skill.title}</h3>
                    <p className="text-sm text-gray-500">{skill.focus}</p>
                  </div>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="work-section" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <NeumorphicCard variant="raised" className="p-8 md:p-12 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
              Production Systems
            </h2>
            <p className="text-lg text-gray-600">
              Enterprise-grade applications deployed and maintained in production
            </p>
          </NeumorphicCard>

          <div className="space-y-8">
            {projects.map((project, index) => (
              <NeumorphicCard
                key={index}
                variant={activeProject === index ? 'pressed' : 'raised'}
                className="p-6 md:p-8 transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveProject(index)}
                onMouseLeave={() => setActiveProject(null)}
              >
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div
                    className="w-20 h-20 bg-[#e0e5ec] rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                    style={{
                      boxShadow:
                        activeProject === index
                          ? 'inset 6px 6px 12px rgba(174, 174, 192, 0.4), inset -6px -6px 12px rgba(255, 255, 255, 0.9)'
                          : '6px 6px 12px rgba(174, 174, 192, 0.3), -6px -6px 12px rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {project.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                      {project.category}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-700 mb-3">{project.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>

                    {/* Metrics */}
                    <div className="flex flex-wrap gap-3">
                      {project.metrics.map((metric, metricIndex) => (
                        <div
                          key={metricIndex}
                          className="px-4 py-2 bg-[#e0e5ec] rounded-xl text-sm font-semibold text-gray-600"
                          style={{
                            boxShadow:
                              'inset 3px 3px 6px rgba(174, 174, 192, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.8)',
                          }}
                        >
                          {metric}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <NeumorphicCard variant="raised" className="p-8 md:p-12">
            <div
              className="w-20 h-20 bg-[#e0e5ec] rounded-full flex items-center justify-center text-5xl mb-8 mx-auto"
              style={{
                boxShadow:
                  'inset 6px 6px 12px rgba(174, 174, 192, 0.4), inset -6px -6px 12px rgba(255, 255, 255, 0.9)',
              }}
            >
              💭
            </div>
            <blockquote className="text-2xl md:text-4xl font-bold text-gray-700 mb-6 text-center leading-tight">
              Code is easy.
              <br />
              Systems are hard.
              <br />
              Show me production.
            </blockquote>
            <p className="text-center text-gray-600 font-semibold">
              — 20 years of building things that don't break
            </p>
          </NeumorphicCard>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 pb-32">
        <div className="max-w-5xl mx-auto">
          <NeumorphicCard variant="raised" className="p-8 md:p-12 mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
              Let's Connect
            </h2>
            <p className="text-lg text-gray-600">
              Available for enterprise consulting and technical leadership
            </p>
          </NeumorphicCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Email */}
            <NeumorphicCard variant="flat" className="p-8">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                Primary Contact
              </div>
              <a
                href="mailto:hello@nino.photos"
                className="text-2xl font-bold text-gray-700 hover:text-gray-900 transition-colors"
              >
                hello@nino.photos
              </a>
            </NeumorphicCard>

            {/* LinkedIn */}
            <NeumorphicCard variant="flat" className="p-8">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                Professional Network
              </div>
              <a
                href="https://linkedin.com/in/nino-chavez"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl font-bold text-gray-700 hover:text-gray-900 transition-colors"
              >
                LinkedIn
              </a>
            </NeumorphicCard>
          </div>

          {/* Additional Links */}
          <NeumorphicCard variant="flat" className="p-6">
            <div className="flex justify-center gap-8 text-sm">
              <a
                href="https://github.com/nino-chavez"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 transition-colors font-semibold"
              >
                GitHub
              </a>
              <a
                href="https://github.com/signal-x-studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 transition-colors font-semibold"
              >
                Signal X
              </a>
            </div>
          </NeumorphicCard>
        </div>
      </section>

      {/* Styles */}
      <style jsx>{`
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Neumorphic card transitions */
        .neumorphic-card {
          transition: all 0.2s ease;
        }

        /* Hover effects for interactive cards */
        .neumorphic-card:hover {
          transform: translateY(-2px);
        }

        /* Active/pressed state */
        .neumorphic-card:active {
          transform: translateY(0);
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

        /* Subtle gradient overlay */
        .neumorphism-theme {
          background: linear-gradient(135deg, #e0e5ec 0%, #d5dae3 100%);
        }
      `}</style>
    </div>
  );
}
