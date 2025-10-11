import React, { useState } from 'react';

interface NeobrutalistThemeProps {
  performanceMode?: 'high' | 'balanced' | 'low';
  debugMode?: boolean;
  isActive?: boolean;
}

// Neobrutalist Card Component with thick borders and sharp shadows
interface BrutalistCardProps {
  children: React.ReactNode;
  className?: string;
  color?: 'yellow' | 'cyan' | 'pink' | 'lime' | 'white';
  shadowColor?: 'black' | 'yellow' | 'cyan';
}

const BrutalistCard: React.FC<BrutalistCardProps> = ({
  children,
  className = '',
  color = 'white',
  shadowColor = 'black',
}) => {
  const colorClasses = {
    yellow: 'bg-[#FFD700]',
    cyan: 'bg-[#00BFFF]',
    pink: 'bg-[#FF69B4]',
    lime: 'bg-[#32CD32]',
    white: 'bg-white',
  };

  const shadowColors = {
    black: '#000',
    yellow: '#FFD700',
    cyan: '#00BFFF',
  };

  return (
    <div
      className={`brutalist-card ${colorClasses[color]} border-4 border-black p-6 ${className}`}
      style={{
        boxShadow: `8px 8px 0 ${shadowColors[shadowColor]}`,
      }}
    >
      {children}
    </div>
  );
};

