'use client';

import { useState, useTransition } from 'react';
import { joinWaitlist } from '@/app/actions/waitlist';
import { Icon } from './Icon';

type Status = 'idle' | 'submitting' | 'ok' | 'error';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setMessage(null);
    startTransition(async () => {
      const result = await joinWaitlist({ email });
      if (result.ok) {
        setStatus('ok');
        setMessage('You are on the list. We will write only when there is something to show.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(result.error);
      }
    });
  };

  return (
    <form onSubmit={submit} className="w-full max-w-[480px]">
      <div className="flex items-stretch border border-hairline-bright bg-bg-elev focus-within:border-gold">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@somewhere.dev"
          disabled={status === 'submitting'}
          className="flex-1 bg-transparent px-4 py-3 font-mono text-sm text-fg placeholder:text-fg-dim focus:outline-none"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === 'submitting' || status === 'ok'}
          className="flex items-center gap-2 bg-gold px-5 text-sm font-semibold text-bg transition-colors duration-150 ease-nb hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting' ? 'Saving' : status === 'ok' ? 'On the list' : 'Join'}
          {status !== 'ok' && <span className="font-mono text-xs">→</span>}
        </button>
      </div>
      {message && (
        <p
          className={`mt-3 flex items-center gap-2 font-mono text-xs ${
            status === 'ok' ? 'text-mint' : 'text-ember'
          }`}
        >
          <Icon name={status === 'ok' ? 'ok' : 'error'} size={14} />
          {message}
        </p>
      )}
    </form>
  );
}
