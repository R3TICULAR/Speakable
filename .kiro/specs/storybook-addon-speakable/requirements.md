# Requirements Document

## Introduction

`@reticular/storybook-addon-speakable` is a portable, publishable Storybook addon that predicts screen reader output (NVDA, JAWS, VoiceOver, Narrator) for the currently rendered story. It registers a "Screen Readers" panel in the Storybook addon area, runs a browser-side DOM accessibility tree analyzer inside the story iframe, and displays predicted speech output, element statistics, and accessibility audit findings. The addon must work as a zero-configuration npm package compatible with Storybook 8.x across all supported frameworks (HTML, React, Vue, Svelte, Angular).

## Glossary

- **Addon**: A Storybook extension that adds UI panels, decorators, or toolbars to the Storybook development environment
- **Manager**: The Storybook host application that renders the sidebar, toolbar, and addon panels outside the story iframe
- **Preview**: The iframe context where stories render and decorators execute
- **Panel**: A UI tab displayed in the Storybook addon panel area below or beside the story canvas
- **Decorator**: A wrapper function that executes around each story render in the preview iframe
- **Preset**: A Storybook configuration module that declares manager and preview entry points for automatic addon registration
- **Channel**: The Storybook event bus that enables communication between the manager and preview contexts
- **Analyzer**: The browser-side module that walks the live DOM and produces predicted screen reader output without Node.js dependencies
- **Predicted_Output**: Heuristic-based text representing what a screen reader would announce for the rendered DOM
- **Story_Args**: The configurable props/arguments that Storybook passes to a story's render function
- **Framework_Adapter**: A Storybook integration layer for a specific UI framework (HTML, React, Vue, Svelte, Angular)

## Requirements

### Requirement 1: Storybook 8.x Preset Registration

**User Story:** As a developer, I want the addon to register correctly with Storybook 8.x via the standard preset pattern, so that adding a single line to my addons array is all that is needed.

#### Acceptance Criteria

1. WHEN a user adds `'@reticular/storybook-addon-speakable'` to the `addons` array in `.storybook/main.ts`, THE Preset SHALL export `managerEntries` pointing to the compiled manager bundle
2. WHEN a user adds `'@reticular/storybook-addon-speakable'` to the `addons` array in `.storybook/main.ts`, THE Preset SHALL export a `previewAnnotations` function that resolves to the compiled preview bundle path
3. WHEN Storybook resolves the addon package, THE Preset SHALL be discoverable at the package root via a `./preset` export in `package.json`
4. THE Preset SHALL require zero additional configuration beyond the addons array entry
5. WHEN Storybook starts in development mode, THE Addon SHALL load its manager and preview entries without errors
6. WHEN Storybook runs a production build (`storybook build`), THE Addon SHALL be included in the static output without errors

### Requirement 2: Panel Registration and Display

**User Story:** As a developer, I want to see a "Screen Readers" panel tab in the Storybook addon panel, so that I can view predicted screen reader output alongside my components.

#### Acceptance Criteria

1. WHEN Storybook loads, THE Manager SHALL register a panel with the title "Screen Readers" in the addon panel area
2. WHEN the panel is active but no story has rendered, THE Panel SHALL display an empty state message: "Render a story to see predicted screen reader output"
3. THE Panel SHALL display five tabs: NVDA, JAWS, VoiceOver, Narrator, and Audit
4. WHEN the user selects a tab, THE Panel SHALL display the corresponding predicted output or audit findings
5. THE Panel SHALL display a statistics bar showing total elements, interactive elements, landmarks, and headings counts

### Requirement 3: DOM Capture and Analysis

**User Story:** As a developer, I want the addon to automatically analyze my rendered story, so that I see predicted screen reader output without manual action.

#### Acceptance Criteria

1. WHEN a story renders in the preview iframe, THE Decorator SHALL capture the root DOM element after the render completes
2. THE Decorator SHALL locate the story root by checking for `storybook-root`, then `root` element IDs, then falling back to `document.body`
3. WHEN the root DOM element is captured, THE Analyzer SHALL walk the accessibility tree and produce predicted output for NVDA, JAWS, VoiceOver, and Narrator
4. THE Analyzer SHALL compute the accessible name for elements using the following priority: `aria-labelledby`, `aria-label`, associated `<label>`, `alt` attribute, then visible text content
5. THE Analyzer SHALL detect implicit ARIA roles from HTML element semantics
6. THE Analyzer SHALL detect explicit ARIA roles from `role` attributes
7. THE Analyzer SHALL extract ARIA states including expanded, collapsed, selected, checked, disabled, required, invalid, readonly, and haspopup

### Requirement 4: Channel Communication

**User Story:** As a developer, I want the analysis results to appear in the panel, so that the iframe analysis is visible in the manager UI.

#### Acceptance Criteria

1. WHEN the Analyzer completes, THE Decorator SHALL emit an event with the analysis result on the Storybook Channel
2. WHEN the Manager receives an analysis result event, THE Panel SHALL update its display with the new data
3. THE Channel communication SHALL use a namespaced event identifier to avoid collisions with other addons

