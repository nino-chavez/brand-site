import React from 'react';
import { motion } from 'framer-motion';

/**
 * JourneySection Component
 *
 * Showcases the evolution from the 2024 photography-focused site to the current
 * full-stack engineering portfolio. Demonstrates technical growth and learning journey.
 */
export const JourneySection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-neutral-900 py-20">
      <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Journey
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
            From photography portfolio to full-stack platform — a 3-month evolution
            in technical capability and architectural thinking.
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* 2024 Legacy Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-8 border border-neutral-700/50 hover:border-neutral-600/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📸</span>
              <div>
                <h3 className="text-2xl font-bold text-white">2024 Legacy</h3>
                <p className="text-sm text-neutral-400">Built with ChatGPT</p>
              </div>
            </div>

            <p className="text-neutral-300 mb-6">
              Photography-first design with image carousel, visual storytelling,
              and creative expression. Pure HTML/CSS/JS.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 text-sm">Static HTML/CSS/JavaScript</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 text-sm">Image carousel & visual effects</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 text-sm">Photography-centric narrative</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 text-sm">Manual deployment workflow</span>
              </div>
            </div>

            <a
              href="/2024-legacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              View Legacy Site
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.div>

          {/* Current Platform Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-neutral-800/70 to-neutral-900/70 backdrop-blur-sm rounded-lg p-8 border border-blue-500/30 hover:border-blue-400/50 transition-colors shadow-lg shadow-blue-500/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚡</span>
              <div>
                <h3 className="text-2xl font-bold text-white">Current Platform</h3>
                <p className="text-sm text-blue-400">Built with Claude + Agent OS</p>
              </div>
            </div>

            <p className="text-neutral-300 mb-6">
              Enterprise-grade React platform with TypeScript, automated testing,
              accessibility compliance, and AI-assisted development workflow.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span className="text-neutral-300 text-sm font-medium">React 19 + TypeScript + Vite</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span className="text-neutral-300 text-sm font-medium">95%+ test coverage with Vitest</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span className="text-neutral-300 text-sm font-medium">WCAG 2.2 AA accessibility</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span className="text-neutral-300 text-sm font-medium">Automated quality gates & CI/CD</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span className="text-neutral-300 text-sm font-medium">Agent OS workflow automation</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-blue-400 font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              You're viewing it now
            </div>
          </motion.div>
        </div>

        {/* Evolution Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-neutral-800/30 backdrop-blur-sm rounded-lg p-8 border border-neutral-700/50"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Key Technical Evolution
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏗️</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Architecture</h4>
              <p className="text-sm text-neutral-400">
                From inline scripts to modular components, hooks, and design systems
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🧪</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Quality Assurance</h4>
              <p className="text-sm text-neutral-400">
                From manual testing to automated test suites, coverage tracking, and CI/CD
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-semibold text-white mb-2">AI Collaboration</h4>
              <p className="text-sm text-neutral-400">
                From ChatGPT conversations to Agent OS with specialized quality gates
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-neutral-400 text-sm">
            This evolution produced three artifacts: enterprise-grade React architecture (97 Lighthouse score), autonomous quality enforcement (5 blocking agents), and work preservation infrastructure (95% loss reduction). The deliverables prove the claim.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default JourneySection;
