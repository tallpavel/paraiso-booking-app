import { useRef, useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

// ── SVG Icons — modern dual-tone, 24×24 viewBox ─────────────────────
const icons: Record<string, React.ReactNode> = {
    entirePlace: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10.4V20a1 1 0 001 1h14a1 1 0 001-1v-9.6" stroke="currentColor" strokeWidth={1.5} />
            <path d="M2 11l9.293-8.293a1 1 0 011.414 0L22 11" stroke="currentColor" strokeWidth={1.5} />
            <rect x="9" y="14" width="6" height="7" rx="0.5" fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={1.2} />
            <circle cx="13.5" cy="17.5" r="0.5" fill="currentColor" />
        </svg>
    ),
    oceanView: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="2.5" fill="currentColor" opacity={0.15} stroke="currentColor" strokeWidth={1.5} />
            <path d="M2 13c2-2.5 4.5-3 6.5-2s4 2.5 6.5 0 4.5-2 6.5 0" stroke="currentColor" strokeWidth={1.5} />
            <path d="M2 17.5c2-2 4.5-2.5 6.5-1.5s4 2 6.5 0 4.5-1.5 6.5 0" stroke="currentColor" strokeWidth={1.3} opacity={0.5} />
        </svg>
    ),
    pool: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Swimmer head */}
            <circle cx="6" cy="5.5" r="2" fill="currentColor" opacity={0.15} stroke="currentColor" strokeWidth={1.4} />
            {/* Swimmer body — arm reaching forward */}
            <path d="M6 7.5c1 1 2.5 2 5 2.5l5-3" stroke="currentColor" strokeWidth={1.5} />
            <path d="M6 7.5c1.5 2 3 3.5 5 4" stroke="currentColor" strokeWidth={1.4} />
            {/* Water waves */}
            <path d="M2 15c1.5-1.2 3.5-1.5 5.5-.8s3.5 1.5 5.5.8 3.5-1.5 5.5-.8 3.5 1.2 5.5.8" stroke="currentColor" strokeWidth={1.5} />
            <path d="M2 19c1.5-1 3.5-1.2 5.5-.6s3.5 1.2 5.5.6 3.5-1.2 5.5-.6 3.5 1 5.5.6" stroke="currentColor" strokeWidth={1.3} opacity={0.4} />
        </svg>
    ),
    kidsPool: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Inflatable pool — rounded shape */}
            <path d="M4 12c0-3 3.5-5 8-5s8 2 8 5v4c0 2-3.5 4-8 4s-8-2-8-4v-4z" fill="currentColor" opacity={0.07} stroke="currentColor" strokeWidth={1.5} />
            {/* Pool rim */}
            <path d="M4 12c0 2 3.5 3.5 8 3.5s8-1.5 8-3.5" stroke="currentColor" strokeWidth={1.2} opacity={0.35} />
            {/* Water ripple */}
            <path d="M7 14.5c1.2-.6 2.5-.2 3.8.3s2.5.6 3.8 0 2.5-.2 3.8.3" stroke="currentColor" strokeWidth={1.1} />
            {/* Rubber duck */}
            <circle cx="9" cy="4.5" r="1.8" fill="currentColor" opacity={0.15} stroke="currentColor" strokeWidth={1.3} />
            <path d="M10.8 4.8c.6 0 1.1.2 1.2.6" stroke="currentColor" strokeWidth={1.2} />
            <circle cx="8.6" cy="4" r="0.4" fill="currentColor" />
        </svg>
    ),
    terrace: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11h18" stroke="currentColor" strokeWidth={1.8} />
            <path d="M5 11v10M19 11v10M12 11v7" stroke="currentColor" strokeWidth={1.5} />
            <path d="M12 2c-3.5 0-6.5 2.5-7.5 6h15c-1-3.5-4-6-7.5-6z" fill="currentColor" opacity={0.1} stroke="currentColor" strokeWidth={1.3} />
            <path d="M12 2v9" stroke="currentColor" strokeWidth={1.2} opacity={0.4} />
        </svg>
    ),
    wifi: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="19" r="1.5" fill="currentColor" opacity={0.25} stroke="currentColor" strokeWidth={1.3} />
            <path d="M8.5 15.5a5.5 5.5 0 017 0" stroke="currentColor" strokeWidth={1.5} />
            <path d="M5 12a10 10 0 0114 0" stroke="currentColor" strokeWidth={1.5} />
            <path d="M1.5 8.5a15 15 0 0121 0" stroke="currentColor" strokeWidth={1.5} />
        </svg>
    ),
    ac: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="10" rx="2" fill="currentColor" opacity={0.08} stroke="currentColor" strokeWidth={1.5} />
            <path d="M6 8h12" stroke="currentColor" strokeWidth={1.2} />
            <path d="M6 6h12" stroke="currentColor" strokeWidth={1.2} opacity={0.4} />
            <path d="M8 13v2c0 1.5-2 3-2 4" stroke="currentColor" strokeWidth={1.3} />
            <path d="M12 13v2c0 1.5 0 3 0 4" stroke="currentColor" strokeWidth={1.3} />
            <path d="M16 13v2c0 1.5 2 3 2 4" stroke="currentColor" strokeWidth={1.3} />
        </svg>
    ),
    kitchen: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 3v7a3 3 0 003 3h0a3 3 0 003-3V3" stroke="currentColor" strokeWidth={1.5} />
            <path d="M7 3v18" stroke="currentColor" strokeWidth={1.5} />
            <path d="M7 13h0" stroke="currentColor" strokeWidth={1.5} />
            <path d="M20 3v0a5 5 0 00-5 5v4a2 2 0 002 2h3V3z" fill="currentColor" opacity={0.1} stroke="currentColor" strokeWidth={1.5} />
            <path d="M20 14v7" stroke="currentColor" strokeWidth={1.5} />
        </svg>
    ),
    tv: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="13" rx="2" fill="currentColor" opacity={0.08} stroke="currentColor" strokeWidth={1.5} />
            <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth={1.5} />
            <circle cx="12" cy="10.5" r="2" fill="currentColor" opacity={0.15} />
            <path d="M10.5 9.5l3.5 2-3.5 2v-4z" fill="currentColor" opacity={0.3} />
        </svg>
    ),
    parking: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity={0.08} stroke="currentColor" strokeWidth={1.5} />
            <path d="M9 17V7h4a3.5 3.5 0 010 7H9" stroke="currentColor" strokeWidth={1.8} />
        </svg>
    ),
    washer: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="2" width="18" height="20" rx="2.5" stroke="currentColor" strokeWidth={1.5} />
            <circle cx="12" cy="13.5" r="4.5" fill="currentColor" opacity={0.08} stroke="currentColor" strokeWidth={1.3} />
            <path d="M9.5 12c1-1 2.5-.5 3 .5s2 1.5 3 .5" stroke="currentColor" strokeWidth={1.2} />
            <circle cx="7.5" cy="5" r="0.8" fill="currentColor" />
            <circle cx="10.5" cy="5" r="0.8" fill="currentColor" />
            <line x1="14" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth={1.2} opacity={0.4} />
        </svg>
    ),
    bed: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17V5" stroke="currentColor" strokeWidth={1.5} />
            <path d="M3 9h14a4 4 0 014 4v4" stroke="currentColor" strokeWidth={1.5} />
            <path d="M3 17h18" stroke="currentColor" strokeWidth={1.8} />
            <path d="M3 17v3M21 17v3" stroke="currentColor" strokeWidth={1.3} />
            <path d="M6 9v3h4V9" fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={1.2} />
        </svg>
    ),
    towels: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 3h10a2 2 0 012 2v14a2 2 0 01-2 2H5" stroke="currentColor" strokeWidth={1.5} />
            <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2" stroke="currentColor" strokeWidth={1.5} />
            <path d="M5 3v18" stroke="currentColor" strokeWidth={1.5} />
            <rect x="8" y="7" width="6" height="4" rx="1" fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={1.2} />
            <path d="M8 14h6M8 17h4" stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
        </svg>
    ),
    beach: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Sun */}
            <circle cx="19" cy="5" r="2.5" fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={1.2} />
            {/* Palm trunk — curved */}
            <path d="M9 21c.5-3 1.5-6 2-8.5.8-3.5 1-5.5 1-7.5" stroke="currentColor" strokeWidth={1.6} />
            {/* Leaf canopy — 3 large drooping fronds */}
            <path d="M12 5c-2 0-5 .5-7 3" stroke="currentColor" strokeWidth={1.4} />
            <path d="M12 5c-1.5-1-4-2.5-7-1.5" stroke="currentColor" strokeWidth={1.3} />
            <path d="M12 5c-2 0-5 .5-7 3c1-2.5 4-4.5 7-1.5" fill="currentColor" opacity={0.1} />
            <path d="M12 5c1.5.5 4 2 5 4.5" stroke="currentColor" strokeWidth={1.4} />
            <path d="M12 5c2-.5 5-1 7 .5" stroke="currentColor" strokeWidth={1.3} />
            <path d="M12 5c1.5.5 4 2 5 4.5c-.5-2.5-1.5-4.5-5-4.5c2-.5 5-1 7 .5" fill="currentColor" opacity={0.1} />
            {/* Ocean wave */}
            <path d="M1 18c1.5-1 3-1.5 5-1s3.5 1.5 5.5 1.5 3-1 5-1.5 3.5.5 5 1.5" stroke="currentColor" strokeWidth={1.3} opacity={0.45} />
            {/* Sand line */}
            <path d="M2 21h20" stroke="currentColor" strokeWidth={1.6} />
        </svg>
    ),
    coffee: (
        <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" fill="currentColor" opacity={0.08} stroke="currentColor" strokeWidth={1.5} />
            <path d="M17 9h1.5a3.5 3.5 0 010 7H17" stroke="currentColor" strokeWidth={1.5} />
            <path d="M7 2c0 1.5-.5 2.5 0 3.5S8 7.5 7.5 8" stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
            <path d="M10.5 2c0 1.5-.5 2.5 0 3.5s1 2 .5 2.5" stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
        </svg>
    ),
};

// Amenity list — icon key + i18n label key
const AMENITIES: { icon: string; labelKey: TranslationKey; detailKey?: TranslationKey }[] = [
    { icon: 'entirePlace', labelKey: 'amenity.entirePlace', detailKey: 'amenity.entirePlaceDetail' },
    { icon: 'oceanView', labelKey: 'amenity.oceanView' },
    { icon: 'pool', labelKey: 'amenity.pool', detailKey: 'amenity.poolDetail' },
    { icon: 'kidsPool', labelKey: 'amenity.kidsPool', detailKey: 'amenity.kidsPoolDetail' },
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
