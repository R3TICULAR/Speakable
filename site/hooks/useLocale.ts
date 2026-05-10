'use client';

import { useLocale as useNextIntlLocale } from 'next-intl';

/**
 * Returns the current locale and BCP 47 language tag.
 * Wraps next-intl's useLocale with additional utilities.
 */
export function useAppLocale() {
  const locale = useNextIntlLocale();

  // Map short locale to full BCP 47 tag for Intl APIs
  const LOCALE_TO_BCP47: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    ja: 'ja-JP',
  };

  const bcp47 = LOCALE_TO_BCP47[locale] ?? `${locale}-${locale.toUpperCase()}`;

  return {
    /** Short locale code (e.g., "en") */
    locale,
    /** Full BCP 47 tag for Intl APIs (e.g., "en-US") */
    bcp47,
    /** Whether the locale is RTL */
    isRTL: ['ar', 'he', 'fa', 'ur'].includes(locale),
  };
}
