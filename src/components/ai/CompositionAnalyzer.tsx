/**
 * Photography Composition Analyzer
 *
 * Upload an action sports photo → Get professional analysis of:
 * - Composition (rule of thirds, leading lines, framing)
 * - Lighting (direction, quality, natural vs flash)
 * - Timing (peak action, decisive moment)
 * - Technical settings (estimated shutter speed, aperture, ISO)
 * - Storytelling impact
 *
 * Cost: ~$0.005 per analysis (Gemini Vision)
 * Caching: Responses cached by image hash (same photo = instant results)
 *
 * @fileoverview AI-powered photo composition analysis
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { rateLimiter, getUserIdentifier } from '../../utils/rateLimiter';
import { botDetector } from '../../utils/botDetection';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const CompositionAnalyzer: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadCount, setUploadCount] = useState(0);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`Image too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setError(null);
    setImage(file);
    setAnalysis(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    if (!genAI) {
      setError('Gemini API key not configured. Set VITE_GEMINI_API_KEY in your .env.local file.');
      return;
    }

    // Check session limit (3 uploads per session)
    if (uploadCount >= 3) {
      setError('You\'ve reached the limit of 3 analyses per session. Refresh the page to analyze more photos.');
      return;
    }

    // Rate limiting
    const userIdentifier = await getUserIdentifier();
    const rateLimitCheck = await rateLimiter.checkLimit(
      userIdentifier,
      'composition-analyzer',
      0.005 // ~$0.005 per analysis (Gemini Vision pricing)
    );

    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.reason || 'Rate limit exceeded');
      return;
    }

    // Bot detection
    const botCheck = await botDetector.checkRequest({
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      timing: botDetector.getFormDuration()
    });

    if (botCheck.isBot) {
      setError('Suspicious activity detected');
      return;
    }

    // Check cache first
    const imageHash = await hashFile(image);
    const cacheKey = `composition-${imageHash}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setAnalysis(cached);
      setUploadCount(prev => prev + 1);
      return;
    }

    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const imageData = await fileToBase64(image);

      const prompt = `
Analyze this action sports photograph with the expertise of a professional photographer.

Provide a detailed analysis covering:

## 1. Composition
- Framing decisions (rule of thirds, golden ratio, negative space)
- Leading lines and visual flow
- Foreground, middle ground, background elements
- How the composition directs the viewer's eye

## 2. Lighting
- Light source (natural, flash, mixed)
- Direction (front, side, back, rim lighting)
- Quality (hard vs soft, shadows, highlights)
- Color temperature and mood created

## 3. Timing & Moment
- Peak action vs anticipation
- The "decisive moment" (Henri Cartier-Bresson concept)
- Whether the timing enhances the story
- Alternative timing choices and their impact

## 4. Technical Analysis
Based on visible evidence (motion blur, depth of field, grain):
- Estimated shutter speed
- Estimated aperture (f-stop)
- Estimated ISO
- Camera/lens characteristics evident

## 5. Storytelling
- What emotion or narrative does this convey?
- What makes this moment compelling?
- Connection between viewer and subject
- Unique aspects that elevate this beyond a snapshot

## 6. Areas for Improvement
- What could make this photo stronger?
- Cropping or recomposition suggestions
- Technical adjustments to consider
- Alternative approaches to capture this moment

Write in Nino Chavez's voice: technical yet accessible, emphasizing the "why" behind each decision. Use photography terminology correctly but explain concepts for those learning.

**Format your response in clear markdown with headers and bullet points.**
`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: image.type,
            data: imageData
          }
        }
      ]);

      const analysisText = result.response.text();

      // Cache the response
      localStorage.setItem(cacheKey, analysisText);

      setAnalysis(analysisText);
      setUploadCount(prev => prev + 1);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Photography Composition Analyzer
        </h1>
        <p className="text-gray-600">
          Upload an action sports photo to receive professional analysis of composition, lighting, and technique
        </p>

        {uploadCount > 0 && (
          <div className="mt-4 text-sm text-violet-600">
            {uploadCount}/3 analyses used this session
          </div>
        )}
      </div>

      {!analysis ? (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-violet-400 transition-colors">
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Selected photo"
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                />
                <div className="flex items-center justify-center gap-4">
                  <label className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    Choose Different Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="px-6 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Analyze Composition
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="inline-flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-700 mb-2">
                    Click to upload an action sports photo
                  </span>
                  <span className="text-sm text-gray-500">
                    or drag and drop
                  </span>
                  <span className="text-xs text-gray-400 mt-2">
                    PNG, JPG up to 5MB
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  onFocus={() => botDetector.markFormStart()}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-violet-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What You'll Learn
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-violet-600 font-bold">📐</span>
                <span><strong>Composition:</strong> How framing and visual elements work together</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 font-bold">💡</span>
                <span><strong>Lighting:</strong> Direction, quality, and mood creation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 font-bold">⏱️</span>
                <span><strong>Timing:</strong> Why this moment works (or how to improve it)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 font-bold">⚙️</span>
                <span><strong>Technical:</strong> Camera settings analysis from visible evidence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 font-bold">📖</span>
                <span><strong>Storytelling:</strong> What makes this image compelling</span>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-violet-200 text-xs text-violet-700">
              <p>
                💡 <span className="font-medium">Best results:</span> Upload photos with clear subjects, good resolution, and interesting action moments.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Composition Analysis
            </h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Analyze Another Photo
            </button>
          </div>

          {/* Image & Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <img
                src={imagePreview!}
                alt="Analyzed photo"
                className="w-full rounded-lg shadow-sm"
              />
            </div>

            {/* Analysis */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 prose prose-sm max-w-none prose-headings:text-gray-900 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-4 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 overflow-y-auto max-h-[600px]">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Next Steps
            </h3>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• Use this analysis to understand your photographic choices</li>
              <li>• Try applying these insights to future shoots</li>
              <li>• Compare multiple photos to see pattern differences</li>
              <li>• Experiment with suggested improvements</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Convert file to base64
 */
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

/**
 * Hash file for caching
 */
async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

export default CompositionAnalyzer;
