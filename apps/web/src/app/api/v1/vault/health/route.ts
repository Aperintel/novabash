import { eq } from 'drizzle-orm';
import { credentials, environments } from '@novabash/db';
import { authenticateWorkspace } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { calculateKeyHealth } from '@/lib/server/health';
import { err, json } from '@/lib/server/responses';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = await authenticateWorkspace(request);
  if (!auth.ok) return err(auth.failure.status, auth.failure.code, auth.failure.message);
  const ctx = auth.ctx;

  const db = getDb();
  if (!db) return err(503, 'db_unconfigured');

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
  return json({
    credentials: rows.map((r) => ({
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
    })),
    gradedAt: now.toISOString(),
  });
}
