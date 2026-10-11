import { createRemoteJWKSet, jwtVerify } from 'jose';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const SCOPE = 'openid email profile';

const jwks = createRemoteJWKSet(new URL(JWKS_URI));

export interface GoogleIdentity {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string;
  photoURL: string;
}

export function assertGoogleOAuthConfigured(): void {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error(
      'Google OAuth is not configured. Set NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
    );
  }
}

/**
 * The redirect URI is derived from the incoming request so the same build works
 * on localhost and on the deployed host. It must be registered as an authorized
 * redirect URI in the Google Cloud console.
 */
export function getRedirectUri(origin: string): string {
  return new URL('/auth/callback', origin).toString();
}

export function buildGoogleAuthUrl(origin: string, state: string): string {
  assertGoogleOAuthConfigured();

  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set('client_id', GOOGLE_CLIENT_ID as string);
  url.searchParams.set('redirect_uri', getRedirectUri(origin));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', SCOPE);
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

/** Exchange the one-time authorization code for a Google ID token. */
async function exchangeCodeForIdToken(code: string, origin: string): Promise<string> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID as string,
      client_secret: GOOGLE_CLIENT_SECRET as string,
      redirect_uri: getRedirectUri(origin),
      grant_type: 'authorization_code',
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { id_token?: string };
  if (!payload.id_token) {
    throw new Error('Google token exchange returned no id_token');
  }
  return payload.id_token;
}

/**
 * Verifies the signature, issuer and audience of a Google ID token against
 * Google's published JWKS, then maps the claims onto our user shape.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  assertGoogleOAuthConfigured();

  const { payload } = await jwtVerify(idToken, jwks, {
    audience: GOOGLE_CLIENT_ID,
    issuer: ISSUERS,
  });

  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('Google ID token is missing the subject claim');
  }
  if (typeof payload.email !== 'string' || !payload.email) {
    throw new Error('Google ID token is missing the email claim');
  }
  if (payload.email_verified !== true) {
    throw new Error('Google account email is not verified');
  }

  return {
    uid: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: true,
    name: typeof payload.name === 'string' ? payload.name : '',
    photoURL: typeof payload.picture === 'string' ? payload.picture : '',
  };
}

export async function authenticateGoogleCode(code: string, origin: string): Promise<GoogleIdentity> {
  const idToken = await exchangeCodeForIdToken(code, origin);
  return verifyGoogleIdToken(idToken);
}
