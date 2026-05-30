// Tamper-evident local audit log. Each entry's hash includes the previous
// entry's hash, so any edit to history is detectable by recomputing the chain.

import { sha256Hex } from './crypto';
import type { AuditAction, AuditEntry, VaultData } from './types';

const GENESIS = '0'.repeat(64);

async function hashEntry(e: Omit<AuditEntry, 'hash'>): Promise<string> {
  return sha256Hex(`${e.prevHash}|${e.ts}|${e.action}|${e.target ?? ''}|${e.detail ?? ''}`);
}

// Returns a new audit array with one entry appended, chained to the last hash.
export async function appendAudit(
  audit: AuditEntry[],
  action: AuditAction,
  target?: string,
  detail?: string,
): Promise<AuditEntry[]> {
  const prevHash = audit.at(-1)?.hash ?? GENESIS;
  const base: Omit<AuditEntry, 'hash'> = {
    ts: new Date().toISOString(),
    action,
    target,
    detail,
    prevHash,
  };
  const hash = await hashEntry(base);
  return [...audit, { ...base, hash }];
}

export interface ChainResult {
  ok: boolean;
  brokenAt?: number;
}

// Recompute the whole chain and report the first index that does not verify.
export async function verifyChain(audit: AuditEntry[]): Promise<ChainResult> {
  let prevHash = GENESIS;
  for (let i = 0; i < audit.length; i += 1) {
    const e = audit[i];
    if (!e) continue;
    if (e.prevHash !== prevHash) return { ok: false, brokenAt: i };
    const expected = await hashEntry({
      ts: e.ts,
      action: e.action,
      target: e.target,
      detail: e.detail,
      prevHash: e.prevHash,
    });
    if (expected !== e.hash) return { ok: false, brokenAt: i };
    prevHash = e.hash;
  }
  return { ok: true };
}

export function withTouch(data: VaultData): VaultData {
  return { ...data, updatedAt: new Date().toISOString() };
}
