'use client';

import { useState } from 'react';
import { Icon } from './Icon';
import { generateAllEnvs, type Variant } from '@/lib/env-generator';

export function EnvPreview({ bundleId }: { bundleId: string }) {
  const files = generateAllEnvs(bundleId);
  const [variant, setVariant] = useState<Variant>('development');
  const [copied, setCopied] = useState(false);
  const file = files.find((f) => f.variant === variant)!;

  const copy = async () => {
    await navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-hairline-bright bg-bg-elev">
      <header className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <div className="flex gap-1">
          {files.map((f) => (
            <button
              key={f.variant}
              type="button"
              onClick={() => setVariant(f.variant)}
              className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-caps transition-colors duration-150 ease-nb ${
                variant === f.variant
                  ? 'bg-gold-fade text-gold'
                  : 'text-fg-dim hover:text-fg'
              }`}
            >
              {f.variant}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-2 border border-hairline-bright px-2.5 py-1.5 font-mono text-[11px] text-fg-mid transition-colors hover:border-gold hover:text-gold"
          >
            <Icon name="copy" size={12} />
            {copied ? 'copied' : 'copy'}
          </button>
          <button
            type="button"
            onClick={download}
            className="flex items-center gap-2 bg-gold px-3 py-1.5 font-mono text-[11px] font-semibold text-bg transition-colors hover:bg-gold-bright"
          >
            <Icon name="downloadEnv" size={12} />
            download {file.filename}
          </button>
        </div>
      </header>
      <pre className="overflow-x-auto bg-bg p-5 font-mono text-[12.5px] leading-[1.7] text-fg-mid">
        <code>{file.content}</code>
      </pre>
    </div>
  );
}
