# Speakable API Documentation

This document describes the programmatic API for using Speakable as a library in your Node.js applications.

## Installation

```bash
npm install speakable
```

## Quick Start

```typescript
import { parseHTML, buildAccessibilityTree, serializeModel } from 'speakable';

const html = '<button>Click me</button>';
const doc = parseHTML(html);
const result = buildAccessibilityTree(doc.document.body);
const json = serializeModel(result.model);

console.log(json);
```

## Core Modules

### Parser Module

Parse HTML into a DOM representation.

```typescript
import { parseHTML } from 'speakable/parser';
```

#### `parseHTML(html: string): ParseResult`

Parses HTML string into a DOM document with error recovery.

**Parameters:**
- `html` - HTML string to parse

**Returns:**
- `ParseResult` object with:
  - `document: Document` - jsdom Document object
  - `warnings: string[]` - Parsing warnings for malformed HTML

**Example:**

```typescript
const result = parseHTML('<button>Click me</button>');
console.log(result.document.body.innerHTML);
console.log(result.warnings); // []
```

### Extractor Module

Build accessibility trees from DOM elements.

```typescript
import { 
  buildAccessibilityTree,
  buildAccessibilityTreeWithSelector,
  computeAccessibleName,
  computeAccessibleDescription,
  computeRole
} from 'speakable/extractor';
```

#### `buildAccessibilityTree(element: Element): TreeResult`

Builds an accessibility tree from a DOM element.

**Parameters:**
- `element` - Root DOM element to analyze

**Returns:**
- `TreeResult` object with:
  - `model: AnnouncementModel` - Canonical announcement model
  - `warnings: string[]` - Extraction warnings

**Example:**

```typescript
const doc = parseHTML('<button aria-expanded="false">Menu</button>');
const result = buildAccessibilityTree(doc.document.body);

console.log(result.model.root.role); // "button"
console.log(result.model.root.name); // "Menu"
console.log(result.model.root.state.expanded); // false
```

#### `buildAccessibilityTreeWithSelector(element: Element, selector: string): SelectorResult[]`

Builds accessibility trees for elements matching a CSS selector.

**Parameters:**
- `element` - Root DOM element to search within
- `selector` - CSS selector string

**Returns:**
- Array of `SelectorResult` objects, each with:
  - `model: AnnouncementModel` - Canonical announcement model
  - `element: Element` - Matching DOM element
  - `warnings: string[]` - Extraction warnings

**Example:**

```typescript
const html = `
  <button class="primary">Submit</button>
  <button class="secondary">Cancel</button>
`;
const doc = parseHTML(html);
const results = buildAccessibilityTreeWithSelector(doc.document.body, 'button.primary');

console.log(results.length); // 1
console.log(results[0].model.root.name); // "Submit"
```

#### `computeAccessibleName(element: Element): string`

Computes the accessible name for an element following the ARIA name computation algorithm.

**Parameters:**
- `element` - DOM element

**Returns:**
- Accessible name string

**Example:**

```typescript
const doc = parseHTML('<button aria-label="Close dialog">X</button>');
const button = doc.document.querySelector('button')!;
const name = computeAccessibleName(button);

console.log(name); // "Close dialog"
```

#### `computeAccessibleDescription(element: Element): string`

Computes the accessible description for an element.

**Parameters:**
- `element` - DOM element

**Returns:**
- Accessible description string

**Example:**

```typescript
const html = `
  <button aria-describedby="help">Submit</button>
  <div id="help">Click to submit the form</div>
`;
const doc = parseHTML(html);
const button = doc.document.querySelector('button')!;
const description = computeAccessibleDescription(button);

console.log(description); // "Click to submit the form"
```

#### `computeRole(element: Element): AccessibleRole | null`

Computes the accessible role for an element.

**Parameters:**
- `element` - DOM element

**Returns:**
- `AccessibleRole` string or `null` if element has no accessible role

**Example:**

```typescript
const doc = parseHTML('<button>Click me</button>');
const button = doc.document.querySelector('button')!;
const role = computeRole(button);

console.log(role); // "button"
```

### Model Module

Work with the canonical announcement model.

```typescript
import { 
  serializeModel,
  deserializeModel,
  validateModel
} from 'speakable/model';
```

#### `serializeModel(model: AnnouncementModel): string`

Serializes a model to JSON with deterministic property ordering.

**Parameters:**
- `model` - Announcement model to serialize

**Returns:**
- JSON string

**Example:**

