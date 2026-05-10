import { eq } from 'drizzle-orm';
import { workspaces, environments, credentials, serviceKeys } from '@novabash/db';
import { authenticateWorkspace } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { AuditAction } from '@/lib/server/crypto';
import { appendAudit } from '@/lib/server/audit';
import { err, json } from '@/lib/server/responses';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
  const auth = await authenticateWorkspace(request);
  if (!auth.ok) return err(auth.failure.status, auth.failure.code, auth.failure.message);
  const ctx = auth.ctx;

  const db = getDb();
  if (!db) return err(503, 'db_unconfigured');

  const envs = await db
    .select({ id: environments.id })
    .from(environments)
    .where(eq(environments.workspaceId, ctx.workspaceId));

  let credentialsPurged = 0;
  for (const e of envs) {
    const result = await db
      .delete(credentials)
      .where(eq(credentials.environmentId, e.id))
      .returning({ id: credentials.id });
    credentialsPurged += result.length;
  }
  const keys = await db
    .delete(serviceKeys)
    .where(eq(serviceKeys.workspaceId, ctx.workspaceId))
    .returning({ id: serviceKeys.id });

  await db
    .update(workspaces)
    .set({ deletedAt: new Date() })
    .where(eq(workspaces.id, ctx.workspaceId));

  await appendAudit(db, {
    workspaceId: ctx.workspaceId,
    actorTokenId: ctx.serviceKeyId,
    action: AuditAction.WorkspaceDeleted,
    target: ctx.workspaceId,
    payload: {
      credentialsPurged,
      serviceKeysRevoked: keys.length,
      auditRetentionDays: 30,
    },
    occurredAt: new Date().toISOString(),
  });

  return json({
    ok: true,
    credentialsPurged,
    serviceKeysRevoked: keys.length,
    auditRetentionDays: 30,
  });
}
