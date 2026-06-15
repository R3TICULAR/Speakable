# Implementation Plan: Runtime Accessibility Timeline

## Overview

Extend Speakable from static HTML analysis to runtime accessibility behavior observation. The implementation follows four phases, each producing independent value: the core engine (Phase 1), website demos (Phase 2), Storybook integration (Phase 3), and CI regression detection (Phase 4).

## Tasks

- [x] 1. Phase 1: Runtime Accessibility Engine
  - [x] 1.1 Create `src/runtime/types.ts` with event type system
    - Define EventType union, EventTarget interface, AccessibilityEvent interface
    - Define all payload types as discriminated union (FocusChangedPayload, AnnouncementPayload, RoleChangedPayload, AccessibleNameChangedPayload, StateChangedPayload, DialogOpenedPayload, DialogClosedPayload, KeyboardActionPayload, WarningPayload)
    - Define AccessibilityTimeline, TimelineMetadata, and InteractionSequence interfaces
    - _Requirements: 2.1, 14.1, 14.2_

  - [x] 1.2 Create `src/runtime/selector.ts` with stable CSS selector generation
    - Implement `generateSelector(element: Element): string` that produces a unique, stable CSS path
    - Handle elements with IDs (use ID directly), elements with unique tag+class combos, and nth-child fallback
    - Ensure selector uniqueness within the document scope
    - _Requirements: 2.2_

  - [ ]* 1.3 Write property test for CSS selector uniqueness (Property 8)
    - Generate arbitrary DOM trees with various element structures
    - Assert that `generateSelector` for any element returns a selector that resolves to exactly that element
    - _Requirements: 2.2_

  - [x] 1.4 Create `src/runtime/serialization.ts` with deterministic serializers
    - Implement `serializeEvent(event: AccessibilityEvent): string` with sorted keys, 2-space indent
    - Implement `deserializeEvent(json: string): AccessibilityEvent` with validation
    - Implement `serializeTimeline(timeline: AccessibilityTimeline): string` with sorted keys
    - Implement `deserializeTimeline(json: string): AccessibilityTimeline` with validation
    - Implement `serializeInteractionSequence` and `deserializeInteractionSequence`
    - _Requirements: 2.3, 2.4, 2.5, 3.6, 3.7, 6.7, 14.6, 14.7_

  - [ ]* 1.5 Write property tests for serialization round-trips (Properties 1-4, 6)
    - Property 1: Event serialize/deserialize round-trip produces equivalent object
    - Property 2: Timeline serialize/deserialize/re-serialize produces byte-identical output
    - Property 3: Event serializer called twice produces byte-identical output
    - Property 4: Timeline serializer called twice produces byte-identical output
    - Property 6: InteractionSequence serialize/deserialize round-trip
    - _Requirements: 2.3, 2.4, 2.5, 3.6, 3.7, 6.7, 14.6, 14.7_

  - [x] 1.6 Create `src/runtime/observers/focus-observer.ts`
    - Implement FocusObserver that listens to focus/blur events on the document
    - Emit FOCUS_CHANGED events with target role, accessible name, and previous target
    - Use `generateSelector` for stable element identification
    - Compute accessible name using existing `computeAccessibleName` from extractor
    - _Requirements: 1.1_

  - [x] 1.7 Create `src/runtime/observers/mutation-observer.ts`
    - Implement MutationObserver wrapper that detects: role attribute changes, aria-label/aria-labelledby changes, aria-expanded/aria-selected/aria-checked/aria-disabled/aria-hidden changes
    - Emit ROLE_CHANGED, ACCESSIBLE_NAME_CHANGED, and STATE_CHANGED events with previous and new values
    - Filter out irrelevant mutations (text content changes in non-live regions, style changes)
    - _Requirements: 1.3, 1.4, 1.5_

  - [x] 1.8 Create `src/runtime/observers/live-region-observer.ts`
    - Implement observer that detects text content changes within elements marked with aria-live or role="alert"/role="status"/role="log"
    - Emit ANNOUNCEMENT events with politeness level (polite/assertive) and announced text
    - Handle aria-atomic (read entire region vs changed nodes only)
    - _Requirements: 1.2_

  - [x] 1.9 Create `src/runtime/observers/dialog-observer.ts`
    - Implement observer that detects dialog open/close events (native dialog element open attribute, showModal, role="dialog" with aria-modal becoming visible)
    - Emit DIALOG_OPENED and DIALOG_CLOSED events with dialog accessible name and modal status
    - Track open dialog stack for heuristic warnings
    - _Requirements: 1.6, 1.7_

  - [x] 1.10 Create `src/runtime/engine.ts` (RuntimeAccessibilityEngine)
    - Implement `createEngine(options)` that instantiates and coordinates all observers
    - Implement `attach()`: start all observers, begin timestamp clock
    - Implement `detach()`: stop all observers, finalize event collection
    - Implement `getEvents()`: return collected events in chronological order
    - Implement `reset()`: clear events without detaching
    - Assign monotonically increasing timestamps relative to session start
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [ ]* 1.11 Write property test for monotonically increasing timestamps (Property 5)
    - Generate sequences of DOM mutations and verify all emitted events have non-decreasing timestamps
    - _Requirements: 1.9_

  - [x] 1.12 Create `src/runtime/interactions.ts` with interaction execution
    - Implement action executors: click(selector), tab, shiftTab, escape, enter, space, arrowUp/Down/Left/Right, key(combo), wait(ms)
    - For keyboard actions, dispatch proper KeyboardEvent sequences (keydown, keypress, keyup)
    - For tab/shiftTab, compute next/previous focusable element and move focus
    - Emit KEYBOARD_ACTION events for each action
    - Handle missing elements (emit WARNING, continue)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 1.8_

  - [x] 1.13 Create `src/runtime/patterns.ts` with built-in interaction patterns
    - Implement modal-dialog pattern: click trigger, verify focus in dialog, tab through, escape, verify focus return
    - Implement combobox pattern: focus input, type, arrow through options, enter to select
    - Implement tabs pattern: focus tablist, arrow between tabs, enter/space to activate
    - Implement accordion pattern: focus header, enter/space to toggle, navigate between headers
    - Accept optional PatternSelectorMap to override default selectors
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 1.14 Create `src/runtime/heuristics.ts` with heuristic warning analyzer
    - Detect: focus not moved into modal dialog within 100ms of DIALOG_OPENED
    - Detect: focus escaped modal dialog (FOCUS_CHANGED to element outside open dialog)
    - Detect: rapid announcements (>3 ANNOUNCEMENT events within 500ms)
    - Detect: keyboard action with no accessibility response within 200ms
    - Detect: focused element removed from DOM without explicit focus management
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 1.15 Create `src/runtime/timeline-generator.ts` (TimelineGenerator)
    - Implement `createTimelineGenerator(options)` that coordinates engine + interaction execution
    - Implement `capture(sequence)`: attach engine, execute actions with DOM stability waits (100ms between actions), settle period (500ms default), produce AccessibilityTimeline
    - Implement `abort()`: cancel in-progress capture
    - Include session metadata (component, story, duration, speakable version)
    - Handle document load timeout (10s)
    - Integrate heuristic analyzer to emit WARNING events during capture
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 1.16 Create `src/runtime/index.ts` and update `src/index.ts` exports
    - Export all public APIs: createEngine, createTimelineGenerator, getBuiltinPattern, serializeTimeline, deserializeTimeline, types
    - Update main src/index.ts to re-export runtime module
    - _Requirements: all Phase 1_

  - [x] 1.17 Write unit tests for all Phase 1 modules
    - Test each observer with jsdom documents
    - Test interaction execution (click, tab, keyboard events)
    - Test each heuristic warning trigger condition
    - Test timeline generator end-to-end with a multi-step interaction
    - Test serialization with edge cases (empty timelines, missing names, special characters)
    - _Requirements: all Phase 1_

  - [x] 1.18 Update tsup.config.ts to include runtime module in build
    - Add src/runtime/index.ts as an entry point (or ensure it's bundled with main entry)
    - Verify build produces correct exports
    - _Requirements: all Phase 1_

- [x] 2. Phase 2: Website Demo Components
  - [x] 2.1 Create demo page at `site/app/docs/runtime-analysis/page.tsx`
    - Add page to docs sidebar navigation
    - Add to sitemap
    - Header with explanation of runtime accessibility analysis
    - _Requirements: Phase 2 scope_

  - [x] 2.2 Create interactive demo components with timeline visualization
    - Modal demo: working version (proper focus trap) vs broken version (focus escapes)
    - Combobox demo: working version (announcements on selection) vs broken (missing announcements)
    - Show real-time Accessibility Timeline as events occur
    - Show regression diff between working and broken versions
    - _Requirements: Phase 2 scope_

  - [x] 2.3 Create TimelineVisualizer component
    - Display events in chronological order with type icons, timestamps, and descriptions
    - Filter by event category (focus, announcements, warnings, regressions)
    - Highlight critical/high severity items in red/amber
    - _Requirements: Phase 2 scope_

- [ ] 3. Phase 3: Storybook Adapter
  - [x] 3.1 Create `src/storybook/adapter.ts` with connection and discovery
    - Connect to Storybook URL, fetch stories index
    - Parse Storybook 7.x and 8.x index formats
    - Filter stories by component glob pattern
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 3.2 Create `src/storybook/loader.ts` for story iframe loading
    - Load individual stories in isolated iframes
    - Signal readiness when story renders
    - Handle load timeout (10s)
    - Detect play function availability
    - Support custom viewport dimensions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [-] 3.3 Integrate Storybook Adapter with Timeline Generator
    - Wire story loading into timeline capture pipeline
    - Support batch processing of discovered stories
    - _Requirements: 4, 5_

- [ ] 4. Phase 4: CI Regression Integration
  - [x] 4.1 Create `src/runtime/diff-engine.ts` with behavior diffing
    - Match events between timelines by type + target selector
    - Classify differences as added, removed, or modified
    - Ignore timestamp-only differences
    - Produce BehaviorDiffReport with summary counts
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 4.2 Write property tests for diff engine (Properties 7, 10)
    - Property 7: Diff report summary counts match array lengths
    - Property 10: Timelines differing only in timestamps produce no structural diffs
    - _Requirements: 8.6, 8.7, 9.7_

  - [-] 4.3 Create severity classification module
    - Classify regressions by severity: critical, high, medium, low
    - Apply rules from Requirement 9 (focus loss = critical, focus not restored = high, etc.)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [-] 4.4 Create baseline storage module
    - Save timelines as baseline files at `<dir>/<component>/<story>.timeline.json`
    - Load existing baselines for comparison
    - Support `--update-runtime-snapshot` to overwrite baselines
    - Include metadata (creation timestamp, speakable version, storybook URL, interaction sequence)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [-] 4.5 Add `speakable runtime` CLI command
    - Parse runtime-specific flags: --storybook, --story, --interaction, --interaction-file, --format, --runtime-snapshot, --update-runtime-snapshot, --runtime-ci, --runtime-fail-on
    - Wire into existing CLI orchestrator pattern
    - Output timeline JSON or human-readable summary to stdout
    - Progress messages to stderr in CI mode
    - Exit codes: 0 (pass), 1 (regression), 2 (content error), 3 (system error)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [x] 4.6 Update MCP server with runtime analysis tools
    - Add `analyze_runtime` tool that accepts HTML + interaction sequence and returns timeline
    - Add `diff_runtime` tool that accepts two timelines and returns diff report
    - _Requirements: Phase 4 scope_

- [ ] 5. Final: Verification
  - [~] 5.1 Verify all tests pass and build succeeds
    - Run full test suite
    - Verify tsup build includes runtime module
    - Verify exports are accessible from package consumers
    - _Requirements: all_

## Notes

- Phase 1 is the primary implementation focus. It should work standalone against any jsdom document without Storybook.
- Tasks marked with * are optional property-based tests. They validate correctness properties but are not blocking for MVP.
- The Runtime Accessibility Engine uses jsdom in Phase 1. Real browser support (via Playwright or Puppeteer) is a future enhancement for Phases 3-4.
- Built-in interaction patterns (1.13) can be expanded over time as users request new widget types.
- The heuristic warnings module (1.14) operates independently of baselines, providing value from the first run.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.4"] },
    { "id": 2, "tasks": ["1.3", "1.5", "1.6", "1.7", "1.8", "1.9"] },
    { "id": 3, "tasks": ["1.10", "1.12"] },
    { "id": 4, "tasks": ["1.11", "1.13", "1.14"] },
    { "id": 5, "tasks": ["1.15"] },
    { "id": 6, "tasks": ["1.16", "1.17", "1.18"] },
    { "id": 7, "tasks": ["2.1", "2.3"] },
    { "id": 8, "tasks": ["2.2"] },
    { "id": 9, "tasks": ["3.1"] },
    { "id": 10, "tasks": ["3.2"] },
    { "id": 11, "tasks": ["3.3"] },
    { "id": 12, "tasks": ["4.1"] },
    { "id": 13, "tasks": ["4.2", "4.3"] },
    { "id": 14, "tasks": ["4.4", "4.5"] },
    { "id": 15, "tasks": ["4.6"] },
    { "id": 16, "tasks": ["5.1"] }
  ]
}
```
