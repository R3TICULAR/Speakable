# Technical Design: SEO Documentation Optimization

## Architecture

This feature is a content-layer expansion of the existing Next.js docs site. No new backend services, databases, or APIs are needed. The architecture consists of:

- 7 new page.tsx files in `site/app/docs/` (one per new URL slug)
- Metadata exports on each page for SEO title/description
- Updates to 2 shared config files: `layout.tsx` (sidebar nav) and `sitemap.ts`
- Content optimizations to 8 existing page.tsx files (H1, intro text, meta tags)
- Internal linking via existing `RelatedPages` and `SeeAlso` components

## Components and Interfaces

No new React components are needed. Existing components used:

- `RelatedPages`: Grid of 2-3 linked pages at page bottom (props: `pages: { href, title, description }[]`)
- `SeeAlso`: Inline callout link (props: `{ href, title, description? }`)
- `Link` (next/link): All internal navigation
- `Metadata` export (Next.js): Title tag and meta description per page

Each new page exports:
```typescript
export const metadata: Metadata = { title: string, description: string, openGraph: { ... } };
export default function PageName() { return (<>...</>); }
```

## Data Models

No runtime data models. Content is static. The "data" is the Keyword Map (documented below) which maps search terms to page URLs and optimization actions.

## Overview

This design maps 40+ target keywords to content destinations (new or existing pages), defines URL slugs and content structures for new pages, specifies optimization actions for existing pages, and establishes metadata standards. Execution is phased: high-intent pages first, then developer-focused, then ARIA/CI-CD expansion.

## Keyword Map

### Group 1: High-Intent Keywords (Priority 1)

| Keyword | Destination | Action |
|---------|-------------|--------|
| screen reader testing tool | NEW: `/docs/screen-reader-testing-tool` | Create dedicated page |
| automated screen reader testing | NEW: `/docs/automated-screen-reader-testing` | Create dedicated page |
| screen reader testing software | `/docs/screen-reader-testing-tool` | Secondary keyword on same page |
| how to test website with screen reader | NEW: `/docs/how-to-test-with-screen-reader` | Create how-to guide |
| screen reader accessibility testing | `/docs/testing-strategy` | Optimize existing (H1, meta, intro) |
| screen reader compatibility testing | `/docs/screen-reader-comparison` | Optimize existing (H1, meta) |
| screen reader testing checklist | `/docs/testing-checklist` | Optimize existing (H1, meta, content) |
| screen reader testing without a screen reader | NEW: `/docs/screen-reader-testing-without-screen-reader` | Create dedicated page |

### Group 2: Developer-Focused Keywords (Priority 2)

| Keyword | Destination | Action |
|---------|-------------|--------|
| how developers test screen readers | `/docs/how-to-test-with-screen-reader` | Secondary keyword |
| automated accessibility testing beyond axe | NEW: `/docs/beyond-axe` | Create comparison page |
| screen reader testing in CI/CD | `/docs/cicd-integration` | Optimize existing (H1, content) |
| screen reader regression testing | NEW: `/docs/screen-reader-regression-testing` | Create dedicated page |
| screen reader testing automation | `/docs/automated-screen-reader-testing` | Secondary keyword |

### Group 3: General Keywords (Priority 3)

| Keyword | Destination | Action |
|---------|-------------|--------|
| screen reader testing | `/docs/screen-reader-testing-tool` | Covered by primary page |
| accessible html checker | `/docs/screen-reader-testing-tool` | Secondary keyword |
| aria validation | `/docs/aria-roles` | Optimize existing |
| wcag testing cli | `/docs/beyond-axe` | Secondary keyword |
| voiceover testing | `/docs/screen-reader-comparison` | Add VoiceOver-specific section |
| screen reader automation | `/docs/automated-screen-reader-testing` | Covered |
| accessibility regression testing | `/docs/screen-reader-regression-testing` | Covered |

### Group 4: ARIA-Focused Keywords (Priority 3)

