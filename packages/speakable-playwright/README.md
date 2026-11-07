# @reticular/speakable-playwright

Playwright matchers that assert **what a screen reader would announce** for an
element — powered by [Speakable](https://getspeakable.dev)'s prediction engine.

No screen reader required. The assertion runs in milliseconds, headless, on any
OS, so it belongs in CI on **every commit** — the place a real screen reader
can't be. Pair it with a periodic real-AT benchmark (Guidepup) to keep the
predictions honest.

## Why

Screen-reader behavior is the thing accessibility regressions actually break,
but you can't run VoiceOver or NVDA on every PR. Speakable predicts the
announcement heuristically and fast; this package turns that prediction into a
Playwright assertion you already know how to write.

> Prediction is heuristic, not a correctness proof. It complements manual
> screen-reader testing and does not guarantee WCAG compliance.

## Install

```bash
npm install -D @reticular/speakable-playwright
```

Peer dependencies (you almost certainly already have these):

```bash
npm install -D @playwright/test @reticular/speakable
```

## Usage

Import `expect` from this package instead of `@playwright/test` (it's the same
`expect`, extended with the matchers):

```ts
import { test } from '@playwright/test';
import { expect } from '@reticular/speakable-playwright';

test('save button announces correctly', async ({ page }) => {
  await page.goto('/settings');

  // Field-level (primary): assert only the semantics you care about.
  await expect(page.getByRole('button', { name: 'Save' }))
    .toAnnounce({ role: 'button', name: 'Save' }, { reader: 'voiceover' });

  // A toggle switch, with state.
  await expect(page.locator('#dark-mode'))
    .toAnnounce({ role: 'switch', state: ['checked:true'] });

  // Phrase-level convenience (normalized, substring-tolerant).
  await expect(page.locator('#save'))
    .toAnnounceLike('Save, button', { reader: 'nvda' });
});
```

### `toAnnounce(expected, options?)` — field-level (primary)

Asserts the semantic fields you specify; unspecified fields are ignored.

```ts
await expect(locator).toAnnounce({
  role: 'checkbox',
  name: 'Subscribe',
  state: ['checked:true'],
  // value: '...'   // for range/number widgets
}, { reader: 'voiceover' });
```

Fields: `role`, `name`, `state` (array of `key:value` tokens, e.g.
`expanded:true`, `checked:false`, `selected:true`, `disabled:true`, `level:2`),
and `value`.

### `toAnnounceLike(phrase, options?)` — phrase-level convenience

Asserts the rendered screen-reader phrase, normalized (lowercased, whitespace
collapsed) and substring-tolerant.

```ts
await expect(locator).toAnnounceLike('Save changes, button');
```

### Options

| Option | Type | Default | Meaning |
|---|---|---|---|
| `reader` | `'voiceover' \| 'nvda'` | `'voiceover'` | Which screen reader's phrasing to predict. |

## How it works

For the located element, the matcher reads its `outerHTML`, runs Speakable's
pipeline (parse → accessibility tree → reader-specific render), and compares the
predicted semantics to your expectation. It is prediction-only: no AT, no
Guidepup, no network.

## Relationship to the Speakable benchmark

The comparison uses the same semantics as Speakable's accuracy benchmark, which
is periodically validated against **real** VoiceOver/NVDA via Guidepup. When the
benchmark finds the engine drifting from real screen-reader output (e.g. a new
OS changes wording), the engine is corrected and these matchers improve with it.

## License

MIT
