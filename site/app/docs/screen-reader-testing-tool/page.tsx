import Link from "next/link";
import type { Metadata } from "next";
import { RelatedPages } from "../../../components/RelatedPages";

export const metadata: Metadata = {
  title: "Screen Reader Testing Tool for Developers",
  description:
    "Predict NVDA, JAWS, VoiceOver, and Narrator output for any HTML. Speakable is a CLI screen reader testing tool that fits into your dev workflow.",
  openGraph: {
    title: "Screen Reader Testing Tool for Developers",
    description:
      "Predict NVDA, JAWS, VoiceOver, and Narrator output for any HTML.",
    url: "https://getspeakable.dev/docs/screen-reader-testing-tool",
  },
};

export default function ScreenReaderTestingToolPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Screen Reader Testing Tool</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Screen Reader Testing Tool for Developers
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          A screen reader testing tool predicts what assistive technology will announce for your HTML,
          without requiring you to install or run a screen reader. Speakable is an open-source CLI that
          parses HTML into an accessibility tree, then applies heuristic renderers for NVDA, JAWS,
          VoiceOver, and Narrator to produce the predicted speech output. It runs anywhere Node.js
          runs: your terminal, CI pipelines, or AI coding assistants via MCP.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Is a Screen Reader Testing Tool?</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Screen reader testing tools analyze your HTML markup and predict how assistive technologies
          will interpret and announce it. They sit between writing code and launching a full screen
          reader, catching issues during development rather than after deployment.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Traditional accessibility testing tools (like axe-core or Lighthouse) check for rule violations:
          missing alt text, incorrect ARIA attributes, color contrast ratios. A screen reader testing tool
          goes further by answering the question: "What will users actually hear?" This includes
          announcement order, role descriptions, state communication, and the differences between how
          each screen reader phrases things.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable is this kind of tool. It does not emulate a screen reader (no speech synthesis,
          no virtual cursor). Instead, it applies heuristic models based on documented screen reader
          behavior to predict the speech output line by line.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How Speakable Predicts Screen Reader Output</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable works in three stages: parse, extract, render.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">1. Parse HTML</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          HTML is parsed using jsdom with error recovery. Malformed markup is handled gracefully,
          producing warnings rather than failing. This means you can feed it partial components,
          full pages, or even markup piped from a running dev server.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">2. Extract Accessibility Tree</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The parsed DOM is walked to build a canonical accessibility tree following the ARIA
          specification. Each node in the tree has a computed role, accessible name, description,
          value, states (expanded, selected, checked, disabled, required, etc.), and focus information.
          The accessible name computation follows the W3C accname algorithm.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">3. Render Predictions</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The accessibility tree is passed through heuristic renderers. Each renderer models
          the announcement patterns of a specific screen reader:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2 leading-relaxed">
          <li><strong>NVDA</strong>: Announces name first, then role, then state. Uses "not selected", "unavailable" for disabled.</li>
          <li><strong>JAWS</strong>: Similar to NVDA but strips some punctuation and sometimes adds context from parent containers.</li>
          <li><strong>VoiceOver</strong>: Uses "unselected" instead of "not selected", says "dimmed" instead of "unavailable".</li>
          <li><strong>Narrator</strong>: Adds interaction hints ("to activate, press Enter"), says "disabled" for unavailable elements.</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Supported Screen Readers</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          All four major screen readers are supported on every plan, including free. You can target
          a single reader or compare all four simultaneously with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">-s all</code>.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Getting Started in 60 Seconds</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          No configuration file, no account, no browser extension. Install and run:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`# Analyze a file with all four screen readers
npx @reticular/speakable button.html -f text -s all

