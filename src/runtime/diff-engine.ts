/**
 * Behavior Diff Engine
 *
 * Compares two Accessibility Timelines and produces a BehaviorDiffReport
 * describing added, removed, and modified events. Events are matched by
 * type + target selector. Timestamp differences alone do not count as
 * modifications.
 */

import type { AccessibilityEvent, AccessibilityTimeline } from './types.js';

// ---------------------------------------------------------------------------
// Public Interfaces
// ---------------------------------------------------------------------------

/**
 * A single entry in the diff report representing one difference between
 * baseline and current timelines.
 */
export interface DiffEntry {
  /** The event from the current timeline (for added/modified) or baseline (for removed) */
  event: AccessibilityEvent;
  /** The corresponding event from the other timeline (for modified entries) */
  previousEvent?: AccessibilityEvent;
  /** Human-readable description of the difference */
  message: string;
}

/**
 * Structured summary of differences between two Accessibility Timelines.
 */
export interface BehaviorDiffReport {
  baseline: { totalEvents: number };
  current: { totalEvents: number };
  /** Events present in current but not in baseline */
  added: DiffEntry[];
  /** Events present in baseline but not in current */
  removed: DiffEntry[];
  /** Events present in both but with different payloads */
  modified: DiffEntry[];
  /** Aggregate counts (must equal array lengths exactly) */
  summary: {
    totalBaseline: number;
    totalCurrent: number;
    added: number;
    removed: number;
    modified: number;
  };
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a matching key for an event based on type and target selector.
 * This is the primary key used to correlate events across timelines.
 */
function matchingKey(event: AccessibilityEvent): string {
  return `${event.type}::${event.target.selector}`;
}

/**
 * Compare two event payloads for equality, ignoring the timestamp field.
 * Returns true if payloads are structurally identical.
 */
function payloadsEqual(a: AccessibilityEvent, b: AccessibilityEvent): boolean {
  // Compare everything except timestamp
  // We compare: type, target, and payload
  if (a.type !== b.type) return false;
  if (!targetsEqual(a.target, b.target)) return false;
  return deepEqual(a.payload, b.payload);
}

/**
 * Compare two EventTarget objects for equality.
 */
function targetsEqual(
  a: AccessibilityEvent['target'],
  b: AccessibilityEvent['target']
): boolean {
  return (
    a.role === b.role &&
    a.accessibleName === b.accessibleName &&
    a.selector === b.selector
  );
}

/**
 * Deep equality check for payload objects.
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;

  const aKeys = Object.keys(aObj).sort();
  const bKeys = Object.keys(bObj).sort();

  if (aKeys.length !== bKeys.length) return false;

  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] !== bKeys[i]) return false;
    if (!deepEqual(aObj[aKeys[i]], bObj[bKeys[i]])) return false;
  }

  return true;
}

/**
 * Build a human-readable message describing a modification.
 */
function buildModifiedMessage(
  baseline: AccessibilityEvent,
  current: AccessibilityEvent
): string {
  const type = current.type;
  const selector = current.target.selector;

  // Check if target properties changed
  if (baseline.target.accessibleName !== current.target.accessibleName) {
    return (
      `${type} on "${selector}": accessible name changed from ` +
      `"${baseline.target.accessibleName}" to "${current.target.accessibleName}"`
    );
  }

  if (baseline.target.role !== current.target.role) {
    return (
      `${type} on "${selector}": role changed from ` +
      `"${baseline.target.role}" to "${current.target.role}"`
    );
  }

  // Generic payload difference message
  return `${type} on "${selector}": payload values differ`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compare two Accessibility Timelines and produce a structured diff report.
 *
 * Algorithm:
 * 1. Create matching keys for events: type + target selector
 * 2. Walk baseline events and find matching current events
 * 3. If matched: compare payloads (ignoring timestamp). Different = modified.
 * 4. If no match in current: classify as removed
 * 5. Unmatched current events: classify as added
 * 6. Timestamp-only differences do NOT count as modifications
 */
export function diffTimelines(
  baseline: AccessibilityTimeline,
  current: AccessibilityTimeline
): BehaviorDiffReport {
  const added: DiffEntry[] = [];
  const removed: DiffEntry[] = [];
  const modified: DiffEntry[] = [];

  // Group current events by matching key, maintaining order within each key.
  // We use arrays to handle multiple events with the same key (e.g., multiple
  // focus changes on the same element).
  const currentByKey = new Map<string, AccessibilityEvent[]>();
  for (const event of current.events) {
    const key = matchingKey(event);
    const existing = currentByKey.get(key);
    if (existing) {
      existing.push(event);
    } else {
      currentByKey.set(key, [event]);
    }
  }

  // Track which current events have been matched to a baseline event
  const matchedCurrentIndices = new Set<string>();

  // Walk through baseline events
  for (const baselineEvent of baseline.events) {
    const key = matchingKey(baselineEvent);
    const candidates = currentByKey.get(key);

    if (!candidates || candidates.length === 0) {
      // No matching event in current timeline
      removed.push({
        event: baselineEvent,
        message: `${baselineEvent.type} on "${baselineEvent.target.selector}" was removed`,
      });
      continue;
    }

    // Find the first unmatched candidate with the same key
    let matched = false;
    for (let i = 0; i < candidates.length; i++) {
      const candidateId = `${key}::${i}`;
      if (matchedCurrentIndices.has(candidateId)) continue;

      const currentEvent = candidates[i];
      matchedCurrentIndices.add(candidateId);

      // Compare ignoring timestamp
      if (!payloadsEqual(baselineEvent, currentEvent)) {
        modified.push({
          event: currentEvent,
          previousEvent: baselineEvent,
          message: buildModifiedMessage(baselineEvent, currentEvent),
        });
      }
      // If payloads are equal (only timestamp differs), it is not a modification

      matched = true;
      break;
    }

    if (!matched) {
      // All candidates with this key were already consumed
      removed.push({
        event: baselineEvent,
        message: `${baselineEvent.type} on "${baselineEvent.target.selector}" was removed`,
      });
    }
  }

  // Any unmatched current events are additions
  for (const [key, candidates] of currentByKey.entries()) {
    for (let i = 0; i < candidates.length; i++) {
      const candidateId = `${key}::${i}`;
      if (!matchedCurrentIndices.has(candidateId)) {
        const event = candidates[i];
        added.push({
          event,
          message: `${event.type} on "${event.target.selector}" was added`,
        });
      }
    }
  }

  return {
    baseline: { totalEvents: baseline.events.length },
    current: { totalEvents: current.events.length },
    added,
    removed,
    modified,
    summary: {
      totalBaseline: baseline.events.length,
      totalCurrent: current.events.length,
      added: added.length,
      removed: removed.length,
      modified: modified.length,
    },
  };
}
