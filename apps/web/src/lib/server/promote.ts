import 'server-only';
import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { credentials, environments } from '@novabash/db';
import { openCredential, sealCredential, AuditAction } from './crypto/index';
import { appendAudit } from './audit';

export type Variant = 'development' | 'staging' | 'production';

export interface PromoteResult {
  ok: boolean;
  copied: number;
  skipped: number;
  error?: string;
}

interface PromoteInput {
  workspaceId: string;
  serviceKeyId: string;
  from: Variant;
  to: Variant;
  /**
   * If true, existing credentials in the target environment for the same
   * (serviceId, fieldId) pair are overwritten. If false, conflicts are
   * skipped and counted.
   */
  overwrite: boolean;
}

/**
 * Promote every credential from `from` to `to`, re-sealing under a fresh
 * data key and appending one audit entry per credential plus a summary
 * entry. The intended path is staging → production with a single click in
 * the dashboard, but the route is symmetric and supports any pair.
 */
export async function promoteEnvironment(
  db: PostgresJsDatabase<Record<string, unknown>>,
  input: PromoteInput,
): Promise<PromoteResult> {
  if (input.from === input.to) {
    return { ok: false, copied: 0, skipped: 0, error: 'Source and target are the same.' };
  }

  const fromEnv = await ensureEnvRow(db, input.workspaceId, input.from);
  const toEnv = await ensureEnvRow(db, input.workspaceId, input.to);
  if (!fromEnv) {
    return {
      ok: false,
      copied: 0,
      skipped: 0,
      error: `No ${input.from} environment exists for this workspace.`,
    };
  }
  if (!toEnv) {
    return {
      ok: false,
      copied: 0,
      skipped: 0,
      error: `Could not create the ${input.to} environment.`,
    };
  }

  const sourceRows = await db
    .select({
      id: credentials.id,
      cipher: credentials.cipher,
      dataKeyCipher: credentials.dataKeyCipher,
      keyVersion: credentials.keyVersion,
      serviceId: credentials.serviceId,
      fieldId: credentials.fieldId,
      envName: credentials.envName,
    })
    .from(credentials)
    .where(eq(credentials.environmentId, fromEnv.id));

  const targetRows = await db
    .select({
      id: credentials.id,
      serviceId: credentials.serviceId,
      fieldId: credentials.fieldId,
    })
    .from(credentials)
    .where(eq(credentials.environmentId, toEnv.id));

  const targetByKey = new Map(
    targetRows.map((r) => [`${r.serviceId}::${r.fieldId}`, r.id]),
  );

  let copied = 0;
  let skipped = 0;
  for (const r of sourceRows) {
    const key = `${r.serviceId}::${r.fieldId}`;
    const targetId = targetByKey.get(key);
    if (targetId && !input.overwrite) {
      skipped += 1;
      continue;
    }

    let plaintext: string;
    try {
      plaintext = openCredential({
        cipher: r.cipher,
        dataKeyCipher: r.dataKeyCipher,
        keyVersion: r.keyVersion,
      });
    } catch {
      return {
        ok: false,
        copied,
        skipped,
        error: 'Decryption failed during promote. Check VAULT_MASTER_KEY.',
      };
    }
    const sealed = sealCredential(plaintext);

    if (targetId) {
      await db
        .update(credentials)
        .set({
          cipher: sealed.cipher,
          dataKeyCipher: sealed.dataKeyCipher,
          keyVersion: sealed.keyVersion,
          envName: r.envName,
          lastValidatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(credentials.id, targetId));
    } else {
      await db.insert(credentials).values({
        environmentId: toEnv.id,
        serviceId: r.serviceId,
        fieldId: r.fieldId,
        envName: r.envName,
        cipher: sealed.cipher,
        dataKeyCipher: sealed.dataKeyCipher,
        keyVersion: sealed.keyVersion,
      });
    }

    await appendAudit(db, {
      workspaceId: input.workspaceId,
      actorTokenId: input.serviceKeyId,
      action: AuditAction.CredentialCreated,
      target: `${r.serviceId}/${r.fieldId}`,
      payload: {
        promote: true,
        from: input.from,
        to: input.to,
        overwrote: Boolean(targetId),
      },
      occurredAt: new Date().toISOString(),
    });

    copied += 1;
  }

  await appendAudit(db, {
    workspaceId: input.workspaceId,
    actorTokenId: input.serviceKeyId,
    action: 'environment.promoted',
    target: `${input.from}->${input.to}`,
    payload: { copied, skipped, overwrite: input.overwrite },
    occurredAt: new Date().toISOString(),
  });

  return { ok: true, copied, skipped };
}

async function ensureEnvRow(
  db: PostgresJsDatabase<Record<string, unknown>>,
  workspaceId: string,
  name: Variant,
) {
  const existing = await db
    .select()
    .from(environments)
    .where(and(eq(environments.workspaceId, workspaceId), eq(environments.name, name)))
    .limit(1);
  if (existing[0]) return existing[0];
  const inserted = await db
    .insert(environments)
    .values({ workspaceId, name })
    .returning();
  return inserted[0] ?? null;
}
