import Link from "next/link";
import { RelatedPages } from "../../../components/RelatedPages";
import { SeeAlso } from "../../../components/SeeAlso";

export default function FocusManagementPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Focus Management</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Focus Management Guide</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Focus management is one of the most critical aspects of web accessibility, particularly for keyboard
          and screen reader users who rely entirely on focus position to understand where they are in an interface.
          In traditional multi-page websites, the browser handles focus naturally. Each page load resets focus
          to the top of the document. But in single-page applications (SPAs) and dynamic interfaces where content
          updates without a full reload, developers must take explicit control of focus to maintain a coherent
          experience. Without proper focus management, keyboard users can become lost in the page, screen reader
          users may miss important content changes, and the overall usability of your application degrades
          significantly. This guide covers the essential patterns for managing focus effectively: trapping focus
          in modal dialogs, restoring focus when dialogs close, providing skip navigation links, implementing
          roving tabindex for composite widgets, styling focus indicators, handling route changes in SPAs, and
          testing your focus behavior with Speakable.
        </p>
      </header>

      {/* Section 1: Focus Traps (Modals) */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Focus Traps (Modals)</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When a modal dialog opens, focus must be constrained (or &quot;trapped&quot;) inside it. This means
          that pressing Tab and Shift+Tab should cycle through only the focusable elements within the dialog,
          never escaping to the page content behind it. Without a focus trap, a keyboard user could Tab out of
          the dialog into obscured background content, losing context entirely and having no obvious way to
          return to the dialog they were interacting with.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The fundamental requirements of a proper focus trap are straightforward: when the dialog opens, focus
          should move to the dialog element itself (with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">role=&quot;dialog&quot;</code> and
          an accessible name) or to the first focusable element inside it, such as a close button or the first
          form field. When the user presses Tab on the last focusable element, focus wraps back to the first.
          When they press Shift+Tab on the first focusable element, focus wraps to the last. The Escape key
          should close the dialog and return focus to the triggering element.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          From a screen reader perspective, proper dialog markup ensures the user hears the &quot;dialog&quot; role
          announced when focus enters the container. This tells them they are in a constrained context with a
          specific purpose. Screen readers like NVDA and JAWS will announce something like &quot;dialog,
          Confirm deletion&quot;, giving the user both the semantic context and the dialog&apos;s accessible name.
          Combined with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-modal=&quot;true&quot;</code>,
          screen readers can further restrict their virtual cursor to the dialog content, preventing browse-mode
          navigation from reaching background elements.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Here is a practical implementation of a focus trap. The logic queries all focusable elements within
          the dialog on each Tab keypress and redirects focus when it would otherwise escape the boundaries:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">FocusTrapDialog.tsx</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { useEffect, useRef, useCallback } from 'react';

interface FocusTrapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function FocusTrapDialog({ isOpen, onClose, title, children }: FocusTrapDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const getFocusableElements = useCallback(() => {
    if (!dialogRef.current) return [];
    return Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled'));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [getFocusableElements, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Move focus into the dialog on open
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      dialogRef.current?.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, getFocusableElements, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        className="relative bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
      >
        <h2 id="dialog-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Key implementation details worth noting: the dialog element has <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabIndex=&#123;-1&#125;</code> so
          it can receive programmatic focus even though it is not in the natural tab order. The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-labelledby</code> attribute
          connects the dialog to its heading, which screen readers will announce as part of the dialog context.
          The backdrop has <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-hidden=&quot;true&quot;</code> because
          it serves no semantic purpose; it&apos;s purely visual.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          An alternative approach uses the native <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;dialog&gt;</code> element
          with its <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">showModal()</code> method,
          which provides built-in focus trapping and inert behavior on background content. Browser support is
          now excellent, and it reduces the amount of custom JavaScript needed. However, you still need to
          manage focus restoration (covered in the next section) and ensure proper labeling.
        </p>

        <SeeAlso
          href="/docs/component-patterns"
          title="Component Patterns"
          description="See accessible dialog, menu, and disclosure patterns with full ARIA markup examples."
        />
      </section>

      {/* Section 2: Focus Restoration */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Focus Restoration</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Focus restoration is the complementary pattern to focus trapping. When a dialog closes, focus must
          return to the element that originally triggered it. This is essential because without restoration,
          focus typically falls to the document body, leaving keyboard users stranded at the top of the page
          with no indication of where they were before the dialog opened. Screen reader users experience this
          as suddenly losing their place in the document, which is disorienting and frustrating.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The pattern is straightforward: before opening the dialog, capture a reference to the currently
          focused element (the trigger). When the dialog closes, restore focus to that reference. In React,
          this is cleanly handled with a ref:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">useDialogFocus.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { useRef, useCallback } from 'react';

export function useDialogFocus() {
  const triggerRef = useRef<HTMLElement | null>(null);

  const openDialog = useCallback(() => {
    // Capture the element that triggered the dialog
    triggerRef.current = document.activeElement as HTMLElement;
    // ... open dialog logic
  }, []);

  const closeDialog = useCallback(() => {
    // ... close dialog logic
    // Restore focus to the trigger element
    triggerRef.current?.focus();
    triggerRef.current = null;
  }, []);

  return { openDialog, closeDialog };
}`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Focus restoration becomes more nuanced when the triggering element no longer exists after the
          dialog closes. This happens commonly in deletion flows: a user clicks &quot;Delete&quot; on an item,
          confirms in a dialog, and now the item (and its delete button) are gone from the DOM. In this
          case, focus should move to a logical alternative: the adjacent item in the list, the list
          container, or a heading that provides context. The goal is to place the user somewhere meaningful,
          not at the document body.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          A robust deletion flow might look like this:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">DeletionFocus.tsx</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`function handleDeleteConfirm(itemId: string) {
  const items = getItemList();
  const index = items.findIndex(item => item.id === itemId);

  // Remove the item
  deleteItem(itemId);

  // Determine where to move focus
  const remainingItems = items.filter(item => item.id !== itemId);

  if (remainingItems.length === 0) {
    // List is empty — focus the container or heading
    listHeadingRef.current?.focus();
  } else {
    // Focus the next item, or the previous if we deleted the last one
    const nextIndex = Math.min(index, remainingItems.length - 1);
    itemRefs.current[remainingItems[nextIndex].id]?.focus();
  }
}`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The most common mistake developers make with focus restoration is simply not implementing it at
          all. The result is that focus falls silently to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">document.body</code> after
          a dialog closes. Sighted keyboard users will notice their focus indicator disappears. Screen reader
          users will hear nothing, or worse, will be reading from the top of the page without realizing it.
          This is one of the most frequent accessibility bugs found in production applications, and one of
          the easiest to fix once you know the pattern.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Another subtle issue: if you restore focus before the dialog&apos;s closing animation completes,
          some screen readers may re-announce the dialog content. Use a small timeout or wait for the
          transition to end before calling <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">.focus()</code> on
          the trigger. Alternatively, remove the dialog from the DOM immediately and animate a wrapper
          element that doesn&apos;t interfere with the accessibility tree.
        </p>
      </section>

      {/* Section 3: Skip Links */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Skip Links</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Skip links are hidden navigation aids that allow keyboard users to bypass repetitive content,
          typically the site header and navigation menu, and jump directly to the main content area.
          They are the first focusable element on the page, and they become visible only when they receive
          keyboard focus. This pattern is so fundamental that WCAG 2.1 includes it as a Level A success
          criterion (2.4.1: Bypass Blocks). Without skip links, a keyboard user visiting your site must
          Tab through every navigation item on every single page load before reaching the content they
          actually want to read.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The implementation is minimal. The HTML is a simple anchor element placed as the very first
          child of the body (or at minimum, before the navigation). It links to an element with a
          matching ID, typically your <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;main&gt;</code> landmark
          or a heading at the top of the content area:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`<body>
  <a href="#main" class="sr-only focus:not-sr-only">Skip to main content</a>

  <header>
    <nav>
      <!-- Navigation links that keyboard users can skip -->
    </nav>
  </header>

  <main id="main" tabindex="-1">
    <h1>Page Title</h1>
    <!-- Main content -->
  </main>
</body>`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The CSS technique uses a utility class (commonly <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">sr-only</code> in
          Tailwind CSS) that visually hides the element while keeping it accessible to screen readers and
          keyboard navigation. When the link receives focus, the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">focus:not-sr-only</code> variant
          overrides the hidden styles, making the link visible to the sighted keyboard user so they know
          it&apos;s there and can activate it. The underlying CSS for this pattern is:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">CSS</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: fixed;
  top: 1rem;
  left: 1rem;
  width: auto;
  height: auto;
  padding: 0.75rem 1.5rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
  background: #1e293b;
  color: #fff;
  font-weight: 600;
  border-radius: 0.5rem;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Note the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex=&quot;-1&quot;</code> on
          the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;main&gt;</code> element.
          This is necessary because non-interactive elements don&apos;t receive focus by default when navigated
          to via an anchor link in some browsers. Adding <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex=&quot;-1&quot;</code> ensures
          the target element can receive programmatic focus without being added to the natural tab order.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          You can test your skip link implementation with Speakable to verify the link is present and
          correctly announced:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`speakable page.html -f text --selector "a[href='#main']"`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          This outputs how a screen reader would announce the skip link, confirming the accessible name
          (&quot;Skip to main content&quot;) and the link role are correctly exposed. For sites with complex
          navigation structures, you might also add skip links for secondary navigation, sidebar content,
          or a &quot;Skip to search&quot; shortcut.
        </p>
      </section>

      {/* Section 4: Roving Tabindex */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Roving Tabindex</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Roving tabindex is a focus management pattern used in composite widgets, specifically components that
          contain multiple interactive elements that should behave as a single Tab stop. Examples include
          tab lists, toolbars, menu bars, tree views, and listboxes. Instead of each item in the group
          being a separate Tab stop (which would make navigation tedious for keyboard users), the group
          acts as one: pressing Tab moves focus into the group, arrow keys navigate between items within
          the group, and pressing Tab again moves focus out of the group entirely.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The pattern works by dynamically managing the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex</code> attribute
          on each item. Only the currently active item has <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex=&quot;0&quot;</code>,
          making it the one that receives focus when the user Tabs into the group. All other items
          have <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabindex=&quot;-1&quot;</code>, removing
          them from the tab order but allowing them to receive focus programmatically via arrow key handlers.
          When an arrow key is pressed, the current item&apos;s tabindex changes to -1, the next item&apos;s tabindex
          changes to 0, and focus moves to that next item.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The benefits of this approach are significant. A toolbar with 10 buttons becomes a single Tab
          stop instead of 10. Keyboard users can quickly Tab past the entire group when they don&apos;t need
          it, and drill into it with arrow keys when they do. This matches the behavior users expect from
          native operating system controls, making the interface feel familiar and efficient.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Here is a tablist implementation using roving tabindex:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">RovingTablist.tsx</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { useState, useRef, useCallback } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface RovingTablistProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function RovingTablist({ tabs, activeTab, onTabChange }: RovingTablistProps) {
  const [focusedIndex, setFocusedIndex] = useState(
    tabs.findIndex(t => t.id === activeTab)
  );
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let newIndex = focusedIndex;

    switch (e.key) {
      case 'ArrowRight':
        newIndex = (focusedIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        newIndex = (focusedIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setFocusedIndex(newIndex);
    tabRefs.current[newIndex]?.focus();
  }, [focusedIndex, tabs.length]);

  return (
    <div role="tablist" aria-label="Content sections" onKeyDown={handleKeyDown}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={el => { tabRefs.current[index] = el; }}
          role="tab"
          id={\`tab-\${tab.id}\`}
          aria-selected={tab.id === activeTab}
          aria-controls={\`panel-\${tab.id}\`}
          tabIndex={index === focusedIndex ? 0 : -1}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Notice that <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">Home</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">End</code> keys
          are also handled. This is part of the ARIA Authoring Practices specification for tablists and
          toolbars. Arrow keys wrap around at the boundaries (first ↔ last), giving the user a continuous
          loop. The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-selected</code> state
          communicates which tab is currently active to screen readers, while the focus position (managed
          by tabindex) may differ from the selection. A user can arrow-focus different tabs before
          activating one.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          For vertical lists like tree views and vertical menus, use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">ArrowUp</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">ArrowDown</code> instead
          of left/right. The principle remains identical; only the axis changes. Some composite widgets
          like grids use both axes simultaneously, requiring a two-dimensional roving tabindex that tracks
          row and column positions.
        </p>
      </section>

      {/* Section 5: Focus Indicators */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Focus Indicators</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Focus indicators are the visible markers that show keyboard users which element currently has
          focus. They are the keyboard equivalent of a mouse cursor. Without them, a keyboard user
          literally cannot see where they are on the page. Removing focus indicators (with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">outline: none</code>)
          without providing an adequate replacement is one of the most common and damaging accessibility
          mistakes in web development. WCAG 2.2 elevated focus appearance to Level AA (Success Criterion
          2.4.13), reflecting how critical this is for usability.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The modern approach uses the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">:focus-visible</code> pseudo-class
          rather than <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">:focus</code>. The difference
          is important: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">:focus</code> activates
          on any focus event, including mouse clicks on buttons (which often looks visually undesirable
          to designers). <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">:focus-visible</code> activates
          only when the browser determines the user is navigating via keyboard, giving you the best of
          both worlds: clean visuals for mouse users, clear indicators for keyboard users.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Custom focus styles should meet a 3:1 contrast ratio against adjacent colors to be clearly
          visible. A 2px solid outline with a small offset is a reliable baseline that works across
          most designs:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">globals.css</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`/* Base focus style for all interactive elements */
*:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Refined styles for specific components */
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  border-radius: inherit;
}

/* Dark backgrounds need a lighter focus color */
.dark-section *:focus-visible {
  outline-color: #93c5fd;
}

/* Never do this without a replacement */
/* ❌ *:focus { outline: none; } */`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Browser default focus styles are often insufficient. Many browsers still render a thin
          1px dotted outline that can be nearly invisible on certain backgrounds. The default is
          technically present, so it &quot;works,&quot; but it fails the practical test of being clearly
          perceivable by users with low vision or on low-contrast monitors. A deliberate, high-contrast
          custom focus style is always preferable.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">outline-offset</code> property
          is particularly useful because it creates visual separation between the focused element and the
          focus ring. This makes the indicator stand out even when the element has a border or background
          color that would otherwise blend with the outline. A 2px offset works well in most cases,
          large enough to be distinct, small enough to not feel disconnected from the element.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          For elements with rounded corners, note that <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">outline</code> does
          not follow border-radius in all browsers (though support is improving). If pixel-perfect rounded
          focus rings are important to your design, consider using a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">box-shadow</code> technique
          as an alternative, though you must ensure it remains visible in Windows High Contrast Mode (which
          strips box-shadows but preserves outlines).
        </p>
      </section>

      {/* Section 6: SPA Focus Management */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">SPA Focus Management</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Single-page applications present a unique focus management challenge: route changes happen
          without a full page reload. In a traditional multi-page site, navigating to a new page causes
          the browser to reset focus to the top of the document, and screen readers announce the new page
          title. In an SPA, only a portion of the DOM updates. The browser doesn&apos;t know a &quot;page
          change&quot; happened, focus stays wherever it was (often on the clicked link), and screen readers
          remain silent about the new content.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          This means keyboard and screen reader users may have no idea that navigation occurred. The link
          they clicked might still be focused, but the content around it has completely changed. They need
          to manually explore to discover what happened, or worse, they may not realize anything changed
          at all if the visual update is outside their current reading position.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The most widely recommended pattern is to move focus to the new page&apos;s heading or main content
          area after a route change. This gives the user immediate context about where they are:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">useRouteFocus.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function useRouteFocus() {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const isInitialRender = useRef(true);

  useEffect(() => {
    // Don't move focus on initial page load
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Move focus to the main content area after route change
    mainRef.current?.focus();
  }, [pathname]);

  return mainRef;
}

// Usage in layout:
// <main ref={mainRef} tabIndex={-1} className="outline-none">
//   {children}
// </main>`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          There are two main schools of thought on how to handle SPA route announcements, and both are
          valid depending on your application&apos;s context:
        </p>
        <div className="space-y-4 mb-6">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Move focus to the new content</p>
              <p className="text-sm text-slate-600">
                Focus moves to the H1 or main element of the new page. The screen reader announces
                the heading text, giving immediate context. This is the most common pattern and works
                well when the new page is a distinct view.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Announce via an aria-live region</p>
              <p className="text-sm text-slate-600">
                A visually hidden <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-live=&quot;polite&quot;</code> region
                is updated with text like &quot;Navigated to Settings page.&quot; The screen reader
                announces this without moving focus, which can be preferable when the user&apos;s focus
                position should persist (e.g., in a sidebar navigation they&apos;re still browsing).
              </p>
            </div>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The focus-move approach is generally better for full page transitions where the entire content
          area changes. The live-region approach works better for partial updates or tabbed interfaces
          where the user might want to continue interacting with the navigation controls. Many applications
          use a combination: moving focus for major navigation and live regions for sub-navigation within
          a view.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Important implementation detail: when moving focus to a non-interactive element like an H1 or
          a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;main&gt;</code> element,
          you must add <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabIndex=&#123;-1&#125;</code> so
          it can receive programmatic focus. You should also remove the focus outline (since it&apos;s not
          an interactive element) by adding a class like <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">outline-none</code> or <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">focus:outline-none</code>.
          Without <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">tabIndex=&#123;-1&#125;</code>,
          the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">.focus()</code> call
          will silently fail and focus will remain on the previous element.
        </p>
      </section>

      {/* Section 7: Testing Focus with Speakable */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Testing Focus with Speakable</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable&apos;s audit report includes information about focusable elements in your document,
          helping you verify that interactive elements are properly exposed and that your tab order is
          logical. The audit identifies elements that will receive focus during keyboard navigation and
          reports their accessible names, roles, and positions in the document structure.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          To inspect focusable elements in your HTML, use the JSON output format which includes
          a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">focusable: true</code> property
          on nodes that participate in the tab order:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`# Get full accessibility tree with focusable markers
speakable page.html -f json

# Check specific interactive elements
speakable page.html -f text -s nvda --selector "button, a, input"

# Verify a dialog's focusable elements
speakable dialog.html -f text --selector "[role='dialog'] button, [role='dialog'] input"`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">--selector</code> flag
          is particularly useful for focus testing because it lets you narrow the analysis to specific
          regions of the page. For example, you can check that all buttons within a toolbar have
          accessible names, or that form inputs within a dialog are properly labeled, both of which are
          prerequisites for meaningful keyboard interaction.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          A typical workflow for validating focus structure:
        </p>
        <div className="space-y-4 mb-6">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <p className="text-sm text-slate-600">
              Run <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">speakable page.html -f json</code> to
              get the full accessibility tree with focusable element markers.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <p className="text-sm text-slate-600">
              Check that the focusable element count matches your expectations. No hidden elements
              accidentally in the tab order, no interactive elements missing from it.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">3.</span>
            <p className="text-sm text-slate-600">
              Use selectors to verify specific interactive elements have proper roles and names:
              buttons should have labels, links should have descriptive text, inputs should have
              associated labels.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">4.</span>
            <p className="text-sm text-slate-600">
              For composite widgets using roving tabindex, verify that the correct element
              has <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">tabindex=&quot;0&quot;</code> and
              others have <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">tabindex=&quot;-1&quot;</code>.
            </p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5" aria-hidden="true">info</span>
            <div>
              <p className="text-sm font-bold text-amber-900 mb-1">Important limitation</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                Speakable verifies static structure: it can confirm that elements have correct roles,
                names, and tabindex values in the HTML. However, dynamic focus behavior (focus trapping,
                focus restoration, roving tabindex in response to key events) requires manual testing
                with a keyboard and screen reader. Speakable tells you the &quot;what&quot; (what will be
                announced), while manual testing verifies the &quot;when&quot; (when focus moves and in
                response to which interactions).
              </p>
            </div>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Combining Speakable&apos;s static analysis with manual keyboard testing gives you comprehensive
          coverage: Speakable catches missing names, incorrect roles, and structural issues automatically,
          while manual testing verifies the temporal focus behavior that only executes at runtime. For
          CI pipelines, Speakable&apos;s JSON output can be parsed to assert on focusable element counts,
          required labels, and role presence, catching regressions before they reach production.
        </p>
      </section>

      <RelatedPages
        pages={[
          {
            href: "/docs/component-patterns",
            title: "Component Patterns",
            description: "Accessible dialog, menu, disclosure, and tab patterns with full ARIA markup.",
          },
          {
            href: "/docs/keyboard-navigation",
            title: "Keyboard Navigation",
            description: "Comprehensive guide to keyboard interaction patterns and expected behaviors.",
          },
          {
            href: "/docs/testing-checklist",
            title: "Testing Checklist",
            description: "Step-by-step checklist for verifying accessibility across your application.",
          },
          {
            href: "/docs/common-mistakes",
            title: "Common Mistakes",
            description: "Frequent accessibility errors and how to avoid them in your components.",
          },
        ]}
      />
    </>
  );
}
