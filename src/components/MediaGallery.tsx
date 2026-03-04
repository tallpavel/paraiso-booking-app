import { useState, useCallback } from 'react';
import { galleryItems } from '../data';

type Category = 'all' | 'interior' | 'exterior' | 'pool' | 'beach' | 'terrace';

const CATEGORIES: { label: string; value: Category }[] = [
    { label: 'All', value: 'all' },
    { label: 'Interior', value: 'interior' },
    { label: 'Terrace', value: 'terrace' },
    { label: 'Pool', value: 'pool' },
    { label: 'Beach', value: 'beach' },
    { label: 'Views', value: 'exterior' },
];

export default function MediaGallery() {
    const [activeCategory, setActiveCategory] = useState<Category>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

    return (
        <section id="gallery" className="bg-sand-light py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-12 text-center">
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                        Gallery
                    </span>
                    <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        Take a Look Inside
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-warm-gray">
                        Explore every corner of the flat and the stunning Playa Paraíso surroundings.
                    </p>
                </div>

                {/* Category Filters */}
                <div className="mb-10 flex flex-wrap justify-center gap-3">
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
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => openLightbox(index)}
                            className="group relative aspect-[4/3] overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2"
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
