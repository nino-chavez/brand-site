import React from 'react';
import Section from './Section';
import VolleyballTimingDemo from './VolleyballTimingDemo';

interface VolleyballDemoSectionProps {
  setRef: (el: HTMLDivElement | null) => void;
}

const VolleyballDemoSection: React.FC<VolleyballDemoSectionProps> = ({ setRef }) => {
  return (
    <Section
      id="volleyball-demo"
      title="Technical Excellence Through Athletic Metaphor"
      subtitle="An Interactive demonstration of how volleyball timing creates memorable connections with technical concepts"
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      setRef={setRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-300 mb-6">
              This interactive system demonstrates how athletic excellence communicates technical mastery.
              Watch as volleyball phases mirror software development stages, creating powerful memory anchors
              for complex technical concepts.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-400">
              <span className="px-3 py-1 bg-gray-800 rounded-full">Frame-Perfect Synchronization</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full">Visual Continuity System</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full">Emotional Journey Mapping</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full">Professional Photography Standards</span>
            </div>
          </div>
        </div>

        {/* Main Demo */}
        <div className="mb-12">
          <VolleyballTimingDemo className="w-full" />
        </div>

        {/* Technical Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Frame Synchronization</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Sub-16ms frame consistency with automatic drift correction across dual viewports.
              Athletic rhythm curves ensure natural timing that feels authentic to sports dynamics.
            </p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Emotional Journey</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Complete narrative arc from calm preparation through building tension to crystallized impact and resolution.
              Each phase creates memorable associations with technical concepts.
            </p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Visual Continuity</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Professional photography standards with seamless transitions. Advanced color interpolation,
              scale progression, and lighting effects maintain visual coherence throughout the sequence.
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Real-World Applications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800 bg-opacity-30 rounded-lg p-6 text-left">
              <h4 className="text-lg font-semibold text-white mb-3">Technical Documentation</h4>
              <p className="text-gray-300 text-sm">
                Transform complex architectural diagrams into memorable visual journeys.
                Help teams understand system evolution through intuitive sports metaphors.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-30 rounded-lg p-6 text-left">
              <h4 className="text-lg font-semibold text-white mb-3">Client Presentations</h4>
              <p className="text-gray-300 text-sm">
                Communicate technical excellence to stakeholders using universally understood
                concepts of athletic precision, teamwork, and peak performance.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-30 rounded-lg p-6 text-left">
              <h4 className="text-lg font-semibold text-white mb-3">Educational Content</h4>
              <p className="text-gray-300 text-sm">
                Create lasting learning experiences where technical concepts become
                emotionally resonant through athletic achievement parallels.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-30 rounded-lg p-6 text-left">
              <h4 className="text-lg font-semibold text-white mb-3">Brand Communication</h4>
              <p className="text-gray-300 text-sm">
                Differentiate technical services by connecting with audiences through
                shared appreciation for excellence, precision, and coordinated execution.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Implementation Note */}
        <div className="mt-16 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-semibold text-blue-300 mb-2">Technical Implementation</h4>
              <p className="text-blue-100 text-sm leading-relaxed">
                Built with React, TypeScript, and Vitest. Features comprehensive test coverage including
                integration tests, performance monitoring, accessibility validation, and emotional impact verification.
                The system demonstrates advanced concepts in synchronized animation, visual continuity,
                and user experience design.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default VolleyballDemoSection;