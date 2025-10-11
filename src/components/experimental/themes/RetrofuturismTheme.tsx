import React, { useState } from 'react';

interface RetrofuturismThemeProps {
  performanceMode?: 'high' | 'balanced' | 'low';
  debugMode?: boolean;
  isActive?: boolean;
}

// Neon Card Component with glowing borders
interface NeonCardProps {
  children: React.ReactNode;
  className?: string;
  neonColor?: 'cyan' | 'magenta' | 'yellow' | 'green';
  hasWireframe?: boolean;
}

const NeonCard: React.FC<NeonCardProps> = ({
  children,
  className = '',
  neonColor = 'cyan',
  hasWireframe = false,
}) => {
  const neonColors = {
    cyan: { border: '#00FFFF', glow: 'rgba(0, 255, 255, 0.6)' },
    magenta: { border: '#FF00FF', glow: 'rgba(255, 0, 255, 0.6)' },
    yellow: { border: '#FFFF00', glow: 'rgba(255, 255, 0, 0.6)' },
    green: { border: '#00FF00', glow: 'rgba(0, 255, 0, 0.6)' },
  };

  const color = neonColors[neonColor];

  return (
    <div
      className={`neon-card relative ${className}`}
      style={{
        border: `2px solid ${color.border}`,
        boxShadow: `0 0 10px ${color.glow}, inset 0 0 10px rgba(0, 0, 0, 0.5)`,
        background: hasWireframe
          ? 'linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)'
          : 'rgba(0, 0, 0, 0.6)',
        backgroundSize: '20px 20px',
      }}
    >
      {children}
    </div>
  );
};

