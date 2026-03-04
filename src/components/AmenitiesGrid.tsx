import { amenities } from '../data';

export default function AmenitiesGrid() {
    return (
        <section id="amenities" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Section Header */}
                <div className="mb-16 text-center">
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                        What We Offer
                    </span>
                    <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        Everything You Need for a Perfect Stay
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-warm-gray">
                        Our beautifully appointed flat comes with premium amenities to make
                        your Tenerife holiday truly unforgettable.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {amenities.map((amenity) => (
                        <article
                            key={amenity.title}
                            className="group rounded-2xl border border-sand bg-sand-light p-8 transition-all duration-300 hover:-translate-y-1 hover:border-ocean/20 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-ocean/10 text-3xl transition-transform duration-300 group-hover:scale-110">
                                {amenity.icon}
                            </div>
                            <h3 className="mb-2 font-heading text-lg font-bold text-navy">
                                {amenity.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-warm-gray">
                                {amenity.description}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
