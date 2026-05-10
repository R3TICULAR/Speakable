'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';

/**
 * Locale switcher component.
 *
 * Currently hidden since only English is supported.
 * To activate: add to Navigation component and expand SUPPORTED_LOCALES.
 *
 * Usage:
 *   <LocaleSwitcher />
 */

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  ja: '日本語',
};

const SUPPORTED_LOCALES = Object.keys(LOCALE_LABELS);

export function LocaleSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  // Don't render if only one locale is supported
  if (SUPPORTED_LOCALES.length <= 1) return null;

  function handleChange(newLocale: string) {
    startTransition(() => {
      // Set the locale cookie and reload
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      window.location.reload();
    });
  }

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        aria-label="Select language"
        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
