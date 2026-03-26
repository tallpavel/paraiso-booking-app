import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';
import Header from './Header';
import Footer from './Footer';
import FloatingContactButton from './FloatingContactButton';

/* ── Animated check-mark (CSS keyframes are in index.css) ─────────── */
function SuccessIcon() {
    return (
        <div className="payment-icon payment-icon--success">
            <svg viewBox="0 0 52 52" className="h-16 w-16 sm:h-20 sm:w-20">
                <circle className="payment-icon__circle" cx="26" cy="26" r="25" fill="none" />
                <path className="payment-icon__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
        </div>
    );
}

function CancelledIcon() {
    return (
        <div className="payment-icon payment-icon--cancelled">
            <svg viewBox="0 0 52 52" className="h-16 w-16 sm:h-20 sm:w-20">
                <circle className="payment-icon__circle" cx="26" cy="26" r="25" fill="none" />
                <path className="payment-icon__cross" fill="none" d="M16 16 36 36M36 16 16 36" />
            </svg>
        </div>
    );
}

/* ── Step item ─────────────────────────────────────────────────────── */
function StepItem({ number, textKey }: { number: number; textKey: TranslationKey }) {
    const { t } = useI18n();
    return (
        <div className="flex items-start gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">
                {number}
            </span>
            <p className="pt-1 text-sm leading-relaxed text-warm-gray">{t(textKey)}</p>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
type PaymentStatus = 'success' | 'cancelled';

export default function PaymentResultPage() {
    const { t } = useI18n();
    const [searchParams] = useSearchParams();

    const status: PaymentStatus = useMemo(() => {
        const param = searchParams.get('payment');
        return param === 'success' ? 'success' : 'cancelled';
    }, [searchParams]);

    const paymentType = useMemo(() => {
        const type = searchParams.get('type');
        if (type === 'remaining') return 'remaining';
        if (type === 'full') return 'full';
        return 'deposit';
    }, [searchParams]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const isSuccess = status === 'success';
    const isRemaining = paymentType === 'remaining';
    const isFull = paymentType === 'full';

    // Pick i18n key prefix based on payment type
    const prefix = isRemaining ? 'paymentRemaining' : isFull ? 'paymentFull' : 'payment';

    return (
        <>
            <Header />
            <main className="bg-sand-light">
                {/* Hero gradient */}
                <section
                    className={`py-20 sm:py-28 ${
                        isSuccess
                            ? 'bg-gradient-to-br from-[#0a5c36] via-[#0d7a49] to-[#14a362]'
                            : 'bg-gradient-to-br from-navy via-navy-light to-[#6b7280]'
                    }`}
                >
                    <div className="mx-auto max-w-3xl px-6 text-center">
                        <Link
                            to="/"
                            className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition-colors hover:text-white"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            {t('payment.backHome' as TranslationKey)}
                        </Link>

                        {/* Animated icon */}
                        <div className="mb-6 flex justify-center">
                            {isSuccess ? <SuccessIcon /> : <CancelledIcon />}
                        </div>

                        <h1 className="mb-4 font-heading text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            {t((isSuccess ? `${prefix}.successTitle` : `${prefix}.cancelledTitle`) as TranslationKey)}
                        </h1>
                        <p className="text-lg text-white/75">
                            {t((isSuccess ? `${prefix}.successSubtitle` : `${prefix}.cancelledSubtitle`) as TranslationKey)}
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16 sm:py-20">
                    <div className="mx-auto max-w-3xl px-6">
                        {/* Steps / information card */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
                            <h2 className="mb-6 font-heading text-xl font-bold text-navy">
                                {t((isSuccess ? `${prefix}.successNextTitle` : `${prefix}.cancelledNextTitle`) as TranslationKey)}
                            </h2>

                            <div className="space-y-5">
                                {isSuccess ? (
                                    <>
                                        <StepItem number={1} textKey={`${prefix}.successStep1` as TranslationKey} />
                                        <StepItem number={2} textKey={`${prefix}.successStep2` as TranslationKey} />
                                        <StepItem number={3} textKey={`${prefix}.successStep3` as TranslationKey} />
                                    </>
                                ) : (
                                    <>
                                        <StepItem number={1} textKey={`${prefix}.cancelledStep1` as TranslationKey} />
                                        <StepItem number={2} textKey={`${prefix}.cancelledStep2` as TranslationKey} />
                                        <StepItem number={3} textKey={`${prefix}.cancelledStep3` as TranslationKey} />
                                    </>
                                )}
                            </div>

                            {/* Deposit info (success) or reassurance (cancelled) */}
                            <div
                                className={`mt-8 rounded-xl p-5 ${
                                    isSuccess
                                        ? 'border border-green-200 bg-green-50'
                                        : 'border border-amber-200 bg-amber-50'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 text-lg">
                                        {isSuccess ? '✅' : '💡'}
                                    </span>
                                    <p className={`text-sm leading-relaxed ${isSuccess ? 'text-green-800' : 'text-amber-800'}`}>
                                        {t((isSuccess ? `${prefix}.successNote` : `${prefix}.cancelledNote`) as TranslationKey)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA buttons */}
                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2.5 rounded-xl bg-ocean px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-ocean-dark hover:shadow-xl"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                {t('payment.backHomeBtn' as TranslationKey)}
                            </Link>

                            {!isSuccess && (
                                <Link
                                    to="/#booking"
                                    className="inline-flex items-center gap-2.5 rounded-xl border border-[#e0ddd5] bg-white px-8 py-3.5 text-sm font-bold text-navy shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    {t('payment.tryAgain' as TranslationKey)}
                                </Link>
                            )}
                        </div>

                        {/* Contact CTA */}
                        <div className="mt-12 rounded-2xl bg-gradient-to-r from-ocean to-ocean-dark p-8 text-center text-white shadow-lg sm:p-10">
                            <h3 className="mb-3 font-heading text-2xl font-bold sm:text-3xl">
                                {t('payment.contactTitle' as TranslationKey)}
                            </h3>
                            <p className="mb-6 text-white/80">
                                {t('payment.contactSubtitle' as TranslationKey)}
                            </p>
                            <a
                                href="mailto:info@veronicas-flat.com"
                                className="inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-ocean shadow-lg transition-all hover:bg-sand hover:shadow-xl"
                            >
                                {t('payment.contactBtn' as TranslationKey)}
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <FloatingContactButton />
        </>
    );
}
