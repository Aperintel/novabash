/**
 * Vendor adapter registry. Each entry describes how to obtain, validate, and
 * later poll a single vendor. The validate handlers are stubbed for now and
 * will be replaced with real API calls in weeks 3-4 of the build.
 */

export type ValidationResult =
  | { ok: true; meta?: Record<string, string | number> }
  | { ok: false; error: string };

export interface KeyField {
  id: string;
  label: string;
  placeholder: string;
  helpText: string;
  pattern?: RegExp;
  envName: string;
}

export interface ServiceAdapter {
  id: string;
  name: string;
  category: 'auth' | 'database' | 'hosting' | 'email' | 'payment' | 'ai' | 'storage' | 'queue' | 'analytics' | 'observability' | 'cdn';
  signupUrl: string;
  apiKeysUrl: string;
  fields: KeyField[];
  validate: (values: Record<string, string>) => Promise<ValidationResult>;
}

const stubValidate = (vendor: string) => async (
  values: Record<string, string>,
): Promise<ValidationResult> => {
  await new Promise((r) => setTimeout(r, 600));
  const first = Object.values(values)[0];
  if (!first || first.length < 8) {
    return { ok: false, error: `That ${vendor} key looks too short.` };
  }
  return { ok: true, meta: { stubbed: 'true' } };
};

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
      },
      {
        id: 'service',
        label: 'Service role key',
        placeholder: 'eyJ...',
        helpText: 'Settings · API · service_role · keep server-side only',
        envName: 'SUPABASE_SERVICE_ROLE_KEY',
      },
    ],
    validate: stubValidate('Supabase'),
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
      },
    ],
    validate: stubValidate('Vercel'),
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
      },
    ],
    validate: stubValidate('Resend'),
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
      },
      {
        id: 'storeId',
        label: 'Store ID',
        placeholder: '12345',
        helpText: 'Stores · pick the store · copy ID',
        envName: 'LEMON_SQUEEZY_STORE_ID',
      },
    ],
    validate: stubValidate('Lemon Squeezy'),
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
      },
    ],
    validate: stubValidate('Plausible'),
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
      },
    ],
    validate: stubValidate('OpenRouter'),
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
      },
    ],
    validate: stubValidate('Upstash Redis'),
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
      },
    ],
    validate: stubValidate('Upstash Vector'),
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
      },
      {
        id: 'signingKey',
        label: 'Signing key',
        placeholder: 'signkey-...',
        helpText: 'Manage · Signing Keys · Create',
        envName: 'INNGEST_SIGNING_KEY',
      },
    ],
    validate: stubValidate('Inngest'),
  },
};

export const getService = (id: string) => services[id];
