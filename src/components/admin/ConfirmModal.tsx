import { useState, useCallback, useRef, useEffect } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'default';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const confirmRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Focus confirm button when modal opens
            setTimeout(() => confirmRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const iconMap = {
        danger: '⚠',
        warning: '⚡',
        default: '?',
    };

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div
                className="confirm-modal"
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-message"
            >
                <div className={`confirm-modal__icon confirm-modal__icon--${variant}`}>
                    {iconMap[variant]}
                </div>

                <h3 id="confirm-title" className="confirm-modal__title">{title}</h3>
                <p id="confirm-message" className="confirm-modal__message">{message}</p>

                <div className="confirm-modal__actions">
                    <button
                        onClick={onCancel}
                        className="confirm-modal__btn confirm-modal__btn--cancel"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        onClick={onConfirm}
                        className={`confirm-modal__btn confirm-modal__btn--${variant}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Hook for easier usage ────────────────────────────────────────────
interface ConfirmState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'warning' | 'default';
    resolve: ((value: boolean) => void) | null;
}

export function useConfirm() {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: 'Confirm',
        variant: 'default',
        resolve: null,
    });

    const confirm = useCallback(
        (opts: {
            title: string;
            message: string;
            confirmLabel?: string;
            variant?: 'danger' | 'warning' | 'default';
        }): Promise<boolean> => {
            return new Promise((resolve) => {
                setState({
                    isOpen: true,
                    title: opts.title,
                    message: opts.message,
                    confirmLabel: opts.confirmLabel || 'Confirm',
                    variant: opts.variant || 'default',
                    resolve,
                });
            });
        },
        [],
    );

    const handleConfirm = useCallback(() => {
        state.resolve?.(true);
        setState((s) => ({ ...s, isOpen: false, resolve: null }));
    }, [state.resolve]);

    const handleCancel = useCallback(() => {
        state.resolve?.(false);
        setState((s) => ({ ...s, isOpen: false, resolve: null }));
    }, [state.resolve]);

    const modalProps = {
        isOpen: state.isOpen,
        title: state.title,
        message: state.message,
        confirmLabel: state.confirmLabel,
        variant: state.variant,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
    };

    return { confirm, modalProps };
}
