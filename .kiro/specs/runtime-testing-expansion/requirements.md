# Requirements Document

## Introduction

This feature expands AnnounceKit's runtime testing capabilities so that developers can quickly test the predicted screen reader output of their components in a live browser context — inside Storybook, inside an arbitrary iframe, and for real web components (including Lit and shadow DOM). Today the project has two disconnected halves: a static per-render analyzer (surfaced in the Storybook addon and browser extension) and a powerful interaction-over-time runtime engine (`src/runtime/`) that records and diffs announcement timelines but is not wired into any user-facing surface.

The work is organized into four tracks:

1. **Track 1 — Interaction timeline in Storybook.** Expose the existing runtime engine (event collection, timeline generation, baseline capture, and behavioral diffing) through the Storybook addon so users can see announcements across an interaction sequence and detect regressions.
2. **Track 2 — First-class iframe / arbitrary-DOM testing.** Provide a transport-agnostic browser bundle of the analyzer + runtime engine and a `postMessage` iframe harness so any component can be loaded in an iframe and tested in a real browser, independent of Storybook.
3. **Track 3 — Web-component / Lit correctness.** Correctly model `<slot>` projection, custom-element upgrade timing, and closed shadow roots so analysis of web components is trustworthy.
4. **Track 4 — Unify the extension onto the core engine.** Replace the extension's parallel `DOMParser`-based analyzer with the shared core browser bundle so output is consistent and shadow-DOM aware.

The goal is a single, consistent runtime analysis engine surfaced across Storybook, iframe harness, and the browser extension, with correct web-component support and regression-detection tooling.

## Glossary

- **Static analysis**: A one-time snapshot of the accessibility tree of the currently rendered DOM, producing predicted announcements per screen reader.
- **Timeline**: An ordered sequence of accessibility events (focus changes, live-region updates, dialog open/close, mutations) captured while a user or automated sequence interacts with a component.
- **Baseline**: A stored timeline (or static result) that later runs are diffed against to detect regressions.
- **Core engine**: The shared analyzer in `src/` (`parseHTML`, `buildAccessibilityTree`, per-reader renderers, `generateAuditReport`) and runtime engine (`src/runtime/`).
- **Browser bundle**: A transport-agnostic build of the core engine that runs in a real browser without depending on Storybook internals.
- **Harness**: A helper that mounts a component (via URL or HTML) into an iframe, injects the browser bundle, and collects results over `postMessage`.
- **Slotted content**: Light-DOM child nodes of a custom element that are projected into `<slot>` elements inside its shadow root.

## Requirements

### Requirement 1 — Transport-agnostic browser bundle (Track 2 foundation)

**User Story:** As a developer integrating AnnounceKit outside Storybook, I want a browser-loadable analyzer bundle that is not coupled to Storybook's channel, so that I can run analysis and interaction capture in any web page or iframe.

#### Acceptance Criteria

1. WHEN the browser bundle is loaded in a page THEN the system SHALL expose a stable global/module API for static analysis of a DOM element that returns the same `AnalysisResult` shape currently produced by `addon-speakable/src/analyzer.ts`.
2. WHEN the browser bundle is loaded THEN the system SHALL expose an API to attach the runtime engine to a document, capture a timeline, and return a serializable timeline result.
3. WHEN static analysis is invoked THEN the system SHALL reuse the core engine (`buildAccessibilityTree` + the four renderers + `generateAuditReport`) and SHALL NOT reimplement the analysis pipeline.
4. WHEN the bundle is built THEN it SHALL NOT reference Storybook-specific globals (e.g. `__STORYBOOK_ADDONS_CHANNEL__`) in its core analysis path.
5. WHEN the bundle is produced by the build THEN it SHALL be available as a distributable artifact referenced from the package's build outputs.
6. IF analysis is invoked on a detached or empty element THEN the system SHALL return a well-formed empty result rather than throwing.

### Requirement 2 — Iframe testing harness (Track 2)

**User Story:** As a developer, I want to load a component into an iframe and receive predicted screen reader output over `postMessage`, so that I can test components (including Lit web components) in a real browser without Storybook.

#### Acceptance Criteria

1. WHEN a user provides a component as a URL or an HTML string THEN the harness SHALL create an iframe, load the content, and inject the browser bundle into it.
2. WHEN the injected bundle completes static analysis THEN the harness SHALL receive the `AnalysisResult` in the parent context via `postMessage`.
3. WHEN an interaction sequence is requested THEN the harness SHALL trigger it inside the iframe and receive the resulting timeline in the parent context via `postMessage`.
4. WHEN messages are exchanged over `postMessage` THEN the harness SHALL validate the message origin and message shape before acting on them.
5. IF the iframe content fails to load or the bundle fails to inject THEN the harness SHALL surface a descriptive error to the caller rather than hanging indefinitely.
6. WHEN the harness analyzes content in a real browser THEN it SHALL support open shadow roots present in the loaded component.

### Requirement 3 — Web-component slot projection (Track 3)

**User Story:** As a web-component author, I want slotted light-DOM content to appear in the correct order in the predicted announcements, so that the output matches what a real screen reader conveys.

#### Acceptance Criteria

1. WHEN the tree builder traverses an element with an open shadow root containing `<slot>` elements THEN the system SHALL resolve each slot's assigned nodes and place them in shadow-tree order.
2. WHEN a slot has assigned nodes THEN the system SHALL use the flattened assigned nodes rather than the raw light-DOM child order.
3. WHEN a slot has no assigned nodes THEN the system SHALL fall back to the slot's default content.
4. WHEN light-DOM children are projected into a shadow slot THEN the system SHALL NOT also emit them a second time from their light-DOM position.
5. WHEN an element has a shadow root but no slots THEN existing shadow-then-light traversal behavior SHALL be preserved.

