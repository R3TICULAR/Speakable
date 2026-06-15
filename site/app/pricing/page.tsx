'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ScrollReveal } from '../../components/ScrollReveal';

type TierFeature = {
  textKey: string;
  bold?: boolean;
};

type Tier = {
  id: string;
  nameKey: string;
  priceKey: string;
  hasPriceSuffix?: boolean;
  features: TierFeature[];
  ctaKey: string;
  recommended: boolean;
};

const TIERS: Tier[] = [
  {
    id: 'free',
    nameKey: 'tierFreeName',
    priceKey: 'tierFreePrice',
    features: [
      { textKey: 'featureUnlimitedWeb' },
      { textKey: 'featureSingleFile' },
      { textKey: 'featureAllScreenReaders' },
      { textKey: 'featureAuditReport' },
      { textKey: 'featureExtension' },
      { textKey: 'featureRuntimePlayground' },
      { textKey: 'featureTimelineViewer' },
    ],
    ctaKey: 'ctaFree',
    recommended: false,
  },
  {
    id: 'pro',
    nameKey: 'tierProName',
    priceKey: 'tierProPrice',
    hasPriceSuffix: true,
    features: [
      { textKey: 'featureEverythingFree', bold: true },
      { textKey: 'featureBatch' },
      { textKey: 'featureSemanticDiff' },
      { textKey: 'featureCicd' },
      { textKey: 'featureStorybook' },
      { textKey: 'featureRuntimeAnalysis' },
      { textKey: 'featureBaselines' },
      { textKey: 'featureTimelineHistory' },
      { textKey: 'featurePrioritySupport' },
    ],
    ctaKey: 'ctaPro',
    recommended: true,
  },
  {
    id: 'team-enterprise',
    nameKey: 'tierTeamName',
    priceKey: 'tierTeamPrice',
    features: [
      { textKey: 'featureEverythingPro', bold: true },
      { textKey: 'featureTeamDashboards' },
      { textKey: 'featureCustomRules' },
      { textKey: 'featureRuntimeRegression' },
      { textKey: 'featureAutoBaselines' },
      { textKey: 'featurePrEnforcement' },
      { textKey: 'featureOrgStorybook' },
      { textKey: 'featureSso' },
      { textKey: 'featureSla' },
      { textKey: 'featureVolume' },
    ],
    ctaKey: 'ctaTeam',
    recommended: false,
  },
];

const FAQ_ITEMS = [
  {
    question: 'What is runtime accessibility analysis?',
    answer:
      'Runtime analysis observes how your components behave in a live browser environment, tracking focus movement, ARIA state changes, and dynamic content updates as users interact with your UI. It complements static HTML analysis by surfacing issues that only appear during interaction.',
  },
  {
    question: 'What can I do for free?',
    answer:
      'The free tier includes full screen reader simulation, audit reports, the browser extension, and access to the runtime accessibility playground and timeline viewer. You can analyze single files via CLI and use the web tool without limits.',
  },
  {
    question: 'How does this relate to manual testing?',
    answer:
      'Speakable is designed to complement manual testing with real assistive technologies, not replace it. Automated analysis helps catch common issues earlier in development, reducing the volume of problems found during manual QA passes.',
  },
  {
    question: 'Are screen reader features restricted on any plan?',
    answer:
      'No. All screen reader support (NVDA, JAWS, VoiceOver, Narrator) is available on every tier, including the free plan. Paid plans add workflow automation, CI/CD integration, and team collaboration features.',
  },
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = useTranslations('pricingPage');

  const handleCta = async (tierId: string) => {
    if (tierId === 'free') {
      router.push('/tool');
      return;
    }

    if (tierId === 'team-enterprise') {
      window.location.href = 'mailto:xreticular@gmail.com';
      return;
    }

    // Pro tier: need auth
    if (!isSignedIn) {
      router.push('/sign-up');
      return;
    }

    setLoading(tierId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // Checkout failed
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScrollReveal>
    <div className="flex-grow pb-24">
      {/* Page header */}
      <section className="max-w-4xl mx-auto text-center pt-12 mb-12 px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">{t('title')}</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </section>

      {/* Runtime analysis intro */}
      <section className="max-w-4xl mx-auto mb-16 px-6">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-8 md:p-10">
          <div className="flex items-start gap-4 mb-4">
            <span className="material-symbols-outlined text-blue-600 text-2xl mt-0.5" aria-hidden="true">speed</span>
            <h2 className="text-2xl font-bold text-slate-900">
              Accessibility Doesn&apos;t Stop at Static HTML
            </h2>
          </div>
          <p className="text-slate-600 leading-relaxed max-w-3xl ml-10">
            Modern web apps change state, move focus, and update content dynamically.
            Runtime accessibility analysis tracks how your components behave in a live
            browser: focus shifts, ARIA attribute changes, live region announcements,
            and interaction sequences. Combined with static analysis, it gives you a
            fuller picture of the assistive technology experience.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch px-6">
        {TIERS.map((tier) => (
          <div key={tier.id}
            className={`flex flex-col p-8 bg-white rounded-xl transition-shadow ${
              tier.recommended ? 'border-2 border-blue-600 shadow-xl relative md:scale-105 z-10' : 'border border-slate-200 hover:shadow-lg focus-within:z-20'
            }`}>
            {tier.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                {t('recommended')}
              </div>
            )}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-2">{t(tier.nameKey)}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">{t(tier.priceKey)}</span>
                {tier.hasPriceSuffix && <span className="text-slate-500 font-medium">{t('priceSuffix')}</span>}
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              {tier.features.map((f) => (
                <li key={f.textKey} className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-teal-600 text-lg ${f.bold ? 'font-bold' : ''}`} aria-hidden="true">check_circle</span>
                  <span className={`text-sm ${f.bold ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{t(f.textKey)}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCta(tier.id)}
              disabled={loading === tier.id}
              className={`w-full py-3 px-4 rounded-lg font-bold text-center transition-all active:scale-95 disabled:opacity-60 ${
                tier.recommended
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                  : 'border-2 border-slate-200 text-slate-900 hover:bg-slate-50'
              }`}>
              {loading === tier.id ? t('loading') : t(tier.ctaKey)}
            </button>
          </div>
        ))}
      </div>

      {/* Screen reader info banner */}
      <div className="max-w-4xl mx-auto mt-16 text-center px-6">
        <div className="inline-flex items-center gap-2 bg-teal-50 px-6 py-4 rounded-xl border border-teal-100">
          <span className="material-symbols-outlined text-teal-600" aria-hidden="true">info</span>
          <p className="text-sm text-slate-700 leading-relaxed text-left">
            {t('screenReaderInfo')}
          </p>
        </div>
      </div>

      {/* FAQ section */}
      <section className="max-w-3xl mx-auto mt-24 px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">
          Frequently Asked Questions
        </h2>
        <dl className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              <dt>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900">{item.question}</span>
                  <span
                    className="material-symbols-outlined text-slate-400 transition-transform"
                    aria-hidden="true"
                    style={{ transform: openFaq === index ? 'rotate(180deg)' : undefined }}
                  >
                    expand_more
                  </span>
                </button>
              </dt>
              {openFaq === index && (
                <dd className="px-6 pb-5 text-sm text-slate-600 leading-relaxed">
                  {item.answer}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </section>
    </div>
    </ScrollReveal>
  );
}
