# Requirements Document

## Introduction

Speakable currently provides static accessibility analysis: parsing HTML markup, predicting screen reader output, diffing announcements between builds, and detecting regressions in CI/CD pipelines. However, many accessibility defects emerge only during runtime interaction. Focus escaping modal dialogs, broken focus restoration, aria-live regions over-announcing, combobox navigation regressions, and keyboard interaction failures all require observing behavior over time rather than analyzing static DOM structure.

This feature extends Speakable from "Static Accessibility Regression Detection" to "Accessibility Behavior Regression Detection" by introducing a Runtime Accessibility Engine. The engine captures accessibility-relevant events during component interaction, producing Accessibility Timelines that can be baselined, diffed, and used for regression detection across builds.

The feature has six pillars: (1) a Runtime Accessibility Engine that observes accessibility behavior during interaction, (2) a normalized Accessibility Event structure for representing focus changes, announcements, mutations, and state transitions, (3) an Accessibility Timeline Generator that produces timestamped event sequences, (4) a Storybook Adapter for discovering stories and running interaction tests, (5) an Accessibility Behavior Diff Engine for comparing timelines across builds, and (6) CI/CD integration for runtime regression detection in automated pipelines.

## Glossary

- **Runtime_Accessibility_Engine**: The core module responsible for attaching to a browser context (iframe or page), installing observers for accessibility-relevant DOM changes, and emitting normalized Accessibility Events.
- **Accessibility_Event**: A normalized event structure representing a single accessibility-relevant change. Each event has a type, timestamp, target element reference, and type-specific payload.
- **Accessibility_Timeline**: An ordered sequence of Accessibility Events captured during a single interaction session, along with metadata about the session (component, story, interaction sequence, duration).
- **Timeline_Generator**: The module responsible for orchestrating an interaction session: attaching the Runtime_Accessibility_Engine, executing interaction sequences, collecting events, and producing an Accessibility_Timeline.
- **Storybook_Adapter**: The module responsible for connecting to a running Storybook instance, discovering available stories and their variants, and loading story iframes for runtime analysis.
- **Interaction_Sequence**: An ordered list of user actions (keyboard presses, clicks, focus actions) to perform during a timeline capture session. Actions include: click, tab, shift-tab, escape, enter, space, arrow-up, arrow-down, arrow-left, arrow-right, and custom key combinations.
- **Behavior_Diff_Engine**: The module responsible for comparing two Accessibility Timelines and producing a Behavior_Diff_Report describing added, removed, and modified events.
- **Behavior_Diff_Report**: A structured summary of differences between two Accessibility Timelines, with each difference classified by severity level.
- **Baseline_Storage**: The file-based storage system for saving Accessibility Timeline snapshots as regression baselines, organized by component and story.
- **Severity_Level**: A classification for accessibility behavior regressions: critical (focus loss, modal focus escape, missing required announcements), high (incorrect focus restoration, keyboard navigation regressions), medium (additional announcements, accessible name changes), low (timing differences, non-breaking behavior changes).
- **Event_Type**: One of the recognized accessibility event categories: FOCUS_CHANGED, ANNOUNCEMENT, DOM_MUTATION, ROLE_CHANGED, ACCESSIBLE_NAME_CHANGED, STATE_CHANGED, KEYBOARD_ACTION, DIALOG_OPENED, DIALOG_CLOSED, WARNING, REGRESSION.
- **Story**: A single Storybook story representing a component in a specific state or variant.
- **Story_Discovery**: The process of connecting to a Storybook instance and enumerating available stories, components, and variants.
- **CI_Runtime_Mode**: A CLI mode that runs runtime accessibility analysis as part of a CI/CD pipeline, producing machine-readable output and non-zero exit codes on regressions.
- **Focus_Trap**: An accessibility pattern where keyboard focus is constrained within a container (such as a modal dialog) and prevented from escaping to elements outside.
- **Announcement**: A text string that would be communicated to assistive technology users, typically through aria-live regions or focus changes that trigger accessible name reading.

## Requirements

### Requirement 1: Accessibility Event Collection

**User Story:** As a developer, I want the Runtime Accessibility Engine to observe and capture accessibility-relevant DOM events during component interaction, so that I can understand how my component behaves for assistive technology users over time.

