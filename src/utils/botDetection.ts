/**
 * Bot Detection System
 *
 * Multi-signal analysis to detect automated requests:
 * - Honeypot fields (invisible to humans, filled by bots)
 * - User-agent patterns (headless browsers, scrapers)
 * - Mouse movement tracking (bots have no natural movement)
 * - Timing patterns (instant form fills)
 * - Request signatures (missing referrer, suspicious patterns)
 *
 * @fileoverview Bot detection for AI features
 * @version 1.0.0
 */

export interface BotDetectionResult {
  isBot: boolean;
  confidence: number; // 0-1 scale
  signals: string[];
}

interface MouseMovement {
  x: number;
  y: number;
  timestamp: number;
}

class BotDetector {
  private mouseMovements: MouseMovement[] = [];
  private formStartTime: number | null = null;
  private keyPresses: number = 0;

  constructor() {
    this.initTracking();
  }

  /**
   * Initialize behavioral tracking
   */
  private initTracking(): void {
    // Track mouse movements globally
    if (typeof window !== 'undefined') {
      document.addEventListener('mousemove', (e) => {
        this.trackMouseMovement(e.clientX, e.clientY);
      });

      // Track keyboard activity
      document.addEventListener('keypress', () => {
        this.keyPresses++;
      });
    }
  }

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

    // 1. Honeypot check (HIGH confidence indicator)
    if (request.honeypot && request.honeypot.trim() !== '') {
      signals.push('honeypot_filled');
      confidence += 0.8;

      console.warn('[BOT DETECTION] Honeypot triggered');
    }

    // 2. User-agent validation
    const uaResult = this.analyzeUserAgent(request.userAgent);
    if (uaResult.suspicious) {
      signals.push('suspicious_user_agent');
      confidence += 0.6;

      console.warn('[BOT DETECTION] Suspicious user-agent:', uaResult.reason);
    }

    // 3. Referrer check
    if (!request.referrer) {
      signals.push('missing_referrer');
      confidence += 0.3;
    } else if (!this.isValidReferrer(request.referrer)) {
      signals.push('invalid_referrer');
      confidence += 0.4;
    }

    // 4. Timing check (instant form submission)
    if (request.timing !== undefined) {
      if (request.timing < 1000) {
        signals.push('instant_submission');
        confidence += 0.5;

        console.warn('[BOT DETECTION] Suspiciously fast submission:', request.timing);
      } else if (request.timing > 300000) {
        // Over 5 minutes is also suspicious (form abandoned, then auto-submitted)
        signals.push('delayed_submission');
        confidence += 0.3;
      }
    }

    // 5. Mouse movement analysis (reduced penalty for legitimate quick interactions)
    const mouseResult = this.analyzeMouseMovement();
    if (mouseResult.suspicious) {
      signals.push('limited_mouse_movement');
      confidence += 0.2; // Reduced from 0.4 - file uploads may have minimal movement
    }

    // 6. Keyboard activity check (only flag if NO mouse activity either)
    if (this.keyPresses === 0 && this.mouseMovements.length === 0 && request.timing !== undefined && request.timing > 1000) {
      signals.push('no_keyboard_activity');
      confidence += 0.3;
    }

    // 7. Browser feature detection
    const browserResult = this.analyzeBrowserFeatures();
    if (browserResult.suspicious) {
      signals.push('missing_browser_features');
      confidence += 0.5;
    }

    // Cap confidence at 1.0
    confidence = Math.min(confidence, 1.0);

    const isBot = confidence > 0.7;

    if (isBot) {
      console.error('[BOT DETECTION] Bot detected with confidence:', confidence.toFixed(2), signals);
    }

