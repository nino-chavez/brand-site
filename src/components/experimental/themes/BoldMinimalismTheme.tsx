import React, { useState } from 'react';

interface BoldMinimalismThemeProps {
  performanceMode?: 'high' | 'balanced' | 'low';
  debugMode?: boolean;
  isActive?: boolean;
}

// Minimal Container Component with generous spacing
interface MinimalContainerProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'comfortable' | 'spacious' | 'extreme';
}

const MinimalContainer: React.FC<MinimalContainerProps> = ({
  children,
  className = '',
  spacing = 'spacious',
}) => {
  const spacingClasses = {
    comfortable: 'py-20 md:py-32',
    spacious: 'py-32 md:py-48',
    extreme: 'py-48 md:py-64',
  };

  return (
    <div className={`minimal-container ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

export default function BoldMinimalismTheme({
  performanceMode = 'high',
  debugMode = false,
  isActive = true,
}: BoldMinimalismThemeProps) {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);

  const projects = [
    {
      number: '01',
      title: 'MatchFlow',
      category: 'Real-Time Platform',
      year: '2024',
      description: '137 microservices orchestrating live volleyball tournaments with 88/100 production readiness.',
      metrics: ['137 Services', '5 Tournaments', '72h Build'],
    },
    {
      number: '02',
      title: 'Aegis',
      category: 'AI Governance',
      year: '2024',
      description: 'Constitutional enforcement framework for AI agents. Zero hallucinations in production deployment.',
      metrics: ['Zero Errors', 'First-in-Industry', 'Production'],
    },
    {
      number: '03',
      title: 'SmugMug',
      category: 'Developer Tools',
      year: '2023',
      description: 'AI-powered semantic search serving 1000+ developers with 20x velocity multiplier.',
      metrics: ['72h Build', '20x Velocity', '1000+ Users'],
    },
  ];

  const skills = [
    { area: 'Architecture', focus: 'Distributed Systems at Scale' },
    { area: 'AI/ML', focus: 'Multi-Agent Orchestration' },
    { area: 'Frontend', focus: 'React 19 & TypeScript' },
    { area: 'Backend', focus: 'Node.js & Supabase' },
  ];

  return (
    <div className="bold-minimalism-theme min-h-screen bg-white text-black">
      {/* Hero Section - Maximum Impact Typography */}
      <MinimalContainer spacing="extreme" className="px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Availability Indicator - Subtle */}
          <div className="inline-flex items-center gap-3 mb-16">
            <div className="w-2 h-2 bg-black rounded-full" />
            <span className="text-xs uppercase tracking-[0.2em] font-medium">
              Available Q1 2026
            </span>
          </div>

          {/* Statement Typography */}
          <h1
            className="font-light leading-[0.9] mb-20"
            style={{
              fontSize: 'clamp(4rem, 15vw, 12rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Nino
            <br />
            Chavez
          </h1>

          {/* Tagline - Maximum Contrast */}
          <div className="max-w-4xl">
            <p
              className="font-bold leading-tight mb-12"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                letterSpacing: '-0.01em',
              }}
            >
              Production systems as proof.
              <br />
              <span className="font-light">
                Twenty years of architecture that doesn't break.
              </span>
            </p>
          </div>

          {/* Key Stats - Ultra Minimal */}
          <div className="grid grid-cols-3 gap-12 max-w-3xl mb-20">
            <div>
              <div className="text-5xl font-light mb-2">5</div>
              <div className="text-xs uppercase tracking-widest text-gray-600">AI Agents</div>
            </div>
            <div>
              <div className="text-5xl font-light mb-2">97</div>
              <div className="text-xs uppercase tracking-widest text-gray-600">Lighthouse</div>
            </div>
            <div>
              <div className="text-5xl font-light mb-2">137</div>
              <div className="text-xs uppercase tracking-widest text-gray-600">Services</div>
            </div>
          </div>

          {/* Single CTA - Understated */}
          <button
            onClick={() => {
              document.getElementById('work-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-4 text-lg font-light border-b-2 border-black pb-2 transition-all duration-300 hover:gap-6"
          >
            <span>View Selected Work</span>
            <span className="text-2xl transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </button>
        </div>
      </MinimalContainer>

      {/* Skills Section - Minimal Grid */}
      <MinimalContainer spacing="spacious" className="px-6 md:px-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-light mb-24 leading-tight">
            Expertise
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="group cursor-default"
                onMouseEnter={() => setHoveredSkill(index)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-gray-200 transition-colors duration-300 group-hover:border-black">
                  <h3 className="text-2xl font-light">{skill.area}</h3>
                  <span
                    className={`text-xs uppercase tracking-widest transition-opacity duration-300 ${
                      hoveredSkill === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-gray-600 font-light">{skill.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </MinimalContainer>

      {/* Projects Section - Statement Layout */}
      <MinimalContainer
        id="work-section"
        spacing="spacious"
        className="px-6 md:px-12 border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-light mb-24 leading-tight">
            Selected
            <br />
            Work
          </h2>

          <div className="space-y-32">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group cursor-default"
                onMouseEnter={() => setHoveredProject(index)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Project Number - Large */}
                <div className="flex items-start justify-between mb-8">
                  <div
                    className="font-light text-gray-300 transition-colors duration-500"
                    style={{
                      fontSize: 'clamp(6rem, 15vw, 12rem)',
                      lineHeight: 0.8,
                      color: hoveredProject === index ? '#000' : undefined,
                    }}
                  >
                    {project.number}
                  </div>
                  <div className="text-right mt-4">
                    <div className="text-xs uppercase tracking-widest text-gray-600 mb-2">
                      {project.year}
                    </div>
                    <div className="text-sm text-gray-600">{project.category}</div>
                  </div>
                </div>

                {/* Project Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                  <div>
                    <h3 className="text-5xl font-light mb-6 leading-tight">{project.title}</h3>
                  </div>
                  <div>
                    <p className="text-lg font-light text-gray-700 leading-relaxed mb-8">
                      {project.description}
                    </p>

                    {/* Metrics - Minimal */}
                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                      {project.metrics.map((metric, metricIndex) => (
                        <div
                          key={metricIndex}
                          className="text-xs uppercase tracking-widest text-gray-600"
                        >
                          {metric}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="h-px bg-gray-200 transition-all duration-500"
                  style={{
                    backgroundColor: hoveredProject === index ? '#000' : undefined,
                    height: hoveredProject === index ? '2px' : undefined,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </MinimalContainer>

      {/* Philosophy Section - Statement Quote */}
      <MinimalContainer spacing="extreme" className="px-6 md:px-12 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <blockquote
            className="font-light leading-tight mb-12"
            style={{
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              letterSpacing: '-0.01em',
            }}
          >
            Code is easy.
            <br />
            Systems are hard.
            <br />
            <span className="font-bold">Show me production.</span>
          </blockquote>
          <div className="text-sm text-gray-600 font-light">
            — Two decades of building things that don't break
          </div>
        </div>
      </MinimalContainer>

      {/* Contact Section - Minimal */}
      <MinimalContainer spacing="spacious" className="px-6 md:px-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-light mb-24 leading-tight">
            Connect
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
            {/* Email */}
            <div className="group">
              <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">
                Primary Contact
              </div>
              <a
                href="mailto:hello@nino.photos"
                className="text-3xl font-light border-b-2 border-transparent hover:border-black transition-colors duration-300 inline-block"
              >
                hello@nino.photos
              </a>
            </div>

            {/* LinkedIn */}
            <div className="group">
              <div className="text-xs uppercase tracking-widest text-gray-600 mb-4">
                Professional Network
              </div>
              <a
                href="https://linkedin.com/in/nino-chavez"
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl font-light border-b-2 border-transparent hover:border-black transition-colors duration-300 inline-block"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Additional Links - Ultra Minimal */}
          <div className="flex gap-12 text-sm">
            <a
              href="https://github.com/nino-chavez"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors duration-300 border-b border-transparent hover:border-gray-600"
            >
              GitHub
            </a>
            <a
              href="https://github.com/signal-x-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors duration-300 border-b border-transparent hover:border-gray-600"
            >
              Signal X
            </a>
          </div>
        </div>
      </MinimalContainer>

      {/* Footer - Minimal Copyright */}
      <div className="px-6 md:px-12 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gray-600 font-light">
            © 2025 Nino Chavez. All rights reserved.
          </p>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Typography refinements */
        .bold-minimalism-theme {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Minimal container */
        .minimal-container {
          position: relative;
        }

        /* Hover effects - subtle */
        a {
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

        /* Print optimizations */
        @media print {
          .bold-minimalism-theme {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
