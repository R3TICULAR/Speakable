# Changelog

All notable changes to [@reticular/speakable](https://www.npmjs.com/package/@reticular/speakable) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-06-15

### Added
- Runtime Accessibility Analysis engine with 4 DOM observers (mutation, focus, ARIA attribute, live region)
- Interaction simulation system (click, type, tab, escape, arrow keys)
- Accessibility pattern detection (modal dialogs, comboboxes, tab panels, accordions, live regions)
- Heuristic scoring for runtime accessibility quality
- Timeline generator producing ordered accessibility event sequences
- Storybook adapter with story discovery, HTML loader pipeline, and auth header support for protected instances
- Runtime diff engine with severity classification (critical, major, minor, info)
- Baseline storage for regression tracking across builds
- CLI `runtime` command for analyzing live component behavior
- MCP tools for runtime analysis (`analyze_runtime`, `runtime_diff`, `runtime_baseline`)
- Interactive RuntimeDemo and TimelineVisualizer components on the docs site
- RuntimeSandbox component in the web analyzer tool (paste HTML, capture events in real time)
- Dedicated runtime analysis documentation page
- Design systems documentation page with animated pipeline visuals
- 11 new SEO documentation pages (ARIA roles, testing checklist, screen reader internals, component patterns, live regions, focus management, testing strategy, glossary, screen reader comparison, keyboard navigation, accessible forms)
- Cross-linking between all documentation pages via RelatedPages/SeeAlso components
- Pricing page runtime analysis tiers and FAQ section
- Analyzer nav link gradient styling
- 14-day free trial on Stripe checkout

### Changed
- Updated hero landing page text across all locales
- Updated pricing page with "Accessibility Doesn't Stop at Static HTML" positioning
- Updated landing page feature 4 to "Runtime Accessibility Analysis"
- Restructured docs sidebar into 4 category groups
- Updated README with full runtime analysis documentation section
- Updated sitemap with all new documentation pages

### Fixed
- OAuth SSO callback infinite spinner (replaced custom pages with Clerk's `AuthenticateWithRedirectCallback`)
- Forgot password flow (implemented full Clerk `reset_password_email_code` strategy)
- TS6133 build errors (unused `maxWindow` in heuristics.ts, unused `document` param in selector.ts)
- Storybook adapter test assertions for auth header options object
- RuntimeSandbox iframe mounting timing (callback ref pattern)

## [1.3.0] - 2026-06-03

### Added
- Microsoft Narrator heuristic renderer
- Narrator-specific announcement patterns and verbosity levels
- Narrator documentation and usage examples
- Dogfood CI pipeline step running against site pages

### Changed
- Updated CI pipeline for screen reader simulation job
- Refreshed dependency tree

## [1.2.0] - 2026-05-12

### Added
- Security audit tooling and report generation
- Type check validation in CI pipeline

### Changed
- Version bump for security audit release
- Resolved type check failures

### Fixed
- TypeScript build errors from type checking additions

## [1.1.1] - 2026-05-12

### Changed
- Updated README documentation with expanded usage examples

## [1.1.0] - 2026-05-12

### Added
- MCP (Model Context Protocol) server with `analyze_html`, `diff_html`, and `audit_html` tools
- Chrome browser extension foundation (manifest v3, content script, popup UI)
- Guidepup tandem usage documentation
- Localization support (Spanish, Japanese) with cookie consent prompt
- npm package footer link on site
- Advanced usage documentation
- Svelte framework integration docs
- Common mistakes documentation updates

### Changed
- Updated landing page with scroll reveal animations
- Mobile breakpoint and resizing fixes
- Extension CSS filtering improvements

### Fixed
- Report bug redirect URL
- Mobile navigation login button
- Extension CSS selector filtering

## [1.0.3] - 2026-05-04

### Added
- Voice announcer feature (text-to-speech preview of screen reader output)
- Dynamic version display on landing page
- Discord community integration

### Changed
- Styling updates across site components

## [1.0.2] - 2026-04-14

### Added
- Web analyzer tool documentation
- Scroll reveal component on documentation pages
- More usage example docs and framework guidance

### Changed
- Updated docs to reference web tool capabilities
- Added scroll reveal animations to pages

### Fixed
- Mobile dropdown navigation
- Mobile styling inconsistencies

## [1.0.1] - 2026-04-12

### Added
- Landing page with feature sections, pricing, and CTA
- Privacy policy, terms of service, and security pages
- Site logo and branding assets
- Picocolors dependency for CLI output formatting
- Dogfood pipeline step in CI
- Tab order fixes for site navigation

### Changed
- Theme and styling updates
- Landing page refresh with improved layout
- README expansion with installation and usage docs

### Fixed
- TypeScript CI build error
- Picocolors package resolution
- Various bugfixes and code cleanup

## [1.0.0] - 2026-03-05

### Added
- Initial release of Speakable CLI
- HTML parsing with error recovery (jsdom)
- Accessibility tree extraction following ARIA specification
- Canonical Announcement Model (JSON-serializable, deterministic)
- NVDA heuristic renderer
- JAWS heuristic renderer
- VoiceOver heuristic renderer
- Developer-friendly audit report renderer
- CSS selector filtering (`--selector` flag)
- Semantic diff between two HTML inputs (`--diff`)
- Round-trip validation mode
- Batch processing for multiple files
- CI-friendly exit codes (0: pass, 1: warnings, 2: errors, 3: fatal)
- Property-based tests with fast-check
- Full TypeScript type definitions
- Web app MVP with online analyzer tool

[1.4.0]: https://github.com/R3TICULAR/AnnounceKit/compare/v1.0.2...HEAD
[1.3.0]: https://github.com/R3TICULAR/AnnounceKit/compare/v1.0.2...HEAD
[1.2.0]: https://github.com/R3TICULAR/AnnounceKit/compare/v1.0.2...HEAD
[1.1.1]: https://github.com/R3TICULAR/AnnounceKit/compare/v1.0.2...HEAD
[1.1.0]: https://github.com/R3TICULAR/AnnounceKit/compare/v1.0.2...HEAD
[1.0.3]: https://github.com/R3TICULAR/AnnounceKit/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/R3TICULAR/AnnounceKit/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/R3TICULAR/AnnounceKit/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/R3TICULAR/AnnounceKit/releases/tag/v1.0.1
