/**
 * Cross-Site Content Discovery
 *
 * "Find more like this" functionality across blog.nino.photos and gallery.nino.photos.
 * Pure client-side similarity search - zero runtime API cost.
 *
 * Features:
 * - Semantic search across all Nino properties
 * - Links out to relevant blog posts and photos
 * - Intelligent recommendations based on current context
 *
 * Cost: $0 runtime (pre-computed embeddings, client-side similarity)
 *
 * @fileoverview Cross-site content recommendation engine
 * @version 1.0.0
 */

import React, { useMemo, useState } from 'react';
import crossSiteContent from '../../data/crossSiteContent.json';

interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  site: 'blog' | 'gallery';
  embedding: number[];
  tags: string[];
  publishedAt: string;
}

interface Match extends Omit<ContentItem, 'embedding'> {
  score: number;
}

export interface ContentDiscoveryProps {
  /** Current page context for recommendations */
  context?: string;
  /** Pre-computed embedding for current context (if available) */
  contextEmbedding?: number[];
  /** Maximum number of recommendations */
  maxResults?: number;
  /** Filter by site */
  siteFilter?: 'blog' | 'gallery' | 'all';
}

export const ContentDiscovery: React.FC<ContentDiscoveryProps> = ({
  context = '',
  contextEmbedding,
  maxResults = 5,
  siteFilter = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [manualSearch, setManualSearch] = useState(false);

  // Compute recommendations
  const recommendations = useMemo(() => {
    const typed = crossSiteContent as ContentItem[];

    // If we have a context embedding, use it
    if (contextEmbedding && contextEmbedding.length > 0) {
      const scored: Match[] = typed.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        url: item.url,
        site: item.site,
        tags: item.tags,
        publishedAt: item.publishedAt,
        score: cosineSimilarity(contextEmbedding, item.embedding)
      }));

      return scored
        .filter(item => siteFilter === 'all' || item.site === siteFilter)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .filter(m => m.score > 0.3);
    }

    // Fallback: keyword matching based on context or search query
    const query = (manualSearch ? searchQuery : context).toLowerCase();
    if (!query) {
      // No context - show recent items
      return typed
        .filter(item => siteFilter === 'all' || item.site === siteFilter)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, maxResults)
        .map(item => ({ ...item, score: 0.5 }));
    }

    const keywords = query.split(' ').filter(k => k.length > 2);

    const scored: Match[] = typed.map(item => {
      const combined = `${item.title} ${item.excerpt} ${item.tags.join(' ')}`.toLowerCase();
      let score = 0;

      keywords.forEach(keyword => {
        if (combined.includes(keyword)) {
          score += 0.3;
        }
      });

      return {
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        url: item.url,
        site: item.site,
        tags: item.tags,
        publishedAt: item.publishedAt,
        score: Math.min(score, 1.0)
      };
    });

    return scored
      .filter(item => siteFilter === 'all' || item.site === siteFilter)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .filter(m => m.score > 0.3);
  }, [context, contextEmbedding, maxResults, siteFilter, searchQuery, manualSearch]);

  const handleSearch = () => {
    setManualSearch(true);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          More from Nino
        </h3>

        {/* Search */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search across blog & gallery..."
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {recommendations.map(item => {
          const isBlog = item.site === 'blog';

          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border border-gray-200 group"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  isBlog ? 'bg-blue-100' : 'bg-violet-100'
                }`}>
                  {isBlog ? '📝' : '📷'}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Site badge & Relevance */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isBlog
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-violet-100 text-violet-800'
                    }`}>
                      {isBlog ? 'Blog Post' : 'Gallery Photo'}
                    </span>

                    {item.score > 0.7 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Highly Relevant
                      </span>
                    )}

                    <span className="text-xs text-gray-500">
                      {new Date(item.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors line-clamp-1">
                    {item.title}
                  </h4>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {item.excerpt}
                  </p>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 4).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{item.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-violet-600 group-hover:translate-x-1 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </a>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-600 text-center">
          Discover more on{' '}
          <a
            href="https://blog.nino.photos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            blog.nino.photos
          </a>
          {' '}and{' '}
          <a
            href="https://gallery.nino.photos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            gallery.nino.photos
          </a>
        </p>
      </div>
    </div>
  );
};

/**
 * Compute cosine similarity
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

export default ContentDiscovery;

/**
 * Hook for embedding content discovery in sections
 */
export function useContentDiscovery(context: string, maxResults = 3) {
  return useMemo(() => {
    const typed = crossSiteContent as ContentItem[];
    const keywords = context.toLowerCase().split(' ').filter(k => k.length > 2);

    const scored = typed.map(item => {
      const combined = `${item.title} ${item.excerpt} ${item.tags.join(' ')}`.toLowerCase();
      let score = 0;

      keywords.forEach(keyword => {
        if (combined.includes(keyword)) {
          score += 0.3;
        }
      });

      return { ...item, score: Math.min(score, 1.0) };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .filter(m => m.score > 0.3);
  }, [context, maxResults]);
}
