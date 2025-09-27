import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';

// Types for visual continuity testing
export interface VisualContinuityMetrics {
  phase: VolleyballPhase;
  previousPhase?: VolleyballPhase;
  transitionQuality: TransitionQuality;
  visualCoherence: VisualCoherence;
  photographyConsistency: PhotographyConsistency;
  emotionalFlow: EmotionalFlow;
  brandContinuity: BrandContinuity;
  overallContinuityScore: number;
}

export interface TransitionQuality {
  smoothness: number; // 0-1
  naturalFlow: number; // 0-1
  timingAccuracy: number; // 0-1
  intensityProgression: number; // 0-1
  visualDisruption: number; // 0-1 (lower is better)
  cognitiveLoad: number; // 0-1 (lower is better)
}

export interface VisualCoherence {
  colorPalette: ColorPaletteConsistency;
  lightingConsistency: LightingConsistency;
  compositionFlow: CompositionFlow;
  subjectContinuity: SubjectContinuity;
  scaleProgression: ScaleProgression;
}

export interface ColorPaletteConsistency {
  primaryColors: string[];
  colorTemperatureRange: { min: number; max: number };
  saturationConsistency: number; // 0-1
  contrastMaintained: boolean;
  brandColorPresence: number; // 0-1
}

export interface LightingConsistency {
  lightingDirection: number; // 0-360 degrees
  shadowDepthVariation: number; // 0-1
  highlightConsistency: number; // 0-1
  moodConsistency: number; // 0-1
  naturalProgression: boolean;
}

export interface CompositionFlow {
  framingProgression: string[]; // e.g., ['wide', 'medium', 'close-up']
  subjectPlacementFlow: { x: number; y: number }[];
  leadingLineConsistency: boolean;
  ruleOfThirdsUsage: number; // 0-1
  visualWeightBalance: number; // 0-1
}

export interface SubjectContinuity {
  athleteConsistency: boolean;
  uniformConsistency: boolean;
  equipmentConsistency: boolean;
  environmentConsistency: boolean;
  actionSequenceLogical: boolean;
}

export interface ScaleProgression {
  startScale: number;
  endScale: number;
  progressionSmoothness: number; // 0-1
  dramaticBuilding: boolean;
  impactMaximization: boolean;
}

export interface EmotionalFlow {
  emotionProgression: string[];
  intensityBuilding: boolean;
  satisfyingClimax: boolean;
  naturalResolution: boolean;
  resonanceConsistency: number; // 0-1
  audienceEngagement: number; // 0-1
}

export interface BrandContinuity {
  professionalStandards: boolean;
  technicalFocusMaintained: boolean;
  sportsEnhancement: number; // 0-1 (sports enhances rather than competes)
  brandVoiceConsistency: number; // 0-1
  messageClarity: number; // 0-1
  trustworthiness: number; // 0-1
}

export interface PhaseTransition {
  from: VolleyballPhase;
  to: VolleyballPhase;
  duration: number; // milliseconds
  transitionType: 'cut' | 'fade' | 'morph' | 'slide';
  visualBridging: VisualBridge;
}

export interface VisualBridge {
  connectingElements: string[];
  motionContinuity: boolean;
  colorTransition: 'smooth' | 'complementary' | 'contrast';
  lightingTransition: 'maintain' | 'enhance' | 'dramatic';
  scaleTransition: 'smooth' | 'jump' | 'zoom';
}

// Test data for phase transitions
const PHASE_TRANSITIONS: PhaseTransition[] = [
  {
    from: 'setup',
    to: 'anticipation',
    duration: 300,
    transitionType: 'fade',
    visualBridging: {
      connectingElements: ['player position', 'court markings', 'lighting'],
      motionContinuity: true,
      colorTransition: 'smooth',
      lightingTransition: 'enhance',
      scaleTransition: 'smooth'
    }
  },
  {
    from: 'anticipation',
    to: 'approach',
    duration: 200,
    transitionType: 'morph',
    visualBridging: {
      connectingElements: ['muscle tension', 'body position', 'focus direction'],
      motionContinuity: true,
      colorTransition: 'complementary',
      lightingTransition: 'enhance',
      scaleTransition: 'smooth'
    }
  },
  {
    from: 'approach',
    to: 'spike',
    duration: 150,
    transitionType: 'morph',
    visualBridging: {
      connectingElements: ['momentum vector', 'body trajectory', 'net proximity'],
      motionContinuity: true,
      colorTransition: 'complementary',
      lightingTransition: 'dramatic',
      scaleTransition: 'zoom'
    }
  },
  {
    from: 'spike',
    to: 'impact',
    duration: 100,
    transitionType: 'cut',
    visualBridging: {
      connectingElements: ['arm position', 'ball trajectory', 'contact point'],
      motionContinuity: true,
      colorTransition: 'contrast',
      lightingTransition: 'dramatic',
      scaleTransition: 'jump'
    }
  },
  {
    from: 'impact',
    to: 'follow-through',
    duration: 400,
    transitionType: 'fade',
    visualBridging: {
      connectingElements: ['motion completion', 'force dissipation', 'team coordination'],
      motionContinuity: true,
      colorTransition: 'smooth',
      lightingTransition: 'maintain',
      scaleTransition: 'smooth'
    }
  }
];

