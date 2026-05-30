import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Recent product updates from NovaBash.',
};

const entries: Array<{ date: string; title: string; body: string }> = [
  {
    date: '2026-05-30',
    title: 'Multiple environment profiles',
    body: 'Each key now holds a separate value per environment, with development, staging, and production by default and any others you add. Switch environment in the dashboard and generate the matching .env. All of it stays in the local vault.',
  },
  {
    date: '2026-05-30',
    title: 'NovaBash is now local-first (v0.2)',
    body: 'A full rebuild. The vault is encrypted in your browser with AES-256-GCM under a passphrase you choose, and stored on your device. No account, no server, no database, no subscription. Generate a .env on demand, keep a tamper-evident local audit log, and export an encrypted backup whenever you like.',
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
        What shipped, newest first. The full commit history lives on{' '}
        <a
          className="font-mono text-gold hover:underline"
          href="https://github.com/aperintel/novabash"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
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
