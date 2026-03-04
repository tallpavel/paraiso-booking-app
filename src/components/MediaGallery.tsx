import { useState, useCallback, useRef, useEffect } from 'react';
import { galleryItems } from '../data';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

type Category = 'all' | 'interior' | 'exterior' | 'pool' | 'beach' | 'terrace';

const CATEGORIES: { labelKey: TranslationKey; value: Category }[] = [
    { labelKey: 'gallery.all', value: 'all' },
    { labelKey: 'gallery.interior', value: 'interior' },
    { labelKey: 'gallery.terrace', value: 'terrace' },
    { labelKey: 'gallery.pool', value: 'pool' },
    { labelKey: 'gallery.beach', value: 'beach' },
    { labelKey: 'gallery.views', value: 'exterior' },
];

export default function MediaGallery() {
    const { t } = useI18n();
    const [activeCategory, setActiveCategory] = useState<Category>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

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

    // ── Scroll state tracking ────────────────────────────────────────
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
        return () => el.removeEventListener('scroll', updateScrollState);
    }, [filtered, updateScrollState]);

    const scroll = useCallback((dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.7;
        el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }, []);

    return (
        <section id="gallery" className="bg-[#f7f5f0] py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-12 text-center">
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                        {t('gallery.label')}
                    </span>
                    <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('gallery.title')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-warm-gray">
                        {t('gallery.subtitle')}
                    </p>
                </div>

                {/* Category Filters */}
                <div className="mb-8 flex flex-wrap justify-center gap-3">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => setActiveCategory(cat.value)}
                            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${activeCategory === cat.value
                                ? 'bg-ocean text-white shadow-lg'
                                : 'bg-white text-navy hover:bg-ocean/10'
                                }`}
                        >
                            {t(cat.labelKey)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Carousel — full-width */}
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
                    className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {filtered.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => openLightbox(index)}
                            className="group relative h-[280px] w-[380px] shrink-0 snap-start overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2 sm:h-[340px] sm:w-[460px]"
                            aria-label={`View: ${item.alt}`}
                        >
                            <img
                                src={item.src}
                                alt={item.alt}
                                width={600}
                                height={450}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-navy/0 transition-all duration-300 group-hover:bg-navy/30" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && filtered[lightboxIndex] && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                    onClick={closeLightbox}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image viewer"
                >
                    <button
                        type="button"
                        onClick={closeLightbox}
                        className="absolute right-6 top-6 text-white/80 transition-colors hover:text-white"
                        aria-label="Close lightbox"
                    >
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {lightboxIndex > 0 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
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
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                            aria-label="Next image"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    <img
                        src={filtered[lightboxIndex].src}
                        alt={filtered[lightboxIndex].alt}
                        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white/80">
                        {lightboxIndex + 1} / {filtered.length}
                    </p>
                </div>
            )}
        </section>
    );
}
