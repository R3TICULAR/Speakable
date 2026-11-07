/**
 * Type augmentation so `expect(locator).toAnnounce(...)` and `.toAnnounceLike(...)`
 * are typed when consumers import `expect` from this package.
 */
import type { ExpectedAnnouncement, MatcherOptions } from './index.js';

export {};

declare module '@playwright/test' {
  interface Matchers<R, T> {
    /**
     * Assert the semantic fields (role/name/state/value) Speakable predicts the
     * screen reader would announce for the located element. Only the fields you
     * specify are checked.
     */
    toAnnounce(expected: ExpectedAnnouncement, options?: MatcherOptions): R;

    /**
     * Assert the rendered screen-reader phrase Speakable predicts for the located
     * element (normalized, substring-tolerant). Convenience over `toAnnounce`.
     */
    toAnnounceLike(phrase: string, options?: MatcherOptions): R;
  }
}
