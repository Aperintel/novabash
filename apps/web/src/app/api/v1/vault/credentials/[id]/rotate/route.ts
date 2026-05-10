import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { credentials, environments } from '@novabash/db';
import { authenticateWorkspace } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { sealCredential, AuditAction } from '@/lib/server/crypto';
import { appendAudit } from '@/lib/server/audit';
import { err, json } from '@/lib/server/responses';

export const runtime = 'nodejs';

const Params = z.object({ id: z.string().uuid() });
const Body = z.object({ value: z.string().min(1).max(8192) });

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const ps = Params.safeParse(params);
  if (!ps.success) return err(400, 'invalid_request');
  const body = await request.json().catch(() => null);
  const bs = Body.safeParse(body);
  if (!bs.success) return err(400, 'invalid_request');

  const auth = await authenticateWorkspace(request);
  if (!auth.ok) return err(auth.failure.status, auth.failure.code, auth.failure.message);
  const ctx = auth.ctx;

  const db = getDb();
  if (!db) return err(503, 'db_unconfigured');

  const rows = await db
    .select({
      id: credentials.id,
      serviceId: credentials.serviceId,
      fieldId: credentials.fieldId,
      envName: credentials.envName,
    })
    .from(credentials)
    .innerJoin(environments, eq(credentials.environmentId, environments.id))
    .where(
      and(eq(credentials.id, ps.data.id), eq(environments.workspaceId, ctx.workspaceId)),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return err(404, 'not_found');

  let sealed;
  try {
    sealed = sealCredential(bs.data.value);
  } catch (e) {
    return err(503, 'vault_unconfigured', e instanceof Error ? e.message : undefined);
  }

  await db
    .update(credentials)
    .set({
      cipher: sealed.cipher,
      dataKeyCipher: sealed.dataKeyCipher,
      keyVersion: sealed.keyVersion,
      lastValidatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(credentials.id, row.id));

  await appendAudit(db, {
    workspaceId: ctx.workspaceId,
    actorTokenId: ctx.serviceKeyId,
    action: AuditAction.CredentialRotated,
    target: `${row.serviceId}/${row.fieldId}`,
    payload: { credentialId: row.id, envName: row.envName, keyVersion: sealed.keyVersion },
    occurredAt: new Date().toISOString(),
  });

  return json({ id: row.id, rotated: true });
}
