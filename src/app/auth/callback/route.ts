import { NextRequest, NextResponse } from 'next/server';

import { authenticateGoogleCode } from '@/lib/google-oauth';
import { createSession, setSessionCookie } from '@/services/auth/session';
import { upsertUserFromGoogle } from '@/services/auth/user';

const STATE_COOKIE_NAME = 'google-oauth-state';
const REDIRECT_COOKIE_NAME = 'safe-nest-return';

function clearStateCookie(response: NextResponse) {
  response.cookies.set(STATE_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/auth',
  });
  response.cookies.set(REDIRECT_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/auth',
  });
}

function redirectWithError(request: NextRequest, reason: string) {
  const response = NextResponse.redirect(
    new URL(`/auth/login?error=${encodeURIComponent(reason)}`, request.nextUrl.origin)
  );
  clearStateCookie(response);
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const expectedState = request.cookies.get(STATE_COOKIE_NAME)?.value;

  if (searchParams.get('error')) {
    return redirectWithError(request, 'Google sign-in was cancelled.');
  }

  // CSRF protection: the state we issued must come back untouched.
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithError(request, 'Invalid or expired sign-in request.');
  }

  try {
    const identity = await authenticateGoogleCode(code, request.nextUrl.origin);
    const userProfile = await upsertUserFromGoogle(identity);
    const sessionToken = await createSession(userProfile.uid, identity.email);
    const returnPath = request.cookies.get(REDIRECT_COOKIE_NAME)?.value || '/';

    const response = NextResponse.redirect(
      new URL(returnPath.startsWith('/') ? returnPath : '/', request.nextUrl.origin)
    );
    setSessionCookie(response, sessionToken);
    clearStateCookie(response);
    return response;
  } catch (error) {
    console.error('Google OAuth callback failed:', error);
    return redirectWithError(request, 'Google sign-in failed. Please try again.');
  }
}
