import Link from 'next/link';
import { TerminalHero } from '@/components/TerminalHero';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-7">
      <Hero />
      <WhatItDoes />
      <Proof />
    </div>
  );
}

function Hero() {
  return (
    <section className="pb-20 pt-24">
      <h1 className="mb-7 max-w-[1100px] text-[clamp(42px,7vw,88px)] font-extrabold leading-[0.95] tracking-display">
        A vault, a graph,
        <br />
        and a CLI for
        <br />
        <span className="text-gold">eight services</span>
        <br />
        <span className="text-fg-dim">you would open anyway.</span>
      </h1>

      <p className="mb-10 max-w-[640px] text-[19px] leading-[1.55] text-fg-mid">
        Type one command. NovaBash provisions Supabase, Vercel, an LLM router, Redis, and four
        more from a single workspace key. No scattered .env files, no eight tabs, you go back to
        building things.
      </p>

      <div className="mb-16 flex flex-wrap items-center gap-3.5">
        <Link
          href="/sign-up"
          className="flex items-center gap-2.5 bg-gold px-6 py-3.5 text-[14px] font-semibold text-bg transition-colors duration-150 ease-nb hover:bg-gold-bright"
        >
          Start free
          <span className="font-mono text-xs">→</span>
        </Link>
        <Link
          href="/stacks"
          className="flex items-center gap-2.5 border border-hairline-bright bg-transparent px-6 py-3.5 text-[14px] font-medium text-fg transition-colors duration-150 ease-nb hover:border-gold hover:text-gold"
        >
          Browse stacks
        </Link>
        <span className="ml-2 font-mono text-[11px] text-fg-dim">
          fifty projects on the free tier, forever
        </span>
      </div>

      <TerminalHero />

      <Metrics />
    </section>
  );
}

