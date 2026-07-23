import Link from 'next/link';
import type { Metadata } from 'next';
import { RelatedPages } from '../../../components/RelatedPages';

export const metadata: Metadata = {
  title: "Screen Reader Testing in CI/CD Pipelines",
  description: "Add screen reader testing to GitHub Actions. Speakable audits HTML, detects regressions, and fails CI when accessibility degrades.",
};

export default function CiCdIntegrationPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">CI/CD Integration</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Screen Reader Testing in CI/CD Pipelines</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Screen reader testing in CI/CD pipelines catches accessibility regressions on every pull request.
          Run Speakable in your build pipeline to predict screen reader output, audit HTML for issues, and fail
          the build when accessibility degrades. Works with any{' '}
          <Link href="/docs/frameworks" className="text-blue-600 hover:text-blue-800 underline">framework</Link>{' '}
          that produces HTML output, including React, Vue, Svelte, and static site generators.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Installation</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Install Speakable as a dev dependency in your project:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-blue-400">npm install --save-dev</span>{' '}
                <span className="text-emerald-400">@reticular/speakable</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">GitHub Actions</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Add this workflow to run accessibility checks on every push. The audit step catches
          issues, and the diff step detects regressions against a baseline. For a broader view of where CI fits in your{' '}
          <Link href="/docs/testing-strategy" className="text-blue-600 hover:text-blue-800 underline">testing strategy</Link>, see the dedicated guide.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">.github/workflows/a11y.yml</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`name: Accessibility Check

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - run: npm ci

      - name: Run accessibility audit
        run: npx @reticular/speakable ./dist/index.html -f audit

      - name: Check for regressions
        run: npx @reticular/speakable ./dist/index.html --diff ./baseline.html -f text`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">GitLab CI</h2>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">.gitlab-ci.yml</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`accessibility:
  stage: test
  image: node:18
  script:
    - npm ci
    - npx @reticular/speakable ./dist/index.html -f audit
    - npx @reticular/speakable ./dist/index.html --diff ./baseline.html -f text`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Exit Codes</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Use exit codes in CI to fail builds on regressions or errors.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4 font-bold text-slate-900">Code</th>
                <th className="py-3 pr-4 font-bold text-slate-900">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">0</td>
                <td className="py-3">Analysis completed successfully, no regressions</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">1</td>
                <td className="py-3">User error: invalid arguments or options</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">2</td>
                <td className="py-3">Content error: accessibility issues found, or diff detected changes</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">3</td>
                <td className="py-3">System error: file not found, I/O failure</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">JSON Output</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">-f json</code> to
          get machine-readable output for programmatic comparison:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">JSON Output</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`{
  "version": { "major": 1, "minor": 0 },
  "root": {
    "role": "button",
    "name": "Submit",
    "state": {},
    "focus": { "focusable": true },
    "children": []
  },
  "metadata": {
    "extractedAt": "2026-04-02T12:00:00Z"
  }
}`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Baseline Workflow</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Save a baseline of your current accessibility state, then compare against it after
          making changes. This is the recommended workflow for regression detection.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Step 1 - Save baseline</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># Save the current accessibility model as a baseline</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-f json -o baseline.json</span>
              </code>
            </pre>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Step 2 - Make changes and compare</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># After making HTML changes, diff against the baseline</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">--diff baseline.html</span>{'\n\n'}
                <span className="text-slate-500"># Or get text-formatted diff output</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">--diff baseline.html -f text</span>
              </code>
            </pre>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Step 3 - Automate in CI</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># In your CI pipeline, fail on regressions</span>{'\n'}
                <span className="text-blue-400">npx @reticular/speakable</span>{' '}
                <span className="text-emerald-400">./dist/index.html</span>{' '}
                <span className="text-orange-300">--diff ./baseline.html</span>{' '}
                <span className="text-slate-300">||</span>{' '}
                <span className="text-slate-300">echo</span>{' '}
                <span className="text-orange-300">&quot;Accessibility regression detected&quot;</span>
              </code>
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mt-6 leading-relaxed">
          Commit <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">baseline.html</code> to
          your repository. When the diff detects changes, the CLI exits with code 2, which
          fails the CI step. Update the baseline intentionally when accessibility changes are expected.
          See the{' '}
          <Link href="/docs/testing-ecosystem" className="text-blue-600 hover:text-blue-800 underline">testing ecosystem</Link>{' '}
          page to learn how Speakable CI checks complement runtime tools like Guidepup. For CLI options and programmatic usage, check the{' '}
          <Link href="/docs/usage-guide" className="text-blue-600 hover:text-blue-800 underline">usage guide</Link>.
        </p>
      </section>

      <RelatedPages pages={[
        { href: "/docs/frameworks", title: "Frameworks", description: "Integrate Speakable into React, Angular, Svelte, or Web Component workflows." },
        { href: "/docs/testing-ecosystem", title: "Testing Ecosystem", description: "How Speakable fits alongside Guidepup, axe-core, and manual testing." },
        { href: "/docs/testing-strategy", title: "Testing Strategy", description: "Plan a layered accessibility testing approach that balances speed and confidence." },
        { href: "/docs/usage-guide", title: "Usage Guide", description: "CLI options, programmatic API, and output formats for Speakable." },
      ]} />
    </>
  );
}
