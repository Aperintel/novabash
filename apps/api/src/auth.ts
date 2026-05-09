import type { FastifyRequest } from 'fastify';
import { eq, and, isNull } from 'drizzle-orm';
import { getDb } from './db.js';
import { hashWorkspaceKey, looksLikeWorkspaceKey } from './crypto/index.js';
import { serviceKeys, workspaces } from '@novabash/db';

/**
 * Workspace-key bearer auth.
 *
 * The CLI and the web Server Actions both call vault routes with a
 *   Authorization: Bearer nbk_<scope>_<entropy>_<checksum>
 * header. The token is hashed and looked up against `service_keys.token_hash`
 * which gives us the workspace ID. The plaintext token never leaves the
 * caller's machine; the database only ever stores the sha256.
 */

export interface WorkspaceContext {
  workspaceId: string;
  ownerId: string;
  serviceKeyId: string;
  scope: string;
}

export class AuthError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function authenticate(req: FastifyRequest): Promise<WorkspaceContext> {
  const auth = req.headers.authorization ?? '';
  if (!auth.startsWith('Bearer ')) {
    throw new AuthError(401, 'missing_bearer', 'Authorization header missing or malformed.');
  }
  const token = auth.slice('Bearer '.length).trim();
  if (!looksLikeWorkspaceKey(token)) {
    throw new AuthError(401, 'malformed_token', 'Workspace key is malformed.');
  }
  const db = getDb();
  if (!db) {
    throw new AuthError(
      503,
      'db_unconfigured',
      'API database is not configured. Set DATABASE_URL.',
    );
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
    throw new AuthError(401, 'unknown_token', 'Workspace key was not recognised.');
  }

  // Update lastUsedAt opportunistically. Failure here is not fatal.
  void db
    .update(serviceKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(serviceKeys.id, row.keyId))
    .catch(() => undefined);

  return {
    workspaceId: row.workspaceId,
    ownerId: row.ownerId,
    serviceKeyId: row.keyId,
    scope: row.scope,
  };
}
