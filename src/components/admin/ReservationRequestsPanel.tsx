import { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import EditReservationModal from './EditReservationModal';
import ConfirmDialog from './ConfirmDialog';
import type { Reservation } from '../../api';

export default function ReservationRequestsPanel() {
    const { requests, confirmed, isLoading, error, refresh, handleConfirm, handleRejectRequest, handleUpdateRequest } = useAdminData();
    const [actionState, setActionState] = useState<Record<string, 'confirming' | 'rejecting' | 'done' | 'error'>>({});
    const [confirmResult, setConfirmResult] = useState<{ id: string; paymentUrl: string; emailSent: boolean } | null>(null);
    const [editing, setEditing] = useState<Reservation | null>(null);
    const [rejecting, setRejecting] = useState<Reservation | null>(null);

    async function onConfirm(id: string) {
        setActionState(s => ({ ...s, [id]: 'confirming' }));
        try {
            const result = await handleConfirm(id);
            setActionState(s => ({ ...s, [id]: 'done' }));
            setConfirmResult({ id, ...result });
        } catch {
            setActionState(s => ({ ...s, [id]: 'error' }));
        }
    }

    async function onReject(id: string) {
        setActionState(s => ({ ...s, [id]: 'rejecting' }));
        try {
            await handleRejectRequest(id);
            setActionState(s => ({ ...s, [id]: 'done' }));
            setRejecting(null);
        } catch {
            setActionState(s => ({ ...s, [id]: 'error' }));
            setRejecting(null);
        }
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Reservation Requests</h1>
                    <p className="admin-page__subtitle">Pending booking requests from guests</p>
                </div>
                <button onClick={refresh} className="admin-btn admin-btn--outline" disabled={isLoading}>
                    {isLoading ? 'Refreshing…' : '↻ Refresh'}
                </button>
            </header>

            {confirmResult && (
                <div className="admin-toast admin-toast--success">
                    <p>✓ Reservation confirmed! {confirmResult.emailSent ? 'Email sent to guest.' : 'Email failed — share link manually.'}</p>
                    <a href={confirmResult.paymentUrl} target="_blank" rel="noopener noreferrer" className="admin-toast__link">
                        Open payment link →
                    </a>
                    <button onClick={() => setConfirmResult(null)} className="admin-toast__close">✕</button>
                </div>
            )}

            {error && (
                <div className="admin-error">
                    <p>{error}</p>
                    <button onClick={refresh} className="admin-btn admin-btn--outline">Retry</button>
                </div>
            )}

            {isLoading && requests.length === 0 ? (
                <div className="admin-loading">
                    <div className="admin-loading__spinner" />
                    <p>Loading requests…</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="admin-empty-state">
                    <p className="admin-empty-state__icon">◇</p>
                    <p className="admin-empty-state__text">No pending requests</p>
                    <p className="admin-empty-state__hint">New booking requests will appear here</p>
                </div>
            ) : (
                <div className="admin-cards">
                    {requests.map(req => {
                        const state = actionState[req._id];
                        return (
                            <div
                                key={req._id}
                                className={`admin-card ${state === 'done' ? 'admin-card--faded' : ''}`}
                            >
                                <div className="admin-card__header">
                                    <div>
                                        <h3 className="admin-card__name">{req.guestName}</h3>
                                        <p className="admin-card__email">{req.guestEmail}</p>
                                    </div>
                                    <span className="admin-badge admin-badge--pending">Pending</span>
                                </div>

                                <div className="admin-card__details">
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Check-in</span>
                                        <span className="admin-card__value">{req.checkIn}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Check-out</span>
                                        <span className="admin-card__value">{req.checkOut}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Nights</span>
                                        <span className="admin-card__value">{req.nights}</span>
                                    </div>
                                    <div className="admin-card__detail">
                                        <span className="admin-card__label">Total Price</span>
                                        <span className="admin-card__value admin-card__value--price">€{req.totalPrice}</span>
                                    </div>
                                </div>

                                {req.comment && (
                                    <p className="admin-card__comment">
                                        <span className="admin-card__label">Comment</span>
                                        {req.comment}
                                    </p>
                                )}

                                <p className="admin-card__meta">
                                    Submitted {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>

                                <div className="admin-card__actions">
                                    <button
                                        onClick={() => setEditing(req)}
                                        disabled={state === 'confirming' || state === 'rejecting' || state === 'done'}
                                        className="admin-btn admin-btn--outline"
                                    >
                                        ✎ Edit
                                    </button>
                                    <button
                                        onClick={() => onConfirm(req._id)}
                                        disabled={state === 'confirming' || state === 'rejecting' || state === 'done'}
                                        className="admin-btn admin-btn--confirm"
                                    >
                                        {state === 'confirming' ? 'Confirming…' : '✓ Confirm & Send Payment'}
                                    </button>
                                    <button
                                        onClick={() => setRejecting(req)}
                                        disabled={state === 'confirming' || state === 'rejecting' || state === 'done'}
                                        className="admin-btn admin-btn--reject"
                                    >
                                        {state === 'rejecting' ? 'Rejecting…' : '✕ Reject'}
                                    </button>
                                </div>

                                {state === 'error' && (
                                    <p className="admin-card__error">Action failed. Please try again.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {rejecting && (
                <ConfirmDialog
                    title="Reject Request"
                    message="Are you sure you want to reject this reservation request? This action cannot be undone."
                    details={[
                        { label: 'Guest', value: rejecting.guestName },
                        { label: 'Email', value: rejecting.guestEmail },
                        { label: 'Dates', value: `${rejecting.checkIn} → ${rejecting.checkOut}` },
                        { label: 'Nights', value: String(rejecting.nights) },
                        { label: 'Total', value: `€${rejecting.totalPrice}` },
                    ]}
                    confirmLabel="✕ Reject Request"
                    confirmVariant="danger"
                    isLoading={actionState[rejecting._id] === 'rejecting'}
                    onConfirm={() => onReject(rejecting._id)}
                    onCancel={() => setRejecting(null)}
                />
            )}

            {editing && (
                <EditReservationModal
                    reservation={editing}
                    type="request"
                    allConfirmed={confirmed}
                    onSave={handleUpdateRequest}
                    onClose={() => setEditing(null)}
                />
            )}
        </div>
    );
}
