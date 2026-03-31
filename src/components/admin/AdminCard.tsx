import React from 'react';

interface AdminCardProps {
    id: string;
    faded?: boolean;
    header?: React.ReactNode;
    details?: React.ReactNode;
    timeline?: React.ReactNode;
    comment?: React.ReactNode;
    meta?: React.ReactNode;
    actions?: React.ReactNode;
    error?: string;
    loading?: boolean;
    className?: string;
}

/**
 * Standardized card layout for admin reservation items.
 * Uses CSS BEM classes defined in index.css.
 */
export default function AdminCard({
    faded,
    header,
    details,
    timeline,
    comment,
    meta,
    actions,
    error,
    loading,
    className = '',
}: AdminCardProps) {
    return (
        <div className={`admin-card ${faded ? 'admin-card--faded' : ''} ${loading ? 'admin-card--loading' : ''} ${className}`}>
            {header && <div className="admin-card__header">{header}</div>}
            
            {details && <div className="admin-card__details">{details}</div>}
            
            {timeline && timeline}
            
            {comment && comment}
            
            {meta && <p className="admin-card__meta">{meta}</p>}
            
            {error && (
                <div className="mt-3 rounded-lg border border-coral/30 bg-coral/5 p-2.5 text-center">
                    <p className="text-[11px] font-medium text-coral">{error}</p>
                </div>
            )}
            
            {actions && <div className="admin-card__actions">{actions}</div>}
            
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-[1px]">
                    <div className="admin-loading__spinner h-6 w-6 border-2" />
                </div>
            )}
        </div>
    );
}

/**
 * Sub-component for individual detail rows
 */
export function AdminCardDetail({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
    return (
        <div className="admin-card__detail">
            <span className="admin-card__label">{label}</span>
            <span className={`admin-card__value ${className}`}>{value}</span>
        </div>
    );
}
