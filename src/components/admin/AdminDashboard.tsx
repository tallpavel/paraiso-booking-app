import { useAdminData } from '../../hooks/useAdminData';

interface StatCardProps {
    label: string;
    value: number;
    accent?: 'teal' | 'amber' | 'green' | 'red' | 'default';
}

function StatCard({ label, value, accent = 'default' }: StatCardProps) {
    return (
        <div className={`admin-stat-card admin-stat-card--${accent}`}>
            <p className="admin-stat-card__value">{value}</p>
            <p className="admin-stat-card__label">{label}</p>
        </div>
    );
}

export default function AdminDashboard() {
    const { stats, requests, confirmed, isLoading, error, refresh } = useAdminData();

    if (isLoading && !stats) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    <div className="admin-loading__spinner" />
                    <p>Loading dashboard…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-page">
                <div className="admin-error">
                    <p>{error}</p>
                    <button onClick={refresh} className="admin-btn admin-btn--outline">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Dashboard</h1>
                    <p className="admin-page__subtitle">Overview of all reservations and payments</p>
                </div>
                <button onClick={refresh} className="admin-btn admin-btn--outline" disabled={isLoading}>
                    {isLoading ? 'Refreshing…' : '↻ Refresh'}
                </button>
            </header>

            {stats && (
                <div className="admin-stats-grid">
                    <StatCard label="Pending Requests" value={stats.pendingRequests} accent="amber" />
                    <StatCard label="Confirmed Total" value={stats.confirmedTotal} accent="teal" />
                    <StatCard label="Payment Paid" value={stats.paymentPaid} accent="green" />
                    <StatCard label="Payment Pending" value={stats.paymentPending} accent="amber" />
                    <StatCard label="Payment Failed" value={stats.paymentFailed} accent="red" />
                    <StatCard label="Upcoming Check-ins" value={stats.upcomingCheckIns} accent="default" />
                </div>
            )}

            {/* Recent requests preview */}
            <section className="admin-section">
                <h2 className="admin-section__title">Recent Requests</h2>
                {requests.length === 0 ? (
                    <p className="admin-empty">No pending requests</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Guest</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Nights</th>
                                    <th>Total</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.slice(0, 5).map(r => (
                                    <tr key={r._id}>
                                        <td>
                                            <span className="admin-table__name">{r.guestName}</span>
                                            <span className="admin-table__email">{r.guestEmail}</span>
                                        </td>
                                        <td>{r.checkIn}</td>
                                        <td>{r.checkOut}</td>
                                        <td>{r.nights}</td>
                                        <td className="admin-table__price">€{r.totalPrice}</td>
                                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Recent confirmed preview */}
            <section className="admin-section">
                <h2 className="admin-section__title">Recent Confirmed</h2>
                {confirmed.length === 0 ? (
                    <p className="admin-empty">No confirmed reservations</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Guest</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Total</th>
                                    <th>Deposit</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {confirmed.slice(0, 5).map(c => (
                                    <tr key={c._id}>
                                        <td>
                                            <span className="admin-table__name">{c.guestName}</span>
                                            <span className="admin-table__email">{c.guestEmail}</span>
                                        </td>
                                        <td>{c.checkIn}</td>
                                        <td>{c.checkOut}</td>
                                        <td className="admin-table__price">€{c.totalPrice}</td>
                                        <td className="admin-table__price">€{c.depositAmount}</td>
                                        <td>
                                            <span className={`admin-badge admin-badge--${c.paymentStatus}`}>
                                                {c.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
