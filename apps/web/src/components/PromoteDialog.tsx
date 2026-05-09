'use client';

import { useState } from 'react';
import { Icon } from './Icon';

type Variant = 'development' | 'staging' | 'production';

export function PromoteDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (input: { from: Variant; to: Variant; overwrite: boolean }) => Promise<{
    copied: number;
    skipped: number;
  } | null>;
}) {
  const [from, setFrom] = useState<Variant>('staging');
  const [to, setTo] = useState<Variant>('production');
  const [overwrite, setOverwrite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ copied: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await onConfirm({ from, to, overwrite });
      if (r) setResult(r);
      else setError('Promotion failed. Check the audit log.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Promotion failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-bg/70 px-7 pt-[14vh] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promote-heading"
    >
      <div className="w-full max-w-[560px] border border-hairline-bright bg-bg-elev shadow-card">
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-gold">
              <Icon name="rotate" size={16} />
            </span>
            <h2 id="promote-heading" className="text-[16px] font-bold tracking-heading">
              Promote environment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] text-fg-dim hover:text-fg"
            aria-label="Close"
          >
            esc
          </button>
        </header>

        <div className="space-y-5 p-6">
          {!result ? (
            <>
              <p className="text-[14px] leading-[1.6] text-fg-mid">
                Copies every credential from the source environment to the target, re-sealing each
                one under a fresh data key. Audit-logged per credential plus a summary entry.
              </p>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <Select label="from" value={from} onChange={setFrom} />
                <span className="font-mono text-fg-dim">→</span>
                <Select label="to" value={to} onChange={setTo} />
              </div>

              <label className="flex items-center gap-2.5 text-[13px] text-fg-mid">
                <input
                  type="checkbox"
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                  className="h-3.5 w-3.5 accent-gold"
                />
                Overwrite credentials that already exist in the target environment.
              </label>

              {error && (
                <p className="flex items-center gap-2 font-mono text-[11px] text-ember">
                  <Icon name="error" size={12} />
                  {error}
                </p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-mint">
                  <Icon name="ok" size={18} />
                </span>
                <span className="text-[16px] font-semibold">
                  Promoted {result.copied} credential{result.copied === 1 ? '' : 's'}
                  {result.skipped > 0 && ` and skipped ${result.skipped}`}
                </span>
              </div>
              <p className="font-mono text-[11px] text-fg-dim">
                Each copy was re-sealed under a fresh data key. Audit chain extended.
              </p>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-hairline px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[12px] text-fg-dim hover:text-fg"
          >
            ← cancel
          </button>
          {!result ? (
            <button
              type="button"
              disabled={busy || from === to}
              onClick={submit}
              className="flex items-center gap-2 bg-gold px-4 py-2 text-[13px] font-semibold text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Promoting' : 'Promote'}
              {!busy && <span className="font-mono text-xs">→</span>}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="bg-gold px-4 py-2 text-[13px] font-semibold text-bg transition-colors hover:bg-gold-bright"
            >
              Done
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Variant;
  onChange: (v: Variant) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Variant)}
        className="border border-hairline-bright bg-bg-elev-3 px-3 py-2 font-mono text-[13px] text-fg focus:border-gold focus:outline-none"
      >
        <option value="development">development</option>
        <option value="staging">staging</option>
        <option value="production">production</option>
      </select>
    </label>
  );
}
