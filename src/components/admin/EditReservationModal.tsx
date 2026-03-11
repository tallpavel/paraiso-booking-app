import { useState, useEffect, useMemo } from 'react';
import type { Reservation, ConfirmedReservationFull, UpdateReservationPayload } from '../../api';
import { fetchConfirmedReservations } from '../../api';

// ── Types ────────────────────────────────────────────────────────────
type EditableReservation = Reservation | ConfirmedReservationFull;

interface EditReservationModalProps {
    reservation: EditableReservation;
    type: 'request' | 'confirmed';
    allConfirmed: ConfirmedReservationFull[];
    onSave: (id: string, data: UpdateReservationPayload) => Promise<void>;
    onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────
function toDateInputValue(isoOrDate: string): string {
    return isoOrDate.slice(0, 10);
}

function daysBetween(a: string, b: string): number {
    const msPerDay = 86_400_000;
    return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

function expandBookedDays(
    reservations: { checkIn: string; checkOut: string; _id: string }[],
    excludeId: string,
): Set<string> {
    const set = new Set<string>();
    for (const r of reservations) {
        if (r._id === excludeId) continue; // exclude the one being edited
        const start = new Date(r.checkIn);
        const end = new Date(r.checkOut);
        const cursor = new Date(start);
        while (cursor < end) {
            const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
            set.add(key);
            cursor.setDate(cursor.getDate() + 1);
        }
    }
    return set;
}

function rangeOverlapsBooked(checkIn: string, checkOut: string, booked: Set<string>): string[] {
    const conflicts: string[] = [];
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const cursor = new Date(start);
    while (cursor < end) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
        if (booked.has(key)) conflicts.push(key);
        cursor.setDate(cursor.getDate() + 1);
    }
    return conflicts;
}

const MIN_NIGHTS = 3;
const NIGHTLY_RATES: readonly number[] = [
    150, 175, 165, 155, 145, 155, 180, 190, 160, 150, 145, 180,
] as const;

function estimatePrice(checkIn: string, checkOut: string): number {
    let total = 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const cursor = new Date(start);
    while (cursor < end) {
        total += NIGHTLY_RATES[cursor.getMonth()];
        cursor.setDate(cursor.getDate() + 1);
    }
    return total;
}

// ═══════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function EditReservationModal({
    reservation,
    type,
    allConfirmed,
    onSave,
    onClose,
}: EditReservationModalProps) {
    // ── Form state ───────────────────────────────────────────────────
    const [guestName, setGuestName] = useState(reservation.guestName);
    const [guestEmail, setGuestEmail] = useState(reservation.guestEmail);
    const [checkIn, setCheckIn] = useState(toDateInputValue(reservation.checkIn));
    const [checkOut, setCheckOut] = useState(toDateInputValue(reservation.checkOut));
    const [comment, setComment] = useState(reservation.comment || '');
    const [totalPrice, setTotalPrice] = useState(reservation.totalPrice);
    const [autoPrice, setAutoPrice] = useState(true);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    // ── Booked dates (excluding self) ────────────────────────────────
    const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Build from allConfirmed prop + also fetch fresh data
        const fromProp = expandBookedDays(allConfirmed, reservation._id);
        setBookedDates(fromProp);

        // Also fetch latest to ensure freshness
        fetchConfirmedReservations()
            .then((data) => {
                setBookedDates(expandBookedDays(
                    data.map(d => ({ ...d, _id: d._id })),
                    reservation._id,
                ));
            })
            .catch(() => { /* keep prop-based data */ });
    }, [allConfirmed, reservation._id]);

    // ── Derived values ───────────────────────────────────────────────
    const nights = useMemo(() => daysBetween(checkIn, checkOut), [checkIn, checkOut]);

    const conflicts = useMemo(
        () => rangeOverlapsBooked(checkIn, checkOut, bookedDates),
        [checkIn, checkOut, bookedDates],
    );

    const estimatedPrice = useMemo(
        () => estimatePrice(checkIn, checkOut),
        [checkIn, checkOut],
    );

    // Auto-update price when dates change
    useEffect(() => {
        if (autoPrice && nights > 0) {
            setTotalPrice(estimatedPrice);
        }
    }, [autoPrice, nights, estimatedPrice]);

    // ── Validation ───────────────────────────────────────────────────
    const validationErrors = useMemo(() => {
        const errs: string[] = [];
        if (!guestName.trim()) errs.push('Guest name is required.');
        if (!guestEmail.trim()) errs.push('Guest email is required.');
        if (guestEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
            errs.push('Invalid email format.');
        }
        if (!checkIn || !checkOut) errs.push('Both check-in and check-out dates are required.');
        if (nights < MIN_NIGHTS) errs.push(`Minimum stay is ${MIN_NIGHTS} nights (currently ${nights}).`);
        if (conflicts.length > 0) {
            errs.push(`Date conflict: ${conflicts.length} day(s) overlap with another booking.`);
        }
        if (totalPrice <= 0) errs.push('Total price must be positive.');
        return errs;
    }, [guestName, guestEmail, checkIn, checkOut, nights, conflicts, totalPrice]);

    const isValid = validationErrors.length === 0;

    // ── Changes summary ──────────────────────────────────────────────
    const changes = useMemo(() => {
        const list: { field: string; from: string; to: string }[] = [];
        if (guestName.trim() !== reservation.guestName)
            list.push({ field: 'Guest Name', from: reservation.guestName, to: guestName.trim() });
        if (guestEmail.trim() !== reservation.guestEmail)
            list.push({ field: 'Guest Email', from: reservation.guestEmail, to: guestEmail.trim() });
        if (checkIn !== toDateInputValue(reservation.checkIn))
            list.push({ field: 'Check-in', from: toDateInputValue(reservation.checkIn), to: checkIn });
        if (checkOut !== toDateInputValue(reservation.checkOut))
            list.push({ field: 'Check-out', from: toDateInputValue(reservation.checkOut), to: checkOut });
        if (totalPrice !== reservation.totalPrice)
            list.push({ field: 'Total Price', from: `€${reservation.totalPrice}`, to: `€${totalPrice}` });
        if ((comment.trim() || '') !== (reservation.comment || ''))
            list.push({ field: 'Comment', from: reservation.comment || '(empty)', to: comment.trim() || '(empty)' });
        return list;
    }, [guestName, guestEmail, checkIn, checkOut, totalPrice, comment, reservation]);

    // ── Save ─────────────────────────────────────────────────────────
    function requestSave() {
        if (!isValid) return;
        if (changes.length === 0) {
            onClose(); // nothing changed
            return;
        }
        setShowConfirm(true);
    }

    async function handleSave() {
        if (!isValid) return;
        setSaving(true);
        setError('');
        try {
            await onSave(reservation._id, {
                guestName: guestName.trim(),
                guestEmail: guestEmail.trim(),
                checkIn: new Date(checkIn).toISOString(),
                checkOut: new Date(checkOut).toISOString(),
                nights,
                totalPrice,
                comment: comment.trim() || undefined,
            });
            onClose();
        } catch (err) {
            const apiErr = err as { message?: string };
            setError(apiErr?.message || 'Failed to save changes.');
            setShowConfirm(false);
        } finally {
            setSaving(false);
        }
    }

    // ── Close on Escape ──────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div
                className="admin-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Edit Reservation"
            >
                {/* Header */}
                <div className="admin-modal__header">
                    <h2 className="admin-modal__title">
                        Edit {type === 'request' ? 'Request' : 'Reservation'}
                    </h2>
                    <button onClick={onClose} className="admin-modal__close" aria-label="Close">✕</button>
                </div>

                {/* Body */}
                <div className="admin-modal__body">
                    {showConfirm ? (
                        /* ── Confirmation view ─────────────────────── */
                        <>
                            <div className="admin-modal__confirm-header">
                                Are you sure you want to save these changes?
                            </div>
                            <div className="admin-modal__changes">
                                {changes.map((c, i) => (
                                    <div key={i} className="admin-modal__change-row">
                                        <span className="admin-modal__change-field">{c.field}</span>
                                        <span className="admin-modal__change-from">{c.from}</span>
                                        <span className="admin-modal__change-arrow">→</span>
                                        <span className="admin-modal__change-to">{c.to}</span>
                                    </div>
                                ))}
                            </div>
                            {error && (
                                <div className="admin-modal__api-error">{error}</div>
                            )}
                        </>
                    ) : (
                        /* ── Edit form ─────────────────────────────── */
                        <>
                    {/* Guest Name */}
                    <div className="admin-modal__field">
                        <label className="admin-modal__label">Guest Name *</label>
                        <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="admin-modal__input"
                        />
                    </div>

                    {/* Guest Email */}
                    <div className="admin-modal__field">
                        <label className="admin-modal__label">Guest Email *</label>
                        <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="admin-modal__input"
                        />
                    </div>

                    {/* Dates row */}
                    <div className="admin-modal__row">
                        <div className="admin-modal__field">
                            <label className="admin-modal__label">Check-in *</label>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                min={new Date().toISOString().slice(0, 10)}
                                className="admin-modal__input"
                            />
                        </div>
                        <div className="admin-modal__field">
                            <label className="admin-modal__label">Check-out *</label>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                min={checkIn}
                                className="admin-modal__input"
                            />
                        </div>
                    </div>

                    {/* Nights display */}
                    {nights > 0 && (
                        <div className={`admin-modal__info ${nights < MIN_NIGHTS ? 'admin-modal__info--error' : ''}`}>
                            {nights} night{nights !== 1 ? 's' : ''}
                            {nights < MIN_NIGHTS && ` — minimum ${MIN_NIGHTS} nights required`}
                        </div>
                    )}

                    {/* Conflict warning */}
                    {conflicts.length > 0 && (
                        <div className="admin-modal__warning">
                            ⚠ {conflicts.length} day{conflicts.length !== 1 ? 's' : ''} conflict with existing bookings:
                            <span className="admin-modal__conflicts">
                                {conflicts.slice(0, 5).join(', ')}
                                {conflicts.length > 5 && ` +${conflicts.length - 5} more`}
                            </span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="admin-modal__field">
                        <label className="admin-modal__label">
                            Total Price (€) *
                            <label className="admin-modal__checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={autoPrice}
                                    onChange={(e) => setAutoPrice(e.target.checked)}
                                />
                                Auto-calculate
                            </label>
                        </label>
                        <input
                            type="number"
                            value={totalPrice}
                            onChange={(e) => {
                                setAutoPrice(false);
                                setTotalPrice(Number(e.target.value));
                            }}
                            min={1}
                            className="admin-modal__input"
                            disabled={autoPrice}
                        />
                        {autoPrice && nights > 0 && (
                            <p className="admin-modal__hint">
                                Estimated: €{estimatedPrice} ({nights} nights × avg €{Math.round(estimatedPrice / nights)}/night)
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="admin-modal__field">
                        <label className="admin-modal__label">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            className="admin-modal__input admin-modal__textarea"
                        />
                    </div>

                    {/* Validation errors */}
                    {validationErrors.length > 0 && (
                        <div className="admin-modal__errors">
                            {validationErrors.map((err, i) => (
                                <p key={i}>• {err}</p>
                            ))}
                        </div>
                    )}

                    {/* API error */}
                    {error && (
                        <div className="admin-modal__api-error">{error}</div>
                    )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="admin-modal__footer">
                    {showConfirm ? (
                        <>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="admin-btn admin-btn--outline"
                                disabled={saving}
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="admin-btn admin-btn--confirm"
                            >
                                {saving ? 'Saving…' : '✓ Confirm Update'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="admin-btn admin-btn--outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={requestSave}
                                disabled={!isValid || changes.length === 0}
                                className="admin-btn admin-btn--confirm"
                            >
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
