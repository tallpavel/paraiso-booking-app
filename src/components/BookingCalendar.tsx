import { useState, useMemo, useCallback } from 'react';
import { useI18n } from '../i18n';

const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'] as const;
const DAYS_CS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'] as const;

const MONTHS_EN = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
] as const;
const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const;
const MONTHS_CS = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
] as const;

function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isBetween(date: Date, start: Date, end: Date): boolean {
    return date > start && date < end;
}

export default function BookingCalendar() {
    const { t, locale } = useI18n();
    const today = useMemo(() => new Date(), []);
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [guests, setGuests] = useState(2);
    const [submitted, setSubmitted] = useState(false);

    const DAYS = locale === 'es' ? DAYS_ES : locale === 'cs' ? DAYS_CS : DAYS_EN;
    const MONTHS = locale === 'es' ? MONTHS_ES : locale === 'cs' ? MONTHS_CS : MONTHS_EN;

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

    const days = useMemo(
        () => getDaysInMonth(currentYear, currentMonth),
        [currentYear, currentMonth],
    );

    const firstDayOffset = days[0]?.getDay() ?? 0;

    const navigate = useCallback(
        (dir: 1 | -1) => {
            let m = currentMonth + dir;
            let y = currentYear;
            if (m > 11) { m = 0; y++; }
            if (m < 0) { m = 11; y--; }
            setCurrentMonth(m);
            setCurrentYear(y);
        },
        [currentMonth, currentYear],
    );

    const handleDayClick = useCallback(
        (day: Date) => {
            if (day < today) return;
            if (!checkIn || (checkIn && checkOut)) {
                setCheckIn(day);
                setCheckOut(null);
            } else {
                if (day > checkIn) {
                    setCheckOut(day);
                } else {
                    setCheckIn(day);
                    setCheckOut(null);
                }
            }
        },
        [checkIn, checkOut, today],
    );

    const nights =
        checkIn && checkOut
            ? Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
            )
            : 0;

    const handleSubmit = () => {
        if (!checkIn || !checkOut) return;
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
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
                    {/* Calendar */}
                    <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
                        {/* Month Navigation */}
                        <div className="mb-6 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="rounded-lg p-2 text-navy transition-colors hover:bg-sand"
                                aria-label="Previous month"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h3 className="font-heading text-xl font-bold text-navy">
                                {MONTHS[currentMonth]} {currentYear}
                            </h3>
                            <button
                                type="button"
                                onClick={() => navigate(1)}
                                className="rounded-lg p-2 text-navy transition-colors hover:bg-sand"
                                aria-label="Next month"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day Headers */}
                        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                            {DAYS.map((d) => (
                                <span key={d} className="py-2 text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                    {d}
                                </span>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDayOffset }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {days.map((day) => {
                                const isPast = day < today && !isSameDay(day, today);
                                const isCheckIn = checkIn ? isSameDay(day, checkIn) : false;
                                const isCheckOut = checkOut ? isSameDay(day, checkOut) : false;
                                const isInRange =
                                    checkIn && checkOut ? isBetween(day, checkIn, checkOut) : false;
                                const isToday = isSameDay(day, today);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        type="button"
                                        disabled={isPast}
                                        onClick={() => handleDayClick(day)}
                                        className={`relative rounded-lg py-2.5 text-sm font-medium transition-all duration-150 ${isPast
                                            ? 'cursor-not-allowed text-navy/20'
                                            : isCheckIn || isCheckOut
                                                ? 'bg-ocean text-white shadow-md'
                                                : isInRange
                                                    ? 'bg-ocean/15 text-ocean'
                                                    : isToday
                                                        ? 'font-bold text-ocean ring-1 ring-ocean/30'
                                                        : 'text-navy hover:bg-sand'
                                            }`}
                                    >
                                        {day.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-lg sm:p-8">
                        <h3 className="font-heading text-xl font-bold text-navy">
                            {t('booking.yourStay')}
                        </h3>

                        <div className="space-y-4">
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

                        {nights > 0 && (
                            <div className="rounded-xl border border-ocean/20 bg-ocean/5 p-4 text-center">
                                <p className="text-2xl font-bold text-ocean">
                                    {nights} {nights > 1 ? t('booking.nights') : t('booking.night')}
                                </p>
                                <p className="text-sm text-warm-gray">
                                    {formatDate(checkIn!)} → {formatDate(checkOut!)}
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!checkIn || !checkOut}
                            className={`mt-auto w-full rounded-full py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 ${checkIn && checkOut
                                ? 'bg-coral hover:bg-coral-dark hover:shadow-xl'
                                : 'cursor-not-allowed bg-navy/20'
                                }`}
                        >
                            {submitted ? t('booking.sent') : t('booking.request')}
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
