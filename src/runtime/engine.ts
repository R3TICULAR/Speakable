/**
 * Runtime Accessibility Engine
 *
 * Coordinates all accessibility observers (focus, mutation, live region, dialog)
 * into a single engine that collects normalized AccessibilityEvents during
 * component interaction. Events are timestamped relative to session start
 * and stored in chronological order.
 *
 * @module runtime/engine
 */

import type { AccessibilityEvent } from './types';
import { createFocusObserver, type FocusObserver } from './observers/focus-observer';
import { createMutationObserver, type AccessibilityMutationObserver } from './observers/mutation-observer';
import { createLiveRegionObserver, type LiveRegionObserver } from './observers/live-region-observer';
import { createDialogObserver, type DialogObserver } from './observers/dialog-observer';

// ---------------------------------------------------------------------------
// Engine Options
// ---------------------------------------------------------------------------

export interface EngineOptions {
  /** Document to observe */
  document: Document;
  /** Whether to enable heuristic warnings (default: true) */
  heuristics?: boolean;
  /** Custom settle time in ms (default: 100) */
  settleTime?: number;
}

// ---------------------------------------------------------------------------
// Engine Interface
// ---------------------------------------------------------------------------

export interface RuntimeAccessibilityEngine {
  /** Attach observers to the document and begin event collection */
  attach(): void;
  /** Detach all observers and stop collection */
  detach(): void;
  /** Get all collected events since attach (chronological order) */
  getEvents(): AccessibilityEvent[];
  /** Clear collected events without detaching */
  reset(): void;
  /** Whether the engine is currently attached */
  readonly isAttached: boolean;
  /** Expose dialog observer for heuristics module */
  readonly dialogObserver: { getOpenDialogs(): string[] };
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a RuntimeAccessibilityEngine that coordinates all observers
 * and collects accessibility events with monotonically increasing timestamps.
 */
export function createEngine(options: EngineOptions): RuntimeAccessibilityEngine {
  const { document: doc } = options;

  let attached = false;
  let sessionStart = 0;
  let events: AccessibilityEvent[] = [];

  // Timestamp function: returns ms elapsed since session start
  function getTimestamp(): number {
    return Date.now() - sessionStart;
  }

  // Shared event collector for focus, mutation, and dialog observers
  function collectEvent(event: AccessibilityEvent): void {
    events.push(event);
  }

  // Live region observer has a different callback signature:
  // it emits events without a timestamp, so we wrap to add one
  function collectLiveRegionEvent(event: Omit<AccessibilityEvent, 'timestamp'>): void {
    const fullEvent: AccessibilityEvent = {
      ...event,
      timestamp: getTimestamp(),
    } as AccessibilityEvent;
    events.push(fullEvent);
  }

  // Create all observers
  const focusObs: FocusObserver = createFocusObserver({
    document: doc,
    onEvent: collectEvent,
    getTimestamp,
  });

  const mutationObs: AccessibilityMutationObserver = createMutationObserver({
    document: doc,
    onEvent: collectEvent,
    getTimestamp,
  });

  const liveRegionObs: LiveRegionObserver = createLiveRegionObserver(
    doc,
    collectLiveRegionEvent
  );

  const dialogObs: DialogObserver = createDialogObserver({
    document: doc,
    onEvent: collectEvent,
    getTimestamp,
  });

  return {
    attach(): void {
      if (attached) return;
      attached = true;
      sessionStart = Date.now();
      events = [];

      // Start all observers
      focusObs.start();
      mutationObs.start();
      liveRegionObs.start();
      dialogObs.start();
    },

    detach(): void {
      if (!attached) return;
      attached = false;

      // Stop all observers
      focusObs.stop();
      mutationObs.stop();
      liveRegionObs.stop();
      dialogObs.stop();
    },

    getEvents(): AccessibilityEvent[] {
      // Events are already in chronological order due to single-threaded execution
      return [...events];
    },

    reset(): void {
      events = [];
    },

    get isAttached(): boolean {
      return attached;
    },

    get dialogObserver(): { getOpenDialogs(): string[] } {
      return {
        getOpenDialogs(): string[] {
          return dialogObs.getOpenDialogs();
        },
      };
    },
  };
}
