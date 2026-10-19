"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { Playwrite_US_Modern } from "next/font/google";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Sign-in page, re-skinned to the header's tone: white canvas, the Playwrite
 * wordmark exactly as the header carries it, Airbnb-style bordered surfaces
 * and pills, and the blue accent the brand is built on.
 *
 * It is a client component behind <Suspense> because it reads
 * `useSearchParams` for the OAuth error and redirect, and it stays in step
 * with the site theme — light values first, `dark:` variants for the night
 * side — so nothing here is hardcoded to one mode.
 */

const playWrite = Playwrite_US_Modern({
  weight: ["400"],
});

const assurances = [
  {
    icon: ShieldCheck,
    title: "Verified server-side",
    detail: "Your Google token is checked before any session is created.",
  },
  {
    icon: Lock,
    title: "Sealed session",
    detail: "Stored in an http-only cookie that page scripts cannot read.",
  },
  {
    icon: KeyRound,
    title: "No password to leak",
    detail: "We never see, store, or handle your credentials.",
  },
];

/** The brand wordmark, identical to the one in the header. */
const Wordmark = ({ className = "" }: { className?: string }) => (
  <span
    className={`${playWrite.className} font-bold text-lg bg-linear-to-r from-gray-800 to-blue-600 dark:from-gray-100 dark:to-blue-200 bg-clip-text text-transparent ${className}`}
  >
    Safe Nest
  </span>
);

const GoogleMark = () => (
  <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.21 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.43l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LoginView = () => {
  const { loading, error, loginWithGoogle, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (user) {
      const redirectTarget = searchParams.get("redirect") || "/";
      router.replace(redirectTarget);
    }
  }, [user, router, searchParams]);

  const message = oauthError || error;

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200">
      {/* blue wash from above — the brand accent, kept very light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(37,99,235,0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_50%_-20%,rgba(37,99,235,0.18),transparent_65%)]"
      />
      {/* one soft corner glow for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 blur-3xl opacity-70 dark:from-blue-950/60 dark:to-sky-950/60"
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-12 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Brand panel */}
          <aside className="hidden lg:flex lg:flex-col lg:items-start">
            <Link
              href="/"
              className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <Wordmark className="text-base" />
            </Link>

            <h1 className="mt-7 text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Come on in
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
              Everything you keep in Safe Nest — your profile, your wallet, your
              preferences — sits behind one verified door. Here is what that door
              is made of.
            </p>

            <ul className="mt-8 space-y-4">
              {assurances.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* Sign-in card */}
          <main className="w-full max-w-md mx-auto">
            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 gap-0 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <CardContent className="p-7 sm:p-8">
                {/* Compact brand for small screens */}
                <div className="mb-7 text-center lg:text-left">
                  <div className="mb-5 flex justify-center lg:hidden">
                    <Link
                      href="/"
                      className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      <Wordmark />
                    </Link>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Sign in
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Use your Google account to reach your nest.
                  </p>
                </div>

                {message && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/60 dark:bg-blue-950/40"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {message}
                    </span>
                  </div>
                )}

                <Button
                  onClick={() => loginWithGoogle(searchParams.get("redirect") || "/")}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                  aria-busy={loading}
                  className="h-12 w-full rounded-full border-slate-300 bg-white text-base font-medium text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-md disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  <GoogleMark />
                  {loading ? "Authenticating…" : "Continue with Google"}
                </Button>

                <p className="mt-5 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                  We verify your identity with Google. Safe Nest never sees or
                  stores your password.
                </p>

                {/* Mobile-only assurances */}
                <ul className="mt-6 space-y-3 border-t border-slate-200 pt-6 dark:border-slate-700 lg:hidden">
                  {assurances.map((item) => (
                    <li key={item.title} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {item.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <Link
                  href="/info/privacy"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Privacy Policy
                </Link>
                <span aria-hidden="true">·</span>
                <Link
                  href="/info/terms"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Terms of Service
                </Link>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
              >
                <ArrowRight className="h-3 w-3" />
                Back to Safe Nest
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={null}>
    <LoginView />
  </Suspense>
);

export default Page;
