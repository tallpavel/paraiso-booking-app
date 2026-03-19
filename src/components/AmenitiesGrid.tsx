import { useState, useRef, useCallback, useEffect } from 'react';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

// ── Modern SVG Icons (stroke-based, consistent 24×24 viewBox) ────────
const icons = {
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
            <circle cx="12" cy="11" r="0" />
        </svg>
    ),
    parking: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M9 17V7h4a3.5 3.5 0 0 1 0 7H9" />
        </svg>
    ),
};

const AMENITY_KEYS: { icon: keyof typeof icons; titleKey: TranslationKey; descKey: TranslationKey }[] = [
    { icon: 'oceanView', titleKey: 'amenity.oceanView', descKey: 'amenity.oceanViewDesc' },
    { icon: 'pool', titleKey: 'amenity.pool', descKey: 'amenity.poolDesc' },
    { icon: 'wifi', titleKey: 'amenity.wifi', descKey: 'amenity.wifiDesc' },
    { icon: 'terrace', titleKey: 'amenity.terrace', descKey: 'amenity.terraceDesc' },
    { icon: 'ac', titleKey: 'amenity.ac', descKey: 'amenity.acDesc' },
    { icon: 'kitchen', titleKey: 'amenity.kitchen', descKey: 'amenity.kitchenDesc' },
    { icon: 'tv', titleKey: 'amenity.tv', descKey: 'amenity.tvDesc' },
    { icon: 'parking', titleKey: 'amenity.parking', descKey: 'amenity.parkingDesc' },
];

function AmenityCard({ amenity, index }: { amenity: (typeof AMENITY_KEYS)[number]; index: number }) {
    const { t } = useI18n();
    const padded = String(index + 1).padStart(2, '0');

    return (
        <article
            className="amenity-card group relative overflow-hidden rounded-2xl bg-white p-7 text-left ring-1 ring-navy/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:ring-ocean/30"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Faint editorial index number */}
            <span
                className="pointer-events-none absolute -right-2 -top-3 font-heading text-[5rem] font-bold leading-none text-navy/[0.03] transition-colors duration-500 group-hover:text-ocean/[0.07]"
                aria-hidden="true"
            >
                {padded}
            </span>

            {/* Accent line */}
            <div className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 rounded-r-full bg-gradient-to-b from-ocean to-ocean/50 transition-transform duration-500 group-hover:scale-y-100" />

            {/* Icon container */}
            <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-ocean/8 to-ocean/3 text-ocean transition-all duration-500 group-hover:from-ocean group-hover:to-ocean-dark group-hover:text-white group-hover:shadow-lg group-hover:shadow-ocean/25 group-hover:scale-110">
                <div className="h-7 w-7">
                    {icons[amenity.icon]}
                </div>
            </div>

            {/* Title */}
            <h3 className="mb-2 font-heading text-lg font-bold tracking-tight text-navy">
                {t(amenity.titleKey)}
            </h3>

            {/* Description */}
            <p className="text-sm leading-relaxed text-warm-gray">
                {t(amenity.descKey)}
            </p>
        </article>
    );
}

export default function AmenitiesGrid() {
    const { t } = useI18n();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Intersection observer for scroll-triggered fade-in
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

    const updateActiveIdx = useCallback(() => {
        const el = scrollRef.current;
        if (!el || !el.firstElementChild) return;
        const cardWidth = (el.firstElementChild as HTMLElement).offsetWidth + 16;
        setActiveIdx(Math.round(el.scrollLeft / cardWidth));
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateActiveIdx, { passive: true });
        return () => el.removeEventListener('scroll', updateActiveIdx);
    }, [updateActiveIdx]);

    const scrollToIdx = useCallback((idx: number) => {
        const el = scrollRef.current;
        if (!el) return;
        const card = el.children[idx] as HTMLElement;
        if (card) el.scrollTo({ left: card.offsetLeft - 24, behavior: 'smooth' });
    }, []);

    return (
        <section
            id="amenities"
            ref={sectionRef}
            className="relative bg-white py-20 sm:py-28 overflow-hidden"
        >
            {/* Subtle background texture */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                backgroundSize: '32px 32px',
            }} />

            {/* Section Header */}
            <div className="relative mx-auto max-w-7xl px-6">
                <div className={`mb-16 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    {/* Decorative line */}
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

            {/* Mobile: horizontal carousel */}
            <div className="lg:hidden">
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {AMENITY_KEYS.map((amenity, i) => (
                        <div key={amenity.titleKey} className="w-[75vw] shrink-0 snap-start sm:w-[45vw]">
                            <AmenityCard amenity={amenity} index={i} />
                        </div>
                    ))}
                </div>

                {/* Swipe indicator dots */}
                <div className="mt-4 flex justify-center gap-2">
                    {AMENITY_KEYS.map((amenity, i) => (
                        <button
                            key={amenity.titleKey}
                            type="button"
                            onClick={() => scrollToIdx(i)}
                            className={`h-2 rounded-full transition-all duration-200 ${i === activeIdx ? 'w-6 bg-ocean' : 'w-2 bg-navy/15 hover:bg-navy/30'
                                }`}
                            aria-label={`Go to ${t(amenity.titleKey)}`}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop: 4-column grid with staggered reveal */}
            <div className="relative mx-auto hidden max-w-7xl px-6 lg:block">
                <div className="grid grid-cols-4 gap-5">
                    {AMENITY_KEYS.map((amenity, i) => (
                        <div
                            key={amenity.titleKey}
                            className={`transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                            style={{ transitionDelay: `${200 + i * 80}ms` }}
                        >
                            <AmenityCard amenity={amenity} index={i} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
