import Link from "next/link";
import { RelatedPages } from "../../../components/RelatedPages";

interface ChecklistItem {
  what: string;
  description: string;
  command: string | null;
  relatedLink?: { href: string; label: string };
}

interface ChecklistCategory {
  title: string;
  items: ChecklistItem[];
}

const CATEGORIES: ChecklistCategory[] = [
  {
    title: "Navigation",
    items: [
      {
        what: "All landmarks have accessible names",
        description:
          "Each nav, aside, and section should have a unique aria-label so screen reader users can distinguish them in the landmarks list.",
        command: `speakable page.html -f audit | grep "landmark"`,
        relatedLink: { href: "/docs/common-mistakes", label: "Common Mistakes: Duplicate landmarks" },
      },
      {
        what: "Heading hierarchy is sequential (no skipping levels)",
        description:
          "Headings should follow a logical order (h1 → h2 → h3). Skipping from h1 to h3 confuses users who navigate by heading level.",
        command: `speakable page.html -f audit`,
        relatedLink: { href: "/docs/common-mistakes", label: "Common Mistakes: Skipped headings" },
      },
      {
        what: "Skip navigation link is present and works",
        description:
          'A visually hidden "Skip to content" link should be the first focusable element, letting keyboard users bypass repeated navigation.',
        command: `speakable page.html -f text -s voiceover --selector "a[href='#main']"`,
        relatedLink: { href: "/docs/component-patterns", label: "Component Patterns" },
      },
      {
        what: "Tab order matches visual order",
        description:
          "Interactive elements should receive focus in the same order they appear visually. Avoid positive tabindex values.",
        command: `speakable page.html -f json | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(d);console.log(j.filter(n=>n.focusable).map(n=>n.name))"`,
        relatedLink: { href: "/docs/examples", label: "Examples" },
      },
    ],
  },
  {
    title: "Forms",
    items: [
      {
        what: "All inputs have associated labels",
        description:
          "Every form control needs a programmatically associated label via for/id, wrapping, or aria-labelledby. Placeholders are not labels.",
        command: `speakable form.html -f audit`,
        relatedLink: { href: "/docs/accessible-forms", label: "Accessible Forms Guide" },
      },
      {
        what: "Required fields are announced",
        description:
          'Inputs with the required attribute or aria-required="true" should be announced as required by screen readers.',
        command: `speakable form.html -f text -s nvda --selector "input[required]"`,
        relatedLink: { href: "/docs/accessible-forms", label: "Accessible Forms Guide" },
      },
      {
        what: "Error messages are linked to inputs",
        description:
          "When validation fails, error messages should be associated via aria-describedby so they're announced when the input receives focus.",
        command: `speakable form.html -f text -s jaws --selector "[aria-invalid]"`,
        relatedLink: { href: "/docs/common-mistakes", label: "Common Mistakes" },
      },
      {
        what: "Fieldsets group related controls",
        description:
          "Radio buttons and checkbox groups should be wrapped in a fieldset with a legend to provide group context.",
        command: `speakable form.html -f text --selector "fieldset"`,
        relatedLink: { href: "/docs/accessible-forms", label: "Accessible Forms Guide" },
      },
    ],
  },
  {
    title: "Dynamic Content",
    items: [
      {
        what: "Status messages use aria-live regions",
        description:
          'Content that updates dynamically (success messages, counters) should be in an aria-live="polite" region so screen readers announce changes.',
        command: null,
        relatedLink: { href: "/docs/component-patterns", label: "Component Patterns" },
      },
      {
        what: "Loading states communicate progress",
        description:
          'Spinners and loading indicators should use role="progressbar" or aria-busy="true" to inform assistive technology that content is loading.',
        command: null,
        relatedLink: { href: "/docs/examples", label: "Examples" },
      },
      {
        what: 'Toast notifications use role="alert"',
        description:
          "Transient notifications should use role=\"alert\" or aria-live=\"assertive\" to interrupt the user and announce immediately.",
        command: `speakable toast.html -f text -s all`,
        relatedLink: { href: "/docs/component-patterns", label: "Component Patterns" },
      },
    ],
  },
  {
    title: "Media",
    items: [
      {
        what: "Images have alt text (or are decorative)",
        description:
          'Informative images need descriptive alt text. Decorative images should use alt="" to be hidden from screen readers.',
        command: `speakable page.html -f audit | grep "image"`,
        relatedLink: { href: "/docs/common-mistakes", label: "Common Mistakes: Image without alt" },
      },
      {
        what: "Videos have captions/transcripts",
        description:
          "Video content must have synchronized captions for deaf users and transcripts for deafblind users.",
        command: null,
      },
      {
        what: "Icons used as buttons have accessible names",
        description:
          "Icon buttons without visible text must have aria-label or visually hidden text to communicate their purpose.",
        command: `speakable page.html -f text --selector "button"`,
        relatedLink: { href: "/docs/common-mistakes", label: "Common Mistakes: Button with no name" },
      },
    ],
  },
  {
    title: "Tables",
    items: [
      {
        what: "Data tables have headers",
        description:
          "Use <th> elements with proper scope attributes so screen readers can associate data cells with their column or row headers.",
        command: `speakable table.html -f text -s nvda --selector "table"`,
        relatedLink: { href: "/docs/examples", label: "Examples" },
      },
      {
        what: "Caption or aria-label identifies table purpose",
        description:
          "Every data table should have a <caption> or aria-label that describes what data the table presents.",
        command: `speakable table.html -f audit`,
      },
      {
        what: "Layout tables don't use table semantics",
        description:
          'Tables used purely for layout should have role="presentation" to prevent screen readers from announcing table structure.',
        command: null,
      },
    ],
  },
  {
    title: "Custom Widgets",
    items: [
      {
        what: "Custom controls have correct ARIA roles",
        description:
          "Non-native widgets (tabs, accordions, menus) must have appropriate ARIA roles so screen readers announce their type correctly.",
        command: `speakable widget.html -f text -s all`,
        relatedLink: { href: "/docs/component-patterns", label: "Component Patterns" },
      },
      {
        what: "States are communicated (expanded, checked, etc.)",
        description:
          "Dynamic states like aria-expanded, aria-checked, and aria-selected must update when the user interacts with the widget.",
        command: `speakable widget.html -f json | grep "state"`,
        relatedLink: { href: "/docs/examples", label: "Examples" },
      },
      {
        what: "Keyboard interaction follows ARIA patterns",
        description:
          "Custom widgets should follow the ARIA Authoring Practices keyboard patterns (arrow keys for tabs, Enter/Space for buttons, etc.).",
        command: null,
        relatedLink: { href: "/docs/component-patterns", label: "Component Patterns" },
      },
    ],
  },
];

