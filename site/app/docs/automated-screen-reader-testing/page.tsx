import Link from "next/link";
import type { Metadata } from "next";
import { RelatedPages } from "../../../components/RelatedPages";

export const metadata: Metadata = {
  title: "Automated Screen Reader Testing with Speakable",
  description:
    "Automate screen reader testing in CI/CD. Predict announcements, detect regressions, and batch-analyze components without launching a screen reader.",
  openGraph: {
    title: "Automated Screen Reader Testing with Speakable",
    description:
      "Automate screen reader testing in CI/CD. Predict announcements, detect regressions, and batch-analyze components without launching a screen reader.",
    url: "https://getspeakable.dev/docs/automated-screen-reader-testing",
  },
};

export default function AutomatedScreenReaderTestingPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Automated Screen Reader Testing</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Automated Screen Reader Testing
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Automated screen reader testing lets you predict what assistive technologies will announce
          for your HTML without manually launching a screen reader. Instead of opening VoiceOver or
          NVDA after every change, you run a command or call an API that analyzes your markup and
          returns the predicted speech output for all four major screen readers. Speakable provides
          this capability as a CLI tool, a Node.js library, and an MCP server, so you can integrate
          predictive testing wherever your workflow lives: local development, CI pipelines, or
          AI-assisted coding environments.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why Automate Screen Reader Testing?</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Manual screen reader testing is essential but expensive. Each testing session requires
          launching a specific screen reader on a specific operating system, navigating through
          elements one by one, and listening for correct announcements. This process takes minutes
          per component and cannot scale to hundreds of components across dozens of pull requests
          per week.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Automation addresses the scalability problem. When you automate screen reader testing,
          you get immediate feedback on every code change. A button that loses its accessible name,
          a heading that drops a level, or an ARIA state that stops being communicated: these
          regressions surface within seconds of the commit, not days later during a manual QA pass.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The goal is not to replace manual testing. It is to catch the predictable, markup-level
          issues early so that manual testing sessions can focus on interaction patterns, timing,
          and the subjective quality of the user experience.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable's approach to automation is predictive and heuristic-based. It does not launch
          a screen reader process or synthesize speech. It applies documented announcement patterns
          for NVDA, JAWS, VoiceOver, and Narrator to your accessibility tree and returns what each
          reader is likely to say. This makes it fast (milliseconds per file), portable (runs on
          any OS with Node.js), and deterministic (same input always produces same output).
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How Automated Screen Reader Testing Works</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable's analysis pipeline has three stages. Understanding each stage helps you
          interpret the output and know what the tool can and cannot detect.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Parsing HTML into an Accessibility Tree</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The first stage parses your HTML using jsdom and constructs a DOM tree. From this DOM,
          Speakable builds a canonical accessibility tree following the ARIA specification. Each
          node in the tree includes a computed role (using implicit role mapping and explicit ARIA
          overrides), an accessible name (computed via the W3C accname algorithm), accessible
          description, value, and states such as expanded, selected, checked, disabled, and required.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          This tree represents what the browser would expose to assistive technology through the
          platform accessibility API. It is the same structure that a real screen reader queries,
          minus the runtime state that requires JavaScript execution.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Applying Heuristic Renderers</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Once the accessibility tree is built, Speakable passes it through four independent
          heuristic renderers. Each renderer models the announcement patterns of a specific
          screen reader:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li><strong>NVDA renderer</strong>: Announces name, then role, then state. Uses phrasing like "not checked", "collapsed", "unavailable".</li>
          <li><strong>JAWS renderer</strong>: Similar ordering to NVDA but strips certain punctuation and sometimes injects container context.</li>
          <li><strong>VoiceOver renderer</strong>: Uses Apple-specific phrasing: "dimmed" for disabled, "unselected" for deselected items, trait-based grouping.</li>
          <li><strong>Narrator renderer</strong>: Includes interaction hints ("to activate, press Enter") and uses "disabled" rather than "unavailable" or "dimmed".</li>
        </ul>
        <p className="text-slate-600 mb-4 leading-relaxed">
          These renderers are heuristic models, not exact replicas. They are built from observed
          screen reader behavior across hundreds of test cases and updated as screen readers evolve.
          The output represents a strong prediction of what users will hear, not a byte-for-byte
          transcript of any specific screen reader version.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Producing Predictive Output</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The final stage formats the renderer output into a consumable format. Speakable supports
          multiple output formats: plain text (human-readable), JSON (for programmatic consumption
          and diffing), and audit (structured findings with severity levels). The JSON format is
          particularly useful for automation because it can be parsed, compared against baselines,
          and integrated into test assertions.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Setting Up Automated Tests with Speakable</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable offers three integration points depending on your workflow. All three produce
          the same predictive output; they differ in how you invoke the analysis.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">CLI Usage</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The CLI is the fastest way to add automated screen reader testing to an existing project.
          No configuration files or accounts required:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`# Analyze a single file with all screen readers
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
# Submit form, button, to activate press Enter

# Analyze with JSON output for programmatic use
npx @reticular/speakable nav.html -f json -s all

# Run an audit to find issues
npx @reticular/speakable page.html -f audit
# Exit code 1 if issues found (useful for CI)`}
        </pre>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Node.js API</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          For tighter integration with your test framework or build system, use the Node.js API
          directly. This avoids subprocess overhead and gives you structured objects to assert against:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`import { analyze } from "@reticular/speakable";

const html = \`
  <button aria-pressed="false">
    Toggle Dark Mode
  </button>
\`;

const result = await analyze(html, {
  screenReaders: ["nvda", "jaws", "voiceover", "narrator"],
  format: "json",
});

// result.nvda.announcements:
// [{ text: "Toggle Dark Mode, toggle button, not pressed", role: "button" }]

// result.voiceover.announcements:
// [{ text: "Toggle Dark Mode, toggle button, unselected", role: "button" }]`}
        </pre>

        <h3 className="text-lg font-bold text-slate-900 mb-3">MCP Integration for AI Assistants</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable also ships as an MCP (Model Context Protocol) server, which means AI coding
          assistants can invoke it during code generation. When an AI assistant writes a React
          component, it can call Speakable to verify the accessibility output before presenting
          the code to you. This brings automated screen reader testing directly into the authoring
          step rather than waiting for a CI check.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Batch Testing Multiple Components</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Real projects have dozens or hundreds of components. Testing them one at a time is not
          practical. Speakable supports batch testing through shell expansion, the Node API, or
          a simple script:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`# Batch test all HTML files in a directory
for file in components/*.html; do
  echo "--- $file ---"
  npx @reticular/speakable "$file" -f audit
done

# Or use find for recursive discovery
find ./src -name "*.html" -exec npx @reticular/speakable {} -f audit \\;`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          For programmatic batch testing, the Node API is more efficient because it avoids
          re-initializing the parser for each file:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`import { analyze } from "@reticular/speakable";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const dir = "./components";
const files = (await readdir(dir)).filter(f => f.endsWith(".html"));

const results = await Promise.all(
  files.map(async (file) => {
    const html = await readFile(join(dir, file), "utf-8");
    const result = await analyze(html, {
      screenReaders: ["nvda", "voiceover"],
      format: "json",
    });
    return { file, result };
  })
);

// Filter to files with issues
const issues = results.filter(r =>
  r.result.audit?.findings.length > 0
);
console.log(\`Found issues in \${issues.length} of \${files.length} files\`);`}
        </pre>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Integrating with Your Test Suite</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The most powerful way to use automated screen reader testing is inside your existing
          test framework. This lets you write assertions about what screen readers will announce
          and catch regressions as part of your normal test run. Here is an example using Vitest:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`import { describe, it, expect } from "vitest";
import { analyze } from "@reticular/speakable";

describe("Button component accessibility", () => {
  it("announces the button name and role", async () => {
    const html = \`<button>Save Changes</button>\`;
    const result = await analyze(html, {
      screenReaders: ["nvda"],
      format: "json",
    });

    const announcement = result.nvda.announcements[0].text;
    expect(announcement).toContain("Save Changes");
    expect(announcement).toContain("button");
  });

  it("communicates disabled state across all readers", async () => {
    const html = \`<button disabled>Save Changes</button>\`;
    const result = await analyze(html, {
      screenReaders: ["nvda", "voiceover", "narrator"],
      format: "json",
    });

    const nvda = result.nvda.announcements[0].text;
    const vo = result.voiceover.announcements[0].text;
    const narrator = result.narrator.announcements[0].text;

    expect(nvda).toContain("unavailable");
    expect(vo).toContain("dimmed");
    expect(narrator).toContain("disabled");
  });

  it("includes expanded state for disclosure buttons", async () => {
    const html = \`
      <button aria-expanded="true" aria-controls="panel">
        Show Details
      </button>
    \`;
    const result = await analyze(html, {
      screenReaders: ["nvda"],
      format: "json",
    });

    expect(result.nvda.announcements[0].text).toContain("expanded");
  });
});`}
        </pre>
        <p className="text-slate-600 mb-6 leading-relaxed">
          This approach gives you the same confidence as visual regression testing but for the
          auditory experience. When someone changes a component's markup, the test will fail if
          the screen reader output changes unexpectedly.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Automation Catches vs What It Misses</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Automated screen reader testing is excellent at detecting markup-level issues that affect
          announcements. It is not a complete replacement for manual testing with real assistive
          technology. Here is what falls into each category:
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">What Automated Testing Catches</h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>Missing accessible names on interactive elements (buttons, links, inputs)</li>
          <li>Incorrect or missing ARIA roles</li>
          <li>State attributes not being communicated (aria-expanded, aria-checked, aria-selected)</li>
          <li>Heading hierarchy violations (skipped levels, missing headings)</li>
          <li>Differences in how each screen reader will phrase the same element</li>
          <li>Redundant announcements (role repeated in the name)</li>
          <li>Elements hidden from assistive technology unexpectedly (aria-hidden misuse)</li>
          <li>Landmark structure issues (missing or duplicate landmarks)</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">What Automated Testing Cannot Catch</h3>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2 leading-relaxed">
          <li>Keyboard trap issues (focus gets stuck in a component)</li>
          <li>Timing-dependent behavior (live regions that fire too quickly or not at all)</li>
          <li>Browse mode vs focus mode transitions</li>
          <li>Custom screen reader settings (verbosity levels, punctuation modes)</li>
          <li>Speech rate and pause behavior</li>
          <li>Dynamic content that requires JavaScript execution (for static HTML analysis)</li>
          <li>Visual context clues that inform meaning (spatial relationships, color coding)</li>
          <li>The overall cognitive flow of navigating a page (whether the order makes sense)</li>
        </ul>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The recommended workflow is: use Speakable in CI to catch the first category automatically,
          then schedule manual testing sessions (with real screen readers on real operating systems)
          to verify the second category before major releases.
        </p>
      </section>

      <RelatedPages
        pages={[
          { href: "/docs/cicd-integration", title: "CI/CD Integration", description: "Add screen reader testing to GitHub Actions and other CI pipelines." },
          { href: "/docs/screen-reader-regression-testing", title: "Screen Reader Regression Testing", description: "Detect when code changes break screen reader announcements." },
          { href: "/docs/beyond-axe", title: "Beyond Axe", description: "What rule-based tools miss and how predictive testing fills the gap." },
        ]}
      />
    </>
  );
}
