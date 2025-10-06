/**
 * Generate Context-Aware Recommendations (Build-time)
 *
 * Creates static recommendation mappings based on portfolio structure.
 * No runtime API calls - all recommendations pre-computed.
 *
 * Output: src/data/recommendations.json
 *
 * @fileoverview Build-time recommendation generator
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';

interface Recommendation {
  sourceSection: string;
  targetSection: string;
  reason: string;
  confidence: number;
  keywords: string[];
}

/**
 * Manually curated recommendations based on logical narrative flow
 * This ensures high-quality, contextually relevant suggestions
 */
const recommendations: Recommendation[] = [
  // From Capture → Focus
  {
    sourceSection: 'capture',
    targetSection: 'focus',
    reason: 'Discover how I translate visual storytelling into enterprise architecture',
    confidence: 0.95,
    keywords: ['storytelling', 'vision', 'strategy']
  },

  // From Capture → Portfolio
  {
    sourceSection: 'capture',
    targetSection: 'portfolio',
    reason: 'See my action sports photography work',
    confidence: 0.90,
    keywords: ['photography', 'action sports', 'visual']
  },

  // From Focus → Frame
  {
    sourceSection: 'focus',
    targetSection: 'frame',
    reason: 'Learn about my technical approach to software architecture',
    confidence: 0.95,
    keywords: ['architecture', 'technical', 'design']
  },

  // From Focus → Develop
  {
    sourceSection: 'focus',
    targetSection: 'develop',
    reason: 'Explore how I implement enterprise-scale solutions',
    confidence: 0.90,
    keywords: ['enterprise', 'implementation', 'scale']
  },

  // From Frame → Develop
  {
    sourceSection: 'frame',
    targetSection: 'develop',
    reason: 'See how architectural patterns come to life in code',
    confidence: 0.95,
    keywords: ['code', 'patterns', 'implementation']
  },

  // From Frame → Exposure
  {
    sourceSection: 'frame',
    targetSection: 'exposure',
    reason: 'Discover my technical expertise and skill depth',
    confidence: 0.90,
    keywords: ['skills', 'expertise', 'technical']
  },

  // From Develop → Exposure
  {
    sourceSection: 'develop',
    targetSection: 'exposure',
    reason: 'View the technical skills behind these projects',
    confidence: 0.90,
    keywords: ['technologies', 'tools', 'skills']
  },

  // From Develop → Portfolio
  {
    sourceSection: 'develop',
    targetSection: 'portfolio',
    reason: 'Check out my complete portfolio of work',
    confidence: 0.85,
    keywords: ['portfolio', 'projects', 'work']
  },

  // From Exposure → Portfolio
  {
    sourceSection: 'exposure',
    targetSection: 'portfolio',
    reason: 'See how these skills apply in real projects',
    confidence: 0.90,
    keywords: ['projects', 'application', 'real-world']
  },

  // From Exposure → Frame
  {
    sourceSection: 'exposure',
    targetSection: 'frame',
    reason: 'Learn how I apply these skills in architecture work',
    confidence: 0.85,
    keywords: ['architecture', 'application', 'practice']
  },

  // From Portfolio → Capture
  {
    sourceSection: 'portfolio',
    targetSection: 'capture',
    reason: 'Learn about my background and what drives my work',
    confidence: 0.80,
    keywords: ['background', 'motivation', 'story']
  },

  // From Portfolio → Develop
  {
    sourceSection: 'portfolio',
    targetSection: 'develop',
    reason: 'Dive deeper into my development projects',
    confidence: 0.85,
    keywords: ['development', 'code', 'projects']
  },

  // Reverse flows for complete coverage

  // From Focus → Capture
  {
    sourceSection: 'focus',
    targetSection: 'capture',
    reason: 'Learn about the foundation of my approach',
    confidence: 0.75,
    keywords: ['foundation', 'background', 'approach']
  },

  // From Frame → Focus
  {
    sourceSection: 'frame',
    targetSection: 'focus',
    reason: 'Understand my strategic thinking process',
    confidence: 0.80,
    keywords: ['strategy', 'thinking', 'approach']
  },

  // From Develop → Frame
  {
    sourceSection: 'develop',
    targetSection: 'frame',
    reason: 'See the architectural patterns I follow',
    confidence: 0.85,
    keywords: ['patterns', 'architecture', 'structure']
  },

  // From Exposure → Focus
  {
    sourceSection: 'exposure',
    targetSection: 'focus',
    reason: 'Learn how I apply strategy to technical work',
    confidence: 0.75,
    keywords: ['strategy', 'application', 'approach']
  },
];

/**
 * Generate recommendations file
 */
function generateRecommendations() {
  console.log('📝 Generating context-aware recommendations...');

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write recommendations to JSON
  const outputPath = path.join(dataDir, 'recommendations.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(recommendations, null, 2)
  );

  console.log(`✅ Generated ${recommendations.length} recommendations`);
  console.log(`📄 Saved to: ${outputPath}`);

  // Generate statistics
  const sectionCounts = recommendations.reduce((acc, rec) => {
    acc[rec.sourceSection] = (acc[rec.sourceSection] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Recommendations by section:');
  Object.entries(sectionCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([section, count]) => {
      console.log(`   ${section}: ${count} recommendations`);
    });

  // Calculate average confidence
  const avgConfidence = recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length;
  console.log(`\n🎯 Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
}

// Run generator
generateRecommendations();
