import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    fetchDailyRates,
    createDailyRate,
    deleteDailyRate,
    fetchSeasonalRates,
    updateSeasonalRates,
    type DailyRate,
} from '../../api';
import ConfirmModal, { useConfirm } from './ConfirmModal';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

// Feb, Jul, Aug, Dec (0-indexed)
const HIGH_SEASON_MONTHS = new Set([1, 6, 7, 11]);
// May, Oct, Nov (0-indexed)
const LOW_SEASON_MONTHS = new Set([4, 9, 10]);

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

export default function PricingPanel() {
    const { token } = useAuth();

    const [rates, setRates] = useState<DailyRate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { confirm, modalProps } = useConfirm();

    // ── Form state ───────────────────────────────────────────────────
    const [newDate, setNewDate] = useState(toDateStr(new Date()));
    const [newPrice, setNewPrice] = useState('');
    const [newNote, setNewNote] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState('');

    // ── Range pricing ────────────────────────────────────────────────
    const [rangeEnd, setRangeEnd] = useState('');
    const [useRange, setUseRange] = useState(false);

    // ── Inline editing ───────────────────────────────────────────────
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState('');
    const [editNote, setEditNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // ── Seasonal rates (from backend) ─────────────────────────────────
    const [seasonalRates, setSeasonalRates] = useState<number[]>([]);
    const [editingMonth, setEditingMonth] = useState<number | null>(null);
    const [editMonthPrice, setEditMonthPrice] = useState('');
    const [isSavingSeasonal, setIsSavingSeasonal] = useState(false);

    // ── Fetch ────────────────────────────────────────────────────────
    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [dailyData, seasonalData] = await Promise.all([
                fetchDailyRates(),
                fetchSeasonalRates(),
            ]);
            setRates(dailyData);
            setSeasonalRates(seasonalData.rates);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load rates';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // ── Add / update rate ────────────────────────────────────────────
    const handleAdd = useCallback(async () => {
        if (!token) return;
        if (!newDate) {
            setAddError('Please select a start date');
            return;
        }
        if (useRange && (!rangeEnd || rangeEnd < newDate)) {
            setAddError('Please select a valid end date (must be after start date)');
            return;
        }
        if (!newPrice) {
            setAddError('Please enter a price per night');
            return;
        }

        const price = parseFloat(newPrice);
        if (isNaN(price) || price < 0) {
            setAddError('Please enter a valid price');
            return;
        }

        setIsAdding(true);
        setAddError('');

        try {
            if (useRange) {
                const cursor = new Date(newDate + 'T12:00:00');
                const end = new Date(rangeEnd + 'T12:00:00');
                while (cursor <= end) {
                    const dateStr = toDateStr(cursor);
                    await createDailyRate(token, dateStr, price, newNote || undefined);
                    cursor.setDate(cursor.getDate() + 1);
                }
            } else {
                await createDailyRate(token, newDate, price, newNote || undefined);
            }

            setNewPrice('');
            setNewNote('');
            setRangeEnd('');
            setUseRange(false);
            await refresh();
        } catch (err: unknown) {
            const apiErr = err as { message?: string };
            setAddError(apiErr?.message || 'Failed to set price');
        } finally {
            setIsAdding(false);
        }
    }, [token, newDate, newPrice, newNote, useRange, rangeEnd, refresh]);

    // ── Delete ───────────────────────────────────────────────────────
    const handleDelete = useCallback(async (id: string, dateLabel: string) => {
        if (!token) return;
        const ok = await confirm({
            title: 'Reset to Default',
            message: `Reset price for ${dateLabel} back to the seasonal default?`,
            confirmLabel: 'Reset Price',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await deleteDailyRate(token, id);
            await refresh();
        } catch {
            setError('Failed to delete rate');
        }
    }, [token, refresh, confirm]);

    // ── Inline update ────────────────────────────────────────────────
    const startEdit = (r: DailyRate) => {
        setEditingId(r._id);
        setEditPrice(String(r.price));
        setEditNote(r.note || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditPrice('');
        setEditNote('');
    };

    const handleInlineUpdate = useCallback(async (date: string) => {
        if (!token || !editPrice) return;
        const price = parseFloat(editPrice);
        if (isNaN(price) || price < 0) return;

        const ok = await confirm({
            title: 'Update Price',
            message: `Set nightly price for ${formatDate(date)} to €${price}?`,
            confirmLabel: 'Update',
            variant: 'warning',
        });
        if (!ok) return;

        setIsSaving(true);
        try {
            await createDailyRate(token, date, price, editNote || undefined);
            setEditingId(null);
            setEditPrice('');
            setEditNote('');
            await refresh();
        } catch {
            setError('Failed to update price');
        } finally {
            setIsSaving(false);
        }
    }, [token, editPrice, editNote, refresh, confirm]);

    // ── Group by month ───────────────────────────────────────────────
    const sortedRates = useMemo(() => {
        return [...rates].sort((a, b) => a.date.localeCompare(b.date));
    }, [rates]);

    const groupedByMonth = useMemo(() => {
        const groups: Record<string, DailyRate[]> = {};
        for (const r of sortedRates) {
            const monthKey = r.date.slice(0, 7);
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(r);
        }
        return groups;
    }, [sortedRates]);

    const monthLabel = (key: string) => {
        const [y, m] = key.split('-');
        const d = new Date(Number(y), Number(m) - 1, 1);
        return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    };

    // ── Render ────────────────────────────────────────────────────────
    if (isLoading && rates.length === 0) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    <div className="admin-loading__spinner" />
                    <p>Loading pricing…</p>
                </div>
            </div>
        );
    }

    if (error && rates.length === 0) {
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
                    <h1 className="admin-page__title">Pricing</h1>
                    <p className="admin-page__subtitle">
                        Set custom nightly prices. Days without custom prices use seasonal defaults.
                    </p>
                </div>
                <button onClick={refresh} className="admin-btn admin-btn--outline" disabled={isLoading}>
                    {isLoading ? 'Refreshing…' : '↻ Refresh'}
                </button>
            </header>

            {/* ── Seasonal Defaults ─────────────────────────────────────── */}
            <section className="admin-section">
                <h2 className="admin-section__title">Seasonal Defaults</h2>
                <div className="admin-pricing-defaults">
                    {seasonalRates.map((rate, i) => {
                        const isEditingThis = editingMonth === i;

                        const handleSaveSeasonal = async () => {
                            const newPrice = parseFloat(editMonthPrice);
                            if (isNaN(newPrice) || newPrice < 0) return;
                            if (newPrice === rate) { setEditingMonth(null); return; }
                            const ok = await confirm({
                                title: 'Update Seasonal Rate',
                                message: `Change ${MONTH_NAMES[i]} default rate from €${rate} to €${newPrice}?`,
                                confirmLabel: 'Update',
                                variant: 'warning',
                            });
                            if (!ok) { setEditingMonth(null); return; }
                            setIsSavingSeasonal(true);
                            try {
                                const updated = [...seasonalRates];
                                updated[i] = newPrice;
                                await updateSeasonalRates(token!, updated);
                                setSeasonalRates(updated);
                            } catch { setError('Failed to update seasonal rate'); }
                            finally { setIsSavingSeasonal(false); setEditingMonth(null); }
                        };

                        const isHighSeason = HIGH_SEASON_MONTHS.has(i);
                        const isLowSeason = LOW_SEASON_MONTHS.has(i);

                        return (
                            <div
                                key={i}
                                className={[
                                    'admin-pricing-default-card',
                                    isEditingThis && 'admin-pricing-default-card--editing',
                                    isHighSeason && !isEditingThis && 'admin-pricing-default-card--high-season',
                                    isLowSeason && !isEditingThis && 'admin-pricing-default-card--low-season',
                                ].filter(Boolean).join(' ')}
                                onClick={() => {
                                    if (!isEditingThis) {
                                        setEditingMonth(i);
                                        setEditMonthPrice(String(rate));
                                    }
                                }}
                            >
                                <span className="admin-pricing-default-card__month">
                                    {MONTH_NAMES[i].slice(0, 3)}
                                    {isHighSeason && <span className="admin-pricing-default-card__fire">⬆️</span>}
                                    {isLowSeason && <span className="admin-pricing-default-card__fire">⬇️</span>}
                                </span>

                                {isEditingThis ? (
                                    <>
                                        <input
                                            type="number"
                                            value={editMonthPrice}
                                            onChange={(e) => setEditMonthPrice(e.target.value)}
                                            className="admin-input admin-input--seasonal"
                                            autoFocus
                                            min="0"
                                            step="1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveSeasonal();
                                                if (e.key === 'Escape') setEditingMonth(null);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="admin-pricing-default-card__btns">
                                            <button
                                                className="admin-btn--primary-sm"
                                                onClick={(e) => { e.stopPropagation(); handleSaveSeasonal(); }}
                                                disabled={isSavingSeasonal}
                                            >
                                                {isSavingSeasonal ? '…' : '✓'}
                                            </button>
                                            <button
                                                className="admin-btn--outline-sm"
                                                onClick={(e) => { e.stopPropagation(); setEditingMonth(null); }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="admin-pricing-default-card__price">€{rate}</span>
                                        <span className="admin-pricing-default-card__edit-hint">click to edit</span>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
                <p className="admin-pricing-defaults__hint">
                    {isSavingSeasonal ? 'Saving…' : 'Click any month to edit its default nightly rate.'}
                </p>
            </section>

            {/* ── Set Custom Price ──────────────────────────────────────── */}
            <section className="admin-section">
                <h2 className="admin-section__title">Set Custom Price</h2>
                <div className="admin-blocked-form">
                    <div className="admin-blocked-form__row">
                        <div className="admin-blocked-form__field">
                            <label htmlFor="price-date">Start date</label>
                            <input
                                type="date"
                                id="price-date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="admin-input"
                            />
                        </div>

                        {useRange && (
                            <div className="admin-blocked-form__field">
                                <label htmlFor="price-date-end">End date</label>
                                <input
                                    type="date"
                                    id="price-date-end"
                                    value={rangeEnd}
                                    onChange={(e) => setRangeEnd(e.target.value)}
                                    min={newDate}
                                    className="admin-input"
                                />
                            </div>
                        )}

                        <div className="admin-blocked-form__field">
                            <label htmlFor="price-amount">Price per night (€)</label>
                            <input
                                type="number"
                                id="price-amount"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                placeholder="e.g. 185"
                                min="0"
                                step="1"
                                className="admin-input"
                            />
                        </div>

                        <div className="admin-blocked-form__field">
                            <label htmlFor="price-note">Note (optional)</label>
                            <input
                                type="text"
                                id="price-note"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="e.g. Holiday, High season"
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
                            <span>Apply to range</span>
                        </label>

                        <button
                            onClick={handleAdd}
                            disabled={isAdding}
                            className="admin-btn admin-btn--primary"
                        >
                            {isAdding ? 'Saving…' : useRange ? '💰 Set Range Price' : '💰 Set Price'}
                        </button>
                    </div>

                    {addError && (
                        <p className="admin-blocked-form__error">{addError}</p>
                    )}
                </div>
            </section>

            {/* ── Current Custom Prices ─────────────────────────────────── */}
            <section className="admin-section">
                <h2 className="admin-section__title">
                    Custom Prices
                    <span className="admin-section__count">{rates.length}</span>
                </h2>

                {rates.length === 0 ? (
                    <div className="admin-checkin-empty">
                        <p className="admin-checkin-empty__icon">💰</p>
                        <p className="admin-checkin-empty__text">No custom prices set</p>
                        <p className="admin-checkin-empty__hint">
                            All dates are using the seasonal default rates
                        </p>
                    </div>
                ) : (
                    <div className="admin-blocked-months">
                        {Object.entries(groupedByMonth).map(([month, monthRates]) => (
                            <div key={month} className="admin-blocked-month">
                                <h3 className="admin-blocked-month__header">{monthLabel(month)}</h3>
                                <div className="admin-blocked-list">
                                    {monthRates.map((r) => {
                                        const monthIdx = parseInt(r.date.slice(5, 7)) - 1;
                                        const seasonal = seasonalRates[monthIdx];
                                        const diff = r.price - seasonal;
                                        const diffStr = diff > 0 ? `+€${diff}` : diff < 0 ? `-€${Math.abs(diff)}` : '=';

                                        const isEditing = editingId === r._id;

                                        return (
                                            <div key={r._id} className="admin-blocked-item">
                                                <div className="admin-blocked-item__info">
                                                    <span className="admin-blocked-item__date">
                                                        {formatDate(r.date)}
                                                    </span>

                                                    {isEditing ? (
                                                        <>
                                                            <input
                                                                type="number"
                                                                value={editPrice}
                                                                onChange={(e) => setEditPrice(e.target.value)}
                                                                min="0"
                                                                step="1"
                                                                className="admin-input admin-input--inline"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleInlineUpdate(r.date);
                                                                    if (e.key === 'Escape') cancelEdit();
                                                                }}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={editNote}
                                                                onChange={(e) => setEditNote(e.target.value)}
                                                                placeholder="Note"
                                                                className="admin-input admin-input--inline admin-input--inline-note"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleInlineUpdate(r.date);
                                                                    if (e.key === 'Escape') cancelEdit();
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className={`admin-pricing-price ${diff > 0 ? 'admin-pricing-price--up' : diff < 0 ? 'admin-pricing-price--down' : ''}`}>
                                                                €{r.price}
                                                            </span>
                                                            <span className={`admin-pricing-diff ${diff > 0 ? 'admin-pricing-diff--up' : diff < 0 ? 'admin-pricing-diff--down' : ''}`}>
                                                                {diffStr}
                                                            </span>
                                                            {r.note && (
                                                                <span className="admin-blocked-item__reason">
                                                                    {r.note}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                <div className="admin-blocked-item__actions">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleInlineUpdate(r.date)}
                                                                disabled={isSaving || !editPrice}
                                                                className="admin-btn admin-btn--primary-sm"
                                                            >
                                                                {isSaving ? '…' : '✓ Save'}
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="admin-btn admin-btn--outline-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => startEdit(r)}
                                                                className="admin-btn admin-btn--outline-sm"
                                                                title="Edit this price"
                                                            >
                                                                ✎ Edit
                                                            </button>
                                                            <button
                                                            onClick={() => handleDelete(r._id, formatDate(r.date))}
                                                                className="admin-btn admin-btn--danger-sm"
                                                                title="Remove custom price (revert to seasonal default)"
                                                            >
                                                                ✕ Reset
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <ConfirmModal {...modalProps} />
        </div>
    );
}
