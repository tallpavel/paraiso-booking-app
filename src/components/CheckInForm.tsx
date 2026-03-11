import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSpamProtection } from '../hooks/useSpamProtection';
import {
    fetchCheckInData,
    submitCheckInData,
    type CheckInGuest,
    type CheckInFormData,
} from '../api';

const EMPTY_GUEST: CheckInGuest = {
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    documentType: 'passport',
    documentNumber: '',
};

const DOC_TYPE_LABELS: Record<string, string> = {
    passport: 'Passport',
    id_card: 'ID Card',
    driving_license: 'Driving License',
};

interface FieldError {
    guestIndex: number;
    field: string;
    message: string;
}

export default function CheckInForm() {
    const { token } = useParams<{ token: string }>();

    const [formData, setFormData] = useState<CheckInFormData | null>(null);
    const [guests, setGuests] = useState<CheckInGuest[]>([{ ...EMPTY_GUEST }]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
    const [success, setSuccess] = useState(false);
    const [apiErrors, setApiErrors] = useState<string[]>([]);

    const { honeypotField, validate: spamValidate } = useSpamProtection('checkin-form');

    const loadData = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await fetchCheckInData(token);
            setFormData(data);
            if (data.guests && data.guests.length > 0) {
                setGuests(data.guests.map(g => ({
                    fullName: g.fullName,
                    dateOfBirth: g.dateOfBirth,
                    nationality: g.nationality,
                    documentType: g.documentType,
                    documentNumber: g.documentNumber,
                })));
            } else {
                // Pre-fill with reservation guest name
                setGuests([{ ...EMPTY_GUEST, fullName: data.guestName }]);
            }
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || 'This check-in link is invalid or has expired.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    function updateGuest(index: number, field: keyof CheckInGuest, value: string) {
        setGuests(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
        // Clear errors for this field
        setFieldErrors(prev => prev.filter(e => !(e.guestIndex === index && e.field === field)));
    }

    function addGuest() {
        setGuests(prev => [...prev, { ...EMPTY_GUEST }]);
    }

    function removeGuest(index: number) {
        if (guests.length <= 1) return;
        setGuests(prev => prev.filter((_, i) => i !== index));
    }

    function validate(): boolean {
        const errors: FieldError[] = [];

        guests.forEach((g, i) => {
            if (!g.fullName.trim() || g.fullName.trim().length < 2) {
                errors.push({ guestIndex: i, field: 'fullName', message: 'Full name required (min 2 characters)' });
            }
            if (!g.dateOfBirth) {
                errors.push({ guestIndex: i, field: 'dateOfBirth', message: 'Date of birth required' });
            } else {
                const dob = new Date(g.dateOfBirth);
                if (isNaN(dob.getTime()) || dob > new Date()) {
                    errors.push({ guestIndex: i, field: 'dateOfBirth', message: 'Invalid date of birth' });
                }
            }
            if (!g.nationality.trim() || g.nationality.trim().length < 2) {
                errors.push({ guestIndex: i, field: 'nationality', message: 'Nationality required' });
            }
            if (!g.documentNumber.trim() || g.documentNumber.trim().length < 3) {
                errors.push({ guestIndex: i, field: 'documentNumber', message: 'Document number required (min 3 characters)' });
            }
        });

        setFieldErrors(errors);
        return errors.length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setApiErrors([]);

        if (!validate()) return;

        const spamCheck = spamValidate();
        if (!spamCheck.ok) {
            setApiErrors([spamCheck.reason || 'Spam check failed']);
            return;
        }

        if (!token) return;

        setIsSubmitting(true);
        try {
            await submitCheckInData(token, guests, spamCheck.turnstileToken);
            setSuccess(true);
        } catch (err: unknown) {
            const e = err as { message?: string; errors?: string[] };
            if (e.errors) {
                setApiErrors(e.errors);
            } else {
                setApiErrors([e.message || 'Something went wrong. Please try again.']);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    function getFieldError(guestIndex: number, field: string): string | undefined {
        return fieldErrors.find(e => e.guestIndex === guestIndex && e.field === field)?.message;
    }

    // ── Loading ──────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="checkin-page">
                <div className="checkin-loading">
                    <div className="checkin-spinner" />
                    <p>Loading check-in form…</p>
                </div>
            </div>
        );
    }

    // ── Error (invalid token) ────────────────────────────────────────────
    if (error || !formData) {
        return (
            <div className="checkin-page">
                <div className="checkin-error-card">
                    <p className="checkin-error-card__icon">⚠️</p>
                    <h1>Check-In Link Not Found</h1>
                    <p>{error || 'This link is invalid or has expired.'}</p>
                </div>
            </div>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="checkin-page">
                <div className="checkin-success-card">
                    <p className="checkin-success-card__icon">✅</p>
                    <h1>Check-In Complete!</h1>
                    <p>Thank you, <strong>{formData.guestName}</strong>. Your check-in data has been saved successfully.</p>
                    <div className="checkin-success-card__details">
                        <p><strong>Check-in:</strong> {formData.checkIn}</p>
                        <p><strong>Check-out:</strong> {formData.checkOut}</p>
                        <p><strong>Guests registered:</strong> {guests.length}</p>
                    </div>
                    <p className="checkin-success-card__hint">
                        You can reopen this link to update your information at any time.
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="checkin-btn checkin-btn--outline"
                    >
                        ✎ Edit Information
                    </button>
                </div>
            </div>
        );
    }

    // ── Form ─────────────────────────────────────────────────────────────
    return (
        <div className="checkin-page">
            <div className="checkin-container">
                {/* Header */}
                <div className="checkin-header">
                    <h1 className="checkin-header__title">📋 Online Check-In</h1>
                    <p className="checkin-header__subtitle">Paraíso — Verónica's Flat · Playa del Inglés</p>
                </div>

                {/* Booking summary */}
                <div className="checkin-summary">
                    <p className="checkin-summary__greeting">
                        Welcome, <strong>{formData.guestName}</strong>!
                    </p>
                    <div className="checkin-summary__dates">
                        <span>📅 {formData.checkIn}</span>
                        <span className="checkin-summary__arrow">→</span>
                        <span>📅 {formData.checkOut}</span>
                    </div>
                    <p className="checkin-summary__hint">
                        Please enter the details of <strong>all guests</strong> who will be staying.
                    </p>
                    {formData.submittedAt && (
                        <p className="checkin-summary__submitted">
                            ✓ Previously submitted on {new Date(formData.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    {guests.map((guest, index) => (
                        <div key={index} className="checkin-guest-card">
                            <div className="checkin-guest-card__header">
                                <h3>Guest {index + 1}</h3>
                                {guests.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeGuest(index)}
                                        className="checkin-guest-card__remove"
                                    >
                                        ✕ Remove
                                    </button>
                                )}
                            </div>

                            <div className="checkin-field">
                                <label className="checkin-label">Full Name *</label>
                                <input
                                    type="text"
                                    value={guest.fullName}
                                    onChange={e => updateGuest(index, 'fullName', e.target.value)}
                                    placeholder="As shown on passport or ID"
                                    className={`checkin-input ${getFieldError(index, 'fullName') ? 'checkin-input--error' : ''}`}
                                />
                                {getFieldError(index, 'fullName') && (
                                    <p className="checkin-field-error">{getFieldError(index, 'fullName')}</p>
                                )}
                            </div>

                            <div className="checkin-field-row">
                                <div className="checkin-field">
                                    <label className="checkin-label">Date of Birth *</label>
                                    <input
                                        type="date"
                                        value={guest.dateOfBirth}
                                        onChange={e => updateGuest(index, 'dateOfBirth', e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className={`checkin-input ${getFieldError(index, 'dateOfBirth') ? 'checkin-input--error' : ''}`}
                                    />
                                    {getFieldError(index, 'dateOfBirth') && (
                                        <p className="checkin-field-error">{getFieldError(index, 'dateOfBirth')}</p>
                                    )}
                                </div>
                                <div className="checkin-field">
                                    <label className="checkin-label">Nationality *</label>
                                    <input
                                        type="text"
                                        value={guest.nationality}
                                        onChange={e => updateGuest(index, 'nationality', e.target.value)}
                                        placeholder="e.g. Czech, Spanish, British"
                                        className={`checkin-input ${getFieldError(index, 'nationality') ? 'checkin-input--error' : ''}`}
                                    />
                                    {getFieldError(index, 'nationality') && (
                                        <p className="checkin-field-error">{getFieldError(index, 'nationality')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="checkin-field-row">
                                <div className="checkin-field">
                                    <label className="checkin-label">Document Type *</label>
                                    <select
                                        value={guest.documentType}
                                        onChange={e => updateGuest(index, 'documentType', e.target.value)}
                                        className="checkin-input checkin-select"
                                    >
                                        {Object.entries(DOC_TYPE_LABELS).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="checkin-field">
                                    <label className="checkin-label">Document Number *</label>
                                    <input
                                        type="text"
                                        value={guest.documentNumber}
                                        onChange={e => updateGuest(index, 'documentNumber', e.target.value)}
                                        placeholder="e.g. AB1234567"
                                        className={`checkin-input ${getFieldError(index, 'documentNumber') ? 'checkin-input--error' : ''}`}
                                    />
                                    {getFieldError(index, 'documentNumber') && (
                                        <p className="checkin-field-error">{getFieldError(index, 'documentNumber')}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addGuest}
                        className="checkin-btn checkin-btn--add"
                    >
                        + Add Another Guest
                    </button>

                    {apiErrors.length > 0 && (
                        <div className="checkin-api-errors">
                            {apiErrors.map((err, i) => <p key={i}>{err}</p>)}
                        </div>
                    )}

                    {honeypotField}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="checkin-btn checkin-btn--submit"
                    >
                        {isSubmitting ? 'Submitting…' : formData.submittedAt ? '↻ Update Check-In' : '✓ Complete Check-In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