# Output:
# === NVDA ===
# Submit form, button
#
# === JAWS ===
# Submit form, button
#
# === VoiceOver ===
# Submit form, button
#
# === Narrator ===
# Submit form, button`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Pipe HTML from a running server:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`curl -s http://localhost:3000 | npx @reticular/speakable - -f text -s voiceover`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Focus on a specific component using CSS selectors:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`npx @reticular/speakable page.html -f text -s all --selector '[role="navigation"]'`}
        </pre>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Screen Reader Testing Tools Catch</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The value of predictive screen reader testing goes beyond what rule-based linters detect.
          Here are the categories of issues Speakable surfaces:
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Missing Accessible Names</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When a button, link, or form control has no computed name, the screen reader announces
          only the role ("button", "link") with no indication of purpose. Speakable's audit mode
          flags these immediately:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`npx @reticular/speakable form.html -f audit
# Reports: "button with no accessible name at root.children[2]"`}
        </pre>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Incorrect ARIA Roles</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          A <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">div</code> with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role="button"</code> but
          missing keyboard handling, or a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">listbox</code> without <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">option</code> children.
          The audit identifies structural ARIA misuse.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Heading Hierarchy Gaps</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Screen reader users navigate by headings. A page that jumps from H1 to H3 creates a
          confusing navigation experience. The audit reports heading structure with level details.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Cross-Reader Announcement Differences</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The most unique capability of a screen reader testing tool is showing how the same HTML
          produces different speech across readers. A component might say "unselected" on VoiceOver
          but "not selected" on NVDA. These differences matter for documentation and user support.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Comparing Screen Reader Testing Approaches</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Different testing approaches serve different purposes. Here is how they compare:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 px-4 font-bold text-slate-900">Approach</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">What It Tests</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">When to Use</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">Limitations</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Manual (real screen reader)</td>
                <td className="py-3 px-4">Full user experience, timing, interaction</td>
                <td className="py-3 px-4">Final QA before release</td>
                <td className="py-3 px-4">Slow, OS-specific, requires expertise</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Rule-based (axe, Lighthouse)</td>
                <td className="py-3 px-4">WCAG rule violations</td>
                <td className="py-3 px-4">CI/CD, browser DevTools</td>
                <td className="py-3 px-4">Cannot predict speech output</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Predictive (Speakable)</td>
                <td className="py-3 px-4">What screen readers will announce</td>
                <td className="py-3 px-4">Development, CI regression, code review</td>
                <td className="py-3 px-4">Static HTML, heuristic (not perfect)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The strongest workflow combines all three: Speakable in CI to catch regressions early,
          axe-core for rule violations, and manual screen reader testing before major releases.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitations and When to Use Real Screen Readers</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable is a development-time tool, not a replacement for testing with real assistive
          technology. Important limitations:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2 leading-relaxed">
          <li>Static HTML analysis only (does not execute JavaScript in the core CLI; use the runtime engine for dynamic behavior)</li>
          <li>Output is heuristic, not byte-for-byte identical to any screen reader version</li>
          <li>Does not account for user settings (verbosity, punctuation level, speech rate)</li>
          <li>Does not test browse mode vs focus mode behavior</li>
          <li>Does not test timing-dependent interactions (hover delays, animation sequences)</li>
          <li>Does not validate visual presentation (color contrast, font size, viewport behavior)</li>
        </ul>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Use Speakable to catch the 80% of issues that are detectable from markup alone. Reserve
          manual screen reader testing for interaction patterns, timing, and the final user experience
          verification before release.
        </p>
      </section>

      <RelatedPages
        pages={[
          { href: "/docs/automated-screen-reader-testing", title: "Automated Screen Reader Testing", description: "Set up automated testing with CLI, Node API, and CI integration." },
          { href: "/docs/testing-checklist", title: "Screen Reader Testing Checklist", description: "Step-by-step checklist for verifying screen reader compatibility." },
          { href: "/docs/how-to-test-with-screen-reader", title: "How to Test with a Screen Reader", description: "Manual testing guides for VoiceOver, NVDA, JAWS, and Narrator." },
        ]}
      />
    </>
  );
}
