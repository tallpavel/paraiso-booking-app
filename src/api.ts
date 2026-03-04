// ── API Service — connects to the flat-booking-system backend ────────
const API_BASE = '/api';

export interface ReservationPayload {
    guestName: string;
    guestEmail: string;
    checkIn: string;   // ISO date string
    checkOut: string;   // ISO date string
}

export interface Reservation extends ReservationPayload {
    _id: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiError {
    message: string;
    errors?: string[];
}

/**
 * Create a new reservation via the flat-booking-system backend.
 */
export async function createReservation(
    data: ReservationPayload,
): Promise<Reservation> {
    const res = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const body: ApiError = await res.json().catch(() => ({
            message: 'Something went wrong. Please try again.',
        }));
        throw body;
    }

    return res.json();
}

/**
 * Fetch all existing reservations (useful for showing booked dates).
 */
export async function fetchReservations(): Promise<Reservation[]> {
    const res = await fetch(`${API_BASE}/reservations`);

    if (!res.ok) {
        throw new Error('Failed to fetch reservations');
    }

    return res.json();
}

// ── Confirmed Reservations ───────────────────────────────────────────

export interface ConfirmedReservation {
    _id: string;
    guestName: string;
    guestEmail: string;
    checkIn: string;
    checkOut: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Fetch confirmed reservations to determine which dates are unavailable.
 */
export async function fetchConfirmedReservations(): Promise<ConfirmedReservation[]> {
    const res = await fetch(`${API_BASE}/reservations-confirmed`);

    if (!res.ok) {
        throw new Error('Failed to fetch confirmed reservations');
    }

    return res.json();
}

// ── Contact Form ─────────────────────────────────────────────────────

export interface ContactPayload {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

/**
 * Send a contact form message via the backend (email delivery).
 */
export async function sendContactMessage(
    data: ContactPayload,
): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const body: ApiError = await res.json().catch(() => ({
            message: 'Failed to send message. Please try again.',
        }));
        throw body;
    }

    return res.json();
}
