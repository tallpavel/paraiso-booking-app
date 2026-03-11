import { useEffect } from 'react';

interface ConfirmDialogProps {
    title: string;
    message: string;
    details?: { label: string; value: string }[];
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'default';
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    title,
    message,
    details,
    confirmLabel = 'Confirm',
    confirmVariant = 'danger',
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
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
                        onClick={onConfirm}
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
