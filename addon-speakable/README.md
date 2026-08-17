# @reticular/storybook-addon-speakable

Storybook addon that predicts screen reader output (NVDA, JAWS, VoiceOver, Narrator) for your rendered components. See what assistive technology users will hear without leaving your Storybook.

## What it does

- Adds a **Screen Readers** panel to your Storybook addon area
- Analyzes the rendered story DOM and predicts speech output for 4 screen readers
- Shows cross-reader differences (VoiceOver says "dimmed", NVDA says "unavailable")
- Includes an **Audit** tab that flags missing accessible names, heading hierarchy issues
- Updates live when you change story controls/args
- Zero configuration beyond adding to your addons array

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

The analysis uses the same accessible name computation algorithm browsers use:
`aria-labelledby` > `aria-label` > `<label>` > `alt` > text content.

## Panel tabs

| Tab | What it shows |
|-----|---------------|
| NVDA | Predicted NVDA announcements (role-first, "unavailable" for disabled) |
| JAWS | Predicted JAWS announcements |
| VoiceOver | Predicted VoiceOver announcements ("dimmed", "text field", Apple vocabulary) |
| Narrator | Predicted Narrator announcements (includes interaction hints) |
| Audit | Accessibility findings: missing names, heading skips |

## Limitations

- **Heuristic predictions, not exact transcripts.** Output represents what screen readers are likely to say at default settings. Actual behavior varies by version, user configuration, and browser pairing.
- **Static HTML analysis.** The addon analyzes the DOM at a point in time. It does not track dynamic interactions (focus movement, live region announcements over time). For runtime analysis, see the full [@reticular/speakable](https://www.npmjs.com/package/@reticular/speakable) CLI.
- **No CSS layout awareness.** Elements hidden via CSS (other than `display: none` and `visibility: hidden`) may still appear in the output.
- **Complementary to manual testing.** This addon helps catch issues during development. It does not replace testing with real assistive technology before release.

## Links

- [Speakable CLI](https://www.npmjs.com/package/@reticular/speakable)
- [Documentation](https://getspeakable.dev/docs)
- [GitHub](https://github.com/R3TICULAR/AnnounceKit)
- [Discord](https://discord.gg/uSKJUEgdR)

## License

MIT
