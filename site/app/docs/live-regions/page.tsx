import Link from "next/link";
import type { Metadata } from "next";
import { RelatedPages } from "../../../components/RelatedPages";
import { SeeAlso } from "../../../components/SeeAlso";

export const metadata: Metadata = {
  title: "ARIA Live Region Testing and Dynamic Content",
  description: "Test ARIA live regions with Speakable. Learn aria-live, aria-atomic, and aria-relevant patterns and detect misconfigured live regions.",
};

export default function LiveRegionsPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Live Regions</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">ARIA Live Region Testing and Dynamic Content</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          ARIA live region testing is essential for any application that updates content dynamically.
          Modern web applications constantly update the screen: notifications appear, counters change,
          new messages arrive, spinners resolve into content. Sighted users notice these changes instantly
          because they can see the whole viewport. Screen reader users, however, only hear what the
          assistive technology announces. Without explicit hints, a screen reader has no way to know that
          something important just changed somewhere else on the page. ARIA live regions solve this problem
          by letting developers mark areas of the DOM that should be announced automatically when their
          content changes, without requiring the user to move focus. They are the backbone of accessible
          dynamic interfaces and critical for any application that updates content asynchronously.
        </p>
      </header>

      {/* Section 1: What Are Live Regions? */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Are Live Regions?</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          A live region is any element with an <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-live</code> attribute
          (or an implicit live region role like <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;alert&quot;</code> or{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;status&quot;</code>).
          When the text content inside that element changes, the screen reader detects the mutation and announces
          the updated content to the user, even if focus is elsewhere on the page.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Three attributes control how live regions behave:{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-live</code>,{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-atomic</code>, and{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-relevant</code>.
          Together they determine when, how much, and what type of content changes get announced.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">aria-live</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-live</code> attribute
          accepts three values that define the interruption priority of announcements:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2 leading-relaxed">
          <li><strong>polite</strong>: The screen reader waits until it finishes speaking the current utterance, then announces the change. This is the most common setting for non-critical updates.</li>
          <li><strong>assertive</strong>: The screen reader interrupts whatever it is currently saying and immediately announces the change. Reserved for urgent, time-sensitive information.</li>
          <li><strong>off</strong>: The region is not announced automatically. This is the default for all elements and is useful when you want to suppress announcements temporarily or manage them through scripting.</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">aria-atomic</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-atomic</code> attribute
          determines whether the entire live region is re-read when something inside it changes, or only the
          nodes that actually changed.
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2 leading-relaxed">
          <li><strong>true</strong>: The screen reader re-reads the entire contents of the live region container, providing full context every time. Good for short status messages where partial reads would be confusing.</li>
          <li><strong>false</strong> (default): Only the changed nodes are announced. Better for regions where content is appended (like chat logs) and repeating everything would be overwhelming.</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">aria-relevant</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-relevant</code> attribute
          specifies which types of DOM mutations should trigger an announcement. It accepts a space-separated list of tokens:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2 leading-relaxed">
          <li><strong>additions</strong>: Announce when new nodes are added to the region.</li>
          <li><strong>removals</strong>: Announce when nodes are removed from the region.</li>
          <li><strong>text</strong>: Announce when text content within existing nodes changes.</li>
          <li><strong>all</strong>: Shorthand for &quot;additions removals text&quot;.</li>
        </ul>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The default value is <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">additions text</code>,
          which covers the most common use cases. Support for <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">removals</code> is
          inconsistent across screen readers, so test carefully if you rely on it.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
          <p className="text-sm font-bold text-slate-700 mb-2">Key concept</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The live region container must exist in the DOM <em>before</em> the content changes.
            If you inject both the container and its content at the same time, many screen readers
            will miss the announcement. Always render the container on page load (it can be empty)
            and update its contents later.
          </p>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Basic Example</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<!-- Container exists on page load, starts empty -->
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  <!-- Updated dynamically via JavaScript -->
</div>

<script>
  // When the user adds an item to cart:
  const status = document.querySelector('[role="status"]');
  status.textContent = "3 items added to cart";
  // Screen reader announces: "3 items added to cart"
</script>`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          In this example, the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;status&quot;</code> implicitly
          sets <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-live=&quot;polite&quot;</code>. We also
          set <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-atomic=&quot;true&quot;</code> so
          the entire message is read every time. The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">sr-only</code> class
          visually hides the element while keeping it accessible to screen readers.
        </p>
      </section>

      {/* Section 2: Polite vs Assertive vs Off */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Polite vs Assertive vs Off</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Choosing the right priority level is one of the most important decisions when implementing live regions.
          An aggressive use of <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">assertive</code> can
          make an interface feel chaotic and overwhelming, while using{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">polite</code> for critical errors
          means users might miss them entirely.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-green-400" aria-hidden="true"></span>
              <h3 className="text-sm font-bold text-slate-900">polite</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Waits for the screen reader to finish its current speech before announcing the update.
              Non-interruptive and respectful of the user&apos;s current reading flow.
            </p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Use for</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Status messages (&quot;File saved&quot;)</li>
              <li>• Counter updates (&quot;3 items in cart&quot;)</li>
              <li>• Search result counts</li>
              <li>• Non-critical confirmations</li>
              <li>• Chat message arrivals</li>
            </ul>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-red-400" aria-hidden="true"></span>
              <h3 className="text-sm font-bold text-slate-900">assertive</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Interrupts whatever the screen reader is currently saying and announces immediately.
              Demands the user&apos;s attention right now.
            </p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Use for</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Form validation errors</li>
              <li>• Session timeout warnings</li>
              <li>• Critical system alerts</li>
              <li>• Connection loss notifications</li>
              <li>• Destructive action confirmations</li>
            </ul>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-slate-300" aria-hidden="true"></span>
              <h3 className="text-sm font-bold text-slate-900">off</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Content changes are not announced. The default for all elements.
              Useful for suppressing regions or managing announcements manually via focus management.
            </p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Use for</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Rapidly updating content (stock tickers)</li>
              <li>• Animations or visual-only changes</li>
              <li>• Regions managed by focus shifts</li>
              <li>• Content you announce via other means</li>
              <li>• Temporarily muted regions</li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <p className="text-sm font-bold text-slate-700 mb-2">Rule of thumb</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Default to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">polite</code>.
            Only escalate to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">assertive</code> when
            the user must know immediately and the information is time-critical. Overusing assertive
            is the live region equivalent of crying wolf, and users learn to ignore announcements.
          </p>
        </div>
      </section>

      {/* Section 3: Common Patterns */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Common Patterns</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          The following patterns cover the most frequent use cases for live regions in production applications.
          Each includes the recommended HTML structure and predicted screen reader output across the four
          major assistive technologies.
        </p>

        {/* Status Messages */}
        <h3 className="text-xl font-bold text-slate-900 mb-3">Status Messages</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Status messages communicate non-critical state changes: an item added to a cart, a file
          saved successfully, the number of search results returned. They should never interrupt
          the user. <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;status&quot;</code> with
          implicit <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-live=&quot;polite&quot;</code> is
          the correct pattern.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<div role="status" aria-live="polite" aria-atomic="true">
  3 items in cart
</div>`}
            </pre>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Screen reader output</p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><strong>NVDA:</strong> &quot;3 items in cart&quot;</li>
            <li><strong>JAWS:</strong> &quot;3 items in cart&quot;</li>
            <li><strong>VoiceOver:</strong> &quot;3 items in cart&quot;</li>
            <li><strong>Narrator:</strong> &quot;3 items in cart&quot;</li>
          </ul>
        </div>

        {/* Form Validation Errors */}
        <h3 className="text-xl font-bold text-slate-900 mb-3">Form Validation Errors</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Inline validation errors that appear when a user leaves a field (on blur) or submits a form
          need immediate attention. Using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;alert&quot;</code> provides
          an implicit <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-live=&quot;assertive&quot;</code>,
          ensuring the error message interrupts and reaches the user right away. Pair this with{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-describedby</code> on
          the input so the error is also discoverable when the field regains focus.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<label for="email">Email address</label>
<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid="true"
/>
<div role="alert" id="email-error">
  Please enter a valid email address
</div>`}
            </pre>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Screen reader output</p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><strong>NVDA:</strong> &quot;Alert: Please enter a valid email address&quot;</li>
            <li><strong>JAWS:</strong> &quot;Alert: Please enter a valid email address&quot;</li>
            <li><strong>VoiceOver:</strong> &quot;Please enter a valid email address&quot;</li>
            <li><strong>Narrator:</strong> &quot;Alert: Please enter a valid email address&quot;</li>
          </ul>
        </div>

        <SeeAlso
          href="/docs/accessible-forms"
          title="See also: Accessible Forms"
          description="Deep dive into form labeling, error handling, and validation patterns that work with screen readers."
        />

        {/* Loading Indicators */}
        <h3 className="text-xl font-bold text-slate-900 mb-3 mt-10">Loading Indicators</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When content is loading asynchronously, use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-busy=&quot;true&quot;</code> on
          the container that will eventually receive content. This tells the screen reader to hold off
          announcing changes to child nodes until the busy state clears. Combine with a polite live
          region to announce the loading state itself.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<!-- While loading -->
<div aria-busy="true" aria-live="polite">
  Loading results...
</div>

<!-- After loading completes, update: -->
<div aria-busy="false" aria-live="polite">
  12 results found
</div>`}
            </pre>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Screen reader output</p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><strong>NVDA:</strong> &quot;Loading results...&quot; → (after load) &quot;12 results found&quot;</li>
            <li><strong>JAWS:</strong> &quot;Loading results...&quot; → &quot;12 results found&quot;</li>
            <li><strong>VoiceOver:</strong> &quot;Loading results...&quot; → &quot;12 results found&quot;</li>
            <li><strong>Narrator:</strong> &quot;Loading results...&quot; → &quot;12 results found&quot;</li>
          </ul>
        </div>

        {/* Chat Messages / Feeds */}
        <h3 className="text-xl font-bold text-slate-900 mb-3">Chat Messages / Feeds</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Chat interfaces and activity feeds append new content continuously. The{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;log&quot;</code> semantic
          combined with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-live=&quot;polite&quot;</code> tells
          the screen reader to announce new additions without re-reading the entire history. Keep{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-atomic=&quot;false&quot;</code> (or
          omit it, since false is the default) so only the new messages are spoken.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<div role="log" aria-live="polite" aria-relevant="additions">
  <div class="message">
    <span class="author">Alice:</span>
    Hey, are you available for a call?
  </div>
  <!-- New messages appended here by JavaScript -->
  <div class="message">
    <span class="author">Bob:</span>
    Sure, give me 5 minutes.
  </div>
</div>`}
            </pre>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Screen reader output (when Bob&apos;s message is added)</p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><strong>NVDA:</strong> &quot;Bob: Sure, give me 5 minutes.&quot;</li>
            <li><strong>JAWS:</strong> &quot;Bob: Sure, give me 5 minutes.&quot;</li>
            <li><strong>VoiceOver:</strong> &quot;Bob: Sure, give me 5 minutes.&quot;</li>
            <li><strong>Narrator:</strong> &quot;Bob: Sure, give me 5 minutes.&quot;</li>
          </ul>
        </div>

        {/* Toast Notifications */}
        <h3 className="text-xl font-bold text-slate-900 mb-3">Toast Notifications</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Toast notifications are transient alerts that appear temporarily and then auto-dismiss.
          Because they may disappear before a user navigates to them, they must be announced immediately
          via a live region. Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;alert&quot;</code> for
          critical toasts (errors, warnings) and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;status&quot;</code> for
          informational ones. The container should be present in the DOM at all times; inject the message
          content when the toast fires.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<!-- Toast container always in DOM -->
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  class="toast-container"
>
  File saved successfully
</div>`}
            </pre>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Screen reader output</p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><strong>NVDA:</strong> &quot;Alert: File saved successfully&quot;</li>
            <li><strong>JAWS:</strong> &quot;Alert: File saved successfully&quot;</li>
            <li><strong>VoiceOver:</strong> &quot;File saved successfully&quot;</li>
            <li><strong>Narrator:</strong> &quot;Alert: File saved successfully&quot;</li>
          </ul>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <p className="text-sm font-bold text-slate-700 mb-2">Timing consideration</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            If a toast auto-dismisses in under 5 seconds, some users may not have time to read it
            (or hear the full announcement). WCAG 2.2.1 recommends providing a way to extend or
            dismiss timers. For screen reader users, the live region announcement persists in their
            buffer even after the visual toast disappears, but sighted keyboard users may still
            need more time.
          </p>
        </div>
      </section>

      {/* Section 4: Cross-Reader Differences */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Cross-Reader Differences</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          While the ARIA spec defines clear semantics for live regions, screen reader implementations
          vary. These differences affect timing, verbosity, and which attributes are fully supported.
          Understanding them helps you write markup that works reliably across assistive technologies.
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-slate-900">NVDA</span>
              <span className="text-xs text-slate-400 font-mono">Windows / Firefox, Chrome</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              NVDA has strong live region support. Assertive regions interrupt immediately; polite
              regions are queued and spoken after the current utterance finishes. It respects{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-atomic</code> correctly,
              re-reading the full container when set to true. NVDA also supports{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-relevant</code> for
              additions and text, though removal announcements can be inconsistent depending on
              the browser.
            </p>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-slate-900">JAWS</span>
              <span className="text-xs text-slate-400 font-mono">Windows / Chrome, Edge</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              JAWS behavior is similar to NVDA for most live region scenarios. It reliably announces
              assertive and polite regions with correct priority ordering. One difference: JAWS
              sometimes reads additional context around the changed content (such as parent element
              names or group labels), which can make announcements slightly more verbose. It also
              prefixes <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">role=&quot;alert&quot;</code> with
              the word &quot;Alert&quot; in most configurations.
            </p>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-slate-900">VoiceOver</span>
              <span className="text-xs text-slate-400 font-mono">macOS, iOS / Safari</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              VoiceOver on macOS can introduce a slight delay for polite live regions, sometimes
              up to a few hundred milliseconds longer than Windows screen readers. Assertive regions
              are announced promptly. VoiceOver on iOS is generally more responsive to polite regions
              than macOS. One quirk: VoiceOver does not always prefix alerts with &quot;Alert&quot;. The
              role is implicit in the interruption behavior rather than spoken explicitly.
            </p>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-slate-900">Narrator</span>
              <span className="text-xs text-slate-400 font-mono">Windows / Edge</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Narrator generally follows the assertive/polite semantics correctly. It works best
              with Microsoft Edge and has strong support for{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-atomic</code> and basic{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-relevant</code> values.
              Narrator tends to be concise in its announcements, less likely to read extra context
              compared to JAWS. Its live region implementation has improved significantly in recent
              Windows versions.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <p className="text-sm font-bold text-slate-700 mb-2">Testing tip</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Always test live regions with at least two screen readers on different browsers. The most
            common combination for coverage is NVDA + Firefox on Windows and VoiceOver + Safari on macOS.
            This catches the majority of implementation differences.
          </p>
        </div>
      </section>

      {/* Section 5: Speakable's Limitations with Dynamic Content */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Speakable&apos;s Limitations with Dynamic Content</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable is a static analysis tool: it works by parsing an HTML snapshot and predicting
          what a screen reader would announce based on the accessible roles, names, states, and
          relationships present in that markup. This makes it excellent for certain live region checks
          and limited for others.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">What Speakable Can Verify</h3>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2 leading-relaxed">
          <li>Correct <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-live</code> attribute values on live region containers</li>
          <li>Proper use of implicit live region roles (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">alert</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">status</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">log</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">timer</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">marquee</code>)</li>
          <li>Correct <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-atomic</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-relevant</code> settings</li>
          <li>Whether the live region container exists in the static HTML (vs. being injected dynamically)</li>
          <li>That content inside a live region has meaningful text (not empty or placeholder)</li>
          <li>That <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-busy</code> is used correctly alongside live regions</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">What Speakable Cannot Verify</h3>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2 leading-relaxed">
          <li>Whether the content actually changes in response to user interaction (requires runtime execution)</li>
          <li>The timing of announcements: whether a message appears fast enough or persists long enough</li>
          <li>Interactions between multiple live regions competing for attention</li>
          <li>Whether <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-busy</code> transitions correctly from true to false at the right moment</li>
          <li>Browser and screen reader-specific timing quirks (delays, queueing behavior)</li>
        </ul>

        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg px-5 py-4 mb-6">
          <p className="text-sm font-bold text-blue-700 mb-1">In practice</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Speakable tells you if the live region is correctly structured. Manual testing (or runtime
            tools like Guidepup and Playwright with a screen reader) confirms the experience is timed
            well and actually triggers in response to user actions.
          </p>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Recommended Workflow</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Combine static and runtime testing for full coverage of dynamic content:
        </p>
        <div className="space-y-3">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <p className="text-sm text-slate-600">
              <strong>Static analysis with Speakable:</strong> Verify that live region containers have correct
              attributes, roles, and structure. Run this in CI to catch regressions in your markup.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <p className="text-sm text-slate-600">
              <strong>Integration tests:</strong> Use Playwright or Cypress to simulate user actions and
              assert that live region content changes as expected (DOM-level verification).
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">3.</span>
            <p className="text-sm text-slate-600">
              <strong>Screen reader testing:</strong> Use Guidepup, Auto-VO, or manual testing to verify
              the actual spoken output, timing, and priority of announcements in real assistive technology.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">4.</span>
            <p className="text-sm text-slate-600">
              <strong>User testing:</strong> Real screen reader users can identify timing issues, verbosity
              problems, and announcement fatigue that automated tools cannot detect.
            </p>
          </div>
        </div>
      </section>

      <RelatedPages
        pages={[
          {
            href: "/docs/accessible-forms",
            title: "Accessible Forms",
            description: "Form labeling, error handling, required fields, and validation patterns for screen reader compatibility.",
          },
          {
            href: "/docs/component-patterns",
            title: "Component Patterns",
            description: "Accessible implementations of common UI components: modals, tabs, accordions, menus, and more.",
          },
          {
            href: "/docs/how-screen-readers-work",
            title: "How Screen Readers Work",
            description: "The full pipeline from HTML to spoken output: accessibility tree, roles, names, and rendering.",
          },
          {
            href: "/docs/testing-checklist",
            title: "Testing Checklist",
            description: "Step-by-step checklist for verifying accessibility across screen readers, keyboards, and automated tools.",
          },
        ]}
      />
    </>
  );
}
