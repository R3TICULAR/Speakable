/**
 * Ground-truth capture via Guidepup (the oracle).
 *
 * Drives the REAL screen reader available on the current OS — VoiceOver on
 * macOS, NVDA on Windows — navigates each corpus case, and records the actual
 * spoken phrases. This is the only stage that depends on OS + assistive tech.
 *
 * OS-aware: it captures whichever reader `detect()`s as supported, writes
 * per-reader ground-truth files, and FAILS LOUDLY with setup instructions if
 * the reader/Guidepup prerequisites are not configured. It NEVER silently
 * skips cases.
 *
 * Run on macOS to capture VoiceOver, and separately on Windows to capture
 * NVDA; commit both per-reader directories and the two merge for scoring.
 *
 *   Usage:  npx tsx bench/harness/capture.ts
 *
 * Prerequisites (see bench/README.md):
 *   macOS:   npx @guidepup/setup   (grants VoiceOver automation permission)
 *   Windows: npx @guidepup/setup   (installs a bundled, Guidepup-compatible NVDA)
 */

import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
// Guidepup is a dev-only dependency; types resolve from node_modules.
import { voiceOver, nvda, VoiceOverCommanderCommands } from '@guidepup/guidepup';
import type { IScreenReader } from '@guidepup/guidepup';
import { loadManifest } from './manifest.js';
import { createCorpusServer, type CorpusServer } from './serve.js';
import { normalizePhrases } from './normalize.js';
import type { CaseRecord, ManifestEntry, Reader } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BENCH_DIR = resolve(__dirname, '..');
const GROUND_TRUTH_DIR = join(BENCH_DIR, 'ground-truth');

/** Settle time (ms) after navigating / performing an interaction before reading the log. */
const SETTLE_MS = 500;
/** How many cursor steps to walk a static case (bounded; most cases are 1-5 elements). */
const MAX_STATIC_STEPS = 8;

class CaptureSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CaptureSetupError';
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Resolve the single reader supported on this OS, or fail loudly. */
function resolveReader(): { reader: Reader; sr: IScreenReader } {
  if (voiceOver.detect()) return { reader: 'voiceover', sr: voiceOver as unknown as IScreenReader };
  if (nvda.detect()) return { reader: 'nvda', sr: nvda as unknown as IScreenReader };
  throw new CaptureSetupError(
    [
      'No supported screen reader detected for this OS.',
      'Ground-truth capture requires VoiceOver (macOS) or NVDA (Windows).',
      'Run on a macOS machine for VoiceOver, or a Windows machine for NVDA.',
      'One-time setup: npx @guidepup/setup   (see bench/README.md).',
    ].join('\n')
  );
}

/** Best-effort OS version string for the version pins. */
function osVersion(): string {
  try {
    if (process.platform === 'darwin') return `macOS ${execSync('sw_vers -productVersion').toString().trim()}`;
    if (process.platform === 'win32') return `Windows ${execSync('ver').toString().trim()}`;
  } catch {
    /* fall through */
  }
  return process.platform;
}

/**
 * Open a URL in a browser the screen reader can read. v1 uses the OS default
 * browser via `open`/`start`; this keeps the harness dependency-light. The
 * capture then drives the real reader's cursor over the rendered page.
 */
function openInBrowser(url: string): void {
  const cmd = process.platform === 'darwin' ? `open "${url}"` : `start "" "${url}"`;
  execSync(cmd);
}

/**
 * Close the frontmost browser tab so cases don't pile up (dozens of tabs).
 * macOS: dispatch Cmd-W to the active app via AppleScript. Best-effort — a
 * failure here must never abort capture.
 */
function closeFrontTab(): void {
  if (process.platform !== 'darwin') return;
  try {
    execSync(
      `osascript -e 'tell application "System Events" to keystroke "w" using command down'`,
      { stdio: 'ignore' }
    );
  } catch {
    /* best-effort; ignore */
  }
}

/**
 * Move the reader cursor INTO the page's web content before walking.
 *
 * The capture opens each case in a real, already-running browser, so the
 * VoiceOver cursor can start parked in browser chrome (tab strip, toolbar) and
 * read that instead of the page — the contamination triage flagged. Resetting
 * to the top of the window and interacting into the web area gives a
 * deterministic, page-anchored starting position. VoiceOver-only; best-effort.
 */
async function focusWebContent(sr: IScreenReader, reader: Reader): Promise<void> {
  if (reader !== 'voiceover') return;
  const vo = sr as unknown as {
    perform: (command: unknown) => Promise<void>;
    interact: () => Promise<void>;
  };
  try {
    // Reset the cursor to a known anchor, then descend into the web content area.
    await vo.perform(VoiceOverCommanderCommands.GO_TO_TOP_OF_WINDOW);
    await delay(150);
    await vo.interact(); // enter the group under the cursor (the web area)
    await delay(150);
  } catch {
    /* best-effort: if these commands aren't available, fall through to a plain walk */
  }
}

