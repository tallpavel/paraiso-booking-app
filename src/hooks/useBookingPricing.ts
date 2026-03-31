import { useMemo, useCallback } from 'react';
import { getRateForDate } from './useBookingData';

export const MIN_NIGHTS = 3;

interface StayPricing {
    total: number;
    avgPerNight: number;
    nights: number;
}

/**
 * Calculate the total stay price between two dates using custom and seasonal rates.
 */
function calculateStayPrice(
    checkIn: Date,
    checkOut: Date,
    customRates: Map<string, number>,
    seasonalRates: readonly number[],
): StayPricing {
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

interface UseBookingPricingParams {
    checkIn: Date | null;
    checkOut: Date | null;
    customRates: Map<string, number>;
    seasonalRates: readonly number[];
    locale: string;
}

export interface BookingPricingResult {
    /** Pricing breakdown (null when no valid range selected) */
    pricing: StayPricing | null;
    /** Number of nights in the selected range */
    nights: number;
    /** Whether the selected range is below the minimum stay requirement */
    isBelowMinimum: boolean;
    /** Whether the dates pass the minimum-nights check */
    datesValid: boolean;
    /** Whether check-in is within 14 days (triggers different payment flow) */
    isLastMinute: boolean;
    /** Locale-aware date formatter */
    formatDate: (date: Date) => string;
}

/**
 * Derives all pricing and validation signals from the selected date range.
 * Pure computation — no side effects.
 */
export function useBookingPricing({
    checkIn,
    checkOut,
    customRates,
    seasonalRates,
    locale,
}: UseBookingPricingParams): BookingPricingResult {
    const pricing = useMemo(() => {
        if (!checkIn || !checkOut) return null;
        return calculateStayPrice(checkIn, checkOut, customRates, seasonalRates);
    }, [checkIn, checkOut, customRates, seasonalRates]);

    const nights = pricing?.nights ?? 0;
    const isBelowMinimum = nights > 0 && nights < MIN_NIGHTS;
    const datesValid = nights >= MIN_NIGHTS && pricing !== null;

    const isLastMinute = useMemo(() => {
        if (!checkIn) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff < 14;
    }, [checkIn]);

    const formatDate = useCallback(
        (date: Date): string => {
            const loc = locale === 'es' ? 'es-ES' : locale === 'cs' ? 'cs-CZ' : 'en-GB';
            return date.toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' });
        },
        [locale],
    );

    return { pricing, nights, isBelowMinimum, datesValid, isLastMinute, formatDate };
}

// Re-export for Flatpickr day-rendering in BookingCalendar
export { calculateStayPrice, getRateForDate };
export type { StayPricing };
