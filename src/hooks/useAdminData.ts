import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    fetchAdminStats,
    fetchReservationsAuth,
    fetchConfirmedReservationsFull,
    confirmReservation,
    deleteReservationRequest,
    deleteConfirmedReservation,
    updateReservationRequest,
    updateConfirmedReservation,
    toggleCheckIn,
    sendCheckInEmail,
    type AdminStats,
    type Reservation,
    type ConfirmedReservationFull,
    type UpdateReservationPayload,
} from '../api';

interface AdminData {
    stats: AdminStats | null;
    requests: Reservation[];
    confirmed: ConfirmedReservationFull[];
    isLoading: boolean;
    error: string | null;
}

interface AdminActions {
    refresh: () => Promise<void>;
    handleConfirm: (id: string) => Promise<{ paymentUrl: string; emailSent: boolean }>;
    handleRejectRequest: (id: string) => Promise<void>;
    handleCancelConfirmed: (id: string) => Promise<void>;
    handleUpdateRequest: (id: string, data: UpdateReservationPayload) => Promise<void>;
    handleUpdateConfirmed: (id: string, data: UpdateReservationPayload) => Promise<void>;
    handleToggleCheckIn: (id: string) => Promise<void>;
    handleSendCheckIn: (id: string) => Promise<void>;
}

export function useAdminData(): AdminData & AdminActions {
    const { token, logout } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [requests, setRequests] = useState<Reservation[]>([]);
    const [confirmed, setConfirmed] = useState<ConfirmedReservationFull[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const [s, r, c] = await Promise.all([
                fetchAdminStats(token),
                fetchReservationsAuth(token),
                fetchConfirmedReservationsFull(token),
            ]);
            setStats(s);
            setRequests(r);
            setConfirmed(c);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load data';
            if (msg.includes('401') || msg.includes('Authentication')) {
                logout();
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 30_000);
        return () => clearInterval(interval);
    }, [refresh]);

    const handleConfirm = useCallback(async (id: string) => {
        if (!token) throw new Error('Not authenticated');
        const result = await confirmReservation(token, id);
        await refresh();
        return { paymentUrl: result.paymentUrl, emailSent: result.emailSent };
    }, [token, refresh]);

    const handleRejectRequest = useCallback(async (id: string) => {
        if (!token) throw new Error('Not authenticated');
        await deleteReservationRequest(token, id);
        await refresh();
    }, [token, refresh]);

    const handleCancelConfirmed = useCallback(async (id: string) => {
        if (!token) throw new Error('Not authenticated');
        await deleteConfirmedReservation(token, id);
        await refresh();
    }, [token, refresh]);

    const handleUpdateRequest = useCallback(async (id: string, data: UpdateReservationPayload) => {
        if (!token) throw new Error('Not authenticated');
        await updateReservationRequest(token, id, data);
        await refresh();
    }, [token, refresh]);

    const handleUpdateConfirmed = useCallback(async (id: string, data: UpdateReservationPayload) => {
        if (!token) throw new Error('Not authenticated');
        await updateConfirmedReservation(token, id, data);
        await refresh();
    }, [token, refresh]);

    const handleToggleCheckIn = useCallback(async (id: string) => {
        if (!token) throw new Error('Not authenticated');
        await toggleCheckIn(token, id);
        await refresh();
    }, [token, refresh]);

    const handleSendCheckIn = useCallback(async (id: string) => {
        if (!token) throw new Error('Not authenticated');
        await sendCheckInEmail(token, id);
        await refresh();
    }, [token, refresh]);

    return {
        stats, requests, confirmed, isLoading, error,
        refresh, handleConfirm, handleRejectRequest, handleCancelConfirmed,
        handleUpdateRequest, handleUpdateConfirmed, handleToggleCheckIn, handleSendCheckIn,
    };
}
