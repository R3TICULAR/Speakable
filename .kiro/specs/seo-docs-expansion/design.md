# Design: SEO Documentation Expansion

## Architecture

### Page Structure

All new documentation pages follow the existing pattern:
- File: `site/app/docs/<slug>/page.tsx`
- React Server Component (default export)
- Breadcrumb navigation at top
- Section-based layout with semantic HTML
- Consistent use of the existing design system (Tailwind classes)

### Navigation Grouping

The sidebar will be restructured into categorized groups:

```
GETTING STARTED
  → Usage Guide
  → How Screen Readers Work

GUIDES  
  → Advanced Guide
  → Focus Management
  → Live Regions & Dynamic Content
  → Keyboard Navigation
  → Accessible Forms
  → Component Patterns
  → Testing Strategy

REFERENCE
  → API Reference
  → ARIA Roles
  → Screen Reader Comparison
  → Testing Checklist
  → Glossary
  → Common Mistakes
  → Examples

INTEGRATION
  → CI/CD Integration
  → Framework Guides
  → MCP Integration
  → Spec Integration
  → Testing Ecosystem
```

### Internal Linking Strategy

Each page will include:
1. **Inline contextual links** — natural references within body text (minimum 3 per page)
2. **"Related Pages" footer** — 2-4 cards at the bottom of each page suggesting next reads
3. **"See also" callouts** — highlighted boxes linking to complementary content mid-page

### Component Reuse

New shared components:
- `RelatedPages` — Footer section with linked page cards
- `SeeAlso` — Inline callout box for cross-links
- `KeyboardShortcut` — Styled keyboard key display
- `ChecklistItem` — Interactive checklist row with copy-paste command

### Sitemap Integration

All new pages added to `site/app/sitemap.ts` with locale alternates matching the existing pattern.

## Data Flow

No new APIs or data fetching. All content is static React components rendered at build time via Next.js App Router.

## File Changes

### New Files (11 pages + 2 components)
- `site/app/docs/aria-roles/page.tsx`
- `site/app/docs/testing-checklist/page.tsx`
- `site/app/docs/how-screen-readers-work/page.tsx`
- `site/app/docs/component-patterns/page.tsx`
- `site/app/docs/live-regions/page.tsx`
- `site/app/docs/focus-management/page.tsx`
- `site/app/docs/testing-strategy/page.tsx`
- `site/app/docs/glossary/page.tsx`
- `site/app/docs/screen-reader-comparison/page.tsx`
- `site/app/docs/keyboard-navigation/page.tsx`
- `site/app/docs/accessible-forms/page.tsx`
- `site/components/RelatedPages.tsx`
- `site/components/SeeAlso.tsx`

### Modified Files
- `site/app/docs/layout.tsx` — Restructured sidebar with grouped navigation
- `site/app/sitemap.ts` — Add 11 new page entries
- All 10 existing docs pages — Add internal cross-links and Related Pages sections

## Design Decisions

1. **Static content over CMS** — Keeps deployment simple, content is version-controlled, no runtime dependencies
2. **Grouped sidebar** — Better information architecture as page count doubles; reduces cognitive load
3. **Shared components for linking** — Ensures consistent cross-link presentation and makes future pages easy to connect
4. **No client-side interactivity for most pages** — Server components for SEO (Google renders and indexes faster)
5. **ARIA Roles page uses client component** — Needs search/filter input for interactivity
