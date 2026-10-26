import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';
import {
  getGoogleOAuthConfig,
  GOOGLE_OAUTH_STATE_COOKIE,
  oauthStatesMatch,
} from '@/lib/google';
import { getDashboardPath } from '@/lib/roles';
import { findUserByEmail } from '@/lib/users';

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleProfile {
  email?: string;
  email_verified?: boolean;
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const oauthError = url.searchParams.get('error');
    const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

    cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);

    if (oauthError) {
      return NextResponse.redirect(new URL('/login?error=google_cancelled', req.url));
    }

    if (!code || !oauthStatesMatch(state, expectedState)) {
      return NextResponse.redirect(new URL('/login?error=google_state', req.url));
    }

    const { config, missing } = getGoogleOAuthConfig(req.url);
    if (!config) {
      console.error(`Google OAuth callback is not configured. Missing: ${missing.join(', ')}`);
      return NextResponse.redirect(new URL('/login?error=google_not_configured', req.url));
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenData.access_token) {
      const googleError = tokenData.error || '';
      console.error(
        'Google token exchange failed:',
        googleError || tokenResponse.status,
        tokenData.error_description || ''
      );

      if (googleError === 'redirect_uri_mismatch') {
        return NextResponse.redirect(
          new URL('/login?error=google_redirect_mismatch', req.url)
        );
      }

      if (googleError === 'invalid_client' || googleError === 'unauthorized_client') {
        return NextResponse.redirect(new URL('/login?error=google_invalid_client', req.url));
      }

      return NextResponse.redirect(new URL('/login?error=google_failed', req.url));
    }

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    if (!profileResponse.ok) {
      console.error('Google profile request failed:', profileResponse.status);
      return NextResponse.redirect(new URL('/login?error=google_failed', req.url));
    }

    const profile = (await profileResponse.json()) as GoogleProfile;
    const email = profile.email?.trim();

    if (!email || profile.email_verified !== true) {
      return NextResponse.redirect(new URL('/login?error=google_email_unverified', req.url));
    }

    const user = await findUserByEmail(email);

    if (!user) {
      const registerUrl = new URL('/register', req.url);
      registerUrl.searchParams.set('email', email);
      registerUrl.searchParams.set('error', 'google_no_account');
      return NextResponse.redirect(registerUrl);
    }

    const token = signToken({ userId: user.id, role: user.role });
    cookieStore.set('tempo-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.redirect(new URL(getDashboardPath(user.role), req.url));
  } catch (error) {
    console.error('Google authentication error:', error);
    return NextResponse.redirect(new URL('/login?error=google_failed', req.url));
  }
}
