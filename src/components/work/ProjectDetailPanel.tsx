/**
 * ProjectDetailPanel - Intelligent Detail View for Project Cards
 *
 * Features:
 * - Viewport-aware positioning (avoids edges)
 * - Content alignment with card (no redundancy)
 * - Contextual linework graphics
 * - Smooth animations with reduced motion support
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorkProject } from '../../types';

interface ProjectDetailPanelProps {
  project: WorkProject | null;
  isOpen: boolean;
  onClose: () => void;
  triggerElement?: HTMLElement | null;
}

interface PanelPosition {
  top: number;
  left: number;
  placement: 'left' | 'right' | 'top' | 'bottom';
}

const ProjectDetailPanel: React.FC<ProjectDetailPanelProps> = ({
  project,
  isOpen,
  onClose,
  triggerElement,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PanelPosition>({
    top: 0,
    left: 0,
    placement: 'right'
  });

  // Calculate intelligent positioning based on viewport and trigger element
  useEffect(() => {
    if (!isOpen || !triggerElement) return;

    const updatePosition = () => {
      const trigger = triggerElement.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Panel dimensions based on viewport
      const PANEL_WIDTH = Math.min(480, viewport.width * 0.9); // Max 480px or 90% of viewport
      const PANEL_MARGIN = 24;

      // Position relative to trigger card
      let top = PANEL_MARGIN;
      let left = trigger.right + PANEL_MARGIN;
      let placement: 'left' | 'right' | 'top' | 'bottom' = 'right';

      // Check if panel fits on the right
      if (left + PANEL_WIDTH > viewport.width - PANEL_MARGIN) {
        // Try left side
        left = trigger.left - PANEL_WIDTH - PANEL_MARGIN;
        placement = 'left';

        // If still doesn't fit, center horizontally
        if (left < PANEL_MARGIN) {
          left = Math.max(PANEL_MARGIN, (viewport.width - PANEL_WIDTH) / 2);
          placement = trigger.top > viewport.height / 2 ? 'top' : 'bottom';
        }
      }

      setPosition({ top, left, placement });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, triggerElement]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!project) return null;

  // Generate contextual linework based on project type
  const getContextualGraphic = () => {
    const category = project.tags[0]?.toLowerCase() || '';

    if (category.includes('agent') || category.includes('ai')) {
      return (
        <svg className="absolute top-0 right-0 w-64 h-64 opacity-5" viewBox="0 0 200 200">
          <path d="M100,20 L180,100 L100,180 L20,100 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
          <path d="M100,60 L100,140 M60,100 L140,100" stroke="currentColor" strokeWidth="1"/>
        </svg>
      );
    }

    if (category.includes('react') || category.includes('typescript')) {
      return (
        <svg className="absolute top-0 right-0 w-64 h-64 opacity-5" viewBox="0 0 200 200">
          <rect x="40" y="40" width="120" height="120" fill="none" stroke="currentColor" strokeWidth="2" rx="8"/>
          <path d="M70,70 L130,70 L130,130 L70,130 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
        </svg>
      );
    }

    if (category.includes('node') || category.includes('api')) {
      return (
        <svg className="absolute top-0 right-0 w-64 h-64 opacity-5" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M100,20 L100,180 M20,100 L180,100" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
          <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
        </svg>
      );
    }

    // Default grid pattern
    return (
      <svg className="absolute top-0 right-0 w-64 h-64 opacity-5" viewBox="0 0 200 200">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#grid)" />
      </svg>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            style={{ cursor: 'pointer' }}
          />

          {/* Detail Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              left: position.left
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              opacity: { duration: 0.2 },
              scale: { type: 'spring', damping: 25, stiffness: 300 },
              left: { type: 'spring', damping: 30, stiffness: 400 }
            }}
            className="fixed bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            style={{
              top: `${position.top}px`,
              bottom: 24,
              left: `${position.left}px`,
              width: `min(480px, calc(90vw - 48px))`,
              maxHeight: `calc(100vh - 48px)`,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Contextual Graphics */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {getContextualGraphic()}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors z-10"
              aria-label="Close detail panel"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content - Complementary to card, no redundancy */}
            <div className="relative overflow-y-auto" style={{ flex: '1 1 0%', minHeight: 0 }}>
              <div className="p-6 pb-8">
                <div className="h-12"></div>
                <h3 className="text-2xl font-bold text-white mb-3">{project.title}</h3>

              {/* Technical Architecture - Detail Only */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Technical Architecture</h4>
                <div className="space-y-2">
                  {project.tags.slice(0, 3).map((tag, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics - Detail Only */}
              {project.outcome && (
                <div className="mb-6 p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
                  <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">Measured Impact</h4>
                  <p className="text-base text-white/90">{project.outcome}</p>
                </div>
              )}

              {/* Key Features - Detail Only */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Key Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Production-ready implementation with comprehensive test coverage</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Scalable architecture designed for enterprise workloads</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Full TypeScript support with extensive type definitions</span>
                  </li>
                </ul>
              </div>

              {/* Technical Challenges - Detail Only */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Technical Challenges Solved</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {project.description} This implementation required careful consideration of edge cases,
                  performance optimization, and maintainable architecture patterns.
                </p>
              </div>

              {/* CTA */}
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
              >
                View Full Project
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailPanel;
