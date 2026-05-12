---
inclusion: manual
---

# Internationalization Architecture

## Current State

Speakable is English-only but has foundational locale infrastructure in place at `site/lib/locale.ts`. The speech synthesis system now carries locale metadata (`utterance.lang`) to ensure correct pronunciation by the browser's TTS engine.

## Architecture Decisions

### Locale Detection Priority
1. User preference (stored in localStorage or Clerk metadata)
2. URL path prefix (future: `/en/`, `/fr/`)
3. `navigator.language` / `navigator.languages`
4. Default: `en-US`

### Speech Synthesis Locale
- All `SpeechSynthesisUtterance` instances MUST have `.lang` set
- Voice selection should prefer voices matching the page locale
- Fallback: browser default voice if no locale match

### String Architecture (Future)
When i18n is implemented:
- Use `next-intl` (Next.js-native, supports App Router)
- Translation files: `site/messages/{locale}.json`
- Namespace by feature: `nav.home`, `tool.analyze`, `voice.playAll`
- Accessibility strings get their own namespace: `a11y.skipToContent`, `a11y.voiceControls`

### RTL Readiness (Future)
- Tailwind CSS supports RTL via `dir="rtl"` on `<html>`
- Use logical properties where possible (`ps-4` instead of `pl-4`)
- Avoid hardcoded `left`/`right` in custom CSS

## Key Files
- `site/lib/locale.ts` — Locale detection, normalization, voice filtering
- `site/lib/format.ts` — Locale-aware formatting (dates, numbers, plurals, lists)
- `site/hooks/useSpeechSynthesis.ts` — Speech hook with `lang` option
- `site/hooks/useLocale.ts` — Client-side locale hook (locale, bcp47, isRTL)
- `site/i18n/request.ts` — Server-side locale resolution (reads cookie)
- `site/middleware.ts` — Locale detection from Accept-Language + cookie persistence
- `site/messages/en.json` — English translation dictionary
- `site/app/layout.tsx` — Root `<html lang={locale}>` (dynamic)

## Adding a New Locale (Future Steps)
1. Add locale to `SUPPORTED_LOCALES` in `site/lib/locale.ts`
2. Create `site/messages/{locale}.json` with translations
3. Add locale routing in middleware
4. Update `<html lang>` to be dynamic
5. Test speech synthesis with locale-appropriate voices

## Known Gaps
- All UI strings are hardcoded English (100+ strings)
- No i18n library installed yet
- Extension has no `_locales` directory
- No RTL CSS support
- No `hreflang` meta tags
- No locale switcher UI
