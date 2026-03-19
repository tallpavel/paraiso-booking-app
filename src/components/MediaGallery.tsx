import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { galleryItems } from '../data';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

type Category = 'all' | 'interior' | 'exterior' | 'pool' | 'beach' | 'terrace';

const CATEGORIES: { labelKey: TranslationKey; value: Category; count?: number }[] = [
    { labelKey: 'gallery.all', value: 'all' },
    { labelKey: 'gallery.interior', value: 'interior' },
    { labelKey: 'gallery.terrace', value: 'terrace' },
    { labelKey: 'gallery.pool', value: 'pool' },
    { labelKey: 'gallery.beach', value: 'beach' },
    { labelKey: 'gallery.views', value: 'exterior' },
];

// Map category values to their i18n label keys
const CATEGORY_LABEL_MAP: Record<Category, TranslationKey> = Object.fromEntries(
    CATEGORIES.map((c) => [c.value, c.labelKey])
) as Record<Category, TranslationKey>;

// Map gallery item ID to translation key for alt text
const getAltKey = (id: number): TranslationKey => `gallery.alt${id}` as TranslationKey;

export default function MediaGallery() {
    const { t } = useI18n();
    const [activeCategory, setActiveCategory] = useState<Category>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    const filtered =
        activeCategory === 'all'
            ? galleryItems
            : galleryItems.filter((item) => item.category === activeCategory);

    const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
    const closeLightbox = useCallback(() => setLightboxIndex(null), []);

    const navigate = useCallback(
        (dir: 1 | -1) => {
            if (lightboxIndex === null) return;
            const next = lightboxIndex + dir;
            if (next >= 0 && next < filtered.length) setLightboxIndex(next);
        },
        [lightboxIndex, filtered.length],
    );

    // Keyboard navigation in lightbox
    useEffect(() => {
        if (lightboxIndex === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [lightboxIndex, navigate, closeLightbox]);

    // Intersection observer for scroll-triggered reveal
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

    // ── Scroll state tracking ────────────────────────────────────────
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
        return () => el.removeEventListener('scroll', updateScrollState);
    }, [filtered, updateScrollState]);

    const scroll = useCallback((dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.7;
        el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }, []);

    // Compute number of indicator dots
    const dotCount = useMemo(() => {
        const cardWidth = 460 + 16;
        return Math.max(1, Math.ceil(filtered.length / Math.max(1, Math.floor(1400 / cardWidth))));
    }, [filtered.length]);

    const activeDot = Math.min(Math.round(scrollProgress * (dotCount - 1)), dotCount - 1);

    // Category counts for badge numbers
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: galleryItems.length };
        galleryItems.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });
        return counts;
    }, []);

    return (
        <section id="gallery" ref={sectionRef} className="relative bg-sand-light py-20 sm:py-28 overflow-hidden">
            {/* Decorative background elements */}
            <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-ocean/[0.03] blur-3xl" />
            <div className="pointer-events-none absolute left-0 bottom-0 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-coral/[0.03] blur-3xl" />

            <div className="mx-auto max-w-7xl px-6">
                {/* Header with editorial styling */}
                <div className={`mb-14 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    {/* Decorative line */}
                    <div className="mx-auto mb-6 flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-ocean/40" />
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ocean">
                            {t('gallery.label')}
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-ocean/40" />
                    </div>
                    <h2 className="mb-4 text-center font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('gallery.title')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-warm-gray">
                        {t('gallery.subtitle')}
                    </p>
                </div>

                {/* Category Filters — editorial pill style with counts */}
                <div className={`mb-10 flex flex-wrap justify-center gap-2.5 transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    {CATEGORIES.map((cat) => {
                        const count = categoryCounts[cat.value] || 0;
                        const isActive = activeCategory === cat.value;
                        return (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setActiveCategory(cat.value)}
                                className={`group relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${isActive
                                    ? 'bg-navy text-white shadow-lg shadow-navy/20'
                                    : 'bg-white text-navy ring-1 ring-navy/8 hover:ring-ocean/30 hover:bg-ocean/5'
                                    }`}
                            >
                                <span>{t(cat.labelKey)}</span>
                                <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-[11px] font-bold transition-colors ${isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-navy/5 text-navy/40 group-hover:bg-ocean/10 group-hover:text-ocean'
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Carousel — constrained width */}
            <div className={`relative mx-auto max-w-[1400px] transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
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
                    className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide snap-x snap-mandatory focus:outline-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    tabIndex={0}
                    role="region"
                    aria-label="Gallery images"
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') scroll('left');
                        if (e.key === 'ArrowRight') scroll('right');
                    }}
                >
                    {filtered.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => openLightbox(index)}
                            className="group relative h-[300px] w-[400px] shrink-0 snap-start overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2 sm:h-[380px] sm:w-[520px]"
                            aria-label={`View: ${t(getAltKey(item.id))}`}
                        >
                            <img
                                src={item.src}
                                alt={t(getAltKey(item.id))}
                                width={600}
                                height={450}
                                loading="lazy"
                                className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                            />
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/0 to-navy/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                            {/* Bottom info bar — slides up on hover */}
                            <div className="absolute bottom-0 left-0 right-0 translate-y-full p-5 transition-transform duration-500 group-hover:translate-y-0">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-white/70">{t(getAltKey(item.id))}</p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/30">
                                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Category badge — top-left */}
                            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy shadow-sm backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100">
                                {t(CATEGORY_LABEL_MAP[item.category as Category] || ('gallery.' + item.category) as TranslationKey)}
                            </div>

                            {/* Image number — top-right */}
                            <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-xs font-bold text-white backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100">
                                {index + 1}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Scroll progress bar + dots */}
                <div className="mt-8 flex flex-col items-center gap-3">
                    {/* Progress bar */}
                    <div className="h-0.5 w-32 overflow-hidden rounded-full bg-navy/10">
                        <div
                            className="h-full rounded-full bg-ocean transition-all duration-300"
                            style={{ width: `${Math.max(10, scrollProgress * 100)}%` }}
                        />
                    </div>
                    {/* Dots */}
                    <div className="flex gap-2">
                        {[...Array(dotCount)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i === activeDot ? 'w-5 bg-ocean' : 'w-1.5 bg-navy/15'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Cinematic Lightbox ────────────────────────────────────── */}
            {lightboxIndex !== null && filtered[lightboxIndex] && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in"
                    onClick={closeLightbox}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image viewer"
                >
                    {/* Top bar */}
                    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur-sm">
                                {lightboxIndex + 1} / {filtered.length}
                            </span>
                            <span className="text-sm text-white/50">
                                {t(getAltKey(filtered[lightboxIndex].id))}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={closeLightbox}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                            aria-label="Close lightbox"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation arrows */}
                    {lightboxIndex > 0 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 sm:left-6"
                            aria-label="Previous image"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {lightboxIndex < filtered.length - 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate(1); }}
                            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 sm:right-6"
                            aria-label="Next image"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {/* Main image */}
                    <img
                        src={filtered[lightboxIndex].src}
                        alt={t(getAltKey(filtered[lightboxIndex].id))}
                        className="max-h-[82vh] max-w-[90vw] rounded-xl object-contain shadow-2xl ring-1 ring-white/10"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Bottom thumbnail strip */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="mx-auto flex max-w-2xl justify-center gap-2 overflow-x-auto py-2">
                            {filtered.map((item, i) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setLightboxIndex(i)}
                                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                                        i === lightboxIndex
                                            ? 'ring-2 ring-white shadow-lg scale-105'
                                            : 'opacity-40 hover:opacity-70 ring-1 ring-white/10'
                                    }`}
                                >
                                    <img src={item.src} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
