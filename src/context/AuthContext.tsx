import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { adminLogin as apiLogin, adminVerify2FA, adminSetup2FA, type LoginResponse } from '../api';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    login: (password: string) => Promise<LoginResponse>;
    verify2FA: (password: string, code: string) => Promise<void>;
    setup2FA: (password: string, code: string, secret: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'paraiso_admin_token';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(() => {
        const stored = localStorage.getItem(TOKEN_KEY);
        return {
            token: stored,
            isAuthenticated: !!stored,
            isLoading: false,
        };
    });

    // Check token validity on mount
    useEffect(() => {
        if (state.token) {
            try {
                const payload = JSON.parse(atob(state.token.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    localStorage.removeItem(TOKEN_KEY);
                    setState({ token: null, isAuthenticated: false, isLoading: false });
                }
            } catch {
                localStorage.removeItem(TOKEN_KEY);
                setState({ token: null, isAuthenticated: false, isLoading: false });
            }
        }
    }, []);

    /** Step 1: validate password, returns 2FA status (no JWT yet). */
    const login = useCallback(async (password: string): Promise<LoginResponse> => {
        setState(s => ({ ...s, isLoading: true }));
        try {
            const response = await apiLogin(password);

            // If the backend returned a JWT directly (2FA disabled), authenticate immediately
            if (response.token) {
                localStorage.setItem(TOKEN_KEY, response.token);
                setState({ token: response.token, isAuthenticated: true, isLoading: false });
            } else {
                setState(s => ({ ...s, isLoading: false }));
            }

            return response;
        } catch (err) {
            setState(s => ({ ...s, isLoading: false }));
            throw err;
        }
    }, []);

    /** Step 2a: verify a TOTP code (returning user). */
    const verify2FA = useCallback(async (password: string, code: string) => {
        setState(s => ({ ...s, isLoading: true }));
        try {
            const { token } = await adminVerify2FA(password, code);
            localStorage.setItem(TOKEN_KEY, token);
            setState({ token, isAuthenticated: true, isLoading: false });
        } catch (err) {
            setState(s => ({ ...s, isLoading: false }));
            throw err;
        }
    }, []);

    /** Step 2b: verify + persist a TOTP secret (first-time setup). */
    const setup2FA = useCallback(async (password: string, code: string, secret: string) => {
        setState(s => ({ ...s, isLoading: true }));
        try {
            const { token } = await adminSetup2FA(password, code, secret);
            localStorage.setItem(TOKEN_KEY, token);
            setState({ token, isAuthenticated: true, isLoading: false });
        } catch (err) {
            setState(s => ({ ...s, isLoading: false }));
            throw err;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ token: null, isAuthenticated: false, isLoading: false });
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, verify2FA, setup2FA, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
