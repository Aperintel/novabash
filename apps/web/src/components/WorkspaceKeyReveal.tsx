'use client';

import { useState } from 'react';
import { Icon } from './Icon';

export function WorkspaceKeyReveal({ workspaceKey }: { workspaceKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const masked = workspaceKey.slice(0, 4) + '••••••••••••••••••••••••' + workspaceKey.slice(-4);

  const copy = async () => {
    await navigator.clipboard.writeText(workspaceKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border border-gold bg-gold-fade p-6">
      <div className="mb-3 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-caps text-gold">
        <span className="block h-1.5 w-1.5 animate-glow bg-ember shadow-[0_0_8px_var(--ember)]" />
        workspace key
      </div>
      <h3 className="mb-2 text-[20px] font-bold tracking-heading text-fg">
        Your workspace key. Treat it like a password manager root.
      </h3>
      <p className="mb-5 text-[13.5px] leading-[1.6] text-fg-mid">
        The key is a pointer to the vault, not the contents. Use it from the CLI, from CI, and
        from the editor sidebar. If it leaks, rotate it from the vault page and the underlying
        service credentials stay safe.
      </p>
      <div className="flex items-stretch border border-hairline-bright bg-bg">
        <code className="flex-1 px-4 py-3 font-mono text-[14px] text-fg">
          {revealed ? workspaceKey : masked}
        </code>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="border-l border-hairline-bright px-4 font-mono text-[11px] text-fg-mid transition-colors hover:text-gold"
        >
          {revealed ? 'hide' : 'reveal'}
        </button>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-2 border-l border-hairline-bright bg-gold px-4 font-mono text-[11px] font-semibold text-bg transition-colors hover:bg-gold-bright"
        >
          <Icon name="copy" size={12} />
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
    </div>
  );
}
