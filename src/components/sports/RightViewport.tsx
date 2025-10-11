import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VolleyballPhase } from '../../hooks/useVolleyballTiming';
import MorphingTransition from '../effects/MorphingTransition';

export interface RightViewportProps {
  currentPhase: VolleyballPhase;
  phaseProgress: number;
  isPlaying: boolean;
  morphingProgress?: number;
  onActionPointHover?: (pointId: string) => void;
  className?: string;
}

export interface VolleyballSequence {
  phase: VolleyballPhase;
  title: string;
  description: string;
  visualStyle: SequenceVisualStyle;
  players: Player[];
  ball: BallState;
  environment: Environment;
  cameraAngle: CameraAngle;
  lighting: LightingSetup;
}

export interface Player {
  id: string;
  position: { x: number; y: number; z?: number };
  pose: string;
  intensity: number; // 0-1, emotional/physical intensity
  focus: number; // 0-1, mental focus level
  role: 'spiker' | 'setter' | 'blocker' | 'defender' | 'server';
  motion: MotionState;
}

export interface BallState {
  position: { x: number; y: number; z: number };
  trajectory?: TrajectoryPoint[];
  speed: number; // relative speed 0-1
  visibility: number; // 0-1, how prominently shown
  trail: boolean; // show motion trail
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface MotionState {
  type: 'static' | 'approaching' | 'jumping' | 'striking' | 'landing' | 'transitioning';
  direction?: { x: number; y: number };
  velocity: number; // 0-1
  bodyPosition: 'crouched' | 'standing' | 'extended' | 'airborne' | 'follow-through';
}

export interface Environment {
  courtPosition: 'net-side' | 'back-court' | 'service-line' | 'full-court';
  netHeight: number; // relative to view
  floorLines: boolean;
  backgroundBlur: number; // 0-1
  atmosphere: 'calm' | 'tense' | 'explosive' | 'focused' | 'resolved';
}

export interface CameraAngle {
  type: 'wide-shot' | 'medium-shot' | 'close-up' | 'action-shot' | 'freeze-frame';
  height: 'low' | 'eye-level' | 'high' | 'overhead';
  movement: 'static' | 'following' | 'zooming' | 'panning';
  focusPoint: { x: number; y: number };
}

export interface LightingSetup {
  primary: {
    intensity: number;
    angle: number;
    color: string;
  };
  ambient: {
    intensity: number;
    color: string;
  };
  dramatic: boolean;
  shadows: 'soft' | 'hard' | 'none';
}

export interface SequenceVisualStyle {
  primaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  motionBlur: number;
  contrast: number;
  saturation: number;
  intensity: number; // Overall visual intensity 0-1
  emotionalTone: string;
}

// Volleyball sequences for each phase
const VOLLEYBALL_SEQUENCES: Record<VolleyballPhase, VolleyballSequence> = {
  setup: {
    phase: 'setup',
    title: 'Calm Preparation',
    description: 'Players in position, mental preparation, steady breathing',
    visualStyle: {
      primaryColor: '#3b82f6',
      accentColor: '#8b5cf6',
      backgroundGradient: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      motionBlur: 0.1,
      contrast: 1.0,
      saturation: 0.9,
      intensity: 0.2,
      emotionalTone: 'serene'
    },
    players: [
      {
        id: 'setter',
        position: { x: 45, y: 60 },
        pose: 'ready-position',
        intensity: 0.3,
        focus: 0.8,
        role: 'setter',
        motion: {
          type: 'static',
          velocity: 0,
          bodyPosition: 'standing'
        }
      },
      {
        id: 'spiker',
        position: { x: 65, y: 55 },
        pose: 'pre-approach',
        intensity: 0.2,
        focus: 0.7,
        role: 'spiker',
        motion: {
          type: 'static',
          velocity: 0,
          bodyPosition: 'standing'
        }
      },
      {
        id: 'blocker',
        position: { x: 35, y: 35 },
        pose: 'watching',
        intensity: 0.2,
        focus: 0.6,
        role: 'blocker',
        motion: {
          type: 'static',
          velocity: 0,
          bodyPosition: 'standing'
        }
      }
    ],
    ball: {
      position: { x: 20, y: 70, z: 0.1 },
      speed: 0.1,
      visibility: 0.6,
      trail: false
    },
    environment: {
      courtPosition: 'full-court',
      netHeight: 0.4,
      floorLines: true,
      backgroundBlur: 0.2,
      atmosphere: 'calm'
    },
    cameraAngle: {
      type: 'wide-shot',
      height: 'eye-level',
      movement: 'static',
      focusPoint: { x: 50, y: 50 }
    },
    lighting: {
      primary: { intensity: 0.8, angle: 45, color: '#ffffff' },
      ambient: { intensity: 0.6, color: '#f0f9ff' },
      dramatic: false,
      shadows: 'soft'
    }
  },
  anticipation: {
    phase: 'anticipation',
    title: 'Building Tension',
    description: 'Muscles tensing, eyes focused, preparing for explosive movement',
    visualStyle: {
      primaryColor: '#ec4899',
      accentColor: '#f59e0b',
      backgroundGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fef3c7 100%)',
      motionBlur: 0.2,
      contrast: 1.1,
      saturation: 1.0,
      intensity: 0.4,
      emotionalTone: 'anticipatory'
    },
    players: [
      {
        id: 'setter',
        position: { x: 45, y: 60 },
        pose: 'pre-set',
        intensity: 0.5,
        focus: 0.9,
        role: 'setter',
        motion: {
          type: 'transitioning',
          velocity: 0.2,
          bodyPosition: 'crouched'
        }
      },
      {
        id: 'spiker',
        position: { x: 70, y: 55 },
        pose: 'approach-ready',
        intensity: 0.6,
        focus: 0.9,
        role: 'spiker',
        motion: {
          type: 'transitioning',
          direction: { x: -1, y: 0 },
          velocity: 0.3,
          bodyPosition: 'crouched'
        }
      },
      {
        id: 'blocker',
        position: { x: 35, y: 32 },
        pose: 'reading',
        intensity: 0.5,
        focus: 0.8,
        role: 'blocker',
        motion: {
          type: 'static',
          velocity: 0,
          bodyPosition: 'crouched'
        }
      }
    ],
    ball: {
      position: { x: 25, y: 65, z: 0.2 },
      speed: 0.3,
      visibility: 0.8,
      trail: false
    },
    environment: {
      courtPosition: 'net-side',
      netHeight: 0.45,
      floorLines: true,
      backgroundBlur: 0.3,
      atmosphere: 'tense'
    },
    cameraAngle: {
      type: 'medium-shot',
      height: 'eye-level',
      movement: 'following',
      focusPoint: { x: 55, y: 55 }
    },
    lighting: {
      primary: { intensity: 0.9, angle: 35, color: '#fef3c7' },
      ambient: { intensity: 0.5, color: '#fdf2f8' },
      dramatic: true,
      shadows: 'soft'
    }
  },
  approach: {
    phase: 'approach',
    title: 'Explosive Movement',
    description: 'Powerful strides toward net, building momentum and timing',
    visualStyle: {
      primaryColor: '#059669',
      accentColor: '#dc2626',
      backgroundGradient: 'linear-gradient(135deg, #ecfdf5 0%, #fef2f2 100%)',
      motionBlur: 0.4,
      contrast: 1.2,
      saturation: 1.1,
      intensity: 0.6,
      emotionalTone: 'dynamic'
    },
    players: [
      {
        id: 'setter',
        position: { x: 45, y: 58 },
        pose: 'setting-motion',
        intensity: 0.7,
        focus: 0.95,
        role: 'setter',
        motion: {
          type: 'striking',
          velocity: 0.6,
          bodyPosition: 'extended'
        }
      },
      {
        id: 'spiker',
        position: { x: 60, y: 50 },
        pose: 'approach-stride',
        intensity: 0.8,
        focus: 0.9,
        role: 'spiker',
        motion: {
          type: 'approaching',
          direction: { x: -1, y: -0.2 },
          velocity: 0.7,
          bodyPosition: 'extended'
        }
      },
      {
        id: 'blocker',
        position: { x: 38, y: 30 },
        pose: 'preparing-jump',
        intensity: 0.6,
        focus: 0.8,
        role: 'blocker',
        motion: {
          type: 'transitioning',
          velocity: 0.4,
          bodyPosition: 'crouched'
        }
      }
    ],
    ball: {
      position: { x: 48, y: 45, z: 0.6 },
      trajectory: [
        { x: 25, y: 65, z: 0.2, timestamp: 0 },
        { x: 35, y: 55, z: 0.4, timestamp: 0.3 },
        { x: 48, y: 45, z: 0.6, timestamp: 0.7 }
      ],
      speed: 0.6,
      visibility: 0.9,
      trail: true
    },
    environment: {
      courtPosition: 'net-side',
      netHeight: 0.5,
      floorLines: true,
      backgroundBlur: 0.4,
      atmosphere: 'explosive'
    },
    cameraAngle: {
      type: 'action-shot',
      height: 'low',
      movement: 'following',
      focusPoint: { x: 55, y: 45 }
    },
    lighting: {
      primary: { intensity: 1.0, angle: 25, color: '#ffffff' },
      ambient: { intensity: 0.4, color: '#ecfdf5' },
      dramatic: true,
      shadows: 'hard'
    }
  },
  spike: {
    phase: 'spike',
    title: 'Critical Execution',
    description: 'Peak of jump, arm cocked back, moment before contact',
    visualStyle: {
      primaryColor: '#dc2626',
      accentColor: '#f59e0b',
      backgroundGradient: 'linear-gradient(135deg, #fef2f2 0%, #fffbeb 100%)',
      motionBlur: 0.3,
      contrast: 1.3,
      saturation: 1.2,
      intensity: 0.8,
      emotionalTone: 'explosive'
    },
    players: [
      {
        id: 'setter',
        position: { x: 45, y: 58 },
        pose: 'follow-through',
        intensity: 0.6,
        focus: 0.8,
        role: 'setter',
        motion: {
          type: 'landing',
          velocity: 0.3,
          bodyPosition: 'follow-through'
        }
      },
      {
        id: 'spiker',
        position: { x: 52, y: 42 },
        pose: 'peak-spike',
        intensity: 0.95,
        focus: 1.0,
        role: 'spiker',
        motion: {
          type: 'striking',
          velocity: 0.9,
          bodyPosition: 'airborne'
        }
      },
      {
        id: 'blocker',
        position: { x: 42, y: 28 },
        pose: 'jumping-block',
        intensity: 0.8,
        focus: 0.9,
        role: 'blocker',
        motion: {
          type: 'jumping',
          velocity: 0.7,
          bodyPosition: 'airborne'
        }
      }
    ],
    ball: {
      position: { x: 50, y: 38, z: 0.8 },
      speed: 0.8,
      visibility: 1.0,
      trail: false
    },
    environment: {
      courtPosition: 'net-side',
      netHeight: 0.55,
      floorLines: false,
      backgroundBlur: 0.6,
      atmosphere: 'explosive'
    },
    cameraAngle: {
      type: 'close-up',
      height: 'high',
      movement: 'zooming',
      focusPoint: { x: 52, y: 40 }
    },
    lighting: {
      primary: { intensity: 1.2, angle: 15, color: '#fff7ed' },
      ambient: { intensity: 0.3, color: '#fef2f2' },
      dramatic: true,
      shadows: 'hard'
    }
  },
  impact: {
    phase: 'impact',
    title: 'Moment of Contact',
    description: 'Hand meets ball, maximum force transfer, decisive moment',
    visualStyle: {
      primaryColor: '#7c3aed',
      accentColor: '#06b6d4',
      backgroundGradient: 'linear-gradient(135deg, #f3e8ff 0%, #cffafe 100%)',
      motionBlur: 0.1, // Freeze-frame effect
      contrast: 1.5,
      saturation: 1.3,
      intensity: 1.0,
      emotionalTone: 'climactic'
    },
    players: [
      {
        id: 'setter',
        position: { x: 45, y: 60 },
        pose: 'watching',
        intensity: 0.4,
        focus: 1.0,
        role: 'setter',
        motion: {
          type: 'static',
          velocity: 0,
          bodyPosition: 'standing'
        }
      },
      {
        id: 'spiker',
        position: { x: 50, y: 40 },
        pose: 'contact-moment',
        intensity: 1.0,
        focus: 1.0,
        role: 'spiker',
        motion: {
          type: 'striking',
          velocity: 1.0,
          bodyPosition: 'airborne'
        }
      },
      {
        id: 'blocker',
        position: { x: 40, y: 26 },
        pose: 'defensive-reach',
        intensity: 0.9,
        focus: 1.0,
        role: 'blocker',
        motion: {
          type: 'static',
          velocity: 0,
          bodyPosition: 'airborne'
        }
      }
    ],
    ball: {
      position: { x: 49, y: 35, z: 0.9 },
      speed: 1.0,
      visibility: 1.0,
      trail: false
    },
    environment: {
      courtPosition: 'net-side',
      netHeight: 0.6,
      floorLines: false,
      backgroundBlur: 0.8,
      atmosphere: 'focused'
    },
    cameraAngle: {
      type: 'freeze-frame',
      height: 'high',
      movement: 'static',
      focusPoint: { x: 49, y: 37 }
    },
    lighting: {
      primary: { intensity: 1.5, angle: 10, color: '#ffffff' },
      ambient: { intensity: 0.2, color: '#f3e8ff' },
      dramatic: true,
      shadows: 'hard'
    }
  },
  'follow-through': {
    phase: 'follow-through',
    title: 'Aftermath & Flow',
    description: 'Natural completion of movement, body coordination, team dynamics',
    visualStyle: {
      primaryColor: '#059669',
      accentColor: '#8b5cf6',
      backgroundGradient: 'linear-gradient(135deg, #ecfdf5 0%, #f9fafb 100%)',
      motionBlur: 0.25,
      contrast: 1.0,
      saturation: 0.9,
      intensity: 0.35,
      emotionalTone: 'resolved'
    },
    players: [
      {
        id: 'setter',
        position: { x: 45, y: 62 },
        pose: 'ready-recovery',
        intensity: 0.4,
        focus: 0.7,
        role: 'setter',
        motion: {
          type: 'transitioning',
          velocity: 0.2,
          bodyPosition: 'standing'
        }
      },
      {
        id: 'spiker',
        position: { x: 48, y: 50 },
        pose: 'landing-follow-through',
        intensity: 0.5,
        focus: 0.6,
        role: 'spiker',
        motion: {
          type: 'landing',
          velocity: 0.4,
          bodyPosition: 'follow-through'
        }
      },
      {
        id: 'blocker',
        position: { x: 38, y: 32 },
        pose: 'recovery',
        intensity: 0.3,
        focus: 0.5,
        role: 'blocker',
        motion: {
          type: 'landing',
          velocity: 0.3,
          bodyPosition: 'standing'
        }
      },
      {
        id: 'defender',
        position: { x: 25, y: 75 },
        pose: 'ready-position',
        intensity: 0.6,
        focus: 0.8,
        role: 'defender',
        motion: {
          type: 'transitioning',
          velocity: 0.4,
          bodyPosition: 'crouched'
        }
      }
    ],
    ball: {
      position: { x: 15, y: 80, z: 0.1 },
      trajectory: [
        { x: 49, y: 35, z: 0.9, timestamp: 0 },
        { x: 35, y: 55, z: 0.5, timestamp: 0.3 },
        { x: 20, y: 75, z: 0.2, timestamp: 0.6 },
        { x: 15, y: 80, z: 0.1, timestamp: 0.8 }
      ],
      speed: 0.4,
      visibility: 0.7,
      trail: true
    },
    environment: {
      courtPosition: 'back-court',
      netHeight: 0.35,
      floorLines: true,
      backgroundBlur: 0.2,
      atmosphere: 'resolved'
    },
    cameraAngle: {
      type: 'wide-shot',
      height: 'eye-level',
      movement: 'panning',
      focusPoint: { x: 35, y: 65 }
    },
    lighting: {
      primary: { intensity: 0.8, angle: 40, color: '#ffffff' },
      ambient: { intensity: 0.7, color: '#ecfdf5' },
      dramatic: false,
      shadows: 'soft'
    }
  }
};