export default function RetrofuturismTheme({
  performanceMode = 'high',
  debugMode = false,
  isActive = true,
}: RetrofuturismThemeProps) {
  const [glitchActive, setGlitchActive] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const projects = [
    {
      id: 'MF-137',
      title: 'MATCHFLOW',
      category: 'REAL-TIME SYSTEMS',
      year: '2024',
      description: '137 microservices operating in distributed architecture. Zero downtime across 5 live tournaments.',
      stats: ['137 SERVICES', '88/100 READY', '72H BUILD'],
      neonColor: 'cyan' as const,
    },
    {
      id: 'AG-001',
      title: 'AEGIS',
      category: 'AI GOVERNANCE',
      year: '2024',
      description: 'Constitutional AI enforcement framework. Zero hallucinations detected in production environment.',
      stats: ['ZERO ERRORS', 'FIRST-IN-INDUSTRY', 'PRODUCTION'],
      neonColor: 'magenta' as const,
    },
    {
      id: 'SM-072',
      title: 'SMUGMUG',
      category: 'DEVELOPER TOOLS',
      year: '2023',
      description: 'AI-powered semantic search engine. 20x velocity multiplier for 1000+ active developers.',
      stats: ['72H BUILD', '20X VELOCITY', '1000+ USERS'],
      neonColor: 'yellow' as const,
    },
  ];

  const skills = [
    { icon: '◢◤', title: 'ARCHITECTURE', items: ['DISTRIBUTED SYSTEMS', 'MICROSERVICES', 'EVENT-DRIVEN'] },
    { icon: '◣◥', title: 'AI/ML', items: ['MULTI-AGENT', 'RAG PIPELINE', 'PROMPT ENGINEERING'] },
    { icon: '▲▼', title: 'FRONTEND', items: ['REACT 19', 'TYPESCRIPT', 'TAILWIND CSS'] },
    { icon: '◀▶', title: 'BACKEND', items: ['NODE.JS', 'SUPABASE', 'EDGE FUNCTIONS'] },
  ];

  // Trigger glitch effect periodically
  React.useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 8000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="retrofuturism-theme min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Grid Background */}
      <div
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Scan Lines Effect */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-10"
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
          animation: 'scanlines 8s linear infinite',
        }}
      />

      {/* Vignette Effect */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.8) 100%)',
        }}
      />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto w-full">
          <NeonCard neonColor="cyan" className="p-8 md:p-12" hasWireframe>
            {/* Status Indicator */}
            <div className="inline-flex items-center gap-3 mb-8 font-mono text-xs">
              <div
                className="w-3 h-3 bg-green-400 animate-pulse"
                style={{ boxShadow: '0 0 10px #00FF00' }}
              />
              <span style={{ color: '#00FF00', textShadow: '0 0 5px #00FF00' }}>
                [ONLINE] AVAILABLE Q1 2026
              </span>
            </div>

            {/* Main Title with Glitch */}
            <h1
              className={`font-black uppercase mb-6 ${glitchActive ? 'glitch' : ''}`}
              style={{
                fontSize: 'clamp(3rem, 12vw, 9rem)',
                letterSpacing: '0.1em',
                color: '#00FFFF',
                textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
                fontFamily: 'monospace',
                lineHeight: 0.9,
              }}
              data-text="NINO CHAVEZ"
            >
              NINO
              <br />
              CHAVEZ
            </h1>

            {/* Tagline */}
            <div className="mb-8 max-w-3xl">
              <p
                className="text-xl md:text-3xl font-bold uppercase font-mono"
                style={{
                  color: '#FF00FF',
                  textShadow: '0 0 10px #FF00FF',
                  letterSpacing: '0.15em',
                }}
              >
                &gt; PRODUCTION_SYSTEMS_AS_PROOF
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8 font-mono">
              <div
                className="p-4 border-2"
                style={{
                  borderColor: '#00FFFF',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                }}
              >
                <div className="text-4xl font-black" style={{ color: '#00FFFF' }}>
                  05
                </div>
                <div className="text-xs" style={{ color: '#00FFFF' }}>
                  AI_AGENTS
                </div>
              </div>
              <div
                className="p-4 border-2"
                style={{
                  borderColor: '#FF00FF',
                  boxShadow: '0 0 10px rgba(255, 0, 255, 0.3)',
                }}
              >
                <div className="text-4xl font-black" style={{ color: '#FF00FF' }}>
                  97
                </div>
                <div className="text-xs" style={{ color: '#FF00FF' }}>
                  LIGHTHOUSE
                </div>
              </div>
              <div
                className="p-4 border-2"
                style={{
                  borderColor: '#FFFF00',
                  boxShadow: '0 0 10px rgba(255, 255, 0, 0.3)',
                }}
              >
                <div className="text-4xl font-black" style={{ color: '#FFFF00' }}>
                  137
                </div>
                <div className="text-xs" style={{ color: '#FFFF00' }}>
                  SERVICES
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  document.getElementById('systems-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 border-2 font-mono font-bold uppercase transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: '#00FFFF',
                  color: '#00FFFF',
                  background: 'rgba(0, 255, 255, 0.1)',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                  textShadow: '0 0 5px #00FFFF',
                }}
              >
                [VIEW_SYSTEMS] ▼
              </button>
            </div>
          </NeonCard>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-6 border-t-2" style={{ borderColor: '#00FFFF' }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-5xl md:text-7xl font-black uppercase mb-12 font-mono"
            style={{
              color: '#FF00FF',
              textShadow: '0 0 10px #FF00FF',
              letterSpacing: '0.1em',
            }}
          >
            &gt; CAPABILITIES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill, index) => (
              <NeonCard
                key={index}
                neonColor={index % 2 === 0 ? 'cyan' : 'magenta'}
                className="p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className="text-3xl"
                    style={{
                      color: index % 2 === 0 ? '#00FFFF' : '#FF00FF',
                      textShadow: `0 0 10px ${index % 2 === 0 ? '#00FFFF' : '#FF00FF'}`,
                    }}
                  >
                    {skill.icon}
                  </span>
                  <h3
                    className="text-xl font-black uppercase font-mono"
                    style={{
                      color: index % 2 === 0 ? '#00FFFF' : '#FF00FF',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {skill.title}
                  </h3>
                </div>
                <ul className="space-y-2 font-mono text-sm">
                  {skill.items.map((item, itemIndex) => (
                    <li key={itemIndex} style={{ color: '#00FF00' }}>
                      &gt; {item}
                    </li>
                  ))}
                </ul>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="systems-section" className="py-20 px-6 border-t-2" style={{ borderColor: '#FF00FF' }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-5xl md:text-7xl font-black uppercase mb-12 font-mono"
            style={{
              color: '#00FFFF',
              textShadow: '0 0 10px #00FFFF',
              letterSpacing: '0.1em',
            }}
          >
            &gt; PRODUCTION_SYSTEMS
          </h2>

          <div className="space-y-8">
            {projects.map((project, index) => (
              <NeonCard
                key={index}
                neonColor={project.neonColor}
                className="p-6 md:p-8 transition-all duration-300"
                hasWireframe={hoveredProject === index}
                onMouseEnter={() => setHoveredProject(index)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    {/* Project ID */}
                    <div
                      className="text-xs font-mono mb-2"
                      style={{
                        color:
                          project.neonColor === 'cyan'
                            ? '#00FFFF'
                            : project.neonColor === 'magenta'
                            ? '#FF00FF'
                            : '#FFFF00',
                      }}
                    >
                      [{project.id}] {project.category} // {project.year}
                    </div>

                    {/* Title */}
                    <h3
                      className="text-4xl md:text-5xl font-black uppercase mb-4 font-mono"
                      style={{
                        color:
                          project.neonColor === 'cyan'
                            ? '#00FFFF'
                            : project.neonColor === 'magenta'
                            ? '#FF00FF'
                            : '#FFFF00',
                        textShadow: `0 0 10px ${
                          project.neonColor === 'cyan'
                            ? '#00FFFF'
                            : project.neonColor === 'magenta'
                            ? '#FF00FF'
                            : '#FFFF00'
                        }`,
                        letterSpacing: '0.1em',
                      }}
                    >
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-lg mb-6 font-mono" style={{ color: '#00FF00' }}>
                      &gt; {project.description}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 font-mono text-xs">
                      {project.stats.map((stat, statIndex) => (
                        <div
                          key={statIndex}
                          className="px-3 py-1 border"
                          style={{
                            borderColor: '#00FF00',
                            color: '#00FF00',
                            background: 'rgba(0, 255, 0, 0.1)',
                          }}
                        >
                          {stat}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Index Number */}
                  <div
                    className="text-9xl font-black opacity-20 font-mono"
                    style={{
                      color:
                        project.neonColor === 'cyan'
                          ? '#00FFFF'
                          : project.neonColor === 'magenta'
                          ? '#FF00FF'
                          : '#FFFF00',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 border-t-2" style={{ borderColor: '#FFFF00' }}>
        <div className="max-w-4xl mx-auto">
          <NeonCard neonColor="yellow" className="p-8 md:p-12">
            <blockquote
              className="text-3xl md:text-5xl font-black uppercase mb-6 font-mono"
              style={{
                color: '#FFFF00',
                textShadow: '0 0 10px #FFFF00',
                letterSpacing: '0.05em',
                lineHeight: 1.3,
              }}
            >
              &gt; CODE_IS_EASY
              <br />
              &gt; SYSTEMS_ARE_HARD
              <br />
              &gt; SHOW_ME_PRODUCTION
            </blockquote>
            <div className="text-sm font-mono" style={{ color: '#00FF00' }}>
              // 20 YEARS OF BUILDING THINGS THAT DON'T BREAK
            </div>
          </NeonCard>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 border-t-2" style={{ borderColor: '#00FFFF' }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-5xl md:text-7xl font-black uppercase mb-12 font-mono"
            style={{
              color: '#FF00FF',
              textShadow: '0 0 10px #FF00FF',
              letterSpacing: '0.1em',
            }}
          >
            &gt; ESTABLISH_CONNECTION
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Email */}
            <NeonCard neonColor="cyan" className="p-8 text-center">
              <div className="text-xs font-mono mb-4" style={{ color: '#00FFFF' }}>
                [PRIMARY_CONTACT]
              </div>
              <a
                href="mailto:hello@nino.photos"
                className="text-2xl font-bold font-mono hover:scale-105 transition-transform inline-block"
                style={{
                  color: '#00FFFF',
                  textShadow: '0 0 10px #00FFFF',
                }}
              >
                HELLO@NINO.PHOTOS
              </a>
            </NeonCard>

            {/* LinkedIn */}
            <NeonCard neonColor="magenta" className="p-8 text-center">
              <div className="text-xs font-mono mb-4" style={{ color: '#FF00FF' }}>
                [PROFESSIONAL_NETWORK]
              </div>
              <a
                href="https://linkedin.com/in/nino-chavez"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl font-bold font-mono hover:scale-105 transition-transform inline-block"
                style={{
                  color: '#FF00FF',
                  textShadow: '0 0 10px #FF00FF',
                }}
              >
                LINKEDIN.COM
              </a>
            </NeonCard>
          </div>

          {/* Additional Links */}
          <div className="flex flex-wrap justify-center gap-6 font-mono text-sm">
            <a
              href="https://github.com/nino-chavez"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform"
              style={{ color: '#00FF00' }}
            >
              &gt; GITHUB
            </a>
            <a
              href="https://github.com/signal-x-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform"
              style={{ color: '#00FF00' }}
            >
              &gt; SIGNAL_X
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

        /* Scan lines animation */
        @keyframes scanlines {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(10px);
          }
        }

        /* Glitch effect */
        .glitch {
          position: relative;
          animation: glitch-animation 0.3s infinite;
        }

        @keyframes glitch-animation {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch::before {
          animation: glitch-before 0.3s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translate(-2px, -2px);
          opacity: 0.8;
        }

        .glitch::after {
          animation: glitch-after 0.3s infinite;
          clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
          transform: translate(2px, 2px);
          opacity: 0.8;
        }

        @keyframes glitch-before {
          0% {
            clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          }
          50% {
            clip-path: polygon(0 20%, 100% 20%, 100% 65%, 0 65%);
          }
          100% {
            clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          }
        }

        @keyframes glitch-after {
          0% {
            clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
          }
          50% {
            clip-path: polygon(0 35%, 100% 35%, 100% 80%, 0 80%);
          }
          100% {
            clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
          }
        }

        /* Neon card hover */
        .neon-card {
          transition: all 0.3s ease;
        }

        .neon-card:hover {
          transform: translateY(-4px);
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
