import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';

export interface PhaseSpecificSportsContentProps {
  phase: VolleyballPhase;
  progress: number;
  intensity: number;
  isVisible: boolean;
  technicalContext: TechnicalContext;
  onContentLoad?: (contentId: string) => void;
  onEmotionalResonance?: (resonance: EmotionalResonance) => void;
  className?: string;
}

export interface TechnicalContext {
  concept: string;
  complexity: number;
  performance: number;
  scalability: number;
  reliability: number;
}

export interface EmotionalResonance {
  connectionStrength: number;
  sharedQualities: string[];
  educationalEnhancement: number;
  memorabilityBoost: number;
  brandAlignmentScore: number;
}

export interface VolleyballContent {
  id: string;
  phase: VolleyballPhase;
  imageUrl: string;
  description: string;
  actionMoment: ActionMoment;
  photographySpecs: PhotographySpecification;
  emotionalMetadata: EmotionalMetadata;
  technicalParallel: TechnicalParallel;
}

export interface ActionMoment {
  type: 'preparation' | 'tension-build' | 'explosive-movement' | 'peak-action' | 'contact-moment' | 'completion';
  intensityLevel: number;
  timingAccuracy: number;
  focusPoint: { x: number; y: number };
  movementVector: { angle: number; magnitude: number };
}

export interface PhotographySpecification {
  framing: 'wide' | 'medium' | 'close-up' | 'extreme-close-up';
  angle: 'low' | 'eye-level' | 'high' | 'overhead';
  shutterSpeed: string;
  fStop: string;
  iso: number;
  focalLength: string;
  lighting: LightingConfiguration;
  composition: CompositionRules;
}

export interface LightingConfiguration {
  primary: 'natural' | 'strobe' | 'continuous';
  shadowDepth: number;
  highlightIntensity: number;
  colorTemperature: number;
  mood: 'dramatic' | 'clean' | 'dynamic' | 'crystallized';
}

export interface CompositionRules {
  ruleOfThirds: boolean;
  leadingLines: boolean;
  symmetryScore: number;
  dynamicBalance: number;
  subjectPlacement: { x: number; y: number };
}

export interface EmotionalMetadata {
  primaryEmotion: 'anticipation' | 'tension' | 'power' | 'precision' | 'triumph' | 'flow';
  secondaryEmotions: string[];
  intensityBuilding: boolean;
  satisfyingRelease: boolean;
  resonanceFactors: string[];
}

export interface TechnicalParallel {
  concept: string;
  volleyballEquivalent: string;
  sharedPrinciples: string[];
  metaphorStrength: number;
  educationalValue: number;
  memoryAnchor: string;
}

