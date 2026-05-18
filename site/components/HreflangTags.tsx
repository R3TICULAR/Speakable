'use client';

import { usePathname } from 'next/navigation';

const BASE_URL = 'https://getspeakable.dev';
const SUPPORTED_LOCALES = ['en', 'es', 'ja'];

/**
 * Generates hreflang link tags for the current page.
 * Each locale version is accessible via ?lang= parameter.
 * This tells search engines about alternate language versions of the same page.
 */
export function HreflangTags() {
  const pathname = usePathname();

  return (
    <>
      {SUPPORTED_LOCALES.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={`${BASE_URL}${pathname}?lang=${locale}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${BASE_URL}${pathname}`}
      />
    </>
  );
}
