import { isNull } from 'drizzle-orm';
import { workspaces } from '@novabash/db';
import { requireAdminToken } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { validateWorkspace } from '@/lib/server/validation';
import { err, json } from '@/lib/server/responses';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const gate = requireAdminToken(request);
  if (!gate.ok) {
    return err(
      gate.status,
      gate.status === 503 ? 'admin_token_unconfigured' : 'admin_token_required',
    );
  }

  const db = getDb();
  if (!db) return err(503, 'db_unconfigured');

  const rows = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(isNull(workspaces.deletedAt))
    .limit(1000);

  let total = 0;
  let ok = 0;
  let failed = 0;
  // Run workspaces sequentially so a single bad vendor does not blow up the
  // whole batch on hobby-tier latency budgets. Per workspace, the inner
  // validateWorkspace is already parallelised across services.
  for (const w of rows) {
    const outcomes = await validateWorkspace(db, w.id);
    total += outcomes.length;
    for (const o of outcomes) {
      if (o.status === 'ok') ok += 1;
      else failed += 1;
    }
  }
  return json({ workspaces: rows.length, total, ok, failed });
}
