import Link from "next/link";
import { RelatedPages } from "../../../components/RelatedPages";
import { SeeAlso } from "../../../components/SeeAlso";

export default function ComponentPatternsPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Component Patterns</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Accessible Component Patterns</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Common interactive UI patterns require careful implementation to be accessible. This guide covers the correct
          HTML structure, keyboard interaction, and expected screen reader output for each pattern, along with how to
          verify your implementation using Speakable. These patterns complement manual testing with real assistive
          technology. Automated prediction catches structural issues early, while manual testing validates nuanced
          interactions that no tool can fully replicate. Use these patterns as a reference when building components, and
          run the provided Speakable commands to confirm your markup produces the expected announcements across NVDA,
          JAWS, VoiceOver, and Narrator.
        </p>
      </header>

      {/* ============================================================
          1. Modal / Dialog
          ============================================================ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Modal / Dialog</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Modals interrupt the user&apos;s workflow by overlaying content that demands immediate attention. A correctly
          implemented modal traps focus inside its boundary, announces its purpose to screen readers, and returns
          focus to the triggering element on close. The native <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;dialog&gt;</code> element
          provides many of these behaviors for free, but custom implementations using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;dialog&quot;</code> need
          explicit management of focus trapping, backdrop interaction, and ARIA attributes. Getting this wrong means
          keyboard users can tab behind the modal into invisible content, and screen reader users hear nothing about
          the modal context they are inside.
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Correct HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<!-- Native dialog element (recommended) -->
<dialog id="confirm-dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm deletion</h2>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>
  <div class="dialog-actions">
    <button autofocus>Cancel</button>
    <button class="danger">Delete</button>
  </div>
</dialog>

<!-- Custom implementation with role="dialog" -->
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="custom-dialog-title"
  class="modal-overlay"
>
  <div class="modal-content">
    <h2 id="custom-dialog-title">Confirm deletion</h2>
    <p>Are you sure you want to delete this item?</p>
    <button autofocus>Cancel</button>
    <button>Delete</button>
  </div>
</div>`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Keyboard Interaction</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Escape</kbd> closes the dialog and returns focus to the trigger element</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Tab</kbd> cycles through focusable elements inside the dialog only (focus trap)</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Shift+Tab</kbd> cycles backwards through focusable elements inside the dialog</li>
          <li>Focus moves to the first focusable element (or <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">autofocus</code> element) when the dialog opens</li>
          <li>When the dialog closes, focus returns to the element that triggered the dialog</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 mb-6">
          <div className="p-6">
            <div className="space-y-3 text-sm font-mono">
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">NVDA:</span>
                <span className="text-slate-600">&quot;Confirm deletion, dialog&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">JAWS:</span>
                <span className="text-slate-600">&quot;Confirm deletion dialog&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">VoiceOver:</span>
                <span className="text-slate-600">&quot;Confirm deletion, web dialog&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">Narrator:</span>
                <span className="text-slate-600">&quot;Confirm deletion, dialog&quot;</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Common Mistakes</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li>No focus trap: keyboard users can Tab behind the modal into background content</li>
          <li>Missing <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-labelledby</code> or <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-label</code>: screen readers announce a generic &quot;dialog&quot; with no context</li>
          <li>Not restoring focus on close: keyboard users lose their place in the page</li>
          <li>Missing <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-modal=&quot;true&quot;</code>: screen readers can still navigate to background content in virtual mode</li>
          <li>Not trapping the Tab key: focus escapes into content behind an overlay the user cannot see</li>
          <li>Using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">display: none</code> on the backdrop without hiding background content from the accessibility tree</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Test with Speakable</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`speakable modal.html -f text -s all --selector "[role='dialog'], dialog"`}
            </pre>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Learn more about the dialog role on the{" "}
          <Link href="/docs/aria-roles" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
            ARIA Roles reference
          </Link>.
        </p>
      </section>

      {/* ============================================================
          2. Dropdown Menu
          ============================================================ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Dropdown Menu</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Dropdown menus present a list of actions that appear when a user activates a trigger button. The WAI-ARIA
          menu pattern uses a button with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-expanded</code> to
          communicate the open/closed state, paired with a container using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;menu&quot;</code> that
          holds items marked with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;menuitem&quot;</code>. Arrow key
          navigation within the menu mirrors the behavior users expect from native application menus, and Escape
          closes the menu and returns focus to the trigger. Without these semantics, screen reader users will not
          understand that a group of actions is contextually related or how to navigate them efficiently.
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Correct HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<div class="dropdown">
  <button
    aria-expanded="false"
    aria-haspopup="menu"
    aria-controls="actions-menu"
  >
    Actions
  </button>

  <ul id="actions-menu" role="menu" hidden>
    <li role="menuitem" tabindex="-1">Edit</li>
    <li role="menuitem" tabindex="-1">Duplicate</li>
    <li role="menuitem" tabindex="-1">Archive</li>
    <li role="separator"></li>
    <li role="menuitem" tabindex="-1">Delete</li>
  </ul>
</div>`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Keyboard Interaction</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Enter</kbd> or <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Space</kbd> on the trigger button opens the menu and moves focus to the first item</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">↓</kbd> moves focus to the next menu item</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">↑</kbd> moves focus to the previous menu item</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Escape</kbd> closes the menu and returns focus to the trigger button</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Home</kbd> moves focus to the first menu item</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">End</kbd> moves focus to the last menu item</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Enter</kbd> on a menu item activates it and closes the menu</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 mb-6">
          <div className="p-6">
            <div className="space-y-3 text-sm font-mono">
              <p className="text-xs text-slate-500 mb-2 font-sans">When collapsed:</p>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">NVDA:</span>
                <span className="text-slate-600">&quot;Actions, button, collapsed, has popup, menu&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">JAWS:</span>
                <span className="text-slate-600">&quot;Actions button menu collapsed&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">VoiceOver:</span>
                <span className="text-slate-600">&quot;Actions, collapsed, pop up button&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">Narrator:</span>
                <span className="text-slate-600">&quot;Actions, button, collapsed, has pop up&quot;</span>
              </div>
              <p className="text-xs text-slate-500 mt-4 mb-2 font-sans">When expanded and focused on an item:</p>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">NVDA:</span>
                <span className="text-slate-600">&quot;Edit, menu item, 1 of 4&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">JAWS:</span>
                <span className="text-slate-600">&quot;Edit&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">VoiceOver:</span>
                <span className="text-slate-600">&quot;Edit, menu item, 1 of 4&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">Narrator:</span>
                <span className="text-slate-600">&quot;Edit, menu item, 1 of 4&quot;</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Common Mistakes</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li>Using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">&lt;a&gt;</code> links instead of <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">role=&quot;menuitem&quot;</code>: screen readers expect menu semantics for arrow key navigation</li>
          <li>Missing <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-expanded</code> on the trigger: users cannot tell if the menu is open or closed</li>
          <li>No <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-haspopup</code> attribute: screen readers do not announce the button opens a menu</li>
          <li>Using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">role=&quot;menu&quot;</code> for navigation: this role is for action menus, not site navigation</li>
          <li>Not managing focus with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">tabindex=&quot;-1&quot;</code> on items: focus management via arrow keys requires roving tabindex</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Test with Speakable</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`speakable dropdown.html -f text -s all --selector "[role='menu'], [aria-expanded]"`}
            </pre>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          See the menu and menuitem role specifications on the{" "}
          <Link href="/docs/aria-roles" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
            ARIA Roles reference
          </Link>.
        </p>
      </section>

      {/* SeeAlso mid-content */}
      <SeeAlso
        href="/docs/aria-roles"
        title="ARIA Roles Reference"
        description="Complete reference for all ARIA roles including dialog, menu, tab, and tooltip, with screen reader output examples for each."
      />

      {/* ============================================================
          3. Tabs
          ============================================================ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tabs</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Tabs organize content into panels where only one panel is visible at a time. The ARIA tabs pattern uses a
          container with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;tablist&quot;</code> holding
          elements with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;tab&quot;</code>, each controlling a corresponding
          panel with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;tabpanel&quot;</code>. The selected
          tab is indicated with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-selected=&quot;true&quot;</code>,
          and each tab uses <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-controls</code> to reference
          its panel. Arrow keys navigate between tabs, while the Tab key moves focus from the active tab into the
          panel content. This separation of navigation (arrows for tabs) and content access (Tab key for panel) is
          fundamental to usability.
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Correct HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<div class="tabs">
  <div role="tablist" aria-label="Account settings">
    <button
      role="tab"
      aria-selected="true"
      aria-controls="panel-general"
      id="tab-general"
      tabindex="0"
    >
      General
    </button>
    <button
      role="tab"
      aria-selected="false"
      aria-controls="panel-settings"
      id="tab-settings"
      tabindex="-1"
    >
      Settings
    </button>
    <button
      role="tab"
      aria-selected="false"
      aria-controls="panel-billing"
      id="tab-billing"
      tabindex="-1"
    >
      Billing
    </button>
    <button
      role="tab"
      aria-selected="false"
      aria-controls="panel-notifications"
      id="tab-notifications"
      tabindex="-1"
    >
      Notifications
    </button>
  </div>

  <div
    role="tabpanel"
    id="panel-general"
    aria-labelledby="tab-general"
    tabindex="0"
  >
    <p>General account settings content goes here.</p>
  </div>

  <!-- Other panels hidden when not selected -->
  <div
    role="tabpanel"
    id="panel-settings"
    aria-labelledby="tab-settings"
    tabindex="0"
    hidden
  >
    <p>Settings content goes here.</p>
  </div>
</div>`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Keyboard Interaction</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">→</kbd> moves focus to the next tab (wraps from last to first)</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">←</kbd> moves focus to the previous tab (wraps from first to last)</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Tab</kbd> moves focus from the active tab into the associated panel content</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Home</kbd> moves focus to the first tab</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">End</kbd> moves focus to the last tab</li>
          <li>Activation can be automatic (on focus) or manual (on Enter/Space) depending on complexity</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 mb-6">
          <div className="p-6">
            <div className="space-y-3 text-sm font-mono">
              <p className="text-xs text-slate-500 mb-2 font-sans">When the &quot;Settings&quot; tab receives focus:</p>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">NVDA:</span>
                <span className="text-slate-600">&quot;Settings, tab, selected, 2 of 4&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">JAWS:</span>
                <span className="text-slate-600">&quot;Settings tab 2 of 4&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">VoiceOver:</span>
                <span className="text-slate-600">&quot;Settings, selected, tab, 2 of 4&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">Narrator:</span>
                <span className="text-slate-600">&quot;Settings, tab, selected, 2 of 4&quot;</span>
              </div>
              <p className="text-xs text-slate-500 mt-4 mb-2 font-sans">When focus moves to the tab panel:</p>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">NVDA:</span>
                <span className="text-slate-600">&quot;Settings tab panel&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">VoiceOver:</span>
                <span className="text-slate-600">&quot;Settings, tab panel&quot;</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Common Mistakes</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li>All tab panels remain visible to screen readers: only the active panel should be in the accessibility tree</li>
          <li>No arrow key support: users expect to navigate tabs with arrow keys, not the Tab key</li>
          <li>Missing <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-selected</code>: screen readers cannot indicate which tab is active</li>
          <li>Using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">tabindex=&quot;0&quot;</code> on all tabs instead of roving tabindex: creates confusing Tab key behavior</li>
          <li>Missing <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-controls</code> relationship: screen readers cannot associate tabs with their panels</li>
          <li>No <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">tabindex=&quot;0&quot;</code> on panels: keyboard users cannot Tab into the panel content</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Test with Speakable</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`speakable tabs.html -f text -s all --selector "[role='tablist'], [role='tabpanel']"`}
            </pre>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          See the tab, tablist, and tabpanel role specifications on the{" "}
          <Link href="/docs/aria-roles" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
            ARIA Roles reference
          </Link>.
        </p>
      </section>

      {/* ============================================================
          4. Accordion
          ============================================================ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Accordion</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Accordions vertically stack sections of content with toggleable visibility. Each section has a header that
          serves as a trigger button, expanding or collapsing the associated content region. The trigger button uses{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-expanded</code> to communicate its state, and the
          controlled content can use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;region&quot;</code> with
          an <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-labelledby</code> referencing the header for context.
          This pattern is common in FAQ sections, settings pages, and anywhere progressive disclosure improves scannability.
          The key requirement is that the trigger must be a proper button element so keyboard and screen reader users
          can activate it reliably.
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Correct HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<div class="accordion">
  <h3>
    <button
      aria-expanded="true"
      aria-controls="section1-content"
      id="section1-header"
    >
      What is your return policy?
    </button>
  </h3>
  <div
    id="section1-content"
    role="region"
    aria-labelledby="section1-header"
  >
    <p>You can return any item within 30 days of purchase
    for a full refund.</p>
  </div>

  <h3>
    <button
      aria-expanded="false"
      aria-controls="section2-content"
      id="section2-header"
    >
      How long does shipping take?
    </button>
  </h3>
  <div
    id="section2-content"
    role="region"
    aria-labelledby="section2-header"
    hidden
  >
    <p>Standard shipping takes 5-7 business days.</p>
  </div>

  <h3>
    <button
      aria-expanded="false"
      aria-controls="section3-content"
      id="section3-header"
    >
      Do you offer international shipping?
    </button>
  </h3>
  <div
    id="section3-content"
    role="region"
    aria-labelledby="section3-header"
    hidden
  >
    <p>Yes, we ship to over 50 countries worldwide.</p>
  </div>
</div>`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Keyboard Interaction</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Enter</kbd> or <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Space</kbd> on a header button toggles the section open or closed</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">↓</kbd> moves focus to the next accordion header (optional enhancement)</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">↑</kbd> moves focus to the previous accordion header (optional enhancement)</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Home</kbd> moves focus to the first accordion header (optional enhancement)</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">End</kbd> moves focus to the last accordion header (optional enhancement)</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 mb-6">
          <div className="p-6">
            <div className="space-y-3 text-sm font-mono">
              <p className="text-xs text-slate-500 mb-2 font-sans">When focused on an expanded header:</p>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">NVDA:</span>
                <span className="text-slate-600">&quot;What is your return policy?, button, expanded&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">JAWS:</span>
                <span className="text-slate-600">&quot;What is your return policy? button expanded&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">VoiceOver:</span>
                <span className="text-slate-600">&quot;What is your return policy?, expanded, button&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">Narrator:</span>
                <span className="text-slate-600">&quot;What is your return policy?, button, expanded&quot;</span>
              </div>
              <p className="text-xs text-slate-500 mt-4 mb-2 font-sans">When focused on a collapsed header:</p>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">NVDA:</span>
                <span className="text-slate-600">&quot;How long does shipping take?, button, collapsed&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">JAWS:</span>
                <span className="text-slate-600">&quot;How long does shipping take? button collapsed&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">VoiceOver:</span>
                <span className="text-slate-600">&quot;How long does shipping take?, collapsed, button&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">Narrator:</span>
                <span className="text-slate-600">&quot;How long does shipping take?, button, collapsed&quot;</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Common Mistakes</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li>Using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">&lt;div&gt;</code> or <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">&lt;span&gt;</code> instead of <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">&lt;button&gt;</code> for the toggle: non-button elements are not keyboard accessible by default</li>
          <li>Missing <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-expanded</code>: screen readers cannot communicate whether a section is open or closed</li>
          <li>Hiding content with CSS (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">opacity: 0</code> or <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">height: 0</code>) instead of the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">hidden</code> attribute: content remains in the accessibility tree</li>
          <li>No heading element wrapping the button: accordion headers lose their structural role in the page outline</li>
          <li>Toggling <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-expanded</code> on the panel instead of the button: the expanded state belongs on the element the user interacts with</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Test with Speakable</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`speakable accordion.html -f text -s nvda --selector "button[aria-expanded]"`}
            </pre>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Learn more about the region role and aria-expanded property on the{" "}
          <Link href="/docs/aria-roles" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
            ARIA Roles reference
          </Link>.
        </p>
      </section>

      {/* ============================================================
          5. Tooltip
          ============================================================ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tooltip</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Tooltips provide supplementary descriptions for interface elements, appearing when a user hovers over or
          focuses on a trigger element. The accessible pattern uses <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-describedby</code> on
          the trigger element pointing to the tooltip content, which carries <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;tooltip&quot;</code>.
          This relationship ensures screen readers announce the tooltip text as a description when the trigger receives
          focus, without requiring the user to visually discover a hover-only popup. The tooltip must appear on keyboard
          focus (not just mouse hover) and be dismissable with Escape to meet accessibility requirements. Note that
          tooltips should carry non-essential supplementary information: critical labels belong directly on the element.
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Correct HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<div class="tooltip-container">
  <button aria-describedby="save-tooltip">
    Save
  </button>
  <div
    id="save-tooltip"
    role="tooltip"
    class="tooltip"
  >
    Save your changes to the server (Ctrl+S)
  </div>
</div>

<!-- Icon button example with both label and description -->
<div class="tooltip-container">
  <button
    aria-label="Settings"
    aria-describedby="settings-tooltip"
  >
    <svg aria-hidden="true"><!-- gear icon --></svg>
  </button>
  <div
    id="settings-tooltip"
    role="tooltip"
    class="tooltip"
  >
    Open application settings and preferences
  </div>
</div>`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Keyboard Interaction</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li>Tooltip appears when the trigger element receives keyboard focus</li>
          <li>Tooltip appears when the pointer hovers over the trigger element</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Escape</kbd> dismisses the tooltip without moving focus</li>
          <li>Tooltip disappears when the trigger loses focus or the pointer leaves the trigger</li>
          <li>Tooltip remains visible while the pointer is over the tooltip itself (allows reading long text)</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 mb-6">
          <div className="p-6">
            <div className="space-y-3 text-sm font-mono">
              <p className="text-xs text-slate-500 mb-2 font-sans">When the &quot;Save&quot; button receives focus:</p>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">NVDA:</span>
                <span className="text-slate-600">&quot;Save, button, Save your changes to the server (Ctrl+S)&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">JAWS:</span>
                <span className="text-slate-600">&quot;Save button, Save your changes to the server Ctrl+S&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">VoiceOver:</span>
                <span className="text-slate-600">&quot;Save, button, Save your changes to the server (Ctrl+S)&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">Narrator:</span>
                <span className="text-slate-600">&quot;Save, button, Save your changes to the server Ctrl+S&quot;</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Common Mistakes</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li>Only showing the tooltip on hover: keyboard-only users never see or hear the information</li>
          <li>Using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-label</code> instead of <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-describedby</code>: aria-label replaces the accessible name instead of supplementing it</li>
          <li>Not using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">role=&quot;tooltip&quot;</code>: screen readers may not associate the text as a description</li>
          <li>Tooltip cannot be dismissed with Escape: violates WCAG 1.4.13 Content on Hover or Focus</li>
          <li>Placing essential information only in a tooltip: users who cannot trigger hover (touch devices) miss the content entirely</li>
          <li>Tooltip disappears too quickly: users with motor impairments cannot keep the pointer steady on the trigger</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Test with Speakable</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`speakable tooltip.html -f text -s all --selector "[aria-describedby]"`}
            </pre>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          See the tooltip role details on the{" "}
          <Link href="/docs/aria-roles" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
            ARIA Roles reference
          </Link>.
        </p>
      </section>

      {/* ============================================================
          6. Combobox / Autocomplete
          ============================================================ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Combobox / Autocomplete</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          A combobox combines a text input with a popup list of options, allowing users to either type a value or
          select from suggestions. The input carries <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;combobox&quot;</code> along
          with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-expanded</code> to indicate whether the
          suggestion list is visible, and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-controls</code> pointing
          to a listbox. The listbox contains options with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;option&quot;</code>,
          and the currently highlighted option is referenced by <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-activedescendant</code> on
          the input. This pattern is one of the most complex in ARIA and requires careful state management to keep
          the screen reader synchronized as the user types, filters options, and makes selections.
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Correct HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<label for="country-input" id="country-label">Country</label>
<div class="combobox-container">
  <input
    id="country-input"
    type="text"
    role="combobox"
    aria-expanded="true"
    aria-controls="country-listbox"
    aria-autocomplete="list"
    aria-activedescendant="option-2"
    aria-labelledby="country-label"
  />
  <ul
    id="country-listbox"
    role="listbox"
    aria-label="Countries"
  >
    <li id="option-1" role="option" aria-selected="false">
      Canada
    </li>
    <li id="option-2" role="option" aria-selected="true">
      Germany
    </li>
    <li id="option-3" role="option" aria-selected="false">
      Ghana
    </li>
  </ul>
</div>

<!-- Closed state -->
<input
  type="text"
  role="combobox"
  aria-expanded="false"
  aria-controls="country-listbox"
  aria-autocomplete="list"
  aria-labelledby="country-label"
/>`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Keyboard Interaction</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li>Typing characters filters the listbox options and opens the popup if closed</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">↓</kbd> moves the highlight to the next option in the listbox (opens popup if closed)</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">↑</kbd> moves the highlight to the previous option in the listbox</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Enter</kbd> selects the highlighted option, closes the popup, and places the value in the input</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Escape</kbd> closes the popup without selecting, clearing the highlight</li>
          <li><kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Home</kbd> / <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">End</kbd> move the text cursor within the input (standard text editing)</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Screen Reader Output</h3>
        <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 mb-6">
          <div className="p-6">
            <div className="space-y-3 text-sm font-mono">
              <p className="text-xs text-slate-500 mb-2 font-sans">When the combobox input receives focus (popup closed):</p>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">NVDA:</span>
                <span className="text-slate-600">&quot;Country, combo box, collapsed, has autocomplete, edit&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">JAWS:</span>
                <span className="text-slate-600">&quot;Country combo box edit collapsed type in text&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">VoiceOver:</span>
                <span className="text-slate-600">&quot;Country, combo box, collapsed&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">Narrator:</span>
                <span className="text-slate-600">&quot;Country, combo box, collapsed, editing&quot;</span>
              </div>
              <p className="text-xs text-slate-500 mt-4 mb-2 font-sans">When expanded with an option highlighted:</p>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">NVDA:</span>
                <span className="text-slate-600">&quot;Germany, 2 of 3&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">JAWS:</span>
                <span className="text-slate-600">&quot;Germany 2 of 3&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">VoiceOver:</span>
                <span className="text-slate-600">&quot;Germany, 2 of 3&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 w-24 shrink-0">Narrator:</span>
                <span className="text-slate-600">&quot;Germany, 2 of 3, selected&quot;</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Common Mistakes</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
          <li>Not announcing filtered result count: screen reader users have no idea how many options remain after typing</li>
          <li>Missing <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">role=&quot;combobox&quot;</code> on the input: screen readers treat it as a plain text field</li>
          <li>Not updating <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-activedescendant</code> as the highlight moves: screen readers do not announce the current option</li>
          <li>Using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-expanded</code> without a value: must toggle between &quot;true&quot; and &quot;false&quot; explicitly</li>
          <li>Missing <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-autocomplete</code>: screen readers cannot communicate that typing filters the list</li>
          <li>Moving DOM focus into the listbox instead of using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">aria-activedescendant</code>: this removes the cursor from the input and disrupts typing</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Test with Speakable</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`speakable combobox.html -f text -s all --selector "[role='combobox']"`}
            </pre>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          See the combobox and listbox role specifications on the{" "}
          <Link href="/docs/aria-roles" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
            ARIA Roles reference
          </Link>.
        </p>
      </section>

      {/* ============================================================
          Summary / Verification Workflow
          ============================================================ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Verification Workflow</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Each pattern above includes a Speakable CLI command for quick verification. Here is a recommended workflow
          for integrating pattern checks into your development process:
        </p>
        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-3 mb-6">
          <li>
            <strong>Build the component</strong>: implement the HTML structure following the patterns above, including
            all required ARIA attributes and keyboard handlers.
          </li>
          <li>
            <strong>Run Speakable</strong>: use the provided CLI command to verify the screen reader output matches the
            expected announcements for all four readers.
          </li>
          <li>
            <strong>Check keyboard flow</strong>: manually test the keyboard interaction list. Ensure focus moves as
            documented and all required key bindings function correctly.
          </li>
          <li>
            <strong>Fix discrepancies</strong>: if the Speakable output does not match expectations, review the common
            mistakes section for the relevant pattern to identify likely issues.
          </li>
          <li>
            <strong>Add to CI</strong>: integrate Speakable checks into your CI/CD pipeline to catch accessibility
            regressions automatically. See the{" "}
            <Link href="/docs/cicd-integration" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
              CI/CD Integration guide
            </Link>{" "}
            for details.
          </li>
          <li>
            <strong>Manual test</strong>: automated tools cannot catch every nuance. Test with a real screen reader
            (NVDA on Windows is free) to validate the experience end-to-end, especially for complex interactions
            like focus restoration and live region updates.
          </li>
        </ol>
        <p className="text-slate-600 leading-relaxed">
          Remember that Speakable predicts screen reader output based on ARIA semantics and HTML structure. It catches
          the vast majority of structural issues (missing roles, broken label relationships, incorrect expanded states)
          but cannot validate timing-dependent behaviors like animation sequences or live region update order. Pair
          automated prediction with periodic manual testing for comprehensive coverage.
        </p>
      </section>

      {/* Related Pages */}
      <RelatedPages
        pages={[
          {
            href: "/docs/aria-roles",
            title: "ARIA Roles",
            description: "Complete reference for all ARIA roles with screen reader output examples and usage guidelines.",
          },
          {
            href: "/docs/common-mistakes",
            title: "Common Mistakes",
            description: "Frequently seen accessibility errors and how to fix them with Speakable verification.",
          },
          {
            href: "/docs/keyboard-navigation",
            title: "Keyboard Navigation",
            description: "Patterns and best practices for building fully keyboard-accessible interfaces.",
          },
          {
            href: "/docs/focus-management",
            title: "Focus Management",
            description: "Strategies for managing focus in dynamic interfaces including modals, routers, and live updates.",
          },
        ]}
      />
    </>
  );
}
