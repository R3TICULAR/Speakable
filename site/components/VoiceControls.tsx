'use client';

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export type SpeechMode = 'play-all' | 'line-by-line';

export interface VoiceControlsHandle {
  /** Speak a single line by index */
  speakLine: (index: number) => void;
  /** Move to and speak the next line */
  nextLine: () => void;
  /** Move to and speak the previous line */
  prevLine: () => void;
  /** Stop all speech */
  stop: () => void;
  /** Play all text from the beginning */
  play: (text: string) => void;
}

export interface VoiceControlsProps {
  /** The text content to speak */
  text: string;
  /** The parsed lines for line-by-line mode */
  lines: string[];
  /** Whether there is any result to speak */
  disabled?: boolean;
  /** Callback when line-by-line mode changes the active line */
  onLineChange?: (index: number) => void;
  /** Callback when mode changes */
  onModeChange?: (mode: SpeechMode | null) => void;
}

export const VoiceControls = forwardRef<VoiceControlsHandle, VoiceControlsProps>(function VoiceControls({
  text,
  lines,
  disabled = false,
  onLineChange,
  onModeChange,
}, ref) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SpeechMode | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const speech = useSpeechSynthesis();

  // Expose speech methods to parent via ref
  useImperativeHandle(ref, () => ({
    speakLine: speech.speakLine,
    nextLine: speech.nextLine,
    prevLine: speech.prevLine,
    stop: speech.stop,
    play: speech.play,
  }), [speech.speakLine, speech.nextLine, speech.prevLine, speech.stop, speech.play]);

  const speechUnavailable =
    typeof window !== 'undefined' && !window.speechSynthesis;
  const isDisabled = disabled || speechUnavailable;

  // Sync line changes to parent
  useEffect(() => {
    if (mode === 'line-by-line') {
      onLineChange?.(speech.currentLine);
    }
  }, [speech.currentLine, mode, onLineChange]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Focus first menu item when dropdown opens
  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
      // Defer focus to next tick so DOM is rendered
      requestAnimationFrame(() => {
        menuItemsRef.current[0]?.focus();
      });
    } else {
      setFocusedIndex(-1);
    }
  }, [open]);

  const toggleDropdown = useCallback(() => {
    if (isDisabled) return;
    setOpen((prev) => !prev);
  }, [isDisabled]);

  const handleSelectMode = useCallback(
    (newMode: SpeechMode) => {
      if (newMode === mode) {
        // Deselect — stop everything
        speech.stop();
        setMode(null);
        onModeChange?.(null);
        setOpen(false);
        return;
      }

      setMode(newMode);
      onModeChange?.(newMode);
      setOpen(false);

      if (newMode === 'play-all') {
        speech.play(text);
      } else if (newMode === 'line-by-line') {
        speech.setLines(text);
        onLineChange?.(0);
      }
    },
    [mode, text, speech, onModeChange, onLineChange],
  );

  const handlePause = useCallback(() => {
    if (speech.state === 'playing') {
      speech.pause();
    } else if (speech.state === 'paused') {
      speech.resume();
    }
  }, [speech]);

  const handleStop = useCallback(() => {
    speech.stop();
    setMode(null);
    onModeChange?.(null);
  }, [speech, onModeChange]);

  const handleVoiceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const voiceName = e.target.value;
      const voice =
        speech.voices.find((v) => v.name === voiceName) ?? null;
      speech.setVoice(voice);
    },
    [speech],
  );

  const handleRateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      speech.setRate(parseFloat(e.target.value));
    },
    [speech],
  );

  // Keyboard navigation for the menu
  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = menuItemsRef.current.filter(Boolean) as HTMLElement[];
      const count = items.length;
      if (count === 0) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = (focusedIndex + 1) % count;
          setFocusedIndex(next);
          items[next]?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = (focusedIndex - 1 + count) % count;
          setFocusedIndex(prev);
          items[prev]?.focus();
          break;
        }
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          buttonRef.current?.focus();
          break;
        case 'Tab':
          setOpen(false);
          break;
      }
    },
    [focusedIndex],
  );

  // Button keyboard handler
  const handleButtonKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isDisabled) setOpen(true);
      }
    },
    [isDisabled],
  );

  const setMenuItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      menuItemsRef.current[index] = el;
    },
    [],
  );

  // When play-all finishes, reset mode
  useEffect(() => {
    if (mode === 'play-all' && speech.state === 'idle' && speech.totalLines > 0 && speech.currentLine >= speech.totalLines) {
      setMode(null);
      onModeChange?.(null);
    }
  }, [speech.state, speech.currentLine, speech.totalLines, mode, onModeChange]);

  // Determine which view to render
  const currentMode: SpeechMode | null = mode;
  const showPlayAllControls = currentMode === 'play-all' && speech.state !== 'idle';
  const showLineByLineControls = currentMode === 'line-by-line';
  const isPlayAllChecked = currentMode === 'play-all';
  const isLineByLineChecked = currentMode === 'line-by-line';

  // ── Inline playback controls (Play All active) ──
  if (showPlayAllControls) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handlePause}
          aria-label={speech.state === 'playing' ? 'Pause speech' : 'Resume speech'}
          className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded transition-all flex items-center justify-center leading-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
        >
          <span
            className="material-symbols-outlined text-[18px] leading-none block"
            aria-hidden="true"
          >
            {speech.state === 'playing' ? 'pause' : 'play_arrow'}
          </span>
        </button>
        <button
          type="button"
          onClick={handleStop}
          aria-label="Stop speech"
          className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded transition-all flex items-center justify-center leading-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
        >
          <span
            className="material-symbols-outlined text-[18px] leading-none block"
            aria-hidden="true"
          >
            stop
          </span>
        </button>
        <span className="text-xs font-mono text-foreground-muted ml-1" aria-live="polite">
          {speech.currentLine + 1}/{speech.totalLines}
        </span>
      </div>
    );
  }

  // ── Inline line-by-line indicator ──
  if (showLineByLineControls) {
    return (
      <div className="flex items-center gap-1">
        <span
          className="material-symbols-outlined text-[18px] leading-none text-accent-600"
          aria-hidden="true"
        >
          keyboard
        </span>
        <span className="text-xs font-mono text-foreground-muted" aria-live="polite">
          {speech.currentLine + 1}/{lines.length}
        </span>
        <button
          type="button"
          onClick={handleStop}
          aria-label="Exit line-by-line mode"
          className="p-1 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded transition-all flex items-center justify-center leading-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ml-1"
        >
          <span
            className="material-symbols-outlined text-[16px] leading-none block"
            aria-hidden="true"
          >
            close
          </span>
        </button>
      </div>
    );
  }

  // ── Default: dropdown trigger ──
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleButtonKeyDown}
        disabled={isDisabled}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Voice controls"
        title={speechUnavailable ? 'Speech not supported in this browser' : undefined}
        className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded transition-all flex items-center justify-center leading-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:bg-transparent"
      >
        <span
          className="material-symbols-outlined text-[18px] leading-none block"
          aria-hidden="true"
        >
          volume_up
        </span>
        <span
          className="material-symbols-outlined text-[14px] leading-none block -ml-0.5"
          aria-hidden="true"
        >
          arrow_drop_down
        </span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Voice playback options"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden"
        >
          {/* Play All */}
          <div
            ref={setMenuItemRef(0)}
            role="menuitemradio"
            aria-checked={isPlayAllChecked}
            tabIndex={-1}
            onClick={() => handleSelectMode('play-all')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectMode('play-all');
              }
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-brand-50 cursor-pointer transition-colors outline-none focus:bg-brand-50"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              play_arrow
            </span>
            <span className="flex-1">Play All</span>
            {isPlayAllChecked && (
              <span
                className="material-symbols-outlined text-[18px] text-brand-600"
                aria-hidden="true"
              >
                check
              </span>
            )}
          </div>

          {/* Line-by-Line */}
          <div
            ref={setMenuItemRef(1)}
            role="menuitemradio"
            aria-checked={isLineByLineChecked}
            tabIndex={-1}
            onClick={() => handleSelectMode('line-by-line')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectMode('line-by-line');
              }
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-brand-50 cursor-pointer transition-colors outline-none focus:bg-brand-50"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              keyboard
            </span>
            <span className="flex-1">Line-by-Line</span>
            {isLineByLineChecked && (
              <span
                className="material-symbols-outlined text-[18px] text-brand-600"
                aria-hidden="true"
              >
                check
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" role="separator" />

          {/* Voice selector */}
          <div className="px-4 py-2.5">
            <label
              htmlFor="voice-select"
              className="block text-xs font-medium text-foreground-muted mb-1"
            >
              Voice
            </label>
            <select
              id="voice-select"
              aria-label="Select voice"
              value={speech.selectedVoice?.name ?? ''}
              onChange={handleVoiceChange}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-foreground"
            >
              <option value="">Default</option>
              {speech.voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed slider */}
          <div className="px-4 py-2.5">
            <label
              htmlFor="speed-slider"
              className="block text-xs font-medium text-foreground-muted mb-1"
            >
              Speed: {speech.rate.toFixed(1)}x
            </label>
            <input
              id="speed-slider"
              type="range"
              aria-label="Speech speed"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speech.rate}
              onChange={handleRateChange}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-foreground-subtle mt-0.5">
              <span>0.5x</span>
              <span>2.0x</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
