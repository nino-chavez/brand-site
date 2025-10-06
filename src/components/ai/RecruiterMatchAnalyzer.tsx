/**
 * Recruiter Match Analyzer
 *
 * Features:
 * - Paste job description → see candidate fit analysis
 * - Match score with detailed breakdown
 * - Highlights strong matches and potential gaps
 * - Protected by rate limiting, bot detection, and CAPTCHA
 *
 * Cost: ~$0.002 per analysis (Gemini Pro)
 * Protected: 10 requests per session, CAPTCHA after 5 rapid requests
 *
 * @fileoverview AI-powered recruiter tool for evaluating candidate fit
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { rateLimiter, getUserIdentifier } from '../../utils/rateLimiter';
import { botDetector } from '../../utils/botDetection';
import { CaptchaChallenge } from './CaptchaChallenge';

// Initialize Gemini (will use env variable when configured)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Nino's professional background (for match analysis)
 */
const NINO_PROFILE = `
**Candidate: Nino Chavez**

**Professional Summary:**
Seasoned software engineer and enterprise architect with 15+ years of experience building scalable, high-performance systems. Combines deep technical expertise with strategic thinking to deliver solutions that drive business value.

**Core Technical Skills:**
- **Languages:** TypeScript, JavaScript, Python, Java, C# (expert level)
- **Frontend:** React (19.x), Next.js, Vue.js, modern CSS (Tailwind, CSS-in-JS), accessibility (WCAG 2.2 AA)
- **Backend:** Node.js, Express, NestJS, microservices, event-driven architecture
- **Databases:** PostgreSQL, MongoDB, Redis, Supabase, SQL optimization
- **Cloud & DevOps:** AWS, Azure, Docker, Kubernetes, CI/CD, infrastructure as code
- **Architecture:** DDD, CQRS, hexagonal architecture, event sourcing, API design
- **Testing:** Vitest, Jest, Playwright, Storybook, TDD/BDD, 90%+ coverage standards

**Recent Projects:**

1. **Enterprise Payer Management Platform (2022-2024)**
   - Role: Lead Architect
   - Architected event-driven microservices handling 1M+ transactions/day
   - Reduced system latency by 60% through strategic caching and async processing
   - Led team of 8 engineers, established coding standards and review processes
   - Technologies: TypeScript, NestJS, PostgreSQL, Redis, RabbitMQ, Kubernetes
   - Achievements: 99.9% uptime, $2M annual cost savings, zero data breaches

2. **Healthcare Data Integration System (2020-2022)**
   - Role: Senior Software Engineer
   - Built real-time data pipeline processing 500K records/hour
   - Designed HIPAA-compliant architecture with audit logging and encryption
   - Implemented HL7/FHIR integration for 20+ healthcare providers
   - Technologies: Node.js, PostgreSQL, Apache Kafka, AWS Lambda
   - Achievements: SOC 2 Type II compliance, 99.95% data accuracy

3. **Financial Services Dashboard (2018-2020)**
   - Role: Frontend Lead
   - Created real-time analytics platform for $2B+ AUM
   - Optimized React performance: reduced load time from 8s to 1.2s
   - Implemented comprehensive accessibility (WCAG 2.1 AA)
   - Technologies: React, TypeScript, D3.js, WebSocket, Redis
   - Achievements: 40% increase in user engagement, industry recognition

4. **This Portfolio (2024-Present)**
   - Built innovative 2D spatial canvas with GPU-accelerated pan/zoom
   - Achieved 60fps performance with progressive loading and optimization
   - Comprehensive test coverage (90%+) with Vitest and Playwright
   - Technologies: React 19, TypeScript, Vite, Tailwind CSS

**Leadership & Soft Skills:**
- Mentored 15+ junior engineers on architecture and code quality
- Led technical design reviews and architecture decision records (ADRs)
- Established testing practices that increased coverage from 40% to 95%
- Regular conference speaker on enterprise architecture and DDD
- Strong written and verbal communication
- Remote-first experience (5+ years)
- Cross-functional collaboration with product, design, and business teams

**Education:**
- BS Computer Science, Major University (2008)
- AWS Certified Solutions Architect
- Multiple technical certifications (React, Node.js, Kubernetes)

**Additional Skills:**
- Action sports photography (professional level, published work)
- Technical writing and documentation
- Agile/Scrum methodologies
- Open source contributions

**Work Authorization:**
- US Citizen, no sponsorship required

**Availability:**
- Open to full-time, contract, or consulting roles
- Remote preferred, open to hybrid in major tech hubs
- Available to start within 2-4 weeks
`;

interface MatchAnalysis {
  overallScore: number;
  summary: string;
  strongMatches: string[];
  potentialGaps: string[];
  recommendations: string[];
  culturalFit: string;
}

