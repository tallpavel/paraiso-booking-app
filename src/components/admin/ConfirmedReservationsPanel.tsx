import { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import EditReservationModal from './EditReservationModal';
import ConfirmDialog from './ConfirmDialog';
import CheckInDetailsModal from './CheckInDetailsModal';
import type { ConfirmedReservationFull } from '../../api';

export default function ConfirmedReservationsPanel() {
    const { confirmed, isLoading, error, refresh, handleCancelConfirmed, handleUpdateConfirmed, handleSendCheckIn } = useAdminData();
    const [cancelState, setCancelState] = useState<Record<string, 'cancelling' | 'done' | 'error'>>({});
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'failed'>('all');
    const [editing, setEditing] = useState<ConfirmedReservationFull | null>(null);
    const [cancelling, setCancelling] = useState<ConfirmedReservationFull | null>(null);
    const [sendingCheckIn, setSendingCheckIn] = useState<Record<string, boolean>>({});
    const [viewingCheckIn, setViewingCheckIn] = useState<ConfirmedReservationFull | null>(null);

    const filtered = filterStatus === 'all'
        ? confirmed
        : confirmed.filter(c => c.paymentStatus === filterStatus);

    async function onCancel(id: string) {
        setCancelState(s => ({ ...s, [id]: 'cancelling' }));
        try {
            await handleCancelConfirmed(id);
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
                    <h1 className="admin-page__title">Confirmed Reservations</h1>
                    <p className="admin-page__subtitle">
                        All confirmed bookings with payment tracking
                    </p>
                </div>
                <button onClick={refresh} className="admin-btn admin-btn--outline" disabled={isLoading}>
                    {isLoading ? 'Refreshing…' : '↻ Refresh'}
                </button>
            </header>

            {/* Filter bar */}
            <div className="admin-filters">
                {(['all', 'pending', 'paid', 'failed'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`admin-filter-btn ${filterStatus === status ? 'admin-filter-btn--active' : ''}`}
                    >
                        {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        {status !== 'all' && (
                            <span className="admin-filter-btn__count">
                                {confirmed.filter(c => c.paymentStatus === status).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {error && (
                <div className="admin-error">
                    <p>{error}</p>
                    <button onClick={refresh} className="admin-btn admin-btn--outline">Retry</button>
                </div>
            )}

            {isLoading && confirmed.length === 0 ? (
                <div className="admin-loading">
                    <div className="admin-loading__spinner" />
                    <p>Loading confirmed reservations…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="admin-empty-state">
                    <p className="admin-empty-state__icon">◆</p>
                    <p className="admin-empty-state__text">
                        {filterStatus === 'all' ? 'No confirmed reservations' : `No ${filterStatus} reservations`}
                    </p>
                </div>
            ) : (
                <div className="admin-cards">
                    {filtered.map(c => {
                        const state = cancelState[c._id];
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
                                        {(c.checkInStatus === 'sent') && (
                                            <span className="admin-badge admin-badge--checkin-sent">
                                                ✉ Check-in Sent
                                            </span>
                                        )}
                                        {(c.checkInStatus === 'completed') && (
                                            <span className="admin-badge admin-badge--checkedin">
                                                ✓ Checked In
                                            </span>
                                        )}
                                        <span className={`admin-badge admin-badge--${c.paymentStatus}`}>
                                            {c.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="admin-card__details">
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Check-in</span>
                                        <span className="admin-card__value">{c.checkIn}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Check-out</span>
                                        <span className="admin-card__value">{c.checkOut}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Nights</span>
                                        <span className="admin-card__value">{c.nights}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Total Price</span>
                                        <span className="admin-card__value admin-card__value--price">€{c.totalPrice}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Deposit (30%)</span>
                                        <span className="admin-card__value admin-card__value--deposit">€{c.depositAmount}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Remaining</span>
                                        <span className="admin-card__value">€{c.totalPrice - c.depositAmount}</span>
                                    </div>
                                </div>

                                {c.comment && (
                                    <p className="admin-card__comment">
                                        <span className="admin-card__label">Comment</span>
                                        {c.comment}
                                    </p>
                                )}

                                {c.stripePaymentUrl && c.paymentStatus !== 'paid' && (
                                    <a
                                        href={c.stripePaymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="admin-card__payment-link"
                                    >
                                        Open Stripe Payment Link →
                                    </a>
                                )}

                                <p className="admin-card__meta">
                                    Confirmed {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>

                                <div className="admin-card__actions">
                                    {(() => {
                                        const ciStatus = c.checkInStatus || 'pending';
                                        const isSending = sendingCheckIn[c._id];
                                        if (ciStatus === 'completed') {
                                            return (
                                                <button
                                                    onClick={() => setViewingCheckIn(c)}
                                                    className="admin-btn admin-btn--checkedin"
                                                >
                                                    ☑ Checked In
                                                </button>
                                            );
                                        }
                                        return (
                                            <>
                                                <button
                                                    onClick={async () => {
                                                        setSendingCheckIn(prev => ({ ...prev, [c._id]: true }));
                                                        try { await handleSendCheckIn(c._id); } catch {}
                                                        setSendingCheckIn(prev => ({ ...prev, [c._id]: false }));
                                                    }}
                                                    disabled={isSending || state === 'cancelling' || state === 'done'}
                                                    className={`admin-btn ${ciStatus === 'sent' ? 'admin-btn--checkin-sent' : 'admin-btn--checkin'}`}
                                                >
                                                    {isSending
                                                        ? 'Sending…'
                                                        : ciStatus === 'sent'
                                                            ? '↻ Resend Check-in'
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
                                            </>
                                        );
                                    })()}
                                    <button
                                        onClick={() => setEditing(c)}
                                        disabled={state === 'cancelling' || state === 'done'}
                                        className="admin-btn admin-btn--outline"
                                    >
                                        ✎ Edit
                                    </button>
                                    <button
                                        onClick={() => setCancelling(c)}
                                        disabled={state === 'cancelling' || state === 'done'}
                                        className="admin-btn admin-btn--reject"
                                    >
                                        {state === 'cancelling' ? 'Cancelling…' : '✕ Cancel'}
                                    </button>
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
                    message="Are you sure you want to cancel this confirmed reservation? This action cannot be undone."
                    details={[
                        { label: 'Guest', value: cancelling.guestName },
                        { label: 'Email', value: cancelling.guestEmail },
                        { label: 'Dates', value: `${cancelling.checkIn} → ${cancelling.checkOut}` },
                        { label: 'Nights', value: String(cancelling.nights) },
                        { label: 'Total', value: `€${cancelling.totalPrice}` },
                        { label: 'Payment', value: cancelling.paymentStatus },
                    ]}
                    confirmLabel="✕ Cancel Reservation"
                    confirmVariant="danger"
                    isLoading={cancelState[cancelling._id] === 'cancelling'}
                    onConfirm={() => onCancel(cancelling._id)}
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
