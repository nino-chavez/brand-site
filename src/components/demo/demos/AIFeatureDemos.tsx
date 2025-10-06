/**
 * AI Feature Demos - AI-powered component demonstrations
 *
 * Showcases all AI features with live controls and examples.
 */

import React, { useState } from 'react';
import { SmartResumeGenerator } from '../../ai/SmartResumeGenerator';
import { RecruiterMatchAnalyzer } from '../../ai/RecruiterMatchAnalyzer';
import { SkillMatcher } from '../../ai/SkillMatcher';
import { CompositionAnalyzer } from '../../ai/CompositionAnalyzer';
import { ContentDiscovery } from '../../ai/ContentDiscovery';
import { ContextualRecommendations } from '../../ai/ContextualRecommendations';
import { CostDashboard } from '../../ai/CostDashboard';

/**
 * Resume Generator Demo (Job Seeker Tool)
 */
export const ResumeGeneratorDemo: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
        <h4 className="text-sm font-semibold text-violet-900 mb-2">💡 About This Feature (Job Seeker Tool)</h4>
        <p className="text-sm text-violet-800 mb-2">
          <strong>For job seekers:</strong> Paste a job description to generate a tailored resume highlighting relevant experience for that specific role.
        </p>
        <div className="flex items-center gap-4 text-xs text-violet-700">
          <span>💰 Cost: ~$0.002 per generation</span>
          <span>🛡️ Protected: 5/hour rate limit</span>
          <span>🔒 Bot detection active</span>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-6">
        <SmartResumeGenerator />
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">IMPLEMENTATION NOTES</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Uses Gemini Pro for content generation</li>
          <li>• Rate limited to prevent abuse (10 requests/hour per IP)</li>
          <li>• CAPTCHA triggers after 3 rapid requests</li>
          <li>• Honeypot field for bot detection</li>
          <li>• Exports to Markdown and PDF</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Recruiter Match Analyzer Demo (Recruiter Tool)
 */
export const RecruiterMatchAnalyzerDemo: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 About This Feature (Recruiter Tool)</h4>
        <p className="text-sm text-blue-800 mb-2">
          <strong>For recruiters:</strong> Paste a job description to get a detailed analysis of how well Nino matches the requirements, including match score, strong points, gaps, and interview recommendations.
        </p>
        <div className="flex items-center gap-4 text-xs text-blue-700">
          <span>💰 Cost: ~$0.002 per analysis</span>
          <span>🛡️ Protected: 10/session rate limit</span>
          <span>📊 Structured output format</span>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-6">
        <RecruiterMatchAnalyzer />
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">IMPLEMENTATION NOTES</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Analyzes candidate fit with match score (0-100)</li>
          <li>• Identifies strong matches with specific examples</li>
          <li>• Highlights potential gaps constructively</li>
          <li>• Provides interview focus areas</li>
          <li>• Includes cultural fit assessment</li>
          <li>• Clear hiring recommendation (Strong Hire/Hire/Maybe/Pass)</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Skill Matcher Demo
 */
export const SkillMatcherDemo: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
        <h4 className="text-sm font-semibold text-violet-900 mb-2">💡 About This Feature</h4>
        <p className="text-sm text-violet-800 mb-2">
          Semantic search across 24 skills, projects, and achievements using AI embeddings.
        </p>
        <div className="flex items-center gap-4 text-xs text-violet-700">
          <span>💰 Cost: ~$0.0001 per search</span>
          <span>📦 491KB embeddings data</span>
          <span>🔍 Client-side similarity</span>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-6">
        <SkillMatcher />
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">IMPLEMENTATION NOTES</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Pre-computed embeddings at build time</li>
          <li>• Cosine similarity computed client-side</li>
          <li>• Falls back to keyword matching without API key</li>
          <li>• Search history persisted locally</li>
          <li>• Example queries for quick testing</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Composition Analyzer Demo
 */
export const CompositionAnalyzerDemo: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
        <h4 className="text-sm font-semibold text-violet-900 mb-2">💡 About This Feature</h4>
        <p className="text-sm text-violet-800 mb-2">
          Upload action sports photos to receive professional composition analysis from AI.
        </p>
        <div className="flex items-center gap-4 text-xs text-violet-700">
          <span>💰 Cost: ~$0.005 per analysis</span>
          <span>📸 5MB max file size</span>
          <span>💾 Cached responses</span>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-6">
        <CompositionAnalyzer />
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">IMPLEMENTATION NOTES</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Uses Gemini Vision for image analysis</li>
          <li>• Response caching by image hash (SHA-256)</li>
          <li>• 3 analyses per session limit</li>
          <li>• Analyzes: composition, lighting, timing, technical settings</li>
          <li>• Drag-and-drop file upload</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Content Discovery Demo
 */
