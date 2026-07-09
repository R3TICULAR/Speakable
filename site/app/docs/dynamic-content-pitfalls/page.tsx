import Link from "next/link";
import { RelatedPages } from "../../../components/RelatedPages";
import { SeeAlso } from "../../../components/SeeAlso";

export default function DynamicContentPitfallsPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Dynamic Content Pitfalls</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Dynamic Content: What Screen Readers Actually Hear
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          A component can look and function perfectly for sighted users while delivering a confusing,
          repetitive, or silent experience through a screen reader. This page contrasts well-implemented
          dynamic components with common anti-patterns, showing exactly what screen readers announce
          in each scenario. Every example is verifiable with Speakable.
        </p>
      </header>

      {/* Pattern 1: Multi-select */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Pattern 1: Multi-Select Toggle
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          A listbox where users can select multiple options. This is one of the most common sources
          of VoiceOver repetition because three things happen simultaneously on selection:
          the active descendant updates, the selected state changes, and a live region fires.
        </p>

        {/* Bad version */}
        <div className="mb-8 rounded-xl border-2 border-red-200 bg-red-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-red-600" aria-hidden="true">cancel</span>
            <h3 className="text-lg font-bold text-red-900">Problematic Implementation</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`// On option click:
setActiveDescendant("option-js");  // VoiceOver reads: "JavaScript, option"
setAriaSelected("option-js", true); // VoiceOver reads: "JavaScript, selected"
liveRegion.textContent =
  "JavaScript selected. 1 of 6 selected."; // VoiceOver reads this too`}
          </pre>
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">What VoiceOver announces:</p>
            <div className="space-y-1 font-mono text-sm text-red-900">
              <p>&quot;JavaScript, option&quot;</p>
              <p>&quot;JavaScript, option, selected&quot;</p>
              <p>&quot;JavaScript selected. 1 of 6 selected.&quot;</p>
            </div>
            <p className="text-xs text-red-600 mt-3">The user hears &quot;JavaScript&quot; three times in rapid succession.</p>
          </div>
        </div>

        {/* Good version */}
        <div className="rounded-xl border-2 border-green-200 bg-green-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-green-600" aria-hidden="true">check_circle</span>
            <h3 className="text-lg font-bold text-green-900">Correct Implementation</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`// On option click:
// 1. Only update activedescendant if navigating to a DIFFERENT option
if (activeIndex !== clickedIndex) {
  setActiveDescendant("option-js");
}
// 2. Toggle selected state (screen reader announces this)
setAriaSelected("option-js", true);
// 3. Live region: summary only, no option name, debounced 200ms
setTimeout(() => {
  liveRegion.textContent = "1 of 6 selected.";
}, 200);`}
          </pre>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">What VoiceOver announces:</p>
            <div className="space-y-1 font-mono text-sm text-green-900">
              <p>&quot;JavaScript, option, selected&quot;</p>
              <p className="text-slate-400">(200ms pause)</p>
              <p>&quot;1 of 6 selected.&quot;</p>
            </div>
            <p className="text-xs text-green-600 mt-3">Clean, non-repetitive. The user hears the option name once, then the summary.</p>
          </div>
        </div>
      </section>

      {/* Pattern 2: Toast Notifications */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Pattern 2: Toast Notification Storms
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Toast notifications that stack rapidly can overwhelm screen reader users. Each toast fires
          a live region announcement, and if they arrive faster than the reader can speak, earlier
          messages get cut off or pile up into an unintelligible stream.
        </p>

        <div className="mb-8 rounded-xl border-2 border-red-200 bg-red-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-red-600" aria-hidden="true">cancel</span>
            <h3 className="text-lg font-bold text-red-900">Rapid Fire Toasts</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`// Bulk action triggers multiple toasts in 50ms
showToast("File 1 uploaded successfully");  // t=0ms
showToast("File 2 uploaded successfully");  // t=20ms
showToast("File 3 uploaded successfully");  // t=40ms
showToast("3 files processed");             // t=50ms`}
          </pre>
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">What the user hears:</p>
            <div className="space-y-1 font-mono text-sm text-red-900">
              <p>&quot;File 1 uplo-&quot; <span className="text-red-400">(interrupted)</span></p>
              <p>&quot;File 2 uplo-&quot; <span className="text-red-400">(interrupted)</span></p>
              <p>&quot;File 3 uplo-&quot; <span className="text-red-400">(interrupted)</span></p>
              <p>&quot;3 files processed&quot;</p>
            </div>
            <p className="text-xs text-red-600 mt-3">
              Polite announcements queue but assertive ones interrupt. Either way, rapid-fire
              messages degrade the experience.
            </p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-green-200 bg-green-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-green-600" aria-hidden="true">check_circle</span>
            <h3 className="text-lg font-bold text-green-900">Batched Summary</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`// Debounce: collect results, announce once after settling
const pending = [];
function queueToast(msg) {
  pending.push(msg);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    liveRegion.textContent = pending.length === 1
      ? pending[0]
      : \`\${pending.length} actions completed.\`;
    pending.length = 0;
  }, 300);
}`}
          </pre>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">What the user hears:</p>
            <div className="font-mono text-sm text-green-900">
              <p>&quot;3 actions completed.&quot;</p>
            </div>
            <p className="text-xs text-green-600 mt-3">One clear announcement after the batch settles.</p>
          </div>
        </div>
      </section>

      {/* Pattern 3: Real-time counter */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Pattern 3: Rapidly Updating Counters
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Countdown timers, stock tickers, and character counters that update every second (or faster)
          inside a live region will cause the screen reader to announce every single change,
          drowning out everything else on the page.
        </p>

        <div className="mb-8 rounded-xl border-2 border-red-200 bg-red-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-red-600" aria-hidden="true">cancel</span>
            <h3 className="text-lg font-bold text-red-900">Live Region on a Timer</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`<div aria-live="polite" aria-atomic="true">
  <span id="countdown">59</span> seconds remaining
</div>

<script>
  setInterval(() => {
    countdown.textContent = --seconds;
  }, 1000);
</script>`}
          </pre>
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">What the user hears:</p>
            <div className="font-mono text-sm text-red-900">
              <p>&quot;59 seconds remaining&quot;</p>
              <p>&quot;58 seconds remaining&quot;</p>
              <p>&quot;57 seconds remaining&quot;</p>
              <p className="text-red-400">... every second, forever, blocking all other interaction</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-green-200 bg-green-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-green-600" aria-hidden="true">check_circle</span>
            <h3 className="text-lg font-bold text-green-900">Announce at Milestones Only</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`<!-- Visual counter updates every second (NOT in a live region) -->
<div aria-hidden="true" id="visual-countdown">59</div>

<!-- Live region announces only at key moments -->
<div role="status" aria-live="polite" id="countdown-announce"></div>

<script>
  setInterval(() => {
    seconds--;
    visualCountdown.textContent = seconds;
    // Only announce at meaningful thresholds
    if (seconds === 30 || seconds === 10 || seconds === 0) {
      announce.textContent = seconds === 0
        ? "Time is up."
        : \`\${seconds} seconds remaining.\`;
    }
  }, 1000);
</script>`}
          </pre>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">What the user hears:</p>
            <div className="font-mono text-sm text-green-900">
              <p>&quot;30 seconds remaining.&quot;</p>
              <p className="text-slate-400">(20 seconds of silence, user can interact freely)</p>
              <p>&quot;10 seconds remaining.&quot;</p>
              <p className="text-slate-400">(10 seconds of silence)</p>
              <p>&quot;Time is up.&quot;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pattern 4: Autocomplete / Search Results */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Pattern 4: Autocomplete Results Announcing Every Keystroke
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Search-as-you-type components that announce filtered results on every keystroke create
          a maddening experience. The user types &quot;rea&quot; and hears three separate announcements
          for the filtered list at &quot;r&quot;, &quot;re&quot;, and &quot;rea&quot;, each interrupting the last.
        </p>

        <div className="mb-8 rounded-xl border-2 border-red-200 bg-red-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-red-600" aria-hidden="true">cancel</span>
            <h3 className="text-lg font-bold text-red-900">Announce on Every Input Event</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`input.addEventListener("input", (e) => {
  const results = filter(options, e.target.value);
  renderOptions(results);
  // Fires on EVERY keystroke
  liveRegion.textContent =
    \`\${results.length} results available.\`;
});`}
          </pre>
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">User types &quot;react&quot;:</p>
            <div className="space-y-1 font-mono text-sm text-red-900">
              <p>&quot;24 results avail-&quot; <span className="text-red-400">(interrupted by next keystroke)</span></p>
              <p>&quot;12 results avail-&quot; <span className="text-red-400">(interrupted)</span></p>
              <p>&quot;8 results avail-&quot; <span className="text-red-400">(interrupted)</span></p>
              <p>&quot;3 results avail-&quot; <span className="text-red-400">(interrupted)</span></p>
              <p>&quot;2 results available.&quot;</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-green-200 bg-green-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-green-600" aria-hidden="true">check_circle</span>
            <h3 className="text-lg font-bold text-green-900">Debounced Announcement After Typing Settles</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`let announceTimer;
input.addEventListener("input", (e) => {
  const results = filter(options, e.target.value);
  renderOptions(results);

  // Wait for typing to stop before announcing
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    liveRegion.textContent = results.length === 0
      ? "No results found."
      : \`\${results.length} results available. Use arrow keys to browse.\`;
  }, 500); // 500ms debounce
});`}
          </pre>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">User types &quot;react&quot;:</p>
            <div className="font-mono text-sm text-green-900">
              <p className="text-slate-400">(silence while typing)</p>
              <p>&quot;2 results available. Use arrow keys to browse.&quot;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pattern 5: Form Validation */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Pattern 5: Inline Form Validation Overload
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Real-time form validation that announces errors on every character change turns a simple
          form into an accessibility nightmare. The user types a password and hears
          &quot;too short&quot; after every single character.
        </p>

        <div className="mb-8 rounded-xl border-2 border-red-200 bg-red-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-red-600" aria-hidden="true">cancel</span>
            <h3 className="text-lg font-bold text-red-900">Validate on Every Character</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`<input type="password" aria-describedby="pw-error" />
<div id="pw-error" role="alert">
  <!-- role="alert" = assertive live region -->
</div>

<script>
  input.addEventListener("input", () => {
    if (input.value.length < 8) {
      pwError.textContent = "Password must be at least 8 characters.";
    } else {
      pwError.textContent = "";
    }
  });
</script>`}
          </pre>
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">User types &quot;mypass&quot;:</p>
            <div className="space-y-1 font-mono text-sm text-red-900">
              <p>&quot;Password must be at least 8 characters.&quot; <span className="text-red-400">(after &quot;m&quot;)</span></p>
              <p>&quot;Password must be at least 8 characters.&quot; <span className="text-red-400">(after &quot;my&quot;)</span></p>
              <p>&quot;Password must be at least 8 characters.&quot; <span className="text-red-400">(after &quot;myp&quot;)</span></p>
              <p className="text-red-400">... repeated for every character until length reaches 8</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-green-200 bg-green-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-green-600" aria-hidden="true">check_circle</span>
            <h3 className="text-lg font-bold text-green-900">Validate on Blur (or Debounced)</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`<input type="password" aria-describedby="pw-error" aria-invalid="false" />
<div id="pw-error" role="status" aria-live="polite"></div>

<script>
  // Validate when the user leaves the field, not while typing
  input.addEventListener("blur", () => {
    if (input.value.length < 8) {
      input.setAttribute("aria-invalid", "true");
      pwError.textContent = "Password must be at least 8 characters.";
    } else {
      input.setAttribute("aria-invalid", "false");
      pwError.textContent = "";
    }
  });
</script>`}
          </pre>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">User types &quot;mypass&quot; then tabs away:</p>
            <div className="font-mono text-sm text-green-900">
              <p className="text-slate-400">(silence while typing)</p>
              <p>&quot;Password must be at least 8 characters.&quot;</p>
            </div>
            <p className="text-xs text-green-600 mt-3">One announcement at the right moment, not six interruptions.</p>
          </div>
        </div>
      </section>

      {/* Pattern 6: Focus + State collision */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Pattern 6: Tab Panel Focus and State Collision
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Tab components that simultaneously move focus, change <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-selected</code>,
          update <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-expanded</code>,
          AND swap panel content can produce a cascade of announcements. The screen reader
          tries to describe all of these changes at once.
        </p>

        <div className="mb-8 rounded-xl border-2 border-red-200 bg-red-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-red-600" aria-hidden="true">cancel</span>
            <h3 className="text-lg font-bold text-red-900">Everything Changes at Once</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`function activateTab(tab, panel) {
  // All happen synchronously in one frame:
  tabs.forEach(t => t.setAttribute("aria-selected", "false"));
  tab.setAttribute("aria-selected", "true");
  tab.focus();                          // focus move announced
  panel.removeAttribute("hidden");      // panel content announced
  tab.setAttribute("aria-expanded", "true"); // state announced
}`}
          </pre>
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">What the user hears:</p>
            <div className="space-y-1 font-mono text-sm text-red-900">
              <p>&quot;Settings tab, selected&quot;</p>
              <p>&quot;Settings tab, expanded&quot;</p>
              <p>&quot;Settings panel&quot; <span className="text-red-400">(panel content starts reading)</span></p>
            </div>
            <p className="text-xs text-red-600 mt-3">Three rapid announcements for one user action.</p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-green-200 bg-green-50/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-green-600" aria-hidden="true">check_circle</span>
            <h3 className="text-lg font-bold text-green-900">Minimal State, Let Focus Do the Work</h3>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-4">
{`function activateTab(tab, panel) {
  // Only aria-selected changes on tabs (no aria-expanded needed)
  tabs.forEach(t => t.setAttribute("aria-selected", "false"));
  tab.setAttribute("aria-selected", "true");

  // Swap panels (no live region, panel is linked via aria-controls)
  panels.forEach(p => p.hidden = true);
  panel.hidden = false;

  // Focus stays on tab; user can Tab into panel when ready
  // The tab's "selected" state is the only announcement
}`}
          </pre>
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">What the user hears:</p>
            <div className="font-mono text-sm text-green-900">
              <p>&quot;Settings, tab, selected, 2 of 4&quot;</p>
            </div>
            <p className="text-xs text-green-600 mt-3">
              One announcement. The panel content is available when the user tabs forward.
            </p>
          </div>
        </div>
      </section>

      {/* Rules of Thumb */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Rules of Thumb for Dynamic Content
        </h2>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <ol className="space-y-4 text-slate-700 leading-relaxed">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold shrink-0">1.</span>
              <span><strong>One user action = one announcement.</strong> If the user pressed one key or clicked one button, they should hear one piece of new information, not three.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold shrink-0">2.</span>
              <span><strong>Debounce all live region updates.</strong> A 200-500ms delay after the last change prevents partial or interrupted announcements. Users are patient for a half second; they are not patient for repetition.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold shrink-0">3.</span>
              <span><strong>Never repeat information the screen reader already announces.</strong> When <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-selected</code> changes on the focused element, the reader announces the element name + new state. A live region saying the same thing is redundant.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold shrink-0">4.</span>
              <span><strong>Choose one focus strategy.</strong> Either real DOM focus (roving tabindex) OR <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-activedescendant</code>. Never both. Mixing them causes double announcements.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold shrink-0">5.</span>
              <span><strong>Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;status&quot;</code> (polite) over <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;alert&quot;</code> (assertive) for most updates.</strong> Alerts interrupt the current speech. Status waits. Most state changes are not emergencies.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold shrink-0">6.</span>
              <span><strong>Validate on blur, not on input.</strong> Per-character validation in live regions is one of the most common sources of screen reader fatigue. Wait until the user leaves the field.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold shrink-0">7.</span>
              <span><strong>Keep counters out of live regions.</strong> If something updates more than once every 5 seconds, it should not be in a live region. Provide a manual &quot;check status&quot; button or announce only at meaningful thresholds.</span>
            </li>
          </ol>
        </div>
      </section>

      {/* Detecting with Speakable */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Detecting These Issues with Speakable
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable&apos;s verbosity analyzer automatically detects the patterns described above.
          Feed it a timeline of accessibility events from your component interactions and it
          identifies redundant announcements, rapid-fire live regions, and focus/state collisions.
        </p>

        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm font-mono overflow-x-auto mb-6">
{`import { runtime } from '@reticular/speakable';

// Capture events during interaction
const engine = runtime.createEngine({ document });
engine.attach();

// ... user interacts with your component ...

// Analyze for verbosity issues
const events = engine.getEvents();
const report = runtime.analyzeVerbosity(events);

console.log(report.score);        // 0-100 (higher is better)
console.log(report.findings);     // Array of issues with remediation steps
console.log(report.summary);      // { high: 2, medium: 1, low: 0, total: 3 }

// Each finding includes:
// - pattern: "redundant-state-and-live-region"
// - severity: "high"
// - affectedReaders: ["VoiceOver (macOS)", "VoiceOver (iOS)"]
// - remediation: ["Remove the live region...", "Use summary-only text..."]`}
        </pre>

        <p className="text-slate-600 mb-4 leading-relaxed">
          Or use the CLI with the MCP integration to check verbosity as part of your development flow.
          The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">analyze_verbosity</code> MCP
          tool accepts accessibility event arrays and returns the full report with remediation guidance.
        </p>
      </section>

      {/* Cross-reader differences */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          How Different Screen Readers Handle These Patterns
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Not all screen readers behave the same when hit with rapid state changes. Understanding
          the differences helps you prioritize which patterns to fix first.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 px-4 font-bold text-slate-900">Pattern</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">VoiceOver</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">NVDA</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">JAWS</th>
                <th className="text-left py-3 px-4 font-bold text-slate-900">Narrator</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">State + live region</td>
                <td className="py-3 px-4 text-red-600">Reads both (2-3x)</td>
                <td className="py-3 px-4 text-amber-600">Sometimes coalesces</td>
                <td className="py-3 px-4 text-amber-600">Usually coalesces</td>
                <td className="py-3 px-4 text-red-600">Reads both</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Rapid polite announcements</td>
                <td className="py-3 px-4 text-red-600">Queues all, reads all</td>
                <td className="py-3 px-4 text-amber-600">Drops some in queue</td>
                <td className="py-3 px-4 text-amber-600">Last one wins</td>
                <td className="py-3 px-4 text-red-600">Queues all</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Rapid assertive announcements</td>
                <td className="py-3 px-4 text-red-600">Each interrupts previous</td>
                <td className="py-3 px-4 text-red-600">Each interrupts previous</td>
                <td className="py-3 px-4 text-red-600">Each interrupts previous</td>
                <td className="py-3 px-4 text-red-600">Each interrupts previous</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Focus + activedescendant</td>
                <td className="py-3 px-4 text-red-600">Double-read</td>
                <td className="py-3 px-4 text-amber-600">Usually ignores AD</td>
                <td className="py-3 px-4 text-amber-600">Prefers focus</td>
                <td className="py-3 px-4 text-red-600">Double-read</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Same text set twice</td>
                <td className="py-3 px-4 text-green-600">Ignores duplicate</td>
                <td className="py-3 px-4 text-green-600">Ignores duplicate</td>
                <td className="py-3 px-4 text-amber-600">May re-read</td>
                <td className="py-3 px-4 text-green-600">Ignores duplicate</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Related pages */}
      <RelatedPages
        pages={[
          { href: '/docs/live-regions', title: 'Live Regions', description: 'Deep dive into aria-live, aria-atomic, and aria-relevant.' },
          { href: '/docs/runtime-analysis', title: 'Runtime Analysis', description: 'Using Speakable to capture and analyze dynamic behavior.' },
          { href: '/docs/component-patterns', title: 'Component Patterns', description: 'Accessible implementations of common widgets.' },
        ]}
      />

      <SeeAlso
        href="/docs/focus-management"
        title="Focus Management"
        description="How to manage focus correctly in dynamic components."
      />
    </>
  );
}
