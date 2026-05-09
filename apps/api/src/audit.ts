import { desc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { auditLog } from '@novabash/db';
import { appendEntry, type AuditEvent } from './crypto/index.js';

/**
 * Wrapper around the audit_log table that keeps the hash chain consistent.
 * Always passes the current chain head's hash to chainHash so any tamper
 * with an earlier row breaks every subsequent entry.
 *
 * The whole append must run inside a transaction in production so a
 * concurrent writer cannot interleave a row between our `select previous`
 * and `insert next`. Drizzle exposes `.transaction()`; the helper below
 * defers transaction wrapping to the caller because the larger vault
 * operations (create credential + audit) need to share the same tx.
 */

export async function getChainHead(
  db: PostgresJsDatabase<Record<string, unknown>>,
  workspaceId: string,
): Promise<string | null> {
  const rows = await (db as PostgresJsDatabase<Record<string, unknown>>)
    .select({ hash: auditLog.hash })
    .from(auditLog)
    .where(eq(auditLog.workspaceId, workspaceId))
    .orderBy(desc(auditLog.occurredAt))
    .limit(1);
  return rows[0]?.hash ?? null;
}

export async function appendAudit(
  db: PostgresJsDatabase<Record<string, unknown>>,
  event: AuditEvent,
): Promise<void> {
  const prev = await getChainHead(db, event.workspaceId);
  const entry = appendEntry(prev, event);
  await (db as PostgresJsDatabase<Record<string, unknown>>).insert(auditLog).values({
    workspaceId: entry.workspaceId,
    actorUserId: entry.actorUserId ?? null,
    actorTokenId: entry.actorTokenId ?? null,
    action: entry.action,
    target: entry.target,
    payload: entry.payload ?? null,
    prevHash: entry.prevHash,
    hash: entry.hash,
    occurredAt: new Date(entry.occurredAt),
  });
}