| Keyword | Destination | Action |
|---------|-------------|--------|
| ARIA testing tool | `/docs/aria-roles` | Optimize H1 and intro |
| ARIA validator | `/docs/aria-roles` | Secondary keyword |
| ARIA accessibility checker | `/docs/aria-roles` | Secondary keyword |
| ARIA roles explained | `/docs/aria-roles` | Already covers, optimize meta |
| ARIA attributes testing | `/docs/aria-roles` | Add testing section |
| ARIA labels best practices | NEW: `/docs/aria-labels-guide` | Create dedicated page |
| ARIA role validation | `/docs/aria-roles` | Add validation examples |
| incorrect ARIA usage examples | `/docs/common-mistakes` | Optimize, add ARIA section |
| how screen readers interpret aria labels | `/docs/aria-labels-guide` | Secondary keyword |
| aria label vs aria labelledby screen reader | `/docs/aria-labels-guide` | H2 section |
| aria hidden screen reader behavior | `/docs/aria-roles` | Add H2 section |
| aria live region testing | `/docs/live-regions` | Optimize existing |

### Group 5: CI/CD Keywords (Priority 2)

| Keyword | Destination | Action |
|---------|-------------|--------|
| accessibility testing CI/CD | `/docs/cicd-integration` | Optimize H1 |
| automated accessibility testing pipeline | `/docs/cicd-integration` | Secondary keyword |
| accessibility testing github actions | `/docs/cicd-integration` | Add GitHub Actions section |
| accessibility regression testing | `/docs/screen-reader-regression-testing` | Covered |
| accessibility tests in pull requests | `/docs/cicd-integration` | Add PR testing section |
| web accessibility automation | `/docs/automated-screen-reader-testing` | Secondary keyword |
| run accessibility tests on every pull request | `/docs/cicd-integration` | Long-tail covered |
| github actions accessibility testing | `/docs/cicd-integration` | Covered |
| automated wcag testing github actions | `/docs/beyond-axe` | Add combined workflow section |
| accessibility testing npm package | `/docs/usage-guide` | Optimize for this keyword |

## New Pages: Content Architecture

### Page 1: `/docs/screen-reader-testing-tool`

**Primary keyword:** screen reader testing tool
**Secondary keywords:** screen reader testing software, accessible html checker, screen reader testing
**Title tag:** "Screen Reader Testing Tool for Developers" (42 chars)
**Meta description:** "Predict NVDA, JAWS, VoiceOver, and Narrator output for any HTML. Speakable is a CLI screen reader testing tool that fits into your dev workflow." (148 chars)

**Content outline:**
- H1: Screen Reader Testing Tool for Developers
- H2: What Is a Screen Reader Testing Tool?
- H2: How Speakable Predicts Screen Reader Output
  - H3: Supported Screen Readers
  - H3: Static Analysis vs Manual Testing
- H2: Getting Started in 60 Seconds (CLI quick start)
- H2: What Screen Reader Testing Tools Catch
  - H3: Missing Accessible Names
  - H3: Incorrect ARIA Roles
  - H3: Heading Hierarchy Issues
  - H3: Cross-Reader Announcement Differences
- H2: Comparing Screen Reader Testing Approaches
  - Table: Manual vs Automated vs Predictive
- H2: Limitations and When to Use Real Screen Readers
- RelatedPages: automated-screen-reader-testing, testing-checklist, how-to-test-with-screen-reader

**File:** `site/app/docs/screen-reader-testing-tool/page.tsx`

---

### Page 2: `/docs/automated-screen-reader-testing`

**Primary keyword:** automated screen reader testing
**Secondary keywords:** screen reader testing automation, web accessibility automation, screen reader automation
**Title tag:** "Automated Screen Reader Testing with Speakable" (48 chars)
**Meta description:** "Automate screen reader testing in CI/CD. Predict announcements, detect regressions, and batch-analyze components without launching a screen reader." (150 chars)

**Content outline:**
- H1: Automated Screen Reader Testing
- H2: Why Automate Screen Reader Testing?
- H2: How Automated Screen Reader Testing Works
  - H3: Parsing HTML into an Accessibility Tree
  - H3: Applying Heuristic Renderers
  - H3: Producing Predictive Output
- H2: Setting Up Automated Tests with Speakable
  - H3: CLI Usage
  - H3: Node.js API
  - H3: MCP Integration for AI Assistants
