# Design Document

## Overview

The Accuracy Benchmark is a self-contained, dev-only toolchain under `bench/` that measures how closely Speakable's predicted screen-reader output matches what real screen readers (NVDA, VoiceOver) actually announce on a fixed, version-pinned corpus. It is a **fidelity** measurement against a real-SR **oracle**, not a correctness proof.

The pipeline has five stages, each a small script in `bench/harness/`, connected by committed JSON artifacts:

```
corpus/ ──serve──▶ capture.ts ──▶ ground-truth/<reader>/<id>.json
                      (Guidepup, OS-aware, committed)
                                           │
corpus/ ──────────▶ predict.ts  ──▶ predictions/<reader>/<id>.json
                      (Speakable API/CLI, no AT)         │
                                           ▼             ▼
                                     normalize.ts (shared, both sides)
                                           │
                                           ▼
                                        score.ts ──▶ report.ts ──▶ results/benchmark-v1.{json,md}
```

The design decisions below are inherited from `SPEC.md` and are intentionally not re-litigated: fidelity-not-correctness, NVDA+VoiceOver only, ~100 cases, Guidepup as oracle, semantic-field scoring, committed ground truth, honest segmented reporting, dev-only isolation.

## Architecture

### Why committed JSON between stages

Ground-truth capture requires a Mac (VoiceOver) and a Windows (NVDA) machine; prediction and scoring require neither. Decoupling the stages through committed JSON files means:
- Capture runs rarely (only on version bumps), on the one machine that has the reader.
- `predict` → `normalize` → `score` → `report` run anywhere, anytime, in CI or on a laptop, with no AT installed.
- The two readers can be captured on separate machines and merged by committing per-reader directories.

This is the single most important structural choice: it keeps the expensive, environment-bound step (real-SR capture) out of the common path.

### Normalized record shape (the contract between all stages)

Both ground truth and predictions are written in one shape so comparison is apples-to-apples. This is the interface every stage agrees on:

```ts
// A single parsed phrase.
interface NormalizedPhrase {
  raw: string;                 // the original spoken phrase (post lowercase/trim only)
  role?: string;               // canonical role token, e.g. "navigation", "button"
  name?: string;               // accessible name
  state?: string[];            // canonical state tokens, e.g. ["expanded"], ["checked"]
  value?: string;              // form/widget value
}

interface CaseRecord {
  id: string;
  reader: 'nvda' | 'voiceover';
  mode: 'static' | 'runtime';
  // version pins (ground truth only; predictions record Speakable version)
  srVersion?: string;
  osVersion?: string;
  browserVersion?: string;
  speakableVersion?: string;
  rawPhrases: string[];        // ordered, as emitted by SR or Speakable
  normalized: NormalizedPhrase[]; // ordered, parsed into semantic fields
}
```

Ground-truth and prediction files are the same `CaseRecord` shape, differing only in which version fields are populated. `score.ts` reads matching pairs by `(reader, id)`.

## Components and Interfaces

### 1. Manifest schema (`bench/corpus/manifest.json`)

```ts
type Interaction =
  | null
  | { pattern: 'modal-dialog' | 'combobox' | 'tabs' | 'accordion' }
  | { actions: InteractionAction[] }; // reuses Speakable's runtime InteractionAction type

interface ManifestEntry {
  id: string;                  // unique, kebab-case, e.g. "button-icon-only-aria-label"
  category: string;            // one of the §3 categories (slug form)
  file: string;                // path relative to bench/corpus/, e.g. "buttons-links/button-icon-only-aria-label.html"
  mode: 'static' | 'runtime';
  interaction: Interaction;    // null for static; pattern or actions for runtime
  notes: string;               // human description of the behavior under test
}
```

A `loadManifest()` helper validates: unique ids (Req 1.8), every `file` exists (Req 1.7), `static` ⇒ `interaction === null` (Req 1.3), `runtime` ⇒ interaction present (Req 1.4). It throws a descriptive error naming the offending `id` on any violation.

The `actions` shape reuses Speakable's existing `InteractionAction` discriminated union from `src/runtime/types.ts` (`click`/`tab`/`arrowDown`/`enter`/`escape`/`wait`/etc.), so runtime manifest entries are directly consumable by `captureTimeline`.

### 2. Local server (`bench/harness/serve.ts`)

A minimal static file server over Node's `http` module, serving `bench/corpus/` with correct `text/html` content type.

- `createCorpusServer(opts?): { url: string; close: () => Promise<void> }`
- Binds explicitly to `127.0.0.1` on an ephemeral port (`server.listen(0, '127.0.0.1')`), never `0.0.0.0` (Req 2.2). Returns the resolved `http://127.0.0.1:<port>` base URL.
- Each case URL is `${base}/${entry.file}`.

Using the project's existing dev-server pattern is a non-goal; a tiny purpose-built static server is simpler and avoids coupling the benchmark to the Next.js site.

### 3. Capture (`bench/harness/capture.ts`) — the oracle

OS-aware entry point that captures real-SR ground truth for whichever reader the current OS supports.

