export default function McpIntegrationPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">MCP Integration</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">MCP Integration</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Use Speakable as a Model Context Protocol (MCP) server to give AI coding assistants
          real-time accessibility analysis capabilities directly in your editor.
        </p>
      </header>

      {/* What is MCP */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What is MCP?</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The Model Context Protocol is an open standard that lets AI assistants call external
          tools during conversations. When you connect Speakable as an MCP server, your AI
          assistant can analyze HTML accessibility on demand, no copy-pasting into a separate tool.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            Ask your AI assistant things like &quot;check if this component is accessible&quot; or
            &quot;what would a screen reader say for this HTML&quot; and it will call Speakable
            automatically to give you the answer.
          </p>
        </div>
      </section>

      {/* Available Tools */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Tools</h2>
        <div className="space-y-6">
          <div className="p-6 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-3 mb-3">
              <code className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">analyze_html</code>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Predict how NVDA, JAWS, and VoiceOver will announce HTML content. Returns the
              predicted speech output line by line.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-4 font-bold text-slate-900">Parameter</th>
                    <th className="py-2 pr-4 font-bold text-slate-900">Type</th>
                    <th className="py-2 font-bold text-slate-900">Description</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 font-mono">
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">html</td>
                    <td className="py-2 pr-4 font-sans">string (required)</td>
                    <td className="py-2 font-sans">The HTML content to analyze</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">screen_reader</td>
                    <td className="py-2 pr-4 font-sans">enum (optional)</td>
                    <td className="py-2 font-sans">nvda, jaws, voiceover, or all (default: all)</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">selector</td>
                    <td className="py-2 pr-4 font-sans">string (optional)</td>
                    <td className="py-2 font-sans">CSS selector to focus on specific elements</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-3 mb-3">
              <code className="text-sm font-mono font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">audit_html</code>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Generate an accessibility audit report. Reports landmark structure, heading hierarchy,
              interactive elements, missing names, and issues with severity levels.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-4 font-bold text-slate-900">Parameter</th>
                    <th className="py-2 pr-4 font-bold text-slate-900">Type</th>
                    <th className="py-2 font-bold text-slate-900">Description</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 font-mono">
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">html</td>
                    <td className="py-2 pr-4 font-sans">string (required)</td>
                    <td className="py-2 font-sans">The HTML content to audit</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">selector</td>
                    <td className="py-2 pr-4 font-sans">string (optional)</td>
                    <td className="py-2 font-sans">CSS selector to focus on specific elements</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center gap-3 mb-3">
              <code className="text-sm font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">diff_html</code>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Compare two HTML versions and report accessibility changes. Shows added, removed,
              and changed nodes — useful for detecting regressions before merging.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-4 font-bold text-slate-900">Parameter</th>
                    <th className="py-2 pr-4 font-bold text-slate-900">Type</th>
                    <th className="py-2 font-bold text-slate-900">Description</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 font-mono">
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">before_html</td>
                    <td className="py-2 pr-4 font-sans">string (required)</td>
                    <td className="py-2 font-sans">The original HTML content</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">after_html</td>
                    <td className="py-2 pr-4 font-sans">string (required)</td>
                    <td className="py-2 font-sans">The updated HTML content</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">selector</td>
                    <td className="py-2 pr-4 font-sans">string (optional)</td>
                    <td className="py-2 font-sans">CSS selector to focus on specific elements</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Setup by IDE */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Setup</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Add Speakable to your MCP configuration. The server runs locally via{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">npx</code> — no
          global installation required.
        </p>

        {/* Kiro */}
        <h3 className="text-lg font-bold text-slate-900 mb-3">Kiro</h3>
        <p className="text-slate-600 mb-3 text-sm">
          Add to <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">.kiro/settings/mcp.json</code> in
          your workspace or <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">~/.kiro/settings/mcp.json</code> globally:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-8">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">mcp.json</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`{
  "mcpServers": {
    "speakable": {
      "command": "npx",
      "args": ["-y", "@reticular/speakable-mcp"],
      "disabled": false,
      "autoApprove": ["analyze_html", "audit_html", "diff_html"]
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* VS Code / Cursor */}
        <h3 className="text-lg font-bold text-slate-900 mb-3">VS Code / Cursor</h3>
        <p className="text-slate-600 mb-3 text-sm">
          Add to <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">.vscode/mcp.json</code> in your workspace:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-8">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">.vscode/mcp.json</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`{
  "servers": {
    "speakable": {
      "command": "npx",
      "args": ["-y", "@reticular/speakable-mcp"]
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* Claude Desktop */}
        <h3 className="text-lg font-bold text-slate-900 mb-3">Claude Desktop</h3>
        <p className="text-slate-600 mb-3 text-sm">
          Add to <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS)
          or <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">%APPDATA%/Claude/claude_desktop_config.json</code> (Windows):
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-8">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">claude_desktop_config.json</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`{
  "mcpServers": {
    "speakable": {
      "command": "npx",
      "args": ["-y", "@reticular/speakable-mcp"]
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* Windsurf */}
        <h3 className="text-lg font-bold text-slate-900 mb-3">Windsurf</h3>
        <p className="text-slate-600 mb-3 text-sm">
          Add to <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">~/.codeium/windsurf/mcp_config.json</code>:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-8">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">mcp_config.json</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`{
  "mcpServers": {
    "speakable": {
      "command": "npx",
      "args": ["-y", "@reticular/speakable-mcp"]
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* Global install alternative */}
        <h3 className="text-lg font-bold text-slate-900 mb-3">Alternative: Global Install</h3>
        <p className="text-slate-600 mb-3 text-sm">
          If you prefer not to use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">npx</code>,
          install globally and reference the binary directly:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`npm install -g @reticular/speakable`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-3 text-sm">
          Then use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">{`"command": "speakable-mcp"`}</code> in
          your config instead of the npx variant.
        </p>
      </section>

      {/* Example Usage */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Example Usage</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Once configured, your AI assistant can call Speakable tools naturally during conversation.
        </p>

        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
            <div className="px-4 py-2 bg-white/5 border-b border-white/10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">You ask</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-300 italic">&quot;Check if this button is accessible:&quot;</p>
              <pre className="text-xs font-mono text-blue-300 mt-2">{`<button><svg>...</svg></button>`}</pre>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
            <div className="px-4 py-2 bg-emerald-900/30 border-b border-emerald-800/30">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Speakable responds via MCP</span>
            </div>
            <div className="p-4">
              <pre className="text-xs font-mono text-green-400">{`--- NVDA ---
button

--- JAWS ---
button

--- VoiceOver ---
button

Warnings:
Button has no accessible name. Add aria-label or visible text.`}</pre>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
            <div className="px-4 py-2 bg-white/5 border-b border-white/10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">AI assistant explains</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-300">
                &quot;The button has no accessible name — screen readers will just say &apos;button&apos; with no
                context. Add an aria-label to fix it:&quot;
              </p>
              <pre className="text-xs font-mono text-emerald-300 mt-2">{`<button aria-label="Close dialog"><svg>...</svg></button>`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <p>Your AI assistant receives HTML in the conversation (from a file, your question, or generated code).</p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <p>It calls the Speakable MCP tool with the HTML content via JSON-RPC over stdio.</p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">3.</span>
            <p>Speakable runs the full analysis pipeline locally (parse → extract → render) and returns predicted screen reader output.</p>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">4.</span>
            <p>The assistant uses the output to identify issues, suggest fixes, or confirm accessibility correctness.</p>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tips</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-teal-600 mt-0.5 shrink-0" aria-hidden="true">lightbulb</span>
            <p className="text-sm text-slate-600">
              Use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">autoApprove</code> in
              Kiro to skip confirmation prompts for Speakable tools — they only read HTML and never modify files.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-teal-600 mt-0.5 shrink-0" aria-hidden="true">lightbulb</span>
            <p className="text-sm text-slate-600">
              The MCP server runs the same engine as the CLI and web tool — identical output, zero network requests, fully local.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-teal-600 mt-0.5 shrink-0" aria-hidden="true">lightbulb</span>
            <p className="text-sm text-slate-600">
              Use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">diff_html</code> to
              check if a refactor changed screen reader output before committing.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
