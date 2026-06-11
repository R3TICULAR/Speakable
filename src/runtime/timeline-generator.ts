/**
 * Timeline Generator
 *
 * Orchestrates interaction sessions by coordinating the RuntimeAccessibilityEngine
 * with interaction execution and heuristic analysis. Produces complete
 * AccessibilityTimeline objects containing ordered events, warnings, and
 * session metadata.
 *
 * @module runtime/timeline-generator
 */

import type {
  AccessibilityEvent,
  AccessibilityTimeline,
  InteractionSequence,
  TimelineMetadata,
} from './types';
import { createEngine, type RuntimeAccessibilityEngine } from './engine';
import { executeSequence } from './interactions';
import { createHeuristicAnalyzer, type HeuristicAnalyzer } from './heuristics';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPEAKABLE_VERSION = '1.3.0';
const TIMELINE_FORMAT_VERSION = '1.0';
const DEFAULT_SETTLE_PERIOD = 500;
const DEFAULT_LOAD_TIMEOUT = 10000;
const DOM_STABILITY_WAIT = 100;

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/**
 * Configuration options for creating a TimelineGenerator.
 */
export interface TimelineGeneratorOptions {
  /** Document or iframe to attach to */
  document: Document;
  /** Component name for metadata */
  componentName: string;
  /** Story or variant name for metadata */
  storyName?: string;
  /** Settle period after last action (default: 500ms) */
  settlePeriod?: number;
  /** Maximum wait for document load (default: 10000ms) */
  loadTimeout?: number;
  /** Enable heuristic warnings (default: true) */
  heuristics?: boolean;
}

// ---------------------------------------------------------------------------
// Timeline Generator Interface
// ---------------------------------------------------------------------------

/**
 * Orchestrates an interaction session and produces an AccessibilityTimeline.
 */
