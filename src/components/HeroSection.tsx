export default function HeroSection() {
    return (
        <section
            id="hero"
            className="relative flex min-h-screen items-center justify-center overflow-hidden"
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="/hero-bg.jpg"
                    alt="Aerial view of Playa Paraíso coastline in Tenerife"
                    width={1920}
                    height={1080}
                    className="h-full w-full object-cover"
                    fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/40 to-navy/70" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                <span className="mb-6 inline-block rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                    Playa Paraíso · Tenerife
                </span>

                <h1 className="mb-6 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                    Your Dream Escape in{' '}
                    <span className="text-coral">Playa Paraíso</span>
                </h1>

                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                    Wake up to ocean views, year-round sunshine, and the serenity of
                    southern Tenerife. Book directly&nbsp;— no agency fees.
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <a
                        href="#booking"
                        className="rounded-full bg-coral px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all duration-200 hover:bg-coral-dark hover:shadow-3xl hover:-translate-y-0.5"
                    >
                        Check Availability
                    </a>
                    <a
                        href="#gallery"
                        className="rounded-full border-2 border-white/40 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white hover:bg-white/10"
                    >
                        Explore the Flat
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
                    <span className="text-sm">5.0 · Loved by 120+ guests</span>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <svg className="h-6 w-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
}
