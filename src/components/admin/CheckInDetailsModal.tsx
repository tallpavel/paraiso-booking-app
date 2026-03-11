import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCheckInDetails, type CheckInDetails as CheckInDetailsType, type CheckInGuest } from '../../api';

const DOC_TYPE_LABELS: Record<string, string> = {
    passport: 'Passport',
    id_card: 'ID Card',
    driving_license: 'Driving License',
};

interface Props {
    reservationId: string;
    guestName: string;
    onClose: () => void;
}

export default function CheckInDetailsModal({ reservationId, guestName, onClose }: Props) {
    const { token } = useAuth();
    const [data, setData] = useState<CheckInDetailsType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) return;
        setIsLoading(true);
        fetchCheckInDetails(token, reservationId)
            .then(setData)
            .catch((err: { message?: string }) => setError(err.message || 'Failed to load check-in data'))
            .finally(() => setIsLoading(false));
    }, [token, reservationId]);

    function formatDob(dob: string) {
        return new Date(dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal checkin-details-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal__header">
                    <h2 className="admin-modal__title">📋 Check-In Details</h2>
                    <button onClick={onClose} className="admin-modal__close">✕</button>
                </div>

                <div className="admin-modal__body">
                    {isLoading && (
                        <div className="checkin-details-loading">
                            <div className="checkin-spinner" />
                            <p>Loading check-in data…</p>
                        </div>
                    )}

                    {error && (
                        <div className="checkin-details-empty">
                            <p className="checkin-details-empty__icon">📭</p>
                            <p className="checkin-details-empty__text">No check-in data yet</p>
                            <p className="checkin-details-empty__hint">
                                {guestName} hasn't submitted their check-in form yet.
                            </p>
                        </div>
                    )}

                    {data && !isLoading && (
                        <>
                            {/* Summary header */}
                            <div className="checkin-details-summary">
                                <div className="checkin-details-summary__row">
                                    <span className="checkin-details-summary__label">Guest</span>
                                    <span className="checkin-details-summary__value">{data.guestName}</span>
                                </div>
                                <div className="checkin-details-summary__row">
                                    <span className="checkin-details-summary__label">Stay</span>
                                    <span className="checkin-details-summary__value">{data.checkIn} → {data.checkOut}</span>
                                </div>
                                {data.submittedAt && (
                                    <div className="checkin-details-summary__row">
                                        <span className="checkin-details-summary__label">Submitted</span>
                                        <span className="checkin-details-summary__value checkin-details-summary__value--green">
                                            ✓ {new Date(data.submittedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                                {data.checkInUrl && (
                                    <div className="checkin-details-summary__row">
                                        <span className="checkin-details-summary__label">Check-in Link</span>
                                        <a href={data.checkInUrl} target="_blank" rel="noopener noreferrer" className="checkin-details-link">
                                            Open Form ↗
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Guest list */}
                            {data.guests.length === 0 ? (
                                <div className="checkin-details-empty">
                                    <p className="checkin-details-empty__icon">⏳</p>
                                    <p className="checkin-details-empty__text">Awaiting guest data</p>
                                    <p className="checkin-details-empty__hint">
                                        The check-in email has been sent. Waiting for the guest to fill in their details.
                                    </p>
                                </div>
                            ) : (
                                <div className="checkin-details-guests">
                                    <h3 className="checkin-details-guests__title">
                                        Registered Guests ({data.guests.length})
                                    </h3>
                                    {data.guests.map((guest: CheckInGuest, i: number) => (
                                        <div key={guest._id || i} className="checkin-details-guest-card">
                                            <div className="checkin-details-guest-card__number">
                                                {i + 1}
                                            </div>
                                            <div className="checkin-details-guest-card__info">
                                                <p className="checkin-details-guest-card__name">{guest.fullName}</p>
                                                <div className="checkin-details-guest-card__grid">
                                                    <div>
                                                        <span className="checkin-details-guest-card__label">Date of Birth</span>
                                                        <span className="checkin-details-guest-card__value">{formatDob(guest.dateOfBirth)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="checkin-details-guest-card__label">Nationality</span>
                                                        <span className="checkin-details-guest-card__value">{guest.nationality}</span>
                                                    </div>
                                                    <div>
                                                        <span className="checkin-details-guest-card__label">Document Type</span>
                                                        <span className="checkin-details-guest-card__value">{DOC_TYPE_LABELS[guest.documentType] || guest.documentType}</span>
                                                    </div>
                                                    <div>
                                                        <span className="checkin-details-guest-card__label">Document Number</span>
                                                        <span className="checkin-details-guest-card__value checkin-details-guest-card__value--mono">{guest.documentNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
