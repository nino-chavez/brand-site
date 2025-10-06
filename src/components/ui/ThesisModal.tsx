/**
 * ThesisModal Component
 *
 * Modal overlay displaying professional philosophy and "Why Now?" narrative.
 * Triggered by optional deeplink for visitors seeking deeper context.
 * Enhanced with Framer Motion spring animations and stagger effects.
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export interface ThesisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThesisModal: React.FC<ThesisModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap and initial focus
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Focus the close button when modal opens
    const closeButton = modal.querySelector<HTMLButtonElement>('[data-close-button]');
    closeButton?.focus();
  }, [isOpen]);

  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="thesis-modal-overlay"
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="thesis-modal-title"
          ref={modalRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="thesis-modal-panel"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
          >
        {/* Close button */}
        <button
          className="thesis-modal-close"
          onClick={onClose}
          aria-label="Close modal"
          data-close-button
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Content */}
        <h2 id="thesis-modal-title" className="thesis-modal-title">
          The Architect's Principle: From Line Cook to Master Chef
        </h2>

        <div className="thesis-modal-content">
          <p className="thesis-modal-intro">
            The AI industry has a systemic flaw: it is full of brilliant line cooks. We have tacticians executing disconnected recipes with incredible speed, optimizing for output without a coherent vision. The result is chaos—a kitchen that produces impressive but inconsistent dishes while burning through resources.
          </p>
          <p className="thesis-modal-intro">
            This is not a tooling problem. It is a leadership problem. The solution is The Chef's Protocol: a constitutional framework that enforces architectural rigor across AI-assisted development. It distinguishes between AI-Augmented (efficiency gains on known patterns) and AI-Native (fundamentally new capabilities). The artifact is the system that ensures every AI interaction produces production-grade, maintainable code.
          </p>

          <h3 className="thesis-modal-section-heading">1. Mastering the Fundamentals</h3>
          <p>
            Every great chef begins by mastering the fundamentals. They learn the discipline of a Michelin star kitchen—the non-negotiable standards, the importance of <em>mise en place</em>, and how to execute a classic French mother sauce before attempting to deconstruct it. This is the foundation of traditional software architecture: mastering system design before trying to innovate.
          </p>

          <h3 className="thesis-modal-section-heading">2. Architecting the System</h3>
          <p>
            The shift from cook to chef happens when the focus moves from executing a single dish to architecting the entire system. A successful restaurant is a <strong className="thesis-modal-emphasis">high-agency environment</strong> designed to maximize <strong className="thesis-modal-emphasis">signal</strong> (diner satisfaction) over <strong className="thesis-modal-emphasis">noise</strong> (wasted motion, returned dishes).
          </p>
          <p>
            Resilience is a systems problem. A kitchen that collapses during the dinner rush has a systems failure, not an individual one. The Master Chef's primary role is to architect the system that produces consistently excellent dishes under pressure.
          </p>

          <h3 className="thesis-modal-section-heading">3. Sourcing the Ingredients</h3>
          <p>
            With a robust system, the chef sources new, powerful ingredients to design the menu:
          </p>
          <ul className="thesis-modal-list">
            <li><strong>Large Language Models (LLMs)</strong> are the universal principles of flavor—the salt, fat, acid, and heat that form the foundation of all great cuisines.</li>
            <li><strong>Generative AI</strong> is the art of plating and presentation, transforming core ingredients into something visually arresting.</li>
            <li><strong>Agentic AI</strong> is molecular gastronomy—the experimental frontier that changes our fundamental understanding of what a dish can be.</li>
            <li><strong>Data-centric AI</strong> is the farm-to-table movement, a return to the foundational truth that the quality of the dish is always limited by the quality of the ingredients.</li>
          </ul>

          <h3 className="thesis-modal-section-heading">4. The Artifact: The Chef's Protocol</h3>
          <p>
            A philosophy is not a business model. This approach is codified into a tangible, operational framework: <strong className="thesis-modal-emphasis">The Chef's Protocol.</strong>
          </p>
          <p>
            It is a system for building AI-native products with rigor and taste. It distinguishes between two clear mandates:
          </p>
          <div className="thesis-modal-two-col">
            <div>
              <h4 className="thesis-modal-sub-heading">Elevating the Classics (AI-Augmented)</h4>
              <p>
                Using a modern technique to perfect a well-understood dish, making it more efficient and refined.
              </p>
            </div>
            <div>
              <h4 className="thesis-modal-sub-heading">Deriving the Unique (AI-Native)</h4>
              <p>
                Using new ingredients to create dishes with no precedent, solving problems that were previously unsolvable.
              </p>
            </div>
          </div>

          <p className="thesis-modal-closing">
            The protocol is the artifact of the Master Chef's work. It is not a recipe. It is the system that creates the menu, ensuring every action is a calculated, de-risked decision that moves us from chaos to clarity.
          </p>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const modalWithStyles = (
    <div>
      {modalContent}
      <style jsx>{`
        /* Overlay */
        .thesis-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Modal panel */
        .thesis-modal-panel {
          position: relative;
          background-color: rgb(17, 24, 39); /* gray-900 */
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 2rem;
          max-width: 42rem; /* 672px */
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Close button */
        .thesis-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .thesis-modal-close:hover {
          color: rgba(255, 255, 255, 0.9);
          background-color: rgba(255, 255, 255, 0.1);
        }

        .thesis-modal-close:focus {
          outline: 2px solid rgba(255, 255, 255, 0.4);
          outline-offset: 2px;
        }

        /* Title */
        .thesis-modal-title {
          font-size: 1.875rem; /* 30px */
          font-weight: 700;
          color: white;
          margin-bottom: 1.5rem;
          padding-right: 3rem; /* Space for close button */
        }

        /* Content */
        .thesis-modal-content {
          color: rgb(209, 213, 219); /* gray-300 */
          line-height: 1.75; /* leading-relaxed */
          font-size: 1.0625rem; /* 17px */
          max-width: 70ch; /* Optimal line length for readability */
          margin-left: auto;
          margin-right: auto;
        }

        .thesis-modal-content p {
          margin-bottom: 1rem;
        }

        .thesis-modal-content p:last-child {
          margin-bottom: 0;
        }

        .thesis-modal-intro {
          font-size: 1.25rem; /* 20px */
          font-weight: 500;
          color: white;
          margin-bottom: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
          border-left: 3px solid rgba(139, 92, 246, 0.6);
          border-radius: 0 0.25rem 0.25rem 0;
        }

        .thesis-modal-section-heading {
          font-size: 1.25rem; /* 20px */
          font-weight: 600;
          color: rgba(139, 92, 246, 1);
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .thesis-modal-sub-heading {
          font-size: 1.125rem; /* 18px */
          font-weight: 600;
          color: rgba(139, 92, 246, 0.9);
          margin-bottom: 0.5rem;
        }

        .thesis-modal-list {
          margin: 1rem 0 1.5rem 1.5rem;
          list-style: none;
          padding: 0;
        }

        .thesis-modal-list li {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
          position: relative;
        }

        .thesis-modal-list li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: rgb(209, 213, 219); /* Match body text for consistency */
          font-weight: normal;
        }

        .thesis-modal-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin: 1.5rem 0;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .thesis-modal-emphasis {
          font-weight: 700;
          color: white;
        }

        .thesis-modal-content em {
          font-style: italic;
          color: rgba(167, 139, 250, 1); /* Brighter purple for better contrast */
          text-decoration: underline;
          text-decoration-color: rgba(167, 139, 250, 0.4);
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
        }

        .thesis-modal-closing {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 1.125rem; /* 18px */
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.9);
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .thesis-modal-panel {
            padding: 1.5rem;
            max-height: 85vh;
          }

          .thesis-modal-title {
            font-size: 1.5rem; /* 24px */
            padding-right: 2.5rem;
          }

          .thesis-modal-content {
            font-size: 1rem; /* 16px */
          }

          .thesis-modal-intro {
            font-size: 1.125rem; /* 18px */
          }

          .thesis-modal-section-heading {
            font-size: 1.125rem; /* 18px */
          }

          .thesis-modal-sub-heading {
            font-size: 1rem; /* 16px */
          }

          .thesis-modal-two-col {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
          }

          .thesis-modal-closing {
            font-size: 1rem; /* 16px */
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .thesis-modal-overlay,
          .thesis-modal-panel {
            animation: none;
          }

          .thesis-modal-close {
            transition: none;
          }
        }
      `}</style>
    </div>
  );

  // Render modal using portal to ensure it's positioned relative to viewport
  return createPortal(modalWithStyles, document.body);
};

/**
 * ThesisModalTrigger Component
 *
 * Subtle text link that opens the thesis modal.
 * Intended for placement under section headings.
 */

interface ThesisModalTriggerProps {
  onClick: () => void;
}

export const ThesisModalTrigger: React.FC<ThesisModalTriggerProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Read the architect's principle"
      className="text-sm font-medium text-violet-400 hover:text-violet-300 underline underline-offset-2 decoration-violet-400/40 hover:decoration-violet-300/60 px-2 py-1 rounded hover:bg-violet-400/10 transition-all duration-200 focus:outline-2 focus:outline-violet-400/50 focus:outline-offset-2"
    >
      The Architect's Principle
    </button>
  );
};
