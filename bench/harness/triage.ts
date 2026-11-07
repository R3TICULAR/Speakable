/**
 * Ground-truth triage (calibration gate).
 *
 * Capture drives the REAL VoiceOver cursor over a real, already-running
 * browser. When the cursor starts outside the web content area it reads the
 * browser's own UI (tab strip, toolbar, menus) instead of the page, producing
 * garbage ground truth. This script scans every captured ground-truth file and
 * flags that contamination so we know how many cases are trustworthy BEFORE
 * scoring the predictor against them.
 *
 * It mutates nothing. It only reads bench/ground-truth/<reader>/*.json and
 * prints a classification report (clean / contaminated / empty) with reasons.
 *
 *   Usage:  npx tsx bench/harness/triage.ts [reader]
 *           reader defaults to "voiceover".
 *
 * Exit code is 0 always — this is a report, not a gate that fails CI (capture
 * is a local, AT-dependent step).
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { CaseRecord, Reader } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BENCH_DIR = resolve(__dirname, '..');
const GROUND_TRUTH_DIR = join(BENCH_DIR, 'ground-truth');

/**
 * Signatures that a phrase came from the BROWSER'S OWN UI rather than the page.
 * These are matched against the lowercased raw phrase.
 *
 * - "memory usage" / "mb tab, group": Chrome's per-tab memory readout in the
 *   tab strip (the strongest single tell we saw).
 * - "tab, group" trailing: a browser tab chip announced as a grouped tab.
 * - "leaving ": VoiceOver's boundary announcement as the cursor crosses from
 *   page content into chrome ("Leaving <page>. ...").
 * - toolbar / address / reload / menu pop up: browser chrome controls.
 */
interface ContaminationRule {
  readonly label: string;
  readonly test: (lower: string) => boolean;
}

const CONTAMINATION_RULES: readonly ContaminationRule[] = [
  { label: 'chrome-tab-memory', test: (s) => s.includes('memory usage') || /\bmb tab\b/.test(s) },
  { label: 'chrome-tab-chip', test: (s) => /\btab, group$/.test(s) },
  { label: 'cursor-left-page', test: (s) => s.startsWith('leaving ') },
  {
    label: 'browser-toolbar',
    test: (s) =>
      /\b(address and search|reload this page|back button|forward button)\b/.test(s) ||
      s.includes('menu pop up') ||
      s.includes('toolbar'),
  },
];

type Verdict = 'clean' | 'contaminated' | 'empty';

interface CaseTriage {
  id: string;
  mode: CaseRecord['mode'];
  verdict: Verdict;
  /** Distinct contamination labels found. */
  reasons: string[];
  /** Count of non-empty raw phrases. */
  signalCount: number;
  /** Count of contaminated raw phrases. */
  contaminatedCount: number;
  /** First meaningful phrase, for eyeballing. */
  sample: string;
}

function triageRecord(rec: CaseRecord): CaseTriage {
  const nonEmpty = rec.rawPhrases.map((p) => p.trim()).filter((p) => p.length > 0);
  const reasons = new Set<string>();
  let contaminatedCount = 0;

  for (const phrase of nonEmpty) {
    const lower = phrase.toLowerCase();
    let hit = false;
    for (const rule of CONTAMINATION_RULES) {
      if (rule.test(lower)) {
        reasons.add(rule.label);
        hit = true;
      }
    }
    if (hit) contaminatedCount++;
  }

  let verdict: Verdict;
  if (nonEmpty.length === 0) {
    verdict = 'empty';
  } else if (contaminatedCount === 0) {
    verdict = 'clean';
  } else {
    // Any chrome contamination makes the case untrustworthy as ground truth,
    // since it means the cursor was (at least partly) outside the page.
    verdict = 'contaminated';
  }

  return {
    id: rec.id,
    mode: rec.mode,
    verdict,
    reasons: [...reasons].sort(),
    signalCount: nonEmpty.length,
    contaminatedCount,
    sample: nonEmpty[0] ?? '',
  };
}

function loadRecords(reader: Reader): CaseRecord[] {
  const dir = join(GROUND_TRUTH_DIR, reader);
  if (!existsSync(dir)) {
    throw new Error(
      `No ground truth found at bench/ground-truth/${reader}/.\n` +
        'Run capture first:  npx tsx bench/harness/capture.ts'
    );
  }
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf-8')) as CaseRecord);
}

function pct(n: number, total: number): string {
  return total === 0 ? '0%' : `${Math.round((n / total) * 100)}%`;
}

export function runTriage(reader: Reader): CaseTriage[] {
  const records = loadRecords(reader);
  const results = records.map(triageRecord);

  const clean = results.filter((r) => r.verdict === 'clean');
  const contaminated = results.filter((r) => r.verdict === 'contaminated');
  const empty = results.filter((r) => r.verdict === 'empty');
  const total = results.length;

  const line = '─'.repeat(72);
  console.log(`\nGround-truth triage: ${reader}  (${total} cases)\n${line}`);

  if (contaminated.length) {
    console.log(`\n⚠  CONTAMINATED (${contaminated.length}/${total}, ${pct(contaminated.length, total)}) — cursor read browser chrome, NOT the page:\n`);
    for (const r of contaminated) {
      console.log(`   ✗ ${r.id.padEnd(32)} [${r.mode}]  ${r.contaminatedCount}/${r.signalCount} phrases  (${r.reasons.join(', ')})`);
      console.log(`       e.g. "${truncate(r.sample)}"`);
    }
  }

  if (empty.length) {
    console.log(`\n·  EMPTY (${empty.length}/${total}, ${pct(empty.length, total)}) — no spoken phrases captured:\n`);
    for (const r of empty) {
      console.log(`   · ${r.id.padEnd(32)} [${r.mode}]`);
    }
  }

  console.log(`\n✓  CLEAN (${clean.length}/${total}, ${pct(clean.length, total)}) — page content only:\n`);
  for (const r of clean) {
    console.log(`   ✓ ${r.id.padEnd(32)} [${r.mode}]  e.g. "${truncate(r.sample)}"`);
  }

  console.log(`\n${line}`);
  console.log(`SUMMARY:  ${clean.length} clean · ${contaminated.length} contaminated · ${empty.length} empty  (of ${total})`);
  console.log(`TRUSTWORTHY FOR SCORING: ${clean.length}/${total} (${pct(clean.length, total)})\n`);

  return results;
}

function truncate(s: string, n = 64): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// Allow running directly: `tsx bench/harness/triage.ts [reader]`
if (import.meta.url === `file://${process.argv[1]}`) {
  const reader = (process.argv[2] as Reader) ?? 'voiceover';
  try {
    runTriage(reader);
  } catch (err) {
    console.error(`\nTriage failed:\n${(err as Error).message}\n`);
    process.exit(1);
  }
}
