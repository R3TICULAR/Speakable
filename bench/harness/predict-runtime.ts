/**
 * Runtime prediction: run Speakable's runtime engine over a case's interaction
 * and convert the resulting accessibility timeline into ordered phrases that
 * mirror how a screen reader would voice the same interaction.
 *
 * Uses jsdom to provide a live Document (jsdom is already a Speakable
 * dependency). Named patterns are resolved to interaction sequences via
 * Speakable's own getBuiltinPattern; explicit action lists are used directly.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';
import { createTimelineGenerator } from '../../src/runtime/timeline-generator.js';
import { getBuiltinPattern } from '../../src/runtime/patterns.js';
import type { InteractionSequence, AccessibilityEvent } from '../../src/runtime/types.js';
import { CORPUS_DIR } from './manifest.js';
import { normalizePhrases } from './normalize.js';
import type { CaseRecord, ManifestEntry, Reader } from './types.js';

/** Resolve a manifest interaction into a concrete InteractionSequence. */
function resolveSequence(entry: ManifestEntry): InteractionSequence {
  const i = entry.interaction;
  if (i && 'pattern' in i) {
    return getBuiltinPattern(i.pattern);
  }
  if (i && 'actions' in i) {
    return { description: entry.id, actions: i.actions };
  }
  throw new Error(`runtime case "${entry.id}" has no resolvable interaction`);
}

/**
 * Convert a timeline event into a spoken-style phrase, or null if the event
 * carries no announcement-relevant content. Mirrors what a reader would voice:
 *   - focus change → "<name>, <role>"
 *   - announcement (live region) → the announced text
 *   - state change → "<name>, <role>, <attribute> <value>"
 *   - dialog open → "<name>, dialog"
 */
function eventToPhrase(e: AccessibilityEvent): string | null {
  const name = e.target.accessibleName?.trim() || '';
  const role = e.target.role?.trim() || '';
  const p = e.payload;

  switch (p.kind) {
    case 'focus_changed':
      return [name, role].filter(Boolean).join(', ') || null;
    case 'announcement':
      return p.text?.trim() || null;
    case 'state_changed': {
      const val = typeof p.newValue === 'boolean' ? (p.newValue ? 'true' : 'false') : String(p.newValue ?? '');
      const attr = p.attribute.replace(/^aria-/, '');
      return [name, role, `${attr} ${val}`.trim()].filter(Boolean).join(', ') || null;
    }
    case 'dialog_opened':
      return [p.dialogName, 'dialog'].filter(Boolean).join(', ');
    case 'dialog_closed':
      return null;
    default:
      return null;
  }
}

/** Produce a prediction CaseRecord for one runtime case + reader. */
export async function predictRuntime(entry: ManifestEntry, reader: Reader, version: string): Promise<CaseRecord> {
  const html = readFileSync(join(CORPUS_DIR, entry.file), 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
  const { window } = dom;
  const { document } = window;

  // The runtime engine references DOM globals (MutationObserver, FocusEvent,
  // KeyboardEvent, getComputedStyle, Node, etc.) from the ambient scope, as it
  // would in a real browser. Under Node those don't exist, so hoist them from
  // the jsdom window for the duration of the capture, then restore.
  const GLOBAL_KEYS = [
    'MutationObserver', 'getComputedStyle', 'Node', 'Element', 'HTMLElement',
    'FocusEvent', 'KeyboardEvent', 'MouseEvent', 'Event', 'CustomEvent', 'window', 'document',
  ] as const;
  const g = globalThis as unknown as Record<string, unknown>;
  const saved: Record<string, unknown> = {};
  for (const k of GLOBAL_KEYS) {
    saved[k] = g[k];
    g[k] = (window as unknown as Record<string, unknown>)[k] ?? (k === 'window' ? window : k === 'document' ? document : g[k]);
  }

  let timeline;
  try {
    const generator = createTimelineGenerator({
      document: document as unknown as Document,
      componentName: entry.id,
      storyName: reader,
      settlePeriod: 50,
    });
    const sequence = resolveSequence(entry);
    timeline = await generator.capture(sequence);
  } finally {
    // Restore prior globals so stages don't leak jsdom state into each other.
    for (const k of GLOBAL_KEYS) g[k] = saved[k];
  }

  const rawPhrases = timeline.events
    .map(eventToPhrase)
    .filter((p): p is string => !!p);

  return {
    id: entry.id,
    reader,
    mode: 'runtime',
    speakableVersion: version,
    rawPhrases,
    normalized: normalizePhrases(rawPhrases),
  };
}
