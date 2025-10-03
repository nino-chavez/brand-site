/**
 * CanvasTimelineLayout - Main timeline container
 *
 * Film editor/Lightroom-inspired layout where sections exist as temporal layers.
 * Features top filmstrip navigation, keyboard shortcuts, and cinematic transitions.
 *
 * @fileoverview Timeline layout main container
 * @version 1.0.0
 */

import React, { useEffect, useRef } from 'react';
import { TimelineStateProvider, useTimelineState } from '../../contexts/timeline/TimelineStateContext';
import TimelineFilmstrip from './TimelineFilmstrip';
import TimelineLayer from './TimelineLayer';
import type { SectionId } from '../../types';

// Import section components
import CaptureSection from '../../../components/sections/CaptureSection';
import FocusSection from '../../../components/sections/FocusSection';
import FrameSection from '../../../components/sections/FrameSection';
import ExposureSection from '../../../components/sections/ExposureSection';
import DevelopSection from '../../../components/sections/DevelopSection';
import PortfolioSection from '../../../components/sections/PortfolioSection';

export interface TimelineSection {
  id: SectionId;
  name: string;
  component: React.ReactNode;
}

// Define sections in timeline order
const TIMELINE_SECTIONS: TimelineSection[] = [
  { id: 'capture', name: 'Capture', component: <CaptureSection /> },
  { id: 'focus', name: 'Focus', component: <FocusSection /> },
  { id: 'frame', name: 'Frame', component: <FrameSection /> },
  { id: 'exposure', name: 'Exposure', component: <ExposureSection /> },
  { id: 'develop', name: 'Develop', component: <DevelopSection /> },
  { id: 'portfolio', name: 'Portfolio', component: <PortfolioSection /> },
];

