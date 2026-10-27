/**
 * Field-level diff of predictions vs. ground truth (improvement driver).
 *
 * Not a score — a microscope. For every scored (non-quarantined) case it shows
 * exactly where Speakable's VoiceOver output diverges from what VoiceOver
 * actually said, at the role/name/state level, and buckets the mismatches so we
 * can see the SYSTEMATIC gaps (fix the renderer once, not 20 cases).
 *
 *   Usage:  npx tsx bench/harness/diff.ts [reader]   (default voiceover)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadManifest } from './manifest.js';
import type { CaseRecord, NormalizedPhrase, Reader } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BENCH_DIR = resolve(__dirname, '..');
const GROUND_TRUTH_DIR = join(BENCH_DIR, 'ground-truth');
const PREDICTIONS_DIR = join(BENCH_DIR, 'predictions');
const QUARANTINE_PATH = join(GROUND_TRUTH_DIR, 'quarantine.json');

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

function fieldSet(phrases: NormalizedPhrase[], field: 'role' | 'name' | 'state'): string[] {
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

interface Bucket {
  count: number;
  cases: string[];
}

export function runDiff(reader: Reader): void {
  const entries = loadManifest();
  const quarantine = loadQuarantine();
  const buckets = new Map<string, Bucket>();
  const bump = (label: string, id: string) => {
    const b = buckets.get(label) ?? { count: 0, cases: [] };
    b.count++;
    if (!b.cases.includes(id)) b.cases.push(id);
    buckets.set(label, b);
  };

  const line = '─'.repeat(78);
  console.log(`\nPrediction vs. ground-truth diff: ${reader}\n${line}`);

  for (const entry of entries) {
    if (quarantine.has(`${reader}/${entry.id}`)) continue;
    const truth = read(GROUND_TRUTH_DIR, reader, entry.id);
    const pred = read(PREDICTIONS_DIR, reader, entry.id);
    if (!truth || !pred) continue;

    for (const field of ['role', 'name', 'state'] as const) {
      const t = fieldSet(truth.normalized, field);
      const p = fieldSet(pred.normalized, field);
      if (t.length === 0 && p.length === 0) continue;
      if (eq(t, p)) continue;

      // Bucket the kind of divergence for this field.
      if (t.length > 0 && p.length === 0) bump(`${field}: MISSING (GT has, pred empty)`, entry.id);
      else if (t.length === 0 && p.length > 0) bump(`${field}: EXTRA (pred has, GT empty)`, entry.id);
      else bump(`${field}: MISMATCH (both present, differ)`, entry.id);

      console.log(`\n[${entry.category}] ${entry.id}  —  ${field}`);
      console.log(`    GT  : ${t.length ? t.join(' | ') : '(none)'}`);
      console.log(`    PRED: ${p.length ? p.join(' | ') : '(none)'}`);
    }
  }

  console.log(`\n${line}\nMISMATCH BUCKETS (systematic gaps, most impactful first):\n`);
  const sorted = [...buckets.entries()].sort((a, b) => b[1].count - a[1].count);
  for (const [label, b] of sorted) {
    console.log(`  ${String(b.count).padStart(3)}×  ${label}`);
    console.log(`        ${b.cases.join(', ')}`);
  }
  console.log('');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const reader = (process.argv[2] as Reader) ?? 'voiceover';
  runDiff(reader);
}