- H2: Batch Testing Multiple Components
- H2: Integrating with Your Test Suite (Vitest/Jest example)
- H2: What Automation Catches vs What It Misses
- RelatedPages: cicd-integration, screen-reader-regression-testing, beyond-axe

**File:** `site/app/docs/automated-screen-reader-testing/page.tsx`

---

### Page 3: `/docs/how-to-test-with-screen-reader`

**Primary keyword:** how to test website with screen reader
**Secondary keywords:** how developers test screen readers, screen reader accessibility testing
**Title tag:** "How to Test a Website with a Screen Reader" (43 chars)
**Meta description:** "Step-by-step guide to testing websites with screen readers. Learn manual testing with VoiceOver and NVDA, plus automated checks with Speakable CLI." (150 chars)

**Content outline:**
- H1: How to Test a Website with a Screen Reader
- H2: Why Screen Reader Testing Matters
- H2: Step-by-Step Manual Testing
  - H3: Testing with VoiceOver (macOS)
  - H3: Testing with NVDA (Windows)
  - H3: Testing with JAWS (Windows)
  - H3: Testing with Narrator (Windows)
- H2: Common Issues to Listen For
- H2: Automating the Repetitive Parts
  - H3: Using Speakable to Preview Output Before Manual Testing
  - H3: Setting Up Regression Guards
- H2: A Combined Testing Workflow
- H2: Resources and Next Steps
- RelatedPages: screen-reader-testing-tool, testing-checklist, screen-reader-comparison

**File:** `site/app/docs/how-to-test-with-screen-reader/page.tsx`

---

### Page 4: `/docs/screen-reader-testing-without-screen-reader`

**Primary keyword:** screen reader testing without a screen reader
**Secondary keywords:** predictive screen reader output, test accessibility without assistive technology
**Title tag:** "Screen Reader Testing Without a Screen Reader" (47 chars)
**Meta description:** "Test screen reader compatibility without installing VoiceOver or NVDA. Speakable predicts what each screen reader would announce for your HTML." (145 chars)

**Content outline:**
- H1: Screen Reader Testing Without a Screen Reader
- H2: The Cross-Platform Testing Problem
- H2: How Predictive Screen Reader Testing Works
  - H3: Accessibility Tree Extraction
  - H3: Heuristic Renderer Models
  - H3: Output Comparison Across 4 Readers
- H2: What You Can Validate Without a Screen Reader
  - H3: Accessible Names and Descriptions
  - H3: ARIA State Announcements
  - H3: Heading and Landmark Structure
  - H3: Announcement Order Differences
- H2: What Still Requires a Real Screen Reader
  - H3: Timing and Speech Rate
  - H3: Browse Mode vs Focus Mode
  - H3: Screen Reader Settings Variations
  - H3: Interaction Patterns (keyboard traps, etc.)
- H2: Using Speakable as a Pre-Testing Filter
- H2: Recommended Workflow: Predictive First, Manual Second
- RelatedPages: screen-reader-testing-tool, how-to-test-with-screen-reader, testing-strategy

**File:** `site/app/docs/screen-reader-testing-without-screen-reader/page.tsx`

---

### Page 5: `/docs/beyond-axe`

**Primary keyword:** automated accessibility testing beyond axe
**Secondary keywords:** wcag testing cli, axe-core vs speakable, accessibility tools comparison
**Title tag:** "Beyond Axe: What Rule-Based Tools Miss" (39 chars)
**Meta description:** "Axe catches rule violations. Speakable catches what screen readers actually say. Learn what automated accessibility testing misses and how to close the gap." (155 chars)

**Content outline:**
- H1: Automated Accessibility Testing Beyond Axe
- H2: What Axe-Core Does Well
- H2: What Rule-Based Tools Cannot Catch
  - H3: Announcement Quality
  - H3: Cross-Reader Differences
  - H3: Verbosity and Redundancy
  - H3: Semantic Meaning vs Technical Compliance
- H2: Where Speakable Fills the Gap
  - Table: Axe vs Speakable comparison (what each catches)
- H2: Using Both Together
  - H3: Combined GitHub Actions Workflow (axe + speakable)
- H2: Limitations of Both Approaches
- RelatedPages: automated-screen-reader-testing, cicd-integration, testing-strategy

