import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Build updates from NovaBash. Phase A is being built in public.',
};

const entries: Array<{ date: string; title: string; body: string }> = [
  {
    date: '2026-05-09',
    title: 'Brand system locked, holding page live',
    body: 'Mark, wordmark, six-colour palette, Onest plus Commit Mono, twenty-eight icon custom set, all set against the dark base. Full rationale in the brand book.',
  },
  {
    date: '2026-05-08',
    title: 'Build plan v1.2 finalised',
    body: 'Sixteen weeks from first commit to pricing launch. Phase A is BYOK. Phase B is platform-provisioned. The trigger between them is unit-economic, not aspirational.',
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-[900px] px-7 py-24">
      <div className="mb-7 flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
        <span className="text-gold">log</span>
        <span className="h-px max-w-[80px] flex-1 bg-hairline" />
      </div>
      <h1 className="mb-4 text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1] tracking-heading">
        Changelog
      </h1>
      <p className="mb-16 max-w-[600px] text-[17px] leading-[1.55] text-fg-mid">
        Every meaningful step in the build, in reverse order. Build-in-public is the marketing
        plan, so this page is also the Twitter feed and the LinkedIn feed and the Indie Hackers
        post, just dated and properly punctuated.
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