```ts
async function captureAll(opts: { outDir: string }): Promise<void>;
```

Flow:
1. Detect OS via `process.platform`: `darwin` → VoiceOver, `win32` → NVDA (Req 3.2, 3.3). Any other platform fails loudly.
2. Preflight: verify Guidepup prerequisites (VoiceOver automation permission on macOS; bundled NVDA on Windows). If not ready, throw with the exact setup command (`npx @guidepup/setup` on macOS) and documentation pointer (Req 3.4). **Never skip silently.**
3. Start the corpus server (§2) and launch the real SR via Guidepup (`@guidepup/guidepup`, optionally `@guidepup/playwright` to drive the page).
4. Capture the active SR/OS/browser versions up front (Req 3.8).
5. For each manifest case:
   - Navigate to the case URL.
   - `static`: move the SR reading cursor across the target element(s), read `spokenPhraseLog()` (VoiceOver) / NVDA equivalent (Req 3.5).
   - `runtime`: drive the manifest interaction (pattern or actions), collecting the ordered spoken-phrase log across the interaction (Req 3.6).
   - Normalize via `normalize.ts` and write `bench/ground-truth/<reader>/<id>.json` as a `CaseRecord` (Req 3.7, 3.10).

Guidepup is the oracle: it drives the *real* reader, so its phrase log is treated as truth. The capture step is the only one that depends on OS + AT, and it is designed to run on two machines independently and merge via per-reader directories.

> Verification note: the exact Guidepup API for cursor movement and the NVDA phrase-log accessor must be confirmed against the installed Guidepup version during implementation (task 5). The design commits to "use Guidepup's spoken-phrase log"; the precise method names are an implementation detail to pin at build time, not guess here.

### 4. Predict (`bench/harness/predict.ts`) — Speakable's output

Runs Speakable's own pipeline per case per reader, no OS/AT dependency (Req 4.5). This is the fastest stage to validate end-to-end, so it is built before capture.

- `static` cases: call the library API directly against the case HTML:
  `parseHTML(html)` → `buildAccessibilityTree(doc.body)` → `renderNVDA(model)` / `renderVoiceOver(model)`. The rendered announcement string is split into phrases and normalized.
- `runtime` cases: use `captureTimeline(document, { sequence })` from `@reticular/speakable/browser`, running the same interaction the manifest declares. The resulting timeline's announcement-bearing events are converted to ordered phrases and normalized.
  - Because `captureTimeline` needs a live DOM, this stage runs the runtime cases in a jsdom or headless-browser context (decide at build time; jsdom is already a dependency and sufficient for the DOM the templates use).
- Writes `bench/predictions/<reader>/<id>.json` as a `CaseRecord` with `speakableVersion` populated (Req 4.4), same normalized shape as ground truth.

Reusing the shipped public API (not internal reach-ins) keeps the prediction faithful to what users actually get.

### 5. Normalize (`bench/harness/normalize.ts`) — the integrity-critical core

One module, applied identically to both sides (Req 5.1). Two layers:

**Layer A — text normalization:** lowercase, collapse internal whitespace, strip trailing punctuation (Req 5.2).

**Layer B — semantic-field parsing:** parse a normalized phrase into `{ role, name, state, value }` (Req 5.5). This is done with a documented, conservative token map:
- A canonical role table maps per-reader role phrasings to one token (e.g. `navigation landmark` and `navigation` → `navigation`; `edit` / `edit text` → `textbox`). This preserves the per-reader *difference in wording* in `rawPhrases` while extracting the *shared meaning* into `role` (Req 5.3, 5.4).
- A canonical state table maps `collapsed`/`not expanded` → `expanded:false`, `checked`/`ticked` → `checked:true`, etc.
- The remaining non-role, non-state text is the candidate accessible `name`.

The module exports the token tables as data (not buried in logic) so a reviewer can read exactly what is collapsed (Req 5.6). A dedicated test suite pins behavior on hand-written phrase examples. The guardrail is explicit in code comments: **conservative over flattering** (Req 5.7). Anything ambiguous is left in `raw` and not forced into a field.

### 6. Score (`bench/harness/score.ts`)

Consumes matched `(reader, id)` pairs of ground-truth and prediction `CaseRecord`s.

