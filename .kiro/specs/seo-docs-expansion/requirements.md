# Requirements: SEO Documentation Expansion

## Overview

Expand the Speakable documentation site from 10 pages to 20+ pages, establishing topical authority for "screen reader testing" and related accessibility keywords. Fix critical internal linking gaps and create high-value reference, educational, and actionable content targeting developers at all stages.

## Functional Requirements

### 1. Internal Cross-Linking (All Existing Pages)

- **1.1** Every docs page must contain at least 3 contextual links to other docs pages
- **1.2** Links must use descriptive anchor text (not "click here" or "learn more")
- **1.3** Links must be contextually relevant to the surrounding content
- **1.4** Add a "Related Pages" section at the bottom of each page with 2-4 recommended next reads
- **1.5** The link structure must form a connected graph (no orphan pages)

### 2. ARIA Roles Quick Reference (Tier 1)

- **2.1** Create `/docs/aria-roles` page listing all WAI-ARIA roles grouped by category (landmark, widget, document structure, live region, window)
- **2.2** Each role entry must show: role name, implicit HTML element (if any), required/supported states, and a short Speakable output example
- **2.3** Include a search/filter input to quickly find roles
- **2.4** Cross-link to Common Mistakes for roles that are commonly misused
- **2.5** Include "How Speakable handles this role" notes showing NVDA/JAWS/VoiceOver/Narrator differences

### 3. Screen Reader Testing Checklist (Tier 1)

- **3.1** Create `/docs/testing-checklist` page with a structured checklist developers can follow
- **3.2** Organize by category: navigation, forms, dynamic content, media, tables, custom widgets
- **3.3** Each item must show what to test, expected behavior, and how to verify with Speakable
- **3.4** Include copy-paste CLI commands for each check
- **3.5** Link to relevant Common Mistakes and Examples pages for each category

### 4. How Screen Readers Work (Tier 1)

- **4.1** Create `/docs/how-screen-readers-work` educational page
- **4.2** Explain the accessibility tree concept with diagrams (text-based)
- **4.3** Cover the pipeline: DOM → accessibility tree → screen reader → speech
- **4.4** Explain browse mode vs focus mode and how they affect announcements
- **4.5** Show how Speakable's pipeline mirrors this (parse → extract → model → render)
- **4.6** Position as educational entry point linking to Usage Guide, Advanced Guide, and API Reference

### 5. Accessible Component Patterns (Tier 2)

- **5.1** Create `/docs/component-patterns` hub page linking to individual patterns
- **5.2** Cover at minimum: modal/dialog, dropdown menu, tabs, accordion, tooltip, combobox/autocomplete
- **5.3** Each pattern must show: correct HTML, screen reader output (all 4 readers), keyboard interaction, common mistakes
- **5.4** Include "Test with Speakable" section showing CLI/API usage for each pattern
- **5.5** Cross-link to ARIA Roles reference for roles used in each pattern

### 6. Live Regions & Dynamic Content (Tier 2)

- **6.1** Create `/docs/live-regions` page dedicated to aria-live, aria-atomic, aria-relevant
- **6.2** Explain polite vs assertive vs off with real examples
- **6.3** Cover status messages, form validation, loading indicators, chat messages, toast notifications
- **6.4** Show how each screen reader handles live regions differently
- **6.5** Note Speakable's current limitations with dynamic content (static HTML analysis)

### 7. Focus Management Guide (Tier 2)

- **7.1** Create `/docs/focus-management` page
- **7.2** Cover: focus traps (modals), focus restoration, skip links, roving tabindex, focus indicators
- **7.3** Include SPA-specific patterns: route change focus, dynamic content insertion
- **7.4** Show how to test focus order with Speakable's tab-order analysis
- **7.5** Cross-link to Testing Checklist and Common Mistakes

### 8. Accessibility Testing Strategy (Tier 2)

- **8.1** Create `/docs/testing-strategy` page aimed at team leads and decision makers
- **8.2** Cover: when to test (shift-left), what to automate vs manual test, frequency, metrics
- **8.3** Position Speakable in the overall strategy alongside axe-core, manual testing, user testing
- **8.4** Include a team maturity model (level 1: basic linting → level 5: full a11y program)
- **8.5** Link to CI/CD Integration, Testing Ecosystem, and Frameworks pages

### 9. Glossary of Terms (Tier 3)

- **9.1** Create `/docs/glossary` page with accessibility/screen reader terminology
- **9.2** Cover at minimum 30 terms: ARIA, accessibility tree, announce, browse mode, focus mode, landmark, live region, name computation, role, state, etc.
- **9.3** Each term links to the most relevant docs page for deeper reading
- **9.4** Alphabetically sorted with jump-to-letter navigation

### 10. Screen Reader Comparison Guide (Tier 3)

- **10.1** Create `/docs/screen-reader-comparison` page
- **10.2** Compare NVDA, JAWS, VoiceOver, and Narrator across: market share, platform, verbosity, unique behaviors
- **10.3** Include a comparison table showing how each reader announces common patterns (links, headings, landmarks, forms)
- **10.4** Reference Speakable's renderer approach and link to Advanced Guide cross-reader section
- **10.5** Note that this is approximate — actual screen reader behavior varies by version and settings

### 11. Keyboard Navigation Patterns (Tier 3)

- **11.1** Create `/docs/keyboard-navigation` page
- **11.2** Cover: tab order, arrow key patterns, shortcut keys, focus indicators, skip navigation
- **11.3** Include a keyboard shortcuts reference for each screen reader
- **11.4** Show how to audit keyboard accessibility with Speakable's interactive elements report
- **11.5** Cross-link to Focus Management and Testing Checklist

### 12. Form Accessibility Deep Dive (Tier 3)

- **12.1** Create `/docs/accessible-forms` page
- **12.2** Cover: labels, descriptions, required fields, validation errors, fieldsets, autocomplete
- **12.3** Show screen reader output for correct vs incorrect form patterns
- **12.4** Include dynamic validation announcements (live regions integration)
- **12.5** Cross-link to Live Regions, Component Patterns, and Common Mistakes

### 13. Navigation Sidebar Update

- **13.1** Add all new pages to the docs sidebar navigation (`DOCS_SECTIONS` in layout.tsx)
- **13.2** Group pages into logical categories in the sidebar (Getting Started, Guides, Reference, Integration)
- **13.3** Maintain consistent breadcrumb navigation for new pages

## Non-Functional Requirements

### 14. Content Guidelines

- **14.1** Never claim WCAG compliance or use absolutes like "100%", "ensures", "everyone"
- **14.2** Position Speakable as complementary to manual screen reader testing, not a replacement
- **14.3** All code examples must be complete and runnable
- **14.4** Use the same design system as existing docs (slate/blue color scheme, code blocks, info cards)
- **14.5** Each page should be self-contained but richly linked to related content
- **14.6** Target 1500-3000 words per page for SEO depth

### 15. SEO Requirements

- **15.1** Each page must have a unique, keyword-rich H1 matching target search intent
- **15.2** Use proper heading hierarchy (H1 → H2 → H3, no skipping)
- **15.3** Include the primary keyword in the first 100 words of each page
- **15.4** Add new pages to `site/app/sitemap.ts`