```typescript
const json = serializeModel(model);
console.log(json);
```

#### `deserializeModel(json: string): AnnouncementModel`

Deserializes JSON to an announcement model with validation.

**Parameters:**
- `json` - JSON string

**Returns:**
- `AnnouncementModel` object

**Throws:**
- Error if JSON is invalid or model validation fails

**Example:**

```typescript
const model = deserializeModel(json);
console.log(model.root.role);
```

#### `validateModel(model: AnnouncementModel): ValidationResult`

Validates model integrity.

**Parameters:**
- `model` - Announcement model to validate

**Returns:**
- `ValidationResult` object with:
  - `valid: boolean` - Whether model is valid
  - `errors: string[]` - Validation errors

**Example:**

```typescript
const result = validateModel(model);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### Renderer Module

Generate screen reader announcement text.

```typescript
import { 
  renderNVDA,
  renderJAWS,
  renderVoiceOver,
  renderAudit
} from 'speakable/renderer';
```

#### `renderNVDA(model: AnnouncementModel): string`

Generates NVDA-style announcement text.

**Parameters:**
- `model` - Announcement model

**Returns:**
- Announcement text string

**Example:**

```typescript
const text = renderNVDA(model);
console.log(text); // "Submit, button"
```

#### `renderJAWS(model: AnnouncementModel): string`

Generates JAWS-style announcement text.

**Parameters:**
- `model` - Announcement model

**Returns:**
- Announcement text string

**Example:**

```typescript
const text = renderJAWS(model);
console.log(text); // "Submit, button"
```

#### `renderVoiceOver(model: AnnouncementModel): string`

Generates VoiceOver-style announcement text.

**Parameters:**
- `model` - Announcement model

**Returns:**
- Announcement text string

**Example:**

```typescript
const text = renderVoiceOver(model);
console.log(text); // "Submit, button"
```

#### `renderAudit(model: AnnouncementModel): string`

Generates a developer-friendly accessibility audit report.

**Parameters:**
- `model` - Announcement model

**Returns:**
- Formatted audit report string

**Example:**

```typescript
const report = renderAudit(model);
console.log(report);
// Outputs formatted report with landmarks, headings, issues, etc.
```

### Diff Module

Compare accessibility models.

```typescript
import { computeDiff, formatDiff } from 'speakable/diff';
```

#### `computeDiff(oldModel: AnnouncementModel, newModel: AnnouncementModel): SemanticDiff`

Computes semantic differences between two models.

**Parameters:**
- `oldModel` - Original announcement model
- `newModel` - Updated announcement model

**Returns:**
- `SemanticDiff` object with:
  - `added: AccessibleNode[]` - Nodes added in new model
  - `removed: AccessibleNode[]` - Nodes removed from old model
  - `changed: NodeChange[]` - Nodes with changed properties

**Example:**

```typescript
const diff = computeDiff(oldModel, newModel);
console.log(`Added: ${diff.added.length}`);
console.log(`Removed: ${diff.removed.length}`);
console.log(`Changed: ${diff.changed.length}`);
```

#### `formatDiff(diff: SemanticDiff): string`

Formats a semantic diff as human-readable text.

**Parameters:**
- `diff` - Semantic diff object

**Returns:**
- Formatted diff string

**Example:**

```typescript
const formatted = formatDiff(diff);
console.log(formatted);
```

## Type Definitions

### Core Types

```typescript
/**
 * Model version for forward compatibility.
 */
interface ModelVersion {
  major: number;
  minor: number;
}

/**
 * Accessible role following ARIA specification.
 */
type AccessibleRole = 
  | 'button'
  | 'link'
  | 'heading'
  | 'textbox'
  | 'checkbox'
  | 'radio'
  | 'combobox'
  | 'listbox'
  | 'option'
  | 'list'
  | 'listitem'
  | 'navigation'
  | 'main'
  | 'banner'
  | 'contentinfo'
  | 'region'
  | 'img'
  | 'article'
  | 'complementary'
  | 'form'
  | 'search'
  | 'generic';

/**
 * Accessible states and properties.
 */
interface AccessibleState {
  expanded?: boolean;
  checked?: boolean | 'mixed';
  pressed?: boolean | 'mixed';
  selected?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  readonly?: boolean;
  busy?: boolean;
  current?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | false;
  grabbed?: boolean;
  hidden?: boolean;
  level?: number;
  posinset?: number;
  setsize?: number;
}

