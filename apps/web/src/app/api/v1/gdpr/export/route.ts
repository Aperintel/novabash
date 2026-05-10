import { eq } from 'drizzle-orm';
import {
  workspaces,
  environments,
  credentials,
  serviceKeys,
  auditLog,
  bundleStars,
  bundleReviews,
  bundlesPublished,
  userProfile,
} from '@novabash/db';
import { authenticateWorkspace } from '@/lib/server/auth';
import { getDb } from '@/lib/server/db';
import { appendAudit } from '@/lib/server/audit';
import { err } from '@/lib/server/responses';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: Request) {
  const auth = await authenticateWorkspace(request);
  if (!auth.ok) return err(auth.failure.status, auth.failure.code, auth.failure.message);
  const ctx = auth.ctx;

  const db = getDb();
  if (!db) return err(503, 'db_unconfigured');

  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, ctx.workspaceId));
  if (!ws) return err(404, 'workspace_not_found');

  const [profile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, ws.ownerId));

  const envs = await db.select().from(environments).where(eq(environments.workspaceId, ws.id));
  const keys = await db.select().from(serviceKeys).where(eq(serviceKeys.workspaceId, ws.id));
  const audit = await db.select().from(auditLog).where(eq(auditLog.workspaceId, ws.id));

  const credRows = envs[0]
    ? await db.select().from(credentials).where(eq(credentials.environmentId, envs[0].id))
    : [];

  const stars = await db.select().from(bundleStars).where(eq(bundleStars.userId, ws.ownerId));
  const reviews = await db
    .select()
    .from(bundleReviews)
    .where(eq(bundleReviews.userId, ws.ownerId));
  const published = await db
    .select()
    .from(bundlesPublished)
    .where(eq(bundlesPublished.authorUserId, ws.ownerId));

  await appendAudit(db, {
    workspaceId: ws.id,
    actorTokenId: ctx.serviceKeyId,
    action: 'gdpr.exported',
    target: ws.id,
    payload: {
      envs: envs.length,
      credentials: credRows.length,
      auditEntries: audit.length,
    },
    occurredAt: new Date().toISOString(),
  });

  const payload = {
    schema: 'novabash.gdpr.export.v1',
    generatedAt: new Date().toISOString(),
    profile,
    workspace: ws,
    environments: envs,
    credentials: credRows,
    serviceKeys: keys.map((k) => ({ ...k, tokenHash: '<redacted>' })),
    auditLog: audit,
    community: { stars, reviews, published },
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="novabash-export-${ws.slug}-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}
