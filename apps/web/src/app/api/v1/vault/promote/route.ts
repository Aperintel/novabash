import { z } from 'zod';
import { authenticateWorkspace } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { promoteEnvironment, type Variant } from '@/lib/server/promote';
import { err, json } from '@/lib/server/responses';

export const runtime = 'nodejs';

const Body = z.object({
  from: z.enum(['development', 'staging', 'production']),
  to: z.enum(['development', 'staging', 'production']),
  overwrite: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const auth = await authenticateWorkspace(request);
  if (!auth.ok) return err(auth.failure.status, auth.failure.code, auth.failure.message);
  const ctx = auth.ctx;

  const body = await request.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) return err(400, 'invalid_request');

  const db = getDb();
  if (!db) return err(503, 'db_unconfigured');

  const result = await promoteEnvironment(db, {
    workspaceId: ctx.workspaceId,
    serviceKeyId: ctx.serviceKeyId,
    from: parsed.data.from as Variant,
    to: parsed.data.to as Variant,
    overwrite: parsed.data.overwrite,
  });
  if (!result.ok) {
    return json(
      { error: 'promote_failed', message: result.error, ...result },
      { status: 409 },
    );
  }
  return json(result);
}
