'use client';

import Link from 'next/link';
import { RelatedPages } from '../../../components/RelatedPages';

const pipelineStages = [
  { icon: 'code', title: 'Component Creation', desc: 'Define expected screen reader output in specs', delay: '0ms' },
  { icon: 'palette', title: 'Storybook Development', desc: 'Runtime analysis captures behavior timelines per story', delay: '200ms' },
  { icon: 'device_hub', title: 'Pull Request', desc: 'Semantic diff detects accessibility regressions before merge', delay: '400ms' },
  { icon: 'deployed_code', title: 'CI/CD Pipeline', desc: 'Automated baselines catch behavior changes across builds', delay: '600ms' },
];

const adoptionSteps = [
  { num: 1, title: 'Start with one component', desc: 'Run Speakable on your most-used component' },
  { num: 2, title: 'Expand to your library', desc: 'Add Storybook integration for all stories' },
  { num: 3, title: 'Enforce in CI', desc: 'Baseline all components and fail builds on regressions' },
  { num: 4, title: 'Share across teams', desc: 'Component consumers inherit verified accessibility' },
];

const catchExamples = [
  { issue: 'Modal opens without moving focus', feature: 'Heuristic Warning', icon: 'error', iconColor: 'text-red-500' },
  { issue: 'Combobox stops announcing selected option', feature: 'Timeline Diff', icon: 'warning', iconColor: 'text-amber-500' },
  { issue: 'Tab order changes after refactor', feature: 'Focus Regression', icon: 'error', iconColor: 'text-red-500' },
  { issue: 'Button loses accessible name', feature: 'Static Audit', icon: 'warning', iconColor: 'text-amber-500' },
  { issue: 'Accordion stops announcing expanded state', feature: 'State Change Diff', icon: 'error', iconColor: 'text-red-500' },
  { issue: "Dialog doesn't return focus on close", feature: 'Heuristic Warning', icon: 'warning', iconColor: 'text-amber-500' },
];

export default function DesignSystemsPage() {
  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseOnce {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Design Systems</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Speakable for Design Systems
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          How to integrate accessibility testing into your component library workflow, from component
          creation through team-wide consumption.
        </p>
      </header>

      {/* Section 1: The Cost of Late Discovery */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">The Cost of Late Discovery</h2>

        <p className="text-slate-600 mb-6 leading-relaxed">
          Finding a missing aria-label during component development takes 30 seconds to fix. Finding
          it in production after a user complaint involves triage, sprint planning, regression testing,
          and redeployment.
        </p>

        {/* Stat callout cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 border border-green-200 rounded-xl bg-green-50 text-center">
            <p className="text-2xl font-bold text-green-700">30 seconds</p>
            <p className="text-sm text-green-600 mt-1">Fix during dev</p>
          </div>
          <div className="p-5 border border-orange-200 rounded-xl bg-orange-50 text-center">
            <p className="text-2xl font-bold text-orange-700">2-4 hours</p>
            <p className="text-sm text-orange-600 mt-1">Fix during QA</p>
          </div>
          <div className="p-5 border border-red-200 rounded-xl bg-red-50 text-center">
            <p className="text-2xl font-bold text-red-700">1-2 sprints</p>
            <p className="text-sm text-red-600 mt-1">Fix in production</p>
          </div>
        </div>
      </section>

      {/* Section 2: Where Speakable Fits */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Where Speakable Fits</h2>

        <div className="space-y-4">
          {pipelineStages.map((stage, i) => (
            <div key={stage.title} className="flex items-start gap-4">
              <div
                className="flex flex-col items-center"
                style={{ animation: `fadeSlideUp 600ms ease-out ${stage.delay} both` }}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-600 text-lg" aria-hidden="true">
                    {stage.icon}
                  </span>
                </div>
                {i < pipelineStages.length - 1 && (
                  <div className="w-px h-6 bg-blue-200 mt-1" />
                )}
              </div>
              <div
                className="pt-1.5"
                style={{ animation: `fadeSlideUp 600ms ease-out ${stage.delay} both` }}
              >
                <p className="text-sm font-bold text-slate-900">{stage.title}</p>
                <p className="text-sm text-slate-600 mt-0.5">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Storybook Integration */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Storybook Integration</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable connects to your running Storybook, discovers all stories, and runs runtime
          analysis per component variant. You get an accessibility timeline for every story: focus
          events, state changes, and announcements captured during interaction.
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-950 p-5 mb-6 overflow-x-auto">
          <pre className="text-sm text-slate-100 leading-relaxed">
            <code>speakable runtime http://localhost:6006 --storybook</code>
          </pre>
        </div>

        {/* Mock story results */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Story Results</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm font-medium text-slate-900">Button</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                0 warnings
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm font-medium text-slate-900">Dialog</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                1 warning
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm font-medium text-slate-900">Combobox</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                0 warnings
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Component-Level Regression Detection */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Component-Level Regression Detection</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable stores baseline timelines per story and compares them on every PR. When behavior
          diverges, you see exactly what changed before it reaches users.
        </p>

        {/* Animated diff visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-xl border border-slate-200 bg-white p-4"
            style={{ animation: 'slideInLeft 500ms ease-out both' }}
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Previous Build</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-50 text-slate-600">focus: "Submit" button</div>
              <div className="p-2 rounded bg-slate-50 text-slate-600">focus: "Email" textbox</div>
              <div className="p-2 rounded bg-slate-50 text-slate-600">focus: "Cancel" button</div>
            </div>
          </div>
          <div
            className="rounded-xl border border-slate-200 bg-white p-4"
            style={{ animation: 'slideInRight 500ms ease-out both' }}
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Current Build</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-50 text-slate-600">focus: "Submit" button</div>
              <div
                className="p-2 rounded bg-red-50 border border-red-200 text-red-700"
                style={{ animation: 'pulseOnce 800ms ease-out 700ms both' }}
              >
                focus: "body" (unexpected)
              </div>
              <div className="p-2 rounded bg-slate-50 text-slate-600">focus: "Cancel" button</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Team-Wide Adoption */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Team-Wide Adoption</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adoptionSteps.map((step) => (
            <div
              key={step.num}
              className="p-5 border border-slate-200 rounded-xl bg-white"
              style={{ animation: `fadeSlideUp 500ms ease-out ${(step.num - 1) * 150}ms both` }}
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center shrink-0">
                  {step.num}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{step.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: What Teams Catch */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">What Teams Catch</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {catchExamples.map((ex) => (
            <div key={ex.issue} className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl bg-white">
              <span className={`material-symbols-outlined ${ex.iconColor} mt-0.5 shrink-0 text-lg`} aria-hidden="true">
                {ex.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{ex.issue}</p>
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {ex.feature}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <RelatedPages
        pages={[
          {
            href: '/docs/runtime-analysis',
            title: 'Runtime Analysis',
            description: 'Capture accessibility timelines during component interaction to detect runtime behavior issues.',
          },
          {
            href: '/docs/testing-strategy',
            title: 'Testing Strategy',
            description: 'Build a comprehensive accessibility testing program that catches issues early.',
          },
          {
            href: '/docs/component-patterns',
            title: 'Component Patterns',
            description: 'Accessible patterns for common UI components including dialogs, comboboxes, and tabs.',
          },
          {
            href: '/docs/cicd-integration',
            title: 'CI/CD Integration',
            description: 'Automate accessibility checks in your continuous integration pipeline.',
          },
        ]}
      />
    </>
  );
}
