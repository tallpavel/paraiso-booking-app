/**
 * Multi-layer spam & bot protection for forms.
 *
 * Layer 1 — Cloudflare Turnstile (managed CAPTCHA)
 * Layer 2 — Honeypot field (hidden input bots fill automatically)
 * Layer 3 — Timing check (rejects submissions faster than a human could type)
 *
 * Graceful degradation: if Turnstile consistently fails (network/config issues),
 * layers 2 + 3 still protect and submissions proceed without a token.
 * The backend should treat a missing token as "unverified" and apply its own logic.
 *
 * Usage:
 *   const spam = useSpamProtection('contact-form');
 *   // In JSX:  {spam.honeypotField}
 *   // On submit: const check = spam.validate();
 *              if (!check.ok) { showError(check.reason); return; }
 *              // Include check.turnstileToken in your API payload
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { createElement } from 'react';

// ── Cloudflare Turnstile site key ────────────────────────────────────
// Set via VITE_TURNSTILE_SITE_KEY in your .env file
// Use '1x00000000000000000000AA' for testing (always passes)
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? (() => {
    if (import.meta.env.DEV) {
        console.warn('[spam-protection] VITE_TURNSTILE_SITE_KEY not set — using test key');
    }
    return '1x00000000000000000000AA';
})();

// Minimum seconds before a form can be submitted (bots submit instantly)
const MIN_FILL_TIME_SECONDS = 3;

// How many Turnstile errors before we give up and degrade gracefully
const MAX_RETRIES = 3;

// ── Types ────────────────────────────────────────────────────────────
interface TurnstileAPI {
    render: (
        container: string | HTMLElement,
        opts: {
            sitekey: string;
            callback: (token: string) => void;
            'error-callback'?: (errorCode?: string) => void;
            'expired-callback'?: () => void;
            theme?: 'light' | 'dark' | 'auto';
            size?: 'normal' | 'compact' | 'flexible' | 'invisible';
        },
    ) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
}

declare global {
    interface Window {
        turnstile?: TurnstileAPI;
    }
}

interface ValidationResult {
    ok: boolean;
    reason?: string;
    turnstileToken?: string;
}

interface SpamProtection {
    /** Render this inside your form (honeypot + Turnstile container) */
    honeypotField: ReactNode;
    /** Call before submitting — returns { ok, reason?, turnstileToken? } */
    validate: () => ValidationResult;
    /** Whether Turnstile has generated a token (widget is ready) */
    isReady: boolean;
    /** Reset the protection (call after successful submit if form is reused) */
    reset: () => void;
}

// ── Script loader (singleton) ────────────────────────────────────────
let scriptLoaded = false;
function ensureTurnstileScript() {
    if (scriptLoaded || document.getElementById('cf-turnstile-script')) return;
    scriptLoaded = true;
    const s = document.createElement('script');
    s.id = 'cf-turnstile-script';
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
}

