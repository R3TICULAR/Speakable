/**
 * Locale infrastructure for Speakable.
 *
 * Provides locale detection, normalization, and utilities.
 * This is the foundation for future i18n expansion — currently
 * the app is English-only but this ensures proper language metadata
 * flows through speech synthesis and accessibility APIs.
 */

/** Supported locales (expand as translations are added) */
export const SUPPORTED_LOCALES = ['en', 'es', 'ja'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Default locale */
export const DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * Detects the user's preferred locale from browser APIs.
 * Returns the best match from supported locales, or the default.
 */
export function detectLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;

  const browserLocales = navigator.languages ?? [navigator.language];

  for (const browserLocale of browserLocales) {
    const normalized = normalizeLocale(browserLocale);
    const match = SUPPORTED_LOCALES.find(
      (supported) => normalized === supported || normalized.startsWith(supported + '-')
    );
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}

/**
 * Normalizes a locale string to lowercase with hyphen separator.
 * e.g., "en_US" → "en-us", "EN" → "en"
 */
export function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-');
}

/**
 * Returns the BCP 47 language tag for use in HTML lang attributes
 * and SpeechSynthesisUtterance.lang.
 */
export function getLanguageTag(locale: SupportedLocale): string {
  const LOCALE_TO_BCP47: Record<SupportedLocale, string> = {
    en: 'en-US',
    es: 'es-ES',
    ja: 'ja-JP',
  };
  return LOCALE_TO_BCP47[locale] ?? 'en-US';
}

/**
 * Filters speech synthesis voices by locale compatibility.
 * Returns voices whose lang starts with the given locale prefix.
 */
export function filterVoicesByLocale(
  voices: SpeechSynthesisVoice[],
  locale: SupportedLocale
): SpeechSynthesisVoice[] {
  const prefix = locale.toLowerCase();
  return voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
}

/**
 * Selects the best default voice for a given locale.
 * Prefers the browser's default voice if it matches the locale,
 * otherwise picks the first matching voice.
 */
export function selectDefaultVoice(
  voices: SpeechSynthesisVoice[],
  locale: SupportedLocale
): SpeechSynthesisVoice | null {
  const localeVoices = filterVoicesByLocale(voices, locale);
  if (localeVoices.length === 0) return null;

  // Prefer the default voice if it matches
  const defaultVoice = localeVoices.find((v) => v.default);
  if (defaultVoice) return defaultVoice;

  return localeVoices[0];
}
