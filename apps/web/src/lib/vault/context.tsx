'use client';

// The vault React context. Holds the unlocked vault data and the derived key in
// memory for the session, and exposes every operation the UI needs. All work is
// local; nothing leaves the device.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  decryptVault,
  encryptVault,
  keyFromKdf,
  newKey,
  randomId,
} from './crypto';
import { appendAudit, verifyChain, withTouch, type ChainResult } from './audit';
import { clearVault, hasVault, loadEncrypted, saveEncrypted } from './store';
import { downloadEnv, generateEnv } from './env';
import {
  DEFAULT_ENVIRONMENTS,
  emptyVault,
  type AuditAction,
  type KdfParams,
  type VaultData,
  type VaultField,
  type VaultService,
} from './types';

export type VaultStatus = 'loading' | 'empty' | 'locked' | 'unlocked';

interface BundleLike {
  id: string;
  name: string;
  services: { id: string; name: string }[];
}

interface VaultContextValue {
  status: VaultStatus;
  data: VaultData | null;
  error: string | null;
  createVault: (passphrase: string) => Promise<void>;
  unlock: (passphrase: string) => Promise<void>;
  lock: () => void;
  addService: (name: string, fields?: VaultField[], bundleId?: string) => Promise<void>;
  updateService: (id: string, patch: Partial<Omit<VaultService, 'id'>>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  applyBundle: (bundle: BundleLike) => Promise<void>;
  exportEnv: (environment: string, selectedIds?: string[]) => Promise<void>;
  addEnvironment: (name: string) => Promise<void>;
  removeEnvironment: (name: string) => Promise<void>;
  exportVault: () => Promise<void>;
  importVault: (file: File, passphrase: string) => Promise<void>;
  verifyAudit: () => Promise<ChainResult>;
  destroy: () => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

// Ask the browser to keep the vault's storage rather than evicting it under
// storage pressure. Best-effort; ignored where unsupported.
async function requestPersistence(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch {
    // Persistence is a best-effort hint; carry on if it is unavailable.
  }
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<VaultStatus>('loading');
  const [data, setData] = useState<VaultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef<CryptoKey | null>(null);
  const kdfRef = useRef<KdfParams | null>(null);

  useEffect(() => {
    hasVault()
      .then((exists) => setStatus(exists ? 'locked' : 'empty'))
      .catch(() => setStatus('empty'));
  }, []);

  const persist = useCallback(async (next: VaultData) => {
    if (!keyRef.current || !kdfRef.current) throw new Error('Vault is locked.');
    const touched = withTouch(next);
    const blob = await encryptVault(touched, keyRef.current, kdfRef.current);
    await saveEncrypted(blob);
    setData(touched);
  }, []);

  const mutate = useCallback(
    async (
      change: (d: VaultData) => VaultData,
      action: AuditAction,
      target?: string,
      detail?: string,
    ) => {
      if (!data) throw new Error('Vault is locked.');
      const changed = change(data);
      const audit = await appendAudit(changed.audit, action, target, detail);
      await persist({ ...changed, audit });
    },
    [data, persist],
  );

  const createVault = useCallback(async (passphrase: string) => {
    setError(null);
    try {
      await requestPersistence();
      const { key, kdf } = await newKey(passphrase);
      keyRef.current = key;
      kdfRef.current = kdf;
      const fresh = emptyVault();
      const audit = await appendAudit(fresh.audit, 'vault.create');
      const withAudit = { ...fresh, audit };
      const blob = await encryptVault(withTouch(withAudit), key, kdf);
      await saveEncrypted(blob);
      setData(withTouch(withAudit));
      setStatus('unlocked');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the vault.');
    }
  }, []);

  const unlock = useCallback(async (passphrase: string) => {
    setError(null);
    try {
      await requestPersistence();
      const blob = await loadEncrypted();
      if (!blob) {
        setStatus('empty');
        return;
      }
      const decrypted = await decryptVault(blob, passphrase);
      if (!decrypted.environments || decrypted.environments.length === 0) {
        decrypted.environments = [...DEFAULT_ENVIRONMENTS];
      }
      keyRef.current = await keyFromKdf(passphrase, blob.kdf);
      kdfRef.current = blob.kdf;
      const audit = await appendAudit(decrypted.audit, 'vault.unlock');
      await persist({ ...decrypted, audit });
      setStatus('unlocked');
    } catch {
      setError('Wrong passphrase, or the vault could not be read.');
    }
  }, [persist]);

  const lock = useCallback(() => {
    keyRef.current = null;
    kdfRef.current = null;
    setData(null);
    setStatus('locked');
  }, []);

  const addService = useCallback(
    (name: string, fields: VaultField[] = [], bundleId?: string) =>
      mutate(
        (d) => ({
          ...d,
          services: [
            ...d.services,
            { id: randomId(), name, fields, bundleId, createdAt: new Date().toISOString() },
          ],
        }),
        'service.add',
        name,
      ),
    [mutate],
  );

  const updateService = useCallback(
    (id: string, patch: Partial<Omit<VaultService, 'id'>>) =>
      mutate(
        (d) => ({
          ...d,
          services: d.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }),
        'service.update',
        id,
      ),
    [mutate],
  );

  const deleteService = useCallback(
    (id: string) =>
      mutate(
        (d) => ({ ...d, services: d.services.filter((s) => s.id !== id) }),
        'service.delete',
        id,
      ),
    [mutate],
  );

  const applyBundle = useCallback(
    (bundle: BundleLike) =>
      mutate(
        (d) => {
          const existing = new Set(d.services.map((s) => s.name));
          const additions: VaultService[] = bundle.services
            .filter((svc) => !existing.has(svc.name))
            .map((svc) => ({
              id: randomId(),
              name: svc.name,
              bundleId: bundle.id,
              fields: [],
              createdAt: new Date().toISOString(),
            }));
          return { ...d, services: [...d.services, ...additions] };
        },
        'bundle.apply',
        bundle.id,
      ),
    [mutate],
  );

  const exportEnv = useCallback(
    async (environment: string, selectedIds?: string[]) => {
      if (!data) return;
      downloadEnv(generateEnv(data.services, environment, selectedIds), `.env.${environment}`);
      await mutate((d) => d, 'env.generate', environment);
    },
    [data, mutate],
  );

  const addEnvironment = useCallback(
    (name: string) =>
      mutate(
        (d) => (d.environments.includes(name) ? d : { ...d, environments: [...d.environments, name] }),
        'env.add',
        name,
      ),
    [mutate],
  );

  const removeEnvironment = useCallback(
    (name: string) =>
      mutate(
        (d) => ({
          ...d,
          environments: d.environments.filter((e) => e !== name),
          services: d.services.map((s) => ({
            ...s,
            fields: s.fields.map((f) => {
              const rest: Record<string, string> = {};
              for (const [k, v] of Object.entries(f.values)) {
                if (k !== name) rest[k] = v;
              }
              return { ...f, values: rest };
            }),
          })),
        }),
        'env.remove',
        name,
      ),
    [mutate],
  );

  const exportVault = useCallback(async () => {
    const blob = await loadEncrypted();
    if (!blob) return;
    const json = JSON.stringify(blob, null, 2);
    const file = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novabash-vault.json';
    a.click();
    URL.revokeObjectURL(url);
    if (data) await mutate((d) => d, 'vault.export');
  }, [data, mutate]);

  const importVault = useCallback(async (file: File, passphrase: string) => {
    setError(null);
    try {
      const blob = JSON.parse(await file.text());
      const decrypted = await decryptVault(blob, passphrase);
      keyRef.current = await keyFromKdf(passphrase, blob.kdf);
      kdfRef.current = blob.kdf;
      await saveEncrypted(blob);
      const audit = await appendAudit(decrypted.audit, 'vault.import');
      await persist({ ...decrypted, audit });
      setStatus('unlocked');
    } catch {
      setError('Could not import that file with this passphrase.');
    }
  }, [persist]);

  const verifyAudit = useCallback(async () => {
    if (!data) return { ok: true };
    return verifyChain(data.audit);
  }, [data]);

  const destroy = useCallback(async () => {
    await clearVault();
    lock();
    setStatus('empty');
  }, [lock]);

  const value = useMemo<VaultContextValue>(
    () => ({
      status,
      data,
      error,
      createVault,
      unlock,
      lock,
      addService,
      updateService,
      deleteService,
      applyBundle,
      exportEnv,
      addEnvironment,
      removeEnvironment,
      exportVault,
      importVault,
      verifyAudit,
      destroy,
    }),
    [
      status,
      data,
      error,
      createVault,
      unlock,
      lock,
      addService,
      updateService,
      deleteService,
      applyBundle,
      exportEnv,
      addEnvironment,
      removeEnvironment,
      exportVault,
      importVault,
      verifyAudit,
      destroy,
    ],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used inside a VaultProvider.');
  return ctx;
}
