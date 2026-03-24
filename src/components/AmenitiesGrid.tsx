import { useRef, useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

// ── SVG Icons — stroke-based, 24×24 viewBox ─────────────────────────
const icons: Record<string, React.ReactNode> = {
    oceanView: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12c1.5-2 3.5-3 5.5-3s4 1 5.5 3c1.5-2 3.5-3 5.5-3s4 1 5.5 3" />
            <path d="M2 17c1.5-2 3.5-3 5.5-3s4 1 5.5 3c1.5-2 3.5-3 5.5-3s4 1 5.5 3" />
            <circle cx="17" cy="5" r="3" />
        </svg>
    ),
    pool: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 15c1.5 1.5 3.5 2 5.5 1.5S11 15 13 15s3.5 1 5.5 1.5S22 15 24 13.5" />
            <path d="M2 19c1.5 1.5 3.5 2 5.5 1.5S11 19 13 19s3.5 1 5.5 1.5S22 19 24 17.5" />
            <path d="M8 3v9" />
            <path d="M16 6v6" />
            <path d="M8 6h8a2 2 0 0 1 2 2v0" />
        </svg>
    ),
    wifi: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h.01" />
            <path d="M8.5 16.5a5 5 0 0 1 7 0" />
            <path d="M5 12.5a10 10 0 0 1 14 0" />
            <path d="M1.5 8.5a15 15 0 0 1 21 0" />
        </svg>
    ),
    terrace: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v8" />
            <path d="M8 6c0-2.2 1.8-4 4-4s4 1.8 4 4" />
            <path d="M5 10c0-3.9 3.1-7 7-7s7 3.1 7 7" />
            <rect x="3" y="10" width="18" height="2" rx="1" />
            <path d="M6 12v10" />
            <path d="M18 12v10" />
            <path d="M12 12v6" />
        </svg>
    ),
    ac: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v10" />
            <path d="M18.364 5.636l-6.364 6.364" />
            <path d="M20 12h-10" />
            <path d="M5.636 5.636l6.364 6.364" />
            <path d="M12 22v-4" />
            <path d="M9 18c0 0 1.5 2 3 2s3-2 3-2" />
            <path d="M6 14c0 0 2 4 6 4s6-4 6-4" />
        </svg>
    ),
    kitchen: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
        </svg>
    ),
    tv: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="14" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 18v3" />
        </svg>
    ),
    parking: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M9 17V7h4a3.5 3.5 0 0 1 0 7H9" />
        </svg>
    ),
    entirePlace: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    bathroom: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" />
            <path d="M6 12V5a2 2 0 0 1 2-2h1" />
            <path d="M7 20v2" />
            <path d="M17 20v2" />
        </svg>
    ),
    washer: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="2" width="18" height="20" rx="2" />
            <circle cx="12" cy="13" r="5" />
            <circle cx="12" cy="13" r="2" />
            <path d="M7 5h.01" />
            <path d="M10 5h.01" />
        </svg>
    ),
    bed: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4v16" />
            <path d="M2 8h18a2 2 0 0 1 2 2v10" />
            <path d="M2 17h20" />
            <path d="M6 8v3" />
        </svg>
    ),
    towels: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M8 6h8" />
            <path d="M8 10h8" />
            <path d="M8 14h4" />
        </svg>
    ),
    beach: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 8c0-2.76-2.24-5-5-5-.55 0-1.08.1-1.57.28C7.38 1.92 9.06 1 11 1c3.31 0 6 2.69 6 6" />
            <path d="M13 8c0-2.76 2.24-5 5-5 .55 0 1.08.1 1.57.28C18.62 1.92 16.94 1 15 1" />
            <path d="M13 8v13" />
            <path d="M4 21h16" />
        </svg>
    ),
    coffee: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
            <path d="M6 2v3" />
            <path d="M10 2v3" />
            <path d="M14 2v3" />
        </svg>
    ),
};

// Amenity list — icon key + i18n label key
const AMENITIES: { icon: string; labelKey: TranslationKey; detailKey?: TranslationKey }[] = [
    { icon: 'entirePlace', labelKey: 'amenity.entirePlace', detailKey: 'amenity.entirePlaceDetail' },
    { icon: 'oceanView', labelKey: 'amenity.oceanView' },
    { icon: 'pool', labelKey: 'amenity.pool', detailKey: 'amenity.poolDetail' },
    { icon: 'pool', labelKey: 'amenity.kidsPool', detailKey: 'amenity.kidsPoolDetail' },
    { icon: 'terrace', labelKey: 'amenity.terrace' },
    { icon: 'wifi', labelKey: 'amenity.wifi' },
    { icon: 'ac', labelKey: 'amenity.ac', detailKey: 'amenity.acDetail' },
    { icon: 'kitchen', labelKey: 'amenity.kitchen' },
    { icon: 'tv', labelKey: 'amenity.tv', detailKey: 'amenity.tvDetail' },
    { icon: 'parking', labelKey: 'amenity.parking' },
    { icon: 'washer', labelKey: 'amenity.washer' },
    { icon: 'bed', labelKey: 'amenity.bed' },
    { icon: 'towels', labelKey: 'amenity.towels' },
    { icon: 'beach', labelKey: 'amenity.beach', detailKey: 'amenity.beachDetail' },
    { icon: 'coffee', labelKey: 'amenity.coffee' },
];

