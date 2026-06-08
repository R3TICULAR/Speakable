# Implementation Plan: SEO Documentation Expansion

## Overview

Expand Speakable docs from 10 to 21 pages, fix internal linking, restructure navigation, and establish topical authority for screen reader testing keywords. Implementation follows four waves: infrastructure first, then Tier 1 (high-impact quick wins), Tier 2 (medium effort), and Tier 3 (authority builders).

## Tasks

- [x] 1. Infrastructure — Shared Components & Navigation Restructure
  - [x] 1.1 Create `site/components/RelatedPages.tsx` shared component
    - Accept array of `{ href, title, description }` props
    - Render as a grid of linked cards at page bottom
    - Use existing design system (slate borders, blue hover, rounded-xl)
    - _Requirements: 1.4, 14.4_

  - [x] 1.2 Create `site/components/SeeAlso.tsx` inline callout component
    - Accept `href`, `title`, and optional `description` props
    - Render as a highlighted box with arrow icon, suitable for mid-content placement
    - _Requirements: 1.3, 14.4_

  - [x] 1.3 Restructure `site/app/docs/layout.tsx` sidebar into grouped navigation
    - Replace flat `DOCS_SECTIONS` array with grouped structure (Getting Started, Guides, Reference, Integration)
    - Add collapsible group headers with category labels
    - Include all 11 new page entries in appropriate groups
    - Update mobile docs menu to match grouped structure
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 1.4 Update `site/app/sitemap.ts` with all new page URLs
    - Add 11 new pages to sitemap generation
    - Include locale alternates for each new page
    - _Requirements: 15.4_

- [x] 2. Tier 1 — High Impact Pages
  - [x] 2.1 Create `/docs/aria-roles` — ARIA Roles Quick Reference
    - Client component with search/filter input
    - Group roles by category: landmark, widget, document structure, live region, window
    - Each role shows: name, implicit HTML, required states, Speakable output example per reader
    - Include cross-links to Common Mistakes for commonly misused roles
    - Add "How Speakable handles this" notes showing NVDA/JAWS/VoiceOver/Narrator diffs
    - Add RelatedPages footer linking to API Reference, Component Patterns, Glossary
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 14.1, 14.4, 15.1, 15.2, 15.3_

  - [x] 2.2 Create `/docs/testing-checklist` — Screen Reader Testing Checklist
    - Structured checklist organized by category: navigation, forms, dynamic content, media, tables, custom widgets
    - Each item shows: what to test, expected behavior, CLI command to verify
    - Include copy-paste `speakable` commands for each check
    - Cross-link to Common Mistakes and Examples for each category
    - Add RelatedPages footer linking to Testing Strategy, CI/CD Integration, Testing Ecosystem
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 14.2, 14.3, 15.1, 15.2, 15.3_

  - [x] 2.3 Create `/docs/how-screen-readers-work` — Educational Entry Point
    - Explain the accessibility tree concept with text-based diagrams
    - Cover DOM → accessibility tree → screen reader → speech pipeline
    - Explain browse mode vs focus mode
    - Show how Speakable's pipeline mirrors this (parse → extract → model → render)
    - Link to Usage Guide, Advanced Guide, API Reference, and Glossary
    - Add RelatedPages footer linking to ARIA Roles, Testing Checklist, Screen Reader Comparison
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 14.1, 14.2, 15.1, 15.2, 15.3_

