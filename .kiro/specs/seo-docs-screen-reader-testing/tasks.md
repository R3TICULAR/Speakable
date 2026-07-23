# Implementation Plan:

## Overview

Create 7 new SEO-optimized documentation pages targeting high-intent screen reader testing keywords, optimize 8 existing pages for their assigned keywords, establish internal linking topology, and verify the complete build.

## Task Dependency Graph

```
Task 1-4 (new pages, Phase 1) → can run in parallel
Task 5-7 (existing page optimizations) → can run in parallel, after Phase 1
Task 8-9 (Phase 2 new pages) → after Task 1-4 for cross-links
Task 10 (cicd optimization) → after Task 9
Task 11 (aria-labels-guide) → can run independently
Task 12-14 (ARIA optimizations) → after Task 11
Task 15 (reciprocal links) → after all pages exist (Tasks 1-14)
Task 16 (sitemap/nav) → after all pages exist
Task 17 (verification) → after all other tasks
```

## Tasks

## Phase 1: High-Intent Pages and Core Optimizations

- [x] Task 1: Create `/docs/screen-reader-testing-tool` page
  - Create `site/app/docs/screen-reader-testing-tool/page.tsx`
  - H1: "Screen Reader Testing Tool for Developers"
  - Primary keyword: "screen reader testing tool"
  - Export metadata with title (42 chars) and description (148 chars)
  - Include sections: What Is a Screen Reader Testing Tool, How Speakable Predicts Output, Getting Started in 60 Seconds, What Testing Tools Catch, Comparing Approaches (table), Limitations
  - Add Speakable CLI example showing all 4 renderers
  - Add RelatedPages linking to automated-screen-reader-testing, testing-checklist, how-to-test-with-screen-reader
  - Minimum 1500 words
  - Add to sidebar in Guides group and sitemap (priority 0.8)
  - Requirements: R1, R2, R3, R4, R5, R6, R7, R11, R12

- [x] Task 2: Create `/docs/automated-screen-reader-testing` page
  - Create `site/app/docs/automated-screen-reader-testing/page.tsx`
  - H1: "Automated Screen Reader Testing"
  - Primary keyword: "automated screen reader testing"
  - Export metadata with title (48 chars) and description (150 chars)
  - Include sections: Why Automate, How It Works (parsing, renderers, output), Setting Up (CLI, Node API, MCP), Batch Testing, Test Suite Integration (Vitest example), What Automation Catches vs Misses
  - Add programmatic Node.js API example
  - Add RelatedPages linking to cicd-integration, screen-reader-regression-testing, beyond-axe
  - Minimum 1500 words
  - Add to sidebar and sitemap (priority 0.8)
  - Requirements: R1, R2, R4, R5, R6, R7, R11, R12

- [x] Task 3: Create `/docs/how-to-test-with-screen-reader` page
  - Create `site/app/docs/how-to-test-with-screen-reader/page.tsx`
  - H1: "How to Test a Website with a Screen Reader"
  - Primary keyword: "how to test website with screen reader"
  - Export metadata with title (43 chars) and description (150 chars)
  - Include step-by-step sections: Manual Testing with VoiceOver, NVDA, JAWS, Narrator; Common Issues to Listen For; Automating Repetitive Parts; Combined Workflow
  - Include numbered instructions for each screen reader
  - Add Speakable example showing how to preview output before manual testing
  - Add RelatedPages linking to screen-reader-testing-tool, testing-checklist, screen-reader-comparison
  - Minimum 1500 words
  - Add to sidebar in Getting Started group and sitemap (priority 0.8)
  - Requirements: R1, R2, R4, R5, R6, R7, R8, R11, R12

- [x] Task 4: Create `/docs/screen-reader-testing-without-screen-reader` page
  - Create `site/app/docs/screen-reader-testing-without-screen-reader/page.tsx`
  - H1: "Screen Reader Testing Without a Screen Reader"
  - Primary keyword: "screen reader testing without a screen reader"
  - Export metadata with title (47 chars) and description (145 chars)
  - Include sections: Cross-Platform Problem, How Predictive Testing Works, What You Can Validate, What Still Requires a Real Reader, Using Speakable as Pre-Testing Filter, Recommended Workflow
  - Clearly state limitations (timing, browse mode, settings variations)
  - Add CLI example with cross-reader output comparison
  - Add RelatedPages linking to screen-reader-testing-tool, how-to-test-with-screen-reader, testing-strategy
  - Minimum 1500 words
  - Add to sidebar and sitemap (priority 0.8)
  - Requirements: R1, R2, R4, R5, R6, R7, R8, R11, R12

