import { useState } from 'react';
import type { ContactFormData } from '../types';

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

function validate(data: ContactFormData): FieldError {
    const errors: FieldError = {};
    if (!data.name.trim()) errors.name = 'Please enter your name';
    if (!data.email.trim()) {
        errors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address';
    }
    if (!data.message.trim()) errors.message = 'Please enter a message';
    return errors;
}

export default function ContactForm() {
    const [form, setForm] = useState<ContactFormData>(initialForm);
    const [errors, setErrors] = useState<FieldError>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

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

        // Simulate send — replace with emailjs or API call
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
                            Get in Touch
                        </span>
                        <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl">
                            We'd Love to Hear From You
                        </h2>
                        <p className="mb-8 text-lg leading-relaxed text-warm-gray">
                            Have a question about the flat, the area, or your trip? Send us a
                            message and we'll reply within 24 hours.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-xl">
                                    📍
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold text-navy">Address</h3>
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
                                    <h3 className="mb-1 font-semibold text-navy">Email</h3>
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
                                    <h3 className="mb-1 font-semibold text-navy">Location</h3>
                                    <p className="text-sm text-warm-gray">
                                        Southern Tenerife, Canary Islands<br />
                                        15 min from Tenerife South Airport (TFS)
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
                                Name <span className="text-coral">*</span>
                            </label>
                            <input
                                type="text"
                                id="contact-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                placeholder="Your full name…"
                                className={`w-full rounded-xl border bg-white px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.name ? 'border-coral' : 'border-sand'
                                    }`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-coral" role="alert">{errors.name}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-navy">
                                Email <span className="text-coral">*</span>
                            </label>
                            <input
                                type="email"
                                id="contact-email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                placeholder="you@example.com…"
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
                                Phone <span className="text-warm-gray">(optional)</span>
                            </label>
                            <input
                                type="tel"
                                id="contact-phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                autoComplete="tel"
                                placeholder="+34 …"
                                className="w-full rounded-xl border border-sand bg-white px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-navy">
                                Message <span className="text-coral">*</span>
                            </label>
                            <textarea
                                id="contact-message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Tell us about your trip or ask a question…"
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
                                ? 'Sending…'
                                : status === 'sent'
                                    ? '✓ Message Sent!'
                                    : 'Send Message'}
                        </button>

                        {status === 'sent' && (
                            <p className="mt-3 text-center text-sm text-ocean" role="status" aria-live="polite">
                                Thank you! We'll get back to you within 24 hours.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}
