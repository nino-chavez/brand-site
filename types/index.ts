/**
 * Unified types index - Re-exports from domain-specific type files
 * Replaces the monolithic types.ts while maintaining import compatibility
 */

// Site and navigation types
export * from './site';

// Viewfinder and frame overlay types
export * from './viewfinder';

// Volleyball navigation types
export * from './volleyball';

// Game flow state management types
export * from './game-flow';

// Unified game flow types (from previous refactoring)
export * from './unified-gameflow';

// 2D Canvas layout system types
export * from './canvas';

// Section content optimization types (Phase 3: Content Integration)
export * from './section-content';

// Deprecated - kept for backward compatibility during transition
// TODO: Remove these legacy exports after updating all imports
export type { TechnicalSkill, SkillCategory } from './viewfinder';