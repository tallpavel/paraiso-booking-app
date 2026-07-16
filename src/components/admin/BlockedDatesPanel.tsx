import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    fetchBlockedDatesAdmin,
    createBlockedDate,
    deleteBlockedDate,
    type BlockedDate,
} from '../../api';
import ConfirmDialog from './ConfirmDialog';

// ── Helpers ──────────────────────────────────────────────────────────

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

function formatDateShort(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
}

/** Parse YYYY-MM-DD to a Date at noon UTC (avoids timezone shifts). */
function parseDate(dateStr: string): Date {
    return new Date(dateStr + 'T12:00:00');
}

/** Check if two YYYY-MM-DD strings are consecutive days. */
function isConsecutive(dateA: string, dateB: string): boolean {
    const a = parseDate(dateA);
    const b = parseDate(dateB);
    const diff = b.getTime() - a.getTime();
    return Math.abs(diff - 86_400_000) < 1000; // ~1 day in ms
}

/** Expand a YYYY-MM-DD range to individual date strings (inclusive). */
function expandRange(start: string, end: string): string[] {
    const dates: string[] = [];
    const cursor = parseDate(start);
    const endDate = parseDate(end);
    while (cursor <= endDate) {
        dates.push(toDateStr(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
}

// ── Range grouping ───────────────────────────────────────────────────

interface BlockedRange {
    startDate: string;
    endDate: string;
    reason: string;
    dateIds: { id: string; date: string }[];
    days: number;
}

/**
 * Groups sorted blocked dates into consecutive ranges.
 * Dates are grouped when they are consecutive AND share the same reason.
 */
function groupConsecutiveDates(sorted: BlockedDate[]): BlockedRange[] {
    if (sorted.length === 0) return [];

    const ranges: BlockedRange[] = [];
    let current: BlockedRange = {
        startDate: sorted[0].date.slice(0, 10),
        endDate: sorted[0].date.slice(0, 10),
        reason: sorted[0].reason || '',
        dateIds: [{ id: sorted[0]._id, date: sorted[0].date.slice(0, 10) }],
        days: 1,
    };

    for (let i = 1; i < sorted.length; i++) {
        const dateStr = sorted[i].date.slice(0, 10);
        const reason = sorted[i].reason || '';

        if (isConsecutive(current.endDate, dateStr) && reason === current.reason) {
            // Extend current range
            current.endDate = dateStr;
            current.dateIds.push({ id: sorted[i]._id, date: dateStr });
            current.days++;
        } else {
            // Finalize current range, start new one
            ranges.push(current);
            current = {
                startDate: dateStr,
                endDate: dateStr,
                reason,
                dateIds: [{ id: sorted[i]._id, date: dateStr }],
                days: 1,
            };
        }
    }

    ranges.push(current);
    return ranges;
}

// ── AdjustBlockedRangeModal ──────────────────────────────────────────

interface AdjustModalProps {
    range: BlockedRange;
    onSave: (oldRange: BlockedRange, newStart: string, newEnd: string, newReason: string) => Promise<void>;
    onClose: () => void;
}

function AdjustBlockedRangeModal({ range, onSave, onClose }: AdjustModalProps) {
    const [startDate, setStartDate] = useState(range.startDate);
    const [endDate, setEndDate] = useState(range.endDate);
    const [reason, setReason] = useState(range.reason);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !saving) onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose, saving]);

    const newDays = useMemo(() => {
        if (!startDate || !endDate || endDate < startDate) return 0;
        return expandRange(startDate, endDate).length;
    }, [startDate, endDate]);

    const hasChanges = startDate !== range.startDate || endDate !== range.endDate || reason !== range.reason;

    const handleSave = async () => {
        if (!startDate || !endDate || endDate < startDate) {
            setError('End date must be on or after start date.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await onSave(range, startDate, endDate, reason);
            onClose();
        } catch (err) {
            const apiErr = err as { message?: string };
            setError(apiErr?.message || 'Failed to adjust range.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={saving ? undefined : onClose}>
            <div
                className="admin-modal admin-modal--sm"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Adjust Blocked Range"
            >
                {/* Header */}
                <div className="admin-modal__header">
                    <h2 className="admin-modal__title">Adjust Blocked Range</h2>
                    <button onClick={onClose} className="admin-modal__close" aria-label="Close" disabled={saving}>
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="admin-modal__body">
                    <div className="admin-modal__row">
                        <div className="admin-modal__field">
                            <label className="admin-modal__label">Start Date</label>
                            <input
                                type="date"
                                className="admin-modal__input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={saving}
                            />
                        </div>
                        <div className="admin-modal__field">
                            <label className="admin-modal__label">End Date</label>
                            <input
                                type="date"
                                className="admin-modal__input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="admin-modal__field">
                        <label className="admin-modal__label">Reason / Source</label>
                        <input
                            type="text"
                            className="admin-modal__input"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Booking.com rezervace, Maintenance"
                            disabled={saving}
                        />
                    </div>

                    {newDays > 0 && (
                        <div className="admin-modal__info">
                            {newDays} day{newDays !== 1 ? 's' : ''} will be blocked
                            {startDate === endDate
                                ? ` — ${formatDate(startDate)}`
                                : ` — ${formatDateShort(startDate)} → ${formatDate(endDate)}`}
                        </div>
                    )}

                    {error && <div className="admin-modal__api-error">{error}</div>}
                </div>

                {/* Footer */}
                <div className="admin-modal__footer">
                    <button onClick={onClose} className="admin-btn admin-btn--outline" disabled={saving}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="admin-btn admin-btn--confirm"
                        disabled={saving || !hasChanges || newDays === 0}
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════

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

    // ── Modal state ──────────────────────────────────────────────────
    const [adjustRange, setAdjustRange] = useState<BlockedRange | null>(null);
    const [unblockRange, setUnblockRange] = useState<BlockedRange | null>(null);
    const [isUnblocking, setIsUnblocking] = useState(false);

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

    // ── Delete single date ───────────────────────────────────────────
    const handleDeleteSingle = useCallback(async (id: string) => {
        if (!token) return;
        try {
            await deleteBlockedDate(token, id);
            await refresh();
        } catch {
            setError('Failed to unblock date');
        }
    }, [token, refresh]);

    // ── Unblock entire range ─────────────────────────────────────────
    const handleUnblockRange = useCallback(async (range: BlockedRange) => {
        if (!token) return;
        setIsUnblocking(true);
        try {
            for (const { id } of range.dateIds) {
                await deleteBlockedDate(token, id);
            }
            setUnblockRange(null);
            await refresh();
        } catch {
            setError('Failed to unblock some dates');
        } finally {
            setIsUnblocking(false);
        }
    }, [token, refresh]);

    // ── Adjust range (diff-based) ────────────────────────────────────
    const handleAdjustSave = useCallback(async (
        oldRange: BlockedRange,
        newStart: string,
        newEnd: string,
        newReason: string,
    ) => {
        if (!token) return;

        const oldDates = new Set(oldRange.dateIds.map(d => d.date));
        const newDates = new Set(expandRange(newStart, newEnd));

        // Dates to DELETE: in old but not in new
        const toDelete = oldRange.dateIds.filter(d => !newDates.has(d.date));
        // Dates to CREATE/UPDATE: in new range (upsert handles existing)
        const toCreate = [...newDates];

        const errors: string[] = [];

        // Delete removed dates
        for (const { id } of toDelete) {
            try {
                await deleteBlockedDate(token, id);
            } catch (err) {
                const apiErr = err as { message?: string };
                errors.push(apiErr?.message || 'Failed to delete a date');
            }
        }

        // Create/update remaining dates (upsert updates reason if already exists)
        for (const date of toCreate) {
            // Only call API if it's a new date or the reason changed
            const isExisting = oldDates.has(date);
            if (!isExisting || newReason !== oldRange.reason) {
                try {
                    await createBlockedDate(token, date, newReason || undefined);
                } catch (err) {
                    const apiErr = err as { message?: string };
                    errors.push(apiErr?.message || `Failed to block ${date}`);
                }
            }
        }

        if (errors.length > 0) {
            throw { message: `Some dates had issues:\n${errors.join('\n')}` };
        }

        await refresh();
    }, [token, refresh]);

    // ── Sort by date ─────────────────────────────────────────────────
    const sortedBlocked = useMemo(() => {
        return [...blocked].sort((a, b) => a.date.localeCompare(b.date));
    }, [blocked]);

    // ── Group consecutive dates into ranges ──────────────────────────
    const ranges = useMemo(() => groupConsecutiveDates(sortedBlocked), [sortedBlocked]);

    // ── Group ranges by month (based on startDate) ───────────────────
    const rangesByMonth = useMemo(() => {
        const groups: Record<string, BlockedRange[]> = {};
        for (const r of ranges) {
            const monthKey = r.startDate.slice(0, 7); // YYYY-MM
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(r);
        }
        return groups;
    }, [ranges]);

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

            {/* ── Current Blocked Dates (grouped as ranges) ───────────── */}
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
                        {Object.entries(rangesByMonth).map(([month, monthRanges]) => (
                            <div key={month} className="admin-blocked-month">
                                <h3 className="admin-blocked-month__header">{monthLabel(month)}</h3>
                                <div className="admin-blocked-list">
                                    {monthRanges.map((range, idx) => (
                                        <div key={`${range.startDate}-${idx}`} className="admin-blocked-range">
                                            <div className="admin-blocked-range__info">
                                                <span className="admin-blocked-range__dates">
                                                    {range.days === 1
                                                        ? formatDate(range.startDate)
                                                        : `${formatDateShort(range.startDate)} – ${formatDate(range.endDate)}`}
                                                </span>
                                                {range.days > 1 && (
                                                    <span className="admin-blocked-range__days">
                                                        {range.days} days
                                                    </span>
                                                )}
                                                {range.reason && (
                                                    <span className="admin-blocked-item__reason">
                                                        {range.reason}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="admin-blocked-range__actions">
                                                <button
                                                    onClick={() => setAdjustRange(range)}
                                                    className="admin-btn--outline-sm"
                                                    title="Adjust date range"
                                                >
                                                    ✎ Adjust
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (range.days === 1) {
                                                            handleDeleteSingle(range.dateIds[0].id);
                                                        } else {
                                                            setUnblockRange(range);
                                                        }
                                                    }}
                                                    className="admin-btn admin-btn--danger-sm"
                                                    title="Unblock this range"
                                                >
                                                    ✕ Unblock
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Adjust Modal ────────────────────────────────────────── */}
            {adjustRange && (
                <AdjustBlockedRangeModal
                    range={adjustRange}
                    onSave={handleAdjustSave}
                    onClose={() => setAdjustRange(null)}
                />
            )}

            {/* ── Unblock Confirmation ────────────────────────────────── */}
            {unblockRange && (
                <ConfirmDialog
                    title="Unblock Date Range"
                    message={`Are you sure you want to unblock ${unblockRange.days} dates from ${formatDateShort(unblockRange.startDate)} to ${formatDate(unblockRange.endDate)}?`}
                    details={[
                        { label: 'Range', value: `${formatDateShort(unblockRange.startDate)} → ${formatDate(unblockRange.endDate)}` },
                        { label: 'Days', value: `${unblockRange.days}` },
                        ...(unblockRange.reason ? [{ label: 'Reason', value: unblockRange.reason }] : []),
                    ]}
                    confirmLabel={`Unblock ${unblockRange.days} Dates`}
                    confirmVariant="danger"
                    isLoading={isUnblocking}
                    onConfirm={() => handleUnblockRange(unblockRange)}
                    onCancel={() => setUnblockRange(null)}
                />
            )}
        </div>
    );
}
