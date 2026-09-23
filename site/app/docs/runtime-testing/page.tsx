import Link from 'next/link';
import type { Metadata } from 'next';
import { RelatedPages } from '../../../components/RelatedPages';

export const metadata: Metadata = {
  title: "Runtime Accessibility Testing in the Browser: Iframe Harness and Browser Bundle",
  description: "Test any component's screen reader behavior in a real browser without Storybook. Use the Speakable browser bundle and iframe harness to analyze live DOM, web components, and shadow DOM, and capture interaction timelines over postMessage.",
};

export default function RuntimeTestingPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Runtime Testing in the Browser</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Runtime Accessibility Testing in the Browser
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Runtime accessibility testing in a real browser lets you check what screen readers announce for any
          component, including web components built with Lit or custom elements, without spinning up Storybook.
          Speakable ships two transport-agnostic entry points for this: a browser bundle that analyzes live DOM in
          the current page, and an iframe harness that mounts a component in isolation and drives analysis over
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-base font-mono"> postMessage</code>. Both run the same
          engine as the CLI and the Storybook addon, so output stays consistent across every surface.
        </p>
      </header>

      {/* When to use */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">When to Use the Browser Bundle or Iframe Harness</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable has several runtime surfaces. Pick the one that matches where your component lives:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-900">Surface</th>
                <th className="py-3 px-4 font-bold text-slate-900">Runs in</th>
                <th className="py-3 px-4 font-bold text-slate-900">Best for</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Storybook addon</td>
                <td className="py-3 px-4">Storybook preview iframe</td>
                <td className="py-3 px-4">Component-driven development with Timeline and Diff tabs</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Browser bundle</td>
                <td className="py-3 px-4">The current page (real browser)</td>
                <td className="py-3 px-4">Analyzing live DOM in your own app, test runner, or e2e page</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">Iframe harness</td>
                <td className="py-3 px-4">An isolated iframe you control</td>
                <td className="py-3 px-4">Testing a component in isolation, including web components and shadow DOM</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">CLI runtime</td>
                <td className="py-3 px-4">Node plus a headless browser</td>
                <td className="py-3 px-4">Whole-library regression runs in CI</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-600 mt-4">
          For the Storybook path, see the <Link href="/docs/storybook-addon" className="text-blue-600 hover:text-blue-800 underline">Storybook addon guide</Link>.
          For the CLI path, see <Link href="/docs/runtime-analysis" className="text-blue-600 hover:text-blue-800 underline">Runtime Analysis</Link>.
        </p>
      </section>

      {/* Browser bundle */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Analyze Live DOM with the Browser Bundle</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The browser bundle is exported at <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">@reticular/speakable/browser</code>.
          It runs against live DOM in the current page, so it captures JavaScript-set state and open shadow roots
          that a serialized HTML string would lose. Use it inside a test runner (Vitest, Playwright, Web Test
          Runner) or anywhere you already have a live element.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Static analysis with analyzeElement</h3>
        <p className="text-slate-600 mb-3 text-sm">
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">analyzeElement</code> returns per-reader
          output, audit findings, structural stats, and warnings. It never throws on empty or detached input:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-8">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">analyze.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { analyzeElement } from '@reticular/speakable/browser';

const result = analyzeElement(document.querySelector('#widget'));

console.log(result.nvda);    // ["Save changes, button", ...]
console.log(result.audit);   // [{ severity, message, selector }, ...]
console.log(result.stats);   // { totalElements, interactiveElements, ... }
console.log(result.warnings);`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-3 text-sm">
          For web components that hydrate asynchronously, use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">analyzeElementWithUpgrade</code>.
          It awaits custom-element upgrade first, then folds any upgrade warnings into the result:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-8">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">analyze-upgrade.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { analyzeElementWithUpgrade } from '@reticular/speakable/browser';

const result = await analyzeElementWithUpgrade(
  document.querySelector('my-widget')
);`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Capture an interaction timeline with captureTimeline</h3>
        <p className="text-slate-600 mb-3 text-sm">
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">captureTimeline</code> attaches the
          runtime engine to a live document, runs an interaction sequence, and returns a serializable timeline of
          focus moves, state changes, and announcements:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-8">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">capture.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { captureTimeline } from '@reticular/speakable/browser';

const timeline = await captureTimeline(document, {
  componentName: 'Menu',
  sequence: {
    description: 'open and arrow down',
    actions: [
      { type: 'click', selector: '#menu-btn' },
      { type: 'arrowDown' },
    ],
  },
});

for (const event of timeline.events) {
  console.log(event.type, event.target.accessibleName);
}`}
            </pre>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          See the <Link href="/docs" className="text-blue-600 hover:text-blue-800 underline">API reference</Link> for the
          full <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">AnalysisResult</code> shape and
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono"> CaptureOptions</code>.
        </p>
      </section>

      {/* Iframe harness */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Test a Component in Isolation with the Iframe Harness</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The iframe harness, exported at <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">@reticular/speakable/harness</code>,
          mounts a component into an iframe from a URL or an HTML string, injects the browser bundle, and drives
          analysis over <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">postMessage</code>. Because
          it runs in a real browser, open shadow roots and slot projection work correctly, and custom elements are
          awaited before analysis. This is the way to test any component in isolation without Storybook.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Mount, analyze, and capture</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-8">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">harness.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { createHarness } from '@reticular/speakable/harness';

const harness = createHarness({
  target: { container: document.body }, // harness creates + owns the iframe
  bundleUrl: '/speakable-browser.global.js', // the injectable IIFE bundle
});

// Mount a component (HTML string via srcdoc, or a same-origin URL)
await harness.load({ html: '<my-widget>Content</my-widget>' });

// Static analysis, scoped to a selector
const result = await harness.analyze('my-widget');

// Run an interaction sequence and get the timeline
const timeline = await harness.captureTimeline({
  componentName: 'MyWidget',
  sequence: {
    description: 'toggle',
    actions: [{ type: 'click', selector: 'my-widget' }],
  },
});

harness.destroy();`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Where to get the injectable bundle</h3>
        <p className="text-slate-600 mb-4 text-sm">
          The harness injects an IIFE build named <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">speakable-browser.global.js</code>,
          shipped in the package&apos;s <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">dist/</code>. Serve
          it from your app or copy it to a static path, then pass its URL as <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">bundleUrl</code>.
          If the bundle is already present in the iframe, you can omit <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">bundleUrl</code>.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-amber-600 mt-0.5 shrink-0" aria-hidden="true">warning</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Same-origin content only</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                The harness supports HTML strings (mounted via <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 text-xs">srcdoc</code>) and
                same-origin URLs. Cross-origin URLs are rejected with a descriptive error, because a script cannot
                be injected across origins. To test a cross-origin component, embed the bundle in that page and
                omit <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 text-xs">bundleUrl</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Web components */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Testing Web Components and Shadow DOM</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Both the browser bundle and the harness run in a real browser, so they handle web component internals
          that a static Node analysis cannot:
        </p>
        <ul className="space-y-3 text-sm text-slate-600 list-disc pl-5 mb-6">
          <li><strong>Open shadow roots</strong> are traversed, so content rendered inside a custom element&apos;s shadow tree is analyzed.</li>
          <li><strong>Slot projection</strong> is resolved, so light-DOM children projected into a <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">&lt;slot&gt;</code> appear in the correct shadow-tree order.</li>
          <li><strong>Custom-element upgrade</strong> is awaited via <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">customElements.whenDefined</code> and, where present, a Lit-style <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">updateComplete</code> promise, so components are analyzed after hydration.</li>
          <li><strong>Closed shadow roots</strong> cannot be traversed by any tool. Speakable surfaces a warning so partial coverage is not mistaken for full coverage.</li>
        </ul>
        <p className="text-sm text-slate-600">
          Upgrade waiting is bounded by a timeout, so analysis never hangs. If a component does not upgrade in
          time, a warning is added to <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">result.warnings</code> and
          analysis proceeds.
        </p>
      </section>

      <RelatedPages pages={[
        { href: "/docs/storybook-addon", title: "Storybook Addon", description: "Timeline and Diff tabs, per-reader predictions, and parameters.speakable for component-driven development." },
        { href: "/docs/runtime-analysis", title: "Runtime Analysis", description: "The CLI runtime engine, built-in interaction patterns, and Storybook regression runs in CI." },
        { href: "/docs", title: "API Reference", description: "Full signatures for the browser and harness modules, including AnalysisResult and CaptureOptions." },
        { href: "/docs/component-patterns", title: "Component Patterns", description: "Accessible patterns for dialogs, comboboxes, tabs, and more, with predicted screen reader output." },
      ]} />
    </>
  );
}
