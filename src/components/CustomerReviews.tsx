import { useState, useCallback, useRef, useEffect } from 'react';
import { reviews } from '../data';
import { useI18n } from '../i18n';

export default function CustomerReviews() {
    const { t } = useI18n();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const averageRating = (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);

    // ── Scroll tracking ──────────────────────────────────────────────
    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

        // Determine active card based on scroll position
        const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 20 : 1;
        const idx = Math.round(el.scrollLeft / cardWidth);
        setActiveIndex(Math.min(idx, reviews.length - 1));
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

    const scrollToIndex = useCallback((index: number) => {
        const el = scrollRef.current;
        if (!el) return;
        const card = el.children[index] as HTMLElement;
        if (card) {
            el.scrollTo({ left: card.offsetLeft - 24, behavior: 'smooth' });
        }
    }, []);

    const StarIcon = ({ className = 'h-5 w-5 text-yellow-400' }: { className?: string }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );

    return (
        <section id="reviews" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-12 text-center">
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                        {t('reviews.label')}
                    </span>
                    <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('reviews.title')}
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className="h-6 w-6 text-yellow-400" />
                            ))}
                        </div>
                        <span className="text-lg font-semibold text-navy">{averageRating}</span>
                        <span className="text-warm-gray">· {reviews.length} {t('reviews.count')}</span>
                    </div>
                </div>
            </div>

            {/* Carousel */}
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
                    {reviews.map((review) => (
                        <article
                            key={review.id}
                            className="w-[340px] shrink-0 snap-start rounded-2xl border border-sand bg-sand-light p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[400px]"
                        >
                            {/* Quote icon */}
                            <svg className="mb-4 h-8 w-8 text-ocean/20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                            </svg>

                            {/* Quote text */}
                            <blockquote className="mb-5 text-sm leading-relaxed text-navy/80 sm:text-base">
                                &ldquo;{review.quote}&rdquo;
                            </blockquote>

                            {/* Stars */}
                            <div className="mb-4 flex">
                                {[...Array(review.rating)].map((_, i) => (
                                    <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                                ))}
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3 border-t border-sand pt-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean/10 text-sm font-bold text-ocean">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-navy">{review.name}</p>
                                    <p className="text-xs text-warm-gray">{review.country} · {review.date}</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* Dots */}
            <div className="mt-6 flex justify-center gap-2">
                {reviews.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => scrollToIndex(i)}
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${i === activeIndex ? 'scale-125 bg-ocean' : 'bg-navy/15 hover:bg-navy/30'
                            }`}
                        aria-label={`Go to review ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
