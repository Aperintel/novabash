import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
  timingSafeEqual,
} from 'node:crypto';

/**
 * Envelope encryption.
 *
 * Each credential is encrypted with a randomly-generated 256-bit data key
 * under AES-256-GCM. The data key is itself encrypted under the master key.
 * Master key is held in a sealed environment variable in MVP and in AWS KMS
 * at v1.0; the public surface of this module does not change between the two.
 *
 * Wire format for every encrypted blob:
 *   v1:<base64(iv)>:<base64(ciphertext)>:<base64(authTag)>
 *
 * The data key blob and the credential blob both use the same wire format,
 * so the same `encrypt`/`decrypt` pair is reused for both layers.
 */

const VERSION = 'v1';
const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const KEY_LEN = 32;
const TAG_LEN = 16;

function bufFromB64(s: string): Buffer {
  return Buffer.from(s, 'base64');
}

function b64(b: Buffer): string {
  return b.toString('base64');
}

function loadMasterKey(): Buffer {
  const raw = process.env.VAULT_MASTER_KEY;
  if (!raw) {
    throw new Error('VAULT_MASTER_KEY is not set. Refusing to encrypt or decrypt.');
  }
  const key = bufFromB64(raw);
  if (key.length !== KEY_LEN) {
    throw new Error(
      `VAULT_MASTER_KEY must decode to ${KEY_LEN} bytes; got ${key.length}.`,
    );
  }
  return key;
}

export function newDataKey(): Buffer {
  return randomBytes(KEY_LEN);
}

export function encrypt(plaintext: string, key: Buffer): string {
  if (key.length !== KEY_LEN) {
    throw new Error('encrypt: key must be 32 bytes');
  }
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${b64(iv)}:${b64(ct)}:${b64(tag)}`;
}

export function decrypt(blob: string, key: Buffer): string {
  if (key.length !== KEY_LEN) {
    throw new Error('decrypt: key must be 32 bytes');
  }
  const parts = blob.split(':');
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error('decrypt: malformed blob');
  }
  const iv = bufFromB64(parts[1]!);
  const ct = bufFromB64(parts[2]!);
  const tag = bufFromB64(parts[3]!);
  if (iv.length !== IV_LEN) throw new Error('decrypt: bad IV length');
  if (tag.length !== TAG_LEN) throw new Error('decrypt: bad tag length');
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

export interface SealedCredential {
  cipher: string;
  dataKeyCipher: string;
  keyVersion: number;
}

export function sealCredential(plaintext: string, keyVersion = 1): SealedCredential {
  const master = loadMasterKey();
  const dk = newDataKey();
  const cipher = encrypt(plaintext, dk);
  const dataKeyCipher = encrypt(b64(dk), master);
  return { cipher, dataKeyCipher, keyVersion };
}

export function openCredential(sealed: SealedCredential): string {
  const master = loadMasterKey();
  const dkB64 = decrypt(sealed.dataKeyCipher, master);
  const dk = bufFromB64(dkB64);
  return decrypt(sealed.cipher, dk);
}

/**
 * Constant-time comparison of two strings, used for workspace key lookups
 * after the lookup key has been hashed identically on both sides.
 */
export function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Generate a 256-bit master key as a base64 string. Used by the operator
 * during initial setup. NEVER call this at runtime to "regenerate" a key
 * because every existing data-key envelope was encrypted under the previous
 * one and would become unrecoverable.
 */
export function generateMasterKey(): string {
  return b64(randomBytes(KEY_LEN));
}

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
