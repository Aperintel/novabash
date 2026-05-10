import 'server-only';
import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { credentials, environments } from '@novabash/db';
import { openCredential, AuditAction } from './crypto/index';
import { appendAudit } from './audit';

export type Variant = 'development' | 'staging' | 'production';

interface GenerateInput {
  workspaceId: string;
  variant: Variant;
  serviceKeyId: string;
}

export interface GenerateResult {
  ok: boolean;
  variant: Variant;
  filename: string;
  content: string;
  count: number;
  error?: string;
}

const variantPrefix: Record<Variant, string> = {
  development: '',
  staging: 'STAGING_',
  production: 'PROD_',
};

const filenameByVariant: Record<Variant, string> = {
  development: '.env.local',
  staging: '.env.staging',
  production: '.env.production',
};

/**
 * Generate the .env body for a workspace + variant by reading every
 * credential in that environment, decrypting under envelope encryption, and
 * formatting with the right framework conventions. Emits an EnvGenerated
 * audit event.
 *
 * The function never logs the decrypted values. Audit payload only carries
 * the count and the env names.
 */
export async function generateEnvForWorkspace(
  db: PostgresJsDatabase<Record<string, unknown>>,
  input: GenerateInput,
): Promise<GenerateResult> {
  const { workspaceId, variant, serviceKeyId } = input;

  const envRows = await db
    .select()
    .from(environments)
    .where(and(eq(environments.workspaceId, workspaceId), eq(environments.name, variant)))
    .limit(1);
  const env = envRows[0];
  if (!env) {
    return {
      ok: false,
      variant,
      filename: filenameByVariant[variant],
      content: '',
      count: 0,
      error: `No ${variant} environment exists for this workspace.`,
    };
  }

  const credRows = await db
    .select({
      id: credentials.id,
      cipher: credentials.cipher,
      dataKeyCipher: credentials.dataKeyCipher,
      keyVersion: credentials.keyVersion,
      envName: credentials.envName,
      serviceId: credentials.serviceId,
      fieldId: credentials.fieldId,
    })
    .from(credentials)
    .where(eq(credentials.environmentId, env.id))
    .orderBy(credentials.serviceId, credentials.fieldId);

  const lines: string[] = [
    `# NovaBash · ${variant} · ${new Date().toISOString()}`,
    `# rotate, regenerate, and audit at https://novabash.dev/workspace`,
    '',
  ];

  let lastService = '';
  let count = 0;
  for (const c of credRows) {
    let plaintext: string;
    try {
      plaintext = openCredential({
        cipher: c.cipher,
        dataKeyCipher: c.dataKeyCipher,
        keyVersion: c.keyVersion,
      });
    } catch {
      return {
        ok: false,
        variant,
        filename: filenameByVariant[variant],
        content: '',
        count: 0,
        error: 'A credential failed to decrypt. The vault master key may have rotated.',
      };
    }
    if (c.serviceId !== lastService) {
      if (lines.length > 3) lines.push('');
      lines.push(`# ${c.serviceId}`);
      lastService = c.serviceId;
    }
    const name = c.envName.startsWith('NEXT_PUBLIC_')
      ? c.envName
      : `${variantPrefix[variant]}${c.envName}`;
    lines.push(`${name}=${plaintext}`);
    count += 1;
  }

  const content = lines.join('\n') + '\n';

  await appendAudit(db, {
    workspaceId,
    actorTokenId: serviceKeyId,
    action: AuditAction.EnvGenerated,
    target: variant,
    payload: { count },
    occurredAt: new Date().toISOString(),
  });

  return {
    ok: true,
    variant,
    filename: filenameByVariant[variant],
    content,
    count,
  };
}
