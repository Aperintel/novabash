import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { credentials, environments } from '@novabash/db';
import { authenticateWorkspace } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { openCredential, AuditAction } from '@/lib/server/crypto';
import { appendAudit } from '@/lib/server/audit';
import { err, json } from '@/lib/server/responses';

export const runtime = 'nodejs';

const Params = z.object({ id: z.string().uuid() });

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const parsed = Params.safeParse(params);
  if (!parsed.success) return err(400, 'invalid_request');

  const auth = await authenticateWorkspace(request);
  if (!auth.ok) return err(auth.failure.status, auth.failure.code, auth.failure.message);
  const ctx = auth.ctx;

  const db = getDb();
  if (!db) return err(503, 'db_unconfigured');

  const rows = await db
    .select({
      id: credentials.id,
      cipher: credentials.cipher,
      dataKeyCipher: credentials.dataKeyCipher,
      keyVersion: credentials.keyVersion,
      envName: credentials.envName,
      serviceId: credentials.serviceId,
      fieldId: credentials.fieldId,
    })
    .from(credentials)
    .innerJoin(environments, eq(credentials.environmentId, environments.id))
    .where(
      and(
        eq(credentials.id, parsed.data.id),
        eq(environments.workspaceId, ctx.workspaceId),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return err(404, 'not_found');

  let plaintext: string;
  try {
    plaintext = openCredential({
      cipher: row.cipher,
      dataKeyCipher: row.dataKeyCipher,
      keyVersion: row.keyVersion,
    });
  } catch {
    return err(500, 'decrypt_failed');
  }

  await appendAudit(db, {
    workspaceId: ctx.workspaceId,
    actorTokenId: ctx.serviceKeyId,
    action: AuditAction.CredentialRead,
    target: `${row.serviceId}/${row.fieldId}`,
    payload: { credentialId: row.id, envName: row.envName },
    occurredAt: new Date().toISOString(),
  });

  return json({
    id: row.id,
    envName: row.envName,
    serviceId: row.serviceId,
    fieldId: row.fieldId,
    value: plaintext,
  });
}
