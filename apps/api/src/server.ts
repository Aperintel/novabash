import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import { healthRoutes } from './routes/health.js';
import { cliRoutes } from './routes/cli.js';
import { vaultRoutes } from './routes/vault.js';
import { buildRateLimitOptions } from './rate-limit.js';

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino/file', options: { destination: 1 } }
          : undefined,
    },
    bodyLimit: 64 * 1024,
    trustProxy: true,
  });

  await app.register(sensible);
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });
  await app.register(cors, {
    origin: parseOrigins(process.env.ALLOWED_ORIGINS),
    credentials: true,
  });
  await app.register(rateLimit, buildRateLimitOptions());

  await app.register(healthRoutes, { prefix: '/v1' });
  await app.register(cliRoutes, { prefix: '/v1/cli' });
  await app.register(vaultRoutes, { prefix: '/v1/vault' });

  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ error: 'not_found' });
  });

  return app;
}

function parseOrigins(env: string | undefined): string[] {
  if (!env) return ['http://localhost:3000'];
  return env
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
