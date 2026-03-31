import { useState, useCallback } from 'react';

type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

interface AsyncActionState {
    status: ActionStatus;
    error?: string;
}

/**
 * A hook to manage asynchronous actions for multiple items (keyed by ID).
 * Handles loading states and auto-clearing error messages.
 */
export function useAsyncAction() {
    const [actions, setActions] = useState<Record<string, AsyncActionState>>({});

    const execute = useCallback(async <T,>(id: string, actionFn: () => Promise<T>): Promise<T | undefined> => {
        setActions(prev => ({
            ...prev,
            [id]: { status: 'loading' }
        }));

        try {
            const result = await actionFn();
            setActions(prev => ({
                ...prev,
                [id]: { status: 'success' }
            }));
            
            // Clear success status after 3 seconds
            setTimeout(() => {
                setActions(prev => {
                    const next = { ...prev };
                    if (next[id]?.status === 'success') {
                        delete next[id];
                    }
                    return next;
                });
            }, 3000);

            return result;

        } catch (err) {
            const message = (err as Error).message || 'Action failed';
            setActions(prev => ({
                ...prev,
                [id]: { status: 'error', error: message }
            }));

            // Auto-clear error after 5 seconds
            setTimeout(() => {
                setActions(prev => {
                    const next = { ...prev };
                    if (next[id]?.status === 'error') {
                        delete next[id];
                    }
                    return next;
                });
            }, 5000);

            return undefined;
        }
    }, []);

    const getStatus = useCallback((id: string) => actions[id]?.status || 'idle', [actions]);
    const getError = useCallback((id: string) => actions[id]?.error, [actions]);
    const isLoading = useCallback((id: string) => actions[id]?.status === 'loading', [actions]);

    return {
        execute,
        getStatus,
        getError,
        isLoading,
    };
}
