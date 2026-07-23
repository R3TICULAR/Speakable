import Link from "next/link";
import type { Metadata } from "next";
import { RelatedPages } from "../../../components/RelatedPages";

export const metadata: Metadata = {
  title: "Beyond Axe: What Rule-Based Tools Miss",
  description:
    "Axe catches rule violations. Speakable catches what screen readers actually say. Learn what automated accessibility testing misses and how to close the gap.",
  openGraph: {
    title: "Beyond Axe: What Rule-Based Tools Miss",
    description:
      "Axe catches rule violations. Speakable catches what screen readers actually say. Learn what automated accessibility testing misses and how to close the gap.",
    url: "https://getspeakable.dev/docs/beyond-axe",
  },
};

export default function BeyondAxePage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Beyond Axe</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Automated Accessibility Testing Beyond Axe
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Automated accessibility testing beyond axe means going past rule violations and asking
          what screen readers actually announce for your HTML. Axe-core is an excellent tool for
          catching WCAG rule violations: missing alt text, insufficient contrast, invalid ARIA
          attributes. But it cannot predict what NVDA, JAWS, VoiceOver, or Narrator will say.
          Speakable fills this gap by applying heuristic renderers to your accessibility tree and
          producing the predicted speech output for all four major screen readers. Together, axe
          and Speakable cover both compliance and user experience.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Axe-Core Does Well</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Axe-core (and tools built on it, like Lighthouse, pa11y, and jest-axe) is the industry
          standard for automated WCAG testing. It excels at:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li><strong>Rule-based validation</strong>: Checks approximately 80+ WCAG rules covering images, forms, color contrast, document structure, and ARIA usage.</li>
          <li><strong>Fast execution</strong>: Runs in milliseconds against a DOM, making it suitable for unit tests and CI.</li>
          <li><strong>Browser integration</strong>: Works in Puppeteer, Playwright, Cypress, and browser DevTools (the Accessibility tab).</li>
          <li><strong>Low false-positive rate</strong>: Rules are carefully tuned. When axe reports a violation, it is almost always a real issue.</li>
          <li><strong>Industry adoption</strong>: Used by millions of developers, well-documented, and actively maintained.</li>
        </ul>
        <p className="text-slate-600 mb-6 leading-relaxed">
          If your project does not yet run axe-core in CI, start there. It catches the most
          common accessibility defects with minimal setup. The question this page addresses is:
          what happens after you pass axe?
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Rule-Based Tools Cannot Catch</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Rule-based tools operate on a simple model: "Does this element violate a known WCAG
          success criterion?" This model has blind spots that affect real screen reader users.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Announcement Quality</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          A button can have an accessible name (passing all axe rules) but that name can be
          confusing, redundant, or overly verbose. Consider:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`<!-- Passes axe: button has an accessible name -->
<button aria-label="Click here to submit the contact form to send your message">
  Submit
</button>

<!-- What NVDA announces: -->
<!-- "Click here to submit the contact form to send your message, button" -->
<!-- The visible text "Submit" is overridden by the verbose aria-label -->`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Axe will pass this button because it has a name. But the name is redundant (it
          restates what is already visually obvious) and verbose (30 words where 1 would suffice).
          Speakable shows you the full announcement so you can judge quality, not just compliance.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Cross-Reader Differences</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Axe checks against a single accessibility API model. It cannot tell you that VoiceOver
          says "dimmed" while NVDA says "unavailable" for the same disabled button, or that
          Narrator adds "to activate, press Enter" while others do not. These differences affect
          how users understand your interface:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`npx @reticular/speakable disabled-button.html -f text -s all

# === NVDA ===
# Save changes, button, unavailable
#
# === VoiceOver ===
# Save changes, dimmed, button
#
# === Narrator ===
# Save changes, button, disabled`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          All three pass axe. But a developer writing documentation or training materials needs
          to know that users will hear different words depending on their reader. Speakable reveals
          these differences.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Verbosity and Redundancy</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Some ARIA patterns cause screen readers to repeat information. A link inside a
          navigation landmark might announce as "navigation, list, list item, link, Home" when
          the user just wants to hear "Home, link". Axe does not flag this because no rule is
          violated. The semantics are technically correct but the experience is noisy.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable shows you exactly how verbose the output is for each element, helping you
          identify where to simplify structure or remove redundant ARIA annotations.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Where Speakable Fills the Gap</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable and axe address different questions. Here is how they compare:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 px-4 font-bold text-slate-900">Capability</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">Axe-Core</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">Speakable</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Detects missing accessible names</td>
                <td className="py-3 px-4">Yes</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Detects invalid ARIA attributes</td>
                <td className="py-3 px-4">Yes</td>
                <td className="py-3 px-4">Partially (in audit mode)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Color contrast checking</td>
                <td className="py-3 px-4">Yes</td>
                <td className="py-3 px-4">No (not speech-related)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Predicts speech output per reader</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">Yes (NVDA, JAWS, VoiceOver, Narrator)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Shows cross-reader differences</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Detects verbose/redundant announcements</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Regression diffing (before/after)</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">Yes (diff mode)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Announcement order analysis</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">Yes</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Heading hierarchy check</td>
                <td className="py-3 px-4">Yes</td>
                <td className="py-3 px-4">Yes (in audit mode)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Runs in browser (Puppeteer/Playwright)</td>
                <td className="py-3 px-4">Yes</td>
                <td className="py-3 px-4">No (CLI/Node API)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The tools are complementary. Axe catches the "is this valid?" question. Speakable
          catches the "what will users hear?" question. Running both gives you confidence in
          both compliance and user experience.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Using Both Together</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The most robust CI pipeline runs both axe and Speakable on every pull request. Axe
          catches rule violations, Speakable catches speech output regressions. Here is a combined
          GitHub Actions workflow:
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Combined GitHub Actions Workflow</h3>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`name: Accessibility CI
on: [pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      # Step 1: Rule-based checks with axe
      - name: Run axe-core checks
        run: |
          npx playwright install --with-deps chromium
          npx playwright test --project=accessibility
        # Assumes you have Playwright tests that run axe on rendered pages

      # Step 2: Predictive screen reader checks with Speakable
      - name: Run Speakable audit
        run: |
          npx @reticular/speakable src/components/*.html -f audit
          # Exit code 1 if issues found (missing names, broken hierarchy)

      # Step 3: Regression check against baselines
      - name: Check for screen reader regressions
        run: |
          npx @reticular/speakable src/components/Button.html \\
            --diff baselines/Button.baseline.txt -f text -s all
          # Exit code 2 if output differs from baseline`}
        </pre>
        <p className="text-slate-600 mb-6 leading-relaxed">
          This workflow catches three categories of problems: WCAG rule violations (step 1),
          new accessibility defects in HTML (step 2), and regressions in existing screen reader
          output (step 3). A pull request must pass all three to merge.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitations of Both Approaches</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Neither axe nor Speakable replaces manual testing with real assistive technology.
          Both operate on static representations (DOM for axe, HTML for Speakable) and cannot
          test:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li><strong>Keyboard interaction patterns</strong>: Focus traps, roving tabindex, escape key handling.</li>
          <li><strong>Live region timing</strong>: Whether aria-live announcements interrupt appropriately or arrive too late.</li>
          <li><strong>Mode switching</strong>: How NVDA/JAWS transition between browse mode and focus mode.</li>
          <li><strong>Cognitive flow</strong>: Whether the overall page structure makes sense to navigate without vision.</li>
          <li><strong>Speech synthesis behavior</strong>: Pronunciation of unusual words, handling of abbreviations, speech pauses.</li>
        </ul>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Additionally, axe's scope is limited to approximately 57% of WCAG success criteria
          (per Deque's own documentation). Many criteria require human judgment: "Is this text
          meaningful?", "Is this instruction clear?", "Is this error message helpful?"
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable's scope is limited to static HTML analysis (unless you use the runtime engine
          for dynamic content). It produces heuristic predictions, not exact transcripts of any
          specific screen reader version. The predictions are strong for common patterns and may
          diverge for edge cases or very new screen reader features.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The recommended approach: run both tools in CI to catch what automation can catch, then
          schedule manual screen reader testing before each major release. This gives you fast
          feedback on every commit plus deep verification at key milestones.
        </p>
      </section>

      <RelatedPages
        pages={[
          { href: "/docs/automated-screen-reader-testing", title: "Automated Screen Reader Testing", description: "Set up automated screen reader testing with CLI, Node API, and CI integration." },
          { href: "/docs/cicd-integration", title: "CI/CD Integration", description: "Add screen reader testing to GitHub Actions and CI pipelines." },
          { href: "/docs/testing-strategy", title: "Testing Strategy", description: "Build a testing strategy combining rule-based, predictive, and manual approaches." },
        ]}
      />
    </>
  );
}