**File:** `site/app/docs/beyond-axe/page.tsx`

---

### Page 6: `/docs/screen-reader-regression-testing`

**Primary keyword:** screen reader regression testing
**Secondary keywords:** accessibility regression testing, accessibility diff
**Title tag:** "Screen Reader Regression Testing" (33 chars)
**Meta description:** "Detect when code changes break screen reader announcements. Speakable diffs accessibility trees and flags regressions in CI." (124 chars)

**Content outline:**
- H1: Screen Reader Regression Testing
- H2: What Is an Accessibility Regression?
  - H3: Examples of Regressions (concrete before/after)
- H2: How Speakable Detects Regressions
  - H3: Semantic Diff Algorithm
  - H3: Exit Codes for CI
  - H3: JSON Output for Programmatic Use
- H2: Setting Up Regression Testing
  - H3: Creating Baselines
  - H3: Diffing Against Baselines on Every PR
  - H3: GitHub Actions Example
- H2: Interpreting Diff Output
- H2: False Positives and How to Handle Them
- RelatedPages: cicd-integration, automated-screen-reader-testing, beyond-axe

**File:** `site/app/docs/screen-reader-regression-testing/page.tsx`

---

### Page 7: `/docs/aria-labels-guide`

**Primary keyword:** ARIA labels best practices
**Secondary keywords:** aria label vs aria labelledby, how screen readers interpret aria labels
**Title tag:** "ARIA Labels Best Practices for Screen Readers" (47 chars)
**Meta description:** "Learn when to use aria-label, aria-labelledby, and aria-describedby. See how each is announced by NVDA, JAWS, VoiceOver, and Narrator." (136 chars)

**Content outline:**
- H1: ARIA Labels Best Practices for Screen Readers
- H2: The Accessible Name Computation
- H2: aria-label: When and How to Use It
  - H3: Speakable Output Example
- H2: aria-labelledby: Composing Names from Visible Text
  - H3: Speakable Output Example
- H2: aria-describedby: Supplementary Information
  - H3: How Descriptions Are Announced Differently
- H2: aria-label vs aria-labelledby: Which to Choose
  - Table: comparison with screen reader output
- H2: Common Mistakes with ARIA Labels
  - H3: Redundant Labels
  - H3: Labels on Non-Interactive Elements
  - H3: Overriding Good Native Semantics
- H2: Testing ARIA Labels with Speakable
- RelatedPages: aria-roles, common-mistakes, accessible-forms

**File:** `site/app/docs/aria-labels-guide/page.tsx`

---

## Existing Pages: Optimization Actions

### `/docs/testing-checklist`
- **Current H1:** "Testing Checklist" (too generic)
- **New H1:** "Screen Reader Testing Checklist"
- **Primary keyword:** screen reader testing checklist
- **Meta title:** "Screen Reader Testing Checklist" (31 chars)
- **Meta desc:** "Step-by-step screen reader testing checklist for web developers. Covers NVDA, JAWS, VoiceOver, and Narrator with actionable items." (131 chars)
- **Actions:** Update H1, add meta export, ensure keyword in first 100 words, add Speakable example for checking items programmatically

### `/docs/screen-reader-comparison`
- **Current H1:** likely generic
- **New H1:** "Screen Reader Compatibility Testing: NVDA vs JAWS vs VoiceOver vs Narrator"
- **Primary keyword:** screen reader compatibility testing
- **Meta title:** "Screen Reader Compatibility Testing Comparison" (48 chars)
- **Meta desc:** "Compare how NVDA, JAWS, VoiceOver, and Narrator announce the same HTML differently. Understand compatibility issues across screen readers." (140 chars)
- **Actions:** Update H1, add "voiceover testing" section, add Speakable cross-reader example

### `/docs/cicd-integration`
- **New H1:** "Screen Reader Testing in CI/CD Pipelines"
- **Primary keyword:** screen reader testing in CI/CD
- **Meta title:** "Screen Reader Testing in CI/CD Pipelines" (41 chars)
- **Meta desc:** "Add screen reader testing to GitHub Actions. Speakable audits HTML, detects regressions, and fails CI when accessibility degrades." (131 chars)
- **Actions:** Update H1, add GitHub Actions YAML example, add "accessibility tests in pull requests" H2, add exit code documentation

