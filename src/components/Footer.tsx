import { PROPERTY_ADDRESS } from '../data';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

const NAV_KEYS: { key: TranslationKey; href: string }[] = [
    { key: 'nav.amenities', href: '#amenities' },
    { key: 'nav.gallery', href: '#gallery' },
    { key: 'nav.reviews', href: '#reviews' },
    { key: 'nav.book', href: '#booking' },
    { key: 'nav.contact', href: '#contact' },
];

export default function Footer() {
    const { t } = useI18n();
    const year = new Date().getFullYear();

    return (
        <footer className="bg-navy text-white/80">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="mb-4 flex items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="Verónica's Flat logo"
                                width={44}
                                height={44}
                                className="h-11 w-11 rounded-full bg-white/10 object-cover"
                            />
                            <span className="font-heading text-lg font-bold text-white">
                                Verónica's Flat
                            </span>
                        </div>
                        <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/60">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
                            {t('footer.quickLinks')}
                        </h3>
                        <ul className="space-y-3">
                            {NAV_KEYS.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-white/60 transition-colors hover:text-white"
                                    >
                                        {t(link.key)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Address */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
                            {t('footer.location')}
                        </h3>
                        <address className="not-italic">
                            <p className="mb-3 text-sm leading-relaxed text-white/60">
                                {PROPERTY_ADDRESS}
                            </p>
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(PROPERTY_ADDRESS)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-ocean transition-colors hover:text-white"
                            >
                                {t('contact.viewMap')}
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </address>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
                            {t('footer.contact')}
                        </h3>
                        <ul className="space-y-3 text-sm text-white/60">
                            <li>
                                <a
                                    href="mailto:info@veronicas-flat.com"
                                    className="transition-colors hover:text-white"
                                >
                                    info@veronicas-flat.com
                                </a>
                            </li>
                            <li>
                                <span>{t('footer.airport')}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-12 border-t border-white/10 pt-8 text-center">
                    <p className="text-xs text-white/40">
                        © {year} {t('footer.copyright')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
