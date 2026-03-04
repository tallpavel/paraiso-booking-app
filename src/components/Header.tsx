import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import type { Locale } from '../i18n';

const NAV_KEYS = [
    { key: 'nav.amenities' as const, href: '#amenities' },
    { key: 'nav.gallery' as const, href: '#gallery' },
    { key: 'nav.discover' as const, href: '#discover' },
    { key: 'nav.reviews' as const, href: '#reviews' },
];

const LOCALE_FLAGS: Record<Locale, string> = { en: '🇬🇧', es: '🇪🇸', cs: '🇨🇿' };
const LOCALE_LABELS: Record<Locale, string> = { en: 'EN', es: 'ES', cs: 'CZ' };
const LOCALE_FULL_LABELS: Record<Locale, string> = { en: 'English', es: 'Español', cs: 'Česky' };
const LOCALE_ORDER: Locale[] = ['en', 'es', 'cs'];

export default function Header() {
    const { t, locale, setLocale } = useI18n();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Scroll spy: track which section is in view
    useEffect(() => {
        const ids = NAV_KEYS.map((l) => l.href.slice(1));
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection('#' + entry.target.id);
                    }
                }
            },
            { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
        );
        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
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

    const showNav = scrolled || menuOpen;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showNav ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
                }`}
        >
            <nav className={`mx-auto flex max-w-7xl items-center justify-between px-6 relative transition-all duration-500 ${showNav ? 'py-4' : 'py-6'}`}>
                {/* Logo — hidden initially, appears on scroll */}
                <a
                    href="#"
                    className={`flex items-center gap-3 transition-all duration-500 ${showNav ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                        }`}
                    aria-label="Verónica's Flat — Home"
                >
                    <img
                        src="/logo.png"
                        alt="Verónica's Flat logo"
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                    <span className="font-heading text-lg font-bold tracking-wide text-navy">
                        Verónica's Flat
                    </span>
                </a>

                {/* Desktop Nav */}
                <ul className={`hidden items-center gap-8 md:flex transition-all duration-300 ${showNav ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {NAV_KEYS.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-ocean ${activeSection === link.href
                                    ? 'text-ocean'
                                    : scrolled ? 'text-navy' : 'text-white/90'
                                    }`}
                            >
                                {t(link.key)}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className={`hidden items-center gap-3 md:flex transition-all duration-300 ${showNav ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-booking'))}
                        className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-coral-dark hover:shadow-xl"
                    >
                        {t('nav.book')}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-lg md:hidden transition-all duration-300 ${showNav ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        } ${scrolled ? 'hover:bg-sand-light' : 'hover:bg-white/10'}`}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                >
                    <div className="flex h-5 w-6 flex-col items-center justify-center">
                        <span className={`block h-0.5 w-6 rounded-full transition-all duration-300 ${scrolled ? 'bg-navy' : 'bg-white'
                            } ${menuOpen ? 'translate-y-[5px] rotate-45' : ''}`} />
                        <span className={`mt-[4px] block h-0.5 rounded-full transition-all duration-300 ${scrolled ? 'bg-navy' : 'bg-white'
                            } ${menuOpen ? 'w-0 opacity-0' : 'w-6 opacity-100'}`} />
                        <span className={`mt-[4px] block h-0.5 w-6 rounded-full transition-all duration-300 ${scrolled ? 'bg-navy' : 'bg-white'
                            } ${menuOpen ? '-translate-y-[5px] -rotate-45' : ''}`} />
                    </div>
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
                                    className={`block py-3 text-sm font-medium transition-colors hover:text-ocean ${activeSection === link.href ? 'text-ocean' : 'text-navy'
                                        }`}
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
                            <button
                                type="button"
                                onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-booking')); }}
                                className="mt-2 block w-full rounded-full bg-coral px-6 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
                            >
                                {t('nav.book')}
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </header>
    );
}
