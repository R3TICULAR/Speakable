import Link from "next/link";
import type { Metadata } from "next";
import { RelatedPages } from "../../../components/RelatedPages";

export const metadata: Metadata = {
  title: "Screen Reader Testing Without a Screen Reader",
  description:
    "Test screen reader compatibility without installing VoiceOver or NVDA. Speakable predicts what each screen reader would announce for your HTML.",
  openGraph: {
    title: "Screen Reader Testing Without a Screen Reader",
    description:
      "Test screen reader compatibility without installing VoiceOver or NVDA. Speakable predicts what each screen reader would announce for your HTML.",
    url: "https://getspeakable.dev/docs/screen-reader-testing-without-screen-reader",
  },
};

export default function ScreenReaderTestingWithoutScreenReaderPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Testing Without a Screen Reader</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Screen Reader Testing Without a Screen Reader
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Screen reader testing without a screen reader is possible through predictive, heuristic-based
          analysis of your HTML. Instead of installing VoiceOver on a Mac, NVDA on Windows, or
          TalkBack on Android, you can run a single command that predicts what each screen reader
          would announce for your markup. Speakable makes this cross-platform problem solvable from
          any machine with Node.js installed, giving developers immediate feedback on accessibility
          without switching operating systems or learning screen reader navigation.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">The Cross-Platform Testing Problem</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Each major screen reader runs on a specific operating system. VoiceOver requires macOS
          or iOS. NVDA and JAWS require Windows. TalkBack requires Android. Narrator requires
          Windows 10 or later. This means comprehensive screen reader testing traditionally
          requires access to multiple machines or virtual environments.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          For most development teams, this creates a bottleneck. Frontend developers on macOS
          cannot easily test with NVDA. Windows developers cannot test with VoiceOver. The result
          is that teams test with whichever reader is available locally and hope the others behave
          similarly. They often do not.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Screen readers differ in real, impactful ways. VoiceOver says "dimmed" where NVDA says
          "unavailable". JAWS sometimes reads parent container labels. Narrator adds interaction
          hints that other readers omit. A component that sounds clear in VoiceOver might be
          confusing in NVDA because of different state phrasing.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Predictive testing addresses this by modeling all four screen readers from a single
          input. You write HTML once, run Speakable once, and see how all four readers would
          likely announce it. No OS switching, no VM management, no learning four sets of keyboard
          shortcuts just to check your button labels.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How Predictive Screen Reader Testing Works</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable does not launch a screen reader process, synthesize speech, or connect to
          platform accessibility APIs. Instead, it uses a three-stage pipeline that transforms
          HTML into predicted speech output.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Accessibility Tree Extraction</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The first stage parses your HTML and builds a canonical accessibility tree. This tree
          mirrors what the browser would expose through its accessibility API: each element gets
          a computed role (from native HTML semantics or explicit ARIA), an accessible name
          (following the W3C accname computation algorithm), states, properties, and parent-child
          relationships. Elements hidden with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-hidden="true"</code> or{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">display: none</code> are excluded from the tree,
          just as a browser would exclude them from the real accessibility API.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Heuristic Renderer Models</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The accessibility tree is then passed through four independent renderer models. Each
          renderer encodes the announcement patterns observed in a specific screen reader across
          hundreds of test cases. The renderers handle:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>Announcement ordering (name first vs role first, where states appear)</li>
          <li>State vocabulary ("unavailable" vs "dimmed" vs "disabled")</li>
          <li>Role phrasing ("edit" vs "text field" vs "editable text")</li>
          <li>Inclusion or omission of interaction hints</li>
          <li>Grouping behavior (how containers affect child announcements)</li>
          <li>Punctuation handling (which symbols are spoken, which are ignored)</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Output Comparison Across Four Readers</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The final output shows the predicted announcement for each screen reader side by side.
          Here is an example for a checkbox component:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`npx @reticular/speakable checkbox.html -f text -s all

# === NVDA ===
# Accept terms and conditions, check box, not checked, required
#
# === JAWS ===
# Accept terms and conditions, check box, not checked, required
#
# === VoiceOver ===
# Accept terms and conditions, required, unchecked, checkbox
#
# === Narrator ===
# Accept terms and conditions, check box, not checked, required`}
        </pre>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Notice how VoiceOver reorders the announcement (putting required before the state) and
          uses "unchecked" rather than "not checked". These cross-reader differences are exactly
          what predictive testing reveals without needing access to each platform.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What You Can Validate Without a Screen Reader</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Predictive testing covers a substantial portion of what manual testing reveals. These
          categories of issues are fully detectable from HTML markup alone:
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Accessible Names and Descriptions</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Every interactive element needs a name that screen readers will announce. Speakable
          computes the accessible name using the same algorithm browsers use and shows exactly
          what will be spoken. If a button, link, or input has an empty or missing name, the
          output will show it immediately.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">ARIA State Announcements</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          States like aria-expanded, aria-checked, aria-selected, and aria-pressed are communicated
          differently by each screen reader. Predictive testing shows whether these states are
          being announced at all, and how each reader phrases them.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Heading and Landmark Structure</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Screen reader users navigate by headings and landmarks. Speakable's audit mode reports
          the heading hierarchy (flagging skipped levels) and landmark coverage (whether main,
          navigation, and banner regions exist). This directly reflects what users experience
          when pressing H to jump between headings.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Announcement Order Differences</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Some screen readers announce the name first, then the role; others announce them in
          a different order. Some include descriptions inline, others announce them after a pause.
          Predictive testing shows these ordering differences clearly, helping you write
          documentation or design decisions that account for all readers.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Still Requires a Real Screen Reader</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Predictive testing has real limitations. Some aspects of the screen reader experience
          cannot be determined from static HTML analysis:
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Timing and Speech Rate</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Real screen readers have speech rates, pauses between elements, and timing-dependent
          behavior (like interrupting speech when content changes). These temporal aspects are
          not part of static analysis.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Browse Mode vs Focus Mode</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          NVDA and JAWS have two interaction modes: browse mode (read the page like a document)
          and focus mode (keystrokes go to the page for interactive widgets). Mode switching
          behavior depends on runtime focus state and JavaScript event handling, which static
          analysis cannot replicate.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Settings Variations</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Users configure their screen readers with different verbosity levels, punctuation
          modes, and language settings. Speakable predicts output at default settings. A user
          running NVDA in "brief" mode will hear less than what Speakable predicts; a user in
          "most" verbosity will hear more.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Interaction Patterns</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Keyboard traps, focus management in modals, live region announcements triggered by
          JavaScript, and virtual cursor behavior all require a running screen reader to test.
          These are dynamic behaviors that depend on JavaScript execution and user input sequences
          that cannot be predicted from HTML alone.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Using Speakable as a Pre-Testing Filter</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The most effective use of predictive testing is as a filter that runs before manual
          testing. Think of it like a linter for screen reader output: it catches the obvious
          issues instantly so your manual testing time is spent on the things only humans can
          evaluate.
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`# Run audit mode to find issues before manual testing
npx @reticular/speakable dialog.html -f audit

# Sample output:
# ISSUE: button with no accessible name at root > dialog > footer > button:nth-child(2)
# ISSUE: heading level skipped (h1 to h3) at root > dialog > section
# ISSUE: no landmark structure detected
#
# 3 issues found. Exit code: 1`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Fix these issues first. Then open VoiceOver and test the interaction: Does the dialog
          trap focus correctly? Does the Escape key close it? Is the return focus target correct?
          These interaction questions require a real screen reader, but the markup questions
          (names, roles, structure) are already answered.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          In CI, this filter prevents regressions from reaching production. A pull request that
          removes a button label will fail the Speakable audit before a human ever needs to test it.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Recommended Workflow: Predictive First, Manual Second</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Here is a practical workflow that maximizes coverage while minimizing the time spent in
          manual testing:
        </p>
        <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li><strong>Write your component markup.</strong> Focus on semantic HTML, proper labeling, and logical structure.</li>
          <li><strong>Run Speakable locally.</strong> Check that all four screen readers will announce names, roles, and states correctly. Fix any issues the audit surfaces.</li>
          <li><strong>Commit and push.</strong> Speakable runs in CI and catches regressions if anyone later modifies the component.</li>
          <li><strong>Schedule manual testing.</strong> Before a release, open VoiceOver (or NVDA) and navigate the component. Focus on interaction flow, timing, and overall comprehension.</li>
          <li><strong>Document findings.</strong> If manual testing reveals issues not caught by predictive testing, file them and fix them. These are likely interaction-pattern bugs.</li>
        </ol>
        <p className="text-slate-600 mb-4 leading-relaxed">
          This workflow catches approximately 80% of screen reader issues during step 2 (free,
          instant, cross-platform) and reserves the remaining 20% for step 4 (manual, thorough,
          platform-specific).
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`# Quick local check during development
npx @reticular/speakable src/components/Modal.html -f text -s all

# CI check on every pull request (in GitHub Actions)
# - name: Screen reader regression check
#   run: npx @reticular/speakable src/components/*.html -f audit
#   # Fails with exit code 1 if issues found`}
        </pre>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The key insight is that predictive testing and manual testing are complementary, not
          competing. Predictive testing catches what is detectable from markup. Manual testing
          catches what requires interaction. Together, they provide comprehensive coverage
          without requiring every developer to be a screen reader expert.
        </p>
      </section>

      <RelatedPages
        pages={[
          { href: "/docs/screen-reader-testing-tool", title: "Screen Reader Testing Tool", description: "The full Speakable CLI reference for predictive screen reader testing." },
          { href: "/docs/how-to-test-with-screen-reader", title: "How to Test with a Screen Reader", description: "Step-by-step manual testing guides for VoiceOver, NVDA, JAWS, and Narrator." },
          { href: "/docs/testing-strategy", title: "Testing Strategy", description: "Build a testing strategy that combines predictive and manual approaches." },
        ]}
      />
    </>
  );
}
