import { createHash } from 'node:crypto';

/**
 * Hash-chained audit log.
 *
 * Each entry's hash is sha256(prevHash || canonicalJson(currentEvent)). Any
 * tamper at any earlier entry breaks every subsequent hash, so verifying the
 * chain is a single linear scan from genesis. The first entry sets prevHash
 * to GENESIS, a known constant, so chains can be told apart without a sentinel
 * row.
 */

const GENESIS = '0'.repeat(64);

export interface AuditEvent {
  workspaceId: string;
  actorUserId?: string | null;
  actorTokenId?: string | null;
  action: string;
  target: string;
  payload?: Record<string, unknown>;
  occurredAt: string; // ISO-8601 UTC
}

export interface ChainedEntry extends AuditEvent {
  prevHash: string;
  hash: string;
}

/**
 * Canonical JSON: keys are sorted, no whitespace, no trailing decimals on
 * integers. Identical to RFC 8785 for the structure NovaBash actually emits.
 */
function canonical(obj: unknown): string {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return JSON.stringify(obj);
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const parts = keys.map(
    (k) => `${JSON.stringify(k)}:${canonical((obj as Record<string, unknown>)[k])}`,
  );
  return `{${parts.join(',')}}`;
}

export function chainHash(prevHash: string, event: AuditEvent): string {
  const canonicalEvent = canonical(event);
  return createHash('sha256').update(prevHash).update(canonicalEvent).digest('hex');
}

export function appendEntry(prevHash: string | null, event: AuditEvent): ChainedEntry {
  const ph = prevHash ?? GENESIS;
  const hash = chainHash(ph, event);
  return { ...event, prevHash: ph, hash };
}

export function verifyChain(entries: ChainedEntry[]): {
  ok: boolean;
  brokenAt?: number;
} {
  let prev = GENESIS;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]!;
    if (e.prevHash !== prev) return { ok: false, brokenAt: i };
    const expected = chainHash(prev, {
      workspaceId: e.workspaceId,
      actorUserId: e.actorUserId ?? null,
      actorTokenId: e.actorTokenId ?? null,
      action: e.action,
      target: e.target,
      payload: e.payload,
      occurredAt: e.occurredAt,
    });
    if (expected !== e.hash) return { ok: false, brokenAt: i };
    prev = e.hash;
  }
  return { ok: true };
}

export const AuditAction = {
  WorkspaceCreated: 'workspace.created',
  WorkspaceDeleted: 'workspace.deleted',
  CredentialCreated: 'credential.created',
  CredentialRead: 'credential.read',
  CredentialRotated: 'credential.rotated',
  CredentialRevoked: 'credential.revoked',
  EnvGenerated: 'env.generated',
  EnvDownloaded: 'env.downloaded',
  WorkspaceKeyIssued: 'workspace_key.issued',
  WorkspaceKeyRevoked: 'workspace_key.revoked',
} as const;

export type AuditActionName = (typeof AuditAction)[keyof typeof AuditAction];
