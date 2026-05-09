import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    ok: true,
    service: 'novabash-api',
    version: process.env.APP_VERSION ?? '0.0.0',
    ts: new Date().toISOString(),
  }));

  app.get('/ready', async () => {
    // Will run a real db ping once the Drizzle pool is wired in week 3.
    return { ok: true, db: 'pending', vault: 'pending' };
  });
}
