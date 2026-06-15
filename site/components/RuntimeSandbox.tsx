'use client';

import { useState, useRef, useCallback } from 'react';
import { TimelineVisualizer, AccessibilityEvent } from './TimelineVisualizer';

const PLACEHOLDER_HTML = `<button id="trigger" aria-expanded="false" aria-haspopup="dialog">
  Open Settings
</button>

<div id="dialog" role="dialog" aria-modal="true" aria-label="Settings" hidden>
  <h2>Settings</h2>
  <label for="name">Display name</label>
  <input id="name" type="text" />
  <button id="close">Close</button>
</div>

<script>
  const trigger = document.getElementById('trigger');
  const dialog = document.getElementById('dialog');
  const closeBtn = document.getElementById('close');

  trigger.addEventListener('click', () => {
    dialog.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  });

  closeBtn.addEventListener('click', () => {
    dialog.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dialog.hidden) {
      closeBtn.click();
    }
  });
<\/script>`;

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
  const [html, setHtml] = useState(PLACEHOLDER_HTML);
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

      // Mutation observer
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

          // aria-live announcements
          if (attr === 'aria-live') {
            pushEvent({
              type: 'ANNOUNCEMENT',
              timestamp,
              target,
              payload: {
                kind: 'announcement',
                politeness: (newValue as 'polite' | 'assertive') || 'polite',
                text: el.textContent?.trim() || '',
              },
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

      observerRef.current = observer;
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
      {/* HTML input area */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Paste your HTML</label>
          <button
            onClick={handleRender}
            disabled={!html.trim()}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRendered ? 'Re-render' : 'Render and Start Capture'}
          </button>
        </div>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder="Paste HTML with inline scripts here..."
          className="w-full h-64 px-4 py-3 bg-gray-50 text-gray-800 font-mono text-sm resize-y border-none focus:ring-0 placeholder:text-gray-400"
          spellCheck={false}
        />
      </div>

      {/* Iframe sandbox */}
      {isRendered && (
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Live Preview</span>
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
              {events.length} event{events.length !== 1 ? 's' : ''} captured
            </span>
          </div>
          <button
            onClick={handleStop}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Stop and Clear
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
                Integrate runtime analysis into your workflow
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                What you just saw here can run automatically in your CI pipeline. Capture accessibility timelines
                for every component, baseline them, and detect behavior regressions on every pull request.
                Works with Storybook, local dev servers, and custom interaction patterns.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/docs/runtime-analysis"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">menu_book</span>
                  View Runtime Docs
                </a>
                <a
                  href="/docs/cicd-integration"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">deployed_code</span>
                  CI/CD Setup
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
