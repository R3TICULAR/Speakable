/**
 * Drift / correction report (v2 Layer 3b).
 *
 * The committed, machine-readable + human-readable artifact of where Speakable
 * diverges from real screen-reader output. It is the engine-improvement signal
 * and the OS-version-regression detector: when a new macOS/VoiceOver changes
 * wording, this report shows it, pinned to the exact versions.
 *
 * Each divergence is a CORRECTION CANDIDATE — advisory only. The engine is
 * NEVER auto-mutated from this output (v2 R4.6, R5). Quarantined cases are
 * excluded so a bad capture can never masquerade as an engine correction
 * (v2 R5.2).
 *
 *   Usage:  npx tsx bench/harness/drift.ts [reader]   (default voiceover)
 *   Output: bench/results/drift-v1.json, bench/results/drift-v1.md
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadManifest } from './manifest.js';
import type { CaseRecord, NormalizedPhrase, Reader, VersionInfo } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BENCH_DIR = resolve(__dirname, '..');
const GROUND_TRUTH_DIR = join(BENCH_DIR, 'ground-truth');
const PREDICTIONS_DIR = join(BENCH_DIR, 'predictions');
const RESULTS_DIR = join(BENCH_DIR, 'results');
const QUARANTINE_PATH = join(GROUND_TRUTH_DIR, 'quarantine.json');

type Field = 'role' | 'name' | 'state';
type DivergenceKind = 'missing' | 'extra' | 'mismatch';

export interface CorrectionCandidate {
  id: string;
  category: string;
  reader: Reader;
  field: Field;
  kind: DivergenceKind;
  /** What the real screen reader announced for this field. */
  groundTruth: string[];
  /** What Speakable predicted for this field. */
  prediction: string[];
  /** Systematic-gap bucket label, e.g. "name: mismatch". */
  bucket: string;
}

export interface DriftReport {
  version: 'v1';
  generatedAt: string;
  reader: Reader;
  pins: VersionInfo;
  totals: { scored: number; quarantined: number; candidates: number };
  bucketCounts: Record<string, number>;
  candidates: CorrectionCandidate[];
}

function loadQuarantine(): Set<string> {
  const set = new Set<string>();
  if (!existsSync(QUARANTINE_PATH)) return set;
  try {
    const parsed = JSON.parse(readFileSync(QUARANTINE_PATH, 'utf-8')) as {
      quarantined?: Array<{ reader: string; id: string }>;
    };
    for (const q of parsed.quarantined ?? []) set.add(`${q.reader}/${q.id}`);
  } catch {
    /* ignore */
  }
  return set;
}

function read(dir: string, reader: Reader, id: string): CaseRecord | null {
  const p = join(dir, reader, `${id}.json`);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as CaseRecord;
  } catch {
    return null;
  }
}

function fieldSet(phrases: NormalizedPhrase[], field: Field): string[] {
  const out: string[] = [];
  for (const p of phrases) {
    const v = p[field];
    if (v === undefined) continue;
    if (Array.isArray(v)) out.push(...v);
    else out.push(v);
  }
  return out.sort();
}