export const RightViewport: React.FC<RightViewportProps> = ({
  currentPhase,
  phaseProgress,
  isPlaying,
  morphingProgress = 0,
  onActionPointHover,
  className = ''
}) => {
  const [isInteractive, setIsInteractive] = useState(false);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const [showTrajectory, setShowTrajectory] = useState(false);

  const currentSequence = useMemo(() => VOLLEYBALL_SEQUENCES[currentPhase], [currentPhase]);

  const handlePlayerHover = useCallback((playerId: string | null) => {
    setHoveredPlayer(playerId);
    if (playerId && onActionPointHover) {
      onActionPointHover(playerId);
    }
  }, [onActionPointHover]);

  const renderPlayer = useCallback((player: Player) => {
    const isHovered = hoveredPlayer === player.id;
    const intensity = currentSequence.visualStyle.intensity;

    // Calculate dynamic styles based on phase intensity and player state
    const scale = 1 + player.intensity * 0.3 + intensity * 0.2;
    const glowIntensity = player.intensity * intensity;
    const focusIndicator = player.focus;

    const getPlayerEmoji = (role: Player['role'], pose: string, intensity: number) => {
      const baseEmojis = {
        spiker: '🏐',
        setter: '🙌',
        blocker: '🛡️',
        defender: '🤸',
        server: '✋'
      };

      // Intensity-based variations could be added here
      return baseEmojis[role] || '👤';
    };

    const getIntensityColor = (intensity: number) => {
      if (intensity < 0.3) return '#64748b';
      if (intensity < 0.6) return '#3b82f6';
      if (intensity < 0.8) return '#f59e0b';
      return '#dc2626';
    };

    return (
      <div
        key={player.id}
        className="volleyball-player absolute cursor-pointer transition-all duration-300"
        style={{
          left: `${player.position.x}%`,
          top: `${player.position.y}%`,
          transform: `scale(${scale}) ${isHovered ? 'scale(1.2)' : ''}`,
          zIndex: player.position.z ? Math.round(player.position.z * 10) : 1
        }}
        onMouseEnter={() => handlePlayerHover(player.id)}
        onMouseLeave={() => handlePlayerHover(null)}
      >
        {/* Player representation */}
        <div
          className="player-avatar w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300"
          style={{
            backgroundColor: `${getIntensityColor(player.intensity)}20`,
            border: `3px solid ${getIntensityColor(player.intensity)}`,
            boxShadow: `0 4px 12px rgba(139, 92, 246, ${glowIntensity * 0.4}),
                       0 0 ${glowIntensity * 30}px rgba(139, 92, 246, ${glowIntensity * 0.3})`,
            filter: isHovered ? 'brightness(1.3) contrast(1.2)' : 'brightness(1) contrast(1)'
          }}
        >
          {getPlayerEmoji(player.role, player.pose, player.intensity)}
        </div>

        {/* Intensity indicator */}
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
          style={{
            backgroundColor: getIntensityColor(player.intensity),
            opacity: player.intensity
          }}
        />

        {/* Focus indicator */}
        <div
          className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-yellow-400"
          style={{ opacity: player.focus }}
        />

        {/* Motion trail */}
        {player.motion.velocity > 0.5 && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: `${getIntensityColor(player.intensity)}40`,
              animationDuration: `${2 - player.motion.velocity}s`
            }}
          />
        )}

        {/* Player details tooltip */}
        {isHovered && (
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black text-white text-xs p-2 rounded shadow-lg z-20 whitespace-nowrap"
            style={{ minWidth: '100px' }}
          >
            <div className="font-semibold mb-1">{player.role.charAt(0).toUpperCase() + player.role.slice(1)}</div>
            <div>Intensity: {Math.round(player.intensity * 100)}%</div>
            <div>Focus: {Math.round(player.focus * 100)}%</div>
            <div>Pose: {player.pose}</div>
            <div>Motion: {player.motion.type}</div>
          </div>
        )}
      </div>
    );
  }, [hoveredPlayer, currentSequence, handlePlayerHover]);

  const renderBall = useCallback(() => {
    const ball = currentSequence.ball;
    const intensity = currentSequence.visualStyle.intensity;

    return (
      <div
        className="volleyball-ball absolute transition-all duration-300"
        style={{
          left: `${ball.position.x}%`,
          top: `${ball.position.y}%`,
          transform: `translateZ(${ball.position.z * 100}px) scale(${1 + ball.speed * 0.5})`,
          zIndex: Math.round(ball.position.z * 10) + 5
        }}
      >
        {/* Ball */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-lg transition-all duration-300"
          style={{
            backgroundColor: '#f59e0b',
            border: '2px solid #ffffff',
            boxShadow: `0 2px 8px rgba(245, 158, 11, ${ball.visibility * 0.6}),
                       0 0 ${intensity * 20}px rgba(245, 158, 11, ${intensity * 0.4})`,
            opacity: ball.visibility
          }}
        >
          🏐
        </div>

        {/* Motion trail */}
        {ball.trail && ball.trajectory && (
          <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
            <path
              d={`M ${ball.trajectory.map(point => `${point.x - ball.position.x},${point.y - ball.position.y}`).join(' L ')}`}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeOpacity={0.6}
              fill="none"
              strokeDasharray="4,4"
            />
          </svg>
        )}
      </div>
    );
  }, [currentSequence]);

  const renderCourt = useCallback(() => {
    const env = currentSequence.environment;
    const camera = currentSequence.cameraAngle;

    return (
      <div className="court-elements absolute inset-0 pointer-events-none">
        {/* Net */}
        <div
          className="net absolute bg-white opacity-60"
          style={{
            left: '48%',
            top: `${env.netHeight * 100 - 20}%`,
            width: '4px',
            height: '40%',
            transform: 'translateX(-50%)'
          }}
        />

        {/* Court lines */}
        {env.floorLines && (
          <>
            {/* Center line */}
            <div
              className="court-line absolute bg-white opacity-40"
              style={{
                left: '0',
                top: '50%',
                width: '100%',
                height: '2px',
                transform: 'translateY(-50%)'
              }}
            />
            {/* Attack lines */}
            <div
              className="court-line absolute bg-white opacity-30"
              style={{
                left: '0',
                top: '30%',
                width: '100%',
                height: '1px'
              }}
            />
            <div
              className="court-line absolute bg-white opacity-30"
              style={{
                left: '0',
                top: '70%',
                width: '100%',
                height: '1px'
              }}
            />
          </>
        )}

        {/* Focus point indicator */}
        {camera.focusPoint && (
          <div
            className="focus-point absolute w-2 h-2 rounded-full bg-brand-violet opacity-50"
            style={{
              left: `${camera.focusPoint.x}%`,
              top: `${camera.focusPoint.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </div>
    );
  }, [currentSequence]);

  const renderLighting = useCallback(() => {
    const lighting = currentSequence.lighting;
    const intensity = currentSequence.visualStyle.intensity;

    if (!lighting.dramatic) return null;

    return (
      <div className="lighting-effects absolute inset-0 pointer-events-none">
        {/* Dramatic lighting gradient */}
        <div
          className="lighting-overlay absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at ${lighting.primary.angle}% 20%,
                        ${lighting.primary.color}${Math.round(lighting.primary.intensity * intensity * 20).toString(16).padStart(2, '0')} 0%,
                        transparent 60%)`,
            mixBlendMode: 'overlay'
          }}
        />

        {/* Hard shadows */}
        {lighting.shadows === 'hard' && (
          <div
            className="shadow-overlay absolute inset-0"
            style={{
              background: `linear-gradient(${lighting.primary.angle + 90}deg,
                          transparent 0%,
                          rgba(0, 0, 0, ${intensity * 0.3}) 70%,
                          rgba(0, 0, 0, ${intensity * 0.5}) 100%)`,
              mixBlendMode: 'multiply'
            }}
          />
        )}
      </div>
    );
  }, [currentSequence]);

  return (
    <MorphingTransition
      fromPhase={currentPhase}
      toPhase={currentPhase}
      progress={morphingProgress}
      className={`right-viewport volleyball-viewport ${className}`}
    >
      <div
        className="w-full h-full relative overflow-hidden"
        style={{
          background: currentSequence.visualStyle.backgroundGradient,
          filter: `contrast(${currentSequence.visualStyle.contrast}) saturate(${currentSequence.visualStyle.saturation})`,
          transition: 'background 0.6s ease-out, filter 0.6s ease-out'
        }}
        onMouseEnter={() => setIsInteractive(true)}
        onMouseLeave={() => setIsInteractive(false)}
      >
        {/* Sequence title */}
        <div
          className="absolute top-4 left-4 z-10 text-2xl font-bold text-gray-800 transition-all duration-300"
          style={{
            opacity: 0.8 + currentSequence.visualStyle.intensity * 0.2,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {currentSequence.title}
        </div>

        {/* Emotional tone indicator */}
        <div
          className="absolute top-4 right-4 z-10 text-sm font-medium px-4 py-1 rounded-full bg-white bg-opacity-80"
          style={{ color: currentSequence.visualStyle.primaryColor }}
        >
          {currentSequence.visualStyle.emotionalTone}
        </div>

        {/* Court elements */}
        {renderCourt()}

        {/* Lighting effects */}
        {renderLighting()}

        {/* Ball */}
        {renderBall()}

        {/* Players */}
        <div className="players-layer absolute inset-0">
          {currentSequence.players.map(renderPlayer)}
        </div>

        {/* Motion blur overlay */}
        {currentSequence.visualStyle.motionBlur > 0.3 && (
          <div
            className="motion-blur-overlay absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, transparent 30%, rgba(255, 255, 255, ${currentSequence.visualStyle.motionBlur * 0.1}) 100%)`,
              filter: `blur(${currentSequence.visualStyle.motionBlur * 2}px)`,
              opacity: 0.3
            }}
          />
        )}

        {/* Interactive overlay */}
        {isInteractive && (
          <div
            className="interactive-overlay absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 70%)`,
              opacity: 0.5
            }}
          />
        )}

        {/* Trajectory toggle */}
        <button
          className="absolute bottom-4 right-4 z-10 px-4 py-1 bg-black bg-opacity-50 text-white rounded text-xs"
          onClick={() => setShowTrajectory(!showTrajectory)}
        >
          {showTrajectory ? 'Hide' : 'Show'} Trajectory
        </button>

        {/* Development debug info - hidden for clean UI */}
        {false && process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white bg-opacity-75 p-2 rounded">
            <div>Phase: {currentPhase}</div>
            <div>Progress: {Math.round(phaseProgress * 100)}%</div>
            <div>Players: {currentSequence.players.length}</div>
            <div>Intensity: {currentSequence.visualStyle.intensity}</div>
            <div>Camera: {currentSequence.cameraAngle.type}</div>
            <div>Atmosphere: {currentSequence.environment.atmosphere}</div>
            {hoveredPlayer && <div>Hovered: {hoveredPlayer}</div>}
          </div>
        )}
      </div>
    </MorphingTransition>
  );
};

export default RightViewport;