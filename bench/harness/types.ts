/**
 * Shared types for the Speakable accuracy benchmark harness.
 *
 * These shapes are the cross-stage contracts: the manifest describes the
 * corpus, and both ground-truth capture and Speakable prediction emit
 * `CaseRecord`s in the same normalized shape so comparison is apples-to-apples.
 *
 * Dev-only tooling. Not part of the shipped @reticular/speakable package.
 */

import type { InteractionAction } from '../../src/runtime/types.js';

export type Reader = 'nvda' | 'voiceover';
export type CaseMode = 'static' | 'runtime';

/** Named built-in interaction patterns Speakable already ships. */
export type BuiltinPatternName = 'modal-dialog' | 'combobox' | 'tabs' | 'accordion';

/**
 * A runtime case's interaction: either a named built-in pattern or an explicit
 * ordered action sequence (reusing Speakable's own InteractionAction union).
 * `null` for static cases.
 */
export type Interaction =
  | null
  | { pattern: BuiltinPatternName }
  | { actions: InteractionAction[] };

/** One corpus entry (manifest record). */
export interface ManifestEntry {
  /** Unique, kebab-case id, e.g. "button-icon-only-aria-label". */
  id: string;
  /** Category slug, e.g. "buttons-links". */
  category: string;
  /** Path relative to bench/corpus/, e.g. "buttons-links/button-icon-only-aria-label.html". */
  file: string;
  mode: CaseMode;
  interaction: Interaction;
  /** Human description of the behavior under test. */
  notes: string;
}

/** A single phrase parsed into semantic fields. */
export interface NormalizedPhrase {
  /** The spoken phrase after text normalization (lowercase/whitespace/trailing punctuation). */
  raw: string;
  /** Canonical role token, e.g. "navigation", "button". */
  role?: string;
  /** Accessible name. */
  name?: string;
  /** Canonical state tokens, e.g. ["expanded"], ["checked:false"]. */
  state?: string[];
  /** Form/widget value. */
  value?: string;
}

/** Exact versions under which ground truth was captured (the pins). */
export interface VersionInfo {
  srVersion?: string;
  osVersion?: string;
  browserVersion?: string;
}

/**
 * One captured case for one reader. Ground truth and predictions share this
 * shape; they differ only in which version fields are populated (ground truth
 * records SR/OS/browser pins; predictions record speakableVersion).
 */
export interface CaseRecord {
  id: string;
  reader: Reader;
  mode: CaseMode;
  srVersion?: string;
  osVersion?: string;
  browserVersion?: string;
  speakableVersion?: string;
  /** Ordered phrases as emitted by the SR or by Speakable. */
  rawPhrases: string[];
  /** Ordered phrases parsed into semantic fields. */
  normalized: NormalizedPhrase[];
}