/**
 * Value for form controls and range widgets.
 */
interface AccessibleValue {
  current: string | number;
  min?: number;
  max?: number;
  text?: string;
}

/**
 * Focusability information.
 */
interface FocusInfo {
  focusable: boolean;
  tabindex?: number;
}

/**
 * Single node in the accessibility tree.
 */
interface AccessibleNode {
  role: AccessibleRole;
  name: string;
  description?: string;
  value?: AccessibleValue;
  state: AccessibleState;
  focus: FocusInfo;
  children: AccessibleNode[];
}

/**
 * Root of the canonical announcement model.
 */
interface AnnouncementModel {
  version: ModelVersion;
  root: AccessibleNode;
  metadata: {
    extractedAt: string;
    sourceHash?: string;
  };
}
```

### Result Types

```typescript
interface ParseResult {
  document: Document;
  warnings: string[];
}

interface TreeResult {
  model: AnnouncementModel;
  warnings: string[];
}

interface SelectorResult {
  model: AnnouncementModel;
  element: Element;
  warnings: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

### Diff Types

```typescript
interface SemanticDiff {
  added: AccessibleNode[];
  removed: AccessibleNode[];
  changed: NodeChange[];
}

interface NodeChange {
  path: string;
  property: string;
  oldValue: any;
  newValue: any;
}
```

## Complete Example

Here's a complete example showing how to use the API:

```typescript
import {
  parseHTML,
  buildAccessibilityTree,
  buildAccessibilityTreeWithSelector,
  serializeModel,
  renderNVDA,
  renderVoiceOver,
  renderAudit,
  computeDiff
} from 'speakable';

// Parse HTML
const html = `
  <nav aria-label="Main navigation">
    <a href="/home">Home</a>
    <a href="/about">About</a>
  </nav>
  <main>
    <h1>Welcome</h1>
    <button aria-expanded="false">Show menu</button>
  </main>
`;

const doc = parseHTML(html);

// Build full accessibility tree
const fullResult = buildAccessibilityTree(doc.document.body);
console.log('Full tree:', serializeModel(fullResult.model));

// Build tree for specific elements
const buttonResults = buildAccessibilityTreeWithSelector(
  doc.document.body,
  'button'
);
console.log('Button count:', buttonResults.length);

// Generate screen reader output
const nvdaText = renderNVDA(fullResult.model);
console.log('NVDA:', nvdaText);

const voText = renderVoiceOver(fullResult.model);
console.log('VoiceOver:', voText);

// Generate audit report
const audit = renderAudit(fullResult.model);
console.log('Audit:\n', audit);

// Compare versions
const oldHTML = '<button>Old text</button>';
const newHTML = '<button aria-expanded="true">New text</button>';

const oldDoc = parseHTML(oldHTML);
const newDoc = parseHTML(newHTML);

const oldModel = buildAccessibilityTree(oldDoc.document.body).model;
const newModel = buildAccessibilityTree(newDoc.document.body).model;

const diff = computeDiff(oldModel, newModel);
console.log('Changes:', diff.changed);
```

## Error Handling

All API functions may throw errors. Wrap calls in try-catch blocks:

```typescript
try {
  const doc = parseHTML(html);
  const result = buildAccessibilityTree(doc.document.body);
  const json = serializeModel(result.model);
} catch (error) {
  console.error('Error:', error.message);
}
```

Common error scenarios:
- Invalid HTML (recoverable with warnings)
- Invalid ARIA attributes (warnings emitted, processing continues)
- Invalid model structure (validation errors)
- Serialization failures (rare)

## Best Practices

### 1. Check Warnings

Always check the warnings array for potential issues:

```typescript
const result = buildAccessibilityTree(element);
if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}
```

### 2. Validate Models

Validate models before serialization:

```typescript
import { validateModel } from 'speakable/model';

const validation = validateModel(model);
if (!validation.valid) {
  throw new Error(`Invalid model: ${validation.errors.join(', ')}`);
}
```

### 3. Use Selectors for Performance

When analyzing large documents, use selectors to focus on specific elements:

```typescript
// Instead of building full tree
const fullTree = buildAccessibilityTree(document.body);

// Use selector for better performance
const buttons = buildAccessibilityTreeWithSelector(document.body, 'button');
```

### 4. Cache Parsed Documents

If analyzing the same HTML multiple times, cache the parsed document:

```typescript
const doc = parseHTML(html);

// Reuse doc for multiple analyses
const fullTree = buildAccessibilityTree(doc.document.body);
const buttons = buildAccessibilityTreeWithSelector(doc.document.body, 'button');
const links = buildAccessibilityTreeWithSelector(doc.document.body, 'a');
```

## TypeScript Support

Speakable is written in TypeScript and includes full type definitions. Enable strict mode for best results:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

## Runtime Module

Capture and compare accessibility behavior over the course of an interaction, not just a static snapshot. Exposed as a namespace on the main entry point.

```typescript
import { runtime } from '@reticular/speakable';
```

### `runtime.createTimelineGenerator(options): TimelineGenerator`

Creates a generator that attaches the runtime engine to a document, runs an interaction sequence, and returns an `AccessibilityTimeline`.

**Options (`TimelineGeneratorOptions`):**
- `document: Document` - the document (or iframe document) to attach to
- `componentName: string` - name recorded in timeline metadata
- `storyName?: string` - variant/story name recorded in metadata
- `settlePeriod?: number` - ms to wait after the last action (default: 500)
- `loadTimeout?: number` - max ms to wait for the document body (default: 10000)
- `heuristics?: boolean` - enable heuristic warnings (default: true)

**Returns** a `TimelineGenerator` with:
- `capture(sequence: InteractionSequence): Promise<AccessibilityTimeline>`
- `abort(): void`

**Example:**

```typescript
const generator = runtime.createTimelineGenerator({
  document,
  componentName: 'ConfirmDialog',
});

const sequence = runtime.getBuiltinPattern('modal-dialog', {
  trigger: 'button.open-dialog',
});

const timeline = await generator.capture(sequence);

for (const event of timeline.events) {
  console.log(`${event.type}: ${event.target.accessibleName}`);
}
```

### `runtime.getBuiltinPattern(name, selectors?): InteractionSequence`

Returns a predefined interaction sequence for a common ARIA widget.

**Parameters:**
- `name: 'modal-dialog' | 'combobox' | 'tabs' | 'accordion'`
- `selectors?: PatternSelectorMap` - optional overrides: `{ trigger?, container?, content?, items?, input? }`

### `runtime.executeSequence(sequence, document, onEvent, getTimestamp, settleTime?)`

Executes an `InteractionSequence` against a document, dispatching real DOM events and emitting `KEYBOARD_ACTION` events per action. Missing click targets emit a `WARNING` event and execution continues. `runtime.executeAction(action, ...)` runs a single action.

### `runtime.diffTimelines(baseline, current): BehaviorDiffReport`

Compares two timelines and returns `{ added, removed, modified, summary }`. Events match on `type` + target selector; timestamp differences alone are not modifications.

### `runtime.classifyDiff(report): ClassifiedDiffReport`

Assigns a severity (`critical | high | medium | low`) to each diff entry and returns `{ entries, highestSeverity, criticalCount, highCount, mediumCount, lowCount }`.

```typescript
const diff = runtime.diffTimelines(baselineTimeline, currentTimeline);
const classified = runtime.classifyDiff(diff);
if (classified.highestSeverity === 'critical') {
  throw new Error('Accessibility behavior regression detected');
}
```

### `runtime.createBaselineStorage(baseDir): BaselineStorage`

Filesystem-backed baseline storage for CLI/CI use. Provides `save`, `load`, `exists`, and `getBaselinePath`, keyed by component + story. (For in-browser baselines, the Storybook addon uses its own `localStorage`-backed store.)

### Other runtime exports

- `runtime.createEngine(options)` - low-level engine that collects timestamped events while attached
- `runtime.createHeuristicAnalyzer(config?)` - detects anti-patterns (focus escape, live-region flooding, unlabeled keyboard actions) without a baseline
- `runtime.analyzeVerbosity(timeline, config?)` / `runtime.formatVerbosityReport(report)` - flags redundant/duplicate announcements
- `runtime.serializeTimeline` / `runtime.deserializeTimeline` - round-trip a timeline to JSON
- `runtime.generateSelector(element)` - stable CSS selector for an element

## Browser Module

Real-browser static analysis and interaction capture, decoupled from Node.js and jsdom. Runs against live DOM in the current page. This is the engine shared by the Storybook addon, the iframe harness, and the browser extension.

```typescript
import {
  analyzeElement,
  analyzeElementWithUpgrade,
  captureTimeline,
  awaitCustomElementsReady,
} from '@reticular/speakable/browser';
```

### `analyzeElement(root, extraWarnings?): AnalysisResult`

Analyzes a live DOM element and returns per-reader output plus audit findings, stats, and warnings. Never throws on empty or detached input: it returns a well-formed empty result instead.

**Parameters:**
- `root: Element | null | undefined` - the element to analyze
- `extraWarnings?: string[]` - optional warnings to fold into the result

**Returns `AnalysisResult`:**

```typescript
interface AnalysisResult {
  nvda: string[];
  jaws: string[];
  voiceover: string[];
  narrator: string[];
  audit: AuditFinding[];   // { severity: 'error' | 'warning' | 'info'; message: string; selector: string }
  stats: {
    totalElements: number;
    interactiveElements: number;
    landmarks: number;
    headings: number;
  };
  warnings: string[];
}
```

**Example:**

```typescript
const result = analyzeElement(document.querySelector('#widget'));
console.log(result.nvda);       // ["Save changes, button", ...]
console.log(result.stats);      // { totalElements, interactiveElements, ... }
```

### `analyzeElementWithUpgrade(root, upgradeTimeoutMs?): Promise<AnalysisResult>`

Awaits custom-element upgrade (see below) before analyzing, then folds any upgrade warnings into `result.warnings`. Use this for web components that hydrate asynchronously.

### `captureTimeline(document, options): Promise<AccessibilityTimeline>`

Attaches the runtime engine to a live document, runs an interaction sequence, and returns a serializable timeline.

**Options (`CaptureOptions`):**
- `componentName: string`
- `storyName?: string`
- `sequence: InteractionSequence`
- `settlePeriod?: number`
- `awaitUpgrade?: boolean` - await custom-element upgrade first (default: true)
- `upgradeTimeoutMs?: number`

When `awaitUpgrade` is enabled, upgrade timeouts are folded into the timeline as `WARNING` events at timestamp 0.

**Example:**

```typescript
const timeline = await captureTimeline(document, {
  componentName: 'Menu',
  sequence: {
    description: 'open and arrow down',
    actions: [{ type: 'click', selector: '#menu-btn' }, { type: 'arrowDown' }],
  },
});
```

### `awaitCustomElementsReady(root, timeoutMs?): Promise<UpgradeWarning[]>`

Waits for custom elements under `root` to be defined (`customElements.whenDefined`) and, where present, to finish rendering (a Lit-style `updateComplete` promise). Bounded by `timeoutMs` (default 2000). Returns one `UpgradeWarning` (`{ tag, message }`) per element that did not upgrade in time. Never blocks indefinitely; a no-op when `customElements` is unavailable.

## Harness Module

Mount a component into an iframe and drive analysis over `postMessage`. This is the Storybook-independent way to test any component, including web components, in a real browser.

```typescript
import { createHarness } from '@reticular/speakable/harness';
```

### `createHarness(options): Harness`

**Options (`HarnessOptions`):**
- `target: HTMLIFrameElement | { container: HTMLElement }` - an existing iframe to drive, or a container to create one inside (the harness then owns and removes it on `destroy()`)
- `timeoutMs?: number` - load, inject, and request timeout (default: 10000)
- `allowedOrigins?: string[]` - origins allowed for `postMessage` (defaults to same-origin only; `'*'` disables the check)
- `bundleUrl?: string` - URL of the injectable IIFE bundle (`speakable-browser.global.js`). Omit if the bundle is already present in the iframe.

**Returns `Harness`:**
- `load(source: { url: string } | { html: string }): Promise<void>` - mount content and inject the bundle
- `analyze(selector?: string): Promise<AnalysisResult>` - static analysis in the iframe (awaits upgrade)
- `captureTimeline(options): Promise<AccessibilityTimeline>` - run a sequence in the iframe
- `destroy(): void` - remove listeners and any harness-owned iframe

**Example:**

```typescript
const harness = createHarness({
  target: { container: document.body },
  bundleUrl: '/speakable-browser.global.js',
});

await harness.load({ html: '<my-widget>Content</my-widget>' });
const result = await harness.analyze('my-widget');
const timeline = await harness.captureTimeline({
  componentName: 'MyWidget',
  sequence: { description: 'toggle', actions: [{ type: 'click', selector: 'my-widget' }] },
});
harness.destroy();
```

> The harness supports same-origin content only (`srcdoc` HTML or a same-origin URL). Cross-origin URLs are rejected with a descriptive error, because a script cannot be injected across origins.

## Node.js Version

Requires Node.js 18 or higher.

## License

MIT
