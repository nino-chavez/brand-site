/**
 * AI Features Demo Page
 *
 * Quick demo page to test all AI features in one place.
 * Use this to verify everything works with your Gemini API key.
 *
 * @fileoverview AI features demonstration page
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { SmartResumeGenerator } from '../components/ai/SmartResumeGenerator';
import { SkillMatcher } from '../components/ai/SkillMatcher';
import { CompositionAnalyzer } from '../components/ai/CompositionAnalyzer';
import { ContentDiscovery } from '../components/ai/ContentDiscovery';
import { ContextualRecommendations } from '../components/ai/ContextualRecommendations';
import { CostDashboard } from '../components/ai/CostDashboard';

type ActiveTab = 'resume' | 'skills' | 'photo' | 'discovery' | 'recommendations' | 'dashboard';

export const AIFeaturesDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('resume');

  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'resume', label: 'Resume Generator', icon: '📄' },
    { id: 'skills', label: 'Skill Matcher', icon: '🎯' },
    { id: 'photo', label: 'Photo Analyzer', icon: '📸' },
    { id: 'discovery', label: 'Content Discovery', icon: '🔍' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡' },
    { id: 'dashboard', label: 'Cost Dashboard', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Features Demo
          </h1>
          <p className="text-gray-600">
            Test all AI-powered features with your Gemini API key
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'resume' && (
          <div>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Try It:</h3>
              <p className="text-sm text-blue-800">
                Paste any job description to see how the AI tailors Nino's resume to match the requirements.
                Cost: ~$0.002 per generation
              </p>
            </div>
            <SmartResumeGenerator />
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Try It:</h3>
              <p className="text-sm text-blue-800">
                Search for skills or technologies (e.g., "event-driven microservices with TypeScript") to find relevant experience.
                Cost: ~$0.0001 per search
              </p>
            </div>
            <SkillMatcher />
          </div>
        )}

        {activeTab === 'photo' && (
          <div>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Try It:</h3>
              <p className="text-sm text-blue-800">
                Upload an action sports photo to receive professional analysis of composition, lighting, and technique.
                Cost: ~$0.005 per analysis (cached for repeat uploads)
              </p>
            </div>
            <CompositionAnalyzer />
          </div>
        )}

        {activeTab === 'discovery' && (
          <div>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Try It:</h3>
              <p className="text-sm text-blue-800">
                Search across blog posts and gallery photos to find related content.
                Cost: $0 (pre-computed embeddings, client-side similarity)
              </p>
            </div>
            <ContentDiscovery
              context="action sports photography and software architecture"
              maxResults={8}
            />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 About:</h3>
              <p className="text-sm text-blue-800">
                Contextual recommendations appear in each portfolio section to guide visitors.
                Cost: $0 (pre-computed at build time)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'] as const).map(section => (
                <div key={section} className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                    {section} Section
                  </h3>
                  <ContextualRecommendations
                    currentSection={section}
                    maxRecommendations={3}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 About:</h3>
              <p className="text-sm text-blue-800">
                Real-time monitoring of AI feature usage and costs. Alerts trigger at 60% and 90% of monthly budget.
                Hard cap: $50/month (features disabled if exceeded)
              </p>
            </div>
            <CostDashboard />
          </div>
        )}
      </div>

      {/* Footer Help */}
      <div className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-200 mt-12">
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-violet-900 mb-4">
            🚀 Getting Started
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-violet-900 mb-2">1. API Key Configured ✅</h4>
              <p className="text-violet-800">
                Your Gemini API key is set in .env.local and ready to use.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-violet-900 mb-2">2. Try Features</h4>
              <p className="text-violet-800">
                Use the tabs above to test each AI feature. Start with Resume Generator or Skill Matcher.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-violet-900 mb-2">3. Monitor Costs</h4>
              <p className="text-violet-800">
                Check the Dashboard tab to track your API usage and costs in real-time.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-violet-200">
            <p className="text-xs text-violet-700">
              📖 <strong>Documentation:</strong> See <code>docs/AI_FEATURES_README.md</code> for complete setup and usage instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesDemo;
