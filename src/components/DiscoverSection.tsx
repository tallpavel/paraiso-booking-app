import { useState, useCallback, useRef, useEffect } from 'react';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

const ACTIVITIES: { image: string; titleKey: TranslationKey; href: string }[] = [
    { image: '/discover/beach.png', titleKey: 'discover.beachTitle', href: 'https://www.webtenerife.co.uk/what-to-do/beaches/' },
    { image: '/discover/snorkel.png', titleKey: 'discover.snorkelTitle', href: 'https://www.webtenerife.co.uk/what-to-do/nature/diving/' },
    { image: '/discover/whale.png', titleKey: 'discover.whaleTitle', href: 'https://www.webtenerife.co.uk/what-to-do/nature/whale-dolphin-watching/' },
    { image: '/discover/hiking.png', titleKey: 'discover.hikingTitle', href: 'https://www.webtenerife.co.uk/what-to-do/nature/hiking/' },
    { image: '/discover/food.png', titleKey: 'discover.foodTitle', href: 'https://www.webtenerife.co.uk/gastronomy/' },
];

export default function DiscoverSection() {
    const { t } = useI18n();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollState();
        el.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [updateScrollState]);

    const scroll = useCallback((dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.7;
        el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }, []);

    return (
        <section id="discover" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-12 text-center">
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                        {t('discover.label')}
                    </span>
                    <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('discover.title')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-warm-gray">
                        {t('discover.subtitle')}
                    </p>
                </div>
            </div>

            {/* Carousel — full width */}
            <div className="relative mx-auto max-w-[100vw]">
                {/* Left arrow */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl sm:left-6"
                        aria-label="Scroll left"
                    >
                        <svg className="h-5 w-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Right arrow */}
                {canScrollRight && (
                    <button
                        type="button"
                        onClick={() => scroll('right')}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl sm:right-6"
                        aria-label="Scroll right"
                    >
                        <svg className="h-5 w-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Scrollable track */}
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto px-6 pb-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {ACTIVITIES.map((activity) => (
                        <a
                            key={activity.titleKey}
                            href={activity.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative h-[340px] w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl sm:h-[400px] sm:w-[400px]"
                        >
                            <img
                                src={activity.image}
                                alt={t(activity.titleKey)}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-all duration-300 group-hover:from-black/75" />

                            {/* Title + link */}
                            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                                <h3 className="font-heading text-lg font-bold text-white drop-shadow-lg sm:text-xl lg:text-2xl">
                                    {t(activity.titleKey)}
                                </h3>
                                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-white/0 transition-all duration-300 group-hover:text-white/90 group-hover:underline underline-offset-2">
                                    {t('discover.learnMore')}
                                    <svg className="h-4 w-4 translate-x-0 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Fun fact callout */}
            <div className="mx-auto mt-8 max-w-7xl px-6">
                <div className="rounded-2xl bg-gradient-to-r from-ocean to-ocean-dark p-6 text-center text-white shadow-lg sm:p-8">
                    <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed opacity-95 sm:text-lg">
                        {t('discover.funFact')}
                    </p>
                </div>
            </div>
        </section>
    );
}
