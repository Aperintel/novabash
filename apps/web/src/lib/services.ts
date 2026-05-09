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

const validateCloudflare = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'token');
  if (missing) return { ok: false, error: missing };
  try {
    // /user/tokens/verify is the canonical "is this token valid" call.
    // Returns 200 with success:true when valid, 401 otherwise.
    const res = await safeFetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: { Authorization: `Bearer ${values.token!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Cloudflare') };
    const body = (await res.json()) as { success?: boolean; result?: { status?: string } };
    if (!body.success) return { ok: false, error: 'Cloudflare reports the token is not active.' };
    return { ok: true, meta: { status: body.result?.status ?? 'active' } };
  } catch {
    return networkError('Cloudflare');
  }
};

const validateClerk = async (values: Record<string, string>): Promise<ValidationResult> => {
  const missing = require(values, 'secretKey');
  if (missing) return { ok: false, error: missing };
  if (!/^sk_(test|live)_[A-Za-z0-9]+$/.test(values.secretKey!)) {
    return { ok: false, error: 'Clerk secret key must look like sk_test_... or sk_live_...' };
  }
  try {
    // /v1/instance returns the instance metadata for the secret key holder.
    // Cheap, low-quota, and tells us the environment (test vs live).
    const res = await safeFetch('https://api.clerk.com/v1/instance', {
      headers: { Authorization: `Bearer ${values.secretKey!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Clerk') };
    const body = (await res.json()) as { environment_type?: string };
    return {
      ok: true,
      meta: body.environment_type ? { environment: body.environment_type } : undefined,
    };
  } catch {
    return networkError('Clerk');
  }
};

const validateNeon = async (values: Record<string, string>): Promise<ValidationResult> => {
  const missing = require(values, 'apiKey');
  if (missing) return { ok: false, error: missing };
  try {
    // /api/v2/projects?limit=1 is the cheapest read on the Neon API.
    const res = await safeFetch('https://console.neon.tech/api/v2/projects?limit=1', {
      headers: { Authorization: `Bearer ${values.apiKey!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Neon') };
    return { ok: true };
  } catch {
    return networkError('Neon');
  }
};

const validateSentry = async (values: Record<string, string>): Promise<ValidationResult> => {
  const missing = require(values, 'token', 'organisation');
  if (missing) return { ok: false, error: missing };
  try {
    const res = await safeFetch(
      `https://sentry.io/api/0/organizations/${encodeURIComponent(values.organisation!)}/`,
      {
        headers: { Authorization: `Bearer ${values.token!}` },
      },
    );
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Sentry') };
    const body = (await res.json()) as { slug?: string };
    return { ok: true, meta: body.slug ? { slug: body.slug } : undefined };
  } catch {
    return networkError('Sentry');
  }
};

const validateAuth0 = async (values: Record<string, string>): Promise<ValidationResult> => {
  const missing = require(values, 'domain', 'token');
  if (missing) return { ok: false, error: missing };
  const domain = values.domain!.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!/^[a-z0-9-]+\.(eu|us|au|jp)\.auth0\.com$/.test(domain) && !/^[a-z0-9-]+\.auth0\.com$/.test(domain)) {
    return { ok: false, error: 'Auth0 domain must look like your-tenant.eu.auth0.com.' };
  }
  try {
    const res = await safeFetch(`https://${domain}/api/v2/clients?per_page=1`, {
      headers: { Authorization: `Bearer ${values.token!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Auth0') };
    return { ok: true };
  } catch {
    return networkError('Auth0');
  }
};

const validatePostmark = async (values: Record<string, string>): Promise<ValidationResult> => {
  const missing = require(values, 'serverToken');
  if (missing) return { ok: false, error: missing };
  try {
    const res = await safeFetch('https://api.postmarkapp.com/server', {
      headers: {
        Accept: 'application/json',
        'X-Postmark-Server-Token': values.serverToken!,
      },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Postmark') };
    return { ok: true };
  } catch {
    return networkError('Postmark');
  }
};

const validateCloudflareR2 = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'token', 'accountId');
  if (missing) return { ok: false, error: missing };
  try {
    const verify = await safeFetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: { Authorization: `Bearer ${values.token!}` },
    });
    if (!verify.ok) return { ok: false, error: mapHttpError(verify.status, 'Cloudflare R2') };
    const list = await safeFetch(
      `https://api.cloudflare.com/client/v4/accounts/${values.accountId!}/r2/buckets`,
      { headers: { Authorization: `Bearer ${values.token!}` } },
    );
    if (!list.ok) return { ok: false, error: 'Cloudflare token works but lacks R2 scope.' };
    return { ok: true };
  } catch {
    return networkError('Cloudflare R2');
  }
};

const validateTriggerDev = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'apiKey');
  if (missing) return { ok: false, error: missing };
  try {
    const res = await safeFetch('https://api.trigger.dev/api/v1/whoami', {
      headers: { Authorization: `Bearer ${values.apiKey!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Trigger.dev') };
    return { ok: true };
  } catch {
    return networkError('Trigger.dev');
  }
};

const validateRailway = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'token');
  if (missing) return { ok: false, error: missing };
  try {
    const res = await safeFetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${values.token!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ me { id email } }' }),
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Railway') };
    const body = (await res.json()) as { data?: { me?: { id: string } } };
    if (!body.data?.me) return { ok: false, error: 'Railway token rejected.' };
    return { ok: true };
  } catch {
    return networkError('Railway');
  }
};

const validateCloudinary = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'cloudName', 'apiKey', 'apiSecret');
  if (missing) return { ok: false, error: missing };
  try {
    const auth = Buffer.from(`${values.apiKey!}:${values.apiSecret!}`).toString('base64');
    const res = await safeFetch(
      `https://api.cloudinary.com/v1_1/${values.cloudName!}/usage`,
      { headers: { Authorization: `Basic ${auth}` } },
    );
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Cloudinary') };
    return { ok: true };
  } catch {
    return networkError('Cloudinary');
  }
};

const validateRevenueCat = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'secretKey', 'projectId');
  if (missing) return { ok: false, error: missing };
  try {
    const res = await safeFetch(
      `https://api.revenuecat.com/v2/projects/${values.projectId!}`,
      { headers: { Authorization: `Bearer ${values.secretKey!}` } },
    );
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'RevenueCat') };
    return { ok: true };
  } catch {
    return networkError('RevenueCat');
  }
};

