/**
 * Locale-aware formatting utilities.
 *
 * Uses the Intl API for proper localization of dates, numbers,
 * and pluralization. All functions accept an optional locale
 * parameter, defaulting to 'en-US'.
 */

/**
 * Formats a date according to the given locale.
 */
export function formatDate(
  date: Date | string | number,
  locale = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Formats a relative time (e.g., "3 days ago", "in 2 hours").
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale = 'en-US'
): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = Date.now();
  const diffMs = d.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, 'day');
  if (Math.abs(diffHr) >= 1) return rtf.format(diffHr, 'hour');
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute');
  return rtf.format(diffSec, 'second');
}

/**
 * Formats a number according to the given locale.
 */
export function formatNumber(
  value: number,
  locale = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formats a number as compact notation (e.g., 1.2K, 3.4M).
 */
export function formatCompact(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Returns the correct plural form for a count.
 * Useful for building pluralized strings.
 */
export function pluralCategory(
  count: number,
  locale = 'en-US'
): Intl.LDMLPluralRule {
  return new Intl.PluralRules(locale).select(count);
}

/**
 * Simple pluralization helper.
 * Returns singular or plural form based on count.
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  locale = 'en-US'
): string {
  const category = pluralCategory(count, locale);
  return category === 'one' ? singular : plural;
}

/**
 * Formats a list of items according to locale conventions.
 * e.g., ["a", "b", "c"] → "a, b, and c" (en) or "a, b et c" (fr)
 */
export function formatList(
  items: string[],
  locale = 'en-US',
  options?: Intl.ListFormatOptions
): string {
  return new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction',
    ...options,
  }).format(items);
}
