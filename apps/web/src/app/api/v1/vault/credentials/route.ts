import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { credentials, environments } from '@novabash/db';
import { authenticateWorkspace } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { sealCredential, AuditAction } from '@/lib/server/crypto';
import { appendAudit } from '@/lib/server/audit';
import { err, json } from '@/lib/server/responses';

export const runtime = 'nodejs';

const Body = z.object({
  environmentName: z.enum(['development', 'staging', 'production']),
  serviceId: z.string().min(1).max(64),
  fieldId: z.string().min(1).max(64),
  envName: z.string().min(1).max(128),
  value: z.string().min(1).max(8192),
});

export async function POST(request: Request) {
  const auth = await authenticateWorkspace(request);
  if (!auth.ok) return err(auth.failure.status, auth.failure.code, auth.failure.message);
  const ctx = auth.ctx;

  const body = await request.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) return err(400, 'invalid_request');

  const db = getDb();
  if (!db) return err(503, 'db_unconfigured');

  const env = await ensureEnvironment(db, ctx.workspaceId, parsed.data.environmentName);

  let sealed;
  try {
    sealed = sealCredential(parsed.data.value);
  } catch (e) {
    return err(503, 'vault_unconfigured', e instanceof Error ? e.message : undefined);
  }

  const inserted = await db
    .insert(credentials)
    .values({
      environmentId: env.id,
      serviceId: parsed.data.serviceId,
      fieldId: parsed.data.fieldId,
      envName: parsed.data.envName,
      cipher: sealed.cipher,
      dataKeyCipher: sealed.dataKeyCipher,
      keyVersion: sealed.keyVersion,
      lastValidatedAt: new Date(),
    })
    .returning({ id: credentials.id });

  const credentialId = inserted[0]?.id;
  if (!credentialId) return err(500, 'insert_failed');

  await appendAudit(db, {
    workspaceId: ctx.workspaceId,
    actorTokenId: ctx.serviceKeyId,
    action: AuditAction.CredentialCreated,
    target: `${parsed.data.serviceId}/${parsed.data.fieldId}`,
    payload: {
      environment: parsed.data.environmentName,
      envName: parsed.data.envName,
      keyVersion: sealed.keyVersion,
    },
    occurredAt: new Date().toISOString(),
  });

  return json({ id: credentialId, sealed: true }, { status: 201 });
}

async function ensureEnvironment(
  db: NonNullable<ReturnType<typeof getDb>>,
  workspaceId: string,
  name: 'development' | 'staging' | 'production',
) {
  const existing = await db
    .select()
    .from(environments)
    .where(and(eq(environments.workspaceId, workspaceId), eq(environments.name, name)))
    .limit(1);
  if (existing[0]) return existing[0];
  const inserted = await db.insert(environments).values({ workspaceId, name }).returning();
  if (!inserted[0]) throw new Error('failed to create environment');
  return inserted[0];
}
