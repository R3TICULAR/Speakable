# Speakable Accuracy Benchmark — v1

_Generated: 2026-11-04T23:27:37.038Z_

## What this measures

This benchmark measures Speakable's **fidelity to real screen-reader output** on a fixed, version-pinned corpus. Ground truth is what the real screen reader actually announces, captured with Guidepup on the pinned OS/browser/SR versions below.

It is a **fidelity benchmark, not a correctness proof.** Speakable is heuristic. It complements manual testing and does not replace it, and it does not guarantee WCAG compliance. Results are scored at the semantic-field level (role, name, state, value), not raw transcript equality.

## Version pins

| Reader | SR · OS · Browser |
|---|---|
| NVDA | _not captured_ |
| VoiceOver | VoiceOver 0.0.1-VoiceOver4 · macOS 15.6.1 · webkit |

## Coverage

Corpus: **67** cases.

| Reader | Predicted | Ground truth | Scored |
|---|---|---|---|
| nvda | 67 | 0 | 0 |
| voiceover | 67 | 63 | 63 |

> **4 case(s) quarantined** and excluded from scoring because the capture is unreliable — either the cursor read browser chrome instead of the page, or the cursor walk dropped/duplicated/mis-read page content. These are capture problems, not engine problems; the engine is never degraded to match a bad capture. Listed under Incomplete pairs below; they rejoin scoring once re-captured cleanly.

> **2 intentional divergence(s)**, field-scoped and excluded from accuracy. These are places where Speakable deliberately gives MORE than a single screen-reader cursor pass — e.g. it announces every tab/option of a composite widget where a one-pass VoiceOver capture names only the current item. The engine is correct and more informative here; only the diverging field is set aside (other fields on the same case still score). Listed in full under "Intentional divergences" below.

## Headline

**57.3%** — role+name+state accuracy on directly-comparable static cases.

_Shown alongside the segmented table below and the version pins above; it is not a standalone score._

## Per-field accuracy by reader

| Reader | Role | Name | State | Value | False+ rate | False− rate | Timeline P/R |
|---|---|---|---|---|---|---|---|
| nvda | — | — | — | — | — | — | — |
| voiceover | 62.0% (31/50) | 48.3% (29/60) | 64.3% (9/14) | 50.0% (1/2) | 2.4% | 4.1% | 4.8% / 10.0% |

## False positives and false negatives

A **false positive** is Speakable announcing something the real screen reader did not (the retention killer). A **false negative** is the real screen reader announcing something Speakable missed.

- **voiceover**: 6 false positive(s), 10 false negative(s) across scored fields.

## By category

### voiceover

| Category | Role | Name | State | Value |
|---|---|---|---|---|
| aria-states | 77.8% (7/9) | 66.7% (6/9) | 83.3% (5/6) | 50.0% (1/2) |
| buttons-links | 60.0% (6/10) | 40.0% (4/10) | 100.0% (1/1) | n/a |
| edge-cases | 33.3% (2/6) | 66.7% (4/6) | n/a | n/a |
| form-controls | 66.7% (8/12) | 33.3% (4/12) | 100.0% (3/3) | n/a |
| headings-structure | 100.0% (2/2) | 16.7% (1/6) | n/a | n/a |
| interactive-components | 80.0% (4/5) | 40.0% (2/5) | 0.0% (0/4) | n/a |
| landmarks | 33.3% (2/6) | 57.1% (4/7) | n/a | n/a |
| live-regions | n/a | 80.0% (4/5) | n/a | n/a |

## Where you still need manual testing

These segments scored lowest and are where you should point manual screen-reader testing:

- **interactive-components** (voiceover), state: 0.0%
- **headings-structure** (voiceover), name: 16.7%
- **form-controls** (voiceover), name: 33.3%
- **landmarks** (voiceover), role: 33.3%
- **edge-cases** (voiceover), role: 33.3%
- **buttons-links** (voiceover), name: 40.0%
- **interactive-components** (voiceover), name: 40.0%
- **aria-states** (voiceover), value: 50.0%

## Intentional divergences

Field-scoped, excluded from accuracy by design (not bugs, not capture errors). Each is a place where Speakable deliberately produces more complete output than a single-cursor screen-reader pass. Documented here so the headline measures directly-comparable output while the design choice stays fully visible.

- tab-selected (voiceover) [role, name, state]: composite widget: engine emits every tab (Overview 1/2, Details 2/2) + the tablist; a single VoiceOver cursor pass announces only the current tab ('Details tab, 2 of 2'). Engine output is correct and more complete.
- option-selected (voiceover) [role, name, state]: composite widget: engine emits every listbox option with selection/position; a single VoiceOver pass announces the listbox + current option only ('Colors list box ... Red selected (1 of 2)'). Engine output is correct and more complete.

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
- …and 21 more

## Reproduce

See `bench/README.md` for prerequisites, version pins, and the commands to re-capture ground truth and regenerate this report.

