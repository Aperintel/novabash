'use client';

import { useState } from 'react';
import { Icon } from './Icon';
import type { ServiceAdapter } from '@/lib/services';

type StepStatus = 'idle' | 'validating' | 'connected' | 'failed';

export function ConnectStep({
  service,
  index,
  total,
  initialStatus = 'idle',
  onConnected,
}: {
  service: ServiceAdapter;
  index: number;
  total: number;
  initialStatus?: StepStatus;
  onConnected?: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<StepStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('validating');
    setError(null);
    const result = await service.validate(values);
    if (result.ok) {
      setStatus('connected');
      onConnected?.(values);
    } else {
      setStatus('failed');
      setError(result.error);
    }
  };

  const isLocked = status === 'connected';

  return (
    <article className="border border-hairline-bright bg-bg-elev">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-caps text-fg-dim">
            {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="h-3 w-px bg-hairline-bright" />
          <span className="text-[16px] font-bold tracking-heading">{service.name}</span>
          <span className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
            {service.category}
          </span>
        </div>
        <StatusBadge status={status} />
      </header>

      <form onSubmit={submit} className="space-y-5 p-6">
        <p className="text-[13px] text-fg-mid">
          {status === 'connected'
            ? 'Validated and stored in the encrypted vault.'
            : 'Paste the credentials below. Each one is validated against the live API before it lands in the vault.'}
        </p>

        <div className="space-y-4">
          {service.fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor={`${service.id}-${field.id}`}
                  className="text-[12.5px] font-semibold tracking-body text-fg"
                >
                  {field.label}
                </label>
                <span className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
                  {field.envName}
                </span>
              </div>
              <input
                id={`${service.id}-${field.id}`}
                type="text"
                spellCheck={false}
                autoComplete="off"
                placeholder={field.placeholder}
                value={values[field.id] ?? ''}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.id]: e.target.value }))
                }
                disabled={isLocked}
                className="border border-hairline-bright bg-bg-elev-3 px-3.5 py-2.5 font-mono text-[13px] text-fg placeholder:text-fg-fade focus:border-gold focus:outline-none disabled:opacity-60"
              />
              <span className="font-mono text-[11px] text-fg-dim">{field.helpText}</span>
            </div>
          ))}
        </div>

        {error && (
          <p className="flex items-center gap-2 font-mono text-[11px] text-ember">
            <Icon name="error" size={14} />
            {error}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-hairline pt-5">
          <a
            href={service.apiKeysUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-[11px] text-fg-dim hover:text-fg"
          >
            <Icon name="share" size={12} />
            open the {service.name} keys page
          </a>
          <button
            type="submit"
            disabled={isLocked || status === 'validating'}
            className="flex items-center gap-2 bg-gold px-5 py-2.5 text-[13px] font-semibold text-bg transition-colors duration-150 ease-nb hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'validating'
              ? 'Validating'
              : status === 'connected'
                ? 'Connected'
                : 'Validate and store'}
            {status !== 'connected' && <span className="font-mono text-xs">→</span>}
          </button>
        </div>
      </form>
    </article>
  );
}

function StatusBadge({ status }: { status: StepStatus }) {
  if (status === 'idle') {
    return (
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-caps text-fg-dim">
        <Icon name="idle" size={12} />
        not yet
      </span>
    );
  }
  if (status === 'validating') {
    return (
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-caps text-ember">
        <Icon name="validating" size={12} />
        validating
      </span>
    );
  }
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-caps text-mint">
        <Icon name="ok" size={12} />
        connected
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-caps text-ember">
      <Icon name="error" size={12} />
      failed
    </span>
  );
}
