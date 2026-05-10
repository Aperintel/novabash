import { z } from 'zod';
import { requireAdminToken } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { validateWorkspace } from '@/lib/server/validation';
import { err, json } from '@/lib/server/responses';

export const runtime = 'nodejs';
export const maxDuration = 60; // upgraded ceiling for paid plans; hobby caps at 10s

const Query = z.object({ workspaceId: z.string().uuid() });

export async function POST(request: Request) {
  const gate = requireAdminToken(request);
  if (!gate.ok) {
    return err(
      gate.status,
      gate.status === 503 ? 'admin_token_unconfigured' : 'admin_token_required',
    );
  }

  const url = new URL(request.url);
  const parsed = Query.safeParse({ workspaceId: url.searchParams.get('workspaceId') ?? undefined });
  if (!parsed.success) return err(400, 'invalid_request');

  const db = getDb();
  if (!db) return err(503, 'db_unconfigured');

  const outcomes = await validateWorkspace(db, parsed.data.workspaceId);
  return json({ outcomes });
}