Per-field accuracy (Req 6.1): for each of `role`, `name`, `state`, `value`, over the set of cases where the ground-truth phrase has that field populated (field is "applicable"), the match rate = (cases where prediction's corresponding field equals ground truth) / (applicable cases).

False-positive / false-negative (Req 6.2, 6.3), computed over phrases/fields:
- **FP**: a field/phrase present in prediction but absent in ground truth (Speakable over-announced).
- **FN**: a field/phrase present in ground truth but absent in prediction (Speakable missed it).

Runtime timeline fidelity (Req 6.4): align the two ordered phrase sequences (longest-common-subsequence over normalized phrases) and report event-level precision = matched/predicted, recall = matched/truth, preserving order.

Segmentation (Req 6.5): every metric is bucketed by `category` and by `reader`. Output is a nested structure, never a single scalar (Req 6.6).

Headline figure (Req 6.7), only if requested by the report: semantic-field accuracy over `role`+`name`+`state` on `static` cases, carried alongside the segmented table.

### 7. Report (`bench/harness/report.ts`)

- Emits `bench/results/benchmark-v1.json`: the full nested score structure + per-case detail + version metadata (Req 7.1).
- Emits `bench/results/benchmark-v1.md` (Req 7.2) with: methodology (corpus size/composition, Guidepup-as-oracle, normalization summary, version pins — Req 7.3), the per-field × reader table with per-category segmentation, the FP/FN callout, a "Where you still need manual testing" section built from the lowest-scoring segments (Req 7.5), and repro instructions linking `bench/README.md`.
- The report header and methodology carry the honest framing verbatim: fidelity to real SR output on pinned versions, heuristic, complements manual testing, does not guarantee WCAG compliance (Req 7.4), plus the exact version pins (Req 7.6).

## Data Models

The `CaseRecord` and `NormalizedPhrase` shapes above are the only cross-stage contracts. `ManifestEntry` is the input contract. Score output is a nested `BenchmarkResult`:

```ts
interface FieldAccuracy { applicable: number; matched: number; rate: number }
interface SegmentScore {
  role: FieldAccuracy; name: FieldAccuracy; state: FieldAccuracy; value: FieldAccuracy;
  falsePositiveRate: number; falseNegativeRate: number;
  timeline?: { precision: number; recall: number }; // runtime segments only
}
interface BenchmarkResult {
  version: 'v1';
  pins: { nvda?: VersionInfo; voiceover?: VersionInfo }; // per reader
  overall: Record<'nvda' | 'voiceover', SegmentScore>;
  byCategory: Record<string, Record<'nvda' | 'voiceover', SegmentScore>>;
  headline: { metric: 'role+name+state static'; value: number };
  cases: Array<{ id: string; reader: string; /* per-field pass/fail detail */ }>;
}
```

## Build Order (phased, with checkpoints)

Mirrors `SPEC.md` §10. Each phase is independently valuable; two hard checkpoints gate progress.

1. Scaffold `bench/` + manifest schema + loader + `127.0.0.1` static server.
2. Author ~20 static cases across categories (enough to exercise the full pipeline before scaling).
3. Build `normalize.ts` (text layer + semantic-field parser) + unit tests on hand-written phrases.
4. Build `predict.ts` (no AT dependency) and confirm normalized output on the 20 cases.
5. Build `capture.ts` with Guidepup for the current OS's reader; document setup; fail loudly if unconfigured.
6. Build `score.ts` + `report.ts`; produce first `benchmark-v1.{json,md}` on the 20-case set. **← Checkpoint 1: surface results, stop before publishing.**
7. Scale corpus to ~100 and add runtime/interaction cases (reuse Speakable's interaction patterns).
8. Capture VoiceOver ground truth on macOS and NVDA on Windows; merge; regenerate report. **← Checkpoint 2: surface full results, stop before publishing.**

## Error Handling

- **Manifest violations** (missing file, duplicate id, mode/interaction mismatch): fail fast with the offending `id` named (Req 1.7, 1.8).
- **Guidepup/AT not configured**: fail loudly with the exact setup command and doc link; never skip (Req 3.4).
- **Unsupported OS for capture**: explicit error naming the detected platform and which readers are supported where.
- **Missing prediction or ground-truth pair at score time**: report the orphaned `(reader, id)` as a skipped/incomplete case in the output rather than silently dropping it, so coverage gaps are visible.
- **Server binding**: assert the bound address is `127.0.0.1` after `listen`; abort if not (Req 2.2).

## Testing Strategy

- **`normalize.ts`** gets the most testing: a unit suite of hand-written SR phrases (both NVDA and VoiceOver phrasings) asserting the parsed `{ role, name, state, value }` and that the token tables neither over- nor under-collapse. This is the integrity surface.
- **`loadManifest()`**: unit tests for duplicate-id, missing-file, and mode/interaction-mismatch errors.
- **`serve.ts`**: a test asserting it binds `127.0.0.1` and serves a known case file with `text/html`.
- **`score.ts`**: unit tests on small synthetic ground-truth/prediction pairs covering a known FP, a known FN, a per-field match/miss, and a runtime ordered-timeline precision/recall case.
- **`capture.ts`** is not unit-tested against real AT in CI (environment-bound); its preflight/fail-loudly path is tested with a stubbed "prerequisites missing" condition.

## Isolation and Packaging

- All code lives under `bench/`; Guidepup and any Playwright dependency are added to the **root devDependencies**, never dependencies (Req 9.2).
- The published package `files` field already restricts the npm tarball to `dist`; confirm `bench/` is excluded so it never ships (Req 9.3).
- The harness is TypeScript run via the project's existing TS tooling; it imports Speakable through its public entry points (`@reticular/speakable`, `@reticular/speakable/browser`) exactly as a consumer would, keeping predictions faithful.
