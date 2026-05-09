import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@novabash/db';

/**
 * Drizzle/postgres connection.
 *
 * Returns a singleton db client when DATABASE_URL is set, otherwise null so
 * the route handlers can return a clean 503 with a helpful message instead
 * of crashing the process. Once Supabase is provisioned and DATABASE_URL is
 * pasted into Railway, the same code path lights up without any further
 * change.
 */

let _db: PostgresJsDatabase<typeof schema> | null | undefined;
let _client: ReturnType<typeof postgres> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> | null {
  if (_db !== undefined) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    _db = null;
    return null;
  }
  _client = postgres(url, {
    prepare: false, // Supabase connection pool runs in transaction-pool mode
    max: Number(process.env.DB_POOL_MAX ?? 10),
    idle_timeout: 30,
    connect_timeout: 10,
  });
  _db = drizzle(_client, { schema });
  return _db;
}

export function isDbReady(): boolean {
  return getDb() !== null;
}

export async function pingDb(): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await db.execute('select 1 as ok');
    return true;
  } catch {
    return false;
  }
}

export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.end({ timeout: 5 });
    _client = null;
    _db = undefined;
  }
}
