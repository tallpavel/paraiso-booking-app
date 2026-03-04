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

export default function FloatingContactButton() {
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

    return (
        <>
            {/* Floating Button */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-ocean px-5 py-3.5 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:bg-ocean-dark hover:shadow-2xl hover:scale-105 ${visible && !open ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('contact.title')}
                >
                    <div className="relative w-full max-w-lg animate-fade-in rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute right-4 top-4 rounded-full p-1.5 text-navy/40 transition-colors hover:bg-sand-light hover:text-navy"
                            aria-label="Close"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ocean/10 text-ocean">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="M22 4l-10 8L2 4" />
                                </svg>
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-navy">
                                {t('contact.title')}
                            </h2>
                            <p className="mt-1 text-sm text-warm-gray">
                                {t('contact.subtitle')}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="mb-4">
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
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.name ? 'border-coral' : 'border-sand'}`}
                                />
                                {errors.name && <p className="mt-1 text-xs text-coral" role="alert">{errors.name}</p>}
                            </div>

                            <div className="mb-4">
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
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.email ? 'border-coral' : 'border-sand'}`}
                                />
                                {errors.email && <p className="mt-1 text-xs text-coral" role="alert">{errors.email}</p>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="modal-phone" className="mb-1.5 block text-sm font-semibold text-navy">
                                    {t('contact.phone')} <span className="text-warm-gray">{t('contact.phoneOptional')}</span>
                                </label>
                                <input
                                    type="tel"
                                    id="modal-phone"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    autoComplete="tel"
                                    placeholder={t('contact.phonePlaceholder')}
                                    className="w-full rounded-xl border border-sand bg-white px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean"
                                />
                            </div>

                            <div className="mb-5">
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
                                    className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.message ? 'border-coral' : 'border-sand'}`}
                                />
                                {errors.message && <p className="mt-1 text-xs text-coral" role="alert">{errors.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full rounded-full bg-ocean py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-ocean-dark hover:shadow-xl disabled:cursor-wait disabled:opacity-70"
                            >
                                {status === 'sending'
                                    ? t('contact.sending')
                                    : status === 'sent'
                                        ? t('contact.messageSent')
                                        : t('contact.send')}
                            </button>

                            {status === 'sent' && (
                                <p className="mt-3 text-center text-sm text-ocean" role="status" aria-live="polite">
                                    {t('contact.thanks')}
                                </p>
                            )}
                            {status === 'error' && (
                                <p className="mt-3 text-center text-sm text-coral" role="alert" aria-live="polite">
                                    {t('contact.errorServer')}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
