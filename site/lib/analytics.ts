/**
 * Google Analytics event tracking utilities.
 *
 * GA4 is enabled by default for all users. A cookie notice informs users
 * that analytics are active. The consent check is kept in place but defaults
 * to true, making it easy to revert to opt-in later by changing
 * `hasAnalyticsConsent()` to check for an explicit acceptance cookie.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Check if user has granted analytics consent.
 * Currently defaults to true (enabled by default).
 * To revert to opt-in: change this to check for cookie_consent=accepted.
 */
export function hasAnalyticsConsent(): boolean {
  // GA enabled by default. To revert to opt-in, uncomment the line below:
  // return typeof document !== 'undefined' && document.cookie.includes('cookie_consent=accepted');
  return true;
}

/** Check if gtag is available */
function gtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
}

/** Send a GA4 event */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!gtagAvailable() || !hasAnalyticsConsent()) return;
  (window as any).gtag('event', eventName, params);
}

// --- Pre-defined events for common interactions ---

/** Track navigation clicks */
export function trackNavClick(destination: string): void {
  trackEvent('nav_click', { destination });
}

/** Track CTA button clicks */
export function trackCTAClick(ctaName: string, location: string): void {
  trackEvent('cta_click', { cta_name: ctaName, location });
}

/** Track analyzer usage */
export function trackAnalyze(screenReader: string, format: string, hasSelector: boolean): void {
  trackEvent('analyze', { screen_reader: screenReader, format, has_selector: hasSelector });
}

/** Track voice playback */
export function trackVoicePlay(mode: 'play_all' | 'line_by_line'): void {
  trackEvent('voice_play', { mode });
}

/** Track copy actions */
export function trackCopy(contentType: string): void {
  trackEvent('copy', { content_type: contentType });
}

/** Track download actions */
export function trackDownload(format: string): void {
  trackEvent('download', { format });
}

/** Track docs page views */
export function trackDocsView(page: string): void {
  trackEvent('docs_view', { page });
}

/** Track sign-up intent */
export function trackSignUpIntent(source: string): void {
  trackEvent('sign_up_intent', { source });
}

/** Track pricing page interaction */
export function trackPricingClick(plan: string): void {
  trackEvent('pricing_click', { plan });
}

/** Track external link clicks */
export function trackExternalLink(url: string, label: string): void {
  trackEvent('external_link', { url, link_label: label });
}

/** Track file upload */
export function trackFileUpload(): void {
  trackEvent('file_upload');
}

/** Track diff mode toggle */
export function trackDiffToggle(enabled: boolean): void {
  trackEvent('diff_toggle', { enabled });
}

/** Track copy-as-markdown */
export function trackCopyMarkdown(page: string): void {
  trackEvent('copy_markdown', { page });
}

/** Track cookie consent response */
export function trackConsent(accepted: boolean): void {
  // This one fires regardless of consent state since it IS the consent action
  if (!gtagAvailable()) return;
  (window as any).gtag('event', 'consent_response', { accepted });
}

/**
 * Initialize GA after consent is granted.
 * Dynamically loads the gtag script and configures it.
 */
export function initializeGA(): void {
  if (typeof window === 'undefined' || !GA_ID) return;
  if (gtagAvailable()) return; // Already loaded

  // Create gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function () {
    (window as any).dataLayer.push(arguments);
  };
  (window as any).gtag('js', new Date());
  (window as any).gtag('config', GA_ID);
}
