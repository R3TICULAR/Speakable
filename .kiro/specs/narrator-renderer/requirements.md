# Requirements Document

## Introduction

This feature adds Windows Narrator as a fourth screen reader renderer to the Speakable accessibility analysis tool. Speakable currently supports NVDA, JAWS, and VoiceOver. The Narrator renderer will produce heuristic announcement text approximating how Windows Narrator interprets HTML semantics, and will be wired into all existing integration points: the CLI orchestrator, the MCP server's `analyze_html` tool, the browser extension's analyzer bridge, and the web tool's screen reader dropdown.

## Glossary

- **Narrator_Renderer**: The TypeScript module at `src/renderer/narrator-renderer.ts` that exports a `renderNarrator` function taking an AnnouncementModel and optional colorize boolean, returning Narrator-style announcement text.
- **AnnouncementModel**: The canonical, platform-agnostic accessibility tree representation defined in `src/model/types.ts`, consisting of a root AccessibleNode with role, name, state, value, description, and children.
- **AccessibleNode**: A single node in the AnnouncementModel tree containing role, name, description, value, state, focus info, and child nodes.
- **CLI_Orchestrator**: The module at `src/cli/orchestrator.ts` responsible for routing screen reader selection to the appropriate renderer function.
- **MCP_Server**: The Model Context Protocol server at `src/mcp.ts` exposing Speakable's analysis engine as tools for AI assistants.
- **Analyzer_Bridge**: The browser extension's `extension/analyzer-bridge.js` file that implements a lightweight analysis pipeline for the popup UI.
- **Web_Tool**: The Next.js web application under `site/` providing a browser-based interface to Speakable's analysis capabilities.

## Requirements

### Requirement 1: Narrator Renderer Core Function

**User Story:** As a developer, I want a Narrator renderer function that transforms an AnnouncementModel into Narrator-style announcement text, so that I can preview how Windows Narrator would announce my HTML content.

#### Acceptance Criteria

1. THE Narrator_Renderer SHALL export a `renderNarrator` function accepting an AnnouncementModel and an optional boolean `colorize` parameter, and returning a string.
2. WHEN the `colorize` parameter is true, THE Narrator_Renderer SHALL apply ANSI color codes to role, state, name, and description segments using the shared `createColors` utility.
3. WHEN the `colorize` parameter is false or omitted, THE Narrator_Renderer SHALL return plain text without ANSI escape sequences.
4. THE Narrator_Renderer SHALL recursively traverse the AnnouncementModel tree, producing one announcement line per AccessibleNode that has renderable content.
5. WHEN a child node has the same name as its parent and is the only child, THE Narrator_Renderer SHALL collapse the redundant child and recurse into its grandchildren.

### Requirement 2: Narrator Role Announcement Patterns

**User Story:** As a developer, I want the Narrator renderer to produce role announcements matching Windows Narrator conventions, so that the simulated output accurately reflects Narrator behavior.

#### Acceptance Criteria

1. WHEN a node has role "button", THE Narrator_Renderer SHALL announce the name first followed by "button" (e.g., "Submit, button").
2. WHEN a node has role "link", THE Narrator_Renderer SHALL announce "link" before the name (e.g., "link, Home").
3. WHEN a node has role "heading" with a level state, THE Narrator_Renderer SHALL announce "Heading level N" before the name (e.g., "Heading level 2, Section Title").
4. WHEN a node has role "textbox", THE Narrator_Renderer SHALL announce "edit" as the role text.
5. WHEN a node has role "checkbox", THE Narrator_Renderer SHALL announce "check box" as the role text.
6. WHEN a node has role "radio", THE Narrator_Renderer SHALL announce "radio button" as the role text.
7. WHEN a node has role "img", THE Narrator_Renderer SHALL announce "image" as the role text.
8. WHEN a node has role "navigation", THE Narrator_Renderer SHALL announce "navigation" as the role text without appending "landmark" or "region".
9. WHEN a node has role "main", THE Narrator_Renderer SHALL announce "main" as the role text.
10. WHEN a node has role "banner", THE Narrator_Renderer SHALL announce "banner" as the role text.
11. WHEN a node has role "contentinfo", THE Narrator_Renderer SHALL announce "content info" as the role text.
12. WHEN a node has role "complementary", THE Narrator_Renderer SHALL announce "complementary" as the role text.
13. WHEN a node has role "form", THE Narrator_Renderer SHALL announce "form" as the role text.
14. WHEN a node has role "search", THE Narrator_Renderer SHALL announce "search" as the role text.
15. WHEN a node has role "region", THE Narrator_Renderer SHALL announce "region" as the role text.
16. WHEN a node has role "list", THE Narrator_Renderer SHALL announce "list" as the role text.
17. WHEN a node has role "listitem", THE Narrator_Renderer SHALL announce "list item" as the role text.
18. WHEN a node has role "combobox", THE Narrator_Renderer SHALL announce "combo box" as the role text.
19. WHEN a node has role "dialog", THE Narrator_Renderer SHALL announce "dialog" as the role text.
20. WHEN a node has role "table", THE Narrator_Renderer SHALL announce "table" with row and column counts.
21. WHEN a node has role "generic", "staticText", or "paragraph", THE Narrator_Renderer SHALL produce no role text.

