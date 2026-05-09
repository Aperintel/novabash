/**
 * Mock usage data so the dashboard renders before the polling layer exists.
 * Real adapter interface lands in week 7 of the build.
 */

import type { IconName } from '@novabash/brand';

export type Health = 'ok' | 'rotating' | 'idle' | 'error';

export interface ServiceUsage {
  id: string;
  name: string;
  icon: IconName;
  region: string;
  health: Health;
  primary: { label: string; value: string; pct?: number };
  secondary?: { label: string; value: string };
  keyAgeDays: number;
}

export const mockServices: ServiceUsage[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    icon: 'database',
    region: 'eu-west-2',
    health: 'ok',
    primary: { label: 'database rows', value: '124,388 / 500K', pct: 24.9 },
    secondary: { label: 'monthly active users', value: '8,210' },
    keyAgeDays: 14,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: 'edge',
    region: 'global',
    health: 'ok',
    primary: { label: 'function invocations', value: '932K / 1M', pct: 93.2 },
    secondary: { label: 'bandwidth', value: '78 GB' },
    keyAgeDays: 21,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: 'model',
    region: 'global',
    health: 'rotating',
    primary: { label: 'credits used', value: '$54.20 / $75.00', pct: 72.3 },
    secondary: { label: 'requests today', value: '4,118' },
    keyAgeDays: 92,
  },
  {
    id: 'upstash-redis',
    name: 'Upstash Redis',
    icon: 'queue',
    region: 'eu-central',
    health: 'ok',
    primary: { label: 'commands today', value: '7,402 / 10K', pct: 74 },
    secondary: { label: 'storage', value: '38 MB' },
    keyAgeDays: 7,
  },
  {
    id: 'upstash-vector',
    name: 'Upstash Vector',
    icon: 'storage',
    region: 'eu-central',
    health: 'ok',
    primary: { label: 'vectors stored', value: '184K / 200K', pct: 92 },
    secondary: { label: 'queries / day', value: '12,840' },
    keyAgeDays: 7,
  },
  {
    id: 'resend',
    name: 'Resend',
    icon: 'email',
    region: 'global',
    health: 'ok',
    primary: { label: 'emails this month', value: '1,140 / 3,000', pct: 38 },
    secondary: { label: 'bounce rate', value: '0.4%' },
    keyAgeDays: 35,
  },
  {
    id: 'inngest',
    name: 'Inngest',
    icon: 'function',
    region: 'global',
    health: 'ok',
    primary: { label: 'step runs', value: '21,488 / 50K', pct: 43 },
    secondary: { label: 'failures (24h)', value: '0' },
    keyAgeDays: 12,
  },
  {
    id: 'lemon-squeezy',
    name: 'Lemon Squeezy',
    icon: 'payment',
    region: 'global',
    health: 'ok',
    primary: { label: 'MRR', value: '$1,840' },
    secondary: { label: 'active subs', value: '46' },
    keyAgeDays: 41,
  },
];

export const monthlyCostEstimate = '£32.40';
