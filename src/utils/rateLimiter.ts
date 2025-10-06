/**
 * Rate Limiter - Multi-layer cost protection
 *
 * Prevents runaway API costs through:
 * - IP-based rate limiting (10 requests/hour per IP)
 * - Session-based limits (5 requests/hour per user)
 * - Daily quota (100 requests/day total)
 * - Monthly hard cap ($50 spend limit)
 *
 * @fileoverview Cost protection for AI features
 * @version 1.0.0
 */

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  requiresCaptcha?: boolean;
  remainingRequests?: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface CostTracker {
  dailySpend: number;
  monthlySpend: number;
  dailyRequests: number;
  monthlyRequests: number;
  lastReset: string;
  hardCap: number;
  featureUsage: Record<string, { requests: number; cost: number }>;
}

const STORAGE_KEY_COST = 'ai-cost-tracker';
const STORAGE_KEY_LIMITS = 'ai-rate-limits';
const STORAGE_KEY_BLOCKED = 'ai-blocked-ips';

// Cost estimates per feature (in USD)
const FEATURE_COSTS: Record<string, number> = {
  'resume-generator': 0.002, // Gemini Pro
  'skill-matcher': 0.0001, // Embedding only
  'composition-analyzer': 0.005, // Gemini Vision
  'content-discovery': 0.0001, // Embedding only
  'recommendations': 0, // Build-time only
};

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private costTracker: CostTracker;
  private blockedIPs: Set<string> = new Set();
  private rapidRequestTracking: Map<string, number[]> = new Map();

  constructor() {
    this.loadState();
    this.scheduleResets();
  }

  /**
   * Check if request should be allowed
   */
  async checkLimit(
    identifier: string,
    feature: string,
    estimatedCost: number = FEATURE_COSTS[feature] || 0
  ): Promise<RateLimitResult> {
    // 1. Check if IP is blocked
    if (this.blockedIPs.has(identifier)) {
      return {
        allowed: false,
        reason: 'IP temporarily blocked due to suspicious activity'
      };
    }

    // 2. Check monthly hard cap (critical - check first)
    if (this.costTracker.monthlySpend + estimatedCost > this.costTracker.hardCap) {
      await this.notifyAdmin('CRITICAL: Monthly cost cap exceeded');
      return {
        allowed: false,
        reason: 'Service temporarily unavailable. Please try again next month.'
      };
    }

    // 3. Check daily quota
    if (this.costTracker.dailyRequests >= 100) {
      return {
        allowed: false,
        reason: 'Daily quota exceeded. Resets at midnight UTC.'
      };
    }

    // 4. Check for rapid requests (bot behavior)
    if (this.isRapidRequest(identifier)) {
      return {
        allowed: false,
        requiresCaptcha: true
      };
    }

    // 5. Check IP-based rate limit (10/hour)
    const ipKey = `ip:${identifier}`;
    const ipLimit = this.limits.get(ipKey);

    if (ipLimit && ipLimit.count >= 10 && Date.now() < ipLimit.resetAt) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded. Try again in 1 hour.',
        remainingRequests: 0
      };
    }

    // 6. Check session-based limit (5/hour) - if we have session tracking
    const sessionKey = `session:${identifier}`;
    const sessionLimit = this.limits.get(sessionKey);

    if (sessionLimit && sessionLimit.count >= 5 && Date.now() < sessionLimit.resetAt) {
      return {
        allowed: false,
        reason: 'You\'ve reached your hourly limit. Please try again later.',
        remainingRequests: 0
      };
    }

    // 7. All checks passed - increment counters
    this.incrementLimit(ipKey, 3600000); // 1 hour window
    this.incrementLimit(sessionKey, 3600000);
    this.trackCost(feature, estimatedCost);

    const remaining = 10 - (ipLimit?.count || 0);

    return {
      allowed: true,
      remainingRequests: remaining
    };
  }

  /**
   * Detect rapid request patterns (bot behavior)
   * Blocks IP if 3+ requests within 30 seconds
   */
  private isRapidRequest(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.rapidRequestTracking.get(identifier) || [];

    // Remove timestamps older than 30 seconds
    const recentTimestamps = timestamps.filter(ts => now - ts < 30000);

    if (recentTimestamps.length >= 3) {
      // Block IP for 1 hour
      this.blockedIPs.add(identifier);
      setTimeout(() => {
        this.blockedIPs.delete(identifier);
        this.saveBlockedIPs();
      }, 3600000);
      this.saveBlockedIPs();

      console.warn(`[RATE LIMITER] IP blocked for rapid requests: ${identifier}`);
      return true;
    }

    // Add current timestamp
    recentTimestamps.push(now);
    this.rapidRequestTracking.set(identifier, recentTimestamps);

    return false;
  }

  /**
   * Increment rate limit counter
   */
  private incrementLimit(key: string, windowMs: number): void {
    const existing = this.limits.get(key);

    if (existing && Date.now() < existing.resetAt) {
      existing.count++;
    } else {
      this.limits.set(key, {
        count: 1,
        resetAt: Date.now() + windowMs
      });
    }

    this.saveLimits();
  }

  /**
   * Track API costs by feature
   */
  private trackCost(feature: string, cost: number): void {
    this.costTracker.dailySpend += cost;
    this.costTracker.monthlySpend += cost;
    this.costTracker.dailyRequests++;
    this.costTracker.monthlyRequests++;

    // Track per-feature usage
    if (!this.costTracker.featureUsage[feature]) {
      this.costTracker.featureUsage[feature] = { requests: 0, cost: 0 };
    }
    this.costTracker.featureUsage[feature].requests++;
    this.costTracker.featureUsage[feature].cost += cost;

    this.saveCostTracker();

    // Alert at 60% and 90% of monthly cap
    if (this.costTracker.monthlySpend >= this.costTracker.hardCap * 0.9) {
      this.notifyAdmin(`ALERT: 90% of monthly budget used ($${this.costTracker.monthlySpend.toFixed(2)})`);
    } else if (this.costTracker.monthlySpend >= this.costTracker.hardCap * 0.6) {
      this.notifyAdmin(`Warning: 60% of monthly budget used ($${this.costTracker.monthlySpend.toFixed(2)})`);
    }
  }

  /**
   * Schedule automatic resets
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
      this.costTracker.dailyRequests = 0;
      this.saveCostTracker();
      console.log('[RATE LIMITER] Daily quota reset');
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
      this.costTracker.monthlyRequests = 0;
      this.costTracker.featureUsage = {};
      this.saveCostTracker();
      console.log('[RATE LIMITER] Monthly quota reset');
    }, msUntilNextMonth);
  }

  /**
   * Notify admin of critical events
   */
  private async notifyAdmin(message: string): Promise<void> {
    console.error(`[RATE LIMITER ALERT] ${message}`);
    // TODO: Implement actual notification (email via SendGrid, SMS via Twilio)
    // For now, just log to console and could send to analytics
  }

  /**
   * Get current cost tracker status
   */
  getCostStatus(): CostTracker {
    return { ...this.costTracker };
  }

  /**
   * Reset all limits (admin function)
   */
  resetAll(): void {
    this.limits.clear();
    this.blockedIPs.clear();
    this.rapidRequestTracking.clear();
    this.costTracker = this.createFreshCostTracker();
    this.saveState();
    console.log('[RATE LIMITER] All limits reset');
  }

  // ===== PERSISTENCE =====

  private loadState(): void {
    this.loadCostTracker();
    this.loadLimits();
    this.loadBlockedIPs();
  }

  private saveState(): void {
    this.saveCostTracker();
    this.saveLimits();
    this.saveBlockedIPs();
  }

  private loadCostTracker(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COST);
      if (saved) {
        this.costTracker = JSON.parse(saved);
      } else {
        this.costTracker = this.createFreshCostTracker();
      }
    } catch (error) {
      console.error('[RATE LIMITER] Failed to load cost tracker:', error);
      this.costTracker = this.createFreshCostTracker();
    }
  }

  private saveCostTracker(): void {
    try {
      localStorage.setItem(STORAGE_KEY_COST, JSON.stringify(this.costTracker));
    } catch (error) {
      console.error('[RATE LIMITER] Failed to save cost tracker:', error);
    }
  }

  private loadLimits(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LIMITS);
      if (saved) {
        const entries = JSON.parse(saved);
        this.limits = new Map(entries);
      }
    } catch (error) {
      console.error('[RATE LIMITER] Failed to load limits:', error);
    }
  }

  private saveLimits(): void {
    try {
      const entries = Array.from(this.limits.entries());
      localStorage.setItem(STORAGE_KEY_LIMITS, JSON.stringify(entries));
    } catch (error) {
      console.error('[RATE LIMITER] Failed to save limits:', error);
    }
  }

  private loadBlockedIPs(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BLOCKED);
      if (saved) {
        this.blockedIPs = new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('[RATE LIMITER] Failed to load blocked IPs:', error);
    }
  }

  private saveBlockedIPs(): void {
    try {
      localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(Array.from(this.blockedIPs)));
    } catch (error) {
      console.error('[RATE LIMITER] Failed to save blocked IPs:', error);
    }
  }

  private createFreshCostTracker(): CostTracker {
    return {
      dailySpend: 0,
      monthlySpend: 0,
      dailyRequests: 0,
      monthlyRequests: 0,
      lastReset: new Date().toISOString(),
      hardCap: 50, // $50/month
      featureUsage: {}
    };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Helper to get user identifier (IP fingerprint)
 * In production, this should be server-side
 */
export async function getUserIdentifier(): Promise<string> {
  // Create a fingerprint from browser characteristics
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset()
  ].join('|');

  // Hash the fingerprint
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
