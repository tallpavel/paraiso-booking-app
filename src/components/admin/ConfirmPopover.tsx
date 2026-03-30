import { useState, useRef, useEffect, cloneElement, isValidElement, type ReactElement } from 'react';

interface ConfirmPopoverProps {
    /** The trigger button element — must be a single React element */
    children: ReactElement<{ onClick?: React.MouseEventHandler; disabled?: boolean }>;
    /** Short confirmation message */
    message: string;
    /** Label for the confirm button */
    confirmLabel?: string;
    /** Visual style of the confirm button */
    confirmVariant?: 'default' | 'danger' | 'stripe' | 'paypal';
    /** Called when user confirms */
    onConfirm: () => void;
    /** Whether the action is currently loading */
    isLoading?: boolean;
    /** Disable the trigger button entirely */
    disabled?: boolean;
    /** Extra class on the wrapper */
    className?: string;
}

export default function ConfirmPopover({
    children,
    message,
    confirmLabel = 'Confirm',
    confirmVariant = 'default',
    onConfirm,
    isLoading = false,
    disabled = false,
    className = '',
}: ConfirmPopoverProps) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open]);

    const confirmBtnClass = {
        default: 'admin-popover__btn--confirm',
        danger: 'admin-popover__btn--danger',
        stripe: 'admin-popover__btn--stripe',
        paypal: 'admin-popover__btn--paypal',
    }[confirmVariant];

    // Clone the child element and inject our onClick directly onto it
    const trigger = isValidElement(children)
        ? cloneElement(children, {
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled && !isLoading) setOpen(prev => !prev);
            },
        })
        : children;

    return (
        <div ref={wrapperRef} className={`admin-popover-wrap ${className}`}>
            {trigger}

            {/* Popover */}
            {open && (
                <div className="admin-popover" role="dialog" aria-modal="true">
                    <p className="admin-popover__msg">{message}</p>
                    <div className="admin-popover__actions">
                        <button
                            className="admin-popover__btn admin-popover__btn--cancel"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            className={`admin-popover__btn ${confirmBtnClass}`}
                            onClick={() => {
                                onConfirm();
                                setOpen(false);
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? '⌛…' : confirmLabel}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
