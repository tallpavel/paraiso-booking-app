import { useI18n } from '../i18n';

export default function HeroSection() {
    const { t } = useI18n();

    return (
        <section
            id="hero"
            className="relative flex min-h-screen items-center justify-center overflow-hidden"
        >
            {/* Background Video */}
            <div className="absolute inset-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/hero-bg.jpg"
                    className="h-full w-full object-cover"
                >
                    <source src="/hero-video.mp4" type="video/mp4" />
                    {/* Fallback image if video is not supported */}
                    <img
                        src="/hero-bg.jpg"
                        alt="Aerial view of Playa Paraíso coastline in Tenerife"
                        className="h-full w-full object-cover"
                    />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/40 to-navy/70" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-4xl px-6 pb-28 text-center">
                <div className="mb-8 flex justify-center">
                    <img
                        src="/logo.png"
                        alt="Verónica's Flat logo"
                        width={120}
                        height={120}
                        className="h-20 w-20 rounded-full object-cover shadow-2xl ring-2 ring-white/20 sm:h-32 sm:w-32"
                    />
                </div>

                <h1 className="mb-6 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {t('hero.title')}{' '}
                    <span className="text-coral">{t('hero.titleHighlight')}</span>
                </h1>

                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                    {t('hero.subtitle')}
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-booking'))}
                        className="rounded-full bg-coral px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all duration-200 hover:bg-coral-dark hover:shadow-3xl hover:-translate-y-0.5"
                    >
                        {t('hero.cta')}
                    </button>
                    <a
                        href="#gallery"
                        className="rounded-full border-2 border-white/60 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white hover:bg-white/10"
                    >
                        {t('hero.explore')}
                    </a>
                </div>

                {/* Trustpilot Trust Badge */}
                <a
                    href="https://www.trustpilot.com/review/example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-12 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/25"
                >
                    {/* Trustpilot Stars */}
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <rect width="24" height="24" rx="2" fill="#00b67a" />
                                <path
                                    d="M12 16.77L15.09 18.5l-.81-3.52L17 12.51l-3.58-.31L12 9l-1.42 3.2L7 12.51l2.72 2.47-.81 3.52L12 16.77z"
                                    fill="#fff"
                                />
                            </svg>
                        ))}
                    </div>
                    <div className="h-5 w-px bg-white/20" />
                    {/* Trustpilot wordmark */}
                    <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="4" fill="#00b67a" />
                            <path d="M12 16.77L15.09 18.5l-.81-3.52L17 12.51l-3.58-.31L12 9l-1.42 3.2L7 12.51l2.72 2.47-.81 3.52L12 16.77z" fill="#fff" />
                        </svg>
                        <span className="text-sm font-semibold text-white/90">Trustpilot</span>
                    </div>
                    <span className="text-sm text-white/60">5.0 · {t('hero.trust')}</span>
                </a>
            </div>

            {/* Scroll Indicator */}
            <a
                href="#amenities"
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 transition-colors hover:text-white"
                aria-label="Scroll down"
            >
                {/* Desktop: Mouse icon */}
                <div className="hidden sm:flex h-12 w-7 items-start justify-center rounded-full border-2 border-current p-1.5">
                    <div className="h-2.5 w-1.5 rounded-full bg-current animate-scroll-dot" />
                </div>

                {/* Mobile: Double chevron + label */}
                <div className="flex flex-col items-center sm:hidden animate-bounce">
                    <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    <svg className="h-6 w-6 -mt-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                <svg className="h-4 w-4 animate-bounce hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </a>
        </section>
    );
}
