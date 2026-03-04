import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import { createReservation, fetchConfirmedReservations, fetchDailyRates } from '../api';
import type { ConfirmedReservation } from '../api';
import flatpickr from 'flatpickr';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import 'flatpickr/dist/flatpickr.min.css';

// ── Seasonal nightly rates (€) ───────────────────────────────────────
// Index 0 = January … 11 = December (midpoint of the recommended range)
const NIGHTLY_RATES: readonly number[] = [
    150,  // Jan  (140–160)
    175,  // Feb  (160–190)
    165,  // Mar  (150–180)
    155,  // Apr  (140–170)
    145,  // May  (130–160)
    155,  // Jun  (140–170)
    180,  // Jul  (160–200)
    190,  // Aug  (170–210)
    160,  // Sep  (140–180)
    150,  // Oct  (130–170)
    145,  // Nov  (130–160)
    180,  // Dec  (160–200)
] as const;

const MIN_NIGHTS = 3;

/** Turn a Date into a 'YYYY-MM-DD' key. */
function toDateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Expand confirmed reservations into a Set of booked day keys. */
function expandBookedDays(reservations: ConfirmedReservation[]): Set<string> {
    const set = new Set<string>();
    for (const r of reservations) {
        const start = new Date(r.checkIn);
        const end = new Date(r.checkOut);
        const cursor = new Date(start);
        while (cursor < end) {
            set.add(toDateKey(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
    }
    return set;
}

/** Get the nightly rate for a specific date. Custom overrides take priority. */
function getRateForDate(d: Date, customRates: Map<string, number>): number {
    const key = toDateKey(d);
    if (customRates.has(key)) return customRates.get(key)!;
    return NIGHTLY_RATES[d.getMonth()];
}

/** Calculate total price for a stay. */
function calculateStayPrice(checkIn: Date, checkOut: Date, customRates: Map<string, number>): { total: number; avgPerNight: number; nights: number } {
    let total = 0;
    let nightCount = 0;
    const cursor = new Date(checkIn);
    while (cursor < checkOut) {
        total += getRateForDate(cursor, customRates);
        nightCount++;
        cursor.setDate(cursor.getDate() + 1);
    }
    return {
        total,
        avgPerNight: nightCount > 0 ? Math.round(total / nightCount) : 0,
        nights: nightCount,
    };
}

interface FormErrors {
    name?: string;
    email?: string;
    dates?: string;
}

export default function BookingCalendar() {
    const { t, locale } = useI18n();

    // ── Date selection state ──────────────────────────────────────────
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [guests, setGuests] = useState(2);

    // ── Guest details & form state ───────────────────────────────────
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [serverError, setServerError] = useState('');

    // ── Confirmed reservations → booked dates ────────────────────────
    const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

    // ── Custom daily rates from API ───────────────────────────────
    const [customRates, setCustomRates] = useState<Map<string, number>>(new Map());
    const [dataReady, setDataReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        // Fetch booked dates and custom daily rates in parallel
        Promise.all([
            fetchConfirmedReservations().catch(() => []),
            fetchDailyRates().catch(() => []),
        ]).then(([confirmed, rates]) => {
            if (cancelled) return;
            setBookedDates(expandBookedDays(confirmed));

            // Build custom rates map: 'YYYY-MM-DD' → price
            // Extract date key directly from ISO string to avoid timezone shifts
            const map = new Map<string, number>();
            for (const r of rates) {
                // r.date is like "2026-03-22T00:00:00.000Z" — take just YYYY-MM-DD
                const key = r.date.slice(0, 10);
                map.set(key, r.price);
            }
            setCustomRates(map);
            setDataReady(true);
        });

        return () => { cancelled = true; };
    }, []);

    // ── Flatpickr refs ───────────────────────────────────────────────
    const calendarRef = useRef<HTMLDivElement>(null);
    const fpRef = useRef<FlatpickrInstance | null>(null);

    // ── Locale mapping for Flatpickr ─────────────────────────────────
    const flatpickrLocale = useMemo(() => {
        // We only need firstDayOfWeek: 1 (Monday) for all locales
        return { firstDayOfWeek: 1 as const };
    }, []);

    // ── Initialize Flatpickr (only after data is loaded) ───────────────
    useEffect(() => {
        if (!calendarRef.current || !dataReady) return;

        const bookedSet = bookedDates;

        const fp = flatpickr(calendarRef.current, {
            mode: 'range',
            minDate: 'today',
            dateFormat: 'Y-m-d',
            inline: true,
            showMonths: 1,
            locale: flatpickrLocale,
            disable: [
                function (date: Date) {
                    return bookedSet.has(toDateKey(date));
                },
            ],

            onDayCreate(_dObj: Date[], _dStr: string, _fp: FlatpickrInstance, dayElem: HTMLElement) {
                const dayEl = dayElem as HTMLElement & { dateObj: Date };
                const cellDate = dayEl.dateObj;
                const rate = getRateForDate(cellDate, customRates);
                const isBooked = bookedSet.has(toDateKey(cellDate));

                const priceSpan = document.createElement('span');
                priceSpan.className = 'fp-day-price';

                if (isBooked) {
                    priceSpan.textContent = '—';
                    priceSpan.classList.add('fp-day-price--booked');
                } else {
                    priceSpan.textContent = `€${rate}`;
                }

                dayElem.appendChild(priceSpan);
            },

            onChange(selectedDates: Date[]) {
                if (selectedDates.length === 2) {
                    setCheckIn(selectedDates[0]);
                    setCheckOut(selectedDates[1]);
                    if (errors.dates) {
                        setErrors((prev) => ({ ...prev, dates: undefined }));
                    }
                } else if (selectedDates.length === 1) {
                    setCheckIn(selectedDates[0]);
                    setCheckOut(null);
                } else {
                    setCheckIn(null);
                    setCheckOut(null);
                }
            },
        });

        fpRef.current = fp;

        return () => {
            fp.destroy();
            fpRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataReady, bookedDates, customRates, flatpickrLocale]);

    // ── Pricing ──────────────────────────────────────────────────────
    const pricing = useMemo(() => {
        if (!checkIn || !checkOut) return null;
        return calculateStayPrice(checkIn, checkOut, customRates);
    }, [checkIn, checkOut, customRates]);

    const nights = pricing?.nights ?? 0;
    const isBelowMinimum = nights > 0 && nights < MIN_NIGHTS;

    // ── Formatting ───────────────────────────────────────────────────
    const formatDate = useCallback(
        (date: Date): string => {
            const loc = locale === 'es' ? 'es-ES' : locale === 'cs' ? 'cs-CZ' : 'en-GB';
            return date.toLocaleDateString(loc, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        },
        [locale],
    );

    // ── Validation ───────────────────────────────────────────────────
    const validate = (): FormErrors => {
        const errs: FormErrors = {};
        if (!guestName.trim()) errs.name = t('booking.errorName');
        if (!guestEmail.trim()) {
            errs.email = t('booking.errorEmail');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
            errs.email = t('booking.errorEmailInvalid');
        }
        if (!checkIn || !checkOut) errs.dates = t('booking.errorDates');
        if (isBelowMinimum) errs.dates = t('booking.minNights');
        return errs;
    };

    const handleFieldChange = (field: keyof FormErrors) => {
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // ── Submit booking to API ────────────────────────────────────────
    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setStatus('sending');
        setServerError('');

        try {
            await createReservation({
                guestName: guestName.trim(),
                guestEmail: guestEmail.trim(),
                checkIn: checkIn!.toISOString(),
                checkOut: checkOut!.toISOString(),
                nights: pricing!.nights,
                totalPrice: pricing!.total,
            });

            setStatus('sent');
            setGuestName('');
            setGuestEmail('');
            setCheckIn(null);
            setCheckOut(null);
            setGuests(2);
            // Clear Flatpickr selection
            fpRef.current?.clear();
            // Re-fetch confirmed reservations to update blocked days
            fetchConfirmedReservations()
                .then((data) => setBookedDates(expandBookedDays(data)))
                .catch(() => { });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (err: unknown) {
            setStatus('error');
            const apiErr = err as { message?: string; errors?: string[] };
            setServerError(
                apiErr?.errors?.join(', ') ||
                apiErr?.message ||
                t('booking.errorServer'),
            );
            setTimeout(() => setStatus('idle'), 6000);
        }
    };

    return (
        <section id="booking" className="bg-sand-light py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-16 text-center">
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                        {t('booking.label')}
                    </span>
                    <h2 className="mb-4 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('booking.title')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-warm-gray">
                        {t('booking.subtitle')}
                    </p>
                </div>

                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_380px]">
                    {/* Calendar — Flatpickr container */}
                    <div className="flatpickr-booking-wrapper rounded-3xl bg-white p-6 shadow-lg sm:p-8">
                        {!dataReady ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean/20 border-t-ocean" />
                            </div>
                        ) : (
                            <div ref={calendarRef} />
                        )}

                        {errors.dates && (
                            <p className="mt-3 text-center text-xs text-coral" role="alert">
                                {errors.dates}
                            </p>
                        )}
                    </div>

                    {/* Booking Summary */}
                    <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-lg sm:p-8">
                        <h3 className="font-heading text-xl font-bold text-navy">
                            {t('booking.yourStay')}
                        </h3>

                        <div className="space-y-4">
                            {/* Guest Name */}
                            <div>
                                <label htmlFor="booking-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                    {t('booking.name')} <span className="text-coral">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="booking-name"
                                    value={guestName}
                                    onChange={(e) => {
                                        setGuestName(e.target.value);
                                        handleFieldChange('name');
                                    }}
                                    autoComplete="name"
                                    placeholder={t('booking.namePlaceholder')}
                                    className={`w-full rounded-xl border bg-sand-light px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.name ? 'border-coral' : 'border-sand'}`}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-coral" role="alert">{errors.name}</p>
                                )}
                            </div>

                            {/* Guest Email */}
                            <div>
                                <label htmlFor="booking-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                    {t('booking.email')} <span className="text-coral">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="booking-email"
                                    value={guestEmail}
                                    onChange={(e) => {
                                        setGuestEmail(e.target.value);
                                        handleFieldChange('email');
                                    }}
                                    autoComplete="email"
                                    placeholder={t('booking.emailPlaceholder')}
                                    spellCheck={false}
                                    className={`w-full rounded-xl border bg-sand-light px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.email ? 'border-coral' : 'border-sand'}`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-coral" role="alert">{errors.email}</p>
                                )}
                            </div>

                            {/* Check-in / Check-out */}
                            <div className="rounded-xl bg-sand-light p-4">
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                    {t('booking.checkIn')}
                                </label>
                                <p className="font-medium text-navy">
                                    {checkIn ? formatDate(checkIn) : t('booking.selectDate')}
                                </p>
                            </div>
                            <div className="rounded-xl bg-sand-light p-4">
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                    {t('booking.checkOut')}
                                </label>
                                <p className="font-medium text-navy">
                                    {checkOut ? formatDate(checkOut) : t('booking.selectDate')}
                                </p>
                            </div>

                            {/* Guests */}
                            <div className="rounded-xl bg-sand-light p-4">
                                <label
                                    htmlFor="guest-count"
                                    className="mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-gray"
                                >
                                    {t('booking.guests')}
                                </label>
                                <select
                                    id="guest-count"
                                    value={guests}
                                    onChange={(e) => setGuests(Number(e.target.value))}
                                    className="w-full rounded-lg border-0 bg-transparent py-1 font-medium text-navy focus:ring-2 focus:ring-ocean"
                                >
                                    {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <option key={n} value={n}>
                                            {n} {n > 1 ? t('booking.guests_plural') : t('booking.guest')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {nights > 0 && pricing && (
                            <div className={`rounded-xl border p-4 ${isBelowMinimum
                                ? 'border-coral/30 bg-coral/5'
                                : 'border-ocean/20 bg-ocean/5'
                                }`}>
                                {/* Nights count */}
                                <p className={`text-center text-2xl font-bold ${isBelowMinimum ? 'text-coral' : 'text-ocean'
                                    }`}>
                                    {nights} {nights > 1 ? t('booking.nights') : t('booking.night')}
                                </p>
                                <p className="mb-3 text-center text-sm text-warm-gray">
                                    {formatDate(checkIn!)} → {formatDate(checkOut!)}
                                </p>

                                {/* Minimum nights warning */}
                                {isBelowMinimum && (
                                    <p className="mb-3 text-center text-xs font-semibold text-coral">
                                        ⚠ {t('booking.minNights')}
                                    </p>
                                )}

                                {/* Price breakdown */}
                                {!isBelowMinimum && (
                                    <div className="space-y-2 border-t border-ocean/10 pt-3">
                                        <div className="flex justify-between text-sm text-warm-gray">
                                            <span>€{pricing.avgPerNight} × {nights} {nights > 1 ? t('booking.nights') : t('booking.night')}</span>
                                            <span>€{pricing.total}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-ocean/10 pt-2 text-base font-bold text-navy">
                                            <span>{t('booking.total')}</span>
                                            <span>€{pricing.total}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Server error message */}
                        {status === 'error' && serverError && (
                            <div className="rounded-xl border border-coral/30 bg-coral/5 p-3 text-center">
                                <p className="text-sm text-coral">{serverError}</p>
                            </div>
                        )}

                        {/* Success message */}
                        {status === 'sent' && (
                            <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-center">
                                <p className="text-sm font-medium text-green-700">{t('booking.sent')}</p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={status === 'sending' || isBelowMinimum}
                            className={`mt-auto w-full rounded-full py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 ${status === 'sending'
                                ? 'cursor-wait bg-ocean/60'
                                : isBelowMinimum
                                    ? 'cursor-not-allowed bg-navy/20'
                                    : 'bg-coral hover:bg-coral-dark hover:shadow-xl'
                                }`}
                        >
                            {status === 'sending'
                                ? t('booking.sending')
                                : status === 'sent'
                                    ? t('booking.sent')
                                    : pricing && !isBelowMinimum
                                        ? `${t('booking.request')} · €${pricing.total}`
                                        : t('booking.request')}
                        </button>

                        <p className="text-center text-xs text-warm-gray">
                            {t('booking.noPayment')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
