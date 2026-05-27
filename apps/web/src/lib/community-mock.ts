/**
 * Mock community catalogue. Once the API is reachable, swap to a server
 * fetch against /v1/bundles. Same shape on both sides.
 */

import type { IconName } from '@novabash/brand';

export interface PublishedBundle {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  services: string[];
  tags: string[];
  icon: IconName;
  authorHandle: string;
  authorName: string;
  forkCount: number;
  starCount: number;
  reviewCount: number;
  averageRating: number;
  parentSlug: string | null;
  createdAt: string;
}

export const seededBundles: PublishedBundle[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'launchpad',
    name: 'Launchpad',
    tagline: 'Standard SaaS',
    description:
      'Postgres, hosting, transactional email, payments, lightweight analytics. The fastest path to a paying customer for a B2B SaaS.',
    services: ['supabase', 'vercel', 'resend', 'lemon-squeezy', 'plausible', 'sentry'],
    tags: ['saas', 'postgres', 'first-party'],
    icon: 'workspace',
    authorHandle: 'novabash',
    authorName: 'NovaBash',
    forkCount: 124,
    starCount: 218,
    reviewCount: 14,
    averageRating: 4.8,
    parentSlug: null,
    createdAt: '2026-05-08T09:12:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    slug: 'builder-ai',
    name: 'Builder AI',
    tagline: 'AI-native app',
    description:
      'Launchpad plus the AI infra layer. LLM router, vector index, Redis cache, durable job queue. For RAG, agents, chat copilots.',
    services: [
      'supabase',
      'vercel',
      'openrouter',
      'upstash-redis',
      'upstash-vector',
      'inngest',
      'resend',
      'lemon-squeezy',
    ],
    tags: ['ai', 'rag', 'first-party'],
    icon: 'model',
    authorHandle: 'novabash',
    authorName: 'NovaBash',
    forkCount: 97,
    starCount: 264,
    reviewCount: 21,
    averageRating: 4.9,
    parentSlug: 'launchpad',
    createdAt: '2026-05-08T09:14:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    slug: 'edge',
    name: 'Edge Stack',
    tagline: 'Cloudflare native',
    description:
      'Workers, D1, R2, KV, Queues all on the same Cloudflare account, plus Clerk for auth. One login covers five services.',
    services: ['cloudflare', 'cloudflare-r2', 'clerk'],
    tags: ['edge', 'first-party'],
    icon: 'edge',
    authorHandle: 'novabash',
    authorName: 'NovaBash',
    forkCount: 41,
    starCount: 88,
    reviewCount: 6,
    averageRating: 4.6,
    parentSlug: null,
    createdAt: '2026-05-08T09:16:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    slug: 'data',
    name: 'Data Stack',
    tagline: 'Pipelines and queues',
    description:
      'Neon for OLTP, R2 for object storage, Trigger and Upstash for queues, Railway for the workers. Built around Neon and Trigger.dev.',
    services: ['neon', 'cloudflare-r2', 'trigger-dev', 'upstash-redis', 'supabase', 'railway'],
    tags: ['data', 'pipelines', 'first-party'],
    icon: 'database',
    authorHandle: 'novabash',
    authorName: 'NovaBash',
    forkCount: 33,
    starCount: 71,
    reviewCount: 5,
    averageRating: 4.5,
    parentSlug: null,
    createdAt: '2026-05-08T09:18:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    slug: 'mobile',
    name: 'Mobile First',
    tagline: 'Expo and Supabase',
    description:
      'EAS builds, Supabase backend, Cloudinary media, RevenueCat for in-app purchase, Expo Push, Railway for custom workers.',
    services: ['expo-eas', 'supabase', 'cloudinary', 'revenuecat', 'expo-push', 'railway'],
    tags: ['mobile', 'expo', 'first-party'],
    icon: 'function',
    authorHandle: 'novabash',
    authorName: 'NovaBash',
    forkCount: 28,
    starCount: 63,
    reviewCount: 3,
    averageRating: 4.4,
    parentSlug: null,
    createdAt: '2026-05-08T09:20:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    slug: 'enterprise',
    name: 'Enterprise Ready',
    tagline: 'SOC2-ready',
    description:
      'Auth0 for SSO, Neon for OLTP, R2 for storage, Postmark for deliverability, Datadog for ops, Sentry for errors.',
    services: ['auth0', 'neon', 'railway', 'cloudflare-r2', 'postmark', 'datadog', 'sentry'],
    tags: ['enterprise', 'compliance', 'first-party'],
    icon: 'vault',
    authorHandle: 'novabash',
    authorName: 'NovaBash',
    forkCount: 12,
    starCount: 47,
    reviewCount: 2,
    averageRating: 4.7,
    parentSlug: null,
    createdAt: '2026-05-08T09:22:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    slug: 'rag-starter',
    name: 'RAG Starter',
    tagline: 'Community fork',
    description:
      'Builder AI minus payments and email, plus a Pinecone-style vector flow tuned for documentation chat.',
    services: ['supabase', 'vercel', 'openrouter', 'upstash-vector', 'inngest'],
    tags: ['ai', 'rag', 'community'],
    icon: 'model',
    authorHandle: 'priya',
    authorName: 'Priya Iyer',
    forkCount: 19,
    starCount: 41,
    reviewCount: 4,
    averageRating: 4.3,
    parentSlug: 'builder-ai',
    createdAt: '2026-05-09T11:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    slug: 'micro-saas',
    name: 'Micro SaaS',
    tagline: 'Solo, opinionated, frugal',
    description:
      'Launchpad with the SOC2 layer stripped out and a Sentry-only observability stack. Targets the solo builder shipping their first paid product.',
    services: ['supabase', 'vercel', 'resend', 'lemon-squeezy', 'plausible'],
    tags: ['saas', 'solo', 'community'],
    icon: 'workspace',
    authorHandle: 'leo',
    authorName: 'Leo Adesanya',
    forkCount: 17,
    starCount: 38,
    reviewCount: 3,
    averageRating: 4.4,
    parentSlug: 'launchpad',
    createdAt: '2026-05-09T13:30:00Z',
  },
];

export function bundleBySlug(slug: string): PublishedBundle | undefined {
  return seededBundles.find((b) => b.slug === slug);
}

export function bundlesByAuthor(handle: string): PublishedBundle[] {
  return seededBundles.filter((b) => b.authorHandle === handle);
}

export function trending(): PublishedBundle[] {
  return [...seededBundles].sort(
    (a, b) =>
      b.starCount * 1.5 +
      b.forkCount -
      (a.starCount * 1.5 + a.forkCount),
  );
}