#### Acceptance Criteria

1. WHEN the Runtime_Accessibility_Engine is attached to a document, THE Runtime_Accessibility_Engine SHALL observe focus changes and emit a FOCUS_CHANGED event containing the target element role, accessible name, and previous focus target.
2. WHEN an aria-live region receives new content, THE Runtime_Accessibility_Engine SHALL emit an ANNOUNCEMENT event containing the live region politeness level (polite or assertive) and the announced text.
3. WHEN an element's ARIA role attribute changes, THE Runtime_Accessibility_Engine SHALL emit a ROLE_CHANGED event containing the previous role and new role.
4. WHEN an element's accessible name changes (via aria-label, aria-labelledby, or associated label content), THE Runtime_Accessibility_Engine SHALL emit an ACCESSIBLE_NAME_CHANGED event containing the previous name and new name.
5. WHEN an element's ARIA state attribute changes (aria-expanded, aria-selected, aria-checked, aria-disabled, aria-hidden), THE Runtime_Accessibility_Engine SHALL emit a STATE_CHANGED event containing the attribute name, previous value, and new value.
6. WHEN a dialog element is opened (via the open attribute or showModal), THE Runtime_Accessibility_Engine SHALL emit a DIALOG_OPENED event containing the dialog accessible name and whether it is modal.
7. WHEN a dialog element is closed, THE Runtime_Accessibility_Engine SHALL emit a DIALOG_CLOSED event containing the dialog accessible name.
8. WHEN a keyboard action is performed during an interaction session, THE Runtime_Accessibility_Engine SHALL emit a KEYBOARD_ACTION event containing the key combination and target element.
9. THE Runtime_Accessibility_Engine SHALL assign a monotonically increasing timestamp (relative to session start) to each Accessibility_Event.

### Requirement 2: Accessibility Event Structure

**User Story:** As a developer, I want accessibility events to have a consistent, normalized structure, so that events can be reliably compared across timeline captures regardless of when they occurred.

#### Acceptance Criteria

1. THE Accessibility_Event SHALL contain the following common fields: `type` (Event_Type), `timestamp` (number, milliseconds from session start), `target` (object with role, accessibleName, and selector path), and `payload` (type-specific data).
2. THE `target.selector` field SHALL contain a stable CSS selector path that uniquely identifies the target element within the document.
3. THE Accessibility_Event serializer SHALL produce deterministic JSON output with sorted keys for stable version control diffs.
4. FOR ALL valid Accessibility_Event objects, serializing to JSON then deserializing SHALL produce an equivalent Accessibility_Event object (round-trip property).
5. THE Accessibility_Event serializer SHALL format Accessibility_Event objects back into valid JSON (pretty-printer with 2-space indentation).
6. WHEN an event target element is removed from the DOM before serialization, THE Runtime_Accessibility_Engine SHALL use the last-known selector path and accessible name for the target field.

### Requirement 3: Accessibility Timeline Generation

**User Story:** As a developer, I want to generate a complete Accessibility Timeline from an interaction session, so that I can review the full sequence of accessibility behavior for a component.

#### Acceptance Criteria

1. WHEN a timeline capture session is started, THE Timeline_Generator SHALL attach the Runtime_Accessibility_Engine to the target document and begin collecting Accessibility Events.
2. WHEN an Interaction_Sequence is provided, THE Timeline_Generator SHALL execute each action in order, waiting for DOM stability (no pending mutations for 100ms) between actions.
3. WHEN the Interaction_Sequence completes, THE Timeline_Generator SHALL wait for a configurable settle period (default 500ms) to capture any trailing asynchronous events, then stop collection.
4. THE Timeline_Generator SHALL produce an Accessibility_Timeline containing: the ordered event sequence, session metadata (component name, story name, interaction sequence description, total duration), and a timeline format version string.
5. IF the target document fails to load within 10 seconds, THEN THE Timeline_Generator SHALL abort the session and return an error containing the URL and failure reason.
6. THE Timeline_Generator SHALL serialize Accessibility_Timeline objects to deterministic JSON with sorted keys.
7. FOR ALL valid Accessibility_Timeline objects, serializing then deserializing SHALL produce an equivalent Accessibility_Timeline object (round-trip property).

