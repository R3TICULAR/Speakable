/**
 * Speakable prediction capture.
 *
 * Runs Speakable's own pipeline over each corpus case to produce its PREDICTED
 * announcement output per reader, written in the same normalized CaseRecord
 * shape as ground truth so scoring is apples-to-apples.
 *
 *   static  → parseHTML → buildAccessibilityTree → renderNVDA / renderVoiceOver
 *   runtime → captureTimeline (runtime engine) over the manifest interaction
 *
 * No OS or assistive-technology dependency: this is the fastest stage to
 * validate the whole pipeline end-to-end.
 *
 * Imports Speakable through its source modules (same approach the Storybook
 * addon uses), so it reflects the shipped public API.
 */

import { readFileSync, mkdirSync, writeFileSync, readFileSync as rf } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { parseHTML } from '../../src/parser/html-parser.js';
import { buildAccessibilityTree } from '../../src/extractor/tree-builder.js';
import { renderNVDA } from '../../src/renderer/nvda-renderer.js';
import { renderVoiceOver } from '../../src/renderer/voiceover-renderer.js';
import { loadManifest, CORPUS_DIR } from './manifest.js';
import { normalizePhrases } from './normalize.js';
import type { CaseRecord, ManifestEntry, Reader } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BENCH_DIR = resolve(__dirname, '..');
const PREDICTIONS_DIR = join(BENCH_DIR, 'predictions');

const READERS: Reader[] = ['nvda', 'voiceover'];

function speakableVersion(): string {
  try {
    const pkg = JSON.parse(rf(resolve(__dirname, '..', '..', 'package.json'), 'utf-8')) as { version: string };
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

/** Render the static announcement string for a reader from a parsed model. */
function renderStatic(reader: Reader, model: ReturnType<typeof buildAccessibilityTree>['model']): string {
  return reader === 'nvda' ? renderNVDA(model, false) : renderVoiceOver(model, false);
}

/** Produce a prediction CaseRecord for one static case + reader. */
function predictStatic(entry: ManifestEntry, reader: Reader, version: string): CaseRecord {
  const html = readFileSync(join(CORPUS_DIR, entry.file), 'utf-8');
  const { document } = parseHTML(html);
  const root = document.body ?? document.documentElement;
  const { model } = buildAccessibilityTree(root as unknown as Element);
  const output = renderStatic(reader, model);
  const rawPhrases = output.split('\n').map((l) => l.trim()).filter(Boolean);
  return {
    id: entry.id,
    reader,
    mode: 'static',
    speakableVersion: version,
    rawPhrases,
    normalized: normalizePhrases(rawPhrases),
  };
}

function writeRecord(record: CaseRecord): void {
  const dir = join(PREDICTIONS_DIR, record.reader);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${record.id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf-8');
}

/**
 * Predict all cases for both readers. Runtime cases are delegated to
 * predictRuntime (added in task 3.2); for now static cases are fully handled.
 */
export async function predictAll(): Promise<{ written: number; skipped: string[] }> {
  const entries = loadManifest();
  const version = speakableVersion();
  let written = 0;
  const skipped: string[] = [];

  for (const entry of entries) {
    for (const reader of READERS) {
      if (entry.mode === 'static') {
        writeRecord(predictStatic(entry, reader, version));
        written++;
      } else {
        // Runtime prediction is implemented in predict-runtime.ts (task 3.2).
        const { predictRuntime } = await import('./predict-runtime.js');
        try {
          writeRecord(await predictRuntime(entry, reader, version));
          written++;
        } catch (err) {
          skipped.push(`${entry.id} (${reader}): ${(err as Error).message}`);
        }
      }
    }
  }

  return { written, skipped };
}

// Allow running directly: `tsx bench/harness/predict.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  predictAll().then(({ written, skipped }) => {
    console.log(`Predictions written: ${written}`);
    if (skipped.length) {
      console.log(`Skipped ${skipped.length}:`);
      skipped.forEach((s) => console.log('  - ' + s));
    }
  });
}
