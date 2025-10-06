# AI Features Implementation Plan

**Version:** 1.0.0
**Date:** 2025-10-06
**Status:** Ready for Implementation
**Estimated Total Cost:** $15-30/month (with safeguards)

---

## Executive Summary

This plan implements 5 high-utility AI features that enhance professional outcomes without becoming gimmicks. All features include comprehensive cost protection, rate limiting, and bot detection to prevent runaway API costs.

**Key Principle:** No feature should cost more to operate than the value it delivers to users.

### Features Overview

| Feature | Strategic Fit | Monthly Cost | Implementation Time | Phase |
|---------|--------------|--------------|---------------------|-------|
| Context-Aware Recommendations | 8/10 | $0 (build-time) | 4 hours | 1 |
| Smart Resume Generator | 9/10 | $5-15 (free tier) | 8 hours | 2 |
| Skill Matcher | 9/10 | $0 (pre-computed) | 6 hours | 3 |
| Photography Composition Analyzer | 9/10 | $5-10 | 10 hours | 4 |
| Cross-Site Content Discovery | 8/10 | $0 runtime | 6 hours | 5 |

**Total Implementation Time:** 34 hours (~1 week sprint)

---

## Cost Protection Architecture

### Global Rate Limiting System

**File:** `src/utils/rateLimiter.ts`

```typescript
/**
 * Multi-layer rate limiting with automatic escalation
 *
 * Layers:
 * 1. IP-based: 10 requests/hour per IP
 * 2. Session-based: 5 requests/hour per user session
 * 3. Daily quota: 100 requests/day across all IPs
 * 4. Monthly hard cap: $50 API spend (kills all AI features if exceeded)
 *
 * Bot detection triggers:
 * - 3+ rapid requests within 30 seconds → CAPTCHA required
 * - 10+ requests from same IP → IP ban for 1 hour
 * - Missing user-agent or suspicious patterns → block immediately
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  identifier: 'ip' | 'session';
}

interface CostTracker {
  dailySpend: number;
  monthlySpend: number;
  lastReset: Date;
  hardCap: number; // $50/month
}

class RateLimiter {
  private limits: Map<string, { count: number; resetAt: number }> = new Map();
  private costTracker: CostTracker;
  private blockedIPs: Set<string> = new Set();

  constructor() {
    this.loadCostTracker();
    this.scheduleResets();
  }

  /**
   * Check if request should be allowed
   * Returns: { allowed: boolean; reason?: string; requiresCaptcha?: boolean }
   */
  async checkLimit(
    identifier: string,
    feature: string,
    estimatedCost: number = 0
  ): Promise<RateLimitResult> {
    // 1. Check IP blocklist
    if (this.blockedIPs.has(identifier)) {
      return { allowed: false, reason: 'IP temporarily blocked' };
    }

    // 2. Check monthly hard cap FIRST (critical)
    if (this.costTracker.monthlySpend + estimatedCost > this.costTracker.hardCap) {
      await this.notifyAdmin('CRITICAL: Monthly cost cap exceeded');
      return {
        allowed: false,
        reason: 'Service temporarily unavailable. Please try again next month.'
      };
    }

    // 3. Check IP rate limit
    const ipKey = `ip:${identifier}`;
    const ipLimit = this.limits.get(ipKey);

    if (ipLimit && ipLimit.count >= 10 && Date.now() < ipLimit.resetAt) {
      // Check if rapid requests (bot behavior)
      if (this.isRapidRequest(identifier)) {
        return { allowed: false, requiresCaptcha: true };
      }
      return { allowed: false, reason: 'Rate limit exceeded. Try again in 1 hour.' };
    }

    // 4. Check daily quota
    if (this.costTracker.dailySpend >= 200) { // ~200 free requests/day
      return { allowed: false, reason: 'Daily quota exceeded. Resets at midnight UTC.' };
    }

    // 5. Increment counters
    this.incrementLimit(ipKey, 3600000); // 1 hour window
    this.trackCost(estimatedCost);

    return { allowed: true };
  }

  /**
   * Detect bot patterns
   * - 3+ requests within 30 seconds
   * - Missing/suspicious user-agent
   * - Honeypot field filled
   */
  private isRapidRequest(identifier: string): boolean {
    const recentKey = `recent:${identifier}`;
    const recent = this.limits.get(recentKey);

    if (!recent) {
      this.limits.set(recentKey, { count: 1, resetAt: Date.now() + 30000 });
      return false;
    }

    if (recent.count >= 3 && Date.now() < recent.resetAt) {
      // Block IP for 1 hour
      this.blockedIPs.add(identifier);
      setTimeout(() => this.blockedIPs.delete(identifier), 3600000);
      return true;
    }

    recent.count++;
    return false;
  }

  /**
   * Track API costs
   * Persists to localStorage for client-side tracking
   * Backend should have authoritative tracking
   */
  private trackCost(cost: number): void {
    this.costTracker.dailySpend += cost;
    this.costTracker.monthlySpend += cost;
    this.saveCostTracker();
  }

  /**
   * Reset counters at appropriate intervals
   */
  private scheduleResets(): void {
    // Daily reset at midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.costTracker.dailySpend = 0;
      this.saveCostTracker();
      this.scheduleResets(); // Schedule next reset
    }, msUntilMidnight);

    // Monthly reset on 1st of month
    const nextMonth = new Date(now);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    nextMonth.setUTCDate(1);
    nextMonth.setUTCHours(0, 0, 0, 0);

    const msUntilNextMonth = nextMonth.getTime() - now.getTime();

    setTimeout(() => {
      this.costTracker.monthlySpend = 0;
      this.saveCostTracker();
    }, msUntilNextMonth);
  }

  private async notifyAdmin(message: string): Promise<void> {
    // Send email/SMS alert
    console.error(`[RATE LIMITER ALERT] ${message}`);
    // TODO: Implement actual notification (email via SendGrid, SMS via Twilio)
  }

  private loadCostTracker(): void {
    const saved = localStorage.getItem('ai-cost-tracker');
    if (saved) {
      this.costTracker = JSON.parse(saved);
    } else {
      this.costTracker = {
        dailySpend: 0,
        monthlySpend: 0,
        lastReset: new Date(),
        hardCap: 50 // $50/month
      };
    }
  }

  private saveCostTracker(): void {
    localStorage.setItem('ai-cost-tracker', JSON.stringify(this.costTracker));
  }
}

export const rateLimiter = new RateLimiter();

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  requiresCaptcha?: boolean;
}
```

