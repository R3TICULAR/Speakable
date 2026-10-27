# Requirements Document

## Introduction

The Speakable Accuracy Benchmark measures Speakable's **fidelity to real screen-reader output** on a fixed, version-pinned corpus. It uses Guidepup to drive real NVDA (Windows) and VoiceOver (macOS) as the ground-truth oracle, runs Speakable's own prediction pipeline over the same cases, normalizes both to semantic fields, and publishes an honest, per-segment accuracy result.

This is a **fidelity benchmark, not a correctness proof.** Ground truth is what the real screen reader actually announces on a pinned OS/browser/SR version. The benchmark does not claim WCAG correctness, determinism, or that Speakable replaces manual testing. Its output is launch/SEO ammunition and an answer to the demo-room question "how accurate is it?"

The feature is lean v1: ~100 cases, two readers (NVDA + VoiceOver), committed ground truth, and a committed JSON + Markdown report. It is dev-only tooling under `bench/` and adds no runtime dependencies to the shipped `@reticular/speakable` package.

## Glossary

- **Corpus**: The fixed set of ~100 self-contained HTML case files plus a manifest, each exercising one accessibility behavior.
- **Case**: A single corpus entry (one HTML file + one manifest record) in either `static` or `runtime` mode.
- **Ground_Truth**: The actual spoken phrases captured from a real screen reader for a case, via Guidepup.
- **Prediction**: Speakable's predicted announcement output for the same case and reader.
- **Guidepup**: The automation library that drives real VoiceOver and NVDA and captures spoken phrases. The benchmark's oracle.
- **Oracle**: The source of truth a benchmark is measured against (here, real screen-reader output).
- **Reader**: A screen reader. v1 scope is `nvda` and `voiceover` only.
- **Normalization**: The shared transform applied identically to ground truth and prediction before comparison, including parsing phrases into semantic fields.
- **Semantic_Field**: One of `role`, `name` (accessible name), `state`, `value` parsed from a normalized phrase.
- **Harness**: The capture + predict + normalize + score + report scripts under `bench/harness/`.
- **Version_Pin**: The exact recorded OS, screen-reader, and browser versions under which ground truth was captured.
- **Runtime_Case**: A case compared against an ordered interaction timeline rather than a single-pass announcement.

## Requirements

### Requirement 1: Corpus and Manifest

**User Story:** As a benchmark maintainer, I want a fixed, categorized corpus with a machine-readable manifest so that the benchmark is reproducible and its composition is auditable.

#### Acceptance Criteria

1. THE Corpus SHALL consist of self-contained minimal HTML case files, each exercising exactly one accessibility behavior, stored under `bench/corpus/<category>/`.
2. THE Corpus SHALL include a manifest at `bench/corpus/manifest.json` that is an array of records, each with `id`, `category`, `file`, `mode`, `interaction`, and `notes` fields.
3. WHERE a case has `mode: "static"`, the manifest record's `interaction` SHALL be `null`.
4. WHERE a case has `mode: "runtime"`, the manifest record's `interaction` SHALL be either a named pattern (`{ "pattern": "modal-dialog" | "combobox" | "tabs" | "accordion" }`) or an explicit action sequence (`{ "actions": [...] }`).
5. THE Harness SHALL NOT assume a fixed case count; it SHALL process whatever cases the manifest declares.
6. THE Corpus SHALL target approximately 100 cases distributed across the categories: buttons & links, form controls, headings & structure, landmarks, ARIA states, live regions, interactive components (runtime), and edge/negative cases.
7. WHEN the manifest references a `file` that does not exist, THE Harness SHALL fail with a descriptive error identifying the case `id` and missing path.
8. WHEN two manifest records share the same `id`, THE Harness SHALL fail with a duplicate-id error.

### Requirement 2: Local Corpus Server

**User Story:** As a benchmark maintainer, I want the corpus served locally and safely so that real screen readers can navigate the cases without exposing a server to the network.