### Requirement 5: Live Updates on Args Change

**User Story:** As a developer, I want the predicted output to update when I change story controls, so that I can see how prop changes affect screen reader behavior.

#### Acceptance Criteria

1. WHEN the user modifies Story_Args via Storybook controls, THE Decorator SHALL re-analyze the DOM after the story re-renders
2. WHEN re-analysis completes, THE Panel SHALL display updated predicted output without requiring a page refresh

### Requirement 6: Accessibility Audit

**User Story:** As a developer, I want to see accessibility issues in my component, so that I can fix problems before shipping.

#### Acceptance Criteria

1. WHEN the Analyzer runs, THE Audit SHALL flag interactive elements that have no accessible name as errors
2. WHEN the Analyzer runs, THE Audit SHALL flag heading level skips (e.g., h1 to h3 with no h2) as warnings
3. WHEN no audit findings exist, THE Audit_Tab SHALL display a success message indicating all checks passed
4. WHEN audit findings exist, THE Audit_Tab SHALL display each finding with its severity level, message, and CSS selector

### Requirement 7: Screen Reader Output Formatting

**User Story:** As a developer, I want the predicted output to reflect how each screen reader announces content, so that I can understand cross-reader differences.

#### Acceptance Criteria

1. THE NVDA_Renderer SHALL format announcements as: name, role label, states (with "unavailable" for disabled)
2. THE VoiceOver_Renderer SHALL format announcements using VoiceOver-specific vocabulary (e.g., "dimmed" for disabled, "text field" for textbox, "pop-up button" for combobox)
3. THE JAWS_Renderer SHALL format announcements with role labels matching JAWS conventions
4. THE Narrator_Renderer SHALL append interaction hints (e.g., "to activate press Enter" for buttons, "to edit press Enter" for textboxes)
5. FOR ALL renderers, THE output lines SHALL be displayed in DOM order with line numbers and monospace font

### Requirement 8: Package Portability

**User Story:** As a developer in any Storybook project, I want to install this addon from npm and have it work immediately, so that I do not need project-specific configuration.

#### Acceptance Criteria

1. THE Package SHALL be installable via `npm install @reticular/storybook-addon-speakable`
2. THE Package SHALL declare `storybook ^8.0.0` as a peer dependency
3. THE Package SHALL NOT depend on `@reticular/speakable`, jsdom, or any Node.js runtime modules
4. THE Package SHALL export ESM bundles for the manager, preview, and preset entry points
5. WHEN installed in a Storybook project using any Framework_Adapter (HTML, React, Vue, Svelte, Angular), THE Addon SHALL function correctly without framework-specific configuration
6. THE Package SHALL include `dist` contents and README in published files

### Requirement 9: Build Configuration

**User Story:** As a maintainer, I want the addon to build reliably with proper externals, so that it does not bundle Storybook or React internals.

#### Acceptance Criteria

1. THE Build SHALL produce ESM bundles for three entry points: `index`, `manager`, `preview`, and `preset`
2. THE Build SHALL externalize `react`, `react-dom`, `storybook`, and `@storybook/manager-api` to avoid duplication with the host Storybook
3. THE Build SHALL complete without TypeScript errors
4. WHEN the build completes, THE `dist/` directory SHALL contain the compiled bundles matching the `exports` map in `package.json`

### Requirement 10: Performance

**User Story:** As a developer, I want the addon to not slow down my workflow, so that Storybook remains responsive.

#### Acceptance Criteria

1. THE Addon SHALL NOT delay Storybook startup by more than 50ms
2. WHEN a story renders, THE Analyzer SHALL complete DOM analysis within 100ms for documents with up to 500 elements
3. THE Decorator SHALL defer analysis using requestAnimationFrame to avoid blocking the story render cycle
4. THE Analyzer SHALL operate entirely in the browser without making network requests or spawning workers

### Requirement 11: Design Language

**User Story:** As a user, I want the panel to look consistent with the Speakable brand, so that the addon feels like part of the product family.

#### Acceptance Criteria

1. THE Panel SHALL use slate gray (#1e293b, #64748b, #94a3b8) for text and borders
2. THE Panel SHALL use blue-600 (#3b82f6) as the primary accent color
3. THE Panel SHALL render predicted output lines in a monospace font
4. THE Footer SHALL contain the text: "Predictions are heuristic-based. Verify with real screen readers before release."
5. THE Footer SHALL include a link to getspeakable.dev

### Requirement 12: Local Development Registration

**User Story:** As a contributor working on the addon within the monorepo, I want Storybook to load the local addon source, so that I can iterate without publishing.

#### Acceptance Criteria

1. WHEN the addon is referenced by relative path in `.storybook/main.ts` (e.g., `'../addon-speakable/dist/preset.js'`), THE Addon SHALL load correctly in development mode
2. WHEN the addon source changes and is rebuilt, THE Addon SHALL reflect changes after a Storybook restart

