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

                                    {/* Payment Methods Cards */}
                                    <div className="!mt-5">
                                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy/60">
                                            {t('terms.s3.methodsTitle')}
                                        </h3>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {/* Stripe / Card */}
                                            <div className="rounded-xl border border-ocean/15 bg-gradient-to-br from-ocean/[0.03] to-transparent p-4">
                                                <div className="mb-2 flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean/10 text-ocean">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-bold text-navy">
                                                        {t('terms.s3.stripeTitle')}
                                                    </span>
                                                </div>
                                                <p className="text-xs leading-relaxed text-warm-gray">
                                                    {t('terms.s3.stripeDesc')}
                                                </p>
                                                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                                    {/* Visa mini */}
                                                    <svg className="h-5 w-auto opacity-50" viewBox="0 0 780 500" fill="none"><path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8H293.2z" fill="#1a1f71"/><path d="M560.9 157.8c-10.6-4-27.2-8.2-47.9-8.2-52.8 0-90 26.5-90.3 64.5-.3 28.1 26.6 43.8 46.9 53.1 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-31.9 19.1-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 43.8c12.5 5.4 35.6 10.2 59.6 10.4 56.2 0 92.7-26.2 93.1-66.8.2-22.3-14.1-39.2-45-53.1-18.7-9.1-30.2-15.1-30.1-24.3 0-8.1 9.7-16.8 30.7-16.8 17.5-.3 30.2 3.5 40.1 7.5l4.8 2.3 7.3-42.5z" fill="#1a1f71"/><path d="M632.2 152.9h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.4 179.6h56.2s9.2-24.1 11.3-29.4h68.6c1.6 6.9 6.5 29.4 6.5 29.4h49.7l-43.6-195.8zm-66 126.4c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.7l3.6 16.9s10.3 46.8 12.4 56.6h-44.5z" fill="#1a1f71"/><path d="M247.8 152.9L195.5 284l-5.6-27c-9.7-31.2-39.9-65-73.7-81.9l47.9 172.3h56.6l84.2-194.5h-57.1z" fill="#1a1f71"/><path d="M146.9 152.9H60.8l-.7 3.9c67.2 16.2 111.7 55.3 130.1 102.2l-18.8-90.2c-3.2-12.3-12.7-15.5-24.5-15.9z" fill="#f9a533"/></svg>
                                                    {/* Mastercard mini */}
                                                    <svg className="h-5 w-auto opacity-50" viewBox="0 0 780 500" fill="none"><circle cx="312" cy="250" r="150" fill="#eb001b"/><circle cx="468" cy="250" r="150" fill="#f79e1b"/><path d="M390 130.7c38.5 30.8 63.1 78.4 63.1 131.3s-24.6 100.5-63.1 131.3c-38.5-30.8-63.1-78.4-63.1-131.3s24.6-100.5 63.1-131.3z" fill="#ff5f00"/></svg>
                                                    {/* Amex mini */}
                                                    <svg className="h-5 w-auto opacity-50" viewBox="0 0 780 500"><rect width="780" height="500" rx="40" fill="#2e77bc"/><path d="M207 181l-76 168h55l11-27h62l11 27h57l-76-168h-44zm22 53l18 44h-36l18-44zM389 181v168h49l55-83v83h44V181h-49l-55 83v-83h-44zM591 181v168h133v-37h-89v-25h87v-36h-87v-33h89v-37H591z" fill="white"/></svg>
                                                </div>
                                            </div>
                                            {/* PayPal */}
                                            <div className="rounded-xl border border-[#003087]/15 bg-gradient-to-br from-[#003087]/[0.03] to-transparent p-4">
                                                <div className="mb-2 flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003087]/10 text-[#003087]">
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M20.067 8.478c.492.296.884.773 1.132 1.341a4.238 4.238 0 0 1 .45 1.944 4.1 4.1 0 0 1-1.01 2.822 6.8 6.8 0 0 1-2.613 1.838 8.01 8.01 0 0 1-3.23.633H12.91c-.482 0-.895.326-1.03.774l-1.396 4.603-.01.03a.475.475 0 0 1-.462.336H7.13a.417.417 0 0 1-.424-.485c0-.026.002-.05.006-.075l2.427-8a.472.472 0 0 1 .462-.336h2.245c1.173 0 2.222-.244 3.018-.738.744-.462 1.32-.977 1.706-1.572.396-.61.594-1.285.594-2.022a3.83 3.83 0 0 0-.298-1.503l.2.2c-.375.435-.91.801-1.606 1.096-.694.296-1.488.441-2.383.441h-2.22c-.483 0-.897.327-1.032.775L7.494 20h-3.37a.418.418 0 0 1-.426-.486c0-.025.003-.05.007-.074L6.96 4.98l.004-.025a.473.473 0 0 1 .462-.336h5.814c1.378 0 2.61.287 3.518.892 1.063.712 1.63 1.734 1.309 2.967z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-bold text-navy">
                                                        {t('terms.s3.paypalTitle')}
                                                    </span>
                                                </div>
                                                <p className="text-xs leading-relaxed text-warm-gray">
                                                    {t('terms.s3.paypalDesc')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p>{t('terms.s3.p3')}</p>
                                    <p>{t('terms.s3.p4')}</p>
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
                                                    <td className="px-4 py-3">{t('terms.s4.row4when')}</td>
                                                    <td className="px-4 py-3 font-semibold text-coral">{t('terms.s4.row4refund')}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p>{t('terms.s4.p2')}</p>
                                    <p>{t('terms.s4.p3')}</p>
                                    <p>{t('terms.s4.p4')}</p>
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
