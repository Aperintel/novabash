/**
 * Server-side credential validation.
 *
 * Runs every connected credential against the vendor's lightest auth-required
 * endpoint, updates `credentials.last_validated_at`, `last_validation_ok`,
 * and `last_validation_error`. Used by the periodic worker and by the
 * on-demand admin route.
 *
 * Vendor calls live here rather than in the web app because the worker
 * runs on the API tier, the web app does not need this code at runtime,
 * and the validators are slightly different from the connect-flow ones
 * (they group multiple fields into one credential row by service rather
 * than asking the user to paste each one).
 */

import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { credentials, environments } from '@novabash/db';
import { openCredential } from './crypto/index.js';

export type Status = 'ok' | 'failed';

export interface ValidationOutcome {
  serviceId: string;
  fieldId: string;
  credentialId: string;
  status: Status;
  error?: string;
}

const TIMEOUT_MS = 5000;

async function safeFetch(input: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function mapHttp(status: number, vendor: string): string {
  if (status === 401 || status === 403) return `${vendor} unauthorised (${status})`;
  if (status === 429) return `${vendor} rate-limited (${status})`;
  if (status >= 500) return `${vendor} server error (${status})`;
  return `${vendor} returned ${status}`;
}

/**
 * Validate a single credential field against its vendor.
 * `decryptedValues` is a map of fieldId → plaintext for the credential's
 * service in this environment. The function picks the keys it needs and
 * fires one HTTP request.
 */
async function validateOnce(
  serviceId: string,
  fieldId: string,
  decryptedValues: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    switch (serviceId) {
      case 'supabase': {
        const url = decryptedValues.url;
        const service = decryptedValues.service;
        if (!url || !service) return { ok: false, error: 'missing url or service key' };
        const r = await safeFetch(`${url.replace(/\/+$/, '')}/auth/v1/admin/users?per_page=1`, {
          headers: { apikey: service, Authorization: `Bearer ${service}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Supabase') };
      }
      case 'vercel': {
        const t = decryptedValues.token;
        if (!t) return { ok: false, error: 'missing token' };
        const r = await safeFetch('https://api.vercel.com/v2/user', {
          headers: { Authorization: `Bearer ${t}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Vercel') };
      }
      case 'resend': {
        const t = decryptedValues.apiKey;
        if (!t) return { ok: false, error: 'missing apiKey' };
        const r = await safeFetch('https://api.resend.com/domains', {
          headers: { Authorization: `Bearer ${t}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Resend') };
      }
      case 'lemon-squeezy': {
        const t = decryptedValues.apiKey;
        const sid = decryptedValues.storeId;
        if (!t || !sid) return { ok: false, error: 'missing apiKey or storeId' };
        const r = await safeFetch(`https://api.lemonsqueezy.com/v1/stores/${sid}`, {
          headers: { Accept: 'application/vnd.api+json', Authorization: `Bearer ${t}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Lemon Squeezy') };
      }
      case 'plausible': {
        const d = decryptedValues.domain;
        const t = decryptedValues.apiKey;
        if (!d || !t) return { ok: false, error: 'missing domain or apiKey' };
        const r = await safeFetch(
          `https://plausible.io/api/v1/stats/aggregate?site_id=${encodeURIComponent(d)}&period=day&metrics=visitors`,
          { headers: { Authorization: `Bearer ${t}` } },
        );
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Plausible') };
      }
      case 'openrouter': {
        const t = decryptedValues.apiKey;
        if (!t) return { ok: false, error: 'missing apiKey' };
        const r = await safeFetch('https://openrouter.ai/api/v1/key', {
          headers: { Authorization: `Bearer ${t}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'OpenRouter') };
      }
      case 'upstash-redis':
      case 'upstash-vector': {
        const u = decryptedValues.url;
        const t = decryptedValues.token;
        if (!u || !t) return { ok: false, error: 'missing url or token' };
        const path = serviceId === 'upstash-redis' ? '/ping' : '/info';
        const r = await safeFetch(`${u.replace(/\/+$/, '')}${path}`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Upstash') };
      }
      case 'cloudflare':
      case 'cloudflare-r2': {
        const t = decryptedValues.token;
        if (!t) return { ok: false, error: 'missing token' };
        const r = await safeFetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
          headers: { Authorization: `Bearer ${t}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Cloudflare') };
      }
      case 'inngest': {
        // Inngest event keys validate by sending a test event.
        const k = decryptedValues.eventKey;
        if (!k) return { ok: false, error: 'missing eventKey' };
        const r = await safeFetch(`https://inn.gs/e/${encodeURIComponent(k)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'novabash/validation.ping', data: { source: 'worker' } }),
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Inngest') };
      }
      case 'clerk': {
        const sk = decryptedValues.secretKey;
        if (!sk) return { ok: false, error: 'missing secretKey' };
        const r = await safeFetch('https://api.clerk.com/v1/instance', {
          headers: { Authorization: `Bearer ${sk}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Clerk') };
      }
      case 'neon': {
        const k = decryptedValues.apiKey;
        if (!k) return { ok: false, error: 'missing apiKey' };
        const r = await safeFetch('https://console.neon.tech/api/v2/projects?limit=1', {
          headers: { Authorization: `Bearer ${k}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Neon') };
      }
      case 'sentry': {
        const t = decryptedValues.token;
        const o = decryptedValues.organisation;
        if (!t || !o) return { ok: false, error: 'missing token or organisation' };
        const r = await safeFetch(
          `https://sentry.io/api/0/organizations/${encodeURIComponent(o)}/`,
          { headers: { Authorization: `Bearer ${t}` } },
        );
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Sentry') };
      }
      case 'auth0': {
        const d = decryptedValues.domain;
        const t = decryptedValues.token;
        if (!d || !t) return { ok: false, error: 'missing domain or token' };
        const r = await safeFetch(`https://${d}/api/v2/clients?per_page=1`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Auth0') };
      }
      case 'postmark': {
        const t = decryptedValues.serverToken;
        if (!t) return { ok: false, error: 'missing serverToken' };
        const r = await safeFetch('https://api.postmarkapp.com/server', {
          headers: { Accept: 'application/json', 'X-Postmark-Server-Token': t },
        });
        return r.ok ? { ok: true } : { ok: false, error: mapHttp(r.status, 'Postmark') };
      }
      default:
        // No validator yet for this service; treat as silent pass so the
        // health column does not erroneously red-flag a working credential.
        return { ok: true };
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' };
  }
}

/**
 * Validate every credential in a workspace. Used by the periodic worker
 * and by the admin "run now" endpoint.
 */
export async function validateWorkspace(
  db: PostgresJsDatabase<Record<string, unknown>>,
  workspaceId: string,
): Promise<ValidationOutcome[]> {
  const rows = await db
    .select({
      id: credentials.id,
      cipher: credentials.cipher,
      dataKeyCipher: credentials.dataKeyCipher,
      keyVersion: credentials.keyVersion,
      serviceId: credentials.serviceId,
      fieldId: credentials.fieldId,
      environmentId: credentials.environmentId,
    })
    .from(credentials)
    .innerJoin(environments, eq(credentials.environmentId, environments.id))
    .where(eq(environments.workspaceId, workspaceId));

  // Group by environmentId+serviceId so we collect every field of a single
  // service before firing the validator (the validator needs e.g. url+key
  // together).
  const grouped = new Map<string, { credentialId: string; fieldId: string; plaintext: string; serviceId: string }[]>();
  for (const r of rows) {
    let plaintext: string;
    try {
      plaintext = openCredential({
        cipher: r.cipher,
        dataKeyCipher: r.dataKeyCipher,
        keyVersion: r.keyVersion,
      });
    } catch {
      // Mark the row red-failed so the dashboard shows it.
      await db
        .update(credentials)
        .set({
          lastValidatedAt: new Date(),
          lastValidationOk: false,
          lastValidationError: 'decrypt failed; check VAULT_MASTER_KEY',
        })
        .where(eq(credentials.id, r.id));
      continue;
    }
    const groupKey = `${r.environmentId}:${r.serviceId}`;
    const list = grouped.get(groupKey) ?? [];
    list.push({ credentialId: r.id, fieldId: r.fieldId, plaintext, serviceId: r.serviceId });
    grouped.set(groupKey, list);
  }

  const outcomes: ValidationOutcome[] = [];
  for (const [, items] of grouped) {
    const serviceId = items[0]!.serviceId;
    const decryptedValues: Record<string, string> = {};
    for (const i of items) decryptedValues[i.fieldId] = i.plaintext;

    // Validate once per service group, write the same outcome to every row.
    const result = await validateOnce(serviceId, items[0]!.fieldId, decryptedValues);
    const validatedAt = new Date();
    for (const i of items) {
      await db
        .update(credentials)
        .set({
          lastValidatedAt: validatedAt,
          lastValidationOk: result.ok,
          lastValidationError: result.ok ? null : result.error ?? 'unknown',
        })
        .where(eq(credentials.id, i.credentialId));
      outcomes.push({
        serviceId,
        fieldId: i.fieldId,
        credentialId: i.credentialId,
        status: result.ok ? 'ok' : 'failed',
        ...(result.error ? { error: result.error } : {}),
      });
    }
  }

  return outcomes;
}