### Requirement 3: Narrator State Announcement Patterns

**User Story:** As a developer, I want the Narrator renderer to produce state announcements matching Windows Narrator conventions, so that element states are reported the way Narrator users would hear them.

#### Acceptance Criteria

1. WHEN a node has `state.checked` equal to true, THE Narrator_Renderer SHALL announce "checked".
2. WHEN a node has `state.checked` equal to false, THE Narrator_Renderer SHALL announce "unchecked".
3. WHEN a node has `state.checked` equal to "mixed", THE Narrator_Renderer SHALL announce "partially selected".
4. WHEN a node has `state.disabled` equal to true, THE Narrator_Renderer SHALL announce "disabled".
5. WHEN a node has `state.expanded` equal to true, THE Narrator_Renderer SHALL announce "expanded".
6. WHEN a node has `state.expanded` equal to false, THE Narrator_Renderer SHALL announce "collapsed".
7. WHEN a node has `state.required` equal to true, THE Narrator_Renderer SHALL announce "required".
8. WHEN a node has `state.invalid` equal to true, THE Narrator_Renderer SHALL announce "invalid".
9. WHEN a node has `state.readonly` equal to true, THE Narrator_Renderer SHALL announce "read only".
10. WHEN a node has `state.busy` equal to true, THE Narrator_Renderer SHALL announce "busy".
11. WHEN a node has `state.selected` equal to true, THE Narrator_Renderer SHALL announce "selected".
12. WHEN a node has `state.selected` equal to false, THE Narrator_Renderer SHALL announce "not selected".
13. WHEN a node has `state.pressed` equal to true, THE Narrator_Renderer SHALL announce "pressed".
14. WHEN a node has `state.pressed` equal to false, THE Narrator_Renderer SHALL announce "not pressed".
15. WHEN a node has `state.pressed` equal to "mixed", THE Narrator_Renderer SHALL announce "partially pressed".
16. WHEN a node has `state.current` with a truthy value, THE Narrator_Renderer SHALL announce the current indicator (e.g., "current page", "current step").

### Requirement 4: Narrator Announcement Ordering

**User Story:** As a developer, I want the Narrator renderer to place role, name, state, value, and description in the correct order per Narrator conventions, so that the output reads naturally as Narrator would speak it.

#### Acceptance Criteria

1. WHEN a node has role "link", THE Narrator_Renderer SHALL place the role text before the name (role-first ordering).
2. WHEN a node has role "heading", THE Narrator_Renderer SHALL place the role text (including level) before the name (role-first ordering).
3. WHEN a node has role "button", THE Narrator_Renderer SHALL place the name before the role text (name-first ordering).
4. WHEN a node has a landmark role ("navigation", "main", "banner", "contentinfo", "complementary", "region", "form", "search"), THE Narrator_Renderer SHALL place the role text before the name (role-first ordering).
5. WHEN a node has a value, THE Narrator_Renderer SHALL place the value text after the role and state segments.
6. WHEN a node has a description, THE Narrator_Renderer SHALL place the description text as the last segment.

### Requirement 5: CLI Orchestrator Integration

**User Story:** As a CLI user, I want to specify "narrator" as a screen reader option, so that I can generate Narrator-style output from the command line.

#### Acceptance Criteria

1. THE CLI_Orchestrator SHALL accept "narrator" as a valid value for the `--screen-reader` option.
2. WHEN the screen reader option is set to "narrator", THE CLI_Orchestrator SHALL invoke the `renderNarrator` function and return its output.
3. WHEN the screen reader option is set to "all", THE CLI_Orchestrator SHALL include Narrator output alongside NVDA, JAWS, and VoiceOver output with a "=== Narrator ===" section header.
4. THE CLI_Orchestrator SHALL update the ScreenReader type to include "narrator" in its union.

