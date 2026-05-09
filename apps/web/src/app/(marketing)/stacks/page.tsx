import Link from 'next/link';

export const metadata = { title: 'Stacks' };

interface StackRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  services: string[];
  keys: number;
  v2: number;
}

const rows: StackRow[] = [
  {
    id: '/launchpad',
    slug: 'launchpad',
    name: 'Standard SaaS',
    description:
      'The default for solo SaaS builders. Postgres, hosting, auth, payments, email, analytics. Production-ready under £20 a month at launch.',
    services: ['supabase', 'vercel', 'resend', 'lemon-squeezy', 'plausible', 'sentry'],
    keys: 5,
    v2: 0,
  },
  {
    id: '/builder-ai',
    slug: 'builder-ai',
    name: 'AI-Native App',
    description:
      'Launchpad plus the AI infrastructure layer. LLM router, vector index, Redis cache, durable job queue. For RAG, agents, chat products.',
    services: ['+ launchpad', 'openrouter', 'upstash-vector', 'upstash-redis', 'inngest'],
    keys: 7,
    v2: 0,
  },
  {
    id: '/edge',
    slug: 'edge',
    name: 'Cloudflare Native',
    description:
      'Globally distributed and serverless to the bone. One Cloudflare login covers Workers, D1, R2, KV, and Queues. Cleanest provisioning in the catalogue.',
    services: ['cf-workers', 'cf-d1', 'cf-r2', 'cf-kv', 'cf-queues', 'clerk'],
    keys: 3,
    v2: 0,
  },
  {
    id: '/data',
    slug: 'data',
    name: 'Analytics & Pipelines',
    description:
      'For data-heavy applications. Branched Postgres, object storage, durable scheduled jobs, queue infrastructure. Built around Neon and Trigger.dev.',
    services: ['neon', 'cf-r2', 'trigger.dev', 'upstash', 'supabase-auth', 'railway'],
    keys: 6,
    v2: 0,
  },
  {
    id: '/mobile',
    slug: 'mobile',
    name: 'React Native & Expo',
    description:
      'The complete mobile-first stack. Build infrastructure, media handling, in-app payments, push notifications, deployment service.',
    services: ['expo-eas', 'supabase', 'cloudinary', 'revenuecat', 'expo-push', 'railway'],
    keys: 6,
    v2: 0,
  },
  {
    id: '/enterprise',
    slug: 'enterprise',
    name: 'Regulated Industries',
    description:
      'Compliance-grade for FinTech, HealthTech, LegalTech. SLA-backed services with audit certifications, dedicated monitoring, hardware-backed identity.',
    services: ['auth0', 'neon', 'railway', 'cf-r2', 'postmark', 'datadog', 'sentry'],
    keys: 7,
    v2: 0,
  },
];

export default function StacksPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-7 pt-14">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">02</span>
        <span>stacks</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <h1 className="mb-6 max-w-[900px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
        Six bundles.
        <br />
        <span className="text-fg-dim">Forkable, versioned, opinionated.</span>
      </h1>
      <p className="mb-14 max-w-[600px] text-[17px] leading-[1.55] text-fg-mid">
        Each bundle is a curated set of services chosen for developer experience, free-tier
        generosity, and provisionability via API. Click any row to fork into your workspace.
      </p>

      <div className="border-t border-hairline">
        {rows.map((r) => (
          <article
            key={r.slug}
            className="group grid grid-cols-1 items-center gap-5 border-b border-hairline px-2 py-7 transition-colors duration-200 ease-nb hover:bg-gold-fade lg:grid-cols-[140px_minmax(0,2.4fr)_minmax(0,2fr)_140px_120px]"
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
            <div className="flex flex-col gap-0.5 font-mono text-[11px] text-fg-dim">
              <span>
                <span className="text-fg">{r.keys} keys</span> · {r.v2} in v2
              </span>
            </div>
            <Link
              href={`/connect?bundle=${r.slug}`}
              className="inline-flex items-center justify-center justify-self-start border border-hairline-bright bg-transparent px-4 py-2 font-mono text-[11px] text-fg-mid transition-colors duration-150 ease-nb hover:border-gold hover:text-gold lg:justify-self-end"
            >
              → fork
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-10 max-w-[700px] font-mono text-[12.5px] leading-[1.7] text-fg-dim">
        <span className="text-gold">// note</span> &nbsp; A bundle defines which services and
        which connect flows fire on `novabash init`. It does not lock you in. Fork, swap any
        service, publish your own, all on the free tier.
      </p>
    </div>
  );
}
