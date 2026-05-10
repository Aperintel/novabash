/**
 * Per-service age thresholds from build guide section 05, line 524.
 *
 * Stripe live keys and broad-scope deployment tokens get tighter thresholds
 * because their compromise impact is higher. Read-only or scoped keys get
 * looser thresholds because their blast radius is smaller.
 *
 * Lookup key is a `serviceId:fieldId` pair so service-key vs anon-key vs
 * deployment-token can each have its own band. Falls back to the service-id
 * default, then to the generic vendor default.
 */

export interface AgeBand {
  green: number; // days; <green => green
  amber: number; // <amber => amber, >=red => red, between => amber
  red: number;
}

const DEFAULT: AgeBand = { green: 90, amber: 180, red: 180 };

const TABLE: Record<string, AgeBand> = {
  // Stripe (per build guide; not in Phase A bundle but the table accommodates it)
  'stripe:live': { green: 90, amber: 180, red: 180 },
  'stripe:restricted': { green: 180, amber: 365, red: 365 },

  // OpenAI / Anthropic (future bundles)
  'openai:apiKey': { green: 60, amber: 120, red: 120 },
  'anthropic:apiKey': { green: 60, amber: 120, red: 120 },

  // Phase A launch services
  'openrouter:apiKey': { green: 60, amber: 120, red: 120 },
  'vercel:token': { green: 30, amber: 60, red: 60 },
  'supabase:service': { green: 90, amber: 180, red: 180 },
  'supabase:anon': { green: 180, amber: 365, red: 365 },
  'cloudflare:token': { green: 60, amber: 120, red: 120 },
  'resend:apiKey': { green: 90, amber: 180, red: 180 },
  'auth0:management': { green: 60, amber: 120, red: 120 },
  'lemon-squeezy:apiKey': { green: 90, amber: 180, red: 180 },
  'plausible:apiKey': { green: 90, amber: 180, red: 180 },
  'upstash-redis:token': { green: 90, amber: 180, red: 180 },
  'upstash-vector:token': { green: 90, amber: 180, red: 180 },
  'inngest:eventKey': { green: 90, amber: 180, red: 180 },
  'inngest:signingKey': { green: 90, amber: 180, red: 180 },
  'clerk:secretKey': { green: 60, amber: 120, red: 120 },
  'neon:apiKey': { green: 90, amber: 180, red: 180 },
  'sentry:token': { green: 90, amber: 180, red: 180 },
  'postmark:serverToken': { green: 90, amber: 180, red: 180 },
};

export function ageBandFor(serviceId: string, fieldId: string): AgeBand {
  const exact = TABLE[`${serviceId}:${fieldId}`];
  if (exact) return exact;
  return DEFAULT;
}
