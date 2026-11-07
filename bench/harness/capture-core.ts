/**
 * Screen-reader-agnostic capture logic shared by both capture paths:
 *   - v1 `capture.ts`            (OS `open` + Guidepup singleton; legacy/fallback)
 *   - v2 `capture.spec.ts`       (Playwright-driven, isolated browser; preferred)
 *
 * Centralizing the walk + record building here guarantees BOTH paths emit the
 * identical `CaseRecord` shape, so normalize/score/report/triage/diff are
 * untouched regardless of which capture path produced the ground truth
 * (v2 requirements R1.5, R2.3).
 *
 * This module performs NO process/OS/browser control. It only drives an
 * already-started screen reader (the `IScreenReader` interface) and shapes the
 * output. Dev-only.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { IScreenReader } from '@guidepup/guidepup';
import { normalizePhrases } from './normalize.js';
import type { CaseRecord, ManifestEntry, Reader } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BENCH_DIR = resolve(__dirname, '..');
export const GROUND_TRUTH_DIR = join(BENCH_DIR, 'ground-truth');

/** Settle time (ms) after navigating / performing an interaction before reading the log. */
export const SETTLE_MS = 500;
/** How many cursor steps to walk a static case (bounded; most cases are 1-5 elements). */
export const MAX_STATIC_STEPS = 8;

export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Capture spoken phrases for a single static case.
 *
 * Walks the reading cursor forward, stopping early once the spoken-phrase log
 * stops growing (two consecutive steps with no new phrase). This avoids the
 * fixed-count over-walk that produced duplicate/empty noise on short pages.
 */
export async function captureStatic(sr: IScreenReader): Promise<string[]> {
  await sr.clearSpokenPhraseLog();
  let lastLen = 0;
  let stagnant = 0;
  for (let i = 0; i < MAX_STATIC_STEPS; i++) {
    await sr.next();
    const log = await sr.spokenPhraseLog();
    if (log.length === lastLen) {
      if (++stagnant >= 2) break; // cursor is no longer surfacing new content
    } else {
      stagnant = 0;
      lastLen = log.length;
    }
  }
  await delay(SETTLE_MS);
  return sr.spokenPhraseLog();
}

/** Narrow a manifest entry's interaction to its action list, or null. */
export function getActions(entry: ManifestEntry) {
  const interaction = entry.interaction;
  return interaction && 'actions' in interaction ? interaction.actions : null;
}

/**
 * Perform one runtime action against the reader. Key-send failures ("Unable to
 * send keys", transient focus loss, etc.) are caught and surfaced as a WARNING
 * phrase rather than aborting the whole run. A single flaky case must not throw
 * away the others. Returns a warning string if the action failed, else null.
 */
export async function performAction(
  sr: IScreenReader,
  action: NonNullable<ReturnType<typeof getActions>>[number]
): Promise<string | null> {
  try {
    switch (action.type) {
      case 'tab':
        await sr.press('Tab');
        break;
      case 'shiftTab':
        await sr.press('Shift+Tab');
        break;
      case 'enter':
        await sr.press('Enter');
        break;
      case 'space':
        await sr.press('Space');
        break;
      case 'escape':
        await sr.press('Escape');
        break;
      case 'arrowUp':
        await sr.press('Up');
        break;
      case 'arrowDown':
        await sr.press('Down');
        break;
      case 'arrowLeft':
        await sr.press('Left');
        break;
      case 'arrowRight':
        await sr.press('Right');
        break;
      case 'key':
        await sr.press(action.combo);
        break;
      case 'click':
        await sr.act();
        break;
      case 'wait':
        await delay(action.ms);
        break;
    }
    await delay(100);
    return null;
  } catch (err) {
    return `[CAPTURE WARNING] action "${action.type}" failed: ${(err as Error).message}`;
  }
}

/** Capture ordered spoken phrases while performing a case's interaction. */
export async function captureRuntime(sr: IScreenReader, entry: ManifestEntry): Promise<string[]> {
  await sr.clearSpokenPhraseLog();
  const actions = getActions(entry);
  const warnings: string[] = [];

  if (actions) {
    for (const action of actions) {
      const warning = await performAction(sr, action);
      if (warning) warnings.push(warning);
    }
  } else {
    // Named-pattern runtime cases fall back to a keyboard walk, since
    // translating a named pattern to real-SR keystrokes without DOM selectors
    // is lossy.
    for (let i = 0; i < MAX_STATIC_STEPS; i++) {
      try {
        await sr.next();
      } catch (err) {
        warnings.push(`[CAPTURE WARNING] next() failed: ${(err as Error).message}`);
        break;
      }
    }
  }

  await delay(SETTLE_MS);
  const phrases = await sr.spokenPhraseLog();
  return warnings.length ? [...phrases, ...warnings] : phrases;
}

/**
 * Capture one case (static or runtime) against an already-anchored reader and
 * return the raw spoken phrases. Case-level failures are caught and returned as
 * a single warning phrase so one bad case never aborts the run.
 */
export async function captureCase(sr: IScreenReader, entry: ManifestEntry): Promise<string[]> {
  try {
    return entry.mode === 'static' ? await captureStatic(sr) : await captureRuntime(sr, entry);
  } catch (err) {
    return [`[CAPTURE WARNING] ${entry.id} failed: ${(err as Error).message}`];
  }
}

/** Build a normalized ground-truth record from raw phrases + capture metadata. */
export function buildRecord(
  entry: ManifestEntry,
  reader: Reader,
  rawPhrases: string[],
  versions: { srVersion: string; osVersion: string; browserVersion: string }
): CaseRecord {
  return {
    id: entry.id,
    reader,
    mode: entry.mode,
    srVersion: versions.srVersion,
    osVersion: versions.osVersion,
    browserVersion: versions.browserVersion,
    rawPhrases,
    normalized: normalizePhrases(rawPhrases),
  };
}

/** Write a ground-truth record to bench/ground-truth/<reader>/<id>.json. */
export function writeRecord(record: CaseRecord): void {
  const dir = join(GROUND_TRUTH_DIR, record.reader);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${record.id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf-8');
}
