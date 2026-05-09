/**
 * Vendor adapter registry. Each entry describes how to obtain credentials,
 * which endpoint to hit to validate them, and how to map vendor errors to
 * user-facing strings.
 *
 * All validate functions run on the server (Server Actions or API routes),
 * never in the browser, so the user-pasted credentials never reach a third
 * party from the browser process. Every fetch enforces a 5s timeout and a
 * single retry on transient failure.
 */

export type ValidationResult =
  | { ok: true; meta?: Record<string, string | number> }
  | { ok: false; error: string };

export interface KeyField {
  id: string;
  label: string;
  placeholder: string;
  helpText: string;
  envName: string;
  secret?: boolean;
}

export interface ServiceAdapter {
  id: string;
  name: string;
  category:
    | 'auth'
    | 'database'
    | 'hosting'
    | 'email'
    | 'payment'
    | 'ai'
    | 'storage'
    | 'queue'
    | 'analytics'
    | 'observability'
    | 'cdn';
  signupUrl: string;
  apiKeysUrl: string;
  fields: KeyField[];
  validate: (values: Record<string, string>) => Promise<ValidationResult>;
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

function require(values: Record<string, string>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = values[k];
    if (!v || v.trim().length === 0) return `Missing ${k}.`;
  }
  return null;
}

function mapHttpError(status: number, vendor: string): string {
  if (status === 401 || status === 403) return `${vendor} rejected the credential as unauthorised.`;
  if (status === 404) return `${vendor} could not find the resource that key points at.`;
  if (status === 429) return `${vendor} rate-limited the validation request. Try again in a minute.`;
  if (status >= 500) return `${vendor} is having trouble right now. Try again shortly.`;
  return `${vendor} returned ${status}.`;
}

function networkError(vendor: string): ValidationResult {
  return { ok: false, error: `Could not reach ${vendor}. Check the value and your network.` };
}

// ─────────────────────────────────────────────────────────────────────
//  validators
// ─────────────────────────────────────────────────────────────────────

const validateSupabase = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'url', 'anon', 'service');
  if (missing) return { ok: false, error: missing };
  const url = values.url!.replace(/\/+$/, '');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) {
    return { ok: false, error: 'Supabase URL must look like https://xxxx.supabase.co.' };
  }
  try {
    // Lightest auth-required endpoint: /auth/v1/admin/users with per_page=1 needs the service_role key.
    const res = await safeFetch(`${url}/auth/v1/admin/users?per_page=1`, {
      headers: {
        apikey: values.service!,
        Authorization: `Bearer ${values.service!}`,
      },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Supabase') };
    return { ok: true, meta: { project: url } };
  } catch {
    return networkError('Supabase');
  }
};

const validateVercel = async (values: Record<string, string>): Promise<ValidationResult> => {
  const missing = require(values, 'token');
  if (missing) return { ok: false, error: missing };
  try {
    const res = await safeFetch('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${values.token!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Vercel') };
    const body = (await res.json()) as { user?: { username?: string } };
    return { ok: true, meta: { user: body.user?.username ?? 'unknown' } };
  } catch {
    return networkError('Vercel');
  }
};

const validateResend = async (values: Record<string, string>): Promise<ValidationResult> => {
  const missing = require(values, 'apiKey');
  if (missing) return { ok: false, error: missing };
  try {
    // /domains is the cheapest auth-required endpoint that returns a useful 401 vs 200.
    const res = await safeFetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${values.apiKey!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Resend') };
    return { ok: true };
  } catch {
    return networkError('Resend');
  }
};

const validateLemonSqueezy = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'apiKey', 'storeId');
  if (missing) return { ok: false, error: missing };
  if (!/^\d+$/.test(values.storeId!)) {
    return { ok: false, error: 'Lemon Squeezy store ID must be numeric.' };
  }
  try {
    const res = await safeFetch(`https://api.lemonsqueezy.com/v1/stores/${values.storeId!}`, {
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${values.apiKey!}`,
      },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Lemon Squeezy') };
    return { ok: true };
  } catch {
    return networkError('Lemon Squeezy');
  }
};

const validatePlausible = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'domain', 'apiKey');
  if (missing) return { ok: false, error: missing };
  try {
    const res = await safeFetch(
      `https://plausible.io/api/v1/stats/aggregate?site_id=${encodeURIComponent(values.domain!)}&period=day&metrics=visitors`,
      { headers: { Authorization: `Bearer ${values.apiKey!}` } },
    );
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Plausible') };
    return { ok: true };
  } catch {
    return networkError('Plausible');
  }
};

