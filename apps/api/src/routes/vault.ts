import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../db.js';
import { credentials, environments, auditLog } from '@novabash/db';
import { authenticate, AuthError, type WorkspaceContext } from '../auth.js';
import { sealCredential, openCredential, AuditAction } from '../crypto/index.js';
import { appendAudit } from '../audit.js';
import { calculateKeyHealth } from '../health/index.js';
import { promoteEnvironment, type Variant } from '../promote.js';

/**
 * Vault routes. All require a workspace-key Bearer token. Mutations seal
 * the credential under envelope encryption and append a hash-chained audit
 * entry. Reads decrypt and audit. Reads never echo the plaintext back to
 * the audit payload, only metadata about which credential was read.
 */

export async function vaultRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (req, reply) => {
    try {
      const ctx = await authenticate(req);
      (req as unknown as { workspaceCtx: WorkspaceContext }).workspaceCtx = ctx;
    } catch (err) {
      if (err instanceof AuthError) {
        return reply.code(err.status).send({ error: err.code, message: err.message });
      }
      throw err;
    }
  });

  // POST /v1/vault/credentials
  app.post('/credentials', async (req, reply) => {
    const Body = z.object({
      environmentName: z.enum(['development', 'staging', 'production']),
      serviceId: z.string().min(1).max(64),
      fieldId: z.string().min(1).max(64),
      envName: z.string().min(1).max(128),
      value: z.string().min(1).max(8192),
    });
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });
    const ctx = (req as unknown as { workspaceCtx: WorkspaceContext }).workspaceCtx;
    const db = getDb();
    if (!db) return reply.code(503).send({ error: 'db_unconfigured' });

    const env = await ensureEnvironment(db, ctx.workspaceId, parsed.data.environmentName);

    let sealed;
    try {
      sealed = sealCredential(parsed.data.value);
    } catch (err) {
      return reply.code(503).send({
        error: 'vault_unconfigured',
        message: err instanceof Error ? err.message : 'Vault master key is not configured.',
      });
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
    if (!credentialId) return reply.code(500).send({ error: 'insert_failed' });

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

    return reply.code(201).send({ id: credentialId, sealed: true });
  });

  // GET /v1/vault/credentials/:id
  app.get<{ Params: { id: string } }>('/credentials/:id', async (req, reply) => {
    const Params = z.object({ id: z.string().uuid() });
    const parsed = Params.safeParse(req.params);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });
    const ctx = (req as unknown as { workspaceCtx: WorkspaceContext }).workspaceCtx;
    const db = getDb();
    if (!db) return reply.code(503).send({ error: 'db_unconfigured' });

    const rows = await db
      .select({
        id: credentials.id,
        cipher: credentials.cipher,
        dataKeyCipher: credentials.dataKeyCipher,
        keyVersion: credentials.keyVersion,
        envName: credentials.envName,
        serviceId: credentials.serviceId,
        fieldId: credentials.fieldId,
        environmentId: credentials.environmentId,
        envWorkspaceId: environments.workspaceId,
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
    if (!row) return reply.code(404).send({ error: 'not_found' });

    let plaintext: string;
    try {
      plaintext = openCredential({
        cipher: row.cipher,
        dataKeyCipher: row.dataKeyCipher,
        keyVersion: row.keyVersion,
      });
    } catch {
      return reply.code(500).send({ error: 'decrypt_failed' });
    }

    await appendAudit(db, {
      workspaceId: ctx.workspaceId,
      actorTokenId: ctx.serviceKeyId,
      action: AuditAction.CredentialRead,
      target: `${row.serviceId}/${row.fieldId}`,
      payload: { credentialId: row.id, envName: row.envName },
      occurredAt: new Date().toISOString(),
    });

    return reply.send({
      id: row.id,
      envName: row.envName,
      serviceId: row.serviceId,
      fieldId: row.fieldId,
      value: plaintext,
    });
  });

  // POST /v1/vault/credentials/:id/rotate
  app.post<{ Params: { id: string }; Body: { value: string } }>(
    '/credentials/:id/rotate',
    async (req, reply) => {
      const Params = z.object({ id: z.string().uuid() });
      const Body = z.object({ value: z.string().min(1).max(8192) });
      const ps = Params.safeParse(req.params);
      const bs = Body.safeParse(req.body);
      if (!ps.success || !bs.success)
        return reply.code(400).send({ error: 'invalid_request' });
      const ctx = (req as unknown as { workspaceCtx: WorkspaceContext }).workspaceCtx;
      const db = getDb();
      if (!db) return reply.code(503).send({ error: 'db_unconfigured' });

      const rows = await db
        .select({
          id: credentials.id,
          serviceId: credentials.serviceId,
          fieldId: credentials.fieldId,
          envName: credentials.envName,
          envWorkspaceId: environments.workspaceId,
        })
        .from(credentials)
        .innerJoin(environments, eq(credentials.environmentId, environments.id))
        .where(
          and(
            eq(credentials.id, ps.data.id),
            eq(environments.workspaceId, ctx.workspaceId),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return reply.code(404).send({ error: 'not_found' });

      let sealed;
      try {
        sealed = sealCredential(bs.data.value);
      } catch (err) {
        return reply.code(503).send({
          error: 'vault_unconfigured',
          message: err instanceof Error ? err.message : 'Vault master key is not configured.',
        });
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

      return reply.send({ id: row.id, rotated: true });
    },
  );

  // GET /v1/vault/health
  // Returns Key Health for every credential in the workspace, grouped by
  // service. Plaintext is never decrypted here; health is graded purely on
  // metadata.
  app.get('/health', async (req, reply) => {
    const ctx = (req as unknown as { workspaceCtx: WorkspaceContext }).workspaceCtx;
    const db = getDb();
    if (!db) return reply.code(503).send({ error: 'db_unconfigured' });

    const rows = await db
      .select({
        id: credentials.id,
        serviceId: credentials.serviceId,
        fieldId: credentials.fieldId,
        envName: credentials.envName,
        environmentId: credentials.environmentId,
        environmentName: environments.name,
        createdAt: credentials.createdAt,
        lastValidatedAt: credentials.lastValidatedAt,
        lastValidationOk: credentials.lastValidationOk,
      })
      .from(credentials)
      .innerJoin(environments, eq(credentials.environmentId, environments.id))
      .where(eq(environments.workspaceId, ctx.workspaceId));

    const now = new Date();
    const result = rows.map((r) => ({
      id: r.id,
      serviceId: r.serviceId,
      fieldId: r.fieldId,
      envName: r.envName,
      environment: r.environmentName,
      health: calculateKeyHealth(
        {
          serviceId: r.serviceId,
          fieldId: r.fieldId,
          createdAt: r.createdAt,
          lastValidatedAt: r.lastValidatedAt,
          lastValidationOk: r.lastValidationOk,
        },
        now,
      ),
    }));

    return reply.send({ credentials: result, gradedAt: now.toISOString() });
  });

  // GET /v1/vault/audit?limit=50&cursor=<iso>
  app.get('/audit', async (req, reply) => {
    const Query = z.object({
      limit: z.coerce.number().int().min(1).max(200).default(50),
    });
    const parsed = Query.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });
    const ctx = (req as unknown as { workspaceCtx: WorkspaceContext }).workspaceCtx;
    const db = getDb();
    if (!db) return reply.send({ entries: [], cursor: null, db: 'unconfigured' });

    const rows = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.workspaceId, ctx.workspaceId))
      .orderBy(desc(auditLog.occurredAt))
      .limit(parsed.data.limit);
    return reply.send({ entries: rows, cursor: null });
  });

  // POST /v1/vault/promote
  // Body: { from: variant, to: variant, overwrite?: boolean }
  app.post('/promote', async (req, reply) => {
    const Body = z.object({
      from: z.enum(['development', 'staging', 'production']),
      to: z.enum(['development', 'staging', 'production']),
      overwrite: z.boolean().optional().default(false),
    });
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });
    const ctx = (req as unknown as { workspaceCtx: WorkspaceContext }).workspaceCtx;
    const db = getDb();
    if (!db) return reply.code(503).send({ error: 'db_unconfigured' });

    const result = await promoteEnvironment(db, {
      workspaceId: ctx.workspaceId,
      serviceKeyId: ctx.serviceKeyId,
      from: parsed.data.from as Variant,
      to: parsed.data.to as Variant,
      overwrite: parsed.data.overwrite,
    });
    if (!result.ok) {
      return reply.code(409).send({ error: 'promote_failed', message: result.error, ...result });
    }
    return reply.code(200).send(result);
  });
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
  const inserted = await db
    .insert(environments)
    .values({ workspaceId, name })
    .returning();
  if (!inserted[0]) throw new Error('failed to create environment');
  return inserted[0];
}
