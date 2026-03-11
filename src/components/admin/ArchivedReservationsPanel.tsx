import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchArchivedReservations, type ConfirmedReservationFull } from '../../api';

type FilterType = 'all' | 'completed' | 'cancelled';

export default function ArchivedReservationsPanel() {
    const { token } = useAuth();
    const [archived, setArchived] = useState<ConfirmedReservationFull[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');

    const loadArchived = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError('');
        try {
            const data = await fetchArchivedReservations(token);
            setArchived(data);
        } catch (err) {
            setError('Failed to load archived reservations.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadArchived();
    }, [loadArchived]);

    const filtered = filter === 'all'
        ? archived
        : archived.filter(r => r.status === filter);

    const completedCount = archived.filter(r => r.status === 'completed').length;
    const cancelledCount = archived.filter(r => r.status === 'cancelled').length;

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">History</h1>
                    <p className="admin-page__subtitle">
                        Completed stays and cancelled reservations
                    </p>
                </div>
                <button onClick={loadArchived} className="admin-btn admin-btn--outline" disabled={isLoading}>
                    {isLoading ? 'Refreshing…' : '↻ Refresh'}
                </button>
            </header>

            {/* Filter bar */}
            <div className="admin-filters">
                {([
                    { key: 'all' as FilterType, label: 'All', count: archived.length },
                    { key: 'completed' as FilterType, label: 'Completed', count: completedCount },
                    { key: 'cancelled' as FilterType, label: 'Cancelled', count: cancelledCount },
                ]).map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`admin-filter-btn ${filter === f.key ? 'admin-filter-btn--active' : ''}`}
                    >
                        {f.label}
                        <span className="admin-filter-btn__count">{f.count}</span>
                    </button>
                ))}
            </div>

            {error && (
                <div className="admin-error">
                    <p>{error}</p>
                    <button onClick={loadArchived} className="admin-btn admin-btn--outline">Retry</button>
                </div>
            )}

            {isLoading && archived.length === 0 ? (
                <div className="admin-loading">
                    <div className="admin-loading__spinner" />
                    <p>Loading history…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="admin-empty-state">
                    <p className="admin-empty-state__icon">◇</p>
                    <p className="admin-empty-state__text">
                        {filter === 'all' ? 'No archived reservations yet' : `No ${filter} reservations`}
                    </p>
                    <p className="admin-empty-state__hint">
                        Completed stays and cancelled bookings will appear here
                    </p>
                </div>
            ) : (
                <div className="admin-cards">
                    {filtered.map(r => (
                        <div
                            key={r._id}
                            className={`admin-card ${r.status === 'cancelled' ? 'admin-card--cancelled' : 'admin-card--completed'}`}
                        >
                            <div className="admin-card__header">
                                <div>
                                    <h3 className="admin-card__name">{r.guestName}</h3>
                                    <p className="admin-card__email">{r.guestEmail}</p>
                                </div>
                                <span className={`admin-badge admin-badge--${r.status}`}>
                                    {r.status === 'completed' ? '✓ Completed' : '✕ Cancelled'}
                                </span>
                            </div>

                            <div className="admin-card__details">
                                <div className="admin-card__detail">
                                    <span className="admin-card__label">Check-in</span>
                                    <span className="admin-card__value">{r.checkIn}</span>
                                </div>
                                <div className="admin-card__detail">
                                    <span className="admin-card__label">Check-out</span>
                                    <span className="admin-card__value">{r.checkOut}</span>
                                </div>
                                <div className="admin-card__detail">
                                    <span className="admin-card__label">Nights</span>
                                    <span className="admin-card__value">{r.nights}</span>
                                </div>
                                <div className="admin-card__detail">
                                    <span className="admin-card__label">Total Price</span>
                                    <span className="admin-card__value admin-card__value--price">€{r.totalPrice}</span>
                                </div>
                                <div className="admin-card__detail">
                                    <span className="admin-card__label">Deposit</span>
                                    <span className="admin-card__value">€{r.depositAmount}</span>
                                </div>
                                <div className="admin-card__detail">
                                    <span className="admin-card__label">Payment</span>
                                    <span className={`admin-badge admin-badge--${r.paymentStatus}`}>
                                        {r.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            {r.comment && (
                                <p className="admin-card__comment">
                                    <span className="admin-card__label">Comment</span>
                                    {r.comment}
                                </p>
                            )}

                            <p className="admin-card__meta">
                                {r.status === 'cancelled' && r.cancelledAt
                                    ? `Cancelled ${new Date(r.cancelledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                    : `Confirmed ${new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                }
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
