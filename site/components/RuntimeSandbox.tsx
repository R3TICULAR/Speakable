'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { TimelineVisualizer, AccessibilityEvent } from './TimelineVisualizer';

// Shared base styles for template previews, using Speakable design-system colors.
// Kept intentionally small: enough to make the live iframe preview look on-brand
// without turning these into a CSS showcase.
const TEMPLATE_STYLES = `<style>
  :root {
    --brand: #2563eb; --brand-dark: #1d4ed8; --brand-50: #eff6ff;
    --slate-50: #f8fafc; --slate-200: #e2e8f0; --slate-500: #64748b;
    --slate-700: #334155; --slate-900: #0f172a;
    --emerald: #059669; --amber: #b45309;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--slate-900); margin: 0; padding: 24px; background: var(--slate-50);
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  p { color: var(--slate-700); line-height: 1.5; }
  label { display: block; font-size: 13px; font-weight: 600; color: var(--slate-700); margin: 12px 0 4px; }
  input[type="text"], input[type="email"] {
    width: 100%; padding: 8px 10px; border: 1px solid var(--slate-200);
    border-radius: 6px; font-size: 14px;
  }
  input:focus, button:focus, [tabindex]:focus {
    outline: 2px solid var(--brand); outline-offset: 2px;
  }
  button {
    font: inherit; cursor: pointer; border-radius: 6px; padding: 8px 14px;
    font-weight: 600; font-size: 14px; border: 1px solid transparent;
  }
  .btn-primary { background: var(--brand); color: #fff; }
  .btn-primary:hover { background: var(--brand-dark); }
  .btn-secondary { background: #fff; color: var(--slate-700); border-color: var(--slate-200); }
  .btn-secondary:hover { background: var(--slate-50); }
  .card {
    background: #fff; border: 1px solid var(--slate-200); border-radius: 12px;
    padding: 20px; max-width: 460px; box-shadow: 0 1px 2px rgba(15,23,42,0.05);
  }
  .actions { display: flex; gap: 8px; margin-top: 16px; }
  .sr-only {
    position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0);
  }
</style>`;

// Settings dialog — focus moves into the modal on open, returns on close,
// Escape closes, live region announces. Exercises DIALOG/STATE/FOCUS/ANNOUNCEMENT.
const TEMPLATE_DIALOG = `${TEMPLATE_STYLES}
<button id="trigger" class="btn-primary" aria-expanded="false" aria-haspopup="dialog">
  Open Settings
</button>

<div id="dialog" class="card" role="dialog" aria-modal="true" aria-label="Settings" hidden style="margin-top:16px;">
  <h2>Settings</h2>
  <label for="name">Display name</label>
  <input id="name" type="text" />
  <div class="actions">
    <button id="close" class="btn-secondary">Close</button>
  </div>
</div>

<div id="status" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>

<script>
  const trigger = document.getElementById('trigger');
  const dialog = document.getElementById('dialog');
  const closeBtn = document.getElementById('close');
  const status = document.getElementById('status');

  trigger.addEventListener('click', () => {
    dialog.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
    status.textContent = 'Settings dialog opened.';
  });

  closeBtn.addEventListener('click', () => {
    dialog.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
    status.textContent = 'Settings dialog closed.';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dialog.hidden) {
      closeBtn.click();
    }
  });
<\/script>`;

// Disclosure — a single expandable region toggling aria-expanded and revealing
// content. Exercises STATE_CHANGED + FOCUS_CHANGED + a polite announcement.
const TEMPLATE_DISCLOSURE = `${TEMPLATE_STYLES}
<div class="card">
  <h2>Shipping &amp; returns</h2>
  <button id="toggle" class="btn-secondary" aria-expanded="false" aria-controls="panel">
    Shipping details
  </button>
  <div id="panel" hidden style="margin-top:12px;">
    <p>Orders ship within 2 to 3 business days. Free returns within 30 days of delivery.</p>
  </div>
</div>

<div id="status" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>

<script>
  const toggle = document.getElementById('toggle');
  const panel = document.getElementById('panel');
  const status = document.getElementById('status');

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
    status.textContent = open ? 'Shipping details collapsed.' : 'Shipping details expanded.';
  });
<\/script>`;

