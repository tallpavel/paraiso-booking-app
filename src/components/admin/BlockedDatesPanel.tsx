import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    fetchBlockedDatesAdmin,
    createBlockedDate,
    deleteBlockedDate,
    type BlockedDate,
} from '../../api';

function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function BlockedDatesPanel() {
    const { token, logout } = useAuth();

    const [blocked, setBlocked] = useState<BlockedDate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── New date form state ──────────────────────────────────────────
    const [newDate, setNewDate] = useState(toDateStr(new Date()));
    const [newReason, setNewReason] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState('');

    // ── Range blocking ───────────────────────────────────────────────
    const [rangeEnd, setRangeEnd] = useState('');
    const [useRange, setUseRange] = useState(false);

    // ── Fetch ────────────────────────────────────────────────────────
    const refresh = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchBlockedDatesAdmin(token);
            setBlocked(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load blocked dates';
            if (msg.includes('401')) logout();
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // ── Add blocked date(s) ──────────────────────────────────────────
    const handleAdd = useCallback(async () => {
        if (!token || !newDate) return;
        setIsAdding(true);
        setAddError('');

        try {
            if (useRange && rangeEnd && rangeEnd > newDate) {
                // Block a range of dates — collect errors instead of stopping
                const cursor = new Date(newDate + 'T12:00:00');
                const end = new Date(rangeEnd + 'T12:00:00');
                const skipped: string[] = [];

                while (cursor <= end) {
                    const dateStr = toDateStr(cursor);
                    try {
                        await createBlockedDate(token, dateStr, newReason || undefined);
                    } catch (err: unknown) {
                        const apiErr = err as { message?: string };
                        skipped.push(apiErr?.message || `Failed to block ${dateStr}`);
                    }
                    cursor.setDate(cursor.getDate() + 1);
                }

                if (skipped.length > 0) {
                    setAddError(`Some dates were skipped:\n${skipped.join('\n')}`);
                }
            } else {
                await createBlockedDate(token, newDate, newReason || undefined);
            }

            setNewReason('');
            setRangeEnd('');
            setUseRange(false);
            await refresh();
        } catch (err: unknown) {
            const apiErr = err as { message?: string };
            setAddError(apiErr?.message || 'Failed to block date');
        } finally {
            setIsAdding(false);
        }
    }, [token, newDate, newReason, useRange, rangeEnd, refresh]);

    // ── Delete ───────────────────────────────────────────────────────
    const handleDelete = useCallback(async (id: string) => {
        if (!token) return;
        try {
            await deleteBlockedDate(token, id);
            await refresh();
        } catch {
            setError('Failed to unblock date');
        }
    }, [token, refresh]);

    // ── Sort by date ─────────────────────────────────────────────────
    const sortedBlocked = useMemo(() => {
        return [...blocked].sort((a, b) => a.date.localeCompare(b.date));
    }, [blocked]);

    // ── Group by month ───────────────────────────────────────────────
    const groupedByMonth = useMemo(() => {
        const groups: Record<string, BlockedDate[]> = {};
        for (const b of sortedBlocked) {
            const monthKey = b.date.slice(0, 7); // YYYY-MM
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(b);
        }
        return groups;
    }, [sortedBlocked]);

    const monthLabel = (key: string) => {
        const [y, m] = key.split('-');
        const d = new Date(Number(y), Number(m) - 1, 1);
        return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    };

    // ── Render ────────────────────────────────────────────────────────
    if (isLoading && blocked.length === 0) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    <div className="admin-loading__spinner" />
                    <p>Loading blocked dates…</p>
                </div>
            </div>
        );
    }

    if (error && blocked.length === 0) {
        return (
            <div className="admin-page">
                <div className="admin-error">
                    <p>{error}</p>
                    <button onClick={refresh} className="admin-btn admin-btn--outline">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">Blocked Dates</h1>
                    <p className="admin-page__subtitle">
                        Manually block days from the booking calendar (maintenance, personal use, etc.)
                    </p>
                </div>
                <button onClick={refresh} className="admin-btn admin-btn--outline" disabled={isLoading}>
                    {isLoading ? 'Refreshing…' : '↻ Refresh'}
                </button>
            </header>

            {/* ── Add New Blocked Date ──────────────────────────────────── */}
            <section className="admin-section">
                <h2 className="admin-section__title">Block a Date</h2>
                <div className="admin-blocked-form">
                    <div className="admin-blocked-form__row">
                        <div className="admin-blocked-form__field">
                            <label htmlFor="block-date">Start date</label>
                            <input
                                type="date"
                                id="block-date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                min={toDateStr(new Date())}
                                className="admin-input"
                            />
                        </div>

                        {useRange && (
                            <div className="admin-blocked-form__field">
                                <label htmlFor="block-date-end">End date</label>
                                <input
                                    type="date"
                                    id="block-date-end"
                                    value={rangeEnd}
                                    onChange={(e) => setRangeEnd(e.target.value)}
                                    min={newDate}
                                    className="admin-input"
                                />
                            </div>
                        )}

                        <div className="admin-blocked-form__field">
                            <label htmlFor="block-reason">Reason (optional)</label>
                            <input
                                type="text"
                                id="block-reason"
                                value={newReason}
                                onChange={(e) => setNewReason(e.target.value)}
                                placeholder="e.g. Maintenance, Personal use"
                                className="admin-input"
                            />
                        </div>
                    </div>

                    <div className="admin-blocked-form__actions">
                        <label className="admin-blocked-form__toggle">
                            <input
                                type="checkbox"
                                checked={useRange}
                                onChange={(e) => setUseRange(e.target.checked)}
                            />
                            <span>Block a range</span>
                        </label>

                        <button
                            onClick={handleAdd}
                            disabled={isAdding || !newDate}
                            className="admin-btn admin-btn--primary"
                        >
                            {isAdding ? 'Blocking…' : useRange ? '🚫 Block Range' : '🚫 Block Date'}
                        </button>
                    </div>

                    {addError && (
                        <p className="admin-blocked-form__error">{addError}</p>
                    )}
                </div>
            </section>

            {/* ── Current Blocked Dates ─────────────────────────────────── */}
            <section className="admin-section">
                <h2 className="admin-section__title">
                    Currently Blocked
                    <span className="admin-section__count">{blocked.length}</span>
                </h2>

                {blocked.length === 0 ? (
                    <div className="admin-checkin-empty">
                        <p className="admin-checkin-empty__icon">📅</p>
                        <p className="admin-checkin-empty__text">No blocked dates</p>
                        <p className="admin-checkin-empty__hint">
                            All calendar dates are currently available for booking
                        </p>
                    </div>
                ) : (
                    <div className="admin-blocked-months">
                        {Object.entries(groupedByMonth).map(([month, dates]) => (
                            <div key={month} className="admin-blocked-month">
                                <h3 className="admin-blocked-month__header">{monthLabel(month)}</h3>
                                <div className="admin-blocked-list">
                                    {dates.map((b) => (
                                        <div key={b._id} className="admin-blocked-item">
                                            <div className="admin-blocked-item__info">
                                                <span className="admin-blocked-item__date">
                                                    {formatDate(b.date)}
                                                </span>
                                                {b.reason && (
                                                    <span className="admin-blocked-item__reason">
                                                        {b.reason}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(b._id)}
                                                className="admin-btn admin-btn--danger-sm"
                                                title="Unblock this date"
                                            >
                                                ✕ Unblock
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