// Phase-specific volleyball content configurations
const VOLLEYBALL_CONTENT: Record<VolleyballPhase, VolleyballContent> = {
  setup: {
    id: 'setup-positioning',
    phase: 'setup',
    imageUrl: '/images/portfolio-01.jpg', // Using portfolio image as placeholder
    description: 'Professional player in ready position before serve, demonstrating foundation and preparation',
    actionMoment: {
      type: 'preparation',
      intensityLevel: 0.3,
      timingAccuracy: 0.8,
      focusPoint: { x: 50, y: 45 },
      movementVector: { angle: 0, magnitude: 0.2 }
    },
    photographySpecs: {
      framing: 'wide',
      angle: 'eye-level',
      shutterSpeed: '1/250s',
      fStop: 'f/4.0',
      iso: 800,
      focalLength: '85mm',
      lighting: {
        primary: 'natural',
        shadowDepth: 0.4,
        highlightIntensity: 0.5,
        colorTemperature: 5500,
        mood: 'clean'
      },
      composition: {
        ruleOfThirds: true,
        leadingLines: true,
        symmetryScore: 0.7,
        dynamicBalance: 0.6,
        subjectPlacement: { x: 35, y: 50 }
      }
    },
    emotionalMetadata: {
      primaryEmotion: 'anticipation',
      secondaryEmotions: ['focus', 'preparation', 'calm readiness'],
      intensityBuilding: false,
      satisfyingRelease: false,
      resonanceFactors: ['careful planning', 'foundation building', 'mental clarity', 'steady preparation']
    },
    technicalParallel: {
      concept: 'System Architecture Planning',
      volleyballEquivalent: 'Pre-serve positioning and mental preparation',
      sharedPrinciples: ['Solid foundation', 'Strategic positioning', 'Mental preparation', 'Optimal setup'],
      metaphorStrength: 0.85,
      educationalValue: 0.9,
      memoryAnchor: 'Strong foundations enable peak performance'
    }
  },
  anticipation: {
    id: 'anticipation-tension-build',
    phase: 'anticipation',
    imageUrl: '/images/portfolio-01.jpg', // Using portfolio image as placeholder // TODO: Replace with anticipation-muscle-tension.svg
    description: 'Player reading opponent\'s play with visible muscle tension and heightened focus',
    actionMoment: {
      type: 'tension-build',
      intensityLevel: 0.6,
      timingAccuracy: 0.9,
      focusPoint: { x: 55, y: 40 },
      movementVector: { angle: 15, magnitude: 0.4 }
    },
    photographySpecs: {
      framing: 'medium',
      angle: 'eye-level',
      shutterSpeed: '1/500s',
      fStop: 'f/3.5',
      iso: 1200,
      focalLength: '135mm',
      lighting: {
        primary: 'natural',
        shadowDepth: 0.5,
        highlightIntensity: 0.6,
        colorTemperature: 5200,
        mood: 'dramatic'
      },
      composition: {
        ruleOfThirds: true,
        leadingLines: true,
        symmetryScore: 0.6,
        dynamicBalance: 0.7,
        subjectPlacement: { x: 65, y: 35 }
      }
    },
    emotionalMetadata: {
      primaryEmotion: 'tension',
      secondaryEmotions: ['anticipation', 'focus intensification', 'controlled energy'],
      intensityBuilding: true,
      satisfyingRelease: false,
      resonanceFactors: ['building tension', 'increased complexity', 'heightened focus', 'preparation for action']
    },
    technicalParallel: {
      concept: 'System Complexity Emergence',
      volleyballEquivalent: 'Reading the play and building muscle tension',
      sharedPrinciples: ['Pattern recognition', 'Increasing complexity', 'Heightened awareness', 'Preparation for action'],
      metaphorStrength: 0.9,
      educationalValue: 0.95,
      memoryAnchor: 'Complexity requires focused preparation'
    }
  },
  approach: {
    id: 'approach-explosive-run',
    phase: 'approach',
    imageUrl: '/images/portfolio-01.jpg', // Using portfolio image as placeholder // TODO: Replace with approach-explosive-momentum.svg
    description: 'Dynamic approach run showing explosive power and precise timing toward the net',
    actionMoment: {
      type: 'explosive-movement',
      intensityLevel: 0.85,
      timingAccuracy: 0.95,
      focusPoint: { x: 70, y: 35 },
      movementVector: { angle: 45, magnitude: 0.9 }
    },
    photographySpecs: {
      framing: 'medium',
      angle: 'low',
      shutterSpeed: '1/750s',
      fStop: 'f/2.8',
      iso: 1600,
      focalLength: '200mm',
      lighting: {
        primary: 'continuous',
        shadowDepth: 0.6,
        highlightIntensity: 0.7,
        colorTemperature: 5000,
        mood: 'dynamic'
      },
      composition: {
        ruleOfThirds: true,
        leadingLines: true,
        symmetryScore: 0.3,
        dynamicBalance: 0.8,
        subjectPlacement: { x: 75, y: 45 }
      }
    },
    emotionalMetadata: {
      primaryEmotion: 'power',
      secondaryEmotions: ['momentum', 'precision timing', 'explosive energy', 'coordinated movement'],
      intensityBuilding: true,
      satisfyingRelease: false,
      resonanceFactors: ['momentum building', 'precision timing', 'coordinated movement', 'increasing intensity']
    },
    technicalParallel: {
      concept: 'Performance Optimization Implementation',
      volleyballEquivalent: 'Explosive approach run with precise timing',
      sharedPrinciples: ['Momentum building', 'Precise execution', 'Coordinated systems', 'Peak efficiency'],
      metaphorStrength: 0.95,
      educationalValue: 0.9,
      memoryAnchor: 'Optimal performance requires coordinated momentum'
    }
  },
  spike: {
    id: 'spike-peak-preparation',
    phase: 'spike',
    imageUrl: '/images/portfolio-01.jpg', // Using portfolio image as placeholder // TODO: Replace with spike-peak-elevation.svg
    description: 'Player at peak jump with arm cocked for strike, showing maximum athletic preparation',
    actionMoment: {
      type: 'peak-action',
      intensityLevel: 0.95,
      timingAccuracy: 0.98,
      focusPoint: { x: 80, y: 25 },
      movementVector: { angle: 90, magnitude: 1.0 }
    },
    photographySpecs: {
      framing: 'close-up',
      angle: 'high',
      shutterSpeed: '1/1000s',
      fStop: 'f/2.0',
      iso: 2000,
      focalLength: '300mm',
      lighting: {
        primary: 'strobe',
        shadowDepth: 0.8,
        highlightIntensity: 0.9,
        colorTemperature: 4800,
        mood: 'dramatic'
      },
      composition: {
        ruleOfThirds: true,
        leadingLines: true,
        symmetryScore: 0.4,
        dynamicBalance: 0.9,
        subjectPlacement: { x: 80, y: 30 }
      }
    },
    emotionalMetadata: {
      primaryEmotion: 'precision',
      secondaryEmotions: ['peak performance', 'critical timing', 'maximum focus', 'decisive preparation'],
      intensityBuilding: true,
      satisfyingRelease: false,
      resonanceFactors: ['peak performance', 'critical timing', 'maximum focus', 'decisive moment preparation']
    },
    technicalParallel: {
      concept: 'Critical System Optimization',
      volleyballEquivalent: 'Peak jump preparation for decisive strike',
      sharedPrinciples: ['Peak preparation', 'Critical timing', 'Maximum efficiency', 'Decisive execution'],
      metaphorStrength: 1.0,
      educationalValue: 0.95,
      memoryAnchor: 'Critical moments demand peak preparation'
    }
  },
  impact: {
    id: 'impact-contact-moment',
    phase: 'impact',
    imageUrl: '/images/portfolio-01.jpg', // Using portfolio image as placeholder // TODO: Replace with impact-ball-contact.svg
    description: 'Crystallized moment of hand-ball contact showing perfect force transfer and execution',
    actionMoment: {
      type: 'contact-moment',
      intensityLevel: 1.0,
      timingAccuracy: 1.0,
      focusPoint: { x: 85, y: 20 },
      movementVector: { angle: 270, magnitude: 1.0 }
    },
    photographySpecs: {
      framing: 'extreme-close-up',
      angle: 'high',
      shutterSpeed: '1/2000s',
      fStop: 'f/1.4',
      iso: 3200,
      focalLength: '400mm',
      lighting: {
        primary: 'strobe',
        shadowDepth: 0.9,
        highlightIntensity: 1.0,
        colorTemperature: 4500,
        mood: 'crystallized'
      },
      composition: {
        ruleOfThirds: false, // Centered for maximum impact
        leadingLines: false,
        symmetryScore: 0.2,
        dynamicBalance: 1.0,
        subjectPlacement: { x: 50, y: 35 }
      }
    },
    emotionalMetadata: {
      primaryEmotion: 'triumph',
      secondaryEmotions: ['decisive action', 'flawless execution', 'crystallized moment', 'peak achievement'],
      intensityBuilding: false,
      satisfyingRelease: true,
      resonanceFactors: ['decisive action', 'peak performance', 'flawless execution', 'crystallized moment']
    },
    technicalParallel: {
      concept: 'Production System Excellence',
      volleyballEquivalent: 'Perfect ball contact and force transfer',
      sharedPrinciples: ['Flawless execution', 'Peak performance', 'Decisive action', 'Crystallized excellence'],
      metaphorStrength: 1.0,
      educationalValue: 1.0,
      memoryAnchor: 'Excellence is the crystallization of perfect execution'
    }
  },
  'follow-through': {
    id: 'follow-through-completion',
    phase: 'follow-through',
    imageUrl: '/images/portfolio-01.jpg', // Using portfolio image as placeholder // TODO: Replace with follow-through-natural-motion.svg
    description: 'Natural motion completion showing coordinated movement and team dynamics',
    actionMoment: {
      type: 'completion',
      intensityLevel: 0.4,
      timingAccuracy: 0.8,
      focusPoint: { x: 40, y: 60 },
      movementVector: { angle: 315, magnitude: 0.3 }
    },
    photographySpecs: {
      framing: 'wide',
      angle: 'eye-level',
      shutterSpeed: '1/125s',
      fStop: 'f/5.6',
      iso: 400,
      focalLength: '50mm',
      lighting: {
        primary: 'natural',
        shadowDepth: 0.3,
        highlightIntensity: 0.4,
        colorTemperature: 5800,
        mood: 'clean'
      },
      composition: {
        ruleOfThirds: true,
        leadingLines: true,
        symmetryScore: 0.8,
        dynamicBalance: 0.5,
        subjectPlacement: { x: 25, y: 65 }
      }
    },
    emotionalMetadata: {
      primaryEmotion: 'flow',
      secondaryEmotions: ['natural completion', 'coordinated systems', 'sustainable excellence', 'team harmony'],
      intensityBuilding: false,
      satisfyingRelease: true,
      resonanceFactors: ['natural completion', 'coordinated systems', 'ongoing optimization', 'sustainable excellence']
    },
    technicalParallel: {
      concept: 'Continuous Monitoring and Improvement',
      volleyballEquivalent: 'Natural motion completion and team coordination',
      sharedPrinciples: ['Natural completion', 'System coordination', 'Continuous improvement', 'Sustainable performance'],
      metaphorStrength: 0.8,
      educationalValue: 0.85,
      memoryAnchor: 'Excellence requires continuous coordination and improvement'
    }
  }
};

