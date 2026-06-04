# Requirements Document

## Introduction

URL-based analysis extends Speakable to accept live URLs as input, fetching page HTML and running it through the existing accessibility analysis pipeline. The feature is delivered in three independent phases with escalating security requirements: CLI URL fetch (zero risk), MCP server URL support (low risk), and web tool URL input (requires SSRF protection).

## Glossary

- **CLI**: The `speakable` command-line interface defined in `src/cli.ts`
- **MCP_Server**: The Model Context Protocol server defined in `src/mcp.ts` that exposes analysis tools to AI assistants
- **Web_Tool**: The Next.js web application in `site/` that provides browser-based accessibility analysis
- **URL_Fetcher**: A module responsible for fetching HTML content from a URL using Node.js native `fetch()`
- **Analysis_Pipeline**: The existing HTML parsing, accessibility tree extraction, and rendering pipeline
- **SSRF**: Server-Side Request Forgery — an attack where a server is tricked into making requests to unintended internal resources
- **Private_IP**: IP addresses in ranges reserved for local networks (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, ::1)
- **DNS_Rebinding**: An attack where a hostname resolves to a public IP initially but changes to a private IP on subsequent lookups
- **SSRF_Validator**: A module that validates URLs against a blocklist of private and internal IP addresses

## Requirements

### Requirement 1: CLI URL Detection

**User Story:** As a developer, I want the CLI to automatically detect URL inputs so that I can analyze live web pages without extra flags.

#### Acceptance Criteria

1. WHEN an input argument starts with `http://` or `https://`, THE CLI SHALL treat the argument as a URL and fetch its HTML content
2. WHEN an input argument does not start with `http://` or `https://`, THE CLI SHALL treat the argument as a file path (preserving existing behavior)
3. THE CLI SHALL support URLs in all positions where file paths are currently accepted, including the `--diff` flag argument
4. IF a URL is provided in a position where URL fetching fails, THEN THE CLI SHALL exit with a descriptive error message specific to that position and context

### Requirement 2: CLI URL Fetching

**User Story:** As a developer, I want the CLI to fetch HTML from URLs reliably so that I can analyze any publicly accessible web page.

#### Acceptance Criteria

1. WHEN a URL is detected, THE URL_Fetcher SHALL retrieve the HTML content using Node.js native `fetch()` without adding external dependencies
2. WHEN the URL response has a non-2xx HTTP status code, THE CLI SHALL exit with error code 3 and display the HTTP status code and URL in the error message
3. WHEN the URL fetch exceeds 10 seconds, THE CLI SHALL abort the request and exit with error code 3 and a timeout error message
4. WHEN the fetched content exceeds 10 MB, THE CLI SHALL reject the response and exit with error code 2 and a size limit error message
5. WHEN the URL requires following redirects, THE URL_Fetcher SHALL follow a maximum of 5 redirects
6. IF the redirect limit is exceeded, THEN THE CLI SHALL exit with error code 3 and a redirect loop error message

### Requirement 3: CLI URL Integration with Existing Flags

**User Story:** As a developer, I want all existing CLI flags to work with URL inputs so that I have the same analysis capabilities regardless of input source.

#### Acceptance Criteria

1. THE CLI SHALL support the `-f` format flag with URL inputs, producing json, text, audit, or both output
2. THE CLI SHALL support the `-s` screen-reader flag with URL inputs, simulating nvda, jaws, voiceover, narrator, or all
3. THE CLI SHALL support the `--selector` flag with URL inputs, filtering analysis to matching CSS elements
4. THE CLI SHALL support diff mode with URLs: `speakable <url> --diff <url-or-file>` comparing accessibility trees from two sources
5. THE CLI SHALL support batch mode with multiple URL inputs: `speakable --batch <url1> <url2>`
6. THE CLI SHALL support mixed inputs in batch mode, combining URLs and file paths in the same command

### Requirement 4: MCP Server URL Support

**User Story:** As an AI assistant user, I want the MCP server to accept URLs so that I can analyze live web pages directly from my AI workflow.

#### Acceptance Criteria

