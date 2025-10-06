/**
 * Contextual Recommendations Component
 *
 * Displays "You might also like" suggestions based on current section.
 * Uses pre-computed recommendations (zero runtime cost).
 *
 * @fileoverview Zero-cost contextual navigation suggestions
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import recommendations from '../../data/recommendations.json';

export interface ContextualRecommendationsProps {
  currentSection: 'capture' | 'focus' | 'frame' | 'exposure' | 'develop' | 'portfolio';
  onNavigate?: (section: string) => void;
  maxRecommendations?: number;
}

interface Recommendation {
  sourceSection: string;
  targetSection: string;
  reason: string;
  confidence: number;
  keywords: string[];
}

/**
 * Format section names for display
 */
const SECTION_DISPLAY_NAMES: Record<string, string> = {
  capture: 'Capture',
  focus: 'Focus',
  frame: 'Frame',
  exposure: 'Exposure',
  develop: 'Develop',
  portfolio: 'Portfolio'
};

/**
 * Section icons (photography metaphor)
 */
const SECTION_ICONS: Record<string, string> = {
  capture: '📸',
  focus: '🎯',
  frame: '🖼️',
  exposure: '💡',
  develop: '⚙️',
  portfolio: '🎨'
};

export const ContextualRecommendations: React.FC<ContextualRecommendationsProps> = ({
  currentSection,
  onNavigate,
  maxRecommendations = 3
}) => {
  // Filter and sort recommendations for current section
  const relevantRecommendations = useMemo(() => {
    const typed = recommendations as Recommendation[];

    return typed
      .filter(rec => rec.sourceSection === currentSection && rec.confidence >= 0.75)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxRecommendations);
  }, [currentSection, maxRecommendations]);

  // Don't render if no recommendations
  if (relevantRecommendations.length === 0) {
    return null;
  }

  const handleClick = (targetSection: string) => {
    if (onNavigate) {
      onNavigate(targetSection);
    } else {
      // Fallback: dispatch custom event that canvas can listen to
      window.dispatchEvent(
        new CustomEvent('navigate-to-section', {
          detail: { section: targetSection }
        })
      );
    }
  };

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 text-violet-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-violet-900">
          You might also like
        </h3>
      </div>

      <div className="space-y-2">
        {relevantRecommendations.map((rec, index) => (
          <button
            key={`${rec.targetSection}-${index}`}
            onClick={() => handleClick(rec.targetSection)}
            className="block w-full text-left p-4 bg-white rounded-lg hover:bg-violet-100 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                {SECTION_ICONS[rec.targetSection] || '📄'}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {SECTION_DISPLAY_NAMES[rec.targetSection] || rec.targetSection}
                  </span>

                  {rec.confidence >= 0.9 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-800">
                      Highly Relevant
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 leading-snug">
                  {rec.reason}
                </p>

                {rec.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.keywords.slice(0, 3).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-violet-50 text-violet-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <svg
                className="w-5 h-5 text-violet-400 flex-shrink-0 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-violet-200">
        <p className="text-xs text-violet-700 text-center">
          Smart suggestions • Zero tracking • Privacy-first
        </p>
      </div>
    </div>
  );
};

export default ContextualRecommendations;

/**
 * Hook to get recommendations for current section
 */
export function useRecommendations(currentSection: string, maxRecommendations = 3) {
  return useMemo(() => {
    const typed = recommendations as Recommendation[];

    return typed
      .filter(rec => rec.sourceSection === currentSection && rec.confidence >= 0.75)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxRecommendations);
  }, [currentSection, maxRecommendations]);
}
