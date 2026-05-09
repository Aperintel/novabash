'use client';

import { useState } from 'react';
import { Icon } from './Icon';

export type Status = 'green' | 'amber' | 'red';

export interface SignalResult {
  status: Status;
  detail: string;
}

export interface KeyHealthRecord {
  id: string;
  serviceId: string;
  fieldId: string;
  envName: string;
  environment: 'development' | 'staging' | 'production';
  health: {
    overall: Status;
    dominant: 'age' | 'validity' | 'scope' | 'exposure';
    recommend: 'rotate' | 'inspect' | 'none';
    signals: {
      age: SignalResult;
      validity: SignalResult;
      scope: SignalResult;
      exposure: SignalResult;
    };
  };
}

const tone: Record<Status, { text: string; bg: string; dot: string; label: string }> = {
  green: { text: 'text-mint', bg: 'bg-mint-fade', dot: 'bg-mint', label: 'green' },
  amber: { text: 'text-ember', bg: 'bg-ember-fade', dot: 'bg-ember', label: 'amber' },
  red: { text: 'text-ember', bg: 'bg-ember-fade', dot: 'bg-ember', label: 'red' },
};

export function KeyHealthRow({
  record,
  onRotate,
}: {
  record: KeyHealthRecord;
  onRotate?: (id: string) => void;
}) {
  const [open, setOpen] = useState(record.health.overall === 'red');
  const t = tone[record.health.overall];

  return (
    <article className="border-b border-hairline last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-bg-elev-2"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className={`block h-1.5 w-1.5 ${t.dot}`} />
          <span className="text-[14.5px] font-semibold text-fg">{record.serviceId}</span>
          <span className="font-mono text-[11px] text-fg-dim">{record.envName}</span>
          <span className="font-mono text-[10px] uppercase tracking-caps text-fg-dim">
            {record.environment}
          </span>
        </div>
        <span
          className={`flex items-center gap-2 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-caps ${t.bg} ${t.text}`}
        >
          {t.label}
        </span>
        <span className={`text-fg-dim transition-transform ${open ? 'rotate-180' : ''}`}>
          <Icon name="expand" size={14} />
        </span>
      </button>

      {open && (
        <div className="border-t border-hairline bg-bg px-5 py-5">
          <div className="grid grid-cols-[120px_1fr_120px] gap-x-4 gap-y-2 font-mono text-[12.5px]">
            <SignalLine name="age" signal={record.health.signals.age} />
            <SignalLine name="validity" signal={record.health.signals.validity} />
            <SignalLine name="scope" signal={record.health.signals.scope} />
            <SignalLine name="exposure" signal={record.health.signals.exposure} />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4 font-mono text-[12px]">
            <div className="flex items-center gap-3">
              <span className="text-fg-dim">overall</span>
              <span className={`flex items-center gap-2 ${t.text}`}>
                <span className={`block h-1.5 w-1.5 ${t.dot}`} />
                {t.label}
              </span>
              <span className="text-fg-dim">·</span>
              <span className="text-fg-dim">dominant signal:</span>
              <span className="text-fg">{record.health.dominant}</span>
            </div>
            {record.health.recommend === 'rotate' ? (
              <button
                type="button"
                onClick={() => onRotate?.(record.id)}
                className="flex items-center gap-2 bg-gold px-3.5 py-1.5 text-[11px] font-semibold text-bg transition-colors hover:bg-gold-bright"
              >
                <Icon name="rotate" size={12} />
                rotate now
              </button>
            ) : record.health.recommend === 'inspect' ? (
              <span className="font-mono text-[11px] text-fg-dim">recommend: take a look</span>
            ) : (
              <span className="font-mono text-[11px] text-fg-dim">recommend: nothing for now</span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function SignalLine({ name, signal }: { name: string; signal: SignalResult }) {
  const t = tone[signal.status];
  return (
    <>
      <span className="text-fg-dim">{name}</span>
      <span className="text-fg-mid">{signal.detail}</span>
      <span className={`flex items-center justify-end gap-2 ${t.text}`}>
        <span className={`block h-1 w-1 ${t.dot}`} />
        {t.label}
      </span>
    </>
  );
}
