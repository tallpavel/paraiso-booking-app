import { useState, useEffect } from 'react';
import { fetchConfirmedReservations, fetchDailyRates, fetchBlockedDates, fetchSeasonalRates } from '../api';
import type { ConfirmedReservation } from '../api';

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

export interface BookingData {
    bookedDates: Set<string>;
    blockedDates: Set<string>;
    customRates: Map<string, number>;
    seasonalRates: readonly number[];
    dataReady: boolean;
    /** Re-fetch confirmed reservations (e.g. after a successful booking) */
    refreshBookedDates: () => Promise<void>;
}

/**
 * Fetches and manages all availability & pricing data needed by the booking calendar.
 * Consolidates 4 API calls on mount and exposes a refresh function for post-booking updates.
 */
export function useBookingData(): BookingData {
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

    async function refreshBookedDates() {
        try {
            const data = await fetchConfirmedReservations();
            setBookedDates(expandBookedDays(data));
        } catch {
            // Silently ignore — stale booked-dates are non-critical
        }
    }

    return { bookedDates, blockedDates, customRates, seasonalRates, dataReady, refreshBookedDates };
}

// Re-export utilities needed by BookingCalendar for Flatpickr day rendering
export { toDateKey, FALLBACK_RATES };

/**
 * Get the nightly rate for a specific date, checking custom overrides first,
 * then falling back to seasonal rates.
 */
export function getRateForDate(d: Date, customRates: Map<string, number>, seasonalRates: readonly number[]): number {
    const key = toDateKey(d);
    if (customRates.has(key)) return customRates.get(key)!;
    return seasonalRates[d.getMonth()] ?? FALLBACK_RATES[d.getMonth()];
}
