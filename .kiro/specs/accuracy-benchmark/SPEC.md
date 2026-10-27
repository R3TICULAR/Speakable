# Speakable Accuracy Benchmark — v1 Spec

**Owner:** Cecil Hunter
**Status:** Ready to build
**Scope:** Lean v1. Measure Speakable's *fidelity to real screen-reader output* on a fixed corpus, using Guidepup to capture ground truth. Publish an honest, version-pinned, per-segment result. Do NOT gold-plate.

---

## 1. Goal & non-goals

**Goal:** Produce a credible, reproducible accuracy number (and per-field breakdown) that answers the demo-room question *"how accurate is it?"* and headlines the launch/SEO content — framed as fidelity to real screen readers, with open methodology.

**This is a fidelity benchmark, not a correctness proof.** Ground truth = what the real screen reader actually announces on a pinned OS/browser/SR version. We are NOT claiming WCAG correctness or determinism.

**Non-goals (v1 — explicitly out of scope):**
- JAWS and Narrator ground-truth automation (Windows + licensing cost). v1 covers **NVDA + VoiceOver** only, because Guidepup drives those two.
- Thousands of cases. v1 target is **~100 cases**; representativeness over volume.
- A hosted/CI benchmark dashboard. v1 output is a committed JSON report + a human-readable Markdown table.
- Perfect string matching. We measure semantic fields, not raw transcript equality.

---

## 2. Deliverables

1. `bench/corpus/` — fixed set of ~100 HTML case files + a manifest describing each.
2. `bench/ground-truth/` — captured real-SR output per case per reader (committed JSON, so re-runs are optional).
3. `bench/harness/` — the capture + comparison + report scripts.
4. `bench/results/benchmark-v1.json` — machine-readable results.
5. `bench/results/benchmark-v1.md` — the publishable results table + methodology section.
6. A short `bench/README.md` documenting how to reproduce (version pins, commands).

---

## 3. Corpus design (`bench/corpus/`)

~100 cases grouped into categories. Each case is a self-contained minimal HTML snippet exercising ONE behavior, plus a manifest entry. Weight toward the semantics that actually break for AT users and toward Speakable's differentiators (runtime/behavioral).

Suggested category distribution (~100 total):

| Category | ~N | Examples |
|---|---|---|
| Buttons & links | 12 | plain, `aria-label`, icon-only, `aria-labelledby`, disabled |
| Form controls | 16 | input+label, placeholder-only, `aria-describedby`, required, error, grouped radios, select |
| Headings & structure | 10 | h1–h6, skipped levels, `role="heading"` + `aria-level` |
| Landmarks | 10 | nav/main/aside, labelled vs unlabelled, duplicate landmarks |
| ARIA states | 14 | `aria-expanded`, `aria-checked`, `aria-selected`, `aria-pressed`, `aria-current`, `aria-invalid` |
| Live regions | 12 | `aria-live` polite/assertive, `role="status"`, `role="alert"`, atomic |
| Interactive components (runtime) | 16 | modal dialog focus trap, combobox arrow-nav, tabs, accordion toggle, disclosure |
| Edge/negative cases | 10 | redundant ARIA, conflicting role, hidden-but-focusable, empty accessible name |