### Requirement 4 — Custom-element upgrade timing (Track 3)

**User Story:** As a web-component author, I want analysis to run after my component has upgraded and rendered, so that I do not get pre-hydration results.

#### Acceptance Criteria

1. WHEN a component uses custom elements THEN the harness/addon SHALL wait for the relevant custom elements to be defined before capturing analysis.
2. WHEN a component exposes an update-complete signal (e.g. Lit's `updateComplete`) THEN the system SHALL await it where available before capturing analysis.
3. IF a custom element does not upgrade within a configurable timeout THEN the system SHALL proceed with analysis and record a warning indicating the component may not have finished upgrading.
4. WHEN awaiting upgrade completion THEN the system SHALL NOT block indefinitely.

### Requirement 5 — Closed shadow root handling (Track 3)

**User Story:** As a developer, I want to be told when part of a component cannot be analyzed, so that I do not mistake partial coverage for full coverage.

#### Acceptance Criteria

1. WHEN the tree builder encounters an element whose shadow root is not accessible (closed) THEN the system SHALL emit a warning identifying the element.
2. WHEN a closed shadow root is encountered THEN the system SHALL continue analyzing the rest of the tree without throwing.
3. WHEN warnings are produced THEN they SHALL be included in the result surfaced to the user (addon panel, harness result, extension output).

### Requirement 6 — Interaction timeline capture in Storybook (Track 1)

**User Story:** As a Storybook user, I want to see the predicted announcements produced as I interact with a story, so that I can evaluate the dynamic accessibility behavior of my component, not just its static snapshot.

#### Acceptance Criteria

1. WHEN a story renders in the preview iframe THEN the addon SHALL be able to attach the runtime engine to the preview document and collect accessibility events.
2. WHEN a story defines an interaction sequence (e.g. a Storybook `play` function or a selected built-in pattern) THEN the addon SHALL execute it and capture the resulting timeline.
3. WHEN a timeline is captured THEN the addon SHALL emit it to the manager panel alongside the existing static `AnalysisResult`.
4. WHEN the manager panel receives a timeline THEN it SHALL display the announcements in chronological order in a dedicated "Timeline" view.
5. WHEN no interaction sequence is available for a story THEN the addon SHALL continue to show static analysis without error.
6. WHEN the runtime engine is attached THEN it SHALL be detached/reset when the story changes to avoid leaking observers across stories.

### Requirement 7 — Baseline capture and behavioral diff in Storybook (Track 1)

**User Story:** As a Storybook user, I want to capture a baseline for a story and be shown how later runs differ, so that I can catch accessibility regressions.

#### Acceptance Criteria

1. WHEN a user chooses to set a baseline for the current story THEN the system SHALL persist the current timeline as the baseline for that story.
2. WHEN a story with an existing baseline is analyzed THEN the system SHALL diff the current timeline against the baseline using the existing diff engine.
3. WHEN a diff is produced THEN the system SHALL classify each entry by severity using the existing severity classifier.
4. WHEN diff results are displayed THEN the panel SHALL visually distinguish added, removed, and changed announcements and their severities.
5. WHEN no baseline exists for a story THEN the panel SHALL indicate that a baseline can be set rather than showing an empty or error state.
6. WHEN a baseline is persisted THEN it SHALL be identified by a stable per-story key so it can be retrieved on later runs.

### Requirement 8 — Unify the extension onto the core engine (Track 4)

**User Story:** As a user of the browser extension, I want its output to match the CLI and Storybook addon and to correctly handle shadow DOM, so that I get consistent, accurate results everywhere.

#### Acceptance Criteria

1. WHEN the extension analyzes a page THEN it SHALL use the shared core browser bundle rather than the standalone `analyzer-bridge.js` reimplementation.
2. WHEN the extension analyzes a page THEN it SHALL operate on the live DOM so that JS-set state (e.g. `input.checked`) is captured.
3. WHEN the extension analyzes a page containing open shadow roots THEN the output SHALL include the shadow content, consistent with the core engine.
4. WHEN the extension produces output for a given DOM THEN the announcements SHALL match those produced by the core engine for the equivalent DOM.
5. WHEN the extension is migrated THEN the standalone reimplementation SHALL be removed or reduced to a thin adapter over the shared bundle.

### Requirement 9 — Output consistency across surfaces (cross-cutting)

**User Story:** As a maintainer, I want all surfaces to produce identical announcements for equivalent DOM, so that there is a single source of truth for analysis behavior.

#### Acceptance Criteria

1. WHEN the same DOM is analyzed by the Storybook addon, the iframe harness, and the extension THEN the predicted announcements per reader SHALL be identical.
2. WHEN the core engine's behavior changes THEN all three surfaces SHALL reflect the change without per-surface reimplementation.
3. WHEN shadow DOM and slot handling changes in the core engine THEN all real-browser surfaces SHALL reflect the change.

### Requirement 10 — Backward compatibility and build integrity (cross-cutting)

**User Story:** As an existing user, I want the current static analysis in Storybook and the CLI/MCP to keep working, so that this expansion does not break my workflow.

#### Acceptance Criteria

1. WHEN the changes are built THEN the existing `build` and `build:addon` scripts SHALL succeed and produce the existing artifacts plus the new browser bundle.
2. WHEN the Storybook addon loads THEN the existing static NVDA/JAWS/VoiceOver/Narrator/Audit tabs SHALL continue to function.
3. WHEN the CLI/MCP path runs THEN its behavior SHALL be unchanged by these tracks.
4. WHEN the test suite runs THEN existing tests SHALL continue to pass and new behavior SHALL be covered by tests.
