import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { auditLog } from '@novabash/db';
import { authenticateWorkspace } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { generateEnvForWorkspace, type Variant } from '@/lib/server/env-generator';
import { AuditAction } from '@/lib/server/crypto';
import { appendAudit } from '@/lib/server/audit';
import { capture, Events } from '@/lib/server/analytics';
import { err } from '@/lib/server/responses';

export const runtime = 'nodejs';

const Query = z.object({
  variant: z.enum(['development', 'staging', 'production']).default('development'),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = Query.safeParse({
    variant: url.searchParams.get('variant') ?? undefined,
  });
  if (!parsed.success) return err(400, 'invalid_request');

  const auth = await authenticateWorkspace(request);
  if (!auth.ok) return err(auth.failure.status, auth.failure.code, auth.failure.message);
  const ctx = auth.ctx;

  const db = getDb();
  if (!db) return err(503, 'db_unconfigured', 'API database is not configured.');

  const result = await generateEnvForWorkspace(db, {
    workspaceId: ctx.workspaceId,
    variant: parsed.data.variant as Variant,
    serviceKeyId: ctx.serviceKeyId,
  });
  if (!result.ok) return err(409, 'generate_failed', result.error);

  await appendAudit(db, {
    workspaceId: ctx.workspaceId,
    actorTokenId: ctx.serviceKeyId,
    action: AuditAction.EnvDownloaded,
    target: result.variant,
    payload: { count: result.count, filename: result.filename, surface: 'cli' },
    occurredAt: new Date().toISOString(),
  });

  // Activation event: detect the workspace's first env download.
  const priorDownloads = await db
    .select({ id: auditLog.id })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.workspaceId, ctx.workspaceId),
        eq(auditLog.action, AuditAction.EnvDownloaded),
      ),
    )
    .limit(2);
  const isFirst = priorDownloads.length <= 1;

  void capture({
    workspaceId: ctx.workspaceId,
    event: isFirst ? Events.EnvDownloadedFirst : Events.EnvDownloaded,
    properties: { variant: result.variant, count: result.count, surface: 'cli' },
  });

  return new Response(result.content, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': `attachment; filename="${result.filename}"`,
    },
  });
}
