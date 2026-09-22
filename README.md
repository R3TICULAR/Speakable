# Speakable

Predict how NVDA, JAWS, VoiceOver, and Windows Narrator interpret your HTML, and detect accessibility behavior regressions during component interaction. Catch screen reader issues early, analyze runtime focus management, and prevent regressions in CI/CD.

**Try it in your browser:** [getspeakable.dev/tool](https://getspeakable.dev/tool)

Speakable bridges the gap between rule-based linting tools (like axe) and manual screen reader testing. It provides both static HTML analysis and runtime accessibility behavior tracking, giving you automated insight into how assistive technologies interpret your UI throughout the development lifecycle.

> Screen reader output is heuristic and may differ from actual behavior. Speakable complements manual testing — it doesn't replace it.

## Installation

```bash
npm install @reticular/speakable
```

Or install globally for CLI usage:

```bash
npm install -g @reticular/speakable
```

## Quick Start

```bash
# Analyze an HTML file (JSON output)
speakable page.html

# Get screen reader announcement text
speakable page.html -f text -s nvda

# Generate an accessibility audit report
speakable page.html -f audit

# Compare two versions for regressions
speakable new.html --diff old.html

# Pipe from stdin
cat page.html | speakable -
```

> For quick one-off checks, you can also paste HTML directly into the [web analyzer](https://getspeakable.dev/tool) — same engine, no setup.

## Web Analyzer

If you want to test HTML quickly without installing anything, paste it directly into the web analyzer at [getspeakable.dev/tool](https://getspeakable.dev/tool). It runs the same simulation engine in the browser — supports NVDA, JAWS, VoiceOver, and Narrator output, CSS selector filtering, and diff mode. Useful for quick iteration, debugging a specific component, or sharing results with teammates who don't have the CLI installed.

## CLI Reference

```
Usage: speakable [options] [input...]

Analyze HTML accessibility announcements and generate screen reader output

Arguments:
  input                         HTML file path(s) or "-" for stdin

Options:
  -v, --version                 Output the current version
  -o, --output <path>           Output file path (default: stdout)
  -f, --format <format>         Output format (default: "json")
  -s, --screen-reader <reader>  Screen reader to simulate (default: "nvda")
  --selector <selector>         CSS selector to filter elements
  --validate                    Validate round-trip serialization
  --diff <file>                 Compare with another HTML file
  --batch                       Process multiple files in batch mode
  -h, --help                    Display help for command
```

## Output Formats

| Format | Flag | Description |
|--------|------|-------------|
| JSON | `-f json` | Canonical accessibility model as JSON. Best for CI/CD and programmatic use. |
| Text | `-f text` | Screen reader announcement text. Human-readable output showing what each reader would say. |
| Audit | `-f audit` | Developer-friendly audit report with landmark structure, heading hierarchy, interactive elements, and issue detection. |
| Both | `-f both` | JSON and text output combined. |

## Screen Readers

| Reader | Flag | Platform |
|--------|------|----------|
| NVDA | `-s nvda` | Windows |
| JAWS | `-s jaws` | Windows |
| VoiceOver | `-s voiceover` | macOS |
| Narrator | `-s narrator` | Windows |
| All | `-s all` | All four readers side by side |

Each renderer produces heuristic output approximating the real screen reader's behavior. Key differences are preserved — for example, NVDA says "navigation landmark" while JAWS says "navigation region", VoiceOver says "navigation", and Narrator says "navigation".

## Features

### Semantic Diff

Compare two HTML files and see exactly what changed in the accessibility tree:

```bash
speakable new-version.html --diff old-version.html
speakable new-version.html --diff old-version.html -f text
```

The diff identifies added, removed, and changed nodes with specific property-level details (name changes, role changes, state changes, focus changes).

### CSS Selector Filtering

Focus analysis on specific elements:

```bash
# Analyze only buttons
speakable page.html --selector "button"

# Analyze a specific component
speakable page.html --selector ".my-component"

# Analyze all interactive elements
speakable page.html --selector "button, a, input, select"
```

### Batch Processing

Analyze multiple files in a single run:

```bash
speakable --batch file1.html file2.html file3.html
```

Batch mode continues processing even if individual files fail, and reports a summary at the end.

### Audit Reports

Generate comprehensive accessibility reports:

```bash
speakable page.html -f audit
```

The audit report includes:
- Landmark structure analysis
- Heading hierarchy validation (detects skipped levels)
- Interactive element inventory with state tracking
- Missing accessible name detection
- Severity-coded issues (errors, warnings, info)
- Overall assessment with remediation suggestions

### Colorized Output

When outputting to a terminal, Speakable automatically colorizes human-readable formats:
- Section headers in cyan
- Errors in red, warnings in yellow, info in blue
- Success indicators in green
- Role names in cyan, element names in bold, states in yellow

Colors are automatically disabled when piping to files or other commands.

### Round-Trip Validation

Verify that the accessibility model serializes and deserializes consistently:

```bash
speakable page.html --validate
```

## Runtime Accessibility Analysis

Beyond static HTML analysis, Speakable tracks accessibility behavior during component interaction: focus transitions, ARIA state changes, live region announcements, and dialog lifecycle events.

### CLI Usage

```bash
# Analyze runtime behavior of a URL
speakable runtime https://localhost:3000/settings

# Use a built-in interaction pattern
speakable runtime https://localhost:3000 --interaction modal-dialog

# Analyze all Storybook stories
speakable runtime http://localhost:6006 --storybook

# Filter to specific components
speakable runtime http://localhost:6006 --storybook --story "Dialog*"

# Save baselines for regression detection
speakable runtime http://localhost:6006 --storybook --runtime-snapshot ./baselines

# CI mode: fail on behavior regressions
speakable runtime http://localhost:6006 --storybook --runtime-snapshot ./baselines --runtime-ci

# Authenticate with protected Storybook instances
speakable runtime https://storybook.internal.co --storybook \
  --storybook-auth-header "Bearer your-token"
```

### Programmatic API

```typescript
import { runtime } from '@reticular/speakable';

const generator = runtime.createTimelineGenerator({
  document: myDocument,
  componentName: 'SettingsDialog',
});

const sequence = runtime.getBuiltinPattern('modal-dialog', {
  trigger: 'button.open-settings',
});

const timeline = await generator.capture(sequence);

// Inspect events
timeline.events.forEach(event => {
  console.log(`${event.type}: ${event.target.accessibleName}`);
});

// Check for warnings (focus escape, missing announcements, etc.)
timeline.warnings.forEach(w => {
  console.warn(w.payload.message);
});
```

### Built-in Interaction Patterns

| Pattern | What it tests |
|---------|---------------|
| `modal-dialog` | Focus moves to dialog, stays trapped, returns on close |
| `combobox` | Options announced on arrow navigation, selection confirmed |
| `tabs` | Arrow keys switch tabs, panel content communicated |
| `accordion` | Expanded/collapsed state announced on toggle |

### Heuristic Warnings

The runtime engine automatically detects common anti-patterns without needing a baseline:

- Focus not moved into modal dialog on open
- Focus escaped modal dialog (broken focus trap)
- Rapid announcements (aria-live flooding)
- Keyboard action with no accessibility response
- Focused element removed without focus management

### Behavior Diffing and Regression Detection

Compare accessibility timelines across builds to catch regressions:

```typescript
import { runtime } from '@reticular/speakable';

const diff = runtime.diffTimelines(baselineTimeline, currentTimeline);
// diff.added, diff.removed, diff.modified

const classified = runtime.classifyDiff(diff);
// classified.highestSeverity: 'critical' | 'high' | 'medium' | 'low'
```

Severity levels:
- **Critical**: Focus loss, modal focus escape, missing required announcements
- **High**: Incorrect focus restoration, keyboard navigation regression
- **Medium**: Additional announcements, accessible name changes
- **Low**: Timing differences, non-breaking behavior changes

### Storybook Integration

There are two ways to use Speakable with Storybook: the **in-editor addon** (see timelines while you develop) and the **CLI adapter** (analyze the whole library headlessly in CI).

**In-editor addon** — adds a "Screen Readers" panel with per-reader tabs, an Audit tab, plus **Timeline** and **Diff** tabs for interaction testing:

```typescript
// .storybook/main.ts
const config = {
  addons: ['@reticular/storybook-addon-speakable'],
};
export default config;
```

Static tabs work with zero config. To capture an interaction timeline for a story, add `parameters.speakable` with either a named built-in `pattern` or a full `sequence`:

```typescript
export const Dialog = {
  render: () => renderDialog(),
  parameters: {
    speakable: {
      pattern: 'modal-dialog', // 'modal-dialog' | 'combobox' | 'tabs' | 'accordion'
      selectors: { trigger: 'button.open', container: '[role="dialog"]' },
    },
  },
};

export const Disclosure = {
  render: () => renderDisclosure(),
  parameters: {
    speakable: {
      sequence: {
        description: 'Tab to the toggle and open it',
        actions: [{ type: 'tab' }, { type: 'enter' }],
      },
    },
  },
};
```

The sequence runs automatically after the story renders; the Timeline tab shows the resulting focus moves, ARIA state changes, live-region announcements, and dialog events. Click **Set baseline** on the Timeline tab, and the Diff tab will flag behavioral regressions (severity-classified) on subsequent renders. See the [addon README](./addon-speakable/README.md) for the full `parameters.speakable` reference.

**CLI adapter** — connect to a running Storybook instance to analyze behavior across your library headlessly:

```typescript
import { createStorybookAdapter, createStoryLoader } from '@reticular/speakable/storybook';

const adapter = createStorybookAdapter({
  url: 'http://localhost:6006',
  componentFilter: 'Dialog*',
  authHeader: 'Bearer token',  // for protected instances
});

await adapter.connect();
const stories = await adapter.discoverStories();
```

The Storybook pipeline discovers stories, loads them in isolation, runs interaction patterns, and produces timelines that can be baselined and compared. Works with Storybook 7.x and 8.x.

> See the [Runtime Analysis docs](https://getspeakable.dev/docs/runtime-analysis) for interactive demos and full API reference.

### Browser Bundle and Iframe Harness

For runtime testing outside Storybook — including web components (Lit, shadow DOM) that need a real browser — Speakable ships two transport-agnostic entry points.

**`@reticular/speakable/browser`** runs analysis and capture directly against live DOM in the current page:

```typescript
import { analyzeElement, captureTimeline } from '@reticular/speakable/browser';

// Static analysis of a live element (per-reader output + audit + stats + warnings)
const result = analyzeElement(document.querySelector('#widget'));
console.log(result.nvda);

// Capture an interaction timeline against the live document
const timeline = await captureTimeline(document, {
  componentName: 'Menu',
  sequence: {
    description: 'open and arrow down',
    actions: [{ type: 'click', selector: '#menu-btn' }, { type: 'arrowDown' }],
  },
});
```

**`@reticular/speakable/harness`** mounts a component into an iframe (via a URL or an HTML string), injects the bundle, and drives analysis over `postMessage` — so you can test any component in isolation in a real browser. Custom elements are awaited (`whenDefined` / Lit `updateComplete`) before analysis, and open shadow roots with `<slot>` projection are handled:

```typescript
import { createHarness } from '@reticular/speakable/harness';

const harness = createHarness({
  target: { container: document.body },      // harness creates + owns the iframe
  bundleUrl: '/speakable-browser.global.js', // the injectable IIFE bundle
});

await harness.load({ html: '<my-widget>Content</my-widget>' });
const result = await harness.analyze('my-widget');
const timeline = await harness.captureTimeline({
  componentName: 'MyWidget',
  sequence: { description: 'toggle', actions: [{ type: 'click', selector: 'my-widget' }] },
});
harness.destroy();
```

The harness supports same-origin content only (`srcdoc` HTML or a same-origin URL); cross-origin URLs are rejected with a descriptive error, since a script can't be injected across origins. See [`examples/harness-demo.html`](./examples/harness-demo.html) for a runnable simple + complex (Lit-style shadow DOM) example.

## MCP Integration (AI Assistants)

Speakable includes a Model Context Protocol (MCP) server that lets AI coding assistants analyze accessibility in real-time. Ask your assistant "check if this component is accessible" and it calls Speakable automatically.

### Setup

Add to your MCP config (Kiro, VS Code, Cursor, Claude Desktop, Windsurf):

```json
{
  "mcpServers": {
    "speakable": {
      "command": "npx",
      "args": ["-y", "@reticular/speakable-mcp"]
    }
  }
}
```

### Available Tools

| Tool | Description |
|------|-------------|
| `analyze_html` | Predict screen reader output for NVDA, JAWS, VoiceOver, and Narrator |
| `audit_html` | Generate accessibility audit report with issues and remediation |
| `diff_html` | Compare two HTML versions for accessibility regressions |
| `analyze_runtime` | Run runtime accessibility analysis with interaction sequences |
| `diff_runtime` | Compare two accessibility timelines for behavior regressions |

All tools run locally — no network requests, no data leaves your machine. See the [MCP Integration docs](https://getspeakable.dev/docs/mcp-integration) for full setup instructions.

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Speakable
  run: npx @reticular/speakable page.html -f audit

- name: Check for regressions
  run: npx @reticular/speakable new.html --diff baseline.html -f text
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success — analysis completed, no issues |
| 1 | User error — invalid arguments or options |
| 2 | Content error — accessibility issues found, or diff detected changes |
| 3 | System error — file not found, I/O failure |

Use exit codes in CI to fail builds on regressions:

```bash
speakable new.html --diff baseline.html || echo "Accessibility regression detected"
```

## Programmatic API

Speakable can also be used as a library:

```typescript
import {
  parseHTML,
  buildAccessibilityTree,
  serializeModel,
  renderNVDA,
  renderJAWS,
  renderVoiceOver,
  renderAuditReport,
  diffAccessibilityTrees,
} from '@reticular/speakable';

const html = '<button aria-label="Submit">Pay</button>';
const doc = parseHTML(html);
const result = buildAccessibilityTree(doc.document.body);

// Screen reader output
console.log(renderNVDA(result.model));    // "Submit, button"
console.log(renderJAWS(result.model));    // "Submit, button"
console.log(renderVoiceOver(result.model)); // "button, Submit"

// JSON model
console.log(serializeModel(result.model));

// Audit report
console.log(renderAuditReport(result.model));
```

## How It Works

Speakable processes HTML through a four-stage pipeline:

1. **Parser** — Parses HTML into a DOM using jsdom with lenient error recovery
2. **Extractor** — Walks the DOM and builds a canonical accessibility tree following the ARIA spec (role computation, accessible name calculation, state extraction, focus detection)
3. **Model** — Produces a deterministic, serializable `AnnouncementModel` suitable for snapshot testing and diffing
4. **Renderers** — Transforms the model into screen reader-specific announcement text, applying each reader's unique patterns

## What Speakable Catches

- Missing accessible names on buttons, links, and form controls
- Heading hierarchy violations (skipped levels, wrong starting level)
- Unnamed landmarks that should have labels
- Duplicate landmarks without distinguishing names
- ARIA attribute issues and invalid values
- Changes in screen reader output between code versions (via diff)

## What Speakable Does Not Do

- Replace manual screen reader testing with real assistive technology
- Guarantee WCAG compliance
- Perfectly replicate screen reader behavior (output is heuristic)
- Execute JavaScript in static analysis mode (use the CLI `runtime` command, the Storybook addon's Timeline, or the browser/harness entry points for dynamic content)

Use Speakable to catch issues early and reduce the manual testing burden. Validate critical flows with real screen readers.

## Best Practices

1. **Run in CI** — Add Speakable to your build pipeline to catch regressions on every PR
2. **Use semantic diff** — Compare before/after HTML to detect accessibility changes
3. **Focus with selectors** — Use `--selector` to analyze specific components rather than entire pages
4. **Check all readers** — Use `-s all` to see cross-platform differences
5. **Start with audit** — Use `-f audit` for a quick overview of accessibility health
6. **Save baselines** — Store JSON output as baselines for regression detection
7. **Use the web tool for debugging** — Paste HTML into [getspeakable.dev/tool](https://getspeakable.dev/tool) when you need fast visual feedback during development

## Requirements

- Node.js 18 or higher

## License

MIT
