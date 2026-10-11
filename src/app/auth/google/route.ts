import { randomBytes } from 'node:crypto';

import { NextRequest, NextResponse } from 'next/server';

import { buildGoogleAuthUrl } from '@/lib/google-oauth';

const STATE_COOKIE_NAME = 'google-oauth-state';
const REDIRECT_COOKIE_NAME = 'safe-nest-return';
const STATE_MAX_AGE_SECONDS = 10 * 60;

export async function GET(request: NextRequest) {
  const state = randomBytes(32).toString('hex');
  const redirectTarget = request.nextUrl.searchParams.get('redirect') || '/';
  const authUrl = buildGoogleAuthUrl(request.nextUrl.origin, state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STATE_MAX_AGE_SECONDS,
    path: '/auth',
  });
  response.cookies.set(REDIRECT_COOKIE_NAME, redirectTarget, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STATE_MAX_AGE_SECONDS,
    path: '/auth',
  });
  return response;
}