export interface TimelineGenerator {
  /** Execute an interaction sequence and produce a timeline */
  capture(sequence: InteractionSequence): Promise<AccessibilityTimeline>;
  /** Abort an in-progress capture */
  abort(): void;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a TimelineGenerator that coordinates the engine, interaction
 * execution, and heuristic analysis to produce accessibility timelines.
 *
 * Usage:
 * ```ts
 * const generator = createTimelineGenerator({
 *   document: myDocument,
 *   componentName: 'LoginForm',
 *   storyName: 'Default',
 * });
 *
 * const timeline = await generator.capture({
 *   description: 'Tab through form fields',
 *   actions: [{ type: 'tab' }, { type: 'tab' }, { type: 'enter' }],
 * });
 * ```
 */
export function createTimelineGenerator(
  options: TimelineGeneratorOptions
): TimelineGenerator {
  const {
    document: doc,
    componentName,
    storyName,
    settlePeriod = DEFAULT_SETTLE_PERIOD,
    loadTimeout = DEFAULT_LOAD_TIMEOUT,
    heuristics: enableHeuristics = true,
  } = options;

  let aborted = false;
  let currentEngine: RuntimeAccessibilityEngine | null = null;

  return {
    async capture(sequence: InteractionSequence): Promise<AccessibilityTimeline> {
      aborted = false;

      // Wait for document to be ready (body must exist)
      await waitForDocumentReady(doc, loadTimeout);

      if (aborted) {
        return buildAbortedTimeline(componentName, storyName, sequence);
      }

      // Create engine and attach
      const engine = createEngine({ document: doc });
      currentEngine = engine;

      // Create heuristic analyzer if enabled
      const heuristicAnalyzer: HeuristicAnalyzer | null = enableHeuristics
        ? createHeuristicAnalyzer()
        : null;

      // Collect interaction-emitted events (KEYBOARD_ACTION, WARNINGs from missing elements)
      // These are not captured by the engine's observers.
      const interactionEvents: AccessibilityEvent[] = [];

      const sessionStart = Date.now();
      engine.attach();

      if (aborted) {
        engine.detach();
        currentEngine = null;
        return buildAbortedTimeline(componentName, storyName, sequence);
      }

      // Timestamp function for interactions
      function getTimestamp(): number {
        return Date.now() - sessionStart;
      }

      // Execute the interaction sequence with DOM stability waits
      await executeSequence(
        sequence,
        doc,
        (event: AccessibilityEvent) => {
          interactionEvents.push(event);
        },
        getTimestamp,
        DOM_STABILITY_WAIT
      );

      if (aborted) {
        engine.detach();
        currentEngine = null;
        return buildAbortedTimeline(componentName, storyName, sequence);
      }

      // Wait the settle period for trailing async events
      await delay(settlePeriod);

      // Detach engine and finalize
      engine.detach();
      currentEngine = null;

      const duration = Date.now() - sessionStart;

      // Merge engine events with interaction events, sorted by timestamp
      const engineEvents = engine.getEvents();
      const allEvents = mergeEvents(engineEvents, interactionEvents);

      // Run heuristic analysis on all events if enabled
      if (heuristicAnalyzer) {
        const heuristicWarnings: AccessibilityEvent[] = [];
        for (const event of allEvents) {
          const warnings = heuristicAnalyzer.process(event);
          heuristicWarnings.push(...warnings);
        }
        // Add heuristic warnings to the event stream
        for (const warning of heuristicWarnings) {
          allEvents.push(warning);
        }
        // Re-sort after adding heuristic warnings
        allEvents.sort((a, b) => a.timestamp - b.timestamp);
      }

      // Extract all WARNING events for the warnings array
      const allWarnings = allEvents.filter((e) => e.type === 'WARNING');

      // Build metadata
      const metadata: TimelineMetadata = {
        capturedAt: new Date().toISOString(),
        speakableVersion: SPEAKABLE_VERSION,
        sourceUrl: getSourceUrl(doc),
        userAgent: getUserAgent(),
      };

      // Build and return the AccessibilityTimeline
      const timeline: AccessibilityTimeline = {
        version: TIMELINE_FORMAT_VERSION,
        component: componentName,
        story: storyName || null,
        interactionSequence: sequence.description,
        duration,
        events: allEvents,
        warnings: allWarnings,
        metadata,
      };

      return timeline;
    },

    abort(): void {
      aborted = true;
      if (currentEngine && currentEngine.isAttached) {
        currentEngine.detach();
        currentEngine = null;
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wait for the document body to be available, with a timeout.
 * If the document already has a body, resolves immediately.
 */
async function waitForDocumentReady(
  doc: Document,
  timeout: number
): Promise<void> {
  if (doc.body) return;

  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Document load timeout (${timeout}ms): ${getSourceUrl(doc)}`
        )
      );
    }, timeout);

    // Poll for body availability
    const interval = setInterval(() => {
      if (doc.body) {
        clearTimeout(timeoutId);
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}

/**
 * Merge two event arrays into a single sorted array by timestamp.
 */
function mergeEvents(
  engineEvents: AccessibilityEvent[],
  interactionEvents: AccessibilityEvent[]
): AccessibilityEvent[] {
  const all = [...engineEvents, ...interactionEvents];
  all.sort((a, b) => a.timestamp - b.timestamp);
  return all;
}

/**
 * Get the source URL from a document, falling back to 'local'.
 */
function getSourceUrl(doc: Document): string {
  try {
    const url = doc.URL;
    if (url && url !== 'about:blank' && url !== '') {
      return url;
    }
  } catch {
    // Ignore errors accessing URL
  }
  return 'local';
}

/**
 * Get the user agent string, defaulting to 'jsdom' for Node.js environments.
 */
function getUserAgent(): string {
  try {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent;
    }
  } catch {
    // Ignore errors
  }
  return 'jsdom';
}

/**
 * Simple promise-based delay.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build an empty timeline for aborted captures.
 */
function buildAbortedTimeline(
  componentName: string,
  storyName: string | undefined,
  sequence: InteractionSequence
): AccessibilityTimeline {
  return {
    version: TIMELINE_FORMAT_VERSION,
    component: componentName,
    story: storyName || null,
    interactionSequence: sequence.description,
    duration: 0,
    events: [],
    warnings: [],
    metadata: {
      capturedAt: new Date().toISOString(),
      speakableVersion: SPEAKABLE_VERSION,
      sourceUrl: 'local',
      userAgent: getUserAgent(),
    },
  };
}
