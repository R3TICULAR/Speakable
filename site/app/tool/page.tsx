'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  runAnalysis,
  runDiffAnalysis,
  type AnalysisResult,
  type ScreenReaderOption,
} from '@core/../web/src/analyzer';
import { ParsingError } from '@core/../web/src/browser-parser';
import { SelectorError } from '@core/extractor/tree-builder';
import { describeChange } from '@core/diff/diff-algorithm';
import { SIZE_LIMIT_BYTES } from '@core/../web/src/constants';
import { PageFadeIn } from '../../components/ScrollReveal';
import { VoiceControls, type VoiceControlsHandle, type SpeechMode } from '../../components/VoiceControls';
import { trackAnalyze, trackCopy, trackDownload, trackFileUpload, trackDiffToggle, trackVoicePlay, trackScreenReaderChange, trackTabSwitch, trackToolModeChange } from '../../lib/analytics';
import { useAuth, useUser } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { RuntimeSandbox } from '../../components/RuntimeSandbox';

type TabId = 'announcements' | 'audit' | 'json' | 'diff';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'announcements', label: 'Announcements' },
  { id: 'audit', label: 'Audit Report' },
  { id: 'json', label: 'JSON Model' },
  { id: 'diff', label: 'Semantic Diff' },
];

const READERS: ScreenReaderOption[] = ['NVDA', 'JAWS', 'VoiceOver', 'Narrator', 'All'];

// Template presets — real sample HTML that populates the input.
const TEMPLATES: Array<{ label: string; labelKey: string; html: string }> = [
  {
    label: 'E-Commerce Card',
    labelKey: 'templateEcommerce',
    html: `<article class="product-card">
  <img src="/headphones.jpg" alt="Wireless over-ear headphones in matte black" />
  <h3>Studio Wireless Headphones</h3>
  <p class="price">$249.00</p>
  <p class="rating" aria-label="Rated 4.5 out of 5 stars">★★★★½</p>
  <button type="button">Add to cart</button>
</article>`,
  },
  {
    label: 'Accessible Modal',
    labelKey: 'templateModal',
    html: `<div role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-desc" aria-modal="true" class="modal">
  <h2 id="dialog-title">Confirm Subscription Cancellation</h2>
  <p id="dialog-desc">Your plan access remains active until the end of the current cycle.</p>
  <div class="actions">
    <button type="button" class="btn-secondary">Keep Subscription</button>
    <button type="button" class="btn-danger" aria-label="Cancel membership subscription permanently">Confirm Cancel</button>
  </div>
</div>`,
  },
  {
    label: 'Form Dialog',
    labelKey: 'templateForm',
    html: `<form aria-labelledby="form-title">
  <h2 id="form-title">Create your account</h2>
  <label for="email">Email address</label>
  <input id="email" type="email" required aria-describedby="email-hint" />
  <p id="email-hint">We'll never share your email.</p>
  <label for="pw">Password</label>
  <input id="pw" type="password" required minlength="8" />
  <button type="submit">Sign up</button>
</form>`,
  },
];

