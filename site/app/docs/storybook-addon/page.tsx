import Link from 'next/link';
import type { Metadata } from 'next';
import { RelatedPages } from '../../../components/RelatedPages';

export const metadata: Metadata = {
  title: "Storybook Screen Reader Addon: Predict Accessibility Output Per Component",
  description: "See predicted NVDA, JAWS, VoiceOver, and Narrator output for every Storybook story. The Speakable addon shows real-time screen reader predictions as you develop components.",
};

export default function StorybookAddonPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Storybook Addon</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Storybook Screen Reader Addon
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          The Speakable Storybook addon predicts screen reader output for every component story in real time.
          See what NVDA, JAWS, VoiceOver, and Narrator would announce without leaving your component
          development workflow. Catch accessibility issues while you build, not after you ship.
        </p>
      </header>

      {/* Screenshot */}
      <figure className="mb-16">
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg">
          <img
            src="/images/addon-example.png"
            alt="Speakable Storybook addon showing predicted NVDA screen reader output for a form component with checkboxes, radio buttons, and text inputs"
            className="w-full h-auto"
            loading="eager"
          />
        </div>
        <figcaption className="text-sm text-slate-500 mt-3 text-center">
          The Speakable addon panel in Storybook, showing predicted NVDA output for a form with mixed states.
        </figcaption>
      </figure>

      {/* What It Does */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What the Addon Shows You</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The addon adds a &quot;Screen Readers&quot; panel to Storybook. When you render any story, it
          instantly shows predicted speech output for four screen readers, plus an accessibility audit.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Per-Reader Predictions</h3>
            <p className="text-sm text-slate-600">
              Separate tabs for NVDA, JAWS, VoiceOver, and Narrator. Each produces genuinely
              different output reflecting how that reader handles roles, states, and announcement order.
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Live Updates on Interaction</h3>
            <p className="text-sm text-slate-600">
              Click a button, expand a dropdown, or toggle a checkbox in your story. The predicted
              output updates immediately to reflect the new ARIA states.
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Accessibility Audit</h3>
            <p className="text-sm text-slate-600">
              The Audit tab flags missing accessible names, heading hierarchy violations, and
              unnamed landmarks with severity levels and suggestions.
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Element Statistics</h3>
            <p className="text-sm text-slate-600">
              A stats bar shows total elements, interactive elements, landmarks, and headings
              for quick structural awareness.
            </p>
          </div>
        </div>
      </section>

      {/* Cross-Reader Differences */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How Screen Reader Output Differs Per Reader</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The addon uses the same Speakable engine that powers the CLI and MCP server. Each reader produces
          genuinely differentiated output. Here are some common differences you will see across tabs:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-900">Element</th>
                <th className="py-3 px-4 font-bold text-slate-900">NVDA</th>
                <th className="py-3 px-4 font-bold text-slate-900">JAWS</th>
                <th className="py-3 px-4 font-bold text-slate-900">VoiceOver</th>
                <th className="py-3 px-4 font-bold text-slate-900">Narrator</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Link</td>
                <td className="py-3 px-4 font-mono text-xs">Home, link</td>
                <td className="py-3 px-4 font-mono text-xs">Home, clickable</td>
                <td className="py-3 px-4 font-mono text-xs">Home, link</td>
                <td className="py-3 px-4 font-mono text-xs">link, Home</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Heading</td>
                <td className="py-3 px-4 font-mono text-xs">Welcome, heading level 1</td>
                <td className="py-3 px-4 font-mono text-xs">Welcome, heading 1</td>
                <td className="py-3 px-4 font-mono text-xs">heading level 1, Welcome</td>
                <td className="py-3 px-4 font-mono text-xs">Heading level 1, Welcome</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Navigation</td>
                <td className="py-3 px-4 font-mono text-xs">Main, navigation landmark</td>
                <td className="py-3 px-4 font-mono text-xs">Main, navigation region</td>
                <td className="py-3 px-4 font-mono text-xs">navigation, Main</td>
                <td className="py-3 px-4 font-mono text-xs">navigation, Main</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Image</td>
                <td className="py-3 px-4 font-mono text-xs">Logo, graphic</td>
                <td className="py-3 px-4 font-mono text-xs">Logo, graphic</td>
                <td className="py-3 px-4 font-mono text-xs">Logo, image</td>
                <td className="py-3 px-4 font-mono text-xs">Logo, image</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Disabled button</td>
                <td className="py-3 px-4 font-mono text-xs">Save, button, unavailable</td>
                <td className="py-3 px-4 font-mono text-xs">Save, button, unavailable</td>
                <td className="py-3 px-4 font-mono text-xs">Save, button, dimmed</td>
                <td className="py-3 px-4 font-mono text-xs">Save, button, disabled</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Checkbox (unchecked)</td>
                <td className="py-3 px-4 font-mono text-xs">Accept, checkbox, not checked</td>
                <td className="py-3 px-4 font-mono text-xs">Accept, check box, not checked</td>
                <td className="py-3 px-4 font-mono text-xs">Accept, checkbox, unchecked</td>
                <td className="py-3 px-4 font-mono text-xs">Accept, check box, unchecked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Installation */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Install the Storybook Addon</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The addon ships as part of the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">@reticular/speakable</code> package.
          No extra package to install. If you already use Speakable for CLI or MCP, you have the addon ready.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Step 1: Install Speakable</h3>
        <p className="text-slate-600 mb-3 text-sm">
          If you have not installed Speakable yet:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-8">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`npm install --save-dev @reticular/speakable`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Step 2: Add to Storybook Config</h3>
        <p className="text-slate-600 mb-3 text-sm">
          Add the addon to your <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">.storybook/main.ts</code> (or <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">.storybook/main.js</code>):
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-8">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">.storybook/main.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import type { StorybookConfig } from '@storybook/your-framework';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@reticular/speakable/storybook', // Add this line
  ],
  framework: '@storybook/react-vite', // or your framework
};