export const ContentDiscoveryDemo: React.FC = () => {
  const [context, setContext] = useState('event-driven architecture and photography');
  const [maxResults, setMaxResults] = useState(5);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
        <h4 className="text-sm font-semibold text-violet-900 mb-2">💡 About This Feature</h4>
        <p className="text-sm text-violet-800 mb-2">
          "Find more like this" across blog.nino.photos and gallery.nino.photos using semantic search.
        </p>
        <div className="flex items-center gap-4 text-xs text-violet-700">
          <span>💰 Cost: $0 (pre-computed)</span>
          <span>📦 206KB content data</span>
          <span>🌐 Cross-site discovery</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Context
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded text-white text-sm"
              placeholder="e.g., React performance optimization"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Results: {maxResults}
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-6">
          <ContentDiscovery
            context={context}
            maxResults={maxResults}
            siteFilter="all"
          />
        </div>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">IMPLEMENTATION NOTES</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• No custom model training required</li>
          <li>• Pre-computed embeddings for blog posts and photos</li>
          <li>• Client-side similarity search (cosine distance)</li>
          <li>• Links out to blog.nino.photos and gallery.nino.photos</li>
          <li>• Mock data in development (10 items)</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Contextual Recommendations Demo
 */
export const ContextualRecommendationsDemo: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<'capture' | 'focus' | 'frame' | 'exposure' | 'develop' | 'portfolio'>('develop');

  return (
    <div className="space-y-4">
      <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
        <h4 className="text-sm font-semibold text-violet-900 mb-2">💡 About This Feature</h4>
        <p className="text-sm text-violet-800 mb-2">
          Smart navigation suggestions based on current portfolio section.
        </p>
        <div className="flex items-center gap-4 text-xs text-violet-700">
          <span>💰 Cost: $0 (build-time)</span>
          <span>📊 16 recommendations</span>
          <span>🎯 86.6% avg confidence</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Current Section
        </label>
        <select
          value={currentSection}
          onChange={(e) => setCurrentSection(e.target.value as any)}
          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded text-white text-sm"
        >
          <option value="capture">Capture</option>
          <option value="focus">Focus</option>
          <option value="frame">Frame</option>
          <option value="exposure">Exposure</option>
          <option value="develop">Develop</option>
          <option value="portfolio">Portfolio</option>
        </select>
      </div>

      <div className="bg-black/20 rounded-lg p-6">
        <ContextualRecommendations
          currentSection={currentSection}
          maxRecommendations={3}
        />
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">IMPLEMENTATION NOTES</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Generated at build time (zero runtime cost)</li>
          <li>• Manually curated for high quality</li>
          <li>• Photography metaphor icons and styling</li>
          <li>• Confidence scoring for relevance</li>
          <li>• Keyword tags for context</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Cost Dashboard Demo
 */
export const CostDashboardDemo: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
        <h4 className="text-sm font-semibold text-violet-900 mb-2">💡 About This Feature</h4>
        <p className="text-sm text-violet-800 mb-2">
          Real-time monitoring of AI feature usage and costs with automatic alerts.
        </p>
        <div className="flex items-center gap-4 text-xs text-violet-700">
          <span>💰 Hard cap: $50/month</span>
          <span>⚠️ Alerts at 60% & 90%</span>
          <span>📊 Per-feature tracking</span>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-6">
        <CostDashboard />
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">IMPLEMENTATION NOTES</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Real-time spend tracking via localStorage</li>
          <li>• Daily and monthly quota management</li>
          <li>• Per-feature cost breakdown</li>
          <li>• Budget progress visualization</li>
          <li>• Automatic alerts at thresholds</li>
          <li>• Kill switch at $50/month hard cap</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Rate Limiting Demo
 */
export const RateLimitingDemo: React.FC = () => {
  const [requestCount, setRequestCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const simulateRequest = () => {
    if (requestCount >= 10) {
      setIsBlocked(true);
      return;
    }
    setRequestCount(prev => prev + 1);
  };

  const reset = () => {
    setRequestCount(0);
    setIsBlocked(false);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
        <h4 className="text-sm font-semibold text-violet-900 mb-2">💡 About This Feature</h4>
        <p className="text-sm text-violet-800 mb-2">
          Multi-layer rate limiting protects against abuse and runaway costs.
        </p>
        <div className="flex items-center gap-4 text-xs text-violet-700">
          <span>🛡️ IP-based: 10/hour</span>
          <span>👤 Session: 5/hour</span>
          <span>📅 Daily: 100 total</span>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-6 space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-2">{requestCount} / 10</div>
          <div className="text-sm text-white/60">Requests This Hour</div>
        </div>

        <div className="relative h-4 bg-black/30 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-300 ${
              requestCount >= 10
                ? 'bg-red-500'
                : requestCount >= 7
                ? 'bg-amber-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${(requestCount / 10) * 100}%` }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={simulateRequest}
            disabled={isBlocked}
            className="flex-1 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 disabled:bg-gray-500/20 text-white rounded font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isBlocked ? '🚫 Rate Limited' : '📤 Simulate Request'}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-white rounded font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {isBlocked && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
            ⚠️ Rate limit exceeded. Try again in 1 hour.
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">RATE LIMITING LAYERS</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>IP-based:</strong> 10 requests/hour per IP address</li>
          <li>• <strong>Session-based:</strong> 5 requests/hour per user session</li>
          <li>• <strong>Daily quota:</strong> 100 requests/day across all IPs</li>
          <li>• <strong>Monthly cap:</strong> $50 total spend (hard kill switch)</li>
          <li>• <strong>CAPTCHA:</strong> Auto-triggers after 3 rapid requests</li>
          <li>• <strong>IP blocking:</strong> 1 hour ban for bot behavior</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Bot Detection Demo
 */
export const BotDetectionDemo: React.FC = () => {
  const [signals, setSignals] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);

  const checkBotSignal = (signal: string, weight: number) => {
    if (!signals.includes(signal)) {
      setSignals(prev => [...prev, signal]);
      setConfidence(prev => Math.min(prev + weight, 1.0));
    }
  };

  const reset = () => {
    setSignals([]);
    setConfidence(0);
  };

  const isBot = confidence > 0.7;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
        <h4 className="text-sm font-semibold text-violet-900 mb-2">💡 About This Feature</h4>
        <p className="text-sm text-violet-800 mb-2">
          Multi-signal bot detection analyzes behavior patterns to prevent automated abuse.
        </p>
        <div className="flex items-center gap-4 text-xs text-violet-700">
          <span>🕵️ 7 signals analyzed</span>
          <span>🎯 70% confidence threshold</span>
          <span>🚫 Auto-blocking enabled</span>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-6 space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold mb-2 ${isBot ? 'text-red-400' : 'text-white'}`}>
            {Math.round(confidence * 100)}%
          </div>
          <div className="text-sm text-white/60">Bot Confidence</div>
          {isBot && (
            <div className="mt-2 inline-block px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm font-medium">
              🤖 Bot Detected
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => checkBotSignal('honeypot_filled', 0.8)}
            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm transition-colors"
          >
            Honeypot Filled (+0.8)
          </button>
          <button
            onClick={() => checkBotSignal('suspicious_user_agent', 0.6)}
            className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-sm transition-colors"
          >
            Suspicious UA (+0.6)
          </button>
          <button
            onClick={() => checkBotSignal('instant_submission', 0.5)}
            className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-sm transition-colors"
          >
            Instant Submit (+0.5)
          </button>
          <button
            onClick={() => checkBotSignal('no_mouse_movement', 0.4)}
            className="px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-sm transition-colors"
          >
            No Mouse (+0.4)
          </button>
        </div>

        {signals.length > 0 && (
          <div className="p-3 bg-white/5 rounded">
            <div className="text-xs font-semibold text-white/60 mb-2">Detected Signals:</div>
            <div className="flex flex-wrap gap-1">
              {signals.map(signal => (
                <span
                  key={signal}
                  className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={reset}
          className="w-full px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-white rounded font-medium transition-colors"
        >
          Reset Detection
        </button>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">DETECTION SIGNALS</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Honeypot:</strong> Invisible field filled (0.8 confidence)</li>
          <li>• <strong>User-Agent:</strong> Headless browser, scraper patterns (0.6)</li>
          <li>• <strong>Timing:</strong> Instant form submission &lt; 1s (0.5)</li>
          <li>• <strong>Mouse:</strong> No natural mouse movement (0.4)</li>
          <li>• <strong>Keyboard:</strong> No keyboard activity (0.3)</li>
          <li>• <strong>Referrer:</strong> Missing or invalid referrer (0.3)</li>
          <li>• <strong>Browser Features:</strong> Missing APIs (0.5)</li>
        </ul>
      </div>
    </div>
  );
};
