import { NAV_LINKS, PROPERTY_ADDRESS } from '../data';

export default function Footer() {
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
                            A beautiful holiday apartment in the heart of Playa Paraíso,
                            Tenerife. Ocean views, pool access, and sunshine year-round.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-white/60 transition-colors hover:text-white"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Address */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
                            Location
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
                                View on Google Maps
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </address>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
                            Contact
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
                                <span>15 min from TFS Airport</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-12 border-t border-white/10 pt-8 text-center">
                    <p className="text-xs text-white/40">
                        © {year} Verónica's Flat — Playa Paraíso, Tenerife. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