export default config;`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Step 3: Start Storybook</h3>
        <p className="text-slate-600 mb-3 text-sm">
          Start Storybook as usual. The &quot;Screen Readers&quot; panel appears at the bottom alongside
          your other addon panels (Actions, Controls, etc.):
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`npm run storybook`}
            </pre>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          No configuration required beyond adding it to your addons array. The addon automatically
          analyzes every rendered story.
        </p>
      </section>

      {/* How It Works */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How the Addon Works Under the Hood</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <p>A Storybook decorator wraps every story. After each render, it captures the story&apos;s live DOM.</p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <p>The core Speakable engine builds an accessibility tree from the DOM: roles, names, states, values, and hierarchy.</p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">3.</span>
            <p>Four separate renderers produce output for NVDA, JAWS, VoiceOver, and Narrator, each with its own announcement order, role vocabulary, and state phrasing.</p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">4.</span>
            <p>A MutationObserver watches for DOM changes (attribute mutations on ARIA states, child additions/removals). When the component updates, predictions refresh automatically.</p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">5.</span>
            <p>The audit engine runs concurrently, checking heading hierarchy, landmark structure, and interactive elements for missing accessible names.</p>
          </div>
        </div>
      </section>

      {/* Framework Compatibility */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Supported Frameworks</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The addon works with any Storybook framework that renders to the DOM. The analysis
          runs on the final rendered HTML, so it is framework-agnostic:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            '@storybook/react-vite',
            '@storybook/react-webpack5',
            '@storybook/vue3-vite',
            '@storybook/svelte-vite',
            '@storybook/html-vite',
            '@storybook/web-components-vite',
          ].map(fw => (
            <div key={fw} className="p-3 border border-slate-200 rounded-lg bg-white text-center">
              <code className="text-xs font-mono text-slate-600">{fw}</code>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-4">
          Requires Storybook 8.x. The addon uses the Storybook Manager API and panel registration system
          introduced in Storybook 7, but is tested and optimized for version 8.
        </p>
      </section>

      {/* Using with Controls */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Using the Addon with Storybook Controls</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Combine the addon with Storybook Controls to explore how prop changes affect screen reader output.
          For example, toggling a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">disabled</code> prop
          will show the reader output update from &quot;button&quot; to &quot;button, unavailable&quot; (NVDA) or
          &quot;button, dimmed&quot; (VoiceOver) in real time.
        </p>
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
          <p className="text-sm text-teal-800 leading-relaxed">
            <strong>Tip:</strong> Write stories that isolate specific ARIA patterns. A story for
            &quot;Button expanded&quot; and another for &quot;Button collapsed&quot; makes cross-reader
            differences immediately obvious without needing to interact.
          </p>
        </div>
      </section>

      {/* Audit Tab */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Understanding the Audit Tab</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The Audit tab runs a lightweight accessibility check on the rendered story. It reports
          issues that would affect screen reader users:
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex gap-3 p-3 border-l-4 border-red-400 bg-red-50 rounded-r-lg">
            <span className="text-red-600 font-bold shrink-0">Error</span>
            <p className="text-sm text-slate-700">Missing accessible name on interactive elements (buttons, links, inputs without labels)</p>
          </div>
          <div className="flex gap-3 p-3 border-l-4 border-amber-400 bg-amber-50 rounded-r-lg">
            <span className="text-amber-600 font-bold shrink-0">Warning</span>
            <p className="text-sm text-slate-700">Heading hierarchy violations (skipped levels), unnamed landmarks</p>
          </div>
          <div className="flex gap-3 p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg">
            <span className="text-blue-600 font-bold shrink-0">Info</span>
            <p className="text-sm text-slate-700">No landmarks found (consider adding semantic structure)</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          The audit runs the same checks as the <Link href="/docs/usage-guide" className="text-blue-600 hover:text-blue-800 underline">CLI audit command</Link> and
          the <Link href="/docs/mcp-integration" className="text-blue-600 hover:text-blue-800 underline">MCP audit_html tool</Link>.
        </p>
      </section>

      {/* Comparison with addon-a11y */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Speakable Addon vs @storybook/addon-a11y</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Both addons help with accessibility, but they solve different problems and work well together:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-900">Aspect</th>
                <th className="py-3 px-4 font-bold text-slate-900">Speakable Addon</th>
                <th className="py-3 px-4 font-bold text-slate-900">@storybook/addon-a11y</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Focus</td>
                <td className="py-3 px-4">Screen reader output prediction</td>
                <td className="py-3 px-4">WCAG rule violations (via axe-core)</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Output</td>
                <td className="py-3 px-4">What users hear, per reader</td>
                <td className="py-3 px-4">Pass/fail rule results</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Best for</td>
                <td className="py-3 px-4">Verifying announcement quality and content</td>
                <td className="py-3 px-4">Catching WCAG compliance issues</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Reader differences</td>
                <td className="py-3 px-4">Yes (4 readers with distinct output)</td>
                <td className="py-3 px-4">No (generic rule-based)</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Use together?</td>
                <td className="py-3 px-4" colSpan={2}>Yes. Use both for comprehensive coverage.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitations and Accuracy</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The addon provides heuristic predictions, not a screen reader emulator. Keep these limitations in mind:
        </p>
        <ul className="space-y-3 text-sm text-slate-600 list-disc pl-5">
          <li>Predictions approximate common screen reader behavior. Real output varies by reader version, user settings, and verbosity level.</li>
          <li>Dynamic focus management (focus trapping, focus restore) is not fully modeled. The addon shows the DOM state, not the focus sequence.</li>
          <li>Live region announcements are shown as static output. The timing and interruption behavior of live regions differs across readers.</li>
          <li>CSS-based hiding (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">display: none</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">visibility: hidden</code>) is detected, but complex CSS state transitions may not be captured on initial render.</li>
        </ul>
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="text-sm text-amber-800">
            <strong>Always verify with real screen readers before release.</strong> The addon is a development-time
            tool for catching obvious issues and understanding cross-reader differences. It does not replace
            testing with NVDA, JAWS, VoiceOver, or Narrator on actual devices.
          </p>
        </div>
      </section>

      <RelatedPages pages={[
        { href: "/docs/screen-reader-comparison", title: "Screen Reader Comparison", description: "Detailed breakdown of how NVDA, JAWS, VoiceOver, and Narrator announce different elements." },
        { href: "/docs/component-patterns", title: "Component Patterns", description: "Accessible patterns for common UI components with predicted screen reader output." },
        { href: "/docs/mcp-integration", title: "MCP Integration", description: "Use Speakable with AI coding assistants via the Model Context Protocol." },
        { href: "/docs/design-systems", title: "Design Systems", description: "Integrating screen reader testing into your design system component library." },
      ]} />
    </>
  );
}
