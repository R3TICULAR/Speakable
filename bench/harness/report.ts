/**
 * Report generation: emit benchmark-v1.json (full machine-readable results)
 * and benchmark-v1.md (publishable, honest, version-pinned).
 *
 * The Markdown carries the mandatory framing: fidelity to real screen-reader
 * output on pinned versions, heuristic, complements manual testing, does not
 * guarantee WCAG compliance.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadManifest } from './manifest.js';
import { score, type BenchmarkResult, type SegmentScore } from './score.js';
import type { Reader } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = resolve(__dirname, '..', 'results');
const READERS: Reader[] = ['nvda', 'voiceover'];

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function fieldCell(s: SegmentScore | undefined, field: 'role' | 'name' | 'state' | 'value'): string {
  if (!s) return '—';
  const fa = s[field];
  if (fa.applicable === 0) return 'n/a';
  return `${pct(fa.rate)} (${fa.matched}/${fa.applicable})`;
}

function pin(result: BenchmarkResult, reader: Reader): string {
  const p = result.pins[reader];
  if (!p) return '_not captured_';
  return [p.srVersion, p.osVersion, p.browserVersion].filter(Boolean).join(' · ') || '_not captured_';
}

function buildMarkdown(result: BenchmarkResult): string {
  const anyScored = READERS.some((r) => result.overall[r]);
  const lines: string[] = [];

  lines.push('# Speakable Accuracy Benchmark — v1');
  lines.push('');
  lines.push(`_Generated: ${result.generatedAt}_`);
  lines.push('');

  // Framing (mandatory, verbatim intent)
  lines.push('## What this measures');
  lines.push('');
  lines.push(
    'This benchmark measures Speakable\'s **fidelity to real screen-reader output** on a fixed, version-pinned corpus. Ground truth is what the real screen reader actually announces, captured with Guidepup on the pinned OS/browser/SR versions below.'
  );
  lines.push('');
  lines.push(
    'It is a **fidelity benchmark, not a correctness proof.** Speakable is heuristic. It complements manual testing and does not replace it, and it does not guarantee WCAG compliance. Results are scored at the semantic-field level (role, name, state, value), not raw transcript equality.'
  );
  lines.push('');

  // Version pins
  lines.push('## Version pins');
  lines.push('');
  lines.push('| Reader | SR · OS · Browser |');
  lines.push('|---|---|');
  lines.push(`| NVDA | ${pin(result, 'nvda')} |`);
  lines.push(`| VoiceOver | ${pin(result, 'voiceover')} |`);
  lines.push('');

  // Coverage
  lines.push('## Coverage');
  lines.push('');
  lines.push(`Corpus: **${result.coverage.totalCases}** cases.`);
  lines.push('');
  lines.push('| Reader | Predicted | Ground truth | Scored |');
  lines.push('|---|---|---|---|');
  for (const r of READERS) {
    const c = result.coverage.readers[r];
    lines.push(`| ${r} | ${c.predicted} | ${c.groundTruth} | ${c.scored} |`);
  }
  lines.push('');

  const quarantined = result.coverage.incomplete.filter((m) => m.includes('quarantined'));
  if (quarantined.length) {
    lines.push(`> **${quarantined.length} case(s) quarantined** and excluded from scoring because the capture is unreliable — either the cursor read browser chrome instead of the page, or the cursor walk dropped/duplicated/mis-read page content. These are capture problems, not engine problems; the engine is never degraded to match a bad capture. Listed under Incomplete pairs below; they rejoin scoring once re-captured cleanly.`);
    lines.push('');
  }

  if (!anyScored) {
    lines.push('> **No ground truth captured yet.** Predictions have been generated, but no real screen-reader ground truth is present, so no accuracy can be reported. Run `bench/harness/capture.ts` on macOS (VoiceOver) and Windows (NVDA) to capture ground truth, commit it, then regenerate this report. See `bench/README.md`.');
    lines.push('');
    if (result.coverage.incomplete.length) {
      lines.push('### Incomplete pairs');
      lines.push('');
      for (const msg of result.coverage.incomplete.slice(0, 50)) lines.push(`- ${msg}`);
      if (result.coverage.incomplete.length > 50) {
        lines.push(`- …and ${result.coverage.incomplete.length - 50} more`);
      }
      lines.push('');
    }
    return lines.join('\n') + '\n';
  }

  // Headline
  if (result.headline) {
    lines.push('## Headline');
    lines.push('');
    lines.push(`**${pct(result.headline.value)}** — ${result.headline.metric}.`);
    lines.push('');
    lines.push('_Shown alongside the segmented table below and the version pins above; it is not a standalone score._');
    lines.push('');
  }

  // Per-field × reader (overall)
  lines.push('## Per-field accuracy by reader');
  lines.push('');
  lines.push('| Reader | Role | Name | State | Value | False+ rate | False− rate | Timeline P/R |');
  lines.push('|---|---|---|---|---|---|---|---|');
  for (const r of READERS) {
    const s = result.overall[r];
    if (!s) {
      lines.push(`| ${r} | — | — | — | — | — | — | — |`);
      continue;
    }
    const tl = s.timeline ? `${pct(s.timeline.precision)} / ${pct(s.timeline.recall)}` : 'n/a';
    lines.push(
      `| ${r} | ${fieldCell(s, 'role')} | ${fieldCell(s, 'name')} | ${fieldCell(s, 'state')} | ${fieldCell(s, 'value')} | ${pct(s.falsePositiveRate)} | ${pct(s.falseNegativeRate)} | ${tl} |`
    );
  }
  lines.push('');

  // False positive / negative callout
  lines.push('## False positives and false negatives');
  lines.push('');
  lines.push('A **false positive** is Speakable announcing something the real screen reader did not (the retention killer). A **false negative** is the real screen reader announcing something Speakable missed.');
  lines.push('');
  for (const r of READERS) {
    const s = result.overall[r];
    if (s) lines.push(`- **${r}**: ${s.falsePositives} false positive(s), ${s.falseNegatives} false negative(s) across scored fields.`);
  }
  lines.push('');

  // Per-category segmentation
  lines.push('## By category');
  lines.push('');
  const categories = Object.keys(result.byCategory).sort();
  for (const r of READERS) {
    if (!result.overall[r]) continue;
    lines.push(`### ${r}`);
    lines.push('');
    lines.push('| Category | Role | Name | State | Value |');
    lines.push('|---|---|---|---|---|');
    for (const cat of categories) {
      const s = result.byCategory[cat]?.[r];
      lines.push(`| ${cat} | ${fieldCell(s, 'role')} | ${fieldCell(s, 'name')} | ${fieldCell(s, 'state')} | ${fieldCell(s, 'value')} |`);
    }
    lines.push('');
  }

  // Where you still need manual testing — derived from lowest-scoring segments
  lines.push('## Where you still need manual testing');
  lines.push('');
  const weakest = lowestSegments(result);
  if (weakest.length === 0) {
    lines.push('No segments scored below threshold on this run.');
  } else {
    lines.push('These segments scored lowest and are where you should point manual screen-reader testing:');
    lines.push('');
    for (const w of weakest) lines.push(`- **${w.category}** (${w.reader}), ${w.field}: ${pct(w.rate)}`);
  }
  lines.push('');

  if (result.coverage.incomplete.length) {
    lines.push('## Incomplete pairs');
    lines.push('');
    lines.push('Cases not scored (quarantined contamination, or a missing prediction/ground-truth side). Listed so coverage gaps stay visible rather than silently dropped.');
    lines.push('');
    for (const msg of result.coverage.incomplete.slice(0, 50)) lines.push(`- ${msg}`);
    if (result.coverage.incomplete.length > 50) {
      lines.push(`- …and ${result.coverage.incomplete.length - 50} more`);
    }
    lines.push('');
  }

  lines.push('## Reproduce');
  lines.push('');
  lines.push('See `bench/README.md` for prerequisites, version pins, and the commands to re-capture ground truth and regenerate this report.');
  lines.push('');

  return lines.join('\n') + '\n';
}

/** Collect the lowest-scoring (category, reader, field) cells for the manual-testing guidance. */
function lowestSegments(
  result: BenchmarkResult
): Array<{ category: string; reader: Reader; field: string; rate: number }> {
  const rows: Array<{ category: string; reader: Reader; field: string; rate: number }> = [];
  for (const [cat, byReader] of Object.entries(result.byCategory)) {
    for (const r of READERS) {
      const s = byReader[r];
      if (!s) continue;
      for (const field of ['role', 'name', 'state', 'value'] as const) {
        if (s[field].applicable > 0) rows.push({ category: cat, reader: r, field, rate: s[field].rate });
      }
    }
  }
  return rows.filter((x) => x.rate < 0.9).sort((a, b) => a.rate - b.rate).slice(0, 8);
}

/** Generate both report artifacts. */
export function generateReport(): BenchmarkResult {
  // Ensure the corpus is valid before reporting on it.
  loadManifest();
  const result = score();

  mkdirSync(RESULTS_DIR, { recursive: true });
  writeFileSync(join(RESULTS_DIR, 'benchmark-v1.json'), JSON.stringify(result, null, 2) + '\n', 'utf-8');
  writeFileSync(join(RESULTS_DIR, 'benchmark-v1.md'), buildMarkdown(result), 'utf-8');
  return result;
}

// Allow running directly: `tsx bench/harness/report.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = generateReport();
  console.log('Report written to bench/results/benchmark-v1.{json,md}');
  console.log(`Scored: nvda=${result.coverage.readers.nvda.scored}, voiceover=${result.coverage.readers.voiceover.scored}`);
}
