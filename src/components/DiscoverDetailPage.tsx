import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';
import Header from './Header';
import Footer from './Footer';
import BookingCalendar from './BookingCalendar';
import FloatingContactButton from './FloatingContactButton';

type DiscoverSlug = 'beaches' | 'snorkeling' | 'whales' | 'hiking' | 'food';

interface DiscoverTopic {
    slug: DiscoverSlug;
    image: string;
    titleKey: TranslationKey;
    heroDescKey: TranslationKey;
    sections: {
        titleKey: TranslationKey;
        bodyKey: TranslationKey;
        image?: string;
    }[];
    tipsKey: TranslationKey;
    externalLink: string;
}

const TOPICS: DiscoverTopic[] = [
    {
        slug: 'beaches',
        image: '/discover/beach.png',
        titleKey: 'discoverPage.beaches.title',
        heroDescKey: 'discoverPage.beaches.heroDesc',
        sections: [
            { titleKey: 'discoverPage.beaches.s1Title', bodyKey: 'discoverPage.beaches.s1Body' },
            { titleKey: 'discoverPage.beaches.s2Title', bodyKey: 'discoverPage.beaches.s2Body' },
            { titleKey: 'discoverPage.beaches.s3Title', bodyKey: 'discoverPage.beaches.s3Body' },
        ],
        tipsKey: 'discoverPage.beaches.tips',
        externalLink: 'https://www.webtenerife.co.uk/what-to-do/beaches/',
    },
    {
        slug: 'snorkeling',
        image: '/discover/snorkel.png',
        titleKey: 'discoverPage.snorkeling.title',
        heroDescKey: 'discoverPage.snorkeling.heroDesc',
        sections: [
            { titleKey: 'discoverPage.snorkeling.s1Title', bodyKey: 'discoverPage.snorkeling.s1Body' },
            { titleKey: 'discoverPage.snorkeling.s2Title', bodyKey: 'discoverPage.snorkeling.s2Body' },
            { titleKey: 'discoverPage.snorkeling.s3Title', bodyKey: 'discoverPage.snorkeling.s3Body' },
        ],
        tipsKey: 'discoverPage.snorkeling.tips',
        externalLink: 'https://www.webtenerife.co.uk/what-to-do/nature/diving/',
    },
    {
        slug: 'whales',
        image: '/discover/whale.png',
        titleKey: 'discoverPage.whales.title',
        heroDescKey: 'discoverPage.whales.heroDesc',
        sections: [
            { titleKey: 'discoverPage.whales.s1Title', bodyKey: 'discoverPage.whales.s1Body' },
            { titleKey: 'discoverPage.whales.s2Title', bodyKey: 'discoverPage.whales.s2Body' },
            { titleKey: 'discoverPage.whales.s3Title', bodyKey: 'discoverPage.whales.s3Body' },
        ],
        tipsKey: 'discoverPage.whales.tips',
        externalLink: 'https://www.webtenerife.co.uk/what-to-do/nature/whale-dolphin-watching/',
    },
    {
        slug: 'hiking',
        image: '/discover/hiking.png',
        titleKey: 'discoverPage.hiking.title',
        heroDescKey: 'discoverPage.hiking.heroDesc',
        sections: [
            { titleKey: 'discoverPage.hiking.s1Title', bodyKey: 'discoverPage.hiking.s1Body' },
            { titleKey: 'discoverPage.hiking.s2Title', bodyKey: 'discoverPage.hiking.s2Body' },
            { titleKey: 'discoverPage.hiking.s3Title', bodyKey: 'discoverPage.hiking.s3Body' },
        ],
        tipsKey: 'discoverPage.hiking.tips',
        externalLink: 'https://www.webtenerife.co.uk/what-to-do/nature/hiking/',
    },
    {
        slug: 'food',
        image: '/discover/food.png',
        titleKey: 'discoverPage.food.title',
        heroDescKey: 'discoverPage.food.heroDesc',
        sections: [
            { titleKey: 'discoverPage.food.s1Title', bodyKey: 'discoverPage.food.s1Body' },
            { titleKey: 'discoverPage.food.s2Title', bodyKey: 'discoverPage.food.s2Body' },
            { titleKey: 'discoverPage.food.s3Title', bodyKey: 'discoverPage.food.s3Body' },
        ],
        tipsKey: 'discoverPage.food.tips',
        externalLink: 'https://www.webtenerife.co.uk/gastronomy/',
    },
];

