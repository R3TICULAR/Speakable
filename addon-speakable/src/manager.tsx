/**
 * Manager (toolbar) side of the addon.
 * Registers the "Screen Readers" panel and renders the analysis UI.
 */

import React, { useState, useEffect } from 'react';
import { addons, types } from '@storybook/manager-api';
import { ADDON_ID, PANEL_ID, EVENT_RESULT, EVENT_TIMELINE } from './index';
import type { AnalysisResult, AuditFinding } from './analyzer';
import { diffTimelines } from '../../src/runtime/diff-engine';
import { classifyDiff } from '../../src/runtime/severity';
import type { ClassifiedDiffReport, SeverityLevel } from '../../src/runtime/severity';
import type { AccessibilityEvent, AccessibilityTimeline } from '../../src/runtime/types';
import { createPanelBaselineStore } from './baseline-store';

// ─── Panel Component ─────────────────────────────────────────────────────────

type ReaderTab = 'nvda' | 'jaws' | 'voiceover' | 'narrator' | 'audit' | 'timeline' | 'diff';

const READER_TABS: { key: ReaderTab; label: string; color: string }[] = [
  { key: 'nvda', label: 'NVDA', color: '#3b82f6' },
  { key: 'jaws', label: 'JAWS', color: '#8b5cf6' },
  { key: 'voiceover', label: 'VoiceOver', color: '#06b6d4' },
  { key: 'narrator', label: 'Narrator', color: '#f59e0b' },
  { key: 'audit', label: 'Audit', color: '#ef4444' },
  { key: 'timeline', label: 'Timeline', color: '#10b981' },
  { key: 'diff', label: 'Diff', color: '#ec4899' },
];

const baselineStore = createPanelBaselineStore();

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#6b7280',
};

/** Summarize an event's payload for a one-line timeline display. */
function summarizePayload(event: AccessibilityEvent): string {
  const p = event.payload as Record<string, unknown>;
  switch (p.kind) {
    case 'focus_changed': return 'focus moved here';
    case 'announcement': return `announce (${p.politeness}): "${p.text}"`;
    case 'role_changed': return `role ${p.previousRole} → ${p.newRole}`;
    case 'accessible_name_changed': return `name "${p.previousName}" → "${p.newName}"`;
    case 'state_changed': return `${p.attribute}: ${String(p.previousValue)} → ${String(p.newValue)}`;
    case 'dialog_opened': return `dialog opened: ${p.dialogName}${p.isModal ? ' (modal)' : ''}`;
    case 'dialog_closed': return `dialog closed: ${p.dialogName}`;
    case 'keyboard_action': return `key ${[...(p.modifiers as string[] || []), p.key].join('+')}`;
    case 'warning': return `⚠ ${p.message}`;
    default: return '';
  }
}

