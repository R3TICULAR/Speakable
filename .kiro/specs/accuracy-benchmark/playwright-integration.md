# Playwright Integration & Speakable-in-CI — Design & Requirements (v2)

## Status

Proposal. Extends the shipped v1 benchmark (see `requirements.md`, `design.md`,
`tasks.md`). This document is reviewable on its own; no code moves until it is
accepted. Where v1 and v2 conflict, this document notes the change explicitly.

## Why this exists (origin + thesis)

Two real pressures drive this, and both must stay visible in every decision:

1. **The pain that started it.** Triaging user-submitted tickets meant manually
   reproducing screen-reader behavior across macOS and Windows by hand, with no
   tooling. That does not scale and it is miserable.
2. **The trust question.** Speakable is, by necessity, a **heuristic** engine,
   not a deterministic one. The first serious question any client asks is *"how
   do we trust it / how accurate is it?"* The benchmark is the honest answer.

v1 answered #2 as an **offline** benchmark: capture ground truth once, score
Speakable against it, publish a report. Building it surfaced a bigger idea that
answers #1 **and** turns the benchmark into product leverage:

> **Speakable's natural home is *next to* the real screen reader in CI — the
> fast, cross-platform, per-commit inner loop that real AT can't be. The
> periodic real-AT run is what keeps Speakable honest; Speakable is what makes
> screen-reader-aware CI affordable on every commit.**

This is not "replace Guidepup." It is "Speakable is the affordable layer;
Guidepup is the periodic oracle that calibrates it." That division is the
market point.

## The integrity line (non-negotiable, carried from v1)

Everything here must preserve the rule we have held all session:

- We **quarantine bad captures**; we **never degrade a correct engine** to match
  a bad capture (see the heading cases in `bench/ground-truth/quarantine.json`).
- The engine is **not** auto-mutated from capture output. Capture surfaces
  **human-reviewed correction candidates**; a person (or later a reviewed
  codegen step) promotes them. Auto-chasing capture noise is the forbidden kind
  of "massaging."
- Reported accuracy is always version-pinned and segmented, never a lone number.

## What changes vs v1, in one table

| Concern | v1 (shipped) | v2 (this doc) |
|---|---|---|
| Browser | OS default via `open`, your real tabs | Playwright-launched, isolated, clean profile |
| Cursor start | nondeterministic (chrome contamination) | deterministic, page-anchored |
| Prediction vs capture | separate stages, separate page loads | **co-located**: same live page, same run |
| Trigger | manual local ritual (Node 22, FDA) | scheduled CI job (+ local still supported) |
| Output | accuracy report | accuracy report **+ drift/correction report** |
| Product surface | none (internal tooling) | **Speakable Playwright matcher** (shippable) |
| Readers in CI | none automated | NVDA-on-Windows first, VoiceOver-on-macOS staged |

What is explicitly **unchanged** and must not be rewritten: `manifest`,
`normalize`, `score`, `report`, `triage`, `diff`, the corpus, the prediction
*shape*, and the 834-test suite. v1 decoupled capture behind committed JSON
precisely so the capture engine can be swapped as a contained change.

---

## Architecture

### Three layers, built in order

```
Layer 1  Playwright capture        — clean, isolated, deterministic ground truth
Layer 2  Co-located prediction     — Speakable + Guidepup against ONE live page
Layer 3  Product surface + CI      — the matcher API + scheduled two-output job
```

### Layer 1 — Playwright-driven capture

Replace `capture.ts`'s `open <url>` + blind `next()` walk with a
`@guidepup/playwright` session:

- Playwright launches its **own** browser (isolated profile, no personal tabs),
  navigates to the corpus server URL, and the Guidepup `voiceOver`/`nvda`
  driver walks the page. This structurally eliminates the chrome-contamination
  class (the 5 `chrome` quarantine entries) — not via a band-aid, by removing
  the shared-browser premise.
- Navigation is anchored to **known DOM elements** rather than a fixed step
  count, which removes the `cursor-walk` artifact class (the 5 quarantined
  heading cases: dropped h1, mis-read `aria-level`, over-walk).
- The corpus server (`serve.ts`, 127.0.0.1-only) is reused unchanged.

### Layer 2 — Co-located prediction (the structural win)

Today prediction and capture load the page **separately**. v2 runs them against
the **same Playwright `page`** in one pass per case:

1. `page.goto(caseUrl)`.
2. Run Speakable's analyzer against the **live DOM of that exact page** →
   Prediction.
3. Drive the real screen reader over the **same rendered page** → Ground_Truth.
4. Emit both records (same normalized shape as v1) for scoring.

This kills the entire "were the two sides even looking at the same render?"
error class, and it is how a real customer's pipeline would actually call
Speakable (against their live page, not a re-parse).

### Layer 3 — Product surface + scheduled CI

**3a. The Speakable Playwright matcher (the shippable feature).**
A reusable assertion customers drop into their *own* Playwright suites:

