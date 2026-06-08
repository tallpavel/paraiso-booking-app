import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { Locale } from '../i18n';
import ShareButton from './ShareButton';

const NAV_KEYS = [
    { key: 'nav.amenities' as const, href: '#amenities' },
    { key: 'nav.gallery' as const, href: '#gallery' },
    { key: 'nav.discover' as const, href: '#discover' },
    { key: 'nav.reviews' as const, href: '#reviews' },
    { key: 'nav.faq' as const, href: '#faq' },
];

// ── SVG Flag Icons — consistent rendering across all devices ────────
const FlagGB = ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="16" rx="2" fill="#012169" />
        <path d="M0 0L24 16M24 0L0 16" stroke="#fff" strokeWidth="2.5" />
        <path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.2" />
        <path d="M12 0V16M0 8H24" stroke="#fff" strokeWidth="4" />
        <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="2.4" />
    </svg>
);

const FlagES = ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="16" rx="2" fill="#AA151B" />
        <rect y="4" width="24" height="8" fill="#F1BF00" />
    </svg>
);

const FlagCZ = ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="16" rx="2" fill="#D7141A" />
        <rect width="24" height="8" rx="2" fill="#fff" />
        <path d="M0 0L12 8L0 16V0Z" fill="#11457E" />
    </svg>
);

const LOCALE_FLAGS: Record<Locale, React.FC<{ className?: string }>> = { en: FlagGB, es: FlagES, cs: FlagCZ };
const LOCALE_LABELS: Record<Locale, string> = { en: 'EN', es: 'ES', cs: 'CZ' };
const LOCALE_FULL_LABELS: Record<Locale, string> = { en: 'English', es: 'Español', cs: 'Česky' };
const LOCALE_ORDER: Locale[] = ['en', 'es', 'cs'];

export default function Header() {
    const { t, locale, setLocale } = useI18n();
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    // Build full href: on homepage use bare hash, elsewhere prefix with /
    const resolveHref = (hash: string) => isHome ? hash : `/${hash}`;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showNav ? 'bg-white backdrop-blur-md shadow-lg' : 'bg-transparent'
                }`}
        >
            <nav className={`mx-auto flex max-w-7xl items-center justify-between px-6 relative transition-all duration-500 ${showNav ? 'py-4' : 'py-6'}`}>
                {/* Logo — hidden initially, appears on scroll */}
                <a
                    href={resolveHref('#hero')}
                    className={`flex items-center gap-3 transition-all duration-500 ${showNav ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                        }`}
                    aria-label="Verónica's Flat — Home"
                >
                    <img
                        src="/logo.png"
                        alt="Verónica's Flat logo"
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full bg-[#f6efdb] object-contain p-2"
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
                                href={resolveHref(link.href)}
                                className={`text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200 hover:text-ocean ${activeSection === link.href
                                    ? 'text-ocean'
                                    : scrolled ? 'text-navy' : 'text-white/90'
                                    }`}
                            >
                                {t(link.key)}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className={`hidden items-center gap-2 md:flex transition-all duration-300 ${showNav ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {/* Share */}
                    <ShareButton variant="header" scrolled={scrolled} />
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
                            {(() => { const Flag = LOCALE_FLAGS[locale]; return <Flag className="h-3.5 w-5 rounded-[1px]" />; })()}
                            {LOCALE_LABELS[locale]}
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
                                        {(() => { const Flag = LOCALE_FLAGS[loc]; return <Flag className="h-4 w-6 rounded-[1px]" />; })()}
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
                        onClick={() => {
                            if (!isHome) {
                                navigate('/');
                                setTimeout(() => window.dispatchEvent(new CustomEvent('open-booking')), 300);
                            } else {
                                window.dispatchEvent(new CustomEvent('open-booking'));
                            }
                        }}
                        className="rounded-full bg-coral px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-coral-dark hover:shadow-xl hover:-translate-y-0.5"
                    >
                        {t('nav.book')}
                    </button>
                </div>

                {/* Mobile: Share + Hamburger */}
                <div className={`flex items-center gap-1 md:hidden transition-all duration-300 ${showNav ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <ShareButton variant="header" scrolled={scrolled} />
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${scrolled ? 'hover:bg-sand-light' : 'hover:bg-white/10'}`}
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
                </div>
            </nav>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="border-t border-sand bg-white/95 backdrop-blur-md md:hidden">
                    <ul className="flex flex-col px-6 py-4">
                        {NAV_KEYS.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={resolveHref(link.href)}
                                    onClick={() => setMenuOpen(false)}
                                    className={`block py-3 text-sm font-medium transition-colors hover:text-ocean ${activeSection === link.href ? 'text-ocean' : 'text-navy'
                                        }`}
                                >
                                    {t(link.key)}
                                </a>
                            </li>
                        ))}
                        <li className="flex flex-wrap items-center gap-2 py-3">
                            {LOCALE_ORDER.map((loc) => (
                                <button
                                    key={loc}
                                    type="button"
                                    onClick={() => { setLocale(loc); setMenuOpen(false); }}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium ${locale === loc
                                        ? 'bg-ocean text-white'
                                        : 'bg-sand text-navy'
                                        }`}
                                >
                                    {(() => { const Flag = LOCALE_FLAGS[loc]; return <Flag className="h-3.5 w-5 rounded-[1px]" />; })()}
                                    {LOCALE_FULL_LABELS[loc]}
                                </button>
                            ))}
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    if (!isHome) {
                                        navigate('/');
                                        setTimeout(() => window.dispatchEvent(new CustomEvent('open-booking')), 300);
                                    } else {
                                        window.dispatchEvent(new CustomEvent('open-booking'));
                                    }
                                }}
                                className="mt-2 block w-full rounded-full bg-coral px-8 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
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
