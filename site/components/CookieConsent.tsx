'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initializeGA } from '../lib/analytics';

const NOTICE_COOKIE = 'cookie_notice_dismissed';
const NOTICE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Cookie notice banner. GA4 is enabled by default; this banner informs
 * users that analytics cookies are in use and links to the privacy policy.
 *
 * To revert to opt-in consent:
 * 1. Rename NOTICE_COOKIE back to "cookie_consent"
 * 2. Add a "Decline" button that sets cookie_consent=declined
 * 3. Change hasAnalyticsConsent() in lib/analytics.ts to require accepted
 * 4. Only call initializeGA() after explicit acceptance
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Always initialize GA (enabled by default)
    initializeGA();

    // Show notice if user hasn't dismissed it yet
    const dismissed = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${NOTICE_COOKIE}=`));

    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    document.cookie = `${NOTICE_COOKIE}=true;path=/;max-age=${NOTICE_MAX_AGE};samesite=lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Cookie notice"
      aria-describedby="cookie-desc"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-6 animate-[slideUp_400ms_ease-out]"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p id="cookie-desc" className="text-sm text-slate-600 leading-relaxed">
            This site uses cookies for analytics to help us improve Speakable.{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg shadow-sm shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
