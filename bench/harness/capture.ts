/**
 * v1 ground-truth capture (legacy / fallback).
 *
 * Opens each case in the OS default browser via `open`/`start` and drives the
 * Guidepup screen-reader singleton over it. Superseded by the Playwright-driven
 * capture (`capture.spec.ts`), which launches an ISOLATED browser and cannot
 * read the operator's browser chrome. This path is retained as a fallback while
 * VoiceOver-on-CI stabilizes (v2 R7.1) and for environments without Playwright.
 *
 * It shares the walk + record logic with the v2 path via `capture-core.ts`, so
 * both emit the identical `CaseRecord` shape.
 *
 *   Usage:  npx tsx bench/harness/capture.ts
 *
 * Prerequisites: see bench/README.md (Node 22, screen-reader permissions).
 */

import { execSync } from 'child_process';
import { voiceOver, nvda, VoiceOverCommanderCommands } from '@guidepup/guidepup';
import type { IScreenReader } from '@guidepup/guidepup';
import { loadManifest } from './manifest.js';
import { createCorpusServer, type CorpusServer } from './serve.js';
import { captureCase, buildRecord, writeRecord, delay, SETTLE_MS } from './capture-core.js';
import type { Reader } from './types.js';

class CaptureSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CaptureSetupError';
  }
}

/** Resolve the single reader supported on this OS, or fail loudly. */
function resolveReader(): { reader: Reader; sr: IScreenReader } {
  if (voiceOver.detect()) return { reader: 'voiceover', sr: voiceOver as unknown as IScreenReader };
  if (nvda.detect()) return { reader: 'nvda', sr: nvda as unknown as IScreenReader };
  throw new CaptureSetupError(
    [
      'No supported screen reader detected for this OS.',
      'Ground-truth capture requires VoiceOver (macOS) or NVDA (Windows).',
      'Prefer the Playwright capture: npx playwright test -c bench/harness/playwright.config.ts',
      'One-time setup: npx @guidepup/setup setup && npx @guidepup/setup install (see bench/README.md).',
    ].join('\n')
  );
}

function osVersion(): string {
  try {
    if (process.platform === 'darwin') return `macOS ${execSync('sw_vers -productVersion').toString().trim()}`;
    if (process.platform === 'win32') return `Windows ${execSync('ver').toString().trim()}`;
  } catch {
    /* fall through */
  }
  return process.platform;
}

function openInBrowser(url: string): void {
  const cmd = process.platform === 'darwin' ? `open "${url}"` : `start "" "${url}"`;
  execSync(cmd);
}

/** Close the frontmost browser tab (macOS) so cases don't pile up. Best-effort. */
function closeFrontTab(): void {
  if (process.platform !== 'darwin') return;
  try {
    execSync(`osascript -e 'tell application "System Events" to keystroke "w" using command down'`, {
      stdio: 'ignore',
    });
  } catch {
    /* best-effort; ignore */
  }
}

/**
 * Anchor the cursor in the page's web content before walking. Without an
 * isolated browser the cursor can start in chrome; reset to the top of the
 * window and interact into the web area. VoiceOver-only; best-effort.
 */
async function focusWebContent(sr: IScreenReader, reader: Reader): Promise<void> {
  if (reader !== 'voiceover') return;
  const vo = sr as unknown as {
    perform: (command: unknown) => Promise<void>;
    interact: () => Promise<void>;
  };
  try {
    await vo.perform(VoiceOverCommanderCommands.GO_TO_TOP_OF_WINDOW);
    await delay(150);
    await vo.interact();
    await delay(150);
  } catch {
    /* best-effort */
  }
}

export async function captureAll(): Promise<{ reader: Reader; captured: number }> {
  const entries = loadManifest();
  const { reader, sr } = resolveReader(); // throws CaptureSetupError if unsupported

  const versions = {
    srVersion: `${sr.name} ${sr.version}`,
    osVersion: osVersion(),
    browserVersion: 'os-default',
  };

  let server: CorpusServer | undefined;
  let captured = 0;

  try {
    server = await createCorpusServer();

    try {
      await sr.start();
    } catch (err) {
      throw new CaptureSetupError(
        [
          `Failed to start ${reader}. Guidepup prerequisites are likely not configured.`,
          'Run the one-time setup:  npx @guidepup/setup setup && npx @guidepup/setup install',
          'macOS also requires Accessibility + Full Disk Access for the terminal (see bench/README.md).',
          `Underlying error: ${(err as Error).message}`,
        ].join('\n')
      );
    }

    try {
      for (const entry of entries) {
        openInBrowser(server.urlFor(entry.file));
        await delay(SETTLE_MS);
        await focusWebContent(sr, reader);

        const rawPhrases = await captureCase(sr, entry);
        writeRecord(buildRecord(entry, reader, rawPhrases, versions));
        captured++;

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
      console.error(`\nGround-truth capture failed:\n${err.message}\n`);
      process.exit(1);
    });
}