// ── Hook ─────────────────────────────────────────────────────────────
export function useSpamProtection(formId: string): SpamProtection {
    const mountTimeRef = useRef(Date.now());
    const honeypotRef = useRef('');
    const turnstileTokenRef = useRef<string | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const retryCountRef = useRef(0);
    const degradedRef = useRef(false);
    const [isReady, setIsReady] = useState(false);

    // Load the Turnstile script once
    useEffect(() => {
        ensureTurnstileScript();
    }, []);

    // Render Turnstile widget when script is ready
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 40; // 40 × 250ms = 10 s

        const tryRender = () => {
            if (!window.turnstile || !containerRef.current) {
                if (++attempts < maxAttempts) {
                    setTimeout(tryRender, 250);
                } else {
                    // Turnstile script never loaded — degrade gracefully
                    // Honeypot + timing checks still protect against bots
                    console.warn('[Turnstile] Script failed to load after timeout — degrading gracefully. Honeypot + timing checks still active.');
                    degradedRef.current = true;
                    setIsReady(true);
                }
                return;
            }

            // Don't re-render if already rendered
            if (widgetIdRef.current) return;

            const id = window.turnstile.render(containerRef.current, {
                sitekey: TURNSTILE_SITE_KEY,
                callback: (token: string) => {
                    turnstileTokenRef.current = token;
                    retryCountRef.current = 0;
                    degradedRef.current = false;
                    setIsReady(true);
                },
                'error-callback': (errorCode?: string) => {
                    turnstileTokenRef.current = null;

                    console.warn(
                        `[Turnstile] Challenge error (attempt ${retryCountRef.current + 1}/${MAX_RETRIES})`,
                        errorCode ? `code: ${errorCode}` : '',
                    );

                    if (retryCountRef.current < MAX_RETRIES) {
                        // Auto-retry with exponential backoff
                        retryCountRef.current++;
                        const delay = 1000 * Math.pow(2, retryCountRef.current - 1); // 1s, 2s, 4s
                        setTimeout(() => {
                            if (window.turnstile && widgetIdRef.current) {
                                window.turnstile.reset(widgetIdRef.current);
                            }
                        }, delay);
                        setIsReady(false);
                    } else {
                        // All retries exhausted — degrade gracefully
                        // Honeypot + timing still protect; backend decides whether to accept
                        console.warn('[Turnstile] All retries exhausted — degrading gracefully. Honeypot + timing checks still active.');
                        degradedRef.current = true;
                        setIsReady(true); // Mark as "ready" so user can submit
                    }
                },
                'expired-callback': () => {
                    turnstileTokenRef.current = null;
                    setIsReady(false);
                    // Auto-reset on expiry so user doesn't get stuck
                    if (window.turnstile && widgetIdRef.current) {
                        window.turnstile.reset(widgetIdRef.current);
                    }
                },
                theme: 'auto',
                size: 'normal',
            });

            widgetIdRef.current = id;
        };

        tryRender();

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, []);

    const validate = useCallback((): ValidationResult => {
        // Layer 2: Honeypot check
        if (honeypotRef.current) {
            return { ok: false, reason: 'Spam detected.' };
        }

        // Layer 3: Timing check
        const elapsed = (Date.now() - mountTimeRef.current) / 1000;
        if (elapsed < MIN_FILL_TIME_SECONDS) {
            return { ok: false, reason: 'Please take a moment to fill out the form.' };
        }

        // Layer 1: Turnstile token
        // If we have a token, include it. If degraded (Turnstile failed), allow without token.
        if (!turnstileTokenRef.current && !degradedRef.current) {
            return { ok: false, reason: 'Security verification in progress. Please wait a moment and try again.' };
        }

        return { ok: true, turnstileToken: turnstileTokenRef.current ?? undefined };
    }, []);

    const resetProtection = useCallback(() => {
        turnstileTokenRef.current = null;
        degradedRef.current = false;
        retryCountRef.current = 0;
        setIsReady(false);
        mountTimeRef.current = Date.now();
        if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
        }
    }, []);

    const honeypotField = useMemo(() => {
        return createElement('div', null,
            // Honeypot — hidden from humans, bots fill it
            createElement('div', {
                'aria-hidden': 'true',
                style: {
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    opacity: 0,
                    height: 0,
                    overflow: 'hidden',
                    tabIndex: -1,
                },
            },
                createElement('label', { htmlFor: `${formId}-website` }, 'Website'),
                createElement('input', {
                    type: 'text',
                    id: `${formId}-website`,
                    name: 'website',
                    autoComplete: 'off',
                    tabIndex: -1,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        honeypotRef.current = e.target.value;
                    },
                }),
            ),
            // Turnstile managed widget container
            createElement('div', {
                ref: containerRef,
                id: `${formId}-turnstile`,
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '8px',
                },
            }),
        );
    }, [formId]);

    return { honeypotField, validate, isReady, reset: resetProtection };
}
