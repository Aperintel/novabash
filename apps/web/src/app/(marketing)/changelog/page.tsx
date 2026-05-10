import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Recent product updates from NovaBash.',
};

const entries: Array<{ date: string; title: string; body: string }> = [
  {
    date: '2026-05-10',
    title: 'Multi-environment promote flow',
    body: 'Copy every credential from staging to production with a single confirmation. Each credential is re-sealed under a fresh data key on the way over and audit-logged separately, with a summary entry tying the rotations together.',
  },
  {
    date: '2026-05-10',
    title: 'Key Health, four signals per credential',
    body: 'Every key is graded on age, validity, scope, and exposure. The dashboard surfaces a single traffic-light status with a chevron-expand for the full breakdown, and contextually offers a one-click rotation when red.',
  },
  {
    date: '2026-05-09',
    title: 'Eight launch services, real validation',
    body: 'Supabase, Vercel, Resend, Lemon Squeezy, Plausible, OpenRouter, Upstash, and Cloudflare now validate against the vendor before a credential lands in the vault. Wrong scope, malformed token, expired key, all caught on the connect step.',
  },
  {
    date: '2026-05-09',
    title: 'Community catalogue is open',
    body: 'Forkable bundles with lineage, weighted star reviews, developer profiles. Eight stacks seeded, the trending feed is live, publishing your own bundle ships next.',
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-[900px] px-7 py-24">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">Changelog</span>
        <span>Updates, in order</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <h1 className="mb-4 text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
        Changelog
      </h1>
      <p className="mb-16 max-w-[600px] text-[17px] leading-[1.55] text-fg-mid">
        What shipped, in reverse order. Subscribe via the RSS feed at{' '}
        <span className="font-mono text-fg">novabash.dev/changelog/feed.xml</span> if you would
        rather read this in your reader.
      </p>
      <div className="border-t border-hairline">
        {entries.map((e) => (
          <article
            key={e.date}
            className="grid gap-3 border-b border-hairline py-9 sm:grid-cols-[140px_1fr]"
          >
            <span className="font-mono text-[12px] uppercase tracking-caps text-fg-dim">
              {e.date}
            </span>
            <div>
              <h2 className="mb-2 text-[20px] font-bold tracking-heading">{e.title}</h2>
              <p className="text-[15px] leading-[1.65] text-fg-mid">{e.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
