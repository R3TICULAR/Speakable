/**
 * Transport-agnostic interaction timeline capture.
 *
 * Wraps the core runtime engine (`src/runtime`) so any real-browser surface
 * (Storybook addon, iframe harness, extension) can run an interaction
 * sequence against a live document and receive a serializable timeline.
 */

import { createTimelineGenerator } from '../runtime/timeline-generator.js';
import type { AccessibilityTimeline, InteractionSequence } from '../runtime/types.js';
import { awaitCustomElementsReady } from './upgrade.js';

export interface CaptureOptions {
  /** Component name for timeline metadata. */
  componentName: string;
  /** Story or variant name for timeline metadata. */
  storyName?: string;
  /** Ordered interaction sequence to execute during capture. */
  sequence: InteractionSequence;
  /** Settle period after the last action (ms). */
  settlePeriod?: number;
  /** Await custom-element upgrade before capture (default: true). */
  awaitUpgrade?: boolean;
  /** Maximum time to wait for custom elements to upgrade (ms). */
  upgradeTimeoutMs?: number;
}

/**
 * Attach the runtime engine to `document`, run the interaction sequence,
 * and return a serializable accessibility timeline.
 *
 * When `awaitUpgrade` is enabled (default), waits for custom elements to
 * upgrade first so web components (e.g. Lit) are analyzed post-hydration.
 * Any upgrade warnings are appended to the timeline's `warnings` array.
 */
export async function captureTimeline(
  document: Document,
  options: CaptureOptions
): Promise<AccessibilityTimeline> {
  const {
    componentName,
    storyName,
    sequence,
    settlePeriod,
    awaitUpgrade = true,
    upgradeTimeoutMs,
  } = options;

  let upgradeWarnings: string[] = [];
  if (awaitUpgrade) {
    const warnings = await awaitCustomElementsReady(document, upgradeTimeoutMs);
    upgradeWarnings = warnings.map(w => w.message);
  }

  const generator = createTimelineGenerator({
    document,
    componentName,
    storyName,
    ...(settlePeriod !== undefined && { settlePeriod }),
  });

  const timeline = await generator.capture(sequence);

  if (upgradeWarnings.length > 0) {
    // Fold upgrade warnings into the timeline as WARNING events at t=0.
    const upgradeEvents = upgradeWarnings.map(message => ({
      type: 'WARNING' as const,
      timestamp: 0,
      target: { role: 'generic', accessibleName: '', selector: ':root' },
      payload: { kind: 'warning' as const, message },
    }));
    return {
      ...timeline,
      events: [...upgradeEvents, ...timeline.events],
      warnings: [...upgradeEvents, ...timeline.warnings],
    };
  }

  return timeline;
}
