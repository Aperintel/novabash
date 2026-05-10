/**
 * Key Health calculator.
 *
 * Pure functions that grade four signals (age, validity, scope, exposure)
 * and combine them with the worst-signal-wins rule from build guide line
 * 626. Returns a structured result that the dashboard can render verbatim
 * via the transparency UI.
 */

import { ageBandFor } from './thresholds';

export type Status = 'green' | 'amber' | 'red';

export interface SignalResult {
  status: Status;
  detail: string;
  meta?: Record<string, string | number>;
}

export interface KeyHealth {
  overall: Status;
  dominant: 'age' | 'validity' | 'scope' | 'exposure';
  recommend: 'rotate' | 'inspect' | 'none';
  signals: {
    age: SignalResult;
    validity: SignalResult;
    scope: SignalResult;
    exposure: SignalResult;
  };
}

interface CredentialFacts {
  serviceId: string;
  fieldId: string;
  createdAt: Date;
  lastValidatedAt: Date | null;
  lastValidationOk: boolean | null;
  scopeActual?: string[]; // optional: what scope the vendor reports the key has
  scopeRequired?: string[]; // optional: what the bundle says the workspace needs
  exposureCount?: number; // phase B; default 0
}

const DAY_MS = 24 * 60 * 60 * 1000;

function ageDays(createdAt: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / DAY_MS));
}

function ageSignal(c: CredentialFacts, now: Date): SignalResult {
  const days = ageDays(c.createdAt, now);
  const band = ageBandFor(c.serviceId, c.fieldId);
  if (days < band.green) {
    return {
      status: 'green',
      detail: `${days} days old`,
      meta: { days, threshold: band.green },
    };
  }
  if (days < band.red) {
    return {
      status: 'amber',
      detail: `${days} days old (over ${band.green}d)`,
      meta: { days, threshold: band.amber },
    };
  }
  return {
    status: 'red',
    detail: `${days} days old (past rotation point at ${band.red}d)`,
    meta: { days, threshold: band.red },
  };
}

function validitySignal(c: CredentialFacts, now: Date): SignalResult {
  if (c.lastValidatedAt === null || c.lastValidationOk === null) {
    return {
      status: 'amber',
      detail: 'never validated',
    };
  }
  const minutesSince = Math.floor((now.getTime() - c.lastValidatedAt.getTime()) / 60000);
  if (!c.lastValidationOk) {
    return {
      status: 'red',
      detail: `vendor rejected this key (last check ${minutesSince}m ago)`,
      meta: { minutesSince },
    };
  }
  return {
    status: 'green',
    detail: `valid (last check ${minutesSince}m ago)`,
    meta: { minutesSince },
  };
}

function scopeSignal(c: CredentialFacts): SignalResult {
  const actual = c.scopeActual ?? [];
  const required = c.scopeRequired ?? [];
  if (actual.length === 0 && required.length === 0) {
    return { status: 'green', detail: 'scope not introspected' };
  }
  if (required.length === 0) {
    return { status: 'green', detail: 'no scope constraints' };
  }
  const intersect = required.filter((r) => actual.includes(r));
  if (intersect.length === 0) {
    return {
      status: 'red',
      detail: 'wrong key for this workspace',
      meta: { actual: actual.join(','), required: required.join(',') },
    };
  }
  if (intersect.length < required.length) {
    return {
      status: 'red',
      detail: 'key is missing required scope',
      meta: { missing: required.filter((r) => !actual.includes(r)).join(',') },
    };
  }
  if (actual.length > required.length) {
    return {
      status: 'amber',
      detail: 'key has more scope than required',
      meta: { extra: actual.filter((a) => !required.includes(a)).join(',') },
    };
  }
  return { status: 'green', detail: 'scope matches required' };
}

function exposureSignal(c: CredentialFacts): SignalResult {
  const n = c.exposureCount ?? 0;
  if (n === 0) {
    return { status: 'green', detail: 'no exposure events recorded' };
  }
  return {
    status: 'red',
    detail: `${n} exposure event${n === 1 ? '' : 's'} recorded`,
    meta: { events: n },
  };
}

const RANK: Record<Status, number> = { green: 0, amber: 1, red: 2 };

export function calculateKeyHealth(c: CredentialFacts, now: Date = new Date()): KeyHealth {
  const signals = {
    age: ageSignal(c, now),
    validity: validitySignal(c, now),
    scope: scopeSignal(c),
    exposure: exposureSignal(c),
  };

  let dominant: KeyHealth['dominant'] = 'age';
  let worst: Status = 'green';
  for (const k of ['age', 'validity', 'scope', 'exposure'] as const) {
    if (RANK[signals[k].status] > RANK[worst]) {
      worst = signals[k].status;
      dominant = k;
    }
  }

  const recommend: KeyHealth['recommend'] =
    worst === 'red' ? 'rotate' : worst === 'amber' ? 'inspect' : 'none';

  return {
    overall: worst,
    dominant,
    recommend,
    signals,
  };
}
