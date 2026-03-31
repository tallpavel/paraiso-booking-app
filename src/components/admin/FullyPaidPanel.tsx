import { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import AdminCard, { AdminCardDetail } from './AdminCard';
import EditReservationModal from './EditReservationModal';
import ConfirmDialog from './ConfirmDialog';
import CheckInDetailsModal from './CheckInDetailsModal';
import { formatDateShort } from './adminUtils';
import type { ConfirmedReservationFull } from '../../api';

export default function FullyPaidPanel() {
    const { 
        confirmed, 
        isLoading: isDataLoading, 
        error: dataError, 
        refresh, 
        handleCancelConfirmed, 
        handleUpdateConfirmed, 
        handleSendCheckIn, 
        handleSendAccessInfo 
    } = useAdminData();

    const { execute, isLoading, getError, getStatus } = useAsyncAction();
    const [editing, setEditing] = useState<ConfirmedReservationFull | null>(null);
    const [cancelling, setCancelling] = useState<ConfirmedReservationFull | null>(null);
    const [viewingCheckIn, setViewingCheckIn] = useState<ConfirmedReservationFull | null>(null);

    // Only fully paid: deposit paid AND remaining paid
    const fullyPaid = confirmed.filter(
        c => c.paymentStatus === 'paid' && c.remainingPaymentStatus === 'paid'
    );

    const onCancel = async (id: string, reason?: string) => {
        await execute(id, () => handleCancelConfirmed(id, reason));
        setCancelling(null);
    };

    const onSendCheckIn = (id: string) => execute(id, () => handleSendCheckIn(id));
    const onSendAccessInfo = (id: string) => execute(id, () => handleSendAccessInfo(id));

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Fully Paid</h1>
                    <p className="admin-page__subtitle">
                        Reservations with all payments completed — manage check-in
                    </p>
                </div>
                <button onClick={refresh} className="admin-btn admin-btn--outline" disabled={isDataLoading}>
                    {isDataLoading ? 'Refreshing…' : '↻ Refresh'}
                </button>
            </header>

            {dataError && (
                <div className="admin-error">
                    <p>{dataError}</p>
                    <button onClick={refresh} className="admin-btn admin-btn--outline">Retry</button>
                </div>
            )}

            {isDataLoading && confirmed.length === 0 ? (
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
                        const ciStatus = c.checkInStatus || 'pending';
                        const isFaded = getStatus(c._id) === 'success';

                        return (
                            <AdminCard
                                key={c._id}
                                id={c._id}
                                faded={isFaded}
                                loading={isLoading(c._id)}
                                error={getError(c._id)}
                                header={
                                    <>
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
                                    </>
                                }
                                details={
                                    <>
                                        <AdminCardDetail label="Check-in" value={formatDateShort(c.checkIn)} />
                                        <AdminCardDetail label="Check-out" value={formatDateShort(c.checkOut)} />
                                        <AdminCardDetail label="Nights" value={c.nights} />
                                        <AdminCardDetail label="Total Paid" value={`€${c.totalPrice}`} className="admin-card__value--price" />
                                    </>
                                }
                                comment={c.comment && (
                                    <p className="admin-card__comment">
                                        <span className="admin-card__label">Comment</span>
                                        {c.comment}
                                    </p>
                                )}
                                meta={
                                    <>Confirmed {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                }
                                actions={
                                    <div className="admin-card__actions-standard">
                                        <div className="admin-card__action-row">
                                            {ciStatus === 'completed' ? (
                                                <div className="admin-btn-group">
                                                    <button
                                                        onClick={() => setViewingCheckIn(c)}
                                                        className="admin-btn admin-btn--checkedin"
                                                        disabled={isFaded}
                                                    >
                                                        ☑ Checked In
                                                    </button>
                                                    <button
                                                        onClick={() => onSendAccessInfo(c._id)}
                                                        disabled={isLoading(c._id) || isFaded}
                                                        className={`admin-btn ${c.accessInfoSent ? 'admin-btn--checkin-sent' : 'admin-btn--checkin'}`}
                                                    >
                                                        {isLoading(c._id)
                                                            ? '⌛ Sending…'
                                                            : c.accessInfoSent
                                                                ? '🔑 Resend Access'
                                                                : '🔑 Send Access'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="admin-btn-group">
                                                    <button
                                                        onClick={() => onSendCheckIn(c._id)}
                                                        disabled={isLoading(c._id) || isFaded}
                                                        className={`admin-btn ${ciStatus === 'sent' ? 'admin-btn--checkin-sent' : 'admin-btn--checkin'}`}
                                                    >
                                                        {isLoading(c._id)
                                                            ? '⌛ Sending…'
                                                            : ciStatus === 'sent'
                                                                ? '✉ Resend Check-in'
                                                                : '✉ Send Check-in'}
                                                    </button>
                                                    {ciStatus === 'sent' && (
                                                        <button
                                                            onClick={() => setViewingCheckIn(c)}
                                                            className="admin-btn admin-btn--outline"
                                                            disabled={isFaded}
                                                        >
                                                            📋 View Check-in
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="admin-card__action-row admin-card__action-row--secondary">
                                            <button
                                                onClick={() => setEditing(c)}
                                                disabled={isLoading(c._id) || isFaded}
                                                className="admin-btn admin-btn--outline admin-btn--sm"
                                            >
                                                ✎ Edit
                                            </button>
                                            <button
                                                onClick={() => setCancelling(c)}
                                                disabled={isLoading(c._id) || isFaded}
                                                className="admin-btn admin-btn--reject admin-btn--sm"
                                            >
                                                ✕ Cancel
                                            </button>
                                        </div>
                                    </div>
                                }
                            />
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
                    isLoading={isLoading(cancelling._id)}
                    showReasonInput
                    reasonLabel="Why is this being cancelled?"
                    reasonPlaceholder="Enter a reason (optional, will be shown to the guest)…"
                    reasonPresets={[
                        'Dates no longer available',
                        'Guest requested cancellation',
                        'Property maintenance',
                        'Double booking',
                        'Other...',
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
