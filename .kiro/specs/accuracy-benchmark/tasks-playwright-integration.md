# Implementation Plan: Playwright Integration & Speakable-in-CI (v2)

## Overview

Evolve the shipped v1 benchmark into a Playwright-driven, CI-schedulable system
and ship the Speakable Playwright matcher as a product surface. Requirements and
design: `playwright-integration.md`. This builds on v1 (`requirements.md`,
`design.md`, `tasks.md`) and MUST NOT change the committed ground-truth /
prediction JSON shapes or break the existing 834-test suite.

**Layer-1 POC is already proven.** A Playwright-launched isolated WebKit browser
+ VoiceOver + `navigateToWebContent()` captured `button-plain` as clean page
content ("Save changes button") with zero chrome contamination — vs v1's Gmail
tab-strip garbage. The deps are installed (`@guidepup/playwright@0.21.0`,
`@guidepup/guidepup@0.38.0`, `@playwright/test@1.64.1`, WebKit browser).

Three layers, built in order, with three checkpoints. Tasks marked `*` are
optional (tests/hardening) and can be deferred for a faster path. Each task
cites the v2 requirement(s) it satisfies.

**Integrity rule carried throughout:** quarantine bad captures; never degrade a
correct engine to match one; corrections stay human-reviewed; accuracy stays
version-pinned and segmented.

## Tasks

- [ ] 1. Phase 1: Playwright capture (Layer 1)
  - [ ] 1.1 Add the committed Playwright + Guidepup config
    - Create `bench/harness/playwright.config.ts` using `withGuidepup()` (WebKit
      for VoiceOver; Chromium acceptable for NVDA on Windows), single worker, no
      retries for capture determinism, generous per-test timeout
    - Record deps already added as devDependencies; confirm `bench/` stays out of
      the published package (`files: ["dist"]`)
    - _Requirements: v2 R1.1, R6.1, R6.3_

  - [ ] 1.2 Port `capture.ts` to a Playwright-driven session
    - Replace the `open <url>` + blind `next()` walk with a `@guidepup/playwright`
      session: launch isolated browser, `page.goto(server.urlFor(file))`, wait for
      load, `screenReader.navigateToWebContent()` to anchor the cursor in the page
    - Reuse the existing 127.0.0.1-only `serve.ts` corpus server unchanged
    - Keep DOM-anchored navigation (navigate relative to known elements, not a
      fixed blind step count) to kill the cursor-walk artifact class
    - Emit ground-truth records in the EXISTING v1 `CaseRecord` shape so
      normalize/score/report/triage/diff are untouched
    - Preserve fail-loud behavior when AT/prereqs are missing; keep closing
      resources cleanly (no tab pile-up — the browser is isolated and torn down)
    - _Requirements: v2 R1.1, R1.2, R1.3, R1.4, R1.5, R1.6_

  - [ ] 1.3 Re-capture VoiceOver and clear the chrome-class quarantine
    - Run the new capture locally on macOS; re-run `triage.ts voiceover`
    - Confirm the 5 `class: "chrome"` quarantine entries now capture clean; remove
      them from `bench/ground-truth/quarantine.json`
    - Re-attempt the 5 `class: "cursor-walk"` heading cases with DOM-anchored
      navigation; clear any that now read correctly, leave the rest quarantined
      with updated reasons
    - Regenerate `benchmark-v1.{json,md}`; record the new scored-case count
    - _Requirements: v2 R1.3, R7.2, R7.3_

  - [ ]* 1.4 Capture-path hardening tests
    - Assert the capture fails loudly (no partial output) when the screen reader
      is unavailable; assert records conform to the v1 `CaseRecord` shape
    - _Requirements: v2 R1.6, R7.2_

- [ ] 2. Checkpoint 1 — Playwright capture proven on the full corpus
  - Surface the recovered quarantine count and regenerated report to the owner.
    Confirm clean capture across the corpus before building co-located prediction.

- [ ] 3. Phase 2: Co-located prediction (Layer 2)
  - [ ] 3.1 Run Speakable prediction against the live Playwright page
    - In the same capture run/`page`, obtain the Prediction by running Speakable's
      analyzer against the live DOM of the navigated page (evaluate in-page or
      extract the serialized DOM) instead of a separate re-parse/re-load
    - Produce prediction records byte-identical in SHAPE to the v1 standalone
      `predict.ts` output
    - _Requirements: v2 R2.1, R2.2, R2.3_

  - [ ] 3.2 Keep the standalone `predict.ts` path working (fallback)
    - Ensure prediction-only runs (no AT, e.g. plain CI) still work via the v1
      path; co-located prediction is additive, not a replacement
    - _Requirements: v2 R2.4, R7.1_

  - [ ]* 3.3 Parity test: co-located vs standalone prediction
    - On a sample of cases, assert the co-located prediction record equals the
      standalone `predict.ts` record (same normalized fields)
    - _Requirements: v2 R2.3_

