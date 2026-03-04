import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import { createReservation, fetchConfirmedReservations, fetchDailyRates } from '../api';
import type { ConfirmedReservation } from '../api';
import flatpickr from 'flatpickr';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import 'flatpickr/dist/flatpickr.min.css';

// ── Seasonal nightly rates (€) ───────────────────────────────────────
const NIGHTLY_RATES: readonly number[] = [
    150, 175, 165, 155, 145, 155, 180, 190, 160, 150, 145, 180,
] as const;

const MIN_NIGHTS = 3;

function toDateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

function getRateForDate(d: Date, customRates: Map<string, number>): number {
    const key = toDateKey(d);
    if (customRates.has(key)) return customRates.get(key)!;
    return NIGHTLY_RATES[d.getMonth()];
}

function calculateStayPrice(checkIn: Date, checkOut: Date, customRates: Map<string, number>) {
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

// ── Step indicator ───────────────────────────────────────────────────
function StepIndicator({ current, labels }: { current: number; labels: string[] }) {
    return (
        <div className="mb-8 flex items-center justify-center gap-2">
            {labels.map((label, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === current;
                const isDone = stepNum < current;
                return (
                    <div key={i} className="flex items-center gap-2">
                        {i > 0 && (
                            <div className={`h-px w-8 sm:w-12 transition-colors ${isDone ? 'bg-ocean' : 'bg-navy/15'}`} />
                        )}
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${isActive
                                    ? 'bg-ocean text-white shadow-md shadow-ocean/30'
                                    : isDone
                                        ? 'bg-ocean/15 text-ocean'
                                        : 'bg-navy/8 text-navy/30'
                                    }`}
                            >
                                {isDone ? (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    stepNum
                                )}
                            </div>
                            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isActive ? 'text-ocean' : isDone ? 'text-ocean/60' : 'text-navy/25'
                                }`}>
                                {label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function BookingCalendar() {
    const { t, locale } = useI18n();

    // ── Wizard step (1 = dates, 2 = details, 3 = summary) ───────────
    const [step, setStep] = useState(1);

    // ── Date selection ───────────────────────────────────────────────
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);

    // ── Guest details ────────────────────────────────────────────────
    const [guests, setGuests] = useState(2);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [comment, setComment] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [serverError, setServerError] = useState('');

    // ── API data ─────────────────────────────────────────────────────
    const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
    const [customRates, setCustomRates] = useState<Map<string, number>>(new Map());
    const [dataReady, setDataReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            fetchConfirmedReservations().catch(() => []),
            fetchDailyRates().catch(() => []),
        ]).then(([confirmed, rates]) => {
            if (cancelled) return;
            setBookedDates(expandBookedDays(confirmed));
            const map = new Map<string, number>();
            for (const r of rates) {
                map.set(r.date.slice(0, 10), r.price);
            }
            setCustomRates(map);
            setDataReady(true);
        });
        return () => { cancelled = true; };
    }, []);

    // ── Flatpickr ────────────────────────────────────────────────────
    const calendarRef = useRef<HTMLDivElement>(null);
    const fpRef = useRef<FlatpickrInstance | null>(null);

    const flatpickrLocale = useMemo(() => ({ firstDayOfWeek: 1 as const }), []);

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
            disable: [(date: Date) => bookedSet.has(toDateKey(date))],

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
        return () => { fp.destroy(); fpRef.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, dataReady, bookedDates, customRates, flatpickrLocale]);

    // ── Pricing ──────────────────────────────────────────────────────
    const pricing = useMemo(() => {
        if (!checkIn || !checkOut) return null;
        return calculateStayPrice(checkIn, checkOut, customRates);
    }, [checkIn, checkOut, customRates]);

    const nights = pricing?.nights ?? 0;
    const isBelowMinimum = nights > 0 && nights < MIN_NIGHTS;
    const datesValid = nights >= MIN_NIGHTS && pricing !== null;

    // ── Formatting ───────────────────────────────────────────────────
    const formatDate = useCallback(
        (date: Date): string => {
            const loc = locale === 'es' ? 'es-ES' : locale === 'cs' ? 'cs-CZ' : 'en-GB';
            return date.toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' });
        },
        [locale],
    );

    // ── Validation (step 2) ──────────────────────────────────────────
    const validateDetails = (): FormErrors => {
        const errs: FormErrors = {};
        if (!guestName.trim()) errs.name = t('booking.errorName');
        if (!guestEmail.trim()) {
            errs.email = t('booking.errorEmail');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
            errs.email = t('booking.errorEmailInvalid');
        }
        return errs;
    };

    const handleFieldChange = (field: keyof FormErrors) => {
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // ── Step navigation ──────────────────────────────────────────────
    const goNext = () => {
        if (step === 1) {
            if (!datesValid) return;
            setStep(2);
        } else if (step === 2) {
            const errs = validateDetails();
            if (Object.keys(errs).length > 0) {
                setErrors(errs);
                return;
            }
            setStep(3);
        }
    };

    const goBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // ── Submit ───────────────────────────────────────────────────────
    const handleSubmit = async () => {
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
                comment: comment.trim() || undefined,
            });

            setStatus('sent');
            // Reset after 4 seconds
            setTimeout(() => {
                setGuestName('');
                setGuestEmail('');
                setComment('');
                setCheckIn(null);
                setCheckOut(null);
                setGuests(2);
                setStep(1);
                setStatus('idle');
                fpRef.current?.clear();
                fetchConfirmedReservations()
                    .then((data) => setBookedDates(expandBookedDays(data)))
                    .catch(() => { });
            }, 4000);
        } catch (err: unknown) {
            setStatus('error');
            const apiErr = err as { message?: string; errors?: string[] };
            setServerError(
                apiErr?.errors?.join(', ') || apiErr?.message || t('booking.errorServer'),
            );
            setTimeout(() => setStatus('idle'), 6000);
        }
    };

    const stepLabels = [t('booking.stepDates'), t('booking.stepDetails'), t('booking.stepConfirm')];

    return (
        <section id="booking" className="bg-sand-light py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-12 text-center">
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

                {/* Step Indicator */}
                <StepIndicator current={step} labels={stepLabels} />

                {/* Card container — wider on step 1 for the two-column layout */}
                <div className={`mx-auto rounded-3xl bg-white p-6 shadow-lg transition-all sm:p-10 ${step === 1 ? 'max-w-5xl' : 'max-w-2xl'}`}>

                    {/* ═══════════════════════════════════════════════════ */}
                    {/*  STEP 1: Select Dates                              */}
                    {/* ═══════════════════════════════════════════════════ */}
                    {step === 1 && (
                        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                            {/* Left — Calendar */}
                            <div>
                                <h3 className="mb-6 font-heading text-xl font-bold text-navy">
                                    {t('booking.stepDatesTitle')}
                                </h3>

                                <div className="flatpickr-booking-wrapper">
                                    {!dataReady ? (
                                        <div className="flex items-center justify-center py-20">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean/20 border-t-ocean" />
                                        </div>
                                    ) : (
                                        <div ref={calendarRef} />
                                    )}
                                </div>

                                {errors.dates && (
                                    <p className="mt-3 text-center text-xs text-coral" role="alert">{errors.dates}</p>
                                )}
                            </div>

                            {/* Right — Summary sidebar */}
                            <div className="flex flex-col gap-5">
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

                                {/* Pricing summary */}
                                {nights > 0 && pricing && (
                                    <div className={`rounded-xl border p-4 transition-colors ${isBelowMinimum ? 'border-coral/30 bg-coral/5' : 'border-ocean/20 bg-ocean/5'
                                        }`}>
                                        <p className={`text-center text-2xl font-bold ${isBelowMinimum ? 'text-coral' : 'text-ocean'}`}>
                                            {nights} {nights > 1 ? t('booking.nights') : t('booking.night')}
                                        </p>

                                        {isBelowMinimum && (
                                            <p className="mt-2 text-center text-xs font-semibold text-coral">
                                                ⚠ {t('booking.minNights')}
                                            </p>
                                        )}

                                        {!isBelowMinimum && (
                                            <div className="mt-3 space-y-2 border-t border-ocean/10 pt-3">
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

                                {/* Next button */}
                                <button
                                    type="button"
                                    onClick={goNext}
                                    disabled={!datesValid}
                                    className={`mt-auto w-full rounded-full py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 ${datesValid
                                        ? 'bg-ocean hover:bg-ocean-dark hover:shadow-xl'
                                        : 'cursor-not-allowed bg-navy/15'
                                        }`}
                                >
                                    {datesValid
                                        ? `${t('booking.next')} · €${pricing!.total}`
                                        : t('booking.next')}
                                </button>

                                <p className="text-center text-xs text-warm-gray">
                                    {t('booking.noPayment')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════ */}
                    {/*  STEP 2: Guest Details                              */}
                    {/* ═══════════════════════════════════════════════════ */}
                    {step === 2 && (
                        <div>
                            <h3 className="mb-6 text-center font-heading text-xl font-bold text-navy">
                                {t('booking.stepDetailsTitle')}
                            </h3>

                            {/* Date summary pill */}
                            {pricing && (
                                <div className="mb-6 flex items-center justify-between rounded-xl bg-ocean/5 px-4 py-3 text-sm">
                                    <span className="font-medium text-ocean">
                                        {formatDate(checkIn!)} → {formatDate(checkOut!)}
                                    </span>
                                    <span className="font-bold text-navy">
                                        {nights} {nights > 1 ? t('booking.nights') : t('booking.night')} · €{pricing.total}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label htmlFor="booking-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                        {t('booking.name')} <span className="text-coral">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="booking-name"
                                        value={guestName}
                                        onChange={(e) => { setGuestName(e.target.value); handleFieldChange('name'); }}
                                        autoComplete="name"
                                        placeholder={t('booking.namePlaceholder')}
                                        className={`w-full rounded-xl border bg-sand-light px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.name ? 'border-coral' : 'border-sand'}`}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-coral" role="alert">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="booking-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                        {t('booking.email')} <span className="text-coral">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="booking-email"
                                        value={guestEmail}
                                        onChange={(e) => { setGuestEmail(e.target.value); handleFieldChange('email'); }}
                                        autoComplete="email"
                                        placeholder={t('booking.emailPlaceholder')}
                                        spellCheck={false}
                                        className={`w-full rounded-xl border bg-sand-light px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.email ? 'border-coral' : 'border-sand'}`}
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-coral" role="alert">{errors.email}</p>}
                                </div>

                                {/* Guests */}
                                <div>
                                    <label htmlFor="guest-count" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                        {t('booking.guests')}
                                    </label>
                                    <select
                                        id="guest-count"
                                        value={guests}
                                        onChange={(e) => setGuests(Number(e.target.value))}
                                        className="w-full rounded-xl border border-sand bg-sand-light px-4 py-3 font-medium text-navy focus:outline-none focus:ring-2 focus:ring-ocean"
                                    >
                                        {[1, 2, 3].map((n) => (
                                            <option key={n} value={n}>
                                                {n} {n > 1 ? t('booking.guests_plural') : t('booking.guest')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label htmlFor="booking-comment" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                        {t('booking.comment')}
                                    </label>
                                    <textarea
                                        id="booking-comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={t('booking.commentPlaceholder')}
                                        rows={3}
                                        className="w-full resize-none rounded-xl border border-sand bg-sand-light px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean"
                                    />
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="flex-1 rounded-full border-2 border-navy/15 py-3.5 text-base font-semibold text-navy transition-colors hover:border-navy/30 hover:bg-sand"
                                >
                                    {t('booking.back')}
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="flex-[2] rounded-full bg-ocean py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-ocean-dark hover:shadow-xl"
                                >
                                    {t('booking.next')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════ */}
                    {/*  STEP 3: Summary & Submit                          */}
                    {/* ═══════════════════════════════════════════════════ */}
                    {step === 3 && (
                        <div>
                            <h3 className="mb-6 text-center font-heading text-xl font-bold text-navy">
                                {t('booking.stepConfirmTitle')}
                            </h3>

                            {/* Summary card */}
                            <div className="space-y-4 rounded-2xl bg-sand-light p-6">
                                {/* Dates */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                            {t('booking.checkIn')}
                                        </p>
                                        <p className="text-base font-medium text-navy">{formatDate(checkIn!)}</p>
                                    </div>
                                    <div className="px-3 pt-3 text-warm-gray">→</div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                            {t('booking.checkOut')}
                                        </p>
                                        <p className="text-base font-medium text-navy">{formatDate(checkOut!)}</p>
                                    </div>
                                </div>

                                <hr className="border-navy/10" />

                                {/* Guest info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">{t('booking.name')}</p>
                                        <p className="text-sm font-medium text-navy">{guestName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">{t('booking.email')}</p>
                                        <p className="text-sm font-medium text-navy">{guestEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">{t('booking.guests')}</p>
                                        <p className="text-sm font-medium text-navy">
                                            {guests} {guests > 1 ? t('booking.guests_plural') : t('booking.guest')}
                                        </p>
                                    </div>
                                    {comment.trim() && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">{t('booking.comment')}</p>
                                            <p className="text-sm text-navy">{comment}</p>
                                        </div>
                                    )}
                                </div>

                                <hr className="border-navy/10" />

                                {/* Price */}
                                {pricing && (
                                    <div>
                                        <div className="flex justify-between text-sm text-warm-gray">
                                            <span>€{pricing.avgPerNight} × {nights} {nights > 1 ? t('booking.nights') : t('booking.night')}</span>
                                            <span>€{pricing.total}</span>
                                        </div>
                                        <div className="mt-2 flex justify-between text-lg font-bold text-navy">
                                            <span>{t('booking.total')}</span>
                                            <span>€{pricing.total}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error / success messages */}
                            {status === 'error' && serverError && (
                                <div className="mt-4 rounded-xl border border-coral/30 bg-coral/5 p-3 text-center">
                                    <p className="text-sm text-coral">{serverError}</p>
                                </div>
                            )}

                            {status === 'sent' && (
                                <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4 text-center">
                                    <p className="text-base font-semibold text-green-700">✓ {t('booking.sent')}</p>
                                    <p className="mt-1 text-sm text-green-600">{t('booking.sentSubtitle')}</p>
                                </div>
                            )}

                            {/* Navigation */}
                            {status !== 'sent' && (
                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        disabled={status === 'sending'}
                                        className="flex-1 rounded-full border-2 border-navy/15 py-3.5 text-base font-semibold text-navy transition-colors hover:border-navy/30 hover:bg-sand disabled:opacity-50"
                                    >
                                        {t('booking.back')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={status === 'sending'}
                                        className={`flex-[2] rounded-full py-3.5 text-base font-semibold text-white shadow-lg transition-all ${status === 'sending'
                                            ? 'cursor-wait bg-ocean/60'
                                            : 'bg-coral hover:bg-coral-dark hover:shadow-xl'
                                            }`}
                                    >
                                        {status === 'sending'
                                            ? t('booking.sending')
                                            : `${t('booking.request')} · €${pricing!.total}`}
                                    </button>
                                </div>
                            )}

                            <p className="mt-4 text-center text-xs text-warm-gray">
                                {t('booking.noPayment')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
