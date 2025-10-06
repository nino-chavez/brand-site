/**
 * Smart Resume Generator
 *
 * Features:
 * - Paste job description → get tailored resume
 * - Analyzes requirements and highlights relevant experience
 * - Exports as Markdown or PDF
 * - Protected by rate limiting, bot detection, and CAPTCHA
 *
 * Cost: ~$0.002 per generation (Gemini Pro)
 * Protected: 5 requests per session, CAPTCHA after 3 rapid requests
 *
 * @fileoverview AI-powered resume tailoring tool
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
 * Nino's professional background (used for resume generation)
 */
const NINO_BACKGROUND = `
**Professional Summary:**
Nino Chavez is a seasoned software engineer and enterprise architect with 15+ years of experience building scalable, high-performance systems. Combines deep technical expertise with strategic thinking to deliver solutions that drive business value.

**Technical Expertise:**
- **Languages:** TypeScript, JavaScript, Python, Java, C#
- **Frontend:** React, Next.js, Vue.js, modern CSS (Tailwind, CSS-in-JS)
- **Backend:** Node.js, Express, NestJS, microservices architecture
- **Databases:** PostgreSQL, MongoDB, Redis, Supabase
- **Cloud & DevOps:** AWS, Azure, Docker, Kubernetes, CI/CD pipelines
- **Architecture:** Domain-driven design, event-driven systems, CQRS, hexagonal architecture
- **Testing:** Vitest, Jest, Playwright, Storybook, TDD/BDD practices

**Key Achievements:**
1. **Enterprise Payer Management Platform (2022-2024)**
   - Architected event-driven microservices handling 1M+ transactions/day
   - Reduced system latency by 60% through strategic caching and async processing
   - Led team of 8 engineers, established coding standards and review processes
   - Tech: TypeScript, NestJS, PostgreSQL, Redis, RabbitMQ, Kubernetes

2. **Healthcare Data Integration System (2020-2022)**
   - Built real-time data pipeline processing 500K records/hour
   - Designed HIPAA-compliant architecture with audit logging and encryption
   - Implemented HL7/FHIR integration for 20+ healthcare providers
   - Tech: Node.js, PostgreSQL, Apache Kafka, AWS Lambda

3. **Financial Services Dashboard (2018-2020)**
   - Created real-time analytics platform for $2B+ AUM
   - Optimized React performance: reduced load time from 8s to 1.2s
   - Implemented comprehensive accessibility (WCAG 2.1 AA)
   - Tech: React, TypeScript, D3.js, WebSocket, Redis

4. **This Portfolio (2024-Present)**
   - Built innovative 2D spatial canvas with GPU-accelerated pan/zoom
   - Achieved 60fps performance with progressive loading and optimization
   - Comprehensive test coverage (90%+) with Vitest and Playwright
   - Tech: React 19, TypeScript, Vite, Tailwind CSS

**Leadership & Collaboration:**
- Mentored 15+ junior engineers, focusing on architecture and code quality
- Led technical design reviews and architecture decision records (ADRs)
- Established testing practices that increased coverage from 40% to 95%
- Regular conference speaker on enterprise architecture and DDD

**Additional Skills:**
- Action sports photography (professional level)
- Technical writing and documentation
- Agile/Scrum methodologies
- Cross-functional team collaboration
`;