### Requirement 6: MCP Server Integration

**User Story:** As an AI assistant user, I want the MCP server's `analyze_html` tool to support "narrator" as a screen reader option, so that AI workflows can generate Narrator predictions.

#### Acceptance Criteria

1. THE MCP_Server SHALL accept "narrator" as a valid value in the `screen_reader` parameter enum of the `analyze_html` tool.
2. WHEN `screen_reader` is "narrator", THE MCP_Server SHALL invoke the `renderNarrator` function.
3. WHEN `screen_reader` is "all", THE MCP_Server SHALL include Narrator output in the combined response with a "--- Narrator ---" section header.
4. THE MCP_Server SHALL update its tool description to reference Narrator alongside the existing screen readers.

### Requirement 7: Browser Extension Integration

**User Story:** As an extension user, I want to select "Narrator" in the browser extension popup, so that I can preview Narrator announcements for any web page.

#### Acceptance Criteria

1. THE Analyzer_Bridge SHALL implement a `narratorRole` function mapping AccessibleNode roles to Narrator-specific role text.
2. THE Analyzer_Bridge SHALL implement a `narratorStates` function mapping AccessibleNode states to Narrator-specific state text.
3. WHEN the renderer parameter is "narrator", THE Analyzer_Bridge SHALL apply Narrator-specific role-first or name-first ordering based on the node role.
4. THE Analyzer_Bridge SHALL handle "narrator" in the `renderNode` function alongside existing renderers.
5. WHEN the renderer parameter is "all", THE Analyzer_Bridge SHALL include a "=== Narrator ===" section in the combined output.

### Requirement 8: Web Tool Integration

**User Story:** As a web tool user, I want to select "Narrator" from the screen reader dropdown, so that I can see Narrator announcement predictions in the browser.

#### Acceptance Criteria

1. THE Web_Tool SHALL include "Narrator" as an option in the screen reader selection dropdown.
2. WHEN "Narrator" is selected, THE Web_Tool SHALL pass "narrator" as the screen reader parameter to the analysis function.
3. WHEN "All" is selected, THE Web_Tool SHALL display Narrator output alongside the other screen readers.

### Requirement 9: Renderer Index Export

**User Story:** As a developer consuming the Speakable library, I want `renderNarrator` exported from the renderer index, so that I can import it from the package entry point.

#### Acceptance Criteria

1. THE renderer index file (`src/renderer/index.ts`) SHALL re-export the `renderNarrator` function from `./narrator-renderer.js`.
2. WHEN a consumer imports from `@reticular/speakable`, THE package SHALL make `renderNarrator` available as a named export.

### Requirement 10: Test Coverage

**User Story:** As a maintainer, I want comprehensive tests for the Narrator renderer, so that I can verify correctness and catch regressions.

#### Acceptance Criteria

1. THE test suite SHALL include unit tests for the Narrator renderer at `tests/unit/renderer/narrator-renderer.test.ts` following the same structure as existing renderer tests.
2. THE test suite SHALL verify Narrator-specific role announcements for buttons, links, headings, checkboxes, images, landmarks, lists, textboxes, radio buttons, and comboboxes.
3. THE test suite SHALL verify Narrator-specific state announcements for checked, unchecked, mixed, disabled, expanded, collapsed, required, invalid, and readonly states.
4. THE test suite SHALL verify correct announcement ordering (role-first for links, headings, and landmarks; name-first for buttons and other controls).
5. THE test suite SHALL verify that nested structures produce correct multi-line output with proper child traversal.
6. FOR ALL valid AnnouncementModel inputs, rendering then verifying the output format SHALL produce text where each line contains comma-separated segments matching the expected Narrator patterns (round-trip format consistency property).

### Requirement 11: Documentation Updates

**User Story:** As a prospective user, I want the documentation and landing page to reflect that Speakable supports 4 screen readers, so that I know Narrator is available.

#### Acceptance Criteria

1. THE documentation SHALL update references from "3 screen readers" to "4 screen readers" across the README, API docs, and landing page copy.
2. THE documentation SHALL list "Windows Narrator" alongside NVDA, JAWS, and VoiceOver in feature descriptions.
3. THE CLI help text SHALL list "narrator" in the valid values for the `--screen-reader` option.