export default function AnalyzerPage() {
  const [toolMode, setToolMode] = useState<'static' | 'runtime'>('static');
  const [html, setHtml] = useState('');
  const [htmlBefore, setHtmlBefore] = useState('');
  const [screenReader, setScreenReader] = useState<ScreenReaderOption>('NVDA');
  const [cssSelector, setCssSelector] = useState('');
  const [diffMode, setDiffMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('announcements');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const t = useTranslations('tool');
  const [showProModal, setShowProModal] = useState(false);

  // Voice / line-by-line state
  const [lineByLineActive, setLineByLineActive] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const voiceControlsRef = useRef<VoiceControlsHandle>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const metadata = (user?.publicMetadata || {}) as Record<string, unknown>;
  const isPro = metadata.subscriptionStatus === 'active' && metadata.subscriptionTier === 'pro';

  // Show Pro welcome modal once after upgrade (stored in sessionStorage)
  useEffect(() => {
    if (isPro && typeof window !== 'undefined') {
      const shown = sessionStorage.getItem('speakable-pro-welcome-shown');
      if (!shown) {
        setShowProModal(true);
        sessionStorage.setItem('speakable-pro-welcome-shown', '1');
      }
    }
  }, [isPro]);

  const handleAnalyze = useCallback(() => {
    setError(null);
    if (!html.trim()) { setError('HTML input is required.'); return; }
    if (diffMode && !htmlBefore.trim()) { setError('Before HTML is required in diff mode.'); return; }

    setLoading(true);
    try {
      const r = diffMode
        ? runDiffAnalysis({ htmlBefore, htmlAfter: html, cssSelector: cssSelector || undefined })
        : runAnalysis({ html, cssSelector: cssSelector || undefined });
      setResult(r);
      setActiveTab(diffMode ? 'diff' : 'announcements');
      trackAnalyze(screenReader, diffMode ? 'diff' : 'text', !!cssSelector);
    } catch (err) {
      if (err instanceof ParsingError || err instanceof SelectorError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError('An unexpected error occurred. Please try again.');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [html, htmlBefore, cssSelector, diffMode, screenReader]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > SIZE_LIMIT_BYTES) {
      setError(`File exceeds the ${SIZE_LIMIT_BYTES / (1024 * 1024)} MB limit.`);
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'html' && ext !== 'htm') {
      setError('Only .html and .htm files are accepted.');
      return;
    }
    file.text().then((text) => { setHtml(text); setActiveTemplate(null); setError(null); trackFileUpload(); });
  }, []);

  const handleTemplate = useCallback((tpl: { label: string; html: string }) => {
    setHtml(tpl.html);
    setActiveTemplate(tpl.label);
    setError(null);
  }, []);

  const handleReaderChange = useCallback((r: ScreenReaderOption) => {
    setScreenReader(r);
    trackScreenReaderChange(r);
  }, []);

  // Derive panel content from result + screenReader
  const panelContent = getPanelContent(activeTab, result, screenReader);
  const lines = panelContent.split('\n').filter(l => l.trim());
  const stats = getStats(result);

  // Reset line-by-line state when result or tab changes
  useEffect(() => {
    setLineByLineActive(false);
    setCurrentLine(0);
    voiceControlsRef.current?.stop();
  }, [result, activeTab, screenReader]);

  const handleModeChange = useCallback((mode: SpeechMode | null) => {
    if (mode === 'line-by-line') {
      setLineByLineActive(true);
      setCurrentLine(0);
      trackVoicePlay('line_by_line');
      requestAnimationFrame(() => {
        listboxRef.current?.focus();
      });
    } else if (mode === 'play-all') {
      setLineByLineActive(false);
      setCurrentLine(0);
      trackVoicePlay('play_all');
    } else {
      setLineByLineActive(false);
      setCurrentLine(0);
    }
  }, []);

  const handleLineChange = useCallback((index: number) => {
    setCurrentLine(index);
  }, []);

  const handleLineClick = useCallback((index: number) => {
    setCurrentLine(index);
    voiceControlsRef.current?.speakLine(index);
  }, []);

  const handleOutputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!lineByLineActive) return;
    const vc = voiceControlsRef.current;
    if (!vc) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'j': {
        e.preventDefault();
        const next = Math.min(currentLine + 1, lines.length - 1);
        if (next !== currentLine) {
          setCurrentLine(next);
          vc.speakLine(next);
        }
        break;
      }
      case 'ArrowUp':
      case 'k': {
        e.preventDefault();
        const prev = Math.max(currentLine - 1, 0);
        if (prev !== currentLine) {
          setCurrentLine(prev);
          vc.speakLine(prev);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const textFromCurrent = lines.slice(currentLine).join('\n');
        vc.play(textFromCurrent);
        break;
      }
      case 'Escape': {
        e.preventDefault();
        vc.stop();
        setCurrentLine(0);
        break;
      }
    }
  }, [lineByLineActive, currentLine, lines]);

  const activeReaderLabel = screenReader === 'All' ? t('allReaders') : screenReader;

  return (
    <PageFadeIn>
    {/* Pro Welcome Modal */}
    {showProModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pro-modal-title">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-[slideDown_300ms_ease-out]">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <h2 id="pro-modal-title" className="text-2xl font-extrabold text-slate-900 mb-2">{t('proModalTitle')}</h2>
            <p className="text-slate-600">
              {t('proModalDescription')}
            </p>
          </div>
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <span className="material-symbols-outlined text-teal-600" aria-hidden="true">stacks</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('proModalBatch')}</p>
                <p className="text-xs text-slate-500">{t('proModalBatchDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <span className="material-symbols-outlined text-teal-600" aria-hidden="true">compare_arrows</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('proModalDiff')}</p>
                <p className="text-xs text-slate-500">{t('proModalDiffDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <span className="material-symbols-outlined text-teal-600" aria-hidden="true">deployed_code</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('proModalCicd')}</p>
                <p className="text-xs text-slate-500">{t('proModalCicdDesc')}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/docs/cicd-integration"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-center transition-colors"
            >
              {t('proModalCtaCicd')}
            </Link>
            <Link
              href="/docs/usage-guide"
              className="w-full py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-lg text-center transition-colors"
            >
              {t('proModalCtaGuide')}
            </Link>
            <button
              onClick={() => setShowProModal(false)}
              className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              {t('proModalCtaContinue')}
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="bg-[#f8fafc] min-h-screen">
    <div className="pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto pt-10 space-y-8">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              {t('badgeAnalyzer')}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">tune</span>
              {t('badgeSimulating', { reader: activeReaderLabel })}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">bolt</span>
              {toolMode === 'runtime' ? t('badgeRuntime') : t('badgeStatic')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{t('title')}</h1>
          <p className="text-base text-slate-600 mt-1 max-w-3xl">{t('subtitle')}</p>
        </div>

        {/* Quick stats from the audit tree */}
        {stats && (
          <div className="flex items-center gap-4 bg-white p-2.5 px-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <div className="text-center pr-3 border-r border-slate-100">
              <p className="text-xs text-slate-500 font-medium">{t('statInteractive')}</p>
              <p className="text-lg font-bold text-slate-900">{stats.interactive}</p>
            </div>
            <div className="text-center pr-3 border-r border-slate-100">
              <p className="text-xs text-slate-500 font-medium">{t('statLandmarks')}</p>
              <p className="text-lg font-bold text-slate-900">{stats.landmarks}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium">{t('statHeadings')}</p>
              <p className="text-lg font-bold text-slate-900">{stats.headings}</p>
            </div>
          </div>
        )}
      </header>

      {/* Mode toggle: Static / Runtime */}
      <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
        <button
          onClick={() => { setToolMode('static'); trackToolModeChange('static'); }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            toolMode === 'static' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-pressed={toolMode === 'static'}
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">code</span>
          {t('modeStatic')}
        </button>
        <button
          onClick={() => { setToolMode('runtime'); trackToolModeChange('runtime'); }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            toolMode === 'runtime' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-pressed={toolMode === 'runtime'}
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">animation</span>
          {t('modeRuntime')}
        </button>
      </div>

      {toolMode === 'runtime' ? (
        <RuntimeSandbox />
      ) : (
      <>

      {/* Pro features banner */}
      {isPro && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-teal-600" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <div>
              <p className="text-sm font-semibold text-teal-900">{t('proBannerTitle')}</p>
              <p className="text-xs text-teal-700">{t('proBannerDescription')}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/docs/cicd-integration" className="text-xs font-semibold text-teal-700 bg-white px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors">
              {t('proBannerCicd')}
            </Link>
            <Link href="/docs/usage-guide" className="text-xs font-semibold text-teal-700 bg-white px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors">
              {t('proBannerGuide')}
            </Link>
          </div>
        </div>
      )}

      {/* Free tier upgrade nudge */}
      {isSignedIn && !isPro && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600" aria-hidden="true">upgrade</span>
            <p className="text-sm text-blue-800">{t('upgradeNudge')}</p>
          </div>
          <Link href="/pricing" className="text-xs font-semibold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shrink-0">
            {t('upgradeNudgeCta')}
          </Link>
        </div>
      )}

      {/* Input dock */}
      <section aria-label="Markup input and controls" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 space-y-4">
          {/* Templates row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              {diffMode ? 'After (new HTML)' : 'HTML Input'}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">{t('loadTemplate')}</span>
              {TEMPLATES.map((tpl) => (
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
            </div>
          </div>

          {/* Code input (after / main) */}
          <div className="relative rounded-xl border border-slate-200 bg-slate-900 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400">
              <label htmlFor="html-input" className="flex items-center gap-2 font-mono cursor-text">
                <span className="material-symbols-outlined text-[16px] text-blue-400" aria-hidden="true">html</span>
                <span>index.html</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500">HTML + ARIA</span>
                <button type="button" onClick={() => { setHtml(''); setActiveTemplate(null); }} className="text-slate-400 hover:text-slate-200 transition-colors" title={t('clearInput')} aria-label={t('clearInput')}>
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">backspace</span>
                </button>
              </div>
            </div>
            <textarea
              id="html-input"
              className="w-full h-[260px] p-4 font-mono text-xs sm:text-sm bg-slate-900 text-slate-100 placeholder-slate-500 border-none focus:ring-0 resize-y leading-relaxed"
              placeholder="Paste your HTML here, or load a template above…"
              spellCheck={false}
              value={html}
              onChange={(e) => { setHtml(e.target.value); setActiveTemplate(null); }}
            />
          </div>

          {/* Before input (diff mode) */}
          {diffMode && (
            <div className="relative rounded-xl border border-slate-200 bg-slate-900 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400">
                <label htmlFor="html-before" className="flex items-center gap-2 font-mono cursor-text">
                  <span className="material-symbols-outlined text-[16px] text-slate-500" aria-hidden="true">history</span>
                  <span>{t('beforeFileLabel')}</span>
                </label>
              </div>
              <textarea
                id="html-before"
                className="w-full h-[180px] p-4 font-mono text-xs sm:text-sm bg-slate-900 text-slate-100 placeholder-slate-500 border-none focus:ring-0 resize-y leading-relaxed"
                placeholder="Paste the original HTML here…"
                spellCheck={false}
                value={htmlBefore}
                onChange={(e) => setHtmlBefore(e.target.value)}
              />
            </div>
          )}

          {/* Controls */}
          <div className="pt-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Reader pills */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{t('screenReader')}:</span>
              <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200" role="group" aria-label="Screen reader">
                {READERS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleReaderChange(r)}
                    aria-pressed={screenReader === r}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      screenReader === r ? 'bg-white text-blue-600 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary controls + analyze */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="sr-only">CSS selector</span>
                <input
                  type="text"
                  className="h-9 w-44 text-xs border border-slate-300 rounded px-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('cssSelectorOptional')}
                  value={cssSelector}
                  onChange={(e) => setCssSelector(e.target.value)}
                />
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600" id="diff-label">{t('diffMode')}</span>
                <button type="button" role="switch" aria-checked={diffMode} aria-labelledby="diff-label"
                  onClick={() => { const next = !diffMode; setDiffMode(next); trackDiffToggle(next); }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${diffMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${diffMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept=".html,.htm" className="hidden" onChange={handleFileUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">upload_file</span>
                {t('uploadFile')}
              </button>
              <button type="button" onClick={handleAnalyze} disabled={loading} aria-busy={loading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">play_circle</span>
                {loading ? 'Analyzing…' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex items-start gap-3" role="alert">
          <span className="material-symbols-outlined text-red-600" aria-hidden="true">error</span>
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Results */}
      <section aria-label="Analysis results" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" aria-busy={loading}>
        {/* Left: announcement stream + voice player + tabs */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 bg-slate-50/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${result ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <h2 className="text-base font-bold text-slate-900">
                    {activeTab === 'announcements'
                      ? t('predictedAnnouncements', { reader: activeReaderLabel })
                      : TABS.find(tb => tb.id === activeTab)?.label}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{t('heuristicNote')}</p>
              </div>
              <div className="flex items-center gap-2">
                <VoiceControls
                  ref={voiceControlsRef}
                  text={panelContent}
                  lines={lines}
                  disabled={!result}
                  onLineChange={handleLineChange}
                  onModeChange={handleModeChange}
                />
                <button type="button"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all flex items-center justify-center leading-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  style={{ opacity: result ? 1 : 0.4, cursor: result ? 'pointer' : 'not-allowed' }}
                  aria-label="Copy to clipboard" aria-disabled={!result}
                  onClick={() => { if (result) { navigator.clipboard.writeText(panelContent); trackCopy(activeTab); } }}>
                  <span className="material-symbols-outlined text-[18px] leading-none block" aria-hidden="true">content_copy</span>
                </button>
                <button type="button"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all flex items-center justify-center leading-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  style={{ opacity: result ? 1 : 0.4, cursor: result ? 'pointer' : 'not-allowed' }}
                  aria-label="Download output" aria-disabled={!result}
                  onClick={() => { if (result) { downloadText(panelContent, `${activeTab}.txt`); trackDownload(activeTab); } }}>
                  <span className="material-symbols-outlined text-[18px] leading-none block" aria-hidden="true">download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-2 overflow-x-auto" role="tablist" aria-label="Analysis results">
            {TABS.map((tab) => {
              if (tab.id === 'diff' && !diffMode) return null;
              return (
                <button key={tab.id} role="tab" id={`tab-${tab.id}`}
                  aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`}
                  onClick={() => { setActiveTab(tab.id); trackTabSwitch(tab.id); }}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-slate-900 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Output panel */}
          <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}
            className="bg-gray-900 flex-grow overflow-auto min-h-[320px]">
            {result && lineByLineActive ? (
              <div
                ref={listboxRef}
                role="listbox"
                aria-label="Screen reader output — use arrow keys to navigate"
                tabIndex={0}
                onKeyDown={handleOutputKeyDown}
                className="p-6 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset"
              >
                {lines.map((line, i) => (
                  <div
                    key={i}
                    role="option"
                    aria-selected={i === currentLine}
                    onClick={() => handleLineClick(i)}
                    className={`font-mono text-sm py-0.5 cursor-pointer transition-colors ${
                      i === currentLine
                        ? 'text-green-300 bg-brand-500/10 border-l-2 border-brand-500 pl-2'
                        : 'text-green-400/70 pl-3 hover:bg-white/5'
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <pre className="font-mono text-sm leading-relaxed text-green-400 whitespace-pre-wrap">
                  {result
                    ? panelContent || '(empty)'
                    : <span className="text-gray-400 select-none">{'// '}{t('awaitingAnalysis')}</span>
                  }
                </pre>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-blue-50/70 border-t border-blue-100 flex items-center gap-1.5 text-xs text-blue-900">
            <span className="material-symbols-outlined text-[16px] text-blue-600" aria-hidden="true">lightbulb</span>
            <span>{t('tip')}</span>
          </div>
        </div>

        {/* Right: warnings / audit-status card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t('auditStatusTitle')}</h3>
                <p className="text-xs text-slate-500">{t('auditStatusSubtitle')}</p>
              </div>
              {result && result.warnings.length > 0 ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {result.warnings.length} warning{result.warnings.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {result ? t('statusNoIssues') : t('statusReady')}
                </span>
              )}
            </div>

            {result && result.warnings.length > 0 ? (
              <ul className="space-y-3">
                {result.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                    <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">warning</span>
                    <p className="text-xs text-amber-900">{w.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">check_circle</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">{t('parserStatus')} {t('noIssues')}</p>
                  <p className="text-xs text-slate-600">{t('auditReadyHint')}</p>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button type="button" onClick={() => { setActiveTab('audit'); trackTabSwitch('audit'); }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1" disabled={!result}
                style={{ opacity: result ? 1 : 0.5 }}>
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">fact_check</span>
                {t('viewAuditReport')}
              </button>
              <button type="button"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                aria-disabled={!result} style={{ opacity: result ? 1 : 0.5 }}
                onClick={() => { if (result) { downloadText(panelContent, `${activeTab}.txt`); trackDownload(activeTab); } }}>
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">file_download</span>
                {t('downloadOutput')}
              </button>
            </div>
          </div>
        </div>
      </section>

      </>
      )}
      </div>
    </div>
    </div>
    </PageFadeIn>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

const LANDMARK_ROLES = new Set(['navigation', 'main', 'banner', 'contentinfo', 'complementary', 'region', 'form', 'search']);
const INTERACTIVE_ROLES = new Set(['button', 'link', 'textbox', 'checkbox', 'radio', 'combobox', 'listbox', 'option']);

/** Derive header stat counts from the analysis result's JSON models. */
function getStats(result: AnalysisResult | null): { interactive: number; landmarks: number; headings: number } | null {
  if (!result) return null;
  const stats = { interactive: 0, landmarks: 0, headings: 0 };

  const walk = (node: { role?: string; children?: unknown[] } | null | undefined) => {
    if (!node || typeof node !== 'object') return;
    const role = node.role;
    if (role) {
      if (INTERACTIVE_ROLES.has(role)) stats.interactive++;
      if (LANDMARK_ROLES.has(role)) stats.landmarks++;
      if (role === 'heading') stats.headings++;
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child as { role?: string; children?: unknown[] });
    }
  };

  for (const e of result.entries) {
    try {
      const model = JSON.parse(e.json) as { root?: { role?: string; children?: unknown[] } };
      walk(model.root);
    } catch {
      // JSON not parseable for this entry — skip its contribution to stats.
    }
  }
  return stats;
}

function getPanelContent(tab: TabId, result: AnalysisResult | null, sr: ScreenReaderOption): string {
  if (!result) return '';
  const entries = result.entries;

  switch (tab) {
    case 'announcements': {
      return entries.map((e, i) => {
        const prefix = entries.length > 1 ? `=== Element ${i + 1} ===\n` : '';
        if (sr === 'All') {
          return prefix + [
            `--- NVDA ---\n${e.announcements.nvda}`,
            `--- JAWS ---\n${e.announcements.jaws}`,
            `--- VoiceOver ---\n${e.announcements.voiceover}`,
            `--- Narrator ---\n${e.announcements.narrator}`,
          ].join('\n\n');
        }
        const map: Record<ScreenReaderOption, string> = {
          NVDA: e.announcements.nvda,
          JAWS: e.announcements.jaws,
          VoiceOver: e.announcements.voiceover,
          Narrator: e.announcements.narrator,
          All: '',
        };
        return prefix + map[sr];
      }).join('\n\n');
    }
    case 'audit':
      return entries.map((e) => e.audit).join('\n\n---\n\n');
    case 'json':
      return entries.map((e) => e.json).join('\n\n---\n\n');
    case 'diff': {
      if (!result.diff) return 'No diff available.';
      if (result.diff.changes.length === 0) return 'No changes detected.';
      const header = `+${result.diff.summary.added} added  -${result.diff.summary.removed} removed  ~${result.diff.summary.changed} changed\n\n`;
      return header + result.diff.changes.map((c) => {
        const prefix = c.type === 'added' ? '+ ' : c.type === 'removed' ? '- ' : '~ ';
        return prefix + describeChange(c);
      }).join('\n');
    }
    default:
      return '';
  }
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