// Tabs — arrow-key roving tabindex tablist. Exercises FOCUS_CHANGED,
// STATE_CHANGED (aria-selected), and announcements on panel change.
const TEMPLATE_TABS = `${TEMPLATE_STYLES}
<style>
  [role="tablist"] { display: flex; gap: 4px; padding: 4px; background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: 8px; }
  [role="tab"] {
    background: none; border: 1px solid transparent; border-radius: 6px;
    padding: 6px 12px; color: var(--slate-500); font-weight: 600;
  }
  [role="tab"][aria-selected="true"] {
    color: var(--brand); background: #fff; border-color: var(--slate-200);
  }
  [role="tabpanel"] { padding-top: 16px; }
</style>
<div class="card">
  <div role="tablist" aria-label="Account sections">
    <button role="tab" id="tab-1" aria-selected="true" aria-controls="p-1" tabindex="0">Profile</button>
    <button role="tab" id="tab-2" aria-selected="false" aria-controls="p-2" tabindex="-1">Billing</button>
    <button role="tab" id="tab-3" aria-selected="false" aria-controls="p-3" tabindex="-1">Notifications</button>
  </div>
  <div role="tabpanel" id="p-1" aria-labelledby="tab-1"><p>Manage your public profile and display name.</p></div>
  <div role="tabpanel" id="p-2" aria-labelledby="tab-2" hidden><p>Update your payment method and view invoices.</p></div>
  <div role="tabpanel" id="p-3" aria-labelledby="tab-3" hidden><p>Choose which emails and alerts you receive.</p></div>
</div>

<div id="status" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>

<script>
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  const status = document.getElementById('status');

  function select(index) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    tabs[index].focus();
    status.textContent = tabs[index].textContent.trim() + ' tab selected.';
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length); }
    });
  });
<\/script>`;

const RUNTIME_TEMPLATES: Array<{ label: string; labelKey: string; html: string }> = [
  { label: 'Settings Dialog', labelKey: 'runtimeTemplateDialog', html: TEMPLATE_DIALOG },
  { label: 'Disclosure', labelKey: 'runtimeTemplateDisclosure', html: TEMPLATE_DISCLOSURE },
  { label: 'Tabs', labelKey: 'runtimeTemplateTabs', html: TEMPLATE_TABS },
];

const PLACEHOLDER_HTML = TEMPLATE_DIALOG;

const WATCHED_ATTRIBUTES = [
  'role',
  'aria-label',
  'aria-expanded',
  'aria-selected',
  'aria-checked',
  'aria-disabled',
  'aria-hidden',
  'aria-live',
  'open',
];

const STATE_ATTRIBUTES = [
  'aria-expanded',
  'aria-selected',
  'aria-checked',
  'aria-disabled',
  'aria-hidden',
];

function getRole(el: Element): string {
  return el.getAttribute('role') || el.tagName.toLowerCase();
}

function getAccessibleName(el: Element): string {
  return (
    el.getAttribute('aria-label') ||
    el.getAttribute('aria-labelledby') ||
    el.textContent?.trim().slice(0, 40) ||
    ''
  );
}

function getSelector(el: Element): string {
  if (el.id) return `#${el.id}`;
  const tag = el.tagName.toLowerCase();
  const cls = el.className ? `.${el.className.toString().split(' ')[0]}` : '';
  return `${tag}${cls}`;
}

function buildTarget(el: Element) {
  return {
    role: getRole(el),
    accessibleName: getAccessibleName(el),
    selector: getSelector(el),
  };
}

