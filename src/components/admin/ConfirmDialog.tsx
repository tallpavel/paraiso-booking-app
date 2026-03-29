import { useEffect, useState } from 'react';

interface ConfirmDialogProps {
    title: string;
    message: string;
    details?: { label: string; value: string }[];
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'default';
    isLoading?: boolean;
    /** When true, shows a text input for the user to provide a reason. */
    showReasonInput?: boolean;
    reasonPlaceholder?: string;
    reasonLabel?: string;
    /** Predefined quick-pick reasons for the dropdown. */
    reasonPresets?: string[];
    onConfirm: (reason?: string) => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    title,
    message,
    details,
    confirmLabel = 'Confirm',
    confirmVariant = 'danger',
    isLoading = false,
    showReasonInput = false,
    reasonPlaceholder = 'Optional reason…',
    reasonLabel = 'Reason for cancellation',
    reasonPresets = [],
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const [reason, setReason] = useState('');

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) onCancel();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onCancel, isLoading]);

    return (
        <div className="admin-modal-overlay" onClick={isLoading ? undefined : onCancel}>
            <div
                className="admin-modal admin-modal--sm"
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-label={title}
            >
                {/* Header */}
                <div className="admin-modal__header">
                    <h2 className="admin-modal__title">{title}</h2>
                    <button
                        onClick={onCancel}
                        className="admin-modal__close"
                        aria-label="Close"
                        disabled={isLoading}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="admin-modal__body">
                    <p className="admin-confirm__message">{message}</p>

                    {details && details.length > 0 && (
                        <div className="admin-confirm__details">
                            {details.map((d, i) => (
                                <div key={i} className="admin-confirm__detail-row">
                                    <span className="admin-confirm__detail-label">{d.label}</span>
                                    <span className="admin-confirm__detail-value">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {showReasonInput && (
                        <div className="admin-confirm__reason">
                            <label className="admin-confirm__reason-label">{reasonLabel}</label>

                            {reasonPresets.length > 0 && (
                                <div className="admin-confirm__reason-presets">
                                    {reasonPresets.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            className={`admin-confirm__reason-chip ${reason === preset ? 'admin-confirm__reason-chip--active' : ''}`}
                                            onClick={() => setReason(reason === preset ? '' : preset)}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <textarea
                                className="admin-confirm__reason-input"
                                placeholder={reasonPlaceholder}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={2}
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="admin-modal__footer">
                    <button
                        onClick={onCancel}
                        className="admin-btn admin-btn--outline"
                        disabled={isLoading}
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => onConfirm(showReasonInput ? reason : undefined)}
                        disabled={isLoading}
                        className={`admin-btn ${confirmVariant === 'danger' ? 'admin-btn--reject' : 'admin-btn--confirm'}`}
                    >
                        {isLoading ? 'Processing…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
