# @reticular/storybook-addon-speakable

Storybook addon that predicts screen reader output (NVDA, JAWS, VoiceOver, Narrator) for your rendered components. See what assistive technology users will hear without leaving your Storybook.

## What it does

- Adds a **Screen Readers** panel to your Storybook addon area
- Analyzes the rendered story DOM and predicts speech output for 4 screen readers
- Shows cross-reader differences (VoiceOver says "dimmed", NVDA says "unavailable")
- Includes an **Audit** tab that flags missing accessible names, heading hierarchy issues
- Captures an **interaction timeline** — focus moves, ARIA state changes, live-region announcements, and dialog lifecycle — as a configured interaction sequence runs against the story
- Detects behavior regressions with a per-story **baseline** and a severity-classified **Diff** view
- Updates live when you change story controls/args
- Zero configuration for static analysis; add one `parameters.speakable` block to capture a timeline

## Installation

```bash
npm install @reticular/storybook-addon-speakable
```

## Configuration

Add to your `.storybook/main.ts`:

```typescript
const config = {
  addons: [
    '@storybook/addon-essentials',
    '@reticular/storybook-addon-speakable',
  ],
};

export default config;
```

That's it. No API keys, no config files, no extra setup.

## Supported Storybook versions

- Storybook 8.x (all framework adapters: HTML, React, Vue, Svelte, Angular)

## How it works

The addon runs entirely in the browser. When a story renders:

1. A decorator in the story iframe captures the rendered DOM
2. A browser-side analyzer walks the accessibility tree (no Node.js, no jsdom)
3. Four heuristic renderers predict what NVDA, JAWS, VoiceOver, and Narrator would announce
4. Results display in the panel with per-reader tabs
5. If the story declares `parameters.speakable`, the decorator also runs the interaction sequence, records an accessibility event timeline, and (when a baseline exists) diffs it — surfacing both in the Timeline and Diff tabs

The analysis uses the same accessible name computation algorithm browsers use:
`aria-labelledby` > `aria-label` > `<label>` > `alt` > text content. It shares a single engine with the `@reticular/speakable` CLI and the browser bundle, so output is consistent across surfaces.

## Panel tabs

| Tab | What it shows |
|-----|---------------|
| NVDA | Predicted NVDA announcements (role-first, "unavailable" for disabled) |
| JAWS | Predicted JAWS announcements |
| VoiceOver | Predicted VoiceOver announcements ("dimmed", "text field", Apple vocabulary) |
| Narrator | Predicted Narrator announcements (includes interaction hints) |
| Audit | Accessibility findings: missing names, heading skips |
| Timeline | Chronological accessibility events captured while an interaction sequence runs (requires `parameters.speakable`) |
| Diff | Behavioral changes vs. the saved baseline, classified by severity |

## Runtime timelines

Static tabs analyze the DOM at a point in time. The **Timeline** tab goes further: it runs an interaction sequence against the rendered story and records the accessibility events that result — focus transitions, ARIA state changes, live-region announcements, and dialog open/close — in chronological order.

Timeline capture is opt-in per story via `parameters.speakable`. Declare either a full `sequence` or a named built-in `pattern`:

```typescript
// A named built-in pattern (with optional selector overrides)
export const Dialog = {
  render: () => renderDialog(),
  parameters: {
    speakable: {
      pattern: 'modal-dialog', // 'modal-dialog' | 'combobox' | 'tabs' | 'accordion'
      selectors: { trigger: 'button.open', container: '[role="dialog"]' },
    },
  },
};

// A fully custom sequence
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

// Opt a story out of timeline capture entirely
export const StaticOnly = {
  render: () => renderThing(),
  parameters: { speakable: { timeline: false } },
};
```

**`parameters.speakable` options**

| Field | Type | Description |
|-------|------|-------------|
| `sequence` | `{ description, actions[] }` | An explicit interaction sequence. Highest priority. |
| `pattern` | `'modal-dialog' \| 'combobox' \| 'tabs' \| 'accordion'` | A named built-in interaction pattern. |
| `selectors` | `{ trigger?, container?, content?, items?, input? }` | Selector overrides for the chosen built-in pattern. |
| `timeline` | `false` | Disables timeline capture for the story (static tabs still work). |

Supported action types include `tab`, `shiftTab`, `click` (with `selector`), `enter`, `space`, `escape`, the arrow keys, `key` (with `combo`), and `wait` (with `ms`).

> The sequence runs **automatically once after the story renders** — the Timeline reflects that scripted run, not your manual clicking in the preview. Stories with no `sequence` or `pattern` show only static analysis, and the Timeline tab prompts you to add one.

### Baselines and the Diff tab

On the Timeline tab, click **Set baseline** to store the current timeline for that story (persisted in `localStorage`, keyed per component + story). On later renders, the **Diff** tab compares the current timeline against the baseline and classifies each change by severity (critical, high, medium, low) — so a broken focus trap or a dropped announcement surfaces as a regression rather than a silent behavior change.

## Limitations

- **Heuristic predictions, not exact transcripts.** Output represents what screen readers are likely to say at default settings. Actual behavior varies by version, user configuration, and browser pairing.
- **Timelines run a scripted sequence.** The Timeline captures the sequence you declare in `parameters.speakable`, executed once after render — not free-form manual interaction in the preview.
- **No CSS layout awareness.** Elements hidden via CSS (other than `display: none` and `visibility: hidden`) may still appear in the output.
- **Complementary to manual testing.** This addon helps catch issues during development. It does not replace testing with real assistive technology before release.

## Links

- [Speakable CLI](https://www.npmjs.com/package/@reticular/speakable)
- [Documentation](https://getspeakable.dev/docs)
- [GitHub](https://github.com/R3TICULAR/AnnounceKit)
- [Discord](https://discord.gg/uSKJUEgdR)

## License

MIT
