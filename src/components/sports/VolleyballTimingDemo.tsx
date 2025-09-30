import React, { useState, useCallback, useEffect } from 'react';
import { VisualContinuitySystem } from './VisualContinuitySystem';
import { SportsSequenceController } from './SportsSequenceController';
import { PhaseSpecificSportsContent } from './PhaseSpecificSportsContent';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';

interface VolleyballTimingDemoProps {
  className?: string;
}

const VolleyballTimingDemo: React.FC<VolleyballTimingDemoProps> = ({
  className = ''
}) => {
  // State management
  const [currentPhase, setCurrentPhase] = useState<VolleyballPhase>('setup');
  const [previousPhase, setPreviousPhase] = useState<VolleyballPhase | undefined>();
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [visualIntensity, setVisualIntensity] = useState(0.2);
  const [leftViewportFrame, setLeftViewportFrame] = useState(0);
  const [rightViewportFrame, setRightViewportFrame] = useState(0);

  // Demo control state
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [systemStats, setSystemStats] = useState({
    syncEvents: 0,
    transitionEvents: 0,
    continuityScore: 0.85
  });

  const phases: VolleyballPhase[] = ['setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'];

  // Phase durations (in seconds)
  const phaseDurations: Record<VolleyballPhase, number> = {
    'setup': 3,
    'anticipation': 2.5,
    'approach': 2,
    'spike': 1.5,
    'impact': 1,
    'follow-through': 4
  };

  // Auto-progression logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPhaseProgress(prev => {
        const increment = (0.02 * playbackSpeed);
        const newProgress = Math.min(prev + increment, 1.0);

        if (newProgress >= 1.0) {
          // Move to next phase
          const currentIndex = phases.indexOf(currentPhase);
          if (currentIndex < phases.length - 1) {
            const nextPhase = phases[currentIndex + 1];

            setPreviousPhase(currentPhase);
            setCurrentPhase(nextPhase);
            setPhaseProgress(0);
            setIsTransitioning(true);
            setTransitionProgress(0);

            // Start transition animation
            setTimeout(() => {
              setIsTransitioning(false);
              setTransitionProgress(0);
            }, 300);
          } else {
            // Sequence complete
            setIsPlaying(false);
            setPhaseProgress(0);
          }
          return 0;
        }
        return newProgress;
      });

      // Simulate viewport frame updates
      setLeftViewportFrame(prev => prev + 1);
      setRightViewportFrame(prev => prev + (Math.random() > 0.95 ? 2 : 1));
    }, 50 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentPhase, phases, playbackSpeed]);

  // Event handlers
  const handleSyncUpdate = useCallback((syncData: any) => {
    setSystemStats(prev => ({ ...prev, syncEvents: prev.syncEvents + 1 }));
  }, []);

  const handleIntensityChange = useCallback((intensity: number) => {
    setVisualIntensity(intensity);
  }, []);

  const handleTransitionComplete = useCallback((phase: VolleyballPhase) => {
    setSystemStats(prev => ({ ...prev, transitionEvents: prev.transitionEvents + 1 }));
  }, []);

  const handleContinuityMetrics = useCallback((metrics: any) => {
    setSystemStats(prev => ({ ...prev, continuityScore: metrics.overallScore }));
  }, []);

  const handleContentLoad = useCallback((contentId: string) => {
    console.log(`Content loaded: ${contentId}`);
  }, []);

  // Control functions
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentPhase('setup');
    setPreviousPhase(undefined);
    setPhaseProgress(0);
    setIsTransitioning(false);
    setTransitionProgress(0);
    setVisualIntensity(0.2);
    setSystemStats({ syncEvents: 0, transitionEvents: 0, continuityScore: 0.85 });
  };

  const jumpToPhase = (phase: VolleyballPhase) => {
    const prevPhaseIndex = phases.indexOf(currentPhase);
    const newPhaseIndex = phases.indexOf(phase);

    if (prevPhaseIndex !== newPhaseIndex) {
      setPreviousPhase(currentPhase);
      setCurrentPhase(phase);
      setPhaseProgress(0);

      if (isPlaying) {
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    }
  };

  // Technical context for sports content
  const technicalContext = {
    concept: `Technical Excellence: ${currentPhase} Phase`,
    complexity: Math.min(1.0, phaseProgress * 0.7 + 0.3),
    performance: visualIntensity,
    scalability: Math.min(1.0, phaseProgress * 0.5 + 0.4),
    reliability: 0.9
  };

  return (
    <div className={`volleyball-timing-demo ${className}`}>
      {/* Demo Header */}
      <div className="demo-header mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Volleyball Timing System Demo
            </h2>
            <p className="text-gray-300 text-sm">
              Experience how athletic excellence communicates technical mastery
            </p>
          </div>
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors"
          >
            {showDebugInfo ? 'Hide' : 'Show'} Debug
          </button>
        </div>

        {/* Control Panel */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={togglePlayback}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={resetDemo}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Speed:</label>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </div>

          <div className="text-sm text-gray-300">
            Intensity: <span className="text-yellow-400 font-mono">{Math.round(visualIntensity * 100)}%</span>
          </div>
        </div>

        {/* Phase Navigation */}
        <div className="flex gap-2 mb-4">
          {phases.map((phase) => (
            <button
              key={phase}
              onClick={() => jumpToPhase(phase)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                currentPhase === phase
                  ? 'bg-yellow-500 text-black font-medium'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {phase.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-yellow-500 h-2 rounded-full transition-all duration-200"
            style={{ width: `${phaseProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Main Demo Display */}
      <div
        className="demo-display relative bg-black rounded-lg overflow-hidden"
        style={{ height: '500px' }}
      >
        <VisualContinuitySystem
          currentPhase={currentPhase}
          previousPhase={previousPhase}
          transitionProgress={transitionProgress}
          isTransitioning={isTransitioning}
          visualIntensity={visualIntensity}
          onTransitionComplete={handleTransitionComplete}
          onContinuityMetrics={handleContinuityMetrics}
        >
          <SportsSequenceController
            currentPhase={currentPhase}
            phaseProgress={phaseProgress}
            isPlaying={isPlaying}
            leftViewportFrame={leftViewportFrame}
            rightViewportFrame={rightViewportFrame}
            onSyncUpdate={handleSyncUpdate}
            onIntensityChange={handleIntensityChange}
          >
            <PhaseSpecificSportsContent
              phase={currentPhase}
              progress={phaseProgress}
              intensity={visualIntensity}
              isVisible={true}
              technicalContext={technicalContext}
              onContentLoad={handleContentLoad}
            />
          </SportsSequenceController>
        </VisualContinuitySystem>

        {/* Phase Information Overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 rounded-lg p-4 text-white">
          <div className="text-lg font-semibold mb-2 capitalize">
            {currentPhase.replace('-', ' ')} Phase
          </div>
          <div className="text-sm text-gray-300 mb-2">
            {getPhaseDescription(currentPhase)}
          </div>
          <div className="text-xs text-yellow-400">
            {getTechnicalParallel(currentPhase)}
          </div>
        </div>

        {/* System Stats (if debug enabled) */}
        {showDebugInfo && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-80 rounded-lg p-3 text-white font-mono text-xs">
            <div>Phase: {currentPhase} ({Math.round(phaseProgress * 100)}%)</div>
            <div>Intensity: {Math.round(visualIntensity * 100)}%</div>
            <div>Sync Events: {systemStats.syncEvents}</div>
            <div>Transitions: {systemStats.transitionEvents}</div>
            <div>Continuity: {Math.round(systemStats.continuityScore * 100)}%</div>
            <div>Frame L/R: {leftViewportFrame}/{rightViewportFrame}</div>
            {isTransitioning && (
              <div className="text-yellow-400">Transitioning...</div>
            )}
          </div>
        )}
      </div>

      {/* Educational Content */}
      <div className="demo-education mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">
            System Features
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• Frame-perfect synchronization between viewports</li>
            <li>• Athletic rhythm intensity curves</li>
            <li>• Seamless visual transitions</li>
            <li>• Professional photography standards</li>
            <li>• Emotional journey narrative arc</li>
            <li>• Performance monitoring and optimization</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">
            Technical Excellence Through Sports
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• <strong>Setup:</strong> Foundation planning & architecture</li>
            <li>• <strong>Anticipation:</strong> System complexity emergence</li>
            <li>• <strong>Approach:</strong> Performance optimization</li>
            <li>• <strong>Spike:</strong> Critical system preparation</li>
            <li>• <strong>Impact:</strong> Production excellence</li>
            <li>• <strong>Follow-through:</strong> Continuous improvement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getPhaseDescription(phase: VolleyballPhase): string {
  const descriptions = {
    'setup': 'Careful positioning and mental preparation for optimal performance',
    'anticipation': 'Building tension and focus as complexity emerges',
    'approach': 'Explosive momentum building with precise timing',
    'spike': 'Peak athletic preparation for decisive action',
    'impact': 'Crystallized moment of perfect execution',
    'follow-through': 'Natural completion and coordinated team dynamics'
  };
  return descriptions[phase];
}

function getTechnicalParallel(phase: VolleyballPhase): string {
  const parallels = {
    'setup': 'Like system architecture - strong foundations enable peak performance',
    'anticipation': 'Like complexity emergence - heightened awareness prepares for challenges',
    'approach': 'Like performance optimization - coordinated momentum toward efficiency',
    'spike': 'Like critical optimization - peak preparation for decisive execution',
    'impact': 'Like production excellence - crystallized moment of flawless delivery',
    'follow-through': 'Like continuous monitoring - natural completion and ongoing improvement'
  };
  return parallels[phase];
}

export default VolleyballTimingDemo;