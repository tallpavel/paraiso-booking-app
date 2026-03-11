import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
    const { login, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    if (isAuthenticated) {
        navigate('/admin', { replace: true });
        return null;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        try {
            await login(password);
            navigate('/admin', { replace: true });
        } catch {
            setError('Invalid password');
        }
    }

    return (
        <div className="admin-login">
            <div className="admin-login__card">
                <div className="admin-login__header">
                    <h1 className="admin-login__title">Paraíso</h1>
                    <p className="admin-login__subtitle">Admin Dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login__form">
                    {error && (
                        <div className="admin-login__error">{error}</div>
                    )}

                    <label className="admin-login__label">
                        <span>Password</span>
                        <div className="admin-login__input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="admin-login__input"
                                placeholder="Enter admin password"
                                autoFocus
                                required
                            />
                            <button
                                type="button"
                                className="admin-login__toggle-pw"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    /* Eye-off icon */
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    /* Eye icon */
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </label>

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className="admin-login__button"
                    >
                        {isLoading ? (
                            <span className="admin-login__spinner" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <a href="/" className="admin-login__back">
                    ← Back to site
                </a>
            </div>
        </div>
    );
}
