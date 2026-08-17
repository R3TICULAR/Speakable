# Technical Design: Storybook Addon Speakable

## Overview

A portable Storybook addon that displays predicted screen reader output (NVDA, JAWS, VoiceOver, Narrator) in a panel for the currently rendered story. The addon runs entirely in the browser, requires zero configuration beyond adding it to the addons array, and works across all Storybook 8.x framework adapters. The critical technical insight is that the preset module must output CommonJS (for Storybook's Node-based builder) while the manager and preview bundles output ESM (for the browser).

## Architecture

The addon follows Storybook 8.x's two-context architecture:

```
┌─────────────────────────────────────────────────────────────┐
│ MANAGER (main window)                                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Panel: "Screen Readers"                                 │ │
│  │  ┌──────┐ ┌──────┐ ┌──────────┐ ┌────────┐ ┌───────┐ │ │
│  │  │ NVDA │ │ JAWS │ │ VoiceOver│ │Narrator│ │ Audit │ │ │
│  │  └──────┘ └──────┘ └──────────┘ └────────┘ └───────┘ │ │
│  │  [stats bar]                                            │ │
│  │  [predicted output lines]                               │ │
│  │  [footer: disclaimer + link]                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ▲                                   │
│                          │ Channel event: EVENT_RESULT       │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│ PREVIEW (story iframe)   │                                   │
│                          │                                   │
│  ┌───────────────────────┴────────────────────────────────┐ │
│  │ Decorator: withSpeakable                                │ │
│  │   1. Story renders                                      │ │
│  │   2. requestAnimationFrame + setTimeout(100ms)          │ │
│  │   3. Find story root element                            │ │
│  │   4. Run analyzeDOM(root)                               │ │
│  │   5. Emit result via Storybook channel                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Rendered Story (user's component)                        │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

The addon consists of 4 entry points built as separate ESM bundles:
- `preset.ts`: Tells Storybook where to find manager and preview bundles
- `manager.tsx`: Panel UI that renders in the main Storybook window
- `preview.ts`: Decorator that runs in the story iframe
- `index.ts`: Shared constants (addon ID, event names)

## Components and Interfaces

### Package Exports (`package.json`)

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./preset": "./dist/preset.js",
    "./manager": "./dist/manager.js",
    "./preview": "./dist/preview.js"
  }
}
```

### Preset Module (`src/preset.ts`)

This is the critical missing piece. Storybook 8.x resolves addons by importing `{package}/preset` and calling these functions:

```typescript
import { join, dirname } from 'path';

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

export function managerEntries(entry: string[] = []): string[] {
  return [...entry, require.resolve('./manager')];
}

export function previewAnnotations(entry: string[] = []): string[] {
  return [...entry, require.resolve('./preview')];
}
```

Note: `preset.ts` runs in Node.js (not the browser) because Storybook's builder uses it at build time. It must use CommonJS-compatible `require.resolve` patterns even though the output bundles are ESM.

### Analyzer Interface (`src/analyzer.ts`)

Already implemented. Public API:

```typescript
interface AnalysisResult {
  nvda: string[];
  jaws: string[];
  voiceover: string[];
  narrator: string[];
  audit: AuditFinding[];
  stats: {
    totalElements: number;
    interactiveElements: number;
    landmarks: number;
    headings: number;
  };
}

interface AuditFinding {
  severity: 'error' | 'warning' | 'info';
  message: string;
  selector: string;
}

function analyzeDOM(root: Element): AnalysisResult;
```

### Channel Events

```typescript
const ADDON_ID = 'speakable';
const PANEL_ID = 'speakable/panel';
const EVENT_RESULT = 'speakable/result';
```

### Panel Component Props

The panel receives `AnalysisResult` via the channel and renders tabs:

```typescript
type ReaderTab = 'nvda' | 'jaws' | 'voiceover' | 'narrator' | 'audit';
```

## Data Models

### Analysis Pipeline (browser-side, no jsdom)

```
Element (live DOM)
  → buildTree(element): AccessibleNode
    → role: getRole(element)         // explicit role attr || implicit from tagName
    → name: getAccessibleName(element) // aria-labelledby > aria-label > <label> > alt > textContent
    → states: getStates(element)     // aria-expanded, aria-selected, etc.
    → children: [...recurse]

AccessibleNode
  → renderNVDA(node): string[]
  → renderVoiceOver(node): string[]
  → renderJAWS(node): string[]
  → renderNarrator(node): string[]
  → runAudit(node): AuditFinding[]
```

### Renderer Vocabulary Differences

| Concept | NVDA | VoiceOver | JAWS | Narrator |
|---------|------|-----------|------|----------|
| Disabled | "unavailable" | "dimmed" | "unavailable" | "disabled" |
| Unchecked | "not checked" | "unchecked" | "not checked" | "not checked" |
| Textbox role | "edit" | "text field" | "edit" | "edit" |
| Combobox role | "combo box" | "pop-up button" | "combo box" | "combo box" |
| Heading | "heading level N" | "heading level N" | "heading level N" | "heading level N" |
| Button hint | (none) | (none) | (none) | "to activate press Enter" |

## Build Configuration

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig([
  // Browser bundles (manager + preview + index)
  {
    entry: {
      index: 'src/index.ts',
      manager: 'src/manager.tsx',
      preview: 'src/preview.ts',
    },
    format: ['esm'],
    dts: false,
    external: ['react', 'react-dom', '@storybook/manager-api'],
    platform: 'browser',
    clean: true,
  },
  // Node preset (runs at build time)
  {
    entry: { preset: 'src/preset.ts' },
    format: ['cjs'],
    dts: false,
    platform: 'node',
    outDir: 'dist',
  },
]);
```

Key insight: The preset must be CommonJS because Storybook's builder evaluates it in Node.js using `require()`. The manager and preview bundles are ESM because they run in the browser.

## Local Development Registration

For the monorepo, `.storybook/main.ts` references the local addon:

```typescript
const config: StorybookConfig = {
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '../addon-speakable',  // resolves package.json → exports["./preset"]
  ],
};
```

This works because Storybook resolves the path to the directory, finds `package.json`, reads the `"./preset"` export, and loads `dist/preset.js` (CJS), which points to the compiled manager and preview bundles.

## Decorator Timing Strategy

The decorator must not block story rendering or fire before the DOM is ready:

```
Story function called
  → Return rendered element immediately (no blocking)
  → Schedule: requestAnimationFrame(() => {
      setTimeout(() => {
        // DOM is painted and settled
        const root = findStoryRoot();
        const result = analyzeDOM(root);
        channel.emit(EVENT_RESULT, result);
      }, 100);
    });
```

The 100ms delay accounts for:
- React hydration completing
- CSS transitions applying (display changes)
- Storybook's own DOM wrappers settling

## File Structure

```
addon-speakable/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── src/
│   ├── index.ts         # Constants (ADDON_ID, event names)
│   ├── preset.ts        # Node-side: tells Storybook where bundles are (CJS)
│   ├── manager.tsx      # Browser-side: panel UI (ESM)
│   ├── preview.ts       # Browser-side: decorator (ESM)
│   └── analyzer.ts      # Browser-side: DOM walker + renderers (ESM)
└── dist/
    ├── index.js         # ESM
    ├── manager.js       # ESM
    ├── preview.js       # ESM
    └── preset.js        # CJS (critical: must be CommonJS)
```

## Testing Approach

1. **Unit test the analyzer**: Feed HTML strings via jsdom in Vitest and verify output matches expectations
2. **Integration test locally**: Boot Storybook with the addon and verify the panel loads with the multi-select stories
3. **Cross-framework test**: Create a minimal React Storybook project and verify the addon works when installed from the dist
