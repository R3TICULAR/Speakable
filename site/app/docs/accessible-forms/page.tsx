import Link from "next/link";
import { RelatedPages } from "../../../components/RelatedPages";
import { SeeAlso } from "../../../components/SeeAlso";

export default function AccessibleFormsPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Accessible Forms</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Form Accessibility Deep Dive</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Forms are where accessibility most directly impacts task completion. Inaccessible forms mean
          users literally cannot sign up, purchase, or submit information. Every interactive control
          needs a clear name, understandable instructions, and feedback that assistive technology can
          convey. This guide covers the full spectrum of form accessibility, from basic labeling
          through validation, grouping, and automated testing with Speakable.
        </p>
      </header>

      {/* Labels */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Labels</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Every form input needs a programmatically associated label. This is the single most important
          rule in form accessibility. Without a proper label, screen reader users hear only the role of the
          control (&quot;edit&quot; or &quot;text field&quot;) with no indication of what information they should type.
          Visual proximity is not enough. The connection must exist in the DOM for assistive technology to
          discover it.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Labeling Methods</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          There are four approaches to associating a label with an input, each with different trade-offs
          for flexibility and robustness:
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Explicit <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">&lt;label for=&quot;id&quot;&gt;</code></p>
              <p className="text-sm text-slate-600">The most common and robust method. The <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">for</code> attribute on the label matches the <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">id</code> on the input. Works even when the label and input are far apart in the DOM. Clicking the label also focuses the input, improving usability for motor-impaired users.</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Wrapping label</p>
              <p className="text-sm text-slate-600">Wrap the input inside the <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">&lt;label&gt;</code> element. No <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">for</code>/<code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">id</code> pairing needed. The implicit association is recognized by all browsers and screen readers. Particularly useful for simple forms where label text is adjacent to the input.</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">3.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1"><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-labelledby</code></p>
              <p className="text-sm text-slate-600">Points to one or more element IDs whose text content becomes the label. Useful when the visual label is complex (multiple elements), when the same label element must name multiple controls, or when the label exists but is not a <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">&lt;label&gt;</code> element.</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">4.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1"><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-label</code></p>
              <p className="text-sm text-slate-600">Provides the accessible name directly as a string attribute. Used when there is no visible label at all (icon buttons, search fields with only a magnifying glass). Use sparingly; visible labels benefit everyone, not just screen reader users.</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-amber-600 shrink-0" aria-hidden="true">warning</span>
            <div>
              <p className="text-sm font-bold text-amber-900 mb-1">Placeholders are NOT labels</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                Placeholder text disappears as soon as the user starts typing, leaving them with no reference
                for what the field expects. Placeholders often have insufficient contrast (light gray on white).
                Not all screen readers announce placeholder text as the accessible name, and even when they do,
                the announcement is inconsistent across readers. Always use a real label in addition to any
                placeholder hint.
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Code Example</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Correct labeling patterns</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<!-- Method 1: Explicit label with for/id -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" />

<!-- Method 2: Wrapping label -->
<label>
  Full name
  <input type="text" name="fullname" />
</label>

<!-- Method 3: aria-labelledby -->
<span id="phone-label">Phone number</span>
<input type="tel" aria-labelledby="phone-label" />

<!-- Method 4: aria-label (no visible label) -->
<input type="search" aria-label="Search documentation" />

<!-- ❌ WRONG: placeholder only, no label -->
<input type="email" placeholder="Enter your email" />`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When a label is properly associated, all four major screen readers announce the label text
          followed by the role. Without a label, users hear only the bare role with no context about
          what information is expected.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Screen Reader</th>
                <th className="py-3 px-4 font-bold text-slate-900">With Label</th>
                <th className="py-3 px-4 font-bold text-slate-900">Without Label</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">NVDA</td>
                <td className="py-3 px-4">&quot;Email address, edit&quot;</td>
                <td className="py-3 px-4 text-red-600">&quot;edit&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">JAWS</td>
                <td className="py-3 px-4">&quot;Email address, edit&quot;</td>
                <td className="py-3 px-4 text-red-600">&quot;edit&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">VoiceOver</td>
                <td className="py-3 px-4">&quot;Email address, text field&quot;</td>
                <td className="py-3 px-4 text-red-600">&quot;text field&quot;</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs">Narrator</td>
                <td className="py-3 px-4">&quot;Email address, edit&quot;</td>
                <td className="py-3 px-4 text-red-600">&quot;edit&quot;</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">CLI Check</h3>
        <p className="text-slate-600 mb-3 leading-relaxed">
          Speakable&apos;s audit mode automatically flags inputs without associated labels:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`$ speakable form.html -f audit

⚠ ISSUE: Input element has no accessible name
  → <input type="email" placeholder="Enter your email">
  Fix: Add a <label> element or aria-label attribute`}
            </pre>
          </div>
        </div>
      </section>

      {/* Descriptions */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Descriptions</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Labels identify what a field is for, but sometimes users need additional instructions about
          format, constraints, or expectations. The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-describedby</code> attribute
          connects supplementary text to a form control. Screen readers announce this description after
          the label and role, giving users the full context without cluttering the primary name.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The announcement order is always: name → role → description. So a user focusing a password field
          with a description would hear the label first, then the field type, then the supplementary
          instructions. This layered approach ensures users get the most important information (what is this
          field?) immediately, with details following.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Multiple IDs can be space-separated in the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-describedby</code> value,
          and the screen reader will concatenate the text content of all referenced elements. This is useful
          when you have multiple constraint messages or when instructions are split across elements for
          styling purposes.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Code Example</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Password field with description</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<label for="password">Password</label>
<input
  type="password"
  id="password"
  aria-describedby="pw-instructions pw-strength"
/>
<p id="pw-instructions">Must be at least 8 characters</p>
<p id="pw-strength">Include one uppercase letter and one number</p>`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          All major screen readers announce the description after the name and role. The description
          is read as a continuous string, combining the text of all referenced elements.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Screen Reader</th>
                <th className="py-3 px-4 font-bold text-slate-900">Announcement</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">NVDA</td>
                <td className="py-3 px-4">&quot;Password, edit, Must be at least 8 characters Include one uppercase letter and one number&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">JAWS</td>
                <td className="py-3 px-4">&quot;Password, edit, Must be at least 8 characters Include one uppercase letter and one number&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">VoiceOver</td>
                <td className="py-3 px-4">&quot;Password, secure text field, Must be at least 8 characters Include one uppercase letter and one number&quot;</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs">Narrator</td>
                <td className="py-3 px-4">&quot;Password, edit, Must be at least 8 characters Include one uppercase letter and one number&quot;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Required Fields */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Required Fields</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Users need to know which fields are mandatory before they submit a form. The HTML{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">required</code> attribute provides
          both native browser validation and screen reader announcement. When a screen reader encounters
          a required field, it appends &quot;required&quot; to the field information, making it clear the user
          cannot skip it.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Alternatively, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-required=&quot;true&quot;</code> provides
          the same announcement without native validation behavior. This is useful when you handle validation
          in JavaScript and don&apos;t want the browser&apos;s default validation UI.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-amber-600 shrink-0" aria-hidden="true">warning</span>
            <div>
              <p className="text-sm font-bold text-amber-900 mb-1">Don&apos;t rely only on visual indicators</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                A red asterisk (*) next to a field label communicates &quot;required&quot; visually, but screen reader
                users may never encounter it, or may hear &quot;star&quot; or &quot;asterisk&quot; without understanding its meaning.
                Always pair visual indicators with programmatic marking via <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">required</code> or{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-required</code>.
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Code Example</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Required field patterns</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<!-- Native required with browser validation -->
<label for="email">Email address</label>
<input type="email" id="email" required />

<!-- ARIA required without native validation -->
<label for="username">Username</label>
<input type="text" id="username" aria-required="true" />

<!-- Visual + programmatic indicator together -->
<label for="phone">
  Phone number <span aria-hidden="true" class="text-red-500">*</span>
</label>
<input type="tel" id="phone" required />`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Screen Reader</th>
                <th className="py-3 px-4 font-bold text-slate-900">Announcement</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">NVDA</td>
                <td className="py-3 px-4">&quot;Email address, edit, required&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">JAWS</td>
                <td className="py-3 px-4">&quot;Email address, edit, required&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">VoiceOver</td>
                <td className="py-3 px-4">&quot;Email address, required, text field&quot;</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs">Narrator</td>
                <td className="py-3 px-4">&quot;Email address, edit, required&quot;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Validation Errors */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Validation Errors</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When a user submits a form with errors, they need immediate, actionable feedback. For screen reader
          users, this means the error must be programmatically associated with the field and announced
          without requiring the user to hunt for it. The combination of{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-invalid=&quot;true&quot;</code> and an
          error message linked via <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-describedby</code> creates
          a robust error reporting pattern.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Setting <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-invalid=&quot;true&quot;</code> on a field
          causes screen readers to announce &quot;invalid&quot; when the field receives focus. The error message
          connected via <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-describedby</code> is read
          immediately after, giving the user the full picture: what went wrong and what to fix.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          For inline validation that fires as the user types (or on blur), use{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;alert&quot;</code> or{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-live=&quot;polite&quot;</code> on the error
          message container so the error is announced immediately when it appears, without requiring the
          user to move focus.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Code Example</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Inline validation pattern</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<!-- Before submission: field is valid -->
<label for="email">Email address</label>
<input type="email" id="email" required aria-describedby="email-error" />
<p id="email-error"></p>

<!-- After failed validation: mark invalid + show error -->
<label for="email">Email address</label>
<input
  type="email"
  id="email"
  required
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" role="alert" class="text-red-600">
  Please enter a valid email address
</p>

<!-- Real-time validation with aria-live -->
<label for="username">Username</label>
<input type="text" id="username" aria-describedby="username-feedback" />
<div id="username-feedback" aria-live="polite">
  <!-- Dynamically populated as user types -->
  Username is already taken
</div>`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When the user tabs to an invalid field, screen readers combine the invalid state
          with the error description into a single announcement:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Screen Reader</th>
                <th className="py-3 px-4 font-bold text-slate-900">Announcement</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">NVDA</td>
                <td className="py-3 px-4">&quot;Email address, edit, invalid, Please enter a valid email address&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">JAWS</td>
                <td className="py-3 px-4">&quot;Email address, edit, invalid entry, Please enter a valid email address&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">VoiceOver</td>
                <td className="py-3 px-4">&quot;Email address, invalid data, text field, Please enter a valid email address&quot;</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs">Narrator</td>
                <td className="py-3 px-4">&quot;Email address, edit, invalid, Please enter a valid email address&quot;</td>
              </tr>
            </tbody>
          </table>
        </div>

        <SeeAlso
          href="/docs/live-regions"
          title="See Also: Live Regions & Dynamic Content"
          description="Learn how aria-live regions work for real-time validation messages that update without page reload."
        />
      </section>

      {/* Fieldsets and Legends */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Fieldsets and Legends</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When a form contains groups of related controls (radio buttons for a single choice, checkboxes
          for multiple selections, or a set of address fields), the{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;fieldset&gt;</code> and{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;legend&gt;</code> elements provide
          essential group context. Without this grouping, screen reader users navigating between radio buttons
          hear only the individual option label with no context about what question they&apos;re answering.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The legend text is prepended to each control&apos;s individual announcement. When a user focuses a radio
          button inside a fieldset, the screen reader says the legend first, then the option label, then the role.
          This gives complete context for every individual control without the user needing to navigate back to
          read a heading or question.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Without the fieldset grouping, a user tabbing through radio buttons hears only &quot;Express, radio
          button&quot;. They have no idea what &quot;Express&quot; refers to. Is it a shipping method? A payment plan?
          A subscription tier? The legend provides the missing context that makes each option understandable
          in isolation.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Code Example</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Fieldset with legend</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<!-- ✅ Grouped with fieldset and legend -->
<fieldset>
  <legend>Shipping method</legend>
  <label>
    <input type="radio" name="shipping" value="standard" />
    Standard (5-7 days)
  </label>
  <label>
    <input type="radio" name="shipping" value="express" />
    Express (2-3 days)
  </label>
  <label>
    <input type="radio" name="shipping" value="overnight" />
    Overnight (next day)
  </label>
</fieldset>

<!-- ❌ Without fieldset - no group context -->
<p>Shipping method</p>
<label>
  <input type="radio" name="shipping" value="standard" />
  Standard (5-7 days)
</label>
<label>
  <input type="radio" name="shipping" value="express" />
  Express (2-3 days)
</label>`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The difference between grouped and ungrouped controls is dramatic. With a fieldset,
          users always know the context of each option:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Screen Reader</th>
                <th className="py-3 px-4 font-bold text-slate-900">With Fieldset</th>
                <th className="py-3 px-4 font-bold text-slate-900">Without Fieldset</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">NVDA</td>
                <td className="py-3 px-4">&quot;Shipping method, grouping. Express (2-3 days), radio button&quot;</td>
                <td className="py-3 px-4 text-red-600">&quot;Express (2-3 days), radio button&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">JAWS</td>
                <td className="py-3 px-4">&quot;Shipping method, group. Express (2-3 days), radio button&quot;</td>
                <td className="py-3 px-4 text-red-600">&quot;Express (2-3 days), radio button&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">VoiceOver</td>
                <td className="py-3 px-4">&quot;Shipping method, group. Express (2-3 days), radio button&quot;</td>
                <td className="py-3 px-4 text-red-600">&quot;Express (2-3 days), radio button&quot;</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs">Narrator</td>
                <td className="py-3 px-4">&quot;Shipping method, group. Express (2-3 days), radio button&quot;</td>
                <td className="py-3 px-4 text-red-600">&quot;Express (2-3 days), radio button&quot;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Autocomplete */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Autocomplete</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">autocomplete</code> attribute tells
          browsers and assistive technology what type of data a field expects. This enables password managers
          to fill credentials, browsers to offer stored addresses, and mobile keyboards to suggest appropriate
          input methods. For users with motor impairments or cognitive disabilities, autofill dramatically
          reduces the physical and mental effort required to complete forms.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Beyond convenience, autocomplete reduces errors. Instead of typing a 16-digit credit card number
          (with opportunities for typos), the browser fills it from stored data. Instead of remembering an
          exact address format, the browser provides the previously saved version. This benefits everyone,
          but the impact is particularly significant for users who find typing difficult or error-prone.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Common Values</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Value</th>
                <th className="py-3 px-4 font-bold text-slate-900">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">name</td>
                <td className="py-3 px-4">Full name</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">email</td>
                <td className="py-3 px-4">Email address</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">tel</td>
                <td className="py-3 px-4">Telephone number</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">address-line1</td>
                <td className="py-3 px-4">Street address line 1</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">address-line2</td>
                <td className="py-3 px-4">Street address line 2</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">postal-code</td>
                <td className="py-3 px-4">ZIP or postal code</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">cc-number</td>
                <td className="py-3 px-4">Credit card number</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-mono text-xs">cc-exp</td>
                <td className="py-3 px-4">Credit card expiry date</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs">current-password</td>
                <td className="py-3 px-4">Current password (login forms)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Code Example</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Checkout form with autocomplete</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<form>
  <label for="fullname">Full name</label>
  <input type="text" id="fullname" autocomplete="name" />

  <label for="email">Email</label>
  <input type="email" id="email" autocomplete="email" />

  <label for="tel">Phone</label>
  <input type="tel" id="tel" autocomplete="tel" />

  <label for="address">Street address</label>
  <input type="text" id="address" autocomplete="address-line1" />

  <label for="city">City</label>
  <input type="text" id="city" autocomplete="address-level2" />

  <label for="zip">ZIP code</label>
  <input type="text" id="zip" autocomplete="postal-code" />

  <label for="cc">Card number</label>
  <input type="text" id="cc" autocomplete="cc-number" inputmode="numeric" />

  <label for="cc-exp">Expiry</label>
  <input type="text" id="cc-exp" autocomplete="cc-exp" />
</form>`}
            </pre>
          </div>
        </div>
      </section>

      {/* Testing Forms with Speakable */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Testing Forms with Speakable</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable provides several modes for auditing form accessibility. The audit format catches
          structural issues like missing labels and landmark problems, while the text format lets you
          hear exactly what screen readers will say for each form control. Combining both gives you
          comprehensive coverage: structural correctness plus perceptual accuracy.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Audit Mode</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Run the audit to catch missing labels, incorrect ARIA usage, and landmark issues across
          your entire form:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`$ speakable form.html -f audit`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Targeted Field Testing</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Use a CSS selector to hear what all four screen readers would announce for every input,
          select, and textarea in your form:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`$ speakable form.html -f text -s all --selector "input, select, textarea"`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Error State Testing</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Check how error states are announced by targeting elements with <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-invalid</code>:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`$ speakable form.html -f text -s nvda --selector "[aria-invalid]"`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Example Output</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Here&apos;s what audit output looks like for a form with accessibility issues versus a clean form:
        </p>

        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
            <div className="px-4 py-2 bg-red-900/30 border-b border-red-800/30">
              <span className="text-xs font-mono text-red-400 uppercase tracking-wider">Form with issues</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed text-red-300">
{`$ speakable signup-form.html -f audit

ACCESSIBILITY AUDIT: signup-form.html
══════════════════════════════════════

ISSUES FOUND: 4

✗ ERROR: Input has no accessible name
  → <input type="email" placeholder="Email">
  Fix: Add a <label> with matching for/id or use aria-label

✗ ERROR: Input has no accessible name
  → <input type="password" placeholder="Password">
  Fix: Add a <label> with matching for/id or use aria-label

⚠ WARNING: Required field has no programmatic indicator
  → <input type="email" placeholder="Email" class="required">
  Fix: Add the required attribute or aria-required="true"

⚠ WARNING: Radio group not wrapped in fieldset
  → <input type="radio" name="plan" value="free">
  Fix: Wrap related radio buttons in <fieldset> with <legend>`}
              </pre>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
            <div className="px-4 py-2 bg-emerald-900/30 border-b border-emerald-800/30">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Clean form - no issues</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed text-emerald-300">
{`$ speakable checkout-form.html -f audit

ACCESSIBILITY AUDIT: checkout-form.html
════════════════════════════════════════

ISSUES FOUND: 0

✓ All 8 form controls have accessible names
✓ Required fields are programmatically marked
✓ Fieldsets used for grouped controls
✓ Error messages linked via aria-describedby
✓ Autocomplete attributes present on identity fields

SCORE: 100/100`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Summary / Best Practices */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Form Accessibility Checklist</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Use this quick reference to ensure your forms meet accessibility requirements. Each item
          represents a pattern that directly impacts whether assistive technology users can successfully
          complete your form.
        </p>
        <div className="space-y-3">
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-emerald-600 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">Every input, select, and textarea has a programmatically associated label (not just a placeholder)</p>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-emerald-600 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">Supplementary instructions use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-describedby</code> to connect to the relevant field</p>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-emerald-600 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">Required fields use the <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">required</code> attribute or <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-required=&quot;true&quot;</code></p>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-emerald-600 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">Validation errors set <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-invalid=&quot;true&quot;</code> and link error text via <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-describedby</code></p>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-emerald-600 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">Related controls (radios, checkboxes) are wrapped in <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">&lt;fieldset&gt;</code> with a <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">&lt;legend&gt;</code></p>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-emerald-600 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">Identity and payment fields include appropriate <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">autocomplete</code> values</p>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-emerald-600 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">Dynamic validation messages use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">role=&quot;alert&quot;</code> or <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-live</code> for immediate announcement</p>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-emerald-600 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">Form has been tested with <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">speakable -f audit</code> and all issues resolved</p>
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <RelatedPages
        pages={[
          {
            href: "/docs/live-regions",
            title: "Live Regions",
            description: "Dynamic content announcements for real-time validation and status updates.",
          },
          {
            href: "/docs/common-mistakes",
            title: "Common Mistakes",
            description: "The most frequent accessibility issues and how to fix them.",
          },
          {
            href: "/docs/testing-checklist",
            title: "Testing Checklist",
            description: "Step-by-step checklist for verifying accessibility across components.",
          },
          {
            href: "/docs/component-patterns",
            title: "Component Patterns",
            description: "Accessible implementations for common interactive UI patterns.",
          },
        ]}
      />
    </>
  );
}
