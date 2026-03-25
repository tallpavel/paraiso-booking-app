import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';
import { createReservation, fetchConfirmedReservations, fetchDailyRates, fetchBlockedDates, fetchSeasonalRates } from '../api';
import type { ConfirmedReservation } from '../api';
import { useSpamProtection } from '../hooks/useSpamProtection';
import flatpickr from 'flatpickr';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import 'flatpickr/dist/flatpickr.min.css';

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

function getRateForDate(d: Date, customRates: Map<string, number>, seasonalRates: readonly number[]): number {
    const key = toDateKey(d);
    if (customRates.has(key)) return customRates.get(key)!;
    return seasonalRates[d.getMonth()];
}

function calculateStayPrice(checkIn: Date, checkOut: Date, customRates: Map<string, number>, seasonalRates: readonly number[]) {
    let total = 0;
    let nightCount = 0;
    const cursor = new Date(checkIn);
    while (cursor < checkOut) {
        total += getRateForDate(cursor, customRates, seasonalRates);
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
    phone?: string;
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
    const [guestPhone, setGuestPhone] = useState('');
    const [comment, setComment] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [serverError, setServerError] = useState('');
    const [gdprConsent, setGdprConsent] = useState(false);
    const spam = useSpamProtection('booking-form');

    // ── API data ─────────────────────────────────────────────────────
    const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
    const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
    const [customRates, setCustomRates] = useState<Map<string, number>>(new Map());
    const [seasonalRates, setSeasonalRates] = useState<readonly number[]>([]);
    const [dataReady, setDataReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            fetchConfirmedReservations().catch(() => []),
            fetchDailyRates().catch(() => []),
            fetchBlockedDates().catch(() => []),
            fetchSeasonalRates().catch(() => ({ rates: [] as number[], updatedAt: null })),
        ]).then(([confirmed, rates, blocked, seasonal]) => {
            if (cancelled) return;
            setBookedDates(expandBookedDays(confirmed));
            const blockedSet = new Set<string>();
            for (const b of blocked) {
                blockedSet.add(b.date.slice(0, 10));
            }
            setBlockedDates(blockedSet);
            const map = new Map<string, number>();
            for (const r of rates) {
                map.set(r.date.slice(0, 10), r.price);
            }
            setCustomRates(map);
            setSeasonalRates(seasonal.rates);
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
        const blockedSet = blockedDates;

        const fp = flatpickr(calendarRef.current, {
            mode: 'range',
            minDate: 'today',
            dateFormat: 'Y-m-d',
            inline: true,
            showMonths: 1,
            locale: flatpickrLocale,
            disable: [(date: Date) => bookedSet.has(toDateKey(date)) || blockedSet.has(toDateKey(date))],

            onDayCreate(_dObj: Date[], _dStr: string, _fp: FlatpickrInstance, dayElem: HTMLElement) {
                const dayEl = dayElem as HTMLElement & { dateObj: Date };
                const cellDate = dayEl.dateObj;
                const rate = getRateForDate(cellDate, customRates, seasonalRates);
                const dateKey = toDateKey(cellDate);
                const isBooked = bookedSet.has(dateKey);
                const isBlocked = blockedSet.has(dateKey);

                const priceSpan = document.createElement('span');
                priceSpan.className = 'fp-day-price';

                if (isBooked || isBlocked) {
                    priceSpan.textContent = isBlocked ? '✕' : '—';
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
    }, [step, dataReady, bookedDates, blockedDates, customRates, seasonalRates, flatpickrLocale]);

    // ── Pricing ──────────────────────────────────────────────────────
    const pricing = useMemo(() => {
        if (!checkIn || !checkOut) return null;
        return calculateStayPrice(checkIn, checkOut, customRates, seasonalRates);
    }, [checkIn, checkOut, customRates, seasonalRates]);

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
        if (!guestPhone.trim() || guestPhone.trim().length < 6) {
            errs.phone = t('booking.errorPhone');
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

    const closeConfirmation = useCallback(() => {
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
        setComment('');
        setCheckIn(null);
        setCheckOut(null);
        setGuests(2);
        setStep(1);
        setStatus('idle');
        setGdprConsent(false);
        fpRef.current?.clear();
        fetchConfirmedReservations()
            .then((data) => setBookedDates(expandBookedDays(data)))
            .catch(() => { });
    }, []);

    // ── Submit ───────────────────────────────────────────────────────
    const handleSubmit = async () => {
        // Spam protection check
        const spamCheck = spam.validate();
        if (!spamCheck.ok) {
            setStatus('error');
            setServerError(spamCheck.reason || 'Security check failed.');
            setTimeout(() => setStatus('idle'), 6000);
            return;
        }

        setStatus('sending');
        setServerError('');

        try {
            await createReservation({
                guestName: guestName.trim(),
                guestEmail: guestEmail.trim(),
                guestPhone: guestPhone.trim(),
                checkIn: checkIn!.toISOString(),
                checkOut: checkOut!.toISOString(),
                nights: pricing!.nights,
                totalPrice: pricing!.total,
                comment: comment.trim() || undefined,
                turnstileToken: spamCheck.turnstileToken,
            });

            setStatus('sent');
            spam.reset();
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
                <div className={`relative mx-auto rounded-3xl bg-white p-6 shadow-lg transition-all sm:p-10 ${step === 1 ? 'max-w-5xl' : 'max-w-2xl'}`}>

                    {/* Close button — resets wizard to step 1 */}
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="absolute right-4 top-4 rounded-full p-2 text-navy/30 transition-colors hover:bg-sand-light hover:text-navy"
                            aria-label="Close"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
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
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-sand-light p-4">
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                            {t('booking.checkIn')}
                                        </label>
                                        <p className="font-medium text-navy">
                                            {checkIn ? formatDate(checkIn) : t('booking.selectDate')}
                                        </p>
                                        {checkIn && <p className="mt-0.5 text-xs text-warm-gray">{t('booking.checkInTime')}</p>}
                                    </div>
                                    <div className="rounded-xl bg-sand-light p-4">
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                            {t('booking.checkOut')}
                                        </label>
                                        <p className="font-medium text-navy">
                                            {checkOut ? formatDate(checkOut) : t('booking.selectDate')}
                                        </p>
                                        {checkOut && <p className="mt-0.5 text-xs text-warm-gray">{t('booking.checkOutTime')}</p>}
                                    </div>
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
                                                <p className="mt-1 text-center text-[11px] text-warm-gray">{t('booking.includesCleaning')}</p>
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

                                {/* Phone */}
                                <div>
                                    <label htmlFor="booking-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                        {t('booking.phone')} <span className="text-coral">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="booking-phone"
                                        value={guestPhone}
                                        onChange={(e) => { setGuestPhone(e.target.value); handleFieldChange('phone'); }}
                                        autoComplete="tel"
                                        placeholder={t('booking.phonePlaceholder')}
                                        className={`w-full rounded-xl border bg-sand-light px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ocean ${errors.phone ? 'border-coral' : 'border-sand'}`}
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-coral" role="alert">{errors.phone}</p>}
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

                                {spam.honeypotField}
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
                            {/* ── CONFIRMATION VIEW ── */}
                            {status === 'sent' ? (
                                <div className="animate-[fadeInUp_0.5s_ease-out]">
                                    {/* Animated checkmark */}
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200">
                                        <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 13l4 4L19 7" className="animate-[drawCheck_0.5s_ease-out_0.3s_both]" style={{ strokeDasharray: 24, strokeDashoffset: 24 }} />
                                        </svg>
                                    </div>

                                    <h3 className="mb-2 text-center font-heading text-2xl font-bold text-navy">
                                        {t('booking.sent')}
                                    </h3>
                                    <p className="mx-auto mb-8 max-w-sm text-center text-sm text-warm-gray">
                                        {t('booking.sentSubtitle')}
                                    </p>

                                    {/* Summary recap card */}
                                    <div className="mb-6 overflow-hidden rounded-2xl border border-navy/5 bg-gradient-to-br from-sand-light to-white">
                                        <div className="border-b border-navy/5 bg-navy/[0.02] px-5 py-3">
                                            <p className="text-xs font-bold uppercase tracking-widest text-navy/50">{t('booking.sentRef')}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 text-sm">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-warm-gray">{t('booking.checkIn')}</p>
                                                <p className="font-medium text-navy">{formatDate(checkIn!)}</p>
                                                <p className="text-[11px] text-warm-gray">{t('booking.checkInTime')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-warm-gray">{t('booking.checkOut')}</p>
                                                <p className="font-medium text-navy">{formatDate(checkOut!)}</p>
                                                <p className="text-[11px] text-warm-gray">{t('booking.checkOutTime')}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-warm-gray">{t('booking.guests')}</p>
                                                <p className="font-medium text-navy">{guests} {guests > 1 ? t('booking.guests_plural') : t('booking.guest')}</p>
                                            </div>
                                            {pricing && (
                                                <div className="text-right">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-warm-gray">{t('booking.total')}</p>
                                                    <p className="text-lg font-bold text-navy">€{pricing.total}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* What happens next */}
                                    <div className="mb-8 space-y-3">
                                        {[
                                            { icon: '✉️', text: t('booking.sentStep1'), delay: '0.4s' },
                                            { icon: '🔍', text: t('booking.sentStep2'), delay: '0.55s' },
                                            { icon: '💳', text: t('booking.sentStep3'), delay: '0.7s' },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 rounded-xl bg-ocean/[0.03] px-4 py-3 animate-[fadeInUp_0.4s_ease-out_both]"
                                                style={{ animationDelay: item.delay }}
                                            >
                                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-sm">
                                                    {item.icon}
                                                </span>
                                                <p className="text-sm leading-relaxed text-navy/70">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Close button */}
                                    <button
                                        type="button"
                                        onClick={closeConfirmation}
                                        className="w-full rounded-full bg-gradient-to-r from-ocean to-ocean-dark py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
                                    >
                                        {t('booking.sentClose')}
                                    </button>
                                </div>
                            ) : (
                                /* ── REVIEW & SUBMIT VIEW ── */
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
                                                <p className="mt-0.5 text-xs text-warm-gray">{t('booking.checkInTime')}</p>
                                            </div>
                                            <div className="px-3 pt-3 text-warm-gray">→</div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                                    {t('booking.checkOut')}
                                                </p>
                                                <p className="text-base font-medium text-navy">{formatDate(checkOut!)}</p>
                                                <p className="mt-0.5 text-xs text-warm-gray">{t('booking.checkOutTime')}</p>
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
                                                <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">{t('booking.phone')}</p>
                                                <p className="text-sm font-medium text-navy">{guestPhone}</p>
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
                                                <p className="mt-1 text-right text-[11px] text-warm-gray">{t('booking.includesCleaning')}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* GDPR consent */}
                                    <div className="mt-6 rounded-xl border border-navy/8 bg-sand-light/60 p-4">
                                        <label className="flex cursor-pointer items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="gdpr-consent"
                                                checked={gdprConsent}
                                                onChange={(e) => setGdprConsent(e.target.checked)}
                                                className="mt-0.5 h-4 w-4 shrink-0 accent-ocean"
                                            />
                                            <span className="text-xs leading-relaxed text-warm-gray">
                                                {t('booking.gdprConsent' as TranslationKey)}{' '}
                                                <Link to="/terms" target="_blank" className="text-ocean underline underline-offset-2 hover:text-ocean-dark">
                                                    {t('booking.gdprPrivacyLink' as TranslationKey)}
                                                </Link>
                                            </span>
                                        </label>
                                        <p className="mt-2.5 text-[10px] leading-relaxed text-warm-gray/70">
                                            {t('booking.gdprDetails' as TranslationKey)}
                                        </p>
                                    </div>

                                    {/* Error message */}
                                    {status === 'error' && serverError && (
                                        <div className="mt-4 rounded-xl border border-coral/30 bg-coral/5 p-3 text-center">
                                            <p className="text-sm text-coral">{serverError}</p>
                                        </div>
                                    )}

                                    {/* Navigation */}
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
                                            disabled={status === 'sending' || !gdprConsent}
                                            className={`flex-[2] rounded-full py-3.5 text-base font-semibold text-white shadow-lg transition-all ${status === 'sending' || !gdprConsent
                                                ? 'cursor-not-allowed bg-coral/40'
                                                : 'bg-coral hover:bg-coral-dark hover:shadow-xl'
                                                }`}
                                        >
                                            {status === 'sending'
                                                ? t('booking.sending')
                                                : `${t('booking.request')} · €${pricing!.total}`}
                                        </button>
                                    </div>

                                    <p className="mt-4 text-center text-xs text-warm-gray">
                                        {t('booking.noPayment')}
                                    </p>
                                    <p className="mt-2 text-center text-xs text-warm-gray">
                                        {t('booking.termsAgree')}{' '}
                                        <Link to="/terms" target="_blank" className="text-ocean underline underline-offset-2 hover:text-ocean-dark">
                                            {t('booking.termsLink')}
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
