import { useState, useRef, useEffect, useCallback } from 'react';

// ── Country data: ISO code, name, dial code ──────────────────────────
// Curated list of ~50 most common countries for a holiday rental site,
// ordered roughly by likelihood for a Tenerife-based property.
export interface Country {
    code: string;   // ISO 3166-1 alpha-2
    name: string;
    dial: string;
}

const COUNTRIES: Country[] = [
    { code: 'ES', name: 'España', dial: '+34' },
    { code: 'GB', name: 'United Kingdom', dial: '+44' },
    { code: 'DE', name: 'Deutschland', dial: '+49' },
    { code: 'FR', name: 'France', dial: '+33' },
    { code: 'IT', name: 'Italia', dial: '+39' },
    { code: 'NL', name: 'Nederland', dial: '+31' },
    { code: 'BE', name: 'België', dial: '+32' },
    { code: 'PT', name: 'Portugal', dial: '+351' },
    { code: 'IE', name: 'Ireland', dial: '+353' },
    { code: 'AT', name: 'Österreich', dial: '+43' },
    { code: 'CH', name: 'Schweiz', dial: '+41' },
    { code: 'SE', name: 'Sverige', dial: '+46' },
    { code: 'NO', name: 'Norge', dial: '+47' },
    { code: 'DK', name: 'Danmark', dial: '+45' },
    { code: 'FI', name: 'Suomi', dial: '+358' },
    { code: 'PL', name: 'Polska', dial: '+48' },
    { code: 'CZ', name: 'Česko', dial: '+420' },
    { code: 'SK', name: 'Slovensko', dial: '+421' },
    { code: 'HU', name: 'Magyarország', dial: '+36' },
    { code: 'RO', name: 'România', dial: '+40' },
    { code: 'HR', name: 'Hrvatska', dial: '+385' },
    { code: 'SI', name: 'Slovenija', dial: '+386' },
    { code: 'GR', name: 'Ελλάδα', dial: '+30' },
    { code: 'BG', name: 'България', dial: '+359' },
    { code: 'LT', name: 'Lietuva', dial: '+370' },
    { code: 'LV', name: 'Latvija', dial: '+371' },
    { code: 'EE', name: 'Eesti', dial: '+372' },
    { code: 'US', name: 'United States', dial: '+1' },
    { code: 'CA', name: 'Canada', dial: '+1' },
    { code: 'AU', name: 'Australia', dial: '+61' },
    { code: 'NZ', name: 'New Zealand', dial: '+64' },
    { code: 'RU', name: 'Россия', dial: '+7' },
    { code: 'UA', name: 'Україна', dial: '+380' },
    { code: 'TR', name: 'Türkiye', dial: '+90' },
    { code: 'IL', name: 'ישראל', dial: '+972' },
    { code: 'MA', name: 'المغرب', dial: '+212' },
    { code: 'BR', name: 'Brasil', dial: '+55' },
    { code: 'MX', name: 'México', dial: '+52' },
    { code: 'AR', name: 'Argentina', dial: '+54' },
    { code: 'CO', name: 'Colombia', dial: '+57' },
    { code: 'CL', name: 'Chile', dial: '+56' },
    { code: 'JP', name: '日本', dial: '+81' },
    { code: 'KR', name: '한국', dial: '+82' },
    { code: 'CN', name: '中国', dial: '+86' },
    { code: 'IN', name: 'India', dial: '+91' },
    { code: 'ZA', name: 'South Africa', dial: '+27' },
    { code: 'SA', name: 'السعودية', dial: '+966' },
    { code: 'AE', name: 'الإمارات', dial: '+971' },
    { code: 'SG', name: 'Singapore', dial: '+65' },
    { code: 'LU', name: 'Luxembourg', dial: '+352' },
];

// ── SVG Flag component — renders flat, rectangular flags via flagcdn.com ──
// Consistent rendering across all devices (no platform-dependent emoji)
function CountryFlag({ code, className = '' }: { code: string; className?: string }) {
    return (
        <img
            src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
            alt={code}
            className={`phone-flag-img ${className}`}
            loading="lazy"
            draggable={false}
        />
    );
}

// Guess initial country from browser locale (sync, instant)
function guessCountry(): Country {
    // Use cached geo result if available
    if (_geoCountry) return _geoCountry;
    try {
        const lang = navigator.language || '';
        // Check region first (en-GB → GB, es-ES → ES)
        const region = lang.split('-')[1]?.toUpperCase();
        if (region) {
            const match = COUNTRIES.find(c => c.code === region);
            if (match) return match;
        }
        // Fall back to language (es → ES, de → DE)
        const langCode = lang.split('-')[0].toUpperCase();
        const langMap: Record<string, string> = {
            ES: 'ES', EN: 'GB', DE: 'DE', FR: 'FR', IT: 'IT',
            NL: 'NL', PT: 'PT', PL: 'PL', CS: 'CZ', SK: 'SK',
            HU: 'HU', RO: 'RO', HR: 'HR', SV: 'SE', NO: 'NO',
            DA: 'DK', FI: 'FI', EL: 'GR', BG: 'BG', TR: 'TR',
            RU: 'RU', UK: 'UA', JA: 'JP', KO: 'KR', ZH: 'CN',
        };
        const mapped = langMap[langCode];
        if (mapped) {
            const match = COUNTRIES.find(c => c.code === mapped);
            if (match) return match;
        }
    } catch { /* fallback */ }
    return COUNTRIES[0]; // Spain
}

