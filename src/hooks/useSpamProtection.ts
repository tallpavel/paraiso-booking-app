/**
 * Multi-layer spam & bot protection for forms.
 *
 * Layer 1 — Cloudflare Turnstile (invisible CAPTCHA)
 * Layer 2 — Honeypot field (hidden input bots fill automatically)
 * Layer 3 — Timing check (rejects submissions faster than a human could type)
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
// Replace with your real key from https://dash.cloudflare.com/turnstile
// Use '1x00000000000000000000AA' for testing (always passes)
const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';

// Minimum seconds before a form can be submitted (bots submit instantly)
const MIN_FILL_TIME_SECONDS = 3;

// ── Types ────────────────────────────────────────────────────────────
interface TurnstileAPI {
    render: (
        container: string | HTMLElement,
        opts: {
            sitekey: string;
            callback: (token: string) => void;
            'error-callback'?: () => void;
            'expired-callback'?: () => void;
            theme?: 'light' | 'dark' | 'auto';
            size?: 'normal' | 'compact' | 'invisible';
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
    /** Render this inside your form (invisible honeypot + Turnstile container) */
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
                }
                return;
            }

            // Don't re-render if already rendered
            if (widgetIdRef.current) return;

            const id = window.turnstile.render(containerRef.current, {
                sitekey: TURNSTILE_SITE_KEY,
                callback: (token: string) => {
                    turnstileTokenRef.current = token;
                    setIsReady(true);
                },
                'error-callback': () => {
                    turnstileTokenRef.current = null;
                    setIsReady(false);
                },
                'expired-callback': () => {
                    turnstileTokenRef.current = null;
                    setIsReady(false);
                },
                theme: 'auto',
                size: 'invisible',
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

        // Layer 1: Turnstile token check
        if (!turnstileTokenRef.current) {
            return { ok: false, reason: 'Security check not completed. Please wait a moment and try again.' };
        }

        return { ok: true, turnstileToken: turnstileTokenRef.current };
    }, []);

    const resetProtection = useCallback(() => {
        turnstileTokenRef.current = null;
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
            // Turnstile invisible container
            createElement('div', {
                ref: containerRef,
                id: `${formId}-turnstile`,
            }),
        );
    }, [formId]);

    return { honeypotField, validate, isReady, reset: resetProtection };
}
