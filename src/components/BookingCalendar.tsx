import { useState, useMemo, useEffect, useRef } from 'react';
import PhoneInput from './PhoneInput';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useBookingData, toDateKey, getRateForDate } from '../hooks/useBookingData';
import { useBookingPricing } from '../hooks/useBookingPricing';
import { useBookingForm } from '../hooks/useBookingForm';
import flatpickr from 'flatpickr';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import 'flatpickr/dist/flatpickr.min.css';


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

    // ── Data (availability, rates, blocked dates) ────────────────────
    const { bookedDates, blockedDates, customRates, seasonalRates, dataReady, refreshBookedDates } = useBookingData();

    // ── Date selection (kept local — Flatpickr onChange writes here) ──
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);

    // ── Pricing (derived from dates + rates) ─────────────────────────
    const { pricing, nights, isBelowMinimum, datesValid, isLastMinute, formatDate } = useBookingPricing({
        checkIn, checkOut, customRates, seasonalRates, locale,
    });

    // ── Refs ──────────────────────────────────────────────────────────
    const calendarRef = useRef<HTMLDivElement>(null);
    const fpRef = useRef<FlatpickrInstance | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // ── Form (guest state, wizard, validation, submit) ───────────────
    const form = useBookingForm({
        checkIn, checkOut, pricing, datesValid, locale, fpRef, refreshBookedDates,
    });
    const {
        step, setStep, goNext, goBack,
        adults, setAdults,
        children: childrenCount, setChildrenCount,
        childrenAges, setChildAge,
        guests,
        guestName, setGuestName,
        guestEmail, setGuestEmail,
        guestPhone, setGuestPhone,
        dialCode, setDialCode,
        comment, setComment,
        gdprConsent, setGdprConsent,
        termsConsent, setTermsConsent,
        preferredPaymentMethod, setPreferredPaymentMethod,
        errors, setErrors,
        status, serverError,
        spam,
        handleFieldChange,
        handleSubmit,
        closeConfirmation,
    } = form;

    /** Format guest summary for display (e.g. "2 Adults, 1 Child (8 yrs)") */
    const guestSummary = useMemo(() => {
        const adultLabel = adults === 1 ? t('booking.adult') : t('booking.adults');
        let summary = `${adults} ${adultLabel}`;
        if (childrenCount > 0) {
            const childLabel = childrenCount === 1 ? t('booking.child') : t('booking.children');
            const ages = childrenAges.filter((a): a is number => a !== undefined);
            summary += `, ${childrenCount} ${childLabel}`;
            if (ages.length > 0) {
                const unit = t('booking.ageUnit');
                summary += ` (${ages.map(a => `${a} ${unit}`).join(', ')})`;
            }
        }
        return summary;
    }, [adults, childrenCount, childrenAges, t]);

    const flatpickrLocale = useMemo(() => ({ firstDayOfWeek: 1 as const }), []);

    // ── Auto-scroll to top of card on step change ────────────────────
    useEffect(() => {
        if (step > 1 && cardRef.current) {
            const top = cardRef.current.getBoundingClientRect().top + window.scrollY - 16;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }, [step]);

    // ── Flatpickr calendar initialization ────────────────────────────
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

            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                if (dx < 0) {
                    fp.changeMonth(1);
                } else {
                    fp.changeMonth(-1);
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
                                    <div aria-live="polite" className={`rounded-xl border p-4 transition-colors ${isBelowMinimum ? 'border-coral/30 bg-coral/5' : 'border-ocean/20 bg-ocean/5'
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
                                    <PhoneInput
                                        id="booking-phone"
                                        value={guestPhone}
                                        dialCode={dialCode}
                                        onChangeNumber={(v) => { setGuestPhone(v); handleFieldChange('phone'); }}
                                        onChangeDialCode={setDialCode}
                                        placeholder={t('booking.phonePlaceholder')}
                                        hasError={!!errors.phone}
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-coral" role="alert">{errors.phone}</p>}
                                </div>

                                {/* Guests — Adults & Children steppers */}
                                <div>
                                    <p className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                        {t('booking.guests')}
                                    </p>

                                    {/* Adults row */}
                                    <div className="flex items-center justify-between rounded-xl border border-sand bg-sand-light px-4 py-3 mb-2">
                                        <span className="text-sm font-medium text-navy">{t('booking.adults')}</span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setAdults(adults - 1)}
                                                disabled={adults <= 1}
                                                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ocean/20 text-ocean transition-all hover:bg-ocean/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label="Decrease adults"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M5 12h14" /></svg>
                                            </button>
                                            <span className="w-6 text-center text-base font-bold text-navy">{adults}</span>
                                            <button
                                                type="button"
                                                onClick={() => setAdults(adults + 1)}
                                                disabled={adults >= 3 - childrenCount}
                                                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ocean/20 text-ocean transition-all hover:bg-ocean/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label="Increase adults"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M12 5v14m-7-7h14" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Children row */}
                                    <div className="flex items-center justify-between rounded-xl border border-sand bg-sand-light px-4 py-3 mb-2">
                                        <div>
                                            <span className="text-sm font-medium text-navy">{t('booking.children')}</span>
                                            <p className="text-[11px] text-warm-gray">{t('booking.childMinAge')}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setChildrenCount(childrenCount - 1)}
                                                disabled={childrenCount <= 0}
                                                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ocean/20 text-ocean transition-all hover:bg-ocean/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label="Decrease children"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M5 12h14" /></svg>
                                            </button>
                                            <span className="w-6 text-center text-base font-bold text-navy">{childrenCount}</span>
                                            <button
                                                type="button"
                                                onClick={() => setChildrenCount(childrenCount + 1)}
                                                disabled={childrenCount >= 3 - adults}
                                                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ocean/20 text-ocean transition-all hover:bg-ocean/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label="Increase children"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M12 5v14m-7-7h14" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Children age inputs */}
                                    {childrenCount > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {childrenAges.map((age, i) => (
                                                <div key={i} className="grid grid-cols-[1fr_7rem] items-center rounded-xl border border-sand bg-sand-light px-4 py-3">
                                                    <label htmlFor={`child-age-${i}`} className="text-sm font-medium text-navy whitespace-nowrap">
                                                        {t('booking.child')} {i + 1} — {t('booking.childAge')}
                                                    </label>
                                                    <select
                                                        id={`child-age-${i}`}
                                                        value={age ?? ''}
                                                        onChange={(e) => setChildAge(i, e.target.value ? Number(e.target.value) : undefined)}
                                                        className={`w-full rounded-xl border px-3 py-2 text-sm font-medium text-navy text-center focus:outline-none focus:ring-2 focus:ring-ocean ${
                                                            errors.childrenAges && (age === undefined || age < 6)
                                                                ? 'border-coral bg-coral/5'
                                                                : 'border-sand bg-white'
                                                        }`}
                                                    >
                                                        <option value="">{t('booking.childAgePlaceholder')}</option>
                                                        {Array.from({ length: 12 }, (_, j) => j + 6).map((a) => (
                                                            <option key={a} value={a}>{a} {t('booking.ageUnit')}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                            {errors.childrenAges && (
                                                <p className="text-xs text-coral" role="alert">{errors.childrenAges}</p>
                                            )}
                                        </div>
                                    )}

                                    <p className="mt-2 text-[11px] text-warm-gray">{t('booking.maxGuests')}</p>
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
                                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                        <span className="flex h-6 items-center rounded border border-navy/10 bg-white px-1.5 text-[10px] font-bold tracking-tight text-[#1a1f71]">VISA</span>
                                        <span className="flex h-6 items-center gap-0.5 rounded border border-navy/10 bg-white px-1.5">
                                            <span className="h-3 w-3 rounded-full bg-[#eb001b]" />
                                            <span className="-ml-1.5 h-3 w-3 rounded-full bg-[#f79e1b] opacity-80" />
                                        </span>
                                        <span className="flex h-6 items-center rounded bg-[#2e77bc] px-1.5 text-[10px] font-bold tracking-tight text-white">AMEX</span>
                                        <span className="flex h-6 items-center gap-0.5 rounded border border-navy/10 bg-white px-1.5 text-[10px] font-medium text-navy/60"><svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>Pay</span>
                                        <span className="flex h-6 items-center gap-0.5 rounded border border-navy/10 bg-white px-1.5 text-[10px] font-medium text-navy/60"><svg className="h-3 w-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.33v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.11z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Pay</span>
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
                                        {[t('booking.paypalTagBalance'), t('booking.paypalTagBank'), t('booking.paypalTagProtection')].map((tag) => (
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
                                        {isLastMinute ? (
                                            <svg className="h-4 w-4 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        ) : (
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-[13px] leading-relaxed text-navy/70">
                                        {isLastMinute
                                            ? t('booking.paymentLastMinuteNote')
                                            : t('booking.paymentNote')
                                        }
                                    </p>
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
                                                <p className="font-medium text-navy">{guestSummary}</p>
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
                                    <h3 className="mb-5 text-center font-heading text-xl font-bold text-navy sm:mb-6">
                                        {t('booking.stepConfirmTitle')}
                                    </h3>

                                    {/* Summary card */}
                                    <div className="overflow-hidden rounded-2xl border border-navy/8 bg-sand-light">
                                        {/* ─ Dates Row ─ */}
                                        <div className="flex items-stretch">
                                            <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5">
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
                                                    {t('booking.checkIn')}
                                                </p>
                                                <p className="mt-1 text-[15px] font-bold text-navy sm:text-base">{formatDate(checkIn!)}</p>
                                                <p className="mt-0.5 text-[11px] text-warm-gray">{t('booking.checkInTime')}</p>
                                            </div>
                                            <div className="flex w-10 items-center justify-center sm:w-12">
                                                <svg className="h-4 w-4 text-ocean/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 px-4 py-4 text-right sm:px-6 sm:py-5">
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
                                                    {t('booking.checkOut')}
                                                </p>
                                                <p className="mt-1 text-[15px] font-bold text-navy sm:text-base">{formatDate(checkOut!)}</p>
                                                <p className="mt-0.5 text-[11px] text-warm-gray">{t('booking.checkOutTime')}</p>
                                            </div>
                                        </div>

                                        {/* ─ Guest Details ─ */}
                                        <div className="border-t border-navy/6 px-4 py-4 sm:px-6 sm:py-5">
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean/8">
                                                        <svg className="h-3.5 w-3.5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                                                        </svg>
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">{t('booking.name')}</p>
                                                        <p className="truncate text-sm font-medium text-navy">{guestName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean/8">
                                                        <svg className="h-3.5 w-3.5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                        </svg>
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">{t('booking.email')}</p>
                                                        <p className="truncate text-sm font-medium text-navy">{guestEmail}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean/8">
                                                        <svg className="h-3.5 w-3.5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                                        </svg>
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">{t('booking.phone')}</p>
                                                        <p className="text-sm font-medium text-navy">{dialCode} {guestPhone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean/8">
                                                        <svg className="h-3.5 w-3.5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2.25 2.25 0 013 16.878V16.5a9.001 9.001 0 0112-8.485M15 19.128v.003" />
                                                        </svg>
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">{t('booking.guests')}</p>
                                                        <p className="text-sm font-medium text-navy">
                                                            {guestSummary}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            {comment.trim() && (
                                                <div className="mt-3 flex items-start gap-2.5 border-t border-navy/6 pt-3">
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean/8">
                                                        <svg className="h-3.5 w-3.5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                                        </svg>
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">{t('booking.comment')}</p>
                                                        <p className="text-sm text-navy">{comment}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* ─ Payment Method ─ */}
                                        <div className="border-t border-navy/6 px-4 py-3.5 sm:px-6">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean/8">
                                                    <svg className="h-3.5 w-3.5 text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                                    </svg>
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">{t('booking.paymentPreferred')}</p>
                                                    <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                                                        <span className={`h-2 w-2 rounded-full ${preferredPaymentMethod === 'stripe' ? 'bg-ocean' : 'bg-[#003087]'}`} />
                                                        {preferredPaymentMethod === 'stripe' ? t('booking.paymentStripeTitle') : t('booking.paymentPaypalTitle')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ─ Pricing Summary ─ */}
                                        {pricing && (
                                            <div className="border-t-2 border-navy/10 bg-white/60 px-4 py-4 sm:px-6">
                                                <div className="flex justify-between text-sm text-warm-gray">
                                                    <span>€{pricing.avgPerNight} × {nights} {nights > 1 ? t('booking.nights') : t('booking.night')}</span>
                                                    <span>€{pricing.total}</span>
                                                </div>
                                                <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-navy/10 pt-3">
                                                    <span className="text-sm font-bold uppercase tracking-wider text-navy">{t('booking.total')}</span>
                                                    <span className="text-xl font-bold text-navy">€{pricing.total}</span>
                                                </div>
                                                <p className="mt-1 text-right text-[10px] text-warm-gray">{t('booking.includesCleaning')}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* GDPR consent */}
                                    <div className="mt-5 rounded-xl border border-navy/8 bg-sand-light/60 p-4 sm:mt-6 sm:p-5">
                                        <label className="flex cursor-pointer items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="gdpr-consent"
                                                checked={gdprConsent}
                                                onChange={(e) => setGdprConsent(e.target.checked)}
                                                className="mt-0.5 h-5 w-5 shrink-0 accent-ocean"
                                            />
                                            <span className="text-[13px] leading-relaxed text-navy/70 sm:text-sm">
                                                {t('booking.gdprConsent')}{' '}
                                                <Link to="/terms" target="_blank" className="text-ocean underline underline-offset-2 hover:text-ocean-dark">
                                                    {t('booking.gdprPrivacyLink')}
                                                </Link>
                                            </span>
                                        </label>
                                        <p className="mt-3 border-t border-navy/5 pt-3 text-[11px] leading-relaxed text-warm-gray/60 sm:text-xs">
                                            {t('booking.gdprDetails')}
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
                                                {t('booking.termsConsent')}{' '}
                                                <Link to="/terms" target="_blank" className="text-ocean underline underline-offset-2 hover:text-ocean-dark">
                                                    {t('booking.termsPolicyLink')}
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

                                    {/* Navigation */}
                                    <div className="mt-6 flex flex-col-reverse gap-3 sm:mt-8 sm:flex-row">
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