### Requirement 4: Storybook Story Discovery

**User Story:** As a developer, I want Speakable to connect to my Storybook instance and discover available stories, so that I can generate accessibility timelines for my component library without manual configuration.

#### Acceptance Criteria

1. WHEN a Storybook URL is provided, THE Storybook_Adapter SHALL connect to the Storybook instance and retrieve the list of available stories.
2. THE Storybook_Adapter SHALL parse the Storybook stories index to extract component names, story names, and story IDs.
3. WHEN a component filter pattern is provided, THE Storybook_Adapter SHALL return only stories whose component name matches the glob pattern.
4. IF the Storybook instance is unreachable at the provided URL, THEN THE Storybook_Adapter SHALL return an error containing the URL and connection failure details.
5. IF the Storybook instance does not expose a stories index, THEN THE Storybook_Adapter SHALL return an error indicating the Storybook version may be unsupported.
6. THE Storybook_Adapter SHALL support Storybook 7.x and 8.x stories index formats.

### Requirement 5: Storybook Story Loading and Interaction

**User Story:** As a developer, I want Speakable to load individual Storybook stories in isolation and execute interaction sequences against them, so that I can capture accessibility timelines for specific component states.

#### Acceptance Criteria

1. WHEN a story ID is provided, THE Storybook_Adapter SHALL load the story in an isolated iframe using the Storybook iframe URL format.
2. WHEN the story iframe has loaded and rendered, THE Storybook_Adapter SHALL signal readiness to the Timeline_Generator.
3. IF the story iframe fails to load within 10 seconds, THEN THE Storybook_Adapter SHALL return an error containing the story ID and failure reason.
4. WHEN the story has associated Storybook interaction tests (play functions), THE Storybook_Adapter SHALL detect and report their availability.
5. THE Storybook_Adapter SHALL support loading stories with custom viewports by accepting a viewport width and height parameter.

### Requirement 6: Interaction Sequence Definition

**User Story:** As a developer, I want to define reusable interaction sequences for accessibility timeline capture, so that I can consistently test keyboard navigation, dialog behavior, and widget interactions.

#### Acceptance Criteria

1. THE Interaction_Sequence SHALL support the following action types: `click(selector)`, `tab`, `shiftTab`, `escape`, `enter`, `space`, `arrowUp`, `arrowDown`, `arrowLeft`, `arrowRight`, `key(combo)`, and `wait(ms)`.
2. WHEN a `click(selector)` action is executed, THE Timeline_Generator SHALL click the first element matching the CSS selector.
3. WHEN a `tab` or `shiftTab` action is executed, THE Timeline_Generator SHALL dispatch keyboard events that move focus to the next or previous focusable element.
4. WHEN a `key(combo)` action is executed, THE Timeline_Generator SHALL dispatch keyboard events matching the specified key combination (e.g., "Control+A", "Alt+F4").
5. WHEN a `wait(ms)` action is executed, THE Timeline_Generator SHALL pause for the specified milliseconds before proceeding to the next action.
6. IF a `click(selector)` action targets an element that does not exist in the document, THEN THE Timeline_Generator SHALL emit a WARNING event with the selector and "element not found" message, and proceed to the next action.
7. THE Interaction_Sequence serializer SHALL produce deterministic JSON output and support round-trip serialization (serialize then deserialize produces an equivalent object).

### Requirement 7: Built-in Interaction Patterns

**User Story:** As a developer, I want Speakable to include built-in interaction patterns for common ARIA widgets, so that I can quickly test accessibility behavior without writing custom sequences for every component.

#### Acceptance Criteria

1. THE Timeline_Generator SHALL provide a "modal-dialog" built-in pattern that: clicks a trigger, verifies focus moves into the dialog, tabs through dialog content, presses escape, and verifies focus returns to the trigger.
2. THE Timeline_Generator SHALL provide a "combobox" built-in pattern that: focuses the combobox input, types to filter, navigates options with arrow keys, selects with enter, and verifies the selection is announced.
3. THE Timeline_Generator SHALL provide a "tabs" built-in pattern that: focuses the tab list, navigates between tabs with arrow keys, activates with enter or space, and verifies panel content changes are communicated.
4. THE Timeline_Generator SHALL provide an "accordion" built-in pattern that: focuses the first accordion header, toggles with enter or space, navigates between headers, and verifies expanded/collapsed state announcements.
5. WHEN a built-in pattern is invoked with a component-specific selector map, THE Timeline_Generator SHALL use those selectors instead of defaults for locating trigger, container, and content elements.