    return {
      isBot,
      confidence,
      signals
    };
  }

  /**
   * Track mouse movements for behavioral analysis
   */
  trackMouseMovement(x: number, y: number): void {
    const now = Date.now();

    this.mouseMovements.push({ x, y, timestamp: now });

    // Keep only last 50 movements (rolling window)
    if (this.mouseMovements.length > 50) {
      this.mouseMovements.shift();
    }

    // Clean up movements older than 60 seconds
    this.mouseMovements = this.mouseMovements.filter(
      m => now - m.timestamp < 60000
    );
  }

  /**
   * Mark form interaction start for timing analysis
   */
  markFormStart(): void {
    this.formStartTime = Date.now();
    this.keyPresses = 0;
  }

  /**
   * Get time elapsed since form start
   */
  getFormDuration(): number {
    return this.formStartTime ? Date.now() - this.formStartTime : 0;
  }

  /**
   * Reset tracking state
   */
  reset(): void {
    this.formStartTime = null;
    this.keyPresses = 0;
    // Don't reset mouse movements - they're ambient tracking
  }

  // ===== PRIVATE ANALYSIS METHODS =====

  /**
   * Analyze user-agent string for bot patterns
   */
  private analyzeUserAgent(ua: string): { suspicious: boolean; reason?: string } {
    if (!ua) {
      return { suspicious: true, reason: 'Missing user-agent' };
    }

    const suspiciousPatterns = [
      { pattern: /bot/i, reason: 'Contains "bot"' },
      { pattern: /crawl/i, reason: 'Contains "crawl"' },
      { pattern: /spider/i, reason: 'Contains "spider"' },
      { pattern: /scrape/i, reason: 'Contains "scrape"' },
      { pattern: /headless/i, reason: 'Headless browser' },
      { pattern: /phantom/i, reason: 'PhantomJS' },
      { pattern: /selenium/i, reason: 'Selenium' },
      { pattern: /puppeteer/i, reason: 'Puppeteer' },
      { pattern: /playwright/i, reason: 'Playwright' },
      { pattern: /webdriver/i, reason: 'WebDriver' },
      { pattern: /automated/i, reason: 'Automated browser' },
      { pattern: /python-requests/i, reason: 'Python requests library' },
      { pattern: /curl/i, reason: 'cURL' },
      { pattern: /wget/i, reason: 'wget' },
    ];

    for (const { pattern, reason } of suspiciousPatterns) {
      if (pattern.test(ua)) {
        return { suspicious: true, reason };
      }
    }

    // Check for overly generic user-agents
    if (ua === 'Mozilla/5.0' || ua.length < 20) {
      return { suspicious: true, reason: 'Generic or truncated user-agent' };
    }

    return { suspicious: false };
  }

  /**
   * Check if referrer is valid
   */
  private isValidReferrer(referrer: string): boolean {
    try {
      const url = new URL(referrer);
      const validHosts = [
        'nino-chavez.netlify.app',
        'localhost',
        '127.0.0.1'
      ];

      return validHosts.some(host => url.hostname.includes(host));
    } catch {
      return false;
    }
  }

  /**
   * Analyze mouse movement patterns
   */
  private analyzeMouseMovement(): { suspicious: boolean } {
    // No movements at all is suspicious, but only with low confidence
    // Some legitimate users may use keyboard-only navigation or quick uploads
    if (this.mouseMovements.length === 0) {
      return { suspicious: true };
    }

    // Reduced threshold: 2+ movements is enough for legitimate interaction
    // Original was 5, but quick file uploads may have minimal mouse activity
    if (this.mouseMovements.length < 2) {
      return { suspicious: true };
    }

    // Check for unnatural patterns (perfectly straight lines, repetitive)
    const movements = this.mouseMovements;
    if (movements.length >= 3) {
      let perfectLines = 0;

      for (let i = 2; i < movements.length; i++) {
        const dx1 = movements[i-1].x - movements[i-2].x;
        const dy1 = movements[i-1].y - movements[i-2].y;
        const dx2 = movements[i].x - movements[i-1].x;
        const dy2 = movements[i].y - movements[i-1].y;

        // Check if movements are in perfectly straight line
        if (dx1 === dx2 && dy1 === dy2) {
          perfectLines++;
        }
      }

      // Too many perfect lines is suspicious
      if (perfectLines > movements.length * 0.5) {
        return { suspicious: true };
      }
    }

    return { suspicious: false };
  }

  /**
   * Check for missing browser features that bots often lack
   */
  private analyzeBrowserFeatures(): { suspicious: boolean } {
    if (typeof window === 'undefined') {
      return { suspicious: false }; // Server-side rendering
    }

    const checks = [
      typeof window.requestAnimationFrame === 'function',
      typeof window.localStorage === 'object',
      typeof window.sessionStorage === 'object',
      typeof navigator.permissions === 'object' || navigator.permissions === undefined,
      'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768,
    ];

    const failedChecks = checks.filter(check => !check).length;

    // Multiple missing features is suspicious
    return { suspicious: failedChecks >= 2 };
  }
}

// Singleton instance
export const botDetector = new BotDetector();

/**
 * React hook for bot detection in components
 */
export function useBotDetection() {
  return {
    markFormStart: () => botDetector.markFormStart(),
    getFormDuration: () => botDetector.getFormDuration(),
    checkRequest: (request: Parameters<typeof botDetector.checkRequest>[0]) =>
      botDetector.checkRequest(request),
    reset: () => botDetector.reset(),
  };
}