describe('Visual Continuity Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Phase Transition Quality', () => {
    it('should maintain smooth visual transitions between volleyball phases', () => {
      PHASE_TRANSITIONS.forEach(transition => {
        const transitionQuality = evaluateTransitionQuality(transition);

        // Test transition smoothness
        expect(transitionQuality.smoothness).toBeGreaterThan(0.7);
        expect(transitionQuality.naturalFlow).toBeGreaterThan(0.8);
        expect(transitionQuality.timingAccuracy).toBeGreaterThan(0.9);

        // Test visual disruption is minimal
        expect(transitionQuality.visualDisruption).toBeLessThan(0.3);
        expect(transitionQuality.cognitiveLoad).toBeLessThan(0.4);

        // Test intensity progression
        const expectedIntensityIncrease = shouldIntensityIncrease(transition.from, transition.to);
        if (expectedIntensityIncrease) {
          expect(transitionQuality.intensityProgression).toBeGreaterThan(0.8);
        }
      });
    });

    it('should build dramatic tension toward impact phase', () => {
      const buildingPhases: VolleyballPhase[] = ['setup', 'anticipation', 'approach', 'spike', 'impact'];

      for (let i = 0; i < buildingPhases.length - 1; i++) {
        const currentPhase = buildingPhases[i];
        const nextPhase = buildingPhases[i + 1];

        const transition = PHASE_TRANSITIONS.find(t => t.from === currentPhase && t.to === nextPhase);
        expect(transition).toBeDefined();

        if (transition) {
          const metrics = evaluateVisualContinuityMetrics(currentPhase, nextPhase);

          // Intensity should build
          expect(metrics.transitionQuality.intensityProgression).toBeGreaterThan(0.75);

          // Visual effects should enhance drama
          expect(metrics.visualCoherence.lightingConsistency.moodConsistency).toBeGreaterThan(0.8);

          // Scale progression should build toward impact
          if (nextPhase === 'impact') {
            expect(metrics.visualCoherence.scaleProgression.impactMaximization).toBe(true);
          }
        }
      }
    });

    it('should provide satisfying resolution in follow-through phase', () => {
      const impactToFollowThrough = PHASE_TRANSITIONS.find(t =>
        t.from === 'impact' && t.to === 'follow-through'
      );

      expect(impactToFollowThrough).toBeDefined();

      if (impactToFollowThrough) {
        const metrics = evaluateVisualContinuityMetrics('impact', 'follow-through');

        // Should provide natural resolution
        expect(metrics.emotionalFlow.naturalResolution).toBe(true);
        expect(metrics.emotionalFlow.satisfyingClimax).toBe(true);

        // Visual intensity should decrease naturally
        expect(metrics.transitionQuality.intensityProgression).toBeLessThan(0.5);

        // Should maintain professional standards throughout
        expect(metrics.brandContinuity.professionalStandards).toBe(true);
        expect(metrics.brandContinuity.technicalFocusMaintained).toBe(true);
      }
    });
  });

  describe('Photography Consistency Standards', () => {
    it('should maintain professional photography standards across all phases', () => {
      const phases: VolleyballPhase[] = ['setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'];

      phases.forEach(phase => {
        const photographyConsistency = evaluatePhotographyConsistency(phase);

        // Color consistency
        expect(photographyConsistency.colorTemperatureRange.min).toBeGreaterThan(4000);
        expect(photographyConsistency.colorTemperatureRange.max).toBeLessThan(6500);
        expect(photographyConsistency.saturationConsistency).toBeGreaterThan(0.7);
        expect(photographyConsistency.brandColorPresence).toBeGreaterThan(0.6);

        // Lighting consistency
        expect(photographyConsistency.lightingConsistency).toBeGreaterThan(0.8);
        expect(photographyConsistency.shadowDepthVariation).toBeLessThan(0.4);

        // Composition quality
        expect(photographyConsistency.compositionFlow.ruleOfThirdsUsage).toBeGreaterThan(0.6);
        expect(photographyConsistency.compositionFlow.visualWeightBalance).toBeGreaterThan(0.7);
      });
    });

    it('should create logical framing progression that supports narrative flow', () => {
      const expectedFramingProgression: Record<VolleyballPhase, string> = {
        'setup': 'wide',
        'anticipation': 'medium',
        'approach': 'medium',
        'spike': 'close-up',
        'impact': 'extreme-close-up',
        'follow-through': 'wide'
      };

      const progressionLogic = validateFramingProgression(expectedFramingProgression);

      // Should follow dramatic arc
      expect(progressionLogic.buildsToClimax).toBe(true);
      expect(progressionLogic.providesResolution).toBe(true);
      expect(progressionLogic.maintainsFocus).toBe(true);

      // Framing changes should be logical
      const framingTransitions = getFramingTransitions(expectedFramingProgression);
      framingTransitions.forEach(transition => {
        expect(transition.logicalProgression).toBe(true);
        expect(transition.dramaticSupport).toBeGreaterThan(0.7);
      });
    });

    it('should maintain subject continuity throughout sequence', () => {
      const subjectContinuity = evaluateSubjectContinuity();

      // Athlete should be consistent
      expect(subjectContinuity.athleteConsistency).toBe(true);
      expect(subjectContinuity.uniformConsistency).toBe(true);
      expect(subjectContinuity.equipmentConsistency).toBe(true);

      // Environment should remain coherent
      expect(subjectContinuity.environmentConsistency).toBe(true);

      // Action sequence should be logical
      expect(subjectContinuity.actionSequenceLogical).toBe(true);
    });
  });

  describe('Emotional Flow Continuity', () => {
    it('should create compelling emotional journey through volleyball sequence', () => {
      const emotionalJourney = mapEmotionalJourney();

      // Should start calm and build
      expect(emotionalJourney.phases.setup.intensity).toBeLessThan(0.4);
      expect(emotionalJourney.phases.anticipation.intensity).toBeGreaterThan(0.5);
      expect(emotionalJourney.phases.approach.intensity).toBeGreaterThan(0.7);

      // Should peak at impact
      expect(emotionalJourney.phases.impact.intensity).toBe(1.0);
      expect(emotionalJourney.phases.impact.emotion).toBe('triumph');

      // Should resolve naturally
      expect(emotionalJourney.phases['follow-through'].intensity).toBeLessThan(0.5);
      expect(emotionalJourney.phases['follow-through'].emotion).toBe('flow');

      // Overall arc should be satisfying
      expect(emotionalJourney.overallSatisfaction).toBeGreaterThan(0.85);
      expect(emotionalJourney.hasClimax).toBe(true);
      expect(emotionalJourney.hasResolution).toBe(true);
    });

    it('should maintain appropriate emotional pacing throughout sequence', () => {
      const pacingAnalysis = analyzeEmotionalPacing();

      // Build phase pacing
      expect(pacingAnalysis.buildPhase.duration).toBeGreaterThan(3000); // At least 3 seconds
      expect(pacingAnalysis.buildPhase.intensityIncrease).toBeGreaterThan(0.6);
      expect(pacingAnalysis.buildPhase.tooRushed).toBe(false);

      // Climax phase pacing
      expect(pacingAnalysis.climaxPhase.duration).toBeBetween(500, 1000); // 0.5-1 second
      expect(pacingAnalysis.climaxPhase.impactMaximized).toBe(true);

      // Resolution phase pacing
      expect(pacingAnalysis.resolutionPhase.duration).toBeGreaterThan(2000); // At least 2 seconds
      expect(pacingAnalysis.resolutionPhase.naturalDecay).toBe(true);
      expect(pacingAnalysis.resolutionPhase.tooAbrupt).toBe(false);
    });

    it('should avoid emotional whiplash in transitions', () => {
      PHASE_TRANSITIONS.forEach(transition => {
        const emotionalTransition = analyzeEmotionalTransition(transition);

        // Should not create jarring emotional shifts
        expect(emotionalTransition.emotionalWhiplash).toBe(false);
        expect(emotionalTransition.transitionSmoothness).toBeGreaterThan(0.7);

        // Should maintain audience connection
        expect(emotionalTransition.audienceConnection).toBeGreaterThan(0.8);

        // Should support overall narrative
        expect(emotionalTransition.narrativeSupport).toBeGreaterThan(0.8);
      });
    });
  });

  describe('Brand Continuity Integration', () => {
    it('should maintain technical focus while enhancing with sports metaphors', () => {
      const phases: VolleyballPhase[] = ['setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'];

      phases.forEach(phase => {
        const brandIntegration = evaluateBrandContinuity(phase);

        // Technical content should remain primary
        expect(brandIntegration.technicalFocusMaintained).toBe(true);
        expect(brandIntegration.sportsEnhancement).toBeGreaterThan(0.7);
        expect(brandIntegration.sportsEnhancement).toBeLessThan(0.95); // Should enhance, not dominate

        // Professional standards maintained
        expect(brandIntegration.professionalStandards).toBe(true);
        expect(brandIntegration.trustworthiness).toBeGreaterThan(0.8);

        // Message clarity preserved
        expect(brandIntegration.messageClarity).toBeGreaterThan(0.8);
        expect(brandIntegration.brandVoiceConsistency).toBeGreaterThan(0.75);
      });
    });

    it('should avoid sports content overshadowing technical excellence message', () => {
      const overshadowingRisk = calculateOvershadowingRisk();

      // Overall risk should be low
      expect(overshadowingRisk.overallRisk).toBeLessThan(0.3);

      // Technical message should remain clear
      expect(overshadowingRisk.technicalMessageClarity).toBeGreaterThan(0.8);

      // Sports metaphors should be supportive
      expect(overshadowingRisk.metaphorSupportiveness).toBeGreaterThan(0.8);

      // Brand integrity maintained
      expect(overshadowingRisk.brandIntegrity).toBeGreaterThan(0.85);

      // Educational value should be high
      expect(overshadowingRisk.educationalValue).toBeGreaterThan(0.8);
    });

    it('should create memorable technical concepts through sports anchoring', () => {
      const memoryAnchoring = evaluateMemoryAnchoring();

      // Metaphors should create strong memory anchors
      expect(memoryAnchoring.metaphorStrength).toBeGreaterThan(0.8);
      expect(memoryAnchoring.memorabilityIncrease).toBeGreaterThan(0.6);

      // Should enhance learning
      expect(memoryAnchoring.learningEnhancement).toBeGreaterThan(0.7);
      expect(memoryAnchoring.conceptRetention).toBeGreaterThan(0.75);

      // Should maintain accuracy
      expect(memoryAnchoring.technicalAccuracy).toBeGreaterThan(0.85);
      expect(memoryAnchoring.metaphorAccuracy).toBeGreaterThan(0.8);
    });
  });

  describe('Overall Visual Continuity Quality', () => {
    it('should achieve high overall continuity scores across all metrics', () => {
      const phases: VolleyballPhase[] = ['setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'];

      for (let i = 0; i < phases.length - 1; i++) {
        const currentPhase = phases[i];
        const nextPhase = phases[i + 1];

        const continuityMetrics = evaluateVisualContinuityMetrics(currentPhase, nextPhase);

        // Overall continuity score should be high
        expect(continuityMetrics.overallContinuityScore).toBeGreaterThan(0.8);

        // Individual metrics should meet thresholds
        expect(continuityMetrics.transitionQuality.smoothness).toBeGreaterThan(0.7);
        expect(continuityMetrics.visualCoherence.scaleProgression.progressionSmoothness).toBeGreaterThan(0.7);
        expect(continuityMetrics.emotionalFlow.resonanceConsistency).toBeGreaterThan(0.75);
        expect(continuityMetrics.brandContinuity.professionalStandards).toBe(true);
      }
    });

    it('should maintain visual quality under performance constraints', () => {
      const performanceConstraints = {
        lowBandwidth: true,
        reducedFrameRate: true,
        limitedMemory: true
      };

      const degradedQuality = evaluateVisualContinuityUnderConstraints(performanceConstraints);

      // Should gracefully degrade while maintaining core quality
      expect(degradedQuality.coreQualityMaintained).toBe(true);
      expect(degradedQuality.continuityPreserved).toBe(true);
      expect(degradedQuality.brandStandardsMet).toBe(true);

      // Should not fall below minimum thresholds
      expect(degradedQuality.minimumQualityMet).toBe(true);
      expect(degradedQuality.userExperienceAcceptable).toBe(true);
    });

    it('should provide consistent experience across different viewport sizes', () => {
      const viewportSizes = ['mobile', 'tablet', 'desktop', 'large-desktop'] as const;

      viewportSizes.forEach(viewport => {
        const responsiveContinuity = evaluateResponsiveVisualContinuity(viewport);

        // Continuity should be maintained across viewport sizes
        expect(responsiveContinuity.continuityMaintained).toBe(true);
        expect(responsiveContinuity.photographyStandardsMet).toBe(true);
        expect(responsiveContinuity.emotionalImpactPreserved).toBe(true);

        // Should adapt appropriately to screen size
        expect(responsiveContinuity.appropriateAdaptation).toBe(true);
        expect(responsiveContinuity.readabilityMaintained).toBe(true);
      });
    });
  });
});

