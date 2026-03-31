import { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import AdminCard, { AdminCardDetail } from './AdminCard';
import EditReservationModal from './EditReservationModal';
import ConfirmDialog from './ConfirmDialog';
import ConfirmPopover from './ConfirmPopover';
import { formatDateShort } from './adminUtils';
import type { Reservation } from '../../api';

export default function ReservationRequestsPanel() {
    const { requests, confirmed, isLoading, error, refresh, handleConfirm, handleRejectRequest, handleUpdateRequest } = useAdminData();
    const { execute, isLoading: isActionLoading, getError: getActionError, getStatus } = useAsyncAction();
    
    const [confirmResult, setConfirmResult] = useState<{ id: string; paymentUrl: string; emailSent: boolean } | null>(null);
    const [editing, setEditing] = useState<Reservation | null>(null);
    const [rejecting, setRejecting] = useState<Reservation | null>(null);

    async function onConfirm(id: string, paymentMethod: 'stripe' | 'paypal') {
        const result = await execute(id, () => handleConfirm(id, paymentMethod));
        if (result) {
            setConfirmResult({ id, ...result });
        }
    }

    async function onReject(id: string, reason?: string) {
        await execute(id, () => handleRejectRequest(id, reason));
        setRejecting(null);
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
                        const status = getStatus(req._id);
                        const isFaded = status === 'success';
                        
                        return (
                            <AdminCard
                                key={req._id}
                                id={req._id}
                                faded={isFaded}
                                loading={isActionLoading(req._id)}
                                error={getActionError(req._id)}
                                header={
                                    <>
                                        <div>
                                            <h3 className="admin-card__name">{req.guestName}</h3>
                                            <p className="admin-card__email">{req.guestEmail}</p>
                                            {req.guestPhone && <p className="admin-card__email">📞 {req.guestPhone}</p>}
                                        </div>
                                        <div className="admin-card__badges">
                                            <span className="admin-badge admin-badge--pending">Pending</span>
                                            {req.preferredPaymentMethod && (
                                                <span className={`admin-badge ${req.preferredPaymentMethod === 'paypal' ? 'admin-badge--paypal' : 'admin-badge--stripe'}`}>
                                                    Prefers {req.preferredPaymentMethod === 'paypal' ? 'PayPal' : 'Stripe'}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                }
                                details={
                                    <>
                                        <AdminCardDetail label="Check-in" value={formatDateShort(req.checkIn)} />
                                        <AdminCardDetail label="Check-out" value={formatDateShort(req.checkOut)} />
                                        <AdminCardDetail label="Nights" value={req.nights} />
                                        <AdminCardDetail label="Total Price" value={`€${req.totalPrice}`} className="admin-card__value--price" />
                                    </>
                                }
                                comment={req.comment && (
                                    <p className="admin-card__comment">
                                        <span className="admin-card__label">Comment</span>
                                        {req.comment}
                                    </p>
                                )}
                                meta={
                                    <>Submitted {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                }
                                actions={
                                    <>
                                        <div className="admin-card__action-row">
                                            {(() => {
                                                const checkInDate = new Date(req.checkIn + 'T12:00:00');
                                                const now = new Date();
                                                const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                const isShortNotice = daysUntilCheckIn < 14;
                                                const isPaypalPref = req.preferredPaymentMethod === 'paypal';
                                                const depositAmount = Math.round(req.totalPrice * 0.3);
                                                const amountLabel = isShortNotice ? `full €${req.totalPrice}` : `€${depositAmount} deposit`;

                                                return (
                                                    <div className="admin-btn-group">
                                                        <ConfirmPopover
                                                            message={`Confirm & send ${amountLabel} via Card?`}
                                                            confirmLabel="Yes, Send"
                                                            confirmVariant="stripe"
                                                            onConfirm={() => onConfirm(req._id, 'stripe')}
                                                            disabled={isActionLoading(req._id) || isFaded}
                                                        >
                                                            <button
                                                                disabled={isActionLoading(req._id) || isFaded}
                                                                className={`admin-btn ${!isPaypalPref ? 'admin-btn--stripe' : 'admin-btn--outline'}`}
                                                                title={isShortNotice ? "Confirm & Send FULL card payment request" : "Confirm & Send card deposit request"}
                                                            >
                                                                {isActionLoading(req._id) ? '⌛ Sending...' : `✉ Send Card (${isShortNotice ? 'Full' : 'Dep'})`}
                                                            </button>
                                                        </ConfirmPopover>
                                                        <ConfirmPopover
                                                            message={`Confirm & send ${amountLabel} via PayPal?`}
                                                            confirmLabel="Yes, Send"
                                                            confirmVariant="paypal"
                                                            onConfirm={() => onConfirm(req._id, 'paypal')}
                                                            disabled={isActionLoading(req._id) || isFaded}
                                                        >
                                                            <button
                                                                disabled={isActionLoading(req._id) || isFaded}
                                                                className={`admin-btn ${isPaypalPref ? 'admin-btn--paypal' : 'admin-btn--outline'}`}
                                                                title={isShortNotice ? "Confirm & Send FULL PayPal request" : "Confirm & Send PayPal deposit request"}
                                                            >
                                                                {isActionLoading(req._id) ? '⌛ Sending...' : `✉ Send PayPal (${isShortNotice ? 'Full' : 'Dep'})`}
                                                            </button>
                                                        </ConfirmPopover>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <div className="admin-card__action-row admin-card__action-row--secondary">
                                            <button
                                                onClick={() => setEditing(req)}
                                                disabled={isActionLoading(req._id) || isFaded}
                                                className="admin-btn admin-btn--outline admin-btn--sm"
                                            >
                                                ✎ Edit
                                            </button>
                                            <button
                                                onClick={() => setRejecting(req)}
                                                disabled={isActionLoading(req._id) || isFaded}
                                                className="admin-btn admin-btn--reject admin-btn--sm"
                                            >
                                                ✕ Reject
                                            </button>
                                        </div>
                                    </>
                                }
                            />
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
                        { label: 'Dates', value: `${formatDateShort(rejecting.checkIn)} → ${formatDateShort(rejecting.checkOut)}` },
                        { label: 'Nights', value: String(rejecting.nights) },
                        { label: 'Total', value: `€${rejecting.totalPrice}` },
                    ]}
                    confirmLabel="✕ Reject Request"
                    confirmVariant="danger"
                    isLoading={isActionLoading(rejecting._id)}
                    showReasonInput
                    reasonLabel="Why is this being rejected?"
                    reasonPlaceholder="Enter a reason (optional, will be shown to the guest)…"
                    reasonPresets={[
                        'Dates no longer available',
                        'Minimum stay not met',
                        'Property maintenance',
                        'Double booking',
                        'Unable to accommodate special request',
                    ]}
                    onConfirm={(reason) => onReject(rejecting._id, reason)}
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

