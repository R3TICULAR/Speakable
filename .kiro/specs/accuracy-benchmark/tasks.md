# Implementation Plan: Accuracy Benchmark

## Overview

Build a dev-only benchmark under `bench/` that measures Speakable's fidelity to real screen-reader output (NVDA + VoiceOver) on a ~100-case corpus, using Guidepup as the oracle. Five harness stages connected by committed JSON: serve → capture → predict → normalize → score → report. Built in phases with two hard checkpoints (after the 20-case end-to-end run, and after the full capture) before any publishing.

Tasks marked `*` are optional (tests/edge coverage) and can be deferred for a faster path to the first end-to-end result. Each task cites the requirements it satisfies.

## Tasks

- [ ] 1. Phase 1: Scaffold and corpus foundation
  - [ ] 1.1 Scaffold `bench/` structure and the manifest schema + loader
    - Create `bench/` with `corpus/`, `harness/`, `ground-truth/`, `predictions/`, `results/` directories
    - Define the `ManifestEntry` and `Interaction` types in `bench/harness/types.ts` (reuse Speakable's `InteractionAction` from `src/runtime/types.ts` for the `actions` shape)
    - Implement `loadManifest(path)` in `bench/harness/manifest.ts`: parse `manifest.json`, validate unique ids, existing files, and `static ⇒ interaction null` / `runtime ⇒ interaction present`; throw descriptive errors naming the offending `id`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.8_

  - [ ] 1.2 Build the local corpus server `bench/harness/serve.ts`
    - Implement `createCorpusServer()` using Node `http`, serving `bench/corpus/` with `text/html` content type
    - Bind explicitly to `127.0.0.1` on an ephemeral port; assert the bound address is `127.0.0.1` after `listen` and abort otherwise
    - Return `{ url, close }`; each case URL is `${url}/${entry.file}`
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 1.3 Unit tests for manifest loader and server
    - Test `loadManifest` rejects duplicate ids, missing files, and mode/interaction mismatches with id-naming errors
    - Test `createCorpusServer` binds `127.0.0.1` and serves a known case file as `text/html`
    - _Requirements: 1.7, 1.8, 2.2_

  - [ ] 1.4 Author ~20 static corpus cases across categories
    - Write minimal self-contained HTML files under `bench/corpus/<category>/` for buttons & links, form controls, headings & structure, landmarks, ARIA states, and a few edge/negative cases
    - Add their manifest entries (`mode: "static"`, `interaction: null`)
    - Keep each case to one behavior; populate `notes`
    - _Requirements: 1.1, 1.2, 1.3, 1.6_

- [ ] 2. Phase 2: Normalization core (integrity-critical)
  - [ ] 2.1 Implement `bench/harness/normalize.ts`
    - Define `NormalizedPhrase` and `CaseRecord` shapes in `bench/harness/types.ts`
    - Layer A: lowercase, collapse whitespace, strip trailing punctuation
    - Layer B: parse phrases into `{ role, name, state, value }` using documented, data-driven canonical role and state token tables (exported as data, not buried in logic)
    - Preserve meaningful per-reader differences in `raw`; leave ambiguous text unparsed rather than force a field
    - Add code comments stating the conservative-over-flattering guardrail
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 2.2 Unit tests for normalization (the integrity surface)
    - Hand-written NVDA and VoiceOver phrase examples asserting parsed `role`/`name`/`state`/`value`
    - Assert role canonicalization (e.g. "navigation landmark" and "navigation" → `navigation`) without erasing distinct meaning
    - Assert the token tables neither over-collapse nor under-collapse on boundary examples
    - _Requirements: 5.3, 5.4, 5.5, 5.7_

- [ ] 3. Phase 3: Speakable prediction (no AT dependency)
  - [ ] 3.1 Implement `bench/harness/predict.ts` for static cases
    - For each `static` case, read the HTML and run `parseHTML` → `buildAccessibilityTree` → `renderNVDA`/`renderVoiceOver` via the public `@reticular/speakable` API
    - Split rendered output into phrases, normalize via `normalize.ts`, write `bench/predictions/<reader>/<id>.json` as a `CaseRecord` with `speakableVersion` populated
    - Run with no OS/AT dependency
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

  - [ ] 3.2 Extend `predict.ts` for runtime cases
    - For each `runtime` case, run `captureTimeline(document, { sequence })` from `@reticular/speakable/browser` in a jsdom/headless context, using the manifest's interaction (pattern or actions)
    - Convert announcement-bearing timeline events to ordered phrases, normalize, write prediction `CaseRecord`
    - _Requirements: 4.3, 4.4_

  - [ ] 3.3 Confirm predict output end-to-end on the 20 static cases
    - Run `predict.ts` over the Phase 1 corpus; confirm it emits well-formed normalized `CaseRecord`s for both readers
    - _Requirements: 4.1, 4.4_

- [ ] 4. Phase 4: Scoring and report (first end-to-end on 20 cases)
  - [ ] 4.1 Implement `bench/harness/score.ts`
    - Load matched `(reader, id)` ground-truth/prediction pairs
    - Per-field accuracy for `role`/`name`/`state`/`value` over applicable cases
    - False-positive and false-negative rates
    - Runtime timeline fidelity via LCS alignment → event-level precision/recall for runtime cases
    - Segment every metric by category and reader; emit the nested `BenchmarkResult` (never a single scalar); compute the role+name+state static headline alongside
    - Report orphaned `(reader, id)` pairs as incomplete rather than dropping them
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 4.2 Unit tests for scoring
    - Synthetic pairs covering a known FP, a known FN, per-field match/miss, and a runtime ordered-timeline precision/recall case
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 4.3 Implement `bench/harness/report.ts`
    - Emit `bench/results/benchmark-v1.json` with per-case, per-field, per-reader results, aggregates, and version metadata
    - Emit `bench/results/benchmark-v1.md` with methodology, per-field × reader table with per-category segmentation, FP/FN callout, "Where you still need manual testing" from lowest-scoring segments, and repro instructions
    - Include honest framing (fidelity/heuristic/complements manual/no WCAG guarantee) and exact version pins in the header
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 4.4 Produce the first report on the 20-case set (predictions only where ground truth is absent)
    - Generate `benchmark-v1.{json,md}` end-to-end to validate the full pipeline shape before any real capture
    - _Requirements: 7.1, 7.2_

- [ ] 5. Checkpoint 1 — end-to-end on 20 cases
  - Surface the generated report and pipeline shape to the owner. Do not publish. Stop and confirm before scaling.

- [ ] 6. Phase 5: Ground-truth capture via Guidepup
  - [ ] 6.1 Add Guidepup dev tooling and document prerequisites
    - Add `@guidepup/guidepup` (and `@guidepup/playwright` if used) to root **devDependencies** only
    - Write `bench/README.md`: prerequisites, one-time setup for macOS (`npx @guidepup/setup`, VoiceOver automation permission) and Windows (bundled NVDA), exact version pins, and reproduce commands; note ground truth is re-captured only on version bumps
    - _Requirements: 8.1, 8.2, 8.3, 9.1, 9.2_

  - [ ] 6.2 Implement `bench/harness/capture.ts` (OS-aware oracle)
    - Detect OS (`darwin` → voiceover, `win32` → nvda); error on unsupported platforms naming what runs where
    - Preflight Guidepup/AT readiness; FAIL LOUDLY with the exact setup command and doc link; never skip silently
    - Start the corpus server, launch the real SR, record exact SR/OS/browser versions
    - `static`: move the SR cursor across target element(s), collect spoken-phrase log; `runtime`: drive the manifest interaction, collect ordered spoken-phrase log
    - Normalize and write `bench/ground-truth/<reader>/<id>.json` as a `CaseRecord` with version pins; per-reader directory so machines merge
    - Confirm the exact Guidepup phrase-log/cursor API against the installed version during implementation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [ ]* 6.3 Test the capture preflight fail-loudly path
    - With a stubbed "prerequisites missing" condition, assert `capture.ts` throws setup instructions and does not write partial output
    - _Requirements: 3.4_

- [ ] 7. Phase 6: Scale corpus and full capture
  - [ ] 7.1 Scale the corpus to ~100 cases including runtime/interaction cases
    - Add remaining static cases to reach the §3 category distribution
    - Add runtime cases (modal-dialog focus trap, combobox arrow-nav, tabs, accordion, disclosure) reusing Speakable's interaction patterns in their manifest `interaction`
    - _Requirements: 1.6, 1.4_

  - [ ] 7.2 Capture both readers and regenerate the report
    - Capture VoiceOver ground truth on macOS and NVDA ground truth on Windows; commit per-reader `ground-truth/` directories; merge
    - Re-run predict → score → report to produce the full `benchmark-v1.{json,md}`
    - _Requirements: 3.9, 3.10, 7.1, 7.2_

  - [ ] 7.3 Verify package isolation
    - Confirm `bench/` is excluded from the published npm tarball (`files` restricts to `dist`) and that no new runtime dependency was added to `@reticular/speakable`
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 8. Checkpoint 2 — full run
  - Surface the full segmented results to the owner. Do not publish. Confirm the honest framing and version pins before any launch/SEO use.

## Scope Guardrails (hold firm)

- v1 is NVDA + VoiceOver only; no JAWS/Narrator automation (Req 10.1, 10.2).
- No hosted/CI dashboard; committed JSON + Markdown only (Req 10.3).
- Semantic-field scoring, never raw transcript equality (Req 10.4).
- Normalization stays conservative and auditable; a flattering-but-fishy number is worse than an honest mediocre one.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3"] },
    { "id": 4, "tasks": ["4.1", "4.3"] },
    { "id": 5, "tasks": ["4.2", "4.4"] },
    { "id": 6, "tasks": ["6.1", "6.2"] },
    { "id": 7, "tasks": ["6.3", "7.1"] },
    { "id": 8, "tasks": ["7.2", "7.3"] }
  ]
}
```
