import 'server-only';
import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@novabash/db';

/**
 * Drizzle/postgres connection.
 *
 * Singleton when DATABASE_URL is set, null otherwise so route handlers can
 * return a clean 503 instead of crashing the process. Same code path lights
 * up the moment the Supabase connection string is pasted into Vercel.
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
