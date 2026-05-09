'use client';

import { useEffect, useState } from 'react';

const lines: Array<{
  prompt?: string;
  cmd?: string;
  out?: string;
  ok?: string;
  delay: number;
  className?: string;
}> = [
  { prompt: '~/the-app', cmd: 'novabash init', delay: 600 },
  { out: 'workspace created · acid-thrush-04', delay: 600 },
  { out: 'select bundle ▸', delay: 400 },
  { out: '  [1] launchpad      standard SaaS', delay: 200 },
  { out: '  [2] builder ai     AI-powered SaaS', delay: 200 },
  { out: '  [3] edge stack     edge-first', delay: 200 },
  { out: '  [4] data stack     pipelines, queues', delay: 200 },
  { out: '  [5] mobile first   Expo + Supabase', delay: 200 },
  { out: '  [6] enterprise     SOC2-ready', delay: 200 },
  { out: '> 2', delay: 600 },
  { out: 'connecting · supabase, vercel, openrouter, upstash, resend, inngest, lemon squeezy', delay: 800 },
  { ok: 'all 7 keys validated', delay: 600 },
  { ok: '.env generated · 3 variants · 0 plaintext stored', delay: 500 },
  { out: 'workspace key · nbk_••••••••••••••••••••••••', delay: 400 },
];

export function TerminalHero() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= lines.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), lines[step]!.delay);
    return () => clearTimeout(t);
  }, [step]);

  const visible = lines.slice(0, step);

  return (
    <div className="border border-hairline-bright bg-bg-elev font-mono shadow-hero">
      <div className="flex items-center justify-between border-b border-hairline bg-bg-elev-2 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="block h-2.5 w-2.5 rounded-full bg-hairline-bright" />
          <span className="block h-2.5 w-2.5 rounded-full bg-hairline-bright" />
          <span className="block h-2.5 w-2.5 rounded-full bg-hairline-bright" />
        </div>
        <span className="text-[11px] tracking-[0.02em] text-fg-dim">novabash · zsh</span>
        <span className="text-[10px] uppercase tracking-[0.1em] text-mint">live</span>
      </div>
      <div className="min-h-[360px] px-10 py-8 text-[15px] leading-[1.85]">
        {visible.map((line, i) => (
          <div key={i}>
            {line.prompt && (
              <>
                <span className="text-gold">{line.prompt}</span>
                <span className="mx-2 text-fg-mid">$</span>
                <span className="font-semibold text-fg">{line.cmd}</span>
              </>
            )}
            {line.out && <span className="text-fg-mid">{line.out}</span>}
            {line.ok && (
              <>
                <span className="text-mint">✓ </span>
                <span className="text-mint">{line.ok}</span>
              </>
            )}
          </div>
        ))}
        {step < lines.length && (
          <span className="ml-0.5 inline-block h-[18px] w-[9px] -translate-y-[3px] bg-gold align-middle animate-blink" />
        )}
      </div>
    </div>
  );
}
