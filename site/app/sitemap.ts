import type { MetadataRoute } from 'next';

const BASE_URL = 'https://getspeakable.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Core pages
  const corePages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/tool', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/sign-in', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/sign-up', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/contact', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.2, changeFrequency: 'yearly' as const },
    { path: '/security', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  // Docs pages
  const docsPages = [
    { path: '/docs', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/docs/usage-guide', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/docs/mcp-integration', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/docs/advanced-guide', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/examples', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/common-mistakes', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/frameworks', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/spec-integration', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/docs/testing-ecosystem', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/cicd-integration', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/docs/aria-roles', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/docs/testing-checklist', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/docs/how-screen-readers-work', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/docs/component-patterns', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/live-regions', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/focus-management', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/testing-strategy', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/glossary', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/docs/screen-reader-comparison', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/keyboard-navigation', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/accessible-forms', priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  const allPages = [...corePages, ...docsPages];

  // Generate entries for each locale
  const locales = ['en', 'es', 'ja'];

  return allPages.flatMap((page) => {
    // Default entry (no lang param — x-default)
    const entries: MetadataRoute.Sitemap = [
      {
        url: `${BASE_URL}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((locale) => [locale, `${BASE_URL}${page.path}?lang=${locale}`])
          ),
        },
      },
    ];

    return entries;
  });
}
