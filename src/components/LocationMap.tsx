import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

import type { ReactNode } from 'react';

const FLAT_ADDRESS = 'Av. Adeje 300, 16, 38678 Adeje, Santa Cruz de Tenerife, Spain';

const NEARBY: { icon: ReactNode; titleKey: TranslationKey; distKey: TranslationKey }[] = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M2 12c1.5-2 3.5-3 5.5-3s4 1 5.5 3c1.5-2 3.5-3 5.5-3s4 1 5.5 3" />
                <path d="M2 17c1.5-2 3.5-3 5.5-3s4 1 5.5 3c1.5-2 3.5-3 5.5-3s4 1 5.5 3" />
            </svg>
        ),
        titleKey: 'map.beach',
        distKey: 'map.beachDist',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <path d="M6 1v3M10 1v3M14 1v3" />
            </svg>
        ),
        titleKey: 'map.restaurants',
        distKey: 'map.restaurantsDist',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
            </svg>
        ),
        titleKey: 'map.supermarket',
        distKey: 'map.supermarketDist',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
        ),
        titleKey: 'map.pharmacy',
        distKey: 'map.pharmacyDist',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <rect x="2" y="4" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 18v3" />
            </svg>
        ),
        titleKey: 'map.pool',
        distKey: 'map.poolDist',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
            </svg>
        ),
        titleKey: 'map.airport',
        distKey: 'map.airportDist',
    },
];

export default function LocationMap() {
    const { t } = useI18n();

    return (
        <section id="location" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-12 text-center">
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                        {t('map.label')}
                    </span>
                    <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('map.title')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-warm-gray">
                        {t('map.subtitle')}
                    </p>
                </div>

                {/* Map + sidebar */}
                <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                    {/* Google Maps embed */}
                    <div className="relative overflow-hidden rounded-2xl shadow-lg" style={{ minHeight: '400px' }}>
                        <iframe
                            title={t('map.title')}
                            src="https://www.google.com/maps?q=Paraiso+Del+Sur+Apartments,+Adeje,+Tenerife&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0, position: 'absolute', inset: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>

                    {/* Nearby places sidebar */}
                    <div className="flex flex-col gap-3">
                        <h3 className="mb-2 font-heading text-lg font-bold text-navy">
                            {t('map.nearby')}
                        </h3>

                        {NEARBY.map((place) => (
                            <div
                                key={place.titleKey}
                                className="flex items-center gap-4 rounded-xl bg-sand-light p-4 transition-all duration-200 hover:bg-ocean/5 hover:shadow-sm"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ocean/10 text-ocean">
                                    {place.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-navy">{t(place.titleKey)}</p>
                                    <p className="text-xs text-warm-gray">{t(place.distKey)}</p>
                                </div>
                            </div>
                        ))}

                        {/* Directions link */}
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(FLAT_ADDRESS)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-ocean py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-ocean-dark hover:shadow-xl"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {t('map.directions')}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
