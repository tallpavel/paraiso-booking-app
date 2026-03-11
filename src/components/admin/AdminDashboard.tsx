import { useState, useMemo } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import CheckInDetailsModal from './CheckInDetailsModal';
import type { ConfirmedReservationFull } from '../../api';

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

// ── Helpers ──────────────────────────────────────────────────────────
function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysUntil(dateStr: string): number {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(dateStr);
    return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function stayProgress(checkIn: string, checkOut: string): number {
    const now = new Date();
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const total = end.getTime() - start.getTime();
    if (total <= 0) return 100;
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

function formatDateShort(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
}

// ── Sub-components ───────────────────────────────────────────────────
function CheckInCard({ reservation, type, onSendCheckIn, onViewCheckIn }: { reservation: ConfirmedReservationFull; type: 'arriving' | 'departing' | 'staying' | 'upcoming'; onSendCheckIn: (id: string) => void; onViewCheckIn: (r: ConfirmedReservationFull) => void }) {
    const progress = type === 'staying' ? stayProgress(reservation.checkIn, reservation.checkOut) : 0;
    const days = type === 'upcoming' ? daysUntil(reservation.checkIn) : 0;
    const ciStatus = reservation.checkInStatus || 'pending';

    return (
        <div className={`admin-checkin-card admin-checkin-card--${type}`}>
            <div className="admin-checkin-card__header">
                <div>
                    <p className="admin-checkin-card__name">{reservation.guestName}</p>
                    <p className="admin-checkin-card__email">{reservation.guestEmail}</p>
                </div>
                {type === 'arriving' && <span className="admin-checkin-card__badge admin-checkin-card__badge--arriving">📥 Arriving Today</span>}
                {type === 'departing' && <span className="admin-checkin-card__badge admin-checkin-card__badge--departing">📤 Departing Today</span>}
                {type === 'staying' && <span className="admin-checkin-card__badge admin-checkin-card__badge--staying">🏠 Currently Staying</span>}
                {type === 'upcoming' && <span className="admin-checkin-card__badge admin-checkin-card__badge--upcoming">📅 In {days} day{days !== 1 ? 's' : ''}</span>}
            </div>
            <div className="admin-checkin-card__dates">
                <span>{formatDateShort(reservation.checkIn)}</span>
                <span className="admin-checkin-card__arrow">→</span>
                <span>{formatDateShort(reservation.checkOut)}</span>
                <span className="admin-checkin-card__nights">{reservation.nights}n</span>
                <span className={`admin-badge admin-badge--${reservation.paymentStatus}`}>{reservation.paymentStatus}</span>
            </div>
            {type === 'staying' && (
                <div className="admin-checkin-card__progress">
                    <div className="admin-checkin-card__progress-bar">
                        <div className="admin-checkin-card__progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="admin-checkin-card__progress-label">{progress}% of stay</span>
                </div>
            )}
            <div className="admin-checkin-card__footer">
                {ciStatus === 'completed' ? (
                    <button onClick={() => onViewCheckIn(reservation)} className="admin-checkin-toggle admin-checkin-toggle--checked">
                        ☑ Checked In
                    </button>
                ) : (
                    <button
                        onClick={() => onSendCheckIn(reservation._id)}
                        className={`admin-checkin-toggle ${ciStatus === 'sent' ? 'admin-checkin-toggle--sent' : ''}`}
                    >
                        {ciStatus === 'sent' ? '↻ Resend Check-in' : '✉ Send Check-in'}
                    </button>
                )}
                {reservation.checkedIn && reservation.checkedInAt && (
                    <span className="admin-checkin-card__checkin-time">
                        {new Date(reservation.checkedInAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
    const { stats, requests, confirmed, isLoading, error, refresh, handleSendCheckIn } = useAdminData();
    const [viewingCheckIn, setViewingCheckIn] = useState<ConfirmedReservationFull | null>(null);

    // ── Compute check-in data from confirmed reservations ────────────
    const today = toDateStr(new Date());

    const { arrivingToday, departingToday, currentlyStaying, upcoming7Days } = useMemo(() => {
        const arriving: ConfirmedReservationFull[] = [];
        const departing: ConfirmedReservationFull[] = [];
        const staying: ConfirmedReservationFull[] = [];
        const upcoming: ConfirmedReservationFull[] = [];

        for (const r of confirmed) {
            const ciStr = r.checkIn.slice(0, 10);
            const coStr = r.checkOut.slice(0, 10);

            if (ciStr === today) {
                arriving.push(r);
            }
            if (coStr === today) {
                departing.push(r);
            }
            if (ciStr <= today && coStr > today) {
                staying.push(r);
            }
            const d = daysUntil(ciStr);
            if (d >= 1 && d <= 7) {
                upcoming.push(r);
            }
        }

        // Sort upcoming by check-in date
        upcoming.sort((a, b) => a.checkIn.localeCompare(b.checkIn));

        return {
            arrivingToday: arriving,
            departingToday: departing,
            currentlyStaying: staying,
            upcoming7Days: upcoming,
        };
    }, [confirmed, today]);

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

    const hasActivity = arrivingToday.length > 0 || departingToday.length > 0 || currentlyStaying.length > 0;

    return (
        <>
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

            {/* ── Check-in / Check-out Section ─────────────────────────── */}
            <section className="admin-section admin-checkin-section">
                <h2 className="admin-section__title">
                    Check-in & Check-out
                    <span className="admin-section__date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </h2>

                {!hasActivity && upcoming7Days.length === 0 ? (
                    <div className="admin-checkin-empty">
                        <p className="admin-checkin-empty__icon">🏖️</p>
                        <p className="admin-checkin-empty__text">No activity today</p>
                        <p className="admin-checkin-empty__hint">No arrivals, departures, or guests currently staying</p>
                    </div>
                ) : (
                    <div className="admin-checkin-grid">
                        {/* Today's arrivals */}
                        {arrivingToday.length > 0 && (
                            <div className="admin-checkin-group">
                                <h3 className="admin-checkin-group__title">
                                    <span className="admin-checkin-group__icon">📥</span>
                                    Arriving Today
                                    <span className="admin-checkin-group__count">{arrivingToday.length}</span>
                                </h3>
                                {arrivingToday.map(r => <CheckInCard key={r._id} reservation={r} type="arriving" onSendCheckIn={handleSendCheckIn} onViewCheckIn={setViewingCheckIn} />)}
                            </div>
                        )}

                        {/* Today's departures */}
                        {departingToday.length > 0 && (
                            <div className="admin-checkin-group">
                                <h3 className="admin-checkin-group__title">
                                    <span className="admin-checkin-group__icon">📤</span>
                                    Departing Today
                                    <span className="admin-checkin-group__count">{departingToday.length}</span>
                                </h3>
                                {departingToday.map(r => <CheckInCard key={r._id} reservation={r} type="departing" onSendCheckIn={handleSendCheckIn} onViewCheckIn={setViewingCheckIn} />)}
                            </div>
                        )}

                        {/* Currently staying */}
                        {currentlyStaying.length > 0 && (
                            <div className="admin-checkin-group">
                                <h3 className="admin-checkin-group__title">
                                    <span className="admin-checkin-group__icon">🏠</span>
                                    Currently Staying
                                    <span className="admin-checkin-group__count">{currentlyStaying.length}</span>
                                </h3>
                                {currentlyStaying.map(r => <CheckInCard key={r._id} reservation={r} type="staying" onSendCheckIn={handleSendCheckIn} onViewCheckIn={setViewingCheckIn} />)}
                            </div>
                        )}

                        {/* Upcoming 7 days */}
                        {upcoming7Days.length > 0 && (
                            <div className="admin-checkin-group">
                                <h3 className="admin-checkin-group__title">
                                    <span className="admin-checkin-group__icon">📅</span>
                                    Next 7 Days
                                    <span className="admin-checkin-group__count">{upcoming7Days.length}</span>
                                </h3>
                                {upcoming7Days.map(r => <CheckInCard key={r._id} reservation={r} type="upcoming" onSendCheckIn={handleSendCheckIn} onViewCheckIn={setViewingCheckIn} />)}
                            </div>
                        )}
                    </div>
                )}
            </section>

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

        {viewingCheckIn && (
            <CheckInDetailsModal
                reservationId={viewingCheckIn._id}
                guestName={viewingCheckIn.guestName}
                onClose={() => setViewingCheckIn(null)}
            />
        )}
        </>
    );
}