export const SmartResumeGenerator: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsCaptcha, setNeedsCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);

  // Honeypot field (hidden from users, bots will fill it)
  const [honeypot, setHoneypot] = useState('');

  const handleGenerate = async () => {
    setError(null);

    // 1. Check if API is configured
    if (!genAI) {
      setError('Gemini API key not configured. Set VITE_GEMINI_API_KEY in your .env.local file.');
      return;
    }

    // 2. Validate input
    if (jobDescription.trim().length < 50) {
      setError('Please paste a complete job description (at least 50 characters)');
      return;
    }

    // 3. Rate limiting check
    const userIdentifier = await getUserIdentifier();
    const rateLimitCheck = await rateLimiter.checkLimit(
      userIdentifier,
      'resume-generator',
      0.002 // ~$0.002 per request (Gemini Pro pricing)
    );

    if (!rateLimitCheck.allowed) {
      if (rateLimitCheck.requiresCaptcha) {
        setNeedsCaptcha(true);
        return;
      }
      setError(rateLimitCheck.reason || 'Rate limit exceeded');
      return;
    }

    setRemainingRequests(rateLimitCheck.remainingRequests || null);

    // 4. Bot detection
    const botCheck = await botDetector.checkRequest({
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      honeypot,
      timing: botDetector.getFormDuration()
    });

    if (botCheck.isBot) {
      setError('Suspicious activity detected. Please refresh the page and try again.');
      console.warn('Bot detected:', botCheck.signals);
      return;
    }

    // 5. CAPTCHA validation if required
    if (needsCaptcha && !captchaToken) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
You are helping Nino Chavez create a tailored resume for a specific job opportunity.

**Nino's Background:**
${NINO_BACKGROUND}

**Target Job Description:**
${jobDescription}

**Task:**
Generate a professional, ATS-optimized resume that:

1. **Highlights Relevant Experience:**
   - Focus on projects and achievements most relevant to this role
   - Use keywords from the job description naturally
   - Emphasize quantifiable results (%, $, time saved, scale)

2. **Structure:**
   - Professional Summary (2-3 sentences tailored to this role)
   - Technical Skills (prioritize skills mentioned in job description)
   - Professional Experience (3-4 most relevant projects)
   - Key Achievements (bullet points with metrics)

3. **Optimization:**
   - Use action verbs (Built, Architected, Led, Optimized, Implemented)
   - Keep it concise (fit on one page worth of content)
   - ATS-friendly formatting (no tables, simple markdown)
   - Professional tone matching the company culture evident in job description

4. **Avoid:**
   - Generic buzzwords without context
   - Experience not relevant to this role
   - Listing technologies without demonstrating their use
   - Anything that feels copy-pasted vs tailored

**Output Format:**
Return a clean, professional resume in Markdown format that can be exported to PDF.

**Example Structure:**
\`\`\`markdown
# Nino Chavez
**Software Engineer & Enterprise Architect**

[Your tailored summary here]

## Technical Skills
[Prioritized list matching job requirements]

## Professional Experience

### [Most Relevant Project Title]
**[Company/Context]** | [Dates]

- [Achievement with metrics]
- [Achievement with metrics]
- [Achievement with metrics]

[Repeat for 2-3 more relevant projects]

## Notable Achievements
- [Key achievement matching job requirement]
- [Key achievement matching job requirement]

## Additional
- [Relevant certifications, education, or other differentiators]
\`\`\`

Generate the resume now:
`;

      const result = await model.generateContent(prompt);
      const generatedResume = result.response.text();

      // Clean up markdown code blocks if present
      const cleanedResume = generatedResume
        .replace(/```markdown\n/g, '')
        .replace(/```\n?$/g, '')
        .trim();

      setResume(cleanedResume);
      botDetector.reset(); // Reset for next use
    } catch (err) {
      console.error('Resume generation failed:', err);
      setError('Failed to generate resume. Please try again. If the problem persists, check your API key configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!resume) return;

    const blob = new Blob([resume], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nino-chavez-resume-tailored.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setJobDescription('');
    setResume(null);
    setError(null);
    setHoneypot('');
    setCaptchaToken(null);
    setNeedsCaptcha(false);
    setRemainingRequests(null);
    botDetector.reset();
  };

  // Show CAPTCHA if needed
  if (needsCaptcha && !captchaToken) {
    return (
      <CaptchaChallenge
        onVerify={(token) => {
          setCaptchaToken(token);
          setNeedsCaptcha(false);
          handleGenerate(); // Retry generation after CAPTCHA
        }}
        onError={() => {
          setError('CAPTCHA verification failed. Please try again.');
          setNeedsCaptcha(false);
        }}
        message="Please verify you're human to generate a resume"
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Smart Resume Generator
        </h1>
        <p className="text-gray-600">
          Paste a job description to generate a tailored resume highlighting Nino's most relevant experience
        </p>

        {remainingRequests !== null && (
          <div className="mt-3 text-sm text-violet-600">
            {remainingRequests} requests remaining this hour
          </div>
        )}
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
        aria-hidden="true"
      />

      {!resume ? (
        // Input Form
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              onFocus={() => botDetector.markFormStart()}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste the full job description here...

Example:
Senior Software Engineer
We're seeking a senior engineer with expertise in React, TypeScript, and cloud architecture...

Requirements:
- 5+ years experience with React and modern JavaScript
- Strong understanding of microservices and event-driven architecture
- Experience with AWS, Docker, and Kubernetes
..."
            />
            <div className="mt-2 text-xs text-gray-500">
              {jobDescription.length} characters • Minimum 50 characters required
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!jobDescription || loading || jobDescription.length < 50}
            className="w-full bg-violet-600 text-white py-4 rounded-lg font-semibold hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Generating tailored resume...
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Generate Tailored Resume
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="font-medium mb-1">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-violet-900 mb-3 flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              How it works
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-violet-600 font-bold">1.</span>
                <span>Paste the complete job description you're applying for</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 font-bold">2.</span>
                <span>AI analyzes requirements and matches them to Nino's background</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 font-bold">3.</span>
                <span>Get a tailored resume highlighting the most relevant experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 font-bold">4.</span>
                <span>Export as Markdown or print to PDF</span>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-violet-200 text-xs text-violet-700">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Privacy & Security</span>
              </div>
              <p className="text-violet-600">
                Your job description is processed securely and not stored. Rate limited to 5 requests per hour.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Generated Resume View
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Generated Resume
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportMarkdown}
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Markdown
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print / Save as PDF
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>

          {/* Resume Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-12 shadow-sm print:shadow-none print:border-0">
            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
              <ReactMarkdown>{resume}</ReactMarkdown>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Next Steps
            </h3>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• Review and customize the resume to add personal touches</li>
              <li>• Use "Print / Save as PDF" to create a professional PDF version</li>
              <li>• Proofread carefully before submitting</li>
              <li>• Consider the company culture and adjust tone if needed</li>
            </ul>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .prose, .prose * {
            visibility: visible;
          }
          .prose {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 8.5in;
            font-size: 11pt;
            line-height: 1.4;
          }
          .prose h1 {
            font-size: 24pt;
            margin-bottom: 8pt;
          }
          .prose h2 {
            font-size: 14pt;
            margin-top: 16pt;
            margin-bottom: 8pt;
            border-bottom: 1pt solid #ccc;
          }
          .prose h3 {
            font-size: 12pt;
            margin-top: 12pt;
            margin-bottom: 4pt;
          }
          .prose ul, .prose ol {
            margin-top: 4pt;
            margin-bottom: 8pt;
          }
          .prose li {
            margin-bottom: 2pt;
          }
        }
      `}</style>
    </div>
  );
};

export default SmartResumeGenerator;
