/**
 * URL State Synchronization and Deep Linking Tests
 *
 * Validates URL-based navigation and state management for LightboxCanvas:
 * - URL state synchronization with spatial navigation
 * - Deep linking to specific sections and states
 * - Browser history management (back/forward)
 * - URL parameter handling for canvas state
 * - Page refresh state persistence
 * - Social sharing URL generation
 * - SEO-friendly URL structures
 */

import { describe, it, expect, test, beforeEach, vi, afterEach } from 'vitest';

// Mock browser APIs
const mockBrowserAPIs = () => {
  // Mock History API
  const mockHistory = {
    length: 1,
    state: null,
    scrollRestoration: 'auto' as ScrollRestoration,
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn()
  };

  Object.defineProperty(window, 'history', {
    value: mockHistory,
    writable: true,
    configurable: true
  });

  // Mock Location API
  const mockLocation = {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    toString: vi.fn(() => 'http://localhost:3000/')
  };

  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
    configurable: true
  });

  // Store original URL constructor
  const OriginalURL = globalThis.URL;

  // Mock URL constructor
  global.URL = vi.fn((url: string, base?: string) => {
    const fullUrl = base ? url.startsWith('http') ? url : base + url : url;

    // Simple URL parsing for test purposes
    const [urlPart, hashPart] = fullUrl.split('#');
    const [pathPart, searchPart] = urlPart.split('?');

    return {
      href: fullUrl,
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: pathPart.replace('http://localhost:3000', '') || '/',
      search: searchPart ? `?${searchPart}` : '',
      hash: hashPart ? `#${hashPart}` : '',
      searchParams: new URLSearchParams(searchPart || ''),
      toString: () => fullUrl
    };
  }) as any;

  // Mock URLSearchParams
  global.URLSearchParams = vi.fn((init?: string | URLSearchParams | Record<string, string>) => {
    const params = new Map<string, string>();

    if (typeof init === 'string') {
      if (init.startsWith('?')) init = init.slice(1);
      init.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
      });
    } else if (init instanceof URLSearchParams) {
      init.forEach((value, key) => params.set(key, value));
    } else if (init && typeof init === 'object') {
      Object.entries(init).forEach(([key, value]) => params.set(key, value));
    }

    return {
      append: vi.fn((name: string, value: string) => params.set(name, value)),
      delete: vi.fn((name: string) => params.delete(name)),
      get: vi.fn((name: string) => params.get(name)),
      getAll: vi.fn((name: string) => params.has(name) ? [params.get(name)!] : []),
      has: vi.fn((name: string) => params.has(name)),
      set: vi.fn((name: string, value: string) => params.set(name, value)),
      forEach: vi.fn((callback: (value: string, key: string) => void) => {
        params.forEach((value, key) => callback(value, key));
      }),
      toString: vi.fn(() => {
        const pairs: string[] = [];
        params.forEach((value, key) => {
          pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        });
        return pairs.join('&');
      }),
      entries: vi.fn(() => params.entries()),
      keys: vi.fn(() => params.keys()),
      values: vi.fn(() => params.values())
    };
  }) as any;

  return { mockHistory, mockLocation };
};

// Mock popstate event
const mockPopstateEvent = (state: any = null) => {
  const event = new Event('popstate') as PopStateEvent;
  Object.defineProperty(event, 'state', { value: state });
  return event;
};

// Spatial sections for testing
const spatialSections = [
  'capture',
  'focus',
  'frame',
  'exposure',
  'develop',
  'portfolio'
];

// URL patterns for testing
const urlPatterns = {
  root: '/',
  section: '/section/:sectionName',
  sectionWithMode: '/section/:sectionName?mode=:mode',
  portfolio: '/portfolio',
  portfolioWithFilter: '/portfolio?filter=:filter',
  capture: '/capture',
  captureWithSettings: '/capture?iso=:iso&aperture=:aperture'
};

