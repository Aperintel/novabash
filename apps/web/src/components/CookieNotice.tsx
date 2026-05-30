'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ACK_KEY = 'nb-cookie-ack';

export function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ACK_KEY)) setShow(true);
    } catch {
      // No storage, no banner. Nothing to consent to anyway.
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-hairline bg-bg-elev-2/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-7 py-3 text-[12px] text-fg-mid">
        <span>
          Cookies? We do not set any. No analytics, no trackers, no third parties.
          Your vault lives in this browser and never leaves it.{' '}
          <Link href="/cookies" className="text-gold hover:underline">
            The boring details
          </Link>
          .
        </span>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(ACK_KEY, '1');
            } catch {
              // Ignore; just hide it for this session.
            }
            setShow(false);
          }}
          className="ml-auto border border-hairline-bright px-3 py-1.5 font-mono text-[11px] text-fg-mid transition-colors hover:border-gold hover:text-gold"
        >
          Fine by me
        </button>
      </div>
    </div>
  );
}
