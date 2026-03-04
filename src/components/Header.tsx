import { useState, useEffect } from 'react';
import { NAV_LINKS } from '../data';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
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
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-ocean ${scrolled ? 'text-navy' : 'text-white/90'
                                    }`}
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <a
                    href="#booking"
                    className="hidden rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-coral-dark hover:shadow-xl md:inline-block"
                >
                    Book Now
                </a>

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
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="block py-3 text-sm font-medium text-navy transition-colors hover:text-ocean"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <a
                                href="#booking"
                                onClick={() => setMenuOpen(false)}
                                className="mt-2 block rounded-full bg-coral px-6 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
                            >
                                Book Now
                            </a>
                        </li>
                    </ul>
                </div>
            )}
        </header>
    );
}
