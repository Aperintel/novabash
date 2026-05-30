'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { InstallButton } from '@/components/InstallButton';
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
  const [pass, setPass] = useState('');
  const [file, setFile] = useState<File | null>(null);
  return (
    <details className="mt-6 border-t border-hairline pt-4 text-[13px]">
      <summary className="cursor-pointer text-fg-mid hover:text-fg">Import an exported vault file</summary>
      <div className="mt-3 grid gap-2">
        <input
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
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
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
        Pick a passphrase. It encrypts everything on this device, and we never see
        it. Next you will get a 24-word recovery phrase, your only other way in if
        you forget this. Choose something you will remember.
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
  const { unlock, recoverWithMnemonic, error } = useVault();
  const [pass, setPass] = useState('');
  const [phrase, setPhrase] = useState('');
  const [mode, setMode] = useState<'pass' | 'recover'>('pass');

  if (mode === 'recover') {
    return (
      <Shell title="Recover with your phrase">
        <p className="mt-2 text-[13px] leading-relaxed text-fg-dim">
          Enter the 24-word recovery phrase you saved when you created the vault.
          Once you are in, set a new passphrase.
        </p>
        <form
          className="mt-4 grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            recoverWithMnemonic(phrase);
          }}
        >
          <textarea
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="word1 word2 word3 ... word24"
            rows={4}
            className="w-full resize-y border border-hairline-bright bg-bg-elev-2 px-3 py-2 font-mono text-[13px] text-fg outline-none focus:border-gold"
          />
          <button type="submit" disabled={phrase.trim().length === 0} className="bg-gold px-3 py-2 text-[13px] font-semibold text-bg disabled:opacity-40">
            Recover vault
          </button>
          {error ? <p className="text-[12px] text-rose">{error}</p> : null}
          <button type="button" onClick={() => setMode('pass')} className="mt-1 text-left text-[12px] text-fg-mid hover:text-fg">
            Back to passphrase
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell title="Unlock your vault">
      <p className="mt-2 text-[13px] leading-relaxed text-fg-dim">
        Your passphrase decrypts the vault sitting on this device. The same one you
        set it up with.
      </p>
      <form
        className="mt-4 grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          unlock(pass);
        }}
      >
        <Field type="password" placeholder="Passphrase" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus />
        <button type="submit" disabled={pass.length === 0} className="bg-gold px-3 py-2 text-[13px] font-semibold text-bg disabled:opacity-40">
          Unlock
        </button>
        {error ? <p className="text-[12px] text-rose">{error}</p> : null}
        <button type="button" onClick={() => setMode('recover')} className="mt-1 text-left text-[12px] text-fg-mid hover:text-fg">
          Forgot your passphrase? Use your recovery phrase
        </button>
      </form>
      <ImportControl />
    </Shell>
  );
}

function RecoveryReveal({ mnemonic, onDone }: { mnemonic: string; onDone: () => void }) {
  const [saved, setSaved] = useState(false);
  const words = mnemonic.split(/\s+/);

  const download = () => {
    const blob = new Blob([`NovaBash recovery phrase\n\n${mnemonic}\n\nKeep this safe and private. It is the only other way into your vault.\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novabash-recovery-phrase.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center gap-2.5 text-fg">
          <span className="text-gold">
            <Logo size={24} />
          </span>
          <span className="text-[20px] font-extrabold tracking-heading">NovaBash</span>
        </div>
        <h1 className="text-[18px] font-bold text-fg">Your recovery phrase</h1>

        <div className="mt-4 border border-rose/50 bg-rose/5 px-4 py-4 text-[13px] leading-relaxed text-fg-mid">
          <p className="font-semibold text-rose">Save these 24 words now. This screen does not come back.</p>
          <p className="mt-2">
            They are the only other way into your vault. We cannot reset your
            passphrase or recover your vault for you, because nothing about it ever
            reaches us. If you lose both your passphrase and this phrase, the vault is
            gone for good. No exceptions, and no support ticket can bring it back.
          </p>
          <p className="mt-2">
            Write them down, or store them in a password manager, kept separately
            from this device.
          </p>
        </div>

        <ol className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 border border-hairline bg-bg-elev-1 p-5 font-mono text-[13px] sm:grid-cols-3">
          {words.map((w, i) => (
            <li key={`${i}-${w}`} className="flex gap-2">
              <span className="w-5 text-right text-fg-fade">{i + 1}</span>
              <span className="text-fg">{w}</span>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={download} className="border border-hairline-bright px-3 py-1.5 font-mono text-[11px] text-fg-mid hover:border-gold hover:text-gold">
            Download as a file
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(mnemonic)}
            className="border border-hairline-bright px-3 py-1.5 font-mono text-[11px] text-fg-mid hover:border-gold hover:text-gold"
          >
            Copy
          </button>
        </div>

        <label className="mt-5 flex items-start gap-2 text-[13px] text-fg-mid">
          <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-1" />
          <span>I have saved my recovery phrase somewhere safe and separate from this device.</span>
        </label>

        <button
          type="button"
          disabled={!saved}
          onClick={onDone}
          className="mt-4 bg-gold px-5 py-2.5 text-[14px] font-semibold text-bg disabled:opacity-40"
        >
          Continue to my vault
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { status, lock, recoveryReveal, dismissRecoveryReveal } = useVault();

  if (recoveryReveal) {
    return <RecoveryReveal mnemonic={recoveryReveal} onDone={dismissRecoveryReveal} />;
  }
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-fg-dim">Opening vault...</div>
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
        <div className="flex items-center gap-2">
          <InstallButton />
          <button
            type="button"
            onClick={lock}
            className="border border-hairline-bright px-2.5 py-1.5 font-mono text-[11px] text-fg-mid transition-colors hover:border-gold hover:text-gold"
          >
            Lock
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
