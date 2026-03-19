import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

const ACTIVITIES: { image: string; titleKey: TranslationKey; descKey: TranslationKey; href: string }[] = [
    { image: '/discover/beach.png', titleKey: 'discover.beachTitle', descKey: 'discover.beachDesc', href: '/discover/beaches' },
    { image: '/discover/snorkel.png', titleKey: 'discover.snorkelTitle', descKey: 'discover.snorkelDesc', href: '/discover/snorkeling' },
    { image: '/discover/whale.png', titleKey: 'discover.whaleTitle', descKey: 'discover.whaleDesc', href: '/discover/whales' },
    { image: '/discover/hiking.png', titleKey: 'discover.hikingTitle', descKey: 'discover.hikingDesc', href: '/discover/hiking' },
    { image: '/discover/food.png', titleKey: 'discover.foodTitle', descKey: 'discover.foodDesc', href: '/discover/food' },
];

export default function DiscoverSection() {
    const { t } = useI18n();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        const maxScroll = el.scrollWidth - el.clientWidth;
        setCanScrollRight(el.scrollLeft < maxScroll - 10);
        setScrollProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
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

            {/* Carousel — constrained width */}
            <div className="relative mx-auto max-w-[1400px]">
                {/* Left arrow */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-3.5 shadow-xl ring-1 ring-black/5 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-2xl hover:scale-110 sm:left-5"
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
                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-3.5 shadow-xl ring-1 ring-black/5 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-2xl hover:scale-110 sm:right-5"
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
                    {ACTIVITIES.map((activity, index) => (
                        <Link
                            key={activity.titleKey}
                            to={activity.href}
                            className="group relative h-[380px] w-[340px] shrink-0 snap-start overflow-hidden rounded-2xl sm:h-[440px] sm:w-[420px]"
                        >
                            <img
                                src={activity.image}
                                alt={t(activity.titleKey)}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Gradient overlay — stronger at bottom for text legibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80" />

                            {/* Number badge */}
                            <div className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white backdrop-blur-sm ring-1 ring-white/20">
                                {String(index + 1).padStart(2, '0')}
                            </div>

                            {/* Content at bottom */}
                            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                                <h3 className="mb-2 font-heading text-xl font-bold text-white drop-shadow-lg sm:text-2xl" style={{ textWrap: 'balance' }}>
                                    {t(activity.titleKey)}
                                </h3>

                                {/* Description — visible by default, truncated to 2 lines */}
                                <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-white/75 transition-all duration-300 group-hover:text-white/90">
                                    {t(activity.descKey)}
                                </p>

                                {/* Learn more link */}
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-all duration-300 group-hover:text-white group-hover:gap-2.5">
                                    {t('discover.learnMore')}
                                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Scroll progress bar */}
                <div className="mt-6 flex justify-center">
                    <div className="h-0.5 w-24 overflow-hidden rounded-full bg-navy/10">
                        <div
                            className="h-full rounded-full bg-ocean transition-all duration-300"
                            style={{ width: `${Math.max(15, scrollProgress * 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Fun fact callout */}
            <div className="mx-auto mt-10 max-w-7xl px-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ocean to-ocean-dark p-8 text-center text-white shadow-lg sm:p-10">
                    {/* Subtle decorative circles */}
                    <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                    <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5" />

                    <p className="relative mx-auto max-w-2xl text-base font-medium leading-relaxed opacity-95 sm:text-lg">
                        {t('discover.funFact')}
                    </p>
                </div>
            </div>
        </section>
    );
}