- [x] 3. Tier 2 — Guides
  - [x] 3.1 Create `/docs/component-patterns` — Accessible Component Patterns
    - Hub page with sections for: modal/dialog, dropdown menu, tabs, accordion, tooltip, combobox
    - Each pattern shows: correct HTML, screen reader output (all 4 readers), keyboard interaction
    - Include common mistakes for each pattern
    - Add "Test with Speakable" section with CLI/API commands per pattern
    - Cross-link to ARIA Roles for roles used in each pattern
    - Add RelatedPages footer linking to ARIA Roles, Common Mistakes, Keyboard Navigation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 14.1, 14.3, 14.4, 15.1, 15.2, 15.3_

  - [x] 3.2 Create `/docs/live-regions` — Live Regions & Dynamic Content
    - Explain aria-live, aria-atomic, aria-relevant with real examples
    - Cover polite vs assertive vs off
    - Patterns: status messages, form validation, loading indicators, chat, toast notifications
    - Show cross-reader differences in live region handling
    - Note Speakable's limitations with dynamic content (static HTML analysis)
    - Add RelatedPages footer linking to Accessible Forms, Component Patterns, How SR Work
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 14.1, 14.2, 15.1, 15.2, 15.3_

  - [x] 3.3 Create `/docs/focus-management` — Focus Management Guide
    - Cover: focus traps (modals), focus restoration, skip links, roving tabindex, focus indicators
    - SPA patterns: route change focus, dynamic content insertion
    - Show how to test focus order with Speakable's tab-order/interactive elements report
    - Cross-link to Testing Checklist, Common Mistakes, Keyboard Navigation
    - Add RelatedPages footer linking to Component Patterns, Keyboard Navigation, Testing Checklist
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 14.3, 14.4, 15.1, 15.2, 15.3_

  - [x] 3.4 Create `/docs/testing-strategy` — Accessibility Testing Strategy
    - Target team leads and decision makers
    - Cover: shift-left testing, automation vs manual, frequency, metrics to track
    - Position Speakable alongside axe-core, manual testing, user testing
    - Include team maturity model (level 1: basic linting → level 5: full a11y program)
    - Link to CI/CD, Testing Ecosystem, and Frameworks pages
    - Add RelatedPages footer linking to Testing Checklist, CI/CD Integration, Testing Ecosystem
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 14.1, 14.2, 15.1, 15.2, 15.3_

- [x] 4. Tier 3 — Reference & Authority Pages
  - [x] 4.1 Create `/docs/glossary` — Accessibility Glossary
    - Alphabetically sorted with 30+ terms
    - Cover: ARIA, accessibility tree, announce, browse mode, focus mode, landmark, live region, name computation, role, state, widget, screen reader, assistive technology, etc.
    - Each term links to the most relevant docs page
    - Jump-to-letter navigation anchors
    - Add RelatedPages footer linking to How SR Work, ARIA Roles, API Reference
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 14.4, 15.1, 15.2_

  - [x] 4.2 Create `/docs/screen-reader-comparison` — Screen Reader Comparison Guide
    - Compare NVDA, JAWS, VoiceOver, Narrator: market share, platform, verbosity, unique behaviors
    - Comparison table showing announcement patterns for links, headings, landmarks, forms
    - Reference Speakable's renderer approach
    - Link to Advanced Guide cross-reader section
    - Note: approximate — actual behavior varies by version and settings
    - Add RelatedPages footer linking to Advanced Guide, How SR Work, ARIA Roles
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 14.1, 14.2, 15.1, 15.2, 15.3_

  - [x] 4.3 Create `/docs/keyboard-navigation` — Keyboard Navigation Patterns
    - Cover: tab order, arrow key patterns, shortcut keys, focus indicators, skip navigation
    - Keyboard shortcuts reference for each screen reader
    - Show how to audit keyboard accessibility with Speakable's interactive elements report
    - Cross-link to Focus Management and Testing Checklist
    - Add RelatedPages footer linking to Focus Management, Component Patterns, Testing Checklist
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 14.3, 14.4, 15.1, 15.2, 15.3_

  - [x] 4.4 Create `/docs/accessible-forms` — Form Accessibility Deep Dive
    - Cover: labels, descriptions, required fields, validation errors, fieldsets, autocomplete
    - Show screen reader output for correct vs incorrect patterns (all 4 readers)
    - Include dynamic validation (live regions cross-reference)
    - Cross-link to Live Regions, Component Patterns, Common Mistakes
    - Add RelatedPages footer linking to Live Regions, Common Mistakes, Testing Checklist
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 14.3, 14.4, 15.1, 15.2, 15.3_