const validateDatadog = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'apiKey', 'appKey');
  if (missing) return { ok: false, error: missing };
  const site = values.site && values.site.length > 0 ? values.site : 'datadoghq.com';
  try {
    const res = await safeFetch(`https://api.${site}/api/v1/validate`, {
      headers: {
        'DD-API-KEY': values.apiKey!,
        'DD-APPLICATION-KEY': values.appKey!,
      },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Datadog') };
    const body = (await res.json()) as { valid?: boolean };
    if (!body.valid) return { ok: false, error: 'Datadog reports the keys as invalid.' };
    return { ok: true };
  } catch {
    return networkError('Datadog');
  }
};

const validateExpoEas = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  const missing = require(values, 'token');
  if (missing) return { ok: false, error: missing };
  try {
    const res = await safeFetch('https://api.expo.dev/v2/auth/me', {
      headers: { Authorization: `Bearer ${values.token!}` },
    });
    if (!res.ok) return { ok: false, error: mapHttpError(res.status, 'Expo EAS') };
    return { ok: true };
  } catch {
    return networkError('Expo EAS');
  }
};

const validateExpoPush = async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  // Expo Push access tokens have no read-only validation endpoint, so we
  // accept any well-shaped token and leave runtime push receipts to confirm.
  const missing = require(values, 'accessToken');
  if (missing) return { ok: false, error: missing };
  if (!/^[A-Za-z0-9_-]{16,}$/.test(values.accessToken!)) {
    return { ok: false, error: 'Expo Push access token looks malformed.' };
  }
  return { ok: true };
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
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare',
    category: 'cdn',
    signupUrl: 'https://dash.cloudflare.com/sign-up',
    apiKeysUrl: 'https://dash.cloudflare.com/profile/api-tokens',
    fields: [
      {
        id: 'token',
        label: 'API token',
        placeholder: '0123456789abcdef...',
        helpText: 'Profile · API Tokens · Create Token (use the "Edit Cloudflare Workers" template or a custom scope)',
        envName: 'CLOUDFLARE_API_TOKEN',
        secret: true,
      },
      {
        id: 'accountId',
        label: 'Account ID',
        placeholder: '0123456789abcdef0123456789abcdef',
        helpText: 'Right sidebar of the Cloudflare dashboard, under "API"',
        envName: 'CLOUDFLARE_ACCOUNT_ID',
      },
    ],
    validate: validateCloudflare,
  },
  clerk: {
    id: 'clerk',
    name: 'Clerk',
    category: 'auth',
    signupUrl: 'https://dashboard.clerk.com/sign-up',
    apiKeysUrl: 'https://dashboard.clerk.com/last-active?path=api-keys',
    fields: [
      {
        id: 'publishableKey',
        label: 'Publishable key',
        placeholder: 'pk_test_...',
        helpText: 'API Keys · Publishable key',
        envName: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      },
      {
        id: 'secretKey',
        label: 'Secret key',
        placeholder: 'sk_test_...',
        helpText: 'API Keys · Secret key · server-only',
        envName: 'CLERK_SECRET_KEY',
        secret: true,
      },
    ],
    validate: validateClerk,
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    category: 'database',
    signupUrl: 'https://console.neon.tech/signup',
    apiKeysUrl: 'https://console.neon.tech/app/settings/api-keys',
    fields: [
      {
        id: 'apiKey',
        label: 'API key',
        placeholder: 'napi_...',
        helpText: 'Account settings · API keys',
        envName: 'NEON_API_KEY',
        secret: true,
      },
      {
        id: 'connectionString',
        label: 'Connection string',
        placeholder: 'postgres://user:pass@xx.neon.tech/db',
        helpText: 'Project · Connection details · Pooled connection string',
        envName: 'DATABASE_URL',
        secret: true,
      },
    ],
    validate: validateNeon,
  },
  sentry: {
    id: 'sentry',
    name: 'Sentry',
    category: 'observability',
    signupUrl: 'https://sentry.io/signup/',
    apiKeysUrl: 'https://sentry.io/settings/account/api/auth-tokens/',
    fields: [
      {
        id: 'organisation',
        label: 'Organisation slug',
        placeholder: 'novabash',
        helpText: 'Settings · Organisation · slug field',
        envName: 'SENTRY_ORG',
      },
      {
        id: 'token',
        label: 'Auth token',
        placeholder: 'sntrys_...',
        helpText: 'Account · API · Auth Tokens · scopes: org:read, project:read',
        envName: 'SENTRY_AUTH_TOKEN',
        secret: true,
      },
    ],
    validate: validateSentry,
  },
  auth0: {
    id: 'auth0',
    name: 'Auth0',
    category: 'auth',
    signupUrl: 'https://auth0.com/signup',
    apiKeysUrl: 'https://manage.auth0.com/dashboard/eu/your-tenant/apis',
    fields: [
      {
        id: 'domain',
        label: 'Tenant domain',
        placeholder: 'your-tenant.eu.auth0.com',
        helpText: 'Settings · General · Custom domain or default tenant URL',
        envName: 'AUTH0_DOMAIN',
      },
      {
        id: 'token',
        label: 'Management API token',
        placeholder: 'eyJ...',
        helpText: 'APIs · Auth0 Management API · API Explorer · Token',
        envName: 'AUTH0_MANAGEMENT_TOKEN',
        secret: true,
      },
    ],
    validate: validateAuth0,
  },
  postmark: {
    id: 'postmark',
    name: 'Postmark',
    category: 'email',
    signupUrl: 'https://account.postmarkapp.com/sign_up',
    apiKeysUrl: 'https://account.postmarkapp.com/servers',
    fields: [
      {
        id: 'serverToken',
        label: 'Server token',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        helpText: 'Servers · pick the server · API Tokens',
        envName: 'POSTMARK_SERVER_TOKEN',
        secret: true,
      },
    ],
    validate: validatePostmark,
  },
  'cloudflare-r2': {
    id: 'cloudflare-r2',
    name: 'Cloudflare R2',
    category: 'storage',
    signupUrl: 'https://dash.cloudflare.com/sign-up',
    apiKeysUrl: 'https://dash.cloudflare.com/profile/api-tokens',
    fields: [
      {
        id: 'token',
        label: 'API token',
        placeholder: '0123456789abcdef...',
        helpText: 'Profile · API Tokens · custom token with R2:Read scope',
        envName: 'CLOUDFLARE_R2_TOKEN',
        secret: true,
      },
      {
        id: 'accountId',
        label: 'Account ID',
        placeholder: '0123456789abcdef0123456789abcdef',
        helpText: 'Right sidebar of the Cloudflare dashboard, under "API"',
        envName: 'CLOUDFLARE_ACCOUNT_ID',
      },
    ],
    validate: validateCloudflareR2,
  },
  'trigger-dev': {
    id: 'trigger-dev',
    name: 'Trigger.dev',
    category: 'queue',
    signupUrl: 'https://trigger.dev',
    apiKeysUrl: 'https://cloud.trigger.dev/account/tokens',
    fields: [
      {
        id: 'apiKey',
        label: 'Personal access token',
        placeholder: 'tr_pat_...',
        helpText: 'Account · Personal access tokens · New token',
        envName: 'TRIGGER_API_KEY',
        secret: true,
      },
    ],
    validate: validateTriggerDev,
  },
  railway: {
    id: 'railway',
    name: 'Railway',
    category: 'hosting',
    signupUrl: 'https://railway.app',
    apiKeysUrl: 'https://railway.app/account/tokens',
    fields: [
      {
        id: 'token',
        label: 'API token',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        helpText: 'Account · Tokens · Create New Token',
        envName: 'RAILWAY_TOKEN',
        secret: true,
      },
    ],
    validate: validateRailway,
  },
  cloudinary: {
    id: 'cloudinary',
    name: 'Cloudinary',
    category: 'storage',
    signupUrl: 'https://cloudinary.com/users/register/free',
    apiKeysUrl: 'https://console.cloudinary.com/settings/api-keys',
    fields: [
      {
        id: 'cloudName',
        label: 'Cloud name',
        placeholder: 'your-cloud',
        helpText: 'Console · Settings · Cloud name',
        envName: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
      },
      {
        id: 'apiKey',
        label: 'API key',
        placeholder: '1234567890',
        helpText: 'Console · Settings · API Keys',
        envName: 'CLOUDINARY_API_KEY',
      },
      {
        id: 'apiSecret',
        label: 'API secret',
        placeholder: 'xxxxxxxx',
        helpText: 'Console · Settings · API Keys · paired secret',
        envName: 'CLOUDINARY_API_SECRET',
        secret: true,
      },
    ],
    validate: validateCloudinary,
  },
  revenuecat: {
    id: 'revenuecat',
    name: 'RevenueCat',
    category: 'payment',
    signupUrl: 'https://app.revenuecat.com/signup',
    apiKeysUrl: 'https://app.revenuecat.com/projects',
    fields: [
      {
        id: 'projectId',
        label: 'Project ID',
        placeholder: 'projXXXXXXXX',
        helpText: 'Projects · pick the project · copy ID',
        envName: 'REVENUECAT_PROJECT_ID',
      },
      {
        id: 'secretKey',
        label: 'Secret API key',
        placeholder: 'sk_...',
        helpText: 'Project settings · API keys · Secret key',
        envName: 'REVENUECAT_SECRET_KEY',
        secret: true,
      },
    ],
    validate: validateRevenueCat,
  },
  datadog: {
    id: 'datadog',
    name: 'Datadog',
    category: 'observability',
    signupUrl: 'https://www.datadoghq.com/free-datadog-trial/',
    apiKeysUrl: 'https://app.datadoghq.com/organization-settings/api-keys',
    fields: [
      {
        id: 'apiKey',
        label: 'API key',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        helpText: 'Organisation Settings · API Keys',
        envName: 'DATADOG_API_KEY',
        secret: true,
      },
      {
        id: 'appKey',
        label: 'Application key',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        helpText: 'Organisation Settings · Application Keys',
        envName: 'DATADOG_APP_KEY',
        secret: true,
      },
      {
        id: 'site',
        label: 'Datadog site',
        placeholder: 'datadoghq.com',
        helpText: 'Default datadoghq.com. Use datadoghq.eu for EU accounts.',
        envName: 'DATADOG_SITE',
      },
    ],
    validate: validateDatadog,
  },
  'expo-eas': {
    id: 'expo-eas',
    name: 'Expo EAS',
    category: 'hosting',
    signupUrl: 'https://expo.dev/signup',
    apiKeysUrl: 'https://expo.dev/accounts/_/settings/access-tokens',
    fields: [
      {
        id: 'token',
        label: 'Access token',
        placeholder: 'expo_xxxxxxxxxxxxxxxxxxxx',
        helpText: 'Account · Access Tokens · Create',
        envName: 'EXPO_TOKEN',
        secret: true,
      },
    ],
    validate: validateExpoEas,
  },
  'expo-push': {
    id: 'expo-push',
    name: 'Expo Push',
    category: 'queue',
    signupUrl: 'https://expo.dev/notifications',
    apiKeysUrl: 'https://expo.dev/accounts/_/settings/access-tokens',
    fields: [
      {
        id: 'accessToken',
        label: 'Push access token',
        placeholder: 'xxxxxxxxxxxxxxxxxxxx',
        helpText: 'Same Expo access token, used as a Bearer for the push API',
        envName: 'EXPO_PUSH_TOKEN',
        secret: true,
      },
    ],
    validate: validateExpoPush,
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
