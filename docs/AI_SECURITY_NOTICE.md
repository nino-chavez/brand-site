# AI Features Security Notice

## ⚠️ CRITICAL: Development-Only Implementation

**DO NOT DEPLOY TO PRODUCTION WITHOUT READING THIS DOCUMENT**

---

## Current Security Issues

### 🔴 CRITICAL: API Key Exposure

**Problem:**
The current implementation uses `VITE_GEMINI_API_KEY` which is embedded in the client-side JavaScript bundle. Anyone who views your site can extract this key from the browser DevTools.

**Impact:**
- Your API key is publicly visible
- Anyone can make unlimited requests using your key
- You will be billed for all usage
- Potential for abuse and cost overruns

**Current State:**
```typescript
// ❌ INSECURE - API key in client code
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
```

**Why VITE_ prefix is dangerous:**
Vite embeds ALL variables prefixed with `VITE_` into the client bundle. This makes them accessible to anyone viewing your site.

---

### 🔴 CRITICAL: Client-Side Rate Limiting

**Problem:**
Rate limiting is implemented using browser `localStorage`, which can be easily bypassed.

**How to bypass:**
```javascript
// Any user can run this in browser console:
localStorage.clear(); // Reset all limits
localStorage.setItem('ai-cost-tracker', '{"monthlySpend":0}'); // Reset costs
```

**Impact:**
- No real protection against abuse
- Users can bypass all limits
- Monthly cost cap ($50) is not enforced
- Bot detection can be disabled

---

## Safe Usage (Development/Testing Only)

### ✅ Current Safe Scenarios

1. **Local Development**
   - Testing features on localhost
   - You are the only user
   - API key is in `.env.local` (gitignored)

2. **Private Demo**
   - Deployed to password-protected staging URL
   - Limited audience
   - Monitoring API usage daily

### ❌ Unsafe Scenarios (DO NOT DO)

1. **Public Production Deployment**
   - Exposing API key to public internet
   - No server-side protection
   - Open to abuse and cost overruns

2. **Sharing Demo URLs**
   - Anyone with the URL can use your API key
   - Could result in thousands of dollars in charges

---

## Production-Ready Implementation

To safely deploy AI features to production, you MUST implement server-side protection:

### Required Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │─────▶│  API Route   │─────▶│   Gemini    │
│  (Client)   │      │  (Server)    │      │    API      │
└─────────────┘      └──────────────┘      └─────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │   Database   │
                     │ (Rate Limits)│
                     └──────────────┘
```

### Step 1: Create Server-Side API Routes

Create `/api/ai/generate-resume.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimit } from '@/lib/rateLimit'; // Redis-based
import { verifyAuth } from '@/lib/auth'; // Optional auth

export async function POST(request: Request) {
  // 1. Get real IP address
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // 2. Check rate limit (Redis/database)
  const rateLimitCheck = await rateLimit.check(ip, {
    limit: 10,
    window: '1h'
  });

  if (!rateLimitCheck.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // 3. Validate input
  const { jobDescription } = await request.json();

  if (!jobDescription || jobDescription.length > 10000) {
    return Response.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }

  // 4. Call Gemini API server-side
  // API key is in server environment (NOT accessible to clients)
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  try {
    const result = await model.generateContent(prompt);
    const resume = result.response.text();

    // 5. Track usage in database
    await db.aiUsage.create({
      ip,
      feature: 'resume-generator',
      cost: 0.002,
      timestamp: new Date()
    });

    return Response.json({ resume });
  } catch (error) {
    console.error('Gemini API error:', error);
    return Response.json(
      { error: 'AI service unavailable' },
      { status: 503 }
    );
  }
}
```

### Step 2: Update Client to Use API Routes

```typescript
// ✅ SECURE - No API key in client
const handleGenerate = async () => {
  try {
    const response = await fetch('/api/ai/generate-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription })
    });

    if (!response.ok) {
      if (response.status === 429) {
        setError('Rate limit exceeded. Try again later.');
      } else {
        setError('Failed to generate resume');
      }
      return;
    }

    const { resume } = await response.json();
    setResume(resume);
  } catch (error) {
    setError('Network error');
  }
};
```

### Step 3: Environment Variables

**Development (`.env.local`):**
```bash
# Client-accessible (for demo only)
VITE_DEMO_MODE=true

# Server-only (NEVER use VITE_ prefix for secrets)
GEMINI_API_KEY=your_actual_key_here
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://...
```

**Production (Netlify/Vercel environment variables):**
```bash
# Set via hosting platform UI (not in code)
GEMINI_API_KEY=your_actual_key_here
REDIS_URL=your_redis_url
DATABASE_URL=your_database_url
```

### Step 4: Add Rate Limiting (Redis)

```typescript
// lib/rateLimit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!
});

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const key = `ratelimit:${identifier}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, Math.floor(windowMs / 1000));
  }

  return current <= limit;
}
```

