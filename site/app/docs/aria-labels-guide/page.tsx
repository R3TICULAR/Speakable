import Link from "next/link";
import type { Metadata } from "next";
import { RelatedPages } from "../../../components/RelatedPages";

export const metadata: Metadata = {
  title: "ARIA Labels Best Practices for Screen Readers",
  description:
    "Learn when to use aria-label, aria-labelledby, and aria-describedby. See how each is announced by NVDA, JAWS, VoiceOver, and Narrator.",
  openGraph: {
    title: "ARIA Labels Best Practices for Screen Readers",
    description:
      "Learn when to use aria-label, aria-labelledby, and aria-describedby. See how each is announced by NVDA, JAWS, VoiceOver, and Narrator.",
    url: "https://getspeakable.dev/docs/aria-labels-guide",
  },
};

export default function AriaLabelsGuidePage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">ARIA Labels Guide</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          ARIA Labels Best Practices for Screen Readers
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          ARIA labels best practices start with understanding which attribute to use and how each
          screen reader announces it. The three primary labeling attributes (aria-label,
          aria-labelledby, and aria-describedby) serve different purposes and produce different
          screen reader announcements. Choosing the wrong one can result in labels being ignored,
          descriptions overriding names, or redundant speech that confuses users. This guide
          explains when to use each attribute, shows the predicted screen reader output via
          Speakable, and identifies common mistakes that create poor experiences across NVDA,
          JAWS, VoiceOver, and Narrator.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">The Accessible Name Computation</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Before understanding ARIA labels, you need to understand how browsers compute the
          "accessible name" for any element. The accessible name is the text that screen readers
          announce as the identity of an element. It is computed through a priority order defined
          in the W3C Accessible Name and Description Computation specification:
        </p>
        <ol className="list-decimal list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li><strong>aria-labelledby</strong>: Highest priority. References the IDs of other elements whose text content becomes the name.</li>
          <li><strong>aria-label</strong>: Second priority. A string attribute directly on the element.</li>
          <li><strong>Native labeling</strong>: The element's associated label (for inputs), alt text (for images), or text content (for buttons and links).</li>
          <li><strong>Title attribute</strong>: Lowest priority fallback. Used only if no other name source exists.</li>
        </ol>
        <p className="text-slate-600 mb-4 leading-relaxed">
          This priority order means that aria-labelledby always wins, even over aria-label. If
          both are present, aria-labelledby takes precedence. Understanding this hierarchy prevents
          a common category of labeling bugs where developers add aria-label expecting it to
          supplement an aria-labelledby reference, but it gets ignored entirely.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The accessible description (computed from aria-describedby) is separate from the name.
          Screen readers announce the name first, then (often after a brief pause) the description.
          Some readers announce the description only in certain contexts or verbosity settings.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">aria-label: When and How to Use It</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The aria-label attribute provides an accessible name as a direct string value. It is
          invisible on screen but announced by screen readers as the element's identity.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Use aria-label when:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>An element has no visible text content (icon-only buttons, for example).</li>
          <li>The visible text is not descriptive enough for non-visual context.</li>
          <li>You need to differentiate multiple instances of the same element (e.g., multiple "Close" buttons on a page).</li>
        </ul>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Avoid aria-label when:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>The element already has descriptive visible text (adding aria-label overrides it, creating a mismatch between what sighted and non-sighted users perceive).</li>
          <li>You can use a visible label element instead (always prefer visible labels for form controls).</li>
          <li>The element is not interactive and has no role that accepts a name (aria-label on a plain div is ignored by some screen readers).</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Speakable Output Example</h3>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`<!-- Icon button with aria-label -->
<button aria-label="Close dialog">
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>

# npx @reticular/speakable close-button.html -f text -s all
#
# === NVDA ===
# Close dialog, button
#
# === JAWS ===
# Close dialog, button
#
# === VoiceOver ===
# Close dialog, button
#
# === Narrator ===
# Close dialog, button, to activate press Enter`}
        </pre>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Notice that all four readers announce the aria-label value as the button name. The SVG
          is hidden with aria-hidden="true" so it does not contribute text content. This is the
          correct pattern for icon-only buttons.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">aria-labelledby: Composing Names from Visible Text</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The aria-labelledby attribute references one or more element IDs whose text content
          is concatenated to form the accessible name. It is the highest priority in the name
          computation, overriding all other sources.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Use aria-labelledby when:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>The label text already exists visually on the page (no need to duplicate it in aria-label).</li>
          <li>You need to compose a name from multiple text sources (e.g., a heading plus a subtitle).</li>
          <li>You want to associate a region or dialog with a visible heading.</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Speakable Output Example</h3>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`<!-- Dialog labeled by its heading -->
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Deletion</h2>
  <p>Are you sure you want to delete this item?</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>

# npx @reticular/speakable dialog.html -f text -s all
#
# === NVDA ===
# Confirm Deletion, dialog
# Confirm Deletion, heading level 2
# Are you sure you want to delete this item?
# Cancel, button
# Delete, button
#
# === VoiceOver ===
# Confirm Deletion, web dialog
# Confirm Deletion, heading level 2
# Are you sure you want to delete this item?
# Cancel, button
# Delete, button`}
        </pre>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The dialog's name comes from the text content of the element with id="dialog-title".
          This keeps the name synchronized with what is visually displayed. If you later change
          the heading text, the dialog name updates automatically because they reference the same
          source.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">aria-describedby: Supplementary Information</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The aria-describedby attribute provides an accessible description: additional context
          that supplements the accessible name. Unlike the name, the description is not the
          primary identity of the element. It provides extra information that helps users
          understand context or constraints.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Common uses for aria-describedby:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>Linking form fields to their error messages or help text.</li>
          <li>Providing format hints ("Date format: MM/DD/YYYY").</li>
          <li>Connecting buttons to confirmation text ("This action cannot be undone").</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">How Descriptions Are Announced Differently</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Screen readers treat descriptions differently from names. The name is always announced
          immediately. The description is typically announced after a brief pause, or only when
          the user requests more information. This behavior varies by reader:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`<!-- Input with description -->
<label for="password">Password</label>
<input id="password" type="password" aria-describedby="pw-hint" />
<span id="pw-hint">Must be at least 8 characters with one uppercase letter</span>

# npx @reticular/speakable password-field.html -f text -s all
#
# === NVDA ===
# Password, edit, required
# Must be at least 8 characters with one uppercase letter
#
# === VoiceOver ===
# Password, required, secure text field
# Must be at least 8 characters with one uppercase letter
#
# === JAWS ===
# Password, edit, required
# Must be at least 8 characters with one uppercase letter
#
# === Narrator ===
# Password, edit, required
# Must be at least 8 characters with one uppercase letter`}
        </pre>
        <p className="text-slate-600 mb-6 leading-relaxed">
          In practice, NVDA announces the description after the name and role with a brief pause.
          VoiceOver may require the user to press VO+Shift+N to hear descriptions in some contexts.
          JAWS announces descriptions after a configurable delay. The key point: descriptions are
          secondary to names. If critical information is in aria-describedby but not in the name,
          some users may miss it depending on their settings and reading speed.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">aria-label vs aria-labelledby: Which to Choose</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The choice between aria-label and aria-labelledby depends on whether suitable label
          text already exists in the DOM:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 px-4 font-bold text-slate-900">Criterion</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">aria-label</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">aria-labelledby</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Source of name text</td>
                <td className="py-3 px-4">String value on the attribute</td>
                <td className="py-3 px-4">Text content of referenced element(s)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Visible to sighted users</td>
                <td className="py-3 px-4">No (hidden label)</td>
                <td className="py-3 px-4">Yes (references visible text)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Stays in sync with visible text</td>
                <td className="py-3 px-4">No (manual maintenance)</td>
                <td className="py-3 px-4">Yes (automatic)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Translatable</td>
                <td className="py-3 px-4">Requires separate translation effort</td>
                <td className="py-3 px-4">Translated with the visible text</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Priority in name computation</td>
                <td className="py-3 px-4">Second (overridden by aria-labelledby)</td>
                <td className="py-3 px-4">Highest</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Can compose from multiple sources</td>
                <td className="py-3 px-4">No (single string)</td>
                <td className="py-3 px-4">Yes (space-separated IDs)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Best for</td>
                <td className="py-3 px-4">Icon buttons, distinguishing duplicates</td>
                <td className="py-3 px-4">Dialogs, sections, form groups</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          General rule: if the label text is already visible somewhere on the page, use
          aria-labelledby to point at it. If no visible text exists (icon buttons, for example),
          use aria-label. Prefer aria-labelledby when possible because it stays synchronized with
          the visible text and is automatically included in translation workflows.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Common Mistakes with ARIA Labels</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          These are the most frequent labeling mistakes found during screen reader testing:
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Redundant Labels</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Adding aria-label that duplicates the existing text content creates no benefit and
          sometimes causes double announcements in certain screen readers:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`<!-- Bad: aria-label duplicates text content -->
<button aria-label="Submit">Submit</button>
<!-- Screen readers already use the text content "Submit" as the name -->

<!-- Good: just use the text content -->
<button>Submit</button>

# Both produce the same output:
# npx @reticular/speakable button.html -f text -s nvda
# Submit, button`}
        </pre>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Labels on Non-Interactive Elements</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Adding aria-label to elements without a role that accepts a name (plain divs, spans,
          paragraphs) has no effect in most screen readers. The label is computed but never
          announced because the element has no interactive semantics:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`<!-- Bad: aria-label on a plain div (ignored by most readers) -->
<div aria-label="Important notice">
  <p>Your account will expire soon.</p>
</div>

<!-- Good: use a role that accepts a name, or use visible text -->
<div role="alert" aria-label="Important notice">
  <p>Your account will expire soon.</p>
</div>

# The div version announces only the paragraph text.
# The role="alert" version announces: "Important notice, alert"`}
        </pre>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Overriding Good Native Semantics</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          A link with descriptive text content does not need aria-label. Adding one overrides the
          visible text and creates a mismatch between what sighted users see and what screen
          reader users hear. This breaks the "label in name" WCAG success criterion (2.5.3) and
          confuses voice control users who try to activate elements by their visible text.
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`<!-- Bad: aria-label overrides visible text -->
<a href="/pricing" aria-label="View our pricing plans and subscription options">
  Pricing
</a>
<!-- Voice control user says "click Pricing" but it doesn't match the accessible name -->

<!-- Good: visible text IS the accessible name -->
<a href="/pricing">Pricing</a>
<!-- Both sighted and non-sighted users see/hear "Pricing" -->`}
        </pre>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Testing ARIA Labels with Speakable</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable computes accessible names using the same algorithm browsers use, so you can
          verify that your ARIA labeling produces the intended announcements across all four
          screen readers:
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`# Check how a specific component's labels are announced
npx @reticular/speakable form.html -f text -s all

# Run audit mode to find labeling issues
npx @reticular/speakable form.html -f audit
# Reports: elements with no name, broken labelledby references, etc.

# Focus on a specific element with CSS selector
npx @reticular/speakable page.html -f text -s all --selector '[aria-labelledby]'`}
        </pre>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The audit mode specifically flags:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2 leading-relaxed">
          <li>Interactive elements with no accessible name (buttons, links, inputs without labels)</li>
          <li>Broken aria-labelledby references (pointing to IDs that do not exist in the document)</li>
          <li>aria-label on elements whose role does not support naming</li>
          <li>Mismatches between visible text and aria-label (potential "label in name" violations)</li>
        </ul>
        <p className="text-slate-600 mb-4 leading-relaxed">
          For ongoing verification, add Speakable to your CI pipeline. When someone accidentally
          removes a label or breaks an aria-labelledby reference, the audit will fail with a
          clear message about which element lost its name. This is particularly valuable for
          large teams where multiple developers modify the same components.
        </p>
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`import { analyze } from "@reticular/speakable";

// Test that aria-labelledby correctly composes a name from multiple sources
const html = \`
  <span id="action">Delete</span>
  <span id="target">user account</span>
  <button aria-labelledby="action target">
    <svg aria-hidden="true"><!-- trash icon --></svg>
  </button>
\`;

const result = await analyze(html, {
  screenReaders: ["nvda", "voiceover"],
  format: "json",
});

// NVDA: "Delete user account, button"
// VoiceOver: "Delete user account, button"
// The name is composed from both referenced elements`}
        </pre>
      </section>

      <RelatedPages
        pages={[
          { href: "/docs/aria-roles", title: "ARIA Roles Guide", description: "Testing and validation of ARIA roles with Speakable." },
          { href: "/docs/common-mistakes", title: "Common Accessibility Mistakes", description: "Frequent ARIA and HTML mistakes that break screen reader experience." },
          { href: "/docs/accessible-forms", title: "Accessible Forms", description: "Building forms that work correctly with all four major screen readers." },
        ]}
      />
    </>
  );
}