1. THE MCP_Server SHALL expose an `analyze_url` tool that accepts a `url` parameter and an optional `screen_reader` parameter and an optional `selector` parameter
2. WHEN the `analyze_url` tool is called, THE MCP_Server SHALL fetch the URL using the same URL_Fetcher module as the CLI
3. WHEN the URL fetch fails or returns a non-2xx HTTP status, THE MCP_Server SHALL return an error response with a descriptive message including the HTTP status or timeout reason
4. IF the URL fetch succeeds but the response cannot be parsed or processed, THEN THE MCP_Server SHALL return an error response describing the processing failure
5. THE MCP_Server SHALL expose an `audit_url` tool that accepts a `url` parameter and an optional `selector` parameter
6. THE MCP_Server SHALL expose a `diff_url` tool that accepts `before_url` and `after_url` parameters and an optional `selector` parameter
7. THE MCP_Server SHALL enforce the same 10-second timeout and 10 MB size limit as the CLI

### Requirement 5: Web Tool URL Input

**User Story:** As a website visitor, I want to enter a URL in the web analyzer tool so that I can analyze pages without copying their HTML source.

#### Acceptance Criteria

1. THE Web_Tool SHALL display a URL input field as an alternative to the HTML paste textarea
2. WHEN a user submits a URL, THE Web_Tool SHALL send a POST request to `/api/analyze-url` with the URL and analysis options
3. THE Web_Tool SHALL display the analysis results in the same format as HTML paste analysis
4. IF the URL analysis fails, THEN THE Web_Tool SHALL display the error message to the user

### Requirement 6: Web Tool SSRF Protection

**User Story:** As a platform operator, I want the web tool to prevent SSRF attacks so that the server cannot be used to probe internal networks.

#### Acceptance Criteria

1. WHEN a URL is submitted to `/api/analyze-url`, THE SSRF_Validator SHALL resolve the hostname to an IP address before fetching
2. IF the resolved IP address is in a Private_IP range (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, or ::1), THEN THE SSRF_Validator SHALL reject the request with a 403 status and a "URL resolves to a private address" error message
3. WHEN following redirects, THE SSRF_Validator SHALL validate each redirect target IP address against the Private_IP blocklist before following
4. THE SSRF_Validator SHALL resolve the hostname and verify the IP address a second time immediately before establishing the connection, to prevent DNS_Rebinding attacks
5. THE `/api/analyze-url` endpoint SHALL return only the structured analysis result and SHALL NOT include raw HTML content in the response

### Requirement 7: Web Tool Rate Limiting

**User Story:** As a platform operator, I want rate limiting on URL analysis so that the service cannot be abused for web scraping or denial-of-service.

#### Acceptance Criteria

1. THE `/api/analyze-url` endpoint SHALL enforce a rate limit of 10 requests per minute per authenticated user
2. WHEN the rate limit is exceeded, THE `/api/analyze-url` endpoint SHALL return HTTP 429 with a "Rate limit exceeded" error message and a `Retry-After` header
3. THE `/api/analyze-url` endpoint SHALL require authentication and reject unauthenticated requests with HTTP 401

### Requirement 8: Web Tool URL Fetch Constraints

**User Story:** As a platform operator, I want web tool URL fetches to be bounded so that the server is protected from slow or oversized responses.

#### Acceptance Criteria

1. THE `/api/analyze-url` endpoint SHALL enforce a 10-second fetch timeout
2. THE `/api/analyze-url` endpoint SHALL reject responses exceeding 10 MB with a descriptive error message
3. WHEN following redirects, THE `/api/analyze-url` endpoint SHALL follow a maximum of 5 redirects
4. IF the redirect limit is exceeded, THEN THE `/api/analyze-url` endpoint SHALL return HTTP 400 with a "Too many redirects" error message

### Requirement 9: JavaScript-Dependent Page Limitation

**User Story:** As a developer, I want clear feedback when analyzing JavaScript-rendered pages so that I understand why analysis results may be incomplete.

#### Acceptance Criteria

1. THE URL_Fetcher SHALL retrieve static HTML only and SHALL NOT execute JavaScript
2. WHEN the fetched HTML contains fewer than 100 characters of visible text content within the `<body>`, THE Analysis_Pipeline SHALL emit a warning suggesting the page may require JavaScript rendering
3. THE CLI help text SHALL document that URL analysis retrieves static HTML and does not execute JavaScript

### Requirement 10: URL Scheme Validation

**User Story:** As a developer, I want the tool to reject non-HTTP URLs so that only supported protocols are used.

#### Acceptance Criteria

1. WHEN a URL with a scheme other than `http` or `https` is provided, THE URL_Fetcher SHALL reject the input with an "Unsupported URL scheme" error message
2. WHEN a URL is malformed or cannot be parsed, THE URL_Fetcher SHALL reject the input with an "Invalid URL" error message
