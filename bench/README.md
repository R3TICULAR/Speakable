# Speakable Accuracy Benchmark

Measures Speakable's **fidelity to real screen-reader output** on a fixed,
version-pinned corpus. Ground truth is captured from real NVDA (Windows) and
real VoiceOver (macOS) via [Guidepup](https://www.guidepup.dev/); Speakable's
own predictions are scored against it at the semantic-field level.

This is a **fidelity benchmark, not a correctness proof.** Speakable is
heuristic. It complements manual testing and does not guarantee WCAG
compliance. Dev-only tooling — not shipped in the `@reticular/speakable` package.

## Pipeline

```
corpus/ ──serve──▶ capture.ts ──▶ ground-truth/<reader>/<id>.json   (real SR, committed)
corpus/ ──────────▶ predict.ts ──▶ predictions/<reader>/<id>.json   (Speakable, no AT)
                                        │
                              normalize.ts (shared, both sides)
                                        │
                                     score.ts ──▶ report.ts ──▶ results/benchmark-v1.{json,md}
```

Ground truth and predictions are decoupled through committed JSON so that
`predict → score → report` run anywhere with no screen reader installed. Only
`capture` needs a real OS + AT, and it runs once per version bump.

## Prerequisites

### Everyone (prediction, scoring, reporting — no AT needed)

- Node 18+. Nothing else; these stages run on any OS.

### Ground-truth capture only (one Mac + one Windows machine)

Guidepup drives the real screen readers and needs one-time OS setup:

```bash
# On BOTH the macOS and the Windows machine.
# Note the `setup` / `install` SUBCOMMANDS — a bare `npx @guidepup/setup`
# only prints help in current versions.
npx @guidepup/setup setup     # configure the local environment for automation
npx @guidepup/setup install   # install the screen reader(s) Guidepup drives
```

- **Node version: use Node 22 LTS for the setup/capture steps.** This is not
  optional. `@guidepup/setup` bundles `undici` 8.12+, whose zstd decompressor
  requires `zlib.createZstdDecompress` (added in Node 22.15). Node 20 and Node
  24 both crash it with `Cannot read properties of undefined (reading 'bind')`.
  The predict/score/report stages are unaffected and run on any Node.
  `nvm install 22 && nvm use 22`.
- **macOS (VoiceOver) — three permissions, all required:**
  1. `npx @guidepup/setup setup` then `npx @guidepup/setup install`. On macOS
     `install` is **not** a no-op: it downloads the VoiceOver preferences disk
     image (`guidepup-voiceover-preferences-macos-15.dmg`) into
     `~/Library/Caches/guidepup/`. Without it, start fails with
     "Failed to mount Guidepup preferences".
  2. **Accessibility** — System Settings → Privacy & Security → Accessibility →
     add and enable the terminal app you run capture from.
  3. **Full Disk Access** — System Settings → Privacy & Security → Full Disk
     Access → add and enable the same terminal. Guidepup symlinks its portable
     preferences into `~/Library/Group Containers/group.com.apple.VoiceOver/…`,
     a protected path; without Full Disk Access the start fails with
     `EPERM: operation not permitted, symlink`.
  4. Also enable "Allow VoiceOver to be controlled with AppleScript" (VoiceOver
     Utility → General), which `setup` normally handles.
  **Fully quit and reopen the terminal after granting permissions** — they only
  apply to a freshly launched instance. VoiceOver visibly takes over the
  machine during capture; don't use the keyboard/mouse while it runs.
- **Run capture from a standalone terminal (Terminal.app / iTerm), not an IDE's
  integrated terminal** — the permissions above are granted per-app, and an
  IDE helper process is both harder to grant and disruptive to run capture in.
- **Windows (NVDA):** `install` fetches a portable, Guidepup-compatible NVDA to
  a temp directory (recorded in the registry). You do not need a separate NVDA
  install.

If prerequisites are missing, `capture.ts` **fails loudly** with setup
instructions. It never silently skips cases.

## Commands

All commands run from the repo root.

```bash
# 1. Generate Speakable predictions for every case (no AT; runs anywhere)
npx tsx bench/harness/predict.ts

# 2. Capture real screen-reader ground truth (run on the matching OS)
#    macOS captures VoiceOver; Windows captures NVDA. Commit the output.
npx tsx bench/harness/capture.ts

# 3. Triage the capture: flag any case where the SR cursor read browser
#    chrome (tab strip, toolbar) instead of the page. Review before scoring.
npx tsx bench/harness/triage.ts voiceover

# 4. Score + generate the report (reads committed predictions + ground truth)
npx tsx bench/harness/report.ts

# Unit tests for the harness (normalize + score)
npx vitest run tests/bench/
```

Outputs land in `bench/results/benchmark-v1.json` and `benchmark-v1.md`.

## Triage and quarantine (capture quality gate)

Capture drives the real VoiceOver cursor over a real, already-running browser.
If the cursor starts outside the page it reads the browser's own UI (open tabs,
toolbar, menus) instead of the content — garbage ground truth. `capture.ts`
anchors the cursor into the web content area before each case to prevent this,
but `triage.ts` is the verification gate: it scans every captured file for the
contamination signatures and reports **clean / contaminated / empty** counts.

Any case that still captures chrome goes in `bench/ground-truth/quarantine.json`
with a reason. Quarantined cases are **excluded from scoring and reported as
INCOMPLETE** (never silently dropped), so the headline reflects only
trustworthy data. Re-capture a quarantined case, re-run triage, and delete its
entry from the quarantine file once it reads clean.

## Version pins

Every ground-truth file records the exact `srVersion`, `osVersion`, and
`browserVersion` it was captured under, and the report header surfaces them. A
benchmark without pins is worthless. **Re-capture ground truth only when a
screen reader, OS, or browser version changes** — and treat each re-run as a
fresh result (a new content beat), not a silent overwrite.

Currently captured pins appear in `bench/results/benchmark-v1.md` under
"Version pins". Until capture is run on both machines, that section reads
`not captured` and no accuracy is reported.

## Corpus

`corpus/manifest.json` is the source of truth: an array of case records
(`id`, `category`, `file`, `mode`, `interaction`, `notes`). Each HTML file
under `corpus/<category>/` exercises one behavior.

- `mode: "static"` → compared against a single-pass announcement.
- `mode: "runtime"` → compared against an ordered interaction timeline;
  `interaction` is either a named Speakable pattern (`modal-dialog`,
  `combobox`, `tabs`, `accordion`) or an explicit action list.

Add a case by dropping an HTML file in the right category folder and adding its
manifest entry. The harness never assumes a fixed count.

## Scope (v1)

- Readers: **NVDA + VoiceOver only** (the two Guidepup drives). No JAWS/Narrator.
- ~100 cases; representativeness over volume.
- Output is committed JSON + Markdown. No hosted dashboard.
- Semantic-field scoring (role / name / state / value), never raw transcript equality.

## Integrity

Normalization (`harness/normalize.ts`) is applied identically to both sides and
kept deliberately conservative and auditable — the token tables are exported as
data. Do not tune normalization to inflate the score. A flattering-but-fishy
number is worse than an honest mediocre one.