```ts
// illustrative, not final API
await expect(page.locator('#save')).toAnnounceLike('Save, button', {
  reader: 'voiceover',        // which reader's phrasing to predict
});
```

- Runs **Speakable only** — fast, headless, cross-platform, no AT required.
- Degrades gracefully: AT absent → Speakable prediction is the assertion; AT
  present (opt-in) → can additionally verify against live Guidepup.
- This is the benchmark's scoring/normalization logic promoted to a **public
  API**; the benchmark becomes its reference implementation.

**3b. The scheduled job emits two artifacts, not one:**

- **Accuracy report** (`benchmark-v1.{json,md}`) — the trust answer. Unchanged
  shape from v1.
- **Drift / correction report** — machine-readable `diff.ts` output: "VoiceOver
  `<pinned version>` says X where Speakable predicts Y," bucketed by systematic
  gap. This is the ticket-triage tool the origin story needed, and the feed for
  human-reviewed engine corrections. SR-version pins make it a **regression
  detector for new OS releases** that silently change AT wording.

---

## Requirements

Format follows `requirements.md` (EARS-style). New glossary terms:

- **PW_Session**: a `@guidepup/playwright` run pairing a Playwright browser with
  a real screen-reader driver.
- **Matcher**: the shippable Speakable Playwright assertion (Layer 3a).
- **Drift_Report**: the machine-readable prediction-vs-ground-truth divergence
  artifact (Layer 3b), bucketed by systematic gap.
- **Correction_Candidate**: a single divergence in the Drift_Report proposed for
  human review as a possible engine fix. Never auto-applied.

### Requirement 1: Playwright-driven capture

**User Story:** As a benchmark maintainer, I want capture to run in an isolated,
Playwright-controlled browser so that ground truth is clean and deterministic
and the chrome-contamination class cannot occur.

1. THE capture path SHALL drive the real screen reader via a PW_Session using a
   Playwright-launched browser with an isolated profile.
2. THE PW_Session SHALL NOT use the operator's default browser or existing
   browser session.
3. THE capture SHALL navigate the screen-reader cursor relative to known DOM
   elements rather than a fixed blind step count.
4. THE capture SHALL reuse the existing 127.0.0.1-only corpus server.
5. THE capture SHALL emit ground-truth records in the existing v1 normalized
   shape, so `normalize`, `score`, `report`, `triage`, and `diff` are unchanged.
6. WHERE the screen reader or Playwright/Guidepup prerequisites are missing, THE
   capture SHALL fail loudly with setup instructions and SHALL NOT silently skip
   cases (carried from v1 R3.4).

### Requirement 2: Co-located prediction

**User Story:** As a benchmark maintainer, I want Speakable's prediction and the
real-AT capture taken against the same live page in one run so that comparison
cannot drift between two separate renders.

1. FOR each case, THE capture run SHALL obtain the Prediction by running
   Speakable's analyzer against the live DOM of the same page the screen reader
   navigates.
2. THE Prediction and Ground_Truth for a case SHALL be produced within the same
   PW_Session against the same navigated URL.
3. THE co-located prediction SHALL produce records identical in shape to v1
   predictions, so scoring is unaffected.
4. WHERE co-located prediction is unavailable (e.g. prediction-only CI without
   AT), THE harness SHALL still support the v1 standalone `predict.ts` path.

### Requirement 3: The Speakable Playwright matcher

**User Story:** As a Speakable user, I want a Playwright matcher so that I can
assert screen-reader-aware expectations in my own CI on every commit without
installing a screen reader.

1. THE Matcher SHALL ship as a **separate companion package**
   (`@reticular/speakable-playwright`) that declares `@reticular/speakable` and
   `@playwright/test` as peer dependencies, and SHALL run using Speakable
   prediction alone, with no AT dependency.
2. THE Matcher's **primary** assertion SHALL be semantic-field based
   (`toAnnounce({ role, name, state?, value? })`), and it SHALL additionally
   provide a phrase-level convenience wrapper (`toAnnounceLike('...')`) that
   normalizes through the same pipeline.
3. THE Matcher SHALL let the caller specify which Reader's phrasing to predict.
4. THE Matcher SHALL degrade gracefully: absent AT → Speakable prediction is the
   assertion; present AT (opt-in) → MAY additionally verify against live capture.
5. THE Matcher SHALL reuse the benchmark's normalization/scoring logic so that
   assertion semantics match the benchmark's semantics.
6. THE Matcher's assertion surface SHALL be documented with examples.
7. THE core `@reticular/speakable` package SHALL NOT gain any Playwright, screen
   reader, or Guidepup dependency as a result of the Matcher existing.

### Requirement 4: Scheduled CI and dual output

**User Story:** As the product owner, I want a scheduled CI job that re-captures
ground truth and emits both a trust report and a drift report so that accuracy
stays current and engine-improvement signal is surfaced automatically.

1. THE CI job SHALL run on a schedule (cadence configurable; decided after the
   first green run) and SHALL be manually triggerable.
