import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { adminLogin as apiLogin } from '../api';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    login: (password: string) => Promise<void>;
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

    const login = useCallback(async (password: string) => {
        setState(s => ({ ...s, isLoading: true }));
        try {
            const { token } = await apiLogin(password);
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
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
