/**
 * DemoHarness - Comprehensive UI/UX Testing Interface
 *
 * Professional demo showcase and testing infrastructure for all
 * animations, effects, and interactive components.
 *
 * Access: http://localhost:3000/demo (development only)
 *
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { DemoHeader } from '../components/demo/DemoHeader';
import { DemoSidebar } from '../components/demo/DemoSidebar';
import { ComponentCategory } from '../components/demo/ComponentCategory';
import { DemoCard } from '../components/demo/DemoCard';
import { DemoControls } from '../components/demo/DemoControls';
import { StateIndicator } from '../components/demo/StateIndicator';
import type { ControlConfig } from '../components/demo/DemoControls';

// Demo implementations
import {
  FadeUpDemo,
  SlideDemo,
  ScaleDemo,
  BlurMorphDemo,
} from '../components/demo/demos/AnimationDemos';
import {
  ParallaxDemo,
  SpotlightDemo,
  GlowDemo,
} from '../components/demo/demos/EffectDemos';
import {
  MagneticButtonDemo,
  EffectsPanelDemo,
  KeyboardNavDemo,
} from '../components/demo/demos/InteractiveDemos';
import {
  SectionFadeSlideDemo,
  SectionBorderDemo,
  StaggeredContentDemo,
} from '../components/demo/demos/SectionDemos';

// Hover state demos
import {
  ButtonHoverDemo,
  CardHoverDemo,
  ImageZoomDemo,
  IconHoverDemo,
  LinkHoverDemo,
  GroupHoverDemo,
} from '../components/demo/demos/HoverStateDemos';

// Click state demos
import {
  ButtonPressDemo,
  FormFocusDemo,
  ToggleSwitchDemo,
  AccordionDemo,
  ModalDemo,
} from '../components/demo/demos/ClickStateDemos';

// Mobile touch demos
import {
  TapFeedbackDemo,
  SwipeGestureDemo,
  LongPressDemo,
  TouchButtonDemo,
} from '../components/demo/demos/MobileTouchDemos';

// Passive state demos
import {
  LoadingSpinnerDemo,
  SkeletonScreenDemo,
  PulseAnimationDemo,
  StatusIndicatorDemo,
} from '../components/demo/demos/PassiveStateDemos';

import { DEMO_CATEGORIES, demoComponents, getDemosByCategory } from '../config/demoComponents';
import { useDemoState } from '../hooks/useDemoState';

export const DemoHarness: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Demo-specific states
  const fadeUp8 = useDemoState('fade-up-8px', { speed: 'normal' });
  const fadeUp24 = useDemoState('fade-up-24px', { speed: 'normal' });
  const slide = useDemoState('slide', { direction: 'left', distance: 16 });
  const scale = useDemoState('scale', { startScale: 0.95 });
  const blurMorph = useDemoState('blur-morph', { blurAmount: 'blur-sm' });

  const parallax = useDemoState('parallax', { intensity: 0.2, enabled: true });
  const spotlight = useDemoState('spotlight', { radius: 200, opacity: 0.3, enabled: true });
  const glow = useDemoState('glow', { intensity: 'medium', enabled: true });

  const magnetic = useDemoState('magnetic', { strength: 0.2, radius: 100, enabled: true });
  const effectsPanel = useDemoState('effects-panel', { position: 'bottom-right' });
  const keyboard = useDemoState('keyboard', { showFocusIndicators: true });

  const sectionFade = useDemoState('section-fade', { distance: 24, duration: 700 });
  const sectionBorder = useDemoState('section-border', { color: 'violet', style: 'gradient' });
  const staggered = useDemoState('staggered', { baseDelay: 150, elementCount: 4 });

  // Hover states
  const buttonHover = useDemoState('button-hover', { variant: 'primary', glowIntensity: 0.5 });
  const cardHover = useDemoState('card-hover', { liftHeight: 8, shadowIntensity: 'lg' });
  const imageZoom = useDemoState('image-zoom', { zoomScale: 1.1, overlayOpacity: 0.3 });
  const iconHover = useDemoState('icon-hover', { animation: 'rotate', speed: 'normal' });
  const linkHover = useDemoState('link-hover', { style: 'slide', thickness: 2 });
  const groupHover = useDemoState('group-hover', { staggerDelay: 100, itemCount: 5 });

  // Click states
  const buttonPress = useDemoState('button-press', { rippleEnabled: true, feedbackStrength: 'normal' });
  const formFocus = useDemoState('form-focus', { borderColor: 'violet', glowEnabled: true });
  const toggleSwitch = useDemoState('toggle-switch', { size: 'md', color: 'violet' });
  const accordion = useDemoState('accordion', { itemCount: 3, expandSpeed: 'normal' });
  const modal = useDemoState('modal', { animation: 'scale', backdropBlur: true });

  // Mobile touch
  const tapFeedback = useDemoState('tap-feedback', { rippleColor: 'primary', duration: 600 });
  const swipeGesture = useDemoState('swipe-gesture', { threshold: 50, enabledDirections: 'all' });
  const longPress = useDemoState('long-press', { duration: 800, showProgress: true });
  const touchButton = useDemoState('touch-button', { size: 'comfortable', spacing: 16 });

  // Passive states
  const loadingSpinner = useDemoState('loading-spinner', { variant: 'spin', size: 'md', color: 'primary' });
  const skeletonScreen = useDemoState('skeleton-screen', { layout: 'card', animationSpeed: 'normal' });
  const pulseAnimation = useDemoState('pulse-animation', { speed: 'normal', intensity: 'medium' });
  const statusIndicator = useDemoState('status-indicator', { type: 'badge', status: 'success' });

  // Total component count for stats
  const totalComponents = demoComponents.length;

  // Category statistics
  const categories = Object.values(DEMO_CATEGORIES).map((cat) => ({
    ...cat,
    count: getDemosByCategory(cat.id).length,
  }));

  // Scroll to category
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reset all demos
  const handleResetAll = () => {
    fadeUp8.resetState();
    fadeUp24.resetState();
    slide.resetState();
    scale.resetState();
    blurMorph.resetState();
    parallax.resetState();
    spotlight.resetState();
    glow.resetState();
    magnetic.resetState();
    effectsPanel.resetState();
    keyboard.resetState();
    sectionFade.resetState();
    sectionBorder.resetState();
    staggered.resetState();
    buttonHover.resetState();
    cardHover.resetState();
    imageZoom.resetState();
    iconHover.resetState();
    linkHover.resetState();
    groupHover.resetState();
    buttonPress.resetState();
    formFocus.resetState();
    toggleSwitch.resetState();
    accordion.resetState();
    modal.resetState();
    tapFeedback.resetState();
    swipeGesture.resetState();
    longPress.resetState();
    touchButton.resetState();
    loadingSpinner.resetState();
    skeletonScreen.resetState();
    pulseAnimation.resetState();
    statusIndicator.resetState();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      {/* Header */}
      <DemoHeader onReset={handleResetAll} />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <DemoSidebar
          categories={categories}
          activeCategory={activeCategory || undefined}
          onCategoryClick={handleCategoryClick}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-8 space-y-8">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2">Production UI Pattern Library</h2>
              <p className="text-white/60 mb-4">
                Explore battle-tested interface components from enterprise applications.
                Each pattern is optimized for performance, accessibility, and developer experience.
                Customize parameters in real-time to match your design system.
              </p>

              {/* Technical Context Badges */}
              <div className="flex gap-3 mb-4 flex-wrap">
                <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white/70">
                  React 19.1 + TypeScript
                </div>
                <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white/70">
                  WCAG 2.2 AA Compliant
                </div>
                <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white/70">
                  60 FPS Optimized
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-white/60">{totalComponents} Components</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-white/60">8 Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  <span className="text-white/60">Full Keyboard Support</span>
                </div>
              </div>
            </div>

            {/* ANIMATIONS CATEGORY */}
            <div id="category-animations">
              <ComponentCategory
                title={DEMO_CATEGORIES.animations.title}
                description={DEMO_CATEGORIES.animations.description}
                icon={DEMO_CATEGORIES.animations.icon}
                defaultExpanded={!activeCategory || activeCategory === 'animations'}
              >
                {/* Fade Up 8px */}
                <DemoCard
                  title="Fade Up"
                  description="Element fades in while translating up 8 pixels"
                  category="animations"
                  testId="demo-fade-up-8px"
                  codeSnippet={`className="opacity-0 translate-y-8 transition-all duration-500"
// Becomes: opacity-100 translate-y-0`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Speed',
                          value: fadeUp8.state.speed,
                          options: ['fast', 'normal', 'slow', 'off'],
                          onChange: (value) => fadeUp8.updateState('speed', value),
                        },
                      ]}
                      onReset={fadeUp8.resetState}
                    />
                  }
                >
                  <FadeUpDemo distance={8} speed={fadeUp8.state.speed} />
                </DemoCard>

                {/* Fade Up 24px */}
                <DemoCard
                  title="Fade Up (Dramatic)"
                  description="Element fades in while translating up 24 pixels (more dramatic)"
                  category="animations"
                  testId="demo-fade-up-24px"
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Speed',
                          value: fadeUp24.state.speed,
                          options: ['fast', 'normal', 'slow'],
                          onChange: (value) => fadeUp24.updateState('speed', value),
                        },
                      ]}
                      onReset={fadeUp24.resetState}
                    />
                  }
                >
                  <FadeUpDemo distance={24} speed={fadeUp24.state.speed} />
                </DemoCard>

                {/* Slide Animation */}
                <DemoCard
                  title="Slide"
                  description="Element slides in from the side"
                  category="animations"
                  testId="demo-slide"
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Direction',
                          value: slide.state.direction,
                          options: ['left', 'right', 'up', 'down'],
                          onChange: (value) => slide.updateState('direction', value),
                        },
                        {
                          type: 'slider',
                          label: 'Distance',
                          value: slide.state.distance,
                          min: 8,
                          max: 48,
                          step: 8,
                          onChange: (value) => slide.updateState('distance', value),
                        },
                      ]}
                      onReset={slide.resetState}
                    />
                  }
                >
                  <SlideDemo direction={slide.state.direction} distance={slide.state.distance} />
                </DemoCard>

                {/* Scale Animation */}
                <DemoCard
                  title="Scale"
                  description="Element scales up from smaller size"
                  category="animations"
                  testId="demo-scale"
                  codeSnippet={`className="opacity-0 scale-95 transition-all duration-500"`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Start Scale',
                          value: scale.state.startScale,
                          options: [0.95, 0.9, 0.85],
                          onChange: (value) => scale.updateState('startScale', Number(value)),
                        },
                      ]}
                      onReset={scale.resetState}
                    />
                  }
                >
                  <ScaleDemo startScale={scale.state.startScale} />
                </DemoCard>

                {/* Blur Morph */}
                <DemoCard
                  title="Blur Morph"
                  description="Element fades in from blurred state"
                  category="animations"
                  testId="demo-blur-morph"
                  codeSnippet={`className="opacity-0 blur-sm scale-95 transition-all duration-500"`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Blur Amount',
                          value: blurMorph.state.blurAmount,
                          options: ['blur-sm', 'blur-md', 'blur-lg'],
                          onChange: (value) => blurMorph.updateState('blurAmount', value),
                        },
                      ]}
                      onReset={blurMorph.resetState}
                    />
                  }
                >
                  <BlurMorphDemo blurAmount={blurMorph.state.blurAmount} />
                </DemoCard>
              </ComponentCategory>
            </div>

            {/* EFFECTS CATEGORY */}
            <div id="category-effects">
              <ComponentCategory
                title={DEMO_CATEGORIES.effects.title}
                description={DEMO_CATEGORIES.effects.description}
                icon={DEMO_CATEGORIES.effects.icon}
                defaultExpanded={!activeCategory || activeCategory === 'effects'}
              >
                {/* Parallax */}
                <DemoCard
                  title="Parallax"
                  description="Background moves at different speed during scroll"
                  category="effects"
                  testId="demo-parallax"
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Intensity',
                          value: parallax.state.intensity,
                          min: 0.1,
                          max: 0.5,
                          step: 0.1,
                          onChange: (value) => parallax.updateState('intensity', value),
                        },
                        {
                          type: 'toggle',
                          label: 'Enabled',
                          value: parallax.state.enabled,
                          onChange: (value) => parallax.updateState('enabled', value),
                        },
                      ]}
                      onReset={parallax.resetState}
                    />
                  }
                >
                  <ParallaxDemo
                    intensity={parallax.state.intensity}
                    enabled={parallax.state.enabled}
                  />
                </DemoCard>

                {/* Spotlight Cursor */}
                <DemoCard
                  title="Spotlight"
                  description="Custom cursor with spotlight effect"
                  category="effects"
                  testId="demo-spotlight"
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Radius',
                          value: spotlight.state.radius,
                          min: 100,
                          max: 400,
                          step: 50,
                          onChange: (value) => spotlight.updateState('radius', value),
                        },
                        {
                          type: 'slider',
                          label: 'Opacity',
                          value: spotlight.state.opacity,
                          min: 0.1,
                          max: 1.0,
                          step: 0.1,
                          onChange: (value) => spotlight.updateState('opacity', value),
                        },
                        {
                          type: 'toggle',
                          label: 'Enabled',
                          value: spotlight.state.enabled,
                          onChange: (value) => spotlight.updateState('enabled', value),
                        },
                      ]}
                      onReset={spotlight.resetState}
                    />
                  }
                >
                  <SpotlightDemo
                    radius={spotlight.state.radius}
                    opacity={spotlight.state.opacity}
                    enabled={spotlight.state.enabled}
                  />
                </DemoCard>

                {/* Glow Effects */}
                <DemoCard
                  title="Glow"
                  description="Progressive glow on interactive elements"
                  category="effects"
                  testId="demo-glow"
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Intensity',
                          value: glow.state.intensity,
                          options: ['low', 'medium', 'high'],
                          onChange: (value) => glow.updateState('intensity', value),
                        },
                        {
                          type: 'toggle',
                          label: 'Enabled',
                          value: glow.state.enabled,
                          onChange: (value) => glow.updateState('enabled', value),
                        },
                      ]}
                      onReset={glow.resetState}
                    />
                  }
                >
                  <GlowDemo intensity={glow.state.intensity} enabled={glow.state.enabled} />
                </DemoCard>
              </ComponentCategory>
            </div>

            {/* INTERACTIVE CATEGORY */}
            <div id="category-interactive">
              <ComponentCategory
                title={DEMO_CATEGORIES.interactive.title}
                description={DEMO_CATEGORIES.interactive.description}
                icon={DEMO_CATEGORIES.interactive.icon}
                defaultExpanded={!activeCategory || activeCategory === 'interactive'}
              >
                {/* Magnetic Button */}
                <DemoCard
                  title="Magnetic"
                  description="Button responds to cursor proximity with transform and glow"
                  category="interactive"
                  testId="demo-magnetic-button"
                  codeSnippet={`const { ref, transform } = useMagneticEffect({
  strength: 0.2,
  radius: 100
});`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Strength',
                          value: magnetic.state.strength,
                          min: 0.1,
                          max: 0.5,
                          step: 0.1,
                          onChange: (value) => magnetic.updateState('strength', value),
                        },
                        {
                          type: 'slider',
                          label: 'Radius',
                          value: magnetic.state.radius,
                          min: 50,
                          max: 200,
                          step: 25,
                          onChange: (value) => magnetic.updateState('radius', value),
                        },
                        {
                          type: 'toggle',
                          label: 'Enabled',
                          value: magnetic.state.enabled,
                          onChange: (value) => magnetic.updateState('enabled', value),
                        },
                      ]}
                      onReset={magnetic.resetState}
                    />
                  }
                >
                  <MagneticButtonDemo
                    strength={magnetic.state.strength}
                    radius={magnetic.state.radius}
                    enabled={magnetic.state.enabled}
                  />
                </DemoCard>

                {/* Effects Panel */}
                <DemoCard
                  title="Effects Panel"
                  description="Camera-themed settings panel for customizing animations"
                  category="interactive"
                  testId="demo-effects-panel"
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Position',
                          value: effectsPanel.state.position,
                          options: ['bottom-right', 'bottom-left', 'top-right'],
                          onChange: (value) => effectsPanel.updateState('position', value),
                        },
                      ]}
                      onReset={effectsPanel.resetState}
                    />
                  }
                >
                  <EffectsPanelDemo position={effectsPanel.state.position} />
                </DemoCard>

                {/* Keyboard Navigation */}
                <DemoCard
                  title="Keyboard Nav"
                  description="Full keyboard support with Tab, Enter, Space, Escape"
                  category="interactive"
                  testId="demo-keyboard-nav"
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'toggle',
                          label: 'Show Focus',
                          value: keyboard.state.showFocusIndicators,
                          onChange: (value) =>
                            keyboard.updateState('showFocusIndicators', value),
                        },
                      ]}
                      onReset={keyboard.resetState}
                    />
                  }
                >
                  <KeyboardNavDemo showFocusIndicators={keyboard.state.showFocusIndicators} />
                </DemoCard>
              </ComponentCategory>
            </div>

            {/* SECTION TRANSITIONS CATEGORY */}
            <div id="category-sections">
              <ComponentCategory
                title={DEMO_CATEGORIES.sections.title}
                description={DEMO_CATEGORIES.sections.description}
                icon={DEMO_CATEGORIES.sections.icon}
                defaultExpanded={!activeCategory || activeCategory === 'sections'}
              >
                {/* Section Fade + Slide */}
                <DemoCard
                  title="Fade + Slide"
                  description="Entire section fades and slides into view"
                  category="sections"
                  testId="demo-section-fade-slide"
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Distance',
                          value: sectionFade.state.distance,
                          min: 8,
                          max: 48,
                          step: 8,
                          onChange: (value) => sectionFade.updateState('distance', value),
                        },
                        {
                          type: 'slider',
                          label: 'Duration (ms)',
                          value: sectionFade.state.duration,
                          min: 300,
                          max: 1000,
                          step: 100,
                          onChange: (value) => sectionFade.updateState('duration', value),
                        },
                      ]}
                      onReset={sectionFade.resetState}
                    />
                  }
                >
                  <SectionFadeSlideDemo
                    distance={sectionFade.state.distance}
                    duration={sectionFade.state.duration}
                  />
                </DemoCard>

                {/* Section Border */}
                <DemoCard
                  title="Border"
                  description="Animated border appears at section boundary"
                  category="sections"
                  testId="demo-section-border"
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Color',
                          value: sectionBorder.state.color,
                          options: ['violet', 'blue', 'green'],
                          onChange: (value) => sectionBorder.updateState('color', value),
                        },
                        {
                          type: 'select',
                          label: 'Style',
                          value: sectionBorder.state.style,
                          options: ['solid', 'gradient', 'animated'],
                          onChange: (value) => sectionBorder.updateState('style', value),
                        },
                      ]}
                      onReset={sectionBorder.resetState}
                    />
                  }
                >
                  <SectionBorderDemo
                    color={sectionBorder.state.color}
                    style={sectionBorder.state.style}
                  />
                </DemoCard>

                {/* Staggered Content */}
                <DemoCard
                  title="Staggered Content"
                  description="Content elements animate in sequence with delays"
                  category="sections"
                  testId="demo-staggered-content"
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Base Delay (ms)',
                          value: staggered.state.baseDelay,
                          min: 50,
                          max: 300,
                          step: 50,
                          onChange: (value) => staggered.updateState('baseDelay', value),
                        },
                        {
                          type: 'slider',
                          label: 'Elements',
                          value: staggered.state.elementCount,
                          min: 2,
                          max: 6,
                          step: 1,
                          onChange: (value) => staggered.updateState('elementCount', value),
                        },
                      ]}
                      onReset={staggered.resetState}
                    />
                  }
                >
                  <StaggeredContentDemo
                    baseDelay={staggered.state.baseDelay}
                    elementCount={staggered.state.elementCount}
                  />
                </DemoCard>
              </ComponentCategory>
            </div>

            {/* HOVER STATES CATEGORY */}
            <div id="category-hoverStates">
              <ComponentCategory
                title={DEMO_CATEGORIES.hoverStates.title}
                description={DEMO_CATEGORIES.hoverStates.description}
                icon={DEMO_CATEGORIES.hoverStates.icon}
                defaultExpanded={!activeCategory || activeCategory === 'hoverStates'}
              >
                {/* Button Hover */}
                <DemoCard
                  title="Button"
                  description="Button hover with scale and glow"
                  category="hoverStates"
                  testId="demo-button-hover"
                  codeSnippet={`className="transition-all hover:scale-105 hover:shadow-lg"`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Variant',
                          value: buttonHover.state.variant,
                          options: ['primary', 'secondary', 'ghost'],
                          onChange: (value) => buttonHover.updateState('variant', value),
                        },
                        {
                          type: 'slider',
                          label: 'Glow Intensity',
                          value: buttonHover.state.glowIntensity,
                          min: 0,
                          max: 1,
                          step: 0.1,
                          onChange: (value) => buttonHover.updateState('glowIntensity', value),
                        },
                      ]}
                      onReset={buttonHover.resetState}
                    />
                  }
                >
                  <ButtonHoverDemo variant={buttonHover.state.variant} showGlow={buttonHover.state.glowIntensity > 0} />
                </DemoCard>

                {/* Card Hover */}
                <DemoCard
                  title="Card"
                  description="Card lift with shadow enhancement"
                  category="hoverStates"
                  testId="demo-card-hover"
                  codeSnippet={`className="transition-all hover:-translate-y-2 hover:shadow-xl"`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Lift Height (px)',
                          value: cardHover.state.liftHeight,
                          min: 2,
                          max: 16,
                          step: 2,
                          onChange: (value) => cardHover.updateState('liftHeight', value),
                        },
                        {
                          type: 'select',
                          label: 'Shadow Intensity',
                          value: cardHover.state.shadowIntensity,
                          options: ['sm', 'md', 'lg', 'xl'],
                          onChange: (value) => cardHover.updateState('shadowIntensity', value),
                        },
                      ]}
                      onReset={cardHover.resetState}
                    />
                  }
                >
                  <CardHoverDemo liftHeight={cardHover.state.liftHeight} shadowIntensity={cardHover.state.shadowIntensity} />
                </DemoCard>

                {/* Image Zoom */}
                <DemoCard
                  title="Image"
                  description="Image zoom on hover with overlay"
                  category="hoverStates"
                  testId="demo-image-zoom"
                  codeSnippet={`className="overflow-hidden">
  <img className="transition-transform duration-500 hover:scale-110"`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Zoom Scale',
                          value: imageZoom.state.zoomScale,
                          min: 1.05,
                          max: 1.3,
                          step: 0.05,
                          onChange: (value) => imageZoom.updateState('zoomScale', value),
                        },
                        {
                          type: 'slider',
                          label: 'Overlay Opacity',
                          value: imageZoom.state.overlayOpacity,
                          min: 0,
                          max: 0.8,
                          step: 0.1,
                          onChange: (value) => imageZoom.updateState('overlayOpacity', value),
                        },
                      ]}
                      onReset={imageZoom.resetState}
                    />
                  }
                >
                  <ImageZoomDemo zoomScale={imageZoom.state.zoomScale} overlayOpacity={imageZoom.state.overlayOpacity} />
                </DemoCard>

                {/* Icon Hover */}
                <DemoCard
                  title="Icon"
                  description="Icon animations (rotate/scale/bounce/spin)"
                  category="hoverStates"
                  testId="demo-icon-hover"
                  codeSnippet={`className="transition-transform hover:rotate-12"`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Animation',
                          value: iconHover.state.animation,
                          options: ['rotate', 'scale', 'bounce', 'spin'],
                          onChange: (value) => iconHover.updateState('animation', value),
                        },
                        {
                          type: 'select',
                          label: 'Speed',
                          value: iconHover.state.speed,
                          options: ['fast', 'normal', 'slow'],
                          onChange: (value) => iconHover.updateState('speed', value),
                        },
                      ]}
                      onReset={iconHover.resetState}
                    />
                  }
                >
                  <IconHoverDemo animation={iconHover.state.animation} speed={iconHover.state.speed} />
                </DemoCard>

                {/* Link Hover */}
                <DemoCard
                  title="Link"
                  description="Link underline animations (fade/slide/grow)"
                  category="hoverStates"
                  testId="demo-link-hover"
                  codeSnippet={`className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-current after:transition-all hover:after:w-full"`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Style',
                          value: linkHover.state.style,
                          options: ['fade', 'slide', 'grow'],
                          onChange: (value) => linkHover.updateState('style', value),
                        },
                        {
                          type: 'slider',
                          label: 'Thickness (px)',
                          value: linkHover.state.thickness,
                          min: 1,
                          max: 4,
                          step: 1,
                          onChange: (value) => linkHover.updateState('thickness', value),
                        },
                      ]}
                      onReset={linkHover.resetState}
                    />
                  }
                >
                  <LinkHoverDemo style={linkHover.state.style} thickness={linkHover.state.thickness} />
                </DemoCard>

                {/* Group Hover */}
                <DemoCard
                  title="Group"
                  description="Group hover cascade with stagger"
                  category="hoverStates"
                  testId="demo-group-hover"
                  codeSnippet={`className="group">
  <div className="transition-all group-hover:translate-x-2 delay-[0ms]">
  <div className="transition-all group-hover:translate-x-2 delay-[100ms]">`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Stagger Delay (ms)',
                          value: groupHover.state.staggerDelay,
                          min: 50,
                          max: 300,
                          step: 50,
                          onChange: (value) => groupHover.updateState('staggerDelay', value),
                        },
                        {
                          type: 'slider',
                          label: 'Items',
                          value: groupHover.state.itemCount,
                          min: 3,
                          max: 8,
                          step: 1,
                          onChange: (value) => groupHover.updateState('itemCount', value),
                        },
                      ]}
                      onReset={groupHover.resetState}
                    />
                  }
                >
                  <GroupHoverDemo staggerDelay={groupHover.state.staggerDelay} itemCount={groupHover.state.itemCount} />
                </DemoCard>
              </ComponentCategory>
            </div>

            {/* CLICK STATES CATEGORY */}
            <div id="category-clickStates">
              <ComponentCategory
                title={DEMO_CATEGORIES.clickStates.title}
                description={DEMO_CATEGORIES.clickStates.description}
                icon={DEMO_CATEGORIES.clickStates.icon}
                defaultExpanded={!activeCategory || activeCategory === 'clickStates'}
              >
                {/* Button Press */}
                <DemoCard
                  title="Button"
                  description="Button press with scale-98 and ripple"
                  category="clickStates"
                  testId="demo-button-press"
                  codeSnippet={`className="active:scale-98 transition-transform"
onMouseDown={() => setPressed(true)}`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'toggle',
                          label: 'Ripple Effect',
                          value: buttonPress.state.rippleEnabled,
                          onChange: (value) => buttonPress.updateState('rippleEnabled', value),
                        },
                        {
                          type: 'select',
                          label: 'Feedback',
                          value: buttonPress.state.feedbackStrength,
                          options: ['subtle', 'normal', 'strong'],
                          onChange: (value) => buttonPress.updateState('feedbackStrength', value),
                        },
                      ]}
                      onReset={buttonPress.resetState}
                    />
                  }
                >
                  <ButtonPressDemo rippleEnabled={buttonPress.state.rippleEnabled} feedbackStrength={buttonPress.state.feedbackStrength} />
                </DemoCard>

                {/* Form Focus */}
                <DemoCard
                  title="Form"
                  description="Input focus with border and shadow"
                  category="clickStates"
                  testId="demo-form-focus"
                  codeSnippet={`className="border-2 border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Border Color',
                          value: formFocus.state.borderColor,
                          options: ['blue', 'violet', 'green'],
                          onChange: (value) => formFocus.updateState('borderColor', value),
                        },
                        {
                          type: 'toggle',
                          label: 'Glow Effect',
                          value: formFocus.state.glowEnabled,
                          onChange: (value) => formFocus.updateState('glowEnabled', value),
                        },
                      ]}
                      onReset={formFocus.resetState}
                    />
                  }
                >
                  <FormFocusDemo borderColor={formFocus.state.borderColor} glowEnabled={formFocus.state.glowEnabled} />
                </DemoCard>

                {/* Toggle Switch */}
                <DemoCard
                  title="Toggle"
                  description="Animated toggle on/off"
                  category="clickStates"
                  testId="demo-toggle-switch"
                  codeSnippet={`const [enabled, setEnabled] = useState(false);
className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${enabled ? 'bg-violet-500' : 'bg-gray-300'}\`}`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Size',
                          value: toggleSwitch.state.size,
                          options: ['sm', 'md', 'lg'],
                          onChange: (value) => toggleSwitch.updateState('size', value),
                        },
                        {
                          type: 'select',
                          label: 'Color',
                          value: toggleSwitch.state.color,
                          options: ['blue', 'violet', 'green'],
                          onChange: (value) => toggleSwitch.updateState('color', value),
                        },
                      ]}
                      onReset={toggleSwitch.resetState}
                    />
                  }
                >
                  <ToggleSwitchDemo size={toggleSwitch.state.size} color={toggleSwitch.state.color} />
                </DemoCard>

                {/* Accordion */}
                <DemoCard
                  title="Accordion"
                  description="Expandable accordion items"
                  category="clickStates"
                  testId="demo-accordion"
                  codeSnippet={`<div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? '500px' : '0' }}>`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Items',
                          value: accordion.state.itemCount,
                          min: 2,
                          max: 5,
                          step: 1,
                          onChange: (value) => accordion.updateState('itemCount', value),
                        },
                        {
                          type: 'select',
                          label: 'Speed',
                          value: accordion.state.expandSpeed,
                          options: ['fast', 'normal', 'slow'],
                          onChange: (value) => accordion.updateState('expandSpeed', value),
                        },
                      ]}
                      onReset={accordion.resetState}
                    />
                  }
                >
                  <AccordionDemo itemCount={accordion.state.itemCount} expandSpeed={accordion.state.expandSpeed} />
                </DemoCard>

                {/* Modal */}
                <DemoCard
                  title="Modal"
                  description="Modal open/close with backdrop"
                  category="clickStates"
                  testId="demo-modal"
                  codeSnippet={`{isOpen && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
    <div className="scale-95 opacity-0 animate-modal-enter">`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Animation',
                          value: modal.state.animation,
                          options: ['fade', 'slide', 'scale'],
                          onChange: (value) => modal.updateState('animation', value),
                        },
                        {
                          type: 'toggle',
                          label: 'Backdrop Blur',
                          value: modal.state.backdropBlur,
                          onChange: (value) => modal.updateState('backdropBlur', value),
                        },
                      ]}
                      onReset={modal.resetState}
                    />
                  }
                >
                  <ModalDemo animation={modal.state.animation} backdropBlur={modal.state.backdropBlur} />
                </DemoCard>
              </ComponentCategory>
            </div>

            {/* MOBILE TOUCH CATEGORY */}
            <div id="category-mobileTouch">
              <ComponentCategory
                title={DEMO_CATEGORIES.mobileTouch.title}
                description={DEMO_CATEGORIES.mobileTouch.description}
                icon={DEMO_CATEGORIES.mobileTouch.icon}
                defaultExpanded={!activeCategory || activeCategory === 'mobileTouch'}
              >
                {/* Tap Feedback */}
                <DemoCard
                  title="Tap"
                  description="Tap ripple feedback"
                  category="mobileTouch"
                  testId="demo-tap-feedback"
                  codeSnippet={`onTouchStart={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const y = e.touches[0].clientY - rect.top;
  showRipple(x, y);
}}`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Ripple Color',
                          value: tapFeedback.state.rippleColor,
                          options: ['light', 'dark', 'primary'],
                          onChange: (value) => tapFeedback.updateState('rippleColor', value),
                        },
                        {
                          type: 'slider',
                          label: 'Duration (ms)',
                          value: tapFeedback.state.duration,
                          min: 300,
                          max: 1000,
                          step: 100,
                          onChange: (value) => tapFeedback.updateState('duration', value),
                        },
                      ]}
                      onReset={tapFeedback.resetState}
                    />
                  }
                >
                  <TapFeedbackDemo rippleColor={tapFeedback.state.rippleColor} duration={tapFeedback.state.duration} />
                </DemoCard>

                {/* Swipe Gesture */}
                <DemoCard
                  title="Swipe"
                  description="Swipe detection (left/right/up/down)"
                  category="mobileTouch"
                  testId="demo-swipe-gesture"
                  codeSnippet={`const handleTouchMove = (e: TouchEvent) => {
  const deltaX = e.touches[0].clientX - startX;
  const deltaY = e.touches[0].clientY - startY;
  if (Math.abs(deltaX) > threshold) {
    onSwipe(deltaX > 0 ? 'right' : 'left');
  }
}`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Threshold (px)',
                          value: swipeGesture.state.threshold,
                          min: 30,
                          max: 150,
                          step: 10,
                          onChange: (value) => swipeGesture.updateState('threshold', value),
                        },
                        {
                          type: 'select',
                          label: 'Directions',
                          value: swipeGesture.state.enabledDirections,
                          options: ['all', 'horizontal', 'vertical'],
                          onChange: (value) => swipeGesture.updateState('enabledDirections', value),
                        },
                      ]}
                      onReset={swipeGesture.resetState}
                    />
                  }
                >
                  <SwipeGestureDemo threshold={swipeGesture.state.threshold} enabledDirections={swipeGesture.state.enabledDirections} />
                </DemoCard>

                {/* Long Press */}
                <DemoCard
                  title="Long Press"
                  description="Long press activation with progress indicator"
                  category="mobileTouch"
                  testId="demo-long-press"
                  codeSnippet={`const timer = setTimeout(() => {
  onLongPress();
}, 800);

onTouchEnd={() => clearTimeout(timer)}`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'slider',
                          label: 'Duration (ms)',
                          value: longPress.state.duration,
                          min: 500,
                          max: 2000,
                          step: 100,
                          onChange: (value) => longPress.updateState('duration', value),
                        },
                        {
                          type: 'toggle',
                          label: 'Show Progress',
                          value: longPress.state.showProgress,
                          onChange: (value) => longPress.updateState('showProgress', value),
                        },
                      ]}
                      onReset={longPress.resetState}
                    />
                  }
                >
                  <LongPressDemo duration={longPress.state.duration} showProgress={longPress.state.showProgress} />
                </DemoCard>

                {/* Touch Button */}
                <DemoCard
                  title="Touch Targets"
                  description="Touch-optimized button sizes"
                  category="mobileTouch"
                  testId="demo-touch-button"
                  codeSnippet={`className="min-h-[44px] min-w-[44px] px-6 py-3"
// WCAG 2.1: Touch targets should be at least 44x44px`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Size',
                          value: touchButton.state.size,
                          options: ['standard', 'comfortable', 'large'],
                          onChange: (value) => touchButton.updateState('size', value),
                        },
                        {
                          type: 'slider',
                          label: 'Spacing (px)',
                          value: touchButton.state.spacing,
                          min: 8,
                          max: 24,
                          step: 4,
                          onChange: (value) => touchButton.updateState('spacing', value),
                        },
                      ]}
                      onReset={touchButton.resetState}
                    />
                  }
                >
                  <TouchButtonDemo size={touchButton.state.size} spacing={touchButton.state.spacing} />
                </DemoCard>
              </ComponentCategory>
            </div>

            {/* PASSIVE STATES CATEGORY */}
            <div id="category-passiveStates">
              <ComponentCategory
                title={DEMO_CATEGORIES.passiveStates.title}
                description={DEMO_CATEGORIES.passiveStates.description}
                icon={DEMO_CATEGORIES.passiveStates.icon}
                defaultExpanded={!activeCategory || activeCategory === 'passiveStates'}
              >
                {/* Loading Spinner */}
                <DemoCard
                  title="Loading"
                  description="Spinner variants (spin/pulse/dots/bars)"
                  category="passiveStates"
                  testId="demo-loading-spinner"
                  codeSnippet={`<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Variant',
                          value: loadingSpinner.state.variant,
                          options: ['spin', 'pulse', 'dots', 'bars'],
                          onChange: (value) => loadingSpinner.updateState('variant', value),
                        },
                        {
                          type: 'select',
                          label: 'Size',
                          value: loadingSpinner.state.size,
                          options: ['sm', 'md', 'lg'],
                          onChange: (value) => loadingSpinner.updateState('size', value),
                        },
                        {
                          type: 'select',
                          label: 'Color',
                          value: loadingSpinner.state.color,
                          options: ['primary', 'secondary', 'white'],
                          onChange: (value) => loadingSpinner.updateState('color', value),
                        },
                      ]}
                      onReset={loadingSpinner.resetState}
                    />
                  }
                >
                  <LoadingSpinnerDemo variant={loadingSpinner.state.variant} size={loadingSpinner.state.size} color={loadingSpinner.state.color} />
                </DemoCard>

                {/* Skeleton Screen */}
                <DemoCard
                  title="Skeleton"
                  description="Skeleton loading placeholder"
                  category="passiveStates"
                  testId="demo-skeleton-screen"
                  codeSnippet={`<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Layout',
                          value: skeletonScreen.state.layout,
                          options: ['card', 'list', 'profile'],
                          onChange: (value) => skeletonScreen.updateState('layout', value),
                        },
                        {
                          type: 'select',
                          label: 'Animation',
                          value: skeletonScreen.state.animationSpeed,
                          options: ['slow', 'normal', 'fast'],
                          onChange: (value) => skeletonScreen.updateState('animationSpeed', value),
                        },
                      ]}
                      onReset={skeletonScreen.resetState}
                    />
                  }
                >
                  <SkeletonScreenDemo layout={skeletonScreen.state.layout} animationSpeed={skeletonScreen.state.animationSpeed} />
                </DemoCard>

                {/* Pulse Animation */}
                <DemoCard
                  title="Pulse"
                  description="Pulsing elements with speed/intensity controls"
                  category="passiveStates"
                  testId="demo-pulse-animation"
                  codeSnippet={`className="animate-pulse"
// Custom: @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Speed',
                          value: pulseAnimation.state.speed,
                          options: ['slow', 'normal', 'fast'],
                          onChange: (value) => pulseAnimation.updateState('speed', value),
                        },
                        {
                          type: 'select',
                          label: 'Intensity',
                          value: pulseAnimation.state.intensity,
                          options: ['low', 'medium', 'high'],
                          onChange: (value) => pulseAnimation.updateState('intensity', value),
                        },
                      ]}
                      onReset={pulseAnimation.resetState}
                    />
                  }
                >
                  <PulseAnimationDemo speed={pulseAnimation.state.speed} intensity={pulseAnimation.state.intensity} />
                </DemoCard>

                {/* Status Indicator */}
                <DemoCard
                  title="Status"
                  description="Status badges and progress bars"
                  category="passiveStates"
                  testId="demo-status-indicator"
                  codeSnippet={`<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Active
</span>`}
                  controls={
                    <DemoControls
                      controls={[
                        {
                          type: 'select',
                          label: 'Type',
                          value: statusIndicator.state.type,
                          options: ['badge', 'progress', 'dot'],
                          onChange: (value) => statusIndicator.updateState('type', value),
                        },
                        {
                          type: 'select',
                          label: 'Status',
                          value: statusIndicator.state.status,
                          options: ['success', 'warning', 'error', 'info'],
                          onChange: (value) => statusIndicator.updateState('status', value),
                        },
                      ]}
                      onReset={statusIndicator.resetState}
                    />
                  }
                >
                  <StatusIndicatorDemo type={statusIndicator.state.type} status={statusIndicator.state.status} />
                </DemoCard>
              </ComponentCategory>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
              <p>
                Demo Harness v1.0.0 - Comprehensive UI/UX Testing Infrastructure
              </p>
              <p className="mt-1">Development Mode Only</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoHarness;