const TimelineLayoutContent: React.FC = () => {
  const { state, actions } = useTimelineState();
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [filmstripVisible, setFilmstripVisible] = React.useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filmstrip auto-hide on mobile
  useEffect(() => {
    if (!isMobile) {
      setFilmstripVisible(true);
      return;
    }

    const resetHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      setFilmstripVisible(true);
      hideTimerRef.current = setTimeout(() => {
        setFilmstripVisible(false);
      }, 3000);
    };

    resetHideTimer();

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [isMobile, state.activeLayerIndex]);

  // Show filmstrip on viewport tap (mobile)
  const handleViewportTap = () => {
    if (isMobile && !filmstripVisible) {
      setFilmstripVisible(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => {
        setFilmstripVisible(false);
      }, 3000);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          actions.navigatePrevious();
          announceLayerChange(state.activeLayerIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          actions.navigateNext();
          announceLayerChange(state.activeLayerIndex + 1);
          break;
        case 'Home':
          e.preventDefault();
          actions.navigateToLayer(0);
          announceLayerChange(0);
          break;
        case 'End':
          e.preventDefault();
          actions.navigateToLayer(TIMELINE_SECTIONS.length - 1);
          announceLayerChange(TIMELINE_SECTIONS.length - 1);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          e.preventDefault();
          const index = parseInt(e.key, 10) - 1;
          actions.navigateToLayer(index);
          announceLayerChange(index);
          break;
        case ' ':
          e.preventDefault();
          actions.toggleAutoAdvance();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, state.activeLayerIndex]);

  // Screen reader announcements
  const announceLayerChange = (index: number) => {
    const normalizedIndex = ((index % TIMELINE_SECTIONS.length) + TIMELINE_SECTIONS.length) % TIMELINE_SECTIONS.length;
    const section = TIMELINE_SECTIONS[normalizedIndex];
    if (section && ariaLiveRef.current) {
      ariaLiveRef.current.textContent = `Navigated to ${section.name}, frame ${normalizedIndex + 1} of ${TIMELINE_SECTIONS.length}`;
    }
  };

  // Auto-advance timer
  useEffect(() => {
    if (!state.autoAdvanceEnabled) return;

    const timer = setInterval(() => {
      actions.navigateNext();
    }, state.autoAdvanceInterval);

    return () => clearInterval(timer);
  }, [state.autoAdvanceEnabled, state.autoAdvanceInterval, actions]);

  // Focus management on layer change
  useEffect(() => {
    const activeSection = document.querySelector(`#layer-${TIMELINE_SECTIONS[state.activeLayerIndex]?.id}`);
    if (activeSection) {
      const heading = activeSection.querySelector('h1, h2');
      if (heading instanceof HTMLElement) {
        heading.focus();
      }
    }
  }, [state.activeLayerIndex]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        overflow: 'hidden',
      }}
    >
      {/* Skip link */}
      <a
        href="#timeline-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: '8px',
          background: 'white',
          color: 'black',
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = '0';
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = '-9999px';
        }}
      >
        Skip to timeline content
      </a>

      {/* Header with layout switcher (60px) */}
      <div
        style={{
          height: '60px',
          background: 'rgba(0, 0, 0, 0.9)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
          Nino Chavez
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Layout:
          </span>
          <select
            value="timeline"
            onChange={(e) => {
              const layout = e.target.value;
              window.location.href = layout === 'traditional' ? '/' : `/?layout=${layout}`;
            }}
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              borderRadius: '4px',
              color: 'white',
              padding: '6px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
            aria-label="Switch layout view"
          >
            <option value="traditional">📄 Traditional</option>
            <option value="canvas">🗺️ Canvas</option>
            <option value="timeline">🎞️ Timeline</option>
          </select>
        </div>
      </div>

      {/* Filmstrip (100px) - auto-hide on mobile */}
      <div
        style={{
          position: 'relative',
          transform: filmstripVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 300ms ease-in-out',
        }}
      >
        <TimelineFilmstrip sections={TIMELINE_SECTIONS} />
      </div>

      {/* Layer viewport - tap to show filmstrip on mobile */}
      <div
        id="timeline-content"
        onClick={handleViewportTap}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: isMobile && !filmstripVisible ? 'pointer' : 'default',
        }}
      >
        {TIMELINE_SECTIONS.map((section, index) => {
          // Lazy loading: only render active layer and adjacent layers
          const isAdjacent = Math.abs(state.activeLayerIndex - index) <= 1;
          const shouldRender = state.activeLayerIndex === index || isAdjacent || state.hoveredThumbnailIndex === index;

          return (
            <TimelineLayer
              key={section.id}
              isActive={state.activeLayerIndex === index}
              isHovered={state.hoveredThumbnailIndex === index}
              zIndex={state.activeLayerIndex === index ? 10 : 1}
              transitionStyle={isMobile ? 'crossfade' : state.transitionStyle}
              layerIndex={index}
            >
              {shouldRender && (
                <div
                  id={`layer-${section.id}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    overflowY: 'auto',
                    padding: '40px 20px',
                  }}
                >
                  {section.component}
                </div>
              )}
            </TimelineLayer>
          );
        })}
      </div>

      {/* Frame counter + Transition selector (40px) */}
      <div
        style={{
          height: '40px',
          background: 'rgba(0, 0, 0, 0.9)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          justifyContent: 'space-between',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.7)',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>
            Frame {state.activeLayerIndex + 1} of {TIMELINE_SECTIONS.length} · {TIMELINE_SECTIONS[state.activeLayerIndex]?.name}
          </span>
          <span style={{ opacity: 0.5 }}>|</span>
          <select
            value={state.transitionStyle}
            onChange={(e) => actions.setTransitionStyle(e.target.value as any)}
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              borderRadius: '4px',
              color: 'white',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
            aria-label="Select transition effect"
          >
            <option value="crossfade">Fade</option>
            <option value="zoomBlur">Zoom Blur</option>
            <option value="spin">Spin 360°</option>
            <option value="slide">Slide</option>
            <option value="glitch">Glitch</option>
            <option value="whipPan">Whip Pan</option>
            <option value="zoomPunch">Zoom Punch</option>
          </select>
        </div>
        <div>
          {`00:${String(state.activeLayerIndex * 15).padStart(2, '0')}`} / {`00:${String((TIMELINE_SECTIONS.length - 1) * 15).padStart(2, '0')}`}
        </div>
      </div>

      {/* Screen reader live region */}
      <div
        ref={ariaLiveRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      />
    </div>
  );
};

const CanvasTimelineLayout: React.FC = () => {
  return (
    <TimelineStateProvider>
      <TimelineLayoutContent />
    </TimelineStateProvider>
  );
};

export default CanvasTimelineLayout;
