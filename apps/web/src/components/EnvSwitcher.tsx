'use client';

import { useEffect, useState } from 'react';

type Variant = 'development' | 'staging' | 'production';

const variants: Variant[] = ['development', 'staging', 'production'];
const COOKIE = 'nb-env';

function readCookie(): Variant {
  if (typeof document === 'undefined') return 'development';
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  const v = match?.[1];
  if (v === 'staging' || v === 'production' || v === 'development') return v;
  return 'development';
}

function writeCookie(v: Variant) {
  if (typeof document === 'undefined') return;
  const ninetyDays = 60 * 60 * 24 * 90;
  document.cookie = `${COOKIE}=${v}; path=/; max-age=${ninetyDays}; SameSite=Lax`;
}

export function EnvSwitcher({
  onChange,
}: {
  onChange?: (variant: Variant) => void;
}) {
  const [active, setActive] = useState<Variant>('development');

  useEffect(() => {
    setActive(readCookie());
  }, []);

  const select = (v: Variant) => {
    setActive(v);
    writeCookie(v);
    onChange?.(v);
  };

  return (
    <div
      role="tablist"
      aria-label="Select environment"
      className="flex items-stretch border border-hairline-bright bg-bg-elev"
    >
      {variants.map((v) => {
        const isActive = active === v;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => select(v)}
            className={`px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-caps transition-colors duration-150 ease-nb ${
              isActive
                ? 'bg-gold-fade text-gold'
                : 'text-fg-dim hover:text-fg'
            }`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
