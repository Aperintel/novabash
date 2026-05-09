/**
 * Rate-limit store factory.
 *
 * Returns a store config consumed by @fastify/rate-limit. When
 * UPSTASH_REDIS_REST_URL is present, a fetch-based Upstash backed counter
 * keeps state across multiple Railway instances. When absent, the plugin
 * falls back to its built-in in-memory store, which is fine for a single
 * Railway instance and for local dev.
 *
 * The Upstash Redis REST API supports atomic INCR with a per-key
 * expiration via the pipeline endpoint, which we use to keep the round-trip
 * count to one per request.
 */

import type { RateLimitPluginOptions } from '@fastify/rate-limit';

interface UpstashStoreOptions {
  url: string;
  token: string;
}

class UpstashStore {
  private url: string;
  private token: string;

  constructor(opts: UpstashStoreOptions) {
    this.url = opts.url.replace(/\/+$/, '');
    this.token = opts.token;
  }

  async incr(
    key: string,
  ): Promise<{ current: number; ttl: number }> {
    // Pipeline: INCR <key>; EXPIRE <key> <window-seconds> NX
    const body = JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, '60', 'NX'],
      ['TTL', key],
    ]);
    const res = await fetch(`${this.url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body,
    });
    if (!res.ok) {
      throw new Error(`Upstash pipeline returned ${res.status}`);
    }
    const data = (await res.json()) as Array<{ result?: number | string }>;
    const current = Number(data[0]?.result ?? 0);
    const ttl = Number(data[2]?.result ?? 60);
    return { current, ttl };
  }
}

export interface PluggableStoreCtor {
  new (...args: unknown[]): unknown;
}

export function buildRateLimitOptions(): RateLimitPluginOptions {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  const baseOptions: RateLimitPluginOptions = {
    max: Number(process.env.RATE_LIMIT_MAX ?? 200),
    timeWindow: process.env.RATE_LIMIT_WINDOW ?? '1 minute',
    addHeadersOnExceeding: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
  };

  if (!url || !token) {
    return baseOptions;
  }

  // Upstash-backed store. @fastify/rate-limit accepts a store via the
  // `redis` option; rather than ship the @upstash/redis client, we wire a
  // minimal incr-once REST call. Plugin will retry locally if Upstash fails.
  const store = new UpstashStore({ url, token });

  return {
    ...baseOptions,
    keyGenerator: (req) =>
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      (req.socket.remoteAddress ?? 'anon'),
    nameSpace: 'novabash:rl:',
    skipOnError: true,
    onExceeding: () => {
      /* noop, headers do the rest */
    },
    redis: undefined,
    enableDraftSpec: false,
    // Custom store hook: we ask Upstash for the count, plugin enforces.
    // Falls back transparently if Upstash returns an error.
    store: function NbUpstashStore(this: { _windowMs: number }) {
      const self = this;
      return {
        incr(key: string, cb: (err: Error | null, result: { current: number; ttl: number }) => void) {
          store
            .incr(key)
            .then((r) => cb(null, r))
            .catch((err: Error) => cb(err, { current: 0, ttl: self._windowMs / 1000 }));
        },
        child() {
          return this;
        },
      };
    } as unknown as RateLimitPluginOptions['store'],
  };
}
