'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { EnvSwitcher } from './EnvSwitcher';
import { PromoteDialog } from './PromoteDialog';
import { BurnRateSettings, readBurnThreshold } from './BurnRateSettings';

/**
 * Dashboard header actions: env switcher, promote button, download .env,
 * rotate keys, plus the modals those buttons open. Lives client-side so
 * modal state and cookie reads work in the browser.
 */

export function DashboardActions() {
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [burnOpen, setBurnOpen] = useState(false);
  const [threshold, setThreshold] = useState(90);

  useEffect(() => {
    setThreshold(readBurnThreshold());
  }, []);

  return (
    <div className="flex items-center gap-2">
      <EnvSwitcher />
      <button
        type="button"
        onClick={() => setPromoteOpen(true)}
        className="flex items-center gap-2 border border-hairline-bright px-3.5 py-2 font-mono text-[11.5px] text-fg-mid transition-colors hover:border-gold hover:text-gold"
      >
        <Icon name="rotate" size={12} />
        promote
      </button>
      <button
        type="button"
        className="flex items-center gap-2 border border-hairline-bright px-3.5 py-2 font-mono text-[11.5px] text-fg-mid transition-colors hover:border-gold hover:text-gold"
      >
        <Icon name="downloadEnv" size={12} />
        download .env
      </button>
      <button
        type="button"
        className="flex items-center gap-2 bg-gold px-3.5 py-2 font-mono text-[11.5px] font-semibold text-bg transition-colors hover:bg-gold-bright"
      >
        <Icon name="rotate" size={12} />
        rotate keys
      </button>

      <PromoteDialog
        open={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        onConfirm={async ({ from, to, overwrite }) => {
          // Real call lands in the workspace Server Action when the api is
          // reachable in dev. For now the dialog confirms locally so UX
          // can be exercised end-to-end without a Supabase project.
          await new Promise((r) => setTimeout(r, 700));
          return {
            copied: from === to ? 0 : 7,
            skipped: overwrite ? 0 : 1,
          };
        }}
      />
      <BurnRateSettings
        open={burnOpen}
        onClose={() => setBurnOpen(false)}
        initial={threshold}
        onChange={setThreshold}
      />

      <button
        type="button"
        onClick={() => setBurnOpen(true)}
        className="ml-1 font-mono text-[11px] text-fg-dim transition-colors hover:text-gold"
        title="Burn-rate threshold"
      >
        ⚙
      </button>
    </div>
  );
}