function Metrics() {
  const items = [
    { num: '12', unit: 's', label: 'cold start to .env' },
    { num: '6', unit: '', label: 'stack bundles shipped' },
    { num: '50', unit: '', label: 'free projects per workspace' },
    { num: '£0', unit: '', label: 'forever, for individuals' },
  ];
  return (
    <div className="-mx-7 grid grid-cols-2 border-y border-hairline px-7 sm:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="border-r border-hairline px-6 py-7 last:border-r-0 sm:[&:nth-child(2)]:border-r"
        >
          <div className="mb-2 text-[44px] font-extrabold leading-none tracking-display text-fg">
            {item.num}
            {item.unit && (
              <span className="ml-1 text-[18px] font-medium text-fg-dim">{item.unit}</span>
            )}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

const widItems: Array<{ num: string; title: string; body: string }> = [
  {
    num: '/01 connect',
    title: 'Guided service connection',
    body: 'Each connect step is a focused page with one paste field, plain-language instructions, and live key validation against the vendor API. Wrong scope, malformed token, expired key, all caught before the value ever touches your project.',
  },
  {
    num: '/02 vault',
    title: 'AES-256 credential vault',
    body: 'Every API key, database URL, and service token sits in an envelope-encrypted Postgres vault. Per-workspace data keys, hardware-backed master keys, full access trail. Plain-text credentials never exist on disk.',
  },
  {
    num: '/03 generate',
    title: '.env on demand, every environment',
    body: 'Three environments per project: development, staging, production. Each with its own credential set and its own ready-to-paste .env. Promote staging to production with one confirmation, audit-logged.',
  },
  {
    num: '/04 watch',
    title: 'Cross-service live usage',
    body: 'A single graph showing real usage from every service: rows in your database, tokens against your LLM cap, emails sent this month, edge function invocations. Polled directly from each vendor.',
  },
  {
    num: '/05 fork',
    title: 'Forkable community stacks',
    body: 'Publish your stack configuration as a bundle. Other developers fork it into their own workspace with one click and get the same architecture. Lineage tracked, stars and changelog notes attached.',
  },
  {
    num: '/06 audit',
    title: 'Hash-chained audit log',
    body: 'Every provisioning step, every credential read, every environment promotion is appended to an immutable, cryptographically chained log. Export as signed JSON for compliance or curiosity.',
  },
];

function WhatItDoes() {
  return (
    <section className="py-24">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">01</span>
        <span>what it does</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <h2 className="mb-6 max-w-[900px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
        Plumbing,
        <br />
        <span className="text-fg-dim">handled.</span>
      </h2>
      <p className="mb-14 max-w-[600px] text-[17px] leading-[1.55] text-fg-mid">
        NovaBash sits between your project and the eight services it depends on. Six things it
        does so you do not have to.
      </p>

      <div className="grid border-l border-t border-hairline sm:grid-cols-2">
        {widItems.map((item) => (
          <div
            key={item.num}
            className="group relative min-h-[220px] border-b border-r border-hairline p-9 transition-colors duration-200 ease-nb hover:bg-gold-fade"
          >
            <span className="mb-4 block font-mono text-[11px] tracking-[0.06em] text-gold">
              {item.num}
            </span>
            <h3 className="mb-3 text-[20px] font-bold leading-[1.2] tracking-heading">
              {item.title}
            </h3>
            <p className="text-[14.5px] leading-[1.65] text-fg-mid">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Proof() {
  const traceLines: Array<{ ts: string; svc?: string; arrow?: boolean; result: string; ok?: boolean; tag?: boolean }> = [
    { ts: '00.0', result: 'novabash init', svc: '$' },
    { ts: '00.1', result: 'vault unlocked', ok: true },
    { ts: '01.4', svc: 'supabase', arrow: true, result: 'project created', ok: true },
    { ts: '02.6', svc: 'vercel', arrow: true, result: 'project linked', ok: true },
    { ts: '04.1', svc: 'openrouter', arrow: true, result: 'key validated', ok: true },
    { ts: '05.5', svc: 'upstash redis', arrow: true, result: 'db provisioned', ok: true },
    { ts: '06.9', svc: 'upstash vector', arrow: true, result: 'index ready', ok: true },
    { ts: '08.2', svc: 'resend', arrow: true, result: 'domain attached', ok: true },
    { ts: '09.6', svc: 'inngest', arrow: true, result: 'env created', ok: true },
    { ts: '11.0', svc: 'lemon squeezy', arrow: true, result: 'store linked', ok: true },
    { ts: '11.8', svc: '.env.development', arrow: true, result: '14 keys written' },
    { ts: '12.4', tag: true, result: 'workspace key · nb_ws_7f3a9e2c1b8d4f60' },
  ];

  return (
    <section className="border-t border-hairline py-24">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">02</span>
        <span>twelve seconds</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <h2 className="mb-6 max-w-[900px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
        From <span className="text-fg-dim">zsh prompt</span>
        <br />
        to first commit.
      </h2>
      <p className="mb-14 max-w-[600px] text-[17px] leading-[1.55] text-fg-mid">
        The complete provisioning trace from a real Builder AI bundle. No edits.
      </p>

      <div className="grid border border-hairline-bright bg-bg-elev lg:grid-cols-[1.1fr_1fr]">
        <div className="border-b border-hairline p-12 lg:border-b-0 lg:border-r">
          <div className="mb-5 font-mono text-[10px] uppercase tracking-caps text-gold">
            trace · builder ai bundle
          </div>
          <h3 className="mb-4 text-[28px] font-extrabold leading-[1.05] tracking-heading">
            Eight services, one CLI invocation, one .env download.
          </h3>
          <p className="mb-7 text-[15px] leading-[1.65] text-fg-mid">
            This is what happens after you type{' '}
            <span className="font-mono text-gold">novabash init</span> and select Builder AI.
            NovaBash walks the connect flow for each service, stores the credentials in your
            vault, and writes a fresh .env file to your local environment.
          </p>
          <ul className="font-mono text-[13px]">
            {[
              ['workspace', 'ai-saas-starter'],
              ['bundle', 'builder-ai'],
              ['services connected', '8'],
              ['total time', '12.4s'],
              ['.env keys written', '14'],
              ['audit entries', '26'],
            ].map(([k, v]) => (
              <li
                key={k}
                className="flex items-center justify-between border-t border-hairline py-2.5 last:border-b"
              >
                <span className="text-fg-dim">{k}</span>
                <span className="font-medium text-fg">{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-bg p-9 font-mono text-[13px] leading-[2.1]">
          {traceLines.map((line, i) => (
            <div key={i} className="block">
              <span className="text-fg-fade">[{line.ts}]</span>{' '}
              {line.svc === '$' ? (
                <>
                  <span className="text-gold">$</span>{' '}
                  <span className="font-semibold text-fg">{line.result}</span>
                </>
              ) : line.tag ? (
                <span className="text-gold">{line.result}</span>
              ) : (
                <>
                  <span className="text-fg-mid">{line.svc}</span>
                  {line.arrow && <span className="mx-2 text-fg-mid">→</span>}
                  <span className="text-fg">{line.result}</span>{' '}
                  {line.ok && <span className="text-mint">✓</span>}
                </>
              )}
            </div>
          ))}
          <div className="block pt-4">
            <span className="text-mint">ready in 12.4s.</span>{' '}
            <span className="text-fg-dim">build something.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
