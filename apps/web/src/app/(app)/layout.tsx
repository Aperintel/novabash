'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useVault } from '@/lib/vault';

function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-hairline-bright bg-bg-elev-2 px-3 py-2 font-mono text-[13px] text-fg outline-none focus:border-gold"
    />
  );
}

function ImportControl() {
  const { importVault, error } = useVault();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pass, setPass] = useState('');
  const [file, setFile] = useState<File | null>(null);
  return (
    <details className="mt-6 border-t border-hairline pt-4 text-[13px]">
      <summary className="cursor-pointer text-fg-mid hover:text-fg">Import an exported vault file</summary>
      <div className="mt-3 grid gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-[12px] text-fg-dim"
        />
        <Field
          type="password"
          placeholder="Vault passphrase"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button
          type="button"
          disabled={!file || !pass}
          onClick={() => file && importVault(file, pass)}
          className="bg-fg-mid px-3 py-2 text-[13px] font-semibold text-bg disabled:opacity-40"
        >
          Import vault
        </button>
        {error ? <p className="text-[12px] text-rose">{error}</p> : null}
      </div>
    </details>
  );
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5 text-fg">
          <span className="text-gold">
            <Logo size={24} />
          </span>
          <span className="text-[20px] font-extrabold tracking-heading">NovaBash</span>
        </div>
        <h1 className="text-[16px] font-semibold text-fg">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function CreateVault() {
  const { createVault, error } = useVault();
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const mismatch = confirm.length > 0 && pass !== confirm;
  return (
    <Shell title="Create your vault">
      <p className="mt-2 text-[13px] leading-relaxed text-fg-dim">
        Choose a passphrase. It encrypts your vault on this device and is never
        stored or sent anywhere. If you lose it, the vault cannot be recovered.
      </p>
      <div className="mt-4 grid gap-2">
        <Field type="password" placeholder="Passphrase" value={pass} onChange={(e) => setPass(e.target.value)} />
        <Field
          type="password"
          placeholder="Confirm passphrase"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          type="button"
          disabled={pass.length < 8 || mismatch}
          onClick={() => createVault(pass)}
          className="bg-gold px-3 py-2 text-[13px] font-semibold text-bg disabled:opacity-40"
        >
          Create vault
        </button>
        {pass.length > 0 && pass.length < 8 ? (
          <p className="text-[12px] text-fg-dim">Use at least 8 characters.</p>
        ) : null}
        {mismatch ? <p className="text-[12px] text-rose">Passphrases do not match.</p> : null}
        {error ? <p className="text-[12px] text-rose">{error}</p> : null}
      </div>
      <ImportControl />
    </Shell>
  );
}

function UnlockVault() {
  const { unlock, error } = useVault();
  const [pass, setPass] = useState('');
  return (
    <Shell title="Unlock your vault">
      <p className="mt-2 text-[13px] leading-relaxed text-fg-dim">
        Enter your passphrase to decrypt the vault stored on this device.
      </p>
      <form
        className="mt-4 grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          unlock(pass);
        }}
      >
        <Field type="password" placeholder="Passphrase" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus />
        <button
          type="submit"
          disabled={pass.length === 0}
          className="bg-gold px-3 py-2 text-[13px] font-semibold text-bg disabled:opacity-40"
        >
          Unlock
        </button>
        {error ? <p className="text-[12px] text-rose">{error}</p> : null}
      </form>
      <ImportControl />
    </Shell>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { status, lock } = useVault();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-fg-dim">
        Opening vault...
      </div>
    );
  }
  if (status === 'empty') return <CreateVault />;
  if (status === 'locked') return <UnlockVault />;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-hairline bg-bg/85 px-7 backdrop-blur-md">
        <Link href="/dashboard" className="flex items-center gap-2.5 text-fg" aria-label="NovaBash home">
          <span className="text-gold">
            <Logo size={22} />
          </span>
          <span className="text-[18px] font-extrabold tracking-heading">NovaBash</span>
          <span className="ml-1 border border-hairline-bright px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-caps text-fg-dim">
            local vault
          </span>
        </Link>
        <button
          type="button"
          onClick={lock}
          className="border border-hairline-bright px-2.5 py-1.5 font-mono text-[11px] text-fg-mid transition-colors hover:border-gold hover:text-gold"
        >
          Lock
        </button>
      </header>
      <main>{children}</main>
    </div>
  );
}
