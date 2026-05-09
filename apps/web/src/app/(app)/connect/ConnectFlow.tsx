'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ConnectStep } from '@/components/ConnectStep';
import { Icon } from '@/components/Icon';
import { bundleById } from '@/lib/bundles';
import { getService } from '@/lib/services';

export function ConnectFlow({ bundleId }: { bundleId: string }) {
  const bundle = bundleById(bundleId);
  const steps = useMemo(() => {
    if (!bundle) return [];
    return bundle.services
      .map((s) => getService(s.id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
  }, [bundle]);

  const [connected, setConnected] = useState<Set<string>>(new Set());

  if (!bundle) return null;

  const allDone = connected.size === steps.length;
  const progress = (connected.size / steps.length) * 100;

  return (
    <div className="space-y-5">
      <div className="border border-hairline-bright bg-bg-elev p-5">
        <div className="mb-3 flex items-center justify-between font-mono text-[11px] tracking-caps text-fg-dim">
          <span>progress</span>
          <span>
            {connected.size} of {steps.length} connected
          </span>
        </div>
        <div className="h-1 w-full bg-hairline">
          <div
            className="h-full bg-gold transition-all duration-300 ease-nb"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {steps.map((service, i) => (
        <ConnectStep
          key={service.id}
          service={service}
          index={i + 1}
          total={steps.length}
          onConnected={() =>
            setConnected((prev) => {
              const next = new Set(prev);
              next.add(service.id);
              return next;
            })
          }
        />
      ))}

      <div className="border border-hairline-bright bg-bg-elev p-6">
        {allDone ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-mint">
                <Icon name="ok" size={18} />
              </span>
              <span className="text-[15px] font-semibold">
                Vault sealed. Workspace key generated. Ready to download .env.
              </span>
            </div>
            <Link
              href={`/workspace?bundle=${bundleId}`}
              className="flex items-center gap-2 bg-gold px-5 py-3 text-[13.5px] font-semibold text-bg transition-colors hover:bg-gold-bright"
            >
              Open workspace
              <span className="font-mono text-xs">→</span>
            </Link>
          </div>
        ) : (
          <p className="font-mono text-[12px] text-fg-dim">
            Workspace activates the moment every key on this bundle is validated.
          </p>
        )}
      </div>
    </div>
  );
}