export default function DiscoverDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { t } = useI18n();
    const [bookingOpen, setBookingOpen] = useState(false);
    const [pageReady, setPageReady] = useState(false);

    // Close booking modal when confirmation is dismissed
    useEffect(() => {
        const handler = () => setBookingOpen(false);
        window.addEventListener('close-booking', handler);
        return () => window.removeEventListener('close-booking', handler);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        setPageReady(false);
        // Small delay to let the browser settle, then fade in
        const timer = setTimeout(() => setPageReady(true), 50);
        return () => clearTimeout(timer);
    }, [slug]);

    const topic = TOPICS.find(t => t.slug === slug);

    if (!topic) {
        return (
            <>
                <Header />
                <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-20">
                    <h1 className="font-heading text-3xl font-bold text-navy">Page Not Found</h1>
                    <Link to="/" className="text-ocean underline hover:text-ocean-dark">
                        ← {t('discoverPage.backHome')}
                    </Link>
                </main>
                <Footer />
            </>
        );
    }

    // Find next topic for "Continue exploring" CTA
    const currentIndex = TOPICS.findIndex(t => t.slug === slug);
    const nextTopic = TOPICS[(currentIndex + 1) % TOPICS.length];

    return (
        <>
            <Header />
            <main className={`transition-all duration-600 ease-out ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {/* Hero */}
                <section className="relative h-[50vh] min-h-[400px] overflow-hidden sm:h-[60vh]">
                    <img
                        src={topic.image}
                        alt={t(topic.titleKey)}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/40 to-navy/10" />
                    <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 lg:p-16">
                        <div className="mx-auto max-w-4xl">
                            <a
                                href="/#discover"
                                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-md transition-all hover:bg-white/25 hover:ring-white/30"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                {t('discoverPage.backToDiscover')}
                            </a>
                            <h1 className="mb-4 font-heading text-3xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
                                {t(topic.titleKey)}
                            </h1>
                            <p className="max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                                {t(topic.heroDescKey)}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content sections — editorial magazine style */}
                <section className="py-20 sm:py-28">
                    <div className="mx-auto max-w-5xl px-6">
                        {topic.sections.map((section, i) => (
                            <div
                                key={i}
                                className={`group transition-all duration-700 ease-out ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: `${300 + i * 200}ms` }}
                            >
                                <div className={`relative grid items-center gap-8 lg:grid-cols-5 ${i > 0 ? 'mt-20 pt-20 border-t border-navy/6' : ''}`}>
                                    {/* Number accent */}
                                    <div className={`lg:col-span-1 ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                                        <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                                            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean/15 to-ocean/5 text-xl font-bold text-ocean ring-1 ring-ocean/10">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <div className="hidden h-px flex-1 bg-gradient-to-r from-ocean/20 to-transparent lg:block lg:h-16 lg:w-px lg:bg-gradient-to-b" />
                                        </div>
                                    </div>
                                    {/* Text content */}
                                    <div className={`lg:col-span-4 ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                                        <h2 className="mb-5 font-heading text-2xl font-bold text-navy sm:text-3xl lg:text-4xl">
                                            {t(section.titleKey)}
                                        </h2>
                                        <p className="text-base leading-[1.85] text-warm-gray sm:text-lg">
                                            {t(section.bodyKey)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tips callout — glassmorphism card */}
                <section className="relative overflow-hidden bg-gradient-to-br from-sand/40 via-white to-sand/20 py-16 sm:py-20">
                    {/* Decorative blobs */}
                    <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-ocean/5 blur-3xl" />
                    <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-coral/5 blur-3xl" />

                    <div className="relative mx-auto max-w-4xl px-6">
                        <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-navy/5 backdrop-blur-xl sm:p-12">
                            <div className="flex items-start gap-5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 text-2xl shadow-sm ring-1 ring-amber-200/50">
                                    💡
                                </div>
                                <div>
                                    <h3 className="mb-3 font-heading text-xl font-bold text-navy sm:text-2xl">
                                        {t('discoverPage.tipsTitle')}
                                    </h3>
                                    <p className="text-base leading-[1.85] text-warm-gray sm:text-lg">
                                        {t(topic.tipsKey)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Navigation & CTA — modern card grid */}
                <section className="bg-white py-16 sm:py-20">
                    <div className="mx-auto max-w-5xl px-6">
                        {/* Nav cards */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Back to Explore */}
                            <button
                                type="button"
                                onClick={() => {
                                    navigate('/');
                                    setTimeout(() => {
                                        const el = document.getElementById('discover');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }, 300);
                                }}
                                className="group flex items-center gap-4 rounded-2xl border border-navy/8 bg-sand-light/30 p-5 text-left transition-all duration-300 hover:border-ocean/20 hover:bg-ocean/5 hover:shadow-lg cursor-pointer"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-ocean transition-colors group-hover:bg-ocean group-hover:text-white">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wide text-warm-gray">{t('discoverPage.backToExplore')}</span>
                                    <p className="text-sm font-bold text-navy">{t('nav.discover')}</p>
                                </div>
                            </button>

                            {/* Next topic */}
                            <Link
                                to={`/discover/${nextTopic.slug}`}
                                className="group flex items-center gap-4 rounded-2xl border border-navy/8 bg-sand-light/30 p-5 text-left transition-all duration-300 hover:border-ocean/20 hover:bg-ocean/5 hover:shadow-lg"
                            >
                                <div className="flex-1">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-warm-gray">{t('discoverPage.continueExploring')}</span>
                                    <p className="text-sm font-bold text-navy">{t(nextTopic.titleKey)}</p>
                                </div>
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-ocean transition-colors group-hover:bg-ocean group-hover:text-white">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        </div>

                        {/* Book CTA */}
                        <div className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy to-ocean/80 p-10 text-center text-white shadow-2xl sm:p-14">
                            {/* Decorative circles */}
                            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
                            <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/5" />
                            <div className="absolute right-1/4 top-1/2 h-24 w-24 rounded-full bg-ocean/20 blur-2xl" />

                            <div className="relative">
                                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-ocean-light/80">
                                    Playa Paraíso
                                </span>
                                <h3 className="mb-4 font-heading text-2xl font-bold sm:text-3xl lg:text-4xl">
                                    {t('discoverPage.bookCta')}
                                </h3>
                                <p className="mx-auto mb-8 max-w-xl text-white/70 sm:text-lg">
                                    {t('discoverPage.bookCtaSub')}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setBookingOpen(true)}
                                    className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-navy shadow-lg transition-all duration-300 hover:bg-sand hover:shadow-2xl hover:scale-105 cursor-pointer"
                                >
                                    {t('hero.cta')}
                                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />

            {/* Booking Calendar Modal */}
            {bookingOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12 pb-12 backdrop-blur-sm sm:pt-16"
                    onClick={(e) => { if (e.target === e.currentTarget) setBookingOpen(false); }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('bookingCta.title')}
                >
                    <div className="relative w-full max-w-5xl animate-fade-in">
                        <button
                            type="button"
                            onClick={() => setBookingOpen(false)}
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

            <FloatingContactButton />
        </>
    );
}