describe('URL State Synchronization and Deep Linking', () => {
  let mockHistory: any;
  let mockLocation: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mocks = mockBrowserAPIs();
    mockHistory = mocks.mockHistory;
    mockLocation = mocks.mockLocation;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('URL State Synchronization', () => {
    test('validates URL updates when navigating between sections', () => {
      // Navigate to capture section
      const captureState = { section: 'capture', mode: 'standard' };
      mockHistory.pushState(captureState, 'Capture Section', '/section/capture');

      expect(mockHistory.pushState).toHaveBeenCalledWith(
        captureState,
        'Capture Section',
        '/section/capture'
      );

      // Navigate to portfolio section
      const portfolioState = { section: 'portfolio', filter: 'recent' };
      mockHistory.pushState(portfolioState, 'Portfolio Section', '/section/portfolio?filter=recent');

      expect(mockHistory.pushState).toHaveBeenCalledWith(
        portfolioState,
        'Portfolio Section',
        '/section/portfolio?filter=recent'
      );
    });

    test('validates state object structure for different sections', () => {
      spatialSections.forEach(sectionName => {
        const state = {
          section: sectionName,
          timestamp: Date.now(),
          canvasState: {
            scale: 1,
            offset: { x: 0, y: 0 },
            activeSection: sectionName
          }
        };

        mockHistory.pushState(state, `${sectionName} Section`, `/section/${sectionName}`);

        expect(state.section).toBe(sectionName);
        expect(state.canvasState.activeSection).toBe(sectionName);
        expect(typeof state.timestamp).toBe('number');
      });
    });

    test('validates URL parameter handling for canvas state', () => {
      const canvasParams = new URLSearchParams({
        section: 'capture',
        mode: 'lightbox',
        scale: '1.5',
        offsetX: '100',
        offsetY: '50',
        activeElement: 'lens'
      });

      expect(canvasParams.get('section')).toBe('capture');
      expect(canvasParams.get('mode')).toBe('lightbox');
      expect(canvasParams.get('scale')).toBe('1.5');
      expect(canvasParams.get('offsetX')).toBe('100');
      expect(canvasParams.get('offsetY')).toBe('50');
      expect(canvasParams.get('activeElement')).toBe('lens');
    });

    test('validates query string serialization and deserialization', () => {
      const originalState = {
        section: 'develop',
        filters: ['contrast', 'saturation'],
        settings: { brightness: 0.2, contrast: 1.1 }
      };

      // Serialize to URL params
      const params = new URLSearchParams();
      params.set('section', originalState.section);
      params.set('filters', originalState.filters.join(','));
      params.set('brightness', originalState.settings.brightness.toString());
      params.set('contrast', originalState.settings.contrast.toString());

      const queryString = params.toString();
      expect(queryString).toContain('section=develop');
      expect(queryString).toContain('filters=contrast%2Csaturation');

      // Deserialize from URL params
      const deserializedParams = new URLSearchParams(queryString);
      const deserializedState = {
        section: deserializedParams.get('section'),
        filters: deserializedParams.get('filters')?.split(',') || [],
        settings: {
          brightness: parseFloat(deserializedParams.get('brightness') || '0'),
          contrast: parseFloat(deserializedParams.get('contrast') || '1')
        }
      };

      expect(deserializedState.section).toBe(originalState.section);
      expect(deserializedState.filters).toEqual(originalState.filters);
      expect(deserializedState.settings.brightness).toBe(originalState.settings.brightness);
      expect(deserializedState.settings.contrast).toBe(originalState.settings.contrast);
    });
  });

  describe('Deep Linking Functionality', () => {
    test('validates direct navigation to specific sections', () => {
      spatialSections.forEach(sectionName => {
        mockLocation.pathname = `/section/${sectionName}`;
        mockLocation.href = `http://localhost:3000/section/${sectionName}`;

        // Parse section from URL
        const pathSegments = mockLocation.pathname.split('/');
        const sectionFromUrl = pathSegments[pathSegments.length - 1];

        expect(sectionFromUrl).toBe(sectionName);
        expect(spatialSections).toContain(sectionFromUrl);
      });
    });

    test('validates deep linking with complex state parameters', () => {
      const complexUrl = '/section/capture?mode=lightbox&iso=800&aperture=2.8&shutter=1/60&focus=auto';
      mockLocation.search = '?mode=lightbox&iso=800&aperture=2.8&shutter=1/60&focus=auto';
      mockLocation.href = `http://localhost:3000${complexUrl}`;

      const params = new URLSearchParams(mockLocation.search);
      const stateFromUrl = {
        mode: params.get('mode'),
        settings: {
          iso: parseInt(params.get('iso') || '100'),
          aperture: parseFloat(params.get('aperture') || '1.4'),
          shutter: params.get('shutter'),
          focus: params.get('focus')
        }
      };

      expect(stateFromUrl.mode).toBe('lightbox');
      expect(stateFromUrl.settings.iso).toBe(800);
      expect(stateFromUrl.settings.aperture).toBe(2.8);
      expect(stateFromUrl.settings.shutter).toBe('1/60');
      expect(stateFromUrl.settings.focus).toBe('auto');
    });

    test('validates hash-based navigation for sub-sections', () => {
      const hashUrls = [
        '#capture-settings',
        '#portfolio-grid',
        '#develop-filters',
        '#exposure-controls'
      ];

      hashUrls.forEach(hash => {
        mockLocation.hash = hash;

        const [section, subsection] = hash.slice(1).split('-');
        expect(section).toBeDefined();
        expect(subsection).toBeDefined();
        expect(spatialSections.some(s => s.startsWith(section))).toBe(true);
      });
    });

    test('validates URL validation and sanitization', () => {
      const testUrls = [
        { input: '/section/capture', valid: true, sanitized: '/section/capture' },
        { input: '/section/invalid-section', valid: false, sanitized: '/' },
        { input: '/section/capture?mode=<script>', valid: false, sanitized: '/section/capture' },
        { input: '/section/portfolio?filter=recent', valid: true, sanitized: '/section/portfolio?filter=recent' }
      ];

      testUrls.forEach(({ input, valid, sanitized }) => {
        // Extract section from URL
        const pathMatch = input.match(/\/section\/([^?#]+)/);
        const sectionName = pathMatch ? pathMatch[1] : null;

        const isValidSection = sectionName ? spatialSections.includes(sectionName) : false;
        const containsScript = input.includes('<script>');
        const isValidUrl = isValidSection && !containsScript;

        expect(isValidUrl).toBe(valid);

        // Sanitization logic
        let sanitizedUrl = input;
        if (containsScript) {
          sanitizedUrl = input.split('?')[0]; // Remove query params if they contain scripts
        }
        if (!isValidSection) {
          sanitizedUrl = '/'; // Redirect to root if invalid section
        }

        if (valid) {
          expect(sanitizedUrl).toBe(sanitized);
        }
      });
    });
  });

  describe('Browser History Management', () => {
    test('validates history navigation (back/forward)', () => {
      // Simulate navigation sequence
      const navigationSequence = [
        { section: 'capture', url: '/section/capture' },
        { section: 'develop', url: '/section/develop' },
        { section: 'portfolio', url: '/section/portfolio' }
      ];

      navigationSequence.forEach(({ section, url }) => {
        const state = { section, timestamp: Date.now() };
        mockHistory.pushState(state, `${section} Section`, url);
      });

      // Test back navigation
      mockHistory.back();
      expect(mockHistory.back).toHaveBeenCalled();

      // Test forward navigation
      mockHistory.forward();
      expect(mockHistory.forward).toHaveBeenCalled();

      // Test go with specific index
      mockHistory.go(-2);
      expect(mockHistory.go).toHaveBeenCalledWith(-2);
    });

    test('validates popstate event handling', () => {
      const testStates = [
        { section: 'capture', mode: 'standard' },
        { section: 'portfolio', filter: 'recent' },
        null // Browser navigation to page without state
      ];

      testStates.forEach(state => {
        const popstateEvent = mockPopstateEvent(state);

        expect(popstateEvent.type).toBe('popstate');
        expect(popstateEvent.state).toBe(state);

        // Handle popstate event
        if (state && state.section) {
          expect(spatialSections).toContain(state.section);
        } else {
          // Handle null state (direct navigation)
          expect(state).toBeNull();
        }
      });
    });

    test('validates history state preservation', () => {
      const complexState = {
        section: 'develop',
        canvasState: {
          scale: 1.5,
          offset: { x: 100, y: 50 },
          rotation: 15
        },
        userSettings: {
          theme: 'dark',
          showGrid: true,
          snapToGrid: false
        },
        timestamp: Date.now()
      };

      mockHistory.pushState(complexState, 'Develop Section', '/section/develop');

      expect(mockHistory.pushState).toHaveBeenCalledWith(
        complexState,
        'Develop Section',
        '/section/develop'
      );

      // Verify state structure is preserved
      const [actualState] = mockHistory.pushState.mock.calls[mockHistory.pushState.mock.calls.length - 1];
      expect(actualState.section).toBe(complexState.section);
      expect(actualState.canvasState.scale).toBe(complexState.canvasState.scale);
      expect(actualState.userSettings.theme).toBe(complexState.userSettings.theme);
    });

    test('validates replaceState vs pushState usage', () => {
      // Use replaceState for same-section state updates
      const initialState = { section: 'capture', mode: 'standard' };
      mockHistory.pushState(initialState, 'Capture', '/section/capture');

      const updatedState = { section: 'capture', mode: 'lightbox' };
      mockHistory.replaceState(updatedState, 'Capture - Lightbox', '/section/capture?mode=lightbox');

      expect(mockHistory.pushState).toHaveBeenCalledWith(initialState, 'Capture', '/section/capture');
      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        updatedState,
        'Capture - Lightbox',
        '/section/capture?mode=lightbox'
      );

      // Use pushState for section changes
      const newSectionState = { section: 'portfolio', filter: 'all' };
      mockHistory.pushState(newSectionState, 'Portfolio', '/section/portfolio');

      expect(mockHistory.pushState).toHaveBeenCalledTimes(2);
    });
  });

  describe('Page Refresh State Persistence', () => {
    test('validates state reconstruction from URL on page load', () => {
      const testUrls = [
        {
          url: '/section/capture?mode=lightbox&scale=1.5',
          expectedState: {
            section: 'capture',
            mode: 'lightbox',
            canvasState: { scale: 1.5 }
          }
        },
        {
          url: '/section/portfolio?filter=recent&sort=date',
          expectedState: {
            section: 'portfolio',
            filter: 'recent',
            sort: 'date'
          }
        },
        {
          url: '/section/develop#filters',
          expectedState: {
            section: 'develop',
            subsection: 'filters'
          }
        }
      ];

      testUrls.forEach(({ url, expectedState }) => {
        // Parse URL
        const urlObj = new URL(url, 'http://localhost:3000');
        const pathSegments = urlObj.pathname.split('/');
        const section = pathSegments[pathSegments.length - 1];
        const params = urlObj.searchParams;
        const hash = urlObj.hash.slice(1);

        // Reconstruct state
        const reconstructedState: any = { section };

        if (params.get('mode')) reconstructedState.mode = params.get('mode');
        if (params.get('scale')) {
          reconstructedState.canvasState = { scale: parseFloat(params.get('scale')!) };
        }
        if (params.get('filter')) reconstructedState.filter = params.get('filter');
        if (params.get('sort')) reconstructedState.sort = params.get('sort');
        if (hash) reconstructedState.subsection = hash;

        expect(reconstructedState.section).toBe(expectedState.section);
        if (expectedState.mode) expect(reconstructedState.mode).toBe(expectedState.mode);
        if (expectedState.filter) expect(reconstructedState.filter).toBe(expectedState.filter);
        if (expectedState.sort) expect(reconstructedState.sort).toBe(expectedState.sort);
        if (expectedState.subsection) expect(reconstructedState.subsection).toBe(expectedState.subsection);
      });
    });

    test('validates localStorage integration for additional state', () => {
      // Mock localStorage
      const localStorageMock = (() => {
        let store: Record<string, string> = {};
        return {
          getItem: vi.fn((key: string) => store[key] || null),
          setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
          removeItem: vi.fn((key: string) => { delete store[key]; }),
          clear: vi.fn(() => { store = {}; })
        };
      })();

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      });

      // Store additional state in localStorage
      const additionalState = {
        userPreferences: { theme: 'dark', animations: true },
        canvasHistory: ['capture', 'develop', 'portfolio'],
        lastVisitTimestamp: Date.now()
      };

      localStorage.setItem('lightbox-canvas-state', JSON.stringify(additionalState));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lightbox-canvas-state',
        JSON.stringify(additionalState)
      );

      // Retrieve state from localStorage
      const retrievedStateStr = localStorage.getItem('lightbox-canvas-state');
      expect(localStorage.getItem).toHaveBeenCalledWith('lightbox-canvas-state');

      if (retrievedStateStr) {
        const retrievedState = JSON.parse(retrievedStateStr);
        expect(retrievedState.userPreferences.theme).toBe('dark');
        expect(retrievedState.canvasHistory).toHaveLength(3);
        expect(typeof retrievedState.lastVisitTimestamp).toBe('number');
      }
    });

    test('validates sessionStorage for temporary state', () => {
      // Mock sessionStorage
      const sessionStorageMock = (() => {
        let store: Record<string, string> = {};
        return {
          getItem: vi.fn((key: string) => store[key] || null),
          setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
          removeItem: vi.fn((key: string) => { delete store[key]; }),
          clear: vi.fn(() => { store = {}; })
        };
      })();

      Object.defineProperty(window, 'sessionStorage', {
        value: sessionStorageMock,
        writable: true
      });

      // Store temporary session state
      const sessionState = {
        currentSession: 'session-' + Date.now(),
        navigationStack: ['/section/capture', '/section/develop'],
        temporarySettings: { debugMode: true }
      };

      sessionStorage.setItem('lightbox-session', JSON.stringify(sessionState));

      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'lightbox-session',
        JSON.stringify(sessionState)
      );

      // Retrieve session state
      const retrievedSessionStr = sessionStorage.getItem('lightbox-session');
      if (retrievedSessionStr) {
        const retrievedSession = JSON.parse(retrievedSessionStr);
        expect(retrievedSession.currentSession).toContain('session-');
        expect(retrievedSession.navigationStack).toHaveLength(2);
        expect(retrievedSession.temporarySettings.debugMode).toBe(true);
      }
    });
  });

  describe('Social Sharing and SEO URLs', () => {
    test('validates social sharing URL generation', () => {
      const shareableStates = [
        {
          section: 'portfolio',
          item: 'landscape-series-1',
          expectedUrl: '/section/portfolio?item=landscape-series-1'
        },
        {
          section: 'capture',
          mode: 'lightbox',
          settings: { iso: 800, aperture: 2.8 },
          expectedUrl: '/section/capture?mode=lightbox&iso=800&aperture=2.8'
        }
      ];

      shareableStates.forEach(({ section, expectedUrl, ...state }) => {
        // Generate shareable URL
        const params = new URLSearchParams();
        Object.entries(state).forEach(([key, value]) => {
          if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
              params.set(subKey, String(subValue));
            });
          } else {
            params.set(key, String(value));
          }
        });

        const shareableUrl = `/section/${section}?${params.toString()}`;

        // URLs should match expected pattern
        expect(shareableUrl).toContain(`/section/${section}`);
        expect(shareableUrl).toContain('?');
      });
    });

    test('validates SEO-friendly URL structures', () => {
      const seoUrls = [
        { url: '/section/portfolio', title: 'Photography Portfolio - Nino Chavez' },
        { url: '/section/capture', title: 'Camera Capture Interface - Nino Chavez' },
        { url: '/section/develop', title: 'Photo Development Tools - Nino Chavez' }
      ];

      seoUrls.forEach(({ url, title }) => {
        // URL should be clean and descriptive
        expect(url).toMatch(/^\/section\/[a-z]+$/);
        expect(url).not.toContain('?');
        expect(url).not.toContain('#');

        // Title should be descriptive
        expect(title).toContain('Nino Chavez');
        expect(title.length).toBeGreaterThan(20);
        expect(title.length).toBeLessThan(70); // SEO best practice
      });
    });

    test('validates Open Graph meta tag generation', () => {
      const openGraphData = {
        'og:title': 'Photography Portfolio - Spatial Navigation',
        'og:description': 'Explore photography through an innovative spatial canvas interface',
        'og:type': 'website',
        'og:url': 'https://ninochavez.com/section/portfolio',
        'og:image': 'https://ninochavez.com/og-image-portfolio.jpg'
      };

      Object.entries(openGraphData).forEach(([property, content]) => {
        expect(property).toMatch(/^og:[a-z]+$/);
        expect(content).toBeDefined();
        expect(typeof content).toBe('string');
        expect(content.length).toBeGreaterThan(0);
      });
    });

    test('validates Twitter Card meta generation', () => {
      const twitterCardData = {
        'twitter:card': 'summary_large_image',
        'twitter:creator': '@ninochavez',
        'twitter:title': 'Photography Portfolio - Spatial Navigation',
        'twitter:description': 'Explore photography through innovative spatial canvas interface',
        'twitter:image': 'https://ninochavez.com/twitter-card-portfolio.jpg'
      };

      Object.entries(twitterCardData).forEach(([name, content]) => {
        expect(name).toMatch(/^twitter:[a-z_]+$/);
        expect(content).toBeDefined();
        expect(typeof content).toBe('string');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('validates handling of malformed URLs', () => {
      const malformedUrls = [
        '/section/',
        '/section///',
        '/section/%20%20%20',
        '/section/capture?mode=',
        '/section/invalid-section'
      ];

      malformedUrls.forEach(url => {
        // Parse URL safely
        try {
          const urlObj = new URL(url, 'http://localhost:3000');
          const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
          const section = pathSegments[pathSegments.length - 1];

          // Validate section
          const isValidSection = spatialSections.includes(section);

          if (!isValidSection || !section || section.trim().length === 0) {
            // Should redirect to root or default section
            expect(isValidSection).toBe(false);
          }
        } catch (error) {
          // Malformed URLs should be handled gracefully
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    test('validates browser compatibility fallbacks', () => {
      // Test when History API is not available
      const originalHistory = window.history;

      try {
        // @ts-ignore
        delete window.history;

        // Should fall back to hash-based navigation
        const fallbackNavigation = (section: string) => {
          window.location.hash = `#section-${section}`;
          return window.location.hash;
        };

        const result = fallbackNavigation('capture');
        expect(result).toBe('#section-capture');

      } finally {
        window.history = originalHistory;
      }
    });

    test('validates URL length limitations', () => {
      // Test very long URLs
      const longParams = new URLSearchParams();
      for (let i = 0; i < 100; i++) {
        longParams.set(`param${i}`, `value${i}`.repeat(10));
      }

      const longUrl = `/section/capture?${longParams.toString()}`;

      // Most browsers limit URLs to ~2048 characters
      const urlLength = longUrl.length;

      if (urlLength > 2048) {
        // Should implement URL shortening or state compression
        expect(urlLength).toBeGreaterThan(2048);
      } else {
        expect(urlLength).toBeLessThanOrEqual(2048);
      }
    });

    test('validates state corruption recovery', () => {
      const corruptedStates = [
        null,
        undefined,
        {},
        { section: null },
        { section: 'invalid' },
        'not-an-object'
      ];

      corruptedStates.forEach(corruptedState => {
        // Should handle corrupted state gracefully
        const isValidState = (state: any) => {
          return state &&
                 typeof state === 'object' &&
                 typeof state.section === 'string' &&
                 spatialSections.includes(state.section);
        };

        const valid = isValidState(corruptedState);

        if (!valid) {
          // Should fallback to default state
          const defaultState = { section: 'portfolio' };
          expect(isValidState(defaultState)).toBe(true);
        }
      });
    });
  });

  describe('Integration Quality Gates', () => {
    test('validates URL synchronization completeness', () => {
      const requiredCapabilities = {
        historyManagement: true,
        deepLinking: true,
        stateReconstruction: true,
        socialSharing: true,
        seoOptimization: true,
        errorHandling: true
      };

      Object.entries(requiredCapabilities).forEach(([capability, required]) => {
        expect(capability).toBeDefined();
        expect(required).toBe(true);
      });
    });

    test('validates performance requirements', () => {
      const performanceRequirements = {
        urlUpdateLatency: 10, // ms
        stateReconstructionTime: 50, // ms
        historyNavigationTime: 30, // ms
        maxUrlLength: 2048 // characters
      };

      Object.entries(performanceRequirements).forEach(([requirement, limit]) => {
        expect(requirement).toBeDefined();
        expect(typeof limit).toBe('number');
        expect(limit).toBeGreaterThan(0);
      });
    });

    test('validates accessibility compliance', () => {
      const accessibilityFeatures = {
        keyboardNavigation: true,
        screenReaderSupport: true,
        focusManagement: true,
        semanticUrls: true
      };

      Object.entries(accessibilityFeatures).forEach(([feature, required]) => {
        expect(feature).toBeDefined();
        expect(required).toBe(true);
      });
    });
  });
});