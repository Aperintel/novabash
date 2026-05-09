'use client';

import { useState, useTransition } from 'react';
import { Icon } from './Icon';
import { getBrowserClient } from '@/lib/supabase/browser';

type Mode = 'sign-in' | 'sign-up';

export function AuthPanel({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const oauth = (provider: 'github' | 'google') => {
    const client = getBrowserClient();
    if (!client) {
      setStatus('error');
      setErrorMsg(
        'Auth is not wired yet. Provision a Supabase project and set NEXT_PUBLIC_SUPABASE_URL.',
      );
      return;
    }
    const redirect =
      (typeof window !== 'undefined' ? window.location.origin : '') + '/auth/callback';
    void client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirect },
    });
  };

  const magicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg(null);
    startTransition(async () => {
      const client = getBrowserClient();
      if (!client) {
        setStatus('error');
        setErrorMsg(
          'Auth is not wired yet. Provision a Supabase project and set NEXT_PUBLIC_SUPABASE_URL.',
        );
        return;
      }
      const redirect =
        (typeof window !== 'undefined' ? window.location.origin : '') + '/auth/callback';
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirect,
          shouldCreateUser: mode === 'sign-up',
        },
      });
      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
        return;
      }
      setStatus('sent');
    });
  };

  const isSignUp = mode === 'sign-up';

  return (
    <div className="border border-hairline-bright bg-bg-elev p-9 shadow-card">
      <div className="mb-8">
        <span className="mb-3 inline-block font-mono text-[11px] uppercase tracking-caps text-gold">
          {isSignUp ? 'create workspace' : 'open workspace'}
        </span>
        <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-heading">
          {isSignUp ? 'Make a NovaBash account' : 'Sign in to NovaBash'}
        </h1>
        <p className="mt-2 text-[14px] leading-[1.55] text-fg-mid">
          {isSignUp
            ? 'GitHub is the fastest. Google is fine. Email also works if you prefer a magic link.'
            : 'Same way you signed up. We do not support passwords.'}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => oauth('github')}
          className="flex items-center justify-center gap-3 border border-hairline-bright bg-bg-elev-2 py-3 text-[14px] font-semibold text-fg transition-colors duration-150 ease-nb hover:border-gold hover:bg-gold-fade hover:text-gold"
        >
          <GitHubGlyph />
          Continue with GitHub
        </button>
        <button
          type="button"
          onClick={() => oauth('google')}
          className="flex items-center justify-center gap-3 border border-hairline bg-transparent py-3 text-[14px] font-medium text-fg-mid transition-colors duration-150 ease-nb hover:border-hairline-bright hover:text-fg"
        >
          <GoogleGlyph />
          Continue with Google
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-caps text-fg-dim">
        <span className="h-px flex-1 bg-hairline" />
        or magic link
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form onSubmit={magicLink} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@somewhere.dev"
          disabled={status === 'sending' || status === 'sent'}
          className="border border-hairline-bright bg-bg-elev-2 px-4 py-3 font-mono text-[13px] text-fg placeholder:text-fg-dim focus:border-gold focus:outline-none"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === 'sending' || status === 'sent'}
          className="bg-gold py-3 text-[14px] font-semibold text-bg transition-colors duration-150 ease-nb hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'sending'
            ? 'Sending'
            : status === 'sent'
              ? 'Check your inbox'
              : 'Send magic link'}
        </button>
      </form>

      {errorMsg && (
        <p className="mt-4 flex items-start gap-2 font-mono text-[11px] text-ember">
          <Icon name="error" size={14} className="mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </p>
      )}

      {status === 'sent' && (
        <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-mint">
          <Icon name="ok" size={14} />A link is on its way to {email}. It expires in ten minutes.
        </p>
      )}

      <p className="mt-8 text-center text-[12px] text-fg-dim">
        {isSignUp ? (
          <>
            Already have a workspace?{' '}
            <a href="/sign-in" className="text-gold hover:underline">
              Sign in
            </a>
          </>
        ) : (
          <>
            New here?{' '}
            <a href="/sign-up" className="text-gold hover:underline">
              Make a workspace
            </a>
          </>
        )}
      </p>
    </div>
  );
}

function GitHubGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.34c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.83 1.27.83 2.15 0 3.07-1.87 3.74-3.65 3.94.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#FAFAFA"
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.26H12v4.28h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.23c1.9-1.74 2.97-4.31 2.97-7.55z"
      />
      <path
        fill="#A0A0A0"
        d="M12 22c2.7 0 4.96-.9 6.6-2.42l-3.22-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.75-5.59-4.1H3.08v2.58A10 10 0 0 0 12 22z"
      />
      <path
        fill="#606060"
        d="M6.41 13.93a6 6 0 0 1 0-3.86V7.49H3.08a10 10 0 0 0 0 9.02l3.33-2.58z"
      />
      <path
        fill="#FAFAFA"
        d="M12 5.96c1.47 0 2.78.5 3.82 1.5L18.7 4.6A10 10 0 0 0 3.08 7.49l3.33 2.58C7.2 7.7 9.4 5.96 12 5.96z"
      />
    </svg>
  );
}
