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

import { DEMO_CATEGORIES, demoComponents, getDemosByCategory } from '../config/demoComponents';
import { useDemoState } from '../hooks/useDemoState';

export const DemoHarness: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter demos based on search and category
  const filteredDemos = useMemo(() => {
    let demos = demoComponents;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      demos = demos.filter(
        (demo) =>
          demo.title.toLowerCase().includes(query) ||
          demo.description.toLowerCase().includes(query)
      );
    }

    if (activeCategory) {
      demos = demos.filter((demo) => demo.category === activeCategory);
    }

    return demos;
  }, [searchQuery, activeCategory]);

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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      {/* Header */}
      <DemoHeader
        onReset={handleResetAll}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

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
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Demo Harness</h2>
              <p className="text-white/60 mb-4">
                This is a comprehensive testing and showcase environment for all UI/UX components,
                animations, and effects. Use the controls to experiment with different settings and
                observe how components behave.
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-white/60">
                    {filteredDemos.length} Components Available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-white/60">119+ Motion Test Scenarios</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  <span className="text-white/60">Full Keyboard Accessible</span>
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
                  title="Fade Up Animation (8px)"
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
                  title="Fade Up Animation (24px)"
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
                  title="Slide Animation"
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
                  title="Scale Animation"
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
                  title="Blur Morph Animation"
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
                  title="Parallax Effect"
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
                  title="Spotlight Cursor"
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
                  title="Glow Effects"
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
                  title="Magnetic Button"
                  description="Button responds to cursor proximity with transform and glow"
                  category="interactive"
                  testId="demo-magnetic"
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
                  title="Effects Panel HUD"
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
                  title="Keyboard Navigation"
                  description="Full keyboard support with Tab, Enter, Space, Escape"
                  category="interactive"
                  testId="demo-keyboard"
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
                  title="Section Fade + Slide"
                  description="Entire section fades and slides into view"
                  category="sections"
                  testId="demo-section-fade"
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
                  title="Section Border Animation"
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
                  title="Staggered Content Animation"
                  description="Content elements animate in sequence with delays"
                  category="sections"
                  testId="demo-staggered"
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
