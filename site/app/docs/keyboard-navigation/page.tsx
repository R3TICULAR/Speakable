import Link from "next/link";
import { RelatedPages } from "../../../components/RelatedPages";
import { SeeAlso } from "../../../components/SeeAlso";

export default function KeyboardNavigationPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Keyboard Navigation</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Keyboard Navigation Patterns</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Comprehensive guide to building keyboard-accessible interfaces. Every interactive element must be
          operable without a mouse. Keyboard accessibility is not optional: it&apos;s the foundation that
          supports screen reader users, power users, people with motor disabilities, and anyone who simply
          prefers a keyboard. This guide covers tab order, arrow key patterns, common shortcuts, screen reader
          navigation, focus indicators, skip links, and testing strategies with Speakable.
        </p>
      </header>

      {/* Tab Order */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tab Order</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When a user presses <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Tab</kbd>,
          focus moves to the next interactive element in <strong>DOM order</strong>. This is the default behavior
          and it works well when your HTML structure matches the visual layout. Links, buttons, inputs, selects, and
          textareas are all natively focusable. They appear in the tab sequence without any extra work.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Problems arise when developers try to override this natural order. The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex</code> attribute
          accepts any integer, but positive values (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex=&quot;1&quot;</code>,{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex=&quot;2&quot;</code>, etc.) break the natural flow.
          Elements with positive tabindex values receive focus <em>before</em> everything else on the page, regardless
          of their position in the DOM. This creates an unpredictable, disorienting experience, especially on pages
          where multiple developers have added conflicting tabindex values over time.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <p className="text-sm text-amber-800 font-semibold mb-2">Rule of thumb</p>
          <p className="text-sm text-amber-700">
            Only use <code className="rounded bg-amber-100 px-1 py-0.5 text-xs font-mono">tabindex=&quot;0&quot;</code> (adds a non-interactive
            element to the tab order) and <code className="rounded bg-amber-100 px-1 py-0.5 text-xs font-mono">tabindex=&quot;-1&quot;</code> (allows
            programmatic focus via JavaScript, but removes the element from the tab sequence). Never use positive
            tabindex values in production.
          </p>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          A common source of confusion is CSS visual reordering. Properties like <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">flex-direction: row-reverse</code>,{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">order</code>, and CSS Grid placement can make elements
          <em> appear</em> in a different sequence than their DOM position. But tab order follows the DOM, not the
          visual layout. The result: it looks different, but tabs the same.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">CSS reorder vs. tab order</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<!-- Visual order: Third, First, Second (due to CSS order property) -->
<!-- Tab order: First, Second, Third (follows DOM) -->

<div style="display: flex;">
  <button style="order: 2;">First</button>
  <button style="order: 3;">Second</button>
  <button style="order: 1;">Third</button>
</div>

<!-- Users see "Third, First, Second" visually -->
<!-- But pressing Tab goes: First → Second → Third -->
<!-- This disconnect confuses keyboard users -->`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The fix is simple: make DOM order match visual order. If you need a different visual arrangement,
          restructure the HTML rather than relying on CSS ordering properties. When DOM and visual order align,
          keyboard navigation becomes predictable and intuitive for all users.
        </p>
        <p className="text-slate-600 leading-relaxed">
          For dynamic interfaces where elements appear or disappear (modals, accordions, dropdown menus),
          manage focus explicitly using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex=&quot;-1&quot;</code> and{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">element.focus()</code>. This ensures focus moves logically
          when the interface changes. See the <Link href="/docs/focus-management" className="text-blue-600 hover:text-blue-800 underline">Focus Management</Link> guide
          for detailed patterns on trapping and restoring focus.
        </p>
      </section>

      {/* Arrow Key Patterns */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Arrow Key Patterns</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Composite widgets (components containing multiple interactive children) use arrow keys for internal
          navigation instead of <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Tab</kbd>.
          This follows the principle that <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Tab</kbd> moves
          between widgets while arrow keys move <em>within</em> a widget. This pattern is sometimes called
          &quot;roving tabindex&quot; or &quot;active descendant&quot; depending on the implementation approach.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The direction of arrow key navigation depends on the widget&apos;s orientation. Horizontal widgets like
          tab bars, toolbars, and pagination controls use <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">←</kbd> and{" "}
          <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">→</kbd> arrows.
          Vertical widgets like menus, listboxes, and tree views use <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">↑</kbd> and{" "}
          <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">↓</kbd> arrows.
          Grid-based widgets (data tables, spreadsheets, calendars) support navigation on both axes.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The ARIA Authoring Practices Guide (APG) defines the expected keyboard interaction for each widget type.
          Following these patterns ensures consistency. Screen reader users learn a pattern once and expect it
          to work the same way everywhere. Deviating from established patterns creates confusion, even if your
          custom approach seems &quot;simpler.&quot;
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Widget</th>
                <th className="py-3 px-4 font-bold text-slate-900">Arrow Keys</th>
                <th className="py-3 px-4 font-bold text-slate-900">Wrapping</th>
                <th className="py-3 px-4 font-bold text-slate-900">Additional Keys</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Tabs</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">←</kbd> <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">→</kbd></td>
                <td className="py-3 px-4">Yes (optional)</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">Home</kbd> / <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">End</kbd></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Menu</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">↑</kbd> <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">↓</kbd></td>
                <td className="py-3 px-4">Yes</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">→</kbd> opens submenu</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Listbox</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">↑</kbd> <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">↓</kbd></td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">Home</kbd> / <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">End</kbd>, type-ahead</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Toolbar</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">←</kbd> <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">→</kbd></td>
                <td className="py-3 px-4">Yes (optional)</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">Home</kbd> / <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">End</kbd></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Tree View</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">↑</kbd> <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">↓</kbd></td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">→</kbd> expand, <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">←</kbd> collapse</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Grid / Table</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">↑</kbd> <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">↓</kbd> <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">←</kbd> <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">→</kbd></td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">Ctrl+Home</kbd> / <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">Ctrl+End</kbd></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Radio Group</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">↑</kbd> <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">↓</kbd> or <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">←</kbd> <kbd className="rounded bg-slate-100 border border-slate-300 px-1 py-0.5 text-xs font-mono">→</kbd></td>
                <td className="py-3 px-4">Yes</td>
                <td className="py-3 px-4">Selection follows focus</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-slate-600 leading-relaxed">
          When implementing these patterns, choose between <strong>roving tabindex</strong> (moving{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex=&quot;0&quot;</code> between children) and{" "}
          <strong>aria-activedescendant</strong> (keeping focus on the container and updating which child is
          &quot;active&quot;). Roving tabindex is simpler and works universally. aria-activedescendant requires
          less DOM manipulation but has inconsistent screen reader support in some contexts. The ARIA APG
          documents both approaches for each pattern.
        </p>
      </section>

      {/* Common Keyboard Shortcuts */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Common Keyboard Shortcuts</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Beyond tab and arrow navigation, several keys have conventional meanings in web interfaces.
          Users expect these shortcuts to work consistently across your application and across different
          websites. Violating these conventions (like making <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Escape</kbd> do
          something other than &quot;close&quot;) breaks the mental model that keyboard users rely on.
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="shrink-0 w-32">
              <kbd className="rounded bg-white border border-slate-300 px-2 py-1 text-xs font-mono shadow-sm">Enter</kbd>{" "}
              <kbd className="rounded bg-white border border-slate-300 px-2 py-1 text-xs font-mono shadow-sm">Space</kbd>
            </div>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Activate.</strong> Buttons respond to both Enter and Space.
              Links respond to Enter only (Space scrolls the page). Custom interactive elements must handle both
              keys to match native button behavior.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="shrink-0 w-32">
              <kbd className="rounded bg-white border border-slate-300 px-2 py-1 text-xs font-mono shadow-sm">Escape</kbd>
            </div>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Dismiss / Close.</strong> Closes modals, dropdown menus,
              tooltips, and popovers. After closing, focus should return to the element that triggered the
              overlay. This &quot;return focus&quot; behavior is critical: without it, focus lands on the body
              and the user is lost.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="shrink-0 w-32">
              <kbd className="rounded bg-white border border-slate-300 px-2 py-1 text-xs font-mono shadow-sm">Home</kbd>{" "}
              <kbd className="rounded bg-white border border-slate-300 px-2 py-1 text-xs font-mono shadow-sm">End</kbd>
            </div>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Jump to boundaries.</strong> Moves focus to the first or last
              item in a composite widget. In text fields, moves the cursor to the beginning or end of the line.
              Useful for long lists, tabs with many items, and data tables.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="shrink-0 w-32">
              <kbd className="rounded bg-white border border-slate-300 px-2 py-1 text-xs font-mono shadow-sm">Page Up</kbd>{" "}
              <kbd className="rounded bg-white border border-slate-300 px-2 py-1 text-xs font-mono shadow-sm">Page Down</kbd>
            </div>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Large jumps.</strong> Scrolls by a larger increment or jumps
              by a page of items. In grids and large lists, this moves focus by a visual &quot;page&quot; (e.g.,
              5-10 items). In date pickers, typically moves by one month.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="shrink-0 w-32">
              <span className="text-xs font-mono text-slate-500">Type-ahead</span>
            </div>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Character search.</strong> In listboxes, menus, and tree views,
              typing one or more characters jumps focus to the matching item. This is how native{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">&lt;select&gt;</code> elements
              work and users expect the same behavior in custom widgets. Implement a buffer that clears after
              a short timeout (~500ms) to support multi-character matching.
            </p>
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed">
          When building custom application-level shortcuts (like <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Ctrl+K</kbd> for
          a command palette or <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">/</kbd> to focus search),
          be careful not to conflict with browser or screen reader shortcuts. Always provide a way to discover
          available shortcuts (a help modal on <kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">?</kbd> is
          a common pattern) and never make shortcuts the <em>only</em> way to perform an action.
        </p>
      </section>

      {/* Screen Reader Keyboard Shortcuts */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Screen Reader Keyboard Shortcuts</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Screen readers add their own layer of keyboard interaction on top of the browser. When a screen reader
          is active, most keypresses are intercepted for navigation rather than passed to the web page. This is
          called &quot;browse mode&quot; or &quot;virtual cursor mode.&quot; Understanding these shortcuts helps
          you appreciate why semantic HTML matters: it&apos;s what screen reader navigation keys target.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The following table shows the most common single-key navigation shortcuts for jumping between elements.
          These only work in browse mode (not forms mode / focus mode). When focus enters a form control, the
          screen reader switches to pass-through mode so keystrokes go to the input field.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Action</th>
                <th className="py-3 px-4 font-bold text-slate-900">NVDA</th>
                <th className="py-3 px-4 font-bold text-slate-900">JAWS</th>
                <th className="py-3 px-4 font-bold text-slate-900">VoiceOver (macOS)</th>
                <th className="py-3 px-4 font-bold text-slate-900">Narrator</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Next heading</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">H</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">H</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">VO+Cmd+H</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">H</kbd></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Next link</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">K</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Tab</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">VO+Cmd+L</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">K</kbd></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Next landmark</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">D</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">R</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">VO+Fn+Right</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">D</kbd></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Next form field</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">F</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">F</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">VO+Cmd+J</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">F</kbd></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Elements list</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">NVDA+F7</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Insert+F3</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">VO+U</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Caps+F6</kbd></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Start reading</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">NVDA+Down</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Insert+Down</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">VO+A</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Caps+Down</kbd></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Stop reading</td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Ctrl</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Ctrl</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Ctrl</kbd></td>
                <td className="py-3 px-4"><kbd className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-xs font-mono">Ctrl</kbd></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-900">Note:</strong> These are the most common shortcuts but each screen
            reader has dozens more, for tables, lists, buttons, images, and more. The key takeaway for developers
            is that <em>proper semantic HTML enables all of these navigation shortcuts automatically</em>. A{" "}
            <code className="rounded bg-white px-1 py-0.5 text-xs font-mono border border-slate-200">&lt;h2&gt;</code> is
            navigable via <kbd className="rounded bg-white border border-slate-300 px-1 py-0.5 text-xs font-mono">H</kbd>;
            a <code className="rounded bg-white px-1 py-0.5 text-xs font-mono border border-slate-200">&lt;div class=&quot;heading&quot;&gt;</code> is
            invisible to heading navigation.
          </p>
        </div>
      </section>

      {/* Focus Indicators */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Focus Indicators</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          A keyboard user&apos;s cursor is the focus indicator. Without a visible focus ring, keyboard users
          cannot tell where they are on the page. It&apos;s the equivalent of hiding the mouse cursor. WCAG
          2.4.7 requires a visible focus indicator for all interactive elements, and WCAG 2.4.11 (level AAA,
          but best practice) specifies minimum size and contrast requirements.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The most important rule: <strong>never remove outlines without providing a replacement.</strong> The
          infamous <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">outline: none</code> or{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">*:focus {`{ outline: 0 }`}</code> in
          a CSS reset removes the only visual cue keyboard users have. If the default browser outline doesn&apos;t
          match your design, replace it with a custom focus style: a box shadow, border change, background
          change, or combination.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">:focus-visible</code> instead
          of <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">:focus</code> to show indicators
          only for keyboard navigation, not mouse clicks. Browsers apply <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">:focus-visible</code> heuristically:
          it activates on Tab navigation and programmatic focus, but not on click. This gives you keyboard-only
          indicators without the visual noise that frustrates mouse users.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Focus indicators must have a minimum contrast ratio of <strong>3:1</strong> against adjacent colors.
          This means a thin light-blue outline on a white background might not be sufficient. Test your focus
          styles against both the background and surrounding content to ensure visibility.
        </p>
        <p className="text-slate-600 leading-relaxed">
          For complete coverage of focus management patterns (trapping focus in modals, restoring focus after
          dismissal, managing focus in dynamic content, and handling focus for route changes in SPAs) see
          the dedicated Focus Management guide.
        </p>
      </section>

      <SeeAlso
        href="/docs/focus-management"
        title="Focus Management: Complete Guide"
        description="Deep dive into focus trapping, restoration, dynamic content focus management, and SPA route-change patterns."
      />

      {/* Skip Navigation */}
      <section className="mb-16 mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Skip Navigation</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Skip navigation links let keyboard users bypass repetitive blocks of content (typically the site
          header and navigation) to jump directly to the main content area. Without skip links, a keyboard user
          must tab through every navigation link on every page load before reaching the content they came for.
          On sites with 20+ nav links, this is tedious and slow.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The standard pattern places a visually hidden link as the <strong>first focusable element</strong> on
          the page. It becomes visible only when focused (when the user presses Tab on page load):
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Skip link pattern</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<!-- First element in <body> -->
<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-blue-700 focus:font-bold">
  Skip to main content
</a>

<!-- ... header, nav, etc. ... -->

<main id="main" tabindex="-1">
  <!-- Page content -->
</main>`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex=&quot;-1&quot;</code> on
          the target element ensures that the skip link actually moves focus there, even though{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;main&gt;</code> is not natively
          focusable. Without it, some browsers will scroll to the anchor but leave focus at the top of the page.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          You can provide multiple skip links for complex layouts: &quot;Skip to main content,&quot; &quot;Skip
          to search,&quot; &quot;Skip to navigation.&quot; Keep the list short (three at most) to avoid
          defeating the purpose of saving keystrokes.
        </p>
        <p className="text-slate-600 leading-relaxed">
          See the <Link href="/docs/focus-management" className="text-blue-600 hover:text-blue-800 underline">Focus Management</Link> guide
          for implementation details on focus restoration and how skip links interact with SPA route changes.
        </p>
      </section>

      {/* Testing Keyboard Accessibility with Speakable */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Testing Keyboard Accessibility with Speakable</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable&apos;s CLI provides structural analysis that complements manual keyboard testing. While nothing
          replaces actually pressing Tab through your interface, Speakable can quickly inventory all interactive
          elements, verify they have accessible names, and inspect their focusable properties. This catches many
          common issues (unlabeled buttons, missing roles, elements that should be focusable but aren&apos;t) before
          you even start manual testing.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Audit interactive elements</h3>
        <p className="text-slate-600 mb-3 text-sm">
          Use audit mode to get a complete inventory of interactive elements and their accessibility properties:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`speakable page.html -f audit`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-6 text-sm">
          This shows the interactive element inventory: every button, link, input, and custom control, along
          with whether each has an accessible name, correct role, and valid keyboard interaction.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Check announcements for interactive elements</h3>
        <p className="text-slate-600 mb-3 text-sm">
          Verify that screen readers would announce meaningful information when focus lands on interactive controls:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`speakable page.html -f text -s nvda --selector "button, a, input"`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-6 text-sm">
          This filters output to only show what NVDA would announce for buttons, links, and inputs. If any
          element produces a bare &quot;button&quot; or &quot;link&quot; announcement with no name, you&apos;ve
          found an accessibility issue.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Inspect focusable properties</h3>
        <p className="text-slate-600 mb-3 text-sm">
          JSON output gives you structured data about every element&apos;s accessibility tree properties, useful
          for scripting and CI integration:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`speakable page.html -f json`}
            </pre>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-900">Important:</strong> Speakable checks structure: the accessibility
            tree, roles, names, and properties. It cannot validate the <em>actual keyboard interaction flow</em>:
            whether arrow keys work in your tab component, whether Escape closes your modal, or whether focus
            moves to the right place after a deletion. Manual testing with a keyboard (and ideally a screen reader)
            is essential for verifying the dynamic behavior. Use Speakable to catch the structural foundation
            issues, then manual-test the interaction patterns described in this guide.
          </p>
        </div>
      </section>

      {/* Related Pages */}
      <RelatedPages
        pages={[
          {
            href: "/docs/focus-management",
            title: "Focus Management",
            description: "Patterns for trapping focus in modals, restoring focus on dismissal, and managing focus in dynamic SPAs.",
          },
          {
            href: "/docs/component-patterns",
            title: "Component Patterns",
            description: "Accessible implementations of common components: tabs, modals, accordions, menus, and more.",
          },
          {
            href: "/docs/testing-checklist",
            title: "Testing Checklist",
            description: "Step-by-step checklist for validating accessibility across keyboard, screen reader, and visual testing.",
          },
          {
            href: "/docs/common-mistakes",
            title: "Common Mistakes",
            description: "The most frequent accessibility mistakes developers make and how to fix them quickly.",
          },
        ]}
      />
    </>
  );
}
