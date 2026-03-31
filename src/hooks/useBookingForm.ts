import { useState, useCallback } from 'react';
import { guessCountry } from '../components/PhoneInput';
import { createReservation } from '../api';
import { useSpamProtection } from './useSpamProtection';
import { useI18n } from '../i18n';
import { toDateKey } from './useBookingData';
import type { StayPricing } from './useBookingPricing';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';

export interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    dates?: string;
}

export type BookingStatus = 'idle' | 'sending' | 'sent' | 'error';

interface UseBookingFormParams {
    checkIn: Date | null;
    checkOut: Date | null;
    pricing: StayPricing | null;
    datesValid: boolean;
    locale: string;
    fpRef: React.RefObject<FlatpickrInstance | null>;
    refreshBookedDates: () => Promise<void>;
}

export interface BookingFormResult {
    // ── Guest state ─────────────────────────────────────────────────
    guests: number;
    setGuests: (n: number) => void;
    guestName: string;
    setGuestName: (v: string) => void;
    guestEmail: string;
    setGuestEmail: (v: string) => void;
    guestPhone: string;
    setGuestPhone: (v: string) => void;
    dialCode: string;
    setDialCode: (v: string) => void;
    comment: string;
    setComment: (v: string) => void;
    gdprConsent: boolean;
    setGdprConsent: (v: boolean) => void;
    termsConsent: boolean;
    setTermsConsent: (v: boolean) => void;
    preferredPaymentMethod: 'stripe' | 'paypal';
    setPreferredPaymentMethod: (v: 'stripe' | 'paypal') => void;

    // ── Validation & status ─────────────────────────────────────────
    errors: FormErrors;
    setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
    status: BookingStatus;
    serverError: string;
    spam: ReturnType<typeof useSpamProtection>;

    // ── Actions ─────────────────────────────────────────────────────
    validateDetails: () => FormErrors;
    handleFieldChange: (field: keyof FormErrors) => void;
    handleSubmit: () => Promise<void>;
    closeConfirmation: () => void;

    // ── Wizard ──────────────────────────────────────────────────────
    step: number;
    setStep: (n: number) => void;
    goNext: () => void;
    goBack: () => void;
}

/**
 * Manages all guest-form state, multi-step wizard navigation,
 * validation, spam protection, and submission.
 */
export function useBookingForm({
    checkIn,
    checkOut,
    pricing,
    datesValid,
    locale,
    fpRef,
    refreshBookedDates,
}: UseBookingFormParams): BookingFormResult {
    const { t } = useI18n();

    // ── Wizard step (1 = dates, 2 = details, 3 = payment, 4 = confirm) ──
    const [step, setStep] = useState(1);
    const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

    // ── Guest details ────────────────────────────────────────────────
    const [guests, setGuests] = useState(2);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [dialCode, setDialCode] = useState(() => guessCountry().dial);
    const [comment, setComment] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [status, setStatus] = useState<BookingStatus>('idle');
    const [serverError, setServerError] = useState('');
    const [gdprConsent, setGdprConsent] = useState(false);
    const [termsConsent, setTermsConsent] = useState(false);
    const spam = useSpamProtection('booking-form');

    // ── Validation (step 2) ──────────────────────────────────────────
    const validateDetails = (): FormErrors => {
        const errs: FormErrors = {};
        if (!guestName.trim()) {
            errs.name = t('booking.errorName');
        } else if (guestName.trim().length < 2) {
            errs.name = t('booking.errorNameInvalid');
        } else if (/\d/.test(guestName)) {
            errs.name = t('booking.errorNameInvalid');
        } else if (!/^[\p{L}\s'\-\.]+$/u.test(guestName.trim())) {
            errs.name = t('booking.errorNameInvalid');
        }
        if (!guestEmail.trim()) {
            errs.email = t('booking.errorEmail');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
            errs.email = t('booking.errorEmailInvalid');
        }
        const fullPhone = `${dialCode} ${guestPhone}`.trim();
        if (!guestPhone.trim()) {
            errs.phone = t('booking.errorPhone');
        } else if (!/^[\d\s\-()]{4,18}$/.test(guestPhone.trim()) || guestPhone.replace(/\D/g, '').length < 4) {
            errs.phone = t('booking.errorPhoneInvalid');
        } else if (fullPhone.replace(/\D/g, '').length < 6) {
            errs.phone = t('booking.errorPhoneInvalid');
        }
        return errs;
    };

    const handleFieldChange = (field: keyof FormErrors) => {
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // ── Step navigation ──────────────────────────────────────────────
    const goNext = () => {
        if (step === 1) {
            if (!datesValid) return;
            setStep(2);
        } else if (step === 2) {
            const errs = validateDetails();
            if (Object.keys(errs).length > 0) {
                setErrors(errs);
                return;
            }
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        }
    };

    const goBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const closeConfirmation = useCallback(() => {
        window.dispatchEvent(new CustomEvent('close-booking'));
        window.scrollTo({ top: 0, behavior: 'instant' });
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
        setDialCode(guessCountry().dial);
        setComment('');
        setPreferredPaymentMethod('stripe');
        setGuests(2);
        setStep(1);
        setStatus('idle');
        setGdprConsent(false);
        setTermsConsent(false);
        fpRef.current?.clear();
        refreshBookedDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fpRef, refreshBookedDates]);

    // ── Submit ───────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const spamCheck = spam.validate();
        if (!spamCheck.ok) {
            if (!spam.isReady) {
                spam.reset();
            }
            setStatus('error');
            setServerError(spamCheck.reason || 'Security check failed.');
            setTimeout(() => setStatus('idle'), 8000);
            return;
        }

        setStatus('sending');
        setServerError('');

        try {
            await createReservation({
                guestName: guestName.trim(),
                guestEmail: guestEmail.trim(),
                guestPhone: `${dialCode} ${guestPhone.trim()}`,
                checkIn: toDateKey(checkIn!),
                checkOut: toDateKey(checkOut!),
                nights: pricing!.nights,
                totalPrice: pricing!.total,
                comment: comment.trim() || undefined,
                locale,
                turnstileToken: spamCheck.turnstileToken,
                preferredPaymentMethod,
            });

            setStatus('sent');
            spam.reset();
        } catch (err: unknown) {
            setStatus('error');
            const apiErr = err as { message?: string; errors?: string[] };
            const errorMsg = apiErr?.errors?.join(', ') || apiErr?.message || t('booking.errorServer');

            if (errorMsg.toLowerCase().includes('security') || errorMsg.toLowerCase().includes('verification')) {
                spam.reset();
            }

            setServerError(errorMsg);
            setTimeout(() => setStatus('idle'), 8000);
        }
    };

    return {
        guests, setGuests,
        guestName, setGuestName,
        guestEmail, setGuestEmail,
        guestPhone, setGuestPhone,
        dialCode, setDialCode,
        comment, setComment,
        gdprConsent, setGdprConsent,
        termsConsent, setTermsConsent,
        preferredPaymentMethod, setPreferredPaymentMethod,
        errors, setErrors,
        status, serverError,
        spam,
        validateDetails,
        handleFieldChange,
        handleSubmit,
        closeConfirmation,
        step, setStep,
        goNext, goBack,
    };
}
