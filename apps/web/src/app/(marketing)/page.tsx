import Link from 'next/link';
import { TerminalHero } from '@/components/TerminalHero';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-7">
      <Hero />
      <HowItWorks />
      <WhyLocalFirst />
      <ClosingCta />
    </div>
  );
}

function Hero() {
  return (
    <section className="grid items-center gap-12 py-20 lg:grid-cols-2">
      <div>
        <span className="inline-block border border-hairline-bright px-2.5 py-1 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
          Local-first, v0.2
        </span>
        <h1 className="mt-5 text-[44px] font-extrabold leading-[1.05] tracking-heading text-fg">
          A vault for your API keys that never leaves your machine.
        </h1>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-fg-mid">
          NovaBash keeps the credentials your projects run on in an encrypted vault
          in your own browser. No account, no server, no subscription. Add your
          keys, apply a stack bundle, and generate a single .env on demand.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="bg-gold px-5 py-2.5 text-[14px] font-semibold text-bg transition-colors hover:bg-gold-bright"
          >
            Open the app
          </Link>
          <Link
            href="/stacks"
            className="border border-hairline-bright px-5 py-2.5 text-[14px] text-fg-mid transition-colors hover:border-gold hover:text-gold"
          >
            Browse stack bundles
          </Link>
        </div>
        <p className="mt-4 font-mono text-[11px] text-fg-dim">
          Encrypted with AES-256-GCM in your browser. Nothing is uploaded.
        </p>
      </div>
      <TerminalHero />
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Set a passphrase',
      body: 'It derives the encryption key for your vault. It is never stored and never sent anywhere.',
    },
    {
      n: '02',
      title: 'Add your keys',
      body: 'Add services by hand or apply a curated stack bundle, then fill in the values. Everything stays on your device.',
    },
    {
      n: '03',
      title: 'Generate a .env',
      body: 'Download a single .env for the project you are working on. Export an encrypted backup whenever you want.',
    },
  ];
  return (
    <section className="border-t border-hairline py-20">
      <h2 className="text-[28px] font-extrabold tracking-heading text-fg">How it works</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="border border-hairline bg-bg-elev-1 p-6">
            <span className="font-mono text-[13px] text-gold">{s.n}</span>
            <h3 className="mt-3 text-[16px] font-semibold text-fg">{s.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-fg-mid">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyLocalFirst() {
  return (
    <section className="border-t border-hairline py-20">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-[28px] font-extrabold tracking-heading text-fg">Why local-first</h2>
          <p className="mt-5 text-[15px] leading-relaxed text-fg-mid">
            A solo developer or a small team does not need a third party holding
            their secrets. Keeping the vault on your own device removes the
            account, the monthly bill, and the question of who else can read your
            keys. You manage your own encrypted backup, and that is the whole
            arrangement.
          </p>
        </div>
        <div className="border border-hairline bg-bg-elev-1 p-6">
          <h3 className="font-mono text-[11px] uppercase tracking-caps text-fg-dim">In the box</h3>
          <ul className="mt-4 grid gap-3 text-[14px] text-fg-mid">
            <li>Encrypted vault in your browser, AES-256-GCM under your passphrase.</li>
            <li>Curated stack bundles to start from.</li>
            <li>One .env generated locally on demand.</li>
            <li>A tamper-evident, hash-chained audit log of every change.</li>
            <li>Encrypted export and import to back up or move devices.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="border-t border-hairline py-20 text-center">
      <h2 className="text-[28px] font-extrabold tracking-heading text-fg">Open the vault</h2>
      <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-fg-mid">
        It runs entirely in your browser. Set a passphrase and you are in.
      </p>
      <div className="mt-7">
        <Link
          href="/dashboard"
          className="bg-gold px-6 py-3 text-[15px] font-semibold text-bg transition-colors hover:bg-gold-bright"
        >
          Open the app
        </Link>
      </div>
    </section>
  );
}