// ── IP-based geolocation (async, cached per session) ─────────────────
// Uses api.country.is — free, HTTPS, no API key, returns {country:"ES"}
let _geoCountry: Country | null = null;
let _geoPromise: Promise<Country | null> | null = null;

function detectCountryByIP(): Promise<Country | null> {
    if (_geoCountry) return Promise.resolve(_geoCountry);
    if (_geoPromise) return _geoPromise;

    _geoPromise = fetch('https://api.country.is/', { signal: AbortSignal.timeout(3000) })
        .then(res => res.json())
        .then((data: { country?: string }) => {
            const code = data.country?.toUpperCase();
            if (code) {
                const match = COUNTRIES.find(c => c.code === code);
                if (match) {
                    _geoCountry = match;
                    return match;
                }
            }
            return null;
        })
        .catch(() => null);

    return _geoPromise;
}

interface PhoneInputProps {
    id: string;
    value: string;            // The local number (without dial code)
    dialCode: string;         // The dial code e.g. "+34"
    onChangeNumber: (num: string) => void;
    onChangeDialCode: (dial: string) => void;
    placeholder?: string;
    hasError?: boolean;
    autoComplete?: string;
}

export default function PhoneInput({
    id,
    value,
    dialCode,
    onChangeNumber,
    onChangeDialCode,
    placeholder = '',
    hasError = false,
    autoComplete = 'tel-national',
}: PhoneInputProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightIdx, setHighlightIdx] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const initialDialRef = useRef(dialCode); // track if user manually changed it

    // Auto-detect country from IP on mount (updates only if user hasn't changed dial code)
    useEffect(() => {
        detectCountryByIP().then(geo => {
            if (geo && initialDialRef.current === dialCode && !value.trim()) {
                onChangeDialCode(geo.dial);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Find current country
    const selected = COUNTRIES.find(c => c.dial === dialCode) ?? COUNTRIES[0];

    // Filter countries
    const filtered = search.trim()
        ? COUNTRIES.filter(c => {
            const q = search.toLowerCase();
            return (
                c.name.toLowerCase().includes(q) ||
                c.dial.includes(q) ||
                c.code.toLowerCase().includes(q)
            );
        })
        : COUNTRIES;

    // Reset highlight when search changes
    useEffect(() => { setHighlightIdx(0); }, [search]);

    // Auto-focus search when dropdown opens
    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => searchRef.current?.focus());
        } else {
            setSearch('');
        }
    }, [open]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (!open || !listRef.current) return;
        const item = listRef.current.children[highlightIdx] as HTMLElement | undefined;
        item?.scrollIntoView({ block: 'nearest' });
    }, [highlightIdx, open]);

    const selectCountry = useCallback((c: Country) => {
        onChangeDialCode(c.dial);
        setOpen(false);
        // Focus the phone number input after selection
        requestAnimationFrame(() => {
            document.getElementById(id)?.focus();
        });
    }, [onChangeDialCode, id]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIdx(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIdx(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[highlightIdx]) selectCountry(filtered[highlightIdx]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="phone-input-wrapper">
            <div className={`phone-input-container ${hasError ? 'phone-input-container--error' : ''}`}>
                {/* Country selector button */}
                <button
                    type="button"
                    className="phone-input-selector"
                    onClick={() => setOpen(!open)}
                    aria-label="Select country code"
                    aria-expanded={open}
                    tabIndex={0}
                >
                    <CountryFlag code={selected.code} />
                    <span className="phone-input-dial">{selected.dial}</span>
                    <svg
                        className={`phone-input-chevron ${open ? 'phone-input-chevron--open' : ''}`}
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                    >
                        <path
                            d="M1 1l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {/* Divider */}
                <div className="phone-input-divider" />

                {/* Number input */}
                <input
                    type="tel"
                    id={id}
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value.replace(/[^\d\s\-()]/g, '');
                        onChangeNumber(v);
                    }}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className="phone-input-field"
                />
            </div>

            {/* Dropdown + backdrop */}
            {open && (
                <>
                    <div className="phone-dropdown-backdrop" onClick={() => setOpen(false)} />
                    <div className="phone-dropdown" onKeyDown={handleKeyDown}>
                        {/* Drag handle for mobile bottom-sheet */}
                        <div className="phone-dropdown-handle">
                            <div className="phone-dropdown-handle-bar" />
                        </div>
                        {/* Search */}
                        <div className="phone-dropdown-search-wrap">
                            <svg className="phone-dropdown-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.3-4.3" />
                            </svg>
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="phone-dropdown-search"
                                placeholder="Search…"
                                aria-label="Search countries"
                            />
                        </div>

                        {/* List */}
                        <div ref={listRef} className="phone-dropdown-list" role="listbox">
                            {filtered.length === 0 && (
                                <div className="phone-dropdown-empty">No results</div>
                            )}
                            {filtered.map((c, i) => (
                                <button
                                    key={c.code}
                                    type="button"
                                    role="option"
                                    aria-selected={c.dial === dialCode}
                                    className={`phone-dropdown-option ${i === highlightIdx ? 'phone-dropdown-option--highlight' : ''} ${c.dial === dialCode ? 'phone-dropdown-option--active' : ''}`}
                                    onClick={() => selectCountry(c)}
                                    onMouseEnter={() => setHighlightIdx(i)}
                                >
                                    <CountryFlag code={c.code} />
                                    <span className="phone-dropdown-option-name">{c.name}</span>
                                    <span className="phone-dropdown-option-dial">{c.dial}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export { COUNTRIES, guessCountry };