---

## Immediate Action Items

### Before Any Public Deployment:

- [ ] Remove `VITE_GEMINI_API_KEY` from all components
- [ ] Create server-side API routes (Next.js, Netlify Functions, Cloudflare Workers)
- [ ] Set up Redis or database for rate limiting
- [ ] Move API key to server-only environment variable
- [ ] Implement proper authentication (optional but recommended)
- [ ] Set up monitoring and alerts (Sentry, DataDog, etc.)
- [ ] Test rate limiting with multiple IPs
- [ ] Set up cost alerts with Google Cloud Console

### For Demo/Development:

- [x] API key is in `.env.local` (gitignored) ✅
- [x] Documentation clearly states "development only" ✅
- [ ] Add visual warning banner on AI features pages
- [ ] Disable AI features in production builds
- [ ] Monitor API usage daily via Google Cloud Console

---

## Current Deployment Status

### ✅ Safe to Deploy:

- Portfolio sections (no AI)
- Static content
- Client-side features (canvas, animations)

### ❌ DO NOT Deploy (Until Server-Side Implementation):

- Smart Resume Generator
- Recruiter Match Analyzer
- Composition Analyzer
- Skill Matcher (with API)
- Any feature using `VITE_GEMINI_API_KEY`

---

## Cost Protection Strategy

### Development ($0-5/month)

- Manual monitoring via Google Cloud Console
- Delete API key after testing
- Use free tier limits

### Production (Requires Infrastructure)

1. **Server-Side API Routes** - Hide API key
2. **Redis Rate Limiting** - Prevent abuse
3. **Database Cost Tracking** - Monitor spend
4. **Automated Alerts** - Email at 60%/90% budget
5. **Hard Caps** - Auto-disable at $50
6. **IP Blocking** - Ban abusive IPs
7. **CAPTCHA** - Human verification
8. **Authentication** - Optional user accounts

**Recommended Services:**
- **Hosting:** Vercel, Netlify, Cloudflare Pages (serverless functions)
- **Database:** Supabase, PlanetScale (PostgreSQL)
- **Rate Limiting:** Upstash Redis, Vercel KV
- **Monitoring:** Sentry, DataDog, LogRocket
- **Alerts:** SendGrid (email), Twilio (SMS)

---

## FAQ

### Q: Can I just deploy with the current code for a quick demo?

**A:** Only if:
- Demo is password-protected
- You monitor API usage hourly
- You're prepared to revoke and rotate the API key immediately after
- Total demo duration is < 1 hour
- You accept the risk of potential abuse

### Q: What if someone extracts my API key from the demo?

**A:** They can:
- Make unlimited requests to Gemini API
- Rack up thousands of dollars in charges on your account
- Use your key for their own projects
- Sell your key to others

**You must:**
- Immediately revoke the key in Google Cloud Console
- Generate a new key
- Check for unexpected usage/charges
- Contact Google Cloud support if needed

### Q: How much does the infrastructure cost?

**A:** Estimated monthly costs:

| Service | Provider | Cost |
|---------|----------|------|
| Hosting | Vercel Free / Netlify Free | $0 |
| Database | Supabase Free | $0 |
| Redis | Upstash Free (10K req/day) | $0 |
| Monitoring | Sentry Free | $0 |
| **Total Infrastructure** | | **$0** |
| Gemini API Usage | Google | $15-30 |

**Total: $15-30/month** (mostly API costs, infrastructure can be free tier)

### Q: Is there a simpler solution?

**A:** Yes, disable AI features in production:

```typescript
// In all AI components
if (import.meta.env.PROD) {
  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-yellow-900 mb-2">
        🚧 Feature Unavailable
      </h3>
      <p className="text-sm text-yellow-800">
        AI features are only available in development mode for security reasons.
        Contact me directly for custom AI-powered resume generation.
      </p>
    </div>
  );
}
```

This way:
- No API key exposure
- No cost risk
- Still demonstrates your capability
- Directs interested users to contact you directly

---

## Resources

- [Google AI Studio API Keys](https://makersuite.google.com/app/apikey)
- [Vercel API Routes](https://vercel.com/docs/functions/serverless-functions)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Upstash Redis](https://upstash.com/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated:** 2025-10-06
**Status:** Development Only - Not Production Ready
**Risk Level:** 🔴 HIGH (API key exposure)
