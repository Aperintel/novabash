import 'server-only';
import { eq, and, isNull } from 'drizzle-orm';
import { getDb } from './db';
import { hashWorkspaceKey, looksLikeWorkspaceKey, safeEqual } from './crypto';
import { serviceKeys, workspaces } from '@novabash/db';

/**
 * Workspace-key bearer auth.
 *
 * The CLI, the GitHub Action, and the web Server Actions all call protected
 * routes with `Authorization: Bearer nbk_<scope>_<entropy>_<checksum>`. The
 * token is hashed and looked up against `service_keys.token_hash`, which
 * resolves the workspace context. Plaintext never leaves the caller; the
 * database only stores the sha256.
 *
 * Sibling helper `requireAdminToken` gates the admin endpoints behind a
 * single shared secret with constant-time compare.
 */

export interface WorkspaceContext {
  workspaceId: string;
  ownerId: string;
  serviceKeyId: string;
  scope: string;
}

export interface AuthFailure {
  status: number;
  code: string;
  message: string;
}

export type AuthResult =
  | { ok: true; ctx: WorkspaceContext }
  | { ok: false; failure: AuthFailure };

export async function authenticateWorkspace(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      failure: {
        status: 401,
        code: 'missing_bearer',
        message: 'Authorization header missing or malformed.',
      },
    };
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!looksLikeWorkspaceKey(token)) {
    return {
      ok: false,
      failure: { status: 401, code: 'malformed_token', message: 'Workspace key is malformed.' },
    };
  }
  const db = getDb();
  if (!db) {
    return {
      ok: false,
      failure: {
        status: 503,
        code: 'db_unconfigured',
        message: 'API database is not configured. Set DATABASE_URL.',
      },
    };
  }
  const tokenHash = hashWorkspaceKey(token);
  const rows = await db
    .select({
      keyId: serviceKeys.id,
      workspaceId: serviceKeys.workspaceId,
      scope: serviceKeys.scope,
      revokedAt: serviceKeys.revokedAt,
      ownerId: workspaces.ownerId,
    })
    .from(serviceKeys)
    .innerJoin(workspaces, eq(serviceKeys.workspaceId, workspaces.id))
    .where(
      and(
        eq(serviceKeys.tokenHash, tokenHash),
        isNull(serviceKeys.revokedAt),
        isNull(workspaces.deletedAt),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) {
    return {
      ok: false,
      failure: { status: 401, code: 'unknown_token', message: 'Workspace key was not recognised.' },
    };
  }

  // Update lastUsedAt opportunistically. Failure here is not fatal.
  void db
    .update(serviceKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(serviceKeys.id, row.keyId))
    .catch(() => undefined);

  return {
    ok: true,
    ctx: {
      workspaceId: row.workspaceId,
      ownerId: row.ownerId,
      serviceKeyId: row.keyId,
      scope: row.scope,
    },
  };
}

export function requireAdminToken(request: Request): { ok: true } | { ok: false; status: number } {
  const provided = request.headers.get('x-admin-token') ?? '';
  const expected = process.env.ADMIN_TOKEN ?? '';
  if (!expected) return { ok: false, status: 503 };
  if (provided.length === 0) return { ok: false, status: 401 };
  return safeEqual(provided, expected) ? { ok: true } : { ok: false, status: 401 };
}
