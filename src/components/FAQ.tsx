import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useI18n, type TranslationKey } from '../i18n';

const FAQ_ITEMS: { q: TranslationKey; a: TranslationKey }[] = [
    { q: 'faq.q1', a: 'faq.a1' },
    { q: 'faq.q2', a: 'faq.a2' },
    { q: 'faq.q3', a: 'faq.a3' },
    { q: 'faq.q4', a: 'faq.a4' },
    { q: 'faq.q5', a: 'faq.a5' },
    { q: 'faq.q6', a: 'faq.a6' },
    { q: 'faq.q7', a: 'faq.a7' },
    { q: 'faq.q8', a: 'faq.a8' },
    { q: 'faq.q9', a: 'faq.a9' },
];

function AccordionItem({ question, answer, isOpen, onToggle, index }: {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
    index: number;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(isOpen ? contentRef.current.scrollHeight : 0);
        }
    }, [isOpen]);

    return (
        <div
            className={`group border-b border-navy/[0.06] transition-colors duration-300 ${isOpen ? 'bg-sand-light/30' : ''}`}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-sand-light/40 sm:px-8"
                aria-expanded={isOpen}
            >
                <span className={`text-[15px] font-semibold leading-snug transition-colors duration-200 sm:text-base ${isOpen ? 'text-ocean' : 'text-navy'}`}>
                    {question}
                </span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'bg-ocean text-white rotate-180' : 'bg-navy/[0.05] text-navy/40'}`}>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: height }}
            >
                <div ref={contentRef} className="px-6 pb-5 sm:px-8">
                    <p className="text-[14px] leading-relaxed text-warm-gray sm:text-[15px]">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function FAQ() {
    const { t } = useI18n();
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

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
            id="faq"
            ref={sectionRef}
            className="relative overflow-hidden bg-white py-20 sm:py-28"
        >
            <Helmet>
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: [
                        {
                            '@type': 'Question',
                            name: 'What are the check-in and check-out times?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Check-in is from 15:00 (3 PM) and check-out is by 11:00 (11 AM). Early check-in or late check-out may be available upon request — just ask us in advance.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'How do I book and what is the payment process?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Simply select your dates and submit a booking request. We\u2019ll confirm availability within 24 hours. Once confirmed, a 30% deposit is required within 48 hours to secure your reservation. The remaining 70% balance will be requested 14 days before your arrival via a secure payment link.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'What is the cancellation policy?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Cancellations made 14 or more days before check-in receive a full refund of the deposit. Cancellations less than 14 days before check-in are non-refundable. No-shows are charged the full reservation amount.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'What amenities are included?',
                            acceptedAnswer: { '@type': 'Answer', text: 'The flat includes free WiFi, air conditioning, a fully equipped kitchen, Smart TV with Netflix, private terrace with ocean views, public street parking, washing machine, linens, towels, and access to the communal pool.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'How far is the nearest beach?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Playa de la Enramada is just a 3-minute walk (250 m) from the flat. Playa del Duque, one of Tenerife\u2019s finest beaches, is a 10-minute drive or a pleasant coastal walk.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'How do I get from the airport to the flat?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Tenerife South Airport (TFS) is approximately 20 minutes by car (25 km). We can arrange airport transfers or provide detailed driving directions. Taxis and rental cars are readily available at the airport.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'What is the minimum stay and pricing?',
                            acceptedAnswer: { '@type': 'Answer', text: 'The minimum stay is 3 nights. Prices vary by season — check the booking section for current rates. Booking directly always guarantees the best price with no agency fees.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'Are pets allowed?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Unfortunately, pets are not allowed in the apartment due to community regulations.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'Is there a damage deposit?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Yes, a damage deposit of 300 euros will be held via card, Bizum, or cash upon check-in. The deposit will be fully refunded 24 hours after check-out, subject to a property inspection.' },
                        },
                    ],
                })}</script>
            </Helmet>
            {/* Subtle texture */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.012]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                backgroundSize: '32px 32px',
            }} />

            <div className="relative mx-auto max-w-4xl px-6">
                {/* Section Header */}
                <div className={`mb-12 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <div className="mx-auto mb-6 flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-ocean/40" />
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ocean">
                            {t('faq.label')}
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-ocean/40" />
                    </div>
                    <h2 className="mb-4 text-center font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('faq.title')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-warm-gray">
                        {t('faq.subtitle')}
                    </p>
                </div>

                {/* Accordion */}
                <div className={`overflow-hidden rounded-2xl bg-white shadow-lg shadow-navy/[0.04] ring-1 ring-navy/[0.06] transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {FAQ_ITEMS.map((item, i) => (
                        <AccordionItem
                            key={item.q}
                            question={t(item.q)}
                            answer={t(item.a)}
                            isOpen={openIndex === i}
                            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                            index={i}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}
