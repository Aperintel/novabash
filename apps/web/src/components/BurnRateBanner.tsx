'use client';

import { Icon } from './Icon';
import type { ServiceUsage } from '@/lib/usage-mock';

interface Props {
  services: ServiceUsage[];
  threshold: number; // 0-100
  onConfigure?: () => void;
}

export function BurnRateBanner({ services, threshold, onConfigure }: Props) {
  const breaching = services.filter(
    (s) => typeof s.primary.pct === 'number' && s.primary.pct >= threshold,
  );
  if (breaching.length === 0) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 border border-ember bg-ember-fade px-5 py-3"
    >
      <span className="flex items-center gap-2 text-ember">
        <Icon name="error" size={14} />
        <span className="font-mono text-[11px] uppercase tracking-caps">burn rate</span>
      </span>
      <span className="text-[13.5px] text-fg">
        {breaching.length} service{breaching.length === 1 ? '' : 's'} crossed{' '}
        <span className="font-mono">{threshold}%</span> of free tier:{' '}
        <span className="font-mono text-fg-mid">
          {breaching
            .map((s) => `${s.name} ${Math.round(s.primary.pct ?? 0)}%`)
            .join(', ')}
        </span>
      </span>
      {onConfigure && (
        <button
          type="button"
          onClick={onConfigure}
          className="ml-auto font-mono text-[11px] text-fg-dim transition-colors hover:text-gold"
        >
          configure thresholds →
        </button>
      )}
    </div>
  );
}
