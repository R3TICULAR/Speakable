import { getTranslations } from 'next-intl/server';

export default async function UsageGuidePage() {
  const t = await getTranslations('usageGuide');

  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">{t('breadcrumb')}</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{t('title')}</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          {t('subtitle')}
        </p>
      </header>

      {/* Installation */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('installation.heading')}</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          {t('installation.description')}
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># Install as a project dependency</span>{'\n'}
                <span className="text-blue-400">npm install</span>{' '}
                <span className="text-emerald-400">@reticular/speakable</span>{'\n\n'}
                <span className="text-slate-500"># Or install globally for CLI access</span>{'\n'}
                <span className="text-blue-400">npm install -g</span>{' '}
                <span className="text-emerald-400">@reticular/speakable</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* CLI Commands */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('cliCommands.heading')}</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          {t('cliCommands.description')}
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># Basic analysis (JSON output, NVDA by default)</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{'\n\n'}
                <span className="text-slate-500"># Choose output format: json, text, audit, or both</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-f text</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-f json</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-f audit</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-f both</span>{'\n\n'}
                <span className="text-slate-500"># Choose screen reader: nvda, jaws, voiceover, narrator, or all</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-s nvda</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-s jaws</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-s voiceover</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-s narrator</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-s all</span>{'\n\n'}
                <span className="text-slate-500"># Filter to specific elements with a CSS selector</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">--selector &quot;button&quot;</span>{'\n\n'}
                <span className="text-slate-500"># Compare two HTML files (semantic diff)</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">new.html</span>{' '}
                <span className="text-orange-300">--diff old.html</span>{'\n\n'}
                <span className="text-slate-500"># Batch process multiple files</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-orange-300">--batch</span>{' '}
                <span className="text-emerald-400">file1.html file2.html file3.html</span>{'\n\n'}
                <span className="text-slate-500"># Write output to a file</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-o output.json</span>{'\n\n'}
                <span className="text-slate-500"># Read from stdin</span>{'\n'}
                <span className="text-blue-400">cat</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-slate-300">|</span>{' '}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-orange-300">-</span>{'\n\n'}
                <span className="text-slate-500"># Validate round-trip serialization</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">--validate</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Output Formats */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('outputFormats.heading')}</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          {t('outputFormats.description')}
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4 font-bold text-slate-900">Format</th>
                <th className="py-3 pr-4 font-bold text-slate-900">Flag</th>
                <th className="py-3 pr-4 font-bold text-slate-900">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">JSON</td>
                <td className="py-3 pr-4 font-mono">-f json</td>
                <td className="py-3">Canonical accessibility model as deterministic JSON. Best for CI/CD, snapshot testing, and programmatic comparison.</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">Text</td>
                <td className="py-3 pr-4 font-mono">-f text</td>
                <td className="py-3">Screen reader announcement text. Shows what each reader would say, line by line. Human-readable.</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">Audit</td>
                <td className="py-3 pr-4 font-mono">-f audit</td>
                <td className="py-3">Structured report with landmark structure, heading hierarchy, interactive elements, detected issues (error/warning/info), and summary statistics.</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">Both</td>
                <td className="py-3 pr-4 font-mono">-f both</td>
                <td className="py-3">JSON model and screen reader text combined in a single output.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pro Features */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('proFeatures.heading')}</h2>
        <div className="space-y-6">
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">{t('proFeatures.batch.title')}</h3>
            <p className="text-sm text-slate-600 mb-2">
              {t('proFeatures.batch.description')}
            </p>
            <code className="text-xs font-mono text-slate-500">speakable --batch file1.html file2.html file3.html</code>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">{t('proFeatures.diff.title')}</h3>
            <p className="text-sm text-slate-600 mb-2">
              {t('proFeatures.diff.description')}
            </p>
            <code className="text-xs font-mono text-slate-500">speakable new.html --diff old.html</code>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">{t('proFeatures.cicd.title')}</h3>
            <p className="text-sm text-slate-600 mb-2">
              {t('proFeatures.cicd.description')}
            </p>
            <code className="text-xs font-mono text-slate-500">npx @reticular/speakable page.html -f audit</code>
          </div>
        </div>
      </section>

      {/* Web Analyzer */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('webAnalyzer.heading')}</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          {t('webAnalyzer.description')}
        </p>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 mb-4">
          <li>{t('webAnalyzer.steps.0')}</li>
          <li>{t('webAnalyzer.steps.1')}</li>
          <li>{t('webAnalyzer.steps.2')}</li>
          <li>{t('webAnalyzer.steps.3')}</li>
        </ol>
        <p className="text-slate-600 leading-relaxed mb-4">
          {t('webAnalyzer.diffNote')}
        </p>
        <p className="text-slate-600 leading-relaxed">
          {t('webAnalyzer.voiceNote')}
        </p>
      </section>

      {/* Voice Announcer */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('voiceAnnouncer.heading')}</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          {t('voiceAnnouncer.description')}
        </p>
        <div className="space-y-6">
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">{t('voiceAnnouncer.playAll.title')}</h3>
            <p className="text-sm text-slate-600">
              {t('voiceAnnouncer.playAll.description')}
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">{t('voiceAnnouncer.lineByLine.title')}</h3>
            <p className="text-sm text-slate-600 mb-2">
              {t('voiceAnnouncer.lineByLine.description')}
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-4 font-bold text-slate-900">Key</th>
                    <th className="py-2 font-bold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 font-mono">
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">↓ / j</td>
                    <td className="py-2 font-sans">Move to next line and speak it</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">↑ / k</td>
                    <td className="py-2 font-sans">Move to previous line and speak it</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">Enter / Space</td>
                    <td className="py-2 font-sans">Play all from current line</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-4">Escape</td>
                    <td className="py-2 font-sans">Stop speech and exit line-by-line mode</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">{t('voiceAnnouncer.voiceSpeed.title')}</h3>
            <p className="text-sm text-slate-600">
              {t('voiceAnnouncer.voiceSpeed.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('bestPractices.heading')}</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="text-emerald-500 font-bold text-lg leading-tight">1.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">{t('bestPractices.0.title')}</p>
              <p className="text-slate-600 text-sm">{t('bestPractices.0.description')}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-500 font-bold text-lg leading-tight">2.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">{t('bestPractices.1.title')}</p>
              <p className="text-slate-600 text-sm">
                {t('bestPractices.1.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-500 font-bold text-lg leading-tight">3.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">{t('bestPractices.2.title')}</p>
              <p className="text-slate-600 text-sm">
                {t('bestPractices.2.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-500 font-bold text-lg leading-tight">4.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">{t('bestPractices.3.title')}</p>
              <p className="text-slate-600 text-sm">
                {t('bestPractices.3.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-500 font-bold text-lg leading-tight">5.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">{t('bestPractices.4.title')}</p>
              <p className="text-slate-600 text-sm">
                {t('bestPractices.4.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