- [x] 5. Internal Cross-Linking — Existing Pages
  - [x] 5.1 Add cross-links and RelatedPages to API Reference (`/docs`)
    - Add inline links to Usage Guide, Examples, Advanced Guide within existing content
    - Add RelatedPages footer with: Usage Guide, Examples, How SR Work, ARIA Roles
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.2 Add cross-links and RelatedPages to Usage Guide
    - Add inline links to Advanced Guide, API Reference, Testing Checklist
    - Add RelatedPages footer with: Advanced Guide, Testing Checklist, Frameworks, CI/CD
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.3 Add cross-links and RelatedPages to Advanced Guide
    - Add inline links to Common Mistakes, Screen Reader Comparison, How SR Work
    - Add RelatedPages footer with: Common Mistakes, Screen Reader Comparison, Component Patterns, Glossary
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.4 Add cross-links and RelatedPages to Examples
    - Add inline links to API Reference, Common Mistakes, ARIA Roles
    - Add RelatedPages footer with: API Reference, Common Mistakes, Component Patterns, Usage Guide
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.5 Add cross-links and RelatedPages to Common Mistakes
    - Add inline links to Examples, ARIA Roles, Accessible Forms, Component Patterns
    - Add RelatedPages footer with: Examples, ARIA Roles, Testing Checklist, Accessible Forms
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.6 Add cross-links and RelatedPages to Frameworks
    - Add inline links to CI/CD Integration, Testing Ecosystem, Testing Strategy
    - Add RelatedPages footer with: CI/CD Integration, Testing Ecosystem, Testing Strategy, Component Patterns
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.7 Add cross-links and RelatedPages to Testing Ecosystem
    - Add inline links to CI/CD, Testing Strategy, Testing Checklist
    - Add RelatedPages footer with: CI/CD Integration, Testing Strategy, Testing Checklist, Frameworks
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.8 Add cross-links and RelatedPages to CI/CD Integration
    - Add inline links to Frameworks, Testing Ecosystem, Testing Strategy
    - Add RelatedPages footer with: Frameworks, Testing Ecosystem, Testing Strategy, Usage Guide
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.9 Add cross-links and RelatedPages to Spec Integration
    - Add inline links to CI/CD, MCP Integration, Testing Strategy
    - Add RelatedPages footer with: CI/CD Integration, MCP Integration, Testing Strategy, Usage Guide
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.10 Add cross-links and RelatedPages to MCP Integration
    - Add inline links to Usage Guide, API Reference, Spec Integration
    - Add RelatedPages footer with: Usage Guide, API Reference, Spec Integration, CI/CD Integration
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. Final — Verification & Cleanup
  - [x] 6.1 Verify all pages build without errors
    - Run `npx next build` in site directory
    - Fix any TypeScript or rendering errors
    - Verify all internal links resolve (no 404s)
    - _Requirements: 14.4, 15.2_

  - [x] 6.2 Verify internal link graph connectivity
    - Check that every docs page has at least 3 outbound internal links
    - Check that no page is an orphan (unreachable from other docs pages)
    - Ensure RelatedPages appears on all 21 pages
    - _Requirements: 1.1, 1.5_

## Notes

- All content follows the positioning rule: Speakable is complementary to manual testing, never a replacement
- Never claim WCAG compliance or use absolutes
- All code examples should be complete and runnable with `speakable` CLI
- Use existing design system consistently (no new colors, fonts, or patterns)
- Target 1500-3000 words per page for SEO depth
- Each page is a standalone Next.js App Router page component

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 3, "tasks": ["3.1", "3.2", "3.3", "3.4"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.3", "4.4"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10"] },
    { "id": 6, "tasks": ["6.1", "6.2"] }
  ]
}
```
