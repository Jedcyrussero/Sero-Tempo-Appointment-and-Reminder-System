import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { getGoogleOAuthConfig, GOOGLE_OAUTH_STATE_COOKIE } from '@/lib/google';

export async function GET(req: NextRequest) {
  const { config, missing } = getGoogleOAuthConfig(req.url);

  if (!config) {
    console.error(`Google OAuth is not configured. Missing: ${missing.join(', ')}`);
    return NextResponse.redirect(new URL('/login?error=google_not_configured', req.url));
  }

  const state = randomBytes(32).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
