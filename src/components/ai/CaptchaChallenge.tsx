/**
 * CAPTCHA Challenge Component
 *
 * Uses hCaptcha (privacy-focused alternative to reCAPTCHA)
 * Triggered when:
 * - 3+ rapid requests detected
 * - Suspicious bot behavior
 * - Rate limit warnings
 *
 * @fileoverview CAPTCHA verification for AI features
 * @version 1.0.0
 */

import React, { useState } from 'react';

export interface CaptchaChallengeProps {
  onVerify: (token: string) => void;
  onError: () => void;
  message?: string;
}

/**
 * CAPTCHA Challenge UI
 *
 * Note: For now, this is a placeholder implementation.
 * To use real hCaptcha, install @hcaptcha/react-hcaptcha:
 *
 * npm install @hcaptcha/react-hcaptcha
 *
 * Then replace this with:
 * import HCaptcha from '@hcaptcha/react-hcaptcha';
 */
export const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({
  onVerify,
  onError,
  message = 'Verify you\'re human to continue'
}) => {
  const [verifying, setVerifying] = useState(false);

  // Placeholder implementation - simulates CAPTCHA verification
  const handleVerify = () => {
    setVerifying(true);

    // Simulate CAPTCHA verification delay
    setTimeout(() => {
      const mockToken = `mock-captcha-token-${Date.now()}`;
      onVerify(mockToken);
      setVerifying(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-violet-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Security Check
          </h2>
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {/* Placeholder CAPTCHA - Replace with real hCaptcha */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center">
          {verifying ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
              <p className="text-sm text-gray-600">Verifying...</p>
            </div>
          ) : (
            <button
              onClick={handleVerify}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
            >
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              I'm not a robot
            </button>
          )}
        </div>

        {/*
          Real hCaptcha implementation:

          <HCaptcha
            sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
            onVerify={onVerify}
            onError={onError}
          />
        */}

        <div className="text-xs text-gray-500 text-center">
          <p className="mb-1">
            This verification helps protect against automated abuse
          </p>
          <p>
            Powered by{' '}
            <a
              href="https://www.hcaptcha.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:text-violet-700"
            >
              hCaptcha
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaptchaChallenge;

/**
 * HOC to wrap components with CAPTCHA protection
 */
export function withCaptchaProtection<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const [needsCaptcha, setNeedsCaptcha] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);

    if (needsCaptcha && !captchaVerified) {
      return (
        <CaptchaChallenge
          onVerify={(token) => {
            console.log('[CAPTCHA] Verified:', token);
            setCaptchaVerified(true);
            setNeedsCaptcha(false);
          }}
          onError={() => {
            console.error('[CAPTCHA] Verification failed');
          }}
        />
      );
    }

    return <Component {...props} />;
  };
}
