'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initializeGA, trackConsent, hasAnalyticsConsent } from '../lib/analytics';

const CONSENT_COOKIE = 'cookie_consent';
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if consent already given (accepted or declined)
    const existing = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));

    if (!existing) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }

    // If previously accepted, initialize GA
    if (existing === `${CONSENT_COOKIE}=accepted`) {
      initializeGA();
    }
  }, []);

  const handleAccept = () => {
    document.cookie = `${CONSENT_COOKIE}=accepted;path=/;max-age=${CONSENT_MAX_AGE};samesite=lax`;
    setVisible(false);
    initializeGA();
    trackConsent(true);
  };

  const handleDecline = () => {
    document.cookie = `${CONSENT_COOKIE}=declined;path=/;max-age=${CONSENT_MAX_AGE};samesite=lax`;
    setVisible(false);
    trackConsent(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      aria-describedby="cookie-desc"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-6 animate-[slideUp_400ms_ease-out]"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p id="cookie-desc" className="text-sm text-slate-600 leading-relaxed">
            We use cookies to understand how you use Speakable and improve the experience.
            Analytics data helps us prioritize features and fix issues faster.{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDecline}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg shadow-sm shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