### Requirement 8: Accessibility Behavior Diffing

**User Story:** As a developer, I want to compare two Accessibility Timelines and see a structured diff of behavior changes, so that I can identify regressions introduced by code changes.

#### Acceptance Criteria

1. WHEN two Accessibility_Timelines are provided, THE Behavior_Diff_Engine SHALL compare event sequences and produce a Behavior_Diff_Report.
2. THE Behavior_Diff_Engine SHALL match events between timelines using event type and target selector as the primary matching key, with timestamp ordering as a secondary signal.
3. WHEN an event exists in the current timeline but not in the baseline, THE Behavior_Diff_Report SHALL classify it as an "added" event.
4. WHEN an event exists in the baseline but not in the current timeline, THE Behavior_Diff_Report SHALL classify it as a "removed" event.
5. WHEN an event exists in both timelines but has different payload values, THE Behavior_Diff_Report SHALL classify it as a "modified" event and include the previous and current payload values.
6. THE Behavior_Diff_Engine SHALL ignore timestamp differences when matching events, since exact timing varies between runs.
7. THE Behavior_Diff_Report SHALL include a summary containing: total events in baseline, total events in current, number of added events, number of removed events, and number of modified events.

### Requirement 9: Severity Classification for Behavior Regressions

**User Story:** As a developer, I want behavior regressions to be classified by severity, so that I can prioritize fixing critical accessibility failures over minor changes.

#### Acceptance Criteria

1. WHEN a FOCUS_CHANGED event is removed from the timeline (focus never reaches the expected target), THE Behavior_Diff_Engine SHALL classify the regression as critical severity.
2. WHEN a DIALOG_OPENED event occurs without a subsequent FOCUS_CHANGED event targeting an element inside the dialog, THE Behavior_Diff_Engine SHALL classify the regression as critical severity with a "focus not moved to dialog" message.
3. WHEN a DIALOG_CLOSED event occurs without a subsequent FOCUS_CHANGED event targeting the original trigger, THE Behavior_Diff_Engine SHALL classify the regression as high severity with a "focus not restored after dialog close" message.
4. WHEN a KEYBOARD_ACTION event in the baseline produces a different subsequent event sequence in the current timeline, THE Behavior_Diff_Engine SHALL classify the regression as high severity.
5. WHEN an ANNOUNCEMENT event is added to the current timeline that did not exist in the baseline, THE Behavior_Diff_Engine SHALL classify the change as medium severity.
6. WHEN an ACCESSIBLE_NAME_CHANGED event has different payload values between baseline and current timelines, THE Behavior_Diff_Engine SHALL classify the regression as medium severity.
7. WHEN the only differences between timelines are timestamp variations with no structural changes, THE Behavior_Diff_Engine SHALL classify the change as low severity.

### Requirement 10: Baseline Storage and Management

**User Story:** As a developer, I want to save and manage accessibility timeline baselines, so that my team can track expected behavior across builds and update baselines when intentional changes are made.

#### Acceptance Criteria

1. WHEN the `--runtime-snapshot <dir>` flag is provided, THE CLI SHALL save the generated Accessibility_Timeline as a baseline file in the specified directory.
2. THE CLI SHALL organize baseline files using the path pattern `<dir>/<component-name>/<story-name>.timeline.json`.
3. WHEN a baseline file already exists for the given component and story, THE CLI SHALL compare the current timeline against the baseline and produce a Behavior_Diff_Report.
4. WHEN the `--update-runtime-snapshot` flag is provided, THE CLI SHALL overwrite existing baseline files with the current timeline.
5. IF the baseline directory is not writable, THEN THE CLI SHALL print an error to stderr and exit with code 3.
6. THE baseline file SHALL contain the Accessibility_Timeline plus metadata: baseline creation timestamp, Speakable version, Storybook URL (if applicable), and interaction sequence used.

