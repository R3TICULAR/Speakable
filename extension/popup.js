/**
 * Speakable Browser Extension — Popup Script
 *
 * Communicates with the content script to get page HTML,
 * then runs the Speakable analysis pipeline and displays results.
 * Integrates SpeechPlayer for voice playback of analysis output.
 * Uses chrome.i18n for localization support.
 */

// --- i18n Initialization ---
// Apply translations to all elements with data-i18n attributes
function initI18n() {
  // Text content
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.textContent = msg;
    }
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.setAttribute('placeholder', msg);
    }
  });

  // Titles
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) {
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.setAttribute('title', msg);
    }
  });

  // Aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (key) {
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.setAttribute('aria-label', msg);
    }
  });

  // Set HTML lang to match extension locale
  document.documentElement.lang = chrome.i18n.getUILanguage();
}

// Run i18n on load
initI18n();

// --- Helper: get i18n message with fallback ---
function msg(key, substitutions) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

// --- DOM References ---
const analyzeBtn = document.getElementById('analyze-btn');
const readerSelect = document.getElementById('reader-select');
const formatSelect = document.getElementById('format-select');
const selectorInput = document.getElementById('selector-input');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const outputEl = document.getElementById('output');
const resultsTitleEl = document.getElementById('results-title');
const copyBtn = document.getElementById('copy-btn');
const pageInfoEl = document.getElementById('page-info');
const pageTitleEl = document.getElementById('page-title');
const pageUrlEl = document.getElementById('page-url');

// Voice control elements
const voiceControlsEl = document.getElementById('voice-controls');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const progressEl = document.getElementById('progress');
const voiceSelect = document.getElementById('voice-select');
const rateSlider = document.getElementById('rate-slider');
const rateValueEl = document.getElementById('rate-value');

// --- SpeechPlayer integration ---
let player = null;
if (typeof window.SpeechPlayer === 'function') {
  player = new window.SpeechPlayer({
    lang: chrome.i18n.getUILanguage(),
    onStateChange(state) {
      updateVoiceControlsUI(state);
    },
    onLineChange(current, total) {
      if (total > 0) {
        progressEl.textContent = `${current + 1}/${total}`;
        progressEl.classList.remove('hidden');
      } else {
        progressEl.classList.add('hidden');
      }
    },
  });
}

function updateVoiceControlsUI(state) {
  if (state === 'playing') {
    playBtn.textContent = '⏸';
    playBtn.title = msg('voicePause');
    playBtn.setAttribute('aria-label', msg('voicePause'));
    stopBtn.classList.remove('hidden');
    progressEl.classList.remove('hidden');
  } else if (state === 'paused') {
    playBtn.textContent = '▶';
    playBtn.title = msg('voiceResume');
    playBtn.setAttribute('aria-label', msg('voiceResume'));
    stopBtn.classList.remove('hidden');
    progressEl.classList.remove('hidden');
  } else {
    playBtn.textContent = '▶';
    playBtn.title = msg('voicePlay');
    playBtn.setAttribute('aria-label', msg('voicePlay'));
    stopBtn.classList.add('hidden');
    progressEl.classList.add('hidden');
  }
}

function showVoiceControls() {
  if (!player) return;
  voiceControlsEl.classList.remove('hidden');
  populateVoiceSelector();
}

function hideVoiceControls() {
  if (!player) return;
  voiceControlsEl.classList.add('hidden');
  player.stop();
}

function populateVoiceSelector() {
  if (!player) return;
  const voices = player.getVoices();
  while (voiceSelect.options.length > 1) {
    voiceSelect.remove(1);
  }
  voices.forEach((voice, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}

// Voice control event listeners
if (player) {
  playBtn.addEventListener('click', () => {
    const state = player.state;
    if (state === 'idle') {
      const text = outputEl.textContent;
      if (text && text.trim()) player.play(text);
    } else if (state === 'playing') {
      player.pause();
    } else if (state === 'paused') {
      player.resume();
    }
  });

  stopBtn.addEventListener('click', () => {
    player.stop();
  });

  voiceSelect.addEventListener('change', () => {
    const idx = voiceSelect.value;
    if (idx === '') {
      player.setVoice(null);
    } else {
      const voices = player.getVoices();
      player.setVoice(voices[parseInt(idx, 10)] || null);
    }
  });

  rateSlider.addEventListener('input', () => {
    const rate = parseFloat(rateSlider.value);
    player.setRate(rate);
    rateValueEl.textContent = `${rate.toFixed(1)}x`;
  });

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      if (!voiceControlsEl.classList.contains('hidden')) {
        populateVoiceSelector();
      }
    });
  }
}

// --- Status helpers ---
function showStatus(message, type = 'loading') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.classList.remove('hidden');
}

function hideStatus() {
  statusEl.classList.add('hidden');
}

function showResults(text, title) {
  resultsTitleEl.textContent = title || msg('resultsTitle');
  outputEl.textContent = text;
  resultsEl.classList.remove('hidden');
  showVoiceControls();
}

function hideResults() {
  resultsEl.classList.add('hidden');
  hideVoiceControls();
}

function showPageInfo(title, url) {
  pageTitleEl.textContent = title;
  pageUrlEl.textContent = url;
  pageInfoEl.classList.remove('hidden');
}

// Copy to clipboard
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputEl.textContent).then(() => {
    copyBtn.textContent = '✓';
    setTimeout(() => { copyBtn.textContent = '📋'; }, 1500);
  });
});

// Main analyze handler
analyzeBtn.addEventListener('click', async () => {
  const reader = readerSelect.value;
  const format = formatSelect.value;
  const selector = selectorInput.value.trim() || null;

  hideResults();
  showStatus(msg('statusAnalyzing'), 'loading');
  analyzeBtn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      showStatus(msg('statusNoTab'), 'error');
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'GET_PAGE_HTML',
      selector,
    });

    if (!response?.success) {
      showStatus(response?.error || msg('statusFailed'), 'error');
      return;
    }

    showPageInfo(response.title, response.url);

    const result = window.SpeakableAnalyzer.analyze(
      response.html,
      reader,
      format,
      selector
    );

    if (result.warnings.length > 0) {
      console.warn('Speakable warnings:', result.warnings);
    }

    hideStatus();

    const scope = selector
      ? msg('scopeSelector', [selector, String(result.elementCount)])
      : msg('scopeFullPage');
    showStatus(msg('statusComplete', [scope]), 'success');
    showResults(result.output, `${reader.toUpperCase()} — ${format}`);

  } catch (err) {
    showStatus(msg('statusError', [err.message]), 'error');
  } finally {
    analyzeBtn.disabled = false;
  }
});