export default function NeobrutalistTheme({
  performanceMode = 'high',
  debugMode = false,
  isActive = true,
}: NeobrutalistThemeProps) {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const projects = [
    {
      title: 'MATCHFLOW',
      category: 'REAL-TIME',
      description: '137 services. 88/100 production readiness. Zero downtime in 5 live tournaments.',
      color: 'yellow' as const,
      stats: ['137 SERVICES', '72HR BUILD', '5 TOURNAMENTS'],
    },
    {
      title: 'AEGIS',
      category: 'AI GOVERNANCE',
      description: 'Constitutional enforcement. Zero hallucinations. First-in-industry deployment.',
      color: 'cyan' as const,
      stats: ['ZERO ERRORS', '100% UPTIME', 'PRODUCTION'],
    },
    {
      title: 'SMUGMUG',
      category: 'DEV TOOLS',
      description: 'AI semantic search. 72-hour build. 20x velocity multiplier. 1000+ developers.',
      color: 'pink' as const,
      stats: ['72 HOURS', '20X VELOCITY', '1000+ USERS'],
    },
  ];

  return (
    <div className="neobrutalist-theme min-h-screen bg-white relative overflow-x-hidden">
      {/* Hero Section - Asymmetric, Oversized */}
      <section className="p-6 md:p-12 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          {/* Availability Badge - Top */}
          <div className="inline-flex items-center gap-3 px-4 py-2 mb-8 bg-[#32CD32] border-4 border-black">
            <div className="w-3 h-3 bg-black animate-pulse" />
            <span className="text-sm font-black uppercase tracking-wider">
              AVAILABLE Q1 2026
            </span>
          </div>

          {/* Main Heading - HUGE */}
          <h1
            className="font-black uppercase leading-none mb-8"
            style={{
              fontSize: 'clamp(3rem, 12vw, 9rem)',
              letterSpacing: '-0.05em',
            }}
          >
            NINO
            <br />
            CHAVEZ
          </h1>

          {/* Tagline Card */}
          <BrutalistCard color="yellow" className="inline-block mb-12 transform -rotate-1">
            <p className="text-2xl md:text-4xl font-black uppercase">
              PRODUCTION SYSTEMS AS PROOF
            </p>
          </BrutalistCard>

          {/* Stats Grid - Asymmetric */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <BrutalistCard color="cyan" shadowColor="black">
              <div className="text-5xl font-black mb-2">5</div>
              <div className="text-sm font-black uppercase">AI Agents</div>
            </BrutalistCard>

            <BrutalistCard color="pink" shadowColor="black">
              <div className="text-5xl font-black mb-2">97</div>
              <div className="text-sm font-black uppercase">Lighthouse</div>
            </BrutalistCard>

            <BrutalistCard color="lime" shadowColor="black">
              <div className="text-5xl font-black mb-2">137</div>
              <div className="text-sm font-black uppercase">Services</div>
            </BrutalistCard>

            <BrutalistCard color="yellow" shadowColor="black">
              <div className="text-5xl font-black mb-2">72H</div>
              <div className="text-sm font-black uppercase">Build Time</div>
            </BrutalistCard>
          </div>

          {/* CTA Buttons - Raw */}
          <div className="flex flex-col sm:flex-row gap-6">
            <button
              onClick={() => {
                document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-6 bg-black text-white font-black text-xl uppercase border-4 border-black hover:bg-white hover:text-black transition-colors"
              style={{
                boxShadow: '8px 8px 0 #FFD700',
              }}
            >
              VIEW WORK ↓
            </button>

            <button
              onClick={() => {
                document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-6 bg-white text-black font-black text-lg uppercase border-4 border-black hover:bg-black hover:text-white transition-colors"
              style={{
                boxShadow: '8px 8px 0 #00BFFF',
              }}
            >
              GET IN TOUCH
            </button>
          </div>
        </div>
      </section>

      {/* Skills Section - Raw Grid */}
      <section className="p-6 md:p-12 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <h2
            className="font-black uppercase mb-12"
            style={{
              fontSize: 'clamp(2rem, 8vw, 5rem)',
              letterSpacing: '-0.03em',
            }}
          >
            WHAT I BUILD
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-4 border-white p-8">
              <h3 className="text-3xl font-black uppercase mb-4">ARCHITECTURE</h3>
              <ul className="space-y-3 text-lg font-bold">
                <li>→ DISTRIBUTED SYSTEMS</li>
                <li>→ MICROSERVICES</li>
                <li>→ EVENT-DRIVEN</li>
              </ul>
            </div>

            <div className="border-4 border-[#FFD700] p-8 bg-[#FFD700] text-black">
              <h3 className="text-3xl font-black uppercase mb-4">AI/ML</h3>
              <ul className="space-y-3 text-lg font-bold">
                <li>→ MULTI-AGENT SYSTEMS</li>
                <li>→ PROMPT ENGINEERING</li>
                <li>→ RAG PIPELINES</li>
              </ul>
            </div>

            <div className="border-4 border-[#00BFFF] p-8 bg-[#00BFFF] text-black">
              <h3 className="text-3xl font-black uppercase mb-4">FRONTEND</h3>
              <ul className="space-y-3 text-lg font-bold">
                <li>→ REACT 19</li>
                <li>→ TYPESCRIPT</li>
                <li>→ TAILWIND CSS</li>
              </ul>
            </div>

            <div className="border-4 border-white p-8">
              <h3 className="text-3xl font-black uppercase mb-4">BACKEND</h3>
              <ul className="space-y-3 text-lg font-bold">
                <li>→ NODE.JS</li>
                <li>→ SUPABASE</li>
                <li>→ EDGE FUNCTIONS</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section - Staggered Cards */}
      <section id="projects-section" className="p-6 md:p-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2
            className="font-black uppercase mb-12"
            style={{
              fontSize: 'clamp(2rem, 8vw, 5rem)',
              letterSpacing: '-0.03em',
            }}
          >
            PRODUCTION
            <br />
            SYSTEMS
          </h2>

          <div className="space-y-12">
            {projects.map((project, index) => (
              <div
                key={index}
                className="transform transition-transform duration-300"
                style={{
                  transform: hoveredProject === index ? 'translateX(12px) translateY(-12px)' : 'none',
                }}
                onMouseEnter={() => setHoveredProject(index)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <BrutalistCard
                  color={project.color}
                  shadowColor="black"
                  className={`transform ${index % 2 === 0 ? 'md:-rotate-1' : 'md:rotate-1'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="text-xs font-black uppercase tracking-widest mb-2 opacity-70">
                        {project.category}
                      </div>
                      <h3 className="text-4xl md:text-6xl font-black uppercase mb-4 leading-none">
                        {project.title}
                      </h3>
                      <p className="text-lg font-bold leading-relaxed mb-6">
                        {project.description}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-3">
                        {project.stats.map((stat, statIndex) => (
                          <div
                            key={statIndex}
                            className="px-4 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase"
                          >
                            {stat}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-8xl font-black opacity-10">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                  </div>
                </BrutalistCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section - Raw Statement */}
      <section className="p-6 md:p-12 bg-[#FFD700]">
        <div className="max-w-5xl mx-auto">
          <div className="border-8 border-black p-8 md:p-12 bg-white">
            <div className="text-9xl font-black mb-8">"</div>
            <blockquote className="text-2xl md:text-4xl font-black uppercase leading-tight mb-8">
              CODE IS EASY.
              <br />
              SYSTEMS ARE HARD.
              <br />
              SHOW ME PRODUCTION.
            </blockquote>
            <div className="text-lg font-black uppercase">
              — 20 YEARS OF BUILDING THINGS THAT DON'T BREAK
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Maximum Impact */}
      <section id="contact-section" className="p-6 md:p-12 bg-black text-white min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <h2
            className="font-black uppercase mb-12"
            style={{
              fontSize: 'clamp(2rem, 10vw, 7rem)',
              letterSpacing: '-0.03em',
            }}
          >
            LET'S
            <br />
            BUILD
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Email CTA */}
            <div className="border-8 border-[#FFD700] bg-[#FFD700] p-12 text-center">
              <div className="text-6xl mb-6">✉️</div>
              <a
                href="mailto:hello@nino.photos"
                className="text-3xl font-black uppercase hover:underline"
              >
                HELLO@NINO.PHOTOS
              </a>
              <p className="text-lg font-bold mt-4 uppercase">Primary Contact</p>
            </div>

            {/* LinkedIn */}
            <div className="border-8 border-[#00BFFF] bg-[#00BFFF] p-12 text-center">
              <div className="text-6xl mb-6">💼</div>
              <a
                href="https://linkedin.com/in/nino-chavez"
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl font-black uppercase hover:underline"
              >
                LINKEDIN
              </a>
              <p className="text-lg font-bold mt-4 uppercase">Professional Network</p>
            </div>
          </div>

          {/* Additional Links */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="https://github.com/nino-chavez"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-4 border-white text-center font-black uppercase text-lg hover:bg-white hover:text-black transition-colors"
            >
              GITHUB →
            </a>
            <a
              href="https://github.com/signal-x-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-4 border-white text-center font-black uppercase text-lg hover:bg-white hover:text-black transition-colors"
            >
              SIGNAL X →
            </a>
          </div>
        </div>
      </section>

      {/* Styles */}
      <style jsx>{`
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Brutalist card interactions */
        .brutalist-card {
          transition: all 0.2s ease;
          cursor: default;
        }

        .brutalist-card:hover {
          transform: translate(-4px, -4px);
          box-shadow: 12px 12px 0 #000 !important;
        }

        /* Button interactions */
        button {
          transition: all 0.2s ease;
        }

        button:active {
          transform: translate(4px, 4px);
          box-shadow: 0 0 0 #000 !important;
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
