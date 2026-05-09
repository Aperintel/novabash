import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, AuthError, type WorkspaceContext } from '../auth.js';
import { getDb } from '../db.js';
import { generateEnvForWorkspace, type Variant } from '../env-generator.js';
import { AuditAction } from '../crypto/index.js';
import { appendAudit } from '../audit.js';

/**
 * CLI-side routes.
 *
 *   /v1/cli/device/start   start a device-code grant
 *   /v1/cli/device/poll    poll the grant
 *   /v1/cli/env            pull the .env for the active environment (auth required)
 *
 * Device-code persistence is week 5 work. The endpoints below are wired so
 * the CLI's `novabash login` flow has a stable shape, with stubs for the
 * grant table.
 */

export async function cliRoutes(app: FastifyInstance) {
  app.post('/device/start', async () => {
    const code = randomCode();
    return {
      device_code: cryptoRandom(40),
      user_code: code,
      verification_uri: `https://novabash.dev/cli/${code}`,
      expires_in: 600,
      interval: 2,
    };
  });

  app.post('/device/poll', async (req, reply) => {
    const Body = z.object({ device_code: z.string().min(20) });
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });
    return reply.code(202).send({ status: 'authorization_pending' });
  });

  app.get('/env', async (req, reply) => {
    const Query = z.object({
      variant: z.enum(['development', 'staging', 'production']).default('development'),
    });
    const parsed = Query.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });

    let ctx: WorkspaceContext;
    try {
      ctx = await authenticate(req);
    } catch (err) {
      if (err instanceof AuthError) {
        return reply.code(err.status).send({ error: err.code, message: err.message });
      }
      throw err;
    }

    const db = getDb();
    if (!db) {
      return reply
        .code(503)
        .send({ error: 'db_unconfigured', message: 'API database is not configured.' });
    }

    const result = await generateEnvForWorkspace(db, {
      workspaceId: ctx.workspaceId,
      variant: parsed.data.variant as Variant,
      serviceKeyId: ctx.serviceKeyId,
    });
    if (!result.ok) {
      return reply.code(409).send({ error: 'generate_failed', message: result.error });
    }

    await appendAudit(db, {
      workspaceId: ctx.workspaceId,
      actorTokenId: ctx.serviceKeyId,
      action: AuditAction.EnvDownloaded,
      target: result.variant,
      payload: { count: result.count, filename: result.filename, surface: 'cli' },
      occurredAt: new Date().toISOString(),
    });

    reply
      .header('content-type', 'text/plain; charset=utf-8')
      .header('content-disposition', `attachment; filename="${result.filename}"`);
    return reply.send(result.content);
  });
}

function randomCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function cryptoRandom(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}
