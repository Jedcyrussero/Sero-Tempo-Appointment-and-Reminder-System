import { timingSafeEqual } from 'crypto';
import { getAppBaseUrl } from './app-url';

export const GOOGLE_OAUTH_STATE_COOKIE = 'tempo-google-oauth-state';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getGoogleOAuthConfig(requestUrl: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const missing: string[] = [];

  if (!clientId) missing.push('GOOGLE_CLIENT_ID');
  if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    return { config: null, missing };
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    `${getAppBaseUrl(requestUrl)}/api/auth/google/callback`;

  return {
    config: {
      clientId,
      clientSecret,
      redirectUri,
    },
    missing,
  };
}

export function oauthStatesMatch(actual?: string | null, expected?: string | null) {
  if (!actual || !expected) {
    return false;
  }

  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