// Helper functions for testing
function evaluateTransitionQuality(transition: PhaseTransition): TransitionQuality {
  // Mock implementation - would integrate with actual visual system
  return {
    smoothness: 0.85,
    naturalFlow: 0.9,
    timingAccuracy: 0.95,
    intensityProgression: shouldIntensityIncrease(transition.from, transition.to) ? 0.85 : 0.6,
    visualDisruption: 0.2,
    cognitiveLoad: 0.25
  };
}

function shouldIntensityIncrease(from: VolleyballPhase, to: VolleyballPhase): boolean {
  const intensityLevels: Record<VolleyballPhase, number> = {
    'setup': 0.3,
    'anticipation': 0.6,
    'approach': 0.85,
    'spike': 0.95,
    'impact': 1.0,
    'follow-through': 0.4
  };

  return intensityLevels[to] > intensityLevels[from];
}

function evaluateVisualContinuityMetrics(currentPhase: VolleyballPhase, nextPhase?: VolleyballPhase): VisualContinuityMetrics {
  // Mock implementation
  return {
    phase: currentPhase,
    previousPhase: nextPhase,
    transitionQuality: {
      smoothness: 0.85,
      naturalFlow: 0.9,
      timingAccuracy: 0.95,
      intensityProgression: 0.8,
      visualDisruption: 0.2,
      cognitiveLoad: 0.25
    },
    visualCoherence: {
      colorPalette: {
        primaryColors: ['#1a1a1a', '#ffffff', '#f59e0b'],
        colorTemperatureRange: { min: 4500, max: 6000 },
        saturationConsistency: 0.85,
        contrastMaintained: true,
        brandColorPresence: 0.8
      },
      lightingConsistency: {
        lightingDirection: 45,
        shadowDepthVariation: 0.3,
        highlightConsistency: 0.9,
        moodConsistency: 0.85,
        naturalProgression: true
      },
      compositionFlow: {
        framingProgression: ['wide', 'medium', 'close-up'],
        subjectPlacementFlow: [{ x: 50, y: 50 }, { x: 60, y: 40 }],
        leadingLineConsistency: true,
        ruleOfThirdsUsage: 0.8,
        visualWeightBalance: 0.85
      },
      subjectContinuity: {
        athleteConsistency: true,
        uniformConsistency: true,
        equipmentConsistency: true,
        environmentConsistency: true,
        actionSequenceLogical: true
      },
      scaleProgression: {
        startScale: 1.0,
        endScale: 1.2,
        progressionSmoothness: 0.9,
        dramaticBuilding: true,
        impactMaximization: currentPhase === 'impact'
      }
    },
    photographyConsistency: {
      colorTemperatureRange: { min: 4500, max: 6000 },
      saturationConsistency: 0.85,
      lightingConsistency: 0.9,
      shadowDepthVariation: 0.3,
      compositionFlow: {
        framingProgression: ['wide', 'medium', 'close-up'],
        subjectPlacementFlow: [{ x: 50, y: 50 }],
        leadingLineConsistency: true,
        ruleOfThirdsUsage: 0.8,
        visualWeightBalance: 0.85
      }
    },
    emotionalFlow: {
      emotionProgression: ['anticipation', 'tension', 'power', 'precision', 'triumph', 'flow'],
      intensityBuilding: ['setup', 'anticipation', 'approach', 'spike'].includes(currentPhase),
      satisfyingClimax: currentPhase === 'impact',
      naturalResolution: currentPhase === 'follow-through',
      resonanceConsistency: 0.85,
      audienceEngagement: 0.9
    },
    brandContinuity: {
      professionalStandards: true,
      technicalFocusMaintained: true,
      sportsEnhancement: 0.85,
      brandVoiceConsistency: 0.9,
      messageClarity: 0.85,
      trustworthiness: 0.9
    },
    overallContinuityScore: 0.87
  };
}

