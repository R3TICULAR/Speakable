/**
 * Scoring: compare Speakable predictions against real-SR ground truth at the
 * SEMANTIC-FIELD level (role, name, state, value), not raw string equality.
 *
 * Reports, per reader and per category:
 *   - per-field accuracy (match rate over cases where the field is applicable)
 *   - false-positive rate (Speakable announced a field the SR did not)
 *   - false-negative rate (SR announced a field Speakable missed)
 *   - runtime timeline fidelity (ordered-event precision/recall) for runtime cases
 *
 * Orphaned pairs (prediction without ground truth, or vice versa) are reported
 * as incomplete rather than silently dropped, so coverage gaps are visible.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadManifest } from './manifest.js';
import type { CaseRecord, NormalizedPhrase, Reader, VersionInfo } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BENCH_DIR = resolve(__dirname, '..');
const GROUND_TRUTH_DIR = join(BENCH_DIR, 'ground-truth');
const PREDICTIONS_DIR = join(BENCH_DIR, 'predictions');
const QUARANTINE_PATH = join(GROUND_TRUTH_DIR, 'quarantine.json');

interface QuarantineEntry {
  reader: Reader;
  id: string;
  reason: string;
}

/**
 * Load the quarantine list: ground-truth cases whose capture was contaminated
 * (cursor read browser chrome, not the page). Quarantined cases are excluded
 * from scoring and reported as INCOMPLETE with their reason, so they are never
 * silently dropped and the headline is computed only on trustworthy data.
 */
function loadQuarantine(): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(QUARANTINE_PATH)) return map;
  try {
    const parsed = JSON.parse(readFileSync(QUARANTINE_PATH, 'utf-8')) as { quarantined?: QuarantineEntry[] };
    for (const q of parsed.quarantined ?? []) map.set(`${q.reader}/${q.id}`, q.reason);
  } catch {
    /* malformed quarantine file: treat as empty rather than failing the report */
  }
  return map;
}

const READERS: Reader[] = ['nvda', 'voiceover'];
const FIELDS = ['role', 'name', 'state', 'value'] as const;
type Field = (typeof FIELDS)[number];

export interface FieldAccuracy {
  applicable: number;
  matched: number;
  rate: number; // 0..1; NaN-safe: 0 when applicable === 0
}

export interface SegmentScore {
  cases: number;
  role: FieldAccuracy;
  name: FieldAccuracy;
  state: FieldAccuracy;
  value: FieldAccuracy;
  falsePositives: number;
  falseNegatives: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  timeline?: { precision: number; recall: number };
}

export interface BenchmarkResult {
  version: 'v1';
  generatedAt: string;
  pins: Partial<Record<Reader, VersionInfo>>;
  coverage: {
    totalCases: number;
    readers: Record<Reader, { predicted: number; groundTruth: number; scored: number }>;
    incomplete: string[]; // "<id> (<reader>): reason"
  };
  overall: Partial<Record<Reader, SegmentScore>>;
  byCategory: Record<string, Partial<Record<Reader, SegmentScore>>>;
  headline: { metric: string; value: number } | null;
}

function readRecord(dir: string, reader: Reader, id: string): CaseRecord | null {
  const p = join(dir, reader, `${id}.json`);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as CaseRecord;
  } catch {
    return null;
  }
}

/** Collect the multiset of a field's values across a phrase list. */
function fieldValues(phrases: NormalizedPhrase[], field: Field): string[] {
  const out: string[] = [];
  for (const p of phrases) {
    const v = p[field];
    if (v === undefined) continue;
    if (Array.isArray(v)) out.push(...v);
    else out.push(v);
  }
  return out;
}

/** Multiset equality by sorted join. */
function multisetEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

interface Acc {
  role: { applicable: number; matched: number };
  name: { applicable: number; matched: number };
  state: { applicable: number; matched: number };
  value: { applicable: number; matched: number };
  fp: number;
  fn: number;
  phraseCount: number;
  cases: number;
  // timeline accumulation (runtime only)
  tlMatched: number;
  tlPredicted: number;
  tlTruth: number;
  hasRuntime: boolean;
}

function emptyAcc(): Acc {
  return {
    role: { applicable: 0, matched: 0 },
    name: { applicable: 0, matched: 0 },
    state: { applicable: 0, matched: 0 },
    value: { applicable: 0, matched: 0 },
    fp: 0,
    fn: 0,
    phraseCount: 0,
    cases: 0,
    tlMatched: 0,
    tlPredicted: 0,
    tlTruth: 0,
    hasRuntime: false,
  };
}

