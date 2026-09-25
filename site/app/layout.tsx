import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { Navigation } from '../components/Navigation';
import { RouteAnnouncer } from '../components/RouteAnnouncer';
import { LiveRegionProvider } from '../components/LiveRegion';
import { AxeDevTools } from '../components/AxeDevTools';
import { CookieConsent } from '../components/CookieConsent';
import { HreflangTags } from '../components/HreflangTags';
import { FooterSocialLinks } from '../components/FooterSocialLinks';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Speakable | Accessibility-First Screen Reader Prediction',
  description: 'Predict screen reader output across NVDA, JAWS, and VoiceOver. Simulate how assistive technology interprets your HTML — catch issues before users do.',
  metadataBase: new URL('https://getspeakable.dev'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/?lang=en',
      'es': '/?lang=es',
      'ja': '/?lang=ja',
      'zh': '/?lang=zh',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'Speakable | Screen Reader Prediction Tool',
    description: 'Simulate how NVDA, JAWS, and VoiceOver interpret your HTML. Static analysis for accessibility — fast, deterministic, CI-ready.',
    url: 'https://getspeakable.dev',
    siteName: 'Speakable',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Speakable | Screen Reader Prediction Tool',
    description: 'Simulate how NVDA, JAWS, and VoiceOver interpret your HTML.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations('a11y');
  const tFooter = await getTranslations('footer');

  const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];
  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* hreflang for international SEO — dynamic per-page */}
        <HreflangTags />
        {/* GA is loaded dynamically by CookieConsent component after user accepts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden flex flex-col">
        <ClerkProvider>
        <NextIntlClientProvider messages={messages}>
        <LiveRegionProvider>
          <AxeDevTools />
          {/* Skip link — first focusable element */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
          >
            {t('skipToContent')}
          </a>

          <Navigation />
          <RouteAnnouncer />

          <main id="main-content" className="pt-[73px] flex-grow">
            {children}
          </main>

          <CookieConsent />

          {/* Footer */}
          <footer className="bg-slate-50 border-t border-slate-200 w-full py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 max-w-7xl mx-auto">
              <div>
                <div className="text-lg font-bold text-slate-900 mb-4">Speakable</div>
                <p className="text-sm text-slate-500 max-w-xs">
                  {tFooter('copyright', { year: new Date().getFullYear() })}
                </p>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end items-center">
                <Link href="/privacy" className="text-sm text-slate-500 hover:text-blue-600 transition-colors decoration-2 underline-offset-4">
                  {tFooter('privacy')}
                </Link>
                <Link href="/terms" className="text-sm text-slate-500 hover:text-blue-600 transition-colors decoration-2 underline-offset-4">
                  {tFooter('terms')}
                </Link>
                <Link href="/security" className="text-sm text-slate-500 hover:text-blue-600 transition-colors decoration-2 underline-offset-4">
                  {tFooter('security')}
                </Link>
                <Link href="/contact" className="text-sm text-slate-500 hover:text-blue-600 transition-colors decoration-2 underline-offset-4">
                  {tFooter('contact')}
                </Link>
                <FooterSocialLinks githubLabel={tFooter('githubLabel')} discordLabel={tFooter('discordLabel')} />
              </div>
            </div>
          </footer>
        </LiveRegionProvider>
        </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
