import Link from "next/link";
import type { Metadata } from "next";
import { RelatedPages } from "../../../components/RelatedPages";

export const metadata: Metadata = {
  title: "Screen Reader Regression Testing",
  description:
    "Detect when code changes break screen reader announcements. Speakable diffs accessibility trees and flags regressions in CI.",
  openGraph: {
    title: "Screen Reader Regression Testing",
    description:
      "Detect when code changes break screen reader announcements. Speakable diffs accessibility trees and flags regressions in CI.",
    url: "https://getspeakable.dev/docs/screen-reader-regression-testing",
  },
};

export default function ScreenReaderRegressionTestingPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Screen Reader Regression Testing</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Screen Reader Regression Testing
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Screen reader regression testing detects when code changes unintentionally break the
          announcements that assistive technology makes for your interface. A component that
          correctly announced "Submit form, button" yesterday might announce just "button" today
          because someone removed a label during a refactor. Speakable's diff mode compares the
          predicted screen reader output of two HTML versions and flags the differences, giving
          you a clear signal in CI that something changed. This heuristic-based approach catches
          accessibility regressions the same way visual regression testing catches UI regressions.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Is an Accessibility Regression?</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          An accessibility regression is any code change that degrades the assistive technology
          experience. Unlike a bug introduced in new code, a regression breaks something that
          previously worked. These are particularly insidious because they often pass code review
          (the visual appearance is unchanged) and automated rule checks (axe still passes because
          no WCAG rule is technically violated).
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Examples of Screen Reader Regressions</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Here are concrete examples of regressions that predictive testing can catch:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 px-4 font-bold text-slate-900">Before (working)</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">After (regressed)</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">What happened</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4">"Submit form, button"</td>
                <td className="py-3 px-4">"button"</td>
                <td className="py-3 px-4">Accessible name was lost (label removed)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4">"Navigation, list, 5 items"</td>
                <td className="py-3 px-4">"list, 5 items"</td>
                <td className="py-3 px-4">nav element was changed to a div</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4">"Show details, expanded, button"</td>
                <td className="py-3 px-4">"Show details, button"</td>
                <td className="py-3 px-4">aria-expanded attribute was removed</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4">"Email, required, edit"</td>
                <td className="py-3 px-4">"edit"</td>
                <td className="py-3 px-4">Label element association was broken</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4">"Search results, heading level 2"</td>
                <td className="py-3 px-4">"Search results, heading level 4"</td>
                <td className="py-3 px-4">Heading level was changed, breaking hierarchy</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Each of these regressions is invisible in a visual diff. The page looks identical. But
          the screen reader experience is degraded: users lose context, cannot identify elements,
          or encounter broken navigation patterns.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How Speakable Detects Regressions</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable's diff mode compares the predicted screen reader output of two HTML files
          (typically a "before" version and an "after" version) and reports any differences in
          the announcements.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">The Diff Algorithm</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable builds the accessibility tree for both HTML inputs, runs both through the
          same heuristic renderers, and then compares the output line by line. It identifies:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li><strong>Removed announcements</strong>: Lines present in "before" but missing in "after" (elements that lost accessibility).</li>
          <li><strong>Added announcements</strong>: Lines present in "after" but not in "before" (new elements, which may or may not be intentional).</li>
          <li><strong>Changed announcements</strong>: Lines that exist in both but differ in content (name changes, role changes, state changes).</li>
        </ul>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Here is the diff command in action:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`npx @reticular/speakable before.html --diff after.html -f text

# Output:
# NVDA Differences:
# - Submit form, button
# + button
#
# VoiceOver Differences:
# - Submit form, button
# + button
#
# Summary: 2 regressions detected across 2 readers`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The minus sign indicates what the element used to announce. The plus sign indicates what
          it now announces. In this case, the button lost its accessible name across all readers.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Exit Codes for CI</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable uses exit codes to signal results to CI systems:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li><strong>Exit code 0</strong>: No differences detected. The screen reader output is identical.</li>
          <li><strong>Exit code 1</strong>: Audit issues found (when using -f audit mode).</li>
          <li><strong>Exit code 2</strong>: Diff detected changes in screen reader output.</li>
        </ul>
        <p className="text-slate-600 mb-4 leading-relaxed">
          In a CI pipeline, exit code 2 causes the job to fail, blocking the pull request until
          the regression is reviewed. The developer can then either fix the regression or update
          the baseline if the change is intentional.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">JSON Output for Programmatic Use</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          For integration with custom tooling or dashboards, use JSON output:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`npx @reticular/speakable before.html --diff after.html -f json -s all