/** Longest-common-subsequence length over normalized phrase `raw` strings (order-preserving). */
function lcsLength(a: string[], b: string[]): number {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** Accumulate one scored case (ground truth + prediction both present). */
function scoreCase(acc: Acc, truth: CaseRecord, pred: CaseRecord): void {
  acc.cases++;

  // Per-field accuracy: a field is "applicable" when ground truth has ≥1 value.
  for (const field of FIELDS) {
    const tv = fieldValues(truth.normalized, field);
    const pv = fieldValues(pred.normalized, field);
    if (tv.length > 0) {
      acc[field].applicable++;
      if (multisetEqual(tv, pv)) acc[field].matched++;
    }
    // False positive: prediction has the field but ground truth does not.
    if (pv.length > 0 && tv.length === 0) acc.fp++;
    // False negative: ground truth has the field but prediction does not.
    if (tv.length > 0 && pv.length === 0) acc.fn++;
    acc.phraseCount++;
  }

  // Runtime ordered-timeline fidelity.
  if (truth.mode === 'runtime' || pred.mode === 'runtime') {
    acc.hasRuntime = true;
    const t = truth.normalized.map((p) => p.raw);
    const p = pred.normalized.map((x) => x.raw);
    const matched = lcsLength(t, p);
    acc.tlMatched += matched;
    acc.tlTruth += t.length;
    acc.tlPredicted += p.length;
  }
}

function fieldAccuracy(a: { applicable: number; matched: number }): FieldAccuracy {
  return { applicable: a.applicable, matched: a.matched, rate: a.applicable ? a.matched / a.applicable : 0 };
}

function finalize(acc: Acc): SegmentScore {
  const score: SegmentScore = {
    cases: acc.cases,
    role: fieldAccuracy(acc.role),
    name: fieldAccuracy(acc.name),
    state: fieldAccuracy(acc.state),
    value: fieldAccuracy(acc.value),
    falsePositives: acc.fp,
    falseNegatives: acc.fn,
    falsePositiveRate: acc.phraseCount ? acc.fp / acc.phraseCount : 0,
    falseNegativeRate: acc.phraseCount ? acc.fn / acc.phraseCount : 0,
  };
  if (acc.hasRuntime) {
    score.timeline = {
      precision: acc.tlPredicted ? acc.tlMatched / acc.tlPredicted : 0,
      recall: acc.tlTruth ? acc.tlMatched / acc.tlTruth : 0,
    };
  }
  return score;
}

/**
 * Score a list of ground-truth/prediction pairs into a single SegmentScore.
 * Pure (no file I/O) — the unit-testable core of the comparison logic.
 */
export function scorePairs(pairs: Array<{ truth: CaseRecord; pred: CaseRecord }>): SegmentScore {
  const acc = emptyAcc();
  for (const { truth, pred } of pairs) scoreCase(acc, truth, pred);
  return finalize(acc);
}

/**
 * Build the full benchmark result from committed predictions + ground truth.
 * Runs with no AT/OS dependency.
 */
export function score(): BenchmarkResult {
  const entries = loadManifest();
  const categories = Array.from(new Set(entries.map((e) => e.category)));
  const quarantine = loadQuarantine();

  const result: BenchmarkResult = {
    version: 'v1',
    generatedAt: new Date().toISOString(),
    pins: {},
    coverage: {
      totalCases: entries.length,
      readers: {
        nvda: { predicted: 0, groundTruth: 0, scored: 0 },
        voiceover: { predicted: 0, groundTruth: 0, scored: 0 },
      },
      incomplete: [],
    },
    overall: {},
    byCategory: {},
    headline: null,
  };

  for (const reader of READERS) {
    const overallAcc = emptyAcc();
    const catAccs = new Map<string, Acc>(categories.map((c) => [c, emptyAcc()]));

    for (const entry of entries) {
      const pred = readRecord(PREDICTIONS_DIR, reader, entry.id);
      const truthRaw = readRecord(GROUND_TRUTH_DIR, reader, entry.id);
      const quarantineReason = quarantine.get(`${reader}/${entry.id}`);
      // A quarantined ground-truth record exists on disk but is NOT trustworthy,
      // so it is excluded from scoring, coverage counts, and version pins.
      const truth = quarantineReason ? null : truthRaw;

      if (pred) result.coverage.readers[reader].predicted++;
      if (truth) {
        result.coverage.readers[reader].groundTruth++;
        // capture version pins from the first ground-truth record seen
        if (!result.pins[reader]) {
          result.pins[reader] = {
            srVersion: truth.srVersion,
            osVersion: truth.osVersion,
            browserVersion: truth.browserVersion,
          };
        }
      }

      if (quarantineReason) {
        result.coverage.incomplete.push(`${entry.id} (${reader}): ground truth quarantined — ${quarantineReason}`);
      } else if (pred && truth) {
        scoreCase(overallAcc, truth, pred);
        scoreCase(catAccs.get(entry.category)!, truth, pred);
        result.coverage.readers[reader].scored++;
      } else if (pred && !truth) {
        result.coverage.incomplete.push(`${entry.id} (${reader}): prediction present, ground truth missing`);
      } else if (!pred && truth) {
        result.coverage.incomplete.push(`${entry.id} (${reader}): ground truth present, prediction missing`);
      }
    }

    if (overallAcc.cases > 0) {
      result.overall[reader] = finalize(overallAcc);
      for (const cat of categories) {
        const a = catAccs.get(cat)!;
        if (a.cases > 0) {
          result.byCategory[cat] ??= {};
          result.byCategory[cat][reader] = finalize(a);
        }
      }
    }
  }

  // Headline (only when there is something scored): role+name+state accuracy on
  // static cases, averaged across readers that were scored.
  const headline = computeHeadline(entries, quarantine);
  result.headline = headline;

  return result;
}

function computeHeadline(
  entries: ReturnType<typeof loadManifest>,
  quarantine: Map<string, string>
): { metric: string; value: number } | null {
  const staticIds = new Set(entries.filter((e) => e.mode === 'static').map((e) => e.id));
  let applicable = 0;
  let matched = 0;

  for (const reader of READERS) {
    for (const entry of entries) {
      if (!staticIds.has(entry.id)) continue;
      if (quarantine.has(`${reader}/${entry.id}`)) continue; // excluded: contaminated capture
      const pred = readRecord(PREDICTIONS_DIR, reader, entry.id);
      const truth = readRecord(GROUND_TRUTH_DIR, reader, entry.id);
      if (!pred || !truth) continue;
      for (const field of ['role', 'name', 'state'] as const) {
        const tv = fieldValues(truth.normalized, field);
        if (tv.length === 0) continue;
        applicable++;
        if (multisetEqual(tv, fieldValues(pred.normalized, field))) matched++;
      }
    }
  }

  if (applicable === 0) return null;
  return { metric: 'role+name+state accuracy on static cases', value: matched / applicable };
}
