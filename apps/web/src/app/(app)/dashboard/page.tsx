'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { bundles } from '@/lib/bundles';
import { useVault, type VaultField } from '@/lib/vault';

function parseFields(text: string): VaultField[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.includes('='))
    .map((line) => {
      const idx = line.indexOf('=');
      return { key: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    });
}

function fieldsToText(fields: VaultField[]): string {
  return fields.map((f) => `${f.key}=${f.value}`).join('\n');
}

const panel = 'border border-hairline bg-bg-elev-1 p-5';
const heading = 'font-mono text-[11px] uppercase tracking-caps text-fg-dim';
const btn =
  'border border-hairline-bright px-3 py-1.5 font-mono text-[11px] text-fg-mid transition-colors hover:border-gold hover:text-gold';
const btnPrimary = 'bg-gold px-3 py-1.5 font-mono text-[11px] font-semibold text-bg hover:bg-gold-bright';

export default function DashboardPage() {
  const { data, addService, updateService, deleteService, applyBundle, exportEnv, exportVault, verifyAudit } =
    useVault();
  const [newName, setNewName] = useState('');
  const [newFields, setNewFields] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [audit, setAudit] = useState<{ ok: boolean; brokenAt?: number } | null>(null);

  if (!data) return null;

  const lastExportIdx = data.audit.map((e) => e.action).lastIndexOf('vault.export');
  const mutationActions = ['service.add', 'service.update', 'service.delete', 'bundle.apply'];
  const changedSinceBackup = data.audit
    .slice(lastExportIdx + 1)
    .some((e) => mutationActions.includes(e.action));
  const needsBackup = data.services.length > 0 && (lastExportIdx === -1 || changedSinceBackup);

  return (
    <div className="mx-auto max-w-[1100px] px-7 py-10">
      {needsBackup ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-gold/40 bg-gold/5 px-4 py-3">
          <p className="text-[13px] text-fg-mid">
            Back up your vault. It lives only on this device, so clearing site data would erase it.
            An encrypted export restores it anywhere with your passphrase.
          </p>
          <button type="button" className={btnPrimary} onClick={() => exportVault()}>
            Export vault
          </button>
        </div>
      ) : null}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-heading text-fg">Your vault</h1>
          <p className="mt-1 text-[13px] text-fg-dim">
            {data.services.length} service{data.services.length === 1 ? '' : 's'}, encrypted on this device.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnPrimary} onClick={() => exportEnv()}>
            Generate .env
          </button>
          <button type="button" className={btn} onClick={() => exportVault()}>
            Export vault
          </button>
        </div>
      </div>

      <section className={`${panel} mb-6`}>
        <h2 className={heading}>Add a service</h2>
        <div className="mt-3 grid gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Service name (e.g. Stripe)"
            className="w-full border border-hairline-bright bg-bg-elev-2 px-3 py-2 font-mono text-[13px] text-fg outline-none focus:border-gold"
          />
          <textarea
            value={newFields}
            onChange={(e) => setNewFields(e.target.value)}
            placeholder={'KEY=value, one per line\nSTRIPE_SECRET_KEY=sk_live_...'}
            rows={3}
            className="w-full resize-y border border-hairline-bright bg-bg-elev-2 px-3 py-2 font-mono text-[12px] text-fg outline-none focus:border-gold"
          />
          <div>
            <button
              type="button"
              disabled={newName.trim().length === 0}
              className={`${btnPrimary} disabled:opacity-40`}
              onClick={async () => {
                await addService(newName.trim(), parseFields(newFields));
                setNewName('');
                setNewFields('');
              }}
            >
              Add service
            </button>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className={`${heading} mb-3`}>Apply a stack bundle</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {bundles.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => applyBundle(b)}
              className="flex items-start gap-2.5 border border-hairline bg-bg-elev-1 p-3 text-left transition-colors hover:border-gold"
            >
              <span className="mt-0.5 text-gold">
                <Icon name={b.icon} size={16} />
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-fg">{b.name}</span>
                <span className="block text-[11px] text-fg-dim">{b.services.length} services</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 grid gap-3">
        <h2 className={heading}>Services</h2>
        {data.services.length === 0 ? (
          <p className="border border-dashed border-hairline-bright p-6 text-center text-[13px] text-fg-dim">
            No services yet. Add one above, or apply a bundle.
          </p>
        ) : (
          data.services.map((s) => (
            <div key={s.id} className={panel}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-fg">{s.name}</span>
                  <span className="font-mono text-[11px] text-fg-dim">
                    {s.fields.length} key{s.fields.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={btn}
                    onClick={() => {
                      setEditId(editId === s.id ? null : s.id);
                      setEditText(fieldsToText(s.fields));
                    }}
                  >
                    {editId === s.id ? 'Close' : 'Edit'}
                  </button>
                  <button type="button" className={btn} onClick={() => deleteService(s.id)}>
                    Delete
                  </button>
                </div>
              </div>

              {editId === s.id ? (
                <div className="mt-3 grid gap-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={Math.max(3, s.fields.length + 1)}
                    className="w-full resize-y border border-hairline-bright bg-bg-elev-2 px-3 py-2 font-mono text-[12px] text-fg outline-none focus:border-gold"
                  />
                  <div>
                    <button
                      type="button"
                      className={btnPrimary}
                      onClick={async () => {
                        await updateService(s.id, {
                          fields: parseFields(editText),
                          rotatedAt: new Date().toISOString(),
                        });
                        setEditId(null);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="mt-3 grid gap-1">
                  {s.fields.map((f) => (
                    <li key={f.key} className="flex justify-between font-mono text-[12px]">
                      <span className="text-fg-mid">{f.key}</span>
                      <span className="text-fg-dim">{f.value ? '••••••••' : 'empty'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </section>

      <section className={panel}>
        <div className="flex items-center justify-between">
          <h2 className={heading}>Audit log</h2>
          <button type="button" className={btn} onClick={async () => setAudit(await verifyAudit())}>
            Verify chain
          </button>
        </div>
        {audit ? (
          <p className={`mt-2 text-[12px] ${audit.ok ? 'text-mint' : 'text-rose'}`}>
            {audit.ok ? 'Chain verified, no tampering detected.' : `Chain broken at entry ${audit.brokenAt}.`}
          </p>
        ) : null}
        <ul className="mt-3 grid gap-1">
          {[...data.audit]
            .reverse()
            .slice(0, 12)
            .map((e) => (
              <li key={e.hash} className="flex justify-between gap-4 font-mono text-[11px] text-fg-dim">
                <span className="text-fg-mid">{e.action}</span>
                <span className="truncate">{e.target ?? ''}</span>
                <span className="shrink-0">{e.ts.slice(0, 19).replace('T', ' ')}</span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
