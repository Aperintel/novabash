// Client-side cryptography for the vault. Web Crypto API only.
//
// Envelope model: a random 256-bit data key (DEK) encrypts the vault. The DEK is
// wrapped (encrypted) twice, once by a key derived from the passphrase and once
// by a key derived from a 24-word recovery phrase. Either one can unlock the
// vault, which is what makes passphrase recovery and passphrase change possible
// without a server. Mnemonics use @scure/bip39 (audited) rather than home-rolled
// BIP39.

import { generateMnemonic, mnemonicToEntropy, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import {
  type EncryptedVault,
  type KdfParams,
  type VaultData,
  type WrappedKey,
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

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function randomId(): string {
  return toBase64(randomBytes(9)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
}

// ── Key derivation ──────────────────────────────────────────────────────────
async function kekFromPassphrase(passphrase: string, kdf: KdfParams): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: fromBase64(kdf.salt), iterations: kdf.iterations, hash: kdf.hash },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// The recovery phrase's entropy (32 bytes) is already high-entropy, so it is used
// directly as the wrapping key.
async function kekFromEntropy(entropy: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', entropy, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function importDek(dekRaw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', dekRaw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function freshKdf(): KdfParams {
  return { salt: toBase64(randomBytes(16)), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' };
}

// ── DEK wrapping ──────────────────────────────────────────────────────────────
async function wrapKey(dekRaw: Uint8Array, kek: CryptoKey): Promise<WrappedKey> {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, kek, dekRaw);
  return { iv: toBase64(iv), ct: toBase64(ct) };
}

async function unwrapKey(w: WrappedKey, kek: CryptoKey): Promise<Uint8Array> {
  const dek = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(w.iv) }, kek, fromBase64(w.ct));
  return new Uint8Array(dek);
}

// ── Public types ──────────────────────────────────────────────────────────────
export interface UnlockedKeys {
  dekRaw: Uint8Array;
  dekKey: CryptoKey;
}

export interface Envelope {
  kdf: KdfParams;
  passWrap: WrappedKey;
  recoveryWrap?: WrappedKey;
}

// ── Vault lifecycle ─────────────────────────────────────────────────────────
// A new envelope wrapped by the passphrase only (no recovery yet).
export async function newEnvelope(passphrase: string): Promise<{ keys: UnlockedKeys; envelope: Envelope }> {
  const dekRaw = randomBytes(32);
  const dekKey = await importDek(dekRaw);
  const kdf = freshKdf();
  const passWrap = await wrapKey(dekRaw, await kekFromPassphrase(passphrase, kdf));
  return { keys: { dekRaw, dekKey }, envelope: { kdf, passWrap } };
}

// A new vault: passphrase wrap plus a fresh 24-word recovery phrase.
export async function newVault(
  passphrase: string,
): Promise<{ keys: UnlockedKeys; envelope: Envelope; mnemonic: string }> {
  const { keys, envelope } = await newEnvelope(passphrase);
  const { recoveryWrap, mnemonic } = await makeRecovery(keys.dekRaw);
  return { keys, envelope: { ...envelope, recoveryWrap }, mnemonic };
}

// Generate a fresh recovery phrase and wrap the DEK under it.
export async function makeRecovery(dekRaw: Uint8Array): Promise<{ recoveryWrap: WrappedKey; mnemonic: string }> {
  const mnemonic = generateMnemonic(wordlist, 256); // 24 words
  const entropy = mnemonicToEntropy(mnemonic, wordlist); // 32 bytes
  const recoveryWrap = await wrapKey(dekRaw, await kekFromEntropy(entropy));
  return { recoveryWrap, mnemonic };
}

// Re-wrap the DEK under a new passphrase (change passphrase). Vault ciphertext is
// untouched because the DEK does not change.
export async function rewrapPassphrase(
  dekRaw: Uint8Array,
  newPassphrase: string,
): Promise<{ kdf: KdfParams; passWrap: WrappedKey }> {
  const kdf = freshKdf();
  const passWrap = await wrapKey(dekRaw, await kekFromPassphrase(newPassphrase, kdf));
  return { kdf, passWrap };
}

// Encrypt the vault data under the DEK and assemble the full stored blob.
export async function sealVault(data: VaultData, dekKey: CryptoKey, envelope: Envelope): Promise<EncryptedVault> {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, dekKey, enc.encode(JSON.stringify(data)));
  return {
    format: 'novabash-vault',
    version: 2,
    kdf: envelope.kdf,
    passWrap: envelope.passWrap,
    recoveryWrap: envelope.recoveryWrap,
    iv: toBase64(iv),
    ciphertext: toBase64(ct),
  };
}

async function openCiphertext(blob: EncryptedVault, dekKey: CryptoKey): Promise<VaultData> {
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(blob.iv) },
    dekKey,
    fromBase64(blob.ciphertext),
  );
  return JSON.parse(dec.decode(pt)) as VaultData;
}

export async function openWithPassphrase(
  blob: EncryptedVault,
  passphrase: string,
): Promise<{ data: VaultData; keys: UnlockedKeys; envelope: Envelope }> {
  const dekRaw = await unwrapKey(blob.passWrap, await kekFromPassphrase(passphrase, blob.kdf));
  const dekKey = await importDek(dekRaw);
  const data = await openCiphertext(blob, dekKey);
  return {
    data,
    keys: { dekRaw, dekKey },
    envelope: { kdf: blob.kdf, passWrap: blob.passWrap, recoveryWrap: blob.recoveryWrap },
  };
}

export async function openWithRecovery(
  blob: EncryptedVault,
  mnemonic: string,
): Promise<{ data: VaultData; keys: UnlockedKeys; envelope: Envelope }> {
  if (!blob.recoveryWrap) throw new Error('This vault has no recovery phrase set.');
  const cleaned = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(cleaned, wordlist)) throw new Error('That is not a valid 24-word recovery phrase.');
  const entropy = mnemonicToEntropy(cleaned, wordlist);
  const dekRaw = await unwrapKey(blob.recoveryWrap, await kekFromEntropy(entropy));
  const dekKey = await importDek(dekRaw);
  const data = await openCiphertext(blob, dekKey);
  return {
    data,
    keys: { dekRaw, dekKey },
    envelope: { kdf: blob.kdf, passWrap: blob.passWrap, recoveryWrap: blob.recoveryWrap },
  };
}

// Legacy (v1) vaults: the passphrase-derived key encrypted the vault directly.
// Used once on unlock to read an old vault before re-sealing it in the v2 format.
export async function openLegacy(
  blob: { kdf: KdfParams; iv: string; ciphertext: string },
  passphrase: string,
): Promise<VaultData> {
  const key = await kekFromPassphrase(passphrase, blob.kdf);
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(blob.iv) },
    key,
    fromBase64(blob.ciphertext),
  );
  return JSON.parse(dec.decode(pt)) as VaultData;
}
