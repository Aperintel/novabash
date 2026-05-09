import { bundleById } from './bundles';
import { services } from './services';

export type Variant = 'development' | 'staging' | 'production';

export interface EnvFile {
  variant: Variant;
  content: string;
  filename: string;
}

const variantPrefix: Record<Variant, string> = {
  development: '',
  staging: 'STAGING_',
  production: 'PROD_',
};

const sampleByEnvName: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://acid-thrush-04.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<redacted>',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<redacted>',
  VERCEL_TOKEN: 'vercel_xxxxxxxxxxxxxxxxxxxxxx',
  RESEND_API_KEY: 're_xxxxxxxxxxxxxxxxxxxxx',
  LEMON_SQUEEZY_API_KEY: 'eyJ0eXAi.<redacted>',
  LEMON_SQUEEZY_STORE_ID: '12345',
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: 'novabash.dev',
  PLAUSIBLE_API_KEY: 'plausible_xxxxxxxxxxxxxxxxx',
  OPENROUTER_API_KEY: 'sk-or-v1-xxxxxxxxxxxxxxxxxxxxx',
  UPSTASH_REDIS_REST_URL: 'https://xxxx.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'AXxxxxxxxxxxxxxxxxxxxxxx',
  UPSTASH_VECTOR_REST_URL: 'https://xxxx.upstash.io',
  UPSTASH_VECTOR_REST_TOKEN: 'AXxxxxxxxxxxxxxxxxxxxxxx',
  INNGEST_EVENT_KEY: 'XXXXXXXXxxxxxxxxxx',
  INNGEST_SIGNING_KEY: 'signkey-xxxxxxxxxxxxxxxxxx',
};

export function generateEnv(bundleId: string, variant: Variant): EnvFile {
  const bundle = bundleById(bundleId);
  const lines: string[] = [
    `# NovaBash · ${bundle?.name ?? bundleId} · ${variant}`,
    `# generated ${new Date().toISOString()}`,
    `# rotate, regenerate, and audit at https://novabash.dev/workspace`,
    '',
  ];

  const prefix = variantPrefix[variant];
  if (bundle) {
    for (const ref of bundle.services) {
      const adapter = services[ref.id];
      if (!adapter) continue;
      lines.push(`# ${adapter.name}`);
      for (const field of adapter.fields) {
        const sample = sampleByEnvName[field.envName] ?? '<value>';
        const name = field.envName.startsWith('NEXT_PUBLIC_')
          ? field.envName
          : `${prefix}${field.envName}`;
        lines.push(`${name}=${sample}`);
      }
      lines.push('');
    }
  }

  return {
    variant,
    content: lines.join('\n'),
    filename: `.env.${variant === 'development' ? 'local' : variant}`,
  };
}

export function generateAllEnvs(bundleId: string): EnvFile[] {
  return (['development', 'staging', 'production'] as const).map((v) => generateEnv(bundleId, v));
}
