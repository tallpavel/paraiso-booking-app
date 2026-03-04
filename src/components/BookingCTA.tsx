import { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import BookingCalendar from './BookingCalendar';

export default function BookingCTA() {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);

    // Lock body scroll when modal open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <>
            {/* CTA Section */}
            <section id="booking" className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-ocean py-20 sm:py-28">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-ocean blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-coral blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-4xl px-6 text-center">
                    {/* Sun icon */}
                    <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                        <svg className="h-8 w-8 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                    </div>

                    <h2 className="mb-5 font-heading text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                        {t('bookingCta.title')}
                    </h2>
                    <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/70">
                        {t('bookingCta.subtitle')}
                    </p>

                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="group inline-flex items-center gap-3 rounded-full bg-coral px-10 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-coral-dark hover:shadow-2xl hover:scale-105"
                    >
                        <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        {t('bookingCta.button')}
                    </button>

                    <p className="mt-6 text-sm text-white/50">
                        {t('bookingCta.hint')}
                    </p>
                </div>
            </section>

            {/* Booking Modal */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12 pb-12 backdrop-blur-sm sm:pt-16"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('bookingCta.title')}
                >
                    <div className="relative w-full max-w-5xl animate-fade-in">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute -top-2 right-0 z-10 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-sand-light sm:-right-2"
                            aria-label="Close"
                        >
                            <svg className="h-5 w-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <BookingCalendar />
                    </div>
                </div>
            )}
        </>
    );
}
