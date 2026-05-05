'use client';

import { useState, useEffect, useRef } from 'react';

// HTML that produces distinctive differences across all 3 readers:
// - Landmarks: NVDA="navigation landmark", JAWS="navigation region", VO="navigation"
// - Headings: NVDA/JAWS="name, heading level N", VO="heading level N, name"
// - Disabled: NVDA/JAWS="unavailable", VO="dimmed"
// - Images: NVDA/JAWS="graphic", VO="image"
const HTML_LINES = [
  '<nav aria-label="Docs">',
  '  <h2>Getting Started</h2>',
  '  <img src="logo.svg" alt="Speakable" />',
  '  <button disabled>Upgrade</button>',
  '</nav>',
];

const SR_OUTPUTS: { reader: string; color: string; lines: string[] }[] = [
  {
    reader: 'NVDA',
    color: 'text-green-400',
    lines: [
      'Docs, navigation landmark',
      '  Getting Started, heading level 2',
      '  Speakable, graphic',
      '  Upgrade, button, unavailable',
    ],
  },
  {
    reader: 'JAWS',
    color: 'text-cyan-400',
    lines: [
      'Docs, navigation region',
      '  Getting Started, heading level 2',
      '  Speakable, graphic',
      '  Upgrade, button, unavailable',
    ],
  },
  {
    reader: 'VoiceOver',
    color: 'text-purple-400',
    lines: [
      'navigation, Docs',
      '  heading level 2, Getting Started',
      '  Speakable, image',
      '  Upgrade, button, dimmed',
    ],
  },
];

type Phase = 'typing' | 'analyzing' | 'output';

export function HeroAnimation() {
  const [phase, setPhase] = useState<Phase>('typing');
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [outputVisible, setOutputVisible] = useState(0); // number of output lines revealed
  const [reducedMotion, setReducedMotion] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalOutputLines = SR_OUTPUTS.reduce((sum, s) => sum + s.lines.length + 1, 0); // +1 for headers

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // If reduced motion, show final state immediately
  useEffect(() => {
    if (reducedMotion) {
      setPhase('output');
      setTypedLines(HTML_LINES);
      setOutputVisible(totalOutputLines);
    }
  }, [reducedMotion, totalOutputLines]);

  // Typing phase
  useEffect(() => {
    if (reducedMotion || phase !== 'typing') return;

    let lineIdx = 0;
    let charIdx = 0;
    const lines: string[] = [];

    intervalRef.current = setInterval(() => {
      if (lineIdx >= HTML_LINES.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => setPhase('analyzing'), 400);
        return;
      }

      const currentLine = HTML_LINES[lineIdx];
      charIdx++;

      if (charIdx > currentLine.length) {
        lines.push(currentLine);
        setTypedLines([...lines]);
        lineIdx++;
        charIdx = 0;
      } else {
        setTypedLines([...lines, currentLine.slice(0, charIdx)]);
      }
    }, 28);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, reducedMotion]);

  // Analyzing phase
  useEffect(() => {
    if (phase !== 'analyzing') return;
    const timer = setTimeout(() => setPhase('output'), 1200);
    return () => clearTimeout(timer);
  }, [phase]);

  // Output phase — reveal lines one by one
  useEffect(() => {
    if (reducedMotion || phase !== 'output') return;

    let count = 0;
    const timer = setInterval(() => {
      count++;
      setOutputVisible(count);
      if (count >= totalOutputLines) {
        clearInterval(timer);
      }
    }, 120);

    return () => clearInterval(timer);
  }, [phase, reducedMotion, totalOutputLines]);

  // Restart loop
  useEffect(() => {
    if (reducedMotion) return;
    if (phase === 'output' && outputVisible >= totalOutputLines) {
      const timer = setTimeout(() => {
        setPhase('typing');
        setTypedLines([]);
        setOutputVisible(0);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [phase, outputVisible, totalOutputLines, reducedMotion]);

  // Build the flat output list with section headers
  const flatOutput: { text: string; color: string; isHeader: boolean }[] = [];
  for (const section of SR_OUTPUTS) {
    flatOutput.push({ text: `--- ${section.reader} ---`, color: 'text-slate-500', isHeader: true });
    for (const line of section.lines) {
      flatOutput.push({ text: line, color: section.color, isHeader: false });
    }
  }

  return (
    <div
      className="bg-slate-900 rounded-xl shadow-2xl p-4 border border-slate-800 overflow-hidden"
      role="img"
      aria-label="Animation showing Speakable analyzing HTML and predicting output for NVDA, JAWS, and VoiceOver — each with distinct announcement patterns for landmarks, headings, images, and disabled states"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
        <div className="w-3 h-3 rounded-full bg-red-500" aria-hidden="true" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" aria-hidden="true" />
        <div className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
        <div className="ml-4 text-xs font-mono text-slate-400">
          {phase === 'output' ? 'output — All Readers' : 'index.html'}
        </div>
        {phase === 'analyzing' && (
          <div className="ml-auto flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span className="text-xs font-mono text-blue-400">analyzing...</span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="min-h-[220px] py-2 px-2" aria-hidden="true">
        {(phase === 'typing' || phase === 'analyzing') && (
          <div className="space-y-1">
            {typedLines.map((line, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-slate-600 font-mono text-xs w-4 text-right shrink-0">{i + 1}</span>
                <code className="text-blue-400 font-mono text-xs">{line}</code>
              </div>
            ))}
            {phase === 'typing' && typedLines.length < HTML_LINES.length && (
              <span className="inline-block w-[6px] h-[14px] bg-blue-400 animate-pulse ml-7" />
            )}
          </div>
        )}

        {phase === 'output' && (
          <div className="space-y-0.5">
            {flatOutput.slice(0, outputVisible).map((item, i) => (
              <div
                key={i}
                className={`flex gap-3 animate-[fadeSlideIn_200ms_ease-out_forwards] ${item.isHeader ? 'mt-2 first:mt-0' : ''}`}
              >
                {!item.isHeader && (
                  <span className="text-slate-700 font-mono text-xs w-4 text-right shrink-0">{'›'}</span>
                )}
                <code className={`font-mono text-xs ${item.color} ${item.isHeader ? 'font-semibold ml-7' : ''}`}>
                  {item.text}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