export function RuntimeSandbox() {
  const t = useTranslations('tool');
  const [html, setHtml] = useState(PLACEHOLDER_HTML);
  const [activeTemplate, setActiveTemplate] = useState<string | null>('Settings Dialog');
  const [isRendered, setIsRendered] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [events, setEvents] = useState<AccessibilityEvent[]>([]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sessionStartRef = useRef<number>(0);
  const observerRef = useRef<MutationObserver | null>(null);
  const focusListenerRef = useRef<((e: FocusEvent) => void) | null>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const pushEvent = useCallback((event: AccessibilityEvent) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  const handleTemplate = useCallback((tpl: { label: string; html: string }) => {
    setHtml(tpl.html);
    setActiveTemplate(tpl.label);
  }, []);

  const attachListeners = useCallback(
    (doc: Document) => {
      const getTimestamp = () => Date.now() - sessionStartRef.current;

      // Focus listener
      const onFocusIn = (e: FocusEvent) => {
        const target = e.target as Element;
        if (!target) return;

        const previousTarget = previousFocusRef.current
          ? buildTarget(previousFocusRef.current)
          : null;

        pushEvent({
          type: 'FOCUS_CHANGED',
          timestamp: getTimestamp(),
          target: buildTarget(target),
          payload: {
            kind: 'focus_changed',
            previousTarget,
          },
        });

        previousFocusRef.current = target;
      };

      doc.addEventListener('focusin', onFocusIn);
      focusListenerRef.current = onFocusIn;

      // ─── Live Region Observer ─────────────────────────────────────────────
      // Watch for text content changes INSIDE elements with aria-live or role="status"/"alert".
      // This is what actually triggers screen reader announcements (not the aria-live attr changing).
      const liveRegionObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          const target = mutation.target as Element;
          // Walk up to find the live region container
          let liveContainer: Element | null = null;
          let el: Element | null = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;
          while (el) {
            const liveAttr = el.getAttribute('aria-live');
            const role = el.getAttribute('role');
            if (liveAttr || role === 'status' || role === 'alert' || role === 'log') {
              liveContainer = el;
              break;
            }
            el = el.parentElement;
          }

          if (!liveContainer) continue;

          const text = liveContainer.textContent?.trim();
          if (!text) continue; // Ignore clears (debounce pattern clears then sets)

          const politeness = liveContainer.getAttribute('aria-live') ||
            (liveContainer.getAttribute('role') === 'alert' ? 'assertive' : 'polite');

          pushEvent({
            type: 'ANNOUNCEMENT',
            timestamp: getTimestamp(),
            target: buildTarget(liveContainer),
            payload: {
              kind: 'announcement',
              politeness: politeness as 'polite' | 'assertive',
              text,
            },
          });
        }
      });

      // Observe text changes in live regions
      const liveRegions = doc.querySelectorAll('[aria-live], [role="status"], [role="alert"], [role="log"]');
      liveRegions.forEach((region) => {
        liveRegionObserver.observe(region, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      });

      // Mutation observer for attribute changes
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type !== 'attributes' || !mutation.target) continue;

          const el = mutation.target as Element;
          const attr = mutation.attributeName || '';
          const oldValue = mutation.oldValue;
          const newValue = el.getAttribute(attr);

          if (!WATCHED_ATTRIBUTES.includes(attr)) continue;
          if (oldValue === newValue) continue;

          const timestamp = getTimestamp();
          const target = buildTarget(el);

          // Dialog open/close via the "open" attribute or hidden
          if (
            (attr === 'open' || el.getAttribute('role') === 'dialog') &&
            (attr === 'open' || attr === 'aria-hidden')
          ) {
            const dialogName =
              el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 20) || 'dialog';
            const isModal = el.getAttribute('aria-modal') === 'true';

            if (attr === 'open') {
              const opened = el.hasAttribute('open');
              pushEvent({
                type: opened ? 'DIALOG_OPENED' : 'DIALOG_CLOSED',
                timestamp,
                target,
                payload: opened
                  ? { kind: 'dialog_opened', dialogName, isModal }
                  : { kind: 'dialog_closed', dialogName },
              });
              continue;
            }
          }

          // State changes (aria-expanded, aria-selected, etc.)
          if (STATE_ATTRIBUTES.includes(attr)) {
            pushEvent({
              type: 'STATE_CHANGED',
              timestamp,
              target,
              payload: {
                kind: 'state_changed',
                attribute: attr,
                previousValue: oldValue,
                newValue: newValue,
              },
            });
            continue;
          }

          // Role changes
          if (attr === 'role') {
            pushEvent({
              type: 'ROLE_CHANGED',
              timestamp,
              target,
              payload: {
                kind: 'role_changed',
                previousRole: oldValue || 'none',
                newRole: newValue || 'none',
              },
            });
            continue;
          }

          // Accessible name changes
          if (attr === 'aria-label') {
            pushEvent({
              type: 'ACCESSIBLE_NAME_CHANGED',
              timestamp,
              target,
              payload: {
                kind: 'accessible_name_changed',
                previousName: oldValue || '',
                newName: newValue || '',
              },
            });
            continue;
          }

          // New live region added dynamically (attr aria-live just appeared)
          if (attr === 'aria-live' && newValue) {
            // Start observing this new live region for content changes
            liveRegionObserver.observe(el, {
              childList: true,
              characterData: true,
              subtree: true,
            });
          }
        }
      });

      observer.observe(doc.body, {
        attributes: true,
        attributeFilter: WATCHED_ATTRIBUTES,
        attributeOldValue: true,
        subtree: true,
      });

      // Also watch for dynamically added live regions via childList on body
      const bodyObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            const el = node as Element;
            // Check if the added element is a live region
            if (el.getAttribute('aria-live') || el.getAttribute('role') === 'status' ||
                el.getAttribute('role') === 'alert' || el.getAttribute('role') === 'log') {
              liveRegionObserver.observe(el, { childList: true, characterData: true, subtree: true });
            }
            // Also check descendants
            el.querySelectorAll('[aria-live], [role="status"], [role="alert"], [role="log"]').forEach((region) => {
              liveRegionObserver.observe(region, { childList: true, characterData: true, subtree: true });
            });
          }
        }
      });
      bodyObserver.observe(doc.body, { childList: true, subtree: true });

      observerRef.current = observer;
      // Store extra observers for cleanup
      (observerRef as any)._liveRegionObserver = liveRegionObserver;
      (observerRef as any)._bodyObserver = bodyObserver;
    },
    [pushEvent]
  );

  const handleRender = useCallback(() => {
    // Reset state
    setEvents([]);
    previousFocusRef.current = null;
    sessionStartRef.current = Date.now();
    setIsRendered(true);
    setIsCapturing(true);
  }, []);

  // When isRendered becomes true, set the iframe content and attach listeners
  const iframeLoadHandler = useCallback((iframe: HTMLIFrameElement | null) => {
    if (!iframe) return;
    iframeRef.current = iframe;

    if (isRendered && isCapturing) {
      iframe.srcdoc = html;
      iframe.onload = () => {
        try {
          const doc = iframe.contentDocument;
          if (!doc || !doc.body) return;
          attachListeners(doc);
        } catch (e) {
          // contentDocument access may fail in some browsers
          console.warn('Cannot access iframe contentDocument:', e);
        }
      };
    }
  }, [isRendered, isCapturing, html, attachListeners]);

  const handleStop = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      // Disconnect additional observers stored on the ref
      if ((observerRef as any)._liveRegionObserver) {
        (observerRef as any)._liveRegionObserver.disconnect();
        (observerRef as any)._liveRegionObserver = null;
      }
      if ((observerRef as any)._bodyObserver) {
        (observerRef as any)._bodyObserver.disconnect();
        (observerRef as any)._bodyObserver = null;
      }
      observerRef.current = null;
    }

    if (focusListenerRef.current && iframeRef.current?.contentDocument) {
      iframeRef.current.contentDocument.removeEventListener(
        'focusin',
        focusListenerRef.current as EventListener
      );
      focusListenerRef.current = null;
    }

    setIsCapturing(false);
    setIsRendered(false);
    setEvents([]);
  }, []);

  return (
    <div className="space-y-4">
      {/* Template presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">{t('loadTemplate')}</span>
        {RUNTIME_TEMPLATES.map((tpl) => (
          <button
            key={tpl.label}
            type="button"
            onClick={() => handleTemplate(tpl)}
            aria-pressed={activeTemplate === tpl.label}
            className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
              activeTemplate === tpl.label
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
            }`}
          >
            {t(tpl.labelKey)}
          </button>
        ))}
        <span className="text-[11px] text-slate-400 ml-1">{t('runtimeLoadTemplateHint')}</span>
      </div>

      {/* HTML input area */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('runtimePasteHtml')}</label>
          <button
            onClick={handleRender}
            disabled={!html.trim()}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRendered ? t('runtimeReRender') : t('runtimeRender')}
          </button>
        </div>
        <textarea
          value={html}
          onChange={(e) => { setHtml(e.target.value); setActiveTemplate(null); }}
          placeholder={t('runtimePlaceholder')}
          className="w-full h-64 px-4 py-3 bg-gray-50 text-gray-800 font-mono text-sm resize-y border-none focus:ring-0 placeholder:text-gray-400"
          spellCheck={false}
        />
      </div>

      {/* Iframe sandbox */}
      {isRendered && (
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('runtimeLivePreview')}</span>
            <div className="flex gap-2" aria-hidden="true">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
          </div>
          <iframe
            ref={iframeLoadHandler}
            sandbox="allow-scripts allow-same-origin"
            title="Runtime sandbox preview"
            className="w-full h-[300px] bg-white"
          />
        </div>
      )}

      {/* Status bar */}
      {isRendered && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            {isCapturing && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            )}
            <span className="text-xs text-gray-600 font-mono">
              {t('runtimeEventsCaptured', { count: events.length })}
            </span>
          </div>
          <button
            onClick={handleStop}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t('runtimeStopClear')}
          </button>
        </div>
      )}

      {/* Timeline visualizer */}
      {events.length > 0 && <TimelineVisualizer events={events} />}

      {/* Workflow CTA (shown after events are captured) */}
      {events.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-600 text-xl" aria-hidden="true">rocket_launch</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {t('runtimeCtaTitle')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {t('runtimeCtaBody')}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/docs/runtime-analysis"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">menu_book</span>
                  {t('runtimeCtaDocs')}
                </a>
                <a
                  href="/docs/cicd-integration"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">deployed_code</span>
                  {t('runtimeCtaCicd')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
