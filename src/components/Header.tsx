import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import type { Locale } from '../i18n';

const NAV_KEYS = [
    { key: 'nav.amenities' as const, href: '#amenities' },
    { key: 'nav.gallery' as const, href: '#gallery' },
    { key: 'nav.reviews' as const, href: '#reviews' },
    { key: 'nav.book' as const, href: '#booking' },
    { key: 'nav.contact' as const, href: '#contact' },
];

const LOCALE_FLAGS: Record<Locale, string> = { en: '🇬🇧', es: '🇪🇸', cs: '🇨🇿' };
const LOCALE_LABELS: Record<Locale, string> = { en: 'EN', es: 'ES', cs: 'CZ' };
const LOCALE_FULL_LABELS: Record<Locale, string> = { en: 'English', es: 'Español', cs: 'Česky' };
const LOCALE_ORDER: Locale[] = ['en', 'es', 'cs'];

export default function Header() {
    const { t, locale, setLocale } = useI18n();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
                }`}
        >
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <a href="#" className="flex items-center gap-3" aria-label="Verónica's Flat — Home">
                    <img
                        src="/logo.png"
                        alt="Verónica's Flat logo"
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                    <span
                        className={`font-heading text-lg font-bold tracking-wide transition-colors duration-300 ${scrolled ? 'text-navy' : 'text-white'
                            }`}
                    >
                        Verónica's Flat
                    </span>
                </a>

                {/* Desktop Nav */}
                <ul className="hidden items-center gap-8 md:flex">
                    {NAV_KEYS.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-ocean ${scrolled ? 'text-navy' : 'text-white/90'
                                    }`}
                            >
                                {t(link.key)}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="hidden items-center gap-3 md:flex">
                    {/* Language Dropdown */}
                    <div className="relative" ref={langRef}>
                        <button
                            type="button"
                            onClick={() => setLangOpen(!langOpen)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${scrolled
                                    ? 'bg-sand text-navy hover:bg-sand-light'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            aria-label="Select language"
                            aria-expanded={langOpen}
                            aria-haspopup="listbox"
                        >
                            {LOCALE_FLAGS[locale]} {LOCALE_LABELS[locale]}
                            <svg
                                className={`h-3.5 w-3.5 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {langOpen && (
                            <div
                                className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-sand bg-white shadow-xl"
                                role="listbox"
                                aria-label="Language selection"
                            >
                                {LOCALE_ORDER.map((loc) => (
                                    <button
                                        key={loc}
                                        type="button"
                                        role="option"
                                        aria-selected={locale === loc}
                                        onClick={() => { setLocale(loc); setLangOpen(false); }}
                                        className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${locale === loc
                                                ? 'bg-ocean/10 text-ocean'
                                                : 'text-navy hover:bg-sand-light'
                                            }`}
                                    >
                                        <span className="text-lg">{LOCALE_FLAGS[loc]}</span>
                                        {LOCALE_FULL_LABELS[loc]}
                                        {locale === loc && (
                                            <svg className="ml-auto h-4 w-4 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <a
                        href="#booking"
                        className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-coral-dark hover:shadow-xl"
                    >
                        {t('nav.book')}
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                >
                    <svg
                        className={`h-7 w-7 transition-colors ${scrolled ? 'text-navy' : 'text-white'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        {menuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </nav>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="border-t border-sand bg-white/95 backdrop-blur-md md:hidden">
                    <ul className="flex flex-col px-6 py-4">
                        {NAV_KEYS.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="block py-3 text-sm font-medium text-navy transition-colors hover:text-ocean"
                                >
                                    {t(link.key)}
                                </a>
                            </li>
                        ))}
                        <li className="flex items-center gap-2 py-3">
                            {LOCALE_ORDER.map((loc) => (
                                <button
                                    key={loc}
                                    type="button"
                                    onClick={() => { setLocale(loc); setMenuOpen(false); }}
                                    className={`rounded-full px-4 py-2 text-sm font-medium ${locale === loc
                                        ? 'bg-ocean text-white'
                                        : 'bg-sand text-navy'
                                        }`}
                                >
                                    {LOCALE_FLAGS[loc]} {LOCALE_FULL_LABELS[loc]}
                                </button>
                            ))}
                        </li>
                        <li>
                            <a
                                href="#booking"
                                onClick={() => setMenuOpen(false)}
                                className="mt-2 block rounded-full bg-coral px-6 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
                            >
                                {t('nav.book')}
                            </a>
                        </li>
                    </ul>
                </div>
            )}
        </header>
    );
}
