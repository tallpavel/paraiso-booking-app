import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

const AMENITY_KEYS: { icon: string; titleKey: TranslationKey; descKey: TranslationKey }[] = [
    { icon: '🌊', titleKey: 'amenity.oceanView', descKey: 'amenity.oceanViewDesc' },
    { icon: '🏊', titleKey: 'amenity.pool', descKey: 'amenity.poolDesc' },
    { icon: '📶', titleKey: 'amenity.wifi', descKey: 'amenity.wifiDesc' },
    { icon: '🌴', titleKey: 'amenity.terrace', descKey: 'amenity.terraceDesc' },
    { icon: '❄️', titleKey: 'amenity.ac', descKey: 'amenity.acDesc' },
    { icon: '🍳', titleKey: 'amenity.kitchen', descKey: 'amenity.kitchenDesc' },
    { icon: '📺', titleKey: 'amenity.tv', descKey: 'amenity.tvDesc' },
    { icon: '🅿️', titleKey: 'amenity.parking', descKey: 'amenity.parkingDesc' },
];

export default function AmenitiesGrid() {
    const { t } = useI18n();

    return (
        <section id="amenities" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Section Header */}
                <div className="mb-16 text-center">
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                        {t('amenities.label')}
                    </span>
                    <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('amenities.title')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-warm-gray">
                        {t('amenities.subtitle')}
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {AMENITY_KEYS.map((amenity) => (
                        <article
                            key={amenity.titleKey}
                            className="group rounded-2xl border border-sand bg-sand-light p-8 transition-all duration-300 hover:-translate-y-1 hover:border-ocean/20 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-ocean/10 text-3xl transition-transform duration-300 group-hover:scale-110">
                                {amenity.icon}
                            </div>
                            <h3 className="mb-2 font-heading text-lg font-bold text-navy">
                                {t(amenity.titleKey)}
                            </h3>
                            <p className="text-sm leading-relaxed text-warm-gray">
                                {t(amenity.descKey)}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
