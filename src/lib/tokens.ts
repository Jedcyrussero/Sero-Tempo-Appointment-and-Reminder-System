import { createHash, randomBytes } from 'crypto';

export const RESET_TOKEN_TTL_MINUTES = 60;

export function generateResetToken() {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