- [x] Task 5: Optimize `/docs/testing-checklist` for "screen reader testing checklist"
  - Update H1 to "Screen Reader Testing Checklist"
  - Add metadata export: title "Screen Reader Testing Checklist" (31 chars), description (131 chars)
  - Place "screen reader testing checklist" in first 100 words
  - Add Speakable CLI example showing programmatic checklist verification
  - Verify heading hierarchy (H1 > H2 > H3, no skips)
  - Add internal links to screen-reader-testing-tool and how-to-test-with-screen-reader
  - Requirements: R1, R3, R4, R5, R6, R12

- [x] Task 6: Optimize `/docs/screen-reader-comparison` for "screen reader compatibility testing"
  - Update H1 to include "Screen Reader Compatibility Testing"
  - Add metadata export: title (48 chars), description (140 chars)
  - Add H2 section on "VoiceOver Testing" with macOS-specific guidance
  - Place primary keyword in first 100 words
  - Add Speakable cross-reader comparison example
  - Add internal links to screen-reader-testing-tool and how-to-test-with-screen-reader
  - Requirements: R1, R3, R4, R5, R6, R12

- [x] Task 7: Optimize `/docs/testing-strategy` for "screen reader accessibility testing"
  - Update H1 to "Screen Reader Accessibility Testing Strategy"
  - Add metadata export: title (45 chars), description (149 chars)
  - Place primary keyword in first 100 words
  - Ensure Speakable example is present
  - Add internal links to automated-screen-reader-testing and screen-reader-testing-without-screen-reader
  - Requirements: R1, R3, R4, R5, R6, R12

## Phase 2: Developer-Focused Pages

- [x] Task 8: Create `/docs/beyond-axe` page
  - Create `site/app/docs/beyond-axe/page.tsx`
  - H1: "Automated Accessibility Testing Beyond Axe"
  - Primary keyword: "automated accessibility testing beyond axe"
  - Export metadata with title (39 chars) and description (155 chars)
  - Include sections: What Axe Does Well, What Rule-Based Tools Miss (announcement quality, cross-reader diffs, verbosity, semantic meaning), Where Speakable Fills the Gap (comparison table), Using Both Together (combined GitHub Actions YAML), Limitations of Both
  - Show combined axe + speakable workflow YAML
  - Add RelatedPages linking to automated-screen-reader-testing, cicd-integration, testing-strategy
  - Minimum 1500 words
  - Add to sidebar and sitemap (priority 0.8)
  - Requirements: R1, R2, R4, R5, R6, R7, R8, R10, R11, R12

- [x] Task 9: Create `/docs/screen-reader-regression-testing` page
  - Create `site/app/docs/screen-reader-regression-testing/page.tsx`
  - H1: "Screen Reader Regression Testing"
  - Primary keyword: "screen reader regression testing"
  - Export metadata with title (33 chars) and description (124 chars)
  - Include sections: What Is an Accessibility Regression (concrete examples), How Speakable Detects Regressions (diff algorithm, exit codes, JSON), Setting Up (baselines, diffing on PR, GitHub Actions), Interpreting Output, False Positives
  - Show speakable diff command with before/after HTML
  - Show GitHub Actions workflow with regression detection
  - Add RelatedPages linking to cicd-integration, automated-screen-reader-testing, beyond-axe
  - Minimum 1500 words
  - Add to sidebar and sitemap (priority 0.8)
  - Requirements: R1, R2, R4, R5, R6, R7, R8, R10, R11, R12

- [x] Task 10: Optimize `/docs/cicd-integration` for "screen reader testing in CI/CD"
  - Update H1 to "Screen Reader Testing in CI/CD Pipelines"
  - Add metadata export: title (41 chars), description (131 chars)
  - Place primary keyword in first 100 words
  - Add H2 "Running Accessibility Tests in Pull Requests" with exit code docs
  - Add H2 "GitHub Actions Configuration" with complete YAML example
  - Add internal links to screen-reader-regression-testing and beyond-axe
  - Requirements: R1, R3, R4, R5, R6, R8, R10, R12

