/**
 * @reticular/speakable-playwright
 *
 * Playwright matchers that assert what a screen reader WOULD announce for an
 * element, using Speakable's prediction engine. No screen reader required: the
 * assertion runs in milliseconds, headless, on any OS — so it belongs in CI on
 * every commit, the place a real screen reader can't be.
 *
 * Two matchers:
 *   toAnnounce(expected, opts?)      — field-level (primary). Asserts only the
 *                                      semantic fields you specify.
 *   toAnnounceLike(phrase, opts?)    — phrase-level convenience wrapper.
 *
 * Usage:
 *   import { expect } from '@reticular/speakable-playwright';
 *
 *   await expect(page.getByRole('button', { name: 'Save' }))
 *     .toAnnounce({ role: 'button', name: 'Save' }, { reader: 'voiceover' });
 *
 *   await expect(page.locator('#save'))
 *     .toAnnounceLike('Save, button', { reader: 'nvda' });
 *
 * Graceful degradation: these matchers use PREDICTION only and need no AT. A
 * future live-verification mode (opt-in, when a screen reader is present) can
 * layer on top without changing this API.
 */
import { expect as baseExpect, type Locator } from '@playwright/test';
import { predictFromHtml, type ExpectedAnnouncement, type Reader } from './predict.js';
import { compareFields, comparePhrase, type FieldComparison } from './matcher.js';

export type { Reader, ExpectedAnnouncement } from './predict.js';

export interface MatcherOptions {
  /** Which screen reader's phrasing to predict. Defaults to "voiceover". */
  reader?: Reader;
}

async function outerHtml(locator: Locator): Promise<string> {
  // The element's own markup is what Speakable predicts against.
  return locator.evaluate((el) => (el as Element).outerHTML);
}

function formatFailure(
  matcherName: string,
  comparison: FieldComparison,
  reader: Reader,
  phrase: string
): string {
  const lines = [
    `${matcherName} (reader: ${reader}) failed:`,
    ...comparison.mismatches.map((m) => `  - ${m}`),
    '',
    `  Speakable predicted phrase: "${phrase}"`,
  ];
  return lines.join('\n');
}

export const expect = baseExpect.extend({
  /** Field-level: assert the semantic fields you specify (role/name/state/value). */
  async toAnnounce(locator: Locator, expected: ExpectedAnnouncement, options?: MatcherOptions) {
    const reader = options?.reader ?? 'voiceover';
    const html = await outerHtml(locator);
    const prediction = predictFromHtml(html, reader);
    const comparison = compareFields(prediction, expected);
    return {
      pass: comparison.pass,
      message: () =>
        comparison.pass
          ? `Expected element NOT to announce ${JSON.stringify(expected)} (reader: ${reader}), but it did.`
          : formatFailure('toAnnounce', comparison, reader, prediction.phrase),
    };
  },

  /** Phrase-level convenience: assert the rendered phrase (normalized, substring-tolerant). */
  async toAnnounceLike(locator: Locator, expectedPhrase: string, options?: MatcherOptions) {
    const reader = options?.reader ?? 'voiceover';
    const html = await outerHtml(locator);
    const prediction = predictFromHtml(html, reader);
    const comparison = comparePhrase(prediction, expectedPhrase);
    return {
      pass: comparison.pass,
      message: () =>
        comparison.pass
          ? `Expected element NOT to announce like "${expectedPhrase}" (reader: ${reader}), but it did.`
          : formatFailure('toAnnounceLike', comparison, reader, prediction.phrase),
    };
  },
});

// Re-export the prediction primitive for advanced/non-Playwright use.
export { predictFromHtml } from './predict.js';
