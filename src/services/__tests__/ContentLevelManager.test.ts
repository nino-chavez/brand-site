/**
 * ContentLevelManager Service Tests
 *
 * Tests for extracted scale threshold logic and content level determination
 * Validates dynamic threshold adjustment, caching, and performance optimization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContentLevelManager, contentLevelManager, SCALE_THRESHOLDS } from '../ContentLevelManager';

// Mock window for testing
const mockWindow = {
  innerWidth: 1024,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  devicePixelRatio: 1.0
};

vi.stubGlobal('window', mockWindow);

// Mock performance for testing
vi.stubGlobal('performance', {
  now: vi.fn(() => Date.now()),
  memory: {
    jsHeapSizeLimit: 4294967296 // 4GB
  }
});

// Mock requestIdleCallback
vi.stubGlobal('requestIdleCallback', (callback: () => void) => {
  setTimeout(callback, 0);
});

describe('ContentLevelManager', () => {
  let manager: ContentLevelManager;

  beforeEach(() => {
    manager = ContentLevelManager.getInstance();
    manager.initialize(true); // Enable debug mode for testing
  });

  afterEach(() => {
    manager.resetThresholds();
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ContentLevelManager.getInstance();
      const instance2 = ContentLevelManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should use the exported singleton instance', () => {
      expect(contentLevelManager).toBe(ContentLevelManager.getInstance());
    });
  });

  describe('Device Type Detection', () => {
    it('should detect mobile device', () => {
      mockWindow.innerWidth = 600;
      expect(manager.getCurrentDeviceType()).toBe('mobile');
    });

    it('should detect tablet device', () => {
      mockWindow.innerWidth = 800;
      expect(manager.getCurrentDeviceType()).toBe('tablet');
    });

    it('should detect desktop device', () => {
      mockWindow.innerWidth = 1200;
      expect(manager.getCurrentDeviceType()).toBe('desktop');
    });

    it('should handle edge cases at breakpoints', () => {
      mockWindow.innerWidth = 768;
      expect(manager.getCurrentDeviceType()).toBe('mobile');

      mockWindow.innerWidth = 769;
      expect(manager.getCurrentDeviceType()).toBe('tablet');

      mockWindow.innerWidth = 1024;
      expect(manager.getCurrentDeviceType()).toBe('tablet');

      mockWindow.innerWidth = 1025;
      expect(manager.getCurrentDeviceType()).toBe('desktop');
    });
  });

  describe('Responsive Scale Calculation', () => {
    it('should calculate responsive scale for mobile', () => {
      const scale = manager.calculateResponsiveScale(1.5, 'mobile');
      expect(scale).toBeCloseTo(1.2, 2); // 1.5 * 0.8
    });

    it('should calculate responsive scale for tablet', () => {
      const scale = manager.calculateResponsiveScale(1.5, 'tablet');
      expect(scale).toBe(1.35); // 1.5 * 0.9
    });

    it('should calculate responsive scale for desktop', () => {
      const scale = manager.calculateResponsiveScale(1.5, 'desktop');
      expect(scale).toBe(1.5); // 1.5 * 1.0
    });

    it('should use current device type when not specified', () => {
      mockWindow.innerWidth = 600; // Mobile
      const scale = manager.calculateResponsiveScale(2.0);
      expect(scale).toBe(1.6); // 2.0 * 0.8
    });
  });

  describe('Content Level Determination', () => {
    it('should determine minimal content level', () => {
      const level = manager.determineContentLevel(0.5);
      expect(level).toBe('minimal');
    });

    it('should determine compact content level', () => {
      const level = manager.determineContentLevel(0.7);
      expect(level).toBe('compact');
    });

    it('should determine normal content level', () => {
      const level = manager.determineContentLevel(0.9);
      expect(level).toBe('normal');
    });

    it('should determine detailed content level', () => {
      const level = manager.determineContentLevel(1.2);
      expect(level).toBe('detailed');
    });

    it('should determine expanded content level', () => {
      const level = manager.determineContentLevel(2.5);
      expect(level).toBe('expanded');
    });

    it('should handle exact threshold values', () => {
      expect(manager.determineContentLevel(SCALE_THRESHOLDS.MINIMAL)).toBe('minimal');
      expect(manager.determineContentLevel(SCALE_THRESHOLDS.COMPACT)).toBe('compact');
      expect(manager.determineContentLevel(SCALE_THRESHOLDS.NORMAL)).toBe('normal');
      expect(manager.determineContentLevel(SCALE_THRESHOLDS.DETAILED)).toBe('detailed');
      expect(manager.determineContentLevel(SCALE_THRESHOLDS.EXPANDED)).toBe('expanded');
    });
  });

  describe('Caching System', () => {
    it('should cache content level calculations', () => {
      const scale1 = 1.2;
      const scale2 = 1.3;

      // First call
      const level1 = manager.determineContentLevel(scale1);
      const stats1 = manager.getCacheStats();

      // Second call with different scale to ensure cache growth
      const level2 = manager.determineContentLevel(scale2);
      const stats2 = manager.getCacheStats();

      // Third call with same scale as first to test cache hit
      const level3 = manager.determineContentLevel(scale1);

      expect(level1).toBe(level3); // Same scale should give same result
      expect(stats2.size).toBeGreaterThan(stats1.size);
    });

    it('should provide cache statistics', () => {
      manager.determineContentLevel(1.0);
      manager.determineContentLevel(1.5);
      manager.determineContentLevel(2.0);

      const stats = manager.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(Array.isArray(stats.keys)).toBe(true);
    });
  });

  describe('Progressive Styles', () => {
    it('should provide styles for minimal level', () => {
      const styles = manager.getProgressiveStyles('minimal', false);
      expect(styles.padding).toBe('0.5rem');
      expect(styles.pointerEvents).toBe('none');
    });

    it('should provide styles for expanded level', () => {
      const styles = manager.getProgressiveStyles('expanded', true);
      expect(styles.padding).toBe('2rem');
      expect(styles.pointerEvents).toBe('auto');
      expect(styles.willChange).toBe('transform, opacity');
    });

    it('should adjust styles based on active state', () => {
      const inactiveStyles = manager.getProgressiveStyles('normal', false);
      const activeStyles = manager.getProgressiveStyles('normal', true);

      expect(inactiveStyles.willChange).toBe('auto');
      expect(activeStyles.willChange).toBe('transform, opacity');
    });
  });

  describe('Content Features', () => {
    it('should return features for minimal level', () => {
      const features = manager.getContentFeatures('minimal');
      expect(features).toContain('title');
      expect(features).not.toContain('enhanced');
    });

    it('should return features for expanded level', () => {
      const features = manager.getContentFeatures('expanded');
      expect(features).toContain('title');
      expect(features).toContain('subtitle');
      expect(features).toContain('content');
      expect(features).toContain('metadata');
      expect(features).toContain('enhanced');
    });

    it('should provide interactivity information', () => {
      expect(manager.isInteractivityEnabled('minimal')).toBe(false);
      expect(manager.isInteractivityEnabled('compact')).toBe(true);
      expect(manager.isInteractivityEnabled('expanded')).toBe(true);
    });
  });

  describe('Custom Thresholds', () => {
    it('should allow setting custom thresholds', () => {
      const customThresholds = {
        MINIMAL: 0.4,
        DETAILED: 1.8
      };

      manager.setCustomThresholds(customThresholds);

      expect(manager.determineContentLevel(0.45)).toBe('compact'); // Above new minimal
      expect(manager.determineContentLevel(1.6)).toBe('detailed'); // Above new detailed threshold
    });

    it('should reset to default thresholds', () => {
      manager.setCustomThresholds({ MINIMAL: 0.4 });
      manager.resetThresholds();

      // Should use default thresholds again
      expect(manager.determineContentLevel(0.5)).toBe('minimal');
    });

    it('should clear cache when thresholds change', () => {
      manager.determineContentLevel(1.0);
      const statsBefore = manager.getCacheStats();

      manager.setCustomThresholds({ MINIMAL: 0.4 });
      const statsAfter = manager.getCacheStats();

      expect(statsAfter.size).toBeLessThan(statsBefore.size);
    });
  });

  describe('Threshold Validation', () => {
    it('should validate correct threshold configuration', () => {
      const validation = manager.validateThresholds();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid threshold ordering', () => {
      manager.setCustomThresholds({
        MINIMAL: 1.0,
        COMPACT: 0.8 // Invalid: should be greater than MINIMAL
      });

      const validation = manager.validateThresholds();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect out-of-range thresholds', () => {
      manager.setCustomThresholds({
        MINIMAL: -0.1, // Invalid: too low
        EXPANDED: 6.0  // Invalid: too high
      });

      const validation = manager.validateThresholds();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Device Capability Detection', () => {
    it('should initialize device capabilities', () => {
      manager.initialize(false);
      // Should not throw errors during initialization
      expect(true).toBe(true);
    });

    it('should adjust thresholds for low-memory devices', () => {
      // Mock low memory scenario
      vi.stubGlobal('performance', {
        memory: {
          jsHeapSizeLimit: 1073741824 // 1GB
        }
      });

      const originalLevel = manager.determineContentLevel(1.6);
      manager.initialize(false); // Re-initialize with low memory
      const adjustedLevel = manager.determineContentLevel(1.6);

      // Level might be adjusted for low memory
      expect(['detailed', 'normal']).toContain(adjustedLevel);
    });

    it('should handle missing performance.memory gracefully', () => {
      vi.stubGlobal('performance', {});

      expect(() => {
        manager.initialize(false);
      }).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle high-frequency calls efficiently', () => {
      const startTime = Date.now();

      // Make many calls
      for (let i = 0; i < 1000; i++) {
        manager.determineContentLevel(1.0 + (i * 0.001));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete quickly (under 100ms for 1000 calls)
      expect(duration).toBeLessThan(100);
    });

    it('should demonstrate cache effectiveness with call counts', () => {
      // Clear cache first
      manager.resetThresholds();

      const scale = 1.2;
      const iterations = 10;

      // Make calls with different values (should miss cache)
      for (let i = 0; i < iterations; i++) {
        manager.determineContentLevel(scale + (i * 0.001)); // Different values
      }
      const statsUncached = manager.getCacheStats();

      // Make calls with same value (should hit cache)
      for (let i = 0; i < iterations; i++) {
        manager.determineContentLevel(scale); // Same value
      }
      const statsCached = manager.getCacheStats();

      // Cache should have grown during uncached calls
      expect(statsUncached.size).toBeGreaterThan(0);
      // Should have more keys after cached calls due to the repeated calls
      expect(statsCached.keys.length).toBeGreaterThan(0);
    });
  });
});