## Phase 3: ARIA Expansion

- [x] Task 11: Create `/docs/aria-labels-guide` page
  - Create `site/app/docs/aria-labels-guide/page.tsx`
  - H1: "ARIA Labels Best Practices for Screen Readers"
  - Primary keyword: "ARIA labels best practices"
  - Export metadata with title (47 chars) and description (136 chars)
  - Include sections: Accessible Name Computation, aria-label usage, aria-labelledby usage, aria-describedby usage, aria-label vs aria-labelledby (comparison table with SR output), Common Mistakes, Testing with Speakable
  - Show Speakable output for each labeling technique across NVDA/JAWS/VoiceOver
  - Add RelatedPages linking to aria-roles, common-mistakes, accessible-forms
  - Minimum 1500 words
  - Add to sidebar and sitemap (priority 0.7)
  - Requirements: R1, R2, R4, R5, R6, R7, R9, R11, R12

- [x] Task 12: Optimize `/docs/aria-roles` for "ARIA testing tool"
  - Update H1 to "ARIA Roles Testing and Validation"
  - Add metadata export: title (40 chars), description (134 chars)
  - Place "ARIA testing tool" in first 100 words
  - Add H2 "ARIA Role Validation with Speakable" with audit CLI example
  - Add H2 "aria-hidden Screen Reader Behavior" showing exclusion in output
  - Add internal links to aria-labels-guide and common-mistakes
  - Requirements: R1, R3, R4, R5, R6, R9, R12

- [x] Task 13: Optimize `/docs/live-regions` for "aria live region testing"
  - Add H2 "Testing Live Regions with Speakable" section
  - Show runtime analysis detecting misconfigured live regions
  - Add Speakable verbosity analyzer example for live region issues
  - Add internal link to dynamic-content-pitfalls and runtime-analysis
  - Requirements: R1, R3, R5, R6, R9, R12

- [x] Task 14: Optimize `/docs/common-mistakes` for "incorrect ARIA usage examples"
  - Add H2 "Incorrect ARIA Usage Examples" with before/after Speakable diff
  - Show concrete examples: aria-hidden on focusable elements, missing required properties, redundant roles
  - Add internal links to aria-labels-guide and aria-roles
  - Requirements: R1, R3, R5, R6, R9, R12

## Phase 4: Cross-Linking and Final Verification

- [x] Task 15: Add reciprocal internal links from existing pages to new pages
  - From testing-checklist: link to screen-reader-testing-tool and how-to-test-with-screen-reader
  - From screen-reader-comparison: link to screen-reader-testing-without-screen-reader
  - From cicd-integration: link to screen-reader-regression-testing and beyond-axe
  - From testing-strategy: link to automated-screen-reader-testing
  - From usage-guide: link to screen-reader-testing-tool (add "accessibility testing npm package" context)
  - From testing-ecosystem: link to beyond-axe
  - Each link uses descriptive anchor text (not "click here")
  - Requirements: R6

- [x] Task 16: Update sitemap and sidebar navigation
  - Add all 7 new pages to `site/app/sitemap.ts` (priority 0.8 for high-intent, 0.7 for aria-labels-guide)
  - Add all 7 new pages to `DOCS_GROUPS` in `site/app/docs/layout.tsx`
  - Place "How to Test with a Screen Reader" in Getting Started group
  - Place remaining new pages in Guides group
  - Verify no duplicate entries
  - Requirements: R11

- [x] Task 17: Verify keyword cannibalization and build
  - Confirm no two pages share the same primary keyword
  - Run site build (`npm run build` in site/) to verify all pages compile
  - Spot-check that H1 hierarchy is correct on each new page (no H1 > H3 skips)
  - Verify all RelatedPages hrefs resolve (no broken links)
  - Confirm all metadata exports have title under 60 chars and description under 155 chars
  - Requirements: R1, R4, R11, R12

## Notes

- All pages must avoid em dashes in prose (use colons, commas, parentheses, or periods)
- All pages must position Speakable as "predictive" not "emulation" and complementary to manual testing
- Never use "ensures", "guarantees", "100%", or "full compliance"
- Primary keyword must appear in H1 and first 100 words of body
- Use relative imports for components (../../../components/RelatedPages)
- Each page targets a unique primary keyword (no cannibalization)
