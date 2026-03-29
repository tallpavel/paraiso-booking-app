import { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import EditReservationModal from './EditReservationModal';
import ConfirmDialog from './ConfirmDialog';
import { formatDateShort, paymentLabel } from './adminUtils';
import type { ConfirmedReservationFull } from '../../api';

export default function ConfirmedReservationsPanel() {
    const { confirmed, isLoading, error, refresh, handleCancelConfirmed, handleUpdateConfirmed, handleSendDepositPayment, handleSendRemainingPayment, handleSendFullPayment } = useAdminData();
    const [cancelState, setCancelState] = useState<Record<string, 'cancelling' | 'done' | 'error'>>({});
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
    const [editing, setEditing] = useState<ConfirmedReservationFull | null>(null);
    const [cancelling, setCancelling] = useState<ConfirmedReservationFull | null>(null);
    const [sendingDeposit, setSendingDeposit] = useState<Record<string, boolean>>({});
    const [sendingRemaining, setSendingRemaining] = useState<Record<string, boolean>>({});
    const [sendingFullPayment, setSendingFullPayment] = useState<Record<string, boolean>>({});

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
                                        {c.paymentStatus === 'paid' && c.remainingPaymentStatus === 'paid' ? (
                                            <span className="admin-badge admin-badge--paid">✓ Fully Paid</span>
                                        ) : (
                                            <>
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
                                            </>
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
                                {(() => {
                                    if (c.paymentStatus === 'paid' && c.remainingPaymentStatus === 'paid') return null;
                                    
                                    const checkInDate = new Date(c.checkIn + 'T12:00:00');
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
                                    <div className="admin-card__action-row">
                                        {(() => {
                                            const checkInDate = new Date(c.checkIn + 'T00:00:00');
                                            const now = new Date();
                                            const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                            const isShortNotice = daysUntilCheckIn < 14;
                                            const isFullyPaid = c.paymentStatus === 'paid' && c.remainingPaymentStatus === 'paid';
                                            const isPaypalPref = c.preferredPaymentMethod === 'paypal';

                                            if (isShortNotice && !isFullyPaid) {
                                                return (
                                                    <div className="admin-btn-group">
                                                        <button
                                                            onClick={async () => {
                                                                setSendingFullPayment(prev => ({ ...prev, [c._id]: true }));
                                                                try { await handleSendFullPayment(c._id, 'stripe'); } catch { }
                                                                setSendingFullPayment(prev => ({ ...prev, [c._id]: false }));
                                                            }}
                                                            disabled={sendingFullPayment[c._id] || state === 'cancelling' || state === 'done'}
                                                            className={`admin-btn ${!isPaypalPref ? 'admin-btn--stripe' : 'admin-btn--outline'}`}
                                                        >
                                                            {sendingFullPayment[c._id] ? '⌛ Card...' : `✉ Send Card (€${c.totalPrice})`}
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                setSendingFullPayment(prev => ({ ...prev, [c._id]: true }));
                                                                try { await handleSendFullPayment(c._id, 'paypal'); } catch { }
                                                                setSendingFullPayment(prev => ({ ...prev, [c._id]: false }));
                                                            }}
                                                            disabled={sendingFullPayment[c._id] || state === 'cancelling' || state === 'done'}
                                                            className={`admin-btn ${isPaypalPref ? 'admin-btn--paypal' : 'admin-btn--outline'}`}
                                                        >
                                                            {sendingFullPayment[c._id] ? '⌛ PayPal...' : `✉ Send PayPal (€${c.totalPrice})`}
                                                        </button>
                                                    </div>
                                                );
                                            }

                                            if (c.paymentStatus === 'pending') {
                                                return (
                                                    <div className="admin-btn-group">
                                                        <button
                                                            onClick={async () => {
                                                                setSendingDeposit(prev => ({ ...prev, [c._id]: true }));
                                                                try { await handleSendDepositPayment(c._id, 'stripe'); } catch { }
                                                                setSendingDeposit(prev => ({ ...prev, [c._id]: false }));
                                                            }}
                                                            disabled={sendingDeposit[c._id] || state === 'cancelling' || state === 'done'}
                                                            className={`admin-btn ${!isPaypalPref ? 'admin-btn--stripe' : 'admin-btn--outline'}`}
                                                        >
                                                            {sendingDeposit[c._id] ? '⌛ Card...' : `✉ Resend Card (€${c.depositAmount})`}
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                setSendingDeposit(prev => ({ ...prev, [c._id]: true }));
                                                                try { await handleSendDepositPayment(c._id, 'paypal'); } catch { }
                                                                setSendingDeposit(prev => ({ ...prev, [c._id]: false }));
                                                            }}
                                                            disabled={sendingDeposit[c._id] || state === 'cancelling' || state === 'done'}
                                                            className={`admin-btn ${isPaypalPref ? 'admin-btn--paypal' : 'admin-btn--outline'}`}
                                                        >
                                                            {sendingDeposit[c._id] ? '⌛ PayPal...' : `✉ Resend PayPal (€${c.depositAmount})`}
                                                        </button>
                                                    </div>
                                                );
                                            }

                                            if (c.paymentStatus === 'paid' && c.remainingPaymentStatus !== 'paid') {
                                                return (
                                                    <div className="admin-btn-group">
                                                        <button
                                                            onClick={async () => {
                                                                setSendingRemaining(prev => ({ ...prev, [c._id]: true }));
                                                                try { await handleSendRemainingPayment(c._id, 'stripe'); } catch { }
                                                                setSendingRemaining(prev => ({ ...prev, [c._id]: false }));
                                                            }}
                                                            disabled={sendingRemaining[c._id] || state === 'cancelling' || state === 'done'}
                                                            className={`admin-btn ${!isPaypalPref ? 'admin-btn--stripe' : 'admin-btn--outline'}`}
                                                        >
                                                            {sendingRemaining[c._id] ? '⌛ Card...' : `✉ Send Card (€${c.totalPrice - c.depositAmount})`}
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                setSendingRemaining(prev => ({ ...prev, [c._id]: true }));
                                                                try { await handleSendRemainingPayment(c._id, 'paypal'); } catch { }
                                                                setSendingRemaining(prev => ({ ...prev, [c._id]: false }));
                                                            }}
                                                            disabled={sendingRemaining[c._id] || state === 'cancelling' || state === 'done'}
                                                            className={`admin-btn ${isPaypalPref ? 'admin-btn--paypal' : 'admin-btn--outline'}`}
                                                        >
                                                            {sendingRemaining[c._id] ? '⌛ PayPal...' : `✉ Send PayPal (€${c.totalPrice - c.depositAmount})`}
                                                        </button>
                                                    </div>
                                                );
                                            }

                                            return null;
                                        })()}
                                    </div>

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
                    isLoading={cancelState[cancelling._id] === 'cancelling'}
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
