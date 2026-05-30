import Link from 'next/link';

export const metadata = { title: 'Stacks' };

interface StackRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  services: string[];
  keys: number;
}

const rows: StackRow[] = [
  {
    id: '/launchpad',
    slug: 'launchpad',
    name: 'Standard SaaS',
    description:
      'The default for a solo SaaS build. Postgres, hosting, auth, payments, email, analytics. The usual suspects, in one place.',
    services: ['supabase', 'vercel', 'resend', 'lemon-squeezy', 'plausible', 'sentry'],
    keys: 6,
  },
  {
    id: '/builder-ai',
    slug: 'builder-ai',
    name: 'AI-Native App',
    description:
      'Launchpad plus the AI bits. LLM router, vector index, Redis cache, a durable job queue. For RAG, agents, and chat products.',
    services: ['supabase', 'vercel', 'openrouter', 'upstash-vector', 'upstash-redis', 'inngest'],
    keys: 8,
  },
  {
    id: '/edge',
    slug: 'edge',
    name: 'Cloudflare Native',
    description:
      'Serverless to the bone. One Cloudflare account covers Workers, D1, R2, KV, and Queues, plus Clerk for auth.',
    services: ['cloudflare', 'clerk'],
    keys: 3,
  },
  {
    id: '/data',
    slug: 'data',
    name: 'Analytics & Pipelines',
    description:
      'For data-heavy apps. Branched Postgres, object storage, durable scheduled jobs, queue infrastructure. Built around Neon and Trigger.dev.',
    services: ['neon', 'cloudflare-r2', 'trigger-dev', 'upstash-redis', 'supabase', 'railway'],
    keys: 6,
  },
  {
    id: '/mobile',
    slug: 'mobile',
    name: 'React Native & Expo',
    description:
      'The mobile-first set. Build infrastructure, media handling, in-app payments, push notifications, and a place for custom workers.',
    services: ['expo-eas', 'supabase', 'cloudinary', 'revenuecat', 'expo-push', 'railway'],
    keys: 6,
  },
  {
    id: '/enterprise',
    slug: 'enterprise',
    name: 'Regulated Industries',
    description:
      'The serious shape for FinTech, HealthTech, and LegalTech. Enterprise auth, branched Postgres, deliverable email, monitoring, error tracking.',
    services: ['auth0', 'neon', 'railway', 'cloudflare-r2', 'postmark', 'datadog', 'sentry'],
    keys: 7,
  },
];

export default function StacksPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-7 pt-14">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">Catalogue</span>
        <span>Starter bundles</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <h1 className="mb-6 max-w-[900px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
        Six bundles.
        <br />
        <span className="text-fg-dim">Opinionated starting points.</span>
      </h1>
      <p className="mb-14 max-w-[600px] text-[17px] leading-[1.55] text-fg-mid">
        Each bundle is a named set of services that commonly ship together. Apply
        one in the app and it drops the services in, ready for you to paste your own
        keys. Swap anything you like.
      </p>

      <div className="border-t border-hairline">
        {rows.map((r) => (
          <article
            key={r.slug}
            className="group grid grid-cols-1 items-center gap-5 border-b border-hairline px-2 py-7 transition-colors duration-200 ease-nb hover:bg-gold-fade lg:grid-cols-[140px_minmax(0,2.4fr)_minmax(0,2fr)_100px_120px]"
          >
            <span className="font-mono text-[12.5px] tracking-[0.04em] text-gold">{r.id}</span>
            <div className="flex flex-col gap-1.5">
              <span className="text-[20px] font-bold tracking-heading">{r.name}</span>
              <span className="text-[13.5px] leading-[1.55] text-fg-mid">{r.description}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {r.services.map((s) => (
                <span
                  key={s}
                  className="border border-hairline-bright bg-bg-elev-2 px-2 py-1 font-mono text-[10.5px] text-fg-mid transition-colors group-hover:border-gold-deep group-hover:text-gold"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="font-mono text-[11px] text-fg-dim">
              <span className="text-fg">{r.keys} keys</span>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center justify-self-start border border-hairline-bright bg-transparent px-4 py-2 font-mono text-[11px] text-fg-mid transition-colors duration-150 ease-nb hover:border-gold hover:text-gold lg:justify-self-end"
            >
              Apply
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-10 max-w-[700px] font-mono text-[12.5px] leading-[1.7] text-fg-dim">
        <span className="text-gold">// note</span> &nbsp; A bundle is just a starting
        set of services and the keys they need. Apply one in the app, swap anything,
        fill in your own values. Nothing is locked in, and nothing leaves your device.
      </p>
    </div>
  );
}
