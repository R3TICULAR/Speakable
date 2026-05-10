'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { splitIntoUtterances, type QueuedUtterance } from '../lib/splitIntoUtterances';
import { getLanguageTag, DEFAULT_LOCALE } from '../lib/locale';

export type PlaybackState = 'idle' | 'playing' | 'paused';

export interface SpeechOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  lang?: string;
  linePauseMs?: number;
  sectionPauseMs?: number;
}

export interface UseSpeechSynthesisReturn {
  state: PlaybackState;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  rate: number;
  currentLine: number;
  totalLines: number;
  lines: string[];
  play: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  setRate: (rate: number) => void;
  setLines: (text: string) => void;
  speakLine: (index: number) => void;
  nextLine: () => void;
  prevLine: () => void;
}

function clampRate(r: number): number {
  return Math.min(2.0, Math.max(0.5, r));
}

export function useSpeechSynthesis(options?: SpeechOptions): UseSpeechSynthesisReturn {
  const [state, setState] = useState<PlaybackState>('idle');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(
    options?.voice ?? null
  );
  const [rate, setRateState] = useState<number>(clampRate(options?.rate ?? 1.0));
  const [currentLine, setCurrentLine] = useState(0);
  const [totalLines, setTotalLines] = useState(0);
  const [lines, setLinesState] = useState<string[]>([]);

  const linePauseMs = options?.linePauseMs ?? 300;
  const sectionPauseMs = options?.sectionPauseMs ?? 600;
  const lang = options?.lang ?? getLanguageTag(DEFAULT_LOCALE);

  // Mutable refs for playback state (avoid re-renders during speech)
  const queueRef = useRef<QueuedUtterance[]>([]);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(selectedVoice);
  const rateRef = useRef(rate);
  const stateRef = useRef<PlaybackState>('idle');

  // Keep refs in sync
  voiceRef.current = selectedVoice;
  rateRef.current = rate;
  stateRef.current = state;

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const speakNext = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const queue = queueRef.current;
    const idx = indexRef.current;

    if (idx >= queue.length) {
      setState('idle');
      stateRef.current = 'idle';
      return;
    }

    const item = queue[idx];
    const utterance = new SpeechSynthesisUtterance(item.text);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.rate = rateRef.current;
    utterance.lang = lang;

    utterance.onend = () => {
      indexRef.current = idx + 1;
      setCurrentLine(idx + 1);

      if (item.pauseAfterMs > 0 && idx + 1 < queue.length) {
        timerRef.current = setTimeout(speakNext, item.pauseAfterMs);
      } else {
        speakNext();
      }
    };

    utterance.onerror = (event) => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        indexRef.current = idx + 1;
        setCurrentLine(idx + 1);
        speakNext();
      }
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const play = useCallback((text: string) => {
    if (!text?.trim() || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);

    const queue = splitIntoUtterances(text, linePauseMs, sectionPauseMs);
    const parsedLines = text.split('\n').filter(l => l.trim());

    queueRef.current = queue;
    indexRef.current = 0;
    setCurrentLine(0);
    setTotalLines(queue.length);
    setLinesState(parsedLines);
    setState('playing');
    stateRef.current = 'playing';

    speakNext();
  }, [linePauseMs, sectionPauseMs, speakNext]);

  const pause = useCallback(() => {
    if (stateRef.current !== 'playing') return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    setState('paused');
    stateRef.current = 'paused';
  }, []);

  const resume = useCallback(() => {
    if (stateRef.current !== 'paused') return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
    setState('playing');
    stateRef.current = 'playing';
  }, []);

  const stop = useCallback(() => {
    if (stateRef.current === 'idle') return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    indexRef.current = 0;
    setCurrentLine(0);
    setState('idle');
    stateRef.current = 'idle';
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
  }, []);

  const setRate = useCallback((r: number) => {
    setRateState(clampRate(r));
  }, []);

  const setLines = useCallback((text: string) => {
    const parsedLines = text.split('\n').filter(l => l.trim());
    setLinesState(parsedLines);
    setTotalLines(parsedLines.length);
    setCurrentLine(0);
    indexRef.current = 0;
  }, []);

  const speakLine = useCallback((index: number) => {
    const currentLines = lines.length > 0 ? lines : [];
    if (index < 0 || index >= currentLines.length) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);

    const utterance = new SpeechSynthesisUtterance(currentLines[index]);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.rate = rateRef.current;
    utterance.lang = lang;

    utterance.onend = () => {
      setState('idle');
      stateRef.current = 'idle';
    };

    utterance.onerror = (event) => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        setState('idle');
        stateRef.current = 'idle';
      }
    };

    indexRef.current = index;
    setCurrentLine(index);
    setState('playing');
    stateRef.current = 'playing';
    window.speechSynthesis.speak(utterance);
  }, [lines]);

  const nextLine = useCallback(() => {
    const max = lines.length - 1;
    if (indexRef.current >= max) return;
    speakLine(indexRef.current + 1);
  }, [lines, speakLine]);

  const prevLine = useCallback(() => {
    if (indexRef.current <= 0) return;
    speakLine(indexRef.current - 1);
  }, [speakLine]);

  return {
    state,
    voices,
    selectedVoice,
    rate,
    currentLine,
    totalLines,
    lines,
    play,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
    setLines,
    speakLine,
    nextLine,
    prevLine,
  };
}
