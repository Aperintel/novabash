'use client';

// The vault React context. Holds the unlocked data key and envelope in memory
// for the session and exposes every operation the UI needs. All work is local.

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
  makeRecovery,
  newEnvelope,
  newVault,
  openLegacy,
  openWithPassphrase,
  openWithRecovery,
  randomId,
  rewrapPassphrase,
  sealVault,
  type Envelope,
} from './crypto';
import { appendAudit, verifyChain, withTouch, type ChainResult } from './audit';
import { clearVault, hasVault, loadEncrypted, saveEncrypted } from './store';
import { downloadEnv, generateEnv } from './env';
import {
  DEFAULT_ENVIRONMENTS,
  emptyVault,
  type AuditAction,
  type EncryptedVault,
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
  hasRecovery: boolean;
  needsRecoverySetup: boolean;
  recoveredViaKey: boolean;
  recoveryReveal: string | null;
  createVault: (passphrase: string) => Promise<void>;
  unlock: (passphrase: string) => Promise<void>;
  recoverWithMnemonic: (mnemonic: string) => Promise<void>;
  changePassphrase: (newPassphrase: string) => Promise<void>;
  generateRecoveryKey: () => Promise<void>;
  dismissRecoveryReveal: () => void;
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

async function requestPersistence(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch {
    // Best-effort hint; carry on if unavailable.
  }
}

// A stored blob is the new envelope format when it carries passWrap.
function isEnvelope(blob: unknown): blob is EncryptedVault {
  return typeof blob === 'object' && blob !== null && 'passWrap' in blob;
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<VaultStatus>('loading');
  const [data, setData] = useState<VaultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsRecoverySetup, setNeedsRecoverySetup] = useState(false);
  const [recoveredViaKey, setRecoveredViaKey] = useState(false);
  const [recoveryReveal, setRecoveryReveal] = useState<string | null>(null);

  const dekKeyRef = useRef<CryptoKey | null>(null);
  const dekRawRef = useRef<Uint8Array | null>(null);
  const envelopeRef = useRef<Envelope | null>(null);

  useEffect(() => {
    hasVault()
      .then((exists) => setStatus(exists ? 'locked' : 'empty'))
      .catch(() => setStatus('empty'));
  }, []);

  const persist = useCallback(async (next: VaultData) => {
    if (!dekKeyRef.current || !envelopeRef.current) throw new Error('Vault is locked.');
    const touched = withTouch(next);
    const blob = await sealVault(touched, dekKeyRef.current, envelopeRef.current);
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
      const { keys, envelope, mnemonic } = await newVault(passphrase);
      dekKeyRef.current = keys.dekKey;
      dekRawRef.current = keys.dekRaw;
      envelopeRef.current = envelope;
      const fresh = emptyVault();
      const audit = await appendAudit(fresh.audit, 'vault.create');
      await persist({ ...fresh, audit });
      setNeedsRecoverySetup(false);
      setStatus('unlocked');
      setRecoveryReveal(mnemonic);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the vault.');
    }
  }, [persist]);

  const adoptUnlocked = useCallback(
    async (blob: EncryptedVault | null, passphrase: string) => {
      if (!blob) {
        setStatus('empty');
        return;
      }
      if (isEnvelope(blob)) {
        const { data: d, keys, envelope } = await openWithPassphrase(blob, passphrase);
        dekKeyRef.current = keys.dekKey;
        dekRawRef.current = keys.dekRaw;
        envelopeRef.current = envelope;
        const migrated =
          !d.environments || d.environments.length === 0
            ? { ...d, environments: [...DEFAULT_ENVIRONMENTS] }
            : d;
        const audit = await appendAudit(migrated.audit, 'vault.unlock');
        await persist({ ...migrated, audit });
        setNeedsRecoverySetup(!blob.recoveryWrap);
        setStatus('unlocked');
        return;
      }
      // Legacy v1 vault: read it, then re-seal under the envelope format.
      const legacy = await openLegacy(blob as never, passphrase);
      const { keys, envelope } = await newEnvelope(passphrase);
      dekKeyRef.current = keys.dekKey;
      dekRawRef.current = keys.dekRaw;
      envelopeRef.current = envelope;
      const fixed =
        !legacy.environments || legacy.environments.length === 0
          ? { ...legacy, environments: [...DEFAULT_ENVIRONMENTS] }
          : legacy;
      const audit = await appendAudit(fixed.audit, 'vault.unlock', undefined, 'migrated to v2');
      await persist({ ...fixed, audit });
      setNeedsRecoverySetup(true);
      setStatus('unlocked');
    },
    [persist],
  );

  const unlock = useCallback(
    async (passphrase: string) => {
      setError(null);
      try {
        await requestPersistence();
        await adoptUnlocked(await loadEncrypted(), passphrase);
      } catch {
        setError('Wrong passphrase, or the vault could not be read.');
      }
    },
    [adoptUnlocked],
  );

  const recoverWithMnemonic = useCallback(async (mnemonic: string) => {
    setError(null);
    try {
      await requestPersistence();
      const blob = await loadEncrypted();
      if (!blob || !isEnvelope(blob)) {
        setError('This vault has no recovery phrase set.');
        return;
      }
      const { data: d, keys, envelope } = await openWithRecovery(blob, mnemonic);
      dekKeyRef.current = keys.dekKey;
      dekRawRef.current = keys.dekRaw;
      envelopeRef.current = envelope;
      const audit = await appendAudit(d.audit, 'vault.unlock', undefined, 'via recovery phrase');
      await persist({ ...d, audit });
      setRecoveredViaKey(true);
      setStatus('unlocked');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not recover with that phrase.');
    }
  }, [persist]);

  const changePassphrase = useCallback(async (newPassphrase: string) => {
    if (!dekRawRef.current || !envelopeRef.current) return;
    const { kdf, passWrap } = await rewrapPassphrase(dekRawRef.current, newPassphrase);
    envelopeRef.current = { ...envelopeRef.current, kdf, passWrap };
    await mutate((d) => d, 'vault.passphrase');
    setRecoveredViaKey(false);
  }, [mutate]);

  const generateRecoveryKey = useCallback(async () => {
    if (!dekRawRef.current || !envelopeRef.current) return;
    const { recoveryWrap, mnemonic } = await makeRecovery(dekRawRef.current);
    envelopeRef.current = { ...envelopeRef.current, recoveryWrap };
    await mutate((d) => d, 'vault.recovery');
    setNeedsRecoverySetup(false);
    setRecoveryReveal(mnemonic);
  }, [mutate]);

  const dismissRecoveryReveal = useCallback(() => setRecoveryReveal(null), []);

  const lock = useCallback(() => {
    dekKeyRef.current = null;
    dekRawRef.current = null;
    envelopeRef.current = null;
    setData(null);
    setRecoveredViaKey(false);
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
        (d) => ({ ...d, services: d.services.map((s) => (s.id === id ? { ...s, ...patch } : s)) }),
        'service.update',
        id,
      ),
    [mutate],
  );

  const deleteService = useCallback(
    (id: string) =>
      mutate((d) => ({ ...d, services: d.services.filter((s) => s.id !== id) }), 'service.delete', id),
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
    const file = new Blob([JSON.stringify(blob, null, 2)], { type: 'application/json' });
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
      await saveEncrypted(blob);
      await adoptUnlocked(blob, passphrase);
    } catch {
      setError('Could not import that file with this passphrase.');
    }
  }, [adoptUnlocked]);

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
      hasRecovery: Boolean(envelopeRef.current?.recoveryWrap),
      needsRecoverySetup,
      recoveredViaKey,
      recoveryReveal,
      createVault,
      unlock,
      recoverWithMnemonic,
      changePassphrase,
      generateRecoveryKey,
      dismissRecoveryReveal,
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
      needsRecoverySetup,
      recoveredViaKey,
      recoveryReveal,
      createVault,
      unlock,
      recoverWithMnemonic,
      changePassphrase,
      generateRecoveryKey,
      dismissRecoveryReveal,
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
