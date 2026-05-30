// Local-first vault types. The entire vault lives on the user's device; nothing
// here is ever sent to a server.

export interface VaultField {
  key: string;
  // One value per environment name (for example development, staging, production).
  values: Record<string, string>;
}

export interface VaultService {
  id: string;
  name: string;
  bundleId?: string;
  fields: VaultField[];
  createdAt: string;
  rotatedAt?: string;
  expiresAt?: string;
  notes?: string;
}

export type AuditAction =
  | 'vault.create'
  | 'vault.unlock'
  | 'service.add'
  | 'service.update'
  | 'service.delete'
  | 'service.rotate'
  | 'bundle.apply'
  | 'env.generate'
  | 'env.add'
  | 'env.remove'
  | 'vault.export'
  | 'vault.import'
  | 'vault.passphrase'
  | 'vault.recovery';

export interface AuditEntry {
  ts: string;
  action: AuditAction;
  target?: string;
  detail?: string;
  prevHash: string;
  hash: string;
}

export interface VaultData {
  schemaVersion: number;
  environments: string[];
  services: VaultService[];
  audit: AuditEntry[];
  updatedAt: string;
}

export interface KdfParams {
  salt: string; // base64
  iterations: number;
  hash: 'SHA-256';
}

// A DEK wrapped (encrypted) under a key-encryption key. base64 iv + ciphertext.
export interface WrappedKey {
  iv: string;
  ct: string;
}

// The only thing ever written to disk or exported: an opaque encrypted blob.
// A random data key encrypts the vault; that data key is wrapped by the
// passphrase-derived key and (optionally) by the recovery-phrase-derived key.
export interface EncryptedVault {
  format: 'novabash-vault';
  version: 2;
  kdf: KdfParams; // for the passphrase-derived key-encryption key
  passWrap: WrappedKey; // data key wrapped by the passphrase
  recoveryWrap?: WrappedKey; // data key wrapped by the recovery phrase, if set
  iv: string; // base64, iv for the vault ciphertext
  ciphertext: string; // base64, AES-GCM of the JSON-encoded VaultData under the data key
}

export const SCHEMA_VERSION = 2;
export const PBKDF2_ITERATIONS = 310_000;
export const DEFAULT_ENVIRONMENTS = ['development', 'staging', 'production'];

export function emptyVault(): VaultData {
  return {
    schemaVersion: SCHEMA_VERSION,
    environments: [...DEFAULT_ENVIRONMENTS],
    services: [],
    audit: [],
    updatedAt: new Date().toISOString(),
  };
}
