export default function AdvancedGuidePage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Advanced Guide</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Advanced Guide</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Deep dives into screen reader behavior, debugging workflows, accuracy considerations,
          and integration patterns for teams shipping accessible software.
        </p>
      </header>

      {/* Section 1: Blind Spots */}
      <section className="mb-20" id="blind-spots">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why Accessibility Audits Pass But Users Still Struggle</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Rule-based tools like Axe and Lighthouse check for WCAG violations — missing alt text,
          low contrast, missing form labels. But passing those checks doesn&apos;t mean the experience
          is good. These examples all pass automated audits yet produce confusing screen reader output.
        </p>

        {BLIND_SPOTS.map((spot) => (
          <div key={spot.title} className="mb-12 border-l-4 border-amber-400 pl-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{spot.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{spot.description}</p>
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg mb-3">
              <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML (passes Axe/Lighthouse)</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-blue-300">{spot.html}</pre>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Developer assumes</p>
                <p className="text-sm text-slate-700">{spot.assumption}</p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-bold text-amber-600 uppercase mb-1">Screen reader says</p>
                <pre className="text-xs font-mono text-amber-800 whitespace-pre-wrap">{spot.actual}</pre>
              </div>
            </div>
            <p className="text-sm text-slate-600 italic">{spot.gap}</p>
          </div>
        ))}
      </section>

      {/* Section 2: Debugging Walkthroughs */}
      <section className="mb-20" id="debugging">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Debugging Accessibility Like a User Hears It</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Step-by-step breakdowns of real accessibility bugs — diagnosed using Speakable output
          the same way you&apos;d use browser DevTools to debug a visual bug.
        </p>

        {DEBUG_WALKTHROUGHS.map((w) => (
          <div key={w.title} className="mb-14">
            <h3 className="text-lg font-bold text-slate-900 mb-3">{w.title}</h3>
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
                <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Problematic component</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-xs font-mono leading-relaxed text-red-300">{w.badHtml}</pre>
                </div>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-xs font-bold text-red-600 uppercase mb-1">Speakable output (the bug)</p>
                <pre className="text-xs font-mono text-red-800 whitespace-pre-wrap">{w.badOutput}</pre>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Root cause</p>
                <p className="text-sm text-slate-700">{w.rootCause}</p>
              </div>
              <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
                <div className="px-4 py-2 bg-emerald-900/20 border-b border-emerald-800/30">
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Fixed version</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-xs font-mono leading-relaxed text-emerald-300">{w.goodHtml}</pre>
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Fixed output</p>
                <pre className="text-xs font-mono text-emerald-800 whitespace-pre-wrap">{w.goodOutput}</pre>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Section 3: Speed Comparison */}
      <section className="mb-20" id="speed-comparison">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Manual Screen Reader Testing vs Speakable</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Both approaches have a place. Here&apos;s an honest comparison of when each makes sense.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4 font-bold text-slate-900"></th>
                <th className="py-3 pr-4 font-bold text-slate-900">Manual (NVDA/VoiceOver)</th>
                <th className="py-3 pr-4 font-bold text-slate-900">Speakable</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Time per component</td>
                <td className="py-3 pr-4">2–10 minutes</td>
                <td className="py-3 pr-4">Under 1 second</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Setup</td>
                <td className="py-3 pr-4">Install screen reader, learn keyboard shortcuts, configure settings</td>
                <td className="py-3 pr-4"><code className="text-xs bg-slate-100 px-1 py-0.5 rounded">npm install</code> or paste into web tool</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Feedback loop</td>
                <td className="py-3 pr-4">Change code → rebuild → switch to screen reader → navigate → listen</td>
                <td className="py-3 pr-4">Change code → run command → read output</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">CI/CD</td>
                <td className="py-3 pr-4">Not practical (requires OS-specific runners + screen reader)</td>
                <td className="py-3 pr-4">Any runner, any OS</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Dynamic content</td>
                <td className="py-3 pr-4">Full support (live regions, focus, JS interactions)</td>
                <td className="py-3 pr-4">Static HTML only</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Accuracy</td>
                <td className="py-3 pr-4">Ground truth</td>
                <td className="py-3 pr-4">Heuristic approximation</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Regression detection</td>
                <td className="py-3 pr-4">Manual comparison (error-prone)</td>
                <td className="py-3 pr-4">Automated diff with exit codes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <p className="text-sm font-semibold text-slate-900 mb-2">When manual testing is still required</p>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>Focus management in modals, dialogs, and single-page app navigation</li>
            <li>Live region announcements (toast notifications, loading states)</li>
            <li>Complex keyboard interaction patterns (drag-and-drop, comboboxes)</li>
            <li>Screen reader-specific bugs that differ from the ARIA spec</li>
            <li>Final validation before shipping critical user flows</li>
          </ul>
        </div>
      </section>

      {/* Section 5: Workflow Integrations */}
      <section className="mb-20" id="workflow-integrations">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Using Speakable in Your Development Workflow</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable fits at multiple points in the development lifecycle. Here&apos;s where it adds the most value.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Local Development</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Run Speakable against your component HTML during development for instant feedback.
          No screen reader setup, no context switching.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg mb-8">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="text-xs font-mono leading-relaxed text-slate-300">{`# Quick check while developing
speakable src/components/Modal.html -s all -f text

# Focus on a specific element
speakable page.html --selector ".checkout-form" -f audit`}</pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Storybook Integration</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Add a script that extracts rendered HTML from Storybook stories and runs Speakable
          against each one. This gives you per-component accessibility output alongside your
          visual stories.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg mb-8">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">scripts/a11y-stories.sh</span>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="text-xs font-mono leading-relaxed text-slate-300">{`#!/bin/bash
# Build Storybook static output
npx storybook build -o storybook-static

# Run Speakable against each story's iframe HTML
for file in storybook-static/iframe.html; do
  echo "=== $file ==="
  speakable "$file" --selector "#storybook-root" -s all -f text
done`}</pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">PR Checks</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Surface announcement changes directly in pull requests. When a PR changes screen
          reader output, the diff makes it visible to reviewers.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg mb-8">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">.github/workflows/a11y-pr.yml</span>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="text-xs font-mono leading-relaxed text-slate-300">{`name: A11y PR Check
on: pull_request

jobs:
  announcement-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - run: npm ci

      # Get the base branch HTML
      - run: git show origin/\${GITHUB_BASE_REF}:dist/index.html > /tmp/base.html

      # Diff against current
      - name: Check for announcement changes
        run: |
          OUTPUT=$(npx @reticular/speakable dist/index.html --diff /tmp/base.html -f text 2>&1) || true
          if [ -n "$OUTPUT" ]; then
            echo "## Screen Reader Output Changes" >> $GITHUB_STEP_SUMMARY
            echo '\`\`\`' >> $GITHUB_STEP_SUMMARY
            echo "$OUTPUT" >> $GITHUB_STEP_SUMMARY
            echo '\`\`\`' >> $GITHUB_STEP_SUMMARY
          fi`}</pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Snapshot Testing</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Treat screen reader output like a visual snapshot. Store the expected output and
          fail tests when it changes unexpectedly.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg mb-4">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">tests/a11y-snapshot.test.ts</span>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="text-xs font-mono leading-relaxed text-slate-300">{`import { execSync } from 'child_process';
import { readFileSync } from 'fs';

describe('Accessibility snapshots', () => {
  it('button component announces correctly', () => {
    const output = execSync(
      'npx @reticular/speakable src/Button.html -s nvda -f text'
    ).toString().trim();

    expect(output).toMatchInlineSnapshot(\`
      "Submit, button"
    \`);
  });

  it('navigation announces with landmark', () => {
    const output = execSync(
      'npx @reticular/speakable src/Nav.html -s voiceover -f text'
    ).toString().trim();

    expect(output).toMatchInlineSnapshot(\`
      "navigation, Main
        Home, link
        About, link
        Contact, link"
    \`);
  });
});`}</pre>
          </div>
        </div>
      </section>

      {/* Section 6: Screen Reader Behavior */}
      <section className="mb-20" id="screen-reader-behavior">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How Screen Readers Actually Interpret Your UI</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Key behaviors that affect what users hear — and that often surprise developers.
        </p>

        {BEHAVIORS.map((b) => (
          <div key={b.title} className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{b.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{b.explanation}</p>
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg mb-3">
              <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-blue-300">{b.html}</pre>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">NVDA</p>
                <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{b.nvda}</pre>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">VoiceOver</p>
                <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{b.voiceover}</pre>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Section 7: Trust & Accuracy */}
      <section className="mb-20" id="accuracy">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How Accurate Is Speakable?</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable produces heuristic output based on the ARIA specification and documented
          screen reader behavior. Here&apos;s what that means in practice.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">How output is derived</h3>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          Speakable parses HTML into a DOM, walks the tree to compute accessible names (following
          the W3C accessible name computation algorithm), maps roles (explicit ARIA roles first,
          then implicit HTML roles), extracts states, and renders the result through screen
          reader-specific formatters that apply each reader&apos;s documented announcement patterns.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Known limitations</h3>
        <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside mb-6">
          <li>Static HTML only — no JavaScript execution, no dynamic content, no live regions</li>
          <li>No CSS visibility computation (relies on ARIA and HTML semantics for hidden detection)</li>
          <li>Screen reader heuristics vary by version — Speakable targets current stable releases</li>
          <li>Some screen readers have undocumented behaviors that differ from the ARIA spec</li>
          <li>Complex widget patterns (combobox, treegrid) may have simplified output</li>
          <li>Browser-specific rendering differences are not modeled</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Cross-reader differences</h3>
        <p className="text-slate-600 mb-4 text-sm leading-relaxed">
          NVDA, JAWS, and VoiceOver each have distinct announcement patterns. Speakable models
          these differences:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 pr-4 font-bold text-slate-900">Pattern</th>
                <th className="py-2 pr-4 font-bold text-slate-900">NVDA</th>
                <th className="py-2 pr-4 font-bold text-slate-900">JAWS</th>
                <th className="py-2 pr-4 font-bold text-slate-900">VoiceOver</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 font-mono">
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-sans font-medium text-slate-900">Landmarks</td>
                <td className="py-2 pr-4">navigation landmark</td>
                <td className="py-2 pr-4">navigation region</td>
                <td className="py-2 pr-4">navigation</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-sans font-medium text-slate-900">Headings</td>
                <td className="py-2 pr-4">Name, heading level N</td>
                <td className="py-2 pr-4">Name, heading level N</td>
                <td className="py-2 pr-4">heading level N, Name</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-sans font-medium text-slate-900">Disabled</td>
                <td className="py-2 pr-4">unavailable</td>
                <td className="py-2 pr-4">unavailable</td>
                <td className="py-2 pr-4">dimmed</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-sans font-medium text-slate-900">Text input</td>
                <td className="py-2 pr-4">edit</td>
                <td className="py-2 pr-4">edit</td>
                <td className="py-2 pr-4">edit text</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-sans font-medium text-slate-900">Mixed checkbox</td>
                <td className="py-2 pr-4">half checked</td>
                <td className="py-2 pr-4">partially checked</td>
                <td className="py-2 pr-4">mixed</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 font-sans font-medium text-slate-900">Images</td>
                <td className="py-2 pr-4">graphic</td>
                <td className="py-2 pr-4">graphic</td>
                <td className="py-2 pr-4">image</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">What this means for you</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            Speakable is a fast feedback layer for catching structural accessibility issues
            during development and CI. It catches the majority of problems that would affect
            screen reader users — missing names, broken hierarchy, incorrect roles, state
            mismatches. For final validation of complex interactions, dynamic content, and
            edge-case screen reader behavior, complement with manual testing or runtime tools
            like Guidepup.
          </p>
        </div>
      </section>
    </>
  );
}

// --- Data ---

const BLIND_SPOTS = [
  {
    title: 'Card with clickable div passes Axe, confuses screen readers',
    description: 'A card component uses a wrapping div with onClick. Axe doesn\'t flag it because there\'s no WCAG rule against clickable divs with visible text.',
    html: `<div class="card" onclick="navigate('/post/123')">\n  <img src="thumb.jpg" alt="Blog post thumbnail" />\n  <h3>Understanding ARIA</h3>\n  <p>A deep dive into ARIA attributes...</p>\n</div>`,
    assumption: 'Users will click the card to navigate. The image has alt text, headings are correct.',
    actual: `Understanding ARIA\nA deep dive into ARIA attributes...`,
    gap: 'No role, no interactive affordance. Screen reader users encounter static text with no indication it\'s clickable or navigable. They\'ll skip right past it looking for links.',
  },
  {
    title: 'Tooltip content invisible to screen readers',
    description: 'A tooltip appears on hover with important context. Axe passes because the trigger has visible text.',
    html: `<button>Delete</button>\n<div class="tooltip" role="tooltip" id="tip1">\n  This action cannot be undone\n</div>`,
    assumption: 'The tooltip provides helpful context. The button has a clear label.',
    actual: `Delete, button`,
    gap: 'The tooltip exists in the DOM but isn\'t connected to the button via aria-describedby. Screen reader users hear "Delete, button" with no warning that it\'s destructive. Add aria-describedby="tip1" to the button.',
  },
  {
    title: 'Tab panel with generic labels',
    description: 'A tab interface uses role="tablist" correctly. Axe validates the ARIA pattern.',
    html: `<div role="tablist">\n  <button role="tab" aria-selected="true">Tab 1</button>\n  <button role="tab">Tab 2</button>\n  <button role="tab">Tab 3</button>\n</div>`,
    assumption: 'The tab pattern is implemented correctly per ARIA authoring practices.',
    actual: `Tab 1, tab, selected\nTab 2, tab\nTab 3, tab`,
    gap: 'Technically valid ARIA, but "Tab 1" is meaningless. Users hear "Tab 1, tab, selected" and have no idea what content it controls. Use descriptive labels: "Overview", "Pricing", "Reviews".',
  },
  {
    title: 'Icon font leaking into announcements',
    description: 'Icon fonts render glyphs via CSS content or Unicode characters. Axe doesn\'t check text content quality.',
    html: `<button>\n  <span class="icon">&#xE87C;</span>\n  <span class="label">Favorite</span>\n</button>`,
    assumption: 'The button has visible text "Favorite" next to the icon.',
    actual: `\uE87C Favorite, button`,
    gap: 'The icon Unicode character is announced as gibberish before the label. Screen readers read all text content. Add aria-hidden="true" to the icon span.',
  },
  {
    title: 'Visually grouped radio buttons without fieldset',
    description: 'Radio buttons are visually grouped with a heading. Each has a label. Axe passes.',
    html: `<h3>Shipping speed</h3>\n<label><input type="radio" name="ship" /> Standard</label>\n<label><input type="radio" name="ship" /> Express</label>\n<label><input type="radio" name="ship" /> Overnight</label>`,
    assumption: 'Users can see the "Shipping speed" heading above the radios.',
    actual: `Shipping speed, heading level 3\nStandard, radio button, not checked\nExpress, radio button, not checked\nOvernight, radio button, not checked`,
    gap: 'When a screen reader user tabs directly to the radio group, they hear "Standard, radio button" with no group context. The heading isn\'t programmatically associated. Wrap in a fieldset with a legend.',
  },
];

const DEBUG_WALKTHROUGHS = [
  {
    title: 'Modal dialog that traps focus but announces nothing',
    badHtml: `<div class="modal-overlay" style="display:block">\n  <div class="modal">\n    <h2>Confirm deletion</h2>\n    <p>Are you sure you want to delete this item?</p>\n    <button>Cancel</button>\n    <button>Delete</button>\n  </div>\n</div>`,
    badOutput: `Confirm deletion\nAre you sure you want to delete this item?\nCancel, button\nDelete, button`,
    rootCause: 'The modal div has no role="dialog" and no aria-modal="true". Screen readers don\'t announce it as a dialog, don\'t trap virtual cursor inside it, and don\'t announce the dialog title when it opens. Users may not realize a modal appeared.',
    goodHtml: `<div class="modal-overlay" style="display:block">\n  <div class="modal" role="dialog" aria-modal="true"\n    aria-labelledby="modal-title">\n    <h2 id="modal-title">Confirm deletion</h2>\n    <p>Are you sure you want to delete this item?</p>\n    <button>Cancel</button>\n    <button>Delete</button>\n  </div>\n</div>`,
    goodOutput: `Confirm deletion, dialog\n  Confirm deletion, heading level 2\n  Are you sure you want to delete this item?\n  Cancel, button\n  Delete, button`,
  },
  {
    title: 'Search results count announced as static text',
    badHtml: `<div class="search-results">\n  <span class="count">24 results found</span>\n  <ul>\n    <li><a href="/r/1">Result one</a></li>\n    <!-- ... -->\n  </ul>\n</div>`,
    badOutput: `24 results found\nlist\n  Result one, link`,
    rootCause: 'The results count is static text with no live region. When search results update dynamically, screen reader users won\'t hear the count change. They have to manually navigate back to find it. For the static HTML case, the output is technically correct — but the pattern signals a likely dynamic content issue.',
    goodHtml: `<div class="search-results">\n  <span class="count" role="status" aria-live="polite"\n    aria-atomic="true">24 results found</span>\n  <ul>\n    <li><a href="/r/1">Result one</a></li>\n    <!-- ... -->\n  </ul>\n</div>`,
    goodOutput: `24 results found\nlist\n  Result one, link`,
  },
  {
    title: 'Data table missing headers',
    badHtml: `<table>\n  <tr>\n    <td><strong>Name</strong></td>\n    <td><strong>Email</strong></td>\n    <td><strong>Role</strong></td>\n  </tr>\n  <tr>\n    <td>Alice</td>\n    <td>alice@co.com</td>\n    <td>Admin</td>\n  </tr>\n</table>`,
    badOutput: `table\n  row\n    Name\n    Email\n    Role\n  row\n    Alice\n    alice@co.com\n    Admin`,
    rootCause: 'The first row uses <td> with <strong> instead of <th>. Screen readers can\'t identify column headers, so when users navigate cells, they won\'t hear "Name: Alice" — just "Alice" with no column context.',
    goodHtml: `<table>\n  <tr>\n    <th>Name</th>\n    <th>Email</th>\n    <th>Role</th>\n  </tr>\n  <tr>\n    <td>Alice</td>\n    <td>alice@co.com</td>\n    <td>Admin</td>\n  </tr>\n</table>`,
    goodOutput: `table\n  row\n    Name, column header\n    Email, column header\n    Role, column header\n  row\n    Alice\n    alice@co.com\n    Admin`,
  },
];

const BEHAVIORS = [
  {
    title: 'Accessible name computation priority',
    explanation: 'Screen readers follow a strict priority order when computing what to announce as an element\'s name: aria-labelledby > aria-label > native label > alt > text content > title. Higher-priority sources completely override lower ones.',
    html: `<button aria-label="Close" title="Close dialog">\n  ✕\n</button>`,
    nvda: 'Close, button',
    voiceover: 'Close, button',
  },
  {
    title: 'aria-hidden removes entire subtrees',
    explanation: 'Setting aria-hidden="true" on an element removes it AND all its children from the accessibility tree — even if children have their own roles and names. This is irreversible within that subtree.',
    html: `<div aria-hidden="true">\n  <button>Important action</button>\n  <a href="/help">Help</a>\n</div>`,
    nvda: '(nothing announced)',
    voiceover: '(nothing announced)',
  },
  {
    title: 'Role overrides native semantics',
    explanation: 'An explicit role attribute completely replaces the element\'s native semantics. A button with role="link" is announced as a link, not a button — even though it still behaves like a button for keyboard interaction.',
    html: `<button role="link">Read more</button>`,
    nvda: 'Read more, link',
    voiceover: 'Read more, link',
  },
  {
    title: 'Empty alt on images hides them completely',
    explanation: 'An image with alt="" is treated as decorative and removed from the accessibility tree entirely. This is different from a missing alt attribute, which causes screen readers to announce the filename or "image".',
    html: `<!-- Decorative (hidden from SR) -->\n<img src="divider.svg" alt="" />\n\n<!-- Missing alt (problematic) -->\n<img src="chart.png" />`,
    nvda: '(decorative: nothing)\n(missing: graphic)',
    voiceover: '(decorative: nothing)\n(missing: image)',
  },
  {
    title: 'Landmarks create navigation shortcuts',
    explanation: 'Screen reader users can jump between landmarks using keyboard shortcuts (NVDA: D key, VoiceOver: rotor). Unnamed landmarks are listed generically. Named landmarks (via aria-label) are distinguishable.',
    html: `<nav aria-label="Primary">\n  <a href="/">Home</a>\n</nav>\n<main>\n  <h1>Content</h1>\n</main>\n<nav aria-label="Footer">\n  <a href="/terms">Terms</a>\n</nav>`,
    nvda: 'Primary, navigation landmark\n  Home, link\nmain landmark\n  Content, heading level 1\nFooter, navigation landmark\n  Terms, link',
    voiceover: 'navigation, Primary\n  Home, link\nmain\n  heading level 1, Content\nnavigation, Footer\n  Terms, link',
  },
  {
    title: 'VoiceOver announces role before name for landmarks and headings',
    explanation: 'VoiceOver uses a different word order than NVDA/JAWS for certain elements. For headings and landmarks, VoiceOver says the role first, then the name. For buttons and links, it says the name first.',
    html: `<h2>Getting Started</h2>\n<button>Submit</button>`,
    nvda: 'Getting Started, heading level 2\nSubmit, button',
    voiceover: 'heading level 2, Getting Started\nSubmit, button',
  },
  {
    title: 'Disabled vs aria-disabled behavior',
    explanation: 'Native disabled attribute removes the element from tab order AND announces as disabled. aria-disabled="true" announces as disabled but keeps the element focusable — useful when you want users to discover disabled controls and understand why they\'re inactive.',
    html: `<!-- Native disabled (not focusable) -->\n<button disabled>Submit</button>\n\n<!-- ARIA disabled (still focusable) -->\n<button aria-disabled="true">Submit</button>`,
    nvda: 'Submit, button, unavailable\nSubmit, button, unavailable',
    voiceover: 'Submit, button, dimmed\nSubmit, button, dimmed',
  },
];