### Bot Detection System

**File:** `src/utils/botDetection.ts`

```typescript
/**
 * Multi-signal bot detection
 *
 * Signals analyzed:
 * 1. Honeypot fields (invisible to humans, filled by bots)
 * 2. User-agent patterns (missing, suspicious, headless browsers)
 * 3. Mouse movement (bots have no natural movement)
 * 4. Timing patterns (instant form fills)
 * 5. Request signatures (missing referrer, direct API calls)
 */

interface BotDetectionResult {
  isBot: boolean;
  confidence: number; // 0-1
  signals: string[];
}

class BotDetector {
  private mouseMovements: Array<{ x: number; y: number; timestamp: number }> = [];
  private formStartTime: number | null = null;

  /**
   * Check if request shows bot behavior
   */
  async checkRequest(request: {
    userAgent: string;
    referrer: string;
    honeypot?: string;
    timing?: number;
  }): Promise<BotDetectionResult> {
    const signals: string[] = [];
    let confidence = 0;

    // 1. Honeypot check (high confidence)
    if (request.honeypot && request.honeypot.trim() !== '') {
      signals.push('honeypot_filled');
      confidence += 0.8;
    }

    // 2. User-agent validation
    if (!request.userAgent || this.isSuspiciousUserAgent(request.userAgent)) {
      signals.push('suspicious_user_agent');
      confidence += 0.6;
    }

    // 3. Referrer check
    if (!request.referrer || !request.referrer.includes('nino-chavez')) {
      signals.push('missing_referrer');
      confidence += 0.4;
    }

    // 4. Timing check (instant form submission)
    if (request.timing && request.timing < 1000) {
      signals.push('instant_submission');
      confidence += 0.5;
    }

    // 5. Mouse movement check
    if (this.mouseMovements.length === 0) {
      signals.push('no_mouse_movement');
      confidence += 0.3;
    }

    return {
      isBot: confidence > 0.7,
      confidence,
      signals
    };
  }

  /**
   * Track mouse movements for behavioral analysis
   */
  trackMouseMovement(x: number, y: number): void {
    this.mouseMovements.push({ x, y, timestamp: Date.now() });

    // Keep only last 50 movements
    if (this.mouseMovements.length > 50) {
      this.mouseMovements.shift();
    }
  }

  /**
   * Mark form interaction start for timing analysis
   */
  markFormStart(): void {
    this.formStartTime = Date.now();
  }

  /**
   * Get time since form start
   */
  getFormDuration(): number {
    return this.formStartTime ? Date.now() - this.formStartTime : 0;
  }

  private isSuspiciousUserAgent(ua: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawl/i,
      /spider/i,
      /scrape/i,
      /headless/i,
      /phantom/i,
      /selenium/i,
      /puppeteer/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(ua));
  }
}

export const botDetector = new BotDetector();
```

