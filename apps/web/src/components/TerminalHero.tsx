'use client';

import { useEffect, useState } from 'react';

interface OutputLine {
  text: string;
  className: string;
  delay: number;
}

const sequence: OutputLine[] = [
  { text: 'workspace · ai-saas-starter', className: 'text-fg-mid', delay: 500 },
  { text: '', className: '', delay: 200 },
  { text: 'select bundle ▸', className: 'text-fg-mid', delay: 400 },
  { text: '  /launchpad        standard SaaS', className: 'text-fg-dim', delay: 200 },
  { text: '  /builder-ai       AI-native app', className: 'text-fg-dim', delay: 200 },
  { text: '  /edge             cloudflare native', className: 'text-fg-dim', delay: 200 },
  { text: '  /data             analytics & pipelines', className: 'text-fg-dim', delay: 200 },
  { text: '  /mobile           react native & expo', className: 'text-fg-dim', delay: 200 },
  { text: '  /enterprise       regulated industries', className: 'text-fg-dim', delay: 300 },
  { text: '> /builder-ai', className: 'text-fg', delay: 700 },
  { text: '', className: '', delay: 200 },
  { text: 'connecting · supabase, vercel, openrouter, upstash, resend, inngest, lemon squeezy', className: 'text-fg-mid', delay: 800 },
  { text: '✓ all 7 keys validated', className: 'text-mint', delay: 600 },
  { text: '✓ vault sealed · 0 plaintext stored', className: 'text-mint', delay: 500 },
  { text: '✓ .env generated · development, staging, production', className: 'text-mint', delay: 500 },
  { text: '', className: '', delay: 200 },
  { text: 'workspace key · nb_ws_7f3a9e2c1b8d4f60', className: 'text-gold', delay: 400 },
  { text: 'ready in 12.4s. build something.', className: 'text-fg-mid', delay: 500 },
];

export function TerminalHero() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= sequence.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), sequence[step]!.delay);
    return () => clearTimeout(t);
  }, [step]);

  const visible = sequence.slice(0, step);

  return (
    <div className="border border-hairline-bright bg-bg-elev font-mono shadow-hero">
      <div className="flex items-center justify-between border-b border-hairline bg-bg-elev-2 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="block h-2.5 w-2.5 rounded-full bg-hairline-bright" />
          <span className="block h-2.5 w-2.5 rounded-full bg-hairline-bright" />
          <span className="block h-2.5 w-2.5 rounded-full bg-hairline-bright" />
        </div>
        <span className="text-[11px] tracking-[0.02em] text-fg-dim">
          ~/projects/ai-saas-starter, zsh
        </span>
        <span className="text-[10px] uppercase tracking-caps text-mint">● live</span>
      </div>
      <div className="min-h-[420px] px-10 py-8 text-[15px] leading-[1.85]">
        <div>
          <span className="text-gold">$</span>
          <span className="ml-2 font-semibold text-fg">novabash init</span>
        </div>
        {visible.map((line, i) => (
          <div key={i} className={line.className || 'text-fg-mid'}>
            {line.text || ' '}
          </div>
        ))}
        {step < sequence.length && (
          <span className="ml-0.5 inline-block h-[18px] w-[9px] -translate-y-[3px] bg-gold align-middle animate-blink" />
        )}
      </div>
    </div>
  );
}
