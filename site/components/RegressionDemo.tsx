'use client';

import { useState, useEffect } from 'react';

type Step = 'change' | 'ci' | 'caught';

export function RegressionDemo() {
  const [step, setStep] = useState<Step>('change');
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Auto-advance steps with fade transitions and slower timing
  useEffect(() => {
    if (reducedMotion) {
      setStep('caught');
      setVisible(true);
      return;
    }

    const FADE_DURATION = 700;
    const STEP_DURATIONS: Record<Step, number> = {
      change: 7000,
      ci: 6000,
      caught: 8000,
    };
    const sequence: Step[] = ['change', 'ci', 'caught'];
    let currentIdx = 0;
    let timeout: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      const currentStep = sequence[currentIdx];
      timeout = setTimeout(() => {
        // Fade out
        setVisible(false);
        // After fade out, switch step and fade in
        setTimeout(() => {
          currentIdx = (currentIdx + 1) % sequence.length;
          setStep(sequence[currentIdx]);
          setVisible(true);
          scheduleNext();
        }, FADE_DURATION);
      }, STEP_DURATIONS[currentStep]);
    }

    setStep('change');
    setVisible(true);
    scheduleNext();

    return () => clearTimeout(timeout);
  }, [reducedMotion]);

  const fadeClass = reducedMotion
    ? ''
    : `transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div
      className="relative bg-white p-1 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full"
      role="img"
      aria-label="Demo showing a code change that removes an aria-label from a button, Speakable catching the regression in CI, and the diff output showing the accessibility name was lost"
    >
      <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800 h-10 overflow-hidden">
        <div className="flex gap-1.5 shrink-0" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <div className={`ml-4 text-[10px] text-slate-500 font-mono tracking-tight uppercase truncate ${fadeClass}`}>
          {step === 'change' && 'PR #247 — Refactor checkout button'}
          {step === 'ci' && 'GitHub Actions — a11y check running...'}
          {step === 'caught' && 'CI Failed — Accessibility regression detected'}
        </div>
        <div className="ml-auto shrink-0 w-14 flex justify-end">
          {step === 'ci' && visible && (
            <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          )}
          {step === 'caught' && visible && (
            <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded">FAILED</span>
          )}
        </div>
      </div>

      <div className={`p-5 bg-slate-950 h-[260px] overflow-hidden ${fadeClass}`} aria-hidden="true">
        {/* Step 1: The code change */}
        {step === 'change' && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Code diff</div>
            <div className="space-y-1 font-mono text-xs">
              <div className="text-slate-500 pl-4">{'// checkout/Button.tsx'}</div>
              <div className="bg-rose-500/10 border-l-2 border-rose-500 pl-3 py-0.5 text-rose-300">
                {'- <button aria-label="Complete purchase">'}
              </div>
              <div className="bg-rose-500/10 border-l-2 border-rose-500 pl-3 py-0.5 text-rose-300">
                {'-   <CartIcon /> Pay ${total}'}
              </div>
              <div className="bg-rose-500/10 border-l-2 border-rose-500 pl-3 py-0.5 text-rose-300">
                {'- </button>'}
              </div>
              <div className="bg-emerald-500/10 border-l-2 border-emerald-500 pl-3 py-0.5 text-emerald-300">
                {'+ <button className={styles.payBtn}>'}
              </div>
              <div className="bg-emerald-500/10 border-l-2 border-emerald-500 pl-3 py-0.5 text-emerald-300">
                {'+   <CartIcon />'}
              </div>
              <div className="bg-emerald-500/10 border-l-2 border-emerald-500 pl-3 py-0.5 text-emerald-300">
                {'+ </button>'}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <p className="text-[10px] text-slate-500">Developer removed aria-label during refactor. Visible text also lost.</p>
            </div>
          </div>
        )}

        {/* Step 2: CI running */}
        {step === 'ci' && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">CI Pipeline</div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="text-slate-400">Build succeeded</span>
                <span className="text-slate-600 ml-auto">12s</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="text-slate-400">Unit tests passed (142/142)</span>
                <span className="text-slate-600 ml-auto">8s</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="text-slate-400">Lint passed</span>
                <span className="text-slate-600 ml-auto">3s</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-amber-400">Running speakable --diff baseline.html...</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Regression caught */}
        {step === 'caught' && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-3">
              Regression detected — announcement changed
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 font-mono text-xs space-y-1.5">
              <div className="text-slate-500">{'speakable checkout.html --diff baseline.html'}</div>
              <div className="text-slate-400 mt-2">{'Changed: button'}</div>
              <div className="text-rose-400 pl-4">{'- name: "Complete purchase"'}</div>
              <div className="text-rose-400 pl-4">{'- announcement: "Complete purchase, button"'}</div>
              <div className="text-emerald-400 pl-4">{'+ name: ""'}</div>
              <div className="text-emerald-400 pl-4">{'+ announcement: "button"'}</div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 mt-3">
              <p className="text-[11px] text-rose-300 font-medium">
                Screen reader users would hear &quot;button&quot; with no context.
                The accessible name was lost during refactor.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-500">Exit code 2</span>
              <span className="text-[10px] text-slate-600">•</span>
              <span className="text-[10px] text-slate-500">PR blocked until resolved</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
