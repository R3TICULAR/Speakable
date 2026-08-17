# Implementation Plan:

## Overview

Build the `@reticular/storybook-addon-speakable` addon to production quality. The existing code in `addon-speakable/` has the manager panel, preview decorator, and browser-side analyzer implemented. The primary blocker is the missing CJS preset entry point. Tasks fix the registration, refine the build, verify locally, and prepare for npm publish.

## Task Dependency Graph

```
Task 1 (preset.ts) → Task 2 (build config)
Task 2 → Task 3 (package.json exports)
Task 3 → Task 4 (local registration)
Task 4 → Task 5 (verify Storybook loads)
Task 5 → Task 6 (refine panel UI)
Task 5 → Task 7 (live args updates)
Task 5 → Task 8 (analyzer improvements)
Task 6, 7, 8 → Task 9 (integration test)
Task 9 → Task 10 (README + docs)
Task 10 → Task 11 (npm publish prep)
```

## Tasks

- [x] Task 1: Create the CJS preset entry point
  - Create `addon-speakable/src/preset.ts`
  - Export `managerEntries(entry: string[]): string[]` that appends `require.resolve('./manager')` to the entry array
  - Export `previewAnnotations(entry: string[]): string[]` that appends `require.resolve('./preview')` to the entry array
  - This file runs in Node.js at Storybook build time, so it must use `require.resolve` (not import)
  - Verify the module resolves its sibling files correctly relative to `dist/`
  - Requirements: R1

- [x] Task 2: Update tsup build config for dual output
  - Update `addon-speakable/tsup.config.ts` to produce two builds:
    - Browser bundles (ESM): `index.ts`, `manager.tsx`, `preview.ts` with externals `react`, `react-dom`, `@storybook/manager-api`
    - Node preset (CJS): `preset.ts` with platform `node`
  - Both outputs go to `dist/`
  - Verify `dist/preset.js` is CommonJS (uses `module.exports` or `exports.`)
  - Verify `dist/manager.js`, `dist/preview.js`, `dist/index.js` are ESM
  - Requirements: R9

- [x] Task 3: Update package.json exports map
  - Update `addon-speakable/package.json` `exports` field:
    - `"."`: `"./dist/index.js"`
    - `"./preset"`: `"./dist/preset.js"`
    - `"./manager"`: `"./dist/manager.js"`
    - `"./preview"`: `"./dist/preview.js"`
  - Add `"main": "./dist/preset.js"` as fallback for older Storybook resolution
  - Ensure `"type": "module"` is set (ESM package with CJS preset handled by tsup)
  - Add `"files": ["dist", "README.md"]` for npm publish
  - Requirements: R8, R9

- [x] Task 4: Update local Storybook main.ts registration
  - Update `.storybook/main.ts` to reference the addon as `'../addon-speakable'`
  - Storybook will resolve: find `package.json` → read `exports["./preset"]` → load `dist/preset.js` (CJS) → get manager and preview paths
  - Remove any previous workarounds (managerHead scripts, resolve() calls)
  - Requirements: R1, R12

- [x] Task 5: Verify Storybook loads with addon
  - Run `npm run build` in `addon-speakable/` to produce fresh dist
  - Run `npx storybook build --output-dir /tmp/sb-test` from project root
  - Verify no errors during manager build (no "could not resolve" for imports)
  - Verify no errors during preview build
  - Boot Storybook dev (`npm run storybook`) and confirm the "Screen Readers" panel tab appears
  - Requirements: R1, R2, R12

- [x] Task 6: Refine panel UI and design system
  - Verify the panel displays the 5 tabs (NVDA, JAWS, VoiceOver, Narrator, Audit) correctly
  - Verify the stats bar shows element counts
  - Verify the footer shows the disclaimer text and getspeakable.dev link
  - Verify empty state message appears before any story renders
  - Ensure colors match: slate grays for text/borders, blue-600 for accent, monospace for output
  - Fix any visual issues seen in the actual Storybook panel
  - Requirements: R2, R11

- [x] Task 7: Implement live updates on args change
  - The current decorator runs once after story render
  - Add a MutationObserver in the decorator that watches the story root for subtree changes
  - When mutations are detected (indicating args changed and component re-rendered), debounce 150ms then re-run analyzeDOM and emit updated results
  - Disconnect the observer when the story unmounts (decorator cleanup)
  - Test: change a control in the multi-select story (e.g., toggle disabled options) and verify the panel updates
  - Requirements: R5

- [x] Task 8: Improve analyzer accuracy
  - Verify the analyzer correctly handles the multi-select component:
    - `role="listbox"` with `aria-multiselectable` detected
    - `role="option"` with `aria-selected` state reported
    - `aria-disabled` elements flagged in audit
    - `aria-activedescendant` noted (informational)
  - Add handling for `aria-current`, `aria-busy`, `aria-grabbed` states
  - Add `role="tablist"`, `role="tab"`, `role="tabpanel"` to implicit role map
  - Verify headings show level in all 4 renderers
  - Verify disabled elements use correct vocabulary per renderer (unavailable/dimmed/disabled)
  - Requirements: R3, R6, R7

- [x] Task 9: Integration test against multi-select stories
  - Boot Storybook with the addon loaded
  - Navigate to Components/MultiSelect/Default story
  - Verify panel shows predicted output for the trigger button and options
  - Navigate to WithDisabledOptions story
  - Verify the audit tab shows no errors (disabled is a valid state, not a missing name)
  - Verify NVDA tab shows "unavailable" and VoiceOver tab shows "dimmed" for disabled options
  - Navigate to WithPreselection story
  - Verify "selected" state appears in NVDA/JAWS output
  - Document any discrepancies between addon output and CLI output for the same HTML
  - Requirements: R2, R3, R7

- [x] Task 10: Create README.md for the addon package
  - Create `addon-speakable/README.md` with:
    - Installation: `npm install @reticular/storybook-addon-speakable`
    - Configuration: single line in `.storybook/main.ts`
    - Screenshot/description of what the panel looks like
    - Supported Storybook versions (8.x)
    - Supported frameworks (HTML, React, Vue, Svelte, Angular)
    - Link to getspeakable.dev docs
    - Limitations section (heuristic-based, static HTML analysis, no JS execution tracking)
  - Requirements: R8

- [x] Task 11: Prepare for npm publish
  - Ensure `package.json` has correct: name, version, description, repository, homepage, bugs, license, keywords
  - Run `npm pack` in `addon-speakable/` and verify the tarball contains only `dist/` and `README.md`
  - Verify the package installs cleanly in a fresh project: `npm install ./reticular-storybook-addon-speakable-0.1.0.tgz`
  - Add `addon-speakable/node_modules` and `addon-speakable/dist` to root `.gitignore`
  - Requirements: R8, R9

## Notes

- The preset MUST be CJS. This is the root cause of the current registration failure.
- The manager imports `@storybook/manager-api` which is provided by the host Storybook (externalized).
- The preview decorator has no React dependency (it manipulates raw DOM and uses the Storybook channel).
- The analyzer has zero Node.js dependencies. It works in any browser environment.
- For local development: run `cd addon-speakable && npx tsup` after source changes, then restart Storybook.
