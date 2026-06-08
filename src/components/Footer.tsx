import { PROPERTY_ADDRESS } from '../data';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function Footer() {
    const { t } = useI18n();
    const year = new Date().getFullYear();

    return (
        <footer className="bg-navy text-white/80">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f6efdb]">
                                <img
                                    src="/logo.png"
                                    alt="Verónica's Flat logo"
                                    width={44}
                                    height={44}
                                    className="h-[70%] w-[70%] object-contain"
                                />
                            </div>
                            <span className="font-heading text-lg font-bold text-white">
                                Verónica's Flat
                            </span>
                        </div>
                        <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/60">
                            {t('footer.description')}
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            <a
                                href="https://www.instagram.com/veronicasflat/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all duration-200 hover:bg-white/20 hover:text-white"
                                aria-label="Instagram"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.facebook.com/veronicasflat"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all duration-200 hover:bg-white/20 hover:text-white"
                                aria-label="Facebook"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        </div>
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
                                    href="mailto:info@veronicasflat.com"
                                    className="inline-flex items-center gap-2 transition-colors hover:text-white"
                                >
                                    <svg className="h-4 w-4 shrink-0 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    info@veronicasflat.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="h-4 w-4 shrink-0 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                                <span>{t('footer.airport')}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* VV Licence Badge */}
                <div className="mt-12 border-t border-white/10 pt-8">
                    <div className="mb-6 flex justify-center">
                        <div className="vv-licence-badge">
                            <div className="vv-licence-icon">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <div className="vv-licence-text">
                                <span className="vv-licence-label">{t('footer.vvLicence')}</span>
                                <span className="vv-licence-number">{t('footer.vvNumber')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Copyright + Links */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                        <p className="text-xs text-white/40">
                            © {year} {t('footer.copyright')}
                        </p>
                        <div className="flex items-center gap-6 text-xs text-white/40">
                            <Link to="/terms" className="transition-colors hover:text-white/60">{t('footer.privacy')}</Link>
                            <Link to="/terms" className="transition-colors hover:text-white/60">{t('footer.terms')}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
