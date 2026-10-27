# Speakable Accuracy Benchmark — v1

_Generated: 2026-10-27T22:40:41.680Z_

## What this measures

This benchmark measures Speakable's **fidelity to real screen-reader output** on a fixed, version-pinned corpus. Ground truth is what the real screen reader actually announces, captured with Guidepup on the pinned OS/browser/SR versions below.

It is a **fidelity benchmark, not a correctness proof.** Speakable is heuristic. It complements manual testing and does not replace it, and it does not guarantee WCAG compliance. Results are scored at the semantic-field level (role, name, state, value), not raw transcript equality.

## Version pins

| Reader | SR · OS · Browser |
|---|---|
| NVDA | _not captured_ |
| VoiceOver | VoiceOver 0.0.1-VoiceOver4 · macOS 15.6.1 · os-default |

## Coverage

Corpus: **67** cases.

| Reader | Predicted | Ground truth | Scored |
|---|---|---|---|
| nvda | 67 | 0 | 0 |
| voiceover | 67 | 57 | 57 |

> **10 case(s) quarantined** and excluded from scoring because the capture is unreliable — either the cursor read browser chrome instead of the page, or the cursor walk dropped/duplicated/mis-read page content. These are capture problems, not engine problems; the engine is never degraded to match a bad capture. Listed under Incomplete pairs below; they rejoin scoring once re-captured cleanly.

## Headline

**54.8%** — role+name+state accuracy on static cases.

_Shown alongside the segmented table below and the version pins above; it is not a standalone score._

## Per-field accuracy by reader

| Reader | Role | Name | State | Value | False+ rate | False− rate | Timeline P/R |
|---|---|---|---|---|---|---|---|
| nvda | — | — | — | — | — | — | — |
| voiceover | 56.1% (23/41) | 44.6% (25/56) | 90.9% (10/11) | n/a | 4.4% | 4.8% | 5.6% / 14.3% |

## False positives and false negatives

A **false positive** is Speakable announcing something the real screen reader did not (the retention killer). A **false negative** is the real screen reader announcing something Speakable missed.

- **voiceover**: 10 false positive(s), 11 false negative(s) across scored fields.

## By category

### voiceover

| Category | Role | Name | State | Value |
|---|---|---|---|---|
| aria-states | 55.6% (5/9) | 45.5% (5/11) | 100.0% (6/6) | n/a |
| buttons-links | 55.6% (5/9) | 33.3% (3/9) | 100.0% (1/1) | n/a |
| edge-cases | 40.0% (2/5) | 60.0% (3/5) | n/a | n/a |
| form-controls | 66.7% (8/12) | 46.2% (6/13) | 100.0% (3/3) | n/a |
| headings-structure | n/a | 25.0% (1/4) | n/a | n/a |
| interactive-components | 100.0% (1/1) | 0.0% (0/2) | 0.0% (0/1) | n/a |
| landmarks | 40.0% (2/5) | 42.9% (3/7) | n/a | n/a |
| live-regions | n/a | 80.0% (4/5) | n/a | n/a |

## Where you still need manual testing

These segments scored lowest and are where you should point manual screen-reader testing:

- **interactive-components** (voiceover), name: 0.0%
- **interactive-components** (voiceover), state: 0.0%
- **headings-structure** (voiceover), name: 25.0%
- **buttons-links** (voiceover), name: 33.3%
- **landmarks** (voiceover), role: 40.0%
- **edge-cases** (voiceover), role: 40.0%
- **landmarks** (voiceover), name: 42.9%
- **aria-states** (voiceover), name: 45.5%

## Incomplete pairs

Cases not scored (quarantined contamination, or a missing prediction/ground-truth side). Listed so coverage gaps stay visible rather than silently dropped.

- button-plain (nvda): prediction present, ground truth missing
- button-aria-label (nvda): prediction present, ground truth missing
- button-disabled (nvda): prediction present, ground truth missing
- link-plain (nvda): prediction present, ground truth missing
- input-placeholder-only (nvda): prediction present, ground truth missing
- input-with-label (nvda): prediction present, ground truth missing
- input-required-describedby (nvda): prediction present, ground truth missing
- checkbox-unchecked (nvda): prediction present, ground truth missing
- radio-group (nvda): prediction present, ground truth missing
- heading-h1 (nvda): prediction present, ground truth missing
- heading-role-arialevel (nvda): prediction present, ground truth missing
- nav-labelled (nvda): prediction present, ground truth missing
- main-and-aside (nvda): prediction present, ground truth missing
- button-aria-expanded (nvda): prediction present, ground truth missing
- checkbox-aria-checked-mixed (nvda): prediction present, ground truth missing
- button-aria-pressed (nvda): prediction present, ground truth missing
- link-aria-current (nvda): prediction present, ground truth missing
- status-polite (nvda): prediction present, ground truth missing
- empty-accessible-name-button (nvda): prediction present, ground truth missing
- redundant-role (nvda): prediction present, ground truth missing
- link-new-window (nvda): prediction present, ground truth missing
- link-image-only (nvda): prediction present, ground truth missing
- link-image-empty-alt (nvda): prediction present, ground truth missing
- button-submit (nvda): prediction present, ground truth missing
- input-aria-label (nvda): prediction present, ground truth missing
- select-single (nvda): prediction present, ground truth missing
- textarea-labelled (nvda): prediction present, ground truth missing
- input-invalid (nvda): prediction present, ground truth missing
- input-readonly (nvda): prediction present, ground truth missing
- checkbox-checked (nvda): prediction present, ground truth missing
- fieldset-group (nvda): prediction present, ground truth missing
- input-number-spin (nvda): prediction present, ground truth missing
- switch-role (nvda): prediction present, ground truth missing
- headings-h1-h2-h3 (nvda): prediction present, ground truth missing
- heading-skipped-level (nvda): prediction present, ground truth missing
- paragraph-text (nvda): prediction present, ground truth missing
- ordered-list (nvda): prediction present, ground truth missing
- definition-list (nvda): prediction present, ground truth missing
- blockquote (nvda): prediction present, ground truth missing
- banner-contentinfo (nvda): prediction present, ground truth missing
- search-landmark (nvda): prediction present, ground truth missing
- region-labelled (nvda): prediction present, ground truth missing
- duplicate-nav-unlabelled (nvda): prediction present, ground truth missing
- form-landmark (nvda): prediction present, ground truth missing
- tab-selected (nvda): prediction present, ground truth missing
- option-selected (nvda): prediction present, ground truth missing
- aria-disabled-link (nvda): prediction present, ground truth missing
- aria-required-input (nvda): prediction present, ground truth missing
- aria-current-step (nvda): prediction present, ground truth missing
- progressbar (nvda): prediction present, ground truth missing
- …and 27 more

## Reproduce

See `bench/README.md` for prerequisites, version pins, and the commands to re-capture ground truth and regenerate this report.

