import { useState } from 'react';
import type { ContactFormData } from '../types';
import { useI18n } from '../i18n';

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

export default function ContactForm() {
    const { t } = useI18n();
    const [form, setForm] = useState<ContactFormData>(initialForm);
    const [errors, setErrors] = useState<FieldError>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const validate = (data: ContactFormData): FieldError => {
        const errs: FieldError = {};
        if (!data.name.trim()) errs.name = t('contact.errorName');
        if (!data.email.trim()) {
            errs.email = t('contact.errorEmail');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errs.email = t('contact.errorEmailInvalid');
        }
        if (!data.message.trim()) errs.message = t('contact.errorMessage');
        return errs;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FieldError]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setStatus('sending');

        const subject = encodeURIComponent(
            `Inquiry from ${form.name} — Verónica's Flat`,
        );
        const body = encodeURIComponent(
            `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || 'N/A'}\n\n${form.message}`,
        );
        window.location.href = `mailto:info@veronicas-flat.com?subject=${subject}&body=${body}`;

        setStatus('sent');
        setForm(initialForm);
        setTimeout(() => setStatus('idle'), 5000);
    };

    return (
        <section id="contact" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-start">
                    {/* Info */}
                    <div>
                        <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                            {t('contact.label')}
                        </span>
                        <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl">
                            {t('contact.title')}
                        </h2>
                        <p className="mb-8 text-lg leading-relaxed text-warm-gray">
                            {t('contact.subtitle')}
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-xl">
                                    📍
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold text-navy">{t('contact.address')}</h3>
                                    <p className="text-sm text-warm-gray">
                                        Avenida Adeje 300, č. 16<br />
                                        38678 Playa Paraíso, Tenerife, Spain
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-xl">
                                    ✉️
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold text-navy">{t('contact.email')}</h3>
                                    <a
                                        href="mailto:info@veronicas-flat.com"
                                        className="text-sm text-ocean transition-colors hover:text-ocean-dark"
                                    >
                                        info@veronicas-flat.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-xl">
                                    🌐
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold text-navy">{t('contact.location')}</h3>
                                    <p className="text-sm text-warm-gray">
                                        {t('contact.locationValue')}<br />
                                        {t('contact.locationExtra')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-3xl bg-sand-light p-6 shadow-lg sm:p-8"
                        noValidate
                    >
                        <div className="mb-6">
                            <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-navy">
                                {t('contact.name')} <span className="text-coral">*</span>
                            </label>
                            <input
                                type="text"
                                id="contact-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                placeholder={t('contact.namePlaceholder')}
                                className={`w-full rounded-xl border bg-white px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.name ? 'border-coral' : 'border-sand'
                                    }`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-coral" role="alert">{errors.name}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-navy">
                                {t('contact.email')} <span className="text-coral">*</span>
                            </label>
                            <input
                                type="email"
                                id="contact-email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                placeholder={t('contact.emailPlaceholder')}
                                spellCheck={false}
                                className={`w-full rounded-xl border bg-white px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.email ? 'border-coral' : 'border-sand'
                                    }`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-coral" role="alert">{errors.email}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="contact-phone" className="mb-2 block text-sm font-semibold text-navy">
                                {t('contact.phone')} <span className="text-warm-gray">{t('contact.phoneOptional')}</span>
                            </label>
                            <input
                                type="tel"
                                id="contact-phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                autoComplete="tel"
                                placeholder={t('contact.phonePlaceholder')}
                                className="w-full rounded-xl border border-sand bg-white px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-navy">
                                {t('contact.message')} <span className="text-coral">*</span>
                            </label>
                            <textarea
                                id="contact-message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                rows={4}
                                placeholder={t('contact.messagePlaceholder')}
                                className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.message ? 'border-coral' : 'border-sand'
                                    }`}
                            />
                            {errors.message && (
                                <p className="mt-1 text-xs text-coral" role="alert">{errors.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full rounded-full bg-ocean py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-ocean-dark hover:shadow-xl disabled:cursor-wait disabled:opacity-70"
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
                    </form>
                </div>
            </div>
        </section>
    );
}
