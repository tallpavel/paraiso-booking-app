// ── API Service — connects to the flat-booking-system backend ────────
const API_BASE = '/api';

export interface ReservationPayload {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkIn: string;   // ISO date string
    checkOut: string;   // ISO date string
    nights: number;
    totalPrice: number;
    comment?: string;
    turnstileToken?: string;
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
    guestPhone?: string;
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

// ── Daily Rates (custom per-day pricing) ─────────────────────────────

export interface DailyRate {
    _id: string;
    date: string;      // ISO date string
    price: number;
    note: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Fetch custom daily prices. Returns rates for up to 12 months ahead.
 */
export async function fetchDailyRates(): Promise<DailyRate[]> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-indexed

    // Fetch current month + next 11 months in parallel
    const fetches: Promise<DailyRate[]>[] = [];
    const cacheBust = Date.now(); // prevent browser caching
    for (let i = 0; i < 12; i++) {
        let m = month + i;
        let y = year;
        if (m > 12) { m -= 12; y++; }

        fetches.push(
            fetch(`${API_BASE}/daily-rates?year=${y}&month=${m}&_t=${cacheBust}`)
                .then((r) => (r.ok ? r.json() : []))
                .catch(() => []),
        );
    }

    const results = await Promise.all(fetches);
    return results.flat();
}

// ── Contact Form ─────────────────────────────────────────────────────

export interface ContactPayload {
    name: string;
    email: string;
    phone?: string;
    message: string;
    turnstileToken?: string;
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

// ── Admin API ────────────────────────────────────────────────────────

function authHeaders(token: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

export interface AdminStats {
    pendingRequests: number;
    confirmedTotal: number;
    paymentPending: number;
    paymentPaid: number;
    paymentFailed: number;
    upcomingCheckIns: number;
}

export interface ConfirmedReservationFull {
    _id: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    totalPrice: number;
    depositAmount: number;
    comment: string;
    paymentStatus: 'pending' | 'paid' | 'failed';
    stripeSessionId: string;
    stripePaymentUrl: string;
    status?: 'active' | 'cancelled' | 'completed';
    cancelledAt?: string;
    checkedIn?: boolean;
    checkedInAt?: string;
    checkInStatus?: 'pending' | 'sent' | 'completed';
    checkInToken?: string;
    createdAt: string;
    updatedAt: string;
}

export async function adminLogin(password: string): Promise<{ token: string; expiresIn: number }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    });

    if (!res.ok) {
        const body: ApiError = await res.json().catch(() => ({
            message: 'Login failed',
        }));
        throw body;
    }

    return res.json();
}

export async function fetchAdminStats(token: string): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}

export async function fetchReservationsAuth(token: string): Promise<Reservation[]> {
    const res = await fetch(`${API_BASE}/reservations`, {
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error('Failed to fetch reservations');
    return res.json();
}

export async function fetchConfirmedReservationsFull(token: string): Promise<ConfirmedReservationFull[]> {
    const res = await fetch(`${API_BASE}/reservations-confirmed`, {
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error('Failed to fetch confirmed reservations');
    return res.json();
}

export async function fetchArchivedReservations(token: string): Promise<ConfirmedReservationFull[]> {
    const res = await fetch(`${API_BASE}/reservations-confirmed/archived/list`, {
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error('Failed to fetch archived reservations');
    return res.json();
}

export async function toggleCheckIn(token: string, id: string): Promise<ConfirmedReservationFull> {
    const res = await fetch(`${API_BASE}/reservations-confirmed/${id}/checkin`, {
        method: 'PATCH',
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error('Failed to toggle check-in status');
    return res.json();
}

export async function sendCheckInEmail(token: string, reservationId: string): Promise<{ message: string; checkInUrl: string }> {
    const res = await fetch(`${API_BASE}/checkin/send/${reservationId}`, {
        method: 'POST',
        headers: authHeaders(token),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ message: 'Failed to send check-in email' }));
        throw body;
    }
    return res.json();
}

export interface CheckInDetails {
    guestName: string;
    guestEmail: string;
    checkIn: string;
    checkOut: string;
    guests: CheckInGuest[];
    submittedAt: string | null;
    checkInUrl: string;
    updatedAt: string;
}

export async function fetchCheckInDetails(token: string, reservationId: string): Promise<CheckInDetails> {
    const res = await fetch(`${API_BASE}/checkin/reservation/${reservationId}`, {
        headers: authHeaders(token),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ message: 'No check-in data found' }));
        throw body;
    }
    return res.json();
}

export interface CheckInGuest {
    _id?: string;
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    documentType: 'passport' | 'id_card' | 'driving_license';
    documentNumber: string;
}

export interface CheckInFormData {
    guestName: string;
    guestEmail: string;
    checkIn: string;
    checkOut: string;
    guests: CheckInGuest[];
    submittedAt: string | null;
}

export async function fetchCheckInData(checkInToken: string): Promise<CheckInFormData> {
    const res = await fetch(`${API_BASE}/checkin/${checkInToken}`);
    if (!res.ok) {
        const body = await res.json().catch(() => ({ message: 'Check-in link not found' }));
        throw body;
    }
    return res.json();
}

export async function submitCheckInData(
    checkInToken: string,
    guests: CheckInGuest[],
    turnstileToken?: string,
): Promise<{ message: string; guests: CheckInGuest[]; submittedAt: string }> {
    const res = await fetch(`${API_BASE}/checkin/${checkInToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests, turnstileToken }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ message: 'Failed to submit check-in data' }));
        throw body;
    }
    return res.json();
}

export async function confirmReservation(
    token: string,
    id: string,
): Promise<{ message: string; confirmed: ConfirmedReservationFull; paymentUrl: string; emailSent: boolean }> {
    const res = await fetch(`${API_BASE}/reservations/${id}/confirm`, {
        method: 'POST',
        headers: authHeaders(token),
    });

    if (!res.ok) {
        const body: ApiError = await res.json().catch(() => ({
            message: 'Failed to confirm reservation',
        }));
        throw body;
    }

    return res.json();
}

export async function deleteReservationRequest(token: string, id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reservations/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error('Failed to delete reservation request');
    return res.json();
}

export async function deleteConfirmedReservation(token: string, id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reservations-confirmed/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error('Failed to cancel confirmed reservation');
    return res.json();
}

// ── Update Reservation (Request) ─────────────────────────────────────

export interface UpdateReservationPayload {
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    totalPrice?: number;
    comment?: string;
}

export async function updateReservationRequest(
    token: string,
    id: string,
    data: UpdateReservationPayload,
): Promise<Reservation> {
    const res = await fetch(`${API_BASE}/reservations/${id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const body: ApiError = await res.json().catch(() => ({
            message: 'Failed to update reservation',
        }));
        throw body;
    }

    return res.json();
}

// ── Update Confirmed Reservation ─────────────────────────────────────

export async function updateConfirmedReservation(
    token: string,
    id: string,
    data: UpdateReservationPayload,
): Promise<ConfirmedReservationFull> {
    const res = await fetch(`${API_BASE}/reservations-confirmed/${id}`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const body: ApiError = await res.json().catch(() => ({
            message: 'Failed to update confirmed reservation',
        }));
        throw body;
    }

    return res.json();
}

