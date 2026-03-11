import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n';

/* ─────────────────────────────────────────────────────────────────────
   CONFIGURATION — Replace these with your real Trustpilot values
   once you register at https://business.trustpilot.com
   ───────────────────────────────────────────────────────────────────── */
const TRUSTPILOT_URL = 'https://www.trustpilot.com/review/example.com';
const BUSINESS_UNIT_ID = '46a7e93b0000ff00059f3827'; // placeholder — replace with your real ID

/* ── Trustpilot Star (official green) ──────────────────────────────── */
function TrustpilotStar({ filled = true, size = 20 }: { filled?: boolean; size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect width="24" height="24" rx="2" fill={filled ? '#00b67a' : '#dcdce6'} />
            <path
                d="M12 16.77L15.09 18.5l-.81-3.52L17 12.51l-3.58-.31L12 9l-1.42 3.2L7 12.51l2.72 2.47-.81 3.52L12 16.77z"
                fill="#fff"
            />
        </svg>
    );
}

/* ── Trustpilot Logo ───────────────────────────────────────────────── */
function TrustpilotLogo({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Trustpilot">
            <g>
                <rect x="0" y="5" width="40" height="40" rx="4" fill="#00b67a" />
                <path
                    d="M20 33.54L27.27 37l-1.41-8.27L32 22.91l-8.36-.72L20 15l-3.64 7.19L8 22.91l6.14 5.82L12.73 37 20 33.54z"
                    fill="#fff"
                />
                <path d="M26.14 30.37l-.73-3.13L20 33.54l6.14-3.17z" fill="#005128" opacity="0.7" />
            </g>
            <g fill="#191919">
                <text x="48" y="34" fontFamily="Outfit, system-ui, sans-serif" fontSize="22" fontWeight="700" letterSpacing="-0.5">
                    Trustpilot
                </text>
            </g>
        </svg>
    );
}

/* ── Star Row ──────────────────────────────────────────────────────── */
function StarRow({ rating, size = 20 }: { rating: number; size?: number }) {
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <TrustpilotStar key={i} filled={i < rating} size={size} />
            ))}
        </div>
    );
}

/* ── TrustBox Widget Hook ──────────────────────────────────────────── */
interface WindowWithTrustpilot extends Window {
    Trustpilot?: {
        loadFromElement: (el: HTMLElement, reload?: boolean) => void;
    };
}

function useTrustpilotWidget(ref: React.RefObject<HTMLDivElement | null>) {
    useEffect(() => {
        // Load the Trustpilot bootstrap script once
        const scriptId = 'trustpilot-widget-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
            script.async = true;
            document.head.appendChild(script);
        }

        // When script loads, initialize the widget
        const init = () => {
            const tp = (window as WindowWithTrustpilot).Trustpilot;
            if (ref.current && tp) {
                tp.loadFromElement(ref.current, true);
            }
        };

        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
            existingScript.addEventListener('load', init);
        }
        // Try immediately in case script already loaded
        init();

        return () => {
            existingScript?.removeEventListener('load', init);
        };
    }, [ref]);
}

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export default function CustomerReviews() {
    const { t, locale } = useI18n();
    const widgetRef = useRef<HTMLDivElement>(null);
    useTrustpilotWidget(widgetRef);

    const localeMap: Record<string, string> = { en: 'en-GB', es: 'es-ES', cs: 'cs-CZ' };
    const tpLocale = localeMap[locale] || 'en-GB';

    return (
        <section id="reviews" className="bg-[#f7f5f0] py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-14 text-center">
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.15em] text-ocean">
                        {t('reviews.label')}
                    </span>
                    <h2 className="mb-6 font-heading text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                        {t('reviews.title')}
                    </h2>

                    {/* Trustpilot summary badge */}
                    <div className="mx-auto inline-flex flex-col items-center gap-3 rounded-2xl border border-[#e0ddd5] bg-white px-8 py-5 shadow-sm sm:flex-row sm:gap-5">
                        <a href={TRUSTPILOT_URL} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
                            <TrustpilotLogo className="h-8 w-auto sm:h-9" />
                        </a>
                        <div className="hidden h-8 w-px bg-[#e0ddd5] sm:block" />
                        <div className="flex flex-col items-center gap-1.5 sm:items-start">
                            <div className="flex items-center gap-2.5">
                                <StarRow rating={5} size={22} />
                            </div>
                            <p className="text-xs font-medium text-warm-gray">
                                <a
                                    href={TRUSTPILOT_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#00b67a] underline-offset-2 transition-colors hover:underline"
                                >
                                    {t('reviews.viewAll')}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Official Trustpilot TrustBox Widget ─────────────────────── */}
                <div
                    ref={widgetRef}
                    className="trustpilot-widget"
                    data-locale={tpLocale}
                    data-template-id="53aa8912dec7e10d38f59f36"  /* Carousel */
                    data-businessunit-id={BUSINESS_UNIT_ID}
                    data-style-height="140px"
                    data-style-width="100%"
                    data-theme="light"
                    data-stars="4,5"
                    data-review-languages={locale}
                >
                    {/* Fallback link shown while widget loads */}
                    <a
                        href={TRUSTPILOT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-warm-gray transition-colors hover:text-[#00b67a]"
                    >
                        {t('reviews.readMore')}
                    </a>
                </div>
            </div>

            {/* Trustpilot footer CTA */}
            <div className="mx-auto mt-12 max-w-7xl px-6 text-center">
                <a
                    href={TRUSTPILOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 rounded-full border border-[#e0ddd5] bg-white px-6 py-3 text-sm font-semibold text-navy shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00b67a]/30 hover:shadow-md"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="4" fill="#00b67a" />
                        <path
                            d="M12 16.77L15.09 18.5l-.81-3.52L17 12.51l-3.58-.31L12 9l-1.42 3.2L7 12.51l2.72 2.47-.81 3.52L12 16.77z"
                            fill="#fff"
                        />
                    </svg>
                    {t('reviews.readMore')}
                    <svg className="h-4 w-4 text-warm-gray transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#00b67a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </a>
            </div>
        </section>
    );
}
