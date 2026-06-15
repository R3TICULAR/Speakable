/**
 * Runtime Accessibility Timeline - Public API
 *
 * Exports all public types, interfaces, and factory functions for the
 * Runtime Accessibility Engine. This module provides:
 *
 * - Event type system (EventType, AccessibilityEvent, payloads)
 * - Runtime engine (createEngine)
 * - Timeline generation (createTimelineGenerator)
 * - Interaction execution (executeAction, executeSequence)
 * - Built-in patterns (getBuiltinPattern)
 * - Heuristic analysis (createHeuristicAnalyzer)
 * - Serialization (serializeTimeline, deserializeTimeline, etc.)
 * - Stable CSS selector generation (generateSelector)
 */

// Types and interfaces
export * from './types.js';

// Engine
export { createEngine } from './engine.js';
export type { EngineOptions, RuntimeAccessibilityEngine } from './engine.js';

// Timeline Generator
export { createTimelineGenerator } from './timeline-generator.js';
export type { TimelineGeneratorOptions, TimelineGenerator } from './timeline-generator.js';

// Interaction execution
export { executeAction, executeSequence } from './interactions.js';

// Built-in interaction patterns
export { getBuiltinPattern } from './patterns.js';
export type { PatternSelectorMap, BuiltinPatternName } from './patterns.js';

// Heuristic warning analyzer
export { createHeuristicAnalyzer } from './heuristics.js';
export type { HeuristicConfig, HeuristicAnalyzer } from './heuristics.js';

// Serialization
export {
  serializeTimeline,
  deserializeTimeline,
  serializeEvent,
  deserializeEvent,
  serializeInteractionSequence,
  deserializeInteractionSequence,
  timelinesEqual,
} from './serialization.js';

// Stable CSS selector generation
export { generateSelector } from './selector.js';

// Behavior Diff Engine
export { diffTimelines } from './diff-engine.js';
export type { BehaviorDiffReport, DiffEntry } from './diff-engine.js';

// Severity Classification
export { classifyDiff } from './severity.js';
export type { SeverityLevel, ClassifiedDiffEntry, ClassifiedDiffReport } from './severity.js';

// Baseline Storage
export { createBaselineStorage } from './baseline-storage.js';
export type { BaselineFile, BaselineStorage } from './baseline-storage.js';
