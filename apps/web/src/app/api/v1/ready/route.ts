import { json } from '@/lib/server/responses';
import { isDbReady, pingDb } from '@/lib/server/db';

export const runtime = 'nodejs';

export async function GET() {
  const dbConfigured = isDbReady();
  const dbReachable = dbConfigured ? await pingDb() : false;
  const vaultConfigured = Boolean(process.env.VAULT_MASTER_KEY);
  return json({
    ok: dbConfigured && dbReachable && vaultConfigured,
    db: !dbConfigured ? 'unconfigured' : dbReachable ? 'ok' : 'unreachable',
    vault: vaultConfigured ? 'ok' : 'unconfigured',
  });
}