**Manifest** (`bench/corpus/manifest.json`): array of
```json
{
  "id": "button-icon-only-aria-label",
  "category": "buttons-links",
  "file": "buttons-links/button-icon-only-aria-label.html",
  "mode": "static | runtime",
  "interaction": null | { "pattern": "modal-dialog" } | { "actions": [{ "type": "click", "selector": "#open" }, { "type": "arrowDown" }] },
  "notes": "icon button, name from aria-label"
}
```
- `mode: static` → compared against single-pass announcement.
- `mode: runtime` → compared against an interaction timeline (reuse Speakable's existing interaction patterns: modal-dialog / combobox / tabs / accordion).

Start the corpus small per category and grow to the target; the harness must not assume a fixed count.

---

## 4. Ground-truth capture via Guidepup (`bench/harness/capture.ts`)

**Why Guidepup:** it drives the *real* VoiceOver (macOS) and *real* NVDA (Windows) and captures actual spoken phrases. That is our oracle. (Secondary benefit for Cecil: hands-on familiarity with the nearest adjacent tool.)

**Readers in v1:** `voiceover` (macOS runner), `nvda` (Windows runner). Each runs on its own OS — the capture script is OS-aware and only runs the reader(s) available on the current machine, writing per-reader ground-truth files so the two can be captured on different machines and merged.

**Dependencies:** `@guidepup/guidepup` (+ `@guidepup/playwright` if driving pages through Playwright). Guidepup requires one-time OS setup (macOS: enable VoiceOver automation / grant permissions via `npx @guidepup/setup`; Windows: it manages a bundled NVDA). The build agent must document these prerequisites in `bench/README.md` and FAIL LOUDLY with setup instructions if the environment isn't ready — do not silently skip.

**Capture flow per case:**
1. Serve the corpus over a local static server bound to `127.0.0.1` (reuse the project's dev-server pattern; never bind `0.0.0.0`).
2. Launch the real SR via Guidepup; navigate to the case URL.
3. For `static` cases: move the SR cursor across the target element(s) and collect the spoken phrase log (`voiceover.spokenPhraseLog()` / NVDA equivalent).
4. For `runtime` cases: perform the manifest's interaction (or named pattern) and collect the ordered spoken-phrase log across the interaction.
5. Normalize (see §6) and write `bench/ground-truth/<reader>/<id>.json` = `{ id, reader, srVersion, osVersion, browserVersion, rawPhrases: [...], normalized: [...] }`.

**Version pinning (mandatory):** capture and record exact VoiceOver/macOS, NVDA, browser versions into every ground-truth file and into the final report header. A benchmark without version pins is worthless.

Ground truth is committed so the comparison step can run without a Mac+Windows rig every time; re-capture only on SR/OS version bumps.

---

## 5. Speakable prediction capture (`bench/harness/predict.ts`)

For each corpus case, run Speakable's own pipeline to produce its predicted output for the same reader:
- `static` → use the library API (`parseHTML` → `buildAccessibilityTree` → `renderNVDA` / `renderVoiceOver`) or the CLI (`speakable <file> -s nvda|voiceover -f both`).
- `runtime` → use the runtime/browser capture (`captureTimeline` from `@reticular/speakable/browser` or the `speakable runtime` path) with the same interaction sequence, producing Speakable's predicted announcement timeline.

Write `bench/predictions/<reader>/<id>.json` in the same normalized shape as ground truth so comparison is apples-to-apples.

---

## 6. Normalization (`bench/harness/normalize.ts`)

Before comparison, normalize BOTH ground truth and prediction identically, so trivial differences don't tank the score:
- lowercase; collapse whitespace; strip trailing punctuation.
- map known per-reader synonyms to canonical tokens where semantically equal — but DO preserve meaningful per-reader differences (e.g. NVDA "navigation landmark" vs VoiceOver "navigation" are both canonicalized to role=`navigation`; this is extraction, not erasure).
- parse each phrase into semantic fields where possible: `{ role, name, state, value }`. This parsing is the crux — it's what lets us score *meaning* not *wording*.

Normalization rules live in one documented module so reviewers can audit exactly what was and wasn't collapsed. Over-aggressive normalization that inflates the score is the integrity risk here — keep it conservative and documented.

---

## 7. Metrics (`bench/harness/score.ts`)

Report at the semantic-field level, NOT raw string equality. Per reader and overall:

**Primary — per-field accuracy** (match rate across all cases where the field is applicable):
- `role` accuracy
- `accessible-name` accuracy
- `state` accuracy (expanded/collapsed/checked/selected/pressed/current/invalid)
- `value` accuracy

**Secondary — the product-critical pair** (report these prominently, they matter most to a buyer and to retention):
- **False-positive rate** — Speakable announced/flagged something the real SR did NOT (the retention killer).
- **False-negative rate** — real SR announced something Speakable missed.

**Runtime cases — timeline fidelity:**
- ordered-event match: did Speakable predict the same sequence of focus moves / state changes / live-region announcements, in order? Report event-level precision/recall.

**Segmentation (publish, don't hide):** every metric broken down by category (§3) and by reader. The expected and *desirable* story is "high on static role/name, lower on live-region timing and per-reader quirks" — that segmentation IS the "tripwire, point your manual testing here" positioning, quantified.

Explicitly do NOT reduce everything to one blurry headline number. If one top-line figure is needed for marketing, use **semantic-field accuracy (role+name+state) on static cases**, always shown next to the segmented table and version pins.

---

## 8. Report (`bench/results/`)

`benchmark-v1.json` — full machine-readable results (per-case, per-field, per-reader + aggregates + version metadata).

`benchmark-v1.md` — publishable, contains:
1. **Methodology** — corpus size/composition, Guidepup-as-oracle, normalization summary, exact version pins, "fidelity not correctness / complements manual testing" framing (keeps the accessiBe/FTC distance).
2. **Results table** — per-field accuracy × reader, with the per-category segmentation.
3. **False-positive / false-negative** callout.
4. **"Where you still need manual testing"** section derived directly from the lowest-scoring segments — turn the weakness into guidance.
5. Repro instructions / link to `bench/README.md`.

---

## 9. Suggested file layout

```
bench/
  README.md                      # prerequisites, version pins, how to reproduce
  corpus/
    manifest.json
    buttons-links/*.html
    form-controls/*.html
    ...
  harness/
    serve.ts                     # 127.0.0.1 static server for corpus
    capture.ts                   # Guidepup ground-truth capture (OS-aware)
    predict.ts                   # Speakable prediction capture
    normalize.ts                 # shared normalization + semantic-field parser
    score.ts                     # metrics + segmentation
    report.ts                    # emit benchmark-v1.json + .md
  ground-truth/<reader>/<id>.json
  predictions/<reader>/<id>.json
  results/
    benchmark-v1.json
    benchmark-v1.md
```

---

## 10. Build order (for the implementing agent)

1. Scaffold `bench/` + `manifest.json` schema + the local `127.0.0.1` static server.
2. Author ~20 corpus cases across the static categories first (enough to exercise the full pipeline end-to-end before scaling to 100).
3. Build `normalize.ts` with the semantic-field parser + unit tests on hand-written phrase examples.
4. Build `predict.ts` (no OS/AT dependency — fastest to validate) and confirm it emits normalized output for the 20 cases.
5. Build `capture.ts` with Guidepup for whichever reader matches the current OS; document setup in `README.md`; FAIL LOUDLY if Guidepup/AT isn't configured.
6. Build `score.ts` + `report.ts`; produce a first `benchmark-v1.{json,md}` on the 20-case set.
7. Scale the corpus to ~100 and add the runtime/interaction cases (reuse Speakable's existing interaction patterns).
8. Capture VoiceOver ground truth on macOS and NVDA ground truth on Windows; merge; regenerate the report.

**Checkpoints:** stop and surface results after step 6 (end-to-end on 20 cases) and after step 8 (full run) before any publishing.

---

## 11. Guardrails & cautions

- **Integrity:** normalization must not be tuned to inflate the score. Keep it conservative, documented, and auditable. The benchmark's value is its credibility; a flattering-but-fishy number is worse than an honest mediocre one.
- **Version pins everywhere** — ground truth, report header, README. Re-run only on SR/OS/browser bumps (and treat each re-run as a fresh content beat).
- **Local-only serving** — corpus server binds `127.0.0.1`, explicit address, never defaults.
- **No new runtime deps in Speakable itself** — Guidepup and the harness live under `bench/` as dev-only tooling, not shipped in `@reticular/speakable`.
- **Honest framing in the published doc** — "fidelity to real SR output on pinned versions; heuristic; complements manual testing; does not guarantee WCAG compliance." This is both legally safer and more credible.
- **Time-box it.** v1 is ~100 cases × 2 readers. Do not expand to JAWS/Narrator/thousands-of-cases until a demo or buyer specifically demands that depth. This benchmark is ammunition for the WTP conversations, not a replacement for them.