export default function AmenitiesGrid() {
    const { t } = useI18n();
    const sectionRef = useRef<HTMLElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateScrollState, { passive: true });
        updateScrollState();
        return () => el.removeEventListener('scroll', updateScrollState);
    }, []);



    return (
        <section
            id="amenities"
            ref={sectionRef}
            className="relative bg-white py-20 sm:py-24 overflow-hidden"
        >
            {/* Subtle dot texture */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                backgroundSize: '32px 32px',
            }} />

            <div className="relative mx-auto max-w-7xl px-6">
                {/* Section Header */}
                <div className={`mb-10 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <div className="mx-auto mb-6 flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-ocean/40" />
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ocean">
                            {t('amenities.label')}
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-ocean/40" />
                    </div>
                    <h2 className="mb-4 text-center font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('amenities.title')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-warm-gray">
                        {t('amenities.subtitle')}
                    </p>
                </div>
            </div>

            {/* Mobile: Swipeable 2-page grid (< lg) */}
            <div className={`relative lg:hidden transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {/* Edge fade gradients */}
                <div className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />

                {/* Scrollable pages */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* Page 1: first 8 — slightly narrower to peek page 2 */}
                    <div className="w-[92%] shrink-0 snap-center pl-6 pr-3">
                        <div className="grid auto-rows-fr grid-cols-2 gap-3">
                            {AMENITIES.slice(0, 8).map((amenity) => (
                                <div
                                    key={amenity.labelKey}
                                    className="group flex min-h-[4.5rem] items-center gap-3 rounded-2xl bg-sand-light/60 px-4 py-3.5 ring-1 ring-navy/[0.04]"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-ocean shadow-sm ring-1 ring-navy/[0.05]">
                                        <div className="h-[18px] w-[18px]">
                                            {icons[amenity.icon]}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[13px] font-medium leading-tight text-navy">
                                            {t(amenity.labelKey)}
                                        </span>
                                        {amenity.detailKey && (
                                            <p className="mt-0.5 text-[11px] leading-tight text-warm-gray">{t(amenity.detailKey)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Page 2: remaining amenities */}
                    <div className="w-[92%] shrink-0 snap-center pl-3 pr-6">
                        <div className="grid auto-rows-fr grid-cols-2 gap-3">
                            {AMENITIES.slice(8).map((amenity) => (
                                <div
                                    key={amenity.labelKey}
                                    className="group flex min-h-[4.5rem] items-center gap-3 rounded-2xl bg-sand-light/60 px-4 py-3.5 ring-1 ring-navy/[0.04]"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-ocean shadow-sm ring-1 ring-navy/[0.05]">
                                        <div className="h-[18px] w-[18px]">
                                            {icons[amenity.icon]}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[13px] font-medium leading-tight text-navy">
                                            {t(amenity.labelKey)}
                                        </span>
                                        {amenity.detailKey && (
                                            <p className="mt-0.5 text-[11px] leading-tight text-warm-gray">{t(amenity.detailKey)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Page dots + swipe hint */}
                <div className="mt-5 flex flex-col items-center gap-2.5">
                    <div className="flex items-center gap-2">
                        <span className={`h-1.5 rounded-full transition-all duration-300 ${!canScrollLeft ? 'w-5 bg-ocean' : 'w-1.5 bg-navy/15'}`} />
                        <span className={`h-1.5 rounded-full transition-all duration-300 ${canScrollLeft ? 'w-5 bg-ocean' : 'w-1.5 bg-navy/15'}`} />
                    </div>
                    {/* Animated swipe hint — fades out after swiping */}
                    <div className={`flex items-center gap-1.5 transition-all duration-500 ${canScrollRight && !canScrollLeft ? 'translate-x-0 opacity-60' : 'translate-x-2 opacity-0'}`}>
                        <span className="text-xs font-medium tracking-wide text-navy/50">Swipe for more</span>
                        <svg className="h-3.5 w-3.5 text-navy/40 animate-[swipeHint_1.5s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Desktop: 5-column grid (>= lg) */}
            <div className={`relative mx-auto hidden max-w-7xl px-6 lg:block transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="grid grid-cols-5 gap-3">
                    {AMENITIES.map((amenity, i) => (
                        <div
                            key={amenity.labelKey}
                            className={`group flex items-center gap-3.5 rounded-2xl bg-sand-light/60 px-5 py-4 ring-1 ring-navy/[0.04] transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-ocean/[0.06] hover:ring-ocean/20 hover:-translate-y-0.5 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                            style={{ transitionDelay: `${200 + i * 50}ms` }}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ocean shadow-sm ring-1 ring-navy/[0.05] transition-all duration-300 group-hover:bg-ocean group-hover:text-white group-hover:shadow-md group-hover:shadow-ocean/20 group-hover:ring-ocean/30">
                                <div className="h-5 w-5">
                                    {icons[amenity.icon]}
                                </div>
                            </div>
                            <div className="min-w-0">
                                <span className="text-sm font-medium leading-tight text-navy">
                                    {t(amenity.labelKey)}
                                </span>
                                {amenity.detailKey && (
                                    <p className="mt-0.5 truncate text-xs leading-tight text-warm-gray">{t(amenity.detailKey)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
