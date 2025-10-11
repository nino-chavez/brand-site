import React from 'react';

interface BentoGridThemeProps {
  performanceMode?: 'high' | 'balanced' | 'low';
  debugMode?: boolean;
  isActive?: boolean;
}

// Reusable Bento Box Component
interface BentoBoxProps {
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'wide' | 'tall';
  variant?: 'default' | 'accent' | 'highlight';
}

const BentoBox: React.FC<BentoBoxProps> = ({
  children,
  className = '',
  size = 'medium',
  variant = 'default',
}) => {
  const sizeClasses = {
    small: 'md:col-span-1 md:row-span-1',
    medium: 'md:col-span-2 md:row-span-1',
    large: 'md:col-span-2 md:row-span-2',
    wide: 'md:col-span-3 md:row-span-1',
    tall: 'md:col-span-1 md:row-span-2',
  };

  const variantClasses = {
    default: 'bg-white border-gray-200',
    accent: 'bg-violet-50 border-violet-200',
    highlight: 'bg-gradient-to-br from-violet-50 to-blue-50 border-violet-300',
  };

  return (
    <div
      className={`bento-box ${sizeClasses[size]} ${variantClasses[variant]} rounded-2xl border-2 p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default function BentoGridTheme({
  performanceMode = 'high',
  debugMode = false,
  isActive = true,
}: BentoGridThemeProps) {
  const projects = [
    {
      title: 'MatchFlow',
      category: 'Real-Time Platform',
      description: '137 services orchestrating live volleyball tournaments',
      metrics: ['88/100 Production Readiness', '72-hour Build Cycle', '5 Live Tournaments'],
      tech: ['TypeScript', 'Next.js', 'Supabase'],
    },
    {
      title: 'Aegis Framework',
      category: 'AI Governance',
      description: 'Constitutional enforcement for AI agents',
      metrics: ['Zero Hallucinations', 'First-in-Industry', 'Production Deployed'],
      tech: ['Claude API', 'React', 'TypeScript'],
    },
    {
      title: 'SmugMug Reference',
      category: 'Developer Tools',
      description: 'AI-powered semantic search for 1000+ developers',
      metrics: ['72-hour Build', '20x Velocity', '1000+ Users'],
      tech: ['React', 'AI/ML', 'APIs'],
    },
  ];

  const skills = [
    { icon: '🏗️', title: 'Architecture', items: ['Distributed Systems', 'Microservices', 'Event-Driven'] },
    { icon: '🤖', title: 'AI/ML', items: ['Multi-Agent', 'RAG', 'Prompt Engineering'] },
    { icon: '⚛️', title: 'Frontend', items: ['React 19', 'TypeScript', 'Tailwind'] },
    { icon: '⚙️', title: 'Backend', items: ['Node.js', 'Supabase', 'Edge Functions'] },
  ];

  return (
    <div className="bento-grid-theme min-h-screen bg-gray-50">
      {/* Hero Bento Grid */}
      <section className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {/* Hero Card - Large */}
          <BentoBox size="large" variant="highlight" className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-green-100 border border-green-300 rounded-full w-fit">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-700">Available Q1 2026</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
              Nino Chavez
            </h1>
            <p className="text-xl font-bold text-gray-700 mb-2">
              Production Systems as Proof
            </p>
            <p className="text-sm text-gray-600">
              Two decades architecting systems that don't break. Fortune 500 scale. Startup speed.
            </p>
          </BentoBox>

          {/* Quick Stats - Small Cards */}
          <BentoBox size="small" variant="accent">
            <div className="text-3xl font-black text-violet-600 mb-1">5</div>
            <div className="text-sm font-semibold text-gray-700">AI Agents</div>
            <div className="text-xs text-gray-500 mt-1">Multi-agent orchestration</div>
          </BentoBox>

          <BentoBox size="small" variant="accent">
            <div className="text-3xl font-black text-blue-600 mb-1">97</div>
            <div className="text-sm font-semibold text-gray-700">Lighthouse</div>
            <div className="text-xs text-gray-500 mt-1">Performance score</div>
          </BentoBox>

          {/* CTA Card - Wide */}
          <BentoBox size="wide" variant="default" className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900 mb-1">Explore Production Systems</div>
              <div className="text-sm text-gray-600">3 enterprise-grade projects</div>
            </div>
            <button
              onClick={() => {
                document.getElementById('projects-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
            >
              View Work ↓
            </button>
          </BentoBox>

          {/* Additional Stats */}
          <BentoBox size="small" variant="default">
            <div className="text-3xl font-black text-orange-600 mb-1">137</div>
            <div className="text-sm font-semibold text-gray-700">Services</div>
            <div className="text-xs text-gray-500 mt-1">MatchFlow platform</div>
          </BentoBox>

          <BentoBox size="small" variant="default">
            <div className="text-3xl font-black text-teal-600 mb-1">72h</div>
            <div className="text-sm font-semibold text-gray-700">Build Time</div>
            <div className="text-xs text-gray-500 mt-1">SmugMug reference</div>
          </BentoBox>
        </div>
      </section>

      {/* Skills Bento Grid */}
      <section className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">Technical Expertise</h2>
          <p className="text-gray-600 mt-2">Distributed systems, AI orchestration, production-grade applications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[180px]">
          {skills.map((skill, index) => (
            <BentoBox key={index} size="small" variant="default">
              <div className="text-4xl mb-3">{skill.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{skill.title}</h3>
              <ul className="space-y-1">
                {skill.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-xs text-gray-600 flex items-center">
                    <span className="text-violet-500 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </BentoBox>
          ))}
        </div>
      </section>

      {/* Projects Bento Grid */}
      <section id="projects-grid" className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">Production Systems</h2>
          <p className="text-gray-600 mt-2">Enterprise-grade applications in production</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[280px]">
          {projects.map((project, index) => (
            <BentoBox
              key={index}
              size="tall"
              variant={index === 0 ? 'highlight' : 'default'}
              className="flex flex-col"
            >
              <div className="flex-1">
                <div className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">
                  {project.category}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{project.title}</h3>
                <p className="text-sm text-gray-700 mb-4">{project.description}</p>

                {/* Metrics */}
                <div className="space-y-2 mb-4">
                  {project.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="flex items-center text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2" />
                      <span className="text-gray-600">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </BentoBox>
          ))}
        </div>
      </section>

      {/* About / Philosophy Bento Grid */}
      <section className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[160px]">
          {/* Philosophy Statement - Wide */}
          <BentoBox size="wide" variant="accent" className="md:col-span-4">
            <h3 className="text-2xl font-black text-gray-900 mb-3">The Approach</h3>
            <p className="text-gray-700 leading-relaxed">
              Twenty years of building systems taught me: <strong>code is easy, systems are hard.</strong>{' '}
              I architect for the failure modes nobody thinks about until 3am. Fortune 500 clients
              pay for systems that don't break. Startups hire me to build them the first time.
            </p>
          </BentoBox>

          {/* Quote Card */}
          <BentoBox size="medium" variant="highlight" className="md:col-span-2">
            <div className="text-5xl text-violet-300 mb-2">"</div>
            <p className="text-sm font-semibold text-gray-800 italic">
              Show me your systems in production. Everything else is just PowerPoint.
            </p>
          </BentoBox>

          {/* Values */}
          <BentoBox size="medium" variant="default" className="md:col-span-2">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Core Values</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-violet-500 mr-2">✓</span>
                <span>Production over promises</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-500 mr-2">✓</span>
                <span>Artifacts over resumes</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-500 mr-2">✓</span>
                <span>Systems over features</span>
              </li>
            </ul>
          </BentoBox>

          {/* Photography Passion */}
          <BentoBox size="large" variant="default" className="md:col-span-4">
            <h4 className="text-xl font-bold text-gray-900 mb-2">Beyond Code</h4>
            <p className="text-sm text-gray-700 mb-3">
              Published action sports photographer with work appearing in global publications.
              The same principles that make great code make great photographs: timing, composition,
              and knowing when to click the shutter.
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                📸 Published Worldwide
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                🏐 Volleyball Specialist
              </span>
            </div>
          </BentoBox>
        </div>
      </section>

      {/* Contact Bento Grid */}
      <section className="p-4 md:p-8 max-w-[1400px] mx-auto pb-20">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">Let's Connect</h2>
          <p className="text-gray-600 mt-2">Enterprise consulting, technical leadership, system architecture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[140px]">
          {/* Email CTA - Large */}
          <BentoBox size="large" variant="highlight" className="flex flex-col justify-center items-center text-center">
            <div className="text-4xl mb-3">✉️</div>
            <a
              href="mailto:hello@nino.photos"
              className="text-xl font-bold text-violet-700 hover:text-violet-900 transition-colors mb-2"
            >
              hello@nino.photos
            </a>
            <p className="text-sm text-gray-600">Primary contact for new engagements</p>
          </BentoBox>

          {/* Social Links */}
          <BentoBox size="small" variant="default" className="flex flex-col justify-center items-center">
            <a
              href="https://linkedin.com/in/nino-chavez"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center hover:scale-105 transition-transform"
            >
              <div className="text-3xl mb-2">💼</div>
              <div className="text-sm font-semibold text-gray-900">LinkedIn</div>
              <div className="text-xs text-gray-500">Professional network</div>
            </a>
          </BentoBox>

          <BentoBox size="small" variant="default" className="flex flex-col justify-center items-center">
            <a
              href="https://github.com/nino-chavez"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center hover:scale-105 transition-transform"
            >
              <div className="text-3xl mb-2">👨‍💻</div>
              <div className="text-sm font-semibold text-gray-900">GitHub</div>
              <div className="text-xs text-gray-500">Personal projects</div>
            </a>
          </BentoBox>

          <BentoBox size="small" variant="default" className="flex flex-col justify-center items-center">
            <a
              href="https://github.com/signal-x-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center hover:scale-105 transition-transform"
            >
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-sm font-semibold text-gray-900">Signal X</div>
              <div className="text-xs text-gray-500">Studio projects</div>
            </a>
          </BentoBox>
        </div>
      </section>

      {/* Styles */}
      <style jsx>{`
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Bento box hover effects */
        .bento-box {
          position: relative;
          overflow: hidden;
        }

        .bento-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .bento-box:hover::before {
          opacity: 1;
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
