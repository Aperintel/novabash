import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { auditLog } from '@novabash/db';
import { authenticateWorkspace } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { err, json } from '@/lib/server/responses';

export const runtime = 'nodejs';

const Query = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function GET(request: Request) {
  const auth = await authenticateWorkspace(request);
  if (!auth.ok) return err(auth.failure.status, auth.failure.code, auth.failure.message);
  const ctx = auth.ctx;

  const url = new URL(request.url);
  const parsed = Query.safeParse({ limit: url.searchParams.get('limit') ?? undefined });
  if (!parsed.success) return err(400, 'invalid_request');

  const db = getDb();
  if (!db) return json({ entries: [], cursor: null, db: 'unconfigured' });

  const rows = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.workspaceId, ctx.workspaceId))
    .orderBy(desc(auditLog.occurredAt))
    .limit(parsed.data.limit);
  return json({ entries: rows, cursor: null });
}
