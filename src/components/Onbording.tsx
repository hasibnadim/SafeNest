'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, LogOut, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OnboardingProps {
    phone?: boolean;
}

function isValidPhoneNumber(value: string) {
    const phone = value.trim();

    // Accept a leading international '+' and common visual separators only.
    if (!/^\+?[0-9][0-9\s().-]*[0-9]$/.test(phone)) return false;

    const digitCount = phone.replace(/\D/g, '').length;
    if (digitCount < 7 || digitCount > 15) return false;

    const openParentheses = [...phone].filter((character) => character === '(').length;
    const closeParentheses = [...phone].filter((character) => character === ')').length;
    if (openParentheses !== closeParentheses || openParentheses > 1) return false;

    if (openParentheses === 1) {
        const openIndex = phone.indexOf('(');
        const closeIndex = phone.indexOf(')');
        if (
            closeIndex <= openIndex ||
            !/^\d+$/.test(phone.slice(openIndex + 1, closeIndex))
        ) {
            return false;
        }
    }

    return true;
}

export function Onboarding({ phone }: OnboardingProps) {
    const { user, logout, updatePhone } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const phoneIsInvalid = phoneNumber.trim() !== '' && !isValidPhoneNumber(phoneNumber);
    const validationMessage = phoneIsInvalid
        ? 'Enter a valid phone number using 7–15 digits.'
        : '';
    const displayedError = error || validationMessage;

    if (!phone) return null;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = phoneNumber.trim();

        if (!isValidPhoneNumber(value)) {
            setError('Enter a valid phone number (7–15 digits).');
            return;
        }

        setSaving(true);
        setError('');
        try {
            await updatePhone(value);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Could not save your phone number. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="w-full max-w-md px-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950 sm:p-8">
                <header className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Signed in'}
                        </p>
                        <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                            {user?.email}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void logout()}
                        className="shrink-0"
                    >
                        <LogOut aria-hidden="true" />
                        Log out
                    </Button>
                </header>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    <Phone aria-hidden="true" className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    Add your phone number
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    A phone number is needed to continue. You can update it later from your
                    profile.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="onboarding-phone"
                            className="text-sm font-medium text-slate-800 dark:text-slate-200"
                        >
                            Phone number
                        </label>
                        <Input
                            id="onboarding-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            inputMode="tel"
                            placeholder="e.g. +88 01011 000011"
                            value={phoneNumber}
                            onChange={(event) => {
                                setPhoneNumber(event.target.value);
                                if (error) setError('');
                            }}
                            aria-invalid={Boolean(displayedError)}
                            aria-describedby={displayedError ? 'onboarding-phone-error' : undefined}
                            required
                            disabled={saving}
                            className="h-11"
                        />
                        {displayedError && (
                            <p
                                id="onboarding-phone-error"
                                role="alert"
                                className="text-sm text-red-600 dark:text-red-400"
                            >
                                {displayedError}
                            </p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={saving}>
                        {saving && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
                        {saving ? 'Saving…' : 'Save phone number'}
                    </Button>
                </form>
            </section>
        </main>
    );
}