2. THE CI job SHALL run NVDA on a Windows runner as the first automated reader.
3. THE CI job MAY run VoiceOver on a macOS runner, introduced as a staged,
   tolerated-flaky path after NVDA is stable.
4. THE CI job SHALL emit the accuracy report AND a Drift_Report of
   Correction_Candidates bucketed by systematic gap.
5. THE Drift_Report SHALL record the exact SR/OS/browser Version_Pins so a
   wording change caused by a new OS release is attributable.
6. THE CI job SHALL NOT auto-apply any Correction_Candidate to the engine.

### Requirement 5: Human-in-the-loop corrections (integrity)

**User Story:** As the engine maintainer, I want corrections to require human
review so that the engine improves toward real AT behavior without chasing
capture artifacts.

1. A Correction_Candidate SHALL be advisory only; promotion to an engine change
   SHALL require explicit human action (or a separately reviewed codegen step).
2. WHERE a divergence is attributable to a bad capture, the case SHALL be
   quarantined (v1 mechanism) rather than the engine changed to match it.
3. THE engine SHALL NOT be mutated as a direct, unreviewed function of capture
   output.

### Requirement 6: Isolation and graceful degradation

**User Story:** As the package maintainer, I want CI/benchmark machinery isolated
and the matcher lightweight so that neither bloats the shipped package.

1. Playwright, Guidepup, and all capture/CI machinery SHALL remain dev-only
   under `bench/` and SHALL NOT enter the published package's runtime deps
   (carried from v1 R9).
2. THE Matcher, if shipped, SHALL add no mandatory AT/Playwright runtime
   dependency for consumers who use prediction-only assertions.
3. `bench/` SHALL remain excluded from the published npm `files`.

### Requirement 7: Backward compatibility

**User Story:** As a maintainer mid-migration, I want v1 capture to keep working
so that we are never blocked if VoiceOver-on-CI is flaky.

1. THE v1 local capture path SHALL remain functional until v2 capture is proven
   on both readers.
2. THE migration SHALL NOT change the committed ground-truth or prediction JSON
   shape.
3. THE existing test suite (currently 834) SHALL remain green at every step.

### Requirement 8: Scope discipline

**User Story:** As the owner, I want v2 scope held so that it ships as capability,
not a research project.

1. v2 SHALL NOT add JAWS/Narrator CI automation.
2. v2 SHALL NOT build a hosted dashboard; outputs remain committed artifacts
   plus CI job artifacts.
3. v2 SHALL NOT replace the heuristic engine with a learned model; corrections
   stay human-reviewed.
4. The Matcher API surface SHALL be kept minimal in its first release.

---

## Decisions (resolved)

1. **Matcher packaging — DECIDED: separate companion package.**
   Ship as `@reticular/speakable-playwright`. It declares `@reticular/speakable`
   and `@playwright/test` as **peer dependencies**. Consumers who want the
   matcher install the companion (and already have Playwright); consumers of the
   core engine alone never pull in any Playwright-related code. The matcher is
   strictly opt-in and the core package's dependency surface is unchanged.
2. **Matcher assertion shape — DECIDED: field-level primary, phrase-level
   convenience.** Primary assertion is semantic-field
   (`toAnnounce({ role:'button', name:'Save' })`), reusing the benchmark's
   normalization so assertion semantics match scoring semantics. A phrase-level
   convenience wrapper (`toAnnounceLike('Save, button')`) is provided for
   readability and normalizes through the same pipeline.
3. **CI reader + VoiceOver timing — DECIDED: NVDA-on-Windows leads automated CI.**
   Hosted-runner VoiceOver is the flaky part; **local VoiceOver testing is
   unaffected** and remains fully supported (both the v1 path and the new
   Playwright path run VoiceOver on the operator's Mac). Automated CI leads with
   NVDA-on-Windows for stability in the remote space. VoiceOver-on-macOS CI is a
   later staged, tolerated-flaky addition. Schedule cadence decided after the
   first green run.
4. **Drift_Report promotion flow — DECIDED: plain report artifact for now.**
   The Drift_Report is a human-read artifact; no auto-opened PRs in the first
   iteration. Revisit once the report proves useful.

## Suggested build sequence (becomes tasks.md if accepted)

1. Add `@guidepup/playwright` + Playwright as dev deps; prove a one-case
   PW_Session captures clean VoiceOver locally (recover a quarantined case).
2. Port `capture.ts` to the PW_Session path behind the existing interface;
   re-capture; confirm chrome-class quarantine entries clear via `triage.ts`.
3. Add co-located prediction; verify prediction records are byte-identical in
   shape to the standalone path on a sample.
4. NVDA-on-Windows CI workflow (manual trigger first), emitting the accuracy
   report as a job artifact.
5. Add the Drift_Report output to the job.
6. Prototype the Matcher (prediction-only), field-level assertion, documented
   with examples; dogfood it in one of our own test files.
7. Stage VoiceOver-on-macOS CI; tune flakiness; keep v1 capture as fallback.
8. Decide cadence; enable the schedule.
