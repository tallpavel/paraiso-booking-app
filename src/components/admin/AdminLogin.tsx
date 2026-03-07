import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
    const { login, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="admin-login__input"
                            placeholder="Enter admin password"
                            autoFocus
                            required
                        />
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
