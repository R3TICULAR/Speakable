'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CopyMarkdownButton } from '../../components/CopyMarkdownButton';

const DOCS_GROUPS: { label: string; sections: { label: string; href: string }[] }[] = [
  {
    label: 'Getting Started',
    sections: [
      { label: 'Usage Guide', href: '/docs/usage-guide' },
      { label: 'How Screen Readers Work', href: '/docs/how-screen-readers-work' },
    ],
  },
  {
    label: 'Guides',
    sections: [
      { label: 'Advanced Guide', href: '/docs/advanced-guide' },
      { label: 'Focus Management', href: '/docs/focus-management' },
      { label: 'Live Regions', href: '/docs/live-regions' },
      { label: 'Keyboard Navigation', href: '/docs/keyboard-navigation' },
      { label: 'Accessible Forms', href: '/docs/accessible-forms' },
      { label: 'Component Patterns', href: '/docs/component-patterns' },
      { label: 'Dynamic Content Pitfalls', href: '/docs/dynamic-content-pitfalls' },
      { label: 'Testing Strategy', href: '/docs/testing-strategy' },
      { label: 'Runtime Analysis', href: '/docs/runtime-analysis' },
      { label: 'Design Systems', href: '/docs/design-systems' },
    ],
  },
  {
    label: 'Reference',
    sections: [
      { label: 'API Reference', href: '/docs' },
      { label: 'ARIA Roles', href: '/docs/aria-roles' },
      { label: 'Screen Reader Comparison', href: '/docs/screen-reader-comparison' },
      { label: 'Testing Checklist', href: '/docs/testing-checklist' },
      { label: 'Glossary', href: '/docs/glossary' },
      { label: 'Common Mistakes', href: '/docs/common-mistakes' },
      { label: 'Examples', href: '/docs/examples' },
    ],
  },
  {
    label: 'Integration',
    sections: [
      { label: 'CI/CD Integration', href: '/docs/cicd-integration' },
      { label: 'Framework Guides', href: '/docs/frameworks' },
      { label: 'MCP Integration', href: '/docs/mcp-integration' },
      { label: 'Spec Integration', href: '/docs/spec-integration' },
      { label: 'Testing Ecosystem', href: '/docs/testing-ecosystem' },
    ],
  },
];

const CORE_MODULES = [
  { label: 'Parser', href: '/docs#parser' },
  { label: 'Extractor', href: '/docs#extractor' },
  { label: 'Renderers', href: '/docs#renderers' },
  { label: 'Model', href: '/docs#model' },
  { label: 'Diff', href: '/docs#diff' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/docs') return pathname === '/docs';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-73px)]">
      {/* Docs-specific skip link */}
      <a
        href="#docs-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to docs content
      </a>

      {/* Mobile docs navigation */}
      <div className="md:hidden border-b border-slate-200 bg-slate-50 w-full">
        <button
          type="button"
          aria-expanded={mobileDocsOpen}
          aria-label="Documentation navigation"
          onClick={() => setMobileDocsOpen(!mobileDocsOpen)}
          className="flex items-center justify-between w-full px-6 py-3 text-sm font-semibold text-slate-700"
        >
          <span>Documentation Menu</span>
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            {mobileDocsOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        {mobileDocsOpen && (
          <nav aria-label="Documentation navigation" className="px-6 pb-4 space-y-4">
            {DOCS_GROUPS.map((group) => (
              <div key={group.label}>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {group.label}
                </span>
                <div className="space-y-1 mt-2">
                  {group.sections.map((section) => (
                    <Link
                      key={section.href}
                      href={section.href}
                      aria-current={isActive(pathname, section.href) ? 'page' : undefined}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(pathname, section.href)
                          ? 'font-semibold bg-blue-50 text-blue-600'
                          : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {section.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Core Modules</span>
              <div className="space-y-1 mt-2">
                {CORE_MODULES.map((mod) => (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="block px-3 py-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {mod.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-[250px] bg-slate-50 border-r border-slate-200 max-md:hidden overflow-y-auto sticky top-[73px] h-[calc(100vh-73px)]">
        <div className="p-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
            Documentation
          </h2>
          <nav aria-label="Documentation navigation" className="space-y-6">
            {DOCS_GROUPS.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.sections.map((section) => (
                    <Link
                      key={section.href}
                      href={section.href}
                      aria-current={isActive(pathname, section.href) ? 'page' : undefined}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(pathname, section.href)
                          ? 'font-semibold bg-blue-50 text-blue-600'
                          : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {section.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-10">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Core Modules
            </h3>
            <div className="space-y-1">
              {CORE_MODULES.map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="block px-3 py-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                >
                  {mod.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div id="docs-content" tabIndex={-1} className="flex-1 px-8 py-12 lg:px-16 max-w-4xl">
        <div className="flex justify-end mb-4">
          <CopyMarkdownButton />
        </div>
        {children}
      </div>
    </div>
  );
}
