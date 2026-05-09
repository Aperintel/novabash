import { randomBytes } from 'node:crypto';
import { sha256 } from './envelope.js';

/**
 * Workspace key generation.
 *
 * The workspace key is a single bearer token that the user copies once and
 * uses everywhere (CLI, CI, editor sidebar). Plaintext is shown to the user
 * exactly once on creation. The database stores only sha256(plaintext) as
 * `service_keys.token_hash`, so a database breach never reveals the
 * plaintext token, and lookups are constant-time.
 *
 * Format: nbk_<scope>_<22-char-base64url>_<6-char-checksum>
 *   - nbk          fixed prefix (NovaBash Key)
 *   - scope        env-friendly token: live | dev | rev
 *   - 22 chars     128 bits of entropy, base64url
 *   - 6 chars      crc-style checksum so an obviously-malformed paste fails fast
 */

export type Scope = 'live' | 'dev' | 'rev';

const PREFIX = 'nbk';

function base64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function checksum(input: string): string {
  return sha256(input).slice(0, 6);
}

export function newWorkspaceKey(scope: Scope = 'live'): { plaintext: string; hash: string } {
  const entropy = base64url(randomBytes(16)); // 128 bits, 22 base64url chars
  const body = `${PREFIX}_${scope}_${entropy}`;
  const cs = checksum(body);
  const plaintext = `${body}_${cs}`;
  return { plaintext, hash: sha256(plaintext) };
}

export function looksLikeWorkspaceKey(s: string): boolean {
  const parts = s.split('_');
  if (parts.length !== 4) return false;
  if (parts[0] !== PREFIX) return false;
  if (!['live', 'dev', 'rev'].includes(parts[1] ?? '')) return false;
  if ((parts[2] ?? '').length !== 22) return false;
  if ((parts[3] ?? '').length !== 6) return false;
  const expected = checksum(`${parts[0]}_${parts[1]}_${parts[2]}`);
  return expected === parts[3];
}

export function hashWorkspaceKey(plaintext: string): string {
  return sha256(plaintext);
}