function eq(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function buildDriftReport(reader: Reader): DriftReport {
  const entries = loadManifest();
  const quarantine = loadQuarantine();
  const candidates: CorrectionCandidate[] = [];
  const bucketCounts: Record<string, number> = {};
  let scored = 0;
  let quarantined = 0;
  let pins: VersionInfo = {};

  for (const entry of entries) {
    if (quarantine.has(`${reader}/${entry.id}`)) {
      quarantined++;
      continue;
    }
    const truth = read(GROUND_TRUTH_DIR, reader, entry.id);
    const pred = read(PREDICTIONS_DIR, reader, entry.id);
    if (!truth || !pred) continue;
    scored++;

    // Capture version pins from the first scored ground-truth record.
    if (!pins.srVersion && (truth.srVersion || truth.osVersion || truth.browserVersion)) {
      pins = { srVersion: truth.srVersion, osVersion: truth.osVersion, browserVersion: truth.browserVersion };
    }

    for (const field of ['role', 'name', 'state'] as const) {
      const t = fieldSet(truth.normalized, field);
      const p = fieldSet(pred.normalized, field);
      if (t.length === 0 && p.length === 0) continue;
      if (eq(t, p)) continue;

      let kind: DivergenceKind;
      if (t.length > 0 && p.length === 0) kind = 'missing';
      else if (t.length === 0 && p.length > 0) kind = 'extra';
      else kind = 'mismatch';

      const bucket = `${field}: ${kind}`;
      bucketCounts[bucket] = (bucketCounts[bucket] ?? 0) + 1;
      candidates.push({
        id: entry.id,
        category: entry.category,
        reader,
        field,
        kind,
        groundTruth: t,
        prediction: p,
        bucket,
      });
    }
  }

  return {
    version: 'v1',
    generatedAt: new Date().toISOString(),
    reader,
    pins,
    totals: { scored, quarantined, candidates: candidates.length },
    bucketCounts,
    candidates,
  };
}

function buildMarkdown(report: DriftReport): string {
  const lines: string[] = [];
  const pin = [report.pins.srVersion, report.pins.osVersion, report.pins.browserVersion]
    .filter(Boolean)
    .join(' · ') || '_not captured_';

  lines.push(`# Speakable Drift Report — ${report.reader}`);
  lines.push('');
  lines.push(`_Generated: ${report.generatedAt}_`);
  lines.push('');
  lines.push(`**Version pins:** ${pin}`);
  lines.push('');
  lines.push(
    'Each row is a **correction candidate**: a place where Speakable diverges from what the real screen reader announced, on the pinned versions above. These are **advisory** — a human reviews them and decides whether the engine should change. A divergence caused by a bad capture is quarantined, not chased. The engine is never auto-mutated from this report.'
  );
  lines.push('');
  lines.push(
    `Scored: **${report.totals.scored}** cases · Quarantined (excluded): **${report.totals.quarantined}** · Correction candidates: **${report.totals.candidates}**.`
  );
  lines.push('');

  lines.push('## Systematic gaps (buckets, most impactful first)');
  lines.push('');
  lines.push('| Bucket | Count |');
  lines.push('|---|---|');
  for (const [bucket, count] of Object.entries(report.bucketCounts).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${bucket} | ${count} |`);
  }
  lines.push('');

  lines.push('## Correction candidates');
  lines.push('');
  lines.push('| Case | Category | Field | Kind | Ground truth | Prediction |');
  lines.push('|---|---|---|---|---|---|');
  for (const c of report.candidates) {
    const gt = c.groundTruth.length ? c.groundTruth.join(' / ') : '(none)';
    const pr = c.prediction.length ? c.prediction.join(' / ') : '(none)';
    lines.push(`| ${c.id} | ${c.category} | ${c.field} | ${c.kind} | ${esc(gt)} | ${esc(pr)} |`);
  }
  lines.push('');

  return lines.join('\n') + '\n';
}

/** Escape pipe characters so table cells don't break. */
function esc(s: string): string {
  return s.replace(/\|/g, '\\|');
}

export function generateDriftReport(reader: Reader): DriftReport {
  const report = buildDriftReport(reader);
  mkdirSync(RESULTS_DIR, { recursive: true });
  writeFileSync(join(RESULTS_DIR, `drift-v1.json`), JSON.stringify(report, null, 2) + '\n', 'utf-8');
  writeFileSync(join(RESULTS_DIR, `drift-v1.md`), buildMarkdown(report), 'utf-8');
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const reader = (process.argv[2] as Reader) ?? 'voiceover';
  const report = generateDriftReport(reader);
  console.log(
    `Drift report written to bench/results/drift-v1.{json,md} — ${report.totals.candidates} candidate(s) across ${report.totals.scored} scored case(s).`
  );
}
