import { useState } from 'react';
import { reviews } from '../data';

export default function CustomerReviews() {
    const [activeIndex, setActiveIndex] = useState(0);
    const averageRating = (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);

    return (
        <section id="reviews" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-16 text-center">
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                        Guest Reviews
                    </span>
                    <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        What Our Guests Say
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-lg font-semibold text-navy">{averageRating}</span>
                        <span className="text-warm-gray">· {reviews.length} reviews</span>
                    </div>
                </div>

                {/* Featured Review */}
                <div className="mx-auto mb-12 max-w-3xl">
                    <div className="rounded-3xl bg-sand-light p-8 sm:p-12">
                        <svg className="mb-6 h-10 w-10 text-ocean/30" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                        </svg>
                        <blockquote className="mb-6 font-heading text-xl leading-relaxed text-navy sm:text-2xl">
                            "{reviews[activeIndex].quote}"
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ocean/10 text-lg font-bold text-ocean">
                                {reviews[activeIndex].name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-navy">{reviews[activeIndex].name}</p>
                                <p className="text-sm text-warm-gray">
                                    {reviews[activeIndex].country} · {reviews[activeIndex].date}
                                </p>
                            </div>
                            <div className="ml-auto flex">
                                {[...Array(reviews[activeIndex].rating)].map((_, i) => (
                                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Dots */}
                <div className="flex justify-center gap-3">
                    {reviews.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setActiveIndex(i)}
                            className={`h-3 w-3 rounded-full transition-all duration-200 ${i === activeIndex ? 'scale-125 bg-ocean' : 'bg-navy/20 hover:bg-navy/40'
                                }`}
                            aria-label={`View review ${i + 1}`}
                        />
                    ))}
                </div>

                {/* All Reviews Mini Cards */}
                <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {reviews.map((review, index) => (
                        <button
                            key={review.id}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`rounded-xl border p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${index === activeIndex
                                    ? 'border-ocean/30 bg-ocean/5 shadow-md'
                                    : 'border-sand bg-white'
                                }`}
                        >
                            <div className="mb-3 flex">
                                {[...Array(review.rating)].map((_, i) => (
                                    <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="mb-3 line-clamp-3 text-sm text-navy/80">
                                "{review.quote}"
                            </p>
                            <p className="text-xs font-medium text-warm-gray">
                                {review.name} · {review.country}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
