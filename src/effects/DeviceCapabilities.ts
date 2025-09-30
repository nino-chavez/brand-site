/**
 * Device Capabilities Detection
 *
 * Detects device capabilities to determine appropriate effect levels.
 * Ensures effects work well across high-end and low-end devices.
 */

import type { DeviceCapabilities, DeviceCapabilityTier } from './types';

class DeviceCapabilitiesDetector {
  private capabilities: DeviceCapabilities | null = null;

  /**
   * Detect all device capabilities.
   */
  public detect(): DeviceCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    const isMobile = this.detectMobile();
    const deviceMemory = this.detectDeviceMemory();
    const hardwareConcurrency = this.detectHardwareConcurrency();
    const webglSupport = this.detectWebGLSupport();
    const backdropFilterSupport = this.detectBackdropFilterSupport();
    const filterSupport = this.detectFilterSupport();
    const prefersReducedMotion = this.detectPrefersReducedMotion();

    // Calculate tier based on capabilities
    const tier = this.calculateTier({
      isMobile,
      deviceMemory,
      hardwareConcurrency,
      webglSupport,
      backdropFilterSupport,
      filterSupport,
    });

    this.capabilities = {
      tier,
      isMobile,
      deviceMemory,
      hardwareConcurrency,
      webglSupport,
      backdropFilterSupport,
      filterSupport,
      prefersReducedMotion,
    };

    console.log('Device capabilities detected:', this.capabilities);
    return this.capabilities;
  }

  /**
   * Detect if device is mobile.
   */
  private detectMobile(): boolean {
    // Check user agent
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
    const isMobileUA = mobileKeywords.some((keyword) => userAgent.includes(keyword));

    // Check touch support
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Check screen width
    const isSmallScreen = window.innerWidth < 768;

    return isMobileUA || (hasTouchSupport && isSmallScreen);
  }

  /**
   * Detect device memory (if available).
   */
  private detectDeviceMemory(): number | undefined {
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory;
    }
    return undefined;
  }

  /**
   * Detect hardware concurrency (CPU cores).
   */
  private detectHardwareConcurrency(): number {
    return navigator.hardwareConcurrency || 2; // Default to 2 if not available
  }

  /**
   * Detect WebGL support.
   */
  private detectWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  /**
   * Detect CSS backdrop-filter support.
   */
  private detectBackdropFilterSupport(): boolean {
    const testElement = document.createElement('div');
    testElement.style.cssText = 'backdrop-filter: blur(1px);';
    return testElement.style.backdropFilter !== '';
  }

  /**
   * Detect CSS filter support.
   */
  private detectFilterSupport(): boolean {
    const testElement = document.createElement('div');
    testElement.style.cssText = 'filter: blur(1px);';
    return testElement.style.filter !== '';
  }

  /**
   * Detect prefers-reduced-motion preference.
   */
  private detectPrefersReducedMotion(): boolean {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }

  /**
   * Calculate device capability tier.
   */
  private calculateTier(capabilities: {
    isMobile: boolean;
    deviceMemory?: number;
    hardwareConcurrency: number;
    webglSupport: boolean;
    backdropFilterSupport: boolean;
    filterSupport: boolean;
  }): DeviceCapabilityTier {
    let score = 0;

    // Memory scoring (if available)
    if (capabilities.deviceMemory !== undefined) {
      if (capabilities.deviceMemory >= 8) {
        score += 3;
      } else if (capabilities.deviceMemory >= 4) {
        score += 2;
      } else {
        score += 1;
      }
    } else {
      // Default score if memory info not available
      score += 2;
    }

    // CPU cores scoring
    if (capabilities.hardwareConcurrency >= 8) {
      score += 3;
    } else if (capabilities.hardwareConcurrency >= 4) {
      score += 2;
    } else {
      score += 1;
    }

    // Feature support scoring
    if (capabilities.webglSupport) score += 1;
    if (capabilities.backdropFilterSupport) score += 1;
    if (capabilities.filterSupport) score += 1;

    // Mobile penalty (mobile devices typically have less power)
    if (capabilities.isMobile) {
      score -= 2;
    }

    // Determine tier
    if (score >= 8) {
      return 'high';
    } else if (score >= 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Get current capabilities (detects if not already done).
   */
  public getCapabilities(): DeviceCapabilities {
    if (!this.capabilities) {
      return this.detect();
    }
    return this.capabilities;
  }

  /**
   * Get device tier.
   */
  public getTier(): DeviceCapabilityTier {
    return this.getCapabilities().tier;
  }

  /**
   * Check if device is mobile.
   */
  public isMobile(): boolean {
    return this.getCapabilities().isMobile;
  }

  /**
   * Check if user prefers reduced motion.
   */
  public prefersReducedMotion(): boolean {
    return this.getCapabilities().prefersReducedMotion;
  }

  /**
   * Check if device supports WebGL.
   */
  public supportsWebGL(): boolean {
    return this.getCapabilities().webglSupport;
  }

  /**
   * Check if device supports backdrop-filter.
   */
  public supportsBackdropFilter(): boolean {
    return this.getCapabilities().backdropFilterSupport;
  }

  /**
   * Check if device supports CSS filters.
   */
  public supportsFilter(): boolean {
    return this.getCapabilities().filterSupport;
  }

  /**
   * Get recommended effect settings for this device.
   */
  public getRecommendedSettings(): {
    preset: 'minimal' | 'balanced' | 'full';
    maxSimultaneousEffects: number;
  } {
    const tier = this.getTier();
    const prefersReduced = this.prefersReducedMotion();

    if (prefersReduced) {
      return {
        preset: 'minimal',
        maxSimultaneousEffects: 1,
      };
    }

    switch (tier) {
      case 'high':
        return {
          preset: 'full',
          maxSimultaneousEffects: 5,
        };
      case 'medium':
        return {
          preset: 'balanced',
          maxSimultaneousEffects: 3,
        };
      case 'low':
        return {
          preset: 'minimal',
          maxSimultaneousEffects: 2,
        };
    }
  }

  /**
   * Reset detection (forces re-detection on next call).
   */
  public reset(): void {
    this.capabilities = null;
  }
}

// Singleton instance
export const deviceCapabilities = new DeviceCapabilitiesDetector();