#### Acceptance Criteria

1. THE Harness SHALL serve the corpus over HTTP from a static server at `bench/harness/serve.ts`.
2. THE corpus server SHALL bind explicitly to `127.0.0.1` and SHALL NOT bind to `0.0.0.0` or a default-all-interfaces address.
3. WHEN a case is captured or predicted, THE Harness SHALL reference the case by its local server URL.

### Requirement 3: Ground-Truth Capture via Guidepup

**User Story:** As a benchmark maintainer, I want real screen-reader output captured and committed so that comparison can run later without a full Mac+Windows rig.

#### Acceptance Criteria

1. THE capture script (`bench/harness/capture.ts`) SHALL use Guidepup to drive the real screen reader available on the current operating system.
2. WHERE the current OS is macOS, THE capture script SHALL capture `voiceover` ground truth.
3. WHERE the current OS is Windows, THE capture script SHALL capture `nvda` ground truth.
4. WHEN the required screen reader or Guidepup prerequisites are not configured, THE capture script SHALL fail loudly with setup instructions and SHALL NOT silently skip cases.
5. WHERE a case is `static`, THE capture script SHALL move the screen-reader cursor across the target element(s) and collect the spoken phrase log.
6. WHERE a case is `Runtime_Case`, THE capture script SHALL perform the manifest's interaction and collect the ordered spoken-phrase log across the interaction.
7. THE capture script SHALL write one ground-truth file per case per reader to `bench/ground-truth/<reader>/<id>.json` containing `id`, `reader`, `srVersion`, `osVersion`, `browserVersion`, `rawPhrases`, and `normalized`.
8. THE capture script SHALL record exact screen-reader, OS, and browser versions in every ground-truth file.
9. Ground-truth files SHALL be committed to the repository so that comparison can run without re-capture.
10. THE capture script SHALL write per-reader files so that VoiceOver and NVDA ground truth can be captured on separate machines and merged.

### Requirement 4: Speakable Prediction Capture

**User Story:** As a benchmark maintainer, I want Speakable's predicted output captured in the same shape as ground truth so that comparison is apples-to-apples.

#### Acceptance Criteria

1. THE predict script (`bench/harness/predict.ts`) SHALL run Speakable's own pipeline to produce predicted output per case per reader.
2. WHERE a case is `static`, THE predict script SHALL produce the predicted announcement using Speakable's library API (`parseHTML` → `buildAccessibilityTree` → `renderNVDA`/`renderVoiceOver`) or CLI.
3. WHERE a case is `Runtime_Case`, THE predict script SHALL produce the predicted announcement timeline using Speakable's runtime/browser capture (`captureTimeline` from `@reticular/speakable/browser`) with the same interaction sequence as the manifest.
4. THE predict script SHALL write one prediction file per case per reader to `bench/predictions/<reader>/<id>.json` in the same normalized shape as ground truth.
5. THE predict script SHALL run without any OS or assistive-technology dependency.

### Requirement 5: Normalization and Semantic-Field Parsing

**User Story:** As a benchmark reviewer, I want a single, documented normalization step applied identically to both sides so that scores reflect meaning rather than wording, and so the transform is auditable.

#### Acceptance Criteria

1. THE normalization module (`bench/harness/normalize.ts`) SHALL apply the identical transform to both Ground_Truth and Prediction.
2. THE normalization SHALL lowercase text, collapse whitespace, and strip trailing punctuation.
3. THE normalization SHALL map known per-reader synonyms to canonical tokens where semantically equal (e.g. NVDA "navigation landmark" and VoiceOver "navigation" both canonicalize to role `navigation`).
4. THE normalization SHALL preserve meaningful per-reader differences and SHALL NOT erase semantically distinct output.
5. THE normalization SHALL parse each phrase into `Semantic_Field` values (`role`, `name`, `state`, `value`) where possible.
6. THE normalization rules SHALL live in one documented module so reviewers can audit exactly what is and is not collapsed.
7. THE normalization SHALL be conservative and SHALL NOT be tuned to inflate the score.

