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
      { textKey: 'featureCicd' },
      { textKey: 'featureSemanticDiff' },
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
      { textKey: 'featureSso' },
      { textKey: 'featureSla' },
      { textKey: 'featureVolume' },
    ],
    ctaKey: 'ctaTeam',
    recommended: false,
  },
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
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

    // Pro tier — need auth
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
      <section className="max-w-4xl mx-auto text-center pt-12 mb-16 px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">{t('title')}</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </section>

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

      <div className="max-w-4xl mx-auto mt-16 text-center px-6">
        <div className="inline-flex items-center gap-2 bg-teal-50 px-6 py-4 rounded-xl border border-teal-100">
          <span className="material-symbols-outlined text-teal-600" aria-hidden="true">info</span>
          <p className="text-sm text-slate-700 leading-relaxed text-left">
            {t('screenReaderInfo')}
          </p>
        </div>
      </div>
    </div>
    </ScrollReveal>
  );
}