// Professional quality thresholds
const QUALITY_THRESHOLDS = {
  minimumVisualClarity: 0.8,
  minimumComposition: 0.8,
  minimumTechnicalAccuracy: 0.8,
  minimumEmotionalImpact: 0.7,
  minimumBrandAlignment: 0.75,
  minimumOverallQuality: 0.8
};

export const PhaseSpecificSportsContent: React.FC<PhaseSpecificSportsContentProps> = ({
  phase,
  progress,
  intensity,
  isVisible,
  technicalContext,
  onContentLoad,
  onEmotionalResonance,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [emotionalResonance, setEmotionalResonance] = useState<EmotionalResonance | null>(null);

  // Get current phase content
  const currentContent = useMemo(() => VOLLEYBALL_CONTENT[phase], [phase]);

  // Calculate emotional resonance based on technical context
  const calculateEmotionalResonance = useCallback((
    content: VolleyballContent,
    techContext: TechnicalContext
  ): EmotionalResonance => {
    const parallel = content.technicalParallel;

    // Connection strength based on metaphor quality and technical alignment
    const contextComplexityMatch = Math.abs(content.actionMoment.intensityLevel - techContext.complexity);
    const performanceMatch = Math.abs(intensity - techContext.performance);

    const connectionStrength = parallel.metaphorStrength * (1 - contextComplexityMatch * 0.3) * (1 - performanceMatch * 0.2);

    // Educational enhancement based on metaphor strength and accuracy
    const educationalEnhancement = parallel.educationalValue *
      (1 + content.emotionalMetadata.resonanceFactors.length * 0.1);

    // Memorability boost from emotional anchoring
    const memorabilityBoost = parallel.metaphorStrength *
      (content.emotionalMetadata.intensityBuilding ? 1.2 : 1.0) *
      (content.emotionalMetadata.satisfyingRelease ? 1.1 : 1.0);

    // Brand alignment - ensure sports enhances rather than competes
    const brandAlignmentScore = Math.min(0.95,
      0.8 + (techContext.reliability * 0.15) - (connectionStrength > 0.9 ? 0.05 : 0)
    );

    return {
      connectionStrength: Math.min(1.0, connectionStrength),
      sharedQualities: parallel.sharedPrinciples,
      educationalEnhancement: Math.min(1.0, educationalEnhancement),
      memorabilityBoost: Math.min(1.0, memorabilityBoost),
      brandAlignmentScore
    };
  }, [intensity]);

  // Update emotional resonance when content or context changes
  useEffect(() => {
    const resonance = calculateEmotionalResonance(currentContent, technicalContext);
    setEmotionalResonance(resonance);
    onEmotionalResonance?.(resonance);
  }, [currentContent, technicalContext, calculateEmotionalResonance, onEmotionalResonance]);

  // Generate dynamic styles based on phase and intensity
  const getDynamicStyles = useCallback(() => {
    const baseIntensity = currentContent.actionMoment.intensityLevel;
    const currentIntensity = baseIntensity + (intensity - baseIntensity) * 0.3;

    return {
      filter: `
        contrast(${1 + currentIntensity * 0.5})
        saturate(${0.9 + currentIntensity * 0.4})
        brightness(${1 + currentIntensity * 0.2})
      `,
      transform: `scale(${1 + currentIntensity * 0.1})`,
      boxShadow: currentIntensity > 0.7 ?
        `0 0 ${currentIntensity * 30}px rgba(139, 92, 246, ${currentIntensity * 0.3})` :
        'none',
      transition: 'all 0.3s ease-out',
      opacity: isVisible ? 1 : 0
    };
  }, [currentContent, intensity, isVisible]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setLoadError(null);
    onContentLoad?.(currentContent.id);
  }, [currentContent.id, onContentLoad]);

  // Handle image error
  const handleImageError = useCallback(() => {
    setLoadError(`Failed to load image for ${phase} phase`);
    setIsLoaded(false);
  }, [phase]);

  // Quality validation
  const validateQuality = useCallback((content: VolleyballContent): boolean => {
    const quality = {
      visualClarity: content.photographySpecs.composition.dynamicBalance,
      composition: (content.photographySpecs.composition.ruleOfThirds ? 0.3 : 0) +
                   (content.photographySpecs.composition.leadingLines ? 0.3 : 0) +
                   content.photographySpecs.composition.dynamicBalance * 0.4,
      technicalAccuracy: content.actionMoment.timingAccuracy,
      emotionalImpact: content.actionMoment.intensityLevel,
      brandAlignment: emotionalResonance?.brandAlignmentScore || 0.8
    };

    return Object.entries(QUALITY_THRESHOLDS).every(([key, threshold]) => {
      const qualityKey = key.replace('minimum', '').replace(/([A-Z])/g, m => m.toLowerCase());
      const actualKey = qualityKey === 'overallquality' ? 'composition' : qualityKey; // Simplified mapping
      return quality[actualKey as keyof typeof quality] >= threshold;
    });
  }, [emotionalResonance]);

  // Render loading state
  if (!isLoaded && !loadError) {
    return (
      <div
        className={`sports-content-loading ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
      >
        <div style={{ color: '#666', fontSize: '14px' }}>
          Loading {phase} sequence...
        </div>
      </div>
    );
  }

  // Render error state
  if (loadError) {
    return (
      <div
        className={`sports-content-error ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}
      >
        <div style={{ color: '#DC2626', fontSize: '14px', marginBottom: '8px' }}>
          Content Error
        </div>
        <div style={{ color: '#666', fontSize: '12px', textAlign: 'center' }}>
          {loadError}
        </div>
      </div>
    );
  }

  // Quality check
  if (!validateQuality(currentContent)) {
    console.warn(`Quality validation failed for ${phase} content`);
  }

  return (
    <div
      className={`phase-specific-sports-content ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: '8px',
        ...getDynamicStyles()
      }}
    >
      {/* Main volleyball image */}
      <img
        src={currentContent.imageUrl}
        alt={currentContent.description}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${currentContent.actionMoment.focusPoint.x}% ${currentContent.actionMoment.focusPoint.y}%`
        }}
        loading="lazy"
      />

      {/* Action intensity overlay */}
      <div
        className="action-intensity-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${currentContent.actionMoment.focusPoint.x}% ${currentContent.actionMoment.focusPoint.y}%,
                      transparent 0%,
                      rgba(0, 0, 0, ${(1 - intensity) * 0.3}) 100%)`,
          pointerEvents: 'none',
          opacity: intensity > 0.5 ? 1 : 0.7,
          transition: 'opacity 0.3s ease-out'
        }}
      />

      {/* Technical parallel overlay (subtle) */}
      {emotionalResonance && emotionalResonance.connectionStrength > 0.8 && (
        <div
          className="technical-parallel-hint"
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '200px',
            opacity: 0.8,
            transition: 'opacity 0.3s ease-out'
          }}
        >
          {currentContent.technicalParallel.memoryAnchor}
        </div>
      )}

      {/* Development debugging overlay */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="sports-content-debug"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '6px 8px',
            borderRadius: '3px',
            fontSize: '9px',
            fontFamily: 'monospace',
            lineHeight: 1.3
          }}
        >
          <div>{phase} ({Math.round(progress * 100)}%)</div>
          <div>I: {Math.round(intensity * 100)}%</div>
          <div>Q: {validateQuality(currentContent) ? '✓' : '✗'}</div>
          {emotionalResonance && (
            <div>R: {Math.round(emotionalResonance.connectionStrength * 100)}%</div>
          )}
        </div>
      )}

      {/* Photography metadata for future reference */}
      <div style={{ display: 'none' }}>
        <script type="application/json">
          {JSON.stringify({
            contentId: currentContent.id,
            phase: currentContent.phase,
            photographySpecs: currentContent.photographySpecs,
            emotionalMetadata: currentContent.emotionalMetadata,
            technicalParallel: currentContent.technicalParallel,
            qualityValidation: validateQuality(currentContent),
            emotionalResonance
          })}
        </script>
      </div>
    </div>
  );
};

export default PhaseSpecificSportsContent;