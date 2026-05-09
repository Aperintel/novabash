/**
 * The six bundles that ship in Phase A. The seventh tier (community-published)
 * shows up in the discovery feed but is not selectable from the onboarding screen.
 */

import type { IconName } from '@novabash/brand';

export interface ServiceRef {
  id: string;
  name: string;
  region?: string;
}

export interface Bundle {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: IconName;
  recommendedFor: string;
  services: ServiceRef[];
  keyCount: number;
}

export const bundles: Bundle[] = [
  {
    id: 'launchpad',
    name: 'Launchpad',
    tagline: 'Standard SaaS',
    description:
      'A subscription product with auth, a database, transactional email, payments, and lightweight analytics. The fastest path to a paying customer.',
    icon: 'workspace',
    recommendedFor: 'B2B SaaS, internal tools, side projects with billing',
    services: [
      { id: 'supabase', name: 'Supabase', region: 'eu-west-2' },
      { id: 'vercel', name: 'Vercel', region: 'global' },
      { id: 'resend', name: 'Resend', region: 'global' },
      { id: 'lemon-squeezy', name: 'Lemon Squeezy', region: 'global' },
      { id: 'plausible', name: 'Plausible', region: 'eu' },
    ],
    keyCount: 5,
  },
  {
    id: 'builder-ai',
    name: 'Builder AI',
    tagline: 'AI-powered SaaS',
    description:
      'Launchpad plus the LLM router and the cache or vector store. The right starting place for chat copilots, RAG pipelines, agentic workflows.',
    icon: 'model',
    recommendedFor: 'AI SaaS, copilots, RAG products',
    services: [
      { id: 'supabase', name: 'Supabase', region: 'eu-west-2' },
      { id: 'vercel', name: 'Vercel', region: 'global' },
      { id: 'openrouter', name: 'OpenRouter', region: 'global' },
      { id: 'upstash-redis', name: 'Upstash Redis', region: 'eu-central' },
      { id: 'upstash-vector', name: 'Upstash Vector', region: 'eu-central' },
      { id: 'resend', name: 'Resend', region: 'global' },
      { id: 'inngest', name: 'Inngest', region: 'global' },
      { id: 'lemon-squeezy', name: 'Lemon Squeezy', region: 'global' },
    ],
    keyCount: 7,
  },
  {
    id: 'edge-stack',
    name: 'Edge Stack',
    tagline: 'Edge-first',
    description:
      'Workers, D1, R2, KV, Queues all on the same Cloudflare account, plus Clerk for auth. One login covers five services because Cloudflare consolidates them.',
    icon: 'edge',
    recommendedFor: 'edge functions, low-latency APIs, global apps',
    services: [
      { id: 'cloudflare', name: 'Cloudflare', region: 'global' },
      { id: 'clerk', name: 'Clerk', region: 'global' },
    ],
    keyCount: 3,
  },
  {
    id: 'data-stack',
    name: 'Data Stack',
    tagline: 'Pipelines and queues',
    description:
      'Neon for OLTP, R2 for object storage, Trigger.dev and Upstash for queues, Supabase for app data, Railway for the workers. Heavier shape for data-rich products.',
    icon: 'database',
    recommendedFor: 'analytics platforms, ETL, data products',
    services: [
      { id: 'neon', name: 'Neon', region: 'eu-central' },
      { id: 'cloudflare-r2', name: 'Cloudflare R2', region: 'global' },
      { id: 'trigger-dev', name: 'Trigger.dev', region: 'global' },
      { id: 'upstash-redis', name: 'Upstash Redis', region: 'eu-central' },
      { id: 'supabase', name: 'Supabase', region: 'eu-west-2' },
      { id: 'railway', name: 'Railway', region: 'eu-west' },
    ],
    keyCount: 6,
  },
  {
    id: 'mobile-first',
    name: 'Mobile First',
    tagline: 'Expo and Supabase',
    description:
      'EAS for iOS and Android builds, Supabase for the backend, Cloudinary for media, RevenueCat for in-app purchase, Expo Push for notifications, Railway for any custom workers.',
    icon: 'function',
    recommendedFor: 'consumer mobile apps, social, content',
    services: [
      { id: 'expo-eas', name: 'Expo EAS', region: 'global' },
      { id: 'supabase', name: 'Supabase', region: 'eu-west-2' },
      { id: 'cloudinary', name: 'Cloudinary', region: 'global' },
      { id: 'revenuecat', name: 'RevenueCat', region: 'global' },
      { id: 'expo-push', name: 'Expo Push', region: 'global' },
      { id: 'railway', name: 'Railway', region: 'eu-west' },
    ],
    keyCount: 6,
  },
  {
    id: 'enterprise-ready',
    name: 'Enterprise Ready',
    tagline: 'SOC2-ready',
    description:
      'Auth0 for enterprise SSO, Neon for OLTP, R2 for storage, Postmark for email deliverability, Datadog for ops, Sentry for errors. The serious shape for a regulated customer.',
    icon: 'vault',
    recommendedFor: 'regulated industries, enterprise procurement',
    services: [
      { id: 'auth0', name: 'Auth0', region: 'global' },
      { id: 'neon', name: 'Neon', region: 'eu-central' },
      { id: 'railway', name: 'Railway', region: 'eu-west' },
      { id: 'cloudflare-r2', name: 'Cloudflare R2', region: 'global' },
      { id: 'postmark', name: 'Postmark', region: 'global' },
      { id: 'datadog', name: 'Datadog', region: 'global' },
      { id: 'sentry', name: 'Sentry', region: 'global' },
    ],
    keyCount: 7,
  },
];

export const bundleById = (id: string) => bundles.find((b) => b.id === id);

export const projectTypes = [
  { id: 'saas', label: 'B2B SaaS', body: 'Subscription product with paying customers.' },
  { id: 'ai', label: 'AI app', body: 'Chat, RAG, agents, anything LLM-powered.' },
  { id: 'mobile', label: 'Mobile app', body: 'iOS, Android, or React Native.' },
  { id: 'data', label: 'Data product', body: 'Pipelines, dashboards, analytics.' },
  { id: 'edge', label: 'Edge / API', body: 'Low-latency, globally distributed.' },
  { id: 'side', label: 'Side project', body: 'Solo, exploratory, the lightest possible.' },
] as const;

export const experienceLevels = [
  {
    id: 'first',
    label: 'First time',
    body: 'Hand-hold me. Suggest sensible defaults at every step.',
  },
  {
    id: 'comfortable',
    label: 'Comfortable',
    body: 'Show me what you are doing. I will pick when there is a real choice.',
  },
  {
    id: 'expert',
    label: 'Expert',
    body: 'Get out of my way. I want the keys, the .env, and the dashboard.',
  },
] as const;
