/**
 * Shared message protocol for the iframe harness.
 *
 * The parent-page controller and the in-iframe agent exchange these
 * request/response envelopes over `postMessage`. Every request carries a
 * unique `id` so responses can be correlated.
 */

import type { AnalysisResult } from '../browser/analyze.js';
import type { AccessibilityTimeline, InteractionSequence } from '../runtime/types.js';

/** Namespace tag stamped on every harness message to avoid collisions. */
export const HARNESS_CHANNEL = 'speakable-harness';

/** Serializable subset of CaptureOptions safe to send over postMessage. */
export interface SerializableCaptureOptions {
  componentName: string;
  storyName?: string;
  sequence: InteractionSequence;
  settlePeriod?: number;
  awaitUpgrade?: boolean;
  upgradeTimeoutMs?: number;
}

export type HarnessRequest =
  | { channel: typeof HARNESS_CHANNEL; id: string; kind: 'analyze'; selector?: string }
  | { channel: typeof HARNESS_CHANNEL; id: string; kind: 'capture'; options: SerializableCaptureOptions };

export type HarnessResponse =
  | { channel: typeof HARNESS_CHANNEL; id: string; ok: true; kind: 'analyze'; result: AnalysisResult }
  | { channel: typeof HARNESS_CHANNEL; id: string; ok: true; kind: 'capture'; result: AccessibilityTimeline }
  | { channel: typeof HARNESS_CHANNEL; id: string; ok: false; error: string };

/** Sent by the agent once it has installed its message listener. */
export interface HarnessReadyMessage {
  channel: typeof HARNESS_CHANNEL;
  kind: 'ready';
}

export function isHarnessRequest(data: unknown): data is HarnessRequest {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.channel === HARNESS_CHANNEL && typeof d.id === 'string' &&
    (d.kind === 'analyze' || d.kind === 'capture');
}

export function isHarnessResponse(data: unknown): data is HarnessResponse {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.channel === HARNESS_CHANNEL && typeof d.id === 'string' && typeof d.ok === 'boolean';
}

export function isHarnessReady(data: unknown): data is HarnessReadyMessage {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.channel === HARNESS_CHANNEL && d.kind === 'ready';
}
