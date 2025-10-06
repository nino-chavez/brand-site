/**
 * Skill Matcher
 *
 * Semantic search across Nino's skills and experience.
 * Query: "event-driven microservices with TypeScript"
 * → Finds relevant projects, skills, and achievements
 *
 * Cost: $0.0001 per search (embedding query only, similarity computed client-side)
 * All project embeddings pre-computed at build time.
 *
 * @fileoverview AI-powered semantic skill search
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import skillEmbeddings from '../../data/skillEmbeddings.json';
import { rateLimiter, getUserIdentifier } from '../../utils/rateLimiter';
import { botDetector } from '../../utils/botDetection';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface SkillEmbedding {
  id: string;
  text: string;
  embedding: number[];
  category: 'project' | 'skill' | 'experience' | 'achievement';
  section: string;
  tags: string[];
}

interface Match extends Omit<SkillEmbedding, 'embedding'> {
  score: number;
}

/**
 * Category icons and colors
 */
const CATEGORY_CONFIG = {
  project: {
    icon: '🚀',
    label: 'Project',
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  skill: {
    icon: '⚡',
    label: 'Skill',
    color: 'text-violet-600 bg-violet-50 border-violet-200'
  },
  experience: {
    icon: '💼',
    label: 'Experience',
    color: 'text-green-600 bg-green-50 border-green-200'
  },
  achievement: {
    icon: '🏆',
    label: 'Achievement',
    color: 'text-amber-600 bg-amber-50 border-amber-200'
  }
};

export const SkillMatcher: React.FC = () => {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Honeypot for bot detection
  const [honeypot, setHoneypot] = useState('');

  const handleSearch = async () => {
    setError(null);

    if (!genAI) {
      // Fallback: keyword-based matching when no API key
      performKeywordMatch(query);
      return;
    }

    if (query.trim().length < 3) {
      setError('Please enter at least 3 characters');
      return;
    }

    // Rate limiting
    const userIdentifier = await getUserIdentifier();
    const rateLimitCheck = await rateLimiter.checkLimit(
      userIdentifier,
      'skill-matcher',
      0.0001 // Very cheap - just embedding the query
    );

    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.reason || 'Rate limit exceeded');
      return;
    }

    // Bot detection
    const botCheck = await botDetector.checkRequest({
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      honeypot,
      timing: botDetector.getFormDuration()
    });

    if (botCheck.isBot) {
      setError('Suspicious activity detected');
      return;
    }

    setLoading(true);

    try {
      // Generate embedding for query
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(query);
      const queryEmbedding = result.embedding.values;

      // Compute similarity with all skill embeddings (client-side)
      const scored: Match[] = (skillEmbeddings as SkillEmbedding[]).map(skill => ({
        id: skill.id,
        text: skill.text,
        category: skill.category,
        section: skill.section,
        tags: skill.tags,
        score: cosineSimilarity(queryEmbedding, skill.embedding)
      }));

      // Sort by relevance and take top 8
      const topMatches = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .filter(m => m.score > 0.3); // Only show reasonably relevant matches

      setMatches(topMatches);

      // Add to search history
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev].slice(0, 5));
      }
    } catch (err) {
      console.error('Skill matching failed:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fallback: Simple keyword matching when no API key available
   */
  const performKeywordMatch = (searchQuery: string) => {
    const keywords = searchQuery.toLowerCase().split(' ').filter(k => k.length > 2);

    const scored: Match[] = (skillEmbeddings as SkillEmbedding[]).map(skill => {
      const textLower = skill.text.toLowerCase();
      const tagsLower = skill.tags.join(' ').toLowerCase();
      const combined = `${textLower} ${tagsLower}`;

      let score = 0;
      keywords.forEach(keyword => {
        if (combined.includes(keyword)) {
          score += 0.3;
        }
      });

      return {
        id: skill.id,
        text: skill.text,
        category: skill.category,
        section: skill.section,
        tags: skill.tags,
        score: Math.min(score, 1.0)
      };
    });

    const topMatches = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .filter(m => m.score > 0.3);

    setMatches(topMatches);
  };

  const handleExampleSearch = (example: string) => {
    setQuery(example);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const exampleQueries = [
    'event-driven microservices with TypeScript',
    'React performance optimization',
    'healthcare data integration HIPAA',
    'real-time dashboards with WebSocket',
    'Kubernetes container orchestration',
    'action sports photography'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Skill Matcher
        </h1>
        <p className="text-gray-600">
          Describe what you're looking for and discover Nino's relevant experience
        </p>
      </div>

      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: 'absolute', left: '-9999px' }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Search Input */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => botDetector.markFormStart()}
            placeholder="e.g., event-driven architecture with TypeScript..."
            className="w-full px-4 py-4 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg"
          />
          <button
            onClick={handleSearch}
            disabled={!query || loading}
            className="absolute right-2 top-2 bottom-2 px-6 bg-violet-600 text-white rounded-md font-medium hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Searching...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {!genAI && matches.length === 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <span className="font-medium">Demo mode:</span> Using keyword matching.
            Configure VITE_GEMINI_API_KEY for semantic search.
          </div>
        )}
      </div>

      {/* Example Queries */}
      {matches.length === 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Try these examples:
          </h3>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, i) => (
              <button
                key={i}
                onClick={() => handleExampleSearch(example)}
                className="px-4 py-2 bg-gray-100 hover:bg-violet-100 hover:text-violet-700 rounded-lg text-sm transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && matches.length === 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Recent searches:
          </h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((historyQuery, i) => (
              <button
                key={i}
                onClick={() => handleExampleSearch(historyQuery)}
                className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-sm hover:bg-violet-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {historyQuery}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Found {matches.length} relevant {matches.length === 1 ? 'match' : 'matches'}
            </h2>
            <button
              onClick={() => {
                setMatches([]);
                setQuery('');
              }}
              className="text-sm text-violet-600 hover:text-violet-700"
            >
              Clear results
            </button>
          </div>

          {matches.map((match, index) => {
            const config = CATEGORY_CONFIG[match.category];

            return (
              <div
                key={match.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Category & Score */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                        <span>{config.icon}</span>
                        {config.label}
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {Math.round(match.score * 100)}% match
                      </span>

                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {match.section}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {match.text}
                    </p>

                    {/* Tags */}
                    {match.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {match.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      {matches.length === 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-violet-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            How Skill Matching Works
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span>Describe what you're looking for in natural language</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span>AI finds semantically relevant projects, skills, and experience</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span>Results ranked by relevance with match percentage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span>Search across 24 projects, skills, and achievements</span>
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-violet-200 text-xs text-violet-700">
            <p>
              💡 <span className="font-medium">Tip:</span> Be specific! "React performance optimization"
              works better than just "React"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
}

export default SkillMatcher;
