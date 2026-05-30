// Client-side cryptography for the vault. Uses the Web Crypto API only; no
// dependencies and no network. AES-256-GCM for the vault, PBKDF2 for the
// passphrase-derived key, SHA-256 for the audit chain.

import {
  type EncryptedVault,
  type KdfParams,
  type VaultData,
  PBKDF2_ITERATIONS,
} from './types';

const enc = new TextEncoder();
const dec = new TextDecoder();

function randomBytes(length: number): Uint8Array {
  const b = new Uint8Array(length);
  crypto.getRandomValues(b);
  return b;
}

export function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  view.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, kdf: KdfParams): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fromBase64(kdf.salt),
      iterations: kdf.iterations,
      hash: kdf.hash,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// Derive a key for a brand new vault, returning the key plus the KDF params that
// must be stored alongside the ciphertext so the same key can be re-derived.
export async function newKey(passphrase: string): Promise<{ key: CryptoKey; kdf: KdfParams }> {
  const kdf: KdfParams = {
    salt: toBase64(randomBytes(16)),
    iterations: PBKDF2_ITERATIONS,
    hash: 'SHA-256',
  };
  const key = await deriveKey(passphrase, kdf);
  return { key, kdf };
}

export async function keyFromKdf(passphrase: string, kdf: KdfParams): Promise<CryptoKey> {
  return deriveKey(passphrase, kdf);
}

export async function encryptVault(
  data: VaultData,
  key: CryptoKey,
  kdf: KdfParams,
): Promise<EncryptedVault> {
  const iv = randomBytes(12);
  const plaintext = enc.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return {
    format: 'novabash-vault',
    version: 1,
    kdf,
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
  };
}

// Decrypt an encrypted vault with a passphrase. Throws on a wrong passphrase or
// tampered ciphertext (AES-GCM authentication failure).
export async function decryptVault(blob: EncryptedVault, passphrase: string): Promise<VaultData> {
  const key = await deriveKey(passphrase, blob.kdf);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(blob.iv) },
    key,
    fromBase64(blob.ciphertext),
  );
  return JSON.parse(dec.decode(plaintext)) as VaultData;
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function randomId(): string {
  return toBase64(randomBytes(9)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
}
