import Link from "next/link";
import { RelatedPages } from "../../../components/RelatedPages";
import { RuntimeDemo } from "../../../components/RuntimeDemo";

export default function RuntimeAnalysisPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Runtime Analysis</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Runtime Accessibility Analysis</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Speakable now extends beyond static markup analysis to observe accessibility behavior during component
          interaction. Static analysis catches missing labels and broken ARIA attributes, but many critical
          accessibility defects only emerge at runtime: focus escaping modal dialogs, broken focus restoration
          after dialog close, missing live region announcements, and keyboard navigation regressions that appear
          only when users interact with widgets. Runtime analysis captures these behaviors as they happen,
          giving you visibility into what assistive technology users actually experience during interaction.
        </p>
      </header>

      {/* Section: What is an Accessibility Timeline? */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What is an Accessibility Timeline?</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          An Accessibility Timeline is a timestamped sequence of accessibility-relevant events captured during
          user interaction with a component. Think of it as a recording of everything that matters to assistive
          technology users: where focus moves, what gets announced, which states change, and when dialogs open
          or close.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Each timeline captures four categories of events:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
          <li><span className="font-medium">Focus transitions</span>: where keyboard focus moves during interaction, including the role and accessible name of each focused element</li>
          <li><span className="font-medium">Announcements</span>: text communicated to screen readers via aria-live regions, with politeness level (polite or assertive)</li>
          <li><span className="font-medium">State changes</span>: ARIA state mutations like aria-expanded, aria-selected, and aria-checked toggling during interaction</li>
          <li><span className="font-medium">Dialog lifecycle</span>: when dialogs open and close, whether they are modal, and whether focus management follows expected patterns</li>
        </ul>
        <p className="text-slate-600 leading-relaxed">
          By capturing these events as a sequence, you can review exactly what happened during an interaction,
          compare timelines across builds to detect regressions, and identify patterns that indicate broken
          accessibility behavior.
        </p>
      </section>

      {/* Section: How It Works */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The Runtime Accessibility Engine follows a five-stage pipeline to generate timelines from component interactions:
        </p>
        <div className="space-y-4 mb-6">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Attach Engine</p>
              <p className="text-sm text-slate-600">
                The Runtime Accessibility Engine attaches to the target document and installs observers for focus
                changes, DOM mutations, live region updates, and dialog state transitions.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Execute Interactions</p>
              <p className="text-sm text-slate-600">
                An interaction sequence (clicks, keyboard events, tab navigation) is executed against the
                component. The engine waits for DOM stability between each action.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">3.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Collect Events</p>
              <p className="text-sm text-slate-600">
                As interactions execute, the engine captures every accessibility-relevant event with a
                monotonically increasing timestamp relative to session start.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">4.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Generate Timeline</p>
              <p className="text-sm text-slate-600">
                After interactions complete, a settle period allows trailing asynchronous events to be captured.
                The engine then produces a complete Accessibility Timeline with ordered events and session metadata.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">5.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Detect Warnings</p>
              <p className="text-sm text-slate-600">
                The heuristic analyzer processes the event stream in real-time, emitting warnings for common
                accessibility anti-patterns like focus escaping dialogs or missing keyboard responses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Built-in Patterns */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Built-in Patterns</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable includes built-in interaction patterns for common ARIA widgets. These patterns encode the
          expected keyboard behavior for each widget type, so you can generate timelines without writing custom
          interaction sequences for every component.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Modal Dialog</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Opens a trigger, verifies focus moves into the dialog, tabs through dialog content, presses Escape
              to close, and verifies focus returns to the original trigger.
            </p>
          </div>
          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Combobox</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Focuses the input, types to filter options, navigates with arrow keys, selects with Enter, and
              verifies the selection is announced to assistive technology.
            </p>
          </div>
          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Tabs</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Focuses the tab list, navigates between tabs with arrow keys, activates with Enter or Space, and
              verifies panel content changes are communicated.
            </p>
          </div>
          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Accordion</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Focuses the first header, toggles with Enter or Space, navigates between accordion headers, and
              verifies expanded/collapsed state announcements.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Heuristic Warnings */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Heuristic Warnings</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Even without a comparison baseline, the Runtime Accessibility Engine automatically detects common
          accessibility anti-patterns and emits warnings. These heuristics run in real-time during timeline
          capture, flagging issues as they occur.
        </p>
        <div className="space-y-3">
          <div className="flex gap-3 p-4 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-red-500 mt-0.5 shrink-0" aria-hidden="true">error</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Focus not moved to dialog</p>
              <p className="text-sm text-slate-600 mt-1">
                A modal dialog opened but focus was not moved to an element inside it within 100ms. Keyboard
                users will be stranded outside the dialog with no indication it appeared.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-red-500 mt-0.5 shrink-0" aria-hidden="true">error</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Focus escaped modal dialog</p>
              <p className="text-sm text-slate-600 mt-1">
                Focus moved to an element outside a modal dialog while the dialog is still open. This indicates
                a broken focus trap, allowing keyboard users to interact with content behind the modal.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-amber-500 mt-0.5 shrink-0" aria-hidden="true">warning</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Rapid announcements detected</p>
              <p className="text-sm text-slate-600 mt-1">
                More than 3 announcements from aria-live regions within 500ms. Assistive technology users may
                miss content when announcements overlap or queue up too quickly.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-amber-500 mt-0.5 shrink-0" aria-hidden="true">warning</span>
            <div>
              <p className="text-sm font-bold text-slate-900">No keyboard response</p>
              <p className="text-sm text-slate-600 mt-1">
                A keyboard action was performed but no observable accessibility event occurred within 200ms. The
                component may not be responding to keyboard input, leaving keyboard-only users unable to interact.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-amber-500 mt-0.5 shrink-0" aria-hidden="true">warning</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Focused element removed</p>
              <p className="text-sm text-slate-600 mt-1">
                An element with focus was removed from the DOM without explicitly moving focus to another element.
                The browser will reset focus to the document body, losing the user's position in the page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Interactive Demo */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Interactive Demo</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Compare working implementations against broken versions to see how accessibility regressions
          appear in the timeline. Toggle between variants to observe the difference in events and warnings.
        </p>
        <RuntimeDemo />
      </section>

      {/* Section: Usage Examples */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Usage Examples</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          The runtime engine can be used programmatically, via the CLI, or through Storybook integration.
          Below are practical examples for each approach.
        </p>

        <h3 className="text-xl font-bold text-slate-900 mb-4">Programmatic API</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Import the runtime module to create timeline generators, execute interaction patterns, and inspect
          the resulting accessibility events directly in your code.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-950 p-5 mb-8 overflow-x-auto">
          <pre className="text-sm text-slate-100 leading-relaxed">
            <code>{`import { runtime } from '@reticular/speakable';

// Create a timeline generator for your component
const generator = runtime.createTimelineGenerator({
  document: myDocument,
  componentName: 'ConfirmDialog',
});

// Use a built-in interaction pattern
const sequence = runtime.getBuiltinPattern('modal-dialog', {
  trigger: 'button.open-dialog',
});

// Capture the accessibility timeline
const timeline = await generator.capture(sequence);

// Inspect events
for (const event of timeline.events) {
  console.log(\`\${event.type}: \${event.target.accessibleName}\`);
}

// Check for warnings
if (timeline.warnings.length > 0) {
  console.warn('Accessibility issues detected:');
  timeline.warnings.forEach(w => console.warn(\` - \${w.payload.message}\`));
}`}</code>
          </pre>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-4">CLI Usage</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Run runtime analysis from the command line against any URL or a local Storybook instance.
          The CLI supports built-in interaction patterns, snapshot baselines, and CI mode for regression detection.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-950 p-5 mb-8 overflow-x-auto">
          <pre className="text-sm text-slate-100 leading-relaxed">
            <code>{`# Analyze a URL with default keyboard exploration
speakable runtime https://localhost:3000/settings

# Use a built-in interaction pattern
speakable runtime https://localhost:3000 --interaction modal-dialog

# Analyze Storybook components
speakable runtime http://localhost:6006 --storybook --story "Dialog*"

# Save baselines for regression detection
speakable runtime http://localhost:6006 --storybook --runtime-snapshot ./baselines

# CI mode: fail on regressions
speakable runtime http://localhost:6006 --storybook --runtime-snapshot ./baselines --runtime-ci

# Authenticate with a protected Storybook instance
speakable runtime https://storybook.internal.company.com --storybook \\
  --storybook-auth-header "Bearer eyJhbGciOi..."

# Skip TLS verification for self-signed certificates
speakable runtime https://storybook.local --storybook --storybook-insecure`}</code>
          </pre>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-4">Storybook Integration</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable connects to a running Storybook instance, discovers stories matching your filter, and
          runs the runtime engine against each one. The pipeline produces an accessibility timeline per story
          that can be baselined and compared across builds.
        </p>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 mb-6">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-blue-600 mt-0.5 shrink-0" aria-hidden="true">info</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">How the Storybook pipeline works</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                When you pass <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 text-xs">--storybook</code>, Speakable
                queries the Storybook index API, resolves matching stories, loads each in an isolated browser context,
                and executes the appropriate interaction pattern based on the component type. Each story produces a
                self-contained timeline. Use <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 text-xs">--runtime-snapshot</code> to
                persist these timelines as baselines, then compare on subsequent runs to catch regressions automatically.
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-4">Protected and Internal Storybook Instances</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Since Speakable runs locally (on your machine or CI runner), it works naturally with VPN-protected
          Storybook instances. As long as the machine running Speakable can reach the Storybook URL, no
          special configuration is needed. For Storybook instances behind authentication, use the auth flags:
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-950 p-5 mb-4 overflow-x-auto">
          <pre className="text-sm text-slate-100 leading-relaxed">
            <code>{`# Bearer token authentication
speakable runtime https://storybook.internal.company.com --storybook \\
  --storybook-auth-header "Bearer your-token-here"

# Custom headers (cookies, API keys)
speakable runtime https://storybook.internal.company.com --storybook \\
  --storybook-header "Cookie: session=abc123"

# Self-signed TLS certificates
speakable runtime https://storybook.local:6006 --storybook --storybook-insecure`}</code>
          </pre>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p><strong className="text-slate-900">VPN access:</strong> No configuration needed. The CLI fetches from your machine, which is already on the VPN.</p>
          <p><strong className="text-slate-900">Cloud CI runners:</strong> Use self-hosted runners with VPN access, or run <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">npx storybook build</code> in CI and analyze the static output.</p>
          <p><strong className="text-slate-900">Environment variables:</strong> Set <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">SPEAKABLE_STORYBOOK_AUTH</code> to avoid passing tokens on the command line.</p>
        </div>
      </section>

      <RelatedPages
        pages={[
          {
            href: "/docs/testing-strategy",
            title: "Testing Strategy",
            description: "Build a comprehensive accessibility testing program that catches issues early and measures progress over time.",
          },
          {
            href: "/docs/component-patterns",
            title: "Component Patterns",
            description: "Accessible patterns for common UI components including dialogs, comboboxes, tabs, and more.",
          },
          {
            href: "/docs/focus-management",
            title: "Focus Management",
            description: "Control keyboard focus during dynamic interactions to keep assistive technology users oriented.",
          },
          {
            href: "/docs/testing-checklist",
            title: "Testing Checklist",
            description: "A practical checklist for verifying accessibility across components, pages, and user flows.",
          },
        ]}
      />
    </>
  );
}