export default function TestingChecklistPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Testing Checklist</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Screen Reader Testing Checklist
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          A structured checklist for verifying screen reader accessibility with Speakable.
          Work through each category to catch common issues before they reach users.
          This complements, but does not replace, manual testing with real assistive technology.
        </p>
      </header>

      {CATEGORIES.map((category) => (
        <section key={category.title} className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{category.title}</h2>
          <div className="space-y-4">
            {category.items.map((item, idx) => (
              <div
                key={idx}
                className="p-5 border border-slate-200 rounded-xl bg-white hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox indicator (visual only) */}
                  <div
                    className="mt-0.5 shrink-0 w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="w-2.5 h-2.5 rounded-sm bg-transparent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-sm leading-snug">
                      {item.what}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {item.command && (
                      <div className="mt-3 rounded-lg overflow-hidden bg-slate-900">
                        <div className="px-3 py-1.5 bg-white/5 border-b border-white/10">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            CLI
                          </span>
                        </div>
                        <div className="p-3 overflow-x-auto">
                          <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                            {item.command}
                          </pre>
                        </div>
                      </div>
                    )}

                    {!item.command && (
                      <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                        <p className="text-xs text-slate-500 italic">
                          Manual verification required: check source code directly.
                        </p>
                      </div>
                    )}

                    {item.relatedLink && (
                      <div className="mt-2">
                        <Link
                          href={item.relatedLink.href}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            arrow_forward
                          </span>
                          {item.relatedLink.label}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Workflow tip */}
      <section className="mb-16">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5" aria-hidden="true">
              lightbulb
            </span>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Suggested workflow</p>
              <p className="text-sm text-blue-800">
                Start with <code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">speakable page.html -f audit</code> to
                get an overview of issues, then use targeted selectors to verify specific elements.
                Integrate into your{" "}
                <Link href="/docs/cicd-integration" className="text-blue-700 underline hover:text-blue-900">
                  CI/CD pipeline
                </Link>{" "}
                to catch regressions automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      <RelatedPages
        pages={[
          {
            href: "/docs/testing-strategy",
            title: "Testing Strategy",
            description: "Learn how to build a comprehensive accessibility testing strategy combining automated and manual approaches.",
          },
          {
            href: "/docs/cicd-integration",
            title: "CI/CD Integration",
            description: "Set up Speakable in your CI pipeline to catch accessibility regressions before they ship.",
          },
          {
            href: "/docs/testing-ecosystem",
            title: "Testing Ecosystem",
            description: "See how Speakable fits alongside other accessibility testing tools like axe-core and Pa11y.",
          },
          {
            href: "/docs/common-mistakes",
            title: "Common Mistakes",
            description: "Real-world HTML patterns that break screen reader experiences and how to fix them.",
          },
        ]}
      />
    </>
  );
}
