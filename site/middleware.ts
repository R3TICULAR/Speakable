import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/settings(.*)']);

// Supported locales — expand as translations are added
const SUPPORTED_LOCALES = ['en', 'es', 'ja'];
const DEFAULT_LOCALE = 'en';
const LOCALE_COOKIE = 'NEXT_LOCALE';

/**
 * Detects the user's preferred locale from:
 * 1. Explicit cookie (user previously chose a locale)
 * 2. Accept-Language header (browser preference)
 * 3. Default fallback
 */
function detectLocale(req: NextRequest): string {
  // 1. Check cookie
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Parse Accept-Language header
  const acceptLang = req.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang
      .split(',')
      .map((part) => {
        const [lang, q] = part.trim().split(';q=');
        return { lang: lang.split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { lang } of preferred) {
      if (SUPPORTED_LOCALES.includes(lang)) {
        return lang;
      }
    }
  }

  // 3. Default
  return DEFAULT_LOCALE;
}

export default clerkMiddleware(async (auth, req) => {
  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Detect and persist locale (sets cookie for future requests)
  const locale = detectLocale(req);
  const response = NextResponse.next();

  // Set locale cookie if not already set (persists user's detected preference)
  if (!req.cookies.get(LOCALE_COOKIE)?.value) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
