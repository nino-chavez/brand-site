# Viewfinder System Deployment Guide

This guide covers deploying the Viewfinder Hero Interface system to production environments.

## Pre-Deployment Checklist

### Performance Validation
- [ ] Bundle size under 65KB (gzipped: <20KB)
- [ ] 60fps mouse tracking performance verified
- [ ] 100ms delay accuracy tested across devices
- [ ] Memory leak testing completed

### Browser Compatibility
- [ ] Chrome 90+ tested
- [ ] Firefox 88+ tested
- [ ] Safari 14+ tested
- [ ] Edge 90+ tested
- [ ] Mobile browsers tested (iOS Safari, Chrome Mobile)

### Accessibility Compliance
- [ ] Screen reader compatibility verified
- [ ] Keyboard navigation functional
- [ ] High contrast mode support
- [ ] Reduced motion preferences respected

### Quality Assurance
- [ ] All test suites passing
- [ ] Error boundaries tested
- [ ] Graceful degradation verified
- [ ] Cross-browser fallbacks working

## Build Configuration

### Production Build

```bash
# Standard build
npm run build

# With bundle analysis
npm run build:analyze

# Expected output
dist/
├── index.html (2.71 KB)
├── assets/
│   └── index-[hash].js (203.31 KB)
```

### Vite Configuration

Ensure your `vite.config.ts` includes production optimizations:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'viewfinder': [
            './src/components/ViewfinderOverlay',
            './src/components/CrosshairSystem',
            './src/hooks/useMouseTracking'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000
  }
});
```

## Environment Setup

### Environment Variables

Create `.env.production`:

```bash
# Performance monitoring
VITE_PERFORMANCE_MONITORING=true

# Error tracking
VITE_ERROR_TRACKING=true

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
```

### Build Scripts

Update `package.json` with deployment-specific scripts:

```json
{
  "scripts": {
    "build": "vite build",
    "build:analyze": "npm run build && node scripts/bundle-analyzer.js",
    "build:staging": "NODE_ENV=staging npm run build",
    "build:production": "NODE_ENV=production npm run build",
    "deploy:staging": "npm run build:staging && npm run deploy-to-staging",
    "deploy:production": "npm run build:production && npm run deploy-to-production"
  }
}
```

## Deployment Platforms

### Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
# Initial deployment
vercel

# Production deployment
vercel --prod
```

3. **Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {},
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Netlify

1. **Deploy via Git:**
   - Connect repository to Netlify
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### AWS S3 + CloudFront

1. **Build and Upload:**
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

2. **S3 Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## Performance Optimization

### CDN Configuration

Set appropriate cache headers:

```nginx
# Static assets (images, fonts, JS, CSS)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# HTML files
location ~* \.html$ {
  expires -1;
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### Gzip Compression

Enable gzip for text assets:

```nginx
gzip on;
gzip_vary on;
gzip_types
  text/plain
  text/css
  text/js
  text/xml
  text/javascript
  application/javascript
  application/json
  application/xml+rss;
```

### Preload Critical Resources

Add to `index.html`:

```html
<head>
  <!-- Preload critical viewfinder assets -->
  <link rel="preload" href="/assets/viewfinder-core.js" as="script">
  <link rel="modulepreload" href="/assets/viewfinder-core.js">

  <!-- DNS prefetch for external resources -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
</head>
```

## Monitoring and Analytics

### Performance Monitoring

Add to your main component:

```tsx
import { useViewfinderPerformance } from '@/components/ViewfinderLazy';

function App() {
  const metrics = useViewfinderPerformance();

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Send metrics to analytics
      analytics.track('viewfinder_performance', metrics);
    }
  }, [metrics]);

  return <ViewfinderSystem />;
}
```

### Error Tracking

Configure error boundary reporting:

```tsx
<ViewfinderErrorBoundary
  onError={(error, errorInfo) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      errorTracker.captureException(error, {
        extra: errorInfo,
        tags: { component: 'viewfinder' }
      });
    }
  }}
>
  <ViewfinderOverlay />
