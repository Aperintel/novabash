import 'server-only';
/**
 * PostHog analytics shim.
 *
 * Server-side capture for the activation event ("first .env downloaded")
 * and a small set of other product-funnel events. The client is opt-in
 * via POSTHOG_PROJECT_API_KEY; without it, every call is a no-op so the
 * api still runs cleanly in local dev and CI.
 *
 * No personal data is captured. Distinct ID is the workspace ID, never
 * the email or the OAuth profile data. Properties carry only counts,
 * variant names, and audit-style metadata.
 */

interface CaptureInput {
  workspaceId: string;
  event: string;
  properties?: Record<string, string | number | boolean | null>;
  timestamp?: Date;
}

const HOST = process.env.POSTHOG_HOST ?? 'https://eu.i.posthog.com';

function isEnabled(): boolean {
  return Boolean(process.env.POSTHOG_PROJECT_API_KEY);
}

export async function capture(input: CaptureInput): Promise<void> {
  if (!isEnabled()) return;
  const apiKey = process.env.POSTHOG_PROJECT_API_KEY!;
  const body = {
    api_key: apiKey,
    event: input.event,
    distinct_id: input.workspaceId,
    properties: {
      $lib: 'novabash-api',
      ...(input.properties ?? {}),
    },
    timestamp: (input.timestamp ?? new Date()).toISOString(),
  };
  try {
    await fetch(`${HOST}/i/v0/e/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Capture is best-effort. Failures must not break the user-facing
    // request, so we swallow.
  }
}

export const Events = {
  WorkspaceCreated: 'workspace_created',
  KeyValidated: 'key_validated',
  EnvDownloadedFirst: 'env_downloaded_first',
  EnvDownloaded: 'env_downloaded',
  CredentialRotated: 'credential_rotated',
  WorkspaceKeyIssued: 'workspace_key_issued',
} as const;