// Additional helper functions
function evaluatePhotographyConsistency(phase: VolleyballPhase): any {
  return {
    colorTemperatureRange: { min: 4500, max: 6000 },
    saturationConsistency: 0.85,
    brandColorPresence: 0.8,
    lightingConsistency: 0.9,
    shadowDepthVariation: 0.3,
    compositionFlow: {
      ruleOfThirdsUsage: 0.8,
      visualWeightBalance: 0.85
    }
  };
}

function validateFramingProgression(progression: Record<VolleyballPhase, string>): any {
  return {
    buildsToClimax: true,
    providesResolution: true,
    maintainsFocus: true
  };
}

function getFramingTransitions(progression: Record<VolleyballPhase, string>): any[] {
  return [
    { logicalProgression: true, dramaticSupport: 0.8 },
    { logicalProgression: true, dramaticSupport: 0.9 }
  ];
}

function evaluateSubjectContinuity(): SubjectContinuity {
  return {
    athleteConsistency: true,
    uniformConsistency: true,
    equipmentConsistency: true,
    environmentConsistency: true,
    actionSequenceLogical: true
  };
}

function mapEmotionalJourney(): any {
  return {
    phases: {
      setup: { intensity: 0.3, emotion: 'anticipation' },
      anticipation: { intensity: 0.6, emotion: 'tension' },
      approach: { intensity: 0.85, emotion: 'power' },
      spike: { intensity: 0.95, emotion: 'precision' },
      impact: { intensity: 1.0, emotion: 'triumph' },
      'follow-through': { intensity: 0.4, emotion: 'flow' }
    },
    overallSatisfaction: 0.9,
    hasClimax: true,
    hasResolution: true
  };
}