# Returns structured JSON:
# {
#   "hasDifferences": true,
#   "readers": {
#     "nvda": {
#       "removed": ["Submit form, button"],
#       "added": ["button"],
#       "changed": []
#     },
#     "voiceover": {
#       "removed": ["Submit form, button"],
#       "added": ["button"],
#       "changed": []
#     }
#   },
#   "summary": { "totalRegressions": 2, "readersAffected": 2 }
# }`}
        </pre>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Setting Up Regression Testing</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Regression testing requires two things: a baseline (the known-good output) and a way
          to compare against that baseline on every change.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Creating Baselines</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Generate baselines for each component after you have verified the output is correct
          (either through manual testing or Speakable's text output):
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`# Generate baseline files for your components
npx @reticular/speakable src/Button.html -f json -s all > baselines/Button.json
npx @reticular/speakable src/NavBar.html -f json -s all > baselines/NavBar.json
npx @reticular/speakable src/LoginForm.html -f json -s all > baselines/LoginForm.json

# Commit these baselines to version control
git add baselines/
git commit -m "Add screen reader output baselines"`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          These baseline files serve the same purpose as snapshot files in visual regression
          testing. They represent the expected screen reader output for each component.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Diffing Against Baselines on Every PR</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          On each pull request, regenerate the output and compare against the stored baselines.
          If anything changed, the CI job fails and the PR author sees exactly what regressed:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`# Compare current output against baseline
npx @reticular/speakable src/Button.html --diff baselines/Button.json -f json -s all

# If output matches: exit code 0 (pass)
# If output differs: exit code 2 (fail with diff details)`}
        </pre>

        <h3 className="text-lg font-bold text-slate-900 mb-3">GitHub Actions Example</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Here is a complete GitHub Actions workflow for screen reader regression testing:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`name: Screen Reader Regression
on: [pull_request]

jobs:
  regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Check for screen reader regressions
        run: |
          EXIT_CODE=0
          for baseline in baselines/*.json; do
            component="src/$(basename "$baseline" .json).html"
            if [ -f "$component" ]; then
              npx @reticular/speakable "$component" \\
                --diff "$baseline" -f json -s all || EXIT_CODE=$?
            fi
          done
          exit $EXIT_CODE

      - name: Comment on PR if regressions found
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Screen reader regression detected. Run \`npx @reticular/speakable <file> --diff baselines/<file>.json -f text -s all\` locally to see details.'
            })`}
        </pre>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Interpreting Diff Output</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When Speakable detects a regression, the output shows what changed for each screen
          reader. Here is how to read the diff:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`npx @reticular/speakable form.html --diff baselines/form.json -f text -s all

# NVDA Differences:
# - Email address, edit, required
# + edit, required
#   Password, edit, required        (unchanged)
# - Remember me, check box, not checked
# + Remember me, check box
#   Sign in, button                 (unchanged)
#
# 2 changes detected for NVDA`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Reading this diff: the email field lost its accessible name ("Email address" became
          just "edit"). The checkbox lost its checked state announcement. Both are regressions
          that would confuse screen reader users. The password field and submit button are
          unchanged.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Common causes of regressions include: removing or renaming label elements, changing
          HTML element types (nav to div, button to span), removing ARIA attributes during
          refactoring, and CSS changes that affect display property (which can hide elements from
          the accessibility tree).
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">False Positives and How to Handle Them</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Not every diff indicates a real regression. Some changes are intentional. Here are
          common false positive scenarios and how to handle them:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li><strong>Intentional label changes</strong>: You renamed a button from "Save" to "Save Changes". The diff shows the old name removed and new name added. This is expected. Update the baseline.</li>
          <li><strong>New elements added</strong>: You added a new field to a form. The diff shows additions. Verify they announce correctly, then update the baseline.</li>
          <li><strong>Structural improvements</strong>: You changed a div to a nav element. The diff shows a new landmark announcement. This is an improvement, not a regression. Update the baseline.</li>
          <li><strong>Component reordering</strong>: You moved a section higher on the page. The announcement content is identical but the order changed. Verify the new order is logical, then update the baseline.</li>
        </ul>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When a diff appears, the workflow is:
        </p>
        <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>Read the diff. Is this change intentional?</li>
          <li>If yes: regenerate the baseline with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">npx @reticular/speakable src/Component.html -f json -s all {">"} baselines/Component.json</code> and commit the updated baseline.</li>
          <li>If no: fix the regression in your code.</li>
          <li>If unclear: run the component in a real screen reader to verify the new behavior is acceptable.</li>
        </ol>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The baseline update step is comparable to updating snapshot tests in Jest or visual
          regression baselines in Chromatic. The diff is a signal that something changed; your
          judgment determines whether the change is acceptable.
        </p>
      </section>

      <RelatedPages
        pages={[
          { href: "/docs/cicd-integration", title: "CI/CD Integration", description: "Full guide to adding Speakable to GitHub Actions and CI pipelines." },
          { href: "/docs/automated-screen-reader-testing", title: "Automated Screen Reader Testing", description: "Set up automated testing with CLI, Node API, and test frameworks." },
          { href: "/docs/beyond-axe", title: "Beyond Axe", description: "What rule-based tools miss and how predictive testing fills the gap." },
        ]}
      />
    </>
  );
}
