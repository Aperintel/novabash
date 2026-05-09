import type { FastifyInstance } from 'fastify';
import { isDbReady, pingDb } from '../db.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    ok: true,
    service: 'novabash-api',
    version: process.env.APP_VERSION ?? '0.0.0',
    ts: new Date().toISOString(),
  }));

  app.get('/ready', async () => {
    const dbConfigured = isDbReady();
    const dbReachable = dbConfigured ? await pingDb() : false;
    const vaultConfigured = Boolean(process.env.VAULT_MASTER_KEY);
    const ready = dbConfigured && dbReachable && vaultConfigured;
    return {
      ok: ready,
      db: !dbConfigured ? 'unconfigured' : dbReachable ? 'ok' : 'unreachable',
      vault: vaultConfigured ? 'ok' : 'unconfigured',
    };
  });
}
