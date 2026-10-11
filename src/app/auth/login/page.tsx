"use client";

import React, { Suspense, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowRight, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const stars = [
  { top: '9%', left: '8%' },
  { top: '16%', left: '21%' },
  { top: '6%', left: '35%' },
  { top: '22%', left: '48%' },
  { top: '12%', left: '62%' },
  { top: '25%', left: '74%' },
  { top: '8%', left: '86%' },
  { top: '34%', left: '14%' },
  { top: '44%', left: '30%' },
  { top: '38%', left: '57%' },
  { top: '52%', left: '80%' },
  { top: '60%', left: '6%' },
  { top: '66%', left: '42%' },
  { top: '58%', left: '94%' },
];

const embers = [
  { bottom: '10%', left: '14%', delay: '0s' },
  { bottom: '6%', left: '38%', delay: '2.1s' },
  { bottom: '12%', left: '62%', delay: '3.6s' },
  { bottom: '5%', left: '86%', delay: '1.4s' },
];

const assurances = [
  {
    icon: ShieldCheck,
    title: 'Verified server-side',
    detail: 'Your Google token is checked before any session is created.',
  },
  {
    icon: Lock,
    title: 'Sealed session',
    detail: 'Stored in an http-only cookie that page scripts cannot read.',
  },
  {
    icon: KeyRound,
    title: 'No password to leak',
    detail: 'We never see, store, or handle your credentials.',
  },
];

const GoogleMark = () => (
  <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LoginView = () => {
  const { loading, error, loginWithGoogle, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');

  useEffect(() => {
    if (user) {
      const redirectTarget = searchParams.get('redirect') || '/';
      router.replace(redirectTarget);
    }
  }, [user, router, searchParams]);

  const message = oauthError || error;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04080f] text-slate-200 flex items-center justify-center p-4 sm:p-6">
      {/* hearth glow rising from below */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(251,191,36,0.30),transparent_58%)]" />
      {/* calm night above */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_-10%,rgba(15,42,58,0.95),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,rgba(45,212,191,0.14),transparent_55%)]" />

      {/* night sky */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {stars.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: star.top,
              left: star.left,
              width: 2,
              height: 2,
              animationDelay: `${(i % 7) * 0.6}s`,
              boxShadow: '0 0 6px rgba(255,255,255,0.75)',
            }}
          />
        ))}
      </div>

      {/* drifting mist */}
      <div
        className="pointer-events-none absolute -left-1/4 bottom-0 h-64 w-[150%] rounded-full bg-teal-500/10 blur-3xl animate-drift"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-1/4 top-1/4 h-56 w-[130%] rounded-full bg-white/[0.04] blur-3xl animate-drift"
        style={{ animationDelay: '7s' }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Brand panel */}
        <aside className="hidden lg:flex flex-col items-start">
          <div className="relative mb-7" aria-hidden="true">
            <div className="absolute -inset-6 bg-amber-400/20 blur-2xl rounded-full animate-glow-breathe" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-amber-200/30 bg-gradient-to-b from-amber-400/20 to-transparent shadow-[inset_0_0_30px_rgba(251,191,36,0.25)]">
              <ShieldCheck className="h-7 w-7 text-amber-100" />
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.35em] text-teal-300/70">safe nest</p>
          <h1 className="mt-3 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-teal-100 to-sky-100">
            Come on in
          </h1>
          <p className="mt-4 max-w-sm text-slate-400 text-sm leading-6">
            Everything you keep in Safe Nest — your profile, your wallet, your
            preferences — sits behind one verified door. Here is what that door
            is made of.
          </p>

          <ul className="mt-9 space-y-5">
            {assurances.map((item) => (
              <li key={item.title} className="flex gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <item.icon className="h-4 w-4 text-teal-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Sign-in card */}
        <main className="w-full max-w-md mx-auto">
          <Card className="overflow-hidden border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent" />
            <CardContent className="p-7 sm:p-8">
              {/* Compact brand for small screens */}
              <div className="mb-7 text-center lg:text-left">
                <div className="mb-5 inline-flex lg:hidden">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-amber-500 rounded-full blur-lg opacity-40" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/30 bg-white/5">
                      <ShieldCheck className="h-6 w-6 text-amber-100" />
                    </div>
                  </div>
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-teal-300/70">safe nest</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-50">Sign in</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Use your Google account to reach your nest.
                </p>
              </div>

              {message && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-400/30 bg-red-500/10 p-3"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                  <span className="text-sm text-red-200">{message}</span>
                </div>
              )}

              <Button
                onClick={() => loginWithGoogle(searchParams.get('redirect') || '/')}
                disabled={loading}
                variant="outline"
                size="lg"
                aria-busy={loading}
                className="h-12 w-full rounded-xl border-white/15 bg-white text-base font-medium transition-all duration-200 hover:bg-slate-100 hover:border-white/25 disabled:opacity-60"
              >
                <GoogleMark />
                {loading ? 'Authenticating…' : 'Continue with Google'}
              </Button>

              <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                We verify your identity with Google. Safe Nest never sees or
                stores your password.
              </p>

              {/* Mobile-only assurances */}
              <ul className="mt-6 space-y-3 border-t border-white/10 pt-6 lg:hidden">
                {assurances.map((item) => (
                  <li key={item.title} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0 text-teal-300" />
                    <span className="text-xs text-slate-400">{item.title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <Link href="/info/privacy" className="transition-colors hover:text-teal-300">
                Privacy Policy
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/info/terms" className="transition-colors hover:text-teal-300">
                Terms of Service
              </Link>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-amber-200"
            >
              <ArrowRight className="h-3 w-3" />
              Back to Safe Nest
            </Link>
          </div>
        </main>
      </div>

      {/* rising embers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {embers.map((ember, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-amber-400/80 animate-rise"
            style={{
              bottom: ember.bottom,
              left: ember.left,
              animationDelay: ember.delay,
              boxShadow: '0 0 8px rgba(251,191,36,0.9)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

const Page = () => (
  <Suspense fallback={null}>
    <LoginView />
  </Suspense>
)

export default Page
