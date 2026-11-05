/**
 * v2 ground-truth capture — Playwright-driven, isolated browser.
 *
 * Drives the real screen reader (VoiceOver on WebKit / NVDA on Chromium) over a
 * Playwright-launched ISOLATED browser, so capture reads page content only and
 * NEVER the operator's browser chrome (the v1 contamination class is gone
 * structurally). Uses `navigateToWebContent()` to anchor the cursor in the page
 * deterministically before each walk.
 *
 * Co-located prediction (v2 Layer 2): for each case it ALSO runs Speakable's
 * analyzer against the SAME live page markup, so ground truth and prediction
 * describe one render. Predictions are written for the captured reader; the
 * other reader keeps its standalone prediction from `predict.ts`.
 *
 * Run (from repo root; see bench/README.md for AT prerequisites):
 *   VoiceOver (macOS):  npx playwright test -c bench/harness/playwright.config.ts --project=webkit
 *   NVDA (Windows):     npx playwright test -c bench/harness/playwright.config.ts --project=chromium
 *
 * Output: bench/ground-truth/<reader>/<id>.json  and
 *         bench/predictions/<reader>/<id>.json (co-located).
 */
import { screenReaderTest as test } from '@guidepup/playwright';
import type { IScreenReader } from '@guidepup/guidepup';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { loadManifest } from './manifest.js';
import { createCorpusServer, type CorpusServer } from './serve.js';
import { captureCase, buildRecord, writeRecord, delay, SETTLE_MS, GROUND_TRUTH_DIR } from './capture-core.js';
import { predictStaticFromHtml, getSpeakableVersion } from './predict.js';
import type { Reader } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BENCH_DIR = resolve(__dirname, '..');
const PREDICTIONS_DIR = join(BENCH_DIR, 'predictions');

/** Max time to anchor the cursor in the page before giving up (fail fast, not 10 min). */
const NAVIGATE_TIMEOUT_MS = 30_000;

/** Reject if `promise` doesn't settle within `ms`, labelling the operation. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/** Map the Playwright project name to the reader it drives. */
function readerForProject(projectName: string): Reader {
  if (projectName === 'webkit') return 'voiceover';
  if (projectName === 'chromium') return 'nvda';
  throw new Error(`Unknown project "${projectName}" — expected "webkit" (voiceover) or "chromium" (nvda).`);
}

/** The screen reader utility the Playwright fixture injects (adds navigateToWebContent). */
interface PlaywrightScreenReader extends IScreenReader {
  navigateToWebContent: () => Promise<void>;
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

function writePrediction(record: ReturnType<typeof predictStaticFromHtml>): void {
  const dir = join(PREDICTIONS_DIR, record.reader);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${record.id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf-8');
}

let server: CorpusServer;

test.beforeAll(async () => {
  server = await createCorpusServer();
});

test.afterAll(async () => {
  await server?.close();
});

/**
 * Resume support: set CAPTURE_ONLY_MISSING=1 to skip cases that already have a
 * FRESH capture for this project (matching browserVersion). Lets you re-run
 * after a flake/interrupt without redoing the whole corpus.
 */
const ONLY_MISSING = process.env.CAPTURE_ONLY_MISSING === '1';

function hasFreshCapture(id: string, reader: Reader, browserVersion: string): boolean {
  const p = join(GROUND_TRUTH_DIR, reader, `${id}.json`);
  if (!existsSync(p)) return false;
  try {
    const rec = JSON.parse(readFileSync(p, 'utf-8')) as { browserVersion?: string };
    return rec.browserVersion === browserVersion;
  } catch {
    return false;
  }
}

/**
 * Resolve the active project name at COLLECTION time so resume can filter the
 * case list before any test is registered. Playwright does not expose the
 * `--project` flag via env during collection, so we read it from argv (and fall
 * back to PLAYWRIGHT_PROJECT if a caller prefers to set it explicitly).
 */
function resolveActiveProject(): string {
  const argv = process.argv;
  const i = argv.indexOf('--project');
  if (i !== -1 && argv[i + 1]) return argv[i + 1];
  const inline = argv.find((a) => a.startsWith('--project='));
  if (inline) return inline.split('=')[1];
  return process.env.PLAYWRIGHT_PROJECT ?? '';
}
const activeProject = resolveActiveProject();

/**
 * The cases to register. With CAPTURE_ONLY_MISSING=1 we drop cases that already
 * have a fresh capture for the target browser BEFORE registering tests, so the
 * run lists only the cases that actually need capturing (no noisy skip wall,
 * no per-skip browser startup). When the project can't be resolved at collection
 * time, we fall back to an in-test skip (below) to stay correct.
 */
function casesToRegister() {
  const all = loadManifest();
  if (!ONLY_MISSING) return all;
  // Resolve reader from either project→reader hints; if unknown, register all
  // and let the in-test skip handle it.
  const reader: Reader | null =
    activeProject === 'webkit' ? 'voiceover' : activeProject === 'chromium' ? 'nvda' : null;
  if (!reader) return all;
  return all.filter((e) => !hasFreshCapture(e.id, reader, activeProject));
}

// One Playwright test per corpus case, so a single flaky case is isolated and
// the report shows exactly which cases captured.
for (const entry of casesToRegister()) {
  test(`capture ${entry.id}`, async ({ page, screenReader }, testInfo) => {
    const reader = readerForProject(testInfo.project.name);
    // Fallback in-test skip for when the project wasn't resolvable at collection
    // time (keeps behavior correct even if PLAYWRIGHT_PROJECT is unset).
    test.skip(
      ONLY_MISSING && !activeProject && hasFreshCapture(entry.id, reader, testInfo.project.name),
      'already captured fresh for this browser (CAPTURE_ONLY_MISSING=1)'
    );
    const sr = screenReader as unknown as PlaywrightScreenReader;
    const version = getSpeakableVersion();

    await page.goto(server.urlFor(entry.file), { waitUntil: 'load' });
    // Wait for the body to be ATTACHED, not VISIBLE: some valid cases render a
    // body whose only content is a zero-size element (e.g. an empty
    // `<div role="slider">`), which WebKit reports as hidden. `waitUntil: 'load'`
    // already guarantees the DOM is parsed; attachment is the correct gate here.
    await page.locator('body').waitFor({ state: 'attached' });

    // Co-located prediction: predict against the SAME live markup the reader
    // will navigate (static cases; runtime predictions stay with predict.ts).
    if (entry.mode === 'static') {
      const liveHtml = await page.content();
      writePrediction(predictStaticFromHtml(entry.id, liveHtml, reader, version));
    }

    // Deterministic anchor: move the reader cursor into the page's web content.
    // Bounded so a pathological page (e.g. a body with no visible content) can
    // never hang the whole run for the full test timeout — it fails fast and we
    // record a warning, still capturing whatever the cursor surfaces.
    let anchorWarning: string | null = null;
    try {
      await withTimeout(sr.navigateToWebContent(), NAVIGATE_TIMEOUT_MS, 'navigateToWebContent');
    } catch (err) {
      anchorWarning = `[CAPTURE WARNING] navigateToWebContent failed/slow: ${(err as Error).message}`;
    }
    await delay(SETTLE_MS);

    const rawPhrases = await captureCase(sr, entry);
    if (anchorWarning) rawPhrases.push(anchorWarning);

    const record = buildRecord(entry, reader, rawPhrases, {
      srVersion: `${sr.name ?? reader} ${sr.version ?? ''}`.trim(),
      osVersion: osVersion(),
      browserVersion: testInfo.project.name,
    });
    writeRecord(record);
  });
}
