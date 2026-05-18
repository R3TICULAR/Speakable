'use client';

import { useState, useRef, useEffect, useTransition, useCallback } from 'react';
import { useLocale } from 'next-intl';

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  ja: '日本語',
};

const SUPPORTED_LOCALES = Object.keys(LOCALE_LABELS);

export function LocaleSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Don't render if only one locale is supported
  if (SUPPORTED_LOCALES.length <= 1) return null;

  function handleChange(newLocale: string) {
    setOpen(false);
    if (newLocale === locale) return;
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      window.location.reload();
    });
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isPending}
        aria-label="Select language"
        aria-haspopup="true"
        aria-expanded={open}
        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Language options"
          className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden"
        >
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              role="menuitem"
              onClick={() => handleChange(loc)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                loc === locale
                  ? 'text-blue-600 bg-blue-50 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {LOCALE_LABELS[loc]}
              {loc === locale && (
                <span className="material-symbols-outlined text-[16px] ml-2 align-middle text-blue-600" aria-hidden="true">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
