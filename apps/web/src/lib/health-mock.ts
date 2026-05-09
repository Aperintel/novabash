import type { KeyHealthRecord } from '@/components/KeyHealthRow';

/**
 * Mock Key Health records matching the shape of /v1/vault/health response.
 * Will be replaced with a server fetch once the api is reachable.
 */

export const mockHealthRecords: KeyHealthRecord[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    serviceId: 'supabase',
    fieldId: 'service',
    envName: 'SUPABASE_SERVICE_ROLE_KEY',
    environment: 'development',
    health: {
      overall: 'green',
      dominant: 'age',
      recommend: 'none',
      signals: {
        age: { status: 'green', detail: '14 days old' },
        validity: { status: 'green', detail: 'valid (last check 2m ago)' },
        scope: { status: 'green', detail: 'scope matches required' },
        exposure: { status: 'green', detail: 'no exposure events recorded' },
      },
    },
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    serviceId: 'openrouter',
    fieldId: 'apiKey',
    envName: 'OPENROUTER_API_KEY',
    environment: 'production',
    health: {
      overall: 'red',
      dominant: 'age',
      recommend: 'rotate',
      signals: {
        age: {
          status: 'red',
          detail: '94 days old (past rotation point at 60d)',
        },
        validity: { status: 'green', detail: 'valid (last check 4m ago)' },
        scope: { status: 'green', detail: 'scope matches required' },
        exposure: { status: 'green', detail: 'no exposure events recorded' },
      },
    },
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    serviceId: 'vercel',
    fieldId: 'token',
    envName: 'VERCEL_TOKEN',
    environment: 'production',
    health: {
      overall: 'amber',
      dominant: 'scope',
      recommend: 'inspect',
      signals: {
        age: { status: 'green', detail: '21 days old' },
        validity: { status: 'green', detail: 'valid (last check 6m ago)' },
        scope: {
          status: 'amber',
          detail: 'key has more scope than required',
        },
        exposure: { status: 'green', detail: 'no exposure events recorded' },
      },
    },
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    serviceId: 'resend',
    fieldId: 'apiKey',
    envName: 'RESEND_API_KEY',
    environment: 'production',
    health: {
      overall: 'green',
      dominant: 'age',
      recommend: 'none',
      signals: {
        age: { status: 'green', detail: '35 days old' },
        validity: { status: 'green', detail: 'valid (last check 9m ago)' },
        scope: { status: 'green', detail: 'scope matches required' },
        exposure: { status: 'green', detail: 'no exposure events recorded' },
      },
    },
  },
];