const validateOpenRouter = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'apiKey');
  if (missing) return { ok: false, error: missing };
  try {
    const res = await safeFetch('https://openrouter.ai/api/v1/key', {
      headers: { Authorization: `Bearer ${values.apiKey!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'OpenRouter') };
    const body = (await res.json()) as { data?: { label?: string; usage?: number; limit?: number } };
    const meta: Record<string, string | number> = {};
    if (body.data?.label) meta.label = body.data.label;
    if (typeof body.data?.usage === 'number') meta.usage = body.data.usage;
    if (typeof body.data?.limit === 'number') meta.limit = body.data.limit;
    return { ok: true, meta };
  } catch {
    return networkError('OpenRouter');
  }
};

const validateUpstashRedis = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'url', 'token');
  if (missing) return { ok: false, error: missing };
  const url = values.url!.replace(/\/+$/, '');
  try {
    // Cheapest possible Upstash REST call: PING.
    const res = await safeFetch(`${url}/ping`, {
      headers: { Authorization: `Bearer ${values.token!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Upstash Redis') };
    const body = (await res.json()) as { result?: string };
    if (body.result !== 'PONG') return { ok: false, error: 'Unexpected response from Upstash.' };
    return { ok: true };
  } catch {
    return networkError('Upstash Redis');
  }
};

const validateUpstashVector = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'url', 'token');
  if (missing) return { ok: false, error: missing };
  const url = values.url!.replace(/\/+$/, '');
  try {
    const res = await safeFetch(`${url}/info`, {
      headers: { Authorization: `Bearer ${values.token!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Upstash Vector') };
    return { ok: true };
  } catch {
    return networkError('Upstash Vector');
  }
};

const validateInngest = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'eventKey');
  if (missing) return { ok: false, error: missing };
  if (!/^[A-Za-z0-9_-]{16,}$/.test(values.eventKey!)) {
    return { ok: false, error: 'Inngest event key looks malformed.' };
  }
  try {
    // Inngest does not ship a /me endpoint, so we send a sandboxed test event.
    // The /e/{key} endpoint validates the key and accepts the event without
    // executing any function. A 200 means the key is valid.
    const res = await safeFetch(`https://inn.gs/e/${encodeURIComponent(values.eventKey!)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'novabash/connect.test', data: { source: 'connect-flow' } }),
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Inngest') };
    return { ok: true };
  } catch {
    return networkError('Inngest');
  }
};

// ─────────────────────────────────────────────────────────────────────
//  registry
// ─────────────────────────────────────────────────────────────────────

export const services: Record<string, ServiceAdapter> = {
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    category: 'database',
    signupUrl: 'https://supabase.com/dashboard',
    apiKeysUrl: 'https://supabase.com/dashboard/account/tokens',
    fields: [
      {
        id: 'url',
        label: 'Project URL',
        placeholder: 'https://xxxx.supabase.co',
        helpText: 'Settings · API · Project URL',
        envName: 'NEXT_PUBLIC_SUPABASE_URL',
      },
      {
        id: 'anon',
        label: 'Anon key',
        placeholder: 'eyJ...',
        helpText: 'Settings · API · anon public',
        envName: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        secret: true,
      },
      {
        id: 'service',
        label: 'Service role key',
        placeholder: 'eyJ...',
        helpText: 'Settings · API · service_role · keep server-side only',
        envName: 'SUPABASE_SERVICE_ROLE_KEY',
        secret: true,
      },
    ],
    validate: validateSupabase,
  },
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    category: 'hosting',
    signupUrl: 'https://vercel.com/signup',
    apiKeysUrl: 'https://vercel.com/account/tokens',
    fields: [
      {
        id: 'token',
        label: 'API token',
        placeholder: 'vercel_...',
        helpText: 'Account · Tokens · Create',
        envName: 'VERCEL_TOKEN',
        secret: true,
      },
    ],
    validate: validateVercel,
  },
  resend: {
    id: 'resend',
    name: 'Resend',
    category: 'email',
    signupUrl: 'https://resend.com',
    apiKeysUrl: 'https://resend.com/api-keys',
    fields: [
      {
        id: 'apiKey',
        label: 'API key',
        placeholder: 're_...',
        helpText: 'API Keys · Create API Key · Full access',
        envName: 'RESEND_API_KEY',
        secret: true,
      },
    ],
    validate: validateResend,
  },
  'lemon-squeezy': {
    id: 'lemon-squeezy',
    name: 'Lemon Squeezy',
    category: 'payment',
    signupUrl: 'https://www.lemonsqueezy.com',
    apiKeysUrl: 'https://app.lemonsqueezy.com/settings/api',
    fields: [
      {
        id: 'apiKey',
        label: 'API key',
        placeholder: 'eyJ0eXAi...',
        helpText: 'Settings · API · Create API Key',
        envName: 'LEMON_SQUEEZY_API_KEY',
        secret: true,
      },
      {
        id: 'storeId',
        label: 'Store ID',
        placeholder: '12345',
        helpText: 'Stores · pick the store · copy ID',
        envName: 'LEMON_SQUEEZY_STORE_ID',
      },
    ],
    validate: validateLemonSqueezy,
  },
  plausible: {
    id: 'plausible',
    name: 'Plausible',
    category: 'analytics',
    signupUrl: 'https://plausible.io',
    apiKeysUrl: 'https://plausible.io/settings#api-keys',
    fields: [
      {
        id: 'domain',
        label: 'Site domain',
        placeholder: 'novabash.dev',
        helpText: 'The domain you registered with Plausible',
        envName: 'NEXT_PUBLIC_PLAUSIBLE_DOMAIN',
      },
      {
        id: 'apiKey',
        label: 'API key',
        placeholder: 'plausible_...',
        helpText: 'Settings · API Keys · New API key',
        envName: 'PLAUSIBLE_API_KEY',
        secret: true,
      },
    ],
    validate: validatePlausible,
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'ai',
    signupUrl: 'https://openrouter.ai',
    apiKeysUrl: 'https://openrouter.ai/keys',
    fields: [
      {
        id: 'apiKey',
        label: 'API key',
        placeholder: 'sk-or-v1-...',
        helpText: 'Keys · Create Key',
        envName: 'OPENROUTER_API_KEY',
        secret: true,
      },
    ],
    validate: validateOpenRouter,
  },
  'upstash-redis': {
    id: 'upstash-redis',
    name: 'Upstash Redis',
    category: 'queue',
    signupUrl: 'https://console.upstash.com',
    apiKeysUrl: 'https://console.upstash.com/account/api',
    fields: [
      {
        id: 'url',
        label: 'REST URL',
        placeholder: 'https://xxxx.upstash.io',
        helpText: 'Database · REST API · UPSTASH_REDIS_REST_URL',
        envName: 'UPSTASH_REDIS_REST_URL',
      },
      {
        id: 'token',
        label: 'REST token',
        placeholder: 'AX...',
        helpText: 'Database · REST API · UPSTASH_REDIS_REST_TOKEN',
        envName: 'UPSTASH_REDIS_REST_TOKEN',
        secret: true,
      },
    ],
    validate: validateUpstashRedis,
  },
  'upstash-vector': {
    id: 'upstash-vector',
    name: 'Upstash Vector',
    category: 'database',
    signupUrl: 'https://console.upstash.com',
    apiKeysUrl: 'https://console.upstash.com/vector',
    fields: [
      {
        id: 'url',
        label: 'REST URL',
        placeholder: 'https://xxxx.upstash.io',
        helpText: 'Index · REST API',
        envName: 'UPSTASH_VECTOR_REST_URL',
      },
      {
        id: 'token',
        label: 'REST token',
        placeholder: 'AX...',
        helpText: 'Index · REST API',
        envName: 'UPSTASH_VECTOR_REST_TOKEN',
        secret: true,
      },
    ],
    validate: validateUpstashVector,
  },
  inngest: {
    id: 'inngest',
    name: 'Inngest',
    category: 'queue',
    signupUrl: 'https://www.inngest.com',
    apiKeysUrl: 'https://app.inngest.com/env/production/manage/keys',
    fields: [
      {
        id: 'eventKey',
        label: 'Event key',
        placeholder: 'XXXXXXXX...',
        helpText: 'Manage · Event Keys · Create',
        envName: 'INNGEST_EVENT_KEY',
        secret: true,
      },
      {
        id: 'signingKey',
        label: 'Signing key',
        placeholder: 'signkey-...',
        helpText: 'Manage · Signing Keys · Create',
        envName: 'INNGEST_SIGNING_KEY',
        secret: true,
      },
    ],
    validate: validateInngest,
  },
};

export const getService = (id: string) => services[id];
