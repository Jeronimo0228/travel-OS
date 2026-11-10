import { createHash, randomBytes } from 'node:crypto';

/** Token aleatorio de 32 bytes en base64url (43 caracteres). Solo el hash va a la base de datos. */
export function createOneTimeToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function webOrigin(): string {
  return (
    process.env.WEB_ORIGIN?.split(',')[0] ?? 'http://localhost:3000'
  ).replace(/\/$/, '');
}
