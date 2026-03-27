import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Stage = 'password' | 'setup' | 'verify';

export default function AdminLogin() {
    const { login, verify2FA, setup2FA, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [stage, setStage] = useState<Stage>('password');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // 2FA state
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [totpSecret, setTotpSecret] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    if (isAuthenticated) {
        navigate('/admin', { replace: true });
        return null;
    }

    // ── Password submission ─────────────────────────────────────────
    async function handlePasswordSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        try {
            const response = await login(password);

            if (response.requires2FASetup) {
                // First time — show QR code
                setQrDataUrl(response.qrDataUrl || '');
                setTotpSecret(response.secret || '');
                setStage('setup');
            } else if (response.requires2FA) {
                // Returning user — ask for code
                setStage('verify');
            } else if (response.token) {
                // Authenticated directly (shouldn't happen with 2FA enabled)
                navigate('/admin', { replace: true });
            }
        } catch {
            setError('Invalid password');
        }
    }

    // ── 2FA code submission ────────────────────────────────────────
    async function handle2FASubmit(e?: FormEvent) {
        e?.preventDefault();
        setError('');
        const token = code.join('');
        if (token.length !== 6) return;

        try {
            if (stage === 'setup') {
                await setup2FA(password, token, totpSecret);
            } else {
                await verify2FA(password, token);
            }
            navigate('/admin', { replace: true });
        } catch {
            setError('Invalid code. Please try again.');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    }

    // ── Auto-submit when all 6 digits entered ──────────────────────
    useEffect(() => {
        if (code.every(d => d !== '') && (stage === 'verify' || stage === 'setup')) {
            handle2FASubmit();
        }
    }, [code]);

    // ── Focus first input when stage changes ───────────────────────
    useEffect(() => {
        if (stage === 'verify' || stage === 'setup') {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [stage]);

    // ── Individual digit handlers ──────────────────────────────────
    function handleDigitChange(index: number, value: string) {
        if (!/^\d?$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handleDigitKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const newCode = [...code];
            newCode[index - 1] = '';
            setCode(newCode);
            inputRefs.current[index - 1]?.focus();
        }
    }

    function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;

        const newCode = [...code];
        for (let i = 0; i < 6; i++) {
            newCode[i] = pasted[i] || '';
        }
        setCode(newCode);

        const nextEmpty = newCode.findIndex(d => d === '');
        inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    }

    // ── Render ──────────────────────────────────────────────────────
    return (
        <div className="admin-login">
            <div className="admin-login__card">
                <div className="admin-login__header">
                    <h1 className="admin-login__title">Paraíso</h1>
                    <p className="admin-login__subtitle">Admin Dashboard</p>
                </div>

                {/* ── PASSWORD STAGE ─────────────────────────────── */}
                {stage === 'password' && (
                    <form onSubmit={handlePasswordSubmit} className="admin-login__form">
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
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
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
                                'Continue'
                            )}
                        </button>
                    </form>
                )}

                {/* ── 2FA SETUP STAGE (first time — QR code) ──────── */}
                {stage === 'setup' && (
                    <form onSubmit={handle2FASubmit} className="admin-login__form">
                        <div className="admin-login__2fa-setup">
                            <div className="admin-login__2fa-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    <circle cx="12" cy="16" r="1" />
                                </svg>
                            </div>
                            <h2 className="admin-login__2fa-title">Set Up Two-Factor Authentication</h2>
                            <p className="admin-login__2fa-desc">
                                Scan this QR code with your authenticator app (Google Authenticator, Authy, or 1Password).
                            </p>

                            {qrDataUrl && (
                                <div className="admin-login__qr-wrapper">
                                    <img
                                        src={qrDataUrl}
                                        alt="2FA QR Code"
                                        className="admin-login__qr-code"
                                    />
                                </div>
                            )}

                            <p className="admin-login__2fa-hint">
                                Then enter the 6-digit code below to verify:
                            </p>
                        </div>

                        {error && (
                            <div className="admin-login__error">{error}</div>
                        )}

                        <div className="admin-login__code-inputs">
                            {code.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleDigitChange(i, e.target.value)}
                                    onKeyDown={e => handleDigitKeyDown(i, e)}
                                    onPaste={i === 0 ? handlePaste : undefined}
                                    className="admin-login__code-digit"
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || code.some(d => !d)}
                            className="admin-login__button"
                        >
                            {isLoading ? (
                                <span className="admin-login__spinner" />
                            ) : (
                                'Verify & Activate'
                            )}
                        </button>
                    </form>
                )}

                {/* ── 2FA VERIFY STAGE (returning user) ──────────── */}
                {stage === 'verify' && (
                    <form onSubmit={handle2FASubmit} className="admin-login__form">
                        <div className="admin-login__2fa-setup">
                            <div className="admin-login__2fa-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <h2 className="admin-login__2fa-title">Two-Factor Authentication</h2>
                            <p className="admin-login__2fa-desc">
                                Enter the 6-digit code from your authenticator app.
                            </p>
                        </div>

                        {error && (
                            <div className="admin-login__error">{error}</div>
                        )}

                        <div className="admin-login__code-inputs">
                            {code.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleDigitChange(i, e.target.value)}
                                    onKeyDown={e => handleDigitKeyDown(i, e)}
                                    onPaste={i === 0 ? handlePaste : undefined}
                                    className="admin-login__code-digit"
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || code.some(d => !d)}
                            className="admin-login__button"
                        >
                            {isLoading ? (
                                <span className="admin-login__spinner" />
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <button
                            type="button"
                            className="admin-login__back-link"
                            onClick={() => {
                                setStage('password');
                                setCode(['', '', '', '', '', '']);
                                setError('');
                            }}
                        >
                            ← Back to password
                        </button>
                    </form>
                )}

                <a href="/" className="admin-login__back">
                    ← Back to site
                </a>
            </div>
        </div>
    );
}