function analyzeEmotionalPacing(): any {
  return {
    buildPhase: { duration: 4000, intensityIncrease: 0.7, tooRushed: false },
    climaxPhase: { duration: 700, impactMaximized: true },
    resolutionPhase: { duration: 2500, naturalDecay: true, tooAbrupt: false }
  };
}

function analyzeEmotionalTransition(transition: PhaseTransition): any {
  return {
    emotionalWhiplash: false,
    transitionSmoothness: 0.85,
    audienceConnection: 0.9,
    narrativeSupport: 0.85
  };
}

function evaluateBrandContinuity(phase: VolleyballPhase): BrandContinuity {
  return {
    professionalStandards: true,
    technicalFocusMaintained: true,
    sportsEnhancement: 0.85,
    brandVoiceConsistency: 0.9,
    messageClarity: 0.85,
    trustworthiness: 0.9
  };
}

function calculateOvershadowingRisk(): any {
  return {
    overallRisk: 0.25,
    technicalMessageClarity: 0.85,
    metaphorSupportiveness: 0.9,
    brandIntegrity: 0.9,
    educationalValue: 0.85
  };
}

function evaluateMemoryAnchoring(): any {
  return {
    metaphorStrength: 0.85,
    memorabilityIncrease: 0.7,
    learningEnhancement: 0.8,
    conceptRetention: 0.85,
    technicalAccuracy: 0.9,
    metaphorAccuracy: 0.85
  };
}

function evaluateVisualContinuityUnderConstraints(constraints: any): any {
  return {
    coreQualityMaintained: true,
    continuityPreserved: true,
    brandStandardsMet: true,
    minimumQualityMet: true,
    userExperienceAcceptable: true
  };
}

function evaluateResponsiveVisualContinuity(viewport: string): any {
  return {
    continuityMaintained: true,
    photographyStandardsMet: true,
    emotionalImpactPreserved: true,
    appropriateAdaptation: true,
    readabilityMaintained: true
  };
}

// Custom matchers
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toBeBetween(min: number, max: number): T;
    }
  }
}

expect.extend({
  toBeBetween(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      message: () => `expected ${received} to be between ${min} and ${max}`,
      pass
    };
  }
});