- [ ] 4. Phase 3a: NVDA-on-Windows CI (Layer 3, automation)
  - [ ] 4.1 Author the GitHub Actions workflow for NVDA capture
    - New workflow (e.g. `.github/workflows/benchmark-capture.yml`) on a Windows
      runner: install deps, Playwright browsers, Guidepup/NVDA setup, run the
      Playwright-driven capture for NVDA, then score + report
    - `workflow_dispatch` (manual trigger) FIRST; schedule added later (Phase 3c)
    - Upload `benchmark-v1.{json,md}` as job artifacts
    - _Requirements: v2 R4.1, R4.2_

  - [ ] 4.2 Stabilize the NVDA CI run
    - Tune waits/timeouts/retries for NVDA capture determinism on the runner;
      confirm NVDA ground truth lands in the committed shape and scores
    - _Requirements: v2 R4.2_

- [ ] 5. Phase 3b: Drift / correction report (Layer 3, improvement signal)
  - [ ] 5.1 Promote `diff.ts` into a committed Drift_Report artifact
    - Extend the existing `diff.ts` bucketing into a machine-readable
      `bench/results/drift-v1.json` + human `drift-v1.md`: per divergence, the
      case, field, GT vs prediction, systematic-gap bucket, and the exact
      Version_Pins so OS-release wording changes are attributable
    - Mark each divergence a Correction_Candidate — advisory only, never applied
    - Emit it from both local runs and the CI job
    - _Requirements: v2 R4.4, R4.5, R4.6, R5.1, R5.3_

  - [ ]* 5.2 Guard the integrity rule
    - Add a note/check that quarantined cases are excluded from Correction_
      Candidates (a bad capture must not masquerade as an engine correction)
    - _Requirements: v2 R5.2_

- [ ] 6. Checkpoint 2 — CI + drift report green
  - Surface the first CI-generated accuracy report and Drift_Report to the owner.
    Confirm before enabling any schedule and before starting the matcher.

- [ ] 7. Phase 4: Speakable Playwright matcher (Layer 3, product)
  - [ ] 7.1 Scaffold the companion package `@reticular/speakable-playwright`
    - New package with `@reticular/speakable` and `@playwright/test` as PEER
      dependencies; no AT/Guidepup runtime dep; its own build + test setup
    - Confirm the core `@reticular/speakable` gains no new dependency
    - _Requirements: v2 R3.1, R3.7, R6.2_

  - [ ] 7.2 Implement the field-level matcher (primary API)
    - `expect(locator).toAnnounce({ role, name, state?, value? }, { reader })`:
      run Speakable prediction on the located element's DOM, normalize via the
      benchmark's normalization, compare semantic fields; rich diff on failure
    - Prediction-only (no AT required); caller selects the Reader's phrasing
    - _Requirements: v2 R3.1, R3.2, R3.3, R3.5_

  - [ ] 7.3 Add the phrase-level convenience wrapper
    - `toAnnounceLike('Save, button', { reader })` normalizing through the same
      pipeline as the field-level matcher
    - _Requirements: v2 R3.2, R3.5_

  - [ ]* 7.4 Optional live-AT verification mode
    - When opted in and AT is present, additionally verify the assertion against a
      live Guidepup capture; absent AT, silently use prediction only
    - _Requirements: v2 R3.4_

  - [ ] 7.5 Document the matcher with examples and dogfood it
    - README with field-level + phrase-level examples and the reader option;
      use the matcher in at least one of our own Playwright tests as a dogfood
    - _Requirements: v2 R3.6_

  - [ ]* 7.6 Matcher unit/integration tests
    - Passing and failing assertions across roles/states; graceful no-AT behavior;
      confirm normalization parity with the benchmark
    - _Requirements: v2 R3.1, R3.3, R3.5_

- [ ] 8. Phase 3c: Schedule + VoiceOver-on-macOS CI (staged)
  - [ ] 8.1 Enable the scheduled trigger
    - Add the `schedule` trigger to the capture workflow at the owner-chosen
      cadence (decided after the first green runs); keep manual trigger
    - _Requirements: v2 R4.1_

  - [ ]* 8.2 Stage VoiceOver-on-macOS CI (tolerated-flaky)
    - Add a macOS-runner VoiceOver capture job as an allowed-to-fail / staged
      path; keep the v1 local VoiceOver capture as fallback until stable
    - _Requirements: v2 R4.3, R7.1_

- [ ] 9. Checkpoint 3 — v2 complete
  - Scheduled capture + drift report running; matcher published and dogfooded;
    v1 shapes intact and suite green. Confirm with the owner before any launch use.

## Scope Guardrails (hold firm)

- No JAWS/Narrator CI automation (v2 R8.1).
- No hosted dashboard; committed + CI-artifact outputs only (v2 R8.2).
- No learned model; corrections stay human-reviewed (v2 R8.3, R5).
- Matcher API kept minimal in its first release (v2 R8.4).
- Never change the committed ground-truth/prediction JSON shape; keep the 834-
  test suite green at every step (v2 R7.2, R7.3).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4"] },
    { "id": 3, "tasks": ["3.1", "3.2"] },
    { "id": 4, "tasks": ["3.3", "4.1"] },
    { "id": 5, "tasks": ["4.2", "5.1"] },
    { "id": 6, "tasks": ["5.2", "7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3"] },
    { "id": 8, "tasks": ["7.4", "7.5", "7.6"] },
    { "id": 9, "tasks": ["8.1", "8.2"] }
  ]
}
```
