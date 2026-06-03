# Implementation Plan: Narrator Renderer

## Overview

Add Windows Narrator as a fourth screen reader renderer to Speakable. Implementation follows a bottom-up approach: core renderer first, then integration into all consumption points (CLI, MCP, extension, web tool), followed by tests and documentation updates.

## Tasks

- [x] 1. Implement core Narrator renderer
  - [x] 1.1 Create `src/renderer/narrator-renderer.ts` with `renderNarrator` function
    - Implement the main `renderNarrator(model: AnnouncementModel, colorize?: boolean): string` export
    - Implement `renderNodeNarrator` for recursive tree traversal with same-name child collapsing
    - Implement `formatNodeNarrator` for single-node announcement assembly
    - Implement `shouldAnnounceRoleFirst` returning true for link, heading, landmarks, blockquote, figure, dialog, group, document
    - Implement `formatRoleNarrator` with full role mapping (button→"button", link→"link", heading→"Heading level N", textbox→"edit", checkbox→"check box", radio→"radio button", navigation→"navigation", contentinfo→"content info", img→"image", etc.)
    - Implement `formatStatesNarrator` with full state mapping (checked→"checked"/"unchecked", mixed→"partially selected", disabled→"disabled", expanded/collapsed, required, invalid, readonly→"read only", pressed/not pressed/partially pressed, selected/not selected, busy, current)
    - Follow the same architectural pattern as `voiceover-renderer.ts` and `nvda-renderer.ts`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1–2.21, 3.1–3.16, 4.1–4.6_

  - [x] 1.2 Export `renderNarrator` from `src/renderer/index.ts`
    - Add `export * from './narrator-renderer.js';` to the renderer barrel file
    - _Requirements: 9.1, 9.2_

- [x] 2. Integrate into CLI orchestrator
  - [x] 2.1 Update `src/cli/options.ts` ScreenReader type and validation
    - Add `'narrator'` to the `ScreenReader` type union
    - Add `'narrator'` to the `validReaders` array in `validateOptions`
    - _Requirements: 5.1, 5.4_

  - [x] 2.2 Update `src/cli/orchestrator.ts` to handle "narrator" screen reader
    - Import `renderNarrator` from `'../renderer/narrator-renderer.js'`
    - Add `case 'narrator': return renderNarrator(model, colorize);` to `formatScreenReaderOutput` switch
    - In the `'all'` branch, add Narrator output with `c.sectionHeader('=== Narrator ===')` header after VoiceOver
    - _Requirements: 5.2, 5.3_

