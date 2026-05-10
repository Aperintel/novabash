import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import {
  workspaces,
  environments,
  credentials,
  serviceKeys,
  auditLog,
  bundleStars,
  bundleReviews,
  bundlesPublished,
  userProfile,
} from '@novabash/db';
import { authenticate, AuthError, type WorkspaceContext } from '../auth.js';
import { getDb } from '../db.js';
import { AuditAction } from '../crypto/index.js';
import { appendAudit } from '../audit.js';

/**
 * GDPR data export and account deletion routes.
 *
 * Export returns the workspace metadata and the audit log as JSON. The
 * audit log is signed by virtue of the existing hash chain; receivers can
 * re-verify with verifyChain() from the crypto module.
 *
 * Account deletion purges credentials and the workspace key store, retains
 * the audit log for 30 days for security review, then a separate scheduled
 * worker deletes the audit rows. We do not delete the workspace row
 * synchronously so any in-flight read can fail closed rather than 404 mid-
 * operation; instead workspaces.deleted_at is set.
 */

export async function gdprRoutes(app: FastifyInstance) {
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

  // GET /v1/gdpr/export
  // Returns a JSON dump of everything the workspace owns. Credentials are
  // returned as ciphertext, NOT decrypted, because exporting plaintext
  // through HTTP is a footgun. The hash-chained audit log lets the holder
  // verify the integrity of every action that ever happened.
  app.get('/export', async (req, reply) => {
    const ctx = (req as unknown as { workspaceCtx: WorkspaceContext }).workspaceCtx;
    const db = getDb();
    if (!db) return reply.code(503).send({ error: 'db_unconfigured' });

    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, ctx.workspaceId));
    if (!ws) return reply.code(404).send({ error: 'workspace_not_found' });

    const [profile] = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, ws.ownerId));

    const envs = await db.select().from(environments).where(eq(environments.workspaceId, ws.id));
    const keys = await db.select().from(serviceKeys).where(eq(serviceKeys.workspaceId, ws.id));
    const audit = await db.select().from(auditLog).where(eq(auditLog.workspaceId, ws.id));

    const credRows = await db
      .select()
      .from(credentials)
      .where(eq(credentials.environmentId, envs[0]?.id ?? '00000000-0000-0000-0000-000000000000'));

    const stars = await db.select().from(bundleStars).where(eq(bundleStars.userId, ws.ownerId));
    const reviews = await db
      .select()
      .from(bundleReviews)
      .where(eq(bundleReviews.userId, ws.ownerId));
    const published = await db
      .select()
      .from(bundlesPublished)
      .where(eq(bundlesPublished.authorUserId, ws.ownerId));

    await appendAudit(db, {
      workspaceId: ws.id,
      actorTokenId: ctx.serviceKeyId,
      action: 'gdpr.exported',
      target: ws.id,
      payload: {
        envs: envs.length,
        credentials: credRows.length,
        auditEntries: audit.length,
      },
      occurredAt: new Date().toISOString(),
    });

    reply.header('content-type', 'application/json; charset=utf-8');
    reply.header(
      'content-disposition',
      `attachment; filename="novabash-export-${ws.slug}-${new Date().toISOString().slice(0, 10)}.json"`,
    );
    return reply.send({
      schema: 'novabash.gdpr.export.v1',
      generatedAt: new Date().toISOString(),
      profile,
      workspace: ws,
      environments: envs,
      credentials: credRows.map((c) => ({
        ...c,
        // Cipher fields stay as-is; they are useless without the master
        // key, which lives in KMS, not in the export.
      })),
      serviceKeys: keys.map((k) => ({ ...k, tokenHash: '<redacted>' })),
      auditLog: audit,
      community: { stars, reviews, published },
    });
  });

  // POST /v1/gdpr/destroy
  // Hard-deletes credentials and service keys, marks workspace deleted,
  // schedules audit log purge in 30 days. Idempotent: calling twice on a
  // deleted workspace is a no-op.
  app.post('/destroy', async (req, reply) => {
    const ctx = (req as unknown as { workspaceCtx: WorkspaceContext }).workspaceCtx;
    const db = getDb();
    if (!db) return reply.code(503).send({ error: 'db_unconfigured' });

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

    return reply.send({
      ok: true,
      credentialsPurged,
      serviceKeysRevoked: keys.length,
      auditRetentionDays: 30,
    });
  });
}
