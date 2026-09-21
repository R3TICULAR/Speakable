#!/bin/bash
# Build the Speakable browser extension.
#
# Produces extension/content.js by concatenating the shared Speakable browser
# bundle (IIFE, which assigns window.__SPEAKABLE__) with the content-script
# wrapper (extension/content.src.js). This means the extension analyzes the
# LIVE page DOM using the exact same engine as the CLI and Storybook addon.
#
# Run from the repo root: bash extension/build.sh

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXT="$ROOT/extension"
BUNDLE="$ROOT/dist/speakable-browser.global.js"

echo "Building Speakable core browser bundle..."
npm --prefix "$ROOT" run build >/dev/null 2>&1 || npx --prefix "$ROOT" tsup

if [ ! -f "$BUNDLE" ]; then
  echo "ERROR: expected bundle not found at $BUNDLE" >&2
  exit 1
fi

echo "Assembling extension/content.js (bundle + content wrapper)..."
{
  echo "/* AUTO-GENERATED. Do not edit. Source: extension/content.src.js + dist/speakable-browser.global.js */"
  cat "$BUNDLE"
  echo ""
  cat "$EXT/content.src.js"
} > "$EXT/content.js"

echo "Done. extension/content.js is ready to load as an unpacked extension."
