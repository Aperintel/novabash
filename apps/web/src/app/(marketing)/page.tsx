import Link from 'next/link';
import { TerminalHero } from '@/components/TerminalHero';
import { WaitlistForm } from '@/components/WaitlistForm';
import { Icon } from '@/components/Icon';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-7">
      <section className="pb-20 pt-20">
        <div className="mb-14 flex items-center gap-5 font-mono text-[11px] tracking-[0.02em] text-fg-dim">
          <span className="block h-1.5 w-1.5 animate-glow bg-mint shadow-[0_0_8px_var(--mint)]" />
          <span>build · phase a · week zero</span>
          <span className="h-3 w-px bg-hairline-bright" />
          <Link href="/changelog" className="text-gold hover:text-gold-bright hover:underline">
            read the changelog
          </Link>
          <span className="h-3 w-px bg-hairline-bright" />
          <span>by aperintel</span>
        </div>

        <h1 className="mb-7 max-w-[1100px] text-[clamp(42px,7vw,88px)] font-extrabold leading-[0.95] tracking-display">
          One workspace, one vault, one <span className="text-gold">.env</span>, every service
          that the stack actually runs on.
        </h1>

        <p className="mb-10 max-w-[620px] text-[19px] leading-[1.55] text-fg-mid">
          NovaBash takes the six or seven accounts a modern application depends on, holds the keys
          inside an encrypted workspace, generates the .env file you would have written by hand,
          and watches every connected service so you find out about a quota before your customers
          do.
        </p>

        <div className="mb-16 flex flex-wrap items-center gap-3.5">
          <WaitlistForm />
          <span className="ml-2 font-mono text-[11px] text-fg-dim">
            no spam, two updates a month at most
          </span>
        </div>

        <TerminalHero />
      </section>

      <MetricStrip />

      <section className="border-t border-hairline py-24">
        <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
          <span className="text-gold">01</span>
          <span>what it actually does</span>
          <span className="h-px max-w-[80px] flex-1 bg-hairline" />
        </div>
        <h2 className="mb-6 max-w-[900px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
          The accounts you already pay for, working as one workspace.
        </h2>
        <p className="mb-14 max-w-[600px] text-[17px] leading-[1.55] text-fg-mid">
          NovaBash does not replace your services and does not resell them. You bring the keys,
          NovaBash holds them safely, validates them on the way in, generates the env file, and
          shows you what each one is doing.
        </p>
        <Grid />
      </section>

      <section className="border-t border-hairline py-24">
        <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
          <span className="text-gold">02</span>
          <span>the bundles that ship at launch</span>
          <span className="h-px max-w-[80px] flex-1 bg-hairline" />
        </div>
        <h2 className="mb-14 max-w-[900px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
          Six curated stacks, one community catalogue, your own bundles publishable too.
        </h2>
        <Bundles />
      </section>

      <section className="border-t border-hairline py-24">
        <div className="grid gap-10 sm:grid-cols-[1.2fr_1fr] sm:items-end">
          <h2 className="max-w-[700px] text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.05] tracking-heading">
            The waitlist is open while the build is public. Watch the work happen.
          </h2>
          <div>
            <WaitlistForm />
            <p className="mt-3 font-mono text-[11px] text-fg-dim">
              Build updates land in the changelog. The first 200 waitlist seats get the soft launch
              ahead of pricing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricStrip() {
  const items = [
    { num: '7', unit: '', label: 'services per stack, on average' },
    { num: '< 5', unit: 'min', label: 'from sign-up to first .env' },
    { num: '0', unit: '', label: 'plaintext credentials stored' },
    { num: '6', unit: '', label: 'curated bundles at launch' },
  ];
  return (
    <div className="-mx-7 grid grid-cols-2 border-y border-hairline px-7 sm:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="border-r border-hairline px-6 py-7 last:border-r-0 sm:[&:nth-child(2)]:border-r"
        >
          <div className="mb-2 font-extrabold leading-none tracking-display text-fg text-[44px]">
            {item.num}
            {item.unit && <span className="ml-1 text-[18px] font-medium text-fg-dim">{item.unit}</span>}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

const features: Array<{ num: string; title: string; body: string; icon: Parameters<typeof Icon>[0]['name'] }> = [
  {
    num: '01',
    icon: 'vault',
    title: 'Encrypted credential vault',
    body: 'AES-256-GCM with envelope encryption. Master keys live separately from credentials, in pgcrypto for the MVP and AWS KMS at v1.0. Every read is logged to a hash-chained audit trail.',
  },
  {
    num: '02',
    icon: 'downloadEnv',
    title: 'Three .env files, one click',
    body: 'Development, staging, and production are generated together with the right variable naming for the bundle\'s primary framework. Regenerate on rotation. Copy or download.',
  },
  {
    num: '03',
    icon: 'workspace',
    title: 'One workspace key',
    body: 'Pull credentials into your local shell, your CI run, your editor sidebar. The workspace key is a pointer to the vault, not the contents, so leaking it never leaks the underlying service keys.',
  },
  {
    num: '04',
    icon: 'ok',
    title: 'Cross-service health',
    body: 'Live usage from every connected service on one screen. Burn-rate alerts fire before a quota hits, key-age indicators surface anything older than ninety days, and rotation is one click.',
  },
];

function Grid() {
  return (
    <div className="grid border-l border-t border-hairline sm:grid-cols-2">
      {features.map((f) => (
        <div
          key={f.num}
          className="group relative min-h-[220px] border-b border-r border-hairline p-9 transition-colors duration-200 ease-nb hover:bg-gold-fade"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="block font-mono text-[11px] tracking-[0.06em] text-gold">{f.num}</span>
            <span className="text-fg-dim transition-colors group-hover:text-gold">
              <Icon name={f.icon} size={20} />
            </span>
          </div>
          <h3 className="mb-3 text-[20px] font-bold leading-[1.2] tracking-heading">{f.title}</h3>
          <p className="text-[14.5px] leading-[1.65] text-fg-mid">{f.body}</p>
        </div>
      ))}
    </div>
  );
}

const bundles: Array<{ name: string; tagline: string; services: string }> = [
  {
    name: 'Launchpad',
    tagline: 'Standard SaaS',
    services: 'Supabase · Vercel · Resend · Lemon Squeezy · Plausible',
  },
  {
    name: 'Builder AI',
    tagline: 'AI-powered SaaS',
    services: 'Launchpad + OpenRouter · Upstash Redis · Upstash Vector',
  },
  {
    name: 'Edge Stack',
    tagline: 'Edge-first',
    services: 'Cloudflare Workers, D1, R2, KV, Queues · Clerk',
  },
  {
    name: 'Data Stack',
    tagline: 'Pipelines and queues',
    services: 'Neon · R2 · Trigger.dev · Upstash · Supabase · Railway',
  },
  {
    name: 'Mobile First',
    tagline: 'Expo and Supabase',
    services: 'Expo EAS · Supabase · Cloudinary · RevenueCat · Expo Push · Railway',
  },
  {
    name: 'Enterprise Ready',
    tagline: 'SOC2-ready',
    services: 'Auth0 · Neon · Railway · R2 · Postmark · Datadog · Sentry',
  },
];

function Bundles() {
  return (
    <div className="border-t border-hairline">
      {bundles.map((b, i) => (
        <div
          key={b.name}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-hairline px-2 py-6 transition-colors duration-200 ease-nb hover:bg-gold-fade sm:grid-cols-[80px_1fr_2fr_auto]"
        >
          <span className="font-mono text-[11px] tracking-[0.06em] text-gold">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[20px] font-bold tracking-heading">{b.name}</span>
            <span className="font-mono text-[11px] uppercase tracking-caps text-fg-dim">
              {b.tagline}
            </span>
          </div>
          <span className="font-mono text-[12.5px] text-fg-mid">{b.services}</span>
          <span className="font-mono text-[11px] text-fg-dim">→</span>
        </div>
      ))}
    </div>
  );
}
