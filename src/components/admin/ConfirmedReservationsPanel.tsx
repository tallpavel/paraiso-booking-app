import { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import AdminCard, { AdminCardDetail } from './AdminCard';
import EditReservationModal from './EditReservationModal';
import ConfirmDialog from './ConfirmDialog';
import ConfirmPopover from './ConfirmPopover';
import { formatDateShort, paymentLabel, parseBookingDate } from './adminUtils';
import type { ConfirmedReservationFull } from '../../api';

export default function ConfirmedReservationsPanel() {
    const { confirmed, isLoading, error, refresh, handleCancelConfirmed, handleUpdateConfirmed, handleSendDepositPayment, handleSendRemainingPayment, handleSendFullPayment } = useAdminData();
    const { execute, isLoading: isActionLoading, getError: getActionError, getStatus } = useAsyncAction();
    
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
    const [editing, setEditing] = useState<ConfirmedReservationFull | null>(null);
    const [cancelling, setCancelling] = useState<ConfirmedReservationFull | null>(null);

    // Exclude fully paid (they appear in the Fully Paid section)
    const notFullyPaid = confirmed.filter(
        c => !(c.paymentStatus === 'paid' && c.remainingPaymentStatus === 'paid')
    );

    const filtered = filterStatus === 'all'
        ? notFullyPaid
        : filterStatus === 'pending'
            ? notFullyPaid.filter(c => c.paymentStatus === 'pending')
            : notFullyPaid.filter(c => c.paymentStatus === 'paid');

    async function onCancel(id: string, reason?: string) {
        await execute(id, () => handleCancelConfirmed(id, reason));
        setCancelling(null);
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Confirmed</h1>
                    <p className="admin-page__subtitle">
                        Confirmed reservations awaiting full payment
                    </p>
                </div>
                <button onClick={refresh} className="admin-btn admin-btn--outline" disabled={isLoading}>
                    {isLoading ? 'Refreshing…' : '↻ Refresh'}
                </button>
            </header>

            {/* Filter bar */}
            <div className="admin-filters">
                {(['all', 'pending', 'paid'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`admin-filter-btn ${filterStatus === status ? 'admin-filter-btn--active' : ''}`}
                    >
                        {status === 'all' ? 'All' : status === 'pending' ? 'Deposit Pending' : 'Deposit Paid'}
                        {status !== 'all' && (
                            <span className="admin-filter-btn__count">
                                {status === 'pending'
                                    ? notFullyPaid.filter(c => c.paymentStatus === 'pending').length
                                    : notFullyPaid.filter(c => c.paymentStatus === 'paid').length
                                }
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
                        const status = getStatus(c._id);
                        const isFaded = status === 'success';
                        
                        return (
                            <AdminCard
                                key={c._id}
                                id={c._id}
                                faded={isFaded}
                                loading={isActionLoading(c._id)}
                                error={getActionError(c._id)}
                                header={
                                    <>
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
                                                {paymentLabel(c.paymentStatus)}
                                            </span>
                                            {c.paymentStatus === 'paid' && (
                                                c.remainingPaymentStatus === 'pending'
                                                    ? <span className="admin-badge admin-badge--checkin-sent">⏳ Remaining €{c.totalPrice - c.depositAmount}</span>
                                                    : <span className="admin-badge admin-badge--remaining">Remaining €{c.totalPrice - c.depositAmount}</span>
                                            )}
                                            {c.preferredPaymentMethod && (
                                                <span className={`admin-badge ${c.preferredPaymentMethod === 'paypal' ? 'admin-badge--paypal' : 'admin-badge--stripe'}`}>
                                                    Pref: {c.preferredPaymentMethod === 'paypal' ? 'PayPal' : 'Stripe'}
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
                                        <AdminCardDetail label="Total Price" value={`€${c.totalPrice}`} className="admin-card__value--price" />
                                        <AdminCardDetail label="Deposit (30%)" value={`€${c.depositAmount}`} className="admin-card__value--deposit" />
                                        <AdminCardDetail label="Remaining" value={`€${c.totalPrice - c.depositAmount}`} />
                                    </>
                                }
                                timeline={(() => {
                                    const checkInDate = parseBookingDate(c.checkIn);
                                    const now = new Date();
                                    const dueDate = new Date(checkInDate.getTime() - (14 * 24 * 60 * 60 * 1000));
                                    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                    const isOverdue = daysUntilDue <= 0;
                                    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                                    return (
                                        <div className={`admin-card__timeline ${isOverdue ? 'admin-card__timeline--overdue' : ''}`}>
                                            <span className="admin-card__timeline-icon">{isOverdue ? '⚠️' : '🕒'}</span>
                                            <div className="admin-card__timeline-content">
                                                <span className="admin-card__timeline-label">
                                                    {isOverdue ? 'Action Required' : 'Send payment email'}
                                                </span>
                                                <span className="admin-card__timeline-value">
                                                    {isOverdue 
                                                        ? `⚠️ SEND IMMEDIATELY (Check-in in ${daysUntilCheckIn} days)` 
                                                        : `Send by ${dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} (in ${daysUntilDue} days)`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                                comment={c.comment && (
                                    <p className="admin-card__comment">
                                        <span className="admin-card__label">Comment</span>
                                        {c.comment}
                                    </p>
                                )}
                                meta={
                                    <>
                                        Confirmed {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {c.stripePaymentUrl && c.paymentStatus !== 'paid' && (
                                            <>
                                                {' · '}
                                                <a href={c.stripePaymentUrl} target="_blank" rel="noopener noreferrer" className="admin-card__payment-link inline">
                                                    Stripe Link →
                                                </a>
                                            </>
                                        )}
                                    </>
                                }
                                actions={
                                    <>
                                        <div className="admin-card__action-row">
                                            {(() => {
                                                const checkInDate = parseBookingDate(c.checkIn);
                                                const now = new Date();
                                                const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                const isShortNotice = daysUntilCheckIn < 14;
                                                const isFullyPaid = c.paymentStatus === 'paid' && c.remainingPaymentStatus === 'paid';
                                                const isPaypalPref = c.preferredPaymentMethod === 'paypal';

                                                if (isShortNotice && !isFullyPaid) {
                                                    return (
                                                        <div className="admin-btn-group">
                                                            <ConfirmPopover
                                                                message={`Send full €${c.totalPrice} payment request via Card?`}
                                                                confirmLabel="Yes, Send"
                                                                confirmVariant="stripe"
                                                                onConfirm={() => execute(c._id, () => handleSendFullPayment(c._id, 'stripe'))}
                                                                disabled={isActionLoading(c._id) || isFaded}
                                                            >
                                                                <button
                                                                    disabled={isActionLoading(c._id) || isFaded}
                                                                    className={`admin-btn ${!isPaypalPref ? 'admin-btn--stripe' : 'admin-btn--outline'}`}
                                                                >
                                                                    {isActionLoading(c._id) ? '⌛ Sending...' : `✉ Send Card (€${c.totalPrice})`}
                                                                </button>
                                                            </ConfirmPopover>
                                                            <ConfirmPopover
                                                                message={`Send full €${c.totalPrice} payment request via PayPal?`}
                                                                confirmLabel="Yes, Send"
                                                                confirmVariant="paypal"
                                                                onConfirm={() => execute(c._id, () => handleSendFullPayment(c._id, 'paypal'))}
                                                                disabled={isActionLoading(c._id) || isFaded}
                                                            >
                                                                <button
                                                                    disabled={isActionLoading(c._id) || isFaded}
                                                                    className={`admin-btn ${isPaypalPref ? 'admin-btn--paypal' : 'admin-btn--outline'}`}
                                                                >
                                                                    {isActionLoading(c._id) ? '⌛ Sending...' : `✉ Send PayPal (€${c.totalPrice})`}
                                                                </button>
                                                            </ConfirmPopover>
                                                        </div>
                                                    );
                                                }

                                                if (c.paymentStatus === 'pending') {
                                                    return (
                                                        <div className="admin-btn-group">
                                                            <ConfirmPopover
                                                                message={`Resend €${c.depositAmount} deposit request via Card?`}
                                                                confirmLabel="Yes, Send"
                                                                confirmVariant="stripe"
                                                                onConfirm={() => execute(c._id, () => handleSendDepositPayment(c._id, 'stripe'))}
                                                                disabled={isActionLoading(c._id) || isFaded}
                                                            >
                                                                <button
                                                                    disabled={isActionLoading(c._id) || isFaded}
                                                                    className={`admin-btn ${!isPaypalPref ? 'admin-btn--stripe' : 'admin-btn--outline'}`}
                                                                >
                                                                    {isActionLoading(c._id) ? '⌛ Sending...' : `✉ Card (€${c.depositAmount})`}
                                                                </button>
                                                            </ConfirmPopover>
                                                            <ConfirmPopover
                                                                message={`Resend €${c.depositAmount} deposit request via PayPal?`}
                                                                confirmLabel="Yes, Send"
                                                                confirmVariant="paypal"
                                                                onConfirm={() => execute(c._id, () => handleSendDepositPayment(c._id, 'paypal'))}
                                                                disabled={isActionLoading(c._id) || isFaded}
                                                            >
                                                                <button
                                                                    disabled={isActionLoading(c._id) || isFaded}
                                                                    className={`admin-btn ${isPaypalPref ? 'admin-btn--paypal' : 'admin-btn--outline'}`}
                                                                >
                                                                    {isActionLoading(c._id) ? '⌛ Sending...' : `✉ PayPal (€${c.depositAmount})`}
                                                                </button>
                                                            </ConfirmPopover>
                                                        </div>
                                                    );
                                                }

                                                if (c.paymentStatus === 'paid' && c.remainingPaymentStatus !== 'paid') {
                                                    const remaining = c.totalPrice - c.depositAmount;
                                                    return (
                                                        <div className="admin-btn-group">
                                                            <ConfirmPopover
                                                                message={`Send €${remaining} remaining payment request via Card?`}
                                                                confirmLabel="Yes, Send"
                                                                confirmVariant="stripe"
                                                                onConfirm={() => execute(c._id, () => handleSendRemainingPayment(c._id, 'stripe'))}
                                                                disabled={isActionLoading(c._id) || isFaded}
                                                            >
                                                                <button
                                                                    disabled={isActionLoading(c._id) || isFaded}
                                                                    className={`admin-btn ${!isPaypalPref ? 'admin-btn--stripe' : 'admin-btn--outline'}`}
                                                                >
                                                                    {isActionLoading(c._id) ? '⌛ Sending...' : `✉ Card (€${remaining})`}
                                                                </button>
                                                            </ConfirmPopover>
                                                            <ConfirmPopover
                                                                message={`Send €${remaining} remaining payment request via PayPal?`}
                                                                confirmLabel="Yes, Send"
                                                                confirmVariant="paypal"
                                                                onConfirm={() => execute(c._id, () => handleSendRemainingPayment(c._id, 'paypal'))}
                                                                disabled={isActionLoading(c._id) || isFaded}
                                                            >
                                                                <button
                                                                    disabled={isActionLoading(c._id) || isFaded}
                                                                    className={`admin-btn ${isPaypalPref ? 'admin-btn--paypal' : 'admin-btn--outline'}`}
                                                                >
                                                                    {isActionLoading(c._id) ? '⌛ Sending...' : `✉ PayPal (€${remaining})`}
                                                                </button>
                                                            </ConfirmPopover>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })()}
                                        </div>

                                        <div className="admin-card__action-row admin-card__action-row--secondary">
                                            <button
                                                onClick={() => setEditing(c)}
                                                disabled={isActionLoading(c._id) || isFaded}
                                                className="admin-btn admin-btn--outline admin-btn--sm"
                                            >
                                                ✎ Edit
                                            </button>
                                            <button
                                                onClick={() => setCancelling(c)}
                                                disabled={isActionLoading(c._id) || isFaded}
                                                className="admin-btn admin-btn--reject admin-btn--sm"
                                            >
                                                ✕ Cancel
                                            </button>
                                        </div>
                                    </>
                                }
                            />
                        );
                    })}
                </div>
            )}

            {cancelling && (
                <ConfirmDialog
                    title="Cancel Reservation"
                    message="Are you sure you want to cancel this confirmed reservation? The guest will be notified by email."
                    details={[
                        { label: 'Guest', value: cancelling.guestName },
                        { label: 'Email', value: cancelling.guestEmail },
                        { label: 'Dates', value: `${formatDateShort(cancelling.checkIn)} → ${formatDateShort(cancelling.checkOut)}` },
                        { label: 'Nights', value: String(cancelling.nights) },
                        { label: 'Total', value: `€${cancelling.totalPrice}` },
                        { label: 'Payment', value: cancelling.paymentStatus },
                    ]}
                    confirmLabel="✕ Cancel Reservation"
                    confirmVariant="danger"
                    isLoading={isActionLoading(cancelling._id)}
                    showReasonInput
                    reasonLabel="Why is this being cancelled?"
                    reasonPlaceholder="Enter a reason (optional, will be shown to the guest)…"
                    reasonPresets={[
                        'Dates no longer available',
                        'Guest requested cancellation',
                        'Payment not received',
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
        </div>
    );
}

