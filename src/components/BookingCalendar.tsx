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

// Fallback defaults if the seasonal-rates API is unreachable (must match backend DEFAULT_RATES)
const FALLBACK_RATES = [150, 175, 165, 155, 145, 155, 180, 190, 160, 150, 145, 180] as const;

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
    return seasonalRates[d.getMonth()] ?? FALLBACK_RATES[d.getMonth()];
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
        <div className="mb-4 flex items-center justify-center gap-2 sm:mb-8">
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
    const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

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
    const [termsConsent, setTermsConsent] = useState(false);
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
            fetchSeasonalRates().catch(() => ({ rates: [...FALLBACK_RATES] as number[], updatedAt: null })),
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

    // ── Refs ──────────────────────────────────────────────────────────
    const calendarRef = useRef<HTMLDivElement>(null);
    const fpRef = useRef<FlatpickrInstance | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const flatpickrLocale = useMemo(() => ({ firstDayOfWeek: 1 as const }), []);

    // ── Auto-scroll to top of card on step change ────────────────────
    useEffect(() => {
        if (step > 1 && cardRef.current) {
            const top = cardRef.current.getBoundingClientRect().top + window.scrollY - 16;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }, [step]);

    useEffect(() => {
        if (!calendarRef.current || !dataReady) return;

        const bookedSet = bookedDates;
        const blockedSet = blockedDates;

        // Helper: inject a year <select> dropdown to replace the default numInput
        function injectCustomHeader(instance: FlatpickrInstance) {
            const container = instance.calendarContainer;
            if (!container) return;

            const monthEl = container.querySelector('.flatpickr-current-month') as HTMLElement;
            if (!monthEl) return;

            // Hide the native month dropdown and year input
            const monthSelect = monthEl.querySelector('.flatpickr-monthDropdown-months') as HTMLElement;
            const numWrapper = monthEl.querySelector('.numInputWrapper') as HTMLElement;
            if (monthSelect) monthSelect.style.display = 'none';
            if (numWrapper) numWrapper.style.display = 'none';

            // Remove old custom header if present
            const existing = monthEl.querySelector('.fp-custom-header');
            if (existing) existing.remove();

            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];

            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            const maxYear = currentYear + 2;

            // Container
            const header = document.createElement('div');
            header.className = 'fp-custom-header';

            // ── Month button + dropdown ──
            const monthBtn = document.createElement('button');
            monthBtn.type = 'button';
            monthBtn.className = 'fp-custom-dropdown-btn';
            monthBtn.innerHTML = `${monthNames[instance.currentMonth]} <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

            const monthPanel = document.createElement('div');
            monthPanel.className = 'fp-custom-dropdown-panel fp-custom-dropdown-panel--months';

            monthNames.forEach((name, i) => {
                const opt = document.createElement('button');
                opt.type = 'button';
                opt.className = 'fp-custom-dropdown-option';
                opt.textContent = name.substring(0, 3);
                if (i === instance.currentMonth) opt.classList.add('fp-custom-dropdown-option--active');
                // Disable past months for current year
                if (instance.currentYear === currentYear && i < currentMonth) {
                    opt.disabled = true;
                    opt.classList.add('fp-custom-dropdown-option--disabled');
                }
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    instance.changeMonth(i - instance.currentMonth, true);
                    monthPanel.classList.remove('fp-custom-dropdown-panel--open');
                });
                monthPanel.appendChild(opt);
            });

            monthBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                yearPanel.classList.remove('fp-custom-dropdown-panel--open');
                monthPanel.classList.toggle('fp-custom-dropdown-panel--open');
            });

            // ── Year button + dropdown ──
            const yearBtn = document.createElement('button');
            yearBtn.type = 'button';
            yearBtn.className = 'fp-custom-dropdown-btn';
            yearBtn.innerHTML = `${instance.currentYear} <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

            const yearPanel = document.createElement('div');
            yearPanel.className = 'fp-custom-dropdown-panel fp-custom-dropdown-panel--years';

            for (let y = currentYear; y <= maxYear; y++) {
                const opt = document.createElement('button');
                opt.type = 'button';
                opt.className = 'fp-custom-dropdown-option';
                opt.textContent = String(y);
                if (y === instance.currentYear) opt.classList.add('fp-custom-dropdown-option--active');
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    instance.changeYear(y);
                    yearPanel.classList.remove('fp-custom-dropdown-panel--open');
                });
                yearPanel.appendChild(opt);
            }

            yearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                monthPanel.classList.remove('fp-custom-dropdown-panel--open');
                yearPanel.classList.toggle('fp-custom-dropdown-panel--open');
            });

            // Close dropdowns when clicking outside
            const closeHandler = (e: Event) => {
                if (!header.contains(e.target as Node)) {
                    monthPanel.classList.remove('fp-custom-dropdown-panel--open');
                    yearPanel.classList.remove('fp-custom-dropdown-panel--open');
                }
            };
            document.addEventListener('click', closeHandler);

            // Month wrapper (relative for positioning)
            const monthWrap = document.createElement('div');
            monthWrap.className = 'fp-custom-dropdown-wrap';
            monthWrap.appendChild(monthBtn);
            monthWrap.appendChild(monthPanel);

            // Year wrapper
            const yearWrap = document.createElement('div');
            yearWrap.className = 'fp-custom-dropdown-wrap';
            yearWrap.appendChild(yearBtn);
            yearWrap.appendChild(yearPanel);

            header.appendChild(monthWrap);
            header.appendChild(yearWrap);
            monthEl.appendChild(header);
        }

        const fp = flatpickr(calendarRef.current, {
            mode: 'range',
            minDate: 'today',
            dateFormat: 'Y-m-d',
            inline: true,
            showMonths: 1,
            locale: flatpickrLocale,
            disable: [(date: Date) => bookedSet.has(toDateKey(date)) || blockedSet.has(toDateKey(date))],

            onReady(_dObj: Date[], _dStr: string, instance: FlatpickrInstance) {
                injectCustomHeader(instance);
            },

            onYearChange(_dObj: Date[], _dStr: string, instance: FlatpickrInstance) {
                injectCustomHeader(instance);
            },

            onMonthChange(_dObj: Date[], _dStr: string, instance: FlatpickrInstance) {
                injectCustomHeader(instance);
            },

            onDayCreate(_dObj: Date[], _dStr: string, _fp: FlatpickrInstance, dayElem: HTMLElement) {
                const dayEl = dayElem as HTMLElement & { dateObj: Date };
                const cellDate = dayEl.dateObj;
                const rate = getRateForDate(cellDate, customRates, seasonalRates);
                const dateKey = toDateKey(cellDate);
                const isBooked = bookedSet.has(dateKey);
                const isBlocked = blockedSet.has(dateKey);

                const priceSpan = document.createElement('span');
                priceSpan.className = 'fp-day-price';

                // Weekend visual differentiation (Sat=6, Sun=0)
                const dow = cellDate.getDay();
                if (dow === 0 || dow === 6) {
                    dayElem.classList.add('fp-day--weekend');
                }

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

        // ── Touch swipe to change month (mobile) ─────────────────────
        // Attach to flatpickr's own calendarContainer so events are
        // captured before flatpickr's internal handlers consume them.
        const container = fp.calendarContainer;
        let swipeStartX = 0;
        let swipeStartY = 0;

        const onSwipeStart = (e: TouchEvent) => {
            swipeStartX = e.touches[0].clientX;
            swipeStartY = e.touches[0].clientY;
        };

        const onSwipeEnd = (e: TouchEvent) => {
            const dx = e.changedTouches[0].clientX - swipeStartX;
            const dy = e.changedTouches[0].clientY - swipeStartY;

            // Only trigger when horizontal swipe is dominant and > 50px
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                if (dx < 0) {
                    fp.changeMonth(1);   // swipe left → next month
                } else {
                    fp.changeMonth(-1);  // swipe right → previous month
                }
            }
        };

        container.addEventListener('touchstart', onSwipeStart, { passive: true, capture: true });
        container.addEventListener('touchend', onSwipeEnd, { passive: true, capture: true });

        return () => {
            container.removeEventListener('touchstart', onSwipeStart, { capture: true } as EventListenerOptions);
            container.removeEventListener('touchend', onSwipeEnd, { capture: true } as EventListenerOptions);
            fp.destroy();
            fpRef.current = null;
        };
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

    // ── Last-minute flag (check-in < 14 days from today) ─────────────
    const isLastMinute = useMemo(() => {
        if (!checkIn) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff < 14;
    }, [checkIn]);

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
        if (!guestName.trim()) {
            errs.name = t('booking.errorName');
        } else if (guestName.trim().length < 2) {
            errs.name = t('booking.errorNameInvalid');
        } else if (/\d/.test(guestName)) {
            errs.name = t('booking.errorNameInvalid');
        } else if (!/^[\p{L}\s'\-\.]+$/u.test(guestName.trim())) {
            errs.name = t('booking.errorNameInvalid');
        }
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
        } else if (step === 3) {
            setStep(4);
        }
    };

    const goBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const closeConfirmation = useCallback(() => {
        // Tell parent modals (BookingCTA / DiscoverDetailPage) to close
        window.dispatchEvent(new CustomEvent('close-booking'));
        window.scrollTo({ top: 0, behavior: 'instant' });
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
        setComment('');
        setPreferredPaymentMethod('stripe');
        setCheckIn(null);
        setCheckOut(null);
        setGuests(2);
        setStep(1);
        setStatus('idle');
        setGdprConsent(false);
        setTermsConsent(false);
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
            // If Turnstile token is missing, reset the widget to trigger re-verification
            if (!spam.isReady) {
                spam.reset();
            }
            setStatus('error');
            setServerError(spamCheck.reason || 'Security check failed.');
            setTimeout(() => setStatus('idle'), 8000);
            return;
        }

        setStatus('sending');
        setServerError('');

        try {
            await createReservation({
                guestName: guestName.trim(),
                guestEmail: guestEmail.trim(),
                guestPhone: guestPhone.trim(),
                checkIn: toDateKey(checkIn!),
                checkOut: toDateKey(checkOut!),
                nights: pricing!.nights,
                totalPrice: pricing!.total,
                comment: comment.trim() || undefined,
                locale,
                turnstileToken: spamCheck.turnstileToken,
                preferredPaymentMethod,
            });

            setStatus('sent');
            spam.reset();
        } catch (err: unknown) {
            setStatus('error');
            const apiErr = err as { message?: string; errors?: string[] };
            const errorMsg = apiErr?.errors?.join(', ') || apiErr?.message || t('booking.errorServer');

            // If backend rejected the Turnstile token (403), reset the widget for retry
            if (errorMsg.toLowerCase().includes('security') || errorMsg.toLowerCase().includes('verification')) {
                spam.reset();
            }

            setServerError(errorMsg);
            setTimeout(() => setStatus('idle'), 8000);
        }
    };

    const stepLabels = [
        t('booking.stepDates'),
        t('booking.stepDetails'),
        t('booking.stepPayment'),
        t('booking.stepConfirm')
    ];

    return (
        <section id="booking" className="bg-sand-light py-10 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-6">

                {/* Card container — wider on step 1 for the two-column layout */}
                <div ref={cardRef} className={`relative mx-auto rounded-3xl bg-white p-4 shadow-lg transition-all sm:p-10 ${step === 1 ? 'max-w-5xl' : 'max-w-2xl'}`}>

                    {/* Integrated header + step indicator */}
                    <div className="mb-3 text-center sm:mb-8">
                        <span className="mb-1 hidden text-sm font-semibold uppercase tracking-[0.15em] text-ocean sm:inline-block sm:mb-2">
                            {t('booking.label')}
                        </span>
                        <h2 className="mb-1 font-heading text-2xl font-bold text-navy sm:mb-2 sm:text-3xl md:text-4xl">
                            {t('booking.title')}
                        </h2>
                        <p className="mx-auto hidden max-w-2xl text-base text-warm-gray sm:block">
                            {t('booking.subtitle')}
                        </p>
                    </div>
                    <StepIndicator current={step} labels={stepLabels} />

                    {/* Spam protection (honeypot + Turnstile) — always mounted so the token persists across steps */}
                    {spam.honeypotField}

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
                        <div className="grid gap-4 sm:gap-8 lg:grid-cols-[1fr_320px]">
                            {/* Left — Calendar */}
                            <div>

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
                                    {checkIn ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                fpRef.current?.clear();
                                                setCheckIn(null);
                                                setCheckOut(null);
                                                calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}
                                            className="group relative rounded-xl bg-sand-light p-4 text-left transition-all hover:bg-sand hover:shadow-sm active:scale-[0.98] cursor-pointer"
                                            style={{ textTransform: 'none', letterSpacing: 'normal' }}
                                        >
                                            <svg className="absolute top-3 right-3 h-3.5 w-3.5 text-warm-gray/40 transition-colors group-hover:text-ocean" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                <path d="m15 5 4 4" />
                                            </svg>
                                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                                {t('booking.checkIn')}
                                            </span>
                                            <p className="font-medium text-navy group-hover:text-ocean transition-colors">
                                                {formatDate(checkIn)}
                                            </p>
                                            <p className="mt-0.5 text-xs text-warm-gray">{t('booking.checkInTime')}</p>
                                        </button>
                                    ) : (
                                        <div className="rounded-xl bg-sand-light p-4">
                                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                                {t('booking.checkIn')}
                                            </span>
                                            <p className="font-medium text-navy/40">
                                                {t('booking.selectDate')}
                                            </p>
                                        </div>
                                    )}
                                    {checkOut ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                fpRef.current?.setDate([checkIn!]);
                                                setCheckOut(null);
                                                calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}
                                            className="group relative rounded-xl bg-sand-light p-4 text-left transition-all hover:bg-sand hover:shadow-sm active:scale-[0.98] cursor-pointer"
                                            style={{ textTransform: 'none', letterSpacing: 'normal' }}
                                        >
                                            <svg className="absolute top-3 right-3 h-3.5 w-3.5 text-warm-gray/40 transition-colors group-hover:text-ocean" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                <path d="m15 5 4 4" />
                                            </svg>
                                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                                {t('booking.checkOut')}
                                            </span>
                                            <p className="font-medium text-navy group-hover:text-ocean transition-colors">
                                                {formatDate(checkOut)}
                                            </p>
                                            <p className="mt-0.5 text-xs text-warm-gray">{t('booking.checkOutTime')}</p>
                                        </button>
                                    ) : (
                                        <div className="rounded-xl bg-sand-light p-4">
                                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                                {t('booking.checkOut')}
                                            </span>
                                            <p className="font-medium text-navy/40">
                                                {t('booking.selectDate')}
                                            </p>
                                        </div>
                                    )}
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
                                    className={`mt-auto w-full rounded-full py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 sm:text-base ${datesValid
                                        ? 'bg-ocean hover:bg-ocean-dark hover:shadow-xl'
                                        : 'cursor-not-allowed bg-navy/15'
                                        }`}
                                >
                                    {datesValid
                                        ? `${t('booking.next')} · €${pricing!.total}`
                                        : t('booking.next')}
                                </button>
                                {datesValid && isLastMinute ? (
                                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-coral/20 bg-coral/5 px-3 py-2.5">
                                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-coral" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-xs font-medium leading-relaxed text-coral">
                                            {t('booking.lastMinuteNote')}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-center text-xs text-warm-gray">
                                        {t('booking.noPayment')}
                                    </p>
                                )}
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

                            </div>

                            {/* Navigation — stacked on mobile, side-by-side on sm+ */}
                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="rounded-full border-2 border-navy/15 py-3 text-sm font-semibold text-navy transition-colors hover:border-navy/30 hover:bg-sand sm:px-8 sm:py-3.5 sm:text-base"
                                >
                                    {t('booking.back')}
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="flex-1 rounded-full bg-ocean py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-ocean-dark hover:shadow-xl sm:text-base"
                                >
                                    {pricing ? `${t('booking.next')} · €${pricing.total}` : t('booking.next')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════ */}
                    {/*  STEP 3: Summary & Submit                          */}
                    {/* ═══════════════════════════════════════════════════ */}
                    {/* ═══════════════════════════════════════════════════ */}
                    {/*  STEP 3: Payment Preference                        */}
                    {/* ═══════════════════════════════════════════════════ */}
                    {step === 3 && (
                        <div className="animate-[fadeIn_0.4s_ease-out]">
                            <div className="mb-6 text-center">
                                <h3 className="font-heading text-xl font-bold text-navy sm:text-2xl">
                                    {t('booking.stepPaymentTitle')}
                                </h3>
                                <p className="mt-2 text-sm text-warm-gray">
                                    {t('booking.paymentSubtitle')}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Stripe Tile */}
                                <button
                                    type="button"
                                    onClick={() => setPreferredPaymentMethod('stripe')}
                                    className={`group relative flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all duration-300 ${preferredPaymentMethod === 'stripe'
                                        ? 'border-ocean bg-ocean/5 shadow-md shadow-ocean/10'
                                        : 'border-navy/10 bg-white hover:border-ocean/40 hover:bg-sand-light/50'
                                        }`}
                                >
                                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${preferredPaymentMethod === 'stripe' ? 'bg-ocean text-white' : 'bg-navy/5 text-navy/40 group-hover:bg-ocean/10 group-hover:text-ocean'
                                        }`}>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-navy">{t('booking.paymentStripeTitle')}</h4>
                                    <p className="mt-1 text-xs text-warm-gray leading-relaxed">{t('booking.paymentStripeDesc')}</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        {/* Visa */}
                                        <svg className="h-6 w-auto opacity-60 group-hover:opacity-80 transition-opacity" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8H293.2z" fill="#1a1f71"/>
                                            <path d="M560.9 157.8c-10.6-4-27.2-8.2-47.9-8.2-52.8 0-90 26.5-90.3 64.5-.3 28.1 26.6 43.8 46.9 53.1 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-31.9 19.1-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 43.8c12.5 5.4 35.6 10.2 59.6 10.4 56.2 0 92.7-26.2 93.1-66.8.2-22.3-14.1-39.2-45-53.1-18.7-9.1-30.2-15.1-30.1-24.3 0-8.1 9.7-16.8 30.7-16.8 17.5-.3 30.2 3.5 40.1 7.5l4.8 2.3 7.3-42.5z" fill="#1a1f71"/>
                                            <path d="M632.2 152.9h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.4 179.6h56.2s9.2-24.1 11.3-29.4h68.6c1.6 6.9 6.5 29.4 6.5 29.4h49.7l-43.6-195.8zm-66 126.4c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.7l3.6 16.9s10.3 46.8 12.4 56.6h-44.5z" fill="#1a1f71"/>
                                            <path d="M247.8 152.9L195.5 284l-5.6-27c-9.7-31.2-39.9-65-73.7-81.9l47.9 172.3h56.6l84.2-194.5h-57.1z" fill="#1a1f71"/>
                                            <path d="M146.9 152.9H60.8l-.7 3.9c67.2 16.2 111.7 55.3 130.1 102.2l-18.8-90.2c-3.2-12.3-12.7-15.5-24.5-15.9z" fill="#f9a533"/>
                                        </svg>
                                        {/* Mastercard */}
                                        <svg className="h-6 w-auto opacity-60 group-hover:opacity-80 transition-opacity" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="312" cy="250" r="150" fill="#eb001b"/>
                                            <circle cx="468" cy="250" r="150" fill="#f79e1b"/>
                                            <path d="M390 130.7c38.5 30.8 63.1 78.4 63.1 131.3s-24.6 100.5-63.1 131.3c-38.5-30.8-63.1-78.4-63.1-131.3s24.6-100.5 63.1-131.3z" fill="#ff5f00"/>
                                        </svg>
                                        {/* Amex */}
                                        <svg className="h-6 w-auto opacity-60 group-hover:opacity-80 transition-opacity" viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="780" height="500" rx="40" fill="#2e77bc"/>
                                            <path d="M207 181l-76 168h55l11-27h62l11 27h57l-76-168h-44zm22 53l18 44h-36l18-44zM389 181v168h49l55-83v83h44V181h-49l-55 83v-83h-44zM591 181v168h133v-37h-89v-25h87v-36h-87v-33h89v-37H591z" fill="white"/>
                                        </svg>
                                        {/* Apple Pay */}
                                        <span className="flex h-6 items-center rounded bg-navy/5 px-2">
                                            <svg className="h-4 w-auto opacity-50 group-hover:opacity-70 transition-opacity" viewBox="0 0 165.52 105.97" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M30.54 13.83c-2.04 2.41-5.33 4.28-8.61 4.01-.41-3.28 1.2-6.77 3.07-8.93 2.04-2.53 5.58-4.4 8.48-4.52.34 3.4-1.02 6.85-2.94 9.44m2.9 4.8c-4.75-.28-8.8 2.7-11.06 2.7s-5.73-2.56-9.47-2.49c-4.87.08-9.37 2.83-11.86 7.21-5.09 8.75-1.31 21.72 3.6 28.86 2.45 3.53 5.33 7.49 9.14 7.35 3.6-.14 5.01-2.35 9.37-2.35s5.62 2.35 9.44 2.28c3.95-.07 6.42-3.54 8.87-7.08 2.77-4.03 3.88-7.95 3.95-8.15-.07-.07-7.63-2.97-7.7-11.65-.07-7.28 5.95-10.75 6.22-10.96-3.4-5.01-8.69-5.57-10.5-5.72M68.82 10.34v50.4h7.78v-17.23h10.77c9.83 0 16.73-6.75 16.73-16.63 0-9.87-6.77-16.54-16.46-16.54H68.82zm7.78 6.54h8.96c6.75 0 10.61 3.6 10.61 9.95 0 6.36-3.86 9.99-10.64 9.99h-8.93V16.88zM117.4 61.2c4.88 0 9.4-2.49 11.45-6.42h.16v6.02h7.21V36.07c0-7.24-5.78-11.89-14.68-11.89-8.31 0-14.4 4.72-14.63 11.2h7.01c.57-3.08 3.47-5.1 7.35-5.1 4.75 0 7.42 2.21 7.42 6.29v2.76l-9.71.58c-9.03.54-13.92 4.24-13.92 10.66 0 6.49 5.03 10.63 12.34 10.63zm2.08-5.91c-4.14 0-6.77-1.99-6.77-5.03 0-3.14 2.53-4.96 7.35-5.24l8.65-.55v2.83c0 4.65-3.92 7.99-9.23 7.99zM152.42 71.97c7.59 0 11.15-2.9 14.26-11.72L182 16.88h-7.92l-10.36 32.83h-.17L153.2 16.88h-8.12L159.81 59l-.85 2.66c-1.43 4.48-3.74 6.22-7.87 6.22-.74 0-2.15-.07-2.73-.14v6.02c.54.14 2.63.21 4.06.21z" fill="#1d1d1b"/>
                                            </svg>
                                        </span>
                                        {/* Google Pay */}
                                        <span className="flex h-6 items-center rounded bg-navy/5 px-2">
                                            <svg className="h-4 w-auto opacity-50 group-hover:opacity-70 transition-opacity" viewBox="0 0 435.97 173.14" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M206.2 84.58v50.75h-16.1V10h42.7a38.61 38.61 0 0 1 27.65 10.85A34.88 34.88 0 0 1 272 48.35a35.27 35.27 0 0 1-11.55 27.3 37.9 37.9 0 0 1-27.65 11.2h-26.6zm0-59.15v43.75h27c7 0 12.95-2.45 17.85-7.35a23.83 23.83 0 0 0 .17-34 23.42 23.42 0 0 0-17.5-7.35h-27.52z" fill="#5f6368"/>
                                                <path d="M309.1 46.78c12.07 0 21.53 3.22 28.35 9.62s10.15 15.05 10.15 25.9v52.33h-15.4v-11.73h-.7c-6.72 9.98-15.58 14.88-26.6 14.88a36.3 36.3 0 0 1-25.03-9.1 28.96 28.96 0 0 1-10.33-22.58c0-9.52 3.6-17.08 10.85-22.58s17.15-8.27 29.75-8.27c10.71 0 19.51 1.96 26.43 5.88v-4.13a19.74 19.74 0 0 0-7.53-15.58 25.57 25.57 0 0 0-17.15-6.47c-9.91 0-17.78 4.2-23.63 12.6l-14.18-8.93c8.4-12.42 20.83-18.54 37.02-18.54zm-23.28 62.65a14.17 14.17 0 0 0 5.95 11.73 21.2 21.2 0 0 0 13.65 4.73 27.6 27.6 0 0 0 19.6-8.23c5.78-5.42 8.62-11.73 8.62-18.9-5.6-4.48-13.44-6.72-23.45-6.72-7.28 0-13.35 1.78-18.2 5.42-4.73 3.5-6.17 7.88-6.17 11.97z" fill="#5f6368"/>
                                                <path d="M436 49.93l-53.48 123.03h-16.63l19.83-42.88-35.18-80.15h17.5l25.2 60.9h.35l24.5-60.9z" fill="#5f6368"/>
                                                <path d="M141.14 73.64c0-4.56-.38-9.12-1.14-13.55H72v25.62h38.89a33.24 33.24 0 0 1-14.39 21.79v17.85h23.1c13.59-12.52 21.41-31.04 21.41-51.71z" fill="#4285f4"/>
                                                <path d="M72 143.5c19.36 0 35.63-6.38 47.53-17.32l-23.1-17.85c-6.42 4.34-14.68 6.82-24.43 6.82-18.72 0-34.58-12.64-40.25-29.64H8.04v18.41A71.81 71.81 0 0 0 72 143.5z" fill="#34a853"/>
                                                <path d="M31.75 85.51a43.27 43.27 0 0 1 0-27.56V39.54H8.04a71.59 71.59 0 0 0 0 64.38z" fill="#fbbc04"/>
                                                <path d="M72 28.18a39.08 39.08 0 0 1 27.62 10.78l20.55-20.55A69.18 69.18 0 0 0 72 .14 71.81 71.81 0 0 0 8.04 39.54l23.71 18.41C37.42 40.94 53.28 28.18 72 28.18z" fill="#ea4335"/>
                                            </svg>
                                        </span>
                                    </div>
                                    {preferredPaymentMethod === 'stripe' && (
                                        <div className="absolute right-3 top-3 h-5 w-5 rounded-full bg-ocean text-white flex items-center justify-center">
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>

                                {/* PayPal Tile */}
                                <button
                                    type="button"
                                    onClick={() => setPreferredPaymentMethod('paypal')}
                                    className={`group relative flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all duration-300 ${preferredPaymentMethod === 'paypal'
                                        ? 'border-[#003087] bg-[#003087]/5 shadow-md shadow-[#003087]/10'
                                        : 'border-navy/10 bg-white hover:border-[#003087]/40 hover:bg-sand-light/50'
                                        }`}
                                >
                                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${preferredPaymentMethod === 'paypal' ? 'bg-[#003087] text-white' : 'bg-navy/5 text-navy/40 group-hover:bg-[#003087]/10 group-hover:text-[#003087]'
                                        }`}>
                                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.067 8.478c.492.296.884.773 1.132 1.341a4.238 4.238 0 0 1 .45 1.944 4.1 4.1 0 0 1-1.01 2.822 6.8 6.8 0 0 1-2.613 1.838 8.01 8.01 0 0 1-3.23.633H12.91c-.482 0-.895.326-1.03.774l-1.396 4.603-.01.03a.475.475 0 0 1-.462.336H7.13a.417.417 0 0 1-.424-.485c0-.026.002-.05.006-.075l2.427-8a.472.472 0 0 1 .462-.336h2.245c1.173 0 2.222-.244 3.018-.738.744-.462 1.32-.977 1.706-1.572.396-.61.594-1.285.594-2.022a3.83 3.83 0 0 0-.298-1.503l.2.2c-.375.435-.91.801-1.606 1.096-.694.296-1.488.441-2.383.441h-2.22c-.483 0-.897.327-1.032.775L7.494 20h-3.37a.418.418 0 0 1-.426-.486c0-.025.003-.05.007-.074L6.96 4.98l.004-.025a.473.473 0 0 1 .462-.336h5.814c1.378 0 2.61.287 3.518.892 1.063.712 1.63 1.734 1.309 2.967zm-9.06 1.442l-.248.815a.262.262 0 0 0 .257.34h2.245c.82 0 1.543-.171 2.08-.501.53-.326.87-.714 1.05-1.157a.262.262 0 0 0-.256-.34h-4.32a1.034 1.034 0 0 0-1.008.843z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-navy">{t('booking.paymentPaypalTitle')}</h4>
                                    <p className="mt-1 text-xs text-warm-gray leading-relaxed">{t('booking.paymentPaypalDesc')}</p>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {['Balance', 'Bank', 'Protection'].map((tag) => (
                                            <span key={tag} className="rounded-md bg-navy/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-navy/50">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {preferredPaymentMethod === 'paypal' && (
                                        <div className="absolute right-3 top-3 h-5 w-5 rounded-full bg-[#003087] text-white flex items-center justify-center">
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            </div>

                            <div className="mt-8 rounded-2xl bg-sand p-5 sm:p-6 shadow-sm shadow-navy/5">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 shrink-0 rounded-full bg-navy/5 p-1.5 text-navy/40">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[13px] leading-relaxed text-navy/70">
                                            {t('booking.paymentNote')}
                                        </p>
                                        {isLastMinute && (
                                            <div className="flex items-center gap-2 text-[12px] font-semibold text-ocean bg-ocean/5 rounded-lg px-3 py-2">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                {t('booking.paymentLastMinuteNote')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="flex-1 rounded-full border border-navy/20 py-3 text-base font-semibold text-navy transition-colors hover:bg-sand-light"
                                >
                                    {t('booking.back')}
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="flex-[2] rounded-full bg-gradient-to-r from-ocean to-ocean-dark py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
                                >
                                    {t('booking.next')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════ */}
                    {/*  STEP 4: Review & Confirm                             */}
                    {/* ═══════════════════════════════════════════════════ */}
                    {step === 4 && (
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
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">{t('booking.email')}</p>
                                                <p className="text-sm font-medium text-navy break-all">{guestEmail}</p>
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
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">{t('booking.paymentPreferred')}</p>
                                                <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                                                    {preferredPaymentMethod === 'stripe' ? (
                                                        <>
                                                            <span className="h-2 w-2 rounded-full bg-ocean" />
                                                            {t('booking.paymentStripeTitle')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="h-2 w-2 rounded-full bg-[#003087]" />
                                                            {t('booking.paymentPaypalTitle')}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
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

                                    {/* GDPR consent — improved readability on mobile */}
                                    <div className="mt-6 rounded-xl border border-navy/8 bg-sand-light/60 p-4 sm:p-5">
                                        <label className="flex cursor-pointer items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="gdpr-consent"
                                                checked={gdprConsent}
                                                onChange={(e) => setGdprConsent(e.target.checked)}
                                                className="mt-0.5 h-5 w-5 shrink-0 accent-ocean"
                                            />
                                            <span className="text-[13px] leading-relaxed text-navy/70 sm:text-sm">
                                                {t('booking.gdprConsent' as TranslationKey)}{' '}
                                                <Link to="/terms" target="_blank" className="text-ocean underline underline-offset-2 hover:text-ocean-dark">
                                                    {t('booking.gdprPrivacyLink' as TranslationKey)}
                                                </Link>
                                            </span>
                                        </label>
                                        <p className="mt-3 border-t border-navy/5 pt-3 text-[11px] leading-relaxed text-warm-gray/60 sm:text-xs">
                                            {t('booking.gdprDetails' as TranslationKey)}
                                        </p>
                                    </div>

                                    {/* Terms & Cancellation Policy consent */}
                                    <div className="mt-3 rounded-xl border border-navy/8 bg-sand-light/60 p-4 sm:p-5">
                                        <label className="flex cursor-pointer items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="terms-consent"
                                                checked={termsConsent}
                                                onChange={(e) => setTermsConsent(e.target.checked)}
                                                className="mt-0.5 h-5 w-5 shrink-0 accent-ocean"
                                            />
                                            <span className="text-[13px] leading-relaxed text-navy/70 sm:text-sm">
                                                {t('booking.termsConsent' as TranslationKey)}{' '}
                                                <Link to="/terms" target="_blank" className="text-ocean underline underline-offset-2 hover:text-ocean-dark">
                                                    {t('booking.termsPolicyLink' as TranslationKey)}
                                                </Link>
                                            </span>
                                        </label>
                                    </div>

                                    {/* Error message */}
                                    {status === 'error' && serverError && (
                                        <div className="mt-4 rounded-xl border border-coral/30 bg-coral/5 p-3 text-center">
                                            <p className="text-sm text-coral">{serverError}</p>
                                        </div>
                                    )}

                                    {/* Navigation — stacked on mobile, side-by-side on sm+ */}
                                    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={goBack}
                                            disabled={status === 'sending'}
                                            className="rounded-full border-2 border-navy/15 py-3 text-sm font-semibold text-navy transition-colors hover:border-navy/30 hover:bg-sand disabled:opacity-50 sm:px-8 sm:py-3.5 sm:text-base"
                                        >
                                            {t('booking.back')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={status === 'sending' || !gdprConsent || !termsConsent}
                                            className={`flex-1 rounded-full py-3.5 text-sm font-semibold shadow-lg transition-all sm:text-base ${status === 'sending' || !gdprConsent || !termsConsent
                                                ? 'cursor-not-allowed bg-navy/15 text-navy/30'
                                                : 'bg-coral text-white hover:bg-coral-dark hover:shadow-xl'
                                                }`}
                                        >
                                            {status === 'sending'
                                                ? t('booking.sending')
                                                : `${t('booking.request')} · €${pricing!.total}`}
                                        </button>
                                    </div>

                                    {isLastMinute ? (
                                        <div className="mt-4 flex items-start gap-2 rounded-xl border border-coral/20 bg-coral/5 px-3 py-2.5">
                                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-coral" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-xs font-medium leading-relaxed text-coral">
                                                {t('booking.lastMinuteNote')}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-center text-xs text-warm-gray">
                                            {t('booking.noPayment')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
