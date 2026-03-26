import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';
import Header from './Header';
import Footer from './Footer';
import FloatingContactButton from './FloatingContactButton';

export default function TermsPage() {
    const { t } = useI18n();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [contactOpen, setContactOpen] = useState(false);
    const handleContactHandled = useCallback(() => setContactOpen(false), []);

    const tocKeys: TranslationKey[] = [
        'terms.s1.title', 'terms.s2.title', 'terms.s3.title',
        'terms.s4.title', 'terms.s5.title', 'terms.s6.title',
        'terms.s7.title', 'terms.s8.title', 'terms.s9.title',
        'terms.s10.title',
    ];

    return (
        <>
            <Header />
            <main className="bg-sand-light">
                {/* Hero */}
                <section className="bg-gradient-to-br from-navy via-navy-light to-ocean py-20 sm:py-28">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <Link
                            to="/"
                            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition-colors hover:text-white"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            {t('terms.backHome')}
                        </Link>
                        <h1 className="mb-4 font-heading text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            {t('terms.title')}
                        </h1>
                        <p className="text-lg text-white/70">
                            {t('terms.subtitle')}
                        </p>
                        <p className="mt-4 text-sm text-white/40">
                            {t('terms.lastUpdated')}
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16 sm:py-20">
                    <div className="mx-auto max-w-4xl px-6">
                        {/* Table of Contents */}
                        <nav className="mb-12 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-4 font-heading text-lg font-bold text-navy">
                                {t('terms.tocTitle')}
                            </h2>
                            <ol className="grid gap-2 text-sm sm:grid-cols-2">
                                {tocKeys.map((key, i) => (
                                    <li key={i}>
                                        <a
                                            href={`#section-${i + 1}`}
                                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-ocean transition-colors hover:bg-ocean/5 hover:text-ocean-dark"
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-xs font-bold text-ocean">
                                                {i + 1}
                                            </span>
                                            {t(key)}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>

                        {/* Sections */}
                        <div className="space-y-10">
                            {/* 1. General */}
                            <article id="section-1" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">1</span>
                                    <h2 className="font-heading text-xl font-bold text-navy">{t('terms.s1.title')}</h2>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed text-warm-gray">
                                    <p>{t('terms.s1.p1')}</p>
                                    <p>{t('terms.s1.p2')}</p>
                                    <p>{t('terms.s1.p3')}</p>
                                </div>
                            </article>

                            {/* 2. Reservations */}
                            <article id="section-2" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">2</span>
                                    <h2 className="font-heading text-xl font-bold text-navy">{t('terms.s2.title')}</h2>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed text-warm-gray">
                                    <p>{t('terms.s2.p1')}</p>
                                    <ul className="ml-4 list-disc space-y-1.5 marker:text-ocean">
                                        <li>{t('terms.s2.li1')}</li>
                                        <li>{t('terms.s2.li2')}</li>
                                        <li>{t('terms.s2.li3')}</li>
                                        <li>{t('terms.s2.li4')}</li>
                                    </ul>
                                    <p>{t('terms.s2.p2')}</p>
                                </div>
                            </article>

                            {/* 3. Pricing & Payments */}
                            <article id="section-3" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">3</span>
                                    <h2 className="font-heading text-xl font-bold text-navy">{t('terms.s3.title')}</h2>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed text-warm-gray">
                                    <p>{t('terms.s3.p1')}</p>
                                    <div className="rounded-xl bg-ocean/5 p-4">
                                        <ul className="ml-4 list-disc space-y-1.5 marker:text-ocean">
                                            <li>{t('terms.s3.li1')}</li>
                                            <li>{t('terms.s3.li2')}</li>
                                            <li>{t('terms.s3.li3')}</li>
                                            <li className="font-medium text-navy">{t('terms.s3.li4')}</li>
                                        </ul>
                                    </div>
                                    <p>{t('terms.s3.p2')}</p>
                                    <p>{t('terms.s3.p3')}</p>
                                </div>
                            </article>

                            {/* 4. Cancellation & Refunds */}
                            <article id="section-4" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral/10 text-sm font-bold text-coral">4</span>
                                    <h2 className="font-heading text-xl font-bold text-navy">{t('terms.s4.title')}</h2>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed text-warm-gray">
                                    <p>{t('terms.s4.p1')}</p>
                                    <div className="overflow-hidden rounded-xl border border-navy/10">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-navy/5">
                                                    <th className="px-4 py-3 font-semibold text-navy">{t('terms.s4.tableWhen')}</th>
                                                    <th className="px-4 py-3 font-semibold text-navy">{t('terms.s4.tableRefund')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-navy/5">
                                                <tr>
                                                    <td className="px-4 py-3">{t('terms.s4.row1when')}</td>
                                                    <td className="px-4 py-3 font-semibold text-green-600">{t('terms.s4.row1refund')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3">{t('terms.s4.row2when')}</td>
                                                    <td className="px-4 py-3 font-semibold text-coral">{t('terms.s4.row2refund')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3">{t('terms.s4.row3when')}</td>
                                                    <td className="px-4 py-3 font-semibold text-coral">{t('terms.s4.row3refund')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3">{t('terms.s4.row4when' as TranslationKey)}</td>
                                                    <td className="px-4 py-3 font-semibold text-coral">{t('terms.s4.row4refund' as TranslationKey)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p>{t('terms.s4.p2')}</p>
                                    <p>{t('terms.s4.p3')}</p>
                                    <p>{t('terms.s4.p4' as TranslationKey)}</p>
                                </div>
                            </article>

                            {/* 5. Check-In & Check-Out */}
                            <article id="section-5" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">5</span>
                                    <h2 className="font-heading text-xl font-bold text-navy">{t('terms.s5.title')}</h2>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed text-warm-gray">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl bg-green-50 p-4">
                                            <p className="mb-1 text-sm font-bold text-green-700">{t('terms.s5.checkinLabel')}</p>
                                            <p className="text-green-600">{t('terms.s5.checkinTime')}</p>
                                        </div>
                                        <div className="rounded-xl bg-amber-50 p-4">
                                            <p className="mb-1 text-sm font-bold text-amber-700">{t('terms.s5.checkoutLabel')}</p>
                                            <p className="text-amber-600">{t('terms.s5.checkoutTime')}</p>
                                        </div>
                                    </div>
                                    <p>{t('terms.s5.p1')}</p>
                                    <p>{t('terms.s5.p2')}</p>
                                </div>
                            </article>

                            {/* 6. House Rules */}
                            <article id="section-6" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">6</span>
                                    <h2 className="font-heading text-xl font-bold text-navy">{t('terms.s6.title')}</h2>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed text-warm-gray">
                                    <p>{t('terms.s6.p1')}</p>
                                    <ul className="ml-4 list-disc space-y-1.5 marker:text-ocean">
                                        <li>{t('terms.s6.li1')}</li>
                                        <li>{t('terms.s6.li2')}</li>
                                        <li>{t('terms.s6.li3')}</li>
                                        <li>{t('terms.s6.li4')}</li>
                                        <li>{t('terms.s6.li5')}</li>
                                        <li>{t('terms.s6.li6')}</li>
                                    </ul>
                                </div>
                            </article>

                            {/* 7. Liability & Damages */}
                            <article id="section-7" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">7</span>
                                    <h2 className="font-heading text-xl font-bold text-navy">{t('terms.s7.title')}</h2>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed text-warm-gray">
                                    <p>{t('terms.s7.p1')}</p>
                                    <p>{t('terms.s7.p2')}</p>
                                    <p>{t('terms.s7.p3')}</p>
                                </div>
                            </article>

                            {/* 8. Privacy & Data */}
                            <article id="section-8" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">8</span>
                                    <h2 className="font-heading text-xl font-bold text-navy">{t('terms.s8.title')}</h2>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed text-warm-gray">
                                    <p>{t('terms.s8.p1')}</p>
                                    <ul className="ml-4 list-disc space-y-1.5 marker:text-ocean">
                                        <li>{t('terms.s8.li1')}</li>
                                        <li>{t('terms.s8.li2')}</li>
                                        <li>{t('terms.s8.li3')}</li>
                                    </ul>
                                    <p>{t('terms.s8.p2')}</p>
                                </div>
                            </article>

                            {/* 9. Force Majeure */}
                            <article id="section-9" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">9</span>
                                    <h2 className="font-heading text-xl font-bold text-navy">{t('terms.s9.title')}</h2>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed text-warm-gray">
                                    <p>{t('terms.s9.p1')}</p>
                                    <p>{t('terms.s9.p2')}</p>
                                </div>
                            </article>

                            {/* 10. Governing Law */}
                            <article id="section-10" className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">10</span>
                                    <h2 className="font-heading text-xl font-bold text-navy">{t('terms.s10.title')}</h2>
                                </div>
                                <div className="space-y-3 text-sm leading-relaxed text-warm-gray">
                                    <p>{t('terms.s10.p1')}</p>
                                    <p>{t('terms.s10.p2')}</p>
                                </div>
                            </article>
                        </div>

                        {/* Contact CTA */}
                        <div className="mt-12 rounded-2xl bg-gradient-to-r from-ocean to-ocean-dark p-8 text-center text-white shadow-lg sm:p-10">
                            <h3 className="mb-3 font-heading text-2xl font-bold sm:text-3xl">
                                {t('terms.contactCta')}
                            </h3>
                            <p className="mb-6 text-white/80">
                                {t('terms.contactCtaSub')}
                            </p>
                            <button
                                onClick={() => setContactOpen(true)}
                                className="inline-block cursor-pointer rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-ocean shadow-lg transition-all hover:bg-sand hover:shadow-xl"
                            >
                                {t('terms.contactBtn')}
                            </button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <FloatingContactButton forceOpen={contactOpen} onForceOpenHandled={handleContactHandled} />
        </>
    );
}
