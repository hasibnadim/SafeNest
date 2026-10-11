import { SignJWT, jwtVerify } from 'jose';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SessionData, UserAccount } from './interface';
import db, { CName } from '../mongodb';

// Session configuration
const SESSION_COOKIE_NAME = 'baw-cookie';
const SESSION_SECRET = process.env.SESSION_SECRET;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Refuse to mint or trust sessions without a real secret. A hardcoded fallback
// would let anyone forge a session cookie.
if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set. Sessions cannot be created or verified.');
}

// Encode JWT secret
const secretKey = new TextEncoder().encode(SESSION_SECRET);


/**
 * Create a new session token
 */
export async function createSession(uid: string, email: string): Promise<string> {
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION;

  const payload: SessionData = {
    uid,
    email,
    createdAt: now,
    expiresAt
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now / 1000)
    .setExpirationTime(expiresAt / 1000)
    .sign(secretKey);

  return token;
}

/**
 * Verify and decode a session token
 */
export async function verifySession(token: string | ReadonlyRequestCookies): Promise<SessionData | null> {
  try {
    if (typeof token !== 'string') {
      token = token.get(SESSION_COOKIE_NAME)?.value || '';
    }
    const { payload } = await jwtVerify(token, secretKey);

    const sessionData = payload as unknown as SessionData;

    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

/**
 * Set session cookie in response
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/'
  });
}

/**
 * Get session from request cookies
 */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionData | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return await verifySession(token);
}

/**
 * Get session from server-side cookies
 */
export async function getSessionFromCookies(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return await verifySession(token);
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
}

/**
 * Refresh session (extend expiration)
 */
export async function refreshSession(token: string): Promise<string | null> {
  const sessionData = await verifySession(token);

  if (!sessionData) {
    return null;
  }

  // Create new session with extended expiration
  return await createSession(sessionData.uid, sessionData.email);
}

export async function getAuthUser(
  request: NextRequest | ReadonlyRequestCookies | { get?: (name: string) => { value?: string } | undefined },
) {
  const cookieLike = request as { get?: (name: string) => { value?: string } | undefined } | null;

  if (request instanceof Request) {
    const session = await getSessionFromRequest(request);
    if (!session) return null;
    const res = await db.collection<UserAccount>(CName.User).findOne({ uid: session.uid });
    return res;
  } else {
    const token = cookieLike?.get?.(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const session = await verifySession(token);
    if (!session) return null;
    const res = await db.collection<UserAccount>(CName.User).findOne({ uid: session.uid });
    return res;
  }
}