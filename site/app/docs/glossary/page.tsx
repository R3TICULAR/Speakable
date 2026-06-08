import Link from "next/link";
import { RelatedPages } from "../../../components/RelatedPages";

const glossary = [
  { term: "Accessibility Tree", definition: "The browser's parallel data structure exposing roles, names, and states to assistive technology.", link: "/docs/how-screen-readers-work" },
  { term: "ARIA (Accessible Rich Internet Applications)", definition: "W3C spec for enhancing HTML semantics when native elements are insufficient.", link: "/docs/aria-roles" },
  { term: "aria-live", definition: "Attribute that marks regions for automatic announcement when content changes.", link: "/docs/live-regions" },
  { term: "Assertive", definition: "Live region priority that interrupts current speech immediately.", link: "/docs/live-regions" },
  { term: "Assistive Technology", definition: "Software or hardware enabling people with disabilities to use computers: screen readers, switch devices, magnifiers.", link: "/docs/how-screen-readers-work" },
  { term: "Browse Mode", definition: "Screen reader mode for reading all page content linearly using a virtual cursor.", link: "/docs/how-screen-readers-work" },
  { term: "Combobox", definition: "Composite widget combining a text input with a popup list of selectable options.", link: "/docs/component-patterns" },
  { term: "Computed Name", definition: "The accessible name determined by the browser's name computation algorithm.", link: "/docs" },
  { term: "Dialog", definition: "Overlay container requiring user interaction before returning focus to the page.", link: "/docs/component-patterns" },
  { term: "Document Structure", definition: "Roles that organize page content hierarchically: headings, lists, tables, and sections.", link: "/docs/aria-roles" },
  { term: "Focus Mode", definition: "Screen reader mode for interacting with form controls and interactive widgets.", link: "/docs/how-screen-readers-work" },
  { term: "Focus Trap", definition: "Pattern constraining Tab navigation within a container, commonly used in modals.", link: "/docs/focus-management" },
  { term: "Focusable", definition: "Element capable of receiving keyboard focus, either natively or via tabindex.", link: "/docs/focus-management" },
  { term: "Heading Hierarchy", definition: "Sequential structure of h1-h6 elements providing document outline for navigation.", link: "/docs/testing-checklist" },
  { term: "Implicit Role", definition: "The default ARIA role assigned to an element by its HTML element type.", link: "/docs/aria-roles" },
  { term: "Interactive Element", definition: "Element users can operate via keyboard or pointer input (buttons, links, inputs).", link: "/docs/component-patterns" },
  { term: "Keyboard Navigation", definition: "Navigating an interface using only keyboard input: Tab, arrows, Enter, Escape.", link: "/docs/keyboard-navigation" },
  { term: "Landmark", definition: "Named page region for quick navigation: main, nav, aside, header, footer.", link: "/docs/aria-roles" },
  { term: "Live Region", definition: "DOM area that announces content changes to screen readers without focus movement.", link: "/docs/live-regions" },
  { term: "Mixed State", definition: "Checkbox with aria-checked=\"mixed\" indicating partial selection in a group.", link: "/docs/aria-roles" },
  { term: "Name Computation", definition: "Algorithm browsers use to determine an element's accessible name from multiple sources.", link: "/docs" },
  { term: "Polite", definition: "Live region priority that waits until current speech finishes before announcing.", link: "/docs/live-regions" },
  { term: "Programmatic Focus", definition: "Moving focus via JavaScript rather than user interaction, used for dynamic UI updates.", link: "/docs/focus-management" },
  { term: "Role", definition: "ARIA semantic type assigned to an element, defining its purpose and behavior.", link: "/docs/aria-roles" },
  { term: "Roving Tabindex", definition: "Focus management pattern for composite widgets using arrow key navigation between items.", link: "/docs/focus-management" },
  { term: "Screen Reader", definition: "Assistive technology that converts visual UI to synthesized speech or braille output.", link: "/docs/screen-reader-comparison" },
  { term: "Skip Link", definition: "Hidden navigation aid allowing keyboard users to bypass repetitive content blocks.", link: "/docs/focus-management" },
  { term: "State", definition: "Dynamic property of an element reflecting its current condition: expanded, checked, disabled.", link: "/docs/aria-roles" },
  { term: "Tab Order", definition: "Sequence in which elements receive focus when the user presses the Tab key.", link: "/docs/keyboard-navigation" },
  { term: "Tabindex", definition: "HTML attribute controlling whether and in what order an element is focusable.", link: "/docs/focus-management" },
  { term: "Virtual Cursor", definition: "Screen reader's browse-mode navigation pointer for reading non-interactive content.", link: "/docs/how-screen-readers-work" },
  { term: "WCAG", definition: "Web Content Accessibility Guidelines: the international standard for web accessibility.", link: "/docs/testing-strategy" },
  { term: "Widget Role", definition: "ARIA role indicating interactive control behavior (button, slider, tab, etc.).", link: "/docs/aria-roles" },
];

function getLetterGroups() {
  const groups: Record<string, typeof glossary> = {};
  for (const entry of glossary) {
    const letter = entry.term[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(entry);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export default function GlossaryPage() {
  const letterGroups = getLetterGroups();
  const letters = letterGroups.map(([letter]) => letter);

  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Glossary</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Accessibility Glossary
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Quick reference for accessibility and screen reader terminology. Each term links to
          deeper coverage elsewhere in the docs.
        </p>
      </header>

      {/* Jump-to-letter navigation */}
      <nav
        className="mb-12 flex flex-wrap gap-2"
        aria-label="Jump to letter"
      >
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 transition-colors"
          >
            {letter}
          </a>
        ))}
      </nav>

      {/* Glossary terms by letter */}
      <div className="space-y-12">
        {letterGroups.map(([letter, terms]) => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6 pb-2 border-b border-slate-200">
              {letter}
            </h2>
            <dl className="space-y-6">
              {terms.map((entry) => (
                <div key={entry.term}>
                  <dt>
                    <h3 className="text-base font-bold text-slate-900">
                      <code className="font-mono text-[0.9em] bg-slate-50 px-1.5 py-0.5 rounded">
                        {entry.term}
                      </code>
                    </h3>
                  </dt>
                  <dd className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                    {entry.definition}{" "}
                    <Link
                      href={entry.link}
                      className="inline-flex items-center gap-0.5 text-blue-600 font-medium hover:text-blue-800 transition-colors"
                    >
                      Learn more
                      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                        arrow_forward
                      </span>
                    </Link>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <RelatedPages
        pages={[
          { href: "/docs/how-screen-readers-work", title: "How Screen Readers Work", description: "Understand the rendering pipeline from DOM to speech output." },
          { href: "/docs/aria-roles", title: "ARIA Roles", description: "Complete reference for ARIA roles, states, and properties." },
          { href: "/docs", title: "API Reference", description: "Core library API for analyzing and predicting screen reader output." },
          { href: "/docs/testing-checklist", title: "Testing Checklist", description: "Step-by-step checklist for manual and automated accessibility testing." },
        ]}
      />
    </>
  );
}