### Requirement 11: Runtime Regression Detection in CI/CD

**User Story:** As a DevOps engineer, I want to run runtime accessibility regression checks in CI/CD pipelines, so that pull requests introducing behavior regressions are flagged before merging.

#### Acceptance Criteria

1. WHEN the `--runtime-ci` flag is provided together with `--runtime-snapshot <dir>` and a Storybook URL, THE CLI SHALL discover stories, generate timelines, compare against baselines, and produce a structured JSON report.
2. WHEN any regression is classified as critical or high severity, THE CLI SHALL exit with code 1.
3. WHEN all regressions are classified as medium or low severity, THE CLI SHALL exit with code 0 (non-blocking by default).
4. WHEN the `--runtime-fail-on medium` option is provided, THE CLI SHALL exit with code 1 for any regression of medium severity or higher.
5. WHEN the `--runtime-fail-on low` option is provided, THE CLI SHALL exit with code 1 for any regression of any severity.
6. THE structured JSON report SHALL contain: an array of story results (each with story ID, component name, severity, and diff summary), overall pass/fail status, total stories analyzed, and total regressions found.
7. THE CLI SHALL write progress messages to stderr and structured output to stdout when `--runtime-ci` is active.

### Requirement 12: Runtime Heuristic Warnings

**User Story:** As a developer, I want Speakable to detect common runtime accessibility anti-patterns and emit warnings, so that I can identify potential issues even without a comparison baseline.

#### Acceptance Criteria

1. WHEN a DIALOG_OPENED event is emitted for a modal dialog and no FOCUS_CHANGED event occurs within 100ms targeting an element inside the dialog, THE Runtime_Accessibility_Engine SHALL emit a WARNING event with the message "Focus was not moved into modal dialog".
2. WHEN focus leaves a modal dialog container (detected via FOCUS_CHANGED to an element outside the dialog while the dialog is open), THE Runtime_Accessibility_Engine SHALL emit a WARNING event with the message "Focus escaped modal dialog".
3. WHEN more than 3 ANNOUNCEMENT events occur within 500ms from aria-live regions, THE Runtime_Accessibility_Engine SHALL emit a WARNING event with the message "Rapid announcements detected: assistive technology users may miss content".
4. WHEN a KEYBOARD_ACTION event is followed by no observable accessibility event within 200ms, THE Runtime_Accessibility_Engine SHALL emit a WARNING event with the message "Keyboard action produced no accessibility response".
5. WHEN a focused element is removed from the DOM without focus being explicitly moved to another element, THE Runtime_Accessibility_Engine SHALL emit a WARNING event with the message "Focused element removed without focus management".

### Requirement 13: CLI Runtime Analysis Command

**User Story:** As a developer, I want a CLI command to run runtime accessibility analysis against a Storybook instance or a local URL, so that I can generate timelines and check for regressions from the command line.

#### Acceptance Criteria

1. WHEN the `speakable runtime <url>` command is executed, THE CLI SHALL connect to the target URL, attach the Runtime_Accessibility_Engine, and output the generated Accessibility_Timeline to stdout.
2. WHEN the `--storybook` flag is provided with a URL, THE CLI SHALL use the Storybook_Adapter to discover and process stories.
3. WHEN the `--story <pattern>` flag is provided, THE CLI SHALL process only stories matching the specified glob pattern.
4. WHEN the `--interaction <name>` flag is provided, THE CLI SHALL use the named built-in interaction pattern for timeline generation.
5. WHEN the `--interaction-file <path>` flag is provided, THE CLI SHALL load a custom Interaction_Sequence from the specified JSON file.
6. WHEN the `--format json` option is provided, THE CLI SHALL output the timeline as formatted JSON to stdout.
7. WHEN the `--format summary` option is provided, THE CLI SHALL output a human-readable summary of events grouped by type.

### Requirement 14: Accessibility Timeline Format and Versioning

**User Story:** As a developer, I want the timeline file format to be versioned and well-defined, so that baselines remain compatible across Speakable upgrades and can be inspected manually.

#### Acceptance Criteria