### Requirement 6: Scoring and Metrics

**User Story:** As a benchmark maintainer, I want semantic-field-level metrics with segmentation so that the result is credible and points users to where manual testing is still needed.

#### Acceptance Criteria

1. THE scoring module (`bench/harness/score.ts`) SHALL compute per-field accuracy for `role`, `name`, `state`, and `value`, measured only across cases where each field is applicable.
2. THE scoring SHALL compute a false-positive rate (Speakable announced something the real screen reader did not) and report it prominently.
3. THE scoring SHALL compute a false-negative rate (the real screen reader announced something Speakable missed) and report it prominently.
4. WHERE a case is a `Runtime_Case`, THE scoring SHALL compute ordered-event match (event-level precision and recall over focus moves, state changes, and live-region announcements in sequence).
5. THE scoring SHALL break every metric down by category and by reader.
6. THE scoring SHALL NOT reduce all results to a single headline number as the only output.
7. WHERE a single top-line figure is required, THE scoring SHALL define it as semantic-field accuracy (role + name + state) on static cases, and SHALL always present it alongside the segmented table and version pins.

### Requirement 7: Report Generation

**User Story:** As a stakeholder, I want a machine-readable and a publishable human-readable report so that results can feed both tooling and launch content honestly.

#### Acceptance Criteria

1. THE report script (`bench/harness/report.ts`) SHALL emit `bench/results/benchmark-v1.json` containing per-case, per-field, per-reader results, aggregates, and version metadata.
2. THE report script SHALL emit `bench/results/benchmark-v1.md` containing a methodology section, a per-field × reader results table with per-category segmentation, a false-positive/false-negative callout, a "where you still need manual testing" section, and reproduction instructions.
3. THE methodology section SHALL state the corpus size and composition, Guidepup-as-oracle, a normalization summary, and the exact version pins.
4. THE report SHALL frame results as fidelity to real screen-reader output on pinned versions, heuristic, complementing manual testing, and not guaranteeing WCAG compliance.
5. THE "where you still need manual testing" section SHALL be derived from the lowest-scoring segments.
6. THE report header SHALL include the exact screen-reader, OS, and browser version pins.

### Requirement 8: Reproducibility and Documentation

**User Story:** As a new contributor, I want clear prerequisites and commands so that I can reproduce the benchmark and know when to re-run it.

#### Acceptance Criteria

1. THE benchmark SHALL include `bench/README.md` documenting prerequisites, exact version pins, and the commands to reproduce each stage.
2. THE README SHALL document the one-time Guidepup/OS setup for both macOS (VoiceOver automation permissions) and Windows (bundled NVDA).
3. THE README SHALL state that ground truth is re-captured only on screen-reader, OS, or browser version bumps.

### Requirement 9: Isolation from the Shipped Package

**User Story:** As the package maintainer, I want the benchmark tooling isolated so that it never ships to npm users.

#### Acceptance Criteria

1. THE benchmark tooling, including Guidepup and all harness scripts, SHALL live under `bench/` as dev-only tooling.
2. THE `@reticular/speakable` published package SHALL NOT gain any new runtime dependency from this feature.
3. THE `bench/` directory SHALL NOT be included in the published npm package `files`.

### Requirement 10: Scope Discipline

**User Story:** As the owner, I want v1 scope held firmly so that the benchmark ships as ammunition rather than expanding into a research project.

#### Acceptance Criteria

1. THE v1 benchmark SHALL cover only `nvda` and `voiceover` readers.
2. THE v1 benchmark SHALL NOT automate JAWS or Narrator ground truth.
3. THE v1 benchmark SHALL NOT build a hosted or CI benchmark dashboard; its output is the committed JSON + Markdown report.
4. THE v1 benchmark SHALL NOT measure raw transcript string equality; it SHALL measure semantic fields.
