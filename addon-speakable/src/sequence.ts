/**
 * Interaction-sequence resolution for the Storybook addon.
 *
 * Determines which interaction sequence (if any) to run for the current story,
 * in priority order:
 *   1. Explicit `parameters.speakable.sequence` (a full InteractionSequence).
 *   2. A named built-in pattern via `parameters.speakable.pattern`
 *      (with optional `parameters.speakable.selectors`).
 *   3. If the story has a `play` function, a minimal keyboard-walk sequence
 *      (Tab through the component) as a best-effort dynamic probe.
 * Returns null when none applies, in which case only static analysis runs.
 */

import { getBuiltinPattern } from '../../src/runtime/patterns';
import type { InteractionSequence } from '../../src/runtime/types';
import type { BuiltinPatternName, PatternSelectorMap } from '../../src/runtime/patterns';

interface SpeakableStoryParams {
  sequence?: InteractionSequence;
  pattern?: BuiltinPatternName;
  selectors?: PatternSelectorMap;
  /** Set to false to disable timeline capture for a story. */
  timeline?: boolean;
}

interface StoryContextLike {
  parameters?: {
    speakable?: SpeakableStoryParams;
  };
  playFunction?: unknown;
  // Storybook may expose the play function under different keys across versions.
  play?: unknown;
}

/** A minimal "tab through the component" sequence used when only a play fn exists. */
const PLAY_PROBE_SEQUENCE: InteractionSequence = {
  description: 'Keyboard walk: tab through focusable elements',
  actions: [{ type: 'tab' }, { type: 'tab' }, { type: 'tab' }],
};

/**
 * Resolve the interaction sequence for a story, or null if none should run.
 */
export function resolveSequence(context: StoryContextLike): InteractionSequence | null {
  const params = context?.parameters?.speakable;

  // Explicit opt-out.
  if (params && params.timeline === false) {
    return null;
  }

  // 1. Explicit sequence.
  if (params?.sequence && Array.isArray(params.sequence.actions)) {
    return params.sequence;
  }

  // 2. Named built-in pattern.
  if (params?.pattern) {
    try {
      return getBuiltinPattern(params.pattern, params.selectors);
    } catch {
      return null;
    }
  }

  // 3. Play function present — best-effort keyboard walk.
  if (typeof context?.playFunction === 'function' || typeof context?.play === 'function') {
    return PLAY_PROBE_SEQUENCE;
  }

  return null;
}