- [x] 3. Integrate into MCP server
  - [x] 3.1 Update `src/mcp.ts` to support "narrator" screen reader
    - Import `renderNarrator` from `'./renderer/narrator-renderer.js'`
    - Update `ScreenReader` type to `'nvda' | 'jaws' | 'voiceover' | 'narrator' | 'all'`
    - Update `z.enum()` to include `'narrator'`
    - Add `case 'narrator': return renderNarrator(model);` in the `renderOutput` switch
    - In the `'all'` branch, add `'--- Narrator ---'` section with `renderNarrator(model)` output
    - Update tool description to mention Narrator alongside existing screen readers
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Checkpoint - Ensure core renderer and server integrations compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integrate into browser extension
  - [x] 5.1 Update `extension/analyzer-bridge.js` to support Narrator renderer
    - Add `narratorRole(n)` function mapping roles to Narrator text (button→"button", link→"link", heading→"Heading level N", textbox→"edit", checkbox→"check box", radio→"radio button", navigation→"navigation", contentinfo→"content info", img→"image", list→"list", listitem→"list item", combobox→"combo box", dialog→"dialog", separator→"separator")
    - Add `narratorStates(s)` function mapping states to Narrator text (checked/unchecked/"partially selected", expanded/collapsed, disabled, invalid, required, busy, current, pressed/"not pressed"/"partially pressed", selected/"not selected")
    - Add `else if (renderer === 'narrator')` branch in `renderNode` with role-first ordering for links, headings, landmarks and name-first ordering for buttons and other controls
    - In the `'all'` branch of `SpeakableAnalyzer.analyze`, add `=== Narrator ===` section after VoiceOver
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. Integrate into web tool
  - [x] 6.1 Add "Narrator" to web tool screen reader dropdown
    - Locate the screen reader selection component in the site/ directory
    - Add "Narrator" as a dropdown option with value "narrator"
    - Ensure "All" mode includes Narrator output
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 7. Checkpoint - Ensure all integrations compile and existing tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Write unit tests
  - [ ]* 8.1 Write unit tests for Narrator renderer at `tests/unit/renderer/narrator-renderer.test.ts`
    - Follow the same structure as `tests/unit/renderer/nvda-renderer.test.ts`
    - Test button announcements (name-first: "Submit, button", states: expanded, collapsed, pressed, disabled)
    - Test link announcements (role-first: "link, Home", current page state)
    - Test heading announcements ("Heading level 2, Section Title")
    - Test checkbox announcements ("Accept, check box, checked"/"unchecked"/"partially selected")
    - Test textbox announcements ("Email, edit, required"/"invalid"/"read only")
    - Test radio button announcements ("Option A, radio button, checked")
    - Test image announcements ("Company Logo, image")
    - Test landmark announcements (navigation, main, banner, contentinfo without "landmark"/"region" suffix)
    - Test list/listitem announcements
    - Test combobox announcements
    - Test nested structures (nav with links, article with heading and button)
    - Test redundant single-child collapsing
    - Test colorize on/off (ANSI presence/absence)
    - Test multiple states on one element
    - Test description handling
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 8.2 Write property test for colorize toggle (Property 1)
    - **Property 1: Colorize toggle determines ANSI presence**
    - Generate random AnnouncementModels, render with colorize=true and colorize=false
    - Assert output with colorize=true contains ANSI escape sequences
    - Assert output with colorize=false contains no ANSI escape sequences
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 8.3 Write property test for role text mapping (Property 2)
    - **Property 2: Role text mapping correctness**
    - Generate random AccessibleNodes with known roles
    - Render and verify role text segment matches the defined narratorRole mapping
    - **Validates: Requirements 2.1–2.21**

  - [ ]* 8.4 Write property test for state text mapping (Property 3)
    - **Property 3: State text mapping correctness**
    - Generate random AccessibleNodes with various state combinations
    - Render and verify state text matches the defined narratorStates mapping
    - **Validates: Requirements 3.1–3.16**

  - [ ]* 8.5 Write property test for announcement ordering (Property 4)
    - **Property 4: Announcement ordering follows role-based rules**
    - Generate random nodes with names and roles
    - Verify role-first ordering for links, headings, landmarks
    - Verify name-first ordering for buttons, controls, everything else
    - **Validates: Requirements 4.1–4.4**

  - [ ]* 8.6 Write property test for redundant child collapsing (Property 5)
    - **Property 5: Redundant single-child collapsing**
    - Generate trees with single-child same-name patterns
    - Verify no duplicate consecutive announcements for parent and child
    - **Validates: Requirements 1.5**

  - [ ]* 8.7 Write property test for output format consistency (Property 6)
    - **Property 6: Output format consistency**
    - Generate random valid AnnouncementModels
    - Render and verify each non-empty line is comma-separated segments matching expected Narrator patterns
    - **Validates: Requirements 10.6**

- [x] 9. Update documentation
  - [x] 9.1 Update README.md and landing page references
    - Change "3 screen readers" to "4 screen readers" in README.md
    - Add "Windows Narrator" to feature descriptions alongside NVDA, JAWS, VoiceOver
    - Update landing page copy in site/ (e.g., "3 Readers" → "4 Readers")
    - _Requirements: 11.1, 11.2_

  - [x] 9.2 Update CLI help text
    - Update the `--screen-reader` option description to list "narrator" in valid values
    - _Requirements: 11.3_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The Narrator renderer follows the exact same pure-function pattern as the existing NVDA, JAWS, and VoiceOver renderers
- TypeScript is the implementation language (matching the existing codebase)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["5.1", "6.1"] },
    { "id": 4, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6", "8.7"] },
    { "id": 5, "tasks": ["9.1", "9.2"] }
  ]
}
```