/**
 * Capture spoken phrases for a single static case.
 *
 * Walks the reading cursor forward, stopping early once the spoken-phrase log
 * stops growing (two consecutive steps with no new phrase). This avoids the
 * fixed-count over-walk that produced duplicate/empty noise on short pages.
 */
async function captureStatic(sr: IScreenReader): Promise<string[]> {
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

/**
 * Perform one runtime action against the reader. Key-send failures ("Unable to
 * send keys", transient VoiceOver focus loss, etc.) are caught and surfaced as
 * a WARNING phrase rather than aborting the whole run. A single flaky case
 * must not throw away the other 66. Returns a warning string if the action
 * failed, otherwise null.
 */
async function performAction(
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
        // Reader-driven activation of the focused item (click-by-selector is
        // not expressible via the SR cursor alone; cases should Tab to the
        // target then rely on act() / Enter).
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

/** Narrow a manifest entry's interaction to its action list, or null. */
function getActions(entry: ManifestEntry) {
  const interaction = entry.interaction;
  return interaction && 'actions' in interaction ? interaction.actions : null;
}

/** Capture ordered spoken phrases while performing a case's interaction. */
async function captureRuntime(sr: IScreenReader, entry: ManifestEntry): Promise<string[]> {
  await sr.clearSpokenPhraseLog();
  const actions = getActions(entry);
  const warnings: string[] = [];

  if (actions) {
    for (const action of actions) {
      const warning = await performAction(sr, action);
      if (warning) warnings.push(warning);
    }
  } else {
    // Named-pattern runtime cases: v1 capture falls back to a keyboard walk,
    // since translating a named pattern to real-SR keystrokes without the DOM
    // selectors is lossy. Document this limitation in the record notes upstream.
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

function writeRecord(record: CaseRecord): void {
  const dir = join(GROUND_TRUTH_DIR, record.reader);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${record.id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf-8');
}

export async function captureAll(): Promise<{ reader: Reader; captured: number }> {
  const entries = loadManifest();
  const { reader, sr } = resolveReader(); // throws CaptureSetupError if unsupported

  const srVersion = `${sr.name} ${sr.version}`;
  const os = osVersion();

  let server: CorpusServer | undefined;
  let captured = 0;

  try {
    server = await createCorpusServer();

    // Preflight: starting the reader is where missing permissions surface.
    try {
      await sr.start();
    } catch (err) {
      throw new CaptureSetupError(
        [
          `Failed to start ${reader}. Guidepup prerequisites are likely not configured.`,
          'Run the one-time setup:  npx @guidepup/setup',
          'macOS also requires granting VoiceOver automation permission (see bench/README.md).',
          `Underlying error: ${(err as Error).message}`,
        ].join('\n')
      );
    }

    try {
      for (const entry of entries) {
        openInBrowser(server.urlFor(entry.file));
        await delay(SETTLE_MS);
        // Anchor the cursor in the page before walking, so we read page content
        // rather than browser chrome (fixes the contamination triage flagged).
        await focusWebContent(sr, reader);

        let rawPhrases: string[];
        try {
          rawPhrases =
            entry.mode === 'static' ? await captureStatic(sr) : await captureRuntime(sr, entry);
        } catch (err) {
          // A case-level failure (e.g. reader focus lost) must not abort the
          // run. Record what we can with a warning and keep going.
          rawPhrases = [`[CAPTURE WARNING] ${entry.id} failed: ${(err as Error).message}`];
        }

        writeRecord({
          id: entry.id,
          reader,
          mode: entry.mode,
          srVersion,
          osVersion: os,
          browserVersion: 'os-default',
          rawPhrases,
          normalized: normalizePhrases(rawPhrases),
        });
        captured++;

        // Close the tab we just opened so cases don't pile up (60+ tabs).
        closeFrontTab();
        await delay(150);
      }
    } finally {
      await sr.stop();
    }
  } finally {
    await server?.close();
  }

  return { reader, captured };
}

// Allow running directly: `tsx bench/harness/capture.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  captureAll()
    .then(({ reader, captured }) => {
      console.log(`Captured ${captured} ${reader} ground-truth case(s) to bench/ground-truth/${reader}/`);
    })
    .catch((err: Error) => {
      // Fail loudly with setup guidance; non-zero exit.
      console.error(`\nGround-truth capture failed:\n${err.message}\n`);
      process.exit(1);
    });
}
