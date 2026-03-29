/**
 * Shared admin utility functions.
 * Extracted from AdminDashboard, ReservationRequestsPanel,
 * ConfirmedReservationsPanel, and ArchivedReservationsPanel
 * to eliminate duplication.
 */

/** Format a date string (YYYY-MM-DD) to a short human-readable label. */
export function formatDateShort(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
}

/** Map a payment status to a human-readable badge label. */
export function paymentLabel(status: string): string {
    switch (status) {
        case 'paid': return '✓ Deposit Paid';
        case 'pending': return '⏳ Pending';
        case 'failed': return '✕ Failed';
        default: return status;
    }
}

/** Calculate days between today and a target date string (YYYY-MM-DD). */
export function daysUntil(dateStr: string): number {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(dateStr);
    return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Convert a Date to a YYYY-MM-DD string. */
export function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Calculate stay progress as 0–100 percentage. */
export function stayProgress(checkIn: string, checkOut: string): number {
    const now = new Date();
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const total = end.getTime() - start.getTime();
    if (total <= 0) return 100;
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}
