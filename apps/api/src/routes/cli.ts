import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

/**
 * CLI-side routes. The CLI authenticates via device-code flow (web grants
 * a workspace key, CLI exchanges short code for the key). All routes below
 * the /v1/cli prefix require a workspace-key Bearer token in week 3 onwards.
 */

export async function cliRoutes(app: FastifyInstance) {
  app.post('/device/start', async () => {
    // Stub: real implementation issues a short code, stores pending grant in
    // Postgres, returns code + verification URL.
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
    // Stub: real implementation looks up the grant and returns the workspace
    // key once the user has confirmed in the browser.
    return reply.code(202).send({ status: 'authorization_pending' });
  });

  app.get('/env', async (req, reply) => {
    const Query = z.object({
      variant: z.enum(['development', 'staging', 'production']).default('development'),
    });
    const parsed = Query.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });
    // Stub: real implementation looks up the workspace via the bearer token,
    // decrypts each credential under the master key, and returns the assembled
    // .env body.
    return reply.code(503).send({
      error: 'not_implemented',
      message: 'Real env generation lands in week 3 of the build.',
    });
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
