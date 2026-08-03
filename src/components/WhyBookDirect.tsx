import { useRef, useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

/* ── Comparison rows ──────────────────────────────────────────────── */
const COMPARISON_ROWS: {
    labelKey: TranslationKey;
    directKey: TranslationKey;
    platformKey: TranslationKey;
    /** true = show check/cross icons instead of text */
    isBoolean?: boolean;
}[] = [
    {
        labelKey: 'whyDirect.row.price',
        directKey: 'whyDirect.row.priceDirect',
        platformKey: 'whyDirect.row.pricePlatform',
    },
    {
        labelKey: 'whyDirect.row.serviceFee',
        directKey: 'whyDirect.row.serviceFeeDirect',
        platformKey: 'whyDirect.row.serviceFeePlatform',
    },
    {
        labelKey: 'whyDirect.row.contact',
        directKey: 'whyDirect.row.contactDirect',
        platformKey: 'whyDirect.row.contactPlatform',
    },
    {
        labelKey: 'whyDirect.row.bestPrice',
        directKey: 'whyDirect.row.bestPrice',
        platformKey: 'whyDirect.row.bestPrice',
        isBoolean: true,
    },
    {
        labelKey: 'whyDirect.row.localTips',
        directKey: 'whyDirect.row.localTips',
        platformKey: 'whyDirect.row.localTips',
        isBoolean: true,
    },
];

/* ── Check / Cross icons ─────────────────────────────────────────── */
function CheckIcon() {
    return (
        <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    );
}

function CrossIcon() {
    return (
        <svg className="h-5 w-5 text-red-400/70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export default function WhyBookDirect() {
    const { t } = useI18n();
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            id="why-book-direct"
            ref={sectionRef}
            className="relative overflow-hidden bg-sand-light py-20 sm:py-28"
        >
            {/* Subtle texture */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                backgroundSize: '40px 40px',
            }} />

            <div className="relative mx-auto max-w-3xl px-6">
                {/* Section Header */}
                <div className={`mb-12 text-center transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <div className="mx-auto mb-6 flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-ocean/40" />
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ocean">
                            {t('whyDirect.label')}
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-ocean/40" />
                    </div>
                    <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('whyDirect.title')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-warm-gray">
                        {t('whyDirect.subtitle')}
                    </p>
                </div>

                {/* Comparison Table */}
                <div className={`overflow-hidden rounded-2xl bg-white shadow-lg shadow-navy/[0.04] ring-1 ring-navy/[0.06] transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Header */}
                    <div className="grid grid-cols-3 border-b border-navy/[0.06]">
                        <div className="px-5 py-4 sm:px-6" />
                        <div className="flex items-center justify-center px-4 py-4 sm:px-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-ocean/10 px-4 py-1.5">
                                <div className="h-2 w-2 rounded-full bg-ocean" />
                                <span className="text-xs font-bold text-ocean sm:text-sm">{t('whyDirect.col.direct')}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center px-4 py-4 text-xs font-medium text-warm-gray/70 sm:px-6 sm:text-sm">
                            {t('whyDirect.col.platforms')}
                        </div>
                    </div>

                    {/* Rows */}
                    {COMPARISON_ROWS.map((row, i) => (
                        <div
                            key={row.labelKey}
                            className={`grid grid-cols-3 border-b border-navy/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-sand-light/30'}`}
                        >
                            <div className="flex items-center px-5 py-4 text-[13px] font-semibold text-navy sm:px-6 sm:text-sm">
                                {t(row.labelKey)}
                            </div>
                            <div className="flex items-center justify-center px-4 py-4 text-[13px] font-semibold text-ocean sm:px-6 sm:text-sm">
                                {row.isBoolean ? <CheckIcon /> : t(row.directKey)}
                            </div>
                            <div className="flex items-center justify-center px-4 py-4 text-[13px] text-warm-gray sm:px-6 sm:text-sm">
                                {row.isBoolean ? <CrossIcon /> : t(row.platformKey)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <div className={`mt-10 text-center transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-booking'))}
                        className="rounded-full bg-coral px-8 py-3 text-sm font-semibold text-white shadow-2xl transition-all duration-200 hover:bg-coral-dark hover:shadow-3xl hover:-translate-y-0.5 sm:px-10 sm:py-4 sm:text-lg"
                    >
                        {t('whyDirect.cta')}
                    </button>
                </div>
            </div>
        </section>
    );
}