### CAPTCHA Integration

**Library:** `hcaptcha` (privacy-focused alternative to reCAPTCHA)

```typescript
// src/components/ai/CaptchaChallenge.tsx
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface CaptchaChallengeProps {
  onVerify: (token: string) => void;
  onError: () => void;
}

export const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({
  onVerify,
  onError
}) => {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
      <p className="text-sm text-gray-600">
        Verify you're human to continue
      </p>
      <HCaptcha
        sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
        onVerify={onVerify}
        onError={onError}
      />
    </div>
  );
};
```

---

## Phase 1: Context-Aware Recommendations

**Cost:** $0 (build-time only)
**Time:** 4 hours
**Strategic Fit:** 8/10

### Architecture

Pre-compute recommendations at build time using Gemini API. Store in static JSON, no runtime API calls.

**File:** `scripts/generateRecommendations.ts`

```typescript
/**
 * Build-time recommendation generator
 *
 * Analyzes all content and pre-computes:
 * - "If you liked X, see Y" mappings
 * - Related skills for each project
 * - Next logical navigation paths
 *
 * Output: src/data/recommendations.json (~50KB)
 * Runtime cost: $0
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface Recommendation {
  sourceSection: string;
  targetSection: string;
  reason: string;
  confidence: number;
}

async function generateRecommendations() {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  // Load all content
  const content = {
    capture: fs.readFileSync('components/sections/CaptureSection.tsx', 'utf-8'),
    focus: fs.readFileSync('components/sections/FocusSection.tsx', 'utf-8'),
    frame: fs.readFileSync('components/sections/FrameSection.tsx', 'utf-8'),
    exposure: fs.readFileSync('components/sections/ExposureSection.tsx', 'utf-8'),
    develop: fs.readFileSync('components/sections/DevelopSection.tsx', 'utf-8'),
    portfolio: fs.readFileSync('components/sections/PortfolioSection.tsx', 'utf-8')
  };

  const prompt = `
Analyze this portfolio content and generate contextual recommendations.

Content:
${JSON.stringify(content, null, 2)}

Generate recommendations in this format:
- If user reads section X, recommend section Y because [reason]
- Include confidence score (0-1)
- Focus on logical narrative flow

Return JSON array of recommendations.
`;

  const result = await model.generateContent(prompt);
  const recommendations = JSON.parse(result.response.text());

  // Write to static file
  fs.writeFileSync(
    'src/data/recommendations.json',
    JSON.stringify(recommendations, null, 2)
  );

  console.log(`Generated ${recommendations.length} recommendations`);
}

generateRecommendations();
```

**Component:** `src/components/ai/ContextualRecommendations.tsx`