</ViewfinderErrorBoundary>
```

### Bundle Size Monitoring

Add to CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Analyze Bundle Size
  run: |
    npm run build:analyze
    node -e "
      const { analyzeBundle } = require('./scripts/bundle-analyzer.js');
      const score = analyzeBundle();
      if (score < 70) {
        throw new Error('Bundle size optimization required');
      }
    "
```

## Security Considerations

### Content Security Policy

Add CSP headers:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self';
  font-src 'self';
```

### HTTPS Enforcement

Always deploy over HTTPS for production:

```nginx
server {
  listen 80;
  server_name your-domain.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name your-domain.com;

  ssl_certificate /path/to/certificate.crt;
  ssl_certificate_key /path/to/private.key;

  # Security headers
  add_header X-Frame-Options DENY;
  add_header X-Content-Type-Options nosniff;
  add_header X-XSS-Protection "1; mode=block";
}
```

## Testing in Production

### Health Checks

Create a health check endpoint:

```tsx
// public/health.json
{
  "status": "ok",
  "timestamp": "2024-09-24T18:00:00Z",
  "components": {
    "viewfinder": "operational",
    "mouse_tracking": "operational",
    "blur_effects": "operational"
  }
}
```

### Smoke Tests

Run post-deployment tests:

```bash
#!/bin/bash
# smoke-test.sh

URL="https://your-domain.com"

# Health check
curl -f "$URL/health.json" || exit 1

# Basic page load
curl -f "$URL" | grep -q "Viewfinder" || exit 1

# Asset loading
curl -f "$URL/assets/index-*.js" || exit 1

echo "✅ Smoke tests passed"
```

## Rollback Strategy

### Blue-Green Deployment

1. **Deploy to staging environment**
2. **Run full test suite**
3. **Switch traffic gradually**
4. **Monitor metrics**
5. **Rollback if issues detected**

### Feature Flags

Implement feature flags for gradual rollout:

```tsx
const FEATURE_FLAGS = {
  VIEWFINDER_ENABLED: process.env.VITE_ENABLE_VIEWFINDER === 'true',
  ADVANCED_BLUR: process.env.VITE_ENABLE_ADVANCED_BLUR === 'true',
};

function App() {
  if (!FEATURE_FLAGS.VIEWFINDER_ENABLED) {
    return <BasicInterface />;
  }

  return <ViewfinderInterface />;
}
```

## Troubleshooting

### Common Deployment Issues

**Assets not loading:**
```bash
# Check build output
ls -la dist/assets/

# Verify asset paths in HTML
grep -n "assets" dist/index.html
```

**Performance degradation:**
```bash
# Analyze bundle
npm run build:analyze

# Check for large dependencies
npm list --depth=0 --production
```

**Browser compatibility issues:**
```typescript
// Add polyfills if needed
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### Debugging Tools

Enable debug mode in development:

```tsx
if (process.env.NODE_ENV === 'development') {
  // Enable viewfinder debug overlay
  import('@/components/ViewfinderLazy').then(({ ViewfinderBundleAnalyzer }) => {
    render(<ViewfinderBundleAnalyzer />);
  });
}
```

## Maintenance

### Regular Tasks

- **Weekly**: Monitor performance metrics and error rates
- **Monthly**: Review bundle size and dependency updates
- **Quarterly**: Comprehensive browser compatibility testing
- **Annually**: Security audit and penetration testing

### Update Strategy

1. **Test updates in staging environment**
2. **Review breaking changes in dependencies**
3. **Update browser compatibility matrix**
4. **Run full regression test suite**
5. **Deploy during low-traffic periods**

### Performance Baselines

Maintain these performance targets:

| Metric | Target | Critical |
|--------|---------|----------|
| Bundle Size | <65KB | <100KB |
| Gzipped Size | <20KB | <30KB |
| Mouse Tracking Latency | <110ms | <150ms |
| Animation Frame Rate | 60fps | >50fps |
| Memory Usage | <50MB | <100MB |

## Support

For deployment issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review [browser compatibility](#browser-compatibility)
3. Verify [performance baselines](#performance-baselines)
4. Submit issue with deployment logs and error details

Remember to test thoroughly in staging environments before production deployment!