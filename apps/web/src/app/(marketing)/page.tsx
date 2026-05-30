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
    <section className="grid items-start gap-12 py-20 lg:grid-cols-2">
      <div>
        <span className="inline-block border border-hairline-bright px-2.5 py-1 font-mono text-[11px] uppercase tracking-caps text-fg-dim">
          Local-first · v0.2 · no account, no server
        </span>
        <h1 className="mt-5 text-[44px] font-extrabold leading-[1.05] tracking-heading text-fg">
          An encrypted .env vault that never leaves your laptop.
        </h1>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-fg-mid">
          Most secret managers want an account, a server, and a monthly invoice to
          hold keys you already have on your own machine. NovaBash skips all of
          that. Your vault is encrypted in the browser, you paste your keys in, and
          you pull a .env when you need one. Nothing syncs, because there is nowhere
          for it to sync to.
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
            Browse the bundles
          </Link>
        </div>
        <p className="mt-4 font-mono text-[11px] text-fg-dim">
          AES-256-GCM in your browser. There is no server to breach, because there
          is no server.
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
      title: 'Pick a passphrase',
      body: 'It derives the key that encrypts the vault. We never see it, and there is no reset link, because there is no us to email one. You also get a 24-word recovery phrase as a backup way in, so a forgotten passphrase is not the end of the road. Keep both somewhere you trust.',
    },
    {
      n: '02',
      title: 'Paste your keys',
      body: 'Add services by hand, or apply a stack bundle and fill in the blanks. Supabase, Stripe, OpenRouter, whatever your project drags along. It all stays on the device.',
    },
    {
      n: '03',
      title: 'Pull a .env',
      body: 'Generate a .env for the environment you are working in and get back to it. Export an encrypted backup so a wiped browser is an annoyance, not a catastrophe.',
    },
  ];
  return (
    <section className="border-t border-hairline py-20">
      <h2 className="text-[28px] font-extrabold tracking-heading text-fg">Three steps, then you forget it exists</h2>
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
          <h2 className="text-[28px] font-extrabold tracking-heading text-fg">Why keep it local</h2>
          <p className="mt-5 text-[15px] leading-relaxed text-fg-mid">
            A solo dev or a small team does not need a third party babysitting their
            keys. Keeping the vault on your own machine kills the account, the bill,
            and the awkward question of who else can read your secrets. The catch is
            honest, so here it is: you own your backups. Export the encrypted file,
            keep it somewhere safe, and you can walk it to any machine.
          </p>
        </div>
        <div className="border border-hairline bg-bg-elev-1 p-6">
          <h3 className="font-mono text-[11px] uppercase tracking-caps text-fg-dim">What you actually get</h3>
          <ul className="mt-4 grid gap-3 text-[14px] text-fg-mid">
            <li>An encrypted vault in the browser, AES-256-GCM under your passphrase.</li>
            <li>Stack bundles, so you are not staring at a blank .env.</li>
            <li>A separate .env per environment, generated on demand.</li>
            <li>A hash-chained audit log, so you can prove your own history was not quietly edited.</li>
            <li>Encrypted export and import, for backups and new machines.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="border-t border-hairline py-20 text-center">
      <h2 className="text-[28px] font-extrabold tracking-heading text-fg">Open it and have a poke around</h2>
      <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-fg-mid">
        It runs entirely in the browser. Pick a passphrase and you are in. No
        signup, no card, no welcome email three minutes later.
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
