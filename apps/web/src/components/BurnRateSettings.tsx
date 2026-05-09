'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';

const COOKIE = 'nb-burn-threshold';
const DEFAULT = 90;

export function readBurnThreshold(): number {
  if (typeof document === 'undefined') return DEFAULT;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  if (!m?.[1]) return DEFAULT;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1 || n > 100) return DEFAULT;
  return Math.round(n);
}

export function writeBurnThreshold(v: number) {
  if (typeof document === 'undefined') return;
  const ninetyDays = 60 * 60 * 24 * 90;
  document.cookie = `${COOKIE}=${v}; path=/; max-age=${ninetyDays}; SameSite=Lax`;
}

export function BurnRateSettings({
  open,
  onClose,
  onChange,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onChange: (v: number) => void;
  initial: number;
}) {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial]);
  if (!open) return null;

  const save = () => {
    writeBurnThreshold(value);
    onChange(value);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-bg/70 px-7 pt-[14vh] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="burn-heading"
    >
      <div className="w-full max-w-[480px] border border-hairline-bright bg-bg-elev shadow-card">
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-gold">
              <Icon name="ok" size={16} />
            </span>
            <h2 id="burn-heading" className="text-[16px] font-bold tracking-heading">
              Burn-rate alert
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] text-fg-dim hover:text-fg"
          >
            esc
          </button>
        </header>
        <div className="space-y-5 p-6">
          <p className="text-[14px] leading-[1.6] text-fg-mid">
            Fire an alert when any service crosses this percentage of its free-tier quota. Default
            is 90 percent. Per-service overrides land in week 11; for now this is workspace-wide.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={50}
              max={99}
              step={1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="flex-1 accent-gold"
            />
            <span className="w-16 text-right font-mono text-[18px] font-bold text-gold">
              {value}%
            </span>
          </div>
        </div>
        <footer className="flex items-center justify-between border-t border-hairline px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[12px] text-fg-dim hover:text-fg"
          >
            ← cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="bg-gold px-4 py-2 text-[13px] font-semibold text-bg transition-colors hover:bg-gold-bright"
          >
            Save threshold
          </button>
        </footer>
      </div>
    </div>
  );
}