1. THE Accessibility_Timeline file SHALL use the following top-level JSON structure: `{ "version", "component", "story", "interactionSequence", "duration", "events[]", "warnings[]", "metadata" }`.
2. THE `version` field SHALL contain a timeline format version string (starting at `"1.0"`) to support future migrations.
3. THE `events` array SHALL contain Accessibility_Event objects in chronological order.
4. THE `warnings` array SHALL contain all WARNING-type events separately from the main event sequence for quick reference.
5. THE `metadata` object SHALL contain: `capturedAt` (ISO timestamp), `speakableVersion` (package version), `sourceUrl` (the URL analyzed), and `userAgent` (browser context identifier).
6. THE Accessibility_Timeline serializer SHALL produce deterministic JSON output with 2-space indentation and sorted keys.
7. FOR ALL valid Accessibility_Timeline files, reading the file, parsing the JSON, and re-serializing SHALL produce byte-identical output (round-trip property).

## Implementation Phasing

Do not make the first version dependent on Storybook. Build the Runtime Accessibility Engine first.

Then build (in this order):

1. **Phase 1: Runtime Accessibility Engine** (Requirements 1, 2, 3, 6, 7, 12, 14)
   The core engine that observes accessibility behavior, collects events, generates timelines, and emits heuristic warnings. This is the moat. It should work standalone against any URL or iframe without requiring Storybook.

2. **Phase 2: Website Demo Components** (subset of Requirement 7)
   Interactive demo components on getspeakable.dev (modal, combobox, tabs, accordion, toast) that showcase the Runtime Accessibility Timeline visually. Allow users to compare working vs broken versions to demonstrate regression detection value.

3. **Phase 3: Storybook Adapter** (Requirements 4, 5)
   The distribution channel. Connect to Storybook instances, discover stories, load iframes, and run the engine against component libraries. This only works once Phase 1 is solid.

4. **Phase 4: CI Regression Integration** (Requirements 8, 9, 10, 11, 13)
   The enterprise monetization layer. Behavior diffing, baseline storage, severity classification, and CI/CD pipeline integration with exit codes and JSON reports.

Each phase produces value independently and validates the next one. Phase 1 can ship as a standalone tool or web demo. Phase 2 drives awareness and adoption. Phase 3 unlocks design system teams. Phase 4 unlocks enterprise budgets.


## Future Enhancement: Framework Component Support (URL Mode)

The web tool's runtime sandbox works well for self-contained HTML with inline scripts, but modern development primarily uses React, Vue, Svelte, and other compiled frameworks. These components cannot be pasted as raw HTML.

**Solution: URL input mode for the web tool**

Add a second input mode ("Enter URL") alongside "Paste HTML" in the runtime analyzer. The user enters a URL to their locally running dev server (e.g., `http://localhost:3000/settings`). The tool loads it in an iframe with same-origin permissions and observes accessibility events as the user interacts.

**Why this works:**
- React/Vue/Svelte apps are already compiled and running on localhost during development
- External CSS, fonts, and API calls work naturally since it's the real running app
- No build step or compilation needed from the user
- Same timeline output, same event capture, same visualization

**Technical considerations:**
- The iframe must load the URL directly (no `srcdoc`)
- Same-origin policy: the analyzer tool at `getspeakable.dev` cannot access `localhost` iframe content due to CORS
- **Solution**: Provide a lightweight local proxy script (`npx speakable-proxy`) that:
  1. Starts a local server on a random port
  2. Embeds the user's app URL in a page that includes the Speakable event collector script
  3. The collector script posts events back to the parent window via postMessage
  4. Opens the browser to the Speakable web tool with a `?proxy=localhost:XXXX` parameter
- Alternative: Ship a browser extension that injects the collector into any page (already have the extension infrastructure)
- Alternative: CLI-only mode (`speakable runtime http://localhost:3000`) which already works

**Priority:** This should follow the paste-sandbox release. Ship the sandbox first (works for demos and quick tests), then add URL mode for real-world framework testing.

**Phases:**
1. (Current) Paste HTML sandbox in web tool
2. (Next) `speakable runtime <url>` CLI command (already built)
3. (Future) Browser extension with runtime overlay that shows timeline on any page
4. (Future) Web tool URL mode with local proxy for framework components
