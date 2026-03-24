import { useState, useEffect, useCallback } from 'react';
import type { ContactFormData } from '../types';
import { useI18n } from '../i18n';
import { sendContactMessage } from '../api';

const initialForm: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    message: '',
};

interface FieldError {
    name?: string;
    email?: string;
    message?: string;
}

interface Props {
    forceOpen?: boolean;
    onForceOpenHandled?: () => void;
}

export default function FloatingContactButton({ forceOpen, onForceOpenHandled }: Props = {}) {
    const { t } = useI18n();
    const [visible, setVisible] = useState(false);
    const [pulse, setPulse] = useState(true);
    const [open, setOpen] = useState(false);

    // Form state
    const [form, setForm] = useState<ContactFormData>(initialForm);
    const [errors, setErrors] = useState<FieldError>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    // Show button after scrolling past hero
    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Stop pulsing after 5s
    useEffect(() => {
        const timer = setTimeout(() => setPulse(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Allow external open trigger
    useEffect(() => {
        if (forceOpen) {
            setOpen(true);
            onForceOpenHandled?.();
        }
    }, [forceOpen, onForceOpenHandled]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const validate = useCallback((data: ContactFormData): FieldError => {
        const errs: FieldError = {};
        if (!data.name.trim()) errs.name = t('contact.errorName');
        if (!data.email.trim()) {
            errs.email = t('contact.errorEmail');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errs.email = t('contact.errorEmailInvalid');
        }
        if (!data.message.trim()) errs.message = t('contact.errorMessage');
        return errs;
    }, [t]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FieldError]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setStatus('sending');
        try {
            await sendContactMessage({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                message: form.message.trim(),
            });
            setStatus('sent');
            setForm(initialForm);
            setTimeout(() => {
                setStatus('idle');
                setOpen(false);
            }, 3000);
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    // Shared input classes
    const inputBase = 'w-full rounded-xl border bg-sand-light/50 px-4 py-3.5 text-navy placeholder:text-navy/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean focus:bg-white';
    const inputError = 'border-coral ring-1 ring-coral/20';
    const inputNormal = 'border-sand hover:border-ocean/30';

    return (
        <>
            {/* Floating Button */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full bg-ocean text-white shadow-xl transition-all duration-300 hover:bg-ocean-dark hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ocean h-12 w-12 sm:h-auto sm:w-auto sm:gap-2.5 sm:px-5 sm:py-3.5 sm:text-sm sm:font-semibold ${visible && !open ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
                    } ${pulse ? 'animate-bounce' : ''}`}
                aria-label={t('nav.contact')}
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4l-10 8L2 4" />
                </svg>
                <span className="hidden sm:inline">{t('nav.contact')}</span>
            </button>

            {/* Modal Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('contact.title')}
                >
                    <div className="relative w-full max-w-lg animate-fade-in overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
                        {/* Decorative top accent bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-ocean via-ocean-dark to-coral/60" />

                        <div className="p-6 sm:p-8">
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="absolute right-4 top-5 rounded-full p-2 text-navy/30 transition-all duration-200 hover:bg-sand-light hover:text-navy hover:rotate-90"
                                aria-label="Close"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Header */}
                            <div className="mb-6 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ocean/10 text-ocean">
                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="M22 4l-10 8L2 4" />
                                    </svg>
                                </div>
                                <h2 className="font-heading text-2xl font-bold text-navy">
                                    {t('contact.title')}
                                </h2>
                                <p className="mt-1 text-sm leading-relaxed text-warm-gray">
                                    {t('contact.subtitle')}
                                </p>
                            </div>

                            {/* SUCCESS STATE */}
                            {status === 'sent' ? (
                                <div className="flex flex-col items-center py-8 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-semibold text-navy">{t('contact.messageSent')}</p>
                                    <p className="mt-1 text-sm text-warm-gray">{t('contact.thanks')}</p>
                                </div>
                            ) : (
                                /* FORM */
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="space-y-4">
                                        {/* Name */}
                                        <div>
                                            <label htmlFor="modal-name" className="mb-1.5 block text-sm font-semibold text-navy">
                                                {t('contact.name')} <span className="text-coral">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="modal-name"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                autoComplete="name"
                                                placeholder={t('contact.namePlaceholder')}
                                                className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
                                            />
                                            {errors.name && <p className="mt-1 text-xs text-coral" role="alert">{errors.name}</p>}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="modal-email" className="mb-1.5 block text-sm font-semibold text-navy">
                                                {t('contact.email')} <span className="text-coral">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="modal-email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                autoComplete="email"
                                                placeholder={t('contact.emailPlaceholder')}
                                                spellCheck={false}
                                                className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                                            />
                                            {errors.email && <p className="mt-1 text-xs text-coral" role="alert">{errors.email}</p>}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label htmlFor="modal-phone" className="mb-1.5 block text-sm font-semibold text-navy">
                                                {t('contact.phone')} <span className="font-normal text-warm-gray">{t('contact.phoneOptional')}</span>
                                            </label>
                                            <input
                                                type="tel"
                                                id="modal-phone"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                autoComplete="tel"
                                                placeholder={t('contact.phonePlaceholder')}
                                                className={`${inputBase} ${inputNormal}`}
                                            />
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label htmlFor="modal-message" className="mb-1.5 block text-sm font-semibold text-navy">
                                                {t('contact.message')} <span className="text-coral">*</span>
                                            </label>
                                            <textarea
                                                id="modal-message"
                                                name="message"
                                                value={form.message}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder={t('contact.messagePlaceholder')}
                                                className={`${inputBase} resize-none ${errors.message ? inputError : inputNormal}`}
                                            />
                                            {errors.message && <p className="mt-1 text-xs text-coral" role="alert">{errors.message}</p>}
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ocean to-ocean-dark py-4 text-base font-semibold text-white shadow-lg shadow-ocean/20 transition-all duration-300 hover:shadow-xl hover:shadow-ocean/30 disabled:cursor-wait disabled:opacity-70"
                                    >
                                        {status === 'sending' ? (
                                            <>
                                                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                {t('contact.sending')}
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {t('contact.send')}
                                            </>
                                        )}
                                    </button>

                                    {status === 'error' && (
                                        <p className="mt-3 text-center text-sm text-coral" role="alert" aria-live="polite">
                                            {t('contact.errorServer')}
                                        </p>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
