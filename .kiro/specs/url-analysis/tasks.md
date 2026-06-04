# Implementation Plan: URL Analysis

## Overview

Extend Speakable to accept live URLs as input across all three interfaces (CLI, MCP server, web tool). Implementation follows three independent phases with escalating security requirements. A shared `URL_Fetcher` module provides the core fetch logic reused by all phases.

## Tasks

- [ ] 1. Phase 1: CLI URL Fetch
  - [ ] 1.1 Create `src/cli/url-fetcher.ts` with `fetchHTML`, types, and error handling
    - Implement `FetchOptions`, `FetchResult`, and `URLFetchError` types
    - Implement `fetchHTML(url, options?)` using native `fetch()` with `AbortController` timeout
    - Handle redirect counting manually via `redirect: 'manual'`
    - Enforce size limit via Content-Length header check and streaming body read
    - Validate URL scheme (only http/https) and format (via `new URL()`)
    - Export `DEFAULT_FETCH_OPTIONS` constant
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 10.1, 10.2_

  - [ ] 1.2 Add `isURL()` helper to `src/cli/options.ts` and extend `ParsedInput`
    - Add `isURL(input: string): boolean` function checking for `http://` or `https://` prefix (case-insensitive)
    - Add `isURL: boolean` field to `ParsedInput` interface
    - Add `inputTypes?: Array<'file' | 'url'>` field to `ParsedInput` for batch mode
    - Update `parseInput()` to detect URLs and set the new fields
    - _Requirements: 1.1, 1.2_

  - [ ]* 1.3 Write property test for URL classification (Property 1)
    - **Property 1: URL Classification Biconditional**
    - Generate arbitrary strings with/without http(s):// prefix
    - Assert `isURL()` returns true iff string starts with http:// or https://
    - **Validates: Requirements 1.1, 1.2**

  - [ ] 1.4 Update `src/cli/io.ts` to support URL fetching
    - Import `fetchHTML` from `url-fetcher.ts`
    - Import `isURL` from `options.ts`
    - Add `readHTMLFromURL(url: string): Promise<string>` function
    - Update `readHTML()` to detect URLs and delegate to `readHTMLFromURL`
    - _Requirements: 1.1, 2.1_

  - [ ] 1.5 Update CLI orchestrator to handle URL inputs in all modes
    - Update `src/cli.ts` to `await` the result of `readHTML` (now always async for URLs)
    - Support URL in `--diff` flag argument position
    - Support URLs in batch mode (mixed URL + file inputs)
    - Map `URLFetchError` codes to appropriate CLI exit codes (1, 2, or 3)
    - _Requirements: 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 1.6 Add JS-warning detection to the analysis pipeline
    - After fetching, check if `<body>` visible text is fewer than 100 characters
    - Emit warning: "Page may require JavaScript to render content. URL analysis retrieves static HTML only."
    - _Requirements: 9.1, 9.2_

  - [ ]* 1.7 Write property test for JS-warning threshold (Property 7)
    - **Property 7: JS-Dependent Page Warning Threshold**
    - Generate HTML bodies with varying visible text lengths around 100-char boundary
    - Assert warning is emitted iff visible text < 100 characters
    - **Validates: Requirements 9.2**

  - [ ] 1.8 Update CLI help text to document URL support
    - Add URL examples to the help text (e.g., `speakable https://example.com`)
    - Document that URL analysis retrieves static HTML and does not execute JavaScript
    - Add note about URL support in diff and batch modes
    - _Requirements: 9.3, 1.1_

  - [ ]* 1.9 Write unit tests for `fetchHTML`
    - Test timeout behavior (AbortController fires after timeoutMs)
    - Test redirect following up to maxRedirects
    - Test size limit rejection (Content-Length and streaming)
    - Test non-2xx HTTP error codes produce URLFetchError with HTTP_ERROR code
    - Test unsupported schemes (ftp://, file://) produce UNSUPPORTED_SCHEME error
    - Test malformed URLs produce INVALID_URL error
    - Use a local HTTP server (`http.createServer`) for integration
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 10.1, 10.2_

  - [ ]* 1.10 Write property tests for URL fetcher error cases (Properties 2, 8, 9)
    - **Property 2: Non-2xx Status Error Reporting** — Generate random non-2xx status codes, assert error message contains status and URL
    - **Property 8: Unsupported Scheme Rejection** — Generate URLs with non-http(s) schemes, assert UNSUPPORTED_SCHEME error
    - **Property 9: Malformed URL Rejection** — Generate invalid URL strings, assert INVALID_URL error
    - **Validates: Requirements 2.2, 10.1, 10.2**

- [ ] 2. Checkpoint — Phase 1 complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Phase 2: MCP Server URL Support
  - [ ] 3.1 Add `analyze_url` tool to `src/mcp.ts`
    - Register tool with zod schema: `url` (string, required), `screen_reader` (enum, optional), `selector` (string, optional)
    - Fetch HTML via `fetchHTML()` from url-fetcher module
    - Pass fetched HTML through existing `analyzeHTML()` helper
    - Return error response with descriptive message on fetch failure
    - Enforce same 10s timeout and 10 MB size limit
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7_

  - [ ] 3.2 Add `audit_url` tool to `src/mcp.ts`
    - Register tool with zod schema: `url` (string, required), `selector` (string, optional)
    - Fetch HTML via `fetchHTML()` and run audit pipeline
    - Return error response with descriptive message on fetch failure
    - _Requirements: 4.5, 4.7_

  - [ ] 3.3 Add `diff_url` tool to `src/mcp.ts`
    - Register tool with zod schema: `before_url` (string, required), `after_url` (string, required), `selector` (string, optional)
    - Fetch both URLs via `fetchHTML()` and run diff pipeline
    - Return error response with descriptive message on fetch failure
    - _Requirements: 4.6, 4.7_

  - [ ]* 3.4 Write unit tests for MCP URL tools
    - Test `analyze_url` tool registration and invocation with mocked fetcher
    - Test `audit_url` tool registration and invocation
    - Test `diff_url` tool registration and invocation
    - Test error handling when URL fetch fails
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [ ] 4. Checkpoint — Phase 2 complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Phase 3: Web Tool URL Input
  - [ ] 5.1 Create `site/lib/ssrf-validator.ts` with IP validation
    - Implement `PRIVATE_IP_RANGES` constant covering 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, ::1
    - Implement `isPrivateIP(ip: string): boolean` function
    - Implement `validateURL(url: string): Promise<string>` with DNS resolution
    - Implement `fetchHTMLSafe(url, options?)` with double DNS resolution to prevent DNS rebinding
    - Validate each redirect target IP before following
    - Export `SSRFError` class
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 5.2 Write property test for private IP blocking (Property 4)
    - **Property 4: Private IP Rejection**
    - Generate IPs in all private ranges (127.x.x.x, 10.x.x.x, 172.16-31.x.x, 192.168.x.x, ::1)
    - Assert `isPrivateIP()` returns true for all generated private IPs
    - Generate public IPs and assert `isPrivateIP()` returns false
    - **Validates: Requirements 6.2**

  - [ ]* 5.3 Write property test for redirect SSRF protection (Property 5)
    - **Property 5: Private IP Rejection on Redirect Targets**
    - Generate redirect chains with a private IP at arbitrary position
    - Assert SSRF validator rejects before following the private-IP redirect
    - **Validates: Requirements 6.3**

  - [ ] 5.4 Create `site/app/api/analyze-url/route.ts` API route
    - Implement POST handler with request body parsing: `{ url, screenReader?, selector?, format? }`
    - Add Clerk authentication check (reject 401 if unauthenticated)
    - Add rate limiting: 10 requests per minute per user (reject 429 with Retry-After header)
    - Call `fetchHTMLSafe()` for SSRF-protected fetch
    - Run analysis pipeline on fetched HTML
    - Return structured result only (no raw HTML in response)
    - Map errors to appropriate HTTP status codes (400, 403, 413, 502, 504)
    - Enforce 10s timeout, 10 MB size limit, 5 max redirects
    - _Requirements: 5.2, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 5.5 Write property test for no raw HTML in API response (Property 6)
    - **Property 6: No Raw HTML in API Response**
    - Generate arbitrary HTML strings, pass through API route logic
    - Assert the JSON response does not contain the raw HTML string
    - **Validates: Requirements 6.5**

  - [ ] 5.6 Add URL input field to the web tool UI
    - Add a URL input field as an alternative to the HTML paste textarea
    - Wire form submission to POST `/api/analyze-url` with URL and options
    - Display analysis results in the same format as HTML paste analysis
    - Display error messages to the user on failure
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 5.7 Write unit tests for SSRF validator and API route
    - Test `isPrivateIP` with boundary IPs (172.15.255.255 = public, 172.16.0.0 = private)
    - Test rate limiting returns 429 with Retry-After header
    - Test authentication rejects unauthenticated requests with 401
    - Test error mapping (URLFetchError codes to HTTP statuses)
    - _Requirements: 6.2, 7.1, 7.2, 7.3_

- [ ] 6. Final checkpoint — All phases complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between phases
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The shared `URL_Fetcher` module is created in Phase 1 and reused by Phases 2 and 3
- All code uses TypeScript with Node.js native `fetch()` — no new dependencies added

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "1.6"] },
    { "id": 3, "tasks": ["1.7", "1.8", "1.9", "1.10"] },
    { "id": 4, "tasks": ["3.1", "3.2", "3.3"] },
    { "id": 5, "tasks": ["3.4", "5.1"] },
    { "id": 6, "tasks": ["5.2", "5.3", "5.4"] },
    { "id": 7, "tasks": ["5.5", "5.6", "5.7"] }
  ]
}
```
