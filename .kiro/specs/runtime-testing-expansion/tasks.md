# Implementation Plan

- [ ] 1. Create the transport-agnostic browser bundle (Track 2 foundation)
- [ ] 1.1 Scaffold `src/browser/` and relocate static analysis
  - Create `src/browser/analyze.ts` and move the `AnalysisResult`/`AuditFinding` types and the analysis logic from `addon-speakable/src/analyzer.ts` into it as `analyzeElement(root: Element): AnalysisResult`
  - Reuse the core engine only: `buildAccessibilityTree` + the four renderers + `generateAuditReport` + `countStats`/`convertAuditFindings` (no reimplementation)
  - Add a `warnings: string[]` field to `AnalysisResult` and populate it by mapping `TreeBuildWarning[]` from `buildAccessibilityTree`
  - Return a well-formed empty result for empty/detached input instead of throwing
  - Update `addon-speakable/src/analyzer.ts` to re-export `analyzeElement` (aliased as `analyzeDOM`) from the new module for backward compatibility
  - _Requirements: 1.1, 1.3, 1.6, 5.3, 10.2_

- [ ] 1.2 Add interaction capture wrapper to the bundle
  - Create `src/browser/capture.ts` exporting `captureTimeline(document, options: CaptureOptions): Promise<AccessibilityTimeline>`
  - Delegate to `createTimelineGenerator({ document, componentName, storyName, settlePeriod }).capture(sequence)` from `src/runtime`
  - Define `CaptureOptions` (componentName, storyName?, sequence, settlePeriod?, awaitUpgrade?, upgradeTimeoutMs?)
  - Leave the `awaitUpgrade` hook as a no-op placeholder call to be implemented in task 3.3
  - _Requirements: 1.2, 6.2_

- [ ] 1.3 Add the injectable IIFE entry and barrel
  - Create `src/browser/inject-entry.ts` that assigns `window.__SPEAKABLE__ = { analyzeElement, captureTimeline, version }`
  - Create `src/browser/index.ts` barrel re-exporting `analyzeElement`, `captureTimeline`, and their types
  - Ensure no Storybook-specific globals are referenced in the bundle's analysis path
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 1.4 Wire the browser bundle into the build
  - Add two entries to root `tsup.config.ts`: ESM (`browser/index` → `src/browser/index.ts`, `platform: 'browser'`, `dts: true`, `clean: false`) and IIFE (`speakable-browser.global` → `src/browser/inject-entry.ts`, `globalName: 'SpeakableBrowser'`, `platform: 'browser'`, `clean: false`)
  - Add `"./browser"` to `package.json` `exports` pointing at `./dist/browser/index.js`
  - Run the build and confirm existing CLI/MCP/library outputs plus the two new artifacts are produced
  - _Requirements: 1.5, 10.1, 10.3_

- [ ] 1.5 Unit tests for the browser bundle
  - Test `analyzeElement` output parity against the previous `analyzeDOM` on shared fixtures
  - Test empty/detached input returns a well-formed empty result (no throw)
  - Test `warnings` is populated when tree-build warnings occur
  - _Requirements: 1.1, 1.6, 9.1_