function SpeakablePanel() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [timeline, setTimeline] = useState<AccessibilityTimeline | null>(null);
  const [diff, setDiff] = useState<ClassifiedDiffReport | null>(null);
  const [hasBaseline, setHasBaseline] = useState(false);
  const [activeTab, setActiveTab] = useState<ReaderTab>('nvda');

  useEffect(() => {
    const channel = addons.getChannel();
    const handleResult = (data: AnalysisResult) => {
      setResult(data);
    };
    const handleTimeline = async (data: AccessibilityTimeline) => {
      setTimeline(data);
      // Diff against a stored baseline for this story, if present.
      const baseline = await baselineStore.load(data.component, data.story || 'Story');
      if (baseline) {
        setHasBaseline(true);
        const report = diffTimelines(baseline, data);
        setDiff(classifyDiff(report));
      } else {
        setHasBaseline(false);
        setDiff(null);
      }
    };
    channel.on(EVENT_RESULT, handleResult);
    channel.on(EVENT_TIMELINE, handleTimeline);
    return () => {
      channel.off(EVENT_RESULT, handleResult);
      channel.off(EVENT_TIMELINE, handleTimeline);
    };
  }, []);

  const handleSetBaseline = async () => {
    if (!timeline) return;
    await baselineStore.save(timeline.component, timeline.story || 'Story', timeline);
    setHasBaseline(true);
    // Re-diff against the freshly-saved baseline (identity → no differences).
    const report = diffTimelines(timeline, timeline);
    setDiff(classifyDiff(report));
  };

  if (!result) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🔊</div>
        <p style={styles.emptyText}>Render a story to see predicted screen reader output</p>
        <p style={styles.emptySubtext}>Powered by Speakable</p>
      </div>
    );
  }

  const READER_KEYS = ['nvda', 'jaws', 'voiceover', 'narrator'] as const;
  const isReaderTab = (READER_KEYS as readonly string[]).includes(activeTab);
  const activeLines = isReaderTab ? result[activeTab as (typeof READER_KEYS)[number]] : [];
  const auditFindings = result.audit;

  return (
    <div style={styles.container}>
      {/* Tab bar */}
      <div style={styles.tabBar}>
        {READER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.key
                ? { ...styles.tabActive, borderBottomColor: tab.color }
                : { borderBottomColor: 'transparent' }),
            }}
          >
            {tab.label}
            {tab.key === 'audit' && auditFindings.length > 0 && (
              <span style={styles.badge}>{auditFindings.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        <span style={styles.stat}>{result.stats.totalElements} elements</span>
        <span style={styles.stat}>{result.stats.interactiveElements} interactive</span>
        <span style={styles.stat}>{result.stats.landmarks} landmarks</span>
        <span style={styles.stat}>{result.stats.headings} headings</span>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'audit' ? (
          <AuditView findings={auditFindings} />
        ) : activeTab === 'timeline' ? (
          <TimelineView timeline={timeline} hasBaseline={hasBaseline} onSetBaseline={handleSetBaseline} />
        ) : activeTab === 'diff' ? (
          <DiffView diff={diff} hasBaseline={hasBaseline} hasTimeline={!!timeline} onSetBaseline={handleSetBaseline} />
        ) : (
          <AnnouncementView lines={activeLines} readerKey={activeTab} />
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerText}>
          Predictions are heuristic-based. Verify with real screen readers before release.
        </span>
        <a href="https://getspeakable.dev" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
          getspeakable.dev
        </a>
      </div>
    </div>
  );
}

function AnnouncementView({ lines, readerKey }: { lines: string[]; readerKey: string }) {
  if (lines.length === 0) {
    return <p style={styles.emptyContent}>No announcements for this story.</p>;
  }

  return (
    <div style={styles.lineList}>
      {lines.map((line, i) => (
        <div key={`${readerKey}-${i}`} style={styles.line}>
          <span style={styles.lineNumber}>{i + 1}</span>
          <span style={styles.lineText}>{line}</span>
        </div>
      ))}
    </div>
  );
}

function AuditView({ findings }: { findings: AuditFinding[] }) {
  if (findings.length === 0) {
    return (
      <div style={styles.auditPass}>
        <span style={{ fontSize: 24 }}>✓</span>
        <p style={{ margin: 0, fontWeight: 600, color: '#059669' }}>No issues found</p>
        <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
          All interactive elements have accessible names and heading hierarchy is correct.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.lineList}>
      {findings.map((finding, i) => (
        <div key={i} style={{ ...styles.finding, borderLeftColor: finding.severity === 'error' ? '#ef4444' : finding.severity === 'warning' ? '#f59e0b' : '#6b7280' }}>
          <div style={styles.findingSeverity}>
            {finding.severity === 'error' ? '✗' : finding.severity === 'warning' ? '⚠' : 'ℹ'}
          </div>
          <div>
            <p style={styles.findingMessage}>{finding.message}</p>
            <p style={styles.findingSelector}>{finding.selector}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineView({
  timeline,
  hasBaseline,
  onSetBaseline,
}: {
  timeline: AccessibilityTimeline | null;
  hasBaseline: boolean;
  onSetBaseline: () => void;
}) {
  if (!timeline) {
    return (
      <p style={styles.emptyContent}>
        No interaction timeline for this story. Add{' '}
        <code>parameters.speakable.sequence</code> or{' '}
        <code>parameters.speakable.pattern</code> to capture one.
      </p>
    );
  }

  return (
    <div>
      <div style={styles.baselineBar}>
        <span style={styles.stat}>
          {timeline.events.length} events · {timeline.duration}ms
        </span>
        <span style={styles.baselineHint}>
          {hasBaseline ? '✓ baseline set' : 'No baseline yet'}
        </span>
        <button style={styles.baselineButton} onClick={onSetBaseline}>
          Set baseline
        </button>
      </div>
      <div style={styles.lineList}>
        {timeline.events.map((event, i) => (
          <div key={i} style={styles.line}>
            <span style={styles.lineNumber}>{event.timestamp}ms</span>
            <span style={styles.lineText}>
              <strong>{event.type}</strong>
              {event.target.role ? ` · ${event.target.role}` : ''}
              {event.target.accessibleName ? ` "${event.target.accessibleName}"` : ''}
              {summarizePayload(event) ? ` — ${summarizePayload(event)}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiffView({
  diff,
  hasBaseline,
  hasTimeline,
  onSetBaseline,
}: {
  diff: ClassifiedDiffReport | null;
  hasBaseline: boolean;
  hasTimeline: boolean;
  onSetBaseline: () => void;
}) {
  if (!hasBaseline) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyText}>No baseline to compare against</p>
        <p style={styles.emptySubtext}>
          Capture a timeline, then set it as the baseline to detect regressions.
        </p>
        {hasTimeline && (
          <button style={styles.baselineButton} onClick={onSetBaseline}>
            Set baseline
          </button>
        )}
      </div>
    );
  }

  if (!diff || diff.entries.length === 0) {
    return (
      <div style={styles.auditPass}>
        <span style={{ fontSize: 24 }}>✓</span>
        <p style={{ margin: 0, fontWeight: 600, color: '#059669' }}>No behavioral changes</p>
        <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
          The current timeline matches the baseline.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.lineList}>
      {diff.entries.map((entry, i) => (
        <div
          key={i}
          style={{ ...styles.finding, background: '#fff7fb', borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: SEVERITY_COLORS[entry.severity] }}
        >
          <div style={{ ...styles.findingSeverity, color: SEVERITY_COLORS[entry.severity] }}>
            {entry.severity.toUpperCase()}
          </div>
          <div>
            <p style={styles.findingMessage}>{entry.message}</p>
            <p style={styles.findingSelector}>
              {entry.event.type} · {entry.event.target.selector}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 13,
    color: '#1e293b',
    background: '#ffffff',
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 12px',
    gap: 0,
    background: '#f8fafc',
  },
  tab: {
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    outline: 'none',
  },
  tabActive: {
    color: '#1e293b',
  },
  badge: {
    background: '#ef4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 10,
    padding: '1px 6px',
    minWidth: 18,
    textAlign: 'center' as const,
  },
  statsBar: {
    display: 'flex',
    gap: 16,
    padding: '8px 16px',
    borderBottom: '1px solid #f1f5f9',
    background: '#f8fafc',
  },
  baselineBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
    borderBottom: '1px solid #f1f5f9',
    background: '#f8fafc',
  },
  baselineHint: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 'auto',
  },
  baselineButton: {
    fontSize: 11,
    fontWeight: 600,
    color: '#fff',
    background: '#10b981',
    border: 'none',
    borderRadius: 4,
    padding: '4px 10px',
    cursor: 'pointer',
  },
  stat: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 500,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: 0,
  },
  lineList: {
    padding: '8px 0',
  },
  line: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '6px 16px',
    borderBottom: '1px solid #f8fafc',
    transition: 'background 0.1s',
  },
  lineNumber: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'monospace',
    minWidth: 20,
    textAlign: 'right' as const,
    paddingTop: 2,
  },
  lineText: {
    fontSize: 13,
    color: '#1e293b',
    fontFamily: 'monospace',
    lineHeight: 1.5,
  },
  emptyContent: {
    padding: 24,
    textAlign: 'center' as const,
    color: '#94a3b8',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  footerLink: {
    fontSize: 11,
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: 600,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 8,
    padding: 32,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#475569',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  auditPass: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 32,
    color: '#059669',
  },
  finding: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 16px',
    margin: '4px 12px',
    borderRadius: 4,
    background: '#fefce8',
  },
  findingSeverity: {
    fontSize: 14,
    fontWeight: 700,
    paddingTop: 1,
  },
  findingMessage: {
    margin: 0,
    fontSize: 13,
    fontWeight: 500,
    color: '#1e293b',
  },
  findingSelector: {
    margin: '2px 0 0',
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
  },
};

// ─── Registration ────────────────────────────────────────────────────────────

// Speakable icon as React component for the panel tab
function SpeakableIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      style={{ width: 14, height: 14, marginRight: 4, verticalAlign: 'middle' }}
    >
      <rect x="2" y="4" width="28" height="20" rx="4" fill="#0D9488" />
      <polygon points="8,24 14,24 10,30" fill="#0D9488" />
      <path d="M12 11 L12 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 9 L16 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 11 L20 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: (<span style={{ display: 'inline-flex', alignItems: 'center' }}><SpeakableIcon />Screen Readers</span>),
    render: ({ active }) => (active ? <SpeakablePanel /> : null),
  });
});