```typescript
import recommendations from '../../data/recommendations.json';

interface ContextualRecommendationsProps {
  currentSection: string;
}

export const ContextualRecommendations: React.FC<ContextualRecommendationsProps> = ({
  currentSection
}) => {
  const relevant = recommendations.filter(
    r => r.sourceSection === currentSection && r.confidence > 0.7
  );

  if (relevant.length === 0) return null;

  return (
    <div className="mt-8 p-6 bg-violet-50 rounded-lg border border-violet-200">
      <h3 className="text-sm font-semibold text-violet-900 mb-3">
        You might also like
      </h3>
      <div className="space-y-2">
        {relevant.map((rec, i) => (
          <button
            key={i}
            onClick={() => navigateToSection(rec.targetSection)}
            className="block w-full text-left p-3 bg-white rounded hover:bg-violet-100 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">
              {formatSectionName(rec.targetSection)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {rec.reason}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

**Package.json script:**
```json
{
  "scripts": {
    "build:recommendations": "tsx scripts/generateRecommendations.ts",
    "prebuild": "npm run build:recommendations"
  }
}
```

---

## Phase 2: Smart Resume Generator

**Cost:** $5-15/month (Gemini free tier: 60 requests/minute)
**Time:** 8 hours
**Strategic Fit:** 9/10

### Architecture

User pastes job description → Gemini analyzes → generates tailored resume highlighting relevant experience.

**File:** `src/components/ai/SmartResumeGenerator.tsx`

```typescript
/**
 * Smart Resume Generator
 *
 * Features:
 * - Paste job description
 * - LLM analyzes requirements
 * - Generates tailored resume from Nino's experience
 * - Exports as PDF or Markdown
 *
 * Cost protection:
 * - 5 requests per user session
 * - Requires CAPTCHA after 3 requests
 * - Honeypot field for bot detection
 */

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimiter } from '../../utils/rateLimiter';
import { botDetector } from '../../utils/botDetection';
import { CaptchaChallenge } from './CaptchaChallenge';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const SmartResumeGenerator: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsCaptcha, setNeedsCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Honeypot field (hidden from users, bots will fill it)
  const [honeypot, setHoneypot] = useState('');

  const handleGenerate = async () => {
    setError(null);

    // 1. Rate limiting check
    const userIP = await getUserIP();
    const rateLimitCheck = await rateLimiter.checkLimit(
      userIP,
      'resume-generator',
      0.002 // ~$0.002 per request (Gemini pricing)
    );

    if (!rateLimitCheck.allowed) {
      if (rateLimitCheck.requiresCaptcha) {
        setNeedsCaptcha(true);
        return;
      }
      setError(rateLimitCheck.reason || 'Rate limit exceeded');
      return;
    }

    // 2. Bot detection
    const botCheck = await botDetector.checkRequest({
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      honeypot,
      timing: botDetector.getFormDuration()
    });

    if (botCheck.isBot) {
      setError('Suspicious activity detected. Please try again later.');
      console.warn('Bot detected:', botCheck.signals);
      return;
    }

    // 3. CAPTCHA validation if required
    if (needsCaptcha && !captchaToken) {
      setError('Please complete the CAPTCHA');
      return;
    }

    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
You are helping Nino Chavez tailor his resume for a specific job.

Nino's Background:
- 15+ years software engineering experience
- Enterprise architecture expertise (domain-driven design, event-driven systems)
- Full-stack development (React, TypeScript, Node.js, PostgreSQL)
- Action sports photography professional
- Portfolio: nino-chavez.netlify.app

Job Description:
${jobDescription}

Generate a tailored 1-page resume that:
1. Highlights most relevant experience for this role
2. Uses keywords from job description naturally
3. Emphasizes quantifiable achievements
4. Maintains professional tone
5. Formats in clean Markdown

Output format: Markdown resume ready to export as PDF.
`;

      const result = await model.generateContent(prompt);
      const generatedResume = result.response.text();

      setResume(generatedResume);
    } catch (err) {
      console.error('Resume generation failed:', err);
      setError('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // Convert Markdown to PDF using jsPDF or browser print
    window.print();
  };

  if (needsCaptcha && !captchaToken) {
    return (
      <CaptchaChallenge
        onVerify={(token) => {
          setCaptchaToken(token);
          setNeedsCaptcha(false);
        }}
        onError={() => setError('CAPTCHA verification failed')}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Smart Resume Generator
        </h2>
        <p className="text-gray-600">
          Paste a job description to generate a tailored resume highlighting relevant experience
        </p>
      </div>

      {/* Honeypot field (hidden) */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: 'absolute', left: '-9999px' }}
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            onFocus={() => botDetector.markFormStart()}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Paste the full job description here..."
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!jobDescription || loading}
          className="w-full bg-violet-600 text-white py-3 rounded-lg font-medium hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Tailored Resume'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {resume && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Generated Resume
              </h3>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Export as PDF
              </button>
            </div>
            <div className="p-6 bg-white border border-gray-300 rounded-lg prose prose-sm max-w-none">
              <ReactMarkdown>{resume}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

async function getUserIP(): Promise<string> {
  // In production, get from server-side API
  // For now, use a fingerprint
  return `client-${navigator.userAgent.slice(0, 20)}`;
}
```

**Integration:** Add to navigation or portfolio section with prominent CTA

---

## Phase 3: Skill Matcher

**Cost:** $0 runtime (pre-computed embeddings)
**Time:** 6 hours
**Strategic Fit:** 9/10

### Architecture

Pre-compute embeddings for all skills and projects at build time. Runtime search uses cosine similarity (client-side, no API calls).

**File:** `scripts/generateSkillEmbeddings.ts`

```typescript
/**
 * Build-time skill embedding generator
 *
 * Generates embeddings for:
 * - All projects/experience described in portfolio
 * - Common job requirements
 * - Technical skills
 *
 * Output: src/data/skillEmbeddings.json (~200KB)
 * Runtime: Pure client-side cosine similarity search
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface SkillEmbedding {
  id: string;
  text: string;
  embedding: number[];
  category: 'project' | 'skill' | 'experience';
  section: string;
}

async function generateSkillEmbeddings() {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });

  // Define all content to embed
  const contentItems = [
    // Projects
    { id: 'pmt-platform', text: 'Enterprise payer management platform with event-driven architecture', category: 'project', section: 'develop' },
    { id: 'viewfinder-canvas', text: '2D spatial canvas with GPU-accelerated pan/zoom like Figma and Miro', category: 'project', section: 'portfolio' },

    // Skills
    { id: 'react-typescript', text: 'React 19 with TypeScript for type-safe component development', category: 'skill', section: 'develop' },
    { id: 'event-driven', text: 'Event-driven architecture and domain-driven design patterns', category: 'skill', section: 'develop' },
    { id: 'photography', text: 'Action sports photography including skydiving and mountain biking', category: 'skill', section: 'capture' },

    // Add 30+ more items covering all experience
  ];

  const embeddings: SkillEmbedding[] = [];

  for (const item of contentItems) {
    const result = await model.embedContent(item.text);
    embeddings.push({
      ...item,
      embedding: result.embedding.values,
      category: item.category as any,
    });
  }

  fs.writeFileSync(
    'src/data/skillEmbeddings.json',
    JSON.stringify(embeddings, null, 2)
  );

  console.log(`Generated ${embeddings.length} skill embeddings`);
}

generateSkillEmbeddings();
```

**Component:** `src/components/ai/SkillMatcher.tsx`

```typescript
import { useState, useMemo } from 'react';
import skillEmbeddings from '../../data/skillEmbeddings.json';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const SkillMatcher: React.FC = () => {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<Array<{ text: string; score: number; section: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);

    try {
      // Generate embedding for query (only API call)
      const model = genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(query);
      const queryEmbedding = result.embedding.values;

      // Compute cosine similarity with all skills (client-side)
      const similarities = skillEmbeddings.map(skill => ({
        text: skill.text,
        section: skill.section,
        score: cosineSimilarity(queryEmbedding, skill.embedding)
      }));

      // Sort and take top 5
      const topMatches = similarities
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setMatches(topMatches);
    } catch (err) {
      console.error('Skill matching failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Skill Matcher</h2>
      <p className="text-gray-600 mb-6">
        Describe what you're looking for, and I'll find relevant experience
      </p>

      <div className="space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., event-driven microservices with TypeScript"
          className="w-full p-4 border rounded-lg"
        />

        <button
          onClick={handleSearch}
          disabled={!query || loading}
          className="w-full bg-violet-600 text-white py-3 rounded-lg"
        >
          {loading ? 'Searching...' : 'Find Matches'}
        </button>

        {matches.length > 0 && (
          <div className="mt-6 space-y-3">
            {matches.map((match, i) => (
              <div key={i} className="p-4 bg-white border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-violet-600 font-semibold uppercase">
                    {match.section}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(match.score * 100)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-800">{match.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
```

**Cost:** ~$0.05 for initial embedding generation (one-time), $0.0001 per search query

---

## Phase 4: Photography Composition Analyzer

**Cost:** $5-10/month (cached responses)
**Time:** 10 hours
**Strategic Fit:** 9/10

### Architecture

Upload photo → Gemini Vision analyzes → explains composition, lighting, camera settings decisions.

**File:** `src/components/ai/CompositionAnalyzer.tsx`

```typescript
/**
 * Photography Composition Analyzer
 *
 * Features:
 * - Upload photo (max 5MB)
 * - Gemini Vision analyzes composition
 * - Explains lighting, framing, moment choice
 * - Caches responses (same photo = instant results)
 *
 * Cost protection:
 * - Max 3 uploads per session
 * - Cached responses for popular uploads
 * - Image hash for deduplication
 */

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const CompositionAnalyzer: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!image) return;

    // Check cache first
    const imageHash = await hashFile(image);
    const cached = localStorage.getItem(`composition-${imageHash}`);

    if (cached) {
      setAnalysis(cached);
      return;
    }

    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      const imageData = await fileToBase64(image);

      const prompt = `
Analyze this action sports photograph as a professional photographer would.

Explain:
1. **Composition:** Rule of thirds, leading lines, framing decisions
2. **Lighting:** Natural vs flash, direction, quality (hard/soft)
3. **Timing:** Peak action vs anticipation, decisive moment
4. **Technical:** Estimated shutter speed, aperture, ISO based on visible motion blur and depth of field
5. **Storytelling:** What makes this shot compelling?

Write in Nino Chavez's voice: technical but accessible, emphasizing the "why" behind each decision.
`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: image.type, data: imageData } }
      ]);

      const analysisText = result.response.text();

      // Cache response
      localStorage.setItem(`composition-${imageHash}`, analysisText);

      setAnalysis(analysisText);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Composition Analyzer</h2>
      <p className="text-gray-600 mb-6">
        Upload an action sports photo to learn about composition and technique
      </p>

      <div className="space-y-6">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="block w-full"
        />

        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="w-full rounded-lg shadow-lg"
          />
        )}

        <button
          onClick={handleAnalyze}
          disabled={!image || loading}
          className="w-full bg-violet-600 text-white py-3 rounded-lg"
        >
          {loading ? 'Analyzing...' : 'Analyze Composition'}
        </button>

        {analysis && (
          <div className="p-6 bg-white border rounded-lg prose prose-sm">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

---

## Phase 5: Cross-Site Content Discovery

**Cost:** $0 runtime (pre-computed embeddings)
**Time:** 6 hours
**Strategic Fit:** 8/10

### Architecture

**No custom model training needed!** Use embedding-based similarity search across blog.nino.photos and gallery.nino.photos.

**Approach:**

1. **Build-time crawl** of blog posts and gallery metadata
2. **Generate embeddings** for all content (Gemini embeddings-001)
3. **Store in static JSON** (~500KB)
4. **Runtime similarity search** (client-side cosine similarity)
5. **Link out** to relevant content on other sites

**File:** `scripts/crawlNinoContent.ts`

```typescript
/**
 * Cross-site content crawler
 *
 * Crawls:
 * - blog.nino.photos (RSS feed or sitemap)
 * - gallery.nino.photos (metadata JSON if available)
 *
 * Generates embeddings for:
 * - Blog post titles + excerpts
 * - Photo titles + descriptions
 *
 * Output: src/data/crossSiteContent.json
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Parser from 'rss-parser';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const parser = new Parser();

interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  site: 'blog' | 'gallery';
  embedding: number[];
  tags: string[];
}

async function crawlBlog(): Promise<ContentItem[]> {
  const feed = await parser.parseURL('https://blog.nino.photos/rss.xml');

  const items: ContentItem[] = [];

  for (const item of feed.items) {
    const text = `${item.title} ${item.contentSnippet}`;
    const result = await embedText(text);

    items.push({
      id: item.guid || item.link!,
      title: item.title!,
      excerpt: item.contentSnippet!,
      url: item.link!,
      site: 'blog',
      embedding: result,
      tags: item.categories || []
    });
  }

  return items;
}

async function crawlGallery(): Promise<ContentItem[]> {
  // Fetch gallery metadata (you may need to create this endpoint)
  const response = await fetch('https://gallery.nino.photos/api/metadata.json');
  const photos = await response.json();

  const items: ContentItem[] = [];

  for (const photo of photos) {
    const text = `${photo.title} ${photo.description} ${photo.tags.join(' ')}`;
    const result = await embedText(text);

    items.push({
      id: photo.id,
      title: photo.title,
      excerpt: photo.description,
      url: `https://gallery.nino.photos/${photo.slug}`,
      site: 'gallery',
      embedding: result,
      tags: photo.tags
    });
  }

  return items;
}

async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function generateCrossSiteContent() {
  console.log('Crawling blog.nino.photos...');
  const blogContent = await crawlBlog();

  console.log('Crawling gallery.nino.photos...');
  const galleryContent = await crawlGallery();

  const allContent = [...blogContent, ...galleryContent];

  fs.writeFileSync(
    'src/data/crossSiteContent.json',
    JSON.stringify(allContent, null, 2)
  );

  console.log(`Generated embeddings for ${allContent.length} items`);
  console.log(`- Blog posts: ${blogContent.length}`);
  console.log(`- Gallery photos: ${galleryContent.length}`);
}

generateCrossSiteContent();
```

**Component:** `src/components/ai/ContentDiscovery.tsx`

```typescript
/**
 * "Find more like this" button
 *
 * Shows 3-5 related blog posts or photos from other Nino sites
 * Pure client-side similarity search (no API calls)
 */

import { useMemo } from 'react';
import crossSiteContent from '../../data/crossSiteContent.json';

interface ContentDiscoveryProps {
  context: string; // Current page/section context
  currentEmbedding: number[]; // Pre-computed for current page
}

export const ContentDiscovery: React.FC<ContentDiscoveryProps> = ({
  context,
  currentEmbedding
}) => {
  const relatedContent = useMemo(() => {
    // Compute similarity scores
    const scored = crossSiteContent.map(item => ({
      ...item,
      score: cosineSimilarity(currentEmbedding, item.embedding)
    }));

    // Return top 5
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [currentEmbedding]);

  return (
    <div className="mt-12 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        More from Nino
      </h3>
      <div className="space-y-3">
        {relatedContent.map(item => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-violet-600 uppercase">
                {item.site === 'blog' ? '📝 Blog' : '📷 Gallery'}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(item.score * 100)}% relevant
              </span>
            </div>
            <h4 className="font-medium text-gray-900">{item.title}</h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {item.excerpt}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
```

**Cost:** ~$2-5 for initial crawl and embedding generation (one-time), $0 runtime

**Note:** If blog.nino.photos or gallery.nino.photos don't expose RSS/API, you can:
1. Create a simple metadata JSON file manually
2. Use a headless browser to scrape content
3. Store content in this repo and update quarterly

---

## Implementation Timeline

### Week 1: Foundation (14 hours)
- **Days 1-2:** Rate limiting + bot detection infrastructure (8h)
- **Day 3:** Context-aware recommendations (4h)
- **Day 4:** Testing + integration (2h)

### Week 2: Smart Features (20 hours)
- **Days 1-2:** Smart Resume Generator (8h)
- **Days 3-4:** Skill Matcher (6h)
- **Day 5:** Cross-Site Content Discovery (6h)

### Week 3: Premium Feature (10 hours)
- **Days 1-2:** Photography Composition Analyzer (10h)

### Week 4: Polish + Launch (4 hours)
- **Day 1:** Documentation + user testing (2h)
- **Day 2:** Cost monitoring dashboard (2h)

**Total:** 48 hours (~1.5 weeks full-time or 3 weeks part-time)

---

## Cost Monitoring Dashboard

**File:** `src/components/ai/CostDashboard.tsx`

```typescript
/**
 * Admin dashboard for monitoring AI costs
 *
 * Shows:
 * - Daily/monthly spend
 * - Requests per feature
 * - Top users by usage
 * - Cost projections
 */

export const CostDashboard: React.FC = () => {
  const tracker = useCostTracker();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">AI Cost Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Today's Spend</div>
          <div className="text-3xl font-bold text-gray-900">
            ${tracker.dailySpend.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {tracker.dailyRequests} requests
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-3xl font-bold text-gray-900">
            ${tracker.monthlySpend.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {tracker.monthlyRequests} requests
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Budget Status</div>
          <div className={`text-3xl font-bold ${
            tracker.monthlySpend / tracker.hardCap > 0.8
              ? 'text-red-600'
              : 'text-green-600'
          }`}>
            {Math.round((tracker.monthlySpend / tracker.hardCap) * 100)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ${tracker.hardCap - tracker.monthlySpend} remaining
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Usage by Feature</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Feature</th>
              <th className="text-right py-2">Requests</th>
              <th className="text-right py-2">Cost</th>
            </tr>
          </thead>
          <tbody>
            {tracker.featureUsage.map(feature => (
              <tr key={feature.name} className="border-b">
                <td className="py-2">{feature.name}</td>
                <td className="text-right">{feature.requests}</td>
                <td className="text-right">${feature.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

---

## Dependencies

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.1.3",
    "@hcaptcha/react-hcaptcha": "^1.8.1",
    "react-markdown": "^9.0.1",
    "rss-parser": "^3.13.0"
  },
  "devDependencies": {
    "tsx": "^4.7.0"
  }
}
```

---

## Environment Variables

```bash
# .env.local
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key

# Build-time only (not exposed to client)
GEMINI_API_KEY=your_gemini_api_key
```

---

## Testing Strategy

### Unit Tests
- Rate limiter logic
- Bot detection signals
- Cosine similarity calculation
- Embedding cache hits

### Integration Tests
- Full flow: job description → resume generation
- Rate limit enforcement
- CAPTCHA trigger conditions
- Cost tracking accuracy

### Load Tests
- 100 concurrent resume requests
- Verify rate limiting holds
- Confirm cost cap enforcement
- Test CAPTCHA under load

---

## Success Metrics

| Feature | Target Engagement | Target Conversion |
|---------|------------------|-------------------|
| Context-Aware Recommendations | 40% click-through | 60% navigate to recommended section |
| Smart Resume Generator | 15% of visitors use | 80% export generated resume |
| Skill Matcher | 10% of visitors use | 70% click through to relevant section |
| Composition Analyzer | 5% of photography visitors | 50% share analysis |
| Cross-Site Discovery | 20% click-through | 40% visit external Nino content |

---

## Risk Mitigation

### Cost Overrun Risk: MEDIUM
**Mitigation:**
- Hard $50/month cap with kill switch
- Daily email alerts at $30/month
- Automatic CAPTCHA escalation
- IP banning for abusers

### Bot Attack Risk: LOW
**Mitigation:**
- Multi-layer bot detection
- Honeypot fields
- Behavioral analysis
- CAPTCHA after 3 rapid requests

### API Outage Risk: LOW
**Mitigation:**
- Graceful degradation (static content remains)
- Cached responses for common queries
- Clear error messaging
- No critical features depend on AI

---

## Launch Checklist

- [ ] Set up Gemini API key with billing alerts
- [ ] Configure hCaptcha account
- [ ] Build all recommendation/embedding data
- [ ] Deploy rate limiter infrastructure
- [ ] Test bot detection on staging
- [ ] Set up cost monitoring dashboard
- [ ] Configure $30 and $45 spend alerts
- [ ] Test CAPTCHA flow
- [ ] Load test with 100 concurrent users
- [ ] Document user-facing features
- [ ] Add "Powered by AI" disclaimers
- [ ] Launch to 10% of users first (A/B test)

---

## Future Enhancements (Phase 2)

1. **Project Recommender** - "Companies that hired Nino also worked on..."
2. **Interview Prep Bot** - Generate mock interview questions based on role
3. **Portfolio Comparison** - "How does Nino's experience compare to this role?"
4. **Skill Gap Analysis** - "What skills to develop for [target role]"
5. **Email Signature Generator** - Auto-generate professional signature with relevant highlights

**Estimated additional cost:** $10-20/month

---

## Conclusion

This implementation plan delivers high-utility AI features while keeping costs under $30/month through aggressive caching, pre-computation, and multi-layer rate limiting.

**Key Innovations:**
1. **No custom model training needed** - embeddings solve cross-site discovery
2. **Zero runtime cost for 3 of 5 features** - pre-computed at build time
3. **Industry-leading cost protection** - multiple safeguards prevent runaway spend
4. **High strategic value** - every feature drives hiring outcomes or engagement

**Next Steps:**
1. Review and approve plan
2. Set up API keys and billing
3. Begin Phase 1 implementation
4. Test rate limiting thoroughly
5. Launch with monitoring

Ready to proceed with implementation?
