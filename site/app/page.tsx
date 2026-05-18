import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { DiffPreview } from '../components/DiffPreview';
import { CrossPlatformPreview } from '../components/CrossPlatformPreview';
import { ScrollReveal } from '../components/ScrollReveal';
import { HeroAnimation } from '../components/HeroAnimation';
import { RegressionDemo } from '../components/RegressionDemo';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const pkgVersion = JSON.parse(
  readFileSync(resolve(process.cwd(), '../package.json'), 'utf-8')
).version;

const FEATURE_ICONS = ['devices', 'assignment_turned_in', 'difference', 'terminal'];
const WORKFLOW_ICONS = ['terminal', 'rebase', 'deployed_code', 'monitoring'];
const TEAM_ICONS = ['groups', 'fact_check', 'shield', 'account_tree'];

export default async function LandingPage() {
  const t = await getTranslations('landing');

  return (
    <>
      {/* Hero Section */}
      <ScrollReveal>
      <section className="pt-12 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 mb-6">
              {t('hero.badge', { version: pkgVersion })}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/tool"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg shadow-blue-200 transition-all active:scale-95 text-center"
              >
                {t('hero.ctaTool')}
              </Link>
              <Link
                href="/docs"
                className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded flex items-center justify-center gap-2 transition-all"
              >
                {t('hero.ctaDocs')}
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <HeroAnimation />
            <div
              className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-3xl opacity-50"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Features Grid */}
      <ScrollReveal>
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('features.heading')}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t('features.subheading')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURE_ICONS.map((icon, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-xl transition-shadow group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                    {icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{t(`features.${i}.title`)}</h3>
                <p className="text-slate-600">{t(`features.${i}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Workflow Section */}
      <ScrollReveal>
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              {t('workflow.heading')}
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              {t('workflow.subheading')}
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" aria-hidden="true" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {WORKFLOW_ICONS.map((icon, i) => (
                <div
                  key={i}
                  className="group flex flex-col items-center lg:items-start bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:border-teal-100 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                      {icon}
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-2 py-1 rounded">
                      {t(`workflow.steps.${i}.stage`)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{t(`workflow.steps.${i}.title`)}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed text-center lg:text-left">
                    {t(`workflow.steps.${i}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DiffPreview />
            </div>
            <div className="bg-teal-600 rounded-3xl p-8 flex flex-col justify-between text-white">
              <div>
                <span className="material-symbols-outlined text-4xl mb-4" aria-hidden="true">bolt</span>
                <h4 className="text-2xl font-bold mb-4">{t('workflow.speedUp.title')}</h4>
                <p className="text-teal-50 opacity-90 leading-relaxed">
                  {t('workflow.speedUp.description')}
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/docs"
                  className="bg-white text-teal-700 px-6 py-3 rounded-xl font-bold w-full block text-center hover:bg-teal-50 transition-colors"
                >
                  {t('workflow.speedUp.cta')}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
            </div>
            <p className="text-slate-600 text-sm italic text-center md:text-left">
              {t('workflow.disclaimer')}
            </p>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Enterprise Section */}
      <ScrollReveal>
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-bold mb-6">
              <span className="material-symbols-outlined text-xs" aria-hidden="true">
                verified
              </span>
              {t('enterprise.badge')}
            </div>
            <h2 className="text-4xl font-bold mb-6">
              {t('enterprise.heading')}
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              {t('enterprise.description')}
            </p>
            <ul className="space-y-4 mb-10">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-teal-500" aria-hidden="true">
                    check_circle
                  </span>
                  <span>{t(`enterprise.points.${i}`)}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold">{t('enterprise.stat1.value')}</div>
                <div className="text-slate-400 text-sm">{t('enterprise.stat1.label')}</div>
              </div>
              <div className="h-12 w-px bg-slate-800" aria-hidden="true" />
              <div>
                <div className="text-3xl font-bold">{t('enterprise.stat2.value')}</div>
                <div className="text-slate-400 text-sm">{t('enterprise.stat2.label')}</div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 relative group">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
              <img
                alt={t('enterprise.imageAlt')}
                className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                src="/images/cli-colored-output.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Teams Section */}
      <ScrollReveal>
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              {TEAM_ICONS.map((icon, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-600 transition-all">
                    <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                      {icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{t(`teams.${i}.title`)}</h3>
                    <p className="text-slate-600 leading-relaxed">{t(`teams.${i}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative lg:h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-50 rounded-3xl -rotate-2" aria-hidden="true" />
              <RegressionDemo />
            </div>
          </div>

          <div className="mt-24 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
              {t('teams.heading')}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
              {t('teams.subheading')}
            </p>
            <div className="inline-flex items-center gap-2 text-teal-700 font-bold hover:gap-3 transition-all">
              <Link href="/docs" className="flex items-center gap-2">
                {t('teams.cta')}
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Why It Matters Section */}
      <ScrollReveal>
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-teal-50/50 border border-teal-200/30 rounded-3xl p-8 md:p-16 text-center shadow-sm">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl" aria-hidden="true" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-8">
                <span className="material-symbols-outlined text-3xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
                {t('whyItMatters.heading')}
              </h2>
              <div className="max-w-2xl mx-auto space-y-6">
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                  {t('whyItMatters.paragraph1')}
                </p>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed opacity-90">
                  {t('whyItMatters.paragraph2')}
                </p>
              </div>
              <div className="mt-12 pt-8 border-t border-teal-200/40 max-w-lg mx-auto">
                <p className="text-sm font-medium text-teal-700 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">gavel</span>
                  {t('whyItMatters.legal')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 flex flex-col justify-center border border-slate-200">
            <span className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-4">{t('whyItMatters.challenge.label')}</span>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('whyItMatters.challenge.title')}</h3>
            <p className="text-slate-600">
              {t('whyItMatters.challenge.description')}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <CrossPlatformPreview />
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Final CTA Section */}
      <ScrollReveal>
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">
            {t('cta.heading')}
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/pricing"
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded shadow-xl shadow-blue-200 transition-all active:scale-95 text-center"
            >
              {t('cta.pricing')}
            </Link>
            <Link
              href="/docs"
              className="px-10 py-5 bg-teal-700 hover:bg-teal-800 text-white text-lg font-bold rounded transition-all active:scale-95 text-center"
            >
              {t('cta.docs')}
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>
    </>
  );
}
