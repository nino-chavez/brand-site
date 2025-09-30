import { useState, useEffect } from 'react';

interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isSmallDesktop: boolean;
  hasLimitedHeight: boolean;
}

interface ResponsiveVisibilityState {
  profileVisible: boolean;
  profileMinimized: boolean;
  viewport: ViewportInfo;
}

interface ResponsiveVisibilityActions {
  setProfileVisible: (visible: boolean) => void;
  setProfileMinimized: (minimized: boolean) => void;
  toggleProfile: () => void;
  toggleMinimized: () => void;
}

interface UseResponsiveVisibilityProps {
  /** Initial visibility state */
  initialVisible?: boolean;
  /** Initial minimized state */
  initialMinimized?: boolean;
  /** Auto-show delay on first load (ms) */
  autoShowDelay?: number;
  /** Custom breakpoint for mobile (px) */
  mobileBreakpoint?: number;
  /** Custom breakpoint for small desktop (px) */
  smallDesktopBreakpoint?: number;
  /** Custom height threshold (px) */
  heightThreshold?: number;
}

/**
 * Custom hook for managing responsive visibility behavior
 * Handles complex viewport-based visibility rules extracted from HeroSection
 */
export const useResponsiveVisibility = ({
  initialVisible = true,
  initialMinimized = false,
  autoShowDelay = 1000,
  mobileBreakpoint = 768,
  smallDesktopBreakpoint = 1200,
  heightThreshold = 700
}: UseResponsiveVisibilityProps = {}): ResponsiveVisibilityState & ResponsiveVisibilityActions => {
  const [profileVisible, setProfileVisible] = useState(initialVisible);
  const [profileMinimized, setProfileMinimized] = useState(initialMinimized);
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    isMobile: false,
    isSmallDesktop: false,
    hasLimitedHeight: false
  });

  // Update viewport information
  const updateViewportInfo = (): ViewportInfo => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < mobileBreakpoint;
    const isSmallDesktop = width >= mobileBreakpoint && width < smallDesktopBreakpoint;
    const hasLimitedHeight = height < heightThreshold;

    return {
      width,
      height,
      isMobile,
      isSmallDesktop,
      hasLimitedHeight
    };
  };

  // Smart responsive behavior for profile visibility
  useEffect(() => {
    const checkViewportSize = () => {
      const newViewport = updateViewportInfo();
      setViewport(newViewport);

      const { width, isMobile, isSmallDesktop, hasLimitedHeight } = newViewport;

      // Hide on small desktop viewports where it would overlap with text
      if (isSmallDesktop && (width < 1000 || hasLimitedHeight)) {
        setProfileVisible(false);
        setProfileMinimized(false); // Reset minimized state
      }
      // Show and minimize on mobile (user wants it available on mobile)
      else if (isMobile) {
        setProfileVisible(true);
        setProfileMinimized(true); // Auto-minimize on mobile
      }
      // Show and allow full size on larger desktops
      else {
        setProfileVisible(true);
        setProfileMinimized(false);
      }
    };

    checkViewportSize();
    window.addEventListener('resize', checkViewportSize);
    return () => window.removeEventListener('resize', checkViewportSize);
  }, [mobileBreakpoint, smallDesktopBreakpoint, heightThreshold]);

  // Auto-show profile after a brief delay on first load
  useEffect(() => {
    if (autoShowDelay <= 0) return;

    const timer = setTimeout(() => {
      setProfileVisible(true);
    }, autoShowDelay);

    return () => clearTimeout(timer);
  }, [autoShowDelay]);

  // Actions
  const toggleProfile = () => setProfileVisible(prev => !prev);
  const toggleMinimized = () => setProfileMinimized(prev => !prev);

  return {
    // State
    profileVisible,
    profileMinimized,
    viewport,

    // Actions
    setProfileVisible,
    setProfileMinimized,
    toggleProfile,
    toggleMinimized
  };
};