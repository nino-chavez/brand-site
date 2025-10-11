/**
 * AI Cost Monitoring Dashboard
 *
 * Real-time monitoring of AI feature costs and usage.
 * Displays daily/monthly spend, requests per feature, projections.
 *
 * @fileoverview Admin dashboard for cost tracking
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { rateLimiter } from '../../utils/rateLimiter';

interface CostStats {
  dailySpend: number;
  monthlySpend: number;
  dailyRequests: number;
  monthlyRequests: number;
  hardCap: number;
  featureUsage: Record<string, { requests: number; cost: number }>;
}

export const CostDashboard: React.FC = () => {
  const [stats, setStats] = useState<CostStats | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadStats = () => {
      const costStatus = rateLimiter.getCostStatus();
      setStats(costStatus);
    };

    loadStats();

    // Refresh every 5 seconds
    const interval = setInterval(loadStats, 5000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
      </div>
    );
  }

  const budgetPercentage = (stats.monthlySpend / stats.hardCap) * 100;
  const projectedMonthlySpend = stats.dailyRequests > 0
    ? (stats.monthlySpend / new Date().getDate()) * 30
    : stats.monthlySpend;

  const getBudgetColor = () => {
    if (budgetPercentage >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (budgetPercentage >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const featureArray = Object.entries(stats.featureUsage).sort(
    ([, a], [, b]) => b.cost - a.cost
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Cost Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time monitoring of AI feature usage and costs
            </p>
          </div>

          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Today's Spend */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Today's Spend
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ${stats.dailySpend.toFixed(3)}
          </div>
          <div className="text-xs text-gray-500">
            {stats.dailyRequests} requests
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-2">
            This Month
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ${stats.monthlySpend.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            {stats.monthlyRequests} requests
          </div>
        </div>

        {/* Budget Status */}
        <div className={`rounded-xl shadow-md p-6 border ${getBudgetColor()}`}>
          <div className="text-sm font-medium mb-2">
            Budget Status
          </div>
          <div className="text-3xl font-bold mb-1">
            {budgetPercentage.toFixed(1)}%
          </div>
          <div className="text-xs">
            ${(stats.hardCap - stats.monthlySpend).toFixed(2)} remaining
          </div>
        </div>

        {/* Projected Month */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Projected Month
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ${projectedMonthlySpend.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            Based on current usage
          </div>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Monthly Budget
          </h2>
          <span className="text-sm text-gray-600">
            ${stats.monthlySpend.toFixed(2)} / ${stats.hardCap.toFixed(2)}
          </span>
        </div>

        <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-500 ${
              budgetPercentage >= 90
                ? 'bg-red-500'
                : budgetPercentage >= 60
                ? 'bg-amber-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />

          {/* Warning markers */}
          <div className="absolute inset-y-0 left-[60%] w-0.5 bg-amber-300" />
          <div className="absolute inset-y-0 left-[90%] w-0.5 bg-red-300" />
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>60% Warning</span>
          <span>90% Critical</span>
          <span>100%</span>
        </div>
      </div>

      {/* Feature Usage Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Usage by Feature
        </h2>

        {featureArray.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm">No AI features used yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-700">
                    Feature
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-700">
                    Requests
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-700">
                    Cost
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-700">
                    Avg Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureArray.map(([feature, usage]) => (
                  <tr key={feature} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                      {formatFeatureName(feature)}
                    </td>
                    <td className="text-right py-4 px-4 text-sm text-gray-600">
                      {usage.requests}
                    </td>
                    <td className="text-right py-4 px-4 text-sm text-gray-900 font-semibold">
                      ${usage.cost.toFixed(4)}
                    </td>
                    <td className="text-right py-4 px-4 text-sm text-gray-600">
                      ${(usage.cost / usage.requests).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 font-semibold">
                  <td className="py-4 px-4 text-sm text-gray-900">Total</td>
                  <td className="text-right py-4 px-4 text-sm text-gray-900">
                    {featureArray.reduce((sum, [, u]) => sum + u.requests, 0)}
                  </td>
                  <td className="text-right py-4 px-4 text-sm text-gray-900">
                    ${featureArray.reduce((sum, [, u]) => sum + u.cost, 0).toFixed(4)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Alerts Section */}
      {budgetPercentage >= 60 && (
        <div className={`mt-6 p-4 rounded-lg border ${
          budgetPercentage >= 90
            ? 'bg-red-50 border-red-300 text-red-800'
            : 'bg-amber-50 border-amber-300 text-amber-800'
        }`}>
          <div className="flex items-start gap-4">
            <svg
              className="w-6 h-6 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-semibold mb-1">
                {budgetPercentage >= 90 ? 'Critical: Budget Nearly Exceeded' : 'Warning: Approaching Budget Limit'}
              </h3>
              <p className="text-sm">
                {budgetPercentage >= 90
                  ? 'You\'ve used over 90% of your monthly budget. AI features may be disabled soon.'
                  : 'You\'ve used over 60% of your monthly budget. Consider monitoring usage more closely.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function formatFeatureName(key: string): string {
  const names: Record<string, string> = {
    'resume-generator': 'Resume Generator',
    'skill-matcher': 'Skill Matcher',
    'composition-analyzer': 'Composition Analyzer',
    'content-discovery': 'Content Discovery',
    'recommendations': 'Recommendations'
  };

  return names[key] || key;
}

export default CostDashboard;
