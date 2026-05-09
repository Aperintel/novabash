import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { workspaces } from '@novabash/db';
import { getDb } from '../db.js';
import { validateWorkspace } from '../validation.js';
import { safeEqual } from '../crypto/index.js';

/**
 * Admin routes. Triggered by a single ADMIN_TOKEN env var. These exist so
 * that the periodic validation worker can be kicked off via cron, Inngest,
 * or a manual curl during the build phase. Once Inngest is provisioned,
 * the validation function will subscribe to a scheduled event and these
 * routes become a fallback rather than the primary trigger.
 */

function checkAdminToken(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const provided = (req.headers['x-admin-token'] as string | undefined) ?? '';
  const expected = process.env.ADMIN_TOKEN ?? '';
  if (!expected) return false;
  if (provided.length === 0) return false;
  return safeEqual(provided, expected);
}

export async function adminRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (req, reply) => {
    if (!checkAdminToken(req)) {
      return reply.code(401).send({ error: 'admin_token_required' });
    }
  });

  // POST /v1/admin/validate?workspaceId=<uuid>
  // Validates every credential in the named workspace and returns outcomes.
  app.post('/validate', async (req, reply) => {
    const Query = z.object({ workspaceId: z.string().uuid() });
    const parsed = Query.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });
    const db = getDb();
    if (!db) return reply.code(503).send({ error: 'db_unconfigured' });
    const outcomes = await validateWorkspace(db, parsed.data.workspaceId);
    return reply.send({ outcomes });
  });

  // POST /v1/admin/validate-all
  // Validates every workspace. Cap at 1000 workspaces per call to avoid
  // long-running invocations; the cron should call this often enough that
  // the cap is irrelevant for the foreseeable future.
  app.post('/validate-all', async (_req, reply) => {
    const db = getDb();
    if (!db) return reply.code(503).send({ error: 'db_unconfigured' });
    const rows = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.deletedAt, null as unknown as Date))
      .limit(1000);
    let total = 0;
    let ok = 0;
    let failed = 0;
    for (const w of rows) {
      const outcomes = await validateWorkspace(db, w.id);
      total += outcomes.length;
      for (const o of outcomes) {
        if (o.status === 'ok') ok += 1;
        else failed += 1;
      }
    }
    return reply.send({ workspaces: rows.length, total, ok, failed });
  });
}
