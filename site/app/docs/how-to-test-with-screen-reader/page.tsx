import Link from "next/link";
import type { Metadata } from "next";
import { RelatedPages } from "../../../components/RelatedPages";

export const metadata: Metadata = {
  title: "How to Test a Website with a Screen Reader",
  description:
    "Step-by-step guide to testing websites with screen readers. Learn manual testing with VoiceOver and NVDA, plus automated checks with Speakable CLI.",
  openGraph: {
    title: "How to Test a Website with a Screen Reader",
    description:
      "Step-by-step guide to testing websites with screen readers. Learn manual testing with VoiceOver and NVDA, plus automated checks with Speakable CLI.",
    url: "https://getspeakable.dev/docs/how-to-test-with-screen-reader",
  },
};

export default function HowToTestWithScreenReaderPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">How to Test with a Screen Reader</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          How to Test a Website with a Screen Reader
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Learning how to test a website with a screen reader is one of the most valuable skills
          a web developer can build. Screen reader testing reveals problems that no linter or
          automated rule checker can find: confusing announcement order, missing context, unclear
          navigation, and states that are never communicated to users who rely on assistive
          technology. This guide walks through manual testing with each major screen reader, common
          issues to listen for, and how to automate the repetitive parts with Speakable so you can
          focus your manual effort where it matters most.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why Screen Reader Testing Matters</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Approximately 7.6 million people in the United States alone use screen readers to
          navigate the web. These users rely entirely on the text that assistive technology
          announces. If your button says nothing, if your form field has no label, or if your
          navigation structure is invisible to the accessibility tree, these users cannot complete
          their tasks.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Automated rule checkers (like axe-core) catch technical violations: missing alt text,
          invalid ARIA attributes, insufficient color contrast. But they cannot tell you what the
          experience sounds like. A button might pass every automated rule and still announce as
          "button" with no name. A navigation might have perfect ARIA markup but announce items
          in a confusing order.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Testing with a screen reader answers the question: "Can someone who cannot see the
          screen understand and use this interface?" There is no substitute for hearing it yourself.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Step-by-Step Manual Testing</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Each screen reader has different keyboard shortcuts and navigation modes. Below are
          step-by-step instructions for the four major screen readers. You do not need to test
          with all four every time, but testing with at least two (typically VoiceOver and NVDA)
          gives good coverage of platform-specific differences.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Testing with VoiceOver (macOS)</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          VoiceOver is built into every Mac. No installation required.
        </p>
        <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Cmd + F5</code> to toggle VoiceOver on.</li>
          <li>Open your page in Safari (VoiceOver works best with Safari on macOS).</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">VO + Right Arrow</code> (VO is Ctrl + Option) to move to the next element.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">VO + Left Arrow</code> to move to the previous element.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">VO + U</code> to open the Rotor (headings, links, landmarks, form controls).</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">VO + Space</code> to activate (click) the current element.</li>
          <li>Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">VO + Cmd + H</code> to jump between headings.</li>
        </ol>
        <p className="text-slate-600 mb-4 leading-relaxed">
          What to listen for: Does each interactive element announce its name and role? Do form
          fields announce their labels? Is the heading structure logical? Can you reach all
          interactive elements with the keyboard?
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Testing with NVDA (Windows)</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          NVDA is free, open-source, and the most widely used screen reader on Windows. Download
          it from nvaccess.org.
        </p>
        <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>Launch NVDA (it will start speaking immediately).</li>
          <li>Open your page in Chrome or Firefox.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Down Arrow</code> to move through elements in browse mode.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Tab</code> to move between interactive elements (focus mode).</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">H</code> to jump to the next heading.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">D</code> to jump to the next landmark.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Enter</code> or <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Space</code> to activate elements.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Insert + F7</code> to open the Elements List (all links, headings, landmarks).</li>
        </ol>
        <p className="text-slate-600 mb-4 leading-relaxed">
          NVDA uses "browse mode" by default, reading the page as if it were a document. When you
          enter a form field or interactive widget, it switches to "focus mode" where keystrokes
          go to the page instead of being intercepted as navigation commands.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Testing with JAWS (Windows)</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          JAWS is a commercial screen reader widely used in enterprise environments. It offers a
          40-minute trial mode that restarts after reboot.
        </p>
        <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>Launch JAWS and open your page in Chrome, Firefox, or Edge.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Down Arrow</code> to read the next line.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Tab</code> to move between form controls and links.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">H</code> to jump to headings, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">T</code> for tables, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">F</code> for form fields.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Insert + F6</code> to see the heading list.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Insert + F5</code> to see all form fields.</li>
        </ol>
        <p className="text-slate-600 mb-4 leading-relaxed">
          JAWS tends to be more verbose than NVDA. It provides additional context from parent
          containers and sometimes reads table coordinates. If your component sounds too wordy in
          JAWS, that often indicates redundant ARIA attributes.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Testing with Narrator (Windows)</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Narrator is built into Windows 10 and 11. It works best with Microsoft Edge.
        </p>
        <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Win + Ctrl + Enter</code> to toggle Narrator on.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Caps Lock + Right Arrow</code> to move to the next item.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Caps Lock + Down Arrow</code> to interact with groups.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">H</code> in scan mode to jump between headings.</li>
          <li>Press <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Tab</code> to move between interactive elements.</li>
        </ol>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Narrator is less commonly used by daily screen reader users, but testing with it reveals
          how Microsoft's accessibility APIs interpret your markup. It often provides interaction
          hints (like "to activate, press Enter") that other readers omit.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Common Issues to Listen For</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When testing with any screen reader, pay attention to these categories of problems:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li><strong>Silent buttons</strong>: The screen reader says "button" with no name. This means the button has no accessible name (no text content, no aria-label, no aria-labelledby).</li>
          <li><strong>Unlabeled form fields</strong>: You hear "edit" or "text field" without knowing what to type. The input lacks an associated label element or aria-label.</li>
          <li><strong>Missing headings</strong>: You cannot jump between sections because the page has no heading structure, or headings skip levels (H1 to H3).</li>
          <li><strong>Invisible landmarks</strong>: There is no "navigation", "main", or "banner" region, so keyboard users cannot jump between major page areas.</li>
          <li><strong>Redundant announcements</strong>: The screen reader says "navigation link, Home, link" because ARIA roles and native semantics overlap unnecessarily.</li>
          <li><strong>State not communicated</strong>: A toggle looks pressed on screen but the screen reader never says "pressed" or "expanded" because aria-pressed or aria-expanded is missing.</li>
          <li><strong>Focus order confusion</strong>: Tab order does not match visual order, making the interface unpredictable when navigated by keyboard.</li>
          <li><strong>Trapped focus</strong>: You enter a modal or dropdown and cannot Tab out of it.</li>
        </ul>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Each of these issues creates a different failure mode for screen reader users. Some are
          complete blockers (cannot complete a task) while others are confusing but navigable.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Automating the Repetitive Parts</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Manual screen reader testing is essential for understanding the full user experience,
          but it is slow and platform-specific. Much of what you listen for during manual testing
          (accessible names, role announcements, state communication) can be predicted from the
          HTML alone. This is where Speakable fits in.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Using Speakable to Preview Output Before Manual Testing</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Before spending time with a real screen reader, run Speakable to get a quick preview
          of what each reader will likely say:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`# Preview what all four screen readers will announce
npx @reticular/speakable login-form.html -f text -s all

# Output:
# === NVDA ===
# Email address, edit, required
# Password, edit, required
# Remember me, check box, not checked
# Sign in, button
#
# === VoiceOver ===
# Email address, required, text field
# Password, required, secure text field
# Remember me, unchecked, checkbox
# Sign in, button
#
# === JAWS ===
# Email address, edit, required
# Password, edit, required
# Remember me, check box, not checked
# Sign in, button
#
# === Narrator ===
# Email address, edit, required, to edit text press Enter
# Password, edit, required, to edit text press Enter
# Remember me, check box, not checked
# Sign in, button, to activate press Enter`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          If this output looks wrong (a field missing its label, a button with no name), you can
          fix the issue immediately without even launching VoiceOver or NVDA. This saves minutes
          per component during development.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Setting Up Regression Guards</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Once you have verified the screen reader output manually, save the expected output as
          a baseline. Speakable can then diff against that baseline on every pull request, catching
          regressions automatically. See the{" "}
          <Link href="/docs/screen-reader-regression-testing" className="text-blue-600 hover:underline">
            regression testing guide
          </Link>{" "}
          for detailed setup instructions.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">A Combined Testing Workflow</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The most effective approach combines predictive and manual testing at different stages
          of development:
        </p>
        <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li><strong>During development</strong>: Run Speakable locally to preview announcements as you write markup. Fix obvious issues (missing names, broken hierarchy) immediately.</li>
          <li><strong>In CI</strong>: Run Speakable in audit mode on every pull request. Fail the build if critical issues are found (no-name buttons, missing landmarks).</li>
          <li><strong>Before release</strong>: Schedule a manual testing session with VoiceOver and NVDA. Focus on interaction patterns, timing, and overall navigation flow.</li>
          <li><strong>After launch</strong>: Test the production site with a screen reader to catch server-rendered or hydration-related issues that do not appear in static HTML.</li>
        </ol>
        <p className="text-slate-600 mb-6 leading-relaxed">
          This workflow catches markup-level issues early (where they are cheapest to fix) and
          reserves expensive manual testing for the things only a human can evaluate: whether
          the flow makes sense, whether timing is appropriate, and whether the experience is
          comfortable for extended use.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Resources and Next Steps</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Learning to test with screen readers is a skill that improves with practice. Here are
          some resources to continue building your expertise:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2 leading-relaxed">
          <li>The <Link href="/docs/testing-checklist" className="text-blue-600 hover:underline">Screen Reader Testing Checklist</Link> provides a structured list of items to verify during each session.</li>
          <li>The <Link href="/docs/screen-reader-comparison" className="text-blue-600 hover:underline">Screen Reader Comparison</Link> page details how NVDA, JAWS, VoiceOver, and Narrator differ in their handling of common patterns.</li>
          <li>WebAIM's screen reader survey publishes annual data on which screen readers are most used and with which browsers.</li>
          <li>The ARIA Authoring Practices Guide (APG) provides expected keyboard interactions for every common widget pattern.</li>
          <li>Deque University offers free courses on screen reader testing methodology.</li>
        </ul>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Start with one screen reader. VoiceOver on macOS is a good first choice because it
          requires no installation and works well with Safari. Test a single page, fix the issues
          you find, and then expand to a second reader. Over time, the keyboard shortcuts become
          muscle memory and testing goes faster.
        </p>
      </section>

      <RelatedPages
        pages={[
          { href: "/docs/screen-reader-testing-tool", title: "Screen Reader Testing Tool", description: "Predict screen reader output for any HTML with the Speakable CLI." },
          { href: "/docs/testing-checklist", title: "Screen Reader Testing Checklist", description: "Structured checklist for verifying screen reader compatibility." },
          { href: "/docs/screen-reader-comparison", title: "Screen Reader Comparison", description: "Compare how NVDA, JAWS, VoiceOver, and Narrator announce the same markup." },
        ]}
      />
    </>
  );
}
