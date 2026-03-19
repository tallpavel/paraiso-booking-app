import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';
import Header from './Header';
import Footer from './Footer';
import BookingCalendar from './BookingCalendar';

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
    const { t } = useI18n();
    const [bookingOpen, setBookingOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
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
            <main>
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
                                className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 transition-colors hover:text-white"
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

                {/* Content sections */}
                <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
                    {topic.sections.map((section, i) => (
                        <div
                            key={i}
                            className={`mb-14 last:mb-0 ${i > 0 ? 'border-t border-navy/8 pt-14' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">
                                    {i + 1}
                                </span>
                                <div>
                                    <h2 className="mb-4 font-heading text-2xl font-bold text-navy sm:text-3xl">
                                        {t(section.titleKey)}
                                    </h2>
                                    <p className="text-base leading-relaxed text-warm-gray sm:text-lg">
                                        {t(section.bodyKey)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Tips callout */}
                <section className="bg-sand/30 py-12">
                    <div className="mx-auto max-w-4xl px-6">
                        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-navy/5 sm:p-10">
                            <h3 className="mb-4 flex items-center gap-2 font-heading text-xl font-bold text-navy">
                                <span className="text-2xl">💡</span>
                                {t('discoverPage.tipsTitle')}
                            </h3>
                            <p className="text-base leading-relaxed text-warm-gray">
                                {t(topic.tipsKey)}
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTAs */}
                <section className="mx-auto max-w-4xl px-6 py-16">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        {/* External link */}
                        <a
                            href={topic.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-ocean px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-ocean-dark hover:shadow-xl"
                        >
                            {t('discoverPage.officialGuide')}
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>

                        {/* Next topic */}
                        <Link
                            to={`/discover/${nextTopic.slug}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-ocean"
                        >
                            {t('discoverPage.continueExploring')}:&nbsp;
                            <span className="text-ocean">{t(nextTopic.titleKey)}</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {/* Book CTA */}
                    <div className="mt-12 rounded-2xl bg-gradient-to-r from-ocean to-ocean-dark p-8 text-center text-white shadow-lg sm:p-10">
                        <h3 className="mb-3 font-heading text-2xl font-bold sm:text-3xl">
                            {t('discoverPage.bookCta')}
                        </h3>
                        <p className="mb-6 text-white/80">
                            {t('discoverPage.bookCtaSub')}
                        </p>
                        <button
                            type="button"
                            onClick={() => setBookingOpen(true)}
                            className="inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-ocean shadow-lg transition-all hover:bg-sand hover:shadow-xl cursor-pointer"
                        >
                            {t('hero.cta')}
                        </button>
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
        </>
    );
}