- [ ] 2. Improve shadow-DOM slot projection in the core engine (Track 3)
- [ ] 2.1 Centralize child collection into a slot-aware helper
  - In `src/extractor/tree-builder.ts`, add `collectAccessibleChildren(element, warnings): AccessibleNode[]`
  - When an open `shadowRoot` exists, traverse the shadow tree; on a `<slot>`, resolve `slot.assignedNodes({ flatten: true })` and process assigned nodes in place; fall back to the slot's default children when no nodes are assigned
  - When no shadow root exists, traverse light-DOM `childNodes` as today
  - Guard `assignedNodes`/`shadowRoot` with feature detection so the jsdom path degrades gracefully
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 2.2 Replace the shadow-then-light duplication with the helper
  - Update `collectChildrenFromRolelessElement`, `buildNodeRecursive`, and `createGenericContainer` to call `collectAccessibleChildren`
  - Ensure slotted light-DOM nodes are emitted only once (at the slot position, not again from the host's light DOM)
  - _Requirements: 3.4, 3.5_

- [ ] 2.3 Tests for slot projection
  - Add tests: slotted content appears in shadow-tree order; default slot content used when nothing is assigned; no double emission of slotted nodes; no-shadow and no-slot behavior unchanged
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.4_

- [ ] 3. Add custom-element upgrade timing and closed-root warnings (Track 3)
- [ ] 3.1 Emit warnings for likely closed shadow roots in the tree builder
  - In `src/extractor/tree-builder.ts`, when an element is a custom element (localName contains `-`) with no `shadowRoot` and no light children, push a `TreeBuildWarning` noting possible hidden (closed) content
  - Ensure traversal continues without throwing
  - _Requirements: 5.1, 5.2_

- [ ] 3.2 Implement `awaitCustomElementsReady` in the browser bundle
  - Create `src/browser/upgrade.ts` exporting `awaitCustomElementsReady(root, timeoutMs): Promise<UpgradeWarning[]>`
  - Collect custom-element tags under `root`; for each `await customElements.whenDefined(tag)` bounded by `timeoutMs`; also await an `updateComplete` promise when present (Lit)
  - On timeout, resolve anyway and return one `UpgradeWarning` per unresolved tag; never block indefinitely
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 3.3 Integrate upgrade-await into capture and analysis
  - In `src/browser/capture.ts`, call `awaitCustomElementsReady` before capture when `awaitUpgrade` is set (default true) and merge returned warnings
  - In `src/browser/analyze.ts`, expose an optional async path or helper so the harness/addon can await upgrade before `analyzeElement`, folding `UpgradeWarning` messages into `AnalysisResult.warnings`
  - _Requirements: 4.1, 4.2, 4.3, 5.3_

- [ ] 3.4 Tests for upgrade timing and closed-root warnings
  - Test late-resolving `whenDefined`/`updateComplete` causes analysis to wait, and a timeout produces a warning
  - Test a stubbed closed-root custom element yields a warning and does not throw
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2_

- [ ] 4. Build the iframe harness (Track 2)
- [ ] 4.1 Define the in-iframe agent
  - Create `src/harness/agent.ts` (bundled into the IIFE inject entry) that listens for `message` events, validates `event.origin` against an allowlist and `event.source`, dispatches `analyze`/`capture` requests to `window.__SPEAKABLE__`, and posts back a correlated response; also posts a `{ready}` message after injection
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 4.2 Implement the parent-side harness controller
  - Create `src/harness/index.ts` exporting `createHarness(options): Harness` with `load`, `analyze`, `captureTimeline`, `destroy`
  - `load` sets `srcdoc` (for `{ html }`) or `src` (same-origin `{ url }`), waits for the iframe `load` event, injects the IIFE bundle via an appended `<script>`, and waits for `{ready}`
  - `analyze`/`captureTimeline` send correlated `postMessage` requests and resolve on matching responses; reject on timeout
  - Detect cross-origin URLs and reject with a descriptive error recommending `srcdoc`/same-origin
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

- [ ] 4.3 Add harness to the build and exports
  - Include the agent in the IIFE inject entry; add an ESM export path for `createHarness` (e.g. `"./harness"` in `package.json` exports and a tsup entry)
  - _Requirements: 1.5, 2.1_

- [ ] 4.4 Tests for the harness
  - Test request/response correlation via an in-DOM `srcdoc` iframe; origin rejection; load/inject timeout; open shadow-root content is included in results
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 5. Wire interaction timeline into the Storybook addon (Track 1)
- [ ] 5.1 Add channel events and sequence resolution in the preview
  - In `addon-speakable/src/index.ts`, add `EVENT_TIMELINE = 'speakable/timeline'` and `EVENT_DIFF = 'speakable/diff'`
  - In `addon-speakable/src/preview.ts`, resolve an interaction sequence per priority: `parameters.speakable.sequence` → `play`-derived intent → selected built-in pattern via `getBuiltinPattern`; if none, skip timeline capture
  - _Requirements: 6.2, 6.5_

- [ ] 5.2 Capture and emit the timeline on story render
  - After static `runAnalysis()`, call `captureTimeline(document, { componentName, storyName, sequence })` from the browser bundle and emit the result over `EVENT_TIMELINE`
  - Abort any in-flight capture on story change and ensure the engine is detached/reset between stories
  - Keep static analysis emitting on `EVENT_RESULT` unchanged
  - _Requirements: 6.1, 6.3, 6.5, 6.6, 10.2_

- [ ] 5.3 Add the Timeline tab to the manager panel
  - In `addon-speakable/src/manager.tsx`, subscribe to `EVENT_TIMELINE`, add a "Timeline" tab that renders events chronologically (timestamp, type, target role/name, payload summary)
  - Show a "No baseline yet" hint and a "Set baseline" button in this view
  - _Requirements: 6.4, 7.5_

- [ ] 6. Add baseline capture and behavioral diff to the addon (Track 1)
- [ ] 6.1 Implement a browser baseline store
  - Create a `PanelBaselineStore` (localStorage/IndexedDB) in the addon keyed by a stable `component::story` key, with `save`/`load`/`key`
  - _Requirements: 7.1, 7.6_

- [ ] 6.2 Compute and emit diffs in the manager
  - On receiving a timeline, load any stored baseline for the story; if present, compute `diffTimelines(baseline, current)` then `classifyDiff(...)` and emit `EVENT_DIFF`
  - Wire the "Set baseline" button to persist the current timeline via `PanelBaselineStore`
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 6.3 Add the Diff tab to the manager panel
  - Add a "Diff" tab rendering the `ClassifiedDiffReport`: added/removed/changed entries with severity coloring; show the set-baseline affordance when no baseline exists
  - _Requirements: 7.4, 7.5_

- [ ] 6.4 Tests for timeline and baseline/diff in the addon
  - Test sequence-resolution priority, `EVENT_TIMELINE`/`EVENT_DIFF` emission, baseline set/load, and diff+classify wiring; confirm static tabs still function
  - _Requirements: 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 10.2_

- [ ] 7. Unify the browser extension onto the core engine (Track 4)
- [ ] 7.1 Ship the IIFE bundle with the extension
  - Update `extension/build.sh` to copy `dist/speakable-browser.global.js` into `extension/vendor/`
  - _Requirements: 8.1_

- [ ] 7.2 Analyze live DOM in the content script
  - Update `extension/content.js` to inject/load the bundle in the page context and call `window.__SPEAKABLE__.analyzeElement(...)` against the live DOM (full document or selector-scoped), returning `AnalysisResult` instead of raw HTML
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 7.3 Consume `AnalysisResult` in the popup and remove the old analyzer
  - Update `extension/popup.js` to render the returned `AnalysisResult` directly
  - Remove `extension/analyzer-bridge.js`; replace any remaining `window.SpeakableAnalyzer` references with a thin adapter over the bundle
  - _Requirements: 8.1, 8.5_

- [ ] 7.4 Tests for the extension path
  - Test that `content.js` produces an `AnalysisResult` from live DOM including open shadow-root content, and that output matches the core engine for a shared fixture
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 8. Cross-surface consistency and final build verification
- [ ] 8.1 Shared-fixture consistency tests
  - Create a shared fixture set and assert identical per-reader announcements when analyzed through the browser bundle, the addon path, and the extension path
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 8.2 Full build and regression run
  - Run `npm run build` and `npm run build:addon`; confirm all existing and new artifacts are produced and the existing test suite passes
  - _Requirements: 10.1, 10.2, 10.3, 10.4_