### `/docs/testing-strategy`
- **New H1:** "Screen Reader Accessibility Testing Strategy"
- **Primary keyword:** screen reader accessibility testing
- **Meta title:** "Screen Reader Accessibility Testing Strategy" (45 chars)
- **Meta desc:** "Build a screen reader testing strategy that combines automated prediction with manual verification. Plan coverage across NVDA, JAWS, and VoiceOver." (149 chars)
- **Actions:** Update H1, ensure keyword in intro paragraph, add workflow diagram section

### `/docs/aria-roles`
- **New H1:** "ARIA Roles Testing and Validation"
- **Primary keyword:** ARIA testing tool
- **Meta title:** "ARIA Roles Testing and Validation Guide" (40 chars)
- **Meta desc:** "Validate ARIA roles and attributes with Speakable CLI. See how screen readers interpret each role and catch incorrect usage patterns." (134 chars)
- **Actions:** Update H1, add "aria hidden screen reader behavior" H2, add validation examples with Speakable audit output

### `/docs/live-regions`
- **Additional keyword:** aria live region testing
- **Actions:** Add H2 "Testing Live Regions with Speakable", show runtime analysis detecting misconfigured live regions

### `/docs/common-mistakes`
- **Additional keyword:** incorrect ARIA usage examples
- **Actions:** Add H2 "Incorrect ARIA Usage Examples" with before/after Speakable diff output

### `/docs/usage-guide`
- **Additional keyword:** accessibility testing npm package
- **Actions:** Ensure npm install instructions are prominent, add "package" and "npm" to intro paragraph

## Metadata Implementation

Each page.tsx will export a `metadata` object or use `generateMetadata`:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Screen Reader Testing Tool for Developers',
  description: 'Predict NVDA, JAWS, VoiceOver, and Narrator output for any HTML. Speakable is a CLI screen reader testing tool that fits into your dev workflow.',
  openGraph: {
    title: 'Screen Reader Testing Tool for Developers',
    description: 'Predict NVDA, JAWS, VoiceOver, and Narrator output for any HTML.',
    url: 'https://getspeakable.dev/docs/screen-reader-testing-tool',
  },
};
```

## Navigation Updates

Add to `DOCS_GROUPS` in layout.tsx:

```
{
  label: 'Getting Started',
  sections: [
    { label: 'Usage Guide', href: '/docs/usage-guide' },
    { label: 'How Screen Readers Work', href: '/docs/how-screen-readers-work' },
    { label: 'How to Test with a Screen Reader', href: '/docs/how-to-test-with-screen-reader' },
  ],
},
{
  label: 'Guides',
  sections: [
    ...existing...,
    { label: 'Screen Reader Testing Tool', href: '/docs/screen-reader-testing-tool' },
    { label: 'Automated Screen Reader Testing', href: '/docs/automated-screen-reader-testing' },
    { label: 'Testing Without a Screen Reader', href: '/docs/screen-reader-testing-without-screen-reader' },
    { label: 'Beyond Axe', href: '/docs/beyond-axe' },
    { label: 'Regression Testing', href: '/docs/screen-reader-regression-testing' },
    { label: 'ARIA Labels Guide', href: '/docs/aria-labels-guide' },
  ],
}
```

## Topic Cluster Linking Strategy

```
                    [screen-reader-testing-tool] (hub)
                   /          |           \
  [automated-sr-testing]  [how-to-test]  [without-sr]
         |                     |                |
  [cicd-integration]    [testing-checklist]  [sr-comparison]
         |
  [regression-testing] --- [beyond-axe]
```

Each page links to 3+ related pages. Hub page (screen-reader-testing-tool) links to all cluster members.

## Execution Phases

**Phase 1 (High-Intent):** Create pages 1-4, optimize testing-checklist, screen-reader-comparison, testing-strategy
**Phase 2 (Developer-Focused):** Create pages 5-6, optimize cicd-integration
**Phase 3 (ARIA):** Create page 7, optimize aria-roles, live-regions, common-mistakes
**Phase 4 (Cross-linking):** Add reciprocal links, update sitemap, verify no cannibalization
