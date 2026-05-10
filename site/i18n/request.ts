import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['en', 'es', 'ja'];
const DEFAULT_LOCALE = 'en';
const LOCALE_COOKIE = 'NEXT_LOCALE';

export default getRequestConfig(async () => {
  // Read locale from cookie (set by middleware)
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  const locale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
