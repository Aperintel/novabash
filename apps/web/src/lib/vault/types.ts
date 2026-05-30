// Local-first vault types. The entire vault lives on the user's device; nothing
// here is ever sent to a server.

export interface VaultField {
  key: string;
  value: string;
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
  | 'vault.export'
  | 'vault.import';

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
  services: VaultService[];
  audit: AuditEntry[];
  updatedAt: string;
}

export interface KdfParams {
  salt: string; // base64
  iterations: number;
  hash: 'SHA-256';
}

// The only thing ever written to disk or exported: an opaque encrypted blob.
export interface EncryptedVault {
  format: 'novabash-vault';
  version: 1;
  kdf: KdfParams;
  iv: string; // base64
  ciphertext: string; // base64, AES-GCM of the JSON-encoded VaultData
}

export const SCHEMA_VERSION = 1;
export const PBKDF2_ITERATIONS = 310_000;

export function emptyVault(): VaultData {
  return {
    schemaVersion: SCHEMA_VERSION,
    services: [],
    audit: [],
    updatedAt: new Date().toISOString(),
  };
}
