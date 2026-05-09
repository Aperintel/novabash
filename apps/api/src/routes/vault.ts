import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

/**
 * Vault-side routes. All routes below the /v1/vault prefix require a session
 * cookie issued by Supabase Auth. CRUD on credentials, validation pings,
 * audit log reads.
 */

export async function vaultRoutes(app: FastifyInstance) {
  app.post('/credentials', async (req, reply) => {
    const Body = z.object({
      environmentId: z.string().uuid(),
      serviceId: z.string().min(1).max(64),
      fieldId: z.string().min(1).max(64),
      envName: z.string().min(1).max(128),
      value: z.string().min(1).max(8192),
    });
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });
    // Stub: real implementation calls validate-against-vendor, then writes
    // an envelope-encrypted row to the credentials table, then appends an
    // audit_log entry, all in one transaction.
    return reply.code(503).send({ error: 'not_implemented' });
  });

  app.post('/credentials/:id/rotate', async (req, reply) => {
    const Params = z.object({ id: z.string().uuid() });
    const parsed = Params.safeParse(req.params);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });
    return reply.code(503).send({ error: 'not_implemented' });
  });

  app.get('/audit', async () => {
    // Stub: returns hash-chained audit entries scoped to the workspace.
    return { entries: [], cursor: null };
  });
}
