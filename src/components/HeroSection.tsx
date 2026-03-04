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
            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                <div className="mb-8 flex justify-center">
                    <img
                        src="/logo.png"
                        alt="Verónica's Flat logo"
                        width={120}
                        height={120}
                        className="h-28 w-28 rounded-full object-cover shadow-2xl ring-2 ring-white/20 sm:h-32 sm:w-32"
                    />
                </div>

                <h1 className="mb-6 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                    {t('hero.title')}{' '}
                    <span className="text-coral">{t('hero.titleHighlight')}</span>
                </h1>

                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
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
                        className="rounded-full border-2 border-white/40 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white hover:bg-white/10"
                    >
                        {t('hero.explore')}
                    </a>
                </div>

                {/* Trust Badge */}
                <div className="mt-12 flex items-center justify-center gap-2 text-white/70">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-sm">5.0 · {t('hero.trust')}</span>
                </div>
            </div>

            {/* Scroll Indicator */}
            <a
                href="#amenities"
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 transition-colors hover:text-white"
                aria-label="Scroll down"
            >
                {/* Desktop: Mouse icon */}
                <div className="hidden sm:flex h-10 w-6 items-start justify-center rounded-full border-2 border-current p-1.5">
                    <div className="h-2 w-1 rounded-full bg-current animate-scroll-dot" />
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