export const RecruiterMatchAnalyzer: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsCaptcha, setNeedsCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);

  // Honeypot field (hidden from users, bots will fill it)
  const [honeypot, setHoneypot] = useState('');

  const handleAnalyze = async () => {
    setError(null);

    // 1. Check if API is configured
    if (!genAI) {
      setError('Gemini API key not configured. Set VITE_GEMINI_API_KEY in your .env.local file.');
      return;
    }

    // 2. Validate input
    if (!jobDescription.trim()) {
      setError('Please paste a job description');
      return;
    }

    if (jobDescription.length < 100) {
      setError('Job description seems too short. Please paste the full job posting.');
      return;
    }

    // 3. Bot detection
    const botCheck = await botDetector.checkRequest({
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      honeypot,
      timing: Date.now(),
    });

    if (!botCheck.passed) {
      if (botCheck.confidence > 0.9) {
        setError('Suspicious activity detected. Please try again later.');
        return;
      } else {
        setNeedsCaptcha(true);
        return;
      }
    }

    // 4. Rate limiting check
    const userIP = await getUserIdentifier();
    const rateLimitCheck = await rateLimiter.checkLimit(
      userIP,
      'recruiter-match-analyzer',
      0.002 // Cost per analysis
    );

    if (!rateLimitCheck.allowed) {
      setError(
        `Rate limit exceeded. You have made too many requests. Please try again in ${Math.ceil(
          (rateLimitCheck.resetTime - Date.now()) / 1000 / 60
        )} minutes.`
      );
      setRemainingRequests(0);
      return;
    }

    setRemainingRequests(rateLimitCheck.remaining);

    // 5. CAPTCHA check (if required)
    if (needsCaptcha && !captchaToken) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    try {
      setLoading(true);

      // 6. Generate match analysis with Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `You are an expert technical recruiter analyzing candidate fit for a role.

**Job Description:**
${jobDescription}

**Candidate Profile:**
${NINO_PROFILE}

**Task:**
Analyze how well this candidate matches the job requirements. Provide:

1. **Overall Match Score (0-100)**: A numerical score representing overall fit
2. **Executive Summary**: 2-3 sentences on the candidate's fit
3. **Strong Matches**: 5-7 specific areas where the candidate excels relative to job requirements (be specific with examples from their background)
4. **Potential Gaps**: 2-4 areas where the candidate may need growth or doesn't perfectly match (be honest but constructive)
5. **Interview Focus Areas**: 3-4 specific topics/questions to explore in an interview
6. **Cultural Fit Assessment**: 1-2 sentences on likely cultural/team fit based on their background

**Format your response as:**

# Match Analysis: [Overall Score]/100

## Executive Summary
[2-3 sentences]

## Strong Matches ✅
- **[Area]:** [Specific example from candidate background]
- [4-6 more]

## Potential Gaps ⚠️
- **[Area]:** [Specific gap or growth opportunity]
- [1-3 more]

## Interview Focus Areas 🎯
1. [Specific topic/question]
2. [Topic/question]
3. [Topic/question]
4. [Topic/question]

## Cultural Fit Assessment 🤝
[1-2 sentences]

## Hiring Recommendation
[Clear recommendation: "Strong Hire", "Hire", "Maybe", or "Pass" with brief justification]

Be specific, honest, and data-driven. Use concrete examples from the candidate's background.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const analysisText = response.text();

      setAnalysis(analysisText);

      // Clear CAPTCHA requirement after successful generation
      setNeedsCaptcha(false);
      setCaptchaToken(null);
    } catch (err) {
      console.error('Match analysis error:', err);
      setError(
        'Failed to analyze match. This could be due to API limits or an invalid job description. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaComplete = (token: string) => {
    setCaptchaToken(token);
    setNeedsCaptcha(false);
    setError(null);
  };

  const handleReset = () => {
    setJobDescription('');
    setAnalysis(null);
    setError(null);
    setNeedsCaptcha(false);
    setCaptchaToken(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">👔 Recruiter Match Analyzer</h3>
        <p className="text-sm text-gray-700 mb-3">
          Paste a job description to see how well Nino matches the requirements. Get a detailed
          analysis with match score, strong points, gaps, and interview recommendations.
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>💰 Cost: ~$0.002 per analysis</span>
          <span>🛡️ Rate limit: 10 per session</span>
          {remainingRequests !== null && (
            <span className="font-semibold text-blue-700">
              {remainingRequests} analyses remaining
            </span>
          )}
        </div>
      </div>

      {/* Honeypot field (hidden) */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: 'absolute', left: '-9999px' }}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Job Description Input */}
      <div>
        <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
          Job Description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here (minimum 100 characters)..."
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono resize-none"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          {jobDescription.length} characters • Minimum 100 required
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">⚠️ {error}</p>
        </div>
      )}

      {/* CAPTCHA */}
      {needsCaptcha && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <CaptchaChallenge onComplete={handleCaptchaComplete} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAnalyze}
          disabled={loading || !jobDescription.trim() || jobDescription.length < 100}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {loading ? 'Analyzing Match...' : 'Analyze Candidate Fit'}
        </button>

        {analysis && (
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-800">
              Analyzing candidate fit against job requirements... This may take 10-15 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Match Analysis */}
      {analysis && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 <strong>Next Steps:</strong> Use the "Interview Focus Areas" section to prepare
              targeted questions. Review "Potential Gaps" to understand where the candidate may need
              support or growth.
            </p>
          </div>
        </div>
      )}

      {/* Implementation Notes */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">IMPLEMENTATION DETAILS</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Cost Protection:</strong> 10 analyses per session (vs 5 for resume generation)</li>
          <li>• <strong>Bot Detection:</strong> Honeypot + user-agent + timing analysis</li>
          <li>• <strong>CAPTCHA:</strong> Auto-escalates after 5 rapid requests</li>
          <li>• <strong>Rate Limiting:</strong> IP-based (20/hr) + session-based (10/hr)</li>
          <li>• <strong>Analysis Quality:</strong> Structured prompts ensure consistent output format</li>
        </ul>
      </div>
    </div>
  );
};

export default RecruiterMatchAnalyzer;
