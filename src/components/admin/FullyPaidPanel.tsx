import { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import EditReservationModal from './EditReservationModal';
import ConfirmDialog from './ConfirmDialog';
import CheckInDetailsModal from './CheckInDetailsModal';
import { formatDateShort } from './adminUtils';
import type { ConfirmedReservationFull } from '../../api';

export default function FullyPaidPanel() {
    const { confirmed, isLoading, error, refresh, handleCancelConfirmed, handleUpdateConfirmed, handleSendCheckIn, handleSendAccessInfo } = useAdminData();
    const [cancelState, setCancelState] = useState<Record<string, 'cancelling' | 'done' | 'error'>>({});
    const [editing, setEditing] = useState<ConfirmedReservationFull | null>(null);
    const [cancelling, setCancelling] = useState<ConfirmedReservationFull | null>(null);
    const [sendingCheckIn, setSendingCheckIn] = useState<Record<string, boolean>>({});
    const [sendingAccessInfo, setSendingAccessInfo] = useState<Record<string, boolean>>({});
    const [viewingCheckIn, setViewingCheckIn] = useState<ConfirmedReservationFull | null>(null);

    // Only fully paid: deposit paid AND remaining paid
    const fullyPaid = confirmed.filter(
        c => c.paymentStatus === 'paid' && c.remainingPaymentStatus === 'paid'
    );

    async function onCancel(id: string, reason?: string) {
        setCancelState(s => ({ ...s, [id]: 'cancelling' }));
        try {
            await handleCancelConfirmed(id, reason);
            setCancelState(s => ({ ...s, [id]: 'done' }));
            setCancelling(null);
        } catch {
            setCancelState(s => ({ ...s, [id]: 'error' }));
            setCancelling(null);
        }
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Fully Paid</h1>
                    <p className="admin-page__subtitle">
                        Reservations with all payments completed — manage check-in
                    </p>
                </div>
                <button onClick={refresh} className="admin-btn admin-btn--outline" disabled={isLoading}>
                    {isLoading ? 'Refreshing…' : '↻ Refresh'}
                </button>
            </header>

            {error && (
                <div className="admin-error">
                    <p>{error}</p>
                    <button onClick={refresh} className="admin-btn admin-btn--outline">Retry</button>
                </div>
            )}

            {isLoading && confirmed.length === 0 ? (
                <div className="admin-loading">
                    <div className="admin-loading__spinner" />
                    <p>Loading reservations…</p>
                </div>
            ) : fullyPaid.length === 0 ? (
                <div className="admin-empty-state">
                    <p className="admin-empty-state__icon">✓</p>
                    <p className="admin-empty-state__text">
                        No fully paid reservations yet
                    </p>
                </div>
            ) : (
                <div className="admin-cards">
                    {fullyPaid.map(c => {
                        const state = cancelState[c._id];
                        const ciStatus = c.checkInStatus || 'pending';

                        return (
                            <div
                                key={c._id}
                                className={`admin-card ${state === 'done' ? 'admin-card--faded' : ''}`}
                            >
                                <div className="admin-card__header">
                                    <div>
                                        <h3 className="admin-card__name">{c.guestName}</h3>
                                        <p className="admin-card__email">{c.guestEmail}</p>
                                        {c.guestPhone && <p className="admin-card__email">📞 {c.guestPhone}</p>}
                                    </div>
                                    <div className="admin-card__badges">
                                        <span className="admin-badge admin-badge--paid">✓ Fully Paid</span>
                                        {ciStatus === 'sent' && (
                                            <span className="admin-badge admin-badge--checkin-sent">
                                                ✉ Check-in Sent
                                            </span>
                                        )}
                                        {ciStatus === 'completed' && (
                                            <span className="admin-badge admin-badge--checkedin">
                                                ✓ Checked In
                                            </span>
                                        )}
                                        {ciStatus === 'pending' && (
                                            <span className="admin-badge admin-badge--remaining">
                                                ◇ Check-in Pending
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="admin-card__details">
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Check-in</span>
                                        <span className="admin-card__value">{formatDateShort(c.checkIn)}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Check-out</span>
                                        <span className="admin-card__value">{formatDateShort(c.checkOut)}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Nights</span>
                                        <span className="admin-card__value">{c.nights}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Total Paid</span>
                                        <span className="admin-card__value admin-card__value--price">€{c.totalPrice}</span>
                                    </div>
                                </div>

                                {c.comment && (
                                    <p className="admin-card__comment">
                                        <span className="admin-card__label">Comment</span>
                                        {c.comment}
                                    </p>
                                )}

                                <p className="admin-card__meta">
                                    Confirmed {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>

                                <div className="admin-card__actions">
                                    {ciStatus === 'completed' ? (
                                        <div className="admin-card__action-row admin-card__action-row--inline">
                                            <button
                                                onClick={() => setViewingCheckIn(c)}
                                                className="admin-btn admin-btn--checkedin"
                                            >
                                                ☑ Checked In
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    setSendingAccessInfo(prev => ({ ...prev, [c._id]: true }));
                                                    try { await handleSendAccessInfo(c._id); } catch { }
                                                    setSendingAccessInfo(prev => ({ ...prev, [c._id]: false }));
                                                }}
                                                disabled={sendingAccessInfo[c._id] || state === 'cancelling' || state === 'done'}
                                                className={`admin-btn ${c.accessInfoSent ? 'admin-btn--checkin-sent' : 'admin-btn--checkin'}`}
                                            >
                                                {sendingAccessInfo[c._id]
                                                    ? 'Sending…'
                                                    : c.accessInfoSent
                                                        ? '🔑 Resend Access'
                                                        : '🔑 Send Access'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="admin-card__action-row">
                                            <button
                                                onClick={async () => {
                                                    setSendingCheckIn(prev => ({ ...prev, [c._id]: true }));
                                                    try { await handleSendCheckIn(c._id); } catch { }
                                                    setSendingCheckIn(prev => ({ ...prev, [c._id]: false }));
                                                }}
                                                disabled={sendingCheckIn[c._id] || state === 'cancelling' || state === 'done'}
                                                className={`admin-btn ${ciStatus === 'sent' ? 'admin-btn--checkin-sent' : 'admin-btn--checkin'}`}
                                            >
                                                {sendingCheckIn[c._id]
                                                    ? 'Sending…'
                                                    : ciStatus === 'sent'
                                                        ? '✉ Resend Check-in'
                                                        : '✉ Send Check-in'}
                                            </button>
                                            {ciStatus === 'sent' && (
                                                <button
                                                    onClick={() => setViewingCheckIn(c)}
                                                    className="admin-btn admin-btn--outline"
                                                >
                                                    📋 View Check-in
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="admin-card__action-row admin-card__action-row--secondary">
                                        <button
                                            onClick={() => setEditing(c)}
                                            disabled={state === 'cancelling' || state === 'done'}
                                            className="admin-btn admin-btn--outline admin-btn--sm"
                                        >
                                            ✎ Edit
                                        </button>
                                        <button
                                            onClick={() => setCancelling(c)}
                                            disabled={state === 'cancelling' || state === 'done'}
                                            className="admin-btn admin-btn--reject admin-btn--sm"
                                        >
                                            {state === 'cancelling' ? 'Cancelling…' : '✕ Cancel'}
                                        </button>
                                    </div>
                                </div>

                                {state === 'error' && (
                                    <p className="admin-card__error">Cancellation failed. Please try again.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {cancelling && (
                <ConfirmDialog
                    title="Cancel Reservation"
                    message="Are you sure you want to cancel this fully paid reservation? The guest will be notified by email."
                    details={[
                        { label: 'Guest', value: cancelling.guestName },
                        { label: 'Email', value: cancelling.guestEmail },
                        { label: 'Dates', value: `${formatDateShort(cancelling.checkIn)} → ${formatDateShort(cancelling.checkOut)}` },
                        { label: 'Nights', value: String(cancelling.nights) },
                        { label: 'Total', value: `€${cancelling.totalPrice}` },
                    ]}
                    confirmLabel="✕ Cancel Reservation"
                    confirmVariant="danger"
                    isLoading={cancelState[cancelling._id] === 'cancelling'}
                    showReasonInput
                    reasonLabel="Why is this being cancelled?"
                    reasonPlaceholder="Enter a reason (optional, will be shown to the guest)…"
                    reasonPresets={[
                        'Dates no longer available',
                        'Guest requested cancellation',
                        'Property maintenance',
                        'Double booking',
                    ]}
                    onConfirm={(reason) => onCancel(cancelling._id, reason)}
                    onCancel={() => setCancelling(null)}
                />
            )}

            {editing && (
                <EditReservationModal
                    reservation={editing}
                    type="confirmed"
                    allConfirmed={confirmed}
                    onSave={handleUpdateConfirmed}
                    onClose={() => setEditing(null)}
                />
            )}

            {viewingCheckIn && (
                <CheckInDetailsModal
                    reservationId={viewingCheckIn._id}
                    guestName={viewingCheckIn.guestName}
                    onClose={() => setViewingCheckIn(null)}
                />
            )}
        </div>
    );
}
